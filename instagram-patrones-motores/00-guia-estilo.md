# Guía de estilo visual — Serie «Los Big Five»

Sistema **Kinetic High-Contrast**, importado del proyecto de Google Stitch
*big five physio Layouts*. Este archivo es la fuente única de verdad: si cambia un valor
aquí, hay que propagarlo a todos los prompts de `prompts/`.

---

## 1. Formato

| Parámetro | Valor |
|---|---|
| Relación de aspecto | 4:5 |
| Resolución | 1080 × 1350 px |
| Márgenes laterales | 64 px |
| Margen superior / inferior | 72 px / 56 px (asimétrico, ver §6) |
| Retícula | 12 columnas, medianil de 32 px |
| Espaciado | Múltiplos de 8 px, sin excepciones |
| Tamaño mínimo de texto | 16 px reales |

## 2. Carácter del sistema

Fusión de **alto contraste** y **minimalismo**. Fondo negro puro que deja «estallar» al
naranja de alta saturación. Tipografía grande y agresiva sobre una retícula rigurosa, con
mucho aire. La respuesta emocional buscada es foco, fuerza y calidad sin concesiones.

Traducido a esta serie: la referencia visual deja de ser «figura de *Nature Reviews* sobre
blanco» y pasa a ser **editorial de ciencia del deporte sobre negro**. Cambia el registro
visual; **no cambian las reglas de rigor** de §8.

## 3. Color

### Base

| Rol | Nombre | Hex |
|---|---|---|
| Nivel 0 · fondo | Negro puro | `#000000` |
| Nivel 1 · tarjetas y superficies | Negro cálido | `#171310` |
| Nivel 2 · bloques destacados | Negro cálido elevado | `#231F1C` |
| Acento primario | Naranja cinético | `#FD6242` |
| Acento profundo | Terracota | `#BA4830` |
| Texto de máximo contraste | Crema | `#F6F1E7` |

### Texto y línea

| Uso | Hex |
|---|---|
| Cuerpo de texto | `#EAE1DB` |
| Texto secundario | `#E2BFB7` |
| Texto terciario, notas al pie | `#A98A83` |
| Neutro apagado (bordes, elementos de baja jerarquía) | `#786D5E` |
| Borde de contorno tenue | `#5A413B` |

### Tintes para sombreado anatómico

| Intensidad | Hex |
|---|---|
| Foco | `#FD6242` |
| Media | `#FFB4A4` |
| Suave | `#FFDAD3` |

**Prohibido**: azul, turquesa, verde, amarillo, morado, degradados multicolor, sombras
proyectadas, efectos 3D, brillos, texturas fotográficas.

> El turquesa `#5BD8E1` existe en el sistema como color terciario, pero **no se usa en esta
> serie**: rompería el acuerdo de negro, naranja y blanco.

## 4. Tipografía

**Montserrat en exclusiva.** Jerarquía extrema: titulares en pesos pesados (800/900) con
tracking cerrado, al modo del editorial deportivo. Cuerpo con interlineado generoso para
evitar el efecto de halo sobre fondo oscuro. Etiquetas en mayúsculas con tracking abierto,
funcionando como anclas arquitectónicas de la composición.

Escala adaptada al lienzo de 1080 × 1350 px (×1,37 sobre la escala web del sistema):

| Rol | Tamaño | Peso | Interlineado | Tracking |
|---|---|---|---|---|
| Título principal | 88 px | 900 | 1,1 | −0,02 em |
| Título de bloque | 44 px | 800 | 1,2 | — |
| Titular de módulo | 32 px | 700 | 1,3 | — |
| Subtítulo | 26 px | 400 | 1,6 | — |
| Cuerpo | 22 px | 400 | 1,5 | — |
| Etiqueta / antetítulo (mayúsculas) | 19 px | 700 | 1,2 | +0,05 em |
| Referencias y pies | 16 px | 500 | 1,4 | — |

Ningún texto por debajo de 16 px. Sin cursivas decorativas, sin tipografías con remates,
sin texto en arco o distorsionado.

## 5. Profundidad

En un entorno de negro puro las sombras no funcionan. La profundidad se construye con
**capas tonales** y **contornos de bajo contraste**:

- **Nivel 0** — fondo: `#000000`.
- **Nivel 1** — tarjetas y superficies: relleno `#171310`, plano, sin sombra, borde de 1 px
  en `#786D5E` al 20 % de opacidad.
- **Nivel 2** — bloques destacados: relleno `#171310`, borde de 1 px en `#786D5E` al 40 % y
  un halo tenue de `#FD6242` al 5–8 % de opacidad.

Los elementos nunca cambian de elevación para indicar estado: cambian de color, del neutro
al naranja.

## 6. Forma y espaciado

Redondeo suave pero disciplinado, sobre el lienzo de 1080 px:

| Elemento | Radio |
|---|---|
| Tarjetas y contenedores grandes | 12 px |
| Chips, etiquetas, recuadros pequeños | 6 px |
| Píldoras y numeradores | completo |

