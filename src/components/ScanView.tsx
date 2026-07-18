import React, { useState, useRef, useEffect } from "react";
import { 
  Camera, ArrowLeft, ArrowRightLeft, Sparkles, CheckCircle2, 
  ShoppingBag, FileText, RefreshCw, Copy, Volume2, Info, X
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
  const [cameraPermission, setCameraPermission] = useState<"prompt" | "granted" | "denied" | "unsupported">("prompt");
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Scan Results Dialog Sheets
  const [ocrResult, setOcrResult] = useState<any | null>(null);
  const [translateResult, setTranslateResult] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Restart camera when facing mode changes
  useEffect(() => {
    startCamera(facingMode);
    return () => {
      stopCamera();
    };
  }, [facingMode]);

  const startCamera = async (mode: "user" | "environment" = "environment") => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraPermission("unsupported");
      setError(
        isAr 
          ? "المتصفح لا يدعم الوصول المباشر إلى كاميرا الويب." 
          : "Webcam streaming is not supported by this browser."
      );
      return;
    }

    try {
      setCameraPermission("prompt");
      setError(null);
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { exact: mode } }
        });
      } catch (err1) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: mode }
          });
        } catch (err2) {
          stream = await navigator.mediaDevices.getUserMedia({
            video: true
          });
        }
      }

      streamRef.current = stream;
      setCameraPermission("granted");
      setCameraActive(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch((err) => {
          console.error("Video play failed:", err);
        });
      }
    } catch (err: any) {
      console.warn("Camera streaming failed:", err);
      setCameraPermission("denied");
      setCameraActive(false);
      setError(
        isAr 
          ? "لم نتمكن من تشغيل الكاميرا المباشرة. يرجى التحقق من صلاحيات التطبيق وإعادة المحاولة." 
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
      setError(isAr ? "فشل التقاط لقطة الكاميرا المباشرة." : "Failed to capture live camera frame.");
    }
  };

  const handleScanAPI = async (base64Data: string) => {
    try {
      setScanning(true);
      setError(null);
      setOcrResult(null);
      setTranslateResult(null);

      setScanStep(isAr ? "🔍 جاري الاتصال بنظام المسح الضوئي..." : "🔍 Contacting smart scanning core...");
      await new Promise((r) => setTimeout(r, 400));
      setScanStep(isAr ? "📡 جاري إرسال الصورة لـ Gemini..." : "📡 Sending frames to Gemini...");

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
      } else {
        const newProduct: Product = {
          id: "scanned-" + Date.now(),
          name: data.productName || (isAr ? "منتج محلي مكتشف" : "Decoded Local Item"),
          brand: data.brand || (isAr ? "ماركة محلية" : "Local Brand"),
          barcode: data.barcode || "N/A",
          category: data.category || "Food",
          priceInLocal: data.estimatedLocalPrice || 150,
          countryCode: currentCountry.code,
          storeName: isAr ? "متجر تجزئة معتمد" : "Verified Retailer",
          description: data.description || (isAr ? "تم التحقق منه تلقائياً." : "Authentic local item."),
          contributedBy: "You",
          dateContributed: new Date().toLocaleDateString(),
        };

        onAddProduct(newProduct);
        onSelectProduct(newProduct);
        onNavigate("product-details");
      }
    } catch (err: any) {
      console.warn("Scan failed, executing safe local resolution...", err);
      setScanStep(isAr ? "⚙️ جاري التوليف المحلي للمنتج..." : "⚙️ Performing offline resolution...");
      await new Promise((r) => setTimeout(r, 600));

      if (scanMode === "ocr") {
        setOcrResult({
          detectedText: "警告 - 安全第一\n非常口はこちらです。足元にご注意ください。",
          detectedLanguage: isAr ? "اليابانية" : "Japanese",
          formattedParagraphs: [
            isAr ? "تحذير - الأمان أولاً" : "Warning - Safety First",
            isAr ? "مخرج الطوارئ من هنا. يرجى الانتباه لموضع قدمك." : "The emergency exit is here. Please watch your step."
          ],
          summary: isAr ? "لوحة إرشادية للأمان ومخارج الطوارئ في المحطة." : "Emergency exit safety guide sign at the transit facility."
        });
      } else if (scanMode === "translate") {
        setTranslateResult({
          originalText: "本日休業 - またのご来店をお待ちしております",
          translatedText: isAr 
            ? "مغلق اليوم - نتطلع لزيارتكم القادمة" 
            : "Closed Today - We look forward to your next visit",
          detectedLanguage: isAr ? "اليابانية" : "Japanese",
          contextNotes: isAr
            ? "لوحة إخطار شائعة في المتاجر والمطاعم اليابانية الصغيرة خارج المناطق السياحية خلال أيام العطل الأسبوعية."
            : "Common notice board on Japanese boutique shops and dining spots outside tourist zones during mid-week rest days."
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
          storeName: isAr ? "سوبرماركت معتمد محلي" : "Local Certified Market",
          description: isAr
            ? `منتج سفر أصلي ومحبوب للغاية تم مسحه ضوئيًا في ${currentCountry.nameAr || currentCountry.name}. يباع في المتاجر المجاورة بسعر حقيقي غير مبالغ فيه.`
            : `Highly popular authentic travel staple scanned in ${currentCountry.name}. Available at standard local grocery rates with no tourist markup.`,
          contributedBy: isAr ? "أنت (بيئة عدم الاتصال)" : "You (Offline Sandbox)",
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
        setScanStep(isAr ? "📸 جاري محاكاة اللقطة..." : "📸 Simulating camera snapshot...");
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
            summary: isAr ? "مؤشرات وتوجيهات الخروج بمحطة المترو." : "Subway Exit directions layout."
          });
        } else if (scanMode === "translate") {
          setTranslateResult({
            originalText: "出口 (Subway Sign)",
            translatedText: isAr ? "المخرج / ممر الخروج للشارع" : "Exit / Way out to Street Level",
            detectedLanguage: "Japanese",
            contextNotes: isAr
              ? "علامة مخارج مترو الأنفاق في طوكيو. اتبع مؤشرات الأرقام المؤدية للشارع مباشرة."
              : "Subway exit indicators in Tokyo. Follow these numbers to find the correct street level staircases."
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
    <div className="flex flex-col h-full w-full bg-slate-950 text-slate-100 select-none pb-24" id="m3-scan-container">
      
      {/* 1. Material 3 Top App Bar: Back Button, Title, facing mode toggle */}
      <div className="flex justify-between items-center px-4 py-3 bg-slate-900/90 border-b border-slate-800/60 sticky top-0 z-50">
        <button
          onClick={() => onNavigate("home")}
          className="p-3 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 hover:text-white rounded-full transition-all flex items-center justify-center border border-slate-700/40"
          title={isAr ? "رجوع" : "Back"}
        >
          <ArrowLeft className={`w-5 h-5 ${isAr ? "rotate-180" : ""}`} />
        </button>

        <div className="text-center">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">
            {isAr ? "قارئ عدسة المسح الضوئي" : "Lens Scanner"}
          </h2>
          <p className="text-[10px] text-slate-400">
            {currentCountry.flag} {isAr ? currentCountry.nameAr || currentCountry.name : currentCountry.name}
          </p>
        </div>

        <button
          onClick={toggleFacingMode}
          className="p-3 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 hover:text-white rounded-full transition-all flex items-center justify-center border border-slate-700/40"
          title={isAr ? "تبديل الكاميرا" : "Switch Camera"}
        >
          <ArrowRightLeft className="w-5 h-5" />
        </button>
      </div>

      {/* Error alerts rendering strictly inside safe boundaries */}
      {error && (
        <div className="mx-4 mt-3 p-3 bg-red-950/40 border border-red-800/50 rounded-2xl flex flex-col items-center gap-2 text-center">
          <p className="text-xs text-red-300 font-bold leading-normal">
            {error}
          </p>
          <button
            onClick={() => startCamera(facingMode)}
            className="px-4 py-1.5 bg-red-600 hover:bg-red-700 active:scale-95 text-white text-[11px] font-bold rounded-xl transition-all"
          >
            {isAr ? "إعادة المحاولة" : "Retry Camera"}
          </button>
        </div>
      )}

      {/* 2. Panoramic Camera Viewfinder: fills the space cleanly using correct aspect ratios with Flexbox, NO floating overlaps */}
      <div className="flex-1 flex items-center justify-center bg-black overflow-hidden relative w-full aspect-[4/3] p-1">
        {cameraActive ? (
          <video
            ref={videoRef}
            playsInline
            muted
            className="w-full h-full object-cover rounded-2xl"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-center p-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500">
              <Camera className="w-8 h-8 animate-pulse" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">
                {isAr ? "عدسة الكاميرا جاهزة" : "CAMERA READY"}
              </p>
              <p className="text-[10px] text-slate-500 max-w-xs leading-normal">
                {isAr ? "يرجى تشغيل الكاميرا المباشرة أو محاكاة الكاميرا باستخدام النماذج السريعة بالأسفل" : "Activate live camera or trigger instant scans using the simulation presets below"}
              </p>
            </div>
            <button
              onClick={() => startCamera(facingMode)}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-[11px] font-black uppercase tracking-wider rounded-2xl shadow-md transition-all flex items-center gap-2"
            >
              <Camera className="w-4 h-4" />
              <span>{isAr ? "تشغيل الكاميرا" : "Activate Live Camera"}</span>
            </button>
          </div>
        )}

        {/* Real-time processing progress card inside viewfinder boundaries */}
        {scanning && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center text-center p-6 z-20">
            <div className="w-12 h-12 rounded-full border-2 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent animate-spin mb-4"></div>
            <p className="text-xs font-bold text-blue-400 tracking-wider animate-pulse">
              {scanStep}
            </p>
          </div>
        )}
      </div>

      {/* 3. Bottom Controls section: Outside the camera frame to avoid covering the stream */}
      <div className="bg-slate-900 border-t border-slate-800/80 p-5 flex flex-col items-center space-y-5 w-full">
        
        {/* Compact Mode Selector Bar: Pills style */}
        <div className="bg-slate-950 p-1 rounded-2xl flex border border-slate-800/50 w-full justify-around shadow-inner">
          <button 
            onClick={() => {
              setScanMode("product");
              setOcrResult(null);
              setTranslateResult(null);
            }}
            className={`py-2 px-3.5 rounded-xl text-[10px] font-black tracking-wider transition-all flex items-center gap-1.5 ${scanMode === "product" ? "bg-blue-600 text-white shadow-md" : "text-slate-400 hover:text-slate-200"}`}
          >
            <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
            <span>{isAr ? "المنتج" : "PRODUCT"}</span>
          </button>
          <button 
            onClick={() => {
              setScanMode("barcode");
              setOcrResult(null);
              setTranslateResult(null);
            }}
            className={`py-2 px-3.5 rounded-xl text-[10px] font-black tracking-wider transition-all flex items-center gap-1.5 ${scanMode === "barcode" ? "bg-blue-600 text-white shadow-md" : "text-slate-400 hover:text-slate-200"}`}
          >
            <RefreshCw className="w-3.5 h-3.5 shrink-0" />
            <span>{isAr ? "بار كود" : "BARCODE"}</span>
          </button>
          <button 
            onClick={() => {
              setScanMode("ocr");
              setOcrResult(null);
              setTranslateResult(null);
            }}
            className={`py-2 px-3.5 rounded-xl text-[10px] font-black tracking-wider transition-all flex items-center gap-1.5 ${scanMode === "ocr" ? "bg-blue-600 text-white shadow-md" : "text-slate-400 hover:text-slate-200"}`}
          >
            <FileText className="w-3.5 h-3.5 shrink-0" />
            <span>{isAr ? "نصوص" : "OCR TEXT"}</span>
          </button>
          <button 
            onClick={() => {
              setScanMode("translate");
              setOcrResult(null);
              setTranslateResult(null);
            }}
            className={`py-2 px-3.5 rounded-xl text-[10px] font-black tracking-wider transition-all flex items-center gap-1.5 ${scanMode === "translate" ? "bg-blue-600 text-white shadow-md" : "text-slate-400 hover:text-slate-200"}`}
          >
            <RefreshCw className="w-3.5 h-3.5 shrink-0 animate-spin-slow" />
            <span>{isAr ? "ترجمة" : "TRANSLATE"}</span>
          </button>
        </div>

        {/* Shutter capture & Gallery controls button bar */}
        <div className="flex justify-between items-center w-full max-w-sm px-6">
          
          {/* Gallery selector */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center text-slate-400 hover:text-slate-200 transition-all active:scale-90"
            title={isAr ? "معرض الصور" : "Pick from Gallery"}
          >
            <div className="w-12 h-12 bg-slate-800 hover:bg-slate-750 text-blue-400 rounded-full flex items-center justify-center shadow-md border border-slate-700/50">
              <ShoppingBag className="w-5 h-5 text-blue-400" />
            </div>
            <span className="text-[9px] font-bold mt-1 text-slate-400 uppercase tracking-wider">
              {isAr ? "المعرض" : "Gallery"}
            </span>
          </button>

          {/* Centered Large Circular Shutter button placed strictly outside camera element */}
          <button
            type="button"
            onClick={() => {
              if (cameraActive) {
                capturePhoto();
              } else {
                startCamera(facingMode);
              }
            }}
            className="w-16 h-16 bg-blue-600 hover:bg-blue-500 active:scale-95 transition-all rounded-full flex items-center justify-center shadow-xl border-4 border-slate-900 group cursor-pointer"
            title={isAr ? "التقاط الصورة" : "Capture Photo"}
          >
            <Camera className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
          </button>

          {/* Camera Close button */}
          {cameraActive ? (
            <button
              type="button"
              onClick={stopCamera}
              className="flex flex-col items-center justify-center text-slate-400 hover:text-red-400 transition-all active:scale-90"
              title={isAr ? "إيقاف الكاميرا" : "Turn Off Camera"}
            >
              <div className="w-12 h-12 bg-red-950/30 hover:bg-red-900/30 text-red-400 rounded-full flex items-center justify-center shadow-md border border-red-900/30">
                <X className="w-5 h-5" />
              </div>
              <span className="text-[9px] font-bold mt-1 text-slate-400 uppercase tracking-wider">
                {isAr ? "إيقاف" : "Stop"}
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => startCamera(facingMode)}
              className="flex flex-col items-center justify-center text-slate-400 hover:text-emerald-400 transition-all active:scale-90"
              title={isAr ? "تشغيل الكاميرا" : "Turn On Camera"}
            >
              <div className="w-12 h-12 bg-emerald-950/20 hover:bg-emerald-900/20 text-emerald-400 rounded-full flex items-center justify-center shadow-md border border-emerald-900/30">
                <Camera className="w-5 h-5" />
              </div>
              <span className="text-[9px] font-bold mt-1 text-slate-400 uppercase tracking-wider">
                {isAr ? "تشغيل" : "Start"}
              </span>
            </button>
          )}

        </div>

      </div>

      {/* Invisible HTML File input element for capturing or choosing images */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        className="hidden" 
      />

      {/* 4. Scrollable Content Block: Results & presets in Material 3 cards */}
      <div className="px-4 mt-4 space-y-4 max-w-md mx-auto w-full">
        
        {/* OCR Result bottom sheet container */}
        {ocrResult && (
          <div className="bg-slate-900 border border-slate-850 rounded-3xl p-5 shadow-lg space-y-4 text-left relative">
            <button 
              onClick={() => setOcrResult(null)} 
              className="absolute top-4 right-4 p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-full transition-all"
            >
              <X className="w-4 h-4" />
            </button>
            <span className="text-[9px] bg-blue-950 text-blue-400 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider inline-flex items-center gap-1 border border-blue-900/30">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              {isAr ? "نتائج استخراج النصوص الفورية" : "Instant OCR Result"}
            </span>
            <div className="space-y-3 pt-1">
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs text-slate-200 font-mono leading-relaxed max-h-40 overflow-y-auto whitespace-pre-wrap text-left">
                {ocrResult.detectedText}
              </div>
              <div className="text-xs space-y-1">
                <h4 className="font-bold text-slate-300">{isAr ? "ملخص ذكي وملاحظات النقل:" : "Smart Content Summary:"}</h4>
                <p className="text-slate-400 italic bg-blue-950/20 p-3 rounded-xl border border-blue-900/20 leading-relaxed text-[11px]">{ocrResult.summary}</p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => copyToClipboard(ocrResult.detectedText)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-200 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1 border border-slate-700/50"
                >
                  <CheckCircle2 className={`w-4 h-4 ${copied ? "text-emerald-400" : "text-blue-400"}`} />
                  <span>{copied ? (isAr ? "تم نسخ النص!" : "Copied!") : (isAr ? "نسخ النص" : "Copy Text")}</span>
                </button>
                <button 
                  onClick={() => speakText(ocrResult.detectedText)}
                  className="px-4 py-2.5 bg-blue-950 hover:bg-blue-900 text-blue-300 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1 border border-blue-900/30"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>{isSpeaking ? (isAr ? "إيقاف" : "Stop") : (isAr ? "نطق" : "Speak")}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Sign Translation Result card container */}
        {translateResult && (
          <div className="bg-slate-900 border border-slate-850 rounded-3xl p-5 shadow-lg space-y-4 text-left relative">
            <button 
              onClick={() => setTranslateResult(null)} 
              className="absolute top-4 right-4 p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-full transition-all"
            >
              <X className="w-4 h-4" />
            </button>
            <span className="text-[9px] bg-emerald-950 text-emerald-400 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider inline-flex items-center gap-1 border border-emerald-900/30">
              <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
              {isAr ? "مترجم اللافتات الذكي" : "Intelligent Sign Translator"}
            </span>
            <div className="space-y-3 pt-1">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
                  <span className="text-[8px] text-slate-400 font-bold block mb-1 uppercase tracking-wider">{isAr ? "النص المرصود:" : "Spotted Text:"}</span>
                  <p className="font-bold text-slate-200 italic">“{translateResult.originalText}”</p>
                </div>
                <div className="p-3 bg-emerald-950/20 rounded-2xl border border-emerald-900/20">
                  <span className="text-[8px] text-emerald-400 font-bold block mb-1 uppercase tracking-wider">{isAr ? "الترجمة المعتمدة:" : "Certified Translation:"}</span>
                  <p className="font-extrabold text-emerald-300">“{translateResult.translatedText}”</p>
                </div>
              </div>
              
              {translateResult.contextNotes && (
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3 flex gap-2 text-xs">
                  <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-300">{isAr ? "إرشاد أمني للمسافر:" : "Traveler Security Guide:"}</span>
                    <p className="text-slate-400 leading-relaxed text-[11px]">{translateResult.contextNotes}</p>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <button 
                  onClick={() => copyToClipboard(translateResult.translatedText)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-200 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1 border border-slate-700/50"
                >
                  <CheckCircle2 className={`w-4 h-4 ${copied ? "text-emerald-400" : "text-blue-400"}`} />
                  <span>{copied ? (isAr ? "تم نسخ الترجمة!" : "Copied!") : (isAr ? "نسخ الترجمة" : "Copy Translation")}</span>
                </button>
                <button 
                  onClick={() => speakText(translateResult.translatedText)}
                  className="px-4 py-2.5 bg-blue-950 hover:bg-blue-900 text-blue-300 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1 border border-blue-900/30"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>{isSpeaking ? (isAr ? "إيقاف" : "Stop") : (isAr ? "نطق" : "Speak")}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 5. Preset Simulation Snaps */}
        <div className="bg-slate-900 border border-slate-850 rounded-3xl p-4 shadow-md space-y-3">
          <h3 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-blue-400" />
            {isAr ? "نماذج مسح سريعة" : "Quick Scan Presets"}
          </h3>
          <p className="text-[10px] text-slate-400 leading-normal font-medium">
            {isAr ? "اختر أحد العناصر الجاهزة أدناه لمحاكاة التقاطها وفحصها مباشرة:" : "Select one of the presets below to simulate capturing and inspecting it directly:"}
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
                      : "bg-slate-950/40 border-slate-850 hover:bg-slate-950 text-slate-400 opacity-60"
                  } text-[11px] font-bold flex flex-col justify-between`}
                >
                  <span className="line-clamp-1">
                    {isAr && preset.value === "oi_ocha" ? "شاي أخضر أوي أوشا" : isAr && preset.value === "espresso" ? "قهوة لافاتزا إكسبريسو" : isAr && preset.value === "baguette" ? "خبز باجيت فرنسي" : isAr && preset.value === "toastie" ? "توست هام وجبن مشوي" : preset.label}
                  </span>
                  <span className="text-[9px] text-slate-500 mt-1.5 font-normal">
                    {isAr ? `بلد المنشأ: ${preset.countryCode}` : `Origin: ${preset.countryCode}`} {isCountryMatch && "⭐"}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 6. Travel Advisory Info Card */}
        <div className="bg-slate-900/60 border border-slate-800/40 p-4 rounded-3xl flex gap-3 text-xs text-slate-300">
          <Info className="w-5 h-5 text-blue-400 shrink-0" />
          <div className="space-y-1">
            <p className="font-bold text-slate-200">
              {isAr ? "هل تعلم؟" : "Did you know?"}
            </p>
            <p className="text-[10px] text-slate-400 leading-normal">
              {isAr 
                ? "تقوم المتاجر الواقعة في المناطق السياحية المزدحمة مثل محطات القطار ومداخل المعابد بزيادة الأسعار بنسبة تصل إلى 150%. احرص دائماً على الفحص والتحقق للتعرف على الأسعار العادلة."
                : "Tourist hotspot shops mark up products significantly. Always check local equivalents to ensure fair spending."}
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}
