// One command before you go live:   node tools/golive-check.mjs   (add --verbose to also list everything that passed)
// Prints MUST-FIX problems (exit code 1) and things worth a look (warnings).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const verbose = process.argv.includes("--verbose");
const skipDirs = new Set(["node_modules", "www", "android", "ios", ".git", ".github", "docs", "supabase", "app", "tools"]);
const errs = [], warns = [], oks = [];
const E = (m, fix) => errs.push([m, fix]), W = (m, fix) => warns.push([m, fix]), K = (m) => oks.push(m);
const rd = (rel) => fs.readFileSync(path.join(root, rel), "utf8");
const has = (rel) => fs.existsSync(path.join(root, rel));
const files = [];
(function walk(d) { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) { if (!skipDirs.has(e.name)) walk(p); } else files.push(p); } })(root);
const rel = (p) => path.relative(root, p).split(path.sep).join("/");
const htmlFiles = files.filter((f) => f.endsWith(".html"));
const run = (script, args = []) => spawnSync("node", [path.join(root, "tools", script), ...args], { encoding: "utf8" });

// 1. files that must exist
const need = ["index.html", "404.html", "offline.html", "manifest.json", "sw.js", "sitemap.xml", "robots.txt", "vercel.json", "assets/css/theme.css", "assets/vendor/supabase.js",
  "assets/icons/icon-192.png", "assets/icons/icon-512.png", "assets/icons/icon-maskable-512.png", "assets/fonts/inter-latin-wght-normal.woff2"];
const missing = need.filter((f) => !has(f));
missing.length ? missing.forEach((f) => E("Missing file: " + f, "Restore it from the latest zip (or run node tools/build-sitemap.mjs for sitemap/robots).")) : K("all " + need.length + " required files are present");

