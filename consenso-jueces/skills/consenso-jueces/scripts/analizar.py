#!/usr/bin/env python3
"""Valida las respuestas de los jueces y calcula los índices de validez de contenido.

Uso:
  python3 analizar.py <carpeta-del-estudio> --validar   solo comprueba las respuestas
  python3 analizar.py <carpeta-del-estudio>             valida y calcula

Índices:
  V de Aiken con intervalo de confianza por el método score (Penfield y Giacobbi, 2004)
  I-CVI, S-CVI/Ave y S-CVI/UA (Lynn, 1986; Polit y Beck, 2006)
  Kappa modificado k* (Polit, Beck y Owen, 2007)
"""
import os
import statistics
import sys
from math import comb, sqrt
from statistics import NormalDist

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from comun import (ESCALA_MAX, ESCALA_MIN, cargar_config, cargar_instrumento,  # noqa: E402
                   error, escribir_csv, escribir_json, leer_json, resolver_criterios)


# ---------- Índices ----------

def v_aiken(punt, nivel=0.95):
    n, k = len(punt), ESCALA_MAX - ESCALA_MIN
    v = sum(p - ESCALA_MIN for p in punt) / (n * k)
    z = NormalDist().inv_cdf(1 - (1 - nivel) / 2)
    nk = n * k
    raiz = z * sqrt(4 * nk * v * (1 - v) + z * z)
    den = 2 * (nk + z * z)
    return v, (2 * nk * v + z * z - raiz) / den, (2 * nk * v + z * z + raiz) / den


def icvi_kappa(punt):
    n = len(punt)
    a = sum(1 for p in punt if p >= 3)
    icvi = a / n
    pc = comb(n, a) * 0.5 ** n
    k = (icvi - pc) / (1 - pc) if pc < 1 else 0.0
    return icvi, pc, k


def interpretar_kappa(k):
    if k > 0.74:
        return "excelente"
    if k >= 0.60:
        return "bueno"
    if k >= 0.40:
        return "regular"
    return "pobre"


def umbral_icvi(n, cfg_min):
    # Lynn (1986): con 5 jueces o menos se exige acuerdo total.
    return 1.0 if n <= 5 else cfg_min


# ---------- Carga y validación ----------

def construir_claves(d, cfg, items):
    ruta = os.path.join(d, "privado", "claves.json")
    if cfg["modo"] == "simulado":
        if not os.path.exists(ruta):
            error("No existe privado/claves.json. Ejecuta antes preparar.py")
        return leer_json(ruta)
    return {i["id"]: {"id": i["id"], "tipo": "real", "dimension": i["dimension"], "texto": i["texto"]}
            for i in items}


def ids_jueces(d, cfg):
    if cfg.get("jueces"):
        return [j["id"] for j in cfg["jueces"]]
    carpeta = os.path.join(d, "respuestas")
    if not os.path.isdir(carpeta):
        return []
    return sorted(f[:-5] for f in os.listdir(carpeta)
                  if f.endswith(".json") and not f.endswith("-asignacion.json"))


