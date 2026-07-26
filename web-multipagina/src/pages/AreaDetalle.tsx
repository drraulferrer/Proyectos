import { Link, Navigate, useParams } from 'react-router'
import Reveal from '@/components/Reveal'
import { ArrowIcon, ArrowUpRight } from '@/components/icons'
import { PageHero, CTASection } from '@/components/blocks'
import { AREAS, PUBMED } from '@/data/content'

export default function AreaDetalle() {
  const { slug } = useParams()
  const idx = AREAS.findIndex((a) => a.slug === slug)
  if (idx === -1) return <Navigate to="/areas" replace />

  const area = AREAS[idx]
  const prev = AREAS[(idx - 1 + AREAS.length) % AREAS.length]
  const next = AREAS[(idx + 1) % AREAS.length]

  return (
    <>
      <PageHero
        crumb="Áreas"
        kick={`Área ${area.num}`}
        title={area.title}
        lead={area.lead}
      />

      <section className="wrap py-14 md:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr]">
          <Reveal>
            <h2 className="font-display text-2xl font-extrabold tracking-tight">Qué aporta esta área</h2>
            <ul className="mt-6 space-y-4">
              {area.puntos.map((p) => (
                <li key={p} className="flex gap-4 text-ink/80 leading-relaxed">
                  <span className="mt-1 font-display font-black text-naranja">→</span>
                  <span>{p}</span>
                </li>
              ))}
            </ul>
            <p className="mt-8 text-mut leading-relaxed">
              Esta área conecta con la docencia, la investigación y las publicaciones relacionadas.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href={PUBMED} target="_blank" rel="noopener" className="btn-ghost">
                Publicaciones relacionadas <ArrowUpRight />
              </a>
              <Link to="/colaboraciones" className="btn-ink">Proponer una colaboración <ArrowIcon /></Link>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <div className="rounded-2xl border border-line bg-cream/60 p-7">
              <p className="kick">Temas relacionados</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {area.chips.map((c) => (
                  <span key={c} className="chip !bg-white">{c}</span>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Navegación entre áreas */}
      <nav className="border-t border-line" aria-label="Otras áreas">
        <div className="grid md:grid-cols-2">
          <Link to={`/areas/${prev.slug}`} className="group border-b border-line p-8 transition-colors hover:bg-cream/60 md:border-b-0 md:border-r">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-mut">← Área anterior</p>
            <p className="mt-2 font-display text-xl font-extrabold tracking-tight group-hover:text-naranja transition-colors">{prev.title}</p>
          </Link>
          <Link to={`/areas/${next.slug}`} className="group p-8 text-left transition-colors hover:bg-cream/60 md:text-right">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-mut">Área siguiente →</p>
            <p className="mt-2 font-display text-xl font-extrabold tracking-tight group-hover:text-naranja transition-colors">{next.title}</p>
          </Link>
        </div>
      </nav>

      <CTASection />
    </>
  )
}
