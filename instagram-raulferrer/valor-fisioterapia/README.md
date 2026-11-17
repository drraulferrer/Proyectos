# @_raulferrer · ¿Cuánto vale lo que sabes?

Carrusel de Instagram de 9 páginas (1080 × 1350, 4:5) para la cuenta personal @_raulferrer, con la identidad visual de raulferrer.org (repositorio `web-raulferrer`, clases `.rfw`):

- Tinta `#171310`, naranja del logotipo `#FD6242` (superficies y texto grande), naranja oscurecido `#BA4830` (texto pequeño, 5,18:1 sobre blanco), crema `#F6F1E7`, línea `#E3D8C5`, gris cálido `#786D5E`.
- Archivo para todo el texto (800 en titulares, interletrado ajustado) e Instrument Serif en cursiva naranja para la palabra de acento, como «Fisioterapia con *visión 360º*».
- Antetítulo en mayúsculas espaciadas, tarjetas blancas con borde fino y esquinas de 26 px, números en contorno y botones en píldora.
- Sin foto ni cabecera de marca: la cuenta ya identifica al autor. El logotipo RF en negativo aparece solo en la última página, pequeño.
- Redacción en llano y en primera persona, revisada contra la guía de Wikipedia «Signs of AI writing»: sin paralelismos negativos («no es X, es Y»), sin planteamiento y giro, sin listas con etiqueta en negrita, sin emojis numerados y con titulares que dicen algo concreto.

## Qué hay

| Ruta | Qué es |
|---|---|
| `salida/01-s1.png` … `09-s8.png` | Las 9 páginas listas para subir (el número del nombre es el orden) |
| `datos/convenios-2026.csv` | Datos de la comparativa entre convenios (página 3), con fuente y nivel de verificación de cada fila |
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

## Comparativa entre convenios (página 3)

Métrica: retribución anual de tabla de 2026 para un fisioterapeuta sin antigüedad, es decir, salario base y pluses fijos de convenio multiplicados por el número de pagas. No incluye antigüedad, pluses por turnos, nocturnidad ni transporte. Se compara con el SMI anunciado para 2027 en cómputo anual (1.286 € × 14 = 18.004 €).

| Territorio | Ámbito | Base mensual | Pagas | Anual de tabla | Verificación |
|---|---|---|---|---|---|
| Cataluña | autonómico | 2.155,65 € | 14 | 30.179,10 € | Secundaria: resumen que cita el DOGC 9719 (30/07/2026) |
| Cantabria | autonómico | 1.678,07 € (derivado) | 14 | 23.493,00 € | Secundaria: agregador que cita el BOC |
| Jaén | provincial | 1.433,33 € | 15 | 21.500,00 € | Tabla del BOP n.º 70 (13/04/2026) citada literalmente |
| Aragón | autonómico | 1.370,19 € + plus convenio | 14 | 20.085,47 € | Oficial: BOA n.º 109 (10/06/2025), anexo 2, leído |
| Madrid | autonómico | 1.424,25 € (tabla A) | 14 | 19.939,50 € | Oficial: texto del convenio 2023-2026, anexo IV, leído |
| A Coruña | provincial | 1.328,76 € | 15 | 19.931,40 € | Secundaria, coincidente en dos fuentes (BOP 22/10/2024) |
| Asturias | autonómico | 1.308,77 € | 15 | 19.631,55 € | Oficial: BOPA n.º 50 (13/03/2026), leído |
| Huelva | provincial | 1.377,14 € | 14 | 19.280,00 € | Secundaria: agregador que cita el BOP n.º 77 (23/04/2026) |

Quedan fuera: Valladolid (acuerdo de julio de 2026 pendiente de firma), Sevilla (convenio prorrogado sin tabla 2026 localizada), Comunidad Valenciana (no se localizó la tabla del convenio de establecimientos sanitarios), Cádiz (tercera paga condicionada a conciertos con el SAS) y País Vasco (sin convenio sectorial vigente). En Madrid, la tabla B (empresas que suprimieron el complemento de antigüedad) da 1.449,08 € mensuales, 20.287,12 € al año.
