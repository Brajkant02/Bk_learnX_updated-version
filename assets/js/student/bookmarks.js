(function () {
  var S = window.BKStudent, $ = S.$, t = S.t, esc = S.esc, sb = window.sb, me = null, rows = [];
  function paint() {
    $("list").innerHTML = rows.length ? rows.map(function (b) {
      return '<div class="bk-row-card"><a class="grow" href="' + esc(b.unit_path) + '"><h3>' + esc(b.title || S.unitLabel(b.unit_path)) + '</h3><small class="bk-muted">' + S.dmy(b.created_at) + '</small></a><button type="button" class="bk-btn bk-btn--sm bk-btn--ghost" data-rm="' + esc(b.unit_path) + '">' + t("b_remove") + "</button></div>"; }).join("")
      : '<div class="bk-empty">' + t("b_empty") + "</div>";
  }
  $("list").addEventListener("click", function (e) {
    var b = e.target.closest("[data-rm]"); if (!b) return; var p = b.getAttribute("data-rm");
    S.safe(sb.from("bookmarks").delete().eq("user_id", me.id).eq("unit_path", p)).then(function () { rows = rows.filter(function (x) { return x.unit_path !== p; }); paint(); });
  });
  document.addEventListener("bk:lang", function () { if (me) paint(); });
  S.guard().then(function (p) { if (!p) return; me = p; return S.safe(sb.from("bookmarks").select("*").order("created_at", { ascending: false })).then(function (r) { rows = r.data || []; paint(); BKI18n.apply(); }); });
})();
