#!/usr/bin/env python3
"""paginas.py. Localiza en el PDF la página de cada título del índice.
Uso: python3 paginas.py documento.pdf documento.md > paginas.json"""
import json, re, subprocess, sys, unicodedata

def norm(s):
    s = unicodedata.normalize("NFKC", s).replace("­", "")
    return re.sub(r"\s+", " ", s).strip().lower()

pdf, md = sys.argv[1], sys.argv[2]
n = int(re.search(r"Pages:\s+(\d+)", subprocess.run(["pdfinfo", pdf], capture_output=True, text=True).stdout).group(1))
paginas = [norm(subprocess.run(["pdftotext", "-f", str(p), "-l", str(p), "-layout", pdf, "-"], capture_output=True, text=True).stdout) for p in range(1, n + 1)]
titulos = [l[2:].strip() if l.startswith("# ") else l[3:].strip() for l in open(md, encoding="utf-8") if l.startswith(("# ", "## "))]
# el índice termina en la primera página que contiene el último título
fin_indice = next(k for k, t in enumerate(paginas) if norm(titulos[-1])[:40] in t)
out, desde = {}, fin_indice + 1
for t in titulos:
    clave = norm(t)[:45]
    for k in range(desde, n):
        if clave in paginas[k]:
            out[t] = k + 1
            desde = k
            break
    else:
        print(f"no encontrado: {t}", file=sys.stderr)
print(json.dumps(out, ensure_ascii=False, indent=1))
