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
- **20 páginas** en total → **múltiplo de 4**, requisito de la grapa.
- **Sin marcas de corte ni de registro.**
- **Fuentes incrustadas** (no trazadas a curvas); tamaño mínimo usado ≥ 8 pt
  (mínimo admitido 6 pt).
- **Trazos vectoriales** ≥ 0,6 pt (mínimo admitido 0,25 pt).
- Contenido **vectorial** (texto y formas): resolución independiente, sin
  imágenes rasterizadas (equivale a > 300 dpi).

### Orden de las 20 páginas

1. Portada (Paincorp)
2. Bienvenida
3. Mis datos + Mis objetivos
4–19. Sesiones 1 a 16 (una página por sesión)
20. Contraportada (Paincorp)

## Identidad de marca (Fundación Paincorp)

Colores corporativos aplicados a portada, contraportada y cabeceras:

| Color | HEX | RGB | CMYK |
|-------|-----|-----|------|
| Tinta | `#1d1f21` | 29, 31, 33 | 79, 67, 59, 78 |
| Turquesa | `#0db1a4` | 13, 177, 164 | 74, 0, 43, 0 |
| Azul grisáceo | `#b8cfd8` | 184, 207, 216 | 33, 11, 14, 0 |
| Blanco | `#ffffff` | 255, 255, 255 | 0, 0, 0, 0 |

Logotipo oficial *Fundación Paincorp* (a partir del vectorial `.ai` facilitado),
incrustado en dos versiones:

- `assets/logo-fundacion-paincorp-negativo.png` — texto blanco + tick turquesa,
  para la **portada** (fondo oscuro).
- `assets/logo-fundacion-paincorp.png` — texto tinta + tick turquesa, para la
  **contraportada**.

Otros elementos: patrón de cuadrados en diagonal y lema *«Innovación para una
vida sin dolor»*. La contraportada es **genérica** (se ve desde el primer día):
marca, lema, disciplinas y una cita, sin mensajes de cierre.

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
