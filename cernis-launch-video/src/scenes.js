// Scene definitions. Times are seconds local to each scene.
// Cut grid: 120 BPM (one beat = 0.5s). Scenes start on a beat; internal changes land on bars (2s).
/* global scene, startTimeline, A */

const ROLE = 'Senior Backend Engineer';

// Drops the coral dot onto the wordmark's "i" and staggers the letters in.
function wordmarkSting(S, root, t0) {
  S.q(root + ' .wl').forEach((e, i) => {
    const t = t0 + i * 0.045;
    S.tw(e, [[t, { o: t0 === 0 ? 0.28 : 0, y: 150, blur: 8 }], [t + 0.3, { o: 1 }, 'out'], [t + 0.55, { y: 0, blur: 0 }, 'out5']]);
  });
  const d = t0 + 0.8;
  S.tw(root + ' .wdot', [
    [t0, { y: -1300, sx: 1, sy: 1, o: t0 === 0 ? 1 : 0 }], [t0 + 0.1, { o: 1 }],
    [d, { y: 0 }, 'in2'], [d - 0.02, { sx: 1, sy: 1 }], [d + 0.06, { sx: 1.22, sy: 0.7 }, 'out'], [d + 0.16, { sx: 1, sy: 1 }, 'out'],
    [d + 0.16, { y: -150 }, 'out'], [d + 0.32, { y: 0 }, 'in2'], [d + 0.4, { y: -36 }, 'out'], [d + 0.48, { y: 0 }, 'in2'],
  ]);
  S.tw(root + ' .wring', [[0, { o: 0, s: 1 }], [d, { o: 0, s: 1 }], [d, { o: 0.75, s: 1 }], [d + 0.55, { o: 0, s: 3.4 }, 'out']]);
}

// 01 · Logo sting open (4s)
scene('s01', 4, (S) => {
  S.tw('#s01-wm', [[0, { s: 0.94, o: 1, blur: 0 }], [1.5, { s: 1 }, 'out5'], [1.66, { s: 1, o: 1, blur: 0 }], [1.96, { s: 1.08, o: 0, blur: 14 }, 'in2']]);
  wordmarkSting(S, '#s01-wm', 0);
  S.chars('#s01-intro', 2.0, 0.028);
  S.out('#s01-intro', 2.72, 0.26, -50);
  S.tw('#s01-tile', [[0, { o: 0, s: 0.2, rz: -20 }], [2.96, { o: 0, s: 0.2, rz: -20 }], [2.96, { o: 1 }], [3.46, { s: 1, rz: 0 }, 'spring'], [3.56, { s: 1 }], [4.0, { s: 9.5 }, 'in']]);
  S.tw('#s01-glyph', [[3.6, { o: 1 }], [3.84, { o: 0 }, 'lin']]);
});

// 02 · Hero line (4s)
scene('s02', 4, (S) => {
  const G = [['briefcase', 110, 110, 70, -12], ['user-check', 345, 50, 54, 8], ['search', 585, 120, 62, -6], ['star', 815, 60, 52, 14],
    ['message-circle', 930, 215, 60, -10], ['file-text', 215, 285, 56, 10], ['code', 480, 300, 58, -8], ['sparkles', 730, 315, 60, 6], ['badge-check', 70, 400, 50, -6]];
  const box = S.q('#s02-glyphs')[0];
  box.innerHTML = G.map(([n, x, y, sz]) => `<i class="ic" data-icon="${n}" style="left:${x}px;top:${y}px;font-size:${sz}px"></i>`).join('');
  S.hydrate(box);
  [...box.children].forEach((e, i) => {
    const t = 0.1 + i * 0.07, r = G[i][4];
    S.tw(e, [[t, { o: 0, s: 0.2, rz: r - 40 }], [t + 0.5, { o: G[i][2] > 250 ? 0.5 : 0.75, s: 1, rz: r }, 'back']]);
  });
  S.float('#s02-glyphs i', 12, 3.4, 0, 5);
  S.tw('#s02-flood', [[0, { o: 1 }], [0.6, { o: 0 }, 'io']]);
  S.tw('#s02-wash', [[0, { s: 1.9 }], [1.0, { s: 1 }, 'out5'], [4, { s: 1.06 }, 'lin']]);
  S.words('#s02-h', 0.5, 0.12);
  S.tw('#s02-h', [[0, { s: 0.975 }], [4, { s: 1.02 }, 'lin']]);
  S.tw('#s02-h', [[3.74, { o: 1, blur: 0 }], [4.0, { o: 0, blur: 12 }, 'in2']]);
  S.tw('#s02-wm', [[1.6, { o: 0, y: 24 }], [2.1, { o: 1, y: 0 }, 'out']]);
});