def validar(d, cfg, claves, criterios, crit_dim, dims):
    problemas = {}
    respuestas, asignaciones = {}, {}
    claves_crit = [c["clave"] for c in criterios]
    ids_dims = {x["id"] for x in dims}
    for jid in ids_jueces(d, cfg):
        errs = []
        ruta = os.path.join(d, "respuestas", f"{jid}.json")
        if not os.path.exists(ruta):
            problemas[jid] = ["falta el archivo de evaluación"]
            continue
        try:
            r = leer_json(ruta)
        except Exception as e:  # JSON mal formado
            problemas[jid] = [f"JSON no válido: {e}"]
            continue
        vistos = set()
        for it in r.get("items", []):
            cod = it.get("id")
            if cod not in claves:
                errs.append(f"ítem desconocido {cod}")
                continue
            if cod in vistos:
                errs.append(f"ítem repetido {cod}")
            vistos.add(cod)
            p = it.get("puntuaciones", {})
            for c in claves_crit:
                v = p.get(c)
                if not isinstance(v, int) or not ESCALA_MIN <= v <= ESCALA_MAX:
                    errs.append(f"{cod}: '{c}' no es un entero de 1 a 4 ({v!r})")
        faltan = set(claves) - vistos
        if faltan:
            errs.append(f"faltan {len(faltan)} ítems: {', '.join(sorted(faltan)[:8])}")
        if crit_dim:
            vd = {x.get("id"): x for x in r.get("dimensiones", [])}
            for dim in ids_dims:
                v = vd.get(dim, {}).get("suficiencia")
                if not isinstance(v, int) or not ESCALA_MIN <= v <= ESCALA_MAX:
                    errs.append(f"dimensión {dim}: suficiencia no válida ({v!r})")
        respuestas[jid] = r
        if cfg.get("asignacion_ciega"):
            ruta_a = os.path.join(d, "respuestas", f"{jid}-asignacion.json")
            if not os.path.exists(ruta_a):
                errs.append("falta el archivo de asignación ciega")
            else:
                try:
                    a = leer_json(ruta_a)
                    asig = {x.get("id"): x.get("dimension") for x in a.get("asignaciones", [])}
                    reales = [c for c in claves if claves[c]["tipo"] == "real"]
                    falt = [c for c in reales if c not in asig]
                    if falt:
                        errs.append(f"asignación: faltan {len(falt)} ítems")
                    malas = [c for c, v in asig.items() if v not in ids_dims and v != "ninguna"]
                    if malas:
                        errs.append(f"asignación: dimensiones no válidas en {', '.join(malas[:5])}")
                    asignaciones[jid] = asig
                except Exception as e:
                    errs.append(f"asignación: JSON no válido: {e}")
        if errs:
            problemas[jid] = errs
    return respuestas, asignaciones, problemas


# ---------- Cálculo ----------

def r3(x):
    return round(x, 3)


