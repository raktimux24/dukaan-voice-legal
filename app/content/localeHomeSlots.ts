import type { Locale } from '../i18n';
import { homeHtml } from './home';

/** Shop-day locale overlay. Missing bodies stay on locked EN — do not invent. */
export type HomeSlots = {
  navFeatures?: string;
  navAi?: string;
  navPricing?: string;
  navAccount?: string;
  navDownload?: string;
  heroEyebrow?: string;
  heroH1?: string;
  heroSub?: string;
  heroLanguageProse?: string;
  chipCash?: string;
  chipUpi?: string;
  chipUdhaar?: string;
  ctaDownload?: string;
  ctaSeeHow?: string;
  floatGloss?: string;
  floatSecond?: string;
  phoneSearch?: string;
  howLabel?: string;
  howHeading?: string;
  howSub?: string;
  how1Title?: string;
  how1Body?: string;
  how1Example?: string;
  how2Title?: string;
  how2Body?: string;
  how3Title?: string;
  how3Body?: string;
  f1Title?: string;
  f1Body?: string;
  f2Title?: string;
  f2Body?: string;
  f3Title?: string;
  f3Body?: string;
  f4Title?: string;
  f4Body?: string;
  f5Title?: string;
  f5Body?: string;
  f6Title?: string;
  f6Body?: string;
  whatHappens?: string;
  hisaabLabel?: string;
  hisaabHindi?: string;
  hisaabHeading?: string;
  hisaabSub?: string;
  hisaab1Title?: string;
  hisaab1Body?: string;
  hisaab2Title?: string;
  hisaab2Body?: string;
  hisaab3Title?: string;
  hisaab3Body?: string;
  hisaab4Title?: string;
  hisaab4Body?: string;
  langHeading?: string;
  langSub?: string;
  cmpWithoutHeading?: string;
  cmpWithout1?: string;
  cmpWithout2?: string;
  cmpWithout3?: string;
  cmpWithout4?: string;
  cmpWithout5?: string;
  cmpWithout6?: string;
  cmpWithHeading?: string;
  cmpWith1?: string;
  cmpWith2?: string;
  cmpWith3?: string;
  cmpWith4?: string;
  cmpWith5?: string;
  cmpWith6?: string;
  eveningMatch?: string;
  proofLabel?: string;
  proofHeading?: string;
  ctaLabel?: string;
  ctaHindi?: string;
  ctaHeading?: string;
  ctaSub?: string;
  footerBlurb?: string;
  footerContact?: string;
  footerRefund?: string;
  footerPrivacy?: string;
  footerTerms?: string;
  heroStatCashLabel?: string;
  heroStatUpiLabel?: string;
  heroStatUdhaarLabel?: string;
  floatCustomer?: string;
  phoneGreeting?: string;
  phoneShopName?: string;
  phoneTodaySales?: string;
  phoneBillsToday?: string;
  phoneStatCash?: string;
  phoneLine1Name?: string;
  phoneLine1Meta?: string;
  phoneLine2Meta?: string;
  phoneLine3Meta?: string;
  phoneQtyUnit?: string;
  featuresLabel?: string;
  how3LineHindi?: string;
  how3LineEnglish?: string;
  hisaab2Line?: string;
  hisaab2Gloss?: string;
  hisaab4Line?: string;
  hisaab4Gloss?: string;
  cmpLabel?: string;
  cmpWithoutChrome?: string;
  cmpWithChrome?: string;
  langLabel?: string;
  chromeLanguage?: string;
  footerRights?: string;
  footerMadeInIndia?: string;
};

const TWIN = 'जो बोला, वही बिल।';
const UTTERANCE = 'चावल 5 किलो बेचा';

const HERO_ROTATE =
  '<span class="hero-rotate"><span class="hero-rotate-word active">Hindi</span><span class="hero-rotate-word">Bengali</span><span class="hero-rotate-word">Tamil</span><span class="hero-rotate-word">Telugu</span><span class="hero-rotate-word">Marathi</span><span class="hero-rotate-word">Kannada</span><span class="hero-rotate-word">Gujarati</span><span class="hero-rotate-word">Malayalam</span><span class="hero-rotate-word">Punjabi</span><span class="hero-rotate-word">Odia</span><span class="hero-rotate-word">English</span></span>';

const EN_HERO_SUB = `          While the customer is still there, you say what they took in ${HERO_ROTATE}.
          The app puts it on a bill. You take cash, show a UPI QR, or write it as udhaar. Stock is not a second notebook.`;

const hi: HomeSlots = {
  navFeatures: "फ़ीचर्स",
  navAi: "शाम का हिसाब",
  navPricing: "कीमत",
  navAccount: "सब्सक्रिप्शन मैनेज करें",
  navDownload: "डाउनलोड",
  heroEyebrow: "किराना काउंटर के लिए",
  heroH1: "बोल तो तुम चुके।<br>बिल साथ चले।",
  heroSub: "ग्राहक अभी खड़ा है। जो लिया वो बोल दो। ऐप बिल पर चढ़ा देता है। कैश लो, UPI QR दिखाओ, या उधार लिख दो। स्टॉक दूसरा रजिस्टर नहीं।",
  heroLanguageProse: "हिंदी, हिंग्लिश, या 10 भारतीय भाषाओं + English में बोल सकते हो।",
  chipCash: "कैश",
  chipUpi: "UPI",
  chipUdhaar: "उधार",
  ctaDownload: "डाउनलोड — App Store या Google Play",
  ctaSeeHow: "सेल कैसे चलती है देखो",
  floatGloss: "चावल 5 किलो बिका · कैश / UPI?",
  floatSecond: "बिल तैयार · WhatsApp / PDF",
  phoneSearch: "इस बिल में खोजो…",
  howLabel: "सेल कैसे चलती है",
  howHeading: "तीन कदम। कोई क्लास नहीं।",
  howSub: "ग्राहक इंतज़ार में है। दोनों हाथ भरे हो सकते हैं। ये भीड़ है, डेमो नहीं।",
  how1Title: "जो लिया वो बोलो",
  how1Body: "जैसे रोज़ बोलते हो वैसे बोलो। वॉइस न हो तो आइटम टैप करो। हिंदी, हिंग्लिश, या 10 भारतीय भाषाएँ + English।",
  how1Example: "चावल 5 किलो बिका",
  how2Title: "पैसे लो",
  how2Body: "कैश, QR पर UPI की रकम दिखाओ, या उस ग्राहक के उधार पर चढ़ाओ। पैसे लेने के लिए टैप तो करना पड़ेगा। सिर्फ़ बोलने से UPI नहीं जाता।",
  how3Title: "बिल, आज का टोटल, स्टॉक",
  how3Body: "ये बिल ग्राहक को WhatsApp पर भेज दो। आज का कैश और UPI टोटल चल पड़ता है। उन चीज़ों का स्टॉक पहले से अपडेट है, बाद में अलग गिनती नहीं।",
  f1Title: "सेल तुम बोलते हो",
  f1Body: "जो लिया वो वैसे ही बोलो जैसे रोज़ बोलते हो। कैश, UPI, या उधार टैप से कन्फ़र्म होता है। ये ग्राहक के UPI ऐप पर कॉल नहीं है।",
  f2Title: "10 भारतीय भाषाएँ + English",
  f2Body: "हिंदी, बंगाली, तमिल, तेलुगू, मराठी, कन्नड़, गुजराती, मलयालम, पंजाबी, ओड़िया, और English। हिंग्लिश बोलचाल है, अलग चिप नहीं।",
  f3Title: "हेल्पर का फ़ोन",
  f3Body: "दूसरे काउंटर वाला अपने फ़ोन से बिल बना सकता है। हिसाब इसी दुकान का रहता है, निजी वॉलेट नहीं।",
  f4Title: "WhatsApp बिल",
  f4Body: "जो ग्राहक खड़ा है, उसे ये बिल भेज दो। मार्केटिंग नहीं। बस ये बिल।",
  f5Title: "नाम पर उधार",
  f5Body: "रमेश ने आज चावल लिया। उसके नाम पर बैठा। महीने के अंत में रजिस्टर नहीं पलटना। ये लिस्ट Premium पर है।",
  f6Title: "स्कैन करके इसी बिल पर",
  f6Body: "बारकोड Maggi को इसी बिल पर डालता है। स्टॉक-इन स्कैन तभी है जब तुम स्टॉक जोड़ रहे हो।",
  whatHappens: "काउंटर पर क्या होता है।",
  hisaabLabel: "शाम का हिसाब",
  hisaabHindi: "आज कितना कैश आया?",
  hisaabHeading: "दिन से पूछो, रजिस्टर से नहीं",
  hisaabSub: "भीड़ थमे तो पूछो कितना आया, किसका उधार अभी खुला है।",
  hisaab1Title: "आज का कैश",
  hisaab1Body: "\"aaj kitna cash aaya\" / आज कितना कैश आया?",
  hisaab2Title: "खुला उधार",
  hisaab2Body: "किसका उधार अभी खुला है?",
  hisaab3Title: "क्या बिका",
  hisaab3Body: "\"aaj kitna becha\" / आज कितना बेचा?",
  hisaab4Title: "बिल के बाद स्टॉक",
  hisaab4Body: "वो चीज़ें सेल के साथ निकल चुकीं। रविवार की स्टॉक गिनती अलग सिरदर्द है। ये वो रजिस्टर नहीं।",
  langHeading: "काउंटर पर तुम्हारी भाषा",
  langSub: "हिंदी, हिंग्लिश, या 10 भारतीय भाषाएँ + English। वही नाम जिनसे तुम सामान पुकारते हो।",
  cmpWithoutHeading: "भीड़ में, काग़ज़ पर",
  cmpWithout1: "लिखते-लिखते ग्राहक इंतज़ार में",
  cmpWithout2: "उधार रजिस्टर में",
  cmpWithout3: "लंबे हफ़्ते के बाद रविवार को स्टॉक गिनती",
  cmpWithout4: "UPI और कैश दो जगह",
  cmpWithout5: "हेल्पर टाइपिंग में धीमा",
  cmpWithout6: "शाम का हिसाब कैश बॉक्स से नहीं मिलता",
  cmpWithHeading: "वो वाक्य जो तुम बोल चुके",
  cmpWith1: "जो लिया वो बोलो, बिल साथ चलता है",
  cmpWith2: "कैश, UPI QR, या उधार उसी बिल पर",
  cmpWith3: "उन चीज़ों का स्टॉक पहले से चला",
  cmpWith4: "खड़े ग्राहक को WhatsApp बिल",
  cmpWith5: "आज का कैश और UPI एक जगह",
  cmpWith6: "हेल्पर का फ़ोन भी इसी दुकान के हिसाब में",
  eveningMatch: "शाम का हिसाब बॉक्स से मिलना चाहिए",
  proofLabel: "उदाहरण",
  proofHeading: "बेंगलुरु काउंटर से (उदाहरण)",
  ctaLabel: "शुरू करो",
  ctaHindi: "आज दुकान पर आज़माएँ",
  ctaHeading: "अगले ग्राहक पर आज़माओ, खाली इतवार पर नहीं",
  ctaSub: "App Store या Google Play से डाउनलोड। नई दुकान को ऐप में 7 दिन वॉइस, कार्ड नहीं। पहली चार्ज की रिफ़ंड विंडो अलग है।",
  footerBlurb: "किराना काउंटर के लिए। जो लिया वो बोलो। बिल साथ चलता है।",
  footerContact: "संपर्क",
  footerRefund: "रिफ़ंड नीति",
  footerPrivacy: "प्राइवेसी",
  footerTerms: "शर्तें",
  heroStatCashLabel: "बिल पर",
  heroStatUpiLabel: "QR राशि",
  heroStatUdhaarLabel: "नाम पर",
  floatCustomer: "खड़े ग्राहक को",
  phoneGreeting: "शुभ संध्या",
  phoneShopName: "किराना काउंटर",
  phoneTodaySales: "आज की सेल",
  phoneBillsToday: "आज के बिल",
  phoneStatCash: "कैश",
  phoneLine1Name: "चावल 5 किलो",
  phoneLine1Meta: "कैश · UPI?",
  phoneLine2Meta: "2 पैकेट · उधार",
  phoneLine3Meta: "4 पैकेट · कैश",
  phoneQtyUnit: "बिल",
  featuresLabel: "फीचर्स",
  how3LineHindi: "WhatsApp · आज कैश/UPI",
  how3LineEnglish: "बिल के साथ स्टॉक पहले से अपडेट",
  hisaab2Line: "रमेश · खुला उधार",
  hisaab2Gloss: "किसका खाता आज भी खुला है",
  hisaab4Line: "बिल के साथ स्टॉक",
  hisaab4Gloss: "वो चीज़ें पहले से चल गईं",
  cmpLabel: "क्यों Samaan Bol",
  cmpWithoutChrome: "Samaan Bol के बिना",
  cmpWithChrome: "Samaan Bol के साथ",
  langLabel: "भारत के लिए",
  chromeLanguage: "भाषा",
  footerRights: "सर्वाधिकार सुरक्षित",
  footerMadeInIndia: "भारत में बना ♥ 🇮🇳",
};