// 03 · Post a role for free (6s)
scene('s03', 6, (S) => {
  S.words('#s03-h', -0.12, 0.1);
  S.out('#s03-h', 2.9, 0.4, -90);
  S.tw('#s03-card', [
    [-0.1, { y: 860, rx: 42, ry: -28, rz: 10, o: 0 }], [0.1, { o: 1 }],
    [1.2, { y: 0, rx: 17, ry: -13, rz: 3.6 }, 'out5'], [2.9, { y: 0, rx: 12, ry: -9, rz: 2.6 }, 'lin'],
    [3.6, { y: 0, rx: 5, ry: 0, rz: 0 }, 'io'], [5.6, { y: 0, rx: 4, ry: 5, rz: -0.8 }, 'lin'], [6.1, { y: -1700, rx: -22, ry: 5, rz: -4 }, 'in'],
  ]);
  S.tw('#s03-cam', [[2.9, { s: 1, y: 0 }], [3.6, { s: 1.24, y: -112 }, 'io'], [5.6, { s: 1.29, y: -112 }, 'lin']]);
  S.type('#s03-type', ROLE, 0.95, 2.05);
  const caret = S.q('#s03-caret')[0];
  S.fn((t) => { caret.style.opacity = t > 0.7 && t < 3.0 && (t < 2.1 || Math.floor(t * 2.5) % 2 === 0) ? 1 : 0; });
  S.q('#s03-card .v').forEach((e, i) => S.tw(e, [[2.1 + i * 0.12, { o: 0, x: -16 }], [2.35 + i * 0.12, { o: 1, x: 0 }, 'out']]));
  S.q('#s03-card .chip').forEach((e, i) => S.pop(e, 2.32 + i * 0.12));
  S.tw('#s03-cur', [[2.5, { x: 900, y: 880, s: 1, o: 0 }], [2.7, { o: 1 }], [3.6, { x: 652, y: 640, s: 1 }, 'io'], [3.72, { s: 1 }], [3.8, { s: 0.8 }, 'out'], [3.98, { s: 1 }, 'out'],
    [4.4, { x: 652, y: 640, o: 1 }], [5.2, { x: 770, y: 760, o: 0 }, 'io']]);
  S.tw('#s03-btn', [[3.76, { s: 1 }], [3.84, { s: 0.93 }, 'out'], [4.08, { s: 1 }, 'back']]);
  S.tw('#s03-btn .b0', [[3.86, { o: 1 }], [3.94, { o: 0 }, 'lin']]);
  S.tw('#s03-btn .b1', [[3.9, { o: 0, y: 16 }], [4.12, { o: 1, y: 0 }, 'out']]);
  S.tw('#s03-ring', [[0, { o: 0, s: 1 }], [3.84, { o: 0, s: 1 }], [3.84, { o: 0.85 }], [4.55, { o: 0, s: 1.5 }, 'out']]);
  S.tw('#s03-status .st0', [[3.9, { o: 1 }], [4.0, { o: 0 }, 'lin']]);
  S.tw('#s03-status .st1', [[3.95, { o: 0 }], [4.1, { o: 1 }, 'lin']]);
});

