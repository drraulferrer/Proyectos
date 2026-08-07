# Maquetación en HTML → PNG

Genera las siete piezas de la serie a 1080 × 1350 px, listas para subir a Instagram.
El HTML es la fuente: permite comprobar en pantalla que el texto pequeño se lee antes
de exportar.

## Uso

```bash
npm install                 # solo la primera vez
python3 build.py            # genera dist/*.html
PW_CHROMIUM=/opt/pw-browsers/chromium-1194/chrome-linux/chrome node render.js
zip -j ../big-five-instagram.zip ../png/*.png
```

Abre `dist/index.html` para revisar las siete piezas en el navegador.

## Archivos

| Archivo | Qué hace |
|---|---|
| `kinetic.css` | El sistema Kinetic High-Contrast traducido a CSS: color, tipografía, retícula, tarjetas, bandas |
| `montserrat.css` + `fonts/` | Montserrat variable servido en local, sin depender de red |
| `figures.py` | Las 30 figuras humanas, generadas desde coordenadas articulares |
| `build.py` | El contenido de las siete piezas y el ensamblado del HTML |
| `render.js` | Captura a PNG y verifica desbordes y tamaños mínimos de texto |
| `dist/` | HTML generado (no versionado) |
| `../png/` | Los siete PNG finales, versionados |

## Verificación automática

`render.js` no solo captura: en cada pieza comprueba que

1. el contenido no desborda el lienzo de 1350 px, y
2. no hay ningún texto por debajo de 16 px.

Si algo falla lo imprime con un aviso. La salida esperada es «Sin avisos».

## Escala tipográfica

La plantilla de Stitch se compone en un contenedor de 480 px; el lienzo de Instagram
son 1080 px, así que el factor teórico es ×2,25. En la práctica estas piezas llevan
mucho más contenido que la plantilla original (seis figuras, cuatro tarjetas, recuadro
de variables, banda, conclusión y tres referencias), de modo que la escala real aplicada
es menor. Los tamaños finales sobre el lienzo:

| Rol | Tamaño |
|---|---|
| Título | 48 px |
| Título de bloque | 30 px |
| Titular de tarjeta | 25 px |
| Cuerpo | 22 px |
| Etiquetas y variables | 21 px |
| Notas de prudencia | 19 px |
| Referencias | 18 px |
| Pies de figura | 16 px |

El suelo son 16 px. En un móvil, con la imagen a ~400 pt de ancho, 18 px equivalen a
unos 6,7 pt: pequeño pero legible, y ampliable con zoom. Es el compromiso que permite
mantener las referencias completas dentro de cada pieza en lugar de relegarlas a una
diapositiva aparte.

## Nota sobre las referencias

En los PNG las citas usan la forma abreviada de Vancouver (primer autor + `et al.`)
para que quepan en dos líneas. Año, volumen, páginas y DOI se mantienen literales. La
forma completa, con todos los autores, está en los prompts de `../prompts/`.

## Las figuras

Se generan desde coordenadas articulares en `figures.py`, no son imágenes externas.
Cada pose es un diccionario de articulaciones (cabeza, cuello, hombro, codo, muñeca,
cadera, rodilla, tobillo) y una lista de segmentos a resaltar en naranja. Para cambiar
una postura basta mover un par de coordenadas.

Son figuras esquemáticas, no ilustración médica semirrealista. Si prefieres esa
ilustración, los prompts de `../prompts/` la describen para un generador de imagen; el
hueco donde encajaría es la tira de seis celdas.
