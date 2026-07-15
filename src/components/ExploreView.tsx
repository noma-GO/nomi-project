import React, { useState } from "react";
import { 
  Compass, Store, Landmark, Map, MapPin, ShieldAlert, Star, Clock, 
  Sparkles, CheckCircle2, Ticket, ChevronRight, Navigation, Info 
} from "lucide-react";
import { Country, Supermarket, Attraction } from "../types";
import { SUPERMARKETS, ATTRACTIONS } from "../data";
import { useLanguage } from "../lib/i18n";

interface ExploreViewProps {
  currentCountry: Country;
  homeCountry: Country;
  onNavigate: (screen: any) => void;
}

export default function ExploreView({ 
  currentCountry, 
  homeCountry, 
  onNavigate 
}: ExploreViewProps) {
  const { t, language } = useLanguage();
  const isAr = language === "ar";

  const [exploreTab, setExploreTab] = useState<"stores" | "landmarks">("stores");
  const [activeSupermarket, setActiveSupermarket] = useState<Supermarket | null>(null);
  const [activeAttraction, setActiveAttraction] = useState<Attraction | null>(null);
  const [showMap, setShowMap] = useState(true);

  const countrySupermarkets = SUPERMARKETS.filter(s => s.countryCode === currentCountry.code);
  const countryAttractions = ATTRACTIONS.filter(a => a.countryCode === currentCountry.code);

  const getTicketPriceConverted = (localPrice: number) => {
    if (localPrice === 0) return isAr ? "دخول مجاني" : "Free Admission";
    const rateToUSD = currentCountry.exchangeRateToUSD;
    const priceInUSD = localPrice / rateToUSD;
    const converted = priceInUSD * homeCountry.exchangeRateToUSD;
    return `${currentCountry.currencySymbol}${localPrice} (${homeCountry.currencySymbol}${converted.toFixed(2)} ${homeCountry.currency})`;
  };

  // Helper translations for static details
  const translateSMName = (name: string) => {
    if (!isAr) return name;
    switch (name) {
      case "Big C Supercenter": return "بيج سي سوبرسنتر";
      case "Tesco Lotus Express": return "تيسكو لوتس إكسبريس";
      case "Seven-Eleven": return "سيفن إلفن";
      case "Carrefour City": return "كارفور سيتي";
      case "Monoprix": return "مونوبري";
      case "Franprix": return "فرانبري";
      case "Life Supermarket": return "لايف سوبرماركت";
      case "Gyomu Super": return "غيومو سوبر";
      case "FamilyMart": return "فاميلي مارت";
      default: return name;
    }
  };

  const translateSMDesc = (desc: string) => {
    if (!isAr) return desc;
    if (desc.includes("hypermarket chain")) return "أكبر سلسلة هايبر ماركت منخفضة التكلفة في تايلاند. ممتازة للمشتريات بالجملة، الوجبات الخفيفة والسلع المنزلية بأسعار محلية حقيقية.";
    if (desc.includes("neighborhood grocery format")) return "بقالة محلية تابعة لتيسكو. رائعة لشراء الضروريات اليومية السريعة والوجبات الخفيفة والمشروبات المبردة بأسعار منضبطة قانونيًا.";
    if (desc.includes("Standardized small format")) return "متجر ملائم صغير يخضع للتسعير الموحد في كل ركن من أركان البلاد. مثالي لشراء المياه والمشروبات والوجبات الخفيفة الدافئة والضروريات في أي وقت.";
    if (desc.includes("High quality but mid-high tier")) return "هايبر ماركت عالي الجودة فرنسي متوسط الفخامة. رائع للمياه، والجبن، والمعجنات المخبوزة طازجاً بأسعار تنافسية.";
    if (desc.includes("Elegant gourmet French")) return "سوبر ماركت فرنسي فاخر وأنيق. يضم مخبزًا رائعًا للمأكولات الطازجة والأجبان المستوردة والوجبات السريعة المتطورة.";
    if (desc.includes("Popular urban neighborhood grocery")) return "بقالة فرنسية شهيرة داخل الأحياء السكنية. جيدة لشراء السلع والمشروبات اليومية السريعة، مع عروض ممتازة في الفترات المسائية.";
    if (desc.includes("Large urban Japanese supermarket")) return "سوبر ماركت ياباني حضري ضخم. يقدم المأكولات الطازجة الفاخرة، والسوشي الجاهز الرائع، وصناديق البنتو، والمخبوزات اللذيذة بأسعار حقيقية.";
    if (desc.includes("Known for wholesale prices")) return "سلسلة يابانية شهيرة بأسعار الجملة المخفضة. جيدة لشراء الوجبات الخفيفة، والصلصات، والتوابل المستوردة، والمشروبات بأسعار رخيصة جداً.";
    if (desc.includes("Convenience format with fresh onigiri")) return "سلسلة متاجر ملائمة يابانية شهيرة بالأونيغيري الطازج، وصناديق البنتو، والمشروبات الساخنة والباردة ذات الجودة العالية.";
    return desc;
  };

  const translateSMSpecialty = (spec: string) => {
    if (!isAr) return spec;
    if (spec.includes("Dried Mango")) return "مانجو مجفف محلي (أرخص بـ 4 مرات من أسواق السياح)، معجون كاري أخضر تايلاندي، ومقرمشات الأرز نوري.";
    if (spec.includes("Ready-to-eat hot bento")) return "صناديق بينتو تايلاندية ساخنة جاهزة للأكل، وجوز هند طازج مبرد، وواقي من الشمس رخيص.";
    if (spec.includes("Salty Egg Lay's")) return "رقائق بطاطس ليز بنكهة البيض المالح (حصرية لتايلاند)، ومشروب حليب بالنعناع، ومطهر بعشب الليمون.";
    if (spec.includes("Freshly baked baguettes")) return "خبز الباجيت الطازج، وجبن بري، ومياه معدنية معبأة ماركة كارفور بأسعار زهيدة.";
    if (spec.includes("Macarons pack")) return "حزمة ماكارون طازجة مخبوزة محليًا، وأجبان معتقة فاخرة، وشوكولاتة داكنة ممتازة.";
    if (spec.includes("Pre-packaged organic salads")) return "سلطات عضوية طازجة معدة مسبقًا، وكرواسون بالزبدة ساخن، وعصائر فواكه محلية مضغوطة.";
    if (spec.includes("Sashimi platters")) return "أطباق ساشيمي طازجة وبنتو السوشي (يتم تخفيضها بنسبة 50٪ بعد الساعة 8 مساءً)، وشاي أخضر ماتشا بارد.";
    if (spec.includes("Green tea kit-kats")) return "بسكويت كيت كات بنكهة الشاي الأخضر بالعبوات العائلية، ومعكرونة الرامين الفورية، وصلصة ياكيتوري.";
    if (spec.includes("Onigiri")) return "أرز أونيغيري طازج بالتونة والمايونيز، وخبز بطعم الحليب، وقهوة بوز مشروب الطاقة الشهير.";
    return spec;
  };

  const translateReviewAuthor = (author: string) => {
    if (!isAr) return author;
    switch(author) {
      case "Sophia L.": return "صوفيا ل.";
      case "Liam K.": return "ليام ك.";
      case "Chloe M.": return "كلوي م.";
      case "Alex P.": return "أليكس ب.";
      case "Hiro S.": return "هيرو س.";
      case "Yuki M.": return "يوكي م.";
      default: return author;
    }
  };

  const translateReviewText = (text: string) => {
    if (!isAr) return text;
    if (text.includes("Always stock up here")) return "أقوم دائمًا بتخزين الوجبات الخفيفة والهدايا التذكارية من هنا قبل المغادرة. الأسعار ربع أسعار المطار تمامًا!";
    if (text.includes("Perfect for budget breakfast")) return "مثالي لوجبات الإفطار الاقتصادية. تتوفر المعجنات المخبوزة في الصباح بأسعار رخيصة للغاية.";
    if (text.includes("Cheap water and toasted toasties")) return "مياه رخيصة وتوست دافئ بالجبن في منتصف الليل! يفتح على مدار الساعة 24/7 وهذا رائع للغاية.";
    if (text.includes("Unbelievable price for real butter")) return "سعر لا يصدق للزبدة الحقيقية والباجيت المقرمش! تخطى المخابز السياحية واشترِ من هنا.";
    if (text.includes("Best place to get high quality lunch")) return "أفضل مكان للحصول على غداء عالي الجودة مثل السوشي الرخيص والساشيمي الطازج. لذيذ ونظيف جدًا!";
    if (text.includes("So cheap to buy spices and ramen")) return "رخيص جدًا لشراء التوابل والرامين والحلويات اليابانية اللذيذة لأخذها كهدية للوطن.";
    return text;
  };

  const translateAttractionName = (name: string) => {
    if (!isAr) return name;
    switch(name) {
      case "Grand Palace": return "القصر الكبير";
      case "Wat Arun (Temple of Dawn)": return "معبد وات آرون (معبد الفجر)";
      case "Eiffel Tower": return "برج إيفل";
      case "Louvre Museum": return "متحف اللوفر";
      case "Senso-ji Temple": return "معبد سينسو-جي";
      case "Tokyo Skytree": return "برج طوكيو سكاي تري";
      default: return name;
    }
  };

  const translateAttractionDesc = (desc: string) => {
    if (!isAr) return desc;
    if (desc.includes("spectacular complex of buildings")) return "مجمع مباني مذهل في قلب بانكوك. المقر الرسمي لملوك سيام منذ عام 1782.";
    if (desc.includes("iconic riverside Buddhist temple")) return "معبد بوذي مبهر على ضفاف النهر، يشتهر ببرجه المركزي المزخرف بالبورسلين الملون.";
    if (desc.includes("The absolute global landmark of France")) return "المعلم العالمي الشهير لفرنسا. يوفر إطلالات بانورامية خلابة للمدينة بأكملها من الأعلى.";
    if (desc.includes("The world's largest art museum")) return "أكبر متحف فني في العالم وموطن للوحة الموناليزا والعديد من الكنوز التاريخية العظيمة.";
    if (desc.includes("Tokyo's oldest and most iconic ancient Buddhist temple")) return "أقدم وأهم معبد بوذي أثري في طوكيو، يقع في منطقة أسكوسا التاريخية النابضة بالحياة.";
    if (desc.includes("The tallest structure in Japan")) return "أطول برج اتصالات وهيكل بنائي في اليابان، ويضم منصات مشاهدة بارتفاع شاهق فوق طوكيو.";
    return desc;
  };

  const translateAttractionTip = (tip: string) => {
    if (!isAr) return tip;
    if (tip.includes("Strict dress code required")) return "يجب الالتزام بزي محتشم. تجنب تماماً المحتالين في الخارج الذين يزعمون كذباً أن القصر 'مغلق اليوم'.";
    if (tip.includes("Buy official standard ticket only inside")) return "اشترِ التذاكر الرسمية المعتمدة فقط من شباك التذاكر بالداخل بسعر 500 بات؛ وتجنب عروض المرشدين غير الرسميين.";
    if (tip.includes("Take the public cross-river ferry")) return "استخدم عبّارة النهر العامة بـ 5 بات فقط للوصول، ولا تستخدم القوارب السياحية الخاصة الباهظة (400 بات).";
    if (tip.includes("Beautiful at sunset")) return "جميل جدًا وقت الغروب. احرص على ارتداء ملابس تغطي الركبتين والأكتاف للدخول.";
    if (tip.includes("Buy tickets weeks in advance online")) return "اشترِ التذاكر الرسمية عبر الإنترنت قبل أسابيع مسبقًا لتجنب طوابير الانتظار التي تمتد لساعات، أو تذاكر السوق السوداء.";
    if (tip.includes("Ignore street sellers offering 'express passes'")) return "تجاهل البائعين الجائلين الذين يعرضون 'تذاكر سريعة'، فهم يبيعون تذاكر وهمية غير صالحة.";
    if (tip.includes("Book timed-entry slots online")) return "احجز فترات الدخول المحددة بالوقت مسبقًا عبر الإنترنت لضمان إمكانية الدخول السريع وتجنب الازدحام.";
    if (tip.includes("The surrounding cafes charge triple rates")) return "المقاهي المحيطة تتقاضى أسعارًا مضاعفة ثلاث مرات؛ سر لمسافة شارعين إضافيين لتجد المطاعم الباريسية المحلية.";
    if (tip.includes("Entrance to the temple temple grounds is 100% free")) return "الدخول إلى ساحات المعبد الخارجي مجاني تمامًا بنسبة 100٪. لا تدفع لأي مرشد يطلب منك رسوم دخول.";
    if (tip.includes("Walk through Nakamise street")) return "امشِ عبر شارع ناكاميسي لشراء الوجبات الخفيفة والحلويات التقليدية المصنوعة محليًا بأسعار عادية ورخيصة.";
    if (tip.includes("Check the weather forecast")) return "تحقق من توقعات الطقس قبل الصعود؛ الأيام الملبدة بالغيوم تحجب الرؤية تمامًا.";
    if (tip.includes("Buy tickets online to skip")) return "اشترِ التذاكر عبر الإنترنت لتجاوز طابور التذاكر المباشر الطويل وتوفير حوالي 200 ين.";
    return tip;
  };

  const translateAttractionCategory = (cat: string) => {
    if (!isAr) return cat;
    switch(cat) {
      case "Royal Palace": return "قصر ملكي";
      case "Historic Temple": return "معبد تاريخي";
      case "Monument": return "معلم أثري";
      case "Art Museum": return "متحف فني";
      default: return cat;
    }
  };

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar p-4 flex flex-col space-y-4 h-full pb-28 bg-slate-50 animate-fade-in" id="explore-view-container">
      
      {/* Segmented Controller Tab Selector */}
      <div className="bg-white p-1 rounded-2xl border border-slate-100 shadow-sm grid grid-cols-2">
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
          <Compass className="w-4 h-4" />
          {t("explore.tab_landmarks")}
        </button>
      </div>

      {/* Interactive Map View Card (High fidelity vector mockup) */}
      <div className="bg-white border border-slate-100 rounded-3xl p-4 shadow-sm space-y-3">
        <div className={`flex justify-between items-center ${isAr ? "flex-row-reverse" : "flex-row"}`}>
          <div className="space-y-0.5 text-left">
            <span className="text-[8px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
              {t("explore.gps_active")}
            </span>
            <p className="text-xs font-bold text-slate-800">{t("explore.radar_map")}</p>
          </div>
          <button
            onClick={() => setShowMap(!showMap)}
            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-[10px] font-bold transition-all flex items-center gap-1 border border-slate-200"
          >
            <Map className="w-3.5 h-3.5" />
            {showMap ? t("explore.hide_map") : t("explore.show_map")}
          </button>
        </div>

        {showMap && (
          <div className="aspect-video bg-slate-950 rounded-2xl relative flex items-center justify-center overflow-hidden border border-slate-800 shadow-inner">
            {/* Mock Vector Grid lines */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <div className="absolute top-1/4 left-0 w-full h-0.5 bg-blue-500"></div>
              <div className="absolute top-3/4 left-0 w-full h-0.5 bg-blue-500"></div>
              <div className="absolute top-0 left-1/3 w-0.5 h-full bg-blue-500"></div>
              <div className="absolute top-0 left-2/3 w-0.5 h-full bg-blue-500"></div>
              <div className="absolute top-1/3 left-1/4 w-32 h-32 rounded-full border border-blue-500 animate-pulse"></div>
            </div>

            {/* Radar glowing ring */}
            <div className="absolute w-20 h-20 rounded-full bg-blue-500/10 border border-blue-500/30 animate-ping"></div>

            {/* Traveler locator pin */}
            <div className="relative z-10 bg-blue-600 p-2 rounded-full text-white shadow-lg animate-bounce shadow-blue-900/50">
              <Navigation className="w-4 h-4 transform rotate-45" />
            </div>

            {/* Render pins dynamically depending on active explorer tab */}
            {exploreTab === "stores" 
              ? countrySupermarkets.map((sm, idx) => (
                  <div
                    key={sm.id}
                    style={{ 
                      top: `${20 + (idx * 30)}%`, 
                      left: `${15 + (idx * 45)}%` 
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
                      {translateSMName(sm.name)} ({(idx + 1) * 0.4}{isAr ? " كم" : "km"})
                    </span>
                  </div>
                ))
              : countryAttractions.map((att, idx) => (
                  <div
                    key={att.id}
                    style={{ 
                      top: `${15 + (idx * 35)}%`, 
                      left: `${20 + (idx * 45)}%` 
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
                      {translateAttractionName(att.name)} ({(idx + 1) * 0.6}{isAr ? " كم" : "km"})
                    </span>
                  </div>
                ))
            }
          </div>
        )}
      </div>

      {/* Main interactive items listings */}
      <div className="space-y-3">
        {exploreTab === "stores" ? (
          /* Supermarkets sub list */
          countrySupermarkets.length === 0 ? (
            <div className="text-center py-10 bg-white border border-slate-100 rounded-3xl text-slate-400">
              <Store className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs">{t("explore.no_stores")}</p>
            </div>
          ) : (
            countrySupermarkets.map((sm) => {
              const isExpanded = activeSupermarket?.id === sm.id;
              return (
                <div 
                  key={sm.id}
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
                      <h3 className="text-sm font-display font-bold text-slate-800 mt-1">{translateSMName(sm.name)}</h3>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {sm.hours}
                      </p>
                    </div>

                    <ChevronRight className={`w-5 h-5 text-slate-400 transform transition-transform duration-200 shrink-0 ${isExpanded ? "rotate-95 text-blue-600" : ""} ${isAr ? "transform rotate-180" : ""}`} />
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-4 border-t border-slate-100 pt-3.5 space-y-3.5 animate-in fade-in duration-200 text-left">
                      {/* Overview */}
                      <div className="space-y-1">
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">{t("explore.local_overview")}</span>
                        <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-2xl border border-slate-100 text-left">
                          {translateSMDesc(sm.description)}
                        </p>
                      </div>

                      {/* Traveler Favorites */}
                      <div className="space-y-1.5">
                        <span className="text-[9px] text-blue-600 font-bold uppercase tracking-wider flex items-center gap-1 justify-start">
                          <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                          {t("explore.specialties")}
                        </span>
                        <p className="text-xs text-blue-900 leading-relaxed bg-blue-50/50 p-3 rounded-2xl border border-blue-100/30 font-medium text-left">
                          {translateSMSpecialty(sm.specialty)}
                        </p>
                      </div>

                      {/* Reviews */}
                      <div className="space-y-2">
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">{t("explore.reviews")}</span>
                        <div className="flex flex-col gap-2">
                          {sm.reviews.map((rev, rIdx) => (
                            <div key={rIdx} className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-[11px] space-y-1 text-left">
                              <div className={`flex justify-between items-center ${isAr ? "flex-row-reverse" : "flex-row"}`}>
                                <span className="font-bold text-slate-700">{translateReviewAuthor(rev.author)}</span>
                                <div className="flex gap-0.5 text-amber-400">
                                  {Array.from({ length: rev.rating }).map((_, sIdx) => (
                                    <Star key={sIdx} className="w-3 h-3 fill-amber-400" />
                                  ))}
                                </div>
                              </div>
                              <p className="text-slate-500 leading-relaxed italic text-left">"{translateReviewText(rev.text)}"</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )
        ) : (
          /* Attractions sub list */
          countryAttractions.length === 0 ? (
            <div className="text-center py-10 bg-white border border-slate-100 rounded-3xl text-slate-400">
              <Compass className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs">{t("explore.no_landmarks")}</p>
            </div>
          ) : (
            countryAttractions.map((att) => {
              const isExpanded = activeAttraction?.id === att.id;
              return (
                <div 
                  key={att.id}
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
                          {translateAttractionCategory(att.category)}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono flex items-center gap-0.5">
                          <Ticket className="w-3.5 h-3.5 text-slate-400" />
                          {att.ticketPriceLocal === 0 ? (isAr ? "مجاني" : "Free") : `${currentCountry.currencySymbol}${att.ticketPriceLocal}`}
                        </span>
                      </div>
                      <h3 className="text-sm font-display font-bold text-slate-800 mt-1">{translateAttractionName(att.name)}</h3>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {t("explore.hours_label")} {att.hours}
                      </p>
                    </div>

                    <ChevronRight className={`w-5 h-5 text-slate-400 transform transition-transform duration-200 shrink-0 ${isExpanded ? "rotate-95 text-blue-600" : ""} ${isAr ? "transform rotate-180" : ""}`} />
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-4 border-t border-slate-100 pt-3.5 space-y-3.5 animate-in fade-in duration-200 text-left">
                      {/* Description */}
                      <div className="space-y-1">
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">{t("explore.overview")}</span>
                        <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-2xl border border-slate-100 text-left">
                          {translateAttractionDesc(att.description)}
                        </p>
                      </div>

                      {/* Conversions */}
                      <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between text-left">
                        <div className="space-y-0.5 text-left">
                          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">{t("explore.converted_ticket")}</span>
                          <p className="text-xs font-bold text-slate-800 text-left">
                            {getTicketPriceConverted(att.ticketPriceLocal)}
                          </p>
                        </div>
                        <Ticket className="w-5 h-5 text-slate-400 shrink-0" />
                      </div>

                      {/* Safety Rules/Warnings */}
                      <div className="space-y-2 text-left">
                        <span className="text-[9px] text-red-500 font-bold uppercase tracking-wider flex items-center gap-1 justify-start">
                          <ShieldAlert className="w-4 h-4 text-red-600" />
                          {t("explore.scam_tips")}
                        </span>
                        <div className="flex flex-col gap-2">
                          {att.tips.map((tip, idx) => (
                            <div 
                              key={idx} 
                              className={`bg-red-50/50 border-red-500 p-3 rounded-2xl text-[11px] text-slate-600 flex gap-2 ${isAr ? "border-r-2 text-right flex-row-reverse" : "border-l-2 text-left"}`}
                            >
                              <div className="text-xs shrink-0 font-bold text-red-500">0{idx + 1}</div>
                              <span className="leading-relaxed text-left">{translateAttractionTip(tip)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
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
