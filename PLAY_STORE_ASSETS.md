# Google Play Store Assets: Nomi - Intelligent Traveler Companion 🚀

This document compiles the localized and optimized metadata assets required to publish **Nomi** on the Google Play Console.

---

## 📱 Store Metadata (English - US)

### 1. App Title (Max 30 characters)
**Nomi: Intelligent Travel Guide**

### 2. Short Description (Max 80 characters)
**Your smart companion to scan barcodes, translate signs & outsmart local prices.**

### 3. Full Description (Max 4000 characters)
```text
Unlock the ultimate traveler's advantage with Nomi—your intelligent, pocket-sized nomad companion designed to keep you safe, informed, and ahead of local price markups wherever you go.

Whether navigating bustling street markets, deciphering foreign supermarket shelves, or trying to understand local hazard signs, Nomi uses state-of-the-art serverless intelligence to decode the world around you in real-time.

Key Features:
• INSTANT PRODUCT SCANNER: Scan barcodes of food, medicine, and grocery items. Instantly decode ingredients, find allergens, and look up real-time market value comparisons to avoid paying the "tourist premium."
• SIGN & WARNING TRANSLATOR: Translate transit signs, warning notices, and dining menus in real-time with full contextual translations.
• DEFLATE LOCAL INFLATION: Gain access to authentic, crowd-verified local price indexes. Know exactly what residents pay for food, transport, and essentials so you can shop with confidence.
• INTELLIGENT MULTI-CURRENCY CONVERTER: Set your home residence and Nomi will automatically convert foreign prices to your native currency with up-to-the-minute exchange rates.
• ZERO PLACEHOLDERS, REAL DATA: Built on real-time integrations and structured data stores to deliver accurate local insights, not guesses.
• SEAMLESS BILINGUAL EXPERIENCE: Full, native support for English and Arabic layouts (RTL) with automatic device-language pre-configuration.

Nomi is built for modern nomads, frequent flyers, and global adventurers. Travel smarter, protect your budget, and explore with confidence. Download Nomi today!
```

### 4. App Category & Tags
*   **Primary Category**: Travel & Local
*   **Secondary Category (Optional)**: Tools / Food & Drink
*   **Tags**: Travel companion, Barcode scanner, Translation, Currency converter, Local advisor, Trip budget

### 5. Keywords / Search Terms (Comma-separated)
`travel guide, scan barcode, translation, translate camera, sign translator, currency converter, exchange rate, tourist price, local market price, save money traveling, arab travel, travel utility, pocket translation, grocery scanner`

---

## 🇸🇦 Store Metadata (Arabic - Localized)

### 1. App Title (Max 30 characters)
**Nomi: رفيق السفر الذكي**

### 2. Short Description (Max 80 characters)
**رفيقك الذكي لمسح باركود المنتجات، ترجمة اللافتات، وتجنب فخاخ أسعار السياح.**

### 3. Full Description (Max 4000 characters)
```text
احصل على الميزة المثالية لكل مسافر مع Nomi — رفيقك الذكي المحمول والمصمم لضمان سلامتك، وإبقائك على اطلاع دائم، ومساعدتك على تجنب مغالاة الأسعار محلياً أينما ذهبت.

سواء كنت تتجول في الأسواق الشعبية المزدحمة، أو تحاول فك رموز السلع في المتاجر الأجنبية، أو تسعى لفهم لافتات التحذير المحلية، فإن Nomi يوفر لك تحليلاً ذكياً وفورياً لفك رموز العالم من حولك.

الميزات الأساسية:
• مسح باركود المنتجات فوراً: امسح باركود الأطعمة والأدوية ومستلزمات البقالة. اكتشف المكونات، ومسببات الحساسية، واطلع على مقارنات الأسعار الواقعية لتجنب دفع الفوارق السياحية المبالغ فيها.
• مترجم اللافتات والتحذيرات: ترجم لافتات المرور، ملصقات التحذير، وقوائم الطعام في الوقت الفعلي مع ترجمة دقيقة تتناسب مع سياقها.
• تجنب فخاخ الأسعار: اطلع على مؤشرات أسعار السلع المحلية الموثوقة والحقيقية. اعرف ما يدفعه السكان المحليون تماماً مقابل الطعام والمواصلات والخدمات الأساسية لتتسوق بكل ثقة.
• تحويل العملات الذكي: حدد بلد إقامتك وسيقوم Nomi تلقائياً بتحويل أسعار العملات الأجنبية إلى عملتك المحلية بناءً على أحدث أسعار الصرف المحدثة.
• تجربة ثنائية اللغة بالكامل: دعم كامل للواجهتين العربية (RTL) والإنجليزية (LTR) مع تهيئة تلقائية ذكية وفقاً للغة جهازك.

تم تصميم Nomi للمسافرين العصريين، دائمي السفر، والباحثين عن مغامرات عالمية. سافر بذكاء أكبر، واحمِ ميزانيتك، واستكشف العالم بثقة. حمل Nomi اليوم!
```

### 4. Keywords (Arabic)
`دليل السفر, مسح باركود, ترجمة الكاميرا, مترجم لافتات, تحويل العملات, أسعار الصرف, سعر سياحي, توفير المال, رفيق المسافر, أسعار العملات, مقارنة أسعار`

---

## 🔒 Privacy Policy Summary (For Play Console Declaration)

*   **Data Collection**:
    *   **Device Camera & Storage**: Used strictly on-device to capture packaging barcodes and street signs for OCR processing. Images are processed statelessly or securely stored in user-owned cloud buckets according to authorization. No personal media is collected.
    *   **User Preferences**: Country residence, currency, and language selections are stored locally on-device (`localStorage`) to persistent user profiles in Google Cloud Firestore for personal customization.
    *   **Location**: No continuous background location tracking. Approximate country detection is calculated through secure IP metadata to set base conversion rates on first launch.
*   **Data Sharing**: None. No user data is rented, sold, or shared with third-party ad networks.

---

## 📦 Version 1.0 Release Notes (Changelog)

### English (US)
```text
• Brand new release of Nomi!
• Beautiful, modern onboarding flow that automatically pre-configures your app language based on your device.
• Full Right-to-Left (RTL) Arabic layout and English LTR visual modes.
• Real-time high-resolution rear camera constraints optimized for native Android devices.
• Seamless barcode scanning, product translation, and local price deflation indexes.
• Fully integrated with persistent Cloud Firestore database and secure local preferences.
```

### Arabic
```text
• الإطلاق الرسمي الأول لتطبيق Nomi!
• واجهة تهيئة وتهنئة عصرية تقوم بضبط لغة التطبيق تلقائياً بناءً على إعدادات جهازك.
• دعم كامل للتنسيق من اليمين إلى اليسار (RTL) للغة العربية ومن اليسار إلى اليمين للغة الإنجليزية.
• تحسين إعدادات الكاميرا الخلفية وتوجيهها لتوفير مسح دقيق وعالي الوضوح على أجهزة أندرويد.
• مسح باركود المنتجات فوراً، ترجمة التحذيرات واللافتات، ومقارنة العملات والأسعار المحلية.
• مزامنة تامة ومستمرة مع قاعدة بيانات Cloud Firestore السحابية وحفظ تفضيلاتك محلياً.
```
