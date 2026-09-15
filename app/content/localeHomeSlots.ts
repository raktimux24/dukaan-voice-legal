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
  howLabel?: string;
  howHeading?: string;
  howSub?: string;
  how1Title?: string;
  how1Body?: string;
  how2Title?: string;
  how2Body?: string;
  how3Title?: string;
  how3Body?: string;
  f1Title?: string;
  f1Body?: string;
  f2Title?: string;
  f3Title?: string;
  f3Body?: string;
  f4Title?: string;
  f4Body?: string;
  f5Title?: string;
  f5Body?: string;
  f6Title?: string;
  f6Body?: string;
  hisaabLabel?: string;
  hisaabHindi?: string;
  hisaabHeading?: string;
  hisaabSub?: string;
  cmpWithoutHeading?: string;
  cmpWithHeading?: string;
  ctaHeading?: string;
  footerBlurb?: string;
};

const TWIN = 'जो बोला, वही बिल।';
const UTTERANCE = 'चावल 5 किलो बेचा';

const HERO_ROTATE =
  '<span class="hero-rotate"><span class="hero-rotate-word active">Hindi</span><span class="hero-rotate-word">Bengali</span><span class="hero-rotate-word">Tamil</span><span class="hero-rotate-word">Telugu</span><span class="hero-rotate-word">Marathi</span><span class="hero-rotate-word">Kannada</span><span class="hero-rotate-word">Gujarati</span><span class="hero-rotate-word">Malayalam</span><span class="hero-rotate-word">Punjabi</span><span class="hero-rotate-word">Odia</span><span class="hero-rotate-word">English</span></span>';

const EN_HERO_SUB = `          While the customer is still there, you say what they took in ${HERO_ROTATE}.
          The app puts it on a bill. You take cash, show a UPI QR, or write it as udhaar. Stock is not a second notebook.`;

const hi: HomeSlots = {
  navFeatures: 'फ़ीचर्स',
  navAi: 'शाम का हिसाब',
  navPricing: 'कीमत',
  navAccount: 'सब्सक्रिप्शन मैनेज करें',
  navDownload: 'डाउनलोड',
  heroEyebrow: 'किराना काउंटर के लिए',
  heroH1: 'बोल तो तुम चुके।<br>बिल साथ चले।',
  heroSub:
    'ग्राहक अभी खड़ा है। जो लिया वो बोल दो। ऐप बिल पर चढ़ा देता है। कैश लो, UPI QR दिखाओ, या उधार लिख दो। स्टॉक दूसरा रजिस्टर नहीं।',
  heroLanguageProse: 'हिंदी, हिंग्लिश, या 10 भारतीय भाषाओं + English में बोल सकते हो।',
  chipCash: 'कैश',
  chipUpi: 'UPI',
  chipUdhaar: 'उधार',
  ctaDownload: 'App Store से डाउनलोड',
  ctaSeeHow: 'सेल कैसे चलती है देखो',
  floatGloss: 'चावल 5 किलो बिका · कैश / UPI?',
  howLabel: 'सेल कैसे चलती है',
  howHeading: 'तीन कदम। कोई क्लास नहीं।',
  howSub: 'ग्राहक इंतज़ार में है। दोनों हाथ भरे हो सकते हैं। ये भीड़ है, डेमो नहीं।',
  how1Title: 'जो लिया वो बोलो',
  how1Body: 'जैसे रोज़ बोलते हो वैसे बोलो। वॉइस न हो तो आइटम टैप करो।',
  how2Title: 'पैसे लो',
  how2Body:
    'कैश, QR पर UPI की रकम दिखाओ, या उस ग्राहक के उधार पर चढ़ाओ। पैसे लेने के लिए टैप तो करना पड़ेगा। सिर्फ़ बोलने से UPI नहीं जाता।',
  how3Title: 'बिल, आज का टोटल, स्टॉक',
  how3Body:
    'ये बिल ग्राहक को WhatsApp पर भेज दो। आज का कैश और UPI टोटल चल पड़ता है। उन चीज़ों का स्टॉक पहले से अपडेट है।',
  f1Title: 'सेल तुम बोलते हो',
  f1Body: 'जो लिया वो वैसे ही बोलो। कैश, UPI, या उधार टैप से कन्फ़र्म। ये ग्राहक के UPI ऐप पर कॉल नहीं।',
  f2Title: '10 भारतीय भाषाएँ + English',
  f3Title: 'हेल्पर का फ़ोन',
  f3Body: 'दूसरे काउंटर वाला अपने फ़ोन से बिल बना सकता है। हिसाब इसी दुकान का, निजी वॉलेट नहीं।',
  f4Title: 'WhatsApp बिल',
  f4Body: 'जो ग्राहक खड़ा है, उसे ये बिल भेज दो।',
  f5Title: 'नाम पर उधार',
  f5Body: 'रमेश ने आज चावल लिया। उसके नाम पर बैठा। ये लिस्ट Premium पर है।',
  f6Title: 'स्कैन करके इसी बिल पर',
  f6Body: 'बारकोड Maggi को इसी बिल पर डालता है। स्टॉक-इन तभी जब स्टॉक जोड़ रहे हो।',
  hisaabLabel: 'शाम का हिसाब',
  hisaabHindi: 'आज कितना कैश आया?',
  hisaabHeading: 'दिन से पूछो, रजिस्टर से नहीं',
  hisaabSub: 'भीड़ थमे तो पूछो कितना आया, किसका उधार अभी खुला है।',
  cmpWithoutHeading: 'भीड़ में, काग़ज़ पर',
  cmpWithHeading: 'वो वाक्य जो तुम बोल चुके',
  ctaHeading: 'अगले ग्राहक पर आज़माओ, खाली इतवार पर नहीं',
  footerBlurb: 'किराना काउंटर के लिए। जो लिया वो बोलो। बिल साथ चलता है।',
};

