// Genera las imagenes del carrusel (1080 x 1350 px) en imagenes/.
//
//   node generar-imagenes.js
//
// Requiere Node y Playwright con Chromium. Las tipografias (Inter y Source
// Serif 4, ambas con licencia SIL OFL) se descargan de Google Fonts a
// .fuentes/ la primera vez y se incrustan en el HTML antes de capturar.
//
// El texto de cada diapositiva sale literalmente de post-final.md. Si se
// edita alli, hay que editarlo aqui y volver a ejecutar el script.

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

// --- Diapositivas -----------------------------------------------------------
// name: nombre del PNG · dark: fondo oscuro · body: contenido

const SLIDES = [
  {
    name: '01-portada',
    dark: true,
    cover: true,
    body: `
      <div class="eyebrow accent">IA y universidad</div>
      <div class="cover-main">
        <h1 class="mega">Academic<br>slop</h1>
        <div class="rule"></div>
        <p class="lede">Cuando el trabajo entregado mejora<br>y el aprendizaje empeora.</p>
      </div>
      <div class="swipe">Desliza <span class="arrow">&rarr;</span></div>`,
  },
  {
    name: '02-la-escena',
    body: `
      <div class="eyebrow accent">La escena</div>
      <p class="p lead">Un estudiante entrega un análisis impecable.</p>
      <p class="p">La estructura es limpia, la bibliografía parece correcta y el tono académico se mantiene de principio a fin.</p>
      <div class="pull">Le pones un notable alto.</div>`,
  },
  {
    name: '03-la-pregunta',
    body: `
      <div class="eyebrow accent">Dos semanas después</div>
      <p class="p">En clase le preguntas por qué eligió ese marco teórico y no otro.</p>
      <p class="p">También le preguntas qué habría cambiado en sus conclusiones si hubiese tomado una decisión diferente.</p>
      <div class="mega-pull">No hay<br>respuesta.</div>`,
  },
  {
    name: '04-no-es-honestidad',
    dark: true,
    body: `
      <div class="eyebrow accent">Lo que falla</div>
      <p class="p on-dark">No es que se haya puesto nervioso ni que haya olvidado lo que escribió. Es que esa decisión nunca fue realmente suya.</p>
      <p class="p on-dark">No hay plagio. Ningún detector señalará necesariamente nada extraño. Y sin embargo, algo ha fallado justo donde más importa.</p>
      <div class="pull on-dark">No es solo un problema de honestidad académica.<br>Es un problema de aprendizaje.</div>`,
  },
  {
    name: '05-el-nombre',
    body: `
      <div class="eyebrow accent">El nombre</div>
      <p class="p">En el mundo empresarial ya se utiliza el término <strong>AI slop</strong>: contenido generado con IA que parece pulido, pero aporta poco y obliga a otras personas a comprobarlo, corregirlo o rehacerlo.</p>
      <p class="p">Holweg y Davenport advierten de que, cuando entra sin control en los procesos, deteriora la precisión y la calidad del conocimiento sobre el que después se toman decisiones.</p>
      <p class="note">Es un análisis organizativo, no un estudio experimental sobre universidades. Me aporta el concepto, no la prueba.</p>`,
  },
  {
    name: '06-slop-academico',
    body: `
      <div class="eyebrow accent">En la universidad</div>
      <h2>Slop<br>académico</h2>
      <blockquote>Trabajos generados o reconstruidos con IA que cumplen formalmente con una tarea, pero sustituyen el proceso intelectual que esa tarea pretendía provocar.</blockquote>`,
  },
  {
    name: '07-no-solo-citas',
    body: `
      <div class="eyebrow accent">No solo citas inventadas</div>
      <p class="p">Esa es la versión más evidente y, probablemente, la menos preocupante.</p>
      <p class="p big">Hablamos del análisis que no se sabe defender. Del código que no se entiende. De la síntesis que no se puede contrastar. De una voz académica que no pertenece a quien firma el trabajo.</p>`,
  },
  {
    name: '08-la-paradoja',
    body: `
      <div class="eyebrow accent">La paradoja</div>
      <p class="p">Casi todos los indicadores aparentes pueden mejorar. Los textos están mejor redactados. Las entregas parecen más completas. Las calificaciones pueden subir.</p>
      <div class="pull">Si solo observamos el resultado final, podríamos concluir que una cohorte aprende más que la anterior cuando quizá estamos viendo exactamente lo contrario.</div>`,
  },
  {
    name: '09-la-dificultad',
    dark: true,
    body: `
      <div class="eyebrow accent">Por qué ocurre</div>
      <p class="p on-dark">Porque el trabajo intelectual que pretendíamos provocar —leer con criterio, elegir, descartar, equivocarse, revisar y volver a intentarlo— es precisamente lo que se ha delegado.</p>
      <div class="mega-pull small on-dark">La dificultad no siempre es un obstáculo para el aprendizaje. Muchas veces es el lugar donde el aprendizaje ocurre.</div>`,
  },
  {
    name: '10-el-desplazamiento',
    body: `
      <div class="eyebrow accent">Y el trabajo no desaparece: se desplaza</div>
      <p class="p">El docente deja de discutir ideas para dedicarse a comprobar de dónde proceden. Deja de acompañar el aprendizaje para verificar productos aparentemente terminados.</p>
      <div class="pull">En la empresa, ese desplazamiento deteriora los procesos. En la universidad puede comprometer la formación de una persona.</div>`,
  },
  {
    name: '11-la-evidencia',
    dark: true,
    body: `
      <div class="eyebrow accent">Ensayo aleatorizado &middot; ~1.000 estudiantes de secundaria &middot; Matemáticas</div>
      <div class="stat">
        <div class="figure">&minus;17&thinsp;%</div>
        <p class="figure-cap">en la evaluación <strong>sin IA</strong>, frente al grupo que nunca había tenido acceso a ella.</p>
      </div>
      <p class="p on-dark">Durante las sesiones de práctica, quienes podían utilizar libremente GPT&#8209;4 obtuvieron mejores resultados mientras tenían la herramienta delante.</p>`,
  },
  {
    name: '12-el-tercer-grupo',
    body: `
      <div class="eyebrow accent">El dato más importante</div>
      <p class="p">Está en el tercer grupo. Los estudiantes que utilizaron un tutor basado en GPT&#8209;4, diseñado para ofrecer pistas y acompañar el razonamiento sin proporcionar directamente las respuestas, no mostraron ese deterioro.</p>
      <div class="pull">La cuestión no es utilizar o no utilizar IA. La variable decisiva es qué hace la herramienta con la dificultad.</div>`,
  },
  {
    name: '13-los-limites',
    body: `
      <div class="eyebrow accent">Honestidad con los límites</div>
      <p class="p">Ese estudio se realizó en secundaria y en matemáticas. Trasladarlo a la universidad es una hipótesis razonable, todavía no una conclusión demostrada.</p>
      <p class="p">En el estudio de METR, 16 desarrolladores experimentados necesitaron un 19&thinsp;% más de tiempo con IA. No eran estudiantes, y la propia organización ha explicado después que sus datos recientes están afectados por sesgos de selección.</p>
      <div class="pull">La coherencia no es un adorno del argumento. Es parte del argumento.</div>`,
  },
  {
    name: '14-cambiar-que-evaluamos',
    body: `
      <div class="eyebrow accent">La salida</div>
      <p class="p">No está en buscar un detector infalible ni en prohibir una tecnología que ya forma parte de la realidad académica y profesional. La oportunidad no consiste en vigilar mejor el mismo tipo de tareas.</p>
      <div class="pull inline">Consiste en cambiar qué evaluamos.</div>
      <p class="p">Si evaluamos el archivo final, evaluamos un producto que la IA genera con una calidad formal muy elevada. Si evaluamos el proceso, observamos el recorrido intelectual del estudiante.</p>`,
  },
  {
    name: '15-decisiones-docentes',
    body: `
      <div class="eyebrow accent">Qué significa en la práctica</div>
      <p class="p">Pedir que explique qué fuentes utilizó, qué verificó, qué descartó y por qué decidió así. Plantear tareas vinculadas a contextos reales. Reservar unos minutos para que defienda su trabajo y lo transfiera a una situación distinta.</p>
      <p class="p">Y enseñar un uso que preserve el aprendizaje: pedir pistas, preguntas y contraejemplos en vez de respuestas; contrastar con fuentes primarias; documentar el proceso en lugar de esconderlo.</p>
      <div class="pull">No son medidas de control.<br>Son decisiones docentes.</div>`,
  },
  {
    name: '16-cierre',
    dark: true,
    body: `
      <div class="eyebrow accent">El cierre</div>
      <p class="p on-dark">La pregunta importante ya no es si la IA escribe mejor que el año pasado. Es evidente que lo hace y seguirá haciéndolo.</p>
      <div class="mega-pull small on-dark">¿Qué competencia conserva el estudiante cuando retiramos la herramienta?</div>
      <div class="rule"></div>
      <p class="closing-line">La IA puede acelerar el aprendizaje.<br>Lo que no puede sustituir es la evidencia<br>de que alguien ha aprendido.</p>
      <div class="cta">
        <p class="cta-note">Fuentes en el primer comentario &middot; Guarda y comparte</p>
      </div>`,
  },
];

