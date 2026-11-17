// Home page: "Individual courses" = subjects that are not placed in any branch. They come from the database.
(function () {
  var I = window.BKI18n, sb = window.sb, box = document.getElementById("individual");
  if (!box || !sb) return;
  I.add({
    en: { h_ind: "Individual courses", h_ind_sub: "Learn one skill at a time. These are not tied to any branch.", h_ind_en: "English", h_ind_hi: "Hindi", h_ind_units: "units" },
    hi: { h_ind: "अलग-अलग कोर्स", h_ind_sub: "एक बार में एक skill सीखें। ये किसी branch से बँधे नहीं हैं।", h_ind_en: "English", h_ind_hi: "हिंदी", h_ind_units: "यूनिट" }
  });
  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
  var safe = function (q) { return Promise.resolve(q).then(function (r) { return r || { data: null }; }, function () { return { data: null }; }); };
  var groups = [];
  function paint() {
    if (!groups.length) { box.hidden = true; return; }
    $grid().innerHTML = groups.map(function (g) {
      var tile = esc(g.name.slice(0, 2).toUpperCase());
      return '<div class="bk-card bk-stack"><div class="bk-tile bk-tile--gold" aria-hidden="true">' + tile + "</div><h3>" + esc(g.name) + '</h3><div style="display:flex;gap:8px;flex-wrap:wrap">' +
        g.courses.map(function (c) { return '<a class="bk-btn bk-btn--sm bk-btn--ghost" href="' + esc(c.path) + '" lang="' + c.language + '">' + I.t("h_ind_" + c.language) + (c.total_units ? " · " + c.total_units + " " + I.t("h_ind_units") : "") + "</a>"; }).join("") + "</div></div>";
    }).join("");
    box.hidden = false;
  }
  function $grid() { return document.getElementById("ind-grid"); }
  Promise.all([safe(sb.from("courses").select("*")), safe(sb.from("course_placements").select("subject_id"))]).then(function (r) {
    var placed = {}; (r[1].data || []).forEach(function (p) { placed[p.subject_id] = 1; });
    var by = {};
    (r[0].data || []).forEach(function (c) { if (c.subject_id && !placed[c.subject_id]) (by[c.subject_id] = by[c.subject_id] || { name: c.name, courses: [] }).courses.push(c); });
    groups = Object.keys(by).map(function (k) { by[k].courses.sort(function (a, b) { return a.language < b.language ? -1 : 1; }); return by[k]; }).sort(function (a, b) { return a.name.localeCompare(b.name); });
    paint(); I.apply(box);
  });
  document.addEventListener("bk:lang", paint);
})();
