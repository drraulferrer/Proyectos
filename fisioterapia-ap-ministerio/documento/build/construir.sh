#!/usr/bin/env bash
# construir.sh. Construcción completa y reproducible del documento.
#   1. generar.py   ensambla build/documento.md desde fuente/ y datos/
#   2. validar.py   comprueba SPEC.md y la Voice DNA (falla si hay algún FALLO)
#   3. docx en dos pasadas: la primera calcula las páginas del índice
#   4. PDF con LibreOffice
# Requisitos: python3, node con el paquete docx (npm install en build/),
# LibreOffice Writer, poppler-utils y la fuente Carlito (métrica de Calibri).
set -euo pipefail
cd "$(dirname "$0")"
SAL=../salida
TMP=$(mktemp -d)
NOMBRE=fisioterapia-ap-sns
python3 generar.py
python3 validar.py
node construir_docx.js "$TMP/pase1.docx" >/dev/null
soffice --headless --convert-to pdf --outdir "$TMP" "$TMP/pase1.docx" >/dev/null 2>&1
python3 paginas.py "$TMP/pase1.pdf" documento.md > "$TMP/paginas.json"
node construir_docx.js "$SAL/$NOMBRE.docx" "$TMP/paginas.json" >/dev/null
soffice --headless --convert-to pdf --outdir "$SAL" "$SAL/$NOMBRE.docx" >/dev/null 2>&1
python3 paginas.py "$SAL/$NOMBRE.pdf" documento.md > "$TMP/paginas2.json"
if cmp -s "$TMP/paginas.json" "$TMP/paginas2.json"; then echo "Índice estable: las páginas coinciden en las dos pasadas"; else echo "AVISO: el índice cambió entre pasadas"; diff "$TMP/paginas.json" "$TMP/paginas2.json" | head; fi
pdfinfo "$SAL/$NOMBRE.pdf" | grep Pages
rm -rf "$TMP"
