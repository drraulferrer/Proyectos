#!/usr/bin/env bash
# Revisa una Skill con SkillSpector (NVIDIA) y deja el informe en informes/.
#
#   ./revisar-skill.sh ~/.claude/skills/mi-skill
#   ./revisar-skill.sh https://github.com/usuario/su-skill
#
# Instala lo que falte (uv y el propio SkillSpector) la primera vez.
set -euo pipefail

OBJETIVO="${1:-}"
if [ -z "$OBJETIVO" ]; then
  echo "Uso: $0 <carpeta-de-la-skill | url-de-github | archivo.zip>" >&2
  exit 64
fi

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
export PATH="$HOME/.local/bin:$PATH"

if ! command -v uv >/dev/null 2>&1; then
  echo "→ Instalando uv (gestor de paquetes de Python)…"
  curl -LsSf https://astral.sh/uv/install.sh | sh
  export PATH="$HOME/.local/bin:$PATH"
fi

if ! command -v skillspector >/dev/null 2>&1; then
  echo "→ Instalando SkillSpector…"
  uv tool install --python 3.12 git+https://github.com/NVIDIA/skillspector.git
fi

mkdir -p "$DIR/informes"
NOMBRE="$(basename "${OBJETIVO%/}")"
NOMBRE="${NOMBRE//[^A-Za-z0-9._-]/-}"
INFORME="$DIR/informes/$(date +%Y%m%d-%H%M%S)-${NOMBRE}.md"

echo "→ Revisando: $OBJETIVO"
# --no-llm: solo análisis estático, sin necesidad de claves de API.
skillspector scan "$OBJETIVO" --no-llm --format markdown --output "$INFORME"

echo
echo "✅ Informe guardado en: $INFORME"
echo "   Busca 'Recommendation' (PASS / CAUTION / FAIL) para el veredicto rápido."
