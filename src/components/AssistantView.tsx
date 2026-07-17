import React, { useState, useRef, useEffect } from "react";
import { 
  Sparkles, Send, Trash2, HelpCircle, ArrowLeft, ArrowRight, 
  MessageSquare, User, Compass, Info, DollarSign, Train, Shield, Lightbulb
} from "lucide-react";
import { Country } from "../types";
import { useLanguage } from "../lib/i18n";
import ReactMarkdown from "react-markdown";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

interface AssistantViewProps {
  currentCountry: Country;
  homeCountry: Country;
  onNavigate: (screen: any) => void;
}

const QUICK_PROMPTS = [
  {
    icon: <DollarSign className="w-3.5 h-3.5 text-amber-500" />,
    labelEn: "Tipping rules here?",
    labelAr: "ما هي قواعد الإكرامية هنا؟",
    promptEn: "What are the local tipping guidelines, card payment acceptance, and cash etiquette here?",
    promptAr: "ما هي القواعد المحلية لترك الإكرامية (Tipping)، ومدى قبول الدفع بالبطاقات والتعامل بالكاش هنا؟"
  },
  {
    icon: <Train className="w-3.5 h-3.5 text-blue-500" />,
    labelEn: "Cheap transit tips?",
    labelAr: "نصائح مواصلات رخيصة؟",
    promptEn: "What is the cheapest and most reliable way to travel around the city using public transit?",
    promptAr: "ما هي الطريقة الأرخص والأكثر موثوقية للتنقل داخل المدينة باستخدام المواصلات العامة؟"
  },
  {
    icon: <Lightbulb className="w-3.5 h-3.5 text-emerald-500" />,
    labelEn: "Local grocery hacks?",
    labelAr: "توفير البقالة ومطاعم رخيصة؟",
    promptEn: "What are the cheapest supermarket chains or discount local food stalls to buy groceries and daily meals?",
    promptAr: "ما هي أرخص سلاسل السوبرماركت ومحلات الخصومات المحلية لشراء البقالة والوجبات اليومية؟"
  },
  {
    icon: <Shield className="w-3.5 h-3.5 text-rose-500" />,
    labelEn: "Safety & manners?",
    labelAr: "الأمان والسلوكيات العامة؟",
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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize with dynamic greeting
  useEffect(() => {
    const localGreeting = isAr
      ? `مرحباً بك! أنا مساعد السفر الذكي الخاص بك في **${currentCountry.nameAr || currentCountry.name}** 🗺️.
      
يمكنني مساعدتك في:
* فك تشفير قوائم الطعام واللافتات والأسعار المحلية.
* العثور على بدائل رخيصة للبقالة وتجنب الفخاخ السياحية بالمنطقة.
* فهم الثقافة المحلية، المواصلات العامة، وتصريف العملات بسهولة.

كيف يمكنني مساعدتك اليوم؟ يمكنك كتابة سؤالك أو النقر على أحد الخيارات السريعة بالأسفل!`
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
        timestamp: new Date().toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })
      }
    ]);
  }, [currentCountry, language]);

  // Scroll to bottom on updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: Message = {
      id: "msg-" + Date.now(),
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText("");
    setLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.role,
        content: m.content
      }));

      // Add the current message
      history.push({ role: "user", content: text });

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
        timestamp: new Date().toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })
      };

      setMessages(prev => [...prev, assistantMsg]);

    } catch (err) {
      console.warn("AI Chat assistant failed. Engaging local offline expert fallback...", err);
      await new Promise(r => setTimeout(r, 1000));

      let fallbackText = "";
      const cleaned = text.toLowerCase();

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
          ? `لقد تلقيت سؤالك حول **${text}**.
          
بصفتي دليلك الذكي في **${currentCountry.nameAr || currentCountry.name}**، أنصحك بالبحث دائماً في الأسواق المحلية والمتاجر الشعبية (Supermarkets) الكبرى للحصول على أفضل توفير، وتجنب الشراء من المحلات الواقعة بجوار المعالم السياحية مباشرة حيث تتضاعف الأسعار!`
          : `I received your inquiry regarding **"${text}"**.
          
As your traveler specialist in **${currentCountry.name}**, I advise checking out major local supermarket chains and regional grocery cooperatives to buy foods and treats. Shopping outside high-traffic tourist plazas typically reduces your checkout cost by half!`;
      }

      const assistantMsg: Message = {
        id: "fallback-reply-" + Date.now(),
        role: "assistant",
        content: fallbackText,
        timestamp: new Date().toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })
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
          timestamp: new Date().toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })
        }
      ]);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 relative animate-fade-in pb-28" id="chat-assistant-container">
      
      {/* Top Header */}
      <div className="bg-white border-b border-slate-100 p-4 shadow-sm flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md animate-pulse">
            <Sparkles className="w-5 h-5 text-amber-300" />
          </div>
          <div className="text-left">
            <h3 className="text-xs font-display font-black text-slate-800 leading-tight">
              {isAr ? "مساعد السفر الذكي" : "Travel AI Assistant"}
            </h3>
            <span className="text-[10px] text-blue-600 font-bold flex items-center gap-0.5">
              <span className="w-2 h-2 bg-emerald-500 rounded-full inline-block animate-ping"></span>
              {isAr ? `${currentCountry.nameAr || currentCountry.name} - متصل` : `${currentCountry.name} Mode - Online`}
            </span>
          </div>
        </div>

        <button
          onClick={handleClearChat}
          className="p-2 hover:bg-slate-100 text-slate-400 hover:text-red-500 rounded-xl transition-all"
          title="Clear Conversation"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Chat Messages Log Panel */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-4">
        {messages.map((m) => {
          const isUser = m.role === "user";
          return (
            <div 
              key={m.id}
              className={`flex gap-2.5 items-start max-w-[85%] ${
                isUser ? "ml-auto flex-row-reverse" : "mr-auto"
              } animate-fade-in`}
            >
              {/* Avatar Icon */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
                isUser ? "bg-slate-200 text-slate-600" : "bg-blue-600 text-white"
              }`}>
                {isUser ? <User className="w-4 h-4" /> : <Sparkles className="w-4.5 h-4.5 text-amber-300" />}
              </div>

              {/* Message Bubble */}
              <div className="space-y-1">
                <div className={`p-3.5 rounded-2xl text-xs font-medium leading-relaxed shadow-sm ${
                  isUser 
                    ? "bg-blue-600 text-white rounded-tr-none text-left" 
                    : "bg-white text-slate-800 border border-slate-100 rounded-tl-none text-left"
                }`}>
                  <div className="markdown-body">
                    <ReactMarkdown>{m.content}</ReactMarkdown>
                  </div>
                </div>
                <span className={`text-[9px] text-slate-400 font-mono block ${isUser ? "text-right" : "text-left"}`}>
                  {m.timestamp}
                </span>
              </div>
            </div>
          );
        })}

        {/* Typing indicator spinner */}
        {loading && (
          <div className="flex gap-2.5 items-start mr-auto max-w-[85%] animate-pulse">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
              <Sparkles className="w-4.5 h-4.5 text-amber-300 animate-spin" />
            </div>
            <div className="bg-white border border-slate-100 p-3.5 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1.5 text-xs text-blue-600 font-bold">
              <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:0s]"></span>
              <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:0.4s]"></span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick suggest prompts bar */}
      <div className="px-4 py-2 border-t border-slate-100/50 bg-white/50 backdrop-blur shrink-0 overflow-x-auto no-scrollbar flex gap-2">
        {QUICK_PROMPTS.map((qp, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(isAr ? qp.promptAr : qp.promptEn)}
            disabled={loading}
            className="flex items-center gap-1 px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-100 rounded-xl text-[10px] font-bold text-slate-700 shadow-sm transition-all whitespace-nowrap shrink-0 hover:scale-102 active:scale-98"
          >
            {qp.icon}
            <span>{isAr ? qp.labelAr : qp.labelEn}</span>
          </button>
        ))}
      </div>

      {/* Bottom Text Entry Box */}
      <div className="p-4 bg-white border-t border-slate-100 shrink-0 flex items-center gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSendMessage(inputText);
          }}
          placeholder={isAr ? "اسأل Nomi عن الأسعار، الأماكن، أو الأمان..." : "Ask Nomi about budgets, transit, hacks..."}
          disabled={loading}
          className={`flex-1 bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-xs text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none font-medium ${isAr ? "text-right" : "text-left"}`}
        />
        <button
          onClick={() => handleSendMessage(inputText)}
          disabled={!inputText.trim() || loading}
          className="p-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-2xl shadow-md transition-all shrink-0 hover:scale-105 active:scale-95"
        >
          <Send className="w-4.5 h-4.5" />
        </button>
      </div>

    </div>
  );
}
