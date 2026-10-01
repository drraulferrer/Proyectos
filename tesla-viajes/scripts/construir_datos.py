#!/usr/bin/env python3
"""Convierte el registro oficial de puntos de recarga en el JSON compacto de la web.

Fuente: registro de puntos de recarga de acceso público del MITERD, publicado a
diario por la DGT en el Punto de Acceso Nacional en formato DATEX II v3
(EnergyInfrastructureTablePublication). Licencia CC BY 4.0.

Uso:
    python3 construir_datos.py                      # descarga la fuente oficial
    python3 construir_datos.py --entrada fichero.xml
    python3 construir_datos.py --salida ../web/datos

Sin dependencias: solo biblioteca estándar de Python 3.9+.
"""
import argparse
import collections
import datetime as dt
import gzip
import json
import os
import re
import shutil
import sys
import tempfile
import urllib.request
import xml.etree.ElementTree as ET

URL_FUENTE = (
    "https://infocar.dgt.es/datex2/v3/miterd/"
    "EnergyInfrastructureTablePublication/electrolineras.xml"
)
URL_NAP = "https://nap.dgt.es/dataset/puntos-de-recarga-electrica-para-vehiculos"

# Medios de pago e identificación declarados por el operador (Orden TED/445/2023).
# El valor es el bit que ocupa en el campo «pagos» del JSON.
BITS_PAGO = {
    "apps": 1,
    "rfid": 2,
    "creditCard": 4,
    "debitCard": 8,
    "nfc": 16,
    "pinpad": 32,
}

BITS_SERVICIO = {
    "foodShopping": 1,
    "restaurant": 2,
    "cafe": 4,
    "leisureActivities": 8,
    "petrolStation": 16,
    "shop": 32,
    "hotel": 64,
    "bikeSharing": 128,
    # Instalaciones asociadas (associatedFacility/type)
    "parkingSite": 256,
    "publicTransportHub": 512,
    "trainStation": 1024,
    "airport": 2048,
}

TIPO_SITIO = {"openSpace": "a", "onstreet": "v", "inBuilding": "e", "other": "o"}

CONECTOR = {
    "iec62196T2COMBO": "C2",
    "iec62196T2": "T2",
    "chademo": "CH",
    "domesticF": "SK",
    "domesticE": "SK",
    "iec62196T1": "T1",
    "iec62196T1COMBO": "C1",
    "iec60309x2single16": "IN",
    "iec60309x2three16": "IN",
    "iec60309x2three32": "IN",
    "iec60309x2three64": "IN",
}

MODO = {"mode4DC": "DC", "mode3AC3p": "AC3", "mode3AC1p": "AC1", "mode2AC1p": "AC1", "mode1AC1p": "AC1"}
FORMATO = {"cableMode3": "c", "cableMode2": "c", "socket": "s"}

# Marca comercial para los operadores más habituales. El resto se muestra con su
# razón social limpia (sin «S.L.», «S.A.U.», etc.).
MARCAS = {
    "ES*ESX": "Endesa X Way",
    "ES*IBD": "Iberdrola",
    "ES*REP": "Repsol",
    "ES*FCT": "Charging Together",
    "ES*ETE": "Etecnic",
    "ES*WEN": "Wenea",
    "ES*EDP": "EDP",
    "ES*ERA": "Eranovum",
    "ES*TCB": "TotalEnergies",
    "ES*FEN": "Fenie Energía",
    "ES*PLE": "Plenoil",
    "ES*BSM": "BSM Barcelona",
    "ES*ARE": "Acciona",
    "ES*EMA": "EMAYA",
    "ES*DLP": "Galp",
    "ES*ZUN": "Zunder",
    "ES*TSL": "Tesla Supercharger",
    "ES*MOE": "Moeve",
    "ES*CRF": "Carrefour",
    "ES*IOY": "IONITY",
    "ES*ALL": "Allego",
}

