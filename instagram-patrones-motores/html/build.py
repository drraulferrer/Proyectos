#!/usr/bin/env python3
"""Genera las siete piezas de la serie «Los Big Five» en HTML autónomo.

Cada archivo mide exactamente 1080 × 1350 px y no depende de red: la fuente
Montserrat y las figuras SVG van incrustadas o servidas en local.
"""
import html
import os

import figures as F

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "dist")

SERIE = "BIG FIVE · SI SOLO PUDIERA ELEGIR UNO"
BRAND = "@_RAULFERRER"
SAVE = "GUARDA ESTE POST"


def e(s):
    return html.escape(s, quote=False)


def page(title, body, extra_css=""):
    return f"""<!DOCTYPE html>
<html lang="es"><head>
<meta charset="utf-8">
<title>{e(title)}</title>
<link rel="stylesheet" href="../montserrat.css">
<link rel="stylesheet" href="../kinetic.css">
{extra_css}
</head><body>
{body}
</body></html>
"""


def header(num, total=5):
    return f"""<div class="hd">
  <div class="hd-num"><i class="plus"></i>{num:02d} / {total:02d}</div>
  <div class="hd-tag">{SERIE}</div>
</div>"""


def footer():
    return f"""<div class="ft">
  <span class="brand">{BRAND}</span>
  <span class="save">{SAVE} ↓</span>
</div>"""


def strip(pattern, anat_tag):
    cells = []
    for i, (label, s) in enumerate(F.render_set(pattern), start=1):
        cells.append(f'<div class="cell"><div class="n">{i}</div>{s}'
                     f'<div class="cap">{e(label)}</div></div>')
    return (f'<div class="strip">{"".join(cells)}</div>'
            f'<div class="anat-tag">{e(anat_tag)}</div>')


def cards(items):
    out = []
    for h, p in items:
        out.append(f'<div class="card"><h3>{e(h)}</h3><p>{e(p)}</p></div>')
    return f'<div class="cards">{"".join(out)}</div>'


def vars_box(label, items):
    sep = '<b>|</b>'
    return (f'<div class="vars"><div class="lbl">{e(label)}</div>'
            f'<div class="items">{sep.join(e(i) for i in items)}</div></div>')


def band(text):
    return f'<div class="band"><span class="q">“</span>{e(text)}</div>'


def refs(items):
    lis = "".join(f"<li>{e(r)}</li>" for r in items)
    return (f'<div class="refs"><div class="lbl">Referencias</div>'
            f'<ol>{lis}</ol></div>')


# =========================================================== contenido

