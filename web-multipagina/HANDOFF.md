# Traspaso — Web personal multipágina (propuesta editorial) de Raúl Ferrer

> Documento para continuar el proyecto en una **sesión nueva**. La publicación en
> WordPress debe hacerla la **sesión del terminal con el MCP `wordpress-rf`**
> (Kimi Work, donde se generó esta propuesta, **no tiene ese MCP**; verificado el 26-07-2026).

---

## 1. Qué es y dónde está

Propuesta de **web personal multipágina** (NO one-page) para raulferrer.org, con
estética editorial tipo *personal branding* (referencia aportada por el usuario:
plantilla de presentación en negro/blanco/naranja con tipografía grande y bloques
fotográficos).

- **Repo**: `github.com/drraulferrer/Proyectos`
- **Rama**: `kimi/web-multipagina-editorial`
- **Carpeta**: `web-multipagina/` (React 19 + TypeScript + Vite 7 + Tailwind 3 + shadcn)
- Prototipo local original: `/Users/raulferrer/Documents/kimi/workspace/raulferrer-web`
- Contenido: el **verificado** en `web-personal/HANDOFF-web-raulferrer.md` (rama
  `claude/raulferrer-personal-website-xiv6we`) y en la web actual raulferrer.org.

### Ver en local

```bash
cd web-multipagina
npm install
npm run dev      # http://localhost:3000 (o el puerto libre que se indique)
npm run build    # producción → dist/
```

## 2. Estado actual

- ✅ Diseño y contenido completos, compila sin errores (`npm run build` OK).
- ✅ **Fondo blanco** (cambio pedido por el usuario el 26-07-2026; antes crema `#FAF6EE`).
- ✅ Incorporados los **assets reales**: logo RF (`logo-rf.png`), foto hero nueva
  (`foto-hero.jpg`, de `Fotoyotraje26.png`), foto Sobre mí (`foto-raul.jpg`) y firma
  (`firma.png`), optimizados en `public/assets/`.
- ✅ Subido a GitHub en la rama indicada.
- ✅ **WEB COMPLETA PUBLICADA EN RAULFERRER.ORG (26-07-2026, desde Kimi Work vía el
  endpoint MCP `raulferrer-wp` + REST API con las mismas credenciales)**:
  - **16 páginas publicadas** con plantilla Divi en blanco (`page-template-blank.php`):
    - Portada: `/` (página ID 1178, slug `inicio`, fijada en Ajustes → Lectura).
    - `/vision-360/` 1179 · `/sobre-mi/` 1180 · `/areas/` 1181 · `/trayectoria/` 1182 ·
      `/credenciales/` 1183 · `/proyectos/` 1184 · `/publicaciones/` 1185 ·
      `/colaboraciones/` 1186 · `/contacto/` 1187.
    - Áreas (hijas de `/areas/`): `/areas/razonamiento-clinico-dolor/` 1188 ·
      `/areas/salud-publica-prevencion/` 1189 · `/areas/atencion-primaria/` 1190 ·
      `/areas/docencia-innovacion/` 1191 · `/areas/salud-digital/` 1192 ·
      `/areas/gestion-direccion/` 1193.
  - Medios en biblioteca: `foto-hero.jpg` 1175 · `logo-rf.png` 1176 · `firma.png` 1177 ·
    `foto-raul.jpg` (subida posterior, ver biblioteca 2026/07).
  - **Fotos nuevas integradas (26-07-2026 noche)**: `ecografia-clinica.jpg` 1254 (área 01) ·
    `taller-comunitario.jpg` 1255 (área 02) · `consulta-paciente.jpg` 1256 (área 03) ·
    `formacion-profesionales.jpg` 1257 (área 04) · `salud-digital-datos.jpg` 1258 (área 05) ·
    `raul-traje.jpg` 1259 (área 06 y foto principal de Sobre mí, sustituye a `foto-raul.jpg`).
    Originales optimizados en `raulferrer-web/wordpress/fotos/` (1600px, JPG q82, `urls.json`).
  - Contenido antiguo **preservado en borrador** (nada borrado): portada anterior
    «Inicio» (ID 1152) y «TRAYECTORIA Y PROYECTOS» (ID 38, renombrada a
    `trayectoria-antigua` para liberar el slug). Resto de páginas antiguas (consulta
    online, about, innercircle, blog…) siguen publicadas como estaban.
  - El blog/entradas no se ha tocado.
  - Generador reproducible: `web-multipagina/wordpress/generate-pages.py`
    (contiene CSS compartido + contenido de las 16 páginas; `inicio.html` es la portada).
    Despliegue: `wordpress/update-pages.py` (sube los 16 contenidos + todo el CSS al
    «CSS adicional» del tema vía ability `raulferrer-content/update-custom-css`).
