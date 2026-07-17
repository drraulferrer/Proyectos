// Renderiza el HTML del cuaderno a PDF A5 con sangrado (154 × 216 mm),
// una página por hoja, en orden de lectura. Fuentes incrustadas, fondos impresos.
import pkg from '/opt/node22/lib/node_modules/playwright/index.js';
const { chromium } = pkg;
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const htmlPath = resolve(__dirname, '..', 'cuaderno-alumno-a5.html');
const pdfPath = resolve(__dirname, '..', 'Cuaderno-del-participante-A5-Paincorp.pdf');

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto('file://' + htmlPath, { waitUntil: 'networkidle' });
await page.pdf({
  path: pdfPath,
  width: '154mm',
  height: '216mm',
  printBackground: true,
  preferCSSPageSize: true,
  margin: { top: '0', bottom: '0', left: '0', right: '0' },
});
await browser.close();
console.log('PDF escrito en', pdfPath);
