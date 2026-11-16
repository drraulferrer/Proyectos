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
- **Mapas a medida**: cada capítulo tiene «Generar mapa», que redacta un prompt de mapa cenital horizontal con el contexto de la historia; al subir el resultado se crea el mapa (`story` en el mapa), se asigna al capítulo y se carga al iniciar. El selector de mapas agrupa los de la historia en mesa.
- **Niebla con visión**: `fog.mode` vale `vision` (solo se ilumina lo que ven los personajes ahora y lo ya explorado queda en penumbra) o `memo` (todo lo descubierto queda iluminado).
- **Sesión 0**: cada historia guarda una introducción para jugadores (`zero`, `zeroDone`). «Iniciar historia» la muestra la primera vez, antes de empezar a jugar.
- **PNJ en el mapa**: cada PNJ puede tener un capítulo (`chap`) y la marca `follow`, «Acompaña al grupo». Su figura (`npc:<id>`) vive en un solo mapa. Al cambiar de mapa (`placeNpcs(s,true)`), solo aparecen los que acompañan al grupo y los del capítulo que aún no tienen figura y cuyo `where` coincide con ese lugar (`npcHere`); los demás se quedan donde estaban. Si la IA coloca a un PNJ con `[COLOCAR]`, su figura se muda a ese mapa. `npcWhere()` le dice a la IA dónde está cada uno. El botón «Colocar a los PNJ del capítulo» los trae todos a mano.
- **Ayudas para la mesa**: en «Máster IA», «Dar contexto» y «¿Qué podemos hacer?» responden solo con lo que los personajes ya saben (`pubCtx`), con respuesta de reserva si no hay motor de IA.
- **Lugares de la historia**: cada historia lleva una lista de lugares (`places`, con `title`, `mapHint` y `map`). El generador de historias la rellena y «Revisar qué mapas hacen falta» la completa con la IA. Si el máster IA lleva la escena a un lugar sin mapa, `needMap()` crea un tablero en blanco con las figuras y abre en «Máster IA» un panel para redactar el prompt y subir la imagen a ese mismo mapa.
- **Generación con Kie.ai**: en la web de GitHub, con la clave del usuario guardada en su navegador (`kieGen()`), los botones «Generar con Kie.ai» crean y colocan la imagen en criaturas, personajes, PNJ y mapas. La API y el servidor de imágenes admiten llamadas desde el navegador. No existe en la copia de Claude.
- **Figuras del mapa**: al pulsar una figura sale una etiqueta con su nombre y sus datos (`tokLines`); los jugadores ven solo lo público. Las figuras sueltas toman la imagen del personaje, PNJ o criatura con su mismo nombre. Los cofres (`isChest`) se dibujan como cofres, guardan un contenido y al abrirlos pasan al botín.
- **Catálogo**: lista propia `CAT` de objetos mágicos, pociones, tesoros, trampas y hallazgos, en el detalle de la historia. Los objetos van al botín y las trampas a las notas del DM.
- **Mis listados**: en «Reglas», el usuario carga sus hojas .xlsx o .csv (SheetJS desde cdnjs). Un glosario se busca por término; un índice de criaturas con nombre, tipo y VD permite añadirlas a la historia con cifras estimadas (`miEst`). Se guardan en IndexedDB, clave `lists`, y no van al repositorio.
- **Ficha completa**: cada personaje tiene `ab` (seis características), `sv`, `sk`, `speed`, `cast`, `spells` y `full`. «Calcular desde la ficha» (`sheetCalc`) rellena iniciativa, percepción pasiva, ataque, conjuros y espacios según clase y nivel.
- **Conjuros**: en combate salen los conjuros de la ficha (`spellPool`). Con espacios configurados, un nivel agotado bloquea sus conjuros hasta el descanso largo; el descanso corto recarga a los brujos. Los conjuros aplican estados (`setFx`, `CONDTXT`) que dan ventaja, desventaja o hacen perder turnos, con salvación al final de cada turno (`endSaves`). Los trucos escalan con el nivel.
- **Paso a paso**: con «Explicaciones» activas, el combate automático se para tras cada acción (`C.wait`, `waitHtml`) y explica cada tirada (`why`).
- **Tiradas guiadas**: el máster IA pide tiradas con `[TIRADA: personaje | prueba | CD]`; el panel las tira con el modificador de la ficha (`rollMod`) y le envía el resultado. «Quién actúa» antepone el nombre del personaje al mensaje y «Por turnos» hace hablar a los jugadores de uno en uno.
- **Monstruos con rasgo**: `monKit()` asigna a cada criatura, por su nombre, un rasgo propio del panel: aliento, agarre, veneno, derribo, regeneración, esconderse, frenesí, manada o aguantar al caer. `KITTXT` lo describe.
- **Moral**: `moraleCheck()` hace que un enemigo malherido, o que pierde a la mitad del grupo, tire una vez para no huir o rendirse (`c.fled`). Se apaga al montar el combate.
- **Objetivos**: `S.combat.goal` con `all`, `hold`, `task`, `guard` (añade un aliado `c.ally`) o `boss`. Se elige al montar el combate o lo pide la IA con `[OBJETIVO: …]`. `checkOver()` decide victoria y derrota.
- **Distancias**: con figuras en el mapa (`tokOf`), los monstruos avanzan hacia su objetivo (`reach`, `stepToward`) y el cuerpo a cuerpo exige estar al lado (`pcReach`). «Acercarse al objetivo» mueve la figura del personaje. `m.ter` guarda casillas de terreno difícil (`d`, cuesta el doble) y de cobertura (`c`, +2 a la CA contra ataques a distancia).
- **Concentración**: los conjuros de `CONC` se guardan en `c.conc`; recibir daño obliga a salvar CON (`concHit`) y lanzar otro termina el anterior.
- **Rasgos de clase**: `featList()` da los rasgos con usos (`p.feat`): furia, tomar aliento, acción súbita, imposición de manos, inspiración bárdica, expulsar muertos vivientes y ráfaga de golpes. Automáticos: ataque furtivo, ataque adicional a nivel 5 y castigo divino (`pcStrike`).
- **Monstruos que lanzan conjuros**: `casterOf()` reconoce por el nombre a lanzadores arcanos y divinos; `monCast()` decide entre curar a un aliado, inmovilizar, un conjuro de área, uno de daño o un truco, con un número de conjuros según su VD. Un personaje paralizado pierde el turno y repite la salvación. El bestiario base suma «Acólito oscuro», «Chamán goblin» y «Mago renegado», sin retrato.
- **Encuentros mixtos**: `buildEncounter()` acepta varios grupos. El combate automático mezcla un líder con secuaces (`mixPick`, se apaga con «Mezclar tipos de criatura») y la IA puede pedir varios tipos separados por comas en `[COMBATE: …]`.
- **Criatura personalizada**: en «Combate», «Añadir criatura», y en la historia, un cuadro de texto acepta las estadísticas pegadas de un creador externo; `monParse()` saca VD, PG, CA, iniciativa, ataque, daño y número de ataques sin IA. `rollF()` admite daño con varias partes, como `1d6+2+1d4`. Desde ese formulario se sube o genera la imagen; para guardarla, `mEnsure()` mete la criatura en `mons` de la historia en mesa.
- **Importador completo**: `sheetFromFields()` lee del PDF de D&D Beyond características, salvaciones y habilidades con competencia (las deduce comparando el bono con el modificador), velocidad, ataque, daño y conjuros; `sheetApply()` las vuelca en la ficha, también desde el JSON que devuelve la IA al leer una captura. Los nombres de campo siguen sin contrastarse con un PDF real.
- **Ataques de oportunidad y alcance**: `oppByFoes()` y `oppByHeroes()` resuelven el ataque gratis al alejarse de un enemigo contiguo con «Acercarse al objetivo»; arrastrar la figura a mano no lo provoca. `SPRNG` da el alcance de cada conjuro, 18 m si no figura.
- **Calibrador de dificultad**: `simRun(N)` juega el combate N veces sobre una copia del estado (`SIM`), con una táctica sencilla para los personajes (`simPc`), y `simTxt()` da el pronóstico. Se calcula al montar un encuentro automático y con «Calcular la dificultad»; «Quitar un enemigo» aligera el combate.
- **Muros**: casillas `w` en `m.ter`, pintadas con la herramienta «Muro» y ocultas a los jugadores. Bloquean el paso (`pathTo`, búsqueda de camino), la visión de la niebla (`losClear`, `fogLos`) y los disparos y conjuros.
- **Misiones como objetivo**: cada misión tiene `main` (una sola principal), `chap` (capítulo), `steps` (hitos `{id,x,done}`), `src` (`plan` si se planteó al crear la historia, `sesion` si surgió jugando) y `parent` (la planteada a la que sirve). El generador de historias ya pide misión principal, hitos y capítulo. `qObjectives()` las mete en `lead()` como prioridad narrativa, con el siguiente hito de cada una. La IA usa las marcas `[HITO: misión | logro]`, `[MISION: título | encarga | recompensa | sirve a: misión]`, `[MISION CUMPLIDA: título]` y `[MISION FALLIDA: título]`, que procesa `questsFromText()`; al cumplirla, la recompensa pasa al botín. `#q-live` las muestra en Máster IA y en la Mesa de juego.
- **Coherencia**: `storyCheck()` hace comprobaciones sin IA (misiones sin principal, sin hitos o sin capítulo; quien encarga una misión y no es PNJ; capítulos que no avanzan ninguna misión; PNJ sin papel; nombres casi iguales; criaturas demasiado fuertes; hechos que dicen que alguien murió). Se ven en la pestaña «Coherencia» de la historia con botones para arreglar. Ahí está también la revisión con IA (`cohReview()`, admite un modelo distinto en `-rmodel`) y el libro de hechos (`s.facts`), que se rellena con la marca `[HECHOS: …]` y entra en cada respuesta del máster. Durante la partida, `contCheck()` avisa en `#coh-live` de PNJ muertos que actúan, nombres nuevos y deriva respecto a la misión.
- **Qué hacer ahora**: `coach()` mira el estado (historias, grupo, motor de IA, Sesión 0, sesión en marcha, combate, tiradas pendientes, última respuesta del máster) y devuelve el siguiente paso con sus botones (`data-coach`); `coachAfter()` cubre el cierre (subir de nivel, fijar la próxima sesión). Se dibuja en el Panel, en Máster IA y en la barra de la Mesa de juego con las cuatro fases: Preparar, Sesión 0, Jugar y Cerrar. «Narraré yo» guarda la marca `-manual` en el navegador.
- **Objetos para los jugadores**: `hoShow()` pone en `S.show` un retrato de PNJ, una criatura, un objeto del botín, una nota o una imagen subida (IndexedDB, clave `ho-<id>`), y lo apunta en `s.hand`. La pestaña de jugadores lo enseña a pantalla completa (`#ho-view`). Se envía con «Enseñar» en PNJ, criaturas y botín, o con «Enseñar a los jugadores» en la Mesa de juego (`#ho-dlg`).
- **Protagonismo**: `S.spot` cuenta por mapa cuántas veces actúa cada personaje (al elegirlo en «Quién actúa» o pulsando su chapa). Avisa de quien apenas ha actuado y se lo dice al máster IA en `iaCtx()`.
- **Modo mesa** (`#mesa`): una pantalla para jugar. `route` se envuelve: con `#mesa` muestra Máster IA o Combate a la izquierda (`mesaSide()`, automático según haya combate) y el mapa a la derecha, con una barra de sesión (`#mesa-bar`, `mesaHtml()`) que marca Sesión 0, Jugar y Cerrar y permite cambiar de escena (`sceneGo()`: carga el mapa del lugar, coloca grupo y PNJ y elige ambiente por palabras clave). El combate que lanza la IA no saca del modo mesa.
- **Turno por acciones**: `turnHtml(c)` sustituye al turno largo. Cinco pestañas (Atacar, Conjuro, Moverse, Curar, Otra cosa) en `auState`, sugerencia de la acción más útil (`suggest()`), cifras en «Ajustar cifras», pronóstico como etiqueta (`simPill()`).
- **Ajustes de la auditoría**: deshacer siete segundos tras cualquier borrado (`#undo`, instantánea de `S`), personajes sin historia adoptados por la historia que se abre (`adoptParty()`), dados como botón flotante (`#dice-fab`), barra inferior en el móvil con menú «Más» (`#more-sheet`), aviso de motor de IA (`#ia-setup`) y botones agrupados, detalle de historia en pestañas (`SDT`, `sdApply()`), herramientas del mapa agrupadas, «Añadir criatura» plegado, ayudas plegadas, pantalla de jugadores en su propia pestaña (`#jugadores`, marca en `sessionStorage`) y pantalla de victoria en el escenario del combate.
- **Ambiente y efectos**: diez ambientes grabados en `snd/amb-*.mp3` y doce efectos en `snd/sfx-*.mp3`, todos CC0 de OpenGameArt (fuentes en `snd/CREDITOS.md`). `ambPlay()` los carga con Web Audio y los repite en bucle; si un archivo no carga, `ambSynth()` sintetiza el ambiente como antes. `sfx(nombre)` suena en dados, golpes, fallos, críticos, conjuros, curas, caídas y cofres; se apaga con «Efectos» en el menú.
- **Dado animado**: `diceFx()` muestra el dado rodando a pantalla completa con cualquier tirada. El mapa tiene un módulo «Dados» (`#map-dice`) que se ve también a pantalla completa, y cada tirada se transmite a las otras pestañas por `localStorage` (clave `-dado`).
- **Pronóstico visual**: `simObj()` guarda el resultado de la simulación en `S.combat.sim` y `simCard()` lo dibuja con anillo de victorias, escala de dificultad y tres cifras.
- **Escenario del combate**: en «Combate» a pantalla completa o en otra pestaña, `#cb-stage` enseña en grande al atacante y al objetivo con animación de impacto, fallo, crítico, conjuro o cura y la barra de PG cambiando. Los eventos (`S.combat.fx`, `fxn`) salen de `atkRoll`, `hurt` y `mend`. Las barras de PG de la lista también se animan.
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
  - `[TIRADA: personaje | prueba | CD]` pide una tirada que resuelve el panel.
  - `[OBJETIVO: aguantar 4 rondas | proteger a nombre | jefe | tarea]` fija el objetivo del combate siguiente.
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

