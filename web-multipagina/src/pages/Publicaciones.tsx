import Reveal from '@/components/Reveal'
import { ArrowUpRight } from '@/components/icons'
import { PageHero, CTASection } from '@/components/blocks'
import { ARTICULOS, LIBROS, PUBMED, ORCID } from '@/data/content'

export default function Publicaciones() {
  return (
    <>
      <PageHero
        crumb="Publicaciones"
        kick="Actividad investigadora"
        title={<>La evidencia,<br /><span className="font-serifit italic font-normal text-naranja">publicada</span></>}
        lead="Producción reciente en primer cuartil, con edición invitada en revistas internacionales. Investigación en dolor, educación en neurociencia del dolor, neurofisioterapia y salud digital."
      />

      <section className="wrap-wide py-14 md:py-20">
        <div className="grid gap-14 lg:grid-cols-[1.5fr_1fr]">
          {/* Artículos */}
          <div>
            <Reveal>
              <h2 className="font-display text-2xl font-extrabold tracking-tight">Artículos recientes</h2>
            </Reveal>
            <div className="mt-6 space-y-3">
              {ARTICULOS.map((a, i) => (
                <Reveal key={a.title} delay={i * 50}>
                  <article className="card-ed flex items-start gap-5 !p-5 md:!p-6">
                    <span className={`mt-0.5 shrink-0 rounded-lg px-2.5 py-1.5 font-display text-xs font-black text-white ${a.q === 'Q1' ? 'bg-naranja' : 'bg-ink'}`}>
                      {a.q}
                    </span>
                    <div>
                      <p className="text-xs font-semibold text-mut">{a.journal}</p>
                      <h3 className="mt-1 font-display text-base font-bold leading-snug tracking-tight">{a.title}</h3>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
            <Reveal>
              <a href={PUBMED} target="_blank" rel="noopener" className="arrow-link mt-7">
                Ver todas en PubMed <ArrowUpRight />
              </a>
            </Reveal>
          </div>

          {/* Libros */}
          <div>
            <Reveal>
              <h2 className="font-display text-2xl font-extrabold tracking-tight">Libros y monografías</h2>
            </Reveal>
            <div className="mt-6 space-y-3">
              {LIBROS.map((l, i) => (
                <Reveal key={l.title} delay={i * 60}>
                  <article className="rounded-2xl border border-line bg-cream/60 p-6">
                    <p className="font-display text-xs font-black uppercase tracking-[0.18em] text-naranja">{l.year}</p>
                    <h3 className="mt-2 font-display text-lg font-extrabold leading-snug tracking-tight">{l.title}</h3>
                    <p className="mt-2 text-sm text-mut leading-relaxed">{l.text}</p>
                  </article>
                </Reveal>
              ))}
            </div>
            <Reveal>
              <a href={ORCID} target="_blank" rel="noopener" className="arrow-link mt-7">
                Perfil ORCID <ArrowUpRight />
              </a>
            </Reveal>
          </div>
        </div>
      </section>

      <CTASection title="¿Colaboramos en investigación?" text="Líneas abiertas en dolor, educación en neurociencia del dolor, neurofisioterapia, IA en educación y salud digital." />
    </>
  )
}
