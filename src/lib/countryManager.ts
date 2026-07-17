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

// CountryModel extends the base Country interface for complete backward compatibility
export interface CountryModel {
  code: string;       // e.g. "JP", "IT", "FR", "TH", "MX", "US"
  name: string;
  nameAr: string;
  flag: string;
  
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
};

// 2. Centralized currencies dictionary
export const CURRENCIES: Record<string, CurrencyModel> = {
  USD: { code: "USD", name: "US Dollar", nameAr: "دولار أمريكي", symbol: "$", exchangeRateToUSD: 1.0 },
  JPY: { code: "JPY", name: "Japanese Yen", nameAr: "ين ياباني", symbol: "¥", exchangeRateToUSD: 150.0 },
  EUR: { code: "EUR", name: "Euro", nameAr: "يورو", symbol: "€", exchangeRateToUSD: 0.92 },
  THB: { code: "THB", name: "Thai Baht", nameAr: "بات تايلاندي", symbol: "฿", exchangeRateToUSD: 35.0 },
  MXN: { code: "MXN", name: "Mexican Peso", nameAr: "بيزو مكسيكي", symbol: "$", exchangeRateToUSD: 17.5 },
};

// 3. Centralized time zones dictionary
export const TIME_ZONES: Record<string, TimeZoneModel> = {
  "America/New_York": { id: "America/New_York", name: "EST/EDT", offset: -5 },
  "Asia/Tokyo": { id: "Asia/Tokyo", name: "JST", offset: 9 },
  "Europe/Rome": { id: "Europe/Rome", name: "CET/CEST", offset: 1 },
  "Europe/Paris": { id: "Europe/Paris", name: "CET/CEST", offset: 1 },
  "Asia/Bangkok": { id: "Asia/Bangkok", name: "ICT", offset: 7 },
  "America/Mexico_City": { id: "America/Mexico_City", name: "CST/CDT", offset: -6 },
};

