// Genera las imagenes del carrusel (1080 x 1350 px) en imagenes/.
//
//   node generar-imagenes.js
//
// Requiere Node y Playwright con Chromium. Las tipografias (Inter y Source
// Serif 4, ambas con licencia SIL OFL) se descargan de Google Fonts a
// .fuentes/ la primera vez y se incrustan en el HTML antes de capturar.
//
// Paleta: naranja, negro y blanco. Cada diapositiva lleva poco texto y, cuando
// hace falta, un esquema vectorial. El texto sale de post-final.md.

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { chromium } = require('playwright');

const DIR = __dirname;
const OUT = path.join(DIR, 'imagenes');
const FONTS = path.join(DIR, '.fuentes');
fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(FONTS, { recursive: true });

const UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120 Safari/537.36';
const CSS_URL =
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;800;900' +
  '&family=Source+Serif+4:ital,wght@1,500&display=swap';

function ensureFonts() {
  const inter = path.join(FONTS, 'inter.woff2');
  const serif = path.join(FONTS, 'source-serif.woff2');
  if (fs.existsSync(inter) && fs.existsSync(serif)) return { inter, serif };
  const css = execFileSync('curl', ['-sS', '-m', '30', '-A', UA, CSS_URL], { encoding: 'utf8' });
  // Inter es variable: un unico fichero cubre todos los pesos.
  const latin = [...css.matchAll(/\/\*\s*latin\s*\*\/\s*@font-face\s*\{(.*?)\}/gs)].map((m) => m[1]);
  const pick = (family) => {
    const block = latin.find((b) => b.includes(`font-family: '${family}'`));
    if (!block) throw new Error(`No se encontro el subset latin de ${family}`);
    return block.match(/url\((https:\/\/[^)]+)\)/)[1];
  };
  execFileSync('curl', ['-sS', '-m', '30', '-o', inter, pick('Inter')]);
  execFileSync('curl', ['-sS', '-m', '30', '-o', serif, pick('Source Serif 4')]);
  return { inter, serif };
}

const files = ensureFonts();
const b64 = (f) => fs.readFileSync(f).toString('base64');
const INTER = b64(files.inter);
const SERIF = b64(files.serif);

const HANDLE = '@drraulferrer';

// --- Esquemas ---------------------------------------------------------------

// Flechas opuestas: sube lo entregado, baja la competencia.
const ESQUEMA_PARADOJA = `
<div class="scheme arrows">
  <div class="arrow-col">
    <svg viewBox="0 0 120 240" class="arrow up" aria-hidden="true">
      <path d="M60 236 V28" stroke="currentColor" stroke-width="18" fill="none"/>
      <path d="M60 6 L112 62 H8 Z" fill="currentColor"/>
    </svg>
    <div class="arrow-label">Lo que<br>se entrega</div>
  </div>
  <div class="arrow-col down-col">
    <svg viewBox="0 0 120 240" class="arrow down" aria-hidden="true">
      <path d="M60 4 V212" stroke="currentColor" stroke-width="18" fill="none"/>
      <path d="M60 234 L112 178 H8 Z" fill="currentColor"/>
    </svg>
    <div class="arrow-label">Lo que<br>se aprende</div>
  </div>
</div>`;

// Caida en la evaluacion sin IA, frente al grupo de control.
const ESQUEMA_DATO = `
<div class="chart">
  <div class="chart-title">Caída en la evaluación sin IA, frente al grupo que nunca la usó</div>
  <div class="bar-row">
    <div class="bar-label">IA libre</div>
    <div class="bar-track"><div class="bar fill" style="width:85%"></div></div>
    <div class="bar-value orange">&minus;17&thinsp;%</div>
  </div>
  <div class="bar-row">
    <div class="bar-label">Tutor con pistas</div>
    <div class="bar-track"><div class="bar stub"></div></div>
    <div class="bar-value muted">sin deterioro</div>
  </div>
</div>`;

// Que hace la herramienta con la dificultad.
const ESQUEMA_DIFICULTAD = `
<div class="scheme boxes">
  <div class="box bad">
    <div class="box-head">La elimina</div>
    <div class="box-arrow">&darr;</div>
    <div class="box-foot">Rinde más hoy.<br>Aprende menos.</div>
  </div>
  <div class="box good">
    <div class="box-head">La sostiene</div>
    <div class="box-arrow">&darr;</div>
    <div class="box-foot">Rinde igual hoy.<br>Aprende.</div>
  </div>
</div>`;

