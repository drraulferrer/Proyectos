#!/usr/bin/env python3
"""Captura datos reales para las pruebas de la interfaz sin red.

Pide a OSRM la ruta Madrid → Valencia y guarda:
  - osrm-madrid-valencia.json: respuesta de OSRM (geometría y anotaciones);
  - estaciones-corredor.json: las estaciones del registro a menos de 6 km de
    esa ruta, con el mismo formato que web/datos/estaciones.json.

Uso (necesita salida a internet, por ejemplo en GitHub Actions):
    python3 capturar_fixtures.py --datos web/datos/estaciones.json --salida ../test/fixtures
"""
import argparse
import json
import math
import os
import urllib.request

URL_RUTA = (
    "https://router.project-osrm.org/route/v1/driving/-3.7038,40.4168;-0.3763,39.4699"
    "?overview=full&geometries=polyline6&annotations=distance,duration,speed&steps=false"
)
RADIO_KM = 6


def decodificar(cadena, precision=6):
    puntos, i, lat, lon, factor = [], 0, 0, 0, 10 ** precision
    while i < len(cadena):
        for eje in (0, 1):
            resultado, desplazamiento = 0, 0
            while True:
                b = ord(cadena[i]) - 63
                i += 1
                resultado |= (b & 0x1F) << desplazamiento
                desplazamiento += 5
                if b < 0x20:
                    break
            delta = ~(resultado >> 1) if resultado & 1 else resultado >> 1
            if eje == 0:
                lat += delta
            else:
                lon += delta
        puntos.append((lat / factor, lon / factor))
    return puntos


def km(a, b):
    dlat = math.radians(b[0] - a[0])
    dlon = math.radians(b[1] - a[1])
    h = math.sin(dlat / 2) ** 2 + math.cos(math.radians(a[0])) * math.cos(math.radians(b[0])) * math.sin(dlon / 2) ** 2
    return 2 * 6371.0088 * math.asin(min(1, math.sqrt(h)))


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--datos", required=True)
    p.add_argument("--salida", required=True)
    args = p.parse_args()

    peticion = urllib.request.Request(URL_RUTA, headers={"User-Agent": "tesla-viajes-fixtures/1.0"})
    with urllib.request.urlopen(peticion, timeout=60) as r:
        osrm = json.load(r)
    ruta = osrm["routes"][0]
    puntos = decodificar(ruta["geometry"])
    muestras = puntos[::5] + [puntos[-1]]
    lat_min = min(p[0] for p in puntos) - 0.1
    lat_max = max(p[0] for p in puntos) + 0.1
    lon_min = min(p[1] for p in puntos) - 0.1
    lon_max = max(p[1] for p in puntos) + 0.1

    with open(args.datos, encoding="utf-8") as f:
        datos = json.load(f)
    i = {c: k for k, c in enumerate(datos["campos"])}
    corredor = []
    for fila in datos["estaciones"]:
        lat, lon = fila[i["lat"]], fila[i["lon"]]
        if not (lat_min <= lat <= lat_max and lon_min <= lon <= lon_max):
            continue
        if min(km((lat, lon), m) for m in muestras) <= RADIO_KM:
            corredor.append(fila)
    usados = sorted({fila[i["operador"]] for fila in corredor})
    nuevo_indice = {viejo: nuevo for nuevo, viejo in enumerate(usados)}
    for fila in corredor:
        fila[i["operador"]] = nuevo_indice[fila[i["operador"]]]
    datos["operadores"] = [datos["operadores"][k] for k in usados]
    datos["estaciones"] = corredor

    os.makedirs(args.salida, exist_ok=True)
    with open(os.path.join(args.salida, "estaciones-corredor.json"), "w", encoding="utf-8") as f:
        json.dump(datos, f, ensure_ascii=False, separators=(",", ":"))
    with open(os.path.join(args.salida, "osrm-madrid-valencia.json"), "w", encoding="utf-8") as f:
        json.dump(osrm, f, separators=(",", ":"))
    print(f"{len(corredor)} estaciones en el corredor; ruta de {ruta['distance'] / 1000:.1f} km")


if __name__ == "__main__":
    main()
