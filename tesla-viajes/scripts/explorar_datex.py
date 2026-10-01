"""Exploración temporal del XML DATEX II de la DGT/MITERD.

Imprime un histograma de rutas de elementos, los valores de los campos de baja
cardinalidad (enumeraciones) y varias estaciones de ejemplo completas.
"""
import collections
import re
import sys
import xml.etree.ElementTree as ET

RUTA = sys.argv[1]
MAX_DISTINTOS = 3000
OPERADORES = [
    "tesla", "iberdrola", "zunder", "endesa", "repsol", "ionity", "wenea",
    "moeve", "cepsa", "bp", "powerdot", "electra", "fastned", "atlante",
    "easycharger", "ewiva", "galp", "plenitude", "naturgy", "lidl",
]


def sin_ns(tag):
    return tag.split("}", 1)[1] if "}" in tag else tag


conteo = collections.Counter()
valores = collections.defaultdict(collections.Counter)
atributos = collections.defaultdict(collections.Counter)
desbordados = set()
espacios = collections.Counter()
pila = []
ejemplos = {}
sitios = 0

for evento, elem in ET.iterparse(RUTA, events=("start", "end", "start-ns")):
    if evento == "start-ns":
        espacios[elem] += 1
        continue
    if evento == "start":
        pila.append(sin_ns(elem.tag))
        ruta = "/".join(pila[1:])
        conteo[ruta] += 1
        for clave, valor in elem.attrib.items():
            k = ruta + "@" + sin_ns(clave)
            if k in desbordados:
                continue
            atributos[k][valor[:70]] += 1
            if len(atributos[k]) > MAX_DISTINTOS:
                desbordados.add(k)
        continue
    ruta = "/".join(pila[1:])
    texto = (elem.text or "").strip()
    if texto and len(elem) == 0 and ruta not in desbordados:
        valores[ruta][texto[:90]] += 1
        if len(valores[ruta]) > MAX_DISTINTOS:
            desbordados.add(ruta)
    if sin_ns(elem.tag) == "energyInfrastructureSite":
        sitios += 1
        bruto = ET.tostring(elem, encoding="unicode")
        bajo = bruto.lower()
        for op in OPERADORES:
            if op not in ejemplos and re.search(r">[^<]*\b" + op + r"\b", bajo):
                ET.indent(elem)
                ejemplos[op] = ET.tostring(elem, encoding="unicode")
                break
        if sitios <= 2 and "primero%d" % sitios not in ejemplos:
            ET.indent(elem)
            ejemplos["primero%d" % sitios] = ET.tostring(elem, encoding="unicode")
        elem.clear()
    pila.pop()

print("=== ESPACIOS DE NOMBRES ===")
for (prefijo, uri), n in espacios.most_common():
    print(f"{prefijo!r} -> {uri} ({n})")
print(f"\n=== SITIOS: {sitios} ===")
print("\n=== RUTAS (conteo) ===")
for ruta, n in sorted(conteo.items()):
    print(f"{n:>8}  {ruta}")
print("\n=== VALORES DE CAMPOS HOJA ===")
for ruta in sorted(valores):
    c = valores[ruta]
    marca = " (DESBORDADO)" if ruta in desbordados else ""
    print(f"\n# {ruta}  distintos={len(c)}{marca}")
    for valor, n in c.most_common(40 if len(c) < 200 else 8):
        print(f"    {n:>7}  {valor}")
print("\n=== ATRIBUTOS ===")
for ruta in sorted(atributos):
    c = atributos[ruta]
    marca = " (DESBORDADO)" if ruta in desbordados else ""
    print(f"\n# {ruta}  distintos={len(c)}{marca}")
    for valor, n in c.most_common(30 if len(c) < 200 else 5):
        print(f"    {n:>7}  {valor}")
print("\n=== EJEMPLOS ===")
for op, xml in ejemplos.items():
    print(f"\n----- {op} -----")
    print(xml[:7000])