const N = SLIDES.length;

const html = `<!doctype html><html lang="es"><head><meta charset="utf-8"><style>
@font-face{font-family:'Inter';src:url(data:font/woff2;base64,${INTER}) format('woff2');font-weight:100 900;font-style:normal;}
@font-face{font-family:'SourceSerif';src:url(data:font/woff2;base64,${SERIF}) format('woff2');font-weight:500;font-style:italic;}
:root{
  --ink:#101922; --paper:#F6F2EA;
  --accent:#E4622F; --teal:#1B7A70;
  --muted:#3F4F5B; --muted-dark:#A7B6C1;
}
*{box-sizing:border-box;margin:0;padding:0;}
body{background:#555;font-family:'Inter',system-ui,sans-serif;-webkit-font-smoothing:antialiased;}
.slide{
  width:1080px;height:1350px;padding:92px 88px 152px;position:relative;
  display:flex;flex-direction:column;overflow:hidden;
}
.slide.light{background:var(--paper);color:var(--ink);}
.slide.dark{background:var(--ink);color:var(--paper);}
.slide.dark::after{
  content:"";position:absolute;inset:0;pointer-events:none;
  background:radial-gradient(900px 620px at 84% 6%, rgba(228,98,47,.15), transparent 62%);
}
.slide > *{position:relative;z-index:1;}

.eyebrow{
  font-size:24px;font-weight:800;letter-spacing:.15em;text-transform:uppercase;
  line-height:1.4;margin-bottom:44px;
}
.eyebrow.accent{color:var(--accent);}

/* Prosa: es el elemento principal de casi todas las diapositivas. */
.p{font-size:39px;line-height:1.44;font-weight:500;color:var(--muted);margin-bottom:34px;}
.p.on-dark{color:var(--muted-dark);}
.p strong{font-weight:800;color:var(--ink);}
.p.on-dark strong{color:var(--paper);}
.p.lead{font-size:47px;line-height:1.3;font-weight:700;color:var(--ink);}
.p.big{font-size:43px;line-height:1.38;color:var(--ink);font-weight:600;}
.p:last-of-type{margin-bottom:0;}

.pull{
  margin-top:auto;font-size:41px;font-weight:800;line-height:1.26;letter-spacing:-.02em;
  color:var(--ink);border-left:10px solid var(--accent);padding-left:36px;
}
.pull.on-dark{color:var(--paper);}
.pull.inline{margin-top:6px;margin-bottom:38px;}

.mega-pull{
  margin-top:auto;font-size:104px;font-weight:900;line-height:.98;letter-spacing:-.04em;
  color:var(--ink);
}
.mega-pull.small{font-size:56px;line-height:1.14;letter-spacing:-.03em;}
.mega-pull.on-dark{color:var(--paper);}

h1.mega{font-size:126px;font-weight:900;line-height:.92;letter-spacing:-.04em;}
h2{font-size:88px;font-weight:800;line-height:1.0;letter-spacing:-.035em;margin-bottom:48px;}

.rule{width:132px;height:9px;background:var(--accent);border-radius:9px;margin:36px 0;}

.cover-main{margin-top:auto;margin-bottom:auto;}
.lede{font-size:40px;line-height:1.34;font-weight:500;color:var(--muted-dark);}
.swipe{
  margin-top:auto;font-size:27px;font-weight:700;letter-spacing:.06em;
  text-transform:uppercase;color:var(--accent);
}
.swipe .arrow{display:inline-block;margin-left:8px;}

blockquote{
  font-family:'SourceSerif',Georgia,serif;font-style:italic;font-weight:500;
  font-size:50px;line-height:1.32;color:var(--ink);
  border-left:10px solid var(--accent);padding-left:38px;
}

.note{
  margin-top:auto;font-size:28px;line-height:1.46;color:var(--muted);
  border-top:2px solid rgba(16,25,34,.14);padding-top:26px;
}

.stat{margin:auto 0 40px;}
.figure{font-size:196px;font-weight:900;line-height:.9;letter-spacing:-.05em;color:var(--accent);}
.figure-cap{font-size:39px;line-height:1.3;font-weight:500;color:var(--paper);margin-top:26px;}
.figure-cap strong{font-weight:800;}

.closing-line{font-size:42px;font-weight:800;line-height:1.26;letter-spacing:-.02em;color:var(--paper);}
.cta{margin-top:auto;border-top:2px solid rgba(246,242,234,.16);padding-top:30px;}
.cta-note{font-size:25px;font-weight:700;letter-spacing:.03em;color:var(--accent);}

.chrome{
  position:absolute;left:88px;right:88px;bottom:56px;
  display:flex;justify-content:space-between;align-items:center;
  font-size:23px;font-weight:700;letter-spacing:.05em;color:rgba(16,25,34,.40);
}
.chrome.on-dark{color:rgba(246,242,234,.44);}
.chrome .count{font-variant-numeric:tabular-nums;}
</style></head><body>
${SLIDES.map((s, i) => `<section class="slide ${s.dark ? 'dark' : 'light'}">${s.body}
  <div class="chrome ${s.dark ? 'on-dark' : ''}"><span>${HANDLE}</span><span class="count">${i + 1} / ${N}</span></div>
</section>`).join('\n')}
</body></html>`;

fs.writeFileSync(path.join(DIR, '.carrusel.html'), html);

(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
  const page = await browser.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 1 });
  await page.goto('file://' + path.join(DIR, '.carrusel.html'));
  await page.evaluate(() => document.fonts.ready);

  // Aviso si algun texto se sale de su diapositiva.
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
