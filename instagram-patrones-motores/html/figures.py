"""Figuras humanas vectoriales para la serie «Los Big Five».

Cada pose se define por coordenadas articulares en un espacio 0-100 y se
renderiza como SVG de trazo limpio: contorno crema sobre fondo negro, con los
segmentos en foco resaltados en naranja cinético.
"""

CREAM = "#EAE1DB"
DIM = "#786D5E"
ORANGE = "#FD6242"
ORANGE_MID = "#FFB4A4"

# Segmentos del esqueleto: (punto A, punto B)
NEAR = [
    ("neck", "sho"), ("sho", "elb"), ("elb", "wri"),
    ("neck", "hip"), ("hip", "kne"), ("kne", "ank"), ("ank", "toe"),
]
FAR = [
    ("neck", "sho2"), ("sho2", "elb2"), ("elb2", "wri2"),
    ("hip", "kne2"), ("kne2", "ank2"), ("ank2", "toe2"),
]


def _line(p, a, b, color, w, opacity=1.0):
    if a not in p or b not in p:
        return ""
    x1, y1 = p[a]
    x2, y2 = p[b]
    return (f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{color}" '
            f'stroke-width="{w}" stroke-linecap="round" opacity="{opacity}"/>')


def figure(pose, highlight=(), props="", width=4.2, scale=1.0):
    """Devuelve el contenido SVG de una figura.

    pose:      dict de articulaciones -> (x, y)
    highlight: iterable de nombres de segmento ("hip-kne") a resaltar
    props:     SVG extra (silla, mancuernas, pared…) dibujado bajo la figura
    """
    p = {k: (v[0], v[1]) for k, v in pose.items()}
    hl = set(highlight)
    out = [props]

    # Halo naranja bajo los segmentos en foco
    for a, b in NEAR + FAR:
        if f"{a}-{b}" in hl:
            out.append(_line(p, a, b, ORANGE, width * 2.6, 0.28))

    # Extremidades lejanas, atenuadas
    for a, b in FAR:
        out.append(_line(p, a, b, DIM, width * 0.85))

    # Extremidades cercanas y tronco
    for a, b in NEAR:
        col = ORANGE if f"{a}-{b}" in hl else CREAM
        w = width * 1.15 if a == "neck" and b == "hip" else width
        out.append(_line(p, a, b, col, w))

    # Cabeza
    if "head" in p:
        hx, hy = p["head"]
        r = p.get("head_r", (5.2, 0))[0] if "head_r" in p else 5.2
        head_col = ORANGE if "head" in hl else CREAM
        out.append(f'<circle cx="{hx}" cy="{hy}" r="{r}" fill="none" '
                   f'stroke="{head_col}" stroke-width="{width * 0.9}"/>')
        if "neck" in p:
            out.append(_line(p, "head", "neck", head_col, width * 0.9))
    return "\n".join(x for x in out if x)


VIEWBOX = {
    "squat": "18 14 66 84",
    "pushup": "6 20 90 74",
    "hinge": "18 24 66 74",
    "carry": "24 -2 54 100",
    "ccf": "16 10 76 66",
}


def svg(inner, vb="0 0 100 100"):
    return (f'<svg viewBox="{vb}" xmlns="http://www.w3.org/2000/svg" '
            f'preserveAspectRatio="xMidYMid meet">{inner}</svg>')


# ---------------------------------------------------------------- utilidades

def dumbbell(x, y, s=1.0, color=CREAM):
    w, h = 7 * s, 2.4 * s
    return (f'<rect x="{x - w/2}" y="{y - h/2}" width="{w}" height="{h}" '
            f'fill="{color}"/>'
            f'<rect x="{x - w/2 - 1.4*s}" y="{y - 2.6*s}" width="{1.6*s}" '
            f'height="{5.2*s}" fill="{color}"/>'
            f'<rect x="{x + w/2 - 0.2*s}" y="{y - 2.6*s}" width="{1.6*s}" '
            f'height="{5.2*s}" fill="{color}"/>')


