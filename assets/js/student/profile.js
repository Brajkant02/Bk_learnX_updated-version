// Profile: edit details, photo, password, delete account.
(function () {
  var S = window.BKStudent, A = window.BKAuth, $ = S.$, t = S.t, P = window.BK_PROGRAMS || [], me = null;
  function say(id, text, ok) { var m = $(id); m.textContent = text || ""; m.className = ok ? "bk-ok" : "bk-error"; m.hidden = !text; }
  function err(e) { return (e && e.friendly) || t("e_generic"); }
  function progOpts() {
    var v = $("program").value || (me && me.program) || "";
    $("program").innerHTML = '<option value="" disabled>' + t("p_choose") + "</option>" + P.map(function (p) { return '<option value="' + p.slug + '">' + p.name + "</option>"; }).join("");
    $("program").value = v;
  }
  function semOpts(keep) {
    var p = P.filter(function (x) { return x.slug === $("program").value; })[0], list = p ? p.semesters : [];
    $("sem-field").hidden = !list.length;
    $("semester").innerHTML = list.map(function (n) { return '<option value="' + n + '">' + t("p_semester") + " " + n + "</option>"; }).join("");
    if (keep) $("semester").value = keep;
  }
  function fill() {
    $("avatar").innerHTML = S.avatar(me);
    $("name").value = me.name || ""; $("email").value = me.email || ""; $("mobile").value = me.mobile || "";
    $("medium").value = me.medium === "hi" ? "hi" : "en"; progOpts(); $("program").value = me.program || ""; semOpts(me.semester ? String(me.semester) : "");
  }
  $("program").addEventListener("change", function () { semOpts(""); });
  document.addEventListener("bk:lang", function () { if (me) { var s = $("semester").value; progOpts(); semOpts(s); } });

  $("form").addEventListener("submit", function (ev) {
    ev.preventDefault(); say("msg", "");
    var f = { name: $("name").value.trim(), mobile: $("mobile").value.replace(/[\s-]/g, "").replace(/^(\+91|91|0)(?=\d{10}$)/, ""), program: $("program").value, medium: $("medium").value, semester: $("sem-field").hidden ? null : Number($("semester").value) };
    if (f.name.length < 2) return say("msg", t("v_name"));
    if (!/^[6-9]\d{9}$/.test(f.mobile)) return say("msg", t("v_mobile"));
    if (!f.program) return say("msg", t("v_program"));
    if (!$("sem-field").hidden && !f.semester) return say("msg", t("v_sem"));
    A.updateProfile(f).then(function () { Object.assign(me, f); fill(); say("msg", t("p_saved"), true); }).catch(function (e) { say("msg", err(e)); });
  });
  $("photo").addEventListener("change", function () {
    var file = this.files[0]; if (!file) return; say("pmsg", "");
    if (!/^image\/(jpeg|png|webp)$/.test(file.type) || file.size > 2097152) return say("pmsg", t("p_photo_big"));
    A.uploadAvatar(file).then(function (url) { me.avatar_url = url; $("avatar").innerHTML = S.avatar(me); say("pmsg", t("p_photo_ok"), true); }).catch(function (e) { say("pmsg", err(e)); });
  });
  $("pwform").addEventListener("submit", function (ev) {
    ev.preventDefault(); say("wmsg", "");
    var a = $("pw").value; if (a.length < 8) return say("wmsg", t("v_pass")); if (a !== $("pw2").value) return say("wmsg", t("v_match"));
    A.changePassword(a).then(function () { $("pw").value = ""; $("pw2").value = ""; say("wmsg", t("p_pw_ok"), true); }).catch(function (e) { say("wmsg", err(e)); });
  });
  $("del-open").addEventListener("click", function () { $("del-box").hidden = !$("del-box").hidden; });
  $("delform").addEventListener("submit", function (ev) {
    ev.preventDefault(); say("dmsg", "");
    if ($("del-word").value.trim() !== "DELETE") return say("dmsg", t("v_del"));
    $("del-btn").disabled = true;
    A.deleteAccount().catch(function (e) { $("del-btn").disabled = false; say("dmsg", err(e)); });
  });
  S.guard().then(function (p) { if (!p) return; me = p; fill(); BKI18n.apply(); });
})();
