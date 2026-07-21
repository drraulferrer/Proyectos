# Web personal — raulferrer.org

Web personal de Raúl Ferrer: una sola página (one-page) que reúne todas sus
facetas profesionales —práctica clínica, fisioterapia y dolor, docencia,
divulgación, investigación y proyectos digitales en salud— junto con su
trayectoria, proyectos y contacto.

Sitio **estático** (HTML + CSS + JavaScript, sin frameworks ni build). Ligero,
rápido, accesible, responsive y con modo claro/oscuro.

## Archivos

```
web-personal/
├── index.html      # Estructura y contenido de la web
├── styles.css      # Estilos y variables de tema (colores al principio)
├── main.js         # Tema claro/oscuro, menú móvil, animaciones
├── assets/
│   ├── favicon.svg # Icono de la pestaña
│   └── foto.jpg    # (Añade aquí tu retrato)
└── README.md
```

## Cómo verla en local

No necesita compilación. Abre `index.html` en el navegador, o levanta un
servidor local para que funcione todo correctamente:

```bash
cd web-personal
python3 -m http.server 8000
# luego abre http://localhost:8000
```

## Qué editar (todo marcado en el código)

Busca los comentarios `EDITAR` y `[EDITAR]` en `index.html`:

- **Hero**: titular y texto de presentación.
- **Sobre mí**: tu narrativa (el hilo que une todas tus facetas).
- **Facetas**: las 6 tarjetas (icono, título, descripción).
- **Trayectoria**: fechas, puestos y descripciones de la línea de tiempo.
- **Proyectos**: enlaces reales y descripciones.
- **Publicaciones/Divulgación**: artículos, charlas y publicaciones.
- **Contacto**: email, GitHub, LinkedIn y redes.

Para tu **foto**: coloca `assets/foto.jpg` y, en el hero de `index.html`,
descomenta la línea `<img src="assets/foto.jpg" ...>` y borra el
`portrait__placeholder`.

Para cambiar **colores**: edita las variables `--brand` y `--accent` al
principio de `styles.css` (hay bloque para tema claro y tema oscuro).

## Publicar en GitHub Pages con el dominio raulferrer.org

1. **Sube** esta carpeta al repositorio (ya está en la rama de trabajo).
2. En GitHub → **Settings → Pages**:
   - *Source*: `Deploy from a branch`.
   - *Branch*: `main` (o la que uses) y carpeta `/web-personal` — o mueve el
     contenido a la raíz de un repo dedicado tipo `drraulferrer.github.io`.
3. **Dominio propio**: en *Settings → Pages → Custom domain* escribe
   `www.raulferrer.org` y guarda. GitHub creará un archivo `CNAME`.
4. En tu **proveedor de dominio** configura el DNS:
   - Registro `CNAME` para `www` → `drraulferrer.github.io`.
   - Registros `A` del dominio raíz (`raulferrer.org`) apuntando a las IPs de
     GitHub Pages: `185.199.108.153`, `185.199.109.153`,
     `185.199.110.153`, `185.199.111.153`.
5. Activa **Enforce HTTPS** cuando el certificado esté listo (unos minutos).

> Alternativa igual de válida: **Netlify** o **Cloudflare Pages** (arrastrar la
> carpeta o conectar el repo, y añadir el dominio). El sitio es estático, así
> que funciona en cualquiera de ellos sin cambios.

## Accesibilidad y rendimiento

- HTML semántico, navegación por teclado y `aria-label` en controles.
- Respeta `prefers-reduced-motion` y `prefers-color-scheme`.
- Sin dependencias JS externas; solo una fuente web (se puede quitar).