// Del archivo final al proceso.
const ESQUEMA_SALIDA = `
<div class="scheme flow">
  <div class="flow-box struck">Archivo final</div>
  <div class="flow-arrow">&rarr;</div>
  <div class="flow-box live">
    <div class="flow-title">El proceso</div>
    <div class="flow-tags"><span>fuentes</span><span>qué verificó</span><span>qué descartó</span><span>defensa</span></div>
  </div>
</div>`;

// --- Diapositivas -----------------------------------------------------------

const SLIDES = [
  {
    name: '01-portada',
    bg: 's-black',
    body: `
      <div class="eyebrow">IA y universidad</div>
      <div class="fill-mid">
        <h1 class="mega">Academic<br><span class="o">slop</span></h1>
        <div class="rule"></div>
        <p class="lede">El trabajo mejora.<br>El aprendizaje empeora.</p>
      </div>
      <div class="swipe">Desliza <span>&rarr;</span></div>`,
  },
  {
    name: '02-la-escena',
    bg: 's-white',
    body: `
      <div class="eyebrow">La escena</div>
      <h2 class="stack">Análisis impecable.<br>Bibliografía correcta.<br><span class="o">Notable alto.</span></h2>
      <div class="hr"></div>
      <p class="say">Dos semanas después, en clase:<br><span class="quote">«¿Por qué elegiste ese marco y no otro?»</span></p>`,
  },
  {
    name: '03-no-hay-respuesta',
    bg: 's-orange',
    body: `
      <div class="fill-mid center-block">
        <h1 class="mega black">No hay<br>respuesta.</h1>
      </div>`,
  },
  {
    name: '04-que-es',
    bg: 's-black',
    body: `
      <div class="eyebrow">Qué es</div>
      <h2 class="tight"><span class="o">Slop</span> académico</h2>
      <blockquote>Cumple la tarea.<br>Sustituye el proceso intelectual que la tarea pretendía provocar.</blockquote>
      <p class="foot">No hay plagio. Ningún detector lo señala.<br>No es honestidad académica: es aprendizaje.</p>`,
  },
  {
    name: '05-la-paradoja',
    bg: 's-white',
    body: `
      <div class="eyebrow">La paradoja</div>
      <h2 class="tight">Suben las notas.<br>Baja la competencia.</h2>
      ${ESQUEMA_PARADOJA}`,
  },
  {
    name: '06-el-dato',
    bg: 's-black',
    body: `
      <div class="eyebrow">Ensayo aleatorizado &middot; ~1.000 estudiantes de secundaria</div>
      <div class="figure">&minus;17&thinsp;%</div>
      <p class="figure-cap">rindió el grupo que había usado GPT&#8209;4 libremente, en cuanto le retiraron la herramienta.</p>
      ${ESQUEMA_DATO}`,
  },
  {
    name: '07-la-clave',
    bg: 's-white',
    body: `
      <div class="eyebrow">La clave</div>
      <h2 class="tight">No es usar IA o no usarla.<br><span class="o">Es qué hace con la dificultad.</span></h2>
      ${ESQUEMA_DIFICULTAD}`,
  },
  {
    name: '08-los-limites',
    bg: 's-black',
    body: `
      <div class="eyebrow">Honestidad con los límites</div>
      <ul class="chips">
        <li>El ensayo es de <strong>secundaria y matemáticas</strong>. No de universidad.</li>
        <li>El artículo de <strong>HBR</strong> es análisis organizativo. Da el concepto, no la prueba.</li>
        <li>El <strong>19&thinsp;%</strong> de METR son 16 expertos, no estudiantes.</li>
      </ul>
      <div class="pull">La coherencia no es un adorno del argumento.<br>Es parte del argumento.</div>`,
  },
  {
    name: '09-la-salida',
    bg: 's-white',
    body: `
      <div class="eyebrow">La salida</div>
      <h2 class="tight">Cambiar<br>qué evaluamos.</h2>
      ${ESQUEMA_SALIDA}
      <p class="foot dark">No son medidas de control. Son decisiones docentes.</p>`,
  },
  {
    name: '10-cierre',
    bg: 's-orange',
    body: `
      <div class="eyebrow black">El cierre</div>
      <div class="fill-mid">
        <h2 class="black big-q">¿Qué conserva el estudiante cuando retiramos la herramienta?</h2>
      </div>
      <div class="rule black-rule"></div>
      <p class="closing">La IA puede acelerar el aprendizaje.<br>Lo que no puede sustituir es la evidencia<br>de que alguien ha aprendido.</p>
      <p class="cta">Fuentes en el primer comentario</p>`,
  },
];

