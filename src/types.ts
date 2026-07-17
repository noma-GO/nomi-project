export interface Country {
  code: string; // e.g. "JP", "IT", "FR", "TH", "MX"
  name: string; // e.g. "Japan", "Italy", "France", "Thailand", "Mexico"
  flag: string; // e.g. "🇯🇵", "🇮🇹", "🇫🇷", "🇹🇭", "🇲🇽"
  currency: string; // e.g. "JPY", "EUR", "EUR", "THB", "MXN"
  currencySymbol: string; // e.g. "¥", "€", "€", "฿", "$"
  exchangeRateToUSD: number; // e.g. 150 (means 1 USD = 150 JPY)
  nameAr?: string; // Optional localized Arabic name
}

export interface CountryGuide {
  code: string;
  name: string;
  nameAr: string;
  flag: string;
  currency: string;
  currencySymbol: string;
  exchangeRateToUSD: number;
  languageName: string;
  commonWords: {
    word: string;
    meaning: string;
    pronunciation: string;
  }[];
  emergencyNumbers: {
    police: string;
    ambulance: string;
    fire: string;
    general: string;
  };
  visaInfo: string;
  weatherInfo: {
    spring: string;
    summer: string;
    autumn: string;
    winter: string;
  };
  vibe: {
    hygiene: string;
    tipping: string;
    tapWater: string;
    cardPayment: string;
    localVibe: string;
  };
  landmarks: {
    id: string;
    name: string;
    category: string;
    ticketPriceLocal: number;
    description: string;
    tips: string[];
    hours: string;
  }[];
  airports: {
    name: string;
    code: string;
    city: string;
    description: string;
  }[];
  hotels: {
    name: string;
    stars: number;
    priceTier: string;
    description: string;
    tips: string;
  }[];
  restaurants: {
    name: string;
    cuisine: string;
    specialty: string;
    priceTier: string;
    description: string;
  }[];
  transports: {
    type: string;
    cost: string;
    description: string;
    tips: string;
  }[];
  supermarkets?: {
    id: string;
    name: string;
    trustScore: number;
    priceTier: string;
    hours: string;
    specialty: string;
    description: string;
    reviews?: { author: string; rating: number; text: string }[];
  }[];
}

export type ActiveScreen = 
  | "home" 
  | "scan" 
  | "product-details" 
  | "add-price" 
  | "translate" 
  | "explore" 
  | "profile" 
  | "settings"
  | "assistant";

export interface Product {
  id: string;
  name: string;
  brand: string;
  barcode: string | null;
  category: "Food" | "Beverage" | "Essentials" | "Electronics" | "Other";
  priceInLocal: number;
  countryCode: string; // e.g. "JP"
  storeName: string;
  description: string;
  contributedBy?: string;
  dateContributed?: string;
}

export interface Supermarket {
  id: string;
  name: string;
  countryCode: string;
  logo: string;
  trustScore: number; // 0 - 100
  priceTier: "$" | "$$" | "$$$";
  isOpen: boolean;
  hours: string;
  specialty: string;
  description: string;
  reviews: {
    author: string;
    rating: number;
    text: string;
  }[];
}

export interface Attraction {
  id: string;
  name: string;
  countryCode: string;
  category: string;
  ticketPriceLocal: number;
  imagePrompt: string;
  tips: string[];
  description: string;
  hours: string;
}

export interface TranslationLog {
  id: string;
  originalText: string;
  translatedText: string;
  detectedLanguage: string;
  contextNotes?: string;
  timestamp: string;
}
