# 🛡️ SkillSpector — revisar Skills antes de instalarlas

[SkillSpector](https://github.com/NVIDIA/skillspector) es un **escáner de seguridad
para habilidades de agentes de IA** (las *Skills* de Claude Code, Codex y agentes
MCP). Lo hace NVIDIA y es software libre (Apache 2.0).

Antes de instalar una Skill que has encontrado por ahí, SkillSpector lee sus
archivos y te dice si contiene cosas feas: instrucciones ocultas para manipular
al agente (*prompt injection*), envío de datos a servidores externos, acceso a
tus carpetas de configuración (`~/.claude/`), descargas de código, credenciales
en texto plano… Son **71 patrones en 17 categorías**.

> El propio proyecto cita que un **26,1 %** de las Skills publicadas tienen alguna
> vulnerabilidad y un **5,2 %** parecen directamente maliciosas. De ahí que
> convenga pasar el escáner antes de instalar nada.

---

## 🚀 La forma fácil: el botón del panel

En [panel-claude](../panel-claude/) hay un botón **🛡️ Revisar una Skill**:

1. Abre el panel y ve a la pestaña **⚡ Botones**.
2. Elige arriba la carpeta del proyecto **Proyectos** (ahí se guardarán los informes).
3. Pulsa **🛡️ Revisar una Skill**.
4. En **«Instrucciones extra»** escribe qué quieres revisar — una carpeta
   (`~/.claude/skills/mi-skill`) o una dirección de GitHub
   (`https://github.com/usuario/su-skill`). Si lo dejas vacío, revisa todas las
   Skills que ya tengas instaladas.
5. Deja marcada la casilla de **modo automático** y dale a ejecutar.

Claude instala la herramienta si hace falta (la primera vez tarda un par de
minutos), pasa el escáner y te explica el resultado en español. El informe queda
en `skillspector/informes/`.

No necesitas terminal ni saber nada de lo de abajo.

> **Por qué el modo automático**: el panel lanza Claude en modo de una sola
> pasada, sin poder pedirte permiso por pantalla. Sin esa casilla, los comandos
> de instalación y escaneo se quedarían bloqueados. El botón solo *lee* archivos
> y escribe el informe: no ejecuta la Skill que estás revisando.

---

## 🧰 Instalación manual (terminal)

Requiere **Python 3.12 o superior**. La forma recomendada es con
[uv](https://docs.astral.sh/uv/), que se trae su propio Python si el tuyo es más
antiguo:

```bash
# 1. Instalar uv (una sola vez)
curl -LsSf https://astral.sh/uv/install.sh | sh          # Mac y Linux
# En Windows (PowerShell):
# powershell -c "irm https://astral.sh/uv/install.ps1 | iex"

# 2. Instalar SkillSpector
uv tool install --python 3.12 git+https://github.com/NVIDIA/skillspector.git

# 3. Comprobar que responde
skillspector --version
```

Para actualizarlo más adelante: `uv tool upgrade skillspector`.
Para quitarlo: `uv tool uninstall skillspector`.

### Alternativa sin instalar nada: Docker

```bash
git clone https://github.com/NVIDIA/skillspector.git && cd skillspector
docker build -t skillspector .
docker run --rm -v "$PWD:/scan" skillspector scan /scan/mi-skill/ --no-llm
```

---

## 📋 Cómo se usa

```bash
# Revisar una Skill que tienes en el ordenador
skillspector scan ~/.claude/skills/mi-skill/ --no-llm

# Revisar una Skill directamente desde GitHub, sin descargarla a mano
skillspector scan https://github.com/usuario/su-skill --no-llm

# Revisar un .zip
skillspector scan ./mi-skill.zip --no-llm

# Guardar el informe en un archivo legible
skillspector scan ./mi-skill/ --no-llm --format markdown --output informe.md
```

Formatos disponibles: `json`, `markdown` y `sarif` (este último para engancharlo
a un sistema de revisión automática).

En Mac y Linux también tienes el atajo `./revisar-skill.sh <carpeta-o-url>`, que
instala lo que falte y deja el informe en `informes/`.

### Qué te devuelve

Un informe con:

- **Puntuación de riesgo** de 0 a 100 y una **severidad** (LOW / MEDIUM / HIGH / CRITICAL).
- Una **recomendación**: `PASS` (adelante), `CAUTION` (léelo antes) o `FAIL` (no lo instales).
- La **lista de problemas**, cada uno con el archivo y la línea exactos y cómo arreglarlo.
- Qué parte de la Skill se ha podido inspeccionar (cobertura).

Ejemplo real de una Skill sana pero con un aviso:

```
     Risk Assessment
 Score           21/100
 Severity        MEDIUM
 Recommendation  CAUTION

Issues (1)
  HIGH: AS1 - Agent Config Directory Access...
    Location: SKILL.md:85
```

> ⚠️ El escáner **no decide por ti**: marca patrones sospechosos y a veces salta
> con cosas legítimas (una Skill que toca `~/.claude/` a propósito, por ejemplo).
> Lee el motivo antes de descartar nada.

---

## 🤖 El modo con IA (opcional)

Además del análisis estático, SkillSpector puede pedirle a un modelo de lenguaje
que juzgue la *intención* del código. Ese modo necesita una clave de API
(Anthropic, OpenAI, AWS Bedrock o NVIDIA) en una variable de entorno, por ejemplo:

```bash
export ANTHROPIC_API_KEY="tu-clave"
skillspector scan ./mi-skill/          # sin --no-llm, ya usa el modelo
```

Sin clave funciona igual, solo que se salta esos tres analizadores y avisa por
pantalla. **Para el uso del día a día, `--no-llm` es suficiente y es gratis.**

---

## 🔌 Como servidor MCP (avanzado)

SkillSpector también puede exponerse como herramienta MCP para que Claude Code lo
llame él solo, sin pasar por la terminal:

```bash
uv tool install --python 3.12 'skillspector[mcp] @ git+https://github.com/NVIDIA/skillspector.git'
claude mcp add skillspector -- skillspector mcp
```

No lo hemos activado por defecto en este repositorio para no romper las sesiones
de quien no lo tenga instalado.

---

## 📎 Enlaces

- Repositorio: <https://github.com/NVIDIA/skillspector>
- Licencia: Apache 2.0
- Versión probada aquí: **v2.11.0**
