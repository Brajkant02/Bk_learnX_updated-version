# Go-live के औज़ार (सब `node tools/...` से चलते हैं)

| कमांड | क्या करता है |
|---|---|
| `node tools/golive-check.mjs` | **जाने से पहले एक कमांड।** ज़रूर-ठीक-करने वाली गलतियाँ (✗) और देखने लायक बातें (⚠) बताता है। `--verbose` से पास हुई जाँचें भी दिखती हैं। |
| `node tools/build-sitemap.mjs` | `sitemap.xml` और `robots.txt` बनाता है। नए units जोड़ने के बाद दोबारा चलाएँ। (`--check` सिर्फ़ जाँचता है) |
| `node tools/set-site-url.mjs https://आपका-पता` | सारे पेजों, sitemap और robots में site का पता एक साथ बदल देता है। |
| `node tools/check-links.mjs` | टूटे links और गायब फ़ाइलें ढूँढता है। |
| `python tools/prepare_head.py` | हाथ से बनाए पेजों में manifest, आइकन जोड़ता है और बाहरी fonts/CDN हटाता है। |
| `python tools/new_subject.py ...` | नया subject folder और उसके units बनाता है। |

## golive-check क्या-क्या जाँचता है
- ज़रूरी फ़ाइलें (404, offline, manifest, sw.js, sitemap, robots, आइकन, fonts)
- `config.js`: Supabase URL और key असली हैं, **और service_role/secret key गलती से नहीं पड़ी** (सबसे ख़तरनाक गलती)
- साइट में `.env` या कोई secret key नहीं
- हर पेज: title, description, canonical, एक ही site का पता, कोई `{{...}}` बचा नहीं
- Admin, student, login और typing के test/result पेज Google में नहीं आ सकते (noindex)
- `programs/sample-subject` हटा है
- sitemap ताज़ा है, कोई link टूटा नहीं
- हर subject में unit की संख्या, `data-course` और `data-units` सही हैं
- चेतावनियाँ: पुराने पतों के redirect, typing के अनुच्छेद 20 से कम, Contact links खाली, SITE_URL नहीं

## 404 पेज
`404.html` root में है। Vercel गलत पते पर यही दिखाता है।

## Vercel पर जाते समय
`SITE_URL` वही रखें जो असली पता है, और Supabase में Site URL तथा Redirect URLs में भी वही।
