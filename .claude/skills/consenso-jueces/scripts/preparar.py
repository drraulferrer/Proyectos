#!/usr/bin/env python3
"""Prepara un estudio simulado: códigos ciegos, cuadernillos y prompts por juez.

Uso: python3 preparar.py <carpeta-del-estudio>
"""
import os
import random
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from comun import (PLANTILLAS, cargar_config, cargar_instrumento, error,  # noqa: E402
                   escribir_json, resolver_criterios)


def texto_perfil(perfil):
    if perfil.get("narrativa"):
        return perfil["narrativa"]
    partes = []
    if perfil.get("titulo"):
        partes.append(f"Eres {perfil['titulo'].lower()}.")
    if perfil.get("formacion"):
        partes.append(f"Formación: {perfil['formacion']}.")
    if perfil.get("experiencia_anios"):
        partes.append(f"Años de experiencia profesional: {perfil['experiencia_anios']}.")
    if perfil.get("ambito"):
        partes.append(f"Ámbito de trabajo: {perfil['ambito']}.")
    if perfil.get("enfoque"):
        partes.append(f"Enfoque teórico o metodológico: {perfil['enfoque']}.")
    if perfil.get("prioridades"):
        partes.append(f"Cuando revisas un instrumento te fijas sobre todo en: {perfil['prioridades']}.")
    return "\n".join(partes)


def rellenar(plantilla, valores):
    for k, v in valores.items():
        plantilla = plantilla.replace("{{" + k + "}}", v)
    return plantilla


def main():
    if len(sys.argv) != 2:
        error("Uso: preparar.py <carpeta-del-estudio>")
    d = os.path.abspath(sys.argv[1])
    cfg = cargar_config(d)
    if cfg["modo"] != "simulado":
        error("preparar.py solo se usa en modo 'simulado'")
    criterios, crit_dim = resolver_criterios(cfg)
    claves_activas = {c["clave"] for c in criterios}
    items, dims, trampas = cargar_instrumento(d, cfg)
    for t in trampas:
        if t.get("criterio_objetivo") not in claves_activas:
            error(f"La trampa {t['id']} apunta a '{t.get('criterio_objetivo')}', que no es un criterio activo")
    jueces = cfg.get("jueces", [])
    if len(jueces) < 3:
        error("Se necesitan al menos 3 jueces")
    ids_j = [j["id"] for j in jueces]
    if len(set(ids_j)) != len(ids_j):
        error("Hay identificadores de juez repetidos")

    semilla = int(cfg.get("semilla", 1))
    rng = random.Random(semilla)

    # Códigos ciegos compartidos por todos los jueces.
    todos = [{"id": i["id"], "tipo": "real", "dimension": i["dimension"], "texto": i["texto"],
              "sentido": i.get("sentido", "")} for i in items]
    todos += [{"id": t["id"], "tipo": "trampa", "dimension": t["dimension"], "texto": t["texto"],
               "sentido": "", "tipo_defecto": t.get("tipo", ""),
               "criterio_objetivo": t["criterio_objetivo"]} for t in trampas]
    rng.shuffle(todos)
    ancho = max(2, len(str(len(todos))))
    claves = {}
    for n, it in enumerate(todos, 1):
        claves[f"E{n:0{ancho}d}"] = it
    escribir_json(os.path.join(d, "privado", "claves.json"), claves)

    escribir_json(os.path.join(d, "privado", "criterios_resueltos.json"),
                  {"criterios_item": criterios, "criterio_dimension": crit_dim})

    dims_pub = [{"id": x["id"], "nombre": x.get("nombre", ""), "definicion": x.get("definicion", "")} for x in dims]
    comun_cuad = {
        "constructo": cfg.get("constructo", {}),
        "poblacion": cfg.get("poblacion", ""),
        "idioma": cfg.get("idioma", ""),
        "instrumento": cfg.get("instrumento", {}),
        "escala_valoracion": "Entero de 1 a 4 en cada criterio, según sus anclas",
        "dimensiones": dims_pub,
    }
    p_eval = open(os.path.join(PLANTILLAS, "prompt-juez.md"), encoding="utf-8").read()
    p_asig = open(os.path.join(PLANTILLAS, "prompt-asignacion.md"), encoding="utf-8").read()

    lanzamientos = []
    for idx, j in enumerate(jueces):
        jid = j["id"]
        r = random.Random(semilla * 1000 + idx + 1)
        orden = list(claves.keys())
        r.shuffle(orden)
        cuad = dict(comun_cuad)
        cuad["juez"] = jid
        cuad["criterios_item"] = criterios
        cuad["criterio_dimension"] = crit_dim
        cuad["items"] = []
        for cod in orden:
            it = claves[cod]
            e = {"id": cod, "dimension": it["dimension"], "texto": it["texto"]}
            if it.get("sentido"):
                e["sentido"] = it["sentido"]
            cuad["items"].append(e)
        ruta_cuad = os.path.join(d, "cuadernillos", f"{jid}-evaluacion.json")
        ruta_sal = os.path.join(d, "respuestas", f"{jid}.json")
        escribir_json(ruta_cuad, cuad)
        perfil = texto_perfil(j.get("perfil", {}))
        ruta_prompt = os.path.join(d, "jueces", f"{jid}-evaluacion.md")
        os.makedirs(os.path.dirname(ruta_prompt), exist_ok=True)
        with open(ruta_prompt, "w", encoding="utf-8") as f:
            f.write(rellenar(p_eval, {"PERFIL": perfil, "RUTA_CUADERNILLO": ruta_cuad,
                                      "RUTA_SALIDA": ruta_sal, "ID_JUEZ": jid}))
        lanzamientos.append((jid, "evaluacion", j.get("modelo", "sonnet"), ruta_prompt))

        if cfg.get("asignacion_ciega"):
            reales = [c for c in claves if claves[c]["tipo"] == "real"]
            r.shuffle(reales)
            cuad_a = {k: v for k, v in comun_cuad.items() if k != "instrumento"}
            cuad_a["juez"] = jid
            cuad_a["items"] = [{"id": c, "texto": claves[c]["texto"]} for c in reales]
            ruta_cuad_a = os.path.join(d, "cuadernillos", f"{jid}-asignacion.json")
            ruta_sal_a = os.path.join(d, "respuestas", f"{jid}-asignacion.json")
            escribir_json(ruta_cuad_a, cuad_a)
            ruta_prompt_a = os.path.join(d, "jueces", f"{jid}-asignacion.md")
            with open(ruta_prompt_a, "w", encoding="utf-8") as f:
                f.write(rellenar(p_asig, {"PERFIL": perfil, "RUTA_CUADERNILLO": ruta_cuad_a,
                                          "RUTA_SALIDA": ruta_sal_a, "ID_JUEZ": jid}))
            lanzamientos.append((jid, "asignacion", j.get("modelo", "sonnet"), ruta_prompt_a))

    os.makedirs(os.path.join(d, "respuestas"), exist_ok=True)
    print(f"Ítems reales: {len(items)} | trampas: {len(trampas)} | jueces: {len(jueces)}")
    print(f"Criterios por ítem: {', '.join(sorted(claves_activas))} | suficiencia: {'sí' if crit_dim else 'no'}"
          f" | asignación ciega: {'sí' if cfg.get('asignacion_ciega') else 'no'}")
    print("LANZAMIENTOS (juez | tarea | modelo | prompt):")
    for l in lanzamientos:
        print(" | ".join(l))


if __name__ == "__main__":
    main()
