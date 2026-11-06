#!/usr/bin/env python3
"""
Fetch brand logos for a LinkedIn graphic, with graceful fallbacks.

    python3 logos.py --out ./logos HubSpot Salesforce "Clay=clay.com" "Apollo=apollo.io" Notion

Each argument is a brand name, optionally "Name=domain.com".
For every brand it tries, in order:
  1. Simple Icons (3,000+ brand SVGs; latest + v13 for brands removed since), fetched once
     via `npm pack` into ~/.cache/linkedin-graphic. Saved as <slug>.svg filled with the brand colour.
  2. The company's website icon (needs the domain): Google favicon service, DuckDuckGo
     icon service, then /apple-touch-icon.png on the domain. Saved as <slug>.png.
  3. A monogram tile (<slug>.svg): initials on a deterministic brand-ish colour.
     These are clearly placeholders — replace them before publishing if the logo matters.

Writes <out>/logos.js (window.LOGOS, include with <script src="logos/logos.js">) and <out>/logos.json  →  {"HubSpot": {"file": "hubspot.svg", "source": "simple-icons", "hex": "#FF7A59"}, ...}
Use the files inside a .tile element:  <div class="tile"><img src="logos/hubspot.svg"></div>
"""
import argparse, hashlib, json, os, re, shutil, subprocess, sys, tarfile, unicodedata, urllib.request

CACHE = os.path.expanduser("~/.cache/linkedin-graphic")


def slugify(s):
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode()
    s = s.lower().replace("+", "plus").replace("&", "and").replace(".", "dot")
    return re.sub(r"[^a-z0-9]", "", s)


def norm(s):
    return re.sub(r"[^a-z0-9]", "", unicodedata.normalize("NFKD", s).lower())


# Two icon sets: latest, plus v13 which still ships brands later removed at the
# owners' request (LinkedIn, Slack, Salesforce, Microsoft products, ...).
SI_SETS = [("simple-icons", "latest"), ("simple-icons@13", "v13")]


def set_dir(tag):
    return os.path.join(CACHE, "simple-icons-" + tag)


def si_data_path(d):
    for sub in ("data", "_data"):  # v14+ uses data/, older versions _data/
        p = os.path.join(d, sub, "simple-icons.json")
        if os.path.exists(p):
            return p
    return None


def ensure_set(spec, tag):
    d = set_dir(tag)
    if os.path.isdir(os.path.join(d, "icons")) and si_data_path(d):
        return True
    os.makedirs(CACHE, exist_ok=True)
    try:
        tgz = subprocess.run(["npm", "pack", spec, "--silent", "--pack-destination", CACHE],
                             capture_output=True, text=True, timeout=180).stdout.strip().splitlines()[-1]
        with tarfile.open(os.path.join(CACHE, tgz)) as t:
            for m in t.getmembers():  # extract SVG + JSON data only — nothing from the package is executed
                if m.isfile() and ".." not in m.name and (m.name.startswith("package/icons/") or m.name.endswith("data/simple-icons.json")):
                    dest = os.path.join(d, m.name[len("package/"):])
                    os.makedirs(os.path.dirname(dest), exist_ok=True)
                    with t.extractfile(m) as f, open(dest, "wb") as o:
                        o.write(f.read())
        os.remove(os.path.join(CACHE, tgz))
        return True
    except Exception as e:
        print(f"  ({spec} unavailable: {e})", file=sys.stderr)
        return False


def si_index():
    """norm(name) -> (svg_path, hex); latest set wins, v13 fills the gaps."""
    idx = {}
    for spec, tag in SI_SETS:
        if not ensure_set(spec, tag):
            continue
        d = set_dir(tag)
        data = json.load(open(si_data_path(d)))
        data = data if isinstance(data, list) else data.get("icons", [])
        for it in data:
            svg = os.path.join(d, "icons", (it.get("slug") or slugify(it["title"])) + ".svg")
            if not os.path.exists(svg):
                continue
            entry = (svg, "#" + it["hex"])
            idx.setdefault(norm(it["title"]), entry)
            for a in (it.get("aliases") or {}).get("aka", []):
                idx.setdefault(norm(a), entry)
    return idx