DIAS = {
    "lunes": 0, "martes": 1, "miercoles": 2, "miércoles": 2, "jueves": 3,
    "viernes": 4, "sabado": 5, "sábado": 5, "domingo": 6,
}
RE_TRAMO = re.compile(
    r"(Lunes|Martes|Mi[eé]rcoles|Jueves|Viernes|S[aá]bado|Domingo)\s*"
    r"\(\s*(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})\s*\)",
    re.IGNORECASE,
)
RE_SUFIJO_LEGAL = re.compile(
    r"[,\s]+(S\.?\s?L\.?\s?U\.?|S\.?\s?A\.?\s?U\.?|S\.?\s?L\.?|S\.?\s?A\.?|SRL|S\.?\s?C\.?|"
    r"GmbH(\s+Sucursal\s+en\s+Espa[ñn]a)?)\.?\s*$",
    re.IGNORECASE,
)

SIGLAS = {"BSM", "EDP", "APK", "EV", "BP", "ACS", "AC", "DC"}
MINUSCULAS = {"de", "del", "la", "las", "los", "y", "e", "en"}

# España peninsular, Baleares, Canarias, Ceuta y Melilla.
LAT_MIN, LAT_MAX, LON_MIN, LON_MAX = 27.4, 44.0, -18.5, 4.6


def local(tag):
    return tag.rsplit("}", 1)[-1]


def hijo(elem, nombre):
    if elem is None:
        return None
    for c in elem:
        if local(c.tag) == nombre:
            return c
    return None


def hijos(elem, nombre):
    if elem is None:
        return []
    return [c for c in elem if local(c.tag) == nombre]


def texto(elem):
    if elem is None or elem.text is None:
        return ""
    return elem.text.strip()


def multilingue(elem):
    """Devuelve el texto en español de un bloque com:values, o el primero que haya."""
    valores = hijo(elem, "values")
    if valores is None:
        return texto(elem)
    candidatos = hijos(valores, "value")
    for v in candidatos:
        if v.get("lang", "es") == "es" and texto(v):
            return texto(v)
    return texto(candidatos[0]) if candidatos else ""


def numero(elem):
    try:
        return float(texto(elem))
    except ValueError:
        return 0.0


def limpiar_razon_social(nombre):
    todo_mayusculas = nombre.isupper()
    nombre = re.sub(r"^\((.+?)\)\s*", "", nombre.strip())  # «(ZUNDER) Grupo …»
    anterior = None
    while anterior != nombre:
        anterior = nombre
        nombre = RE_SUFIJO_LEGAL.sub("", nombre).strip(" ,")
    if todo_mayusculas:
        palabras = []
        for i, p in enumerate(nombre.split()):
            if p in SIGLAS:
                palabras.append(p)
            elif i > 0 and p.lower() in MINUSCULAS:
                palabras.append(p.lower())
            else:
                palabras.append(p.capitalize())
        nombre = " ".join(palabras)
    return nombre


def prefijo_comun(a, b):
    """Palabras iniciales comunes: «Centro X CP1» + «Centro X CP2» → «Centro X»."""
    comunes = []
    for x, y in zip(a.split(), b.split()):
        if x != y:
            break
        comunes.append(x)
    return " ".join(comunes).strip(" -–_")


def parsear_horario(horario, stats=None):
    """«24/7», lista de 7 cadenas (lunes→domingo; "" = cerrado) o None si se desconoce.

    Si el identificador dice «24/7» pero la etiqueta detalla tramos más cortos,
    manda la etiqueta: es el dato más específico y evita proponer una parada
    cerrada.
    """
    if horario is None:
        return None
    ident = (horario.get("id") or "").strip()
    etiqueta = texto(hijo(horario, "label"))
    tramos = RE_TRAMO.findall(etiqueta)
    if not tramos:
        return "24/7" if ident == "24/7" else None
    dias = [[] for _ in range(7)]
    for nombre_dia, h1, m1, h2, m2 in tramos:
        d = DIAS[nombre_dia.lower()]
        inicio, fin = f"{int(h1):02d}:{m1}", f"{int(h2):02d}:{m2}"
        if inicio == fin:  # «00:00 - 00:00»: cerrado ese día
            continue
        if fin == "23:59":
            fin = "24:00"
        dias[d].append(f"{inicio}-{fin}")
    resultado = [",".join(sorted(set(t))) for t in dias]
    if all(r == "00:00-24:00" for r in resultado):
        return "24/7"
    if ident == "24/7" and stats is not None:
        stats["horario_24_7_contradictorio"] += 1
    return resultado


