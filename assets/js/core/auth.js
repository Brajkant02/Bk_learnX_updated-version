// BKAuth: login, registration, password reset (Email OTP), profile, account delete.
(function () {
  var C = window.BK_CONFIG;
  var sb = window.sb;

  function friendly(err) {
    var hi = window.BKI18n && window.BKI18n.lang === "hi";
    function p(h, e) { return hi ? h : e; }
    var m = (err && err.message || "").toLowerCase();
    if (m.includes("invalid login")) return p("Email या password गलत है।", "Wrong email or password.");
    if (m.includes("already registered") || m.includes("already been registered")) return p("यह email पहले से registered है।", "This email is already registered.");
    if (m.includes("email not confirmed")) return p("पहले अपना email verify करें (inbox देखें)।", "Confirm your email first (check your inbox).");
    if (m.includes("expired") || (m.includes("invalid") && m.includes("token"))) return p("OTP गलत है या समय समाप्त हो गया।", "The OTP is wrong or has expired.");
    if (m.includes("rate limit") || m.includes("too many") || m.includes("security purposes")) return p("बहुत ज़्यादा कोशिशें हुईं। थोड़ी देर बाद फिर करें।", "Too many attempts. Try again in a little while.");
    if (m.includes("password") && (m.includes("characters") || m.includes("weak"))) return p("Password कम से कम 8 अक्षर का रखें।", "Use a password of at least 8 characters.");
    if (m.includes("same password")) return p("नया password पुराने से अलग रखें।", "Choose a password different from the old one.");
    return p("कुछ गड़बड़ हुई, फिर कोशिश करें।", "Something went wrong. Try again.");
  }
  function check(res) { if (res.error) { var e = res.error; e.friendly = friendly(e); throw e; } return res.data; }

  var BKAuth = {
    friendly: friendly,

    // ---- Registration ----
    // Needs: name, email, password, mobile, program, semester
    async signUp(f) {
      var data = check(await sb.auth.signUp({
        email: f.email, password: f.password,
        options: {
          data: { name: f.name, mobile: f.mobile, program: f.program, semester: String(f.semester) },
          emailRedirectTo: location.origin + C.LOGIN_URL
        }
      }));
      // If email confirmation is ON there is no session yet: tell the user to check inbox
      return { needsEmailVerify: !data.session };
    },

    // ---- Login ----
    async signIn(email, password) {
      check(await sb.auth.signInWithPassword({ email: email, password: password }));
      return BKAuth.afterLogin();
    },
    async signInGoogle() {
      check(await sb.auth.signInWithOAuth({ provider: "google", options: { redirectTo: location.origin + C.DASHBOARD_URL } }));
    },
    async afterLogin() {
      var p = await BKAuth.getProfile();
      if (p && p.blocked) { await sb.auth.signOut(); throw { friendly: window.BKI18n && window.BKI18n.lang === "hi" ? "आपका account block है। संपर्क करें।" : "Your account is blocked. Please contact us." }; }
      return p;
    },
    async signOut() { await sb.auth.signOut(); location.href = C.LOGIN_URL; },

    // ---- Password reset with Email OTP ----
    // 1) send code to email  2) verify code  3) set new password
    async sendResetOtp(email) { check(await sb.auth.resetPasswordForEmail(email)); },
    async verifyResetOtp(email, code) {
      check(await sb.auth.verifyOtp({ email: email, token: code, type: "recovery" }));
    },
    async setNewPassword(newPassword) {
      check(await sb.auth.updateUser({ password: newPassword }));
    },
    async changePassword(newPassword) { return BKAuth.setNewPassword(newPassword); },

    // ---- Session / guards ----
    async getSession() { return (await sb.auth.getSession()).data.session; },
    async requireLogin() {
      var s = await BKAuth.getSession();
      if (!s) { location.replace(C.LOGIN_URL); return null; }
      var p = await BKAuth.getProfile();
      if (p && p.blocked) { await BKAuth.signOut(); return null; }
      return p;
    },
    async requireAdmin() {
      var s = await BKAuth.getSession();
      var p = s ? await BKAuth.getProfile() : null;
      if (!p || p.role !== "admin") { location.replace(C.ADMIN_LOGIN_URL); return null; }
      return p;
    },

    // ---- Profile ----
    async getProfile() {
      var s = await BKAuth.getSession();
      if (!s) return null;
      var r = await sb.from("profiles").select("*").eq("id", s.user.id).single();
      return r.error ? null : r.data;
    },
    // allowed fields: name, mobile, program, semester
    async updateProfile(fields) {
      var s = await BKAuth.getSession();
      var allowed = {};
      ["name", "mobile", "program", "semester"].forEach(function (k) { if (k in fields) allowed[k] = fields[k]; });
      check(await sb.from("profiles").update(allowed).eq("id", s.user.id));
    },
    async uploadAvatar(file) {
      var s = await BKAuth.getSession();
      var ext = (file.name.split(".").pop() || "jpg").toLowerCase();
      var path = s.user.id + "/avatar." + ext;
      check(await sb.storage.from("avatars").upload(path, file, { upsert: true, contentType: file.type }));
      var url = sb.storage.from("avatars").getPublicUrl(path).data.publicUrl + "?v=" + Date.now();
      check(await sb.from("profiles").update({ avatar_url: url }).eq("id", s.user.id));
      return url;
    },

    // ---- Delete my account and ALL my data (cannot be undone) ----
    async deleteAccount() {
      var s = await BKAuth.getSession();
      if (!s) throw { friendly: "पहले login करें।" };
      var uid = s.user.id;
      var files = (await sb.storage.from("avatars").list(uid)).data || [];
      if (files.length) await sb.storage.from("avatars").remove(files.map(function (f) { return uid + "/" + f.name; }));
      check(await sb.rpc("delete_my_account"));
      await sb.auth.signOut();
      location.href = "/";
    }
  };
  window.BKAuth = BKAuth;
})();
