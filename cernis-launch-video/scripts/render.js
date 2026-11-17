// Frame-by-frame renderer: headless Chromium seeks the timeline, ffmpeg encodes.
//
//   node scripts/render.js --stills 6.5,17.5,34.5     PNG stills at those seconds -> out/stills/
//   node scripts/render.js --sheet                    low-res contact sheet per scene -> out/sheets/ (QA)
//   node scripts/render.js --scene s03                one scene -> out/scenes/s03.mp4
//   node scripts/render.js --all                      every scene (4 in parallel; --jobs N to change), then joined -> out/cernis-launch.mp4
//   add --audio path/to/track.wav to mux a music bed into the joined file
const { chromium } = require('playwright');
const { spawn, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const W = 1080, H = 1350, FPS = 30;
const SS = 2; // supersample factor: frames are captured at 2x and scaled down for clean edges on tilted cards
const root = path.join(__dirname, '..');
const out = path.join(root, 'out');
const arg = (n) => { const i = process.argv.indexOf('--' + n); return i < 0 ? null : process.argv[i + 1] || true; };

async function open(scale) {
  // One raster tile for the whole 2x frame keeps large soft shadows perfectly smooth.
  const browser = await chromium.launch({ args: ['--default-tile-width=4096', '--default-tile-height=4096'] });
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: scale });
  page.on('pageerror', (e) => { console.error('PAGE ERROR:', e.message); process.exitCode = 1; });
  await page.goto('file://' + path.join(root, 'src/index.html') + '?render');
  await page.evaluate(() => document.fonts.ready);
  const fontOk = await page.evaluate(() => document.fonts.check('600 40px Geist'));
  if (!fontOk) throw new Error('Geist font did not load');
  const scenes = await page.evaluate(() => window.SCENES);
  return { browser, page, scenes };
}
const shot = async (page, t) => { await page.evaluate((x) => window.seek(x), t); return page.screenshot({ type: 'png' }); };

function encoder(file) {
  const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'png', '-i', '-',
    '-vf', `scale=${W}:${H}:flags=lanczos,format=yuv420p`, '-c:v', 'libx264', '-preset', 'slow', '-crf', '15', '-r', String(FPS),
    '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-movflags', '+faststart', file], { stdio: ['pipe', 'inherit', 'inherit'] });
  const done = new Promise((res, rej) => ff.on('close', (c) => (c ? rej(new Error('ffmpeg exited ' + c)) : res())));
  return { ff, done };
}

async function renderScene(page, sc) {
  const file = path.join(out, 'scenes', sc.id + '.mp4');
  const n = Math.round(sc.dur * FPS);
  const { ff, done } = encoder(file);
  for (let i = 0; i < n; i++) {
    const buf = await shot(page, sc.start + i / FPS);
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
  }
  ff.stdin.end();
  await done;
  console.log(`${sc.id}: ${n} frames -> ${path.relative(root, file)}`);
  return file;
}

(async () => {
  for (const d of ['stills', 'sheets', 'scenes']) fs.mkdirSync(path.join(out, d), { recursive: true });

  if (arg('stills')) {
    const { browser, page } = await open(SS);
    for (const t of String(arg('stills')).split(',').map(Number)) {
      const tmp = path.join(out, 'stills', '_tmp.png');
      fs.writeFileSync(tmp, await shot(page, t));
      const file = path.join(out, 'stills', `still-${t.toFixed(2).replace('.', '_')}s.png`);
      spawnSync('ffmpeg', ['-v', 'error', '-y', '-i', tmp, '-vf', `scale=${W}:${H}:flags=lanczos`, file], { stdio: 'inherit' });
      fs.unlinkSync(tmp);
      console.log('still', t, '->', path.relative(root, file));
    }
    await browser.close();
    return;
  }

  if (arg('sheet')) {
    const only = typeof arg('sheet') === 'string' ? arg('sheet').split(',') : null;
    const per = +(arg('n') || 8);
    const { browser, page, scenes } = await open(0.5);
    for (const sc of scenes) {
      if (only && !only.includes(sc.id)) continue;
      const dir = path.join(out, 'sheets', '_' + sc.id);
      fs.mkdirSync(dir, { recursive: true });
      for (let i = 0; i < per; i++) fs.writeFileSync(path.join(dir, `${String(i).padStart(2, '0')}.png`), await shot(page, sc.start + (sc.dur - 1 / FPS) * (i / (per - 1))));
      spawnSync('ffmpeg', ['-v', 'error', '-y', '-i', path.join(dir, '%02d.png'), '-vf', `tile=${Math.ceil(per / 2)}x2:padding=6:color=0x999999`, path.join(out, 'sheets', sc.id + '.png')], { stdio: 'inherit' });
      fs.rmSync(dir, { recursive: true });
      console.log('sheet', sc.id);
    }
    await browser.close();
    return;
  }

  const { browser, page, scenes } = await open(SS);
  const todo = arg('all') ? scenes : scenes.filter((s) => s.id === arg('scene'));
  if (!todo.length) throw new Error('nothing to render: pass --all, --scene <id>, --stills <t,...> or --sheet');
  let files = [];
  const jobs = +(arg('jobs') || 4);
  if (arg('all') && jobs > 1) {
    // One child process per scene, `jobs` at a time (longest scenes first), each writing its own file.
    await browser.close();
    const queue = [...todo].sort((x, y) => y.dur - x.dur);
    const worker = async () => {
      for (let sc = queue.shift(); sc; sc = queue.shift()) {
        await new Promise((res, rej) => {
          const c = spawn(process.execPath, [__filename, '--scene', sc.id], { stdio: 'inherit' });
          c.on('close', (code) => (code ? rej(new Error(`scene ${sc.id} failed (${code})`)) : res()));
        });
      }
    };
    await Promise.all(Array.from({ length: jobs }, worker));
    files = todo.map((sc) => path.join(out, 'scenes', sc.id + '.mp4'));
  } else {
    for (const sc of todo) files.push(await renderScene(page, sc));
    await browser.close();
  }

  if (arg('all')) {
    const list = path.join(out, 'scenes', 'list.txt');
    fs.writeFileSync(list, files.map((f) => `file '${f}'`).join('\n') + '\n');
    const final = path.join(out, 'cernis-launch.mp4');
    const audio = typeof arg('audio') === 'string' ? arg('audio') : null;
    const args = ['-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', list];
    if (audio) args.push('-i', audio, '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest');
    else args.push('-c', 'copy');
    args.push('-movflags', '+faststart', final);
    const r = spawnSync('ffmpeg', args, { stdio: 'inherit' });
    if (r.status) throw new Error('concat failed');
    console.log('joined ->', path.relative(root, final));
  }
})().catch((e) => { console.error(e); process.exit(1); });
