export interface POI {
  id: string;
  name: string;
  rating: number;
  desc: string;
  safety: string;
  latPercent: number;
  lngPercent: number;
  dist: string;
}

export function getCountryPOIs(countryCode: string, category: string, isAr: boolean): POI[] {
  const code = countryCode.toUpperCase();
  const list: POI[] = [];
  
  if (category === "restaurants") {
    if (isAr) {
      list.push(
        { id: "rest-1", name: "مطعم المذاق الأصيل الشعبي", rating: 4.8, desc: "أطباق تقليدية ممتازة بأسعار رخيصة جداً ومكونات طازجة.", safety: "آمن ومعتمد صحياً بنسبة 100%", latPercent: 35, lngPercent: 40, dist: "0.3 كم" },
        { id: "rest-2", name: "مخبز وبار السفر الذكي", rating: 4.5, desc: "وجبات سريعة ومعجنات طازجة وموفرة للمسافرين والرحالة.", safety: "نظيف ومناسب جداً للعائلات", latPercent: 65, lngPercent: 30, dist: "0.8 كم" },
        { id: "rest-3", name: "مطعم الوجبة الاقتصادية السريعة", rating: 4.2, desc: "خيار رائع لتناول الغداء بنصف تكلفة المطاعم السياحية الفاخرة.", safety: "شعبية عالية بين الطلاب ومكتشفين السفر", latPercent: 50, lngPercent: 75, dist: "1.2 كم" }
      );
    } else {
      list.push(
        { id: "rest-1", name: "Authentic Local Flavor Bistro", rating: 4.8, desc: "Top-rated traditional dishes at incredibly low local prices.", safety: "Clean & verified hygiene standard", latPercent: 35, lngPercent: 40, dist: "0.3 km" },
        { id: "rest-2", name: "The Savvy Backpacker Cafe", rating: 4.5, desc: "Fresh pastries, local coffee, and budget meal combos.", safety: "Highly recommended for digital nomads", latPercent: 65, lngPercent: 30, dist: "0.8 km" },
        { id: "rest-3", name: "Local Co-op Food Hall", rating: 4.2, desc: "An amazing dining option at half the cost of tourist plazas.", safety: "Authentic local crowds", latPercent: 50, lngPercent: 75, dist: "1.2 km" }
      );
    }
  } else if (category === "hospitals") {
    if (isAr) {
      list.push(
        { id: "hosp-1", name: "مستشفى الطوارئ الدولي", rating: 4.9, desc: "رعاية صحية عاجلة على مدار الساعة مع دعم الترجمة الفورية للمسافرين.", safety: "يقبل بطاقات التأمين السياحي الدولية مباشرة", latPercent: 45, lngPercent: 55, dist: "0.9 كم" },
        { id: "hosp-2", name: "المركز الطبي المحلي العام", rating: 4.4, desc: "خدمات طبية موثوقة للزوار والوافدين بأسعار حكومية اقتصادية.", safety: "يتوفر صيدلية مناوبة تعمل على مدار الساعة", latPercent: 70, lngPercent: 45, dist: "1.5 كم" }
      );
    } else {
      list.push(
        { id: "hosp-1", name: "General Metropolitan Emergency Hospital", rating: 4.9, desc: "24/7 healthcare center with English support translators.", safety: "Accepts international travel insurance", latPercent: 45, lngPercent: 55, dist: "0.9 km" },
        { id: "hosp-2", name: "Community Medical & Care Clinic", rating: 4.4, desc: "Rapid clinical treatment and low-cost emergency prescriptions.", safety: "On-site tourist support desk", latPercent: 70, lngPercent: 45, dist: "1.5 km" }
      );
    }
  } else if (category === "transit") {
    if (isAr) {
      list.push(
        { id: "trans-1", name: "محطة المترو المركزية", rating: 4.7, desc: "شريان المواصلات الأساسي للوصول لجميع المعالم والأسواق بيسر وسهولة.", safety: "مراقبة بالكاميرات على مدار 24 ساعة لراحتك", latPercent: 20, lngPercent: 50, dist: "0.2 كم" },
        { id: "trans-2", name: "موقف الحافلات السريعة الموفرة", rating: 4.3, desc: "خطوط حافلات رخيصة جداً تطوف أرجاء المدينة وضواحيها السياحية.", safety: "شراء تذاكر سهل عبر الآلات الذكية أو الجوال", latPercent: 55, lngPercent: 25, dist: "0.5 كم" }
      );
    } else {
      list.push(
        { id: "trans-1", name: "Central Metro Transit Hub", rating: 4.7, desc: "Connects all major subway lines, bullet trains, and regional networks.", safety: "Fully English-translated sign boards", latPercent: 20, lngPercent: 50, dist: "0.2 km" },
        { id: "trans-2", name: "Express Smart Bus Terminal", rating: 4.3, desc: "Ultra low-cost bus lines circling city highlights and suburbs.", safety: "Supports tap-and-ride mobile wallet", latPercent: 55, lngPercent: 25, dist: "0.5 km" }
      );
    }
  } else if (category === "atms") {
    if (isAr) {
      list.push(
        { id: "atm-1", name: "صراف آلي دولي متعدد العملات", rating: 4.6, desc: "يقبل جميع البطاقات الائتمانية والبنكية الدولية بأقل عمولة سحب.", safety: "يتواجد داخل صالة بنكية مضاءة ومحمية بمركز المدينة", latPercent: 30, lngPercent: 60, dist: "0.1 كم" },
        { id: "atm-2", name: "جهاز سحب نقدي سريع وموثوق", rating: 4.5, desc: "جهاز سحب سريع متوفر بمتجر البقالة المركزي بالحي.", safety: "آمن للغاية ومراقب بكاميرات الحماية", latPercent: 60, lngPercent: 80, dist: "0.4 كم" }
      );
    } else {
      list.push(
        { id: "atm-1", name: "Multi-Currency International ATM", rating: 4.6, desc: "Accepts Visa, Mastercard, and UnionPay with very low foreign fees.", safety: "Inside secured banking lobby", latPercent: 30, lngPercent: 60, dist: "0.1 km" },
        { id: "atm-2", name: "National Bank Cash Dispenser", rating: 4.5, desc: "Reliable ATM station located in the main local marketplace.", safety: "Protected and monitored well", latPercent: 60, lngPercent: 80, dist: "0.4 km" }
      );
    }
  } else if (category === "malls") {
    if (isAr) {
      list.push(
        { id: "mall-1", name: "مول تسوق البلدة الشعبية والآوتلت", rating: 4.6, desc: "مركز تجاري كبير يضم السوبرماركت ومتاجر الماركات المحلية الرخيصة.", safety: "قريب ومباشر بجانب خط المترو الرئيسي للبلدة", latPercent: 40, lngPercent: 30, dist: "1.1 كم" },
        { id: "mall-2", name: "مجمع المنافذ التجاري والخصومات", rating: 4.5, desc: "عروض ممتازة طوال العام على الملابس والإلكترونيات بأسعار التصفية.", safety: "متوفر مكتب استرجاع الضرائب معفى للسياح", latPercent: 75, lngPercent: 60, dist: "2.5 كم" }
      );
    } else {
      list.push(
        { id: "mall-1", name: "The Local Outlet & Co-op Mall", rating: 4.6, desc: "Spacious shopping complex featuring value markets and local brands.", safety: "Accessible with public transit link", latPercent: 40, lngPercent: 30, dist: "1.1 km" },
        { id: "mall-2", name: "Tax-Free Tourist Plaza Mall", rating: 4.5, desc: "Up to 50% discount outlets on fashion, electronics, and daily items.", safety: "Official tax-refund counter available", latPercent: 75, lngPercent: 60, dist: "2.5 km" }
      );
    }
  } else if (category === "hotels") {
    if (isAr) {
      list.push(
        { id: "hot-1", name: "فندق المسافر الذكي الاقتصادي", rating: 4.5, desc: "غرف نظيفة وموقع متميز بمركز المدينة بنصف التكلفة السياحية المعتادة.", safety: "طاقم عمل ودود وخدوم مع دعم لغوي شامل", latPercent: 30, lngPercent: 20, dist: "1.4 كم" },
        { id: "hot-2", name: "نزل كبسولة المستكشفون الرائع", rating: 4.4, desc: "تصميم عصري وحلول متطورة مثالية للرحالة ومستكشفين السفر الأفراد.", safety: "خزائن مغناطيسية سرية ومحكمة لحفظ الممتلكات الشخصية", latPercent: 80, lngPercent: 35, dist: "0.7 كم" }
      );
    } else {
      list.push(
        { id: "hot-1", name: "The Savvy Voyager Budget Hotel", rating: 4.5, desc: "Clean private rooms in the heart of the metropolis for budget rates.", safety: "Multilingual traveler desk", latPercent: 30, lngPercent: 20, dist: "1.4 km" },
        { id: "hot-2", name: "Urban Backpackers Eco Hostel", rating: 4.4, desc: "Chic design with secure magnetic lockers, shared lounge, and free maps.", safety: "CCTV protected luggage rooms", latPercent: 80, lngPercent: 35, dist: "0.7 km" }
      );
    }
  } else if (category === "stores") {
    if (isAr) {
      list.push(
        { id: "store-1", name: "سوبرماركت التوفير المحلي الكبير", rating: 4.7, desc: "سلسلة السوبرماركت الأكثر توفيراً لسلع البقالة والشوكولاتة والهدايا.", safety: "سمعة ممتازة ومطابقة للمواصفات وأسعار موحدة محلياً", latPercent: 15, lngPercent: 45, dist: "0.4 كم" },
        { id: "store-2", name: "متجر الخصومات الشعبية الغذائية", rating: 4.5, desc: "يبيع المياه والمشروبات والمعلبات بنصف كلفة متاجر البقالة السياحية.", safety: "الخيار الأفضل للرحالة لتخزين المؤن اليومية", latPercent: 70, lngPercent: 20, dist: "0.9 كم" }
      );
    } else {
      list.push(
        { id: "store-1", name: "National Savings Co-op Supermarket", rating: 4.7, desc: "The ultimate local grocery chain for discount chocolates, snacks, and fruits.", safety: "Tax-free self checkouts", latPercent: 15, lngPercent: 45, dist: "0.4 km" },
        { id: "store-2", name: "Mega Discount Food Stall", rating: 4.5, desc: "Sells bottled water, beverages, and traveler bento boxes at half convenience store prices.", safety: "Clean community grocery standard", latPercent: 70, lngPercent: 20, dist: "0.9 km" }
      );
    }
  } else {
    // landmarks / attractions
    if (isAr) {
      list.push(
        { id: "land-1", name: "المعلم التاريخي الأثري القديم", rating: 4.9, desc: "موقع أثري ساحر يعود لمئات السنين يروي تاريخ وحضارة البلد.", safety: "الدخول آمن، احرص على تجنب الباعة الخارجيين الملحين", latPercent: 40, lngPercent: 65, dist: "1.8 كم" },
        { id: "land-2", name: "ميدان الثقافة الشعبي المفتوح", rating: 4.8, desc: "مساحة حيوية نابضة بالحياة لاستكشاف الفنون والمأكولات الشعبية الرائعة مجاناً.", safety: "احفظ محفظتك وجوالك جيداً في الأماكن شديدة الازدحام", latPercent: 65, lngPercent: 55, dist: "0.6 كم" }
      );
    } else {
      list.push(
        { id: "land-1", name: "Ancient Historic Castle Landmark", rating: 4.9, desc: "An outstanding heritage architecture well worth photographing.", safety: "Beware of pushy street souvenir hawkers", latPercent: 40, lngPercent: 65, dist: "1.8 km" },
        { id: "land-2", name: "Heritage Cultural Open Square", rating: 4.8, desc: "A vibrant public promenade to explore folk arts and local street foods for free.", safety: "Keep wallets secured in high crowds", latPercent: 65, lngPercent: 55, dist: "0.6 km" }
      );
    }
  }
  
  return list;
}
