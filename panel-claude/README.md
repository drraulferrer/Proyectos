# 🛸 Panel de Claude Code

Una pequeña app web **local** que enseña, en un lenguaje que entiende todo el
mundo, lo que pasa en tu Claude Code — y que permite lanzar tareas con un clic,
sin tocar la terminal.

| Pestaña | Qué hay dentro |
|---|---|
| 📊 **Mi día** | El informe diario: sesiones, mensajes, acciones, archivos tocados, tiempo activo y un gráfico de actividad por hora. Con un botón para **copiar el informe** (ideal para el chat del equipo) y otro para que **Claude lo redacte** por ti. |
| ⚡ **Botones** | Tus **habilidades**, tus **automatizaciones** (comandos guardados) y los **botones del equipo** definidos en `botones.json`, todos ejecutables con un clic. También hay un «Pedido libre» para pedir cualquier cosa con tus palabras. |
| 🗂️ **Sesiones** | El registro de todas las sesiones de Claude Code: búscalas, fíltralas por proyecto y ábrelas para leer la conversación completa, con las herramientas que se usaron. |

Todo se lee directamente de la carpeta local de Claude Code (`~/.claude`).
**Nada sale de tu equipo**: el panel solo escucha en `127.0.0.1`.

---

## 🚀 Cómo arrancarlo (sin usar la terminal)

1. **Instala Node.js** si no lo tienes: entra en [nodejs.org](https://nodejs.org),
   pulsa el botón verde (versión LTS) e instala con «siguiente, siguiente».
2. Haz **doble clic** en el arrancador de tu sistema, dentro de esta carpeta:
   - **Mac** → `Iniciar en Mac.command`
     _(la primera vez: clic derecho → «Abrir» → «Abrir», por la seguridad de macOS)_
   - **Windows** → `Iniciar en Windows.bat`
   - **Linux** → `iniciar-en-linux.sh`
3. Se abre una ventanita con letras y, acto seguido, el navegador en
   **http://localhost:4747**. Esa ventanita es el motor del panel: **déjala
   abierta** mientras lo uses y ciérrala cuando termines.

> Si prefieres la terminal: `npm start` (o `node server.js`) dentro de esta carpeta.

### Requisitos

- **Node.js 18 o superior** — para el panel en sí.
- **Claude Code instalado y con sesión iniciada** — solo hace falta para
  ejecutar botones. Sin él, el panel funciona igualmente en modo lectura
  (informes y sesiones) y ofrece copiar el comando para dárselo a alguien que
  sí lo tenga.

---

## ⚡ Añadir botones del equipo

Edita el archivo `botones.json` de esta carpeta. Cada botón es así:

```json
{
  "nombre": "¿Qué cambió hoy?",
  "emoji": "📝",
  "descripcion": "Resume los cambios de git de las últimas 24 horas.",
  "prompt": "Mira el historial de git y resume en español los cambios de hoy…",
  "automatico": false
}
```

- `prompt` es lo que se le pedirá a Claude, con tus palabras.
- `automatico: true` marca por defecto el **modo automático** (ver abajo).
- Guarda el archivo y recarga el navegador: el botón aparece al momento.

Las **habilidades** (`~/.claude/skills` y `.claude/skills` de cada proyecto) y
las **automatizaciones** (`~/.claude/commands` y `.claude/commands`) se
detectan solas; no hay que registrarlas.

## 🔓 El modo automático, en dos líneas

Al ejecutar un botón puedes activar «Modo automático»: Claude podrá **editar
archivos y ejecutar comandos** en la carpeta elegida sin pedir permiso paso a
paso (equivale a `--dangerously-skip-permissions`). Sin activarlo, Claude solo
lee y te cuenta; es lo más prudente para botones nuevos o de otras personas.

## 🛟 Problemas frecuentes

- **«Falta Node.js»** → instala Node desde [nodejs.org](https://nodejs.org) y
  vuelve a hacer doble clic.
- **El navegador no se abre solo** → entra a mano en
  [http://localhost:4747](http://localhost:4747).
- **El puerto 4747 está ocupado** → el panel prueba solo con 4748, 4749…
  mira la ventanita para ver la dirección final.
- **«Solo lectura» arriba a la derecha** → ese equipo no tiene el programa
  `claude`; instala [Claude Code](https://claude.com/claude-code) e inicia
  sesión para poder usar los botones.
- **No aparecen sesiones** → todavía no se ha usado Claude Code en este equipo
  con este usuario, o Claude Code guarda sus datos en otra carpeta (puedes
  indicarla arrancando con la variable `CLAUDE_DIR`).

## ⚙️ Ajustes opcionales (variables de entorno)

| Variable | Para qué sirve | Ejemplo |
|---|---|---|
| `PUERTO` | Cambiar el puerto | `PUERTO=5050 node server.js` |
| `CLAUDE_DIR` | Leer los datos de otra carpeta | `CLAUDE_DIR=/otra/.claude node server.js` |
| `NO_ABRIR` | No abrir el navegador al arrancar | `NO_ABRIR=1 node server.js` |

## 🔒 Seguridad

- El servidor **solo escucha en 127.0.0.1**: nadie más en la red puede verlo.
- No hay dependencias de terceros: un único `server.js` con Node.js puro.
- Los botones ejecutan Claude Code **con tu cuenta local**, igual que si
  escribieras en la terminal; el modo automático amplía sus permisos, úsalo
  solo con botones de confianza.
