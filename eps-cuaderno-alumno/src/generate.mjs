// Generador del "Cuaderno del participante" en formato A5 con portada y
// contraportada de Paincorp, preparado para encuadernación grapada (saddle-stitch).
//
// Geometría (plantilla Pixartprinting "Encuadernación grapada", A5):
//   · Documento con sangrado: 154 × 216 mm
//   · Corte (trim): 148 × 210 mm  (A5)
//   · Sangrado (bleed): 3 mm por lado
//   · Área de seguridad: 3 mm hacia dentro del corte (6 mm desde el borde del documento)
//
// Salida: HTML de una página por hoja, en orden de lectura, listo para exportar a PDF.

import { writeFileSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Logotipo oficial Fundación Paincorp (vectorial .ai → PNG a alta resolución,
// fondo transparente). Se incrusta en base64 para que el HTML sea autónomo.
//   · negativo  → texto blanco + tick turquesa, para la portada (fondo oscuro)
//   · positivo  → texto tinta + tick turquesa, para la contraportada
const logoAsset = (file) =>
  'data:image/png;base64,' +
  readFileSync(resolve(__dirname, '..', 'assets', file)).toString('base64');
const LOGO_NEG = logoAsset('logo-fundacion-paincorp-negativo.png');
const LOGO_POS = logoAsset('logo-fundacion-paincorp.png');

/* ----------------------------------------------------------------------- *
 * Contenido de las sesiones (extraído del cuaderno original)
 * ----------------------------------------------------------------------- */

const sessions = [
  {
    n: 1,
    title: 'PainCafé de bienvenida: presentación, valores y necesidades',
    dense: true,
    hoy: 'Nos conocemos en un ambiente de café (PainCafé). Compartimos una fotografía que represente tu vivencia del dolor y conversamos sobre cómo lo vives y qué necesitas. Con tu permiso, grabamos la sesión para escuchar mejor al grupo.',
    blocks: [
      { type: 'write', label: 'Mi fotografía y las dos preguntas del PainCafé', note: 'Tu foto: ¿qué muestra y por qué la elegiste? · ¿Qué supone convivir con el dolor crónico? · ¿Qué necesitas para vivir mejor con él?', lines: 2 },
      { type: 'write', label: 'Mis valores y mi compromiso', note: 'Áreas de tu vida que más te importan (familia, trabajo, ocio, salud…) y a qué te comprometes.', lines: 2 },
      { type: 'table', label: 'Autoobservación de un día con dolor',
        headers: ['Momento', 'Situación', 'Qué noté en el cuerpo', 'Qué pensé o sentí', 'Qué hice'], rows: 3 },
    ],
    tarea: 'Contrato personal y autoobservación de un día con dolor.',
  },
  {
    n: 2,
    title: 'Dolor no es daño: reconceptualización',
    hoy: 'Veremos por qué el dolor y el daño no son lo mismo: el dolor es una alarma del sistema nervioso que a veces se vuelve demasiado sensible.',
    blocks: [
      { type: 'table', label: 'Registro de pensamientos y conductas ante el dolor',
        headers: ['Situación', '¿Qué pensé sobre el dolor?', '¿Qué hice o dije?'], rows: 6 },
    ],
    tarea: 'Registro de pensamientos y conductas verbales ante el dolor.',
  },
  {
    n: 3,
    title: 'Neurofisiología y neuroplasticidad',
    hoy: 'Tu sistema nervioso aprende. Si ha aprendido a protegerte de más, también puede reaprender: a eso lo llamamos neuroplasticidad.',
    blocks: [
      { type: 'write', label: 'Una idea nueva sobre el dolor y la neuroplasticidad', note: 'Escribe con tus palabras una idea que te haya sorprendido o ayudado hoy.', lines: 8 },
    ],
    tarea: 'Visionado breve sobre neuroplasticidad y registro de una idea nueva.',
  },
  {
    n: 4,
    title: 'Imaginería motora',
    hoy: 'Entrenaremos el movimiento desde el cerebro: imaginería y lateralidad, un primer paso seguro para reactivar el sistema motor.',
    blocks: [
      { type: 'table', label: 'Registro de práctica de imaginería y lateralidad',
        headers: ['Día', '¿La hice? (sí/no)', 'Notas'], rows: 7, widths: [22, 26, 52] },
    ],
    tarea: 'Práctica diaria breve de imaginería y lateralidad.',
  },
  {
    n: 5,
    title: 'Recaídas y afrontamiento',
    hoy: 'El dolor sube y baja: es normal. Hoy preparas tu plan para los días malos, para que no te pillen desprevenido.',
    blocks: [
      { type: 'table', label: 'Mi plan ante recaídas',
        headers: ['Señales de alarma (cómo sé que recaigo)', 'Qué haré', 'A quién acudo'], rows: 6 },
    ],
    tarea: 'Completar el plan personal de recaídas.',
  },
  {
    n: 6,
    title: 'Atención al cuerpo y homúnculo sensoriomotor',
    hoy: "Afinaremos cómo percibes tu cuerpo: el dolor puede 'desdibujar' zonas, y entrenarlas ayuda a verlas con más claridad.",
    blocks: [
      { type: 'table', label: 'Registro de ejercicios de atención y discriminación corporal',
        headers: ['Día', 'Ejercicio realizado', '¿Qué noté?'], rows: 7, widths: [22, 40, 38] },
    ],
    tarea: 'Ejercicios diarios de atención y discriminación corporal.',
  },
  {
    n: 7,
    title: 'Aprendizaje y miedo-evitación',
    hoy: 'Cuando algo duele, es natural evitarlo; pero evitar mantiene el miedo. Veremos cómo romper ese círculo acercándote poco a poco.',
    blocks: [
      { type: 'table', label: 'Registro de evitaciones y pequeñas aproximaciones',
        headers: ['Situación', 'Lo que evité', 'Pequeña aproximación que probé'], rows: 6 },
    ],
    tarea: 'Registro de evitaciones y de pequeñas aproximaciones.',
  },
  {
    n: 8,
    title: 'Exposición graduada: jerarquía de movimientos',
    hoy: 'Ordenaremos de menor a mayor los movimientos que te dan respeto y empezaremos a practicarlos de forma segura, peldaño a peldaño.',
    blocks: [
      { type: 'table', label: 'Mi jerarquía de exposición',
        headers: ['Peldaño', 'Movimiento o actividad', 'Dificultad (0-10)', 'Logrado'], rows: 7, widths: [16, 46, 22, 16] },
    ],
    tarea: 'Practicar el primer peldaño de exposición en casa.',
  },
  {
    n: 9,
    title: 'Emoción y regulación emocional',
    hoy: 'El dolor y las emociones van de la mano. Practicaremos respiración y regulación para bajar la intensidad cuando aparece el malestar.',
    blocks: [
      { type: 'table', label: 'Registro de práctica de respiración y emociones',
        headers: ['Día', '¿Practiqué respiración?', 'Emoción predominante', 'Intensidad (0-10)'], rows: 7, widths: [18, 28, 30, 24] },
    ],
    tarea: 'Práctica diaria de respiración y registro emocional.',
  },
  {
    n: 10,
    dense: true,
    title: 'Contexto, expectativas y creencias',
    hoy: 'Lo que esperas, crees y el contexto en el que estás cambian tu dolor. Revisaremos algunas reglas y buscaremos alternativas más útiles.',
    blocks: [
      { type: 'table', label: 'Mis creencias sobre el dolor',
        headers: ['Creencia sobre el dolor', '¿Me ayuda?', '¿Es cierta?', 'Alternativa más útil'], rows: 3, widths: [34, 15, 15, 36] },
      { type: 'table', label: 'Contextos que modulan mi dolor',
        headers: ['Contexto / situación', '¿Aumenta o reduce mi dolor?'], rows: 3, widths: [56, 44] },
      { type: 'note', label: 'Para reflexionar: dolor y roles de género',
        note: '¿Crees que el dolor se vive o se atiende de forma distinta en mujeres y en hombres? ¿Cómo influyen los roles (cuidados, trabajo, expectativas) en tu dolor y en el tiempo que dedicas a cuidarte?' },
    ],
    tarea: 'Registro de creencias y de contextos que aumentan o reducen el dolor.',
  },
  {
    n: 11,
    title: 'Diseño del programa de exposición graduada',
    hoy: 'Convertiremos tu jerarquía en un plan concreto de exposición, ajustado a tu ritmo, para avanzar semana a semana con confianza.',
    blocks: [
      { type: 'table', label: 'Mi programa de exposición',
        headers: ['Semana', 'Peldaño trabajado', 'Cómo fue (0-10)', 'Siguiente paso'], rows: 7, widths: [16, 34, 20, 30] },
    ],
    tarea: 'Avanzar en la jerarquía de exposición.',
  },
  {
    n: 12,
    title: 'Sueño y autorregulación',
    hoy: 'Dormir peor aumenta el dolor y el dolor empeora el sueño. Diseñaremos una rutina nocturna que rompa ese círculo.',
    blocks: [
      { type: 'checklist', label: 'Mi rutina de sueño (hábitos que voy a cuidar)',
        items: [
          'Horario regular para acostarme y levantarme',
          'Reducir pantallas antes de dormir',
          'Ambiente oscuro, silencioso y a buena temperatura',
          'Evitar cafeína/estimulantes por la tarde',
          'Rutina relajante antes de acostarme (respiración, lectura…)',
        ] },
      { type: 'write', label: 'Mi plan personal de sueño', note: 'Esta semana voy a…', lines: 3 },
    ],
    tarea: 'Implantar la rutina de higiene del sueño.',
  },
  {
    n: 13,
    title: 'Actividad graduada',
    hoy: 'Ni pasarte ni quedarte corto: aprenderás a dosificar la actividad partiendo de una línea base y avanzando poco a poco.',
    blocks: [
      { type: 'table', label: 'Mi plan de actividad graduada',
        headers: ['Actividad', 'Línea base', 'Progresión semanal', 'Notas'], rows: 7, widths: [28, 20, 26, 26] },
    ],
    tarea: 'Registrar la línea base y la primera progresión.',
  },
  {
    n: 14,
    title: 'Análisis de barreras',
    hoy: '¿Qué podría hacer que abandones lo aprendido? Hoy anticipamos esas barreras y entrenamos cómo resolverlas.',
    blocks: [
      { type: 'table', label: 'Mis barreras y cómo las afrontaré',
        headers: ['Barrera', 'Cómo la afrontaré', 'Apoyo (persona/recurso)'], rows: 6 },
    ],
    tarea: 'Plan de afrontamiento de una o dos barreras propias.',
  },
  {
    n: 15,
    title: 'Variabilidad motora y aprendizaje a través del movimiento',
    hoy: 'Hay muchas maneras de moverse. Explorar esa variedad, con seguridad, ayuda a recuperar un movimiento más libre y confiado.',
    blocks: [
      { type: 'write', label: 'Mi exploración del movimiento', note: 'Movimientos o formas nuevas que probé y cómo me sentí:', lines: 8 },
    ],
    tarea: 'Integrar la variabilidad en la rutina diaria.',
  },
  {
    n: 16,
    title: 'Síntesis y proyecto de continuidad',
    hoy: 'Recogemos lo aprendido y lo convertimos en metas concretas y en un plan para seguir avanzando por tu cuenta a 3 y 6 meses.',
    blocks: [
      { type: 'table', label: 'Mis metas SMART',
        headers: ['Meta', 'Cómo la mediré', 'Plazo'], rows: 4, widths: [46, 34, 20] },
      { type: 'write', label: 'Mi proyecto de continuidad (3 a 6 meses)', note: '¿Qué vas a seguir haciendo para mantener y ampliar lo conseguido?', lines: 3 },
    ],
    tarea: 'Ejecutar el plan personal de continuidad a tres y seis meses.',
  },
];

/* ----------------------------------------------------------------------- *
 * Utilidades de render de bloques
 * ----------------------------------------------------------------------- */

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function renderWrite(b) {
  const lines = b.lines || 3;
  return `<div class="block">
    <div class="block-label">${esc(b.label)}</div>
    ${b.note ? `<div class="block-note">${esc(b.note)}</div>` : ''}
    <div class="write" style="--lines:${lines}"></div>
  </div>`;
}

function renderNote(b) {
  return `<div class="block">
    <div class="block-label">${esc(b.label)}</div>
    <div class="reflect">${esc(b.note)}</div>
  </div>`;
}

function renderChecklist(b) {
  const items = b.items.map((it) => `<li>${esc(it)}</li>`).join('');
  return `<div class="block">
    <div class="block-label">${esc(b.label)}</div>
    <ul class="checklist">${items}</ul>
  </div>`;
}

function renderTable(b) {
  const widths = b.widths || null;
  const colgroup = widths ? `<colgroup>${widths.map((w) => `<col style="width:${w}%">`).join('')}</colgroup>` : '';
  const head = `<tr>${b.headers.map((h) => `<th>${esc(h)}</th>`).join('')}</tr>`;
  let body = '';
  for (let r = 0; r < b.rows; r++) {
    body += `<tr>${b.headers.map(() => '<td></td>').join('')}</tr>`;
  }
  return `<div class="block">
    <div class="block-label">${esc(b.label)}</div>
    <table class="grid">${colgroup}<thead>${head}</thead><tbody>${body}</tbody></table>
  </div>`;
}

function renderBlock(b) {
  switch (b.type) {
    case 'write': return renderWrite(b);
    case 'note': return renderNote(b);
    case 'checklist': return renderChecklist(b);
    case 'table': return renderTable(b);
    default: return '';
  }
}

/* ----------------------------------------------------------------------- *
 * Marca Paincorp (logotipo vectorial)
 * ----------------------------------------------------------------------- */

// Identidad Fundación Paincorp: logotipo con el característico "tick" cuadrado
// turquesa sobre la letra inicial. Se reproduce con tipografía y CSS.
//
// variant: 'onDark' (texto claro, tick turquesa) | 'onTeal'/'dark' (todo tinta)
function tickWord(text, variant, cls = '') {
  const txt = variant === 'onDark' ? 'var(--paper)' : 'var(--ink)';
  const tick = variant === 'onDark' ? 'var(--teal)' : 'var(--ink)';
  return `<span class="tw ${cls}" style="color:${txt}"><span class="tw-tick" style="background:${tick}"></span>${esc(text)}</span>`;
}

// Logotipo apilado "Fundación / Paincorp"
function logoStack(variant) {
  return `<div class="logo-stack">${tickWord('Fundación', variant, 'tw-sm')}${tickWord('Paincorp', variant)}</div>`;
}

// Logotipo en una línea "Paincorp"
function logoInline(variant) {
  return `<span class="logo-inline">${tickWord('Paincorp', variant)}</span>`;
}

// Patrón de marca: cuadrados en diagonal descendente (motivo Paincorp).
function stepMotif(x, y, n, s, gap, color) {
  let r = '';
  for (let i = 0; i < n; i++) {
    r += `<rect x="${x + i * (s + gap)}" y="${y + i * (s + gap)}" width="${s}" height="${s}" fill="${color}"/>`;
  }
  return r;
}

/* ----------------------------------------------------------------------- *
 * Páginas
 * ----------------------------------------------------------------------- */

const pages = [];

/* --- 1. PORTADA ------------------------------------------------------- */
pages.push(`
<section class="page cover">
  <div class="cover-bg"></div>
  <svg class="cover-motif" viewBox="0 0 154 216" preserveAspectRatio="none" aria-hidden="true">
    ${stepMotif(120, 18, 7, 8, 3, 'var(--teal)')}
  </svg>
  <header class="cover-top">
    <img class="logo-img" src="${LOGO_NEG}" alt="Fundación Paincorp">
  </header>
  <div class="cover-main">
    <div class="cover-kicker">Programa EPS · Dolor crónico</div>
    <h1 class="cover-title">Cuaderno del<br>participante</h1>
    <p class="cover-sub">Educación Terapéutica Bioconductual con orientación al dolor</p>
    <div class="cover-rule"></div>
    <p class="cover-tag">Innovación para una vida sin dolor</p>
  </div>
  <footer class="cover-foot">
    <div class="cover-org">Centro de Salud Entrevías · Dirección Asistencial Sureste (SERMAS)</div>
  </footer>
</section>`);

/* --- 2. BIENVENIDA ---------------------------------------------------- */
pages.push(`
<section class="page std">
  ${interiorHeader('Bienvenida', 'Antes de empezar el programa')}
  <div class="content">
    <p class="lead">Este cuaderno te acompañará durante las <strong>16 semanas</strong> del programa. En él irás anotando lo que descubres, tus ejercicios y tus planes. No hay respuestas correctas o incorrectas: es tu espacio de trabajo personal.</p>

    <h3 class="sec">El punto de partida</h3>
    <p>Ya has pasado por la cita de valoración: conoces el programa, has resuelto tus dudas y has firmado el consentimiento. El recorrido en grupo arranca directamente con el <strong>PainCafé</strong>, un primer encuentro en un ambiente distendido. Si aún no la has entregado, recuerda llevar la <strong>fotografía</strong> que represente qué significa el dolor para ti (puede ser un objeto, un lugar o una escena; no hay respuestas correctas).</p>

    <h3 class="sec">Cómo usar este cuaderno</h3>
    <ul class="bullets">
      <li>Cada sesión tiene su página con un pequeño resumen y los ejercicios para casa.</li>
      <li>Tómate unos minutos cada día para las tareas; los avances pequeños y constantes son los que funcionan.</li>
      <li>Trae el cuaderno a cada sesión. Lo que escribas es confidencial.</li>
      <li>Si algo te genera mucho malestar, coméntalo con el equipo del centro.</li>
    </ul>
  </div>
  ${interiorFooter(2)}
</section>`);

/* --- 3. MIS DATOS + MIS OBJETIVOS ------------------------------------- */
pages.push(`
<section class="page std">
  ${interiorHeader('Mis datos', 'Para empezar')}
  <div class="content">
    <table class="grid datos">
      <tbody>
        <tr><th>Nombre o código</th><td></td></tr>
        <tr><th>Sexo</th><td></td></tr>
        <tr><th>Edad</th><td></td></tr>
        <tr><th>Edición / grupo</th><td></td></tr>
        <tr><th>Profesional de referencia</th><td></td></tr>
      </tbody>
    </table>

    <div class="block" style="margin-top:5mm">
      <div class="block-label">Mis objetivos en el programa</div>
      <div class="block-note">¿Qué te gustaría conseguir o recuperar en estas 16 semanas?</div>
      <div class="write" style="--lines:5"></div>
    </div>

    <div class="it-conf" style="margin-top:5mm">
      <strong>Confidencial.</strong> Lo que escribas en este cuaderno es privado. Tráelo a cada sesión y compártelo solo con el equipo del centro si así lo deseas.
    </div>
  </div>
  ${interiorFooter(3)}
</section>`);

/* --- SESIONES --------------------------------------------------------- */
let pageNo = 3;
for (const s of sessions) {
  pageNo++;
  const chip = s.cont ? `${s.n}·` : `${s.n}`;
  const kicker = s.cont ? 'Sesión · continuación' : `Sesión ${s.n}`;
  const hoy = s.hoy ? `<div class="hoy"><span class="hoy-tag">Hoy</span><p>${esc(s.hoy)}</p></div>` : '';
  const blocks = s.blocks.map(renderBlock).join('');
  const tarea = s.tarea ? `<div class="tarea"><span class="tarea-tag">Mi tarea para casa</span><p>${esc(s.tarea)}</p></div>` : '';
  pages.push(`
<section class="page std session${s.dense ? ' dense' : ''}">
  ${interiorHeader(esc(s.title), kicker, chip, s.date)}
  <div class="content">
    ${hoy}
    ${blocks}
    ${tarea}
  </div>
  ${interiorFooter(pageNo)}
</section>`);
}

/* --- CONTRAPORTADA (genérica; se ve desde el primer día) --------------- */
pages.push(`
<section class="page backcover">
  <div class="cover-bg"></div>
  <svg class="cover-motif" viewBox="0 0 154 216" preserveAspectRatio="none" aria-hidden="true">
    ${stepMotif(120, 16, 6, 8, 3, 'rgba(29,31,33,0.16)')}
  </svg>
  <div class="bc-top"><img class="logo-img bc-logo" src="${LOGO_POS}" alt="Fundación Paincorp"></div>
  <div class="bc-main">
    <blockquote class="bc-quote">“Los avances pequeños y constantes son los que funcionan.”</blockquote>
    <p class="bc-text">Este cuaderno te acompaña durante todo el programa. Es tu espacio personal: vuelve a él siempre que lo necesites y avanza a tu ritmo.</p>
  </div>
  <footer class="bc-foot">
    <div class="bc-tagline">Innovación para una vida sin dolor</div>
    <div class="bc-services">Fisioterapia · Psicología · Anestesiología · Psiquiatría · Enfermería</div>
    <div class="bc-org">
      <div><strong>Centro de Salud Entrevías</strong> · Dirección Asistencial Sureste · SERMAS</div>
      <div>Programa EPS · Educación Terapéutica Bioconductual con orientación al dolor</div>
    </div>
    <div class="bc-conf">Documento personal y confidencial</div>
  </footer>
</section>`);

/* ----------------------------------------------------------------------- *
 * Cabecera / pie de páginas interiores
 * ----------------------------------------------------------------------- */

function interiorHeader(title, kicker, chip, date) {
  const chipHtml = chip ? `<div class="hdr-chip">${chip}</div>` : `<div class="hdr-chip mini"></div>`;
  const dateHtml = date ? `<div class="hdr-date">${esc(date)}</div>` : '';
  return `<header class="hdr">
    ${chipHtml}
    <div class="hdr-txt">
      <div class="hdr-kicker">${esc(kicker)}</div>
      <h2 class="hdr-title">${title}</h2>
      ${dateHtml}
    </div>
  </header>`;
}

function interiorFooter(n) {
  return `<footer class="ftr">
    <span class="ftr-brand">Fundación Paincorp · Cuaderno del participante</span>
    <span class="ftr-no">${n}</span>
  </footer>`;
}

// Nota: las funciones se declaran (hoisting) por lo que su uso arriba es válido.

/* ----------------------------------------------------------------------- *
 * CSS
 * ----------------------------------------------------------------------- */

const css = `
:root{
  --ink:#1D1F21;      /* Paincorp tinta  */
  --teal:#0DB1A4;     /* Paincorp turquesa */
  --mist:#B8CFD8;     /* Paincorp azul grisáceo */
  --paper:#FFFFFF;
  --muted:#5B6B70;
  --line:#C7D3D8;
  --soft:#EEF5F6;     /* fondo suave (tinte turquesa/mist) */
  --bleed:3mm;
}
*{box-sizing:border-box}
html,body{margin:0;padding:0}
body{font-family:'DejaVu Sans','Liberation Sans',sans-serif;color:var(--ink);-webkit-print-color-adjust:exact;print-color-adjust:exact}

@page{size:154mm 216mm;margin:0}

.page{
  position:relative;
  width:154mm;height:216mm;
  overflow:hidden;
  page-break-after:always;
  background:var(--paper);
}
.page:last-child{page-break-after:auto}

/* ================= LOGOTIPO (tick cuadrado Paincorp) ================= */
.tw{position:relative;display:inline-block;font-weight:700;letter-spacing:-.3pt;line-height:1;padding-left:.03em}
.tw-tick{position:absolute;top:-.17em;left:-.05em;width:.30em;height:.30em}
.logo-stack{line-height:1.04}
.logo-stack .tw{display:block;font-size:1em}
.logo-stack .tw-sm{font-size:.62em;margin-bottom:.10em;letter-spacing:0}
.logo-inline .tw{font-size:1em}

/* ================= PORTADA ================= */
.cover-bg{position:absolute;inset:0;background:linear-gradient(157deg,#24272B 0%,#1D1F21 55%,#141618 100%)}
.cover-motif{position:absolute;inset:0;width:100%;height:100%}
.cover-top{position:absolute;top:15mm;left:13mm}
.logo-img{display:block;width:53mm;height:auto}
.bc-logo{width:49mm}
.cover-main{position:absolute;left:13mm;right:13mm;top:78mm}
.cover-kicker{font-size:9.5pt;font-weight:700;letter-spacing:1.6pt;text-transform:uppercase;color:var(--teal);margin-bottom:6mm}
.cover-title{font-size:33pt;line-height:1.05;font-weight:700;margin:0;letter-spacing:-.4pt;color:var(--paper)}
.cover-sub{font-size:12.5pt;line-height:1.35;margin:7mm 0 0;color:var(--mist);max-width:118mm}
.cover-rule{width:26mm;height:2.6pt;background:var(--teal);margin:9mm 0 0}
.cover-tag{font-size:10.5pt;font-style:italic;margin:7mm 0 0;color:rgba(184,207,216,.85)}
.cover-foot{position:absolute;left:13mm;right:13mm;bottom:14mm}
.cover-owner{margin-bottom:7mm}
.cover-owner-label{display:block;font-size:8.5pt;letter-spacing:.6pt;text-transform:uppercase;color:rgba(184,207,216,.7);margin-bottom:4mm}
.cover-owner-line{display:block;height:.9pt;background:rgba(184,207,216,.5)}
.cover-org{font-size:8.5pt;line-height:1.4;color:rgba(184,207,216,.72);border-top:.7pt solid rgba(184,207,216,.28);padding-top:4mm}

/* ================= PÁGINA DE TÍTULO ================= */
.inner-title{padding:16mm 15mm 14mm}
.it-top{margin-bottom:16mm}
.inner-title .logo-stack{font-size:17pt;color:var(--ink)}
.it-body h2{position:relative;font-size:22pt;font-weight:700;color:var(--ink);margin:0 0 2mm;letter-spacing:-.3pt}
.it-program{font-size:11pt;font-style:italic;color:var(--muted);margin:0 0 8mm}
.it-lead{font-size:10.5pt;line-height:1.5;margin:0 0 10mm}
.it-fields{display:flex;flex-direction:column;gap:6mm;margin-bottom:11mm}
.it-field span{display:block;font-size:8.5pt;letter-spacing:.5pt;text-transform:uppercase;color:var(--muted);margin-bottom:2.5mm}
.it-field i{display:block;height:.9pt;background:var(--line)}
.it-conf{font-size:9.5pt;line-height:1.45;background:var(--soft);border-left:3pt solid var(--teal);padding:5mm 6mm}
.it-conf strong{color:var(--ink)}
.it-foot{position:absolute;left:15mm;right:15mm;bottom:12mm;display:flex;justify-content:space-between;font-size:8pt;color:var(--muted);border-top:.7pt solid var(--line);padding-top:3.5mm}

/* ================= PÁGINAS ESTÁNDAR ================= */
.std{display:flex;flex-direction:column}
.hdr{background:var(--ink);color:var(--paper);padding:12mm 13mm 6mm;display:flex;gap:5mm;align-items:flex-start}
.hdr-chip{flex:0 0 auto;width:13mm;height:13mm;background:var(--teal);color:var(--ink);font-size:14pt;font-weight:700;display:flex;align-items:center;justify-content:center;margin-top:1mm}
.hdr-chip.mini{width:6mm;height:6mm;background:var(--teal)}
.hdr-txt{flex:1 1 auto;min-width:0}
.hdr-kicker{font-size:8.5pt;font-weight:700;letter-spacing:1.4pt;text-transform:uppercase;color:var(--teal)}
.hdr-title{font-size:15.5pt;line-height:1.15;font-weight:700;margin:1.5mm 0 0;color:var(--paper)}
.hdr-date{font-size:9pt;color:var(--mist);margin-top:1.8mm;font-style:italic}

.content{flex:1 1 auto;padding:7mm 13mm 4mm;min-height:0}
.lead{font-size:10.5pt;line-height:1.5;margin:0 0 5mm}
p{margin:0 0 3mm}
.sec{position:relative;font-size:11.5pt;color:var(--ink);font-weight:700;margin:6mm 0 2.5mm;padding-left:5mm}
.sec:before{content:"";position:absolute;left:0;top:.32em;width:2.8mm;height:2.8mm;background:var(--teal)}
.content > p{font-size:10pt;line-height:1.5}
.bullets{margin:0 0 3mm;padding-left:5mm}
.bullets li{font-size:10pt;line-height:1.45;margin-bottom:2mm}
.bullets li::marker{color:var(--teal)}

.hoy{display:flex;gap:4mm;background:var(--soft);padding:4.5mm 5mm;margin-bottom:5mm}
.hoy-tag{flex:0 0 auto;font-size:8pt;font-weight:700;letter-spacing:1pt;text-transform:uppercase;color:var(--ink);background:var(--teal);padding:1.6mm 3mm;height:fit-content}
.hoy p{font-size:9.8pt;line-height:1.45;margin:0;color:var(--ink)}

.block{margin-bottom:5mm}
.block-label{position:relative;font-size:10.5pt;font-weight:700;color:var(--ink);margin-bottom:2.5mm;padding-left:5mm}
.block-label:before{content:"";position:absolute;left:0;top:.3em;width:2.6mm;height:2.6mm;background:var(--teal)}
.block-note{font-size:9pt;font-style:italic;color:var(--muted);margin-bottom:2.5mm;line-height:1.4}
.reflect{font-size:9.8pt;line-height:1.5;background:var(--soft);border:.8pt solid var(--line);padding:4mm 5mm}

.write{
  border:.9pt solid var(--line);background:var(--paper);
  background-image:repeating-linear-gradient(var(--paper) 0 7.5mm, var(--line) 7.5mm, var(--paper) calc(7.5mm + .5pt));
  height:calc(var(--lines) * 7.5mm);
}
.write.big{background-image:repeating-linear-gradient(var(--paper) 0 8.5mm, var(--line) 8.5mm, var(--paper) calc(8.5mm + .5pt));height:calc(var(--lines) * 8.5mm)}

.checklist{list-style:none;margin:0 0 3mm;padding:0}
.checklist li{position:relative;font-size:10pt;line-height:1.5;padding:2mm 0 2mm 8mm;border-bottom:.7pt solid var(--line)}
.checklist li:before{content:"";position:absolute;left:0;top:2.2mm;width:4.2mm;height:4.2mm;border:1.1pt solid var(--teal)}

table.grid{width:100%;border-collapse:collapse;table-layout:fixed}
table.grid th{background:var(--teal);color:var(--ink);font-size:8.6pt;font-weight:700;text-align:left;padding:2.6mm 2.4mm;line-height:1.2;border:.6pt solid var(--teal)}
table.grid td{border:.7pt solid var(--line);height:8.2mm;padding:1.5mm 2.4mm;font-size:9pt;vertical-align:top}
table.grid.datos th{width:44mm;background:var(--soft);color:var(--ink);border:.7pt solid var(--line);font-size:9.5pt}
table.grid.datos td{height:9.5mm}

.tarea{display:flex;gap:4mm;align-items:flex-start;margin-top:5mm;border:1pt dashed var(--teal);border-radius:2pt;padding:4mm 5mm;background:var(--soft)}
.tarea-tag{flex:0 0 auto;font-size:8pt;font-weight:700;letter-spacing:.8pt;text-transform:uppercase;color:var(--ink);background:var(--teal);padding:1.6mm 3mm}
.tarea p{font-size:9.6pt;line-height:1.4;margin:0}

/* Modo compacto para páginas con mucho contenido */
.session.dense .content{padding-top:4mm}
.session.dense .hoy{padding:3.5mm 4mm;margin-bottom:4mm}
.session.dense .hoy p{font-size:9.2pt;line-height:1.34}
.session.dense .block{margin-bottom:3mm}
.session.dense .block-label{margin-bottom:2mm}
.session.dense .block-note{margin-bottom:1.8mm}
.session.dense .write{background-image:repeating-linear-gradient(var(--paper) 0 6.5mm, var(--line) 6.5mm, var(--paper) calc(6.5mm + .5pt));height:calc(var(--lines) * 6.5mm)}
.session.dense table.grid td{height:6.5mm}
.session.dense table.grid th{padding:2mm 2.4mm}
.session.dense .reflect{padding:3mm 4mm;font-size:9pt;line-height:1.4}
.session.dense .tarea{margin-top:3mm;padding:3mm 4mm}
.session.dense .ftr{padding-bottom:8mm}

.ftr{margin-top:auto;padding:3.5mm 13mm 10mm;display:flex;justify-content:space-between;align-items:center;font-size:8pt;color:var(--muted)}
.ftr-brand{letter-spacing:.3pt}
.ftr-no{font-weight:700;color:var(--ink);font-size:9pt}

/* ================= CONTRAPORTADA (fondo turquesa) ================= */
.backcover .cover-bg{background:var(--teal)}
.bc-top{position:absolute;top:15mm;left:14mm}
.backcover .logo-stack{font-size:19pt;color:var(--ink)}
.bc-main{position:absolute;left:14mm;right:14mm;top:74mm}
.bc-quote{font-size:16.5pt;line-height:1.34;font-weight:700;margin:0 0 7mm;color:var(--ink)}
.bc-text{font-size:10.5pt;line-height:1.55;color:rgba(29,31,33,.82);margin:0}
.bc-foot{position:absolute;left:14mm;right:14mm;bottom:14mm}
.bc-tagline{font-size:11pt;font-weight:700;font-style:italic;color:var(--ink);margin-bottom:3mm}
.bc-services{font-size:8.6pt;font-weight:700;letter-spacing:.3pt;color:rgba(29,31,33,.78);margin-bottom:6mm}
.bc-org{font-size:8.6pt;line-height:1.5;color:rgba(29,31,33,.8);border-top:.8pt solid rgba(29,31,33,.28);padding-top:4.5mm}
.bc-org strong{color:var(--ink)}
.bc-conf{font-size:8pt;color:rgba(29,31,33,.62);margin-top:4mm;letter-spacing:.3pt}
`;

/* ----------------------------------------------------------------------- *
 * Documento final
 * ----------------------------------------------------------------------- */

const html = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<title>Cuaderno del participante · Fundación Paincorp (A5)</title>
<style>${css}</style>
</head>
<body>
${pages.join('\n')}
</body>
</html>`;

const outHtml = resolve(__dirname, '..', 'cuaderno-alumno-a5.html');
writeFileSync(outHtml, html, 'utf8');
console.log('HTML escrito en', outHtml);
console.log('Total de páginas (hojas de contenido):', pages.length);
console.log('Múltiplo de 4:', pages.length % 4 === 0 ? 'SÍ ✓' : `NO ✗ (resto ${pages.length % 4})`);
