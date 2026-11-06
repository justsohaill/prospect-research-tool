# Motion

LinkedIn autoplays video muted in the feed, and movement stops the scroll. Every graphic
ships as a still and as a 6–10 s MP4. The animation must **tell the structure of the
content** and end on the complete final frame (render.mjs holds that frame for 1.5 s).

## The seek contract (required — render.mjs depends on it)
- Every animated value is a **pure function of t** (ms since the start).
- Allowed: CSS `@keyframes` (the renderer pauses them and sets `currentTime`), and
  `Motion.on(t => { ... })` callbacks that set styles or attributes from `t`.
- Not allowed: `setTimeout`, `setInterval`, CSS transitions triggered by toggling classes,
  `Math.random()` at draw time (use `const r = Motion.rng(42)` once at setup), or
  anything that depends on wall-clock time.
- Set the length in `<meta name="motion" content="duration=8000; still=end">`. Use
  `still=end` (the finished state) unless a mid-state is more striking.
- Put your scripts **after** the runtime `<script>` in base.html.

```html
<script>
const {seg, ease, lerp, fmt} = Motion;
const nodes = [...document.querySelectorAll('.step')];
Motion.on(t => {
  nodes.forEach((n, i) => {
    const p = ease.out(seg(t, 600 + i * 450, 1100 + i * 450));   // staggered 500ms reveals
    n.style.opacity = .25 + .75 * p;
    n.style.transform = `translateY(${(1 - p) * 10}px)`;
  });
  document.querySelector('#followers').textContent = fmt(lerp(0, 161000, ease.out(seg(t, 1500, 4500))), {k:true});
});
</script>
```

## Timeline shape (for 8 s)
| Time | Beat |
|---|---|
| 0–0.6 s | The frame (header, background, empty structure) is already visible. Never start blank: the first frame is the thumbnail. |
| 0.4–5.5 s | **Build**: the metaphor fills, in reading order (top→bottom, centre→out, left→right). |
| 2–6 s | **Count / route**: numbers tick up, a highlight travels the path, statuses change. |
| 5.5–7 s | **Payoff**: the end state lights up (CLOSED WON, "All 60 done", the CTA glows). |
| 7–8 s + hold | **Rest**: the full final frame. Only subtle ambient loops (glow pulse, particles). |

The first frame must already look like a designed graphic. Fade items in from about 25%
opacity rather than 0, so the structure is readable from frame one.

## Pattern library
- **Stagger reveal**: items fade and rise in sequence (40–90 ms apart for small atoms,
  300–500 ms for big sections).
- **Counter**: a number tweens from 0 with `ease.out`. Use tabular nums. Format the end
  value exactly as in the still.
- **Routing highlight**: a status says "ROUTING TO 23/60 · Analytics Lab" while a glow ring
  moves across the groups. Groups behind it get a check.
- **Split-flap / scramble**: `Motion.scramble(text, p)` for boards, tickers and codes.
- **Path draw**: SVG `stroke-dasharray = length`, `stroke-dashoffset = length*(1-p)`
  for wires, tracks, ECG lines and arcs.
- **Flow particles**: dots travel along a path (`path.getPointAtLength((t*speed + i*gap) % L)`)
  to show data moving through pipes and wires.
- **Fill / level**: tanks, funnels and bars fill up. Filtered items change colour as they pass a stage.
- **Orbit**: slow rotation of a ring (≤ 20° over the whole clip, or labels become hard to read).
- **Light-up sequence**: steps dim at 30%, then the active one glows, then it is done (100%).
- **Ambient**: a pulsing LIVE dot, a conic glow rotating around the CTA (`--a` angle), twinkling stars.

## Restraint
- At most 3 simultaneous motion types. Motion supports the reading order and never
  competes with the headline: the headline itself does not move after frame 0.
- No bouncing, spinning logos or full-canvas zooms. Easing is `out` or `inOut`, never linear,
  except for constant flows.