// 4. Centralized static countries list with our rich schema
export const CENTRALIZED_COUNTRIES: CountryModel[] = [
  {
    code: "US",
    name: "United States",
    nameAr: "الولايات المتحدة",
    flag: "🇺🇸",
    currency: "USD",
    currencySymbol: "$",
    exchangeRateToUSD: 1.0,
    primaryLanguage: LANGUAGES.en,
    languages: [LANGUAGES.en, LANGUAGES.es],
    currencyModel: CURRENCIES.USD,
    timeZone: TIME_ZONES["America/New_York"],
    emergencyNumbers: { police: "911", ambulance: "911", fire: "911", general: "911" },
    tippingCulture: "Customary to tip 15-20% for table service, taxi rides, and bar visits.",
    tippingCultureAr: "من المعتاد دفع بقشيش بنسبة 15-20٪ لخدمة الطاولة وسيارات الأجرة والحانات.",
    tapWaterSafe: true,
    tapWaterNotes: "Tap water is safe and strictly monitored across virtually all municipal areas.",
    tapWaterNotesAr: "مياه الصنبور آمنة وخاضعة لرقابة صارمة في جميع المناطق البلدية تقريبًا.",
    cardPaymentFriendly: "high",
    cardPaymentNotes: "Cards and mobile contact-less payments are accepted almost everywhere.",
    cardPaymentNotesAr: "تُقبل البطاقات والمدفوعات اللاتلامسية عبر الهاتف في كل مكان تقريبًا.",
  },
  {
    code: "JP",
    name: "Japan",
    nameAr: "اليابان",
    flag: "🇯🇵",
    currency: "JPY",
    currencySymbol: "¥",
    exchangeRateToUSD: 150.0,
    primaryLanguage: LANGUAGES.ja,
    languages: [LANGUAGES.ja, LANGUAGES.en],
    currencyModel: CURRENCIES.JPY,
    timeZone: TIME_ZONES["Asia/Tokyo"],
    emergencyNumbers: { police: "110", ambulance: "119", fire: "119", general: "03-3501-0110" },
    tippingCulture: "Tipping is non-existent and can be considered awkward or insulting. Exceptional service is built into the bill.",
    tippingCultureAr: "البقشيش غير موجود تمامًا وقد يكون محرجًا أو مهينًا. الخدمة الممتازة مدمجة في الفاتورة.",
    tapWaterSafe: true,
    tapWaterNotes: "Tap water is 100% safe to drink everywhere in Japan. Premium filtration systems are standard.",
    tapWaterNotesAr: "مياه الصنبور آمنة للشرب بنسبة 100٪ في كل مكان باليابان. أنظمة التصفية الممتازة قياسية.",
    cardPaymentFriendly: "medium",
    cardPaymentNotes: "Cash is still widely preferred in traditional temples, street stalls, and small diners, but major stores accept cards.",
    cardPaymentNotesAr: "لا يزال النقد مفضلاً على نطاق واسع في المعابد التقليدية وأكشاك الشوارع والمطاعم الصغيرة، لكن المتاجر الكبرى تقبل البطاقات.",
  },
  {
    code: "IT",
    name: "Italy",
    nameAr: "إيطاليا",
    flag: "🇮🇹",
    currency: "EUR",
    currencySymbol: "€",
    exchangeRateToUSD: 0.92,
    primaryLanguage: LANGUAGES.it,
    languages: [LANGUAGES.it, LANGUAGES.en],
    currencyModel: CURRENCIES.EUR,
    timeZone: TIME_ZONES["Europe/Rome"],
    emergencyNumbers: { police: "112", ambulance: "118", fire: "115", general: "112" },
    tippingCulture: "Not expected. A 'coperto' (cover charge) is usually added to restaurant bills. Small change can be left as goodwill.",
    tippingCultureAr: "غير متوقع. عادة ما تضاف رسوم خدمة (coperto) إلى فواتير المطاعم. يمكن ترك بقية صغيرة كبادرة طيبة.",
    tapWaterSafe: true,
    tapWaterNotes: "Safe to drink. Rome is famous for its 'nasoni' public drinking fountains flowing with cold spring water.",
    tapWaterNotesAr: "آمنة للشرب. تشتهر روما بنوافير الشرب العامة 'nasoni' التي تتدفق بانتظام بماء ينابيع بارد.",
    cardPaymentFriendly: "medium",
    cardPaymentNotes: "Cards are accepted in cities, but carry some cash for coffee, bus tickets, or small trattorias.",
    cardPaymentNotesAr: "تُقبل البطاقات في المدن، ولكن يُنصح بحمل بعض النقد لشراء القهوة أو تذاكر الحافلات أو في المطاعم الصغيرة.",
  },
  {
    code: "FR",
    name: "France",
    nameAr: "فرنسا",
    flag: "🇫🇷",
    currency: "EUR",
    currencySymbol: "€",
    exchangeRateToUSD: 0.92,
    primaryLanguage: LANGUAGES.fr,
    languages: [LANGUAGES.fr, LANGUAGES.en],
    currencyModel: CURRENCIES.EUR,
    timeZone: TIME_ZONES["Europe/Paris"],
    emergencyNumbers: { police: "17", ambulance: "15", fire: "18", general: "112" },
    tippingCulture: "Restaurant bills include a 15% service charge ('service compris'). You can leave an extra 1-2 Euros for polite service.",
    tippingCultureAr: "تشمل فواتير المطاعم رسوم خدمة بنسبة 15٪. يمكنك ترك 1-2 يورو إضافية كبادرة لطيفة للخدمة المهذبة.",
    tapWaterSafe: true,
    tapWaterNotes: "Perfectly safe. Restaurants are legally obligated to provide a free carafe of tap water ('carafe d'eau') upon request.",
    tapWaterNotesAr: "آمنة تمامًا. المطاعم ملزمة قانونًا بتقديم إبريق مجاني من مياه الصنبور عند الطلب.",
    cardPaymentFriendly: "high",
    cardPaymentNotes: "Cards are highly integrated. Even extremely small payments at local boulangeries are made using contactless cards.",
    cardPaymentNotesAr: "البطاقات مدمجة للغاية. حتى المدفوعات الصغيرة جدًا في المخابز المحلية تتم باستخدام البطاقات اللاتلامسية.",
  },
  {
    code: "TH",
    name: "Thailand",
    nameAr: "تايلاند",
    flag: "🇹🇭",
    currency: "THB",
    currencySymbol: "฿",
    exchangeRateToUSD: 35.0,
    primaryLanguage: LANGUAGES.th,
    languages: [LANGUAGES.th, LANGUAGES.en],
    currencyModel: CURRENCIES.THB,
    timeZone: TIME_ZONES["Asia/Bangkok"],
    emergencyNumbers: { police: "191", ambulance: "1669", fire: "199", general: "1155" },
    tippingCulture: "Not traditional, but widely appreciated in tourist hubs. Rounding up taxi fares or leaving 20-50 Baht is polite.",
    tippingCultureAr: "ليس تقليديًا، ولكنه يحظى بتقدير واسع في المراكز السياحية. تقريب أجرة التاكسي أو ترك 20-50 بات يعتبر لطيفًا.",
    tapWaterSafe: false,
    tapWaterNotes: "Not recommended for drinking. Use cheap bottled water from convenience stores or public filtered water dispensers.",
    tapWaterNotesAr: "لا ينصح بالشرب منها مباشرة. استخدم المياه المعبأة الرخيصة من المتاجر أو موزعات المياه المفلترة العامة.",
    cardPaymentFriendly: "low",
    cardPaymentNotes: "Highly cash-dependent, especially for street food, tuk-tuks, and local markets. 7-Eleven accepts credit cards above 200 Baht.",
    cardPaymentNotesAr: "تعتمد بشكل كبير على النقد، خاصة بالنسبة لأطعمة الشوارع والتوك توك والأسواق المحلية. تقبل سيفن إلفن البطاقات للمشتريات فوق 200 بات.",
  },
  {
    code: "MX",
    name: "Mexico",
    nameAr: "المكسيك",
    flag: "🇲🇽",
    currency: "MXN",
    currencySymbol: "$",
    exchangeRateToUSD: 17.5,
    primaryLanguage: LANGUAGES.es,
    languages: [LANGUAGES.es, LANGUAGES.en],
    currencyModel: CURRENCIES.MXN,
    timeZone: TIME_ZONES["America/Mexico_City"],
    emergencyNumbers: { police: "911", ambulance: "911", fire: "911", general: "911" },
    tippingCulture: "Customary to tip 10-15% in restaurants. Small tipping is also standard for grocery baggers and gas attendants.",
    tippingCultureAr: "من المعتاد دفع بقشيش بنسبة 10-15٪ في المطاعم. البقشيش الصغير قياسي أيضًا لعاملي تعبئة البقالة ومحطات الوقود.",
    tapWaterSafe: false,
    tapWaterNotes: "Do not drink tap water. Even locals drink purified bottled water ('agua purificada') or use microdyne drops.",
    tapWaterNotesAr: "لا تشرب مياه الصنبور. حتى السكان المحليون يشربون المياه المعبأة النقية أو يستخدمون قطرات التعقيم.",
    cardPaymentFriendly: "medium",
    cardPaymentNotes: "Accepted in major supermarkets and hotels, but cash is strictly required for street tacos, local markets, and public buses.",
    cardPaymentNotesAr: "مقبولة في السوبرماركت الكبرى والفنادق، ولكن النقد مطلوب بشكل صارم لشراء التاكو من الشارع، والأسواق المحلية، والحافلات العامة.",
  },
];

