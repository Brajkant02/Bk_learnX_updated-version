// Privacy / Terms: shows the English or the Hindi text, following the language button.
(function () {
  function show() { var l = window.BKI18n.lang === "hi" ? "hi" : "en"; document.querySelectorAll("[data-lang]").forEach(function (e) { e.hidden = e.getAttribute("data-lang") !== l; }); }
  show(); document.addEventListener("bk:lang", show);
})();
