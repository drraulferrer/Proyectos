import { Link } from 'react-router'
import Reveal from '@/components/Reveal'
import { ArrowIcon } from '@/components/icons'
import { PageHero, CTASection } from '@/components/blocks'

const NIVELES = [
  { num: '01', b: 'Persona', s: 'Experiencia clínica y relación con el paciente. La fisioterapia empieza escuchando a quien tienes delante.' },
  { num: '02', b: 'Razonamiento', s: 'Toma de decisiones basada en la evidencia y en el pensamiento crítico clínico.' },
  { num: '03', b: 'Prevención', s: 'Salud pública y comunidad: la fisioterapia también cuida antes de que haya lesión.' },
  { num: '04', b: 'Docencia', s: 'Formación de profesionales que razonan, no que repiten protocolos.' },
  { num: '05', b: 'Innovación', s: 'Tecnología aplicada a la salud y a la educación: IA, simulación, salud digital.' },
  { num: '06', b: 'Sistema', s: 'Organizaciones y sistema sanitario: gestión, representación y política profesional.' },
]

export default function Vision360() {
  return (
    <>
      <PageHero
        crumb="Visión 360º"
        kick="La idea"
        title={<>Un núcleo,<br /><span className="font-serifit italic font-normal text-naranja">múltiples</span> direcciones</>}
        lead="Mi perfil es amplio, pero no disperso. La fisioterapia es el núcleo desde el que se conectan el razonamiento clínico, el dolor, la prevención, la salud pública y comunitaria, la docencia y la innovación educativa."
      />

      {/* Manifiesto */}
      <section className="wrap py-16 md:py-20">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr]">
          <Reveal>
            <img src="/assets/logo-rf.png" alt="Logotipo RF con flechas en todas las direcciones" className="w-full max-w-md" />
          </Reveal>
          <Reveal delay={120}>
            <div className="space-y-5 text-lg leading-relaxed text-ink/80">
              <p>
                El logotipo lo dice sin palabras: un monograma <strong className="text-ink">RF</strong> del que
                salen <span className="text-naranja font-semibold">flechas en todas las direcciones</span>.
                Es la metáfora de una forma de entender la profesión — movimiento, dinamismo y versatilidad —
                sin necesidad de eslogan.
              </p>
              <p>
                La amplitud no significa <em className="font-serifit text-xl">hacer de todo</em>, sino comprender
                la fisioterapia en varios niveles relacionados y aportar valor en cada uno de ellos con rigor y sentido.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Los seis niveles */}
      <section className="border-y border-line bg-cream/50 py-16 md:py-24">
        <div className="wrap-wide">
          <Reveal><p className="kick">El mapa</p></Reveal>
          <Reveal delay={80}>
            <h2 className="display mt-4 text-[clamp(2rem,4.5vw,3.4rem)]">Seis niveles de una misma disciplina</h2>
          </Reveal>
          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {NIVELES.map((n, i) => (
              <Reveal key={n.num} delay={(i % 3) * 80}>
                <div className="card-ed h-full">
                  <span className="display text-5xl num-outline">{n.num}</span>
                  <h3 className="mt-5 font-display text-2xl font-extrabold tracking-tight">{n.b}</h3>
                  <p className="mt-3 text-sm text-mut leading-relaxed">{n.s}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Hacia dónde */}
      <section className="wrap py-16 md:py-24">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <Reveal>
            <h2 className="display text-[clamp(2rem,4.5vw,3.2rem)]">
              Hoy, el foco está en la <span className="font-serifit italic font-normal text-naranja">docencia</span>,
              el razonamiento y la comunidad
            </h2>
          </Reveal>
          <Reveal delay={120}>
            <p className="text-lg leading-relaxed text-ink/80">
              Doctor en Investigación del Dolor, profesor titular de grado en La Salle y con más de 15 años
              de experiencia asistencial en Atención Primaria, oriento mi trabajo hacia la docencia,
              el razonamiento clínico, la prevención y la salud comunitaria.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/sobre-mi" className="btn-ink">Sobre mí <ArrowIcon /></Link>
              <Link to="/areas" className="btn-ghost">Conocer las áreas</Link>
            </div>
          </Reveal>
        </div>
      </section>

      <CTASection />
    </>
  )
}
