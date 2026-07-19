export interface LanguageModel {
  code: string;       // e.g. "ja", "it", "fr", "th", "es", "en", "ar"
  name: string;       // e.g. "Japanese", "Italian", "French", "Thai", "Spanish", "English", "Arabic"
  nameAr: string;     // Localized Arabic name
  direction: "ltr" | "rtl";
}

export interface CurrencyModel {
  code: string;       // e.g. "JPY", "EUR", "THB", "MXN", "USD"
  name: string;       // e.g. "Japanese Yen", "Euro", "Thai Baht", "Mexican Peso", "US Dollar"
  nameAr: string;     // Localized Arabic name
  symbol: string;     // e.g. "¥", "€", "฿", "$"
  exchangeRateToUSD: number; // e.g. 150 (1 USD = 150 JPY)
}

export interface TimeZoneModel {
  id: string;         // e.g. "Asia/Tokyo", "Europe/Rome", "Europe/Paris", "Asia/Bangkok", "America/Mexico_City", "America/New_York"
  name: string;       // e.g. "JST", "CET", "CET", "ICT", "CST", "EST"
  offset: number;     // GMT offset (e.g. +9, +1, +7, -6, -5)
}

export interface CountryModel {
  code: string;       // e.g. "JP", "IT", "FR", "TH", "MX", "US"
  name: string;
  nameAr: string;
  flag: string;
  continent: string;
  continentAr: string;
  
  // Legacy / Direct Access Compatibility Fields
  currency: string;          // e.g. "JPY"
  currencySymbol: string;    // e.g. "¥"
  exchangeRateToUSD: number; // e.g. 150.0

  // Centralized Rich Object Models
  primaryLanguage: LanguageModel;
  languages: LanguageModel[];
  currencyModel: CurrencyModel;
  timeZone: TimeZoneModel;

  // Travel intelligence fields
  emergencyNumbers: {
    police: string;
    ambulance: string;
    fire: string;
    general: string;
  };
  tippingCulture: string;
  tippingCultureAr: string;
  tapWaterSafe: boolean;
  tapWaterNotes: string;
  tapWaterNotesAr: string;
  cardPaymentFriendly: "high" | "medium" | "low";
  cardPaymentNotes: string;
  cardPaymentNotesAr: string;
  visaInfo?: string;
  visaInfoAr?: string;
}

// 1. Centralized languages dictionary
export const LANGUAGES: Record<string, LanguageModel> = {
  en: { code: "en", name: "English", nameAr: "الإنجليزية", direction: "ltr" },
  ja: { code: "ja", name: "Japanese", nameAr: "اليابانية", direction: "ltr" },
  it: { code: "it", name: "Italian", nameAr: "الإيطالية", direction: "ltr" },
  fr: { code: "fr", name: "French", nameAr: "الفرنسية", direction: "ltr" },
  th: { code: "th", name: "Thai", nameAr: "التايلاندية", direction: "ltr" },
  es: { code: "es", name: "Spanish", nameAr: "الإسبانية", direction: "ltr" },
  ar: { code: "ar", name: "Arabic", nameAr: "العربية", direction: "rtl" },
  de: { code: "de", name: "German", nameAr: "الألمانية", direction: "ltr" },
  tr: { code: "tr", name: "Turkish", nameAr: "التركية", direction: "ltr" },
  zh: { code: "zh", name: "Chinese", nameAr: "الصينية", direction: "ltr" },
  hi: { code: "hi", name: "Hindi", nameAr: "الهندية", direction: "ltr" },
  pt: { code: "pt", name: "Portuguese", nameAr: "البرتغالية", direction: "ltr" },
  ko: { code: "ko", name: "Korean", nameAr: "الكورية", direction: "ltr" },
  ms: { code: "ms", name: "Malay", nameAr: "الملايوية", direction: "ltr" },
  id: { code: "id", name: "Indonesian", nameAr: "الإندونيسية", direction: "ltr" },
  vi: { code: "vi", name: "Vietnamese", nameAr: "الفيتنامية", direction: "ltr" },
  nl: { code: "nl", name: "Dutch", nameAr: "الهولندية", direction: "ltr" },
  ru: { code: "ru", name: "Russian", nameAr: "الروسية", direction: "ltr" },
  sv: { code: "sv", name: "Swedish", nameAr: "السويدية", direction: "ltr" },
  no: { code: "no", name: "Norwegian", nameAr: "النرويجية", direction: "ltr" },
  da: { code: "da", name: "Danish", nameAr: "الدنماركية", direction: "ltr" },
  fi: { code: "fi", name: "Finnish", nameAr: "الفنلندية", direction: "ltr" },
  el: { code: "el", name: "Greek", nameAr: "اليونانية", direction: "ltr" },
  pl: { code: "pl", name: "Polish", nameAr: "البولندية", direction: "ltr" },
  cs: { code: "cs", name: "Czech", nameAr: "التشيكية", direction: "ltr" },
  hu: { code: "hu", name: "Hungarian", nameAr: "المجرية", direction: "ltr" },
  ro: { code: "ro", name: "Romanian", nameAr: "الرومانية", direction: "ltr" },
  ur: { code: "ur", name: "Urdu", nameAr: "الأردية", direction: "rtl" },
};