// 04 · Experts who know the role compete to fill it (6s)
scene('s04', 6, (S) => {
  const X = [['Maya Okafor', 0], ['Daniel Reyes', 4], ['Sofia Lind', 1], ['Arjun Mehta', 2]];
  const list = S.q('#s04-list')[0];
  list.innerHTML = X.map(([n, a], i) => `<div class="lane" style="top:${i * 192}px">
    <div class="row" style="gap:20px"><i class="av" data-av="${a}"></i><div><div class="nm">${n}</div><div class="sub"><i class="ic" data-icon="badge-check"></i>Knows this role</div></div></div>
    <div class="pk"><span class="p0">Viewing</span><span class="p1"><i class="ic" data-icon="check"></i>Picked up</span></div>
    <div class="tr"><div class="fl"></div></div></div>`).join('');
  S.hydrate(list);
  S.words('#s04-h1', -0.12, 0.1);
  S.out('#s04-h1', 2.85, 0.25, -60);
  S.words('#s04-h2', 3.05, 0.13);
  S.tw('#s04-chip', [[0.05, { o: 0, y: -34, s: 0.9 }], [0.55, { o: 1, y: 0, s: 1 }, 'back']]);
  S.tw('#s04-list', [[0, { rx: 15, ry: -17, rz: 2.6, s: 0.96 }], [2.9, { rx: 12, ry: -12, rz: 1.9, s: 0.99 }, 'lin'], [3.6, { rx: 10, ry: 13, rz: -1.9, s: 1 }, 'io'], [6, { rx: 8, ry: 9, rz: -1.3, s: 1.04 }, 'lin']]);
  const fills = [[30, 52, 68], [22, 61, 93], [34, 45, 56], [18, 50, 79]];
  S.q('#s04-list .lane').forEach((e, i) => {
    const t = 0.2 + i * 0.3;
    S.tw(e, [[t, { x: 1150, rz: 9, o: 0, s: 1 }], [t + 0.08, { o: 1 }], [t + 0.72, { x: 0, rz: 0 }, 'out5']]);
    S.tw(e.querySelector('.p0'), [[t + 0.82, { o: 1 }], [t + 0.92, { o: 0 }, 'lin']]);
    S.tw(e.querySelector('.p1'), [[t + 0.84, { o: 0, s: 0.6 }], [t + 0.92, { o: 1 }], [t + 1.2, { s: 1 }, 'back']]);
    const [a, b, c] = fills[i];
    S.tw(e.querySelector('.tr'), [[3.0, { o: 0 }], [3.3, { o: 1 }, 'lin']]);
    S.tw(e.querySelector('.fl'), [[3.25, { wp: 0 }], [4.2, { wp: a }, 'io'], [5.0, { wp: b }, 'io'], [5.85, { wp: c }, 'out']]);
  });
  const lead = S.q('#s04-list .lane')[1];
  S.tw(lead, [[5.05, { s: 1 }], [5.4, { s: 1.035 }, 'back']]);
  S.fn((t) => lead.classList.toggle('lead', t >= 5.05));
});

