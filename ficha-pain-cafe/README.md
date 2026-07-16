# Ficha del paciente · Pain Café

Ficha imprimible (A4, una página) para entregar a los pacientes del proyecto
de EPS (Educación Para la Salud) sobre **dolor crónico en Entrevías**, al
**final de la valoración**. Está pensada para graparse dentro del cuaderno del
paciente; la parte inferior es **recortable** para que se la lleve.

## Qué incluye

1. **En qué va a consistir la sesión** — formato Pain Café: grupo pequeño,
   ambiente de cafetería, ~60 min, café/té/infusiones, confidencialidad.
   (Una única sesión.)
2. **Preferencias de bebida** — casillas: café, descafeinado, té, infusión u
   otra; con leche y azúcar; alergias. El equipo lo anota en la valoración.
3. **Recortable (parte de abajo) · Photovoice** — recordatorio que el paciente
   se lleva: cómo preparar 1 o 2 fotos, aviso de que **se le escribirá una
   semana antes** y correo al que enviarlas:
   `raul.ferrer@salud.madrid.org`.

## Archivos

- `ficha-pain-cafe.html` — ficha autónoma. Ábrela en el navegador y pulsa
  **🖨️ Imprimir** (`Ctrl/Cmd + P`). Optimizada para **una página A4**
  (márgenes 12 mm); el botón de imprimir no sale en el papel.
- `ficha-pain-cafe.pdf` — versión lista para imprimir directamente.

## Personalizar antes de imprimir

La ficha deja huecos para rellenar a mano. Si quieres fijarlos, edita el HTML:

- Fecha, hora y lugar de la sesión Pain Café (pie de página).

Tras editar el HTML, regenera el PDF con Chrome/Chromium en modo *headless*:

```
chrome --headless=new --no-pdf-header-footer \
  --print-to-pdf=ficha-pain-cafe.pdf ficha-pain-cafe.html
```
