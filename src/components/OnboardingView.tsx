import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Globe, ArrowRight, ArrowLeft, Check, Sparkles, Navigation, Coins, MapPin, Loader2, Compass, ShieldCheck
} from "lucide-react";
import { Country } from "../types";
import { useLanguage, Language } from "../lib/i18n";
import { CountryManager } from "../lib/countryManager";

interface OnboardingViewProps {
  homeCountryOptions: Country[];
  onComplete: (selectedCountry: Country, selectedLanguage: Language) => void;
}

export default function OnboardingView({
  homeCountryOptions,
  onComplete
}: OnboardingViewProps) {
  const { t, language, setLanguage } = useLanguage();
  const isAr = language === "ar";

  const [step, setStep] = useState<number>(1);
  const [selectedCountry, setSelectedCountry] = useState<Country>(
    homeCountryOptions.find(c => c.code === "US") || homeCountryOptions[0]
  );

  // GPS Location states
  const [gpsLoading, setGpsLoading] = useState<boolean>(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [gpsSuccessMessage, setGpsSuccessMessage] = useState<string | null>(null);

  const handleLanguageSelect = async (lang: Language) => {
    await setLanguage(lang);
  };

  const handleNextStep = () => {
    setStep(prev => prev + 1);
  };

  const handleBackStep = () => {
    setStep(prev => prev - 1);
  };

  const handleFinish = () => {
    onComplete(selectedCountry, language);
  };

  // GPS Location Detection
  const handleDetectLocation = () => {
    setGpsLoading(true);
    setGpsError(null);
    setGpsSuccessMessage(null);

    if (!navigator.geolocation) {
      setGpsError(isAr ? "نظام تحديد المواقع GPS غير مدعوم على هذا الجهاز." : "GPS is not supported on this device.");
      setGpsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=${language}`
          );
          if (!response.ok) throw new Error("Network error during geocoding");
          
          const data = await response.json();
          const detectedCountryCode = data.countryCode;

          if (detectedCountryCode) {
            const matchedCountry = CountryManager.getCountryByCode(detectedCountryCode);
            if (matchedCountry) {
              setSelectedCountry(matchedCountry);
              const countryNameLocal = isAr ? matchedCountry.nameAr || matchedCountry.name : matchedCountry.name;
              setGpsSuccessMessage(
                isAr 
                  ? `تم تحديد دولتك تلقائياً بنجاح: ${matchedCountry.flag} ${countryNameLocal}` 
                  : `Successfully detected your country: ${matchedCountry.flag} ${countryNameLocal}`
              );
            } else {
              setGpsError(isAr ? "تم تحديد موقعك ولكن رمز الدولة غير متوفر بقاعدة البيانات." : "Location detected, but country code is not registered in our app DB.");
            }
          } else {
            setGpsError(isAr ? "فشل التعرف على رمز الدولة من الإحداثيات." : "Could not identify country from coordinates.");
          }
        } catch (err) {
          console.error("Reverse geocoding error:", err);
          setGpsError(isAr ? "فشل الإتصال بخادم تحديد المواقع." : "Failed to connect to location resolution server.");
        } finally {
          setGpsLoading(false);
        }
      },
      (error) => {
        console.warn("Geolocation permission/error:", error);
        setGpsLoading(false);
        if (error.code === error.PERMISSION_DENIED) {
          setGpsError(isAr ? "تم رفض إذن الوصول للموقع. يرجى اختيار الدولة يدوياً أدناه." : "Location permission denied. Please select your country manually below.");
        } else {
          setGpsError(isAr ? "فشل تحديد موقعك الحالي. يرجى اختيار الدولة يدوياً." : "Failed to retrieve your current location. Please select manually.");
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Automatically request GPS position when Step 2 is active
  useEffect(() => {
    if (step === 2) {
      handleDetectLocation();
    }
  }, [step]);

  return (
    <div 
      className="absolute inset-0 bg-slate-950 text-white flex flex-col z-50 overflow-y-auto no-scrollbar justify-between p-5 pb-8"
      id="onboarding-viewport-container"
    >
      {/* Dynamic Background Glows */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-blue-900/30 via-slate-950 to-slate-950 pointer-events-none" />
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] [background-size:24px_24px]" />

      {/* Top Header Navigation */}
      <div className="relative z-10 flex justify-between items-center w-full max-w-md mx-auto pt-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-sans font-black text-white text-base shadow-lg shadow-blue-600/20">
            N
          </div>
          <span className="text-xs font-black tracking-wider uppercase bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">Nomi Travel</span>
        </div>
        <div className="text-[10px] bg-slate-900/80 border border-slate-800 text-slate-400 px-3 py-1 rounded-full font-black uppercase tracking-wider">
          {isAr ? "المعالج الذكي" : "Smart Onboarding"}
        </div>
      </div>

      {/* Slideable Content Area */}
      <div className="relative z-10 flex-1 flex flex-col justify-center my-6 max-w-md mx-auto w-full">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -12 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="space-y-6"
            >
              <div className="text-center space-y-2">
                <div className="inline-flex p-3 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-3xl mb-1 shadow-inner shadow-blue-500/5">
                  <Globe className="w-8 h-8 animate-pulse" />
                </div>
                <h3 className="text-2xl font-black text-white tracking-tight leading-none">
                  {isAr ? "مرحباً بك في نوُمي" : "Welcome to Nomi"}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
                  {isAr 
                    ? "أداتك الذكية الفورية لفك تشفير المنتجات، تحويل الأسعار بالعملة المحلية، وفهم إرشادات السفر في ثوانٍ معدودة." 
                    : "Your smart personal utility to decode products, convert shopping bills instantly, and unlock local guides worldwide."}
                </p>
              </div>

              {/* Language Selector Box */}
              <div className="bg-slate-900/90 border border-slate-850 backdrop-blur-xl rounded-3xl p-5 space-y-4 shadow-xl">
                <div className="text-left" style={{ direction: isAr ? "rtl" : "ltr" }}>
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                    {isAr ? "اختر لغة الواجهة" : "INTERFACE LANGUAGE"}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {isAr ? "سيتم تطبيق لغة العرض ومحتويات السفر الفورية" : "Change the visual interface and travel contents language"}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <button
                    onClick={() => handleLanguageSelect("en")}
                    className={`py-4 px-3 rounded-2xl border transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                      language === "en"
                        ? "bg-blue-600 border-blue-500 text-white font-black shadow-lg shadow-blue-600/25 scale-[1.02]"
                        : "bg-slate-950/60 text-slate-400 border-slate-850 hover:border-slate-700 hover:text-white"
                    }`}
                  >
                    <span className="text-xs font-black">English</span>
                    <span className="text-[9px] opacity-75">LTR Interface</span>
                  </button>

                  <button
                    onClick={() => handleLanguageSelect("ar")}
                    className={`py-4 px-3 rounded-2xl border transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                      language === "ar"
                        ? "bg-blue-600 border-blue-500 text-white font-black shadow-lg shadow-blue-600/25 scale-[1.02]"
                        : "bg-slate-950/60 text-slate-400 border-slate-850 hover:border-slate-700 hover:text-white"
                    }`}
                  >
                    <span className="text-xs font-black">العربية</span>
                    <span className="text-[9px] opacity-75">تنسيق اليمين لليسار</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -12 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="space-y-5"
            >
              <div className="text-center space-y-2">
                <div className="inline-flex p-3 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-3xl mb-1 shadow-inner shadow-indigo-500/5">
                  <MapPin className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black text-white tracking-tight leading-none">
                  {isAr ? "تحديد بلدك الأصلي" : "Your Residence Country"}
                </h3>
                <p className="text-xs text-slate-400 leading-normal max-w-xs mx-auto">
                  {isAr 
                    ? "نستخدم نظام تحديد المواقع لتحديد عملتك الأصلية ومقارنة أسعار المنتجات بالعملة المحلية لبلدك دائماً." 
                    : "We use location access to identify your base currency and run real-time comparisons while abroad."}
                </p>
              </div>

              {/* Automatic Location Panel */}
              <div className="bg-slate-900/90 border border-slate-850 backdrop-blur-xl rounded-3xl p-4 space-y-3.5 shadow-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-indigo-600/10 text-indigo-400 rounded-xl">
                      <Navigation className={`w-4 h-4 ${gpsLoading ? "animate-spin" : ""}`} />
                    </div>
                    <div className="text-left" style={{ direction: isAr ? "rtl" : "ltr" }}>
                      <p className="text-[9px] text-slate-500 font-extrabold uppercase tracking-wider">
                        {isAr ? "الموقع الجغرافي التلقائي" : "AUTOMATIC LOCATION"}
                      </p>
                      <p className="text-xs font-extrabold text-slate-200">
                        {gpsLoading 
                          ? (isAr ? "جاري فحص الإحداثيات..." : "Scanning GPS coordinates...") 
                          : (isAr ? "تحديد الدولة تلقائياً" : "Auto-detect country")}
                      </p>
                    </div>
                  </div>

                  {!gpsLoading && (
                    <button
                      onClick={handleDetectLocation}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-black rounded-lg transition-all active:scale-95 cursor-pointer shadow-md shadow-indigo-600/10"
                    >
                      {isAr ? "إعادة الفحص" : "Re-Scan GPS"}
                    </button>
                  )}
                </div>

                {gpsLoading && (
                  <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-950/40 p-2.5 rounded-xl border border-slate-850/30">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-500" />
                    <span>{isAr ? "يرجى الموافقة على طلب إذن الموقع..." : "Please grant location access when prompted..."}</span>
                  </div>
                )}

                {gpsError && (
                  <div className="p-2.5 bg-rose-500/10 text-rose-400 rounded-xl text-[10px] font-semibold border border-rose-500/20 text-left" style={{ direction: isAr ? "rtl" : "ltr" }}>
                    ⚠️ {gpsError}
                  </div>
                )}

                {gpsSuccessMessage && (
                  <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl text-[10px] font-bold border border-emerald-500/20 text-left" style={{ direction: isAr ? "rtl" : "ltr" }}>
                    ✨ {gpsSuccessMessage}
                  </div>
                )}
              </div>

              {/* Manual Selection Grid */}
              <div className="space-y-2">
                <p className="text-[9px] text-slate-500 font-extrabold uppercase tracking-wider px-1 text-left" style={{ direction: isAr ? "rtl" : "ltr" }}>
                  {isAr ? "أو اختر يدوياً من القائمة المتاحة:" : "OR SELECT MANUALLY:"}
                </p>
                <div className="grid grid-cols-2 gap-2 max-h-[160px] overflow-y-auto no-scrollbar pr-1">
                  {homeCountryOptions.map((country) => {
                    const isSelected = selectedCountry.code === country.code;
                    return (
                      <button
                        key={country.code}
                        onClick={() => {
                          setSelectedCountry(country);
                          setGpsSuccessMessage(null);
                          setGpsError(null);
                        }}
                        className={`p-2.5 rounded-2xl border text-left flex items-center gap-2 transition-all relative cursor-pointer ${
                          isSelected 
                            ? "bg-blue-600/25 border-blue-500 text-white font-extrabold" 
                            : "bg-slate-900 border-slate-850 text-slate-400 hover:border-slate-750 hover:text-slate-200"
                        }`}
                        style={{ direction: isAr ? "rtl" : "ltr" }}
                      >
                        <span className="text-lg shrink-0">{country.flag}</span>
                        <div className="truncate text-[11px] leading-tight flex-1">
                          <p className="font-bold truncate">{isAr ? country.nameAr || country.name : country.name}</p>
                          <p className="text-[9px] opacity-60 font-mono">{country.currency} ({country.currencySymbol})</p>
                        </div>
                        {isSelected && (
                          <div className={`absolute top-2.5 ${isAr ? "left-2.5" : "right-2.5"} w-3.5 h-3.5 bg-blue-500 rounded-full flex items-center justify-center`}>
                            <Check className="w-2 h-2 text-white stroke-[3px]" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -12 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="space-y-5 text-center"
            >
              <div className="w-16 h-16 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-3xl flex items-center justify-center mx-auto mb-1 shadow-lg shadow-blue-500/5">
                <Compass className="w-8 h-8 animate-spin-slow text-blue-400" />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-2xl font-black text-white tracking-tight leading-none">
                  {isAr ? "أنت جاهز تماماً!" : "Ready to Fly!"}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
                  {isAr 
                    ? "تم إعداد جواز سفرك الإلكتروني وعملتك الافتراضية بنجاح. أنت الآن جاهز لبدء استكشاف العالم." 
                    : "Your local settings have been configured. Let's decode products and travel with absolute confidence."}
                </p>
              </div>

              {/* Passport Card summary */}
              <div className="bg-slate-900 border border-slate-850 rounded-3xl p-4.5 max-w-sm mx-auto w-full divide-y divide-slate-800/50 text-[11px]">
                <div className="flex justify-between items-center pb-2.5">
                  <span className="text-slate-500 flex items-center gap-1.5"><Globe className="w-3.5 h-3.5 text-blue-400" /> {isAr ? "لغة العرض" : "Selected Language"}</span>
                  <span className="font-extrabold text-blue-400">{isAr ? "العربية" : "English"}</span>
                </div>
                <div className="flex justify-between items-center py-2.5">
                  <span className="text-slate-500 flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-indigo-400" /> {isAr ? "الدولة الأم" : "Home Residence"}</span>
                  <span className="font-extrabold text-white">{selectedCountry.flag} {isAr ? selectedCountry.nameAr || selectedCountry.name : selectedCountry.name}</span>
                </div>
                <div className="flex justify-between items-center pt-2.5">
                  <span className="text-slate-500 flex items-center gap-1.5"><Coins className="w-3.5 h-3.5 text-emerald-400" /> {isAr ? "العملة الأساسية" : "Home Currency"}</span>
                  <span className="font-extrabold text-emerald-400 font-mono">{selectedCountry.currency} ({selectedCountry.currencySymbol})</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation Footer */}
      <div className="relative z-10 flex items-center justify-between w-full max-w-md mx-auto pt-2">
        {/* Back Button */}
        <div>
          {step > 1 ? (
            <button
              onClick={handleBackStep}
              className="px-4 py-2.5 rounded-xl border border-slate-850 text-slate-400 hover:text-white hover:border-slate-700 transition-all text-xs font-bold flex items-center gap-1 cursor-pointer active:scale-95"
            >
              {isAr ? <ArrowRight className="w-3.5 h-3.5" /> : <ArrowLeft className="w-3.5 h-3.5" />}
              <span>{isAr ? "رجوع" : "Back"}</span>
            </button>
          ) : (
            <div className="w-10"></div>
          )}
        </div>

        {/* Step Indicator Bullets */}
        <div className="flex gap-1.5">
          {[1, 2, 3].map((bullet) => (
            <div 
              key={bullet}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                bullet === step ? "w-5 bg-blue-500" : "w-1.5 bg-slate-800"
              }`}
            />
          ))}
        </div>

        {/* Next / Finish Button */}
        <div>
          {step < 3 ? (
            <button
              onClick={handleNextStep}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-all text-xs font-bold flex items-center gap-1 shadow-lg shadow-blue-600/15 cursor-pointer active:scale-95"
            >
              <span>{isAr ? "التالي" : "Next"}</span>
              {isAr ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white transition-all text-xs font-black flex items-center gap-1.5 shadow-lg shadow-blue-600/20 cursor-pointer active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300 fill-amber-300 animate-pulse" />
              <span>{isAr ? "ابدأ الاستكشاف" : "Start Nomi"}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
