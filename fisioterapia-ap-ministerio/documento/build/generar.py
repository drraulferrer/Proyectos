#!/usr/bin/env python3
"""generar.py. Ensambla el documento a partir de fuente/*.md y datos/*.csv.

1. Sustituye los marcadores {{...}} por tablas y valores generados desde los datos
   y desde el modelo de demanda. Así las tablas de las secciones 5, 6, 8, 9 y 10 y
   los anexos A, B, C y E salen de una única fuente de verdad (criterios 9.3 y 9.10).
2. Numera las citas [@ID] en orden de primera aparición (estilo Vancouver) y
   genera la lista de referencias con su estado de verificación.
Salida: build/documento.md y build/bibliografia.json
"""
import csv, json, re, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
import modelo

RAIZ = Path(__file__).resolve().parent.parent
FUENTE, DATOS, BUILD = RAIZ / "fuente", RAIZ / "datos", RAIZ / "build"


def lee(nombre, sep=";"):
    return list(csv.DictReader(open(DATOS / nombre, encoding="utf-8"), delimiter=sep))


def num(x, dec=0):
    """Formato español: punto de millar y coma decimal."""
    s = f"{x:,.{dec}f}"
    return s.replace(",", "X").replace(".", ",").replace("X", ".")


def redondea_centena(x):
    return int(round(x / 100.0) * 100)


def tabla(cabecera, filas):
    out = ["| " + " | ".join(cabecera) + " |", "|" + "|".join(["---"] * len(cabecera)) + "|"]
    for f in filas:
        out.append("| " + " | ".join(str(c).replace("|", "/") for c in f) + " |")
    return "\n".join(out)


VIAS = {r["codigo"]: r for r in lee("vias.csv")}
NOMBRE_VIA = {"AR": "Autorreferencia", "MF": "Medicina de familia y comunitaria",
              "EF": "Enfermería familiar y comunitaria", "PED": "Pediatría", "MAT": "Matrona",
              "TS": "Trabajo social sanitario", "MAH": "Medicina de atención hospitalaria",
              "RHB": "Retorno desde rehabilitación hospitalaria"}
NIVEL = {"1": "Nivel 1", "2": "Nivel 2", "3": "Nivel 3"}


def vias_txt(codigos):
    return ", ".join(NOMBRE_VIA[c] for c in codigos.split(",") if c)


def niveles_txt(n):
    return " y ".join(NIVEL[x] for x in n.split(",") if x) if n else "no aplica"


def citas_fuentes(ids):
    ids = [i.strip() for i in ids.split(",") if i.strip()]
    return (" [" + "; ".join("@" + i for i in ids) + "]") if ids else ""


