import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Globe, Search, ArrowLeft, Check, Sparkles, Clock, PhoneCall, 
  CreditCard, Droplet, Coins, Info, X, ShieldAlert, Navigation, ArrowRightLeft
} from "lucide-react";
import { CountryModel, CountryManager } from "../lib/countryManager";
import { useLanguage } from "../lib/i18n";

interface CountrySelectionViewProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDestination: CountryModel;
  selectedHome: CountryModel;
  onSelectDestination: (country: CountryModel) => void;
  onSelectHome: (country: CountryModel) => void;
}

export default function CountrySelectionView({
  isOpen,
  onClose,
  selectedDestination,
  selectedHome,
  onSelectDestination,
  onSelectHome
}: CountrySelectionViewProps) {
  const { t, language } = useLanguage();
  const isAr = language === "ar";

  // Tab mode: whether we are setting the "Destination" or the "Home Base"
  const [selectionMode, setSelectionMode] = useState<"destination" | "home">("destination");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAdvancedGuide, setShowAdvancedGuide] = useState(false);

  // Filter countries using the centralized country manager search system
  const filteredCountries = useMemo(() => {
    return CountryManager.searchCountries(searchQuery);
  }, [searchQuery]);

  // Handle selecting a country
  const handleCountrySelect = (country: CountryModel) => {
    if (selectionMode === "destination") {
      onSelectDestination(country);
    } else {
      onSelectHome(country);
    }
  };

  const currentActiveCountry = selectionMode === "destination" ? selectedDestination : selectedHome;

  // Calculate local time in the selected country's timezone
  const currentLocalTime = useMemo(() => {
    return CountryManager.getLocalTime(currentActiveCountry.timeZone);
  }, [currentActiveCountry]);

  // Calculate timezone offset relative to home country
  const timeDifferenceText = useMemo(() => {
    if (selectionMode === "home") return "";
    return CountryManager.getTimeDifference(selectedHome.timeZone, selectedDestination.timeZone);
  }, [selectedHome, selectedDestination, selectionMode]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-md overflow-hidden animate-fade-in"
          id="country-selector-overlay"
        >
          {/* Inner Dialog Box */}
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className="bg-white w-full h-full sm:h-[85vh] sm:max-w-4xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-100"
          >
            {/* Header section with tab switcher */}
            <div className="bg-slate-50 border-b border-slate-150/60 px-6 py-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={onClose}
                    className="p-2 hover:bg-slate-200/60 rounded-xl transition-all text-slate-600"
                    title={isAr ? "رجوع" : "Back"}
                  >
                    <ArrowLeft className={`w-5 h-5 ${isAr ? "rotate-180" : ""}`} />
                  </button>
                  <div>
                    <h2 className="text-base font-display font-black text-slate-900">
                      {isAr ? "مدير البنية التحتية للدول" : "Global Country Directory"}
                    </h2>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                      {isAr ? "إدارة المواقع والعملات والتوقيت من مصدر مركزي" : "Centralized location, currency, & time manager"}
                    </p>
                  </div>
                </div>
                
                <button 
                  onClick={onClose}
                  className="p-2 bg-slate-200/40 hover:bg-slate-200/80 rounded-xl transition-all text-slate-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Mode Tabs: Destination vs Home */}
              <div className="bg-slate-200/50 p-1 rounded-2xl flex gap-1 max-w-md mx-auto">
                <button
                  type="button"
                  onClick={() => {
                    setSelectionMode("destination");
                    setSearchQuery("");
                  }}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
                    selectionMode === "destination"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <Globe className="w-4 h-4" />
                  {isAr ? "وجهة السفر النشطة" : "Active Destination"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectionMode("home");
                    setSearchQuery("");
                  }}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
                    selectionMode === "home"
                      ? "bg-white text-emerald-600 shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <ArrowRightLeft className="w-4 h-4" />
                  {isAr ? "بلد الإقامة الأم" : "Home Residence"}
                </button>
              </div>
            </div>

            {/* Main content body (Two Columns on large screens, scrollable single on mobile) */}
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
              
              {/* Left Column: Search & List */}
              <div className="flex-1 flex flex-col border-r border-slate-100 bg-white">
                
                {/* Search Bar */}
                <div className="p-4 border-b border-slate-100">
                  <div className="relative">
                    <Search className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 ${isAr ? "right-3.5" : "left-3.5"}`} />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={
                        selectionMode === "destination"
                          ? (isAr ? "ابحث عن وجهة سفر (مثال: اليابان، يورو، JPY)..." : "Search destination (e.g. Japan, Euro, JPY, JST)...")
                          : (isAr ? "ابحث عن بلد إقامتك (مثال: الولايات المتحدة)..." : "Search home residence (e.g. United States, USD)...")
                      }
                      className={`w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 text-xs font-extrabold focus:border-blue-500 focus:bg-white focus:outline-none transition-all ${
                        isAr ? "pr-10 pl-4 text-right" : "pl-10 pr-4 text-left"
                      }`}
                    />
                    {searchQuery && (
                      <button 
                        onClick={() => setSearchQuery("")}
                        className={`absolute top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-full bg-slate-200/50 ${
                          isAr ? "left-3" : "right-3"
                        }`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Countries Scroll Area */}
                <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-2">
                  {filteredCountries.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 space-y-2">
                      <Globe className="w-10 h-10 text-slate-200 mx-auto animate-spin" style={{ animationDuration: "12s" }} />
                      <p className="text-xs font-bold">{isAr ? "لم نعثر على نتائج ملوية" : "No matching countries found"}</p>
                      <p className="text-[10px] text-slate-400 max-w-xs mx-auto">
                        {isAr 
                          ? "النظام مجهز ببنية مرنة. تتوفر خدمات الذكاء الاصطناعي لتوليد أدلة فورية لأي دولة جديدة من خلال علامة تبويب الاستكشاف!" 
                          : "Our global system supports any country. AI dynamic generation will boot a guide on the Explore tab!"}
                      </p>
                    </div>
                  ) : (
                    filteredCountries.map((country) => {
                      const isSelected = country.code === currentActiveCountry.code;
                      const isDestinationTag = country.code === selectedDestination.code;
                      const isHomeTag = country.code === selectedHome.code;

                      return (
                        <button
                          key={country.code}
                          onClick={() => handleCountrySelect(country)}
                          className={`w-full p-3.5 rounded-2xl border transition-all flex items-center justify-between text-left ${
                            isSelected
                              ? "bg-blue-50/60 border-blue-200 shadow-sm"
                              : "bg-slate-50/50 hover:bg-slate-100 border-slate-100"
                          } ${isAr ? "flex-row-reverse" : "flex-row"}`}
                        >
                          <div className={`flex items-center gap-3.5 ${isAr ? "flex-row-reverse" : "flex-row"}`}>
                            <span className="text-3xl select-none" role="img" aria-label={country.name}>
                              {country.flag}
                            </span>
                            
                            <div className={isAr ? "text-right" : "text-left"}>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-black text-slate-900">
                                  {isAr ? country.nameAr : country.name}
                                </span>
                                <span className="text-[9px] px-1.5 py-0.5 bg-slate-200 text-slate-600 rounded font-black uppercase">
                                  {country.code}
                                </span>
                              </div>
                              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] text-slate-500 font-extrabold mt-0.5">
                                <span className="flex items-center gap-0.5">
                                  <Coins className="w-3 h-3 text-slate-400" />
                                  {country.currencyModel.code} ({country.currencyModel.symbol})
                                </span>
                                <span className="text-slate-300">•</span>
                                <span className="flex items-center gap-0.5">
                                  <Clock className="w-3 h-3 text-slate-400" />
                                  {country.timeZone.name}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Selection status indicator badge */}
                          <div className="flex items-center gap-1.5">
                            {isDestinationTag && (
                              <span className="text-[8px] font-black bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full uppercase tracking-wide">
                                {isAr ? "الوجهة" : "Dest"}
                              </span>
                            )}
                            {isHomeTag && (
                              <span className="text-[8px] font-black bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full uppercase tracking-wide">
                                {isAr ? "الموطن" : "Home"}
                              </span>
                            )}
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                              isSelected ? "bg-blue-600 text-white" : "bg-slate-100 text-transparent"
                            }`}>
                              <Check className="w-3.5 h-3.5" />
                            </div>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Right Column: Selected Country Metadata Dossier Summary */}
              <div className="w-full md:w-80 bg-slate-50/70 p-5 flex flex-col justify-between overflow-y-auto border-t md:border-t-0 border-slate-150">
                <div className="space-y-4">
                  <div className={`text-center space-y-1.5 pb-4 border-b border-slate-200/60`}>
                    <span className="text-5xl block animate-bounce" style={{ animationDuration: "3s" }}>
                      {currentActiveCountry.flag}
                    </span>
                    <h3 className="text-sm font-black text-slate-900">
                      {isAr ? currentActiveCountry.nameAr : currentActiveCountry.name}
                    </h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                      {isAr ? "ملخص معطيات البلد المختار" : "Country Intelligence Dossier"}
                    </p>
                  </div>

                  {/* Metadata fields */}
                  <div className="space-y-3 text-xs">
                    
                    {/* Time zone & Local Time */}
                    <div className="bg-white p-3 rounded-2xl border border-slate-150/40 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-blue-500" />
                        <div>
                          <p className="font-extrabold text-slate-800 text-[11px]">{isAr ? "التوقيت المحلي" : "Local Time"}</p>
                          <p className="text-[9px] text-slate-400 font-extrabold">{currentActiveCountry.timeZone.id}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-mono text-xs font-black text-slate-900">{currentLocalTime}</p>
                        {timeDifferenceText && (
                          <span className="text-[8px] bg-slate-100 text-slate-500 font-black px-1.5 py-0.5 rounded">
                            {timeDifferenceText}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Currency and Sim Exchange Rate */}
                    <div className="bg-white p-3 rounded-2xl border border-slate-150/40 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Coins className="w-4 h-4 text-emerald-500" />
                          <span className="font-extrabold text-slate-800 text-[11px]">{isAr ? "العملة والصرف" : "Currency & Rates"}</span>
                        </div>
                        <span className="text-[9px] bg-emerald-50 text-emerald-700 font-black px-1.5 py-0.5 rounded">
                          {currentActiveCountry.currencyModel.code}
                        </span>
                      </div>
                      <div className={`text-[10px] text-slate-500 leading-relaxed font-extrabold flex justify-between items-center`}>
                        <span>{isAr ? "الاسم:" : "Name:"} <strong className="text-slate-800 font-black">{isAr ? currentActiveCountry.currencyModel.nameAr : currentActiveCountry.currencyModel.name}</strong></span>
                        <span className="font-mono text-blue-600 font-black">{currentActiveCountry.currencyModel.symbol}</span>
                      </div>
                      {selectionMode === "destination" && (
                        <div className="pt-1.5 border-t border-slate-100 text-[9px] text-slate-400 font-bold flex justify-between">
                          <span>{isAr ? "قيمة الصرف مقابل الدولار:" : "Exchange to USD:"}</span>
                          <span className="font-mono text-slate-700 font-extrabold">1 USD = {currentActiveCountry.currencyModel.exchangeRateToUSD} {currentActiveCountry.currencyModel.code}</span>
                        </div>
                      )}
                    </div>

                    {/* Language info */}
                    <div className="bg-white p-3 rounded-2xl border border-slate-150/40 space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4 text-purple-500" />
                          <span className="font-extrabold text-slate-800 text-[11px]">{isAr ? "اللغة الرسمية" : "Primary Language"}</span>
                        </div>
                        <span className="text-[9px] bg-purple-50 text-purple-700 font-black px-2 py-0.5 rounded-full uppercase">
                          {currentActiveCountry.primaryLanguage.code}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-600 font-extrabold">
                        {isAr ? currentActiveCountry.primaryLanguage.nameAr : currentActiveCountry.primaryLanguage.name} 
                        <span className="text-[8px] text-slate-400 ml-1 font-bold">({currentActiveCountry.primaryLanguage.direction.toUpperCase()})</span>
                      </p>
                    </div>

                    {/* Accordion for Travel Guidelines */}
                    <div className="bg-white p-3 rounded-2xl border border-slate-150/40 space-y-2">
                      <button 
                        onClick={() => setShowAdvancedGuide(!showAdvancedGuide)}
                        className="w-full flex items-center justify-between text-left text-slate-800 hover:text-blue-600 transition-all"
                      >
                        <span className="font-extrabold text-[11px] flex items-center gap-1.5">
                          <Info className="w-4 h-4 text-amber-500" />
                          {isAr ? "إرشادات السفر الذكية" : "Traveler Smart Guides"}
                        </span>
                        <span className="text-[9px] text-blue-600 font-black">
                          {showAdvancedGuide ? (isAr ? "إخفاء" : "Hide") : (isAr ? "عرض" : "Show")}
                        </span>
                      </button>

                      <AnimatePresence>
                        {showAdvancedGuide && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="space-y-2 pt-2 border-t border-slate-100 overflow-hidden text-[10px] leading-relaxed text-slate-600 font-extrabold"
                          >
                            <div className="space-y-1">
                              <span className="text-slate-400 uppercase tracking-wider text-[8px] block">{isAr ? "ثقافة البقشيش" : "TIPPING CULTURE"}</span>
                              <p className="text-slate-800">{isAr ? currentActiveCountry.tippingCultureAr : currentActiveCountry.tippingCulture}</p>
                            </div>
                            <div className="space-y-1 pt-1.5 border-t border-slate-100">
                              <span className="text-slate-400 uppercase tracking-wider text-[8px] block">{isAr ? "أمان مياه الصنبور" : "TAP WATER SAFETY"}</span>
                              <p className="text-slate-800 flex items-center gap-1">
                                <Droplet className={`w-3.5 h-3.5 shrink-0 ${currentActiveCountry.tapWaterSafe ? "text-blue-500" : "text-amber-500"}`} />
                                {isAr ? currentActiveCountry.tapWaterNotesAr : currentActiveCountry.tapWaterNotes}
                              </p>
                            </div>
                            <div className="space-y-1 pt-1.5 border-t border-slate-100">
                              <span className="text-slate-400 uppercase tracking-wider text-[8px] block">{isAr ? "قبول الدفع بالبطاقات" : "CARD PAYMENT FRIENDLINESS"}</span>
                              <p className="text-slate-800 flex items-center gap-1">
                                <CreditCard className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                {isAr ? currentActiveCountry.cardPaymentNotesAr : currentActiveCountry.cardPaymentNotes}
                              </p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Emergency Contacts Widget */}
                    <div className="bg-red-50/50 p-3 rounded-2xl border border-red-100/50 space-y-1.5">
                      <span className="font-extrabold text-red-800 text-[10px] flex items-center gap-1.5">
                        <PhoneCall className="w-3.5 h-3.5 text-red-500 animate-pulse" />
                        {isAr ? "أرقام الطوارئ الإقليمية" : "Local Emergency Hotlines"}
                      </span>
                      <div className="grid grid-cols-2 gap-1.5 text-[9px] text-slate-600 font-extrabold">
                        <div className="bg-white/80 p-1 rounded border border-red-50 flex justify-between px-1.5">
                          <span>{isAr ? "الشرطة:" : "Police:"}</span>
                          <span className="font-mono text-red-700 font-black">{currentActiveCountry.emergencyNumbers.police}</span>
                        </div>
                        <div className="bg-white/80 p-1 rounded border border-red-50 flex justify-between px-1.5">
                          <span>{isAr ? "الإسعاف:" : "Ambulance:"}</span>
                          <span className="font-mono text-red-700 font-black">{currentActiveCountry.emergencyNumbers.ambulance}</span>
                        </div>
                        <div className="bg-white/80 p-1 rounded border border-red-50 flex justify-between px-1.5">
                          <span>{isAr ? "المطافئ:" : "Fire:"}</span>
                          <span className="font-mono text-red-700 font-black">{currentActiveCountry.emergencyNumbers.fire}</span>
                        </div>
                        <div className="bg-white/80 p-1 rounded border border-red-50 flex justify-between px-1.5">
                          <span>{isAr ? "عام:" : "General:"}</span>
                          <span className="font-mono text-red-700 font-black">{currentActiveCountry.emergencyNumbers.general}</span>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200/50">
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl transition-all shadow-md active:scale-95 text-center flex items-center justify-center gap-1.5"
                  >
                    <Globe className="w-4 h-4" />
                    {isAr ? "تطبيق وتأكيد التغييرات" : "Confirm & Apply selection"}
                  </button>
                </div>
              </div>

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