POSTS = [
    dict(
        file="01-sentadilla.html", num=1, pattern="squat",
        title=["LA", "SENTADILLA"], hi=1,
        sub="El ejercicio estrella del miembro inferior.",
        anat="CADERA / RODILLA / TOBILLO",
        note="Una familia de variantes adaptable a la capacidad, los objetivos y el "
             "contexto clínico. No es una progresión obligatoria.",
        cards=[
            ("Transferencia funcional",
             "Sentarse, levantarse, agacharse y elevar el propio cuerpo."),
            ("Gran capacidad de adaptación",
             "Apoyo, profundidad, carga, velocidad, asistencia y estabilidad."),
            ("Demanda multisegmentaria",
             "Tobillo, rodilla, cadera y tronco en cadena cinética cerrada."),
            ("Dosificación progresiva",
             "De la recuperación funcional a la fuerza y la potencia."),
        ],
        vars_label="VARIABLES QUE CAMBIAN LA DEMANDA",
        vars=["Profundidad", "inclinación del tronco", "desplazamiento tibial",
              "carga", "velocidad", "anchura de apoyo", "asistencia"],
        band="Su valor no está en una técnica única, sino en la posibilidad de "
             "modificar el patrón sin perder su significado funcional.",
        concl="Especialmente útil por su combinación de función, escalabilidad "
              "y capacidad de carga.",
        refs=[
            "Straub RK, Powers CM. A Biomechanical Review of the Squat Exercise: Implications for Clinical Practice. Int J Sports Phys Ther. 2024;19(4):490-501. doi:10.26603/001c.94600.",
            "Escamilla RF. Knee biomechanics of the dynamic squat exercise. Med Sci Sports Exerc. 2001;33(1):127-141. doi:10.1097/00005768-200101000-00020.",
            "Schoenfeld BJ. Squatting kinematics and kinetics and their application to exercise performance. J Strength Cond Res. 2010;24(12):3497-3506. doi:10.1519/JSC.0b013e3181bac2d7.",
        ],
    ),
    dict(
        file="02-push-up.html", num=2, pattern="pushup",
        title=["EL", "PUSH-UP"], hi=1,
        sub="El ejercicio estrella del miembro superior: un patrón de empuje en "
            "cadena cinética cerrada, de la pared al alto rendimiento.",
        anat="ESCÁPULA / HOMBRO / CODO",
        note="Mayor demanda relativa, no necesariamente mayor utilidad clínica. "
             "Se puede avanzar, retroceder o cambiar de variante.",
        cards=[
            ("Carga fácilmente graduable",
             "La inclinación cambia el peso corporal que soportas."),
            ("Integración escapulohumeral",
             "Escápula, hombro, codo y tronco entrenan juntos."),
            ("Cadena cinética cerrada",
             "Manos apoyadas: puede facilitar estabilidad y coactivación."),
            ("Muchas variantes",
             "Manos, superficie, inclinación, velocidad y carga."),
        ],
        vars_label="VARIABLES MODIFICABLES",
        vars=["Inclinación", "altura del apoyo", "posición de manos", "amplitud",
              "velocidad", "estabilidad", "carga externa", "componente plus"],
        band="Más que un ejercicio de pectoral: una familia de tareas para entrenar "
             "el empuje, la estabilidad y el control escapular.",
        concl="Su fortaleza es mantener un mismo patrón funcional mientras cambia "
              "radicalmente la dificultad.",
        refs=[
            "Dhahbi W, et al. Kinetic analysis of push-up exercises: a systematic review with practical recommendations. Sports Biomech. 2022;21(1):1-40. doi:10.1080/14763141.2018.1512149.",
            "Mendez-Rebolledo G, et al. Optimal activation ratio of the scapular muscles in closed kinetic chain shoulder exercises: a systematic review. J Athl Train. 2021;56(3):287-300.",
            "Lunden JB, et al. Shoulder kinematics during the push-up plus exercise. J Shoulder Elbow Surg. 2010;19(2):216-223. doi:10.1016/j.jse.2009.06.003.",
        ],
    ),
    dict(
        file="03-bisagra-de-cadera.html", num=3, pattern="hinge",
        title=["LA BISAGRA", "DE CADERA"], hi=1,
        sub="Un patrón estrella para cargar el raquis: de desplazar la cadera a "
            "levantar cargas relevantes para la vida diaria.",
        anat="CADENA POSTERIOR",
        note="Más carga o complejidad no significa automáticamente una mejor elección.",
        cards=[
            ("Transferencia al levantamiento",
             "Recoger, elevar y transportar objetos del día a día."),
            ("Entrena la cadena posterior",
             "Extensores de cadera, tronco y capacidad de levantamiento."),
            ("Carga graduable",
             "Sin peso o con cargas altas, bilateral o unilateral."),
            ("Exposición progresiva",
             "Recuperar confianza y tolerancia al levantamiento."),
        ],
        vars_label="VARIABLES MODIFICABLES",
        vars=["Altura inicial", "carga", "amplitud", "velocidad", "apoyo",
              "distancia de la carga", "fatiga", "variabilidad técnica"],
        band="El objetivo no es evitar que el raquis reciba carga, sino desarrollar "
             "capacidad para responder a demandas relevantes.",
        prudence="Los programas con peso muerto pueden mejorar dolor y función en "
                 "algunos pacientes con dolor lumbar, pero no son superiores de "
                 "forma general a otros programas de ejercicio.",
        concl="Conecta el entrenamiento de fuerza con una tarea cotidiana: levantar "
              "una carga.",
        refs=[
            "Fischer SC, et al. Effect of an Exercise Program That Includes Deadlifts on Low Back Pain. J Sport Rehabil. 2021;30(4):672-675. doi:10.1123/jsr.2020-0324.",
            "Aasa B, et al. Individualized low-load motor control exercises and education versus a high-load lifting exercise and education in patients with low back pain: a randomized controlled trial. J Orthop Sports Phys Ther. 2015;45(2):77-85. doi:10.2519/jospt.2015.5021.",
            "Tataryn N, et al. Posterior-chain resistance training compared to general exercise and walking programmes for chronic low back pain: a systematic review and meta-analysis. Sports Med Open. 2021;7:17. doi:10.1186/s40798-021-00306-w.",
        ],
    ),
    dict(
        file="04-flexion-craneocervical.html", num=4, pattern="ccf",
        title=["FLEXIÓN", "CRANEOCERVICAL"], hi=1,
        sub="Un ejercicio estrella para el control motor cervical: de la baja carga "
            "al control durante tareas funcionales.",
        anat="LONGUS COLLI / CAPITIS",
        note="Las variantes no son una secuencia obligatoria: se eligen según el objetivo.",
        cards=[
            ("Baja carga inicial",
             "Empezar con tareas específicas y de pequeña amplitud."),
            ("Entrenamiento motor",
             "Mejorar la coordinación de la musculatura flexora cervical."),
            ("Dosificación precisa",
             "Presión, duración, repeticiones, carga y tarea asociada."),
            ("Integración funcional",
             "Combinable con cabeza, ojos, brazos y tronco."),
        ],
        vars_label="VARIABLES MODIFICABLES",
        vars=["Posición", "presión", "duración", "repeticiones",
              "elevación de la cabeza", "resistencia", "doble tarea",
              "movimiento asociado"],
        band="El objetivo no es mantener la barbilla retraída todo el día, sino "
             "recuperar capacidad, coordinación y tolerancia al movimiento.",
        prudence="Puede mejorar la función de los flexores profundos y algunos "
                 "resultados clínicos, pero no hay un único ejercicio óptimo para "
                 "toda cervicalgia.",
        concl="Una puerta de entrada al entrenamiento cervical, no un sustituto de "
              "un programa completo.",
        refs=[
            "Martin-Gomez C, et al. Motor control using cranio-cervical flexion exercises versus other treatments for non-specific chronic neck pain: a systematic review and meta-analysis. Musculoskelet Sci Pract. 2019;42:52-59. doi:10.1016/j.msksp.2019.04.010.",
            "Amiri Arimi S, et al. The Effect of Different Exercise Programs on Size and Function of Deep Cervical Flexor Muscles in Patients With Chronic Nonspecific Neck Pain: A Systematic Review of Randomized Controlled Trials. Am J Phys Med Rehabil. 2017;96(8):582-588. doi:10.1097/PHM.0000000000000721.",
            "Rasmussen-Barr E, et al. Summarizing the effects of different exercise types in chronic neck pain: a systematic review and meta-analysis of systematic reviews. BMC Musculoskelet Disord. 2023.",
        ],
    ),
    dict(
        file="05-carry.html", num=5, pattern="carry",
        title=["EL CARRY", "TRANSPORTE"], hi=1,
        sub="El ejercicio estrella de la función global: caminar cargando peso, una "
            "de las tareas más completas y transferibles.",
        anat="AGARRE / TRONCO / MARCHA",
        note="La dificultad puede modificarse sin cambiar el patrón funcional.",
        cards=[
            ("Carga funcional",
             "Entrena una tarea cotidiana: transportar objetos."),
            ("Integración corporal",
             "Agarre, hombro, escápula, tronco, pelvis, cadera y marcha."),
            ("Escalable",
             "Peso, distancia, tiempo, velocidad y posición de la carga."),
            ("Alta transferencia",
             "Geriatría, dolor musculoesquelético, readaptación y fuerza."),
        ],
        vars_label="VARIABLES MODIFICABLES",
        vars=["Peso", "tiempo", "distancia", "velocidad", "unilateral o bilateral",
              "posición de la carga", "superficie", "cambios de dirección",
              "doble tarea"],
        band="Su fortaleza no está en caminar con peso, sino en entrenar a la vez "
             "estabilidad, fuerza, locomoción y capacidad funcional.",
        concl="Pocos patrones reúnen tanta transferencia a la vida diaria en una "
              "sola tarea.",
        refs=[
            "McGill SM, et al. Comparison of different strongman events: trunk muscle activation and lumbar spine motion, load, and stiffness. J Strength Cond Res. 2009;23(4):1148-1161. doi:10.1519/JSC.0b013e318198f8f7.",
            "Winwood PW, et al. Strongman vs. traditional resistance training effects on muscular function and performance. J Strength Cond Res. 2015;29(2):429-439. doi:10.1519/JSC.0000000000000629.",
            "Walsh GS, Low DC. Military load carriage effects on the gait of military personnel: a systematic review. Appl Ergon. 2021;93:103376. doi:10.1016/j.apergo.2021.103376.",
        ],
    ),
]


