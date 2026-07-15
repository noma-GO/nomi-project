import { Country, Product, Supermarket, Attraction } from "./types";

export const COUNTRIES: Country[] = [
  {
    code: "JP",
    name: "Japan",
    flag: "🇯🇵",
    currency: "JPY",
    currencySymbol: "¥",
    exchangeRateToUSD: 150.0,
  },
  {
    code: "IT",
    name: "Italy",
    flag: "🇮🇹",
    currency: "EUR",
    currencySymbol: "€",
    exchangeRateToUSD: 0.92,
  },
  {
    code: "FR",
    name: "France",
    flag: "🇫🇷",
    currency: "EUR",
    currencySymbol: "€",
    exchangeRateToUSD: 0.92,
  },
  {
    code: "TH",
    name: "Thailand",
    flag: "🇹🇭",
    currency: "THB",
    currencySymbol: "฿",
    exchangeRateToUSD: 35.0,
  },
  {
    code: "MX",
    name: "Mexico",
    flag: "🇲🇽",
    currency: "MXN",
    currencySymbol: "$",
    exchangeRateToUSD: 17.5,
  },
];

export const INITIAL_PRODUCTS: Product[] = [
  // --- JAPAN ---
  {
    id: "jp-1",
    name: "Oi Ocha Green Tea (500ml)",
    brand: "Ito En",
    barcode: "4901085089345",
    category: "Beverage",
    priceInLocal: 120,
    countryCode: "JP",
    storeName: "Lawson",
    description: "Japan's #1 unsweetened bottled green tea. Refreshing, earthy, and contains zero calories. Best enjoyed cold from a convenience store fridge.",
  },
  {
    id: "jp-2",
    name: "Tuna Mayo Onigiri",
    brand: "7-Eleven Fresh",
    barcode: "2013485090123",
    category: "Food",
    priceInLocal: 150,
    countryCode: "JP",
    storeName: "7-Eleven",
    description: "Classic triangular rice ball wrapped in crispy nori seaweed, filled with savory tuna mayonnaise. Look for the numbering instructions to open the plastic wrap without tearing the seaweed!",
  },
  {
    id: "jp-3",
    name: "Pocky Chocolate Sticks",
    brand: "Glico",
    barcode: "4901005101784",
    category: "Food",
    priceInLocal: 180,
    countryCode: "JP",
    storeName: "FamilyMart",
    description: "Crispy pretzel biscuit sticks coated with rich, glossy milk chocolate. A staple snack that is loved by locals and travelers alike.",
  },
  {
    id: "jp-4",
    name: "Anessa Perfect UV Sunscreen (60ml)",
    brand: "Shiseido",
    barcode: "4901872083238",
    category: "Essentials",
    priceInLocal: 2800,
    countryCode: "JP",
    storeName: "Matsumoto Kiyoshi",
    description: "Premium high-grade sunscreen famous for its outstanding water and sweat resistance. Essential for hot Japanese summer days.",
  },
  {
    id: "jp-5",
    name: "Cup Noodle Original",
    brand: "Nissin",
    barcode: "4902105244760",
    category: "Food",
    priceInLocal: 220,
    countryCode: "JP",
    storeName: "Life Supermarket",
    description: "The instant ramen that started it all. Contains tasty freeze-dried shrimp, egg, pork, and green onions in a classic soy-based broth.",
  },

  // --- ITALY ---
  {
    id: "it-1",
    name: "Espresso Italiano (Pack of 3)",
    brand: "Lavazza Qualità Oro",
    barcode: "8000070020529",
    category: "Beverage",
    priceInLocal: 4.80,
    countryCode: "IT",
    storeName: "Conad",
    description: "Medium roast ground coffee blend with fruity and floral notes, perfect for traditional Italian moka pots.",
  },
  {
    id: "it-2",
    name: "Pocket Coffee Chocolates",
    brand: "Ferrero",
    barcode: "8000500147614",
    category: "Food",
    priceInLocal: 2.50,
    countryCode: "IT",
    storeName: "Coop",
    description: "Bite-sized dark chocolates filled with real liquid Italian espresso. Extremely popular for energy on long road trips.",
  },
  {
    id: "it-3",
    name: "Pasta Rummo Spaghetti No. 5 (500g)",
    brand: "Rummo",
    barcode: "8002044010056",
    category: "Food",
    priceInLocal: 1.45,
    countryCode: "IT",
    storeName: "Esselunga",
    description: "Premium bronze-die extruded pasta known for holding its shape and remaining perfectly 'al dente' even if slightly overcooked.",
  },
  {
    id: "it-4",
    name: "Mineral Water San Benedetto 1.5L",
    brand: "San Benedetto",
    barcode: "8001620005342",
    category: "Beverage",
    priceInLocal: 0.38,
    countryCode: "IT",
    storeName: "Eurospin",
    description: "Pure, mineral-rich spring water bottled in Veneto. Incredibly affordable and clean-tasting. Specify 'naturale' for still or 'frizzante' for sparkling.",
  },

  // --- FRANCE ---
  {
    id: "fr-1",
    name: "Traditional Baguette",
    brand: "Boulangerie Artisan",
    barcode: null,
    category: "Food",
    priceInLocal: 1.10,
    countryCode: "FR",
    storeName: "Local Boulangerie",
    description: "Classic French crusty bread. Legally regulated in France to ensure it contains only flour, yeast, salt, and water. Baked fresh daily.",
  },
  {
    id: "fr-2",
    name: "President Brie Cheese (200g)",
    brand: "Président",
    barcode: "3228020010025",
    category: "Food",
    priceInLocal: 2.80,
    countryCode: "FR",
    storeName: "Monoprix",
    description: "Soft, creamy cow's milk cheese with a characteristic white bloomy rind. Spread on a baguette slice for the ultimate simple French lunch.",
  },
  {
    id: "fr-3",
    name: "Metro Ticket T+ (Single)",
    brand: "RATP Paris",
    barcode: null,
    category: "Other",
    priceInLocal: 2.15,
    countryCode: "FR",
    storeName: "Metro Station Kiosk",
    description: "Single-ride transit ticket valid for the Paris Metro, RER trains within Zone 1, and buses. Best purchased in a digital pack to save money.",
  },
  {
    id: "fr-4",
    name: "Evian Natural Mineral Water (1L)",
    brand: "Evian",
    barcode: "3068320011559",
    category: "Beverage",
    priceInLocal: 0.95,
    countryCode: "FR",
    storeName: "Carrefour",
    description: "Sourced directly from the snow-capped French Alps. Contains balanced mineral properties and is famous globally.",
  },

  // --- THAILAND ---
  {
    id: "th-1",
    name: "Toasted Ham & Cheese Sandwich",
    brand: "Ezy Taste",
    barcode: "8850123049182",
    category: "Food",
    priceInLocal: 35,
    countryCode: "TH",
    storeName: "7-Eleven",
    description: "A legendary Thai 7-Eleven staple. The cashier toasts it in a sandwich press on the spot. Ultimate warm, crispy, cheesy budget snack.",
  },
  {
    id: "th-2",
    name: "ChaTraMue Thai Tea Mix (400g)",
    brand: "ChaTraMue",
    barcode: "8852134010029",
    category: "Beverage",
    priceInLocal: 85,
    countryCode: "TH",
    storeName: "Tops Supermarket",
    description: "The gold standard orange-colored Thai tea. Brew and mix with sweet condensed milk and ice to make delicious traditional iced milk tea.",
  },
  {
    id: "th-3",
    name: "Tiger Balm White Ointment (30g)",
    brand: "Tiger Balm",
    barcode: "8850029000100",
    category: "Essentials",
    priceInLocal: 75,
    countryCode: "TH",
    storeName: "Watsons Pharmacy",
    description: "A soothing herbal balm made of camphor and menthol. Travelers use it to instantly soothe mosquito bites, heat rash, and muscle aches.",
  },
  {
    id: "th-4",
    name: "Singha Beer Can (320ml)",
    brand: "Singha",
    barcode: "8851023010192",
    category: "Beverage",
    priceInLocal: 45,
    countryCode: "TH",
    storeName: "Big C Extra",
    description: "Full-bodied 5% ABV pale lager brewed in Thailand. Smooth, refreshing, and matches spicy street food perfectly.",
  },

  // --- MEXICO ---
  {
    id: "mx-1",
    name: "OXXO Fresh Tacos de Guisado",
    brand: "OXXO Fresh",
    barcode: null,
    category: "Food",
    priceInLocal: 30,
    countryCode: "MX",
    storeName: "OXXO",
    description: "Quick, tasty stews folded inside warm corn tortillas. Perfect for a rapid, authentic, and safe bite on a long travel day.",
  },
  {
    id: "mx-2",
    name: "Coca-Cola Sin Azúcar (600ml)",
    brand: "Coca-Cola",
    barcode: "7501055303753",
    category: "Beverage",
    priceInLocal: 17,
    countryCode: "MX",
    storeName: "Chedraui",
    description: "Sugar-free Mexican Coca-Cola bottled locally in glass or PET. Renowned for its clean, sparkling effervescence.",
  },
  {
    id: "mx-3",
    name: "Telcel Amigo SIM Card + 2GB",
    brand: "Telcel",
    barcode: "7501055102042",
    category: "Other",
    priceInLocal: 150,
    countryCode: "MX",
    storeName: "Telcel Store",
    description: "Local pre-paid SIM card pre-loaded with high-speed internet and free social media messaging. Extremely reliable coverage in Mexico.",
  },
];

