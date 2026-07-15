import React, { createContext, useContext, useState, useEffect } from "react";
import { auth, db } from "./firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export type Language = "en" | "ar";

interface LanguageContextProps {
  language: Language;
  setLanguage: (lang: Language) => Promise<void>;
  t: (key: string, variables?: Record<string, string | number>) => string;
  dir: "ltr" | "rtl";
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

// Core translation dictionary for English and Arabic
const TRANSLATIONS: Record<Language, Record<string, string>> = {
  en: {
    // App & Shell Headers & Nav
    "app.title": "Nomi",
    "app.tagline": "Travel Intelligence",
    "app.live_feed": "Nomi Live Feed Active",
    "app.companion": "Nomi Travel Companion",
    "app.companion_desc": "A premium full-stack mobile system built for international nomads to instantly scan barcodes, translate warning signs, track authentic costs, and outsmart local price inflation.",
    "app.gps_hub": "GPS State Hub",
    "app.curr_dest": "Current Destination:",
    "app.local_curr": "Local Currency:",
    "app.home_curr": "Home Base Currency:",
    "app.sim_rate": "Simulated Rate:",
    "app.mobile_sim": "Production-grade mobile simulator. Designed for iOS & Google Play.",
    "app.guide_title": "Nomi Companion Guide",
    "app.guide_desc": "All 8 screens are fully realized and connected. Here is how to access them:",
    "app.guide.home": "Home: Core travel advisory widget, local weather and recent scans.",
    "app.guide.explore": "Explore: Segmented cards for supermarkets and landmarks with live GPS map pins.",
    "app.guide.scan": "Scan View: Click preset tiles to decode products using server-side Gemini.",
    "app.guide.details": "Product Details: Tap any item under 'Recent Scans' or scan any product.",
    "app.guide.add_price": "Add Price Form: Access via Home or details cards.",
    "app.guide.translate": "Translate: Manual translations or instant sign presets.",
    "app.guide.profile": "Passport (Profile): View contribution counts and unlocked badges.",
    "app.guide.settings": "Settings: Tap the top-right header gear to select home currency and test connectivity.",
    "app.server_test": "Server Test:",
    "app.server_test_desc": "Go to settings and hit 'Test Server Connection' to verify connection states live!",
    "nav.home": "Home",
    "nav.explore": "Explore",
    "nav.translate": "Translate",
    "nav.passport": "Passport",
    "nav.active_dest": "Active Destination",
    "nav.home_residence": "Home Residence",

    // HomeView
    "home.greeting": "Hello, Traveler! 👋",
    "home.explorer_level": "Level 4 Global Explorer",
    "home.exploring_in": "You are currently exploring in",
    "home.progress_lvl": "Progress to Level {level}",
    "home.instant_calc": "Instant Currency Conversion",
    "home.calc_amount": "{currency} ({symbol}) Amount",
    "home.calc_converted": "Converted {currency} ({symbol})",
    "home.calc_rates_desc": "Based on verified mid-market rates: 1 {home} = {rate} {dest}",
    "home.checklist_title": "{country} Core Travel Custom Checklist",
    "home.hygiene": "Hygiene Level",
    "home.tipping": "Tipping Culture",
    "home.tap_water": "Tap Water Safety",
    "home.card_payments": "Card Payments",
    "home.guideline_title": "Traveler Intelligence Guideline",
    "home.view_trusted": "View all regional trusted markets & attractions",
    "home.recent_scans": "Recent Supermarket Scans",
    "home.scan_new": "Scan New",
    "home.spotted_cheaper": "Spotted a cheaper local rate?",
    "home.spotted_desc": "Help fellow travelers bypass inflated gift shops. Add your price log now!",
    "home.add_price_btn": "Add Price",
    "home.verified_at": "Verified at",

    // ScanView
    "scan.title": "Lens Scanner & Barcode Reader",
    "scan.subtitle": "Capture packaging or barcodes to instantly decode ingredients and bypass tourist price traps.",
    "scan.iframe_alert": "Browser iframe policies block direct camera streaming. For the full live webcam view, click the link to open this app in a new tab. Otherwise, tap 'Snap with System Camera' below to open your phone's native camera directly!",
    "scan.iframe_link": "Open App in New Tab",
    "scan.initializing": "📸 Initializing optical sensor...",
    "scan.connecting": "🛰️ Connecting to Gemini Vision...",
    "scan.reading": "🔍 Reading product labels & barcode lines...",
    "scan.local_resolver": "🛰️ Local database resolver active...",
    "scan.ai_decoding": "Gemini 3.5 AI is decoding the packaging...",
    "scan.req_auth": "Requesting Camera Authorization...",
    "scan.req_auth_desc": "Please grant camera permissions when prompted.",
    "scan.blocked": "Camera Live Stream Blocked",
    "scan.blocked_desc": "Webcam stream is blocked or denied. On mobile devices, tap Snap with System Camera to trigger the real phone camera directly!",
    "scan.unsupported": "Live Streaming Not Supported",
    "scan.unsupported_desc": "Your browser does not support real-time camera preview. Use your device's native system camera to snap a photo!",
    "scan.snap_system": "Snap with System Camera",
    "scan.retry_feed": "Retry Live Feed",
    "scan.live_active": "Live webcam active",
    "scan.webcam_standby": "Webcam standby / blocked",
    "scan.turn_off": "Turn Off Webcam",
    "scan.turn_on": "Turn On Webcam",
    "scan.snap_photo": "Snap Photo",
    "scan.pick_gallery": "Pick from Gallery",
    "scan.presets_title": "Quick Scan Presets ({country})",
    "scan.presets_desc": "No physical package nearby? Simulate a pixel-perfect snapshot of items matching your current destination:",
    "scan.did_you_know": "Did you know?",
    "scan.advisory": "Shops in high-traffic tourist hotspots like train stations or temple gates mark up items up to 150%. Always compare scanned values before buying.",
    "scan.preset.country": "Country: {code}",

    // ProductDetailsView
    "details.no_selected": "No Product Selected",
    "details.no_selected_desc": "Scan an item or browse the price lists to see full traveler reports.",
    "details.go_scan": "Go to Scan",
    "details.back_catalog": "Back to Catalog",
    "details.verified": "Traveler Verified",
    "details.brand": "Brand:",
    "details.barcode_identified": "Barcode Identified",
    "details.local_retail_cost": "Local retail cost",
    "details.converted_cost": "Your converted cost",
    "details.home": "Home",
    "details.dossier": "Local Traveler Dossier",
    "details.logged_by": "Logged By:",
    "details.date": "Date:",
    "details.availability": "Estimated Availability & Trust",
    "details.in_area": "In Area",
    "details.no_markets": "No regional supermarkets cached. Check Explorer tab.",
    "details.trust": "{percent}% Trust",
    "details.price_level": "Price level:",
    "details.available": "Available",
    "details.view_map": "View on Map",
    "details.different_rate": "Spotted a different rate? Submit",
    "details.shared_clip": "Travel report shared to clipboard! Ready to send to trip group chat.",
    "verdict.excellent": "Excellent Deal (Local Rate)",
    "verdict.premium": "Premium/Luxury Item",
    "verdict.fair": "Fair Standard Price",

    // AddPriceView
    "add.cancel": "Cancel",
    "add.contribute_rate": "Contribute Rate",
    "add.registered": "Rate Registered!",
    "add.registered_desc": "Thank you! Your verified contribution is logged inside the traveler community database.",
    "add.redirecting": "Redirecting to catalog...",
    "add.title": "Contribute Price Log",
    "add.desc": "Spotted an item? Log it here in {country} to bypass high tourist premiums.",
    "add.form_details": "Form details",
    "add.prod_name": "Product Name *",
    "add.prod_brand": "Brand Name",
    "add.category": "Category",
    "add.barcode": "Barcode (Optional)",
    "add.store": "Store Location *",
    "add.price_in": "Price in {symbol} ({currency}) *",
    "add.home_equiv": "Home Equivalent",
    "add.advice_label": "Traveler Advice & Note",
    "add.advice_placeholder": "e.g., Sold in the back fridge section at standard local rate. Avoid buying at the tourist kiosk opposite the terminal!",
    "add.publish": "Publish Contribution to Global Hub",
    "add.footer_info": "Every submitted price log increases your traveler experience point score (XP) by 150 points and secures verified data access for future global nomads. Thank you for contributing.",
    "add.alert_fill": "Please fill in the Product Name, Local Price, and Store Location.",
    "add.alert_valid": "Please provide a valid price.",

    // AddPriceView alternative keys
    "add_price.cancel": "Cancel",
    "add_price.badge": "Contribute Rate",
    "add_price.success_title": "Rate Registered!",
    "add_price.success_desc": "Thank you! Your verified contribution is logged inside the traveler community database.",
    "add_price.redirecting": "Redirecting to catalog...",
    "add_price.title": "Contribute Price Log",
    "add_price.subtitle": "Spotted an item? Log it here in {country} to bypass high tourist premiums.",
    "add_price.field_name": "Product Name",
    "add_price.field_brand": "Brand Name",
    "add_price.field_category": "Category",
    "add_price.field_barcode": "Barcode (Optional)",
    "add_price.field_store": "Store Location",
    "add_price.field_price": "Price in {symbol} ({currency})",
    "add_price.home_equivalent": "Home Equivalent",
    "add_price.field_advice": "Traveler Advice & Note",
    "add_price.submit_btn": "Publish Contribution to Global Hub",
    "add_price.footer_note": "Every submitted price log increases your traveler experience point score (XP) by 150 points and secures verified data access for future global nomads. Thank you for contributing.",

    // TranslateView
    "translate.title": "Lens & Text Translator",
    "translate.subtitle": "Translate foreign warning signs, menu footnotes, or transit notices with instant traveler context.",
    "translate.auto_detect": "Automatic Language Detection",
    "translate.target": "English Target",
    "translate.placeholder": "Type or paste any foreign phrases here... (e.g. 出口, Coperto, Peinture)",
    "translate.translating": "Gemini Translating Optical Stream...",
    "translate.simulate_title": "Simulate Camera Sign Translations",
    "translate.simulate_desc": "No billboard nearby? Select an authentic local sign to trigger instant OCR camera decoding:",
    "translate.snap": "Snap",
    "translate.queue_title": "Translation Logs Queue",
    "translate.clear_queue": "Clear Queue",
    "translate.empty": "Translation Queue Empty",
    "translate.empty_desc": "Enter custom phrases or tap a sign preset above to log instant translations.",
    "translate.detected_lang": "Detected Language: {lang}",
    "translate.foreign_term": "Foreign term",
    "translate.translation": "English translation",
    "translate.safety_advisory": "Nomad Safety Advisory",
    "translate.copy": "Copy Translation",
    "translate.copied": "Copied",

    // ExploreView
    "explore.trusted_stores": "Trusted Supermarkets",
    "explore.must_see": "Must-See Attractions",
    "explore.gps_active": "Nomi GPS Active",
    "explore.radar_map": "Local Radar Locator Map",
    "explore.hide_grid": "Hide Map Grid",
    "explore.show_grid": "Show Map Grid",
    "explore.km_away": "{name} ({km}km)",
    "explore.no_stores": "No supermarkets registered for this country yet.",
    "explore.no_attractions": "No attractions registered for this country yet.",
    "explore.trust_score": "Trust: {score}%",
    "explore.prices": "Prices:",
    "explore.hours": "Hours: {hours}",
    "explore.overview": "Local Overview",
    "explore.specialties": "Nomad Must-Buys & Specialties",
    "explore.reviews": "Traveler Reviews",
    "explore.scam_tips": "Critical Landmark Scam & Custom Tips",
    "explore.admission_converted": "Converted Ticket Fee",
    "explore.free_admission": "Free Admission",
    "explore.protocol_title": "Secure Explorer Protocol",
    "explore.protocol_desc": "Always pre-book landmark tickets on official domain websites weeks ahead. Avoid roadside tourist agency 'packages' or private tour guides promising immediate entry gates.",
    "explore.tab_stores": "Trusted Stores",
    "explore.tab_landmarks": "Must-See Landmarks",
    "explore.hide_map": "Hide Map Grid",
    "explore.show_map": "Show Map Grid",
    "explore.no_landmarks": "No landmarks registered for this country yet.",
    "explore.hours_label": "Hours:",
    "explore.local_overview": "Local Overview:",
    "explore.converted_ticket": "Converted Ticket Fee",

    // ProfileView
    "profile.passport_guest": "Nomad Guest Account",
    "profile.passport_cloud": "Cloud Nomad Passport",
    "profile.id_label": "ID: {id}",
    "profile.level_title": "Explorer Level",
    "profile.level_value": "Lvl {level}",
    "profile.progress_label": "{xp} / {max} XP",
    "profile.stat_scans": "Global Scans",
    "profile.stat_contributions": "Contributions",
    "profile.stat_level": "Explorer Level",
    "profile.sync_passport": "Syncing Cloud Passport...",
    "profile.secure_progress": "Secure Your Explorer Progress",
    "profile.secure_desc": "You are currently using a local anonymous session. Sign up with an email address to save your scanned item history, XP level, and visited attractions permanently in the cloud!",
    "profile.name_placeholder": "Traveler Name",
    "profile.email_placeholder": "Email Address",
    "profile.pass_placeholder": "Password",
    "profile.btn_create": "Create Cloud Passport",
    "profile.btn_signin": "Sign In",
    "profile.btn_use_login": "Use Login",
    "profile.btn_need_account": "Need Account?",
    "profile.achievements_title": "Traveler Achievements",
    "profile.unlocked_badge": "{count} / {total} Unlocked",
    "profile.checklist_title": "My Visited Attractions Checklist",
    "profile.checklist_desc": "Toggle visited monument locations below to sync with Firestore and gain extra XP (+200 XP per check):",
    "profile.visited_btn": "Visited ✓",
    "profile.mark_visited_btn": "Mark Visited",

    // ProfileView alternative keys
    "profile.guest_account": "Nomad Guest Account",
    "profile.cloud_passport": "Cloud Nomad Passport",
    "profile.secure_title": "Secure Your Explorer Progress",
    "profile.password_placeholder": "Password",
    "profile.create_passport_btn": "Create Cloud Passport",
    "profile.sign_in_btn": "Sign In",
    "profile.use_login": "Use Login",
    "profile.need_account": "Need Account?",
    "profile.visited_title": "My Visited Attractions Checklist",
    "profile.visited_desc": "Toggle visited monument locations below to sync with Firestore and gain extra XP (+200 XP per check):",
    "profile.visited_done": "Visited ✓",
    "profile.mark_visited": "Mark Visited",

    // SettingsView
    "settings.title": "App Preferences & Settings",
    "settings.subtitle": "Adjust home settings, manage permissions, and diagnose server pathways.",
    "settings.selector_title": "Home Base & Currency Selector",
    "settings.selector_desc": "Specify your resident country. All scanned supermarket costs are converted to this currency:",
    "settings.permissions_title": "Device Sandbox Permissions",
    "settings.perm_camera": "Camera Feed Permission",
    "settings.perm_camera_desc": "Required for lens optical scans",
    "settings.perm_gps": "Live GPS Location Feed",
    "settings.perm_gps_desc": "Required for supermarket map radar",
    "settings.diagnostics_title": "Server Connectivity Diagnostics",
    "settings.diagnostics_desc": "Check if your application is successfully talking to the server-side Gemini endpoints:",
    "settings.btn_ping": "Test Server Connection",
    "settings.pinging": "Pinging...",
    "settings.retention_title": "Data & Cache Retention",
    "settings.retention_desc": "Purge Memory Cache",
    "settings.retention_sub": "Wipes all custom catalog prices, bookmarks, and scans",
    "settings.lang_title": "App Language",
    "settings.lang_desc": "Select your preferred layout and language for all screens:",
    "settings.confirm_purge": "Are you sure you want to clear your custom contributions, scanned products, and translation history logs? This action is irreversible.",
    "settings.purge_success": "Local sandbox cache successfully purged.",

    // Static Database translations fallback values (allows fully localized content dynamically!)
    "Japan": "Japan",
    "Italy": "Italy",
    "France": "France",
    "Thailand": "Thailand",
    "Mexico": "Mexico",
    "United States": "United States",

    // Onboarding
    "onboarding.welcome": "Welcome to Nomi",
    "onboarding.subtitle": "Your intelligent travel companion to scan packaging barcodes, translate warning signs, and bypass local tourist price inflation instantly.",
    "onboarding.lang_detect": "Language Automatically Configured",
    "onboarding.lang_detect_desc": "Based on your device, we have pre-configured Nomi to display in English. You can confirm or change below:",
    "onboarding.select_home": "Select Your Home Residence",
    "onboarding.select_home_desc": "This allows Nomi to convert all foreign currency amounts to your local home currency automatically so you always know your exact savings.",
    "onboarding.default_currency": "Default Currency Set:",
    "onboarding.ready": "Ready to Outsmart Inflation",
    "onboarding.ready_desc": "Your profile is primed and ready. Tap the button below to start your intelligent nomad companion journey!",
    "onboarding.btn_next": "Continue",
    "onboarding.btn_back": "Back",
    "onboarding.btn_finish": "Start Exploring"
  },
  ar: {
    // App & Shell Headers & Nav
    "app.title": "نومي",
    "app.tagline": "ذكاء السفر",
    "app.live_feed": "بث نومي المباشر نشط",
    "app.companion": "رفيق السفر نومي",
    "app.companion_desc": "نظام هاتف متكامل ومميز مصمم للرحالة العالميين لمسح الباركود فوراً، وترجمة لافتات التحذير، وتتبع التكاليف الحقيقية، وتجنب تضخم الأسعار المحلي.",
    "app.gps_hub": "مركز حالة الـ GPS",
    "app.curr_dest": "الوجهة الحالية:",
    "app.local_curr": "العملة المحلية:",
    "app.home_curr": "عملة بلد الإقامة:",
    "app.sim_rate": "سعر الصرف المحاكي:",
    "app.mobile_sim": "محاكي هاتف بمستوى الإنتاج. مصمم لأنظمة iOS و Google Play.",
    "app.guide_title": "دليل رفيق نومي",
    "app.guide_desc": "جميع الشاشات الـ 8 مفعلة ومتصلة بالكامل. إليك كيفية الوصول إليها:",
    "app.guide.home": "الرئيسية: إرشادات السفر الأساسية، الطقس المحلي والمسح الأخير.",
    "app.guide.explore": "الاستكشاف: بطاقات مقسمة للأسواق والمعالم مع دبابيس خريطة GPS حية.",
    "app.guide.scan": "شاشة المسح: اضغط على مربعات الاختيار لفك رموز المنتجات عبر Gemini.",
    "app.guide.details": "تفاصيل المنتج: اضغط على أي عنصر تحت 'المسح الأخير' أو امسح أي منتج.",
    "app.guide.add_price": "إضافة سعر: متوفر عبر شاشة الرئيسية أو تفاصيل المنتج.",
    "app.guide.translate": "الترجمة: ترجمة يدوية أو قوالب لافتات فورية.",
    "app.guide.profile": "جواز السفر (الملف الشخصي): عرض عدد المساهمات والشارات المفتوحة.",
    "app.guide.settings": "الإعدادات: اضغط على الترس أعلى اليمين لتحديد عملة بلد الإقامة واختبار الاتصال.",
    "app.server_test": "اختبار الخادم:",
    "app.server_test_desc": "اذهب إلى الإعدادات واضغط على 'اختبار اتصال الخادم' للتحقق من حالة الاتصال مباشرة!",
    "nav.home": "الرئيسية",
    "nav.explore": "استكشاف",
    "nav.translate": "ترجمة",
    "nav.passport": "جواز السفر",
    "nav.active_dest": "الوجهة النشطة",
    "nav.home_residence": "بلد الإقامة",

    // HomeView
    "home.greeting": "مرحباً أيها المسافر! 👋",
    "home.explorer_level": "مستكشف عالمي المستوى 4",
    "home.exploring_in": "أنت تستكشف حالياً في",
    "home.progress_lvl": "التقدم إلى المستوى {level}",
    "home.instant_calc": "تحويل العملات الفوري",
    "home.calc_amount": "مبلغ {currency} ({symbol})",
    "home.calc_converted": "القيمة بـ {currency} ({symbol})",
    "home.calc_rates_desc": "بناءً على أسعار السوق المتوسطة المعتمدة: 1 {home} = {rate} {dest}",
    "home.checklist_title": "قائمة التحقق الأساسية للسفر في {country}",
    "home.hygiene": "مستوى النظافة",
    "home.tipping": "ثقافة الإكراميات",
    "home.tap_water": "سلامة مياه الصنبور",
    "home.card_payments": "الدفع بالبطاقة",
    "home.guideline_title": "إرشادات ذكاء المسافر",
    "home.view_trusted": "عرض جميع الأسواق والمعالم الموثوقة في المنطقة",
    "home.recent_scans": "عمليات المسح الأخيرة للسوبرماركت",
    "home.scan_new": "مسح جديد",
    "home.spotted_cheaper": "هل لاحظت سعراً محلياً أرخص؟",
    "home.spotted_desc": "ساعد زملائك المسافرين في تجنب متاجر الهدايا باهظة الثمن. أضف سجل الأسعار الخاص بك الآن!",
    "home.add_price_btn": "إضافة سعر",
    "home.verified_at": "تم التحقق في",

    // ScanView
    "scan.title": "ماسح العدسة وقارئ الباركود",
    "scan.subtitle": "التقط صوراً للعبوات أو الباركود لفك رموز المكونات فوراً وتجنب فخاخ أسعار السياح.",
    "scan.iframe_alert": "تحظر سياسات الإطار الفرعي للمتصفح البث المباشر للكاميرا. للحصول على عرض ويب كام كامل، افتح التطبيق في علامة تبويب جديدة. أو اضغط على 'التقاط بكاميرا النظام' لفتح كاميرا الهاتف الحقيقية مباشرة!",
    "scan.iframe_link": "افتح التطبيق في علامة تبويب جديدة",
    "scan.initializing": "📸 جاري تشغيل المستشعر البصري...",
    "scan.connecting": "🛰️ جاري الاتصال بـ Gemini Vision...",
    "scan.reading": "🔍 جاري قراءة ملصقات المنتجات وخطوط الباركود...",
    "scan.local_resolver": "🛰️ جاري تفعيل المفسر المحلي للمعلومات...",
    "scan.ai_decoding": "ذكاء Gemini الاصطناعي يفك رموز العبوة...",
    "scan.req_auth": "جاري طلب صلاحية الكاميرا...",
    "scan.req_auth_desc": "يرجى منح صلاحية الكاميرا عند ظهور الطلب.",
    "scan.blocked": "بث الكاميرا المباشر محجوب",
    "scan.blocked_desc": "البث المباشر محجوب أو مرفوض. على الأجهزة المحمولة، اضغط على 'التقاط بكاميرا النظام' لتشغيل كاميرا الهاتف الحقيقية مباشرة!",
    "scan.unsupported": "البث المباشر غير مدعوم في المتصفح",
    "scan.unsupported_desc": "متصفحك لا يدعم معاينة الكاميرا المباشرة. استخدم كاميرا جهازك الأصلية لالتقاط صورة!",
    "scan.snap_system": "التقاط بكاميرا النظام",
    "scan.retry_feed": "إعادة محاولة البث",
    "scan.live_active": "البث المباشر نشط",
    "scan.webcam_standby": "الكاميرا في وضع الاستعداد / محجوبة",
    "scan.turn_off": "إيقاف الكاميرا",
    "scan.turn_on": "تشغيل الكاميرا",
    "scan.snap_photo": "التقاط صورة",
    "scan.pick_gallery": "اختر من معرض الصور",
    "scan.presets_title": "قوالب المسح السريع ({country})",
    "scan.presets_desc": "لا تملك عبوة منتج حقيقية؟ حاكِ التقاط صورة للمنتجات المطابقة لوجهتك الحالية:",
    "scan.did_you_know": "هل تعلم؟",
    "scan.advisory": "تفرض المتاجر في المناطق السياحية المزدحمة مثل محطات القطار أو بوابات المعابد زيادة في الأسعار تصل إلى 150%. قارن دائماً القيم الممسوحة قبل الشراء.",
    "scan.preset.country": "البلد: {code}",

    // ProductDetailsView
    "details.no_selected": "لم يتم اختيار أي منتج",
    "details.no_selected_desc": "امسح منتجاً أو تصفح قوائم الأسعار لمشاهدة تقارير المسافرين الكاملة.",
    "details.go_scan": "اذهب إلى شاشة المسح",
    "details.back_catalog": "العودة إلى الكتالوج",
    "details.verified": "تم التحقق بواسطة المسافرين",
    "details.brand": "الماركة:",
    "details.barcode_identified": "تم التعرف على الباركود",
    "details.local_retail_cost": "تكلفة البيع بالتجزئة محلياً",
    "details.converted_cost": "التكلفة المحولة بعملتك",
    "details.home": "بلد الإقامة",
    "details.dossier": "ملف معلومات المسافر المحلي",
    "details.logged_by": "تم التسجيل بواسطة:",
    "details.date": "التاريخ:",
    "details.availability": "التوفر والاتساق المتوقع",
    "details.in_area": "في المنطقة",
    "details.no_markets": "لا توجد أسواق سوبرماركت إقليمية محفوظة. تفقد تبويب الاستكشاف.",
    "details.trust": "ثقة {percent}%",
    "details.price_level": "مستوى الأسعار:",
    "details.available": "متوفر",
    "details.view_map": "عرض على الخريطة",
    "details.different_rate": "هل لاحظت سعراً مختلفاً؟ أرسله",
    "details.shared_clip": "تم نسخ تقرير السفر إلى الحافظة! جاهز للإرسال إلى مجموعة الرحلة.",
    "verdict.excellent": "صفقة ممتازة (السعر المحلي المعتاد)",
    "verdict.premium": "منتج فاخر / فئة ممتازة",
    "verdict.fair": "سعر قياسي عادل",

    // AddPriceView
    "add.cancel": "إلغاء",
    "add.contribute_rate": "المساهمة بسعر",
    "add.registered": "تم تسجيل السعر بنجاح!",
    "add.registered_desc": "شكراً لك! تم تسجيل مساهمتك المعتمدة داخل قاعدة بيانات مجتمع المسافرين.",
    "add.redirecting": "جاري توجيهك إلى الكتالوج...",
    "add.title": "المساهمة بتسجيل سعر",
    "add.desc": "هل عثرت على منتج؟ سجله هنا في {country} لمساعدة الآخرين على تجنب فروقات أسعار السياح.",
    "add.form_details": "تفاصيل النموذج",
    "add.prod_name": "اسم المنتج *",
    "add.prod_brand": "اسم الماركة",
    "add.category": "الفئة",
    "add.barcode": "الباركود (اختياري)",
    "add.store": "موقع المتجر / السوبرماركت *",
    "add.price_in": "السعر بـ {symbol} ({currency}) *",
    "add.home_equiv": "ما يعادله بعملتك",
    "add.advice_label": "نصيحة أو ملاحظة للمسافرين",
    "add.advice_placeholder": "مثال: يباع في قسم الثلاجات الخلفي بالسعر المحلي المعتاد. تجنب الشراء من الكشك السياحي المقابل للمحطة!",
    "add.publish": "نشر المساهمة في المركز العالمي",
    "add.footer_info": "كل مساهمة بسعر تزيد نقاط خبرتك في السفر (XP) بمقدار 150 نقطة وتضمن بقاء البيانات متاحة وموثوقة للرحالة الآخرين. شكراً لمساهمتك.",
    "add.alert_fill": "يرجى ملء اسم المنتج، السعر المحلي، وموقع المتجر.",
    "add.alert_valid": "يرجى تزويد سعر صحيح.",

    // AddPriceView alternative keys
    "add_price.cancel": "إلغاء",
    "add_price.badge": "المساهمة بسعر",
    "add_price.success_title": "تم تسجيل السعر بنجاح!",
    "add_price.success_desc": "شكراً لك! تم تسجيل مساهمتك المعتمدة داخل قاعدة بيانات مجتمع المسافرين.",
    "add_price.redirecting": "جاري توجيهك إلى الكتالوج...",
    "add_price.title": "المساهمة بتسجيل سعر",
    "add_price.subtitle": "هل عثرت على منتج؟ سجله هنا في {country} لمساعدة الآخرين على تجنب فروقات أسعار السياح.",
    "add_price.field_name": "اسم المنتج",
    "add_price.field_brand": "اسم الماركة",
    "add_price.field_category": "الفئة",
    "add_price.field_barcode": "الباركود (اختياري)",
    "add_price.field_store": "موقع المتجر / السوبرماركت",
    "add_price.field_price": "السعر بـ {symbol} ({currency})",
    "add_price.home_equivalent": "ما يعادله بعملتك",
    "add_price.field_advice": "نصيحة أو ملاحظة للمسافرين",
    "add_price.submit_btn": "نشر المساهمة في المركز العالمي",
    "add_price.footer_note": "كل مساهمة بسعر تزيد نقاط خبرتك في السفر (XP) بمقدار 150 نقطة وتضمن بقاء البيانات متاحة وموثوقة للرحالة الآخرين. شكراً لمساهمتك.",

    // TranslateView
    "translate.title": "مترجم النصوص والعدسة",
    "translate.subtitle": "ترجم لافتات التحذير الأجنبية، حواشي القوائم، أو إشعارات النقل مع سياق فوري ومفيد للمسافر.",
    "translate.auto_detect": "التعرف التلقائي على اللغة",
    "translate.target": "الترجمة إلى الإنجليزية",
    "translate.placeholder": "اكتب أو الصق العبارات الأجنبية هنا... (مثل 出口, Coperto, Peinture)",
    "translate.translating": "Gemini يترجم البث البصري...",
    "translate.simulate_title": "محاكاة ترجمة اللافتات بالكاميرا",
    "translate.simulate_desc": "لا توجد لافتة قريبة؟ اختر لافتة محلية حقيقية لتفعيل فك رموز الكاميرا الفوري:",
    "translate.snap": "التقاط",
    "translate.queue_title": "سجل عمليات الترجمة",
    "translate.clear_queue": "مسح السجل",
    "translate.empty": "سجل الترجمة فارغ",
    "translate.empty_desc": "أدخل عبارات مخصصة أو اضغط على قوالب اللافتات أعلاه لتسجيل الترجمات الفورية.",
    "translate.detected_lang": "اللغة المكتشفة: {lang}",
    "translate.foreign_term": "العبارة الأجنبية",
    "translate.translation": "الترجمة الإنجليزية",
    "translate.safety_advisory": "تنبيه سلامة الرحالة",
    "translate.copy": "نسخ الترجمة",
    "translate.copied": "تم النسخ",

    // ExploreView
    "explore.trusted_stores": "متاجر موثوقة",
    "explore.must_see": "معالم مميزة",
    "explore.gps_active": "نومي GPS نشط",
    "explore.radar_map": "خريطة رادار المواقع المحلية",
    "explore.hide_grid": "إخفاء شبكة الخريطة",
    "explore.show_grid": "إظهار شبكة الخريطة",
    "explore.km_away": "{name} ({km}كم)",
    "explore.no_stores": "لا توجد أسواق سوبرماركت مسجلة في هذا البلد بعد.",
    "explore.no_attractions": "لا توجد معالم مسجلة في هذا البلد بعد.",
    "explore.trust_score": "ثقة: {score}%",
    "explore.prices": "الأسعار:",
    "explore.hours": "مواعيد العمل: {hours}",
    "explore.overview": "نظرة عامة محلية",
    "explore.specialties": "منتجات ينصح بها وتخصصات للرحالة",
    "explore.reviews": "آراء وتقييمات المسافرين",
    "explore.scam_tips": "تحذيرات هامة من فخاخ النصب في المعالم ونصائح",
    "explore.admission_converted": "سعر التذكرة المحول",
    "explore.free_admission": "دخول مجاني",
    "explore.protocol_title": "بروتوكول المستكشف الآمن",
    "explore.protocol_desc": "احجز دائماً تذاكر المعالم مسبقاً من المواقع الرسمية قبل أسابيع. تجنب باقات الوكالات السياحية العشوائية أو المرشدين غير الرسميين الذين يعدون بدخول فوري.",
    "explore.tab_stores": "متاجر موثوقة",
    "explore.tab_landmarks": "معالم مميزة",
    "explore.hide_map": "إخفاء شبكة الخريطة",
    "explore.show_map": "إظهار شبكة الخريطة",
    "explore.no_landmarks": "لا توجد معالم مسجلة في هذا البلد بعد.",
    "explore.hours_label": "مواعيد العمل:",
    "explore.local_overview": "نظرة عامة محلية:",
    "explore.converted_ticket": "سعر التذكرة المحول",

    // ProfileView
    "profile.passport_guest": "حساب زائر مؤقت",
    "profile.passport_cloud": "جواز سفر الرحالة السحابي",
    "profile.id_label": "المعرف: {id}",
    "profile.level_title": "مستوى المستكشف",
    "profile.level_value": "مستوى {level}",
    "profile.progress_label": "{xp} / {max} نقطة",
    "profile.stat_scans": "سجلات المسح",
    "profile.stat_contributions": "المساهمات",
    "profile.stat_level": "مستوى المستكشف",
    "profile.sync_passport": "جاري مزامنة جواز السفر السحابي...",
    "profile.secure_progress": "احمِ تقدمك في الاستكشاف",
    "profile.secure_desc": "أنت تستخدم حالياً جلسة زائر محلية مؤقتة. سجل ببريدك الإلكتروني لحفظ سجل المسح الخاص بك، ومستوى الخبرة (XP)، والمعالم التي زرتها بشكل دائم في السحاب!",
    "profile.name_placeholder": "اسم المسافر",
    "profile.email_placeholder": "البريد الإلكتروني",
    "profile.pass_placeholder": "كلمة المرور",
    "profile.btn_create": "إنشاء جواز سفر سحابي",
    "profile.btn_signin": "تسجيل الدخول",
    "profile.btn_use_login": "تسجيل الدخول",
    "profile.btn_need_account": "حساب جديد؟",
    "profile.achievements_title": "إنجازات المسافر",
    "profile.unlocked_badge": "تم فتح {count} من {total}",
    "profile.checklist_title": "قائمة التحقق من المعالم التي زرتها",
    "profile.checklist_desc": "حدد المواقع الأثرية التي زرتها أدناه لمزامنتها مع قاعدة البيانات وكسب نقاط إضافية (+200 نقطة خبرة لكل معلم):",
    "profile.visited_btn": "تمت الزيارة ✓",
    "profile.mark_visited_btn": "تحديد كتمت الزيارة",

    // ProfileView alternative keys
    "profile.guest_account": "حساب زائر مؤقت",
    "profile.cloud_passport": "جواز سفر الرحالة السحابي",
    "profile.secure_title": "احمِ تقدمك في الاستكشاف",
    "profile.password_placeholder": "كلمة المرور",
    "profile.create_passport_btn": "إنشاء جواز سفر سحابي",
    "profile.sign_in_btn": "تسجيل الدخول",
    "profile.use_login": "تسجيل الدخول",
    "profile.need_account": "حساب جديد؟",
    "profile.visited_title": "قائمة التحقق من المعالم التي زرتها",
    "profile.visited_desc": "حدد المواقع الأثرية التي زرتها أدناه لمزامنتها مع قاعدة البيانات وكسب نقاط إضافية (+200 نقطة خبرة لكل معلم):",
    "profile.visited_done": "تمت الزيارة ✓",
    "profile.mark_visited": "تحديد كتمت الزيارة",

    // SettingsView
    "settings.title": "تفضيلات التطبيق والإعدادات",
    "settings.subtitle": "اضبط الإعدادات الأساسية، أدر الصلاحيات، وشخّص مسارات الخادم.",
    "settings.selector_title": "بلد الإقامة ومحدد العملة",
    "settings.selector_desc": "حدد بلد إقامتك. سيتم تحويل جميع تكاليف السوبرماركت الممسوحة إلى هذه العملة:",
    "settings.permissions_title": "صلاحيات بيئة تشغيل الجهاز",
    "settings.perm_camera": "إذن بث الكاميرا",
    "settings.perm_camera_desc": "مطلوب للمسح البصري للعدسة",
    "settings.perm_gps": "بث موقع الـ GPS المباشر",
    "settings.perm_gps_desc": "مطلوب لرادار خريطة السوبرماركت",
    "settings.diagnostics_title": "تشخيص الاتصال بالخادم",
    "settings.diagnostics_desc": "تحقق مما إذا كان تطبيقك يتصل بنجاح بنقاط نهاية Gemini على الخادم:",
    "settings.btn_ping": "اختبار اتصال الخادم",
    "settings.pinging": "جاري الاتصال...",
    "settings.retention_title": "الاحتفاظ بالبيانات والذاكرة المؤقتة",
    "settings.retention_desc": "مسح الذاكرة المؤقتة",
    "settings.retention_sub": "يمسح جميع أسعار الكتالوج المخصصة، الإشارات المرجعية، وسجلات المسح",
    "settings.lang_title": "لغة التطبيق",
    "settings.lang_desc": "اختر اللغة والاتجاه المفضلين لجميع شاشات التطبيق:",
    "settings.confirm_purge": "هل أنت متأكد من رغبتك في مسح مساهماتك المخصصة، المنتجات الممسوحة وسجلات تاريخ الترجمة؟ هذا الإجراء غير قابل للتراجع.",
    "settings.purge_success": "تم مسح الذاكرة المؤقتة المحلية بنجاح.",

    // Static Database translations fallback values (allows fully localized content dynamically!)
    "Japan": "اليابان",
    "Italy": "إيطاليا",
    "France": "فرنسا",
    "Thailand": "تايلاند",
    "Mexico": "المكسيك",
    "United States": "الولايات المتحدة",

    // Onboarding
    "onboarding.welcome": "مرحباً بك في Nomi",
    "onboarding.subtitle": "رفيق سفرك الذكي لمسح باركود المنتجات، وترجمة لافتات التحذير، وتجنب فخاخ أسعار السياح محلياً وفوراً.",
    "onboarding.lang_detect": "تهيئة لغة التطبيق تلقائياً",
    "onboarding.lang_detect_desc": "بناءً على إعدادات جهازك، قمنا بضبط Nomi ليعمل باللغة العربية. يمكنك تأكيد ذلك أو التغيير أدناه:",
    "onboarding.select_home": "اختر بلد إقامتك الأصلي",
    "onboarding.select_home_desc": "سيقوم Nomi بتحويل جميع قيم العملات الأجنبية تلقائياً إلى عملتك المحلية لتعرف مقدار مدخراتك دائماً بالدقة اللازمة.",
    "onboarding.default_currency": "العملة الافتراضية المحددة:",
    "onboarding.ready": "جاهز لتجاوز غلاء الأسعار",
    "onboarding.ready_desc": "جواز سفرك مهيأ ومستعد الآن. اضغط على الزر أدناه لبدء رحلة رفيق السفر الذكي الخاصة بك!",
    "onboarding.btn_next": "متابعة",
    "onboarding.btn_back": "العودة",
    "onboarding.btn_finish": "ابدأ الاستكشاف"
  }
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const stored = localStorage.getItem("nomi_app_language");
    if (stored === "en" || stored === "ar") {
      return stored as Language;
    }
    // Auto-detect browser/device language
    const deviceLang = (navigator.language || (navigator as any).userLanguage || "en").toLowerCase();
    if (deviceLang.startsWith("ar")) {
      localStorage.setItem("nomi_app_language", "ar");
      return "ar";
    }
    // Any other language falls back to "en" as a supported language
    localStorage.setItem("nomi_app_language", "en");
    return "en";
  });

  // Load language settings on user login/auth changes from Firestore
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user && !user.isAnonymous) {
        try {
          const userDocRef = doc(db, "users", user.uid);
          const snap = await getDoc(userDocRef);
          if (snap.exists()) {
            const data = snap.data();
            if (data.language && data.language !== language) {
              setLanguageState(data.language as Language);
              localStorage.setItem("nomi_app_language", data.language);
            }
          }
        } catch (err) {
          console.warn("Could not read language preference from Firestore:", err);
        }
      }
    });
    return () => unsub();
  }, [language]);

  const setLanguage = async (newLang: Language) => {
    setLanguageState(newLang);
    localStorage.setItem("nomi_app_language", newLang);

    if (auth.currentUser && !auth.currentUser.isAnonymous) {
      try {
        const userDocRef = doc(db, "users", auth.currentUser.uid);
        await updateDoc(userDocRef, {
          language: newLang,
        });
      } catch (err) {
        console.warn("Could not write language preference to Firestore:", err);
      }
    }
  };

  const t = (key: string, variables?: Record<string, string | number>): string => {
    const dict = TRANSLATIONS[language] || TRANSLATIONS["en"];
    let translated = dict[key] || TRANSLATIONS["en"][key] || key;

    if (variables) {
      Object.entries(variables).forEach(([vKey, vVal]) => {
        translated = translated.replace(new RegExp(`{${vKey}}`, "g"), String(vVal));
      });
    }

    return translated;
  };

  const dir = language === "ar" ? "rtl" : "ltr";

  // Side-effect: update the HTML document element's lang and dir attributes
  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = language;
  }, [dir, language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, dir }}>
      <div dir={dir} className="w-full h-full flex flex-col items-center">
        {children}
      </div>
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return ctx;
};
