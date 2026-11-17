/* BK LearnX service worker: makes the site work offline for pages you have opened before.
   - Only same-site GET requests are handled. The database/login (Supabase) and any other site are NEVER touched.
   - Admin pages are never saved.
   - To force everyone to refresh saved files after a big update, change VERSION. */
const VERSION = "bk-v1";
const SHELL = VERSION + "-shell", PAGES = VERSION + "-pages", FILES = VERSION + "-files";
const MAX_PAGES = 80, MAX_FILES = 150;
const PRECACHE = [
  "/", "/offline.html", "/manifest.json",
  "/assets/css/theme.css", "/assets/css/notes.css", "/assets/css/typing.css", "/assets/css/student.css",
  "/assets/fonts/inter-latin-wght-normal.woff2", "/assets/fonts/sora-latin-wght-normal.woff2", "/assets/fonts/noto-sans-devanagari-devanagari-wght-normal.woff2",
  "/assets/vendor/supabase.js",
  "/assets/js/core/theme.js", "/assets/js/core/config.js", "/assets/js/core/programs.js", "/assets/js/core/supabase.js", "/assets/js/core/auth.js", "/assets/js/core/i18n.js", "/assets/js/core/progress.js",
  "/assets/js/components/layout.js", "/assets/js/components/unit.js", "/assets/js/components/rating.js", "/assets/js/pages/home.js",
  "/assets/icons/icon-192.png", "/assets/icons/icon-512.png", "/assets/icons/apple-touch-icon.png", "/assets/icons/favicon.svg"
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(SHELL).then((c) => Promise.allSettled(PRECACHE.map((u) => c.add(u)))).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k.startsWith("bk-") && !k.startsWith(VERSION + "-")).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("message", (e) => { if (e.data === "SKIP_WAITING") self.skipWaiting(); });

async function trim(name, max) {
  const c = await caches.open(name), keys = await c.keys();
  for (let i = 0; i < keys.length - max; i++) await c.delete(keys[i]);   // oldest first
}
// IMPORTANT: copy the response (clone) BEFORE it is handed to the page, otherwise its body is already used and cannot be saved.
function put(name, req, res, max) {
  if (!res || !res.ok || res.type === "opaque" || res.redirected) return Promise.resolve();
  const copy = res.clone();
  return caches.open(name).then((c) => c.put(req, copy)).then(() => trim(name, max)).catch(() => {});
}
async function networkFirstPage(req, evt) {
  try { const res = await fetch(req); evt.waitUntil(put(PAGES, req, res, MAX_PAGES)); return res; }
  catch (err) {
    return (await caches.match(req)) || (await caches.match(req, { ignoreSearch: true })) || (await caches.match("/offline.html")) || Response.error();
  }
}
async function cacheFirst(req, evt) {
  const hit = await caches.match(req); if (hit) return hit;
  const res = await fetch(req); evt.waitUntil(put(FILES, req, res, MAX_FILES)); return res;
}
async function staleWhileRevalidate(req, evt) {
  const hit = await caches.match(req);
  const net = fetch(req).then((res) => { evt.waitUntil(put(SHELL, req, res, 400)); return res; }).catch(() => null);
  return hit || (await net) || Response.error();
}

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET" || req.headers.has("range")) return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;                     // Supabase, Google, WhatsApp ... untouched
  const p = url.pathname;
  if (p === "/sw.js" || p.startsWith("/pages/admin/") || p.startsWith("/api/")) return;
  if (req.mode === "navigate") { e.respondWith(networkFirstPage(req, e)); return; }
  const ext = (p.split(".").pop() || "").toLowerCase();
  if (["woff2", "png", "jpg", "jpeg", "webp", "avif", "gif", "svg", "ico"].includes(ext)) e.respondWith(cacheFirst(req, e));
  else if (["css", "js", "json"].includes(ext)) e.respondWith(staleWhileRevalidate(req, e));
  else if (ext === "pdf") e.respondWith(networkFirstPage(req, e));
});
