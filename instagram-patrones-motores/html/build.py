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



# ======================================================= pieza «¿Push o pull?»

SERIE_PP = "PUSH O PULL · RESPUESTA A VUESTROS COMENTARIOS"


def header_pp(num, total=3):
    return f"""<div class="hd">
  <div class="hd-num"><i class="plus"></i>{num:02d} / {total:02d}</div>
  <div class="hd-tag">{SERIE_PP}</div>
</div>"""


def duo():
    """Tira doble: la misma escala de exigencia en empuje y en tracción."""
    push = F.render_set("pushup")
    pull = F.render_set("pull")
    filas = [
        ("Empuje", [(push[0][1], "Pared", "Mínima"),
                    (push[1][1], "Inclinado", "Baja"),
                    (push[2][1], "Rodillas", "Media"),
                    (push[3][1], "Suelo", "Alta")]),
        ("Tracción", [(pull[0][1], "Goma", "Ajustable"),
                      (pull[1][1], "Remo invertido", "Baja–media"),
                      (pull[2][1], "Dominada asistida", "Alta"),
                      (pull[3][1], "Dominada", "Máxima")]),
    ]
    out = []
    for lbl, celdas in filas:
        cs = "".join(
            f'<div class="duo-cell">{svg}<div class="cap">{e(cap)}</div>'
            f'<div class="load">{e(load)}</div></div>'
            for svg, cap, load in celdas)
        out.append(f'<div class="duo-row"><div class="duo-lbl">{e(lbl)}</div>{cs}</div>')
    return f'<div class="duo">{"".join(out)}</div>'


def finds(items):
    out = []
    for n, h, p in items:
        out.append(f'<div class="find"><div class="n">{n}</div><div>'
                   f'<h3>{e(h)}</h3><p>{e(p)}</p></div></div>')
    return f'<div class="finds">{"".join(out)}</div>'


def warn(titulo, detalle):
    return (f'<div class="warn"><div class="t">{e(titulo)}</div>'
            f'<div class="d">{e(detalle)}</div></div>')


def matrix(filas):
    celdas = ['<div class="mh"></div>', '<div class="mh">Empuje</div>',
              '<div class="mh">Tracción</div>']
    for cab, izq, der in filas:
        celdas.append(f'<div class="mh">{e(cab)}</div>')
        for t, sub in (izq, der):
            celdas.append(f'<div><div class="mt">{e(t)}</div>'
                          f'<div class="ms">{e(sub)}</div></div>')
    return f'<div class="matrix">{"".join(celdas)}</div>'


def build_pp_portada():
    body = f"""<div class="post">
{header_pp(1)}
<div class="body">
  <div class="kicker">Lo pedisteis en comentarios</div>
  <h1 class="title">¿PUSH O<br><span class="hi">PULL?</span></h1>
  <p class="sub">En los Big Five metí el push-up como patrón de miembro superior y
  varios me disteis caña: «¿y las dominadas?», «¿y el remo?». Tenéis parte de razón,
  pero no por el motivo que parece. Vamos con la literatura delante.</p>
  {duo()}
  <div class="strip-note">La exigencia es relativa al peso corporal y a la tensión de
  la goma, no comparable ejercicio a ejercicio. Lo que importa aquí es el recorrido
  completo de cada fila.</div>
  {band("La pregunta no es push o pull. Es cuál de los dos puedes ajustar a la "
        "persona que tienes delante.")}
  <div class="concl to-bottom">Los dos patrones cubren el rango entero de exigencia.
  La diferencia está en lo que necesitas para recorrerlo.</div>
  <div class="swipe">Desliza →</div>
</div>
{footer()}
</div>"""
    return page("¿Push o pull? — Portada", body)


