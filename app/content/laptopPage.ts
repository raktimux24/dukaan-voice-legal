import type { Locale } from '../i18n';
import { laptopLocales } from './laptopLocales';

export type LaptopCopy = {
  title: string;
  description: string;
  h1: string;
  lead: string;
  stepsHeading: string;
  steps: string[];
  phoneHeading: string;
  phoneBody: string;
  laptopHeading: string;
  laptopPoints: string[];
  faqHeading: string;
  faq: Array<{ q: string; a: string }>;
  openShop: string;
  pricing: string;
  homeLink: string;
};

const english: LaptopCopy = {
  title: 'Kirana billing on a laptop — Samaan Bol',
  description:
    'Run the same kirana shop in the browser. Search, scan, and charge on a laptop. Voice billing stays on the phone. Cash, UPI QR, or udhaar.',
  h1: 'Kirana billing on a laptop',
  lead:
    'Samaan Bol is one shop on the phone and in the browser. On a laptop you search the item or scan a barcode, put the customer on the bill, and charge cash, a UPI QR, or udhaar. Voice billing stays on the phone.',
  stepsHeading: 'How a sale works on the laptop',
  steps: [
    'Open the shop in the browser and sign in with the same account as the phone.',
    'Search the item or scan the barcode, then set the quantity.',
    'Add the customer when the sale is udhaar, or when you want their name on the bill.',
    'Charge cash, show the UPI QR, or record udhaar.',
    'Share the bill on WhatsApp or print it. Stock moves with that bill.',
  ],
  phoneHeading: 'Voice stays on the phone',
  phoneBody:
    'You say the sale in Hindi, Hinglish, or another Indian language on the phone. The laptop does not take that voice. A sale spoken on the helper’s phone and a sale typed on the owner’s laptop land in the same hisaab.',
  laptopHeading: 'What the laptop is for',
  laptopPoints: [
    'A wider view of the bill, the stock, the customers, and the day.',
    'Search and barcode scan when typing on a phone is the slow part.',
    'Customers and udhaar, suppliers, staff, reports, and alerts.',
    'Premium invoices, the plan, and cancel, under Billing inside the shop.',
  ],
  faqHeading: 'Questions about laptop billing',
  faq: [
    {
      q: 'Can I bill by voice on the laptop?',
      a: 'No. Voice billing stays on the phone. The laptop is for search, scan, and charge on the same shop.',
    },
    {
      q: 'Is the browser a different shop from the app?',
      a: 'No. One account, one shop. A sale made on the phone shows on the laptop, and a sale made on the laptop shows on the phone.',
    },
    {
      q: 'Does this file GST returns?',
      a: 'No. This is the counter bill: cash, UPI QR, or udhaar. It is not a GST filing tool.',
    },
  ],
  openShop: 'Open the shop',
  pricing: 'See pricing',
  homeLink: 'How kirana billing works on a laptop',
};

const hindi: LaptopCopy = {
  title: 'लैपटॉप पर किराना बिलिंग — समान बोल',
  description:
    'वही किराना दुकान ब्राउज़र में चलाएँ। लैपटॉप पर खोजें, स्कैन करें, और चार्ज करें। वॉइस बिलिंग फ़ोन पर रहती है। कैश, UPI QR, या उधार।',
  h1: 'लैपटॉप पर किराना बिलिंग',
  lead:
    'समान बोल एक ही दुकान है, फ़ोन पर और ब्राउज़र में। लैपटॉप पर सामान खोजें या बारकोड स्कैन करें, ग्राहक को बिल पर लगाएँ, और कैश, UPI QR, या उधार लें। वॉइस बिलिंग फ़ोन पर रहती है।',
  stepsHeading: 'लैपटॉप पर बिक्री कैसे होती है',
  steps: [
    'ब्राउज़र में दुकान खोलें और उसी खाते से साइन इन करें जो फ़ोन पर है।',
    'सामान खोजें या बारकोड स्कैन करें, फिर मात्रा रखें।',
    'उधार हो, या नाम बिल पर चाहिए, तो ग्राहक को बिल पर लगाएँ।',
    'कैश लें, UPI QR दिखाएँ, या उधार लिखें।',
    'बिल WhatsApp पर भेजें या प्रिंट करें। स्टॉक उसी बिल के साथ बदलता है।',
  ],
  phoneHeading: 'वॉइस फ़ोन पर रहती है',
  phoneBody:
    'बिक्री हिन्दी, Hinglish, या दूसरी भारतीय भाषा में फ़ोन पर बोलते हैं। लैपटॉप वह आवाज़ नहीं लेता। हेल्पर के फ़ोन पर बोली बिक्री और मालिक के लैपटॉप पर की बिक्री एक ही हिसाब में जाती है।',
  laptopHeading: 'लैपटॉप किस काम का है',
  laptopPoints: [
    'बिल, स्टॉक, ग्राहक, और दिन बड़ा दिखता है।',
    'जब फ़ोन पर टाइपिंग धीमी पड़े, तब खोज और बारकोड स्कैन।',
    'ग्राहक और उधार, सप्लायर, स्टाफ, रिपोर्ट, और अलर्ट।',
    'प्रीमियम इनवॉइस, प्लान, और कैंसल दुकान के अंदर बिलिंग में।',
  ],
  faqHeading: 'लैपटॉप बिलिंग के सवाल',
  faq: [
    {
      q: 'क्या लैपटॉप पर बोलकर बिल बनेगा?',
      a: 'नहीं। वॉइस बिलिंग फ़ोन पर रहती है। लैपटॉप उसी दुकान पर खोज, स्कैन, और चार्ज के लिए है।',
    },
    {
      q: 'क्या ब्राउज़र ऐप से अलग दुकान है?',
      a: 'नहीं। एक खाता, एक दुकान। फ़ोन पर की बिक्री लैपटॉप पर दिखती है, और लैपटॉप पर की बिक्री फ़ोन पर दिखती है।',
    },
    {
      q: 'क्या यह GST रिटर्न भरता है?',
      a: 'नहीं। यह काउंटर का बिल है: कैश, UPI QR, या उधार। यह GST दाखिल करने का टूल नहीं है।',
    },
  ],
  openShop: 'दुकान खोलो',
  pricing: 'कीमत देखें',
  homeLink: 'लैपटॉप पर किराना बिलिंग',
};

const laptopCopy: Partial<Record<Locale, LaptopCopy>> = { hi: hindi, ...laptopLocales };

export function getLaptopCopy(locale: Locale): LaptopCopy {
  return laptopCopy[locale] ?? english;
}
