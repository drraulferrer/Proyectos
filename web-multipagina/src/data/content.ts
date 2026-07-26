export const EMAIL = 'drraulferrer@gmail.com'
export const ORCID = 'https://orcid.org/0000-0001-5495-8458'
export const PUBMED =
  'https://pubmed.ncbi.nlm.nih.gov/?term=Ferrer-Pe%C3%B1a+R%5BAuthor%5D&sort=date'

export const STATS = [
  { big: '+20 años', small: 'de trayectoria; +15 en Atención Primaria' },
  { big: '+10.000', small: 'pacientes atendidos en consulta' },
  { big: 'Cum laude', small: 'Doctor en Investigación del Dolor (URJC)' },
  { big: 'MBA', small: 'dirección y gestión de proyectos' },
]

export interface Area {
  slug: string
  num: string
  title: string
  short: string
  lead: string
  chips: string[]
  puntos: string[]
}

export const AREAS: Area[] = [
  {
    slug: 'razonamiento-clinico-dolor',
    num: '01',
    title: 'Razonamiento clínico, dolor y educación bioconductual',
    short: 'Cómo pensamos, decidimos y abordamos el dolor.',
    lead: 'El razonamiento clínico como eje de la práctica: cómo pensamos, decidimos y abordamos el dolor, integrando la educación terapéutica y bioconductual.',
    chips: ['Razonamiento clínico', 'Dolor', 'Educación bioconductual', 'Educación terapéutica', 'Sistema neuromusculoesquelético', 'Síndrome de dolor miofascial', 'Práctica basada en evidencia'],
    puntos: [
      'Razonamiento clínico como competencia central de la práctica fisioterapéutica.',
      'Abordaje del dolor crónico desde la educación en neurociencia del dolor.',
      'Educación terapéutica y bioconductual aplicada a la consulta y a la docencia.',
      'Investigación activa: consensos Delphi internacionales y ensayos clínicos.',
    ],
  },
  {
    slug: 'salud-publica-prevencion',
    num: '02',
    title: 'Salud pública, prevención y salud comunitaria',
    short: 'La fisioterapia en la salud de las poblaciones.',
    lead: 'El papel de la fisioterapia en la salud de las poblaciones: promoción, prevención, educación para la salud y comunidad.',
    chips: ['Salud pública', 'Promoción de la salud', 'Prevención', 'Educación sanitaria', 'Determinantes de salud', 'Salud comunitaria', 'Perspectiva poblacional'],
    puntos: [
      'Docencia de grado en Salud Pública y Fisioterapia Preventiva.',
      'Delegado en el Grupo de Trabajo de Salud Comunitaria del Ministerio de Sanidad.',
      'Participación en grupos de trabajo de la Gerencia Asistencial de Atención Primaria de la Comunidad de Madrid.',
      'Visión de la fisioterapia integrada en el sistema sanitario.',
    ],
  },
  {
    slug: 'atencion-primaria',
    num: '03',
    title: 'Atención Primaria',
    short: '+15 años de práctica asistencial en el sistema público.',
    lead: 'Más de 15 años de práctica asistencial y una mirada de la fisioterapia integrada en el sistema sanitario. Más de 10.000 pacientes atendidos.',
    chips: ['Atención Primaria', '+10.000 pacientes', 'Integración en el sistema', 'Trabajo interdisciplinar', 'Grupo de Salud Comunitaria (Ministerio)'],
    puntos: [
      'Práctica clínica en los centros de Entrevías y El Pozo (Madrid) desde 2006.',
      'Más de 10.000 pacientes atendidos de una población asignada de 35.000 personas.',
      'Desarrollo de la fisioterapia en Atención Primaria a nivel local y nacional.',
      'Autor del libro «Cerrar la brecha» (Modelo GAP) sobre reorganización de la Atención Primaria.',
    ],
  },
  {
    slug: 'docencia-innovacion',
    num: '04',
    title: 'Docencia e innovación educativa',
    short: 'Formar el razonamiento profesional.',
    lead: 'Formar el razonamiento profesional: metodologías, diseño de aprendizaje, mentoría y tecnología educativa aplicada a la fisioterapia.',
    chips: ['Profesor Titular (La Salle)', 'Filosofía docente', 'Metodologías docentes', 'Diseño de aprendizaje', 'Tecnología educativa', 'IA en educación', 'Mentoría'],
    puntos: [
      'Profesor Titular en el Grado en Fisioterapia de CSEU La Salle (UAM) desde 2013.',
      'Docencia de posgrado en el Máster de Salud Digital y fisioterapia bioconductual.',
      'Innovación docente con IA, simulación clínica y metodologías activas (grupo INDOCLIN).',
      'Miembro de la Comisión de Garantía de Calidad de la URJC; auditor interno AUDIT (ANECA).',
    ],
  },
  {
    slug: 'salud-digital',
    num: '05',
    title: 'Salud digital',
    short: 'Tecnología aplicada a la práctica y a la educación.',
    lead: 'Salud digital aplicada a la práctica y a la educación: docencia en salud digital y coordinación de la asignatura de Gestión de Proyectos de Salud Digital.',
    chips: ['Docencia en salud digital', 'Gestión de proyectos de salud digital', 'Innovación', 'Mentoría (#Sherpas20)', 'Emprendimiento (Smart Dyspnea)', 'Transformación digital'],
    puntos: [
      'Coordinación de la asignatura de Gestión de Proyectos de Salud Digital.',
      'Fundador de Smart Dyspnea, startup de IA en salud premiada en hackatones COVID.',
      'Sherpa de Fisioterapia en #Sherpas20 desde 2014: mentoría para reducir la brecha digital.',
      'Coautor de «Salud digital. Guía para profesionales» (Editorial SED, grupo SEDTECH).',
    ],
  },
  {
    slug: 'gestion-direccion',
    num: '06',
    title: 'Gestión y dirección',
    short: 'Dirección con visión estratégica, respaldada por un MBA.',
    lead: 'Dirección y gestión de proyectos con visión estratégica, respaldada por un MBA y años de representación y responsabilidad institucional.',
    chips: ['MBA', 'Dirección de proyectos', 'Gestión sanitaria', 'Estrategia', 'Representación profesional', 'Liderazgo de equipos'],
    puntos: [
      'MBA en dirección y gestión de proyectos.',
      'Ocho años en la Junta de Gobierno del Colegio de Fisioterapeutas de Madrid (Vocal, Vicesecretario).',
      'Consejero Electo del Consejo General de Colegios de Fisioterapeutas.',
      'Coautor del Marco de Competencias en Gestión para fisioterapeutas.',
    ],
  },
]

