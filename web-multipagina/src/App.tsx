import { Routes, Route } from 'react-router'
import Layout from '@/components/Layout'
import Home from '@/pages/Home'
import Vision360 from '@/pages/Vision360'
import SobreMi from '@/pages/SobreMi'
import Areas from '@/pages/Areas'
import AreaDetalle from '@/pages/AreaDetalle'
import Trayectoria from '@/pages/Trayectoria'
import Credenciales from '@/pages/Credenciales'
import Proyectos from '@/pages/Proyectos'
import Publicaciones from '@/pages/Publicaciones'
import Colaboraciones from '@/pages/Colaboraciones'
import Contacto from '@/pages/Contacto'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="vision-360" element={<Vision360 />} />
        <Route path="sobre-mi" element={<SobreMi />} />
        <Route path="areas" element={<Areas />} />
        <Route path="areas/:slug" element={<AreaDetalle />} />
        <Route path="trayectoria" element={<Trayectoria />} />
        <Route path="credenciales" element={<Credenciales />} />
        <Route path="proyectos" element={<Proyectos />} />
        <Route path="publicaciones" element={<Publicaciones />} />
        <Route path="colaboraciones" element={<Colaboraciones />} />
        <Route path="contacto" element={<Contacto />} />
        <Route path="*" element={<Home />} />
      </Route>
    </Routes>
  )
}
