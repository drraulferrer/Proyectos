import Reveal from '@/components/Reveal'
import { ArrowUpRight } from '@/components/icons'
import { PageHero, CTASection } from '@/components/blocks'
import { ORCID, PUBMED } from '@/data/content'

const BLOQUES = [
  {
    kick: 'Formación académica',
    items: [
      { b: 'Doctor en Investigación del Dolor', s: 'URJC · cum laude (2020)' },
      { b: 'MBA', s: 'Dirección y gestión de proyectos' },
      { b: 'Máster en Fisioterapia Manual', s: 'Universidad de Alcalá (2015)' },
      { b: 'Diplomado en Fisioterapia', s: 'Inicio profesional (2006)' },
    ],
  },
  {
    kick: 'Actividad docente',
    items: [
      { b: 'Profesor Titular · La Salle (UAM)', s: 'Salud Pública, Fisioterapia Preventiva y Métodos Específicos' },
      { b: 'Docencia de posgrado', s: 'Educación Terapéutica y Salud Digital' },
      { b: 'Coordinación de asignatura', s: 'Gestión de Proyectos de Salud Digital' },
      { b: 'Dos sexenios de investigación', s: 'Reconocidos por la CNEAI' },
    ],
  },
  {
    kick: 'Reconocimientos',
    items: [
      { b: 'Cruz de Honor de Plata', s: 'Comunidad de Madrid (2019)' },
      { b: 'Presidente fundador', s: 'Fisioterapia Sin Red (#FSR)' },
      { b: 'Comisión de Garantía de Calidad', s: 'URJC (2023) · Auditor interno AUDIT (ANECA)' },
    ],
  },
  {
    kick: 'Experiencia institucional',
    items: [
      { b: 'CFISIOMAD', s: 'Junta de Gobierno (Vocal, Vicesecretario) · 8 años' },
      { b: 'Consejo General de Fisioterapeutas', s: 'Consejero Electo' },
      { b: 'Ministerio de Sanidad', s: 'Grupo de Trabajo de Salud Comunitaria (vigente)' },
    ],
  },
]

const PERFILES = [
  { label: 'ORCID', desc: 'Perfil de investigación', href: ORCID },
  { label: 'PubMed', desc: 'Publicaciones indexadas', href: PUBMED },
  { label: 'ResearchGate', desc: 'Producción científica', href: '#' },
  { label: 'LinkedIn', desc: 'Perfil profesional', href: '#' },
]

export default function Credenciales() {
  return (
    <>
      <PageHero
        crumb="Credenciales"
        kick="Credenciales"
        title={<>Reconocimientos<br />y <span className="font-serifit italic font-normal text-naranja">credenciales</span></>}
        lead="Formación, docencia, reconocimientos y experiencia institucional que respaldan el perfil."
      />

      <section className="wrap-wide py-14 md:py-20">
        <div className="grid gap-10 md:grid-cols-2">
          {BLOQUES.map((b, i) => (
            <Reveal key={b.kick} delay={(i % 2) * 80}>
              <div>
                <p className="kick">{b.kick}</p>
                <ul className="mt-5 divide-y divide-line border-y border-line">
                  {b.items.map((it) => (
                    <li key={it.b} className="flex items-baseline justify-between gap-6 py-4">
                      <div>
                        <p className="font-display font-extrabold tracking-tight">{it.b}</p>
                        <p className="mt-0.5 text-sm text-mut">{it.s}</p>
                      </div>
                      <span className="shrink-0 font-display font-black text-naranja">→</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Perfiles académicos */}
      <section className="border-t border-line bg-ink py-16 text-white stripes md:py-20">
        <div className="wrap-wide">
          <Reveal><p className="kick">Huella académica</p></Reveal>
          <Reveal delay={80}>
            <h2 className="display mt-4 text-[clamp(2rem,4.5vw,3.2rem)]">Perfiles verificables</h2>
          </Reveal>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {PERFILES.map((p, i) => (
              <Reveal key={p.label} delay={i * 60}>
                <a
                  href={p.href}
                  target="_blank"
                  rel="noopener"
                  className="group flex h-full flex-col rounded-2xl border border-white/15 bg-white/5 p-6 transition-colors hover:border-naranja"
                >
                  <ArrowUpRight className="h-5 w-5 text-naranja transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                  <p className="mt-6 font-display text-xl font-extrabold tracking-tight">{p.label}</p>
                  <p className="mt-1 text-sm text-white/55">{p.desc}</p>
                </a>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <CTASection />
    </>
  )
}