def gen_tablas(mod):
    M = lee("matriz.csv")
    P = lee("programas.csv")
    I = lee("indicadores.csv")
    PAR = lee("parametros.csv")
    horas = {p["id"]: p["horas_edicion"] for p in mod["programas"]}
    g = {}

    inc = [r for r in M if r["tipo"] == "inclusion"]
    g["TABLA_ACCESO_DIRECTO"] = tabla(
        ["Id", "Proceso", "Condición de acceso", "Vías de entrada"],
        [[r["id"], r["proceso"] + citas_fuentes(r["fuentes"]), r["condicion_acceso"], vias_txt(r["vias"])] for r in inc])
    exc = [r for r in M if r["tipo"] == "exclusion"]
    g["TABLA_EXCLUSIONES"] = tabla(
        ["Id", "Situación excluida del acceso directo", "Circuito alternativo"],
        [[r["id"], r["proceso"], r["circuito_alternativo"]] for r in exc])
    der = [r for r in M if r["tipo"] == "derivacion"]
    g["TABLA_DERIVACION"] = tabla(
        ["Id", "Proceso o situación", "Condición de entrada", "Vías de entrada"],
        [[r["id"], r["proceso"] + citas_fuentes(r["fuentes"]), r["condicion_acceso"], vias_txt(r["vias"])] for r in der])
    g["MATRIZ_COMPLETA"] = tabla(
        ["Id", "Tipo", "Proceso o situación", "Condición", "Vías", "Nivel", "Programa", "Circuito alternativo"],
        [[r["id"], {"inclusion": "Acceso directo", "derivacion": "Solo derivación", "exclusion": "Excluido del acceso directo"}[r["tipo"]],
          r["proceso"], r["condicion_acceso"] or "no aplica", vias_txt(r["vias"]) or "no aplica",
          niveles_txt(r["nivel"]), r["programa"] or "no aplica", r["circuito_alternativo"] or "no aplica"] for r in M])
    g["TABLA_VIAS"] = tabla(
        ["Vía de entrada", "Admitida", "Procesos de la matriz", "Requisito documental", "Circuito"],
        [[r["via"], r["admitida"], r["procesos"], r["requisito_documental"], r["circuito"]] for r in VIAS.values()])

    grp = [p for p in P if p["tipo"] == "grupal"]
    com = [p for p in P if p["tipo"] == "comunitario"]
    g["TABLA_PROGRAMAS_GRUPALES"] = tabla(
        ["Id", "Programa", "Liderazgo", "Grupo", "Sesiones", "Horas de fisioterapia por edición", "Ediciones por 10.000 habitantes y año, escenario central"],
        [[p["id"], p["nombre"] + citas_fuentes(p["evidencia"]), p["liderazgo"], p["tamano_grupo"], p["sesiones"],
          num(horas[p["id"]]), p["ediciones_central"]] for p in grp])
    g["TABLA_PROGRAMAS_COMUNITARIOS"] = tabla(
        ["Id", "Intervención comunitaria", "Población", "Liderazgo", "Horas de fisioterapia por edición", "Ediciones por 10.000 habitantes y año, escenario central"],
        [[p["id"], p["nombre"], p["poblacion_diana"], p["liderazgo"], num(horas[p["id"]]), p["ediciones_central"]] for p in com])
    fichas = []
    for p in P:
        fichas.append(f"### Ficha {p['id']}. {p['nombre']}\n")
        fichas.append(tabla(["Campo", "Contenido"], [
            ["Tipo", "Intervención grupal" if p["tipo"] == "grupal" else "Intervención comunitaria"],
            ["Población diana", p["poblacion_diana"]],
            ["Criterios de inclusión", p["criterios_inclusion"]],
            ["Procesos de la matriz del anexo C", p["procesos"] or "no aplica"],
            ["Liderazgo", p["liderazgo"]],
            ["Tamaño del grupo", p["tamano_grupo"]],
            ["Diseño", p["diseno"]],
            ["Sesiones por edición", p["sesiones"]],
            ["Duración de cada sesión, en horas", num(float(p["duracion_sesion_h"]), 2)],
            ["Fracción de la sesión a cargo de fisioterapia", num(float(p["fraccion_fisio"]), 2)],
            ["Horas de preparación y evaluación por edición", p["horas_preparacion"]],
            ["Horas de fisioterapia por edición", num(horas[p["id"]], 1)],
            ["Ediciones por 10.000 habitantes y año: bajo, central y alto", f"{p['ediciones_bajo']}, {p['ediciones_central']} y {p['ediciones_alto']}"],
            ["Evidencia de referencia", (citas_fuentes(p["evidencia"]).strip() or "no aplica")],
        ]))
        fichas.append("")
    g["FICHAS_PROGRAMAS"] = "\n".join(fichas)

    for bloque, clave in (("Dirección", "DIRECCION"), ("Ejecución", "EJECUCION"), ("Resultados", "RESULTADOS")):
        g[f"TABLA_INDICADORES_{clave}"] = tabla(
            ["Id", "Indicador", "Criterio EFQM", "Fuente de datos", "Estándar propuesto"],
            [[r["id"], r["nombre"], r["criterio_efqm"], r["fuente_datos"], r["estandar"]] for r in I if r["bloque"] == bloque])
    fi = []
    for r in I:
        fi.append(f"### Ficha {r['id']}. {r['nombre']}\n")
        fi.append(tabla(["Campo", "Contenido"], [
            ["Bloque y criterio EFQM", f"{r['bloque']}. Criterio {r['criterio_efqm']}"],
            ["Definición", r["definicion"]], ["Fórmula", r["formula"]], ["Numerador", r["numerador"]],
            ["Denominador", r["denominador"]], ["Fuente de datos", r["fuente_datos"]],
            ["Periodicidad", r["periodicidad"]], ["Estándar propuesto", r["estandar"]],
            ["Responsable del registro", r["responsable"]]]))
        fi.append("")
    g["FICHAS_INDICADORES"] = "\n".join(fi)

    def fmt_par(r, k):
        v = float(r[k])
        return num(v, 0) if v >= 10 or v == int(v) else num(v, 2)
    g["TABLA_PARAMETROS"] = tabla(
        ["Símbolo", "Parámetro", "Unidad", "Bajo", "Central", "Alto", "Tipo", "Justificación"],
        [[r["simbolo"], r["nombre"], r["unidad"], fmt_par(r, "bajo"), fmt_par(r, "central"), fmt_par(r, "alto"),
          r["tipo"].capitalize(), r["justificacion"] + citas_fuentes(r["fuentes"])] for r in PAR])
    E = mod["escenarios"]
    g["TABLA_ESCENARIOS"] = tabla(
        ["Componente, en horas anuales por 10.000 habitantes", "Escenario bajo", "Escenario central", "Escenario alto"],
        [["Consulta individual", *[num(E[n]["h_ind"]) for n in modelo.NIVELES]],
         ["Programas grupales y comunitarios", *[num(E[n]["h_grp"]) for n in modelo.NIVELES]],
         ["Atención domiciliaria", *[num(E[n]["h_dom"]) for n in modelo.NIVELES]],
         ["Carga total", *[num(E[n]["total"]) for n in modelo.NIVELES]],
         ["Capacidad asistencial por fisioterapeuta, en horas", *[num(E[n]["capacidad"]) for n in modelo.NIVELES]],
         ["Fisioterapeutas por 10.000 habitantes", *[num(E[n]["fte_10000"], 2) for n in modelo.NIVELES]],
         ["Habitantes por fisioterapeuta", *[num(E[n]["hab_por_fisio"]) for n in modelo.NIVELES]]])
    g["TABLA_SENSIBILIDAD"] = tabla(
        ["Parámetro", "Habitantes por fisioterapeuta con el valor bajo", "Habitantes por fisioterapeuta con el valor alto", "Amplitud"],
        [[f"{s['id']}. {s['nombre']}", num(s["hab_bajo"]), num(s["hab_alto"]), num(s["amplitud"])] for s in mod["sensibilidad"]])
    TXT_CAMBIO = {"S65": "población de 65 años o más del 30 %", "td": "visita domiciliaria de 1,75 horas con desplazamiento",
                  "D": "necesidad domiciliaria del 5 %", "P": "2.400 personas con consulta musculoesquelética por 10.000 habitantes",
                  "Tp": "tiempo protegido del 25 %"}
    g["TABLA_AJUSTES"] = tabla(
        ["Tipo de zona", "Parámetros modificados sobre el escenario central", "Fisioterapeutas por 10.000 habitantes", "Habitantes por fisioterapeuta"],
        [[a["nombre"], ", ".join(TXT_CAMBIO[k] for k in a["cambios"]) or "ninguno",
          num(a["fte_10000"], 2), num(a["hab_por_fisio"])] for a in mod["ajustes"]])

    # valores sueltos para el texto
    for n in modelo.NIVELES:
        g[f"M_{n.upper()}_HAB"] = num(E[n]["hab_por_fisio"])
        g[f"M_{n.upper()}_HAB_R"] = num(redondea_centena(E[n]["hab_por_fisio"]))
        g[f"M_{n.upper()}_FTE"] = num(E[n]["fte_10000"], 2)
    aj = {a["id"]: a for a in mod["ajustes"]}
    for k, a in aj.items():
        g[f"M_{k}_HAB"] = num(a["hab_por_fisio"])
        g[f"M_{k}_HAB_R"] = num(redondea_centena(a["hab_por_fisio"]))
    CORTO = {"P": "las personas que consultan por un problema musculoesquelético", "F1": "la fracción que accede a fisioterapia",
             "F2": "la fracción que necesita tratamiento individual", "V": "las consultas de seguimiento", "t": "la duración de cada consulta",
             "S65": "la población de 65 años o más", "D": "la necesidad de atención domiciliaria", "Vd": "las visitas domiciliarias por persona",
             "td": "la duración de la visita domiciliaria", "J": "la jornada anual", "Tp": "el tiempo protegido", "PG": "las ediciones de los programas"}
    top = mod["sensibilidad"][:3]
    g["M_SENS_TOP"] = ", ".join(CORTO[s["id"]] for s in top[:-1]) + " y " + CORTO[top[-1]["id"]]

    C = lee("cifras.csv", "|") if (DATOS / "cifras.csv").exists() else []
    # filas del modelo, calculadas en cada construcción para que nunca queden desfasadas
    for n, nom in (("bajo", "bajo"), ("central", "central"), ("alto", "alto")):
        C.append({"seccion": "9.2", "valor": num(E[n]["hab_por_fisio"]), "descripcion": f"Habitantes por fisioterapeuta en el escenario {nom}",
                  "fuente": "modelo", "anio": "No aplica", "definicion": "Resultado del modelo de demanda con los parámetros de la tabla 9.1", "estado": "Cálculo reproducible"})
    C.append({"seccion": "9.4", "valor": num(aj["T4"]["hab_por_fisio"]), "descripcion": "Habitantes por fisioterapeuta en la zona rural dispersa, envejecida y con alta dependencia",
              "fuente": "modelo", "anio": "No aplica", "definicion": "Resultado del modelo con el ajuste territorial de la tabla 9.5", "estado": "Cálculo reproducible"})
    g["TABLA_CIFRAS"] = tabla(
        ["Sección", "Cifra", "Qué mide", "Fuente", "Año del dato", "Definición", "Estado de la fuente"],
        [[c["seccion"], c["valor"], c["descripcion"], citas_fuentes(c["fuente"]).strip() if c["fuente"] not in ("modelo", "diseño") else ("Modelo de la sección 9" if c["fuente"] == "modelo" else "Parámetro de diseño del anexo A"),
          c["anio"], c["definicion"], c["estado"]] for c in C])
    g["TABLA_ESTADO_REFERENCIAS"] = "{{TABLA_ESTADO_REFERENCIAS}}"   # se resuelve tras numerar las citas
    return g


