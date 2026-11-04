// Fill these two values from Supabase -> Project Settings -> API.
// The anon key is meant to be public (security comes from the database rules).
// NEVER put the service_role key in any frontend file.
window.BK_CONFIG = {
  SUPABASE_URL: "https://YOUR-PROJECT.supabase.co",
  SUPABASE_ANON_KEY: "YOUR-ANON-KEY",
  LOGIN_URL: "/pages/auth/login/",
  DASHBOARD_URL: "/pages/student/dashboard/",
  ADMIN_LOGIN_URL: "/pages/admin/login/",
  ADMIN_URL: "/pages/admin/dashboard/"
};
