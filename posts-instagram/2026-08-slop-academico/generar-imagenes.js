// Genera las 7 imagenes del carrusel (1080 x 1350 px) en imagenes/.
//
//   node generar-imagenes.js
//
// Requiere Node y Playwright con Chromium. Las tipografias (Inter y Source
// Serif 4, ambas con licencia SIL OFL) se descargan de Google Fonts a
// .fuentes/ la primera vez y se incrustan en el HTML antes de capturar.

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
const N = 7;

function chrome(i, dark) {
  return `<div class="chrome ${dark ? 'on-dark' : ''}">
    <span>${HANDLE}</span><span class="count">${i} / ${N}</span>
  </div>`;
}

const slides = [];

// 1 — Portada
slides.push(`<section class="slide dark cover">
  <div class="eyebrow accent">IA y universidad</div>
  <div class="cover-main">
    <h1 class="mega">Slop<br>académico</h1>
    <div class="rule"></div>
    <p class="lede">Cuando la IA mejora la entrega<br>y empeora el aprendizaje.</p>
  </div>
  <div class="swipe">Desliza <span class="arrow">→</span></div>
  ${chrome(1, true)}
</section>`);

// 2 — Definición
slides.push(`<section class="slide light">
  <div class="eyebrow accent">Qué es</div>
  <h2>El fenómeno,<br>en una frase</h2>
  <blockquote>Producción generada o rehecha con IA que <em>parece</em> cumplir una tarea académica.</blockquote>
  <ul class="ticks">
    <li>Sustituye el trabajo intelectual del estudiante.</li>
    <li>Oculta su procedencia.</li>
    <li>Deja al docente la carga de verificarla.</li>
  </ul>
  <p class="note">El término nace en la empresa (<em>AI slop</em>). En la universidad tiene su propia versión.</p>
  ${chrome(2, false)}
</section>`);

// 3 — El problema
slides.push(`<section class="slide light">
  <div class="eyebrow accent">El problema</div>
  <h2>Producto aparente<br>&ne; competencia real</h2>
  <p class="intro">No es solo una cita inventada.</p>
  <ul class="dashes">
    <li>Un análisis que no sabe defender.</li>
    <li>Un código que no entiende.</li>
    <li>Una síntesis que no puede contrastar.</li>
    <li>Una voz académica que no es suya.</li>
  </ul>
  <div class="callout">Podemos mejorar el entregable<br>y empeorar el aprendizaje.</div>
  ${chrome(3, false)}
</section>`);

// 4 — El dato
slides.push(`<section class="slide dark data">
  <div class="eyebrow accent">Ensayo aleatorizado &middot; ~1.000 estudiantes &middot; Matemáticas</div>
  <div class="stat">
    <div class="figure">&minus;17&thinsp;%</div>
    <p class="figure-cap">en la prueba <strong>sin IA</strong>, frente a quienes nunca la habían usado.</p>
  </div>
  <p class="body-dark">Con acceso libre a GPT&#8209;4 rindieron <strong>mejor durante la práctica</strong>. Al retirar la IA, cayeron.</p>
  <p class="body-dark">Un tutor con salvaguardas —pistas diseñadas por docentes, no respuestas— evitó en gran parte ese daño.</p>
  ${chrome(4, true)}
</section>`);

// 5 — Precisión
slides.push(`<section class="slide light">
  <div class="eyebrow accent">Lo que estos datos NO dicen</div>
  <h2>Precisión<br>con la evidencia</h2>
  <ol class="numbered">
    <li><strong>Ese ensayo es de secundaria</strong>, no de universidad. La transferencia es razonable, no demostrada.</li>
    <li>El artículo de <strong>Harvard Business Review</strong> sobre <em>AI slop</em> es análisis organizativo: aporta el marco, no la prueba.</li>
    <li>El <strong>&minus;19&thinsp;%</strong> de METR son 16 desarrolladores expertos, no estudiantes. La propia METR matiza su alcance.</li>
  </ol>
  <div class="callout">Defender bien una idea exige<br>no exagerar las fuentes.</div>
  ${chrome(5, false)}
</section>`);

// 6 — IA útil vs slop
slides.push(`<section class="slide light">
  <div class="eyebrow accent">Dónde está la línea</div>
  <h2 class="tight">IA útil<br>vs. slop académico</h2>
  <div class="cols">
    <div class="col good">
      <div class="col-head">IA útil</div>
      <ul>
        <li>Pedir pistas, contraejemplos y preguntas socráticas.</li>
        <li>Contrastar el modelo con fuentes primarias.</li>
        <li>Feedback sobre un borrador propio.</li>
        <li>Documentar qué se usó y qué se verificó.</li>
      </ul>
    </div>
    <div class="col bad">
      <div class="col-head">Slop académico</div>
      <ul>
        <li>Entregar lo que no se puede explicar ni defender.</li>
        <li>Fabricar citas, datos o argumentos.</li>
        <li>Delegar la elaboración que es justo lo que se evalúa.</li>
        <li>Ocultar el uso de IA o no dejar rastro.</li>
      </ul>
    </div>
  </div>
  ${chrome(6, false)}
</section>`);