def coordenadas(ref, stats):
    c = hijo(ref, "coordinatesForDisplay")
    lat, lon = numero(hijo(c, "latitude")), numero(hijo(c, "longitude"))
    dentro = lambda la, lo: LAT_MIN <= la <= LAT_MAX and LON_MIN <= lo <= LON_MAX
    if dentro(lat, lon):
        return round(lat, 5), round(lon, 5)
    if dentro(lon, lat):
        stats["coordenadas_intercambiadas"] += 1
        return round(lon, 5), round(lat, 5)
    stats["sin_coordenadas_validas"] += 1
    return None


def direccion(ref):
    ext = hijo(ref, "_locationReferenceExtension")
    dirn = hijo(hijo(ext, "facilityLocation"), "address")
    partes = {"direccion": "", "municipio": "", "provincia": ""}
    lineas = sorted(hijos(dirn, "addressLine"), key=lambda l: int(l.get("order") or 0))
    for linea in lineas:
        valor = multilingue(hijo(linea, "text"))
        clave, _, resto = valor.partition(":")
        clave = clave.strip().lower()
        if clave.startswith("direcci"):
            partes["direccion"] = resto.strip()
        elif clave == "municipio":
            partes["municipio"] = resto.strip()
        elif clave == "provincia":
            partes["provincia"] = resto.strip()
    cp = texto(hijo(dirn, "postcode"))
    if cp.isdigit() and len(cp) < 5:
        cp = cp.zfill(5)
    partes["cp"] = cp
    return partes


def potencia_kw(vatios, stats):
    if 0 < vatios < 400:  # declarado en kW por error
        stats["potencia_en_kw_corregida"] += 1
        return vatios
    if vatios > 1_500_000:  # declarado en mW o con ceros de más
        stats["potencia_desmesurada_corregida"] += 1
        return vatios / 1_000_000
    return vatios / 1000


def parsear_sitio(sitio, stats):
    ref = hijo(sitio, "locationReference")
    coords = coordenadas(ref, stats) if ref is not None else None
    if coords is None:
        if ref is None:
            stats["sin_coordenadas_validas"] += 1
        return None
    operador = hijo(sitio, "operator")
    pagos = 0
    servicios = 0
    grupos = collections.Counter()
    n_puntos = 0
    for est in hijos(sitio, "energyInfrastructureStation"):
        for m in hijos(est, "authenticationAndIdentificationMethods"):
            bit = BITS_PAGO.get(texto(m))
            if bit is None:
                stats["pagos_desconocidos"][texto(m)] += 1
            else:
                pagos |= bit
        for rp in hijos(est, "refillPoint"):
            n_puntos += 1
            for con in hijos(rp, "connector"):
                tipo = CONECTOR.get(texto(hijo(con, "connectorType")), "OT")
                modo = MODO.get(texto(hijo(con, "chargingMode")), "AC1")
                formato = FORMATO.get(texto(hijo(con, "connectorFormat")), "c")
                kw = round(potencia_kw(numero(hijo(con, "maxPowerAtSocket")), stats), 1)
                voltios = int(round(numero(hijo(con, "voltage"))))
                amperios = round(numero(hijo(con, "maximumCurrent")), 1)
                grupos[(tipo, modo, formato, kw, voltios, amperios)] += 1
    for sf in hijos(sitio, "supplementalFacility"):
        servicios |= BITS_SERVICIO.get(texto(hijo(sf, "serviceFacilityType")), 0)
    for af in hijos(sitio, "associatedFacility"):
        servicios |= BITS_SERVICIO.get(texto(hijo(af, "type")), 0)
    if not grupos:
        stats["sin_conectores"] += 1
        return None
    return {
        "id": sitio.get("id") or "",
        "nombre": multilingue(hijo(sitio, "name")),
        "op_id": (operador.get("id") if operador is not None else "") or "",
        "op_nombre": multilingue(hijo(operador, "name")),
        "lat": coords[0],
        "lon": coords[1],
        **direccion(ref),
        "horario": parsear_horario(hijo(sitio, "operatingHours"), stats),
        "pagos": pagos,
        "tipo": TIPO_SITIO.get(texto(hijo(sitio, "typeOfSite")), ""),
        "servicios": servicios,
        "actualizado": texto(hijo(sitio, "lastUpdated"))[:10],
        "n_puntos": n_puntos,
        "conectores": grupos,
    }


