import { Link } from 'react-router'
import Reveal from '@/components/Reveal'
import { ArrowIcon } from '@/components/icons'
import { PageHero, CTASection } from '@/components/blocks'
import { TIMELINE } from '@/data/content'

export default function Trayectoria() {
  return (
    <>
      <PageHero
        crumb="Trayectoria"
        kick="Recorrido"
        title={<>Veinte años<br />en <span className="font-serifit italic font-normal text-naranja">movimiento</span></>}
        lead="Más de 20 años de experiencia que sostienen la autoridad del perfil: de la consulta al aula, la investigación, la innovación y la gestión."
      />

      <section className="wrap py-14 md:py-20">
        <ol className="relative ml-2 border-l-2 border-line pl-8 md:ml-6 md:pl-12">
          {TIMELINE.map((t, i) => (
            <Reveal key={t.year + t.title} delay={40}>
              <li className="relative pb-12 last:pb-0">
                <span
                  className={`absolute -left-[41px] top-1.5 h-4 w-4 rounded-full border-[3px] md:-left-[57px] ${
                    i === TIMELINE.length - 1 ? 'border-naranja bg-naranja' : 'border-naranja bg-paper'
                  }`}
                  aria-hidden="true"
                />
                <p className="font-display text-sm font-black uppercase tracking-[0.18em] text-naranja">{t.year}</p>
                <h2 className="mt-1.5 font-display text-2xl font-extrabold tracking-tight">{t.title}</h2>
                <p className="mt-2 max-w-2xl text-mut leading-relaxed">{t.text}</p>
              </li>
            </Reveal>
          ))}
        </ol>
        <Reveal>
          <div className="mt-12">
            <Link to="/credenciales" className="btn-ink">Reconocimientos y credenciales <ArrowIcon /></Link>
          </div>
        </Reveal>
      </section>

      <CTASection />
    </>
  )
}
