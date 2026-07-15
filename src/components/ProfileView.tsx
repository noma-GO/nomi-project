import React, { useState } from "react";
import { 
  User, Award, Globe, Sparkles, CheckCircle2, LogOut, Mail, Lock, 
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
  onRegister: (email: string, pass: string, name: string) => Promise<{ success: boolean; error?: string }>;
  onSignIn: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
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
  onRegister,
  onSignIn,
  onSignOut
}: ProfileViewProps) {
  const { t, language } = useLanguage();
  const isAr = language === "ar";

  // Local UI Edit states
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [nameUpdating, setNameUpdating] = useState(false);

  // Authentication Tab states
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authName, setAuthName] = useState("");
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

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);

    if (!email || !password) {
      setAuthError(isAr ? "البريد الإلكتروني وكلمة المرور مطلوبان" : "Email and Password are required");
      setAuthLoading(false);
      return;
    }

    try {
      if (isSignUp) {
        if (!authName) {
          setAuthError(isAr ? "الاسم مطلوب للتسجيل" : "Name is required for registration");
          setAuthLoading(false);
          return;
        }
        const res = await onRegister(email, password, authName);
        if (!res.success) {
          setAuthError(res.error || (isAr ? "فشل التسجيل" : "Failed to register"));
        } else {
          // Reset form fields
          setEmail("");
          setPassword("");
          setAuthName("");
        }
      } else {
        const res = await onSignIn(email, password);
        if (!res.success) {
          setAuthError(res.error || (isAr ? "فشل تسجيل الدخول" : "Failed to sign in"));
        } else {
          // Reset fields
          setEmail("");
          setPassword("");
        }
      }
    } catch (err: any) {
      setAuthError(err.message || (isAr ? "حدث خطأ في المصادقة" : "An authentication error occurred"));
    } finally {
      setAuthLoading(false);
    }
  };

  if (loadingProfile) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50 h-full">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        <p className="text-xs text-slate-500 mt-3 font-bold animate-pulse">{t("profile.syncing")}</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar p-4 flex flex-col space-y-4 h-full pb-28 bg-slate-50 animate-fade-in" id="profile-view-container">
      
      {/* Passport Mockup Header card */}
      <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-950 text-white rounded-3xl p-5 shadow-md relative overflow-hidden text-left">
        {/* Decorative pattern lines */}
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
        
        <div className={`relative z-10 flex gap-4 items-center ${isAr ? "flex-row-reverse" : "flex-row"}`}>
          {/* Avatar frame */}
          <div className="w-16 h-16 rounded-full bg-white/20 border-2 border-white/50 flex items-center justify-center font-display font-black text-2xl text-white shrink-0 uppercase">
            {displayName.substring(0, 2)}
          </div>

          <div className="space-y-1.5 flex-1 min-w-0 text-left">
            <div className={`flex justify-between items-center ${isAr ? "flex-row-reverse" : "flex-row"}`}>
              <span className="text-[8px] bg-blue-500/40 text-blue-100 border border-blue-400/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider inline-block">
                {isAnonymous ? t("profile.guest_account") : t("profile.cloud_passport")}
              </span>
              
              {!isAnonymous && (
                <button 
                  onClick={onSignOut}
                  className="text-white/60 hover:text-white transition-colors p-1"
                  title={isAr ? "تسجيل الخروج" : "Sign Out"}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>

            {isEditingName ? (
              <div className={`flex items-center gap-1.5 mt-1 ${isAr ? "flex-row-reverse" : "flex-row"}`}>
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="bg-white/10 border border-white/20 rounded px-2 py-0.5 text-xs font-bold text-white focus:outline-none focus:bg-white/20 shrink-0 w-[130px] text-left"
                  placeholder={isAr ? "تغيير الاسم" : "Change name"}
                  disabled={nameUpdating}
                />
                <button 
                  onClick={handleNameSave}
                  className="p-1 bg-emerald-500 rounded text-white"
                  disabled={nameUpdating}
                >
                  {nameUpdating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                </button>
              </div>
            ) : (
              <div className={`flex items-center gap-2 ${isAr ? "flex-row-reverse" : "flex-row"}`}>
                <h2 className="text-xl font-display font-black tracking-tight leading-none truncate">
                  {displayName}
                </h2>
                <button 
                  onClick={startEditing}
                  className="p-1 text-blue-200 hover:text-white hover:bg-white/10 rounded transition-all shrink-0"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
              </div>
            )}

            <p className="text-[10px] text-blue-100/80 font-mono flex items-center gap-1 truncate text-left">
              <Globe className="w-3.5 h-3.5 shrink-0" />
              ID: {fbUser?.uid ? `NOMI-${fbUser.uid.substring(0, 8).toUpperCase()}` : "NOMI-OFFLINE-ID"}
            </p>
          </div>
        </div>

        {/* Dynamic XP Progress Bar */}
        <div className="mt-5 space-y-1 relative z-10 text-left">
          <div className={`flex justify-between items-center text-[10px] font-bold text-blue-100/90 ${isAr ? "flex-row-reverse" : "flex-row"}`}>
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-sky-300" />
              {lvlInfo.title}
            </span>
            <span className="font-mono">{userXp} / {lvlInfo.max} XP</span>
          </div>
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-sky-400 to-emerald-400 transition-all duration-500 rounded-full"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>

        {/* Global Travel Stats row */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-white/10 text-center relative z-10">
          <div className="space-y-0.5">
            <span className="text-[8px] text-blue-200 font-bold uppercase tracking-wider block">{t("profile.global_scans")}</span>
            <span className="text-lg font-black font-mono text-white">
              {products.filter(p => p.id.startsWith("scanned-")).length}
            </span>
          </div>
          <div className="space-y-0.5">
            <span className="text-[8px] text-blue-200 font-bold uppercase tracking-wider block">{t("profile.contributions")}</span>
            <span className="text-lg font-black font-mono text-emerald-300">
              {contributionsCount}
            </span>
          </div>
          <div className="space-y-0.5">
            <span className="text-[8px] text-blue-200 font-bold uppercase tracking-wider block">{t("profile.explorer_level")}</span>
            <span className="text-lg font-black font-mono text-sky-300">{isAr ? "مستوى" : "Lvl"} {lvlInfo.level}</span>
          </div>
        </div>
      </div>

      {/* ANONYMOUS UPGRADE OR LOGIN BOX */}
      {isAnonymous && (
        <div className="bg-white border border-slate-100 rounded-3xl p-4 shadow-sm space-y-3">
          <div className={`flex items-start gap-3 ${isAr ? "flex-row-reverse" : "flex-row"}`}>
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-2xl shrink-0">
              <KeyRound className="w-5 h-5 animate-pulse" />
            </div>
            <div className="space-y-1 text-left">
              <h3 className="text-xs font-extrabold text-slate-800">{t("profile.secure_title")}</h3>
              <p className="text-[10px] text-slate-400 leading-normal">
                {t("profile.secure_desc")}
              </p>
            </div>
          </div>

          <form onSubmit={handleAuthSubmit} className="space-y-2.5 pt-1.5 text-left">
            {authError && (
              <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl text-[10px] font-bold border border-rose-100 text-left">
                ⚠️ {authError}
              </div>
            )}

            {isSignUp && (
              <div className="relative">
                <User className={`absolute top-2.5 w-4 h-4 text-slate-400 ${isAr ? "right-3.5" : "left-3.5"}`} />
                <input
                  type="text"
                  required
                  placeholder={t("profile.name_placeholder")}
                  value={authName}
                  onChange={(e) => setAuthName(e.target.value)}
                  className={`w-full bg-slate-50 border border-slate-100 rounded-xl py-2.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-none ${
                    isAr ? "pr-10 pl-4 text-right" : "pl-10 pr-4 text-left"
                  }`}
                />
              </div>
            )}

            <div className="relative">
              <Mail className={`absolute top-2.5 w-4 h-4 text-slate-400 ${isAr ? "right-3.5" : "left-3.5"}`} />
              <input
                type="email"
                required
                placeholder={t("profile.email_placeholder")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full bg-slate-50 border border-slate-100 rounded-xl py-2.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-none ${
                  isAr ? "pr-10 pl-4 text-right" : "pl-10 pr-4 text-left"
                }`}
              />
            </div>

            <div className="relative">
              <Lock className={`absolute top-2.5 w-4 h-4 text-slate-400 ${isAr ? "right-3.5" : "left-3.5"}`} />
              <input
                type="password"
                required
                placeholder={t("profile.password_placeholder")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full bg-slate-50 border border-slate-100 rounded-xl py-2.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-none ${
                  isAr ? "pr-10 pl-4 text-right" : "pl-10 pr-4 text-left"
                }`}
              />
            </div>

            <div className={`flex gap-2.5 pt-1 ${isAr ? "flex-row-reverse" : "flex-row"}`}>
              <button
                type="submit"
                disabled={authLoading}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl transition-all shadow-sm flex items-center justify-center gap-1"
              >
                {authLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : isSignUp ? (
                  t("profile.create_passport_btn")
                ) : (
                  t("profile.sign_in_btn")
                )}
              </button>
              
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setAuthError(null);
                }}
                className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-xl transition-all"
              >
                {isSignUp ? t("profile.use_login") : t("profile.need_account")}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Explorer Badges & achievements */}
      <div className="bg-white border border-slate-100 rounded-3xl p-4 shadow-sm space-y-3">
        <div className={`flex justify-between items-center ${isAr ? "flex-row-reverse" : "flex-row"}`}>
          <h3 className="text-sm font-display font-bold text-slate-800 flex items-center gap-1.5 justify-start">
            <Award className="w-4 h-4 text-blue-600 animate-pulse" />
            {t("profile.achievements_title")}
          </h3>
          <span className="text-[9px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-bold font-mono">
            {achievements.filter(a => a.unlocked).length} / {achievements.length} {isAr ? "تم فتحها" : "Unlocked"}
          </span>
        </div>

        <div className="space-y-2.5">
          {achievements.map((ach) => (
            <div 
              key={ach.id}
              className={`p-3 rounded-2xl border flex items-center justify-between gap-3 transition-all ${isAr ? "flex-row-reverse" : "flex-row"} ${
                ach.unlocked 
                  ? "bg-slate-50 border-slate-100" 
                  : "bg-slate-50/50 border-slate-100/50 opacity-50"
              }`}
            >
              <div className="space-y-0.5 text-left">
                <p className={`text-xs font-bold text-slate-800 flex items-center gap-1 ${isAr ? "flex-row-reverse" : "flex-row"}`}>
                  <span>{ach.unlocked ? "⭐" : "🔒"}</span> <span>{ach.title}</span>
                </p>
                <p className="text-[10px] text-slate-500 leading-normal max-w-[210px] text-left">{ach.desc}</p>
              </div>
              <span className={`text-[9px] font-bold font-mono px-1.5 py-0.5 rounded-full shrink-0 ${
                ach.unlocked ? "bg-blue-100 text-blue-700" : "bg-slate-200 text-slate-500"
              }`}>
                {ach.points}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Landmark Bucket list */}
      <div className="bg-white border border-slate-100 rounded-3xl p-4 shadow-sm space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider block text-left">{t("profile.visited_title")}</h3>
        <p className="text-[10px] text-slate-400 leading-normal text-left">
          {t("profile.visited_desc")}
        </p>

        <div className="space-y-2 text-left">
          {/* Fushimi Inari */}
          <div className={`p-3 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between ${isAr ? "flex-row-reverse text-right" : "flex-row text-left"}`}>
            <div className="space-y-0.5 text-left">
              <span className="text-[8px] bg-red-100 text-red-600 px-1.5 py-0.2 rounded font-bold uppercase">{isAr ? "اليابان" : "Japan"}</span>
              <p className="text-xs font-bold text-slate-800 text-left">{isAr ? "ضريح فوشيمي إناري (كيوتو)" : "Fushimi Inari Shrine (Kyoto)"}</p>
            </div>
            <button
              onClick={() => onToggleAttraction("att-jp-1")}
              className={`p-1.5 rounded-xl border text-[10px] font-bold transition-all shrink-0 ${
                visitedAttractions.includes("att-jp-1")
                  ? "bg-blue-600 border-blue-600 text-white"
                  : "bg-white border-slate-200 text-slate-600"
              }`}
            >
              {visitedAttractions.includes("att-jp-1") ? t("profile.visited_done") : t("profile.mark_visited")}
            </button>
          </div>

          {/* Shibuya Crossing */}
          <div className={`p-3 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between ${isAr ? "flex-row-reverse text-right" : "flex-row text-left"}`}>
            <div className="space-y-0.5 text-left">
              <span className="text-[8px] bg-red-100 text-red-600 px-1.5 py-0.2 rounded font-bold uppercase">{isAr ? "اليابان" : "Japan"}</span>
              <p className="text-xs font-bold text-slate-800 text-left">{isAr ? "تقاطع شيبويا (طوكيو)" : "Shibuya Crossing (Tokyo)"}</p>
            </div>
            <button
              onClick={() => onToggleAttraction("att-jp-2")}
              className={`p-1.5 rounded-xl border text-[10px] font-bold transition-all shrink-0 ${
                visitedAttractions.includes("att-jp-2")
                  ? "bg-blue-600 border-blue-600 text-white"
                  : "bg-white border-slate-200 text-slate-600"
              }`}
            >
              {visitedAttractions.includes("att-jp-2") ? t("profile.visited_done") : t("profile.mark_visited")}
            </button>
          </div>

          {/* The Colosseum */}
          <div className={`p-3 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between ${isAr ? "flex-row-reverse text-right" : "flex-row text-left"}`}>
            <div className="space-y-0.5 text-left">
              <span className="text-[8px] bg-emerald-100 text-emerald-600 px-1.5 py-0.2 rounded font-bold uppercase">{isAr ? "إيطاليا" : "Italy"}</span>
              <p className="text-xs font-bold text-slate-800 text-left">{isAr ? "مدرج الكولوسيوم (روما)" : "The Colosseum (Rome)"}</p>
            </div>
            <button
              onClick={() => onToggleAttraction("att-it-1")}
              className={`p-1.5 rounded-xl border text-[10px] font-bold transition-all shrink-0 ${
                visitedAttractions.includes("att-it-1")
                  ? "bg-blue-600 border-blue-600 text-white"
                  : "bg-white border-slate-200 text-slate-600"
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
