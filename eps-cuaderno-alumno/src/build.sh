#!/usr/bin/env bash
# Genera el cuaderno A5 completo:
#   HTML -> PDF (Chromium) -> normaliza a 154x216 mm exactos (RGB) -> PDF (CMYK).
# Requiere: Node 22 con Playwright/Chromium y Ghostscript.
set -euo pipefail
cd "$(dirname "$0")/.."

RGB="Cuaderno-del-participante-A5-Paincorp.pdf"
CMYK="Cuaderno-del-participante-A5-Paincorp-CMYK.pdf"
TMP=".render-tmp.pdf"

# 154 mm = 436.5354 pt · 216 mm = 612.2835 pt (A5 148x210 + 3 mm de sangrado por lado)
W=436.5354
H=612.2835

echo "1/4  Generando HTML…"
node src/generate.mjs

echo "2/4  Renderizando PDF A5 con sangrado (Chromium)…"
node src/render.mjs
mv "$RGB" "$TMP"

echo "3/4  Normalizando tamaño de página a 154x216 mm exactos (RGB, maestro)…"
gs -dSAFER -dBATCH -dNOPAUSE -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 \
   -dFIXEDMEDIA -dDEVICEWIDTHPOINTS=$W -dDEVICEHEIGHTPOINTS=$H -dPDFFitPage \
   -dAutoRotatePages=/None -dDownsampleColorImages=false -dDownsampleGrayImages=false \
   -o "$RGB" "$TMP"

echo "4/4  Convirtiendo a CMYK (perfil CMYK genérico; ver README sobre Fogra 39)…"
gs -dSAFER -dBATCH -dNOPAUSE -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 \
   -sColorConversionStrategy=CMYK -dProcessColorModel=/DeviceCMYK -dConvertCMYK=true \
   -dFIXEDMEDIA -dDEVICEWIDTHPOINTS=$W -dDEVICEHEIGHTPOINTS=$H -dPDFFitPage \
   -dAutoRotatePages=/None -dDownsampleColorImages=false -dDownsampleGrayImages=false \
   -o "$CMYK" "$RGB"

rm -f "$TMP"
echo "Listo:"
echo "  · $RGB   (archivo maestro, RGB vectorial, 154x216 mm)"
echo "  · $CMYK  (variante CMYK de conveniencia)"
