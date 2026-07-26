import { Link } from 'react-router'
import Reveal from '@/components/Reveal'
import { ArrowIcon } from '@/components/icons'
import { EMAIL, MARQUEE_ITEMS } from '@/data/content'

/** Cabecera editorial de página interior: crumb + kick + titular enorme + lead. */
export function PageHero({
  crumb,
  kick,
  title,
  lead,
}: {
  crumb: string
  kick: string
  title: React.ReactNode
  lead?: string
}) {
  return (
    <section className="border-b border-line">
      <div className="wrap-wide pt-14 pb-12 md:pt-20 md:pb-16">
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-mut">
            <Link to="/" className="hover:text-naranja transition-colors">Inicio</Link>
            <span className="mx-2 text-naranja">/</span> {crumb}
          </p>
        </Reveal>
        <Reveal delay={60}>
          <p className="kick mt-8">{kick}</p>
        </Reveal>
        <Reveal delay={120}>
          <h1 className="display mt-4 text-[clamp(2.6rem,7vw,5.5rem)] max-w-5xl">{title}</h1>
        </Reveal>
        {lead && (
          <Reveal delay={200}>
            <p className="lead mt-6 max-w-2xl">{lead}</p>
          </Reveal>
        )}
      </div>
    </section>
  )
}

/** Cinta marquee con los temas del perfil. */
export function Marquee({ dark = false }: { dark?: boolean }) {
  const items = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS]
  return (
    <div className={`overflow-hidden border-y py-4 ${dark ? 'border-white/10 bg-ink text-white/70' : 'border-line bg-cream/60 text-mut'}`}>
      <div className="marquee-row font-display text-sm font-bold uppercase tracking-[0.18em]">
        {items.map((t, i) => (
          <span key={i} className="inline-flex items-center gap-3">
            {t} <span className="text-naranja">→</span>
          </span>
        ))}
      </div>
    </div>
  )
}

/** Bloque de cierre con CTA de contacto y firma. */
export function CTASection({
  title = '¿Colaboramos?',
  text = 'Docencia e innovación educativa, investigación, consultoría, mentoría o proyectos de salud digital. Te respondo personalmente.',
}: {
  title?: string
  text?: string
}) {
  return (
    <section className="wrap-wide py-16 md:py-24">
      <Reveal>
        <div className="relative overflow-hidden rounded-3xl bg-ink text-white stripes">
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-naranja/20 blur-2xl" aria-hidden="true" />
          <div className="relative grid gap-10 p-8 md:grid-cols-[1.4fr_1fr] md:items-center md:p-14">
            <div>
              <p className="kick">Contacto</p>
              <h2 className="display mt-4 text-[clamp(2rem,4.5vw,3.4rem)]">{title}</h2>
              <p className="mt-5 max-w-xl text-white/65 leading-relaxed">{text}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/contacto" className="btn-orange">Proponer una colaboración <ArrowIcon /></Link>
                <a href={`mailto:${EMAIL}`} className="btn-light !bg-transparent !text-white border border-white/30 hover:!bg-naranja hover:border-naranja">{EMAIL}</a>
              </div>
            </div>
            <div className="flex md:justify-end">
              <img src="/assets/firma.png" alt="Firma de Raúl Ferrer" className="w-64 max-w-full shrink-0 invert opacity-90" />
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  )
}
