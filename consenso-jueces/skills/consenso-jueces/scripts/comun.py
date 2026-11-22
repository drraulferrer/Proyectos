"""Funciones compartidas por los scripts de consenso-jueces."""
import csv
import json
import os
import sys

SKILL_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PLANTILLAS = os.path.join(SKILL_DIR, "plantillas")
ESCALA_MIN, ESCALA_MAX = 1, 4

UMBRALES_POR_DEFECTO = {
    "v_aiken_min": 0.70,
    "ic_inferior_min": 0.50,
    "icvi_min": 0.78,
    "v_eliminar": 0.50,
    "asignacion_min": 0.70,
    "nivel_confianza": 0.95,
}


def error(msg, codigo=1):
    print(f"ERROR: {msg}", file=sys.stderr)
    sys.exit(codigo)


def leer_json(ruta):
    with open(ruta, encoding="utf-8") as f:
        return json.load(f)


def escribir_json(ruta, datos):
    os.makedirs(os.path.dirname(ruta), exist_ok=True)
    with open(ruta, "w", encoding="utf-8") as f:
        json.dump(datos, f, ensure_ascii=False, indent=2)


def leer_csv(ruta):
    with open(ruta, encoding="utf-8-sig", newline="") as f:
        return [{k.strip(): (v or "").strip() for k, v in fila.items() if k} for fila in csv.DictReader(f)]


def escribir_csv(ruta, filas, campos):
    os.makedirs(os.path.dirname(ruta), exist_ok=True)
    with open(ruta, "w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=campos, extrasaction="ignore")
        w.writeheader()
        w.writerows(filas)


def cargar_config(dir_estudio):
    ruta = os.path.join(dir_estudio, "config.json")
    if not os.path.exists(ruta):
        error(f"No existe {ruta}")
    cfg = leer_json(ruta)
    umbrales = dict(UMBRALES_POR_DEFECTO)
    umbrales.update(cfg.get("umbrales", {}))
    cfg["umbrales"] = umbrales
    cfg.setdefault("archivos", {})
    cfg["archivos"].setdefault("instrumento", "instrumento.csv")
    cfg["archivos"].setdefault("dimensiones", "dimensiones.csv")
    cfg["archivos"].setdefault("trampas", "trampas.csv")
    cfg.setdefault("modo", "simulado")
    cfg.setdefault("suficiencia", True)
    cfg.setdefault("asignacion_ciega", False)
    return cfg


def resolver_criterios(cfg):
    """Devuelve (criterios_item, criterio_dimension) como objetos completos."""
    base = leer_json(os.path.join(PLANTILLAS, "criterios-base.json"))
    opcionales = leer_json(os.path.join(PLANTILLAS, "criterios-opcionales.json"))
    catalogo = dict(base["criterios_item"])
    catalogo.update({k: v for k, v in opcionales.items() if not k.startswith("_")})
    for p in cfg.get("criterios_personalizados", []):
        clave = p.get("clave")
        if not clave:
            error("Un criterio personalizado no tiene 'clave'")
        anclas = p.get("anclas", {})
        if sorted(anclas.keys()) != ["1", "2", "3", "4"]:
            error(f"El criterio personalizado '{clave}' debe tener anclas 1, 2, 3 y 4")
        catalogo[clave] = {"nombre": p.get("nombre", clave), "definicion": p.get("definicion", ""), "anclas": anclas}
    claves = list(cfg.get("criterios_item", ["claridad", "coherencia", "relevancia"]))
    for p in cfg.get("criterios_personalizados", []):
        if p["clave"] not in claves:
            claves.append(p["clave"])
    criterios = []
    for c in claves:
        if c not in catalogo:
            error(f"Criterio desconocido: '{c}'. Disponibles: {', '.join(sorted(catalogo))}")
        criterios.append({"clave": c, **catalogo[c]})
    dimension = base["criterio_dimension"] if cfg.get("suficiencia", True) else None
    return criterios, dimension


def cargar_instrumento(dir_estudio, cfg):
    ruta_items = os.path.join(dir_estudio, cfg["archivos"]["instrumento"])
    ruta_dims = os.path.join(dir_estudio, cfg["archivos"]["dimensiones"])
    for r in (ruta_items, ruta_dims):
        if not os.path.exists(r):
            error(f"No existe {r}")
    items = leer_csv(ruta_items)
    dims = leer_csv(ruta_dims)
    ids_dim = [d["id"] for d in dims]
    if len(set(ids_dim)) != len(ids_dim):
        error("Hay identificadores de dimensión repetidos en dimensiones.csv")
    ids = [i["id"] for i in items]
    if len(set(ids)) != len(ids):
        error("Hay identificadores de ítem repetidos en instrumento.csv")
    for i in items:
        if not i.get("texto"):
            error(f"El ítem {i['id']} no tiene texto")
        if i.get("dimension") not in ids_dim:
            error(f"El ítem {i['id']} tiene una dimensión desconocida: '{i.get('dimension')}'")
    trampas = []
    ruta_trampas = os.path.join(dir_estudio, cfg["archivos"]["trampas"])
    if os.path.exists(ruta_trampas):
        trampas = leer_csv(ruta_trampas)
        for t in trampas:
            if t["id"] in ids:
                error(f"La trampa {t['id']} usa un identificador de ítem real")
            if t.get("dimension") not in ids_dim:
                error(f"La trampa {t['id']} tiene una dimensión desconocida")
    return items, dims, trampas
