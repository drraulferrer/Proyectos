import { Link } from 'react-router'
import Reveal from '@/components/Reveal'
import { ArrowIcon } from '@/components/icons'
import { PageHero, CTASection } from '@/components/blocks'
import { COLABORACIONES } from '@/data/content'

export default function Colaboraciones() {
  return (
    <>
      <PageHero
        crumb="Colaboraciones"
        kick="Colaboraciones"
        title={<>Formas de<br /><span className="font-serifit italic font-normal text-naranja">trabajar</span> juntos</>}
        lead="Convertir la experiencia en oportunidades seleccionadas. Estas son las modalidades en las que puedo aportar valor."
      />

      <section className="wrap-wide py-14 md:py-20">
        <div className="grid gap-4 md:grid-cols-2">
          {COLABORACIONES.map((c, i) => (
            <Reveal key={c.title} delay={(i % 2) * 80}>
              <article className="card-ed h-full">
                <span className="display text-5xl num-outline">{String(i + 1).padStart(2, '0')}</span>
                <h2 className="mt-5 font-display text-2xl font-extrabold tracking-tight">{c.title}</h2>
                <p className="mt-3 text-mut leading-relaxed">{c.text}</p>
              </article>
            </Reveal>
          ))}
        </div>

        {/* Método */}
        <Reveal>
          <div className="mt-14 rounded-3xl bg-naranja p-8 text-white md:p-12">
            <p className="font-display text-xs font-bold uppercase tracking-[0.28em] text-white/70">Método de trabajo</p>
            <p className="display mt-5 max-w-4xl text-[clamp(1.6rem,3.5vw,2.6rem)]">
              Escucho el reto, propongo un enfoque claro y trabajo de forma rigurosa y colaborativa,
              con objetivos y resultados definidos.
            </p>
            <Link to="/contacto" className="btn-light mt-8">Proponer una colaboración <ArrowIcon /></Link>
          </div>
        </Reveal>
      </section>

      <CTASection />
    </>
  )
}
