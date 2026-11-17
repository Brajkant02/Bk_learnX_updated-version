// Finds broken local links and missing files in the website.   node tools/check-links.mjs [folder]
// Checks every href / src that starts with "/" in every .html file, and every url() in CSS. Folder default = website root.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(process.argv[2] || path.join(here, ".."));
const skipDirs = new Set(["node_modules", "www", "android", "ios", ".git", "docs", "supabase", "app", "tools"]);
const files = [];
(function walk(d) { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) { if (!skipDirs.has(e.name)) walk(p); } else files.push(p); } })(root);

const exists = (urlPath) => {
  let p = decodeURIComponent(urlPath.split("#")[0].split("?")[0]);
  if (p === "" || p === "/") p = "/index.html";
  const abs = path.join(root, p);
  if (fs.existsSync(abs) && fs.statSync(abs).isFile()) return true;
  if (fs.existsSync(abs) && fs.statSync(abs).isDirectory()) return fs.existsSync(path.join(abs, "index.html"));
  return false;
};
const bad = []; let checked = 0;
for (const f of files) {
  const rel = path.relative(root, f);
  if (f.endsWith(".html")) {
    const html = fs.readFileSync(f, "utf8").replace(/<!--[\s\S]*?-->/g, "").replace(/<script[^>]*>[\s\S]*?<\/script>/g, (m) => m.replace(/[\s\S]*/, (x) => x.startsWith("<script") && /src=/.test(x.split(">")[0]) ? x.split(">")[0] + "></script>" : ""));
    for (const m of html.matchAll(/\b(?:href|src)="(\/[^"\s]*)"/g)) {
      const u = m[1]; if (u.startsWith("//") || u.includes("{{")) continue;
      checked++; if (!exists(u)) bad.push(`${rel}  ->  ${u}`);
    }
  } else if (f.endsWith(".css")) {
    const css = fs.readFileSync(f, "utf8");
    for (const m of css.matchAll(/url\(\s*['"]?([^'")]+)['"]?\s*\)/g)) {
      const u = m[1]; if (/^(data:|https?:|#)/.test(u)) continue;
      const abs = path.resolve(path.dirname(f), u.split("?")[0].split("#")[0]);
      checked++; if (!fs.existsSync(abs)) bad.push(`${rel}  ->  ${u}`);
    }
  }
}
console.log(`checked ${checked} links in ${files.filter((f) => f.endsWith(".html")).length} pages`);
if (bad.length) { console.log(`\n${bad.length} BROKEN:`); [...new Set(bad)].forEach((b) => console.log("  " + b)); process.exit(1); }
console.log("no broken links");
