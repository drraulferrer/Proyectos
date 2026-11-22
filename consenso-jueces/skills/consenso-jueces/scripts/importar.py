#!/usr/bin/env python3
"""Convierte las puntuaciones de un panel humano (CSV largo) al formato de respuestas.

Uso: python3 importar.py <carpeta-del-estudio> <respuestas.csv>

Columnas: juez, tipo, id, criterio, puntuacion, comentario
  tipo = item        criterio = clave del criterio, puntuacion = 1 a 4
  tipo = dimension   criterio = suficiencia, puntuacion = 1 a 4, comentario = contenido ausente
  tipo = asignacion  criterio = dimension, puntuacion = id de la dimensión asignada o 'ninguna'
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from comun import cargar_config, error, escribir_json, leer_csv  # noqa: E402


def main():
    if len(sys.argv) != 3:
        error("Uso: importar.py <carpeta-del-estudio> <respuestas.csv>")
    d = os.path.abspath(sys.argv[1])
    cfg = cargar_config(d)
    if cfg["modo"] != "humano":
        error("importar.py solo se usa con \"modo\": \"humano\" en config.json")
    filas = leer_csv(sys.argv[2])
    jueces = {}
    for n, f in enumerate(filas, 2):
        j = f.get("juez")
        if not j:
            error(f"Fila {n}: falta el juez")
        r = jueces.setdefault(j, {"items": {}, "dimensiones": {}, "asignaciones": []})
        tipo = f.get("tipo")
        if tipo == "item":
            try:
                p = int(f["puntuacion"])
            except ValueError:
                error(f"Fila {n}: puntuación no numérica")
            it = r["items"].setdefault(f["id"], {"id": f["id"], "puntuaciones": {}, "comentario": "", "propuesta": ""})
            it["puntuaciones"][f["criterio"]] = p
            if f.get("comentario"):
                it["comentario"] = (it["comentario"] + " " + f"[{f['criterio']}] {f['comentario']}").strip()
        elif tipo == "dimension":
            r["dimensiones"][f["id"]] = {"id": f["id"], "suficiencia": int(f["puntuacion"]),
                                         "comentario": "", "contenido_ausente": f.get("comentario", "")}
        elif tipo == "asignacion":
            r["asignaciones"].append({"id": f["id"], "dimension": f["puntuacion"], "seguridad": ""})
        else:
            error(f"Fila {n}: tipo desconocido '{tipo}'")
    for j, r in jueces.items():
        escribir_json(os.path.join(d, "respuestas", f"{j}.json"),
                      {"juez": j, "items": list(r["items"].values()), "dimensiones": list(r["dimensiones"].values())})
        if r["asignaciones"]:
            escribir_json(os.path.join(d, "respuestas", f"{j}-asignacion.json"),
                          {"juez": j, "asignaciones": r["asignaciones"]})
    print(f"Importados {len(jueces)} jueces: {', '.join(sorted(jueces))}")


if __name__ == "__main__":
    main()
