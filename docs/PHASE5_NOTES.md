# Phase 5: Typing system

## पेज (पुराने URLs वही हैं)
- `typing/1-exam-selection.html`: 12 exams, भाषा, अनुच्छेद का प्रकार, समय (5/10/15 मिनट)
- `typing/2-typing-test.html`: टेस्ट (timer, live speed/शुद्धता/गलतियाँ, दो तरीके: अनुच्छेद के ऊपर / टेक्स्ट बॉक्स)
- `typing/3-result.html`: रिज़ल्ट
- `pages/student/typing-history/`: रोज़ का graph (WPM, Accuracy, Mistakes, Tests) और हाल के टेस्ट। तारीख़ `4.11.26` जैसी।

## Guest और login
- **Guest:** टेस्ट से पहले नाम + email, साथ में सहमति की लाइन। रिज़ल्ट सिर्फ़ result पेज पर दिखता है। पेज छोड़ने या refresh के बाद नहीं मिलता। नाम, email और रिज़ल्ट `typing_leads` में admin के लिए सहेजे जाते हैं।
- **Login:** नाम/email नहीं माँगा जाता। हर रिज़ल्ट `typing_results` में सहेजा जाता है, और history/graph में दिखता है।

## गिनती का तरीका (पुराने से बदला है)
पुरानी site हर अक्षर को उसकी जगह से मिलाती थी, इसलिए एक अक्षर छूटने पर आगे सब गलत गिना जाता था। अब परीक्षा के software की तरह **शब्द-शब्द** मिलान होता है।
- Gross WPM = (टाइप किए अक्षर / 5) ÷ मिनट
- Net WPM = Gross - (गलत शब्द ÷ मिनट)
- Accuracy = सही शब्द ÷ टाइप किए शब्द
- Pass = Net WPM >= लक्ष्य। SSC CGL DEST में लक्ष्य 2,000 key depressions।
- लक्ष्य (35/30, 30/25 आदि) पुरानी site से लिए हैं। इन्हें अपनी असली exam सूचना से मिला लें: `assets/js/typing/data.js`

## आपको करना है
1. **अनुच्छेद बढ़ाएँ।** अभी पुरानी site के सिर्फ़ 8 अनुच्छेद हैं (हर भाषा में 4)। `assets/js/typing/data.js` में और जोड़ें। जितने ज़्यादा, उतना बेहतर अभ्यास। टेस्ट कई अनुच्छेद जोड़कर लंबी धारा बनाता है।
2. Privacy पेज अभी नहीं बना (guest की सहमति वाली लाइन उसी का link देती है)। यह Phase 6 में आएगा।
3. Dashboard में graph का छोटा संस्करण Student Dashboard बनते समय जुड़ेगा। अभी पूरा graph `pages/student/typing-history/` पर है।

## पुराने से जो नहीं लिया
- Google Analytics का कोड (`gtag`)। चाहें तो बाद में एक जगह से सब पेजों पर जुड़ सकता है।
