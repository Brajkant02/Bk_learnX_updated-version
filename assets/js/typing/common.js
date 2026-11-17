// Shared by the typing pages: words for the interface, one-time storage helpers, date format.
(function () {
  BKI18n.add({
    en: { t_title: "Typing practice", t_sub: "Choose your exam, language and time. Then start typing.", t_exam: "Choose your exam",
      t_lang: "Language", t_source: "Passages", t_dur: "Time", t_min: "min", t_en: "English", t_hi: "Hindi",
      t_src_practice: "Practice passages", t_src_current: "Current affairs", t_src_mixed: "Mixed",
      t_start: "Start test", t_who_guest: "Enter your name and email to see your result.", t_name: "Your name", t_email: "Email",
      t_consent: "Your name, email and result will be saved so we can reach you with updates.", t_privacy: "Privacy Policy",
      t_who_user: "You are logged in. Your results are saved to your history.", t_target: "Target", t_wpm: "WPM", t_kdp: "key depressions",
      t_v_name: "Enter your name.", t_v_email: "Enter a valid email address.", t_v_exam: "Choose an exam.",
      x_title: "Typing test", x_mode: "Typing mode", x_mode_over: "On the passage", x_mode_box: "Text box", x_lock: "Test started. The mode is locked until you finish.",
      x_finish: "Finish test", x_change: "Change exam", x_time: "Time", x_net: "Net WPM", x_acc: "Accuracy", x_err: "Errors", x_chars: "Characters", x_words: "Words",
      x_click: "Click here and start typing. The timer starts with your first key.", x_box_ph: "Type the passage here…",
      r_title: "Result", r_pass: "Pass", r_fail: "Keep practising", r_pass_n: "You reached the target.", r_fail_n: "Target not reached yet.", r_target: "Target",
      r_gross: "Gross WPM", r_again: "Try again", r_other: "Choose another exam", r_hist: "My typing history", r_for: "Result for",
      r_saved: "Saved to your history.", r_nosave: "We could not save this result. Your result is shown below.", r_lead: "Your result is shown only on this page. It will not be available after you leave.",
      r_none: "No result to show. Take a test to see your result.", r_tip: "Accuracy first, then speed. Practise every day.",
      h_title: "My typing history", h_chart: "Daily progress (best test of each day)", h_m_wpm: "Speed (WPM)", h_m_acc: "Accuracy %", h_m_err: "Mistakes", h_m_tests: "Tests",
      h_recent: "Recent tests", h_date: "Date", h_exam: "Exam", h_empty: "No tests yet. Take your first typing test.", h_take: "Take a typing test", h_days: "Last 30 days" },
    hi: { t_title: "टाइपिंग अभ्यास", t_sub: "अपना exam, भाषा और समय चुनें। फिर टाइप करना शुरू करें।", t_exam: "अपना exam चुनें",
      t_lang: "भाषा", t_source: "अनुच्छेद", t_dur: "समय", t_min: "मिनट", t_en: "English", t_hi: "हिंदी",
      t_src_practice: "अभ्यास अनुच्छेद", t_src_current: "करेंट अफेयर्स", t_src_mixed: "मिले-जुले",
      t_start: "टेस्ट शुरू करें", t_who_guest: "अपना रिज़ल्ट देखने के लिए नाम और email डालें।", t_name: "आपका नाम", t_email: "Email",
      t_consent: "आपका नाम, email और रिज़ल्ट सहेजा जाएगा ताकि हम अपडेट के लिए आपसे संपर्क कर सकें।", t_privacy: "प्राइवेसी पॉलिसी",
      t_who_user: "आप लॉग इन हैं। आपके रिज़ल्ट आपकी हिस्ट्री में सहेजे जाएँगे।", t_target: "लक्ष्य", t_wpm: "WPM", t_kdp: "की-डिप्रेशन",
      t_v_name: "अपना नाम डालें।", t_v_email: "सही email पता डालें।", t_v_exam: "कोई exam चुनें।",
      x_title: "टाइपिंग टेस्ट", x_mode: "टाइपिंग का तरीका", x_mode_over: "अनुच्छेद के ऊपर", x_mode_box: "टेक्स्ट बॉक्स", x_lock: "टेस्ट शुरू हो चुका है। खत्म होने तक तरीका नहीं बदल सकते।",
      x_finish: "टेस्ट खत्म करें", x_change: "Exam बदलें", x_time: "समय", x_net: "नेट WPM", x_acc: "शुद्धता", x_err: "गलतियाँ", x_chars: "अक्षर", x_words: "शब्द",
      x_click: "यहाँ क्लिक करके टाइप करना शुरू करें। पहली key दबाते ही टाइमर चालू होगा।", x_box_ph: "अनुच्छेद यहाँ टाइप करें…",
      r_title: "रिज़ल्ट", r_pass: "पास", r_fail: "अभ्यास जारी रखें", r_pass_n: "आपने लक्ष्य पा लिया।", r_fail_n: "लक्ष्य अभी नहीं मिला।", r_target: "लक्ष्य",
      r_gross: "ग्रॉस WPM", r_again: "फिर से कोशिश करें", r_other: "दूसरा exam चुनें", r_hist: "मेरी टाइपिंग हिस्ट्री", r_for: "रिज़ल्ट:",
      r_saved: "आपकी हिस्ट्री में सहेज लिया गया।", r_nosave: "यह रिज़ल्ट सहेज नहीं पाए। आपका रिज़ल्ट नीचे दिख रहा है।", r_lead: "आपका रिज़ल्ट सिर्फ़ इसी पेज पर दिखेगा। पेज छोड़ने के बाद नहीं मिलेगा।",
      r_none: "दिखाने के लिए कोई रिज़ल्ट नहीं है। रिज़ल्ट देखने के लिए टेस्ट दें।", r_tip: "पहले शुद्धता, फिर गति। रोज़ अभ्यास करें।",
      h_title: "मेरी टाइपिंग हिस्ट्री", h_chart: "रोज़ की प्रगति (हर दिन का सबसे अच्छा टेस्ट)", h_m_wpm: "स्पीड (WPM)", h_m_acc: "शुद्धता %", h_m_err: "गलतियाँ", h_m_tests: "टेस्ट",
      h_recent: "हाल के टेस्ट", h_date: "तारीख़", h_exam: "Exam", h_empty: "अभी कोई टेस्ट नहीं। अपना पहला टाइपिंग टेस्ट दें।", h_take: "टाइपिंग टेस्ट दें", h_days: "पिछले 30 दिन" }
  });
  var S = window.sessionStorage;
  window.BKTyping = {
    exam: function (id) { return window.BK_TYPING.exams.filter(function (e) { return e.id === id; })[0]; },
    set: function (k, v) { try { S.setItem(k, JSON.stringify(v)); } catch (e) {} },
    get: function (k) { try { return JSON.parse(S.getItem(k)); } catch (e) { return null; } },
    take: function (k) { var v = this.get(k); try { S.removeItem(k); } catch (e) {} return v; },   // read once, then gone
    // 2026-11-04 -> 4.11.26
    dmy: function (iso) { var d = new Date(iso); return d.getDate() + "." + (d.getMonth() + 1) + "." + String(d.getFullYear()).slice(-2); },
    dmyDay: function (day) { var p = String(day).split("-"); return Number(p[2]) + "." + Number(p[1]) + "." + p[0].slice(-2); },
    isEmail: function (v) { return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v); },
    esc: function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  };
})();
