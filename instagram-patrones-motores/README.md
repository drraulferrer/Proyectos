# Serie de Instagram — «Los Big Five»

Serie de siete piezas sobre los patrones motores con mejor relación beneficio–versatilidad:
cuatro por región corporal y uno de cuerpo completo. Contiene los prompts de generación de
imagen, la guía de estilo visual y los textos de publicación.

## Contenido

| Archivo | Qué es |
|---|---|
| [`00-guia-estilo.md`](00-guia-estilo.md) | Sistema visual negro–naranja–blanco: paleta, tipografía, retícula y elementos recurrentes |
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

- **Paleta.** Los prompts originales pedían una paleta biomédica multicolor (azul petróleo,
  turquesa, verde, mostaza, coral). Se ha sustituido por el esquema **negro, naranja y
  blanco** de las publicaciones anteriores, que es lo solicitado. Toda referencia a otros
  colores se ha eliminado y se ha añadido una prohibición explícita en cada prompt, porque
  los generadores tienden a reintroducir color si no se les cierra la puerta.
- **Fondos.** Portada y cierre van en negro; las cinco infografías de patrón, en blanco
  cálido. El texto denso se lee mucho mejor en claro, y la inversión de las piezas de
  apertura y cierre es un recurso editorial habitual que refuerza la serie en lugar de
  romperla. Si prefieres las siete en negro, basta con invertir la sección de fondo de cada
  prompt y cambiar el color del cuerpo de texto.
- **Identidad de serie.** Banda superior negra, etiqueta `BIG FIVE · SI SOLO PUDIERA ELEGIR
  UNO`, numerador `PATRÓN 0X / 05` y regla naranja bajo el título. Son los elementos que
  hacen que las siete piezas se lean como una sola cosa. La portada convierte «Los Big
  Five» en título principal y deja «Si solo pudiera elegir uno…» como antetítulo.
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
