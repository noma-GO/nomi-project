import React, { useState, useEffect } from "react";
import { 
  Sun, ShieldCheck, Info, Search, Camera, Languages, 
  Sparkles, Landmark, ArrowRightLeft, Lightbulb
} from "lucide-react";
import { Country, Product } from "../types";
import { useLanguage } from "../lib/i18n";

// Responsive window dimension listener hook
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
          tipping: isAr ? "ممنوع تماماً (يعتبر إهانة)" : "Forbidden (Offensive)",
          tapWater: isAr ? "آمنة للشرب 100%" : "100% Safe & Clean",
          cardPayment: isAr ? "مرتفع (يفضل بطاقة Suica والنقد)" : "High (Suica/Cash preferred)",
          emergencyNum: "119 / 110",
          localVibe: isAr 
            ? "التزم الهدوء التام في وسائل النقل العامة. احتفظ بقمامتك معك فلا توجد سلال مهملات في الشوارع!" 
            : "Extremely quiet public transit. Keep trash in your bag; there are no street bins!",
          chips: isAr 
            ? ["تجنب الأكل واقفاً أو أثناء المشي", "القطارات دقيقة بالثواني", "Suica أساسية للمواصلات"]
            : ["No eating while walking", "Trains are on-time to the second", "Suica card is essential"]
        };
      case "IT":
        return {
          hygiene: isAr ? "ممتاز (8/10)" : "Good (8/10)",
          tipping: isAr ? "غير مطلوب (تضاف رسوم الخدمة Coperto تلقائياً)" : "Not expected (Coperto on bill)",
          tapWater: isAr ? "آمنة (استخدم نوافير Nasoni العامة)" : "Safe (Use public Nasoni fountains)",
          cardPayment: isAr ? "مقبول على نطاق واسع" : "Widely accepted",
          emergencyNum: "112",
          localVibe: isAr 
            ? "انتبه جيداً من النشالين في محطات المترو والقطارات الرئيسية. قم بتوثيق تذكرة القطار قبل الصعود!" 
            : "Watch out for pickpockets at Termini Station. Validate regional train tickets before boarding!",
          chips: isAr
            ? ["شرب القهوة واقفاً عند البار أرخص", "اطلب مياه الصنبور مجاناً", "قم بتوثيق التذكرة دائماً"]
            : ["Coffee standing is cheaper", "Ask for tap 'Acqua del rubinetto'", "Validate train tickets"]
        };
      case "FR":
        return {
          hygiene: isAr ? "جيد جداً (8.5/10)" : "Very Good (8.5/10)",
          tipping: isAr ? "الخدمة مشمولة بالفاتورة بالفعل" : "Service Compris (Tip not needed)",
          tapWater: isAr ? "آمنة (اطلب إبريق ماء Carafe d'eau مجاناً)" : "100% Safe (Request free Carafe d'eau)",
          cardPayment: isAr ? "مرتفع للغاية (يفضل الدفع الإلكتروني)" : "Extremely High (Carte Bleue)",
          emergencyNum: "112",
          localVibe: isAr 
            ? "احرص دائماً على قول 'Bonjour' (مرحباً) قبل التحدث مع أي موظف أو بائع لضمان مساعدتك بشكل ودود!" 
            : "Always say 'Bonjour' before asking any employee for help, or you will be ignored!",
          chips: isAr
            ? ["ابدأ بـ 'Bonjour' دائماً", "اطلب ماء الصنبور المجاني", "انتبه لممتلكاتك في المترو"]
            : ["Always say Bonjour first", "Water is free in restaurants", "Beware of metro pickpockets"]
        };
      case "TH":
        return {
          hygiene: isAr ? "متوسط (طعام الشارع آمن إذا كان ساخناً)" : "Moderate (Street food safe if hot)",
          tipping: isAr ? "ليس من العادات ولكن ترك الباقي البسيط لطيف" : "Not traditional but change is nice",
          tapWater: isAr ? "غير آمنة (اشرب المياه المعبأة فقط)" : "Avoid (Drink strictly bottled water)",
          cardPayment: isAr ? "متوسط (نظام PromptPay والنقد هما الأساس)" : "Moderate (PromptPay & Cash rules)",
          emergencyNum: "1155",
          localVibe: isAr 
            ? "احترم العائلة المالكة والرموز البوذية تماماً. اخلع حذاءك دائماً عند دخول المعابد أو بيوت الآخرين." 
            : "Never speak ill of royalty. Remove shoes when entering temples or private homes.",
          chips: isAr
            ? ["اخلع حذاءك عند دخول المعبد", "اشرب مياهاً معبأة فقط", "فروع 7-Eleven ممتازة وموفرة"]
            : ["Remove shoes in temples", "Stick to bottled water", "7-Eleven has the best deals"]
        };
      case "MX":
        return {
          hygiene: isAr ? "متوسط (تناول الطعام في الأكشاك المزدحمة)" : "Moderate (Eat busy hot food stalls)",
          tipping: isAr ? "من 10% إلى 15% متوقعة دائماً" : "10% to 15% expected",
          tapWater: isAr ? "تجنبها بالكامل (استخدم المعبأة حصرياً)" : "Avoid (Strictly bottled water only)",
          cardPayment: isAr ? "متوسط (احتفظ بالنقد للأكشاك المحلية)" : "Moderate (Keep cash for street food)",
          emergencyNum: "911",
          localVibe: isAr 
            ? "تناول الطعام في أسواق 'fondas' المحلية لتوفير المال. اتفق على سعر سيارة الأجرة قبل الصعود." 
            : "Dine at market 'fondas' for best local rates. Set taxi fare prior to entry.",
          chips: isAr
            ? ["اتفق على السعر قبل ركوب التاكسي", "التزم بالمياه المعبأة فقط", "جرب وجبات الفونداس الاقتصادية"]
            : ["Negotiate taxi fares first", "Strictly bottled water", "Eat at local 'fondas'"]
        };
      default:
        return {
          hygiene: isAr ? "جيد ومقبول" : "Good and verified",
          tipping: isAr ? "اختياري" : "Optional / Discretionary",
          tapWater: isAr ? "يفضل شراء المياه المعبأة" : "Bottled suggested",
          cardPayment: isAr ? "مقبول ومعتمد" : "Accepted",
          emergencyNum: "112",
          localVibe: isAr ? "التزم بالآداب العامة وتابع وتيرة السكان المحليين لتجربة ممتعة." : "Match native paces and respect guidelines.",
          chips: isAr ? ["قارن الأسعار قبل الشراء", "المتاجر الكبرى أكثر توفيراً", "كن يقظاً في الأماكن العامة"] : ["Check prices first", "Supermarkets are cheaper", "Stay alert"]
        };
    }
  };

  const vibe = getVibeAdvisory();

  return (
    <div className="flex-1 w-full max-w-lg mx-auto flex flex-col space-y-4 bg-slate-50 text-slate-900 pb-24 px-4 pt-1" id="home-view-container">
      
      {/* Dynamic Style Injection for Bottom Navigation Bar (72dp height, 24dp icons) */}
      <style>{`
        #nomi-app-root .fixed.bottom-0 {
          height: 72px !important;
          padding-top: 0px !important;
          padding-bottom: 0px !important;
        }
        #nomi-app-root .fixed.bottom-0 nav {
          height: 72px !important;
        }
        #nomi-app-root .fixed.bottom-0 nav svg {
          width: 24px !important;
          height: 24px !important;
        }
        #nomi-app-root .fixed.bottom-0 nav span {
          font-size: 10px !important;
        }
      `}</style>

      {/* 1. Dynamic Greeting Header Card - Height 180px */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-[24px] p-4 shadow-md relative overflow-hidden shrink-0 h-[180px] flex flex-col justify-between" id="home-greeting-header">
        <div className="absolute right-[-20px] top-[-20px] w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute left-[20%] bottom-[-40px] w-40 h-40 bg-sky-400/20 rounded-full blur-3xl"></div>

        <div className="relative z-10 flex justify-between items-start">
          <div className="space-y-1 text-left">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="inline-block text-[10px] bg-white/15 text-white border border-white/10 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                {t("home.explorer_level")}
              </span>
              {/* Country Name Elegant Small Chip */}
              <span className="inline-flex items-center gap-1 bg-white/20 hover:bg-white/30 text-white border border-white/25 px-2 py-0.5 rounded-full text-[10px] font-black transition-all cursor-pointer active:scale-95 shadow-sm" id="header-country-chip">
                <span>{currentCountry.flag}</span>
                <span>{isAr ? (currentCountry.nameAr || currentCountry.name) : currentCountry.name}</span>
              </span>
            </div>
            <h2 className="text-xl font-bold tracking-tight mt-1 leading-none">{t("home.greeting")}</h2>
            <p className="text-[11px] text-blue-100/95 font-medium leading-relaxed mt-1">
              {t("home.exploring_in")}{" "}{isAr ? (currentCountry.nameAr || currentCountry.name) : currentCountry.name}
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl px-2 py-1 text-center border border-white/10 shrink-0 flex items-center gap-1">
            <Sun className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />
            <span className="text-[10px] font-bold text-white">{isAr ? "مشمس 24° م" : "24°C Sunny"}</span>
          </div>
        </div>

        {/* Level XP Bar */}
        <div className="border-t border-white/10 pt-2 relative z-10">
          <div className="flex justify-between text-[10px] font-semibold text-blue-100 mb-1">
            <span>{t("home.progress_lvl", { level: 5 })}</span>
            <span className="font-bold">{isAr ? "2,450 / 3,000 نقطة خبرة" : "2,450 / 3,000 XP"}</span>
          </div>
          <div className="w-full h-1.5 bg-black/20 rounded-full overflow-hidden">
            <div className="h-full bg-sky-300 rounded-full transition-all duration-500" style={{ width: "81%" }}></div>
          </div>
        </div>
      </div>

      {/* 2. Global Live Search Interface - Height 56px, corner-radius 28px, left search icon, soft shadow */}
      <div className="relative shrink-0 w-full" id="global-search-container">
        <div className="bg-white border border-slate-200/80 rounded-[28px] px-4 shadow-sm flex items-center gap-2 h-[56px] focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
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
              className="text-[10px] text-slate-400 hover:text-slate-600 px-2 font-bold transition-colors"
            >
              {isAr ? "مسح" : "Clear"}
            </button>
          )}
        </div>

        {/* Live Dropdown Search Results Overlay */}
        {searchQuery.trim() !== "" && (
          <div className="absolute top-full inset-x-0 mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 max-h-56 overflow-y-auto p-2">
            <div className="p-2 border-b border-slate-100 flex justify-between items-center text-[10px] text-slate-400 font-bold">
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
                  className="w-full text-left p-2.5 hover:bg-slate-50 rounded-xl flex items-center justify-between gap-3 cursor-pointer transition-all border-b border-slate-50 last:border-0"
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

      {/* 3. Quick Action Chips Row */}
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

      {/* 4. Service Access Cards Grid - 2 Column Grid, height 110px, border-radius 24px, padding 16px, gap 16px, icon size 32px, title 16sp bold, description 13sp */}
      <div className="grid grid-cols-2 gap-4 shrink-0" id="service-access-grid">
        
        {/* Card 1: Camera Scanner */}
        <button
          onClick={() => onNavigate("scan")}
          className="bg-white border border-slate-200/80 p-4 rounded-[24px] text-left shadow-sm hover:scale-[1.01] active:scale-[0.99] transition-all flex flex-col justify-between h-[110px] w-full group relative overflow-hidden cursor-pointer animate-fade-in"
        >
          <div className="absolute right-[-10px] bottom-[-10px] w-12 h-12 bg-blue-500/5 rounded-full group-hover:scale-125 transition-transform duration-300"></div>
          <div className="w-[32px] h-[32px] rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Camera className="w-[18px] h-[18px] group-hover:scale-105 transition-transform" />
          </div>
          <div className="text-left w-full mt-1.5">
            <h4 className="text-[16px] font-bold text-slate-800 leading-none truncate">
              {isAr ? "ماسح الكاميرا الذكي" : "AI Camera Scanner"}
            </h4>
            <p className="text-[13px] text-slate-400 mt-1 truncate">
              {isAr ? "لافتات وباركود" : "Barcode & signs"}
            </p>
          </div>
        </button>

        {/* Card 2: AI Translator */}
        <button
          onClick={() => onNavigate("translate")}
          className="bg-white border border-slate-200/80 p-4 rounded-[24px] text-left shadow-sm hover:scale-[1.01] active:scale-[0.99] transition-all flex flex-col justify-between h-[110px] w-full group relative overflow-hidden cursor-pointer animate-fade-in"
        >
          <div className="absolute right-[-10px] bottom-[-10px] w-12 h-12 bg-indigo-500/5 rounded-full group-hover:scale-125 transition-transform duration-300"></div>
          <div className="w-[32px] h-[32px] rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Languages className="w-[18px] h-[18px] group-hover:scale-105 transition-transform" />
          </div>
          <div className="text-left w-full mt-1.5">
            <h4 className="text-[16px] font-bold text-slate-800 leading-none truncate">
              {isAr ? "مترجم نومي الفوري" : "AI Live Translator"}
            </h4>
            <p className="text-[13px] text-slate-400 mt-1 truncate">
              {isAr ? "ترجمة كتابة وصوت" : "Text & voice translation"}
            </p>
          </div>
        </button>

        {/* Card 3: AI Assistant */}
        <button
          onClick={() => onNavigate("assistant")}
          className="bg-slate-900 text-white p-4 rounded-[24px] text-left shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all flex flex-col justify-between h-[110px] w-full group relative overflow-hidden border border-slate-800 cursor-pointer animate-fade-in"
        >
          <div className="absolute right-[-10px] bottom-[-10px] w-14 h-14 bg-blue-500/10 rounded-full group-hover:scale-125 transition-transform duration-300"></div>
          <div className="w-[32px] h-[32px] rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm shrink-0">
            <Sparkles className="w-[16px] h-[16px] text-amber-300 animate-pulse" />
          </div>
          <div className="text-left w-full mt-1.5">
            <h4 className="text-[16px] font-bold text-white leading-none truncate flex items-center gap-1">
              {isAr ? "المساعد السياحي" : "AI Travel Assistant"}
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
            </h4>
            <p className="text-[13px] text-slate-400 mt-1 truncate">
              {isAr ? "أدلة أمان وتوفير المال" : "Guides & saving hacks"}
            </p>
          </div>
        </button>

        {/* Card 4: Country Guides */}
        <button
          onClick={() => onNavigate("explore")}
          className="bg-white border border-slate-200/80 p-4 rounded-[24px] text-left shadow-sm hover:scale-[1.01] active:scale-[0.99] transition-all flex flex-col justify-between h-[110px] w-full group relative overflow-hidden cursor-pointer animate-fade-in"
        >
          <div className="absolute right-[-10px] bottom-[-10px] w-12 h-12 bg-emerald-500/5 rounded-full group-hover:scale-125 transition-transform duration-300"></div>
          <div className="w-[32px] h-[32px] rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Landmark className="w-[18px] h-[18px] group-hover:scale-105 transition-transform" />
          </div>
          <div className="text-left w-full mt-1.5">
            <h4 className="text-[16px] font-bold text-slate-800 leading-none truncate">
              {isAr ? "المواقع والخرائط" : "Landmarks & Guides"}
            </h4>
            <p className="text-[13px] text-slate-400 mt-1 truncate">
              {isAr ? "سوبرماركت ومعالم" : "Supermarkets & sights"}
            </p>
          </div>
        </button>

      </div>

      {/* 5. Currency Converter Widget - 24dp rounded corners */}
      <div className="bg-white border border-slate-200/80 rounded-[24px] p-4 shadow-sm space-y-3 shrink-0" id="currency-converter-card">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1.5">
            <div className="p-1.5 bg-blue-50 text-blue-600 rounded-xl">
              <ArrowRightLeft className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">{t("home.instant_calc")}</h3>
          </div>
          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{isAr ? "سعر صرف حقيقي" : "Official Mid-Market"}</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Destination Cost Input */}
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-2.5">
            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              {t("home.calc_amount", { currency: currentCountry.currency, symbol: currentCountry.currencySymbol })}
            </label>
            <div className="flex items-center gap-1">
              <span className="text-sm font-bold text-slate-500">{currentCountry.currencySymbol}</span>
              <input
                type="number"
                value={localCalculatorValue}
                onChange={(e) => setLocalCalculatorValue(e.target.value)}
                placeholder="0"
                className="w-full bg-transparent focus:outline-none text-sm font-bold text-slate-800"
              />
            </div>
          </div>

          {/* Home Cost Result */}
          <div className="bg-blue-50/40 border border-blue-100/30 rounded-2xl p-2.5 flex flex-col justify-center">
            <span className="text-[9px] font-bold text-blue-600 uppercase tracking-wider block mb-1">
              {t("home.calc_converted", { currency: homeCountry.currency, symbol: homeCountry.currencySymbol })}
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-xs font-bold text-blue-700">{homeCountry.currencySymbol}</span>
              <span className="text-sm font-extrabold text-blue-800 font-mono">
                {getCalculatorResult()}
              </span>
            </div>
          </div>
        </div>

        <p className="text-[10px] text-slate-400 text-center leading-normal font-medium">
          {t("home.calc_rates_desc", { 
            home: homeCountry.currency, 
            rate: (currentCountry.exchangeRateToUSD / homeCountry.exchangeRateToUSD).toFixed(3), 
            dest: currentCountry.currency 
          })}
        </p>
      </div>

      {/* 6. Cultural Vibe Checklist - 24dp rounded corners */}
      <div className="bg-white border border-slate-200/80 rounded-[24px] p-4 shadow-sm space-y-3 shrink-0" id="cultural-advisory-board">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <ShieldCheck className="w-4.5 h-4.5 text-emerald-600" />
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

        <div className="p-3 bg-blue-50/50 border border-blue-100/20 rounded-2xl flex gap-2.5 text-xs">
          <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5 text-left">
            <span className="font-bold text-blue-900">{t("home.guideline_title")}</span>
            <p className="text-slate-600 leading-normal text-[11px] font-medium">{vibe.localVibe}</p>
          </div>
        </div>
      </div>

      {/* 7. Recent Scans Container - 24dp rounded corners */}
      <div className="bg-white border border-slate-200/80 rounded-[24px] p-4 shadow-sm space-y-3 shrink-0" id="recent-scans-panel">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-bold text-slate-800">{t("home.recent_scans")}</h3>
          <button onClick={() => onNavigate("scan")} className="text-xs font-bold text-blue-600 hover:underline">
            {t("home.scan_new")}
          </button>
        </div>

        {recentProducts.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400 font-semibold bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
            {isAr ? "لم يتم مسح أي منتجات في هذا البلد حتى الآن!" : "No products scanned in this country yet!"}
          </div>
        ) : (
          <div className="space-y-2">
            {recentProducts.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  onSelectProduct(p);
                  onNavigate("product-details");
                }}
                className="w-full text-left p-3 bg-slate-50 hover:bg-blue-50/20 border border-slate-100 rounded-2xl flex justify-between items-center gap-3 cursor-pointer transition-all"
              >
                <div className="space-y-0.5 text-left">
                  <span className="inline-block text-[8px] bg-blue-100 text-blue-800 font-bold px-2 py-0.2 rounded-full uppercase">
                    {isAr && p.category === "Food" ? "طعام" : isAr && p.category === "Beverage" ? "مشروبات" : isAr && p.category === "Essentials" ? "أساسيات" : isAr && p.category === "Electronics" ? "إلكترونيات" : isAr ? "أخرى" : p.category}
                  </span>
                  <p className="text-xs font-bold text-slate-800 line-clamp-1">{p.name}</p>
                  <p className="text-[10px] text-slate-400 font-medium">{p.brand} · {t("home.verified_at")} {p.storeName}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-black text-slate-800">
                    {currentCountry.currencySymbol}{p.priceInLocal}
                  </p>
                  <p className="text-[9px] text-emerald-600 font-bold">
                    {homeCountry.currencySymbol}{((p.priceInLocal / currentCountry.exchangeRateToUSD) * homeCountry.exchangeRateToUSD).toFixed(2)}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 8. Contribute / Share Card - 24dp rounded corners */}
      <div className="bg-gradient-to-r from-blue-50 to-sky-50 border border-blue-100/60 rounded-[24px] p-4 flex gap-4 items-center justify-between shadow-sm shrink-0" id="contribution-card">
        <div className="space-y-0.5 max-w-[210px] text-left">
          <p className="text-xs font-bold text-blue-900">{t("home.spotted_cheaper")}</p>
          <p className="text-[10px] text-slate-500 font-medium leading-normal">{t("home.spotted_desc")}</p>
        </div>
        <button 
          onClick={() => onNavigate("add-price")}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shrink-0 shadow-sm shadow-blue-200 transition-all hover:scale-[1.03] active:scale-[0.97]"
        >
          {t("home.add_price_btn")}
        </button>
      </div>

    </div>
  );
}
