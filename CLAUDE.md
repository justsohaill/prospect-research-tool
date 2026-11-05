# CLAUDE.md

## Hamza signature style

Brand rules for every graphic and motion piece made for Hamza Hassan's LinkedIn posts. Reference build: `motion/six-ways/`.

### Canvas & format
- 1080×1350 (4:5 portrait), 30fps, 8–10s seamless loop. Last frame must flow into the first, so verify with a pixel diff of `t=0` against the last frame.
- Built in HTML/SVG/CSS/JS with a deterministic `renderAt(t)` function, recorded frame by frame with Playwright and encoded with ffmpeg: `libx264 -preset veryfast -crf 17 -pix_fmt yuv420p -movflags +faststart`.

### Colour
| Token | Hex | Use |
|---|---|---|
| bg | `#F7F5F1` | off-white canvas (+ faint 24px dot grid at top/bottom edges) |
| card | `#FFFFFF` | panels |
| ink | `#16130F` | near-black text, "resolved/fixed" states |
| ink-2 | `#5E5850` | subheads, secondary text |
| neutral | `#E9E4DC` / `#F1EDE7` | the one soft secondary neutral: tracks, chips, skeletons |
| muted label | `#8E867B` / `#A39B8F` | mono micro-labels |
| orange | `#F25C05` | the single accent: emphasis, alerts, payoff (hex unconfirmed; swap in the official brand hex if one is provided) |

No purple, no blue gradients, no neon, no generic "AI glow" look. Orange is the only saturated colour.

### Type
- Headline: Inter Display Black (900), ~74px, line-height .98, tracking −0.04em, 2 lines max, with the key phrase on line 2 in orange.
- Subheading: Inter Display Medium, ~29px, ink-2, max 6 words.
- Item labels: Inter Display ExtraBold 30px, tracking −0.025em. Never below ~28px, so they stay readable at phone size.
- Micro-labels/stats: JetBrains Mono, 13–16px, uppercase with +0.14em tracking for labels, lowercase for stat chips ("tests passed 0/48").
- Big numbers: Inter Display Black, tabular numerals.

### Layout
- 64px side margins, with the main panel at 48px.
- Top: small mono eyebrow with an orange dot (no Rubrex badge, per Hamza's request).
- Middle: one hero panel (white, 40px radius, layered soft shadows, tiny corner screws or other micro-details).
- Closing line: centred, ~52px Black, with the final word in orange and an animated underline.
- Footer: circular avatar (`assets/hamza.jpg`, 60px, white ring) + "Hamza Hassan" (26px ExtraBold) on the left; on the right, a pill reading "Save this post for later" with an orange bookmark icon.

### Motion
- Story shape: build → problem drains it → payoff fix → close line → gentle reset to frame 0.
- Elements build in one at a time (~0.45s apart). The fixes come faster (~0.17s apart) so the payoff feels like a cascade.
- Easing is cubic in/out with back-overshoot on hero moves. Nothing stays static longer than a beat, so use subtle jitter, pulses and ticking counters.
- Payoff moment: a ring burst + check badge per item, a panel-edge orange pulse, and a number that "locks".
- Small icons are 24-grid stroke icons (2px, round caps), and every item gets one.
- Tiny stat chips are used as texture, before and after the fix (bad stat in orange tint → good stat in neutral with a check).

### Quality loop (always run before delivering)
1. Render 6 stills across the timeline.
2. Check them for overlap, cramped spacing, phone-size readability, templated look and hierarchy.
3. Fix the problems and re-render, for at least 3 rounds.
4. Verify the loop seam with a pixel diff.
5. Export `final.mp4`.
