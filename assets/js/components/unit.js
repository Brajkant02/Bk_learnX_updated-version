// Unit page + subject page behaviour. The page itself only holds the NOTES; everything around them is added here.
//   Unit page    : <body data-course="python-en" data-subject="python" data-subject-name="Python" data-unit="3" data-units="10" data-lang="en" data-title="Functions" [data-pdf="/programs/python/pdf/unit-3.pdf"]>
//   Subject page : <body data-subject-page ... > with <ol id="bk-units"><li><a href="/programs/python/unit_1.html">Intro</a></li> ... </ol>
// File names:  unit_3.html (English)  unit_3_hindi.html (Hindi)   index.html / index_hindi.html (subject page)
(function () {
  var b = document.body, d = b.dataset, I = window.BKI18n, A = window.BKAuth, P = window.BKProgress;
  if (!d.subject) return;
  var $ = function (id) { return document.getElementById(id); };
  var t = function (k) { return I.t(k); };
  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
  I.add({
    en: { u_home: "Home", u_all: "All units", u_prev: "Previous", u_next: "Next", u_unit: "Unit", u_contents: "Contents", u_save: "Save", u_saved: "Saved", u_login_save: "Log in to save",
      u_complete: "Mark as complete", u_done: "Completed", u_login_track: "Log in to track your progress.", u_login: "Log in", u_to_hi: "Read in Hindi", u_to_en: "Read in English", u_pdf: "Download PDF",
      u_copy: "Copy", u_copied: "Copied", u_start: "Start", u_continue: "Continue", u_progress: "Your progress", u_units: "units" },
    hi: { u_home: "होम", u_all: "सारी यूनिट", u_prev: "पिछली", u_next: "अगली", u_unit: "यूनिट", u_contents: "विषय-सूची", u_save: "सहेजें", u_saved: "सहेजा गया", u_login_save: "सहेजने के लिए लॉग इन करें",
      u_complete: "पूरा हुआ मानें", u_done: "पूरा हुआ", u_login_track: "प्रगति सहेजने के लिए लॉग इन करें।", u_login: "लॉग इन", u_to_hi: "हिंदी में पढ़ें", u_to_en: "English में पढ़ें", u_pdf: "PDF डाउनलोड करें",
      u_copy: "कॉपी", u_copied: "कॉपी हो गया", u_start: "शुरू करें", u_continue: "जारी रखें", u_progress: "आपकी प्रगति", u_units: "यूनिट" }
  });
  var base = "/programs/" + d.subject + "/", lang = d.lang === "hi" ? "hi" : "en", other = lang === "hi" ? "en" : "hi";
  var unitUrl = function (n, l) { return base + "unit_" + n + (l === "hi" ? "_hindi" : "") + ".html"; };
  var indexUrl = function (l) { return base + (l === "hi" ? "index_hindi.html" : ""); };
  var here = location.pathname, loggedIn = false;
  var loginHref = "/pages/auth/login/?next=" + encodeURIComponent(here);

  // language switch: only shown when the other-language file really exists
  function langSwitch(url, into) {
    return fetch(url, { method: "HEAD" }).then(function (r) {
      if (!r.ok) return;
      var a = document.createElement("a"); a.className = "bk-btn bk-btn--ghost bk-btn--sm"; a.href = url; a.id = "bk-lang-sw";
      a.setAttribute("lang", other); a.textContent = t(other === "hi" ? "u_to_hi" : "u_to_en"); a.setAttribute("data-i18n", other === "hi" ? "u_to_hi" : "u_to_en");
      into.insertBefore(a, into.firstChild);
    }).catch(function () {});
  }

  /* ---------------- unit page ---------------- */
  function unitPage() {
    var n = Number(d.unit) || 1, total = Number(d.units) || n, art = document.querySelector("article");
    var top = $("bk-unit-top"), bottom = $("bk-unit-bottom");
    top.innerHTML = '<nav class="bk-crumbs" aria-label="Breadcrumb"><a href="/" data-i18n="u_home"></a><span aria-hidden="true">›</span><a href="' + indexUrl(lang) + '">' + esc(d.subjectName || d.subject) + '</a><span aria-hidden="true">›</span><span>' + esc(d.title || ((t("u_unit")) + " " + n)) + "</span></nav>" +
      '<div class="bk-unit-tools" id="bk-tools"></div>';
    var tools = $("bk-tools");
    if (d.pdf) tools.insertAdjacentHTML("beforeend", '<a class="bk-btn bk-btn--ghost bk-btn--sm" id="bk-pdf" href="' + esc(d.pdf) + '" target="_blank" rel="noopener" data-i18n="u_pdf"></a>');
    tools.insertAdjacentHTML("beforeend", '<span id="bk-save-slot"></span>');
    langSwitch(unitUrl(n, other), tools);

    // contents (from the h2 headings)
    var hs = art ? [].slice.call(art.querySelectorAll("h2")) : [];
    if (hs.length >= 3) {
      var toc = '<details class="bk-toc" open><summary data-i18n="u_contents"></summary><ol>' + hs.map(function (h, i) {
        if (!h.id) h.id = "s" + (i + 1); return '<li><a href="#' + h.id + '">' + esc(h.textContent) + "</a></li>"; }).join("") + "</ol></details>";
      var title = art.querySelector("h1");
      if (title) title.insertAdjacentHTML("afterend", toc); else art.insertAdjacentHTML("afterbegin", toc);
    }
    // copy buttons on code blocks
    if (art) [].forEach.call(art.querySelectorAll("pre"), function (pre) {
      var btn = document.createElement("button"); btn.type = "button"; btn.className = "bk-copy"; btn.textContent = t("u_copy");
      btn.addEventListener("click", function () {
        var txt = pre.querySelector("code") ? pre.querySelector("code").innerText : pre.innerText;
        var done = function () { btn.textContent = t("u_copied"); setTimeout(function () { btn.textContent = t("u_copy"); }, 1600); };
        if (navigator.clipboard) navigator.clipboard.writeText(txt).then(done, done); else done();
      });
      pre.appendChild(btn);
    });
    // bottom: previous / complete / next
    var prev = n > 1 ? '<a class="bk-btn bk-btn--ghost" href="' + unitUrl(n - 1, lang) + '" rel="prev">← <span data-i18n="u_prev"></span></a>' : "<span></span>";
    var next = n < total ? '<a class="bk-btn" href="' + unitUrl(n + 1, lang) + '" rel="next"><span data-i18n="u_next"></span> →</a>' : '<a class="bk-btn" href="' + indexUrl(lang) + '" data-i18n="u_all"></a>';
    bottom.innerHTML = '<div class="bk-unit-nav">' + prev + '<div class="mid" id="bk-mid"></div>' + next + "</div>";
    I.apply(document.body);

    // who is reading?
    A.getSession().then(function (s) {
      loggedIn = !!s; var mid = $("bk-mid"), slot = $("bk-save-slot");
      if (!loggedIn) {
        mid.innerHTML = '<a class="bk-link bk-track" href="' + loginHref + '" data-i18n="u_login_track"></a>';
        slot.innerHTML = '<a class="bk-btn bk-btn--ghost bk-btn--sm" id="bk-save" href="' + loginHref + '" data-i18n="u_login_save"></a>';
        I.apply(document.body); return;
      }
      P.visit();                                                              // remembers "last opened"
      mid.innerHTML = '<button type="button" class="bk-btn bk-btn--accent" id="bk-complete" aria-pressed="false" data-i18n="u_complete"></button>';
      slot.innerHTML = '<button type="button" class="bk-btn bk-btn--ghost bk-btn--sm" id="bk-save" aria-pressed="false"></button>';
      function paintDone(v) { var c = $("bk-complete"); c.setAttribute("aria-pressed", v); c.disabled = v; c.textContent = t(v ? "u_done" : "u_complete"); c.setAttribute("data-i18n", v ? "u_done" : "u_complete"); if (v) c.className = "bk-btn"; }
      function paintSave(v) { var s = $("bk-save"); s.setAttribute("aria-pressed", v); s.textContent = (v ? "★ " : "☆ ") + t(v ? "u_saved" : "u_save"); }
      var saved = false; P.isComplete().then(paintDone); P.isBookmarked().then(function (v) { saved = v; paintSave(v); });
      $("bk-complete").addEventListener("click", function () { P.complete().then(function () { paintDone(true); }); });
      $("bk-save").addEventListener("click", function () { P.toggleBookmark().then(function (v) { if (v !== null) { saved = v; paintSave(v); } }); });
      document.addEventListener("bk:lang", function () { paintSave(saved); });
    });
  }

  /* ---------------- subject page ---------------- */
  function subjectPage() {
    var list = $("bk-units"); if (!list) return;
    var links = [].slice.call(list.querySelectorAll("a")), h1 = document.querySelector("h1");
    var top = document.createElement("div"); top.className = "bk-sub-top"; top.id = "bk-sub-top";
    top.innerHTML = '<div class="row" id="bk-sub-row"></div><div id="bk-sub-prog"></div>';
    list.parentNode.insertBefore(top, list);
    if (links.length) $("bk-sub-row").innerHTML = '<a class="bk-btn bk-btn--accent" id="bk-go" href="' + esc(links[0].getAttribute("href")) + '" data-i18n="u_start"></a>';
    langSwitch(indexUrl(other), $("bk-sub-row"));
    I.apply(document.body);
    A.getSession().then(function (s) {
      if (!s) return;
      return Promise.resolve(window.sb.from("progress").select("unit_path,completed")).then(function (r) {
        var done = {}; (r.data || []).forEach(function (x) { if (x.completed) done[x.unit_path] = 1; });
        var n = 0, first = null;
        links.forEach(function (a) { var p = a.getAttribute("href"); if (done[p]) { n++; a.parentNode.classList.add("done"); } else if (!first) first = p; });
        if (links.length) $("bk-sub-prog").innerHTML = '<div class="bk-progress" role="progressbar" aria-valuenow="' + Math.round(100 * n / links.length) + '" aria-valuemin="0" aria-valuemax="100" style="--v:' + Math.round(100 * n / links.length) + '%"><i></i></div><small class="bk-muted"><span data-i18n="u_progress"></span>: ' + n + "/" + links.length + " " + t("u_units") + "</small>";
        if (n > 0 && first) { var g = $("bk-go"); g.href = first; g.setAttribute("data-i18n", "u_continue"); }
        I.apply(document.body);
      });
    }).catch(function () {});
  }
  if (b.hasAttribute("data-subject-page")) subjectPage(); else unitPage();
})();