def calcular(d, cfg, claves, criterios, crit_dim, dims, respuestas, asignaciones):
    u = cfg["umbrales"]
    nivel = u["nivel_confianza"]
    jueces = sorted(respuestas)
    n = len(jueces)
    min_icvi = umbral_icvi(n, u["icvi_min"])
    por_juez = {j: {it["id"]: it for it in respuestas[j]["items"]} for j in jueces}
    reales = [c for c in claves if claves[c]["tipo"] == "real"]
    reales.sort(key=lambda c: claves[c]["id"])
    trampas = [c for c in claves if claves[c]["tipo"] == "trampa"]

    filas_ind, filas_dec, comentarios = [], [], []
    icvis = {c["clave"]: [] for c in criterios}
    for cod in reales:
        it = claves[cod]
        fallos, criticos = [], []
        for c in criterios:
            cl = c["clave"]
            punt = [por_juez[j][cod]["puntuaciones"][cl] for j in jueces]
            v, lo, hi = v_aiken(punt, nivel)
            icvi, pc, k = icvi_kappa(punt)
            icvis[cl].append(icvi)
            cumple = v >= u["v_aiken_min"] and lo >= u["ic_inferior_min"] and icvi >= min_icvi
            if not cumple:
                fallos.append(cl)
            if cl in ("coherencia", "relevancia") and v < u["v_eliminar"]:
                criticos.append(cl)
            filas_ind.append({"item": it["id"], "dimension": it["dimension"], "criterio": cl,
                              "media": r3(statistics.mean(punt)), "mediana": statistics.median(punt),
                              "v_aiken": r3(v), "ic_inf": r3(lo), "ic_sup": r3(hi),
                              "icvi": r3(icvi), "kappa_mod": r3(k), "kappa_interp": interpretar_kappa(k),
                              "cumple": "sí" if cumple else "no"})
        asig_txt, prop = "", None
        if asignaciones:
            votos = [asignaciones[j].get(cod) for j in jueces if j in asignaciones]
            prop = sum(1 for v in votos if v == it["dimension"]) / len(votos) if votos else 0
            otras = {}
            for v in votos:
                if v != it["dimension"]:
                    otras[v] = otras.get(v, 0) + 1
            asig_txt = ", ".join(f"{k}:{v}" for k, v in sorted(otras.items(), key=lambda x: -x[1]))
        if criticos:
            dec = "Eliminar o reformular a fondo"
        elif fallos:
            dec = "Revisar"
        else:
            dec = "Mantener"
        motivo = []
        if criticos:
            motivo.append("V < %.2f en %s" % (u["v_eliminar"], ", ".join(criticos)))
        if fallos:
            motivo.append("no cumple en " + ", ".join(fallos))
        if prop is not None and prop < u["asignacion_min"]:
            motivo.append(f"asignación ciega correcta {prop:.0%}")
            if dec == "Mantener":
                dec = "Revisar"
        filas_dec.append({"item": it["id"], "dimension": it["dimension"], "texto": it["texto"],
                          "decision_propuesta": dec, "motivo": "; ".join(motivo),
                          "asignacion_correcta": "" if prop is None else r3(prop),
                          "asignado_a_otras": asig_txt})
        for j in jueces:
            r = por_juez[j][cod]
            if r.get("comentario") or r.get("propuesta"):
                comentarios.append({"item": it["id"], "juez": j,
                                    "puntuaciones": r["puntuaciones"],
                                    "comentario": r.get("comentario", ""),
                                    "propuesta": r.get("propuesta", "")})

    escala = []
    for c in criterios:
        cl = c["clave"]
        lista = icvis[cl]
        escala.append({"criterio": cl, "s_cvi_ave": r3(statistics.mean(lista)) if lista else "",
                       "s_cvi_ua": r3(sum(1 for x in lista if x == 1) / len(lista)) if lista else ""})

    filas_dim = []
    if crit_dim:
        for dim in dims:
            punt = []
            ausente = []
            for j in jueces:
                x = {e["id"]: e for e in respuestas[j].get("dimensiones", [])}[dim["id"]]
                punt.append(x["suficiencia"])
                if x.get("contenido_ausente"):
                    ausente.append(f"{j}: {x['contenido_ausente']}")
            v, lo, hi = v_aiken(punt, nivel)
            n_items = sum(1 for cod in reales if claves[cod]["dimension"] == dim["id"])
            filas_dim.append({"dimension": dim["id"], "nombre": dim.get("nombre", ""), "n_items": n_items,
                              "media": r3(statistics.mean(punt)), "v_aiken": r3(v), "ic_inf": r3(lo),
                              "ic_sup": r3(hi),
                              "cumple": "sí" if v >= u["v_aiken_min"] and lo >= u["ic_inferior_min"] else "no",
                              "contenido_ausente": " | ".join(ausente)})

    filas_tr, det_juez = [], {j: [] for j in jueces}
    for cod in trampas:
        t = claves[cod]
        fila = {"trampa": t["id"], "tipo": t.get("tipo_defecto", ""), "criterio_objetivo": t["criterio_objetivo"]}
        detectada = 0
        for j in jueces:
            p = por_juez[j][cod]["puntuaciones"][t["criterio_objetivo"]]
            ok = p <= 2
            det_juez[j].append(ok)
            detectada += ok
            fila[j] = p
        fila["tasa_deteccion"] = r3(detectada / n)
        filas_tr.append(fila)

    medianas = {}
    for cod in reales:
        for c in criterios:
            medianas[(cod, c["clave"])] = statistics.median(
                por_juez[j][cod]["puntuaciones"][c["clave"]] for j in jueces)
    filas_j = []
    for j in jueces:
        todas = [por_juez[j][cod]["puntuaciones"][c["clave"]] for cod in reales for c in criterios]
        desv = [abs(por_juez[j][cod]["puntuaciones"][c["clave"]] - medianas[(cod, c["clave"])])
                for cod in reales for c in criterios]
        fila = {"juez": j, "media": r3(statistics.mean(todas)),
                "prop_puntuaciones_1_2": r3(sum(1 for x in todas if x <= 2) / len(todas)),
                "desviacion_mediana_panel": r3(statistics.mean(desv)),
                "deteccion_trampas": r3(sum(det_juez[j]) / len(det_juez[j])) if det_juez[j] else ""}
        if asignaciones and j in asignaciones:
            fila["asignacion_correcta"] = r3(sum(1 for cod in reales
                                                 if asignaciones[j].get(cod) == claves[cod]["dimension"])
                                             / len(reales))
        filas_j.append(fila)

    return {"n_jueces": n, "umbral_icvi_aplicado": min_icvi, "indices": filas_ind, "decisiones": filas_dec,
            "escala": escala, "dimensiones": filas_dim, "trampas": filas_tr, "jueces": filas_j,
            "comentarios": comentarios, "jueces_ids": jueces}


