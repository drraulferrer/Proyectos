"""Genera tres historias (1080 × 1920) desde ../reel-respuesta-margen/datos/convenios-sanidad-privada-2026.csv.

Las tablas prorrogadas (año < 2026) se actualizan a 2026 con el IPC interanual de diciembre (INE)
de cada año entre el de la tabla y 2025, contando como 0 % los años negativos."""
import csv, math
IPC={2015:0.0,2016:1.6,2017:1.1,2018:1.2,2019:0.8,2020:-0.5,2021:6.5,2022:5.7,2023:3.1,2024:2.8,2025:2.9}
def factor(y): return math.prod(1+max(IPC[a],0)/100 for a in range(y,2026))
rows=list(csv.DictReader(open('../reel-respuesta-margen/datos/convenios-sanidad-privada-2026.csv')))
for r in rows:
    r['v']=float(r['retribucion_anual_tabla']); r['y']=int(r['tabla'])
    r['f']=factor(r['y']) if r['y']<2026 else 1.0
    r['e']=r['v']*r['f']
rows.sort(key=lambda r:-r['e'])
MAD=next(r['e'] for r in rows if r['territorio']=='Madrid')
SMI26=17094
MAX=33000; X0=330; W=410
def x(v): return W*v/MAX
def eur(v): return f"{v:,.0f} €".replace(",",".")

def fila(r,i,ROW):
    v,e=r['v'],r['e']; d=e-MAD; mad=r['territorio']=='Madrid'; pro=r['y']<2026
    ancho=x(e)
    exc=f'<i class="exc" style="width:{x(e)-x(MAD):.1f}px"></i>' if (d>0 and not mad) else ''
    ipc=f'<i class="ipc" style="width:{x(e)-x(v):.1f}px"></i>' if pro else ''
    valor=('≈ ' if pro else '')+eur(e)
    if mad: dif='<em class="dif ref">referencia</em>'
    else: dif=f'<em class="dif {"mas" if d>=0 else "menos"}">{"+" if d>=0 else "−"}{eur(abs(d))}</em>'
    sub=(f'<small class="caduca">⟳ tabla {r["y"]} · {eur(v)}</small>' if pro else f'<small>{r["ambito"]}</small>')
    smi=' <small class="bajo">bajo el SMI</small>' if e<SMI26 else ''
    return (f'<div class="fila{" fmad" if mad else ""}" style="top:{i*ROW:.0f}px"><div class="nom"><b>{r["territorio"]}{smi}</b>{sub}</div>'
            f'<div class="bar{" mad" if mad else ""}" style="width:{ancho:.1f}px">{exc}{ipc}<span>{valor}</span></div>{dif}</div>')

CSS=f'''<link rel="stylesheet" href="../valor-fisioterapia/src/marca.css">
<style>
  body {{ display:flex; flex-direction:column; gap:40px; padding:40px; align-items:center; }}
  .hist {{ position:relative; width:1080px; height:1920px; background:#fff; overflow:hidden; }}
  .a {{ position:absolute; left:80px; right:80px; }}
  .pag {{ position:absolute; right:80px; top:200px; font-weight:700; font-size:22px; letter-spacing:.14em; color:var(--mut); }}
  .h2 {{ font-weight:800; font-size:92px; letter-spacing:-.035em; line-height:1; }}
  .sub {{ font-size:27px; line-height:1.4; color:var(--mut); }}
  .leyenda {{ display:flex; flex-wrap:wrap; gap:12px 30px; font-size:23px; color:#4A4238; }}
  .leyenda i {{ display:inline-block; width:24px; height:24px; border-radius:5px; vertical-align:-4px; margin-right:9px; }}
  .rayas {{ background: repeating-linear-gradient(135deg, rgba(23,19,16,.45) 0 4px, transparent 4px 10px), #E3D8C5; }}
  .cabe {{ display:flex; font-size:19px; font-weight:700; letter-spacing:.16em; text-transform:uppercase; color:var(--mut); }}
  .comp {{ position:absolute; left:80px; right:80px; }}
  .fila {{ position:absolute; left:0; right:0; height:70px; }}
  .nom {{ position:absolute; left:0; top:4px; width:{X0-16}px; }}
  .nom b {{ display:block; font-weight:800; font-size:31px; letter-spacing:-.01em; line-height:1.1; }}
  .nom small {{ display:block; font-size:19px; color:var(--mut); margin-top:3px; }}
  .nom small.caduca {{ color:var(--nartxt); font-weight:700; }}
  .nom small.bajo {{ display:inline-block; margin-left:6px; color:#fff; background:var(--nartxt); border-radius:5px; padding:0 6px; font-size:16px; font-weight:700; }}
  .bar {{ position:absolute; left:{X0}px; top:6px; height:50px; background:#E3D8C5; border-radius:0 10px 10px 0; overflow:hidden; display:flex; align-items:center; padding-left:14px; }}
  .bar .exc {{ position:absolute; right:0; top:0; bottom:0; background:var(--nar); }}
  .bar .ipc {{ position:absolute; right:0; top:0; bottom:0; background: repeating-linear-gradient(135deg, rgba(23,19,16,.45) 0 4px, transparent 4px 10px); }}
  .bar span {{ position:relative; font-weight:800; font-size:24px; letter-spacing:-.01em; color:var(--ink); background:rgba(255,255,255,.0); }}
  .bar.mad {{ background:var(--ink); }}
  .bar.mad span {{ color:#fff; }}
  .fmad .nom b {{ text-decoration: underline 4px var(--nar); text-underline-offset: 6px; }}
  .dif {{ position:absolute; right:0; top:16px; font-style:normal; font-weight:800; font-size:27px; white-space:nowrap; }}
  .dif.mas {{ color:var(--nartxt); }}
  .dif.menos {{ color:var(--mut); }}
  .dif.ref {{ color:var(--ink); font-size:18px; letter-spacing:.14em; text-transform:uppercase; top:22px; }}
  .linea {{ position:absolute; top:-14px; bottom:-6px; border-left:3px dashed var(--ink); z-index:2; }}
  .linea span {{ position:absolute; left:-46px; top:-34px; font-weight:800; font-size:18px; letter-spacing:.14em; background:#fff; padding:0 6px; }}
  .nota {{ font-size:22px; line-height:1.45; color:var(--mut); }}
  .bloque h3 {{ font-weight:800; font-size:34px; letter-spacing:-.01em; margin-bottom:12px; }}
  .bloque p {{ font-size:25px; line-height:1.45; color:#4A4238; }}
  .tabla-ipc {{ width:100%; border-collapse:collapse; font-size:27px; }}
  .tabla-ipc th {{ text-align:left; font-size:18px; letter-spacing:.12em; text-transform:uppercase; color:var(--mut); padding:8px 0; border-bottom:2px solid var(--line); }}
  .tabla-ipc td {{ padding:13px 0; border-bottom:1px solid var(--line); }}
  .tabla-ipc td.n {{ text-align:right; font-weight:700; }}
  .usuario {{ font-weight:700; font-size:26px; }}
</style>'''