export const SUPERMARKETS: Supermarket[] = [
  // --- JAPAN ---
  {
    id: "sm-jp-1",
    name: "7-Eleven Japan",
    countryCode: "JP",
    logo: "7-eleven",
    trustScore: 98,
    priceTier: "$",
    isOpen: true,
    hours: "Open 24 hours",
    specialty: "High-quality egg sandwiches, freshly fried karaage chicken, local ATM withdrawals with foreign debit cards.",
    description: "The peak of convenience store culture. Offers flawless hygiene, delicious instant bento boxes, parcel shipping, and extremely reliable ticketing terminals.",
    reviews: [
      { author: "Alex G.", rating: 5, text: "The egg salad sandos here lived up to all the internet hype! Incredibly soft bread." },
      { author: "Yuki S.", rating: 5, text: "Perfect ATM for foreigners. Clean restrooms in almost every location." },
    ],
  },
  {
    id: "sm-jp-2",
    name: "Life Supermarket",
    countryCode: "JP",
    logo: "grocery",
    trustScore: 94,
    priceTier: "$$",
    isOpen: true,
    hours: "09:00 - 22:00",
    specialty: "Premium sushi trays, local Japanese produce, fresh bakery, discount stickers at 8:00 PM.",
    description: "A beloved full-sized supermarket chain. Prices are substantially cheaper than convenience stores for fresh fruit, drinks, snacks, and bulk groceries.",
    reviews: [
      { author: "Sarah L.", rating: 4, text: "Go around 8:00 PM! They put 30% to 50% discount stickers on all sushi and bento boxes. Incredible deal!" },
    ],
  },

  // --- ITALY ---
  {
    id: "sm-it-1",
    name: "Coop Italia",
    countryCode: "IT",
    logo: "grocery",
    trustScore: 94,
    priceTier: "$$",
    isOpen: true,
    hours: "08:00 - 20:30",
    specialty: "Fresh local cheeses (Parmigiano-Reggiano, Mozzarella di Bufala), high-quality cold cuts, regional olive oil.",
    description: "One of Italy's largest consumer cooperatives. Very clean, ethically sourced items, and superb selections of organic Italian items.",
    reviews: [
      { author: "Marcus D.", rating: 5, text: "Amazing deli section. They slice fresh prosciutto crudo to order for only a few Euros!" },
    ],
  },
  {
    id: "sm-it-2",
    name: "Conad",
    countryCode: "IT",
    logo: "grocery",
    trustScore: 92,
    priceTier: "$$",
    isOpen: true,
    hours: "08:00 - 21:00",
    specialty: "Pesto Genovese jars, local pasta varieties, affordable regional house wines.",
    description: "Conad offers highly localized products. Perfect place to buy authentic Italian ingredients to take back home as souvenirs at standard non-tourist prices.",
    reviews: [
      { author: "Elena R.", rating: 5, text: "Felt very authentic. Picked up high-quality truffle paste and aged balsamic for half the price of tourist shops." },
    ],
  },

  // --- FRANCE ---
  {
    id: "sm-fr-1",
    name: "Carrefour",
    countryCode: "FR",
    logo: "grocery",
    trustScore: 93,
    priceTier: "$$",
    isOpen: true,
    hours: "08:30 - 21:00",
    specialty: "French cheeses, salted butter from Brittany, bottled wines, fresh seafood counters.",
    description: "The major French hypermarket chain. Carrefour has everything from fresh gourmet pastries and cheese varieties to budget traveling accessories.",
    reviews: [
      { author: "Jean P.", rating: 4, text: "Very good stock of local cheeses and affordable Bordeaux wines." },
    ],
  },
  {
    id: "sm-fr-2",
    name: "Monoprix",
    countryCode: "FR",
    logo: "store",
    trustScore: 95,
    priceTier: "$$$",
    isOpen: true,
    hours: "09:00 - 22:00",
    specialty: "Premium macarons, gourmet chocolates, high-end French cosmetics, designer souvenirs.",
    description: "Often described as the 'French Target.' Slightly upscale, but located right in city centers. Famous for combining a high-end food hall with fashionable items.",
    reviews: [
      { author: "Chloe M.", rating: 5, text: "Amazing cosmetic aisle with premium French sunscreens, and the bakery section is spectacular." },
    ],
  },

  // --- THAILAND ---
  {
    id: "sm-th-1",
    name: "7-Eleven Thailand",
    countryCode: "TH",
    logo: "7-eleven",
    trustScore: 97,
    priceTier: "$",
    isOpen: true,
    hours: "Open 24 hours",
    specialty: "Legendary toasted sandwiches, cold beverages, local mosquito repellent (Soffell), mobile credit top-up.",
    description: "An absolute oasis for travelers in Thailand. Air-conditioned paradise offering ice-cold drinks, clean pre-packaged foods, and daily necessities.",
    reviews: [
      { author: "Liam T.", rating: 5, text: "The toasties are life-savers. Try the ham and cheese or the carbonara one!" },
    ],
  },

  // --- MEXICO ---
  {
    id: "sm-mx-1",
    name: "OXXO",
    countryCode: "MX",
    logo: "store",
    trustScore: 94,
    priceTier: "$",
    isOpen: true,
    hours: "Open 24 hours",
    specialty: "Andatti coffee, cold sodas, local snacks, immediate cell phone recharges (recargas).",
    description: "Mexico's ubiquitous convenience store chain. Extremely reliable for quick transactions, bottled water, chips, and securing mobile internet credits.",
    reviews: [
      { author: "Mateo S.", rating: 4, text: "Super quick to recharge my Telcel SIM here, and they always have cold water." },
    ],
  },
];

