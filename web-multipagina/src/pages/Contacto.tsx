import { useState } from 'react'
import Reveal from '@/components/Reveal'
import { ArrowIcon, ArrowUpRight } from '@/components/icons'
import { PageHero } from '@/components/blocks'
import { EMAIL, ORCID } from '@/data/content'

const TIPOS = ['Consultoría', 'Mentoría', 'Formación o conferencia', 'Proyecto o alianza', 'Medios de comunicación', 'Otra consulta']

export default function Contacto() {
  const [tipo, setTipo] = useState(TIPOS[0])
  const [enviado, setEnviado] = useState(false)

  return (
    <>
      <PageHero
        crumb="Contacto"
        kick="Contacto"
        title={<>Hablemos de una<br /><span className="font-serifit italic font-normal text-naranja">colaboración</span></>}
        lead="Cuéntame qué necesitas. Este formulario está orientado a colaboraciones profesionales, no a consultas clínicas."
      />

      <section className="wrap-wide py-14 md:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr]">
          {/* Formulario */}
          <Reveal>
            {enviado ? (
              <div className="rounded-3xl border border-line bg-white p-10 text-center">
                <p className="display text-4xl text-naranja">¡Gracias!</p>
                <p className="mt-4 text-mut leading-relaxed">
                  Tu propuesta está lista para enviar. En la versión final este formulario se conectará
                  al correo profesional; mientras tanto, puedes escribirme directamente a{' '}
                  <a href={`mailto:${EMAIL}`} className="font-semibold text-naranja">{EMAIL}</a>.
                </p>
                <img src="/assets/firma.png" alt="Firma de Raúl Ferrer" className="mx-auto mt-8 w-56" />
              </div>
            ) : (
              <form
                className="rounded-3xl border border-line bg-white p-7 md:p-10"
                onSubmit={(e) => {
                  e.preventDefault()
                  setEnviado(true)
                }}
              >
                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="block">
                    <span className="text-sm font-semibold">Nombre</span>
                    <input required type="text" placeholder="Tu nombre" className="mt-2 w-full rounded-xl border border-line bg-paper px-4 py-3 text-sm outline-none transition-colors focus:border-naranja" />
                  </label>
                  <label className="block">
                    <span className="text-sm font-semibold">Organización</span>
                    <input type="text" placeholder="Empresa, universidad, colegio…" className="mt-2 w-full rounded-xl border border-line bg-paper px-4 py-3 text-sm outline-none transition-colors focus:border-naranja" />
                  </label>
                </div>
                <label className="mt-5 block">
                  <span className="text-sm font-semibold">Correo electrónico</span>
                  <input required type="email" placeholder="nombre@organizacion.com" className="mt-2 w-full rounded-xl border border-line bg-paper px-4 py-3 text-sm outline-none transition-colors focus:border-naranja" />
                </label>
                <div className="mt-5">
                  <span className="text-sm font-semibold">Tipo de colaboración</span>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {TIPOS.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setTipo(t)}
                        className={`rounded-full border px-4 py-2 text-xs font-semibold transition-colors ${
                          tipo === t ? 'border-naranja bg-naranja text-white' : 'border-line bg-paper text-mut hover:border-naranja hover:text-naranja'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <label className="mt-5 block">
                  <span className="text-sm font-semibold">Descripción</span>
                  <textarea required rows={4} placeholder="Cuéntame el reto, el contexto y qué esperas conseguir…" className="mt-2 w-full rounded-xl border border-line bg-paper px-4 py-3 text-sm outline-none transition-colors focus:border-naranja" />
                </label>
                <label className="mt-5 block">
                  <span className="text-sm font-semibold">Plazo aproximado</span>
                  <input type="text" placeholder="Ej.: próximo trimestre, sin prisa…" className="mt-2 w-full rounded-xl border border-line bg-paper px-4 py-3 text-sm outline-none transition-colors focus:border-naranja" />
                </label>
                <label className="mt-6 flex items-start gap-3 text-xs text-mut">
                  <input required type="checkbox" className="mt-0.5 accent-naranja" />
                  He leído y acepto la política de privacidad y el tratamiento de mis datos para responder a esta solicitud.
                </label>
                <button type="submit" className="btn-orange mt-8">Enviar propuesta <ArrowIcon /></button>
              </form>
            )}
          </Reveal>

          {/* Lateral */}
          <Reveal delay={120}>
            <div className="space-y-4">
              <a href={`mailto:${EMAIL}`} className="card-ed group flex items-center justify-between">
                <div>
                  <p className="kick">Email</p>
                  <p className="mt-2 font-display font-extrabold tracking-tight">{EMAIL}</p>
                </div>
                <ArrowUpRight className="h-5 w-5 text-naranja transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
              </a>
              <a href="#" className="card-ed group flex items-center justify-between">
                <div>
                  <p className="kick">LinkedIn</p>
                  <p className="mt-2 font-display font-extrabold tracking-tight">Perfil profesional</p>
                </div>
                <ArrowUpRight className="h-5 w-5 text-naranja transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
              </a>
              <a href={ORCID} target="_blank" rel="noopener" className="card-ed group flex items-center justify-between">
                <div>
                  <p className="kick">ORCID · ResearchGate</p>
                  <p className="mt-2 font-display font-extrabold tracking-tight">Perfiles académicos</p>
                </div>
                <ArrowUpRight className="h-5 w-5 text-naranja transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
              </a>
              <div className="rounded-2xl border border-line bg-cream/60 p-6">
                <p className="kick">Respuesta</p>
                <p className="mt-2 text-sm text-mut leading-relaxed">Habitualmente en pocos días laborables. Te respondo personalmente.</p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  )
}
