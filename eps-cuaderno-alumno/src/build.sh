#!/usr/bin/env bash
# Genera el cuaderno A5 completo: HTML -> PDF (RGB, vectorial) -> PDF (CMYK).
# Requiere: Node 22 con Playwright/Chromium y Ghostscript.
set -euo pipefail
cd "$(dirname "$0")/.."

RGB="Cuaderno-del-participante-A5-Paincorp.pdf"
CMYK="Cuaderno-del-participante-A5-Paincorp-CMYK.pdf"

echo "1/3  Generando HTML…"
node src/generate.mjs

echo "2/3  Renderizando PDF A5 con sangrado (RGB, vectorial)…"
node src/render.mjs

echo "3/3  Convirtiendo a CMYK (perfil CMYK genérico de Ghostscript)…"
gs -dSAFER -dBATCH -dNOPAUSE -dNOCACHE \
   -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 \
   -sColorConversionStrategy=CMYK -dProcessColorModel=/DeviceCMYK \
   -dConvertCMYK=true -dAutoRotatePages=/None \
   -dDownsampleColorImages=false -dDownsampleGrayImages=false \
   -o "$CMYK" "$RGB"

echo "Listo:"
echo "  · $RGB   (archivo maestro vectorial)"
echo "  · $CMYK  (variante CMYK de conveniencia)"
