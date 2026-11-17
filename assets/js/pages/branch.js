// Branch page: /branch/?b=pgdca  -> semesters and subjects come from the database (course_placements).
// Subjects themselves live in /programs/<subject>/ ; here we only show links to them.
(function () {
  var I = window.BKI18n, A = window.BKAuth, sb = window.sb, P = window.BK_PROGRAMS || [];
  var $ = function (id) { return document.getElementById(id); };
  var t = function (k) { return I.t(k); };
  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
  I.add({
    en: { br_notes: "Notes in", br_en: "English", br_hi: "Hindi", br_sem: "Semester", br_none: "No subjects have been added for this semester yet.",
      br_unknown: "We could not find this branch.", br_home: "Back to home", br_units: "units", br_miss: "Hindi is not available yet. Showing English.", br_open: "Open" },
    hi: { br_notes: "नोट्स की भाषा", br_en: "English", br_hi: "हिंदी", br_sem: "सेमेस्टर", br_none: "इस सेमेस्टर के लिए अभी कोई subject नहीं जोड़ा गया है।",
      br_unknown: "यह branch नहीं मिली।", br_home: "होम पर वापस जाएँ", br_units: "यूनिट", br_miss: "हिंदी अभी उपलब्ध नहीं है। English दिखा रहे हैं।", br_open: "खोलें" }
  });
  var slug = new URLSearchParams(location.search).get("b");
  var prog = P.filter(function (x) { return x.slug === slug; })[0];
  if (!prog) { $("out").innerHTML = '<div class="bk-empty"><p data-i18n="br_unknown"></p><p><a class="bk-btn bk-btn--sm" href="/" data-i18n="br_home"></a></p></div>'; return; }
  document.title = prog.name + " | BK LearnX";
  var st = { lang: I.lang === "hi" ? "hi" : "en", sem: prog.semesters.length ? prog.semesters[0] : null, rows: [], courses: [] };

  function pick(subjectId) {
    var all = st.courses.filter(function (c) { return c.subject_id === subjectId; });
    var want = all.filter(function (c) { return c.language === st.lang; })[0];
    if (want) return { c: want, miss: false };
    var en = all.filter(function (c) { return c.language === "en"; })[0] || all[0];
    return en ? { c: en, miss: st.lang === "hi" && en.language === "en" } : null;
  }
  function paint() {
    var tabs = prog.semesters.map(function (n) { return '<button type="button" class="bk-tab" data-sem="' + n + '" aria-pressed="' + (n === st.sem) + '">' + t("br_sem") + " " + n + "</button>"; }).join("");
    var langs = ["en", "hi"].map(function (l) { return '<button type="button" class="bk-tab" data-lang="' + l + '" aria-pressed="' + (l === st.lang) + '">' + t("br_" + l) + "</button>"; }).join("");
    var rows = st.rows.filter(function (r) { return (r.semester || 0) === (st.sem || 0); }).sort(function (a, b) { return a.sort_order - b.sort_order; });
    var cards = rows.map(function (r) {
      var p = pick(r.subject_id), name = (r.subjects && r.subjects.name) || "";
      if (!p) return "";
      return '<a class="bk-card bk-stack" href="' + esc(p.c.path) + '"><div class="bk-tile" aria-hidden="true">' + esc(name.slice(0, 2).toUpperCase()) + "</div><h3>" + esc(name) + '</h3><p class="bk-muted"><span class="bk-badge">' + t("br_" + p.c.language) + "</span> " +
        (p.c.total_units ? p.c.total_units + " " + t("br_units") : "") + "</p>" + (p.miss ? '<p class="bk-hint">' + t("br_miss") + "</p>" : "") + "</a>";
    }).join("");
    $("out").innerHTML = '<div class="bk-stack"><h1>' + esc(prog.name) + '</h1><p class="bk-muted">' + esc(prog.full) + "</p>" +
      '<div class="bk-bar"><div class="bk-tabs" id="semtabs">' + tabs + '</div><div class="bk-tabs" role="group" aria-label="' + esc(t("br_notes")) + '">' + langs + "</div></div>" +
      (cards ? '<div class="bk-grid">' + cards + "</div>" : '<div class="bk-empty">' + t("br_none") + "</div>") + "</div>";
  }
  $("out").addEventListener("click", function (e) {
    var a = e.target.closest("[data-sem]"), b = e.target.closest("[data-lang]");
    if (a) { st.sem = Number(a.getAttribute("data-sem")); paint(); }
    if (b) { st.lang = b.getAttribute("data-lang"); paint(); }
  });
  document.addEventListener("bk:lang", paint);
  function safe(q) { return Promise.resolve(q).then(function (r) { return r || { data: null }; }, function () { return { data: null }; }); }
  Promise.all([
    safe(sb.from("course_placements").select("semester,sort_order,subject_id,subjects(id,name,slug)").eq("branch", slug).order("semester").order("sort_order")),
    safe(sb.from("courses").select("*")),
    A.getSession().then(function (s) { return s ? A.getProfile() : null; }).catch(function () { return null; })
  ]).then(function (r) {
    st.rows = r[0].data || []; st.courses = r[1].data || [];
    if (r[2] && r[2].medium) st.lang = r[2].medium;       // a logged-in student sees their own medium first
    paint(); I.apply();
  });
})();
