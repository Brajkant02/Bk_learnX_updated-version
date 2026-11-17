# Phase 4 (भाग 1): Home + Login, Registration, Forgot password

## बने हुए पेज
- `index.html` (Home): SEO tags, JSON-LD, 8 branches के cards (साधारण HTML, ताकि Google पढ़ सके)
- `pages/auth/login/`: Email+Password और Google
- `pages/auth/registration/`: नाम, email, mobile, program, semester, password, सहमति
- `pages/auth/forgot-password/`: Email पर OTP -> नया password
- `pages/auth/reset-password/`: forgot-password पर भेज देता है
- `vercel.json`: पुराना `/pages/home/index.html` अब `/` पर 301 redirect (canonical की समस्या ठीक)

## आपको ज़रूरी बातें
1. **Branches:** 8 तय हो गई हैं (PGDCA 4 semesters, बाकी 7 में 2-2)। नाम या संख्या बदलनी हो तो `assets/js/core/programs.js` और Home के cards बदलें।
2. अगर आपने 001-004 SQL पहले ही चला ली थी, तो अब **`005_fix_my_courses.sql`** भी चलाएँ (बिना semester वाले programs के लिए)।
3. असली परीक्षण के लिए site को **Vercel पर deploy** करें (repo जोड़ें)। फिर Supabase में Authentication -> URL Configuration में Site URL और Redirect URLs में वह Vercel पता डालें।
4. `assets/js/core/config.js` में Supabase URL और anon key होनी चाहिए।
5. Privacy और Terms के पेज अभी नहीं बने हैं, इसलिए Registration में उनके links फ़िलहाल नहीं खुलेंगे।
6. Google से login करने वाले की profile में program/semester खाली रहेगा। Dashboard (अगला भाग) में "प्रोफ़ाइल पूरी करें" वाला कदम आएगा।
