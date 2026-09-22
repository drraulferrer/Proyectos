// construir_docx.js. Convierte build/documento.md en un .docx con portada, índice,
// cabecera, pie con número de página, tablas con anchura en DXA y enlaces activos.
// Uso: node construir_docx.js salida.docx [paginas.json]
// paginas.json (opcional) asigna a cada título su página para el índice estático.
const fs = require("fs");
const path = require("path");
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell,
  WidthType, ShadingType, BorderStyle, Footer, Header, PageNumber, ExternalHyperlink, TabStopType,
  LevelFormat, PageBreak, TableLayoutType, VerticalAlign,
} = require("docx");

const RAIZ = path.resolve(__dirname, "..");
const md = fs.readFileSync(path.join(__dirname, "documento.md"), "utf8");
const salida = process.argv[2] || path.join(RAIZ, "salida", "documento.docx");
const paginas = process.argv[3] && fs.existsSync(process.argv[3]) ? JSON.parse(fs.readFileSync(process.argv[3], "utf8")) : {};

const AZUL = "1F3864", GRIS = "595959";
const ANCHO = 11906 - 2 * 1134; // A4 menos márgenes laterales de 2 cm
const FUENTE = "Calibri";

// ---------------------------------------------------------------- texto en línea
function runs(texto, base = {}) {
  const out = [];
  // negrita **...** y cursiva *...*
  const partes = texto.split(/(\*\*[^*]+\*\*|\*[^*\s][^*]*\*)/g).filter((p) => p !== "");
  for (const p of partes) {
    if (p.startsWith("**") && p.endsWith("**")) out.push(new TextRun({ text: p.slice(2, -2), bold: true, font: FUENTE, ...base }));
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
  const borde = { style: BorderStyle.SINGLE, size: 4, color: "A6A6A6" };
  const bordes = { top: borde, bottom: borde, left: borde, right: borde };
  const rows = filas.map((f, r) => new TableRow({
    tableHeader: r === 0,
    cantSplit: true,
    children: f.map((c, k) => new TableCell({
      width: { size: w[k], type: WidthType.DXA },
      borders: bordes,
      verticalAlign: VerticalAlign.TOP,
      shading: r === 0 ? { type: ShadingType.CLEAR, color: "auto", fill: "D9E2F3" } : undefined,
      margins: { top: 40, bottom: 40, left: 70, right: 70 },
      children: [new Paragraph({ spacing: { before: 0, after: 0, line: 240, lineRule: "auto" }, children: runsConEnlaces(c, { size: tam, bold: r === 0 ? true : undefined }) })],
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
    cuerpo.push(new Paragraph({ heading: HeadingLevel.HEADING_1, pageBreakBefore: !primerH1, children: runs(t) }));
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
      shading: { type: ShadingType.CLEAR, color: "auto", fill: "FFF2CC" },
      border: { left: { style: BorderStyle.SINGLE, size: 18, color: "BF8F00", space: 6 } },
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
    cuerpo.push(new Paragraph({ keepNext: true, spacing: { before: 200, after: 80 }, children: runs(texto.replace(/\*\*/g, ""), { bold: true, size: 19, color: AZUL }) }));
  } else if (/^\*{0,2}Fuentes?\b/.test(texto)) {
    cuerpo.push(new Paragraph({ spacing: { before: 60, after: 200 }, children: runs(texto, { italics: true, size: 17, color: GRIS }) }));
  } else {
    cuerpo.push(new Paragraph({ spacing: { after: 140 }, alignment: AlignmentType.JUSTIFIED, children: runs(texto) }));
  }
}

// ---------------------------------------------------------------- portada e índice
const portada = [
  new Paragraph({ spacing: { before: 2600, after: 200 }, children: [new TextRun({ text: "Documento técnico dirigido al Ministerio de Sanidad", font: FUENTE, size: 24, color: GRIS })] }),
  new Paragraph({ spacing: { after: 300, line: 300, lineRule: "auto" }, children: [new TextRun({ text: "Fisioterapia en Atención Primaria en el Sistema Nacional de Salud", font: FUENTE, size: 52, bold: true, color: AZUL })] }),
  new Paragraph({ spacing: { after: 1200 }, children: [new TextRun({ text: "Modelo organizativo, acceso, dotación y evaluación", font: FUENTE, size: 32, color: AZUL })] }),
  new Paragraph({ border: { top: { style: BorderStyle.SINGLE, size: 6, color: AZUL, space: 8 } }, spacing: { after: 120 }, children: [new TextRun({ text: "Versión de trabajo 1.0 · 22 de septiembre de 2026", font: FUENTE, size: 22, bold: true })] }),
  new Paragraph({ spacing: { after: 120 }, children: [new TextRun({ text: "Elaborado a partir del borrador «Propuesta de Fisioterapia en Atención Primaria para el Ministerio de Sanidad» y de las revisiones de Patricia Moreno Carrero y Raúl Ferrer Peña.", font: FUENTE, size: 20, color: GRIS })] }),
  new Paragraph({ spacing: { after: 120 }, children: [new TextRun({ text: "Estado de las fuentes: los artículos científicos están verificados en PubMed. Las normas, los documentos autonómicos y las estadísticas oficiales están pendientes de cotejo en la fuente original, como detalla el anexo F.", font: FUENTE, size: 20, color: GRIS })] }),
];
const toc = [new Paragraph({ heading: HeadingLevel.HEADING_1, pageBreakBefore: true, children: runs("Índice") })];
for (const e of indice) {
  const pag = paginas[e.t] ? String(paginas[e.t]) : "";
  toc.push(new Paragraph({
    spacing: { after: e.nivel === 1 ? 60 : 20 }, indent: { left: e.nivel === 1 ? 0 : 400 },
    tabStops: [{ type: TabStopType.RIGHT, position: ANCHO, leader: "dot" }],
    children: [new TextRun({ text: e.t, font: FUENTE, size: e.nivel === 1 ? 21 : 19, bold: e.nivel === 1 }), new TextRun({ text: "\t" + pag, font: FUENTE, size: e.nivel === 1 ? 21 : 19 })],
  }));
}

const doc = new Document({
  title: "Fisioterapia en Atención Primaria en el Sistema Nacional de Salud",
  description: "Documento técnico: modelo organizativo, acceso, dotación y evaluación",
  styles: {
    default: { document: { run: { font: FUENTE, size: 21 }, paragraph: { spacing: { line: 276, lineRule: "auto" } } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 32, bold: true, color: AZUL, font: FUENTE }, paragraph: { spacing: { before: 120, after: 240 }, outlineLevel: 0, keepNext: true } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 26, bold: true, color: AZUL, font: FUENTE }, paragraph: { spacing: { before: 280, after: 120 }, outlineLevel: 1, keepNext: true } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 22, bold: true, color: "2F5496", font: FUENTE }, paragraph: { spacing: { before: 220, after: 100 }, outlineLevel: 2, keepNext: true } },
    ],
  },
  numbering: {
    config: [
      { reference: "vinetas", levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 567, hanging: 283 } } } }] },
      { reference: "numeros", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 567, hanging: 340 } } } }] },
    ],
  },
  sections: [{
    properties: { titlePage: true, page: { size: { width: 11906, height: 16838 }, margin: { top: 1418, bottom: 1418, left: 1134, right: 1134 } } },
    headers: {
      default: new Header({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "Fisioterapia en Atención Primaria en el SNS · Documento técnico, versión de trabajo 1.0", font: FUENTE, size: 16, color: GRIS })] })] }),
      first: new Header({ children: [new Paragraph({ children: [] })] }),
    },
    footers: {
      default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ children: ["Página ", PageNumber.CURRENT, " de ", PageNumber.TOTAL_PAGES], font: FUENTE, size: 16, color: GRIS })] })] }),
      first: new Footer({ children: [new Paragraph({ children: [] })] }),
    },
    children: [...portada, ...toc, ...cuerpo],
  }],
});

Packer.toBuffer(doc).then((buf) => { fs.mkdirSync(path.dirname(salida), { recursive: true }); fs.writeFileSync(salida, buf); console.log("escrito", salida, indice.length, "entradas de índice"); });