- El combate automático cubre ataques y veintisiete conjuros comunes, con sus estados. Los rasgos de clase cubiertos son los más comunes de cada clase, no todos. Los muros son casillas enteras, no líneas finas, y el ataque de oportunidad solo salta al moverse con el botón del panel. Los espacios de conjuro llegan a nivel 3. Los rasgos de los monstruos son reglas simplificadas del panel, no las del manual. Las salvaciones de los monstruos son una aproximación a partir de su iniciativa y su VD.
- La IA no ve los mapas salvo que el modelo tenga visión; trabaja con la descripción escrita de cada mapa.
- Un modelo pequeño puede escribir mal las marcas o devolver un JSON ilegible. El panel lo avisa y basta con repetir.
- La sincronía entre pestañas solo funciona en el mismo navegador.
- El importador de D&D Beyond se probó con un PDF de prueba, no con uno exportado de verdad.

## Servicios usados en las sesiones

Las claves quedaron guardadas en el entorno de la sesión, no en el repositorio: Kie.ai para generar portadas y retratos con el modelo `seedream/4.5-text-to-image`, y ElevenLabs para probar la voz.

## Ideas pendientes

- Probar con un PDF real de D&D Beyond y ajustar los nombres de campo.
- Vista propia para cada jugador en su móvil.
- Muros finos entre casillas y puertas que se abren.
- Probar la coherencia con un modelo pequeño real: las marcas de misión y de hechos dependen de que el modelo las escriba bien.
