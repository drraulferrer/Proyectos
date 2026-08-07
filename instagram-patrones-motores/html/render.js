// Renderiza las siete piezas a PNG de 1080 × 1350 px y avisa de desbordes.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const DIST = path.join(__dirname, 'dist');
const PNG = path.join(__dirname, '..', 'png');

(async () => {
  fs.mkdirSync(PNG, { recursive: true });
  const browser = await chromium.launch({
    executablePath: process.env.PW_CHROMIUM || undefined,
  });
  const page = await browser.newPage({
    viewport: { width: 1080, height: 1350 },
    deviceScaleFactor: 1,
  });

  const files = fs.readdirSync(DIST)
    .filter((f) => f.endsWith('.html') && f !== 'index.html')
    .sort();

  let problems = 0;
  for (const f of files) {
    await page.goto('file://' + path.join(DIST, f));
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(120);

    // Comprobación de desborde: el contenido no puede rebasar el lienzo
    const report = await page.evaluate(() => {
      const post = document.querySelector('.post');
      const body = document.querySelector('.body');
      const r = { post: post.scrollHeight, canvas: 1350, over: 0, tiny: [] };
      if (body) r.over = Math.max(0, body.scrollHeight - body.clientHeight);
      // Todo texto por debajo de 16 px se considera ilegible en móvil
      document.querySelectorAll('*').forEach((el) => {
        if (!el.children.length && el.textContent.trim()) {
          const fs = parseFloat(getComputedStyle(el).fontSize);
          if (fs < 16) r.tiny.push(el.className + ':' + fs);
        }
      });
      return r;
    });

    const over = Math.max(report.over, report.post - 1350);
    const flag = over > 1 ? `  ⚠ DESBORDE ${Math.round(over)}px` : '';
    const tiny = report.tiny.length ? `  ⚠ texto <16px: ${report.tiny.join(', ')}` : '';
    if (flag || tiny) problems++;
    console.log(`${f.padEnd(34)} alto=${report.post}${flag}${tiny}`);

    const out = path.join(PNG, f.replace('.html', '.png'));
    await page.locator('.post').screenshot({ path: out });
  }

  await browser.close();
  console.log(problems ? `\n${problems} pieza(s) con avisos.` : '\nSin avisos.');
})();
