// Handles Login, Registration and Forgot-password pages (form[data-form] = login | register | forgot).
(function () {
  var A = window.BKAuth, I = window.BKI18n, C = window.BK_CONFIG, P = window.BK_PROGRAMS || [];
  var form = document.querySelector("form[data-form]");
  if (!form) return;
  var kind = form.getAttribute("data-form");
  var $ = function (id) { return document.getElementById(id); };
  var T = function (k) { return I.t(k); };

  I.add({
    en: { login_title: "Log in", google: "Continue with Google", or: "or use email", email: "Email", password: "Password",
      login_btn: "Log in", forgot_link: "Forgot password?", no_account: "New here?", register_link: "Create an account",
      reg_title: "Create your account", name: "Full name", mobile: "Mobile number", program: "Program", semester: "Semester",
      choose: "Choose a program", sem: "Semester", medium: "Medium of study", m_en: "English", m_hi: "Hindi", password2: "Confirm password", agree_pre: "I agree to the", privacy: "Privacy Policy",
      and: "and", terms: "Terms", reg_btn: "Create account", have_account: "Already registered?",
      verify_sent: "Check your inbox. We sent a link to confirm your email. After confirming, log in.",
      forgot_title: "Reset your password", forgot_sub: "Enter your email. We will send a one-time code (OTP).", send_otp: "Send OTP",
      otp_sent: "If this email is registered, an OTP has been sent. It is valid for 10 minutes.", otp: "OTP",
      new_pass: "New password", save_pass: "Set new password", resend: "Resend OTP", resend_in: "Resend in", back_login: "Back to log in",
      pw_changed: "Password changed. Taking you to log in…",
      v_name: "Enter your full name.", v_email: "Enter a valid email address.", v_mobile: "Enter a 10-digit mobile number.",
      v_program: "Choose your program.", v_sem: "Choose your semester.", v_pass: "Password must be at least 8 characters.",
      v_match: "The two passwords do not match.", v_agree: "Please accept the Privacy Policy and Terms.", v_otp: "Enter the OTP from your email.",
      e_generic: "Something went wrong. Try again." },
    hi: { login_title: "लॉग इन", google: "Google से जारी रखें", or: "या email से", email: "Email", password: "Password",
      login_btn: "लॉग इन", forgot_link: "Password भूल गए?", no_account: "नए हैं?", register_link: "खाता बनाएँ",
      reg_title: "अपना खाता बनाएँ", name: "पूरा नाम", mobile: "मोबाइल नंबर", program: "प्रोग्राम", semester: "सेमेस्टर",
      choose: "प्रोग्राम चुनें", sem: "सेमेस्टर", medium: "पढ़ाई का माध्यम", m_en: "English", m_hi: "हिंदी", password2: "Password दोबारा डालें", agree_pre: "मैं सहमत हूँ:", privacy: "प्राइवेसी पॉलिसी",
      and: "और", terms: "नियम", reg_btn: "खाता बनाएँ", have_account: "पहले से खाता है?",
      verify_sent: "अपना inbox देखें। Email confirm करने का link भेजा गया है। Confirm करने के बाद लॉग इन करें।",
      forgot_title: "Password रीसेट करें", forgot_sub: "अपना email डालें। हम एक बार वाला कोड (OTP) भेजेंगे।", send_otp: "OTP भेजें",
      otp_sent: "अगर यह email registered है तो OTP भेज दिया गया है। यह 10 मिनट तक चलेगा।", otp: "OTP",
      new_pass: "नया password", save_pass: "नया password सेट करें", resend: "OTP दोबारा भेजें", resend_in: "दोबारा भेजें:", back_login: "लॉग इन पर वापस जाएँ",
      pw_changed: "Password बदल गया। लॉग इन पेज पर ले जा रहे हैं…",
      v_name: "अपना पूरा नाम डालें।", v_email: "सही email पता डालें।", v_mobile: "10 अंकों का मोबाइल नंबर डालें।",
      v_program: "अपना प्रोग्राम चुनें।", v_sem: "अपना सेमेस्टर चुनें।", v_pass: "Password कम से कम 8 अक्षर का हो।",
      v_match: "दोनों password एक जैसे नहीं हैं।", v_agree: "कृपया प्राइवेसी पॉलिसी और नियम स्वीकार करें।", v_otp: "Email में आया OTP डालें।",
      e_generic: "कुछ गड़बड़ हुई, फिर कोशिश करें।" }
  });

  function say(text, ok) { var m = $("msg"); if (!m) return; m.textContent = text || ""; m.className = ok ? "bk-ok" : "bk-error"; m.hidden = !text; }
  function busy(f, b) { var s = f.querySelector("[type=submit]"); if (s) s.disabled = b; }
  function err(e) { return (e && e.friendly) || T("e_generic"); }
  function next() { var n = new URLSearchParams(location.search).get("next"); return n && n.charAt(0) === "/" && n.charAt(1) !== "/" ? n : C.DASHBOARD_URL; }
  var isEmail = function (v) { return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v); };

  if (kind !== "forgot") A.getSession().then(function (s) { if (s) location.replace(next()); });
  if (A.native && $("alt")) $("alt").hidden = true;           // Google login is for the website only (for now)
  var g = $("google");
  if (g) g.addEventListener("click", function () { A.signInGoogle().catch(function (e) { say(err(e)); }); });

  if (kind === "login") {
    form.addEventListener("submit", function (ev) {
      ev.preventDefault(); say("");
      var em = $("email").value.trim(), pw = $("password").value;
      if (!isEmail(em)) return say(T("v_email"));
      if (!pw) return say(T("v_pass"));
      busy(form, true);
      A.signIn(em, pw).then(function () { location.href = next(); })
        .catch(function (e) { say(err(e)); }).then(function () { busy(form, false); });
    });
  }

  if (kind === "register") {
    var prog = $("program"), sem = $("semester"), semField = $("sem-field");
    function renderPrograms() {
      var v = prog.value;
      prog.innerHTML = '<option value="" disabled selected>' + T("choose") + "</option>" +
        P.map(function (p) { return '<option value="' + p.slug + '">' + p.name + "</option>"; }).join("");
      prog.value = v;
    }
    function renderSem() {
      var p = P.filter(function (x) { return x.slug === prog.value; })[0], list = p ? p.semesters : [], keep = sem.value;
      semField.hidden = !list.length;
      sem.innerHTML = list.map(function (n) { return '<option value="' + n + '">' + T("sem") + " " + n + "</option>"; }).join("");
      if (keep) sem.value = keep;
    }
    renderPrograms(); renderSem();
    prog.addEventListener("change", function () { sem.value = ""; renderSem(); });
    document.addEventListener("bk:lang", function () { renderPrograms(); renderSem(); });

    form.addEventListener("submit", function (ev) {
      ev.preventDefault(); say("");
      var f = { name: $("name").value.trim(), email: $("email").value.trim(),
        mobile: $("mobile").value.replace(/[\s-]/g, "").replace(/^(\+91|91|0)(?=\d{10}$)/, ""),
        program: prog.value, semester: semField.hidden ? "" : sem.value, medium: $("medium").value, password: $("password").value };
      if (f.name.length < 2) return say(T("v_name"));
      if (!isEmail(f.email)) return say(T("v_email"));
      if (!/^[6-9]\d{9}$/.test(f.mobile)) return say(T("v_mobile"));
      if (!f.program) return say(T("v_program"));
      if (!semField.hidden && !f.semester) return say(T("v_sem"));
      if (f.password.length < 8) return say(T("v_pass"));
      if (f.password !== $("password2").value) return say(T("v_match"));
      if (!$("agree").checked) return say(T("v_agree"));
      busy(form, true);
      A.signUp(f).then(function (r) {
        if (r.needsEmailVerify) { form.hidden = true; $("alt").hidden = true; say(T("verify_sent"), true); }
        else location.href = C.DASHBOARD_URL;
      }).catch(function (e) { say(err(e)); }).then(function () { busy(form, false); });
    });
  }

  if (kind === "forgot") {
    var form2 = $("form2"), em = "", timer = null;
    function cooldown() {
      var b = $("resend"), n = 60; b.disabled = true; clearInterval(timer);
      timer = setInterval(function () {
        n--; b.textContent = n > 0 ? T("resend_in") + " " + n : T("resend"); b.disabled = n > 0;
        if (n <= 0) clearInterval(timer);
      }, 1000);
      b.textContent = T("resend_in") + " " + n;
    }
    form.addEventListener("submit", function (ev) {
      ev.preventDefault(); say("");
      em = $("email").value.trim();
      if (!isEmail(em)) return say(T("v_email"));
      busy(form, true);
      A.sendResetOtp(em).then(function () { form.hidden = true; form2.hidden = false; $("otp").focus(); say(T("otp_sent"), true); cooldown(); })
        .catch(function (e) { say(err(e)); }).then(function () { busy(form, false); });
    });
    $("resend").addEventListener("click", function () {
      say(""); A.sendResetOtp(em).then(function () { say(T("otp_sent"), true); cooldown(); }).catch(function (e) { say(err(e)); });
    });
    form2.addEventListener("submit", function (ev) {
      ev.preventDefault(); say("");
      var otp = $("otp").value.trim(), pw = $("password").value;
      if (!/^\d{6,10}$/.test(otp)) return say(T("v_otp"));
      if (pw.length < 8) return say(T("v_pass"));
      if (pw !== $("password2").value) return say(T("v_match"));
      busy(form2, true);
      A.verifyResetOtp(em, otp).then(function () { return A.setNewPassword(pw); })
        .then(function () { return window.sb.auth.signOut(); })
        .then(function () { say(T("pw_changed"), true); setTimeout(function () { location.href = "../login/"; }, 1500); })
        .catch(function (e) { say(err(e)); busy(form2, false); });
    });
  }
})();
