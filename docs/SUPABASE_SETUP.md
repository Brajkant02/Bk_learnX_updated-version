# Supabase Setup (एक बार का काम)

## 1. Project बनाना
1. supabase.com पर खाता बनाएँ, **New project** (Region: Mumbai / ap-south-1)।
2. Database password सुरक्षित जगह रखें (GitHub पर नहीं)।

## 2. Database
**SQL Editor** में इस क्रम से एक-एक file paste करके Run करें:
1. `supabase/migrations/001_tables.sql`
2. `supabase/migrations/002_functions.sql`
3. `supabase/migrations/003_security.sql`
4. `supabase/migrations/004_storage.sql`
5. अपने courses के साथ `supabase/seed/courses.example.sql` (पहले उसे अपने असली subjects से बदलें)

## 3. Login सेटिंग (Authentication)
- **Providers → Email:** ON, **Confirm email:** ON, password की न्यूनतम लंबाई **8**।
- **Providers → Google:** Google Cloud Console में OAuth Client ID बनाएँ (Web)।
  Supabase में दिखा *Callback URL* वहाँ "Authorized redirect URI" में डालें, फिर Client ID और Secret Supabase में भरें।
- **URL Configuration:** *Site URL* = आपकी site का पता। *Redirect URLs* में डालें:
  `https://आपकी-site/pages/student/dashboard/` और `https://आपकी-site/pages/auth/login/`
  (testing के लिए Vercel preview URL भी)।

## 4. Email OTP (Password reset)
1. **Authentication → Emails → SMTP:** Custom SMTP चालू करें (Brevo या Resend की SMTP details)।
   Supabase का अपना email बहुत सीमित है, इसलिए यह ज़रूरी है।
2. **Email Templates → Reset Password** में body ऐसी करें, ताकि link की जगह OTP जाए:
   ```html
   <h2>BK LearnX password reset</h2>
   <p>आपका OTP: <b>{{ .Token }}</b></p>
   <p>यह 10 मिनट में समाप्त हो जाएगा। आपने नहीं माँगा तो इसे अनदेखा करें।</p>
   ```
3. **Authentication → Providers → Email → OTP expiration:** 600 सेकंड।

## 5. Admin बनाना (आप)
1. अपनी site (या Supabase Auth) से अपने email से एक बार registration करें।
2. SQL Editor में चलाएँ (अपना email डालें):
   ```sql
   update public.profiles set role = 'admin' where email = 'aapka@email.com';
   ```
(Role बदलने का यही एक तरीका है। Student इसे अपने आप नहीं बदल सकता।)

## 6. Frontend से जोड़ना
`assets/js/core/config.js` में **Project URL** और **anon key** डालें
(Project Settings → API)। `service_role` key कभी frontend में न डालें।

## 7. जाँच सूची
- [ ] Registration के बाद profile बनती है (Table Editor → profiles)
- [ ] Email verify, फिर login चलता है
- [ ] Google login चलता है
- [ ] Forgot password: OTP email आता है, OTP से नया password बनता है
- [ ] एक student दूसरे का data नहीं देख पाता
- [ ] Student role/blocked खुद नहीं बदल पाता
- [ ] Account delete करने पर profile और सारा data हट जाता है
- [ ] Admin के लिए `admin_list_students()` में mobile अधूरा दिखता है

## बाद के phases के लिए
- **Mobile OTP:** SMS सेवा (MSG91/Twilio) चाहिए, पैसे लगेंगे।
- **Bots से बचाव:** Guest के typing/contact/rating forms पर Cloudflare Turnstile (मुफ़्त)।
- **APK में Google login:** Capacitor में deep-link redirect अलग से सेट होगा (Phase 8)।
