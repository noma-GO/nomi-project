import React, { useState } from "react";
import { 
  Compass, Globe, Smartphone, Landmark, RefreshCw, Sun, 
  MapPin, ShieldCheck, Heart, Sparkles, TrendingUp, ChevronRight, 
  ArrowRightLeft, AlertCircle, Info, ThumbsUp, HelpCircle, Search, 
  Camera, Languages, MessageSquare, Lightbulb, User, DollarSign
} from "lucide-react";
import { Country, Product } from "../types";
import { useLanguage } from "../lib/i18n";

interface HomeViewProps {
  currentCountry: Country;
  homeCountry: Country;
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onNavigate: (screen: any) => void;
}

export default function HomeView({ 
  currentCountry, 
  homeCountry, 
  products, 
  onSelectProduct,
  onNavigate 
}: HomeViewProps) {
  const [localCalculatorValue, setLocalCalculatorValue] = useState<string>("1500");
  const [searchQuery, setSearchQuery] = useState("");
  const { t, language } = useLanguage();
  const isAr = language === "ar";

  // Calculate live conversion
  const getCalculatorResult = () => {
    const val = parseFloat(localCalculatorValue);
    if (isNaN(val)) return "0.00";
    const inUSD = val / currentCountry.exchangeRateToUSD;
    const inHome = inUSD * homeCountry.exchangeRateToUSD;
    return inHome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Filter products by current country and query
  const countryProducts = products.filter(p => p.countryCode === currentCountry.code);
  const recentProducts = countryProducts.slice(0, 3);

  // Search results
  const filteredSearch = searchQuery.trim() !== "" 
    ? countryProducts.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  // Active country vibes
  const getVibeAdvisory = () => {
    switch(currentCountry.code) {
      case "JP":
        return {
          hygiene: isAr ? "ممتازة (10/10)" : "Outstanding (10/10)",
          tipping: isAr ? "ممنوع تماماً" : "Forbidden (Offensive)",
          tapWater: isAr ? "آمنة ونظيفة 100%" : "100% Safe & Clean",
          cardPayment: isAr ? "مرتفع (يفضل Suica والنقد)" : "High (Suica/Cash preferred)",
          emergencyNum: "119 / 110",
          localVibe: isAr 
            ? "وسائل نقل هادئة للغاية. احتفظ بالقمامة في حقيبتك لعدم وجود سلال مهملات بالشارع!" 
            : "Extremely quiet public transit. Keep trash in your bag; there are no street bins!",
          chips: isAr 
            ? ["ممنوع الأكل أثناء المشي", "القطارات دقيقة بالثانية", "احمل كاش دائماً للقطارات"]
            : ["No eating while walking", "Trains are on-time to the second", "Suica card is essential"]
        };
      case "IT":
        return {
          hygiene: isAr ? "جيد (8/10)" : "Good (8/10)",
          tipping: isAr ? "غير مطلوب (توجد رسوم Coperto)" : "Not expected (Coperto on bill)",
          tapWater: isAr ? "آمنة (استخدم نوافير Nasoni)" : "Safe (Use public Nasoni fountains)",
          cardPayment: isAr ? "مقبول بشكل واسع" : "Widely accepted",
          emergencyNum: "112",
          localVibe: isAr 
            ? "انتبه من النشالين في محطة تيرميني. قم بختم تذكرة القطار الإقليمي قبل الصعود!" 
            : "Watch out for pickpockets at Termini Station. Validate regional train tickets before boarding!",
          chips: isAr
            ? ["القهوة واقفاً أرخص بكثير", "اطلب ماء صنبور 'Acqua del rubinetto'", "اختم تذكرة القطار"]
            : ["Coffee standing is cheaper", "Ask for tap 'Acqua del rubinetto'", "Validate train tickets"]
        };
      case "FR":
        return {
          hygiene: isAr ? "جيد جداً (8.5/10)" : "Very Good (8.5/10)",
          tipping: isAr ? "الخدمة مشمولة بالفاتورة" : "Service Compris (Tip not needed)",
          tapWater: isAr ? "آمنة (اطلب Carafe d'eau مجاناً)" : "100% Safe (Request free Carafe d'eau)",
          cardPayment: isAr ? "مرتفع جداً (Carte Bleue)" : "Extremely High (Carte Bleue)",
          emergencyNum: "112",
          localVibe: isAr 
            ? "قل دائماً 'Bonjour' (مرحباً) قبل طلب المساعدة من أي بائع أو موظف!" 
            : "Always say 'Bonjour' before asking any employee for help, or you will be ignored!",
          chips: isAr
            ? ["قل بونجور دائماً", "اطلب ماء مجاني بالمطعم", "احذر من نشالي المترو"]
            : ["Always say Bonjour first", "Water is free in restaurants", "Beware of metro pickpockets"]
        };
      case "TH":
        return {
          hygiene: isAr ? "متوسط (طعام الشارع آمن ساخناً)" : "Moderate (Street food safe if hot)",
          tipping: isAr ? "غير معتاد ولكن الباقي البسيط محبب" : "Not traditional but change is nice",
          tapWater: isAr ? "تجنبها (استخدم المعبأة فقط)" : "Avoid (Drink strictly bottled water)",
          cardPayment: isAr ? "متوسط (نظام PromptPay والنقد)" : "Moderate (PromptPay & Cash rules)",
          emergencyNum: "1155",
          localVibe: isAr 
            ? "احترم الأسرة المالكة والرموز البوذية دائماً. اخلع حذاءك عند عتبات المعابد والمنازل." 
            : "Never speak ill of royalty. Remove shoes when entering temples or private homes.",
          chips: isAr
            ? ["اخلع الحذاء بالمعبد", "اشرب مياه معبأة حصراً", "متاجر 7-Eleven كنز للتوفير"]
            : ["Remove shoes in temples", "Stick to bottled water", "7-Eleven has the best deals"]
        };
      case "MX":
        return {
          hygiene: isAr ? "متوسط (تناول طعاماً ساخناً)" : "Moderate (Eat busy hot food stalls)",
          tipping: isAr ? "من 10% إلى 15% متوقع" : "10% to 15% expected",
          tapWater: isAr ? "تجنبها تماماً (استخدم المعبأة)" : "Avoid (Strictly bottled water only)",
          cardPayment: isAr ? "متوسط (يفضل الكاش للأكشاك)" : "Moderate (Keep cash for street food)",
          emergencyNum: "911",
          localVibe: isAr 
            ? "تناول الطعام في أسواق 'fondas' للتوفير. تفاوض مع سيارات الأجرة قبل الصعود." 
            : "Dine at market 'fondas' for best local rates. Set taxi fare prior to entry.",
          chips: isAr
            ? ["فاوض الأجرة أولاً", "اشرب مياه معبأة", "تناول الطعام في الفونداس"]
            : ["Negotiate taxi fares first", "Strictly bottled water", "Eat at local 'fondas'"]
        };
      default:
        return {
          hygiene: isAr ? "جيد ومقبول" : "Good and verified",
          tipping: isAr ? "اختياري" : "Optional / Discretionary",
          tapWater: isAr ? "يفضل المعبأة" : "Bottled suggested",
          cardPayment: isAr ? "مقبول" : "Accepted",
          emergencyNum: "112",
          localVibe: isAr ? "تماشى مع وتيرة السكان المحليين والتزم القواعد العامة." : "Match native paces and respect guidelines.",
          chips: isAr ? ["التزم القواعد العامة", "قارن الأسعار", "المتاجر الكبرى أوفر"] : ["Check prices first", "Supermarkets are cheaper", "Stay alert"]
        };
    }
  };

  const vibe = getVibeAdvisory();

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar p-4 flex flex-col space-y-4 h-full pb-28 bg-slate-50" id="home-view-container">
      
      {/* Dynamic Top Greeting Card */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-3xl p-5 shadow-md relative overflow-hidden shrink-0">
        <div className="absolute right-[-20px] top-[-20px] w-28 h-28 bg-blue-500/20 rounded-full blur-xl"></div>
        <div className="absolute left-[30%] bottom-[-40px] w-36 h-36 bg-sky-400/20 rounded-full blur-2xl"></div>

        <div className="relative z-10 flex justify-between items-start">
          <div className="space-y-1">
            <span className="text-[10px] bg-blue-500/50 text-blue-100 border border-blue-400/30 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
              {t("home.explorer_level")}
            </span>
            <h2 className="text-2xl font-display font-extrabold tracking-tight mt-1">{t("home.greeting")}</h2>
            <p className="text-xs text-blue-100/90 font-medium">
              {t("home.exploring_in")} <strong className="text-white">{currentCountry.flag} {isAr ? (currentCountry.nameAr || currentCountry.name) : currentCountry.name}</strong>.
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-2.5 text-center border border-white/10 shrink-0">
            <Sun className="w-6 h-6 text-yellow-300 mx-auto animate-pulse" />
            <span className="text-[10px] block font-bold text-white mt-1">{isAr ? "مشمس 24° م" : "24°C Sunny"}</span>
          </div>
        </div>

        {/* Dynamic XP Progress Line */}
        <div className="mt-4 pt-4 border-t border-blue-500/30 relative z-10">
          <div className="flex justify-between text-[10px] font-mono text-blue-100 mb-1">
            <span>{t("home.progress_lvl", { level: 5 })}</span>
            <span className="font-bold">{isAr ? "2,450 / 3,000 نقطة" : "2,450 / 3,000 XP"}</span>
          </div>
          <div className="w-full h-2 bg-blue-800 rounded-full overflow-hidden">
            <div className="h-full bg-sky-300 rounded-full transition-all duration-500" style={{ width: "81%" }}></div>
          </div>
        </div>
      </div>

      {/* GLOBAL SEARCH BAR & SEARCH RESULTS */}
      <div className="relative shrink-0" id="global-search-container">
        <div className="bg-white border border-slate-100 rounded-2xl p-1 shadow-sm flex items-center gap-2">
          <div className="p-2 text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isAr ? "ابحث عن منتج، علامة تجارية أو فئة..." : "Search products, brands, barcodes..."}
            className={`flex-1 bg-transparent text-xs text-slate-800 focus:outline-none font-medium py-2 ${isAr ? "text-right pr-2" : "text-left pl-2"}`}
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery("")}
              className="text-[10px] text-slate-400 hover:text-slate-600 px-2 font-bold"
            >
              {isAr ? "مسح" : "Clear"}
            </button>
          )}
        </div>

        {/* Dropdown search result overlay */}
        {searchQuery.trim() !== "" && (
          <div className="absolute top-full inset-x-0 mt-1 bg-white border border-slate-100 rounded-2xl shadow-xl z-50 max-h-60 overflow-y-auto no-scrollbar p-2 animate-fade-in">
            <div className="p-2 border-b border-slate-50 flex justify-between items-center text-[10px] text-slate-400 font-bold">
              <span>{isAr ? `نتائج البحث (${filteredSearch.length})` : `Search Results (${filteredSearch.length})`}</span>
              <span>{isAr ? "الأسعار محلية" : "Local prices"}</span>
            </div>
            
            {filteredSearch.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400 font-medium">
                {isAr ? "لا توجد منتجات مطابقة لهذا البحث" : "No matching products found"}
              </div>
            ) : (
              filteredSearch.map(p => (
                <div
                  key={p.id}
                  onClick={() => {
                    onSelectProduct(p);
                    setSearchQuery("");
                    onNavigate("product-details");
                  }}
                  className="p-2.5 hover:bg-blue-50/50 rounded-xl flex items-center justify-between gap-3 cursor-pointer transition-all border-b border-slate-50 last:border-0"
                >
                  <div className="text-left">
                    <p className="text-xs font-bold text-slate-800">{p.name}</p>
                    <p className="text-[9px] text-slate-400">{p.brand} · {p.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black text-blue-600">
                      {currentCountry.currencySymbol}{p.priceInLocal}
                    </p>
                    <p className="text-[9px] text-emerald-600 font-semibold">
                      {homeCountry.currencySymbol}{((p.priceInLocal / currentCountry.exchangeRateToUSD) * homeCountry.exchangeRateToUSD).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* QUICK SMART SUGGESTIONS CHIPS (Horizontal Scroll) */}
      <div className="w-full shrink-0 overflow-x-auto no-scrollbar flex gap-2 py-1" id="smart-chips-bar">
        {vibe.chips.map((chipText, idx) => (
          <div
            key={idx}
            className="flex items-center gap-1 bg-blue-50/70 border border-blue-100/40 text-blue-800 rounded-full px-3.5 py-1.5 text-[10px] font-extrabold whitespace-nowrap shadow-sm shrink-0"
          >
            <Lightbulb className="w-3 h-3 text-amber-500 animate-pulse" />
            <span>{chipText}</span>
          </div>
        ))}
      </div>

      {/* SERVICE ACCESS GRID (2x2 Quick Cards) */}
      <div className="grid grid-cols-2 gap-3 shrink-0" id="service-access-grid">
        
        {/* Card 1: Camera Scan */}
        <button
          onClick={() => onNavigate("scan")}
          className="bg-white border border-slate-100 p-4 rounded-3xl text-left shadow-sm hover:scale-102 active:scale-98 transition-all flex flex-col justify-between h-28 group relative overflow-hidden"
        >
          <div className="absolute right-[-10px] bottom-[-10px] w-12 h-12 bg-blue-500/5 rounded-full group-hover:scale-150 transition-all duration-300"></div>
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Camera className="w-5 h-5 group-hover:scale-110 transition-all" />
          </div>
          <div>
            <h4 className="text-xs font-display font-black text-slate-800 leading-tight">
              {isAr ? "ماسح الكاميرا الذكي" : "AI Camera Scanner"}
            </h4>
            <p className="text-[9px] text-slate-400 mt-0.5 line-clamp-1">
              {isAr ? "باركود، صور وقراءة نصوص" : "Barcode, OCR, translation"}
            </p>
          </div>
        </button>

        {/* Card 2: AI Translator */}
        <button
          onClick={() => onNavigate("translate")}
          className="bg-white border border-slate-100 p-4 rounded-3xl text-left shadow-sm hover:scale-102 active:scale-98 transition-all flex flex-col justify-between h-28 group relative overflow-hidden"
        >
          <div className="absolute right-[-10px] bottom-[-10px] w-12 h-12 bg-indigo-500/5 rounded-full group-hover:scale-150 transition-all duration-300"></div>
          <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Languages className="w-5 h-5 group-hover:scale-110 transition-all" />
          </div>
          <div>
            <h4 className="text-xs font-display font-black text-slate-800 leading-tight">
              {isAr ? "مترجم النومي الفوري" : "AI Live Translator"}
            </h4>
            <p className="text-[9px] text-slate-400 mt-0.5 line-clamp-1">
              {isAr ? "ترجمة كتابة، صوت وبطاقات" : "Text, audio, and sign translator"}
            </p>
          </div>
        </button>

        {/* Card 3: AI Assistant */}
        <button
          onClick={() => onNavigate("assistant")}
          className="bg-gradient-to-br from-slate-900 to-slate-950 text-white p-4 rounded-3xl text-left shadow-md hover:scale-102 active:scale-98 transition-all flex flex-col justify-between h-28 group relative overflow-hidden border border-slate-800"
        >
          <div className="absolute right-[-10px] bottom-[-10px] w-14 h-14 bg-blue-500/10 rounded-full group-hover:scale-150 transition-all duration-300"></div>
          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow shadow-blue-500/30">
            <Sparkles className="w-4.5 h-4.5 text-amber-300 animate-pulse" />
          </div>
          <div>
            <h4 className="text-xs font-display font-black text-white leading-tight flex items-center gap-1">
              {isAr ? "المساعد الذكي" : "Smart AI Assistant"}
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
            </h4>
            <p className="text-[9px] text-slate-400 mt-0.5 line-clamp-1">
              {isAr ? "دليل سياحي وحيل للتوفير" : "Travel guides & savings hacks"}
            </p>
          </div>
        </button>

        {/* Card 4: Country Landmarks */}
        <button
          onClick={() => onNavigate("explore")}
          className="bg-white border border-slate-100 p-4 rounded-3xl text-left shadow-sm hover:scale-102 active:scale-98 transition-all flex flex-col justify-between h-28 group relative overflow-hidden"
        >
          <div className="absolute right-[-10px] bottom-[-10px] w-12 h-12 bg-emerald-500/5 rounded-full group-hover:scale-150 transition-all duration-300"></div>
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Landmark className="w-5 h-5 group-hover:scale-110 transition-all" />
          </div>
          <div>
            <h4 className="text-xs font-display font-black text-slate-800 leading-tight">
              {isAr ? "استكشف معالم البلد" : "Landmarks & Guides"}
            </h4>
            <p className="text-[9px] text-slate-400 mt-0.5 line-clamp-1">
              {isAr ? "أسعار تذاكر، نصائح ومواقع" : "Ticket fees, airports & transports"}
            </p>
          </div>
        </button>

      </div>

      {/* CURRENCY CALCULATOR WIDGET */}
      <div className="bg-white border border-slate-100 rounded-3xl p-4 shadow-sm space-y-3 shrink-0" id="currency-converter-card">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1.5">
            <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
              <ArrowRightLeft className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-display font-bold text-slate-800">{t("home.instant_calc")}</h3>
          </div>
          <span className="text-[10px] font-mono text-slate-400">{isAr ? "أسعار حية" : "Live Rates"}</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Destination Cost Input */}
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-2.5">
            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              {t("home.calc_amount", { currency: currentCountry.currency, symbol: currentCountry.currencySymbol })}
            </label>
            <div className="flex items-center gap-1">
              <span className="text-sm font-semibold text-slate-600">{currentCountry.currencySymbol}</span>
              <input
                type="number"
                value={localCalculatorValue}
                onChange={(e) => setLocalCalculatorValue(e.target.value)}
                placeholder="0"
                className="w-full bg-transparent focus:outline-none text-base font-bold text-slate-800"
              />
            </div>
          </div>

          {/* Home Cost Result */}
          <div className="bg-blue-50/50 border border-blue-100/40 rounded-2xl p-2.5 flex flex-col justify-center">
            <span className="text-[9px] font-bold text-blue-600 uppercase tracking-wider block mb-1">
              {t("home.calc_converted", { currency: homeCountry.currency, symbol: homeCountry.currencySymbol })}
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-xs font-bold text-blue-700">{homeCountry.currencySymbol}</span>
              <span className="text-base font-black text-blue-800 font-mono">
                {getCalculatorResult()}
              </span>
            </div>
          </div>
        </div>

        <p className="text-[10px] text-slate-400 text-center leading-normal">
          {t("home.calc_rates_desc", { 
            home: homeCountry.currency, 
            rate: (currentCountry.exchangeRateToUSD / homeCountry.exchangeRateToUSD).toFixed(3), 
            dest: currentCountry.currency 
          })}
        </p>
      </div>

      {/* CULTURAL VIBE CHECK ADVISORY BOARD */}
      <div className="bg-white border border-slate-100 rounded-3xl p-4 shadow-sm space-y-3 shrink-0" id="cultural-advisory-board">
        <h3 className="text-sm font-display font-bold text-slate-800 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          {t("home.checklist_title", { country: isAr ? (currentCountry.nameAr || currentCountry.name) : t(currentCountry.name) })}
        </h3>

        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl space-y-0.5">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">{t("home.hygiene")}</span>
            <p className="font-bold text-slate-700">{vibe.hygiene}</p>
          </div>
          <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl space-y-0.5">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">{t("home.tipping")}</span>
            <p className="font-bold text-slate-700">{vibe.tipping}</p>
          </div>
          <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl space-y-0.5">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">{t("home.tap_water")}</span>
            <p className="font-bold text-slate-700">{vibe.tapWater}</p>
          </div>
          <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl space-y-0.5">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">{t("home.card_payments")}</span>
            <p className="font-bold text-slate-700">{vibe.cardPayment}</p>
          </div>
        </div>

        <div className="p-3 bg-blue-50/50 border border-blue-100/30 rounded-2xl flex gap-2.5 text-xs">
          <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold text-blue-900">{t("home.guideline_title")}</span>
            <p className="text-slate-600 leading-normal text-[11px]">{vibe.localVibe}</p>
          </div>
        </div>
      </div>

      {/* RECENT SCANS SECTION */}
      <div className="bg-white border border-slate-100 rounded-3xl p-4 shadow-sm space-y-3 shrink-0" id="recent-scans-panel">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-display font-bold text-slate-800">{t("home.recent_scans")}</h3>
          <button onClick={() => onNavigate("scan")} className="text-xs font-bold text-blue-600 hover:underline">
            {t("home.scan_new")}
          </button>
        </div>

        {recentProducts.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400 font-medium bg-slate-50 border border-dashed border-slate-150 rounded-2xl">
            {isAr ? "لم تقم بمسح أي منتج في هذا البلد بعد!" : "You haven't scanned any products in this country yet!"}
          </div>
        ) : (
          <div className="space-y-2">
            {recentProducts.map((p) => (
              <div
                key={p.id}
                onClick={() => {
                  onSelectProduct(p);
                  onNavigate("product-details");
                }}
                className="p-3 bg-slate-50 hover:bg-blue-50/30 border border-slate-100 rounded-2xl flex justify-between items-center gap-3 cursor-pointer transition-all hover:scale-[1.01]"
              >
                <div className="space-y-0.5 text-left">
                  <span className="text-[8px] bg-blue-100 text-blue-700 font-bold px-1.5 py-0.2 rounded-full uppercase">
                    {isAr && p.category === "Food" ? "طعام" : isAr && p.category === "Beverage" ? "مشروبات" : isAr && p.category === "Essentials" ? "أساسيات" : isAr && p.category === "Electronics" ? "إلكترونيات" : isAr ? "أخرى" : p.category}
                  </span>
                  <p className="text-xs font-bold text-slate-800 line-clamp-1">{p.name}</p>
                  <p className="text-[10px] text-slate-400">{p.brand} · {t("home.verified_at")} {p.storeName}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-black text-slate-800">
                    {currentCountry.currencySymbol}{p.priceInLocal}
                  </p>
                  <p className="text-[9px] text-emerald-600 font-semibold">
                    {homeCountry.currencySymbol}{((p.priceInLocal / currentCountry.exchangeRateToUSD) * homeCountry.exchangeRateToUSD).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CONTRIBUTE BOX */}
      <div className="bg-gradient-to-r from-blue-50 to-sky-50 border border-blue-100/60 rounded-3xl p-4 flex gap-3.5 items-center justify-between shadow-sm shrink-0" id="contribution-card">
        <div className="space-y-0.5 max-w-[210px] text-left">
          <p className="text-xs font-bold text-blue-900">{t("home.spotted_cheaper")}</p>
          <p className="text-[10px] text-slate-500 leading-normal">{t("home.spotted_desc")}</p>
        </div>
        <button 
          onClick={() => onNavigate("add-price")}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl shrink-0 shadow-sm shadow-blue-200 transition-all hover:scale-105 active:scale-95"
        >
          {t("home.add_price_btn")}
        </button>
      </div>

    </div>
  );
}
