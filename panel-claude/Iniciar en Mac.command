#!/bin/bash
# Panel de Claude Code — arrancador para macOS (doble clic).
cd "$(dirname "$0")"

if ! command -v node >/dev/null 2>&1; then
  echo ""
  echo "⚠️  Falta Node.js en este equipo."
  echo "    Descárgalo desde https://nodejs.org (botón verde, versión LTS),"
  echo "    instálalo con «siguiente, siguiente» y vuelve a hacer doble clic aquí."
  echo ""
  read -n 1 -s -r -p "Pulsa cualquier tecla para cerrar…"
  exit 1
fi

node server.js
read -n 1 -s -r -p "El panel se ha cerrado. Pulsa cualquier tecla…"
