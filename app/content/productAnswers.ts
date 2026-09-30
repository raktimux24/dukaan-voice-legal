import type { Locale } from '../i18n';

export function productAnswers(locale: Locale) {
  if (locale === 'en') return [
    { q: 'What is Samaan Bol?', a: 'Samaan Bol is a voice billing app for Indian kirana stores. Speak a sale on your phone, review the items, choose cash, UPI or udhaar, and share the bill. Stock updates with the completed sale. You can also use the same shop in a browser.' },
    { q: 'Is Samaan Bol free?', a: 'The app is free to download. The free plan includes manual billing, stock, cash and UPI QR bills. New shops get a 7-day Premium trial in the app without a card. Voice billing and the outstanding udhaar list are Premium features. Premium costs ₹499/month or ₹3,999/year.' },
    { q: 'Does voice billing need an internet connection?', a: 'Yes. Voice commands are sent to the server for speech recognition and processing, so voice billing needs an internet connection. Review the recognized items and quantities before completing a sale.' },
    { q: 'Which languages can I speak?', a: 'Voice supports Hindi, Bengali, Tamil, Telugu, Marathi, Kannada, Gujarati, Malayalam and English. You can speak Hindi mixed with English (Hinglish). The browser shop interface is currently in English.' },
    { q: 'Can I use voice billing on a laptop?', a: 'Voice billing is available in the phone app. On a laptop, use the browser to search or scan items and complete the bill. The phone and browser use the same shop.' },
    { q: 'Does speaking a bill automatically collect UPI payment?', a: 'No. You review the bill and choose the payment method. The app can show a UPI QR for the amount, but you must check and confirm the payment yourself.' },
  ];
  if (locale === 'hi') return [
    { q: 'समान बोल क्या है?', a: 'समान बोल किराना दुकानों के लिए वॉइस बिलिंग ऐप है। फ़ोन पर बिक्री बोलें, सामान और मात्रा जाँचें, कैश, UPI या उधार चुनें और बिल शेयर करें। बिक्री पूरी होने पर स्टॉक अपडेट होता है। वही दुकान ब्राउज़र में भी इस्तेमाल कर सकते हैं।' },
    { q: 'क्या समान बोल मुफ़्त है?', a: 'ऐप डाउनलोड करना मुफ़्त है। मुफ़्त प्लान में मैनुअल बिलिंग, स्टॉक, कैश और UPI QR बिल शामिल हैं। नई दुकान को ऐप में बिना कार्ड 7 दिन का Premium ट्रायल मिलता है। वॉइस बिलिंग और बाकी उधार की लिस्ट Premium में हैं। कीमत ₹499/महीना या ₹3,999/साल है।' },
    { q: 'क्या बोलकर बिल बनाने के लिए इंटरनेट चाहिए?', a: 'हाँ। आवाज़ पहचानने और कमांड समझने के लिए रिकॉर्डिंग सर्वर पर भेजी जाती है, इसलिए वॉइस बिलिंग को इंटरनेट चाहिए। बिक्री पूरी करने से पहले पहचाने गए सामान और मात्रा जाँचें।' },
    { q: 'किन भाषाओं में बोल सकते हैं?', a: 'हिन्दी, बंगाली, तमिल, तेलुगु, मराठी, कन्नड़, गुजराती, मलयालम और अंग्रेज़ी में बोल सकते हैं। हिन्दी के साथ अंग्रेज़ी मिलाकर Hinglish में भी बोल सकते हैं। ब्राउज़र की दुकान अभी अंग्रेज़ी में है।' },
    { q: 'क्या लैपटॉप पर बोलकर बिल बना सकते हैं?', a: 'वॉइस बिलिंग फ़ोन ऐप में है। लैपटॉप के ब्राउज़र में सामान खोजें या स्कैन करें और बिल पूरा करें। फ़ोन और ब्राउज़र में दुकान वही रहती है।' },
    { q: 'क्या बिक्री बोलने से UPI भुगतान अपने आप आ जाता है?', a: 'नहीं। बिल जाँचने के बाद भुगतान का तरीका चुनें। ऐप रकम का UPI QR दिखा सकता है, लेकिन भुगतान आपको खुद जाँचकर कन्फ़र्म करना होता है।' },
  ];
  return [];
}

export function productAnswersHtml(locale: Locale) {
  const answers = productAnswers(locale);
  if (!answers.length) return '';
  const title = locale === 'hi' ? 'डाउनलोड करने से पहले' : 'Before you download';
  return `<section class="product-answers" id="questions"><div class="container"><h2>${title}</h2><div class="faq-list">${answers.map(({q,a})=>`<details open><summary>${q}</summary><p>${a}</p></details>`).join('')}</div></div></section>`;
}
