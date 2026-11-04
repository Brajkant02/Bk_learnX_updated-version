# Design system: कैसे इस्तेमाल करें

## किसी भी नए पेज का ढाँचा
`<head>` में:
```html
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#f2f5ee">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Sora:wght@600;700&family=Noto+Sans+Devanagari:wght@400;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/assets/css/theme.css">
<script src="/assets/js/core/theme.js"></script>   <!-- बिना defer -->
```
`<body>` के अंत में:
```html
<main id="main" class="bk-container"> ... पेज की सामग्री ... </main>
<div id="bk-footer"></div>
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.min.js"></script>
<script src="/assets/js/core/config.js"></script>
<script src="/assets/js/core/supabase.js"></script>
<script src="/assets/js/core/auth.js"></script>
<script src="/assets/js/core/i18n.js"></script>
<script src="/assets/js/components/layout.js" defer></script>
```
Header, footer, मोबाइल का नीचे वाला menu, banner, Dark/Light और Hindi/English बटन `layout.js` अपने-आप लगा देता है।

## Hindi/English
- Text पर `data-i18n="key"` लगाएँ।
- पेज के अपने शब्द: `BKI18n.add({ en:{key:"..."}, hi:{key:"..."} })`
- Notes के अंदर का content अपने Hindi/English पेजों में रहेगा।

## मुख्य classes (सब `bk-` से शुरू)
`bk-container, bk-section, bk-hero, bk-card, bk-card--brand, bk-grid, bk-tile, bk-btn (--accent, --ghost, --light, --sm), bk-badge (--ok, --warn, --err), bk-progress, bk-field, bk-label, bk-input, bk-hint, bk-error, bk-empty, bk-toast, bk-banner`

## रंग बदलने हों
सिर्फ़ `assets/css/theme.css` के ऊपर के दो हिस्से (`:root` और `[data-theme="dark"]`)।

## Preview
`docs/design-system.html` को browser में खोलकर सब components देख सकते हैं।

## बाद के लिए (Phase 8, APK)
- Google Fonts की जगह fonts अपने folder (`assets/fonts`) में रखने होंगे, ताकि app बिना internet के भी चले।
- `BKI18n`, `BKTheme` और layout वैसे ही चलेंगे।
