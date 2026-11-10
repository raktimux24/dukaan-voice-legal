import type { Locale } from '../i18n';
import { udhaarLocales } from './udhaarLocales';
import offerCorrections from './offerCorrections.json';

export type UdhaarCopy = {
  title: string;
  description: string;
  h1: string;
  lead: string;
  stepsHeading: string;
  steps: string[];
  nameHeading: string;
  nameBody: string;
  premiumHeading: string;
  premiumPoints: string[];
  notHeading: string;
  notPoints: string[];
  faqHeading: string;
  faq: Array<{ q: string; a: string }>;
  openShop: string;
  pricing: string;
  laptop: string;
  homeLink: string;
  navLabel: string;
};

const english: UdhaarCopy = {
  title: 'Udhaar on the kirana bill — Samaan Bol',
  description:
    'Record udhaar on the same bill as cash and UPI. The customer’s name stays with the sale. This is the counter, not a separate khata app.',
  h1: 'Udhaar on the kirana bill',
  lead:
    'Record the unpaid part of a sale against the customer, then find the outstanding balance when they return. The bill, customer and tracked stock stay connected. Udhaar is a Premium feature.',
  stepsHeading: 'How udhaar gets onto the bill',
  steps: [
    'Say the sale on the phone, or search and scan it on the laptop. It is the same shop.',
    'With Premium access, choose udhaar for the unpaid amount.',
    'Put the customer’s name on that bill.',
    'Share the bill on WhatsApp while they are still there, if you want them to see it.',
    'Stock moves with the bill. The amount sits on that name.',
  ],
  nameHeading: 'A name, not a slip in the drawer',
  nameBody:
    'The open amount belongs to the person on the bill. When you look later, you are looking for Ramesh, not for a loose page from last month. Cash and UPI from the same day stay separate, so the evening box is not mixed up with what is still owed.',
  premiumHeading: 'Udhaar is a Premium feature',
  premiumPoints: [
    'Recording an udhaar sale requires Premium access.',
    'The list of open udhaar, by customer name, is on Premium.',
    'Reminders for that open list are on Premium.',
    'Eligible new shops get a 7-day Premium trial without a card.',
  ],
  notHeading: 'Before recording udhaar',
  notPoints: [
    'Check the customer and unpaid amount before completing the sale.',
    'A new credit sale needs internet and Premium access.',
    'Sharing a reminder does not confirm delivery or payment.',
  ],
  faqHeading: 'Questions about udhaar',
  faq: [
    {
      q: 'How does udhaar connect to a bill?',
      a: 'Choose the customer and record the unpaid portion when you complete the sale. The amount is linked to that customer so you can review the outstanding balance later.',
    },
    {
      q: 'Can I see everyone who still owes?',
      a: 'Yes. Recording udhaar, the outstanding list and reminders are Premium features. Reminders must be prepared and shared by you.',
    },
    {
      q: 'Does the customer get the bill?',
      a: 'You can share that bill on WhatsApp while they are standing there. That share is the bill itself, not a later collection call.',
    },
  ],
  openShop: 'Open the shop',
  pricing: 'See pricing',
  laptop: 'Same shop on a laptop',
  homeLink: 'Udhaar on the bill, not a separate khata',
  navLabel: 'Udhaar',
};