// 5. Scalable central management system API
export const CountryManager = {
  // Get all registered countries
  getAllCountries(): CountryModel[] {
    return CENTRALIZED_COUNTRIES;
  },

  // Get active destinations (excluding USA)
  getDestinations(): CountryModel[] {
    return CENTRALIZED_COUNTRIES.filter(c => c.code !== "US");
  },

  // Find a country by code
  getCountryByCode(code: string): CountryModel {
    const matched = CENTRALIZED_COUNTRIES.find(c => c.code.toUpperCase() === code.toUpperCase());
    // Fallback to US if not found to prevent crashes
    return matched || CENTRALIZED_COUNTRIES[0];
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
      currency: currencyCode,
      currencySymbol,
      exchangeRateToUSD: exchangeRate,
      primaryLanguage: lang,
      languages: [lang],
      currencyModel: curr,
      timeZone: { id: `UTC`, name: "UTC", offset: 0 },
      emergencyNumbers: { police: "112", ambulance: "112", fire: "112", general: "112" },
      tippingCulture: "Varies. Ask locals or guide books.",
      tippingCultureAr: "يختلف. اسأل السكان المحليين أو أدلة السفر.",
      tapWaterSafe: false,
      tapWaterNotes: "Check with your hotel or local guides before drinking.",
      tapWaterNotesAr: "تحقق مع فندقك أو أدلة السفر قبل الشرب.",
      cardPaymentFriendly: "medium",
      cardPaymentNotes: "Cards accepted in main cities. Cash recommended for rural areas.",
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
        c.timeZone.id.toLowerCase().includes(cleanQuery)
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
    const diff = toTimeZone.offset - fromTimeZone.offset;
    if (diff === 0) return "Same time";
    const sign = diff > 0 ? "+" : "";
    return `${sign}${diff} hrs`;
  },

  // Helper to get local time in a country's timezone
  getLocalTime(timeZone: TimeZoneModel): string {
    const now = new Date();
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const local = new Date(utc + 3600000 * timeZone.offset);
    return local.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", hour12: false });
  }
};
