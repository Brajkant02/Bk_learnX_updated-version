// Admin area (one admin). Every page has <body data-admin="students"> etc. Real security is in the database rules;
// this script only shows the pages to someone whose profile role is 'admin'.   English only.
(function () {
  var A = window.BKAuth, sb = window.sb, C = window.BK_CONFIG;
  var $ = function (id) { return document.getElementById(id); };
  var page = document.body.getAttribute("data-admin");
  var NAV = [["dashboard", "Overview"], ["students", "Students"], ["subjects", "Subjects"], ["analytics", "Analytics"], ["ratings", "Ratings"], ["banner", "Banner"], ["messages", "Messages"], ["contact-messages", "Contact"], ["typing-leads", "Typing leads"]];
  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
  var dmy = function (iso) { if (!iso) return "-"; var d = new Date(iso); return d.getDate() + "." + (d.getMonth() + 1) + "." + String(d.getFullYear()).slice(-2); };
  var safe = function (q) { return Promise.resolve(q).then(function (r) { return r || { data: null }; }, function (e) { return { data: null, error: e }; }); };
  function toast(m) { var d = document.createElement("div"); d.className = "bk-toast"; d.setAttribute("role", "status"); d.textContent = m; document.body.appendChild(d); setTimeout(function () { d.remove(); }, 2400); }
  function say(id, m, ok) { var p = $(id); if (!p) return; p.textContent = m || ""; p.className = ok ? "bk-ok" : "bk-error"; p.hidden = !m; }
  function table(heads, rows) { return '<div class="bk-scroll"><table class="bk-table"><thead><tr>' + heads.map(function (h) { return "<th>" + h + "</th>"; }).join("") + "</tr></thead><tbody>" + rows.join("") + "</tbody></table></div>"; }
  function empty(m) { return '<div class="bk-empty">' + m + "</div>"; }
  // two-step buttons: first click asks, second click does it
  function arm(btn, label) { if (btn.getAttribute("data-armed")) return true; btn.setAttribute("data-armed", "1"); btn.setAttribute("data-old", btn.textContent); btn.textContent = label || "Sure?"; setTimeout(function () { if (btn.isConnected && btn.getAttribute("data-armed")) { btn.removeAttribute("data-armed"); btn.textContent = btn.getAttribute("data-old"); } }, 4000); return false; }
  function csvCell(v) { var s = v == null ? "" : String(v); if (/^[=+\-@\t\r]/.test(s)) s = "'" + s; return '"' + s.replace(/"/g, '""') + '"'; }   // "'" stops spreadsheet formula injection
  function download(name, text) { var a = document.createElement("a"); a.href = URL.createObjectURL(new Blob(["\ufeff" + text], { type: "text/csv;charset=utf-8" })); a.download = name; document.body.appendChild(a); a.click(); a.remove(); }

  function nav() {
    var m = document.querySelector("main[data-admin-nav]"); if (!m) return;
    m.insertAdjacentHTML("afterbegin", '<nav class="bk-subnav" aria-label="Admin">' + NAV.map(function (n) { return '<a href="/pages/admin/' + n[0] + '/"' + (n[0] === page ? ' aria-current="page"' : "") + ">" + n[1] + "</a>"; }).join("") + "</nav>");
  }

  var H = {};
  // ---------- login ----------
  H.login = function () {
    $("form").addEventListener("submit", function (ev) {
      ev.preventDefault(); say("msg", "");
      var b = $("form").querySelector("[type=submit]"); b.disabled = true;
      A.signIn($("email").value.trim(), $("password").value).then(function (p) {
        if (p && p.role === "admin") { location.href = C.ADMIN_URL; return; }
        return window.sb.auth.signOut().then(function () { say("msg", "This account is not an admin."); });
      }).catch(function (e) { say("msg", (e && e.friendly) || "Could not log in."); }).then(function () { b.disabled = false; });
    });
  };
  // ---------- overview ----------
  H.dashboard = function () {
    safe(sb.rpc("admin_stats")).then(function (r) {
      var s = r.data || {};
      var cards = [["Students", s.total_students, "students"], ["New (7 days)", s.new_7_days, "students"], ["Blocked", s.blocked, "students"], ["Typing tests (students)", s.typing_tests, "analytics"],
        ["Typing leads (guests)", s.typing_leads, "typing-leads"], ["Average rating", s.avg_rating == null ? "-" : s.avg_rating, "ratings"], ["New contact messages", s.new_contact_messages, "contact-messages"]];
      $("stats").innerHTML = cards.map(function (c) { return '<a class="bk-card" href="/pages/admin/' + c[2] + '/"><b style="font:700 1.8rem var(--font-head)">' + esc(c[1] == null ? 0 : c[1]) + '</b><br><span class="bk-muted">' + c[0] + "</span></a>"; }).join("");
    });
  };
  // ---------- students ----------
  H.students = function () {
    var off = 0, rows = [], q = "", timer = null;
    function paint() {
      $("list").innerHTML = rows.length ? table(["Name", "Email", "Mobile", "Program", "Joined", "Status", ""], rows.map(function (s) {
        return "<tr><td>" + esc(s.name) + "</td><td>" + esc(s.email) + "</td><td>" + esc(s.mobile_masked || "-") + "</td><td>" + esc((s.program || "-").toUpperCase() + (s.semester ? " · Sem " + s.semester : "")) + "</td><td>" + dmy(s.created_at) + "</td><td>" +
          (s.blocked ? '<span class="bk-badge bk-badge--err">Blocked</span>' : '<span class="bk-badge bk-badge--ok">Active</span>') + '</td><td style="white-space:nowrap"><a class="bk-btn bk-btn--sm bk-btn--ghost" href="/pages/admin/messages/?to=' + s.id + "&name=" + encodeURIComponent(s.name) + '">Message</a> ' +
          '<button type="button" class="bk-btn bk-btn--sm bk-btn--ghost" data-block="' + s.id + '" data-to="' + (!s.blocked) + '">' + (s.blocked ? "Unblock" : "Block") + '</button> <button type="button" class="bk-btn bk-btn--sm bk-btn--danger" data-del="' + s.id + '">Delete</button></td></tr>'; }))
        : empty("No students found.");
      $("more").hidden = rows.length === 0 || rows.length % 50 !== 0;
    }
    function load(reset) {
      if (reset) { off = 0; rows = []; }
      return safe(sb.rpc("admin_list_students", { p_search: q || null, p_limit: 50, p_offset: off })).then(function (r) { rows = rows.concat(r.data || []); off = rows.length; paint(); });
    }
    $("q").addEventListener("input", function () { clearTimeout(timer); timer = setTimeout(function () { q = $("q").value.trim(); load(true); }, 300); });
    $("more").addEventListener("click", function () { load(false); });
    $("list").addEventListener("click", function (e) {
      var b = e.target.closest("[data-block]"), d = e.target.closest("[data-del]");
      if (b) safe(sb.rpc("admin_set_blocked", { p_user: b.getAttribute("data-block"), p_blocked: b.getAttribute("data-to") === "true" })).then(function () { load(true); });
      if (d && arm(d, "Delete for good?")) safe(sb.rpc("admin_delete_student", { p_user: d.getAttribute("data-del") })).then(function () { toast("Student deleted."); load(true); });
    });
    load(true);
  };
  // ---------- subjects, courses (one per language) and placements ----------
  H.subjects = function () {
    var P = window.BK_PROGRAMS || [], subs = [], courses = [], places = [];
    var LANG = { en: "English", hi: "Hindi" };
    var slugOk = function (v) { return /^[a-z0-9]+(-[a-z0-9]+)*$/.test(v) && v.length <= 60; };
    var progName = function (slug) { var p = P.filter(function (x) { return x.slug === slug; })[0]; return p ? p.name : slug; };
    var defPath = function (slug, l) { return "/programs/" + slug + "/" + (l === "hi" ? "index_hindi.html" : ""); };
    function fail(r, id) { say(id || "msg", r && r.error ? "Could not save: " + String(r.error.message || r.error).slice(0, 160) : ""); return !!(r && r.error); }
    function load() {
      return Promise.all([safe(sb.from("subjects").select("*").order("sort_order").order("name")), safe(sb.from("courses").select("*")), safe(sb.from("course_placements").select("*").order("branch").order("semester"))]).then(function (r) {
        subs = r[0].data || []; courses = r[1].data || []; places = r[2].data || []; paint();
      });
    }
    function paint() {
      var keep = window.scrollY;
      $("count").textContent = subs.length + " subject" + (subs.length === 1 ? "" : "s");
      $("list").innerHTML = subs.length ? subs.map(function (s) {
        var cs = courses.filter(function (c) { return c.subject_id === s.id; }), ps = places.filter(function (p) { return p.subject_id === s.id; });
        var have = {}; cs.forEach(function (c) { have[c.language] = 1; });
        var rows = cs.sort(function (a, b) { return a.language < b.language ? -1 : 1; }).map(function (c) {
          return '<tr data-cid="' + c.id + '"><td>' + LANG[c.language] + '<br><small class="bk-muted">' + esc(c.slug) + '</small></td><td><input class="bk-input" data-f="path" value="' + esc(c.path) + '" aria-label="Path"><small data-found="' + c.id + '" class="bk-muted"></small></td>' +
            '<td style="width:110px"><input class="bk-input" data-f="units" type="number" min="0" max="500" value="' + c.total_units + '" aria-label="Units"></td><td style="white-space:nowrap"><button type="button" class="bk-btn bk-btn--sm" data-save-c="' + c.id + '">Save</button> <button type="button" class="bk-btn bk-btn--sm bk-btn--danger" data-del-c="' + c.id + '">Delete</button></td></tr>'; }).join("");
        var chips = ps.map(function (p) { return '<span class="bk-chip">' + esc(progName(p.branch)) + (p.semester ? " · Sem " + p.semester : "") + ' <small class="bk-muted">#' + p.sort_order + '</small><button type="button" data-del-p="' + p.id + '" aria-label="Remove">×</button></span>'; }).join("");
        var addLang = ["en", "hi"].filter(function (l) { return !have[l]; }).map(function (l) { return '<button type="button" class="bk-btn bk-btn--sm bk-btn--ghost" data-add-c="' + s.id + '" data-lang="' + l + '">+ Add ' + LANG[l] + "</button>"; }).join(" ");
        return '<div class="bk-card bk-stack" data-sid="' + s.id + '"><div class="bk-bar"><div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center"><input class="bk-input" style="width:240px" data-f="name" value="' + esc(s.name) + '" aria-label="Subject name"><button type="button" class="bk-btn bk-btn--sm bk-btn--ghost" data-rename="' + s.id + '">Rename</button>' +
          (ps.length ? "" : '<span class="bk-badge bk-badge--warn">Individual course</span>') + '</div><small class="bk-muted">/programs/' + esc(s.slug) + '/</small></div>' +
          '<h4>Courses (one per language)</h4>' + (rows ? '<div class="bk-scroll"><table class="bk-table"><thead><tr><th>Language</th><th>Starts at (path)</th><th>Units</th><th></th></tr></thead><tbody>' + rows + "</tbody></table></div>" : '<p class="bk-muted">No course yet. Add a language below.</p>') + "<div>" + addLang + "</div>" +
          '<h4>Placed in (branch and semester)</h4><div class="bk-chips">' + (chips || '<span class="bk-muted">Nowhere: students find it under “Add course”, and it shows on Home as an individual course.</span>') + '</div>' +
          '<div class="bk-bar" style="justify-content:flex-start;gap:8px"><select class="bk-input" style="width:auto" data-f="branch">' + P.map(function (p) { return '<option value="' + p.slug + '">' + esc(p.name) + "</option>"; }).join("") + '</select><select class="bk-input" style="width:auto" data-f="sem">' + (P[0] ? P[0].semesters : []).map(function (n) { return '<option value="' + n + '">Sem ' + n + "</option>"; }).join("") + '</select><input class="bk-input" style="width:90px" data-f="ord" type="number" min="0" value="1" aria-label="Order"><button type="button" class="bk-btn bk-btn--sm" data-add-p="' + s.id + '">Place here</button></div>' +
          '<div><button type="button" class="bk-btn bk-btn--sm bk-btn--danger" data-del-s="' + s.id + '">Delete subject</button></div></div>'; }).join("") : empty("No subjects yet. Add the first one above.");
      courses.forEach(function (c) {                                         // does the page really exist?
        var el = document.querySelector('[data-found="' + c.id + '"]'); if (!el) return;
        fetch(c.path, { method: "HEAD" }).then(function (r) { el.textContent = r.ok ? "✓ page found" : "✗ page not found (create it first)"; el.className = r.ok ? "bk-ok-t" : "bk-bad-t"; }).catch(function () {});
      });
      window.scrollTo(0, keep);
    }
    $("new-name").addEventListener("input", function () { if (!$("new-slug").getAttribute("data-touched")) $("new-slug").value = $("new-name").value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""); });
    $("new-slug").addEventListener("input", function () { $("new-slug").setAttribute("data-touched", "1"); });
    $("form").addEventListener("submit", function (ev) {
      ev.preventDefault(); say("msg", "");
      var name = $("new-name").value.trim(), slug = $("new-slug").value.trim();
      if (!name) return say("msg", "Write the subject name.");
      if (!slugOk(slug)) return say("msg", "Folder name: small letters, digits and hyphens only, like web-basics.");
      safe(sb.from("subjects").insert({ slug: slug, name: name, sort_order: subs.length + 1 })).then(function (r) { if (fail(r)) return; $("form").reset(); $("new-slug").removeAttribute("data-touched"); toast("Subject added. Now add its languages."); load(); });
    });
    $("list").addEventListener("click", function (e) {
      var t = e.target, card = t.closest("[data-sid]"), sid = card && card.getAttribute("data-sid"), subj = subs.filter(function (x) { return x.id === sid; })[0];
      var b;
      if ((b = t.closest("[data-rename]"))) {
        var nm = card.querySelector('[data-f="name"]').value.trim(); if (!nm) return toast("Write a name.");
        safe(sb.from("subjects").update({ name: nm }).eq("id", sid)).then(function (r) { if (fail(r, "gmsg")) return; return safe(sb.from("courses").update({ name: nm }).eq("subject_id", sid)).then(function () { toast("Renamed."); load(); }); });
      } else if ((b = t.closest("[data-add-c]"))) {
        var l = b.getAttribute("data-lang");
        safe(sb.from("courses").insert({ subject_id: sid, language: l, slug: subj.slug + "-" + l, name: subj.name, path: defPath(subj.slug, l), total_units: 0 })).then(function (r) { if (fail(r, "gmsg")) return; toast(LANG[l] + " course added. Set its units."); load(); });
      } else if ((b = t.closest("[data-save-c]"))) {
        var row = b.closest("tr"), path = row.querySelector('[data-f="path"]').value.trim(), units = Number(row.querySelector('[data-f="units"]').value);
        if (path.charAt(0) !== "/") return say("gmsg", "Path must start with /, like /programs/python/");
        if (!(units >= 0 && units <= 500 && Math.floor(units) === units)) return say("gmsg", "Units must be a whole number from 0 to 500.");
        say("gmsg", ""); safe(sb.from("courses").update({ path: path, total_units: units }).eq("id", b.getAttribute("data-save-c"))).then(function (r) { if (fail(r, "gmsg")) return; toast("Saved."); load(); });
      } else if ((b = t.closest("[data-del-c]"))) {
        if (arm(b, "Delete? Students' progress goes too")) safe(sb.from("courses").delete().eq("id", b.getAttribute("data-del-c"))).then(function () { load(); });
      } else if ((b = t.closest("[data-add-p]"))) {
        var br = card.querySelector('[data-f="branch"]').value, p = P.filter(function (x) { return x.slug === br; })[0], sem = card.querySelector('[data-f="sem"]').value;
        safe(sb.from("course_placements").insert({ branch: br, semester: p && p.semesters.length ? Number(sem) : null, subject_id: sid, sort_order: Number(card.querySelector('[data-f="ord"]').value) || 0 })).then(function (r) { if (fail(r, "gmsg")) return; toast("Placed."); load(); });
      } else if ((b = t.closest("[data-del-p]"))) {
        if (arm(b, "Remove?")) safe(sb.from("course_placements").delete().eq("id", b.getAttribute("data-del-p"))).then(function () { load(); });
      } else if ((b = t.closest("[data-del-s]"))) {
        if (arm(b, "Delete subject, its courses and students' progress?")) safe(sb.from("subjects").delete().eq("id", sid)).then(function () { toast("Subject deleted."); load(); });
      }
    });
    $("list").addEventListener("change", function (e) {                    // semester choices follow the branch
      var sel = e.target.closest('[data-f="branch"]'); if (!sel) return;
      var p = P.filter(function (x) { return x.slug === sel.value; })[0], sem = sel.parentNode.querySelector('[data-f="sem"]');
      sem.hidden = !(p && p.semesters.length); sem.innerHTML = (p ? p.semesters : []).map(function (n) { return '<option value="' + n + '">Sem ' + n + "</option>"; }).join("");
    });
    load();
  };
  // ---------- analytics ----------
  H.analytics = function () {
    Promise.all([safe(sb.rpc("admin_stats")), safe(sb.rpc("admin_unit_reads", { p_limit: 30 }))]).then(function (r) {
      var s = r[0].data || {}, u = r[1].data || [];
      $("stats").innerHTML = [["Students", s.total_students], ["New (7 days)", s.new_7_days], ["Typing tests", s.typing_tests]].map(function (c) { return '<div class="bk-card"><b style="font:700 1.6rem var(--font-head)">' + esc(c[1] == null ? 0 : c[1]) + '</b><br><span class="bk-muted">' + c[0] + "</span></div>"; }).join("");
      $("reads").innerHTML = u.length ? table(["Unit", "Students who opened it", "Finished"], u.map(function (x) { return '<tr><td><a class="bk-link" href="' + esc(x.unit_path) + '">' + esc(x.unit_path) + "</a></td><td>" + x.readers + "</td><td>" + x.completions + "</td></tr>"; })) : empty("No reading data yet.");
    });
  };
  // ---------- ratings ----------
  H.ratings = function () {
    var all = [], summary = null;
    function sumTable() {
      var rows = summary;
      if (!rows) {                       // 008 not run yet: count in the browser
        var g = {}; all.forEach(function (r) { var o = g[r.unit_path] || (g[r.unit_path] = { n: 0, sum: 0 }); o.n++; o.sum += r.stars; });
        rows = Object.keys(g).map(function (k) { return { unit_path: k, avg_stars: g[k].sum / g[k].n, votes: g[k].n }; }).sort(function (a, b) { return b.votes - a.votes; });
      }
      $("sum").innerHTML = rows.length ? table(["Page", "Average", "Votes"], rows.map(function (r) { return '<tr><td><a class="bk-link" href="' + esc(r.unit_path) + '">' + esc(r.unit_path) + "</a></td><td>" + Number(r.avg_stars).toFixed(1) + " ★</td><td>" + r.votes + "</td></tr>"; })) : empty("No ratings yet.");
    }
    function paint() {
      sumTable();
      var cm = all.filter(function (r) { return r.comment; });
      $("comments").innerHTML = cm.length ? '<div class="bk-list">' + cm.map(function (r) { return '<div class="bk-row-card"><div class="grow"><b>' + r.stars + " ★</b> " + esc(r.comment) + '<br><small class="bk-muted">' + esc(r.unit_path) + " · " + dmy(r.created_at) + '</small></div><button type="button" class="bk-btn bk-btn--sm bk-btn--ghost" data-del="' + r.id + '">Delete</button></div>'; }).join("") + "</div>" : empty("No comments yet.");
    }
    $("comments").addEventListener("click", function (e) { var d = e.target.closest("[data-del]"); if (d && arm(d)) safe(sb.from("ratings").delete().eq("id", d.getAttribute("data-del"))).then(function () { all = all.filter(function (r) { return r.id !== d.getAttribute("data-del"); }); summary = null; paint(); }); });
    Promise.all([safe(sb.rpc("admin_rating_summary", { p_limit: 100 })), safe(sb.from("ratings").select("*").order("created_at", { ascending: false }).limit(1000))]).then(function (r) {
      summary = r[0].data && r[0].data.length ? r[0].data : null; all = r[1].data || []; paint();
    });
  };
  // ---------- banner ----------
  H.banner = function () {
    var rows = [];
    function paint() {
      $("list").innerHTML = rows.length ? table(["Text", "Shows", "Status", ""], rows.map(function (a) {
        return "<tr><td>" + esc(a.text) + "</td><td>" + (a.starts_at ? dmy(a.starts_at) : "now") + " to " + (a.ends_at ? dmy(a.ends_at) : "no end") + "</td><td>" + (a.active ? '<span class="bk-badge bk-badge--ok">On</span>' : '<span class="bk-badge">Off</span>') +
          '</td><td style="white-space:nowrap"><button type="button" class="bk-btn bk-btn--sm bk-btn--ghost" data-tg="' + a.id + '" data-to="' + (!a.active) + '">' + (a.active ? "Turn off" : "Turn on") + '</button> <button type="button" class="bk-btn bk-btn--sm bk-btn--danger" data-del="' + a.id + '">Delete</button></td></tr>'; })) : empty("No banners yet.");
    }
    function load() { return safe(sb.from("announcements").select("*").order("created_at", { ascending: false })).then(function (r) { rows = r.data || []; paint(); }); }
    $("form").addEventListener("submit", function (ev) {
      ev.preventDefault(); say("msg", "");
      var t = $("text").value.trim(); if (!t) return say("msg", "Write the banner text.");
      var s = $("starts").value, e = $("ends").value;
      if (s && e && new Date(e) <= new Date(s)) return say("msg", "End must be after start.");
      safe(sb.from("announcements").insert({ text: t.slice(0, 200), active: true, starts_at: s ? new Date(s).toISOString() : null, ends_at: e ? new Date(e).toISOString() : null })).then(function (r) { if (r.error) return say("msg", "Could not save."); $("form").reset(); toast("Banner saved."); load(); });
    });
    $("list").addEventListener("click", function (e) {
      var t = e.target.closest("[data-tg]"), d = e.target.closest("[data-del]");
      if (t) safe(sb.from("announcements").update({ active: t.getAttribute("data-to") === "true" }).eq("id", t.getAttribute("data-tg"))).then(load);
      if (d && arm(d)) safe(sb.from("announcements").delete().eq("id", d.getAttribute("data-del"))).then(load);
    });
    load();
  };
  // ---------- messages to students ----------
  H.messages = function () {
    var to = null, names = {}, timer = null, params = new URLSearchParams(location.search);
    function pick(id, name) { to = id; $("to").innerHTML = 'To: <b>' + esc(name) + '</b> <button type="button" class="bk-btn bk-btn--sm bk-btn--ghost" id="clear">Change</button>'; $("results").innerHTML = ""; $("find").hidden = true; }
    if (params.get("to")) pick(params.get("to"), params.get("name") || "student");
    $("to").addEventListener("click", function (e) { if (e.target.id === "clear") { to = null; $("to").innerHTML = ""; $("find").hidden = false; } });
    $("find").addEventListener("input", function () {
      clearTimeout(timer); timer = setTimeout(function () {
        var q = $("find").value.trim(); if (q.length < 2) { $("results").innerHTML = ""; return; }
        safe(sb.rpc("admin_list_students", { p_search: q, p_limit: 8, p_offset: 0 })).then(function (r) {
          $("results").innerHTML = (r.data || []).map(function (s) { names[s.id] = s.name; return '<button type="button" class="bk-row-card" data-pick="' + s.id + '" data-name="' + esc(s.name) + '"><b>' + esc(s.name) + '</b><span class="bk-muted">' + esc(s.email) + "</span></button>"; }).join("");
        });
      }, 300);
    });
    $("results").addEventListener("click", function (e) { var b = e.target.closest("[data-pick]"); if (b) pick(b.getAttribute("data-pick"), b.getAttribute("data-name")); });
    $("form").addEventListener("submit", function (ev) {
      ev.preventDefault(); say("msg", "");
      var sub = $("subject").value.trim(), body = $("body").value.trim();
      if (!to) return say("msg", "Choose a student first.");
      if (!body) return say("msg", "Write a message.");
      safe(sb.from("messages").insert({ user_id: to, subject: sub.slice(0, 120), body: body })).then(function (r) { if (r.error) return say("msg", "Could not send."); $("subject").value = ""; $("body").value = ""; toast("Message sent."); loadSent(); });
    });
    function loadSent() {
      safe(sb.from("messages").select("*").order("created_at", { ascending: false }).limit(30)).then(function (r) {
        var m = r.data || [];
        $("sent").innerHTML = m.length ? table(["Date", "To", "Subject", "Read"], m.map(function (x) { return "<tr><td>" + dmy(x.created_at) + "</td><td>" + esc(names[x.user_id] || x.user_id.slice(0, 8)) + "</td><td>" + esc(x.subject || "-") + "</td><td>" + (x.is_read ? "Yes" : "No") + "</td></tr>"; })) : empty("No messages sent yet.");
      });
    }
    safe(sb.rpc("admin_list_students", { p_search: null, p_limit: 200, p_offset: 0 })).then(function (r) { (r.data || []).forEach(function (s) { names[s.id] = s.name; }); loadSent(); });
  };
  // ---------- contact messages ----------
  H["contact-messages"] = function () {
    var rows = [];
    function paint() {
      $("list").innerHTML = rows.length ? '<div class="bk-list">' + rows.map(function (m) {
        return '<div class="bk-msg' + (m.status === "new" ? " unread" : "") + '"><div class="bk-bar"><b>' + esc(m.name) + ' · <a class="bk-link" href="mailto:' + esc(m.email) + '">' + esc(m.email) + '</a></b><small class="bk-muted">' + dmy(m.created_at) + ' · <span class="bk-badge">' + esc(m.status) + "</span></small></div>" +
          '<p class="bk-msg-b">' + esc(m.message) + '</p><div style="display:flex;gap:8px;margin-top:8px">' + (m.status !== "done" ? '<button type="button" class="bk-btn bk-btn--sm bk-btn--ghost" data-st="read" data-id="' + m.id + '">Mark read</button><button type="button" class="bk-btn bk-btn--sm bk-btn--ghost" data-st="done" data-id="' + m.id + '">Mark done</button>' : "") + '<button type="button" class="bk-btn bk-btn--sm bk-btn--danger" data-del="' + m.id + '">Delete</button></div></div>'; }).join("") + "</div>" : empty("No messages yet.");
    }
    function load() { return safe(sb.from("contact_messages").select("*").order("created_at", { ascending: false }).limit(200)).then(function (r) { rows = r.data || []; paint(); }); }
    $("list").addEventListener("click", function (e) {
      var s = e.target.closest("[data-st]"), d = e.target.closest("[data-del]");
      if (s) safe(sb.from("contact_messages").update({ status: s.getAttribute("data-st") }).eq("id", s.getAttribute("data-id"))).then(load);
      if (d && arm(d)) safe(sb.from("contact_messages").delete().eq("id", d.getAttribute("data-del"))).then(load);
    });
    load();
  };
  // ---------- typing leads ----------
  H["typing-leads"] = function () {
    var rows = [];
    function paint() {
      $("count").textContent = rows.length + " guest" + (rows.length === 1 ? "" : "s");
      $("list").innerHTML = rows.length ? table(["Date", "Name", "Email", "Exam", "WPM", "Accuracy", "Mistakes", ""], rows.map(function (l) {
        return "<tr><td>" + dmy(l.created_at) + "</td><td>" + esc(l.name) + "</td><td>" + esc(l.email) + "</td><td>" + esc(l.exam_type || "-") + "</td><td>" + (l.wpm == null ? "-" : l.wpm) + "</td><td>" + (l.accuracy == null ? "-" : l.accuracy + "%") + "</td><td>" + (l.mistakes == null ? "-" : l.mistakes) + '</td><td><button type="button" class="bk-btn bk-btn--sm bk-btn--danger" data-del="' + l.id + '">Delete</button></td></tr>'; })) : empty("No typing leads yet.");
    }
    $("export").addEventListener("click", function () {
      var head = ["Date", "Name", "Email", "Exam", "WPM", "Accuracy", "Mistakes"].map(csvCell).join(",");
      var body = rows.map(function (l) { return [l.created_at, l.name, l.email, l.exam_type, l.wpm, l.accuracy, l.mistakes].map(csvCell).join(","); });
      var d = new Date();
      download("typing-leads-" + d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate() + ".csv", [head].concat(body).join("\r\n"));
    });
    $("list").addEventListener("click", function (e) { var d = e.target.closest("[data-del]"); if (d && arm(d, "Delete?")) safe(sb.from("typing_leads").delete().eq("id", d.getAttribute("data-del"))).then(function () { rows = rows.filter(function (l) { return l.id !== d.getAttribute("data-del"); }); paint(); }); });
    safe(sb.from("typing_leads").select("*").order("created_at", { ascending: false }).limit(5000)).then(function (r) { rows = r.data || []; paint(); });
  };

  nav();
  if (page === "login") { H.login(); return; }
  A.requireAdmin().then(function (p) { if (p && H[page]) H[page](p); });
})();