const localeSlots: Partial<Record<Locale, HomeSlots>> = {
  hi,
  bn: {
    navFeatures: "ফিচার",
    navAi: "সন্ধ্যের হিসাব",
    navPricing: "দাম",
    navAccount: "সাবস্ক্রিপশন ম্যানেজ করুন",
    navDownload: "ডাউনলোড",
    heroEyebrow: "কিরানা কাউন্টারের জন্য",
    heroH1: "মুখে তো বলেই ফেললেন।<br>বিলও সাথে চলুক।",
    heroSub: "কাস্টমার এখনও দাঁড়িয়ে। যা নিয়েছে তা বলে দিন। অ্যাপ বিলে তুলে দেয়। ক্যাশ নিন, UPI QR দেখান, বা উধার লিখে দিন। স্টক দ্বিতীয় খাতা নয়।",
    heroLanguageProse: "হিন্দি, হিংলিশ, বা ১০টি ভারতীয় ভাষা + English-এ বলতে পারেন।",
    chipCash: "ক্যাশ",
    chipUpi: "UPI",
    chipUdhaar: "উধার",
    ctaDownload: "ডাউনলোড — App Store বা Google Play",
    ctaSeeHow: "একটা সেল কীভাবে চলে দেখুন",
    floatGloss: "চাল ৫ কেজি বিক্রি · ক্যাশ / UPI?",
    floatSecond: "বিল তৈরি · WhatsApp / PDF",
    phoneSearch: "এই বিলে খুঁজুন…",
    howLabel: "একটা সেল কীভাবে চলে",
    howHeading: "তিন ধাপ। কোনো ক্লাস নেই।",
    howSub: "কাস্টমার অপেক্ষা করছে। দুই হাতই ভরা থাকতে পারে। এটা ভিড়, ডেমো নয়।",
    how1Title: "যা নিয়েছে তা বলুন",
    how1Body: "যেমন রোজ বলেন তেমন বলুন। ভয়েস না থাকলে আইটেম ট্যাপ করুন। হিন্দি, হিংলিশ, বা ১০টি ভারতীয় ভাষা + English।",
    how1Example: "চাল ৫ কেজি বিক্রি",
    how2Title: "টাকা নিন",
    how2Body: "ক্যাশ, QR-এ UPI-র টাকা দেখান, বা সেই কাস্টমারের উধারে তুলুন। টাকা নিতে ট্যাপ করতেই হবে। শুধু বললে UPI যায় না।",
    how3Title: "বিল, আজকের টোটাল, স্টক",
    how3Body: "এই বিল কাস্টমারকে WhatsApp-এ পাঠিয়ে দিন। আজকের ক্যাশ আর UPI টোটাল চলে। ওই জিনিসের স্টক আগেই আপডেট, পরে আলাদা গোনা নেই।",
    f1Title: "সেল আপনি বলেন",
    f1Body: "যা নিয়েছে তা যেমন রোজ বলেন তেমন বলুন। ক্যাশ, UPI, বা উধার ট্যাপে কনফার্ম হয়। এটা কাস্টমারের UPI অ্যাপে কল নয়।",
    f2Title: "১০টি ভারতীয় ভাষা + English",
    f2Body: "হিন্দি, বাংলা, তামিল, তেলুগু, মারাঠি, কন্নড়, গুজরাটি, মালয়ালম, পাঞ্জাবি, ওড়িয়া, আর English। হিংলিশ কথার ধরন, আলাদা চিপ নয়।",
    f3Title: "হেল্পারের ফোন",
    f3Body: "অন্য কাউন্টারের লোক নিজের ফোনে বিল কাটতে পারে। হিসাব এই দোকানেরই থাকে, ব্যক্তিগত ওয়ালেট নয়।",
    f4Title: "WhatsApp বিল",
    f4Body: "যে কাস্টমার দাঁড়িয়ে, তাকে এই বিল পাঠান। মার্কেটিং নয়। শুধু এই বিল।",
    f5Title: "নামে উধার",
    f5Body: "রমেশ আজ চাল নিয়েছে। তার নামে বসে। মাস শেষে খাতা উল্টাতে হয় না। এই লিস্ট Premium-এ।",
    f6Title: "স্ক্যান করে এই বিলে",
    f6Body: "বারকোড Maggi-কে এই বিলে তোলে। স্টক-ইন স্ক্যান তখনই, যখন আপনি স্টক যোগ করছেন।",
    whatHappens: "কাউন্টারে কী হয়।",
    hisaabLabel: "সন্ধ্যের হিসাব",
    hisaabHindi: "आज कितना कैश आया?",
    hisaabHeading: "দিনকে জিজ্ঞেস করুন, খাতাকে নয়",
    hisaabSub: "ভিড় কমলে জিজ্ঞেস করুন কী এসেছে, কার উধার এখনও খোলা।",
    hisaab1Title: "আজকের ক্যাশ",
    hisaab1Body: "\"aaj kitna cash aaya\" / আজ কত ক্যাশ এসেছে?",
    hisaab2Title: "খোলা উধার",
    hisaab2Body: "কার উধার এখনও খোলা?",
    hisaab3Title: "কী বেচা হয়েছে",
    hisaab3Body: "\"aaj kitna becha\" / আজ কত বেচা হয়েছে?",
    hisaab4Title: "বিলের পর স্টক",
    hisaab4Body: "ওই জিনিস সেলের সাথেই নেমেছে। রবিবারের স্টক গোনা আলাদা মাথাব্যথা। এটা সেই খাতা নয়।",
    langHeading: "কাউন্টারে আপনার ভাষা",
    langSub: "হিন্দি, হিংলিশ, বা ১০টি ভারতীয় ভাষা + English। যে নামে আপনি মাল ডাকেন।",
    cmpWithoutHeading: "ভিড়ে, কাগজে",
    cmpWithout1: "লিখতে লিখতে কাস্টমার অপেক্ষা করে",
    cmpWithout2: "উধার খাতায়",
    cmpWithout3: "লম্বা সপ্তাহের পর রবিবার স্টক গোনা",
    cmpWithout4: "UPI আর ক্যাশ দুই জায়গায়",
    cmpWithout5: "হেল্পার টাইপিংয়ে ধীর",
    cmpWithout6: "সন্ধ্যের হিসাব ক্যাশ বক্সের সাথে মেলে না",
    cmpWithHeading: "যে কথা আপনি বলেই ফেলেছেন",
    cmpWith1: "যা নিয়েছে তা বলুন, বিল সাথে চলে",
    cmpWith2: "ক্যাশ, UPI QR, বা উধার সেই বিলে",
    cmpWith3: "ওই জিনিসের স্টক আগেই নেমেছে",
    cmpWith4: "দাঁড়ানো কাস্টমারকে WhatsApp বিল",
    cmpWith5: "আজকের ক্যাশ আর UPI এক জায়গায়",
    cmpWith6: "হেল্পারের ফোনও এই দোকানের হিসাবে",
    eveningMatch: "সন্ধ্যের হিসাব বক্সের সঙ্গে মেলানো উচিত",
    proofLabel: "উদাহরণ",
    proofHeading: "বেঙ্গালুরু কাউন্টার থেকে (উদাহরণ)",
    ctaLabel: "শুরু করুন",
    ctaHindi: "आज दुकान पर आज़माएँ",
    ctaHeading: "পরের কাস্টমারে চেষ্টা করুন, ফাঁকা রবিবারে নয়",
    ctaSub: "App Store বা Google Play থেকে ডাউনলোড। নতুন দোকানে অ্যাপে ৭ দিন ভয়েস, কার্ড লাগে না। প্রথম চার্জের রিফান্ড উইন্ডো আলাদা।",
    footerBlurb: "কিরানা কাউন্টারের জন্য। যা নিয়েছে তা বলুন। বিল সাথে চলে।",
    footerContact: "যোগাযোগ",
    footerRefund: "রিফান্ড নীতি",
    footerPrivacy: "প্রাইভেসি",
    footerTerms: "শর্ত",
    heroStatCashLabel: "বিলে",
    heroStatUpiLabel: "QR অ্যামাউন্ট",
    heroStatUdhaarLabel: "নামে",
    floatCustomer: "দাঁড়ানো গ্রাহককে",
    phoneGreeting: "শুভ সন্ধ্যা",
    phoneShopName: "কিরানা কাউন্টার",
    phoneTodaySales: "আজকের সেল",
    phoneBillsToday: "আজকের বিল",
    phoneStatCash: "ক্যাশ",
    phoneLine1Name: "চাল ৫ কেজি",
    phoneLine1Meta: "ক্যাশ · UPI?",
    phoneLine2Meta: "২ প্যাকেট · উধার",
    phoneLine3Meta: "৪ প্যাকেট · ক্যাশ",
    phoneQtyUnit: "বিল",
    featuresLabel: "ফিচার",
    how3LineHindi: "WhatsApp · আজ ক্যাশ/UPI",
    how3LineEnglish: "বিলের সাথে স্টক আগেই আপডেট",
    hisaab2Line: "রমেশ · খোলা উধার",
    hisaab2Gloss: "কার খাতা আজও খোলা",
    hisaab4Line: "বিলের সাথে স্টক",
    hisaab4Gloss: "ওই জিনিস আগেই সরেছে",
    cmpLabel: "কেন Samaan Bol",
    cmpWithoutChrome: "Samaan Bol ছাড়া",
    cmpWithChrome: "Samaan Bol দিয়ে",
    langLabel: "ভারতের জন্য",
    chromeLanguage: "ভাষা",
    footerRights: "সর্বস্বত্ব সংরক্ষিত",
    footerMadeInIndia: "ভারতে তৈরি ♥ 🇮🇳",
  },
  ta: {
    navFeatures: "அம்சங்கள்",
    navAi: "மாலை கணக்கு",
    navPricing: "விலை",
    navAccount: "சந்தாவை நிர்வகிக்கவும்",
    navDownload: "பதிவிறக்கம்",
    heroEyebrow: "கிரானா கவுண்டருக்கு",
    heroH1: "வாய்விட்டுச் சொல்லிவிட்டீர்கள்.<br>பில்லும் கூடவே வரட்டும்.",
    heroSub: "வாடிக்கையாளர் இன்னும் நிற்கிறார். எடுத்ததைச் சொல்லுங்கள். ஆப் பில்லில் போடும். கேஷ் வாங்குங்கள், UPI QR காட்டுங்கள், அல்லது உதார் எழுதுங்கள். ஸ்டாக் இரண்டாவது நோட்டு அல்ல.",
    heroLanguageProse: "ஹிந்தி, ஹிங்கிலிஷ், அல்லது 10 இந்திய மொழிகள் + English-ல் பேசலாம்.",
    chipCash: "கேஷ்",
    chipUpi: "UPI",
    chipUdhaar: "உதார்",
    ctaDownload: "பதிவிறக்கம் — App Store அல்லது Google Play",
    ctaSeeHow: "ஒரு விற்பனை எப்படி நடக்கிறது பாருங்கள்",
    floatGloss: "அரிசி 5 கிலோ விற்றது · கேஷ் / UPI?",
    floatSecond: "பில் தயார் · WhatsApp / PDF",
    phoneSearch: "இந்த பில்லில் தேடுங்கள்…",
    howLabel: "ஒரு விற்பனை எப்படி நடக்கிறது",
    howHeading: "மூன்று படிகள். பயிற்சி வகுப்பு இல்லை.",
    howSub: "வாடிக்கையாளர் காத்திருக்கிறார். இரண்டு கைகளும் நிறைந்திருக்கலாம். இது நேரக்கட்டு, டெமோ அல்ல.",
    how1Title: "எடுத்ததைச் சொல்லுங்கள்",
    how1Body: "தினம் சொல்வதுபோல சொல்லுங்கள். வாய்ஸ் இல்லையென்றால் பொருளை டேப் செய்யுங்கள். ஹிந்தி, ஹிங்கிலிஷ், அல்லது 10 இந்திய மொழிகள் + English.",
    how1Example: "அரிசி 5 கிலோ விற்றது",
    how2Title: "பணத்தை வாங்குங்கள்",
    how2Body: "கேஷ், QR-ல் UPI தொகையைக் காட்டுங்கள், அல்லது அந்த வாடிக்கையாளர் உதாரில் ஏற்றுங்கள். பணம் வாங்க டேப் தேவை. பேச்சினால் மட்டும் UPI போகாது.",
    how3Title: "பில், இன்றைய மொத்தம், ஸ்டாக்",
    how3Body: "இந்த பில்லை வாடிக்கையாளருக்கு WhatsApp-ல் அனுப்புங்கள். இன்றைய கேஷ், UPI மொத்தம் நகரும். அந்த பொருட்களின் ஸ்டாக் ஏற்கனவே மாறியது, பிறகு தனியே எண்ண வேண்டாம்.",
    f1Title: "விற்பனையை நீங்கள் பேசுகிறீர்கள்",
    f1Body: "எடுத்ததை தினம் சொல்வதுபோல சொல்லுங்கள். கேஷ், UPI, அல்லது உதார் டேப்பில் உறுதி. இது வாடிக்கையாளர் UPI ஆப்பிற்கு அழைப்பு அல்ல.",
    f2Title: "10 இந்திய மொழிகள் + English",
    f2Body: "ஹிந்தி, பெங்காலி, தமிழ், தெலுங்கு, மராத்தி, கன்னடம், குஜராத்தி, மலையாளம், பஞ்சாபி, ஒடியா, மற்றும் English. ஹிங்கிலிஷ் பேச்சு முறை, தனி சிப் அல்ல.",
    f3Title: "உதவியாளர் போன்",
    f3Body: "மற்ற கவுண்டரில் இருப்பவர் தன் போனில் பில் போடலாம். கணக்கு இந்த கடையுடையது, தனி வாலட் அல்ல.",
    f4Title: "WhatsApp பில்",
    f4Body: "நிற்கும் வாடிக்கையாளருக்கு இந்த பில்லை அனுப்புங்கள். மார்க்கெட்டிங் அல்ல. இந்த பில் மட்டும்.",
    f5Title: "பெயரில் உதார்",
    f5Body: "ரமேஷ் இன்று அரிசி எடுத்தார். அவர் பெயரில் இருக்கிறது. மாத இறுதியில் டைரி புரட்ட வேண்டாம். இந்த பட்டியல் Premium-ல்.",
    f6Title: "ஸ்கேன் செய்து இந்த பில்லில்",
    f6Body: "பார்கோடு Maggi-ஐ இந்த பில்லில் போடும். ஸ்டாக்-இன் ஸ்கேன், நீங்கள் ஸ்டாக் சேர்க்கும்போது மட்டும்.",
    whatHappens: "கவுண்டரில் என்ன நடக்கிறது.",
    hisaabLabel: "மாலை கணக்கு",
    hisaabHindi: "आज कितना कैश आया?",
    hisaabHeading: "நாள் கணக்கைக் கேளுங்கள், டைரியை அல்ல",
    hisaabSub: "நேரம் தணிந்ததும் என்ன வந்தது, யாருடைய உதார் இன்னும் திறந்திருக்கிறது என்று கேளுங்கள்.",
    hisaab1Title: "இன்றைய கேஷ்",
    hisaab1Body: "\"aaj kitna cash aaya\" / இன்று எவ்வளவு கேஷ் வந்தது?",
    hisaab2Title: "திறந்த உதார்",
    hisaab2Body: "யாருடைய உதார் இன்னும் திறந்திருக்கிறது?",
    hisaab3Title: "என்ன விற்றது",
    hisaab3Body: "\"aaj kitna becha\" / இன்று எவ்வளவு விற்றது?",
    hisaab4Title: "பில்லுக்குப் பின் ஸ்டாக்",
    hisaab4Body: "அந்த பொருட்கள் விற்பனையுடன் நகர்ந்துவிட்டன. ஞாயிறு ஸ்டாக் எண்ணல் வேறு தலைவலி. இது அந்த நோட்டு அல்ல.",
    langHeading: "கவுண்டரில் உங்கள் மொழி",
    langSub: "ஹிந்தி, ஹிங்கிலிஷ், அல்லது 10 இந்திய மொழிகள் + English. நீங்கள் பொருளை அழைக்கும் பெயர்களும்.",
    cmpWithoutHeading: "நேரக்கட்டில், காகிதத்தில்",
    cmpWithout1: "நீங்கள் எழுத, வாடிக்கையாளர் காத்திருப்பது",
    cmpWithout2: "டைரியில் உதார்",
    cmpWithout3: "நீண்ட வாரத்துக்குப் பின் ஞாயிறு ஸ்டாக் எண்ணல்",
    cmpWithout4: "UPI மற்றும் கேஷ் இரண்டு இடத்தில்",
    cmpWithout5: "உதவியாளர் டைப்பிங் மெதுவாக",
    cmpWithout6: "மாலை கணக்கு கேஷ் பாக்ஸுடன் பொருந்தாது",
    cmpWithHeading: "நீங்கள் ஏற்கனவே சொன்ன வாக்கியம்",
    cmpWith1: "எடுத்ததைச் சொல்லுங்கள், பில் கூடவே வரும்",
    cmpWith2: "கேஷ், UPI QR, அல்லது உதார் அந்த பில்லில்",
    cmpWith3: "அந்த பொருட்களின் ஸ்டாக் ஏற்கனவே நகர்ந்தது",
    cmpWith4: "நிற்கும் வாடிக்கையாளருக்கு WhatsApp பில்",
    cmpWith5: "இன்றைய கேஷ் மற்றும் UPI ஒரே இடத்தில்",
    cmpWith6: "உதவியாளர் போனும் இந்த கடை கணக்கிலேயே",
    eveningMatch: "மாலை கணக்கு பெட்டியுடன் பொருந்த வேண்டும்",
    proofLabel: "எடுத்துக்காட்டுகள்",
    proofHeading: "பெங்களூரு கவுண்டர்களில் இருந்து (எடுத்துக்காட்டுகள்)",
    ctaLabel: "தொடங்குங்கள்",
    ctaHindi: "आज दुकान पर आज़माएँ",
    ctaHeading: "அடுத்த வாடிக்கையாளரிடம் முயலுங்கள், அமைதியான ஞாயிற்றுக்கிழமை அல்ல",
    ctaSub: "App Store அல்லது Google Play-இல் இருந்து பதிவிறக்கம். புதிய கடைக்கு ஆப்பில் 7 நாள் வாய்ஸ், கார்டு வேண்டாம். முதல் கட்டண ரிஃபண்ட் சாளரம் தனியானது.",
    footerBlurb: "கிரானா கவுண்டருக்கு. எடுத்ததைச் சொல்லுங்கள். பில் கூடவே வரும்.",
    footerContact: "தொடர்பு",
    footerRefund: "ரிஃபண்ட் கொள்கை",
    footerPrivacy: "தனியுரிமை",
    footerTerms: "விதிகள்",
    heroStatCashLabel: "பில்லில்",
    heroStatUpiLabel: "QR தொகை",
    heroStatUdhaarLabel: "பெயரில்",
    floatCustomer: "நிற்கும் வாடிக்கையாளருக்கு",
    phoneGreeting: "மாலை வணக்கம்",
    phoneShopName: "கிரானா கவுண்டர்",
    phoneTodaySales: "இன்றைய விற்பனை",
    phoneBillsToday: "இன்றைய பில்கள்",
    phoneStatCash: "கேஷ்",
    phoneLine1Name: "அரிசி 5 கிலோ",
    phoneLine1Meta: "கேஷ் · UPI?",
    phoneLine2Meta: "2 பேக் · உதார்",
    phoneLine3Meta: "4 பேக் · கேஷ்",
    phoneQtyUnit: "பில்",
    featuresLabel: "அம்சங்கள்",
    how3LineHindi: "WhatsApp · இன்று கேஷ்/UPI",
    how3LineEnglish: "பில்லுடன் ஸ்டாக் ஏற்கனவே அப்டேட்",
    hisaab2Line: "ரமேஷ் · திறந்த உதார்",
    hisaab2Gloss: "யாருடைய கணக்கு இன்று திறந்திருக்கிறது",
    hisaab4Line: "பில்லுடன் ஸ்டாக்",
    hisaab4Gloss: "அந்த பொருட்கள் ஏற்கனவே நகர்ந்தன",
    cmpLabel: "ஏன் Samaan Bol",
    cmpWithoutChrome: "Samaan Bol இல்லாமல்",
    cmpWithChrome: "Samaan Bol உடன்",
    langLabel: "பாரதத்திற்காக",
    chromeLanguage: "மொழி",
    footerRights: "அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை",
    footerMadeInIndia: "இந்தியாவில் தயாரிப்பு ♥ 🇮🇳",
  },
  te: {
    navFeatures: "ఫీచర్లు",
    navAi: "సాయంత్రం హిసాబ్",
    navPricing: "ధర",
    navAccount: "సబ్‌స్క్రిప్షన్ నిర్వహించండి",
    navDownload: "డౌన్‌లోడ్",
    heroEyebrow: "కిరాణా కౌంటర్ కోసం",
    heroH1: "నోటితో చెప్పేశారు.<br>బిల్ కూడా వెంట రావాలి.",
    heroSub: "కస్టమర్ ఇంకా నిలబడి ఉన్నారు. తీసుకున్నది చెప్పండి. యాప్ బిల్ మీద పెడుతుంది. క్యాష్ తీసుకోండి, UPI QR చూపించండి, లేదా ఉధార్ రాయండి. స్టాక్ రెండో నోట్‌బుక్ కాదు.",
    heroLanguageProse: "హిందీ, హింగ్లిష్, లేదా 10 భారతీయ భాషలు + Englishలో మాట్లాడవచ్చు.",
    chipCash: "క్యాష్",
    chipUpi: "UPI",
    chipUdhaar: "ఉధార్",
    ctaDownload: "డౌన్‌లోడ్ — App Store లేదా Google Play",
    ctaSeeHow: "ఒక సేల్ ఎలా నడుస్తుందో చూడండి",
    floatGloss: "బియ్యం 5 కిలో అమ్మాం · క్యాష్ / UPI?",
    floatSecond: "బిల్ సిద్ధం · WhatsApp / PDF",
    phoneSearch: "ఈ బిల్‌లో వెతకండి…",
    howLabel: "ఒక సేల్ ఎలా నడుస్తుంది",
    howHeading: "మూడు అడుగులు. ట్రైనింగ్ క్లాస్ లేదు.",
    howSub: "కస్టమర్ వేచి ఉన్నారు. రెండు చేతులూ నిండి ఉండవచ్చు. ఇది రద్దీ, డెమో కాదు.",
    how1Title: "తీసుకున్నది చెప్పండి",
    how1Body: "రోజూ చెప్పేలా చెప్పండి. వాయిస్ లేకపోతే ఐటమ్ టాప్ చేయండి. హిందీ, హింగ్లిష్, లేదా 10 భారతీయ భాషలు + English.",
    how1Example: "బియ్యం 5 కిలో అమ్మాం",
    how2Title: "డబ్బు తీసుకోండి",
    how2Body: "క్యాష్, QR మీద UPI మొత్తం చూపించండి, లేదా ఆ కస్టమర్ ఉధార్ మీద పెట్టండి. డబ్బు తీసుకోవడానికి టాప్ కావాలి. మాటతోనే UPI పోదు.",
    how3Title: "బిల్, నేటి టోటల్, స్టాక్",
    how3Body: "ఈ బిల్‌ను కస్టమర్‌కి WhatsAppలో పంపండి. నేటి క్యాష్, UPI టోటల్ కదులుతాయి. ఆ వస్తువుల స్టాక్ ఇప్పటికే అప్‌డేట్, తర్వాత వేరే లెక్క వద్దు.",
    f1Title: "సేల్ మీరు మాట్లాడతారు",
    f1Body: "తీసుకున్నది రోజూ చెప్పేలా చెప్పండి. క్యాష్, UPI, లేదా ఉధార్ టాప్‌తో కన్ఫర్మ్. ఇది కస్టమర్ UPI యాప్‌కి కాల్ కాదు.",
    f2Title: "10 భారతీయ భాషలు + English",
    f2Body: "హిందీ, బెంగాలీ, తమిళం, తెలుగు, మరాఠీ, కన్నడ, గుజరాతీ, మలయాళం, పంజాబీ, ఒడియా, మరియు English. హింగ్లిష్ మాట్లాడే విధం, వేరే చిప్ కాదు.",
    f3Title: "హెల్పర్ ఫోన్",
    f3Body: "ఆవల కౌంటర్ వాళ్లు తమ ఫోన్‌లో బిల్ వేయవచ్చు. హిసాబ్ ఈ దుకాణానిదే, ప్రైవేట్ వాలెట్ కాదు.",
    f4Title: "WhatsApp బిల్",
    f4Body: "నిలబడి ఉన్న కస్టమర్‌కి ఈ బిల్ పంపండి. మార్కెటింగ్ కాదు. ఈ బిల్ మాత్రమే.",
    f5Title: "పేరు మీద ఉధార్",
    f5Body: "రమేష్ ఈరోజు బియ్యం తీసుకున్నాడు. అతని పేరు మీద ఉంది. నెల చివర నోట్‌బుక్ తిప్పక్కర్లేదు. ఈ లిస్ట్ Premiumలో.",
    f6Title: "స్కాన్ చేసి ఈ బిల్ మీద",
    f6Body: "బార్‌కోడ్ Maggiని ఈ బిల్ మీద పెడుతుంది. స్టాక్-ఇన్ స్కాన్ మీరు స్టాక్ జోడించేటప్పుడు మాత్రమే.",
    whatHappens: "కౌంటర్ మీద ఏమి జరుగుతుంది.",
    hisaabLabel: "సాయంత్రం హిసాబ్",
    hisaabHindi: "आज कितना कैश आया?",
    hisaabHeading: "రోజును అడగండి, డైరీని కాదు",
    hisaabSub: "రద్దీ తగ్గాక ఎంత వచ్చింది, ఎవరి ఉధార్ ఇంకా తెరిచి ఉందో అడగండి.",
    hisaab1Title: "నేటి క్యాష్",
    hisaab1Body: "\"aaj kitna cash aaya\" / ఈరోజు ఎంత క్యాష్ వచ్చింది?",
    hisaab2Title: "తెరిచి ఉన్న ఉధార్",
    hisaab2Body: "ఎవరి ఉధార్ ఇంకా తెరిచి ఉంది?",
    hisaab3Title: "ఏమి అమ్మింది",
    hisaab3Body: "\"aaj kitna becha\" / ఈరోజు ఎంత అమ్మింది?",
    hisaab4Title: "బిల్ తర్వాత స్టాక్",
    hisaab4Body: "ఆ వస్తువులు సేల్‌తోనే కదిలాయి. ఆదివారం స్టాక్ లెక్క వేరే నొప్పి. ఇది ఆ నోట్‌బుక్ కాదు.",
    langHeading: "కౌంటర్ మీద మీ భాష",
    langSub: "హిందీ, హింగ్లిష్, లేదా 10 భారతీయ భాషలు + English. మీరు సామానును పిలిచే పేర్లు కూడా.",
    cmpWithoutHeading: "రద్దీలో, కాగితం మీద",
    cmpWithout1: "మీరు రాస్తుంటే కస్టమర్ వేచి ఉండటం",
    cmpWithout2: "డైరీలో ఉధార్",
    cmpWithout3: "పొడవైన వారం తర్వాత ఆదివారం స్టాక్ లెక్క",
    cmpWithout4: "UPI, క్యాష్ రెండు చోట్ల",
    cmpWithout5: "హెల్పర్ టైపింగ్‌లో నెమ్మది",
    cmpWithout6: "సాయంత్రం హిసాబ్ క్యాష్ బాక్స్‌తో సరిపోదు",
    cmpWithHeading: "మీరు ఇప్పటికే చెప్పిన వాక్యం",
    cmpWith1: "తీసుకున్నది చెప్పండి, బిల్ వెంట వస్తుంది",
    cmpWith2: "క్యాష్, UPI QR, లేదా ఉధార్ ఆ బిల్ మీద",
    cmpWith3: "ఆ వస్తువుల స్టాక్ ఇప్పటికే కదిలింది",
    cmpWith4: "నిలబడి ఉన్న కస్టమర్‌కి WhatsApp బిల్",
    cmpWith5: "నేటి క్యాష్, UPI ఒకే చోట",
    cmpWith6: "హెల్పర్ ఫోన్ కూడా ఈ దుకాణం హిసాబ్‌లోకే",
    eveningMatch: "సాయంత్రం బాక్స్‌తో సరిపోవాలి",
    proofLabel: "ఉదాహరణలు",
    proofHeading: "బెంగళూరు కౌంటర్ల నుండి (ఉదాహరణలు)",
    ctaLabel: "మొదలుపెట్టండి",
    ctaHindi: "आज दुकान पर आज़माएँ",
    ctaHeading: "తర్వాతి కస్టమర్ మీద ప్రయత్నించండి, నిశ్శబ్ద ఆదివారం మీద కాదు",
    ctaSub: "App Store లేదా Google Play నుండి డౌన్‌లోడ్. కొత్త దుకాణానికి యాప్‌లో 7 రోజులు వాయిస్, కార్డు వద్దు. మొదటి ఛార్జ్ రీఫండ్ విండో వేరు.",
    footerBlurb: "కిరాణా కౌంటర్ కోసం. తీసుకున్నది చెప్పండి. బిల్ వెంట వస్తుంది.",
    footerContact: "సంప్రదించండి",
    footerRefund: "రీఫండ్ విధానం",
    footerPrivacy: "ప్రైవసీ",
    footerTerms: "నిబంధనలు",
    heroStatCashLabel: "బిల్ మీద",
    heroStatUpiLabel: "QR మొత్తం",
    heroStatUdhaarLabel: "పేరు మీద",
    floatCustomer: "నిలబడి ఉన్న కస్టమర్‌కి",
    phoneGreeting: "శుభ సాయంత్రం",
    phoneShopName: "కిరాణా కౌంటర్",
    phoneTodaySales: "నేటి సేల్",
    phoneBillsToday: "నేటి బిల్లులు",
    phoneStatCash: "క్యాష్",
    phoneLine1Name: "బియ్యం 5 కిలో",
    phoneLine1Meta: "క్యాష్ · UPI?",
    phoneLine2Meta: "2 ప్యాక్ · ఉధార్",
    phoneLine3Meta: "4 ప్యాక్ · క్యాష్",
    phoneQtyUnit: "బిల్",
    featuresLabel: "ఫీచర్లు",
    how3LineHindi: "WhatsApp · నేటి క్యాష్/UPI",
    how3LineEnglish: "బిల్‌తో స్టాక్ ఇప్పటికే అప్‌డేట్",
    hisaab2Line: "రమేష్ · తెరిచి ఉన్న ఉధార్",
    hisaab2Gloss: "ఎవరి ఖాతా ఈరోజు తెరిచి ఉంది",
    hisaab4Line: "బిల్‌తో స్టాక్",
    hisaab4Gloss: "ఆ వస్తువులు ఇప్పటికే కదిలాయి",
    cmpLabel: "ఎందుకు Samaan Bol",
    cmpWithoutChrome: "Samaan Bol లేకుండా",
    cmpWithChrome: "Samaan Bol తో",
    langLabel: "భారత్ కోసం",
    chromeLanguage: "భాష",
    footerRights: "అన్ని హక్కులు ప్రత్యేకించబడ్డాయి",
    footerMadeInIndia: "భారత్‌లో తయారు ♥ 🇮🇳",
  },
  mr: {
    navFeatures: "फीचर्स",
    navAi: "संध्याकाळचा हिशोब",
    navPricing: "किंमत",
    navAccount: "सबस्क्रिप्शन व्यवस्थापित करा",
    navDownload: "डाउनलोड",
    heroEyebrow: "किराणा काउंटरसाठी",
    heroH1: "बोलून तर तुम्ही झाला.<br>बिल सोबत चालावे.",
    heroSub: "ग्राहक अजून उभा आहे. जे घेतले ते सांगा. अॅप बिलवर चढवतो. कॅश घ्या, UPI QR दाखवा, किंवा उधार लिहा. स्टॉक दुसरी वही नाही.",
    heroLanguageProse: "हिंदी, हिंग्लिश, किंवा 10 भारतीय भाषा + English मध्ये बोलू शकता.",
    chipCash: "कॅश",
    chipUpi: "UPI",
    chipUdhaar: "उधार",
    ctaDownload: "डाउनलोड — App Store किंवा Google Play",
    ctaSeeHow: "सेल कशी चालते ते पहा",
    floatGloss: "तांदूळ 5 किलो विकले · कॅश / UPI?",
    floatSecond: "बिल तयार · WhatsApp / PDF",
    phoneSearch: "या बिलात शोधा…",
    howLabel: "सेल कशी चालते",
    howHeading: "तीन पावले. ट्रेनिंग क्लास नाही.",
    howSub: "ग्राहक वाट पाहतोय. दोन्ही हात भरलेले असू शकतात. ही गर्दी आहे, डेमो नाही.",
    how1Title: "जे घेतले ते सांगा",
    how1Body: "रोज बोलता तसं बोला. व्हॉइस नसेल तर आयटम टॅप करा. हिंदी, हिंग्लिश, किंवा 10 भारतीय भाषा + English.",
    how1Example: "तांदूळ 5 किलो विकले",
    how2Title: "पैसे घ्या",
    how2Body: "कॅश, QR वर UPIची रक्कम दाखवा, किंवा त्या ग्राहकाच्या उधारीवर चढवा. पैसे घ्यायला टॅप लागेल. फक्त बोलून UPI जात नाही.",
    how3Title: "बिल, आजचा टोटल, स्टॉक",
    how3Body: "हे बिल ग्राहकाला WhatsApp वर पाठवा. आजचा कॅश आणि UPI टोटल हलतात. त्या वस्तूंचा स्टॉक आधीच अपडेट, नंतर वेगळी गणती नाही.",
    f1Title: "सेल तुम्ही बोलता",
    f1Body: "जे घेतले ते रोज बोलता तसं बोला. कॅश, UPI, किंवा उधार टॅपने कन्फर्म होते. हे ग्राहकाच्या UPI अॅपला कॉल नाही.",
    f2Title: "10 भारतीय भाषा + English",
    f2Body: "हिंदी, बंगाली, तमिळ, तेलुगू, मराठी, कन्नड, गुजराती, मल्याळम, पंजाबी, ओडिया, आणि English. हिंग्लिश बोलण्याची रीत, वेगळी चिप नाही.",
    f3Title: "हेल्परचा फोन",
    f3Body: "पलीकडच्या काउंटरवरचा माणूस आपल्या फोनवर बिल काढू शकतो. हिशोब या दुकानाचाच राहतो, खाजगी वॉलेट नाही.",
    f4Title: "WhatsApp बिल",
    f4Body: "उभ्या ग्राहकाला हे बिल पाठवा. मार्केटिंग नाही. फक्त हे बिल.",
    f5Title: "नावावर उधार",
    f5Body: "रमेशने आज तांदूळ घेतला. त्याच्या नावावर बसला. महिन्याच्या शेवटी वही पलटायची नाही. ही लिस्ट Premium वर आहे.",
    f6Title: "स्कॅन करून याच बिलावर",
    f6Body: "बारकोड Maggi या बिलावर घालतो. स्टॉक-इन स्कॅन तेव्हाच, जेव्हा तुम्ही स्टॉक जोडता.",
    whatHappens: "काउंटरवर काय चालते.",
    hisaabLabel: "संध्याकाळचा हिशोब",
    hisaabHindi: "आज कितना कैश आया?",
    hisaabHeading: "दिवसाला विचारा, वहीला नाही",
    hisaabSub: "गर्दी थांबल्यावर विचारा किती आलं, कुणाची उधार अजून उघडी आहे.",
    hisaab1Title: "आजचा कॅश",
    hisaab1Body: "\"aaj kitna cash aaya\" / आज किती कॅश आला?",
    hisaab2Title: "उघडी उधार",
    hisaab2Body: "कुणाची उधार अजून उघडी आहे?",
    hisaab3Title: "काय विकलं",
    hisaab3Body: "\"aaj kitna becha\" / आज किती विकलं?",
    hisaab4Title: "बिलानंतर स्टॉक",
    hisaab4Body: "त्या वस्तू सेलबरोबर निघाल्या. रविवारची स्टॉक गणती वेगळी डोकेदुखी. ही ती वही नाही.",
    langHeading: "काउंटरवर तुमची भाषा",
    langSub: "हिंदी, हिंग्लिश, किंवा 10 भारतीय भाषा + English. तुम्ही मालाला हाक मारता ती नावं.",
    cmpWithoutHeading: "गर्दीत, कागदावर",
    cmpWithout1: "लिहिता लिहिता ग्राहक वाट पाहतो",
    cmpWithout2: "उधार वहीत",
    cmpWithout3: "लांब आठवड्यानंतर रविवारी स्टॉक गणती",
    cmpWithout4: "UPI आणि कॅश दोन ठिकाणी",
    cmpWithout5: "हेल्पर टायपिंगला मंद",
    cmpWithout6: "संध्याकाळचा हिशोब कॅश बॉक्सशी जुळत नाही",
    cmpWithHeading: "तो वाक्य जो तुम्ही बोलून झाला",
    cmpWith1: "जे घेतले ते सांगा, बिल सोबत चालते",
    cmpWith2: "कॅश, UPI QR, किंवा उधार त्याच बिलावर",
    cmpWith3: "त्या वस्तूंचा स्टॉक आधीच हलला",
    cmpWith4: "उभ्या ग्राहकाला WhatsApp बिल",
    cmpWith5: "आजचा कॅश आणि UPI एका ठिकाणी",
    cmpWith6: "हेल्परचा फोनही या दुकानाच्या हिशोबात",
    eveningMatch: "संध्याकाळचा हिशेब बॉक्सशी जुळावा",
    proofLabel: "उदाहरणे",
    proofHeading: "बेंगळुरू काउंटरवरून (उदाहरणे)",
    ctaLabel: "सुरू करा",
    ctaHindi: "आज दुकान पर आज़माएँ",
    ctaHeading: "पुढच्या ग्राहकावर आजमावा, शांत रविवारी नाही",
    ctaSub: "App Store किंवा Google Play वरून डाउनलोड. नवीन दुकानाला अॅपमध्ये 7 दिवस व्हॉइस, कार्ड नको. पहिल्या चार्जची रिफंड विंडो वेगळी.",
    footerBlurb: "किराणा काउंटरसाठी. जे घेतले ते सांगा. बिल सोबत चालते.",
    footerContact: "संपर्क",
    footerRefund: "रिफंड धोरण",
    footerPrivacy: "प्रायव्हसी",
    footerTerms: "अटी",
    heroStatCashLabel: "बिलावर",
    heroStatUpiLabel: "QR रक्कम",
    heroStatUdhaarLabel: "नावावर",
    floatCustomer: "उभ्या ग्राहकाला",
    phoneGreeting: "शुभ संध्याकाळ",
    phoneShopName: "किराणा काउंटर",
    phoneTodaySales: "आजची विक्री",
    phoneBillsToday: "आजची बिले",
    phoneStatCash: "रोख",
    phoneLine1Name: "तांदूळ 5 किलो",
    phoneLine1Meta: "रोख · UPI?",
    phoneLine2Meta: "2 पॅक · उधार",
    phoneLine3Meta: "4 पॅक · रोख",
    phoneQtyUnit: "बिल",
    featuresLabel: "वैशिष्ट्ये",
    how3LineHindi: "WhatsApp · आज रोख/UPI",
    how3LineEnglish: "बिलासोबत स्टॉक आधीच अपडेट",
    hisaab2Line: "रमेश · उघडे उधार",
    hisaab2Gloss: "कोणाचे खाते आजही उघडे आहे",
    hisaab4Line: "बिलासोबत स्टॉक",
    hisaab4Gloss: "त्या वस्तू आधीच हलल्या",
    cmpLabel: "का Samaan Bol",
    cmpWithoutChrome: "Samaan Bol शिवाय",
    cmpWithChrome: "Samaan Bol सोबत",
    langLabel: "भारतासाठी",
    chromeLanguage: "भाषा",
    footerRights: "सर्व हक्क राखीव",
    footerMadeInIndia: "भारतात बनवले ♥ 🇮🇳",
  },
  kn: {
    navFeatures: "ವೈಶಿಷ್ಟ್ಯಗಳು",
    navAi: "ಸಂಜೆಯ ಹಿಸಾಬ್",
    navPricing: "ಬೆಲೆ",
    navAccount: "ಸಬ್‌ಸ್ಕ್ರಿಪ್ಷನ್ ನಿರ್ವಹಿಸಿ",
    navDownload: "ಡೌನ್‌ಲೋಡ್",
    heroEyebrow: "ಕಿರಾಣಿ ಕೌಂಟರ್‌ಗಾಗಿ",
    heroH1: "ಬಾಯಿಂದ ಹೇಳಿ ಮುಗಿಸಿದ್ದೀರಿ.<br>ಬಿಲ್ ಜೊತೆಗೆ ಬರಲಿ.",
    heroSub: "ಗ್ರಾಹಕ ಇನ್ನೂ ನಿಂತಿದ್ದಾರೆ. ತೆಗೆದುಕೊಂಡದ್ದು ಹೇಳಿ. ಆ್ಯಪ್ ಬಿಲ್‌ಗೆ ಹಾಕುತ್ತದೆ. ಕ್ಯಾಶ್ ತೆಗೆದುಕೊಳ್ಳಿ, UPI QR ತೋರಿಸಿ, ಅಥವಾ ಉಧಾರ್ ಬರೆಯಿರಿ. ಸ್ಟಾಕ್ ಎರಡನೇ ನೋಟ್‌ಬುಕ್ ಅಲ್ಲ.",
    heroLanguageProse: "ಹಿಂದಿ, ಹಿಂಗ್ಲಿಷ್, ಅಥವಾ 10 ಭಾರತೀಯ ಭಾಷೆಗಳು + Englishನಲ್ಲಿ ಮಾತನಾಡಬಹುದು.",
    chipCash: "ಕ್ಯಾಶ್",
    chipUpi: "UPI",
    chipUdhaar: "ಉಧಾರ್",
    ctaDownload: "ಡೌನ್‌ಲೋಡ್ — App Store ಅಥವಾ Google Play",
    ctaSeeHow: "ಒಂದು ಸೇಲ್ ಹೇಗೆ ನಡೆಯುತ್ತದೆ ನೋಡಿ",
    floatGloss: "ಅಕ್ಕಿ 5 ಕೆಜಿ ಮಾರಾಟ · ಕ್ಯಾಶ್ / UPI?",
    floatSecond: "ಬಿಲ್ ಸಿದ್ಧ · WhatsApp / PDF",
    phoneSearch: "ಈ ಬಿಲ್‌ನಲ್ಲಿ ಹುಡುಕಿ…",
    howLabel: "ಒಂದು ಸೇಲ್ ಹೇಗೆ ನಡೆಯುತ್ತದೆ",
    howHeading: "ಮೂರು ಹಂತ. ಟ್ರೈನಿಂಗ್ ಕ್ಲಾಸ್ ಇಲ್ಲ.",
    howSub: "ಗ್ರಾಹಕ ಕಾಯುತ್ತಿದ್ದಾರೆ. ಎರಡೂ ಕೈ ತುಂಬಿರಬಹುದು. ಇದು ಗದ್ದಲ, ಡೆಮೊ ಅಲ್ಲ.",
    how1Title: "ತೆಗೆದುಕೊಂಡದ್ದು ಹೇಳಿ",
    how1Body: "ಪ್ರತಿದಿನ ಹೇಳುವ ಹಾಗೆ ಹೇಳಿ. ವಾಯ್ಸ್ ಇಲ್ಲದಿದ್ದರೆ ಐಟಂ ಟ್ಯಾಪ್ ಮಾಡಿ. ಹಿಂದಿ, ಹಿಂಗ್ಲಿಷ್, ಅಥವಾ 10 ಭಾರತೀಯ ಭಾಷೆಗಳು + English.",
    how1Example: "ಅಕ್ಕಿ 5 ಕೆಜಿ ಮಾರಾಟ",
    how2Title: "ಹಣ ತೆಗೆದುಕೊಳ್ಳಿ",
    how2Body: "ಕ್ಯಾಶ್, QR ಮೇಲೆ UPI ಮೊತ್ತ ತೋರಿಸಿ, ಅಥವಾ ಆ ಗ್ರಾಹಕರ ಉಧಾರ್‌ಗೆ ಹಾಕಿ. ಹಣ ತೆಗೆದುಕೊಳ್ಳಲು ಟ್ಯಾಪ್ ಬೇಕು. ಮಾತಿನಿಂದ ಮಾತ್ರ UPI ಹೋಗುವುದಿಲ್ಲ.",
    how3Title: "ಬಿಲ್, ಇಂದಿನ ಟೋಟಲ್, ಸ್ಟಾಕ್",
    how3Body: "ಈ ಬಿಲ್ ಗ್ರಾಹಕರಿಗೆ WhatsAppನಲ್ಲಿ ಕಳುಹಿಸಿ. ಇಂದಿನ ಕ್ಯಾಶ್ ಮತ್ತು UPI ಟೋಟಲ್ ಚಲಿಸುತ್ತವೆ. ಆ ವಸ್ತುಗಳ ಸ್ಟಾಕ್ ಈಗಾಗಲೇ ಅಪ್‌ಡೇಟ್, ನಂತರ ಬೇರೆ ಎಣಿಕೆ ಬೇಡ.",
    f1Title: "ಸೇಲ್ ನೀವು ಮಾತನಾಡುತ್ತೀರಿ",
    f1Body: "ತೆಗೆದುಕೊಂಡದ್ದು ಪ್ರತಿದಿನ ಹೇಳುವ ಹಾಗೆ ಹೇಳಿ. ಕ್ಯಾಶ್, UPI, ಅಥವಾ ಉಧಾರ್ ಟ್ಯಾಪ್‌ನಲ್ಲಿ ಕನ್‌ಫರ್ಮ್. ಇದು ಗ್ರಾಹಕರ UPI ಆ್ಯಪ್‌ಗೆ ಕರೆ ಅಲ್ಲ.",
    f2Title: "10 ಭಾರತೀಯ ಭಾಷೆಗಳು + English",
    f2Body: "ಹಿಂದಿ, ಬೆಂಗಾಲಿ, ತಮಿಳು, ತೆಲುಗು, ಮರಾಠಿ, ಕನ್ನಡ, ಗುಜರಾತಿ, ಮಲಯಾಳಂ, ಪಂಜಾಬಿ, ಒಡಿಯಾ, ಮತ್ತು English. ಹಿಂಗ್ಲಿಷ್ ಮಾತಿನ ರೀತಿ, ಪ್ರತ್ಯೇಕ ಚಿಪ್ ಅಲ್ಲ.",
    f3Title: "ಹೆಲ್ಪರ್ ಫೋನ್",
    f3Body: "ಆ ಕಡೆಯ ಕೌಂಟರ್‌ನವರು ತಮ್ಮ ಫೋನ್‌ನಲ್ಲಿ ಬಿಲ್ ಹಾಕಬಹುದು. ಹಿಸಾಬ್ ಈ ಅಂಗಡಿಯದೇ, ಖಾಸಗಿ ವಾಲೆಟ್ ಅಲ್ಲ.",
    f4Title: "WhatsApp ಬಿಲ್",
    f4Body: "ನಿಂತಿರುವ ಗ್ರಾಹಕರಿಗೆ ಈ ಬಿಲ್ ಕಳುಹಿಸಿ. ಮಾರ್ಕೆಟಿಂಗ್ ಅಲ್ಲ. ಈ ಬಿಲ್ ಮಾತ್ರ.",
    f5Title: "ಹೆಸರಿನ ಮೇಲೆ ಉಧಾರ್",
    f5Body: "ರಮೇಶ್ ಇಂದು ಅಕ್ಕಿ ತೆಗೆದುಕೊಂಡ. ಅವನ ಹೆಸರಿನ ಮೇಲೆ ಕುಳಿತಿದೆ. ತಿಂಗಳ ಕೊನೆಯಲ್ಲಿ ಡೈರಿ ತಿರುಗಿಸಬೇಕಿಲ್ಲ. ಈ ಲಿಸ್ಟ್ Premiumನಲ್ಲಿ.",
    f6Title: "ಸ್ಕ್ಯಾನ್ ಮಾಡಿ ಈ ಬಿಲ್‌ಗೆ",
    f6Body: "ಬಾರ್‌ಕೋಡ್ Maggi ಅನ್ನು ಈ ಬಿಲ್‌ಗೆ ಹಾಕುತ್ತದೆ. ಸ್ಟಾಕ್-ಇನ್ ಸ್ಕ್ಯಾನ್ ನೀವು ಸ್ಟಾಕ್ ಸೇರಿಸುವಾಗ ಮಾತ್ರ.",
    whatHappens: "ಕೌಂಟರ್‌ನಲ್ಲಿ ಏನಾಗುತ್ತದೆ.",
    hisaabLabel: "ಸಂಜೆಯ ಹಿಸಾಬ್",
    hisaabHindi: "आज कितना कैश आया?",
    hisaabHeading: "ದಿನವನ್ನು ಕೇಳಿ, ಡೈರಿಯನ್ನು ಅಲ್ಲ",
    hisaabSub: "ಗದ್ದಲ ತಗ್ಗಿದಾಗ ಎಷ್ಟು ಬಂತು, ಯಾರ ಉಧಾರ್ ಇನ್ನೂ ತೆರೆದಿದೆ ಎಂದು ಕೇಳಿ.",
    hisaab1Title: "ಇಂದಿನ ಕ್ಯಾಶ್",
    hisaab1Body: "\"aaj kitna cash aaya\" / ಇಂದು ಎಷ್ಟು ಕ್ಯಾಶ್ ಬಂತು?",
    hisaab2Title: "ತೆರೆದ ಉಧಾರ್",
    hisaab2Body: "ಯಾರ ಉಧಾರ್ ಇನ್ನೂ ತೆರೆದಿದೆ?",
    hisaab3Title: "ಏನು ಮಾರಾಟ",
    hisaab3Body: "\"aaj kitna becha\" / ಇಂದು ಎಷ್ಟು ಮಾರಾಟ?",
    hisaab4Title: "ಬಿಲ್ ನಂತರ ಸ್ಟಾಕ್",
    hisaab4Body: "ಆ ವಸ್ತುಗಳು ಸೇಲ್ ಜೊತೆಗೆ ಚಲಿಸಿವೆ. ಭಾನುವಾರದ ಸ್ಟಾಕ್ ಎಣಿಕೆ ಬೇರೆ ತಲೆನೋವು. ಇದು ಆ ನೋಟ್‌ಬುಕ್ ಅಲ್ಲ.",
    langHeading: "ಕೌಂಟರ್‌ನಲ್ಲಿ ನಿಮ್ಮ ಭಾಷೆ",
    langSub: "ಹಿಂದಿ, ಹಿಂಗ್ಲಿಷ್, ಅಥವಾ 10 ಭಾರತೀಯ ಭಾಷೆಗಳು + English. ನೀವು ಸಾಮಾನನ್ನು ಕರೆಯುವ ಹೆಸರುಗಳೂ.",
    cmpWithoutHeading: "ಗದ್ದಲದಲ್ಲಿ, ಕಾಗದದ ಮೇಲೆ",
    cmpWithout1: "ನೀವು ಬರೆಯುವಾಗ ಗ್ರಾಹಕ ಕಾಯುವುದು",
    cmpWithout2: "ಡೈರಿಯಲ್ಲಿ ಉಧಾರ್",
    cmpWithout3: "ಉದ್ದ ವಾರದ ನಂತರ ಭಾನುವಾರ ಸ್ಟಾಕ್ ಎಣಿಕೆ",
    cmpWithout4: "UPI ಮತ್ತು ಕ್ಯಾಶ್ ಎರಡು ಕಡೆ",
    cmpWithout5: "ಹೆಲ್ಪರ್ ಟೈಪಿಂಗ್‌ನಲ್ಲಿ ನಿಧಾನ",
    cmpWithout6: "ಸಂಜೆಯ ಹಿಸಾಬ್ ಕ್ಯಾಶ್ ಬಾಕ್ಸ್‌ಗೆ ಸಿಗುವುದಿಲ್ಲ",
    cmpWithHeading: "ನೀವು ಈಗಾಗಲೇ ಹೇಳಿದ ವಾಕ್ಯ",
    cmpWith1: "ತೆಗೆದುಕೊಂಡದ್ದು ಹೇಳಿ, ಬಿಲ್ ಜೊತೆ ಬರುತ್ತದೆ",
    cmpWith2: "ಕ್ಯಾಶ್, UPI QR, ಅಥವಾ ಉಧಾರ್ ಆ ಬಿಲ್‌ನಲ್ಲಿ",
    cmpWith3: "ಆ ವಸ್ತುಗಳ ಸ್ಟಾಕ್ ಈಗಾಗಲೇ ಚಲಿಸಿದೆ",
    cmpWith4: "ನಿಂತಿರುವ ಗ್ರಾಹಕರಿಗೆ WhatsApp ಬಿಲ್",
    cmpWith5: "ಇಂದಿನ ಕ್ಯಾಶ್ ಮತ್ತು UPI ಒಂದೇ ಕಡೆ",
    cmpWith6: "ಹೆಲ್ಪರ್ ಫೋನ್ ಈ ಅಂಗಡಿಯ ಹಿಸಾಬ್‌ಗೇ",
    eveningMatch: "ಸಂಜೆ ಬಾಕ್ಸ್‌ಗೆ ಸರಿಹೊಂದಬೇಕು",
    proofLabel: "ಉದಾಹರಣೆಗಳು",
    proofHeading: "ಬೆಂಗಳೂರು ಕೌಂಟರ್‌ಗಳಿಂದ (ಉದಾಹರಣೆಗಳು)",
    ctaLabel: "ಪ್ರಾರಂಭಿಸಿ",
    ctaHindi: "आज दुकान पर आज़माएँ",
    ctaHeading: "ಮುಂದಿನ ಗ್ರಾಹಕರಲ್ಲಿ ಪ್ರಯತ್ನಿಸಿ, ನಿಶ್ಯಬ್ದ ಭಾನುವಾರದಲ್ಲಿ ಅಲ್ಲ",
    ctaSub: "App Store ಅಥವಾ Google Play ನಿಂದ ಡೌನ್‌ಲೋಡ್. ಹೊಸ ಅಂಗಡಿಗೆ ಆ್ಯಪ್‌ನಲ್ಲಿ 7 ದಿನ ವಾಯ್ಸ್, ಕಾರ್ಡ್ ಬೇಡ. ಮೊದಲ ಚಾರ್ಜ್ ರಿಫಂಡ್ ವಿಂಡೋ ಪ್ರತ್ಯೇಕ.",
    footerBlurb: "ಕಿರಾಣಿ ಕೌಂಟರ್‌ಗಾಗಿ. ತೆಗೆದುಕೊಂಡದ್ದು ಹೇಳಿ. ಬಿಲ್ ಜೊತೆ ಬರುತ್ತದೆ.",
    footerContact: "ಸಂಪರ್ಕ",
    footerRefund: "ರಿಫಂಡ್ ನೀತಿ",
    footerPrivacy: "ಗೌಪ್ಯತೆ",
    footerTerms: "ನಿಯಮಗಳು",
    heroStatCashLabel: "ಬಿಲ್‌ನಲ್ಲಿ",
    heroStatUpiLabel: "QR ಮೊತ್ತ",
    heroStatUdhaarLabel: "ಹೆಸರಿನ ಮೇಲೆ",
    floatCustomer: "ನಿಂತಿರುವ ಗ್ರಾಹಕರಿಗೆ",
    phoneGreeting: "ಶುಭ ಸಂಜೆ",
    phoneShopName: "ಕಿರಾಣಿ ಕೌಂಟರ್",
    phoneTodaySales: "ಇಂದಿನ ಮಾರಾಟ",
    phoneBillsToday: "ಇಂದಿನ ಬಿಲ್‌ಗಳು",
    phoneStatCash: "ಕ್ಯಾಶ್",
    phoneLine1Name: "ಅಕ್ಕಿ 5 ಕೆಜಿ",
    phoneLine1Meta: "ಕ್ಯಾಶ್ · UPI?",
    phoneLine2Meta: "2 ಪ್ಯಾಕ್ · ಉಧಾರ್",
    phoneLine3Meta: "4 ಪ್ಯಾಕ್ · ಕ್ಯಾಶ್",
    phoneQtyUnit: "ಬಿಲ್",
    featuresLabel: "ವೈಶಿಷ್ಟ್ಯಗಳು",
    how3LineHindi: "WhatsApp · ಇಂದು ಕ್ಯಾಶ್/UPI",
    how3LineEnglish: "ಬಿಲ್ ಜೊತೆ ಸ್ಟಾಕ್ ಈಗಾಗಲೇ ಅಪ್‌ಡೇಟ್",
    hisaab2Line: "ರಮೇಶ್ · ತೆರೆದ ಉಧಾರ್",
    hisaab2Gloss: "ಯಾರ ಖಾತೆ ಇಂದು ತೆರೆದಿದೆ",
    hisaab4Line: "ಬಿಲ್ ಜೊತೆ ಸ್ಟಾಕ್",
    hisaab4Gloss: "ಆ ವಸ್ತುಗಳು ಈಗಾಗಲೇ ಚಲಿಸಿವೆ",
    cmpLabel: "ಏಕೆ Samaan Bol",
    cmpWithoutChrome: "Samaan Bol ಇಲ್ಲದೆ",
    cmpWithChrome: "Samaan Bol ಜೊತೆ",
    langLabel: "ಭಾರತಕ್ಕಾಗಿ",
    chromeLanguage: "ಭಾಷೆ",
    footerRights: "ಎಲ್ಲಾ ಹಕ್ಕುಗಳನ್ನು ಕಾಯ್ದಿರಿಸಲಾಗಿದೆ",
    footerMadeInIndia: "ಭಾರತದಲ್ಲಿ ತಯಾರು ♥ 🇮🇳",
  },
  gu: {
    navFeatures: "ફીચર્સ",
    navAi: "સાંજનું હિસાબ",
    navPricing: "કિંમત",
    navAccount: "સબ્સ્ક્રિપ્શન મેનેજ કરો",
    navDownload: "ડાઉનલોડ",
    heroEyebrow: "કિરાણા કાઉન્ટર માટે",
    heroH1: "બોલી તો તમે ચૂક્યા.<br>બિલ સાથે ચાલે.",
    heroSub: "ગ્રાહક હજુ ઊભો છે. જે લીધું તે બોલો. એપ બિલ પર ચઢાવે છે. કેશ લો, UPI QR બતાવો, અથવા ઉધાર લખો. સ્ટોક બીજી કોપી નથી.",
    heroLanguageProse: "હિન્દી, હિંગ્લિશ, અથવા 10 ભારતીય ભાષાઓ + Englishમાં બોલી શકો.",
    chipCash: "કેશ",
    chipUpi: "UPI",
    chipUdhaar: "ઉધાર",
    ctaDownload: "ડાઉનલોડ — App Store અથવા Google Play",
    ctaSeeHow: "સેલ કેવી રીતે ચાલે છે જુઓ",
    floatGloss: "ચોખા 5 કિલો વેચ્યા · કેશ / UPI?",
    floatSecond: "બિલ તૈયાર · WhatsApp / PDF",
    phoneSearch: "આ બિલમાં શોધો…",
    howLabel: "સેલ કેવી રીતે ચાલે છે",
    howHeading: "ત્રણ પગલાં. ટ્રેનિંગ ક્લાસ નહીં.",
    howSub: "ગ્રાહક રાહ જુએ છે. બંને હાથ ભરેલા હોઈ શકે. આ ભીડ છે, ડેમો નહીં.",
    how1Title: "જે લીધું તે બોલો",
    how1Body: "રોજ બોલો છો એમ બોલો. વૉઇસ ન હોય તો આઇટમ ટૅપ કરો. હિન્દી, હિંગ્લિશ, અથવા 10 ભારતીય ભાષાઓ + English.",
    how1Example: "ચોખા 5 કિલો વેચ્યા",
    how2Title: "પૈસા લો",
    how2Body: "કેશ, QR પર UPIની રકમ બતાવો, અથવા તે ગ્રાહકના ઉધાર પર ચઢાવો. પૈસા લેવા ટૅપ જોઈએ. ફક્ત બોલવાથી UPI જતું નથી.",
    how3Title: "બિલ, આજનું ટોટલ, સ્ટોક",
    how3Body: "આ બિલ ગ્રાહકને WhatsApp પર મોકલો. આજનું કેશ અને UPI ટોટલ ચાલે છે. તે વસ્તુનો સ્ટોક પહેલેથી અપડેટ, પછી અલગ ગણતરી નહીં.",
    f1Title: "સેલ તમે બોલો છો",
    f1Body: "જે લીધું તે રોજ બોલો છો એમ બોલો. કેશ, UPI, અથવા ઉધાર ટૅપથી કન્ફર્મ થાય. આ ગ્રાહકના UPI એપ પર કોલ નથી.",
    f2Title: "10 ભારતીય ભાષાઓ + English",
    f2Body: "હિન્દી, બંગાળી, તમિલ, તેલુગુ, મરાઠી, કન્નડ, ગુજરાતી, મલયાલમ, પંજાબી, ઓડિયા, અને English. હિંગ્લિશ બોલવાની રીત, અલગ ચિપ નહીં.",
    f3Title: "હેલ્પરનો ફોન",
    f3Body: "બીજા કાઉન્ટરનો માણસ પોતાના ફોનથી બિલ કાઢી શકે. હિસાબ આ દુકાનનો રહે, ખાનગી વૉલેટ નહીં.",
    f4Title: "WhatsApp બિલ",
    f4Body: "ઊભા ગ્રાહકને આ બિલ મોકલો. માર્કેટિંગ નહીં. ફક્ત આ બિલ.",
    f5Title: "નામ પર ઉધાર",
    f5Body: "રમેશે આજે ચોખા લીધા. તેના નામ પર બેઠા. મહિના અંતે ડાયરી ઉલટાવવી નહીં. આ લિસ્ટ Premium પર છે.",
    f6Title: "સ્કૅન કરીને આ જ બિલ પર",
    f6Body: "બારકોડ Maggiને આ બિલ પર મૂકે છે. સ્ટોક-ઇન સ્કૅન ત્યારે જ, જ્યારે તમે સ્ટોક ઉમેરો.",
    whatHappens: "કાઉન્ટર પર શું થાય છે.",
    hisaabLabel: "સાંજનું હિસાબ",
    hisaabHindi: "आज कितना कैश आया?",
    hisaabHeading: "દિવસને પૂછો, ડાયરીને નહીં",
    hisaabSub: "ભીડ થંભે ત્યારે પૂછો કેટલું આવ્યું, કોનું ઉધાર હજુ ખુલ્લું છે.",
    hisaab1Title: "આજનું કેશ",
    hisaab1Body: "\"aaj kitna cash aaya\" / આજે કેટલું કેશ આવ્યું?",
    hisaab2Title: "ખુલ્લું ઉધાર",
    hisaab2Body: "કોનું ઉધાર હજુ ખુલ્લું છે?",
    hisaab3Title: "શું વેચાયું",
    hisaab3Body: "\"aaj kitna becha\" / આજે કેટલું વેચાયું?",
    hisaab4Title: "બિલ પછી સ્ટોક",
    hisaab4Body: "તે વસ્તુ સેલ સાથે નીકળી ગઈ. રવિવારની સ્ટોક ગણતરી અલગ માથાનો દુખાવો. આ તે કોપી નથી.",
    langHeading: "કાઉન્ટર પર તમારી ભાષા",
    langSub: "હિન્દી, હિંગ્લિશ, અથવા 10 ભારતીય ભાષાઓ + English. તમે માલને બોલાવો છો તે નામ.",
    cmpWithoutHeading: "ભીડમાં, કાગળ પર",
    cmpWithout1: "લખતાં લખતાં ગ્રાહક રાહ જુએ",
    cmpWithout2: "ડાયરીમાં ઉધાર",
    cmpWithout3: "લાંબા અઠવાડિયા પછી રવિવારે સ્ટોક ગણતરી",
    cmpWithout4: "UPI અને કેશ બે જગ્યાએ",
    cmpWithout5: "હેલ્પર ટાઇપિંગમાં ધીમો",
    cmpWithout6: "સાંજનું હિસાબ કેશ બોક્સ સાથે ન મળે",
    cmpWithHeading: "તે વાક્ય જે તમે બોલી ચૂક્યા",
    cmpWith1: "જે લીધું તે બોલો, બિલ સાથે ચાલે છે",
    cmpWith2: "કેશ, UPI QR, અથવા ઉધાર તે જ બિલ પર",
    cmpWith3: "તે વસ્તુનો સ્ટોક પહેલેથી ચાલ્યો",
    cmpWith4: "ઊભા ગ્રાહકને WhatsApp બિલ",
    cmpWith5: "આજનું કેશ અને UPI એક જગ્યાએ",
    cmpWith6: "હેલ્પરનો ફોન પણ આ દુકાનના હિસાબમાં",
    eveningMatch: "સાંજે બોક્સ સાથે મેળ ખાવું જોઈએ",
    proofLabel: "ઉદાહરણો",
    proofHeading: "બેંગલુરુ કાઉન્ટરથી (ઉદાહરણો)",
    ctaLabel: "શરૂ કરો",
    ctaHindi: "आज दुकान पर आज़माएँ",
    ctaHeading: "આગલા ગ્રાહક પર અજમાવો, શાંત રવિવારે નહીં",
    ctaSub: "App Store અથવા Google Playથી ડાઉનલોડ. નવી દુકાનને એપમાં 7 દિવસ વૉઇસ, કાર્ડ નહીં. પહેલા ચાર્જની રિફંડ વિન્ડો અલગ છે.",
    footerBlurb: "કિરાણા કાઉન્ટર માટે. જે લીધું તે બોલો. બિલ સાથે ચાલે છે.",
    footerContact: "સંપર્ક",
    footerRefund: "રિફંડ નીતિ",
    footerPrivacy: "પ્રાઇવસી",
    footerTerms: "શરતો",
    heroStatCashLabel: "બિલ પર",
    heroStatUpiLabel: "QR રકમ",
    heroStatUdhaarLabel: "નામ પર",
    floatCustomer: "ઊભા ગ્રાહકને",
    phoneGreeting: "શુભ સાંજ",
    phoneShopName: "કિરાણા કાઉન્ટર",
    phoneTodaySales: "આજની સેલ",
    phoneBillsToday: "આજના બિલ",
    phoneStatCash: "કેશ",
    phoneLine1Name: "ચોખા 5 કિલો",
    phoneLine1Meta: "કેશ · UPI?",
    phoneLine2Meta: "2 પેક · ઉધાર",
    phoneLine3Meta: "4 પેક · કેશ",
    phoneQtyUnit: "બિલ",
    featuresLabel: "ફીચર્સ",
    how3LineHindi: "WhatsApp · આજે કેશ/UPI",
    how3LineEnglish: "બિલ સાથે સ્ટોક પહેલેથી અપડેટ",
    hisaab2Line: "રમેશ · ખુલ્લું ઉધાર",
    hisaab2Gloss: "કોનું ખાતું આજે ખુલ્લું છે",
    hisaab4Line: "બિલ સાથે સ્ટોક",
    hisaab4Gloss: "તે વસ્તુઓ પહેલેથી ખસી ગઈ",
    cmpLabel: "શા માટે Samaan Bol",
    cmpWithoutChrome: "Samaan Bol વગર",
    cmpWithChrome: "Samaan Bol સાથે",
    langLabel: "ભારત માટે",
    chromeLanguage: "ભાષા",
    footerRights: "સર્વ હક્કો સુરક્ષિત",
    footerMadeInIndia: "ભારતમાં બનાવેલ ♥ 🇮🇳",
  },
  ml: {
    navFeatures: "ഫീച്ചറുകൾ",
    navAi: "വൈകുന്നേരത്തെ കണക്ക്",
    navPricing: "വില",
    navAccount: "സബ്‌സ്‌ക്രിപ്‌ഷൻ മാനേജ് ചെയ്യുക",
    navDownload: "ഡൗൺലോഡ്",
    heroEyebrow: "കിരാന കൗണ്ടറിന്",
    heroH1: "വായ്കൊണ്ട് പറഞ്ഞുകഴിഞ്ഞു.<br>ബില്ലും കൂടെ വരട്ടെ.",
    heroSub: "കസ്റ്റമർ ഇപ്പോഴും നിൽക്കുന്നു. എടുത്തത് പറയൂ. ആപ്പ് ബില്ലിൽ ഇടും. ക്യാഷ് വാങ്ങൂ, UPI QR കാണിക്കൂ, അല്ലെങ്കിൽ ഉധാർ എഴുതൂ. സ്റ്റോക്ക് രണ്ടാമത്തെ നോട്ട്ബുക്ക് അല്ല.",
    heroLanguageProse: "ഹിന്ദി, ഹിംഗ്ലിഷ്, അല്ലെങ്കിൽ 10 ഇന്ത്യൻ ഭാഷകൾ + English-ൽ സംസാരിക്കാം.",
    chipCash: "ക്യാഷ്",
    chipUpi: "UPI",
    chipUdhaar: "ഉധാർ",
    ctaDownload: "ഡൗൺലോഡ് — App Store അല്ലെങ്കിൽ Google Play",
    ctaSeeHow: "ഒരു സെയിൽ എങ്ങനെ നടക്കുന്നു കാണൂ",
    floatGloss: "അരി 5 കിലോ വിറ്റു · ക്യാഷ് / UPI?",
    floatSecond: "ബിൽ തയ്യാർ · WhatsApp / PDF",
    phoneSearch: "ഈ ബില്ലിൽ തിരയൂ…",
    howLabel: "ഒരു സെയിൽ എങ്ങനെ നടക്കുന്നു",
    howHeading: "മൂന്ന് ഘട്ടം. ട്രെയിനിങ് ക്ലാസ് ഇല്ല.",
    howSub: "കസ്റ്റമർ കാത്തിരിക്കുന്നു. രണ്ട് കൈയും നിറഞ്ഞിരിക്കാം. ഇത് തിരക്ക്, ഡെമോ അല്ല.",
    how1Title: "എടുത്തത് പറയൂ",
    how1Body: "ദിവസവും പറയുന്നത് പോലെ പറയൂ. വോയ്‌സ് ഇല്ലെങ്കിൽ ഐറ്റം ടാപ്പ് ചെയ്യൂ. ഹിന്ദി, ഹിംഗ്ലിഷ്, അല്ലെങ്കിൽ 10 ഇന്ത്യൻ ഭാഷകൾ + English.",
    how1Example: "അരി 5 കിലോ വിറ്റു",
    how2Title: "പണം വാങ്ങൂ",
    how2Body: "ക്യാഷ്, QR-ൽ UPI തുക കാണിക്കൂ, അല്ലെങ്കിൽ ആ കസ്റ്റമറുടെ ഉധാറിൽ ചേർക്കൂ. പണം വാങ്ങാൻ ടാപ്പ് വേണം. പറച്ചിൽ കൊണ്ട് മാത്രം UPI പോകില്ല.",
    how3Title: "ബിൽ, ഇന്നത്തെ ടോട്ടൽ, സ്റ്റോക്ക്",
    how3Body: "ഈ ബിൽ കസ്റ്റമറിന് WhatsApp-ൽ അയയ്ക്കൂ. ഇന്നത്തെ ക്യാഷും UPI ടോട്ടലും നീങ്ങും. ആ സാധനങ്ങളുടെ സ്റ്റോക്ക് ഇതിനകം അപ്‌ഡേറ്റ്, പിന്നെ പ്രത്യേകം എണ്ണേണ്ട.",
    f1Title: "സെയിൽ നിങ്ങൾ പറയുന്നു",
    f1Body: "എടുത്തത് ദിവസവും പറയുന്നത് പോലെ പറയൂ. ക്യാഷ്, UPI, അല്ലെങ്കിൽ ഉധാർ ടാപ്പിൽ കൺഫേം. ഇത് കസ്റ്റമറുടെ UPI ആപ്പിലേക്കുള്ള കോൾ അല്ല.",
    f2Title: "10 ഇന്ത്യൻ ഭാഷകൾ + English",
    f2Body: "ഹിന്ദി, ബംഗാളി, തമിഴ്, തെലുങ്ക്, മറാത്തി, കന്നഡ, ഗുജറാത്തി, മലയാളം, പഞ്ചാബി, ഒഡിയ, ഒപ്പം English. ഹിംഗ്ലിഷ് സംസാരരീതി, പ്രത്യേക ചിപ്പ് അല്ല.",
    f3Title: "ഹെൽപ്പറുടെ ഫോൺ",
    f3Body: "മറ്റേ കൗണ്ടറിലുള്ളയാൾ സ്വന്തം ഫോണിൽ ബിൽ ഇടാം. ഹിസാബ് ഈ കടയുടേതു തന്നെ, സ്വകാര്യ വാലറ്റ് അല്ല.",
    f4Title: "WhatsApp ബിൽ",
    f4Body: "നിൽക്കുന്ന കസ്റ്റമറിന് ഈ ബിൽ അയയ്ക്കൂ. മാർക്കറ്റിങ് അല്ല. ഈ ബിൽ മാത്രം.",
    f5Title: "പേരിൽ ഉധാർ",
    f5Body: "രമേഷ് ഇന്ന് അരി എടുത്തു. അയാളുടെ പേരിൽ ഇരിക്കുന്നു. മാസാവസാനം ഡയറി മറിക്കേണ്ട. ഈ ലിസ്റ്റ് Premium-ൽ.",
    f6Title: "സ്കാൻ ചെയ്ത് ഈ ബില്ലിലേക്ക്",
    f6Body: "ബാർകോഡ് Maggi ഈ ബില്ലിൽ ഇടും. സ്റ്റോക്ക്-ഇൻ സ്കാൻ നിങ്ങൾ സ്റ്റോക്ക് ചേർക്കുമ്പോൾ മാത്രം.",
    whatHappens: "കൗണ്ടറിൽ എന്ത് നടക്കുന്നു.",
    hisaabLabel: "വൈകുന്നേരത്തെ കണക്ക്",
    hisaabHindi: "आज कितना कैश आया?",
    hisaabHeading: "ദിവസത്തോട് ചോദിക്കൂ, ഡയറിയോടല്ല",
    hisaabSub: "തിരക്ക് കുറഞ്ഞാൽ എത്ര വന്നു, ആരുടെ ഉധാർ ഇപ്പോഴും തുറന്നിരിക്കുന്നു എന്ന് ചോദിക്കൂ.",
    hisaab1Title: "ഇന്നത്തെ ക്യാഷ്",
    hisaab1Body: "\"aaj kitna cash aaya\" / ഇന്ന് എത്ര ക്യാഷ് വന്നു?",
    hisaab2Title: "തുറന്ന ഉധാർ",
    hisaab2Body: "ആരുടെ ഉധാർ ഇപ്പോഴും തുറന്നിരിക്കുന്നു?",
    hisaab3Title: "എന്ത് വിറ്റു",
    hisaab3Body: "\"aaj kitna becha\" / ഇന്ന് എത്ര വിറ്റു?",
    hisaab4Title: "ബില്ലിന് ശേഷം സ്റ്റോക്ക്",
    hisaab4Body: "ആ സാധനങ്ങൾ സെയിലിനൊപ്പം നീങ്ങിയിട്ടുണ്ട്. ഞായറാഴ്ചത്തെ സ്റ്റോക്ക് എണ്ണൽ വേറെ തലവേദന. ഇതല്ല ആ നോട്ട്ബുക്ക്.",
    langHeading: "കൗണ്ടറിൽ നിങ്ങളുടെ ഭാഷ",
    langSub: "ഹിന്ദി, ഹിംഗ്ലിഷ്, അല്ലെങ്കിൽ 10 ഇന്ത്യൻ ഭാഷകൾ + English. നിങ്ങൾ സാധനത്തെ വിളിക്കുന്ന പേരുകളും.",
    cmpWithoutHeading: "തിരക്കിൽ, കടലാസിൽ",
    cmpWithout1: "നിങ്ങൾ എഴുതുമ്പോൾ കസ്റ്റമർ കാത്തിരിക്കൽ",
    cmpWithout2: "ഡയറിയിൽ ഉധാർ",
    cmpWithout3: "നീണ്ട ആഴ്ചയ്ക്ക് ശേഷം ഞായറാഴ്ച സ്റ്റോക്ക് എണ്ണൽ",
    cmpWithout4: "UPIയും ക്യാഷും രണ്ടിടത്ത്",
    cmpWithout5: "ഹെൽപ്പർ ടൈപ്പിങ്ങിൽ മന്ദം",
    cmpWithout6: "വൈകുന്നേരത്തെ കണക്ക് ക്യാഷ് ബോക്സുമായി ചേരുന്നില്ല",
    cmpWithHeading: "നിങ്ങൾ ഇതിനകം പറഞ്ഞ വാക്യം",
    cmpWith1: "എടുത്തത് പറയൂ, ബിൽ കൂടെ വരും",
    cmpWith2: "ക്യാഷ്, UPI QR, അല്ലെങ്കിൽ ഉധാർ ആ ബില്ലിൽ",
    cmpWith3: "ആ സാധനങ്ങളുടെ സ്റ്റോക്ക് ഇതിനകം നീങ്ങി",
    cmpWith4: "നിൽക്കുന്ന കസ്റ്റമറിന് WhatsApp ബിൽ",
    cmpWith5: "ഇന്നത്തെ ക്യാഷും UPIയും ഒരിടത്ത്",
    cmpWith6: "ഹെൽപ്പറുടെ ഫോണും ഈ കടയുടെ ഹിസാബിലേക്ക്",
    eveningMatch: "വൈകുന്നേരം ബോക്സുമായി ചേരണം",
    proofLabel: "ഉദാഹരണങ്ങൾ",
    proofHeading: "ബെംഗളൂരു കൗണ്ടറുകളിൽ നിന്ന് (ഉദാഹരണങ്ങൾ)",
    ctaLabel: "തുടങ്ങൂ",
    ctaHindi: "आज दुकान पर आज़माएँ",
    ctaHeading: "അടുത്ത കസ്റ്റമറിൽ പരീക്ഷിക്കൂ, ശാന്തമായ ഞായറാഴ്ചയിലല്ല",
    ctaSub: "App Store അല്ലെങ്കിൽ Google Play-ൽ നിന്ന് ഡൗൺലോഡ്. പുതിയ കടയ്ക്ക് ആപ്പിൽ 7 ദിവസം വോയ്‌സ്, കാർഡ് വേണ്ട. ആദ്യ ചാർജ് റിഫണ്ട് വിൻഡോ പ്രത്യേകം.",
    footerBlurb: "കിരാന കൗണ്ടറിന്. എടുത്തത് പറയൂ. ബിൽ കൂടെ വരും.",
    footerContact: "ബന്ധപ്പെടുക",
    footerRefund: "റിഫണ്ട് നയം",
    footerPrivacy: "സ്വകാര്യത",
    footerTerms: "നിബന്ധനകൾ",
    heroStatCashLabel: "ബില്ലിൽ",
    heroStatUpiLabel: "QR തുക",
    heroStatUdhaarLabel: "പേരിൽ",
    floatCustomer: "നിൽക്കുന്ന കസ്റ്റമറിന്",
    phoneGreeting: "ശുഭ സന്ധ്യ",
    phoneShopName: "കിരാന കൗണ്ടർ",
    phoneTodaySales: "ഇന്നത്തെ സെയിൽ",
    phoneBillsToday: "ഇന്നത്തെ ബില്ലുകൾ",
    phoneStatCash: "ക്യാഷ്",
    phoneLine1Name: "അരി 5 കിലോ",
    phoneLine1Meta: "ക്യാഷ് · UPI?",
    phoneLine2Meta: "2 പായ്ക്ക് · ഉധാർ",
    phoneLine3Meta: "4 പായ്ക്ക് · ക്യാഷ്",
    phoneQtyUnit: "ബിൽ",
    featuresLabel: "ഫീച്ചറുകൾ",
    how3LineHindi: "WhatsApp · ഇന്ന് ക്യാഷ്/UPI",
    how3LineEnglish: "ബില്ലിനൊപ്പം സ്റ്റോക്ക് ഇതിനകം അപ്‌ഡേറ്റ്",
    hisaab2Line: "രമേഷ് · തുറന്ന ഉധാർ",
    hisaab2Gloss: "ആരുടെ ഖാതാ ഇന്ന് തുറന്നിരിക്കുന്നു",
    hisaab4Line: "ബില്ലിനൊപ്പം സ്റ്റോക്ക്",
    hisaab4Gloss: "ആ സാധനങ്ങൾ ഇതിനകം നീങ്ങി",
    cmpLabel: "എന്തുകൊണ്ട് Samaan Bol",
    cmpWithoutChrome: "Samaan Bol ഇല്ലാതെ",
    cmpWithChrome: "Samaan Bol ഉപയോഗിച്ച്",
    langLabel: "ഭാരതത്തിനായി",
    chromeLanguage: "ഭാഷ",
    footerRights: "എല്ലാ അവകാശങ്ങളും നിക്ഷിപ്തം",
    footerMadeInIndia: "ഇന്ത്യയിൽ നിർമ്മിച്ചത് ♥ 🇮🇳",
  },
  or: {
    navFeatures: "ଫିଚର୍ସ",
    navAi: "ସନ୍ଧ୍ୟା ହିସାବ",
    navPricing: "ମୂଲ୍ୟ",
    navAccount: "ସବ୍‌ସ୍କ୍ରିପ୍ସନ୍ ମ୍ୟାନେଜ୍ କରନ୍ତୁ",
    navDownload: "ଡାଉନଲୋଡ୍",
    heroEyebrow: "କିରାଣା କାଉଣ୍ଟର ପାଇଁ",
    heroH1: "କହି ତ ସାରିଲେ।<br>ବିଲ୍ ସାଙ୍ଗରେ ଚାଲୁ।",
    heroSub: "ଗ୍ରାହକ ଏବେ ବି ଠିଆ। ଯାହା ନେଲେ ତାହା କୁହନ୍ତୁ। ଆପ୍ ବିଲ୍‌ରେ ଚଢ଼ାଏ। କ୍ୟାଶ୍ ନିଅନ୍ତୁ, UPI QR ଦେଖାନ୍ତୁ, କିମ୍ବା ଉଧାର ଲେଖନ୍ତୁ। ଷ୍ଟକ୍ ଦ୍ୱିତୀୟ ଖାତା ନୁହେଁ।",
    heroLanguageProse: "ହିନ୍ଦୀ, ହିଙ୍ଗ୍ଲିଶ୍, କିମ୍ବା 10 ଭାରତୀୟ ଭାଷା + Englishରେ କହିପାରିବେ।",
    chipCash: "କ୍ୟାଶ୍",
    chipUpi: "UPI",
    chipUdhaar: "ଉଧାର",
    ctaDownload: "ଡାଉନଲୋଡ୍ — App Store କିମ୍ବା Google Play",
    ctaSeeHow: "ସେଲ୍ କିପରି ଚାଲେ ଦେଖନ୍ତୁ",
    floatGloss: "ଚାଉଳ 5 କିଲୋ ବିକିଲା · କ୍ୟାଶ୍ / UPI?",
    floatSecond: "ବିଲ୍ ତିଆରି · WhatsApp / PDF",
    phoneSearch: "ଏହି ବିଲ୍‌ରେ ଖୋଜନ୍ତୁ…",
    howLabel: "ସେଲ୍ କିପରି ଚାଲେ",
    howHeading: "ତିନି ପାଦ। ଟ୍ରେନିଂ କ୍ଲାସ୍ ନାହିଁ।",
    howSub: "ଗ୍ରାହକ ଅପେକ୍ଷାରେ। ଦୁଇ ହାତ ଭରା ରହିପାରେ। ଏହା ଭିଡ଼, ଡେମୋ ନୁହେଁ।",
    how1Title: "ଯାହା ନେଲେ ତାହା କୁହନ୍ତୁ",
    how1Body: "ଯେମିତି ରୋଜ କୁହନ୍ତି ସେମିତି କୁହନ୍ତୁ। ଭଏସ୍ ନଥିଲେ ଆଇଟମ୍ ଟ୍ୟାପ୍ କରନ୍ତୁ। ହିନ୍ଦୀ, ହିଙ୍ଗ୍ଲିଶ୍, କିମ୍ବା 10 ଭାରତୀୟ ଭାଷା + English।",
    how1Example: "ଚାଉଳ 5 କିଲୋ ବିକିଲା",
    how2Title: "ଟଙ୍କା ନିଅନ୍ତୁ",
    how2Body: "କ୍ୟାଶ୍, QRରେ UPI ରାଶି ଦେଖାନ୍ତୁ, କିମ୍ବା ସେହି ଗ୍ରାହକଙ୍କ ଉଧାରରେ ଚଢ଼ାନ୍ତୁ। ଟଙ୍କା ନେବାକୁ ଟ୍ୟାପ୍ ଲାଗିବ। କେବଳ କହିଲେ UPI ଯାଏ ନାହିଁ।",
    how3Title: "ବିଲ୍, ଆଜିର ଟୋଟାଲ୍, ଷ୍ଟକ୍",
    how3Body: "ଏହି ବିଲ୍ ଗ୍ରାହକଙ୍କୁ WhatsAppରେ ପଠାନ୍ତୁ। ଆଜିର କ୍ୟାଶ୍ ଓ UPI ଟୋଟାଲ୍ ଚାଲେ। ସେହି ଜିନିଷର ଷ୍ଟକ୍ ଆଗରୁ ଅପଡେଟ୍, ପରେ ଅଲଗା ଗଣନା ନାହିଁ।",
    f1Title: "ସେଲ୍ ଆପଣ କୁହନ୍ତି",
    f1Body: "ଯାହା ନେଲେ ତାହା ରୋଜ କହିବା ଭଳି କୁହନ୍ତୁ। କ୍ୟାଶ୍, UPI, କିମ୍ବା ଉଧାର ଟ୍ୟାପ୍‌ରେ କନଫର୍ମ। ଏହା ଗ୍ରାହକଙ୍କ UPI ଆପ୍‌କୁ କଲ୍ ନୁହେଁ।",
    f2Title: "10 ଭାରତୀୟ ଭାଷା + English",
    f2Body: "ହିନ୍ଦୀ, ବଙ୍ଗାଳୀ, ତାମିଲ୍, ତେଲୁଗୁ, ମରାଠୀ, କନ୍ନଡ଼, ଗୁଜରାଟୀ, ମଲୟାଲମ୍, ପଞ୍ଜାବୀ, ଓଡ଼ିଆ, ଏବଂ English। ହିଙ୍ଗ୍ଲିଶ୍ କଥାର ଢଙ୍ଗ, ଅଲଗା ଚିପ୍ ନୁହେଁ।",
    f3Title: "ହେଲ୍ପର ଫୋନ୍",
    f3Body: "ଅନ୍ୟ କାଉଣ୍ଟରର ଲୋକ ନିଜ ଫୋନରେ ବିଲ୍ କାଟିପାରନ୍ତି। ହିସାବ ଏହି ଦୋକାନର, ବ୍ୟକ୍ତିଗତ ୱାଲେଟ୍ ନୁହେଁ।",
    f4Title: "WhatsApp ବିଲ୍",
    f4Body: "ଠିଆ ଗ୍ରାହକଙ୍କୁ ଏହି ବିଲ୍ ପଠାନ୍ତୁ। ମାର୍କେଟିଂ ନୁହେଁ। କେବଳ ଏହି ବିଲ୍।",
    f5Title: "ନାମରେ ଉଧାର",
    f5Body: "ରମେଶ ଆଜି ଚାଉଳ ନେଲେ। ତାଙ୍କ ନାମରେ ବସିଛି। ମାସ ଶେଷରେ ଡାଏରୀ ଓଲଟାଇବା ନାହିଁ। ଏହି ଲିଷ୍ଟ Premiumରେ।",
    f6Title: "ସ୍କାନ୍ କରି ଏହି ବିଲ୍‌ରେ",
    f6Body: "ବାରକୋଡ୍ Maggiକୁ ଏହି ବିଲ୍‌ରେ ପକାଏ। ଷ୍ଟକ୍-ଇନ୍ ସ୍କାନ୍ କେବଳ ଯେତେବେଳେ ଆପଣ ଷ୍ଟକ୍ ଯୋଡ଼ନ୍ତି।",
    whatHappens: "କାଉଣ୍ଟରରେ କ’ଣ ଚାଲେ।",
    hisaabLabel: "ସନ୍ଧ୍ୟା ହିସାବ",
    hisaabHindi: "आज कितना कैश आया?",
    hisaabHeading: "ଦିନକୁ ପଚାରନ୍ତୁ, ଡାଏରୀକୁ ନୁହେଁ",
    hisaabSub: "ଭିଡ଼ କମିଲେ ପଚାରନ୍ତୁ କେତେ ଆସିଲା, କାହାର ଉଧାର ଏବେ ବି ଖୋଲା।",
    hisaab1Title: "ଆଜିର କ୍ୟାଶ୍",
    hisaab1Body: "\"aaj kitna cash aaya\" / ଆଜି କେତେ କ୍ୟାଶ୍ ଆସିଲା?",
    hisaab2Title: "ଖୋଲା ଉଧାର",
    hisaab2Body: "କାହାର ଉଧାର ଏବେ ବି ଖୋଲା?",
    hisaab3Title: "କ’ଣ ବିକିଲା",
    hisaab3Body: "\"aaj kitna becha\" / ଆଜି କେତେ ବିକିଲା?",
    hisaab4Title: "ବିଲ୍ ପରେ ଷ୍ଟକ୍",
    hisaab4Body: "ସେହି ଜିନିଷ ସେଲ୍ ସାଥିରେ ଖସିଲା। ରବିବାର ଷ୍ଟକ୍ ଗଣନା ଅଲଗା ମୁଣ୍ଡବ୍ୟଥା। ଏହା ସେହି ଖାତା ନୁହେଁ।",
    langHeading: "କାଉଣ୍ଟରରେ ଆପଣଙ୍କ ଭାଷା",
    langSub: "ହିନ୍ଦୀ, ହିଙ୍ଗ୍ଲିଶ୍, କିମ୍ବା 10 ଭାରତୀୟ ଭାଷା + English। ଯେଉଁ ନାମରେ ଆପଣ ମାଲ ଡାକନ୍ତି।",
    cmpWithoutHeading: "ଭିଡ଼ରେ, କାଗଜରେ",
    cmpWithout1: "ଲେଖିବା ବେଳେ ଗ୍ରାହକ ଅପେକ୍ଷା",
    cmpWithout2: "ଡାଏରୀରେ ଉଧାର",
    cmpWithout3: "ଲମ୍ବା ସପ୍ତାହ ପରେ ରବିବାର ଷ୍ଟକ୍ ଗଣନା",
    cmpWithout4: "UPI ଓ କ୍ୟାଶ୍ ଦୁଇ ଠାରେ",
    cmpWithout5: "ହେଲ୍ପର ଟାଇପିଙ୍ଗରେ ଧୀର",
    cmpWithout6: "ସନ୍ଧ୍ୟା ହିସାବ କ୍ୟାଶ୍ ବକ୍ସ ସହ ମେଳ ଖାଏ ନାହିଁ",
    cmpWithHeading: "ଯେଉଁ ବାକ୍ୟ ଆପଣ କହିସାରିଲେ",
    cmpWith1: "ଯାହା ନେଲେ ତାହା କୁହନ୍ତୁ, ବିଲ୍ ସାଙ୍ଗରେ ଚାଲେ",
    cmpWith2: "କ୍ୟାଶ୍, UPI QR, କିମ୍ବା ଉଧାର ସେହି ବିଲ୍‌ରେ",
    cmpWith3: "ସେହି ଜିନିଷର ଷ୍ଟକ୍ ଆଗରୁ ଚାଲିଲା",
    cmpWith4: "ଠିଆ ଗ୍ରାହକଙ୍କୁ WhatsApp ବିଲ୍",
    cmpWith5: "ଆଜିର କ୍ୟାଶ୍ ଓ UPI ଏକା ଠାରେ",
    cmpWith6: "ହେଲ୍ପର ଫୋନ୍ ମଧ୍ୟ ଏହି ଦୋକାନ ହିସାବରେ",
    eveningMatch: "ସନ୍ଧ୍ୟାରେ ବକ୍ସ ସହ ମେଳ ଖାଇବା ଉଚିତ",
    proofLabel: "ଉଦାହରଣ",
    proofHeading: "ବେଙ୍ଗାଲୁରୁ କାଉଣ୍ଟରରୁ (ଉଦାହରଣ)",
    ctaLabel: "ଆରମ୍ଭ କରନ୍ତୁ",
    ctaHindi: "आज दुकान पर आज़माएँ",
    ctaHeading: "ପରବର୍ତ୍ତୀ ଗ୍ରାହକ ଉପରେ ଚେଷ୍ଟା କରନ୍ତୁ, ଶାନ୍ତ ରବିବାରରେ ନୁହେଁ",
    ctaSub: "App Store କିମ୍ବା Google Playରୁ ଡାଉନଲୋଡ୍। ନୂଆ ଦୋକାନକୁ ଆପ୍‌ରେ 7 ଦିନ ଭଏସ୍, କାର୍ଡ ନାହିଁ। ପ୍ରଥମ ଚାର୍ଜ ରିଫଣ୍ଡ ୱିଣ୍ଡୋ ଅଲଗା।",
    footerBlurb: "କିରାଣା କାଉଣ୍ଟର ପାଇଁ। ଯାହା ନେଲେ ତାହା କୁହନ୍ତୁ। ବିଲ୍ ସାଙ୍ଗରେ ଚାଲେ।",
    footerContact: "ଯୋଗାଯୋଗ",
    footerRefund: "ରିଫଣ୍ଡ ନୀତି",
    footerPrivacy: "ଗୋପନୀୟତା",
    footerTerms: "ସର୍ତ୍ତ",
    heroStatCashLabel: "ବିଲ୍‌ରେ",
    heroStatUpiLabel: "QR ରାଶି",
    heroStatUdhaarLabel: "ନାମରେ",
    floatCustomer: "ଠିଆ ଗ୍ରାହକଙ୍କୁ",
    phoneGreeting: "ଶୁଭ ସନ୍ଧ୍ୟା",
    phoneShopName: "କିରାଣା କାଉଣ୍ଟର",
    phoneTodaySales: "ଆଜିର ସେଲ୍",
    phoneBillsToday: "ଆଜିର ବିଲ୍",
    phoneStatCash: "କ୍ୟାଶ୍",
    phoneLine1Name: "ଚାଉଳ 5 କିଲୋ",
    phoneLine1Meta: "କ୍ୟାଶ୍ · UPI?",
    phoneLine2Meta: "2 ପ୍ୟାକ୍ · ଉଧାର",
    phoneLine3Meta: "4 ପ୍ୟାକ୍ · କ୍ୟାଶ୍",
    phoneQtyUnit: "ବିଲ୍",
    featuresLabel: "ଫିଚର୍ସ",
    how3LineHindi: "WhatsApp · ଆଜି କ୍ୟାଶ୍/UPI",
    how3LineEnglish: "ବିଲ୍ ସାଙ୍ଗେ ଷ୍ଟକ୍ ଆଗରୁ ଅପଡେଟ୍",
    hisaab2Line: "ରମେଶ · ଖୋଲା ଉଧାର",
    hisaab2Gloss: "କାହାର ଖାତା ଆଜି ଖୋଲା",
    hisaab4Line: "ବିଲ୍ ସାଙ୍ଗେ ଷ୍ଟକ୍",
    hisaab4Gloss: "ସେହି ଜିନିଷ ଆଗରୁ ଖସିଲା",
    cmpLabel: "କାହିଁକି Samaan Bol",
    cmpWithoutChrome: "Samaan Bol ବିନା",
    cmpWithChrome: "Samaan Bol ସହିତ",
    langLabel: "ଭାରତ ପାଇଁ",
    chromeLanguage: "ଭାଷା",
    footerRights: "ସମସ୍ତ ଅଧିକାର ସଂରକ୍ଷିତ",
    footerMadeInIndia: "ଭାରତରେ ତିଆରି ♥ 🇮🇳",
  },
  pa: {
    navFeatures: "ਫੀਚਰ",
    navAi: "ਸ਼ਾਮ ਦਾ ਹਿਸਾਬ",
    navPricing: "ਕੀਮਤ",
    navAccount: "ਸਬਸਕ੍ਰਿਪਸ਼ਨ ਮੈਨੇਜ ਕਰੋ",
    navDownload: "ਡਾਊਨਲੋਡ",
    heroEyebrow: "ਕਿਰਾਨਾ ਕਾਊਂਟਰ ਲਈ",
    heroH1: "ਬੋਲ ਤਾਂ ਤੁਸੀਂ ਚੁੱਕੇ।<br>ਬਿੱਲ ਨਾਲ ਚੱਲੇ।",
    heroSub: "ਗਾਹਕ ਹਾਲੇ ਖੜ੍ਹਾ ਹੈ। ਜੋ ਲਿਆ ਉਹ ਬੋਲੋ। ਐਪ ਬਿੱਲ ’ਤੇ ਚਾੜ੍ਹ ਦਿੰਦੀ ਹੈ। ਕੈਸ਼ ਲਓ, UPI QR ਵਿਖਾਓ, ਜਾਂ ਉਧਾਰ ਲਿਖ ਦਿਓ। ਸਟਾਕ ਦੂਜੀ ਕਾਪੀ ਨਹੀਂ।",
    heroLanguageProse: "ਹਿੰਦੀ, ਹਿੰਗਲਿਸ਼, ਜਾਂ 10 ਭਾਰਤੀ ਭਾਸ਼ਾਵਾਂ + English ਵਿੱਚ ਬੋਲ ਸਕਦੇ ਹੋ।",
    chipCash: "ਕੈਸ਼",
    chipUpi: "UPI",
    chipUdhaar: "ਉਧਾਰ",
    ctaDownload: "ਡਾਊਨਲੋਡ — App Store ਜਾਂ Google Play",
    ctaSeeHow: "ਸੇਲ ਕਿਵੇਂ ਚੱਲਦੀ ਹੈ ਵੇਖੋ",
    floatGloss: "ਚੌਲ 5 ਕਿਲੋ ਵਿਕੇ · ਕੈਸ਼ / UPI?",
    floatSecond: "ਬਿੱਲ ਤਿਆਰ · WhatsApp / PDF",
    phoneSearch: "ਇਸ ਬਿੱਲ ਵਿੱਚ ਖੋਜੋ…",
    howLabel: "ਸੇਲ ਕਿਵੇਂ ਚੱਲਦੀ ਹੈ",
    howHeading: "ਤਿੰਨ ਕਦਮ। ਟ੍ਰੇਨਿੰਗ ਕਲਾਸ ਨਹੀਂ।",
    howSub: "ਗਾਹਕ ਉਡੀਕ ਵਿੱਚ ਹੈ। ਦੋਵੇਂ ਹੱਥ ਭਰੇ ਹੋ ਸਕਦੇ ਹਨ। ਇਹ ਭੀੜ ਹੈ, ਡੇਮੋ ਨਹੀਂ।",
    how1Title: "ਜੋ ਲਿਆ ਉਹ ਬੋਲੋ",
    how1Body: "ਜਿਵੇਂ ਰੋਜ਼ ਬੋਲਦੇ ਹੋ ਉਵੇਂ ਬੋਲੋ। ਵੌਇਸ ਨਾ ਹੋਵੇ ਤਾਂ ਆਈਟਮ ਟੈਪ ਕਰੋ। ਹਿੰਦੀ, ਹਿੰਗਲਿਸ਼, ਜਾਂ 10 ਭਾਰਤੀ ਭਾਸ਼ਾਵਾਂ + English।",
    how1Example: "ਚੌਲ 5 ਕਿਲੋ ਵਿਕੇ",
    how2Title: "ਪੈਸੇ ਲਓ",
    how2Body: "ਕੈਸ਼, QR ’ਤੇ UPI ਦੀ ਰਕਮ ਵਿਖਾਓ, ਜਾਂ ਉਸ ਗਾਹਕ ਦੇ ਉਧਾਰ ’ਤੇ ਚਾੜ੍ਹੋ। ਪੈਸੇ ਲੈਣ ਲਈ ਟੈਪ ਲੱਗੇਗਾ। ਸਿਰਫ਼ ਬੋਲਣ ਨਾਲ UPI ਨਹੀਂ ਜਾਂਦਾ।",
    how3Title: "ਬਿੱਲ, ਅੱਜ ਦਾ ਟੋਟਲ, ਸਟਾਕ",
    how3Body: "ਇਹ ਬਿੱਲ ਗਾਹਕ ਨੂੰ WhatsApp ’ਤੇ ਭੇਜੋ। ਅੱਜ ਦਾ ਕੈਸ਼ ਤੇ UPI ਟੋਟਲ ਚੱਲ ਪੈਂਦਾ ਹੈ। ਉਨ੍ਹਾਂ ਚੀਜ਼ਾਂ ਦਾ ਸਟਾਕ ਪਹਿਲਾਂ ਹੀ ਅੱਪਡੇਟ, ਬਾਅਦ ਵਿੱਚ ਵੱਖਰੀ ਗਿਣਤੀ ਨਹੀਂ।",
    f1Title: "ਸੇਲ ਤੁਸੀਂ ਬੋਲਦੇ ਹੋ",
    f1Body: "ਜੋ ਲਿਆ ਉਹ ਉਸੇ ਤਰ੍ਹਾਂ ਬੋਲੋ ਜਿਵੇਂ ਰੋਜ਼ ਬੋਲਦੇ ਹੋ। ਕੈਸ਼, UPI, ਜਾਂ ਉਧਾਰ ਟੈਪ ਨਾਲ ਕਨਫਰਮ ਹੁੰਦਾ ਹੈ। ਇਹ ਗਾਹਕ ਦੇ UPI ਐਪ ’ਤੇ ਕਾਲ ਨਹੀਂ।",
    f2Title: "10 ਭਾਰਤੀ ਭਾਸ਼ਾਵਾਂ + English",
    f2Body: "ਹਿੰਦੀ, ਬੰਗਾਲੀ, ਤਮਿਲ, ਤੇਲਗੂ, ਮਰਾਠੀ, ਕੰਨੜ, ਗੁਜਰਾਤੀ, ਮਲਿਆਲਮ, ਪੰਜਾਬੀ, ਓਡੀਆ, ਅਤੇ English। ਹਿੰਗਲਿਸ਼ ਬੋਲਣ ਦਾ ਢੰਗ ਹੈ, ਵੱਖਰੀ ਚਿੱਪ ਨਹੀਂ।",
    f3Title: "ਹੈਲਪਰ ਦਾ ਫੋਨ",
    f3Body: "ਦੂਜੇ ਕਾਊਂਟਰ ਵਾਲਾ ਆਪਣੇ ਫੋਨ ਤੋਂ ਬਿੱਲ ਕੱਟ ਸਕਦਾ ਹੈ। ਹਿਸਾਬ ਇਸੇ ਦੁਕਾਨ ਦਾ ਰਹਿੰਦਾ ਹੈ, ਨਿੱਜੀ ਵਾਲਿਟ ਨਹੀਂ।",
    f4Title: "WhatsApp ਬਿੱਲ",
    f4Body: "ਖੜ੍ਹੇ ਗਾਹਕ ਨੂੰ ਇਹ ਬਿੱਲ ਭੇਜੋ। ਮਾਰਕੀਟਿੰਗ ਨਹੀਂ। ਬਸ ਇਹ ਬਿੱਲ।",
    f5Title: "ਨਾਂ ’ਤੇ ਉਧਾਰ",
    f5Body: "ਰਮੇਸ਼ ਨੇ ਅੱਜ ਚੌਲ ਲਏ। ਉਸਦੇ ਨਾਂ ’ਤੇ ਬੈਠਾ। ਮਹੀਨੇ ਦੇ ਅੰਤ ’ਤੇ ਡਾਇਰੀ ਨਹੀਂ ਉਲਟਾਉਣੀ। ਇਹ ਲਿਸਟ Premium ’ਤੇ ਹੈ।",
    f6Title: "ਸਕੈਨ ਕਰ ਕੇ ਇਸੇ ਬਿੱਲ ’ਤੇ",
    f6Body: "ਬਾਰਕੋਡ Maggi ਨੂੰ ਇਸੇ ਬਿੱਲ ’ਤੇ ਪਾਉਂਦਾ ਹੈ। ਸਟਾਕ-ਇਨ ਸਕੈਨ ਤਦ ਹੀ, ਜਦੋਂ ਤੁਸੀਂ ਸਟਾਕ ਜੋੜ ਰਹੇ ਹੋ।",
    whatHappens: "ਕਾਊਂਟਰ ’ਤੇ ਕੀ ਹੁੰਦਾ ਹੈ।",
    hisaabLabel: "ਸ਼ਾਮ ਦਾ ਹਿਸਾਬ",
    hisaabHindi: "आज कितना कैश आया?",
    hisaabHeading: "ਦਿਨ ਨੂੰ ਪੁੱਛੋ, ਡਾਇਰੀ ਨੂੰ ਨਹੀਂ",
    hisaabSub: "ਭੀੜ ਥੰਮੇ ਤਾਂ ਪੁੱਛੋ ਕਿੰਨਾ ਆਇਆ, ਕਿਸਦਾ ਉਧਾਰ ਹਾਲੇ ਖੁੱਲ੍ਹਾ ਹੈ।",
    hisaab1Title: "ਅੱਜ ਦਾ ਕੈਸ਼",
    hisaab1Body: "\"aaj kitna cash aaya\" / ਅੱਜ ਕਿੰਨਾ ਕੈਸ਼ ਆਇਆ?",
    hisaab2Title: "ਖੁੱਲ੍ਹਾ ਉਧਾਰ",
    hisaab2Body: "ਕਿਸਦਾ ਉਧਾਰ ਹਾਲੇ ਖੁੱਲ੍ਹਾ ਹੈ?",
    hisaab3Title: "ਕੀ ਵਿਕਿਆ",
    hisaab3Body: "\"aaj kitna becha\" / ਅੱਜ ਕਿੰਨਾ ਵਿਕਿਆ?",
    hisaab4Title: "ਬਿੱਲ ਤੋਂ ਬਾਅਦ ਸਟਾਕ",
    hisaab4Body: "ਉਹ ਚੀਜ਼ਾਂ ਸੇਲ ਨਾਲ ਨਿੱਕਲ ਚੁੱਕੀਆਂ। ਐਤਵਾਰ ਦੀ ਸਟਾਕ ਗਿਣਤੀ ਵੱਖਰੀ ਸਿਰਦਰਦ ਹੈ। ਇਹ ਉਹ ਕਾਪੀ ਨਹੀਂ।",
    langHeading: "ਕਾਊਂਟਰ ’ਤੇ ਤੁਹਾਡੀ ਭਾਸ਼ਾ",
    langSub: "ਹਿੰਦੀ, ਹਿੰਗਲਿਸ਼, ਜਾਂ 10 ਭਾਰਤੀ ਭਾਸ਼ਾਵਾਂ + English। ਉਹ ਨਾਂ ਜਿਨ੍ਹਾਂ ਨਾਲ ਤੁਸੀਂ ਸਮਾਨ ਪੁਕਾਰਦੇ ਹੋ।",
    cmpWithoutHeading: "ਭੀੜ ਵਿੱਚ, ਕਾਗਜ਼ ’ਤੇ",
    cmpWithout1: "ਲਿਖਦਿਆਂ ਲਿਖਦਿਆਂ ਗਾਹਕ ਉਡੀਕ ਵਿੱਚ",
    cmpWithout2: "ਉਧਾਰ ਡਾਇਰੀ ਵਿੱਚ",
    cmpWithout3: "ਲੰਮੇ ਹਫ਼ਤੇ ਬਾਅਦ ਐਤਵਾਰ ਨੂੰ ਸਟਾਕ ਗਿਣਤੀ",
    cmpWithout4: "UPI ਤੇ ਕੈਸ਼ ਦੋ ਥਾਵਾਂ ’ਤੇ",
    cmpWithout5: "ਹੈਲਪਰ ਟਾਈਪਿੰਗ ਵਿੱਚ ਹੌਲੀ",
    cmpWithout6: "ਸ਼ਾਮ ਦਾ ਹਿਸਾਬ ਕੈਸ਼ ਬਾਕਸ ਨਾਲ ਨਹੀਂ ਮਿਲਦਾ",
    cmpWithHeading: "ਉਹ ਵਾਕ ਜੋ ਤੁਸੀਂ ਬੋਲ ਚੁੱਕੇ",
    cmpWith1: "ਜੋ ਲਿਆ ਉਹ ਬੋਲੋ, ਬਿੱਲ ਨਾਲ ਚੱਲਦਾ ਹੈ",
    cmpWith2: "ਕੈਸ਼, UPI QR, ਜਾਂ ਉਧਾਰ ਉਸੇ ਬਿੱਲ ’ਤੇ",
    cmpWith3: "ਉਨ੍ਹਾਂ ਚੀਜ਼ਾਂ ਦਾ ਸਟਾਕ ਪਹਿਲਾਂ ਹੀ ਚੱਲਿਆ",
    cmpWith4: "ਖੜ੍ਹੇ ਗਾਹਕ ਨੂੰ WhatsApp ਬਿੱਲ",
    cmpWith5: "ਅੱਜ ਦਾ ਕੈਸ਼ ਤੇ UPI ਇੱਕ ਥਾਂ",
    cmpWith6: "ਹੈਲਪਰ ਦਾ ਫੋਨ ਵੀ ਇਸੇ ਦੁਕਾਨ ਦੇ ਹਿਸਾਬ ਵਿੱਚ",
    eveningMatch: "ਸ਼ਾਮ ਦਾ ਹਿਸਾਬ ਬਾਕਸ ਨਾਲ ਮਿਲਣਾ ਚਾਹੀਦਾ ਹੈ",
    proofLabel: "ਉਦਾਹਰਣ",
    proofHeading: "ਬੈਂਗਲੁਰੂ ਕਾਊਂਟਰਾਂ ਤੋਂ (ਉਦਾਹਰਣ)",
    ctaLabel: "ਸ਼ੁਰੂ ਕਰੋ",
    ctaHindi: "आज दुकान पर आज़माएँ",
    ctaHeading: "ਅਗਲੇ ਗਾਹਕ ’ਤੇ ਅਜ਼ਮਾਓ, ਖਾਲੀ ਐਤਵਾਰ ’ਤੇ ਨਹੀਂ",
    ctaSub: "App Store ਜਾਂ Google Play ਤੋਂ ਡਾਊਨਲੋਡ। ਨਵੀਂ ਦੁਕਾਨ ਨੂੰ ਐਪ ਵਿੱਚ 7 ਦਿਨ ਵੌਇਸ, ਕਾਰਡ ਨਹੀਂ। ਪਹਿਲੀ ਚਾਰਜ ਦੀ ਰਿਫੰਡ ਵਿੰਡੋ ਵੱਖਰੀ ਹੈ।",
    footerBlurb: "ਕਿਰਾਨਾ ਕਾਊਂਟਰ ਲਈ। ਜੋ ਲਿਆ ਉਹ ਬੋਲੋ। ਬਿੱਲ ਨਾਲ ਚੱਲਦਾ ਹੈ।",
    footerContact: "ਸੰਪਰਕ",
    footerRefund: "ਰਿਫੰਡ ਨੀਤੀ",
    footerPrivacy: "ਪਰਾਈਵੇਸੀ",
    footerTerms: "ਸ਼ਰਤਾਂ",
    heroStatCashLabel: "ਬਿੱਲ ’ਤੇ",
    heroStatUpiLabel: "QR ਰਕਮ",
    heroStatUdhaarLabel: "ਨਾਮ ’ਤੇ",
    floatCustomer: "ਖੜ੍ਹੇ ਗਾਹਕ ਨੂੰ",
    phoneGreeting: "ਸ਼ੁਭ ਸ਼ਾਮ",
    phoneShopName: "ਕਿਰਾਨਾ ਕਾਊਂਟਰ",
    phoneTodaySales: "ਅੱਜ ਦੀ ਸੇਲ",
    phoneBillsToday: "ਅੱਜ ਦੇ ਬਿੱਲ",
    phoneStatCash: "ਕੈਸ਼",
    phoneLine1Name: "ਚਾਵਲ 5 ਕਿਲੋ",
    phoneLine1Meta: "ਕੈਸ਼ · UPI?",
    phoneLine2Meta: "2 ਪੈਕ · ਉਧਾਰ",
    phoneLine3Meta: "4 ਪੈਕ · ਕੈਸ਼",
    phoneQtyUnit: "ਬਿੱਲ",
    featuresLabel: "ਫੀਚਰ",
    how3LineHindi: "WhatsApp · ਅੱਜ ਕੈਸ਼/UPI",
    how3LineEnglish: "ਬਿੱਲ ਨਾਲ ਸਟਾਕ ਪਹਿਲਾਂ ਤੋਂ ਅਪਡੇਟ",
    hisaab2Line: "ਰਮੇਸ਼ · ਖੁੱਲ੍ਹਾ ਉਧਾਰ",
    hisaab2Gloss: "ਕਿਸ ਦਾ ਖਾਤਾ ਅੱਜ ਖੁੱਲ੍ਹਾ ਹੈ",
    hisaab4Line: "ਬਿੱਲ ਨਾਲ ਸਟਾਕ",
    hisaab4Gloss: "ਉਹ ਚੀਜ਼ਾਂ ਪਹਿਲਾਂ ਤੋਂ ਹਿਲ ਗਈਆਂ",
    cmpLabel: "ਕਿਉਂ Samaan Bol",
    cmpWithoutChrome: "Samaan Bol ਤੋਂ ਬਿਨਾਂ",
    cmpWithChrome: "Samaan Bol ਨਾਲ",
    langLabel: "ਭਾਰਤ ਲਈ",
    chromeLanguage: "ਭਾਸ਼ਾ",
    footerRights: "ਸਾਰੇ ਹੱਕ ਰਾਖਵੇਂ ਹਨ",
    footerMadeInIndia: "ਭਾਰਤ ਵਿੱਚ ਬਣਾਇਆ ♥ 🇮🇳",
  },
};

