import type { Locale } from '../i18n';

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
};

const english: UdhaarCopy = {
  title: 'Udhaar on the kirana bill — Samaan Bol',
  description:
    'Record udhaar on the same bill as cash and UPI. The customer’s name stays with the sale. This is the counter, not a separate khata app.',
  h1: 'Udhaar on the kirana bill',
  lead:
    'Udhaar in Samaan Bol is a way to close the sale, next to cash and UPI. You put the items on a customer’s name while they are still at the counter. It is not a second notebook, and it is not a khata app you open after the shop shuts.',
  stepsHeading: 'How udhaar gets onto the bill',
  steps: [
    'Say the sale on the phone, or search and scan it on the laptop. It is the same shop.',
    'Choose udhaar instead of cash or the UPI QR.',
    'Put the customer’s name on that bill.',
    'Share the bill on WhatsApp while they are still there, if you want them to see it.',
    'Stock moves with the bill. The amount sits on that name.',
  ],
  nameHeading: 'A name, not a slip in the drawer',
  nameBody:
    'The open amount belongs to the person on the bill. When you look later, you are looking for Ramesh, not for a loose page from last month. Cash and UPI from the same day stay separate, so the evening box is not mixed up with what is still owed.',
  premiumHeading: 'The list of who still owes is Premium',
  premiumPoints: [
    'Putting one sale on a name happens on the bill.',
    'The list of open udhaar, by customer name, is on Premium.',
    'Reminders for that open list are on Premium.',
    'New shops get 7 days of Premium in the app, with no card.',
  ],
  notHeading: 'What this is not',
  notPoints: [
    'Not a separate khata book you keep beside the bills.',
    'Not interest, penalties, or a loan.',
    'Not a GST return. This is the counter bill.',
  ],
  faqHeading: 'Questions about udhaar',
  faq: [
    {
      q: 'Is this a khata app?',
      a: 'No. Udhaar is one way to finish the kirana bill, with cash and UPI. The name sits on that sale. It does not replace the bill with a second book.',
    },
    {
      q: 'Can I see everyone who still owes?',
      a: 'The list of open udhaar by customer name, and reminders for that list, are on Premium. One sale on a name is part of the bill.',
    },
    {
      q: 'Does the customer get the bill?',
      a: 'You can share that bill on WhatsApp while they are standing there. That share is the bill itself, not a later collection call.',
    },
  ],
  openShop: 'Open the shop',
  pricing: 'See pricing',
  laptop: 'Same shop on a laptop',
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
};

export function getUdhaarCopy(locale: Locale): UdhaarCopy {
  return locale === 'hi' ? hindi : english;
}