def fetch(url, timeout=8):
    req = urllib.request.Request(url, headers={"User-Agent": "linkedin-graphic-logo-fetcher/1.0"})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        if r.status != 200:
            raise IOError(r.status)
        return r.read()


def web_icon(domain):
    for url in (f"https://www.google.com/s2/favicons?domain={domain}&sz=256",
                f"https://icons.duckduckgo.com/ip3/{domain}.ico",
                f"https://{domain}/apple-touch-icon.png"):
        try:
            b = fetch(url)
            if len(b) > 600:  # tiny responses are default globe icons
                return b
        except Exception:
            pass
    return None


PALETTE = ["#111827", "#2F8CF0", "#6A5CF5", "#F0384F", "#FF7A1A", "#13A07A", "#B24FE0", "#0EA5E9", "#E11D74", "#4B5563"]


def monogram(name):
    words = re.findall(r"[A-Za-z0-9]+", name)
    ini = (words[0][0] + (words[1][0] if len(words) > 1 else words[0][1:2])).upper() if words else "?"
    col = PALETTE[int(hashlib.md5(name.encode()).hexdigest(), 16) % len(PALETTE)]
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="16" fill="{col}"/>'
            f'<text x="32" y="41" text-anchor="middle" font-family="Inter Tight,Inter,Arial" font-weight="800" '
            f'font-size="26" letter-spacing="-1" fill="#fff">{ini}</text></svg>'), col


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("brands", nargs="+")
    ap.add_argument("--out", default="logos")
    ap.add_argument("--mono", action="store_true", help="simple-icons in single colour (currentColor) instead of brand hex")
    a = ap.parse_args()
    os.makedirs(a.out, exist_ok=True)
    manifest_path = os.path.join(a.out, "logos.json")
    manifest = json.load(open(manifest_path)) if os.path.exists(manifest_path) else {}
    idx = si_index()

    for raw in a.brands:
        name, _, domain = raw.partition("=")
        name, domain = name.strip(), domain.strip()
        slug = slugify(name) or "logo"
        hit = idx.get(norm(name)) or (idx.get(norm(domain.split(".")[0])) if domain else None)
        if hit:
            svg = open(hit[0]).read()
            fill = "currentColor" if a.mono else hit[1]
            svg = svg.replace("<svg ", f'<svg fill="{fill}" ', 1)
            open(os.path.join(a.out, slug + ".svg"), "w").write(svg)
            manifest[name] = {"file": slug + ".svg", "source": "simple-icons", "hex": hit[1]}
        elif domain and (b := web_icon(domain)):
            open(os.path.join(a.out, slug + ".png"), "wb").write(b)
            manifest[name] = {"file": slug + ".png", "source": "website", "hex": None}
        else:
            svg, col = monogram(name)
            open(os.path.join(a.out, slug + ".svg"), "w").write(svg)
            manifest[name] = {"file": slug + ".svg", "source": "monogram-PLACEHOLDER", "hex": col}
        m = manifest[name]
        print(f"  {'✓' if m['source'] != 'monogram-PLACEHOLDER' else '•'} {name:<24} {m['source']:<22} {m['file']}")

    json.dump(manifest, open(manifest_path, "w"), indent=2)
    # same data as a script, so the graphic can read it from file:// without fetch()
    with open(os.path.join(a.out, "logos.js"), "w") as f:
        f.write("window.LOGOS = " + json.dumps({k: dict(v, file=os.path.basename(a.out) + "/" + v["file"]) for k, v in manifest.items()}, indent=1) + ";\n")
    ph = [k for k, v in manifest.items() if v["source"].startswith("monogram")]
    if ph:
        print(f"\n  {len(ph)} placeholder monogram(s): {', '.join(ph)}\n  → add the domain (Name=domain.com) or drop a real logo file into {a.out}/")


if __name__ == "__main__":
    main()
