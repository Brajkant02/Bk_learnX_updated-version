// Shared by all student pages: words, sub-navigation, small helpers.
(function () {
  BKI18n.add({
    en: { sd_nav_dash: "Dashboard", sd_nav_courses: "My courses", sd_nav_bm: "Bookmarks", sd_nav_typing: "Typing", sd_nav_inbox: "Inbox", sd_nav_profile: "Profile",
      sd_hello: "Hello", sd_sub: "Here is where you left off.", sd_complete: "Complete your profile", sd_complete_d: "Choose your program and semester to see your subjects.", sd_complete_btn: "Complete profile",
      sd_continue: "Continue where you left off", sd_continue_none: "You have not opened any unit yet.", sd_resume: "Resume", sd_start: "Browse programs",
      sd_progress: "My courses", sd_all: "View all", sd_no_courses: "No courses yet. Choose your program in your profile, or add a course.",
      sd_typing: "Typing", sd_best: "Best speed", sd_tests: "Tests", sd_take: "Take a typing test", sd_no_typing: "No typing tests yet.", sd_history: "Full history",
      sd_inbox: "Inbox", sd_unread: "unread", sd_no_msg: "No messages yet.", sd_bm: "Bookmarks", sd_no_bm: "No bookmarks yet.",
      c_title: "My courses", c_en: "English", c_hi: "Hindi", c_hi_missing: "Hindi is not available yet. Showing English.", p_medium: "Medium of study", m_en: "English", m_hi: "Hindi", c_add: "Add course", c_search: "Search courses", c_sem: "Your semester", c_added: "Added by you", c_remove: "Remove", c_open: "Open", c_units: "units",
      c_none_avail: "No more courses to add.", c_added_ok: "Course added.", c_removed: "Course removed.", c_close: "Close", c_sem_n: "Semester", c_empty: "You have no courses yet.",
      b_title: "Bookmarks", b_remove: "Remove", b_empty: "You have not bookmarked any notes yet. Open a unit and tap the bookmark button.",
      i_title: "Inbox", i_empty: "No messages yet.", i_new: "New",
      p_title: "Profile", p_name: "Full name", p_email: "Email", p_mobile: "Mobile number", p_program: "Program", p_semester: "Semester", p_save: "Save changes", p_saved: "Saved.",
      p_photo: "Change photo", p_photo_ok: "Photo updated.", p_photo_big: "Choose a JPG, PNG or WebP image under 2 MB.", p_pw: "Change password", p_new_pw: "New password", p_pw2: "Confirm new password",
      p_pw_btn: "Update password", p_pw_ok: "Password updated.", p_del: "Delete my account", p_del_warn: "This permanently deletes your account, progress, bookmarks, typing history and messages. It cannot be undone.",
      p_del_ask: "Type DELETE to confirm", p_del_btn: "Delete account permanently", p_choose: "Choose a program", p_none: "No semesters",
      v_name: "Enter your full name.", v_mobile: "Enter a 10-digit mobile number.", v_program: "Choose your program.", v_sem: "Choose your semester.", v_pass: "Password must be at least 8 characters.", v_match: "The two passwords do not match.", v_del: "Type DELETE to confirm.",
      e_generic: "Something went wrong. Try again." },
    hi: { sd_nav_dash: "डैशबोर्ड", sd_nav_courses: "मेरे कोर्स", sd_nav_bm: "बुकमार्क", sd_nav_typing: "टाइपिंग", sd_nav_inbox: "इनबॉक्स", sd_nav_profile: "प्रोफ़ाइल",
      sd_hello: "नमस्ते", sd_sub: "यहाँ से आगे बढ़ें।", sd_complete: "अपनी प्रोफ़ाइल पूरी करें", sd_complete_d: "अपने subjects देखने के लिए प्रोग्राम और सेमेस्टर चुनें।", sd_complete_btn: "प्रोफ़ाइल पूरी करें",
      sd_continue: "जहाँ छोड़ा था वहीं से जारी रखें", sd_continue_none: "आपने अभी कोई यूनिट नहीं खोली है।", sd_resume: "जारी रखें", sd_start: "प्रोग्राम देखें",
      sd_progress: "मेरे कोर्स", sd_all: "सब देखें", sd_no_courses: "अभी कोई कोर्स नहीं। प्रोफ़ाइल में प्रोग्राम चुनें या कोर्स जोड़ें।",
      sd_typing: "टाइपिंग", sd_best: "सबसे अच्छी स्पीड", sd_tests: "टेस्ट", sd_take: "टाइपिंग टेस्ट दें", sd_no_typing: "अभी कोई टाइपिंग टेस्ट नहीं।", sd_history: "पूरी हिस्ट्री",
      sd_inbox: "इनबॉक्स", sd_unread: "अनपढ़े", sd_no_msg: "अभी कोई संदेश नहीं।", sd_bm: "बुकमार्क", sd_no_bm: "अभी कोई बुकमार्क नहीं।",
      c_title: "मेरे कोर्स", c_en: "English", c_hi: "हिंदी", c_hi_missing: "हिंदी अभी उपलब्ध नहीं है। English दिखा रहे हैं।", p_medium: "पढ़ाई का माध्यम", m_en: "English", m_hi: "हिंदी", c_add: "कोर्स जोड़ें", c_search: "कोर्स खोजें", c_sem: "आपका सेमेस्टर", c_added: "आपने जोड़ा", c_remove: "हटाएँ", c_open: "खोलें", c_units: "यूनिट",
      c_none_avail: "जोड़ने के लिए और कोर्स नहीं हैं।", c_added_ok: "कोर्स जुड़ गया।", c_removed: "कोर्स हट गया।", c_close: "बंद करें", c_sem_n: "सेमेस्टर", c_empty: "आपके पास अभी कोई कोर्स नहीं है।",
      b_title: "बुकमार्क", b_remove: "हटाएँ", b_empty: "आपने अभी कोई नोट्स बुकमार्क नहीं किए। कोई यूनिट खोलकर बुकमार्क बटन दबाएँ।",
      i_title: "इनबॉक्स", i_empty: "अभी कोई संदेश नहीं।", i_new: "नया",
      p_title: "प्रोफ़ाइल", p_name: "पूरा नाम", p_email: "Email", p_mobile: "मोबाइल नंबर", p_program: "प्रोग्राम", p_semester: "सेमेस्टर", p_save: "बदलाव सहेजें", p_saved: "सहेज लिया।",
      p_photo: "फ़ोटो बदलें", p_photo_ok: "फ़ोटो बदल गई।", p_photo_big: "2 MB से छोटी JPG, PNG या WebP फ़ोटो चुनें।", p_pw: "Password बदलें", p_new_pw: "नया password", p_pw2: "नया password दोबारा डालें",
      p_pw_btn: "Password बदलें", p_pw_ok: "Password बदल गया।", p_del: "मेरा account हटाएँ", p_del_warn: "इससे आपका account, प्रगति, बुकमार्क, टाइपिंग हिस्ट्री और संदेश हमेशा के लिए हट जाएँगे। इसे वापस नहीं किया जा सकता।",
      p_del_ask: "पक्का करने के लिए DELETE लिखें", p_del_btn: "Account हमेशा के लिए हटाएँ", p_choose: "प्रोग्राम चुनें", p_none: "कोई सेमेस्टर नहीं",
      v_name: "अपना पूरा नाम डालें।", v_mobile: "10 अंकों का मोबाइल नंबर डालें।", v_program: "अपना प्रोग्राम चुनें।", v_sem: "अपना सेमेस्टर चुनें।", v_pass: "Password कम से कम 8 अक्षर का हो।", v_match: "दोनों password एक जैसे नहीं हैं।", v_del: "पक्का करने के लिए DELETE लिखें।",
      e_generic: "कुछ गड़बड़ हुई, फिर कोशिश करें।" }
  });
  var NAV = [["dashboard", "sd_nav_dash", "/pages/student/dashboard/"], ["courses", "sd_nav_courses", "/pages/student/my-courses/"], ["bookmarks", "sd_nav_bm", "/pages/student/bookmarks/"],
    ["typing", "sd_nav_typing", "/pages/student/typing-history/"], ["inbox", "sd_nav_inbox", "/pages/student/inbox/"], ["profile", "sd_nav_profile", "/pages/student/profile/"]];
  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
  function progName(slug) { var p = (window.BK_PROGRAMS || []).filter(function (x) { return x.slug === slug; })[0]; return p ? p.name : String(slug || "").toUpperCase(); }
  window.BKStudent = {
    esc: esc, $: function (id) { return document.getElementById(id); }, t: function (k) { return BKI18n.t(k); }, progName: progName,
    dmy: function (iso) { var d = new Date(iso); return d.getDate() + "." + (d.getMonth() + 1) + "." + String(d.getFullYear()).slice(-2); },
    unitLabel: function (p) {
      var seg = String(p || "").split("/").filter(Boolean).pop() || ""; try { seg = decodeURIComponent(seg); } catch (e) {}
      seg = seg.replace(/\.html?$/, "").replace(/[-_]+/g, " ");
      return seg.replace(/\b\w/g, function (c) { return c.toUpperCase(); });
    },
    initials: function (name) { return String(name || "?").trim().split(/\s+/).slice(0, 2).map(function (w) { return w.charAt(0); }).join("").toUpperCase() || "?"; },
    avatar: function (p, cls) { return p && p.avatar_url ? '<img class="bk-avatar" src="' + esc(p.avatar_url) + '" alt="">' : '<span class="bk-avatar" aria-hidden="true">' + esc(window.BKStudent.initials(p && p.name)) + "</span>"; },
    guard: function () { return window.BKAuth.requireLogin(); },
    safe: function (q) { return Promise.resolve(q).then(function (r) { return r || { data: null }; }, function () { return { data: null }; }); },
    toast: function (m) { var d = document.createElement("div"); d.className = "bk-toast"; d.setAttribute("role", "status"); d.textContent = m; document.body.appendChild(d); setTimeout(function () { d.remove(); }, 2400); }
  };
  function nav() {
    var m = document.querySelector("main[data-snav]"); if (!m) return;
    var a = m.getAttribute("data-snav");
    m.insertAdjacentHTML("afterbegin", '<nav class="bk-subnav" data-i18n-aria="sd_nav_dash">' + NAV.map(function (n) {
      return '<a href="' + n[2] + '"' + (n[0] === a ? ' aria-current="page"' : "") + ' data-i18n="' + n[1] + '"></a>'; }).join("") + "</nav>");
    BKI18n.apply(m);   // the tabs are added after the layout has already translated the page
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", nav); else nav();
})();