def build_pp_evidencia():
    items = [
        ("01", "Ningún modo de ejercicio gana",
         "34 pacientes con dolor subacromial, excéntrico frente a concéntrico, 8 semanas: "
         "sin diferencias entre grupos. Los dos mejoraron."),
        ("02", "Ni siquiera la cirugía gana al ejercicio",
         "La revisión Cochrane de reparación de manguito: probablemente poca o ninguna "
         "mejora frente a tratamiento no quirúrgico con ejercicio."),
        ("03", "Dentro de una familia hay más variación que entre familias",
         "Tres agarres de la misma dominada cargan estructuras distintas. El supinado "
         "es el que más carga proporcionalmente el manguito."),
        ("04", "Y un detalle cambia el mapa entero",
         "Agarre pronado frente a neutro: 60 % frente a 37 % de activación máxima en "
         "trapecio medio. Mismo ejercicio, otro reparto."),
    ]
    body = f"""<div class="post dense">
{header_pp(2)}
<div class="body">
  <h1 class="title">LO QUE DICE<br><span class="hi">LA LITERATURA</span></h1>
  {finds(items)}
  {warn("Ojo: esto no es literatura clínica",
        "Los dos trabajos de dominadas miden 11 y 19 hombres jóvenes, sanos y "
        "entrenados, con electromiografía y modelos musculoesqueléticos. Describen "
        "mecánica, no pronóstico. Ninguno midió dolor ni lesiones.")}
  <div class="concl to-bottom">Ninguno de estos trabajos te dice qué ejercicio poner.
  Lo que te dicen es que la elección no se juega en la dirección del movimiento.</div>
</div>
{refs([
  "Urbanczyk CA, Prinold JAI, Reilly P, Bull AMJ. Avoiding high-risk rotator cuff loading: muscle force during three pull-up techniques. Scand J Med Sci Sports. 2020;30(11):2205-2214. doi:10.1111/sms.13780.",
  "Dickie JA, Faulkner JA, Barnes MJ, Lark SD. Electromyographic analysis of muscle activation during pull-up variations. J Electromyogr Kinesiol. 2016;32:30-36. doi:10.1016/j.jelekin.2016.11.004.",
  "Blume C, Wang-Price S, Trudelle-Jackson E, Ortiz A. Comparison of eccentric and concentric exercise interventions in adults with subacromial impingement syndrome. Int J Sports Phys Ther. 2015;10(4):441-455. PMCID: PMC4527192.",
  "Karjalainen TV, Jain NB, Heikkinen J, Johnston RV, Page CM, Buchbinder R. Surgery for rotator cuff tears. Cochrane Database Syst Rev. 2019;12(12):CD013502. doi:10.1002/14651858.CD013502.",
])}
{footer()}
</div>"""
    return page("¿Push o pull? — La literatura", body)


def build_pp_versatilidad():
    m = matrix([
        ("Cadena cerrada",
         ("Push-up", "De la pared al suelo. Sin material."),
         ("Dominada", "Empieza en el 100 % del peso corporal.")),
        ("Cadena abierta",
         ("Press", "Carga externa, graduable al gramo."),
         ("Remo con goma", "Graduable desde casi cero.")),
    ])
    body = f"""<div class="post">
{header_pp(3)}
<div class="body">
  <h1 class="title">LA CLAVE NO ES<br><span class="hi">LA DIRECCIÓN</span></h1>
  <p class="sub">Empuje y tracción no compiten: cruzan otros dos ejes que sí deciden
  si un ejercicio te sirve con un paciente concreto.</p>
  {m}
  {cards([
    ("Los dos son versátiles",
     "Cada familia cubre el rango entero, de la carga mínima a la máxima."),
    ("Pero no con lo mismo",
     "El empuje se regresa sin material. La tracción necesita goma o barra baja."),
  ])}
  {band("No hay ejercicio bueno porque sí. Hay ejercicios que puedes ajustar y "
        "ejercicios que no.")}
  <div class="concl">Si echabais en falta el pull, teníais razón a medias: el remo con
  goma es tan graduable como el push-up de pared. La dominada, no.</div>
  <h2 class="h2">Tres preguntas antes de elegir</h2>
  <div>
  {finds([
    ("01", "¿Puedes bajarlo hasta donde tolera hoy?",
     "Si la versión más fácil ya duele, ese patrón no entra todavía."),
    ("02", "¿Puedes subirlo hasta donde necesita llegar?",
     "Un ejercicio sin techo se queda corto en cuanto la persona mejora."),
    ("03", "¿Lo va a repetir?",
     "El que no se hace en casa no dosifica nada."),
  ])}
  </div>
  <div class="note to-bottom">Ningún ejercicio ha demostrado superioridad general sobre
  otro. La elección depende de los objetivos, la tolerancia y el contexto de cada
  persona.</div>
</div>
{footer()}
</div>"""
    return page("¿Push o pull? — La versatilidad", body)


def main():
    os.makedirs(OUT, exist_ok=True)
    written = []
    files = [("00-portada.html", build_cover())]
    for d in POSTS:
        files.append((d["file"], build_pattern(d)))
    files.append(("06-mensaje-final.html", build_closing()))
    files.append(("07-pushpull-portada.html", build_pp_portada()))
    files.append(("08-pushpull-literatura.html", build_pp_evidencia()))
    files.append(("09-pushpull-versatilidad.html", build_pp_versatilidad()))
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
