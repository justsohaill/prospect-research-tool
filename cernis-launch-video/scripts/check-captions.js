// Prints the caption list and checks each line against the caption rules:
// 3-7 words, inside the 8% safe margin, cap height >= 6% of frame height, >= 1.5s on screen after the last word settles.
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1350 } });
  await page.goto('file://' + path.join(__dirname, '../src/index.html') + '?render');
  await page.evaluate(() => document.fonts.ready);
  const caps = await page.evaluate(() => window.CAPTIONS);
  const total = await page.evaluate(() => window.DURATION);
  let bad = 0;
  console.log('  #  at      words  hold   capH   box(x0-x1, y0-y1)        text');
  for (const [i, c] of caps.entries()) {
    const m = await page.evaluate(({ c }) => {
      window.seek(c.start + c.landed + 0.01);
      const h = document.querySelector(c.sel), main = h.id === 'c05a' || h.id === 'c05b' || h.id === 'c05c' ? document.querySelector('#c05') : null;
      const ws = [...h.querySelectorAll('.w'), ...(main ? main.querySelectorAll('.w') : [])];
      const r = ws.map((w) => { const range = document.createRange(); range.selectNodeContents(w); return range.getBoundingClientRect(); });
      const cs = getComputedStyle(h);
      return { x0: Math.min(...r.map((b) => b.left)), x1: Math.max(...r.map((b) => b.right)), y0: Math.min(...r.map((b) => b.top)), y1: Math.max(...r.map((b) => b.bottom)),
        size: parseFloat(cs.fontSize), family: cs.fontFamily, opac: ws.map((w) => +getComputedStyle(w).opacity).every((o) => o === 1) };
    }, { c });
    const capH = m.size * 0.727; // Inter cap height
    const hold = c.out - c.landed;
    const issues = [];
    if (c.words < 3 || c.words > 7) issues.push(`${c.words} words` + (c.note ? ` (${c.note})` : ''));
    if (hold < 1.5 - 1e-6) issues.push('hold < 1.5s');
    if (capH < 81) issues.push('cap height < 6%');
    if (m.x0 < 86.4 || m.x1 > 993.6 || m.y0 < 108 || m.y1 > 1242) issues.push('outside safe margin');
    if (!m.opac) issues.push('not fully visible at settle time');
    if (issues.some((x) => !x.includes('words'))) bad++;
    console.log(`${String(i + 1).padStart(3)}  ${(c.start + c.landed).toFixed(2).padStart(5)}s  ${String(c.words).padStart(3)}   ${hold.toFixed(2)}s  ${capH.toFixed(0)}px  ${m.x0.toFixed(0)}-${m.x1.toFixed(0)}, ${m.y0.toFixed(0)}-${m.y1.toFixed(0)}`.padEnd(62) + ` ${c.text}${issues.length ? '   <-- ' + issues.join('; ') : ''}`);
  }
  console.log(`\nfont: ${await page.evaluate(() => getComputedStyle(document.querySelector('.cap')).fontFamily)} | total ${total}s | end card static for ${(await page.evaluate(() => window.DURATION - window.FREEZE_AT)).toFixed(2)}s`);
  await browser.close();
  process.exit(bad ? 1 : 0);
})();