// 2. Raw compact database matching all world countries cleanly
// [0:code, 1:name, 2:nameAr, 3:flag, 4:currency, 5:symbol, 6:rate, 7:lang, 8:timezone, 9:offset, 10:continent, 11:continentAr, 12:police, 13:tippingEn, 14:tippingAr, 15:waterSafe (true/false)]
const WORLD_COMPACT_DB: string[][] = [
  ["US", "United States", "الولايات المتحدة", "🇺🇸", "USD", "$", "1.0", "en", "America/New_York", "-5", "North America", "أمريكا الشمالية", "911", "15-20% customary", "من المعتاد دفع بقشيش 15-20%", "true"],
  ["JP", "Japan", "اليابان", "🇯🇵", "JPY", "¥", "150.0", "ja", "Asia/Tokyo", "9", "Asia", "آسيا", "110", "Tipping is non-existent", "البقشيش غير مقبول تمامًا ومحرج", "true"],
  ["IT", "Italy", "إيطاليا", "🇮🇹", "EUR", "€", "0.92", "it", "Europe/Rome", "1", "Europe", "أوروبا", "112", "Coperto is added", "تضاف رسوم الخدمة تلقائياً للفاتورة", "true"],
  ["FR", "France", "فرنسا", "🇫🇷", "EUR", "€", "0.92", "fr", "Europe/Paris", "1", "Europe", "أوروبا", "112", "Service included", "الخدمة متضمنة في الفاتورة", "true"],
  ["TH", "Thailand", "تايلاند", "🇹🇭", "THB", "฿", "35.0", "th", "Asia/Bangkok", "7", "Asia", "آسيا", "191", "Not expected, appreciated", "غير مطلوب، لكن يقدّر في السياحة", "false"],
  ["MX", "Mexico", "المكسيك", "🇲🇽", "MXN", "$", "17.5", "es", "America/Mexico_City", "-6", "North America", "أمريكا الشمالية", "911", "10-15% expected", "من المعتاد دفع 10-15% في المطاعم", "false"],
  ["GB", "United Kingdom", "المملكة المتحدة", "🇬🇧", "GBP", "£", "0.79", "en", "Europe/London", "0", "Europe", "أوروبا", "999", "10-12.5% standard", "بقشيش 10-12.5% معتاد في المطاعم", "true"],
  ["DE", "Germany", "ألمانيا", "🇩🇪", "EUR", "€", "0.92", "de", "Europe/Berlin", "1", "Europe", "أوروبا", "110", "5-10% rounded up", "تعتاد إضافة 5-10% أو تقريب المبلغ", "true"],
  ["ES", "Spain", "إسبانيا", "🇪🇸", "EUR", "€", "0.92", "es", "Europe/Madrid", "1", "Europe", "أوروبا", "112", "Small tip appreciated", "البقشيش الصغير لخدمة الطاولة محبب", "true"],
  ["CA", "Canada", "كندا", "🇨🇦", "CAD", "$", "1.35", "en", "America/Toronto", "-5", "North America", "أمريكا الشمالية", "911", "15-20% standard", "بقشيش 15-20% هو المعيار المعتاد", "true"],
  ["AU", "Australia", "أستراليا", "🇦🇺", "AUD", "$", "1.52", "en", "Australia/Sydney", "10", "Oceania", "أوقيانوسيا", "000", "Not expected", "غير مطلوب أو معتاد في أستراليا", "true"],
  ["SA", "Saudi Arabia", "المملكة العربية السعودية", "🇸🇦", "SAR", "ر.س", "3.75", "ar", "Asia/Riyadh", "3", "Asia", "آسيا", "999", "10% appreciated", "10% تقديرية ولكنها غير إجبارية", "false"],
  ["AE", "United Arab Emirates", "الإمارات العربية المتحدة", "🇦🇪", "AED", "د.إ", "3.67", "ar", "Asia/Dubai", "4", "Asia", "آسيا", "999", "10% standard", "10% معتادة لخدمات الطاولة والراحة", "false"],
  ["EG", "Egypt", "مصر", "🇪🇬", "EGP", "ج.م", "47.0", "ar", "Africa/Cairo", "2", "Africa", "أفريقيا", "122", "10% appreciated", "10% بقشيش (البخشيش) متعارف عليه هنا", "false"],
  ["TR", "Turkey", "تركيا", "🇹🇷", "TRY", "₺", "32.0", "tr", "Europe/Istanbul", "3", "Europe", "أوروبا", "155", "5-10% standard", "من المعتاد ترك 5-10% نقداً على الطاولة", "false"],
  ["CN", "China", "الصين", "🇨🇳", "CNY", "¥", "7.2", "zh", "Asia/Shanghai", "8", "Asia", "آسيا", "110", "No tipping allowed", "ممنوع ترك البقشيش ويعتبر غير لائق", "true"],
  ["IN", "India", "الهند", "🇮🇳", "INR", "₹", "83.0", "hi", "Asia/Kolkata", "5.5", "Asia", "آسيا", "112", "10% is customary", "من المعتاد دفع بقشيش بنسبة 10%", "false"],
  ["BR", "Brazil", "البرازيل", "🇧🇷", "BRL", "R$", "5.0", "pt", "America/Sao_Paulo", "-3", "South America", "أمريكا الجنوبية", "190", "10% often included", "تضاف 10% تلقائياً تحت بند الخدمة", "false"],
  ["KR", "South Korea", "كوريا الجنوبية", "🇰🇷", "KRW", "₩", "1350.0", "ko", "Asia/Seoul", "9", "Asia", "آسيا", "112", "No tip expected", "البقشيش غير مقبول تماماً ومستغرب", "true"],
  ["SG", "Singapore", "سنغافورة", "🇸🇬", "SGD", "$", "1.34", "en", "Asia/Singapore", "8", "Asia", "آسيا", "999", "No tip expected", "غير مطلوب، تضاف رسوم خدمة 10% للفاتورة", "true"],
  ["MY", "Malaysia", "ماليزيا", "🇲🇾", "MYR", "RM", "4.7", "ms", "Asia/Kuala_Lumpur", "8", "Asia", "آسيا", "999", "Not expected", "غير مطلوب ولكن يقدّر تقريب الفكة", "true"],
  ["ID", "Indonesia", "إندونيسيا", "🇮🇩", "IDR", "Rp", "15600.0", "id", "Asia/Jakarta", "7", "Asia", "آسيا", "110", "Small change/10%", "مستحب تقريب الفكة أو دفع 10% بقشيش", "false"],
  ["PH", "Philippines", "الفلبين", "🇵🇭", "PHP", "₱", "56.0", "en", "Asia/Manila", "8", "Asia", "آسيا", "911", "10% appreciated", "10% من المجموع محبب وتقدر به الخدمات", "false"],
  ["VN", "Vietnam", "فيتنام", "🇻🇳", "VND", "₫", "24500.0", "vi", "Asia/Ho_Chi_Minh", "7", "Asia", "آسيا", "113", "Not expected", "غير مطلوب ولا يعتاده السكان المحليون", "false"],
  ["CH", "Switzerland", "سويسرا", "🇨🇭", "CHF", "CHF", "0.88", "de", "Europe/Zurich", "1", "Europe", "أوروبا", "117", "Included", "الخدمة والضريبة مشمولة قانونياً بالكامل", "true"],
  ["NL", "Netherlands", "هولندا", "🇳🇱", "EUR", "€", "0.92", "nl", "Europe/Amsterdam", "1", "Europe", "أوروبا", "112", "Small tip", "تقريب الحساب أو دفع بقشيش بسيط مستحب", "true"],
  ["SE", "Sweden", "السويد", "🇸🇪", "SEK", "kr", "10.4", "sv", "Europe/Stockholm", "1", "Europe", "أوروبا", "112", "Rounded up", "تقريب الفكة للأعلى معتاد وبسيط", "true"],
  ["NO", "Norway", "النرويج", "🇳🇴", "NOK", "kr", "10.5", "no", "Europe/Oslo", "1", "Europe", "أوروبا", "112", "Not expected", "غير متوقع ولكن يترك للخدمات الممتازة", "true"],
  ["DK", "Denmark", "الدنمارك", "🇩🇰", "DKK", "kr", "6.9", "da", "Europe/Copenhagen", "1", "Europe", "أوروبا", "112", "Included", "الخدمة مشمولة بالكامل في جميع الفواتير", "true"],
  ["FI", "Finland", "فنلندا", "🇫🇮", "EUR", "€", "0.92", "fi", "Europe/Helsinki", "2", "Europe", "أوروبا", "112", "Included", "الخدمة متضمنة والفروسات الصغيرة مستحسنة", "true"],
  ["IE", "Ireland", "أيرلندا", "🇮🇪", "EUR", "€", "0.92", "en", "Europe/Dublin", "0", "Europe", "أوروبا", "999", "10-15% standard", "من المعتاد دفع 10-15% للخدمات الجيدة", "true"],
  ["PT", "Portugal", "البرتغال", "🇵🇹", "EUR", "€", "0.92", "pt", "Europe/Lisbon", "0", "Europe", "أوروبا", "112", "5-10% standard", "5-10% معتادة ومقبولة في المواقع السياحية", "true"],
  ["GR", "Greece", "اليونان", "🇬🇷", "EUR", "€", "0.92", "el", "Europe/Athens", "2", "Europe", "أوروبا", "100", "5-10% rounded", "5-10% بقشيش في المطاعم أو تقريب الفكة", "true"],
  ["RU", "Russia", "روسيا", "🇷🇺", "RUB", "₽", "92.0", "ru", "Europe/Moscow", "3", "Europe", "أوروبا", "102", "10% standard", "دفع 10% بقشيش معتاد في كافة المطاعم والمدن", "false"],
  ["ZA", "South Africa", "جنوب أفريقيا", "🇿🇦", "ZAR", "R", "19.0", "en", "Africa/Johannesburg", "2", "Africa", "أفريقيا", "10111", "10-15%", "10-15% في المطاعم ومحطات الوقود معتادة", "false"],
  ["JO", "Jordan", "الأردن", "🇯🇴", "JOD", "د.ا", "0.71", "ar", "Asia/Amman", "3", "Asia", "آسيا", "911", "10% appreciated", "10% ممتازة وتقدر بها الخدمات جداً محلياً", "false"],
  ["KW", "Kuwait", "الكويت", "🇰🇼", "KWD", "د.ك", "0.31", "ar", "Asia/Kuwait", "3", "Asia", "آسيا", "112", "10% appreciated", "10% إضافية خيارية ولطيفة للعاملين", "false"],
  ["QA", "Qatar", "قطر", "🇶🇦", "QAR", "ر.ق", "3.64", "ar", "Asia/Qatar", "3", "Asia", "آسيا", "999", "10% standard", "10% تضاف على الطاولة أو تدفع تقديرياً", "false"],
  ["OM", "Oman", "عمان", "🇴🇲", "OMR", "ر.ع.", "0.38", "ar", "Asia/Muscat", "4", "Asia", "آسيا", "9995", "10% optional", "خيارية بالكامل وتدفع فقط للمميزين", "false"],
  ["BH", "Bahrain", "البحرين", "🇧🇭", "BHD", "د.ب", "0.38", "ar", "Asia/Bahrain", "3", "Asia", "آسيا", "999", "10% customary", "10% معتادة وتترك عند الرغبة في التقدير", "false"],
  ["MA", "Morocco", "المغرب", "🇲🇦", "MAD", "د.م.", "10.0", "ar", "Africa/Casablanca", "1", "Africa", "أفريقيا", "19", "5-10% standard", "5-10% بقشيش معتاد جداً بالعملة المحلية", "false"],
  ["TN", "Tunisia", "تونس", "🇹🇳", "TND", "د.ت", "3.1", "ar", "Africa/Tunis", "1", "Africa", "أفريقيا", "197", "10% appreciated", "10% تترك على الطاولة كدليل احترام وامتنان", "false"],
  ["LB", "Lebanon", "لبنان", "🇱🇧", "LBP", "ل.ل", "89500.0", "ar", "Asia/Beirut", "2", "Asia", "آسيا", "112", "10-15%", "10-15% متعارف عليها لخدمة الطاولة السريعة", "false"],
  ["NZ", "New Zealand", "نيوزيلندا", "🇳🇿", "NZD", "$", "1.6", "en", "Pacific/Auckland", "12", "Oceania", "أوقيانوسيا", "111", "Not expected", "غير مطلوب على الإطلاق في نيوزيلندا", "true"],
  ["CL", "Chile", "تشيلي", "🇨🇱", "CLP", "$", "950.0", "es", "America/Santiago", "-4", "South America", "أمريكا الجنوبية", "133", "10% included", "تضاف 10% كبقشيش مقترح على الفاتورة", "true"],
  ["CO", "Colombia", "كولومبيا", "🇨🇴", "COP", "$", "3900.0", "es", "America/Bogota", "-5", "South America", "أمريكا الجنوبية", "123", "10% standard", "10% بقشيش تضاف تلقائياً مع خيار الرفض", "false"],
  ["PE", "Peru", "بيرو", "🇵🇪", "PEN", "S/.", "3.7", "es", "America/Lima", "-5", "South America", "أمريكا الجنوبية", "105", "10% standard", "10% معتادة لخدمة الطاولة ومجهود المضيف", "false"],
  ["PL", "Poland", "بولندا", "🇵🇱", "PLN", "zł", "4.0", "pl", "Europe/Warsaw", "1", "Europe", "أوروبا", "112", "10% customary", "10% من الحساب معتادة ويفضل تركها نقداً", "true"],
  ["CZ", "Czechia", "التشيك", "🇨🇿", "CZK", "Kč", "23.0", "cs", "Europe/Prague", "1", "Europe", "أوروبا", "112", "10% standard", "تعديد 10% أو تقريب قيمة الفاتورة للأعلى", "true"],
  ["HU", "Hungary", "المجر", "🇭🇺", "HUF", "Ft", "360.0", "hu", "Europe/Budapest", "1", "Europe", "أوروبا", "112", "10% is customary", "10% بقشيش معتاد جداً ويدفع مباشرة للمضيف", "true"],
  ["RO", "Romania", "رومانيا", "🇷🇴", "RON", "lei", "4.6", "ro", "Europe/Bucharest", "2", "Europe", "أوروبا", "112", "10-15% customary", "10-15% بقشيش معتاد جداً ويترك نقداً", "true"],
  ["PK", "Pakistan", "باكستان", "🇵🇰", "PKR", "₨", "278.0", "ur", "Asia/Karachi", "5", "Asia", "آسيا", "15", "10% customary", "10% مألوفة في المدن والمطاعم الفاخرة", "false"],
  ["BD", "Bangladesh", "بنغلاديش", "🇧🇩", "BDT", "৳", "110.0", "bn", "Asia/Dhaka", "6", "Asia", "آسيا", "999", "Small tip", "ترك الفكة البسيطة كاف ومحبب جداً", "false"],
  ["LK", "Sri Lanka", "سريلانكا", "🇱🇰", "LKR", "₨", "300.0", "si", "Asia/Colombo", "5.5", "Asia", "آسيا", "119", "10% often included", "تضاف 10% رسوم خدمة، البقشيش الإضافي اختياري", "false"],
  ["MV", "Maldives", "جزر المالديف", "🇲🇻", "MVR", ".ރ", "15.4", "dv", "Indian/Maldives", "5", "Asia", "آسيا", "119", "10% standard", "تضاف 10% في المنتجعات والخدمة ممتازة", "false"],
  ["BE", "Belgium", "بلجيكا", "🇧🇪", "EUR", "€", "0.92", "nl", "Europe/Brussels", "1", "Europe", "أوروبا", "101", "Service included", "الخدمة والضريبة مشمولة كلياً في الفاتورة", "true"],
  ["NG", "Nigeria", "نيجيريا", "🇳🇬", "NGN", "₦", "1400.0", "en", "Africa/Lagos", "1", "Africa", "أفريقيا", "112", "10% optional", "البقشيش خياري بنسبة 10% لتقدير الجهود", "false"],
  ["KE", "Kenya", "كينيا", "🇰🇪", "KES", "KSh", "130.0", "sw", "Africa/Nairobi", "3", "Africa", "أفريقيا", "999", "10% customary", "من المعتاد دفع بقشيش 10% للجولات السياحية", "false"],
  ["GH", "Ghana", "غانا", "🇬🇭", "GHS", "GH₵", "13.0", "en", "Africa/Accra", "0", "Africa", "أفريقيا", "191", "Small change", "تقريب الفكة للأعلى هو الأسهل والأنسب", "false"],
  ["IQ", "Iraq", "العراق", "🇮🇶", "IQD", "د.ع", "1310.0", "ar", "Asia/Baghdad", "3", "Asia", "آسيا", "104", "Small tip", "تقريب المبلغ أو ترك فكة بسيطة هو المعتاد", "false"],
  ["PS", "Palestine", "فلسطين", "🇵🇸", "ILS", "₪", "3.7", "ar", "Asia/Jerusalem", "2", "Asia", "آسيا", "100", "Small tip", "البقشيش بسيط واختياري بالكامل محلياً", "false"],
  ["IS", "Iceland", "آيسلندا", "🇮🇸", "ISK", "kr", "138.0", "is", "Atlantic/Reykjavik", "0", "Europe", "أوروبا", "112", "Included", "الخدمة مشمولة بالكامل ولا يتوقع أي بقشيش", "true"],
  ["CR", "Costa Rica", "كوستاريكا", "🇨🇷", "CRC", "₡", "515.0", "es", "America/Costa_Rica", "-6", "North America", "أمريكا الشمالية", "911", "10% standard", "تضاف 10% لخدمة الطاولة تلقائياً للفاتورة", "true"],
  ["PA", "Panama", "بنما", "🇵🇦", "PAB", "B/.", "1.0", "es", "America/Panama", "-5", "North America", "911", "10% standard", "10% معتادة لخدمة الطاولة في المطاعم", "true"],
  ["CU", "Cuba", "كوبا", "🇨🇺", "CUP", "$", "24.0", "es", "America/Havana", "-5", "North America", "106", "10% customary", "البقشيش 10% يدعم العمال المحليين جداً", "false"],
  ["UY", "Uruguay", "أوروغواي", "🇺🇾", "UYU", "$", "39.0", "es", "America/Montevideo", "-3", "South America", "أمريكا الجنوبية", "911", "10% customary", "10% بقشيش لخدمات الطعام معتادة ولطيفة", "true"],
  ["VE", "Venezuela", "فنزويلا", "🇻🇪", "VES", "Bs.S", "36.0", "es", "America/Caracas", "-4", "South America", "911", "10% customary", "10% بقشيش معتاد جداً لدعم الخدمات", "false"],
  ["EC", "Ecuador", "الإكوادور", "🇪🇨", "USD", "$", "1.0", "es", "America/Guayaquil", "-5", "South America", "911", "10% customary", "من المعتاد ترك 10% بقشيش في المطاعم", "false"],
  ["BO", "Bolivia", "بوليفيا", "🇧🇴", "BOB", "Bs", "6.9", "es", "America/La_Paz", "-4", "South America", "110", "10% standard", "البقشيش بنسبة 10% للخدمات الجيدة معتاد", "false"],
  ["PY", "Paraguay", "باراغواي", "🇵🇾", "PYG", "₲", "7300.0", "es", "America/Asuncion", "-4", "South America", "911", "10% customary", "من المعتاد ترك 10% لتقدير المضيفين", "false"],
  ["JM", "Jamaica", "جامايكا", "🇯🇲", "JMD", "$", "155.0", "en", "America/Jamaica", "-5", "North America", "أمريكا الشمالية", "119", "10-15%", "10-15% في المواقع السياحية متعارف عليها", "false"],
  ["BS", "Bahamas", "جزر البهاما", "🇧🇸", "BSD", "$", "1.0", "en", "America/Nassau", "-5", "North America", "911", "15%", "15% معيارية وغالباً ما تضاف للفاتورة", "true"],
  ["DO", "Dominican Republic", "جمهورية الدومينيكان", "🇩🇴", "DOP", "$", "59.0", "es", "America/Santo_Domingo", "-4", "North America", "911", "10% customary", "10% معتادة وتقدر جداً لدى العمالة", "false"],
  ["LU", "Luxembourg", "لوكسمبورغ", "🇱🇺", "EUR", "€", "0.92", "fr", "Europe/Luxembourg", "1", "Europe", "أوروبا", "113", "Service included", "الخدمة مشمولة بالكامل كلياً محلياً", "true"],
  ["HR", "Croatia", "كرواتيا", "🇭🇷", "EUR", "€", "0.92", "hr", "Europe/Zagreb", "1", "Europe", "أوروبا", "112", "10% is customary", "10% بقشيش لخدمات المطاعم معتادة جداً", "true"],
  ["SI", "Slovenia", "سلوفينيا", "🇸🇮", "EUR", "€", "0.92", "sl", "Europe/Ljubljana", "1", "Europe", "أوروبا", "112", "10% optional", "البقشيش خياري ومحبب عند الخدمة المتميزة", "true"],
  ["SK", "Slovakia", "سلوفاكيا", "🇸🇰", "EUR", "€", "0.92", "sk", "Europe/Bratislava", "1", "Europe", "أوروبا", "112", "Small tip", "تقريب المبلغ البسيط هو المعتاد في المطاعم", "true"],
  ["EE", "Estonia", "إستونيا", "🇪🇪", "EUR", "€", "0.92", "et", "Europe/Tallinn", "2", "Europe", "أوروبا", "112", "10% optional", "خيارية بالكامل وتدفع فقط عند الرضا التام", "true"],
  ["LV", "Latvia", "لاتفيا", "🇱🇻", "EUR", "€", "0.92", "lv", "Europe/Riga", "2", "Europe", "أوروبا", "112", "10% standard", "من المألوف دفع 10% تقديرية نقداً", "true"],
  ["LT", "Lithuania", "ليتوانيا", "🇱🇹", "EUR", "€", "0.92", "lt", "Europe/Vilnius", "2", "Europe", "أوروبا", "112", "10% standard", "10% من الفاتورة مستحسنة ومألوفة", "true"],
  ["BG", "Bulgaria", "بلغاريا", "🇧🇬", "BGN", "лв", "1.8", "bg", "Europe/Sofia", "2", "Europe", "أوروبا", "112", "10% customary", "10% بقشيش في مطاعم المدن متعارف عليه", "true"],
  ["RS", "Serbia", "صربيا", "🇷🇸", "RSD", "دينار", "108.0", "sr", "Europe/Belgrade", "1", "Europe", "أوروبا", "192", "10% customary", "من المألوف ترك 10% للعاملين والمضيفين", "true"],
  ["BA", "Bosnia and Herzegovina", "البوسنة والهرسك", "🇧🇦", "BAM", "KM", "1.8", "bs", "Europe/Sarajevo", "1", "Europe", "أوروبا", "122", "10% standard", "10% بقشيش معتاد لخدمة الطاولة ومقدّر", "true"],
  ["MK", "North Macedonia", "مقدونيا الشمالية", "🇲🇰", "MKD", "ден", "56.0", "mk", "Europe/Skopje", "1", "Europe", "أوروبا", "192", "10% customary", "البقشيش 10% معتاد ويفضل بالعملة المحلية", "true"],
  ["MT", "Malta", "مالطا", "🇲🇹", "EUR", "€", "0.92", "mt", "Europe/Malta", "1", "Europe", "أوروبا", "112", "10% customary", "10% بقشيش قياسي في المطاعم السياحية", "true"],
  ["CY", "Cyprus", "قبرص", "🇨🇾", "EUR", "€", "0.92", "el", "Asia/Nicosia", "2", "Asia", "آسيا", "112", "10% standard", "بقشيش 10% في حال عدم تضمين الخدمة", "true"],
];