const localeSlots: Partial<Record<Locale, HomeSlots>> = {
  hi,
  bn: {
    heroH1: 'মুখে তো বলেই ফেললেন।<br>বিলও সাথে চলুক।',
    heroSub:
      'কাস্টমার এখনও দাঁড়িয়ে। যা নিয়েছে তা বলে দিন। অ্যাপ বিলে তুলে দেয়। ক্যাশ নিন, UPI QR দেখান, বা উধার লিখে দিন। স্টক দ্বিতীয় খাতা নয়।',
    navDownload: 'ডাউনলোড',
    ctaDownload: 'ডাউনলোড',
  },
  ta: {
    heroH1: 'வாய்விட்டுச் சொல்லிவிட்டீர்கள்.<br>பில்லும் கூடவே வரட்டும்.',
    heroSub:
      'வாடிக்கையாளர் இன்னும் நிற்கிறார். எடுத்ததைச் சொல்லுங்கள். ஆப் பில்லில் போடும். கேஷ் வாங்குங்கள், UPI QR காட்டுங்கள், அல்லது உதார் எழுதுங்கள்.',
    navDownload: 'பதிவிறக்கம்',
    ctaDownload: 'பதிவிறக்கம்',
    navAi: 'மாலை கணக்கு',
    hisaabLabel: 'மாலை கணக்கு',
  },
  te: {
    heroH1: 'నోటితో చెప్పేశారు.<br>బిల్ కూడా వెంట రావాలి.',
    navDownload: 'డౌన్‌లోడ్',
    ctaDownload: 'డౌన్‌లోడ్',
    navAi: 'సాయంత్రం హిసాబ్',
    hisaabLabel: 'సాయంత్రం హిసాబ్',
  },
  mr: {
    heroH1: 'बोलून तर तुम्ही झाला.<br>बिल सोबत चालावे.',
    navDownload: 'डाउनलोड',
    ctaDownload: 'डाउनलोड',
    navAi: 'संध्याकाळचा हिशोब',
    hisaabLabel: 'संध्याकाळचा हिशोब',
  },
  kn: {
    heroH1: 'ಬಾಯಿಂದ ಹೇಳಿ ಮುಗಿಸಿದ್ದೀರಿ.<br>ಬಿಲ್ ಜೊತೆಗೆ ಬರಲಿ.',
    navDownload: 'ಡೌನ್‌ಲೋಡ್',
    ctaDownload: 'ಡೌನ್‌ಲೋಡ್',
  },
  gu: {
    heroH1: 'બોલી તો તમે ચૂક્યા.<br>બિલ સાથે ચાલે.',
    navDownload: 'ડાઉનલોડ',
    ctaDownload: 'ડાઉનલોડ',
  },
  ml: {
    heroH1: 'വായ്കൊണ്ട് പറഞ്ഞുകഴിഞ്ഞു.<br>ബില്ലും കൂടെ വരട്ടെ.',
    navDownload: 'ഡൗൺലോഡ്',
    ctaDownload: 'ഡൗൺലോഡ്',
    navAi: 'വൈകുന്നേരത്തെ കണക്ക്',
    hisaabLabel: 'വൈകുന്നേരത്തെ കണക്ക്',
  },
  pa: {
    heroH1: 'ਬੋਲ ਤਾਂ ਤੁਸੀਂ ਚੁੱਕੇ।<br>ਬਿੱਲ ਨਾਲ ਚੱਲੇ।',
    navDownload: 'ਡਾਊਨਲੋਡ',
    ctaDownload: 'ਡਾਊਨਲੋਡ',
    navAi: 'ਸ਼ਾਮ ਦਾ ਹਿਸਾਬ',
    hisaabLabel: 'ਸ਼ਾਮ ਦਾ ਹਿਸਾਬ',
  },
  or: {
    heroH1: 'କହି ତ ସାରିଲେ।<br>ବିଲ୍ ସାଙ୍ଗରେ ଚାଲୁ।',
    navDownload: 'ଡାଉନଲୋଡ୍',
    ctaDownload: 'ଡାଉନଲୋଡ୍',
    navAi: 'ସନ୍ଧ୍ୟା ହିସାବ',
    hisaabLabel: 'ସନ୍ଧ୍ୟା ହିସାବ',
  },
};

