// Chooses how the app gets its pages. Run before `cap add android`.
//   APP_MODE=live     the app opens your website (always up to date; pages you opened before also work offline). Needs SITE_URL.
//   APP_MODE=bundled  all pages are packed inside the APK (works fully offline, but new notes need a NEW APK).
import fs from "node:fs";

const mode = (process.env.APP_MODE || "bundled").toLowerCase();
const url = (process.env.SITE_URL || "").trim().replace(/\/+$/, "");
const file = new URL("./capacitor.config.json", import.meta.url);
const cfg = JSON.parse(fs.readFileSync(file, "utf8"));
cfg.server = cfg.server || {};
if (mode === "live") {
  if (!/^https:\/\/[^\s/]+/.test(url)) { console.error("Live mode needs SITE_URL, like https://your-site.vercel.app"); process.exit(1); }
  cfg.server.url = url;
  cfg.server.androidScheme = "https";
} else if (mode === "bundled") {
  delete cfg.server.url;
} else { console.error("APP_MODE must be 'live' or 'bundled'"); process.exit(1); }
fs.writeFileSync(file, JSON.stringify(cfg, null, 2) + "\n");
console.log("app mode: " + mode + (mode === "live" ? "  ->  " + url : "  (pages are inside the app)"));
