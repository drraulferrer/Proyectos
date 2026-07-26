import { Link } from 'react-router'
import Reveal from '@/components/Reveal'
import { ArrowIcon } from '@/components/icons'
import { PageHero, CTASection } from '@/components/blocks'

const HIGHLIGHTS = [
  { title: 'Cruz de Honor de Plata', text: 'De la Sanidad Madrileña (2019), por el compromiso con la atención sanitaria, la formación y la investigación.' },
  { title: 'Autor y coordinador', text: 'De libros de referencia sobre dolor crónico, gestión para fisioterapeutas y salud digital (Modelo GAP, Manuales SED).' },
  { title: 'Gobernanza profesional', text: '8 años en la Junta de Gobierno del Colegio de Fisioterapeutas de Madrid y Consejero Electo del Consejo General.' },
  { title: 'Calidad y acreditación', text: 'Comisión de Garantía de Calidad de la URJC desde 2023; auditor interno AUDIT (ANECA) y evaluación DOCENTIA.' },
]

export default function SobreMi() {
  return (
    <>
      <PageHero
        crumb="Sobre mí"
        kick="La persona detrás del perfil"
        title={<>Diverso por fuera,<br /><span className="font-serifit italic font-normal text-naranja">profundo</span> por dentro</>}
      />

      <section className="wrap-wide py-16 md:py-20">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.35fr]">
          {/* Foto + chips */}
          <Reveal>
            <div className="relative">
              <div className="absolute -left-4 -top-4 h-full w-full rounded-3xl border-2 border-naranja" aria-hidden="true" />
              <img src="/assets/foto-raul.jpg" alt="Dr. Raúl Ferrer Peña" className="relative aspect-[4/5] w-full rounded-3xl object-cover object-top" />
            </div>
            <div className="mt-8 flex flex-wrap gap-2">
              {['Doctor (PhD)', 'MBA', 'Profesor Titular', 'Fundador & CEO'].map((c) => (
                <span key={c} className="chip">{c}</span>
              ))}
            </div>
          </Reveal>

          {/* Bio */}
          <Reveal delay={120}>
            <div className="space-y-5 text-lg leading-relaxed text-ink/80">
              <p>
                Soy fisioterapeuta y Doctor en Investigación del Dolor. En más de
                <strong className="text-ink"> 20 años</strong> desde que me titulé, he desarrollado mi trabajo
                en casi todos los ámbitos de la profesión, con la fisioterapia siempre como núcleo.
              </p>
              <p>
                Empecé como fisioterapeuta asistencial en <strong className="text-ink">Atención Primaria</strong>,
                en las zonas de Entrevías y El Pozo (Madrid), donde durante más de quince años atendí a miles de
                personas. Esa experiencia es la raíz de mi interés por el <strong className="text-ink">dolor</strong>,
                el <strong className="text-ink">razonamiento clínico</strong>, la <strong className="text-ink">prevención</strong> y
                la <strong className="text-ink"> salud comunitaria</strong>.
              </p>
              <p>
                Con el tiempo, ese trabajo se amplió hacia la <strong className="text-ink">docencia universitaria</strong>,
                la <strong className="text-ink">investigación</strong> y la <strong className="text-ink">innovación educativa</strong>,
                sin dejar de mirar la fisioterapia como una disciplina integrada en el sistema sanitario.
              </p>
              <p>
                Tras ocho años de responsabilidad institucional en organizaciones profesionales, inicio ahora una
                <strong className="text-ink"> nueva etapa</strong> centrada en la docencia, el razonamiento clínico,
                la prevención y la salud comunitaria, manteniendo la participación en el Grupo de Trabajo de
                Salud Comunitaria del Ministerio de Sanidad.
              </p>
            </div>
            <img src="/assets/firma.png" alt="Firma de Raúl Ferrer" className="mt-10 w-72 max-w-full" />
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/trayectoria" className="btn-ink">Ver trayectoria <ArrowIcon /></Link>
              <Link to="/credenciales" className="btn-ghost">Reconocimientos y credenciales</Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Highlights */}
      <section className="border-t border-line bg-cream/50 py-16 md:py-24">
        <div className="wrap-wide">
          <Reveal><p className="kick">Lo que respalda el discurso</p></Reveal>
          <Reveal delay={80}>
            <h2 className="display mt-4 text-[clamp(2rem,4.5vw,3.4rem)]">Cuatro pilares de autoridad</h2>
          </Reveal>
          <div className="mt-12 grid gap-4 md:grid-cols-2">
            {HIGHLIGHTS.map((h, i) => (
              <Reveal key={h.title} delay={(i % 2) * 80}>
                <div className="card-ed h-full">
                  <span className="font-display text-2xl font-black text-naranja">→</span>
                  <h3 className="mt-3 font-display text-xl font-extrabold tracking-tight">{h.title}</h3>
                  <p className="mt-2 text-sm text-mut leading-relaxed">{h.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <CTASection />
    </>
  )
}
