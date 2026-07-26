import { Link } from 'react-router'
import Reveal from '@/components/Reveal'
import { ArrowIcon, ArrowUpRight } from '@/components/icons'
import { Marquee, CTASection } from '@/components/blocks'
import { AREAS, STATS, PROYECTOS } from '@/data/content'

const NIVELES = [
  { b: 'Persona', s: 'Experiencia clínica y relación con el paciente.' },
  { b: 'Razonamiento', s: 'Toma de decisiones basada en la evidencia.' },
  { b: 'Prevención', s: 'Salud pública y comunidad.' },
  { b: 'Docencia', s: 'Formación de profesionales.' },
  { b: 'Innovación', s: 'Tecnología en salud y educación.' },
  { b: 'Sistema', s: 'Organizaciones y sistema sanitario.' },
]

export default function Home() {
  return (
    <>
      {/* ——— HERO ——— */}
      <section className="relative overflow-hidden">
        <img
          src="/assets/logo-rf.png"
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 top-1/2 hidden w-[560px] -translate-y-1/2 opacity-[0.05] lg:block"
        />
        <div className="wrap-wide grid gap-12 py-14 md:py-20 lg:grid-cols-[1.35fr_1fr] lg:items-center">
          <div>
            <Reveal>
              <p className="kick">Fisioterapeuta · Docente · Investigador · Gestor</p>
            </Reveal>
            <Reveal delay={80}>
              <h1 className="display mt-6 text-[clamp(3rem,8vw,6.5rem)]">
                Dr. Raúl<br />
                Ferrer <span className="font-serifit italic font-normal text-naranja">Peña</span>
              </h1>
            </Reveal>
            <Reveal delay={160}>
              <p className="lead mt-7 max-w-xl">
                Una fisioterapia que <strong className="text-ink font-semibold">conecta clínica, conocimiento y gestión</strong>.
                Una visión 360º con profundidad real en cada campo y la tecnología como hilo conductor.
              </p>
            </Reveal>
            <Reveal delay={240}>
              <div className="mt-9 flex flex-wrap gap-3">
                <Link to="/vision-360" className="btn-ink">Descubre mi enfoque <ArrowIcon /></Link>
                <Link to="/colaboraciones" className="btn-ghost">Proponer una colaboración</Link>
              </div>
            </Reveal>
          </div>
          <Reveal delay={200} className="relative">
            <div className="absolute -left-4 -top-4 h-full w-full rounded-3xl bg-naranja" aria-hidden="true" />
            <img
              src="/assets/foto-raul.jpg"
              alt="Dr. Raúl Ferrer Peña"
              className="relative aspect-[4/5] w-full rounded-3xl object-cover object-top"
            />
            <div className="absolute -bottom-5 left-6 rounded-2xl border border-line bg-white px-5 py-4 shadow-lg">
              <p className="font-display text-2xl font-black text-naranja">+20 años</p>
              <p className="text-xs font-semibold text-mut">conectando áreas de la fisioterapia</p>
            </div>
          </Reveal>
        </div>

        {/* Stats */}
        <div className="wrap-wide pb-14 md:pb-20">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STATS.map((s, i) => (
              <Reveal key={s.big} delay={i * 80}>
                <div className="card-ed h-full">
                  <p className="font-display text-3xl font-black tracking-tight">{s.big}</p>
                  <p className="mt-2 text-sm text-mut leading-snug">{s.small}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <Marquee />

      {/* ——— VISIÓN 360 ——— */}
      <section className="wrap py-16 md:py-24">
        <Reveal><p className="kick">Un núcleo, múltiples direcciones</p></Reveal>
        <div className="mt-4 grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:items-start">
          <Reveal delay={80}>
            <h2 className="display text-[clamp(2.2rem,5vw,3.8rem)]">
              Fisioterapia con <span className="font-serifit italic font-normal text-naranja">visión 360º</span>
            </h2>
            <p className="lead mt-6">
              La fisioterapia es el centro. Desde ella conecto el razonamiento clínico, el dolor,
              la prevención, la salud pública y comunitaria, la docencia y la innovación educativa.
            </p>
            <p className="mt-4 text-mut leading-relaxed">
              No es hacer de todo: es comprender la fisioterapia en varios niveles relacionados.
            </p>
            <Link to="/vision-360" className="arrow-link mt-7">Explorar la visión 360º <ArrowIcon /></Link>
          </Reveal>
          <div className="grid gap-3 sm:grid-cols-2">
            {NIVELES.map((n, i) => (
              <Reveal key={n.b} delay={i * 60}>
                <div className="flex h-full items-start gap-4 rounded-2xl border border-line bg-white p-5">
                  <span className="font-display text-lg font-black text-naranja">→</span>
                  <div>
                    <p className="font-display font-extrabold">{n.b}</p>
                    <p className="mt-1 text-sm text-mut">{n.s}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ——— ÁREAS ——— */}
      <section className="border-y border-line bg-cream/50 py-16 md:py-24">
        <div className="wrap-wide">
          <div className="grid items-end gap-10 lg:grid-cols-[1.4fr_1fr]">
            <div>
              <Reveal><p className="kick">¿A qué me dedico?</p></Reveal>
              <Reveal delay={80}>
                <h2 className="display mt-4 text-[clamp(2.2rem,5vw,3.8rem)]">Seis direcciones,<br />una misma mirada</h2>
              </Reveal>
              <Reveal delay={140}>
                <p className="mt-5 max-w-xl text-mut leading-relaxed">
                  El logotipo ya lo cuenta: un núcleo —las letras RF— del que parten
                  flechas en todas las direcciones. Cada área es una de esas flechas.
                </p>
              </Reveal>
              <Reveal delay={200}>
                <Link to="/areas" className="btn-ghost mt-7">Todas las áreas <ArrowIcon /></Link>
              </Reveal>
            </div>
            <Reveal delay={160}>
              <figure className="rounded-3xl border border-line bg-white p-8 md:p-10">
                <img
                  src="/assets/logo-rf.png"
                  alt="Logotipo RF: monograma con flechas irradiando en todas las direcciones"
                  className="mx-auto w-full max-w-xs"
                />
                <figcaption className="mt-6 flex items-center justify-center gap-2 text-center font-display text-[0.7rem] font-bold uppercase tracking-[0.22em] text-mut">
                  <span className="text-naranja">→</span> Un núcleo, múltiples direcciones <span className="text-naranja">←</span>
                </figcaption>
              </figure>
            </Reveal>
          </div>
          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {AREAS.map((a, i) => (
              <Reveal key={a.slug} delay={(i % 3) * 80}>
                <Link to={`/areas/${a.slug}`} className="card-ed group flex h-full flex-col">
                  <div className="flex items-start justify-between">
                    <span className="display text-4xl num-outline group-hover:text-naranja group-hover:[-webkit-text-stroke:0] transition-all">{a.num}</span>
                    <ArrowUpRight className="h-5 w-5 text-naranja transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                  </div>
                  <h3 className="mt-6 font-display text-xl font-extrabold leading-tight tracking-tight">{a.title}</h3>
                  <p className="mt-3 text-sm text-mut leading-relaxed flex-1">{a.short}</p>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ——— BREAK NARANJA ——— */}
      <section className="bg-naranja text-white">
        <div className="wrap-wide py-16 md:py-24">
          <Reveal>
            <p className="font-display text-xs font-bold uppercase tracking-[0.28em] text-white/70">La idea de marca</p>
            <p className="display mt-6 max-w-5xl text-[clamp(2rem,5.5vw,4.5rem)]">
              «Una fisioterapia que <span className="font-serifit italic font-normal">conecta</span> clínica,
              conocimiento y gestión.»
            </p>
            <p className="mt-8 max-w-2xl text-white/85 leading-relaxed">
              Como las flechas del logotipo: movimiento en todas las direcciones.
              Diverso en alcance, profundo en cada campo.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ——— PROYECTOS PREVIEW ——— */}
      <section className="wrap-wide py-16 md:py-24">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <Reveal><p className="kick">Salud digital e innovación</p></Reveal>
            <Reveal delay={80}>
              <h2 className="display mt-4 text-[clamp(2.2rem,5vw,3.8rem)]">Proyectos que<br />abren caminos</h2>
            </Reveal>
          </div>
          <Reveal delay={160}>
            <Link to="/proyectos" className="btn-ghost">Todos los proyectos <ArrowIcon /></Link>
          </Reveal>
        </div>
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {PROYECTOS.slice(0, 3).map((p, i) => (
            <Reveal key={p.title} delay={i * 80}>
              <article className={`flex h-full flex-col rounded-2xl border p-7 transition-all duration-300 hover:-translate-y-1 ${i === 0 ? 'border-ink bg-ink text-white' : 'border-line bg-white card-ed'}`}>
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className={i === 0 ? 'text-white/50' : 'text-mut'}>{p.year}</span>
                  {p.vigente && (
                    <span className={`rounded-full px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wider ${i === 0 ? 'bg-naranja text-white' : 'bg-naranja-soft text-naranja-deep'}`}>
                      Vigente
                    </span>
                  )}
                </div>
                <h3 className="mt-5 font-display text-2xl font-extrabold tracking-tight">{p.title}</h3>
                <p className="mt-1 font-display text-[0.7rem] font-bold uppercase tracking-[0.18em] text-naranja">{p.role}</p>
                <p className={`mt-4 text-sm leading-relaxed flex-1 ${i === 0 ? 'text-white/70' : 'text-mut'}`}>{p.text}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ——— TRAYECTORIA TEASER ——— */}
      <section className="border-t border-line bg-ink text-white stripes">
        <div className="wrap-wide grid gap-10 py-16 md:py-24 lg:grid-cols-[1fr_1.2fr] lg:items-center">
          <Reveal>
            <p className="kick">Trayectoria</p>
            <h2 className="display mt-4 text-[clamp(2.2rem,5vw,3.8rem)]">Dos décadas<br />en movimiento</h2>
            <p className="mt-6 max-w-md text-white/65 leading-relaxed">
              De la consulta de Atención Primaria al aula, la investigación, la innovación y la gestión:
              una autoridad construida etapa a etapa.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/trayectoria" className="btn-light">Ver trayectoria <ArrowIcon /></Link>
              <Link to="/credenciales" className="btn border border-white/30 text-white hover:border-naranja hover:text-naranja">Credenciales</Link>
            </div>
          </Reveal>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { b: 'Cum laude', s: 'Doctor en Investigación del Dolor (URJC)' },
              { b: 'Titular', s: 'Profesor de grado en La Salle (UAM)' },
              { b: '2019', s: 'Cruz de Honor de Plata de la Sanidad Madrileña' },
              { b: 'Delegado', s: 'Ministerio de Sanidad · Salud Comunitaria' },
            ].map((c, i) => (
              <Reveal key={c.b} delay={i * 80}>
                <div className="h-full rounded-2xl border border-white/15 bg-white/5 p-6">
                  <p className="font-display text-2xl font-black text-naranja">{c.b}</p>
                  <p className="mt-2 text-sm text-white/65 leading-snug">{c.s}</p>
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
