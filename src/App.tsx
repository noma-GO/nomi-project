import React, { useState, useEffect } from "react";
import { 
  Scan, Languages, Compass, Globe, 
  ArrowRightLeft, Home, User, Settings, Sparkles
} from "lucide-react";
import { Country, Product, TranslationLog, ActiveScreen, CountryGuide } from "./types";
import { COUNTRIES, INITIAL_PRODUCTS } from "./data";
import { CountryManager, CountryModel } from "./lib/countryManager";

// Screen components
import HomeView from "./components/HomeView";
import ScanView from "./components/ScanView";
import ProductDetailsView from "./components/ProductDetailsView";
import AddPriceView from "./components/AddPriceView";
import TranslateView from "./components/TranslateView";
import ExploreView from "./components/ExploreView";
import ProfileView from "./components/ProfileView";
import SettingsView from "./components/SettingsView";
import AssistantView from "./components/AssistantView";
import CountrySelectionView from "./components/CountrySelectionView";
import OnboardingView from "./components/OnboardingView";

// Firebase integration
import { 
  auth, db,
  signInAnonymously, onAuthStateChanged, 
  collection, doc, setDoc, onSnapshot, getDocs, 
  query, orderBy, deleteDoc, updateDoc, increment, getDoc,
  updateProfile, linkWithCredential, EmailAuthProvider,
  createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut,
  signInWithGoogle
} from "./lib/firebase";
import { User as FirebaseUser } from "firebase/auth";
import { useLanguage, Language } from "./lib/i18n";