def tabla_estado(bib):
    from collections import Counter
    nombre = {"Verificada": "Verificada", "Localizada": "Pendiente de cotejo", "Secundaria": "Secundaria"}
    c = Counter(nombre.get(b["estado"], b["estado"]) for b in bib)
    filas = [[k, v, ", ".join(str(b["n"]) for b in bib if nombre.get(b["estado"], b["estado"]) == k)]
             for k, v in sorted(c.items())]
    filas.append(["Total", sum(c.values()), ""])
    return tabla(["Estado", "Referencias", "Números en la lista de referencias"], filas)


def resuelve_citas(texto, refs):
    orden, vistos = [], {}

    def repl(m):
        ids = [x.strip().lstrip("@") for x in m.group(1).split(";")]
        nums = []
        for i in ids:
            if i not in refs:
                raise SystemExit(f"Cita desconocida: {i}")
            if i not in vistos:
                orden.append(i)
                vistos[i] = len(orden)
            nums.append(vistos[i])
        nums = sorted(set(nums))
        # comprime rangos: 3,4,5 -> 3-5
        partes, ini = [], None
        for k, n in enumerate(nums):
            if ini is None:
                ini = n
            if k == len(nums) - 1 or nums[k + 1] != n + 1:
                partes.append(f"{ini}-{n}" if n - ini >= 2 else (f"{ini}, {n}" if n != ini else f"{n}"))
                ini = None
        return "[" + ", ".join(partes) + "]"
    texto = re.sub(r"\[(@[^\]]+)\]", repl, texto)
    return texto, orden


