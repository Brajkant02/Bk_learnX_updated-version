// Student dashboard: continue, courses + progress, typing snapshot, inbox, bookmarks.
(function () {
  var S = window.BKStudent, $ = S.$, t = S.t, esc = S.esc, sb = window.sb;
  var D = { p: null, courses: [], last: null, msgs: [], bms: [], daily: [] };

  function spark(rows) {
    if (rows.length < 2) return "";
    var v = rows.map(function (r) { return Number(r.wpm); }), max = Math.max.apply(null, v) || 1, W = 200, H = 60;
    var pts = v.map(function (x, i) { return (i * W / (v.length - 1)).toFixed(1) + "," + (H - 6 - (x / max) * (H - 12)).toFixed(1); }).join(" ");
    return '<svg class="bk-spark" viewBox="0 0 ' + W + " " + H + '" preserveAspectRatio="none" aria-hidden="true"><polyline class="ln" points="' + pts + '"/></svg>';
  }
  function paint() {
    var p = D.p, first = (p.name || "").split(" ")[0];
    $("head").innerHTML = S.avatar(p) + '<div><h1 style="font-size:1.5rem">' + t("sd_hello") + ", " + esc(first) + '</h1><p class="bk-muted">' + t("sd_sub") + "</p></div>";
    $("complete").hidden = !!(p.program);
    // continue
    var c = D.last, cc = c && D.courses.filter(function (x) { return x.id === c.course_id; })[0];
    $("continue").innerHTML = c
      ? '<h2 style="font-size:1.1rem">' + t("sd_continue") + '</h2><p style="font-size:1.15rem;font-weight:600">' + esc(c.unit_title || S.unitLabel(c.unit_path)) + "</p>" +
        (cc ? '<p class="bk-muted">' + esc(cc.name) + "</p>" : "") + '<p><a class="bk-btn bk-btn--light" href="' + esc(c.unit_path) + '">' + t("sd_resume") + "</a></p>"
      : '<h2 style="font-size:1.1rem">' + t("sd_continue") + '</h2><p class="bk-muted">' + t("sd_continue_none") + '</p><p><a class="bk-btn bk-btn--light" href="/#programs">' + t("sd_start") + "</a></p>";
    // courses
    $("courses").innerHTML = D.courses.length ? D.courses.slice(0, 5).map(function (x) {
      return '<a class="bk-row-card" href="' + esc(x.path) + '"><div class="grow"><h3>' + esc(x.name) + '</h3><div class="bk-progress" role="progressbar" aria-valuenow="' + x.percent + '" aria-valuemin="0" aria-valuemax="100" style="--v:' + x.percent + '%"><i></i></div></div><b>' + x.percent + "%</b></a>"; }).join("")
      : '<p class="bk-muted">' + t("sd_no_courses") + "</p>";
    // typing
    var best = D.daily.reduce(function (m, r) { return Math.max(m, Number(r.wpm)); }, 0), tests = D.daily.reduce(function (m, r) { return m + Number(r.tests); }, 0);
    $("typing").innerHTML = D.daily.length ? '<div class="bk-stats" style="grid-template-columns:repeat(2,1fr)"><div class="bk-stat"><b>' + best + "</b><span>" + t("sd_best") + '</span></div><div class="bk-stat"><b>' + tests + "</b><span>" + t("sd_tests") + "</span></div></div>" + spark(D.daily) + '<p><a class="bk-link" href="/pages/student/typing-history/">' + t("sd_history") + "</a></p>"
      : '<p class="bk-muted">' + t("sd_no_typing") + '</p><p><a class="bk-btn bk-btn--sm" href="/typing/1-exam-selection.html">' + t("sd_take") + "</a></p>";
    // inbox
    var un = D.msgs.filter(function (m) { return !m.is_read; }).length;
    $("unread").textContent = un ? un + " " + t("sd_unread") : "";
    $("inbox").innerHTML = D.msgs.length ? D.msgs.slice(0, 3).map(function (m) {
      return '<a class="bk-row-card" href="/pages/student/inbox/">' + (m.is_read ? "" : '<span class="bk-dot" aria-hidden="true"></span>') + '<div class="grow"><b>' + esc(m.subject || "-") + '</b></div><small class="bk-muted">' + S.dmy(m.created_at) + "</small></a>"; }).join("")
      : '<p class="bk-muted">' + t("sd_no_msg") + "</p>";
    // bookmarks
    $("bms").innerHTML = D.bms.length ? D.bms.slice(0, 5).map(function (b) {
      return '<a class="bk-row-card" href="' + esc(b.unit_path) + '"><div class="grow">' + esc(b.title || S.unitLabel(b.unit_path)) + "</div></a>"; }).join("")
      : '<p class="bk-muted">' + t("sd_no_bm") + "</p>";
  }
  document.addEventListener("bk:lang", function () { if (D.p) paint(); });

  S.guard().then(function (p) {
    if (!p) return; D.p = p;
    return Promise.all([
      S.safe(sb.rpc("my_courses")), S.safe(sb.from("progress").select("*").order("last_visited_at", { ascending: false }).limit(1)),
      S.safe(sb.from("messages").select("*").order("created_at", { ascending: false }).limit(50)),
      S.safe(sb.from("bookmarks").select("*").order("created_at", { ascending: false }).limit(5)), S.safe(sb.rpc("typing_daily", { p_days: 30 }))
    ]).then(function (r) {
      D.courses = r[0].data || []; D.last = (r[1].data || [])[0] || null; D.msgs = r[2].data || []; D.bms = r[3].data || []; D.daily = r[4].data || [];
      paint(); BKI18n.apply();
    });
  });
})();
