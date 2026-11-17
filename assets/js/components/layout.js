// Injects the shared header, mobile bottom bar, footer and announcement banner on every page.
// Page needs:  <body>  ...  <main id="main">...</main>  (optional <div id="bk-footer"></div>)
// Load (defer) after i18n.js:  theme.js (in head), i18n.js, layout.js
(function () {
  var src = document.currentScript && document.currentScript.src;
  var ROOT = src ? src.replace(/assets\/js\/components\/layout\.js.*$/, "") : "./";
  var preview = document.documentElement.hasAttribute("data-preview");
  var T = function (k) { return window.BKI18n.t(k); };
  var P = {
    home: '<path d="M3 11l9-8 9 8v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
    book: '<path d="M4 4h11a3 3 0 0 1 3 3v13H7a3 3 0 0 1-3-3z"/><path d="M4 17a3 3 0 0 1 3-3h11"/>',
    kb: '<rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M7 14h10"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    moon: '<path d="M21 13A9 9 0 1 1 11 3a7 7 0 0 0 10 10z"/>'
  };
  function svg(n) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + P[n] + "</svg>"; }
  function url(p) { return preview ? "#" : ROOT + p; }
  var cur = location.pathname;
  var NAV = [
    { i: "home", k: "nav_home", p: "index.html", m: "" },
    { i: "book", k: "nav_programs", p: "#programs", m: "/branch/" },
    { i: "kb", k: "nav_typing", p: "typing/1-exam-selection.html", m: "/typing/" }
  ];
  function isCur(n) {
    if (n.m) return cur.indexOf(n.m) === 0;
    return cur === "/" || cur === "/index.html" || cur.indexOf("/pages/home/") === 0;
  }
  function aria(n) { return isCur(n) ? ' aria-current="page"' : ""; }

  function build() {
    var b = document.body;
    var top = '<a class="bk-skip" href="#main" data-i18n="skip"></a><div id="bk-banner" class="bk-banner" hidden></div>' +
      '<header class="bk-header"><div class="bk-container">' +
      '<a class="bk-brand" href="' + url("index.html") + '"><span class="bk-logo" aria-hidden="true">BK</span><span>BK LearnX<small data-i18n="tagline"></small></span></a>' +
      '<nav class="bk-nav" data-i18n-aria="main_nav">' + NAV.map(function (n) {
        return '<a href="' + url(n.p) + '"' + aria(n) + ' data-i18n="' + n.k + '"></a>'; }).join("") +
      '<a href="' + url("pages/contact/") + '" data-i18n="nav_contact"></a></nav>' +
      '<div class="bk-actions"><button class="bk-iconbtn bk-lang" id="bk-lang" type="button" data-i18n-aria="lang_switch"></button>' +
      '<button class="bk-iconbtn" id="bk-theme" type="button"></button>' +
      '<a class="bk-btn bk-btn--sm" id="bk-auth" href="' + url("pages/auth/login/") + '" data-i18n="nav_login"></a></div></div></header>';
    b.insertAdjacentHTML("afterbegin", top);

    var foot = '<footer class="bk-footer"><div class="bk-container"><div><strong>BK LearnX</strong><br><span data-i18n="footer_note"></span></div>' +
      '<nav><a href="' + url("pages/contact/") + '" data-i18n="nav_contact"></a><a href="' + url("pages/privacy/") + '" data-i18n="footer_privacy"></a>' +
      '<a href="' + url("pages/terms/") + '" data-i18n="footer_terms"></a><a href="#" id="bk-install" hidden data-i18n="install_app"></a></nav></div></footer>';
    var slot = document.getElementById("bk-footer");
    if (slot) slot.innerHTML = foot; else b.insertAdjacentHTML("beforeend", foot);

    b.insertAdjacentHTML("beforeend", '<nav class="bk-bottom" data-i18n-aria="main_nav">' + NAV.map(function (n) {
      return '<a href="' + url(n.p) + '"' + aria(n) + '>' + svg(n.i) + '<span data-i18n="' + n.k + '"></span></a>'; }).join("") +
      '<a id="bk-auth-m" href="' + url("pages/auth/login/") + '">' + svg("user") + '<span data-i18n="nav_login"></span></a></nav>');
  }

  function paint() {
    var l = document.getElementById("bk-lang"), t = document.getElementById("bk-theme");
    l.textContent = window.BKI18n.lang === "hi" ? "EN" : "हिं";
    var dark = window.BKTheme.get() === "dark";
    t.innerHTML = svg(dark ? "sun" : "moon");
    t.setAttribute("aria-label", T(dark ? "theme_to_light" : "theme_to_dark"));
  }

  function wire() {
    document.getElementById("bk-lang").addEventListener("click", function () { window.BKI18n.toggle(); });
    document.getElementById("bk-theme").addEventListener("click", function () { window.BKTheme.toggle(); });
    document.addEventListener("bk:lang", paint);
    document.addEventListener("bk:theme", paint);
  }

  // Logged-in? show Dashboard instead of Log in. Banner from admin? show it. (Skipped when backend is not set up.)
  function backend() {
    if (!window.sb || preview) return;
    if (window.BKAuth) window.BKAuth.getSession().then(function (s) {
      if (!s) return;
      ["bk-auth", "bk-auth-m"].forEach(function (id) {
        var a = document.getElementById(id); if (!a) return;
        a.href = url("pages/student/dashboard/");
        var sp = a.querySelector("span") || a; sp.setAttribute("data-i18n", "nav_dashboard");
      });
      window.BKI18n.apply();
    }).catch(function () {});
    window.sb.from("announcements").select("text").order("created_at", { ascending: false }).limit(1)
      .then(function (r) {
        if (r.data && r.data[0]) { var el = document.getElementById("bk-banner"); el.textContent = r.data[0].text; el.hidden = false; }
      }).catch(function () {});
  }

  // ---- app side: offline pages, install button, offline notice ----
  var NATIVE = !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());
  var deferred = null;
  function toast(k) { var d = document.createElement("div"); d.className = "bk-toast"; d.setAttribute("role", "status"); d.textContent = T(k); document.body.appendChild(d); setTimeout(function () { d.remove(); }, 3200); }
  function appSide() {
    var BUNDLED = NATIVE && location.hostname === "localhost";      // pages packed inside the APK: they are already on the phone
    if (!BUNDLED && "serviceWorker" in navigator && /^https?:$/.test(location.protocol)) {
      var reg = function () { navigator.serviceWorker.register("/sw.js").catch(function () {}); };
      if (document.readyState === "complete") reg(); else window.addEventListener("load", reg);
    }
    window.addEventListener("offline", function () { toast("net_off"); });
    window.addEventListener("online", function () { toast("net_on"); });
    window.addEventListener("beforeinstallprompt", function (e) { e.preventDefault(); deferred = e; var a = document.getElementById("bk-install"); if (a && !NATIVE) a.hidden = false; });
    window.addEventListener("appinstalled", function () { deferred = null; var a = document.getElementById("bk-install"); if (a) a.hidden = true; });
    var a = document.getElementById("bk-install");
    if (a) a.addEventListener("click", function (e) { e.preventDefault(); if (!deferred) return; deferred.prompt(); deferred.userChoice.then(function () { deferred = null; a.hidden = true; }); });
    if (deferred && a && !NATIVE) a.hidden = false;
  }
  // the browser may fire beforeinstallprompt before this script runs: keep it
  window.addEventListener("beforeinstallprompt", function (e) { e.preventDefault(); deferred = e; });

  function init() { build(); wire(); paint(); window.BKI18n.apply(); backend(); appSide(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
