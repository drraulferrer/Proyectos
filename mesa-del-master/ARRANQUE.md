# Crónicas D&D: documento de arranque

Guía para retomar el proyecto en una sesión nueva sin releer el historial.

## Qué es

Un gestor de campañas de D&D 5.5 para un máster novato, en una sola página web sin servidor. Lleva historias, personajes, combate, mapas con figuras, reglas y un máster IA que puede dirigir la partida.

## Dónde está

| Qué | Dónde |
|---|---|
| Código | `mesa-del-master/index.html` en `drraulferrer/Proyectos`, rama `main` |
| Imágenes de portada | `mesa-del-master/img/*.jpg` |
| Retratos de PNJ | `mesa-del-master/img/npc/*.jpg`, dieciséis arquetipos |
| Retratos de criaturas | `mesa-del-master/img/mon/*.jpg`, uno por criatura del bestiario base |
| Web pública | https://drraulferrer.github.io/Proyectos/mesa-del-master/ |
| Copia dentro de Claude | https://claude.ai/artifact/LV8tHg1fo16eHC65Rf19rd |
| Despliegue | `.github/workflows/pages.yml`, publica al fusionar en `main` |

Todo el código vive en `index.html`: estilos, HTML y un único `<script>`. No hay dependencias que instalar ni paso de compilación.

## Las dos copias

La web de GitHub y la página dentro de Claude comparten el mismo código, pero no se comportan igual.

| | Web de GitHub | Página en Claude |
|---|---|---|
| Motor de IA | Cualquiera compatible con la API de OpenAI (Ollama, LM Studio, OpenRouter, Groq) | Solo Claude |
| Guardado | `localStorage` e IndexedDB del navegador | Base de datos de la página, privada del dueño |
| Mapas por enlace de Drive | Sí | No, solo desde archivo |
| Explorador de carpetas de Drive | Sí, con clave de API de Google | No |
| Voz | Navegador o ElevenLabs | Voz de Claude |
| Mapa en otra pestaña | Sí | No |

El código detecta dónde está con `inArtifact` (existe `window.claude.use`) y oculta lo que no aplica.

Para republicar la copia de Claude hay que quitar al archivo la primera línea, que es el envoltorio `<!doctype html>…<body>`, y el cierre `</body></html>`. La página de Claude se publica sin ese envoltorio, con las imágenes como archivos adjuntos y con las capacidades `db` (regla `mesa` solo para el dueño), `sample` con imágenes y `tts`.

## Apartados

- **Panel**: indicadores, historia en marcha, próxima sesión, actividad y personajes en mesa.
- **Historias**: tarjetas, generador de historia completa con IA y detalle con capítulos, misiones, PNJ, criaturas propias, sesiones y notas del máster.
- **Personajes**: tarjetas editables, experiencia, guía de subida de nivel e importador desde el PDF o una captura de D&D Beyond.
- **Combate**: modo manual y modo automático, que monta el encuentro, tira iniciativa, resuelve los monstruos y las salvaciones contra muerte, y lleva un registro. Incluye conjuros (lista `SPELLS`), espacios de conjuro, enfrentamientos visibles, botín y experiencia al ganar, y vista a pantalla completa o en otra pestaña.
- **Criaturas**: retratos del bestiario base, foto propia por criatura, y alta desde una foto de un manual leída por una IA con visión. Se muestran en «Combate» y se amplían al pulsarlas.
- **Mapa**: selector, imagen desde archivo o Drive, cuadrícula, figuras con retrato, regla, plantillas de efectos, niebla de guerra, líneas de enfrentamiento, pantalla completa y pestaña aparte.
- **Máster IA**: copiloto, narrador y autónomo; lectura en voz alta; motor y voz configurables.
- **Retratos a medida**: criaturas propias y personajes tienen un campo de aspecto y un botón «Generar imagen», que redacta un prompt en el estilo del bestiario para pegarlo en un generador externo y subir el resultado. Los retratos de personajes se ven en tarjetas, Panel, combate y mapa.
- **Ambiente**: seis ambientes sonoros sintetizados con Web Audio, sin archivos de audio.
- **Copia de seguridad**: en el Panel, descarga y restauración de toda la campaña.
- **Reglas**: chuleta, estados y guía para la primera sesión.

## Cómo se conectan las piezas

