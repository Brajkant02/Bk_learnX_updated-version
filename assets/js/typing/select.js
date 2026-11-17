// Page 1: choose exam, language, passages, time. Guests give name + email first.
(function () {
  var T = window.BK_TYPING, X = window.BKTyping, I = window.BKI18n, A = window.BKAuth;
  var $ = function (id) { return document.getElementById(id); };
  var t = function (k) { return I.t(k); };
  var sel = "general", loggedIn = false;

  function renderExams() {
    $("exams").innerHTML = T.exams.map(function (e) {
      var tgt = e.dest ? "2,000 " + t("t_kdp") : e.en + " / " + e.hi + " " + t("t_wpm");
      return '<button type="button" class="bk-exam" data-id="' + e.id + '" aria-pressed="' + (e.id === sel) + '"><b>' + X.esc(e.name) +
        "</b><small>" + X.esc(e.sub) + '</small><span class="bk-badge">' + tgt + " · " + e.min + " " + t("t_min") + "</span></button>";
    }).join("");
  }
  function say(m) { var p = $("msg"); p.textContent = m || ""; p.hidden = !m; }

  $("exams").addEventListener("click", function (ev) {
    var b = ev.target.closest(".bk-exam"); if (!b) return;
    sel = b.getAttribute("data-id"); $("duration").value = String(X.exam(sel).min); renderExams();
  });
  renderExams(); $("duration").value = String(X.exam(sel).min);
  document.addEventListener("bk:lang", renderExams);

  A.getSession().then(function (s) {
    loggedIn = !!s; $("user").hidden = !loggedIn; $("guest").hidden = loggedIn;
  }).catch(function () { $("guest").hidden = false; });

  $("start").addEventListener("click", function () {
    say("");
    if (!sel) return say(t("t_v_exam"));
    if (!loggedIn) {
      var n = $("name").value.trim(), e = $("email").value.trim().toLowerCase();
      if (n.length < 1) return say(t("t_v_name"));
      if (!X.isEmail(e)) return say(t("t_v_email"));
      X.set("bk_guest", { name: n.slice(0, 100), email: e });
    }
    X.set("bk_typing_cfg", { exam: sel, lang: $("lang").value, source: $("source").value, minutes: Number($("duration").value) });
    location.href = "2-typing-test.html";
  });
})();
