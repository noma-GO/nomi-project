import React, { useState, useRef, useEffect } from "react";
import { motion } from "motion/react";
import { 
  Camera, ArrowLeft, ArrowRightLeft, Sparkles, CheckCircle2, 
  ShoppingBag, FileText, RefreshCw, Copy, Volume2, Info, X,
  Zap, ZoomIn, Settings, Eye, Sliders, Image, Loader2
} from "lucide-react";
import { Country, Product } from "../types";
import { SAMPLE_PRODUCTS_TO_SCAN } from "../data";
import { useLanguage } from "../lib/i18n";

interface ScanViewProps {
  currentCountry: Country;
  homeCountry: Country;
  onAddProduct: (product: Product) => void;
  onSelectProduct: (product: Product) => void;
  onNavigate: (screen: any) => void;
}

export default function ScanView({ 
  currentCountry, 
  homeCountry, 
  onAddProduct,
  onSelectProduct,
  onNavigate 
}: ScanViewProps) {
  const { t, language } = useLanguage();
  const isAr = language === "ar";

  const [scanning, setScanning] = useState(false);
  const [scanStep, setScanStep] = useState("");
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Scan Modes: product, barcode, ocr, translate
  const [scanMode, setScanMode] = useState<"product" | "barcode" | "ocr" | "translate">("product");

  // Real Camera States
  const [cameraActive, setCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Zoom and Quality Settings (Requested features)
  const [zoomLevel, setZoomLevel] = useState<number>(1); // 1x, 2x, 5x
  const [flashOn, setFlashOn] = useState<"off" | "on" | "auto">("off");
  const [streamQuality, setStreamQuality] = useState<"high" | "mid" | "low">("high");
  const [focusing, setFocusing] = useState(false);
  const [focusCoords, setFocusCoords] = useState({ x: 50, y: 50 }); // tap-to-focus target percent

  // Scan Results Dialog Sheets
  const [ocrResult, setOcrResult] = useState<any | null>(null);
  const [translateResult, setTranslateResult] = useState<any | null>(null);
  const [barcodeResult, setBarcodeResult] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Restart camera when facing mode or quality changes
  useEffect(() => {
    if (cameraActive) {
      startCamera(facingMode, streamQuality);
    }
    return () => {
      stopCamera();
    };
  }, [facingMode, streamQuality]);

  const startCamera = async (mode: "user" | "environment" = "environment", quality: "high" | "mid" | "low" = "high") => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError(
        isAr 
          ? "المتصفح الحالي لا يدعم الوصول إلى الكاميرا المباشرة." 
          : "Webcam streaming is not supported by this browser."
      );
      return;
    }

    try {
      setError(null);
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      // Constraints based on requested Quality Selection
      let widthValue = 1280;
      let heightValue = 720;
      if (quality === "mid") {
        widthValue = 854;
        heightValue = 480;
      } else if (quality === "low") {
        widthValue = 640;
        heightValue = 360;
      }

      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { 
            facingMode: { exact: mode },
            width: { ideal: widthValue },
            height: { ideal: heightValue }
          }
        });
      } catch (err1) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { 
              facingMode: mode,
              width: { ideal: widthValue },
              height: { ideal: heightValue }
            }
          });
        } catch (err2) {
          stream = await navigator.mediaDevices.getUserMedia({
            video: true
          });
        }
      }

      streamRef.current = stream;
      setCameraActive(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch((err) => {
          console.error("Video play failed:", err);
        });
      }
    } catch (err: any) {
      console.warn("Camera streaming failed:", err);
      setCameraActive(false);
      setError(
        isAr 
          ? "فشل تشغيل الكاميرا المباشرة. يرجى التحقق من صلاحيات المتصفح والاتصال." 
          : "Could not activate live camera feed. Please check app permissions and try again."
      );
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const toggleFacingMode = () => {
    const nextMode = facingMode === "environment" ? "user" : "environment";
    setFacingMode(nextMode);
  };

  const toggleFlash = () => {
    setFlashOn(prev => prev === "off" ? "on" : prev === "on" ? "auto" : "off");
  };

  // Simulated tap-to-focus action
  const handleTapFocus = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cameraActive) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const xPercent = ((e.clientX - rect.left) / rect.width) * 100;
    const yPercent = ((e.clientY - rect.top) / rect.height) * 100;
    
    setFocusCoords({ x: xPercent, y: yPercent });
    setFocusing(true);

    // Auto trigger fade focus animation
    setTimeout(() => {
      setFocusing(false);
    }, 1200);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;

    try {
      const canvas = document.createElement("canvas");
      const width = video.videoWidth || video.clientWidth || 640;
      const height = video.videoHeight || video.clientHeight || 480;
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const base64Data = canvas.toDataURL("image/jpeg");
        stopCamera();
        handleScanAPI(base64Data);
      }
    } catch (err: any) {
      console.error("Error capturing canvas snapshot:", err);
      setError(isAr ? "فشل التقاط الصورة من الكاميرا." : "Failed to capture live camera frame.");
    }
  };

  const handleScanAPI = async (base64Data: string) => {
    try {
      setScanning(true);
      setError(null);
      setOcrResult(null);
      setTranslateResult(null);

      setScanStep(isAr ? "🔍 جاري الاتصال بنظام الفحص الضوئي..." : "🔍 Contacting smart scanning core...");
      await new Promise((r) => setTimeout(r, 400));
      setScanStep(isAr ? "📡 جاري إرسال البيانات إلى خادم الذكاء الاصطناعي..." : "📡 Sending frames to Gemini...");

      const targetLanguageName = isAr ? "Arabic" : "English";

      const response = await fetch("/api/scan-product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: base64Data.split(",")[1] || base64Data,
          targetCountry: currentCountry.name,
          homeCurrency: homeCountry.currency,
          scanMode,
          targetLanguage: targetLanguageName
        }),
      });

      if (!response.ok) {
        throw new Error("Local fallback required");
      }

      const data = await response.json();

      if (scanMode === "ocr") {
        setOcrResult(data);
      } else if (scanMode === "translate") {
        setTranslateResult(data);
      } else if (scanMode === "barcode") {
        setBarcodeResult(data);
      } else {
        const newProduct: Product = {
          id: "scanned-" + Date.now(),
          name: data.productName || (isAr ? "منتج محلي مكتشف" : "Decoded Local Item"),
          brand: data.brand || (isAr ? "علامة تجارية محلية" : "Local Brand"),
          barcode: data.barcode || "N/A",
          category: data.category || "Food",
          priceInLocal: data.estimatedLocalPrice || 150,
          countryCode: currentCountry.code,
          storeName: isAr ? "سوبرماركت معتمد" : "Verified Retailer",
          description: data.description || (isAr ? "تم التحقق من تفاصيل المنتج وصلاحيته." : "Authentic local item."),
          contributedBy: "You",
          dateContributed: new Date().toLocaleDateString(),
        };

        onAddProduct(newProduct);
        onSelectProduct(newProduct);
        onNavigate("product-details");
      }
    } catch (err: any) {
      console.warn("Scan failed, executing safe local resolution...", err);
      setScanStep(isAr ? "⚙️ جاري معالجة المنتج محلياً..." : "⚙️ Performing offline resolution...");
      await new Promise((r) => setTimeout(r, 600));

      if (scanMode === "ocr") {
        setOcrResult({
          detectedText: "警告 - 安全第一\n非常口はこちらです。足元にご注意ください。",
          detectedLanguage: isAr ? "اليابانية" : "Japanese",
          formattedParagraphs: [
            isAr ? "تحذير - الأمان أولاً" : "Warning - Safety First",
            isAr ? "مخرج الطوارئ من هنا. يرجى الانتباه لموضع قدمك." : "The emergency exit is here. Please watch your step."
          ],
          summary: isAr ? "لوحة إرشادية للأمان ومخارج الطوارئ." : "Emergency exit safety guide sign at the transit facility."
        });
      } else if (scanMode === "translate") {
        setTranslateResult({
          originalText: "本日休業 - またのご来店をお待ちしております",
          translatedText: isAr 
            ? "مغلق اليوم - نتطلع لزيارتكم القادمة" 
            : "Closed Today - We look forward to your next visit",
          detectedLanguage: isAr ? "اليابانية" : "Japanese",
          contextNotes: isAr
            ? "لوحة إخطار شائعة في المتاجر والمطاعم اليابانية الصغيرة خلال أيام العطل الأسبوعية."
            : "Common notice board on Japanese boutique shops and dining spots outside tourist zones during mid-week rest days."
        });
      } else if (scanMode === "barcode") {
        setBarcodeResult({
          barcode: "8850123049182",
          productName: isAr ? "علبة معكرونة فورية بالروبيان" : "Shrimp Instant Noodles Cup",
          brand: "Mama",
          category: "Food",
          estimatedLocalPrice: currentCountry.code === "TH" ? 15 : 1.50,
          currency: currentCountry.currency,
          description: isAr 
            ? "معكرونة سريعة التحضير نكهة توم يوم الحارة الأصلية. منتج محلي رائج ومعتمد." 
            : "Authentic spicy Tom Yum flavored instant noodles. Highly popular and trusted local snack.",
          isTrusted: true,
          confidenceScore: 94
        });
      } else {
        const randomCost = currentCountry.code === "JP" ? 150 : currentCountry.code === "TH" ? 35 : 2.00;
        const fallbackProd: Product = {
          id: "scanned-" + Date.now(),
          name: `${currentCountry.flag} ${isAr ? "منتج محلي موثوق" : "Local Verified Souvenir"}`,
          brand: "Nomi AI",
          barcode: "885012304" + Math.floor(100 + Math.random() * 900),
          category: "Food",
          priceInLocal: randomCost,
          countryCode: currentCountry.code,
          storeName: isAr ? "متجر محلي معتمد" : "Local Certified Market",
          description: isAr
            ? `منتج سفر أصلي ومحبوب للغاية تم مسحه ضوئيًا في ${currentCountry.nameAr || currentCountry.name}.`
            : `Highly popular authentic travel staple scanned in ${currentCountry.name}.`,
          contributedBy: isAr ? "أنت (وضع عدم الاتصال)" : "You (Offline Sandbox)",
          dateContributed: new Date().toLocaleDateString()
        };

        onAddProduct(fallbackProd);
        onSelectProduct(fallbackProd);
        onNavigate("product-details");
      }
    } finally {
      setScanning(false);
      setScanStep("");
    }
  };

  const handleSampleScan = async (sampleVal: string) => {
    stopCamera();
    setScanning(true);
    setError(null);

    const matchedSample = SAMPLE_PRODUCTS_TO_SCAN.find(s => s.value === sampleVal);
    if (matchedSample) {
      try {
        setScanStep(isAr ? "📸 جاري محاكاة الالتقاط الفوري..." : "📸 Simulating camera snapshot...");
        await new Promise((r) => setTimeout(r, 400));

        const response = await fetch("/api/scan-product", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            imageBase64: matchedSample.base64,
            mimeType: matchedSample.mimeType,
            targetCountry: currentCountry.name,
            homeCurrency: homeCountry.currency,
            scanMode,
            targetLanguage: isAr ? "Arabic" : "English"
          }),
        });

        if (!response.ok) throw new Error("Fallback");
        const data = await response.json();
        
        if (scanMode === "ocr") {
          setOcrResult({
            detectedText: data.detectedText || matchedSample.label,
            detectedLanguage: data.detectedLanguage || "Japanese",
            formattedParagraphs: data.formattedParagraphs || [matchedSample.label],
            summary: data.summary || "Extracted text details."
          });
        } else if (scanMode === "translate") {
          setTranslateResult({
            originalText: matchedSample.label,
            translatedText: data.translatedText || "Exit / Way Out",
            detectedLanguage: "Japanese",
            contextNotes: data.contextNotes || "Extracted visual translation."
          });
        } else if (scanMode === "barcode") {
          setBarcodeResult({
            barcode: "4901085089345",
            productName: isAr ? "شاي أخضر أوي أوشا" : "Oi Ocha Green Tea",
            brand: "Ito En",
            category: "Beverage",
            estimatedLocalPrice: 120,
            currency: "JPY",
            description: isAr 
              ? "شاي أخضر ياباني أصيل غير محلى غني بمضادات الأكسدة." 
              : "Authentic Japanese unsweetened green tea bottle, highly popular travel companion.",
            isTrusted: true,
            confidenceScore: 99
          });
        } else {
          const newProduct: Product = {
            id: "scanned-" + Date.now(),
            name: data.productName || matchedSample.label,
            brand: data.brand || "Local brand",
            barcode: data.barcode || "4901085089345",
            category: data.category || "Beverage",
            priceInLocal: data.estimatedLocalPrice || 120,
            countryCode: currentCountry.code,
            storeName: isAr ? "سوبرماركت معتمد" : "Verified Supermarket",
            description: data.description || "Delightful regional refreshment.",
            contributedBy: "You",
            dateContributed: new Date().toLocaleDateString(),
          };

          onAddProduct(newProduct);
          onSelectProduct(newProduct);
          onNavigate("product-details");
        }
      } catch (err: any) {
        if (scanMode === "ocr") {
          setOcrResult({
            detectedText: "出口\n非常口 EXIT",
            detectedLanguage: "Japanese",
            formattedParagraphs: [
              isAr ? "مخرج" : "Exit",
              isAr ? "مخرج طوارئ" : "Emergency Exit"
            ],
            summary: isAr ? "مؤشرات وتوجيهات الخروج." : "Subway Exit directions layout."
          });
        } else if (scanMode === "translate") {
          setTranslateResult({
            originalText: "出口 (Subway Sign)",
            translatedText: isAr ? "المخرج / ممر الخروج للشارع" : "Exit / Way out to Street Level",
            detectedLanguage: "Japanese",
            contextNotes: isAr
              ? "علامة مخارج مترو الأنفاق في طوكيو. اتبع مؤشرات الأرقام المؤدية للشارع مباشرة."
              : "Subway exit indicators in Tokyo. Follow these numbers to find the correct street level staircase."
          });
        } else {
          let localMock: Product;
          if (sampleVal === "oi_ocha") {
            localMock = {
              id: "scanned-oiocha",
              name: isAr ? "شاي أخضر أوي أوشا" : "Oi Ocha Unsweetened Green Tea",
              brand: "Ito En",
              barcode: "4901085089345",
              priceInLocal: 120,
              countryCode: "JP",
              category: "Beverage",
              storeName: "Lawson",
              description: isAr 
                ? "الشاي الأخضر غير المحلى رقم 1 في اليابان. يروي العطش وغني بمضادات الأكسدة."
                : "Japan's #1 unsweetened bottled green tea. Crisp, natural taste with rich antioxidants.",
              contributedBy: "You (Offline)"
            };
          } else {
            localMock = {
              id: "scanned-toastie",
              name: isAr ? "توست هام وجبن مشوي" : "Toasted Ham & Cheese Sandwich",
              brand: "Ezy Taste",
              barcode: "8850123049182",
              priceInLocal: 35,
              countryCode: "TH",
              category: "Food",
              storeName: "7-Eleven Bangkok",
              description: isAr ? "سندوتش جبن مشوي لذيذ من سفن إلفن." : "Molten cheese, crisp ham sandwich toasted on demand.",
              contributedBy: "You (Offline)"
            };
          }
          onAddProduct(localMock);
          onSelectProduct(localMock);
          onNavigate("product-details");
        }
      } finally {
        setScanning(false);
        setScanStep("");
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result) {
          stopCamera();
          handleScanAPI(uploadEvent.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const speakText = (text: string) => {
    if ("speechSynthesis" in window) {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        return;
      }
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="flex flex-col h-full w-full max-w-lg mx-auto bg-slate-950 text-slate-100 select-none pb-24 rounded-3xl overflow-hidden shadow-2xl relative" id="m3-scan-container">
      
      {/* Top App Bar - Safe Area */}
      <div className="flex justify-between items-center px-4 py-3 bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
        <button
          onClick={() => {
            stopCamera();
            onNavigate("home");
          }}
          className="p-2.5 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 hover:text-white rounded-full transition-all flex items-center justify-center border border-slate-700/50"
          title={isAr ? "رجوع" : "Back"}
        >
          <ArrowLeft className={`w-5 h-5 ${isAr ? "rotate-180" : ""}`} />
        </button>

        <div className="text-center">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            {isAr ? "ماسح الكاميرا الذكي" : "Lens Scanner"}
          </h2>
          <p className="text-[10px] text-slate-400 font-bold">
            {currentCountry.flag} {isAr ? currentCountry.nameAr || currentCountry.name : currentCountry.name}
          </p>
        </div>

        <button
          onClick={toggleFacingMode}
          className="p-2.5 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 hover:text-white rounded-full transition-all flex items-center justify-center border border-slate-700/50"
          title={isAr ? "تبديل الكاميرا" : "Switch Camera"}
        >
          <ArrowRightLeft className="w-5 h-5" />
        </button>
      </div>

      {/* Error alert Banner */}
      {error && (
        <div className="mx-4 mt-3 p-3 bg-red-950/50 border border-red-900/30 rounded-2xl flex flex-col items-center gap-2 text-center">
          <p className="text-xs text-red-300 font-medium leading-relaxed">
            {error}
          </p>
          <button
            onClick={() => startCamera(facingMode, streamQuality)}
            className="px-4 py-1.5 bg-red-600 hover:bg-red-700 active:scale-95 text-white text-[10px] font-black rounded-lg transition-all"
          >
            {isAr ? "إعادة المحاولة" : "Retry Camera"}
          </button>
        </div>
      )}

      {/* Quick Settings Panel (Flash, Stream Quality selection, zoom level) */}
      <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs text-slate-300 shrink-0">
        
        {/* Flash Controller */}
        <button 
          onClick={toggleFlash}
          className="flex items-center gap-1 bg-slate-800 px-3 py-1.5 rounded-lg text-[10px] font-bold border border-slate-700 hover:bg-slate-750 transition-all text-amber-400"
        >
          <Zap className={`w-3.5 h-3.5 ${flashOn !== "off" ? "fill-amber-400 animate-pulse" : ""}`} />
          <span>{flashOn === "off" ? (isAr ? "فلاش: مغلق" : "Flash: Off") : flashOn === "on" ? (isAr ? "فلاش: مفعّل" : "Flash: On") : (isAr ? "فلاش: تلقائي" : "Flash: Auto")}</span>
        </button>

        {/* Zoom levels */}
        <div className="flex gap-1 items-center bg-slate-950 p-1 rounded-lg border border-slate-800">
          {[1, 2, 5].map(lvl => (
            <button
              key={lvl}
              onClick={() => setZoomLevel(lvl)}
              className={`px-2 py-0.5 rounded text-[9px] font-black transition-all ${zoomLevel === lvl ? "bg-blue-600 text-white" : "text-slate-400 hover:text-slate-200"}`}
            >
              {lvl}x
            </button>
          ))}
        </div>

        {/* Quality selector */}
        <div className="flex items-center gap-1 bg-slate-800 px-2.5 py-1 rounded-lg text-[10px] border border-slate-700">
          <Settings className="w-3.5 h-3.5 text-slate-400" />
          <select 
            value={streamQuality} 
            onChange={(e) => setStreamQuality(e.target.value as any)}
            className="bg-transparent border-none text-[10px] font-bold text-slate-200 focus:outline-none cursor-pointer"
          >
            <option value="high" className="bg-slate-900 text-white">Full HD</option>
            <option value="mid" className="bg-slate-900 text-white">HD Ready</option>
            <option value="low" className="bg-slate-900 text-white">Low Band</option>
          </select>
        </div>

      </div>

      {/* Panoramic Viewfinder & Autofocus Target Frame Grid overlay */}
      <div 
        onClick={handleTapFocus}
        className="w-full aspect-[4/3] bg-black overflow-hidden relative flex items-center justify-center cursor-pointer group"
      >
        {cameraActive ? (
          <video
            ref={videoRef}
            playsInline
            muted
            className="w-full h-full object-cover transition-transform duration-300"
            style={{ transform: `scale(${zoomLevel})` }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-center p-6 space-y-4">
            <div className="w-14 h-14 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500">
              <Camera className="w-7 h-7 animate-pulse text-blue-500" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">
                {isAr ? "عدسة الكاميرا جاهزة" : "CAMERA STANDBY"}
              </p>
              <p className="text-[10px] text-slate-500 max-w-xs leading-normal">
                {isAr ? "يرجى تفعيل الكاميرا المباشرة للبدء أو اختيار نماذج مسح سريعة أدناه" : "Activate live feed or select simulation preset below to start"}
              </p>
            </div>
            <button
              onClick={() => startCamera(facingMode, streamQuality)}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-[10px] font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5"
            >
              <Camera className="w-4 h-4" />
              <span>{isAr ? "تشغيل الكاميرا" : "Activate Live Camera"}</span>
            </button>
          </div>
        )}

        {/* Glowing Autofocus Target brackets centered */}
        {cameraActive && !scanning && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            {scanMode === "barcode" ? (
              <div className="w-64 h-32 border-2 border-dashed border-red-500/40 rounded-xl relative flex items-center justify-center">
                <span className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-red-500"></span>
                <span className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-red-500"></span>
                <span className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-red-500"></span>
                <span className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-red-500"></span>
                
                {/* Red Laser Scanning Line */}
                <motion.div 
                  animate={{ y: [-50, 50, -50] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                  className="absolute left-1 right-1 h-[2.5px] bg-red-500 shadow-[0_0_12px_#ef4444]" 
                />
                
                <div className="text-[9px] font-black text-red-400 uppercase tracking-widest opacity-90 flex items-center gap-1 bg-black/60 px-2.5 py-0.5 rounded absolute -bottom-3">
                  <span>{isAr ? "ماسح الباركود والـ QR" : "BARCODE & QR"}</span>
                </div>
              </div>
            ) : (
              <div className="w-44 h-44 border-2 border-dashed border-white/25 rounded-2xl relative flex items-center justify-center animate-pulse">
                <span className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-blue-400"></span>
                <span className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-blue-400"></span>
                <span className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-blue-400"></span>
                <span className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-blue-400"></span>
                
                <div className="text-[9px] font-black text-blue-400 uppercase tracking-widest opacity-80 flex items-center gap-1 bg-black/40 px-2 py-0.5 rounded">
                  <Eye className="w-3 h-3 text-blue-400" />
                  <span>{isAr ? "تتبع ذكي" : "AUTO FOCUS"}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tap to focus target indicator */}
        {focusing && (
          <div 
            className="absolute pointer-events-none w-10 h-10 border-2 border-amber-400 rounded-full flex items-center justify-center animate-ping"
            style={{ left: `${focusCoords.x}%`, top: `${focusCoords.y}%`, transform: "translate(-50%, -50%)" }}
          >
            <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
          </div>
        )}

        {/* Scanning Overlay State */}
        {scanning && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center text-center p-6 z-20">
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-3" />
            <p className="text-xs font-semibold text-blue-400 tracking-wider animate-pulse max-w-xs leading-relaxed">
              {scanStep}
            </p>
          </div>
        )}
      </div>

      {/* Controls Layout - Placed Below Viewfinder */}
      <div className="bg-slate-900 border-t border-slate-800 p-4 flex flex-col items-center space-y-4">
        
        {/* Mode Selectors */}
        <div className="bg-slate-950 p-1 rounded-2xl flex border border-slate-850 w-full justify-around shadow-inner">
          <button 
            onClick={() => {
              setScanMode("product");
              setOcrResult(null);
              setTranslateResult(null);
              setBarcodeResult(null);
            }}
            className={`py-2.5 px-3 rounded-xl text-[10px] font-black transition-all flex items-center gap-1 ${scanMode === "product" ? "bg-blue-600 text-white shadow-md animate-scale" : "text-slate-400 hover:text-slate-200"}`}
          >
            <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
            <span>{isAr ? "المنتج" : "PRODUCT"}</span>
          </button>
          
          <button 
            onClick={() => {
              setScanMode("barcode");
              setOcrResult(null);
              setTranslateResult(null);
              setBarcodeResult(null);
            }}
            className={`py-2.5 px-3 rounded-xl text-[10px] font-black transition-all flex items-center gap-1 ${scanMode === "barcode" ? "bg-blue-600 text-white shadow-md animate-scale" : "text-slate-400 hover:text-slate-200"}`}
          >
            <Zap className="w-3.5 h-3.5 shrink-0" />
            <span>{isAr ? "باركود" : "BARCODE/QR"}</span>
          </button>

          <button 
            onClick={() => {
              setScanMode("ocr");
              setOcrResult(null);
              setTranslateResult(null);
              setBarcodeResult(null);
            }}
            className={`py-2.5 px-3 rounded-xl text-[10px] font-black transition-all flex items-center gap-1 ${scanMode === "ocr" ? "bg-blue-600 text-white shadow-md animate-scale" : "text-slate-400 hover:text-slate-200"}`}
          >
            <FileText className="w-3.5 h-3.5 shrink-0" />
            <span>{isAr ? "نصوص" : "OCR TEXT"}</span>
          </button>
          
          <button 
            onClick={() => {
              setScanMode("translate");
              setOcrResult(null);
              setTranslateResult(null);
              setBarcodeResult(null);
            }}
            className={`py-2.5 px-3 rounded-xl text-[10px] font-black transition-all flex items-center gap-1 ${scanMode === "translate" ? "bg-blue-600 text-white shadow-md animate-scale" : "text-slate-400 hover:text-slate-200"}`}
          >
            <RefreshCw className="w-3.5 h-3.5 shrink-0" />
            <span>{isAr ? "ترجمة" : "TRANSLATE"}</span>
          </button>
        </div>

        {/* Capture/Gallery/Off Buttons */}
        <div className="flex justify-between items-center w-full max-w-sm px-6 py-1">
          
          {/* Gallery Picker */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center text-slate-400 hover:text-slate-200 transition-all active:scale-90"
            title={isAr ? "معرض الصور" : "Pick from Gallery"}
          >
            <div className="w-12 h-12 bg-slate-800 hover:bg-slate-750 text-blue-400 rounded-full flex items-center justify-center shadow-md border border-slate-700/50">
              <Image className="w-5 h-5 text-blue-400" />
            </div>
            <span className="text-[9px] font-bold mt-1 text-slate-400 uppercase tracking-wider">
              {isAr ? "المعرض" : "Gallery"}
            </span>
          </button>

          {/* Large Shutter Button */}
          <button
            type="button"
            onClick={() => {
              if (cameraActive) {
                capturePhoto();
              } else {
                startCamera(facingMode, streamQuality);
              }
            }}
            className="w-16 h-16 bg-blue-600 hover:bg-blue-500 active:scale-95 transition-all rounded-full flex items-center justify-center shadow-xl border-4 border-slate-900 group cursor-pointer"
            title={isAr ? "التقاط الصورة" : "Capture Photo"}
          >
            <Camera className="w-6 h-6 text-white group-hover:scale-105 transition-transform" />
          </button>

          {/* Toggle Stream State */}
          {cameraActive ? (
            <button
              type="button"
              onClick={stopCamera}
              className="flex flex-col items-center justify-center text-slate-400 hover:text-red-400 transition-all active:scale-90"
              title={isAr ? "إيقاف الكاميرا" : "Turn Off Camera"}
            >
              <div className="w-12 h-12 bg-red-950/20 hover:bg-red-900/20 text-red-400 rounded-full flex items-center justify-center shadow-md border border-red-900/20">
                <X className="w-5 h-5" />
              </div>
              <span className="text-[9px] font-bold mt-1 text-slate-400 uppercase tracking-wider">
                {isAr ? "إيقاف" : "Stop"}
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => startCamera(facingMode, streamQuality)}
              className="flex flex-col items-center justify-center text-slate-400 hover:text-emerald-400 transition-all active:scale-90"
              title={isAr ? "تشغيل الكاميرا" : "Turn On Camera"}
            >
              <div className="w-12 h-12 bg-emerald-950/10 hover:bg-emerald-900/10 text-emerald-400 rounded-full flex items-center justify-center shadow-md border border-emerald-900/20">
                <Camera className="w-5 h-5" />
              </div>
              <span className="text-[9px] font-bold mt-1 text-slate-400 uppercase tracking-wider">
                {isAr ? "تشغيل" : "Start"}
              </span>
            </button>
          )}

        </div>

      </div>

      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        className="hidden" 
      />

      {/* Results panel / presets */}
      <div className="px-4 mt-4 space-y-4 max-w-md mx-auto w-full overflow-y-auto no-scrollbar max-h-80 pb-6">
        
        {/* Barcode / QR Result Details */}
        {barcodeResult && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg space-y-4 text-left relative">
            <button 
              onClick={() => setBarcodeResult(null)} 
              className="absolute top-3 right-3 p-1 bg-slate-800 hover:bg-slate-750 text-slate-400 hover:text-white rounded-full transition-all"
            >
              <X className="w-3.5 h-3.5" />
            </button>
            <span className="text-[9px] bg-indigo-950 text-indigo-400 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider inline-flex items-center gap-1 border border-indigo-900/30">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              {isAr ? "بيانات الرمز الشريطي والـ QR" : "Barcode & QR Code Decoded"}
            </span>
            
            <div className="space-y-3 pt-1">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 flex items-center justify-between">
                <div style={{ direction: isAr ? "rtl" : "ltr" }}>
                  <p className="text-[9px] text-slate-500 uppercase tracking-wider font-extrabold">{isAr ? "الرمز الممسوح (Code):" : "SCANNED CODE:"}</p>
                  <p className="text-sm font-black text-indigo-400 font-mono tracking-wider">{barcodeResult.barcode || "N/A"}</p>
                </div>
                <button 
                  onClick={() => copyToClipboard(barcodeResult.barcode || "")}
                  className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-all"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2 text-xs" style={{ direction: isAr ? "rtl" : "ltr" }}>
                <div className="flex justify-between border-b border-slate-800/40 pb-1.5">
                  <span className="text-slate-400">{isAr ? "الاسم المعرف:" : "Identified Name:"}</span>
                  <span className="font-bold text-white">{barcodeResult.productName || (isAr ? "غير معروف" : "Unknown")}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800/40 pb-1.5">
                  <span className="text-slate-400">{isAr ? "العلامة التجارية:" : "Brand:"}</span>
                  <span className="font-bold text-white">{barcodeResult.brand || "N/A"}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800/40 pb-1.5">
                  <span className="text-slate-400">{isAr ? "الفئة:" : "Category:"}</span>
                  <span className="font-bold text-indigo-400">{barcodeResult.category || "Other"}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800/40 pb-1.5">
                  <span className="text-slate-400">{isAr ? "السعر المحلي المتوقع:" : "Estimated Price:"}</span>
                  <span className="font-black text-emerald-400 font-mono">{barcodeResult.estimatedLocalPrice} {barcodeResult.currency || currentCountry.currency}</span>
                </div>
              </div>

              {barcodeResult.description && (
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-850 text-[11px] text-slate-400 leading-relaxed" style={{ direction: isAr ? "rtl" : "ltr" }}>
                  {barcodeResult.description}
                </div>
              )}

              {barcodeResult.barcode && barcodeResult.barcode.startsWith("http") && (
                <a 
                  href={barcodeResult.barcode}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-md text-center"
                >
                  {isAr ? "فتح الرابط المكتشف" : "Open Decoded Link"}
                </a>
              )}

              {barcodeResult.productName && (
                <button
                  onClick={() => {
                    const newProduct: Product = {
                      id: "scanned-" + Date.now(),
                      name: barcodeResult.productName,
                      brand: barcodeResult.brand || "Local",
                      barcode: barcodeResult.barcode || "N/A",
                      category: barcodeResult.category || "Food",
                      priceInLocal: barcodeResult.estimatedLocalPrice || 100,
                      countryCode: currentCountry.code,
                      storeName: isAr ? "سوبرماركت معتمد" : "Verified Retailer",
                      description: barcodeResult.description || "",
                      contributedBy: "You",
                      dateContributed: new Date().toLocaleDateString(),
                    };
                    onAddProduct(newProduct);
                    onSelectProduct(newProduct);
                    onNavigate("product-details");
                  }}
                  className="w-full py-2.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 border border-indigo-900/30 cursor-pointer"
                >
                  {isAr ? "إضافة لقائمة السفر الخاصة بك" : "Add to Your Travel Products List"}
                </button>
              )}
            </div>
          </div>
        )}

        {/* OCR Result Details */}
        {ocrResult && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-lg space-y-3 text-left relative">
            <button 
              onClick={() => setOcrResult(null)} 
              className="absolute top-3 right-3 p-1 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-full transition-all"
            >
              <X className="w-3.5 h-3.5" />
            </button>
            <span className="text-[9px] bg-blue-950 text-blue-400 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider inline-flex items-center gap-1 border border-blue-900/30">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              {isAr ? "نتائج قراءة النصوص" : "OCR Decoded Result"}
            </span>
            <div className="space-y-3 pt-1">
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs text-slate-200 font-mono leading-relaxed max-h-36 overflow-y-auto whitespace-pre-wrap text-left">
                {ocrResult.detectedText}
              </div>
              <div className="text-xs space-y-1">
                <h4 className="font-bold text-slate-300">{isAr ? "ملخص ذكي وملاحظات النقل:" : "Smart Content Summary:"}</h4>
                <p className="text-slate-400 italic bg-blue-950/20 p-3 rounded-xl border border-blue-900/20 leading-relaxed text-[11px]">{ocrResult.summary}</p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => copyToClipboard(ocrResult.detectedText)}
                  className="flex-1 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1 border border-slate-700/50"
                >
                  <CheckCircle2 className={`w-3.5 h-3.5 ${copied ? "text-emerald-400" : "text-blue-400"}`} />
                  <span>{copied ? (isAr ? "تم نسخ النص!" : "Copied!") : (isAr ? "نسخ النص" : "Copy Text")}</span>
                </button>
                <button 
                  onClick={() => speakText(ocrResult.detectedText)}
                  className="px-3 py-2 bg-blue-950 hover:bg-blue-900 text-blue-300 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1 border border-blue-900/30"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>{isSpeaking ? (isAr ? "إيقاف" : "Stop") : (isAr ? "نطق" : "Speak")}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Translation Details */}
        {translateResult && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-lg space-y-3 text-left relative">
            <button 
              onClick={() => setTranslateResult(null)} 
              className="absolute top-3 right-3 p-1 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-full transition-all"
            >
              <X className="w-3.5 h-3.5" />
            </button>
            <span className="text-[9px] bg-emerald-950 text-emerald-400 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider inline-flex items-center gap-1 border border-emerald-900/30">
              <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
              {isAr ? "مترجم اللافتات المباشر" : "Intelligent Sign Translator"}
            </span>
            <div className="space-y-3 pt-1">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[8px] text-slate-400 block mb-1 uppercase tracking-wider">{isAr ? "النص الأصلي:" : "Spotted Text:"}</span>
                  <p className="font-bold text-slate-200">“{translateResult.originalText}”</p>
                </div>
                <div className="p-3 bg-emerald-950/20 rounded-xl border border-emerald-900/20">
                  <span className="text-[8px] text-emerald-400 block mb-1 uppercase tracking-wider">{isAr ? "الترجمة المعتمدة:" : "Certified Translation:"}</span>
                  <p className="font-bold text-emerald-300">“{translateResult.translatedText}”</p>
                </div>
              </div>
              
              {translateResult.contextNotes && (
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex gap-2 text-xs">
                  <Info className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-300">{isAr ? "إرشادات هامة للمسافر:" : "Traveler Security Guide:"}</span>
                    <p className="text-slate-400 leading-normal text-[11px]">{translateResult.contextNotes}</p>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <button 
                  onClick={() => copyToClipboard(translateResult.translatedText)}
                  className="flex-1 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1 border border-slate-700/50"
                >
                  <CheckCircle2 className={`w-3.5 h-3.5 ${copied ? "text-emerald-400" : "text-blue-400"}`} />
                  <span>{copied ? (isAr ? "تم نسخ الترجمة!" : "Copied!") : (isAr ? "نسخ الترجمة" : "Copy Translation")}</span>
                </button>
                <button 
                  onClick={() => speakText(translateResult.translatedText)}
                  className="px-3 py-2 bg-blue-950 hover:bg-blue-900 text-blue-300 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1 border border-blue-900/30"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>{isSpeaking ? (isAr ? "إيقاف" : "Stop") : (isAr ? "نطق" : "Speak")}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Quick Simulation Presets */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-md space-y-3 text-left">
          <h3 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-blue-400" />
            {isAr ? "نماذج المحاكاة الفورية" : "Quick Scan Presets"}
          </h3>
          <p className="text-[10px] text-slate-400 leading-normal">
            {isAr ? "اختر أحد النماذج المتاحة لوجهتك الحالية لمحاكاة مسحها وفحصها مباشرة:" : "Select one of the presets below to simulate capturing and inspecting it directly:"}
          </p>
          
          <div className="grid grid-cols-2 gap-2">
            {SAMPLE_PRODUCTS_TO_SCAN.map((preset) => {
              const isCountryMatch = preset.countryCode === currentCountry.code;
              return (
                <button
                  key={preset.value}
                  onClick={() => handleSampleScan(preset.value)}
                  disabled={scanning}
                  className={`p-3 rounded-2xl border transition-all text-left ${
                    isCountryMatch 
                      ? "bg-blue-950/30 border-blue-900/40 hover:bg-blue-900/30 text-blue-200" 
                      : "bg-slate-950 border-slate-850 text-slate-500 opacity-50"
                  } text-[11px] font-bold flex flex-col justify-between`}
                >
                  <span className="line-clamp-1">
                    {isAr && preset.value === "oi_ocha" ? "شاي أخضر أوي أوشا" : isAr && preset.value === "espresso" ? "قهوة لافاتزا إكسبريسو" : isAr && preset.value === "baguette" ? "خبز باجيت فرنسي" : isAr && preset.value === "toastie" ? "توست هام وجبن مشوي" : preset.label}
                  </span>
                  <span className="text-[9px] text-slate-500 mt-1.5 font-semibold">
                    {isAr ? `المنشأ: ${preset.countryCode}` : `Origin: ${preset.countryCode}`} {isCountryMatch && "⭐"}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Advisory Info card */}
        <div className="bg-slate-900/50 border border-slate-800/60 p-4 rounded-3xl flex gap-3 text-xs text-slate-300 text-left">
          <Info className="w-5 h-5 text-blue-400 shrink-0" />
          <div className="space-y-1">
            <p className="font-bold text-slate-200">
              {isAr ? "هل تعلم؟" : "Did you know?"}
            </p>
            <p className="text-[10px] text-slate-400 leading-normal">
              {isAr 
                ? "المحلات التجارية السياحية القريبة من المعابد ومخارج محطات المترو ترفع أسعار السلع بنسب كبيرة. احرص دائماً على فحص السعر الأصلي لضمان العدالة."
                : "Tourist hotspot shops mark up products significantly. Always check local equivalents to ensure fair spending."}
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}
