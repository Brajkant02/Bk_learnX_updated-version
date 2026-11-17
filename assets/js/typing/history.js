// Student: daily typing graph (best test of each day) + recent tests.
(function () {
  var X = window.BKTyping, I = window.BKI18n, A = window.BKAuth;
  var $ = function (id) { return document.getElementById(id); };
  var t = function (k) { return I.t(k); };
  var daily = [], recent = [], metric = "wpm";
  var M = { wpm: ["h_m_wpm", "wpm"], acc: ["h_m_acc", "accuracy"], err: ["h_m_err", "mistakes"], tests: ["h_m_tests", "tests"] };

  function chart() {
    var key = M[metric][1], n = daily.length, W = 640, H = 240, pl = 42, pr = 12, pt = 14, pb = 34, pw = W - pl - pr, ph = H - pt - pb;
    var vals = daily.map(function (d) { return Number(d[key]); });
    var max = metric === "acc" ? 100 : Math.max(5, Math.ceil(Math.max.apply(null, vals) * 1.15));
    var y = function (v) { return pt + ph - (v / max) * ph; };
    var x = function (i) { return n === 1 ? pl + pw / 2 : pl + 28 + ((pw - 56) * i) / (n - 1); };
    var s = '<svg class="bk-chart" viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="' + X.esc(t(M[metric][0])) + '">';
    for (var g = 0; g <= 4; g++) { var gv = max * g / 4, gy = y(gv); s += '<line class="grid" x1="' + pl + '" x2="' + (W - pr) + '" y1="' + gy + '" y2="' + gy + '"/><text x="' + (pl - 6) + '" y="' + (gy + 4) + '" text-anchor="end">' + Math.round(gv) + "</text>"; }
    if (metric === "tests") {
      var bw = Math.min(40, (pw / n) * 0.6);
      daily.forEach(function (d, i) { s += '<rect class="bar" x="' + (x(i) - bw / 2) + '" y="' + y(vals[i]) + '" width="' + bw + '" height="' + (pt + ph - y(vals[i])) + '" rx="4"><title>' + X.dmyDay(d.day) + ": " + vals[i] + "</title></rect>"; });
    } else {
      s += '<polyline class="ln" points="' + vals.map(function (v, i) { return x(i) + "," + y(v); }).join(" ") + '"/>';
      daily.forEach(function (d, i) { s += '<circle class="dot" cx="' + x(i) + '" cy="' + y(vals[i]) + '" r="4"><title>' + X.dmyDay(d.day) + ": " + vals[i] + "</title></circle>"; });
    }
    var step = Math.max(1, Math.ceil(n / 6));
    daily.forEach(function (d, i) { if (i % step === 0 || i === n - 1) s += '<text x="' + x(i) + '" y="' + (H - 10) + '" text-anchor="middle">' + X.dmyDay(d.day) + "</text>"; });
    $("chart").innerHTML = s + "</svg>";
  }
  function tabs() {
    $("tabs").innerHTML = Object.keys(M).map(function (k) { return '<button type="button" class="bk-tab" data-m="' + k + '" aria-pressed="' + (k === metric) + '">' + t(M[k][0]) + "</button>"; }).join("");
  }
  function table() {
    var pad = function (n) { return (n < 10 ? "0" : "") + n; };
    $("rows").innerHTML = recent.map(function (r) {
      var d = new Date(r.created_at), e = X.exam(r.exam_type);
      return "<tr><td>" + X.dmy(r.created_at) + " " + pad(d.getHours()) + ":" + pad(d.getMinutes()) + "</td><td>" + X.esc(e ? e.name : (r.exam_type || "-")) + "</td><td>" + r.wpm + "</td><td>" + r.accuracy + "%</td><td>" + r.mistakes + "</td></tr>";
    }).join("");
  }
  function paint() {
    var has = recent.length > 0 || daily.length > 0;
    $("empty").hidden = has; $("data").hidden = !has;
    if (has) { tabs(); if (daily.length) chart(); table(); }
  }
  $("tabs").addEventListener("click", function (ev) { var b = ev.target.closest("[data-m]"); if (!b) return; metric = b.getAttribute("data-m"); tabs(); chart(); });
  document.addEventListener("bk:lang", paint);

  A.requireLogin().then(function (p) {
    if (!p) return;
    return Promise.all([
      window.sb.rpc("typing_daily", { p_days: 30 }),
      window.sb.from("typing_results").select("*").order("created_at", { ascending: false }).limit(20)
    ]).then(function (r) { daily = (r[0] && r[0].data) || []; recent = (r[1] && r[1].data) || []; paint(); });
  }).catch(function () { paint(); });
})();
