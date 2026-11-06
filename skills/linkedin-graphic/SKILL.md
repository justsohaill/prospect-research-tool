---
name: linkedin-graphic
description: Design and render premium, data-dense LinkedIn infographics (still PNG + looping MP4) in the style of top B2B creators. Each graphic turns one idea into a single physical metaphor (train station, ECG line, funnel, org chart, orbit, network map, and many more) packed with real logos, names and numbers. Use whenever the user asks for a LinkedIn graphic, infographic, visual, carousel cover, lead-magnet image, "comment KEYWORD" graphic, animated post visual, or a visual for any client's LinkedIn post (works for every client account plus the user's own). Also trigger on "make a graphic for this post", "visualise this", "turn this into an infographic", "lead magnet visual", or when a LinkedIn content skill produced a post that needs an image.
---

# LinkedIn Graphic

Make one graphic people stop for, zoom into and save. The bar is set by the reference work
described in `references/style-dna.md`. Reach that **quality**, never reproduce those
**designs**: every graphic gets its own concept, metaphor and layout.

Output for each graphic (default canvas 1080×1350, 4:5 portrait):
- `<slug>.html`: the source, self-contained and animated
- `<slug>.png`: the 2x still (2160×2700) for an image post
- `<slug>.mp4`: a 6–10 s animation that ends on the finished frame, for a video post
- `<slug>.qa.txt`: the automatic layout check

Save to `linkedin-graphics/<client-slug>/<YYYY-MM-DD>-<slug>/` in the working directory
unless the user names another place.

## Workflow

Follow these steps in order. Do not skip step 2: the concept is what makes these graphics work.

### 1. Load the client and the content
- Find out **whose account** it is. Load their profile from `assets/clients/<slug>.json`.
  If the profile is missing, ask for (or find) the name, company, domain, headshot and brand
  colour, then create the profile from `assets/clients/_template.json`.
  See `references/clients.md`.
- If a content skill exists for that client (for example `<name>-<company>-linkedin`),
  read its onboarding reference for the offer, the audience and the proof numbers.
- Pin down the **payload**: the actual list, system, steps, roster or numbers the graphic
  carries. Get real names, tools, counts and figures from the user, the post draft or
  research. Never invent statistics about real companies or people. If data is missing,
  ask, or label it clearly as illustrative.
- Decide the **post type** (each one changes the layout, see `references/concepts.md`):
  lead magnet (comment KEYWORD), roster or list, system or stack, playbook or process,
  team or org, proof or result, comparison, or market map.

### 2. Concept first (write it out before any code)
Read `references/concepts.md`. Then write a short concept brief in chat:

```
HOOK:      the headline, 3–8 words, with the emphasis word marked
METAPHOR:  the physical system, and why it fits the structure of the content
MAPPING:   content part → metaphor part   (at least 4 rows; every row carries real data)
ATOMS:     how many labelled items (aim for 30–80), and which logos and avatars
THEME:     paper | ink | studio | custom, plus the accent colour and the reason
MOTION:    the 2–4 beats the animation plays, and what the final frame shows
READS:     1 s = ?   10 s = ?   60 s = ?
```

Generate **three** metaphor options internally and pick the strongest. The mapping has to be
structural: the parts of the metaphor ARE the parts of the content (for example, tracks
splitting into three = three ICP tiers). A metaphor that only decorates is a failure.
Check `linkedin-graphics/` for this client's earlier graphics and do not repeat a metaphor
or layout they have already used.

If the user only gave a topic, show the brief and continue straight away. Stop for
approval only when they asked to review concepts first.

### 3. Build the HTML
- Start from `assets/base.html`. It holds the tokens, the three themes, the components
  (tile, avatar, chip, card, CTA, footer, crop marks, grid and noise backgrounds) and the
  motion runtime. Read `references/design-system.md` for the type scale, spacing, colour
  rules and component recipes.