def build_pattern(d):
    t = d["title"]
    title_html = "".join(
        f'<span class="hi">{e(w)}</span>' if i == d["hi"] else e(w) + "<br>"
        for i, w in enumerate(t))
    prudence = f'<div class="note">{e(d["prudence"])}</div>' if d.get("prudence") else ""
    dense = " dense" if d.get("prudence") else ""
    dense += " ccf" if d["pattern"] == "ccf" else ""
    body = f"""<div class="post{dense}">
{header(d['num'])}
<div class="body">
  <h1 class="title">{title_html}</h1>
  <p class="sub">{e(d['sub'])}</p>
  {strip(d['pattern'], d['anat'])}
  <div class="strip-note">{e(d['note'])}</div>
  <h2 class="h2">¿Por qué es tan versátil?</h2>
  {cards(d['cards'])}
  {vars_box(d['vars_label'], d['vars'])}
  {band(d['band'])}
  {prudence}
  <div class="concl">{e(d['concl'])}</div>
</div>
{refs(d['refs'])}
{footer()}
</div>"""
    return page(" ".join(t), body)


def build_cover():
    tiles = [
        ("01", "MIEMBRO INFERIOR", "LA SENTADILLA", "squat"),
        ("02", "MIEMBRO SUPERIOR", "EL PUSH-UP", "pushup"),
        ("03", "CADERA Y RAQUIS", "LA BISAGRA DE CADERA", "hinge"),
        ("04", "REGIÓN CERVICAL", "FLEXIÓN CRANEOCERVICAL", "ccf"),
    ]
    cells = "".join(
        f'<div class="tile"><div class="n">{n}</div>'
        f'<div class="region">{e(r)}</div><h3>{e(t)}</h3>{F.icon_for(p)}</div>'
        for n, r, t, p in tiles)
    wide = (f'<div class="tile wide">{F.icon_for("carry")}'
            f'<div class="txt"><div class="n">05</div>'
            f'<div class="region">CUERPO COMPLETO · FUNCIÓN GLOBAL</div>'
            f'<h3>EL CARRY (TRANSPORTE)</h3></div></div>')
    body = f"""<div class="post">
<div class="hd">
  <div class="hd-num"><i class="plus"></i>SERIE</div>
  <div class="hd-tag">5 PATRONES · 5 PUBLICACIONES</div>
</div>
<div class="body">
  <div class="kicker">Si solo pudiera elegir uno…</div>
  <h1 class="title display">LOS <span class="hi">BIG FIVE</span></h1>
  <p class="sub">Cinco patrones motores con la mejor relación beneficio–versatilidad.
  No son los mejores ejercicios ni los únicos: son los que mejor se adaptan, se
  gradúan y se parecen a algo que la persona necesita hacer.</p>
  <div class="grid5">{cells}{wide}</div>
  {band("Versátil no significa superior: significa que un mismo patrón puede "
        "ajustarse a personas, objetivos y contextos muy distintos.")}
</div>
{footer()}
</div>"""
    return page("Los Big Five — Portada", body)


