"""Genera historia.html con la mediana del precio de primera visita (Doctoralia) por capital y el salario de convenio."""
import csv
rows=list(csv.DictReader(open('../reel-respuesta-margen/datos/precios-primera-visita-doctoralia-2026-11.csv')))
X0=290; W=300; MAXP=70; ROW=66
def x(p): return W*p/MAXP
def eur(v): return f"{v:,.0f} €".replace(",",".")
filas=[]
for i,r in enumerate(rows):
    p=float(r['mediana']); mad=r['ciudad']=='Madrid'
    med=f"{p:g} €".replace('.',',')
    if r['anual_convenio']:
        vieja=r['tabla_convenio']!='2026'
        conv=f'<em class="conv{" mad" if mad else ""}">{eur(float(r["anual_convenio"]))}{f"<small>⟳ tabla {r['tabla_convenio']}</small>" if vieja else "<small>"+r["convenio"]+"</small>"}</em>'
    else:
        conv='<em class="conv no">sin dato<small>de convenio</small></em>'
    filas.append(f'<div class="fila{" fmad" if mad else ""}" style="top:{i*ROW}px"><div class="nom"><b>{r["ciudad"]}</b><small>{r["n"]} precios</small></div>'
                 f'<div class="bar{" mad" if mad else ""}" style="width:{x(p):.1f}px"><span>{med}</span></div>{conv}</div>')
html=f'''<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Precio de la primera visita</title>
<link rel="stylesheet" href="../valor-fisioterapia/src/marca.css">
<style>
  body {{ display:flex; padding:40px; justify-content:center; }}
  .hist {{ position:relative; width:1080px; height:1920px; background:#fff; overflow:hidden; }}
  .a {{ position:absolute; left:80px; right:80px; }}
  .h2 {{ font-weight:800; font-size:96px; letter-spacing:-.035em; line-height:1; }}
  .sub {{ font-size:27px; line-height:1.4; color:var(--mut); }}
  .cabe {{ display:flex; font-size:19px; font-weight:700; letter-spacing:.16em; text-transform:uppercase; color:var(--mut); }}
  .comp {{ position:absolute; left:80px; right:80px; top:530px; height:{ROW*len(rows)}px; }}
  .fila {{ position:absolute; left:0; right:0; height:{ROW-10}px; }}
  .nom {{ position:absolute; left:0; top:2px; width:{X0-16}px; }}
  .nom b {{ display:block; font-weight:800; font-size:30px; letter-spacing:-.01em; line-height:1.1; }}
  .nom small {{ display:block; font-size:18px; color:var(--mut); margin-top:2px; }}
  .bar {{ position:absolute; left:{X0}px; top:6px; height:48px; background:var(--nar); border-radius:0 10px 10px 0; display:flex; align-items:center; justify-content:flex-end; padding-right:14px; }}
  .bar span {{ font-weight:800; font-size:25px; color:var(--ink); }}
  .bar.mad {{ background:var(--ink); }}
  .bar.mad span {{ color:#fff; }}
  .fmad .nom b {{ text-decoration: underline 4px var(--nar); text-underline-offset: 6px; }}
  .conv {{ position:absolute; right:0; top:4px; font-style:normal; font-weight:800; font-size:27px; text-align:right; white-space:nowrap; }}
  .conv small {{ display:block; font-size:17px; font-weight:600; color:var(--mut); margin-top:1px; }}
  .conv.no {{ color:#B9AD99; font-size:22px; }}
  .conv.mad {{ text-decoration: underline 4px var(--nar); text-underline-offset: 6px; }}
  .lect {{ font-size:30px; line-height:1.4; color:#4A4238; }}
  .lect b {{ color:var(--ink); }}
  .nota {{ font-size:19px; line-height:1.45; color:var(--mut); }}
</style></head><body>
<section class="hist" id="historia">
  <div class="a kick" style="top:200px">Primera visita de fisioterapia · noviembre 2026</div>
  <div class="a h2" style="top:246px; font-size:84px">Lo que cuesta la <span class="serif">visita</span></div>
  <p class="a sub" style="top:360px">Precio mediano que publican los fisioterapeutas en Doctoralia, por capital. A la derecha, el salario anual de tabla del convenio de esa zona.</p>
  <div class="a cabe" style="top:486px"><span style="width:{X0}px">Ciudad</span><span>Primera visita</span><span style="margin-left:auto">Convenio / año</span></div>
  <div class="comp">
{chr(10).join("    "+f for f in filas)}
  </div>
  <p class="a lect" style="top:{530+ROW*len(rows)+20}px">Madrid, Valencia, Sevilla y Zaragoza cobran lo mismo por la visita. <b>Sus convenios van de 19.629 € a 22.676 €.</b></p>
  <p class="a nota" style="top:{530+ROW*len(rows)+126}px">Muestra: primera página de resultados de Doctoralia por ciudad (11 a 26 precios), consultada el 18/11/2026. Precio de primera visita, solo de quien lo publica; orientativo, no estadístico. Fuera por falta de muestra: Oviedo, Pamplona, Santander, Salamanca, Burgos, Córdoba, Jaén, Huelva, Almería y León. ⟳ tabla caducada sin actualizar.</p>
</section></body></html>'''
open('historia.html','w').write(html)
print('fin lista', 530+ROW*len(rows))
