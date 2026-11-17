// Scene definitions. Times are seconds local to each scene.
// Grid: 120 BPM. Scenes start on a beat (0.5s); caption words land one per eighth note (0.25s).
// Every caption stays fully on screen for at least 1.5s after its last word has settled.
/* global scene, startTimeline, A */

const ROLE = 'Senior Backend Engineer';
const TEXT = [540, 690, 0.95];   // glow behind centred text
const CARD = [540, 840, 1.15];  // glow behind a card in the lower two thirds
const person = (name, cls = 'av') => `<i class="${cls}" data-person="${name}"></i>`;

// The coral dot glides down onto the "i". No bounce.
function wordmark(S, root, t0) {
  S.tw(root, [[t0, { o: 0, s: 0.955 }], [t0 + 0.5, { o: 1 }, 'out'], [t0 + 1.1, { s: 1 }, 'soft']]);
  S.tw(root + ' .wdot', [[t0 + 0.1, { y: -330, o: 0 }], [t0 + 0.4, { o: 1 }, 'out'], [t0 + 1.15, { y: 0 }, 'soft']]);
}

// 01 · Logo sting open
scene('s01', 2, { glow: TEXT }, (S) => {
  S.tw('#s01-wm', [[0, { o: 1, s: 0.96 }], [1.7, { s: 1, o: 1 }, 'soft'], [1.98, { o: 0 }, 'io']]);
  S.tw('#s01-wm .wdot', [[0, { y: -330, o: 0.9 }], [0.1, { o: 1 }], [1.0, { y: 0 }, 'soft']]);
});

// 02 · Tagline
scene('s02', 4.5, { glow: TEXT }, (S) => {
  S.cap('#c02', 0.25, 4.25, { note: 'official tagline, kept whole (9 words)' });
});

// 03 · Post a role for free
scene('s03', 4.5, { glow: CARD }, (S) => {
  S.cap('#c03', 0.25, 4.25);
  S.tw('#s03-card', [[0.1, { o: 0, s: 0.94, y: 50 }], [0.55, { o: 1 }, 'out'], [1.3, { s: 1, y: 0 }, 'soft'], [4.2, { s: 1.02, y: 0, o: 1 }, 'lin'], [4.5, { o: 0 }, 'io']]);
  S.type('#s03-type', ROLE, 1.0, 1.9);
  const caret = S.q('#s03-caret')[0];
  S.fn((t) => { caret.style.opacity = t > 0.8 && t < 2.6 && (t < 1.95 || Math.floor(t * 2.5) % 2 === 0) ? 1 : 0; });
  S.q('#s03-card .v').forEach((e, i) => S.tw(e, [[1.95 + i * 0.1, { o: 0, y: 8 }], [2.3 + i * 0.1, { o: 1, y: 0 }]]));
  S.q('#s03-card .chip').forEach((e, i) => S.tw(e, [[2.1 + i * 0.1, { o: 0, y: 10 }], [2.5 + i * 0.1, { o: 1, y: 0 }]]));
  S.tw('#s03-cur', [[2.2, { x: 860, y: 800, o: 0 }], [2.45, { o: 1 }, 'out'], [3.05, { x: 652, y: 640 }, 'io'], [3.9, { x: 652, y: 640, o: 1 }], [4.2, { o: 0 }, 'io']]);
  S.tw('#s03-btn', [[3.1, { s: 1 }], [3.2, { s: 0.965 }, 'out'], [3.6, { s: 1 }, 'soft']]);
  S.tw('#s03-btn .b0', [[3.2, { o: 1 }], [3.32, { o: 0 }, 'lin']]);
  S.tw('#s03-btn .b1', [[3.26, { o: 0 }], [3.45, { o: 1 }, 'lin']]);
  S.tw('#s03-status .st0', [[3.26, { o: 1 }], [3.4, { o: 0 }, 'lin']]);
  S.tw('#s03-status .st1', [[3.32, { o: 0 }], [3.5, { o: 1 }, 'lin']]);
});

