// construir_docx.js. Convierte build/documento.md en un .docx con la plantilla del
// Colegio Profesional de Fisioterapeutas de la Comunidad de Madrid (CPFCM): portada con
// logotipo, índice, cabecera y pie de la plantilla, tablas con anchura en DXA y enlaces.
// Uso: node construir_docx.js salida.docx [paginas.json]
// paginas.json (opcional) asigna a cada título su página para el índice estático.
const fs = require("fs");
const path = require("path");
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell,
  WidthType, ShadingType, BorderStyle, Footer, Header, PageNumber, ExternalHyperlink, TabStopType,
  LevelFormat, PageBreak, TableLayoutType, VerticalAlign, ImageRun, HeightRule,
} = require("docx");

const RAIZ = path.resolve(__dirname, "..");
const md = fs.readFileSync(path.join(__dirname, "documento.md"), "utf8");
const salida = process.argv[2] || path.join(RAIZ, "salida", "documento.docx");
const paginas = process.argv[3] && fs.existsSync(process.argv[3]) ? JSON.parse(fs.readFileSync(process.argv[3], "utf8")) : {};

// Paleta de la plantilla CPFCM, medida sobre el PDF de la plantilla del colegio
const PETROLEO = "00768E", TURQUESA = "0096B1", NARANJA = "F78420", CELESTE = "D6EEF3";
const TEXTO = "444444", GRIS = "8C8C8C", CABECERA = "7FB0BC", PIE = "8FBCC5", FILA = "F2F2F2", BORDE = "CCCCCC";
const AZUL = PETROLEO;
const MARGEN = 1418; // 2,5 cm, como la plantilla
const ANCHO = 11906 - 2 * MARGEN;
const FUENTE = "Calibri";
const LOGO = path.join(RAIZ, "plantilla", "logo-cpfcm.png");

// ---------------------------------------------------------------- texto en línea
function runs(texto, base = {}) {
  const out = [];
  // negrita **...** y cursiva *...*
  const partes = texto.split(/(\*\*[^*]+\*\*|\*[^*\s][^*]*\*)/g).filter((p) => p !== "");
  for (const p of partes) {
    if (p.startsWith("**") && p.endsWith("**")) out.push(new TextRun({ text: p.slice(2, -2), bold: true, font: FUENTE, color: PETROLEO, ...base }));
    else if (p.startsWith("*") && p.endsWith("*") && p.length > 2) out.push(new TextRun({ text: p.slice(1, -1), italics: true, font: FUENTE, ...base }));
    else out.push(new TextRun({ text: p, font: FUENTE, ...base }));
  }
  return out;
}

