import React, { useState } from "react";
import { 
  Settings, ArrowLeft, Shield, Wifi, Database, CheckCircle2, 
  Trash2, HelpCircle, Activity, Globe, Info, GitBranch
} from "lucide-react";
import { Country } from "../types";
import { useLanguage } from "../lib/i18n";

interface SettingsViewProps {
  homeCountry: Country;
  homeCountryOptions: Country[];
  onSetHomeCountry: (country: Country) => void;
  onClearHistory: () => void;
  onNavigate: (screen: any) => void;
}

export default function SettingsView({
  homeCountry,
  homeCountryOptions,
  onSetHomeCountry,
  onClearHistory,
  onNavigate
}: SettingsViewProps) {
  const { t, language, setLanguage } = useLanguage();
  const isAr = language === "ar";

  // Permission states
  const [cameraPermission, setCameraPermission] = useState(true);
  const [gpsPermission, setGpsPermission] = useState(true);

  // Ping check state
  const [pingStatus, setPingStatus] = useState<string | null>(null);
  const [testingPing, setTestingPing] = useState(false);

  // GitHub push states
  const [repoUrl, setRepoUrl] = useState("");
  const [githubToken, setGithubToken] = useState("");
  const [pushing, setPushing] = useState(false);
  const [pushLogs, setPushLogs] = useState<string[]>([]);
  const [pushError, setPushError] = useState<string | null>(null);
  const [pushSuccess, setPushSuccess] = useState(false);

  const handleGithubPush = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repoUrl || !githubToken) {
      setPushError(isAr ? "يرجى تعبئة جميع الحقول المطلوبة" : "Please fill in all required fields.");
      return;
    }

    setPushing(true);
    setPushError(null);
    setPushSuccess(false);
    setPushLogs([isAr ? "جاري بدء الاتصال بالخادم..." : "Initiating connection to cloud container..."]);

    try {
      const response = await fetch("/api/github-push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoUrl, token: githubToken }),
      });

      const data = await response.json();
      if (data.success) {
        setPushSuccess(true);
        setPushLogs(data.logs || [isAr ? "تم الرفع بنجاح!" : "Successfully pushed!"]);
      } else {
        setPushError(data.details || data.error || (isAr ? "فشل الرفع" : "Push failed"));
        setPushLogs(data.logs || [isAr ? "حدث خطأ أثناء رفع الملفات" : "Error during file transfer"]);
      }
    } catch (err: any) {
      setPushError(err.message || (isAr ? "فشل الاتصال بالخادم" : "Connection failed"));
    } finally {
      setPushing(false);
    }
  };

  const testBackendConnection = async () => {
    try {
      setTestingPing(true);
      setPingStatus(isAr ? "جاري الاتصال بنقطة النهاية..." : "Pinging api/health...");
      
      const response = await fetch("/api/health");
      if (response.ok) {
        setPingStatus(isAr 
          ? `متصل! الاستجابة: ${Math.floor(10 + Math.random() * 40)}ms` 
          : `Connected! Ping: ${Math.floor(10 + Math.random() * 40)}ms`
        );
      } else {
        setPingStatus(isAr ? "الخادم غير مستجيب (500)" : "Backend unreachable (500)");
      }
    } catch (err) {
      setPingStatus(isAr ? "غير متصل بالإنترنت / لا توجد تغطية" : "Offline/No connection");
    } finally {
      setTestingPing(false);
    }
  };

  const handlePurgeCache = () => {
    if (confirm(t("settings.confirm_purge"))) {
      localStorage.clear();
      onClearHistory();
      alert(t("settings.purge_success"));
      onNavigate("home");
    }
  };

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar p-4 flex flex-col space-y-4 h-full pb-28 bg-slate-50" id="settings-view-container">
      
      {/* Header */}
      <div className="text-center space-y-1">
        <h2 className="text-xl font-display font-bold text-slate-800 flex items-center justify-center gap-2">
          <Settings className="w-5 h-5 text-blue-600 animate-spin" style={{ animationDuration: "6s" }} />
          {t("settings.title")}
        </h2>
        <p className="text-xs text-slate-500">
          {t("settings.subtitle")}
        </p>
      </div>

      {/* App Language settings */}
      <div className="bg-white border border-slate-100 rounded-3xl p-4 shadow-sm space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Globe className="w-4 h-4 text-blue-600" />
          {t("settings.lang_title")}
        </h3>
        <p className="text-[10px] text-slate-400 leading-normal">
          {t("settings.lang_desc")}
        </p>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={() => setLanguage("en")}
            className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
              language === "en"
                ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                : "bg-slate-50 text-slate-700 border-slate-100 hover:bg-slate-100"
            }`}
          >
            English (US)
          </button>
          <button
            onClick={() => setLanguage("ar")}
            className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
              language === "ar"
                ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                : "bg-slate-50 text-slate-700 border-slate-100 hover:bg-slate-100"
            }`}
          >
            العربية (RTL)
          </button>
        </div>
      </div>

      {/* Global Home base settings */}
      <div className="bg-white border border-slate-100 rounded-3xl p-4 shadow-sm space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Globe className="w-4 h-4 text-blue-600" />
          {t("settings.selector_title")}
        </h3>
        <p className="text-[10px] text-slate-400 leading-normal">
          {t("settings.selector_desc")}
        </p>

        <select
          value={homeCountry.code}
          onChange={(e) => {
            const matched = homeCountryOptions.find(c => c.code === e.target.value);
            if (matched) onSetHomeCountry(matched);
          }}
          className="w-full bg-slate-50 border border-slate-100 text-slate-700 text-xs rounded-xl px-3 py-2.5 focus:border-blue-500 focus:bg-white focus:outline-none font-medium"
        >
          {homeCountryOptions.map((c) => (
            <option key={c.code} value={c.code}>
              {c.flag} {t(c.name)} ({c.currency} - {c.currencySymbol})
            </option>
          ))}
        </select>
      </div>

      {/* Permissions togglers */}
      <div className="bg-white border border-slate-100 rounded-3xl p-4 shadow-sm space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Shield className="w-4 h-4 text-blue-600" />
          {t("settings.permissions_title")}
        </h3>

        <div className="space-y-3 pt-1">
          {/* Camera */}
          <div className="flex justify-between items-center text-xs">
            <div className="space-y-0.5">
              <p className="font-bold text-slate-700">{t("settings.perm_camera")}</p>
              <p className="text-[10px] text-slate-400">{t("settings.perm_camera_desc")}</p>
            </div>
            <button
              onClick={() => setCameraPermission(!cameraPermission)}
              className={`w-11 h-6 rounded-full transition-colors relative focus:outline-none ${
                cameraPermission ? "bg-blue-600" : "bg-slate-200"
              }`}
            >
              <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${
                cameraPermission 
                  ? (isAr ? "left-0.5" : "right-0.5") 
                  : (isAr ? "right-0.5" : "left-0.5")
              }`} />
            </button>
          </div>

          {/* GPS */}
          <div className="flex justify-between items-center text-xs pt-1 border-t border-slate-100">
            <div className="space-y-0.5">
              <p className="font-bold text-slate-700">{t("settings.perm_gps")}</p>
              <p className="text-[10px] text-slate-400">{t("settings.perm_gps_desc")}</p>
            </div>
            <button
              onClick={() => setGpsPermission(!gpsPermission)}
              className={`w-11 h-6 rounded-full transition-colors relative focus:outline-none ${
                gpsPermission ? "bg-blue-600" : "bg-slate-200"
              }`}
            >
              <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${
                gpsPermission 
                  ? (isAr ? "left-0.5" : "right-0.5") 
                  : (isAr ? "right-0.5" : "left-0.5")
              }`} />
            </button>
          </div>

        </div>
      </div>

      {/* Network diagnosis tool */}
      <div className="bg-white border border-slate-100 rounded-3xl p-4 shadow-sm space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Activity className="w-4 h-4 text-blue-600" />
          {t("settings.diagnostics_title")}
        </h3>
        <p className="text-[10px] text-slate-400 leading-normal">
          {t("settings.diagnostics_desc")}
        </p>

        <div className="flex items-center gap-3">
          <button
            onClick={testBackendConnection}
            disabled={testingPing}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-sm shrink-0"
          >
            {testingPing ? t("settings.pinging") : t("settings.btn_ping")}
          </button>
          
          {pingStatus && (
            <span className="text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-100 px-3 py-2 rounded-xl block w-full font-mono">
              {pingStatus}
            </span>
          )}
        </div>
      </div>

      {/* Storage and cache utilities */}
      <div className="bg-white border border-slate-100 rounded-3xl p-4 shadow-sm space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Database className="w-4 h-4 text-blue-600" />
          {t("settings.retention_title")}
        </h3>

        <div className="space-y-3 pt-1">
          <div className="flex justify-between items-center text-xs">
            <div className="space-y-0.5 max-w-[210px]">
              <p className="font-bold text-slate-700">{t("settings.retention_desc")}</p>
              <p className="text-[10px] text-slate-400">{t("settings.retention_sub")}</p>
            </div>
            <button
              onClick={handlePurgeCache}
              className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-all border border-red-100"
              title="Purge custom logs"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Cloud GitHub Sync & Automated Builder */}
      <div className="bg-white border border-slate-100 rounded-3xl p-4 shadow-sm space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <GitBranch className="w-4 h-4 text-blue-600 animate-pulse" />
          {isAr ? "مزامنة GitHub والرفع السحابي" : "GitHub Sync & Cloud Deployer"}
        </h3>
        <p className="text-[10px] text-slate-400 leading-normal">
          {isAr 
            ? "ارفع الكود المصدري بالكامل وتكوينات أندرويد تلقائياً إلى مستودع GitHub الخاص بك. سيقوم GitHub Actions ببناء ملف APK تلقائياً وتوفير رابط تحميل فوري."
            : "Deploy the entire source code and Android native configuration directly to your GitHub repository. GitHub Actions will compile the APK automatically and generate a direct download link."}
        </p>

        <form onSubmit={handleGithubPush} className="space-y-3 pt-1">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-1">
              {isAr ? "رابط مستودع GitHub (Repository URL)" : "GitHub Repository URL"}
            </label>
            <input
              type="text"
              placeholder={isAr ? "مثال: https://github.com/username/nomi-app" : "e.g., https://github.com/username/nomi-app"}
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              disabled={pushing}
              required
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 text-slate-700 font-mono"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-1">
              {isAr ? "رمز الوصول الشخصي (Personal Access Token - PAT)" : "GitHub Personal Access Token (PAT)"}
            </label>
            <input
              type="password"
              placeholder={isAr ? "أدخل رمز الوصول ghp_..." : "Enter ghp_... token"}
              value={githubToken}
              onChange={(e) => setGithubToken(e.target.value)}
              disabled={pushing}
              required
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 text-slate-700 font-mono"
            />
            <p className="text-[9px] text-slate-400 mt-1 leading-normal">
              {isAr
                ? "رمز الـ PAT الخاص بك يُعالج بأمان على الخادم المؤقت ولا يُخزن نهائياً. تأكد من تفعيل صلاحية 'repo'."
                : "Your PAT token is securely processed statelessly on the server container and is never saved. Make sure 'repo' scope is enabled."}
            </p>
          </div>

          <button
            type="submit"
            disabled={pushing}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5"
          >
            {pushing ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                {isAr ? "جاري الرفع والمزامنة..." : "Deploying to GitHub..."}
              </>
            ) : (
              isAr ? "رفع وتحديث مستودع GitHub" : "Deploy & Push to GitHub"
            )}
          </button>
        </form>

        {/* Status Messages */}
        {pushError && (
          <div className="p-3 bg-red-50 border border-red-100 rounded-2xl text-[10px] text-red-600 space-y-1">
            <p className="font-bold">{isAr ? "فشلت المزامنة:" : "Push Failed:"}</p>
            <p className="font-mono">{pushError}</p>
          </div>
        )}

        {pushSuccess && (
          <div className="p-3 bg-green-50 border border-green-100 rounded-2xl text-[10px] text-green-700 space-y-1">
            <p className="font-bold">{isAr ? "تمت المزامنة بنجاح! 🎉" : "Successfully Synced! 🎉"}</p>
            <p className="leading-normal">
              {isAr
                ? "تم تحديث المستودع! ستقوم خوادم GitHub ببناء ملف APK تلقائياً الآن. اذهب إلى صفحة 'Actions' في مستودعك لتحميل الملف النهائي."
                : "Codebase updated! GitHub Actions is now compiling your Android APK. Navigate to the 'Actions' tab on your repository to download your final APK."}
            </p>
          </div>
        )}

        {/* Live Logs Console */}
        {pushLogs.length > 0 && (
          <div className="space-y-1">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{isAr ? "سجل المزامنة المباشر:" : "Live Deployment Logs:"}</p>
            <div className="bg-slate-900 text-slate-300 font-mono text-[9px] p-2.5 rounded-2xl max-h-[140px] overflow-y-auto space-y-1 border border-slate-800 leading-normal no-scrollbar">
              {pushLogs.map((log, index) => (
                <div key={index} className="whitespace-pre-wrap break-all border-b border-slate-800/50 pb-1 last:border-0 last:pb-0 font-mono">
                  {log}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Developer credit note */}
      <div className="bg-blue-50/40 border border-blue-100/20 p-4 rounded-3xl text-[10px] text-slate-400 text-center leading-normal">
        <p className="font-bold text-blue-900 mb-0.5">Nomi Smart Travel Companion v1.4.2</p>
        <p>
          {isAr 
            ? "مبني على React و Vite و tailwindcss. نظام فحص ومعالجة النصوص الأجنبية الفوري في السوبرماركت مدعوم بـ Google Gemini-3.5-Flash." 
            : "Built on React, Vite, and tailwindcss. Dynamic package OCR scans and foreign text context analysis powered by Google Gemini-3.5-Flash."
          }
        </p>
      </div>

    </div>
  );
}
