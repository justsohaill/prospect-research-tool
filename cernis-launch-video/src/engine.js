// Tiny deterministic timeline engine: every style is a pure function of time,
// so any frame can be rendered on its own with window.seek(seconds).
(function () {
  const soft = (t) => 1 - (1 + 7.5 * t) * Math.exp(-7.5 * t); // critically damped spring: no overshoot
  const E = {
    lin: (t) => t,
    out: (t) => 1 - Math.pow(1 - t, 3),
    out5: (t) => 1 - Math.pow(1 - t, 5),
    in2: (t) => t * t,
    io: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
    soft: (t) => soft(t) / soft(1),
  };
  const BEAT = 0.25; // caption words land on eighth notes at 120 BPM
  const SAFE = { x0: 1080 * 0.08, x1: 1080 * 0.92, y0: 1350 * 0.08, y1: 1350 * 0.92 };

  // ---------- static hydration (icons, photos, logos) ----------
  const CURSOR = '<svg viewBox="0 0 29 37" style="display:block;width:100%;height:100%"><path d="M3 2.5v27l7.2-6.6 4.7 10.8 4.5-2-4.7-10.6H25z" fill="#1d1d1f" stroke="#fff" stroke-width="2.4" stroke-linejoin="round"/></svg>';
  const slug = (name) => name.toLowerCase().replace(/[^a-z]+/g, '-');
  function hydrate(root) {
    const A = window.A;
    root.querySelectorAll('[data-icon]').forEach((e) => {
      e.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">${A.icons[e.dataset.icon]}</svg>`;
    });
    // One generated headshot per invented person, reused wherever that name appears.
    root.querySelectorAll('[data-person]').forEach((e) => {
      e.innerHTML = `<img src="../assets/people/${slug(e.dataset.person)}.jpg" alt="">`;
    });
    root.querySelectorAll('[data-brand]').forEach((e) => { e.innerHTML = A.brand[e.dataset.brand]; });
    root.querySelectorAll('[data-wordmark]').forEach((e) => { e.innerHTML = A.wordmark; });
    root.querySelectorAll('[data-glyph]').forEach((e) => { e.innerHTML = A.glyph; });
    root.querySelectorAll('[data-cursor]').forEach((e) => { e.innerHTML = CURSOR; });
  }

  // ---------- caption splitting ----------
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
  // Makes one gradient run across a whole caption instead of restarting on every accent word.
  function spreadGradient(h) {
    const box = h.getBoundingClientRect();
    if (!box.width) return;
    h.querySelectorAll('.acc').forEach((w) => {
      const r = w.getBoundingClientRect();
      w.style.backgroundSize = `${box.width}px 100%`;
      w.style.backgroundPosition = `${-(r.left - box.left)}px 0`;
    });
  }

  // ---------- scenes ----------
  const scenes = [];
  const captions = [];

  function evalProp(L, t) {
    let i = L.length - 1;
    while (i > 0 && L[i][0] > t) i--;
    if (i === L.length - 1 || L[i][0] > t) return L[i][1];
    const a = L[i], b = L[i + 1];
    return a[1] + (b[1] - a[1]) * E[b[2]]((t - a[0]) / (b[0] - a[0]));
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
    if ('s' in v) tf += `scale(${v.s})`;
    if (tf) st.transform = tf;
    if ('o' in v) st.opacity = v.o > 0.999 ? 1 : v.o;
    if ('w' in v) st.width = v.w + 'px';
    if ('wp' in v) st.width = v.wp + '%';
    if ('dash' in v) st.strokeDashoffset = v.dash;
  }

  function scene(id, dur, opts, setup) {
    const el = document.getElementById(id);
    const S = { id, el, dur, glow: opts.glow, tracks: new Map(), fns: [], caps: [], hydrate };
    S.q = (sel) => (typeof sel === 'string' ? [...el.querySelectorAll(sel)] : sel instanceof Element ? [sel] : [...sel]);
    // keys: [time, {prop: value}, ease]. The ease applies to the segment arriving at that key.
    S.tw = (sel, keys) => {
      for (const e of S.q(sel)) {
        let m = S.tracks.get(e);
        if (!m) { m = {}; S.tracks.set(e, m); }
        for (const [t, props, ease] of keys) for (const p in props) (m[p] = m[p] || []).push([t, props[p], ease || 'soft']);
      }
    };
    S.fn = (f) => S.fns.push(f);
    // Caption: one word per eighth note, each rising 22px into place. `out` is when it starts to leave.
    S.cap = (sel, t0, out, o = {}) => {
      const h = S.q(sel)[0];
      splitWords(h);
      S.caps.push(h);
      const words = [...h.querySelectorAll('.w')];
      words.forEach((w, i) => {
        const t = o.at ? o.at[i] : t0 + i * BEAT;
        S.tw(w, [[t, { o: 0, y: 22 }], [t + 0.3, { o: 1 }, 'out'], [t + 0.5, { y: 0 }, 'out5']]);
      });
      const lastStart = o.at ? Math.max(...o.at) : t0 + (words.length - 1) * BEAT;
      if (out != null) S.tw(h, [[out, { o: 1 }], [out + 0.25, { o: 0 }, 'io']]);
      if (o.hide) return; // a fragment that is reported as part of another caption
      const text = o.label || words.map((w) => w.textContent).join(' ');
      captions.push({ scene: id, sel, text, words: text.split(' ').filter((x) => /[A-Za-z0-9]/.test(x)).length, landed: lastStart + 0.5, out: out == null ? dur : out, note: o.note || '' });
    };
    // Soft entrance / exit used by every card: slow scale-in, no bounce.
    S.enter = (sel, t, o = {}) => S.tw(sel, [[t, { o: 0, s: o.s ?? 0.94, y: o.y ?? 46 }], [t + 0.45, { o: 1 }, 'out'], [t + (o.d ?? 1.1), { s: 1, y: 0 }, 'soft']]);
    S.exit = (sel, t, d = 0.3) => S.tw(sel, [[t, { o: 1 }], [t + d, { o: 0 }, 'io']]);
    S.fade = (sel, t, d = 0.3, to = 1) => S.tw(sel, [[t, { o: 0 }], [t + d, { o: to }, 'io']]);
    S.float = (sel, amp = 6, period = 5, phase = 0) => {
      const els = S.q(sel);
      S.fn((t) => els.forEach((e, i) => {
        const a = (t / period + phase + i * 0.31) * Math.PI * 2;
        e.style.translate = `${(Math.cos(a * 0.7) * amp * 0.4).toFixed(2)}px ${(Math.sin(a) * amp).toFixed(2)}px`;
      }));
    };
    S.type = (sel, text, t0, t1) => {
      const e = S.q(sel)[0];
      S.fn((t) => { e.textContent = text.slice(0, Math.round(text.length * Math.min(1, Math.max(0, (t - t0) / (t1 - t0))))); });
    };
    S.apply = (t) => {
      if (!S.measured) { S.measured = true; S.caps.forEach(spreadGradient); }
      for (const [e, m] of S.tracks) { const v = {}; for (const p in m) v[p] = evalProp(m[p], t); setStyle(e, v); }
      for (const f of S.fns) f(t);
    };
    setup(S);
    for (const m of S.tracks.values()) for (const p in m) m[p] = m[p].map((k, i) => [k, i]).sort((a, b) => a[0][0] - b[0][0] || a[1] - b[1]).map((x) => x[0]);
    scenes.push(S);
    return S;
  }

  // Background glow: sits behind the main subject of each scene and glides between scenes.
  function glow(t, cur, i) {
    const prev = scenes[Math.max(0, i - 1)].glow, g = cur.glow;
    const k = i === 0 ? 1 : E.io(Math.min(1, (t - cur.start) / 1.2));
    const x = prev[0] + (g[0] - prev[0]) * k, y = prev[1] + (g[1] - prev[1]) * k, s = prev[2] + (g[2] - prev[2]) * k;
    const td = Math.min(t, window.FREEZE_AT); // the end card must be completely still
    const blobs = document.querySelectorAll('#bg i');
    [[0, 0, 0], [-170, 90, 1.7], [190, 130, 3.1]].forEach(([dx, dy, ph], n) => {
      const a = td * 0.42 + ph;
      blobs[n].style.transform = `translate(${x + dx * s + Math.cos(a) * 26}px,${y + dy * s + Math.sin(a * 0.8) * 22}px) scale(${s})`;
    });
  }

  function start() {
    let total = 0;
    scenes.forEach((s) => { s.start = total; total += s.dur; });
    window.DURATION = total;
    window.FREEZE_AT = total - 4.25;
    window.SAFE = SAFE;
    window.SCENES = scenes.map((s) => ({ id: s.id, start: s.start, dur: s.dur }));
    window.CAPTIONS = captions.map((c) => ({ ...c, start: scenes.find((s) => s.id === c.scene).start }));
    window.seek = (t) => {
      let i = scenes.length - 1;
      for (let k = 0; k < scenes.length; k++) if (t < scenes[k].start + scenes[k].dur - 1e-6) { i = k; break; }
      const cur = scenes[i];
      for (const s of scenes) s.el.classList.toggle('on', s === cur);
      cur.apply(Math.max(0, t - cur.start));
      glow(t, cur, i);
      return cur.id;
    };
    const q = new URLSearchParams(location.search);
    if (q.has('render')) { window.seek(0); return; }
    if (q.has('t')) { window.seek(+q.get('t')); return; }
    const t0 = performance.now(); // live preview in a normal browser tab
    const tick = () => { window.seek(((performance.now() - t0) / 1000) % total); requestAnimationFrame(tick); };
    tick();
  }

  hydrate(document);
  window.E = E;
  window.scene = scene;
  window.startTimeline = start;
})();
