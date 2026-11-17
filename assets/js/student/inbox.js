(function () {
  var S = window.BKStudent, $ = S.$, t = S.t, esc = S.esc, sb = window.sb, rows = [], me = null, open = {};
  function paint() {
    $("list").innerHTML = rows.length ? rows.map(function (m) {
      return '<div class="bk-msg' + (m.is_read ? "" : " unread") + '"><button type="button" class="bk-msg-h" data-id="' + m.id + '" aria-expanded="' + !!open[m.id] + '">' +
        (m.is_read ? "" : '<span class="bk-dot" aria-hidden="true"></span>') + '<b style="flex:1">' + esc(m.subject || "-") + (m.is_read ? "" : ' <span class="bk-badge">' + t("i_new") + "</span>") + '</b><small class="bk-muted">' + S.dmy(m.created_at) + "</small></button>" +
        (open[m.id] ? '<div class="bk-msg-b">' + esc(m.body) + "</div>" : "") + "</div>"; }).join("")
      : '<div class="bk-empty">' + t("i_empty") + "</div>";
  }
  $("list").addEventListener("click", function (e) {
    var b = e.target.closest("[data-id]"); if (!b) return; var id = b.getAttribute("data-id");
    open[id] = !open[id];
    var m = rows.filter(function (x) { return x.id === id; })[0];
    if (m && !m.is_read) { m.is_read = true; S.safe(sb.from("messages").update({ is_read: true }).eq("id", id)); }
    paint();
  });
  document.addEventListener("bk:lang", function () { if (me) paint(); });
  S.guard().then(function (p) { if (!p) return; me = p; return S.safe(sb.from("messages").select("*").order("created_at", { ascending: false })).then(function (r) { rows = r.data || []; paint(); BKI18n.apply(); }); });
})();