def kettlebell(x, y, s=1.0, color=CREAM):
    return (f'<path d="M {x-3*s} {y-3*s} a {3*s} {3*s} 0 0 1 {6*s} 0" '
            f'fill="none" stroke="{color}" stroke-width="{1.5*s}"/>'
            f'<ellipse cx="{x}" cy="{y+2.6*s}" rx="{4.6*s}" ry="{4*s}" '
            f'fill="{color}"/>')


def floor(y=92, x1=4, x2=96, color=DIM, w=2.4):
    return (f'<line x1="{x1}" y1="{y}" x2="{x2}" y2="{y}" stroke="{color}" '
            f'stroke-width="{w}" stroke-linecap="round"/>')


def wall(x=12, y1=14, y2=92, color=DIM, w=2.4):
    return (f'<line x1="{x}" y1="{y1}" x2="{x}" y2="{y2}" stroke="{color}" '
            f'stroke-width="{w}" stroke-linecap="round"/>')


def box(x, y, w, h, color=DIM, sw=2.4):
    return (f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="none" '
            f'stroke="{color}" stroke-width="{sw}"/>')


def chair(x=52, y=92, color=DIM):
    return (f'<path d="M {x} {y} L {x} {y-22} L {x+22} {y-22} M {x+22} {y-22} '
            f'L {x+22} {y-44} M {x+22} {y-22} L {x+22} {y}" fill="none" '
            f'stroke="{color}" stroke-width="2.4" stroke-linecap="round"/>')


# --------------------------------------------------------------- SENTADILLA

def _sq(neck, sho, elb, wri, hip, kne, ank):
    """Constructor abreviado para poses de sentadilla en vista lateral."""
    return dict(
        head=(neck[0] + 0.6, neck[1] - 7.4), neck=neck, sho=sho, elb=elb,
        wri=wri, hip=hip, kne=kne, ank=ank, toe=(ank[0] + 7, ank[1] + 2),
        sho2=(sho[0] - 2.6, sho[1] + 1), elb2=(elb[0] - 3.4, elb[1] + 1),
        wri2=(wri[0] - 3.6, wri[1] + 1),
        kne2=(kne[0] - 3.2, kne[1] + 1), ank2=(ank[0] - 3.4, ank[1]),
        toe2=(ank[0] + 3.6, ank[1] + 2),
    )


SQUAT = [
    ("Sit-to-stand",
     _sq((50, 38), (50, 40), (56, 50), (60, 58), (48, 62), (56, 76), (50, 90)),
     ("neck-hip", "hip-kne"), chair(54) + floor()),
    ("Asistida",
     _sq((46, 40), (46, 42), (54, 50), (62, 52), (44, 64), (54, 76), (46, 90)),
     ("hip-kne", "kne-ank"), wall(70, 30, 92) + floor()),
    ("Parcial",
     _sq((50, 36), (50, 38), (57, 47), (62, 55), (48, 60), (57, 74), (50, 90)),
     ("hip-kne",), floor()),
    ("Profunda",
     _sq((49, 44), (49, 46), (57, 54), (62, 60), (46, 70), (58, 79), (49, 90)),
     ("hip-kne", "kne-ank"), floor()),
    ("Goblet",
     _sq((50, 38), (50, 40), (55, 48), (52, 52), (48, 62), (57, 76), (50, 90)),
     ("neck-hip", "hip-kne"), floor()),
    ("Unilateral",
     dict(head=(50, 31), neck=(50, 38), sho=(50, 40), elb=(58, 48),
          wri=(66, 50), hip=(48, 62), kne=(55, 76), ank=(49, 90),
          toe=(56, 92), sho2=(47, 41), elb2=(41, 49), wri2=(36, 52),
          kne2=(36, 70), ank2=(30, 80), toe2=(24, 82)),
     ("hip-kne", "kne-ank"), wall(72, 30, 92) + floor()),
]
SQUAT_PROPS = {4: dumbbell(52, 52, 0.9)}

# ------------------------------------------------------------------ PUSH-UP

