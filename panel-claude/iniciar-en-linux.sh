#!/bin/bash
# Panel de Claude Code — arrancador para Linux.
cd "$(dirname "$0")"

if ! command -v node >/dev/null 2>&1; then
  echo ""
  echo "⚠️  Falta Node.js en este equipo."
  echo "    Instálalo desde https://nodejs.org o con tu gestor de paquetes"
  echo "    (por ejemplo: sudo apt install nodejs) y vuelve a ejecutar este archivo."
  echo ""
  exit 1
fi

node server.js
