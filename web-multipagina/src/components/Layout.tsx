import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router'
import { EMAIL, ORCID, PUBMED } from '@/data/content'
import { ArrowUpRight } from '@/components/icons'

const NAV = [
  { to: '/', label: 'Inicio', end: true },
  { to: '/vision-360', label: 'Visión 360º' },
  { to: '/sobre-mi', label: 'Sobre mí' },
  { to: '/areas', label: 'Áreas' },
  { to: '/trayectoria', label: 'Trayectoria' },
  { to: '/proyectos', label: 'Proyectos' },
  { to: '/publicaciones', label: 'Publicaciones' },
  { to: '/colaboraciones', label: 'Colaboraciones' },
]

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [pathname])
  return null
}

function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => setOpen(false), [pathname])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled || open ? 'bg-paper/90 backdrop-blur-md border-b border-line' : 'border-b border-transparent'
      }`}
    >
      <div className="wrap-wide flex h-[72px] items-center justify-between">
        <Link to="/" className="flex items-center gap-3" aria-label="Inicio — Dr. Raúl Ferrer">
          <img src="/assets/logo-rf.png" alt="Logotipo RF" className="h-9 w-auto" />
          <span className="hidden sm:block font-display text-sm font-extrabold tracking-tight leading-none">
            Dr. Raúl Ferrer
            <span className="block text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-mut mt-1">
              Fisioterapia · Visión 360º
            </span>
          </span>
        </Link>

        <nav className="hidden xl:flex items-center gap-7" aria-label="Principal">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `text-[0.85rem] font-semibold transition-colors ${
                  isActive ? 'text-naranja' : 'text-ink/70 hover:text-ink'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link to="/contacto" className="btn-orange hidden sm:inline-flex !px-5 !py-2.5">
            Contacto <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
          <button
            className="xl:hidden inline-flex p-2 text-ink"
            aria-label="Abrir menú"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M3 6h18M3 12h18M3 18h18" />}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <nav className="xl:hidden border-t border-line bg-paper pb-6" aria-label="Menú móvil">
          {[...NAV, { to: '/contacto', label: 'Contacto' }].map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={'end' in item ? item.end : false}
              className={({ isActive }) =>
                `block px-6 py-3.5 font-display text-lg font-bold ${isActive ? 'text-naranja' : 'text-ink'}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  )
}

function Footer() {
  return (
    <footer className="bg-ink text-white">
      <div className="wrap-wide py-14">
        <div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
          <div>
            <img src="/assets/logo-rf.png" alt="" className="h-12 w-auto invert" />
            <p className="mt-4 max-w-sm text-sm text-white/60 leading-relaxed">
              Dr. Raúl Ferrer Peña — Fisioterapeuta, docente e investigador.
              Una fisioterapia que conecta clínica, conocimiento y gestión.
            </p>
          </div>
          <nav className="grid grid-cols-2 gap-x-12 gap-y-2.5 text-sm" aria-label="Pie de página">
            {NAV.map((item) => (
              <Link key={item.to} to={item.to} className="text-white/70 hover:text-naranja transition-colors">
                {item.label}
              </Link>
            ))}
            <Link to="/contacto" className="text-white/70 hover:text-naranja transition-colors">Contacto</Link>
            <Link to="/credenciales" className="text-white/70 hover:text-naranja transition-colors">Credenciales</Link>
          </nav>
          <div className="text-sm">
            <p className="font-display font-bold uppercase tracking-widest text-white/40 text-xs mb-3">Perfiles</p>
            <div className="flex flex-col gap-2.5">
              <a href={`mailto:${EMAIL}`} className="text-white/70 hover:text-naranja transition-colors">{EMAIL}</a>
              <a href={ORCID} target="_blank" rel="noopener" className="text-white/70 hover:text-naranja transition-colors">ORCID</a>
              <a href={PUBMED} target="_blank" rel="noopener" className="text-white/70 hover:text-naranja transition-colors">PubMed</a>
              <a href="#" className="text-white/70 hover:text-naranja transition-colors">LinkedIn</a>
            </div>
          </div>
        </div>
        <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-white/40 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} Dr. Raúl Ferrer Peña · raulferrer.org</p>
          <img src="/assets/firma.png" alt="Firma de Raúl Ferrer" className="h-10 w-auto invert opacity-70" />
        </div>
      </div>
    </footer>
  )
}

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <ScrollToTop />
      <Header />
      <main className="flex-1 pt-[72px]">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
