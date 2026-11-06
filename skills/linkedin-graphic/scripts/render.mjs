#!/usr/bin/env node
/**
 * LinkedIn Graphic renderer — HTML → still PNG + looping MP4 + QA report.
 *
 *   node render.mjs <graphic.html> [--out DIR] [--no-video] [--no-png]
 *                   [--fps 30] [--scale 2] [--hold 1.5] [--still MS|end]
 *                   [--chromium /opt/pw-browsers/chromium]
 *
 * Reads canvas size from <meta name="canvas" content="WxH"> and motion length from
 * <meta name="motion" content="duration=8000; still=end">. Time is driven
 * deterministically through window.__seek(ms) (see assets/base.html), so every frame
 * is exact — no screen recording, no dropped frames.
 *
 * Outputs (next to the HTML unless --out is given):
 *   <name>.png   still at 2x (2160×2700 for 4:5) — upload as an image post
 *   <name>.mp4   H.264, 1080 wide, ends on a hold of the final frame — upload as video
 *   <name>.qa.txt layout problems found (text clipped, off-canvas, overlaps, missing fonts/images)
 */
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); }
catch { ({ chromium } = await import('playwright')); }

const args = process.argv.slice(2);
const file = args.find(a => !a.startsWith('--') && !/^\d/.test(a) && a.endsWith('.html'));
if (!file) { console.error('usage: node render.mjs <graphic.html> [--out DIR] [--no-video] [--fps 30] [--scale 2]'); process.exit(1); }
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const flag = k => args.includes('--' + k);

const htmlPath = path.resolve(file);
const outDir = path.resolve(opt('out', path.dirname(htmlPath)));
const base = path.basename(htmlPath, '.html');
const fps = +opt('fps', 30);
const scale = +opt('scale', 2);
const holdS = +opt('hold', 1.5);
fs.mkdirSync(outDir, { recursive: true });

const src = fs.readFileSync(htmlPath, 'utf8');
const [W, H] = (src.match(/name="canvas"\s+content="(\d+)x(\d+)"/) || [, 1080, 1350]).slice(1).map(Number);

const launch = {};
const exe = opt('chromium', process.env.CHROMIUM_PATH);
if (exe) launch.executablePath = exe;
const browser = await chromium.launch(launch);
const page = await browser.newPage({ viewport: { width: W + 200, height: H + 200 }, deviceScaleFactor: scale });
const errors = [];
page.on('pageerror', e => errors.push('JS error: ' + e.message));
page.on('requestfailed', r => errors.push('Failed to load: ' + r.url().slice(0, 140)));

