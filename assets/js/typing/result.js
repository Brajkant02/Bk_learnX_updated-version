// Page 3: the result. It is read ONCE. Leaving or refreshing the page clears it.
(function () {
  var X = window.BKTyping, I = window.BKI18n;
  var $ = function (id) { return document.getElementById(id); };
  var t = function (k) { return I.t(k); };
  var r = X.take("bk_typing_result");
  function show() {
    var o = $("out");
    if (!r) {
      o.className = "bk-card bk-result";
      o.innerHTML = "<p>" + t("r_none") + '</p><p><a class="bk-btn bk-btn--accent" href="1-exam-selection.html">' + t("r_other") + "</a></p>";
      return;
    }
    var unit = r.dest ? "2,000 " + t("t_kdp") : r.target + " " + t("t_wpm");
    var notice = r.kind === "guest" ? t("r_lead") : (r.saved === false ? t("r_nosave") : (r.saved ? t("r_saved") : ""));
    o.className = "bk-card bk-result " + (r.pass ? "pass" : "fail");
    o.innerHTML = '<div class="mark" aria-hidden="true">' + (r.pass ? "✓" : "×") + "</div>" +
      "<h1>" + (r.pass ? t("r_pass") : t("r_fail")) + "</h1>" +
      '<p class="bk-muted">' + (r.pass ? t("r_pass_n") : t("r_fail_n")) + " " + t("r_target") + ": " + unit + "</p>" +
      (r.who ? '<p class="bk-muted">' + t("r_for") + " <b>" + X.esc(r.who) + "</b> · " + X.esc(r.examName) + "</p>" : '<p class="bk-muted">' + X.esc(r.examName) + "</p>") +
      '<div class="big">' + r.net + '</div><div class="bk-muted">' + t("x_net") + "</div>" +
      '<div class="bk-stats" style="width:100%">' +
      '<div class="bk-stat"><b>' + r.acc + '%</b><span>' + t("x_acc") + "</span></div>" +
      '<div class="bk-stat"><b>' + r.errors + "</b><span>" + t("x_err") + "</span></div>" +
      '<div class="bk-stat"><b>' + r.gross + "</b><span>" + t("r_gross") + "</span></div>" +
      '<div class="bk-stat"><b>' + r.chars + "</b><span>" + t("x_chars") + "</span></div>" +
      '<div class="bk-stat"><b>' + r.words + "</b><span>" + t("x_words") + "</span></div></div>" +
      (notice ? '<p class="bk-hint">' + notice + "</p>" : "") +
      '<div class="row"><a class="bk-btn bk-btn--accent" href="2-typing-test.html">' + t("r_again") + '</a><a class="bk-btn bk-btn--ghost" href="1-exam-selection.html">' + t("r_other") + "</a>" +
      (r.kind === "user" ? '<a class="bk-btn bk-btn--ghost" href="/pages/student/typing-history/">' + t("r_hist") + "</a>" : "") + "</div>" +
      '<p class="bk-hint">' + t("r_tip") + "</p>";
  }
  show(); document.addEventListener("bk:lang", show);
})();