- Draw the metaphor with **inline SVG plus positioned HTML**. Use SVG for wires, tracks,
  rings, funnels and glows, and HTML for text, tiles and cards so the type stays crisp. No
  external images except logos and headshots (local files). No JS libraries.
- Logos: `python3 scripts/logos.py --out <dir>/logos "Brand=domain.com" ...` then
  `<div class="tile"><img src="logos/brand.svg"></div>`. Replace any monogram
  placeholder for a brand that matters, and say so if you cannot.
- People: use the real headshots provided. Without a photo, use `.avatar.initials`.
  Never generate a face for a real named person.
- Animate following `references/motion.md`. Everything must be a pure function of time,
  through CSS keyframes or `Motion.on(t => ...)`.

### 4. Render and check
```bash
node scripts/render.mjs <dir>/<slug>.html            # PNG + MP4 + QA
node scripts/render.mjs <dir>/<slug>.html --no-video # fast iteration
```
(If Playwright cannot find a browser, add `--chromium /path/to/chrome`.)

Then **look at the PNG** (Read it) and go through `references/qa-checklist.md`. Fix every
QA line and every visual problem, then render again. Expect 2–4 passes: the first render is
never the final one. Check one mid-animation frame too (`--still 3000 --no-video`).

### 5. Deliver
Send the PNG and the MP4 with SendUserFile. Add one line on the concept, and the
suggested first line of the post if one was not given. Mention every placeholder logo or
avatar that is left.

## Non-negotiables (what separates these graphics from stock infographics)
1. **One metaphor and one focal point.** The hero visual takes about 65–75% of the canvas.
2. **Dense but ordered.** 30–80 labelled items in a strict grid or geometry. Small grey
   counts next to labels (`creators 18`). Readers should find something new on a third look.
3. **Real specifics.** Real tool logos, real names, real numbers, real file and command names
   (`hook-generator`, `/pricing`). Specific beats generic every time.
4. **Typographic hierarchy in three voices.** A big display headline with tight tracking,
   a sans for labels, and small tracked uppercase mono for metadata. Optional italic serif for a subline.
5. **One emphasis device in the headline:** a colour word, highlight block, gradient,
   accent full stop or glow. Never two.
6. **A frame.** Brand or author at the top, an author footer or CTA at the bottom, crop
   marks or a border, and a grid, dot, noise or wash texture on the background. Nothing
   touches the edges (64 px safe area).
7. **Legible at feed size.** The headline reads on a phone at 1/3 scale. The minimum text
   size is 11 px at 1080 wide. Contrast is at least 4.5:1 for labels.
8. **Motion tells the story.** It builds up, routes, counts or flows, then holds on the
   complete final frame. The still must work on its own.
9. **Never a copy.** Never reuse a reference's metaphor and layout together, its headline,
   or its brand. Take the principles, not the picture.

## Files
- `references/style-dna.md`: teardown of the reference graphics and why they work
- `references/concepts.md`: metaphor library, post-type layouts, headline formulas, ideation method
- `references/design-system.md`: themes, type scale, spacing, components, colour rules
- `references/motion.md`: animation patterns, timing and the seek contract
- `references/clients.md`: client profile system
- `references/qa-checklist.md`: final review before delivery
- `assets/base.html`: starting template, `assets/clients/`: client profiles
- `scripts/render.mjs`: renders PNG, MP4 and QA; `scripts/logos.py`: fetches brand logos
- `examples/`: graphics made with this skill (study them for the level of finish, do not reuse them)

## Rendering notes
- A video render captures every frame exactly at 2x (8 s ≈ 240 frames), which takes about
  2–4 minutes. Iterate with `--no-video` and render the MP4 once the still is approved, in
  the background. `--scale 1.5` is a faster draft.
- Fonts load from Google Fonts. Logos come from Simple Icons via npm, plus the company
  website when the network allows it. If a network is restricted, expect monogram
  placeholders for smaller brands and say so.