def build_closing():
    rows = [
        ("01", "Transferencia",
         "El patrón se parece a algo que la persona necesita hacer fuera de la consulta."),
        ("02", "Graduabilidad",
         "Puede hacerse más fácil o más difícil sin dejar de ser el mismo patrón."),
        ("03", "Rango de dosis",
         "Sirve tanto en fases de baja carga como en entrenamiento de fuerza."),
        ("04", "Aceptabilidad",
         "La persona lo entiende, lo tolera y puede repetirlo con la frecuencia suficiente."),
    ]
    rows_html = "".join(
        f'<div class="row"><div class="num">{n}</div><div>'
        f'<h3>{e(t)}</h3><p>{e(p)}</p></div></div>' for n, t, p in rows)
    picto = "".join(
        f'<div class="picto">{F.icon_for(p)}<span>{e(l)}</span></div>'
        for p, l in [("squat", "Sentadilla"), ("pushup", "Push-up"),
                     ("hinge", "Bisagra"), ("ccf", "Craneocervical"),
                     ("carry", "Carry")])
    body = f"""<div class="post">
<div class="hd">
  <div class="hd-num"><i class="plus"></i>CIERRE</div>
  <div class="hd-tag">LOS BIG FIVE · FIN DE LA SERIE</div>
</div>
<div class="body">
  <h1 class="title">NO ES EL EJERCICIO<br><span class="hi">ES LO QUE HACES CON ÉL</span></h1>
  <p class="sub">Los cinco patrones de esta serie no son los mejores ejercicios:
  son los que más fácilmente se ajustan a la persona que tienes delante.</p>
  <h2 class="h2">Cuatro criterios para elegir</h2>
  <div class="rows">{rows_html}</div>
  {band("Elegir un patrón versátil simplifica el programa; no lo sustituye.")}
  <div class="note">Ningún ejercicio ha demostrado superioridad general sobre otros.
  La selección depende de los objetivos, la tolerancia y el contexto de cada persona.</div>
  <div class="picto-row">{picto}</div>
  <div class="concl big">El mejor ejercicio suele ser el que la persona puede
  hacer, tolera y repite con la dosis suficiente.</div>
  <div class="endnote">Referencias: las citadas en cada publicación de la serie.</div>
</div>
{footer()}
</div>"""
    return page("Los Big Five — Cierre", body)


def main():
    os.makedirs(OUT, exist_ok=True)
    written = []
    files = [("00-portada.html", build_cover())]
    for d in POSTS:
        files.append((d["file"], build_pattern(d)))
    files.append(("06-mensaje-final.html", build_closing()))
    for name, content in files:
        path = os.path.join(OUT, name)
        with open(path, "w", encoding="utf-8") as fh:
            fh.write(content)
        written.append(name)
    # Índice para revisar las siete piezas de una vez
    links = "".join(f'<li><a href="{n}">{n}</a></li>' for n in written)
    with open(os.path.join(OUT, "index.html"), "w", encoding="utf-8") as fh:
        fh.write(page("Los Big Five — índice",
                      f'<div style="padding:40px;color:#eae1db;font-size:20px">'
                      f'<h1 style="margin-bottom:20px">Los Big Five</h1>'
                      f'<ul style="line-height:2">{links}</ul></div>'))
    print("\n".join(written))


if __name__ == "__main__":
    main()
