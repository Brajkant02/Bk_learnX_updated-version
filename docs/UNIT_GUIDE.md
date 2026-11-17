# Unit template: नया subject और उसके units कैसे बनाएँ

## एक subject बनाने का सबसे आसान तरीका (tool)
Python चालू हो तो terminal में, repo के folder में:
```
python tools/new_subject.py python "Python" --units 10 --hindi
python tools/new_subject.py java "Java" --units 8 --titles "परिचय,Constructs,Classes,Inheritance,Abstract,Polymorphism,Exceptions,Threads"
```
- `programs/<slug>/` में `index.html`, `unit_1.html` ... `unit_N.html` बन जाते हैं। `--hindi` लगाएँ तो `index_hindi.html` और `unit_1_hindi.html` ... भी।
- `--titles "A,B,C"` से units के नाम, `--titles-hi` से Hindi नाम, `--desc` से Google के लिए एक लाइन।
- **टर्मिनल के अंत में SQL छपती है।** उसे Supabase के SQL Editor में चला दें, तो subject और उसके courses (हर भाषा का एक) दर्ज हो जाते हैं। फिर `course_placements` में बताएँ कि यह किस branch और semester में लगेगा।
- मौजूदा फ़ाइलें कभी नहीं मिटतीं (`--force` से ही बदलेंगी)।

Python न चलाना हो तो `programs/sample-subject/` को कॉपी करके नाम बदलें, और हर फ़ाइल में `data-course`, `data-subject`, `data-subject-name`, `data-unit`, `data-units` बदलें।

## आप सिर्फ़ यह लिखते हैं
हर `unit_N.html` में `<article>` के अंदर `<!-- YOUR NOTES START HERE -->` और `END` के बीच। **बाकी सब अपने-आप आता है:** header, footer, रास्ता (Home > Subject > Unit), विषय-सूची (3 या ज़्यादा `<h2>` हों तो), "पिछली/अगली", "पूरा हुआ" बटन, सहेजना (bookmark), Hindi/English बदलने का बटन, रेटिंग, और code में Copy बटन।

### Content में क्या चलता है
`<h2>`, `<h3>`, `<p>`, `<ul>`, `<ol>`, `<table>` (मोबाइल पर खिसकती है), `<pre><code>`, `<img>` (अपने-आप छोटी/बड़ी), `<figure>`+`<figcaption>`, `<details>`, और रंगीन बॉक्स: `<div class="note">`, `class="tip"`, `class="warn"`।
- Images को `assets/images/` या subject के folder में रखें, और `loading="lazy"` लगाएँ। चित्र का `alt` ज़रूर लिखें।
- **PDF का बटन:** `<body ... data-pdf="/programs/java/pdf/unit-1.pdf">` लिख दें।
- Subject पेज (`index.html`) में units की सूची `<ol id="bk-units">` में है। नाम बदलने हों तो वहीं बदलें। Login किए student को वहाँ ✓, प्रगति पट्टी और "जारी रखें" अपने-आप दिखते हैं।

## नियम (ज़रूरी)
- फ़ाइल के नाम: `unit_1.html` (English), `unit_1_hindi.html` (Hindi)। नाम बाद में न बदलें, वरना students के bookmarks और "जहाँ छोड़ा था" टूट जाएँगे।
- `data-course` में वही `slug` हो जो `courses` तालिका में है (`python-en`, `python-hi`)। Hindi और English की प्रगति अलग गिनी जाती है।
- `data-units` में सही कुल संख्या रखें। यही "अगली" और "सारी यूनिट" का फ़ैसला करती है।
- Hindi/English का बटन तभी दिखता है जब दूसरी भाषा की वही फ़ाइल सच में मौजूद हो।
- `programs/sample-subject/` एक **नमूना** है। असली subjects बनाने के बाद इसे हटा दें।

## अलग से
`.vercelignore` में `docs`, `supabase` और `tools` हैं, इसलिए वे इंटरनेट पर नहीं दिखेंगे।
