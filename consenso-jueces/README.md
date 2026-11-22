# consenso-jueces

Plugin de Claude Code con la skill `/consenso-jueces`, para estudiar la validez de contenido de instrumentos de autoinforme.

- **Modo simulado**: Opus entrevista al investigador, diseña los perfiles de los jueces y redacta los ítems trampa. Cada juez es una instancia de Sonnet que evalúa a ciegas. Sirve para depurar ítems antes del panel humano, no como evidencia de validez.
- **Modo humano**: importa las puntuaciones de un panel real desde un CSV y calcula los mismos índices.

Índices: V de Aiken con IC score, I-CVI, S-CVI/Ave, S-CVI/UA, kappa modificado, suficiencia por dimensión, asignación ciega y detección de ítems trampa por juez.

## Instalación

**En este repositorio** ya está disponible: `.claude/skills/consenso-jueces` es un enlace a `skills/consenso-jueces`.

**En Claude Code en tu ordenador, para todos los proyectos:**

```bash
/plugin marketplace add drraulferrer/Proyectos
/plugin install consenso-jueces@proyectos
```

**En las sesiones en la nube de otro repositorio**, añade esto a su `.claude/settings.json`:

```json
{
  "extraKnownMarketplaces": {
    "proyectos": { "source": { "source": "github", "repo": "drraulferrer/Proyectos" } }
  },
  "enabledPlugins": { "consenso-jueces@proyectos": true }
}
```

Instalada como plugin, la skill se invoca como `/consenso-jueces:consenso-jueces`, o pidiéndole a Claude que haga una validación de contenido.

## Estructura

```
consenso-jueces/
├── .claude-plugin/plugin.json
└── skills/consenso-jueces/
    ├── SKILL.md                  flujo completo
    ├── plantillas/               criterios, prompts de los jueces, formatos de entrada
    ├── referencias/              catálogo de ítems trampa y párrafo de métodos
    └── scripts/                  preparar.py, analizar.py, importar.py (solo biblioteca estándar)
```
