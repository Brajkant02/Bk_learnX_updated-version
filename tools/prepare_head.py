#!/usr/bin/env python3
"""Makes every page app-ready. Safe to run again any time (it only changes what is still missing):
   - removes Google Fonts links (fonts are inside the site now)
   - loads supabase-js from /assets/vendor/ instead of a CDN
   - adds the manifest, favicon and apple-touch-icon links
Run after adding pages by hand:   python tools/prepare_head.py
"""
import os, re, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SKIP = {"node_modules", "www", "android", "ios", ".git", "docs", "supabase"}
TAGS = ('<link rel="manifest" href="/manifest.json">\n'
        '<link rel="icon" type="image/svg+xml" href="/assets/icons/favicon.svg">\n'
        '<link rel="icon" type="image/png" sizes="32x32" href="/assets/icons/favicon-32.png">\n'
        '<link rel="apple-touch-icon" href="/assets/icons/apple-touch-icon.png">\n')
changed = 0; seen = 0
for dp, dn, fn in os.walk(ROOT):
    dn[:] = [d for d in dn if d not in SKIP]
    for f in fn:
        if not f.endswith(".html"): continue
        p = os.path.join(dp, f); s = open(p, encoding="utf8").read(); o = s
        if "/assets/css/theme.css" not in s: continue
        seen += 1
        s = re.sub(r'<link[^>]*fonts\.g(?:oogleapis|static)\.com[^>]*>\s*\n?', "", s)
        s = re.sub(r'https://cdn\.jsdelivr\.net/npm/@supabase/supabase-js@[\d.]+/dist/umd/supabase(?:\.min)?\.js', "/assets/vendor/supabase.js", s)
        if 'rel="manifest"' not in s:
            s = s.replace('<link rel="stylesheet" href="/assets/css/theme.css">', TAGS + '<link rel="stylesheet" href="/assets/css/theme.css">', 1)
        if s != o:
            open(p, "w", encoding="utf8", newline="\n").write(s); changed += 1
print("checked %d page(s), updated %d" % (seen, changed))
