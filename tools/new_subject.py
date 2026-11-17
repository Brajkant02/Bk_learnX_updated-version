#!/usr/bin/env python3
"""Make a new subject folder with all its unit pages, then print the SQL to register it.

  python tools/new_subject.py python "Python" --units 10 --hindi
  python tools/new_subject.py python "Python" --units 10 --hindi --titles "Intro,..." --titles-hi "परिचय,..."
  python tools/new_subject.py java "Java" --units 8 --titles "Introduction,Constructs,Classes,Inheritance,Abstract,Polymorphism,Exceptions,Threads"

Creates  programs/<slug>/index.html  unit_1.html ... unit_N.html   (and *_hindi.html with --hindi)
Then paste the SQL it prints into the Supabase SQL Editor.  Existing files are never overwritten (use --force).
"""
import argparse, html, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)

SAMPLE = {
 "en": """<p>Write your notes here. This sample shows what you can use.</p>
<h2>First topic</h2>
<p>Normal paragraphs, <strong>bold</strong>, <em>italic</em> and <a href="#">links</a> work as usual.</p>
<ul><li>Bullet one</li><li>Bullet two</li></ul>
<h2>Code and tables</h2>
<pre><code>print("Hello, BK LearnX")</code></pre>
<table><tr><th>Term</th><th>Meaning</th></tr><tr><td>Example</td><td>A short explanation</td></tr></table>
<h2>Boxes and images</h2>
<div class="note"><p><strong>Note:</strong> use class "note", "tip" or "warn" for coloured boxes.</p></div>
<div class="tip"><p><strong>Tip:</strong> a helpful hint.</p></div>
<div class="warn"><p><strong>Careful:</strong> a common mistake.</p></div>
<!-- Use your own picture: <img src="/assets/images/your-diagram.webp" alt="..." loading="lazy"> -->
<figure><img src="data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 600 240%27%3E%3Crect width=%27600%27 height=%27240%27 rx=%2716%27 fill=%27%23e8eee4%27/%3E%3Ctext x=%27300%27 y=%27128%27 font-family=%27sans-serif%27 font-size=%2722%27 text-anchor=%27middle%27 fill=%27%2355655e%27%3EYour picture goes here%3C/text%3E%3C/svg%3E" alt="Sample picture" loading="lazy"><figcaption>Caption of the picture</figcaption></figure>
<details><summary>Click to see the answer</summary><p>Hidden text.</p></details>""",
 "hi": """<p>अपने नोट्स यहाँ लिखें। यह नमूना दिखाता है कि आप क्या-क्या इस्तेमाल कर सकते हैं।</p>
<h2>पहला विषय</h2>
<p>साधारण अनुच्छेद, <strong>मोटे अक्षर</strong>, <em>तिरछे अक्षर</em> और <a href="#">लिंक</a> सब चलते हैं।</p>
<ul><li>पहला बिंदु</li><li>दूसरा बिंदु</li></ul>
<h2>कोड और तालिका</h2>
<pre><code>print("Hello, BK LearnX")</code></pre>
<table><tr><th>शब्द</th><th>अर्थ</th></tr><tr><td>उदाहरण</td><td>एक छोटी व्याख्या</td></tr></table>
<h2>बॉक्स और चित्र</h2>
<div class="note"><p><strong>ध्यान दें:</strong> रंगीन बॉक्स के लिए class "note", "tip" या "warn" लगाएँ।</p></div>
<div class="tip"><p><strong>सुझाव:</strong> एक काम की बात।</p></div>
<div class="warn"><p><strong>सावधान:</strong> एक आम गलती।</p></div>
<!-- अपनी फ़ोटो: <img src="/assets/images/your-diagram.webp" alt="..." loading="lazy"> -->
<figure><img src="data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 600 240%27%3E%3Crect width=%27600%27 height=%27240%27 rx=%2716%27 fill=%27%23e8eee4%27/%3E%3Ctext x=%27300%27 y=%27128%27 font-family=%27sans-serif%27 font-size=%2722%27 text-anchor=%27middle%27 fill=%27%2355655e%27%3EYour picture goes here%3C/text%3E%3C/svg%3E" alt="नमूना चित्र" loading="lazy"><figcaption>चित्र का शीर्षक</figcaption></figure>
<details><summary>उत्तर देखने के लिए क्लिक करें</summary><p>छिपा हुआ पाठ।</p></details>""",
}
WORD = {"en": "Unit", "hi": "यूनिट"}

def fill(tpl, **kw):
    for k, v in kw.items():
        tpl = tpl.replace("{{" + k + "}}", str(v))
    return tpl

