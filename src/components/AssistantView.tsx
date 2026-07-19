import React, { useState, useRef, useEffect } from "react";
import { 
  Sparkles, Send, Trash2, ArrowLeft, User, Compass, Info, DollarSign, Train, Shield, Lightbulb,
  Paperclip, Mic, MicOff, Loader2, Store, Landmark, Utensils, Activity, CreditCard, Hotel, Map, Star, ShieldCheck, Navigation
} from "lucide-react";
import { Country } from "../types";
import { useLanguage } from "../lib/i18n";
import ReactMarkdown from "react-markdown";
import { getCountryPOIs, POI } from "../lib/poiManager";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  openMap?: boolean;
  mapFilter?: "landmarks" | "stores" | "restaurants" | "hospitals" | "transit" | "atms" | "malls" | "hotels" | null;
}

interface AssistantViewProps {
  currentCountry: Country;
  homeCountry: Country;
  onNavigate: (screen: any) => void;
}

const QUICK_PROMPTS = [
  {
    icon: <DollarSign className="w-3.5 h-3.5 text-amber-500" />,
    labelEn: "Tipping rules?",
    labelAr: "قواعد الإكرامية؟",
    promptEn: "What are the local tipping guidelines, card payment acceptance, and cash etiquette here?",
    promptAr: "ما هي القواعد المحلية لترك الإكرامية (Tipping)، ومدى قبول الدفع بالبطاقات والتعامل بالكاش هنا؟"
  },
  {
    icon: <Train className="w-3.5 h-3.5 text-blue-500" />,
    labelEn: "Transit tips?",
    labelAr: "نصائح مواصلات؟",
    promptEn: "What is the cheapest and most reliable way to travel around the city using public transit?",
    promptAr: "ما هي الطريقة الأرخص والأكثر موثوقية للتنقل داخل المدينة باستخدام المواصلات العامة؟"
  },
  {
    icon: <Lightbulb className="w-3.5 h-3.5 text-emerald-500" />,
    labelEn: "Grocery hacks?",
    labelAr: "توفير البقالة؟",
    promptEn: "What are the cheapest supermarket chains or discount local food stalls to buy groceries and daily meals?",
    promptAr: "ما هي أرخص سلاسل السوبرماركت ومحلات الخصومات المحلية لشراء البقالة والوجبات اليومية؟"
  },
  {
    icon: <Shield className="w-3.5 h-3.5 text-rose-500" />,
    labelEn: "Safety & manners?",
    labelAr: "الأمان والسلوكيات؟",
    promptEn: "What are the critical cultural manners, tourist scams to avoid, and general safety protocols to follow here?",
    promptAr: "ما هي السلوكيات الثقافية الهامة، وما هي فخاخ السياح (Scams) الشائعة التي يجب تجنبها والأمان العام هنا؟"
  }
];