def main():
    mod = json.loads(__import__("subprocess").run(
        [sys.executable, str(Path(__file__).parent / "modelo.py"), "--json"],
        capture_output=True, text=True, check=True).stdout)
    gen = gen_tablas(mod)
    partes = []
    for f in sorted(FUENTE.glob("*.md")):
        partes.append(f.read_text(encoding="utf-8").strip())
    texto = "\n\n".join(partes) + "\n"

    def sust(m):
        k = m.group(1)
        if k not in gen:
            raise SystemExit(f"Marcador desconocido: {k}")
        return gen[k]
    # dos pasadas: las tablas generadas pueden contener citas pero no marcadores
    texto = re.sub(r"\{\{([A-Z0-9_]+)\}\}", sust, texto)
    refs = {r["id"]: r for r in lee("referencias.csv", "|")}
    texto, orden = resuelve_citas(texto, refs)
    bib = [{"n": k + 1, **refs[i]} for k, i in enumerate(orden)]
    texto = texto.replace("{{TABLA_ESTADO_REFERENCIAS}}", tabla_estado(bib))
    lineas = ["# Referencias", ""]
    for b in bib:
        marca = "" if b["estado"].startswith("Verificada") else (
            " Fuente secundaria." if b["estado"] == "Secundaria" else " Pendiente de cotejo en la fuente original.")
        url = b["url"]
        if url.startswith("https://doi.org/") and "doi:" in b["cita"]:
            enlace = ""                      # el DOI ya figura en la cita
        elif url.startswith("http"):
            enlace = f" Disponible en: {url}."
        else:
            enlace = f" {url[0].upper()}{url[1:]}." if url else ""
        lineas.append(f"{b['n']}. {b['cita'].rstrip('.')}.{enlace}{marca}")
    texto = texto.rstrip() + "\n\n" + "\n".join(lineas) + "\n"
    (BUILD / "documento.md").write_text(texto, encoding="utf-8")
    json.dump(bib, open(BUILD / "bibliografia.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print(f"documento.md: {len(texto.split())} palabras, {len(bib)} referencias citadas")


if __name__ == "__main__":
    main()