function swap(html: string, needle: string, next?: string) {
  if (!next || next === needle) return html;
  if (!html.includes(needle)) return html;
  return html.replaceAll(needle, next);
}

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
            <div class="hero-stat-label">On the bill</div>
          </div>
          <div class="hero-stat">
            <div class="hero-stat-number">${slots.chipUpi ?? 'UPI'}</div>
            <div class="hero-stat-label">QR amount</div>
          </div>
          <div class="hero-stat">
            <div class="hero-stat-number">${slots.chipUdhaar ?? 'Udhaar'}</div>
            <div class="hero-stat-label">On a name</div>`,
    );
  }

  out = swap(out, `"${UTTERANCE}"`, `"${UTTERANCE}"`);
  out = swap(
    out,
    'Rice 5 kg sold · Cash/UPI?',
    slots.floatGloss ?? 'Rice 5 kg sold · Cash/UPI?',
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

  out = swap(out, '<h3>You speak the sale</h3>', `<h3>${slots.f1Title ?? 'You speak the sale'}</h3>`);
  out = swap(
    out,
    "<p>Confirm cash, UPI, or udhaar with a tap. This is not a call to the customer's UPI app.</p>",
    `<p>${slots.f1Body ?? "Confirm cash, UPI, or udhaar with a tap. This is not a call to the customer's UPI app."}</p>`,
  );
  out = swap(out, '<h3>10 Indian languages + English</h3>', `<h3>${slots.f2Title ?? '10 Indian languages + English'}</h3>`);
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
  out = swap(
    out,
    'आज का हिसाब',
    slots.hisaabHindi ?? 'आज का हिसाब',
  );
  out = swap(out, '        Ask the day, not the diary', `        ${slots.hisaabHeading ?? 'Ask the day, not the diary'}`);
  out = swap(
    out,
    '<p class="section-sub">Cash, UPI, udhaar, what sold. Stock already moved with the bill.</p>',
    `<p class="section-sub">${slots.hisaabSub ?? 'Cash, UPI, udhaar, what sold. Stock already moved with the bill.'}</p>`,
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

  out = swap(
    out,
    '        Try it on the next customer, not on a quiet Sunday.',
    `        ${slots.ctaHeading ?? 'Try it on the next customer, not on a quiet Sunday.'}`,
  );
  out = swap(
    out,
    '<p>For the kirana counter. You say what they took. The bill keeps up.</p>',
    `<p>${slots.footerBlurb ?? 'For the kirana counter. You say what they took. The bill keeps up.'}</p>`,
  );

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

  return out;
}

export function getLocaleHomeHtml(locale: Locale) {
  return applyHomeSlots(homeHtml, locale);
}

export const localeHomeSlots = localeSlots;
