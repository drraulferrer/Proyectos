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

import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

/* ----------------------------------------------------------------------- *
 * Contenido de las sesiones (extraído del cuaderno original)
 * ----------------------------------------------------------------------- */

const sessions = [
  {
    n: 1,
    title: 'PainCafé de bienvenida: presentación, valores y necesidades',
    date: 'viernes 4-sep-2026 · 18:00–19:00 h',
    dense: true,
    hoy: 'Nos conocemos en un ambiente de café (PainCafé). Compartimos una fotografía que represente tu vivencia del dolor y conversamos sobre cómo lo vives y qué necesitas. Con tu permiso, grabamos la sesión para escuchar mejor al grupo.',
    blocks: [
      { type: 'write', label: 'Mi fotografía (Photovoice)', note: 'La fotografía que has traído sobre qué significa el dolor para ti (entregada antes de la sesión): ¿qué muestra y por qué la elegiste?', lines: 2 },
      { type: 'write', label: 'Las dos preguntas del PainCafé', note: '1) ¿Qué supone para ti convivir con el dolor crónico? · 2) ¿Qué necesitas y qué te ayudaría a vivir mejor con el dolor?', lines: 2 },
      { type: 'write', label: 'Mis valores: ¿qué es importante para mí?', note: 'Anota las áreas de tu vida que más te importan (familia, trabajo, ocio, salud…) y cómo te gustaría vivirlas.', lines: 2 },
    ],
    tarea: 'Contrato personal y autoobservación de un día con dolor.',
  },
  {
    n: 1, cont: true,
    title: 'PainCafé de bienvenida (continuación)',
    date: 'viernes 4-sep-2026 · 18:00–19:00 h',
    blocks: [
      { type: 'write', label: 'Mi contrato personal', note: 'Me comprometo a…', lines: 3 },
      { type: 'table', label: 'Autoobservación de un día con dolor',
        headers: ['Momento', 'Situación', 'Qué noté en el cuerpo', 'Qué pensé o sentí', 'Qué hice'], rows: 4 },
    ],
    tarea: 'Contrato personal y autoobservación de un día con dolor.',
  },
  {
    n: 2,
    title: 'Dolor no es daño: reconceptualización',
    date: 'viernes 11-sep-2026 · 18:00–19:00 h',
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
    date: 'viernes 18-sep-2026 · 18:00–19:00 h',
    hoy: 'Tu sistema nervioso aprende. Si ha aprendido a protegerte de más, también puede reaprender: a eso lo llamamos neuroplasticidad.',
    blocks: [
      { type: 'write', label: 'Una idea nueva sobre el dolor y la neuroplasticidad', note: 'Escribe con tus palabras una idea que te haya sorprendido o ayudado hoy.', lines: 8 },
    ],
    tarea: 'Visionado breve sobre neuroplasticidad y registro de una idea nueva.',
  },
  {
    n: 4,
    title: 'Imaginería motora',
    date: 'viernes 25-sep-2026 · 18:00–19:00 h',
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
    date: 'viernes 2-oct-2026 · 18:00–19:00 h',
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
    date: 'viernes 9-oct-2026 · 18:00–19:00 h',
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
    date: 'viernes 16-oct-2026 · 18:00–19:00 h',
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
    date: 'viernes 23-oct-2026 · 18:00–19:00 h',
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
    date: 'viernes 30-oct-2026 · 18:00–19:00 h',
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
    date: 'viernes 6-nov-2026 · 18:00–19:00 h',
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
    date: 'viernes 13-nov-2026 · 18:00–19:00 h',
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
    date: 'viernes 20-nov-2026 · 18:00–19:00 h',
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
    date: 'viernes 27-nov-2026 · 18:00–19:00 h',
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
    date: 'viernes 4-dic-2026 · 18:00–19:00 h',
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
    date: 'viernes 11-dic-2026 · 18:00–19:00 h',
    hoy: 'Hay muchas maneras de moverse. Explorar esa variedad, con seguridad, ayuda a recuperar un movimiento más libre y confiado.',
    blocks: [
      { type: 'write', label: 'Mi exploración del movimiento', note: 'Movimientos o formas nuevas que probé y cómo me sentí:', lines: 8 },
    ],
    tarea: 'Integrar la variabilidad en la rutina diaria.',
  },
  {
    n: 16,
    title: 'Síntesis y proyecto de continuidad',
    date: 'viernes 18-dic-2026 · 18:00–19:00 h',
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

// Marca: ondas concéntricas que "se calman" hacia una línea (señal del sistema
// nervioso que se regula). Se usa en portada, cabeceras y contraportada.
function paincorpMark(size, color) {
  return `<svg class="mark" width="${size}" height="${size}" viewBox="0 0 48 48" fill="none" aria-hidden="true">
    <path d="M6 24c3.6 0 3.6-9 7.2-9s3.6 15 7.2 15 3.6-11 7.2-11 3.6 6 7.2 6 3.6-3 7.2-3" stroke="${color}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="24" cy="24" r="21.5" stroke="${color}" stroke-width="1.6" opacity="0.55"/>
  </svg>`;
}

function wordmark(variant) {
  // variant: 'light' (sobre fondo oscuro) | 'dark'
  const pain = variant === 'light' ? 'var(--cream)' : 'var(--teal)';
  const corp = 'var(--coral)';
  return `<span class="wordmark"><span style="color:${pain}">Pain</span><span style="color:${corp}">corp</span></span>`;
}

/* ----------------------------------------------------------------------- *
 * Páginas
 * ----------------------------------------------------------------------- */

const pages = [];

/* --- 1. PORTADA ------------------------------------------------------- */
pages.push(`
<section class="page cover">
  <div class="cover-bg"></div>
  <svg class="cover-motif" viewBox="0 0 154 216" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    ${[0,1,2,3,4,5,6].map((i)=>`<circle cx="132" cy="30" r="${18+i*15}" fill="none" stroke="rgba(246,241,232,0.10)" stroke-width="1.1"/>`).join('')}
    ${[0,1,2,3,4].map((i)=>`<circle cx="18" cy="200" r="${14+i*16}" fill="none" stroke="rgba(225,115,75,0.16)" stroke-width="1.1"/>`).join('')}
  </svg>
  <header class="cover-top">
    ${paincorpMark(34, 'var(--cream)')}
    ${wordmark('light')}
  </header>
  <div class="cover-main">
    <div class="cover-kicker">Programa EPS · Dolor crónico</div>
    <h1 class="cover-title">Cuaderno del<br>participante</h1>
    <p class="cover-sub">Educación Terapéutica Bioconductual con orientación al dolor</p>
    <div class="cover-rule"></div>
    <p class="cover-tag">Mi espacio de trabajo durante las 16 semanas del programa</p>
  </div>
  <footer class="cover-foot">
    <div class="cover-owner">
      <span class="cover-owner-label">Este cuaderno pertenece a</span>
      <span class="cover-owner-line"></span>
    </div>
    <div class="cover-org">Centro de Salud Entrevías · Dirección Asistencial Sureste (SERMAS)</div>
  </footer>
</section>`);

/* --- 2. PÁGINA DE TÍTULO / CRÉDITOS ----------------------------------- */
pages.push(`
<section class="page inner-title">
  <div class="it-top">
    ${paincorpMark(28, 'var(--teal)')}
    ${wordmark('dark')}
  </div>
  <div class="it-body">
    <h2>Cuaderno del participante</h2>
    <p class="it-program">Educación Terapéutica Bioconductual con orientación al dolor</p>
    <p class="it-lead">Este cuaderno es tu espacio personal de trabajo a lo largo de las 16 sesiones del programa. En él anotarás lo que descubres, tus ejercicios y tus planes. No hay respuestas correctas o incorrectas.</p>

    <div class="it-fields">
      <div class="it-field"><span>Nombre o código</span><i></i></div>
      <div class="it-field"><span>Edición / grupo</span><i></i></div>
      <div class="it-field"><span>Profesional de referencia</span><i></i></div>
    </div>

    <div class="it-conf">
      <strong>Confidencial.</strong> Lo que escribas en este cuaderno es privado. Tráelo a cada sesión y compártelo solo con el equipo del centro si así lo deseas.
    </div>
  </div>
  <div class="it-foot">
    <span>Programa EPS · Dolor crónico</span>
    <span>Centro de Salud Entrevías · SERMAS</span>
  </div>
</section>`);

/* --- 3. BIENVENIDA ---------------------------------------------------- */
pages.push(`
<section class="page std">
  ${interiorHeader('Bienvenida', 'Antes de empezar el programa')}
  <div class="content">
    <p class="lead">Este cuaderno te acompañará durante las <strong>16 semanas</strong> del programa. En él irás anotando lo que descubres, tus ejercicios y tus planes. No hay respuestas correctas o incorrectas: es tu espacio de trabajo personal.</p>

    <h3 class="sec">Antes de empezar</h3>
    <p>Antes de la primera sesión tendrás una cita de valoración con fisioterapia. Allí te explicaremos el programa, resolveremos tus dudas y firmarás el consentimiento. Te pediremos que traigas a la primera sesión —el <strong>PainCafé</strong>— una fotografía que represente qué significa el dolor para ti (puede ser un objeto, un lugar o una escena; no hay respuestas correctas). Entrégala al menos <strong>48 horas antes</strong> para poder prepararlo todo.</p>

    <h3 class="sec">Cómo usar este cuaderno</h3>
    <ul class="bullets">
      <li>Cada sesión tiene su página con un pequeño resumen y los ejercicios para casa.</li>
      <li>Tómate unos minutos cada día para las tareas; los avances pequeños y constantes son los que funcionan.</li>
      <li>Trae el cuaderno a cada sesión. Lo que escribas es confidencial.</li>
      <li>Si algo te genera mucho malestar, coméntalo con el equipo del centro.</li>
    </ul>
  </div>
  ${interiorFooter(3)}
</section>`);

/* --- 4. MIS DATOS + MIS OBJETIVOS ------------------------------------- */
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

    <div class="block" style="margin-top:6mm">
      <div class="block-label">Mis objetivos en el programa</div>
      <div class="block-note">¿Qué te gustaría conseguir o recuperar en estas 16 semanas?</div>
      <div class="write" style="--lines:6"></div>
    </div>
  </div>
  ${interiorFooter(4)}
</section>`);

/* --- 5. REGISTRO DE AUTOOBSERVACIÓN ----------------------------------- */
pages.push(`
<section class="page std">
  ${interiorHeader('Registro de autoobservación', 'Puedes usarlo cualquier día')}
  <div class="content">
    <p class="lead">Usa esta tabla cuando quieras observar cómo se relacionan las situaciones, tu cuerpo, tus pensamientos y lo que haces. No hay que rellenarla entera: anota lo que te sirva.</p>
    <table class="grid">
      <colgroup><col style="width:14%"><col style="width:22%"><col style="width:24%"><col style="width:22%"><col style="width:18%"></colgroup>
      <thead><tr><th>Día</th><th>Situación</th><th>Qué noté en el cuerpo</th><th>Qué pensé o sentí</th><th>Qué hice</th></tr></thead>
      <tbody>${'<tr><td></td><td></td><td></td><td></td><td></td></tr>'.repeat(9)}</tbody>
    </table>
  </div>
  ${interiorFooter(5)}
</section>`);

/* --- 6..N. SESIONES --------------------------------------------------- */
let pageNo = 5;
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

/* --- NOTAS ------------------------------------------------------------ */
pages.push(`
<section class="page std">
  ${interiorHeader('Notas', 'Un espacio para ti')}
  <div class="content">
    <p class="lead">Usa estas páginas para lo que necesites: ideas, dudas para la próxima sesión, avances que quieras recordar.</p>
    <div class="write big" style="--lines:16"></div>
  </div>
  ${interiorFooter(pages.length + 1)}
</section>`);

/* --- CONTRAPORTADA ---------------------------------------------------- */
pages.push(`
<section class="page backcover">
  <div class="cover-bg"></div>
  <svg class="cover-motif" viewBox="0 0 154 216" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    ${[0,1,2,3,4,5].map((i)=>`<circle cx="20" cy="26" r="${16+i*15}" fill="none" stroke="rgba(246,241,232,0.09)" stroke-width="1.1"/>`).join('')}
  </svg>
  <div class="bc-main">
    <blockquote class="bc-quote">“Los avances pequeños y constantes son los que funcionan.”</blockquote>
    <p class="bc-text">Gracias por el trabajo que has hecho en estas 16 semanas. Lo aprendido sigue contigo: vuelve a tus notas siempre que lo necesites y continúa a tu ritmo.</p>
  </div>
  <footer class="bc-foot">
    <div class="bc-brand">${paincorpMark(30, 'var(--cream)')} ${wordmark('light')}</div>
    <div class="bc-org">
      <div><strong>Centro de Salud Entrevías</strong></div>
      <div>Dirección Asistencial Sureste · SERMAS</div>
      <div>Programa EPS · Educación Terapéutica Bioconductual con orientación al dolor</div>
    </div>
    <div class="bc-conf">Documento personal y confidencial · Uso interno del programa</div>
  </footer>
</section>`);

/* ----------------------------------------------------------------------- *
 * Cabecera / pie de páginas interiores
 * ----------------------------------------------------------------------- */

function interiorHeader(title, kicker, chip, date) {
  const chipHtml = chip ? `<div class="hdr-chip">${chip}</div>` : `<div class="hdr-chip mini">${paincorpMark(18, 'var(--cream)')}</div>`;
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
    <span class="ftr-brand">Paincorp · Cuaderno del participante</span>
    <span class="ftr-no">${n}</span>
  </footer>`;
}

// Nota: las funciones se declaran (hoisting) por lo que su uso arriba es válido.

/* ----------------------------------------------------------------------- *
 * CSS
 * ----------------------------------------------------------------------- */

const css = `
:root{
  --teal:#0F5257;
  --teal-2:#14726F;
  --coral:#E1734B;
  --cream:#F6F1E8;
  --paper:#FFFFFF;
  --ink:#18272B;
  --muted:#5D6E71;
  --line:#CBD8D4;
  --chip:#E8EFEC;
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

/* ----- Área de contenido segura (borde doc 6mm = 3mm sangre + 3mm seguridad) ----- */
/* Usamos 11mm laterales para respiración; el margen mínimo de seguridad (6mm) queda holgado. */

/* ================= PORTADA ================= */
.cover,.backcover{color:var(--cream)}
.cover-bg{position:absolute;inset:0;background:linear-gradient(160deg,#0F5257 0%,#0C4247 55%,#0A383C 100%)}
.cover-motif{position:absolute;inset:0;width:100%;height:100%}
.cover-top{position:absolute;top:14mm;left:13mm;display:flex;align-items:center;gap:3mm}
.wordmark{font-size:15pt;font-weight:700;letter-spacing:.2pt}
.cover .wordmark{font-size:14pt}
.cover-main{position:absolute;left:13mm;right:13mm;top:74mm}
.cover-kicker{font-size:9.5pt;font-weight:700;letter-spacing:1.6pt;text-transform:uppercase;color:var(--coral);margin-bottom:6mm}
.cover-title{font-size:33pt;line-height:1.05;font-weight:700;margin:0;letter-spacing:-.3pt}
.cover-sub{font-size:12.5pt;line-height:1.35;margin:7mm 0 0;color:rgba(246,241,232,.9);max-width:118mm}
.cover-rule{width:26mm;height:2.4pt;background:var(--coral);border-radius:2pt;margin:9mm 0 0}
.cover-tag{font-size:10.5pt;margin:7mm 0 0;color:rgba(246,241,232,.78)}
.cover-foot{position:absolute;left:13mm;right:13mm;bottom:14mm}
.cover-owner{margin-bottom:7mm}
.cover-owner-label{display:block;font-size:8.5pt;letter-spacing:.6pt;text-transform:uppercase;color:rgba(246,241,232,.65);margin-bottom:4mm}
.cover-owner-line{display:block;height:.9pt;background:rgba(246,241,232,.45)}
.cover-org{font-size:8.5pt;line-height:1.4;color:rgba(246,241,232,.72);border-top:.7pt solid rgba(246,241,232,.25);padding-top:4mm}

/* ================= PÁGINA DE TÍTULO ================= */
.inner-title{padding:16mm 15mm 14mm}
.it-top{display:flex;align-items:center;gap:3mm;margin-bottom:16mm}
.inner-title .wordmark{font-size:13pt}
.it-body h2{font-size:22pt;font-weight:700;color:var(--teal);margin:0 0 2mm;letter-spacing:-.2pt}
.it-program{font-size:11pt;font-style:italic;color:var(--muted);margin:0 0 8mm}
.it-lead{font-size:10.5pt;line-height:1.5;margin:0 0 10mm}
.it-fields{display:flex;flex-direction:column;gap:6mm;margin-bottom:11mm}
.it-field span{display:block;font-size:8.5pt;letter-spacing:.5pt;text-transform:uppercase;color:var(--muted);margin-bottom:2.5mm}
.it-field i{display:block;height:.9pt;background:var(--line)}
.it-conf{font-size:9.5pt;line-height:1.45;background:var(--chip);border-left:3pt solid var(--coral);border-radius:2pt;padding:5mm 6mm}
.it-conf strong{color:var(--teal)}
.it-foot{position:absolute;left:15mm;right:15mm;bottom:12mm;display:flex;justify-content:space-between;font-size:8pt;color:var(--muted);border-top:.7pt solid var(--line);padding-top:3.5mm}

/* ================= PÁGINAS ESTÁNDAR ================= */
.std{padding:0 0 0 0;display:flex;flex-direction:column}
.hdr{background:linear-gradient(120deg,#0F5257,#14726F);color:var(--cream);padding:12mm 13mm 6mm;display:flex;gap:5mm;align-items:flex-start}
.hdr-chip{flex:0 0 auto;width:13mm;height:13mm;border-radius:3mm;background:var(--coral);color:#fff;font-size:14pt;font-weight:700;display:flex;align-items:center;justify-content:center;margin-top:1mm}
.hdr-chip.mini{background:rgba(246,241,232,.14)}
.hdr-txt{flex:1 1 auto;min-width:0}
.hdr-kicker{font-size:8.5pt;font-weight:700;letter-spacing:1.4pt;text-transform:uppercase;color:var(--coral)}
.cover .hdr-kicker,.hdr-kicker{color:#F3B49B}
.hdr-title{font-size:15.5pt;line-height:1.15;font-weight:700;margin:1.5mm 0 0}
.hdr-date{font-size:9pt;color:rgba(246,241,232,.82);margin-top:1.8mm;font-style:italic}

.content{flex:1 1 auto;padding:7mm 13mm 4mm;min-height:0}
.lead{font-size:10.5pt;line-height:1.5;margin:0 0 5mm}
p{margin:0 0 3mm}
.sec{font-size:11.5pt;color:var(--teal);font-weight:700;margin:6mm 0 2.5mm}
.content > p{font-size:10pt;line-height:1.5}
.bullets{margin:0 0 3mm;padding-left:5mm}
.bullets li{font-size:10pt;line-height:1.45;margin-bottom:2mm}

.hoy{display:flex;gap:4mm;background:var(--chip);border-radius:3pt;padding:4.5mm 5mm;margin-bottom:5mm}
.hoy-tag{flex:0 0 auto;font-size:8pt;font-weight:700;letter-spacing:1pt;text-transform:uppercase;color:#fff;background:var(--teal-2);border-radius:2pt;padding:1.6mm 3mm;height:fit-content}
.hoy p{font-size:9.8pt;line-height:1.45;margin:0;color:var(--ink)}

.block{margin-bottom:5mm}
.block-label{font-size:10.5pt;font-weight:700;color:var(--teal);margin-bottom:2.5mm}
.block-note{font-size:9pt;font-style:italic;color:var(--muted);margin-bottom:2.5mm;line-height:1.4}
.reflect{font-size:9.8pt;line-height:1.5;background:#FBF9F4;border:.8pt solid var(--line);border-radius:3pt;padding:4mm 5mm}

.write{
  border:.9pt solid var(--line);border-radius:3pt;background:var(--paper);
  background-image:repeating-linear-gradient(var(--paper) 0 7.5mm, var(--line) 7.5mm, var(--paper) calc(7.5mm + .5pt));
  height:calc(var(--lines) * 7.5mm);
}
.write.big{background-image:repeating-linear-gradient(var(--paper) 0 8.5mm, var(--line) 8.5mm, var(--paper) calc(8.5mm + .5pt));height:calc(var(--lines) * 8.5mm)}

.checklist{list-style:none;margin:0 0 3mm;padding:0}
.checklist li{position:relative;font-size:10pt;line-height:1.5;padding:2mm 0 2mm 8mm;border-bottom:.7pt solid var(--line)}
.checklist li:before{content:"";position:absolute;left:0;top:2.2mm;width:4.2mm;height:4.2mm;border:1pt solid var(--teal-2);border-radius:1.2pt}

table.grid{width:100%;border-collapse:collapse;table-layout:fixed}
table.grid th{background:var(--teal);color:var(--cream);font-size:8.6pt;font-weight:700;text-align:left;padding:2.6mm 2.4mm;line-height:1.2;border:.6pt solid var(--teal)}
table.grid td{border:.7pt solid var(--line);height:8.2mm;padding:1.5mm 2.4mm;font-size:9pt;vertical-align:top}
table.grid.datos th{width:44mm;background:var(--chip);color:var(--ink);border:.7pt solid var(--line);font-size:9.5pt}
table.grid.datos td{height:9.5mm}

.tarea{display:flex;gap:4mm;align-items:flex-start;margin-top:5mm;border:.9pt dashed var(--coral);border-radius:3pt;padding:4mm 5mm;background:#FDF4EF}
.tarea-tag{flex:0 0 auto;font-size:8pt;font-weight:700;letter-spacing:.8pt;text-transform:uppercase;color:#fff;background:var(--coral);border-radius:2pt;padding:1.6mm 3mm}
.tarea p{font-size:9.6pt;line-height:1.4;margin:0}

/* Modo compacto para páginas con mucho contenido */
.session.dense .content{padding-top:4mm}
.session.dense .hoy{padding:3.5mm 4mm;margin-bottom:4mm}
.session.dense .hoy p{font-size:9.2pt;line-height:1.34}
.session.dense .block{margin-bottom:3mm}
.session.dense .block-label{margin-bottom:2mm}
.session.dense .block-note{margin-bottom:1.8mm}
.session.dense .write{background-image:repeating-linear-gradient(var(--paper) 0 7mm, var(--line) 7mm, var(--paper) calc(7mm + .5pt));height:calc(var(--lines) * 7mm)}
.session.dense table.grid td{height:7mm}
.session.dense .reflect{padding:3mm 4mm;font-size:9pt;line-height:1.4}
.session.dense .tarea{margin-top:3.5mm;padding:3.2mm 4mm}

.ftr{margin-top:auto;padding:3.5mm 13mm 10mm;display:flex;justify-content:space-between;align-items:center;font-size:8pt;color:var(--muted)}
.ftr-brand{letter-spacing:.3pt}
.ftr-no{font-weight:700;color:var(--teal);font-size:9pt}

/* ================= CONTRAPORTADA ================= */
.backcover{color:var(--cream)}
.bc-main{position:absolute;left:14mm;right:14mm;top:52mm}
.bc-quote{font-size:16pt;line-height:1.35;font-weight:700;margin:0 0 8mm;color:var(--cream)}
.bc-text{font-size:10.5pt;line-height:1.55;color:rgba(246,241,232,.85);margin:0}
.bc-foot{position:absolute;left:14mm;right:14mm;bottom:14mm}
.bc-brand{display:flex;align-items:center;gap:3mm;margin-bottom:6mm}
.backcover .wordmark{font-size:13pt}
.bc-org{font-size:9pt;line-height:1.55;color:rgba(246,241,232,.82);border-top:.7pt solid rgba(246,241,232,.25);padding-top:5mm}
.bc-org strong{color:var(--cream)}
.bc-conf{font-size:8pt;color:rgba(246,241,232,.6);margin-top:5mm;letter-spacing:.3pt}
`;

/* ----------------------------------------------------------------------- *
 * Documento final
 * ----------------------------------------------------------------------- */

const html = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<title>Cuaderno del participante · Paincorp (A5)</title>
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