# ---------- Salida ----------

COMA_DECIMAL = False


def fmt(v):
    if isinstance(v, float):
        t = f"{v:.2f}"
        return t.replace(".", ",") if COMA_DECIMAL else t
    if isinstance(v, str) and COMA_DECIMAL and v.startswith("[") and v.endswith("]"):
        return v.replace(", ", "; ").replace(".", ",")
    return str(v)


def num(v):
    t = f"{v:.2f}"
    return t.replace(".", ",") if COMA_DECIMAL else t


def tabla_md(filas, campos, cabeceras=None):
    if not filas:
        return "_Sin datos._\n"
    cab = cabeceras or campos
    out = ["| " + " | ".join(cab) + " |", "|" + "---|" * len(cab)]
    for f in filas:
        out.append("| " + " | ".join(fmt(f.get(c, "")).replace("|", "/").replace("\n", " ") for c in campos) + " |")
    return "\n".join(out) + "\n"


def escribir_resultados(d, cfg, criterios, res):
    out = os.path.join(d, "resultados")
    ind_c = ["item", "dimension", "criterio", "media", "mediana", "v_aiken", "ic_inf", "ic_sup",
             "icvi", "kappa_mod", "kappa_interp", "cumple"]
    escribir_csv(os.path.join(out, "indices_items.csv"), res["indices"], ind_c)
    dec_c = ["item", "dimension", "texto", "decision_propuesta", "motivo", "asignacion_correcta", "asignado_a_otras"]
    escribir_csv(os.path.join(out, "decisiones.csv"), res["decisiones"], dec_c)
    escribir_csv(os.path.join(out, "escala.csv"), res["escala"], ["criterio", "s_cvi_ave", "s_cvi_ua"])
    dim_c = ["dimension", "nombre", "n_items", "media", "v_aiken", "ic_inf", "ic_sup", "cumple", "contenido_ausente"]
    if res["dimensiones"]:
        escribir_csv(os.path.join(out, "suficiencia.csv"), res["dimensiones"], dim_c)
    tr_c = ["trampa", "tipo", "criterio_objetivo"] + res["jueces_ids"] + ["tasa_deteccion"]
    if res["trampas"]:
        escribir_csv(os.path.join(out, "trampas.csv"), res["trampas"], tr_c)
    j_c = ["juez", "media", "prop_puntuaciones_1_2", "desviacion_mediana_panel", "deteccion_trampas",
           "asignacion_correcta"]
    escribir_csv(os.path.join(out, "jueces.csv"), res["jueces"], j_c)
    escribir_json(os.path.join(out, "resultados.json"), res)

    global COMA_DECIMAL
    COMA_DECIMAL = str(cfg.get("idioma", "español")).lower().startswith(("español", "es", "castellano", "catal", "galleg", "portugu"))
    u = cfg["umbrales"]
    md = [f"# Tablas de resultados: {cfg.get('estudio', '')}\n",
          f"Jueces: {res['n_jueces']}. Escala de valoración de 1 a 4. "
          f"Criterio para mantener un ítem en cada criterio: V de Aiken ≥ {num(u['v_aiken_min'])}, "
          f"límite inferior del IC al {round(u['nivel_confianza'] * 100)} % ≥ {num(u['ic_inferior_min'])} "
          f"e I-CVI ≥ {num(res['umbral_icvi_aplicado'])}.\n"]
    md.append("## Decisión propuesta por ítem\n")
    md.append(tabla_md(res["decisiones"], ["item", "dimension", "decision_propuesta", "motivo"],
                       ["Ítem", "Dimensión", "Decisión", "Motivo"]))
    resumen = {}
    for f in res["decisiones"]:
        resumen[f["decision_propuesta"]] = resumen.get(f["decision_propuesta"], 0) + 1
    md.append("\n" + ", ".join(f"{k}: {v}" for k, v in resumen.items()) + "\n")
    for c in criterios:
        md.append(f"\n## {c['nombre']}\n")
        filas = [f for f in res["indices"] if f["criterio"] == c["clave"]]
        for f in filas:
            f["ic"] = f"[{f['ic_inf']:.2f}, {f['ic_sup']:.2f}]"
        md.append(tabla_md(filas, ["item", "dimension", "media", "v_aiken", "ic", "icvi", "kappa_mod", "kappa_interp",
                                   "cumple"],
                           ["Ítem", "Dim.", "Media", "V", "IC", "I-CVI", "k*", "Interp.", "Cumple"]))
    md.append("\n## Índices de la escala\n")
    md.append(tabla_md(res["escala"], ["criterio", "s_cvi_ave", "s_cvi_ua"], ["Criterio", "S-CVI/Ave", "S-CVI/UA"]))
    if res["dimensiones"]:
        md.append("\n## Suficiencia por dimensión\n")
        md.append(tabla_md(res["dimensiones"], ["dimension", "n_items", "media", "v_aiken", "ic_inf", "cumple"],
                           ["Dimensión", "Ítems", "Media", "V", "IC inf.", "Cumple"]))
    if res["trampas"]:
        md.append("\n## Detección de ítems trampa\n")
        md.append("Se considera detectada cuando el juez puntúa con 1 o 2 el criterio objetivo.\n\n")
        md.append(tabla_md(res["trampas"], ["trampa", "tipo", "criterio_objetivo"] + res["jueces_ids"]
                           + ["tasa_deteccion"],
                           ["Trampa", "Defecto", "Criterio"] + res["jueces_ids"] + ["Detección"]))
    md.append("\n## Diagnóstico de jueces\n")
    md.append(tabla_md(res["jueces"], j_c, ["Juez", "Media", "Prop. 1-2", "Desv. mediana", "Detección trampas",
                                            "Asignación correcta"]))
    with open(os.path.join(out, "tablas.md"), "w", encoding="utf-8") as f:
        f.write("\n".join(md))

    lineas = [f"# Comentarios por ítem: {cfg.get('estudio', '')}\n"]
    actual = None
    for c in sorted(res["comentarios"], key=lambda x: (x["item"], x["juez"])):
        if c["item"] != actual:
            actual = c["item"]
            lineas.append(f"\n## {actual}\n")
        p = ", ".join(f"{k} {v}" for k, v in c["puntuaciones"].items())
        lineas.append(f"- **{c['juez']}** ({p}): {c['comentario']}")
        if c["propuesta"]:
            lineas.append(f"  - Propuesta: {c['propuesta']}")
    with open(os.path.join(out, "comentarios.md"), "w", encoding="utf-8") as f:
        f.write("\n".join(lineas) + "\n")


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    if len(args) != 1:
        error("Uso: analizar.py <carpeta-del-estudio> [--validar]")
    d = os.path.abspath(args[0])
    cfg = cargar_config(d)
    criterios, crit_dim = resolver_criterios(cfg)
    items, dims, _ = cargar_instrumento(d, cfg)
    claves = construir_claves(d, cfg, items)
    respuestas, asignaciones, problemas = validar(d, cfg, claves, criterios, crit_dim, dims)
    if problemas:
        print("RESPUESTAS CON PROBLEMAS (relanzar estos jueces):")
        for j, errs in problemas.items():
            print(f"- {j}: " + "; ".join(errs[:6]))
        sys.exit(2)
    if len(respuestas) < 3:
        error("Se necesitan respuestas válidas de al menos 3 jueces")
    print(f"Respuestas válidas: {len(respuestas)} jueces")
    if "--validar" in sys.argv:
        return
    res = calcular(d, cfg, claves, criterios, crit_dim, dims, respuestas, asignaciones)
    escribir_resultados(d, cfg, criterios, res)
    resumen = {}
    for f in res["decisiones"]:
        resumen[f["decision_propuesta"]] = resumen.get(f["decision_propuesta"], 0) + 1
    print("Decisiones propuestas: " + ", ".join(f"{k} {v}" for k, v in resumen.items()))
    print(f"Resultados en {os.path.join(d, 'resultados')}")


if __name__ == "__main__":
    main()
