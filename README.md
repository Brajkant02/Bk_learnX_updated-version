# BK LearnX (new version)

Web app + future APK (Capacitor). Backend: Supabase. Hosting: Vercel.

## Folder guide
- `assets/css, js, images, icons, fonts`: shared design system and code (one theme.css for the whole site)
- `programs/<subject>/`: every subject lives here once (unit_1.html, unit_1_hindi.html ...). See docs/SUBJECTS_GUIDE.md
- `branch/`: one generic page for all branches (/branch/?b=pgdca); subjects and semesters come from the database
- `pages/auth, student, admin`: login, dashboards
- `typing/`: exam selection, test, result (same file names as old site)
- `supabase/migrations`: database tables and security rules
- `docs/`: requirements document

## Rules
- All paths are relative (needed for APK).
- Never commit `.env`.

## Tools
- `tools/new_subject.py`: makes a subject folder with all unit pages and prints the SQL (see docs/UNIT_GUIDE.md)
- `tools/prepare_head.py`: adds manifest/icons to every page, removes external fonts/CDN
- `tools/check-links.mjs`: finds broken local links
- `app/`: Android app (Capacitor). Built by GitHub Actions: see docs/APP_GUIDE.md
- `tools/golive-check.mjs`: ONE command before going live (secrets, placeholders, links, sitemap, units)
- `tools/build-sitemap.mjs`: makes sitemap.xml + robots.txt
- `tools/set-site-url.mjs`: changes the website address everywhere