export const TIMELINE = [
  { year: '2006', title: 'Fisioterapeuta en Atención Primaria', text: 'Diplomado en Fisioterapia. Inicio de la práctica clínica en los centros de Entrevías y El Pozo (Madrid), donde atendería a más de 10.000 pacientes.' },
  { year: '2012', title: 'Funda Fisioterapia Sin Red (#FSR)', text: 'De la I Jornada Clínica a la segunda asociación de fisioterapia con más socios de España. Presidente desde su inicio.' },
  { year: '2013', title: 'Profesor Titular · CSEU La Salle (UAM)', text: 'Docencia de grado en Salud Pública, Fisioterapia Preventiva y Métodos Específicos. Desde 2015, también docencia de posgrado.' },
  { year: '2014', title: 'Coordinador de los Sherpas de Fisioterapia', text: 'Iniciativa #Sherpas20: salud digital y mentoría para reducir la brecha digital en salud.' },
  { year: '2015', title: 'Máster Universitario en Fisioterapia Manual', text: 'Universidad de Alcalá.' },
  { year: '2018', title: 'Representación profesional', text: 'Junta de Gobierno de CFISIOMAD y Consejero Electo del Consejo General de Colegios de Fisioterapeutas.' },
  { year: '2019', title: 'Cruz de Honor de Plata de la Comunidad de Madrid', text: 'Reconocimiento por el compromiso con la atención sanitaria, la formación y la investigación. Delegado en el Ministerio de Sanidad.' },
  { year: '2020', title: 'Doctor en Investigación del Dolor · cum laude', text: 'Máxima graduación académica por la URJC. Funda Smart Dyspnea (IA en salud), premiada en hackatones COVID.' },
  { year: '2023', title: 'Dirección y calidad', text: 'Director del grupo INDOCLIN y miembro de la Comisión de Garantía de Calidad de la URJC.' },
  { year: 'Hoy', title: 'Nueva etapa: docencia, razonamiento y gestión', text: 'Foco en la docencia, el razonamiento clínico, la prevención y la salud comunitaria, con el MBA y la gestión de proyectos de salud digital.' },
]

export interface Proyecto {
  year: string
  title: string
  role: string
  text: string
  vigente?: boolean
  destacado?: boolean
}