// 05 · Cernis runs sourcing / screening / assessment (6s)
scene('s05', 6, (S) => {
  const R = [['Ana Ruiz', 'Backend Engineer', 2, 'linkedin'], ['Tom Becker', 'Platform Engineer', 1, 'github'], ['Leo Martin', 'Software Engineer', 3, 'wellfound'],
    ['Wei Zhang', 'Staff Engineer', 4, 'linkedin'], ['Noor Haddad', 'Backend Engineer', 5, 'network']];
  const pass = { 3: 0, 0: 1, 1: 2 }; // row index -> final rank slot
  const box = S.q('#s05-rows')[0];
  box.innerHTML = R.map(([n, sub, a, src], i) => `<div class="prow" style="top:${i * 96}px"><div class="bg"></div>
    <span class="rk">${i in pass ? pass[i] + 1 : ''}</span>
    <div class="who"><i class="av" data-av="${a}"></i><div><div class="nm">${n}</div><div class="sb2">${sub}</div></div></div>
    <div class="rt"><span class="src">${src === 'network' ? '<i class="ic" data-icon="network" style="width:100%;height:100%"></i>' : A.brand[src]}</span>
      <span class="mk ${i in pass ? 'ok' : 'no'}"><i class="ic" data-icon="${i in pass ? 'check' : 'x'}"></i></span><span class="sc"><i></i></span></div></div>`).join('');
  S.hydrate(box);
  const steps = S.q('.step');
  S.fn((t) => { const k = t < 2 ? 0 : t < 4 ? 1 : 2; steps.forEach((e, i) => { e.classList.toggle('act', i === k); e.classList.toggle('done', i < k); }); });
  S.tw('#s05-card', [
    [-0.12, { y: 560, rx: 32, ry: 22, rz: -6, s: 0.9, o: 0 }], [0.08, { o: 1 }],
    [0.95, { y: 0, rx: 13, ry: 15, rz: -3.2, s: 1 }, 'out5'], [1.95, { y: 0, rx: 12, ry: 12, rz: -2.6, s: 1 }, 'lin'],
    [2.5, { y: 0, rx: 10, ry: -14, rz: 2.8, s: 1 }, 'out5'], [3.95, { y: 0, rx: 9, ry: -11, rz: 2.2, s: 1 }, 'lin'],
    [4.5, { y: 20, rx: 6, ry: 5, rz: -1, s: 1.05 }, 'out5'], [6, { y: 20, rx: 5, ry: 2, rz: -0.4, s: 1.07 }, 'lin'],
  ]);
  const slotY = [8, 142, 276];
  S.q('#s05-rows .prow').forEach((e, i) => {
    const t = 0.3 + i * 0.2, t2 = 2.2 + i * 0.2, ok = i in pass, j = pass[i];
    const q = (s) => e.querySelector(s);
    S.tw(e, [[t, { x: 280, y: 0, o: 0 }], [t + 0.45, { x: 0, y: 0, o: 1 }, 'out5']]);
    S.pop(q('.src'), t + 0.25);
    S.tw(q('.src'), [[t2, { o: 1 }], [t2 + 0.12, { o: 0 }, 'lin']]);
    S.tw(q('.mk'), [[t2 + 0.05, { o: 0, s: 0.3 }], [t2 + 0.13, { o: 1 }], [t2 + 0.45, { s: 1 }, 'back']]);
    S.tw(q('.rk'), [[0, { o: 0, s: 0.3 }]]);
    S.tw(q('.sc'), [[0, { o: 0 }]]);
    if (!ok) {
      S.tw(e, [[t2 + 0.2, { o: 1 }], [t2 + 0.5, { o: 0.34 }, 'out'], [4.05, { x: 0, o: 0.34 }], [4.35, { x: -90, o: 0 }, 'in2']]);
    } else {
      const t3 = 4.12 + j * 0.1;
      S.tw(e, [[t3, { y: 0 }], [t3 + 0.6, { y: slotY[j] - i * 96 }, 'io']]);
      S.tw(q('.mk'), [[4.05, { o: 1 }], [4.2, { o: 0 }, 'lin']]);
      S.tw(q('.who'), [[t3, { x: 0 }], [t3 + 0.5, { x: 64 }, 'io']]);
      S.tw(q('.rk'), [[t3 + 0.4, { o: 0, s: 0.3 }], [t3 + 0.48, { o: 1 }], [t3 + 0.8, { s: 1 }, 'back']]);
      S.tw(q('.sc'), [[t3 + 0.35, { o: 0 }], [t3 + 0.55, { o: 1 }, 'lin']]);
      S.tw(q('.sc i'), [[t3 + 0.5, { wp: 0 }], [t3 + 1.35, { wp: [93, 79, 64][j] }, 'out5']]);
      if (j === 0) S.tw(q('.bg'), [[t3 + 0.5, { o: 0 }], [t3 + 0.9, { o: 1 }, 'lin']]);
    }
  });
  S.tw('#s05-foot', [[4.9, { o: 0, y: 24, s: 0.9 }], [5.3, { o: 1, y: 0, s: 1 }, 'back']]);
  S.words('#s05-h', -0.1, 0.1);
  S.cyc('#s05-w0', 0.2, 1.82);
  S.cyc('#s05-w1', 2.0, 3.82);
  S.cyc('#s05-w2', 4.0);
});