export const ATTRACTIONS: Attraction[] = [
  // --- JAPAN ---
  {
    id: "att-jp-1",
    name: "Fushimi Inari Shrine (Kyoto)",
    countryCode: "JP",
    category: "Shrine & Nature",
    ticketPriceLocal: 0,
    imagePrompt: "fushimi_inari",
    tips: [
      "Admission is 100% free.",
      "Arrive before 7:30 AM or after 7:00 PM to avoid massive tourist crowds.",
      "The full hike through the mountain takes 2 to 3 hours, but most visitors turn around at the Yotsutsuji intersection (30 mins up) which has great views.",
    ],
    description: "Famous mountain trail framed by over 10,000 vibrant vermilion Torii gates dedicated to Inari, the Shinto god of rice and agriculture.",
    hours: "Open 24/7",
  },
  {
    id: "att-jp-2",
    name: "Shibuya Crossing (Tokyo)",
    countryCode: "JP",
    category: "Modern Landmark",
    ticketPriceLocal: 0,
    imagePrompt: "shibuya_crossing",
    tips: [
      "Get a great overhead view from the 2nd floor of Mag's Park or the Shibuya Station glass corridor.",
      "Visit at dusk when the towering neon billboards light up simultaneously.",
    ],
    description: "The world's busiest pedestrian scramble crossing, where up to 3,000 people cross simultaneously from all directions.",
    hours: "Open 24/7",
  },

  // --- ITALY ---
  {
    id: "att-it-1",
    name: "The Colosseum (Rome)",
    countryCode: "IT",
    category: "Ancient Ruin",
    ticketPriceLocal: 18,
    imagePrompt: "colosseum",
    tips: [
      "You MUST book tickets weeks in advance online. Spot purchases are rarely available.",
      "A standard ticket includes combined entry to the Roman Forum and Palatine Hill.",
      "Avoid 'guides' offering fast-track entry outside the gates—they are usually highly overpriced scams.",
    ],
    description: "The iconic, oval amphitheater in the center of Rome, once seating 50,000 spectators for ancient gladiator games and spectacles.",
    hours: "08:30 - 19:15",
  },

  // --- FRANCE ---
  {
    id: "att-fr-1",
    name: "Eiffel Tower (Paris)",
    countryCode: "FR",
    category: "Monument",
    ticketPriceLocal: 29.40,
    imagePrompt: "eiffel_tower",
    tips: [
      "Take the stairs to the second floor for a much cheaper ticket and significantly shorter lines.",
      "At night, the tower sparkles for exactly 5 minutes on the hour, every hour from sunset until 1:00 AM.",
    ],
    description: "The famous iron lattice tower on the Champ de Mars, originally built for the 1889 World's Fair and now the ultimate symbol of France.",
    hours: "09:30 - 23:45",
  },

  // --- THAILAND ---
  {
    id: "att-th-1",
    name: "The Grand Palace (Bangkok)",
    countryCode: "TH",
    category: "Royal Palace & Temple",
    ticketPriceLocal: 500,
    imagePrompt: "grand_palace",
    tips: [
      "There is a STRICT dress code. Shoulders and knees must be fully covered. No tight leggings, ripped jeans, or sheer clothing.",
      "Ignore any tuk-tuk drivers outside claiming 'The Palace is closed today for a ceremony'—this is a classic scam to take you to overpriced tailor shops.",
    ],
    description: "A spectacular complex of gilded halls, pavilions, and temples, including Wat Phra Kaew (Temple of the Emerald Buddha), serving as the official home of Siam kings since 1782.",
    hours: "08:30 - 15:30",
  },

  // --- MEXICO ---
  {
    id: "att-mx-1",
    name: "Chichen Itza (Yucatán)",
    countryCode: "MX",
    category: "Mayan Pyramid",
    ticketPriceLocal: 614,
    imagePrompt: "chichen_itza",
    tips: [
      "Bring cash as there are separate federal and state fees that must be paid separately.",
      "Carry lots of water, a wide hat, and sunscreen—the archaeological site has very little natural shade.",
    ],
    description: "One of the New Seven Wonders of the World. A highly advanced, sacred Mayan city showcasing the famous El Castillo step pyramid.",
    hours: "08:00 - 17:00",
  },
];