export default function App() {
  const { t, language, setLanguage } = useLanguage();
  const isAr = language === "ar";

  // App UI states
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);
  const [activeScreen, setActiveScreen] = useState<ActiveScreen>("home");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Travel state definitions
  const [countriesList, setCountriesList] = useState<Country[]>(CountryManager.getAllCountries());
  const [countryGuides, setCountryGuides] = useState<Record<string, CountryGuide>>({});
  
  const [currentCountry, setCurrentCountry] = useState<Country>(() => {
    const storedDest = localStorage.getItem("nomi_destination_country");
    return storedDest ? CountryManager.getCountryByCode(storedDest) : CountryManager.getCountryByCode("JP");
  });

  const [homeCountry, setHomeCountry] = useState<Country>(() => {
    const storedHome = localStorage.getItem("nomi_home_country");
    if (storedHome) {
      try {
        const parsed = JSON.parse(storedHome);
        return CountryManager.getCountryByCode(parsed.code || parsed);
      } catch (e) {
        return CountryManager.getCountryByCode(storedHome);
      }
    }
    return CountryManager.getCountryByCode("US");
  });

  const [isCountrySelectorOpen, setIsCountrySelectorOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [translationLogs, setTranslationLogs] = useState<TranslationLog[]>([]);

  // Authenticated states
  const [fbUser, setFbUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<{
    displayName: string;
    email: string | null;
    xp: number;
    visitedAttractions: string[];
  } | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const US_COUNTRY: Country = {
    code: "US",
    name: "United States",
    flag: "🇺🇸",
    currency: "USD",
    currencySymbol: "$",
    exchangeRateToUSD: 1.0,
  };

  const homeCountryOptions = [US_COUNTRY, ...COUNTRIES];

  // 1. Live Products Synced from Firestore
  useEffect(() => {
    const prodCol = collection(db, "products");
    const unsubProd = onSnapshot(prodCol, async (snap) => {
      if (snap.empty) {
        try {
          const promises = INITIAL_PRODUCTS.map((p) => setDoc(doc(db, "products", p.id), p));
          await Promise.all(promises);
        } catch (err) {
          console.error("Error seeding initial products:", err);
        }
      } else {
        const prodList: Product[] = [];
        snap.forEach((d) => {
          prodList.push(d.data() as Product);
        });
        
        prodList.sort((a, b) => {
          const isA_Custom = a.id.startsWith("scanned-") || a.id.startsWith("contributed-");
          const isB_Custom = b.id.startsWith("scanned-") || b.id.startsWith("contributed-");
          if (isA_Custom && !isB_Custom) return -1;
          if (!isA_Custom && isB_Custom) return 1;
          return b.id.localeCompare(a.id);
        });
        setProducts(prodList);
      }
    }, (err) => {
      console.warn("Products sync failed. Using local fallback list.", err);
      setProducts(INITIAL_PRODUCTS);
    });

    return () => unsubProd();
  }, []);

  // 2. Real-Time Firebase Auth & Profile sync
  useEffect(() => {
    let unsubProfile: (() => void) | null = null;
    let unsubTrans: (() => void) | null = null;

    const unsubAuth = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setFbUser(currentUser);
        const userDocRef = doc(db, "users", currentUser.uid);
        
        (async () => {
          try {
            const userDocSnap = await getDoc(userDocRef);
            if (!userDocSnap.exists()) {
              await setDoc(userDocRef, {
                uid: currentUser.uid,
                displayName: currentUser.displayName || "Bernard Brewer",
                email: currentUser.email || null,
                xp: 950,
                visitedAttractions: ["att-jp-2"],
                createdAt: new Date().toISOString()
              });
            }
          } catch (err) {
            console.error("Error creating default profile in Firestore:", err);
          }
        })();

        unsubProfile = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setUserProfile({
              displayName: data.displayName || "Bernard Brewer",
              email: data.email || null,
              xp: typeof data.xp === "number" ? data.xp : 950,
              visitedAttractions: data.visitedAttractions || ["att-jp-2"],
            });
          }
          setLoadingProfile(false);
        }, (err) => {
          console.warn("Profile sync fallback to guest.", err);
          setUserProfile({
            displayName: currentUser.displayName || "Bernard Brewer",
            email: currentUser.email || null,
            xp: 950,
            visitedAttractions: ["att-jp-2"],
          });
          setLoadingProfile(false);
        });

        const transQuery = query(
          collection(db, "users", currentUser.uid, "translations"), 
          orderBy("timestamp", "desc")
        );
        unsubTrans = onSnapshot(transQuery, (snap) => {
          const logs: TranslationLog[] = [];
          snap.forEach((d) => {
            logs.push({ id: d.id, ...d.data() } as TranslationLog);
          });
          setTranslationLogs(logs);
        }, (err) => {
          const fallbackCol = collection(db, "users", currentUser.uid, "translations");
          onSnapshot(fallbackCol, (fallbackSnap) => {
            const logs: TranslationLog[] = [];
            fallbackSnap.forEach((d) => {
              logs.push({ id: d.id, ...d.data() } as TranslationLog);
            });
            logs.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
            setTranslationLogs(logs);
          });
        });

      } else {
        setFbUser(null);
        setUserProfile({
          displayName: "Bernard Brewer",
          email: null,
          xp: 950,
          visitedAttractions: ["att-jp-2"],
        });
        setLoadingProfile(false);

        signInAnonymously(auth).catch((err) => {
          console.warn("Anonymous sign-in not configured in console. Continuing offline.", err);
        });
      }
    });

    return () => {
      unsubAuth();
      if (unsubProfile) unsubProfile();
      if (unsubTrans) unsubTrans();
    };
  }, []);

  // 3. Check for Onboarding on load
  useEffect(() => {
    const onboardingCompleted = localStorage.getItem("nomi_onboarding_completed") === "true";
    if (!onboardingCompleted) {
      setShowOnboarding(true);
    }

    const storedHome = localStorage.getItem("nomi_home_country");
    if (storedHome) {
      try {
        const parsed = JSON.parse(storedHome);
        setHomeCountry(CountryManager.getCountryByCode(parsed.code || parsed));
      } catch (e) {
        setHomeCountry(CountryManager.getCountryByCode(storedHome) || US_COUNTRY);
      }
    } else {
      setHomeCountry(US_COUNTRY);
    }
  }, []);

  const handleOnboardingComplete = (selectedCountry: Country, selectedLanguage: Language) => {
    handleSetHomeCountry(selectedCountry);
    localStorage.setItem("nomi_app_language", selectedLanguage);
    localStorage.setItem("nomi_onboarding_completed", "true");
    setShowOnboarding(false);
  };

  const handleAddProduct = async (newProduct: Product) => {
    try {
      const enrichedProduct = {
        ...newProduct,
        contributedBy: userProfile?.displayName || "You",
      };
      await setDoc(doc(db, "products", enrichedProduct.id), enrichedProduct);

      if (auth.currentUser) {
        const userDocRef = doc(db, "users", auth.currentUser.uid);
        await updateDoc(userDocRef, {
          xp: increment(150)
        });
      }
    } catch (err) {
      console.error("Failed adding product, fallback locally.", err);
      setProducts([newProduct, ...products]);
    }
  };

  const handleAddTranslation = async (newLog: TranslationLog) => {
    try {
      if (auth.currentUser) {
        await setDoc(doc(db, "users", auth.currentUser.uid, "translations", newLog.id), newLog);
        const userDocRef = doc(db, "users", auth.currentUser.uid);
        await updateDoc(userDocRef, {
          xp: increment(100)
        });
      } else {
        setTranslationLogs([newLog, ...translationLogs]);
      }
    } catch (err) {
      console.error("Failed adding translation log, fallback locally.", err);
      setTranslationLogs([newLog, ...translationLogs]);
    }
  };

  const handleClearTranslationHistory = async () => {
    try {
      if (auth.currentUser) {
        const transCol = collection(db, "users", auth.currentUser.uid, "translations");
        const snap = await getDocs(transCol);
        const promises = snap.docs.map((docSnap) => deleteDoc(docSnap.ref));
        await Promise.all(promises);
      } else {
        setTranslationLogs([]);
      }
    } catch (err) {
      console.error("Failed clearing history.", err);
      setTranslationLogs([]);
    }
  };

  const handleToggleAttractionVisit = async (attractionId: string) => {
    if (!auth.currentUser || !userProfile) return;
    try {
      const userDocRef = doc(db, "users", auth.currentUser.uid);
      const currentVisits = userProfile.visitedAttractions || [];
      const alreadyVisited = currentVisits.includes(attractionId);

      const updatedVisits = alreadyVisited
        ? currentVisits.filter((id) => id !== attractionId)
        : [...currentVisits, attractionId];

      const xpDiff = alreadyVisited ? -200 : 200;

      await updateDoc(userDocRef, {
        visitedAttractions: updatedVisits,
        xp: increment(xpDiff)
      });
    } catch (err) {
      console.error("Failed toggling attraction checklist.", err);
    }
  };

  const handleUpdateProfileName = async (newName: string) => {
    if (!auth.currentUser) return;
    try {
      const userDocRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(userDocRef, {
        displayName: newName
      });
      if (auth.currentUser.displayName !== newName) {
        await updateProfile(auth.currentUser, { displayName: newName });
      }
    } catch (err) {
      console.error("Failed updating display name.", err);
    }
  };

  const handleRegisterEmail = async (email: string, password: string, displayName: string) => {
    try {
      if (auth.currentUser && auth.currentUser.isAnonymous) {
        const credential = EmailAuthProvider.credential(email, password);
        await linkWithCredential(auth.currentUser, credential);
        await updateProfile(auth.currentUser, { displayName });
        
        const userDocRef = doc(db, "users", auth.currentUser.uid);
        await updateDoc(userDocRef, {
          email,
          displayName
        });
      } else {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(cred.user, { displayName });
        
        const userDocRef = doc(db, "users", cred.user.uid);
        await setDoc(userDocRef, {
          uid: cred.user.uid,
          displayName,
          email,
          xp: 950,
          visitedAttractions: ["att-jp-2"],
          createdAt: new Date().toISOString()
        });
      }
      return { success: true };
    } catch (err: any) {
      console.error("Email registration failed:", err);
      return { success: false, error: err.message };
    }
  };

  const handleSignInEmail = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { success: true };
    } catch (err: any) {
      console.error("Email sign-in failed:", err);
      return { success: false, error: err.message };
    }
  };

  const handleSignInGoogle = async () => {
    try {
      await signInWithGoogle(auth);
      return { success: true };
    } catch (err: any) {
      console.error("Google sign-in failed:", err);
      return { success: false, error: err.message };
    }
  };

  const handleSignOutUser = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Email sign-out failed:", err);
    }
  };

  const handleSetHomeCountry = (country: Country) => {
    setHomeCountry(country);
    localStorage.setItem("nomi_home_country", JSON.stringify(country));
  };

  const handleSetCurrentCountry = (country: Country) => {
    setCurrentCountry(country);
    localStorage.setItem("nomi_destination_country", country.code);
  };

  const handleAddDynamicCountry = (guide: CountryGuide) => {
    setCountryGuides(prev => ({
      ...prev,
      [guide.code]: guide
    }));
    const exists = countriesList.some(c => c.code === guide.code);
    if (!exists) {
      const newCountry: Country = {
        code: guide.code,
        name: guide.name,
        nameAr: guide.nameAr,
        flag: guide.flag,
        currency: guide.currency,
        currencySymbol: guide.currencySymbol,
        exchangeRateToUSD: guide.exchangeRateToUSD,
      };
      setCountriesList(prev => [...prev, newCountry]);
    }
  };

  const handleChangeDestination = (countryCode: string) => {
    const target = countriesList.find(c => c.code === countryCode);
    if (target) {
      handleSetCurrentCountry(target);
    }
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-slate-50 text-slate-800 select-none overflow-hidden relative font-sans" id="nomi-app-root">
      
      {/* 1. Authentic Material 3 Top Navigation Bar */}
      <header className="w-full bg-white/95 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-50 shadow-sm">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between gap-3">
          
          <div className="flex items-center gap-2.5">
            <button 
              onClick={() => setLanguage(language === "en" ? "ar" : "en")}
              className="w-9 h-9 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center font-black text-sm shadow-md cursor-pointer transition-all active:scale-95"
              title={t("nav.home")}
            >
              N
            </button>
            <div className="text-left">
              <h1 className="text-sm font-extrabold text-slate-900 tracking-tight leading-none">
                {t("app.title")}
              </h1>
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest block mt-0.5">
                {t("app.tagline")}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Quick Country Selector Access Pin */}
            <button
              id="destination-country-select-trigger"
              onClick={() => setIsCountrySelectorOpen(true)}
              className="flex items-center gap-1 bg-blue-50 border border-blue-100 text-blue-700 px-3 py-1.5 rounded-2xl transition-all text-[10px] font-black cursor-pointer active:scale-95 shadow-sm"
              title={isAr ? "اختيار وجهة السفر النشطة" : "Change Active Destination"}
            >
              <Globe className="w-3.5 h-3.5 text-blue-500" />
              <span>{currentCountry.flag} {isAr ? currentCountry.nameAr || currentCountry.name : currentCountry.name}</span>
            </button>

            {/* Language Translation Selector */}
            <button
              id="top-language-toggle-btn-mobile"
              onClick={() => setLanguage(language === "en" ? "ar" : "en")}
              className="px-2.5 py-1.5 rounded-2xl bg-slate-100 border border-slate-200 text-[10px] font-black text-slate-600 hover:bg-slate-200 transition-all flex items-center gap-1 cursor-pointer active:scale-95"
            >
              <span>{language === "en" ? "العربية" : "EN"}</span>
            </button>
          </div>

        </div>
      </header>

      {/* 2. Scrollable screen container viewports */}
      <main className="flex-1 w-full max-w-lg mx-auto px-4 py-4 pb-28 overflow-y-auto no-scrollbar">
        {activeScreen === "home" && (
          <HomeView 
            currentCountry={currentCountry}
            homeCountry={homeCountry}
            products={products}
            onSelectProduct={(p) => {
              setSelectedProduct(p);
              setActiveScreen("product-details");
            }}
            onNavigate={setActiveScreen}
          />
        )}

        {activeScreen === "scan" && (
          <ScanView 
            currentCountry={currentCountry}
            homeCountry={homeCountry}
            onAddProduct={handleAddProduct}
            onSelectProduct={setSelectedProduct}
            onNavigate={setActiveScreen}
          />
        )}

        {activeScreen === "product-details" && (
          <ProductDetailsView 
            product={selectedProduct}
            currentCountry={currentCountry}
            homeCountry={homeCountry}
            onNavigate={setActiveScreen}
          />
        )}

        {activeScreen === "add-price" && (
          <AddPriceView 
            currentCountry={currentCountry}
            homeCountry={homeCountry}
            onAddProduct={handleAddProduct}
            onNavigate={setActiveScreen}
          />
        )}

        {activeScreen === "translate" && (
          <TranslateView 
            currentCountry={currentCountry}
            translationLogs={translationLogs}
            onAddTranslation={handleAddTranslation}
            onClearHistory={handleClearTranslationHistory}
          />
        )}

        {activeScreen === "explore" && (
          <ExploreView 
            currentCountry={currentCountry}
            homeCountry={homeCountry}
            onNavigate={setActiveScreen}
            countriesList={countriesList}
            onAddDynamicCountry={handleAddDynamicCountry}
            countryGuides={countryGuides}
            onChangeDestination={handleChangeDestination}
            onOpenCountrySelector={() => setIsCountrySelectorOpen(true)}
          />
        )}

        {activeScreen === "profile" && (
          <ProfileView 
            currentCountry={currentCountry}
            products={products}
            onNavigate={setActiveScreen}
            fbUser={fbUser}
            userProfile={userProfile}
            loadingProfile={loadingProfile}
            onToggleAttraction={handleToggleAttractionVisit}
            onUpdateName={handleUpdateProfileName}
            onRegister={handleRegisterEmail}
            onSignIn={handleSignInEmail}
            onSignInGoogle={handleSignInGoogle}
            onSignOut={handleSignOutUser}
          />
        )}

        {activeScreen === "assistant" && (
          <AssistantView 
            currentCountry={currentCountry}
            homeCountry={homeCountry}
            onNavigate={setActiveScreen}
          />
        )}

        {activeScreen === "settings" && (
          <SettingsView 
            homeCountry={homeCountry}
            homeCountryOptions={homeCountryOptions}
            onSetHomeCountry={handleSetHomeCountry}
            onClearHistory={handleClearTranslationHistory}
            onNavigate={setActiveScreen}
          />
        )}
      </main>

      {/* 3. Authentic Material 3 Navigation Bar */}
      <div className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200/60 py-2 px-4 z-40 shadow-lg flex justify-center items-center">
        <nav className="w-full max-w-lg flex justify-around items-center h-14 relative">
          
          {/* Home */}
          <button
            onClick={() => setActiveScreen("home")}
            className="flex flex-col items-center justify-center flex-1 h-full relative group cursor-pointer"
          >
            <div className={`flex flex-col items-center justify-center rounded-2xl transition-all duration-300 ${
              activeScreen === "home" 
                ? "text-blue-600 font-extrabold" 
                : "text-slate-400 hover:text-slate-600"
            }`}>
              <Home className="w-5 h-5" />
              <span className="text-[9px] mt-1 font-bold">{t("nav.home")}</span>
            </div>
          </button>

          {/* Explore */}
          <button
            onClick={() => setActiveScreen("explore")}
            className="flex flex-col items-center justify-center flex-1 h-full relative group cursor-pointer"
          >
            <div className={`flex flex-col items-center justify-center rounded-2xl transition-all duration-300 ${
              activeScreen === "explore" 
                ? "text-blue-600 font-extrabold" 
                : "text-slate-400 hover:text-slate-600"
            }`}>
              <Compass className="w-5 h-5" />
              <span className="text-[9px] mt-1 font-bold">{t("nav.explore")}</span>
            </div>
          </button>

          {/* Center Floating Lens Camera */}
          <div className="relative mx-1">
            <button
              onClick={() => setActiveScreen("scan")}
              className={`w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg hover:bg-blue-500 active:scale-95 transition-all transform -translate-y-4 ring-4 ${
                activeScreen === "scan" ? "ring-blue-150" : "ring-slate-50"
              } cursor-pointer`}
              title="Camera Scan"
            >
              <Scan className="w-5 h-5" />
            </button>
          </div>

          {/* Translate */}
          <button
            onClick={() => setActiveScreen("translate")}
            className="flex flex-col items-center justify-center flex-1 h-full relative group cursor-pointer"
          >
            <div className={`flex flex-col items-center justify-center rounded-2xl transition-all duration-300 ${
              activeScreen === "translate" 
                ? "text-blue-600 font-extrabold" 
                : "text-slate-400 hover:text-slate-600"
            }`}>
              <Languages className="w-5 h-5" />
              <span className="text-[9px] mt-1 font-bold">{t("nav.translate")}</span>
            </div>
          </button>

          {/* Profile Passport */}
          <button
            onClick={() => setActiveScreen("profile")}
            className="flex flex-col items-center justify-center flex-1 h-full relative group cursor-pointer"
          >
            <div className={`flex flex-col items-center justify-center rounded-2xl transition-all duration-300 ${
              activeScreen === "profile" 
                ? "text-blue-600 font-extrabold" 
                : "text-slate-400 hover:text-slate-600"
            }`}>
              <User className="w-5 h-5" />
              <span className="text-[9px] mt-1 font-bold">{t("nav.passport")}</span>
            </div>
          </button>

        </nav>
      </div>

      {/* Onboarding overlay */}
      {showOnboarding && (
        <OnboardingView 
          homeCountryOptions={homeCountryOptions}
          onComplete={handleOnboardingComplete}
        />
      )}

      {/* Country Selection view sheet */}
      <CountrySelectionView
        isOpen={isCountrySelectorOpen}
        onClose={() => setIsCountrySelectorOpen(false)}
        selectedDestination={currentCountry as CountryModel}
        selectedHome={homeCountry as CountryModel}
        onSelectDestination={(country) => {
          handleSetCurrentCountry(country);
          handleChangeDestination(country.code);
        }}
        onSelectHome={handleSetHomeCountry}
      />

    </div>
  );
}