- ⚠️ **Lecciones de WordPress/Divi aprendidas (26-07-2026), ya aplicadas en el generador**:
  1. WP elimina `<style>`/`<script>` al guardar → el CSS vive en el «CSS adicional»
     (Divi lo empaqueta en `et-cache/global/et-divi-customizer.min.css`) y las páginas
     funcionan sin JS (marquee estático, reveals visibles).
  2. `@import` de Google Fonts NO sobrevive a la minificación de Divi → se usan 40
     reglas `@font-face` explícitas (Archivo/Inter/Instrument Serif, en `/tmp/rf-fontface.css`).
  3. `wpautop` rompe cualquier bloque (`h3`, `p`, `div`) dentro de un `<a>` (el parser
     HTML5 parte el enlace en varias cajas) → `generate-pages.py: neutralize_anchors()`
     convierte los bloques internos de las tarjetas-enlace en `<span class="rfw-b">` y el
     CSS añade `.rfw-b{display:block}`, `.rfw p:empty{display:none}` y
     `.rfw-areas>p,.rfw-grid>p{display:contents}`.
  4. Divi limita el ancho: `.container` (1080px) y `#left-area` (73.6% por la clase
     `et_right_sidebar`) → CSS a ancho completo para
     `.page-template-page-template-blank-php`.
  5. El título del tema (`<h1 class="main_title">`) se oculta por CSS en las 16 páginas.
  6. Reglas de color de enlaces de Divi pueden ganar a las del diseño → botones con
     `color ... !important` (`.rfw-btn--ink/--nar/--gh`).
  - **Cambios de contenido (26-07-2026 noche, petición de Raúl)**: título de Sobre mí
    → «Fisioterapeuta, Doctor, Experto en Dolor Crónico y Salud Digital». Proyectos:
    Smart Dyspnea cerró en 2023 y #Sherpas20 terminó en 2021 (ambos a «Trayectoria de
    proyectos»); nueva tarjeta vigente destacada **Fundación Paincorp (2025 — hoy,
    Secretario y Patrono Fundador)**, también en portada y en la línea temporal 2025;
    La Salle corregido a «2013 — hoy»; nueva vigente «Docencia de posgrado · Salud
    Digital y Fisioterapia Bioconductual (2014 — hoy)»; nuevas secciones **Proyectos de
    investigación** y **Proyectos de innovación docente** (4 tarjetas c/u, enlazadas a
    DOI). Publicaciones: cada artículo enlaza a su DOI y cada libro a su descarga
    (Bubok ×2, sedolor.es, PDF de dolor.com).
- ⛔ Pendiente: enlaces reales de LinkedIn/ResearchGate (van con `#`), conexión real
  del formulario de contacto y menú clásico del tema (las páginas nuevas llevan su
  propia navegación integrada; el blog usa la cabecera del tema).

## 3. Estructura de páginas (11 rutas → 16 páginas WP)

| Ruta | Página WP (slug sugerido) | Contenido |
|---|---|---|
| `/` | `inicio` (portada) | Hero + cifras + teasers de todas las secciones |
| `/vision-360` | `vision-360` | Manifiesto «un núcleo, múltiples direcciones» + 6 niveles |
| `/sobre-mi` | `sobre-mi` | Bio, foto, chips, firma, 4 pilares de autoridad |
| `/areas` | `areas` | Hub con las 6 áreas |
| `/areas/razonamiento-clinico-dolor` | `areas/razonamiento-clinico-dolor` (hija) | Detalle de área |
| `/areas/salud-publica-prevencion` | hija de `areas` | Detalle de área |
| `/areas/atencion-primaria` | hija de `areas` | Detalle de área |
| `/areas/docencia-innovacion` | hija de `areas` | Detalle de área |
| `/areas/salud-digital` | hija de `areas` | Detalle de área |
| `/areas/gestion-direccion` | hija de `areas` | Detalle de área |
| `/trayectoria` | `trayectoria` | Timeline 2006 → hoy |
| `/credenciales` | `credenciales` | Formación, docencia, reconocimientos, institucional |
| `/proyectos` | `proyectos` | Vigentes vs. históricos |
| `/publicaciones` | `publicaciones` | Artículos Q1/Q2 + libros |
| `/colaboraciones` | `colaboraciones` | 4 modalidades + método |
| `/contacto` | `contacto` | Formulario de colaboraciones (no consulta clínica) |

## 4. Sistema de diseño (para replicar en Divi)

- **Colores**: fondo blanco `#FFFFFF` · crema (secciones de contraste) `#F6F1E7` ·
  tinta `#171310` · naranja marca `#F27A16` (hover `#D9630C`, fondo suave `#FBE3CE`) ·
  línea `#E3D8C5` · gris texto `#7C7161`.
- **Tipografías** (Google Fonts): `Archivo` 800–900 para titulares (tracking -0.035em,
  leading 0.95), `Inter` para texto, `Instrument Serif` *cursiva* para acentos.