def fusionar(sitios):
    """Une los registros del mismo operador en el mismo punto (p. ej. «CP1» y «CP2»)."""
    por_clave = {}
    for s in sitios:
        clave = (s["op_id"], round(s["lat"], 4), round(s["lon"], 4))
        if clave not in por_clave:
            s["ids"] = [s["id"]]
            por_clave[clave] = s
            continue
        base = por_clave[clave]
        base["ids"].append(s["id"])
        base["pagos"] |= s["pagos"]
        base["servicios"] |= s["servicios"]
        base["n_puntos"] += s["n_puntos"]
        base["conectores"] += s["conectores"]
        base["actualizado"] = max(base["actualizado"], s["actualizado"])
        base["nombre"] = prefijo_comun(base["nombre"], s["nombre"]) or base["nombre"]
        if base["horario"] is None or (s["horario"] == "24/7"):
            base["horario"] = s["horario"] if s["horario"] is not None else base["horario"]
    return list(por_clave.values())


def leer_xml(ruta):
    stats = collections.Counter()
    stats["pagos_desconocidos"] = collections.Counter()
    publicado = ""
    sitios = []
    for _, elem in ET.iterparse(ruta, events=("end",)):
        nombre = local(elem.tag)
        if nombre == "publicationTime" and not publicado:
            publicado = texto(elem)
        elif nombre == "energyInfrastructureSite":
            stats["sitios_leidos"] += 1
            s = parsear_sitio(elem, stats)
            if s is not None:
                sitios.append(s)
            elem.clear()
    return publicado, sitios, stats


CAMPOS = [
    "id", "nombre", "operador", "lat", "lon", "direccion", "municipio", "provincia",
    "cp", "horario", "pagos", "tipo", "servicios", "actualizado", "puntos", "conectores",
]