// 2. config.js
let C = null;
try { const w = {}; new Function("window", rd("assets/js/core/config.js"))(w); C = w.BK_CONFIG; } catch (e) { E("assets/js/core/config.js cannot be read: " + e.message, "Open it and fix the syntax."); }
const jwt = (t) => { const m = /^eyJ[\w-]+\.([\w-]+)\.[\w-]+$/.exec(t || ""); if (!m) return null; try { return JSON.parse(Buffer.from(m[1].replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8")); } catch { return null; } };
let canonOrigin = null;
if (C) {
  if (!/^https:\/\/[a-z0-9]{10,}\.supabase\.co$/.test(C.SUPABASE_URL || "")) E("config.js: SUPABASE_URL is a placeholder or wrong (" + (C.SUPABASE_URL || "empty") + ")", "Supabase > Project Settings > API > Project URL, paste into config.js.");
  else K("Supabase URL looks right");
  const k = C.SUPABASE_ANON_KEY || "";
  if (!k || /YOUR-/i.test(k)) E("config.js: SUPABASE_ANON_KEY is still a placeholder", "Supabase > Project Settings > API > anon / publishable key.");
  else if (/^sb_secret_/.test(k)) E("CRITICAL: config.js holds a SECRET key", "Replace it with the anon/publishable key, then rotate the secret key in Supabase.");
  else if (jwt(k) && jwt(k).role === "service_role") E("CRITICAL: config.js holds the service_role key. Anyone can read and change your whole database", "Replace it with the anon key, then rotate the service_role key in Supabase.");
  else if (jwt(k) && jwt(k).role !== "anon") W("config.js key has role '" + jwt(k).role + "', expected 'anon'", "Use the anon / publishable key.");
  else K("Supabase key is a public (anon) key");
}
// 3. secrets in served files
const textExt = /\.(html|js|json|xml|txt|css|md)$/;
let leaked = 0;
for (const f of files) {
  const r = rel(f);
  if (path.basename(f) === ".env" || /(^|\/)\.env\.(?!example$)[\w.]+$/.test(r)) { E("A secrets file is inside the website: " + r, "Delete it and add it to .gitignore. Change every key that was inside it."); leaked++; continue; }
  if (!textExt.test(f) || r.startsWith("assets/vendor/") || r.endsWith("/.gitkeep")) continue;
  const s = fs.readFileSync(f, "utf8");
  if (/sb_secret_[\w-]{10,}/.test(s)) { E("A secret key (sb_secret_...) is in " + r, "Remove it and rotate the key in Supabase."); leaked++; }
  for (const m of s.matchAll(/eyJ[\w-]{10,}\.[\w-]{10,}\.[\w-]{10,}/g)) { const j = jwt(m[0]); if (j && j.role === "service_role") { E("The service_role key is in " + r, "Remove it and rotate the key in Supabase."); leaked++; } }
}
if (!leaked) K("no secret keys or .env files in the website");
// 4. pages
const origins = new Set(), titles = {}, noAlt = [];
const isPrivate = (r) => /^pages\/(admin|student|auth)\//.test(r) || /^typing\/[23]-/.test(r) || r === "404.html" || r === "offline.html";
let publicPages = 0;
for (const f of htmlFiles) {
  const r = rel(f), s = fs.readFileSync(f, "utf8"), noindex = /<meta[^>]+name="robots"[^>]*noindex/i.test(s), refresh = /http-equiv="refresh"/i.test(s);
  if (/\{\{[A-Z_]+\}\}/.test(s)) E("Template placeholder left in " + r, "Search for {{ in the file and fill it in.");
  if (isPrivate(r) && !noindex) E("Private page can appear in Google: " + r, 'Add <meta name="robots" content="noindex"> to its <head>.');
  if (r.startsWith("programs/") && !r.startsWith("programs/sample-subject/") && noindex) W("Subject page hidden from Google: " + r, "Remove the noindex line if this is a real subject.");
  if (noindex || refresh) continue;
  publicPages++;
  const t = (/<title>([^<]*)<\/title>/.exec(s) || [])[1];
  const d = (/<meta name="description" content="([^"]*)"/.exec(s) || [])[1];
  const c = (/rel="canonical" href="(https?:\/\/[^"]+)"/.exec(s) || [])[1];
  if (!t || !t.trim()) E("Page has no title: " + r, "Add a <title>."); else (titles[t.trim()] = titles[t.trim()] || []).push(r);
  if (!d || d.length < 40) W("Short or missing description: " + r, "Write a 60 to 160 character meta description (Google shows it).");
  if (!c) W("No canonical link: " + r, 'Add <link rel="canonical" href="https://your-site/..">'); else origins.add(new URL(c).origin);
  for (const m of s.matchAll(/<img\b[^>]*>/g)) if (!/\balt=/.test(m[0]) && !/<!--/.test(m[0])) noAlt.push(r);
}
K(publicPages + " public pages checked");
if (origins.size > 1) E("Pages disagree about the site address: " + [...origins].join(" , "), "Run: node tools/set-site-url.mjs https://your-real-address");
else if (origins.size === 1) { canonOrigin = [...origins][0]; K("every page uses the same address (" + canonOrigin + ")"); }
const dups = Object.entries(titles).filter(([, v]) => v.length > 1 && v.some((x) => x.startsWith("programs/")));
dups.slice(0, 5).forEach(([t, v]) => W(v.length + " subject pages share the title \"" + t + "\"", "Give every unit its own title (data-title and <title>)."));
if (noAlt.length) W(noAlt.length + " picture(s) without alt text (first: " + [...new Set(noAlt)][0] + ")", "Add alt=\"...\" describing the picture (helps Google and blind readers).");
if (C && C.SITE_URL) {
  if (!/^https:\/\/[^\s/]+$/.test(C.SITE_URL)) E("config.js SITE_URL must look like https://your-site.in (no slash at the end)", "Fix SITE_URL.");
  else if (canonOrigin && C.SITE_URL !== canonOrigin) E("config.js SITE_URL (" + C.SITE_URL + ") differs from the address in the pages (" + canonOrigin + ")", "Make them the same: node tools/set-site-url.mjs " + C.SITE_URL);
  else K("SITE_URL is set and matches");
} else if (C) W("config.js has no SITE_URL", 'Add SITE_URL: "https://your-site.in". Confirmation emails sent from the app use it.');
if (C && !Object.values(C.CONTACT || {}).some((v) => String(v).trim())) W("Contact page has no WhatsApp/Email/social links yet", "Fill CONTACT in config.js.");
// 5. leftovers
if (has("programs/sample-subject")) E("The sample subject is still in programs/", "Delete the folder programs/sample-subject (then run node tools/build-sitemap.mjs).");
else K("sample subject removed");
// 6. sitemap + links
const sm = run("build-sitemap.mjs", ["--check"]); sm.status === 0 ? K("sitemap.xml and robots.txt are up to date") : E("sitemap.xml / robots.txt are out of date", "Run: node tools/build-sitemap.mjs");
const lk = run("check-links.mjs");
if (lk.status === 0) K((/checked (\d+) links/.exec(lk.stdout) || [])[1] + " links checked, none broken");
else E("Broken links found:\n" + lk.stdout.split("\n").slice(1, 8).map((x) => "       " + x.trim()).filter((x) => x.trim()).join("\n"), "Fix or remove them, then run this check again.");
// 7. redirects
try { const v = JSON.parse(rd("vercel.json")); const n = (v.redirects || []).length; n <= 2 ? W("No redirects from the OLD site's addresses yet (only " + n + " rule(s))", "Phase 9: ask Claude to generate the redirect list once your subjects and units exist.") : K(n + " redirect rules"); } catch { E("vercel.json is not valid JSON", "Fix the syntax."); }
// 8. typing passages
try { const w = {}; new Function("window", rd("assets/js/typing/data.js"))(w); const P = w.BK_TYPING.passages; ["en", "hi"].forEach((l) => { const n = P[l].practice.length + P[l].current.length; n < 20 && W("Only " + n + " " + (l === "en" ? "English" : "Hindi") + " typing passages", "Add more in assets/js/typing/data.js (20+ is a good start)."); }); } catch {}
// 9. home cards vs branches
try { const w = {}; new Function("window", rd("assets/js/core/programs.js"))(w); const cards = (rd("index.html").match(/href="\/branch\/\?b=/g) || []).length; cards !== w.BK_PROGRAMS.length ? W("Home shows " + cards + " branch cards but programs.js has " + w.BK_PROGRAMS.length, "Keep index.html cards and programs.js in sync.") : K("Home cards match programs.js (" + cards + " branches)"); } catch {}
// 10. units folders consistent
const progDir = path.join(root, "programs"); let subjects = 0; const unitWarn = [];
if (fs.existsSync(progDir)) for (const d of fs.readdirSync(progDir, { withFileTypes: true })) {
  if (!d.isDirectory() || d.name === "sample-subject") continue; subjects++;
  const dir = path.join(progDir, d.name), names = fs.readdirSync(dir);
  for (const lang of ["en", "hi"]) {
    const re = lang === "hi" ? /^unit_(\d+)_hindi\.html$/ : /^unit_(\d+)\.html$/;
    const units = names.map((n) => re.exec(n)).filter(Boolean).map((m) => Number(m[1])).sort((a, b) => a - b);
    if (!units.length) continue;
    const idx = path.join(dir, lang === "hi" ? "index_hindi.html" : "index.html");
    if (!fs.existsSync(idx)) { unitWarn.push(d.name + ": no " + path.basename(idx)); continue; }
    const li = (fs.readFileSync(idx, "utf8").match(/<li><a href=/g) || []).length;
    if (li !== units.length) unitWarn.push(d.name + " (" + lang + "): folder has " + units.length + " units, the subject page lists " + li);
    for (const n of units) {
      const s = fs.readFileSync(path.join(dir, "unit_" + n + (lang === "hi" ? "_hindi" : "") + ".html"), "utf8");
      const du = (/data-units="(\d+)"/.exec(s) || [])[1], dn = (/data-unit="(\d+)"/.exec(s) || [])[1], dc = (/data-course="([^"]*)"/.exec(s) || [])[1];
      if (Number(du) !== units.length) unitWarn.push(d.name + "/unit_" + n + ": data-units=" + du + " but " + units.length + " units exist");
      if (Number(dn) !== n) unitWarn.push(d.name + "/unit_" + n + ": data-unit=" + dn);
      if (dc !== d.name + "-" + lang) unitWarn.push(d.name + "/unit_" + n + ": data-course=\"" + dc + "\" should be \"" + d.name + "-" + lang + "\"");
    }
  }
}
unitWarn.slice(0, 8).forEach((m) => W("Units out of step: " + m, "Open that page and correct the numbers/names so progress and Next/Previous work."));
if (unitWarn.length > 8) W("...and " + (unitWarn.length - 8) + " more unit mismatches", "Fix the ones above and run again.");
subjects ? (!unitWarn.length && K(subjects + " subject(s): unit numbers and course names are consistent")) : W("No real subjects in programs/ yet", "Create them with tools/new_subject.py.");

// ---- report
const line = (s) => console.log(s);
line("\nBK LearnX go-live check\n=======================");
if (verbose) oks.forEach((m) => line("  ✓ " + m)); else line("  ✓ " + oks.length + " checks passed (use --verbose to list them)");
if (errs.length) { line("\n✗ " + errs.length + " problem(s) you MUST fix before going live:"); errs.forEach(([m, f], i) => { line("  " + (i + 1) + ". " + m); if (f) line("     fix: " + f); }); }
if (warns.length) { line("\n⚠ " + warns.length + " thing(s) worth a look:"); warns.forEach(([m, f], i) => { line("  " + (i + 1) + ". " + m); if (f) line("     fix: " + f); }); }
line(errs.length ? "\nNOT ready: fix the problems above and run this again." : warns.length ? "\nReady, but read the warnings above." : "\nAll clear. Ready to go live.");
process.exit(errs.length ? 1 : 0);