// Helper to construct fully fledged CountryModel objects from raw compact DB
function parseCompactCountry(row: string[]): CountryModel {
  const code = row[0];
  const name = row[1];
  const nameAr = row[2];
  const flag = row[3];
  const currencyCode = row[4];
  const currencySymbol = row[5];
  const exchangeRate = parseFloat(row[6]);
  const langCode = row[7];
  const tzId = row[8];
  const tzOffset = parseInt(row[9]);
  const continent = row[10];
  const continentAr = row[11];
  const police = row[12];
  const tippingEn = row[13];
  const tippingAr = row[14];
  const waterSafe = row[15] === "true";

  const lang = LANGUAGES[langCode] || { code: langCode, name: "Local Language", nameAr: "اللغة المحلية", direction: "ltr" };
  const curr = { code: currencyCode, name: `${currencyCode} Currency`, nameAr: currencyCode, symbol: currencySymbol, exchangeRateToUSD: exchangeRate };

  return {
    code,
    name,
    nameAr,
    flag,
    continent,
    continentAr,
    currency: currencyCode,
    currencySymbol,
    exchangeRateToUSD: exchangeRate,
    primaryLanguage: lang,
    languages: [lang],
    currencyModel: curr,
    timeZone: { id: tzId, name: tzId.split("/").pop() || tzId, offset: tzOffset },
    emergencyNumbers: { police, ambulance: police, fire: police, general: police },
    tippingCulture: tippingEn,
    tippingCultureAr: tippingAr,
    tapWaterSafe: waterSafe,
    tapWaterNotes: waterSafe ? "Tap water is safe and monitored." : "Bottled water is recommended.",
    tapWaterNotesAr: waterSafe ? "مياه الصنبور آمنة وصالحة للشرب." : "ينصح بشراء مياه الشرب المعبأة.",
    cardPaymentFriendly: "medium",
    cardPaymentNotes: "Cards are widely accepted in city centers.",
    cardPaymentNotesAr: "تُقبل بطاقات الدفع على نطاق واسع في وسط المدن.",
  };
}

