# Design system

All tokens and components live in `assets/base.html`. This file explains how to use them well.

## Canvas and grid
- Default **1080×1350** (4:5): this takes up the most feed space on mobile. Other formats:
  1080×1080 (square), 1200×1500 (4:5 hi-res), 1080×1920 (story), 1920×1080 (landscape,
  rarely). Set `<meta name="canvas" content="WxH">` and the `--W/--H` CSS variables.
- Safe margin `--pad: 64px`. Keep content off the outer 40 px entirely. Crop marks sit at 28 px.
- Vertical budget for 1350 tall:
  header 54→250 (brand 30 · headline 2 lines ≈ 150 · sub 30) · hero ≈ 250→1130 ·
  stats/CTA ≈ 1130→1250 · footer 1260→1320. Adjust, but the hero always gets most of it.
- Use an 8 px spacing scale (8, 12, 16, 24, 32, 48, 64). Gaps between groups should be
  2–3× the gaps inside a group.
- Position the hero with absolute coordinates inside `#hero`, or with CSS grid. For
  geometric metaphors (rings, tracks, spikes), **compute positions in JS** from the data
  array, so the layout is driven by the data rather than placed by hand.

## Typography
| Role | Font | Size @1080 | Weight | Tracking |
|---|---|---|---|---|
| Headline (bold) | Inter Tight | 68–92 | 800 | −0.045em |
| Headline (editorial) | Inter Tight | 76–100 | 400 | −0.055em |
| Headline (poster) | Archivo | 64–84, UPPERCASE | 900 | −0.035em |
| Headline (serif) | Instrument Serif | 80–104 | 400 | −0.02em |
| Sub | Inter 22 / Instrument Serif *italic* 27 | | 400 | −0.01em |
| Section title | Inter Tight | 19–24 | 700 | −0.02em |
| Label | Inter | 13–15 | 600 | 0 |
| Description | Inter | 11.5–12.5, ink-3 | 400 | 0 |
| Metadata / eyebrow | JetBrains Mono, UPPERCASE | 10.5–12 | 600 | +0.15–0.22em |
| Technical names | JetBrains Mono | 12–14 | 500 | −0.01em |
| Big numbers | Inter Tight, tabular | 48–96 | 700 / 300 | −0.05em |

Rules:
- Use at most 3 font families on one graphic (display + mono + one of body or serif).
- The headline fits on 2 lines at most. Balance it (`text-wrap: balance`) and never leave one
  word alone on a line.
- Numbers use tabular figures (`font-variant-numeric: tabular-nums`) so counters don't jitter.
- Mono kebab-case for anything that is a skill, agent, command, file or field:
  `lead-scorer`, `/pricing`, `{hook-generator}`.
- Counts after labels: `<span class="count">18</span>` (mono, ink-3).

## Colour
Pick a theme and then **one accent**. Add a second accent only for a semantic job
(success = green, a "hot" tier = red).
- **paper** (cream #F3EEE6): research, rosters, lists, data journalism. Accents: tomato
  #E0452B, forest #1F4D36, hot pink #F784E8 (highlight), lime #E4F59A (stat boxes),
  cobalt #2D5BFF.
- **ink** (navy-black #070B14): systems, machines, playbooks, "how it works". Accents:
  electric blue #4C8DFF, mint #7CF0B5, amber #FFB547, violet #9B7BFF. Glow only on the
  active path.
- **studio** (cool light #F4F6F9): teams, org charts, stacks, product UIs. It uses a category
  hue sequence `--c1…--c12` for groups, plus black for command elements.
- **custom**: when the metaphor demands its own world (a night train station, a blueprint
  #0E2A47 with white linework, ECG paper with pink grid lines, a terminal green-on-black).
  Define a full token set in the same shape as the themes.
- **Client brand:** use the client's brand colour as the accent if it passes contrast.
  Otherwise use it only in the brand mark and CTA.
- Contrast: labels ≥ 4.5:1 against their surface. ink-3 grey is only for metadata ≥ 11 px.

## Components (from base.html)
- `.tile`: rounded-square "app icon" holding a logo. `--s` sets the size (28–48 px). Group
  2–4 tiles in a row with a 6 px gap. Tiles carry recognisability, so use them generously.
- `.avatar`: circular headshot with a ring. `.initials` is the fallback, `.badge` is a
  small company tile on the bottom right, and `--ring` is a category colour.
- `.card`: a surface with hairline border, radius 22 and a soft shadow. Inner padding 20–28.
- `.chip`, `.tag`, `.dot.live`, `.check`: small status UI. Use them to make the diagram
  feel like a live product.
- `.author-pill` (top centre) or `.brandbar` (top left): the identity at the top.
- `.footer` + `.footer-rule`: author avatar, name and domain on the left, and a mono proof
  line or brand mark on the right.
- `.cta` + `.cta-glow` + `.cta-sub`: the lead-magnet pill. Keyword in `.kw`.
- Backgrounds: `.bg-grid` (add `.major` for 120 px grid), `.bg-dots`, `.bg-wash` (set
  `--wash-a/--wash-b`), `.bg-noise`, `.bg-vignette`, `.crop.tl/.tr/.bl/.br`.

## Rendering richness (what makes it look expensive)
- **Hairlines over heavy borders**: 1–1.5 px lines in `--line`, never 3 px black outlines
  (except one deliberate thick element, like a CTA border).
- **Layered depth**: background texture, then wires (SVG, behind), then cards (shadow),
  then tiles and avatars (stronger shadow), then labels.
- **Realistic micro-UI**: a fake Slack notification, a CRM record row, a terminal line, a
  progress bar, a "LIVE" dot. One or two of these per graphic.
- **Physical detail on the metaphor**: rails get sleepers, a funnel gets a glass
  highlight gradient, an ECG gets grid paper with major and minor lines, a board gets
  split-flap cells. Draw these in SVG with gradients and highlights, not flat shapes.
- **Dark themes**: inner highlights (`inset 0 1px 0 rgba(255,255,255,.08)`), glows with
  2 layers (wide soft + tight bright), star or particle fields made of 100s of tiny dots
  generated with the seeded `Motion.rng()`.
- **Alignment**: every label in a column shares one x. Check with the render, not by eye
  in the code.

## Gotchas (learned the hard way — check these every time)
- **SVG filters on straight lines vanish.** A horizontal or vertical `<path>`/`<line>` has a
  zero-height (or zero-width) bounding box, so a glow `filter` with the default
  objectBoundingBox region renders **nothing**. Always define glow filters with
  `filterUnits="userSpaceOnUse" x="0" y="0" width="1080" height="1350"`.
- **Heavy weights + tight tracking merge letters.** At 800+ weight, −0.045em turns "rn" into
  "m" ("Turn" reads "Tum") and "cl" into "d". Use ≤ −0.035em for 800–900 weights, and
  zoom into the headline on the PNG to read every word.
- **Fixed-size cells overflow silently.** Tiles, chips and cells with `white-space:nowrap`
  let long names spill past their border. The QA flags any text closer than 3px to its
  box edge, so shorten the label ("Sales Nav", "Workspace") rather than shrinking the font
  below 10.5px.
- **Column-major data placement splits groups.** When a geometric layout (a table, a grid
  of slots) is filled from a flat list, check that each colour family stays visually
  contiguous. Reorder the data, not the geometry.
- **Similar accent tints read as one colour.** Two states (for example "conversation" vs
  "booked") need different lightness as well as different hue, plus a glow on the higher state.
- **Logos inside tiny tiles:** only show a logo when it is real. Skip monogram placeholders
  in slots under 24px, because the symbol or name already carries the identity there.