def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("slug", help="folder name, lowercase with hyphens, e.g. python or web-basics")
    ap.add_argument("name", help='display name, e.g. "Python"')
    ap.add_argument("--units", type=int, required=True, help="number of units")
    ap.add_argument("--hindi", action="store_true", help="also create the *_hindi.html pages")
    ap.add_argument("--titles", default="", help="comma separated unit titles (optional)")
    ap.add_argument("--titles-hi", default="", help="comma separated Hindi unit titles (optional, with --hindi)")
    ap.add_argument("--desc", default="", help="one-line description for Google (optional)")
    ap.add_argument("--noindex", action="store_true", help="keep out of Google (for samples)")
    ap.add_argument("--out", default=os.path.join(ROOT, "programs"), help="output folder (default: programs)")
    ap.add_argument("--force", action="store_true", help="overwrite existing files")
    a = ap.parse_args()

    import re
    if not re.fullmatch(r"[a-z0-9]+(-[a-z0-9]+)*", a.slug): sys.exit("slug must be lowercase letters, digits and hyphens, e.g. web-basics")
    if a.units < 1 or a.units > 99: sys.exit("--units must be between 1 and 99")
    titles = [t.strip() for t in a.titles.split(",")] if a.titles else []
    if titles and len(titles) != a.units: sys.exit("--titles has %d items but --units is %d" % (len(titles), a.units))
    titles_hi = [t.strip() for t in a.titles_hi.split(",")] if a.titles_hi else []
    if titles_hi and len(titles_hi) != a.units: sys.exit("--titles-hi has %d items but --units is %d" % (len(titles_hi), a.units))

    unit_tpl = open(os.path.join(HERE, "templates", "unit.html"), encoding="utf8").read()
    idx_tpl = open(os.path.join(HERE, "templates", "index.html"), encoding="utf8").read()
    folder = os.path.join(a.out, a.slug); os.makedirs(folder, exist_ok=True)
    langs = ["en", "hi"] if a.hindi else ["en"]
    made, skipped = [], []

    def write(name, text):
        p = os.path.join(folder, name)
        if os.path.exists(p) and not a.force: skipped.append(name); return
        open(p, "w", encoding="utf8", newline="\n").write(text); made.append(name)

    for lang in langs:
        suf = "_hindi" if lang == "hi" else ""
        desc = html.escape(a.desc or ("%s notes in %s." % (a.name, "Hindi" if lang == "hi" else "English")), quote=True)
        robots = '<meta name="robots" content="noindex">' if a.noindex else ""
        items = []
        for n in range(1, a.units + 1):
            chosen = (titles_hi if lang == "hi" and titles_hi else titles)
            title = html.escape(chosen[n - 1] if chosen else "%s %d" % (WORD[lang], n), quote=True)
            items.append('<li><a href="/programs/%s/unit_%d%s.html">%s</a></li>' % (a.slug, n, suf, title))
            write("unit_%d%s.html" % (n, suf), fill(unit_tpl, LANG=lang, PAGE_TITLE="%s | %s" % (title, html.escape(a.name)), DESC=desc,
                  CANON="/programs/%s/unit_%d%s.html" % (a.slug, n, suf), ROBOTS=robots, COURSE="%s-%s" % (a.slug, lang), SLUG=a.slug,
                  NAME=html.escape(a.name, quote=True), N=n, TOTAL=a.units, TITLE=title, SAMPLE=SAMPLE[lang]))
        write("index%s.html" % suf, fill(idx_tpl, LANG=lang, PAGE_TITLE=html.escape(a.name) + (" (Hindi)" if lang == "hi" else ""), DESC=desc,
              CANON="/programs/%s/%s" % (a.slug, "index_hindi.html" if lang == "hi" else ""), ROBOTS=robots, SLUG=a.slug,
              NAME=html.escape(a.name, quote=True), ITEMS="\n".join(items)))

    print("\nCreated %d file(s) in %s" % (len(made), folder))
    if skipped: print("Skipped %d existing file(s) (use --force to overwrite)" % len(skipped))
    name_sql = a.name.replace("'", "''")
    print("\n-- Paste this into the Supabase SQL Editor (then place the subject in branches with course_placements):")
    print("insert into public.subjects (slug, name) values ('%s', '%s') on conflict (slug) do nothing;" % (a.slug, name_sql))
    rows = []
    for lang in langs:
        rows.append("  ('%s', '%s', '%s-%s', '/programs/%s/%s', %d)" % (a.slug, lang, a.slug, lang, a.slug, "index_hindi.html" if lang == "hi" else "", a.units))
    print("insert into public.courses (subject_id, language, slug, name, path, total_units)\nselect s.id, v.language, v.slug, s.name, v.path, v.units\nfrom (values\n" + ",\n".join(rows) +
          "\n) as v(subject, language, slug, path, units)\njoin public.subjects s on s.slug = v.subject\non conflict (slug) do nothing;")
    print("\n-- Example: use it in PGDCA semester 2")
    print("insert into public.course_placements (branch, semester, subject_id, sort_order)\nselect 'pgdca', 2, id, 1 from public.subjects where slug = '%s' on conflict do nothing;" % a.slug)

if __name__ == "__main__":
    main()