function runsConEnlaces(texto, base = {}) {
  const out = [];
  const trozos = texto.split(/(https?:\/\/\S+?|doi:10\.\S+?)(?=[.,;]?(?:\s|$))/g);
  for (const t of trozos) {
    if (/^https?:\/\//.test(t)) out.push(new ExternalHyperlink({ link: t, children: [new TextRun({ text: t, style: "Hyperlink", font: FUENTE, ...base })] }));
    else if (/^doi:10\./.test(t)) out.push(new ExternalHyperlink({ link: "https://doi.org/" + t.slice(4), children: [new TextRun({ text: t, style: "Hyperlink", font: FUENTE, ...base })] }));
    else if (t) out.push(...runs(t, base));
  }
  return out;
}

// ---------------------------------------------------------------- tablas
function anchos(filas) {
  const n = filas[0].length;
  const peso = Array(n).fill(0);
  for (let c = 0; c < n; c++) {
    let suma = 0, max = 0;
    for (const f of filas) { const l = (f[c] || "").length; suma += Math.min(l, 180); max = Math.max(max, l); }
    peso[c] = Math.max(6, Math.min(60, 0.6 * (suma / filas.length) + 0.4 * Math.min(max, 90)));
  }
  const total = peso.reduce((a, b) => a + b, 0);
  let w = peso.map((p) => Math.max(750, Math.round((p / total) * ANCHO)));
  const exceso = w.reduce((a, b) => a + b, 0) - ANCHO;
  const i = w.indexOf(Math.max(...w));
  w[i] -= exceso;
  return w;
}

function tabla(lineas) {
  const filas = lineas.filter((l, k) => k !== 1).map((l) => l.replace(/^\|/, "").replace(/\|$/, "").split("|").map((c) => c.trim()));
  const n = filas[0].length;
  const w = anchos(filas);
  const tam = n >= 7 ? 15 : n >= 5 ? 16 : 18; // medios puntos
  const borde = { style: BorderStyle.SINGLE, size: 4, color: BORDE };
  const bordes = { top: borde, bottom: borde, left: borde, right: borde };
  const rows = filas.map((f, r) => new TableRow({
    tableHeader: r === 0,
    cantSplit: true,
    children: f.map((c, k) => new TableCell({
      width: { size: w[k], type: WidthType.DXA },
      borders: bordes,
      verticalAlign: VerticalAlign.TOP,
      shading: r === 0 ? { type: ShadingType.CLEAR, color: "auto", fill: TURQUESA } : (r % 2 === 1 ? { type: ShadingType.CLEAR, color: "auto", fill: FILA } : undefined),
      margins: { top: 40, bottom: 40, left: 70, right: 70 },
      children: [new Paragraph({ alignment: r === 0 ? AlignmentType.CENTER : AlignmentType.LEFT, spacing: { before: 0, after: 0, line: 240, lineRule: "auto" }, children: runsConEnlaces(c, r === 0 ? { size: tam, bold: true, color: "FFFFFF" } : { size: tam }) })],
    })),
  }));
  return new Table({ width: { size: ANCHO, type: WidthType.DXA }, columnWidths: w, layout: TableLayoutType.FIXED, rows });
}

// ---------------------------------------------------------------- bloques
const cuerpo = [];
const indice = [];
let listaNum = 0;
let primerH1 = true;
let enReferencias = false;
const lineas = md.split("\n");
for (let i = 0; i < lineas.length; i++) {
  const l = lineas[i];
  if (!l.trim()) continue;
  if (l.startsWith("# ")) {
    const t = l.slice(2).trim();
    enReferencias = t.startsWith("Referencias");
    indice.push({ nivel: 1, t });
    cuerpo.push(new Paragraph({ heading: HeadingLevel.HEADING_1, pageBreakBefore: true, children: runs(t) }));
    primerH1 = false;
    continue;
  }
  if (l.startsWith("## ")) { const t = l.slice(3).trim(); indice.push({ nivel: 2, t }); cuerpo.push(new Paragraph({ heading: HeadingLevel.HEADING_2, children: runs(t) })); continue; }
  if (l.startsWith("### ")) { cuerpo.push(new Paragraph({ heading: HeadingLevel.HEADING_3, children: runs(l.slice(4).trim()) })); continue; }
  if (l.startsWith("|")) {
    const bloque = [];
    while (i < lineas.length && lineas[i].startsWith("|")) bloque.push(lineas[i++]);
    i--;
    cuerpo.push(tabla(bloque));
    continue;
  }
  if (l.startsWith(">")) {
    const bloque = [];
    while (i < lineas.length && lineas[i].startsWith(">")) bloque.push(lineas[i++].replace(/^>\s?/, ""));
    i--;
    cuerpo.push(new Paragraph({
      shading: { type: ShadingType.CLEAR, color: "auto", fill: "E8F4F8" },
      border: { left: { style: BorderStyle.SINGLE, size: 18, color: NARANJA, space: 6 } },
      indent: { left: 200, right: 200 }, spacing: { before: 120, after: 160 },
      children: runs(bloque.join(" ")),
    }));
    continue;
  }
  if (enReferencias && /^\d+\. /.test(l)) {
    const m = l.match(/^(\d+)\. (.*)$/);
    cuerpo.push(new Paragraph({ indent: { left: 567, hanging: 567 }, spacing: { after: 80 }, children: [new TextRun({ text: m[1] + ".\t", font: FUENTE, size: 18 }), ...runsConEnlaces(m[2], { size: 18 })], tabStops: [{ type: TabStopType.LEFT, position: 567 }] }));
    continue;
  }
  if (/^\s*[-*] /.test(l) || /^\s*\d+\. /.test(l)) {
    const numerada = /^\s*\d+\. /.test(l);
    if (numerada) listaNum++;
    while (i < lineas.length && lineas[i].trim() && (/^\s*[-*] /.test(lineas[i]) || /^\s*\d+\. /.test(lineas[i]))) {
      const texto = lineas[i].replace(/^\s*(?:[-*]|\d+\.)\s+/, "");
      cuerpo.push(new Paragraph({ numbering: numerada ? { reference: "numeros", level: 0, instance: listaNum } : { reference: "vinetas", level: 0 }, spacing: { after: 60 }, children: runs(texto) }));
      i++;
    }
    i--;
    continue;
  }
  // párrafo (líneas contiguas)
  const bloque = [l];
  while (i + 1 < lineas.length && lineas[i + 1].trim() && !/^(#|\||>|\s*[-*] |\s*\d+\. )/.test(lineas[i + 1])) bloque.push(lineas[++i]);
  const texto = bloque.join(" ");
  if (/^\*{0,2}Tabla [A-Z0-9]+\.\d+\./.test(texto)) {
    cuerpo.push(new Paragraph({ keepNext: true, spacing: { before: 200, after: 80 }, children: runs(texto.replace(/\*\*/g, ""), { bold: true, size: 19, color: TURQUESA }) }));
  } else if (/^\*{0,2}Fuentes?\b/.test(texto)) {
    cuerpo.push(new Paragraph({ spacing: { before: 60, after: 200 }, children: runs(texto, { italics: true, size: 17, color: GRIS }) }));
  } else {
    cuerpo.push(new Paragraph({ spacing: { after: 140 }, alignment: AlignmentType.JUSTIFIED, children: runs(texto) }));
  }
}

// ---------------------------------------------------------------- portada e índice
const celdaSinBorde = { top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" }, bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" }, left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" }, right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" } };
const blanco = (text, extra = {}) => new TextRun({ text, font: FUENTE, color: "FFFFFF", ...extra });
const PANEL = 3170;
const panel = new TableCell({
  width: { size: PANEL, type: WidthType.DXA }, borders: celdaSinBorde, verticalAlign: VerticalAlign.CENTER,
  shading: { type: ShadingType.CLEAR, color: "auto", fill: PETROLEO }, margins: { left: 280, right: 280 },
  children: [
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [blanco("COLEGIO PROFESIONAL DE", { size: 22 })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [blanco("FISIOTERAPEUTAS", { size: 24, bold: true })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 900 }, children: [blanco("COMUNIDAD DE MADRID", { size: 22 })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, border: { top: { style: BorderStyle.SINGLE, size: 4, color: "3A94A8", space: 10 } }, spacing: { after: 40 }, children: [blanco("Documento técnico", { size: 20, italics: true })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 40 }, children: [blanco("Versión de trabajo 1.1", { size: 20, italics: true })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, children: [blanco("Septiembre de 2026", { size: 20, italics: true })] }),
  ],
});
const texto = (text, extra = {}) => new TextRun({ text, font: FUENTE, color: TEXTO, ...extra });
const derecha = new TableCell({
  width: { size: ANCHO - PANEL, type: WidthType.DXA }, borders: celdaSinBorde, verticalAlign: VerticalAlign.CENTER, margins: { left: 520, right: 120 },
  children: [
    new Paragraph({ spacing: { after: 160 }, children: [new ImageRun({ type: "png", data: fs.readFileSync(LOGO), transformation: { width: 250, height: 53 }, altText: { title: "Logotipo del CPFCM", description: "Colegio Profesional de Fisioterapeutas de la Comunidad de Madrid", name: "logo-cpfcm" } })] }),
    new Paragraph({ spacing: { after: 160, line: 264, lineRule: "auto" }, children: [new TextRun({ text: "DOCUMENTO TÉCNICO", font: FUENTE, size: 44, bold: true, color: PETROLEO })] }),
    new Paragraph({ spacing: { after: 240, line: 276, lineRule: "auto" }, border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: NARANJA, space: 12 } }, children: [new TextRun({ text: "Fisioterapia en Atención Primaria en el Sistema Nacional de Salud", font: FUENTE, size: 28, color: "666666" })] }),
    new Paragraph({ spacing: { before: 160, after: 60, line: 300, lineRule: "auto" }, children: [texto("Modelo organizativo, acceso, dotación y evaluación", { size: 24 })] }),
    new Paragraph({ spacing: { after: 360, line: 300, lineRule: "auto" }, children: [texto("Propuesta dirigida al Ministerio de Sanidad", { size: 24 })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 600 }, children: [new TextRun({ text: " 2026 ", font: FUENTE, size: 22, color: PETROLEO, shading: { type: ShadingType.CLEAR, color: "auto", fill: "E8F4F8" } })] }),
    new Paragraph({ spacing: { after: 100 }, children: [new TextRun({ text: "Elaborado a partir del borrador «Propuesta de Fisioterapia en Atención Primaria para el Ministerio de Sanidad» y de las revisiones de Patricia Moreno Carrero y Raúl Ferrer Peña.", font: FUENTE, size: 16, color: GRIS })] }),
    new Paragraph({ children: [new TextRun({ text: "Estado de las fuentes: los artículos científicos y los documentos aportados están verificados. Las normas, los documentos autonómicos y las estadísticas oficiales están pendientes de cotejo en la fuente original, como detalla el anexo F.", font: FUENTE, size: 16, color: GRIS })] }),
  ],
});
const portada = [new Table({
  width: { size: ANCHO, type: WidthType.DXA }, columnWidths: [PANEL, ANCHO - PANEL], layout: TableLayoutType.FIXED,
  borders: { top: celdaSinBorde.top, bottom: celdaSinBorde.bottom, left: celdaSinBorde.left, right: celdaSinBorde.right, insideHorizontal: celdaSinBorde.top, insideVertical: celdaSinBorde.top },
  rows: [new TableRow({ height: { value: 12900, rule: HeightRule.EXACT }, children: [panel, derecha] })],
})];
const toc = [new Paragraph({ heading: HeadingLevel.HEADING_1, pageBreakBefore: true, children: runs("Índice de contenidos") })];
for (const e of indice) {
  const pag = paginas[e.t] ? String(paginas[e.t]) : "";
  toc.push(new Paragraph({
    spacing: { after: e.nivel === 1 ? 60 : 20 }, indent: { left: e.nivel === 1 ? 0 : 400 },
    tabStops: [{ type: TabStopType.RIGHT, position: ANCHO, leader: "dot" }],
    children: [new TextRun({ text: e.t, font: FUENTE, size: e.nivel === 1 ? 21 : 19, bold: e.nivel === 1, color: e.nivel === 1 ? PETROLEO : TEXTO }), new TextRun({ text: "\t" + pag, font: FUENTE, size: e.nivel === 1 ? 21 : 19, color: TEXTO })],
  }));
}

