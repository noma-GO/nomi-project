import React, { useState } from "react";
import { 
  ArrowLeft, Tag, ShoppingBag, Plus, Sparkles, CheckCircle2, 
  Info, Landmark, ArrowRightLeft, DollarSign 
} from "lucide-react";
import { Country, Product } from "../types";
import { useLanguage } from "../lib/i18n";

interface AddPriceViewProps {
  currentCountry: Country;
  homeCountry: Country;
  onAddProduct: (product: Product) => void;
  onNavigate: (screen: any) => void;
}

export default function AddPriceView({ 
  currentCountry, 
  homeCountry, 
  onAddProduct, 
  onNavigate 
}: AddPriceViewProps) {
  const { t, language } = useLanguage();
  const isAr = language === "ar";

  // Form States
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState<Product["category"]>("Food");
  const [barcode, setBarcode] = useState("");
  const [priceLocal, setPriceLocal] = useState("");
  const [storeName, setStoreName] = useState("");
  const [description, setDescription] = useState("");
  const [success, setSuccess] = useState(false);

  // Calculate real-time conversion preview
  const getConversionPreview = () => {
    const val = parseFloat(priceLocal);
    if (isNaN(val) || val <= 0) return "0.00";
    const inUSD = val / currentCountry.exchangeRateToUSD;
    const inHome = inUSD * homeCountry.exchangeRateToUSD;
    return `${homeCountry.currencySymbol}${inHome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${homeCountry.currency}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !priceLocal || !storeName) {
      alert(isAr ? "يرجى ملء اسم المنتج، السعر المحلي، وموقع المتجر." : "Please fill in the Product Name, Local Price, and Store Location.");
      return;
    }

    const priceNum = parseFloat(priceLocal);
    if (isNaN(priceNum) || priceNum <= 0) {
      alert(isAr ? "يرجى تقديم سعر صالح." : "Please provide a valid price.");
      return;
    }

    const newProduct: Product = {
      id: "contributed-" + Date.now(),
      name,
      brand: brand || (isAr ? "علامة تجارية محلية" : "Local Brand"),
      barcode: barcode || null,
      category,
      priceInLocal: priceNum,
      countryCode: currentCountry.code,
      storeName,
      description: description || (isAr 
        ? `تم تسجيل سعر سياحي تم التحقق منه في ${t(currentCountry.name)} في ${storeName}. مصدره مجتمع المسافرين.` 
        : `Verified tourist price logged in ${currentCountry.name} at ${storeName}. Sourced by traveler community.`),
      contributedBy: isAr ? "أنت" : "You",
      dateContributed: new Date().toLocaleDateString(),
    };

    onAddProduct(newProduct);
    setSuccess(true);
    
    setTimeout(() => {
      onNavigate("products");
    }, 1200);
  };

  const categories: Product["category"][] = ["Food", "Beverage", "Essentials", "Electronics", "Other"];

  // Helper translation mapping for category names
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

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar p-4 flex flex-col space-y-4 h-full pb-28 bg-slate-50" id="add-price-container">
      
      {/* Header back button */}
      <div className="flex justify-between items-center bg-white p-2.5 rounded-2xl border border-slate-100 shadow-sm">
        <button 
          onClick={() => onNavigate("products")}
          className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-500 transition-all flex items-center gap-1 text-xs font-bold"
        >
          <ArrowLeft className={`w-4 h-4 ${isAr ? "transform rotate-180" : ""}`} />
          {t("add_price.cancel")}
        </button>
        <span className="text-[10px] bg-blue-100 text-blue-700 font-extrabold px-2.5 py-0.5 rounded-full uppercase">
          {t("add_price.badge")}
        </span>
      </div>

      {success ? (
        <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm flex flex-col items-center justify-center text-center space-y-4 my-auto animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center border border-emerald-100 shadow-inner">
            <CheckCircle2 className="w-8 h-8 animate-bounce" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-display font-black text-slate-800">{t("add_price.success_title")}</h3>
            <p className="text-xs text-slate-500 max-w-[220px]">
              {t("add_price.success_desc")}
            </p>
          </div>
          <span className="text-[10px] text-blue-600 font-mono animate-pulse">{t("add_price.redirecting")}</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Banner */}
          <div className={isAr ? "text-right" : "text-left"}>
            <h2 className="text-xl font-display font-black text-slate-800 flex items-center gap-1.5 justify-start">
              <Plus className="w-5 h-5 text-blue-600" />
              {t("add_price.title")}
            </h2>
            <p className="text-xs text-slate-500">
              {t("add_price.subtitle", { country: `${currentCountry.flag} ${t(currentCountry.name)}` })}
            </p>
          </div>

          {/* Form details card */}
          <div className="bg-white border border-slate-100 rounded-3xl p-4 shadow-sm space-y-3">
            
            {/* Product Name */}
            <div className={`space-y-1 ${isAr ? "text-right" : "text-left"}`}>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">{t("add_price.field_name")} *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={isAr ? "مثال: مياه شرب معبأة 500 مل" : "e.g. Original Coca-Cola 320ml"}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none"
              />
            </div>

            {/* Brand Name */}
            <div className={`space-y-1 ${isAr ? "text-right" : "text-left"}`}>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">{t("add_price.field_brand")}</label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder={isAr ? "مثال: شركة كوكا كولا" : "e.g. Coca-Cola Company"}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none"
              />
            </div>

            {/* Category Select Grid */}
            <div className={`space-y-1.5 ${isAr ? "text-right" : "text-left"}`}>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">{t("add_price.field_category")}</label>
              <div className="grid grid-cols-3 gap-1.5">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`py-1.5 px-2 rounded-xl border text-[10px] font-bold text-center transition-all ${
                      category === cat 
                        ? "bg-blue-600 border-blue-600 text-white shadow-sm" 
                        : "bg-slate-50 border-slate-100 text-slate-500 hover:border-slate-200"
                    }`}
                  >
                    {translateCategory(cat)}
                  </button>
                ))}
              </div>
            </div>

            {/* Barcode & Store */}
            <div className={`grid grid-cols-2 gap-3 ${isAr ? "text-right" : "text-left"}`}>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">{t("add_price.field_barcode")}</label>
                <input
                  type="text"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  placeholder={isAr ? "مثال: 885102..." : "e.g. 885102..."}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">{t("add_price.field_store")} *</label>
                <input
                  type="text"
                  required
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder={isAr ? "مثال: سوبرماركت بيج سي" : "e.g. Big C Supermarket"}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            {/* Price inputs and real-time conversion */}
            <div className={`grid grid-cols-2 gap-3 pt-1 ${isAr ? "text-right" : "text-left"}`}>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">
                  {t("add_price.field_price", { symbol: currentCountry.currencySymbol, currency: currentCountry.currency })} *
                </label>
                <div className={`flex items-center bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 ${isAr ? "flex-row-reverse" : "flex-row"}`}>
                  <span className={`text-xs font-bold text-slate-500 ${isAr ? "ml-1" : "mr-1"}`}>{currentCountry.currencySymbol}</span>
                  <input
                    type="number"
                    step="any"
                    required
                    value={priceLocal}
                    onChange={(e) => setPriceLocal(e.target.value)}
                    placeholder={isAr ? "مثال: 35" : "e.g. 35"}
                    className={`w-full bg-transparent focus:outline-none text-xs font-bold text-slate-800 ${isAr ? "text-right" : "text-left"}`}
                  />
                </div>
              </div>

              <div className={`flex flex-col justify-end p-2.5 bg-blue-50/50 border border-blue-100/30 rounded-xl ${isAr ? "text-right" : "text-left"}`}>
                <span className="text-[8px] font-bold text-blue-600 uppercase block">{t("add_price.home_equivalent")}</span>
                <span className={`text-xs font-black text-blue-800 font-mono mt-0.5 ${isAr ? "text-right" : "text-left"}`}>
                  {getConversionPreview()}
                </span>
              </div>
            </div>

            {/* Safety Warning Note */}
            <div className={`space-y-1 ${isAr ? "text-right" : "text-left"}`}>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">{t("add_price.field_advice")}</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={isAr ? "مثال: يباع في قسم التبريد الخلفي بالأسعار المحلية القياسية. تجنب شراءه من كشك السياح المقابل للبوابة!" : "e.g., Sold in the back fridge section at standard local rate. Avoid buying at the tourist kiosk opposite the terminal!"}
                rows={3}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none resize-none"
              />
            </div>

          </div>

          <button
            type="submit"
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-2xl shadow-md shadow-blue-200 transition-all flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            {t("add_price.submit_btn")}
          </button>
        </form>
      )}

      {/* Info card */}
      <div className={`bg-slate-100 border border-slate-200/50 p-3.5 rounded-3xl flex gap-2.5 text-[10px] text-slate-500 ${isAr ? "text-right" : "text-left"}`}>
        <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <span>
          {t("add_price.footer_note")}
        </span>
      </div>

    </div>
  );
}