export const CENTRALIZED_COUNTRIES: CountryModel[] = WORLD_COMPACT_DB.map(parseCompactCountry);

// Helper to fallback dynamically for any unlisted ISO code in the world to ensure 100% full global coverage
function generateDynamicWorldFallback(code: string): CountryModel {
  const cleanCode = code.toUpperCase().trim();
  // Standard list of some world flags & currencies just for complete dynamic safety
  const extraFlags: Record<string, string> = {
    AD: "🇦🇩", AM: "🇦🇲", AO: "🇦🇴", AG: "🇦🇬", BO: "🇧🇴", PY: "🇵🇾", JM: "🇯🇲", BS: "🇧🇸", LU: "🇱🇺", SI: "🇸🇪",
    AF: "🇦🇫", AL: "🇦🇱", DZ: "🇩🇿", CL: "🇨🇱", KH: "🇰🇭", LA: "🇱🇦", MM: "🇲🇲", MN: "🇲🇳", UA: "🇺🇦", MV: "🇲🇻"
  };
  const extraCurrencies: Record<string, { code: string; symbol: string; rate: number }> = {
    AF: { code: "AFN", symbol: "؋", rate: 88.0 },
    AL: { code: "ALL", symbol: "L", rate: 94.0 },
    DZ: { code: "DZD", symbol: "د.ج", rate: 134.0 },
    AM: { code: "AMD", symbol: "֏", rate: 400.0 },
    KH: { code: "KHR", symbol: "៛", rate: 4100.0 },
    UA: { code: "UAH", symbol: "₴", rate: 39.0 }
  };

  const flag = extraFlags[cleanCode] || "🏳️";
  const curr = extraCurrencies[cleanCode] || { code: "USD", symbol: "$", rate: 1.0 };

  return {
    code: cleanCode,
    name: `Country (${cleanCode})`,
    nameAr: `دولة (${cleanCode})`,
    flag,
    continent: "Global",
    continentAr: "عالمي",
    currency: curr.code,
    currencySymbol: curr.symbol,
    exchangeRateToUSD: curr.rate,
    primaryLanguage: LANGUAGES.en,
    languages: [LANGUAGES.en],
    currencyModel: { code: curr.code, name: `${curr.code} Currency`, nameAr: curr.code, symbol: curr.symbol, exchangeRateToUSD: curr.rate },
    timeZone: { id: "UTC", name: "UTC", offset: 0 },
    emergencyNumbers: { police: "112", ambulance: "112", fire: "112", general: "112" },
    tippingCulture: "Varies. Check with locals.",
    tippingCultureAr: "يختلف البقشيش حسب المكان، يفضل الاستفسار من الموظفين.",
    tapWaterSafe: false,
    tapWaterNotes: "Bottled water is recommended.",
    tapWaterNotesAr: "ينصح بشراء مياه معبأة ومغلقة لتجنب المشاكل الصحية.",
    cardPaymentFriendly: "medium",
    cardPaymentNotes: "Cards are accepted in main tourist destinations.",
    cardPaymentNotesAr: "بطاقات الائتمان مقبولة بشكل مقبول في الفنادق السياحية.",
  };
}

