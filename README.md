# BK LearnX (new version)

Web app + future APK (Capacitor). Backend: Supabase. Hosting: Vercel.

## Folder guide
- `assets/css, js, images, icons, fonts`: shared design system and code (one theme.css for the whole site)
- `pages/programs/`: your content goes here (`_template` holds the unit template)
- `pages/auth, student, admin`: login, dashboards
- `typing/`: exam selection, test, result (same file names as old site)
- `supabase/migrations`: database tables and security rules
- `docs/`: requirements document

## Rules
- All paths are relative (needed for APK).
- Never commit `.env`.
