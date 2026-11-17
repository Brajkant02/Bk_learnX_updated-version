// Hindi / English for the interface. Notes content has its own Hindi/English pages.
// Mark text:  <span data-i18n="nav_home"></span>   placeholder: data-i18n-placeholder   aria-label: data-i18n-aria
// Pages add their own words:  BKI18n.add({ en:{key:"..."}, hi:{key:"..."} })
(function () {
  var K = "bk_lang";
  var D = {
    en: { tagline: "Computer & technology learning", nav_home: "Home", nav_programs: "Programs", nav_typing: "Typing",
      nav_login: "Log in", nav_dashboard: "Dashboard", nav_contact: "Contact", theme_to_dark: "Switch to dark mode",
      theme_to_light: "Switch to light mode", lang_switch: "Switch language", footer_privacy: "Privacy", footer_terms: "Terms",
      footer_note: "Notes, previous papers and typing practice.", install_app: "Install app", net_off: "You are offline. Pages you opened before still work.", net_on: "You are back online.", skip: "Skip to content", main_nav: "Main menu" },
    hi: { tagline: "कंप्यूटर और टेक्नोलॉजी की पढ़ाई", nav_home: "होम", nav_programs: "प्रोग्राम", nav_typing: "टाइपिंग",
      nav_login: "लॉग इन", nav_dashboard: "डैशबोर्ड", nav_contact: "संपर्क", theme_to_dark: "डार्क मोड चालू करें",
      theme_to_light: "लाइट मोड चालू करें", lang_switch: "भाषा बदलें", footer_privacy: "प्राइवेसी", footer_terms: "नियम",
      footer_note: "नोट्स, पिछले साल के पेपर और टाइपिंग अभ्यास।", install_app: "ऐप इंस्टॉल करें", net_off: "आप ऑफ़लाइन हैं। पहले खोले पेज चलेंगे।", net_on: "आप फिर से ऑनलाइन हैं।", skip: "सीधे सामग्री पर जाएँ", main_nav: "मुख्य मेन्यू" }
  };
  var saved = null; try { saved = localStorage.getItem(K); } catch (e) {}
  var lang = saved || ((navigator.language || "").toLowerCase().indexOf("hi") === 0 ? "hi" : "en");
  var I = {
    get lang() { return lang; },
    t: function (k) { return (D[lang] && D[lang][k]) || D.en[k] || k; },
    add: function (d) { for (var l in d) D[l] = Object.assign(D[l] || {}, d[l]); },
    apply: function (root) {
      root = root || document;
      document.documentElement.lang = lang;
      root.querySelectorAll("[data-i18n]").forEach(function (e) { e.textContent = I.t(e.getAttribute("data-i18n")); });
      root.querySelectorAll("[data-i18n-placeholder]").forEach(function (e) { e.placeholder = I.t(e.getAttribute("data-i18n-placeholder")); });
      root.querySelectorAll("[data-i18n-aria]").forEach(function (e) { e.setAttribute("aria-label", I.t(e.getAttribute("data-i18n-aria"))); });
    },
    set: function (l) { lang = l; try { localStorage.setItem(K, l); } catch (e) {} I.apply(); document.dispatchEvent(new Event("bk:lang")); },
    toggle: function () { I.set(lang === "hi" ? "en" : "hi"); }
  };
  window.BKI18n = I;
  document.documentElement.lang = lang;
})();
