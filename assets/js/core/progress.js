// BKProgress: used by the UNIT pages (Phase 7 template) to save reading progress and bookmarks.
// Only works for logged-in students; for guests every call quietly does nothing.
//   <body data-course="pgdca-s2-python">  ... slug of the course (see the `courses` table)
//   BKProgress.visit()                    -> call when a unit page opens (saves "last visited")
//   BKProgress.complete()                 -> call when the student marks the unit done
//   BKProgress.isComplete()               -> true / false
//   BKProgress.toggleBookmark()           -> returns true if now bookmarked
//   BKProgress.isBookmarked()             -> true / false
(function () {
  var cache = {};
  function sb() { return window.sb; }
  function path() { return location.pathname; }
  function slug() { return document.body && document.body.getAttribute("data-course"); }
  function uid() { return window.BKAuth.getSession().then(function (s) { return s ? s.user.id : null; }); }
  function courseId() {
    var s = slug(); if (!s) return Promise.resolve(null);
    if (cache[s] !== undefined) return Promise.resolve(cache[s]);
    return Promise.resolve(sb().from("courses").select("id").eq("slug", s).single()).then(function (r) { cache[s] = r.error || !r.data ? null : r.data.id; return cache[s]; });
  }
  function save(extra) {
    return uid().then(function (u) {
      if (!u) return null;
      return courseId().then(function (cid) {
        var row = { user_id: u, course_id: cid, unit_path: path(), unit_title: document.title.split("|")[0].trim(), last_visited_at: new Date().toISOString() };
        for (var k in extra) row[k] = extra[k];
        return sb().from("progress").upsert(row, { onConflict: "user_id,unit_path" });
      });
    }).catch(function () { return null; });
  }
  window.BKProgress = {
    visit: function () { return save({}); },
    complete: function () { return save({ completed: true }); },
    // true if this student already finished this unit
    isComplete: function () {
      return uid().then(function (u) {
        if (!u) return false;
        return Promise.resolve(sb().from("progress").select("completed").eq("unit_path", path())).then(function (r) { return !!(r.data && r.data[0] && r.data[0].completed); });
      }).catch(function () { return false; });
    },
    isBookmarked: function () {
      return uid().then(function (u) {
        if (!u) return false;
        return Promise.resolve(sb().from("bookmarks").select("unit_path").eq("unit_path", path())).then(function (r) { return !!(r.data && r.data.length); });
      }).catch(function () { return false; });
    },
    toggleBookmark: function () {
      var self = this;
      return uid().then(function (u) {
        if (!u) return null;
        return self.isBookmarked().then(function (on) {
          if (on) return Promise.resolve(sb().from("bookmarks").delete().eq("user_id", u).eq("unit_path", path())).then(function () { return false; });
          return Promise.resolve(sb().from("bookmarks").insert({ user_id: u, unit_path: path(), title: document.title.split("|")[0].trim() })).then(function () { return true; });
        });
      }).catch(function () { return null; });
    }
  };
})();
