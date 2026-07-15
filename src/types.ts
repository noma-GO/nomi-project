export interface Country {
  code: string; // e.g. "JP", "IT", "FR", "TH", "MX"
  name: string; // e.g. "Japan", "Italy", "France", "Thailand", "Mexico"
  flag: string; // e.g. "🇯🇵", "🇮🇹", "🇫🇷", "🇹🇭", "🇲🇽"
  currency: string; // e.g. "JPY", "EUR", "EUR", "THB", "MXN"
  currencySymbol: string; // e.g. "¥", "€", "€", "฿", "$"
  exchangeRateToUSD: number; // e.g. 150 (means 1 USD = 150 JPY)
}

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

export type ActiveScreen = 
  | "home" 
  | "scan" 
  | "product-details" 
  | "add-price" 
  | "translate" 
  | "explore" 
  | "profile" 
  | "settings";
