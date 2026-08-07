# Guía de estilo visual — Serie «Los Big Five»

Sistema visual **negro, naranja y blanco** para infografías científicas de Instagram.
Este archivo es la fuente única de verdad: si cambia un valor aquí, hay que propagarlo a
todos los prompts de `prompts/`.

---

## 1. Formato

| Parámetro | Valor |
|---|---|
| Relación de aspecto | 4:5 |
| Resolución | 1080 × 1350 px |
| Márgenes de seguridad | 72 px laterales, 64 px superior e inferior |
| Tamaño mínimo de texto | 15 px reales (referencias); 18 px cuerpo |

Todo el texto debe ser legible en pantalla de teléfono móvil sin ampliar.

## 2. Paleta estricta de tres colores

| Rol | Nombre | Hex |
|---|---|---|
| Tinta / fondo invertido | Negro tinta | `#0B0B0B` |
| Fondo principal | Blanco cálido | `#FAF7F2` |
| Acento único | Naranja señal | `#F26B0F` |

**Derivados permitidos** (solo neutros del negro y tintes del naranja):

| Uso | Hex |
|---|---|
| Texto secundario | `#2B2B2B` |
| Texto terciario / pies | `#6F6F6F` |
| Líneas finas y separadores | `#D8D4CE` |
| Superficie de recuadro | `#FFFFFF` |
| Tinte anatómico medio | `#F9A85F` |
| Tinte anatómico suave | `#FCDCBC` |

**Prohibido**: azul, turquesa, verde, amarillo, coral, morado, degradados multicolor,
sombras de color, efectos 3D, brillos, texturas fotográficas.

## 3. Reparto de fondo dentro de la serie

- **Portada y cierre**: fondo negro `#0B0B0B`, texto blanco, acentos naranja.
- **Las cinco infografías de patrón**: fondo blanco cálido `#FAF7F2`, texto negro,
  acentos naranja. El texto denso se lee mejor en claro.
- El vínculo visual entre unas y otras lo dan la banda de título, el naranja y la retícula.

## 4. Tipografía

- Familia sans serif neogrotesca o geométrica moderna (tipo Inter, Söhne, Neue Haas Grotesk).
- Título principal: mayúsculas, peso 800, tracking ligeramente negativo.
- Subtítulo: peso 400, gris `#2B2B2B` sobre claro o `#D8D4CE` sobre negro.
- Titulares de bloque: mayúsculas, peso 700, tamaño pequeño, tracking amplio (+0,08 em).
- Cuerpo: peso 400, interlineado 1,45.
- Sin cursivas decorativas, sin tipografías con remates, sin texto en arco o distorsionado.

## 5. Elementos recurrentes de la serie (identidad)

1. **Banda superior**: franja negra a sangre con el título en blanco y la palabra clave
   en naranja. En portada y cierre la franja ocupa el tercio superior.
2. **Etiqueta de serie**: `BIG FIVE · SI SOLO PUDIERA ELEGIR UNO` en 14 px, mayúsculas,
   tracking amplio, color naranja, sobre la banda superior. En portada y cierre, donde no
   hay banda de título, la marca aparece como antetítulo (`SI SOLO PUDIERA ELEGIR UNO…` /
   `LOS BIG FIVE · CIERRE DE LA SERIE`).
3. **Numerador**: `PATRÓN 01 / 05` arriba a la derecha, naranja, tamaño pequeño. Solo en
   las cinco piezas de patrón; portada y cierre no lo llevan.
4. **Regla de acento**: línea naranja de 4 px de alto y 120 px de ancho bajo el título.
5. **Retícula modular**: bloques separados por líneas de 1 px `#D8D4CE`, nunca por cajas
   con sombra.
6. **Iconografía**: lineal, trazo de 2 px negro, un único detalle naranja por icono.
   Sin relleno, sin iconos infantiles ni emojis.
7. **Ilustración anatómica**: vectorial semirrealista, contorno negro de 1,5 px, relleno
   blanco; el segmento o musculatura en foco se resalta con `#F9A85F` o `#FCDCBC`.
   Nunca colorear más de tres zonas a la vez.
8. **Banda destacada (cita)**: fondo negro, texto blanco, comilla tipográfica en naranja
   a la izquierda.
9. **Recuadro de variables**: fondo blanco, borde naranja de 1,5 px, título en negro,
   ítems separados por barras verticales `|` en naranja.
10. **Pie de referencias**: fondo `#F1EDE7`, texto `#6F6F6F` de 15 px, numeración naranja.

## 6. Reglas de contenido no negociables

- No inventar referencias, DOI, años ni autores. Los DOI se copian literalmente.
- No añadir porcentajes, cifras de eficacia ni datos cuantitativos no proporcionados.
- No afirmar superioridad de un ejercicio sobre otro.
- No presentar las progresiones como secuencias obligatorias o universales.
- No usar códigos visuales alarmistas: cruces rojas, columnas dañadas, señales de peligro,
  rayos de dolor, caras de sufrimiento.
- No usar lenguaje de corrección postural, protección de la espalda ni estabilización
  segmentaria.
- Ortografía española correcta, con tildes y signos de apertura (`¿` `¡`).

## 7. Estética que hay que evitar explícitamente

Gimnasio comercial, culturismo, fotografía deportiva agresiva, publicidad de suplementos,
render 3D, fondos oscuros con neón, estética fitness de redes, ilustración infantil,
collage, stock photo.

---

## 8. Bloque de estilo reutilizable

Este párrafo se pega tal cual en cualquier prompt nuevo de la serie:

> Estética editorial científica premium, inspirada en las infografías de revistas
> biomédicas de alto impacto: diseño limpio, elegante, académico y contemporáneo, con
> mucho espacio en blanco, líneas finas, flechas discretas y excelente jerarquía visual.
> Paleta estricta de tres colores: negro tinta `#0B0B0B`, blanco cálido `#FAF7F2` y
> naranja señal `#F26B0F`. Se permiten únicamente derivados neutros del negro para grises
> tipográficos y de línea (`#2B2B2B`, `#6F6F6F`, `#D8D4CE`) y dos tintes del naranja para
> el sombreado anatómico (`#F9A85F`, `#FCDCBC`). No utilizar azul, turquesa, verde,
> amarillo, coral ni ningún otro color. Tipografía sans serif moderna. Ilustraciones
> médicas vectoriales semirrealistas y anatómicamente correctas, con contorno negro fino
> y resaltado naranja solo en la zona en foco. Evitar estética de gimnasio comercial,
> culturismo, fotografía deportiva, efectos 3D, fondos con degradados y estética fitness.