// 04 · Experts who know the role compete to fill it
scene('s04', 7, { glow: CARD }, (S) => {
  const X = ['Maya Okafor', 'Daniel Reyes', 'Sofia Lind', 'Arjun Mehta'];
  const list = S.q('#s04-list')[0];
  list.innerHTML = X.map((n, i) => `<div class="lane glass" style="top:${i * 190}px"><div class="ring"></div>
    <div class="row" style="gap:20px">${person(n)}<div><div class="nm">${n}</div><div class="sub"><i class="ic" data-icon="badge-check"></i>Knows this role</div></div></div>
    <div class="pk"><span class="p0">Viewing</span><span class="p1"><i class="ic" data-icon="check"></i>Picked up</span></div>
    <div class="tr"><div class="fl"></div></div></div>`).join('');
  S.hydrate(list);
  S.cap('#c04a', 0.25, 3.25);
  S.cap('#c04b', 3.5, 6.7);
  const fills = [[26, 50, 66], [20, 58, 92], [30, 42, 54], [16, 47, 78]];
  S.q('#s04-list .lane').forEach((e, i) => {
    const t = 0.15 + i * 0.16, tp = 1.3 + i * 0.3;
    S.enter(e, t, { y: 40, s: 0.96 });
    S.tw(e.querySelector('.p0'), [[tp, { o: 1 }], [tp + 0.25, { o: 0 }, 'lin']]);
    S.tw(e.querySelector('.p1'), [[tp + 0.05, { o: 0 }], [tp + 0.35, { o: 1 }, 'lin']]);
    const [a, b, c] = fills[i];
    S.tw(e.querySelector('.tr'), [[3.2, { o: 0 }], [3.6, { o: 1 }, 'lin']]);
    S.tw(e.querySelector('.fl'), [[3.5, { wp: 0 }], [4.5, { wp: a }, 'io'], [5.4, { wp: b }, 'io'], [6.4, { wp: c }, 'out']]);
  });
  S.tw(S.q('#s04-list .ring')[1], [[5.5, { o: 0 }], [6.1, { o: 1 }, 'io']]);
  S.tw('#s04-list', [[0, { s: 1 }], [6.7, { s: 1.015, o: 1 }, 'lin'], [7, { o: 0 }, 'io']]);
});