function swap(html: string, needle: string, next?: string) {
  if (!next || next === needle) return html;
  if (!html.includes(needle)) return html;
  return html.replaceAll(needle, next);
}

/** Split `"roman" / native` shop-day bodies for voice-bubble sides. */
function slashPair(body: string | undefined, left: string, right: string): [string, string] {
  if (!body) return [left, right];
  const idx = body.indexOf(' / ');
  if (idx === -1) return [left, body];
  return [body.slice(0, idx), body.slice(idx + 3)];
}

/**
 * KEEP EN on locale homes (maps / CoS):
 * - App Store badge "Download on the"; Play "GET IT ON"; store names
 * - phone.chips Sell | Cart | Udhaar | Today
 * - Bengaluru Hinglish quotes; brand tokens (UPI, WhatsApp, Maggi, Samaan Bol)
 * - Footer h4 Product / Company / Support (no map key)
 * - Menu aria-label
 */

export function applyHomeSlots(html: string, locale: Locale) {
  const slots = localeSlots[locale];
  if (!slots) return html;

  let out = html;

  out = swap(
    out,
    `        <li><a href="#features">Features</a></li>
        <li><a href="#ai">Evening hisaab</a></li>
        <li><a href="/pricing">Pricing</a></li>
        <li><a href="/account">Manage subscription</a></li>
        <li><a href="https://apps.apple.com/in/app/samaan-bol/id6759739444" class="nav-cta">Download</a></li>`,
    `        <li><a href="#features">${slots.navFeatures ?? 'Features'}</a></li>
        <li><a href="#ai">${slots.navAi ?? 'Evening hisaab'}</a></li>
        <li><a href="/pricing">${slots.navPricing ?? 'Pricing'}</a></li>
        <li><a href="/account">${slots.navAccount ?? 'Manage subscription'}</a></li>
        <li><a href="https://apps.apple.com/in/app/samaan-bol/id6759739444" class="nav-cta">${slots.navDownload ?? 'Download'}</a></li>`,
  );

  out = swap(out, '<div class="hero-eyebrow">For the kirana counter</div>', `<div class="hero-eyebrow">${slots.heroEyebrow ?? 'For the kirana counter'}</div>`);
  out = swap(out, `<span class="hindi-line hindi">${TWIN}</span>`, `<span class="hindi-line hindi">${TWIN}</span>`);
  out = swap(
    out,
    '<span class="hero-text-main">You already said it out loud.<br>The bill should keep up.</span>',
    `<span class="hero-text-main">${slots.heroH1 ?? 'You already said it out loud.<br>The bill should keep up.'}</span>`,
  );

  if (slots.heroSub) {
    const languageLine = slots.heroLanguageProse ? `\n          ${slots.heroLanguageProse}` : '';
    out = swap(
      out,
      EN_HERO_SUB,
      `          ${slots.heroSub}${languageLine}\n          ${HERO_ROTATE}`,
    );
  }

  out = swap(
    out,
    `            Download
          </a>
          <a href="#how" class="btn-secondary">`,
    `            ${slots.ctaDownload ?? slots.navDownload ?? 'Download'}
          </a>
          <a href="#how" class="btn-secondary">`,
  );
  out = swap(out, '            See how a sale works', `            ${slots.ctaSeeHow ?? 'See how a sale works'}`);

  if (slots.chipCash || slots.chipUpi || slots.chipUdhaar) {
    out = swap(
      out,
      `            <div class="hero-stat-number">Cash</div>
            <div class="hero-stat-label">On the bill</div>
          </div>
          <div class="hero-stat">
            <div class="hero-stat-number">UPI</div>
            <div class="hero-stat-label">QR amount</div>
          </div>
          <div class="hero-stat">
            <div class="hero-stat-number">Udhaar</div>
            <div class="hero-stat-label">On a name</div>`,
      `            <div class="hero-stat-number">${slots.chipCash ?? 'Cash'}</div>
            <div class="hero-stat-label">${slots.heroStatCashLabel ?? 'On the bill'}</div>
          </div>
          <div class="hero-stat">
            <div class="hero-stat-number">${slots.chipUpi ?? 'UPI'}</div>
            <div class="hero-stat-label">${slots.heroStatUpiLabel ?? 'QR amount'}</div>
          </div>
          <div class="hero-stat">
            <div class="hero-stat-number">${slots.chipUdhaar ?? 'Udhaar'}</div>
            <div class="hero-stat-label">${slots.heroStatUdhaarLabel ?? 'On a name'}</div>`,
    );
  }

  out = swap(out, `"${UTTERANCE}"`, `"${UTTERANCE}"`);
  out = swap(out, 'Rice 5 kg sold · Cash/UPI?', slots.floatGloss ?? 'Rice 5 kg sold · Cash/UPI?');
  out = swap(out, '<div class="english">Rice 5 kg sold</div>', `<div class="english">${slots.how1Example ?? 'Rice 5 kg sold'}</div>`);
  out = swap(out, 'Search to sell…', slots.phoneSearch ?? 'Search to sell…');
  out = swap(out, '<div class="phone-greeting">Good evening</div>', `<div class="phone-greeting">${slots.phoneGreeting ?? 'Good evening'}</div>`);
  out = swap(out, '<div class="phone-subtext">Kirana counter</div>', `<div class="phone-subtext">${slots.phoneShopName ?? 'Kirana counter'}</div>`);
  out = swap(out, '<div class="phone-stat-label">Today\'s sales</div>', `<div class="phone-stat-label">${slots.phoneTodaySales ?? "Today's sales"}</div>`);
  out = swap(out, '<div class="phone-stat-label">Bills today</div>', `<div class="phone-stat-label">${slots.phoneBillsToday ?? 'Bills today'}</div>`);
  out = swap(
    out,
    `<div class="phone-stat-label">Cash</div>
              </div>
              <div class="phone-stat-card phone-stat-card--activity">
                <div class="phone-stat-number" style="color:var(--success);">₹3,320</div>
                <div class="phone-stat-label">UPI</div>`,
    `<div class="phone-stat-label">${slots.phoneStatCash ?? 'Cash'}</div>
              </div>
              <div class="phone-stat-card phone-stat-card--activity">
                <div class="phone-stat-number" style="color:var(--success);">₹3,320</div>
                <div class="phone-stat-label">${slots.chipUpi ?? 'UPI'}</div>`,
  );
  out = swap(out, '<div class="phone-product-name">Rice 5 kg</div>', `<div class="phone-product-name">${slots.phoneLine1Name ?? 'Rice 5 kg'}</div>`);
  out = swap(out, '<div class="phone-product-meta">Cash · UPI?</div>', `<div class="phone-product-meta">${slots.phoneLine1Meta ?? 'Cash · UPI?'}</div>`);
  out = swap(out, '<div class="phone-product-meta">2 pkt · Udhaar</div>', `<div class="phone-product-meta">${slots.phoneLine2Meta ?? '2 pkt · Udhaar'}</div>`);
  out = swap(out, '<div class="phone-product-meta">4 pkt · Cash</div>', `<div class="phone-product-meta">${slots.phoneLine3Meta ?? '4 pkt · Cash'}</div>`);
  out = swap(out, '<div class="phone-product-qty-unit">bill</div>', `<div class="phone-product-qty-unit">${slots.phoneQtyUnit ?? 'bill'}</div>`);
  out = swap(
    out,
    `<p><strong>WhatsApp bill</strong></p>
          <p style="margin-top:4px; font-size:12px;">To the customer standing there</p>`,
    `<p><strong>${slots.floatSecond ?? 'WhatsApp bill'}</strong></p>
          <p style="margin-top:4px; font-size:12px;">${slots.floatCustomer ?? 'To the customer standing there'}</p>`,
  );

  out = swap(out, '<div class="section-label">How a sale works</div>', `<div class="section-label">${slots.howLabel ?? 'How a sale works'}</div>`);
  out = swap(out, '<h2 class="section-heading">Three steps. While they are still there.</h2>', `<h2 class="section-heading">${slots.howHeading ?? 'Three steps. While they are still there.'}</h2>`);
  out = swap(
    out,
    '<p class="section-sub">You still tap to take money — a spoken sentence cannot send UPI alone.</p>',
    `<p class="section-sub">${slots.howSub ?? 'You still tap to take money — a spoken sentence cannot send UPI alone.'}</p>`,
  );
  out = swap(out, '<h3>You say what they took</h3>', `<h3>${slots.how1Title ?? 'You say what they took'}</h3>`);
  out = swap(out, '<p>Or tap the item if you are not on voice.</p>', `<p>${slots.how1Body ?? 'Or tap the item if you are not on voice.'}</p>`);
  out = swap(out, '<h3>You take the money</h3>', `<h3>${slots.how2Title ?? 'You take the money'}</h3>`);
  out = swap(
    out,
    "<p>Cash, show UPI amount on QR, or put it on that customer's udhaar. You still tap to take money — spoken sentence cannot send UPI alone.</p>",
    `<p>${slots.how2Body ?? "Cash, show UPI amount on QR, or put it on that customer's udhaar. You still tap to take money — spoken sentence cannot send UPI alone."}</p>`,
  );
  out = swap(out, '<h3>WhatsApp bill. Totals move.</h3>', `<h3>${slots.how3Title ?? 'WhatsApp bill. Totals move.'}</h3>`);
  out = swap(
    out,
    "<p>WhatsApp bill to the customer. Today's cash/UPI totals move. Stock for those items is already updated.</p>",
    `<p>${slots.how3Body ?? "WhatsApp bill to the customer. Today's cash/UPI totals move. Stock for those items is already updated."}</p>`,
  );
  out = swap(
    out,
    '<span style="background:var(--saffron-tint); color:var(--saffron); padding:4px 10px; border-radius:4px; font-size:12px;">Cash</span>',
    `<span style="background:var(--saffron-tint); color:var(--saffron); padding:4px 10px; border-radius:4px; font-size:12px;">${slots.chipCash ?? 'Cash'}</span>`,
  );
  out = swap(
    out,
    '<span style="background:rgba(50,213,131,0.1); color:var(--success); padding:4px 10px; border-radius:4px; font-size:12px;">UPI QR</span>',
    `<span style="background:rgba(50,213,131,0.1); color:var(--success); padding:4px 10px; border-radius:4px; font-size:12px;">${slots.chipUpi ?? 'UPI'} QR</span>`,
  );
  out = swap(
    out,
    '<span style="background:rgba(99,102,241,0.1); color:#818CF8; padding:4px 10px; border-radius:4px; font-size:12px;">Udhaar</span>',
    `<span style="background:rgba(99,102,241,0.1); color:#818CF8; padding:4px 10px; border-radius:4px; font-size:12px;">${slots.chipUdhaar ?? 'Udhaar'}</span>`,
  );
  out = swap(out, '<div class="hindi">WhatsApp · cash/UPI today</div>', `<div class="hindi">${slots.how3LineHindi ?? 'WhatsApp · cash/UPI today'}</div>`);
  out = swap(out, '<div class="english">Stock already updated with the bill</div>', `<div class="english">${slots.how3LineEnglish ?? 'Stock already updated with the bill'}</div>`);

  out = swap(out, '<div class="section-label">Features</div>', `<div class="section-label">${slots.featuresLabel ?? 'Features'}</div>`);

  out = swap(out, '<h2 class="section-heading">What happens at the counter.</h2>', `<h2 class="section-heading">${slots.whatHappens ?? 'What happens at the counter.'}</h2>`);
  out = swap(out, '<h3>You speak the sale</h3>', `<h3>${slots.f1Title ?? 'You speak the sale'}</h3>`);
  out = swap(
    out,
    "<p>Confirm cash, UPI, or udhaar with a tap. This is not a call to the customer's UPI app.</p>",
    `<p>${slots.f1Body ?? "Confirm cash, UPI, or udhaar with a tap. This is not a call to the customer's UPI app."}</p>`,
  );
  out = swap(out, '<h3>10 Indian languages + English</h3>', `<h3>${slots.f2Title ?? '10 Indian languages + English'}</h3>`);
  out = swap(
    out,
    '<p>Hinglish is how you speak. It is not a chip. Hindi, Bengali, Tamil, Telugu, Marathi, Kannada, Gujarati, Malayalam, Punjabi, Odia, English.</p>',
    `<p>${slots.f2Body ?? 'Hinglish is how you speak. It is not a chip. Hindi, Bengali, Tamil, Telugu, Marathi, Kannada, Gujarati, Malayalam, Punjabi, Odia, English.'}</p>`,
  );
  out = swap(out, "<h3>Helper's phone</h3>", `<h3>${slots.f3Title ?? "Helper's phone"}</h3>`);
  out = swap(
    out,
    "<p>Still this shop's hisaab. Not a private wallet.</p>",
    `<p>${slots.f3Body ?? "Still this shop's hisaab. Not a private wallet."}</p>`,
  );
  out = swap(out, '<h3>WhatsApp bill</h3>', `<h3>${slots.f4Title ?? 'WhatsApp bill'}</h3>`);
  out = swap(out, '<p>To the customer standing there.</p>', `<p>${slots.f4Body ?? 'To the customer standing there.'}</p>`);
  out = swap(out, '<h3>Udhaar on a name</h3>', `<h3>${slots.f5Title ?? 'Udhaar on a name'}</h3>`);
  out = swap(
    out,
    "<p>Ramesh's rice on his name. Premium, once, plainly.</p>",
    `<p>${slots.f5Body ?? "Ramesh's rice on his name. Premium, once, plainly."}</p>`,
  );
  out = swap(out, '<h3>Scan onto this bill</h3>', `<h3>${slots.f6Title ?? 'Scan onto this bill'}</h3>`);
  out = swap(
    out,
    '<p>Not stock-in unless you are adding stock.</p>',
    `<p>${slots.f6Body ?? 'Not stock-in unless you are adding stock.'}</p>`,
  );

  out = swap(out, '<div class="section-label">Evening hisaab</div>', `<div class="section-label">${slots.hisaabLabel ?? 'Evening hisaab'}</div>`);
  out = swap(out, 'आज का हिसाब', slots.hisaabHindi ?? 'आज का हिसाब');
  out = swap(out, '        Ask the day, not the diary', `        ${slots.hisaabHeading ?? 'Ask the day, not the diary'}`);
  out = swap(
    out,
    '<p class="section-sub">Cash, UPI, udhaar, what sold. Stock already moved with the bill.</p>',
    `<p class="section-sub">${slots.hisaabSub ?? 'Cash, UPI, udhaar, what sold. Stock already moved with the bill.'}</p>`,
  );

  out = swap(out, '<h3>Aaj kitna cash aaya</h3>', `<h3>${slots.hisaab1Title ?? 'Aaj kitna cash aaya'}</h3>`);
  out = swap(out, '<p>Ask the day. Cash in the box should match what the bills say.</p>', `<p>${slots.hisaab1Body ?? 'Ask the day. Cash in the box should match what the bills say.'}</p>`);
  out = swap(out, '<h3>Whose udhaar is open</h3>', `<h3>${slots.hisaab2Title ?? 'Whose udhaar is open'}</h3>`);
  out = swap(out, '<p>Names, not a paper slip in the drawer.</p>', `<p>${slots.hisaab2Body ?? 'Names, not a paper slip in the drawer.'}</p>`);
  out = swap(out, '<h3>Aaj kitna becha</h3>', `<h3>${slots.hisaab3Title ?? 'Aaj kitna becha'}</h3>`);
  out = swap(out, '<p>What went out today. Cash and UPI totals on the same day.</p>', `<p>${slots.hisaab3Body ?? 'What went out today. Cash and UPI totals on the same day.'}</p>`);
  out = swap(out, '<h3>Stock already moved with the bill</h3>', `<h3>${slots.hisaab4Title ?? 'Stock already moved with the bill'}</h3>`);
  out = swap(out, '<p>You do not count it again on Sunday to know what the bill already took.</p>', `<p>${slots.hisaab4Body ?? 'You do not count it again on Sunday to know what the bill already took.'}</p>`);

  {
    const [cashLeft, cashRight] = slashPair(slots.hisaab1Body, '"aaj kitna cash aaya"', 'How much cash came in today?');
    out = swap(
      out,
      `<div class="hindi">"आज कितना कैश आया?"</div>
              <div class="translation">How much cash came in today?</div>`,
      `<div class="hindi">${cashLeft}</div>
              <div class="translation">${cashRight}</div>`,
    );
    out = swap(
      out,
      `<div class="hindi">Ramesh · open udhaar</div>
              <div class="translation">Whose khata is still open today</div>`,
      `<div class="hindi">${slots.hisaab2Line ?? 'Ramesh · open udhaar'}</div>
              <div class="translation">${slots.hisaab2Gloss ?? 'Whose khata is still open today'}</div>`,
    );
    const [soldLeft, soldRight] = slashPair(slots.hisaab3Body, '"aaj kitna becha"', 'How much sold today?');
    out = swap(
      out,
      `<div class="hindi">"आज कितना बेचा?"</div>
              <div class="translation">How much sold today?</div>`,
      `<div class="hindi">${soldLeft}</div>
              <div class="translation">${soldRight}</div>`,
    );
    out = swap(
      out,
      `<div class="hindi">Stock with the bill</div>
              <div class="translation">Those items already moved</div>`,
      `<div class="hindi">${slots.hisaab4Line ?? 'Stock with the bill'}</div>
              <div class="translation">${slots.hisaab4Gloss ?? 'Those items already moved'}</div>`,
    );
  }

  out = swap(out, '<div class="section-label">Built for Bharat</div>', `<div class="section-label">${slots.langLabel ?? 'Built for Bharat'}</div>`);
  out = swap(out, '<h2 class="section-heading">Your language. Your business. Your way.</h2>', `<h2 class="section-heading">${slots.langHeading ?? 'Your language. Your business. Your way.'}</h2>`);
  out = swap(
    out,
    '<p class="section-sub">Hinglish is speech, not a chip. 10 Indian languages + English, with the names you actually use at the counter.</p>',
    `<p class="section-sub">${slots.langSub ?? 'Hinglish is speech, not a chip. 10 Indian languages + English, with the names you actually use at the counter.'}</p>`,
  );

  out = swap(out, '<div class="section-label">Why Samaan Bol</div>', `<div class="section-label">${slots.cmpLabel ?? 'Why Samaan Bol'}</div>`);
  out = swap(
    out,
    '<h2 class="section-heading">The evening should match the box</h2>',
    `<h2 class="section-heading">${slots.eveningMatch ?? 'The evening should match the box'}</h2>`,
  );
  out = swap(
    out,
    '<p class="comparison-col-subtitle">Rush, paper, two places</p>',
    `<p class="comparison-col-subtitle">${slots.cmpWithoutHeading ?? 'Rush, paper, two places'}</p>`,
  );
  out = swap(
    out,
    '<p class="comparison-col-subtitle">The sentence you said is the bill</p>',
    `<p class="comparison-col-subtitle">${slots.cmpWithHeading ?? 'The sentence you said is the bill'}</p>`,
  );
  out = swap(out, '<h3>Without Samaan Bol</h3>', `<h3>${slots.cmpWithoutChrome ?? 'Without Samaan Bol'}</h3>`);
  out = swap(out, '<h3>With Samaan Bol</h3>', `<h3>${slots.cmpWithChrome ?? 'With Samaan Bol'}</h3>`);
  out = swap(out, '<li><span class="icon">✕</span> Rush at the counter</li>', `<li><span class="icon">✕</span> ${slots.cmpWithout1 ?? 'Rush at the counter'}</li>`);
  out = swap(out, '<li><span class="icon">✕</span> Paper udhaar</li>', `<li><span class="icon">✕</span> ${slots.cmpWithout2 ?? 'Paper udhaar'}</li>`);
  out = swap(out, '<li><span class="icon">✕</span> Sunday stock count</li>', `<li><span class="icon">✕</span> ${slots.cmpWithout3 ?? 'Sunday stock count'}</li>`);
  out = swap(out, '<li><span class="icon">✕</span> UPI and cash in two places</li>', `<li><span class="icon">✕</span> ${slots.cmpWithout4 ?? 'UPI and cash in two places'}</li>`);
  out = swap(out, '<li><span class="icon">✕</span> Helper slow at typing</li>', `<li><span class="icon">✕</span> ${slots.cmpWithout5 ?? 'Helper slow at typing'}</li>`);
  out = swap(out, '<li><span class="icon">✕</span> Evening hisaab ≠ cash box</li>', `<li><span class="icon">✕</span> ${slots.cmpWithout6 ?? 'Evening hisaab ≠ cash box'}</li>`);
  out = swap(out, '<li><span class="icon">✓</span> The sentence you said becomes the bill</li>', `<li><span class="icon">✓</span> ${slots.cmpWith1 ?? 'The sentence you said becomes the bill'}</li>`);
  out = swap(out, '<li><span class="icon">✓</span> Cash, UPI, or udhaar</li>', `<li><span class="icon">✓</span> ${slots.cmpWith2 ?? 'Cash, UPI, or udhaar'}</li>`);
  out = swap(out, '<li><span class="icon">✓</span> Stock moved</li>', `<li><span class="icon">✓</span> ${slots.cmpWith3 ?? 'Stock moved'}</li>`);
  out = swap(out, '<li><span class="icon">✓</span> WhatsApp bill</li>', `<li><span class="icon">✓</span> ${slots.cmpWith4 ?? 'WhatsApp bill'}</li>`);
  out = swap(out, "<li><span class=\"icon\">✓</span> Today's totals</li>", `<li><span class="icon">✓</span> ${slots.cmpWith5 ?? "Today's totals"}</li>`);
  out = swap(out, "<li><span class=\"icon\">✓</span> Helper feeds this shop's hisaab</li>", `<li><span class="icon">✓</span> ${slots.cmpWith6 ?? "Helper feeds this shop's hisaab"}</li>`);

  out = swap(out, '<div class="section-label">Next customer</div>', `<div class="section-label">${slots.ctaLabel ?? 'Next customer'}</div>`);
  out = swap(out, 'अगले ग्राहक पर आज़माओ', slots.ctaHindi ?? 'अगले ग्राहक पर आज़माओ');
  out = swap(
    out,
    '        Try it on the next customer, not on a quiet Sunday.',
    `        ${slots.ctaHeading ?? 'Try it on the next customer, not on a quiet Sunday.'}`,
  );
  out = swap(
    out,
    '<p class="section-sub">On the App Store and Google Play. New shops get 7 days of voice in the app, no card. Trial is not a refund.</p>',
    `<p class="section-sub">${slots.ctaSub ?? 'On the App Store and Google Play. New shops get 7 days of voice in the app, no card. Trial is not a refund.'}</p>`,
  );
  out = swap(
    out,
    '<p>For the kirana counter. You say what they took. The bill keeps up.</p>',
    `<p>${slots.footerBlurb ?? 'For the kirana counter. You say what they took. The bill keeps up.'}</p>`,
  );
  out = swap(out, 'All rights reserved.', `${slots.footerRights ?? 'All rights reserved'}.`);
  out = swap(out, 'Made with ♥ in India 🇮🇳', slots.footerMadeInIndia ?? 'Made with ♥ in India 🇮🇳');

  if (slots.navFeatures) {
    out = swap(out, '<li><a href="#features">Features</a></li>', `<li><a href="#features">${slots.navFeatures}</a></li>`);
  }
  if (slots.navAi) {
    out = swap(out, '<li><a href="#ai">Evening hisaab</a></li>', `<li><a href="#ai">${slots.navAi}</a></li>`);
  }
  if (slots.navPricing) {
    out = swap(out, '<li><a href="/pricing">Pricing</a></li>', `<li><a href="/pricing">${slots.navPricing}</a></li>`);
  }
  if (slots.navAccount) {
    out = swap(out, '<li><a href="/account">Manage subscription</a></li>', `<li><a href="/account">${slots.navAccount}</a></li>`);
    out = swap(out, '<div class="store-badge-name">Manage subscription</div>', `<div class="store-badge-name">${slots.navAccount}</div>`);
  }
  if (slots.footerContact) {
    out = swap(out, '<li><a href="/contact">Contact</a></li>', `<li><a href="/contact">${slots.footerContact}</a></li>`);
  }
  if (slots.footerRefund) {
    out = swap(out, '<li><a href="/refund-policy">Refund Policy</a></li>', `<li><a href="/refund-policy">${slots.footerRefund}</a></li>`);
  }
  if (slots.footerPrivacy) {
    out = swap(out, '<li><a href="/privacy-policy">Privacy Policy</a></li>', `<li><a href="/privacy-policy">${slots.footerPrivacy}</a></li>`);
  }
  if (slots.footerTerms) {
    out = swap(out, '<li><a href="/terms-of-service">Terms of Service</a></li>', `<li><a href="/terms-of-service">${slots.footerTerms}</a></li>`);
  }

  return out;
}

export function applyBengaluruProofHeading(html: string, locale: Locale) {
  const slots = localeSlots[locale];
  if (!slots?.proofHeading) return html;
  let out = html;
  if (slots.proofLabel) {
    out = swap(out, '<div class="section-label">Bengaluru</div>', `<div class="section-label">${slots.proofLabel}</div>`);
  }
  out = swap(
    out,
    '<h2 class="section-heading">From Bengaluru counters (examples)</h2>',
    `<h2 class="section-heading">${slots.proofHeading}</h2>`,
  );
  return out;
}

export function getLocaleHomeSlots(locale: Locale) {
  return localeSlots[locale];
}

export function getLocaleHomeHtml(locale: Locale) {
  return applyHomeSlots(homeHtml, locale);
}

export const localeHomeSlots = localeSlots;