const N = SLIDES.length;

const html = `<!doctype html><html lang="es"><head><meta charset="utf-8"><style>
@font-face{font-family:'Inter';src:url(data:font/woff2;base64,${INTER}) format('woff2');font-weight:100 900;font-style:normal;}
@font-face{font-family:'SourceSerif';src:url(data:font/woff2;base64,${SERIF}) format('woff2');font-weight:500;font-style:italic;}
:root{
  --black:#0B0B0B;
  --white:#FFFFFF;
  --orange:#FF5A00;
}
*{box-sizing:border-box;margin:0;padding:0;}
body{background:#444;font-family:'Inter',system-ui,sans-serif;-webkit-font-smoothing:antialiased;}

.slide{
  width:1080px;height:1350px;padding:96px 88px 150px;position:relative;
  display:flex;flex-direction:column;overflow:hidden;
}
.slide.s-black{background:var(--black);color:var(--white);--ink:var(--white);--soft:rgba(255,255,255,.60);--line:rgba(255,255,255,.18);}
.slide.s-white{background:var(--white);color:var(--black);--ink:var(--black);--soft:rgba(11,11,11,.62);--line:rgba(11,11,11,.14);}
.slide.s-orange{background:var(--orange);color:var(--black);--ink:var(--black);--soft:rgba(11,11,11,.72);--line:rgba(11,11,11,.22);}

.o{color:var(--orange);}
.slide.s-orange .o{color:var(--white);}
.black{color:var(--black) !important;}

.eyebrow{
  font-size:25px;font-weight:800;letter-spacing:.16em;text-transform:uppercase;
  line-height:1.4;color:var(--orange);margin-bottom:52px;
}
.slide.s-orange .eyebrow{color:rgba(11,11,11,.62);}

.fill-mid{margin-top:auto;margin-bottom:auto;}
.center-block{display:flex;align-items:center;}

h1.mega{font-size:138px;font-weight:900;line-height:.9;letter-spacing:-.045em;}
h2{font-size:76px;font-weight:900;line-height:1.04;letter-spacing:-.035em;}
h2.tight{margin-bottom:56px;}
h2.stack{font-size:72px;line-height:1.14;}
h2.big-q{font-size:82px;line-height:1.06;}

.rule{width:150px;height:10px;background:var(--orange);border-radius:10px;margin:44px 0 40px;}
.rule.black-rule{background:var(--black);margin:36px 0 34px;}
.hr{height:3px;background:var(--line);margin:auto 0 44px;}

.lede{font-size:44px;line-height:1.26;font-weight:600;color:var(--soft);}
.swipe{margin-top:auto;font-size:28px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:var(--orange);}

.say{font-size:36px;line-height:1.4;font-weight:500;color:var(--soft);}
.quote{display:inline-block;margin-top:14px;font-size:46px;font-weight:700;color:var(--ink);line-height:1.26;}

blockquote{
  font-size:52px;line-height:1.24;font-weight:700;letter-spacing:-.02em;color:var(--ink);
  border-left:12px solid var(--orange);padding-left:40px;margin-bottom:auto;
}
.foot{
  margin-top:auto;font-size:29px;line-height:1.48;color:var(--soft);
  border-top:3px solid var(--line);padding-top:28px;
}

/* Esquema: flechas opuestas */
.scheme{margin:auto 0;}
.arrows{display:flex;gap:40px;align-items:flex-end;justify-content:space-around;}
.arrow-col{display:flex;flex-direction:column;align-items:center;gap:30px;width:340px;}
.arrow{width:172px;height:344px;}
.arrow.up{color:var(--orange);}
.arrow.down{color:var(--ink);}
.arrow-label{font-size:34px;font-weight:800;line-height:1.2;text-align:center;letter-spacing:-.01em;}
.down-col .arrow-label{color:var(--soft);}

/* Grafico de caida */
.chart{margin-top:auto;border-top:3px solid var(--line);padding-top:34px;}
.chart-title{font-size:25px;font-weight:700;color:var(--soft);margin-bottom:30px;line-height:1.35;}
.bar-row{display:flex;align-items:center;gap:22px;margin-bottom:22px;}
.bar-row:last-child{margin-bottom:0;}
.bar-label{width:290px;font-size:29px;font-weight:800;color:var(--ink);}
.bar-track{flex:1;height:34px;display:flex;align-items:center;}
.bar{height:34px;border-radius:0 6px 6px 0;}
.bar.fill{background:var(--orange);}
.bar.stub{width:8px;background:var(--soft);border-radius:0 3px 3px 0;}
.bar-value{width:230px;font-size:31px;font-weight:900;text-align:right;}
.bar-value.orange{color:var(--orange);}
.bar-value.muted{font-size:26px;font-weight:700;color:var(--soft);}

/* Esquema: dos cajas */
.boxes{display:flex;gap:34px;}
.box{flex:1;border:4px solid var(--line);border-radius:26px;padding:38px 30px;text-align:center;}
.box.bad{border-color:var(--orange);}
.box.good{border-color:var(--ink);}
.box-head{font-size:38px;font-weight:900;letter-spacing:-.02em;margin-bottom:16px;}
.box.bad .box-head{color:var(--orange);}
.box-arrow{font-size:46px;line-height:1;color:var(--soft);margin-bottom:14px;}
.box-foot{font-size:30px;font-weight:600;line-height:1.32;color:var(--soft);}

/* Esquema: flujo */
.flow{display:flex;align-items:center;gap:28px;}
.flow-box{border:4px solid var(--line);border-radius:26px;padding:32px 26px;text-align:center;}
.flow-box.struck{
  width:330px;font-size:35px;font-weight:900;line-height:1.14;color:var(--soft);
  position:relative;white-space:nowrap;
}
.flow-box.struck::after{
  content:"";position:absolute;left:22px;right:22px;top:calc(50% - 3px);height:7px;
  background:var(--orange);border-radius:7px;
}
.flow-arrow{font-size:52px;color:var(--soft);}
.flow-box.live{flex:1;border-color:var(--orange);text-align:left;padding:32px 30px;}
.flow-title{font-size:40px;font-weight:900;color:var(--ink);margin-bottom:18px;letter-spacing:-.02em;}
.flow-tags{display:flex;flex-wrap:wrap;gap:12px;}
.flow-tags span{
  font-size:25px;font-weight:700;color:var(--orange);
  border:3px solid var(--orange);border-radius:999px;padding:8px 18px;
}

/* Chips de limites */
.chips{list-style:none;margin-bottom:auto;}
.chips li{
  font-size:34px;line-height:1.36;font-weight:500;color:var(--soft);
  border-left:8px solid var(--orange);padding-left:30px;margin-bottom:40px;
}
.chips strong{color:var(--ink);font-weight:800;}

.pull{
  font-size:40px;font-weight:900;line-height:1.24;letter-spacing:-.02em;color:var(--ink);
  border-top:3px solid var(--line);padding-top:32px;
}

.figure{font-size:250px;font-weight:900;line-height:.86;letter-spacing:-.06em;color:var(--orange);}
.figure-cap{font-size:38px;line-height:1.3;font-weight:600;color:var(--ink);margin-top:26px;}

.closing{font-size:39px;font-weight:800;line-height:1.28;letter-spacing:-.02em;color:var(--black);}
.cta{margin-top:auto;font-size:25px;font-weight:800;letter-spacing:.05em;text-transform:uppercase;color:rgba(11,11,11,.62);}

.chrome{
  position:absolute;left:88px;right:88px;bottom:56px;
  display:flex;justify-content:space-between;align-items:center;
  font-size:23px;font-weight:800;letter-spacing:.05em;color:var(--soft);opacity:.75;
}
.chrome .count{font-variant-numeric:tabular-nums;}
</style></head><body>
${SLIDES.map((s, i) => `<section class="slide ${s.bg}">${s.body}
  <div class="chrome"><span>${HANDLE}</span><span class="count">${i + 1} / ${N}</span></div>
</section>`).join('\n')}
</body></html>`;

fs.writeFileSync(path.join(DIR, '.carrusel.html'), html);

(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
  const page = await browser.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 1 });
  await page.goto('file://' + path.join(DIR, '.carrusel.html'));
  await page.evaluate(() => document.fonts.ready);

  // Aviso si algun contenido se sale de su diapositiva.
  const overflow = await page.$$eval('.slide', (nodes) =>
    nodes.map((n, i) => ({ i: i + 1, over: n.scrollHeight - n.clientHeight })).filter((r) => r.over > 1)
  );
  overflow.forEach((r) => console.warn(`AVISO: la diapositiva ${r.i} se desborda ${r.over}px`));

  const els = await page.$$('.slide');
  for (let i = 0; i < els.length; i++) {
    await els[i].screenshot({ path: path.join(OUT, `${SLIDES[i].name}.png`) });
    console.log('ok', SLIDES[i].name);
  }
  await browser.close();
  if (overflow.length) process.exitCode = 1;
})();
