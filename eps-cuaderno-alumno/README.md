# Cuaderno del participante · A5 · Paincorp

Adaptación del **Cuaderno del participante** del programa de Educación para la
Salud (EPS) *«Educación Terapéutica Bioconductual con orientación al dolor»*
(Centro de Salud Entrevías · SERMAS) a **formato A5 con portada y contraportada
de Paincorp**, preparado para **encuadernación grapada** (saddle-stitch / punto
metálico) según la plantilla de Pixartprinting.

## Archivos

| Archivo | Descripción |
|---------|-------------|
| `Cuaderno-del-participante-A5-Paincorp.pdf` | **Archivo maestro.** PDF A5 con sangrado, vectorial y con fuentes incrustadas (RGB). |
| `Cuaderno-del-participante-A5-Paincorp-CMYK.pdf` | Variante en CMYK (conversión genérica, ver nota sobre Fogra 39). |
| `cuaderno-alumno-a5.html` | Fuente del maquetado (se regenera con `src/generate.mjs`). |
| `src/generate.mjs` | Genera el HTML con todo el contenido y el diseño. |
| `src/render.mjs` | Renderiza el HTML a PDF A5 con sangrado (Chromium/Playwright). |
| `src/build.sh` | Ejecuta todo el proceso: HTML → PDF RGB → PDF CMYK. |

## Especificaciones de impresión (encuadernación grapada, A5)

Tomadas de la plantilla y de las instrucciones de Pixartprinting (*«Encuadernación
grapada»* / *«Punto metálico»*):

- **Tamaño de corte (trim):** 148 × 210 mm (A5 vertical).
- **Documento con sangrado:** 154 × 216 mm (**3 mm de sangrado por cada lado**).
- **Área de seguridad:** 3 mm hacia dentro del corte (textos y logotipos quedan
  holgadamente dentro).
- **Páginas individuales, en orden de lectura** (no pliegos ni dobles páginas).
- **24 páginas** en total → **múltiplo de 4**, requisito de la grapa.
- **Sin marcas de corte ni de registro.**
- **Fuentes incrustadas** (no trazadas a curvas); tamaño mínimo usado ≥ 8 pt
  (mínimo admitido 6 pt).
- **Trazos vectoriales** ≥ 0,6 pt (mínimo admitido 0,25 pt).
- Contenido **vectorial** (texto y formas): resolución independiente, sin
  imágenes rasterizadas (equivale a > 300 dpi).

### Orden de las 24 páginas

1. Portada (Paincorp)
2. Página de título / créditos
3. Bienvenida
4. Mis datos + Mis objetivos
5. Registro de autoobservación
6–22. Sesiones 1 a 16 (la sesión 1 ocupa 2 páginas)
23. Notas
24. Contraportada (Paincorp)

## Nota sobre el color (CMYK / Fogra 39)

Las instrucciones piden **CMYK con perfil Fogra 39**. El archivo maestro está en
**RGB vectorial**, que la mayoría de imprentas (Pixartprinting incluido) aceptan
y convierten con el perfil correcto en su flujo de trabajo.

Se incluye además una variante `-CMYK.pdf` convertida con Ghostscript. Como en
este entorno no está disponible el perfil **Coated FOGRA39 (ISO 12647-2)**, esa
conversión usa el CMYK genérico de Ghostscript. Para una salida exacta en
Fogra 39, convierte el archivo maestro asignando ese perfil ICC en Acrobat Pro /
InDesign, o deja que la imprenta lo gestione.

## Regenerar

```bash
cd eps-cuaderno-alumno
bash src/build.sh
```

Requiere Node 22 con Playwright/Chromium y Ghostscript. El contenido de las
sesiones vive en `src/generate.mjs`; edítalo ahí y vuelve a ejecutar el build.