// 06 · Sourcing across LinkedIn, Wellfound, GitHub, referral networks (6s)
scene('s06', 6, (S) => {
  S.words('#s06-h', -0.12, 0.1);
  const names = [0.9, 2.15, 3.4, 4.65];
  names.forEach((t, i) => S.cyc('#s06-w' + i, t, i < 3 ? names[i + 1] - 0.14 : null));
  const L = [[-520, -420, -9], [520, -380, 8], [-520, 420, 7], [520, 440, -7]];
  L.forEach(([dx, dy, r], i) => {
    const t = -0.1 + i * 0.14, tn = names[i];
    S.tw('#s06-l' + i, [[t, { x: dx, y: dy, rz: r * 5, s: 0.4, o: 0 }], [t + 0.12, { o: 1 }], [t + 0.85, { x: 0, y: 0, rz: r }, 'out5'], [t + 0.85, { s: 1 }, 'out5'],
      [tn - 0.08, { s: 1 }], [tn + 0.28, { s: 1.24 }, 'back'], [tn + 1.0, { s: 1.24 }], [tn + 1.3, { s: 1 }, 'io']]);
  });
  S.float('.logo', 12, 3.6, 0.2, 2);
  const P = [[200, -300, 7], [-380, 0, -8], [400, 60, 6], [0, 320, -5]];
  P.forEach(([dx, dy, r], i) => {
    const t = 0.3 + i * 0.16;
    S.tw('#s06-p' + i, [[t, { x: dx, y: dy, rz: r * 3, o: 0, s: 0.86 }], [t + 0.2, { o: 0.96 }], [t + 0.95, { x: 0, y: 0, rz: r, s: 0.86 }, 'out5']]);
  });
  S.float('.pcard', 9, 4.1, 0.5, 1.2);
});

