# App: फ़ोन पर install करना और APK बनाना

## 1. बिना कुछ किए: "App की तरह install" (PWA)
Site अब खुद एक app की तरह install हो सकती है।
- **Android (Chrome):** site खोलें, नीचे footer में **"ऐप इंस्टॉल करें"** दिखे तो दबाएँ। (या Chrome मेन्यू > Install app / Add to Home screen)
- **iPhone (Safari):** Share बटन > **Add to Home Screen**।
- Install के बाद BK LearnX अपने आइकन, बिना address bar के खुलता है।
- **ऑफ़लाइन:** जो पेज आपने पहले खोले हैं (notes, typing पेज, Home) बिना इंटरनेट के भी खुलते हैं। नया पेज ऑफ़लाइन खोलें तो "आप ऑफ़लाइन हैं" वाला पेज दिखता है। Login, progress सहेजना, typing के रिज़ल्ट सहेजना और rating के लिए इंटरनेट चाहिए (ये ऑफ़लाइन कतार में नहीं रखे जाते)।
- Admin पेज कभी फ़ोन में सहेजे नहीं जाते। Supabase या किसी और site का कुछ भी सहेजा नहीं जाता।

## 2. APK बनाना (Android app की फ़ाइल)
Android Studio की ज़रूरत नहीं। GitHub खुद बना देता है:
1. अपना project GitHub पर push करें (इस folder के साथ `app/` और `.github/` भी)।
2. GitHub में **Actions** टैब > **Build Android APK** > **Run workflow**।
3. दो चीज़ें चुनें:
   - **mode = live** (मेरी सलाह): app आपकी वेबसाइट खोलता है। नए notes डालते ही सबको दिखते हैं, **APK दोबारा नहीं बनाना पड़ता**। पहले खोले पेज ऑफ़लाइन भी चलते हैं। साथ में **site_url** में अपनी site का पता (https://...) डालें।
   - **mode = bundled:** सारे पेज APK के अंदर पैक होते हैं, पूरा app ऑफ़लाइन खुलता है। पर **हर नया note डालने पर नया APK बनाकर students को देना पड़ेगा**, वरना पुराने APK में पुराने notes ही दिखेंगे।
4. 6 से 10 मिनट बाद वही run खोलें, नीचे **Artifacts** में `BK-LearnX-debug-apk` को download करें (zip के अंदर `app-debug.apk`)।
5. फ़ोन में APK खोलें। "Unknown sources / इस स्रोत से install" की अनुमति देनी होगी।

### इसके बारे में सच्ची बातें
- यह **test (debug) APK** है। दोस्तों और students को सीधे बाँटने के लिए ठीक है, पर **Play Store पर नहीं चढ़ेगा**। Play Store के लिए हस्ताक्षर वाला (signed) release, Google का developer खाता (एक बार ~$25) और app की जानकारी चाहिए। वह अगला कदम है, जब आप कहें।
- **Google login app के अंदर अभी नहीं है।** App में Email+Password और OTP चलते हैं (Google का बटन वहाँ छिपा रहता है)। वेबसाइट पर Google login वैसे ही चलता है।
- **मैंने यह workflow GitHub पर चलाकर नहीं देखा** (मेरे पास Android SDK नहीं है)। मैंने सिर्फ़ Capacitor 8.6.2 से असली Android project बनाकर जाँचा कि आइकन और splash सही फ़ोल्डरों में बैठते हैं। पहली बार चलाने पर कोई error आए तो उसका text भेज दीजिए, मैं ठीक कर दूँगा।
- Android 12 और ऊपर पर शुरुआती splash का रंग/आइकन थोड़ा अलग दिख सकता है (सिर्फ़ सजावट)।
- **appId** `com.bklearnx.app` है (`app/capacitor.config.json`)। Play Store पर डालने से **पहले** बदलना हो तो बदल लें, बाद में नहीं बदलता।
- आइकन अभी "BK" वाला है। असली logo आने पर `assets/icons/` (वेबसाइट के लिए) और `app/resources/` (app के लिए) की PNG बदलें।

## 3. अपने कंप्यूटर पर APK बनाना (वैकल्पिक)
Node 22, Java 21 और Android Studio चाहिए।
```
cd app
npm install
APP_MODE=live SITE_URL=https://आपकी-site npm run configure
npm run build:www
npx cap add android
python android-branding.py        # आइकन और splash (pip install pillow)
npx cap sync android
npx cap open android              # Android Studio खुलेगा > Build > Build APK
```

## 4. जानने लायक
- `sw.js` में `VERSION = "bk-v1"` है। किसी बड़े बदलाव के बाद सबको नई फ़ाइलें दिलानी हों तो इसे `bk-v2` कर दें।
- CSS/JS अपने-आप नई हो जाती हैं (अगली बार खोलने पर)। चित्र और fonts एक बार सहेजे जाते हैं।
- नए पेज हाथ से बनाएँ तो `python tools/prepare_head.py` चला दें (manifest, आइकन आदि जुड़ जाएँगे)। `node tools/check-links.mjs` टूटे links ढूँढता है।
- Site अब Google Fonts या किसी CDN से कुछ नहीं माँगती। Fonts और supabase-js अपनी ही फ़ाइलों में हैं।
- Confirmation email का link app नहीं, वेबसाइट पर खुलता है। इसके लिए `config.js` में `SITE_URL: "https://आपकी-site"` जोड़ें।