// Base64 mock images of products for easy testing in the sandbox
export const SAMPLE_PRODUCTS_TO_SCAN = [
  {
    label: "🍵 Tokyo Green Tea (Oi Ocha)",
    value: "oi_ocha",
    mimeType: "image/jpeg",
    countryCode: "JP",
    base64: "/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA="
  },
  {
    label: "☕ Italian Espresso (Lavazza)",
    value: "espresso",
    mimeType: "image/jpeg",
    countryCode: "IT",
    base64: "/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA="
  },
  {
    label: "🥖 Crusty French Baguette",
    value: "baguette",
    mimeType: "image/jpeg",
    countryCode: "FR",
    base64: "/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA="
  },
  {
    label: "🥪 7-Eleven Ham & Cheese Toastie (Bangkok)",
    value: "toastie",
    mimeType: "image/jpeg",
    countryCode: "TH",
    base64: "/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA="
  }
];

// Base64 mock signs for instant translation
export const SAMPLE_SIGNS_TO_TRANSLATE = [
  {
    label: "🚇 Tokyo Subway: 出口 (Exit Sign)",
    value: "exit_sign",
    countryCode: "JP",
    base64: "/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA="
  },
  {
    label: "🍕 Italian Restaurant: Coperto e Servizio inclusi (Menu Note)",
    value: "menu_note",
    countryCode: "IT",
    base64: "/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA="
  },
  {
    label: "⚠️ French Warning: Attention, Peinture Fraîche (Wet Paint)",
    value: "paint_sign",
    countryCode: "FR",
    base64: "/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA="
  }
];