// 07 · Compare ranked shortlists side by side and hire (6s)
scene('s07', 6, (S) => {
  const lists = {
    a: ['Maya Okafor', 0, [['Wei Zhang', 'Staff Engineer', 4], ['Ana Ruiz', 'Backend Engineer', 2], ['Tom Becker', 'Platform Engineer', 1]], [94, 80, 66]],
    b: ['Daniel Reyes', 4, [['Sam Patel', 'Backend Engineer', 3], ['Wei Zhang', 'Staff Engineer', 4], ['Noor Haddad', 'Backend Engineer', 5]], [90, 77, 61]],
  };
  for (const k of ['a', 'b']) {
    const [who, av, rows, bars] = lists[k];
    const card = S.q('#s07-' + k)[0];
    card.innerHTML = `<div class="hd"><i class="av" data-av="${av}"></i><div><small>Shortlist by</small><b>${who}</b></div></div>` +
      rows.map(([n, sub, a], i) => `<div class="srow"><div class="bg"></div><span class="rk ${i ? 'r2' : ''}">${i + 1}</span><i class="av" data-av="${a}"></i>
        <div><div class="nm">${n}</div><div class="sb2">${sub}</div><div class="sc"><i></i></div></div></div>`).join('') +
      `<div class="hire"><span class="h0">Hire ${rows[0][0]}</span><span class="h1">Hire ${rows[0][0]}</span><span class="h2"><b class="cdot"></b>Hired</span></div>` +
      (k === 'a' ? '<div class="cur" id="s07-cur" style="left:0;top:0" data-cursor></div>' : '');
    S.hydrate(card);
    const sgn = k === 'a' ? 1 : -1, t = k === 'a' ? -0.05 : 0.1;
    S.tw(card, [[t, { x: -700 * sgn, rx: 8, ry: 55 * sgn, rz: -7 * sgn, o: 0 }], [t + 0.15, { o: 1 }], [t + 0.95, { x: 0, rx: 7, ry: 16 * sgn, rz: -1.4 * sgn }, 'out5'],
      [3.3, { x: 0, rx: 6, ry: 12 * sgn, rz: -1 * sgn }, 'lin'], [4.0, { x: 0, rx: 3, ry: (k === 'a' ? 4 : -14), rz: 0 }, 'io'], [6, { x: 0, rx: 2, ry: (k === 'a' ? 1 : -11), rz: 0 }, 'lin']]);
    card.querySelectorAll('.sc i').forEach((e, i) => S.tw(e, [[t + 0.95 + i * 0.12, { wp: 0 }], [t + 1.75 + i * 0.12, { wp: bars[i] }, 'out5']]));
    S.tw(card.querySelector('.srow .bg'), [[t + 0.9, { o: 0 }], [t + 1.3, { o: 1 }, 'lin']]);
    S.tw(card.querySelector('.h1'), [[0, { o: 0 }]]);
    S.tw(card.querySelector('.h2'), [[0, { o: 0 }]]);
  }
  S.words('#s07-h', -0.12, 0.1);
  S.out('#s07-h', 3.25, 0.3, -70);
  S.tw('#s07-cam', [[3.3, { s: 1, y: 0 }], [4.0, { s: 1.28, y: -150 }, 'io'], [6, { s: 1.33, y: -150 }, 'lin']]);
  S.words('#s07-h2', 3.85, 0.16);
  S.tw('#s07-cur', [[3.7, { x: 440, y: 780, s: 1, o: 0 }], [3.9, { o: 1 }], [4.45, { x: 262, y: 586, s: 1 }, 'io'], [4.56, { s: 1 }], [4.64, { s: 0.8 }, 'out'], [4.82, { s: 1 }, 'out'],
    [5.1, { x: 262, y: 586, o: 1 }], [5.7, { x: 380, y: 700, o: 0 }, 'io']]);
  S.tw('#s07-a .h1', [[4.28, { o: 0 }], [4.42, { o: 1 }, 'lin']]);
  S.tw('#s07-a .hire', [[4.6, { s: 1 }], [4.68, { s: 0.94 }, 'out'], [4.92, { s: 1 }, 'back']]);
  S.tw('#s07-a .h2', [[4.7, { o: 0 }], [4.8, { o: 1 }, 'lin']]);
  S.tw('#s07-a .cdot', [[4.74, { s: 0 }], [5.2, { s: 1 }, 'spring']]);
});

