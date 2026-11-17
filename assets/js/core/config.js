// Fill these two values from Supabase -> Project Settings -> API.
// The anon key is meant to be public (security comes from the database rules).
// NEVER put the service_role key in any frontend file.
window.BK_CONFIG = {
  SUPABASE_URL: "https://rpgeqjdjvqyrxulaemoy.supabase.co/rest/v1/",
  SUPABASE_ANON_KEY: "sb_secret_fw9nV2cyD87OLQe4kqk8Lw_fmvPBcq-",
  LOGIN_URL: "/pages/auth/login/",
  DASHBOARD_URL: "/pages/student/dashboard/",
  ADMIN_LOGIN_URL: "/pages/admin/login/",
  ADMIN_URL: "/pages/admin/dashboard/",
  // Contact page shows only the ones you fill in. WhatsApp: number with country code, digits only (e.g. "919876543210").
  CONTACT: { whatsapp: "919355354035", email: "brajkant02@gmail.com", instagram: "bk_learn_x", youtube: "", linkedin: "" }
};