// 05 · Cernis runs sourcing / screening / assessment
scene('s05', 7.5, { glow: CARD }, (S) => {
  S.cap('#c05', 0.25, 7.25, { hide: true });
  S.cap('#c05a', 0.75, 2.75, { label: 'Cernis runs sourcing.' });
  S.cap('#c05b', 3.0, 5.0, { label: 'Cernis runs screening.' });
  S.cap('#c05c', 5.25, 7.25, { label: 'Cernis runs assessment.' });

  // beat 1: the four sourcing channels
  S.q('.ltile').forEach((e, i) => S.enter(e, 0.3 + i * 0.14, { y: 36, s: 0.9, d: 1.0 }));
  S.float('.ltile', 6, 5, 0.1);
  S.exit('#s05-logos', 2.55, 0.3);

  // beats 2 and 3: screening, then ranked assessment
  const R = [['Ana Ruiz', 'Backend Engineer'], ['Tom Becker', 'Platform Engineer'], ['Leo Martin', 'Software Engineer'], ['Wei Zhang', 'Staff Engineer'], ['Noor Haddad', 'Backend Engineer']];
  const pass = { 3: 0, 0: 1, 1: 2 }; // row index -> final rank slot
  const box = S.q('#s05-rows')[0];
  box.innerHTML = R.map(([n, sub], i) => `<div class="prow" style="top:${i * 94}px"><div class="bg"></div>
    <span class="rk">${i in pass ? pass[i] + 1 : ''}</span>
    <div class="who">${person(n)}<div><div class="nm">${n}</div><div class="sb2">${sub}</div></div></div>
    <div class="rt"><span class="mk ${i in pass ? 'ok' : 'no'}"><i class="ic" data-icon="${i in pass ? 'check' : 'x'}"></i></span><span class="sc"><i></i></span></div></div>`).join('');
  S.hydrate(box);
  const steps = S.q('.step');
  S.fn((t) => { const k = t < 5.1 ? 1 : 2; steps.forEach((e, i) => { e.classList.toggle('act', i === k); e.classList.toggle('done', i < k); }); });
  S.tw('#s05-card', [[2.8, { o: 0, s: 0.95, y: 44 }], [3.2, { o: 1 }, 'out'], [3.8, { s: 1, y: 0 }, 'soft'], [7.2, { s: 1.015, y: 0, o: 1 }, 'lin'], [7.5, { o: 0 }, 'io']]);
  const slotY = [8, 150, 292];
  S.q('#s05-rows .prow').forEach((e, i) => {
    const t2 = 3.5 + i * 0.16, ok = i in pass, j = pass[i];
    const q = (s) => e.querySelector(s);
    S.tw(e, [[3.0 + i * 0.08, { y: 14, o: 0 }], [3.45 + i * 0.08, { y: 0, o: 1 }]]);
    S.tw(q('.mk'), [[t2, { o: 0, s: 0.7 }], [t2 + 0.35, { o: 1, s: 1 }]]);
    S.tw(q('.rk'), [[0, { o: 0 }]]);
    S.tw(q('.sc'), [[0, { o: 0 }]]);
    if (!ok) {
      S.tw(e, [[t2 + 0.2, { o: 1 }], [t2 + 0.6, { o: 0.35 }, 'io'], [5.05, { o: 0.35 }], [5.4, { o: 0 }, 'io']]);
    } else {
      const t3 = 5.15 + j * 0.08;
      S.tw(e, [[t3, { y: 0 }], [t3 + 0.8, { y: slotY[j] - i * 94 }, 'io']]);
      S.tw(q('.mk'), [[5.05, { o: 1 }], [5.3, { o: 0 }, 'lin']]);
      S.tw(q('.who'), [[t3, { x: 0 }], [t3 + 0.7, { x: 62 }, 'io']]);
      S.tw(q('.rk'), [[t3 + 0.5, { o: 0 }], [t3 + 0.85, { o: 1 }, 'lin']]);
      S.tw(q('.sc'), [[t3 + 0.4, { o: 0 }], [t3 + 0.7, { o: 1 }, 'lin']]);
      S.tw(q('.sc i'), [[t3 + 0.55, { wp: 0 }], [t3 + 1.5, { wp: [93, 79, 64][j] }, 'out5']]);
      if (j === 0) S.tw(q('.bg'), [[t3 + 0.6, { o: 0 }], [t3 + 1.0, { o: 1 }, 'lin']]);
    }
  });
  S.tw('#s05-foot', [[6.2, { o: 0, y: 14 }], [6.65, { o: 1, y: 0 }]]);
});

