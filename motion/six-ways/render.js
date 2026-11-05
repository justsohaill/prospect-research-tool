// Usage: node render.js stills <outdir> t1 t2 ...   |   node render.js video <out.mp4>
const { chromium } = require('playwright');
const { execFileSync, spawn } = require('child_process');
const path = require('path'), fs = require('fs');
(async () => {
  const [mode, out, ...ts] = process.argv.slice(2);
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 1 });
  await page.goto('file://' + path.resolve(__dirname, 'index.html') + '?capture');
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(300);
  if (mode === 'stills') {
    fs.mkdirSync(out, { recursive: true });
    for (const t of ts) {
      await page.evaluate(t => renderAt(t), +t);
      await page.screenshot({ path: path.join(out, `t${(+t).toFixed(2)}.png`) });
    }
  } else {
    const fps = 30, dur = await page.evaluate(() => DUR), n = Math.round(dur * fps);
    const ff = spawn('ffmpeg', ['-y', '-f', 'image2pipe', '-framerate', String(fps), '-i', '-',
      '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '17', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out],
      { stdio: ['pipe', 'ignore', 'inherit'] });
    for (let i = 0; i < n; i++) {
      await page.evaluate(t => renderAt(t), i / fps);
      ff.stdin.write(await page.screenshot({ type: 'png' }));
    }
    ff.stdin.end(); await new Promise(r => ff.on('close', r));
  }
  await browser.close();
})();
