import React, { useState, useEffect } from "react";
import { 
  Scan, Languages, Store, Compass, Globe, Signal, 
  Wifi, Battery, HelpCircle, AlertTriangle, RefreshCw, Smartphone, 
  Heart, ArrowRightLeft, ShieldCheck, Home, User, Settings, Sparkles
} from "lucide-react";
import { Country, Product, TranslationLog, ActiveScreen } from "./types";
import { COUNTRIES, INITIAL_PRODUCTS } from "./data";

// Import modular screens
import HomeView from "./components/HomeView";
import ScanView from "./components/ScanView";
import ProductDetailsView from "./components/ProductDetailsView";
import AddPriceView from "./components/AddPriceView";
import TranslateView from "./components/TranslateView";
import ExploreView from "./components/ExploreView";
import ProfileView from "./components/ProfileView";
import SettingsView from "./components/SettingsView";

// Import Firebase config & SDKs
import { auth, db } from "./lib/firebase";
import { 
  signInAnonymously, onAuthStateChanged, signOut, 
  signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile,
  linkWithCredential, EmailAuthProvider,
  User as FirebaseUser
} from "firebase/auth";
import { 
  collection, doc, setDoc, addDoc, onSnapshot, getDocs, 
  query, orderBy, deleteDoc, updateDoc, increment, getDoc
} from "firebase/firestore";
import { useLanguage, Language } from "./lib/i18n";
import OnboardingView from "./components/OnboardingView";