// 06 · Compare ranked shortlists side by side, then make the hire
scene('s06', 7, { glow: CARD }, (S) => {
  const lists = {
    a: ['Maya Okafor', [['Wei Zhang', 'Staff Engineer'], ['Ana Ruiz', 'Backend Engineer'], ['Tom Becker', 'Platform Engineer']], [94, 80, 66]],
    b: ['Daniel Reyes', [['Sam Patel', 'Backend Engineer'], ['Wei Zhang', 'Staff Engineer'], ['Noor Haddad', 'Backend Engineer']], [90, 77, 61]],
  };
  for (const k of ['a', 'b']) {
    const [who, rows, bars] = lists[k];
    const card = S.q('#s06-' + k)[0];
    card.innerHTML = `<div class="hd">${person(who)}<div><small>Shortlist by</small><b>${who}</b></div></div>` +
      rows.map(([n, sub], i) => `<div class="srow"><div class="bg"></div><span class="rk ${i ? 'r2' : ''}">${i + 1}</span>${person(n)}
        <div><div class="nm">${n}</div><div class="sb2">${sub}</div><div class="sc"><i></i></div></div></div>`).join('') +
      `<div class="hire"><span class="h0">Hire ${rows[0][0]}</span><span class="h1">Hire ${rows[0][0]}</span><span class="h2"><b class="cdot"></b>Hired</span></div>` +
      (k === 'a' ? '<div class="cur" id="s06-cur" style="left:0;top:0" data-cursor></div>' : '');
    S.hydrate(card);
    const sgn = k === 'a' ? 1 : -1, t = k === 'a' ? 0.15 : 0.32;
    S.tw(card, [[t, { o: 0, s: 0.94, y: 46 }], [t + 0.45, { o: 1 }, 'out'], [t + 1.2, { s: 1, y: 0 }, 'soft'], [6.7, { s: 1.012, y: 0, o: 1 }, 'lin'], [7, { o: 0 }, 'io']]);
    card.querySelectorAll('.sc i').forEach((e, i) => S.tw(e, [[t + 0.9 + i * 0.12, { wp: 0 }], [t + 1.9 + i * 0.12, { wp: bars[i] }, 'out5']]));
    S.tw(card.querySelector('.srow .bg'), [[t + 0.9, { o: 0 }], [t + 1.4, { o: 1 }, 'lin']]);
    S.tw(card.querySelector('.h1'), [[0, { o: 0 }]]);
    S.tw(card.querySelector('.h2'), [[0, { o: 0 }]]);
  }
  S.cap('#c06a', 0.25, 3.5);
  S.cap('#c06b', 3.75, 6.7);
  S.tw('#s06-cur', [[3.7, { x: 400, y: 760, o: 0 }], [3.95, { o: 1 }, 'out'], [4.6, { x: 236, y: 628 }, 'io'], [5.6, { x: 236, y: 628, o: 1 }], [5.95, { o: 0 }, 'io']]);
  S.tw('#s06-a .h1', [[4.45, { o: 0 }], [4.65, { o: 1 }, 'lin']]);
  S.tw('#s06-a .hire', [[4.75, { s: 1 }], [4.85, { s: 0.97 }, 'out'], [5.25, { s: 1 }, 'soft']]);
  S.tw('#s06-a .h2', [[4.86, { o: 0 }], [5.05, { o: 1 }, 'lin']]);
  S.tw('#s06-a .cdot', [[4.9, { s: 0.2 }], [5.5, { s: 1 }, 'soft']]);
});

// 07 · 24 hours to ideal candidates
scene('s07', 3.5, { glow: CARD }, (S) => {
  const C = 2136.3;
  let ticks = '';
  for (let i = 0; i < 48; i++) {
    const a = (i / 48) * Math.PI * 2, r1 = i % 6 ? 296 : 284, r2 = 308;
    ticks += `<line x1="${400 + Math.sin(a) * r1}" y1="${400 - Math.cos(a) * r1}" x2="${400 + Math.sin(a) * r2}" y2="${400 - Math.cos(a) * r2}"/>`;
  }
  S.q('#s07-ticks')[0].innerHTML = ticks;
  S.cap('#c07', 0.25, 3.25);
  S.tw('#s07-ring', [[0.1, { o: 0, s: 0.92 }], [0.55, { o: 1 }, 'out'], [1.2, { s: 1 }, 'soft'], [3.2, { s: 1.015, o: 1 }, 'lin'], [3.5, { o: 0 }, 'io']]);
  S.tw('#s07-arc', [[0.3, { dash: C }], [1.9, { dash: C / 2 }, 'soft']]);
  S.tw('#s07-dot', [[0.3, { rz: 0 }], [1.9, { rz: 180 }, 'soft']]);
  S.tw('#s07-num', [[0.2, { o: 0 }], [0.65, { o: 1 }, 'out'], [3.2, { o: 1 }], [3.5, { o: 0 }, 'io']]);
  const n = S.q('#s07-n')[0];
  S.fn((t) => { n.textContent = Math.round(24 * window.E.soft(Math.min(1, Math.max(0, (t - 0.3) / 1.3)))); });
});