def construir(ruta_xml, generado=None):
    publicado, sitios, stats = leer_xml(ruta_xml)
    estaciones = fusionar(sitios)
    estaciones.sort(key=lambda s: (s["lat"], s["lon"]))
    operadores = {}
    for s in estaciones:
        if s["op_id"] not in operadores:
            marca = MARCAS.get(s["op_id"]) or limpiar_razon_social(s["op_nombre"]) or s["op_id"]
            operadores[s["op_id"]] = {"id": s["op_id"], "marca": marca, "razon_social": s["op_nombre"], "n": 0}
        operadores[s["op_id"]]["n"] += 1
    lista_ops = sorted(operadores.values(), key=lambda o: -o["n"])
    indice_op = {o["id"]: i for i, o in enumerate(lista_ops)}
    filas = []
    for s in estaciones:
        conectores = [list(k) + [n] for k, n in sorted(s["conectores"].items(), key=lambda kv: (-kv[0][3], kv[0]))]
        filas.append([
            s["ids"][0] if len(s["ids"]) == 1 else "+".join(s["ids"]),
            s["nombre"], indice_op[s["op_id"]], s["lat"], s["lon"], s["direccion"], s["municipio"],
            s["provincia"], s["cp"], s["horario"], s["pagos"], s["tipo"], s["servicios"],
            s["actualizado"], s["n_puntos"], conectores,
        ])
    resumen = resumir(estaciones, stats)
    datos = {
        "version": 1,
        "generado": generado or dt.datetime.now(dt.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "fuente": {
            "nombre": "Registro de puntos de recarga de acceso público (MITERD), publicado por la DGT en DATEX II",
            "url": URL_FUENTE,
            "catalogo": URL_NAP,
            "publicado": publicado,
            "licencia": "CC BY 4.0",
        },
        "bits_pago": BITS_PAGO,
        "bits_servicio": BITS_SERVICIO,
        "campos": CAMPOS,
        "campos_conector": ["tipo", "modo", "formato", "kw", "voltios", "amperios", "n"],
        "operadores": [{k: o[k] for k in ("id", "marca", "razon_social")} for o in lista_ops],
        "estaciones": filas,
    }
    return datos, resumen


def resumir(estaciones, stats):
    def tiene_ccs(s, kw):
        return any(k[0] == "C2" and k[1] == "DC" and k[3] >= kw for k in s["conectores"])

    pago_tarjeta = BITS_PAGO["creditCard"] | BITS_PAGO["debitCard"] | BITS_PAGO["pinpad"]
    rapidas = [s for s in estaciones if tiene_ccs(s, 50)]
    return {
        "sitios_leidos": stats["sitios_leidos"],
        "estaciones": len(estaciones),
        "puntos": sum(s["n_puntos"] for s in estaciones),
        "estaciones_ccs_50kw": len(rapidas),
        "estaciones_ccs_150kw": sum(1 for s in estaciones if tiene_ccs(s, 150)),
        "rapidas_con_tarjeta_declarada": sum(1 for s in rapidas if s["pagos"] & pago_tarjeta),
        "rapidas_sin_medio_de_pago": sum(1 for s in rapidas if s["pagos"] == 0),
        "sin_medio_de_pago": sum(1 for s in estaciones if s["pagos"] == 0),
        "descartes": {k: stats[k] for k in ("sin_coordenadas_validas", "sin_conectores")},
        "correcciones": {k: stats[k] for k in (
            "coordenadas_intercambiadas", "potencia_en_kw_corregida", "potencia_desmesurada_corregida",
            "horario_24_7_contradictorio")},
        "pagos_desconocidos": dict(stats["pagos_desconocidos"]),
    }


def descargar(url, destino):
    peticion = urllib.request.Request(url, headers={
        "Accept-Encoding": "gzip",
        "User-Agent": "tesla-viajes/1.0 (+https://github.com/drraulferrer/Proyectos)",
    })
    with urllib.request.urlopen(peticion, timeout=600) as r, open(destino, "wb") as f:
        origen = gzip.GzipFile(fileobj=r) if r.headers.get("Content-Encoding") == "gzip" else r
        shutil.copyfileobj(origen, f)


def main(argv=None):
    p = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    p.add_argument("--entrada", help="XML DATEX II local (por defecto se descarga la fuente oficial)")
    p.add_argument("--salida", default=os.path.join(os.path.dirname(__file__), "..", "web", "datos"))
    p.add_argument("--min-estaciones", type=int, default=0,
                   help="falla si salen menos estaciones (protege la web de una descarga rota)")
    args = p.parse_args(argv)

    if args.entrada:
        ruta = args.entrada
    else:
        tmp = tempfile.NamedTemporaryFile(suffix=".xml", delete=False)
        tmp.close()
        ruta = tmp.name
        print(f"Descargando {URL_FUENTE} …", file=sys.stderr)
        descargar(URL_FUENTE, ruta)

    datos, resumen = construir(ruta)
    if resumen["estaciones"] < args.min_estaciones:
        print(f"ERROR: solo {resumen['estaciones']} estaciones (< {args.min_estaciones}).", file=sys.stderr)
        return 1
    os.makedirs(args.salida, exist_ok=True)
    with open(os.path.join(args.salida, "estaciones.json"), "w", encoding="utf-8") as f:
        json.dump(datos, f, ensure_ascii=False, separators=(",", ":"))
    meta = {"generado": datos["generado"], "fuente": datos["fuente"], "resumen": resumen}
    with open(os.path.join(args.salida, "meta.json"), "w", encoding="utf-8") as f:
        json.dump(meta, f, ensure_ascii=False, indent=2)
    print(json.dumps(resumen, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
