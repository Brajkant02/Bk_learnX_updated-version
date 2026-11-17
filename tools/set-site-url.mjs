// Changes the website address everywhere (canonical links, JSON-LD, sitemap, robots).
//   node tools/set-site-url.mjs https://your-real-domain.in
// Then set  SITE_URL: "https://your-real-domain.in"  in assets/js/core/config.js yourself.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const next = (process.argv[2] || "").trim().replace(/\/+$/, "");
if (!/^https:\/\/[^\s/]+$/.test(next)) { console.error("Give the new address like  https://your-site.in  (https, no path)"); process.exit(1); }
const m = fs.readFileSync(path.join(root, "index.html"), "utf8").match(/rel="canonical" href="(https?:\/\/[^\/"]+)/);
const old = m && m[1];
if (!old) { console.error("Could not find the current address in index.html"); process.exit(1); }
if (old === next) { console.log("Already " + next); process.exit(0); }
const skip = new Set(["node_modules", "www", "android", "ios", ".git", "docs", "supabase", "app"]);
let changed = 0;
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) { if (!skip.has(e.name)) walk(p); continue; }
    if (!/\.(html|xml|txt)$/.test(e.name)) continue;
    const s = fs.readFileSync(p, "utf8");
    if (s.includes(old)) { fs.writeFileSync(p, s.split(old).join(next)); changed++; }
  }
})(root);
console.log(`${old}  ->  ${next}  (${changed} files)`);
spawnSync("node", [path.join(root, "tools/build-sitemap.mjs"), "--site", next], { stdio: "inherit" });
console.log('\nNow set  SITE_URL: "' + next + '"  in assets/js/core/config.js, and use the same address in Supabase (Site URL + Redirect URLs).');
