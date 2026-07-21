# Web personal — raulferrer.org

Web personal del **Dr. Raúl Ferrer Peña**: fisioterapeuta, Doctor en
Investigación del Dolor, docente y mentor, experto en salud digital.

Sitio de una sola página (one-page) que proyecta su trayectoria y autoridad,
articulado en torno a su identidad de marca: el logo **RF con flechas
irradiando en todas las direcciones** (movimiento, dinamismo, versatilidad).

Sitio **estático** (HTML + CSS + JavaScript, sin frameworks ni build).
Ligero, rápido, accesible, responsive y con modo claro/oscuro.

## Identidad

- **Logo**: monograma RF con flechas en todas las direcciones (negro + coral),
  recreado en SVG vectorial y **animado** (las flechas se despliegan al cargar).
  Fichero: `assets/logo.svg`.
- **Paleta**: negro (`--ink`) + blanco + **coral** (`--coral: #f15a38`, el color
  de las flechas) como acento. Editable al principio de `styles.css`.
- **Tipografía**: Poppins (títulos) + Inter (texto), vía Google Fonts.
- **Motivo**: la flecha `→` se repite en botones, tarjetas y secciones para
  transmitir el dinamismo de la marca.

## Archivos

```
web-personal/
├── index.html      # Estructura y contenido
├── styles.css      # Estilos y variables de tema (marca al principio)
├── main.js         # Tema, menú móvil, animaciones
├── assets/
│   ├── logo.svg    # Logo RF con flechas (favicon e identidad)
│   └── foto.jpg    # (Añade aquí tu retrato)
└── README.md
```

## Secciones

Hero · cifras de autoridad · Sobre mí · Áreas (a qué me dedico) ·
Trayectoria y reconocimientos · Proyectos · Contacto.

## Ver en local

```bash
cd web-personal
python3 -m http.server 8000
# http://localhost:8000
```

## Pendiente de completar

Busca `#`, enlaces `href="#"` y `foto.jpg`:

- **Foto** de Raúl en `assets/foto.jpg` (y descomentar el `<img>` del hero).
- Enlaces reales de **redes** (YouTube, Twitch, LinkedIn, X) en el footer.
- Enlace de **"Consulta online"** (nav y CTA).
- Revisar cifras/fechas si procede.

## Publicar en GitHub Pages con el dominio raulferrer.org

1. Sube esta carpeta al repositorio.
2. GitHub → **Settings → Pages** → *Source*: rama y carpeta `/web-personal`
   (o mueve el contenido a la raíz de un repo `drraulferrer.github.io`).
3. **Custom domain**: `www.raulferrer.org` (crea el archivo `CNAME`).
4. DNS en tu proveedor:
   - `CNAME` de `www` → `drraulferrer.github.io`.
   - Registros `A` de la raíz → `185.199.108.153`, `185.199.109.153`,
     `185.199.110.153`, `185.199.111.153`.
5. Activa **Enforce HTTPS**.

> Alternativas equivalentes: **Netlify** o **Cloudflare Pages**.

## Accesibilidad y rendimiento

- HTML semántico, navegación por teclado, `aria-*` en controles.
- Respeta `prefers-reduced-motion` y `prefers-color-scheme`.
- Las animaciones de aparición tienen salvavidas: nunca ocultan contenido si
  el JS tarda o falla.
