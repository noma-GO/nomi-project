import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Globe, ArrowRight, ArrowLeft, Check, Sparkles, Navigation, Coins, ShieldCheck, MapPin
} from "lucide-react";
import { Country } from "../types";
import { useLanguage, Language } from "../lib/i18n";

interface OnboardingViewProps {
  homeCountryOptions: Country[];
  onComplete: (selectedCountry: Country, selectedLanguage: Language) => void;
}

export default function OnboardingView({
  homeCountryOptions,
  onComplete
}: OnboardingViewProps) {
  const { t, language, setLanguage, dir } = useLanguage();
  const isAr = language === "ar";

  const [step, setStep] = useState<number>(1);
  const [selectedCountry, setSelectedCountry] = useState<Country>(
    homeCountryOptions.find(c => c.code === "US") || homeCountryOptions[0]
  );

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

  return (
    <div 
      className="absolute inset-0 bg-slate-950 text-white flex flex-col z-50 overflow-y-auto no-scrollbar justify-between p-6 pb-12"
      id="onboarding-viewport-container"
    >
      {/* Top Brand Logo */}
      <div className="flex flex-col items-center pt-8 space-y-2 shrink-0">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center font-display font-black text-white text-3xl shadow-lg shadow-blue-500/20"
        >
          N
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center"
        >
          <h2 className="text-xl font-display font-black tracking-tight">{t("app.title")}</h2>
          <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">{t("app.tagline")}</span>
        </motion.div>
      </div>

      {/* Slideable Steps Body */}
      <div className="flex-1 flex flex-col justify-center my-6 min-h-[440px]">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: isAr ? -30 : 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isAr ? 30 : -30 }}
              transition={{ duration: 0.3 }}
              className="space-y-6 flex flex-col justify-center"
            >
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-black text-white tracking-tight leading-tight">
                  {t("onboarding.welcome")}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
                  {t("onboarding.subtitle")}
                </p>
              </div>

              {/* Language Detection Indicator Panel */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-blue-900/30 text-blue-400 rounded-xl">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-300">
                      {t("onboarding.lang_detect")}
                    </h4>
                    <span className="text-[10px] text-slate-500">
                      {t("onboarding.lang_detect_desc", { lang: isAr ? "العربية" : "English" })}
                    </span>
                  </div>
                </div>

                {/* Direct Language Buttons */}
                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  <button
                    onClick={() => handleLanguageSelect("en")}
                    className={`py-3 px-4 text-xs font-black rounded-2xl border transition-all flex flex-col items-center justify-center gap-1.5 ${
                      language === "en"
                        ? "bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-600/10 scale-[1.02]"
                        : "bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-white"
                    }`}
                  >
                    <span className="text-sm">English</span>
                    <span className="text-[9px] opacity-75">LTR Layout</span>
                  </button>

                  <button
                    onClick={() => handleLanguageSelect("ar")}
                    className={`py-3 px-4 text-xs font-black rounded-2xl border transition-all flex flex-col items-center justify-center gap-1.5 ${
                      language === "ar"
                        ? "bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-600/10 scale-[1.02]"
                        : "bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-white"
                    }`}
                  >
                    <span className="text-sm">العربية</span>
                    <span className="text-[9px] opacity-75">تنسيق RTL</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: isAr ? -30 : 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isAr ? 30 : -30 }}
              transition={{ duration: 0.3 }}
              className="space-y-5 flex flex-col justify-center"
            >
              <div className="text-center space-y-1">
                <h3 className="text-xl font-black text-white tracking-tight leading-none">
                  {t("onboarding.select_home")}
                </h3>
                <p className="text-[11px] text-slate-400 leading-normal max-w-sm mx-auto">
                  {t("onboarding.select_home_desc")}
                </p>
              </div>

              {/* Country Selection Grid */}
              <div className="grid grid-cols-2 gap-2 max-h-[220px] overflow-y-auto no-scrollbar pr-1">
                {homeCountryOptions.map((country) => {
                  const isSelected = selectedCountry.code === country.code;
                  return (
                    <button
                      key={country.code}
                      onClick={() => setSelectedCountry(country)}
                      className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all relative ${
                        isSelected 
                          ? "bg-blue-600/10 border-blue-500 text-white font-extrabold" 
                          : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                      }`}
                      style={{ direction: isAr ? "rtl" : "ltr" }}
                    >
                      <span className="text-xl shrink-0">{country.flag}</span>
                      <div className="truncate text-xs">
                        <p className="font-bold truncate">{t(country.name)}</p>
                        <p className="text-[9px] opacity-70 font-mono">{country.currency} ({country.currencySymbol})</p>
                      </div>
                      {isSelected && (
                        <div className={`absolute top-2 ${isAr ? "left-2" : "right-2"} w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center`}>
                          <Check className="w-2.5 h-2.5 text-white stroke-[3px]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Automatic Currency Display Panel */}
              <div className="bg-slate-900/60 border border-slate-800/60 p-4 rounded-3xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl shrink-0">
                    <Coins className="w-4.5 h-4.5" />
                  </div>
                  <div className="text-left" style={{ direction: isAr ? "rtl" : "ltr" }}>
                    <p className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">{t("onboarding.default_currency")}</p>
                    <p className="text-xs font-bold text-slate-200">
                      {selectedCountry.currency} - {selectedCountry.currencySymbol}
                    </p>
                  </div>
                </div>
                <div className="text-right px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black rounded-lg uppercase tracking-wider font-mono">
                  {selectedCountry.code} BASE
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: isAr ? -30 : 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isAr ? 30 : -30 }}
              transition={{ duration: 0.3 }}
              className="space-y-6 flex flex-col justify-center text-center"
            >
              <div className="w-16 h-16 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-full flex items-center justify-center mx-auto mb-1">
                <Sparkles className="w-8 h-8 animate-pulse" />
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-black text-white tracking-tight leading-tight">
                  {t("onboarding.ready")}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
                  {t("onboarding.ready_desc")}
                </p>
              </div>

              {/* Recapitulate Profile */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 max-w-xs mx-auto w-full divide-y divide-slate-800 text-xs">
                <div className="flex justify-between items-center pb-2.5">
                  <span className="text-slate-500 flex items-center gap-1"><Globe className="w-3.5 h-3.5 text-blue-400" /> {isAr ? "اللغة" : "Language"}</span>
                  <span className="font-extrabold text-blue-400">{isAr ? "العربية" : "English"}</span>
                </div>
                <div className="flex justify-between items-center py-2.5">
                  <span className="text-slate-500 flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-emerald-400" /> {isAr ? "البلد الأصلي" : "Home Residence"}</span>
                  <span className="font-extrabold text-white">{selectedCountry.flag} {t(selectedCountry.name)}</span>
                </div>
                <div className="flex justify-between items-center pt-2.5">
                  <span className="text-slate-500 flex items-center gap-1"><Coins className="w-3.5 h-3.5 text-amber-400" /> {isAr ? "العملة" : "Currency"}</span>
                  <span className="font-extrabold text-amber-400 font-mono">{selectedCountry.currency} ({selectedCountry.currencySymbol})</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Onboarding Navigation Buttons Footer */}
      <div className="flex items-center justify-between shrink-0 pt-4">
        {/* Back Button */}
        <div>
          {step > 1 ? (
            <button
              onClick={handleBackStep}
              className="px-4 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-all text-xs font-bold flex items-center gap-1"
            >
              {isAr ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
              <span>{t("onboarding.btn_back")}</span>
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
                bullet === step ? "w-6 bg-blue-500" : "w-1.5 bg-slate-800"
              }`}
            />
          ))}
        </div>

        {/* Next / Finish Button */}
        <div>
          {step < 3 ? (
            <button
              onClick={handleNextStep}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-all text-xs font-bold flex items-center gap-1 shadow-lg shadow-blue-600/10"
            >
              <span>{t("onboarding.btn_next")}</span>
              {isAr ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-all text-xs font-black flex items-center gap-1.5 shadow-lg shadow-blue-600/20"
            >
              <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300" />
              <span>{t("onboarding.btn_finish")}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