export const PROYECTOS: Proyecto[] = [
  { year: '2020 — hoy', title: 'Smart Dyspnea', role: 'Fundador & CEO', text: 'Startup de IA en salud que estima la desaturación de oxígeno a partir de la voz, desde el propio móvil. Premios «The Good Algorithms» y Hackathon «Vence al Virus».', vigente: true, destacado: true },
  { year: '2023 — hoy', title: 'INDOCLIN', role: 'Director del grupo', text: 'Grupo clínico-docente en ciencias de la rehabilitación: IA en el razonamiento clínico, analítica del aprendizaje (CuSAERS) y simulación.', vigente: true },
  { year: '2014 — hoy', title: '#Sherpas20', role: 'Sherpa de Fisioterapia', text: 'Grupo multidisciplinar de referentes en salud digital. Lidero el grupo de fisioterapia, mentorizando a profesionales y pacientes para reducir la brecha digital.', vigente: true },
  { year: '2012 — 2018', title: 'Fisioterapia Sin Red', role: 'Socio fundador y presidente', text: 'La asociación por la inteligencia colectiva que llegó a ser la segunda con más socios de España y un revulsivo para la profesión.' },
  { year: '2012', title: 'Mírame, Diferénciate', role: 'Impulsor', text: 'El movimiento que humanizó la asistencia sanitaria en la red junto a un grupo de profesionales sanitarios.' },
  { year: '2010 — hoy', title: 'Docencia de grado · La Salle (UAM)', role: 'Profesor Titular', text: 'Salud pública, fisioterapia preventiva y métodos específicos en el sistema neuromusculoesquelético.', vigente: true },
]

export const ARTICULOS = [
  { q: 'Q1', journal: 'Physical Therapy · 2026', title: 'Toward a shared framework for therapeutic pain education: a Delphi-based international consensus' },
  { q: 'Q1', journal: 'JMIR Formative Research · 2025', title: 'Feasibility of a Randomized Controlled Trial of Large AI-Based Linguistic Models for Clinical Reasoning Training of Physical Therapy Students' },
  { q: 'Q1', journal: 'JMIR Medical Education · 2025', title: 'Student satisfaction in social media-based learning environments: the CuSAERS questionnaire' },
  { q: 'Q2', journal: 'Brain Sciences · 2026', title: 'Advancing neurological rehabilitation: the BRAIN framework for clinical reasoning in neurophysiotherapy' },
  { q: 'Q2', journal: 'Neurology International · 2026', title: 'Effectiveness of physiotherapy interventions on executive function in patients with chronic pain' },
  { q: 'Q2', journal: 'Healthcare (Basel) · 2025', title: 'Pain Neuroscience Education Reduces Pain and Improves Psychological Variables but Does Not Induce Plastic Changes Measured by BDNF' },
]

export const LIBROS = [
  { year: '2026', title: 'Cerrar la brecha (Modelo GAP)', text: 'Estrategias para reorganizar la Atención Primaria alrededor de la persona.' },
  { year: '2026', title: 'Marco de competencias en gestión para fisioterapeutas', text: 'Coautor · referente en gestión profesional.' },
  { year: '2026', title: 'Salud digital. Guía para profesionales', text: 'Editorial SED (grupo SEDTECH) · Coautor.' },
  { year: '2023–2025', title: 'Manuales de dolor crónico y autocuidado', text: 'Coordinador y coautor · en español e inglés.' },
]

export const COLABORACIONES = [
  { title: 'Consultoría', text: 'Fisioterapia y Atención Primaria, salud pública y comunitaria, prevención, diseño de programas formativos, innovación educativa y estrategia digital.' },
  { title: 'Mentoría', text: 'Acompañamiento a fisioterapeutas, docentes e investigadores en etapas iniciales y a profesionales con perfiles multidisciplinares.' },
  { title: 'Formación y conferencias', text: 'Ponencias, talleres y programas —presenciales u online— sobre razonamiento clínico, dolor, prevención y docencia.' },
  { title: 'Proyectos y alianzas', text: 'Investigación aplicada, innovación educativa, salud digital, divulgación y alianzas institucionales seleccionadas.' },
]

export const MARQUEE_ITEMS = [
  'Fisioterapia', 'Razonamiento clínico', 'Dolor', 'Educación bioconductual',
  'Salud pública', 'Prevención', 'Salud comunitaria', 'Atención Primaria',
  'Docencia', 'Innovación educativa', 'Salud digital', 'Gestión',
]
