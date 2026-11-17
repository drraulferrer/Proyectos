const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const [src, out, scale] = process.argv.slice(2);
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1200, height: 1500 }, deviceScaleFactor: Number(scale || 1) });
  await p.goto('file://' + path.resolve(src));
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(300);
  const ids = await p.$$eval('section.slide', els => els.map(e => e.id));
  for (const [i, id] of ids.entries()) {
    await p.locator('#' + id).screenshot({ path: `${out}/${String(i + 1).padStart(2, '0')}-${id}.png` });
  }
  // overflow check
  const issues = await p.$$eval('section.slide *', els => els.filter(e => { const r = e.getBoundingClientRect(); const s = e.closest('section').getBoundingClientRect(); return r.width && (r.right > s.right + 1 || r.bottom > s.bottom + 1); }).map(e => e.closest('section').id + ' ' + e.className));
  console.log('overflow:', issues.slice(0, 10));
  await b.close();
})();