def historia(idx, total, titulo, filas_html, n, extra_top=''):
    ROW=82; top=640
    return f'''<section class="hist" id="h{idx}">
  <div class="a kick" style="top:200px">Sanidad privada · fisioterapeuta</div><div class="pag">{idx}/{total}</div>
  <div class="a h2" style="top:250px">{titulo}</div>
  {extra_top}
  <div class="a cabe" style="top:{top-48}px"><span style="width:{X0}px">Convenio</span><span>Anual 2026</span><span style="margin-left:auto">vs Madrid</span></div>
  <div class="comp" style="top:{top}px; height:{ROW*n}px">
    <div class="linea" style="left:{X0+x(MAD):.1f}px"></div>
{filas_html}
  </div>
  <div class="a usuario" style="top:1660px">@_raulferrer</div>
</section>'''

ROW=82
mitad=12
f1="\n".join("    "+fila(r,i,ROW) for i,r in enumerate(rows[:mitad]))
f2="\n".join("    "+fila(r,i,ROW) for i,r in enumerate(rows[mitad:]))
cab1='''<p class="a sub" style="top:360px">Euros brutos al año sin antigüedad, por convenio. Las tablas caducadas se actualizan con el IPC hasta 2026 para poder compararlas.</p>
  <div class="a leyenda" style="top:470px"><span><i style="background:var(--ink)"></i>Madrid</span><span><i style="background:var(--nar)"></i>Por encima de Madrid</span><span><i class="rayas"></i>Subida estimada con IPC</span></div>'''
cab2='''<p class="a sub" style="top:360px">Continúa la lista. <b style="color:var(--nartxt)">⟳</b> marca las tablas caducadas, con su año y su importe sin actualizar.</p>'''
h1=historia(1,3,'Madrid frente al <span class="serif">resto</span>',f1,mitad,cab1)
h2=historia(2,3,'Madrid frente al <span class="serif">resto</span>',f2,len(rows)-mitad,cab2)

pro=[r for r in rows if r['y']<2026]
pro.sort(key=lambda r:r['y'])
filas_ipc="".join(f'<tr><td>{r["territorio"]}</td><td>{r["y"]}</td><td class="n">{eur(r["v"])}</td><td class="n">×{r["f"]:.3f}</td><td class="n">{eur(r["e"])}</td></tr>' for r in pro)
h3=f'''<section class="hist" id="h3">
  <div class="a kick" style="top:200px">Cómo está hecho</div><div class="pag">3/3</div>
  <div class="a h2" style="top:250px; font-size:84px">Las cuentas, a la <span class="serif">vista</span></div>
  <div class="a bloque" style="top:390px">
    <h3>Qué se compara</h3>
    <p>Salario base y pluses fijos de convenio por número de pagas, sin antigüedad ni pluses por turnos o puesto.</p>
  </div>
  <div class="a bloque" style="top:590px">
    <h3>Tablas caducadas, actualizadas con IPC</h3>
    <table class="tabla-ipc"><tr><th>Convenio</th><th>Tabla</th><th style="text-align:right">Importe</th><th style="text-align:right">IPC</th><th style="text-align:right">2026</th></tr>{filas_ipc}</table>
  </div>
  <p class="a nota" style="top:1300px; font-size:23px">IPC interanual de diciembre (INE) de cada año hasta 2025; 2020 cuenta como 0 %. Almería sigue por debajo del SMI incluso actualizada, así que allí se cobra el SMI (17.094 € en 2026). En Burgos, Valladolid, Córdoba y León el grupo del fisioterapeuta es deducido. Madrid, Aragón, Asturias y Jaén, leídos en el boletín; el resto, de webs que citan el boletín. Sin tabla comparable: Málaga, Murcia, Pontevedra, Las Palmas, Tenerife, Navarra, La Rioja, Castilla-La Mancha, Extremadura y País Vasco.</p>
  <div class="a usuario" style="top:1660px">@_raulferrer</div>
</section>'''
open('historia.html','w').write(f'<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Convenios de sanidad privada</title>{CSS}</head><body>\n{h1}\n{h2}\n{h3}\n</body></html>')
for r in rows: print(f"{r['territorio']:12} {r['y']} {r['v']:>10.2f} x{r['f']:.4f} = {r['e']:>10.2f}  dif {r['e']-MAD:>9.2f}")
