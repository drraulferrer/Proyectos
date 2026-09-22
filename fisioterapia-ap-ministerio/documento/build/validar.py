#!/usr/bin/env python3
"""validar.py. Comprueba build/documento.md contra SPEC.md y contra la Voice DNA.

Criterios de aceptación 9.1 a 9.12 de SPEC.md, reglas de estilo E, terminología T y
las reglas medibles del perfil de voz (educacion-en-dolor/docs/voice-dna.md y
build/voz.py de ese repositorio): apertura valorativa, inciso entre rayas,
superlativo absoluto, expresión coloquial, frase de más de 30 palabras y moldes de
título. Igual que voz.py, el recuento de voz es un SUELO: lo que exige entender el
texto (conector ausente, sujeto implícito) se revisa leyendo.

Estados: OK, FALLO (hay que corregir) y BLOQUEADO (depende de una causa externa
que el documento declara, p. ej. fuentes que no se han podido abrir).
Uso: python3 validar.py [--detalle]
"""
import csv, re, sys, unicodedata
from collections import defaultdict
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
DOC = RAIZ / "build" / "documento.md"
DATOS = RAIZ / "datos"
DETALLE = "--detalle" in sys.argv

CCAA = ["Andalucía", "Aragón", "Asturias", "Baleares", "Canarias", "Cantabria", "Castilla-La Mancha",
        "Castilla y León", "Cataluña", "Comunidad Valenciana", "Extremadura", "Galicia", "La Rioja",
        "Madrid", "Murcia", "Navarra", "País Vasco"]
PAISES = ["Alemania", "Australia", "Bélgica", "Canadá", "Dinamarca", "España", "Finlandia", "Francia",
          "Italia", "Noruega", "Nueva Zelanda", "Países Bajos", "Portugal", "Reino Unido", "Suecia"]


def plano(s):
    return unicodedata.normalize("NFD", s).encode("ascii", "ignore").decode().lower()


def lee(n, sep=";"):
    return list(csv.DictReader(open(DATOS / n, encoding="utf-8"), delimiter=sep))


# ---------------------------------------------------------------- parseo
def bloques(texto):
    """Devuelve [(seccion_h1, subseccion, tipo, contenido, linea)] con tipo en
    h1, h2, h3, parrafo, tabla, cita (blockquote), lista."""
    out, h1, h2 = [], "", ""
    lineas = texto.split("\n")
    i = 0
    while i < len(lineas):
        l = lineas[i]
        if not l.strip():
            i += 1; continue
        if l.startswith("# "):
            h1, h2 = l[2:].strip(), ""; out.append((h1, h2, "h1", l[2:].strip(), i + 1)); i += 1; continue
        if l.startswith("## "):
            h2 = l[3:].strip(); out.append((h1, h2, "h2", h2, i + 1)); i += 1; continue
        if l.startswith("### "):
            out.append((h1, h2, "h3", l[4:].strip(), i + 1)); i += 1; continue
        ini = i
        if l.startswith("|"):
            while i < len(lineas) and lineas[i].startswith("|"):
                i += 1
            out.append((h1, h2, "tabla", "\n".join(lineas[ini:i]), ini + 1)); continue
        if l.startswith(">"):
            while i < len(lineas) and lineas[i].startswith(">"):
                i += 1
            out.append((h1, h2, "cita", " ".join(x.lstrip("> ").strip() for x in lineas[ini:i]), ini + 1)); continue
        if re.match(r"^(\s*[-*] |\s*\d+\. )", l):
            while i < len(lineas) and lineas[i].strip() and not lineas[i].startswith(("#", "|", ">")):
                i += 1
            items = re.split(r"\n(?=\s*(?:[-*] |\d+\. ))", "\n".join(lineas[ini:i]))
            for it in items:
                out.append((h1, h2, "lista", re.sub(r"^\s*(?:[-*]|\d+\.)\s+", "", it).replace("\n", " "), ini + 1))
            continue
        while i < len(lineas) and lineas[i].strip() and not lineas[i].startswith(("#", "|", ">")):
            i += 1
        out.append((h1, h2, "parrafo", " ".join(lineas[ini:i]), ini + 1))
    return out


def es_referencias(h1):
    return h1.startswith("Referencias")


def es_glosario(h1):
    return h1.startswith("Anexo D")


