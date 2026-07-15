import React from "react";
import { 
  ArrowLeft, Tag, ShoppingBag, Landmark, Info, CheckCircle2, 
  TrendingDown, TrendingUp, AlertCircle, Sparkles, MapPin, Share2 
} from "lucide-react";
import { Country, Product } from "../types";
import { SUPERMARKETS } from "../data";
import { useLanguage } from "../lib/i18n";

interface ProductDetailsViewProps {
  product: Product | null;
  currentCountry: Country;
  homeCountry: Country;
  onNavigate: (screen: any) => void;
}

export default function ProductDetailsView({ 
  product, 
  currentCountry, 
  homeCountry, 
  onNavigate 
}: ProductDetailsViewProps) {
  const { t, language } = useLanguage();
  const isAr = language === "ar";
  
  if (!product) {
    return (
      <div className="flex-1 p-6 flex flex-col items-center justify-center text-center space-y-3 bg-slate-50 h-full animate-fade-in">
        <ShoppingBag className="w-12 h-12 text-slate-300 animate-bounce" />
        <p className="text-sm font-bold text-slate-700">{t("details.no_selected")}</p>
        <p className="text-xs text-slate-400">{t("details.no_selected_desc")}</p>
        <button 
          onClick={() => onNavigate("scan")}
          className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-sm"
        >
          {t("details.go_scan")}
        </button>
      </div>
    );
  }

  // Currency converters
  const getHomePriceConverted = (localPrice: number) => {
    const rateToUSD = currentCountry.exchangeRateToUSD;
    const priceInUSD = localPrice / rateToUSD;
    const converted = priceInUSD * homeCountry.exchangeRateToUSD;
    return `${homeCountry.currencySymbol}${converted.toFixed(2)} ${homeCountry.currency}`;
  };

  // Find relevant supermarkets for this product's country
  const stores = SUPERMARKETS.filter(s => s.countryCode === currentCountry.code);

  // Helper translations for product category
  const translateCategory = (cat: string) => {
    if (!isAr) return cat;
    switch(cat) {
      case "Food": return "طعام";
      case "Beverage": return "مشروبات";
      case "Essentials": return "أساسيات";
      case "Electronics": return "إلكترونيات";
      default: return "أخرى";
    }
  };

  const translateProductNameAndBrand = (item: Product) => {
    if (!isAr) return { name: item.name, brand: item.brand, desc: item.description };
    // Translate sample products
    if (item.id === "p1") return { name: "مياه معدنية طبيعية 1.5 لتر", brand: "نستله بيور لايف", desc: "سعر السوبر ماركت المحلي العادي للمياه المعدنية الأساسية. تجنب متاجر الراحة السياحية الصغيرة حيث يتضاعف هذا السعر ثلاث مرات." };
    if (item.id === "p2") return { name: "شاي أخضر أوي أوشا 500 مل", brand: "إيتو إن", desc: "الشاي الأخضر الياباني البارد الأكثر شعبية. السعر العادي لآلات البيع الذاتي أو المتاجر المحلية هو 130-160 ين ياباني." };
    if (item.id === "p3") return { name: "بسكويت كيت كات بالشاي الأخضر", brand: "نستله اليابان", desc: "بسكويت كيت كات الياباني الشهير بنكهة الماتشا. يفضل شراؤه من متاجر الخصومات مثل 'دون كيشوت' بدلاً من محطات القطارات لتوفير 40٪." };
    if (item.id === "p4") return { name: "باجيت فرنسي كلاسيكي", brand: "مخبز محلي", desc: "سعر الباجيت الفرنسي الكلاسيكي التقليدي الخاضع للتسعير الموحد. متوفر في المخابز المحلية الحقيقية." };
    if (item.id === "p5") return { name: "شريحة لحم فيليه مشوي", brand: "ستيك هاوس باريسي", desc: "الوجبة الكلاسيكية في المطاعم الفرنسية المحلية غير المخصصة للسياح. تشمل البطاطس المقلية والسلطة الطازجة." };
    return { name: item.name, brand: item.brand, desc: item.description };
  };

  const { name: pName, brand: pBrand, desc: pDesc } = translateProductNameAndBrand(product);

  // Price analysis rating
  const getPriceVerdict = () => {
    if (product.priceInLocal <= 150 && currentCountry.code === "JP") {
      return { label: isAr ? "صفقة ممتازة (سعر محلي)" : "Excellent Deal (Local Rate)", color: "text-emerald-600 bg-emerald-50 border-emerald-100", icon: TrendingDown };
    }
    if (product.priceInLocal <= 2.0 && (currentCountry.code === "IT" || currentCountry.code === "FR")) {
      return { label: isAr ? "صفقة ممتازة (سعر محلي)" : "Excellent Deal (Local Rate)", color: "text-emerald-600 bg-emerald-50 border-emerald-100", icon: TrendingDown };
    }
    if (product.priceInLocal > 1000 && currentCountry.code === "JP") {
      return { label: isAr ? "سلعة فاخرة/ممتازة" : "Premium/Luxury Item", color: "text-blue-600 bg-blue-50 border-blue-100", icon: Sparkles };
    }
    return { label: isAr ? "سعر قياسي عادل" : "Fair Standard Price", color: "text-blue-600 bg-blue-50 border-blue-100", icon: CheckCircle2 };
  };

  const verdict = getPriceVerdict();
  const VerdictIcon = verdict.icon;

  const translateSMName = (name: string) => {
    if (!isAr) return name;
    switch (name) {
      case "Big C Supercenter": return "بيج سي سوبرسنتر";
      case "Tesco Lotus Express": return "تيسكو لوتس إكسبريس";
      case "Seven-Eleven": return "سيفن إلفن";
      case "Carrefour City": return "كارفور سيتي";
      case "Monoprix": return "مونوبري";
      case "Franprix": return "فرانبري";
      case "Life Supermarket": return "لايف سوبرماركت";
      case "Gyomu Super": return "غيومو سوبر";
      case "FamilyMart": return "فاميلي مارت";
      default: return name;
    }
  };

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar p-4 flex flex-col space-y-4 h-full pb-28 bg-slate-50 animate-fade-in" id="product-details-container">
      
      {/* Back Header navigation */}
      <div className="flex justify-between items-center bg-white p-2.5 rounded-2xl border border-slate-100 shadow-sm">
        <button 
          onClick={() => onNavigate("products")}
          className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-500 transition-all flex items-center gap-1 text-xs font-bold"
        >
          <ArrowLeft className={`w-4 h-4 ${isAr ? "transform rotate-180" : ""}`} />
          {t("details.back_catalog")}
        </button>
        <span className="text-[10px] bg-blue-50 text-blue-600 border border-blue-100 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
          {t("details.verified")}
        </span>
      </div>

      {/* Main product title display card */}
      <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-3.5">
        <div className={`flex justify-between items-start gap-4 ${isAr ? "flex-row-reverse" : "flex-row"}`}>
          <div className={`space-y-1 ${isAr ? "text-right" : "text-left"}`}>
            <span className="text-[9px] bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
              {translateCategory(product.category)}
            </span>
            <h2 className="text-xl font-display font-black text-slate-800 leading-tight">
              {pName}
            </h2>
            <p className="text-xs text-slate-500">{t("details.brand")} <strong className="text-slate-700 font-semibold">{pBrand}</strong></p>
          </div>
          
          <div className="bg-blue-50 p-2.5 rounded-2xl border border-blue-100/50 text-blue-600 shrink-0">
            <ShoppingBag className="w-5 h-5" />
          </div>
        </div>

        {/* Barcode readout if present */}
        {product.barcode && product.barcode !== "N/A" && (
          <div className={`py-2 px-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between ${isAr ? "flex-row-reverse" : "flex-row"}`}>
            <div className={`flex items-center gap-2 ${isAr ? "flex-row-reverse" : "flex-row"}`}>
              <div className="h-5 w-12 bg-[linear-gradient(90deg,#1e293b_1px,transparent_1px,#1e293b_3px,transparent_3px,#1e293b_6px)] opacity-60"></div>
              <span className="font-mono text-[10px] text-slate-500 font-medium">{t("details.barcode_identified")}</span>
            </div>
            <span className="font-mono text-xs font-bold text-slate-700">{product.barcode}</span>
          </div>
        )}

        {/* Savings Alert / Pricing Verdict Bar */}
        <div className={`p-3 rounded-2xl border flex items-center gap-2.5 text-xs font-bold justify-start ${verdict.color}`}>
          <VerdictIcon className="w-4 h-4 shrink-0" />
          <span>{verdict.label}</span>
        </div>
      </div>

      {/* Conversion Dual grid cards */}
      <div className="grid grid-cols-2 gap-3">
        {/* Local Price */}
        <div className="bg-white border border-slate-100 rounded-3xl p-4 shadow-sm text-center">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">{t("details.local_retail_cost")}</span>
          <span className="text-2xl font-display font-black text-blue-600 mt-1 block">
            {currentCountry.currencySymbol}{product.priceInLocal}
          </span>
          <span className="text-[10px] font-semibold text-slate-500 font-mono">
            {currentCountry.currency} ({t(currentCountry.name)})
          </span>
        </div>

        {/* Converted Price */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-3xl p-4 shadow-sm text-center">
          <span className="text-[9px] font-bold text-blue-100 uppercase tracking-widest block">{t("details.converted_cost")}</span>
          <span className="text-2xl font-display font-black text-white mt-1 block">
            {getHomePriceConverted(product.priceInLocal)}
          </span>
          <span className="text-[10px] font-bold text-blue-100 font-mono">
            {homeCountry.currency} ({isAr ? "الوطن" : "Home"})
          </span>
        </div>
      </div>

      {/* Description & Consumer Tips */}
      <div className={`bg-white border border-slate-100 rounded-3xl p-4 shadow-sm space-y-2.5 ${isAr ? "text-right" : "text-left"}`}>
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 justify-start">
          <Info className="w-4 h-4 text-blue-600" />
          {t("details.dossier")}
        </h3>
        <p className={`text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-2xl border border-slate-100 ${isAr ? "text-right" : "text-left"}`}>
          {pDesc}
        </p>
        
        {product.contributedBy && (
          <div className={`text-[9px] text-slate-400 flex justify-between items-center pt-1 border-t border-slate-100 ${isAr ? "flex-row-reverse" : "flex-row"}`}>
            <span>{t("details.logged_by")} <strong className="text-slate-600">{product.contributedBy === "You" && isAr ? "أنت" : product.contributedBy === "Anonymous" && isAr ? "فاعل خير" : product.contributedBy}</strong></span>
            <span>{t("details.date")} {product.dateContributed || (isAr ? "نشط" : "Active")}</span>
          </div>
        )}
      </div>

      {/* Stores where available list */}
      <div className="bg-white border border-slate-100 rounded-3xl p-4 shadow-sm space-y-3">
        <div className={`flex justify-between items-center ${isAr ? "flex-row-reverse" : "flex-row"}`}>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t("details.availability")}</h3>
          <span className="text-[9px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">{t("details.in_area")}</span>
        </div>

        <div className={`space-y-2 ${isAr ? "text-right" : "text-left"}`}>
          {stores.length === 0 ? (
            <p className="text-xs text-slate-400 italic text-center py-2">{t("details.no_markets")}</p>
          ) : (
            stores.map((st) => (
              <div 
                key={st.id}
                className={`p-3 bg-slate-50 border border-slate-100 rounded-2xl flex justify-between items-center gap-3 ${isAr ? "flex-row-reverse text-right" : "flex-row text-left"}`}
              >
                <div className={`space-y-0.5 ${isAr ? "text-right" : "text-left"}`}>
                  <div className={`flex items-center gap-1.5 ${isAr ? "flex-row-reverse" : "flex-row"}`}>
                    <p className={`text-xs font-bold text-slate-800 ${isAr ? "text-right" : "text-left"}`}>{translateSMName(st.name)}</p>
                    <span className="text-[8px] bg-emerald-50 border border-emerald-200 text-emerald-600 px-1 rounded font-bold uppercase shrink-0">
                      {st.trustScore}% {isAr ? "موثوقية" : "Trust"}
                    </span>
                  </div>
                  <p className={`text-[10px] text-slate-400 flex items-center gap-1 ${isAr ? "text-right" : "text-left"}`}>
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                    {st.hours} · {isAr ? "مستوى السعر" : "Price level"}: {st.priceTier}
                  </p>
                </div>
                
                <div className="text-right shrink-0">
                  <p className="text-xs font-bold text-slate-700">{t("details.available")}</p>
                  <p className="text-[9px] text-blue-600 hover:underline cursor-pointer font-bold" onClick={() => onNavigate("explore")}>
                    {t("details.view_map")}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Direct contribution buttons */}
      <div className="flex gap-2">
        <button 
          onClick={() => onNavigate("add-price")}
          className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-2xl shadow-md shadow-blue-200 transition-all flex items-center justify-center gap-1.5"
        >
          {t("details.different_rate")}
        </button>
        <button 
          onClick={() => {
            alert(isAr ? "تم نسخ تقرير السفر إلى الحافظة! جاهز للإرسال إلى مجموعة الرحلة." : "Travel report shared to clipboard! Ready to send to trip group chat.");
          }}
          className="p-3 bg-white border border-slate-100 text-slate-600 hover:text-slate-800 rounded-2xl shadow-sm transition-all"
          title={isAr ? "مشاركة التقرير" : "Share Report"}
        >
          <Share2 className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
}