const doc = new Document({
  title: "Fisioterapia en Atención Primaria en el Sistema Nacional de Salud",
  description: "Documento técnico: modelo organizativo, acceso, dotación y evaluación",
  styles: {
    default: { document: { run: { font: FUENTE, size: 21, color: TEXTO }, paragraph: { spacing: { line: 288, lineRule: "auto" } } } },
    paragraphStyles: [
      { id: "PieCPFCM", name: "Pie CPFCM", basedOn: "Normal", run: { size: 16, color: PIE, font: FUENTE }, paragraph: { alignment: AlignmentType.CENTER } },
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 34, bold: true, color: PETROLEO, font: FUENTE }, paragraph: { spacing: { before: 120, after: 300 }, border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: CELESTE, space: 10 } }, outlineLevel: 0, keepNext: true } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 26, bold: true, color: PETROLEO, font: FUENTE }, paragraph: { spacing: { before: 300, after: 140 }, outlineLevel: 1, keepNext: true } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 22, bold: true, color: TURQUESA, font: FUENTE }, paragraph: { spacing: { before: 220, after: 100 }, outlineLevel: 2, keepNext: true } },
    ],
  },
  numbering: {
    config: [
      { reference: "vinetas", levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 567, hanging: 283 } } } }] },
      { reference: "numeros", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 567, hanging: 340 } } } }] },
    ],
  },
  sections: [{
    properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 1418, bottom: 1418, left: MARGEN, right: MARGEN, header: 700, footer: 560 } } },
    headers: {
      default: new Header({ children: [new Paragraph({
        alignment: AlignmentType.RIGHT, spacing: { after: 0 },
        border: { top: { style: BorderStyle.SINGLE, size: 24, color: TURQUESA, space: 4 }, bottom: { style: BorderStyle.SINGLE, size: 24, color: NARANJA, space: 4 } },
        children: [new TextRun({ text: "Fisioterapia en Atención Primaria en el SNS  |  Documento técnico, versión 1.1", font: FUENTE, size: 16, italics: true, color: CABECERA })],
      })] }),
    },
    footers: {
      default: new Footer({ children: [new Paragraph({
        style: "PieCPFCM", alignment: AlignmentType.CENTER, border: { top: { style: BorderStyle.SINGLE, size: 6, color: CELESTE, space: 6 } },
        children: [new TextRun({ text: "Página ", font: FUENTE, size: 16, color: PIE }), new TextRun({ children: [PageNumber.CURRENT], font: FUENTE, size: 16, color: PIE })],
      })] }),
    },
    children: [...portada, ...toc, ...cuerpo],
  }],
});

Packer.toBuffer(doc).then((buf) => { fs.mkdirSync(path.dirname(salida), { recursive: true }); fs.writeFileSync(salida, buf); console.log("escrito", salida, indice.length, "entradas de índice"); });