- **Recursos editoriales**: números de sección grandes en contorno
  (`-webkit-text-stroke: 1.5px rgba(23,19,16,.22)`), kickers en mayúsculas naranja
  (letter-spacing .28em), secciones «break» a todo naranja con cita, bloques oscuros
  `#171310` con rayas diagonales, marquee de temas, flechas `→` como motivo.
- **Componentes**: tarjetas blancas con borde `#E3D8C5`, radius 16–24px, hover con
  elevación y borde naranja; botones píldora (tinta/naranja/ghost).
- **Firma**: imagen negra sobre transparente; en bloques oscuros se usa con
  `filter: invert(1)`. Igual para el logo en el pie oscuro.

## 5. Cómo publicar en WordPress (sesión del terminal con MCP `wordpress-rf`)

El sitio es una SPA React: **no se puede pegar tal cual en Divi**. Dos vías:

### Vía A (recomendada): bloques HTML autónomos por página
Mismo patrón que `web-personal/wordpress-kimi.html`, que ya funcionó:

1. Generar un bloque HTML+CSS autónomo por cada página de la tabla §3. Se puede:
   - renderizar el React a HTML estático (SSR con `renderToString` + `StaticRouter`)
     e inyectar el CSS compilado de `dist/assets/index-*.css` inline en `<style>`, o
   - replicar cada página a mano usando los tokens de §4 y el contenido de
     `web-multipagina/src/data/content.ts` (toda la copy está centralizada ahí).
2. Las micro-interacciones (menú móvil, reveal on scroll, formulario) requieren un
   `<script>` vanilla pequeño por bloque (el marquee y los hovers son CSS puro).
3. **Copia de seguridad primero**: WordPress → Herramientas → Exportar → Todo (XML).
4. Inventariar páginas actuales. **No borrar nada**: pasar a BORRADOR lo publicado
   (dejar el blog/entradas como están).
5. Crear cada página en **BORRADOR**, plantilla **en blanco / ancho completo**,
   pegando su bloque en un **módulo «Código» de Divi**. Las 6 páginas de área como
   **páginas hijas** de `areas` para conservar las URLs `/areas/slug`.
6. **Subir a la biblioteca de medios**: `foto-hero.jpg` (hero de portada),
   `foto-raul.jpg` (página Sobre mí), `logo-rf.png` y `firma.png`
   (en `web-multipagina/public/assets/`) y sustituir las rutas `/assets/...` por las
   URLs reales de WordPress.
7. Crear el **menú de navegación** en Apariencia → Menús: Inicio, Visión 360º,
   Sobre mí, Áreas, Trayectoria, Proyectos, Publicaciones, Colaboraciones + botón Contacto.
8. Dar **enlaces de vista previa** para revisión antes de publicar.
9. Cuando se apruebe: publicar páginas y Ajustes → Lectura → Página de inicio → `inicio`.

### Vía B: sitio estático fuera de WordPress
Servir `dist/` (tras `npm run build`) en un subdominio o subdirectorio del hosting
(TMDHosting permite subir estáticos por cPanel). Más fiel al diseño, pero se sale de
WordPress y el usuario pidió instalarla *en* WordPress.

> Recordatorio técnico del HANDOFF anterior: el hosting es TMDHosting (LiteSpeed) y el
> MCP funciona gracias a `CGIPassAuth on` al inicio del `.htaccess` de `public_html`.

## 6. Pendiente de contenido (confirmar con Raúl)

- **Enlaces reales**: LinkedIn y ResearchGate (ahora `href="#"` en nav, footer,
  credenciales y contacto).
- **Formulario de contacto**: el envío es simulado; conectar al correo profesional
  (p. ej. WPForms/Contact Form 7 apuntando a drraulferrer@gmail.com) y enlazar la
  **política de privacidad** real.
- **Logo vectorial limpio**: el PNG actual deriva de un SVG con PNG incrustado;
  pendiente vector + variantes (horizontal, monocromo, favicon).
- **Confirmar datos** heredados del HANDOFF anterior (cifras, cargos, fechas).
- Decisión final: esta **versión multipágina** vs. la **one-page `wordpress-kimi.html`**
  (ambas conviven en el repo; el usuario está comparando).

## 7. Cómo editar el prototipo

- **Toda la copy está en** `web-multipagina/src/data/content.ts` (áreas, timeline,
  proyectos, publicaciones, libros, colaboraciones, cifras, marquee).
- Páginas en `src/pages/`, componentes compartidos en `src/components/`
  (`Layout.tsx` = nav+footer, `blocks.tsx` = cabeceras/CTA/marquee, `Reveal.tsx`).
- Tokens en `tailwind.config.js` (colores/fuentes) y utilidades en `src/index.css`.
- Tras editar: `npm run build` para validar.

---
*Generado en Kimi Work como traspaso de sesión. Fecha: 26 de julio de 2026.*
