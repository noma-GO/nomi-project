import React, { useState } from "react";
import { 
  User, Award, Globe, Sparkles, LogOut, Mail, Lock, 
  Edit2, Check, Loader2, KeyRound
} from "lucide-react";
import { Country, Product } from "../types";
import { User as FirebaseUser } from "firebase/auth";
import { useLanguage } from "../lib/i18n";

interface ProfileViewProps {
  currentCountry: Country;
  products: Product[];
  onNavigate: (screen: any) => void;
  fbUser: FirebaseUser | null;
  userProfile: {
    displayName: string;
    email: string | null;
    xp: number;
    visitedAttractions: string[];
  } | null;
  loadingProfile: boolean;
  onToggleAttraction: (id: string) => void;
  onUpdateName: (name: string) => void;
  onSignInGoogle: () => Promise<{ success: boolean; error?: string }>;
  onSignInApple: () => Promise<{ success: boolean; error?: string }>;
  onSignOut: () => void;
}

export default function ProfileView({ 
  currentCountry, 
  products, 
  onNavigate,
  fbUser,
  userProfile,
  loadingProfile,
  onToggleAttraction,
  onUpdateName,
  onSignInGoogle,
  onSignInApple,
  onSignOut
}: ProfileViewProps) {
  const { t, language } = useLanguage();
  const isAr = language === "ar";

  // Local UI Edit states
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [nameUpdating, setNameUpdating] = useState(false);

  // Authentication states
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Check visited attractions
  const visitedAttractions = userProfile?.visitedAttractions || [];
  const displayName = userProfile?.displayName || (isAr ? "برنارد بروير" : "Bernard Brewer");
  const userXp = userProfile?.xp ?? 950;
  const isAnonymous = fbUser?.isAnonymous ?? true;

  // Determine levels dynamically based on experience points (XP)
  const calculateLevelInfo = (xp: number) => {
    if (xp <= 200) {
      return { level: 1, title: isAr ? "رحالة مبتدئ" : "Novice Nomad", min: 0, max: 200 };
    } else if (xp <= 500) {
      return { level: 2, title: isAr ? "رحالة نشط" : "Active Backpacker", min: 201, max: 500 };
    } else if (xp <= 900) {
      return { level: 3, title: isAr ? "مسافر ذكي" : "Savvy Voyager", min: 501, max: 900 };
    } else if (xp <= 1400) {
      return { level: 4, title: isAr ? "مستكشف خبير" : "Explorer Expert", min: 901, max: 1400 };
    } else {
      return { level: 5, title: isAr ? "أستاذ سفر عالمي" : "Global Grandmaster", min: 1401, max: 3000 };
    }
  };

  const lvlInfo = calculateLevelInfo(userXp);
  const progressPercent = Math.min(
    100,
    Math.max(0, ((userXp - lvlInfo.min) / (lvlInfo.max - lvlInfo.min)) * 100)
  );

  const contributionsCount = products.filter(
    (p) => p.id.startsWith("contributed-") || p.id.startsWith("scanned-")
  ).length;

  const achievements = [
    {
      id: "ach-1",
      title: isAr ? "أول مسح ضوئي" : "First Optical Scan",
      desc: isAr ? "مسح وفك تشفير باركود لسلعة خفيفة دولية." : "Scanned and decoded an international snack barcode.",
      unlocked: true,
      points: "+100 XP"
    },
    {
      id: "ach-2",
      title: isAr ? "مساهم مكافح التضخم" : "Anti-Inflation Contributor",
      desc: isAr ? "تقديم سعر بقالة محلي تم التحقق منه." : "Submitted a verified local grocery store price log.",
      unlocked: contributionsCount > 0,
      points: "+150 XP"
    },
    {
      id: "ach-3",
      title: isAr ? "مترجم إشارات بطلاقة" : "Sign Language Fluent",
      desc: isAr ? "ترجمة مخرج مترو أنفاق أو لوحة مقهى أجنبي." : "Translated a foreign subway exit or cafe sign.",
      unlocked: true,
      points: "+100 XP"
    },
    {
      id: "ach-4",
      title: isAr ? "زائر المعالم الكبرى" : "Grand Landmark Visitor",
      desc: isAr ? "تحديد معلم سياحي يحذر من الاحتيال كمعلم تمت زيارته." : "Marked a target safety alert attraction as visited.",
      unlocked: visitedAttractions.length > 0,
      points: "+200 XP"
    }
  ];

  // Actions
  const handleNameSave = async () => {
    if (!editedName.trim()) {
      setIsEditingName(false);
      return;
    }
    try {
      setNameUpdating(true);
      await onUpdateName(editedName);
      setIsEditingName(false);
    } catch (err) {
      console.error(err);
    } finally {
      setNameUpdating(false);
    }
  };

  const startEditing = () => {
    setEditedName(displayName);
    setIsEditingName(true);
  };

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar p-6 flex flex-col space-y-6 h-full pb-32 bg-slate-50" id="profile-view-container">
      
      {/* Passport Mockup Header card */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 text-white shadow-xl shadow-slate-950/10 border border-slate-800 p-6">
        {/* Soft elegant background glows */}
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]"></div>
        
        <div className={`relative z-10 flex gap-5 items-start ${isAr ? "flex-row-reverse text-right" : "flex-row text-left"}`}>
          {/* Avatar frame */}
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-sans font-black text-2xl text-white shrink-0 shadow-lg shadow-blue-500/20 uppercase tracking-wider">
            {displayName.substring(0, 2)}
          </div>

          <div className="space-y-2 flex-1 min-w-0">
            <div className={`flex justify-between items-center gap-2 ${isAr ? "flex-row-reverse" : "flex-row"}`}>
              <span className="text-[10px] bg-white/10 hover:bg-white/15 text-slate-200 px-3 py-1 rounded-full font-bold uppercase tracking-wider inline-block backdrop-blur-md transition-colors border border-white/5">
                {isAnonymous ? t("profile.guest_account") : t("profile.cloud_passport")}
              </span>
              
              {!isAnonymous && (
                <button 
                  onClick={onSignOut}
                  className="text-slate-400 hover:text-white transition-all p-1.5 hover:bg-white/10 rounded-xl"
                  title={isAr ? "تسجيل الخروج" : "Sign Out"}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>

            {isEditingName ? (
              <div className={`flex items-center gap-2 mt-1 ${isAr ? "flex-row-reverse" : "flex-row"}`}>
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className={`bg-white/10 border border-white/20 rounded-xl px-3 py-1.5 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-slate-800 shrink-0 w-[150px] ${
                    isAr ? "text-right" : "text-left"
                  }`}
                  placeholder={isAr ? "تغيير الاسم" : "Change name"}
                  disabled={nameUpdating}
                />
                <button 
                  onClick={handleNameSave}
                  className="p-2 bg-emerald-500 hover:bg-emerald-600 rounded-xl text-white transition-all shadow-sm"
                  disabled={nameUpdating}
                >
                  {nameUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                </button>
              </div>
            ) : (
              <div className={`flex items-center gap-2 group ${isAr ? "flex-row-reverse" : "flex-row"}`}>
                <h2 className="text-2xl font-sans font-extrabold tracking-tight text-white leading-none truncate">
                  {displayName}
                </h2>
                <button 
                  onClick={startEditing}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-all shrink-0"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <p className={`text-xs text-slate-400 font-mono flex items-center gap-1.5 truncate ${isAr ? "flex-row-reverse" : "flex-row"}`}>
              <Globe className="w-4 h-4 text-slate-500 shrink-0" />
              <span>ID: {fbUser?.uid ? `NOMI-${fbUser.uid.substring(0, 8).toUpperCase()}` : "NOMI-OFFLINE-ID"}</span>
            </p>
          </div>
        </div>

        {/* Dynamic XP Progress Bar */}
        <div className="mt-6 space-y-2 relative z-10">
          <div className={`flex justify-between items-center text-xs font-bold text-slate-300 ${isAr ? "flex-row-reverse" : "flex-row"}`}>
            <span className={`flex items-center gap-1.5 ${isAr ? "flex-row-reverse" : "flex-row"}`}>
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>{lvlInfo.title}</span>
            </span>
            <span className="font-mono tracking-wider">{userXp} / {lvlInfo.max} XP</span>
          </div>
          <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden p-[2px] border border-slate-700/50">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 via-indigo-400 to-emerald-400 transition-all duration-700 rounded-full shadow-inner"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>

        {/* Global Travel Stats row */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-5 border-t border-slate-800 text-center relative z-10">
          <div className="space-y-1">
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">{t("profile.global_scans")}</span>
            <span className="text-xl font-black font-mono text-white">
              {products.filter(p => p.id.startsWith("scanned-")).length}
            </span>
          </div>
          <div className="space-y-1">
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">{t("profile.contributions")}</span>
            <span className="text-xl font-black font-mono text-emerald-400">
              {contributionsCount}
            </span>
          </div>
          <div className="space-y-1">
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">{t("profile.explorer_level")}</span>
            <span className="text-xl font-black font-mono text-blue-400">{isAr ? "مستوى" : "Lvl"} {lvlInfo.level}</span>
          </div>
        </div>
      </div>

      {/* GOOGLE & APPLE OFFICIAL SIGN-IN BOX */}
      {isAnonymous && (
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm shadow-slate-100/40 space-y-4" id="profile-auth-box">
          <div className={`flex items-start gap-4 ${isAr ? "flex-row-reverse text-right" : "flex-row text-left"}`}>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl shrink-0">
              <KeyRound className="w-6 h-6 animate-pulse" />
            </div>
            <div className="space-y-1 flex-1">
              <h3 className="text-sm font-extrabold text-slate-800">
                {isAr ? "ربط جواز السفر السحابي الخاص بك" : "Link Your Cloud Passport"}
              </h3>
              <p className="text-xs text-slate-500 leading-normal">
                {isAr 
                  ? "قم بتسجيل الدخول باستخدام Google أو Apple لمزامنة وحفظ نقاط الخبرة (XP) ومساهماتك بشكل آمن عبر جميع أجهزتك على الفور." 
                  : "Sign in with Google or Apple to securely sync and save your XP points and travel contributions across all devices instantly."}
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            {authError && (
              <div className="p-3 bg-rose-50 text-rose-600 rounded-xl text-xs font-bold border border-rose-100 text-left">
                ⚠️ {authError}
              </div>
            )}

            <div className="grid grid-cols-1 gap-2.5">
              {/* Google Sign-In */}
              <button
                type="button"
                disabled={authLoading}
                onClick={async () => {
                  try {
                    setAuthLoading(true);
                    setAuthError(null);
                    const result = await onSignInGoogle();
                    if (!result.success) {
                      setAuthError(result.error || (isAr ? "فشل تسجيل الدخول باستخدام Google" : "Google Sign-In failed"));
                    }
                  } catch (err: any) {
                    setAuthError(err.message || (isAr ? "حدث خطأ غير متوقع" : "An unexpected error occurred"));
                  } finally {
                    setAuthLoading(false);
                  }
                }}
                className="w-full py-3.5 px-4 bg-white border border-slate-200 text-slate-700 font-extrabold text-xs rounded-2xl transition-all shadow-sm hover:shadow-md hover:bg-slate-50 active:scale-98 flex items-center justify-center gap-3 cursor-pointer"
              >
                {authLoading ? (
                  <Loader2 className="w-4.5 h-4.5 animate-spin text-blue-600" />
                ) : (
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
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
                <span>{isAr ? "تسجيل الدخول بـ Google" : "Sign In with Google"}</span>
              </button>

              {/* Apple Sign-In */}
              <button
                type="button"
                disabled={authLoading}
                onClick={async () => {
                  try {
                    setAuthLoading(true);
                    setAuthError(null);
                    const result = await onSignInApple();
                    if (!result.success) {
                      setAuthError(result.error || (isAr ? "فشل تسجيل الدخول باستخدام Apple" : "Apple Sign-In failed"));
                    }
                  } catch (err: any) {
                    setAuthError(err.message || (isAr ? "حدث خطأ غير متوقع" : "An unexpected error occurred"));
                  } finally {
                    setAuthLoading(false);
                  }
                }}
                className="w-full py-3.5 px-4 bg-black text-white font-extrabold text-xs rounded-2xl transition-all shadow-sm hover:shadow-md hover:bg-slate-900 active:scale-98 flex items-center justify-center gap-3 cursor-pointer"
              >
                {authLoading ? (
                  <Loader2 className="w-4.5 h-4.5 animate-spin text-slate-400" />
                ) : (
                  <svg className="w-4.5 h-4.5 shrink-0" fill="white" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-.96.04-2.13.64-2.82 1.45-.6.7-1.13 1.84-.99 2.94.97.08 2.05-.52 2.82-1.33z" />
                  </svg>
                )}
                <span>{isAr ? "تسجيل الدخول بـ Apple" : "Sign In with Apple"}</span>
              </button>
            </div>

            <p className="text-[10px] text-slate-400 text-center">
              {isAr 
                ? "سيفتح هذا واجهة اختيار الحسابات الرسمية على جهازك تلقائياً." 
                : "This will open the official account selection panel on your device."}
            </p>
          </div>
        </div>
      )}

      {/* Explorer Badges & achievements */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm shadow-slate-100/40 space-y-4">
        <div className={`flex justify-between items-center ${isAr ? "flex-row-reverse text-right" : "flex-row text-left"}`}>
          <h3 className={`text-sm font-sans font-black text-slate-800 flex items-center gap-2 ${isAr ? "flex-row-reverse" : "flex-row"}`}>
            <Award className="w-5 h-5 text-blue-600" />
            <span>{t("profile.achievements_title")}</span>
          </h3>
          <span className="text-[10px] bg-slate-100 text-slate-600 px-3 py-1 rounded-full font-bold font-mono border border-slate-200/40">
            {achievements.filter(a => a.unlocked).length} / {achievements.length} {isAr ? "تم فتحها" : "Unlocked"}
          </span>
        </div>

        <div className="space-y-3">
          {achievements.map((ach) => (
            <div 
              key={ach.id}
              className={`p-4 rounded-2xl border flex items-center justify-between gap-4 transition-all ${isAr ? "flex-row-reverse text-right" : "flex-row text-left"} ${
                ach.unlocked 
                  ? "bg-slate-50/50 border-slate-100 shadow-sm" 
                  : "bg-slate-50/20 border-slate-100/30 opacity-45 select-none"
              }`}
            >
              <div className="space-y-1 text-left flex-1 min-w-0">
                <p className={`text-xs font-extrabold text-slate-800 flex items-center gap-1.5 ${isAr ? "flex-row-reverse" : "flex-row"}`}>
                  <span className="shrink-0">{ach.unlocked ? "🏆" : "🔒"}</span> 
                  <span className="truncate">{ach.title}</span>
                </p>
                <p className={`text-[11px] text-slate-500 leading-relaxed ${isAr ? "text-right" : "text-left"}`}>{ach.desc}</p>
              </div>
              <span className={`text-[10px] font-bold font-mono px-2.5 py-1 rounded-full shrink-0 ${
                ach.unlocked ? "bg-emerald-100 text-emerald-800 border border-emerald-200" : "bg-slate-200 text-slate-500"
              }`}>
                {ach.points}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Landmark Bucket list */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm shadow-slate-100/40 space-y-4">
        <div className="space-y-1 text-left">
          <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block">{t("profile.visited_title")}</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            {t("profile.visited_desc")}
          </p>
        </div>

        <div className="space-y-3">
          {/* Fushimi Inari */}
          <div className={`p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between gap-4 ${isAr ? "flex-row-reverse text-right" : "flex-row text-left"}`}>
            <div className="space-y-1 text-left flex-1 min-w-0">
              <span className="text-[9px] bg-red-100 text-red-600 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider inline-block">{isAr ? "اليابان" : "Japan"}</span>
              <p className="text-xs font-bold text-slate-800 truncate">{isAr ? "ضريح فوشيمي إناري (كيوتو)" : "Fushimi Inari Shrine (Kyoto)"}</p>
            </div>
            <button
              onClick={() => onToggleAttraction("att-jp-1")}
              className={`px-3 py-2 rounded-xl border text-[10px] font-extrabold transition-all shrink-0 active:scale-95 ${
                visitedAttractions.includes("att-jp-1")
                  ? "bg-emerald-600 border-emerald-600 text-white shadow-sm shadow-emerald-600/10"
                  : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              {visitedAttractions.includes("att-jp-1") ? t("profile.visited_done") : t("profile.mark_visited")}
            </button>
          </div>

          {/* Shibuya Crossing */}
          <div className={`p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between gap-4 ${isAr ? "flex-row-reverse text-right" : "flex-row text-left"}`}>
            <div className="space-y-1 text-left flex-1 min-w-0">
              <span className="text-[9px] bg-red-100 text-red-600 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider inline-block">{isAr ? "اليابان" : "Japan"}</span>
              <p className="text-xs font-bold text-slate-800 truncate">{isAr ? "تقاطع شيبويا (طوكيو)" : "Shibuya Crossing (Tokyo)"}</p>
            </div>
            <button
              onClick={() => onToggleAttraction("att-jp-2")}
              className={`px-3 py-2 rounded-xl border text-[10px] font-extrabold transition-all shrink-0 active:scale-95 ${
                visitedAttractions.includes("att-jp-2")
                  ? "bg-emerald-600 border-emerald-600 text-white shadow-sm shadow-emerald-600/10"
                  : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              {visitedAttractions.includes("att-jp-2") ? t("profile.visited_done") : t("profile.mark_visited")}
            </button>
          </div>

          {/* The Colosseum */}
          <div className={`p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between gap-4 ${isAr ? "flex-row-reverse text-right" : "flex-row text-left"}`}>
            <div className="space-y-1 text-left flex-1 min-w-0">
              <span className="text-[9px] bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider inline-block">{isAr ? "إيطاليا" : "Italy"}</span>
              <p className="text-xs font-bold text-slate-800 truncate">{isAr ? "مدرج الكولوسيوم (روما)" : "The Colosseum (Rome)"}</p>
            </div>
            <button
              onClick={() => onToggleAttraction("att-it-1")}
              className={`px-3 py-2 rounded-xl border text-[10px] font-extrabold transition-all shrink-0 active:scale-95 ${
                visitedAttractions.includes("att-it-1")
                  ? "bg-emerald-600 border-emerald-600 text-white shadow-sm shadow-emerald-600/10"
                  : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              {visitedAttractions.includes("att-it-1") ? t("profile.visited_done") : t("profile.mark_visited")}
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