- La **historia en mesa** es la última abierta. El combate, el mapa y el máster IA trabajan sobre ella y sobre sus personajes.
- El máster IA recibe en cada llamada un texto de contexto, construido por `iaCtx()`: historia, capítulos con su mapa, PNJ, misiones, personajes, combate, registro del combate, mapa en pantalla y notas.
- La IA controla el panel con marcas al final de su respuesta, que se ocultan al mostrar el texto:
  - `[MAPA: nombre]` carga un mapa.
  - `[COMBATE: criatura x cantidad]` lanza el combate automático.
  - `[COLOCAR: Nombre=columna,fila; …]` coloca figuras.
  - `[AMBIENTE: nombre]` cambia el sonido de fondo.
- Cada capítulo puede tener un mapa asignado, que se carga al ponerlo «en curso».
- Cada historia guarda su propia narración. `iaBind()` la intercambia al cambiar de historia.

## Estado guardado

Un único objeto `S`, saneado por `norm()`:

- `stories[]`: `title`, `desc`, `status`, `cover`, `mapId`, `chapters[]` (`title`, `note`, `st`, `map`, `mapHint`), `npcs[]`, `quests[]`, `mons[]`, `sessions[]`, `notes[]`, `next`, `live`.
- `party[]`: personajes, con `story` y `status`.
- `combat`: `list[]`, `round`, `turnId`, `auto`, `log[]`, `over`, `byIA`.
- `maps[]`: `name`, `desc`, `src`, `w`, `h`, `cell`, `ox`, `oy`, `tokens[]`, `fx[]`.
- `ia`: `mode`, `log[]`, `summary`, `sid`.
- `activity[]`, `checks`.

Las preferencias de cada dispositivo van aparte en `localStorage`: motor de IA, voz, dados, explicaciones y pantalla de jugadores. Las imágenes subidas van en IndexedDB.

## Cómo trabajar

1. Editar `mesa-del-master/index.html`.
2. Comprobar la sintaxis del script con `node --check` sobre su contenido.
3. Probar en Chromium con Playwright, sirviendo la carpeta en local y simulando el motor de IA con `page.route`. Los guiones de prueba de sesiones anteriores no están en el repositorio.
4. Publicar: rama `claude/…`, PR, fusionar en `main`. La web se actualiza sola en un minuto.
5. Republicar la copia de Claude con el mismo contenido.

## Decisiones tomadas

- **Nada con derechos de autor en el repositorio.** El repositorio y la web son públicos. Los mapas del pack comprado se cargan desde Drive en cada navegador y no se copian. Las aventuras y manuales no se vuelcan: el usuario pega su texto o elige sus páginas y el resultado se queda en su navegador.
- **Ninguna clave en el código.** Las claves de IA, Google y ElevenLabs las escribe el usuario en la web y se guardan en su navegador.
- **Datos reales, no de muestra.** Los indicadores salen de lo que el usuario registra. La única historia de ejemplo, «La campana hundida», es original y va marcada como ejemplo.
- **Un solo tema, oscuro**, según el diseño «Crónicas» del usuario: Cinzel para títulos, Liter para texto, acento dorado.
- **Las cifras del bestiario son aproximadas** y editables. Conviene contrastarlas con el Manual de Monstruos.

## Límites conocidos

- El combate automático cubre ataques y diecinueve conjuros comunes. Rasgos de clase, concentración, estados de los conjuros, movimiento y alcance se resuelven a mano. Las salvaciones de los monstruos son una aproximación a partir de su iniciativa y su VD.
- La IA no ve los mapas salvo que el modelo tenga visión; trabaja con la descripción escrita de cada mapa.
- Un modelo pequeño puede escribir mal las marcas o devolver un JSON ilegible. El panel lo avisa y basta con repetir.
- La sincronía entre pestañas solo funciona en el mismo navegador.
- El importador de D&D Beyond se probó con un PDF de prueba, no con uno exportado de verdad.

## Servicios usados en las sesiones

Las claves quedaron guardadas en el entorno de la sesión, no en el repositorio: Kie.ai para generar portadas y retratos con el modelo `seedream/4.5-text-to-image`, y ElevenLabs para probar la voz.

## Ideas pendientes

- Probar con un PDF real de D&D Beyond y ajustar los nombres de campo.
- Rasgos de clase, concentración y estados en el combate automático.
- Monstruos que lanzan conjuros.
- Escalado de los trucos con el nivel.
- Encuentros con varios tipos de criatura.
- Que el combate tenga en cuenta distancias en el mapa.
- Vista propia para cada jugador en su móvil.