// 08 · 24 hours to ideal candidates, 48 hours to a closed hire (4s)
scene('s08', 4, (S) => {
  const C = 2136.3;
  let ticks = '';
  for (let i = 0; i < 48; i++) {
    const a = (i / 48) * Math.PI * 2, r1 = i % 6 ? 296 : 286, r2 = 308;
    ticks += `<line x1="${400 + Math.sin(a) * r1}" y1="${400 - Math.cos(a) * r1}" x2="${400 + Math.sin(a) * r2}" y2="${400 - Math.cos(a) * r2}"/>`;
  }
  S.q('#s08-ticks')[0].innerHTML = ticks;
  S.tw('#s08-ring', [[-0.1, { s: 0.82, o: 0 }], [0.06, { o: 1 }], [0.6, { s: 1 }, 'out5'], [2.02, { s: 1 }], [2.14, { s: 1.035 }, 'out'], [2.6, { s: 1 }, 'out']]);
  S.tw('#s08-arc', [[0.1, { dash: C }], [1.0, { dash: C / 2 }, 'out5'], [2.05, { dash: C / 2 }], [2.9, { dash: 0 }, 'out5']]);
  S.tw('#s08-dot', [[0.1, { rz: 0 }], [1.0, { rz: 180 }, 'out5'], [2.05, { rz: 180 }], [2.9, { rz: 360 }, 'out5']]);
  S.tw('#s08-num', [[-0.1, { s: 0.7, o: 0 }], [0.06, { o: 1 }], [0.55, { s: 1 }, 'back'], [2.02, { s: 1 }], [2.14, { s: 1.12 }, 'out'], [2.6, { s: 1 }, 'out']]);
  const n = S.q('#s08-n')[0], o3 = window.E.out;
  S.fn((t) => {
    let v = 24 * o3(Math.min(1, Math.max(0, (t - 0.1) / 0.8)));
    if (t > 2.05) v = 24 + 24 * o3(Math.min(1, (t - 2.05) / 0.75));
    n.textContent = Math.round(v);
  });
  S.words('#s08-l0', 0.2, 0.09);
  S.out('#s08-l0', 1.84, 0.2, -60);
  S.words('#s08-l1', 2.1, 0.09);
});

// 09 · Chat reactions (6s)
scene('s09', 6, (S) => {
  S.tw('#s09-wrap', [[0, { y: 300 }], [2.15, { y: 300 }], [2.75, { y: 200 }, 'io'], [3.65, { y: 200 }], [4.25, { y: 140 }, 'io'], [6, { y: 130 }, 'lin']]);
  S.tw('#s09-chan', [[-0.2, { o: 0 }], [0.2, { o: 1 }, 'lin']]);
  const msg = (i, t, wordsAt) => {
    S.tw(`#s09-m${i} .mav`, [[t, { o: 0, s: 0.4 }], [t + 0.08, { o: 1 }], [t + 0.42, { s: 1 }, 'back']]);
    S.tw(`#s09-m${i} .mn`, [[t + 0.06, { o: 0, x: -24 }], [t + 0.36, { o: 1, x: 0 }, 'out']]);
    S.words('#s09-t' + i, wordsAt, 0.09);
  };
  msg(0, -0.12, 0.15);
  S.tw('#s09-att', [[0.85, { o: 0, y: 24 }], [1.25, { o: 1, y: 0 }, 'out']]);
  msg(1, 2.3, 2.5);
  msg(2, 3.8, 4.0);
  const counts = [[[1.4, 2], [1.7, 3], [2.0, 5], [2.6, 6], [3.2, 8], [4.4, 9]], [[1.7, 1], [2.3, 2], [3.0, 4], [4.8, 5]], [[2.0, 1], [2.8, 2], [4.1, 3]]];
  counts.forEach((c, i) => {
    S.pop('#s09-r' + i, c[0][0], 0.4);
    const pill = S.q('#s09-r' + i)[0], num = S.q('#s09-c' + i)[0];
    S.fn((t) => {
      let last = c[0];
      for (const k of c) if (k[0] <= t) last = k;
      num.textContent = last[1];
      const dt = t - last[0];
      pill.style.scale = last !== c[0] && dt >= 0 && dt < 0.35 ? 1 + 0.14 * Math.sin((dt / 0.35) * Math.PI) : 1;
    });
  });
});

