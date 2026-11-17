# Phase 4 (भाग 2): Student Dashboard

## पेज (सब login माँगते हैं; login नहीं तो login पेज पर भेज देते हैं)
- `pages/student/dashboard/`: नमस्ते, "जहाँ छोड़ा था वहीं से जारी रखें", मेरे कोर्स (progress %), typing का छोटा graph, inbox, bookmarks
- `pages/student/my-courses/`: अपने semester के subjects (अपने-आप) + जोड़े हुए कोर्स। **"+ कोर्स जोड़ें"** में बाकी सारे कोर्स खोज के साथ। जोड़े हुए कोर्स को हटा सकते हैं
- `pages/student/bookmarks/`: सहेजे हुए नोट्स, हटाने का बटन
- `pages/student/inbox/`: admin के संदेश (नया/पढ़ा), खोलते ही "पढ़ा" हो जाता है
- `pages/student/profile/`: नाम, फ़ोटो, मोबाइल, program/semester बदलना, password बदलना, account हटाना ("DELETE" लिखकर)
- `pages/student/typing-history/`: पहले से बना, अब ऊपर के टैब के साथ

## आपको करना है
1. Supabase SQL Editor में **`006_progress_title.sql`** चलाएँ (progress में unit का नाम जोड़ता है)।
2. **`007_subjects_and_placements.sql` चलाएँ**, फिर subjects, courses और placements भरें (`docs/SUBJECTS_GUIDE.md` और `supabase/seed/courses.example.sql`)। इसके बिना "मेरे कोर्स" खाली रहेगा।
3. अगर `004_storage.sql` नहीं चलाई तो फ़ोटो अपलोड नहीं चलेगा।

## Unit पेजों के लिए (Phase 7 के template में जुड़ेगा)
`assets/js/core/progress.js` तैयार है। Unit पेज पर:
```html
<body data-course="pgdca-s2-python">
<script src="/assets/js/core/progress.js"></script>
<script>BKProgress.visit();</script>        <!-- खुलते ही "आखिरी पढ़ी" सहेजता है -->
<!-- "पूरा हुआ" बटन -> BKProgress.complete()   |   बुकमार्क बटन -> BKProgress.toggleBookmark() -->
```
`data-course` में वही `slug` डालें जो `courses` table में है। Guest के लिए ये सब चुपचाप कुछ नहीं करते।

## ध्यान रखें
- Google से login करने वाले की profile में program/semester खाली रहते हैं। Dashboard पर "प्रोफ़ाइल पूरी करें" वाला संदेश दिखता है।
- Admin के संदेश भेजने वाला हिस्सा Phase 6 में बनेगा। तब तक inbox खाली रहेगा।