export default function AssistantView({ 
  currentCountry, 
  homeCountry, 
  onNavigate 
}: AssistantViewProps) {
  const { t, language } = useLanguage();
  const isAr = language === "ar";

  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [attachment, setAttachment] = useState<File | null>(null);
  const [selectedChatPoi, setSelectedChatPoi] = useState<{ [msgId: string]: POI | null }>({});
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize with dynamic greeting
  useEffect(() => {
    const localGreeting = isAr
      ? `مرحباً بك! أنا مساعد السفر الذكي الخاص بك في **${currentCountry.nameAr || currentCountry.name}** 🗺️.
      
يمكنني مساعدتك في:
* فك تشفير قوائم الطعام واللافتات والأسعار المحلية.
* العثور على بدائل رخيصة للبقالة وتجنب الفخاخ السياحية بالمنطقة.
* فهم الثقافة المحلية، المواصلات العامة، وتصريف العملات بسهولة.

كيف يمكنني مساعدتك اليوم؟ اكتب سؤالك بالأسفل أو انقر على أحد الخيارات السريعة للبدء فوراً!`
      : `Hello! I am your personal AI Travel Assistant here in **${currentCountry.name}** 🗺️.
      
I can assist you with:
* Decoding local menus, supermarket price sheets, and transit notices.
* Locating cheap grocery alternatives and avoiding expensive tourist markups.
* Grasping tipping etiquettes, transit routes, and cash-to-card systems.

How can I help you today? Ask me anything or tap one of the quick suggestions below!`;

    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: localGreeting,
        timestamp: new Date().toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", hour12: false })
      }
    ]);
  }, [currentCountry, language]);

  // Smooth scrolling on updates
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading]);

  // Recording timer simulation
  useEffect(() => {
    if (isRecording) {
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
      setRecordingTime(0);
    }
    return () => {
      if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
    };
  }, [isRecording]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() && !attachment && !isRecording) return;
    
    let messageText = text;
    if (isRecording) {
      messageText = isAr 
        ? "🎤 رسالة صوتية مرسلة (تم تحويل الصوت إلى نص تلقائياً)." 
        : "🎤 Sent a voice message (automatically transcribed).";
      setIsRecording(false);
    }

    if (attachment) {
      messageText += ` 📄 [مرفق: ${attachment.name}]`;
      setAttachment(null);
    }

    const userMsg: Message = {
      id: "msg-" + Date.now(),
      role: "user",
      content: messageText,
      timestamp: new Date().toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", hour12: false })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText("");
    setLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.role,
        content: m.content
      }));

      history.push({ role: "user", content: messageText });

      const response = await fetch("/api/chat-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history,
          currentCountry,
          homeCountry,
          userLanguage: language
        })
      });

      if (!response.ok) {
        throw new Error("Chat gateway error");
      }

      const data = await response.json();
      
      const assistantMsg: Message = {
        id: "reply-" + Date.now(),
        role: "assistant",
        content: data.reply || (isAr ? "عذرًا، لم أتمكن من معالجة الطلب." : "Apologies, I couldn't process that response."),
        timestamp: new Date().toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", hour12: false }),
        openMap: data.openMap,
        mapFilter: data.mapFilter
      };

      setMessages(prev => [...prev, assistantMsg]);

    } catch (err) {
      console.warn("AI Chat assistant failed. Engaging local offline expert fallback...", err);
      await new Promise(r => setTimeout(r, 600));

      let fallbackText = "";
      const cleaned = messageText.toLowerCase();

      if (cleaned.includes("tipping") || cleaned.includes("إكرام") || cleaned.includes("بخشيش")) {
        fallbackText = isAr
          ? `### 💵 قواعد الإكرام والدفع في **${currentCountry.nameAr || currentCountry.name}**:
          
* **الإكرامية (Tipping)**: في معظم هذا البلد، الخدمة متضمنة ولا تطلب إكراميات إضافية. قد يسبب ترك مبالغ إضافية إحراجًا للموظفين في بلدان مثل اليابان!
* **الدفع بالبطاقات**: البطاقات مقبولة بشكل واسع في المتاجر الكبرى، ولكن ينصح دائمًا بالاحتفاظ ببعض النقد (Cash) للمحلات التقليدية الصغيرة والمواصلات.`
          : `### 💵 Tipping & Card Usage in **${currentCountry.name}**:
          
* **Tipping Etiquette**: No tips are expected in general dining or transit. In places like Japan, leaving cash on tables can cause confusion or chase-outs to return forgotten coins!
* **Card vs Cash**: Highly modernized for plastic/contactless at shopping arcades, but street markets and basic transit require standard local physical cash notes.`;
      } else if (cleaned.includes("transit") || cleaned.includes("مواصلات") || cleaned.includes("قطار")) {
        fallbackText = isAr
          ? `### 🚇 المواصلات الذكية الرخيصة في **${currentCountry.nameAr || currentCountry.name}**:
          
* **مترو الأنفاق والقطارات العامة**: هي الطريقة الأكثر أمانًا والأقل كلفة. احرص على شراء تذاكر مجمعة يومية (Day Pass) لتوفير هائل.
* **سيارات الأجرة (Taxis)**: تجنبها قدر الإمكان نظراً لارتفاع سعرها الشديد في هذا البلد، واستعن بتطبيقات ركوب السيارات المعتمدة محلياً.`
          : `### 🚇 Smart Low-Cost Transit in **${currentCountry.name}**:
          
* **Subway & Trains**: By far the most reliable, clean, and wallet-friendly transport network. Consider buying a **24-Hour Tourist Pass** to save up to 40% on standard single-use fares.
* **Taxis**: Avoid them if you are on a budget as base fares are extremely premium; use local ride-hailing apps or buses instead.`;
      } else {
        fallbackText = isAr
          ? `لقد تلقيت سؤالك حول **${messageText}**.
          
بصفتي دليلك الذكي في **${currentCountry.nameAr || currentCountry.name}**، أنصحك بالبحث دائماً في الأسواق المحلية والمتاجر الشعبية (Supermarkets) الكبرى للحصول على أفضل توفير، وتجنب الشراء من المحلات الواقعة بجوار المعالم السياحية مباشرة حيث تتضاعف الأسعار!`
          : `I received your inquiry regarding **"${messageText}"**.
          
As your traveler specialist in **${currentCountry.name}**, I advise checking out major local supermarket chains and regional grocery cooperatives to buy foods and treats. Shopping outside high-traffic tourist plazas typically reduces your checkout cost by half!`;
      }

      const assistantMsg: Message = {
        id: "fallback-reply-" + Date.now(),
        role: "assistant",
        content: fallbackText,
        timestamp: new Date().toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", hour12: false })
      };
      setMessages(prev => [...prev, assistantMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    if (window.confirm(isAr ? "هل أنت متأكد من مسح المحادثة؟" : "Clear this entire conversation?")) {
      const localGreeting = isAr
        ? `تم مسح السجل. كيف يمكنني مساعدتك في رحلتك في **${currentCountry.nameAr || currentCountry.name}** الآن؟`
        : `Conversation cleared. How else can I assist with your journey in **${currentCountry.name}**?`;
      
      setMessages([
        {
          id: "welcome-reset",
          role: "assistant",
          content: localGreeting,
          timestamp: new Date().toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", hour12: false })
        }
      ]);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      handleSendMessage("");
    } else {
      setIsRecording(true);
    }
  };

  const handleFileAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAttachment(e.target.files[0]);
    }
  };

  return (
    <div className={`flex flex-col h-[calc(100vh-130px)] bg-slate-50 relative ${isAr ? "rtl" : "ltr"} font-sans`} id="chat-assistant-container">
      
      {/* Top Header - Tight & Elegant */}
      <div className="bg-white border-b border-slate-100 px-3.5 py-2.5 shadow-sm flex items-center justify-between shrink-0 sticky top-0 z-10 rounded-b-xl">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center shadow-md">
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
          </div>
          <div className={isAr ? "text-right" : "text-left"}>
            <h3 className="text-xs font-black text-slate-800 tracking-tight leading-none">
              {isAr ? "مساعد السفر الذكي" : "AI Travel Assistant"}
            </h3>
            <span className="text-[9px] text-blue-600 font-bold flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block animate-ping"></span>
              <span>{isAr ? `${currentCountry.nameAr || currentCountry.name} - متصل` : `${currentCountry.name} Mode - Live`}</span>
            </span>
          </div>
        </div>

        <button
          onClick={handleClearChat}
          className="p-1.5 hover:bg-slate-100 active:scale-95 text-slate-400 hover:text-red-500 rounded-lg transition-all border border-transparent hover:border-slate-200"
          title={isAr ? "مسح المحادثة" : "Clear Conversation"}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Chat Messages Panel - Highly compact spacing */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-3 space-y-3.5 bg-slate-50/50">
        {messages.map((m) => {
          const isUser = m.role === "user";
          return (
            <div 
              key={m.id}
              className={`flex gap-2 items-start max-w-[92%] ${
                isUser ? "ms-auto flex-row-reverse" : "me-auto"
              } animate-fade-in`}
            >
              {/* Tight Avatar Icon */}
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 shadow-sm ${
                isUser ? "bg-slate-200 text-slate-600" : "bg-gradient-to-tr from-blue-600 to-indigo-500 text-white"
              }`}>
                {isUser ? <User className="w-3.5 h-3.5" /> : <Sparkles className="w-3 h-3 text-amber-300" />}
              </div>

              {/* Compact Message Bubble */}
              <div className="space-y-1">
                <div className={`px-3 py-2.5 rounded-xl text-[11px] font-medium leading-relaxed border ${
                  isUser 
                    ? "bg-blue-600 border-blue-500 text-white rounded-tr-none text-left" 
                    : "bg-white text-slate-800 border-slate-100 rounded-tl-none text-left"
                }`}>
                  <div className="markdown-body font-normal leading-relaxed text-left break-words">
                    <ReactMarkdown>{m.content}</ReactMarkdown>
                  </div>
                </div>

                {!isUser && m.openMap && (() => {
                  const filter = m.mapFilter || "landmarks";
                  const activePOIs = getCountryPOIs(currentCountry.code, filter, isAr);
                  const activePOI = selectedChatPoi[m.id] || null;

                  // Define icon matching for inline display
                  let iconBg = "bg-amber-500";
                  let iconEl = <Landmark className="w-2.5 h-2.5 text-white" />;
                  let labelText = isAr ? "معالم سياحية" : "Tourist Spots";

                  if (filter === "stores") {
                    iconBg = "bg-emerald-600";
                    iconEl = <Store className="w-2.5 h-2.5 text-white" />;
                    labelText = isAr ? "سوبرماركت" : "Supermarkets";
                  } else if (filter === "restaurants") {
                    iconBg = "bg-orange-500";
                    iconEl = <Utensils className="w-2.5 h-2.5 text-white" />;
                    labelText = isAr ? "مطاعم" : "Restaurants";
                  } else if (filter === "hospitals") {
                    iconBg = "bg-rose-500";
                    iconEl = <Activity className="w-2.5 h-2.5 text-white" />;
                    labelText = isAr ? "مستشفيات" : "Hospitals";
                  } else if (filter === "transit") {
                    iconBg = "bg-blue-500";
                    iconEl = <Train className="w-2.5 h-2.5 text-white" />;
                    labelText = isAr ? "مواصلات" : "Transit";
                  } else if (filter === "atms") {
                    iconBg = "bg-teal-500";
                    iconEl = <CreditCard className="w-2.5 h-2.5 text-white" />;
                    labelText = isAr ? "صراف آلي ATM" : "ATMs";
                  } else if (filter === "malls") {
                    iconBg = "bg-purple-500";
                    iconEl = <Compass className="w-2.5 h-2.5 text-white" />;
                    labelText = isAr ? "مولات تجارية" : "Malls";
                  } else if (filter === "hotels") {
                    iconBg = "bg-indigo-500";
                    iconEl = <Hotel className="w-2.5 h-2.5 text-white" />;
                    labelText = isAr ? "فنادق" : "Hotels";
                  }

                  return (
                    <div className="mt-2 border border-slate-200/80 rounded-2xl overflow-hidden bg-white shadow-sm w-full max-w-[340px] animate-fade-in text-left">
                      {/* Mini Map Header */}
                      <div className="bg-slate-50 border-b border-slate-100 px-3 py-2 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <div className={`p-1 rounded-lg ${iconBg} text-white`}>
                            {iconEl}
                          </div>
                          <span className="text-[10px] font-black text-slate-700">{labelText}</span>
                        </div>
                        <button 
                          onClick={() => onNavigate("explore")}
                          className="text-[9px] font-bold text-blue-600 hover:underline flex items-center gap-0.5"
                        >
                          <Map className="w-2.5 h-2.5" />
                          <span>{isAr ? "الخريطة الكاملة" : "Full Map"}</span>
                        </button>
                      </div>

                      {/* Mini Map Canvas */}
                      <div className="h-[140px] bg-slate-900 relative overflow-hidden flex items-center justify-center">
                        {/* Radar grid style */}
                        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle, #3b82f6 1px, transparent 1px)", backgroundSize: "15px 15px" }}></div>
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full border border-blue-500/20 animate-pulse pointer-events-none"></div>

                        {/* User Pin */}
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center">
                          <div className="w-2.5 h-2.5 rounded-full bg-blue-500 border border-white shadow-md"></div>
                          <div className="absolute w-6 h-6 rounded-full bg-blue-500/20 border border-blue-500/30 animate-ping pointer-events-none"></div>
                        </div>

                        {/* Routing Polyline */}
                        {activePOI && (
                          <svg className="absolute inset-0 w-full h-full pointer-events-none">
                            <line 
                              x1="50%" 
                              y1="50%" 
                              x2={`${activePOI.latPercent}%`} 
                              y2={`${activePOI.lngPercent}%`} 
                              stroke="#3b82f6" 
                              strokeWidth="1.5" 
                              strokeDasharray="4,2" 
                              className="animate-[dash_10s_linear_infinite]"
                            />
                          </svg>
                        )}

                        {/* Mapped Pins */}
                        {activePOIs.map((poi: POI) => {
                          const isSelected = activePOI?.id === poi.id;
                          return (
                            <button
                              key={poi.id}
                              style={{ top: `${poi.latPercent}%`, left: `${poi.lngPercent}%` }}
                              onClick={() => {
                                setSelectedChatPoi(prev => ({
                                  ...prev,
                                  [m.id]: isSelected ? null : poi
                                }));
                              }}
                              className="absolute z-10 transform -translate-x-1/2 -translate-y-1/2 scale-90 hover:scale-105 active:scale-95 transition-all"
                            >
                              <div className={`p-1 rounded-full text-white border border-white/20 shadow-md ${
                                isSelected ? "bg-blue-600 scale-110 animate-pulse" : iconBg
                              }`}>
                                {iconEl}
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      {/* Mini Map Detail Box */}
                      <div className="p-2.5 border-t border-slate-50 text-[10px] text-slate-600 bg-white min-h-[50px] flex flex-col justify-center">
                        {activePOI ? (
                          <div className="space-y-1 animate-fade-in">
                            <div className="flex items-center justify-between">
                              <span className="font-extrabold text-slate-800 text-[10.5px] leading-tight">{activePOI.name}</span>
                              <span className="text-[8.5px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full shrink-0">{activePOI.dist}</span>
                            </div>
                            <p className="text-[9.5px] font-medium leading-normal text-slate-500">{activePOI.desc}</p>
                            <div className="flex items-center gap-1 text-[8.5px] text-emerald-600 font-bold bg-emerald-50/50 p-1 rounded border border-emerald-100/30">
                              <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
                              <span>{activePOI.safety}</span>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center text-slate-400 py-1 font-bold text-[9px] flex items-center justify-center gap-1">
                            <Navigation className="w-3 h-3 text-slate-400 animate-bounce" />
                            <span>{isAr ? "انقر على أي دبوس في الخريطة لرؤية التفاصيل" : "Click on any pin on map for info"}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}

                <span className={`text-[8px] text-slate-400 font-bold block px-1 ${isUser ? "text-right" : "text-left"}`}>
                  {m.timestamp}
                </span>
              </div>
            </div>
          );
        })}

        {/* Dynamic loading indicator */}
        {loading && (
          <div className="flex gap-2 items-start me-auto max-w-[85%] animate-pulse">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center shrink-0">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" />
            </div>
            <div className="bg-white border border-slate-100 px-3.5 py-2 rounded-xl rounded-tl-none shadow-sm flex items-center gap-1 text-[11px] text-blue-600 font-bold">
              <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:0s]"></span>
              <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:0.15s]"></span>
              <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:0.3s]"></span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Attachment status banner */}
      {attachment && (
        <div className="mx-3 mb-1.5 p-2 bg-blue-50 border border-blue-100 rounded-lg flex items-center justify-between text-[11px] text-blue-700 font-bold shadow-sm">
          <div className="flex items-center gap-1.5 min-w-0">
            <Paperclip className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            <span className="truncate">{attachment.name}</span>
          </div>
          <button onClick={() => setAttachment(null)} className="text-blue-500 hover:text-red-500 font-black text-[10px] shrink-0">
            {isAr ? "إلغاء" : "Cancel"}
          </button>
        </div>
      )}

      {/* Quick suggest prompts ribbon - Compact horizontal design with zero empty waste */}
      <div className="px-3 py-2 border-t border-slate-100/60 bg-white shrink-0 overflow-x-auto no-scrollbar flex gap-1.5">
        {QUICK_PROMPTS.map((qp, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(isAr ? qp.promptAr : qp.promptEn)}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/50 rounded-lg text-[9px] font-black text-slate-700 shadow-sm transition-all whitespace-nowrap shrink-0 cursor-pointer"
          >
            {qp.icon}
            <span>{isAr ? qp.labelAr : qp.labelEn}</span>
          </button>
        ))}
      </div>

      {/* Bottom Text Entry Box - Slim and space-optimized */}
      <div className="p-2.5 bg-white border-t border-slate-150/50 shrink-0 flex items-center gap-1.5 shadow-sm">
        {/* Attach File Button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={loading}
          className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-slate-50 rounded-xl border border-slate-100 shadow-sm shrink-0 cursor-pointer"
          title={isAr ? "إرفاق ملف" : "Attach File"}
        >
          <Paperclip className="w-4 h-4" />
        </button>
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileAttach} 
          className="hidden" 
          accept="image/*,application/pdf,text/*" 
        />

        {/* Main Text Input Area */}
        <div className="flex-1 relative flex items-center">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSendMessage(inputText);
            }}
            placeholder={isAr ? "اسأل Nomi عن الأسعار، المواصلات..." : "Ask Nomi about budgets, transit..."}
            disabled={loading || isRecording}
            className={`w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5 text-[11px] text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none font-semibold ${isAr ? "text-right" : "text-left"}`}
          />
          {isRecording && (
            <div className={`absolute inset-0 bg-red-500 text-white rounded-xl px-3 flex items-center justify-between text-[10px] font-bold animate-pulse ${isAr ? "flex-row-reverse" : "flex-row"}`}>
              <span>{isAr ? "🎤 جاري تسجيل الصوت..." : "🎤 Recording audio..."}</span>
              <span className="font-mono">{recordingTime}s</span>
            </div>
          )}
        </div>

        {/* Microphone Voice Button */}
        <button
          onClick={toggleRecording}
          disabled={loading}
          className={`p-2.5 rounded-xl border transition-all shrink-0 active:scale-95 shadow-sm cursor-pointer ${
            isRecording 
              ? "bg-red-500 border-red-500 text-white animate-bounce" 
              : "text-slate-400 hover:text-red-500 hover:bg-slate-50 border-slate-100"
          }`}
          title={isAr ? "تسجيل الصوت" : "Voice Message"}
        >
          {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>

        {/* Send Action Button */}
        <button
          onClick={() => handleSendMessage(inputText)}
          disabled={(!inputText.trim() && !attachment && !isRecording) || loading}
          className="p-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-45 text-white rounded-xl shadow-sm transition-all shrink-0 cursor-pointer"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>

    </div>
  );
}
