// Copies the website into app/www (the folder Capacitor packs into the APK).
// Left out on purpose: admin pages, the sample subject, docs, SQL, tools, the service worker (the app already keeps its files on the phone).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const src = path.resolve(here, "..");
const out = path.join(here, "www");
const skip = (rel) =>
  rel === "pages/admin" || rel.startsWith("pages/admin/") ||
  rel === "programs/sample-subject" || rel.startsWith("programs/sample-subject/") ||
  rel.endsWith(".gitkeep");

fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });
for (const f of ["index.html", "offline.html", "404.html", "manifest.json"]) {
  if (fs.existsSync(path.join(src, f))) fs.copyFileSync(path.join(src, f), path.join(out, f));
}
for (const d of ["assets", "branch", "typing", "pages", "programs"]) {
  const from = path.join(src, d);
  if (!fs.existsSync(from)) continue;
  fs.cpSync(from, path.join(out, d), {
    recursive: true,
    filter: (p) => !skip(path.relative(src, p).split(path.sep).join("/")),
  });
}
if (!fs.existsSync(path.join(out, "index.html"))) { console.error("index.html missing in the website root"); process.exit(1); }

let files = 0, bytes = 0;
(function walk(d) { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) walk(p); else { files++; bytes += fs.statSync(p).size; } } })(out);
fs.writeFileSync(path.join(out, "app-build.json"), JSON.stringify({ built: new Date().toISOString(), files }, null, 2));
console.log(`www ready: ${files} files, ${(bytes / 1048576).toFixed(1)} MB`);
