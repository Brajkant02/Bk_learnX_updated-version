// Load order on every page that needs login/data:
//   <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.min.js"></script>
//   <script src="/assets/js/core/config.js"></script>
//   <script src="/assets/js/core/supabase.js"></script>
//   <script src="/assets/js/core/auth.js"></script>
(function () {
  var c = window.BK_CONFIG;
  window.sb = window.supabase.createClient(c.SUPABASE_URL, c.SUPABASE_ANON_KEY, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
  });
})();
