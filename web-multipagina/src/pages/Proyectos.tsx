import Reveal from '@/components/Reveal'
import { PageHero, CTASection } from '@/components/blocks'
import { PROYECTOS } from '@/data/content'

export default function Proyectos() {
  const vigentes = PROYECTOS.filter((p) => p.vigente)
  const historicos = PROYECTOS.filter((p) => !p.vigente)

  return (
    <>
      <PageHero
        crumb="Proyectos"
        kick="Proyectos e impacto"
        title={<>Proyectos que<br /><span className="font-serifit italic font-normal text-naranja">abren</span> caminos</>}
        lead="Capacidad demostrada mediante proyectos explicados por contexto, aportación y resultados. Los proyectos vigentes se distinguen claramente de los históricos."
      />

      {/* Vigentes */}
      <section className="wrap-wide py-14 md:py-20">
        <Reveal>
          <p className="kick">Ahora mismo</p>
          <h2 className="display mt-4 text-[clamp(1.8rem,4vw,2.8rem)]">Proyectos vigentes</h2>
        </Reveal>
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {vigentes.map((p, i) => (
            <Reveal key={p.title} delay={(i % 2) * 80}>
              <article className={`flex h-full flex-col rounded-2xl border p-7 transition-all duration-300 hover:-translate-y-1 ${p.destacado ? 'border-ink bg-ink text-white' : 'border-line bg-white card-ed'}`}>
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className={p.destacado ? 'text-white/50' : 'text-mut'}>{p.year}</span>
                  <span className={`rounded-full px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wider ${p.destacado ? 'bg-naranja text-white' : 'bg-naranja-soft text-naranja-deep'}`}>
                    Vigente
                  </span>
                </div>
                <h3 className="mt-5 font-display text-2xl font-extrabold tracking-tight">{p.title}</h3>
                <p className="mt-1 font-display text-[0.7rem] font-bold uppercase tracking-[0.18em] text-naranja">{p.role}</p>
                <p className={`mt-4 text-sm leading-relaxed flex-1 ${p.destacado ? 'text-white/70' : 'text-mut'}`}>{p.text}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Históricos */}
      <section className="border-t border-line bg-cream/50 py-14 md:py-20">
        <div className="wrap-wide">
          <Reveal>
            <p className="kick">Casos destacados</p>
            <h2 className="display mt-4 text-[clamp(1.8rem,4vw,2.8rem)]">Trayectoria de proyectos</h2>
          </Reveal>
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {historicos.map((p, i) => (
              <Reveal key={p.title} delay={(i % 2) * 80}>
                <article className="card-ed flex h-full flex-col">
                  <span className="text-xs font-semibold text-mut">{p.year}</span>
                  <h3 className="mt-3 font-display text-2xl font-extrabold tracking-tight">{p.title}</h3>
                  <p className="mt-1 font-display text-[0.7rem] font-bold uppercase tracking-[0.18em] text-naranja">{p.role}</p>
                  <p className="mt-4 text-sm leading-relaxed text-mut flex-1">{p.text}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <CTASection title="¿Tienes un proyecto en mente?" text="Investigación aplicada, innovación educativa, salud digital o alianzas institucionales. Cuéntame el reto y buscamos el enfoque." />
    </>
  )
}
