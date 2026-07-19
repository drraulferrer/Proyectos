# Council of High Intelligence — instalación

Plugin de Claude Code que convoca a 18 personas de IA para deliberar decisiones
difíciles en varias rondas (análisis a ciegas, contrainterrogatorio anónimo,
veredicto ponderado).

Repo: https://github.com/0xNyk/council-of-high-intelligence

## Este repositorio (sesiones web y CLI)

`.claude/settings.json` ya declara el marketplace y activa el plugin `council`.
Al abrir este repo, acepta el diálogo de confianza (*trust*) del workspace. Si
Claude Code indica que el plugin no está instalado, ejecuta una vez:

```bash
/plugin install council@council-of-high-intelligence
```

## Instalación global (cualquier proyecto en tu CLI local)

```bash
/plugin marketplace add 0xNyk/council-of-high-intelligence
/plugin install council@council-of-high-intelligence
```

Queda guardado en `~/.claude/` y persiste en todas las sesiones y proyectos.

## Uso

```bash
/council Should we open-source our agent framework?
/council --quick Should we add caching here?
/council --duo Should we use microservices or a monolith?
/council --triad strategy Where is our defensible advantage?
/council --dry-route --triad decision Should we accept this offer?
```

Modos: **full** (deliberación completa), **quick** (rápido), **duo** (debate a dos).
