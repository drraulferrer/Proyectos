import { Link } from 'react-router'
import Reveal from '@/components/Reveal'
import { ArrowUpRight } from '@/components/icons'
import { PageHero, CTASection } from '@/components/blocks'
import { AREAS } from '@/data/content'

export default function Areas() {
  return (
    <>
      <PageHero
        crumb="Áreas"
        kick="Áreas de conocimiento"
        title={<>Seis direcciones,<br />una misma <span className="font-serifit italic font-normal text-naranja">mirada</span></>}
        lead="Los vectores del perfil. Cada uno se explica por lo que aporta —experiencia, evidencia y beneficios—, no solo por cargos."
      />

      <section className="wrap-wide py-14 md:py-20">
        <div className="grid gap-4 md:grid-cols-2">
          {AREAS.map((a, i) => (
            <Reveal key={a.slug} delay={(i % 2) * 80}>
              <Link to={`/areas/${a.slug}`} className="card-ed group flex h-full flex-col">
                <div className="flex items-start justify-between">
                  <span className="display text-5xl num-outline group-hover:text-naranja group-hover:[-webkit-text-stroke:0] transition-all">{a.num}</span>
                  <ArrowUpRight className="h-6 w-6 text-naranja transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                </div>
                <h2 className="mt-6 font-display text-2xl font-extrabold leading-tight tracking-tight">{a.title}</h2>
                <p className="mt-3 text-mut leading-relaxed flex-1">{a.lead}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {a.chips.slice(0, 4).map((c) => (
                    <span key={c} className="chip">{c}</span>
                  ))}
                  {a.chips.length > 4 && <span className="chip !border-naranja/40 !text-naranja-deep">+{a.chips.length - 4}</span>}
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <CTASection />
    </>
  )
}
