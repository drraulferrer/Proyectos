# Configuración de Claude Code en este repositorio

Aquí vive lo que Claude Code lee al abrir `Proyectos`: los comandos propios
(`commands/`) y los plugins activados (`settings.json`).

## Comandos

### `/minto` — método de la pirámide de Barbara Minto

Estructura ponencias, informes y propuestas poniendo la tesis arriba y los
argumentos debajo. No es una plantilla de formato: tiene una puerta que impide
redactar hasta que la tesis y la línea clave pasan una lista de pruebas.

```bash
/minto ponencia adherencia al programa de educación en dolor, 20 minutos, congreso
/minto informe propuesta de circuito de derivación para atención primaria
/minto auditar borrador-memoria.md
```

Tres modos: **ponencia** (guion con minutaje y titulares de diapositiva),
**informe** (documento en Markdown) y **auditar** (diagnóstico de un borrador que
ya existe, sin reescribirlo).

Cómo trabaja, en orden: pide audiencia, acción buscada y límite de tiempo o
extensión; construye la entrada SCQA (situación, complicación, pregunta,
respuesta); propone dos o tres tesis candidatas y recomienda una; monta la línea
clave de tres a cinco puntos comprobando que sean del mismo tipo, sin solapes y
con un orden justificado; marca qué sostiene cada punto y qué es solo un
supuesto; y **se para** a enseñar el esqueleto antes de escribir una línea del
texto final.

**Para usarlo en cualquier carpeta**, no solo en este repositorio, cópialo a tu
cuenta:

```bash
mkdir -p ~/.claude/commands && cp .claude/commands/minto.md ~/.claude/commands/
```

Una vez copiado aparece también como botón en
[panel-claude](../panel-claude/), que lee `~/.claude/commands` y los
`.claude/commands` de cada proyecto.

## Plugins

### Council of High Intelligence

Plugin que convoca a 18 personas de IA para deliberar decisiones difíciles en
varias rondas (análisis a ciegas, contrainterrogatorio anónimo, veredicto
ponderado).

Repo: https://github.com/0xNyk/council-of-high-intelligence

`settings.json` ya declara el marketplace y activa el plugin `council`. Al abrir
este repo, acepta el diálogo de confianza (*trust*) del workspace. Si Claude Code
indica que el plugin no está instalado, ejecuta una vez:

```bash
/plugin install council@council-of-high-intelligence
```

Para tenerlo en cualquier proyecto de tu CLI local:

```bash
/plugin marketplace add 0xNyk/council-of-high-intelligence
/plugin install council@council-of-high-intelligence
```

Queda guardado en `~/.claude/` y persiste en todas las sesiones y proyectos.

Uso:

```bash
/council Should we open-source our agent framework?
/council --quick Should we add caching here?
/council --duo Should we use microservices or a monolith?
/council --triad strategy Where is our defensible advantage?
/council --dry-route --triad decision Should we accept this offer?
```

Modos: **full** (deliberación completa), **quick** (rápido), **duo** (debate a dos).
