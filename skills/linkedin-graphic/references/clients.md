# Client profiles

This skill serves several LinkedIn accounts (every client + the user's own). Each one
has a profile in `assets/clients/<slug>.json` so every graphic carries the right identity
without asking again.

## Profile fields (see `_template.json`)
- `name`, `role`, `company`, `domain`: shown in the footer or author pill.
- `headshot`: path to a square photo (put it in `assets/clients/<slug>/headshot.jpg`).
  Without one, use initials.
- `logo`: path to the company logo (SVG preferred) for the brand bar or footer.
- `brand.accent` / `brand.accent2` / `brand.theme_preference`: optional. Use them as the
  accent when they pass contrast. Otherwise keep them to the logo and CTA.
- `audience`: who reads their posts. This sets the vocabulary on the graphic.
- `identity_slot`: `"author-pill-top"`, `"brandbar-top"` or `"footer-only"`: where
  the identity appears.
- `cta_style`: the default lead-magnet CTA wording pattern.
- `proof_lines`: true facts for the mono footer line ("$153K MRR in 87 days").
- `content_skill`: the name of this client's LinkedIn content skill, if any. Read its
  onboarding for context.
- `used_metaphors`: append the metaphor after each graphic, so the next one is different.

## Workflow
1. Identify the client from the request ("for Ruben", "for my account", a company name).
   If it is ambiguous, ask in one line.
2. Load the profile. If it is missing, create it from the template with what you know and
   tell the user which fields are still empty (the headshot is the usual one).
3. After delivering, append `{date, slug, metaphor, theme}` to `used_metaphors`.

The user's own account uses the slug `me` unless they name it.
