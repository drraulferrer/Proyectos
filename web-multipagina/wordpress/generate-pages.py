#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Genera y crea en WordPress (raulferrer.org) todas las páginas de la propuesta
editorial multipágina como BORRADORES, con slug, jerarquía y plantilla en blanco.
Las imágenes usan las URLs de la biblioteca de medios ya subidas.
"""
import json, urllib.request, sys, re

# ── Config ────────────────────────────────────────────────────────────────
cfg = json.load(open('/Users/raulferrer/.claude.json'))['mcpServers']['raulferrer-wp']
AUTH = cfg['headers']['Authorization']
API = 'https://www.raulferrer.org/wp-json/wp/v2/pages'

FOTO_HERO = 'https://www.raulferrer.org/wp-content/uploads/2026/07/foto-hero.jpg'
FOTO_RAUL = 'https://www.raulferrer.org/wp-content/uploads/2026/07/raul-traje.jpg'
LOGO = 'https://www.raulferrer.org/wp-content/uploads/2026/07/logo-rf.png'
FIRMA = 'https://www.raulferrer.org/wp-content/uploads/2026/07/firma.png'

# ── CSS compartido (mismo que inicio.html + clases de páginas interiores) ──
CSS = """
@import url('https://fonts.googleapis.com/css2?family=Archivo:ital,wght@0,500;0,700;0,800;0,900;1,700&family=Inter:wght@400;500;600&family=Instrument+Serif:ital@0;1&display=swap');
.rfw{ --ink:#171310; --nar:#F27A16; --nard:#D9630C; --line:#E3D8C5; --mut:#7C7161; --cream:#F6F1E7;
  font-family:'Inter',system-ui,sans-serif; background:#fff; color:var(--ink); line-height:1.6; -webkit-font-smoothing:antialiased; }
.rfw *{ box-sizing:border-box; margin:0; }
.rfw img{ max-width:100%; display:block; }
.rfw a{ color:inherit; text-decoration:none; }
.rfw ::selection{ background:var(--nar); color:#fff; }
.rfw-wrap{ max-width:1240px; margin:0 auto; padding:0 24px; }
.rfw-disp{ font-family:'Archivo',sans-serif; font-weight:900; line-height:.95; letter-spacing:-.035em; }
.rfw-kick{ font-family:'Archivo',sans-serif; font-size:.7rem; font-weight:700; text-transform:uppercase; letter-spacing:.28em; color:var(--nar); }
.rfw-serif{ font-family:'Instrument Serif',serif; font-style:italic; font-weight:400; color:var(--nar); }
.rfw-lead{ font-size:clamp(1.05rem,2vw,1.25rem); color:var(--mut); line-height:1.6; }
.rfw-btn{ display:inline-flex; align-items:center; gap:.5rem; border-radius:999px; font-family:'Archivo',sans-serif; font-size:.82rem; font-weight:700; text-transform:uppercase; letter-spacing:.05em; padding:.9rem 1.6rem; transition:all .2s; }
.rfw-btn--ink{ background:var(--ink); color:#fff; } .rfw-btn--ink:hover{ background:var(--nar); transform:translateY(-2px); }
.rfw-btn--nar{ background:var(--nar); color:#fff; } .rfw-btn--nar:hover{ background:var(--ink); transform:translateY(-2px); }
.rfw-btn--gh{ border:1px solid rgba(23,19,16,.25); color:var(--ink); } .rfw-btn--gh:hover{ border-color:var(--nar); color:var(--nar); transform:translateY(-2px); }
.rfw-btn--light{ background:#fff; color:var(--ink); } .rfw-btn--light:hover{ background:var(--nar); color:#fff; transform:translateY(-2px); }
.rfw-btn--out{ border:1px solid rgba(255,255,255,.3); color:#fff; } .rfw-btn--out:hover{ border-color:var(--nar); color:var(--nar); }
.rfw-card{ background:#fff; border:1px solid var(--line); border-radius:18px; transition:all .3s; }
.rfw-card:hover{ border-color:rgba(242,122,22,.5); box-shadow:0 18px 40px -20px rgba(23,19,16,.25); transform:translateY(-4px); }
.rfw-nav{ position:sticky; top:0; z-index:50; background:rgba(255,255,255,.92); backdrop-filter:blur(10px); border-bottom:1px solid var(--line); }
.rfw-nav__in{ display:flex; align-items:center; justify-content:space-between; height:72px; }
.rfw-nav__brand{ display:flex; align-items:center; gap:.7rem; font-family:'Archivo',sans-serif; font-weight:800; font-size:.95rem; }
.rfw-nav__brand img{ height:36px; width:auto; }
.rfw-nav__brand small{ display:block; font-size:.6rem; font-weight:600; letter-spacing:.18em; text-transform:uppercase; color:var(--mut); }
.rfw-nav__links{ display:none; gap:1.5rem; font-size:.85rem; font-weight:600; color:rgba(23,19,16,.7); }
.rfw-nav__links a:hover, .rfw-nav__links a.act{ color:var(--nar); }
@media(min-width:1100px){ .rfw-nav__links{ display:flex; } }
.rfw-nav__cta{ padding:.6rem 1.2rem !important; }
.rfw-sec{ padding:72px 0; }
.rfw-sec--cream{ background:rgba(246,241,231,.5); border-top:1px solid var(--line); border-bottom:1px solid var(--line); }
.rfw-h2{ font-size:clamp(2rem,4.5vw,3.2rem); margin-top:16px; }
.rfw-h3{ font-family:'Archivo',sans-serif; font-weight:800; letter-spacing:-.02em; }
/* page hero */
.rfw-ph{ border-bottom:1px solid var(--line); padding:56px 0 48px; }
.rfw-crumb{ font-size:.72rem; font-weight:600; text-transform:uppercase; letter-spacing:.2em; color:var(--mut); }
.rfw-crumb a:hover{ color:var(--nar); } .rfw-crumb b{ color:var(--nar); font-weight:600; }
.rfw-ph__t{ font-size:clamp(2.4rem,6.5vw,4.8rem); margin-top:18px; max-width:1000px; }
.rfw-ph__l{ margin-top:22px; max-width:680px; }
/* chips */
.rfw-chip{ display:inline-flex; align-items:center; border:1px solid var(--line); background:#fff; border-radius:999px; padding:.35rem .9rem; font-size:.75rem; font-weight:600; color:var(--mut); }
.rfw-chips{ display:flex; flex-wrap:wrap; gap:.5rem; }
/* números outline */
.rfw-num{ font-family:'Archivo',sans-serif; font-weight:900; font-size:2.6rem; -webkit-text-stroke:1.5px rgba(23,19,16,.22); color:transparent; }
/* cards grid */
.rfw-grid{ display:grid; gap:16px; }
@media(min-width:768px){ .rfw-grid--2{ grid-template-columns:repeat(2,1fr); } }
@media(min-width:1100px){ .rfw-grid--3{ grid-template-columns:repeat(3,1fr); } }
.rfw-pad{ padding:26px; height:100%; display:flex; flex-direction:column; }
/* timeline */
.rfw-tl{ list:none; margin:44px 0 0; padding:0 0 0 36px; border-left:2px solid var(--line); max-width:820px; }
.rfw-tl li{ position:relative; padding-bottom:36px; }
.rfw-tl li:last-child{ padding-bottom:0; }
.rfw-tl__dot{ position:absolute; left:-45px; top:6px; width:14px; height:14px; border-radius:50%; border:3px solid var(--nar); background:#fff; }
.rfw-tl__dot--full{ background:var(--nar); }
.rfw-tl__yr{ font-family:'Archivo',sans-serif; font-size:.8rem; font-weight:900; text-transform:uppercase; letter-spacing:.16em; color:var(--nar); }
.rfw-tl h3{ font-size:1.3rem; margin-top:6px; }
.rfw-tl p{ margin-top:6px; color:var(--mut); font-size:.92rem; max-width:620px; }
/* pubs */
.rfw-pub{ display:flex; gap:16px; align-items:flex-start; padding:18px 20px; margin-bottom:12px; }
.rfw-q{ flex:0 0 auto; border-radius:8px; padding:5px 9px; font-family:'Archivo',sans-serif; font-size:.7rem; font-weight:900; color:#fff; }
.rfw-q--1{ background:var(--nar); } .rfw-q--2{ background:var(--ink); }
.rfw-pub small{ font-size:.75rem; color:var(--mut); font-weight:600; }
.rfw-pub h4{ font-size:.92rem; font-weight:700; line-height:1.4; margin-top:4px; }
.rfw-book{ background:var(--cream); border:1px solid var(--line); border-radius:16px; padding:20px 22px; margin-bottom:12px; }
.rfw-book span{ font-family:'Archivo',sans-serif; font-size:.68rem; font-weight:900; text-transform:uppercase; letter-spacing:.16em; color:var(--nar); }
.rfw-book b{ display:block; margin-top:6px; font-size:.98rem; }
.rfw-book small{ display:block; margin-top:4px; color:var(--mut); font-size:.83rem; }
.rfw-more{ display:inline-flex; align-items:center; gap:.4rem; font-family:'Archivo',sans-serif; font-size:.85rem; font-weight:700; text-transform:uppercase; letter-spacing:.06em; color:var(--nar); margin-top:10px; }
.rfw-more:hover{ color:var(--ink); }
/* lista con flechas */
.rfw-al{ list:none; padding:0; }
.rfw-al li{ display:flex; gap:14px; padding:10px 0; color:rgba(23,19,16,.8); }
.rfw-al li b{ color:var(--nar); font-family:'Archivo',sans-serif; font-weight:900; }
/* credenciales */
.rfw-credlist{ list:none; padding:0; border-top:1px solid var(--line); border-bottom:1px solid var(--line); }
.rfw-credlist li{ display:flex; align-items:baseline; justify-content:space-between; gap:24px; padding:16px 0; border-bottom:1px solid var(--line); }
.rfw-credlist li:last-child{ border-bottom:0; }
.rfw-credlist b{ font-family:'Archivo',sans-serif; font-weight:800; letter-spacing:-.01em; }
.rfw-credlist span{ display:block; font-size:.85rem; color:var(--mut); margin-top:2px; }
.rfw-credlist i{ font-style:normal; color:var(--nar); font-family:'Archivo',sans-serif; font-weight:900; flex:0 0 auto; }
/* break / dark */
.rfw-break{ background:var(--nar); color:#fff; }
.rfw-break .rfw-serif{ color:#fff; }
.rfw-break blockquote{ font-family:'Archivo',sans-serif; font-weight:900; font-size:clamp(1.7rem,4vw,2.8rem); line-height:1.05; letter-spacing:-.03em; margin-top:20px; max-width:960px; }
.rfw-dark{ background:var(--ink); color:#fff; }
.rfw-prof{ border:1px solid rgba(255,255,255,.15); background:rgba(255,255,255,.05); border-radius:16px; padding:24px; height:100%; display:flex; flex-direction:column; }
.rfw-prof:hover{ border-color:var(--nar); }
.rfw-prof b{ font-family:'Archivo',sans-serif; font-size:1.2rem; font-weight:800; margin-top:20px; }
.rfw-prof span{ font-size:.85rem; color:rgba(255,255,255,.55); margin-top:4px; }
.rfw-prof svg{ color:var(--nar); }
/* CTA */
.rfw-cta{ position:relative; overflow:hidden; border-radius:26px; background:var(--ink); color:#fff; padding:clamp(2rem,5vw,3.5rem);
  background-image:repeating-linear-gradient(-45deg,rgba(242,122,22,.12) 0 2px,transparent 2px 14px); }
.rfw-cta__grid{ display:grid; gap:36px; align-items:center; }
@media(min-width:900px){ .rfw-cta__grid{ grid-template-columns:1.4fr 1fr; } }
.rfw-cta p{ color:rgba(255,255,255,.65); margin-top:16px; max-width:520px; }
.rfw-cta__firma{ width:250px; max-width:100%; filter:invert(1); opacity:.9; margin:0 auto; }
/* foto */
.rfw-photo{ position:relative; }
.rfw-photo::before{ content:''; position:absolute; left:-14px; top:-14px; width:100%; height:100%; border-radius:26px; border:2px solid var(--nar); }
.rfw-photo img{ position:relative; width:100%; aspect-ratio:4/5; object-fit:cover; object-position:top; border-radius:26px; }
.rfw-photo--solid::before{ background:var(--nar); border:0; }
/* firma bio */
.rfw-firma{ width:280px; max-width:100%; }
/* form */
.rfw-form{ background:#fff; border:1px solid var(--line); border-radius:24px; padding:clamp(1.5rem,4vw,2.6rem); }
.rfw-form label{ display:block; font-size:.85rem; font-weight:600; margin-top:18px; }
.rfw-form input[type=text],.rfw-form input[type=email],.rfw-form textarea{ width:100%; margin-top:8px; border:1px solid var(--line); border-radius:12px; background:#fff; padding:12px 14px; font:inherit; font-size:.9rem; outline:none; }
.rfw-form input:focus,.rfw-form textarea:focus{ border-color:var(--nar); }
.rfw-form .row2{ display:grid; gap:0 18px; } @media(min-width:640px){ .rfw-form .row2{ grid-template-columns:1fr 1fr; } }
.rfw-tipos{ display:flex; flex-wrap:wrap; gap:8px; margin-top:10px; }
.rfw-tipo{ border:1px solid var(--line); background:#fff; color:var(--mut); border-radius:999px; padding:8px 16px; font-size:.75rem; font-weight:600; cursor:pointer; }
.rfw-tipo.sel{ background:var(--nar); border-color:var(--nar); color:#fff; }
.rfw-check{ display:flex; gap:10px; align-items:flex-start; font-size:.78rem; color:var(--mut); margin-top:20px; }
.rfw-copt{ display:flex; align-items:center; justify-content:space-between; gap:14px; padding:22px 24px; margin-bottom:14px; }
.rfw-copt b{ font-family:'Archivo',sans-serif; font-weight:800; display:block; margin-top:6px; }
.rfw-note{ background:var(--cream); border:1px solid var(--line); border-radius:14px; padding:18px 20px; font-size:.85rem; color:var(--mut); }
/* prev/next áreas */
.rfw-pn{ display:grid; border-top:1px solid var(--line); }
@media(min-width:768px){ .rfw-pn{ grid-template-columns:1fr 1fr; } .rfw-pn a:first-child{ border-right:1px solid var(--line); } }
.rfw-pn a{ padding:28px 24px; }
.rfw-pn a:hover{ background:rgba(246,241,231,.6); }
.rfw-pn small{ font-size:.7rem; font-weight:600; text-transform:uppercase; letter-spacing:.2em; color:var(--mut); }
.rfw-pn b{ display:block; font-family:'Archivo',sans-serif; font-size:1.15rem; font-weight:800; margin-top:6px; }
.rfw-pn a:hover b{ color:var(--nar); }
/* footer */
.rfw-foot{ border-top:1px solid var(--line); padding:32px 0; display:flex; flex-wrap:wrap; gap:14px; align-items:center; justify-content:space-between; font-size:.8rem; color:var(--mut); }
.rfw-foot img{ height:34px; width:auto; }
/* NOTA WP: .rfw-rv existe solo como marcador; sin JS todo es visible por defecto */
.rfw-rv{ opacity:1; }
"""

JS = """
(function(){
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('on');io.unobserve(e.target);}});},{threshold:.12});
    document.querySelectorAll('.rfw-rv').forEach(function(el){io.observe(el);});
  }else{ document.querySelectorAll('.rfw-rv').forEach(function(el){el.classList.add('on');}); }
  document.querySelectorAll('.rfw-tipo').forEach(function(b){
    b.addEventListener('click',function(){
      b.parentNode.querySelectorAll('.rfw-tipo').forEach(function(x){x.classList.remove('sel');});
      b.classList.add('sel');
    });
  });
  var f=document.getElementById('rfwForm');
  if(f){ f.addEventListener('submit',function(e){ e.preventDefault();
    f.innerHTML='<div style="text-align:center;padding:2rem 0"><p class="rfw-disp" style="font-size:2.4rem;color:var(--nar)">¡Gracias!</p><p style="color:var(--mut);margin-top:1rem">Tu propuesta está lista. Mientras se conecta el envío automático, escríbeme a <a href="mailto:drraulferrer@gmail.com" style="color:var(--nar);font-weight:600">drraulferrer@gmail.com</a>.</p><img src="__FIRMA__" alt="Firma de Raúl Ferrer" style="width:220px;margin:2rem auto 0"></div>';
  }); }
})();
"""

NAV_ITEMS = [
    ('/', 'Inicio', 'inicio'),
    ('/vision-360/', 'Visión 360º', 'vision'),
    ('/sobre-mi/', 'Sobre mí', 'sobre'),
    ('/areas/', 'Áreas', 'areas'),
    ('/trayectoria/', 'Trayectoria', 'trayectoria'),
    ('/proyectos/', 'Proyectos', 'proyectos'),
    ('/publicaciones/', 'Publicaciones', 'publicaciones'),
    ('/colaboraciones/', 'Colaboraciones', 'colaboraciones'),
]

def nav(active=''):
    links = ''.join(
        f'<a href="{href}"{" class=\"act\"" if key == active else ""}>{label}</a>'
        for href, label, key in NAV_ITEMS[1:]
    )
    return f'''<nav class="rfw-nav"><div class="rfw-wrap rfw-nav__in">
    <a class="rfw-nav__brand" href="/"><img src="{LOGO}" alt="Logotipo RF"><span>Dr. Raúl Ferrer<small>Fisioterapia · Visión 360º</small></span></a>
    <div class="rfw-nav__links">{links}</div>
    <a class="rfw-btn rfw-btn--nar rfw-nav__cta" href="/contacto/">Contacto →</a>
  </div></nav>'''

def pagehero(crumb, kick, title, lead=''):
    lead_html = f'<p class="rfw-lead rfw-ph__l rfw-rv">{lead}</p>' if lead else ''
    return f'''<section class="rfw-ph"><div class="rfw-wrap">
    <p class="rfw-crumb rfw-rv"><a href="/">Inicio</a> <b>/</b> {crumb}</p>
    <p class="rfw-kick rfw-rv" style="margin-top:26px">{kick}</p>
    <h1 class="rfw-disp rfw-ph__t rfw-rv">{title}</h1>{lead_html}
  </div></section>'''

def cta(title='¿Colaboramos?', text='Docencia e innovación educativa, investigación, consultoría, mentoría o proyectos de salud digital. Te respondo personalmente.'):
    return f'''<section class="rfw-sec"><div class="rfw-wrap">
    <div class="rfw-cta rfw-rv"><div class="rfw-cta__grid">
      <div>
        <p class="rfw-kick">Contacto</p>
        <h2 class="rfw-disp" style="font-size:clamp(2rem,4.5vw,3.2rem);margin-top:16px">{title}</h2>
        <p>{text}</p>
        <div style="display:flex;flex-wrap:wrap;gap:.8rem;margin-top:28px">
          <a class="rfw-btn rfw-btn--nar" href="/contacto/">Proponer una colaboración →</a>
          <a class="rfw-btn rfw-btn--out" href="mailto:drraulferrer@gmail.com">drraulferrer@gmail.com</a>
        </div>
      </div>
      <div><img class="rfw-cta__firma" src="{FIRMA}" alt="Firma de Raúl Ferrer"></div>
    </div></div>
  </div></section>'''

def foot():
    return f'''<footer><div class="rfw-wrap rfw-foot">
    <span>© 2026 Dr. Raúl Ferrer Peña · raulferrer.org</span>
    <img src="{FIRMA}" alt="Firma de Raúl Ferrer">
  </div></footer>'''

def neutralize_anchors(html):
    """WordPress wpautop inyecta <p>/</p> alrededor de etiquetas de bloque
    incluso en HTML de una sola línea. Si el bloque está dentro de un <a>, el
    parser HTML5 (adoption agency) parte el enlace en varias cajas. Solución:
    dentro de cada <a> se convierten los bloques en <span class="rfw-b">."""
    def inner_to_spans(m):
        open_tag, inner, close_tag = m.group(1), m.group(2), m.group(3)
        def repl(tm):
            slash, attrs = tm.group(1), tm.group(3)
            if slash:
                return '</span>'
            if 'class="' in attrs:
                attrs = attrs.replace('class="', 'class="rfw-b ', 1)
            else:
                attrs = ' class="rfw-b"' + attrs
            return '<span' + attrs + '>'
        inner = re.sub(r'<(/?)(h[1-6]|p|div|figure|figcaption|blockquote|ul|ol|li)((?:\s[^>]*)?)>', repl, inner)
        return open_tag + inner + close_tag
    return re.sub(r'(<a\s[^>]*>)(.*?)(</a>)', inner_to_spans, html, flags=re.S)


def doc(active, body):
    # WP: sin <style> ni <script> (se eliminan al guardar). El CSS va en el
    # CSS adicional del tema (update-custom-css); todo funciona sin JS.
    return f'<div class="rfw">\n{nav(active)}\n{neutralize_anchors(body)}\n{foot()}\n</div>'


# ══ CUERPOS DE PÁGINA ════════════════════════════════════════════════════

BODY_VISION = pagehero('Visión 360º', 'La idea',
    'Un núcleo,<br><span class="rfw-serif">múltiples</span> direcciones',
    'Mi perfil es amplio, pero no disperso. La fisioterapia es el núcleo desde el que se conectan el razonamiento clínico, el dolor, la prevención, la salud pública y comunitaria, la docencia y la innovación educativa.') + f'''
<section class="rfw-sec"><div class="rfw-wrap" style="display:grid;gap:44px" >
  <div style="display:grid;gap:40px" class="rfw-vision">
    <img src="{LOGO}" alt="Logotipo RF con flechas en todas las direcciones" style="max-width:420px" class="rfw-rv">
    <div class="rfw-rv" style="font-size:1.05rem;color:rgba(23,19,16,.8);max-width:640px">
      <p style="margin-bottom:1rem">El logotipo lo dice sin palabras: un monograma <strong>RF</strong> del que salen <strong style="color:var(--nar)">flechas en todas las direcciones</strong>. Es la metáfora de una forma de entender la profesión — movimiento, dinamismo y versatilidad — sin necesidad de eslogan.</p>
      <p>La amplitud no significa <em class="rfw-serif" style="font-size:1.15rem">hacer de todo</em>, sino comprender la fisioterapia en varios niveles relacionados y aportar valor en cada uno de ellos con rigor y sentido.</p>
    </div>
  </div>
</div></section>
<section class="rfw-sec rfw-sec--cream"><div class="rfw-wrap">
  <p class="rfw-kick rfw-rv">El mapa</p>
  <h2 class="rfw-disp rfw-h2 rfw-rv">Seis niveles de una misma disciplina</h2>
  <div class="rfw-grid rfw-grid--2 rfw-grid--3" style="margin-top:44px">
    <div class="rfw-card rfw-pad rfw-rv"><span class="rfw-num">01</span><h3 class="rfw-h3" style="font-size:1.3rem;margin-top:16px">Persona</h3><p style="margin-top:8px;font-size:.88rem;color:var(--mut)">Experiencia clínica y relación con el paciente. La fisioterapia empieza escuchando a quien tienes delante.</p></div>
    <div class="rfw-card rfw-pad rfw-rv"><span class="rfw-num">02</span><h3 class="rfw-h3" style="font-size:1.3rem;margin-top:16px">Razonamiento</h3><p style="margin-top:8px;font-size:.88rem;color:var(--mut)">Toma de decisiones basada en la evidencia y en el pensamiento crítico clínico.</p></div>
    <div class="rfw-card rfw-pad rfw-rv"><span class="rfw-num">03</span><h3 class="rfw-h3" style="font-size:1.3rem;margin-top:16px">Prevención</h3><p style="margin-top:8px;font-size:.88rem;color:var(--mut)">Salud pública y comunidad: la fisioterapia también cuida antes de que haya lesión.</p></div>
    <div class="rfw-card rfw-pad rfw-rv"><span class="rfw-num">04</span><h3 class="rfw-h3" style="font-size:1.3rem;margin-top:16px">Docencia</h3><p style="margin-top:8px;font-size:.88rem;color:var(--mut)">Formación de profesionales que razonan, no que repiten protocolos.</p></div>
    <div class="rfw-card rfw-pad rfw-rv"><span class="rfw-num">05</span><h3 class="rfw-h3" style="font-size:1.3rem;margin-top:16px">Innovación</h3><p style="margin-top:8px;font-size:.88rem;color:var(--mut)">Tecnología aplicada a la salud y a la educación: IA, simulación, salud digital.</p></div>
    <div class="rfw-card rfw-pad rfw-rv"><span class="rfw-num">06</span><h3 class="rfw-h3" style="font-size:1.3rem;margin-top:16px">Sistema</h3><p style="margin-top:8px;font-size:.88rem;color:var(--mut)">Organizaciones y sistema sanitario: gestión, representación y política profesional.</p></div>
  </div>
</div></section>
<section class="rfw-sec"><div class="rfw-wrap" style="display:grid;gap:36px">
  <h2 class="rfw-disp rfw-h2 rfw-rv" style="max-width:560px">Hoy, el foco está en la <span class="rfw-serif">docencia</span>, el razonamiento y la comunidad</h2>
  <div class="rfw-rv" style="max-width:640px">
    <p style="font-size:1.05rem;color:rgba(23,19,16,.8)">Doctor en Investigación del Dolor, profesor titular de grado en La Salle y con más de 15 años de experiencia asistencial en Atención Primaria, oriento mi trabajo hacia la docencia, el razonamiento clínico, la prevención y la salud comunitaria.</p>
    <div style="display:flex;flex-wrap:wrap;gap:.8rem;margin-top:28px">
      <a class="rfw-btn rfw-btn--ink" href="/sobre-mi/">Sobre mí →</a>
      <a class="rfw-btn rfw-btn--gh" href="/areas/">Conocer las áreas</a>
    </div>
  </div>
</div></section>
<style>@media(min-width:1024px){{ .rfw-vision{{ grid-template-columns:1fr 1.4fr; align-items:center }} }}</style>
''' + cta()

BODY_SOBRE = pagehero('Sobre mí', 'La persona detrás del perfil',
    'Diverso por fuera,<br><span class="rfw-serif">profundo</span> por dentro') + f'''
<section class="rfw-sec"><div class="rfw-wrap"><div class="rfw-sobre" style="display:grid;gap:44px">
  <div class="rfw-rv">
    <div class="rfw-photo"><img src="{FOTO_RAUL}" alt="Dr. Raúl Ferrer Peña"></div>
    <div class="rfw-chips" style="margin-top:26px">
      <span class="rfw-chip">Doctor (PhD)</span><span class="rfw-chip">MBA</span><span class="rfw-chip">Profesor Titular</span><span class="rfw-chip">Fundador &amp; CEO</span>
    </div>
  </div>
  <div class="rfw-rv" style="font-size:1.05rem;color:rgba(23,19,16,.8)">
    <p style="margin-bottom:1rem">Soy fisioterapeuta y Doctor en Investigación del Dolor. En más de <strong>20 años</strong> desde que me titulé, he desarrollado mi trabajo en casi todos los ámbitos de la profesión, con la fisioterapia siempre como núcleo.</p>
    <p style="margin-bottom:1rem">Empecé como fisioterapeuta asistencial en <strong>Atención Primaria</strong>, en las zonas de Entrevías y El Pozo (Madrid), donde durante más de quince años atendí a miles de personas. Esa experiencia es la raíz de mi interés por el <strong>dolor</strong>, el <strong>razonamiento clínico</strong>, la <strong>prevención</strong> y la <strong>salud comunitaria</strong>.</p>
    <p style="margin-bottom:1rem">Con el tiempo, ese trabajo se amplió hacia la <strong>docencia universitaria</strong>, la <strong>investigación</strong> y la <strong>innovación educativa</strong>, sin dejar de mirar la fisioterapia como una disciplina integrada en el sistema sanitario.</p>
    <p>Tras ocho años de responsabilidad institucional en organizaciones profesionales, inicio ahora una <strong>nueva etapa</strong> centrada en la docencia, el razonamiento clínico, la prevención y la salud comunitaria, manteniendo la participación en el Grupo de Trabajo de Salud Comunitaria del Ministerio de Sanidad.</p>
    <img class="rfw-firma" src="{FIRMA}" alt="Firma de Raúl Ferrer" style="margin-top:2.2rem">
    <div style="display:flex;flex-wrap:wrap;gap:.8rem;margin-top:2rem">
      <a class="rfw-btn rfw-btn--ink" href="/trayectoria/">Ver trayectoria →</a>
      <a class="rfw-btn rfw-btn--gh" href="/credenciales/">Reconocimientos y credenciales</a>
    </div>
  </div>
</div></div></section>
<section class="rfw-sec rfw-sec--cream"><div class="rfw-wrap">
  <p class="rfw-kick rfw-rv">Lo que respalda el discurso</p>
  <h2 class="rfw-disp rfw-h2 rfw-rv">Cuatro pilares de autoridad</h2>
  <div class="rfw-grid rfw-grid--2" style="margin-top:44px">
    <div class="rfw-card rfw-pad rfw-rv"><span style="font-family:'Archivo';font-weight:900;color:var(--nar);font-size:1.4rem">→</span><h3 class="rfw-h3" style="font-size:1.2rem;margin-top:10px">Cruz de Honor de Plata</h3><p style="margin-top:8px;font-size:.88rem;color:var(--mut)">De la Sanidad Madrileña (2019), por el compromiso con la atención sanitaria, la formación y la investigación.</p></div>
    <div class="rfw-card rfw-pad rfw-rv"><span style="font-family:'Archivo';font-weight:900;color:var(--nar);font-size:1.4rem">→</span><h3 class="rfw-h3" style="font-size:1.2rem;margin-top:10px">Autor y coordinador</h3><p style="margin-top:8px;font-size:.88rem;color:var(--mut)">De libros de referencia sobre dolor crónico, gestión para fisioterapeutas y salud digital (Modelo GAP, Manuales SED).</p></div>
    <div class="rfw-card rfw-pad rfw-rv"><span style="font-family:'Archivo';font-weight:900;color:var(--nar);font-size:1.4rem">→</span><h3 class="rfw-h3" style="font-size:1.2rem;margin-top:10px">Gobernanza profesional</h3><p style="margin-top:8px;font-size:.88rem;color:var(--mut)">8 años en la Junta de Gobierno del Colegio de Fisioterapeutas de Madrid y Consejero Electo del Consejo General.</p></div>
    <div class="rfw-card rfw-pad rfw-rv"><span style="font-family:'Archivo';font-weight:900;color:var(--nar);font-size:1.4rem">→</span><h3 class="rfw-h3" style="font-size:1.2rem;margin-top:10px">Calidad y acreditación</h3><p style="margin-top:8px;font-size:.88rem;color:var(--mut)">Comisión de Garantía de Calidad de la URJC desde 2023; auditor interno AUDIT (ANECA) y evaluación DOCENTIA.</p></div>
  </div>
</div></section>
<style>@media(min-width:1024px){{ .rfw-sobre{{ grid-template-columns:1fr 1.35fr }} }}</style>
''' + cta()

AREAS_DATA = [
    ('razonamiento-clinico-dolor', '01', 'Razonamiento clínico, dolor y educación bioconductual',
     'El razonamiento clínico como eje de la práctica: cómo pensamos, decidimos y abordamos el dolor, integrando la educación terapéutica y bioconductual.',
     ['Razonamiento clínico', 'Dolor', 'Educación bioconductual', 'Educación terapéutica', 'Sistema neuromusculoesquelético', 'Síndrome de dolor miofascial', 'Práctica basada en evidencia'],
     ['Razonamiento clínico como competencia central de la práctica fisioterapéutica.',
      'Abordaje del dolor crónico desde la educación en neurociencia del dolor.',
      'Educación terapéutica y bioconductual aplicada a la consulta y a la docencia.',
      'Investigación activa: consensos Delphi internacionales y ensayos clínicos.']),
    ('salud-publica-prevencion', '02', 'Salud pública, prevención y salud comunitaria',
     'El papel de la fisioterapia en la salud de las poblaciones: promoción, prevención, educación para la salud y comunidad.',
     ['Salud pública', 'Promoción de la salud', 'Prevención', 'Educación sanitaria', 'Determinantes de salud', 'Salud comunitaria', 'Perspectiva poblacional'],
     ['Docencia de grado en Salud Pública y Fisioterapia Preventiva.',
      'Delegado en el Grupo de Trabajo de Salud Comunitaria del Ministerio de Sanidad.',
      'Participación en grupos de trabajo de la Gerencia Asistencial de Atención Primaria de la Comunidad de Madrid.',
      'Visión de la fisioterapia integrada en el sistema sanitario.']),
    ('atencion-primaria', '03', 'Atención Primaria',
     'Más de 15 años de práctica asistencial y una mirada de la fisioterapia integrada en el sistema sanitario. Más de 10.000 pacientes atendidos.',
     ['Atención Primaria', '+10.000 pacientes', 'Integración en el sistema', 'Trabajo interdisciplinar', 'Grupo de Salud Comunitaria (Ministerio)'],
     ['Práctica clínica en los centros de Entrevías y El Pozo (Madrid) desde 2006.',
      'Más de 10.000 pacientes atendidos de una población asignada de 35.000 personas.',
      'Desarrollo de la fisioterapia en Atención Primaria a nivel local y nacional.',
      'Autor del libro «Cerrar la brecha» (Modelo GAP) sobre reorganización de la Atención Primaria.']),
    ('docencia-innovacion', '04', 'Docencia e innovación educativa',
     'Formar el razonamiento profesional: metodologías, diseño de aprendizaje, mentoría y tecnología educativa aplicada a la fisioterapia.',
     ['Profesor Titular (La Salle)', 'Filosofía docente', 'Metodologías docentes', 'Diseño de aprendizaje', 'Tecnología educativa', 'IA en educación', 'Mentoría'],
     ['Profesor Titular en el Grado en Fisioterapia de CSEU La Salle (UAM) desde 2013.',
      'Docencia de posgrado en el Máster de Salud Digital y fisioterapia bioconductual.',
      'Innovación docente con IA, simulación clínica y metodologías activas (grupo INDOCLIN).',
      'Miembro de la Comisión de Garantía de Calidad de la URJC; auditor interno AUDIT (ANECA).']),
    ('salud-digital', '05', 'Salud digital',
     'Salud digital aplicada a la práctica y a la educación: docencia en salud digital y coordinación de la asignatura de Gestión de Proyectos de Salud Digital.',
     ['Docencia en salud digital', 'Gestión de proyectos de salud digital', 'Innovación', 'Mentoría (#Sherpas20)', 'Emprendimiento (Smart Dyspnea)', 'Transformación digital'],
     ['Coordinación de la asignatura de Gestión de Proyectos de Salud Digital.',
      'Fundador de Smart Dyspnea, startup de IA en salud premiada en hackatones COVID.',
      'Sherpa de Fisioterapia en #Sherpas20 desde 2014: mentoría para reducir la brecha digital.',
      'Coautor de «Salud digital. Guía para profesionales» (Editorial SED, grupo SEDTECH).']),
    ('gestion-direccion', '06', 'Gestión y dirección',
     'Dirección y gestión de proyectos con visión estratégica, respaldada por un MBA y años de representación y responsabilidad institucional.',
     ['MBA', 'Dirección de proyectos', 'Gestión sanitaria', 'Estrategia', 'Representación profesional', 'Liderazgo de equipos'],
     ['MBA en dirección y gestión de proyectos.',
      'Ocho años en la Junta de Gobierno del Colegio de Fisioterapeutas de Madrid (Vocal, Vicesecretario).',
      'Consejero Electo del Consejo General de Colegios de Fisioterapeutas.',
      'Coautor del Marco de Competencias en Gestión para fisioterapeutas.']),
]

# Fotos de cada área (biblioteca de medios, jul 2026) + retrato corporativo
AREAS_FOTOS = {
    0: ('https://www.raulferrer.org/wp-content/uploads/2026/07/ecografia-clinica.jpg',
        'Ecografía musculoesquelética en la práctica clínica'),
    1: ('https://www.raulferrer.org/wp-content/uploads/2026/07/taller-comunitario.jpg',
        'Taller de educación para la salud con la comunidad'),
    2: ('https://www.raulferrer.org/wp-content/uploads/2026/07/consulta-paciente.jpg',
        'Consulta de fisioterapia en Atención Primaria'),
    3: ('https://www.raulferrer.org/wp-content/uploads/2026/07/formacion-profesionales.jpg',
        'Formación a profesionales sanitarios: proceso asistencial'),
    4: ('https://www.raulferrer.org/wp-content/uploads/2026/07/salud-digital-datos.jpg',
        'Gestión de proyectos y datos de salud digital'),
    5: ('https://www.raulferrer.org/wp-content/uploads/2026/07/raul-traje.jpg',
        'Dirección y gestión de proyectos sanitarios'),
}

def areas_hub():
    cards = ''
    for slug, num, title, lead, chips, puntos in AREAS_DATA:
        chips_html = ''.join(f'<span class="rfw-chip">{c}</span>' for c in chips[:4])
        cards += f'''<a class="rfw-card rfw-pad rfw-rv" href="/areas/{slug}/">
      <span class="rfw-num">{num}</span>
      <h3 class="rfw-h3" style="font-size:1.35rem;margin-top:18px;line-height:1.2">{title}</h3>
      <p style="margin-top:10px;font-size:.9rem;color:var(--mut);flex:1">{lead}</p>
      <div class="rfw-chips" style="margin-top:16px">{chips_html}</div>
    </a>'''
    return pagehero('Áreas', 'Áreas de conocimiento',
        'Seis direcciones,<br>una misma <span class="rfw-serif">mirada</span>',
        'Los vectores del perfil. Cada uno se explica por lo que aporta —experiencia, evidencia y beneficios—, no solo por cargos.') + f'''
<section class="rfw-sec"><div class="rfw-wrap">
  <div class="rfw-grid rfw-grid--2">{cards}</div>
</div></section>
''' + cta()

def area_detalle(idx):
    slug, num, title, lead, chips, puntos = AREAS_DATA[idx]
    prev_a = AREAS_DATA[(idx - 1) % 6]
    next_a = AREAS_DATA[(idx + 1) % 6]
    puntos_html = ''.join(f'<li><b>→</b><span>{p}</span></li>' for p in puntos)
    chips_html = ''.join(f'<span class="rfw-chip">{c}</span>' for c in chips)
    return pagehero('<a href="/areas/">Áreas</a>', f'Área {num}', title, lead) + f'''
<section class="rfw-sec"><div class="rfw-wrap" style="display:grid;gap:44px" id="rfwAreaDet">
  <div>
    <h2 class="rfw-h3 rfw-rv" style="font-size:1.5rem">Qué aporta esta área</h2>
    <ul class="rfw-al rfw-rv" style="margin-top:18px">{puntos_html}</ul>
    <p class="rfw-rv" style="margin-top:22px;color:var(--mut)">Esta área conecta con la docencia, la investigación y las publicaciones relacionadas.</p>
    <div class="rfw-rv" style="display:flex;flex-wrap:wrap;gap:.8rem;margin-top:26px">
      <a class="rfw-btn rfw-btn--gh" href="https://pubmed.ncbi.nlm.nih.gov/?term=Ferrer-Pe%C3%B1a+R%5BAuthor%5D&sort=date" target="_blank" rel="noopener">Publicaciones relacionadas ↗</a>
      <a class="rfw-btn rfw-btn--ink" href="/colaboraciones/">Proponer una colaboración →</a>
    </div>
  </div>
  <div class="rfw-rv">
    <div class="rfw-photo" style="margin-bottom:34px"><img src="{AREAS_FOTOS[idx][0]}" alt="{AREAS_FOTOS[idx][1]}" style="aspect-ratio:4/3;object-position:center"></div>
    <div style="background:rgba(246,241,231,.6);border:1px solid var(--line);border-radius:18px;padding:28px">
      <p class="rfw-kick">Temas relacionados</p>
      <div class="rfw-chips" style="margin-top:18px">{chips_html}</div>
    </div>
  </div>
</div></section>
<style>@media(min-width:1024px){{ #rfwAreaDet{{ grid-template-columns:1.4fr 1fr }} }}</style>
<nav class="rfw-pn">
  <a href="/areas/{prev_a[0]}/"><small>← Área anterior</small><b>{prev_a[2]}</b></a>
  <a href="/areas/{next_a[0]}/" style="text-align:right"><small>Área siguiente →</small><b>{next_a[2]}</b></a>
</nav>
''' + cta()

BODY_TRAYECTORIA = pagehero('Trayectoria', 'Recorrido',
    'Veinte años<br>en <span class="rfw-serif">movimiento</span>',
    'Más de 20 años de experiencia que sostienen la autoridad del perfil: de la consulta al aula, la investigación, la innovación y la gestión.') + '''
<section class="rfw-sec"><div class="rfw-wrap">
  <ol class="rfw-tl">
    <li class="rfw-rv"><span class="rfw-tl__dot"></span><span class="rfw-tl__yr">2006</span><h3 class="rfw-h3">Fisioterapeuta en Atención Primaria</h3><p>Diplomado en Fisioterapia. Inicio de la práctica clínica en los centros de Entrevías y El Pozo (Madrid), donde atendería a más de 10.000 pacientes.</p></li>
    <li class="rfw-rv"><span class="rfw-tl__dot"></span><span class="rfw-tl__yr">2012</span><h3 class="rfw-h3">Funda Fisioterapia Sin Red (#FSR)</h3><p>De la I Jornada Clínica a la segunda asociación de fisioterapia con más socios de España. Presidente desde su inicio.</p></li>
    <li class="rfw-rv"><span class="rfw-tl__dot"></span><span class="rfw-tl__yr">2013</span><h3 class="rfw-h3">Profesor Titular · CSEU La Salle (UAM)</h3><p>Docencia de grado en Salud Pública, Fisioterapia Preventiva y Métodos Específicos. Desde 2015, también docencia de posgrado.</p></li>
    <li class="rfw-rv"><span class="rfw-tl__dot"></span><span class="rfw-tl__yr">2014</span><h3 class="rfw-h3">Coordinador de los Sherpas de Fisioterapia</h3><p>Iniciativa #Sherpas20: salud digital y mentoría para reducir la brecha digital en salud.</p></li>
    <li class="rfw-rv"><span class="rfw-tl__dot"></span><span class="rfw-tl__yr">2015</span><h3 class="rfw-h3">Máster Universitario en Fisioterapia Manual</h3><p>Universidad de Alcalá.</p></li>
    <li class="rfw-rv"><span class="rfw-tl__dot"></span><span class="rfw-tl__yr">2018</span><h3 class="rfw-h3">Representación profesional</h3><p>Junta de Gobierno de CFISIOMAD y Consejero Electo del Consejo General de Colegios de Fisioterapeutas.</p></li>
    <li class="rfw-rv"><span class="rfw-tl__dot"></span><span class="rfw-tl__yr">2019</span><h3 class="rfw-h3">Cruz de Honor de Plata de la Comunidad de Madrid</h3><p>Reconocimiento por el compromiso con la atención sanitaria, la formación y la investigación. Delegado en el Ministerio de Sanidad.</p></li>
    <li class="rfw-rv"><span class="rfw-tl__dot"></span><span class="rfw-tl__yr">2020</span><h3 class="rfw-h3">Doctor en Investigación del Dolor · cum laude</h3><p>Máxima graduación académica por la URJC. Funda Smart Dyspnea (IA en salud), premiada en hackatones COVID.</p></li>
    <li class="rfw-rv"><span class="rfw-tl__dot"></span><span class="rfw-tl__yr">2023</span><h3 class="rfw-h3">Dirección y calidad</h3><p>Director del grupo INDOCLIN y miembro de la Comisión de Garantía de Calidad de la URJC.</p></li>
    <li class="rfw-rv"><span class="rfw-tl__dot rfw-tl__dot--full"></span><span class="rfw-tl__yr">Hoy</span><h3 class="rfw-h3">Nueva etapa: docencia, razonamiento y gestión</h3><p>Foco en la docencia, el razonamiento clínico, la prevención y la salud comunitaria, con el MBA y la gestión de proyectos de salud digital.</p></li>
  </ol>
  <div class="rfw-rv" style="margin-top:40px"><a class="rfw-btn rfw-btn--ink" href="/credenciales/">Reconocimientos y credenciales →</a></div>
</div></section>
''' + cta()


BODY_CREDENCIALES = pagehero('Credenciales', 'Credenciales',
    'Reconocimientos<br>y <span class="rfw-serif">credenciales</span>',
    'Formación, docencia, reconocimientos y experiencia institucional que respaldan el perfil.') + '''
<section class="rfw-sec"><div class="rfw-wrap"><div class="rfw-grid rfw-grid--2" style="align-items:start">
  <div class="rfw-rv"><p class="rfw-kick">Formación académica</p>
    <ul class="rfw-credlist" style="margin-top:18px">
      <li><div><b>Doctor en Investigación del Dolor</b><span>URJC · cum laude (2020)</span></div><i>→</i></li>
      <li><div><b>MBA</b><span>Dirección y gestión de proyectos</span></div><i>→</i></li>
      <li><div><b>Máster en Fisioterapia Manual</b><span>Universidad de Alcalá (2015)</span></div><i>→</i></li>
      <li><div><b>Diplomado en Fisioterapia</b><span>Inicio profesional (2006)</span></div><i>→</i></li>
    </ul></div>
  <div class="rfw-rv"><p class="rfw-kick">Actividad docente</p>
    <ul class="rfw-credlist" style="margin-top:18px">
      <li><div><b>Profesor Titular · La Salle (UAM)</b><span>Salud Pública, Fisioterapia Preventiva y Métodos Específicos</span></div><i>→</i></li>
      <li><div><b>Docencia de posgrado</b><span>Educación Terapéutica y Salud Digital</span></div><i>→</i></li>
      <li><div><b>Coordinación de asignatura</b><span>Gestión de Proyectos de Salud Digital</span></div><i>→</i></li>
      <li><div><b>Dos sexenios de investigación</b><span>Reconocidos por la CNEAI</span></div><i>→</i></li>
    </ul></div>
  <div class="rfw-rv"><p class="rfw-kick">Reconocimientos</p>
    <ul class="rfw-credlist" style="margin-top:18px">
      <li><div><b>Cruz de Honor de Plata</b><span>Comunidad de Madrid (2019)</span></div><i>→</i></li>
      <li><div><b>Presidente fundador</b><span>Fisioterapia Sin Red (#FSR)</span></div><i>→</i></li>
      <li><div><b>Comisión de Garantía de Calidad</b><span>URJC (2023) · Auditor interno AUDIT (ANECA)</span></div><i>→</i></li>
    </ul></div>
  <div class="rfw-rv"><p class="rfw-kick">Experiencia institucional</p>
    <ul class="rfw-credlist" style="margin-top:18px">
      <li><div><b>CFISIOMAD</b><span>Junta de Gobierno (Vocal, Vicesecretario) · 8 años</span></div><i>→</i></li>
      <li><div><b>Consejo General de Fisioterapeutas</b><span>Consejero Electo</span></div><i>→</i></li>
      <li><div><b>Ministerio de Sanidad</b><span>Grupo de Trabajo de Salud Comunitaria (vigente)</span></div><i>→</i></li>
    </ul></div>
</div></div></section>
<section class="rfw-sec rfw-dark"><div class="rfw-wrap">
  <p class="rfw-kick rfw-rv">Huella académica</p>
  <h2 class="rfw-disp rfw-h2 rfw-rv">Perfiles verificables</h2>
  <div class="rfw-grid rfw-grid--2 rfw-grid--3" style="margin-top:40px">
    <a class="rfw-prof rfw-rv" href="https://orcid.org/0000-0001-5495-8458" target="_blank" rel="noopener"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M7 17L17 7M17 7H8M17 7v9"/></svg><b>ORCID</b><span>Perfil de investigación</span></a>
    <a class="rfw-prof rfw-rv" href="https://pubmed.ncbi.nlm.nih.gov/?term=Ferrer-Pe%C3%B1a+R%5BAuthor%5D&sort=date" target="_blank" rel="noopener"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M7 17L17 7M17 7H8M17 7v9"/></svg><b>PubMed</b><span>Publicaciones indexadas</span></a>
    <a class="rfw-prof rfw-rv" href="#"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M7 17L17 7M17 7H8M17 7v9"/></svg><b>ResearchGate</b><span>Producción científica</span></a>
    <a class="rfw-prof rfw-rv" href="#"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M7 17L17 7M17 7H8M17 7v9"/></svg><b>LinkedIn</b><span>Perfil profesional</span></a>
  </div>
</div></section>
''' + cta()

BODY_PROYECTOS = pagehero('Proyectos', 'Proyectos e impacto',
    'Proyectos que<br><span class="rfw-serif">abren</span> caminos',
    'Capacidad demostrada mediante proyectos explicados por contexto, aportación y resultados. Los proyectos vigentes se distinguen claramente de los históricos.') + '''
<section class="rfw-sec"><div class="rfw-wrap">
  <p class="rfw-kick rfw-rv">Ahora mismo</p>
  <h2 class="rfw-disp rfw-h2 rfw-rv">Proyectos vigentes</h2>
  <div class="rfw-grid rfw-grid--2" style="margin-top:40px">
    <article class="rfw-pad rfw-rv" style="background:var(--ink);color:#fff;border-radius:18px;border:1px solid var(--ink)">
      <div><span style="float:right;background:var(--nar);color:#fff;font-size:.62rem;font-weight:700;text-transform:uppercase;letter-spacing:.08em;border-radius:999px;padding:4px 10px">Vigente</span><span style="font-size:.75rem;color:rgba(255,255,255,.5);font-weight:600">2020 — hoy</span></div>
      <h3 class="rfw-h3" style="font-size:1.5rem;margin-top:18px">Smart Dyspnea</h3>
      <p style="font-family:'Archivo';font-size:.66rem;font-weight:700;text-transform:uppercase;letter-spacing:.16em;color:var(--nar);margin-top:4px">Fundador &amp; CEO</p>
      <p style="margin-top:12px;font-size:.88rem;color:rgba(255,255,255,.7);flex:1">Startup de IA en salud que estima la desaturación de oxígeno a partir de la voz, desde el propio móvil. Premios «The Good Algorithms» y Hackathon «Vence al Virus».</p>
    </article>
    <article class="rfw-card rfw-pad rfw-rv">
      <div><span style="float:right;background:#FBE3CE;color:var(--nard);font-size:.62rem;font-weight:700;text-transform:uppercase;letter-spacing:.08em;border-radius:999px;padding:4px 10px">Vigente</span><span style="font-size:.75rem;color:var(--mut);font-weight:600">2023 — hoy</span></div>
      <h3 class="rfw-h3" style="font-size:1.5rem;margin-top:18px">INDOCLIN</h3>
      <p style="font-family:'Archivo';font-size:.66rem;font-weight:700;text-transform:uppercase;letter-spacing:.16em;color:var(--nar);margin-top:4px">Director del grupo</p>
      <p style="margin-top:12px;font-size:.88rem;color:var(--mut);flex:1">Grupo clínico-docente en ciencias de la rehabilitación: IA en el razonamiento clínico, analítica del aprendizaje (CuSAERS) y simulación.</p>
    </article>
    <article class="rfw-card rfw-pad rfw-rv">
      <div><span style="float:right;background:#FBE3CE;color:var(--nard);font-size:.62rem;font-weight:700;text-transform:uppercase;letter-spacing:.08em;border-radius:999px;padding:4px 10px">Vigente</span><span style="font-size:.75rem;color:var(--mut);font-weight:600">2014 — hoy</span></div>
      <h3 class="rfw-h3" style="font-size:1.5rem;margin-top:18px">#Sherpas20</h3>
      <p style="font-family:'Archivo';font-size:.66rem;font-weight:700;text-transform:uppercase;letter-spacing:.16em;color:var(--nar);margin-top:4px">Sherpa de Fisioterapia</p>
      <p style="margin-top:12px;font-size:.88rem;color:var(--mut);flex:1">Grupo multidisciplinar de referentes en salud digital. Lidero el grupo de fisioterapia, mentorizando a profesionales y pacientes para reducir la brecha digital.</p>
    </article>
    <article class="rfw-card rfw-pad rfw-rv">
      <div><span style="float:right;background:#FBE3CE;color:var(--nard);font-size:.62rem;font-weight:700;text-transform:uppercase;letter-spacing:.08em;border-radius:999px;padding:4px 10px">Vigente</span><span style="font-size:.75rem;color:var(--mut);font-weight:600">2010 — hoy</span></div>
      <h3 class="rfw-h3" style="font-size:1.5rem;margin-top:18px">Docencia de grado · La Salle (UAM)</h3>
      <p style="font-family:'Archivo';font-size:.66rem;font-weight:700;text-transform:uppercase;letter-spacing:.16em;color:var(--nar);margin-top:4px">Profesor Titular</p>
      <p style="margin-top:12px;font-size:.88rem;color:var(--mut);flex:1">Salud pública, fisioterapia preventiva y métodos específicos en el sistema neuromusculoesquelético.</p>
    </article>
  </div>
</div></section>
<section class="rfw-sec rfw-sec--cream"><div class="rfw-wrap">
  <p class="rfw-kick rfw-rv">Casos destacados</p>
  <h2 class="rfw-disp rfw-h2 rfw-rv">Trayectoria de proyectos</h2>
  <div class="rfw-grid rfw-grid--2" style="margin-top:40px">
    <article class="rfw-card rfw-pad rfw-rv"><span style="font-size:.75rem;color:var(--mut);font-weight:600">2012 — 2018</span>
      <h3 class="rfw-h3" style="font-size:1.5rem;margin-top:14px">Fisioterapia Sin Red</h3>
      <p style="font-family:'Archivo';font-size:.66rem;font-weight:700;text-transform:uppercase;letter-spacing:.16em;color:var(--nar);margin-top:4px">Socio fundador y presidente</p>
      <p style="margin-top:12px;font-size:.88rem;color:var(--mut);flex:1">La asociación por la inteligencia colectiva que llegó a ser la segunda con más socios de España y un revulsivo para la profesión.</p>
    </article>
    <article class="rfw-card rfw-pad rfw-rv"><span style="font-size:.75rem;color:var(--mut);font-weight:600">2012</span>
      <h3 class="rfw-h3" style="font-size:1.5rem;margin-top:14px">Mírame, Diferénciate</h3>
      <p style="font-family:'Archivo';font-size:.66rem;font-weight:700;text-transform:uppercase;letter-spacing:.16em;color:var(--nar);margin-top:4px">Impulsor</p>
      <p style="margin-top:12px;font-size:.88rem;color:var(--mut);flex:1">El movimiento que humanizó la asistencia sanitaria en la red junto a un grupo de profesionales sanitarios.</p>
    </article>
  </div>
</div></section>
''' + cta('¿Tienes un proyecto en mente?', 'Investigación aplicada, innovación educativa, salud digital o alianzas institucionales. Cuéntame el reto y buscamos el enfoque.')

BODY_PUBLICACIONES = pagehero('Publicaciones', 'Actividad investigadora',
    'La evidencia,<br><span class="rfw-serif">publicada</span>',
    'Producción reciente en primer cuartil, con edición invitada en revistas internacionales. Investigación en dolor, educación en neurociencia del dolor, neurofisioterapia y salud digital.') + '''
<section class="rfw-sec"><div class="rfw-wrap"><div id="rfwPubs" style="display:grid;gap:48px">
  <div>
    <h2 class="rfw-h3 rfw-rv" style="font-size:1.4rem">Artículos recientes</h2>
    <div style="margin-top:22px">
      <article class="rfw-card rfw-pub rfw-rv"><span class="rfw-q rfw-q--1">Q1</span><div><small>Physical Therapy · 2026</small><h4>Toward a shared framework for therapeutic pain education: a Delphi-based international consensus</h4></div></article>
      <article class="rfw-card rfw-pub rfw-rv"><span class="rfw-q rfw-q--1">Q1</span><div><small>JMIR Formative Research · 2025</small><h4>Feasibility of a Randomized Controlled Trial of Large AI-Based Linguistic Models for Clinical Reasoning Training of Physical Therapy Students</h4></div></article>
      <article class="rfw-card rfw-pub rfw-rv"><span class="rfw-q rfw-q--1">Q1</span><div><small>JMIR Medical Education · 2025</small><h4>Student satisfaction in social media-based learning environments: the CuSAERS questionnaire</h4></div></article>
      <article class="rfw-card rfw-pub rfw-rv"><span class="rfw-q rfw-q--2">Q2</span><div><small>Brain Sciences · 2026</small><h4>Advancing neurological rehabilitation: the BRAIN framework for clinical reasoning in neurophysiotherapy</h4></div></article>
      <article class="rfw-card rfw-pub rfw-rv"><span class="rfw-q rfw-q--2">Q2</span><div><small>Neurology International · 2026</small><h4>Effectiveness of physiotherapy interventions on executive function in patients with chronic pain</h4></div></article>
      <article class="rfw-card rfw-pub rfw-rv"><span class="rfw-q rfw-q--2">Q2</span><div><small>Healthcare (Basel) · 2025</small><h4>Pain Neuroscience Education Reduces Pain and Improves Psychological Variables but Does Not Induce Plastic Changes Measured by BDNF</h4></div></article>
    </div>
    <a class="rfw-more rfw-rv" href="https://pubmed.ncbi.nlm.nih.gov/?term=Ferrer-Pe%C3%B1a+R%5BAuthor%5D&sort=date" target="_blank" rel="noopener">Ver todas en PubMed ↗</a>
  </div>
  <div>
    <h2 class="rfw-h3 rfw-rv" style="font-size:1.4rem">Libros y monografías</h2>
    <div style="margin-top:22px">
      <div class="rfw-book rfw-rv"><span>2026</span><b>Cerrar la brecha (Modelo GAP)</b><small>Estrategias para reorganizar la Atención Primaria alrededor de la persona.</small></div>
      <div class="rfw-book rfw-rv"><span>2026</span><b>Marco de competencias en gestión para fisioterapeutas</b><small>Coautor · referente en gestión profesional.</small></div>
      <div class="rfw-book rfw-rv"><span>2026</span><b>Salud digital. Guía para profesionales</b><small>Editorial SED (grupo SEDTECH) · Coautor.</small></div>
      <div class="rfw-book rfw-rv"><span>2023–2025</span><b>Manuales de dolor crónico y autocuidado</b><small>Coordinador y coautor · en español e inglés.</small></div>
    </div>
    <a class="rfw-more rfw-rv" href="https://orcid.org/0000-0001-5495-8458" target="_blank" rel="noopener">Perfil ORCID ↗</a>
  </div>
</div></div></section>
<style>@media(min-width:1024px){{ #rfwPubs{{ grid-template-columns:1.5fr 1fr }} }}</style>
''' + cta('¿Colaboramos en investigación?', 'Líneas abiertas en dolor, educación en neurociencia del dolor, neurofisioterapia, IA en educación y salud digital.')

BODY_COLABORACIONES = pagehero('Colaboraciones', 'Colaboraciones',
    'Formas de<br><span class="rfw-serif">trabajar</span> juntos',
    'Convertir la experiencia en oportunidades seleccionadas. Estas son las modalidades en las que puedo aportar valor.') + '''
<section class="rfw-sec"><div class="rfw-wrap">
  <div class="rfw-grid rfw-grid--2">
    <div class="rfw-card rfw-pad rfw-rv"><span class="rfw-num">01</span><h3 class="rfw-h3" style="font-size:1.4rem;margin-top:18px">Consultoría</h3><p style="margin-top:10px;color:var(--mut);font-size:.92rem">Fisioterapia y Atención Primaria, salud pública y comunitaria, prevención, diseño de programas formativos, innovación educativa y estrategia digital.</p></div>
    <div class="rfw-card rfw-pad rfw-rv"><span class="rfw-num">02</span><h3 class="rfw-h3" style="font-size:1.4rem;margin-top:18px">Mentoría</h3><p style="margin-top:10px;color:var(--mut);font-size:.92rem">Acompañamiento a fisioterapeutas, docentes e investigadores en etapas iniciales y a profesionales con perfiles multidisciplinares.</p></div>
    <div class="rfw-card rfw-pad rfw-rv"><span class="rfw-num">03</span><h3 class="rfw-h3" style="font-size:1.4rem;margin-top:18px">Formación y conferencias</h3><p style="margin-top:10px;color:var(--mut);font-size:.92rem">Ponencias, talleres y programas —presenciales u online— sobre razonamiento clínico, dolor, prevención y docencia.</p></div>
    <div class="rfw-card rfw-pad rfw-rv"><span class="rfw-num">04</span><h3 class="rfw-h3" style="font-size:1.4rem;margin-top:18px">Proyectos y alianzas</h3><p style="margin-top:10px;color:var(--mut);font-size:.92rem">Investigación aplicada, innovación educativa, salud digital, divulgación y alianzas institucionales seleccionadas.</p></div>
  </div>
  <div class="rfw-break rfw-rv" style="border-radius:26px;margin-top:56px;padding:clamp(2rem,5vw,3.2rem)">
    <p style="font-family:'Archivo';font-size:.7rem;font-weight:700;text-transform:uppercase;letter-spacing:.28em;color:rgba(255,255,255,.7)">Método de trabajo</p>
    <blockquote>Escucho el reto, propongo un enfoque claro y trabajo de forma rigurosa y colaborativa, con objetivos y resultados definidos.</blockquote>
    <div style="margin-top:28px"><a class="rfw-btn rfw-btn--light" href="/contacto/">Proponer una colaboración →</a></div>
  </div>
</div></section>
''' + cta()

BODY_CONTACTO = pagehero('Contacto', 'Contacto',
    'Hablemos de una<br><span class="rfw-serif">colaboración</span>',
    'Cuéntame qué necesitas. Este formulario está orientado a colaboraciones profesionales, no a consultas clínicas.') + f'''
<section class="rfw-sec"><div class="rfw-wrap"><div id="rfwContacto" style="display:grid;gap:44px">
  <form class="rfw-form rfw-rv" id="rfwForm">
    <div class="row2">
      <label>Nombre<input type="text" required placeholder="Tu nombre"></label>
      <label>Organización<input type="text" placeholder="Empresa, universidad, colegio…"></label>
    </div>
    <label>Correo electrónico<input type="email" required placeholder="nombre@organizacion.com"></label>
    <label>Tipo de colaboración</label>
    <div class="rfw-tipos">
      <button type="button" class="rfw-tipo sel">Consultoría</button>
      <button type="button" class="rfw-tipo">Mentoría</button>
      <button type="button" class="rfw-tipo">Formación o conferencia</button>
      <button type="button" class="rfw-tipo">Proyecto o alianza</button>
      <button type="button" class="rfw-tipo">Medios de comunicación</button>
      <button type="button" class="rfw-tipo">Otra consulta</button>
    </div>
    <label>Descripción<textarea rows="4" required placeholder="Cuéntame el reto, el contexto y qué esperas conseguir…"></textarea></label>
    <label>Plazo aproximado<input type="text" placeholder="Ej.: próximo trimestre, sin prisa…"></label>
    <label class="rfw-check"><input type="checkbox" required style="margin-top:3px"> He leído y acepto la política de privacidad y el tratamiento de mis datos para responder a esta solicitud.</label>
    <div style="margin-top:26px"><button type="submit" class="rfw-btn rfw-btn--nar" style="border:0;cursor:pointer">Enviar propuesta →</button></div>
    <p class="rfw-note" style="margin-top:22px">El envío se conectará al correo profesional en la implementación final. Mientras tanto, puedes escribir directamente a <a href="mailto:drraulferrer@gmail.com" style="color:var(--nar);font-weight:600">drraulferrer@gmail.com</a>.</p>
  </form>
  <div class="rfw-rv">
    <a class="rfw-card rfw-copt" href="mailto:drraulferrer@gmail.com"><div><p class="rfw-kick">Email</p><b>drraulferrer@gmail.com</b></div><span style="color:var(--nar);font-family:'Archivo';font-weight:900">↗</span></a>
    <a class="rfw-card rfw-copt" href="#"><div><p class="rfw-kick">LinkedIn</p><b>Perfil profesional</b></div><span style="color:var(--nar);font-family:'Archivo';font-weight:900">↗</span></a>
    <a class="rfw-card rfw-copt" href="https://orcid.org/0000-0001-5495-8458" target="_blank" rel="noopener"><div><p class="rfw-kick">ORCID · ResearchGate</p><b>Perfiles académicos</b></div><span style="color:var(--nar);font-family:'Archivo';font-weight:900">↗</span></a>
    <div class="rfw-note"><p class="rfw-kick">Respuesta</p><p style="margin-top:8px">Habitualmente en pocos días laborables. Te respondo personalmente.</p></div>
    <img src="{FIRMA}" alt="Firma de Raúl Ferrer" style="width:220px;margin-top:28px">
  </div>
</div></div></section>
<style>@media(min-width:1024px){{ #rfwContacto{{ grid-template-columns:1.4fr 1fr }} }}</style>
'''

# ══ CREACIÓN ═══════════════════════════════════════════════════════════════

PAGES = [
    {'title': 'Visión 360º — Dr. Raúl Ferrer Peña', 'slug': 'vision-360', 'active': 'vision', 'body': BODY_VISION},
    {'title': 'Sobre mí — Dr. Raúl Ferrer Peña', 'slug': 'sobre-mi', 'active': 'sobre', 'body': BODY_SOBRE},
    {'title': 'Áreas de conocimiento — Dr. Raúl Ferrer Peña', 'slug': 'areas', 'active': 'areas', 'body': areas_hub()},
    {'title': 'Trayectoria — Dr. Raúl Ferrer Peña', 'slug': 'trayectoria', 'active': 'trayectoria', 'body': BODY_TRAYECTORIA},
    {'title': 'Credenciales — Dr. Raúl Ferrer Peña', 'slug': 'credenciales', 'active': 'trayectoria', 'body': BODY_CREDENCIALES},
    {'title': 'Proyectos — Dr. Raúl Ferrer Peña', 'slug': 'proyectos', 'active': 'proyectos', 'body': BODY_PROYECTOS},
    {'title': 'Publicaciones — Dr. Raúl Ferrer Peña', 'slug': 'publicaciones', 'active': 'publicaciones', 'body': BODY_PUBLICACIONES},
    {'title': 'Colaboraciones — Dr. Raúl Ferrer Peña', 'slug': 'colaboraciones', 'active': 'colaboraciones', 'body': BODY_COLABORACIONES},
    {'title': 'Contacto — Dr. Raúl Ferrer Peña', 'slug': 'contacto', 'active': '', 'body': BODY_CONTACTO},
]


def rest(method, url, payload=None):
    req = urllib.request.Request(url, method=method)
    req.add_header('Authorization', AUTH)
    if payload is not None:
        req.add_header('Content-Type', 'application/json')
        data = json.dumps(payload).encode()
    else:
        data = None
    try:
        r = urllib.request.urlopen(req, data=data, timeout=120)
        return r.status, json.loads(r.read().decode())
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read().decode() or '{}')


def main():
    only = sys.argv[1] if len(sys.argv) > 1 else None
    created = {}
    # 1) crear páginas principales
    for p in PAGES:
        if only and p['slug'] != only:
            continue
        payload = {
            'title': p['title'],
            'slug': p['slug'],
            'status': 'draft',
            'content': doc(p['active'], p['body']),
            'template': 'page-template-blank.php',
        }
        st, d = rest('POST', API, payload)
        if st in (200, 201):
            created[p['slug']] = d
            print(f"OK  {p['slug']:32s} id={d['id']:5d} {d['link']}")
        else:
            print(f"ERR {p['slug']:32s} {st} {str(d)[:200]}")
    # 2) páginas de área (hijas de areas)
    areas_id = created.get('areas', {}).get('id')
    if not areas_id and not only:
        st, d = rest('GET', API + '?slug=areas')
        areas_id = d[0]['id'] if st == 200 and d else None
    for i, (slug, num, title, lead, chips, puntos) in enumerate(AREAS_DATA):
        if only and slug != only:
            continue
        payload = {
            'title': f'{title} — Áreas — Dr. Raúl Ferrer Peña',
            'slug': slug,
            'status': 'draft',
            'parent': areas_id or 0,
            'content': doc('areas', area_detalle(i)),
            'template': 'page-template-blank.php',
        }
        st, d = rest('POST', API, payload)
        if st in (200, 201):
            print(f"OK  areas/{slug:29s} id={d['id']:5d} {d['link']}")
        else:
            print(f"ERR areas/{slug:29s} {st} {str(d)[:200]}")


if __name__ == '__main__':
    main()