def _pu(head, neck, sho, elb, wri, hip, kne, ank):
    return dict(head=head, neck=neck, sho=sho, elb=elb, wri=wri, hip=hip,
                kne=kne, ank=ank, toe=(ank[0] - 5, ank[1] + 3),
                sho2=(sho[0], sho[1] + 2.4), elb2=(elb[0] - 1, elb[1] + 2.6),
                wri2=(wri[0] - 1, wri[1] + 2.6),
                kne2=(kne[0], kne[1] + 2.4), ank2=(ank[0], ank[1] + 2.4),
                toe2=(ank[0] - 5, ank[1] + 5))


PUSHUP = [
    ("Contra la pared",
     _pu((30, 26), (33, 32), (34, 34), (26, 40), (18, 40), (40, 56),
         (46, 74), (50, 90)),
     ("sho-elb", "elb-wri"), wall(16, 14, 92) + floor()),
    ("Inclinado",
     _pu((26, 40), (30, 45), (32, 47), (24, 54), (18, 58), (44, 62),
         (58, 76), (72, 88)),
     ("sho-elb", "elb-wri"), box(10, 58, 16, 34) + floor()),
    ("Rodillas",
     _pu((22, 58), (28, 60), (30, 61), (24, 70), (18, 78), (48, 70),
         (62, 78), (74, 70)),
     ("neck-hip", "sho-elb"), floor(80)),
    ("Convencional",
     _pu((20, 56), (27, 59), (29, 60), (23, 70), (18, 79), (50, 66),
         (66, 72), (82, 79)),
     ("sho-elb", "elb-wri"), floor(82)),
    ("Push-up plus",
     _pu((20, 52), (27, 56), (29, 57), (24, 67), (18, 77), (50, 63),
         (66, 69), (82, 77)),
     ("neck-sho", "sho-elb"), floor(80)),
    ("Mayor demanda",
     dict(head=(20, 56), neck=(27, 59), sho=(29, 60), elb=(23, 70),
          wri=(18, 79), hip=(50, 66), kne=(66, 72), ank=(82, 79),
          toe=(88, 76), sho2=(29, 62), elb2=(36, 56), wri2=(43, 50),
          kne2=(64, 62), ank2=(78, 60), toe2=(84, 58)),
     ("sho-elb", "elb-wri"), floor(82)),
]
PUSHUP_PROPS = {}

# ---------------------------------------------------------- BISAGRA DE CADERA

def _hh(neck, sho, elb, wri, hip, kne, ank):
    return dict(head=(neck[0] - 5.6, neck[1] - 4.8), neck=neck, sho=sho,
                elb=elb, wri=wri, hip=hip, kne=kne, ank=ank,
                toe=(ank[0] + 7, ank[1] + 2),
                sho2=(sho[0] + 2.4, sho[1] + 1.6), elb2=(elb[0] + 2.6, elb[1] + 1.6),
                wri2=(wri[0] + 2.6, wri[1] + 1.6),
                kne2=(kne[0] - 3.4, kne[1] + 1), ank2=(ank[0] - 3.6, ank[1]),
                toe2=(ank[0] + 3.4, ank[1] + 2))


HINGE = [
    ("Frente a la pared",
     _hh((34, 44), (35, 46), (42, 52), (48, 56), (54, 56), (54, 74), (50, 90)),
     ("neck-hip", "hip-kne"), wall(74, 40, 92) + floor()),
    ("Con pica",
     _hh((32, 44), (33, 46), (40, 52), (46, 58), (52, 56), (53, 74), (50, 90)),
     ("neck-hip",),
     '<line x1="28" y1="38" x2="56" y2="66" stroke="#786D5E" '
     'stroke-width="1.8" stroke-linecap="round"/>' + floor()),
    ("Kettlebell elevada",
     _hh((34, 46), (35, 48), (42, 56), (46, 64), (54, 58), (54, 74), (50, 90)),
     ("neck-hip", "hip-kne"), box(38, 70, 20, 22) + floor()),
    ("Kettlebell suelo",
     _hh((32, 50), (33, 52), (40, 62), (44, 74), (52, 62), (53, 76), (50, 90)),
     ("neck-hip", "hip-kne"), floor()),
    ("Peso muerto rumano",
     _hh((34, 44), (35, 46), (41, 56), (44, 66), (54, 54), (55, 74), (52, 90)),
     ("hip-kne", "neck-hip"), floor()),
    ("Unilateral",
     dict(head=(28, 42), neck=(34, 46), sho=(35, 48), elb=(41, 58), wri=(44, 68),
          hip=(54, 54), kne=(54, 72), ank=(51, 90), toe=(58, 92),
          sho2=(37, 49), elb2=(43, 59), wri2=(46, 69),
          kne2=(66, 48), ank2=(78, 44), toe2=(84, 46)),
     ("hip-kne", "neck-hip"), floor()),
]
HINGE_PROPS = {2: kettlebell(46, 64, 0.9), 3: kettlebell(44, 76, 0.9),
               4: dumbbell(44, 66, 0.85), 5: dumbbell(44, 68, 0.8)}

