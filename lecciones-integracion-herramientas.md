# Bitácora de herramientas

Qué hemos aprendido integrando diseño, datos y herramientas en los últimos proyectos — para arrancar el siguiente con menos dudas.

Compilado a partir de trece repositorios de `drraulferrer` (lectura directa más tres agentes de investigación en paralelo) el 23 de agosto de 2026. También publicado como [artefacto visual](https://claude.ai/code/artifact/ba069e39-0414-45c1-8250-682af6d7292b).

## El mapa

| Proyecto | Qué es | Datos | Acceso |
|---|---|---|---|
| `panel-claude` | Panel local con botones de un clic sobre Claude Code | 🟢 Sin backend | Público |
| `cuadro-mando-fisio-dase` | Cuadro de mando offline de fisioterapia AP + consulta diaria | 🟠 Local (dispositivo) | Público |
| `landing-eps-dolor-entrevias` | Landing del programa de educación en dolor crónico | 🟢 Sin backend | Público |
| `specs` | Especificaciones de producto de todo el portfolio | 🟢 Sin backend | Privado |
| `educacion-en-dolor` | Corpus fuente sobre dolor crónico (2.787 conceptos) | 🔴 Backend real (acotado) | Privado |
| `panel-educacion-en-dolor` | Marcador de estado del corpus, autopublicado | 🟢 Sin backend | Público |
| `constructor-educacion-en-dolor` | Generador de hoja de paciente personalizada | 🟢 Sin backend | Público |
| `validacion-educacion-en-dolor` | Panel Delphi de validación por expertos y pacientes | 🟢 Sin backend | Público |
| `grafo-educacion-en-dolor` | Visualizador del grafo de conocimiento clínico | 🟢 Sin backend | Público |
| `proyectos-graph` | Mapa del propio portfolio de proyectos | 🟢 Sin backend | Privado |
| `mcp-jcr-wos` | Servidor MCP hacia Web of Science / JCR | ⚪ Cliente de API | Privado |
| `mcp-stitch-proxy` | Proxy MCP que repara Google Stitch | ⚪ Cliente de API | Privado |
| `panel-sf` | Dashboard de salud familiar cifrado en el navegador | 🟠 Local cifrado | Público |

## A · Diseño y UI

**A1 — El brief antes que el CSS.** El skill de diseño `impeccable` (adoptado, no propio) se niega a tocar código si no existe antes un `PRODUCT.md`: usuarios, propósito, personalidad de marca, principios de diseño y objetivo de accesibilidad. Cada proyecto declara además su *register* — `brand` cuando el diseño ES el producto, `product` cuando el diseño SIRVE al producto — y ese registro decide qué referencia se lee antes de diseñar nada. *(landing-eps-dolor-entrevias, cuadro-mando-fisio-dase, constructor-educacion-en-dolor)*

**A2 — Reglas con nombre propio y anti-referencias.** El sistema de diseño de la landing no dice «usa el azul para dar confianza»: dice *«Regla de los Tres Significados»* y la hace citable en una auditoría posterior. Cada brief empieza además por lo que NO debe parecer —folleto clínico frío, pharma/corporativo, startup/SaaS con gradientes y numeración 01/02/03, wellness espiritual—. Nombrar el rechazo resulta más operativo que solo describir el objetivo. *(landing-eps-dolor-entrevias, cuadro-mando-fisio-dase)*

**A3 — Un único vocabulario de tema, sin excepción.** Variables CSS en `:root`, `prefers-color-scheme` para el sistema y un `data-theme` o selector manual encima: el mismo esqueleto en panel-claude, en los seis temas institucionales de cuadro-mando-fisio-dase (incluido uno de alto contraste), en el panel y el constructor de educación en dolor, en salud-familiar. Ahí, «tema» (color) y «plantilla de presentación» (tarjetas, barras, medidores, mapa de calor) son ejes independientes. *(panel-claude, cuadro-mando-fisio-dase, panel-educacion-en-dolor, constructor-educacion-en-dolor, salud-familiar)*

**A4 — «impeccable»: un skill externo como control de calidad visual.** En vez de construir un linter de diseño propio, el portfolio adopta `impeccable` (v3.9.1, Apache 2.0) y lo usa de verdad: sus cachés registran hallazgos reales, y una auditoría completa puntúa el diseño sobre diez heurísticas de Nielsen con prioridades P0-P3 concretas. *(landing-eps-dolor-entrevias, cuadro-mando-fisio-dase, educacion-en-dolor, proyectos-graph)*

**A5 — Stitch con red de seguridad.** Google Stitch generó el sistema «Clinical Precision» del dashboard de salud familiar y el «Clinical Clarity» del panel Delphi — con dos salvaguardas distintas: en salud-familiar los tokens se transcriben a mano a CSS plano porque el HTML cifrado debe abrirse sin red; y cuando el propio MCP remoto de Stitch resultó tener un esquema roto que hacía que Claude Code descartara sus quince herramientas de golpe, la respuesta fue escribir un proxy que lo repara al vuelo, no abandonarlo. *(salud-familiar, validacion-educacion-en-dolor, mcp-stitch-proxy)*

**A6 — Vanilla siempre, hasta en lo más complejo.** Cero frameworks de UI en los trece repositorios: DOM a mano, SVG a mano, y un motor de grafo de fuerzas completo con cámara orbital escrito directamente sobre `<canvas>` para 2.787 conceptos y 8.216 relaciones. La accesibilidad se pide con cifras, no con adjetivos: contraste ≥4.5:1, área táctil de 56px, tipografía base de 18px, `:focus-visible` siempre visible, contenido esencial legible sin JavaScript. *(grafo-educacion-en-dolor, proyectos-graph, panel-claude, landing-eps-dolor-entrevias)*

## B · Persistencia y bases de datos

No hay un único patrón de datos: hay una escala, y en qué punto aterriza cada proyecto es casi siempre una decisión escrita, no un accidente.

- 🟢 **Sin backend — el HTML es la base de datos.** La mayoría de los proyectos no tiene servidor: el dato vive en un JSON embebido en un único HTML, generado desde una fuente única versionada por un script de build reconstruible con un comando. La spec de cuadro-mando-fisio-dase marca «backend, base de datos o API» como fuera de alcance; el documento de arquitectura del constructor dice que «en tiempo de ejecución no existe servidor, base de datos ni API» — por privacidad, coste cero y mantenimiento mínimo.
- 🟠 **Estado local, con reglas de caducidad.** La consulta diaria (en cuadro-mando-fisio-dase) guarda historial en `localStorage` y fotos en `IndexedDB` con autoborrado a 21 días, más pseudonimización opcional al exportar. El dashboard de salud familiar cifra todo con AES-256-GCM (PBKDF2, 600.000 iteraciones) y publica el HTML cifrado en GitHub Pages público; un script dedicado escanea el payload en busca de fugas de términos clínicos reales antes de publicar, y comprueba que una contraseña incorrecta falla.
- ⚪ **Sin datos propios.** `mcp-jcr-wos` y `mcp-stitch-proxy` no persisten nada: son la tubería entre Claude Code y un servicio de terceros.
- 🔴 **Backend real — solo cuando aporta algo que un fichero no puede.** `educacion-en-dolor` es el único proyecto con estado remoto real: una tabla Supabase de solo-inserción (RLS restringido a la clave anónima) para respuestas de consenso, más Storage con URLs firmadas, y un servidor MCP de Supabase para trabajar esos datos desde Claude Code. La clave que viaja puede escribir pero no leer; la clave maestra vive en el llavero del sistema, nunca en el repositorio. Una arquitectura más ambiciosa (Postgres, pgvector, Next.js, pagos) existe solo como documento a cinco años vista, marcada explícitamente como no desplegada.

## C · Integración de herramientas

**C1 — MCP propio: mismo ADN técnico, dos motivos.** `mcp-jcr-wos` y `mcp-stitch-proxy` comparten arquitectura: cero dependencias npm, JSON-RPC 2.0 a mano sobre stdio en vez del SDK oficial, credenciales por variable de entorno y luego llavero del sistema (nunca en el repo), y treinta o más tests por servidor. Pero el motivo es opuesto: uno **añade** capacidad (consultar factor de impacto y cuartil de una revista sin salir de la sesión); el otro **repara** una capacidad rota (un esquema mal publicado por Google que hacía que Claude Code descartara las quince herramientas de Stitch de golpe).

**C2 — Plugins de marketplace en vez de reconstruir.** `panel-claude` declara un marketplace externo en `.claude/settings.json` y activa el plugin «Council of High Intelligence» en vez de construir su propio orquestador de deliberación multi-agente.

**C3 — Hooks de git como pegamento entre repos.** En `educacion-en-dolor`, un *pre-commit* corre ocho «puertas de calidad» y bloquea el commit si fallan (incluido un linter de lenguaje neutro añadido tras una auto-auditoría). Un *post-commit* publica en cascada los tres repositorios públicos del clúster — por eso sus últimos commits quedan a minutos de distancia entre sí.

## D · Metodología

**D1 — `specs`: la especificación como fuente única de intención.** Un repositorio dedicado (dieciocho documentos) reúne la especificación de cada proyecto con una plantilla consistente: *Objective* (con un «éxito = …» explícito), *Scope* con exclusiones razonadas, *Requirements* numerados, *Inputs & outputs*, *Constraints*. Los proyectos de cara al público añaden su propio `PRODUCT.md`/`DESIGN.md` con el mismo espíritu aplicado a la interfaz.

> **Fuente única → pipeline de build → proyecciones desechables** (HTML, JSON, PDF, Excel…) es el patrón que conecta todo lo demás.

**D2 — Verificar con un script, no con una relectura.** `build/review.js` corre una batería contra la spec con jsdom en cuadro-mando-fisio-dase; el detector de `impeccable` puntúa contraste y anti-patrones de forma determinista; el script de fuga de datos de salud-familiar intenta descifrar con la contraseña real y comprueba que una contraseña falsa falla.

**D3 — Auto-auditoría del propio proceso.** `educacion-en-dolor` documenta cuatro rondas de auto-auditoría en menos de dos semanas, las cuatro con el mismo hallazgo: una cifra escrita a mano caduca en cuanto el corpus cambia. Regla operativa resultante: *«si un número importa, que lo dé un script»*.

**D4 — Una fuente, muchas proyecciones desechables.** En `educacion-en-dolor`, un pipeline en Python genera cinco salidas (SQLite, JSON, RAG, Excel, PDF) desde el mismo corpus. En `proyectos-graph`, un script mucho más pequeño genera tres (web interactiva, fragmento para Artifacts, Markdown para NotebookLM) desde las memorias que Claude Code ya guarda por proyecto. La decisión que lo resume: Notion, Excel y ficheros planos en Git se puntuaron uno contra otro, y ganó lo verificable en código.

## Principios transversales

1. Antes de la primera línea de código: una página de spec con un «éxito = …» explícito y un scope que dice también qué queda fuera, y por qué.
2. Por defecto, sin backend: que el propio fichero sea la base de datos hasta que algo concreto —no la comodidad— justifique lo contrario.
3. Si hace falta estado remoto, que la clave que viaja pueda escribir pero no leer, y que el secreto viva en el llavero del sistema, nunca en el repositorio.
4. Un tema claro/oscuro con variables CSS no cuesta nada extra: inclúyelo siempre, con `:root` + `prefers-color-scheme` + un override manual.
5. Nombra las reglas de diseño («la regla de…») y escribe primero lo que el proyecto NO debe parecer — las dos cosas se auditan más tarde; una sensación buena, no.
6. Automatiza la verificación de la promesa del proyecto —contraste, requisitos del spec, fugas de datos— con un script que falle de verdad, no con una relectura.
7. Si una herramienta de terceros expone algo por MCP pero llega rota, un proxy que la repara vale más que abandonarla.
8. Cuando algo importante caduca en una sesión —una cifra, un estado—, que lo produzca un script la próxima vez, no la memoria.