Todo el espaciado en múltiplos de 8 px. **Padding asimétrico**: más aire arriba que abajo
(por ejemplo 32 px superior y 24 px inferior dentro de una tarjeta) para generar sensación
de impulso ascendente, que es la idea de «kinetic» del sistema.

## 7. Elementos recurrentes de la serie (identidad)

1. **Banda superior**: franja `#171310` a sangre con el título en crema `#F6F1E7` y la
   palabra clave en naranja `#FD6242`.
2. **Etiqueta de serie**: `BIG FIVE · SI SOLO PUDIERA ELEGIR UNO` a 19 px, mayúsculas,
   tracking +0,05 em, naranja, sobre la banda superior. En portada y cierre, donde no hay
   banda de título, aparece como antetítulo.
3. **Numerador**: `PATRÓN 01 / 05` arriba a la derecha, en una píldora de borde naranja de
   1 px. Solo en las cinco piezas de patrón.
4. **Regla de acento**: barra naranja de 6 px de alto y 120 px de ancho bajo el título.
5. **Tarjetas modulares**: nivel 1, planas, separadas por el medianil de 32 px. Nunca cajas
   con sombra.
6. **Iconografía**: lineal, trazo de 2 px en crema, un único detalle naranja por icono. Sin
   relleno, sin iconos infantiles ni emojis.
7. **Ilustración anatómica**: vectorial semirrealista, contorno crema de 1,5 px sobre el
   fondo negro, sin relleno; la musculatura o el segmento en foco se resalta con los tintes
   de §3. Nunca más de tres zonas coloreadas a la vez.
8. **Banda destacada (cita)**: relleno sólido naranja `#FD6242` con texto en negro
   `#000000` —el patrón de «máximo impacto» del sistema— y comilla tipográfica en negro.
9. **Recuadro de variables**: tarjeta de nivel 1, título en crema, ítems separados por
   barras verticales `|` en naranja.
10. **Pie de referencias**: tarjeta de nivel 1 a ancho completo, numeración en naranja,
    texto en `#E2BFB7` a 16 px.

## 8. Reglas de contenido no negociables

- No inventar referencias, DOI, años ni autores. Los DOI se copian literalmente.
- No añadir porcentajes, cifras de eficacia ni datos cuantitativos no proporcionados.
- No afirmar superioridad de un ejercicio sobre otro.
- No presentar las progresiones como secuencias obligatorias o universales.
- No usar códigos visuales alarmistas: cruces rojas, columnas dañadas, señales de peligro,
  rayos de dolor, caras de sufrimiento. **Cuidado especial**: el sistema tiene un color de
  error (`#FFB4AB`) muy próximo al naranja de marca. No usarlo nunca; el naranja aquí es
  acento editorial, jamás señal de peligro.
- No usar lenguaje de corrección postural, protección de la espalda ni estabilización
  segmentaria.
- Ortografía española correcta, con tildes y signos de apertura (`¿` `¡`).

## 9. Estética que hay que evitar explícitamente

El sistema nace de un contexto de «alto rendimiento atlético», y ahí está el riesgo: hay
que quedarse con su **energía tipográfica y su contraste**, no con su imaginería deportiva.
Evitar gimnasio comercial, culturismo, CrossFit, fotografía deportiva, esfuerzo extremo,
levantadores de élite, publicidad de suplementos, render 3D, neón, collage y stock photo.
El protagonista de las ilustraciones es siempre una persona adulta sana haciendo
entrenamiento terapéutico.

---

## 10. Bloque de estilo reutilizable

Este párrafo se pega tal cual en cualquier prompt nuevo de la serie:

> Sistema visual «Kinetic High-Contrast»: estética editorial de alto contraste y
> minimalismo, con la energía tipográfica del periodismo deportivo y el rigor de una figura
> de revisión científica. Fondo negro puro `#000000`. Los bloques se apoyan sobre tarjetas
> de negro cálido `#171310`, planas, sin sombra, con borde de 1 px en `#786D5E` al 20 % de
> opacidad y esquinas redondeadas de 12 px. Naranja cinético `#FD6242` como único acento de
> alta energía, y terracota `#BA4830` para variaciones tonales. Texto de máximo contraste en
> crema `#F6F1E7`, cuerpo en `#EAE1DB`, secundario en `#E2BFB7` y notas en `#A98A83`.
> Tipografía Montserrat en exclusiva: titulares en peso 900 u 800 con tracking cerrado
> (−0,02 em), etiquetas en mayúsculas de peso 700 con tracking abierto (+0,05 em).
> Retícula de 12 columnas, márgenes laterales de 64 px, medianiles de 32 px y todo el
> espaciado en múltiplos de 8 px, con padding asimétrico —más aire arriba que abajo— para
> dar sensación de impulso ascendente. Sin sombras proyectadas, sin degradados, sin efectos
> 3D. No utilizar azul, turquesa, verde ni amarillo. Ilustraciones médicas vectoriales
> semirrealistas de contorno crema fino sobre el fondo negro, con resaltado naranja
> únicamente en la zona en foco. Nada de gimnasio comercial, culturismo, fotografía
> deportiva ni esfuerzo extremo.