# ------------------------------------------------------- FLEXIÓN CRANEOCERVICAL

def head_neck(tilt=0, highlight=True, extras="", surface=True, lift=0):
    """Cabeza y cuello de perfil, con la flexión craneocervical marcada."""
    cx, cy = 46, 40
    col = ORANGE if highlight else CREAM
    # Cráneo estilizado de perfil
    skull = (f'<path d="M {cx-14} {cy+2} q -2 -16 14 -18 q 16 -2 18 12 '
             f'q 1 8 -6 12 l -2 8 q -1 4 -6 4 l -12 0 q -6 0 -6 -6 z" '
             f'fill="none" stroke="{CREAM}" stroke-width="2.2" '
             f'transform="rotate({tilt} {cx} {cy})"/>')
    # Columna cervical
    spine = (f'<path d="M {cx+2} {cy+18} q 6 12 4 26" fill="none" '
             f'stroke="{CREAM}" stroke-width="2.2"/>')
    # Flexores profundos (longus colli / capitis)
    deep = (f'<path d="M {cx-2} {cy+16} q 3 14 2 26" fill="none" '
            f'stroke="{col}" stroke-width="3.4" stroke-linecap="round" '
            f'opacity="0.95"/>')
    halo = (f'<path d="M {cx-2} {cy+16} q 3 14 2 26" fill="none" '
            f'stroke="{ORANGE}" stroke-width="9" stroke-linecap="round" '
            f'opacity="0.22"/>') if highlight else ""
    # Flecha del gesto de asentimiento
    nod = (f'<path d="M {cx+18} {cy-10} a 14 14 0 0 1 -3 12" fill="none" '
           f'stroke="{ORANGE}" stroke-width="1.8" stroke-linecap="round" '
           f'marker-end="url(#ar)"/>')
    body = skull + spine + halo + deep + nod
    plinth = ""
    if surface:
        plinth = (f'<line x1="20" y1="86" x2="86" y2="86" stroke="{DIM}" '
                  f'stroke-width="2.6" stroke-linecap="round"/>')
        if lift:
            plinth += (f'<path d="M 30 {86 - lift} L 30 84" stroke="{ORANGE}" '
                       f'stroke-width="2" stroke-linecap="round" '
                       f'marker-start="url(#ar)"/>')
    return (plinth + extras
            + f'<g transform="translate(0 {-lift})">{body}</g>')


CCF = [
    ("Decúbito supino", 0, "", True, 0),
    ("Toalla bajo el cuello", 0,
     '<rect x="52" y="74" width="22" height="8" rx="4" fill="none" '
     'stroke="#786D5E" stroke-width="2.4"/>', True, 0),
    ("Biofeedback de presión", 0,
     '<rect x="62" y="62" width="24" height="17" fill="none" stroke="#786D5E" '
     'stroke-width="2.4"/>'
     '<circle cx="74" cy="70" r="5.5" fill="none" stroke="#FD6242" '
     'stroke-width="2.2"/>'
     '<line x1="74" y1="70" x2="78" y2="66" stroke="#FD6242" '
     'stroke-width="2.2" stroke-linecap="round"/>', True, 0),
    ("Respiración tranquila", 0,
     '<path d="M 74 26 q 9 7 0 13 q -9 7 0 13" fill="none" stroke="#786D5E" '
     'stroke-width="2.2" stroke-linecap="round"/>', True, 0),
    ("Elevación ligera", -6, "", True, 12),
    ("Integración funcional", -4,
     '<path d="M 22 76 l 15 -11 l 13 9" fill="none" stroke="#786D5E" '
     'stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>',
     False, 0),
]