// 08 · 48 hours to a closed hire (team chat)
scene('s08', 5, { glow: CARD }, (S) => {
  S.cap('#c08', 0.25, 4.75);
  S.tw('#s08-panel', [[0.1, { o: 0, s: 0.95, y: 46 }], [0.55, { o: 1 }, 'out'], [1.2, { s: 1, y: 0 }, 'soft'], [4.7, { s: 1.012, y: 0, o: 1 }, 'lin'], [5, { o: 0 }, 'io']]);
  const msg = (i, t) => S.tw('#s08-m' + i, [[t, { o: 0, y: 16 }], [t + 0.45, { o: 1, y: 0 }]]);
  msg(0, 0.5);
  S.tw('#s08-att', [[0.9, { o: 0, y: 10 }], [1.3, { o: 1, y: 0 }]]);
  msg(1, 2.1);
  msg(2, 3.0);
  const counts = [[[1.3, 2], [1.7, 3], [2.2, 5], [2.9, 7], [3.6, 9]], [[1.5, 1], [2.4, 2], [3.3, 4]], [[1.7, 1], [2.7, 2], [3.8, 3]]];
  counts.forEach((c, i) => {
    S.tw('#s08-r' + i, [[c[0][0], { o: 0, y: 8 }], [c[0][0] + 0.35, { o: 1, y: 0 }]]);
    const num = S.q('#s08-c' + i)[0];
    S.fn((t) => { let last = c[0]; for (const k of c) if (k[0] <= t) last = k; num.textContent = last[1]; });
  });
});

// 09 · Pay 10–15%, only on hire
scene('s09', 4.5, { glow: CARD }, (S) => {
  S.cap('#c09', 0.25, 4.25);
  S.tw('#s09-card', [[0.15, { o: 0, s: 0.95, y: 46 }], [0.6, { o: 1 }, 'out'], [1.25, { s: 1, y: 0 }, 'soft'], [4.2, { s: 1.012, y: 0, o: 1 }, 'lin'], [4.5, { o: 0 }, 'io']]);
  S.tw('#s09-sup', [[0.6, { o: 0 }], [1.0, { o: 1 }, 'lin']]);
  S.tw('#s09-r0', [[0.9, { o: 0, y: 14 }], [1.35, { o: 1, y: 0 }]]);
  S.tw('#s09-r1', [[1.15, { o: 0, y: 14 }], [1.6, { o: 1, y: 0 }]]);
  S.tw('#s09-b0', [[1.2, { w: 0 }], [2.4, { w: 752 }, 'soft']]);
  S.tw('#s09-b1', [[1.45, { w: 0 }], [2.65, { w: 451 }, 'soft']]);
});

// 10 · Free replacement within 60 days
scene('s10', 3.5, { glow: CARD }, (S) => {
  S.cap('#c10', 0.25, 3.25);
  S.tw('#s10-ring', [[0.1, { o: 0, s: 0.92 }], [0.55, { o: 1 }, 'out'], [1.2, { s: 1 }, 'soft'], [3.2, { o: 1 }], [3.5, { o: 0 }, 'io']]);
  S.tw('#s10-arc', [[0.3, { dash: 1156.1 }], [2.1, { dash: 0 }, 'soft']]);
  S.tw('#s10-ic', [[0.1, { o: 0, rz: -150, s: 0.9 }], [0.55, { o: 1 }, 'out'], [2.0, { rz: 0, s: 1 }, 'soft'], [3.2, { o: 1 }], [3.5, { o: 0 }, 'io']]);
});

// 11–13 · Comment CTA, one line at a time
scene('s11', 3, { glow: TEXT }, (S) => { S.cap('#c11', 0.25, 2.75); });
scene('s12', 3, { glow: TEXT }, (S) => { S.cap('#c12', 0.25, 2.75); });
scene('s13', 4.5, { glow: TEXT }, (S) => { S.cap('#c13', 0.25, 4.25, { note: 'your wording, kept whole (9 words)' }); });

// 14 · End card. Everything has settled by 1.35s; the last 4.15s are completely static.
scene('s14', 5.5, { glow: TEXT }, (S) => {
  wordmark(S, '#s14-wm', 0);
  S.cap('#c14', 0.1, null);
});

startTimeline();
