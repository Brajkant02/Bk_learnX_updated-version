// My courses: semester subjects (automatic) + courses the student added. "+ Add course" for anything else.
(function () {
  var S = window.BKStudent, $ = S.$, t = S.t, esc = S.esc, sb = window.sb;
  var me = null, mine = [], all = [];

  function paint() {
    $("list").innerHTML = mine.length ? mine.map(function (c) {
      var note = c.fallback && c.language === "en" ? '<br><small class="bk-muted">' + t("c_hi_missing") + "</small>" : "";
      return '<div class="bk-row-card"><div class="grow"><h3>' + esc(c.name) + '</h3><small class="bk-muted"><span class="bk-badge">' + t(c.language === "hi" ? "c_hi" : "c_en") + '</span> <span class="bk-badge">' + (c.source === "added" ? t("c_added") : t("c_sem")) + "</span>" + note + "</small>" +
        '<div class="bk-progress" style="--v:' + c.percent + '%;margin-top:8px" role="progressbar" aria-valuenow="' + c.percent + '" aria-valuemin="0" aria-valuemax="100"><i></i></div><small class="bk-muted">' + c.completed_units + "/" + c.total_units + " " + t("c_units") + " · " + c.percent + "%</small></div>" +
        '<div style="display:flex;gap:8px"><a class="bk-btn bk-btn--sm" href="' + esc(c.path) + '">' + t("c_open") + "</a>" +
        (c.source === "added" ? '<button type="button" class="bk-btn bk-btn--sm bk-btn--ghost" data-rm="' + c.id + '">' + t("c_remove") + "</button>" : "") + "</div></div>"; }).join("")
      : '<div class="bk-empty">' + t("c_empty") + "</div>";
  }
  function avail() {
    var have = {}; mine.forEach(function (c) { have[c.id] = 1; });
    var q = $("q").value.trim().toLowerCase();
    var rows = all.filter(function (c) { return !have[c.id] && (!q || c.name.toLowerCase().indexOf(q) >= 0); });
    $("avail").innerHTML = rows.length ? rows.map(function (c) {
      return '<div class="bk-row-card"><div class="grow"><h3>' + esc(c.name) + '</h3><small class="bk-muted"><span class="bk-badge">' + t(c.language === "hi" ? "c_hi" : "c_en") + '</span></small></div><button type="button" class="bk-btn bk-btn--sm bk-btn--accent" data-add="' + c.id + '">+ ' + t("c_add") + "</button></div>"; }).join("")
      : '<p class="bk-muted">' + t("c_none_avail") + "</p>";
  }
  function reload() { return S.safe(sb.rpc("my_courses")).then(function (r) { mine = r.data || []; paint(); avail(); }); }

  $("list").addEventListener("click", function (e) {
    var b = e.target.closest("[data-rm]"); if (!b) return;
    S.safe(sb.from("user_courses").delete().eq("user_id", me.id).eq("course_id", b.getAttribute("data-rm"))).then(function () { S.toast(t("c_removed")); return reload(); });
  });
  $("avail").addEventListener("click", function (e) {
    var b = e.target.closest("[data-add]"); if (!b) return; b.disabled = true;
    S.safe(sb.from("user_courses").insert({ user_id: me.id, course_id: b.getAttribute("data-add") })).then(function () { S.toast(t("c_added_ok")); return reload(); });
  });
  $("open-add").addEventListener("click", function () {
    var p = $("add"); p.hidden = !p.hidden;
    if (!p.hidden && !all.length) S.safe(sb.from("courses").select("*").order("name")).then(function (r) { all = r.data || []; avail(); });
    else avail();
  });
  $("close-add").addEventListener("click", function () { $("add").hidden = true; });
  $("q").addEventListener("input", avail);
  document.addEventListener("bk:lang", function () { if (me) { paint(); avail(); } });

  S.guard().then(function (p) { if (!p) return; me = p; return reload().then(function () { BKI18n.apply(); }); });
})();