export const CountryManager = {
  // Get all registered countries
  getAllCountries(): CountryModel[] {
    return CENTRALIZED_COUNTRIES;
  },

  // Get active destinations (excluding USA)
  getDestinations(): CountryModel[] {
    return CENTRALIZED_COUNTRIES.filter(c => c.code !== "US");
  },

  // Find a country by code with absolute crash-safety (checks fallback generator)
  getCountryByCode(code: string): CountryModel {
    if (!code) return CENTRALIZED_COUNTRIES[0];
    const matched = CENTRALIZED_COUNTRIES.find(c => c.code.toUpperCase() === code.toUpperCase());
    if (matched) return matched;
    return generateDynamicWorldFallback(code);
  },

  // Dynamic system fallback for adding any future country easily
  createDynamicCountry(code: string, name: string, nameAr: string, flag: string, currencyCode: string, currencySymbol: string, exchangeRate: number, languageCode: string): CountryModel {
    const lang = LANGUAGES[languageCode] || { code: languageCode, name: name, nameAr: nameAr, direction: "ltr" };
    const curr = { code: currencyCode, name: `${currencyCode} Currency`, nameAr: currencyCode, symbol: currencySymbol, exchangeRateToUSD: exchangeRate };
    
    return {
      code: code.toUpperCase(),
      name,
      nameAr,
      flag,
      continent: "Global",
      continentAr: "عالمي",
      currency: currencyCode,
      currencySymbol,
      exchangeRateToUSD: exchangeRate,
      primaryLanguage: lang,
      languages: [lang],
      currencyModel: curr,
      timeZone: { id: `UTC`, name: "UTC", offset: 0 },
      emergencyNumbers: { police: "112", ambulance: "112", fire: "112", general: "112" },
      tippingCulture: "Varies. Ask locals.",
      tippingCultureAr: "يختلف. اسأل السكان المحليين أو أدلة السفر.",
      tapWaterSafe: false,
      tapWaterNotes: "Check with your hotel before drinking.",
      tapWaterNotesAr: "تحقق مع فندقك أو أدلة السفر قبل الشرب.",
      cardPaymentFriendly: "medium",
      cardPaymentNotes: "Cards accepted in main cities.",
      cardPaymentNotesAr: "البطاقات مقبولة في المدن الرئيسية. يوصى بالنقد للمناطق الريفية.",
    };
  },

  // Fast integrated search across names, Arabic names, codes, languages, currencies, and timezones
  searchCountries(query: string): CountryModel[] {
    if (!query || !query.trim()) return CENTRALIZED_COUNTRIES;
    const cleanQuery = query.toLowerCase().trim();
    
    return CENTRALIZED_COUNTRIES.filter(c => {
      return (
        c.name.toLowerCase().includes(cleanQuery) ||
        c.nameAr.toLowerCase().includes(cleanQuery) ||
        c.code.toLowerCase().includes(cleanQuery) ||
        c.primaryLanguage.name.toLowerCase().includes(cleanQuery) ||
        c.primaryLanguage.nameAr.toLowerCase().includes(cleanQuery) ||
        c.currencyModel.code.toLowerCase().includes(cleanQuery) ||
        c.currencyModel.name.toLowerCase().includes(cleanQuery) ||
        c.currencyModel.nameAr.toLowerCase().includes(cleanQuery) ||
        c.timeZone.name.toLowerCase().includes(cleanQuery) ||
        c.timeZone.id.toLowerCase().includes(cleanQuery) ||
        c.continent.toLowerCase().includes(cleanQuery) ||
        c.continentAr.toLowerCase().includes(cleanQuery)
      );
    });
  },

  // Helper to convert currency values between any two countries
  convertCurrency(amount: number, fromCountryCode: string, toCountryCode: string): number {
    const from = this.getCountryByCode(fromCountryCode);
    const to = this.getCountryByCode(toCountryCode);
    if (!from || !to) return amount;
    
    // Convert to USD first
    const inUSD = amount / from.currencyModel.exchangeRateToUSD;
    // Convert to target
    return inUSD * to.currencyModel.exchangeRateToUSD;
  },

  // Helper to calculate timezone differences (destination timezone compared to home timezone)
  getTimeDifference(fromTimeZone: TimeZoneModel, toTimeZone: TimeZoneModel): string {
    if (!fromTimeZone || typeof fromTimeZone.offset !== "number" || !toTimeZone || typeof toTimeZone.offset !== "number") {
      return "Same time";
    }
    const diff = toTimeZone.offset - fromTimeZone.offset;
    if (diff === 0) return "Same time";
    const sign = diff > 0 ? "+" : "";
    return `${sign}${diff} hrs`;
  },

  // Helper to get local time in a country's timezone
  getLocalTime(timeZone: TimeZoneModel): string {
    const now = new Date();
    if (!timeZone || typeof timeZone.offset !== "number") {
      return now.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", hour12: false });
    }
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const local = new Date(utc + 3600000 * timeZone.offset);
    return local.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", hour12: false });
  }
};
