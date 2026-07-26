# Traspaso — Nueva web personal de Raúl Ferrer (para sesión nueva)

> Documento para retomar el proyecto en una **sesión nueva de Claude**, idealmente
> la que tiene acceso al **WordPress por MCP** (el Claude del terminal), que es la
> única que puede publicar en raulferrer.org.

## 1. Objetivo inmediato
**Publicar la nueva web personal en el WordPress de raulferrer.org** (que usa **Divi**),
preservando el contenido antiguo (pasándolo a borrador, sin borrar nada).

## 2. Estado actual (qué hay hecho)
- Diseño y contenido **finalizados** como un **bloque HTML autónomo** listo para Divi:
  - Archivo: **`web-personal/wordpress-kimi.html`**
  - Es la reimplementación estática del diseño de "Kimi" (Inter, coral `#ff6b4a`,
    tarjetas *bento*) con el **contenido real y verificado** del Dr. Ferrer.
- Repo: **`github.com/drraulferrer/Proyectos`**
  - Rama: **`claude/raulferrer-personal-website-xiv6we`**
  - PR abierto (borrador): **#6**
- También existe un prototipo alternativo multipágina "visión 360º" en
  `web-personal/paginas/` y `web-personal/wordpress/` (por si se quisiera esa versión).
  **La versión elegida para publicar es `wordpress-kimi.html`.**

## 3. Cómo publicar en WordPress (pasos para la sesión con MCP)
El conector MCP se llama **`wordpress-rf`** (WordPress MCP Adapter, auth por
Application Password; ya funciona tras activar `CGIPassAuth on` en el `.htaccess`
del hosting **TMDHosting/LiteSpeed**).

1. **Copia de seguridad primero**: WordPress → Herramientas → Exportar → Todo (XML).
2. Confirmar que el MCP puede **crear páginas y cambiar su estado** (no solo leer).
3. **Inventariar** páginas y entradas actuales (guardar en un archivo). **No borrar nada.**
4. **Pasar a BORRADOR** las páginas publicadas actuales (dejar el blog/entradas como están).
5. Crear una **página nueva "Inicio"** con el contenido de
   **`web-personal/wordpress-kimi.html`** dentro de un **módulo "Código" de Divi**
   (o un bloque HTML), con **plantilla en blanco / ancho completo**, en **BORRADOR**.
6. **Subir la foto** (ver §5) a la biblioteca de medios y sustituir en el HTML el
   `src="assets/foto.jpg"` por la URL real de la foto en WordPress.
7. Dar el **enlace de vista previa** para revisión **antes** de ponerla como portada.
8. Cuando esté aprobada: Ajustes → Lectura → Página de inicio → esta página.

> Importante: la página debe usar **plantilla en blanco/ancho completo** porque el
> bloque ya trae su propia cabecera (nav) y pie; así no se duplican con los del tema.

## 4. Decisiones de contenido y posicionamiento (ya tomadas)
- **Titular (hero):** *"Una fisioterapia que conecta clínica, conocimiento y gestión."*
  (como lead; el H1 es "Dr. Raúl Ferrer Peña").
- **Idea de marca:** visión 360º — "un núcleo, múltiples direcciones". El logo son
  flechas en todas las direcciones (movimiento), de forma **implícita**, no como eslogan.
- **Ámbitos ("Un perfil, cuatro direcciones"):** Academia · Clínica · Investigación ·
  Gestión. Dentro de ellos se recogen: educación bioconductual, salud digital, MBA y la
  **coordinación de la asignatura de Gestión de Proyectos de Salud Digital**.
- **Correcciones aplicadas** (peticiones del usuario):
  - Docencia de **posgrado** en el Máster de Salud Digital y fisioterapia bioconductual.
  - **Eliminada** la sección "Consulta" clínica y el botón "Consulta online".
  - **Retirado #BlackSheep** (proyecto cerrado).
- **Méritos verificados:** Doctor cum laude (URJC), MBA, Profesor Titular (La Salle/UAM),
  +20 años de trayectoria, +15 en Atención Primaria, +10.000 pacientes, Cruz de Honor de
  Plata (2019), expresidente de Fisioterapia Sin Red, delegado en el Grupo de Salud
  Comunitaria del Ministerio de Sanidad.
- **Publicaciones:** reales, indexadas en PubMed (autor `Ferrer-Peña R`). Búsqueda:
  https://pubmed.ncbi.nlm.nih.gov/?term=Ferrer-Pe%C3%B1a+R%5BAuthor%5D&sort=date
- **Contenido de "Kimi" conservado** (es del propio Raúl): ORCID
  `0000-0001-5495-8458`, grupo INDOCLIN, Comisión de Calidad URJC (2023), 2 sexenios
  CNEAI, Marco de Competencias en Gestión, Modelo GAP, libros SED/SEDTECH, etc.
  *(Si algún dato no fuera exacto, el usuario debe confirmarlo/ajustarlo.)*

## 5. Pendiente de aportar/afinar
- **Foto de Raúl:** el usuario la subió al chat pero NO llegó como archivo accesible.
  Hay que **subirla a la biblioteca de medios de WordPress** y poner su URL en el hero
  (`src="assets/foto.jpg"` → URL real). Mientras, el hero muestra un marcador "RF".
- **Logo vectorial optimizado:** el `logo nuevo rf.svg` (en Google Drive del usuario) es
  un PNG incrustado en SVG; hace falta un vector limpio + variantes (horizontal, símbolo,
  monocromo, claro/oscuro, favicon). El bloque usa ahora una versión SVG del monograma RF.
- **Enlaces reales:** LinkedIn y ResearchGate (ahora `#`).
- **Confirmar datos** de §4 si procede.

## 6. Contexto técnico útil
- **Hosting:** TMDHosting (cPanel + LiteSpeed). El fix clave para el MCP fue añadir
  `CGIPassAuth on` al principio del `.htaccess` de `public_html` (LiteSpeed se comía la
  cabecera `Authorization`).
- **Claude Code** instalado en el Mac del usuario (Node 24, `npm i -g @anthropic-ai/claude-code`).
- **Este entorno web** NO puede alcanzar raulferrer.org (política de red) ni tiene el MCP
  de WordPress; por eso la publicación la hace la sesión del terminal.

## 7. Cómo copiar el bloque
Ver el archivo en GitHub y usar "Copy raw file":
`https://github.com/drraulferrer/Proyectos/blob/claude/raulferrer-personal-website-xiv6we/web-personal/wordpress-kimi.html`

---
*Generado como traspaso de sesión. Fecha de referencia: julio de 2026.*
