// Makes sitemap.xml and robots.txt.   node tools/build-sitemap.mjs [--site https://your-site] [--check]
//   Includes every public page (units, subject pages, contact, privacy, terms, typing start, each branch).
//   Leaves out: pages marked noindex (login, student, admin, typing test/result, samples), 404, offline.
//   --check only compares with the files on disk and exits 1 if they are out of date.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const argv = process.argv.slice(2);
const opt = (n) => { const i = argv.indexOf(n); return i >= 0 ? argv[i + 1] : undefined; };
const canon = () => { try { return (fs.readFileSync(path.join(root, "index.html"), "utf8").match(/rel="canonical" href="(https?:\/\/[^\/"]+)/) || [])[1]; } catch { return undefined; } };
const site = (opt("--site") || process.env.SITE_URL || canon() || "https://bk-learnx.vercel.app").replace(/\/+$/, "");
const skipDirs = new Set(["node_modules", "www", "android", "ios", ".git", ".github", "docs", "supabase", "app", "tools"]);
const skipFiles = new Set(["404.html", "offline.html"]);

export function buildSitemap() {
  const urls = new Set();
  (function walk(d) {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) { if (!skipDirs.has(e.name)) walk(p); continue; }
      if (!e.name.endsWith(".html") || skipFiles.has(e.name)) continue;
      const html = fs.readFileSync(p, "utf8");
      if (/<meta[^>]+name="robots"[^>]*noindex/i.test(html) || /http-equiv="refresh"/i.test(html)) continue;
      let rel = "/" + path.relative(root, p).split(path.sep).join("/");
      if (rel === "/branch/index.html") continue;                    // the branch page is shown per branch below
      rel = rel.replace(/\/index\.html$/, "/");
      if (rel === "") rel = "/";
      urls.add(rel);
    }
  })(root);
  try {                                                              // one URL per branch
    const w = {}; new Function("window", fs.readFileSync(path.join(root, "assets/js/core/programs.js"), "utf8"))(w);
    for (const b of w.BK_PROGRAMS || []) urls.add("/branch/?b=" + b.slug);
  } catch {}
  const list = [...urls].sort((a, b) => (a === "/" ? -1 : b === "/" ? 1 : a.localeCompare(b)));
  const esc = (s) => s.replace(/&/g, "&amp;");
  const xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    list.map((u) => `  <url><loc>${esc(site + u)}</loc></url>`).join("\n") + "\n</urlset>\n";
  const robots = `User-agent: *\nAllow: /\nDisallow: /pages/admin/\n\nSitemap: ${site}/sitemap.xml\n`;
  return { xml, robots, count: list.length, list };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { xml, robots, count } = buildSitemap();
  if (argv.includes("--check")) {
    const a = fs.existsSync(path.join(root, "sitemap.xml")) && fs.readFileSync(path.join(root, "sitemap.xml"), "utf8");
    const b = fs.existsSync(path.join(root, "robots.txt")) && fs.readFileSync(path.join(root, "robots.txt"), "utf8");
    if (a === xml && b === robots) { console.log("sitemap.xml and robots.txt are up to date (" + count + " pages)"); process.exit(0); }
    console.log("sitemap.xml / robots.txt are OUT OF DATE. Run: node tools/build-sitemap.mjs"); process.exit(1);
  }
  fs.writeFileSync(path.join(root, "sitemap.xml"), xml); fs.writeFileSync(path.join(root, "robots.txt"), robots);
  console.log(`sitemap.xml: ${count} pages for ${site}\nrobots.txt written`);
}