// 7 — Qué hacer
slides.push(`<section class="slide dark closing">
  <div class="eyebrow accent">Ni detectores mágicos ni prohibir</div>
  <h2 class="on-dark">Rediseñar<br>la evaluación</h2>
  <ul class="steps">
    <li>Evidencia de <strong>proceso</strong>.</li>
    <li><strong>Trazabilidad</strong> de fuentes y decisiones.</li>
    <li>Tareas aplicadas al <strong>contexto</strong>.</li>
    <li><strong>Defensas breves</strong>: explicar, criticar, transferir.</li>
  </ul>
  <div class="rule"></div>
  <p class="closing-line">La IA puede acelerar el aprendizaje.<br>No puede sustituir la evidencia<br>de que has aprendido.</p>
  <div class="cta">
    <p class="cta-q">¿Qué evalúas: el archivo entregado<br>o lo que el estudiante sabe hacer sin IA?</p>
    <p class="cta-note">Fuentes en el primer comentario &middot; Guarda y comparte</p>
  </div>
  ${chrome(7, true)}
</section>`);

const html = `<!doctype html><html lang="es"><head><meta charset="utf-8"><style>
@font-face{font-family:'Inter';src:url(data:font/woff2;base64,${INTER}) format('woff2');font-weight:100 900;font-style:normal;}
@font-face{font-family:'SourceSerif';src:url(data:font/woff2;base64,${SERIF}) format('woff2');font-weight:500;font-style:italic;}
:root{
  --ink:#101922; --ink-2:#1b2833;
  --paper:#F6F2EA; --paper-2:#EDE7DB;
  --accent:#E4622F; --teal:#1B7A70;
  --muted:#4A5A66; --muted-dark:#9FB0BC;
}
*{box-sizing:border-box;margin:0;padding:0;}
body{background:#555;font-family:'Inter',system-ui,sans-serif;-webkit-font-smoothing:antialiased;}
.slide{
  width:1080px;height:1350px;padding:96px 92px 158px;position:relative;
  display:flex;flex-direction:column;overflow:hidden;
}
.slide.light{background:var(--paper);color:var(--ink);}
.slide.dark{background:var(--ink);color:var(--paper);}
.slide.dark::after{
  content:"";position:absolute;inset:0;pointer-events:none;
  background:radial-gradient(900px 620px at 82% 8%, rgba(228,98,47,.16), transparent 62%);
}
.slide > *{position:relative;z-index:1;}

.eyebrow{
  font-size:25px;font-weight:800;letter-spacing:.16em;text-transform:uppercase;
  line-height:1.35;margin-bottom:38px;
}
.eyebrow.accent{color:var(--accent);}

h1.mega{font-size:132px;font-weight:900;line-height:.93;letter-spacing:-.035em;}
h2{font-size:82px;font-weight:800;line-height:1.02;letter-spacing:-.03em;margin-bottom:44px;}
h2.tight{font-size:74px;margin-bottom:40px;}
h2.on-dark{color:var(--paper);}

.rule{width:132px;height:9px;background:var(--accent);border-radius:9px;margin:40px 0;}

.cover-main{margin-top:auto;margin-bottom:auto;}
.lede{font-size:41px;line-height:1.34;font-weight:500;color:var(--muted-dark);}
.swipe{
  margin-top:auto;font-size:28px;font-weight:700;letter-spacing:.06em;
  text-transform:uppercase;color:var(--accent);
}
.swipe .arrow{display:inline-block;margin-left:8px;}

blockquote{
  font-family:'SourceSerif',Georgia,serif;font-style:italic;font-weight:500;
  font-size:47px;line-height:1.34;color:var(--ink);
  border-left:9px solid var(--accent);padding-left:36px;margin-bottom:52px;
}
blockquote em{font-style:normal;font-family:'Inter',sans-serif;font-weight:800;}

ul,ol{list-style:none;}
.ticks li,.dashes li{
  font-size:38px;line-height:1.36;font-weight:500;color:var(--muted);
  padding-left:46px;position:relative;margin-bottom:24px;
}
.ticks li::before{content:"";position:absolute;left:0;top:19px;width:22px;height:5px;background:var(--accent);border-radius:5px;}
.dashes li{color:var(--ink);font-weight:600;}
.dashes li::before{content:"";position:absolute;left:0;top:19px;width:22px;height:5px;background:var(--teal);border-radius:5px;}

.intro{font-size:36px;font-weight:600;color:var(--muted);margin-bottom:30px;}
.note{
  margin-top:auto;font-size:28px;line-height:1.45;color:var(--muted);
  border-top:2px solid rgba(16,25,34,.14);padding-top:26px;
}
.note em{font-style:italic;}

.callout{
  margin-top:auto;background:var(--ink);color:var(--paper);
  font-size:39px;font-weight:800;line-height:1.24;letter-spacing:-.015em;
  padding:38px 42px;border-radius:22px;
}

.data .stat{margin:auto 0 46px;}
.figure{font-size:210px;font-weight:900;line-height:.9;letter-spacing:-.05em;color:var(--accent);}
.figure-cap{font-size:40px;line-height:1.3;font-weight:500;color:var(--paper);margin-top:26px;max-width:830px;}
.figure-cap strong{font-weight:800;}
.body-dark{font-size:32px;line-height:1.44;color:var(--muted-dark);margin-bottom:22px;max-width:880px;}
.body-dark strong{color:var(--paper);font-weight:700;}

.numbered{counter-reset:n;margin-bottom:40px;}
.numbered li{
  counter-increment:n;font-size:33px;line-height:1.4;color:var(--muted);font-weight:500;
  padding-left:74px;position:relative;margin-bottom:30px;
}
.numbered li::before{
  content:counter(n);position:absolute;left:0;top:-2px;
  width:48px;height:48px;border-radius:50%;background:var(--accent);color:#fff;
  font-size:26px;font-weight:800;display:flex;align-items:center;justify-content:center;
}
.numbered strong{color:var(--ink);font-weight:800;}
.numbered em{font-style:italic;}

.cols{display:flex;gap:34px;margin-top:6px;flex:1;}
.col{flex:1;border-radius:22px;padding:38px 34px;}
.col.good{background:rgba(27,122,112,.10);border:3px solid rgba(27,122,112,.32);}
.col.bad{background:rgba(228,98,47,.10);border:3px solid rgba(228,98,47,.32);}
.col-head{font-size:31px;font-weight:900;letter-spacing:.03em;text-transform:uppercase;margin-bottom:26px;}
.col.good .col-head{color:var(--teal);}
.col.bad .col-head{color:var(--accent);}
.col li{font-size:31px;line-height:1.36;font-weight:500;color:var(--muted);margin-bottom:26px;padding-left:28px;position:relative;}
.col li::before{content:"";position:absolute;left:0;top:16px;width:14px;height:4px;border-radius:4px;}
.col.good li::before{background:var(--teal);}
.col.bad li::before{background:var(--accent);}

.steps li{
  font-size:37px;line-height:1.34;color:var(--muted-dark);font-weight:500;
  padding-left:44px;position:relative;margin-bottom:26px;
}
.steps li::before{content:"";position:absolute;left:0;top:18px;width:22px;height:5px;background:var(--accent);border-radius:5px;}
.steps strong{color:var(--paper);font-weight:800;}
.closing-line{font-size:44px;font-weight:800;line-height:1.24;letter-spacing:-.02em;color:var(--paper);margin-top:4px;}
.closing .rule{margin:34px 0 30px;}

.cta{margin-top:auto;border-top:2px solid rgba(246,242,234,.16);padding-top:34px;}
.cta-q{font-size:32px;line-height:1.34;font-weight:700;color:var(--paper);margin-bottom:14px;}
.cta-note{font-size:25px;font-weight:600;letter-spacing:.03em;color:var(--accent);}
.chrome{
  position:absolute;left:92px;right:92px;bottom:58px;
  display:flex;justify-content:space-between;align-items:center;
  font-size:24px;font-weight:700;letter-spacing:.05em;color:rgba(16,25,34,.42);
}
.chrome.on-dark{color:rgba(246,242,234,.45);}
.chrome .count{font-variant-numeric:tabular-nums;}
</style></head><body>${slides.join('\n')}</body></html>`;

fs.writeFileSync(path.join(DIR, '.carrusel.html'), html);

(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
  const page = await browser.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 1 });
  await page.goto('file://' + path.join(DIR, '.carrusel.html'));
  await page.evaluate(() => document.fonts.ready);
  const els = await page.$$('.slide');
  const names = ['01-portada', '02-definicion', '03-problema', '04-dato', '05-precision', '06-ia-util-vs-slop', '07-que-hacer'];
  for (let i = 0; i < els.length; i++) {
    const file = path.join(OUT, `${names[i]}.png`);
    await els[i].screenshot({ path: file });
    console.log('ok', names[i]);
  }
  await browser.close();
})();
