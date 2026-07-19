import React, { useState, useEffect } from "react";
import { 
  Compass, Store, Landmark, Map, MapPin, ShieldAlert, Star, Clock, 
  Sparkles, CheckCircle2, Ticket, ChevronRight, Navigation, Info,
  Globe, Search, Plane, Hotel, Utensils, CloudSun, Languages, 
  PhoneCall, ShieldCheck, RefreshCw, Smile, CreditCard, Activity, Train, Landmark as LandmarkIcon, Heart, Shield
} from "lucide-react";
import { Country, CountryGuide } from "../types";
import { SUPERMARKETS, ATTRACTIONS } from "../data";
import { useLanguage } from "../lib/i18n";
import { getCountryPOIs, POI } from "../lib/poiManager";

interface ExploreViewProps {
  currentCountry: Country;
  homeCountry: Country;
  onNavigate: (screen: any) => void;
  countriesList: Country[];
  onAddDynamicCountry: (guide: CountryGuide) => void;
  countryGuides: Record<string, CountryGuide>;
  onChangeDestination: (countryCode: string) => void;
  onOpenCountrySelector?: () => void;
  mapNavigationPOI?: any | null;
  setMapNavigationPOI?: (poi: any | null) => void;
  mapFilterOverride?: string | null;
  setMapFilterOverride?: (filter: string | null) => void;
}

