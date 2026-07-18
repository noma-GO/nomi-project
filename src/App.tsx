import React, { useState, useEffect } from "react";
import { 
  Scan, Languages, Store, Compass, Globe, Signal, 
  Wifi, Battery, HelpCircle, AlertTriangle, RefreshCw, Smartphone, 
  Heart, ArrowRightLeft, ShieldCheck, Home, User, Settings, Sparkles
} from "lucide-react";
import { Country, Product, TranslationLog, ActiveScreen, CountryGuide } from "./types";
import { COUNTRIES, INITIAL_PRODUCTS } from "./data";
import { CountryManager, CountryModel } from "./lib/countryManager";

// Import modular screens
// Verified application screen architecture map integration
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

// Import Firebase config & SDKs
import { 
  auth, db,
  signInAnonymously, onAuthStateChanged, signOut, 
  signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile,
  linkWithCredential, EmailAuthProvider,
  collection, doc, setDoc, addDoc, onSnapshot, getDocs, 
  query, orderBy, deleteDoc, updateDoc, increment, getDoc
} from "./lib/firebase";
import { User as FirebaseUser } from "firebase/auth";
import { useLanguage, Language } from "./lib/i18n";
import OnboardingView from "./components/OnboardingView";

export default function App() {
  console.log("[NOMI APP] Initializing App component...");
  const { t, language, setLanguage } = useLanguage();
  // Onboarding state
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);

  // Navigation & Product Selection
  const [activeScreen, setActiveScreen] = useState<ActiveScreen>("home");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Global Traveler States
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
  const [currentTime, setCurrentTime] = useState("");

  // Firebase User & Profile States
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

  // 1. Sync Products Real-Time from Firestore (With auto-seeding on first startup)
  useEffect(() => {
    console.log("[NOMI APP] Effect 1 (Products subscription) mounted.");
    const prodCol = collection(db, "products");
    const unsubProd = onSnapshot(prodCol, async (snap) => {
      console.log("[NOMI APP] Products snapshot updated, size:", snap.size);
      if (snap.empty) {
        console.log("No products found in Firestore. Seeding database...");
        try {
          const promises = INITIAL_PRODUCTS.map((p) => setDoc(doc(db, "products", p.id), p));
          await Promise.all(promises);
          console.log("[NOMI APP] Database seeded successfully.");
        } catch (err) {
          console.error("Error seeding initial products:", err);
        }
      } else {
        const prodList: Product[] = [];
        snap.forEach((d) => {
          prodList.push(d.data() as Product);
        });
        
        // Sort: customized products first, then alphabetical/chronological
        prodList.sort((a, b) => {
          const isA_Custom = a.id.startsWith("scanned-") || a.id.startsWith("contributed-");
          const isB_Custom = b.id.startsWith("scanned-") || b.id.startsWith("contributed-");
          if (isA_Custom && !isB_Custom) return -1;
          if (!isA_Custom && isB_Custom) return 1;
          return b.id.localeCompare(a.id);
        });
        setProducts(prodList);
        console.log("[NOMI APP] Products updated in state, count:", prodList.length);
      }
    }, (err) => {
      console.warn("Products snapshot subscription failed or unauthenticated. Using local list fallback:", err);
      setProducts(INITIAL_PRODUCTS);
    });

    return () => {
      console.log("[NOMI APP] Effect 1 unmounted.");
      unsubProd();
    };
  }, []);

  // 2. Setup Firebase Auth & Profile Listener
  useEffect(() => {
    console.log("[NOMI APP] Effect 2 (Firebase Auth & Profile) mounted.");
    let unsubProfile: (() => void) | null = null;
    let unsubTrans: (() => void) | null = null;

    const unsubAuth = onAuthStateChanged(auth, (currentUser) => {
      console.log("[NOMI APP] Auth state changed. User:", currentUser ? currentUser.uid : "GUEST");
      if (currentUser) {
        setFbUser(currentUser);
        
        // Check/Create User Profile document in Firestore asynchronously (DO NOT AWAIT inside onAuthStateChanged!)
        const userDocRef = doc(db, "users", currentUser.uid);
        (async () => {
          try {
            console.log("[NOMI APP] Checking if profile exists in Firestore for uid:", currentUser.uid);
            const userDocSnap = await getDoc(userDocRef);
            if (!userDocSnap.exists()) {
              console.log("[NOMI APP] Profile document does not exist. Creating default profile...");
              await setDoc(userDocRef, {
                uid: currentUser.uid,
                displayName: currentUser.displayName || "Bernard Brewer",
                email: currentUser.email || null,
                xp: 950, // default Level 4
                visitedAttractions: ["att-jp-2"],
                createdAt: new Date().toISOString()
              });
              console.log("[NOMI APP] Default profile document created.");
            } else {
              console.log("[NOMI APP] Profile document found in Firestore.");
            }
          } catch (err) {
            console.error("[NOMI APP] Error initializing user profile doc asynchronously:", err);
          }
        })();

        // Listen to User Profile Changes in Real-Time
        console.log("[NOMI APP] Registering onSnapshot listener for profile...");
        unsubProfile = onSnapshot(userDocRef, (docSnap) => {
          console.log("[NOMI APP] Profile snap received. Exists:", docSnap.exists());
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
          console.warn("[NOMI APP] Profile onSnapshot failed, using in-memory guest profile fallback:", err);
          setUserProfile({
            displayName: currentUser.displayName || "Bernard Brewer",
            email: currentUser.email || null,
            xp: 950,
            visitedAttractions: ["att-jp-2"],
          });
          setLoadingProfile(false);
        });

        // Listen to User Translations Changes in Real-Time
        console.log("[NOMI APP] Registering onSnapshot listener for translations...");
        const transQuery = query(
          collection(db, "users", currentUser.uid, "translations"), 
          orderBy("timestamp", "desc")
        );
        unsubTrans = onSnapshot(transQuery, (snap) => {
          console.log("[NOMI APP] Translations snap received, size:", snap.size);
          const logs: TranslationLog[] = [];
          snap.forEach((d) => {
            logs.push({ id: d.id, ...d.data() } as TranslationLog);
          });
          setTranslationLogs(logs);
        }, (err) => {
          console.warn("[NOMI APP] Translation logs subscription fallback:", err);
          // Fallback if index isn't ready yet or simple query is needed
          const simpleQuery = collection(db, "users", currentUser.uid, "translations");
          onSnapshot(simpleQuery, (simpleSnap) => {
            console.log("[NOMI APP] Simple translations snap received, size:", simpleSnap.size);
            const logs: TranslationLog[] = [];
            simpleSnap.forEach((d) => {
              logs.push({ id: d.id, ...d.data() } as TranslationLog);
            });
            // Sort locally as fallback
            logs.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
            setTranslationLogs(logs);
          }, (simpleErr) => {
            console.warn("[NOMI APP] Simple translation logs fallback failed too:", simpleErr);
          });
        });

      } else {
        console.log("[NOMI APP] User is null. Defaulting to local guest state...");
        setFbUser(null);
        // Default to a complete local guest profile so that the application remains fully functional for offline guests
        setUserProfile({
          displayName: "Bernard Brewer",
          email: null,
          xp: 950,
          visitedAttractions: ["att-jp-2"],
        });
        setLoadingProfile(false);

        // Sign in anonymously if no current session
        console.log("[NOMI APP] Triggering anonymous sign-in...");
        signInAnonymously(auth).then(() => {
          console.log("[NOMI APP] Anonymous sign-in initiated successfully.");
        }).catch((err) => {
          console.warn("[NOMI APP] Anonymous authentication is restricted in Firebase console. Continuing in local guest mode gracefully:", err);
        });
      }
    });

    // Clock updater
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", hour12: false }));
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);

    return () => {
      unsubAuth();
      if (unsubProfile) unsubProfile();
      if (unsubTrans) unsubTrans();
      clearInterval(interval);
    };
  }, []);

  // Sync Settings Home Base with LocalStorage on mount and check onboarding
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

  // 3. User operations mapped to Firestore & Auth
  const handleAddProduct = async (newProduct: Product) => {
    try {
      // Add standard attribution label if possible
      const enrichedProduct = {
        ...newProduct,
        contributedBy: userProfile?.displayName || "You",
      };
      
      // Save product globally in Firestore
      await setDoc(doc(db, "products", enrichedProduct.id), enrichedProduct);

      // Award +150 XP for contributing a price log
      if (auth.currentUser) {
        const userDocRef = doc(db, "users", auth.currentUser.uid);
        await updateDoc(userDocRef, {
          xp: increment(150)
        });
      }
    } catch (err) {
      console.error("Firestore error adding product:", err);
      // Fallback
      setProducts([newProduct, ...products]);
    }
  };

  const handleAddTranslation = async (newLog: TranslationLog) => {
    try {
      if (auth.currentUser) {
        // Save translation log inside user's subcollection
        await setDoc(doc(db, "users", auth.currentUser.uid, "translations", newLog.id), newLog);

        // Award +100 XP for translating signs
        const userDocRef = doc(db, "users", auth.currentUser.uid);
        await updateDoc(userDocRef, {
          xp: increment(100)
        });
      } else {
        setTranslationLogs([newLog, ...translationLogs]);
      }
    } catch (err) {
      console.error("Firestore error saving translation:", err);
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
      console.error("Firestore error clearing translations:", err);
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

      // Award +200 XP for newly visited landmarks, subtract 200 if removed
      const xpDiff = alreadyVisited ? -200 : 200;

      await updateDoc(userDocRef, {
        visitedAttractions: updatedVisits,
        xp: increment(xpDiff)
      });
    } catch (err) {
      console.error("Firestore error updating checklist:", err);
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
      console.error("Firestore error updating profile name:", err);
    }
  };

  const handleRegisterEmail = async (email: string, password: string, displayName: string) => {
    try {
      // If anonymous, link email credentials
      if (auth.currentUser && auth.currentUser.isAnonymous) {
        const credential = EmailAuthProvider.credential(email, password);
        await linkWithCredential(auth.currentUser, credential);
        await updateProfile(auth.currentUser, { displayName });
        
        // Sync profile doc with correct credentials
        const userDocRef = doc(db, "users", auth.currentUser.uid);
        await updateDoc(userDocRef, {
          email,
          displayName
        });
      } else {
        // Create fresh credentials
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(cred.user, { displayName });
        
        // Initialize profile doc
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
      console.error("Firebase Auth Registration failed:", err);
      return { success: false, error: err.message };
    }
  };

  const handleSignInEmail = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { success: true };
    } catch (err: any) {
      console.error("Firebase Auth Sign-in failed:", err);
      return { success: false, error: err.message };
    }
  };

  const handleSignOutUser = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Firebase Auth Sign-out failed:", err);
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

  // Helper to switch tabs safely
  const handleNavigateToScreen = (screen: ActiveScreen) => {
    setActiveScreen(screen);
  };


  return (
    <div className="flex flex-col w-full min-h-screen bg-[#fafdfb] text-slate-800 select-none overflow-hidden relative" id="nomi-app-root">
      
      {/* PREMIUM MATERIAL DESIGN 3 TOP APP BAR */}
      <header className="w-full bg-white/90 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50 shadow-sm transition-all">
        <div className="max-w-5xl mx-auto px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
          
          {/* Logo & Branding */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-2xl bg-blue-600 flex items-center justify-center font-display font-black text-white text-lg shadow-md shadow-blue-500/20">
                N
              </div>
              <div>
                <h1 className="text-base font-display font-black text-slate-900 tracking-tight leading-none">
                  {t("app.title")}
                </h1>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block mt-0.5">
                  {t("app.tagline")}
                </span>
              </div>
            </div>

            {/* Quick Action Controls */}
            <div className="flex items-center gap-1 sm:hidden">
              <button
                id="top-language-toggle-btn-mobile"
                onClick={() => setLanguage(language === "en" ? "ar" : "en")}
                className="px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-100 text-[10px] font-black text-blue-600 hover:bg-blue-50 transition-all flex items-center gap-1"
                title={language === "en" ? "Switch to Arabic" : "التحويل للإنجليزية"}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>{language === "en" ? "العربية" : "EN"}</span>
              </button>

              <button
                id="top-assistant-btn-mobile"
                onClick={() => handleNavigateToScreen("assistant")}
                className={`p-2 rounded-xl transition-all ${
                  activeScreen === "assistant" ? "bg-blue-50 text-blue-600" : "text-slate-500 hover:bg-slate-50"
                }`}
                title="AI Travel Assistant"
              >
                <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
              </button>

              <button
                id="top-settings-btn-mobile"
                onClick={() => handleNavigateToScreen("settings")}
                className={`p-2 rounded-xl transition-all ${
                  activeScreen === "settings" ? "bg-blue-50 text-blue-600" : "text-slate-500 hover:bg-slate-50"
                }`}
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Selectors & Desktop Toggles */}
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
            
            {/* Centralized Country Manager Selection System Triggers */}
            <button
              id="destination-country-select-trigger"
              onClick={() => setIsCountrySelectorOpen(true)}
              className="flex items-center gap-2 bg-blue-50 border border-blue-100/50 hover:bg-blue-100 hover:border-blue-200 rounded-2xl px-3 py-1.5 transition-all text-[11px] font-black text-blue-700 cursor-pointer shadow-sm active:scale-95"
              title={language === "ar" ? "اختيار وجهة السفر النشطة" : "Change Active Destination"}
            >
              <Globe className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
              <span>{currentCountry.flag} {language === "ar" ? (currentCountry.nameAr || currentCountry.name) : currentCountry.name}</span>
            </button>

            <button
              id="home-country-select-trigger"
              onClick={() => setIsCountrySelectorOpen(true)}
              className="flex items-center gap-2 bg-emerald-50 border border-emerald-100/50 hover:bg-emerald-100 hover:border-emerald-200 rounded-2xl px-3 py-1.5 transition-all text-[11px] font-black text-emerald-700 cursor-pointer shadow-sm active:scale-95"
              title={language === "ar" ? "اختيار بلد الإقامة" : "Change Home Base Residence"}
            >
              <ArrowRightLeft className="w-3.5 h-3.5 text-emerald-600" />
              <span>{homeCountry.flag} {homeCountry.currency}</span>
            </button>

            {/* Desktop Toggles */}
            <div className="hidden sm:flex items-center gap-1">
              <button
                id="top-language-toggle-btn"
                onClick={() => setLanguage(language === "en" ? "ar" : "en")}
                className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100 text-[11px] font-extrabold text-blue-600 transition-all flex items-center gap-1"
                title={language === "en" ? "Switch to Arabic" : "التحويل للإنجليزية"}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>{language === "en" ? "العربية" : "EN"}</span>
              </button>

              <button
                id="top-assistant-btn"
                onClick={() => handleNavigateToScreen("assistant")}
                className={`p-2 rounded-xl transition-all ${
                  activeScreen === "assistant" ? "bg-blue-50 text-blue-600" : "text-slate-500 hover:bg-slate-50"
                }`}
                title="AI Travel Assistant"
              >
                <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
              </button>

              <button
                id="top-settings-btn"
                onClick={() => handleNavigateToScreen("settings")}
                className={`p-2 rounded-xl transition-all ${
                  activeScreen === "settings" ? "bg-blue-50 text-blue-600" : "text-slate-500 hover:bg-slate-50"
                }`}
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>
      </header>

      {/* ACTIVE SCREEN CONTAINER */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-6 pb-28 overflow-y-auto no-scrollbar">
        {activeScreen === "home" && (
          <HomeView 
            currentCountry={currentCountry}
            homeCountry={homeCountry}
            products={products}
            onSelectProduct={(p) => {
              setSelectedProduct(p);
              handleNavigateToScreen("product-details");
            }}
            onNavigate={handleNavigateToScreen}
          />
        )}

        {activeScreen === "scan" && (
          <ScanView 
            currentCountry={currentCountry}
            homeCountry={homeCountry}
            onAddProduct={handleAddProduct}
            onSelectProduct={setSelectedProduct}
            onNavigate={handleNavigateToScreen}
          />
        )}

        {activeScreen === "product-details" && (
          <ProductDetailsView 
            product={selectedProduct}
            currentCountry={currentCountry}
            homeCountry={homeCountry}
            onNavigate={handleNavigateToScreen}
          />
        )}

        {activeScreen === "add-price" && (
          <AddPriceView 
            currentCountry={currentCountry}
            homeCountry={homeCountry}
            onAddProduct={handleAddProduct}
            onNavigate={handleNavigateToScreen}
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
            onNavigate={handleNavigateToScreen}
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
            onNavigate={handleNavigateToScreen}
            fbUser={fbUser}
            userProfile={userProfile}
            loadingProfile={loadingProfile}
            onToggleAttraction={handleToggleAttractionVisit}
            onUpdateName={handleUpdateProfileName}
            onRegister={handleRegisterEmail}
            onSignIn={handleSignInEmail}
            onSignOut={handleSignOutUser}
          />
        )}

        {activeScreen === "assistant" && (
          <AssistantView 
            currentCountry={currentCountry}
            homeCountry={homeCountry}
            onNavigate={handleNavigateToScreen}
          />
        )}

        {activeScreen === "settings" && (
          <SettingsView 
            homeCountry={homeCountry}
            homeCountryOptions={homeCountryOptions}
            onSetHomeCountry={handleSetHomeCountry}
            onClearHistory={handleClearTranslationHistory}
            onNavigate={handleNavigateToScreen}
          />
        )}
      </main>

      {/* PREMIUM MATERIAL DESIGN 3 BOTTOM NAVIGATION BAR */}
      <div className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-150/80 py-2.5 px-4 z-40 shadow-lg flex justify-center items-center shrink-0">
        <nav className="w-full max-w-lg flex justify-around items-center h-14 relative">
          
          {/* Home Tab */}
          <button
            id="home-tab-btn"
            onClick={() => handleNavigateToScreen("home")}
            className="flex flex-col items-center justify-center flex-1 h-full relative group"
          >
            <div className={`flex flex-col items-center justify-center rounded-2xl transition-all duration-300 ${
              activeScreen === "home" 
                ? "bg-blue-100 text-blue-900 font-extrabold px-5 py-1" 
                : "text-slate-500 hover:text-slate-800"
            }`}>
              <Home className="w-5 h-5 transition-transform group-hover:scale-105" />
              <span className="text-[10px] mt-0.5 tracking-wide">{t("nav.home")}</span>
            </div>
          </button>

          {/* Explore Tab */}
          <button
            id="explore-tab-btn"
            onClick={() => handleNavigateToScreen("explore")}
            className="flex flex-col items-center justify-center flex-1 h-full relative group"
          >
            <div className={`flex flex-col items-center justify-center rounded-2xl transition-all duration-300 ${
              activeScreen === "explore" 
                ? "bg-blue-100 text-blue-900 font-extrabold px-5 py-1" 
                : "text-slate-500 hover:text-slate-800"
            }`}>
              <Compass className="w-5 h-5 transition-transform group-hover:scale-105" />
              <span className="text-[10px] mt-0.5 tracking-wide">{t("nav.explore")}</span>
            </div>
          </button>

          {/* Center Scan Action Button (Floating Look) */}
          <div className="relative mx-2">
            <button
              id="camera-center-action-btn"
              onClick={() => handleNavigateToScreen("scan")}
              className={`w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/30 hover:bg-blue-500 active:scale-95 transition-all transform -translate-y-4 ring-4 ${
                activeScreen === "scan" ? "ring-blue-200" : "ring-white"
              }`}
            >
              <Scan className="w-6 h-6 animate-pulse" />
            </button>
          </div>

          {/* Translate Tab */}
          <button
            id="translate-tab-btn"
            onClick={() => handleNavigateToScreen("translate")}
            className="flex flex-col items-center justify-center flex-1 h-full relative group"
          >
            <div className={`flex flex-col items-center justify-center rounded-2xl transition-all duration-300 ${
              activeScreen === "translate" 
                ? "bg-blue-100 text-blue-900 font-extrabold px-5 py-1" 
                : "text-slate-500 hover:text-slate-800"
            }`}>
              <Languages className="w-5 h-5 transition-transform group-hover:scale-105" />
              <span className="text-[10px] mt-0.5 tracking-wide">{t("nav.translate")}</span>
            </div>
          </button>

          {/* Passport Profile Tab */}
          <button
            id="profile-tab-btn"
            onClick={() => handleNavigateToScreen("profile")}
            className="flex flex-col items-center justify-center flex-1 h-full relative group"
          >
            <div className={`flex flex-col items-center justify-center rounded-2xl transition-all duration-300 ${
              activeScreen === "profile" 
                ? "bg-blue-100 text-blue-900 font-extrabold px-5 py-1" 
                : "text-slate-500 hover:text-slate-800"
            }`}>
              <User className="w-5 h-5 transition-transform group-hover:scale-105" />
              <span className="text-[10px] mt-0.5 tracking-wide">{t("nav.passport")}</span>
            </div>
          </button>

        </nav>
      </div>

      {/* ONBOARDING OVERLAY */}
      {showOnboarding && (
        <OnboardingView 
          homeCountryOptions={homeCountryOptions}
          onComplete={handleOnboardingComplete}
        />
      )}

      {/* CENTRALIZED COUNTRY MANAGER SELECTION SCREEN */}
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