def limpia(t):
    t = re.sub(r"\*\*|\*", "", t)
    t = re.sub(r"`[^`]*`", "X", t)
    return t


def frases(p):
    t = re.sub(r"(?<=\d)\.(?=\d)", "\x00", p)
    t = re.sub(r"\b([A-Z])\.(?=\s*[A-Z]\.)", "\\1\x00", t)
    t = re.sub(r"\b(art|núm|pág|págs|ed|et al|p|vol|etc|Sr|Dra|Dr)\.", lambda m: m.group(0).replace(".", "\x00"), t)
    return [f.replace("\x00", ".") for f in re.split(r"(?<=[.:;?!])\s+", t) if f.strip()]


# ---------------------------------------------------------------- resultados
R = []


def resultado(cid, nombre, estado, detalle=None):
    R.append((cid, nombre, estado, detalle or []))


def main():
    texto = DOC.read_text(encoding="utf-8")
    B = bloques(texto)
    prosa = [b for b in B if b[2] in ("parrafo", "lista", "cita") and not es_referencias(b[0])]
    h1s = [b[3] for b in B if b[2] == "h1"]

    # ======================= Voice DNA
    RE_APERTURA = re.compile(r"^(?:\*\*)?Es (?:el|la|lo|un|una)\b(?![^.]{0,40}\bdecir\b)")
    RE_SUPERLATIVO = re.compile(r"(?<!uno de )(?<!una de )(?<!de )\bel (?:más|menos|mayor|peor|mejor) (?!\w+\s+(?:de los|de las)\b)", re.I)
    COLOQ = [r"\bentran? en juego\b", r"\bcabe en\b", r"\bes difícil de exagerar\b", r"\bobligatoriamente\b",
             r"\ben la cabeza\b", r"\bde un plumazo\b", r"\bni de lejos\b", r"\bpor las malas\b", r"\bde sobra\b",
             r"\bsin más\b", r"\bfácilmente\b", r"\bsin duda\b", r"\bclaramente\b"]
    voz = defaultdict(list)
    for h1, h2, tipo, c, ln in prosa:
        if es_glosario(h1):
            continue
        p = limpia(c)
        if RE_APERTURA.search(p):
            voz["apertura"].append(f"l.{ln}: {p[:70]}")
        for m in RE_SUPERLATIVO.finditer(p):
            voz["superlativo"].append(f"l.{ln}: …{p[max(0,m.start()-20):m.end()+25]}…")
        for rx in COLOQ:
            for m in re.finditer(rx, p, re.I):
                voz["coloquial"].append(f"l.{ln}: «{m.group(0)}»")
        for f in frases(re.sub(r"\[[\d,\s-]+\]", "", p)):
            n = len(re.sub(r"«[^»]*»", "CITA", f).split())
            if n > 30:
                voz["frase_larga"].append(f"l.{ln}: {n} palabras · {f[:80]}…")
    for h1, h2, tipo, c, ln in B:
        if tipo in ("h1", "h2", "h3"):
            if re.match(r"^Cómo (explicar|contar|decir|hablar)\b", c, re.I) or re.search(r"\bno solo\b[^:]{0,60}:", c, re.I):
                voz["titulo"].append(f"l.{ln}: {c}")
            if re.search(r":\s+\S", c) and not re.match(r"^(Ficha|Tabla|Anexo|Circuito|Nivel)\b", c):
                voz["titulo"].append(f"l.{ln}: dos puntos en título: {c}")
    todas = [x for v in voz.values() for x in v]
    resultado("VOZ", "Voice DNA: apertura, inciso, superlativo, coloquial, frase > 30 palabras, título",
              "OK" if not todas else "FALLO", [f"{k} ({len(v)}): " + " | ".join(v[:6 if not DETALLE else 999]) for k, v in voz.items()])

    # ======================= 9.5 estilo
    est = []
    for m in re.finditer(r"—|–", texto):
        ln = texto[:m.start()].count("\n") + 1
        est.append(f"l.{ln}: raya o semirraya")
    for h1, h2, tipo, c, ln in prosa:
        if re.search(r"\bafirm(a|an|ó|aron)\b", c, re.I):
            est.append(f"l.{ln}: «afirma»")
        if re.search(r"\baprovechable", c, re.I):
            est.append(f"l.{ln}: «aprovechable»")
        if re.search(r"\b(robust[ao]s?|sólid[ao]s?|contundente)\b", c, re.I):
            est.append(f"l.{ln}: adjetivo valorativo sobre la evidencia")
        sin_citas = re.sub(r"«[^»]*»", "", c)
        if re.search(r"atención especializada", sin_citas, re.I):
            est.append(f"l.{ln}: «atención especializada» fuera de cita literal")
    resultado("9.5", "Estilo: sin «afirma», «aprovechable», rayas de inciso ni adjetivos valorativos (E-2, E-7, E-8, E-9, E-11)",
              "OK" if not est else "FALLO", est)

    # ======================= 9.4 terminología
    TERM = [(r"banderas? rojas?", "T-1 signos de alarma"), (r"lumbalgia mecánica|cervicalgia mecánica", "T-2 artralgias vertebrales mecánicas"),
            (r"\bautocita", "T-3 autorreferencia"), (r"consulta grupal", "T-4 intervención grupal"),
            (r"(?<!clínicas )sesiones compartidas", "T-6 sesión clínica compartida"), (r"interconsulta virtual", "T-7"),
            (r"\bMFyC\b", "T-9 solo en tablas"), (r"cribado administrativo", "T-10 cribado clínico"),
            (r"dolor musculoesquelético recurrente", "T-11"), (r"dolor crónico", "T-12 dolor persistente")]
    ter = []
    for h1, h2, tipo, c, ln in prosa:
        if es_glosario(h1):
            continue
        s = re.sub(r"«[^»]*»", "", c)
        for rx, regla in TERM:
            if re.search(rx, s, re.I):
                ter.append(f"l.{ln}: {regla}: {re.search(rx, s, re.I).group(0)}")
        if re.search(r"e-consulta", s, re.I) and "Madrid" not in c:
            ter.append(f"l.{ln}: T-7 «e-consulta» fuera del sistema madrileño")
    resultado("9.4", "Terminología normalizada (tabla T)", "OK" if not ter else "FALLO", ter)

    # ======================= 9.6 orden alfabético
    alf = []
    for h1, h2, tipo, c, ln in B:
        if tipo not in ("parrafo", "lista", "cita"):
            continue
        for lista in (CCAA, PAISES):
            for f in frases(c):
                pos = []
                for nombre in lista:
                    for m in re.finditer(re.escape(nombre), f):
                        # evita «Castilla» dentro de «Castilla-La Mancha»
                        pos.append((m.start(), nombre))
                pos.sort()
                # enumeración: nombres separados solo por comas, «y» o «e»
                grupos, g = [], []
                for k, (p0, nom) in enumerate(pos):
                    if g:
                        entre = f[g[-1][0] + len(g[-1][1]):p0]
                        if re.fullmatch(r"\s*(,|y|e|,\s*y|\s)\s*", entre):
                            g.append((p0, nom)); continue
                        grupos.append(g); g = []
                    g.append((p0, nom))
                if g:
                    grupos.append(g)
                for g in grupos:
                    noms = [n for _, n in g]
                    if len(noms) > 1 and noms != sorted(noms, key=plano):
                        alf.append(f"l.{ln}: {', '.join(noms)}")
    resultado("9.6", "Enumeraciones de territorios en orden alfabético (E-4)", "OK" if not alf else "FALLO", alf)

    # ======================= 9.7 advertencia metodológica
    adv = []
    for sec in ("4.", "9."):
        bs = [b for b in B if b[0].startswith(sec)]
        if not bs:
            adv.append(f"sección {sec} no encontrada"); continue
        primera_tabla = next((k for k, b in enumerate(bs) if b[2] == "tabla"), None)
        primera_adv = next((k for k, b in enumerate(bs) if b[2] == "cita" and "Advertencia metodológica" in b[3]), None)
        if primera_adv is None:
            adv.append(f"sección {sec}: sin recuadro de advertencia")
        elif primera_tabla is not None and primera_adv > primera_tabla:
            adv.append(f"sección {sec}: la advertencia va después de la primera tabla")
    resultado("9.7", "Advertencia metodológica antes de la primera tabla en las secciones 4 y 9 (E-10)", "OK" if not adv else "FALLO", adv)

    # ======================= E-5 tablas con título y fuente
    tb = []
    for k, b in enumerate(B):
        if b[2] != "tabla" or es_referencias(b[0]):
            continue
        prev = B[k - 1] if k else None
        nxt = B[k + 1] if k + 1 < len(B) else None
        if prev and prev[2] == "h3" and prev[3].startswith("Ficha"):
            continue
        if not (prev and prev[2] == "parrafo" and re.match(r"^\*{0,2}Tabla [A-Z0-9]+\.\d+\.", prev[3])):
            tb.append(f"l.{b[4]}: tabla sin título «Tabla X.Y.» inmediatamente antes")
        if not (nxt and nxt[2] == "parrafo" and re.match(r"^\*{0,2}(Fuente|Fuentes)\b", nxt[3])):
            tb.append(f"l.{b[4]}: tabla sin «Fuente» inmediatamente después")
    resultado("E-5", "Toda tabla lleva título antes y fuente al pie", "OK" if not tb else "FALLO", tb)

    # ======================= 9.1 cifras con fuente
    cifras = {c["valor"] for c in lee("cifras.csv", "|")} if (DATOS / "cifras.csv").exists() else set()
    PATRONES_NO_CIFRA = [
        r"\[[\d,\s-]+\]",                                   # llamadas de cita
        r"\b(?:Ley|Real Decreto|RD|Orden|Directiva|Resolución|Decreto)\s+[A-Z/]*\s*\d+/\d+(?:/\w+)?",
        r"\b[A-Z]{2,4}/\d+/\d+", r"\b\d+/\d{4}\b", r"WHA\d+\.\d+", r"BOE-A-\d+-\d+", r"\bSI \d+/\d+",
        r"\bart(?:ículo|\.)s?\s+\d+(?:\.\d+)*(?:\.[a-z])?(?:\s*y\s*\d+)*", r"\bapartados?\s+\d+(?:\.\d+)*(?:\s*(?:y|a)\s*\d+(?:\.\d+)*)*",
        r"\b(?:secci[oó]n|secciones|tabla|tablas|figura|anexo|criterio|criterios|circuito|circuitos|nivel|niveles|fase|fases|paso|pasos|comentario|comentarios|capítulo|objetivo|acción|punto)\s+[A-Z]?\d+(?:\.\d+)*(?:\s*(?:,|y|a|e)\s*[A-Z]?\d+(?:\.\d+)*)*",
        r"\b[A-Z]{1,3}-?\d+[a-z]?\b", r"\b(?:PG|PC|ID|IE|IR|ED|D|E|R|T|C|G|A|B)-\d+\b",
        r"\b\d{1,2} de (?:enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)\b",
        r"\b(?:19|20)\d{2}(?:-(?:19|20)?\d{2,4})?\b", r"\bCIAP-2\b", r"\bNav1\.\d\b", r"\b\d+\.\d+\.[a-z]\b",
        r"\b(?:versión|v)\s*\d+(?:\.\d+)*", r"\b[A-Z]\.\d+(?:\.\d+)*", r"\b[A-Z][A-Za-z]*-\d+\b", r"\b1 (?:fisioterapeuta|por cada)\b",
        r"\b\d+ años o más\b", r"\bpor (?:cada )?(?:1\.000|10\.000|100\.000) (?:habitantes|personas|registradas)\b",
    ]
    sin_fuente, sin_anexo = [], []
    for h1, h2, tipo, c, ln in prosa:
        if h1.startswith(("Resumen", "Anexo D", "Anexo E", "Anexo F", "Referencias")) or tipo == "cita" and "Advertencia" in c:
            continue
        if re.match(r"^\*{0,2}(Tabla [A-Z0-9]+\.\d+\.|Fuente)", c):
            continue
        for f in frases(c):
            t = f
            tiene_cita = bool(re.search(r"\[[\d,\s-]+\]", t)) or re.search(r"\b(tabla|anexo|modelo)\b", t, re.I)
            for rx in PATRONES_NO_CIFRA:
                t = re.sub(rx, " ", t, flags=re.I)
            nums = [n.strip() for n in re.findall(r"\d[\d.,]*(?:\s*%)?", t)]
            nums = [n.rstrip(".,") for n in nums if n.rstrip(".,")]
            if not nums:
                continue
            if not tiene_cita:
                sin_fuente.append(f"l.{ln}: {', '.join(nums)} · {f[:90]}")
            for n in nums:
                if n not in cifras and not tiene_cita:
                    pass
                if n not in cifras and re.search(r"\[[\d,\s-]+\]", f):
                    sin_anexo.append(f"l.{ln}: «{n}»")
    resultado("9.1", "Toda cifra con fuente en la misma frase y registrada en el anexo E",
              "OK" if not sin_fuente and not sin_anexo else "FALLO",
              [f"sin fuente en la frase ({len(sin_fuente)}): " + " | ".join(sin_fuente[:8 if not DETALLE else 999]),
               f"con fuente pero sin fila en datos/cifras.csv ({len(sin_anexo)}): " + " ".join(sorted(set(sin_anexo))[:40 if not DETALLE else 999])])

    # ======================= 9.2 referencias verificadas
    bib = __import__("json").load(open(RAIZ / "build" / "bibliografia.json", encoding="utf-8"))
    nover = [f"[{b['n']}] {b['id']} ({b['estado']})" for b in bib if not b["estado"].startswith("Verificada")]
    sec = [b for b in bib if b["estado"] == "Secundaria"]
    resultado("9.2", "Todas las referencias citadas figuran como verificadas",
              "OK" if not nover else "BLOQUEADO",
              [f"{len(bib)} citadas; {len(bib)-len(nover)} verificadas; {len(nover)} pendientes de cotejo porque la red de trabajo no permitió abrir la fuente; {len(sec)} secundarias",
               " ".join(nover[:12]) + (" …" if len(nover) > 12 else "")])

    # ======================= 9.3 coherencia interna
    M = lee("matriz.csv")
    P = {p["id"] for p in lee("programas.csv")}
    coh = []
    fuente_txt = "\n".join(f.read_text(encoding="utf-8") for f in sorted((RAIZ / "fuente").glob("*.md")))
    for marcador in ("TABLA_ACCESO_DIRECTO", "TABLA_EXCLUSIONES", "TABLA_VIAS", "TABLA_DERIVACION", "MATRIZ_COMPLETA"):
        if "{{" + marcador + "}}" not in fuente_txt:
            coh.append(f"falta el marcador generado {marcador}")
    nombres_inc = {plano(r["proceso"]) for r in M if r["tipo"] == "inclusion"}
    for r in M:
        if r["tipo"] == "exclusion" and plano(r["proceso"]) in nombres_inc:
            coh.append(f"{r['id']} incluido y excluido a la vez")
        if r["tipo"] == "exclusion" and not r["circuito_alternativo"]:
            coh.append(f"{r['id']} excluido sin circuito alternativo")
        if r["tipo"] != "exclusion":
            if re.search(r"educaci|ejercicio|programa de|tratamiento", r["condicion_acceso"], re.I):
                coh.append(f"{r['id']} la condición es una intervención: {r['condicion_acceso']}")
            if not r["condicion_acceso"] or not r["vias"]:
                coh.append(f"{r['id']} sin condición o sin vía")
            for pg in filter(None, r["programa"].split(",")):
                if pg.strip() not in P:
                    coh.append(f"{r['id']} programa inexistente {pg}")
        if r["tipo"] == "derivacion" and "AR" in r["vias"].split(","):
            coh.append(f"{r['id']} es solo de derivación y admite autorreferencia")
    # tablas escritas a mano en 5, 6 y 8 que repitan procesos de la matriz
    for h1, h2, tipo, c, ln in B:
        if tipo == "tabla" and h1[:2] in ("5.", "6.", "8.") and "Id |" not in c.split("\n")[0]:
            for r in M:
                if r["tipo"] != "exclusion" and plano(r["proceso"])[:25] in plano(c):
                    coh.append(f"l.{ln}: tabla manual en {h1[:2]} repite el proceso {r['id']} fuera de la matriz")
    # frases que declaran autorreferencia para procesos solo de derivación
    solo_der = {"epoc": "EPOC", "caidas": "caídas", "postquirurg": "postquirúrgico", "menor de edad": "menores", "menores de edad": "menores"}
    for h1, h2, tipo, c, ln in prosa:
        for f in frases(c):
            pf = plano(f)
            if ("autorreferencia" in pf or "acceso directo" in pf) and not re.search(r"\b(no|sin|excluid|sale|salen|fuera|solo por|exige|requiere|salvo|mediante derivaci|por derivaci|enfermeria|medicina de familia)", pf):
                for k, v in solo_der.items():
                    if k in pf:
                        coh.append(f"l.{ln}: posible contradicción: {v} con autorreferencia · {f[:80]}")
    # derivación directa a atención hospitalaria desde fisioterapia fuera de urgencias (contradice 7.6)
    for h1, h2, tipo, c, ln in prosa:
        for f in frases(c):
            pf = plano(f)
            if re.search(r"deriv\w* (directa |inmediata )?(a|hacia) (traumatolog|rehabilitacion hospitalaria|atencion hospitalaria)", pf) and "medicina de familia" not in pf and "no se pide" not in pf and not h1.startswith(("4.", "Anexo", "7.")):
                coh.append(f"l.{ln}: derivación de fisioterapia a atención hospitalaria sin medicina de familia · {f[:80]}")
    resultado("9.3", "Coherencia interna: matriz única, sin contradicciones ni condiciones que sean intervenciones",
              "OK" if not coh else "FALLO", coh)

    # ======================= 9.8 trazabilidad de los 52 comentarios
    tr = []
    ap = lee("aplicacion_comentarios.tsv", "\t") if (DATOS / "aplicacion_comentarios.tsv").exists() else []
    if len(ap) != 52:
        tr.append(f"datos/aplicacion_comentarios.tsv tiene {len(ap)} filas y deben ser 52")
    for a in ap:
        if a["debe_aparecer"] and not re.search(a["debe_aparecer"], texto, re.I | re.S):
            tr.append(f"comentario {a['n']}: no aparece /{a['debe_aparecer']}/")
        if a["no_debe_aparecer"] and re.search(a["no_debe_aparecer"], re.sub(r"(?s)# Anexo D.*?(?=\n# )", "", texto), re.I):
            tr.append(f"comentario {a['n']}: aparece lo que debía desaparecer /{a['no_debe_aparecer']}/")
    resultado("9.8", "Los 52 comentarios de revisión tienen su decisión aplicada en el texto", "OK" if not tr else "FALLO", tr)

    # ======================= 9.9 autonomía explícita
    s7 = "\n".join(b[3] for b in B if b[0].startswith("7."))
    aut = []
    if not re.search(r"pide[^.]{0,120}habilitaci[oó]n[^.]{0,120}radiograf[ií]a simple|habilitaci[oó]n[^.]{0,160}prescriptor[^.]{0,120}radiolog[ií]a simple", s7, re.I):
        aut.append("la sección 7 no contiene la frase que responde si se pide la solicitud de radiografías")
    for h1, h2, tipo, c, ln in prosa:
        for f in frases(c):
            if re.search(r"Madrid", f) and re.search(r"radiograf|radiolog", f, re.I) and not re.search(r"\b(no|ninguna|ningún|sin|pide|solicita la|propone|posición|habilitaci)", f, re.I):
                aut.append(f"l.{ln}: posible presentación de la solicitud de radiografía como práctica vigente · {f[:90]}")
    resultado("9.9", "La sección 7 responde en una frase si se pide la solicitud de pruebas", "OK" if not aut else "FALLO", aut)

    # ======================= 9.10 dotación trazable
    dt = []
    for r in lee("parametros.csv"):
        if r["tipo"] == "supuesto" and not r["justificacion"]:
            dt.append(f"{r['id']} supuesto sin justificación")
        if r["tipo"] == "dato" and not r["fuentes"]:
            dt.append(f"{r['id']} dato sin fuente")
    for marcador in ("TABLA_PARAMETROS", "TABLA_ESCENARIOS", "TABLA_SENSIBILIDAD", "TABLA_AJUSTES"):
        if "{{" + marcador + "}}" not in fuente_txt:
            dt.append(f"falta {marcador} en la fuente")
    s9 = "\n".join(f for b in B if b[0].startswith("9.") and b[2] in ("parrafo", "lista") for f in frases(b[3]) if "borrador" not in f)
    for m in re.finditer(r"1 (?:fisioterapeuta )?(?:por|/) ?(?:cada )?(\d{1,3}(?:\.\d{3})+)", s9):
        if m.group(1) not in texto.split("Tabla 9.")[0] and m.group(1) not in re.findall(r"\d{1,3}(?:\.\d{3})+", "\n".join(b[3] for b in B if b[2] == "tabla" and b[0].startswith("9."))):
            dt.append(f"ratio {m.group(1)} en la sección 9 que no sale de las tablas del modelo")
    resultado("9.10", "Dotación trazable: parámetros con fuente o supuesto con rango y tabla de sensibilidad", "OK" if not dt else "FALLO", dt)

    # ======================= 9.11 fichas completas
    fc = []
    for n, f in (("programas.csv", ";"), ("indicadores.csv", ";")):
        for r in lee(n, f):
            vac = [k for k, v in r.items() if k not in ("procesos",) and (v is None or v.strip() == "")]
            if vac:
                fc.append(f"{n} {r['id']}: campos vacíos {vac}")
    for marcador in ("FICHAS_PROGRAMAS", "FICHAS_INDICADORES"):
        if "{{" + marcador + "}}" not in fuente_txt:
            fc.append(f"falta {marcador}")
    resultado("9.11", "Fichas completas de programas (anexo A) e indicadores (anexo B)", "OK" if not fc else "FALLO", fc)

    # ======================= 9.12 legibilidad por partes
    lg = []
    for k, b in enumerate(B):
        if b[2] == "h1" and not es_referencias(b[3]):
            sig = B[k + 1] if k + 1 < len(B) else None
            if not sig or sig[2] not in ("parrafo", "cita"):
                lg.append(f"«{b[3]}» no empieza con un párrafo que la sitúe")
    esperadas = ["Resumen ejecutivo"] + [f"{i}." for i in range(1, 13)] + [f"Anexo {x}." for x in "ABCDEF"]
    for e in esperadas:
        if not any(h.startswith(e) for h in h1s):
            lg.append(f"falta la sección «{e}»")
    resultado("9.12", "Estructura completa y cada sección legible por separado", "OK" if not lg else "FALLO", lg)

    # ======================= Resumen ejecutivo (sección 0 de la especificación)
    rs = []
    s0 = [b for b in B if b[0].startswith("Resumen")]
    t0 = "\n".join(b[3] for b in s0)
    if re.search(r"\[[\d,\s-]+\]", t0):
        rs.append("el resumen ejecutivo contiene llamadas de cita")
    tesis = "La fisioterapia de AP es un recurso del primer nivel asistencial"
    if tesis.lower() not in plano(t0).replace("atencion primaria", "ap") and "La fisioterapia de atención primaria es un recurso del primer nivel asistencial" not in t0:
        rs.append("falta la tesis central literal")
    if not re.search(r"no propone", t0, re.I):
        rs.append("falta «lo que no se propone»")
    cuerpo = texto.split("# 1.", 1)[1] if "# 1." in texto else ""
    for n in set(re.findall(r"\d{1,3}(?:\.\d{3})+|\d+,\d+|\d+\s?%", t0)):
        if n not in cuerpo:
            rs.append(f"la cifra {n} del resumen no aparece en el cuerpo")
    resultado("S0", "Resumen ejecutivo: tesis literal, lo que no se propone, sin citas y cifras presentes en el cuerpo", "OK" if not rs else "FALLO", rs)

    # ======================= extensión orientativa
    pal = defaultdict(int)
    for h1, h2, tipo, c, ln in B:
        if tipo in ("parrafo", "lista", "cita", "tabla"):
            pal[h1] += len(c.split())
    total = sum(pal.values())
    resultado("EXT", "Extensión orientativa de 45 a 60 páginas de cuerpo más anexos (unas 400 palabras por página)",
              "OK" if total >= 16000 else "FALLO", [f"{total} palabras en total"] + [f"{k[:40]}: {v}" for k, v in pal.items()])

    # ======================= informe
    fallos = 0
    print("\nVALIDACIÓN DEL DOCUMENTO CONTRA SPEC.md Y LA VOICE DNA\n")
    for cid, nombre, estado, det in R:
        marca = {"OK": "✓", "FALLO": "✗", "BLOQUEADO": "■"}[estado]
        print(f"{marca} {cid:5} {estado:9} {nombre}")
        if estado != "OK" or DETALLE:
            for d in det:
                if d:
                    print(f"          {d}")
        fallos += estado == "FALLO"
    print(f"\n{fallos} criterios con FALLO · {sum(1 for r in R if r[2]=='BLOQUEADO')} BLOQUEADOS por causa externa · {sum(1 for r in R if r[2]=='OK')} OK")
    return 1 if fallos else 0


if __name__ == "__main__":
    sys.exit(main())
