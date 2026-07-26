#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Actualiza las 16 páginas ya creadas en raulferrer.org:
1) Reemplaza su contenido por la versión SIN <style>/<script> (WordPress los
   elimina al guardar) y sin dependencia de JS.
2) Despliega todo el CSS del diseño .rfw en el «CSS adicional» del tema
   (preservando el CSS existente), con el @import de fuentes al principio.
"""
import json, re, urllib.request
import importlib.util

spec = importlib.util.spec_from_file_location('gen', '/Users/raulferrer/Documents/kimi/workspace/raulferrer-web/wordpress/generate-pages.py')
g = importlib.util.module_from_spec(spec)
spec.loader.exec_module(g)

cfg = json.load(open('/Users/raulferrer/.claude.json'))['mcpServers']['raulferrer-wp']
AUTH = cfg['headers']['Authorization']
API = 'https://www.raulferrer.org/wp-json/wp/v2/pages'
MCP = 'https://www.raulferrer.org/wp-json/mcp/mcp-adapter-default-server'
SID = open('/tmp/rf-mcp-session.txt').read().strip()

FONT_IMPORT = "@import url('https://fonts.googleapis.com/css2?family=Archivo:ital,wght@0,500;0,700;0,800;0,900;1,700&family=Inter:wght@400;500;600&family=Instrument+Serif:ital@0;1&display=swap');"

# ── 1) contenidos nuevos ──────────────────────────────────────────────────
main_pages = {
    1179: ('vision', g.BODY_VISION),
    1180: ('sobre', g.BODY_SOBRE),
    1181: ('areas', g.areas_hub()),
    1182: ('trayectoria', g.BODY_TRAYECTORIA),
    1183: ('trayectoria', g.BODY_CREDENCIALES),
    1184: ('proyectos', g.BODY_PROYECTOS),
    1185: ('publicaciones', g.BODY_PUBLICACIONES),
    1186: ('colaboraciones', g.BODY_COLABORACIONES),
    1187: ('', g.BODY_CONTACTO),
}
area_ids = {1188: 0, 1189: 1, 1190: 2, 1191: 3, 1192: 4, 1193: 5}

# inicio: transformar inicio.html (quitar <style>/<script>, marquee estático)
inic = open('/Users/raulferrer/Documents/kimi/workspace/raulferrer-web/wordpress/inicio.html', encoding='utf-8').read()
m = re.search(r'(<div class="rfw">.*?</div>)\s*<script>', inic, re.S)
body_inicio = m.group(1)
items = ['Fisioterapia', 'Razonamiento clínico', 'Dolor', 'Educación bioconductual',
         'Salud pública', 'Prevención', 'Salud comunitaria', 'Atención Primaria',
         'Docencia', 'Innovación educativa', 'Salud digital', 'Gestión']
row = ''.join(f'<span>{t} <span style="color:var(--nar)">→</span></span>' for t in items * 2)
body_inicio = body_inicio.replace('<div class="rfw-marq__row" id="rfwMarq"></div>',
                                  f'<div class="rfw-marq__row">{row}</div>')
body_inicio = g.neutralize_anchors(body_inicio)
contents = {1178: ('', body_inicio)}
contents.update(main_pages)
for pid, idx in area_ids.items():
    contents[pid] = ('areas', g.area_detalle(idx))


def rest(method, url, payload=None):
    req = urllib.request.Request(url, method=method)
    req.add_header('Authorization', AUTH)
    data = None
    if payload is not None:
        req.add_header('Content-Type', 'application/json')
        data = json.dumps(payload).encode()
    try:
        r = urllib.request.urlopen(req, data=data, timeout=120)
        return r.status, json.loads(r.read().decode())
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read().decode() or '{}')


def mcp_tool(name, args, id=1):
    body = {'jsonrpc': '2.0', 'id': id, 'method': 'tools/call', 'params': {'name': name, 'arguments': args}}
    req = urllib.request.Request(MCP, data=json.dumps(body).encode(), method='POST')
    req.add_header('Content-Type', 'application/json')
    req.add_header('Accept', 'application/json, text/event-stream')
    req.add_header('Authorization', AUTH)
    req.add_header('Mcp-Session-Id', SID)
    raw = urllib.request.urlopen(req, timeout=120).read().decode()
    for line in raw.splitlines():
        if line.startswith('data:'):
            return json.loads(line[5:].strip())
    return json.loads(raw)


# ── 2) actualizar contenidos ──────────────────────────────────────────────
collected_css = []
for pid in sorted(contents):
    active, body = contents[pid]
    if pid == 1178:
        html = body  # inicio ya es el div completo
    else:
        html = g.doc(active, body)
    # extraer mini-<style> por página (media queries) y pasarlos al CSS global
    for mstyle in re.finditer(r'<style>(.*?)</style>', html, re.S):
        collected_css.append(mstyle.group(1).strip())
    html = re.sub(r'<style>.*?</style>', '', html, flags=re.S)
    assert '<style>' not in html and '<script>' not in html, f'tags prohibidos en {pid}'
    # wpautop convierte saltos de línea en <p>/</p> y rompe las tarjetas:
    # enviamos el HTML minificado en una sola línea para neutralizarlo
    html = re.sub(r'\s*\n\s*', '', html).strip()
    st, d = rest('POST', f'{API}/{pid}', {'content': html})
    print(f"contenido {pid}: {st}")

# ── 3) CSS global ─────────────────────────────────────────────────────────
css_gen = g.CSS.replace(FONT_IMPORT, '').strip()

inic_css = re.search(r'<style>(.*?)</style>', inic, re.S).group(1)
inic_css = inic_css.replace(FONT_IMPORT, '')
# quitar reglas reveal que ocultan (sin JS deben ser visibles)
inic_css = re.sub(r'\.rfw-rv\{[^}]*\}', '.rfw-rv{opacity:1}', inic_css)
inic_css = re.sub(r'\.rfw-rv\.on\{[^}]*\}', '', inic_css)

existing = open('/tmp/rf-existing-custom.css').read()
fontface = open('/tmp/rf-fontface.css').read().strip()
wpautop_fix = (
    '/* — blindaje wpautop: bloques neutralizados en spans dentro de tarjetas-enlace — */\n'
    '.rfw .rfw-b{display:block}\n'
    '.rfw p:empty{display:none}\n'
    '.rfw-areas>p, .rfw-grid>p{display:contents}\n'
    '/* — cabecera a prueba de interferencias (wpautop envuelve en <p> y Divi puede comprimir el flex) — */\n'
    '.rfw-nav p{display:contents}\n'
    '.rfw-nav__brand{flex:0 0 auto}\n'
    '.rfw-nav__brand>span{flex:0 0 auto;white-space:nowrap}\n'
    '.rfw-nav__links{flex:0 1 auto}\n'
    '/* — plantilla en blanco a ancho completo: Divi limita .container (1080px) y #left-area (73.6%) — */\n'
    '.page-template-page-template-blank-php #main-content .container{max-width:100%;width:100%;padding:0}\n'
    '.page-template-page-template-blank-php #main-content .container:before{display:none}\n'
    '.page-template-page-template-blank-php #left-area{width:100%;float:none;padding:0}\n'
    '.page-template-page-template-blank-php #main-content{padding-top:0}\n'
    '.page-template-page-template-blank-php .entry-content{width:100%}\n'
    '/* — colores de botones a prueba de reglas de enlaces de Divi — */\n'
    '.rfw a.rfw-btn--ink, .rfw a.rfw-btn--nar, .rfw a.rfw-btn--ink:visited, .rfw a.rfw-btn--nar:visited{color:#fff !important}\n'
    '.rfw a.rfw-btn--gh, .rfw a.rfw-btn--gh:visited{color:var(--ink) !important}\n'
    '/* — ocultar el título del tema en las páginas del nuevo diseño — */\n'
    '.page-id-1178 .main_title, .page-id-1179 .main_title, .page-id-1180 .main_title, .page-id-1181 .main_title,\n'
    '.page-id-1182 .main_title, .page-id-1183 .main_title, .page-id-1184 .main_title, .page-id-1185 .main_title,\n'
    '.page-id-1186 .main_title, .page-id-1187 .main_title, .page-id-1188 .main_title, .page-id-1189 .main_title,\n'
    '.page-id-1190 .main_title, .page-id-1191 .main_title, .page-id-1192 .main_title, .page-id-1193 .main_title{display:none}\n'
)
final_css = (
    '/* — fuentes del diseño RF (@font-face explícito; @import no sobrevive a la minificación de Divi) — */\n'
    + fontface + '\n\n'
    + existing.rstrip() + '\n\n'
    + '/* ══ Diseño editorial RF (web multipágina 2026) — clases .rfw ══ */\n'
    + css_gen + '\n\n/* — páginas: inicio — */\n'
    + inic_css.strip() + '\n\n/* — media queries por página — */\n'
    + '\n'.join(collected_css) + '\n' + wpautop_fix
)
print('CSS final:', len(final_css), 'caracteres (límite 100000)')
assert len(final_css) < 100000

r = mcp_tool('mcp-adapter-execute-ability', {
    'ability_name': 'raulferrer-content/update-custom-css',
    'parameters': {'css': final_css},
}, 50)
c = r.get('result', {}).get('content', [])
print('update-custom-css:', (c[0]['text'] if c else json.dumps(r))[:300])