// 10 · 10–15% of first-year salary, only on hire. Agencies 20–25%. (4s)
scene('s10', 4, (S) => {
  S.tw('#s10-n', [[-0.1, { s: 0.6, o: 0, blur: 16 }], [0.05, { o: 1 }], [0.55, { s: 1, blur: 0 }, 'back']]);
  S.words('#s10-sub', 0.35, 0.09);
  S.tw('#s10-pill', [[0.95, { s: 0.4, o: 0 }], [1.02, { o: 1 }], [1.45, { s: 1 }, 'spring']]);
  S.tw('#s10-top', [[1.95, { s: 1, y: 0 }], [2.55, { s: 0.72, y: -70 }, 'io']]);
  S.tw('#s10-r0', [[2.2, { o: 0, y: 44 }], [2.6, { o: 1, y: 0 }, 'out']]);
  S.tw('#s10-r1', [[2.42, { o: 0, y: 44 }], [2.82, { o: 1, y: 0 }, 'out']]);
  S.tw('#s10-b0', [[2.35, { w: 0 }], [3.15, { w: 860 }, 'out5']]);
  S.tw('#s10-b1', [[2.6, { w: 0 }], [3.4, { w: 516 }, 'out5']]);
});

// 11 · Free replacement within 60 days (3s)
scene('s11', 3, (S) => {
  S.tw('#s11-ring', [[-0.1, { s: 0.6, o: 0 }], [0.03, { o: 1 }], [0.5, { s: 1 }, 'back']]);
  S.tw('#s11-arc', [[0.15, { dash: 1156.1 }], [1.35, { dash: 0 }, 'io']]);
  S.tw('#s11-ic', [[-0.1, { rz: -220, s: 0.5, o: 0 }], [0.04, { o: 1 }], [1.15, { rz: 0, s: 1 }, 'out5']]);
  S.words('#s11-h', 0.15, 0.1);
});

// 12 · CTA + logo sting close (5s)
scene('s12', 5, (S) => {
  S.words('#s12-tag', -0.12, 0.07);
  S.tw('#s12-btn', [[0.2, { s: 0.5, o: 0 }], [0.3, { o: 1 }], [0.8, { s: 1 }, 'spring'], [1.95, { s: 1 }], [2.03, { s: 0.94 }, 'out'], [2.25, { s: 1 }, 'back']]);
  S.tw('#s12-cur', [[1.0, { x: 930, y: 1180, s: 1, o: 0 }], [1.2, { o: 1 }], [1.86, { x: 610, y: 810, s: 1 }, 'io'], [1.92, { s: 1 }], [2.0, { s: 0.8 }, 'out'], [2.18, { s: 1 }, 'out']]);
  S.tw('#s12-ring', [[0, { o: 0, s: 1 }], [2.03, { o: 0, s: 1 }], [2.03, { o: 0.85 }], [2.6, { o: 0, s: 1.3 }, 'out']]);
  S.tw('#s12-a', [[2.3, { o: 1, s: 1, blur: 0 }], [2.58, { o: 0, s: 1.1, blur: 16 }, 'in2']]);
  S.tw('#s12-wm', [[0, { o: 0, s: 0.9 }], [2.5, { o: 0, s: 0.9 }], [2.5, { o: 1 }], [3.4, { s: 1 }, 'out5'], [5, { s: 1.03 }, 'lin']]);
  wordmarkSting(S, '#s12-wm', 2.5);
  S.tw('#s12-btn2', [[3.25, { o: 0, y: 44, s: 0.88 }], [3.75, { o: 1, y: 0, s: 1 }, 'back']]);
  S.tw('#s12-url', [[3.5, { o: 0, y: 22 }], [3.9, { o: 1, y: 0 }, 'out']]);
  const P = [[420, -360, 8], [-460, -200, -7], [460, 380, -6], [-420, 400, 5]];
  P.forEach(([dx, dy, r], i) => {
    const t = 2.62 + i * 0.12;
    S.tw('#s12-p' + i, [[t, { x: dx, y: dy, rz: r * 4, o: 0 }], [t + 0.15, { o: 1 }], [t + 0.95, { x: 0, y: 0, rz: r }, 'out5']]);
  });
  S.float('.pcard', 10, 4.0, 0.3, 1.2);
});

startTimeline();