const hindi: UdhaarCopy = {
  title: 'बिल पर उधार — समान बोल',
  description:
    'उधार उसी बिल पर लिखें जिस पर कैश और UPI है। ग्राहक का नाम बिक्री के साथ रहता है। यह काउंटर है, अलग खता ऐप नहीं।',
  h1: 'बिल पर उधार',
  lead:
    'समान बोल में उधार बिक्री बंद करने का एक तरीका है, कैश और UPI के साथ। ग्राहक अभी काउंटर पर हो, तब सामान उसके नाम पर डालते हैं। यह दूसरी कॉपी नहीं है, और दुकान बंद होने के बाद खोली जाने वाली खता ऐप नहीं है।',
  stepsHeading: 'उधार बिल पर कैसे चढ़ता है',
  steps: [
    'बिक्री फ़ोन पर बोलें, या लैपटॉप पर खोजें और स्कैन करें। दुकान वही है।',
    'कैश या UPI QR की जगह उधार चुनें।',
    'उस बिल पर ग्राहक का नाम लगाएँ।',
    'चाहें तो बिल WhatsApp पर भेज दें, जब वे अभी खड़े हों।',
    'स्टॉक बिल के साथ बदलता है। रकम उस नाम पर बैठती है।',
  ],
  nameHeading: 'नाम, दराज की पर्ची नहीं',
  nameBody:
    'खुली रकम बिल वाले व्यक्ति की है। बाद में रमेश ढूँढते हैं, पिछले महीने का खुला पन्ना नहीं। उसी दिन का कैश और UPI अलग रहता है, ताकि शाम की पेटी और बाकी उधार मिलकर गड़बड़ न हों।',
  premiumHeading: 'किस पर अभी उधार खुला है, वह लिस्ट Premium पर है',
  premiumPoints: [
    'एक बिक्री नाम पर डालना बिल पर होता है।',
    'ग्राहक के नाम पर खुले उधार की लिस्ट Premium पर है।',
    'उस खुली लिस्ट के रिमाइंडर Premium पर हैं।',
    'नई दुकान को ऐप में 7 दिन Premium मिलता है, कार्ड नहीं।',
  ],
  notHeading: 'यह क्या नहीं है',
  notPoints: [
    'बिलों के बगल में रखी अलग खता नहीं।',
    'ब्याज, जुर्माना, या कर्ज नहीं।',
    'GST रिटर्न नहीं। यह काउंटर का बिल है।',
  ],
  faqHeading: 'उधार के सवाल',
  faq: [
    {
      q: 'क्या यह खता ऐप है?',
      a: 'नहीं। उधार किराना बिल खत्म करने का एक तरीका है, कैश और UPI के साथ। नाम उस बिक्री पर रहता है। यह बिल की जगह दूसरी कॉपी नहीं है।',
    },
    {
      q: 'क्या सबके बाकी उधार एक साथ दिखेंगे?',
      a: 'नाम के हिसाब से खुले उधार की लिस्ट, और उसके रिमाइंडर, Premium पर हैं। एक बिक्री नाम पर डालना बिल का हिस्सा है।',
    },
    {
      q: 'क्या ग्राहक को बिल मिलता है?',
      a: 'वे अभी खड़े हों तब वह बिल WhatsApp पर भेज सकते हैं। यह उसी बिल का शेयर है, बाद की वसूली कॉल नहीं।',
    },
  ],
  openShop: 'दुकान खोलो',
  pricing: 'कीमत देखें',
  laptop: 'लैपटॉप पर वही दुकान',
  homeLink: 'बिल पर उधार, अलग खता नहीं',
  navLabel: 'उधार',
};

const udhaarCopy: Partial<Record<Locale, UdhaarCopy>> = { hi: hindi, ...udhaarLocales };

// The credit-sale gate applies to the bill itself, not only to the outstanding list.
const creditPremiumDisclosure: Partial<Record<Locale, string>> = {
  hi: 'उधार बिक्री दर्ज करना और बाकी उधार की लिस्ट देखना Premium सुविधाएँ हैं।',
  bn: 'উধার বিক্রি রেকর্ড করা এবং বকেয়ার তালিকা দেখা Premium সুবিধা।',
  ta: 'உதார் விற்பனையைப் பதிவு செய்வதும் நிலுவைப் பட்டியலைப் பார்ப்பதும் Premium வசதிகள்.',
  te: 'ఉధార్ అమ్మకాన్ని నమోదు చేయడం, బకాయిల జాబితా చూడడం Premium సౌకర్యాలు.',
  mr: 'उधारीची विक्री नोंदवणे आणि बाकीची यादी पाहणे या Premium सुविधा आहेत.',
  kn: 'ಉಧಾರ ಮಾರಾಟ ದಾಖಲಿಸುವುದು ಮತ್ತು ಬಾಕಿ ಪಟ್ಟಿ ನೋಡುವುದು Premium ಸೌಲಭ್ಯಗಳು.',
  gu: 'ઉધાર વેચાણ નોંધવું અને બાકી રકમની યાદી જોવી Premium સુવિધાઓ છે.',
  ml: 'ഉധാർ വിൽപ്പന രേഖപ്പെടുത്തുന്നതും കുടിശ്ശിക പട്ടിക കാണുന്നതും Premium സൗകര്യങ്ങളാണ്.',
  pa: 'ਉਧਾਰ ਵਿਕਰੀ ਦਰਜ ਕਰਨਾ ਅਤੇ ਬਕਾਇਆ ਸੂਚੀ ਦੇਖਣਾ Premium ਸਹੂਲਤਾਂ ਹਨ।',
  or: 'ଉଧାର ବିକ୍ରି ରେକର୍ଡ କରିବା ଓ ବକେୟା ତାଲିକା ଦେଖିବା Premium ସୁବିଧା।',
};

export function getUdhaarCopy(locale: Locale): UdhaarCopy {
  const copy = udhaarCopy[locale] ?? english;
  const disclosure = creditPremiumDisclosure[locale];
  return {
    ...copy,
    premiumPoints: [disclosure ?? copy.premiumPoints[0], ...copy.premiumPoints.slice(1, -1), offerCorrections[locale].closing],
    faq: disclosure ? copy.faq.map((item, index) => index === 1 ? { ...item, a: disclosure } : item) : copy.faq,
  };
}
