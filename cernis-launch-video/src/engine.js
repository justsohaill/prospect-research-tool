// Tiny deterministic timeline engine: every style is a pure function of time,
// so any frame can be rendered on its own with window.seek(seconds).
(function () {
  const E = {
    lin: (t) => t,
    out: (t) => 1 - Math.pow(1 - t, 3),
    out5: (t) => 1 - Math.pow(1 - t, 5),
    in: (t) => t * t * t,
    in2: (t) => t * t,
    io: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
    back: (t) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },
    spring: (t) => 1 - Math.exp(-6.5 * t) * Math.cos(9.5 * t),
  };

  // ---------- static hydration (icons, avatars, logos) ----------
  const AV = [['#E4E1FF', '#5B50E8'], ['#FFE3DE', '#E8604F'], ['#DDF3E8', '#2B9A66'], ['#FFEFC9', '#C98A12'], ['#DDEBFF', '#3B7CC4'], ['#F3DFF7', '#A14FC0']];
  const avatar = (i) => {
    const [bg, fg] = AV[i % AV.length];
    return `<svg viewBox="0 0 100 100"><rect width="100" height="100" fill="${bg}"/><circle cx="50" cy="40" r="17" fill="${fg}"/><ellipse cx="50" cy="96" rx="33" ry="28" fill="${fg}"/></svg>`;
  };
  const CURSOR = '<svg viewBox="0 0 29 37" style="display:block;width:100%;height:100%"><path d="M3 2.5v27l7.2-6.6 4.7 10.8 4.5-2-4.7-10.6H25z" fill="#15152a" stroke="#fff" stroke-width="2.4" stroke-linejoin="round"/></svg>';
  function hydrate(root) {
    const A = window.A;
    root.querySelectorAll('[data-icon]').forEach((e) => {
      e.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">${A.icons[e.dataset.icon]}</svg>`;
    });
    root.querySelectorAll('[data-av]').forEach((e) => { e.innerHTML = avatar(+e.dataset.av); });
    root.querySelectorAll('[data-brand]').forEach((e) => { e.innerHTML = A.brand[e.dataset.brand]; });
    root.querySelectorAll('[data-wordmark]').forEach((e) => { e.innerHTML = A.wordmark; });
    root.querySelectorAll('[data-glyph]').forEach((e) => { e.innerHTML = A.glyph; });
    root.querySelectorAll('[data-cursor]').forEach((e) => { e.innerHTML = CURSOR; });
  }

  // ---------- text splitting ----------
  function splitWords(h) {
    if (h.dataset.split) return;
    h.dataset.split = 1;
    const wrap = (text, acc) => {
      const f = document.createDocumentFragment();
      text.split(/(\s+)/).forEach((p) => {
        if (!p) return;
        if (/^\s+$/.test(p)) { f.appendChild(document.createTextNode(' ')); return; }
        const s = document.createElement('span');
        s.className = acc ? 'w acc' : 'w';
        s.textContent = p;
        f.appendChild(s);
      });
      return f;
    };
    [...h.childNodes].forEach((n) => {
      if (n.nodeType === 3) n.replaceWith(wrap(n.textContent, false));
      else if (n.tagName === 'EM') n.replaceWith(wrap(n.textContent, true));
    });
  }
  function splitChars(h) {
    if (h.dataset.split) return;
    h.dataset.split = 1;
    const t = h.textContent;
    h.textContent = '';
    [...t].forEach((c) => { const s = document.createElement('span'); s.className = 'ch'; s.textContent = c; h.appendChild(s); });
  }

  // ---------- scenes ----------
  const INK = [22, 22, 42], GREY = [186, 186, 202];
  const mix = (k) => `rgb(${INK.map((c, i) => Math.round(GREY[i] + (c - GREY[i]) * k)).join(',')})`;
  const scenes = [];

  function evalProp(L, t) {
    let i = L.length - 1;
    while (i > 0 && L[i][0] > t) i--;
    if (i === L.length - 1 || L[i][0] > t) return L[i][1];
    const a = L[i], b = L[i + 1];
    const u = (t - a[0]) / (b[0] - a[0]);
    return a[1] + (b[1] - a[1]) * E[b[2]](u);
  }
  function setStyle(e, v) {
    const st = e.style;
    let tf = '';
    const has3 = 'z' in v || 'rx' in v || 'ry' in v;
    if ('x' in v || 'y' in v || 'z' in v) {
      const x = v.x || 0, y = v.y || 0, z = v.z || 0;
      tf += has3 ? `translate3d(${x}px,${y}px,${z}px) ` : `translate(${x}px,${y}px) `;
    }
    if ('rx' in v) tf += `rotateX(${v.rx}deg) `;
    if ('ry' in v) tf += `rotateY(${v.ry}deg) `;
    if ('rz' in v) tf += `rotate(${v.rz}deg) `;
    if ('s' in v || 'sx' in v || 'sy' in v) { const s = v.s ?? 1; tf += `scale(${s * (v.sx ?? 1)},${s * (v.sy ?? 1)})`; }
    if (tf) st.transform = tf;
    if ('o' in v) st.opacity = v.o;
    if ('blur' in v) st.filter = v.blur > 0.1 ? `blur(${v.blur}px)` : 'none';
    if ('k' in v && !e.classList.contains('acc')) st.color = mix(v.k);
    if ('w' in v) st.width = v.w + 'px';
    if ('wp' in v) st.width = v.wp + '%';
    if ('dash' in v) st.strokeDashoffset = v.dash;
  }

  function scene(id, dur, setup) {
    const el = document.getElementById(id);
    const S = { id, el, dur, tracks: new Map(), fns: [], hydrate };
    S.q = (sel) => (typeof sel === 'string' ? [...el.querySelectorAll(sel)] : sel instanceof Element ? [sel] : [...sel]);
    // keys: [time, {prop: value}, ease]. The ease applies to the segment arriving at that key.
    S.tw = (sel, keys) => {
      for (const e of S.q(sel)) {
        let m = S.tracks.get(e);
        if (!m) { m = {}; S.tracks.set(e, m); }
        for (const [t, props, ease] of keys) for (const p in props) (m[p] = m[p] || []).push([t, props[p], ease || 'out']);
      }
    };
    S.fn = (f) => S.fns.push(f);
    // Word-by-word headline: each word rises out of blur in grey, then settles to ink.
    S.words = (sel, t0, st = 0.1) => {
      let i = 0;
      for (const h of S.q(sel)) {
        splitWords(h);
        for (const w of h.querySelectorAll('.w')) {
          const t = t0 + i++ * st;
          S.tw(w, [[t, { o: 0, y: 38, blur: 12, k: 0 }], [t + 0.22, { o: 1 }, 'out'], [t + 0.5, { y: 0, blur: 0 }, 'out5'], [t + 0.6, { k: 1 }, 'io']]);
        }
      }
      return t0 + i * st;
    };
    S.chars = (sel, t0, st = 0.03) => {
      for (const h of S.q(sel)) {
        splitChars(h);
        [...h.children].forEach((c, i) => {
          const t = t0 + i * st;
          S.tw(c, [[t, { o: 0, y: 44, blur: 10 }], [t + 0.2, { o: 1 }, 'out'], [t + 0.45, { y: 0, blur: 0 }, 'out5']]);
        });
      }
    };
    S.out = (sel, t0, d = 0.28, y = -60) => S.tw(sel, [[t0, { o: 1, y: 0, blur: 0 }], [t0 + d, { o: 0, y, blur: 12 }, 'in2']]);
    // Cycling accent word: slides in from below, optionally leaves upward.
    S.cyc = (sel, tin, tout) => {
      S.tw(sel, [[tin, { o: 0, y: 100, blur: 14 }], [tin + 0.14, { o: 1 }, 'out'], [tin + 0.48, { y: 0, blur: 0 }, 'out5']]);
      if (tout != null) S.tw(sel, [[tout, { o: 1, y: 0, blur: 0 }], [tout + 0.2, { o: 0, y: -90, blur: 12 }, 'in2']]);
    };
    S.pop = (sel, t, d = 0.45, ease = 'back') => S.tw(sel, [[t, { o: 0, s: 0.4 }], [t + 0.08, { o: 1 }], [t + d, { s: 1 }, ease]]);
    S.float = (sel, amp = 10, period = 3.2, phase = 0, rot = 0) => {
      const els = S.q(sel);
      S.fn((t) => els.forEach((e, i) => {
        const a = ((t / period) + phase + i * 0.37) * Math.PI * 2;
        e.style.translate = `${(Math.cos(a * 0.7) * amp * 0.5).toFixed(2)}px ${(Math.sin(a) * amp).toFixed(2)}px`;
        if (rot) e.style.rotate = `${(Math.sin(a * 0.8) * rot).toFixed(2)}deg`;
      }));
    };
    S.type = (sel, text, t0, t1) => {
      const e = S.q(sel)[0];
      S.fn((t) => { e.textContent = text.slice(0, Math.round(text.length * Math.min(1, Math.max(0, (t - t0) / (t1 - t0))))); });
    };
    S.apply = (t) => {
      for (const [e, m] of S.tracks) { const v = {}; for (const p in m) v[p] = evalProp(m[p], t); setStyle(e, v); }
      for (const f of S.fns) f(t);
    };
    setup(S);
    for (const m of S.tracks.values()) for (const p in m) m[p] = m[p].map((k, i) => [k, i]).sort((a, b) => a[0][0] - b[0][0] || a[1] - b[1]).map((x) => x[0]);
    scenes.push(S);
    return S;
  }

  function start() {
    let total = 0;
    scenes.forEach((s) => { s.start = total; total += s.dur; });
    window.DURATION = total;
    window.SCENES = scenes.map((s) => ({ id: s.id, start: s.start, dur: s.dur }));
    window.seek = (t) => {
      let cur = scenes[scenes.length - 1];
      for (const s of scenes) if (t < s.start + s.dur - 1e-6) { cur = s; break; }
      for (const s of scenes) s.el.classList.toggle('on', s === cur);
      cur.apply(Math.max(0, t - cur.start));
      return cur.id;
    };
    const q = new URLSearchParams(location.search);
    if (q.has('render')) { window.seek(0); return; }
    if (q.has('t')) { window.seek(+q.get('t')); return; }
    // Live preview in a normal browser tab.
    const t0 = performance.now();
    const tick = () => { window.seek(((performance.now() - t0) / 1000) % total); requestAnimationFrame(tick); };
    tick();
  }

  hydrate(document);
  window.E = E;
  window.scene = scene;
  window.startTimeline = start;
})();
