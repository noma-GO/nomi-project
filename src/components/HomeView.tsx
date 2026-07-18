import React, { useState, useEffect } from "react";
import { 
  Sun, ShieldCheck, Info, Search, Camera, Languages, 
  Sparkles, Landmark, ArrowRightLeft, Lightbulb,
  Home, Compass, User
} from "lucide-react";
import { Country, Product } from "../types";
import { useLanguage } from "../lib/i18n";

// Responsive window dimensions hook
function useWindowDimensions() {
  const [windowDimensions, setWindowDimensions] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 360,
    height: typeof window !== "undefined" ? window.innerHeight : 640,
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    function handleResize() {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return windowDimensions;
}

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
  const { width } = useWindowDimensions();

  // Currency conversion calculation logic
  const getCalculatorResult = () => {
    const val = parseFloat(localCalculatorValue);
    if (isNaN(val)) return "0.00";
    const inUSD = val / currentCountry.exchangeRateToUSD;
    const inHome = inUSD * homeCountry.exchangeRateToUSD;
    return inHome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const countryProducts = products.filter(p => p.countryCode === currentCountry.code);
  const recentProducts = countryProducts.slice(0, 3);

  const filteredSearch = searchQuery.trim() !== "" 
    ? countryProducts.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const getVibeAdvisory = () => {
    switch(currentCountry.code) {
      case "JP":
        return {
          hygiene: isAr ? "ممتازة (10/10)" : "Outstanding (10/10)",
          tipping: isAr ? "ممنوع تماماً" : "Forbidden",
          tapWater: isAr ? "آمنة للشرب" : "Safe & Clean",
          cardPayment: isAr ? "مرتفع (Suica)" : "High (Suica)",
          localVibe: isAr 
            ? "التزم الهدوء في المواصلات. احتفظ بقمامتك معك." 
            : "Quiet transit. Keep trash in your bag.",
          chips: isAr 
            ? ["تجنب الأكل واقفاً", "القطارات دقيقة", "بطاقة Suica أساسية"]
            : ["No eating walking", "Punctual trains", "Suica is key"]
        };
      case "IT":
        return {
          hygiene: isAr ? "ممتاز (8/10)" : "Good (8/10)",
          tipping: isAr ? "غير مطلوب" : "Not expected",
          tapWater: isAr ? "آمنة (Nasoni)" : "Safe (Nasoni)",
          cardPayment: isAr ? "مقبول واسع" : "Widely accepted",
          localVibe: isAr 
            ? "انتبه من النشالين. وثق تذكرة القطار دائماً." 
            : "Watch pickpockets. Validate tickets.",
          chips: isAr
            ? ["القهوة واقفاً أرخص", "مياه صنبور مجانية", "وثق التذكرة دائماً"]
            : ["Standing coffee cheap", "Free tap water", "Validate tickets"]
        };
      case "FR":
        return {
          hygiene: isAr ? "جيد جداً" : "Very Good",
          tipping: isAr ? "الخدمة مشمولة" : "Service Compris",
          tapWater: isAr ? "آمنة (Carafe)" : "Safe (Carafe)",
          cardPayment: isAr ? "مرتفع للغاية" : "Extremely High",
          localVibe: isAr 
            ? "قل 'Bonjour' دائماً قبل التحدث مع أي موظف." 
            : "Always say Bonjour first to any employee.",
          chips: isAr
            ? ["ابدأ بـ Bonjour", "اطلب ماء صنبور مجاني", "انتبه في المترو"]
            : ["Always say Bonjour", "Free tap water", "Beware of pickpockets"]
        };
      case "TH":
        return {
          hygiene: isAr ? "متوسط" : "Moderate",
          tipping: isAr ? "ليس من العادات" : "Not traditional",
          tapWater: isAr ? "غير آمنة" : "Avoid",
          cardPayment: isAr ? "نقد أساسي" : "Cash rules",
          localVibe: isAr 
            ? "احترم العائلة المالكة. اخلع الحذاء بالمعابد." 
            : "Respect royalty. Remove shoes in temples.",
          chips: isAr
            ? ["اخلع الحذاء بالمعبد", "مياه معبأة فقط", "فروع 7-Eleven موفرة"]
            : ["No shoes in temple", "Bottled water only", "7-Eleven deals"]
        };
      case "MX":
        return {
          hygiene: isAr ? "متوسط" : "Moderate",
          tipping: isAr ? "10% متوقعة" : "10% expected",
          tapWater: isAr ? "تجنبها بالكامل" : "Avoid entirely",
          cardPayment: isAr ? "يفضل النقد" : "Cash preferred",
          localVibe: isAr 
            ? "تناول الطعام في أسواق fondas. حدد سعر التاكسي مسبقاً." 
            : "Dine at local fondas. Negotiate taxi first.",
          chips: isAr
            ? ["حدد سعر التاكسي أولاً", "التزم بالمعبأة", "جرب وجبات الفونداس"]
            : ["Negotiate taxi rate", "Bottled water only", "Try local fondas"]
        };
      default:
        return {
          hygiene: isAr ? "جيد ومقبول" : "Good & verified",
          tipping: isAr ? "اختياري" : "Optional",
          tapWater: isAr ? "المعبأة أفضل" : "Bottled suggested",
          cardPayment: isAr ? "مقبول معتمد" : "Accepted",
          localVibe: isAr ? "التزم بالآداب العامة وتابع السكان المحليين." : "Match native paces and guidelines.",
          chips: isAr ? ["قارن الأسعار", "المتاجر أوفر", "كن يقظاً"] : ["Check prices", "Supermarkets", "Stay alert"]
        };
    }
  };

  const vibe = getVibeAdvisory();

  return (
    <div className="flex flex-col space-y-4 pb-[88px] px-4 pt-1 w-full max-w-lg mx-auto bg-slate-50 text-slate-900 min-h-screen" id="home-view-container">
      
      {/* 1. Welcoming Header (Height ~180px, No absolute styling) */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-[24px] p-4 flex flex-col justify-between h-[180px] shrink-0 shadow-md" id="home-greeting-header">
        <div className="flex justify-between items-start w-full">
          <div className="flex flex-col space-y-1 text-left">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="inline-block text-[10px] bg-white/15 text-white border border-white/10 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                {t("home.explorer_level")}
              </span>
              <span className="inline-flex items-center gap-1 bg-white/20 text-white border border-white/25 px-2 py-0.5 rounded-full text-[10px] font-black" id="header-country-chip">
                <span>{currentCountry.flag}</span>
                <span>{isAr ? (currentCountry.nameAr || currentCountry.name) : currentCountry.name}</span>
              </span>
            </div>
            <h2 className="text-[20px] font-bold tracking-tight mt-1 leading-none">{t("home.greeting")}</h2>
            <p className="text-[11px] text-blue-100/95 font-medium leading-relaxed mt-1">
              {t("home.exploring_in")}{" "}{isAr ? (currentCountry.nameAr || currentCountry.name) : currentCountry.name}
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl px-2.5 py-1 text-center border border-white/10 shrink-0 flex items-center gap-1">
            <Sun className="w-3.5 h-3.5 text-yellow-300" />
            <span className="text-[10px] font-bold text-white">{isAr ? "مشمس 24° م" : "24°C Sunny"}</span>
          </div>
        </div>

        <div className="border-t border-white/10 pt-2 w-full">
          <div className="flex justify-between text-[10px] font-semibold text-blue-100 mb-1">
            <span>{t("home.progress_lvl", { level: 5 })}</span>
            <span className="font-bold">{isAr ? "2,450 / 3,000 نقطة خبرة" : "2,450 / 3,000 XP"}</span>
          </div>
          <div className="w-full h-1.5 bg-black/20 rounded-full overflow-hidden">
            <div className="h-full bg-sky-300 rounded-full" style={{ width: "81%" }}></div>
          </div>
        </div>
      </div>

      {/* 2. Global Search Box (Height 56px, corner-radius 28px, left search icon, soft shadow) */}
      <div className="w-full shrink-0" id="global-search-container">
        <div className="bg-white border border-slate-200/85 rounded-[28px] px-4 shadow-sm flex items-center gap-2 h-[56px]">
          <div className="text-slate-400">
            <Search className="w-5 h-5" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isAr ? "ابحث عن منتج، علامة تجارية أو فئة..." : "Search products, brands, barcodes..."}
            className={`flex-1 bg-transparent text-xs text-slate-800 focus:outline-none font-semibold ${isAr ? "text-right pr-2" : "text-left pl-2"}`}
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

        {/* Inline Search Results Block (No absolute positioning) */}
        {searchQuery.trim() !== "" && (
          <div className="mt-2 bg-white border border-slate-200 rounded-[24px] shadow-sm max-h-56 overflow-y-auto p-3">
            <div className="pb-2 mb-1 border-b border-slate-100 flex justify-between items-center text-[10px] text-slate-400 font-bold">
              <span>{isAr ? `نتائج البحث (${filteredSearch.length})` : `Search Results (${filteredSearch.length})`}</span>
              <span>{isAr ? "الأسعار محلياً" : "Local prices"}</span>
            </div>
            
            {filteredSearch.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400 font-medium">
                {isAr ? "لا توجد منتجات مطابقة لهذا البحث" : "No matching products found"}
              </div>
            ) : (
              filteredSearch.map(p => (
                <button
                  key={p.id}
                  onClick={() => {
                    onSelectProduct(p);
                    setSearchQuery("");
                    onNavigate("product-details");
                  }}
                  className="w-full text-left p-2 hover:bg-slate-50 rounded-xl flex items-center justify-between gap-3 cursor-pointer border-b border-slate-50 last:border-0"
                >
                  <div className="text-left">
                    <p className="text-xs font-bold text-slate-800">{p.name}</p>
                    <p className="text-[9px] text-slate-400 font-semibold">{p.brand} · {p.category}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-black text-blue-600">
                      {currentCountry.currencySymbol}{p.priceInLocal}
                    </p>
                    <p className="text-[9px] text-emerald-600 font-semibold">
                      {homeCountry.currencySymbol}{((p.priceInLocal / currentCountry.exchangeRateToUSD) * homeCountry.exchangeRateToUSD).toFixed(2)}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* 3. Suggestion Chips Row (Scrollable, no absolute positioning) */}
      <div className="w-full shrink-0 overflow-x-auto no-scrollbar flex gap-2 py-0.5" id="smart-chips-bar">
        {vibe.chips.map((chipText, idx) => (
          <div
            key={idx}
            className="flex items-center gap-1 bg-white border border-slate-200/80 text-slate-700 rounded-full px-3.5 py-1.5 text-[10px] font-bold whitespace-nowrap shadow-sm shrink-0"
          >
            <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>{chipText}</span>
          </div>
        ))}
      </div>

      {/* Beautiful Unified Bento Grid Container (No absolute positioning) */}
      <div className="grid grid-cols-2 gap-4 w-full shrink-0" id="home-cards-grid">
        
        {/* 4. Service 1: Camera Scanner (Col span 1) */}
        <button
          onClick={() => onNavigate("scan")}
          className="bg-white border border-slate-200/80 p-4 rounded-[24px] text-left shadow-sm hover:bg-slate-50 transition-all flex flex-col justify-between h-[110px] w-full cursor-pointer"
        >
          <div className="w-[32px] h-[32px] rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Camera className="w-[18px] h-[18px]" />
          </div>
          <div className="text-left w-full">
            <h4 className="text-[16px] font-bold text-slate-800 leading-tight truncate">
              {isAr ? "ماسح الكاميرا الذكي" : "AI Camera Scanner"}
            </h4>
            <p className="text-[13px] text-slate-400 mt-1 truncate">
              {isAr ? "لافتات وباركود" : "Barcode & signs"}
            </p>
          </div>
        </button>

        {/* Service 2: AI Translator (Col span 1) */}
        <button
          onClick={() => onNavigate("translate")}
          className="bg-white border border-slate-200/80 p-4 rounded-[24px] text-left shadow-sm hover:bg-slate-50 transition-all flex flex-col justify-between h-[110px] w-full cursor-pointer"
        >
          <div className="w-[32px] h-[32px] rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Languages className="w-[18px] h-[18px]" />
          </div>
          <div className="text-left w-full">
            <h4 className="text-[16px] font-bold text-slate-800 leading-tight truncate">
              {isAr ? "مترجم نومي الفوري" : "AI Live Translator"}
            </h4>
            <p className="text-[13px] text-slate-400 mt-1 truncate">
              {isAr ? "ترجمة كتابة وصوت" : "Text & voice translation"}
            </p>
          </div>
        </button>

        {/* Service 3: AI Travel Assistant (Col span 1) */}
        <button
          onClick={() => onNavigate("assistant")}
          className="bg-slate-900 text-white p-4 rounded-[24px] text-left shadow-md hover:bg-slate-850 transition-all flex flex-col justify-between h-[110px] w-full border border-slate-800 cursor-pointer"
        >
          <div className="w-[32px] h-[32px] rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
            <Sparkles className="w-[16px] h-[16px] text-amber-300" />
          </div>
          <div className="text-left w-full">
            <h4 className="text-[16px] font-bold text-white leading-tight truncate">
              {isAr ? "المساعد السياحي" : "AI Travel Assistant"}
            </h4>
            <p className="text-[13px] text-slate-400 mt-1 truncate">
              {isAr ? "أدلة أمان وتوفير" : "Guides & saving hacks"}
            </p>
          </div>
        </button>

        {/* Service 4: Landmarks & Guides (Col span 1) */}
        <button
          onClick={() => onNavigate("explore")}
          className="bg-white border border-slate-200/80 p-4 rounded-[24px] text-left shadow-sm hover:bg-slate-50 transition-all flex flex-col justify-between h-[110px] w-full cursor-pointer"
        >
          <div className="w-[32px] h-[32px] rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Landmark className="w-[18px] h-[18px]" />
          </div>
          <div className="text-left w-full">
            <h4 className="text-[16px] font-bold text-slate-800 leading-tight truncate">
              {isAr ? "المواقع والخرائط" : "Landmarks & Guides"}
            </h4>
            <p className="text-[13px] text-slate-400 mt-1 truncate">
              {isAr ? "سوبرماركت ومعالم" : "Supermarkets & sights"}
            </p>
          </div>
        </button>

        {/* 5. Currency Converter (Col span 2, Height 110px, Padding 16px) */}
        <div className="col-span-2 bg-white border border-slate-200/80 rounded-[24px] p-4 h-[110px] flex flex-col justify-between shadow-sm" id="currency-converter-card">
          <div className="flex justify-between items-center w-full">
            <div className="flex items-center gap-1.5">
              <ArrowRightLeft className="w-4 h-4 text-blue-600" />
              <span className="text-[14px] font-bold text-slate-800">{t("home.instant_calc")}</span>
            </div>
            <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{isAr ? "سعر صرف حقيقي" : "Official Mid-Market"}</span>
          </div>

          <div className="grid grid-cols-2 gap-3 w-full items-center">
            {/* Input */}
            <div className="bg-slate-50 border border-slate-100 rounded-xl px-2.5 py-1.5 flex flex-col justify-center">
              <span className="text-[8px] font-bold text-slate-400 uppercase leading-none mb-1">
                {currentCountry.currency}
              </span>
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold text-slate-500">{currentCountry.currencySymbol}</span>
                <input
                  type="number"
                  value={localCalculatorValue}
                  onChange={(e) => setLocalCalculatorValue(e.target.value)}
                  placeholder="0"
                  className="w-full bg-transparent focus:outline-none text-xs font-bold text-slate-800"
                />
              </div>
            </div>

            {/* Output */}
            <div className="bg-blue-50/40 border border-blue-100/30 rounded-xl px-2.5 py-1.5 flex flex-col justify-center">
              <span className="text-[8px] font-bold text-blue-600 uppercase leading-none mb-1">
                {homeCountry.currency}
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-[10px] font-bold text-blue-700">{homeCountry.currencySymbol}</span>
                <span className="text-xs font-extrabold text-blue-800 font-mono leading-none">
                  {getCalculatorResult()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 6. Cultural Vibe checklist / Safety Panel (Col span 2, Height 110px, Padding 16px) */}
        <div className="col-span-2 bg-white border border-slate-200/80 rounded-[24px] p-4 h-[110px] flex items-center justify-between shadow-sm" id="cultural-advisory-board">
          <div className="flex flex-col justify-between h-full text-left">
            <h3 className="text-[14px] font-bold text-slate-800 flex items-center gap-1.5 leading-none">
              <ShieldCheck className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
              <span>{t("home.checklist_title", { country: isAr ? (currentCountry.nameAr || currentCountry.name) : currentCountry.name })}</span>
            </h3>
            <p className="text-[11px] text-slate-500 line-clamp-2 max-w-[180px] leading-snug">{vibe.localVibe}</p>
          </div>
          <div className="flex flex-col gap-1.5 justify-center shrink-0">
            <div className="text-[11px] px-2.5 py-1 bg-slate-50 rounded-xl border border-slate-100/50 flex flex-col justify-center">
              <span className="text-[9px] font-bold text-slate-400 block leading-none uppercase">{t("home.tipping")}</span>
              <span className="font-extrabold text-slate-700 leading-none mt-1">{vibe.tipping}</span>
            </div>
            <div className="text-[11px] px-2.5 py-1 bg-slate-50 rounded-xl border border-slate-100/50 flex flex-col justify-center">
              <span className="text-[9px] font-bold text-slate-400 block leading-none uppercase">{t("home.tap_water")}</span>
              <span className="font-extrabold text-slate-700 leading-none mt-1">{vibe.tapWater}</span>
            </div>
          </div>
        </div>

        {/* 7. Recent Scans Container (Col span 2, Height 110px, Padding 16px) */}
        <div className="col-span-2 bg-white border border-slate-200/80 rounded-[24px] p-4 h-[110px] flex flex-col justify-between shadow-sm" id="recent-scans-panel">
          <div className="flex justify-between items-center w-full leading-none">
            <h3 className="text-sm font-bold text-slate-800 leading-none">{t("home.recent_scans")}</h3>
            <button onClick={() => onNavigate("scan")} className="text-[11px] font-bold text-blue-600 hover:underline leading-none">
              {t("home.scan_new")}
            </button>
          </div>
          {recentProducts.length === 0 ? (
            <div className="text-center text-xs text-slate-400 font-semibold my-auto">
              {isAr ? "لم يتم مسح أي منتجات في هذا البلد حتى الآن!" : "No products scanned yet!"}
            </div>
          ) : (
            <button
              onClick={() => {
                onSelectProduct(recentProducts[0]);
                onNavigate("product-details");
              }}
              className="w-full text-left p-2 bg-slate-50 hover:bg-blue-50/20 border border-slate-100 rounded-xl flex justify-between items-center gap-3 cursor-pointer"
            >
              <div className="space-y-0.5 text-left">
                <span className="inline-block text-[8px] bg-blue-100 text-blue-800 font-bold px-2 py-0.2 rounded-full uppercase leading-none">
                  {recentProducts[0].category}
                </span>
                <p className="text-xs font-bold text-slate-800 line-clamp-1 leading-none">{recentProducts[0].name}</p>
                <p className="text-[10px] text-slate-400 font-medium leading-none">{recentProducts[0].brand}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs font-black text-slate-800 leading-none">
                  {currentCountry.currencySymbol}{recentProducts[0].priceInLocal}
                </p>
                <p className="text-[9px] text-emerald-600 font-bold leading-none mt-1">
                  {homeCountry.currencySymbol}{((recentProducts[0].priceInLocal / currentCountry.exchangeRateToUSD) * homeCountry.exchangeRateToUSD).toFixed(2)}
                </p>
              </div>
            </button>
          )}
        </div>

        {/* 8. Contribute / Share Card (Col span 2, Height 110px, Padding 16px) */}
        <div className="col-span-2 bg-gradient-to-r from-blue-50 to-sky-50 border border-blue-100/60 rounded-[24px] p-4 h-[110px] flex items-center justify-between shadow-sm" id="contribution-card">
          <div className="space-y-1 max-w-[180px] text-left">
            <p className="text-xs font-bold text-blue-900 leading-tight">{t("home.spotted_cheaper")}</p>
            <p className="text-[11px] text-slate-500 font-medium leading-snug">{t("home.spotted_desc")}</p>
          </div>
          <button 
            onClick={() => onNavigate("add-price")}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] px-4 py-2.5 rounded-xl shrink-0 shadow-sm shadow-blue-200 transition-all active:scale-95 cursor-pointer"
          >
            {t("home.add_price_btn")}
          </button>
        </div>

      </div>

      {/* 9. Bottom Navigation Bar (Height 72px, Icon size 24px, position: fixed ONLY) */}
      <div className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200/80 h-[72px] z-50 shadow-lg flex justify-around items-center px-4" id="home-bottom-navigation-bar">
        {/* Home */}
        <button
          onClick={() => onNavigate("home")}
          className="flex flex-col items-center justify-center flex-1 h-full cursor-pointer"
        >
          <Home className="w-6 h-6 text-blue-600" />
          <span className="text-[10px] mt-1 font-extrabold text-blue-600">{t("nav.home")}</span>
        </button>

        {/* Explore */}
        <button
          onClick={() => onNavigate("explore")}
          className="flex flex-col items-center justify-center flex-1 h-full cursor-pointer text-slate-400 hover:text-slate-600"
        >
          <Compass className="w-6 h-6" />
          <span className="text-[10px] mt-1 font-semibold">{t("nav.explore")}</span>
        </button>

        {/* Scan (Center camera floating bar style, styled safely within navigation bar height) */}
        <button
          onClick={() => onNavigate("scan")}
          className="flex flex-col items-center justify-center flex-1 h-full cursor-pointer text-slate-400 hover:text-slate-600"
        >
          <Camera className="w-6 h-6" />
          <span className="text-[10px] mt-1 font-semibold">{isAr ? "مسح" : "Scan"}</span>
        </button>

        {/* Translate */}
        <button
          onClick={() => onNavigate("translate")}
          className="flex flex-col items-center justify-center flex-1 h-full cursor-pointer text-slate-400 hover:text-slate-600"
        >
          <Languages className="w-6 h-6" />
          <span className="text-[10px] mt-1 font-semibold">{t("nav.translate")}</span>
        </button>

        {/* Profile */}
        <button
          onClick={() => onNavigate("profile")}
          className="flex flex-col items-center justify-center flex-1 h-full cursor-pointer text-slate-400 hover:text-slate-600"
        >
          <User className="w-6 h-6" />
          <span className="text-[10px] mt-1 font-semibold">{t("nav.passport")}</span>
        </button>
      </div>

    </div>
  );
}
