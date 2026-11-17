# Phase 6: Contact, Rating, Privacy, Terms, Admin Dashboard

## आम लोगों के पेज
- `pages/contact/`: फ़ॉर्म (नाम, email, संदेश) -> admin के "Contact" में। साथ में WhatsApp/Email/Instagram/YouTube/LinkedIn के links, पर सिर्फ़ वही जो `assets/js/core/config.js` में भरे हों (`CONTACT`)। Bot से बचाव के लिए छिपा खाना।
- `pages/privacy/` और `pages/terms/`: Hindi और English, भाषा बटन के हिसाब से।
- **Rating:** unit पेज पर `<div id="bk-rating"></div>` लिख दें और `assets/js/components/rating.js` जोड़ दें (Phase 7 के template में जुड़ेगा)। Guest और student दोनों रेट कर सकते हैं। (008 के बाद) एक student एक पेज को एक ही बार रेट कर सकता है।

## Admin (सिर्फ़ आप) — `pages/admin/`
login · overview · students · analytics · ratings · banner · messages · contact-messages · typing-leads
- **Students:** खोज, Block/Unblock, Delete (दो बार क्लिक), Message। मोबाइल अधूरा दिखता है।
- **Analytics:** कुल/नए students, typing tests, सबसे ज़्यादा खुली units।
- **Ratings:** हर पेज की औसत और votes, टिप्पणियाँ, हटाने का बटन।
- **Banner:** टेक्स्ट + वैकल्पिक शुरू/खत्म की तारीख़। सबसे नया चालू banner हर पेज पर दिखता है।
- **Messages:** किसी student को संदेश भेजें (उसके Inbox में दिखता है), भेजे हुए संदेशों की सूची।
- **Contact:** Contact फ़ॉर्म के संदेश, Mark read/done, Delete।
- **Typing leads:** guests के नाम, email, रिज़ल्ट। हर एक के आगे Delete और **Export CSV** (CSV में `=`, `+`, `-`, `@` से शुरू होने वाले लिखे गए नाम सुरक्षित कर दिए जाते हैं)।
- Admin पेज सिर्फ़ English में हैं।

## आपको करना है
1. Supabase में **`008_admin_ratings.sql`** चलाएँ (एक बार)। इसके बिना भी Ratings पेज चलता है, पर औसत ब्राउज़र में गिना जाता है।
2. **अपने को admin बनाना** (अगर पहले नहीं किया): `update public.profiles set role='admin' where email='आपका@email';`
3. `assets/js/core/config.js` के `CONTACT` में अपने WhatsApp/Email/Instagram आदि भरें।
4. **Privacy और Terms को किसी जानकार (वकील) से एक बार पढ़वा लें।** मैंने उन्हें आपके फ़ैसलों के हिसाब से लिखा है, पर वे कानूनी सलाह नहीं हैं।

## बाद के लिए
- Contact/Rating/Typing फ़ॉर्म पर spam की रोक के लिए Cloudflare Turnstile (मुफ़्त)।
- `assets/js/pages/legal.js` अभी किसी पेज में नहीं लगी है (Privacy/Terms अब CSS से भाषा बदलते हैं)।