# --------------------------------------------------------------------- CARRY

def _cy(arms):
    base = dict(head=(50, 22), neck=(50, 30), sho=(50, 32), hip=(50, 56),
                kne=(52, 74), ank=(50, 90), toe=(57, 92),
                kne2=(46, 73), ank2=(43, 88), toe2=(49, 90))
    base.update(arms)
    return base


CARRY = [
    ("Farmer bilateral",
     _cy(dict(elb=(58, 46), wri=(60, 60), sho2=(42, 32), elb2=(40, 46),
              wri2=(38, 60))),
     ("sho-elb", "elb-wri", "neck-hip"),
     dumbbell(62, 62, 0.9) + dumbbell(36, 62, 0.9) + floor()),
    ("Suitcase unilateral",
     _cy(dict(elb=(58, 46), wri=(60, 60), sho2=(42, 32), elb2=(41, 45),
              wri2=(41, 58))),
     ("sho-elb", "elb-wri", "neck-hip"), dumbbell(62, 62, 0.9) + floor()),
    ("Front carry",
     _cy(dict(elb=(60, 42), wri=(52, 48), sho2=(42, 32), elb2=(40, 42),
              wri2=(48, 48))),
     ("neck-hip", "sho-elb"), kettlebell(50, 46, 0.95) + floor()),
    ("Waiter carry",
     _cy(dict(elb=(58, 22), wri=(54, 10), sho2=(42, 32), elb2=(40, 40),
              wri2=(40, 54))),
     ("sho-elb", "elb-wri"), kettlebell(53, 6, 0.85) + floor()),
    ("Overhead unilateral",
     _cy(dict(elb=(56, 18), wri=(52, 6), sho2=(42, 32), elb2=(40, 44),
              wri2=(40, 58))),
     ("sho-elb", "elb-wri", "neck-hip"), dumbbell(51, 3, 0.85) + floor()),
    ("Carry avanzado",
     _cy(dict(elb=(58, 46), wri=(60, 60), sho2=(42, 32), elb2=(40, 46),
              wri2=(38, 60), kne=(58, 72), ank=(62, 88), toe=(69, 90),
              kne2=(42, 74), ank2=(36, 88), toe2=(42, 90))),
     ("sho-elb", "elb-wri", "hip-kne", "neck-hip"),
     dumbbell(62, 62, 1.0) + dumbbell(36, 62, 1.0) + floor()),
]
CARRY_PROPS = {}


DEFS = ('<defs><marker id="ar" viewBox="0 0 10 10" refX="6" refY="5" '
        'markerWidth="5" markerHeight="5" orient="auto-start-reverse">'
        '<path d="M 0 0 L 10 5 L 0 10 z" fill="#FD6242"/></marker></defs>')


def render_set(name):
    """Devuelve [(etiqueta, svg), ...] para un patrón."""
    out = []
    if name == "ccf":
        for label, tilt, extras, surf, lift in CCF:
            out.append((label, svg(DEFS + head_neck(tilt, True, extras, surf, lift),
                                   VIEWBOX["ccf"])))
        return out
    table = {"squat": (SQUAT, SQUAT_PROPS), "pushup": (PUSHUP, PUSHUP_PROPS),
             "hinge": (HINGE, HINGE_PROPS), "carry": (CARRY, CARRY_PROPS)}
    poses, props = table[name]
    for i, (label, pose, hl, extra) in enumerate(poses):
        inner = DEFS + figure(pose, hl, extra + props.get(i, ""))
        out.append((label, svg(inner, VIEWBOX[name])))
    return out


def icon_for(name):
    """Pictograma compacto de un patrón, para portada y cierre."""
    idx = {"squat": 3, "pushup": 3, "hinge": 4, "carry": 0}
    if name == "ccf":
        return svg(DEFS + head_neck(-4, True, "", False, 0),
                   VIEWBOX["ccf"])
    return render_set(name)[idx[name]][1]
