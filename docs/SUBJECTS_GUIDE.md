# Subjects: नया subject कैसे जोड़ें और branch में कैसे लगाएँ

## सिद्धांत
- **हर subject एक ही जगह रहता है:** `programs/<subject>/`
- **Branch (PGDCA, DSML...) के कोई folder या पेज नहीं।** `/branch/?b=pgdca` एक ही सामान्य पेज है, जो database से पढ़ता है।
- **कौन सा subject किस branch और semester में है,** यह database की `course_placements` तालिका तय करती है। इसे कभी भी बदल सकते हैं, content हिलाना नहीं पड़ता।
- **Hindi और English अलग-अलग कोर्स हैं** (java-en, java-hi)। Student का माध्यम तय करता है कि उसके branch के subjects किस भाषा में दिखें।

## Folder का ढाँचा
```
programs/
  python/
    index.html            <- subject का पेज (units की सूची), English
    index_hindi.html      <- Hindi
    unit_1.html           <- English
    unit_1_hindi.html     <- Hindi
    unit_2.html
  java/
    ...
```
नाम छोटे अक्षरों में, शब्दों के बीच `-`। Folder का नाम = subject का `slug`। **एक बार पते तय करके फिर न बदलें**, वरना students के bookmarks और "जहाँ छोड़ा था" टूट जाते हैं।

## नया subject जोड़ने के 4 कदम
1. **Folder और units बनाएँ:** `programs/html/unit_1.html` ... (Hindi हो तो `unit_1_hindi.html` भी)।
2. **`subjects` में एक पंक्ति:** slug = folder का नाम।
3. **`courses` में हर भाषा की एक पंक्ति:** `html-en` (path `/programs/html/`, total_units = units की संख्या), और Hindi हो तो `html-hi`।
4. **`course_placements` में पंक्तियाँ:** हर branch+semester के लिए जहाँ यह लगना है। **किसी branch में न लगाएँ** तो यह Individual Course है, जो सिर्फ़ "+ कोर्स जोड़ें" में दिखेगा।

तैयार उदाहरण: `supabase/seed/courses.example.sql` (007 के बाद चलाएँ)।

## सबसे आसान: Admin > Subjects पेज
SQL लिखे बिना, फ़ॉर्म से: subject जोड़ना, हर भाषा का कोर्स (path और units) जोड़ना-बदलना, branch और semester में लगाना, नाम बदलना, हटाना। हर path के आगे "page found / not found" भी दिखता है, ताकि गलत पता तुरंत पकड़ में आए। इसके लिए Supabase में **`009_admin_subjects.sql`** एक बार चलानी होती है। जो subject कहीं नहीं लगा, वह अपने-आप Home पर "अलग-अलग कोर्स" में दिखता है।

## बाद में बदलाव
| काम | कैसे |
|---|---|
| Java को PGDCA सेमेस्टर 2 से 3 में ले जाना | `course_placements` में उस पंक्ति का `semester` बदलें |
| Python को DSML में भी लगाना | `course_placements` में एक नई पंक्ति |
| Hindi वर्ज़न तैयार हो गया | `courses` में `java-hi` की पंक्ति जोड़ें। Hindi माध्यम वाले को अपने-आप वही दिखने लगेगा |
| Units की संख्या बदली | `courses.total_units` बदलें, progress % अपने-आप ठीक हो जाएगा |

इन्हें Supabase के **Table Editor** से सीधे भी बदल सकते हैं।

## Unit पेज में (Phase 7 के template में जुड़ेगा)
```html
<body data-course="python-hi">      <!-- Hindi unit पर *-hi, English unit पर *-en -->
```
Hindi और English की progress अलग-अलग गिनी जाती है।

## Student को क्या दिखता है
- **अपने branch+semester के subjects अपने-आप**, अपने माध्यम में। Hindi वर्ज़न न हो तो English और छोटा संदेश।
- **"+ कोर्स जोड़ें" में** बाकी सारे कोर्स, हर भाषा अलग ("Java English", "Java Hindi")।
