// Page 2: the typing test. Words are compared word by word (like exam software).
// Gross WPM = (characters / 5) per minute.  Net WPM = gross minus wrong words per minute.
(function () {
  var T = window.BK_TYPING, X = window.BKTyping, I = window.BKI18n, A = window.BKAuth;
  var cfg = X.get("bk_typing_cfg");
  if (!cfg || !X.exam(cfg.exam)) { location.replace("1-exam-selection.html"); return; }
  var guest = X.get("bk_guest"), user = null;
  var $ = function (id) { return document.getElementById(id); };
  var t = function (k) { return I.t(k); };
  var exam = X.exam(cfg.exam), dur = cfg.minutes * 60;

  function pool() { var P = T.passages[cfg.lang]; return cfg.source === "current" ? P.current : cfg.source === "mixed" ? P.practice.concat(P.current) : P.practice; }
  function stream() {
    var p = pool(), out = [], len = 0, last = -1;
    while (len < 4500) { var i = Math.floor(Math.random() * p.length); if (p.length > 1 && i === last) continue; last = i; out.push(p[i]); len += p[i].length + 1; }
    return out.join(" ");
  }
  var text = stream(), W = text.split(" ");
  var value = "", mode = "over", startMs = null, finished = false, timer = null;

  function parts() { return value.split(/ +/); }
  function render() {
    var p = parts(), cur = p.length - 1, h = "";
    for (var i = 0; i < W.length; i++) {
      var c = "";
      if (i < cur) c = p[i] === W[i] ? "ok" : "bad";
      else if (i === cur) c = "cur" + (W[i].indexOf(p[i]) === 0 ? "" : " bad");
      h += '<span class="w ' + c + '">' + X.esc(W[i]) + "</span> ";
    }
    var box = $("passage"); box.innerHTML = h;
    var el = box.querySelector(".cur"); if (el) box.scrollTop = Math.max(0, el.offsetTop - box.clientHeight / 2);
  }
  function stats(final) {
    var p = parts(), cur = p.length - 1, done = final ? p.length : cur, ok = 0, bad = 0;
    for (var i = 0; i < done && i < W.length; i++) { if (p[i] === "") continue; if (p[i] === W[i]) ok++; else bad++; }
    var sec = 0;
    if (startMs) sec = final ? Math.min(dur, Math.max(1, (Date.now() - startMs) / 1000)) : Math.max(3, (Date.now() - startMs) / 1000);
    var min = sec / 60, gross = min ? value.length / 5 / min : 0, net = min ? Math.max(0, gross - bad / min) : 0;
    var acc = ok + bad ? Math.round(ok / (ok + bad) * 100) : (final ? 0 : 100);
    return { gross: Math.round(gross), net: Math.round(net), acc: acc, errors: bad, chars: value.length, words: ok + bad, secs: Math.round(sec) };
  }
  function paint() {
    var s = stats(false);
    $("s-net").textContent = s.net; $("s-acc").textContent = s.acc + "%"; $("s-err").textContent = s.errors;
    $("s-chars").textContent = s.chars; $("s-words").textContent = s.words;
  }
  function clock() {
    var left = Math.max(0, dur - (startMs ? (Date.now() - startMs) / 1000 : 0)), m = Math.floor(left / 60), s = Math.floor(left % 60);
    $("timer").textContent = (m < 10 ? "0" : "") + m + ":" + (s < 10 ? "0" : "") + s;
    $("bar").style.setProperty("--v", (100 - left / dur * 100) + "%");
    if (startMs && left <= 0) finish();
  }
  function begin() {
    if (startMs) return;
    startMs = Date.now(); $("m-over").disabled = true; $("m-box").disabled = true; $("lock").hidden = false;
    timer = setInterval(clock, 250);
  }
  function onInput(el) { if (finished) return; begin(); value = el.value.replace(/\s*\n\s*/g, " "); render(); paint(); if (parts().length > W.length) finish(); }

  function setMode(m) {
    if (startMs) return; mode = m;
    $("capture").hidden = m !== "over"; $("typebox").hidden = m === "over";
    $("m-over").setAttribute("aria-pressed", m === "over"); $("m-box").setAttribute("aria-pressed", m !== "over");
    (m === "over" ? $("capture") : $("typebox")).focus();
  }
  ["capture", "typebox"].forEach(function (id) {
    var el = $(id);
    el.addEventListener("input", function () { onInput(el); });
    el.addEventListener("keydown", function (e) { if (e.key === "Enter") e.preventDefault(); });
    el.addEventListener("paste", function (e) { e.preventDefault(); });
    el.addEventListener("drop", function (e) { e.preventDefault(); });
  });
  $("m-over").addEventListener("click", function () { setMode("over"); });
  $("m-box").addEventListener("click", function () { setMode("box"); });
  $("passage").addEventListener("click", function () { if (mode === "over") $("capture").focus(); });
  $("finish").addEventListener("click", finish);

  function finish() {
    if (finished) return; finished = true; clearInterval(timer);
    var s = stats(true), target = exam.dest ? 2000 : (cfg.lang === "en" ? exam.en : exam.hi);
    var res = { exam: exam.id, examName: exam.name, lang: cfg.lang, net: s.net, gross: s.gross, acc: s.acc, errors: s.errors, chars: s.chars,
      words: s.words, secs: s.secs, target: target, dest: !!exam.dest, pass: exam.dest ? s.chars >= 2000 : s.net >= target,
      kind: user ? "user" : "guest", who: user ? null : guest.name, saved: null };
    function go() { X.set("bk_typing_result", res); location.href = "3-result.html"; }
    if (!s.chars) { res.saved = null; return go(); }
    var q;
    try {
      q = user ? window.sb.from("typing_results").insert({ user_id: user.id, wpm: s.net, accuracy: s.acc, mistakes: s.errors, exam_type: exam.id })
               : window.sb.from("typing_leads").insert({ name: guest.name, email: guest.email, wpm: s.net, accuracy: s.acc, mistakes: s.errors, exam_type: exam.id });
    } catch (e) { q = Promise.resolve({ error: e }); }
    Promise.race([Promise.resolve(q), new Promise(function (r) { setTimeout(function () { r({ error: "timeout" }); }, 4000); })])
      .then(function (r) { res.saved = !(r && r.error); }).catch(function () { res.saved = false; }).then(go);
  }

  A.getSession().then(function (s) {
    user = s && s.user;
    if (!user && !(guest && guest.name && guest.email)) { location.replace("1-exam-selection.html"); return; }
    $("ename").textContent = exam.name + " · " + (cfg.lang === "en" ? "English" : "हिंदी") + " · " + cfg.minutes + " min";
    $("passage").setAttribute("lang", cfg.lang); $("typebox").setAttribute("lang", cfg.lang);
    render(); paint(); clock(); $("capture").focus();
  });
  window.addEventListener("beforeunload", function (e) { if (startMs && !finished) { e.preventDefault(); e.returnValue = ""; } });
})();
