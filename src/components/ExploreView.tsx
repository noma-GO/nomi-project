import React, { useState, useEffect } from "react";
import { 
  Compass, Store, Landmark, Map, MapPin, ShieldAlert, Star, Clock, 
  Sparkles, CheckCircle2, Ticket, ChevronRight, Navigation, Info,
  Globe, Search, Plane, Hotel, Utensils, CloudSun, Languages, 
  PhoneCall, ShieldCheck, RefreshCw, CreditCard, Droplet, Smile, HeartHandshake
} from "lucide-react";
import { Country, Supermarket, Attraction, CountryGuide } from "../types";
// Verified responsive flex explore view and GPS fallback tracking system
import { SUPERMARKETS, ATTRACTIONS } from "../data";
import { useLanguage } from "../lib/i18n";

interface ExploreViewProps {
  currentCountry: Country;
  homeCountry: Country;
  onNavigate: (screen: any) => void;
  countriesList: Country[];
  onAddDynamicCountry: (guide: CountryGuide) => void;
  countryGuides: Record<string, CountryGuide>;
  onChangeDestination: (countryCode: string) => void;
  onOpenCountrySelector?: () => void;
}

export default function ExploreView({ 
  currentCountry, 
  homeCountry, 
  onNavigate,
  countriesList,
  onAddDynamicCountry,
  countryGuides,
  onChangeDestination,
  onOpenCountrySelector
}: ExploreViewProps) {
  const { t, language } = useLanguage();
  const isAr = language === "ar";

  const [exploreTab, setExploreTab] = useState<"stores" | "landmarks" | "guide">("stores");
  const [activeSupermarket, setActiveSupermarket] = useState<any | null>(null);
  const [activeAttraction, setActiveAttraction] = useState<any | null>(null);
  const [showMap, setShowMap] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");

  const [gpsStatus, setGpsStatus] = useState<"idle" | "searching" | "success" | "failed">("idle");
  const [gpsError, setGpsError] = useState("");

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setGpsStatus("failed");
      setGpsError(isAr ? "نظام تحديد المواقع غير مدعوم في هذا المتصفح." : "GPS/Geolocation is not supported by your browser.");
      return;
    }

    setGpsStatus("searching");
    setGpsError("");

    const targets = [
      { code: "JP", lat: 35.6762, lng: 139.6503 },
      { code: "US", lat: 37.0902, lng: -95.7129 },
      { code: "IT", lat: 41.9028, lng: 12.4964 },
      { code: "FR", lat: 48.8566, lng: 2.3522 },
      { code: "TH", lat: 13.7563, lng: 100.5018 },
      { code: "MX", lat: 19.4326, lng: -99.1332 },
    ];

    const successCallback = (position: any) => {
      const { latitude, longitude } = position.coords;
      setGpsStatus("success");
      
      let matchedCode = "JP";
      let minDistance = Infinity;
      for (const target of targets) {
        const dy = latitude - target.lat;
        const dx = longitude - target.lng;
        const dist = Math.sqrt(dy * dy + dx * dx);
        if (dist < minDistance) {
          minDistance = dist;
          matchedCode = target.code;
        }
      }

      onChangeDestination(matchedCode);
    };

    const gpsOptionsHigh = { timeout: 4000, enableHighAccuracy: true, maximumAge: 10000 };
    const gpsOptionsLow = { timeout: 8000, enableHighAccuracy: false, maximumAge: 60000 };

    navigator.geolocation.getCurrentPosition(
      successCallback,
      (error) => {
        console.warn("GPS High Accuracy failed, retrying with cellular/wifi standard accuracy...", error);
        navigator.geolocation.getCurrentPosition(
          successCallback,
          (secondError) => {
            console.error("All GPS attempts failed:", secondError);
            setGpsStatus("failed");
            setGpsError(
              isAr 
                ? "تعذر الاتصال بـ GPS. يرجى تفعيل الموقع أو تحديد الوجهة يدويًا." 
                : "GPS satellite connection unavailable. Enable location access or select manually."
            );
          },
          gpsOptionsLow
        );
      },
      gpsOptionsHigh
    );
  };

  const activeGuide: CountryGuide | undefined = countryGuides[currentCountry.code];

  // If a guide is loaded, use its landmarks/stores. Otherwise fall back to static data.
  const countrySupermarkets = activeGuide?.supermarkets 
    ? activeGuide.supermarkets 
    : SUPERMARKETS.filter(s => s.countryCode === currentCountry.code);

  const countryAttractions = activeGuide?.landmarks 
    ? activeGuide.landmarks.map(l => ({
        id: l.id,
        name: l.name,
        countryCode: currentCountry.code,
        category: l.category,
        ticketPriceLocal: l.ticketPriceLocal,
        tips: l.tips,
        description: l.description,
        hours: l.hours,
        imagePrompt: ""
      }))
    : ATTRACTIONS.filter(a => a.countryCode === currentCountry.code);

  // Auto-fetch guide for current country if not loaded
  useEffect(() => {
    if (currentCountry && !countryGuides[currentCountry.code]) {
      fetchCountryGuide(currentCountry.name);
    }
  }, [currentCountry]);

  // Auto-detect location on first screen mount
  useEffect(() => {
    const alreadyDetected = sessionStorage.getItem("nomi_gps_auto_detected") === "true";
    if (!alreadyDetected) {
      handleDetectLocation();
      sessionStorage.setItem("nomi_gps_auto_detected", "true");
    }
  }, []);

  const fetchCountryGuide = async (name: string) => {
    setIsSearching(true);
    setSearchError("");
    try {
      const response = await fetch("/api/country-guide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ countryName: name, userLanguage: language })
      });
      if (!response.ok) {
        throw new Error("Failed to generate country guide");
      }
      const data: CountryGuide = await response.json();
      onAddDynamicCountry(data);
    } catch (err: any) {
      console.error(err);
      setSearchError(isAr ? "عذرًا، لم نتمكن من توليد دليل هذا البلد." : "Sorry, we couldn't generate the guide for this country.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchCountry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchError("");

    // Check if country exists in existing countriesList
    const queryLower = searchQuery.toLowerCase().trim();
    const existing = countriesList.find(
      c => c.name.toLowerCase() === queryLower || 
           (c.nameAr && c.nameAr.toLowerCase() === queryLower) ||
           c.code.toLowerCase() === queryLower
    );

    if (existing) {
      onChangeDestination(existing.code);
      setSearchQuery("");
      setIsSearching(false);
      return;
    }

    // Otherwise, generate a guide for the new country
    try {
      const response = await fetch("/api/country-guide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ countryName: searchQuery, userLanguage: language })
      });
      if (!response.ok) {
        throw new Error("Failed to search country");
      }
      const guideData: CountryGuide = await response.json();
      
      // Add dynamic country
      onAddDynamicCountry(guideData);
      
      // Update destination selection
      onChangeDestination(guideData.code);
      
      setSearchQuery("");
    } catch (err: any) {
      console.error(err);
      setSearchError(
        isAr 
          ? "لم نتمكن من العثور على هذا البلد أو توليد دليل ذكي له. يرجى محاولة كتابة الاسم بشكل صحيح." 
          : "Could not find this country or generate an AI guide for it. Please make sure spelling is correct."
      );
    } finally {
      setIsSearching(false);
    }
  };

  const getTicketPriceConverted = (localPrice: number) => {
    if (localPrice === 0) return isAr ? "دخول مجاني" : "Free Admission";
    const rateToUSD = currentCountry.exchangeRateToUSD;
    const priceInUSD = localPrice / rateToUSD;
    const converted = priceInUSD * homeCountry.exchangeRateToUSD;
    return `${currentCountry.currencySymbol}${localPrice} (${homeCountry.currencySymbol}${converted.toFixed(2)} ${homeCountry.currency})`;
  };

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar p-4 flex flex-col space-y-4 h-full pb-28 bg-slate-50 animate-fade-in" id="explore-view-container">
      
      {/* Dynamic Global Country Search */}
      <form onSubmit={handleSearchCountry} className="bg-white p-3 rounded-3xl border border-slate-100 shadow-sm space-y-2">
        <div className="text-left">
          <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
            {isAr ? "استكشف أي بلد في العالم" : "Explore Any Country in the World"}
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isAr ? "ابحث باللغة العربية أو الإنجليزية (مثال: البرازيل، مصر)..." : "Search in English or Arabic (e.g., Brazil, Egypt)..."}
                className={`w-full bg-slate-50 border border-slate-200 rounded-2xl py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500 shadow-inner ${isAr ? "pr-3 pl-10 text-right" : "pl-10 pr-4 text-left"}`}
              />
            </div>
            <button 
              type="submit"
              disabled={isSearching}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold text-xs px-4 py-2.5 rounded-2xl transition-all shadow-md flex items-center gap-1.5 shrink-0"
            >
              {isSearching ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Globe className="w-4 h-4" />
              )}
              <span>{isAr ? "بحث ذكي" : "AI Search"}</span>
            </button>
          </div>
        </div>

        {isSearching && (
          <div className="p-3 bg-blue-50 border border-blue-100 rounded-2xl flex items-center gap-3 text-left">
            <RefreshCw className="w-5 h-5 text-blue-600 animate-spin shrink-0" />
            <div className="text-xs">
              <p className="font-bold text-blue-900">{isAr ? "جارٍ توليد الدليل الذكي وتحديث الأسعار..." : "Generating AI guide & calibrating local prices..."}</p>
              <p className="text-slate-500 text-[10px]">{isAr ? "يستغرق هذا ثوانٍ معدودة عبر Gemini 3.5..." : "This takes a few seconds via Gemini 3.5..."}</p>
            </div>
          </div>
        )}

        {searchError && (
          <p className="text-[11px] text-red-600 font-medium px-1 text-left">{searchError}</p>
        )}
      </form>

      {/* Segmented Controller Tab Selector */}
      <div className="bg-white p-1 rounded-2xl border border-slate-100 shadow-sm grid grid-cols-3">
        <button
          onClick={() => {
            setExploreTab("stores");
            setActiveAttraction(null);
          }}
          className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            exploreTab === "stores" 
              ? "bg-blue-600 text-white shadow-sm" 
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <Store className="w-4 h-4" />
          {t("explore.tab_stores")}
        </button>

        <button
          onClick={() => {
            setExploreTab("landmarks");
            setActiveSupermarket(null);
          }}
          className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            exploreTab === "landmarks" 
              ? "bg-blue-600 text-white shadow-sm" 
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <Landmark className="w-4 h-4" />
          {t("explore.tab_landmarks")}
        </button>

        <button
          onClick={() => {
            setExploreTab("guide");
            setActiveSupermarket(null);
            setActiveAttraction(null);
          }}
          className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            exploreTab === "guide" 
              ? "bg-blue-600 text-white shadow-sm" 
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <Globe className="w-4 h-4" />
          {isAr ? "دليل البلد" : "Country Guide"}
        </button>
      </div>

      {/* Interactive Map View Card */}
      {exploreTab !== "guide" && (
        <div className="bg-white border border-slate-100 rounded-3xl p-4 shadow-sm space-y-3" id="interactive-map-card">
          <div className={`flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 ${isAr ? "text-right" : "text-left"}`}>
            <div className="space-y-1">
              <div className={`flex items-center gap-2 ${isAr ? "flex-row-reverse" : "flex-row"}`}>
                <span className={`text-[8px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                  gpsStatus === "searching" 
                    ? "bg-amber-100 text-amber-700 animate-pulse" 
                    : gpsStatus === "success" 
                      ? "bg-emerald-100 text-emerald-700" 
                      : gpsStatus === "failed" 
                        ? "bg-red-100 text-red-700" 
                        : "bg-blue-100 text-blue-700"
                }`}>
                  {gpsStatus === "searching" 
                    ? (isAr ? "جاري البحث..." : "GPS SEARCHING...") 
                    : gpsStatus === "success" 
                      ? (isAr ? "تم الاتصال" : "GPS CONNECTED") 
                      : gpsStatus === "failed" 
                        ? (isAr ? "فشل الاتصال" : "GPS OFFLINE") 
                        : (isAr ? "نشط" : "GPS READY")}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {currentCountry.flag} {language === "ar" ? (currentCountry.nameAr || currentCountry.name) : currentCountry.name}
                </span>
              </div>
              <p className="text-xs font-bold text-slate-800">{t("explore.radar_map")}</p>
            </div>

            <div className={`flex items-center gap-1.5 ${isAr ? "flex-row-reverse" : "flex-row"}`}>
              <button
                onClick={handleDetectLocation}
                disabled={gpsStatus === "searching"}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl text-[10px] font-black transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
              >
                <Navigation className={`w-3.5 h-3.5 ${gpsStatus === "searching" ? "animate-spin" : "transform rotate-45"}`} />
                <span>{isAr ? "تحديد موقعي التلقائي" : "Auto Detect Location"}</span>
              </button>

              <button
                onClick={() => setShowMap(!showMap)}
                className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl text-[10px] font-bold transition-all flex items-center gap-1 border border-slate-200"
              >
                <Map className="w-3.5 h-3.5" />
                {showMap ? t("explore.hide_map") : t("explore.show_map")}
              </button>
            </div>
          </div>

          {/* GPS Progress / Status Feedback */}
          {gpsStatus === "searching" && (
            <div className="p-3 bg-amber-50/50 border border-amber-100/30 rounded-2xl flex items-center gap-3 animate-pulse">
              <RefreshCw className="w-4 h-4 text-amber-600 animate-spin shrink-0" />
              <div className="text-[11px] text-left">
                <p className="font-bold text-amber-900">{isAr ? "جاري البحث عن الأقمار الصناعية لـ GPS..." : "Pinging GPS satellites & localizing region..."}</p>
                <p className="text-slate-500 text-[9px]">{isAr ? "يرجى السماح بالوصول إلى الموقع عند طلب المتصفح." : "Please allow location access when prompted by your browser."}</p>
              </div>
            </div>
          )}

          {gpsStatus === "success" && (
            <div className="p-3 bg-emerald-50/50 border border-emerald-100/30 rounded-2xl flex items-center gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <div className="text-[11px] text-left">
                <p className="font-bold text-emerald-900">{isAr ? "تم قفل موقع GPS بنجاح!" : "Satellite location acquired successfully!"}</p>
                <p className="text-slate-500 text-[9px]">
                  {isAr 
                    ? `تم ضبط وجهتك النشطة إلى ${currentCountry.flag} ${currentCountry.nameAr || currentCountry.name}`
                    : `Active destination calibrated to ${currentCountry.flag} ${currentCountry.name}.`}
                </p>
              </div>
            </div>
          )}

          {gpsStatus === "failed" && (
            <div className="p-3 bg-red-50/50 border border-red-100/30 rounded-2xl space-y-2">
              <div className="flex items-start gap-2.5">
                <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div className="text-[11px] text-left flex-1">
                  <p className="font-bold text-red-900">{isAr ? "فشل تحديد الموقع التلقائي" : "GPS Satellite Location Failed"}</p>
                  <p className="text-red-700/80 leading-normal text-[10px]">{gpsError}</p>
                </div>
              </div>

              {onOpenCountrySelector && (
                <button
                  onClick={onOpenCountrySelector}
                  className="w-full py-2 bg-white hover:bg-slate-50 border border-red-200 hover:border-red-300 text-red-700 font-extrabold text-[10px] rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
                >
                  <Globe className="w-3.5 h-3.5 text-red-500" />
                  <span>{isAr ? "استعن بالاختيار اليدوي للبلد" : "Pick Destination Country Manually"}</span>
                </button>
              )}
            </div>
          )}

          {showMap && (
            <div className="aspect-video bg-slate-950 rounded-2xl relative flex items-center justify-center overflow-hidden border border-slate-800 shadow-inner">
              {/* Mock Grid */}
              <div className="absolute inset-0 opacity-10 pointer-events-none">
                <div className="absolute top-1/4 left-0 w-full h-0.5 bg-blue-500"></div>
                <div className="absolute top-3/4 left-0 w-full h-0.5 bg-blue-500"></div>
                <div className="absolute top-0 left-1/3 w-0.5 h-full bg-blue-500"></div>
                <div className="absolute top-0 left-2/3 w-0.5 h-full bg-blue-500"></div>
                <div className="absolute top-1/3 left-1/4 w-32 h-32 rounded-full border border-blue-500 animate-pulse"></div>
              </div>

              {/* Radar glowing ring */}
              <div className="absolute w-20 h-20 rounded-full bg-blue-500/10 border border-blue-500/30 animate-ping"></div>

              {/* Traveler locator */}
              <div className="relative z-10 bg-blue-600 p-2 rounded-full text-white shadow-lg animate-bounce shadow-blue-900/50">
                <Navigation className="w-4 h-4 transform rotate-45" />
              </div>

              {/* Render Pins */}
              {exploreTab === "stores" 
                ? countrySupermarkets.map((sm: any, idx: number) => (
                    <div
                      key={sm.id || idx}
                      style={{ 
                        top: `${20 + ((idx % 3) * 25)}%`, 
                        left: `${15 + ((idx % 2) * 50)}%` 
                      }}
                      className="absolute z-10 flex flex-col items-center cursor-pointer scale-95 hover:scale-110 transition-all"
                      onClick={() => setActiveSupermarket(sm)}
                    >
                      <div className={`p-1.5 rounded-full text-white shadow ${
                        activeSupermarket?.id === sm.id ? "bg-blue-600 animate-pulse" : "bg-emerald-600"
                      }`}>
                        <Store className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-[8px] font-bold bg-white border border-slate-100 text-slate-800 px-1 py-0.2 rounded mt-1 shadow whitespace-nowrap font-mono">
                        {sm.name} ({(idx + 1) * 0.4}{isAr ? " كم" : "km"})
                      </span>
                    </div>
                  ))
                : countryAttractions.map((att: any, idx: number) => (
                    <div
                      key={att.id || idx}
                      style={{ 
                        top: `${15 + ((idx % 3) * 30)}%`, 
                        left: `${20 + ((idx % 2) * 50)}%` 
                      }}
                      className="absolute z-10 flex flex-col items-center cursor-pointer scale-95 hover:scale-110 transition-all"
                      onClick={() => setActiveAttraction(att)}
                    >
                      <div className={`p-1.5 rounded-full text-white shadow ${
                        activeAttraction?.id === att.id ? "bg-blue-600 animate-pulse" : "bg-amber-500"
                      }`}>
                        <Landmark className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-[8px] font-bold bg-white border border-slate-100 text-slate-800 px-1 py-0.2 rounded mt-1 shadow whitespace-nowrap font-mono">
                        {att.name} ({(idx + 1) * 0.6}{isAr ? " كم" : "km"})
                      </span>
                    </div>
                  ))
              }
            </div>
          )}
        </div>
      )}

      {/* Main Interactive Tab Content */}
      <div className="space-y-3">
        {exploreTab === "stores" && (
          countrySupermarkets.length === 0 ? (
            <div className="text-center py-10 bg-white border border-slate-100 rounded-3xl text-slate-400">
              <Store className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs">{t("explore.no_stores")}</p>
            </div>
          ) : (
            countrySupermarkets.map((sm: any, idx: number) => {
              const isExpanded = activeSupermarket?.id === sm.id;
              return (
                <div 
                  key={sm.id || idx}
                  className={`border rounded-3xl overflow-hidden transition-all duration-300 ${
                    isExpanded 
                      ? "bg-white border-blue-200 shadow-sm" 
                      : "bg-white border-slate-100 hover:border-blue-100 shadow-sm"
                  }`}
                >
                  <button
                    onClick={() => setActiveSupermarket(isExpanded ? null : sm)}
                    className="w-full text-left p-4 flex justify-between items-start gap-4 focus:outline-none"
                  >
                    <div className="space-y-1 flex-1 text-left">
                      <div className={`flex items-center gap-2 ${isAr ? "flex-row-reverse" : "flex-row"}`}>
                        <span className="text-[9px] bg-emerald-50 text-emerald-600 border border-emerald-100 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-0.5">
                          <CheckCircle2 className="w-3 h-3" />
                          {t("explore.trust_score", { score: sm.trustScore })}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {t("explore.prices")} <strong className="text-blue-600 font-bold">{sm.priceTier}</strong>
                        </span>
                      </div>
                      <h3 className="text-sm font-display font-bold text-slate-800 mt-1">{sm.name}</h3>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {sm.hours}
                      </p>
                    </div>

                    <ChevronRight className={`w-5 h-5 text-slate-400 transform transition-transform duration-200 shrink-0 ${isExpanded ? "rotate-95 text-blue-600" : ""} ${isAr ? "transform rotate-180" : ""}`} />
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-4 border-t border-slate-100 pt-3.5 space-y-3.5 animate-in fade-in duration-200 text-left">
                      <div className="space-y-1">
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">{t("explore.local_overview")}</span>
                        <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-2xl border border-slate-100 text-left">
                          {sm.description}
                        </p>
                      </div>

                      <div className="space-y-1.5">
                        <span className="text-[9px] text-blue-600 font-bold uppercase tracking-wider flex items-center gap-1 justify-start">
                          <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                          {t("explore.specialties")}
                        </span>
                        <p className="text-xs text-blue-900 leading-relaxed bg-blue-50/50 p-3 rounded-2xl border border-blue-100/30 font-medium text-left">
                          {sm.specialty}
                        </p>
                      </div>

                      {sm.reviews && sm.reviews.length > 0 && (
                        <div className="space-y-2">
                          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">{t("explore.reviews")}</span>
                          <div className="flex flex-col gap-2">
                            {sm.reviews.map((rev: any, rIdx: number) => (
                              <div key={rIdx} className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-[11px] space-y-1 text-left">
                                <div className={`flex justify-between items-center ${isAr ? "flex-row-reverse" : "flex-row"}`}>
                                  <span className="font-bold text-slate-700">{rev.author}</span>
                                  <div className="flex gap-0.5 text-amber-400">
                                    {Array.from({ length: rev.rating || 5 }).map((_, sIdx) => (
                                      <Star key={sIdx} className="w-3 h-3 fill-amber-400" />
                                    ))}
                                  </div>
                                </div>
                                <p className="text-slate-500 leading-relaxed italic text-left">"{rev.text}"</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )
        )}

        {exploreTab === "landmarks" && (
          countryAttractions.length === 0 ? (
            <div className="text-center py-10 bg-white border border-slate-100 rounded-3xl text-slate-400">
              <Compass className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs">{t("explore.no_landmarks")}</p>
            </div>
          ) : (
            countryAttractions.map((att: any, idx: number) => {
              const isExpanded = activeAttraction?.id === att.id;
              return (
                <div 
                  key={att.id || idx}
                  className={`border rounded-3xl overflow-hidden transition-all duration-300 ${
                    isExpanded 
                      ? "bg-white border-blue-200 shadow-sm" 
                      : "bg-white border-slate-100 hover:border-blue-100 shadow-sm"
                  }`}
                >
                  <button
                    onClick={() => setActiveAttraction(isExpanded ? null : att)}
                    className="w-full text-left p-4 flex justify-between items-start gap-4 focus:outline-none"
                  >
                    <div className="space-y-1 flex-1 text-left">
                      <div className={`flex items-center gap-2 ${isAr ? "flex-row-reverse" : "flex-row"}`}>
                        <span className="text-[9px] bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1">
                          <Landmark className="w-3 h-3 text-blue-500" />
                          {att.category}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono flex items-center gap-0.5">
                          <Ticket className="w-3.5 h-3.5 text-slate-400" />
                          {att.ticketPriceLocal === 0 ? (isAr ? "مجاني" : "Free") : `${currentCountry.currencySymbol}${att.ticketPriceLocal}`}
                        </span>
                      </div>
                      <h3 className="text-sm font-display font-bold text-slate-800 mt-1">{att.name}</h3>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {t("explore.hours_label")} {att.hours}
                      </p>
                    </div>

                    <ChevronRight className={`w-5 h-5 text-slate-400 transform transition-transform duration-200 shrink-0 ${isExpanded ? "rotate-95 text-blue-600" : ""} ${isAr ? "transform rotate-180" : ""}`} />
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-4 border-t border-slate-100 pt-3.5 space-y-3.5 animate-in fade-in duration-200 text-left">
                      <div className="space-y-1">
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">{t("explore.overview")}</span>
                        <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-2xl border border-slate-100 text-left">
                          {att.description}
                        </p>
                      </div>

                      <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between text-left">
                        <div className="space-y-0.5 text-left">
                          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">{t("explore.converted_ticket")}</span>
                          <p className="text-xs font-bold text-slate-800 text-left">
                            {getTicketPriceConverted(att.ticketPriceLocal)}
                          </p>
                        </div>
                        <Ticket className="w-5 h-5 text-slate-400 shrink-0" />
                      </div>

                      {att.tips && att.tips.length > 0 && (
                        <div className="space-y-2 text-left">
                          <span className="text-[9px] text-red-500 font-bold uppercase tracking-wider flex items-center gap-1 justify-start">
                            <ShieldAlert className="w-4 h-4 text-red-600" />
                            {t("explore.scam_tips")}
                          </span>
                          <div className="flex flex-col gap-2">
                            {att.tips.map((tip: string, tIdx: number) => (
                              <div 
                                key={tIdx} 
                                className={`bg-red-50/50 border-red-500 p-3 rounded-2xl text-[11px] text-slate-600 flex gap-2 ${isAr ? "border-r-2 text-right flex-row-reverse" : "border-l-2 text-left"}`}
                              >
                                <div className="text-xs shrink-0 font-bold text-red-500">0{tIdx + 1}</div>
                                <span className="leading-relaxed text-left">{tip}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )
        )}

        {exploreTab === "guide" && (
          !activeGuide ? (
            <div className="text-center py-10 bg-white border border-slate-100 rounded-3xl text-slate-400">
              <Globe className="w-8 h-8 text-blue-500 mx-auto mb-2 animate-bounce" />
              <p className="text-xs font-bold text-slate-600 mb-1">
                {isAr ? "تحميل دليل السفر الذكي لـ " : "Loading AI Travel Guide for "} {isAr && currentCountry.nameAr ? currentCountry.nameAr : currentCountry.name}...
              </p>
              <p className="text-[10px] text-slate-400">{isAr ? "سيقوم Gemini بإنشاء دليل مخصص كامل الآن!" : "Gemini is generating a complete bespoke guide now!"}</p>
            </div>
          ) : (
            <div className="space-y-4 animate-fade-in text-left">
              
              {/* Vibe and Cultural Advisories Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                
                {/* Cultural Manners Card */}
                <div className="bg-white border border-slate-100 rounded-3xl p-4 shadow-sm space-y-2">
                  <span className="text-[9px] bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider inline-flex items-center gap-1">
                    <Smile className="w-3.5 h-3.5 text-indigo-600" />
                    {isAr ? "الثقافة والآداب" : "Culture & Manners"}
                  </span>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    {activeGuide.vibe.localVibe}
                  </p>
                </div>

                {/* Practical Info Bento Box */}
                <div className="bg-white border border-slate-100 rounded-3xl p-4 shadow-sm space-y-3">
                  <span className="text-[9px] bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider inline-flex items-center gap-1">
                    <Info className="w-3.5 h-3.5 text-slate-600" />
                    {isAr ? "تفاصيل عملية" : "Practical Logistics"}
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100/50">
                      <span className="text-slate-400 block text-[9px] uppercase font-bold">{isAr ? "مياه الصنبور" : "Tap Water"}</span>
                      <p className="font-bold text-slate-800 mt-0.5">{activeGuide.vibe.tapWater}</p>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100/50">
                      <span className="text-slate-400 block text-[9px] uppercase font-bold">{isAr ? "الإكراميات" : "Tipping"}</span>
                      <p className="font-bold text-slate-800 mt-0.5">{activeGuide.vibe.tipping}</p>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100/50">
                      <span className="text-slate-400 block text-[9px] uppercase font-bold">{isAr ? "الدفع بالبطاقة" : "Card vs Cash"}</span>
                      <p className="font-bold text-slate-800 mt-0.5">{activeGuide.vibe.cardPayment}</p>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100/50">
                      <span className="text-slate-400 block text-[9px] uppercase font-bold">{isAr ? "النظافة" : "Hygiene"}</span>
                      <p className="font-bold text-slate-800 mt-0.5">{activeGuide.vibe.hygiene}</p>
                    </div>
                  </div>
                </div>

              </div>

              {/* Climate and Season Weather Bento panel */}
              <div className="bg-white border border-slate-100 rounded-3xl p-4 shadow-sm space-y-3">
                <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <CloudSun className="w-4 h-4 text-amber-500" />
                  {isAr ? "المناخ وأفضل مواسم الزيارة" : "Climate & Best Times to Visit"}
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
                  <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
                    <span className="text-indigo-600 font-bold block mb-0.5">{isAr ? "الربيع 🌸" : "Spring 🌸"}</span>
                    <p className="text-slate-500 leading-snug">{activeGuide.weatherInfo.spring}</p>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
                    <span className="text-red-600 font-bold block mb-0.5">{isAr ? "الصيف ☀️" : "Summer ☀️"}</span>
                    <p className="text-slate-500 leading-snug">{activeGuide.weatherInfo.summer}</p>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
                    <span className="text-amber-600 font-bold block mb-0.5">{isAr ? "الخريف 🍁" : "Autumn 🍁"}</span>
                    <p className="text-slate-500 leading-snug">{activeGuide.weatherInfo.autumn}</p>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
                    <span className="text-blue-600 font-bold block mb-0.5">{isAr ? "الشتاء ❄️" : "Winter ❄️"}</span>
                    <p className="text-slate-500 leading-snug">{activeGuide.weatherInfo.winter}</p>
                  </div>
                </div>
              </div>

              {/* Visa and Entry Guidelines */}
              <div className="bg-blue-50/50 border border-blue-100/50 rounded-3xl p-4 flex gap-3">
                <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <p className="font-bold text-blue-900">{isAr ? "متطلبات الدخول والتأشيرة" : "Visa & Entry Advisory"}</p>
                  <p className="text-slate-600 leading-relaxed text-[11px]">{activeGuide.visaInfo}</p>
                </div>
              </div>

              {/* Local Travel Phrasebook */}
              <div className="bg-white border border-slate-100 rounded-3xl p-4 shadow-sm space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Languages className="w-4 h-4 text-emerald-600" />
                    {isAr ? "القاموس السياحي الذكي" : "Local Travel Phrasebook"}
                  </h4>
                  <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-lg font-bold text-slate-600">
                    {activeGuide.languageName}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {activeGuide.commonWords.map((word, idx) => (
                    <div key={idx} className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex justify-between items-center text-xs gap-3">
                      <div className="text-left">
                        <p className="font-mono font-bold text-blue-600 text-[13px]">{word.word}</p>
                        <p className="text-[10px] text-slate-400 italic">“{word.pronunciation}”</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-slate-800">{word.meaning}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Local Logistics Directories: Airports, Hotels, Restaurants, Transportation */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider block mt-2 px-1">
                  {isAr ? "الدليل الخدمي المحلي" : "Local Services Directory"}
                </h4>

                {/* Transportation */}
                <div className="bg-white border border-slate-100 rounded-3xl p-4 shadow-sm space-y-3">
                  <h5 className="text-xs font-bold text-slate-800 flex items-center gap-1">
                    <Navigation className="w-4 h-4 text-blue-500" />
                    {isAr ? "المواصلات العامة وكيفية التنقل" : "Public Transit & Transport"}
                  </h5>
                  <div className="flex flex-col gap-2">
                    {activeGuide.transports.map((t, idx) => (
                      <div key={idx} className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-xs space-y-1">
                        <div className="flex justify-between items-center">
                          <strong className="text-slate-800">{t.type}</strong>
                          <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-mono font-bold">{t.cost}</span>
                        </div>
                        <p className="text-slate-500 leading-relaxed text-[11px]">{t.description}</p>
                        {t.tips && <p className="text-blue-700 text-[10px] font-medium">💡 {t.tips}</p>}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Restaurants */}
                <div className="bg-white border border-slate-100 rounded-3xl p-4 shadow-sm space-y-3">
                  <h5 className="text-xs font-bold text-slate-800 flex items-center gap-1">
                    <Utensils className="w-4 h-4 text-orange-500" />
                    {isAr ? "المطاعم وتجارب التذوق المحلية" : "Recommended Dining & Cuisine"}
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {activeGuide.restaurants.map((r, idx) => (
                      <div key={idx} className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-xs space-y-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <strong className="text-slate-800 block text-[13px]">{r.name}</strong>
                            <span className="text-[10px] text-slate-400">{r.cuisine}</span>
                          </div>
                          <span className="text-[10px] font-bold text-blue-600">{r.priceTier}</span>
                        </div>
                        <p className="text-slate-500 text-[11px] leading-relaxed">{r.description}</p>
                        <p className="text-emerald-700 text-[10px] font-medium bg-emerald-50 p-1.5 rounded-xl inline-block">⭐ {isAr ? "الطبق المقترح" : "Specialty"}: {r.specialty}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Hotels */}
                <div className="bg-white border border-slate-100 rounded-3xl p-4 shadow-sm space-y-3">
                  <h5 className="text-xs font-bold text-slate-800 flex items-center gap-1">
                    <Hotel className="w-4 h-4 text-indigo-500" />
                    {isAr ? "الفنادق وأماكن الإقامة الموصى بها" : "Recommended Stays & Hotels"}
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {activeGuide.hotels.map((h, idx) => (
                      <div key={idx} className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-xs space-y-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <strong className="text-slate-800 block text-[13px]">{h.name}</strong>
                            <div className="flex gap-0.5 text-amber-400 mt-0.5">
                              {Array.from({ length: h.stars }).map((_, sIdx) => (
                                <Star key={sIdx} className="w-3 h-3 fill-amber-400" />
                              ))}
                            </div>
                          </div>
                          <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-bold">{h.priceTier}</span>
                        </div>
                        <p className="text-slate-500 text-[11px] leading-relaxed">{h.description}</p>
                        {h.tips && <p className="text-slate-600 text-[10px] italic">💡 {h.tips}</p>}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Airports */}
                <div className="bg-white border border-slate-100 rounded-3xl p-4 shadow-sm space-y-3">
                  <h5 className="text-xs font-bold text-slate-800 flex items-center gap-1">
                    <Plane className="w-4 h-4 text-emerald-500" />
                    {isAr ? "المطارات وبوابات الدخول" : "Airports & Portals"}
                  </h5>
                  <div className="flex flex-col gap-2">
                    {activeGuide.airports.map((ap, idx) => (
                      <div key={idx} className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-xs flex justify-between items-start gap-3">
                        <div className="space-y-0.5">
                          <strong className="text-slate-800 block">{ap.name} ({ap.city})</strong>
                          <p className="text-slate-500 text-[11px] leading-relaxed">{ap.description}</p>
                        </div>
                        <span className="bg-slate-200 text-slate-700 font-mono font-bold text-xs px-2.5 py-1 rounded-xl uppercase tracking-wider shrink-0">
                          {ap.code}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Emergency Numbers Card */}
              <div className="bg-red-50 border border-red-100 rounded-3xl p-4 space-y-3">
                <h4 className="text-xs font-bold text-red-800 flex items-center gap-1.5">
                  <PhoneCall className="w-4 h-4 text-red-600 animate-pulse" />
                  {isAr ? "خطوط الطوارئ والاتصال السريع" : "Emergency Speed Dial Numbers"}
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                  <div className="bg-white p-2.5 rounded-2xl border border-red-100">
                    <span className="text-slate-400 block text-[9px] uppercase font-bold">{isAr ? "الشرطة" : "Police"}</span>
                    <a href={`tel:${activeGuide.emergencyNumbers.police}`} className="font-mono font-bold text-red-600 text-sm">{activeGuide.emergencyNumbers.police}</a>
                  </div>
                  <div className="bg-white p-2.5 rounded-2xl border border-red-100">
                    <span className="text-slate-400 block text-[9px] uppercase font-bold">{isAr ? "الإسعاف" : "Ambulance"}</span>
                    <a href={`tel:${activeGuide.emergencyNumbers.ambulance}`} className="font-mono font-bold text-red-600 text-sm">{activeGuide.emergencyNumbers.ambulance}</a>
                  </div>
                  <div className="bg-white p-2.5 rounded-2xl border border-red-100">
                    <span className="text-slate-400 block text-[9px] uppercase font-bold">{isAr ? "الإطفاء" : "Fire"}</span>
                    <a href={`tel:${activeGuide.emergencyNumbers.fire}`} className="font-mono font-bold text-red-600 text-sm">{activeGuide.emergencyNumbers.fire}</a>
                  </div>
                  <div className="bg-white p-2.5 rounded-2xl border border-red-100">
                    <span className="text-slate-400 block text-[9px] uppercase font-bold">{isAr ? "العام" : "General"}</span>
                    <a href={`tel:${activeGuide.emergencyNumbers.general}`} className="font-mono font-bold text-red-600 text-sm">{activeGuide.emergencyNumbers.general}</a>
                  </div>
                </div>
              </div>

            </div>
          )
        )}
      </div>

      {/* Advisory Bottom Card */}
      <div className="bg-blue-50/40 border border-blue-100/20 p-4 rounded-3xl flex gap-3.5 text-left">
        <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1 text-left">
          <p className="font-bold text-blue-900">{t("explore.protocol_title")}</p>
          <p className="text-slate-500 leading-relaxed text-[11px] text-left">
            {t("explore.protocol_desc")}
          </p>
        </div>
      </div>

    </div>
  );
}
