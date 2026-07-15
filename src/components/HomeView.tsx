import React, { useState } from "react";
import { 
  Compass, Globe, Smartphone, Landmark, RefreshCw, Sun, 
  MapPin, ShieldCheck, Heart, Sparkles, TrendingUp, ChevronRight, 
  ArrowRightLeft, AlertCircle, Info, ThumbsUp, HelpCircle
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
  const [localCalculatorValue, setLocalCalculatorValue] = useState<string>("1000");
  const { t, language } = useLanguage();
  const isAr = language === "ar";

  // Get converted value for the calculator
  const getCalculatorResult = () => {
    const val = parseFloat(localCalculatorValue);
    if (isNaN(val)) return "0.00";
    const inUSD = val / currentCountry.exchangeRateToUSD;
    const inHome = inUSD * homeCountry.exchangeRateToUSD;
    return inHome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Get products of the current country to list as recent scans
  const countryProducts = products
    .filter(p => p.countryCode === currentCountry.code)
    .slice(0, 3);

  // Dynamic cultural safety parameters based on current destination country
  const getVibeAdvisory = () => {
    switch(currentCountry.code) {
      case "JP":
        return {
          hygiene: isAr ? "ممتازة (10/10)" : "Outstanding (10/10)",
          tipping: isAr ? "ممنوع (يعتبر إهانة)" : "Forbidden (Offensive)",
          tapWater: isAr ? "آمنة ونظيفة 100%" : "100% Safe & Clean",
          cardPayment: isAr ? "مرتفع (يفضل بطاقات سويكا والنقد)" : "High (Suica/Cash preferred)",
          emergencyNum: "119 / 110",
          localVibe: isAr 
            ? "وسائل نقل هادئة للغاية. احتفظ بالقمامة في حقيبتك لعدم وجود سلال مهملات بالشارع!" 
            : "Extremely quiet public transit. Keep trash in your bag; there are no street bins!"
        };
      case "IT":
        return {
          hygiene: isAr ? "جيد (8/10)" : "Good (8/10)",
          tipping: isAr ? "غير متوقع (رسوم الخدمة Coperto مضافة في الفاتورة)" : "Not expected (Coperto fee is on menu)",
          tapWater: isAr ? "آمنة (استخدم نوافير المياه العامة 'Nasoni')" : "Safe (Use public fountains 'Nasoni')",
          cardPayment: isAr ? "متوسط - مرتفع (مقبول على نطاق واسع)" : "Moderate-High (Widely accepted)",
          emergencyNum: "112",
          localVibe: isAr 
            ? "انتبه من النشالين في محطة تيرميني. قم بختم تذكرة القطار الإقليمي قبل الصعود!" 
            : "Watch out for pickpockets at Termini Station. Validate regional train tickets before boarding!"
        };
      case "FR":
        return {
          hygiene: isAr ? "ممتاز جداً (8.5/10)" : "Very Good (8.5/10)",
          tipping: isAr ? "الخدمة مشمولة (تقريب 10% لفتة مهذبة)" : "Service Compris (10% rounded is polite)",
          tapWater: isAr ? "آمنة 100% (أواني مياه مجانية بالمطاعم)" : "100% Safe (Free carafes in restaurants)",
          cardPayment: isAr ? "مرتفع للغاية (Carte Bleue)" : "Extremely High (Carte Bleue)",
          emergencyNum: "112",
          localVibe: isAr 
            ? "قل دائماً 'Bonjour' (مرحباً) قبل طلب أي مساعدة من موظف التجزئة!" 
            : "Always say 'Bonjour' before asking any retail employee for help, or you may be ignored!"
        };
      case "TH":
        return {
          hygiene: isAr ? "متوسط (طعام الشارع آمن إذا كان ساخناً)" : "Moderate (Street food safe if hot)",
          tipping: isAr ? "الباقي البسيط من العملات محل تقدير" : "Small change is appreciated",
          tapWater: isAr ? "تجنبها (استخدم المعبأة فقط، رخيصة جداً)" : "Avoid (Stick to bottled water, very cheap)",
          cardPayment: isAr ? "متوسط (نظام PromptPay والنقد بالأسواق)" : "Moderate (PromptPay / Cash at markets)",
          emergencyNum: "1155 (شرطة السياحة)",
          localVibe: isAr 
            ? "احترم الرموز والتقاليد الملكية دائماً. اخلع الحذاء عند دخول المعابد والمنازل." 
            : "Never speak ill of the Royal Family. Always remove shoes when entering temples & homes."
        };
      case "MX":
        return {
          hygiene: isAr ? "متوسط (تناول الطعام في الأماكن المزدحمة)" : "Moderate (Dine where crowds are)",
          tipping: isAr ? "من 10% إلى 15% هو المعتاد" : "10% to 15% is standard",
          tapWater: isAr ? "تجنبها تماماً (استخدم المياه المعبأة فقط)" : "Strictly bottled water only",
          cardPayment: isAr ? "متوسط (احتفظ بالنقد للأكشاك الشعبية)" : "Moderate (Keep cash for street stalls)",
          emergencyNum: "911",
          localVibe: isAr 
            ? "تناول الطعام في أسواق 'fondas' لأفضل الأسعار المحلية. فاوض على سعر سيارة الأجرة مسبقاً." 
            : "Dine at market 'fondas' for the absolute best local food rates. Negotiate taxi rates beforehand."
        };
      default:
        return {
          hygiene: isAr ? "تم التحقق" : "Verified",
          tipping: isAr ? "اختياري" : "Discretionary",
          tapWater: isAr ? "يوصى بالمعبأة" : "Bottled recommended",
          cardPayment: isAr ? "مقبول" : "Accepted",
          emergencyNum: "112",
          localVibe: isAr 
            ? "كن حذراً ومدركاً لما يدور حولك وتماشى مع نمط العادات المحلي." 
            : "Stay aware of surroundings and match local custom paces."
        };
    }
  };

  const vibe = getVibeAdvisory();

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar p-4 flex flex-col space-y-4 h-full pb-28 bg-slate-50" id="home-view-container">
      
      {/* Dynamic Hello Greeting Card */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-3xl p-5 shadow-md relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute right-[-20px] top-[-20px] w-28 h-28 bg-blue-500/20 rounded-full blur-xl"></div>
        <div className="absolute left-[30%] bottom-[-40px] w-36 h-36 bg-sky-400/20 rounded-full blur-2xl"></div>

        <div className="relative z-10 flex justify-between items-start">
          <div className="space-y-1">
            <span className="text-[10px] bg-blue-500/50 text-blue-100 border border-blue-400/30 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
              {t("home.explorer_level")}
            </span>
            <h2 className="text-2xl font-display font-extrabold tracking-tight mt-1">{t("home.greeting")}</h2>
            <p className="text-xs text-blue-100/90 font-medium">
              {t("home.exploring_in")} <strong className="text-white">{currentCountry.flag} {t(currentCountry.name)}</strong>.
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-2.5 text-center border border-white/10 shrink-0">
            <Sun className="w-6 h-6 text-yellow-300 mx-auto animate-pulse" />
            <span className="text-[10px] block font-bold text-white mt-1">{isAr ? "مشمس 24° م" : "24°C Sunny"}</span>
          </div>
        </div>

        {/* XP Level progression indicator */}
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

      {/* Blue theme currency converter widget */}
      <div className="bg-white border border-slate-100 rounded-3xl p-4 shadow-sm space-y-3">
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
          {/* Destination Cost Field */}
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

          {/* Home Cost Field */}
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

      {/* Cultural Customs & Local Advice (Blue themed box checklist) */}
      <div className="bg-white border border-slate-100 rounded-3xl p-4 shadow-sm space-y-3">
        <h3 className="text-sm font-display font-bold text-slate-800 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-blue-600" />
          {t("home.checklist_title", { country: t(currentCountry.name) })}
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

        <div className="flex justify-between items-center text-[10px] text-blue-600 font-bold hover:underline cursor-pointer pt-1" onClick={() => onNavigate("explore")}>
          <span>{t("home.view_trusted")}</span>
          <ChevronRight className={`w-3.5 h-3.5 ${isAr ? "transform rotate-180" : ""}`} />
        </div>
      </div>

      {/* Recent Product Scans */}
      <div className="bg-white border border-slate-100 rounded-3xl p-4 shadow-sm space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-display font-bold text-slate-800">{t("home.recent_scans")}</h3>
          <button onClick={() => onNavigate("scan")} className="text-xs font-bold text-blue-600 hover:underline">
            {t("home.scan_new")}
          </button>
        </div>

        <div className="space-y-2">
          {countryProducts.map((p) => (
            <div
              key={p.id}
              onClick={() => {
                onSelectProduct(p);
                onNavigate("product-details");
              }}
              className="p-3 bg-slate-50 hover:bg-blue-50/30 border border-slate-100 rounded-2xl flex justify-between items-center gap-3 cursor-pointer transition-all"
            >
              <div className="space-y-0.5">
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
      </div>

      {/* Prompt Card: Add Contribution */}
      <div className="bg-gradient-to-r from-blue-50 to-sky-50 border border-blue-100/60 rounded-3xl p-4 flex gap-3.5 items-center justify-between shadow-sm">
        <div className="space-y-0.5 max-w-[210px]">
          <p className="text-xs font-bold text-blue-900">{t("home.spotted_cheaper")}</p>
          <p className="text-[10px] text-slate-500 leading-normal">{t("home.spotted_desc")}</p>
        </div>
        <button 
          onClick={() => onNavigate("add-price")}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl shrink-0 shadow-sm shadow-blue-200 transition-all"
        >
          {t("home.add_price_btn")}
        </button>
      </div>

    </div>
  );
}
