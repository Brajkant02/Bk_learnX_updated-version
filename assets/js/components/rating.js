// "Was this helpful?" stars for unit pages.  <div id="bk-rating"></div>  (it mounts itself)  or  BKRating.mount(element)
// Guests and logged-in students can both rate. One rating per page per browser session.
(function () {
  var I = window.BKI18n, A = window.BKAuth;
  I.add({
    en: { rt_q: "Was this unit helpful?", rt_c: "Tell us more (optional)", rt_send: "Send rating", rt_thanks: "Thank you for your feedback!", rt_done: "You have already rated this page.", rt_err: "Could not send. Try again.", rt_star: "stars" },
    hi: { rt_q: "क्या यह यूनिट काम की थी?", rt_c: "और बताएँ (ज़रूरी नहीं)", rt_send: "रेटिंग भेजें", rt_thanks: "आपकी राय के लिए धन्यवाद!", rt_done: "आप इस पेज को पहले ही रेट कर चुके हैं।", rt_err: "भेज नहीं पाए। फिर कोशिश करें।", rt_star: "स्टार" }
  });
  var t = function (k) { return I.t(k); };
  function key() { return "bk_rated:" + location.pathname; }
  function done() { try { return !!sessionStorage.getItem(key()); } catch (e) { return false; } }
  function mount(el) {
    if (typeof el === "string") el = document.querySelector(el);
    if (!el) return;
    var stars = 0;
    function paint() {
      if (done()) { el.innerHTML = '<p class="bk-muted">' + t("rt_done") + "</p>"; return; }
      el.innerHTML = '<div class="bk-card bk-stack"><b>' + t("rt_q") + '</b><div class="bk-rstars" role="group">' +
        [1, 2, 3, 4, 5].map(function (n) { return '<button type="button" class="bk-rstar" data-n="' + n + '" aria-pressed="' + (n <= stars) + '" aria-label="' + n + " " + t("rt_star") + '">★</button>'; }).join("") + "</div>" +
        (stars ? '<textarea class="bk-input" id="bk-rt-c" maxlength="1000" rows="3" placeholder="' + t("rt_c") + '"></textarea><p><button type="button" class="bk-btn bk-btn--sm" id="bk-rt-s">' + t("rt_send") + '</button></p>' : "") +
        '<p id="bk-rt-m" class="bk-error" role="alert" hidden></p></div>';
    }
    el.addEventListener("click", function (e) {
      var b = e.target.closest(".bk-rstar");
      if (b) { var c = el.querySelector("#bk-rt-c"), keep = c ? c.value : ""; stars = Number(b.getAttribute("data-n")); paint(); var c2 = el.querySelector("#bk-rt-c"); if (c2) c2.value = keep; return; }
      if (e.target.id !== "bk-rt-s") return;
      var btn = e.target; btn.disabled = true;
      A.getSession().then(function (s) {
        return window.sb.from("ratings").insert({ unit_path: location.pathname, user_id: s ? s.user.id : null, stars: stars, comment: (el.querySelector("#bk-rt-c").value || "").trim().slice(0, 1000) || null });
      }).then(function (r) {
        if (r && r.error) throw r.error;
        try { sessionStorage.setItem(key(), "1"); } catch (e) {}
        el.innerHTML = '<p class="bk-ok">' + t("rt_thanks") + "</p>";
      }).catch(function (err) {
        if (err && (err.code === "23505" || /duplicate|unique/i.test(err.message || ""))) { try { sessionStorage.setItem(key(), "1"); } catch (e) {} paint(); return; }   /* this student already rated this page */
        btn.disabled = false; var m = el.querySelector("#bk-rt-m"); m.textContent = t("rt_err"); m.hidden = false; });
    });
    document.addEventListener("bk:lang", paint);
    paint();
  }
  window.BKRating = { mount: mount };
  function auto() { var el = document.getElementById("bk-rating"); if (el) mount(el); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", auto); else auto();
})();
