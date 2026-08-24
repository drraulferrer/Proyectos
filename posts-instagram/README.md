# posts-instagram

Textos, guiones e imágenes de los carruseles para Instagram (@drraulferrer).
Cada post vive en su propia carpeta `AAAA-MM-slug/`, con la misma estructura,
que replica la plantilla usada hasta ahora:

- **Origen de la plantilla**: Notion → *REDES SOCIALES* → base de datos
  *Post Queue* → página tipo *Instagram Post*, con tres bloques: `Checklist`
  (crear contenido / escribir caption / programar), `Caption` y huecos de
  imagen (`Image 1`…`Image 6`).
- **Formato gráfico**: carrusel 1080 × 1350 px (4:5), como los carruseles
  previos en Canva; versión story 1080 × 1920 px si se reaprovecha.

## Contenido de cada carpeta

| Archivo | Para qué sirve |
|---------|----------------|
| `post-final.md` | Texto largo definitivo del que se cortan las diapositivas y el caption. Sirve también para blog o LinkedIn. |
| `copy-caption.txt` | Pie del post en texto plano, listo para copiar y pegar. |
| `copy-primer-comentario.txt` | Fuentes, para publicar como primer comentario. |
| `textos-alt.txt` | Texto alternativo de cada imagen. |
| `guion-carrusel.md` | Checklist de publicación, arco narrativo y qué lleva cada diapositiva. |
| `imagenes/` | Los PNG del carrusel, numerados en orden de publicación. |
| `generar-imagenes.js` | Regenera los PNG desde el propio script (Node + Playwright). |

Para volver a generar las imágenes tras editar un texto:

```bash
cd posts-instagram/<carpeta-del-post>
node generar-imagenes.js
```

El script descarga las tipografías (Inter y Source Serif 4) a `.fuentes/` la
primera vez y las incrusta en el HTML antes de capturar cada diapositiva.

## Índice

| Fecha | Post | Estado |
|-------|------|--------|
| 2026-08 | [Academic slop](2026-08-slop-academico/) | Listo para publicar |
