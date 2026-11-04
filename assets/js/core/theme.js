// Load in <head> (no defer) so there is no flash of the wrong theme.
(function () {
  var K = "bk_theme", root = document.documentElement, saved = null;
  try { saved = localStorage.getItem(K); } catch (e) {}
  var t = saved || (window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  function apply(v) {
    root.setAttribute("data-theme", v);
    var m = document.querySelector('meta[name="theme-color"]');
    if (m) m.setAttribute("content", v === "dark" ? "#0b1411" : "#f2f5ee");
  }
  apply(t);
  window.BKTheme = {
    get: function () { return root.getAttribute("data-theme"); },
    set: function (v) { apply(v); try { localStorage.setItem(K, v); } catch (e) {} document.dispatchEvent(new Event("bk:theme")); },
    toggle: function () { this.set(this.get() === "dark" ? "light" : "dark"); }
  };
})();
