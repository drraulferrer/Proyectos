#!/usr/bin/env python3
"""modelo.py. Modelo de demanda de fisioterapia de atención primaria (sección 9 de SPEC.md).

Carga horaria anual por cada 10.000 habitantes:
  H_ind = P x F1 x (1 + F2 x V) x t        consulta individual (primera consulta y seguimiento)
  H_grp = suma de ediciones x horas por edición de cada programa del anexo A
  H_dom = 10.000 x S65 x D x Vd x td       atención domiciliaria
Capacidad asistencial de un fisioterapeuta a tiempo completo:
  C = J x (1 - Tp)
Dotación:
  FTE por 10.000 = (H_ind + H_grp + H_dom) / C
  habitantes por fisioterapeuta = 10.000 / FTE

Uso:
  python3 modelo.py            imprime escenarios, sensibilidad y ajustes territoriales
  python3 modelo.py --json     vuelca los resultados que consumen generar.py y validar.py
"""
import csv, json, sys
from pathlib import Path

DATOS = Path(__file__).resolve().parent.parent / "datos"
NIVELES = ("bajo", "central", "alto")


def carga_parametros():
    rows = csv.DictReader(open(DATOS / "parametros.csv", encoding="utf-8"), delimiter=";")
    return {r["id"]: {k: (float(r[k]) if k in NIVELES else r[k]) for k in r} for r in rows}


def carga_programas():
    rows = list(csv.DictReader(open(DATOS / "programas.csv", encoding="utf-8"), delimiter=";"))
    for r in rows:
        for k in ("sesiones", "duracion_sesion_h", "fraccion_fisio", "horas_preparacion",
                  "ediciones_bajo", "ediciones_central", "ediciones_alto"):
            r[k] = float(r[k])
        r["horas_edicion"] = r["sesiones"] * r["duracion_sesion_h"] * r["fraccion_fisio"] + r["horas_preparacion"]
    return rows


def calcula(v, programas, nivel_programas):
    h_ind = v["P"] * v["F1"] * (1 + v["F2"] * v["V"]) * v["t"]
    # El programa de caídas y fragilidad escala con la población de 65 años o más:
    # sus ediciones de referencia se definen para S65 = 0,20.
    escala = {"PG-01": v["S65"] / 0.20}
    h_grp = sum(p[f"ediciones_{nivel_programas}"] * p["horas_edicion"] * escala.get(p["id"], 1)
                for p in programas)
    h_dom = 10000 * v["S65"] * v["D"] * v["Vd"] * v["td"]
    cap = v["J"] * (1 - v["Tp"])
    total = h_ind + h_grp + h_dom
    fte = total / cap
    return {"h_ind": h_ind, "h_grp": h_grp, "h_dom": h_dom, "total": total,
            "capacidad": cap, "fte_10000": fte, "hab_por_fisio": 10000 / fte}


def escenario(par, programas, nivel):
    return calcula({k: par[k][nivel] for k in par}, programas, nivel)


def sensibilidad(par, programas):
    """Análisis univariante: cada parámetro en su valor bajo y alto, el resto en el central."""
    base = {k: par[k]["central"] for k in par}
    filas = []
    for k in par:
        lo = calcula({**base, k: par[k]["bajo"]}, programas, "central")["hab_por_fisio"]
        hi = calcula({**base, k: par[k]["alto"]}, programas, "central")["hab_por_fisio"]
        filas.append({"id": k, "nombre": par[k]["nombre"], "bajo": par[k]["bajo"],
                      "alto": par[k]["alto"], "hab_bajo": lo, "hab_alto": hi,
                      "amplitud": abs(lo - hi)})
    # programas grupales como bloque
    lo = calcula(base, programas, "bajo")["hab_por_fisio"]
    hi = calcula(base, programas, "alto")["hab_por_fisio"]
    filas.append({"id": "PG", "nombre": "Ediciones de programas grupales y comunitarios (anexo A)",
                  "bajo": "bajo", "alto": "alto", "hab_bajo": lo, "hab_alto": hi, "amplitud": abs(lo - hi)})
    return sorted(filas, key=lambda f: -f["amplitud"])


# Ajustes territoriales: se cambian solo los parámetros que la sección 9.4 admite como factores.
AJUSTES = [
    {"id": "T0", "nombre": "Zona de referencia", "cambios": {}},
    {"id": "T1", "nombre": "Zona envejecida", "cambios": {"S65": 0.30}},
    {"id": "T2", "nombre": "Zona rural dispersa", "cambios": {"td": 1.75}},
    {"id": "T3", "nombre": "Zona rural dispersa y envejecida", "cambios": {"S65": 0.30, "td": 1.75}},
    {"id": "T4", "nombre": "Zona rural dispersa y envejecida con alta dependencia", "cambios": {"S65": 0.30, "td": 1.75, "D": 0.05}},
    {"id": "T5", "nombre": "Zona con alta carga de incapacidad temporal musculoesquelética", "cambios": {"P": 2400}},
    {"id": "T6", "nombre": "Centro docente o con programas comunitarios extensos", "cambios": {"Tp": 0.25}},
]


def ajustes(par, programas):
    base = {k: par[k]["central"] for k in par}
    out = []
    for a in AJUSTES:
        r = calcula({**base, **a["cambios"]}, programas, "central")
        out.append({**a, **r})
    return out


def main():
    par, prog = carga_parametros(), carga_programas()
    res = {n: escenario(par, prog, n) for n in NIVELES}
    sens = sensibilidad(par, prog)
    aj = ajustes(par, prog)
    if "--json" in sys.argv:
        print(json.dumps({"escenarios": res, "sensibilidad": sens, "ajustes": aj,
                          "programas": [{"id": p["id"], "horas_edicion": p["horas_edicion"]} for p in prog]},
                         ensure_ascii=False, indent=1))
        return
    for n in NIVELES:
        r = res[n]
        print(f"{n:8} ind {r['h_ind']:7.0f} h  grp {r['h_grp']:5.0f} h  dom {r['h_dom']:6.0f} h  "
              f"total {r['total']:7.0f} h  cap {r['capacidad']:6.0f} h  FTE/10.000 {r['fte_10000']:.2f}  "
              f"1 por {r['hab_por_fisio']:,.0f} hab")
    print("\nSensibilidad (resto de parámetros en el valor central):")
    for f in sens:
        print(f"  {f['id']:4} {f['hab_bajo']:8,.0f} .. {f['hab_alto']:8,.0f}  ({f['nombre'][:60]})")
    print("\nAjustes territoriales:")
    for a in aj:
        print(f"  {a['id']} {a['nombre'][:55]:55} 1 por {a['hab_por_fisio']:,.0f}  (FTE {a['fte_10000']:.2f})")
    for p in prog:
        print(f"  {p['id']} horas por edición {p['horas_edicion']:.1f}")


if __name__ == "__main__":
    main()
