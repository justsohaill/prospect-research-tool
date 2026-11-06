#!/usr/bin/env bash
# Build linkedin-graphic.skill (a zip) for upload to Claude (Settings → Capabilities → Skills).
# Full-resolution PNG/MP4 examples stay in the repo; the package carries small JPG previews.
set -euo pipefail
SKILL_DIR="$(cd "$(dirname "$0")/.." && pwd)"
OUT="${1:-$SKILL_DIR/../linkedin-graphic.skill}"
TMP="$(mktemp -d)"; trap 'rm -rf "$TMP"' EXIT
mkdir -p "$TMP/linkedin-graphic"
cp -R "$SKILL_DIR/." "$TMP/linkedin-graphic/"
find "$TMP/linkedin-graphic" \( -name '*.mp4' -o -name '*.png' -o -name '*.qa.txt' -o -name '.DS_Store' \) -delete
for png in "$SKILL_DIR"/examples/*/*.png; do
  [ -e "$png" ] || continue
  rel="${png#$SKILL_DIR/}"; ffmpeg -v error -y -i "$png" -vf scale=1080:-1 -q:v 3 "$TMP/linkedin-graphic/${rel%.png}.preview.jpg"
done
rm -f "$OUT"; (cd "$TMP" && zip -qr "$OUT" linkedin-graphic)
echo "✓ $(cd "$(dirname "$OUT")" && pwd)/$(basename "$OUT")  ($(du -h "$OUT" | cut -f1))"
