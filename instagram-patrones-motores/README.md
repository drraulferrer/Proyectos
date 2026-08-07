# Serie de Instagram — «Los Big Five»

Serie de siete piezas sobre los patrones motores con mejor relación beneficio–versatilidad:
cuatro por región corporal y uno de cuerpo completo. Contiene los prompts de generación de
imagen, la guía de estilo visual y los textos de publicación.

## Contenido

| Archivo | Qué es |
|---|---|
| [`00-guia-estilo.md`](00-guia-estilo.md) | Sistema Kinetic High-Contrast: paleta, tipografía, retícula, profundidad y elementos recurrentes |
| [`prompts/00-portada.md`](prompts/00-portada.md) | Portada de la serie (fondo negro) |
| [`prompts/01-sentadilla.md`](prompts/01-sentadilla.md) | Miembro inferior |
| [`prompts/02-push-up.md`](prompts/02-push-up.md) | Miembro superior |
| [`prompts/03-bisagra-de-cadera.md`](prompts/03-bisagra-de-cadera.md) | Cadera y raquis |
| [`prompts/04-flexion-craneocervical.md`](prompts/04-flexion-craneocervical.md) | Región cervical |
| [`prompts/05-carry.md`](prompts/05-carry.md) | Cuerpo completo / función global |
| [`prompts/06-mensaje-final.md`](prompts/06-mensaje-final.md) | Mensaje final de cierre (fondo negro) |
| [`textos-instagram.md`](textos-instagram.md) | Pies de foto, hashtags y textos alternativos |

## Cómo usarlo

1. Copia el contenido de un archivo de `prompts/` (el texto bajo la línea horizontal) y
   pégalo en el generador de imagen que uses.
2. Genera en 1080 × 1350 px. Revisa siempre el texto de la imagen resultante: los
   generadores deforman tildes, `¿` y DOI con frecuencia.
3. Publica como carrusel de siete diapositivas en el orden 00 → 06, o como siete
   publicaciones independientes.
4. Copia el pie de foto correspondiente desde `textos-instagram.md`.

## Decisiones de diseño

- **Sistema visual.** Las siete piezas usan **Kinetic High-Contrast**, importado del
  proyecto de Google Stitch *big five physio Layouts*: negro puro `#000000`, tarjetas de
  negro cálido `#171310`, naranja cinético `#FD6242`, crema `#F6F1E7` y Montserrat en
  exclusiva. Los prompts originales pedían una paleta biomédica multicolor (azul petróleo,
  turquesa, verde, mostaza, coral); se ha eliminado por completo y cada prompt lleva una
  prohibición explícita, porque los generadores reintroducen color en cuanto se les deja
  hueco. El turquesa `#5BD8E1` del sistema tampoco se usa: rompería el acuerdo de negro,
  naranja y blanco.
- **Fondos, todos oscuros.** Una versión anterior ponía las infografías densas sobre fondo
  claro por legibilidad. Se ha revertido: el sistema está construido para negro puro —de
  ahí que resuelva la profundidad con capas tonales y contornos en lugar de sombras— y
  mezclarlo con fondos claros lo desmontaba. La legibilidad se compensa con crema sobre
  negro (contraste muy alto), interlineado de 1,5 en el cuerpo y un mínimo de 16 px, con
  las referencias subidas desde los 12 px del sistema web.
- **Escala tipográfica.** Los tokens de Stitch están pensados para un contenedor web de
  1280 px. Se han multiplicado por ~1,37 para el lienzo de 1080 × 1350 px, que en un móvil
  se ve reducido a un tercio de su tamaño. El detalle está en la guía de estilo.
- **Identidad de serie.** Banda superior `#171310`, etiqueta `BIG FIVE · SI SOLO PUDIERA
  ELEGIR UNO`, numerador `PATRÓN 0X / 05` en píldora de borde naranja y barra naranja bajo
  el título. La portada convierte «Los Big Five» en título principal y deja «Si solo
  pudiera elegir uno…» como antetítulo.
- **Registro visual.** La referencia deja de ser «figura de *Nature Reviews* sobre blanco»
  y pasa a ser editorial de ciencia del deporte sobre negro. Cambia el registro; no cambian
  las reglas de rigor, que siguen intactas en cada prompt.
- **El carry en la retícula.** Es el único patrón que no corresponde a una región, así que
  en la portada ocupa una quinta fila a ancho completo bajo los otros cuatro, etiquetado
  como «cuerpo completo · función global».
- **Contenido.** Los textos, listados de variantes, bandas destacadas, advertencias y
  referencias se han mantenido literales, salvo la excepción documentada más abajo.

## Pendiente de revisar

### 1. Referencias del carry (resuelto, pero conviene que lo valides)

La lista de referencias del prompt original del carry no era verificable: una entrada de
blog comercial, dos citas sin año ni volumen que no aparecen indexadas y una revista,
*Sports Medicine Perspectives*, que no consta que exista. Como una de las reglas fijas de
la serie es no inventar referencias, el prompt lleva ahora tres citas verificadas en PubMed
con DOI comprobado. La lista original se conserva íntegra en un anexo al final de
[`prompts/05-carry.md`](prompts/05-carry.md), junto con el detalle de la comprobación.

### 2. Referencia incompleta en flexión craneocervical

La referencia 3 del prompt de flexión craneocervical (Rasmussen-Barr E, et al. BMC
Musculoskelet Disord. 2023) no incluye volumen, páginas ni DOI. Se ha dejado tal cual, sin
completarla ni inventar datos. Conviene verificarla antes de publicar.

### 3. Tensión entre el mensaje del carry y el cierre de la serie

El prompt del carry afirma que es «probablemente el patrón con mayor transferencia a la
vida diaria de toda la rehabilitación», mientras que la pieza de cierre recuerda que ningún
ejercicio ha demostrado superioridad general. Se ha respetado el texto original, pero si
prefieres evitar la contradicción dentro del mismo carrusel, una alternativa que conserva
la fuerza del titular sería:

> «Pocos patrones reúnen tanta transferencia a la vida diaria en una sola tarea.»
