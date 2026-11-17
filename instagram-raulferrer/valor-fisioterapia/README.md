# @_raulferrer · ¿Cuánto vale lo que sabes?

Carrusel de Instagram de 8 páginas (1080 × 1350, 4:5) para la cuenta personal @_raulferrer, con la identidad visual de raulferrer.org (repositorio `web-raulferrer`, clases `.rfw`):

- Tinta `#171310`, naranja del logotipo `#FD6242` (superficies y texto grande), naranja oscurecido `#BA4830` (texto pequeño, 5,18:1 sobre blanco), crema `#F6F1E7`, línea `#E3D8C5`, gris cálido `#786D5E`.
- Archivo para todo el texto (800 en titulares, interletrado ajustado) e Instrument Serif en cursiva naranja para la palabra de acento, como «Fisioterapia con *visión 360º*».
- Antetítulo en mayúsculas espaciadas, tarjetas blancas con borde fino y esquinas de 26 px, números en contorno y botones en píldora.
- Sin foto ni cabecera de marca: la cuenta ya identifica al autor. El logotipo RF en negativo aparece solo en la última página, pequeño.
- Redacción ajustada a la voz de los artículos del blog de raulferrer.org: concesión antes del giro («Técnicamente… Y, aun así…»), antítesis breves («es un suelo, no un techo») y pasos que se pueden dar sin esperar a nadie.

## Qué hay

| Ruta | Qué es |
|---|---|
| `salida/01-s1.png` … `08-s8.png` | Las 8 páginas listas para subir |
| `salida/02-la-distancia-animada.mp4` | Versión animada de la página 2 (9 s, H.264); sustituye a `02-s2.png` si se quiere un carrusel mixto |
| `texto-post.md` | Texto del post con llamada a la acción y etiquetas |
| `src/carrusel.html` + `src/marca.css` | Fuente de las 8 páginas |
| `animacion/` | Proyecto HyperFrames de la página 2 animada |

## Cómo regenerar

```bash
# PNG estáticas (Playwright)
node render.js src/carrusel.html salida 1

# Vídeo de la página 2 (HyperFrames 0.9.61)
cd animacion && npx hyperframes check && npx hyperframes render -q delivery -f 30 -o ../salida/02-la-distancia-animada.mp4
```

`render.js` hace una captura por cada `section.slide` y avisa si algún elemento se sale del lienzo.

## Notas de contenido

- Logotipo `logo-rf-neg.png` descargado de raulferrer.org.
- El gráfico de la página 2 empieza en cero a propósito: la cercanía visual entre ambas barras es el mensaje.
- Cifras: SMI 2027 de 1.286 € (14 pagas), propuesta anunciada el 17/11/2026 y pendiente de publicación en el BOE. Grupo IV del convenio de establecimientos sanitarios de Madrid, anexo IV, tabla 2026: 1.424,25 €. Diferencia 138,25 € (10,75 %).
