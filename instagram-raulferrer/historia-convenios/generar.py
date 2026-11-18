"""Genera historia.html a partir de ../reel-respuesta-margen/datos/convenios-sanidad-privada-2026.csv"""
import csv
rows=list(csv.DictReader(open('../reel-respuesta-margen/datos/convenios-sanidad-privada-2026.csv')))
rows.sort(key=lambda r:-float(r['retribucion_anual_tabla']))
MAD=19939.50; SMI26=17094; MAX=31000; X0=300; W=440; ROW=37.5
def x(v): return W*v/MAX
def eur(v): return f"{v:,.0f} €".replace(",",".")
filas=[]
for i,r in enumerate(rows):
    v=float(r['retribucion_anual_tabla']); d=v-MAD; mad=r['territorio']=='Madrid'
    exc=f'<i class="exc" style="width:{x(v)-x(MAD):.1f}px"></i>' if (d>0 and not mad) else ''
    if mad: dif='<em class="dif ref">referencia</em>'
    else: dif=f'<em class="dif {"mas" if d>=0 else "menos"}">{"+" if d>=0 else "−"}{eur(abs(d))}</em>'
    vieja='' if r['tabla']=='2026' else f' vieja'
    filas.append(f'<div class="fila{" fmad" if mad else ""}" style="top:{i*ROW:.1f}px"><div class="nom"><b>{r["territorio"]}</b><small class="t{vieja}">{r["tabla"]}</small></div><div class="bar{" mad" if mad else ""}" style="width:{x(v):.1f}px">{exc}<span>{eur(v)}</span></div>{dif}</div>')
html=f'''<!doctype html>
<html lang="es"><head><meta charset="utf-8"><title>Convenios de sanidad privada 2026</title>
<link rel="stylesheet" href="../valor-fisioterapia/src/marca.css">
<style>
  body {{ display:flex; padding:40px; justify-content:center; }}
  .hist {{ position:relative; width:1080px; height:1920px; background:#fff; overflow:hidden; }}
  .a {{ position:absolute; left:80px; right:80px; }}
  .h2 {{ font-weight:800; font-size:96px; letter-spacing:-.035em; line-height:1; }}
  .sub {{ font-size:27px; line-height:1.4; color:var(--mut); }}
  .cabe {{ display:flex; font-size:19px; font-weight:700; letter-spacing:.16em; text-transform:uppercase; color:var(--mut); }}
  .comp {{ position:absolute; left:80px; right:80px; top:612px; height:{ROW*len(rows):.0f}px; }}
  .fila {{ position:absolute; left:0; right:0; height:{ROW-5:.1f}px; }}
  .nom {{ position:absolute; left:0; top:2px; width:{X0-14}px; display:flex; align-items:baseline; justify-content:space-between; }}
  .nom b {{ font-weight:800; font-size:25px; letter-spacing:-.01em; }}
  .nom .t {{ font-size:18px; font-weight:600; color:var(--mut); }}
  .nom .t.vieja {{ color:#fff; background:var(--nartxt); border-radius:6px; padding:1px 7px; }}
  .bar {{ position:absolute; left:{X0}px; top:1px; height:30px; background:#E3D8C5; border-radius:0 8px 8px 0; overflow:hidden; display:flex; align-items:center; padding-left:10px; }}
  .bar .exc {{ position:absolute; right:0; top:0; bottom:0; background:var(--nar); }}
  .bar span {{ position:relative; font-weight:800; font-size:19px; letter-spacing:-.01em; color:var(--ink); }}
  .bar.mad {{ background:var(--ink); }}
  .bar.mad span {{ color:#fff; }}
  .fmad .nom b {{ text-decoration: underline 3px var(--nar); text-underline-offset: 5px; }}
  .dif {{ position:absolute; right:0; top:4px; font-style:normal; font-weight:800; font-size:22px; white-space:nowrap; }}
  .dif.mas {{ color:var(--nartxt); }}
  .dif.menos {{ color:var(--mut); }}
  .dif.ref {{ color:var(--ink); font-size:16px; letter-spacing:.14em; text-transform:uppercase; top:7px; }}
  .linea {{ position:absolute; top:-10px; bottom:-4px; border-left:2px dashed var(--ink); z-index:2; }}
  .smi {{ position:absolute; top:-10px; bottom:-4px; border-left:2px dotted var(--nartxt); z-index:2; }}
  .leyenda {{ display:flex; flex-wrap:wrap; gap:10px 28px; font-size:22px; color:#4A4238; }}
  .leyenda i {{ display:inline-block; width:22px; height:22px; border-radius:5px; vertical-align:-4px; margin-right:8px; }}
  .leyenda .anio {{ display:inline-block; font-size:16px; font-weight:600; color:#fff; background:var(--nartxt); border-radius:5px; padding:0 6px; margin-right:8px; }}
  .nota {{ font-size:18.5px; line-height:1.42; color:var(--mut); }}
</style></head>
<body>
<section class="hist" id="historia">
  <div class="a kick" style="top:220px">Sanidad privada · fisioterapeuta</div>
  <div class="a h2" style="top:262px">Madrid frente al <span class="serif">resto</span></div>
  <p class="a sub" style="top:378px">Euros brutos al año según la tabla que se aplica en 2026 en cada convenio, sin antigüedad. A la derecha, la diferencia con Madrid.</p>
  <div class="a leyenda" style="top:478px"><span><i style="background:var(--ink)"></i>Madrid</span><span><i style="background:var(--nar)"></i>Por encima de Madrid</span><span><span class="anio">2015</span>Tabla antigua prorrogada</span></div>
  <div class="a cabe" style="top:570px"><span style="width:{X0}px">Convenio · tabla</span><span>Anual</span><span style="margin-left:auto">vs Madrid</span></div>
  <div class="comp">
    <div class="linea" style="left:{X0+x(MAD):.1f}px"></div>
{chr(10).join("    "+f for f in filas)}
  </div>
  <p class="a nota" style="top:{612+ROW*len(rows)+18:.0f}px">Salario base y pluses fijos por número de pagas. Almería está por debajo del SMI, así que allí se cobra el SMI (17.094 € en 2026). En Burgos, Valladolid, Córdoba y León el grupo del fisioterapeuta es una deducción. Madrid, Aragón, Asturias y Jaén, leídos en el boletín; el resto, de webs que citan el boletín. Sin tabla comparable: Málaga, Murcia, Pontevedra, Las Palmas, Tenerife, Navarra, La Rioja, Castilla-La Mancha, Extremadura y País Vasco.</p>
  <div class="a" style="top:1660px; font-weight:700; font-size:26px">@_raulferrer</div>
</section>
</body></html>'''
open('historia.html','w').write(html)
print(len(rows), 'filas; lista termina en', 612+ROW*len(rows))
