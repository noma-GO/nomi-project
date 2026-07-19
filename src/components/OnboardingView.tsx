import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Globe, ArrowRight, ArrowLeft, Check, Sparkles, Navigation, Coins, MapPin, Loader2, Compass, ShieldCheck, CheckCircle
} from "lucide-react";
import { Country } from "../types";
import { useLanguage, Language } from "../lib/i18n";
import { CountryManager } from "../lib/countryManager";

interface OnboardingViewProps {
  homeCountryOptions: Country[];
  onComplete: (selectedCountry: Country, selectedLanguage: Language) => void;
  onSignInGoogle: () => Promise<{ success: boolean; error?: string }>;
  onSignInApple: () => Promise<{ success: boolean; error?: string }>;
}

export default function OnboardingView({
  homeCountryOptions,
  onComplete,
  onSignInGoogle,
  onSignInApple
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

  // Auth states
  const [authLoading, setAuthLoading] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<boolean>(false);

  // Detect Platform
  const [platform, setPlatform] = useState<"android" | "ios" | "web">("web");

  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes("android")) {
      setPlatform("android");
    } else if (userAgent.includes("iphone") || userAgent.includes("ipad") || userAgent.includes("ipod")) {
      setPlatform("ios");
    } else {
      setPlatform("web");
    }
  }, []);

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

  // GPS Location Detection with Automated Step Transition
  const handleDetectLocation = () => {
    setGpsLoading(true);
    setGpsError(null);
    setGpsSuccessMessage(null);

    if (!navigator.geolocation) {
      setGpsError(isAr ? "نظام تحديد المواقع GPS غير مدعوم على هذا الجهاز. سيتم استخدام الإعداد الافتراضي..." : "GPS is not supported on this device. Using default...");
      setGpsLoading(false);
      // Auto-fallback and skip to step 3
      setTimeout(() => {
        setStep(3);
      }, 2000);
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
              // Automate jump to sign-in step
              setTimeout(() => {
                setStep(3);
              }, 1800);
            } else {
              setGpsError(isAr ? "تم تحديد موقعك ولكن رمز الدولة غير متوفر بقاعدة البيانات. جاري استخدام الإعداد الافتراضي..." : "Location detected, but country code is not registered in our app DB. Using fallback...");
              setTimeout(() => {
                setStep(3);
              }, 2500);
            }
          } else {
            setGpsError(isAr ? "فشل التعرف على رمز الدولة من الإحداثيات. جاري استخدام الإعداد الافتراضي..." : "Could not identify country from coordinates. Using fallback...");
            setTimeout(() => {
              setStep(3);
            }, 2500);
          }
        } catch (err) {
          console.error("Reverse geocoding error:", err);
          setGpsError(isAr ? "فشل الإتصال بخادم تحديد المواقع. جاري استخدام الإعداد الافتراضي..." : "Failed to connect to location resolution server. Using fallback...");
          setTimeout(() => {
            setStep(3);
          }, 2500);
        } finally {
          setGpsLoading(false);
        }
      },
      (error) => {
        console.warn("Geolocation error:", error);
        setGpsLoading(false);
        if (error.code === error.PERMISSION_DENIED) {
          setGpsError(isAr ? "تم رفض إذن الوصول للموقع. جاري ضبط الإعداد الافتراضي وتخطي الخطوة..." : "Location permission denied. Continuing with default country...");
        } else {
          setGpsError(isAr ? "فشل تحديد موقعك الحالي. جاري ضبط الإعداد الافتراضي وتخطي الخطوة..." : "Failed to retrieve your current location. Continuing with default...");
        }
        // Auto-advance to step 3 on any permission rejection
        setTimeout(() => {
          setStep(3);
        }, 2200);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Automatically request GPS position when Step 2 is active
  useEffect(() => {
    if (step === 2) {
      handleDetectLocation();
    }
  }, [step]);

  // Handle Social Sign-In (completely passwordless)
  const handleSocialSignIn = async (provider: "google" | "apple") => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      let res;
      if (provider === "google") {
        res = await onSignInGoogle();
      } else {
        res = await onSignInApple();
      }

      if (res.success) {
        setAuthSuccess(true);
        setTimeout(() => {
          handleNextStep();
        }, 1200);
      } else {
        setAuthError(res.error || (isAr ? "فشل تسجيل الدخول." : "Authentication failed."));
      }
    } catch (err: any) {
      setAuthError(err.message || (isAr ? "حدث خطأ أثناء الاتصال." : "Connection error during auth."));
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div 
      className="absolute inset-0 bg-slate-950 text-white flex flex-col z-50 overflow-y-auto no-scrollbar justify-between p-6 pb-10"
      id="onboarding-viewport-container"
    >
      {/* Dynamic Background Glows */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-blue-900/45 via-slate-950 to-slate-950 pointer-events-none" />
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] [background-size:24px_24px]" />

      {/* Top Header Navigation */}
      <div className="relative z-10 flex justify-between items-center w-full max-w-md mx-auto pt-2">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-sans font-black text-white text-lg shadow-lg shadow-blue-600/30">
            N
          </div>
          <span className="text-sm font-extrabold tracking-wider uppercase bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">Nomi</span>
        </div>
        <div className="text-[10px] bg-white/10 border border-white/5 text-slate-300 px-3.5 py-1.5 rounded-full font-bold uppercase tracking-wider backdrop-blur-md">
          {isAr ? "المعالج الذكي" : "Smart Onboarding"}
        </div>
      </div>

      {/* Slideable Content Area */}
      <div className="relative z-10 flex-1 flex flex-col justify-center my-8 max-w-md mx-auto w-full">
        <AnimatePresence mode="wait">
          
          {/* STEP 1: Welcome & Language selection */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -12 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="space-y-7"
            >
              <div className="text-center space-y-3">
                <div className="inline-flex p-3.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-3xl mb-1 shadow-inner shadow-blue-500/5">
                  <Globe className="w-9 h-9 animate-pulse text-blue-400" />
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
              <div className="bg-slate-900/90 border border-slate-800/80 backdrop-blur-2xl rounded-3xl p-5 space-y-4 shadow-2xl shadow-black/40">
                <div className="text-left" style={{ direction: isAr ? "rtl" : "ltr" }}>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-blue-500" />
                    <span>{isAr ? "اختر لغة الواجهة" : "INTERFACE LANGUAGE"}</span>
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1">
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

          {/* STEP 2: GPS Detection (Fully Automated, No manual country selection list) */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -12 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="space-y-6 flex flex-col justify-center items-center py-6"
            >
              <div className="text-center space-y-3">
                <div className="relative inline-flex mb-2">
                  {/* Glowing Radar Waves */}
                  <div className="absolute inset-0 rounded-full bg-indigo-500/10 border border-indigo-500/30 animate-ping scale-150 opacity-75"></div>
                  <div className="absolute inset-0 rounded-full bg-indigo-500/20 border border-indigo-500/20 animate-pulse scale-125"></div>
                  <div className="relative p-5 bg-indigo-600/15 border border-indigo-500/35 text-indigo-400 rounded-full shadow-lg">
                    <MapPin className="w-10 h-10 text-indigo-400 animate-bounce" />
                  </div>
                </div>
                <h3 className="text-xl font-black text-white tracking-tight leading-tight">
                  {isAr ? "تحديد الموقع الجغرافي التلقائي" : "Automatic Location Resolution"}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
                  {isAr 
                    ? "نستخدم نظام الـ GPS لتحديد بلدك تلقائياً وضبط العملة الافتراضية المناسبة لمقارنة الأسعار الذكية." 
                    : "Obtaining GPS coordinates to auto-configure your native currency, ensuring accurate real-time local calculations."}
                </p>
              </div>

              {/* Automatic Location Progress Board */}
              <div className="w-full bg-slate-900/90 border border-slate-800/80 backdrop-blur-2xl rounded-3xl p-6 space-y-4 shadow-2xl">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-indigo-600/25 text-indigo-400 rounded-2xl">
                    <Navigation className={`w-5 h-5 ${gpsLoading ? "animate-spin" : ""}`} />
                  </div>
                  <div className="text-left flex-1" style={{ direction: isAr ? "rtl" : "ltr" }}>
                    <p className="text-[9px] text-indigo-400 font-extrabold uppercase tracking-wider">
                      {isAr ? "حالة المستشعر الجغرافي" : "SENSORY REVERSE GEOCODING"}
                    </p>
                    <p className="text-xs font-black text-slate-200 mt-0.5">
                      {gpsLoading 
                        ? (isAr ? "جاري استقبال إحداثيات GPS وحل الترميز..." : "Acquiring satellite signals...") 
                        : (gpsError ? (isAr ? "تم تشغيل الفيلسيف التلقائي" : "Fallback active") : (isAr ? "اكتمل تحديد بلدك تلقائياً!" : "Country determined successfully!"))}
                    </p>
                  </div>
                </div>

                {gpsLoading && (
                  <div className="flex items-center gap-3 text-[11px] text-slate-400 bg-slate-950/60 p-3.5 rounded-2xl border border-slate-850/80">
                    <Loader2 className="w-4 h-4 animate-spin text-indigo-400 shrink-0" />
                    <span>{isAr ? "يرجى قبول الإذن عند ظهور نافذة الهاتف..." : "Please grant GPS access when requested by your device..."}</span>
                  </div>
                )}

                {gpsError && (
                  <div className="p-4 bg-amber-500/10 text-amber-400 rounded-2xl text-[10px] font-bold border border-amber-500/20 leading-relaxed text-left" style={{ direction: isAr ? "rtl" : "ltr" }}>
                    ⚠️ {gpsError}
                    <div className="text-[9px] text-slate-400 font-medium mt-1">
                      {isAr ? "سيتم التوجيه تلقائياً بالدول المفضلة..." : "Proceeding automatically with baseline configuration..."}
                    </div>
                  </div>
                )}

                {gpsSuccessMessage && (
                  <div className="p-4 bg-emerald-500/10 text-emerald-400 rounded-2xl text-xs font-bold border border-emerald-500/20 text-left flex items-start gap-2.5" style={{ direction: isAr ? "rtl" : "ltr" }}>
                    <Check className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div className="flex-1 leading-normal">
                      <span>{gpsSuccessMessage}</span>
                      <p className="text-[9.5px] text-slate-400 font-normal mt-0.5">
                        {isAr ? "يتم الآن حفظ جواز سفرك والتوجه للخطوة التالية..." : "Saving your local settings and advancing to next step..."}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* STEP 3: Passwordless Google & Apple Sign-In */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -12 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="space-y-6"
            >
              <div className="text-center space-y-3">
                <div className="inline-flex p-3.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-3xl mb-1 shadow-inner shadow-blue-500/5">
                  <ShieldCheck className="w-9 h-9 text-blue-400" />
                </div>
                <h3 className="text-2xl font-black text-white tracking-tight leading-none">
                  {isAr ? "تسجيل دخول آمن" : "Secure Passwordless Sign In"}
                </h3>
                <p className="text-xs text-slate-400 leading-normal max-w-xs mx-auto">
                  {isAr 
                    ? "لا توجد كلمات مرور صعبة بعد اليوم. سجل دخولك بضغطة واحدة لحفظ مستنداتك السفرية ونقاط XP تلقائياً." 
                    : "No complicated passwords needed. Auth with one tap to save your progress, travel documents, and XP points."}
                </p>
              </div>

              {/* Login Options card */}
              <div className="bg-slate-900/90 border border-slate-800/80 backdrop-blur-2xl rounded-3xl p-6 space-y-5 shadow-2xl shadow-black/40">
                <div className="space-y-3">
                  {authError && (
                    <div className="p-3 bg-rose-500/10 text-rose-400 rounded-2xl text-[11px] font-bold border border-rose-500/20 text-left">
                      ⚠️ {authError}
                    </div>
                  )}

                  {authSuccess && (
                    <div className="p-3.5 bg-emerald-500/10 text-emerald-400 rounded-2xl text-xs font-bold border border-emerald-500/20 flex items-center justify-center gap-2">
                      <CheckCircle className="w-4.5 h-4.5 text-emerald-400 animate-bounce" />
                      <span>{isAr ? "تم تسجيل الدخول بنجاح!" : "Signed in successfully!"}</span>
                    </div>
                  )}

                  {/* Google Sign-In button (Android / Web default) */}
                  {(platform === "android" || platform === "web") && (
                    <button
                      type="button"
                      disabled={authLoading || authSuccess}
                      onClick={() => handleSocialSignIn("google")}
                      className="w-full py-4 px-4 bg-white hover:bg-slate-50 text-slate-900 font-extrabold text-xs rounded-2xl transition-all shadow-lg hover:shadow-xl active:scale-98 flex items-center justify-center gap-3.5 cursor-pointer disabled:opacity-50"
                    >
                      {authLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                      ) : (
                        <svg className="w-5.5 h-5.5 shrink-0" viewBox="0 0 24 24">
                          <path
                            fill="#4285F4"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          />
                          <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                          />
                          <path
                            fill="#EA4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                          />
                        </svg>
                      )}
                      <span>{isAr ? "تسجيل الدخول بـ Google" : "Continue with Google"}</span>
                    </button>
                  )}

                  {/* Apple Sign-In button (iOS focus) */}
                  {(platform === "ios" || platform === "web") && (
                    <button
                      type="button"
                      disabled={authLoading || authSuccess}
                      onClick={() => handleSocialSignIn("apple")}
                      className="w-full py-4 px-4 bg-black hover:bg-slate-900 border border-slate-800 text-white font-extrabold text-xs rounded-2xl transition-all shadow-lg hover:shadow-xl active:scale-98 flex items-center justify-center gap-3.5 cursor-pointer disabled:opacity-50 mt-2.5"
                    >
                      {authLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                      ) : (
                        <svg className="w-5 h-5 shrink-0" fill="white" viewBox="0 0 24 24">
                          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-.96.04-2.13.64-2.82 1.45-.6.7-1.13 1.84-.99 2.94.97.08 2.05-.52 2.82-1.33z" />
                        </svg>
                      )}
                      <span>{isAr ? "تسجيل الدخول بـ Apple" : "Sign In with Apple"}</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-between border-t border-slate-800/80 pt-4 text-[11px] text-slate-500">
                  <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-blue-500" /> {isAr ? "خصوصية كاملة" : "Privacy Secured"}</span>
                  <button
                    onClick={handleNextStep}
                    className="text-blue-400 hover:text-blue-300 font-extrabold cursor-pointer"
                  >
                    {isAr ? "تخطي الآن" : "Skip Auth for Now"}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 4: Passport created */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -12 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="space-y-6 text-center"
            >
              <div className="w-18 h-18 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-3xl flex items-center justify-center mx-auto mb-1 shadow-lg shadow-blue-500/5">
                <Compass className="w-9 h-9 text-blue-400 animate-spin" style={{ animationDuration: '8s' }} />
              </div>

              <div className="space-y-2">
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
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 max-w-sm mx-auto w-full divide-y divide-slate-800/50 text-[11px] shadow-xl">
                <div className="flex justify-between items-center pb-3">
                  <span className="text-slate-500 flex items-center gap-1.5"><Globe className="w-3.5 h-3.5 text-blue-400" /> {isAr ? "لغة العرض" : "Selected Language"}</span>
                  <span className="font-extrabold text-blue-400">{isAr ? "العربية" : "English"}</span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-slate-500 flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-indigo-400" /> {isAr ? "الدولة الأم" : "Home Residence"}</span>
                  <span className="font-extrabold text-white">{selectedCountry.flag} {isAr ? selectedCountry.nameAr || selectedCountry.name : selectedCountry.name}</span>
                </div>
                <div className="flex justify-between items-center pt-3">
                  <span className="text-slate-500 flex items-center gap-1.5"><Coins className="w-3.5 h-3.5 text-emerald-400" /> {isAr ? "العملة الأساسية" : "Home Currency"}</span>
                  <span className="font-extrabold text-emerald-400 font-mono">{selectedCountry.currency} ({selectedCountry.currencySymbol})</span>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Navigation Footer */}
      <div className="relative z-10 flex items-center justify-between w-full max-w-md mx-auto pt-2 border-t border-white/5">
        {/* Back Button */}
        <div>
          {step > 1 && step < 4 ? (
            <button
              onClick={handleBackStep}
              className="px-4 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-all text-xs font-bold flex items-center gap-1 cursor-pointer active:scale-95 bg-slate-900/40"
            >
              {isAr ? <ArrowRight className="w-3.5 h-3.5" /> : <ArrowLeft className="w-3.5 h-3.5" />}
              <span>{isAr ? "رجوع" : "Back"}</span>
            </button>
          ) : (
            <div className="w-10"></div>
          )}
        </div>

        {/* Step Indicator Bullets */}
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((bullet) => (
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
              className="px-4.5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-all text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-blue-600/20 cursor-pointer active:scale-95"
            >
              <span>{isAr ? "التالي" : "Next"}</span>
              {isAr ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
            </button>
          ) : step === 3 ? (
            <button
              onClick={handleNextStep}
              className="px-4.5 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-all text-xs font-bold flex items-center gap-1 cursor-pointer active:scale-95 bg-slate-900/40"
            >
              <span>{isAr ? "تخطي" : "Skip"}</span>
              {isAr ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="px-4.5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white transition-all text-xs font-black flex items-center gap-1.5 shadow-lg shadow-blue-600/20 cursor-pointer active:scale-95 animate-pulse"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
              <span>{isAr ? "ابدأ الاستكشاف" : "Start Nomi"}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