export default function App() {
  const { t, language, setLanguage } = useLanguage();
  // Onboarding state
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);

  // Navigation & Product Selection
  const [activeScreen, setActiveScreen] = useState<ActiveScreen>("home");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Global Traveler States
  const [currentCountry, setCurrentCountry] = useState<Country>(COUNTRIES[0]); // Default to Japan
  const [homeCountry, setHomeCountry] = useState<Country>(COUNTRIES[0]); // Synced to USA default
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
    const prodCol = collection(db, "products");
    const unsubProd = onSnapshot(prodCol, async (snap) => {
      if (snap.empty) {
        console.log("No products found in Firestore. Seeding database...");
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
        
        // Sort: customized products first, then alphabetical/chronological
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
      console.warn("Products snapshot subscription failed or unauthenticated. Using local list fallback:", err);
      setProducts(INITIAL_PRODUCTS);
    });

    return () => unsubProd();
  }, []);

  // 2. Setup Firebase Auth & Profile Listener
  useEffect(() => {
    let unsubProfile: (() => void) | null = null;
    let unsubTrans: (() => void) | null = null;

    const unsubAuth = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setFbUser(currentUser);
        
        // Check/Create User Profile document in Firestore
        const userDocRef = doc(db, "users", currentUser.uid);
        try {
          const userDocSnap = await getDoc(userDocRef);
          if (!userDocSnap.exists()) {
            await setDoc(userDocRef, {
              uid: currentUser.uid,
              displayName: currentUser.displayName || "Bernard Brewer",
              email: currentUser.email || null,
              xp: 950, // default Level 4
              visitedAttractions: ["att-jp-2"],
              createdAt: new Date().toISOString()
            });
          }
        } catch (err) {
          console.error("Error initializing user profile doc:", err);
        }

        // Listen to User Profile Changes in Real-Time
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
          console.warn("Profile onSnapshot failed, using in-memory guest profile fallback:", err);
          setUserProfile({
            displayName: currentUser.displayName || "Bernard Brewer",
            email: currentUser.email || null,
            xp: 950,
            visitedAttractions: ["att-jp-2"],
          });
          setLoadingProfile(false);
        });

        // Listen to User Translations Changes in Real-Time
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
          console.warn("Translation logs subscription fallback:", err);
          // Fallback if index isn't ready yet or simple query is needed
          const simpleQuery = collection(db, "users", currentUser.uid, "translations");
          onSnapshot(simpleQuery, (simpleSnap) => {
            const logs: TranslationLog[] = [];
            simpleSnap.forEach((d) => {
              logs.push({ id: d.id, ...d.data() } as TranslationLog);
            });
            // Sort locally as fallback
            logs.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
            setTranslationLogs(logs);
          }, (simpleErr) => {
            console.warn("Simple translation logs fallback failed too:", simpleErr);
          });
        });

      } else {
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
        try {
          await signInAnonymously(auth);
        } catch (err) {
          console.warn("Anonymous authentication is restricted in Firebase console. Continuing in local guest mode gracefully:", err);
        }
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
      setHomeCountry(JSON.parse(storedHome));
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

  // Helper to switch tabs safely
  const handleNavigateToScreen = (screen: ActiveScreen) => {
    setActiveScreen(screen);
  };


  return (
    <div className="flex flex-col xl:flex-row items-center justify-center gap-8 xl:gap-16 w-full max-w-6xl p-4 xl:p-8 select-none">
      
      {/* LEFT COLUMN: App Brand Presentation Info (Only visible on large screen layouts) */}
      <div className={`hidden xl:flex flex-col space-y-6 max-w-sm ${language === "ar" ? "text-right" : "text-left"}`}>
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 bg-blue-950/40 border border-blue-800/40 px-3.5 py-1 rounded-full text-xs font-bold text-blue-400">
            <ShieldCheck className="w-4 h-4 animate-pulse" />
            {t("app.live_feed")}
          </div>
          <h1 className="text-4xl font-display font-black text-white tracking-tight leading-none">
            {t("app.companion")}
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            {t("app.companion_desc")}
          </p>
        </div>

        {/* Global Active State Hub Card */}
        <div className="space-y-3 bg-white/5 border border-white/10 p-5 rounded-3xl">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-blue-400" />
            {t("app.gps_hub")}
          </h3>
          
          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-slate-400">{t("app.curr_dest")}</span>
              <strong className="text-white flex items-center gap-1">
                {currentCountry.flag} {t(currentCountry.name)} ({currentCountry.code})
              </strong>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-slate-400">{t("app.local_curr")}</span>
              <strong className="text-white">{currentCountry.currency} ({currentCountry.currencySymbol})</strong>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-slate-400">{t("app.home_curr")}</span>
              <strong className="text-white">{homeCountry.currency} ({homeCountry.currencySymbol})</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">{t("app.sim_rate")}</span>
              <strong className="text-emerald-400 font-mono">
                1 {homeCountry.currency} = {(currentCountry.exchangeRateToUSD / homeCountry.exchangeRateToUSD).toFixed(3)} {currentCountry.currency}
              </strong>
            </div>
          </div>
        </div>

        <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
          <Smartphone className="w-4 h-4" />
          {t("app.mobile_sim")}
        </div>
      </div>

      {/* CENTER: THE PRISTINE MOBILE PHONE PREVIEW FRAME (ROYAL BLUE ACCENTS) */}
      <div 
        id="nomi-mobile-viewport-container" 
        className="relative max-w-md w-full h-[840px] bg-white text-slate-800 rounded-[52px] shadow-2xl border-[10px] border-slate-900 flex flex-col overflow-hidden"
      >
        {/* PHONE TOP NOTCH AND SPEAKER */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-40 h-6 bg-slate-900 rounded-b-2xl z-50 flex items-center justify-center gap-2">
          {/* Speaker */}
          <div className="w-12 h-1 bg-neutral-950 rounded-full"></div>
          {/* Camera Lens */}
          <div className="w-2.5 h-2.5 bg-neutral-950 rounded-full border border-neutral-800"></div>
        </div>

        {/* MOBILE OS STATUS BAR */}
        <div className="px-6 pt-2 pb-1.5 bg-slate-950 text-[11px] font-bold text-white flex justify-between items-center z-40 shrink-0">
          {/* Time & Country Status */}
          <div className="flex items-center gap-2">
            <span className="tracking-tight">{currentTime || "20:44"}</span>
            <span className="text-[9px] font-black bg-blue-900 text-blue-100 border border-blue-800 px-1.5 py-0.2 rounded">
              {currentCountry.flag} {currentCountry.code}
            </span>
          </div>

          {/* Status Indicators */}
          <div className="flex items-center gap-1.5 text-slate-300">
            <Signal className="w-3.5 h-3.5" />
            <Wifi className="w-3.5 h-3.5" />
            <div className="flex items-center gap-0.5">
              <Battery className="w-4 h-4 text-emerald-400" />
              <span className="text-[9px] font-mono font-medium">94%</span>
            </div>
          </div>
        </div>

        {/* MOBILE APP HEADER */}
        <div className="p-4 bg-slate-950 text-white border-b border-slate-900 space-y-3 z-30 shrink-0">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center font-display font-black text-white text-base shadow shadow-blue-900/50">
                N
              </div>
              <div>
                <h2 className="text-sm font-display font-extrabold text-white tracking-tight leading-none">{t("app.title")}</h2>
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{t("app.tagline")}</span>
              </div>
            </div>

            {/* Quick language toggle & settings buttons */}
            <div className="flex items-center gap-1.5">
              <button
                id="top-language-toggle-btn"
                onClick={() => setLanguage(language === "en" ? "ar" : "en")}
                className="px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-[10px] font-bold text-blue-400 hover:text-blue-300 transition-all flex items-center gap-1"
                title={language === "en" ? "Switch to Arabic" : "التحويل للإنجليزية"}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>{language === "en" ? "العربية" : "EN"}</span>
              </button>

              <button
                id="top-settings-btn"
                onClick={() => handleNavigateToScreen("settings")}
                className={`p-2 rounded-xl transition-all ${
                  activeScreen === "settings" ? "bg-blue-600 text-white" : "hover:bg-slate-900 text-slate-400 hover:text-white"
                }`}
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick country selection toggles */}
          <div className="grid grid-cols-2 gap-2">
            
            {/* DESTINATION SELECTOR */}
            <div className="flex flex-col space-y-1">
              <label className="text-[8px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                <Globe className="w-2.5 h-2.5 text-blue-500" />
                {t("nav.active_dest")}
              </label>
              <select
                id="destination-country-select"
                value={currentCountry.code}
                onChange={(e) => {
                  const matched = COUNTRIES.find(c => c.code === e.target.value);
                  if (matched) setCurrentCountry(matched);
                }}
                className="bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-xl px-2.5 py-1.5 focus:border-blue-500 focus:outline-none font-bold"
              >
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {t(c.name)}
                  </option>
                ))}
              </select>
            </div>

            {/* HOME BASE SELECTOR */}
            <div className="flex flex-col space-y-1">
              <label className="text-[8px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                <ArrowRightLeft className="w-2.5 h-2.5 text-emerald-400" />
                {t("nav.home_residence")}
              </label>
              <select
                id="home-country-select"
                value={homeCountry.code}
                onChange={(e) => {
                  const matched = homeCountryOptions.find(c => c.code === e.target.value);
                  if (matched) handleSetHomeCountry(matched);
                }}
                className="bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-xl px-2.5 py-1.5 focus:border-emerald-500 focus:outline-none font-bold"
              >
                {homeCountryOptions.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {t(c.name)} ({c.currency})
                  </option>
                ))}
              </select>
            </div>

          </div>
        </div>

        {/* ACTIVE MAIN SCREEN VIEWPORT CONTAINER */}
        <div className="flex-1 bg-slate-50 relative overflow-hidden">
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

          {activeScreen === "settings" && (
            <SettingsView 
              homeCountry={homeCountry}
              homeCountryOptions={homeCountryOptions}
              onSetHomeCountry={handleSetHomeCountry}
              onClearHistory={handleClearTranslationHistory}
              onNavigate={handleNavigateToScreen}
            />
          )}
        </div>

        {/* BOTTOM NAVIGATION TAB BAR */}
        <div className="absolute bottom-0 inset-x-0 bg-slate-950/95 backdrop-blur-md border-t border-slate-900 py-3 px-4 flex justify-between items-center z-40 pb-6 shrink-0">
          
          {/* Home Tab */}
          <button
            id="home-tab-btn"
            onClick={() => handleNavigateToScreen("home")}
            className={`flex flex-col items-center gap-1 transition-all ${
              activeScreen === "home" ? "text-blue-500 font-bold" : "text-slate-400 hover:text-slate-300"
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[9px] font-bold tracking-wide">{t("nav.home")}</span>
          </button>

          {/* Explore (Markets & Landmarks combined) */}
          <button
            id="explore-tab-btn"
            onClick={() => handleNavigateToScreen("explore")}
            className={`flex flex-col items-center gap-1 transition-all ${
              activeScreen === "explore" ? "text-blue-500 font-bold" : "text-slate-400 hover:text-slate-300"
            }`}
          >
            <Compass className="w-5 h-5" />
            <span className="text-[9px] font-bold tracking-wide">{t("nav.explore")}</span>
          </button>

          {/* CENTER ACTION BUTTON: THE SCAN SHUTTER (THE LARGEST ELEMENT BY INSTRUCTION) */}
          <div className="relative">
            <button
              id="camera-center-action-btn"
              onClick={() => handleNavigateToScreen("scan")}
              className={`w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg hover:bg-blue-500 transform -translate-y-5 transition-all ring-6 ${
                activeScreen === "scan" ? "ring-blue-900 scale-105" : "ring-slate-950 scale-100"
              }`}
            >
              <Scan className="w-7 h-7" />
            </button>
          </div>

          {/* Translate Tab */}
          <button
            id="translate-tab-btn"
            onClick={() => handleNavigateToScreen("translate")}
            className={`flex flex-col items-center gap-1 transition-all ${
              activeScreen === "translate" ? "text-blue-500 font-bold" : "text-slate-400 hover:text-slate-300"
            }`}
          >
            <Languages className="w-5 h-5" />
            <span className="text-[9px] font-bold tracking-wide">{t("nav.translate")}</span>
          </button>

          {/* Profile Tab */}
          <button
            id="profile-tab-btn"
            onClick={() => handleNavigateToScreen("profile")}
            className={`flex flex-col items-center gap-1 transition-all ${
              activeScreen === "profile" ? "text-blue-500 font-bold" : "text-slate-400 hover:text-slate-300"
            }`}
          >
            <User className="w-5 h-5" />
            <span className="text-[9px] font-bold tracking-wide">{t("nav.passport")}</span>
          </button>

        </div>

        {/* HOME INDICATOR LINE (iOS native touch mockup) */}
        <div className="absolute bottom-1.5 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-slate-800 rounded-full z-50"></div>

        {/* ONBOARDING OVERLAY */}
        {showOnboarding && (
          <OnboardingView 
            homeCountryOptions={homeCountryOptions}
            onComplete={handleOnboardingComplete}
          />
        )}

      </div>

      {/* RIGHT COLUMN: Interactive Help & Troubleshooting Guidance */}
      <div className={`hidden xl:flex flex-col space-y-5 max-w-xs ${language === "ar" ? "text-right" : "text-left"} text-xs text-slate-400`}>
        <div className="bg-white/5 border border-white/10 p-5 rounded-3xl space-y-3.5">
          <h3 className="text-xs font-bold text-white flex items-center gap-1.5 uppercase tracking-wider">
            <HelpCircle className="w-4 h-4 text-blue-400 animate-pulse" />
            {t("app.guide_title")}
          </h3>
          <p className="leading-relaxed">
            {t("app.guide_desc")}
          </p>
          <ul className="list-disc pl-4 space-y-2 leading-relaxed text-slate-400">
            <li>
              <strong className={`${language === "ar" ? "ml-1" : "mr-1"} text-white`}>{t("nav.home")}</strong>: {t("app.guide.home")}
            </li>
            <li>
              <strong className={`${language === "ar" ? "ml-1" : "mr-1"} text-white`}>{t("nav.explore")}</strong>: {t("app.guide.explore")}
            </li>
            <li>
              <strong className={`${language === "ar" ? "ml-1" : "mr-1"} text-white`}>{t("scan.title")}</strong>: {t("app.guide.scan")}
            </li>
            <li>
              <strong className={`${language === "ar" ? "ml-1" : "mr-1"} text-white`}>{t("details.no_selected")}</strong>: {t("app.guide.details")}
            </li>
            <li>
              <strong className={`${language === "ar" ? "ml-1" : "mr-1"} text-white`}>{t("add.title")}</strong>: {t("app.guide.add_price")}
            </li>
            <li>
              <strong className={`${language === "ar" ? "ml-1" : "mr-1"} text-white`}>{t("nav.translate")}</strong>: {t("app.guide.translate")}
            </li>
            <li>
              <strong className={`${language === "ar" ? "ml-1" : "mr-1"} text-white`}>{t("nav.passport")}</strong>: {t("app.guide.profile")}
            </li>
            <li>
              <strong className={`${language === "ar" ? "ml-1" : "mr-1"} text-white`}>{t("settings.title")}</strong>: {t("app.guide.settings")}
            </li>
          </ul>
        </div>

        <div className="bg-blue-950/20 border border-blue-900/30 p-4 rounded-2xl text-[11px] text-blue-200/80 flex gap-2.5">
          <AlertTriangle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5 animate-pulse" />
          <span>
            <strong>{t("app.server_test")}</strong> {t("app.server_test_desc")}
          </span>
        </div>
      </div>

    </div>
  );
}
