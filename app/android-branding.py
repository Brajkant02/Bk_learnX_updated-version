#!/usr/bin/env python3
"""Puts the BK LearnX icon and splash into the Android project made by `cap add android`.
Run from the app/ folder after `npx cap add android`:   python android-branding.py [path-to-android-res]
Needs Pillow (pip install pillow). Source pictures: resources/icon-1024.png, icon-foreground-1024.png, splash-logo.png
"""
import os, sys
from PIL import Image, ImageDraw

HERE = os.path.dirname(os.path.abspath(__file__))
RES = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, "android", "app", "src", "main", "res")
BRAND = (31, 71, 65)          # #1f4741
if not os.path.isdir(RES):
    sys.exit("Android res folder not found: %s  (run `npx cap add android` first)" % RES)

icon = Image.open(os.path.join(HERE, "resources", "icon-1024.png")).convert("RGBA")
fg = Image.open(os.path.join(HERE, "resources", "icon-foreground-1024.png")).convert("RGBA")
logo = Image.open(os.path.join(HERE, "resources", "splash-logo.png")).convert("RGBA")

def mask_round(im, radius_ratio):
    m = Image.new("L", im.size, 0)
    ImageDraw.Draw(m).rounded_rectangle([0, 0, im.size[0] - 1, im.size[1] - 1], radius=int(im.size[0] * radius_ratio), fill=255)
    out = im.copy(); out.putalpha(m); return out

written = 0
for folder, px in [("mdpi", 48), ("hdpi", 72), ("xhdpi", 96), ("xxhdpi", 144), ("xxxhdpi", 192)]:
    d = os.path.join(RES, "mipmap-" + folder); os.makedirs(d, exist_ok=True)
    mask_round(icon.resize((px, px), Image.LANCZOS), 0.22).save(os.path.join(d, "ic_launcher.png")); written += 1
    mask_round(icon.resize((px, px), Image.LANCZOS), 0.5).save(os.path.join(d, "ic_launcher_round.png")); written += 1
    f = px * 108 // 48                                                  # adaptive icon layer is 108dp
    fg.resize((f, f), Image.LANCZOS).save(os.path.join(d, "ic_launcher_foreground.png")); written += 1

vals = os.path.join(RES, "values"); os.makedirs(vals, exist_ok=True)
open(os.path.join(vals, "ic_launcher_background.xml"), "w", encoding="utf8").write(
    '<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="ic_launcher_background">#1f4741</color>\n</resources>\n'); written += 1

splash = 0
for dp, dn, fn in os.walk(RES):
    for name in fn:
        if name == "splash.png":
            p = os.path.join(dp, name); w, h = Image.open(p).size
            canvas = Image.new("RGB", (w, h), BRAND); side = max(1, int(min(w, h) * 0.32))
            l = logo.resize((side, side), Image.LANCZOS); canvas.paste(l, ((w - side) // 2, (h - side) // 2), l)
            canvas.save(p); splash += 1
print("icons/background written: %d files; splash screens replaced: %d" % (written, splash))