export default function ExploreView({ 
  currentCountry, 
  homeCountry, 
  onNavigate,
  countriesList,
  onAddDynamicCountry,
  countryGuides,
  onChangeDestination,
  onOpenCountrySelector,
  mapNavigationPOI,
  setMapNavigationPOI,
  mapFilterOverride,
  setMapFilterOverride
}: ExploreViewProps) {
  const { t, language } = useLanguage();
  const isAr = language === "ar";

  const [exploreTab, setExploreTab] = useState<"stores" | "landmarks" | "guide">("stores");
  const [activeSupermarket, setActiveSupermarket] = useState<any | null>(null);
  const [activeAttraction, setActiveAttraction] = useState<any | null>(null);
  const [showMap, setShowMap] = useState(true);
  const [mapCategory, setMapCategory] = useState<string>("landmarks");
  const [activePOI, setActivePOI] = useState<POI | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [navigationStep, setNavigationStep] = useState(0);

  // Synchronize chatbot commands to active map selection
  useEffect(() => {
    if (mapFilterOverride) {
      setMapCategory(mapFilterOverride);
    }
    if (mapNavigationPOI) {
      setActivePOI(mapNavigationPOI);
      setIsNavigating(true); // Auto-start live navigation!
      setNavigationStep(0);
    }
  }, [mapFilterOverride, mapNavigationPOI]);

  // Simulate active driving directions progress in-app
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isNavigating) {
      interval = setInterval(() => {
        setNavigationStep((prev) => (prev < 2 ? prev + 1 : 2));
      }, 5000);
    } else {
      setNavigationStep(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isNavigating]);
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
        console.warn("GPS High Accuracy failed, trying standard cellular/wifi accuracy...", error);
        navigator.geolocation.getCurrentPosition(
          successCallback,
          (secondError) => {
            console.error("GPS detection failed:", secondError);
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

  // Load appropriate lists
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

  // Load guide if missing
  useEffect(() => {
    if (currentCountry && !countryGuides[currentCountry.code]) {
      fetchCountryGuide(currentCountry.name);
    }
  }, [currentCountry]);

  // Request GPS automatically once per session
  useEffect(() => {
    const detectedKey = "nomi_gps_auto_detected";
    const alreadyDetected = sessionStorage.getItem(detectedKey) === "true";
    if (!alreadyDetected) {
      handleDetectLocation();
      sessionStorage.setItem(detectedKey, "true");
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
      onAddDynamicCountry(guideData);
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
    <div className="flex-1 w-full max-w-lg mx-auto flex flex-col space-y-4 bg-slate-50 text-slate-900 pb-20 px-1" id="explore-view-container">
      
      {/* 1. Global AI Country Search */}
      <form onSubmit={handleSearchCountry} className="bg-white p-3.5 rounded-3xl border border-slate-200/85 shadow-sm space-y-2 shrink-0">
        <div className="text-left">
          <label className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block mb-1">
            {isAr ? "استكشف أي بلد في العالم" : "Explore Any Country in the World"}
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isAr ? "ابحث باللغة العربية أو الإنجليزية..." : "Search in English or Arabic (e.g., Brazil, Egypt)..."}
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
              <span>{isAr ? "بحث" : "Search"}</span>
            </button>
          </div>
        </div>

        {isSearching && (
          <div className="p-3 bg-blue-50 border border-blue-100 rounded-2xl flex items-center gap-3 text-left">
            <RefreshCw className="w-5 h-5 text-blue-600 animate-spin shrink-0" />
            <div className="text-xs">
              <p className="font-bold text-blue-900">{isAr ? "جارٍ توليد الدليل الذكي وتحديث الأسعار..." : "Generating AI guide & calibrating local prices..."}</p>
              <p className="text-slate-500 text-[10px]">{isAr ? "يستغرق هذا ثوانٍ معدودة عبر Gemini..." : "This takes a few seconds via Gemini..."}</p>
            </div>
          </div>
        )}

        {searchError && (
          <p className="text-[11px] text-red-600 font-bold px-1 text-left">{searchError}</p>
        )}
      </form>

      {/* 2. Segmented Controller Tab Selector (Material 3 style) */}
      <div className="bg-white p-1 rounded-2xl border border-slate-200/85 shadow-sm grid grid-cols-3 shrink-0">
        <button
          onClick={() => {
            setExploreTab("stores");
            setActiveAttraction(null);
          }}
          className={`py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
            exploreTab === "stores" 
              ? "bg-blue-600 text-white shadow-sm" 
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <Store className="w-4 h-4" />
          <span>{t("explore.tab_stores")}</span>
        </button>

        <button
          onClick={() => {
            setExploreTab("landmarks");
            setActiveSupermarket(null);
          }}
          className={`py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
            exploreTab === "landmarks" 
              ? "bg-blue-600 text-white shadow-sm" 
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <Landmark className="w-4 h-4" />
          <span>{t("explore.tab_landmarks")}</span>
        </button>

        <button
          onClick={() => {
            setExploreTab("guide");
            setActiveSupermarket(null);
            setActiveAttraction(null);
          }}
          className={`py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
            exploreTab === "guide" 
              ? "bg-blue-600 text-white shadow-sm" 
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>{isAr ? "دليل البلد" : "Country Guide"}</span>
        </button>
      </div>

      {/* 3. Interactive Radar Locator Card */}
      {exploreTab !== "guide" && (
        <div className="bg-white border border-slate-200/85 rounded-3xl p-4 shadow-sm space-y-3 shrink-0" id="interactive-map-card">
          <div className={`flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 ${isAr ? "text-right" : "text-left"}`}>
            <div className="space-y-1">
              <div className={`flex items-center gap-2 ${isAr ? "flex-row-reverse" : "flex-row"}`}>
                <span className={`text-[8px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider ${
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
                <span className="text-[10px] text-slate-400 font-mono font-bold">
                  {currentCountry.flag} {language === "ar" ? (currentCountry.nameAr || currentCountry.name) : currentCountry.name}
                </span>
              </div>
              <p className="text-xs font-bold text-slate-800">{t("explore.radar_map")}</p>
            </div>

            <div className={`flex items-center gap-1.5 ${isAr ? "flex-row-reverse" : "flex-row"}`}>
              <button
                onClick={handleDetectLocation}
                disabled={gpsStatus === "searching"}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-450 text-white rounded-xl text-[10px] font-black transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
              >
                <Navigation className={`w-3.5 h-3.5 ${gpsStatus === "searching" ? "animate-spin" : "transform rotate-45"}`} />
                <span>{isAr ? "تحديث الموقع" : "Auto Detect Location"}</span>
              </button>

              <button
                onClick={() => setShowMap(!showMap)}
                className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl text-[10px] font-bold transition-all flex items-center gap-1 border border-slate-200"
              >
                <Map className="w-3.5 h-3.5" />
                <span>{showMap ? t("explore.hide_map") : t("explore.show_map")}</span>
              </button>
            </div>
          </div>

          {/* GPS Feedback Messages */}
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
                  <span>{isAr ? "اختر البلد يدويًا" : "Pick Destination Country Manually"}</span>
                </button>
              )}
            </div>
          )}

          {showMap && (() => {
            const MAP_CATEGORIES = [
              { id: "landmarks", labelAr: "أماكن سياحية", labelEn: "Tourist Spots", icon: <Landmark className="w-3.5 h-3.5" />, color: "bg-amber-500" },
              { id: "stores", labelAr: "سوبرماركت", labelEn: "Supermarkets", icon: <Store className="w-3.5 h-3.5" />, color: "bg-emerald-600" },
              { id: "restaurants", labelAr: "مطاعم", labelEn: "Restaurants", icon: <Utensils className="w-3.5 h-3.5" />, color: "bg-orange-500" },
              { id: "hospitals", labelAr: "مستشفيات", labelEn: "Hospitals", icon: <Activity className="w-3.5 h-3.5" />, color: "bg-rose-500" },
              { id: "transit", labelAr: "مواصلات", labelEn: "Transit Hubs", icon: <Train className="w-3.5 h-3.5" />, color: "bg-blue-500" },
              { id: "atms", labelAr: "صراف آلي ATM", labelEn: "ATMs", icon: <CreditCard className="w-3.5 h-3.5" />, color: "bg-teal-500" },
              { id: "malls", labelAr: "مولات", labelEn: "Shopping Malls", icon: <Compass className="w-3.5 h-3.5" />, color: "bg-purple-500" },
              { id: "hotels", labelAr: "فنادق", labelEn: "Hotels", icon: <Hotel className="w-3.5 h-3.5" />, color: "bg-indigo-500" }
            ];

            const activePOIs = getCountryPOIs(currentCountry.code, mapCategory, isAr);
            const selectedCat = MAP_CATEGORIES.find(c => c.id === mapCategory) || MAP_CATEGORIES[0];

            return (
              <div className="space-y-3" id="professional-map-container">
                {/* Horizontal scrollable Category Filters bar */}
                <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1 pt-0.5">
                  {MAP_CATEGORIES.map((cat) => {
                    const isSelected = mapCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => {
                          setMapCategory(cat.id);
                          setActivePOI(null);
                        }}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold transition-all shrink-0 border ${
                          isSelected 
                            ? `${cat.color} border-transparent text-white shadow-md shadow-slate-100 scale-95` 
                            : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600"
                        }`}
                      >
                        {cat.icon}
                        <span>{isAr ? cat.labelAr : cat.labelEn}</span>
                      </button>
                    );
                  })}
                </div>


                 {/* Interactive Live Google Maps Embedded Engine */}
                 <div className="aspect-[16/10] sm:aspect-video bg-slate-950 rounded-3xl relative overflow-hidden border border-slate-800/80 shadow-2xl flex items-center justify-center">
                   
                   {/* Google Maps Real Iframe Embed */}
                   <iframe
                     title="Real Interactive Google Map"
                     src={`https://maps.google.com/maps?q=${encodeURIComponent(
                       activePOI 
                         ? `${activePOI.name}, ${currentCountry.name}` 
                         : `${currentCountry.name}`
                     )}&t=&z=${activePOI ? 16 : 11}&ie=UTF8&iwloc=&output=embed`}
                     className="absolute inset-0 w-full h-full border-0 rounded-3xl filter saturate-[0.95]"
                     allowFullScreen={false}
                     loading="lazy"
                     referrerPolicy="no-referrer"
                   ></iframe>

                   {/* Custom Floating POI Markers Layer Over the Live Map */}
                   <div className="absolute inset-0 pointer-events-none z-10">
                     {activePOIs.map((poi: POI) => {
                       const isSelected = activePOI?.id === poi.id;
                       return (
                         <button
                           key={poi.id}
                           style={{ 
                             top: `${poi.latPercent}%`, 
                             left: `${poi.lngPercent}%` 
                           }}
                           className="absolute pointer-events-auto z-10 flex flex-col items-center transform -translate-x-1/2 -translate-y-1/2 scale-90 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                           onClick={() => {
                             setActivePOI(poi);
                             setIsNavigating(false); // Reset to view mode first
                           }}
                         >
                           <div className={`p-2 rounded-full text-white shadow-xl border-2 border-white/80 transition-all ${
                             isSelected ? "bg-blue-600 scale-115 ring-4 ring-blue-500/35 animate-bounce" : selectedCat.color
                           }`}>
                             {selectedCat.icon}
                           </div>
                           <span className={`text-[7px] font-extrabold px-1.5 py-0.5 rounded shadow-lg border mt-1 whitespace-nowrap transition-all ${
                             isSelected 
                               ? "bg-blue-600 border-blue-500 text-white" 
                               : "bg-slate-950/95 border-slate-800 text-slate-100"
                           }`}>
                             {poi.name}
                           </span>
                         </button>
                       );
                     })}
                   </div>

                   {/* Live Turn-by-Turn GPS HUD Navigation Dashboard (Overlaid when Active) */}
                   {isNavigating && activePOI && (
                     <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[1.5px] z-20 p-3.5 flex flex-col justify-between pointer-events-none">
                       
                       {/* Top Driving Instruction Banner */}
                       <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-3 shadow-2xl pointer-events-auto animate-bounce-in flex items-center gap-3">
                         <div className="p-3 bg-blue-600 text-white rounded-xl">
                           <Navigation className="w-5 h-5 transform rotate-45 animate-pulse" />
                         </div>
                         <div className="text-left flex-1" style={{ direction: isAr ? "rtl" : "ltr" }}>
                           <p className="text-[9px] text-blue-400 font-extrabold uppercase tracking-widest">
                             {isAr ? "الملاحة الحية النشطة" : "LIVE GPS GUIDANCE"}
                           </p>
                           <p className="text-xs font-black text-slate-100 mt-0.5">
                             {navigationStep === 0 && (isAr ? `بعد 150م، انعطف يميناً نحو ${activePOI.name}` : `In 150m, turn right towards ${activePOI.name}`)}
                             {navigationStep === 1 && (isAr ? "بعد 300م، خذ المخرج الثاني في الدوار" : "In 300m, take the 2nd roundabout exit")}
                             {navigationStep === 2 && (isAr ? `لقد وصلت إلى وجهتك: ${activePOI.name}` : `Arrived! Your destination is on the right: ${activePOI.name}`)}
                           </p>
                         </div>
                       </div>

                       {/* Route Line Simulation Indicator */}
                       <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                         <div className="w-[180px] h-[180px] rounded-full border-[3px] border-blue-500/20 border-t-blue-500 animate-spin" style={{ animationDuration: "10s" }}></div>
                       </div>

                       {/* Bottom Route Progress Stats and Controls */}
                       <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-3 shadow-2xl pointer-events-auto flex items-center justify-between gap-3">
                         <div className="flex items-center gap-2.5">
                           <div className="text-center bg-slate-950/60 border border-slate-850 px-2.5 py-1 rounded-xl">
                             <p className="text-[7.5px] text-slate-500 font-extrabold">{isAr ? "السرعة" : "SPEED"}</p>
                             <p className="text-[11px] font-black font-mono text-emerald-400">
                               {navigationStep === 2 ? "0" : "36"} <span className="text-[7.5px] opacity-75">km/h</span>
                             </p>
                           </div>
                           <div className="text-left" style={{ direction: isAr ? "rtl" : "ltr" }}>
                             <p className="text-[8px] text-slate-400 font-bold">
                               {isAr ? "المسافة المتبقية" : "DISTANCE REMAINING"}
                             </p>
                             <p className="text-[11px] font-black text-slate-200">
                               {navigationStep === 0 && "1.8 km"}
                               {navigationStep === 1 && "600 m"}
                               {navigationStep === 2 && (isAr ? "وصلت!" : "Arrived!")}
                             </p>
                           </div>
                         </div>

                         {/* Terminate Navigation Button */}
                         <button
                           onClick={(e) => {
                             e.stopPropagation();
                             setIsNavigating(false);
                             setMapNavigationPOI?.(null);
                             setMapFilterOverride?.(null);
                           }}
                           className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 active:scale-95 text-white text-[10px] font-black rounded-xl transition-all shadow-lg"
                         >
                           {isAr ? "إنهاء الملاحة" : "Stop GPS"}
                         </button>
                       </div>
                     </div>
                   )}

                   {/* Base Coordinates Banner */}
                   {!isNavigating && (
                     <div className="absolute top-2 right-2 z-10 bg-slate-900/95 backdrop-blur border border-slate-800 rounded-lg px-2 py-1 text-[8px] font-bold text-blue-400 font-mono flex items-center gap-1">
                       <Navigation className="w-2.5 h-2.5 animate-pulse" />
                       <span>N 35.676° E 139.650°</span>
                     </div>
                   )}

                 </div>

                 {/* POI Info Drawer Sheet */}
                 {activePOI && (
                   <div className="bg-white border border-slate-200/80 rounded-3xl p-4 space-y-3.5 animate-fade-in relative shadow-xl">
                     {/* Top title bar with close */}
                     <div className="flex items-start justify-between">
                       <div className="space-y-0.5 text-left">
                         <span className={`inline-block text-[8px] font-black text-white px-2.5 py-0.5 rounded-full ${selectedCat.color} uppercase tracking-wider`}>
                           {isAr ? selectedCat.labelAr : selectedCat.labelEn}
                         </span>
                         <h4 className="text-sm font-black text-slate-900">{activePOI.name}</h4>
                       </div>
                       <button 
                         onClick={() => {
                           setActivePOI(null);
                           setIsNavigating(false);
                           setMapNavigationPOI?.(null);
                         }}
                         className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
                       >
                         <span className="text-[16px] font-black leading-none block">×</span>
                       </button>
                     </div>

                     {/* Quick Specs */}
                     <div className="grid grid-cols-2 gap-3 text-[10px] text-slate-600">
                       <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-2xl border border-slate-100/50">
                         <Navigation className="w-4 h-4 text-blue-500 shrink-0" />
                         <div className="text-left">
                           <p className="text-[7.5px] font-extrabold text-slate-400 uppercase tracking-tight">{isAr ? "المسافة" : "DISTANCE"}</p>
                           <p className="font-extrabold text-slate-800">{activePOI.dist}</p>
                         </div>
                       </div>

                       <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-2xl border border-slate-100/50">
                         <Star className="w-4 h-4 text-amber-500 fill-amber-500 shrink-0" />
                         <div className="text-left">
                           <p className="text-[7.5px] font-extrabold text-slate-400 uppercase tracking-tight">{isAr ? "التقييم" : "RATING"}</p>
                           <p className="font-extrabold text-slate-800">{activePOI.rating} / 5.0</p>
                         </div>
                       </div>
                     </div>

                     <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100/50 text-[10.5px] leading-relaxed text-slate-600 text-left">
                       <p className="font-black text-slate-800 mb-0.5">{isAr ? "حول المكان:" : "About:"}</p>
                       <p className="text-slate-600 text-[10px] font-medium leading-relaxed">{activePOI.desc}</p>
                     </div>

                     {/* Safety audit */}
                     <div className="bg-blue-500/5 border border-blue-100 p-3 rounded-2xl flex items-start gap-2.5 text-left">
                       <ShieldCheck className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                       <div className="text-[9.5px] text-blue-900 leading-normal">
                         <p className="font-black">{isAr ? "التحقق الأمني الذكي" : "Smart Safety Audit"}</p>
                         <p className="text-blue-800/85 font-medium mt-0.5">{activePOI.safety}</p>
                       </div>
                     </div>

                     {/* Action buttons (Direct In-App Simulated Navigation Guidance) */}
                     <div className="flex gap-2 pt-1">
                       <button 
                         onClick={() => {
                           setIsNavigating(true);
                           setNavigationStep(0);
                         }}
                         className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-[11px] rounded-2xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                       >
                         <Navigation className="w-3.5 h-3.5 transform rotate-45 text-white animate-pulse" />
                         <span>{isAr ? "بدء الملاحة الحية داخل التطبيق" : "Start Live Guidance"}</span>
                       </button>
                     </div>
                   </div>
                 )}
              </div>
            );
          })()}
        </div>
      )}

      {/* 4. Main Tab Rendering Area */}
      <div className="space-y-3 flex-1 overflow-y-auto no-scrollbar">
        
        {/* TAB 1: Stores */}
        {exploreTab === "stores" && (
          countrySupermarkets.length === 0 ? (
            <div className="text-center py-10 bg-white border border-slate-200/85 rounded-3xl text-slate-400">
              <Store className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-semibold">{t("explore.no_stores")}</p>
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
                      : "bg-white border-slate-200/60 hover:border-blue-100 shadow-sm"
                  }`}
                >
                  <button
                    onClick={() => setActiveSupermarket(isExpanded ? null : sm)}
                    className="w-full text-left p-4 flex justify-between items-start gap-4 focus:outline-none"
                  >
                    <div className="space-y-1 flex-1 text-left">
                      <div className={`flex items-center gap-2 ${isAr ? "flex-row-reverse" : "flex-row"}`}>
                        <span className="text-[9px] bg-emerald-50 text-emerald-600 border border-emerald-100 px-2 py-0.5 rounded-full font-black uppercase tracking-wider flex items-center gap-0.5">
                          <CheckCircle2 className="w-3 h-3" />
                          {t("explore.trust_score", { score: sm.trustScore })}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono font-bold">
                          {t("explore.prices")} <strong className="text-blue-600 font-extrabold">{sm.priceTier}</strong>
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-800 mt-1">{sm.name}</h3>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1 font-medium">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{sm.hours}</span>
                      </p>
                    </div>

                    <ChevronRight className={`w-5 h-5 text-slate-400 transform transition-transform duration-200 shrink-0 ${isExpanded ? "rotate-90 text-blue-600" : ""} ${isAr ? "rotate-180" : ""}`} />
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-4 border-t border-slate-100 pt-3.5 space-y-3.5 text-left animate-fade-in">
                      <div className="space-y-1">
                        <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block">{t("explore.local_overview")}</span>
                        <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-2xl border border-slate-100">
                          {sm.description}
                        </p>
                      </div>

                      <div className="space-y-1.5">
                        <span className="text-[9px] text-blue-600 font-extrabold uppercase tracking-wider flex items-center gap-1 justify-start">
                          <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                          <span>{t("explore.specialties")}</span>
                        </span>
                        <p className="text-xs text-blue-900 leading-relaxed bg-blue-50/50 p-3 rounded-2xl border border-blue-100/30 font-bold">
                          {sm.specialty}
                        </p>
                      </div>

                      {sm.reviews && sm.reviews.length > 0 && (
                        <div className="space-y-2">
                          <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block">{t("explore.reviews")}</span>
                          <div className="flex flex-col gap-2">
                            {sm.reviews.map((rev: any, rIdx: number) => (
                              <div key={rIdx} className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-[11px] space-y-1">
                                <div className={`flex justify-between items-center ${isAr ? "flex-row-reverse" : "flex-row"}`}>
                                  <span className="font-bold text-slate-700">{rev.author}</span>
                                  <div className="flex gap-0.5 text-amber-400">
                                    {Array.from({ length: rev.rating || 5 }).map((_, sIdx) => (
                                      <Star key={sIdx} className="w-3 h-3 fill-amber-400" />
                                    ))}
                                  </div>
                                </div>
                                <p className="text-slate-500 leading-relaxed italic">"{rev.text}"</p>
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

        {/* TAB 2: Landmarks */}
        {exploreTab === "landmarks" && (
          countryAttractions.length === 0 ? (
            <div className="text-center py-10 bg-white border border-slate-200/85 rounded-3xl text-slate-400">
              <Compass className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-semibold">{t("explore.no_landmarks")}</p>
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
                      : "bg-white border-slate-200/60 hover:border-blue-100 shadow-sm"
                  }`}
                >
                  <button
                    onClick={() => setActiveAttraction(isExpanded ? null : att)}
                    className="w-full text-left p-4 flex justify-between items-start gap-4 focus:outline-none"
                  >
                    <div className="space-y-1 flex-1 text-left">
                      <div className={`flex items-center gap-2 ${isAr ? "flex-row-reverse" : "flex-row"}`}>
                        <span className="text-[9px] bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded-full font-black uppercase tracking-wider flex items-center gap-1">
                          <Landmark className="w-3 h-3 text-blue-500" />
                          <span>{att.category}</span>
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono font-bold flex items-center gap-0.5">
                          <Ticket className="w-3.5 h-3.5 text-slate-400" />
                          <span>{att.ticketPriceLocal === 0 ? (isAr ? "مجاني" : "Free") : `${currentCountry.currencySymbol}${att.ticketPriceLocal}`}</span>
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-800 mt-1">{att.name}</h3>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1 font-medium">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{t("explore.hours_label")} {att.hours}</span>
                      </p>
                    </div>

                    <ChevronRight className={`w-5 h-5 text-slate-400 transform transition-transform duration-200 shrink-0 ${isExpanded ? "rotate-90 text-blue-600" : ""} ${isAr ? "rotate-180" : ""}`} />
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-4 border-t border-slate-100 pt-3.5 space-y-3.5 text-left animate-fade-in">
                      <div className="space-y-1">
                        <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block">{t("explore.overview")}</span>
                        <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-2xl border border-slate-100">
                          {att.description}
                        </p>
                      </div>

                      <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between text-left">
                        <div className="space-y-0.5">
                          <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block">{t("explore.converted_ticket")}</span>
                          <p className="text-xs font-bold text-slate-800">
                            {getTicketPriceConverted(att.ticketPriceLocal)}
                          </p>
                        </div>
                        <Ticket className="w-5 h-5 text-slate-400 shrink-0" />
                      </div>

                      {att.tips && att.tips.length > 0 && (
                        <div className="space-y-2">
                          <span className="text-[9px] text-red-500 font-extrabold uppercase tracking-wider flex items-center gap-1 justify-start">
                            <ShieldAlert className="w-4 h-4 text-red-600" />
                            <span>{t("explore.scam_tips")}</span>
                          </span>
                          <div className="flex flex-col gap-2">
                            {att.tips.map((tip: string, tIdx: number) => (
                              <div 
                                key={tIdx} 
                                className={`bg-red-50/50 border-red-500 p-3 rounded-2xl text-[11px] text-slate-600 flex gap-2 ${isAr ? "border-r-2 text-right flex-row-reverse" : "border-l-2 text-left"}`}
                              >
                                <div className="text-xs shrink-0 font-bold text-red-500">0{tIdx + 1}</div>
                                <span className="leading-relaxed">{tip}</span>
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

        {/* TAB 3: Country Guide (Gemini Dynamic Bento layout) */}
        {exploreTab === "guide" && (
          !activeGuide ? (
            <div className="text-center py-12 bg-white border border-slate-200/85 rounded-3xl text-slate-400">
              <Globe className="w-8 h-8 text-blue-500 mx-auto mb-2 animate-bounce" />
              <p className="text-xs font-black text-slate-600 mb-1">
                {isAr ? "تحميل دليل السفر الذكي لـ " : "Loading AI Travel Guide for "} {isAr && currentCountry.nameAr ? currentCountry.nameAr : currentCountry.name}...
              </p>
              <p className="text-[10px] text-slate-400 font-medium">{isAr ? "يقوم الذكاء الاصطناعي ببناء دليل مخصص الآن..." : "AI is crafting a bespoke guide for you..."}</p>
            </div>
          ) : (
            <div className="space-y-4 animate-fade-in text-left">
              
              {/* Culture and manners card */}
              <div className="bg-white border border-slate-200/85 rounded-3xl p-4 shadow-sm space-y-2">
                <span className="text-[9px] bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full font-black uppercase tracking-wider inline-flex items-center gap-1">
                  <Smile className="w-3.5 h-3.5 text-indigo-600" />
                  <span>{isAr ? "الثقافة والآداب العامة" : "Culture & Manners"}</span>
                </span>
                <p className="text-xs text-slate-600 leading-relaxed font-bold">
                  {activeGuide.vibe.localVibe}
                </p>
              </div>

              {/* Bento Practical logistics list */}
              <div className="bg-white border border-slate-200/85 rounded-3xl p-4 shadow-sm space-y-3">
                <span className="text-[9px] bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full font-black uppercase tracking-wider inline-flex items-center gap-1">
                  <Info className="w-3.5 h-3.5 text-slate-600" />
                  <span>{isAr ? "معلومات هامة وعملية" : "Practical Logistics"}</span>
                </span>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100/50">
                    <span className="text-slate-400 block text-[9px] uppercase font-bold">{isAr ? "مياه الصنبور" : "Tap Water"}</span>
                    <p className="font-extrabold text-slate-800 mt-0.5">{activeGuide.vibe.tapWater}</p>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100/50">
                    <span className="text-slate-400 block text-[9px] uppercase font-bold">{isAr ? "الإكراميات" : "Tipping"}</span>
                    <p className="font-extrabold text-slate-800 mt-0.5">{activeGuide.vibe.tipping}</p>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100/50">
                    <span className="text-slate-400 block text-[9px] uppercase font-bold">{isAr ? "الدفع بالبطاقة" : "Card vs Cash"}</span>
                    <p className="font-extrabold text-slate-800 mt-0.5">{activeGuide.vibe.cardPayment}</p>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100/50">
                    <span className="text-slate-400 block text-[9px] uppercase font-bold">{isAr ? "مستوى النظافة" : "Hygiene"}</span>
                    <p className="font-extrabold text-slate-800 mt-0.5">{activeGuide.vibe.hygiene}</p>
                  </div>
                </div>
              </div>

              {/* Climate seasonal details */}
              <div className="bg-white border border-slate-200/85 rounded-3xl p-4 shadow-sm space-y-3">
                <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <CloudSun className="w-4 h-4 text-amber-500" />
                  <span>{isAr ? "المناخ وأفضل مواسم الزيارة" : "Climate & Best Times to Visit"}</span>
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

              {/* Visa details */}
              <div className="bg-blue-50/50 border border-blue-100/50 rounded-3xl p-4 flex gap-3">
                <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <p className="font-bold text-blue-900">{isAr ? "متطلبات الدخول والتأشيرة" : "Visa & Entry Advisory"}</p>
                  <p className="text-slate-600 leading-relaxed text-[11px] font-medium">{activeGuide.visaInfo}</p>
                </div>
              </div>

              {/* Language phrasebook */}
              <div className="bg-white border border-slate-200/85 rounded-3xl p-4 shadow-sm space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Languages className="w-4 h-4 text-emerald-600" />
                    <span>{isAr ? "القاموس السياحي الذكي" : "Local Travel Phrasebook"}</span>
                  </h4>
                  <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-lg font-bold text-slate-600 font-mono">
                    {activeGuide.languageName}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {activeGuide.commonWords.map((word, idx) => (
                    <div key={idx} className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex justify-between items-center text-xs gap-3">
                      <div className="text-left">
                        <p className="font-mono font-bold text-blue-600 text-[13px]">{word.word}</p>
                        <p className="text-[10px] text-slate-400 italic font-medium">“{word.pronunciation}”</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-slate-800">{word.meaning}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Logistics sections */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider block mt-2 px-1">
                  {isAr ? "الدليل الخدمي المحلي" : "Local Services Directory"}
                </h4>

                {/* Transportation */}
                <div className="bg-white border border-slate-200/85 rounded-3xl p-4 shadow-sm space-y-3">
                  <h5 className="text-xs font-bold text-slate-800 flex items-center gap-1">
                    <Navigation className="w-4 h-4 text-blue-500" />
                    <span>{isAr ? "المواصلات العامة وكيفية التنقل" : "Public Transit & Transport"}</span>
                  </h5>
                  <div className="flex flex-col gap-2">
                    {activeGuide.transports.map((t, idx) => (
                      <div key={idx} className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-xs space-y-1">
                        <div className="flex justify-between items-center">
                          <strong className="text-slate-800">{t.type}</strong>
                          <span className="text-[10px] bg-blue-100 text-blue-750 px-2 py-0.5 rounded font-mono font-bold">{t.cost}</span>
                        </div>
                        <p className="text-slate-500 leading-relaxed text-[11px] font-medium">{t.description}</p>
                        {t.tips && <p className="text-blue-700 text-[10px] font-bold">💡 {t.tips}</p>}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Restaurants */}
                <div className="bg-white border border-slate-200/85 rounded-3xl p-4 shadow-sm space-y-3">
                  <h5 className="text-xs font-bold text-slate-800 flex items-center gap-1">
                    <Utensils className="w-4 h-4 text-orange-500" />
                    <span>{isAr ? "المطاعم وتجارب التذوق المحلية" : "Recommended Dining & Cuisine"}</span>
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {activeGuide.restaurants.map((r, idx) => (
                      <div key={idx} className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-xs space-y-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <strong className="text-slate-800 block text-[13px]">{r.name}</strong>
                            <span className="text-[10px] text-slate-400 font-semibold">{r.cuisine}</span>
                          </div>
                          <span className="text-[10px] font-bold text-blue-600 font-mono">{r.priceTier}</span>
                        </div>
                        <p className="text-slate-500 text-[11px] leading-relaxed font-medium">{r.description}</p>
                        <p className="text-emerald-700 text-[10px] font-bold bg-emerald-50 p-1.5 rounded-xl inline-block">⭐ {isAr ? "الطبق المقترح" : "Specialty"}: {r.specialty}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Hotels */}
                <div className="bg-white border border-slate-200/85 rounded-3xl p-4 shadow-sm space-y-3">
                  <h5 className="text-xs font-bold text-slate-800 flex items-center gap-1">
                    <Hotel className="w-4 h-4 text-indigo-500" />
                    <span>{isAr ? "الفنادق وأماكن الإقامة الموصى بها" : "Recommended Stays & Hotels"}</span>
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
                          <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-bold font-mono">{h.priceTier}</span>
                        </div>
                        <p className="text-slate-500 text-[11px] leading-relaxed font-medium">{h.description}</p>
                        {h.tips && <p className="text-slate-600 text-[10px] italic">💡 {h.tips}</p>}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Airports */}
                <div className="bg-white border border-slate-200/85 rounded-3xl p-4 shadow-sm space-y-3">
                  <h5 className="text-xs font-bold text-slate-800 flex items-center gap-1">
                    <Plane className="w-4 h-4 text-emerald-500" />
                    <span>{isAr ? "المطارات وبوابات الدخول" : "Airports & Portals"}</span>
                  </h5>
                  <div className="flex flex-col gap-2">
                    {activeGuide.airports.map((ap, idx) => (
                      <div key={idx} className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-xs flex justify-between items-start gap-3">
                        <div className="space-y-0.5 text-left">
                          <strong className="text-slate-800 block">{ap.name} ({ap.city})</strong>
                          <p className="text-slate-500 text-[11px] leading-relaxed font-medium">{ap.description}</p>
                        </div>
                        <span className="bg-slate-200 text-slate-700 font-mono font-bold text-xs px-2.5 py-1 rounded-xl uppercase tracking-wider shrink-0">
                          {ap.code}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Emergency Speed Dial Bento box */}
              <div className="bg-red-50 border border-red-150 rounded-3xl p-4 space-y-3">
                <h4 className="text-xs font-bold text-red-800 flex items-center gap-1.5">
                  <PhoneCall className="w-4 h-4 text-red-600 animate-pulse" />
                  <span>{isAr ? "خطوط الطوارئ والاتصال السريع" : "Emergency Speed Dial Numbers"}</span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                  <div className="bg-white p-2.5 rounded-2xl border border-red-100">
                    <span className="text-slate-400 block text-[9px] uppercase font-bold">{isAr ? "الشرطة" : "Police"}</span>
                    <a href={`tel:${activeGuide.emergencyNumbers.police}`} className="font-mono font-bold text-red-600 text-sm hover:underline">{activeGuide.emergencyNumbers.police}</a>
                  </div>
                  <div className="bg-white p-2.5 rounded-2xl border border-red-100">
                    <span className="text-slate-400 block text-[9px] uppercase font-bold">{isAr ? "الإسعاف" : "Ambulance"}</span>
                    <a href={`tel:${activeGuide.emergencyNumbers.ambulance}`} className="font-mono font-bold text-red-600 text-sm hover:underline">{activeGuide.emergencyNumbers.ambulance}</a>
                  </div>
                  <div className="bg-white p-2.5 rounded-2xl border border-red-100">
                    <span className="text-slate-400 block text-[9px] uppercase font-bold">{isAr ? "الإطفاء" : "Fire"}</span>
                    <a href={`tel:${activeGuide.emergencyNumbers.fire}`} className="font-mono font-bold text-red-600 text-sm hover:underline">{activeGuide.emergencyNumbers.fire}</a>
                  </div>
                  <div className="bg-white p-2.5 rounded-2xl border border-red-100">
                    <span className="text-slate-400 block text-[9px] uppercase font-bold">{isAr ? "العام" : "General"}</span>
                    <a href={`tel:${activeGuide.emergencyNumbers.general}`} className="font-mono font-bold text-red-600 text-sm hover:underline">{activeGuide.emergencyNumbers.general}</a>
                  </div>
                </div>
              </div>

            </div>
          )
        )}
      </div>

      {/* 5. Safe Travel Protocol footer */}
      <div className="bg-blue-50/45 border border-blue-100/30 p-4 rounded-3xl flex gap-3 text-left shrink-0">
        <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1 text-left">
          <p className="font-bold text-blue-900">{t("explore.protocol_title")}</p>
          <p className="text-slate-500 leading-relaxed text-[11px] font-medium text-left">
            {t("explore.protocol_desc")}
          </p>
        </div>
      </div>

    </div>
  );
}
