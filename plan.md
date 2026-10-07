# FORM / FRAME — ویب سائٹ کا منصوبہ

## مقصد اور عمل درآمد

منسلک brief کے مطابق **FORM / FRAME** ایک fictional مگر قابلِ فروخت موشن/فلم پروڈکشن اسٹوڈیو کی premium کاروباری ویب سائٹ ہوگی۔ سورس کوڈ اور ویب سائٹ کی تحریر انگریزی میں؛ گفتگو اردو میں رہے گی۔ App Router کے ساتھ Next.js، React، TypeScript، Tailwind CSS، Framer Motion، Lucide Icons استعمال ہوں گے۔

### صفحات اور افعال

`/` پر hero/services/work/process/CTA، `/about` پر story/timeline، `/services` پر تفصیل، `/projects` پر filterable portfolio، `/projects/[slug]` پر ہر کام کا detail، `/contact` پر حقیقی inquiry form، `/atelier/console` پر navigation سے مخفی admin login/dashboard، اور `not-found.tsx` میں branded 404۔ تمام حقیقی App Router page routes سمیت dynamic detail pattern `public/manus-routes.json` میں درج ہوگا؛ API، assets اور الگ 404-only handler اس route manifest سے خارج رہیں گے۔

### Admin، فارم اور پائیدار ڈیٹا

Admin URL کا مخفی ہونا صرف navigation کی بات ہے، authentication کا متبادل نہیں۔ Default provider کے طور پر Manus OAuth استعمال ہوگا۔ OAuth start attempts hashed connection bucket پر 10 منٹ میں 12 تک محدود ہوں گے؛ configured production rate limiting کے لیے durable KV درکار ہوگا۔ OAuth `state` ایک مختصر مدتی single-use HttpOnly cookie سے browser کے ساتھ bind ہوگا، callback میں authorization code server-side exchange اور OpenID/email owner allowlist کے بعد ہی 8 گھنٹے کی HMAC-signed application session ملے گی۔ کوئی default password یا development bypass نہیں ہوگا۔ Manus Preview کی `webdev_app_session` JWT کو اگر injected کیا جائے تو HS256، expiry، project ID اور وہی allowlist verify کی جائے گی۔ HTTPS میں `Secure; SameSite=None` ہوگا تاکہ embed Preview میں session ممکن ہو؛ plain HTTP local development میں `SameSite=Lax` رہے گی۔ تمام admin writes same-origin validation سے گزریں گی۔

Admin سے brand/SEO، hero، About، فون/email/address، services، projects اور ان کے detail/covers کی تدوین، add/remove اور save ممکن ہوگا۔ Contact API email/field length validation اور honeypot کے ساتھ requests مستقل رکھے گی؛ admin inbox صرف status update کرے گی، delete نہیں۔ Production persistence کے لیے Upstash/Vercel KV compatible REST keys (`KV_REST_API_URL`, `KV_REST_API_TOKEN`) استعمال ہوں گے؛ local Termux میں ignored `data/` JSON fallback ہوگا۔ Production میں KV غیر موجود ہو تو write APIs کامیابی کا جھوٹا جواب دینے کے بجائے واضح 503 دیں گی۔

### موشن، آواز اور رسائی

Framer Motion کے page/scroll reveals، staggered animation، restrained parallax اور hover depth استعمال ہوں گے؛ reduced-motion setting کا احترام ہوگا۔ “Spatial sound” user-activated Web Audio toggle سے مختصر click tones دے گا، autoplay نہیں۔ Keyboard navigation، focus styles، mobile menu، field labels/validation feedback اور responsive layouts رکھے جائیں گے۔

### ڈیزائن سمت

- **Design Movement:** cinematic motion identity، editorial Swiss layout اور sophisticated glassmorphism۔
- **Core Principles:** art direction، مقصد والی حرکت، translucent depth، واضح conversion path۔
- **Color Philosophy:** near-black/graphite پس منظر سنجیدہ سینیمیٹک ماحول بنائے؛ violet روشنی تخلیقی توانائی، lime مختصر signal/CTA accent بنے۔
- **Layout Paradigm:** غیر متوازن editorial hero، متبادل feature strips، staggered service list، split contact؛ مرکزی برابر cards کا مسلسل grid نہیں۔
- **Signature Elements:** frame-corner نشانات، orbit/timeline line، violet edge والی frosted glass surfaces۔
- **Interaction Philosophy:** meaningful hover depth، واضح buttons، sound صرف opt-in، ہر interaction کے keyboard متبادل۔
- **Animation:** 180–700ms، نرم ease، reveal ایک بار، بہت محدود parallax؛ reduced-motion میں motion کم/بند۔
- **Typography:** Space Grotesk display + DM Sans body، بڑے editorial headings اور صاف پڑھنے کے قابل body copy؛ Google Fonts stylesheet کے ساتھ local fallbacks۔
- **Brand Essence:** “A motion studio turning ambitious stories into high-impact visual systems.” شخصیت: cinematic، exacting، curious۔
- **Brand Voice:** vivid اور مختصر؛ “Make the impossible feel inevitable.” / “A sharper cut. A bigger feeling.”
- **Wordmark & Logo:** FORM / FRAME کے لیے interlocking film-frame corner marks، جو الگ SVG brand mark میں ہوں گے۔
- **Signature Brand Color:** electric violet `#8C70FF`؛ lime `#D2FA6B` بطور ثانوی signal accent۔

### Source structure اور serving

`src/app/` میں تمام page اور API routes؛ `src/components/` میں navigation، cinematic sections، forms، inbox/admin اور audio control؛ `src/lib/` میں schema/seed content، OAuth/session security، validation اور KV/local adapters؛ `public/images/` میں portable SVG art، brand files اور route manifest؛ root میں docs، pinned npm lockfile، `.env.example` اور project config۔ Generated managed-storage assets کی portability Vercel/GitHub سے مختلف ہے، اس لیے GitHub/Termux version اپنی local vector artwork استعمال کرے گا۔

Next.js Node runtime server/API دے گا، page data تازہ رہنے کے لیے dynamic rendering ہوگا۔ Upstash REST سرور پر ہی fetch ہوگا؛ credentials browser میں نہیں جائیں گے۔ npm package manager/version `package.json` میں pin اور lifecycle script policy `.npmrc` میں درج ہوگی۔

### Deployment، secret boundaries اور Termux

`.env.local` Git سے باہر رہے گی۔ Required OAuth identity config: `MANUS_PROJECT_ID`, `MANUS_OAUTH_PORTAL_URL`, `MANUS_OAUTH_API_URL`, `ADMIN_ALLOWED_EMAILS` یا `ADMIN_ALLOWED_OPEN_IDS`, اور الگ HMAC `ADMIN_SESSION_SECRET`; optional Preview-JWT verification key `MANUS_JWT_SECRET`; cloud persistence کے لیے `KV_REST_API_URL` اور `KV_REST_API_TOKEN`۔ Git source میں کوئی secret، database dump، runtime message یا `node_modules` نہیں جائے گا۔ README میں Termux install، private env setup، `npm ci`, `npm run dev`, `npm run typecheck`, `npm run build` شامل ہوگا۔ عوامی GitHub repo user کی explicit منظوری کے مطابق ہوگا؛ open-source license خود سے منتخب نہیں کیا جائے گا۔
