// Contact page: form -> contact_messages (admin reads it), plus links from BK_CONFIG.CONTACT.
(function () {
  var I = window.BKI18n, C = window.BK_CONFIG, sb = window.sb;
  var $ = function (id) { return document.getElementById(id); };
  var t = function (k) { return I.t(k); };
  I.add({
    en: { ct_title: "Contact us", ct_sub: "Questions, feedback or a problem with notes? Write to us.", ct_name: "Your name", ct_email: "Email", ct_msg: "Message", ct_send: "Send message",
      ct_ok: "Thank you! We have received your message.", ct_err: "Could not send. Please try again.", ct_v_name: "Enter your name.", ct_v_email: "Enter a valid email address.", ct_v_msg: "Write your message (up to 2000 characters).",
      ct_reach: "Other ways to reach us", ct_privacy: "We use your details only to reply to you. See our", ct_pp: "Privacy Policy" },
    hi: { ct_title: "संपर्क करें", ct_sub: "सवाल, सुझाव या नोट्स में कोई समस्या? हमें लिखें।", ct_name: "आपका नाम", ct_email: "Email", ct_msg: "संदेश", ct_send: "संदेश भेजें",
      ct_ok: "धन्यवाद! हमें आपका संदेश मिल गया।", ct_err: "भेज नहीं पाए। कृपया फिर कोशिश करें।", ct_v_name: "अपना नाम डालें।", ct_v_email: "सही email पता डालें।", ct_v_msg: "अपना संदेश लिखें (2000 अक्षर तक)।",
      ct_reach: "संपर्क के और तरीके", ct_privacy: "आपकी जानकारी सिर्फ़ जवाब देने के लिए इस्तेमाल होगी। देखें:", ct_pp: "प्राइवेसी पॉलिसी" }
  });
  var X = (C && C.CONTACT) || {}, links = [];
  if (X.email) links.push(["Email", "mailto:" + X.email, X.email]);
  if (X.whatsapp) links.push(["WhatsApp", "https://wa.me/" + String(X.whatsapp).replace(/\D/g, ""), "+" + String(X.whatsapp).replace(/\D/g, "")]);
  if (X.telegram) links.push(["Telegram", X.telegram, "Telegram"]);
  if (X.instagram) links.push(["Instagram", X.instagram, "Instagram"]);
  if (X.youtube) links.push(["YouTube", X.youtube, "YouTube"]);
  if (X.linkedin) links.push(["LinkedIn", X.linkedin, "LinkedIn"]);
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
  if (links.length) $("links").innerHTML = '<h2 style="font-size:1.1rem" data-i18n="ct_reach"></h2><div class="bk-list">' + links.map(function (l) {
    return '<a class="bk-row-card" rel="noopener" target="_blank" href="' + esc(l[1]) + '"><b>' + l[0] + '</b><span class="bk-muted">' + esc(l[2]) + "</span></a>"; }).join("") + "</div>";
  function say(m, ok) { var p = $("msg"); p.textContent = m || ""; p.className = ok ? "bk-ok" : "bk-error"; p.hidden = !m; }
  $("form").addEventListener("submit", function (ev) {
    ev.preventDefault(); say("");
    var f = { name: $("name").value.trim(), email: $("email").value.trim(), message: $("message").value.trim() };
    if (!f.name) return say(t("ct_v_name"));
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.email)) return say(t("ct_v_email"));
    if (!f.message || f.message.length > 2000) return say(t("ct_v_msg"));
    if ($("website").value) { $("form").hidden = true; return say(t("ct_ok"), true); }     // hidden field filled = a bot: pretend it worked
    var b = $("form").querySelector("[type=submit]"); b.disabled = true;
    Promise.resolve(sb.from("contact_messages").insert({ name: f.name.slice(0, 100), email: f.email.slice(0, 254), message: f.message }))
      .then(function (r) { if (r && r.error) throw r.error; $("form").hidden = true; say(t("ct_ok"), true); })
      .catch(function () { b.disabled = false; say(t("ct_err")); });
  });
})();