await page.goto(pathToFileURL(htmlPath).href + '?render=1', { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
await page.evaluate(() => Promise.all([...document.images].map(i => i.complete ? 0 : new Promise(r => { i.onload = i.onerror = r; }))));
const motion = await page.evaluate(() => window.__motion || { duration: 0, still: 'end' });
const hasSeek = await page.evaluate(() => typeof window.__seek === 'function');
const seek = ms => hasSeek ? page.evaluate(t => window.__seek(t), ms) : Promise.resolve();
const canvas = await page.$('#canvas');
if (!canvas) { console.error('No #canvas element found.'); process.exit(1); }

/* ---------- STILL ---------- */
const stillArg = opt('still', motion.still);
const stillAt = stillArg === 'end' ? motion.duration : +stillArg;
await seek(stillAt);
await page.waitForTimeout(50);
if (!flag('no-png')) {
  await canvas.screenshot({ path: path.join(outDir, base + '.png') });
  console.log('✓ still  ', path.join(outDir, base + '.png'), `(${W * scale}×${H * scale})`);
}

/* ---------- QA (on the still frame) ---------- */
const qa = await page.evaluate(() => {
  const c = document.querySelector('#canvas').getBoundingClientRect();
  const out = [];
  const name = el => (el.id ? '#' + el.id : el.tagName.toLowerCase() + (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.') : '')) + ' "' + (el.textContent || '').trim().slice(0, 40) + '"';
  const visible = el => { const s = getComputedStyle(el); return s.visibility !== 'hidden' && s.display !== 'none' && +s.opacity > 0.05; };
  const textEls = [...document.querySelectorAll('#canvas *')].filter(el =>
    visible(el) && [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()));
  // actual ink box of an element's own text (not its layout box — centred text in a wide box is fine)
  const textRect = el => {
    const rects = [...el.childNodes].filter(n => n.nodeType === 3 && n.textContent.trim()).flatMap(n => {
      const rg = document.createRange(); rg.selectNodeContents(n); return [...rg.getClientRects()];
    });
    if (!rects.length) return null;
    return { left: Math.min(...rects.map(r => r.left)), right: Math.max(...rects.map(r => r.right)),
             top: Math.min(...rects.map(r => r.top)), bottom: Math.max(...rects.map(r => r.bottom)) };
  };
  // nearest visible box (card, tile, pill …) that the text is supposed to sit inside
  const boxOf = el => {
    for (let p = el; p && p.id !== 'canvas'; p = p.parentElement) {
      const s = getComputedStyle(p);
      const painted = (s.backgroundColor !== 'rgba(0, 0, 0, 0)' && s.backgroundColor !== 'transparent') ||
        s.backgroundImage !== 'none' || parseFloat(s.borderLeftWidth) > 0 || s.boxShadow !== 'none';
      if (painted && p.getBoundingClientRect().width < c.width * 0.98) return p;
    }
    return null;
  };
  for (const el of textEls) {
    const r = textRect(el);
    if (!r || r.right - r.left === 0) continue;
    if (r.left < c.left + 20 || r.right > c.right - 20 || r.top < c.top + 16 || r.bottom > c.bottom - 12)
      out.push('OFF-CANVAS / too close to edge: ' + name(el));
    const box = boxOf(el);
    if (box) {
      const b = box.getBoundingClientRect();
      if (r.right > b.right - 3 || r.left < b.left + 1)
        out.push(`TEXT TOUCHES OR SPILLS OUT OF ITS BOX (${Math.round(Math.max(r.right - b.right, b.left - r.left))}px past the edge, needs ≥3px inside): ` + name(el));
    }
    if (el.scrollWidth > el.clientWidth + 2 && getComputedStyle(el).overflow !== 'visible')
      out.push('TEXT CLIPPED (horizontal): ' + name(el));
    const fs = parseFloat(getComputedStyle(el).fontSize);
    if (fs < 10.5) out.push(`TEXT TOO SMALL (${fs}px — min 10.5px at 1080 wide): ` + name(el));
  }
  // overlapping text boxes (leaf text elements only)
  const leaves = textEls.filter(el => !textEls.some(o => o !== el && el.contains(o)))
    .map(el => ({ el, r: el.getBoundingClientRect() })).filter(o => o.r.width > 0);
  let overlaps = 0;
  for (let i = 0; i < leaves.length && overlaps < 25; i++) for (let j = i + 1; j < leaves.length; j++) {
    const a = leaves[i].r, b = leaves[j].r;
    const ix = Math.min(a.right, b.right) - Math.max(a.left, b.left), iy = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
    if (ix > 3 && iy > 3 && ix * iy > 0.15 * Math.min(a.width * a.height, b.width * b.height)) {
      if (leaves[i].el.contains(leaves[j].el) || leaves[j].el.contains(leaves[i].el)) continue;
      out.push('TEXT OVERLAP: ' + name(leaves[i].el) + '  ×  ' + name(leaves[j].el)); overlaps++;
    }
  }
  for (const img of document.querySelectorAll('#canvas img')) if (!img.naturalWidth) out.push('BROKEN IMAGE: ' + img.getAttribute('src'));
  const fams = new Set([...document.fonts].filter(f => f.status === 'error').map(f => f.family));
  for (const f of fams) out.push('FONT FAILED: ' + f);
  const words = textEls.reduce((n, el) => n + [...el.childNodes].filter(x => x.nodeType === 3).map(x => x.textContent.trim().split(/\s+/).filter(Boolean).length).reduce((a, b) => a + b, 0), 0);
  return { issues: [...new Set(out)], textNodes: textEls.length, words, imgs: document.querySelectorAll('#canvas img, #canvas svg image').length };
});
const report = [
  `canvas ${W}×${H}  motion ${motion.duration}ms  text elements ${qa.textNodes}  words ${qa.words}  images ${qa.imgs}`,
  ...errors, ...qa.issues,
];
fs.writeFileSync(path.join(outDir, base + '.qa.txt'), report.join('\n') + '\n');
console.log(qa.issues.length + errors.length ? `⚠ QA: ${qa.issues.length + errors.length} issue(s) → ${base}.qa.txt` : '✓ QA clean', `  (${qa.words} words, ${qa.textNodes} text elements)`);
for (const l of report.slice(1, 13)) console.log('   ' + l);

/* ---------- VIDEO ---------- */
if (!flag('no-video') && motion.duration > 0) {
  const frames = Math.round(motion.duration / 1000 * fps);
  const holdFrames = Math.round(holdS * fps);
  const mp4 = path.join(outDir, base + '.mp4');
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-i', '-',
    '-vf', `scale=${W}:-2:flags=lanczos,format=yuv420p`, '-c:v', 'libx264', '-preset', 'slow', '-crf', '16',
    '-tune', 'animation', '-movflags', '+faststart', mp4], { stdio: ['pipe', 'inherit', 'inherit'] });
  const write = buf => new Promise(r => ff.stdin.write(buf) ? r() : ff.stdin.once('drain', r));
  let last;
  for (let i = 0; i <= frames; i++) {
    await seek(i / fps * 1000);
    last = await canvas.screenshot({ type: 'png' });
    await write(last);
    if (i % fps === 0) process.stdout.write(`\r  recording ${Math.round(i / frames * 100)}%`);
  }
  for (let i = 0; i < holdFrames; i++) await write(last);
  ff.stdin.end();
  await new Promise(r => ff.on('close', r));
  console.log(`\r✓ video  ${mp4}  (${((frames + holdFrames) / fps).toFixed(1)}s @ ${fps}fps)`);
}
await browser.close();
