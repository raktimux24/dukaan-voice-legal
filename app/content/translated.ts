import type { Locale } from '../i18n';

type LocalizedPageHtml = { home: string; privacy: string; terms: string };

export const translatedHtml: Partial<Record<Locale, LocalizedPageHtml>> = {
  "hi": {
    home: `<!-- Three.js background canvas -->
<canvas id="bgCanvas"></canvas>

<!-- Aurora ambient background (WebGL fallback) -->
<div class="aurora-bg"><div class="aurora-orb"></div></div>

<!-- Scroll progress indicator -->
<div class="scroll-progress" id="scrollProgress"></div>

<!-- ═══ NAVIGATION ═══ -->
<nav id="nav">
  <div class="container">
    <div class="nav-inner">
      <a href="#" class="logo">
        <div class="logo-mark"><svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><defs><mask id="stencil-nav"><rect x="0" y="0" width="100" height="100" fill="white"/><rect x="24" y="18" width="52" height="8" rx="4" fill="black"/><rect x="38" y="18" width="24" height="36" rx="12" fill="black"/><path d="M 28 42 A 22 22 0 0 0 72 42" fill="none" stroke="black" stroke-width="8" stroke-linecap="round"/><rect x="46" y="72" width="8" height="10" rx="4" fill="black"/><rect x="36" y="32" width="28" height="4" fill="white"/><rect x="36" y="44" width="28" height="4" fill="white"/></mask></defs><circle cx="50" cy="50" r="50" fill="#ea580c" mask="url(#stencil-nav)"/></svg></div>
        <div class="logo-text">समान<span>बोल</span></div>
      </a>
      <ul class="nav-links">
        <li><a href="#how">यह कैसे काम करता है</a></li>
        <li><a href="#features">विशेषताएं</a></li>
        <li><a href="#ai">एआई इंटेलिजेंस</a></li>
        <li><a href="#languages">भाषाएँ</a></li>
        <li><a href="https://apps.apple.com/in/app/samaan-bol/id6759739444" class="nav-cta">ऐप डाउनलोड करें</a></li>
      </ul>
      <button class="mobile-menu-btn" aria-label="Menu">☰</button>
    </div>
  </div>
</nav>

<!-- ═══ HERO ═══ -->
<section class="hero">
  <div class="container">
    <div class="hero-grid">
      <div>
        <div class="hero-eyebrow">भारतीय रिटेल के लिए वॉयस-फर्स्ट इन्वेंट्री</div>
        <h1 class="hero-text-reveal">
          <span class="hindi-line hindi">बोल के सँभालो अपना बिज़नेस</span>
          <span class="hero-text-main">अपनी दुकान संभालो<br>सिर्फ आपकी आवाज से</span>
        </h1>
        <p class="hero-sub">
          में बोलो <span class="hero-rotate"><span class="hero-rotate-word active">हिंदी</span><span class="hero-rotate-word">बंगाली</span><span class="hero-rotate-word">तमिल</span><span class="hero-rotate-word">तेलुगू</span><span class="hero-rotate-word">मराठी</span><span class="hero-rotate-word">अंग्रेजी</span></span>, या 10 भारतीय भाषाओं में से कोई भी।
          Samaan-Bol का AI आपके कमांड को समझता है, आपकी इन्वेंट्री को अपडेट करता है,
          और आपके व्यवसाय को चालू रखता है - हाथों से मुक्त।
        </p>
        <div class="hero-actions">
          <a href="#download" class="btn-primary">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            नि:शुल्क डाउनलोड करें
          </a>
          <a href="#how" class="btn-secondary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            इसे क्रियान्वित रूप में देखें
          </a>
        </div>
        <div class="hero-stats">
          <div class="hero-stat">
            <div class="hero-stat-number">11</div>
            <div class="hero-stat-label">भाषाएँ समर्थित</div>
          </div>
          <div class="hero-stat">
            <div class="hero-stat-number">50K+</div>
            <div class="hero-stat-label">आइटम दैनिक रूप से ट्रैक किए गए</div>
          </div>
          <div class="hero-stat">
            <div class="hero-stat-number">2 मिनट</div>
            <div class="hero-stat-label">सेटअप समय</div>
          </div>
        </div>
      </div>

      <div class="hero-visual">
        <!-- Floating cards (z-index 10 — in FRONT of phone) -->
        <div class="float-card float-card--voice">
          <div class="float-card-icon float-card-icon--voice"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg></div>
          <p><strong class="hindi">"चावल 5 किलो जोड़ दो"</strong></p>
          <p style="margin-top:6px; font-size:12px; color:var(--success);">✓ Basmati Rice — 18 → 23 किग्रा</p>
        </div>

        <div class="float-card float-card--alert">
          <div class="float-card-icon float-card-icon--alert"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg></div>
          <p><strong>कम स्टॉक चेतावनी</strong></p>
          <p style="margin-top:4px; font-size:12px;">आटा 3 दिन में ख़त्म हो सकता है</p>
        </div>

        <!-- Phone mockup — mirrors actual app UI -->
        <div class="phone-frame">
          <div class="phone-notch"></div>
          <div class="phone-screen">
            <div class="phone-status-bar">
              <span>9:41</span>
              <span style="display:flex; gap:4px; align-items:center;">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z"/></svg>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><rect x="17" y="4" width="4" height="16" rx="1"/><rect x="11" y="8" width="4" height="12" rx="1"/><rect x="5" y="12" width="4" height="8" rx="1"/></svg>
                <svg width="14" height="12" viewBox="0 0 28 14" fill="currentColor"><rect x="0" y="1" width="22" height="12" rx="2" stroke="currentColor" fill="none" stroke-width="1.5"/><rect x="24" y="4.5" width="3" height="5" rx="1"/><rect x="2" y="3" width="14" height="8" rx="1"/></svg>
              </span>
            </div>

            <!-- Header: greeting + bell -->
            <div class="phone-header">
              <div>
                <div class="phone-greeting">सुप्रभात! 👋</div>
                <div class="phone-subtext">Priya General Store</div>
              </div>
              <div class="phone-bell">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B6B70" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                <div class="phone-bell-badge">3</div>
              </div>
            </div>

            <!-- Search bar with mic icon -->
            <div class="phone-search">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4A4A50" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <span class="phone-search-text">उत्पाद खोजें...</span>
              <div class="phone-search-mic">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0D0D12" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/></svg>
              </div>
            </div>

            <!-- 2x2 Stats grid -->
            <div class="phone-stats-grid">
              <div class="phone-stat-card phone-stat-card--total">
                <div class="phone-stat-number">142</div>
                <div class="phone-stat-label">कुल आइटम</div>
              </div>
              <div class="phone-stat-card phone-stat-card--low">
                <div class="phone-stat-number" style="color:var(--warning);">8</div>
                <div class="phone-stat-label">कम स्टॉक</div>
              </div>
              <div class="phone-stat-card phone-stat-card--out">
                <div class="phone-stat-number" style="color:var(--danger);">2</div>
                <div class="phone-stat-label">स्टॉक से बाहर</div>
              </div>
              <div class="phone-stat-card phone-stat-card--activity">
                <div class="phone-stat-number" style="color:var(--success);">23</div>
                <div class="phone-stat-label">आज अद्यतन किया गया</div>
              </div>
            </div>

            <!-- Filter chips -->
            <div class="phone-filter-row">
              <span class="phone-chip phone-chip--active">सब</span>
              <span class="phone-chip">कम स्टॉक</span>
              <span class="phone-chip">बाहर</span>
              <span class="phone-chip">समाप्ति</span>
            </div>

            <!-- Product cards -->
            <div class="phone-product">
              <div class="phone-product-icon" style="background:rgba(255,181,71,0.12);">🍚</div>
              <div class="phone-product-info">
                <div class="phone-product-name">Basmati Rice</div>
                <div class="phone-product-meta">अनाज · 2 मिनट पहले अपडेट किया गया</div>
              </div>
              <div class="phone-product-qty">
                <div class="phone-product-qty-num">23</div>
                <div class="phone-product-qty-unit">किग्रा</div>
              </div>
            </div>

            <div class="phone-product">
              <div class="phone-product-icon" style="background:rgba(255,107,0,0.12);">🫒</div>
              <div class="phone-product-info">
                <div class="phone-product-name">Aashirvaad Atta</div>
                <div class="phone-product-meta">आटा · 1 घंटे पहले अपडेट किया गया</div>
                <div class="phone-product-status phone-product-status--low">कम स्टॉक</div>
              </div>
              <div class="phone-product-qty">
                <div class="phone-product-qty-num" style="color:var(--warning);">3</div>
                <div class="phone-product-qty-unit">किग्रा</div>
              </div>
            </div>

            <div class="phone-product">
              <div class="phone-product-icon" style="background:rgba(50,213,131,0.1);">🥛</div>
              <div class="phone-product-info">
                <div class="phone-product-name">Amul Toned Milk</div>
                <div class="phone-product-meta">डेयरी · 3 घंटे पहले अपडेट किया गया</div>
              </div>
              <div class="phone-product-qty">
                <div class="phone-product-qty-num">40</div>
                <div class="phone-product-qty-unit">pkt</div>
              </div>
            </div>

          </div>
          <!-- Floating mic FAB (like the real app) -->
          <div class="phone-fab">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0D0D12" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/></svg>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ═══ HOW IT WORKS ═══ -->
<section class="how-it-works" id="how">
  <div class="container">
    <div class="reveal">
      <div class="section-label">यह कैसे काम करता है</div>
      <h2 class="section-heading">तीन कदम. किसी प्रशिक्षण की आवश्यकता नहीं.</h2>
      <p class="section-sub">बस अपनी भाषा में स्वाभाविक रूप से बोलें - एआई बाकी काम संभाल लेता है।</p>
    </div>
    <div class="steps-grid">
      <div class="step reveal reveal-delay-1">
        <div class="step-number">01</div>
        <h3>अपनी आज्ञा बोलो</h3>
        <p>माइक टैप करें और बताएं कि आपको क्या चाहिए - स्टॉक जोड़ें, मात्रा जांचें, खरीदारी सूची बनाएं। किसी भी भारतीय भाषा में.</p>
        <div class="step-example">
          <div class="hindi">"चावल 5 किलो जोड़ दो"</div>
          <div class="english">5 किलो चावल डालें</div>
        </div>
      </div>
      <div class="step reveal reveal-delay-2">
        <div class="step-number">02</div>
        <h3>एआई तुरंत समझ जाता है</h3>
        <p>Sarvam AI आपके भाषण को संसाधित करता है, उत्पाद, मात्रा और क्रिया को निकालता है - फिर इसे आपकी सूची से मिलाता है।</p>
        <div class="step-example">
          <div style="display:flex; gap:12px; flex-wrap:wrap;">
            <span style="background:var(--saffron-tint); color:var(--saffron); padding:4px 10px; border-radius:4px; font-size:12px;">चावल → बासमती 🍚</span>
            <span style="background:rgba(50,213,131,0.1); color:var(--success); padding:4px 10px; border-radius:4px; font-size:12px;">+5 किग्रा</span>
            <span style="background:rgba(99,102,241,0.1); color:#818CF8; padding:4px 10px; border-radius:4px; font-size:12px;">✓ जोड़ें</span>
          </div>
        </div>
      </div>
      <div class="step reveal reveal-delay-3">
        <div class="step-number">03</div>
        <h3>इन्वेंटरी अद्यतन, पुष्टि की गई</h3>
        <p>आपका स्टॉक तुरंत अपडेट हो जाता है. आपको अपनी भाषा में ध्वनि पुष्टिकरण सुनाई देता है - किसी स्क्रीन की आवश्यकता नहीं है।</p>
        <div class="step-example">
          <div class="hindi">"हो गया — बासमती चावल अब 23 किलो है"</div>
          <div class="english">हो गया - बासमती चावल अब 23 किलो है</div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ═══ FEATURES ═══ -->
<section class="features" id="features" style="position:relative; overflow:hidden;">
  <div class="orb orb--saffron" style="top: -100px; right: -150px;"></div>
  <div class="container">
    <div class="reveal">
      <div class="section-label">विशेषताएं</div>
      <h2 class="section-heading">आपकी दुकान की जरूरत की हर चीज़. ऐसा कुछ भी नहीं है.</h2>
    </div>
    <div class="features-grid">
      <div class="feature feature--hero reveal reveal-delay-1">
        <div class="feature-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg></div>
        <h3>वॉयस-फर्स्ट इन्वेंटरी</h3>
        <p>स्वाभाविक रूप से बोलकर स्टॉक जोड़ें, हटाएं या जांचें। कोई टाइपिंग नहीं, मेनू के माध्यम से कोई खोज नहीं। बस अपनी भाषा में बोलें और एआई बाकी काम संभाल लेगा - आपके आदेश को समझने से लेकर वास्तविक समय में आपके स्टॉक को अपडेट करने तक।</p>
      </div>
      <div class="feature reveal reveal-delay-2">
        <div class="feature-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg></div>
        <h3>10 भारतीय भाषाएँ + अंग्रेजी</h3>
        <p>हिंदी, बंगाली, तमिल, तेलुगु, मराठी, कन्नड़, गुजराती, मलयालम, पंजाबी और उड़िया - Sarvam AI द्वारा संचालित।</p>
      </div>
      <div class="feature reveal reveal-delay-3">
        <div class="feature-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></div>
        <h3>टीम भूमिकाएँ</h3>
        <p>Owner, Manager, और Helper भूमिकाएँ बारीक अनुमतियों के साथ। सभी लोग एक ही पृष्ठ पर, सुरक्षित रूप से।</p>
      </div>
      <div class="feature reveal reveal-delay-1">
        <div class="feature-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/><path d="M9 14l2 2 4-4"/></svg></div>
        <h3>स्मार्ट खरीद सूचियाँ</h3>
        <p>क्या कम चल रहा है उसके आधार पर स्वचालित रूप से जेनरेट की गई रीस्टॉकिंग सूचियाँ। व्हाट्सएप के माध्यम से आपूर्तिकर्ताओं को साझा करें।</p>
      </div>
      <div class="feature reveal reveal-delay-2">
        <div class="feature-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></svg></div>
        <h3>गतिविधि ऑडिट लॉग</h3>
        <p>प्रत्येक परिवर्तन को कौन, क्या और कब से ट्रैक किया जाता है। आपकी टीम में पूर्ण पारदर्शिता।</p>
      </div>
      <div class="feature reveal reveal-delay-3">
        <div class="feature-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><line x1="7" y1="12" x2="17" y2="12"/><line x1="7" y1="8" x2="17" y2="8"/><line x1="7" y1="16" x2="17" y2="16"/></svg></div>
        <h3>बारकोड स्कैनिंग</h3>
        <p>तुरंत जोड़ने या देखने के लिए उत्पादों को स्कैन करें। भारतीय और अंतर्राष्ट्रीय बारकोड के साथ काम करता है।</p>
      </div>
    </div>
  </div>
</section>

<!-- ═══ AI INTELLIGENCE ═══ -->
<section class="ai-section" id="ai" style="overflow:hidden;">
  <div class="orb orb--indigo" style="bottom: -100px; left: -100px;"></div>
  <div class="orb orb--green" style="top: 200px; right: -80px;"></div>
  <div class="container">
    <div class="ai-header reveal">
      <div class="section-label">एआई इंटेलिजेंस</div>
      <h2 class="section-heading">
        <span class="hindi" style="display:block; color:var(--saffron); font-size:clamp(22px,2.8vw,32px); font-weight:500; margin-bottom:8px;">एआई को देखें जो आपकी बड़ी बात समझे</span>
        सिर्फ ट्रैकिंग नहीं - आपकी दुकान का पहला डिजिटल मस्तिष्क
      </h2>
      <p class="section-sub">Samaan-Bol केवल वही रिकॉर्ड नहीं करता जो आप उसे बताते हैं। यह आपके पैटर्न को सीखता है, आपकी आवश्यकताओं की भविष्यवाणी करता है और समस्याएं होने से पहले आपको सचेत करता है।</p>
    </div>

    <div class="ai-blocks">
      <!-- Predictive Stock -->
      <div class="ai-block reveal">
        <div class="ai-block-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg></div>
        <div class="ai-block-tag ai-block-tag--predict">पूर्वानुमानित स्टॉक</div>
        <h3>ऐसा करने से पहले जानता है कि आपको क्या आवश्यकता होगी</h3>
        <p>एआई आपके विक्रय पैटर्न को सीखता है - दैनिक, साप्ताहिक, मौसमी। यह भविष्यवाणी करता है कि वस्तुएँ कब कम हो जाएँगी और कुछ दिन पहले ही पुनः स्टॉक करने का सुझाव देता है।</p>
        <div class="ai-voice-example">
          <div class="voice-bubble">
            <div class="voice-bubble-avatar voice-bubble-avatar--ai"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg></div>
            <div class="voice-bubble-content">
              <div class="hindi">"आपका आटा 3 दिन में ख़तम हो सकता है - हफ़्ते की बिकरी के हिसाब से"</div>
              <div class="translation">साप्ताहिक बिक्री के आधार पर आपका आटा 3 दिनों में ख़त्म हो सकता है</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Smart Alerts -->
      <div class="ai-block reveal">
        <div class="ai-block-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg></div>
        <div class="ai-block-tag ai-block-tag--alert">स्मार्ट अलर्ट</div>
        <h3>अलर्ट जो आपकी भाषा बोलते हैं</h3>
        <p>समाप्ति चेतावनियाँ, धीमी गति से चलने वाले स्टॉक का पता लगाना, और मूल्य में उतार-चढ़ाव अलर्ट - आपकी पसंदीदा भाषा में ध्वनि सूचनाओं के रूप में वितरित किए जाते हैं।</p>
        <div class="ai-voice-example">
          <div class="voice-bubble">
            <div class="voice-bubble-avatar voice-bubble-avatar--ai"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg></div>
            <div class="voice-bubble-content">
              <div class="hindi">"Parle-G के 12 पैकेट 5 दिन में एक्सपायर हो रहे हैं - डिस्काउंट लगाना चाहिए?"</div>
              <div class="translation">12 Parle-G पैकेट 5 दिनों में समाप्त हो रहे हैं - छूट जोड़ना चाहते हैं?</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Voice Analytics -->
      <div class="ai-block reveal">
        <div class="ai-block-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg></div>
        <div class="ai-block-tag ai-block-tag--insight">आवाज विश्लेषण</div>
        <h3>अपनी दुकान से एक प्रश्न पूछें - वह उत्तर देता है</h3>
        <p>अपने व्यवसाय के बारे में प्राकृतिक भाषा में कुछ भी पूछें। एआई बोले गए उत्तरों और ऑन-स्क्रीन डेटा के साथ प्रतिक्रिया करता है।</p>
        <div class="ai-voice-example">
          <div class="voice-bubble">
            <div class="voice-bubble-avatar voice-bubble-avatar--user"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>
            <div class="voice-bubble-content">
              <div class="hindi">"पिछले हफ्ते सबसे ज्यादा क्या बिका?"</div>
              <div class="translation">पिछले सप्ताह सबसे अधिक क्या बिका?</div>
            </div>
          </div>
          <div class="voice-bubble">
            <div class="voice-bubble-avatar voice-bubble-avatar--ai"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg></div>
            <div class="voice-bubble-content">
              <div class="hindi">"पिछले हफ़्ते सबसे ज़्यादा चावल बिका - 48 किलो"</div>
              <div class="translation">पिछले सप्ताह चावल सबसे अधिक बिका - 48 किलो</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Team Intelligence -->
      <div class="ai-block reveal">
        <div class="ai-block-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>
        <div class="ai-block-tag ai-block-tag--team">टीम इंटेलिजेंस</div>
        <h3>जानें कि आपकी टीम क्या कर रही है</h3>
        <p>एआई-संचालित विसंगति का पता लगाने से असामान्य इन्वेंट्री परिवर्तन का पता चलता है। स्मार्ट सारांश दिखाते हैं कि किसने क्या अपडेट किया और क्या सुधार की आवश्यकता थी।</p>
        <div class="ai-voice-example">
          <div class="voice-bubble">
            <div class="voice-bubble-avatar voice-bubble-avatar--ai"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg></div>
            <div class="voice-bubble-content">
              <div class="hindi">"आज शाम 6 बजे 15 किलो चीनी का स्टॉक कम हुआ - सत्यापित करें?"</div>
              <div class="translation">आज शाम 6 बजे 15 किलो चीनी का स्टॉक कम हो गया - सत्यापित करना चाहते हैं?</div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</section>

<!-- ═══ LANGUAGES ═══ -->
<section class="languages-section" id="languages">
  <div class="container">
    <div class="reveal">
      <div class="section-label">भारत के लिए बनाया गया</div>
      <h2 class="section-heading">आपकी भाषा. तुम्हारा व्यापार। आपका रास्ता।</h2>
      <p class="section-sub">Samaan-Bol आपके बोलने के तरीके से बोलता है - देशी लिपियों, बोलचाल के शब्दों और क्षेत्रीय उत्पाद नामों के पूर्ण समर्थन के साथ।</p>
    </div>
    <div class="lang-grid reveal">
      <div class="lang-chip lang-chip--featured">हिंदी <span class="native hindi">हिन्दी</span></div>
      <div class="lang-chip">बंगाली <span class="native">বাংলা</span></div>
      <div class="lang-chip">तमिल <span class="native">தமிழ்</span></div>
      <div class="lang-chip">तेलुगू <span class="native">తెలుగు</span></div>
      <div class="lang-chip">मराठी <span class="native">मराठी</span></div>
      <div class="lang-chip">कन्नडा <span class="native">ಕನ್ನಡ</span></div>
      <div class="lang-chip">गुजराती <span class="native">ગુજરાતી</span></div>
      <div class="lang-chip">मलयालम <span class="native">മലയാളം</span></div>
      <div class="lang-chip">पंजाबी <span class="native">ਪੰਜਾਬੀ</span></div>
      <div class="lang-chip">उड़िया <span class="native">ଓଡ଼ିଆ</span></div>
      <div class="lang-chip">अंग्रेजी <span class="native">अंग्रेजी</span></div>
    </div>
  </div>
</section>

<!-- ═══ COMPARISON ═══ -->
<section class="comparison">
  <div class="container">
    <div class="reveal">
      <div class="section-label">क्यों Samaan-Bol</div>
      <h2 class="section-heading">रात दिन का फर्क है</h2>
    </div>
    <div class="comparison-grid reveal">
      <div class="comparison-col comparison-col--without">
        <h3>बिना Samaan-Bol के</h3>
        <p class="comparison-col-subtitle">स्टॉक प्रबंधन का पुराना तरीका</p>
        <ul class="comparison-list">
          <li><span class="icon">✕</span> मैनुअल गिनती, कलम और कागज रजिस्टर</li>
          <li><span class="icon">✕</span> ग्राहक के पूछने पर स्टॉकआउट का पता चलता है</li>
          <li><span class="icon">✕</span> अनुमान लगा रहा हूँ कि कितना पुनः व्यवस्थित करना है</li>
          <li><span class="icon">✕</span> पता नहीं क्या समाप्त हो रहा है या धीमी गति से चल रहा है</li>
          <li><span class="icon">✕</span> स्टाफ क्या कर रहा है, इस पर नज़र नहीं रखी जा सकती</li>
          <li><span class="icon">✕</span> त्यौहार की तैयारी आखिरी मिनट में अराजकता है</li>
        </ul>
      </div>
      <div class="comparison-col comparison-col--with">
        <h3>Samaan-Bol के साथ</h3>
        <p class="comparison-col-subtitle">एआई-संचालित, आवाज-प्रथम, सहज</p>
        <ul class="comparison-list">
          <li><span class="icon">✓</span> वॉयस अपडेट - इसे कहें और यह हो गया</li>
          <li><span class="icon">✓</span> स्टॉक ख़त्म होने से कुछ दिन पहले पूर्वानुमानित अलर्ट</li>
          <li><span class="icon">✓</span> वास्तविक डेटा के आधार पर AI-जनित खरीद सूचियाँ</li>
          <li><span class="icon">✓</span> समाप्ति और धीमी गति का पता लगाने में अंतर्निहित</li>
          <li><span class="icon">✓</span> विसंगति का पता लगाने के साथ पूर्ण ऑडिट ट्रेल</li>
          <li><span class="icon">✓</span> त्योहार का पूर्वानुमान 2 सप्ताह पहले शुरू होता है</li>
        </ul>
      </div>
    </div>
  </div>
</section>

<!-- ═══ TESTIMONIALS ═══ -->
<section class="testimonials">
  <div class="container">
    <div class="reveal">
      <div class="section-label">प्रारंभिक अपनाने वाले</div>
      <h2 class="section-heading">पूरे भारत में बीटा परीक्षकों द्वारा पसंद किया गया</h2>
    </div>
    <div class="testimonials-grid">
      <div class="testimonial reveal reveal-delay-1">
        <div class="testimonial-stars">★★★★★</div>
        <blockquote>बीटा टेस्टिंग में ट्राई किया - पहले दिन से रजिस्टर बैंड। अब बस बोल देती हूं और सब अपडेट हो जाता है। इतना आसान होगा सोचा नहीं था.</blockquote>
        <div class="testimonial-author">मीना शर्मा</div>
        <div class="testimonial-role">बीटा टेस्टर · किराना स्टोर Owner, जयपुर</div>
      </div>
      <div class="testimonial reveal reveal-delay-2">
        <div class="testimonial-stars">★★★★★</div>
        <blockquote>जनवरी में बेटा शामिल हुआ था - होली के लिए एआई ने पहले ही बता दिया था कि क्या स्टॉक बढ़ाना है। अभी से इतना स्मार्ट है, सोचिए लॉन्च के बाद क्या होगा।</blockquote>
        <div class="testimonial-author">अर्जुन पटेल</div>
        <div class="testimonial-role">बीटा टेस्टर · जनरल स्टोर, अहमदाबाद</div>
      </div>
      <div class="testimonial reveal reveal-delay-3">
        <div class="testimonial-stars">★★★★★</div>
        <blockquote>बांग्ला में बोलते ही समझ गया - बेटा परीक्षण-ए देखलम जे अमर भाषा ते काज कोरे। स्टाफ़ रा ओ ख़ुब आसानी से कॉर्टे परचे का उपयोग करें।</blockquote>
        <div class="testimonial-author">रीना दास</div>
        <div class="testimonial-role">बीटा टेस्टर · कपड़ा दुकान, कोलकाता</div>
      </div>
    </div>
  </div>
</section>

<!-- ═══ CTA ═══ -->
<section class="cta-section" id="download">
  <div class="container">
    <div class="reveal">
      <div class="section-label">निःशुल्क आरंभ करें</div>
      <h2 class="section-heading">
        <span class="hindi" style="display:block; color:var(--saffron); font-size:clamp(20px,2.4vw,28px); font-weight:500; margin-bottom:8px;">आज ही शुरू करें</span>
        आपकी दुकान एक नोटबुक से बेहतर की हकदार है
      </h2>
      <p class="section-sub">शुरू करने के लिए स्वतंत्र. 2 मिनट में सेट करें. किसी क्रेडिट कार्ड की आवश्यकता नहीं.</p>
      <div class="cta-actions">
        <a href="https://apps.apple.com/in/app/samaan-bol/id6759739444" class="store-badge">
          <div class="store-badge-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg></div>
          <div class="store-badge-text">
            <div class="store-badge-label">पर डाउनलोड करें</div>
            <div class="store-badge-name">App Store</div>
          </div>
        </a>
        <a href="#" class="store-badge" style="position:relative; opacity:0.65; pointer-events:none;">
          <div class="store-badge-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.807 1.626a1 1 0 0 1 0 1.73l-2.808 1.626L15.206 12l2.492-2.491zM5.864 2.658L16.8 8.99l-2.3 2.3-8.636-8.632z"/></svg></div>
          <div class="store-badge-text">
            <div class="store-badge-label">इसे लगाओ</div>
            <div class="store-badge-name">Google Play</div>
          </div>
          <span style="position:absolute; top:-10px; right:-10px; background:var(--saffron); color:#fff; font-size:11px; font-weight:700; padding:3px 10px; border-radius:20px; letter-spacing:0.5px; text-transform:uppercase;">जल्द आ रहा है</span>
        </a>
      </div>
    </div>
  </div>
</section>

<!-- ═══ FOOTER ═══ -->
<footer>
  <div class="container">
    <div class="footer-grid">
      <div class="footer-brand">
        <a href="#" class="logo">
          <div class="logo-mark"><svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><defs><mask id="stencil-footer"><rect x="0" y="0" width="100" height="100" fill="white"/><rect x="24" y="18" width="52" height="8" rx="4" fill="black"/><rect x="38" y="18" width="24" height="36" rx="12" fill="black"/><path d="M 28 42 A 22 22 0 0 0 72 42" fill="none" stroke="black" stroke-width="8" stroke-linecap="round"/><rect x="46" y="72" width="8" height="10" rx="4" fill="black"/><rect x="36" y="32" width="28" height="4" fill="white"/><rect x="36" y="44" width="28" height="4" fill="white"/></mask></defs><circle cx="50" cy="50" r="50" fill="#ea580c" mask="url(#stencil-footer)"/></svg></div>
          <div class="logo-text">समान<span>बोल</span></div>
        </a>
        <p>वॉयस-फर्स्ट एआई इन्वेंट्री प्रबंधन, भारतीय खुदरा क्षेत्र के दिल के लिए बनाया गया।</p>
      </div>
      <div class="footer-col">
        <h4>उत्पाद</h4>
        <ul>
          <li><a href="#features">विशेषताएं</a></li>
          <li><a href="#ai">एआई इंटेलिजेंस</a></li>
          <li><a href="#languages">भाषाएँ</a></li>
          <li><a href="#">मूल्य निर्धारण</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>कंपनी</h4>
        <ul>
          <li><a href="#">के बारे में</a></li>
          <li><a href="#">ब्लॉग</a></li>
          <li><a href="#">करियर</a></li>
          <li><a href="#">संपर्क करें</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>समर्थन</h4>
        <ul>
          <li><a href="#">सहायता केंद्र</a></li>
          <li><a href="/privacy-policy">गोपनीयता नीति</a></li>
          <li><a href="/terms-of-service">सेवा की शर्तें</a></li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <span>© 2026 Samaan-Bol. सर्वाधिकार सुरक्षित।</span>
      <span class="made-in-india">भारत में ♥ के साथ निर्मित 🇮🇳</span>
    </div>
  </div>
</footer>`,
    privacy: `<div class="reading-progress" id="readingProgress"></div>

  <div class="container">
    <a href="/" class="back">← घर वापसी</a>
    <h1>गोपनीयता नीति</h1>
    <p class="effective">प्रभावी तिथि: 23 फरवरी, 2026</p>

    <nav class="toc">
      <h3>सामग्री</h3>
      <ol>
        <li><a href="#s1">जानकारी हम एकत्रित करते हैं</a></li>
        <li><a href="#s2">हम आपकी जानकारी का उपयोग कैसे करते हैं</a></li>
        <li><a href="#s3">तृतीय-पक्ष सेवाएँ</a></li>
        <li><a href="#s4">डेटा भंडारण एवं सुरक्षा</a></li>
        <li><a href="#s5">डेटा प्रतिधारण</a></li>
        <li><a href="#s6">खाता हटाना</a></li>
        <li><a href="#s7">दुकानों के भीतर डेटा साझा करना</a></li>
        <li><a href="#s8">बच्चों की गोपनीयता</a></li>
        <li><a href="#s9">आपके अधिकार</a></li>
        <li><a href="#s10">इस नीति में परिवर्तन</a></li>
        <li><a href="#s11">हमसे संपर्क करें</a></li>
      </ol>
    </nav>

    <p>Samaan-Bol ("हम", "हमारा", या "ऐप") भारतीय खुदरा व्यवसायों के लिए डिज़ाइन किया गया एक वॉयस-फर्स्ट सहयोगी इन्वेंट्री प्रबंधन एप्लिकेशन है। यह गोपनीयता नीति बताती है कि हम कौन सी जानकारी एकत्र करते हैं, हम इसका उपयोग कैसे करते हैं, हम इसे किसके साथ साझा करते हैं, और आपके डेटा के संबंध में आपके अधिकार।</p>

    <p>Samaan-Bol का उपयोग करके, आप इस नीति में वर्णित जानकारी के संग्रह और उपयोग के लिए सहमत हैं।</p>

    <details open id="s1">
      <summary><h2>1. जानकारी हम एकत्रित करते हैं</h2></summary>
      <div class="section-content">
        <h3>1.1 खाता जानकारी</h3>
        <p>जब आप एक खाता बनाते हैं, तो हम एकत्र करते हैं:</p>
        <ul>
          <li><strong>पूरा नाम</strong> - साइन-अप के दौरान प्रदान किया गया</li>
          <li><strong>Email पता</strong> - प्रमाणीकरण और खाता पुनर्प्राप्ति के लिए उपयोग किया जाता है</li>
          <li><strong>पासवर्ड</strong> - हमारे प्रमाणीकरण प्रदाता द्वारा एन्क्रिप्टेड और प्रबंधित (Clerk)</li>
        </ul>
        <p>यदि आप Google या Apple से साइन इन करते हैं, तो हमें OAuth प्रदाता से आपका नाम और ईमेल प्राप्त होता है। हम आपके Google या Apple खाते के पासवर्ड तक नहीं पहुंचते हैं।</p>

        <h3>1.2 वॉयस रिकॉर्डिंग</h3>
        <div class="highlight">
          <p><strong>महत्वपूर्ण:</strong> वॉयस रिकॉर्डिंग वास्तविक समय में संसाधित की जाती हैं और हैं <strong>स्थायी रूप से संग्रहीत नहीं</strong>. ऑडियो को हमारे सर्वर पर प्रेषित किया जाता है, वाक् पहचान और प्राकृतिक भाषा को समझने के लिए Sarvam AI द्वारा संसाधित किया जाता है, और प्रसंस्करण के बाद तुरंत हटा दिया जाता है। आपके संदर्भ के लिए केवल परिणामी पाठ प्रतिलेख आपके ऑडिट लॉग में संग्रहीत किया जाता है।</p>
        </div>
        <ul>
          <li>ऑडियो आपके डिवाइस पर रिकॉर्ड किया गया है (WAV प्रारूप iOS पर, M4A Android पर)</li>
          <li>रिकॉर्डिंग अधिकतम 30 सेकंड तक सीमित हैं</li>
          <li>ऑडियो एक सुरक्षित कनेक्शन के माध्यम से एन्कोडेड डेटा के रूप में हमारे सर्वर पर भेजा जाता है</li>
          <li>प्रोसेसिंग के बाद, ऑडियो डेटा सर्वर मेमोरी से हटा दिया जाता है</li>
          <li>पाठ प्रतिलेख आपकी दुकान के ऑडिट लॉग में संग्रहीत किए जाते हैं ताकि आप पिछली कार्रवाइयों की समीक्षा कर सकें</li>
        </ul>

        <h3>1.3 इन्वेंटरी और व्यावसायिक डेटा</h3>
        <p>जब आप ऐप का उपयोग करते हैं, तो हम आपके द्वारा बनाए गए व्यावसायिक डेटा को संग्रहीत करते हैं:</p>
        <ul>
          <li>दुकान की जानकारी (नाम, श्रेणी, पसंदीदा भाषा)</li>
          <li>उत्पाद सूची (नाम, बारकोड, श्रेणियां, इकाइयां, कीमतें)</li>
          <li>स्टॉक मात्रा, बैच नंबर, खरीद तिथियां, समाप्ति तिथियां, आपूर्तिकर्ता के नाम</li>
          <li>सूची आइटम और नोट्स खरीदें</li>
          <li>ऑडिट लॉग इन्वेंट्री परिवर्तनों को रिकॉर्ड करता है (क्रिया प्रकार, उपयोगकर्ता, टाइमस्टैम्प, प्रतिलेख, आत्मविश्वास स्कोर)</li>
        </ul>

        <h3>1.4 उपयोगकर्ता प्राथमिकताएँ</h3>
        <ul>
          <li>ऐप भाषा और ध्वनि भाषा चयन</li>
          <li>ध्वनि प्रतिक्रिया प्राथमिकता (चालू/बंद)</li>
          <li>प्रदर्शन सेटिंग्स (उच्च कंट्रास्ट मोड, पाठ आकार)</li>
          <li>डिफ़ॉल्ट माप इकाई</li>
          <li>अधिसूचना प्राथमिकताएँ</li>
        </ul>

        <h3>1.5 दुकान सदस्यता डेटा</h3>
        <ul>
          <li>प्रत्येक दुकान में आपकी भूमिका (Owner, Manager, या Helper)</li>
          <li>टीम सहयोग के लिए आमंत्रण कोड जनरेट किए गए</li>
          <li>दुकानों के भीतर अंतिम सक्रिय टाइमस्टैम्प</li>
        </ul>

        <h3>1.6 डिवाइस और डायग्नोस्टिक डेटा</h3>
        <p>प्रोडक्शन बिल्ड में, हम क्रैश रिपोर्टिंग के लिए Sentry का उपयोग करते हैं। यह एकत्रित करता है:</p>
        <ul>
          <li>डिवाइस का प्रकार, ऑपरेटिंग सिस्टम और ऐप संस्करण</li>
          <li>क्रैश रिपोर्ट और त्रुटि स्टैक निशान</li>
          <li>प्रदर्शन डेटा (20% सत्रों में नमूना)</li>
        </ul>
        <p>क्रैश रिपोर्टिंग डेवलपमेंट बिल्ड में अक्षम है और हमारे द्वारा लागू की गई सैंपलिंग दर से इसे कम किया जा सकता है।</p>
      </div>
    </details>

    <details id="s2">
      <summary><h2>2. हम आपकी जानकारी का उपयोग कैसे करते हैं</h2></summary>
      <div class="section-content">
        <ul>
          <li><strong>सेवा प्रदान करें:</strong> वॉयस कमांड प्रोसेस करें, इन्वेंट्री प्रबंधित करें और अपनी टीम में डेटा सिंक करें</li>
          <li><strong>प्रमाणीकरण:</strong> अपनी पहचान सत्यापित करें और सुरक्षित सत्र प्रबंधित करें</li>
          <li><strong>ऑडिट ट्रेल:</strong> जवाबदेही और समीक्षा के लिए इन्वेंट्री परिवर्तनों का एक लॉग बनाए रखें</li>
          <li><strong>सेवा में सुधार करें:</strong> अज्ञात त्रुटि रिपोर्ट के माध्यम से बग और क्रैश का निदान करें</li>
          <li><strong>संचार:</strong> आवश्यक खाता-संबंधित सूचनाएं भेजें (उदाहरण के लिए, पासवर्ड रीसेट)</li>
        </ul>
        <p>हम करते हैं <strong>नहीं</strong> विज्ञापन के लिए अपने डेटा का उपयोग करें, और हम करते हैं <strong>नहीं</strong> अपनी व्यक्तिगत जानकारी तीसरे पक्ष को बेचें।</p>
      </div>
    </details>

    <details id="s3">
      <summary><h2>3. तृतीय-पक्ष सेवाएँ</h2></summary>
      <div class="section-content">
        <p>ऐप को संचालित करने के लिए हम निम्नलिखित तृतीय-पक्ष सेवाओं का उपयोग करते हैं:</p>
        <table>
          <thead>
            <tr>
              <th>सेवा</th>
              <th>प्रयोजन</th>
              <th>डेटा साझा किया गया</th>
              <th>गोपनीयता नीति</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Clerk</strong></td>
              <td>प्रमाणीकरण एवं सत्र प्रबंधन</td>
              <td>Email, नाम, OAuth टोकन, सत्र डेटा</td>
              <td><a href="https://clerk.com/legal/privacy" target="_blank" rel="noopener">क्लर्क.कॉम/लीगल/प्राइवेसी</a></td>
            </tr>
            <tr>
              <td><strong>Sarvam AI</strong></td>
              <td>ध्वनि प्रसंस्करण (वाक्-से-पाठ, प्राकृतिक भाषा प्रसंस्करण, पाठ-से-वाक्)</td>
              <td>ऑडियो रिकॉर्डिंग, प्रतिलेख पाठ, भाषा कोड</td>
              <td><a href="https://www.sarvam.ai/privacy-policy" target="_blank" rel="noopener">sarvam.ai/privacy-policy</a></td>
            </tr>
            <tr>
              <td><strong>Neon</strong></td>
              <td>डेटाबेस होस्टिंग (PostgreSQL)</td>
              <td>सभी कायम एप्लिकेशन डेटा</td>
              <td><a href="https://neon.tech/privacy-policy" target="_blank" rel="noopener">neon.tech/privacy-policy</a></td>
            </tr>
            <tr>
              <td><strong>Sentry</strong></td>
              <td>त्रुटि ट्रैकिंग एवं क्रैश रिपोर्टिंग</td>
              <td>क्रैश रिपोर्ट, डिवाइस जानकारी (केवल उत्पादन)</td>
              <td><a href="https://sentry.io/privacy/" target="_blank" rel="noopener">sentry.io/privacy</a></td>
            </tr>
          </tbody>
        </table>
        <p>प्रत्येक तृतीय-पक्ष सेवा अपनी गोपनीयता नीति के अनुसार डेटा संसाधित करती है। हम आपको उनकी नीतियों की समीक्षा करने के लिए प्रोत्साहित करते हैं।</p>
      </div>
    </details>

    <details id="s4">
      <summary><h2>4. डेटा संग्रहण एवं सुरक्षा</h2></summary>
      <div class="section-content">
        <ul>
          <li>एप्लिकेशन डेटा को ट्रांज़िट में Neon PostgreSQL डेटाबेस में SSL/TLS एन्क्रिप्शन के साथ संग्रहीत किया जाता है</li>
          <li>प्रमाणीकरण टोकन आपके डिवाइस पर सुरक्षित भंडारण (iOS किचेन / Android कीस्टोर) का उपयोग करके संग्रहीत किए जाते हैं</li>
          <li>API संचार HTTPS एन्क्रिप्शन का उपयोग करता है</li>
          <li>दुरुपयोग को रोकने के लिए संवेदनशील समापन बिंदु दर-सीमित हैं</li>
          <li>पासवर्ड को Clerk द्वारा हैश और प्रबंधित किया जाता है - हम कभी भी प्लेनटेक्स्ट पासवर्ड संग्रहीत नहीं करते हैं</li>
        </ul>
      </div>
    </details>

    <details id="s5">
      <summary><h2>5. डेटा प्रतिधारण</h2></summary>
      <div class="section-content">
        <ul>
          <li><strong>ध्वनि ऑडियो:</strong> क्षणभंगुर - स्मृति में संसाधित और तुरंत त्याग दिया गया। हमारे सर्वर पर कभी संग्रहीत नहीं किया गया.</li>
          <li><strong>प्रतिलेख और ऑडिट लॉग:</strong> आपके संदर्भ के लिए, जब तक आपका खाता सक्रिय है, तब तक इसे बरकरार रखा जाएगा।</li>
          <li><strong>इन्वेंटरी डेटा:</strong> जब तक आपका खाता सक्रिय है, तब तक इसे बरकरार रखा जाता है।</li>
          <li><strong>खाता डेटा:</strong> जब तक आप अपना खाता हटा नहीं देते, तब तक इसे बनाए रखा जाता है।</li>
          <li><strong>दुर्घटना रिपोर्ट:</strong> Sentry की डेटा प्रतिधारण नीति (आमतौर पर 90 दिन) के अनुसार बनाए रखा जाता है।</li>
        </ul>
      </div>
    </details>

    <details id="s6">
      <summary><h2>6. खाता हटाना</h2></summary>
      <div class="section-content">
        <p>आप किसी भी समय अपना खाता हटा सकते हैं <strong>Settings > Delete Account</strong> ऐप के भीतर। जब आप अपना खाता हटाते हैं:</p>
        <ul>
          <li>आपके स्वामित्व वाली सभी दुकानें स्थायी रूप से हटा दी गई हैं, जिनमें सभी उत्पाद, इन्वेंट्री, बैच, खरीद सूचियां और एआई भविष्यवाणियां शामिल हैं</li>
          <li>आपके सभी ऑडिट लॉग और प्राथमिकताएँ स्थायी रूप से हटा दी गई हैं</li>
          <li>अन्य उपयोगकर्ताओं की दुकानों से आपकी सदस्यताएँ हटा दी जाती हैं</li>
          <li>Clerk वाला आपका प्रमाणीकरण खाता स्थायी रूप से हटा दिया गया है</li>
        </ul>
        <p><strong>यह क्रिया अपरिवर्तनीय है.</strong> एक बार डिलीट होने के बाद आपका डेटा रिकवर नहीं किया जा सकता।</p>
      </div>
    </details>

    <details id="s7">
      <summary><h2>7. दुकानों के भीतर डेटा साझा करना</h2></summary>
      <div class="section-content">
        <p>Samaan-Bol एक सहयोगी उपकरण है। जब आप किसी दुकान के सदस्य हों:</p>
        <ul>
          <li>दुकान के सभी सदस्य (Owners, Managers, Helpers) दुकान का इन्वेंट्री डेटा, उत्पाद कैटलॉग और ऑडिट लॉग देख सकते हैं</li>
          <li>आपका नाम, भूमिका और गतिविधि टाइमस्टैम्प दुकान के अन्य सदस्यों को दिखाई देते हैं</li>
          <li>Owner अपनी दुकान के लिए सदस्यता और पहुंच का प्रबंधन कर सकते हैं</li>
        </ul>
        <p>हम आपका डेटा उन दुकानों के साथ साझा नहीं करते हैं जिनके आप सदस्य नहीं हैं, न ही किसी असंबंधित तीसरे पक्ष के साथ।</p>
      </div>
    </details>

    <details id="s8">
      <summary><h2>8. बच्चों की गोपनीयता</h2></summary>
      <div class="section-content">
        <p>Samaan-Bol 13 वर्ष से कम उम्र के बच्चों द्वारा उपयोग के लिए अभिप्रेत नहीं है। हम जानबूझकर 13 वर्ष से कम उम्र के बच्चों से व्यक्तिगत जानकारी एकत्र नहीं करते हैं। यदि आपको लगता है कि किसी बच्चे ने हमें व्यक्तिगत जानकारी प्रदान की है, तो कृपया हमसे संपर्क करें और हम इसे तुरंत हटा देंगे।</p>
      </div>
    </details>

    <details id="s9">
      <summary><h2>9. आपके अधिकार</h2></summary>
      <div class="section-content">
        <p>आपको इसका अधिकार है:</p>
        <ul>
          <li><strong>अपने डेटा तक पहुंचें:</strong> ऐप के भीतर अपनी इन्वेंट्री, ऑडिट लॉग और प्राथमिकताएं देखें</li>
          <li><strong>अपना डेटा हटाएं:</strong> सेटिंग्स में खाता हटाने की सुविधा का उपयोग करें</li>
          <li><strong>नियंत्रण प्राथमिकताएँ:</strong> किसी भी समय अपनी भाषा, प्रदर्शन और ध्वनि सेटिंग संशोधित करें</li>
          <li><strong>दुकानों से निकासी:</strong> आप जिस भी दुकान के सदस्य हैं उसे छोड़ दें</li>
        </ul>
      </div>
    </details>

    <details id="s10">
      <summary><h2>10. इस नीति में परिवर्तन</h2></summary>
      <div class="section-content">
        <p>हम इस गोपनीयता नीति को समय-समय पर अद्यतन कर सकते हैं। जब हम ऐसा करेंगे, तो हम इस पृष्ठ के शीर्ष पर "प्रभावी तिथि" को अपडेट कर देंगे। हम आपको समय-समय पर इस नीति की समीक्षा करने के लिए प्रोत्साहित करते हैं। परिवर्तनों के बाद ऐप का निरंतर उपयोग अद्यतन नीति की स्वीकृति माना जाता है।</p>
      </div>
    </details>

    <details id="s11">
      <summary><h2>11. हमसे संपर्क करें</h2></summary>
      <div class="section-content">
        <p>यदि इस गोपनीयता नीति या आपके डेटा के बारे में आपके कोई प्रश्न हैं, तो कृपया हमसे यहां संपर्क करें:</p>
        <p><strong>Email:</strong> <a href="mailto:meetslimshady07@gmail.com">meetslimshady07@gmail.com</a></p>
      </div>
    </details>

    <p class="copyright">© 2026 Samaan-Bol. सर्वाधिकार सुरक्षित।</p>
  </div>

  <button class="back-to-top" id="backToTop" aria-label="Back to top">↑</button>`,
    terms: `<div class="reading-progress" id="readingProgress"></div>

  <div class="container">
    <a href="/" class="back">← घर वापसी</a>
    <h1>सेवा की शर्तें</h1>
    <p class="effective">प्रभावी तिथि: 23 फरवरी, 2026</p>

    <nav class="toc">
      <h3>सामग्री</h3>
      <ol>
        <li><a href="#s1">सेवा का विवरण</a></li>
        <li><a href="#s2">खाता पंजीकरण</a></li>
        <li><a href="#s3">उपयोगकर्ता भूमिकाएँ और जिम्मेदारियाँ</a></li>
        <li><a href="#s4">ध्वनि इनपुट</a></li>
        <li><a href="#s5">स्वीकार्य उपयोग</a></li>
        <li><a href="#s6">आपका डेटा</a></li>
        <li><a href="#s7">सेवा उपलब्धता</a></li>
        <li><a href="#s8">दर सीमाएँ</a></li>
        <li><a href="#s9">खाता समाप्ति</a></li>
        <li><a href="#s10">बौद्धिक संपदा</a></li>
        <li><a href="#s11">वारंटी का अस्वीकरण</a></li>
        <li><a href="#s12">दायित्व की सीमा</a></li>
        <li><a href="#s13">इन शर्तों में परिवर्तन</a></li>
        <li><a href="#s14">शासी कानून</a></li>
        <li><a href="#s15">हमसे संपर्क करें</a></li>
      </ol>
    </nav>

    <p>Samaan-Bol में आपका स्वागत है। सेवा की ये शर्तें ("शर्तें") Samaan-Bol मोबाइल एप्लिकेशन और संबंधित सेवाओं (सामूहिक रूप से, "सेवा") के आपके उपयोग को नियंत्रित करती हैं। खाता बनाकर या सेवा का उपयोग करके, आप इन शर्तों से बंधे होने के लिए सहमत हैं।</p>

    <details open id="s1">
      <summary><h2>1. सेवा का विवरण</h2></summary>
      <div class="section-content">
        <p>Samaan-Bol भारतीय खुदरा व्यवसायों के लिए डिज़ाइन किया गया एक वॉयस-फर्स्ट सहयोगी इन्वेंट्री प्रबंधन एप्लिकेशन है। सेवा आपको इसकी अनुमति देती है:</p>
        <ul>
          <li>कई भारतीय भाषाओं में वॉयस कमांड का उपयोग करके उत्पाद सूची प्रबंधित करें</li>
          <li>स्टॉक स्तर, बैच, समाप्ति तिथियां और खरीद जानकारी ट्रैक करें</li>
          <li>भूमिका-आधारित पहुंच (Owner, Manager, Helper) के माध्यम से टीम के सदस्यों के साथ सहयोग करें</li>
          <li>सभी इन्वेंट्री परिवर्तनों के ऑडिट ट्रेल्स देखें</li>
          <li>खरीद सूचियाँ प्रबंधित करें और स्टॉक-स्तरीय अलर्ट प्राप्त करें</li>
        </ul>
      </div>
    </details>

    <details id="s2">
      <summary><h2>2. खाता पंजीकरण</h2></summary>
      <div class="section-content">
        <p>सेवा का उपयोग करने के लिए, आपको सटीक और संपूर्ण जानकारी प्रदान करके एक खाता बनाना होगा। आप इसके लिए ज़िम्मेदार हैं:</p>
        <ul>
          <li>अपने खाते के क्रेडेंशियल्स की गोपनीयता बनाए रखना</li>
          <li>आपके खाते के अंतर्गत होने वाली सभी गतिविधियाँ</li>
          <li>आपके खाते के किसी भी अनधिकृत उपयोग के बारे में हमें तुरंत सूचित करना</li>
        </ul>
        <p>खाता बनाने और सेवा का उपयोग करने के लिए आपकी आयु कम से कम 13 वर्ष होनी चाहिए।</p>
      </div>
    </details>

    <details id="s3">
      <summary><h2>3. उपयोगकर्ता भूमिकाएँ और जिम्मेदारियाँ</h2></summary>
      <div class="section-content">
        <p>Samaan-Bol भूमिका-आधारित अभिगम नियंत्रण प्रणाली का उपयोग करता है:</p>
        <ul>
          <li><strong>Owner:</strong> दुकानें बनाता और प्रबंधित करता है, टीम के सदस्यों को आमंत्रित करता है, सभी दुकान डेटा और सेटिंग्स तक पूर्ण पहुंच रखता है, और दुकान को हटा सकता है</li>
          <li><strong>Manager:</strong> इन्वेंट्री प्रबंधित कर सकते हैं, रिपोर्ट देख सकते हैं और दुकान के भीतर अधिकांश संचालन कर सकते हैं</li>
          <li><strong>Helper:</strong> निर्देशानुसार स्टॉक आइटम जोड़ और हटा सकते हैं</li>
        </ul>
        <p>एक Owner के रूप में, आप अपनी दुकान और उसके अंदर मौजूद डेटा तक पहुंच के प्रबंधन के लिए ज़िम्मेदार हैं। जब आप सदस्यों को आमंत्रित करते हैं, तो वे आपकी दुकान के इन्वेंट्री डेटा तक पहुंच प्राप्त करते हैं।</p>
      </div>
    </details>

    <details id="s4">
      <summary><h2>4. वॉयस इनपुट</h2></summary>
      <div class="section-content">
        <p>सेवा तृतीय-पक्ष AI सेवाओं का उपयोग करके ध्वनि आदेशों को संसाधित करती है। कृपया ध्यान रखें कि:</p>
        <ul>
          <li>वॉयस रिकॉर्डिंग प्रति कमांड अधिकतम 30 सेकंड तक सीमित है</li>
          <li>यह सेवा अंग्रेजी, हिंदी, तमिल, तेलुगु, बंगाली, मराठी, कन्नड़, गुजराती, मलयालम और हिंग्लिश सहित कई भाषाओं का समर्थन करती है।</li>
          <li>ध्वनि पहचान सटीकता ऑडियो गुणवत्ता, पृष्ठभूमि शोर, उच्चारण और भाषा स्पष्टता पर निर्भर करती है</li>
          <li>सटीकता की पुष्टि के लिए आपको ध्वनि-संसाधित इन्वेंट्री परिवर्तनों की समीक्षा करनी चाहिए</li>
          <li>वॉयस ऑडियो वास्तविक समय में संसाधित होता है और स्थायी रूप से संग्रहीत नहीं होता है (हमारा देखें)। <a href="/privacy-policy">गोपनीयता नीति</a> विवरण के लिए)</li>
        </ul>
      </div>
    </details>

    <details id="s5">
      <summary><h2>5. स्वीकार्य उपयोग</h2></summary>
      <div class="section-content">
        <p>आप इससे सहमत नहीं हैं:</p>
        <ul>
          <li>किसी भी गैरकानूनी उद्देश्य के लिए सेवा का उपयोग करें</li>
          <li>अन्य उपयोगकर्ताओं के खातों या दुकानों तक अनधिकृत पहुंच प्राप्त करने का प्रयास</li>
          <li>सेवा या उसके बुनियादी ढांचे में हस्तक्षेप या बाधा डालना</li>
          <li>एप्लिकेशन को रिवर्स-इंजीनियर करना, डिकंपाइल करना या अलग करना</li>
          <li>सामान्य उपयोग पैटर्न से परे सेवा तक पहुंचने के लिए स्वचालित टूल का उपयोग करें</li>
          <li>आमंत्रण कोड सार्वजनिक रूप से या ऐसे व्यक्तियों के साथ साझा करें जो आपकी दुकान में शामिल होने का इरादा नहीं रखते हैं</li>
          <li>किसी दुकान के भीतर अपनी पहचान या भूमिका को गलत तरीके से प्रस्तुत करना</li>
        </ul>
      </div>
    </details>

    <details id="s6">
      <summary><h2>6. आपका डेटा</h2></summary>
      <div class="section-content">
        <p>आप सेवा में दर्ज किए गए व्यावसायिक डेटा (उत्पाद जानकारी, इन्वेंट्री रिकॉर्ड, आदि) का स्वामित्व बरकरार रखते हैं। हम आपकी सामग्री के स्वामित्व का दावा नहीं करते हैं.</p>
        <p>सेवा का उपयोग करके, आप हमें केवल सेवा प्रदान करने और सुधारने के उद्देश्य से अपना डेटा संग्रहीत करने, संसाधित करने और संचारित करने के लिए एक सीमित लाइसेंस प्रदान करते हैं।</p>
        <p>हम आपका डेटा कैसे एकत्र करते हैं, उसका उपयोग करते हैं और उसकी सुरक्षा कैसे करते हैं, इसके विवरण के लिए कृपया हमारी समीक्षा करें <a href="/privacy-policy">गोपनीयता नीति</a>.</p>
      </div>
    </details>

    <details id="s7">
      <summary><h2>7. सेवा उपलब्धता</h2></summary>
      <div class="section-content">
        <p>हम सेवा को हर समय उपलब्ध रखने का प्रयास करते हैं, लेकिन हम निर्बाध पहुंच की गारंटी नहीं देते हैं। निम्न कारणों से सेवा अस्थायी रूप से अनुपलब्ध हो सकती है:</p>
        <ul>
          <li>नियोजित रखरखाव या अद्यतन</li>
          <li>तकनीकी मुद्दे हमारे नियंत्रण से बाहर हैं</li>
          <li>तृतीय-पक्ष सेवा रुकावटें (प्रमाणीकरण, ध्वनि प्रसंस्करण, डेटाबेस होस्टिंग)</li>
        </ul>
        <p>हम सेवा डाउनटाइम के परिणामस्वरूप होने वाले किसी भी नुकसान के लिए उत्तरदायी नहीं हैं।</p>
      </div>
    </details>

    <details id="s8">
      <summary><h2>8. दर सीमा</h2></summary>
      <div class="section-content">
        <p>उचित उपयोग और सेवा स्थिरता सुनिश्चित करने के लिए, सेवा API अनुरोधों पर दर सीमा लागू करती है। इन सीमाओं से अधिक होने पर आपके अनुरोधों को अस्थायी रूप से रोका जा सकता है।</p>
      </div>
    </details>

    <details id="s9">
      <summary><h2>9. खाता समाप्ति</h2></summary>
      <div class="section-content">
        <p>आप किसी भी समय अपना खाता हटा सकते हैं <strong>Settings > Delete Account</strong> ऐप में. खाता हटाना स्थायी और अपरिवर्तनीय है - आपकी सभी दुकानें, इन्वेंट्री डेटा, ऑडिट लॉग और प्राथमिकताएं स्थायी रूप से हटा दी जाएंगी।</p>
        <p>हम इन शर्तों का उल्लंघन करने वाले या अपमानजनक व्यवहार करने वाले खातों को निलंबित या समाप्त करने का अधिकार सुरक्षित रखते हैं।</p>
      </div>
    </details>

    <details id="s10">
      <summary><h2>10. बौद्धिक संपदा</h2></summary>
      <div class="section-content">
        <p>Samaan-Bol एप्लिकेशन, इसके डिज़ाइन, कोड, ब्रांडिंग और दस्तावेज़ीकरण सहित, हमारी बौद्धिक संपदा है। आप हमारी लिखित अनुमति के बिना एप्लिकेशन के आधार पर व्युत्पन्न कार्यों की प्रतिलिपि, संशोधन, वितरण या निर्माण नहीं कर सकते हैं।</p>
      </div>
    </details>

    <details id="s11">
      <summary><h2>11. वारंटी का अस्वीकरण</h2></summary>
      <div class="section-content">
        <p>सेवा किसी भी प्रकार की वारंटी के बिना, चाहे व्यक्त हो या निहित, "जैसी है" और "जैसी उपलब्ध है" प्रदान की जाती है। हम विशेष रूप से इनकी वारंटी अस्वीकार करते हैं:</p>
        <ul>
          <li>किसी विशेष उद्देश्य के लिए व्यापारिकता या उपयुक्तता</li>
          <li>आवाज पहचान या एआई-जनित सुझावों की सटीकता</li>
          <li>निर्बाध या त्रुटि रहित संचालन</li>
        </ul>
        <p>आवाज-आधारित इन्वेंट्री क्रियाएं सहायक हैं - आपको महत्वपूर्ण स्टॉक निर्णयों को स्वतंत्र रूप से सत्यापित करना चाहिए।</p>
      </div>
    </details>

    <details id="s12">
      <summary><h2>12. दायित्व की सीमा</h2></summary>
      <div class="section-content">
        <p>कानून द्वारा अनुमत अधिकतम सीमा तक, हम सेवा के आपके उपयोग से उत्पन्न किसी भी अप्रत्यक्ष, आकस्मिक, विशेष, परिणामी या दंडात्मक क्षति के लिए उत्तरदायी नहीं होंगे, जिसमें निम्नलिखित शामिल हैं, लेकिन इन्हीं तक सीमित नहीं हैं।</p>
        <ul>
          <li>ध्वनि पहचान त्रुटियों के कारण होने वाली इन्वेंटरी विसंगतियाँ</li>
          <li>सेवा डाउनटाइम के कारण व्यावसायिक हानि</li>
          <li>हमारी मानक बैकअप प्रक्रियाओं द्वारा कवर की गई सीमा से अधिक डेटा हानि</li>
        </ul>
      </div>
    </details>

    <details id="s13">
      <summary><h2>13. इन शर्तों में परिवर्तन</h2></summary>
      <div class="section-content">
        <p>हम समय-समय पर इन शर्तों को अपडेट कर सकते हैं। जब हम ऐसा करेंगे, तो हम इस पृष्ठ के शीर्ष पर "प्रभावी तिथि" को अपडेट कर देंगे। परिवर्तनों के बाद सेवा का निरंतर उपयोग अद्यतन शर्तों की स्वीकृति माना जाता है।</p>
      </div>
    </details>

    <details id="s14">
      <summary><h2>14. शासी कानून</h2></summary>
      <div class="section-content">
        <p>ये शर्तें भारत के कानूनों के अनुसार शासित और समझी जाएंगी। इन शर्तों या सेवा से उत्पन्न कोई भी विवाद भारत में अदालतों के विशेष क्षेत्राधिकार के अधीन होगा।</p>
      </div>
    </details>

    <details id="s15">
      <summary><h2>15. हमसे संपर्क करें</h2></summary>
      <div class="section-content">
        <p>यदि इन शर्तों के बारे में आपके कोई प्रश्न हैं, तो कृपया हमसे यहां संपर्क करें:</p>
        <p><strong>Email:</strong> <a href="mailto:meetslimshady07@gmail.com">meetslimshady07@gmail.com</a></p>
      </div>
    </details>

    <p class="copyright">© 2026 Samaan-Bol. सर्वाधिकार सुरक्षित।</p>
  </div>

  <button class="back-to-top" id="backToTop" aria-label="Back to top">↑</button>`,
  },
  "bn": {
    home: `<!-- Three.js background canvas -->
<canvas id="bgCanvas"></canvas>

<!-- Aurora ambient background (WebGL fallback) -->
<div class="aurora-bg"><div class="aurora-orb"></div></div>

<!-- Scroll progress indicator -->
<div class="scroll-progress" id="scrollProgress"></div>

<!-- ═══ NAVIGATION ═══ -->
<nav id="nav">
  <div class="container">
    <div class="nav-inner">
      <a href="#" class="logo">
        <div class="logo-mark"><svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><defs><mask id="stencil-nav"><rect x="0" y="0" width="100" height="100" fill="white"/><rect x="24" y="18" width="52" height="8" rx="4" fill="black"/><rect x="38" y="18" width="24" height="36" rx="12" fill="black"/><path d="M 28 42 A 22 22 0 0 0 72 42" fill="none" stroke="black" stroke-width="8" stroke-linecap="round"/><rect x="46" y="72" width="8" height="10" rx="4" fill="black"/><rect x="36" y="32" width="28" height="4" fill="white"/><rect x="36" y="44" width="28" height="4" fill="white"/></mask></defs><circle cx="50" cy="50" r="50" fill="#ea580c" mask="url(#stencil-nav)"/></svg></div>
        <div class="logo-text">সামান<span>বোল</span></div>
      </a>
      <ul class="nav-links">
        <li><a href="#how">কিভাবে এটা কাজ করে</a></li>
        <li><a href="#features">বৈশিষ্ট্য</a></li>
        <li><a href="#ai">এআই ইন্টেলিজেন্স</a></li>
        <li><a href="#languages">ভাষা</a></li>
        <li><a href="https://apps.apple.com/in/app/samaan-bol/id6759739444" class="nav-cta">অ্যাপ ডাউনলোড করুন</a></li>
      </ul>
      <button class="mobile-menu-btn" aria-label="Menu">☰</button>
    </div>
  </div>
</nav>

<!-- ═══ HERO ═══ -->
<section class="hero">
  <div class="container">
    <div class="hero-grid">
      <div>
        <div class="hero-eyebrow">ভারতীয় খুচরা জন্য ভয়েস-প্রথম জায়</div>
        <h1 class="hero-text-reveal">
          <span class="hindi-line hindi">बोल के सँभालो अपना बिज़नेस</span>
          <span class="hero-text-main">আপনার দোকান পরিচালনা করুন<br>শুধু তোমার ভয়েস দিয়ে</span>
        </h1>
        <p class="hero-sub">
          কথা বলুন <span class="hero-rotate"><span class="hero-rotate-word active">হিন্দি</span><span class="hero-rotate-word">বাংলা</span><span class="hero-rotate-word">তামিল</span><span class="hero-rotate-word">তেলেগু</span><span class="hero-rotate-word">মারাঠি</span><span class="hero-rotate-word">ইংরেজি</span></span>, অথবা 10টি ভারতীয় ভাষার যেকোনো একটি।
          Samaan-Bol এর AI আপনার কমান্ড বোঝে, আপনার ইনভেন্টরি আপডেট করে,
          এবং আপনার ব্যবসা চলমান রাখে — হ্যান্ডস-ফ্রি।
        </p>
        <div class="hero-actions">
          <a href="#download" class="btn-primary">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            বিনামূল্যে ডাউনলোড করুন
          </a>
          <a href="#how" class="btn-secondary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            ইট ইন অ্যাকশন দেখুন
          </a>
        </div>
        <div class="hero-stats">
          <div class="hero-stat">
            <div class="hero-stat-number">11</div>
            <div class="hero-stat-label">ভাষা সমর্থিত</div>
          </div>
          <div class="hero-stat">
            <div class="hero-stat-number">50K+</div>
            <div class="hero-stat-label">আইটেম প্রতিদিন ট্র্যাক</div>
          </div>
          <div class="hero-stat">
            <div class="hero-stat-number">2 মিনিট</div>
            <div class="hero-stat-label">সেটআপ সময়</div>
          </div>
        </div>
      </div>

      <div class="hero-visual">
        <!-- Floating cards (z-index 10 — in FRONT of phone) -->
        <div class="float-card float-card--voice">
          <div class="float-card-icon float-card-icon--voice"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg></div>
          <p><strong class="hindi">"चावल 5 किलो जोड़ दो"</strong></p>
          <p style="margin-top:6px; font-size:12px; color:var(--success);">✓ Basmati Rice — 18 → 23 কেজি</p>
        </div>

        <div class="float-card float-card--alert">
          <div class="float-card-icon float-card-icon--alert"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg></div>
          <p><strong>নিম্ন স্টক সতর্কতা</strong></p>
          <p style="margin-top:4px; font-size:12px;">আটা 3 দিনের মধ্যে ফুরিয়ে যেতে পারে</p>
        </div>

        <!-- Phone mockup — mirrors actual app UI -->
        <div class="phone-frame">
          <div class="phone-notch"></div>
          <div class="phone-screen">
            <div class="phone-status-bar">
              <span>9:41</span>
              <span style="display:flex; gap:4px; align-items:center;">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z"/></svg>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><rect x="17" y="4" width="4" height="16" rx="1"/><rect x="11" y="8" width="4" height="12" rx="1"/><rect x="5" y="12" width="4" height="8" rx="1"/></svg>
                <svg width="14" height="12" viewBox="0 0 28 14" fill="currentColor"><rect x="0" y="1" width="22" height="12" rx="2" stroke="currentColor" fill="none" stroke-width="1.5"/><rect x="24" y="4.5" width="3" height="5" rx="1"/><rect x="2" y="3" width="14" height="8" rx="1"/></svg>
              </span>
            </div>

            <!-- Header: greeting + bell -->
            <div class="phone-header">
              <div>
                <div class="phone-greeting">শুভ সকাল! 👋</div>
                <div class="phone-subtext">Priya General Store</div>
              </div>
              <div class="phone-bell">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B6B70" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                <div class="phone-bell-badge">3</div>
              </div>
            </div>

            <!-- Search bar with mic icon -->
            <div class="phone-search">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4A4A50" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <span class="phone-search-text">পণ্য অনুসন্ধান করুন...</span>
              <div class="phone-search-mic">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0D0D12" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/></svg>
              </div>
            </div>

            <!-- 2x2 Stats grid -->
            <div class="phone-stats-grid">
              <div class="phone-stat-card phone-stat-card--total">
                <div class="phone-stat-number">142</div>
                <div class="phone-stat-label">মোট আইটেম</div>
              </div>
              <div class="phone-stat-card phone-stat-card--low">
                <div class="phone-stat-number" style="color:var(--warning);">8</div>
                <div class="phone-stat-label">কম স্টক</div>
              </div>
              <div class="phone-stat-card phone-stat-card--out">
                <div class="phone-stat-number" style="color:var(--danger);">2</div>
                <div class="phone-stat-label">স্টক আউট</div>
              </div>
              <div class="phone-stat-card phone-stat-card--activity">
                <div class="phone-stat-number" style="color:var(--success);">23</div>
                <div class="phone-stat-label">আজ আপডেট করা হয়েছে</div>
              </div>
            </div>

            <!-- Filter chips -->
            <div class="phone-filter-row">
              <span class="phone-chip phone-chip--active">সব</span>
              <span class="phone-chip">কম স্টক</span>
              <span class="phone-chip">আউট</span>
              <span class="phone-chip">মেয়াদ শেষ</span>
            </div>

            <!-- Product cards -->
            <div class="phone-product">
              <div class="phone-product-icon" style="background:rgba(255,181,71,0.12);">🍚</div>
              <div class="phone-product-info">
                <div class="phone-product-name">Basmati Rice</div>
                <div class="phone-product-meta">শস্য · 2মি আগে আপডেট করা হয়েছে</div>
              </div>
              <div class="phone-product-qty">
                <div class="phone-product-qty-num">23</div>
                <div class="phone-product-qty-unit">কেজি</div>
              </div>
            </div>

            <div class="phone-product">
              <div class="phone-product-icon" style="background:rgba(255,107,0,0.12);">🫒</div>
              <div class="phone-product-info">
                <div class="phone-product-name">Aashirvaad Atta</div>
                <div class="phone-product-meta">ময়দা · 1 ঘন্টা আগে আপডেট করা হয়েছে</div>
                <div class="phone-product-status phone-product-status--low">কম স্টক</div>
              </div>
              <div class="phone-product-qty">
                <div class="phone-product-qty-num" style="color:var(--warning);">3</div>
                <div class="phone-product-qty-unit">কেজি</div>
              </div>
            </div>

            <div class="phone-product">
              <div class="phone-product-icon" style="background:rgba(50,213,131,0.1);">🥛</div>
              <div class="phone-product-info">
                <div class="phone-product-name">Amul Toned Milk</div>
                <div class="phone-product-meta">ডেইরি · 3 ঘন্টা আগে আপডেট করা হয়েছে৷</div>
              </div>
              <div class="phone-product-qty">
                <div class="phone-product-qty-num">40</div>
                <div class="phone-product-qty-unit">pkt</div>
              </div>
            </div>

          </div>
          <!-- Floating mic FAB (like the real app) -->
          <div class="phone-fab">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0D0D12" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/></svg>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ═══ HOW IT WORKS ═══ -->
<section class="how-it-works" id="how">
  <div class="container">
    <div class="reveal">
      <div class="section-label">কিভাবে এটা কাজ করে</div>
      <h2 class="section-heading">তিন ধাপ। কোন প্রশিক্ষণের প্রয়োজন নেই।</h2>
      <p class="section-sub">শুধু আপনার ভাষায় স্বাভাবিকভাবে কথা বলুন — এআই বাকিটা পরিচালনা করে।</p>
    </div>
    <div class="steps-grid">
      <div class="step reveal reveal-delay-1">
        <div class="step-number">01</div>
        <h3>আপনার আদেশের কথা বলুন</h3>
        <p>মাইকে আলতো চাপুন এবং আপনার যা প্রয়োজন তা বলুন — স্টক যোগ করুন, পরিমাণ পরীক্ষা করুন, একটি ক্রয়ের তালিকা তৈরি করুন। যে কোন ভারতীয় ভাষায়।</p>
        <div class="step-example">
          <div class="hindi">"चावल 5 किलो जोड़ दो"</div>
          <div class="english">5 কেজি চাল যোগ করুন</div>
        </div>
      </div>
      <div class="step reveal reveal-delay-2">
        <div class="step-number">02</div>
        <h3>এআই তাত্ক্ষণিকভাবে বুঝতে পারে</h3>
        <p>Sarvam AI আপনার বক্তৃতা প্রক্রিয়া করে, পণ্য, পরিমাণ এবং ক্রিয়া বের করে — তারপর এটিকে আপনার তালিকার সাথে মেলে।</p>
        <div class="step-example">
          <div style="display:flex; gap:12px; flex-wrap:wrap;">
            <span style="background:var(--saffron-tint); color:var(--saffron); padding:4px 10px; border-radius:4px; font-size:12px;">চাল → বাসমতি 🍚</span>
            <span style="background:rgba(50,213,131,0.1); color:var(--success); padding:4px 10px; border-radius:4px; font-size:12px;">+5 কেজি</span>
            <span style="background:rgba(99,102,241,0.1); color:#818CF8; padding:4px 10px; border-radius:4px; font-size:12px;">✓ যোগ করুন</span>
          </div>
        </div>
      </div>
      <div class="step reveal reveal-delay-3">
        <div class="step-number">03</div>
        <h3>ইনভেন্টরি আপডেট করা হয়েছে, নিশ্চিত করা হয়েছে</h3>
        <p>আপনার স্টক অবিলম্বে আপডেট করা হয়. আপনি আপনার ভাষায় একটি ভয়েস নিশ্চিতকরণ শুনতে পাচ্ছেন — কোনো স্ক্রীনের প্রয়োজন নেই।</p>
        <div class="step-example">
          <div class="hindi">"हो गया — बासमती चावल अब 23 किलो है"</div>
          <div class="english">সম্পন্ন—বাসমতি চাল এখন 23 কেজি</div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ═══ FEATURES ═══ -->
<section class="features" id="features" style="position:relative; overflow:hidden;">
  <div class="orb orb--saffron" style="top: -100px; right: -150px;"></div>
  <div class="container">
    <div class="reveal">
      <div class="section-label">বৈশিষ্ট্য</div>
      <h2 class="section-heading">আপনার দোকানের প্রয়োজনীয় সবকিছু। কিছুই এটা করে না.</h2>
    </div>
    <div class="features-grid">
      <div class="feature feature--hero reveal reveal-delay-1">
        <div class="feature-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg></div>
        <h3>ভয়েস-প্রথম ইনভেন্টরি</h3>
        <p>স্বাভাবিকভাবে কথা বলে স্টক যোগ করুন, সরান বা চেক করুন। কোন টাইপিং, কোন মেনু মাধ্যমে অনুসন্ধান. শুধু আপনার ভাষায় কথা বলুন এবং AI বাকিটা পরিচালনা করে — আপনার কমান্ড বোঝা থেকে শুরু করে রিয়েল টাইমে আপনার স্টক আপডেট করা পর্যন্ত।</p>
      </div>
      <div class="feature reveal reveal-delay-2">
        <div class="feature-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg></div>
        <h3>10টি ভারতীয় ভাষা + ইংরেজি</h3>
        <p>হিন্দি, বাংলা, তামিল, তেলেগু, মারাঠি, কন্নড়, গুজরাটি, মালায়লাম, পাঞ্জাবি এবং ওড়িয়া — Sarvam AI দ্বারা চালিত।</p>
      </div>
      <div class="feature reveal reveal-delay-3">
        <div class="feature-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></div>
        <h3>দলের ভূমিকা</h3>
        <p>Owner, Manager, এবং Helper দানাদার অনুমতি সহ ভূমিকা। সবাই একই পৃষ্ঠায়, নিরাপদে।</p>
      </div>
      <div class="feature reveal reveal-delay-1">
        <div class="feature-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/><path d="M9 14l2 2 4-4"/></svg></div>
        <h3>স্মার্ট কেনার তালিকা</h3>
        <p>যা কম চলছে তার উপর ভিত্তি করে স্বয়ংক্রিয়ভাবে তৈরি পুনঃস্টকিং তালিকা। হোয়াটসঅ্যাপের মাধ্যমে সরবরাহকারীদের শেয়ার করুন।</p>
      </div>
      <div class="feature reveal reveal-delay-2">
        <div class="feature-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></svg></div>
        <h3>কার্যকলাপ নিরীক্ষণ লগ</h3>
        <p>প্রতিটি পরিবর্তন কে, কি এবং কখন ট্র্যাক করে। আপনার দল জুড়ে সম্পূর্ণ স্বচ্ছতা।</p>
      </div>
      <div class="feature reveal reveal-delay-3">
        <div class="feature-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><line x1="7" y1="12" x2="17" y2="12"/><line x1="7" y1="8" x2="17" y2="8"/><line x1="7" y1="16" x2="17" y2="16"/></svg></div>
        <h3>বারকোড স্ক্যানিং</h3>
        <p>পণ্য যোগ করতে বা অবিলম্বে দেখতে স্ক্যান করুন. ভারতীয় এবং আন্তর্জাতিক বারকোডের সাথে কাজ করে।</p>
      </div>
    </div>
  </div>
</section>

<!-- ═══ AI INTELLIGENCE ═══ -->
<section class="ai-section" id="ai" style="overflow:hidden;">
  <div class="orb orb--indigo" style="bottom: -100px; left: -100px;"></div>
  <div class="orb orb--green" style="top: 200px; right: -80px;"></div>
  <div class="container">
    <div class="ai-header reveal">
      <div class="section-label">এআই ইন্টেলিজেন্স</div>
      <h2 class="section-heading">
        <span class="hindi" style="display:block; color:var(--saffron); font-size:clamp(22px,2.8vw,32px); font-weight:500; margin-bottom:8px;">দার এআই যা আপনার বিজনেসকে বোঝায়</span>
        শুধু ট্র্যাকিং নয় - আপনার দোকানের প্রথম ডিজিটাল মস্তিষ্ক
      </h2>
      <p class="section-sub">Samaan-Bol শুধুমাত্র আপনি যা বলবেন তা রেকর্ড করে না। এটি আপনার প্যাটার্ন শিখে, আপনার প্রয়োজনের পূর্বাভাস দেয় এবং সমস্যা হওয়ার আগে আপনাকে সতর্ক করে।</p>
    </div>

    <div class="ai-blocks">
      <!-- Predictive Stock -->
      <div class="ai-block reveal">
        <div class="ai-block-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg></div>
        <div class="ai-block-tag ai-block-tag--predict">ভবিষ্যদ্বাণীমূলক স্টক</div>
        <h3>আপনি করার আগে আপনি কি প্রয়োজন হবে জানেন</h3>
        <p>AI আপনার বিক্রির ধরন শিখে — দৈনিক, সাপ্তাহিক, মৌসুমী। এটি ভবিষ্যদ্বাণী করে যে আইটেমগুলি কখন কম চলবে এবং আগে থেকেই পুনরুদ্ধার করার পরামর্শ দেয়।</p>
        <div class="ai-voice-example">
          <div class="voice-bubble">
            <div class="voice-bubble-avatar voice-bubble-avatar--ai"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg></div>
            <div class="voice-bubble-content">
              <div class="hindi">"আপকা আত্তা 3 দিন মে খাতাম হো সক্ত হ্যায় - হাফতে কি বিক্রি কে হিসাব সে"</div>
              <div class="translation">আপনার আটা 3 দিনের মধ্যে ফুরিয়ে যেতে পারে — সাপ্তাহিক বিক্রয়ের উপর ভিত্তি করে</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Smart Alerts -->
      <div class="ai-block reveal">
        <div class="ai-block-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg></div>
        <div class="ai-block-tag ai-block-tag--alert">স্মার্ট সতর্কতা</div>
        <h3>আপনার ভাষায় কথা বলে সতর্কতা</h3>
        <p>মেয়াদ শেষ হওয়ার সতর্কতা, ধীর গতির স্টক সনাক্তকরণ, এবং মূল্যের ওঠানামার সতর্কতা — আপনার পছন্দের ভাষায় ভয়েস বিজ্ঞপ্তি হিসাবে বিতরণ করা হয়।</p>
        <div class="ai-voice-example">
          <div class="voice-bubble">
            <div class="voice-bubble-avatar voice-bubble-avatar--ai"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg></div>
            <div class="voice-bubble-content">
              <div class="hindi">"Parle-G কে 12 প্যাকেট 5 দিন মে মেয়াদ শেষ হো রহে হ্যায় — ছাড় লাগানা চাহেন?"</div>
              <div class="translation">12 Parle-G প্যাকেটের মেয়াদ 5 দিনের মধ্যে শেষ হচ্ছে — একটি ছাড় যোগ করতে চান?</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Voice Analytics -->
      <div class="ai-block reveal">
        <div class="ai-block-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg></div>
        <div class="ai-block-tag ai-block-tag--insight">ভয়েস বিশ্লেষণ</div>
        <h3>আপনার দোকানকে একটি প্রশ্ন জিজ্ঞাসা করুন - এটি উত্তর দেয়</h3>
        <p>স্বাভাবিক ভাষায় আপনার ব্যবসা সম্পর্কে কিছু জিজ্ঞাসা করুন. AI কথ্য উত্তর এবং অন-স্ক্রীন ডেটা দিয়ে প্রতিক্রিয়া জানায়।</p>
        <div class="ai-voice-example">
          <div class="voice-bubble">
            <div class="voice-bubble-avatar voice-bubble-avatar--user"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>
            <div class="voice-bubble-content">
              <div class="hindi">"পিছলে হাফতে সবসে জিয়াদা কেয়া বিকা?"</div>
              <div class="translation">গত সপ্তাহে কি সবচেয়ে বেশি বিক্রি হয়েছে?</div>
            </div>
          </div>
          <div class="voice-bubble">
            <div class="voice-bubble-avatar voice-bubble-avatar--ai"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg></div>
            <div class="voice-bubble-content">
              <div class="hindi">"পিছলে হাফতে সবসে জিয়াদা চাওয়াল বিকা - 48 কিলো"</div>
              <div class="translation">গত সপ্তাহে সবচেয়ে বেশি চাল বিক্রি হয়েছে- ৪৮ কেজি</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Team Intelligence -->
      <div class="ai-block reveal">
        <div class="ai-block-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>
        <div class="ai-block-tag ai-block-tag--team">টিম ইন্টেলিজেন্স</div>
        <h3>আপনার দল কি করছে তা জানুন</h3>
        <p>এআই-চালিত অসঙ্গতি সনাক্তকরণ অস্বাভাবিক ইনভেন্টরি পরিবর্তনগুলিকে পতাকা দেয়৷ স্মার্ট সারাংশ দেখায় কে কি আপডেট করেছে এবং সংশোধনের প্রয়োজন ছিল কিনা।</p>
        <div class="ai-voice-example">
          <div class="voice-bubble">
            <div class="voice-bubble-avatar voice-bubble-avatar--ai"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg></div>
            <div class="voice-bubble-content">
              <div class="hindi">"আজ শাম 6 বাজে 15 কিলো চিনি কা স্টক কাম হুয়া — যাচাই করবা?"</div>
              <div class="translation">আজ সন্ধ্যা ৬টায় ১৫ কেজি চিনির স্টক কমেছে — যাচাই করতে চান?</div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</section>

<!-- ═══ LANGUAGES ═══ -->
<section class="languages-section" id="languages">
  <div class="container">
    <div class="reveal">
      <div class="section-label">ভারতের জন্য নির্মিত</div>
      <h2 class="section-heading">তোমার ভাষা। আপনার ব্যবসা. তোমার পথ।</h2>
      <p class="section-sub">Samaan-Bol আপনি যেভাবে কথা বলেন সেভাবে কথা বলে — নেটিভ স্ক্রিপ্ট, কথোপকথন পদ এবং আঞ্চলিক পণ্যের নামগুলির সম্পূর্ণ সমর্থন সহ।</p>
    </div>
    <div class="lang-grid reveal">
      <div class="lang-chip lang-chip--featured">হিন্দি <span class="native hindi">हिन्दी</span></div>
      <div class="lang-chip">বাংলা <span class="native">বাংলা</span></div>
      <div class="lang-chip">তামিল <span class="native">தமிழ்</span></div>
      <div class="lang-chip">তেলেগু <span class="native">తెలుగు</span></div>
      <div class="lang-chip">মারাঠি <span class="native">मराठी</span></div>
      <div class="lang-chip">কন্নড় <span class="native">ಕನ್ನಡ</span></div>
      <div class="lang-chip">গুজরাটি <span class="native">ગુજરાતી</span></div>
      <div class="lang-chip">মালায়লাম <span class="native">മലയാളം</span></div>
      <div class="lang-chip">পাঞ্জাবি <span class="native">ਪੰਜਾਬੀ</span></div>
      <div class="lang-chip">ওডিয়া <span class="native">ଓଡ଼ିଆ</span></div>
      <div class="lang-chip">ইংরেজি <span class="native">ইংরেজি</span></div>
    </div>
  </div>
</section>

<!-- ═══ COMPARISON ═══ -->
<section class="comparison">
  <div class="container">
    <div class="reveal">
      <div class="section-label">কেন Samaan-Bol</div>
      <h2 class="section-heading">পার্থক্য হল দিন রাত</h2>
    </div>
    <div class="comparison-grid reveal">
      <div class="comparison-col comparison-col--without">
        <h3>Samaan-Bolছাড়া</h3>
        <p class="comparison-col-subtitle">স্টক পরিচালনার পুরানো উপায়</p>
        <ul class="comparison-list">
          <li><span class="icon">✕</span> ম্যানুয়াল গণনা, কলম এবং কাগজের রেজিস্টার</li>
          <li><span class="icon">✕</span> স্টকআউট আবিষ্কৃত যখন একটি গ্রাহক জিজ্ঞাসা</li>
          <li><span class="icon">✕</span> কতটা পুনর্বিন্যাস করতে হবে তা অনুমান করা হচ্ছে</li>
          <li><span class="icon">✕</span> কোন ধারণা কি মেয়াদ শেষ বা ধীর গতিশীল</li>
          <li><span class="icon">✕</span> কর্মীরা কি করছে তা ট্র্যাক করতে পারছি না</li>
          <li><span class="icon">✕</span> উৎসবের প্রস্তুতি শেষ মুহূর্তের বিশৃঙ্খলা</li>
        </ul>
      </div>
      <div class="comparison-col comparison-col--with">
        <h3>Samaan-Bolসহ</h3>
        <p class="comparison-col-subtitle">এআই-চালিত, ভয়েস-প্রথম, অনায়াস</p>
        <ul class="comparison-list">
          <li><span class="icon">✓</span> ভয়েস আপডেট - এটি বলুন এবং এটি হয়ে গেছে</li>
          <li><span class="icon">✓</span> স্টকআউটের কয়েক দিন আগে পূর্বাভাসমূলক সতর্কতা</li>
          <li><span class="icon">✓</span> আসল ডেটার উপর ভিত্তি করে এআই-উত্পন্ন ক্রয় তালিকা</li>
          <li><span class="icon">✓</span> মেয়াদোত্তীর্ণ এবং ধীর-মুভার সনাক্তকরণ অন্তর্নির্মিত</li>
          <li><span class="icon">✓</span> অসঙ্গতি সনাক্তকরণ সহ সম্পূর্ণ অডিট ট্রেল</li>
          <li><span class="icon">✓</span> উৎসবের পূর্বাভাস 2 সপ্তাহ আগে শুরু হয়</li>
        </ul>
      </div>
    </div>
  </div>
</section>

<!-- ═══ TESTIMONIALS ═══ -->
<section class="testimonials">
  <div class="container">
    <div class="reveal">
      <div class="section-label">প্রারম্ভিক দত্তক</div>
      <h2 class="section-heading">ভারত জুড়ে বিটা পরীক্ষকদের দ্বারা প্রিয়</h2>
    </div>
    <div class="testimonials-grid">
      <div class="testimonial reveal reveal-delay-1">
        <div class="testimonial-stars">★★★★★</div>
        <blockquote>বিটা টেস্টিং মে ট্রাই কিয়া—পেলে দিন সে রেজিস্টার ব্যান্ড। আব বাস বোল দেতি হুন অউর সব আপডেট হো জাতা হ্যায়। ইতনা আসান হোগা সোচা নাহি থা।</blockquote>
        <div class="testimonial-author">মীনা শর্মা</div>
        <div class="testimonial-role">বিটা টেস্টার · কিরানা স্টোর Owner, জয়পুর</div>
      </div>
      <div class="testimonial reveal reveal-delay-2">
        <div class="testimonial-stars">★★★★★</div>
        <blockquote>জানুয়ারী মে বেটা জয়েন কিয়া থা—হোলি কে লিয়ে এআই নে ইতিমধ্যেই বাতায়া কি কেয়া স্টক বাধন হ্যায়। অভি সে ইতনা স্মার্ট হ্যায়, সোচিয়ে লঞ্চ কে বাদ কেয়া হোগা।</blockquote>
        <div class="testimonial-author">অর্জুন প্যাটেল</div>
        <div class="testimonial-role">বিটা টেস্টার · জেনারেল স্টোর, আহমেদাবাদ</div>
      </div>
      <div class="testimonial reveal reveal-delay-3">
        <div class="testimonial-stars">★★★★★</div>
        <blockquote>বাংলা মে বোল্টে হি সমাজ গয়া—বেটা টেস্টিং-ই দেখলাম জে আমার ভাষা তে কাজ কোরে। স্টাফ রা ও খুব সহজে ব্যবহার করতে পারছে।</blockquote>
        <div class="testimonial-author">রিনা দাস</div>
        <div class="testimonial-role">বিটা টেস্টার · টেক্সটাইল শপ, কলকাতা</div>
      </div>
    </div>
  </div>
</section>

<!-- ═══ CTA ═══ -->
<section class="cta-section" id="download">
  <div class="container">
    <div class="reveal">
      <div class="section-label">বিনামূল্যে শুরু করুন</div>
      <h2 class="section-heading">
        <span class="hindi" style="display:block; color:var(--saffron); font-size:clamp(20px,2.4vw,28px); font-weight:500; margin-bottom:8px;">आज ही शुरू करें</span>
        আপনার দোকান একটি নোটবুক চেয়ে ভাল প্রাপ্য
      </h2>
      <p class="section-sub">শুরু করতে বিনামূল্যে. 2 মিনিটের মধ্যে সেট আপ করুন। কোনো ক্রেডিট কার্ডের প্রয়োজন নেই।</p>
      <div class="cta-actions">
        <a href="https://apps.apple.com/in/app/samaan-bol/id6759739444" class="store-badge">
          <div class="store-badge-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg></div>
          <div class="store-badge-text">
            <div class="store-badge-label">এ ডাউনলোড করুন</div>
            <div class="store-badge-name">App Store</div>
          </div>
        </a>
        <a href="#" class="store-badge" style="position:relative; opacity:0.65; pointer-events:none;">
          <div class="store-badge-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.807 1.626a1 1 0 0 1 0 1.73l-2.808 1.626L15.206 12l2.492-2.491zM5.864 2.658L16.8 8.99l-2.3 2.3-8.636-8.632z"/></svg></div>
          <div class="store-badge-text">
            <div class="store-badge-label">এটা পেতে</div>
            <div class="store-badge-name">Google Play</div>
          </div>
          <span style="position:absolute; top:-10px; right:-10px; background:var(--saffron); color:#fff; font-size:11px; font-weight:700; padding:3px 10px; border-radius:20px; letter-spacing:0.5px; text-transform:uppercase;">শীঘ্রই আসছে</span>
        </a>
      </div>
    </div>
  </div>
</section>

<!-- ═══ FOOTER ═══ -->
<footer>
  <div class="container">
    <div class="footer-grid">
      <div class="footer-brand">
        <a href="#" class="logo">
          <div class="logo-mark"><svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><defs><mask id="stencil-footer"><rect x="0" y="0" width="100" height="100" fill="white"/><rect x="24" y="18" width="52" height="8" rx="4" fill="black"/><rect x="38" y="18" width="24" height="36" rx="12" fill="black"/><path d="M 28 42 A 22 22 0 0 0 72 42" fill="none" stroke="black" stroke-width="8" stroke-linecap="round"/><rect x="46" y="72" width="8" height="10" rx="4" fill="black"/><rect x="36" y="32" width="28" height="4" fill="white"/><rect x="36" y="44" width="28" height="4" fill="white"/></mask></defs><circle cx="50" cy="50" r="50" fill="#ea580c" mask="url(#stencil-footer)"/></svg></div>
          <div class="logo-text">সামান<span>বোল</span></div>
        </a>
        <p>ভয়েস-প্রথম AI ইনভেন্টরি ম্যানেজমেন্ট, ভারতীয় খুচরা বিক্রেতার জন্য তৈরি।</p>
      </div>
      <div class="footer-col">
        <h4>পণ্য</h4>
        <ul>
          <li><a href="#features">বৈশিষ্ট্য</a></li>
          <li><a href="#ai">এআই ইন্টেলিজেন্স</a></li>
          <li><a href="#languages">ভাষা</a></li>
          <li><a href="#">মূল্য নির্ধারণ</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>কোম্পানি</h4>
        <ul>
          <li><a href="#">সম্পর্কে</a></li>
          <li><a href="#">ব্লগ</a></li>
          <li><a href="#">কেরিয়ার</a></li>
          <li><a href="#">যোগাযোগ</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>সমর্থন</h4>
        <ul>
          <li><a href="#">সহায়তা কেন্দ্র</a></li>
          <li><a href="/privacy-policy">গোপনীয়তা নীতি</a></li>
          <li><a href="/terms-of-service">পরিষেবার শর্তাবলী</a></li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <span>© 2026 Samaan-Bol। সর্বস্বত্ব সংরক্ষিত</span>
      <span class="made-in-india">ভারতে ♥ দিয়ে তৈরি 🇮🇳</span>
    </div>
  </div>
</footer>`,
    privacy: `<div class="reading-progress" id="readingProgress"></div>

  <div class="container">
    <a href="/" class="back">← বাড়িতে ফিরে যান</a>
    <h1>গোপনীয়তা নীতি</h1>
    <p class="effective">কার্যকরী তারিখ: ফেব্রুয়ারি 23, 2026</p>

    <nav class="toc">
      <h3>বিষয়বস্তু</h3>
      <ol>
        <li><a href="#s1">তথ্য আমরা সংগ্রহ করি</a></li>
        <li><a href="#s2">আমরা কিভাবে আপনার তথ্য ব্যবহার করি</a></li>
        <li><a href="#s3">তৃতীয় পক্ষের পরিষেবা</a></li>
        <li><a href="#s4">ডেটা স্টোরেজ এবং নিরাপত্তা</a></li>
        <li><a href="#s5">ডেটা ধারণ</a></li>
        <li><a href="#s6">অ্যাকাউন্ট মুছে ফেলা</a></li>
        <li><a href="#s7">দোকানের মধ্যে ডেটা শেয়ারিং</a></li>
        <li><a href="#s8">শিশুদের গোপনীয়তা</a></li>
        <li><a href="#s9">আপনার অধিকার</a></li>
        <li><a href="#s10">এই নীতি পরিবর্তন</a></li>
        <li><a href="#s11">আমাদের সাথে যোগাযোগ করুন</a></li>
      </ol>
    </nav>

    <p>Samaan-Bol ("আমরা", "আমাদের", বা "অ্যাপ") ভারতীয় খুচরা ব্যবসার জন্য ডিজাইন করা একটি ভয়েস-প্রথম সহযোগী ইনভেন্টরি ম্যানেজমেন্ট অ্যাপ্লিকেশন। এই গোপনীয়তা নীতি ব্যাখ্যা করে যে আমরা কোন তথ্য সংগ্রহ করি, কিভাবে আমরা এটি ব্যবহার করি, কার সাথে আমরা এটি শেয়ার করি এবং আপনার ডেটা সম্পর্কিত আপনার অধিকার।</p>

    <p>Samaan-Bol ব্যবহার করে, আপনি এই নীতিতে বর্ণিত তথ্য সংগ্রহ ও ব্যবহারে সম্মত হন।</p>

    <details open id="s1">
      <summary><h2>1. তথ্য আমরা সংগ্রহ করি</h2></summary>
      <div class="section-content">
        <h3>1.1 অ্যাকাউন্ট তথ্য</h3>
        <p>আপনি যখন একটি অ্যাকাউন্ট তৈরি করেন, আমরা সংগ্রহ করি:</p>
        <ul>
          <li><strong>পুরো নাম</strong> - সাইন আপ করার সময় প্রদান করা হয়</li>
          <li><strong>Email ঠিকানা</strong> — প্রমাণীকরণ এবং অ্যাকাউন্ট পুনরুদ্ধারের জন্য ব্যবহৃত হয়</li>
          <li><strong>পাসওয়ার্ড</strong> — এনক্রিপ্ট করা এবং আমাদের প্রমাণীকরণ প্রদানকারী দ্বারা পরিচালিত (Clerk)</li>
        </ul>
        <p>আপনি Google বা Apple দিয়ে সাইন ইন করলে, আমরা OAuth প্রদানকারীর কাছ থেকে আপনার নাম এবং ইমেল পাব। আমরা আপনার Google বা Apple অ্যাকাউন্ট পাসওয়ার্ড অ্যাক্সেস করি না।</p>

        <h3>1.2 ভয়েস রেকর্ডিং</h3>
        <div class="highlight">
          <p><strong>গুরুত্বপূর্ণ:</strong> ভয়েস রেকর্ডিং রিয়েল-টাইমে প্রক্রিয়া করা হয় এবং হয় <strong>স্থায়ীভাবে সংরক্ষণ করা হয় না</strong>. অডিও আমাদের সার্ভারে প্রেরণ করা হয়, ভাষী স্বীকৃতি এবং প্রাকৃতিক ভাষা বোঝার জন্যSarvam AIদ্বারা প্রক্রিয়া করা হয় এবং প্রক্রিয়াকরণের পরে অবিলম্বে বাতিল করা হয়। আপনার রেফারেন্সের জন্য শুধুমাত্র ফলাফলের টেক্সট ট্রান্সক্রিপ্ট আপনার অডিট লগে সংরক্ষণ করা হয়।</p>
        </div>
        <ul>
          <li>আপনার ডিভাইসে অডিও রেকর্ড করা হয়েছে ( WAV ফরম্যাট iOS, M4A Android এ)</li>
          <li>রেকর্ডিং সর্বোচ্চ 30 সেকেন্ডের মধ্যে সীমাবদ্ধ</li>
          <li>একটি সুরক্ষিত সংযোগের মাধ্যমে এনকোড করা ডেটা হিসাবে অডিও আমাদের সার্ভারে পাঠানো হয়</li>
          <li>প্রক্রিয়াকরণের পরে, অডিও ডেটা সার্ভার মেমরি থেকে বাতিল করা হয়</li>
          <li>টেক্সট ট্রান্সক্রিপ্টগুলি আপনার দোকানের অডিট লগে সংরক্ষণ করা হয় যাতে আপনি অতীতের কাজগুলি পর্যালোচনা করতে পারেন</li>
        </ul>

        <h3>1.3 ইনভেন্টরি এবং ব্যবসা ডেটা</h3>
        <p>আপনি যখন অ্যাপটি ব্যবহার করেন, তখন আমরা আপনার তৈরি করা ব্যবসায়িক ডেটা সংরক্ষণ করি:</p>
        <ul>
          <li>দোকানের তথ্য (নাম, বিভাগ, পছন্দের ভাষা)</li>
          <li>পণ্য ক্যাটালগ (নাম, বারকোড, বিভাগ, ইউনিট, দাম)</li>
          <li>স্টকের পরিমাণ, ব্যাচ নম্বর, ক্রয়ের তারিখ, মেয়াদ শেষ হওয়ার তারিখ, সরবরাহকারীর নাম</li>
          <li>তালিকা আইটেম এবং নোট কিনুন</li>
          <li>অডিট লগ রেকর্ডিং ইনভেন্টরি পরিবর্তন (অ্যাকশন টাইপ, ব্যবহারকারী, টাইমস্ট্যাম্প, ট্রান্সক্রিপ্ট, কনফিডেন্স স্কোর)</li>
        </ul>

        <h3>1.4 ব্যবহারকারীর পছন্দ</h3>
        <ul>
          <li>অ্যাপের ভাষা এবং ভয়েস ভাষা নির্বাচন</li>
          <li>ভয়েস প্রতিক্রিয়া পছন্দ (চালু/বন্ধ)</li>
          <li>প্রদর্শন সেটিংস (উচ্চ বৈসাদৃশ্য মোড, পাঠ্য আকার)</li>
          <li>ডিফল্ট পরিমাপ ইউনিট</li>
          <li>বিজ্ঞপ্তি পছন্দ</li>
        </ul>

        <h3>1.5 দোকান সদস্যতা ডেটা</h3>
        <ul>
          <li>প্রতিটি দোকানে আপনার ভূমিকা (Owner, Manager বা Helper)</li>
          <li>দলের সহযোগিতার জন্য তৈরি করা কোড আমন্ত্রণ করুন</li>
          <li>দোকানের মধ্যে শেষ সক্রিয় টাইমস্ট্যাম্প</li>
        </ul>

        <h3>1.6 ডিভাইস এবং ডায়াগনস্টিক ডেটা</h3>
        <p>প্রোডাকশন বিল্ডে, আমরা ক্র্যাশ রিপোর্টিংয়ের জন্যSentryব্যবহার করি। এটি সংগ্রহ করে:</p>
        <ul>
          <li>ডিভাইসের ধরন, অপারেটিং সিস্টেম এবং অ্যাপ সংস্করণ</li>
          <li>ক্র্যাশ রিপোর্ট এবং ত্রুটি স্ট্যাক ট্রেস</li>
          <li>কর্মক্ষমতা ডেটা (সেশনের 20% নমুনা)</li>
        </ul>
        <p>ক্র্যাশ রিপোর্টিং ডেভেলপমেন্ট বিল্ডে অক্ষম করা হয়েছে এবং আমরা যে স্যাম্পলিং রেট প্রয়োগ করি তার দ্বারা কমিয়ে আনা যায়।</p>
      </div>
    </details>

    <details id="s2">
      <summary><h2>2. আমরা কিভাবে আপনার তথ্য ব্যবহার করি</h2></summary>
      <div class="section-content">
        <ul>
          <li><strong>পরিষেবা প্রদান করুন:</strong> ভয়েস কমান্ড প্রক্রিয়া করুন, ইনভেন্টরি পরিচালনা করুন এবং আপনার দল জুড়ে ডেটা সিঙ্ক করুন</li>
          <li><strong>প্রমাণীকরণ:</strong> আপনার পরিচয় যাচাই করুন এবং নিরাপদ সেশন পরিচালনা করুন</li>
          <li><strong>অডিট ট্রেইল:</strong> জবাবদিহিতা এবং পর্যালোচনার জন্য ইনভেন্টরি পরিবর্তনের একটি লগ বজায় রাখুন</li>
          <li><strong>পরিষেবা উন্নত করুন:</strong> বেনামী ত্রুটি রিপোর্টের মাধ্যমে বাগ এবং ক্র্যাশ নির্ণয় করুন</li>
          <li><strong>যোগাযোগ:</strong> প্রয়োজনীয় অ্যাকাউন্ট-সম্পর্কিত বিজ্ঞপ্তি পাঠান (যেমন, পাসওয়ার্ড রিসেট)</li>
        </ul>
        <p>আমরা করি <strong>না</strong> বিজ্ঞাপনের জন্য আপনার ডেটা ব্যবহার করি এবং আমরা করি <strong>না</strong> তৃতীয় পক্ষের কাছে আপনার ব্যক্তিগত তথ্য বিক্রি করুন।</p>
      </div>
    </details>

    <details id="s3">
      <summary><h2>3. তৃতীয় পক্ষের পরিষেবা</h2></summary>
      <div class="section-content">
        <p>আমরা অ্যাপটি পরিচালনা করতে নিম্নলিখিত তৃতীয় পক্ষের পরিষেবাগুলি ব্যবহার করি:</p>
        <table>
          <thead>
            <tr>
              <th>সেবা</th>
              <th>উদ্দেশ্য</th>
              <th>ডেটা শেয়ার করা হয়েছে</th>
              <th>গোপনীয়তা নীতি</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Clerk</strong></td>
              <td>প্রমাণীকরণ এবং সেশন পরিচালনা</td>
              <td>Email, নাম, OAuth টোকেন, সেশন ডেটা</td>
              <td><a href="https://clerk.com/legal/privacy" target="_blank" rel="noopener">clerk.com/legal/privacy</a></td>
            </tr>
            <tr>
              <td><strong>Sarvam AI</strong></td>
              <td>ভয়েস প্রসেসিং (স্পিচ-টু-টেক্সট, ন্যাচারাল ল্যাঙ্গুয়েজ প্রসেসিং, টেক্সট-টু-স্পিচ)</td>
              <td>অডিও রেকর্ডিং, প্রতিলিপি পাঠ্য, ভাষা কোড</td>
              <td><a href="https://www.sarvam.ai/privacy-policy" target="_blank" rel="noopener">sarvam.ai/privacy-policy</a></td>
            </tr>
            <tr>
              <td><strong>Neon</strong></td>
              <td>ডাটাবেস হোস্টিং (PostgreSQL)</td>
              <td>সমস্ত স্থায়ী অ্যাপ্লিকেশন ডেটা</td>
              <td><a href="https://neon.tech/privacy-policy" target="_blank" rel="noopener">neon.tech/privacy-policy</a></td>
            </tr>
            <tr>
              <td><strong>Sentry</strong></td>
              <td>ত্রুটি ট্র্যাকিং এবং ক্র্যাশ রিপোর্টিং</td>
              <td>ক্র্যাশ রিপোর্ট, ডিভাইসের তথ্য (শুধুমাত্র উৎপাদন)</td>
              <td><a href="https://sentry.io/privacy/" target="_blank" rel="noopener">sentry.io/privacy</a></td>
            </tr>
          </tbody>
        </table>
        <p>প্রতিটি তৃতীয় পক্ষের পরিষেবা তাদের নিজস্ব গোপনীয়তা নীতি অনুযায়ী ডেটা প্রক্রিয়া করে। আমরা আপনাকে তাদের নীতিগুলি পর্যালোচনা করতে উত্সাহিত করি৷</p>
      </div>
    </details>

    <details id="s4">
      <summary><h2>4. ডেটা স্টোরেজ এবং নিরাপত্তা</h2></summary>
      <div class="section-content">
        <ul>
          <li>ট্রানজিটে SSL/TLS এনক্রিপশন সহ একটি Neon PostgreSQL ডাটাবেসে অ্যাপ্লিকেশন ডেটা সংরক্ষণ করা হয়</li>
          <li>প্রমাণীকরণ টোকেনগুলি আপনার ডিভাইসে সুরক্ষিত সঞ্চয়স্থান ব্যবহার করে সংরক্ষণ করা হয় (iOSকীচেন / Android কীস্টোর)</li>
          <li>API যোগাযোগ HTTPS এনক্রিপশন ব্যবহার করে</li>
          <li>অপব্যবহার রোধ করার জন্য সংবেদনশীল শেষ পয়েন্ট রেট-সীমিত</li>
          <li>পাসওয়ার্ড হ্যাশ এবং Clerk দ্বারা পরিচালিত হয় — আমরা কখনই প্লেইনটেক্সট পাসওয়ার্ড সংরক্ষণ করি না</li>
        </ul>
      </div>
    </details>

    <details id="s5">
      <summary><h2>5. ডেটা ধারণ</h2></summary>
      <div class="section-content">
        <ul>
          <li><strong>ভয়েস অডিও:</strong> ক্ষণস্থায়ী — মেমরিতে প্রক্রিয়া করা হয় এবং অবিলম্বে বাতিল করা হয়। আমাদের সার্ভারে সংরক্ষণ করা হয় না.</li>
          <li><strong>প্রতিলিপি এবং অডিট লগ:</strong> আপনার রেফারেন্সের জন্য যতক্ষণ আপনার অ্যাকাউন্ট সক্রিয় থাকে ততক্ষণ ধরে রাখা হবে।</li>
          <li><strong>ইনভেন্টরি ডেটা:</strong> যতক্ষণ আপনার অ্যাকাউন্ট সক্রিয় থাকে ততক্ষণ ধরে রাখা হবে।</li>
          <li><strong>অ্যাকাউন্ট ডেটা:</strong> আপনি আপনার অ্যাকাউন্ট মুছে ফেলা পর্যন্ত রক্ষিত.</li>
          <li><strong>ক্র্যাশ রিপোর্ট:</strong> Sentry এর ডেটা ধারণ নীতি (সাধারণত 90 দিন) অনুযায়ী ধরে রাখা হয়।</li>
        </ul>
      </div>
    </details>

    <details id="s6">
      <summary><h2>6. অ্যাকাউন্ট মুছে ফেলা</h2></summary>
      <div class="section-content">
        <p>আপনি যেকোনো সময় থেকে আপনার অ্যাকাউন্ট মুছে ফেলতে পারেন <strong>Settings > Delete Account</strong> অ্যাপের মধ্যে। আপনি যখন আপনার অ্যাকাউন্ট মুছে ফেলবেন:</p>
        <ul>
          <li>সমস্ত পণ্য, ইনভেন্টরি, ব্যাচ, কেনার তালিকা এবং AI পূর্বাভাস সহ আপনার মালিকানাধীন সমস্ত দোকান স্থায়ীভাবে মুছে ফেলা হয়েছে</li>
          <li>আপনার সমস্ত অডিট লগ এবং পছন্দগুলি স্থায়ীভাবে মুছে ফেলা হয়েছে৷</li>
          <li>অন্য ব্যবহারকারীদের দোকানে আপনার সদস্যতা সরানো হয়েছে</li>
          <li>Clerk এর সাথে আপনার প্রমাণীকরণ অ্যাকাউন্ট স্থায়ীভাবে মুছে ফেলা হয়েছে</li>
        </ul>
        <p><strong>এই কর্ম অপরিবর্তনীয়.</strong> একবার মুছে ফেলা হলে, আপনার ডেটা পুনরুদ্ধার করা যাবে না।</p>
      </div>
    </details>

    <details id="s7">
      <summary><h2>7. দোকানের মধ্যে ডেটা শেয়ারিং</h2></summary>
      <div class="section-content">
        <p>Samaan-Bol একটি সহযোগী টুল। আপনি যখন একটি দোকানের সদস্য হন:</p>
        <ul>
          <li>সমস্ত দোকানের সদস্যরা (Owner, Manager, Helper) দোকানের ইনভেন্টরি ডেটা, পণ্যের ক্যাটালগ এবং অডিট লগ দেখতে পারে</li>
          <li>আপনার নাম, ভূমিকা, এবং কার্যকলাপ টাইমস্ট্যাম্প অন্যান্য দোকান সদস্যদের কাছে দৃশ্যমান</li>
          <li>Owner তাদের দোকানের জন্য সদস্যপদ এবং অ্যাক্সেস পরিচালনা করতে পারে</li>
        </ul>
        <p>আপনি যে দোকানের সদস্য নন বা কোন সম্পর্কহীন তৃতীয় পক্ষের সাথে আমরা আপনার ডেটা শেয়ার করি না।</p>
      </div>
    </details>

    <details id="s8">
      <summary><h2>8. শিশুদের গোপনীয়তা</h2></summary>
      <div class="section-content">
        <p>Samaan-Bol 13 বছরের কম বয়সী শিশুদের দ্বারা ব্যবহারের উদ্দেশ্যে নয়৷ আমরা জেনেশুনে 13 বছরের কম বয়সী শিশুদের কাছ থেকে ব্যক্তিগত তথ্য সংগ্রহ করি না৷ আপনি যদি বিশ্বাস করেন যে কোনও শিশু আমাদের ব্যক্তিগত তথ্য প্রদান করেছে, অনুগ্রহ করে আমাদের সাথে যোগাযোগ করুন এবং আমরা তা দ্রুত মুছে দেব৷</p>
      </div>
    </details>

    <details id="s9">
      <summary><h2>9. আপনার অধিকার</h2></summary>
      <div class="section-content">
        <p>আপনার অধিকার আছে:</p>
        <ul>
          <li><strong>আপনার ডেটা অ্যাক্সেস করুন:</strong> অ্যাপের মধ্যে আপনার ইনভেন্টরি, অডিট লগ এবং পছন্দগুলি দেখুন</li>
          <li><strong>আপনার ডেটা মুছুন:</strong> সেটিংসে অ্যাকাউন্ট মুছে ফেলার বৈশিষ্ট্যটি ব্যবহার করুন</li>
          <li><strong>নিয়ন্ত্রণ পছন্দ:</strong> যেকোনো সময় আপনার ভাষা, প্রদর্শন এবং ভয়েস সেটিংস পরিবর্তন করুন</li>
          <li><strong>দোকান থেকে প্রত্যাহার:</strong> আপনি যে দোকানের সদস্য তা ছেড়ে দিন</li>
        </ul>
      </div>
    </details>

    <details id="s10">
      <summary><h2>10. এই নীতিতে পরিবর্তন</h2></summary>
      <div class="section-content">
        <p>আমরা সময়ে সময়ে এই গোপনীয়তা নীতি আপডেট করতে পারি। যখন আমরা করব, আমরা এই পৃষ্ঠার শীর্ষে "কার্যকর তারিখ" আপডেট করব। আমরা আপনাকে পর্যায়ক্রমে এই নীতি পর্যালোচনা করতে উত্সাহিত করি। পরিবর্তনের পর অ্যাপটির ব্যবহার অব্যাহত রাখাই আপডেট করা নীতির গ্রহণযোগ্যতা গঠন করে।</p>
      </div>
    </details>

    <details id="s11">
      <summary><h2>11. আমাদের সাথে যোগাযোগ করুন</h2></summary>
      <div class="section-content">
        <p>এই গোপনীয়তা নীতি বা আপনার ডেটা সম্পর্কে আপনার কোন প্রশ্ন থাকলে, অনুগ্রহ করে আমাদের সাথে এখানে যোগাযোগ করুন:</p>
        <p><strong>Email:</strong> <a href="mailto:meetslimshady07@gmail.com">meetslimshady07@gmail.com</a></p>
      </div>
    </details>

    <p class="copyright">© 2026 Samaan-Bol। সর্বস্বত্ব সংরক্ষিত</p>
  </div>

  <button class="back-to-top" id="backToTop" aria-label="Back to top">↑</button>`,
    terms: `<div class="reading-progress" id="readingProgress"></div>

  <div class="container">
    <a href="/" class="back">← বাড়িতে ফিরে যান</a>
    <h1>পরিষেবার শর্তাবলী</h1>
    <p class="effective">কার্যকরী তারিখ: ফেব্রুয়ারি 23, 2026</p>

    <nav class="toc">
      <h3>বিষয়বস্তু</h3>
      <ol>
        <li><a href="#s1">পরিষেবার বিবরণ</a></li>
        <li><a href="#s2">অ্যাকাউন্ট নিবন্ধন</a></li>
        <li><a href="#s3">ব্যবহারকারীর ভূমিকা ও দায়িত্ব</a></li>
        <li><a href="#s4">ভয়েস ইনপুট</a></li>
        <li><a href="#s5">গ্রহণযোগ্য ব্যবহার</a></li>
        <li><a href="#s6">আপনার ডেটা</a></li>
        <li><a href="#s7">সেবা প্রাপ্যতা</a></li>
        <li><a href="#s8">হার সীমা</a></li>
        <li><a href="#s9">অ্যাকাউন্ট সমাপ্তি</a></li>
        <li><a href="#s10">বুদ্ধিবৃত্তিক সম্পত্তি</a></li>
        <li><a href="#s11">ওয়ারেন্টির দাবিত্যাগ</a></li>
        <li><a href="#s12">দায়বদ্ধতার সীমাবদ্ধতা</a></li>
        <li><a href="#s13">এই শর্তাবলী পরিবর্তন</a></li>
        <li><a href="#s14">পরিচালনা আইন</a></li>
        <li><a href="#s15">আমাদের সাথে যোগাযোগ করুন</a></li>
      </ol>
    </nav>

    <p>Samaan-Bol এ স্বাগতম। এই পরিষেবার শর্তাদি ("শর্তাবলী") আপনারSamaan-Bolমোবাইল অ্যাপ্লিকেশন এবং সম্পর্কিত পরিষেবাগুলির (সম্মিলিতভাবে, "পরিষেবা") ব্যবহার নিয়ন্ত্রণ করে। একটি অ্যাকাউন্ট তৈরি করে বা পরিষেবা ব্যবহার করে, আপনি এই শর্তাবলী দ্বারা আবদ্ধ হতে সম্মত হন।</p>

    <details open id="s1">
      <summary><h2>1. পরিষেবার বিবরণ</h2></summary>
      <div class="section-content">
        <p>Samaan-Bol ভারতীয় খুচরা ব্যবসার জন্য ডিজাইন করা একটি ভয়েস-প্রথম সহযোগী ইনভেন্টরি ম্যানেজমেন্ট অ্যাপ্লিকেশন। পরিষেবা আপনাকে অনুমতি দেয়:</p>
        <ul>
          <li>একাধিক ভারতীয় ভাষায় ভয়েস কমান্ড ব্যবহার করে পণ্য তালিকা পরিচালনা করুন</li>
          <li>স্টক স্তর, ব্যাচ, মেয়াদ শেষ হওয়ার তারিখ এবং ক্রয়ের তথ্য ট্র্যাক করুন</li>
          <li>ভূমিকা-ভিত্তিক অ্যাক্সেসের মাধ্যমে দলের সদস্যদের সাথে সহযোগিতা করুন (Owner, Manager, Helper)</li>
          <li>সমস্ত ইনভেন্টরি পরিবর্তনের অডিট ট্রেলগুলি দেখুন৷</li>
          <li>কেনার তালিকা পরিচালনা করুন এবং স্টক-স্তরের সতর্কতা গ্রহণ করুন</li>
        </ul>
      </div>
    </details>

    <details id="s2">
      <summary><h2>2. অ্যাকাউন্ট নিবন্ধন</h2></summary>
      <div class="section-content">
        <p>পরিষেবাটি ব্যবহার করতে, আপনাকে অবশ্যই সঠিক এবং সম্পূর্ণ তথ্য প্রদান করে একটি অ্যাকাউন্ট তৈরি করতে হবে। আপনি এর জন্য দায়ী:</p>
        <ul>
          <li>আপনার অ্যাকাউন্টের শংসাপত্রের গোপনীয়তা বজায় রাখা</li>
          <li>সমস্ত কার্যকলাপ যা আপনার অ্যাকাউন্টের অধীনে ঘটে</li>
          <li>আপনার অ্যাকাউন্টের যেকোনো অননুমোদিত ব্যবহারের বিষয়ে আমাদের অবিলম্বে অবহিত করা</li>
        </ul>
        <p>একটি অ্যাকাউন্ট তৈরি করতে এবং পরিষেবাটি ব্যবহার করতে আপনার বয়স কমপক্ষে 13 বছর হতে হবে৷</p>
      </div>
    </details>

    <details id="s3">
      <summary><h2>3. ব্যবহারকারীর ভূমিকা ও দায়িত্ব</h2></summary>
      <div class="section-content">
        <p>Samaan-Bol একটি ভূমিকা-ভিত্তিক অ্যাক্সেস কন্ট্রোল সিস্টেম ব্যবহার করে:</p>
        <ul>
          <li><strong>Owner:</strong> দোকান তৈরি করে এবং পরিচালনা করে, দলের সদস্যদের আমন্ত্রণ জানায়, দোকানের সমস্ত ডেটা এবং সেটিংসে সম্পূর্ণ অ্যাক্সেস রয়েছে এবং দোকান মুছতে পারে</li>
          <li><strong>Manager:</strong> ইনভেন্টরি পরিচালনা করতে পারে, রিপোর্ট দেখতে পারে এবং দোকানের মধ্যে বেশিরভাগ অপারেশন করতে পারে</li>
          <li><strong>Helper:</strong> নির্দেশিত হিসাবে স্টক আইটেম যোগ এবং অপসারণ করতে পারেন</li>
        </ul>
        <p>Owner হিসাবে, আপনি আপনার দোকানে অ্যাক্সেস এবং এর মধ্যে থাকা ডেটা পরিচালনা করার জন্য দায়ী৷ আপনি সদস্যদের আমন্ত্রণ জানালে, তারা আপনার দোকানের ইনভেন্টরি ডেটাতে অ্যাক্সেস লাভ করে।</p>
      </div>
    </details>

    <details id="s4">
      <summary><h2>4. ভয়েস ইনপুট</h2></summary>
      <div class="section-content">
        <p>পরিষেবাটি তৃতীয় পক্ষের AI পরিষেবাগুলি ব্যবহার করে ভয়েস কমান্ডগুলি প্রক্রিয়া করে৷ অনুগ্রহ করে সচেতন থাকুন যে:</p>
        <ul>
          <li>ভয়েস রেকর্ডিং প্রতি কমান্ডে সর্বাধিক 30 সেকেন্ডের মধ্যে সীমাবদ্ধ</li>
          <li>পরিষেবাটি ইংরেজি, হিন্দি, তামিল, তেলেগু, বাংলা, মারাঠি, কন্নড়, গুজরাটি, মালায়লাম এবং হিংলিশ সহ একাধিক ভাষা সমর্থন করে</li>
          <li>ভয়েস শনাক্তকরণের সঠিকতা নির্ভর করে অডিওর গুণমান, ব্যাকগ্রাউন্ড নয়েজ, অ্যাকসেন্ট এবং ভাষার স্বচ্ছতার উপর</li>
          <li>সঠিকতা নিশ্চিত করতে আপনার ভয়েস-প্রসেসড ইনভেন্টরি পরিবর্তনগুলি পর্যালোচনা করা উচিত</li>
          <li>ভয়েস অডিও রিয়েল-টাইমে প্রক্রিয়া করা হয় এবং স্থায়ীভাবে সংরক্ষণ করা হয় না (দেখুন আমাদের <a href="/privacy-policy">গোপনীয়তা নীতি</a> বিস্তারিত জানার জন্য)</li>
        </ul>
      </div>
    </details>

    <details id="s5">
      <summary><h2>5. গ্রহণযোগ্য ব্যবহার</h2></summary>
      <div class="section-content">
        <p>আপনি সম্মত হন না:</p>
        <ul>
          <li>কোনো বেআইনি উদ্দেশ্যে পরিষেবা ব্যবহার করুন</li>
          <li>অন্য ব্যবহারকারীদের অ্যাকাউন্ট বা দোকানে অননুমোদিত অ্যাক্সেস লাভ করার চেষ্টা</li>
          <li>পরিষেবা বা এর পরিকাঠামোতে হস্তক্ষেপ বা ব্যাঘাত ঘটান</li>
          <li>রিভার্স-ইঞ্জিনিয়ার, ডিকম্পাইল বা অ্যাপ্লিকেশানটি বিচ্ছিন্ন করুন</li>
          <li>সাধারণ ব্যবহারের ধরনগুলির বাইরে পরিষেবা অ্যাক্সেস করতে স্বয়ংক্রিয় সরঞ্জামগুলি ব্যবহার করুন৷</li>
          <li>আমন্ত্রণ কোডগুলি সর্বজনীনভাবে বা এমন ব্যক্তিদের সাথে শেয়ার করুন যারা আপনার দোকানে যোগদানের উদ্দেশ্যে নয়</li>
          <li>একটি দোকানের মধ্যে আপনার পরিচয় বা ভূমিকা ভুলভাবে উপস্থাপন করুন</li>
        </ul>
      </div>
    </details>

    <details id="s6">
      <summary><h2>6. আপনার ডেটা</h2></summary>
      <div class="section-content">
        <p>আপনি পরিষেবাতে প্রবেশ করা ব্যবসার ডেটার মালিকানা ধরে রাখেন (পণ্যের তথ্য, ইনভেন্টরি রেকর্ড, ইত্যাদি)। আমরা আপনার বিষয়বস্তুর মালিকানা দাবি করি না।</p>
        <p>পরিষেবাটি ব্যবহার করে, আপনি শুধুমাত্র পরিষেবা প্রদান এবং উন্নত করার উদ্দেশ্যে আপনার ডেটা সঞ্চয়, প্রক্রিয়াকরণ এবং প্রেরণ করার জন্য আমাদের একটি সীমিত লাইসেন্স প্রদান করেন।</p>
        <p>আমরা কীভাবে আপনার ডেটা সংগ্রহ, ব্যবহার এবং সুরক্ষার জন্য বিস্তারিত জানার জন্য, অনুগ্রহ করে আমাদের পর্যালোচনা করুন <a href="/privacy-policy">গোপনীয়তা নীতি</a>.</p>
      </div>
    </details>

    <details id="s7">
      <summary><h2>7. পরিষেবা উপলব্ধতা</h2></summary>
      <div class="section-content">
        <p>আমরা সর্বদা পরিষেবাটি উপলব্ধ রাখার চেষ্টা করি, তবে আমরা নিরবচ্ছিন্ন অ্যাক্সেসের গ্যারান্টি দিই না। এই কারণে পরিষেবাটি সাময়িকভাবে অনুপলব্ধ হতে পারে:</p>
        <ul>
          <li>পরিকল্পিত রক্ষণাবেক্ষণ বা আপডেট</li>
          <li>প্রযুক্তিগত সমস্যা আমাদের নিয়ন্ত্রণের বাইরে</li>
          <li>তৃতীয় পক্ষের পরিষেবা বিভ্রাট (প্রমাণিকরণ, ভয়েস প্রক্রিয়াকরণ, ডাটাবেস হোস্টিং)</li>
        </ul>
        <p>সার্ভিস ডাউনটাইম এর ফলে কোন ক্ষতির জন্য আমরা দায়ী নই।</p>
      </div>
    </details>

    <details id="s8">
      <summary><h2>8. হারের সীমা</h2></summary>
      <div class="section-content">
        <p>ন্যায্য ব্যবহার এবং পরিষেবার স্থিতিশীলতা নিশ্চিত করতে, পরিষেবাটিAPIঅনুরোধের উপর হারের সীমা প্রয়োগ করে। এই সীমা অতিক্রম করার ফলে আপনার অনুরোধ সাময়িকভাবে থ্রটলিং হতে পারে।</p>
      </div>
    </details>

    <details id="s9">
      <summary><h2>9. অ্যাকাউন্ট সমাপ্তি</h2></summary>
      <div class="section-content">
        <p>আপনি যেকোনো সময় আপনার অ্যাকাউন্ট মুছে ফেলতে পারেন <strong>Settings > Delete Account</strong> অ্যাপে। অ্যাকাউন্ট মুছে ফেলা স্থায়ী এবং অপরিবর্তনীয় — আপনার সমস্ত দোকান, ইনভেন্টরি ডেটা, অডিট লগ এবং পছন্দগুলি স্থায়ীভাবে মুছে ফেলা হবে৷</p>
        <p>আমরা এই শর্তাবলী লঙ্ঘন করে বা আপত্তিজনক আচরণে জড়িত অ্যাকাউন্টগুলিকে স্থগিত বা বন্ধ করার অধিকার সংরক্ষণ করি।</p>
      </div>
    </details>

    <details id="s10">
      <summary><h2>10. বুদ্ধিবৃত্তিক সম্পত্তি</h2></summary>
      <div class="section-content">
        <p>Samaan-Bol অ্যাপ্লিকেশন, এর ডিজাইন, কোড, ব্র্যান্ডিং এবং ডকুমেন্টেশন সহ, আমাদের বৌদ্ধিক সম্পত্তি। আপনি আমাদের লিখিত অনুমতি ছাড়া আবেদনের উপর ভিত্তি করে অনুলিপি, পরিবর্তন, বিতরণ বা ডেরিভেটিভ কাজ তৈরি করতে পারবেন না।</p>
      </div>
    </details>

    <details id="s11">
      <summary><h2>11. ওয়ারেন্টির দাবিত্যাগ</h2></summary>
      <div class="section-content">
        <p>পরিষেবাটি "যেমন আছে" এবং "যেমন উপলব্ধ" কোনো ধরনের ওয়ারেন্টি ছাড়াই প্রদান করা হয়, তা প্রকাশ বা উহ্যই হোক না কেন। আমরা বিশেষভাবে এর ওয়ারেন্টি অস্বীকার করি:</p>
        <ul>
          <li>একটি বিশেষ উদ্দেশ্যে ব্যবসায়িকতা বা উপযুক্ততা</li>
          <li>ভয়েস রিকগনিশন বা এআই-জেনারেটেড পরামর্শের যথার্থতা</li>
          <li>নিরবচ্ছিন্ন বা ত্রুটি-মুক্ত অপারেশন</li>
        </ul>
        <p>ভয়েস-ভিত্তিক ইনভেন্টরি অ্যাকশন হল সহায়ক — আপনার স্টক সংক্রান্ত গুরুত্বপূর্ণ সিদ্ধান্তগুলি স্বাধীনভাবে যাচাই করা উচিত।</p>
      </div>
    </details>

    <details id="s12">
      <summary><h2>12. দায়বদ্ধতার সীমাবদ্ধতা</h2></summary>
      <div class="section-content">
        <p>আইন দ্বারা অনুমোদিত সর্বাধিক পরিমাণে, আপনার পরিষেবার ব্যবহার থেকে উদ্ভূত কোনো পরোক্ষ, আনুষঙ্গিক, বিশেষ, ফলস্বরূপ, বা শাস্তিমূলক ক্ষতির জন্য আমরা দায়বদ্ধ হব না, যার মধ্যে কিন্তু সীমাবদ্ধ নয়:</p>
        <ul>
          <li>ভয়েস শনাক্তকরণ ত্রুটির ফলে ইনভেন্টরির অসঙ্গতি</li>
          <li>সার্ভিস ডাউনটাইমের কারণে ব্যবসায়িক ক্ষতি</li>
          <li>আমাদের স্ট্যান্ডার্ড ব্যাকআপ পদ্ধতি দ্বারা কভার করা হয় তার বাইরে ডেটা ক্ষতি</li>
        </ul>
      </div>
    </details>

    <details id="s13">
      <summary><h2>13. এই শর্তাবলী পরিবর্তন</h2></summary>
      <div class="section-content">
        <p>আমরা সময়ে সময়ে এই শর্তাবলী আপডেট করতে পারি। যখন আমরা করব, আমরা এই পৃষ্ঠার শীর্ষে "কার্যকর তারিখ" আপডেট করব। পরিবর্তনের পরে পরিষেবার ক্রমাগত ব্যবহার আপডেট করা শর্তাবলীর স্বীকৃতি গঠন করে।</p>
      </div>
    </details>

    <details id="s14">
      <summary><h2>14. পরিচালনা আইন</h2></summary>
      <div class="section-content">
        <p>এই শর্তাবলী ভারতের আইন অনুসারে পরিচালিত হবে এবং বোঝানো হবে। এই শর্তাবলী বা পরিষেবা থেকে উদ্ভূত যেকোনো বিরোধ ভারতের আদালতের একচেটিয়া এখতিয়ারের অধীন হবে।</p>
      </div>
    </details>

    <details id="s15">
      <summary><h2>15. আমাদের সাথে যোগাযোগ করুন</h2></summary>
      <div class="section-content">
        <p>এই শর্তাবলী সম্পর্কে আপনার কোন প্রশ্ন থাকলে, অনুগ্রহ করে আমাদের সাথে এখানে যোগাযোগ করুন:</p>
        <p><strong>Email:</strong> <a href="mailto:meetslimshady07@gmail.com">meetslimshady07@gmail.com</a></p>
      </div>
    </details>

    <p class="copyright">© 2026 Samaan-Bol। সর্বস্বত্ব সংরক্ষিত</p>
  </div>

  <button class="back-to-top" id="backToTop" aria-label="Back to top">↑</button>`,
  },
  "ta": {
    home: `<!-- Three.js background canvas -->
<canvas id="bgCanvas"></canvas>

<!-- Aurora ambient background (WebGL fallback) -->
<div class="aurora-bg"><div class="aurora-orb"></div></div>

<!-- Scroll progress indicator -->
<div class="scroll-progress" id="scrollProgress"></div>

<!-- ═══ NAVIGATION ═══ -->
<nav id="nav">
  <div class="container">
    <div class="nav-inner">
      <a href="#" class="logo">
        <div class="logo-mark"><svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><defs><mask id="stencil-nav"><rect x="0" y="0" width="100" height="100" fill="white"/><rect x="24" y="18" width="52" height="8" rx="4" fill="black"/><rect x="38" y="18" width="24" height="36" rx="12" fill="black"/><path d="M 28 42 A 22 22 0 0 0 72 42" fill="none" stroke="black" stroke-width="8" stroke-linecap="round"/><rect x="46" y="72" width="8" height="10" rx="4" fill="black"/><rect x="36" y="32" width="28" height="4" fill="white"/><rect x="36" y="44" width="28" height="4" fill="white"/></mask></defs><circle cx="50" cy="50" r="50" fill="#ea580c" mask="url(#stencil-nav)"/></svg></div>
        <div class="logo-text">சமன்<span>போல்</span></div>
      </a>
      <ul class="nav-links">
        <li><a href="#how">இது எப்படி வேலை செய்கிறது</a></li>
        <li><a href="#features">அம்சங்கள்</a></li>
        <li><a href="#ai">AI நுண்ணறிவு</a></li>
        <li><a href="#languages">மொழிகள்</a></li>
        <li><a href="https://apps.apple.com/in/app/samaan-bol/id6759739444" class="nav-cta">பயன்பாட்டைப் பதிவிறக்கவும்</a></li>
      </ul>
      <button class="mobile-menu-btn" aria-label="Menu">☰</button>
    </div>
  </div>
</nav>

<!-- ═══ HERO ═══ -->
<section class="hero">
  <div class="container">
    <div class="hero-grid">
      <div>
        <div class="hero-eyebrow">இந்திய சில்லறை விற்பனைக்கான குரல்-முதல் சரக்கு</div>
        <h1 class="hero-text-reveal">
          <span class="hindi-line hindi">बोल के सँभालो अपना बिज़नेस</span>
          <span class="hero-text-main">உங்கள் கடையை நிர்வகிக்கவும்<br>உங்கள் குரலுடன்</span>
        </h1>
        <p class="hero-sub">
          உள்ளே பேசு <span class="hero-rotate"><span class="hero-rotate-word active">ஹிந்தி</span><span class="hero-rotate-word">பெங்காலி</span><span class="hero-rotate-word">தமிழ்</span><span class="hero-rotate-word">தெலுங்கு</span><span class="hero-rotate-word">மராத்தி</span><span class="hero-rotate-word">ஆங்கிலம்</span></span>, அல்லது 10 இந்திய மொழிகளில் ஏதேனும்.Samaan-Bolஇன் AI உங்கள் கட்டளையைப் புரிந்துகொண்டு, உங்கள் சரக்குகளைப் புதுப்பிக்கிறது,
          மற்றும் உங்கள் வணிகத்தை இயங்க வைக்கிறது — ஹேண்ட்ஸ் ஃப்ரீ.
        </p>
        <div class="hero-actions">
          <a href="#download" class="btn-primary">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            இலவசமாக பதிவிறக்கவும்
          </a>
          <a href="#how" class="btn-secondary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            செயலில் பார்க்கவும்
          </a>
        </div>
        <div class="hero-stats">
          <div class="hero-stat">
            <div class="hero-stat-number">11</div>
            <div class="hero-stat-label">மொழிகள் ஆதரிக்கப்படுகின்றன</div>
          </div>
          <div class="hero-stat">
            <div class="hero-stat-number">50K+</div>
            <div class="hero-stat-label">பொருட்கள் தினசரி கண்காணிக்கப்படும்</div>
          </div>
          <div class="hero-stat">
            <div class="hero-stat-number">2 நிமிடம்</div>
            <div class="hero-stat-label">அமைவு நேரம்</div>
          </div>
        </div>
      </div>

      <div class="hero-visual">
        <!-- Floating cards (z-index 10 — in FRONT of phone) -->
        <div class="float-card float-card--voice">
          <div class="float-card-icon float-card-icon--voice"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg></div>
          <p><strong class="hindi">"चावल 5 किलो जोड़ दो"</strong></p>
          <p style="margin-top:6px; font-size:12px; color:var(--success);">✓ Basmati Rice — 18 → 23 கிலோ</p>
        </div>

        <div class="float-card float-card--alert">
          <div class="float-card-icon float-card-icon--alert"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg></div>
          <p><strong>குறைந்த பங்கு எச்சரிக்கை</strong></p>
          <p style="margin-top:4px; font-size:12px;">ஆட்டா இன்னும் 3 நாட்களில் தீர்ந்துவிடலாம்</p>
        </div>

        <!-- Phone mockup — mirrors actual app UI -->
        <div class="phone-frame">
          <div class="phone-notch"></div>
          <div class="phone-screen">
            <div class="phone-status-bar">
              <span>9:41</span>
              <span style="display:flex; gap:4px; align-items:center;">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z"/></svg>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><rect x="17" y="4" width="4" height="16" rx="1"/><rect x="11" y="8" width="4" height="12" rx="1"/><rect x="5" y="12" width="4" height="8" rx="1"/></svg>
                <svg width="14" height="12" viewBox="0 0 28 14" fill="currentColor"><rect x="0" y="1" width="22" height="12" rx="2" stroke="currentColor" fill="none" stroke-width="1.5"/><rect x="24" y="4.5" width="3" height="5" rx="1"/><rect x="2" y="3" width="14" height="8" rx="1"/></svg>
              </span>
            </div>

            <!-- Header: greeting + bell -->
            <div class="phone-header">
              <div>
                <div class="phone-greeting">காலை வணக்கம்! 👋</div>
                <div class="phone-subtext">Priya General Store</div>
              </div>
              <div class="phone-bell">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B6B70" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                <div class="phone-bell-badge">3</div>
              </div>
            </div>

            <!-- Search bar with mic icon -->
            <div class="phone-search">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4A4A50" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <span class="phone-search-text">தயாரிப்புகளைத் தேடு...</span>
              <div class="phone-search-mic">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0D0D12" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/></svg>
              </div>
            </div>

            <!-- 2x2 Stats grid -->
            <div class="phone-stats-grid">
              <div class="phone-stat-card phone-stat-card--total">
                <div class="phone-stat-number">142</div>
                <div class="phone-stat-label">மொத்த பொருட்கள்</div>
              </div>
              <div class="phone-stat-card phone-stat-card--low">
                <div class="phone-stat-number" style="color:var(--warning);">8</div>
                <div class="phone-stat-label">குறைந்த பங்கு</div>
              </div>
              <div class="phone-stat-card phone-stat-card--out">
                <div class="phone-stat-number" style="color:var(--danger);">2</div>
                <div class="phone-stat-label">கையிருப்பில் இல்லை</div>
              </div>
              <div class="phone-stat-card phone-stat-card--activity">
                <div class="phone-stat-number" style="color:var(--success);">23</div>
                <div class="phone-stat-label">இன்று புதுப்பிக்கப்பட்டது</div>
              </div>
            </div>

            <!-- Filter chips -->
            <div class="phone-filter-row">
              <span class="phone-chip phone-chip--active">அனைத்து</span>
              <span class="phone-chip">குறைந்த பங்கு</span>
              <span class="phone-chip">வெளியே</span>
              <span class="phone-chip">காலாவதியாகும்</span>
            </div>

            <!-- Product cards -->
            <div class="phone-product">
              <div class="phone-product-icon" style="background:rgba(255,181,71,0.12);">🍚</div>
              <div class="phone-product-info">
                <div class="phone-product-name">Basmati Rice</div>
                <div class="phone-product-meta">தானியங்கள் · 2நி முன்பு புதுப்பிக்கப்பட்டது</div>
              </div>
              <div class="phone-product-qty">
                <div class="phone-product-qty-num">23</div>
                <div class="phone-product-qty-unit">கிலோ</div>
              </div>
            </div>

            <div class="phone-product">
              <div class="phone-product-icon" style="background:rgba(255,107,0,0.12);">🫒</div>
              <div class="phone-product-info">
                <div class="phone-product-name">Aashirvaad Atta</div>
                <div class="phone-product-meta">மாவு · 1 மணிநேரத்திற்கு முன்பு புதுப்பிக்கப்பட்டது</div>
                <div class="phone-product-status phone-product-status--low">குறைந்த ஸ்டாக்</div>
              </div>
              <div class="phone-product-qty">
                <div class="phone-product-qty-num" style="color:var(--warning);">3</div>
                <div class="phone-product-qty-unit">கிலோ</div>
              </div>
            </div>

            <div class="phone-product">
              <div class="phone-product-icon" style="background:rgba(50,213,131,0.1);">🥛</div>
              <div class="phone-product-info">
                <div class="phone-product-name">Amul Toned Milk</div>
                <div class="phone-product-meta">டெய்ரி · 3 மணிநேரத்திற்கு முன்பு புதுப்பிக்கப்பட்டது</div>
              </div>
              <div class="phone-product-qty">
                <div class="phone-product-qty-num">40</div>
                <div class="phone-product-qty-unit">pkt</div>
              </div>
            </div>

          </div>
          <!-- Floating mic FAB (like the real app) -->
          <div class="phone-fab">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0D0D12" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/></svg>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ═══ HOW IT WORKS ═══ -->
<section class="how-it-works" id="how">
  <div class="container">
    <div class="reveal">
      <div class="section-label">இது எப்படி வேலை செய்கிறது</div>
      <h2 class="section-heading">மூன்று படிகள். பயிற்சி தேவையில்லை.</h2>
      <p class="section-sub">உங்கள் மொழியில் இயல்பாகப் பேசுங்கள் - மீதமுள்ளவற்றை AI கையாளும்.</p>
    </div>
    <div class="steps-grid">
      <div class="step reveal reveal-delay-1">
        <div class="step-number">01</div>
        <h3>உங்கள் கட்டளையைப் பேசுங்கள்</h3>
        <p>மைக்கைத் தட்டி, உங்களுக்குத் தேவையானதைச் சொல்லவும் — பங்குகளைச் சேர்க்கவும், அளவைச் சரிபார்க்கவும், வாங்குதல் பட்டியலை உருவாக்கவும். எந்த இந்திய மொழியிலும்.</p>
        <div class="step-example">
          <div class="hindi">"चावल 5 किलो जोड़ दो"</div>
          <div class="english">5 கிலோ அரிசி சேர்க்கவும்</div>
        </div>
      </div>
      <div class="step reveal reveal-delay-2">
        <div class="step-number">02</div>
        <h3>AI உடனடியாக புரிந்துகொள்கிறது</h3>
        <p>Sarvam AIஉங்கள் பேச்சைச் செயலாக்குகிறது, தயாரிப்பு, அளவு மற்றும் செயலைப் பிரித்தெடுக்கிறது - பின்னர் அதை உங்கள் சரக்குகளுடன் பொருத்துகிறது.</p>
        <div class="step-example">
          <div style="display:flex; gap:12px; flex-wrap:wrap;">
            <span style="background:var(--saffron-tint); color:var(--saffron); padding:4px 10px; border-radius:4px; font-size:12px;">அரிசி → பாஸ்மதி 🍚</span>
            <span style="background:rgba(50,213,131,0.1); color:var(--success); padding:4px 10px; border-radius:4px; font-size:12px;">+5 கிலோ</span>
            <span style="background:rgba(99,102,241,0.1); color:#818CF8; padding:4px 10px; border-radius:4px; font-size:12px;">சேர் ✓</span>
          </div>
        </div>
      </div>
      <div class="step reveal reveal-delay-3">
        <div class="step-number">03</div>
        <h3>இருப்பு புதுப்பிக்கப்பட்டது, உறுதிப்படுத்தப்பட்டது</h3>
        <p>உங்கள் பங்கு உடனடியாக புதுப்பிக்கப்பட்டது. உங்கள் மொழியில் குரல் உறுதிப்படுத்தலைக் கேட்கிறீர்கள் - திரை தேவையில்லை.</p>
        <div class="step-example">
          <div class="hindi">"हो गया — बासमती चावल अब 23 किलो है"</div>
          <div class="english">முடிந்தது - பாசுமதி அரிசி இப்போது 23 கிலோ</div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ═══ FEATURES ═══ -->
<section class="features" id="features" style="position:relative; overflow:hidden;">
  <div class="orb orb--saffron" style="top: -100px; right: -150px;"></div>
  <div class="container">
    <div class="reveal">
      <div class="section-label">அம்சங்கள்</div>
      <h2 class="section-heading">உங்கள் கடைக்கு தேவையான அனைத்தும். செய்யாதது எதுவுமில்லை.</h2>
    </div>
    <div class="features-grid">
      <div class="feature feature--hero reveal reveal-delay-1">
        <div class="feature-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg></div>
        <h3>குரல்-முதல் சரக்கு</h3>
        <p>இயற்கையாகப் பேசுவதன் மூலம் பங்குகளைச் சேர்க்கவும், அகற்றவும் அல்லது சரிபார்க்கவும். தட்டச்சு இல்லை, மெனுக்கள் மூலம் தேடுவது இல்லை. உங்கள் மொழியில் பேசுங்கள், மீதமுள்ளவற்றை AI கையாளும் - உங்கள் கட்டளையைப் புரிந்துகொள்வது முதல் உங்கள் பங்குகளை உண்மையான நேரத்தில் புதுப்பித்தல் வரை.</p>
      </div>
      <div class="feature reveal reveal-delay-2">
        <div class="feature-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg></div>
        <h3>10 இந்திய மொழிகள் + ஆங்கிலம்</h3>
        <p>இந்தி, பெங்காலி, தமிழ், தெலுங்கு, மராத்தி, கன்னடம், குஜராத்தி, மலையாளம், பஞ்சாபி மற்றும் ஒடியா -Sarvam AIமூலம் இயக்கப்படுகிறது.</p>
      </div>
      <div class="feature reveal reveal-delay-3">
        <div class="feature-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></div>
        <h3>குழு பாத்திரங்கள்</h3>
        <p>Owner, Manager, மற்றும் Helper சிறுமணி அனுமதிகளுடன். அனைவரும் ஒரே பக்கத்தில், பாதுகாப்பாக.</p>
      </div>
      <div class="feature reveal reveal-delay-1">
        <div class="feature-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/><path d="M9 14l2 2 4-4"/></svg></div>
        <h3>ஸ்மார்ட் வாங்குதல் பட்டியல்கள்</h3>
        <p>தானாக உருவாக்கப்பட்ட ரீஸ்டாக்கிங் பட்டியல்கள் குறைவாக இயங்குவதை அடிப்படையாகக் கொண்டது. WhatsApp மூலம் சப்ளையர்களுக்கு பகிரவும்.</p>
      </div>
      <div class="feature reveal reveal-delay-2">
        <div class="feature-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></svg></div>
        <h3>செயல்பாட்டு தணிக்கை பதிவு</h3>
        <p>ஒவ்வொரு மாற்றமும் யார், என்ன, எப்போது என்று கண்காணிக்கப்படும். உங்கள் குழு முழுவதும் முழுமையான வெளிப்படைத்தன்மை.</p>
      </div>
      <div class="feature reveal reveal-delay-3">
        <div class="feature-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><line x1="7" y1="12" x2="17" y2="12"/><line x1="7" y1="8" x2="17" y2="8"/><line x1="7" y1="16" x2="17" y2="16"/></svg></div>
        <h3>பார்கோடு ஸ்கேனிங்</h3>
        <p>தயாரிப்புகளைச் சேர்க்க அல்லது உடனடியாகப் பார்க்க ஸ்கேன் செய்யவும். இந்திய மற்றும் சர்வதேச பார்கோடுகளுடன் வேலை செய்கிறது.</p>
      </div>
    </div>
  </div>
</section>

<!-- ═══ AI INTELLIGENCE ═══ -->
<section class="ai-section" id="ai" style="overflow:hidden;">
  <div class="orb orb--indigo" style="bottom: -100px; left: -100px;"></div>
  <div class="orb orb--green" style="top: 200px; right: -80px;"></div>
  <div class="container">
    <div class="ai-header reveal">
      <div class="section-label">AI நுண்ணறிவு</div>
      <h2 class="section-heading">
        <span class="hindi" style="display:block; color:var(--saffron); font-size:clamp(22px,2.8vw,32px); font-weight:500; margin-bottom:8px;">சமூகதார் AI ஜோ நீங்கள்</span>
        கண்காணிப்பு மட்டுமல்ல - உங்கள் கடையின் முதல் டிஜிட்டல் மூளை
      </h2>
      <p class="section-sub">Samaan-Bolநீங்கள் சொல்வதை மட்டும் பதிவு செய்யவில்லை. இது உங்கள் வடிவங்களைக் கற்றுக்கொள்கிறது, உங்கள் தேவைகளை முன்னறிவிக்கிறது மற்றும் சிக்கல்கள் ஏற்படும் முன் உங்களை எச்சரிக்கிறது.</p>
    </div>

    <div class="ai-blocks">
      <!-- Predictive Stock -->
      <div class="ai-block reveal">
        <div class="ai-block-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg></div>
        <div class="ai-block-tag ai-block-tag--predict">முன்கணிப்பு பங்கு</div>
        <h3>நீங்கள் செய்வதற்கு முன் உங்களுக்கு என்ன தேவை என்று தெரியும்</h3>
        <p>தினசரி, வாராந்திர, பருவகால - உங்கள் விற்பனை முறைகளை AI கற்றுக்கொள்கிறது. பொருட்கள் எப்போது குறையும் என்பதை இது முன்னறிவிக்கிறது மற்றும் நாட்களுக்கு முன்பே மறுதொடக்கம் செய்ய பரிந்துரைக்கிறது.</p>
        <div class="ai-voice-example">
          <div class="voice-bubble">
            <div class="voice-bubble-avatar voice-bubble-avatar--ai"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg></div>
            <div class="voice-bubble-content">
              <div class="hindi">"ஆப்கா அட்டா 3 தின் மே கதம் ஹோ சக்தா ஹை — ஹஃப்தே கி பிக்ரி கே ஹிசாப் சே"</div>
              <div class="translation">வாராந்திர விற்பனையின் அடிப்படையில் உங்கள் அட்டா இன்னும் 3 நாட்களில் தீர்ந்துவிடக்கூடும்</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Smart Alerts -->
      <div class="ai-block reveal">
        <div class="ai-block-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg></div>
        <div class="ai-block-tag ai-block-tag--alert">ஸ்மார்ட் எச்சரிக்கைகள்</div>
        <h3>உங்கள் மொழியில் பேசும் விழிப்பூட்டல்கள்</h3>
        <p>காலாவதி எச்சரிக்கைகள், மெதுவாக நகரும் பங்கு கண்டறிதல் மற்றும் விலை ஏற்ற இறக்க எச்சரிக்கைகள் — உங்களுக்கு விருப்பமான மொழியில் குரல் அறிவிப்புகளாக வழங்கப்படும்.</p>
        <div class="ai-voice-example">
          <div class="voice-bubble">
            <div class="voice-bubble-avatar voice-bubble-avatar--ai"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg></div>
            <div class="voice-bubble-content">
              <div class="hindi">"Parle-G கே 12 பாக்கெட் 5 தின் மெய்ன் காலாவதி ஹோ ரஹே ஹைன் - தள்ளுபடி லகானா சாஹெய்ன்?"</div>
              <div class="translation">12Parle-Gபாக்கெட்டுகள் 5 நாட்களில் காலாவதியாகும் — தள்ளுபடியைச் சேர்க்க வேண்டுமா?</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Voice Analytics -->
      <div class="ai-block reveal">
        <div class="ai-block-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg></div>
        <div class="ai-block-tag ai-block-tag--insight">குரல் பகுப்பாய்வு</div>
        <h3>உங்கள் கடையில் ஒரு கேள்வியைக் கேளுங்கள் - அது பதிலளிக்கும்</h3>
        <p>உங்கள் வணிகத்தைப் பற்றி இயற்கையான மொழியில் எதையும் கேளுங்கள். பேச்சு பதில்கள் மற்றும் திரையில் உள்ள தரவுகளுடன் AI பதிலளிக்கிறது.</p>
        <div class="ai-voice-example">
          <div class="voice-bubble">
            <div class="voice-bubble-avatar voice-bubble-avatar--user"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>
            <div class="voice-bubble-content">
              <div class="hindi">"பிச்லே ஹஃப்தே சப்சே சியாதா க்யா பிகா?"</div>
              <div class="translation">கடந்த வாரம் அதிகம் விற்றது எது?</div>
            </div>
          </div>
          <div class="voice-bubble">
            <div class="voice-bubble-avatar voice-bubble-avatar--ai"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg></div>
            <div class="voice-bubble-content">
              <div class="hindi">"பிச்லே ஹஃப்தே சப்சே ஜியாதா சாவல் பிகா - 48 கிலோ"</div>
              <div class="translation">கடந்த வாரம் அரிசி அதிகம் விற்பனையானது - 48 கிலோ</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Team Intelligence -->
      <div class="ai-block reveal">
        <div class="ai-block-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>
        <div class="ai-block-tag ai-block-tag--team">குழு உளவுத்துறை</div>
        <h3>உங்கள் குழு என்ன செய்கிறது என்பதை அறிந்து கொள்ளுங்கள்</h3>
        <p>AI-இயங்கும் ஒழுங்கின்மை கண்டறிதல் அசாதாரண சரக்கு மாற்றங்களைக் கொடியிடுகிறது. யார் எதைப் புதுப்பித்தனர், திருத்தங்கள் தேவையா என்பதை ஸ்மார்ட் சுருக்கங்கள் காட்டுகின்றன.</p>
        <div class="ai-voice-example">
          <div class="voice-bubble">
            <div class="voice-bubble-avatar voice-bubble-avatar--ai"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg></div>
            <div class="voice-bubble-content">
              <div class="hindi">"ஆஜ் ஷாம் 6 பஜே 15 கிலோ சீனி கா ஸ்டாக் காம் ஹுவா - கரீனை சரிபார்க்கவா?"</div>
              <div class="translation">இன்று மாலை 6 மணிக்கு 15 கிலோ சர்க்கரை இருப்பு குறைந்தது - சரிபார்க்க வேண்டுமா?</div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</section>

<!-- ═══ LANGUAGES ═══ -->
<section class="languages-section" id="languages">
  <div class="container">
    <div class="reveal">
      <div class="section-label">பாரதத்திற்காக கட்டப்பட்டது</div>
      <h2 class="section-heading">உங்கள் மொழி. உங்கள் வணிகம். உங்கள் வழி.</h2>
      <p class="section-sub">Samaan-Bolநீங்கள் பேசும் விதத்தைப் பேசுகிறது — சொந்த ஸ்கிரிப்டுகள், பேச்சு வார்த்தைகள் மற்றும் பிராந்திய தயாரிப்பு பெயர்களுக்கான முழு ஆதரவுடன்.</p>
    </div>
    <div class="lang-grid reveal">
      <div class="lang-chip lang-chip--featured">ஹிந்தி <span class="native hindi">हिन्दी</span></div>
      <div class="lang-chip">பெங்காலி <span class="native">বাংলা</span></div>
      <div class="lang-chip">தமிழ் <span class="native">தமிழ்</span></div>
      <div class="lang-chip">தெலுங்கு <span class="native">తెలుగు</span></div>
      <div class="lang-chip">மராத்தி <span class="native">मराठी</span></div>
      <div class="lang-chip">கன்னடம் <span class="native">ಕನ್ನಡ</span></div>
      <div class="lang-chip">குஜராத்தி <span class="native">ગુજરાતી</span></div>
      <div class="lang-chip">மலையாளம் <span class="native">മലയാളം</span></div>
      <div class="lang-chip">பஞ்சாபி <span class="native">ਪੰਜਾਬੀ</span></div>
      <div class="lang-chip">ஒடியா <span class="native">ଓଡ଼ିଆ</span></div>
      <div class="lang-chip">ஆங்கிலம் <span class="native">ஆங்கிலம்</span></div>
    </div>
  </div>
</section>

<!-- ═══ COMPARISON ═══ -->
<section class="comparison">
  <div class="container">
    <div class="reveal">
      <div class="section-label">ஏன் Samaan-Bol</div>
      <h2 class="section-heading">இரவும் பகலும் வித்தியாசம்</h2>
    </div>
    <div class="comparison-grid reveal">
      <div class="comparison-col comparison-col--without">
        <h3>Samaan-Bol இல்லாமல்</h3>
        <p class="comparison-col-subtitle">பங்குகளை நிர்வகிப்பதற்கான பழைய வழி</p>
        <ul class="comparison-list">
          <li><span class="icon">✕</span> கைமுறையாக எண்ணுதல், பேனா மற்றும் காகிதப் பதிவுகள்</li>
          <li><span class="icon">✕</span> ஒரு வாடிக்கையாளர் கேட்கும் போது ஸ்டாக்அவுட்கள் கண்டுபிடிக்கப்பட்டன</li>
          <li><span class="icon">✕</span> எவ்வளவு மறுவரிசைப்படுத்துவது என்று யூகிக்கிறேன்</li>
          <li><span class="icon">✕</span> என்ன காலாவதியாகிறது அல்லது மெதுவாக நகரும் என்று தெரியவில்லை</li>
          <li><span class="icon">✕</span> ஊழியர்கள் என்ன செய்கிறார்கள் என்பதைக் கண்காணிக்க முடியவில்லை</li>
          <li><span class="icon">✕</span> விழா ஏற்பாடுகள் கடைசி நிமிட குழப்பம்</li>
        </ul>
      </div>
      <div class="comparison-col comparison-col--with">
        <h3>Samaan-Bolஉடன்</h3>
        <p class="comparison-col-subtitle">AI-இயக்கப்படும், குரல்-முதலில், சிரமமின்றி</p>
        <ul class="comparison-list">
          <li><span class="icon">✓</span> குரல் புதுப்பிப்புகள் — சொல்லுங்கள், அது முடிந்தது</li>
          <li><span class="icon">✓</span> ஸ்டாக்அவுட்டுக்கு நாட்களுக்கு முன் முன்னறிவிப்பு எச்சரிக்கைகள்</li>
          <li><span class="icon">✓</span> உண்மையான தரவுகளின் அடிப்படையில் AI-உருவாக்கப்பட்ட வாங்குதல் பட்டியல்கள்</li>
          <li><span class="icon">✓</span> காலாவதி மற்றும் மெதுவாக நகரும் கண்டறிதல் உள்ளமைந்துள்ளது</li>
          <li><span class="icon">✓</span> ஒழுங்கின்மை கண்டறிதலுடன் முழு தணிக்கை பாதை</li>
          <li><span class="icon">✓</span> திருவிழா முன்னறிவிப்பு 2 வாரங்களுக்கு முன்பே தொடங்குகிறது</li>
        </ul>
      </div>
    </div>
  </div>
</section>

<!-- ═══ TESTIMONIALS ═══ -->
<section class="testimonials">
  <div class="container">
    <div class="reveal">
      <div class="section-label">ஆரம்பகால தத்தெடுப்பாளர்கள்</div>
      <h2 class="section-heading">இந்தியா முழுவதும் பீட்டா சோதனையாளர்களால் விரும்பப்பட்டது</h2>
    </div>
    <div class="testimonials-grid">
      <div class="testimonial reveal reveal-delay-1">
        <div class="testimonial-stars">★★★★★</div>
        <blockquote>பீட்டா சோதனை மெய்ன் முயற்சி கியா — பெஹ்லே தின் சே பதிவு இசைக்குழு. அப் பாஸ் போல் தேதி ஹூன் அவுர் சப் அப்டேட் ஹோ ஜாதா ஹை. இத்னா ஆசன் ஹோகா சோச்சா நஹி தா.</blockquote>
        <div class="testimonial-author">மீனா சர்மா</div>
        <div class="testimonial-role">பீட்டா சோதனையாளர் · கிரானா ஸ்டோர்Owner, ஜெய்ப்பூர்</div>
      </div>
      <div class="testimonial reveal reveal-delay-2">
        <div class="testimonial-stars">★★★★★</div>
        <blockquote>ஜனவரி மெய்ன் பீட்டா ஜாயின் கியா தா - ஹோலி கே லியே ஏஐ நே ஏற்கனவே படயா கி க்யா ஸ்டாக் பதனா ஹை. அபி சே இத்னா ஸ்மார்ட் ஹை, சோச்சியே லாஞ்ச் கே பாத் க்யா ஹோகா.</blockquote>
        <div class="testimonial-author">அர்ஜுன் பட்டேல்</div>
        <div class="testimonial-role">பீட்டா சோதனையாளர் · பொது அங்காடி, அகமதாபாத்</div>
      </div>
      <div class="testimonial reveal reveal-delay-3">
        <div class="testimonial-stars">★★★★★</div>
        <blockquote>பங்களா மே போல்டே ஹாய் சமாஜ் கயா - பீட்டா டெஸ்டிங்-இ டெக்லாம் ஜெ அமர் பாஷா தே காஜ் கோரே. ஊழியர்கள் ரா ஓ குப் கோர்டே பார்ச்சேவை எளிதாகப் பயன்படுத்துகிறார்கள்.</blockquote>
        <div class="testimonial-author">ரினா தாஸ்</div>
        <div class="testimonial-role">பீட்டா சோதனையாளர் · ஜவுளி கடை, கொல்கத்தா</div>
      </div>
    </div>
  </div>
</section>

<!-- ═══ CTA ═══ -->
<section class="cta-section" id="download">
  <div class="container">
    <div class="reveal">
      <div class="section-label">இலவசமாக தொடங்குங்கள்</div>
      <h2 class="section-heading">
        <span class="hindi" style="display:block; color:var(--saffron); font-size:clamp(20px,2.4vw,28px); font-weight:500; margin-bottom:8px;">आज ही शुरू करें</span>
        உங்கள் கடை நோட்புக்கை விட சிறந்தது
      </h2>
      <p class="section-sub">தொடங்க இலவசம். 2 நிமிடங்களில் அமைக்கவும். கடன் அட்டை தேவையில்லை.</p>
      <div class="cta-actions">
        <a href="https://apps.apple.com/in/app/samaan-bol/id6759739444" class="store-badge">
          <div class="store-badge-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg></div>
          <div class="store-badge-text">
            <div class="store-badge-label">இல் பதிவிறக்கவும்</div>
            <div class="store-badge-name">App Store</div>
          </div>
        </a>
        <a href="#" class="store-badge" style="position:relative; opacity:0.65; pointer-events:none;">
          <div class="store-badge-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.807 1.626a1 1 0 0 1 0 1.73l-2.808 1.626L15.206 12l2.492-2.491zM5.864 2.658L16.8 8.99l-2.3 2.3-8.636-8.632z"/></svg></div>
          <div class="store-badge-text">
            <div class="store-badge-label">அதைப் பெறுங்கள்</div>
            <div class="store-badge-name">Google Play</div>
          </div>
          <span style="position:absolute; top:-10px; right:-10px; background:var(--saffron); color:#fff; font-size:11px; font-weight:700; padding:3px 10px; border-radius:20px; letter-spacing:0.5px; text-transform:uppercase;">விரைவில்</span>
        </a>
      </div>
    </div>
  </div>
</section>

<!-- ═══ FOOTER ═══ -->
<footer>
  <div class="container">
    <div class="footer-grid">
      <div class="footer-brand">
        <a href="#" class="logo">
          <div class="logo-mark"><svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><defs><mask id="stencil-footer"><rect x="0" y="0" width="100" height="100" fill="white"/><rect x="24" y="18" width="52" height="8" rx="4" fill="black"/><rect x="38" y="18" width="24" height="36" rx="12" fill="black"/><path d="M 28 42 A 22 22 0 0 0 72 42" fill="none" stroke="black" stroke-width="8" stroke-linecap="round"/><rect x="46" y="72" width="8" height="10" rx="4" fill="black"/><rect x="36" y="32" width="28" height="4" fill="white"/><rect x="36" y="44" width="28" height="4" fill="white"/></mask></defs><circle cx="50" cy="50" r="50" fill="#ea580c" mask="url(#stencil-footer)"/></svg></div>
          <div class="logo-text">சமன்<span>போல்</span></div>
        </a>
        <p>குரல்-முதல் AI சரக்கு மேலாண்மை, இந்திய சில்லறை வணிகத்தின் இதயத்திற்காக கட்டப்பட்டது.</p>
      </div>
      <div class="footer-col">
        <h4>தயாரிப்பு</h4>
        <ul>
          <li><a href="#features">அம்சங்கள்</a></li>
          <li><a href="#ai">AI நுண்ணறிவு</a></li>
          <li><a href="#languages">மொழிகள்</a></li>
          <li><a href="#">விலை நிர்ணயம்</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>நிறுவனம்</h4>
        <ul>
          <li><a href="#">பற்றி</a></li>
          <li><a href="#">வலைப்பதிவு</a></li>
          <li><a href="#">தொழில்</a></li>
          <li><a href="#">தொடர்பு கொள்ளவும்</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>ஆதரவு</h4>
        <ul>
          <li><a href="#">உதவி மையம்</a></li>
          <li><a href="/privacy-policy">தனியுரிமைக் கொள்கை</a></li>
          <li><a href="/terms-of-service">சேவை விதிமுறைகள்</a></li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <span>© 2026 Samaan-Bol. அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை.</span>
      <span class="made-in-india">இந்தியாவில் ♥ உடன் தயாரிக்கப்பட்டது 🇮🇳</span>
    </div>
  </div>
</footer>`,
    privacy: `<div class="reading-progress" id="readingProgress"></div>

  <div class="container">
    <a href="/" class="back">← வீட்டிற்குத் திரும்பு</a>
    <h1>தனியுரிமைக் கொள்கை</h1>
    <p class="effective">நடைமுறைக்கு வரும் தேதி: பிப்ரவரி 23, 2026</p>

    <nav class="toc">
      <h3>உள்ளடக்கம்</h3>
      <ol>
        <li><a href="#s1">நாங்கள் சேகரிக்கும் தகவல்</a></li>
        <li><a href="#s2">உங்கள் தகவலை நாங்கள் எவ்வாறு பயன்படுத்துகிறோம்</a></li>
        <li><a href="#s3">மூன்றாம் தரப்பு சேவைகள்</a></li>
        <li><a href="#s4">தரவு சேமிப்பு & பாதுகாப்பு</a></li>
        <li><a href="#s5">தரவு வைத்திருத்தல்</a></li>
        <li><a href="#s6">கணக்கு நீக்கம்</a></li>
        <li><a href="#s7">கடைகளுக்குள் தரவுப் பகிர்வு</a></li>
        <li><a href="#s8">குழந்தைகளின் தனியுரிமை</a></li>
        <li><a href="#s9">உங்கள் உரிமைகள்</a></li>
        <li><a href="#s10">இந்தக் கொள்கையில் மாற்றங்கள்</a></li>
        <li><a href="#s11">எங்களை தொடர்பு கொள்ளவும்</a></li>
      </ol>
    </nav>

    <p>Samaan-Bol ("நாங்கள்", "எங்கள்" அல்லது "ஆப்") என்பது இந்திய சில்லறை வணிகங்களுக்காக வடிவமைக்கப்பட்ட குரல்-முதல் கூட்டு சரக்கு மேலாண்மை பயன்பாடாகும். இந்தத் தனியுரிமைக் கொள்கை, நாங்கள் என்ன தகவல்களைச் சேகரிக்கிறோம், அதை எப்படிப் பயன்படுத்துகிறோம், யாருடன் பகிர்கிறோம், உங்கள் தரவு தொடர்பான உங்கள் உரிமைகள் ஆகியவற்றை விளக்குகிறது.</p>

    <p>Samaan-Bolஐப் பயன்படுத்துவதன் மூலம், இந்தக் கொள்கையில் விவரிக்கப்பட்டுள்ளபடி தகவல்களைச் சேகரிப்பதற்கும் பயன்படுத்துவதற்கும் ஒப்புக்கொள்கிறீர்கள்.</p>

    <details open id="s1">
      <summary><h2>1. நாங்கள் சேகரிக்கும் தகவல்</h2></summary>
      <div class="section-content">
        <h3>1.1 கணக்கு தகவல்</h3>
        <p>நீங்கள் கணக்கை உருவாக்கும்போது, ​​நாங்கள் சேகரிக்கிறோம்:</p>
        <ul>
          <li><strong>முழுப் பெயர்</strong> - பதிவு செய்யும் போது வழங்கப்பட்டது</li>
          <li><strong>Email முகவரி</strong> - அங்கீகாரம் மற்றும் கணக்கை மீட்டெடுக்க பயன்படுகிறது</li>
          <li><strong>கடவுச்சொல்</strong> - எங்கள் அங்கீகார வழங்குநரால் குறியாக்கம் செய்யப்பட்டு நிர்வகிக்கப்படுகிறது (Clerk)</li>
        </ul>
        <p>நீங்கள்Googleஅல்லது Apple மூலம் உள்நுழைந்தால்,OAuthவழங்குநரிடமிருந்து உங்கள் பெயரையும் மின்னஞ்சலையும் பெறுவோம். உங்களின் Google அல்லது Apple கணக்கு கடவுச்சொல்லை நாங்கள் அணுகவில்லை.</p>

        <h3>1.2 குரல் பதிவுகள்</h3>
        <div class="highlight">
          <p><strong>முக்கியமானது:</strong> குரல் பதிவுகள் நிகழ்நேரத்தில் செயலாக்கப்படுகின்றன <strong>நிரந்தரமாக சேமிக்கப்படவில்லை</strong>. பேச்சு அங்கீகாரம் மற்றும் இயல்பான மொழிப் புரிதலுக்காகSarvam AIமூலம் எங்கள் சேவையகத்திற்கு ஆடியோ அனுப்பப்படுகிறது, மேலும் செயலாக்கத்திற்குப் பிறகு உடனடியாக நிராகரிக்கப்படும். இதன் விளைவாக வரும் உரை டிரான்ஸ்கிரிப்ட் மட்டுமே உங்கள் குறிப்புக்காக உங்கள் தணிக்கைப் பதிவில் சேமிக்கப்படும்.</p>
        </div>
        <ul>
          <li>உங்கள் சாதனத்தில் ஆடியோ பதிவு செய்யப்பட்டுள்ளது (WAVவடிவம்iOS, M4A Android)</li>
          <li>பதிவுகள் அதிகபட்சம் 30 வினாடிகளுக்கு மட்டுமே</li>
          <li>பாதுகாப்பான இணைப்பு மூலம் குறியிடப்பட்ட தரவாக ஆடியோ எங்கள் சர்வருக்கு அனுப்பப்படும்</li>
          <li>செயலாக்கத்திற்குப் பிறகு, ஆடியோ தரவு சர்வர் நினைவகத்திலிருந்து நிராகரிக்கப்படும்</li>
          <li>உரை டிரான்ஸ்கிரிப்டுகள் உங்கள் கடையின் தணிக்கைப் பதிவில் சேமிக்கப்படும், எனவே நீங்கள் கடந்த கால செயல்களை மதிப்பாய்வு செய்யலாம்</li>
        </ul>

        <h3>1.3 சரக்கு & வணிகத் தரவு</h3>
        <p>நீங்கள் ஆப்ஸைப் பயன்படுத்தும்போது, ​​நீங்கள் உருவாக்கும் வணிகத் தரவைச் சேமிப்போம்:</p>
        <ul>
          <li>கடைத் தகவல் (பெயர், வகை, விருப்பமான மொழி)</li>
          <li>தயாரிப்பு பட்டியல் (பெயர்கள், பார்கோடுகள், வகைகள், அலகுகள், விலைகள்)</li>
          <li>பங்கு அளவுகள், தொகுதி எண்கள், கொள்முதல் தேதிகள், காலாவதி தேதிகள், சப்ளையர் பெயர்கள்</li>
          <li>பட்டியல் பொருட்கள் மற்றும் குறிப்புகளை வாங்கவும்</li>
          <li>சரக்கு மாற்றங்களை பதிவு செய்யும் தணிக்கை பதிவுகள் (செயல் வகை, பயனர், நேர முத்திரை, டிரான்ஸ்கிரிப்ட், நம்பிக்கை மதிப்பெண்)</li>
        </ul>

        <h3>1.4 பயனர் விருப்பத்தேர்வுகள்</h3>
        <ul>
          <li>பயன்பாட்டு மொழி மற்றும் குரல் மொழி தேர்வு</li>
          <li>குரல் கருத்து விருப்பம் (ஆன்/ஆஃப்)</li>
          <li>காட்சி அமைப்புகள் (உயர் மாறுபாடு முறை, உரை அளவு)</li>
          <li>இயல்புநிலை அளவீட்டு அலகு</li>
          <li>அறிவிப்பு விருப்பத்தேர்வுகள்</li>
        </ul>

        <h3>1.5 ஷாப் உறுப்பினர் தரவு</h3>
        <ul>
          <li>ஒவ்வொரு கடையிலும் உங்கள் பங்கு (Owner,Manager, அல்லது Helper)</li>
          <li>குழு ஒத்துழைப்புக்காக உருவாக்கப்பட்ட அழைப்புக் குறியீடுகள்</li>
          <li>கடைகளில் கடைசியாக செயல்பட்ட நேர முத்திரைகள்</li>
        </ul>

        <h3>1.6 சாதனம் மற்றும் கண்டறியும் தரவு</h3>
        <p>உற்பத்தி உருவாக்கங்களில், விபத்து அறிக்கையிடலுக்குSentryஐப் பயன்படுத்துகிறோம். இது சேகரிக்கிறது:</p>
        <ul>
          <li>சாதன வகை, இயக்க முறைமை மற்றும் பயன்பாட்டின் பதிப்பு</li>
          <li>செயலிழப்பு அறிக்கைகள் மற்றும் பிழை அடுக்கு தடயங்கள்</li>
          <li>செயல்திறன் தரவு (20% அமர்வுகளில் மாதிரி)</li>
        </ul>
        <p>டெவலப்மென்ட் பில்ட்களில் செயலிழப்பு அறிக்கையிடல் முடக்கப்பட்டுள்ளது மற்றும் நாங்கள் விண்ணப்பிக்கும் மாதிரி விகிதத்தால் குறைக்கப்படலாம்.</p>
      </div>
    </details>

    <details id="s2">
      <summary><h2>2. உங்கள் தகவலை நாங்கள் எவ்வாறு பயன்படுத்துகிறோம்</h2></summary>
      <div class="section-content">
        <ul>
          <li><strong>சேவையை வழங்கவும்:</strong> குரல் கட்டளைகளைச் செயலாக்கவும், சரக்குகளை நிர்வகிக்கவும் மற்றும் உங்கள் குழு முழுவதும் தரவை ஒத்திசைக்கவும்</li>
          <li><strong>அங்கீகாரம்:</strong> உங்கள் அடையாளத்தைச் சரிபார்த்து, பாதுகாப்பான அமர்வுகளை நிர்வகிக்கவும்</li>
          <li><strong>தணிக்கை பாதை:</strong> பொறுப்பு மற்றும் மதிப்பாய்வுக்கான சரக்கு மாற்றங்களின் பதிவை பராமரிக்கவும்</li>
          <li><strong>சேவையை மேம்படுத்த:</strong> அநாமதேய பிழை அறிக்கைகள் மூலம் பிழைகள் மற்றும் செயலிழப்புகளைக் கண்டறியவும்</li>
          <li><strong>தொடர்பு:</strong> அத்தியாவசிய கணக்கு தொடர்பான அறிவிப்புகளை அனுப்பவும் (எ.கா., கடவுச்சொல் மீட்டமைப்புகள்)</li>
        </ul>
        <p>நாங்கள் செய்கிறோம் <strong>இல்லை</strong> உங்கள் தரவை விளம்பரத்திற்காக பயன்படுத்தவும், நாங்கள் செய்கிறோம் <strong>இல்லை</strong> உங்கள் தனிப்பட்ட தகவல்களை மூன்றாம் தரப்பினருக்கு விற்கவும்.</p>
      </div>
    </details>

    <details id="s3">
      <summary><h2>3. மூன்றாம் தரப்பு சேவைகள்</h2></summary>
      <div class="section-content">
        <p>பயன்பாட்டை இயக்க பின்வரும் மூன்றாம் தரப்பு சேவைகளைப் பயன்படுத்துகிறோம்:</p>
        <table>
          <thead>
            <tr>
              <th>சேவை</th>
              <th>நோக்கம்</th>
              <th>தரவு பகிரப்பட்டது</th>
              <th>தனியுரிமைக் கொள்கை</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Clerk</strong></td>
              <td>அங்கீகாரம் மற்றும் அமர்வு மேலாண்மை</td>
              <td>Email, பெயர், OAuth டோக்கன்கள், அமர்வு தரவு</td>
              <td><a href="https://clerk.com/legal/privacy" target="_blank" rel="noopener">எழுத்தர்.com/legal/privacy</a></td>
            </tr>
            <tr>
              <td><strong>Sarvam AI</strong></td>
              <td>குரல் செயலாக்கம் (உரையிலிருந்து உரை, இயற்கை மொழி செயலாக்கம், உரையிலிருந்து பேச்சு)</td>
              <td>ஆடியோ பதிவுகள், டிரான்ஸ்கிரிப்ட் உரை, மொழி குறியீடு</td>
              <td><a href="https://www.sarvam.ai/privacy-policy" target="_blank" rel="noopener">sarvam.ai/privacy-policy</a></td>
            </tr>
            <tr>
              <td><strong>Neon</strong></td>
              <td>தரவுத்தள ஹோஸ்டிங் (PostgreSQL)</td>
              <td>அனைத்து நீடித்த பயன்பாட்டுத் தரவு</td>
              <td><a href="https://neon.tech/privacy-policy" target="_blank" rel="noopener">neon.tech/privacy-policy</a></td>
            </tr>
            <tr>
              <td><strong>Sentry</strong></td>
              <td>கண்காணிப்பு மற்றும் செயலிழப்பு அறிக்கையிடல் பிழை</td>
              <td>செயலிழப்பு அறிக்கைகள், சாதனத் தகவல் (தயாரிப்பு மட்டும்)</td>
              <td><a href="https://sentry.io/privacy/" target="_blank" rel="noopener">sentry.io/privacy</a></td>
            </tr>
          </tbody>
        </table>
        <p>ஒவ்வொரு மூன்றாம் தரப்பு சேவையும் அவற்றின் சொந்த தனியுரிமைக் கொள்கையின்படி தரவை செயலாக்குகிறது. அவர்களின் கொள்கைகளை மதிப்பாய்வு செய்ய நாங்கள் உங்களை ஊக்குவிக்கிறோம்.</p>
      </div>
    </details>

    <details id="s4">
      <summary><h2>4. தரவு சேமிப்பு & பாதுகாப்பு</h2></summary>
      <div class="section-content">
        <ul>
          <li>பயன்பாட்டுத் தரவு Neon PostgreSQL தரவுத்தளத்தில் SSL/TLS குறியாக்கத்துடன் பரிமாற்றத்தில் சேமிக்கப்படுகிறது</li>
          <li>பாதுகாப்பான சேமிப்பகத்தைப் பயன்படுத்தி அங்கீகார டோக்கன்கள் உங்கள் சாதனத்தில் சேமிக்கப்படும் (iOSKeychain / Android Keystore)</li>
          <li>APIதொடர்புHTTPSகுறியாக்கத்தைப் பயன்படுத்துகிறது</li>
          <li>துஷ்பிரயோகத்தைத் தடுக்க, உணர்திறன் இறுதிப்புள்ளிகள் விகிதத்தில் வரையறுக்கப்பட்டுள்ளன</li>
          <li>கடவுச்சொற்கள்Clerkமூலம் ஹாஷ் செய்யப்பட்டு நிர்வகிக்கப்படுகின்றன - நாங்கள் ஒருபோதும் எளிய உரை கடவுச்சொற்களை சேமிப்பதில்லை</li>
        </ul>
      </div>
    </details>

    <details id="s5">
      <summary><h2>5. தரவு வைத்திருத்தல்</h2></summary>
      <div class="section-content">
        <ul>
          <li><strong>குரல் ஆடியோ:</strong> எபிமரல் - நினைவகத்தில் செயலாக்கப்பட்டு உடனடியாக நிராகரிக்கப்பட்டது. எங்கள் சேவையகங்களில் ஒருபோதும் சேமிக்கப்படவில்லை.</li>
          <li><strong>டிரான்ஸ்கிரிப்டுகள் & தணிக்கை பதிவுகள்:</strong> உங்கள் கணக்கு செயலில் இருக்கும் வரை உங்கள் குறிப்புக்காக சேமிக்கப்படும்.</li>
          <li><strong>இருப்புத் தரவு:</strong> உங்கள் கணக்கு செயலில் இருக்கும் வரை சேமிக்கப்படும்.</li>
          <li><strong>கணக்கு தரவு:</strong> உங்கள் கணக்கை நீக்கும் வரை தக்கவைக்கப்படும்.</li>
          <li><strong>விபத்து அறிக்கைகள்:</strong>Sentryஇன் தரவுத் தக்கவைப்புக் கொள்கையின்படி (பொதுவாக 90 நாட்கள்) தக்கவைக்கப்படுகிறது.</li>
        </ul>
      </div>
    </details>

    <details id="s6">
      <summary><h2>6. கணக்கு நீக்கம்</h2></summary>
      <div class="section-content">
        <p>நீங்கள் எந்த நேரத்திலும் உங்கள் கணக்கை நீக்கலாம் <strong>Settings > Delete Account</strong> பயன்பாட்டிற்குள். உங்கள் கணக்கை நீக்கும் போது:</p>
        <ul>
          <li>அனைத்து தயாரிப்புகள், சரக்குகள், தொகுப்புகள், வாங்குதல் பட்டியல்கள் மற்றும் AI கணிப்புகள் உட்பட உங்களுக்குச் சொந்தமான அனைத்து கடைகளும் நிரந்தரமாக நீக்கப்படும்.</li>
          <li>உங்கள் தணிக்கை பதிவுகள் மற்றும் விருப்பத்தேர்வுகள் அனைத்தும் நிரந்தரமாக நீக்கப்படும்</li>
          <li>பிற பயனர்களின் கடைகளில் உள்ள உங்கள் மெம்பர்ஷிப்கள் அகற்றப்பட்டன</li>
          <li>Clerkஉடன் உங்கள் அங்கீகாரக் கணக்கு நிரந்தரமாக நீக்கப்பட்டது</li>
        </ul>
        <p><strong>இந்த நடவடிக்கை மீள முடியாதது.</strong> நீக்கப்பட்டவுடன், உங்கள் தரவை மீட்டெடுக்க முடியாது.</p>
      </div>
    </details>

    <details id="s7">
      <summary><h2>7. கடைகளுக்குள் தரவு பகிர்வு</h2></summary>
      <div class="section-content">
        <p>Samaan-Bolஒரு கூட்டுக் கருவி. நீங்கள் ஒரு கடையில் உறுப்பினராக இருக்கும்போது:</p>
        <ul>
          <li>அனைத்து கடை உறுப்பினர்களும் (Owner,Manager, Helperகள்) கடையின் இருப்புத் தரவு, தயாரிப்பு பட்டியல் மற்றும் தணிக்கைப் பதிவுகளைப் பார்க்கலாம்</li>
          <li>உங்கள் பெயர், பங்கு மற்றும் செயல்பாட்டு நேர முத்திரைகள் மற்ற கடை உறுப்பினர்களுக்குத் தெரியும்</li>
          <li>Ownerகள் தங்கள் கடைக்கான உறுப்பினர் மற்றும் அணுகலை நிர்வகிக்க முடியும்</li>
        </ul>
        <p>நீங்கள் உறுப்பினராக இல்லாத கடைகளுடனோ அல்லது தொடர்பில்லாத மூன்றாம் தரப்பினருடனோ உங்கள் தரவைப் பகிர மாட்டோம்.</p>
      </div>
    </details>

    <details id="s8">
      <summary><h2>8. குழந்தைகளின் தனியுரிமை</h2></summary>
      <div class="section-content">
        <p>Samaan-Bolவயதுக்குட்பட்ட குழந்தைகளால் பயன்படுத்தப்படவில்லை. 13 வயதுக்குட்பட்ட குழந்தைகளிடமிருந்து தனிப்பட்ட தகவல்களை நாங்கள் தெரிந்தே சேகரிப்பதில்லை. ஒரு குழந்தை எங்களுக்கு தனிப்பட்ட தகவலை வழங்கியதாக நீங்கள் நம்பினால், எங்களைத் தொடர்பு கொள்ளவும், உடனடியாக அதை நீக்குவோம்.</p>
      </div>
    </details>

    <details id="s9">
      <summary><h2>9. உங்கள் உரிமைகள்</h2></summary>
      <div class="section-content">
        <p>உங்களுக்கு உரிமை உண்டு:</p>
        <ul>
          <li><strong>உங்கள் தரவை அணுகவும்:</strong> ஆப்ஸில் உங்கள் இருப்பு, தணிக்கை பதிவுகள் மற்றும் விருப்பத்தேர்வுகளைப் பார்க்கலாம்</li>
          <li><strong>உங்கள் தரவை நீக்கவும்:</strong> அமைப்புகளில் கணக்கு நீக்குதல் அம்சத்தைப் பயன்படுத்தவும்</li>
          <li><strong>கட்டுப்பாட்டு விருப்பத்தேர்வுகள்:</strong> எந்த நேரத்திலும் உங்கள் மொழி, காட்சி மற்றும் குரல் அமைப்புகளை மாற்றவும்</li>
          <li><strong>கடைகளில் இருந்து எடுக்க:</strong> நீங்கள் உறுப்பினராக உள்ள எந்தக் கடையையும் விட்டுவிடுங்கள்</li>
        </ul>
      </div>
    </details>

    <details id="s10">
      <summary><h2>10. இந்தக் கொள்கையில் மாற்றங்கள்</h2></summary>
      <div class="section-content">
        <p>இந்த தனியுரிமைக் கொள்கையை நாங்கள் அவ்வப்போது புதுப்பிக்கலாம். நாங்கள் அவ்வாறு செய்யும்போது, ​​இந்தப் பக்கத்தின் மேலே உள்ள "செயல்படும் தேதியை" புதுப்பிப்போம். இந்தக் கொள்கையை அவ்வப்போது மதிப்பாய்வு செய்யும்படி உங்களை ஊக்குவிக்கிறோம். மாற்றங்களுக்குப் பிறகு பயன்பாட்டைத் தொடர்ந்து பயன்படுத்துவது புதுப்பிக்கப்பட்ட கொள்கையை ஏற்றுக்கொள்வதைக் குறிக்கிறது.</p>
      </div>
    </details>

    <details id="s11">
      <summary><h2>11. எங்களை தொடர்பு கொள்ளவும்</h2></summary>
      <div class="section-content">
        <p>இந்தத் தனியுரிமைக் கொள்கை அல்லது உங்கள் தரவு குறித்து ஏதேனும் கேள்விகள் இருந்தால், தயவுசெய்து எங்களை இங்கு தொடர்பு கொள்ளவும்:</p>
        <p><strong>Email:</strong> <a href="mailto:meetslimshady07@gmail.com">meetslimshady07@gmail.com</a></p>
      </div>
    </details>

    <p class="copyright">© 2026 Samaan-Bol. அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை.</p>
  </div>

  <button class="back-to-top" id="backToTop" aria-label="Back to top">↑</button>`,
    terms: `<div class="reading-progress" id="readingProgress"></div>

  <div class="container">
    <a href="/" class="back">← வீட்டிற்குத் திரும்பு</a>
    <h1>சேவை விதிமுறைகள்</h1>
    <p class="effective">நடைமுறைக்கு வரும் தேதி: பிப்ரவரி 23, 2026</p>

    <nav class="toc">
      <h3>உள்ளடக்கம்</h3>
      <ol>
        <li><a href="#s1">சேவையின் விளக்கம்</a></li>
        <li><a href="#s2">கணக்கு பதிவு</a></li>
        <li><a href="#s3">பயனர் பாத்திரங்கள் & பொறுப்புகள்</a></li>
        <li><a href="#s4">குரல் உள்ளீடு</a></li>
        <li><a href="#s5">ஏற்றுக்கொள்ளக்கூடிய பயன்பாடு</a></li>
        <li><a href="#s6">உங்கள் தரவு</a></li>
        <li><a href="#s7">சேவை கிடைக்கும் தன்மை</a></li>
        <li><a href="#s8">விகித வரம்புகள்</a></li>
        <li><a href="#s9">கணக்கு நிறுத்தம்</a></li>
        <li><a href="#s10">அறிவுசார் சொத்து</a></li>
        <li><a href="#s11">உத்தரவாதங்களின் மறுப்பு</a></li>
        <li><a href="#s12">பொறுப்பு வரம்பு</a></li>
        <li><a href="#s13">இந்த விதிமுறைகளில் மாற்றங்கள்</a></li>
        <li><a href="#s14">ஆளும் சட்டம்</a></li>
        <li><a href="#s15">எங்களை தொடர்பு கொள்ளவும்</a></li>
      </ol>
    </nav>

    <p>Samaan-Bolக்கு வரவேற்கிறோம். இந்த சேவை விதிமுறைகள் ("விதிமுறைகள்")Samaan-Bolமொபைல் பயன்பாடு மற்றும் தொடர்புடைய சேவைகளின் (ஒட்டுமொத்தமாக, "சேவை") உங்கள் பயன்பாட்டை நிர்வகிக்கிறது. கணக்கை உருவாக்குவதன் மூலம் அல்லது சேவையைப் பயன்படுத்துவதன் மூலம், இந்த விதிமுறைகளுக்குக் கட்டுப்படுவதை ஒப்புக்கொள்கிறீர்கள்.</p>

    <details open id="s1">
      <summary><h2>1. சேவையின் விளக்கம்</h2></summary>
      <div class="section-content">
        <p>Samaan-Bolஎன்பது இந்திய சில்லறை வணிகங்களுக்காக வடிவமைக்கப்பட்ட குரல்-முதல் கூட்டு சரக்கு மேலாண்மை பயன்பாடு ஆகும். சேவை உங்களை அனுமதிக்கிறது:</p>
        <ul>
          <li>பல இந்திய மொழிகளில் குரல் கட்டளைகளைப் பயன்படுத்தி தயாரிப்பு சரக்குகளை நிர்வகிக்கவும்</li>
          <li>பங்கு நிலைகள், தொகுதிகள், காலாவதி தேதிகள் மற்றும் கொள்முதல் தகவலைக் கண்காணிக்கவும்</li>
          <li>பங்கு அடிப்படையிலான அணுகல் மூலம் குழு உறுப்பினர்களுடன் ஒத்துழைக்கவும் (Owner,Manager, Helper)</li>
          <li>அனைத்து சரக்கு மாற்றங்களின் தணிக்கை தடங்களைக் காண்க</li>
          <li>வாங்குதல் பட்டியல்களை நிர்வகிக்கவும் மற்றும் பங்கு நிலை விழிப்பூட்டல்களைப் பெறவும்</li>
        </ul>
      </div>
    </details>

    <details id="s2">
      <summary><h2>2. கணக்கு பதிவு</h2></summary>
      <div class="section-content">
        <p>சேவையைப் பயன்படுத்த, துல்லியமான மற்றும் முழுமையான தகவலை வழங்குவதன் மூலம் நீங்கள் ஒரு கணக்கை உருவாக்க வேண்டும். நீங்கள் பொறுப்பு:</p>
        <ul>
          <li>உங்கள் கணக்குச் சான்றுகளின் ரகசியத்தன்மையைப் பேணுதல்</li>
          <li>உங்கள் கணக்கின் கீழ் நடக்கும் அனைத்து செயல்பாடுகளும்</li>
          <li>உங்கள் கணக்கை அங்கீகரிக்காமல் பயன்படுத்தினால் உடனடியாக எங்களுக்குத் தெரிவிக்கவும்</li>
        </ul>
        <p>கணக்கை உருவாக்கி சேவையைப் பயன்படுத்த உங்களுக்கு குறைந்தது 13 வயது இருக்க வேண்டும்.</p>
      </div>
    </details>

    <details id="s3">
      <summary><h2>3. பயனர் பாத்திரங்கள் & பொறுப்புகள்</h2></summary>
      <div class="section-content">
        <p>Samaan-Bolபங்கு அடிப்படையிலான அணுகல் கட்டுப்பாட்டு அமைப்பைப் பயன்படுத்துகிறது:</p>
        <ul>
          <li><strong>Owner:</strong> கடைகளை உருவாக்குகிறது மற்றும் நிர்வகிக்கிறது, குழு உறுப்பினர்களை அழைக்கிறது, அனைத்து கடை தரவு மற்றும் அமைப்புகளுக்கு முழு அணுகல் உள்ளது, மேலும் கடையை நீக்கலாம்</li>
          <li><strong>Manager:</strong> சரக்குகளை நிர்வகிக்கலாம், அறிக்கைகளைப் பார்க்கலாம் மற்றும் கடைக்குள் பெரும்பாலான செயல்பாடுகளைச் செய்யலாம்</li>
          <li><strong>Helper:</strong> அறிவுறுத்தல்களின்படி இருப்பு உருப்படிகளைச் சேர்க்கலாம் மற்றும் அகற்றலாம்</li>
        </ul>
        <p>ஒருOwnerஎன்ற முறையில், உங்கள் கடைக்கான அணுகலையும் அதில் உள்ள தரவையும் நிர்வகிப்பதற்கு நீங்கள் பொறுப்பாவீர்கள். நீங்கள் உறுப்பினர்களை அழைக்கும்போது, ​​அவர்கள் உங்கள் கடையின் இருப்புத் தரவை அணுகுவார்கள்.</p>
      </div>
    </details>

    <details id="s4">
      <summary><h2>4. குரல் உள்ளீடு</h2></summary>
      <div class="section-content">
        <p>சேவையானது மூன்றாம் தரப்பு AI சேவைகளைப் பயன்படுத்தி குரல் கட்டளைகளைச் செயல்படுத்துகிறது. தயவுசெய்து கவனிக்கவும்:</p>
        <ul>
          <li>குரல் பதிவுகள் ஒரு கட்டளைக்கு அதிகபட்சம் 30 வினாடிகள் மட்டுமே</li>
          <li>இந்த சேவை ஆங்கிலம், இந்தி, தமிழ், தெலுங்கு, பெங்காலி, மராத்தி, கன்னடம், குஜராத்தி, மலையாளம் மற்றும் ஹிங்கிலிஷ் உள்ளிட்ட பல மொழிகளை ஆதரிக்கிறது</li>
          <li>குரல் அறிதல் துல்லியம் ஆடியோ தரம், பின்னணி இரைச்சல், உச்சரிப்பு மற்றும் மொழி தெளிவு ஆகியவற்றைப் பொறுத்தது</li>
          <li>துல்லியத்தை உறுதிப்படுத்த, குரல் செயலாக்கப்பட்ட சரக்கு மாற்றங்களை நீங்கள் மதிப்பாய்வு செய்ய வேண்டும்</li>
          <li>குரல் ஆடியோ நிகழ்நேரத்தில் செயலாக்கப்படுகிறது மற்றும் நிரந்தரமாக சேமிக்கப்படாது (எங்களைப் பார்க்கவும் <a href="/privacy-policy">தனியுரிமைக் கொள்கை</a> விவரங்களுக்கு)</li>
        </ul>
      </div>
    </details>

    <details id="s5">
      <summary><h2>5. ஏற்றுக்கொள்ளக்கூடிய பயன்பாடு</h2></summary>
      <div class="section-content">
        <p>வேண்டாம் என்று ஒப்புக்கொள்கிறீர்கள்:</p>
        <ul>
          <li>எந்தவொரு சட்டவிரோத நோக்கத்திற்காகவும் சேவையைப் பயன்படுத்தவும்</li>
          <li>பிற பயனர்களின் கணக்குகள் அல்லது கடைகளுக்கு அங்கீகரிக்கப்படாத அணுகலைப் பெற முயற்சி</li>
          <li>சேவை அல்லது அதன் உள்கட்டமைப்பில் தலையிடுதல் அல்லது சீர்குலைத்தல்</li>
          <li>தலைகீழ்-பொறியாளர், பயன்பாட்டை சிதைக்கவும் அல்லது பிரித்தெடுக்கவும்</li>
          <li>சாதாரண பயன்பாட்டு முறைகளுக்கு அப்பால் சேவையை அணுக தானியங்கு கருவிகளைப் பயன்படுத்தவும்</li>
          <li>அழைப்புக் குறியீடுகளை பொதுவில் அல்லது உங்கள் கடையில் சேர விரும்பாத நபர்களுடன் பகிரவும்</li>
          <li>ஒரு கடைக்குள் உங்கள் அடையாளம் அல்லது பாத்திரத்தை தவறாகக் குறிப்பிடவும்</li>
        </ul>
      </div>
    </details>

    <details id="s6">
      <summary><h2>6. உங்கள் தரவு</h2></summary>
      <div class="section-content">
        <p>சேவையில் நீங்கள் உள்ளிடும் வணிகத் தரவின் உரிமையை நீங்கள் வைத்திருக்கிறீர்கள் (தயாரிப்புத் தகவல், சரக்கு பதிவுகள் போன்றவை). உங்கள் உள்ளடக்கத்தின் உரிமையை நாங்கள் கோரவில்லை.</p>
        <p>சேவையைப் பயன்படுத்துவதன் மூலம், சேவையை வழங்குவதற்கும் மேம்படுத்துவதற்கும் மட்டுமே உங்கள் தரவைச் சேமிக்கவும், செயலாக்கவும், அனுப்பவும் வரையறுக்கப்பட்ட உரிமத்தை எங்களுக்கு வழங்குகிறீர்கள்.</p>
        <p>உங்கள் தரவை நாங்கள் எவ்வாறு சேகரிக்கிறோம், பயன்படுத்துகிறோம் மற்றும் பாதுகாப்போம் என்பது பற்றிய விவரங்களுக்கு, தயவுசெய்து எங்கள் மதிப்பாய்வு செய்யவும் <a href="/privacy-policy">தனியுரிமைக் கொள்கை</a>.</p>
      </div>
    </details>

    <details id="s7">
      <summary><h2>7. சேவை கிடைக்கும் தன்மை</h2></summary>
      <div class="section-content">
        <p>சேவையை எல்லா நேரங்களிலும் கிடைக்கச் செய்ய முயற்சிக்கிறோம், ஆனால் தடையற்ற அணுகலுக்கு நாங்கள் உத்தரவாதம் அளிக்க மாட்டோம். சேவை தற்காலிகமாக கிடைக்காமல் போகலாம்:</p>
        <ul>
          <li>திட்டமிடப்பட்ட பராமரிப்பு அல்லது மேம்படுத்தல்கள்</li>
          <li>எங்கள் கட்டுப்பாட்டிற்கு அப்பாற்பட்ட தொழில்நுட்ப சிக்கல்கள்</li>
          <li>மூன்றாம் தரப்பு சேவை செயலிழப்புகள் (அங்கீகாரம், குரல் செயலாக்கம், தரவுத்தள ஹோஸ்டிங்)</li>
        </ul>
        <p>சேவை செயலிழப்பால் ஏற்படும் இழப்புகளுக்கு நாங்கள் பொறுப்பல்ல.</p>
      </div>
    </details>

    <details id="s8">
      <summary><h2>8. விகித வரம்புகள்</h2></summary>
      <div class="section-content">
        <p>நியாயமான பயன்பாடு மற்றும் சேவை நிலைத்தன்மையை உறுதிப்படுத்த, சேவையானதுAPIகோரிக்கைகளில் கட்டண வரம்புகளை அமல்படுத்துகிறது. இந்த வரம்புகளை மீறினால் உங்கள் கோரிக்கைகள் தற்காலிகமாக தடைபடலாம்.</p>
      </div>
    </details>

    <details id="s9">
      <summary><h2>9. கணக்கு முடித்தல்</h2></summary>
      <div class="section-content">
        <p>நீங்கள் எந்த நேரத்திலும் உங்கள் கணக்கை நீக்கலாம் <strong>Settings > Delete Account</strong> பயன்பாட்டில். கணக்கை நீக்குவது நிரந்தரமானது மற்றும் மாற்ற முடியாதது - உங்கள் கடைகள், இருப்புத் தரவு, தணிக்கைப் பதிவுகள் மற்றும் விருப்பத்தேர்வுகள் அனைத்தும் நிரந்தரமாக அகற்றப்படும்.</p>
        <p>இந்த விதிமுறைகளை மீறும் அல்லது தவறான நடத்தையில் ஈடுபடும் கணக்குகளை இடைநிறுத்தவோ அல்லது நிறுத்தவோ எங்களுக்கு உரிமை உள்ளது.</p>
      </div>
    </details>

    <details id="s10">
      <summary><h2>10. அறிவுசார் சொத்து</h2></summary>
      <div class="section-content">
        <p>Samaan-Bolபயன்பாடு, அதன் வடிவமைப்பு, குறியீடு, பிராண்டிங் மற்றும் ஆவணங்கள் உட்பட, எங்கள் அறிவுசார் சொத்து. எங்கள் எழுத்துப்பூர்வ அனுமதியின்றி விண்ணப்பத்தின் அடிப்படையில் நீங்கள் நகலெடுக்கவோ, மாற்றவோ, விநியோகிக்கவோ அல்லது உருவாக்கவோ முடியாது.</p>
      </div>
    </details>

    <details id="s11">
      <summary><h2>11. உத்தரவாதங்களின் மறுப்பு</h2></summary>
      <div class="section-content">
        <p>இந்தச் சேவையானது "உள்ளபடியே" மற்றும் "கிடைக்கக்கூடியதாக" எந்த விதமான உத்திரவாதங்கள் இல்லாமல், எக்ஸ்பிரஸ் அல்லது மறைமுகமாக வழங்கப்படுகிறது. நாங்கள் குறிப்பாக உத்தரவாதங்களை மறுக்கிறோம்:</p>
        <ul>
          <li>ஒரு குறிப்பிட்ட நோக்கத்திற்காக வணிகத்திறன் அல்லது உடற்பயிற்சி</li>
          <li>குரல் அங்கீகாரத்தின் துல்லியம் அல்லது AI-உருவாக்கிய பரிந்துரைகள்</li>
          <li>தடையற்ற அல்லது பிழை இல்லாத செயல்பாடு</li>
        </ul>
        <p>குரல் அடிப்படையிலான சரக்கு நடவடிக்கைகள் எய்ட்ஸ் ஆகும் - முக்கியமான பங்கு முடிவுகளை நீங்கள் சுயாதீனமாக சரிபார்க்க வேண்டும்.</p>
      </div>
    </details>

    <details id="s12">
      <summary><h2>12. பொறுப்பு வரம்பு</h2></summary>
      <div class="section-content">
        <p>சட்டத்தால் அனுமதிக்கப்படும் அதிகபட்ச அளவிற்கு, நீங்கள் சேவையைப் பயன்படுத்துவதால் ஏற்படும் மறைமுக, தற்செயலான, சிறப்பு, விளைவு அல்லது தண்டனைக்குரிய சேதங்களுக்கு நாங்கள் பொறுப்பாக மாட்டோம், ஆனால் அவை மட்டும் அல்ல:</p>
        <ul>
          <li>குரல் அறிதல் பிழைகளின் விளைவாக இருப்பு முரண்பாடுகள்</li>
          <li>சேவை செயலிழப்பு காரணமாக வணிக இழப்புகள்</li>
          <li>எங்களின் நிலையான காப்புப்பிரதி நடைமுறைகளால் மூடப்பட்ட தரவு இழப்பு</li>
        </ul>
      </div>
    </details>

    <details id="s13">
      <summary><h2>13. இந்த விதிமுறைகளில் மாற்றங்கள்</h2></summary>
      <div class="section-content">
        <p>இந்த விதிமுறைகளை நாங்கள் அவ்வப்போது புதுப்பிக்கலாம். நாங்கள் அவ்வாறு செய்யும்போது, ​​இந்தப் பக்கத்தின் மேலே உள்ள "செயல்படும் தேதியை" புதுப்பிப்போம். மாற்றங்களுக்குப் பிறகு சேவையைத் தொடர்ந்து பயன்படுத்துவது புதுப்பிக்கப்பட்ட விதிமுறைகளை ஏற்றுக்கொள்வதைக் குறிக்கிறது.</p>
      </div>
    </details>

    <details id="s14">
      <summary><h2>14. ஆளும் சட்டம்</h2></summary>
      <div class="section-content">
        <p>இந்த விதிமுறைகள் இந்திய சட்டங்களின்படி நிர்வகிக்கப்படும் மற்றும் கட்டமைக்கப்படும். இந்த விதிமுறைகள் அல்லது சேவையிலிருந்து எழும் எந்தவொரு சர்ச்சையும் இந்தியாவில் உள்ள நீதிமன்றங்களின் பிரத்யேக அதிகார வரம்பிற்கு உட்பட்டது.</p>
      </div>
    </details>

    <details id="s15">
      <summary><h2>15. எங்களை தொடர்பு கொள்ளவும்</h2></summary>
      <div class="section-content">
        <p>இந்த விதிமுறைகளைப் பற்றி ஏதேனும் கேள்விகள் இருந்தால், தயவுசெய்து எங்களை இங்கு தொடர்பு கொள்ளவும்:</p>
        <p><strong>Email:</strong> <a href="mailto:meetslimshady07@gmail.com">meetslimshady07@gmail.com</a></p>
      </div>
    </details>

    <p class="copyright">© 2026 Samaan-Bol. அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை.</p>
  </div>

  <button class="back-to-top" id="backToTop" aria-label="Back to top">↑</button>`,
  },
  "te": {
    home: `<!-- Three.js background canvas -->
<canvas id="bgCanvas"></canvas>

<!-- Aurora ambient background (WebGL fallback) -->
<div class="aurora-bg"><div class="aurora-orb"></div></div>

<!-- Scroll progress indicator -->
<div class="scroll-progress" id="scrollProgress"></div>

<!-- ═══ NAVIGATION ═══ -->
<nav id="nav">
  <div class="container">
    <div class="nav-inner">
      <a href="#" class="logo">
        <div class="logo-mark"><svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><defs><mask id="stencil-nav"><rect x="0" y="0" width="100" height="100" fill="white"/><rect x="24" y="18" width="52" height="8" rx="4" fill="black"/><rect x="38" y="18" width="24" height="36" rx="12" fill="black"/><path d="M 28 42 A 22 22 0 0 0 72 42" fill="none" stroke="black" stroke-width="8" stroke-linecap="round"/><rect x="46" y="72" width="8" height="10" rx="4" fill="black"/><rect x="36" y="32" width="28" height="4" fill="white"/><rect x="36" y="44" width="28" height="4" fill="white"/></mask></defs><circle cx="50" cy="50" r="50" fill="#ea580c" mask="url(#stencil-nav)"/></svg></div>
        <div class="logo-text">సమన్<span>బోల్</span></div>
      </a>
      <ul class="nav-links">
        <li><a href="#how">ఇది ఎలా పనిచేస్తుంది</a></li>
        <li><a href="#features">ఫీచర్లు</a></li>
        <li><a href="#ai">AI ఇంటెలిజెన్స్</a></li>
        <li><a href="#languages">భాషలు</a></li>
        <li><a href="https://apps.apple.com/in/app/samaan-bol/id6759739444" class="nav-cta">యాప్‌ని డౌన్‌లోడ్ చేయండి</a></li>
      </ul>
      <button class="mobile-menu-btn" aria-label="Menu">☰</button>
    </div>
  </div>
</nav>

<!-- ═══ HERO ═══ -->
<section class="hero">
  <div class="container">
    <div class="hero-grid">
      <div>
        <div class="hero-eyebrow">భారతీయ రిటైల్ కోసం వాయిస్-ఫస్ట్ ఇన్వెంటరీ</div>
        <h1 class="hero-text-reveal">
          <span class="hindi-line hindi">बोल के सँभालो अपना बिज़नेस</span>
          <span class="hero-text-main">మీ దుకాణాన్ని నిర్వహించండి<br>మీ స్వరంతో</span>
        </h1>
        <p class="hero-sub">
          మాట్లాడండి <span class="hero-rotate"><span class="hero-rotate-word active">హిందీ</span><span class="hero-rotate-word">బెంగాలీ</span><span class="hero-rotate-word">తమిళం</span><span class="hero-rotate-word">తెలుగు</span><span class="hero-rotate-word">మరాఠీ</span><span class="hero-rotate-word">ఇంగ్లీష్</span></span>, లేదా 10 భారతీయ భాషలలో ఏదైనా.Samaan-Bolయొక్క AI మీ ఆదేశాన్ని అర్థం చేసుకుంటుంది, మీ ఇన్వెంటరీని నవీకరిస్తుంది,
          మరియు మీ వ్యాపారాన్ని అమలులో ఉంచుతుంది — హ్యాండ్స్-ఫ్రీ.
        </p>
        <div class="hero-actions">
          <a href="#download" class="btn-primary">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            ఉచితంగా డౌన్‌లోడ్ చేసుకోండి
          </a>
          <a href="#how" class="btn-secondary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            ఇది చర్యలో చూడండి
          </a>
        </div>
        <div class="hero-stats">
          <div class="hero-stat">
            <div class="hero-stat-number">11</div>
            <div class="hero-stat-label">భాషలు మద్దతు ఇవ్వబడ్డాయి</div>
          </div>
          <div class="hero-stat">
            <div class="hero-stat-number">50K+</div>
            <div class="hero-stat-label">ప్రతిరోజూ ట్రాక్ చేయబడిన అంశాలు</div>
          </div>
          <div class="hero-stat">
            <div class="hero-stat-number">2నిమి</div>
            <div class="hero-stat-label">సెటప్ సమయం</div>
          </div>
        </div>
      </div>

      <div class="hero-visual">
        <!-- Floating cards (z-index 10 — in FRONT of phone) -->
        <div class="float-card float-card--voice">
          <div class="float-card-icon float-card-icon--voice"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg></div>
          <p><strong class="hindi">"चावल 5 किलो जोड़ दो"</strong></p>
          <p style="margin-top:6px; font-size:12px; color:var(--success);">✓ Basmati Rice — 18 → 23 కిలోలు</p>
        </div>

        <div class="float-card float-card--alert">
          <div class="float-card-icon float-card-icon--alert"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg></div>
          <p><strong>తక్కువ స్టాక్ హెచ్చరిక</strong></p>
          <p style="margin-top:4px; font-size:12px;">అట్టా 3 రోజుల్లో అయిపోవచ్చు</p>
        </div>

        <!-- Phone mockup — mirrors actual app UI -->
        <div class="phone-frame">
          <div class="phone-notch"></div>
          <div class="phone-screen">
            <div class="phone-status-bar">
              <span>9:41</span>
              <span style="display:flex; gap:4px; align-items:center;">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z"/></svg>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><rect x="17" y="4" width="4" height="16" rx="1"/><rect x="11" y="8" width="4" height="12" rx="1"/><rect x="5" y="12" width="4" height="8" rx="1"/></svg>
                <svg width="14" height="12" viewBox="0 0 28 14" fill="currentColor"><rect x="0" y="1" width="22" height="12" rx="2" stroke="currentColor" fill="none" stroke-width="1.5"/><rect x="24" y="4.5" width="3" height="5" rx="1"/><rect x="2" y="3" width="14" height="8" rx="1"/></svg>
              </span>
            </div>

            <!-- Header: greeting + bell -->
            <div class="phone-header">
              <div>
                <div class="phone-greeting">శుభోదయం! 👋</div>
                <div class="phone-subtext">Priya General Store</div>
              </div>
              <div class="phone-bell">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B6B70" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                <div class="phone-bell-badge">3</div>
              </div>
            </div>

            <!-- Search bar with mic icon -->
            <div class="phone-search">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4A4A50" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <span class="phone-search-text">ఉత్పత్తులను శోధించండి...</span>
              <div class="phone-search-mic">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0D0D12" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/></svg>
              </div>
            </div>

            <!-- 2x2 Stats grid -->
            <div class="phone-stats-grid">
              <div class="phone-stat-card phone-stat-card--total">
                <div class="phone-stat-number">142</div>
                <div class="phone-stat-label">మొత్తం అంశాలు</div>
              </div>
              <div class="phone-stat-card phone-stat-card--low">
                <div class="phone-stat-number" style="color:var(--warning);">8</div>
                <div class="phone-stat-label">తక్కువ స్టాక్</div>
              </div>
              <div class="phone-stat-card phone-stat-card--out">
                <div class="phone-stat-number" style="color:var(--danger);">2</div>
                <div class="phone-stat-label">స్టాక్ అయిపోయింది</div>
              </div>
              <div class="phone-stat-card phone-stat-card--activity">
                <div class="phone-stat-number" style="color:var(--success);">23</div>
                <div class="phone-stat-label">ఈరోజు నవీకరించబడింది</div>
              </div>
            </div>

            <!-- Filter chips -->
            <div class="phone-filter-row">
              <span class="phone-chip phone-chip--active">అన్నీ</span>
              <span class="phone-chip">తక్కువ స్టాక్</span>
              <span class="phone-chip">అవుట్</span>
              <span class="phone-chip">గడువు ముగిసింది</span>
            </div>

            <!-- Product cards -->
            <div class="phone-product">
              <div class="phone-product-icon" style="background:rgba(255,181,71,0.12);">🍚</div>
              <div class="phone-product-info">
                <div class="phone-product-name">Basmati Rice</div>
                <div class="phone-product-meta">ధాన్యాలు · 2నిమి క్రితం నవీకరించబడింది</div>
              </div>
              <div class="phone-product-qty">
                <div class="phone-product-qty-num">23</div>
                <div class="phone-product-qty-unit">కిలో</div>
              </div>
            </div>

            <div class="phone-product">
              <div class="phone-product-icon" style="background:rgba(255,107,0,0.12);">🫒</div>
              <div class="phone-product-info">
                <div class="phone-product-name">Aashirvaad Atta</div>
                <div class="phone-product-meta">పిండి · 1గం క్రితం నవీకరించబడింది</div>
                <div class="phone-product-status phone-product-status--low">తక్కువ స్టాక్</div>
              </div>
              <div class="phone-product-qty">
                <div class="phone-product-qty-num" style="color:var(--warning);">3</div>
                <div class="phone-product-qty-unit">కిలో</div>
              </div>
            </div>

            <div class="phone-product">
              <div class="phone-product-icon" style="background:rgba(50,213,131,0.1);">🥛</div>
              <div class="phone-product-info">
                <div class="phone-product-name">Amul Toned Milk</div>
                <div class="phone-product-meta">డైరీ · 3గం క్రితం నవీకరించబడింది</div>
              </div>
              <div class="phone-product-qty">
                <div class="phone-product-qty-num">40</div>
                <div class="phone-product-qty-unit">pkt</div>
              </div>
            </div>

          </div>
          <!-- Floating mic FAB (like the real app) -->
          <div class="phone-fab">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0D0D12" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/></svg>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ═══ HOW IT WORKS ═══ -->
<section class="how-it-works" id="how">
  <div class="container">
    <div class="reveal">
      <div class="section-label">ఇది ఎలా పనిచేస్తుంది</div>
      <h2 class="section-heading">మూడు దశలు. శిక్షణ అవసరం లేదు.</h2>
      <p class="section-sub">మీ భాషలో సహజంగా మాట్లాడండి - AI మిగిలిన వాటిని నిర్వహిస్తుంది.</p>
    </div>
    <div class="steps-grid">
      <div class="step reveal reveal-delay-1">
        <div class="step-number">01</div>
        <h3>మీ ఆజ్ఞను మాట్లాడండి</h3>
        <p>మైక్‌ని నొక్కి, మీకు ఏమి కావాలో చెప్పండి — స్టాక్‌ను జోడించండి, పరిమాణాన్ని తనిఖీ చేయండి, కొనుగోలు జాబితాను సృష్టించండి. ఏదైనా భారతీయ భాషలో.</p>
        <div class="step-example">
          <div class="hindi">"चावल 5 किलो जोड़ दो"</div>
          <div class="english">5 కిలోల బియ్యం జోడించండి</div>
        </div>
      </div>
      <div class="step reveal reveal-delay-2">
        <div class="step-number">02</div>
        <h3>AI తక్షణమే అర్థం చేసుకుంటుంది</h3>
        <p>Sarvam AIమీ ప్రసంగాన్ని ప్రాసెస్ చేస్తుంది, ఉత్పత్తి, పరిమాణం మరియు చర్యను సంగ్రహిస్తుంది - ఆపై మీ ఇన్వెంటరీకి సరిపోలుతుంది.</p>
        <div class="step-example">
          <div style="display:flex; gap:12px; flex-wrap:wrap;">
            <span style="background:var(--saffron-tint); color:var(--saffron); padding:4px 10px; border-radius:4px; font-size:12px;">బియ్యం → బాస్మతి 🍚</span>
            <span style="background:rgba(50,213,131,0.1); color:var(--success); padding:4px 10px; border-radius:4px; font-size:12px;">+5 కిలోలు</span>
            <span style="background:rgba(99,102,241,0.1); color:#818CF8; padding:4px 10px; border-radius:4px; font-size:12px;">✓ జోడించండి</span>
          </div>
        </div>
      </div>
      <div class="step reveal reveal-delay-3">
        <div class="step-number">03</div>
        <h3>ఇన్వెంటరీ నవీకరించబడింది, నిర్ధారించబడింది</h3>
        <p>మీ స్టాక్ తక్షణమే నవీకరించబడింది. మీరు మీ భాషలో వాయిస్ నిర్ధారణను వింటారు — స్క్రీన్ అవసరం లేదు.</p>
        <div class="step-example">
          <div class="hindi">"हो गया — बासमती चावल अब 23 किलो है"</div>
          <div class="english">పూర్తయింది - బాస్మతి బియ్యం ఇప్పుడు 23 కిలోలు</div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ═══ FEATURES ═══ -->
<section class="features" id="features" style="position:relative; overflow:hidden;">
  <div class="orb orb--saffron" style="top: -100px; right: -150px;"></div>
  <div class="container">
    <div class="reveal">
      <div class="section-label">ఫీచర్లు</div>
      <h2 class="section-heading">మీ దుకాణానికి కావలసినవన్నీ. అది చేయనిది ఏమీ లేదు.</h2>
    </div>
    <div class="features-grid">
      <div class="feature feature--hero reveal reveal-delay-1">
        <div class="feature-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg></div>
        <h3>వాయిస్-ఫస్ట్ ఇన్వెంటరీ</h3>
        <p>సహజంగా మాట్లాడటం ద్వారా స్టాక్‌ని జోడించండి, తీసివేయండి లేదా తనిఖీ చేయండి. టైపింగ్ లేదు, మెనుల ద్వారా శోధించడం లేదు. మీ భాషలో మాట్లాడండి మరియు AI మిగిలిన వాటిని నిర్వహిస్తుంది - మీ ఆదేశాన్ని అర్థం చేసుకోవడం నుండి నిజ సమయంలో మీ స్టాక్‌ను నవీకరించడం వరకు.</p>
      </div>
      <div class="feature reveal reveal-delay-2">
        <div class="feature-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg></div>
        <h3>10 భారతీయ భాషలు + ఇంగ్లీషు</h3>
        <p>హిందీ, బెంగాలీ, తమిళం, తెలుగు, మరాఠీ, కన్నడ, గుజరాతీ, మలయాళం, పంజాబీ మరియు ఒడియా — Sarvam AI ద్వారా ఆధారితం.</p>
      </div>
      <div class="feature reveal reveal-delay-3">
        <div class="feature-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></div>
        <h3>జట్టు పాత్రలు</h3>
        <p>గ్రాన్యులర్ అనుమతులతోOwner,Manager, మరియు Helper పాత్రలు. అందరూ ఒకే పేజీలో సురక్షితంగా ఉంటారు.</p>
      </div>
      <div class="feature reveal reveal-delay-1">
        <div class="feature-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/><path d="M9 14l2 2 4-4"/></svg></div>
        <h3>స్మార్ట్ కొనుగోలు జాబితాలు</h3>
        <p>తక్కువగా ఉన్న వాటి ఆధారంగా స్వయంచాలకంగా రూపొందించబడిన రీస్టాకింగ్ జాబితాలు. WhatsApp ద్వారా సరఫరాదారులకు భాగస్వామ్యం చేయండి.</p>
      </div>
      <div class="feature reveal reveal-delay-2">
        <div class="feature-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></svg></div>
        <h3>కార్యాచరణ ఆడిట్ లాగ్</h3>
        <p>ప్రతి మార్పు ఎవరు, ఏమి మరియు ఎప్పుడు అనే దానితో ట్రాక్ చేయబడుతుంది. మీ బృందంలో పూర్తి పారదర్శకత.</p>
      </div>
      <div class="feature reveal reveal-delay-3">
        <div class="feature-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><line x1="7" y1="12" x2="17" y2="12"/><line x1="7" y1="8" x2="17" y2="8"/><line x1="7" y1="16" x2="17" y2="16"/></svg></div>
        <h3>బార్‌కోడ్ స్కానింగ్</h3>
        <p>తక్షణమే జోడించడానికి లేదా చూసేందుకు ఉత్పత్తులను స్కాన్ చేయండి. భారతీయ మరియు అంతర్జాతీయ బార్‌కోడ్‌లతో పని చేస్తుంది.</p>
      </div>
    </div>
  </div>
</section>

<!-- ═══ AI INTELLIGENCE ═══ -->
<section class="ai-section" id="ai" style="overflow:hidden;">
  <div class="orb orb--indigo" style="bottom: -100px; left: -100px;"></div>
  <div class="orb orb--green" style="top: 200px; right: -80px;"></div>
  <div class="container">
    <div class="ai-header reveal">
      <div class="section-label">AI ఇంటెలిజెన్స్</div>
      <h2 class="section-heading">
        <span class="hindi" style="display:block; color:var(--saffron); font-size:clamp(22px,2.8vw,32px); font-weight:500; margin-bottom:8px;">సమాజదార్ AI జో ఆపకే బిజానేస్ కో సమజే</span>
        కేవలం ట్రాకింగ్ మాత్రమే కాదు — మీ షాప్ యొక్క మొదటి డిజిటల్ మెదడు
      </h2>
      <p class="section-sub">Samaan-Bolమీరు చెప్పేది మాత్రమే రికార్డ్ చేయదు. ఇది మీ నమూనాలను నేర్చుకుంటుంది, మీ అవసరాలను అంచనా వేస్తుంది మరియు సమస్యలు సంభవించే ముందు మిమ్మల్ని హెచ్చరిస్తుంది.</p>
    </div>

    <div class="ai-blocks">
      <!-- Predictive Stock -->
      <div class="ai-block reveal">
        <div class="ai-block-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg></div>
        <div class="ai-block-tag ai-block-tag--predict">ప్రిడిక్టివ్ స్టాక్</div>
        <h3>మీరు చేసే ముందు మీకు ఏమి అవసరమో తెలుసు</h3>
        <p>AI మీ అమ్మకపు నమూనాలను నేర్చుకుంటుంది — రోజువారీ, వారంవారీ, కాలానుగుణంగా. ఇది ఐటెమ్‌లు ఎప్పుడు తగ్గుతాయో అంచనా వేస్తుంది మరియు రోజుల ముందే రీస్టాక్ చేయమని సూచిస్తుంది.</p>
        <div class="ai-voice-example">
          <div class="voice-bubble">
            <div class="voice-bubble-avatar voice-bubble-avatar--ai"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg></div>
            <div class="voice-bubble-content">
              <div class="hindi">"ఆప్కా అత్తా 3 దిన్ మే ఖతం హో సక్తా హై — హఫ్తే కి బిక్రీ కే హిసాబ్ సే"</div>
              <div class="translation">మీ అట్టా 3 రోజుల్లో అయిపోవచ్చు — వారంవారీ విక్రయాల ఆధారంగా</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Smart Alerts -->
      <div class="ai-block reveal">
        <div class="ai-block-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg></div>
        <div class="ai-block-tag ai-block-tag--alert">స్మార్ట్ హెచ్చరికలు</div>
        <h3>మీ భాష మాట్లాడే హెచ్చరికలు</h3>
        <p>గడువు ముగింపు హెచ్చరికలు, నెమ్మదిగా కదులుతున్న స్టాక్ గుర్తింపు మరియు ధర హెచ్చుతగ్గుల హెచ్చరికలు — మీకు నచ్చిన భాషలో వాయిస్ నోటిఫికేషన్‌ల రూపంలో అందించబడతాయి.</p>
        <div class="ai-voice-example">
          <div class="voice-bubble">
            <div class="voice-bubble-avatar voice-bubble-avatar--ai"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg></div>
            <div class="voice-bubble-content">
              <div class="hindi">"Parle-G కే 12 ప్యాకెట్ 5 దిన్ మే గడువు హో రహే హైన్ — తగ్గింపు లగానా చాహేన్?</div>
              <div class="translation">12 Parle-G ప్యాకెట్‌ల గడువు 5 రోజుల్లో ముగుస్తుంది — తగ్గింపును జోడించాలనుకుంటున్నారా?</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Voice Analytics -->
      <div class="ai-block reveal">
        <div class="ai-block-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg></div>
        <div class="ai-block-tag ai-block-tag--insight">వాయిస్ అనలిటిక్స్</div>
        <h3>మీ షాప్‌ను ఒక ప్రశ్న అడగండి - అది సమాధానం ఇస్తుంది</h3>
        <p>మీ వ్యాపారం గురించి ఏదైనా సహజ భాషలో అడగండి. AI మాట్లాడే సమాధానాలు మరియు ఆన్-స్క్రీన్ డేటాతో ప్రతిస్పందిస్తుంది.</p>
        <div class="ai-voice-example">
          <div class="voice-bubble">
            <div class="voice-bubble-avatar voice-bubble-avatar--user"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>
            <div class="voice-bubble-content">
              <div class="hindi">"పిచ్లే హఫ్తే సబ్సే జ్యాదా క్యా బికా?"</div>
              <div class="translation">గత వారం ఎక్కువగా విక్రయించబడినది ఏది?</div>
            </div>
          </div>
          <div class="voice-bubble">
            <div class="voice-bubble-avatar voice-bubble-avatar--ai"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg></div>
            <div class="voice-bubble-content">
              <div class="hindi">"పిచ్లే హఫ్తే సబ్సే జ్యాదా చావల్ బికా - 48 కిలోలు"</div>
              <div class="translation">గత వారం బియ్యం అత్యధికంగా అమ్ముడయ్యాయి - 48 కిలోలు</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Team Intelligence -->
      <div class="ai-block reveal">
        <div class="ai-block-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>
        <div class="ai-block-tag ai-block-tag--team">టీమ్ ఇంటెలిజెన్స్</div>
        <h3>మీ బృందం ఏమి చేస్తుందో తెలుసుకోండి</h3>
        <p>AI-ఆధారిత క్రమరాహిత్య గుర్తింపు అసాధారణ జాబితా మార్పులను ఫ్లాగ్ చేస్తుంది. స్మార్ట్ సారాంశాలు ఎవరు ఏమి అప్‌డేట్ చేసారు మరియు దిద్దుబాట్లు అవసరమా అని చూపుతాయి.</p>
        <div class="ai-voice-example">
          <div class="voice-bubble">
            <div class="voice-bubble-avatar voice-bubble-avatar--ai"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg></div>
            <div class="voice-bubble-content">
              <div class="hindi">"ఆజ్ షామ్ 6 బజే 15 కిలోల చీనీ కా స్టాక్ కామ్ హువా — వెరిఫై కరీన్?"</div>
              <div class="translation">ఈరోజు సాయంత్రం 6 గంటలకు 15 కిలోల చక్కెర స్టాక్ తగ్గింది - ధృవీకరించాలనుకుంటున్నారా?</div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</section>

<!-- ═══ LANGUAGES ═══ -->
<section class="languages-section" id="languages">
  <div class="container">
    <div class="reveal">
      <div class="section-label">భారత్ కోసం నిర్మించారు</div>
      <h2 class="section-heading">మీ భాష. మీ వ్యాపారం. మీ మార్గం.</h2>
      <p class="section-sub">స్థానిక స్క్రిప్ట్‌లు, వ్యావహారిక పదాలు మరియు ప్రాంతీయ ఉత్పత్తి పేర్లకు పూర్తి మద్దతుతోSamaan-Bolమీరు మాట్లాడే విధంగా మాట్లాడుతుంది.</p>
    </div>
    <div class="lang-grid reveal">
      <div class="lang-chip lang-chip--featured">హిందీ <span class="native hindi">हिन्दी</span></div>
      <div class="lang-chip">బెంగాలీ <span class="native">বাংলা</span></div>
      <div class="lang-chip">తమిళం <span class="native">தமிழ்</span></div>
      <div class="lang-chip">తెలుగు <span class="native">తెలుగు</span></div>
      <div class="lang-chip">మరాఠీ <span class="native">मराठी</span></div>
      <div class="lang-chip">కన్నడ <span class="native">ಕನ್ನಡ</span></div>
      <div class="lang-chip">గుజరాతీ <span class="native">ગુજરાતી</span></div>
      <div class="lang-chip">మలయాళం <span class="native">മലയാളം</span></div>
      <div class="lang-chip">పంజాబీ <span class="native">ਪੰਜਾਬੀ</span></div>
      <div class="lang-chip">ఒడియా <span class="native">ଓଡ଼ିଆ</span></div>
      <div class="lang-chip">ఇంగ్లీష్ <span class="native">ఇంగ్లీష్</span></div>
    </div>
  </div>
</section>

<!-- ═══ COMPARISON ═══ -->
<section class="comparison">
  <div class="container">
    <div class="reveal">
      <div class="section-label">ఎందుకుSamaan-Bol</div>
      <h2 class="section-heading">రాత్రి పగలు తేడా</h2>
    </div>
    <div class="comparison-grid reveal">
      <div class="comparison-col comparison-col--without">
        <h3>Samaan-Bolలేకుండా</h3>
        <p class="comparison-col-subtitle">స్టాక్ నిర్వహణ యొక్క పాత మార్గం</p>
        <ul class="comparison-list">
          <li><span class="icon">✕</span> మాన్యువల్ లెక్కింపు, పెన్ మరియు పేపర్ రిజిస్టర్లు</li>
          <li><span class="icon">✕</span> కస్టమర్ అడిగినప్పుడు స్టాక్‌అవుట్‌లు కనుగొనబడ్డాయి</li>
          <li><span class="icon">✕</span> ఎంత తిరిగి ఆర్డర్ చేయాలో ఊహించడం</li>
          <li><span class="icon">✕</span> ఏది గడువు ముగుస్తుందో లేదా నెమ్మదిగా కదులుతున్నదో తెలియదు</li>
          <li><span class="icon">✕</span> సిబ్బంది ఏమి చేస్తున్నారో ట్రాక్ చేయలేరు</li>
          <li><span class="icon">✕</span> ఫెస్టివల్ ప్రిపరేషన్ చివరి నిమిషంలో గందరగోళం</li>
        </ul>
      </div>
      <div class="comparison-col comparison-col--with">
        <h3>Samaan-Bolతో</h3>
        <p class="comparison-col-subtitle">AI-ఆధారిత, వాయిస్-ఫస్ట్, అప్రయత్నంగా</p>
        <ul class="comparison-list">
          <li><span class="icon">✓</span> వాయిస్ అప్‌డేట్‌లు — చెప్పండి మరియు అది పూర్తయింది</li>
          <li><span class="icon">✓</span> స్టాక్‌అవుట్‌కు రోజుల ముందు ముందస్తు హెచ్చరికలు</li>
          <li><span class="icon">✓</span> వాస్తవ డేటా ఆధారంగా AI రూపొందించిన కొనుగోలు జాబితాలు</li>
          <li><span class="icon">✓</span> గడువు ముగింపు మరియు స్లో-మూవర్ డిటెక్షన్ అంతర్నిర్మితమైంది</li>
          <li><span class="icon">✓</span> అసాధారణ గుర్తింపుతో పూర్తి ఆడిట్ ట్రయల్</li>
          <li><span class="icon">✓</span> పండుగ అంచనా 2 వారాల ముందుగానే ప్రారంభమవుతుంది</li>
        </ul>
      </div>
    </div>
  </div>
</section>

<!-- ═══ TESTIMONIALS ═══ -->
<section class="testimonials">
  <div class="container">
    <div class="reveal">
      <div class="section-label">ప్రారంభ దత్తత తీసుకున్నవారు</div>
      <h2 class="section-heading">భారతదేశం అంతటా బీటా పరీక్షకులకు నచ్చింది</h2>
    </div>
    <div class="testimonials-grid">
      <div class="testimonial reveal reveal-delay-1">
        <div class="testimonial-stars">★★★★★</div>
        <blockquote>బీటా టెస్టింగ్ మెయిన్ ట్రై కియా — పెహ్లే దిన్ సే రిజిస్టర్ బ్యాండ్. అబ్ బాస్ బోల్ దేతీ హూన్ ఔర్ సబ్ అప్డేట్ హో జాతా హై. ఇత్నా ఆసన్ హోగా సోచా నహీ థా.</blockquote>
        <div class="testimonial-author">మీనా శర్మ</div>
        <div class="testimonial-role">బీటా టెస్టర్ · కిరానా స్టోర్Owner, జైపూర్</div>
      </div>
      <div class="testimonial reveal reveal-delay-2">
        <div class="testimonial-stars">★★★★★</div>
        <blockquote>జనవరి మే బేటా జాయిన్ కియా థా — హోలీ కే లియే AI నే ఇప్పటికే బతయా కీ క్యా స్టాక్ బధానా హై. అభి సే ఇత్నా స్మార్ట్ హై, సోచియే లాంచ్ కే బాద్ క్యా హోగా.</blockquote>
        <div class="testimonial-author">అర్జున్ పటేల్</div>
        <div class="testimonial-role">బీటా టెస్టర్ · జనరల్ స్టోర్, అహ్మదాబాద్</div>
      </div>
      <div class="testimonial reveal reveal-delay-3">
        <div class="testimonial-stars">★★★★★</div>
        <blockquote>బంగ్లా మే బోల్టే హై సమాజ్ గయా — బీటా టెస్టింగ్-ఇ దేఖ్లామ్ జే అమర్ భాషా తే కాజ్ కోర్. స్టాఫ్ రా ఓ ఖుబ్ కోర్టే పర్చేని సులభంగా వాడతారు.</blockquote>
        <div class="testimonial-author">రీనా దాస్</div>
        <div class="testimonial-role">బీటా టెస్టర్ · టెక్స్‌టైల్ షాప్, కోల్‌కతా</div>
      </div>
    </div>
  </div>
</section>

<!-- ═══ CTA ═══ -->
<section class="cta-section" id="download">
  <div class="container">
    <div class="reveal">
      <div class="section-label">ఉచితంగా ప్రారంభించండి</div>
      <h2 class="section-heading">
        <span class="hindi" style="display:block; color:var(--saffron); font-size:clamp(20px,2.4vw,28px); font-weight:500; margin-bottom:8px;">आज ही शुरू करें</span>
        మీ దుకాణం నోట్‌బుక్ కంటే మెరుగ్గా ఉంటుంది
      </h2>
      <p class="section-sub">ప్రారంభించడానికి ఉచితం. 2 నిమిషాల్లో సెటప్ చేయండి. క్రెడిట్ కార్డ్ అవసరం లేదు.</p>
      <div class="cta-actions">
        <a href="https://apps.apple.com/in/app/samaan-bol/id6759739444" class="store-badge">
          <div class="store-badge-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg></div>
          <div class="store-badge-text">
            <div class="store-badge-label">డౌన్‌లోడ్ చేయండి</div>
            <div class="store-badge-name">App Store</div>
          </div>
        </a>
        <a href="#" class="store-badge" style="position:relative; opacity:0.65; pointer-events:none;">
          <div class="store-badge-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.807 1.626a1 1 0 0 1 0 1.73l-2.808 1.626L15.206 12l2.492-2.491zM5.864 2.658L16.8 8.99l-2.3 2.3-8.636-8.632z"/></svg></div>
          <div class="store-badge-text">
            <div class="store-badge-label">దాన్ని పొందండి</div>
            <div class="store-badge-name">Google Play</div>
          </div>
          <span style="position:absolute; top:-10px; right:-10px; background:var(--saffron); color:#fff; font-size:11px; font-weight:700; padding:3px 10px; border-radius:20px; letter-spacing:0.5px; text-transform:uppercase;">త్వరలో వస్తుంది</span>
        </a>
      </div>
    </div>
  </div>
</section>

<!-- ═══ FOOTER ═══ -->
<footer>
  <div class="container">
    <div class="footer-grid">
      <div class="footer-brand">
        <a href="#" class="logo">
          <div class="logo-mark"><svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><defs><mask id="stencil-footer"><rect x="0" y="0" width="100" height="100" fill="white"/><rect x="24" y="18" width="52" height="8" rx="4" fill="black"/><rect x="38" y="18" width="24" height="36" rx="12" fill="black"/><path d="M 28 42 A 22 22 0 0 0 72 42" fill="none" stroke="black" stroke-width="8" stroke-linecap="round"/><rect x="46" y="72" width="8" height="10" rx="4" fill="black"/><rect x="36" y="32" width="28" height="4" fill="white"/><rect x="36" y="44" width="28" height="4" fill="white"/></mask></defs><circle cx="50" cy="50" r="50" fill="#ea580c" mask="url(#stencil-footer)"/></svg></div>
          <div class="logo-text">సమన్<span>బోల్</span></div>
        </a>
        <p>వాయిస్-ఫస్ట్ AI ఇన్వెంటరీ మేనేజ్‌మెంట్, భారతీయ రిటైల్ కోసం రూపొందించబడింది.</p>
      </div>
      <div class="footer-col">
        <h4>ఉత్పత్తి</h4>
        <ul>
          <li><a href="#features">ఫీచర్లు</a></li>
          <li><a href="#ai">AI ఇంటెలిజెన్స్</a></li>
          <li><a href="#languages">భాషలు</a></li>
          <li><a href="#">ధర నిర్ణయించడం</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>కంపెనీ</h4>
        <ul>
          <li><a href="#">గురించి</a></li>
          <li><a href="#">బ్లాగు</a></li>
          <li><a href="#">కెరీర్లు</a></li>
          <li><a href="#">సంప్రదించండి</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>మద్దతు</h4>
        <ul>
          <li><a href="#">సహాయ కేంద్రం</a></li>
          <li><a href="/privacy-policy">గోప్యతా విధానం</a></li>
          <li><a href="/terms-of-service">సేవా నిబంధనలు</a></li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <span>© 2026 Samaan-Bol. అన్ని హక్కులు ప్రత్యేకించబడ్డాయి.</span>
      <span class="made-in-india">భారతదేశంలో ♥తో తయారు చేయబడింది 🇮🇳</span>
    </div>
  </div>
</footer>`,
    privacy: `<div class="reading-progress" id="readingProgress"></div>

  <div class="container">
    <a href="/" class="back">← ఇంటికి తిరిగి వెళ్ళు</a>
    <h1>గోప్యతా విధానం</h1>
    <p class="effective">అమలులో ఉన్న తేదీ: ఫిబ్రవరి 23, 2026</p>

    <nav class="toc">
      <h3>కంటెంట్‌లు</h3>
      <ol>
        <li><a href="#s1">మేము సేకరించే సమాచారం</a></li>
        <li><a href="#s2">మేము మీ సమాచారాన్ని ఎలా ఉపయోగిస్తాము</a></li>
        <li><a href="#s3">మూడవ పక్ష సేవలు</a></li>
        <li><a href="#s4">డేటా నిల్వ & భద్రత</a></li>
        <li><a href="#s5">డేటా నిలుపుదల</a></li>
        <li><a href="#s6">ఖాతా తొలగింపు</a></li>
        <li><a href="#s7">షాపుల్లో డేటా షేరింగ్</a></li>
        <li><a href="#s8">పిల్లల గోప్యత</a></li>
        <li><a href="#s9">మీ హక్కులు</a></li>
        <li><a href="#s10">ఈ విధానానికి మార్పులు</a></li>
        <li><a href="#s11">మమ్మల్ని సంప్రదించండి</a></li>
      </ol>
    </nav>

    <p>Samaan-Bol ("మేము", "మా" లేదా "యాప్") అనేది భారతీయ రిటైల్ వ్యాపారాల కోసం రూపొందించబడిన వాయిస్-ఫస్ట్ సహకార ఇన్వెంటరీ మేనేజ్‌మెంట్ అప్లికేషన్. ఈ గోప్యతా విధానం మేము ఏ సమాచారాన్ని సేకరిస్తాము, దానిని ఎలా ఉపయోగిస్తాము, ఎవరితో భాగస్వామ్యం చేస్తాము మరియు మీ డేటాకు సంబంధించిన మీ హక్కులను వివరిస్తుంది.</p>

    <p>Samaan-Bolని ఉపయోగించడం ద్వారా, మీరు ఈ విధానంలో వివరించిన విధంగా సమాచార సేకరణ మరియు వినియోగానికి అంగీకరిస్తున్నారు.</p>

    <details open id="s1">
      <summary><h2>1. మేము సేకరించే సమాచారం</h2></summary>
      <div class="section-content">
        <h3>1.1 ఖాతా సమాచారం</h3>
        <p>మీరు ఖాతాను సృష్టించినప్పుడు, మేము వీటిని సేకరిస్తాము:</p>
        <ul>
          <li><strong>పూర్తి పేరు</strong> - సైన్-అప్ సమయంలో అందించబడింది</li>
          <li><strong>Emailచిరునామా</strong> - ప్రామాణీకరణ మరియు ఖాతా పునరుద్ధరణ కోసం ఉపయోగించబడుతుంది</li>
          <li><strong>పాస్వర్డ్</strong> - మా ప్రామాణీకరణ ప్రొవైడర్ ద్వారా గుప్తీకరించబడింది మరియు నిర్వహించబడుతుంది (Clerk)</li>
        </ul>
        <p>మీరుGoogleలేదా Appleతో సైన్ ఇన్ చేస్తే, మేముOAuthప్రొవైడర్ నుండి మీ పేరు మరియు ఇమెయిల్‌ను స్వీకరిస్తాము. మేము మీ Google లేదా Apple ఖాతా పాస్‌వర్డ్‌ని యాక్సెస్ చేయము.</p>

        <h3>1.2 వాయిస్ రికార్డింగ్‌లు</h3>
        <div class="highlight">
          <p><strong>ముఖ్యమైన:</strong> వాయిస్ రికార్డింగ్‌లు నిజ సమయంలో ప్రాసెస్ చేయబడతాయి మరియు ఉంటాయి <strong>శాశ్వతంగా నిల్వ చేయబడదు</strong>. ఆడియో మా సర్వర్‌కు ప్రసారం చేయబడుతుంది, ప్రసంగ గుర్తింపు మరియు సహజ భాషా అవగాహన కోసంSarvam AIద్వారా ప్రాసెస్ చేయబడుతుంది మరియు ప్రాసెస్ చేసిన తర్వాత వెంటనే విస్మరించబడుతుంది. ఫలితంగా వచ్చే టెక్స్ట్ ట్రాన్స్క్రిప్ట్ మాత్రమే మీ సూచన కోసం మీ ఆడిట్ లాగ్‌లో నిల్వ చేయబడుతుంది.</p>
        </div>
        <ul>
          <li>మీ పరికరంలో ఆడియో రికార్డ్ చేయబడింది (WAVఫార్మాట్iOS, M4AAndroid)</li>
          <li>రికార్డింగ్‌లు గరిష్టంగా 30 సెకన్లకు పరిమితం చేయబడ్డాయి</li>
          <li>సురక్షిత కనెక్షన్ ద్వారా ఆడియో ఎన్‌కోడ్ చేసిన డేటాగా మా సర్వర్‌కి పంపబడుతుంది</li>
          <li>ప్రాసెస్ చేసిన తర్వాత, సర్వర్ మెమరీ నుండి ఆడియో డేటా విస్మరించబడుతుంది</li>
          <li>టెక్స్ట్ ట్రాన్స్‌క్రిప్ట్‌లు మీ దుకాణం యొక్క ఆడిట్ లాగ్‌లో నిల్వ చేయబడతాయి కాబట్టి మీరు గత చర్యలను సమీక్షించవచ్చు</li>
        </ul>

        <h3>1.3 ఇన్వెంటరీ & వ్యాపార డేటా</h3>
        <p>మీరు యాప్‌ని ఉపయోగించినప్పుడు, మీరు సృష్టించిన వ్యాపార డేటాను మేము నిల్వ చేస్తాము:</p>
        <ul>
          <li>షాపింగ్ సమాచారం (పేరు, వర్గం, ప్రాధాన్య భాష)</li>
          <li>ఉత్పత్తి కేటలాగ్ (పేర్లు, బార్‌కోడ్‌లు, వర్గాలు, యూనిట్లు, ధరలు)</li>
          <li>స్టాక్ పరిమాణాలు, బ్యాచ్ నంబర్లు, కొనుగోలు తేదీలు, గడువు తేదీలు, సరఫరాదారు పేర్లు</li>
          <li>జాబితా అంశాలు మరియు గమనికలను కొనుగోలు చేయండి</li>
          <li>ఇన్వెంటరీ మార్పులను రికార్డ్ చేసే ఆడిట్ లాగ్‌లు (చర్య రకం, వినియోగదారు, టైమ్‌స్టాంప్, ట్రాన్స్క్రిప్ట్, కాన్ఫిడెన్స్ స్కోర్)</li>
        </ul>

        <h3>1.4 వినియోగదారు ప్రాధాన్యతలు</h3>
        <ul>
          <li>అనువర్తన భాష మరియు వాయిస్ భాష ఎంపిక</li>
          <li>వాయిస్ ఫీడ్‌బ్యాక్ ప్రాధాన్యత (ఆన్/ఆఫ్)</li>
          <li>ప్రదర్శన సెట్టింగ్‌లు (అధిక కాంట్రాస్ట్ మోడ్, వచన పరిమాణం)</li>
          <li>డిఫాల్ట్ కొలత యూనిట్</li>
          <li>నోటిఫికేషన్ ప్రాధాన్యతలు</li>
        </ul>

        <h3>1.5 షాప్ మెంబర్‌షిప్ డేటా</h3>
        <ul>
          <li>ప్రతి దుకాణంలో మీ పాత్ర (Owner,Manager, లేదా Helper)</li>
          <li>బృందం సహకారం కోసం రూపొందించిన ఆహ్వాన కోడ్‌లు</li>
          <li>దుకాణాల్లో చివరిగా యాక్టివ్ టైమ్‌స్టాంప్‌లు</li>
        </ul>

        <h3>1.6 పరికరం & డయాగ్నస్టిక్ డేటా</h3>
        <p>ప్రొడక్షన్ బిల్డ్‌లలో, క్రాష్ రిపోర్టింగ్ కోసం మేముSentryని ఉపయోగిస్తాము. ఇది సేకరిస్తుంది:</p>
        <ul>
          <li>పరికరం రకం, ఆపరేటింగ్ సిస్టమ్ మరియు యాప్ వెర్షన్</li>
          <li>క్రాష్ నివేదికలు మరియు ఎర్రర్ స్టాక్ ట్రేస్‌లు</li>
          <li>పనితీరు డేటా (సెషన్లలో 20% వద్ద నమూనా)</li>
        </ul>
        <p>డెవలప్‌మెంట్ బిల్డ్‌లలో క్రాష్ రిపోర్టింగ్ నిలిపివేయబడింది మరియు మేము వర్తించే నమూనా రేటు ద్వారా తగ్గించవచ్చు.</p>
      </div>
    </details>

    <details id="s2">
      <summary><h2>2. మేము మీ సమాచారాన్ని ఎలా ఉపయోగిస్తాము</h2></summary>
      <div class="section-content">
        <ul>
          <li><strong>సేవను అందించండి:</strong> వాయిస్ ఆదేశాలను ప్రాసెస్ చేయండి, ఇన్వెంటరీని నిర్వహించండి మరియు మీ బృందం అంతటా డేటాను సమకాలీకరించండి</li>
          <li><strong>ప్రమాణీకరణ:</strong> మీ గుర్తింపును ధృవీకరించండి మరియు సురక్షిత సెషన్‌లను నిర్వహించండి</li>
          <li><strong>ఆడిట్ ట్రయల్:</strong> జవాబుదారీతనం మరియు సమీక్ష కోసం జాబితా మార్పుల లాగ్‌ను నిర్వహించండి</li>
          <li><strong>సేవను మెరుగుపరచండి:</strong> అనామక దోష నివేదికల ద్వారా బగ్‌లు మరియు క్రాష్‌లను గుర్తించండి</li>
          <li><strong>కమ్యూనికేషన్:</strong> అవసరమైన ఖాతా సంబంధిత నోటిఫికేషన్‌లను పంపండి (ఉదా., పాస్‌వర్డ్ రీసెట్‌లు)</li>
        </ul>
        <p>మేము చేస్తాము <strong>కాదు</strong> ప్రకటనల కోసం మీ డేటాను ఉపయోగిస్తాము మరియు మేము చేస్తాము <strong>కాదు</strong> మీ వ్యక్తిగత సమాచారాన్ని మూడవ పార్టీలకు అమ్మండి.</p>
      </div>
    </details>

    <details id="s3">
      <summary><h2>3. మూడవ పక్ష సేవలు</h2></summary>
      <div class="section-content">
        <p>యాప్‌ను ఆపరేట్ చేయడానికి మేము క్రింది మూడవ పక్ష సేవలను ఉపయోగిస్తాము:</p>
        <table>
          <thead>
            <tr>
              <th>సేవ</th>
              <th>ప్రయోజనం</th>
              <th>డేటా షేర్ చేయబడింది</th>
              <th>గోప్యతా విధానం</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Clerk</strong></td>
              <td>ప్రమాణీకరణ & సెషన్ నిర్వహణ</td>
              <td>Email, పేరు, OAuth టోకెన్‌లు, సెషన్ డేటా</td>
              <td><a href="https://clerk.com/legal/privacy" target="_blank" rel="noopener">clerk.com/legal/privacy</a></td>
            </tr>
            <tr>
              <td><strong>Sarvam AI</strong></td>
              <td>వాయిస్ ప్రాసెసింగ్ (స్పీచ్-టు-టెక్స్ట్, నేచురల్ లాంగ్వేజ్ ప్రాసెసింగ్, టెక్స్ట్-టు-స్పీచ్)</td>
              <td>ఆడియో రికార్డింగ్‌లు, ట్రాన్స్క్రిప్ట్ టెక్స్ట్, లాంగ్వేజ్ కోడ్</td>
              <td><a href="https://www.sarvam.ai/privacy-policy" target="_blank" rel="noopener">sarvam.ai/privacy-policy</a></td>
            </tr>
            <tr>
              <td><strong>Neon</strong></td>
              <td>డేటాబేస్ హోస్టింగ్ (PostgreSQL)</td>
              <td>నిరంతర అప్లికేషన్ డేటా మొత్తం</td>
              <td><a href="https://neon.tech/privacy-policy" target="_blank" rel="noopener">neon.tech/privacy-policy</a></td>
            </tr>
            <tr>
              <td><strong>Sentry</strong></td>
              <td>ఎర్రర్ ట్రాకింగ్ & క్రాష్ రిపోర్టింగ్</td>
              <td>క్రాష్ నివేదికలు, పరికర సమాచారం (ఉత్పత్తి మాత్రమే)</td>
              <td><a href="https://sentry.io/privacy/" target="_blank" rel="noopener">sentry.io/privacy</a></td>
            </tr>
          </tbody>
        </table>
        <p>ప్రతి మూడవ పక్ష సేవ వారి స్వంత గోప్యతా విధానం ప్రకారం డేటాను ప్రాసెస్ చేస్తుంది. వారి విధానాలను సమీక్షించమని మేము మిమ్మల్ని ప్రోత్సహిస్తున్నాము.</p>
      </div>
    </details>

    <details id="s4">
      <summary><h2>4. డేటా నిల్వ & భద్రత</h2></summary>
      <div class="section-content">
        <ul>
          <li>ట్రాన్సిట్‌లోSSL/TLSగుప్తీకరణతో అప్లికేషన్ డేటా Neon PostgreSQL డేటాబేస్‌లో నిల్వ చేయబడుతుంది</li>
          <li>ప్రామాణీకరణ టోకెన్‌లు సురక్షిత నిల్వను ఉపయోగించి మీ పరికరంలో నిల్వ చేయబడతాయి (iOSకీచైన్ /Androidకీస్టోర్)</li>
          <li>APIకమ్యూనికేషన్HTTPSఎన్‌క్రిప్షన్‌ను ఉపయోగిస్తుంది</li>
          <li>దుర్వినియోగాన్ని నిరోధించడానికి సున్నితమైన ముగింపు పాయింట్లు రేట్-పరిమితం చేయబడ్డాయి</li>
          <li>పాస్‌వర్డ్‌లుClerkద్వారా హ్యాష్ చేయబడ్డాయి మరియు నిర్వహించబడతాయి - మేము సాదాపాఠ్య పాస్‌వర్డ్‌లను ఎప్పుడూ నిల్వ చేయము</li>
        </ul>
      </div>
    </details>

    <details id="s5">
      <summary><h2>5. డేటా నిలుపుదల</h2></summary>
      <div class="section-content">
        <ul>
          <li><strong>వాయిస్ ఆడియో:</strong> ఎఫెమెరల్ - మెమరీలో ప్రాసెస్ చేయబడుతుంది మరియు వెంటనే విస్మరించబడుతుంది. మా సర్వర్‌లలో ఎప్పుడూ నిల్వ చేయబడదు.</li>
          <li><strong>లిప్యంతరీకరణలు & ఆడిట్ లాగ్‌లు:</strong> మీ ఖాతా సక్రియంగా ఉన్నంత వరకు, మీ సూచన కోసం అలాగే ఉంచబడుతుంది.</li>
          <li><strong>ఇన్వెంటరీ డేటా:</strong> మీ ఖాతా సక్రియంగా ఉన్నంత వరకు అలాగే ఉంచబడుతుంది.</li>
          <li><strong>ఖాతా డేటా:</strong> మీరు మీ ఖాతాను తొలగించే వరకు అలాగే ఉంచబడుతుంది.</li>
          <li><strong>క్రాష్ నివేదికలు:</strong>Sentryడేటా నిలుపుదల విధానం (సాధారణంగా 90 రోజులు) ప్రకారం ఉంచబడుతుంది.</li>
        </ul>
      </div>
    </details>

    <details id="s6">
      <summary><h2>6. ఖాతా తొలగింపు</h2></summary>
      <div class="section-content">
        <p>మీరు మీ ఖాతాను ఎప్పుడైనా తొలగించవచ్చు <strong>Settings > Delete Account</strong> యాప్‌లో. మీరు మీ ఖాతాను తొలగించినప్పుడు:</p>
        <ul>
          <li>అన్ని ఉత్పత్తులు, ఇన్వెంటరీ, బ్యాచ్‌లు, కొనుగోలు జాబితాలు మరియు AI అంచనాలతో సహా మీ స్వంత దుకాణాలు అన్నీ శాశ్వతంగా తొలగించబడతాయి</li>
          <li>మీ అన్ని ఆడిట్ లాగ్‌లు మరియు ప్రాధాన్యతలు శాశ్వతంగా తొలగించబడతాయి</li>
          <li>ఇతర వినియోగదారుల దుకాణాలలో మీ సభ్యత్వాలు తీసివేయబడ్డాయి</li>
          <li>Clerkతో ఉన్న మీ ప్రామాణీకరణ ఖాతా శాశ్వతంగా తొలగించబడింది</li>
        </ul>
        <p><strong>ఈ చర్య తిరుగులేనిది.</strong> తొలగించిన తర్వాత, మీ డేటాను తిరిగి పొందలేరు.</p>
      </div>
    </details>

    <details id="s7">
      <summary><h2>7. షాపుల్లో డేటా షేరింగ్</h2></summary>
      <div class="section-content">
        <p>Samaan-Bolఒక సహకార సాధనం. మీరు దుకాణంలో సభ్యులుగా ఉన్నప్పుడు:</p>
        <ul>
          <li>షాప్ సభ్యులందరూ (Ownerలు,Managerలు,Helperలు) దుకాణం యొక్క ఇన్వెంటరీ డేటా, ఉత్పత్తి జాబితా మరియు ఆడిట్ లాగ్‌లను చూడగలరు</li>
          <li>మీ పేరు, పాత్ర మరియు కార్యాచరణ సమయముద్రలు ఇతర షాప్ సభ్యులకు కనిపిస్తాయి</li>
          <li>Ownerలు వారి దుకాణం కోసం సభ్యత్వం మరియు యాక్సెస్‌ను నిర్వహించగలరు</li>
        </ul>
        <p>మేము మీ డేటాను మీరు సభ్యులు కాని దుకాణాలతో లేదా సంబంధం లేని మూడవ పక్షాలతో భాగస్వామ్యం చేయము.</p>
      </div>
    </details>

    <details id="s8">
      <summary><h2>8. పిల్లల గోప్యత</h2></summary>
      <div class="section-content">
        <p>Samaan-Bolఏళ్లలోపు పిల్లల కోసం ఉద్దేశించబడలేదు. మేము 13 ఏళ్లలోపు పిల్లల నుండి వ్యక్తిగత సమాచారాన్ని ఉద్దేశపూర్వకంగా సేకరించము. పిల్లలు మాకు వ్యక్తిగత సమాచారాన్ని అందించారని మీరు విశ్వసిస్తే, దయచేసి మమ్మల్ని సంప్రదించండి మరియు మేము దానిని వెంటనే తొలగిస్తాము.</p>
      </div>
    </details>

    <details id="s9">
      <summary><h2>9. మీ హక్కులు</h2></summary>
      <div class="section-content">
        <p>మీకు హక్కు ఉంది:</p>
        <ul>
          <li><strong>మీ డేటాను యాక్సెస్ చేయండి:</strong> యాప్‌లో మీ ఇన్వెంటరీ, ఆడిట్ లాగ్‌లు మరియు ప్రాధాన్యతలను వీక్షించండి</li>
          <li><strong>మీ డేటాను తొలగించండి:</strong> సెట్టింగ్‌లలో ఖాతా తొలగింపు లక్షణాన్ని ఉపయోగించండి</li>
          <li><strong>నియంత్రణ ప్రాధాన్యతలు:</strong> మీ భాష, ప్రదర్శన మరియు వాయిస్ సెట్టింగ్‌లను ఎప్పుడైనా సవరించండి</li>
          <li><strong>దుకాణాల నుండి ఉపసంహరించుకోండి:</strong> మీరు సభ్యులుగా ఉన్న ఏదైనా దుకాణాన్ని వదిలివేయండి</li>
        </ul>
      </div>
    </details>

    <details id="s10">
      <summary><h2>10. ఈ విధానానికి మార్పులు</h2></summary>
      <div class="section-content">
        <p>మేము ఈ గోప్యతా విధానాన్ని ఎప్పటికప్పుడు అప్‌డేట్ చేయవచ్చు. మేము చేసినప్పుడు, మేము ఈ పేజీ ఎగువన "ప్రభావవంతమైన తేదీ"ని నవీకరిస్తాము. ఈ విధానాన్ని క్రమానుగతంగా సమీక్షించమని మేము మిమ్మల్ని ప్రోత్సహిస్తున్నాము. మార్పుల తర్వాత యాప్‌ని ఉపయోగించడం కొనసాగించడం వల్ల అప్‌డేట్ చేయబడిన పాలసీని ఆమోదించబడుతుంది.</p>
      </div>
    </details>

    <details id="s11">
      <summary><h2>11. మమ్మల్ని సంప్రదించండి</h2></summary>
      <div class="section-content">
        <p>మీకు ఈ గోప్యతా విధానం లేదా మీ డేటా గురించి ఏవైనా ప్రశ్నలు ఉంటే, దయచేసి మమ్మల్ని ఇక్కడ సంప్రదించండి:</p>
        <p><strong>Email:</strong> <a href="mailto:meetslimshady07@gmail.com">meetslimshady07@gmail.com</a></p>
      </div>
    </details>

    <p class="copyright">© 2026 Samaan-Bol. అన్ని హక్కులు ప్రత్యేకించబడ్డాయి.</p>
  </div>

  <button class="back-to-top" id="backToTop" aria-label="Back to top">↑</button>`,
    terms: `<div class="reading-progress" id="readingProgress"></div>

  <div class="container">
    <a href="/" class="back">← ఇంటికి తిరిగి వెళ్ళు</a>
    <h1>సేవా నిబంధనలు</h1>
    <p class="effective">అమలులో ఉన్న తేదీ: ఫిబ్రవరి 23, 2026</p>

    <nav class="toc">
      <h3>కంటెంట్‌లు</h3>
      <ol>
        <li><a href="#s1">సేవ యొక్క వివరణ</a></li>
        <li><a href="#s2">ఖాతా నమోదు</a></li>
        <li><a href="#s3">వినియోగదారు పాత్రలు & బాధ్యతలు</a></li>
        <li><a href="#s4">వాయిస్ ఇన్‌పుట్</a></li>
        <li><a href="#s5">ఆమోదయోగ్యమైన ఉపయోగం</a></li>
        <li><a href="#s6">మీ డేటా</a></li>
        <li><a href="#s7">సేవ లభ్యత</a></li>
        <li><a href="#s8">రేట్ పరిమితులు</a></li>
        <li><a href="#s9">ఖాతా రద్దు</a></li>
        <li><a href="#s10">మేధో సంపత్తి</a></li>
        <li><a href="#s11">వారంటీల నిరాకరణ</a></li>
        <li><a href="#s12">బాధ్యత యొక్క పరిమితి</a></li>
        <li><a href="#s13">ఈ నిబంధనలకు మార్పులు</a></li>
        <li><a href="#s14">పాలక చట్టం</a></li>
        <li><a href="#s15">మమ్మల్ని సంప్రదించండి</a></li>
      </ol>
    </nav>

    <p>Samaan-Bolకి స్వాగతం. ఈ సేవా నిబంధనలు ("నిబంధనలు")Samaan-Bolమొబైల్ అప్లికేషన్ మరియు సంబంధిత సేవలు (సమిష్టిగా, "సేవ") యొక్క మీ వినియోగాన్ని నియంత్రిస్తాయి. ఖాతాను సృష్టించడం ద్వారా లేదా సేవను ఉపయోగించడం ద్వారా, మీరు ఈ నిబంధనలకు కట్టుబడి ఉండటానికి అంగీకరిస్తున్నారు.</p>

    <details open id="s1">
      <summary><h2>1. సేవ యొక్క వివరణ</h2></summary>
      <div class="section-content">
        <p>Samaan-Bolఅనేది భారతీయ రిటైల్ వ్యాపారాల కోసం రూపొందించబడిన వాయిస్-ఫస్ట్ సహకార ఇన్వెంటరీ మేనేజ్‌మెంట్ అప్లికేషన్. సేవ మిమ్మల్ని అనుమతిస్తుంది:</p>
        <ul>
          <li>బహుళ భారతీయ భాషలలో వాయిస్ ఆదేశాలను ఉపయోగించి ఉత్పత్తి జాబితాను నిర్వహించండి</li>
          <li>స్టాక్ స్థాయిలు, బ్యాచ్‌లు, గడువు తేదీలు మరియు కొనుగోలు సమాచారాన్ని ట్రాక్ చేయండి</li>
          <li>రోల్-బేస్డ్ యాక్సెస్ ద్వారా బృంద సభ్యులతో సహకరించండి (Owner,Manager,Helper)</li>
          <li>అన్ని ఇన్వెంటరీ మార్పుల యొక్క ఆడిట్ ట్రయల్‌లను వీక్షించండి</li>
          <li>కొనుగోలు జాబితాలను నిర్వహించండి మరియు స్టాక్-స్థాయి హెచ్చరికలను స్వీకరించండి</li>
        </ul>
      </div>
    </details>

    <details id="s2">
      <summary><h2>2. ఖాతా నమోదు</h2></summary>
      <div class="section-content">
        <p>సేవను ఉపయోగించడానికి, మీరు ఖచ్చితమైన మరియు పూర్తి సమాచారాన్ని అందించడం ద్వారా తప్పనిసరిగా ఖాతాను సృష్టించాలి. మీరు దీనికి బాధ్యత వహిస్తారు:</p>
        <ul>
          <li>మీ ఖాతా ఆధారాల గోప్యతను నిర్వహించడం</li>
          <li>మీ ఖాతా కింద జరిగే అన్ని కార్యాచరణ</li>
          <li>మీ ఖాతా యొక్క ఏదైనా అనధికారిక వినియోగం గురించి వెంటనే మాకు తెలియజేస్తోంది</li>
        </ul>
        <p>ఖాతాను సృష్టించడానికి మరియు సేవను ఉపయోగించడానికి మీకు కనీసం 13 సంవత్సరాల వయస్సు ఉండాలి.</p>
      </div>
    </details>

    <details id="s3">
      <summary><h2>3. వినియోగదారు పాత్రలు & బాధ్యతలు</h2></summary>
      <div class="section-content">
        <p>Samaan-Bolరోల్-బేస్డ్ యాక్సెస్ కంట్రోల్ సిస్టమ్‌ను ఉపయోగిస్తుంది:</p>
        <ul>
          <li><strong>Owner:</strong> షాప్‌లను సృష్టిస్తుంది మరియు నిర్వహిస్తుంది, బృంద సభ్యులను ఆహ్వానిస్తుంది, అన్ని షాప్ డేటా మరియు సెట్టింగ్‌లకు పూర్తి ప్రాప్యతను కలిగి ఉంటుంది మరియు దుకాణాన్ని తొలగించవచ్చు</li>
          <li><strong>Manager:</strong> దుకాణంలో జాబితాను నిర్వహించవచ్చు, నివేదికలను వీక్షించవచ్చు మరియు చాలా కార్యకలాపాలను నిర్వహించవచ్చు</li>
          <li><strong>Helper:</strong> నిర్దేశించిన విధంగా స్టాక్ అంశాలను జోడించవచ్చు మరియు తీసివేయవచ్చు</li>
        </ul>
        <p>Ownerగా, మీ షాప్‌కు యాక్సెస్‌ను మరియు దానిలోని డేటాను నిర్వహించాల్సిన బాధ్యత మీపై ఉంటుంది. మీరు సభ్యులను ఆహ్వానించినప్పుడు, వారు మీ షాప్ ఇన్వెంటరీ డేటాకు యాక్సెస్ పొందుతారు.</p>
      </div>
    </details>

    <details id="s4">
      <summary><h2>4. వాయిస్ ఇన్‌పుట్</h2></summary>
      <div class="section-content">
        <p>సేవ మూడవ పక్షం AI సేవలను ఉపయోగించి వాయిస్ ఆదేశాలను ప్రాసెస్ చేస్తుంది. దయచేసి గమనించండి:</p>
        <ul>
          <li>వాయిస్ రికార్డింగ్‌లు ఒక్కో కమాండ్‌కు గరిష్టంగా 30 సెకన్లకు పరిమితం చేయబడ్డాయి</li>
          <li>ఈ సేవ ఇంగ్లీష్, హిందీ, తమిళం, తెలుగు, బెంగాలీ, మరాఠీ, కన్నడ, గుజరాతీ, మలయాళం మరియు హింగ్లీష్‌తో సహా బహుళ భాషలకు మద్దతు ఇస్తుంది</li>
          <li>వాయిస్ రికగ్నిషన్ ఖచ్చితత్వం ఆడియో నాణ్యత, నేపథ్య శబ్దం, ఉచ్చారణ మరియు భాష స్పష్టతపై ఆధారపడి ఉంటుంది</li>
          <li>ఖచ్చితత్వాన్ని నిర్ధారించడానికి మీరు వాయిస్-ప్రాసెస్ చేయబడిన ఇన్వెంటరీ మార్పులను సమీక్షించాలి</li>
          <li>వాయిస్ ఆడియో నిజ సమయంలో ప్రాసెస్ చేయబడుతుంది మరియు శాశ్వతంగా నిల్వ చేయబడదు (మా చూడండి <a href="/privacy-policy">గోప్యతా విధానం</a> వివరాల కోసం)</li>
        </ul>
      </div>
    </details>

    <details id="s5">
      <summary><h2>5. ఆమోదయోగ్యమైన ఉపయోగం</h2></summary>
      <div class="section-content">
        <p>మీరు చేయకూడదని అంగీకరిస్తున్నారు:</p>
        <ul>
          <li>ఏదైనా చట్టవిరుద్ధమైన ప్రయోజనం కోసం సేవను ఉపయోగించండి</li>
          <li>ఇతర వినియోగదారుల ఖాతాలు లేదా దుకాణాలకు అనధికారిక యాక్సెస్‌ను పొందే ప్రయత్నం</li>
          <li>సేవ లేదా దాని మౌలిక సదుపాయాలలో జోక్యం చేసుకోవడం లేదా అంతరాయం కలిగించడం</li>
          <li>అప్లికేషన్‌ను రివర్స్-ఇంజనీర్, డీకంపైల్ చేయండి లేదా విడదీయండి</li>
          <li>సాధారణ వినియోగ విధానాలకు మించి సేవను యాక్సెస్ చేయడానికి స్వయంచాలక సాధనాలను ఉపయోగించండి</li>
          <li>ఆహ్వాన కోడ్‌లను పబ్లిక్‌గా లేదా మీ షాప్‌లో చేరడానికి ఉద్దేశించని వ్యక్తులతో షేర్ చేయండి</li>
          <li>దుకాణంలో మీ గుర్తింపు లేదా పాత్రను తప్పుగా సూచించండి</li>
        </ul>
      </div>
    </details>

    <details id="s6">
      <summary><h2>6. మీ డేటా</h2></summary>
      <div class="section-content">
        <p>మీరు సేవలో నమోదు చేసిన వ్యాపార డేటా (ఉత్పత్తి సమాచారం, ఇన్వెంటరీ రికార్డులు మొదలైనవి) యాజమాన్యాన్ని కలిగి ఉంటారు. మేము మీ కంటెంట్ యాజమాన్యాన్ని క్లెయిమ్ చేయము.</p>
        <p>సేవను ఉపయోగించడం ద్వారా, సేవను అందించడం మరియు మెరుగుపరచడం కోసం మీ డేటాను నిల్వ చేయడానికి, ప్రాసెస్ చేయడానికి మరియు ప్రసారం చేయడానికి మీరు మాకు పరిమిత లైసెన్స్‌ని మంజూరు చేస్తున్నారు.</p>
        <p>మేము మీ డేటాను ఎలా సేకరిస్తాము, ఉపయోగిస్తాము మరియు సంరక్షిస్తాము అనే వివరాల కోసం, దయచేసి మాని సమీక్షించండి <a href="/privacy-policy">గోప్యతా విధానం</a>.</p>
      </div>
    </details>

    <details id="s7">
      <summary><h2>7. సేవ లభ్యత</h2></summary>
      <div class="section-content">
        <p>మేము సేవను ఎల్లవేళలా అందుబాటులో ఉంచడానికి ప్రయత్నిస్తాము, కానీ మేము అంతరాయం లేని యాక్సెస్‌కు హామీ ఇవ్వము. దీని కారణంగా సేవ తాత్కాలికంగా అందుబాటులో ఉండకపోవచ్చు:</p>
        <ul>
          <li>ప్రణాళికాబద్ధమైన నిర్వహణ లేదా నవీకరణలు</li>
          <li>మా నియంత్రణకు మించిన సాంకేతిక సమస్యలు</li>
          <li>మూడవ పక్షం సేవ అంతరాయాలు (ప్రామాణీకరణ, వాయిస్ ప్రాసెసింగ్, డేటాబేస్ హోస్టింగ్)</li>
        </ul>
        <p>సర్వీస్ డౌన్‌టైమ్ వల్ల కలిగే నష్టాలకు మేము బాధ్యత వహించము.</p>
      </div>
    </details>

    <details id="s8">
      <summary><h2>8. రేట్ పరిమితులు</h2></summary>
      <div class="section-content">
        <p>సరసమైన వినియోగం మరియు సేవా స్థిరత్వాన్ని నిర్ధారించడానికి, సేవAPIఅభ్యర్థనలపై రేట్ పరిమితులను అమలు చేస్తుంది. ఈ పరిమితులను అధిగమించడం వలన మీ అభ్యర్థనలు తాత్కాలికంగా ఆగిపోవచ్చు.</p>
      </div>
    </details>

    <details id="s9">
      <summary><h2>9. ఖాతా రద్దు</h2></summary>
      <div class="section-content">
        <p>మీరు ఎప్పుడైనా మీ ఖాతాను తొలగించవచ్చు <strong>Settings > Delete Account</strong> యాప్‌లో. ఖాతా తొలగింపు శాశ్వతమైనది మరియు తిరిగి పొందలేనిది — మీ అన్ని దుకాణాలు, ఇన్వెంటరీ డేటా, ఆడిట్ లాగ్‌లు మరియు ప్రాధాన్యతలు శాశ్వతంగా తీసివేయబడతాయి.</p>
        <p>ఈ నిబంధనలను ఉల్లంఘించే లేదా దుర్వినియోగ ప్రవర్తనలో పాల్గొనే ఖాతాలను సస్పెండ్ చేసే లేదా ముగించే హక్కు మాకు ఉంది.</p>
      </div>
    </details>

    <details id="s10">
      <summary><h2>10. మేధో సంపత్తి</h2></summary>
      <div class="section-content">
        <p>Samaan-Bolఅప్లికేషన్, దాని డిజైన్, కోడ్, బ్రాండింగ్ మరియు డాక్యుమెంటేషన్‌తో సహా మా మేధో సంపత్తి. మీరు మా వ్రాతపూర్వక అనుమతి లేకుండా అప్లికేషన్ ఆధారంగా కాపీ చేయడం, సవరించడం, పంపిణీ చేయడం లేదా ఉత్పన్నమైన పనులను సృష్టించడం చేయకూడదు.</p>
      </div>
    </details>

    <details id="s11">
      <summary><h2>11. వారెంటీల నిరాకరణ</h2></summary>
      <div class="section-content">
        <p>ఎక్స్‌ప్రెస్ లేదా పరోక్షంగా ఎలాంటి వారెంటీలు లేకుండా సేవ "ఉన్నట్లుగా" మరియు "అందుబాటులో ఉన్నట్లు" అందించబడుతుంది. మేము ప్రత్యేకంగా వారంటీలను నిరాకరిస్తాము:</p>
        <ul>
          <li>ఒక నిర్దిష్ట ప్రయోజనం కోసం వర్తకం లేదా ఫిట్‌నెస్</li>
          <li>వాయిస్ రికగ్నిషన్ యొక్క ఖచ్చితత్వం లేదా AI రూపొందించిన సూచనలు</li>
          <li>అంతరాయం లేని లేదా లోపం లేని ఆపరేషన్</li>
        </ul>
        <p>వాయిస్ ఆధారిత ఇన్వెంటరీ చర్యలు సహాయకాలు - మీరు క్లిష్టమైన స్టాక్ నిర్ణయాలను స్వతంత్రంగా ధృవీకరించాలి.</p>
      </div>
    </details>

    <details id="s12">
      <summary><h2>12. బాధ్యత యొక్క పరిమితి</h2></summary>
      <div class="section-content">
        <p>చట్టం ద్వారా అనుమతించబడిన గరిష్ట మేరకు, మీ సేవను ఉపయోగించడం వల్ల ఉత్పన్నమయ్యే ఏదైనా పరోక్ష, యాదృచ్ఛిక, ప్రత్యేక, పర్యవసాన లేదా శిక్షాత్మక నష్టాలకు మేము బాధ్యత వహించము, కానీ వీటికి మాత్రమే పరిమితం కాదు:</p>
        <ul>
          <li>వాయిస్ గుర్తింపు లోపాల ఫలితంగా ఇన్వెంటరీ వ్యత్యాసాలు</li>
          <li>సర్వీస్ డౌన్‌టైమ్ కారణంగా వ్యాపార నష్టాలు</li>
          <li>మా ప్రామాణిక బ్యాకప్ విధానాల ద్వారా కవర్ చేయబడిన దాని కంటే ఎక్కువ డేటా నష్టం</li>
        </ul>
      </div>
    </details>

    <details id="s13">
      <summary><h2>13. ఈ నిబంధనలకు మార్పులు</h2></summary>
      <div class="section-content">
        <p>మేము ఈ నిబంధనలను ఎప్పటికప్పుడు అప్‌డేట్ చేయవచ్చు. మేము చేసినప్పుడు, మేము ఈ పేజీ ఎగువన "ప్రభావవంతమైన తేదీ"ని నవీకరిస్తాము. మార్పుల తర్వాత సేవ యొక్క నిరంతర ఉపయోగం అప్‌డేట్ చేయబడిన నిబంధనలను ఆమోదించింది.</p>
      </div>
    </details>

    <details id="s14">
      <summary><h2>14. పాలక చట్టం</h2></summary>
      <div class="section-content">
        <p>ఈ నిబంధనలు భారత చట్టాల ప్రకారం నిర్వహించబడతాయి మరియు అర్థం చేసుకోవాలి. ఈ నిబంధనలు లేదా సేవ నుండి ఉత్పన్నమయ్యే ఏవైనా వివాదాలు భారతదేశంలోని న్యాయస్థానాల ప్రత్యేక అధికార పరిధికి లోబడి ఉంటాయి.</p>
      </div>
    </details>

    <details id="s15">
      <summary><h2>15. మమ్మల్ని సంప్రదించండి</h2></summary>
      <div class="section-content">
        <p>ఈ నిబంధనల గురించి మీకు ఏవైనా సందేహాలు ఉంటే, దయచేసి మమ్మల్ని ఇక్కడ సంప్రదించండి:</p>
        <p><strong>Email:</strong> <a href="mailto:meetslimshady07@gmail.com">meetslimshady07@gmail.com</a></p>
      </div>
    </details>

    <p class="copyright">© 2026 Samaan-Bol. అన్ని హక్కులు ప్రత్యేకించబడ్డాయి.</p>
  </div>

  <button class="back-to-top" id="backToTop" aria-label="Back to top">↑</button>`,
  },
  "mr": {
    home: `<!-- Three.js background canvas -->
<canvas id="bgCanvas"></canvas>

<!-- Aurora ambient background (WebGL fallback) -->
<div class="aurora-bg"><div class="aurora-orb"></div></div>

<!-- Scroll progress indicator -->
<div class="scroll-progress" id="scrollProgress"></div>

<!-- ═══ NAVIGATION ═══ -->
<nav id="nav">
  <div class="container">
    <div class="nav-inner">
      <a href="#" class="logo">
        <div class="logo-mark"><svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><defs><mask id="stencil-nav"><rect x="0" y="0" width="100" height="100" fill="white"/><rect x="24" y="18" width="52" height="8" rx="4" fill="black"/><rect x="38" y="18" width="24" height="36" rx="12" fill="black"/><path d="M 28 42 A 22 22 0 0 0 72 42" fill="none" stroke="black" stroke-width="8" stroke-linecap="round"/><rect x="46" y="72" width="8" height="10" rx="4" fill="black"/><rect x="36" y="32" width="28" height="4" fill="white"/><rect x="36" y="44" width="28" height="4" fill="white"/></mask></defs><circle cx="50" cy="50" r="50" fill="#ea580c" mask="url(#stencil-nav)"/></svg></div>
        <div class="logo-text">सामन<span>बोल</span></div>
      </a>
      <ul class="nav-links">
        <li><a href="#how">हे कसे कार्य करते</a></li>
        <li><a href="#features">वैशिष्ट्ये</a></li>
        <li><a href="#ai">एआय इंटेलिजन्स</a></li>
        <li><a href="#languages">भाषा</a></li>
        <li><a href="https://apps.apple.com/in/app/samaan-bol/id6759739444" class="nav-cta">ॲप डाउनलोड करा</a></li>
      </ul>
      <button class="mobile-menu-btn" aria-label="Menu">☰</button>
    </div>
  </div>
</nav>

<!-- ═══ HERO ═══ -->
<section class="hero">
  <div class="container">
    <div class="hero-grid">
      <div>
        <div class="hero-eyebrow">भारतीय रिटेलसाठी व्हॉइस-फर्स्ट इन्व्हेंटरी</div>
        <h1 class="hero-text-reveal">
          <span class="hindi-line hindi">बोल के सँभालो अपना बिज़नेस</span>
          <span class="hero-text-main">आपले दुकान व्यवस्थापित करा<br>फक्त तुझ्या आवाजाने</span>
        </h1>
        <p class="hero-sub">
          मध्ये बोला <span class="hero-rotate"><span class="hero-rotate-word active">हिंदी</span><span class="hero-rotate-word">बंगाली</span><span class="hero-rotate-word">तमिळ</span><span class="hero-rotate-word">तेलुगु</span><span class="hero-rotate-word">मराठी</span><span class="hero-rotate-word">इंग्रजी</span></span>, किंवा 10 भारतीय भाषांपैकी कोणतीही.
          Samaan-Bol चे AI तुमची आज्ञा समजते, तुमची इन्व्हेंटरी अपडेट करते,
          आणि तुमचा व्यवसाय चालू ठेवते — हँड्सफ्री.
        </p>
        <div class="hero-actions">
          <a href="#download" class="btn-primary">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            मोफत डाउनलोड करा
          </a>
          <a href="#how" class="btn-secondary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            इट इन ॲक्शन पहा
          </a>
        </div>
        <div class="hero-stats">
          <div class="hero-stat">
            <div class="hero-stat-number">11</div>
            <div class="hero-stat-label">भाषा समर्थित</div>
          </div>
          <div class="hero-stat">
            <div class="hero-stat-number">५०K+</div>
            <div class="hero-stat-label">आयटम दररोज ट्रॅक</div>
          </div>
          <div class="hero-stat">
            <div class="hero-stat-number">2 मि</div>
            <div class="hero-stat-label">सेटअप वेळ</div>
          </div>
        </div>
      </div>

      <div class="hero-visual">
        <!-- Floating cards (z-index 10 — in FRONT of phone) -->
        <div class="float-card float-card--voice">
          <div class="float-card-icon float-card-icon--voice"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg></div>
          <p><strong class="hindi">"चावल 5 किलो जोड़ दो"</strong></p>
          <p style="margin-top:6px; font-size:12px; color:var(--success);">✓ Basmati Rice - 18 → 23 किलो</p>
        </div>

        <div class="float-card float-card--alert">
          <div class="float-card-icon float-card-icon--alert"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg></div>
          <p><strong>कमी स्टॉक अलर्ट</strong></p>
          <p style="margin-top:4px; font-size:12px;">अटा 3 दिवसांत संपू शकतो</p>
        </div>

        <!-- Phone mockup — mirrors actual app UI -->
        <div class="phone-frame">
          <div class="phone-notch"></div>
          <div class="phone-screen">
            <div class="phone-status-bar">
              <span>9:41</span>
              <span style="display:flex; gap:4px; align-items:center;">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z"/></svg>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><rect x="17" y="4" width="4" height="16" rx="1"/><rect x="11" y="8" width="4" height="12" rx="1"/><rect x="5" y="12" width="4" height="8" rx="1"/></svg>
                <svg width="14" height="12" viewBox="0 0 28 14" fill="currentColor"><rect x="0" y="1" width="22" height="12" rx="2" stroke="currentColor" fill="none" stroke-width="1.5"/><rect x="24" y="4.5" width="3" height="5" rx="1"/><rect x="2" y="3" width="14" height="8" rx="1"/></svg>
              </span>
            </div>

            <!-- Header: greeting + bell -->
            <div class="phone-header">
              <div>
                <div class="phone-greeting">सुप्रभात! 👋</div>
                <div class="phone-subtext">Priya General Store</div>
              </div>
              <div class="phone-bell">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B6B70" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                <div class="phone-bell-badge">3</div>
              </div>
            </div>

            <!-- Search bar with mic icon -->
            <div class="phone-search">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4A4A50" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <span class="phone-search-text">उत्पादने शोधा...</span>
              <div class="phone-search-mic">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0D0D12" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/></svg>
              </div>
            </div>

            <!-- 2x2 Stats grid -->
            <div class="phone-stats-grid">
              <div class="phone-stat-card phone-stat-card--total">
                <div class="phone-stat-number">142</div>
                <div class="phone-stat-label">एकूण आयटम</div>
              </div>
              <div class="phone-stat-card phone-stat-card--low">
                <div class="phone-stat-number" style="color:var(--warning);">8</div>
                <div class="phone-stat-label">कमी स्टॉक</div>
              </div>
              <div class="phone-stat-card phone-stat-card--out">
                <div class="phone-stat-number" style="color:var(--danger);">2</div>
                <div class="phone-stat-label">स्टॉक संपला</div>
              </div>
              <div class="phone-stat-card phone-stat-card--activity">
                <div class="phone-stat-number" style="color:var(--success);">23</div>
                <div class="phone-stat-label">आज अपडेट केले</div>
              </div>
            </div>

            <!-- Filter chips -->
            <div class="phone-filter-row">
              <span class="phone-chip phone-chip--active">सर्व</span>
              <span class="phone-chip">कमी स्टॉक</span>
              <span class="phone-chip">बाहेर</span>
              <span class="phone-chip">कालबाह्य</span>
            </div>

            <!-- Product cards -->
            <div class="phone-product">
              <div class="phone-product-icon" style="background:rgba(255,181,71,0.12);">🍚</div>
              <div class="phone-product-info">
                <div class="phone-product-name">Basmati Rice</div>
                <div class="phone-product-meta">धान्य · 2m पूर्वी अद्यतनित केले</div>
              </div>
              <div class="phone-product-qty">
                <div class="phone-product-qty-num">23</div>
                <div class="phone-product-qty-unit">किलो</div>
              </div>
            </div>

            <div class="phone-product">
              <div class="phone-product-icon" style="background:rgba(255,107,0,0.12);">🫒</div>
              <div class="phone-product-info">
                <div class="phone-product-name">Aashirvaad Atta</div>
                <div class="phone-product-meta">पीठ · 1 तासापूर्वी अपडेट केले</div>
                <div class="phone-product-status phone-product-status--low">कमी स्टॉक</div>
              </div>
              <div class="phone-product-qty">
                <div class="phone-product-qty-num" style="color:var(--warning);">3</div>
                <div class="phone-product-qty-unit">किलो</div>
              </div>
            </div>

            <div class="phone-product">
              <div class="phone-product-icon" style="background:rgba(50,213,131,0.1);">🥛</div>
              <div class="phone-product-info">
                <div class="phone-product-name">Amul Toned Milk</div>
                <div class="phone-product-meta">दुग्धशाळा · 3 तासांपूर्वी अद्यतनित केले</div>
              </div>
              <div class="phone-product-qty">
                <div class="phone-product-qty-num">40</div>
                <div class="phone-product-qty-unit">pkt</div>
              </div>
            </div>

          </div>
          <!-- Floating mic FAB (like the real app) -->
          <div class="phone-fab">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0D0D12" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/></svg>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ═══ HOW IT WORKS ═══ -->
<section class="how-it-works" id="how">
  <div class="container">
    <div class="reveal">
      <div class="section-label">हे कसे कार्य करते</div>
      <h2 class="section-heading">तीन पावले. प्रशिक्षणाची गरज नाही.</h2>
      <p class="section-sub">फक्त तुमच्या भाषेत नैसर्गिकरित्या बोला — AI बाकीचे हाताळते.</p>
    </div>
    <div class="steps-grid">
      <div class="step reveal reveal-delay-1">
        <div class="step-number">01</div>
        <h3>तुमची आज्ञा बोला</h3>
        <p>माइकवर टॅप करा आणि तुम्हाला काय हवे आहे ते सांगा — स्टॉक जोडा, प्रमाण तपासा, खरेदी सूची तयार करा. कोणत्याही भारतीय भाषेत.</p>
        <div class="step-example">
          <div class="hindi">"चावल 5 किलो जोड़ दो"</div>
          <div class="english">5 किलो तांदूळ घाला</div>
        </div>
      </div>
      <div class="step reveal reveal-delay-2">
        <div class="step-number">02</div>
        <h3>AI लगेच समजते</h3>
        <p>Sarvam AI तुमच्या बोलण्यावर प्रक्रिया करते, उत्पादन, प्रमाण आणि कृती काढते — नंतर ते तुमच्या इन्व्हेंटरीशी जुळते.</p>
        <div class="step-example">
          <div style="display:flex; gap:12px; flex-wrap:wrap;">
            <span style="background:var(--saffron-tint); color:var(--saffron); padding:4px 10px; border-radius:4px; font-size:12px;">तांदूळ → ​​बासमती 🍚</span>
            <span style="background:rgba(50,213,131,0.1); color:var(--success); padding:4px 10px; border-radius:4px; font-size:12px;">+5 किलो</span>
            <span style="background:rgba(99,102,241,0.1); color:#818CF8; padding:4px 10px; border-radius:4px; font-size:12px;">✓ जोडा</span>
          </div>
        </div>
      </div>
      <div class="step reveal reveal-delay-3">
        <div class="step-number">03</div>
        <h3>इन्व्हेंटरी अपडेट केली, पुष्टी केली</h3>
        <p>तुमचा स्टॉक त्वरित अपडेट केला जातो. तुम्हाला तुमच्या भाषेत व्हॉइस पुष्टीकरण ऐकू येते — स्क्रीनची गरज नाही.</p>
        <div class="step-example">
          <div class="hindi">"हो गया — बासमती चावल अब 23 किलो है"</div>
          <div class="english">झाले — बासमती तांदूळ आता २३ किलो झाला आहे</div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ═══ FEATURES ═══ -->
<section class="features" id="features" style="position:relative; overflow:hidden;">
  <div class="orb orb--saffron" style="top: -100px; right: -150px;"></div>
  <div class="container">
    <div class="reveal">
      <div class="section-label">वैशिष्ट्ये</div>
      <h2 class="section-heading">तुमच्या दुकानाला आवश्यक असलेली प्रत्येक गोष्ट. काहीही होत नाही.</h2>
    </div>
    <div class="features-grid">
      <div class="feature feature--hero reveal reveal-delay-1">
        <div class="feature-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg></div>
        <h3>आवाज-प्रथम यादी</h3>
        <p>नैसर्गिकरित्या बोलून स्टॉक जोडा, काढा किंवा तपासा. कोणतेही टायपिंग नाही, मेनूमधून शोध नाही. फक्त तुमच्या भाषेत बोला आणि AI बाकीचे हाताळते — तुमची आज्ञा समजून घेण्यापासून ते तुमचा स्टॉक रिअल टाइममध्ये अपडेट करण्यापर्यंत.</p>
      </div>
      <div class="feature reveal reveal-delay-2">
        <div class="feature-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg></div>
        <h3>10 भारतीय भाषा + इंग्रजी</h3>
        <p>हिंदी, बंगाली, तमिळ, तेलगू, मराठी, कन्नड, गुजराती, मल्याळम, पंजाबी आणि ओडिया — Sarvam AI द्वारा समर्थित.</p>
      </div>
      <div class="feature reveal reveal-delay-3">
        <div class="feature-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></div>
        <h3>संघ भूमिका</h3>
        <p>Owner, Manager, आणि Helper दाणेदार परवानग्यांसह भूमिका. प्रत्येकजण एकाच पृष्ठावर, सुरक्षितपणे.</p>
      </div>
      <div class="feature reveal reveal-delay-1">
        <div class="feature-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/><path d="M9 14l2 2 4-4"/></svg></div>
        <h3>स्मार्ट खरेदी याद्या</h3>
        <p>काय कमी चालले आहे यावर आधारित स्वयं-व्युत्पन्न पुनर्स्टॉकिंग सूची. WhatsApp द्वारे पुरवठादारांना शेअर करा.</p>
      </div>
      <div class="feature reveal reveal-delay-2">
        <div class="feature-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></svg></div>
        <h3>क्रियाकलाप ऑडिट लॉग</h3>
        <p>प्रत्येक बदलाचा मागोवा कोण, काय आणि केव्हा आहे. तुमच्या टीममध्ये पूर्ण पारदर्शकता.</p>
      </div>
      <div class="feature reveal reveal-delay-3">
        <div class="feature-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><line x1="7" y1="12" x2="17" y2="12"/><line x1="7" y1="8" x2="17" y2="8"/><line x1="7" y1="16" x2="17" y2="16"/></svg></div>
        <h3>बारकोड स्कॅनिंग</h3>
        <p>उत्पादने जोडण्यासाठी किंवा त्वरित पाहण्यासाठी स्कॅन करा. भारतीय आणि आंतरराष्ट्रीय बारकोडसह कार्य करते.</p>
      </div>
    </div>
  </div>
</section>

<!-- ═══ AI INTELLIGENCE ═══ -->
<section class="ai-section" id="ai" style="overflow:hidden;">
  <div class="orb orb--indigo" style="bottom: -100px; left: -100px;"></div>
  <div class="orb orb--green" style="top: 200px; right: -80px;"></div>
  <div class="container">
    <div class="ai-header reveal">
      <div class="section-label">एआय इंटेलिजन्स</div>
      <h2 class="section-heading">
        <span class="hindi" style="display:block; color:var(--saffron); font-size:clamp(22px,2.8vw,32px); font-weight:500; margin-bottom:8px;">दार AI जो तुमचे बिज़नेस समजावून सांगा</span>
        फक्त ट्रॅकिंग नाही - तुमच्या दुकानाचा पहिला डिजिटल मेंदू
      </h2>
      <p class="section-sub">Samaan-Bol तुम्ही जे सांगता ते फक्त रेकॉर्ड करत नाही. ते तुमचे नमुने शिकते, तुमच्या गरजा सांगते आणि समस्या येण्यापूर्वी तुम्हाला सतर्क करते.</p>
    </div>

    <div class="ai-blocks">
      <!-- Predictive Stock -->
      <div class="ai-block reveal">
        <div class="ai-block-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg></div>
        <div class="ai-block-tag ai-block-tag--predict">भविष्य सांगणारा स्टॉक</div>
        <h3>आपण करण्यापूर्वी आपल्याला काय आवश्यक आहे हे माहित आहे</h3>
        <p>AI तुमचे विक्रीचे नमुने शिकते — दररोज, साप्ताहिक, हंगामी. आयटम कधी कमी होतील याचा अंदाज लावतो आणि रीस्टॉकिंग दिवस अगोदर सुचवतो.</p>
        <div class="ai-voice-example">
          <div class="voice-bubble">
            <div class="voice-bubble-avatar voice-bubble-avatar--ai"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg></div>
            <div class="voice-bubble-content">
              <div class="hindi">"आपका अत्ता 3 दिन में खतम हो सक्ता है - हाफ्ते की बिकरी के हसब से"</div>
              <div class="translation">तुमचा अटा 3 दिवसांत संपू शकतो — साप्ताहिक विक्रीवर आधारित</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Smart Alerts -->
      <div class="ai-block reveal">
        <div class="ai-block-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg></div>
        <div class="ai-block-tag ai-block-tag--alert">स्मार्ट अलर्ट</div>
        <h3>तुमची भाषा बोलणाऱ्या सूचना</h3>
        <p>कालबाह्य होण्याच्या चेतावणी, स्लो-मूव्हिंग स्टॉक डिटेक्शन आणि किंमतीतील चढ-उतार सूचना — तुमच्या पसंतीच्या भाषेत व्हॉइस सूचना म्हणून वितरित केल्या जातात.</p>
        <div class="ai-voice-example">
          <div class="voice-bubble">
            <div class="voice-bubble-avatar voice-bubble-avatar--ai"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg></div>
            <div class="voice-bubble-content">
              <div class="hindi">"Parle-G के 12 पॅकेट 5 दिन में एक्सपायर हो रहे हैं — सवलत लगाना चाहिये?"</div>
              <div class="translation">12 Parle-G पॅकेट्स 5 दिवसात कालबाह्य होत आहेत — सूट जोडू इच्छिता?</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Voice Analytics -->
      <div class="ai-block reveal">
        <div class="ai-block-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg></div>
        <div class="ai-block-tag ai-block-tag--insight">व्हॉइस विश्लेषण</div>
        <h3>तुमच्या दुकानाला एक प्रश्न विचारा - ते उत्तर देते</h3>
        <p>तुमच्या व्यवसायाबद्दल नैसर्गिक भाषेत काहीही विचारा. AI बोललेल्या उत्तरांसह आणि ऑन-स्क्रीन डेटासह प्रतिसाद देते.</p>
        <div class="ai-voice-example">
          <div class="voice-bubble">
            <div class="voice-bubble-avatar voice-bubble-avatar--user"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>
            <div class="voice-bubble-content">
              <div class="hindi">"पिछले हफ्ते सबसे झ्यादा क्या बिका?"</div>
              <div class="translation">गेल्या आठवड्यात सर्वात जास्त काय विकले गेले?</div>
            </div>
          </div>
          <div class="voice-bubble">
            <div class="voice-bubble-avatar voice-bubble-avatar--ai"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg></div>
            <div class="voice-bubble-content">
              <div class="hindi">"पिछले हफ्ते सबसे झ्यादा चावल बिका - 48 किलो"</div>
              <div class="translation">तांदूळ गेल्या आठवड्यात सर्वात जास्त विकला - 48 किलो</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Team Intelligence -->
      <div class="ai-block reveal">
        <div class="ai-block-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>
        <div class="ai-block-tag ai-block-tag--team">टीम इंटेलिजन्स</div>
        <h3>तुमची टीम काय करत आहे ते जाणून घ्या</h3>
        <p>AI-चालित विसंगती शोधणे असामान्य इन्व्हेंटरी बदल दर्शवते. स्मार्ट सारांश दाखवतात की कोणी काय अपडेट केले आणि दुरुस्त्या आवश्यक होत्या का.</p>
        <div class="ai-voice-example">
          <div class="voice-bubble">
            <div class="voice-bubble-avatar voice-bubble-avatar--ai"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg></div>
            <div class="voice-bubble-content">
              <div class="hindi">"आज शाम 6 बाजे 15 किलो चीनी का स्टॉक कम हुआ - सत्यापित करा?"</div>
              <div class="translation">आज संध्याकाळी 6 वाजता 15 किलो साखरेचा साठा कमी झाला - पडताळू इच्छिता?</div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</section>

<!-- ═══ LANGUAGES ═══ -->
<section class="languages-section" id="languages">
  <div class="container">
    <div class="reveal">
      <div class="section-label">भारतासाठी बांधले</div>
      <h2 class="section-heading">तुमची भाषा. तुमचा व्यवसाय. आपला मार्ग.</h2>
      <p class="section-sub">Samaan-Bol तुम्ही जसे बोलता तसे बोलते — मूळ लिपी, बोलचाल शब्द आणि प्रादेशिक उत्पादन नावांसाठी पूर्ण समर्थनासह.</p>
    </div>
    <div class="lang-grid reveal">
      <div class="lang-chip lang-chip--featured">हिंदी <span class="native hindi">हिन्दी</span></div>
      <div class="lang-chip">बंगाली <span class="native">বাংলা</span></div>
      <div class="lang-chip">तमिळ <span class="native">தமிழ்</span></div>
      <div class="lang-chip">तेलुगु <span class="native">తెలుగు</span></div>
      <div class="lang-chip">मराठी <span class="native">मराठी</span></div>
      <div class="lang-chip">कन्नड <span class="native">ಕನ್ನಡ</span></div>
      <div class="lang-chip">गुजराती <span class="native">ગુજરાતી</span></div>
      <div class="lang-chip">मल्याळम <span class="native">മലയാളം</span></div>
      <div class="lang-chip">पंजाबी <span class="native">ਪੰਜਾਬੀ</span></div>
      <div class="lang-chip">ओडिया <span class="native">ଓଡ଼ିଆ</span></div>
      <div class="lang-chip">इंग्रजी <span class="native">इंग्रजी</span></div>
    </div>
  </div>
</section>

<!-- ═══ COMPARISON ═══ -->
<section class="comparison">
  <div class="container">
    <div class="reveal">
      <div class="section-label">का Samaan-Bol</div>
      <h2 class="section-heading">रात्र आणि दिवसाचा फरक आहे</h2>
    </div>
    <div class="comparison-grid reveal">
      <div class="comparison-col comparison-col--without">
        <h3>Samaan-Bol शिवाय</h3>
        <p class="comparison-col-subtitle">स्टॉक व्यवस्थापित करण्याचा जुना मार्ग</p>
        <ul class="comparison-list">
          <li><span class="icon">✕</span> मॅन्युअल मोजणी, पेन-आणि-पेपर रजिस्टर</li>
          <li><span class="icon">✕</span> ग्राहकाने विचारल्यावर स्टॉकआउट्स शोधले</li>
          <li><span class="icon">✕</span> किती पुनर्क्रमित करायचे याचा अंदाज घेत आहे</li>
          <li><span class="icon">✕</span> काय कालबाह्य होत आहे किंवा हळू चालत आहे याची कल्पना नाही</li>
          <li><span class="icon">✕</span> कर्मचारी काय करत आहेत याचा मागोवा घेऊ शकत नाही</li>
          <li><span class="icon">✕</span> उत्सवाची तयारी ही शेवटच्या क्षणी गोंधळाची असते</li>
        </ul>
      </div>
      <div class="comparison-col comparison-col--with">
        <h3>Samaan-Bol सह</h3>
        <p class="comparison-col-subtitle">एआय-सक्षम, आवाज-प्रथम, सहज</p>
        <ul class="comparison-list">
          <li><span class="icon">✓</span> व्हॉइस अद्यतने - ते सांगा आणि ते पूर्ण झाले</li>
          <li><span class="icon">✓</span> स्टॉकआउटच्या काही दिवस आधी अंदाज वर्तवणाऱ्या सूचना</li>
          <li><span class="icon">✓</span> वास्तविक डेटावर आधारित AI-व्युत्पन्न खरेदी सूची</li>
          <li><span class="icon">✓</span> एक्सपायरी आणि स्लो-मूव्हर डिटेक्शन बिल्ट इन</li>
          <li><span class="icon">✓</span> विसंगती डिटेक्शनसह संपूर्ण ऑडिट ट्रेल</li>
          <li><span class="icon">✓</span> उत्सवाचा अंदाज 2 आठवडे लवकर सुरू होतो</li>
        </ul>
      </div>
    </div>
  </div>
</section>

<!-- ═══ TESTIMONIALS ═══ -->
<section class="testimonials">
  <div class="container">
    <div class="reveal">
      <div class="section-label">लवकर दत्तक घेणारे</div>
      <h2 class="section-heading">संपूर्ण भारतातील बीटा परीक्षकांना आवडते</h2>
    </div>
    <div class="testimonials-grid">
      <div class="testimonial reveal reveal-delay-1">
        <div class="testimonial-stars">★★★★★</div>
        <blockquote>बीटा टेस्टिंग में ट्राय किया — पहले दिन से रजिस्टर बँड. अब बस बोल देती हूँ और सब अपडेट हो जाता है. इतना आसन होगा सोचा नाही था.</blockquote>
        <div class="testimonial-author">मीना शर्मा</div>
        <div class="testimonial-role">बीटा टेस्टर · किराणा स्टोअर Owner, जयपूर</div>
      </div>
      <div class="testimonial reveal reveal-delay-2">
        <div class="testimonial-stars">★★★★★</div>
        <blockquote>जानेवारी में बीटा जॉइन किया था — होली के लिए एआय ने पहले से बताया की क्या स्टॉक बधाना है. अभी से इतना स्मार्ट है, सोचिए लॉन्च के बाद क्या होगा.</blockquote>
        <div class="testimonial-author">अर्जुन पटेल</div>
        <div class="testimonial-role">बीटा टेस्टर · जनरल स्टोअर, अहमदाबाद</div>
      </div>
      <div class="testimonial reveal reveal-delay-3">
        <div class="testimonial-stars">★★★★★</div>
        <blockquote>बांग्ला में बोलते ही समझ गया — बीटा टेस्टिंग-ए देखलं जे अमर भाषा ते काम कोरे. कर्मचारी रा ओ खुब सहज वापरतात korte Parchhe.</blockquote>
        <div class="testimonial-author">रिना दास</div>
        <div class="testimonial-role">बीटा टेस्टर · कापड दुकान, कोलकाता</div>
      </div>
    </div>
  </div>
</section>

<!-- ═══ CTA ═══ -->
<section class="cta-section" id="download">
  <div class="container">
    <div class="reveal">
      <div class="section-label">मोफत प्रारंभ करा</div>
      <h2 class="section-heading">
        <span class="hindi" style="display:block; color:var(--saffron); font-size:clamp(20px,2.4vw,28px); font-weight:500; margin-bottom:8px;">आज ही शुरू करें</span>
        तुमचे दुकान नोटबुकपेक्षा चांगले आहे
      </h2>
      <p class="section-sub">सुरू करण्यासाठी विनामूल्य. 2 मिनिटांत सेट करा. क्रेडिट कार्डची गरज नाही.</p>
      <div class="cta-actions">
        <a href="https://apps.apple.com/in/app/samaan-bol/id6759739444" class="store-badge">
          <div class="store-badge-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg></div>
          <div class="store-badge-text">
            <div class="store-badge-label">वर डाउनलोड करा</div>
            <div class="store-badge-name">App Store</div>
          </div>
        </a>
        <a href="#" class="store-badge" style="position:relative; opacity:0.65; pointer-events:none;">
          <div class="store-badge-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.807 1.626a1 1 0 0 1 0 1.73l-2.808 1.626L15.206 12l2.492-2.491zM5.864 2.658L16.8 8.99l-2.3 2.3-8.636-8.632z"/></svg></div>
          <div class="store-badge-text">
            <div class="store-badge-label">वर मिळवा</div>
            <div class="store-badge-name">Google Play</div>
          </div>
          <span style="position:absolute; top:-10px; right:-10px; background:var(--saffron); color:#fff; font-size:11px; font-weight:700; padding:3px 10px; border-radius:20px; letter-spacing:0.5px; text-transform:uppercase;">लवकरच येत आहे</span>
        </a>
      </div>
    </div>
  </div>
</section>

<!-- ═══ FOOTER ═══ -->
<footer>
  <div class="container">
    <div class="footer-grid">
      <div class="footer-brand">
        <a href="#" class="logo">
          <div class="logo-mark"><svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><defs><mask id="stencil-footer"><rect x="0" y="0" width="100" height="100" fill="white"/><rect x="24" y="18" width="52" height="8" rx="4" fill="black"/><rect x="38" y="18" width="24" height="36" rx="12" fill="black"/><path d="M 28 42 A 22 22 0 0 0 72 42" fill="none" stroke="black" stroke-width="8" stroke-linecap="round"/><rect x="46" y="72" width="8" height="10" rx="4" fill="black"/><rect x="36" y="32" width="28" height="4" fill="white"/><rect x="36" y="44" width="28" height="4" fill="white"/></mask></defs><circle cx="50" cy="50" r="50" fill="#ea580c" mask="url(#stencil-footer)"/></svg></div>
          <div class="logo-text">सामन<span>बोल</span></div>
        </a>
        <p>व्हॉईस-फर्स्ट एआय इन्व्हेंटरी व्यवस्थापन, भारतीय रिटेलच्या हृदयासाठी तयार केलेले.</p>
      </div>
      <div class="footer-col">
        <h4>उत्पादन</h4>
        <ul>
          <li><a href="#features">वैशिष्ट्ये</a></li>
          <li><a href="#ai">एआय इंटेलिजन्स</a></li>
          <li><a href="#languages">भाषा</a></li>
          <li><a href="#">किंमत</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>कंपनी</h4>
        <ul>
          <li><a href="#">बद्दल</a></li>
          <li><a href="#">ब्लॉग</a></li>
          <li><a href="#">करिअर</a></li>
          <li><a href="#">संपर्क करा</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>सपोर्ट</h4>
        <ul>
          <li><a href="#">मदत केंद्र</a></li>
          <li><a href="/privacy-policy">गोपनीयता धोरण</a></li>
          <li><a href="/terms-of-service">सेवा अटी</a></li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <span>© 2026 Samaan-Bol. सर्व हक्क राखीव.</span>
      <span class="made-in-india">भारतात ♥ ने बनवलेले 🇮🇳</span>
    </div>
  </div>
</footer>`,
    privacy: `<div class="reading-progress" id="readingProgress"></div>

  <div class="container">
    <a href="/" class="back">← घरी परत</a>
    <h1>गोपनीयता धोरण</h1>
    <p class="effective">प्रभावी तारीख: 23 फेब्रुवारी 2026</p>

    <nav class="toc">
      <h3>सामग्री</h3>
      <ol>
        <li><a href="#s1">माहिती आम्ही गोळा करतो</a></li>
        <li><a href="#s2">आम्ही तुमची माहिती कशी वापरतो</a></li>
        <li><a href="#s3">तृतीय-पक्ष सेवा</a></li>
        <li><a href="#s4">डेटा स्टोरेज आणि सुरक्षा</a></li>
        <li><a href="#s5">डेटा धारणा</a></li>
        <li><a href="#s6">खाते हटवणे</a></li>
        <li><a href="#s7">दुकानांमध्ये डेटा शेअरिंग</a></li>
        <li><a href="#s8">मुलांची गोपनीयता</a></li>
        <li><a href="#s9">आपले हक्क</a></li>
        <li><a href="#s10">या धोरणातील बदल</a></li>
        <li><a href="#s11">आमच्याशी संपर्क साधा</a></li>
      </ol>
    </nav>

    <p>Samaan-Bol ("आम्ही", "आमचे", किंवा "द ॲप") हा भारतीय रिटेल व्यवसायांसाठी डिझाइन केलेला व्हॉइस-फर्स्ट सहयोगी इन्व्हेंटरी मॅनेजमेंट ॲप्लिकेशन आहे. हे गोपनीयता धोरण आम्ही कोणती माहिती संकलित करतो, आम्ही ती कशी वापरतो, आम्ही ती कोणाशी शेअर करतो आणि तुमच्या डेटाशी संबंधित तुमचे अधिकार स्पष्ट करते.</p>

    <p>Samaan-Bol वापरून, तुम्ही या धोरणात वर्णन केल्यानुसार माहितीचे संकलन आणि वापर करण्यास सहमती देता.</p>

    <details open id="s1">
      <summary><h2>1. माहिती आम्ही गोळा करतो</h2></summary>
      <div class="section-content">
        <h3>1.1 खाते माहिती</h3>
        <p>तुम्ही खाते तयार करता तेव्हा आम्ही गोळा करतो:</p>
        <ul>
          <li><strong>पूर्ण नाव</strong> - साइन-अप दरम्यान प्रदान</li>
          <li><strong>Email पत्ता</strong> — प्रमाणीकरण आणि खाते पुनर्प्राप्तीसाठी वापरले जाते</li>
          <li><strong>पासवर्ड</strong> — आमच्या प्रमाणीकरण प्रदात्याद्वारे कूटबद्ध आणि व्यवस्थापित केले (Clerk)</li>
        </ul>
        <p>तुम्ही Google किंवा Apple सह साइन इन केल्यास, आम्हाला तुमचे नाव आणि ईमेल OAuth प्रदात्याकडून प्राप्त होईल. आम्ही तुमच्या Google किंवा Apple खाते पासवर्डमध्ये प्रवेश करत नाही.</p>

        <h3>1.2 व्हॉइस रेकॉर्डिंग</h3>
        <div class="highlight">
          <p><strong>महत्त्वाचे:</strong> व्हॉइस रेकॉर्डिंगवर रिअल-टाइममध्ये प्रक्रिया केली जाते आणि आहे <strong>कायमस्वरूपी संग्रहित नाही</strong>. ऑडिओ आमच्या सर्व्हरवर प्रसारित केला जातो, उच्चार ओळखण्यासाठी आणि नैसर्गिक भाषा समजून घेण्यासाठीSarvam AIद्वारे प्रक्रिया केली जाते आणि प्रक्रिया केल्यानंतर लगेच टाकून दिली जाते. तुमच्या संदर्भासाठी केवळ परिणामी मजकूर उतारा तुमच्या ऑडिट लॉगमध्ये संग्रहित केला जातो.</p>
        </div>
        <ul>
          <li>ऑडिओ तुमच्या डिव्हाइसवर रेकॉर्ड केला आहे ( WAV फॉरमॅट iOS, M4A Android वर)</li>
          <li>रेकॉर्डिंग कमाल 30 सेकंदांपर्यंत मर्यादित आहेत</li>
          <li>ऑडिओ आमच्या सर्व्हरला सुरक्षित कनेक्शनद्वारे एन्कोड केलेला डेटा म्हणून पाठविला जातो</li>
          <li>प्रक्रिया केल्यानंतर, ऑडिओ डेटा सर्व्हर मेमरीमधून टाकून दिला जातो</li>
          <li>मजकूर उतारा तुमच्या दुकानाच्या ऑडिट लॉगमध्ये संग्रहित केला जातो ज्यामुळे तुम्ही मागील क्रियांचे पुनरावलोकन करू शकता</li>
        </ul>

        <h3>1.3 इन्व्हेंटरी आणि व्यवसाय डेटा</h3>
        <p>तुम्ही ॲप वापरता तेव्हा, तुम्ही तयार केलेला व्यवसाय डेटा आम्ही संग्रहित करतो:</p>
        <ul>
          <li>दुकानाची माहिती (नाव, श्रेणी, पसंतीची भाषा)</li>
          <li>उत्पादन कॅटलॉग (नावे, बारकोड, श्रेणी, युनिट्स, किमती)</li>
          <li>स्टॉकचे प्रमाण, बॅच क्रमांक, खरेदीच्या तारखा, कालबाह्यता तारखा, पुरवठादारांची नावे</li>
          <li>सूची आयटम आणि नोट्स खरेदी</li>
          <li>ऑडिट लॉग रेकॉर्डिंग इन्व्हेंटरी बदल (कृती प्रकार, वापरकर्ता, टाइमस्टॅम्प, उतारा, आत्मविश्वास स्कोअर)</li>
        </ul>

        <h3>1.4 वापरकर्ता प्राधान्ये</h3>
        <ul>
          <li>ॲप भाषा आणि आवाज भाषा निवड</li>
          <li>व्हॉइस फीडबॅक प्राधान्य (चालू/बंद)</li>
          <li>प्रदर्शन सेटिंग्ज (उच्च कॉन्ट्रास्ट मोड, मजकूर आकार)</li>
          <li>डीफॉल्ट मापन युनिट</li>
          <li>सूचना प्राधान्ये</li>
        </ul>

        <h3>1.5 दुकान सदस्यत्व डेटा</h3>
        <ul>
          <li>प्रत्येक दुकानात तुमची भूमिका (Owner, Manager, किंवा Helper)</li>
          <li>संघ सहयोगासाठी व्युत्पन्न केलेले आमंत्रण कोड</li>
          <li>दुकानांमध्ये शेवटचे सक्रिय टाइमस्टॅम्प</li>
        </ul>

        <h3>1.6 डिव्हाइस आणि डायग्नोस्टिक डेटा</h3>
        <p>उत्पादन बिल्डमध्ये, आम्ही क्रॅश रिपोर्टिंगसाठीSentryवापरतो. हे गोळा करते:</p>
        <ul>
          <li>डिव्हाइस प्रकार, ऑपरेटिंग सिस्टम आणि ॲप आवृत्ती</li>
          <li>क्रॅश अहवाल आणि त्रुटी स्टॅक ट्रेस</li>
          <li>कार्यप्रदर्शन डेटा (सत्रांच्या 20% वर नमुना)</li>
        </ul>
        <p>डेव्हलपमेंट बिल्डमध्ये क्रॅश रिपोर्टिंग अक्षम केले आहे आणि आम्ही लागू करत असलेल्या सॅम्पलिंग रेटद्वारे कमी केले जाऊ शकते.</p>
      </div>
    </details>

    <details id="s2">
      <summary><h2>2. आम्ही तुमची माहिती कशी वापरतो</h2></summary>
      <div class="section-content">
        <ul>
          <li><strong>सेवा प्रदान करा:</strong> व्हॉइस कमांडवर प्रक्रिया करा, इन्व्हेंटरी व्यवस्थापित करा आणि तुमच्या टीममध्ये डेटा सिंक करा</li>
          <li><strong>प्रमाणीकरण:</strong> तुमची ओळख सत्यापित करा आणि सुरक्षित सत्रे व्यवस्थापित करा</li>
          <li><strong>ऑडिट ट्रेल:</strong> जबाबदारी आणि पुनरावलोकनासाठी यादीतील बदलांचा लॉग ठेवा</li>
          <li><strong>सेवा सुधारा:</strong> अनामित त्रुटी अहवालाद्वारे बग आणि क्रॅशचे निदान करा</li>
          <li><strong>संप्रेषण:</strong> खाते-संबंधित आवश्यक सूचना पाठवा (उदा. पासवर्ड रीसेट करा)</li>
        </ul>
        <p>आम्ही करतो <strong>नाही</strong> तुमचा डेटा जाहिरातीसाठी वापरतो आणि आम्ही करतो <strong>नाही</strong> तुमची वैयक्तिक माहिती तृतीय पक्षांना विकणे.</p>
      </div>
    </details>

    <details id="s3">
      <summary><h2>3. तृतीय-पक्ष सेवा</h2></summary>
      <div class="section-content">
        <p>ॲप ऑपरेट करण्यासाठी आम्ही खालील तृतीय-पक्ष सेवा वापरतो:</p>
        <table>
          <thead>
            <tr>
              <th>सेवा</th>
              <th>उद्देश</th>
              <th>डेटा शेअर केला</th>
              <th>गोपनीयता धोरण</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Clerk</strong></td>
              <td>प्रमाणीकरण आणि सत्र व्यवस्थापन</td>
              <td>Email, नाव, OAuth टोकन, सत्र डेटा</td>
              <td><a href="https://clerk.com/legal/privacy" target="_blank" rel="noopener">clerk.com/legal/privacy</a></td>
            </tr>
            <tr>
              <td><strong>Sarvam AI</strong></td>
              <td>व्हॉइस प्रोसेसिंग (स्पीच-टू-टेक्स्ट, नॅचरल लँग्वेज प्रोसेसिंग, टेक्स्ट-टू-स्पीच)</td>
              <td>ऑडिओ रेकॉर्डिंग, उतारा मजकूर, भाषा कोड</td>
              <td><a href="https://www.sarvam.ai/privacy-policy" target="_blank" rel="noopener">sarvam.ai/privacy-policy</a></td>
            </tr>
            <tr>
              <td><strong>Neon</strong></td>
              <td>डेटाबेस होस्टिंग (PostgreSQL)</td>
              <td>सर्व कायम असलेला अनुप्रयोग डेटा</td>
              <td><a href="https://neon.tech/privacy-policy" target="_blank" rel="noopener">neon.tech/privacy-policy</a></td>
            </tr>
            <tr>
              <td><strong>Sentry</strong></td>
              <td>एरर ट्रॅकिंग आणि क्रॅश रिपोर्टिंग</td>
              <td>क्रॅश अहवाल, डिव्हाइस माहिती (फक्त उत्पादन)</td>
              <td><a href="https://sentry.io/privacy/" target="_blank" rel="noopener">sentry.io/privacy</a></td>
            </tr>
          </tbody>
        </table>
        <p>प्रत्येक तृतीय-पक्ष सेवा त्यांच्या स्वतःच्या गोपनीयता धोरणानुसार डेटावर प्रक्रिया करते. आम्ही तुम्हाला त्यांच्या धोरणांचे पुनरावलोकन करण्यास प्रोत्साहित करतो.</p>
      </div>
    </details>

    <details id="s4">
      <summary><h2>4. डेटा स्टोरेज आणि सुरक्षा</h2></summary>
      <div class="section-content">
        <ul>
          <li>ऍप्लिकेशन डेटा Neon PostgreSQL डेटाबेसमध्ये SSL/TLS एन्क्रिप्शनसह ट्रान्झिटमध्ये संग्रहित केला जातो.</li>
          <li>ऑथेंटिकेशन टोकन तुमच्या डिव्हाइसवर सुरक्षित स्टोरेज वापरून संग्रहित केले जातात.</li>
          <li>API संप्रेषण HTTPS एन्क्रिप्शन वापरते</li>
          <li>दुरुपयोग टाळण्यासाठी संवेदनशील एंडपॉइंट्स रेट-मर्यादित आहेत</li>
          <li>Clerk द्वारे पासवर्ड हॅश आणि व्यवस्थापित केले जातात — आम्ही प्लेनटेक्स्ट पासवर्ड कधीही साठवत नाही</li>
        </ul>
      </div>
    </details>

    <details id="s5">
      <summary><h2>5. डेटा धारणा</h2></summary>
      <div class="section-content">
        <ul>
          <li><strong>व्हॉइस ऑडिओ:</strong> क्षणभंगुर — मेमरीमध्ये प्रक्रिया केली जाते आणि लगेच टाकून दिली जाते. आमच्या सर्व्हरवर कधीही संग्रहित केले नाही.</li>
          <li><strong>उतारा आणि ऑडिट लॉग:</strong> जोपर्यंत तुमचे खाते सक्रिय आहे तोपर्यंत राखून ठेवले आहे, तुमच्या संदर्भासाठी.</li>
          <li><strong>इन्व्हेंटरी डेटा:</strong> जोपर्यंत तुमचे खाते सक्रिय आहे तोपर्यंत ठेवली जाते.</li>
          <li><strong>खाते डेटा:</strong> तुम्ही तुमचे खाते हटेपर्यंत राखून ठेवले.</li>
          <li><strong>क्रॅश अहवाल:</strong> Sentry च्या डेटा रिटेंशन पॉलिसीनुसार (सामान्यत: 90 दिवस).</li>
        </ul>
      </div>
    </details>

    <details id="s6">
      <summary><h2>6. खाते हटवणे</h2></summary>
      <div class="section-content">
        <p>वरून तुम्ही तुमचे खाते कधीही हटवू शकता <strong>Settings > Delete Account</strong> ॲपमध्ये. तुम्ही तुमचे खाते हटवता तेव्हा:</p>
        <ul>
          <li>सर्व उत्पादने, इन्व्हेंटरी, बॅचेस, खरेदी सूची आणि AI अंदाजांसह तुमच्या मालकीची सर्व दुकाने कायमची हटवली आहेत.</li>
          <li>तुमचे सर्व ऑडिट लॉग आणि प्राधान्ये कायमची हटवली आहेत</li>
          <li>इतर वापरकर्त्यांच्या दुकानातील तुमची सदस्यत्वे काढून टाकली आहेत</li>
          <li>Clerk सह तुमचे प्रमाणीकरण खाते कायमचे हटवले आहे</li>
        </ul>
        <p><strong>ही क्रिया अपरिवर्तनीय आहे.</strong> एकदा हटवल्यानंतर, तुमचा डेटा पुनर्प्राप्त केला जाऊ शकत नाही.</p>
      </div>
    </details>

    <details id="s7">
      <summary><h2>7. दुकानांमध्ये डेटा शेअरिंग</h2></summary>
      <div class="section-content">
        <p>Samaan-Bol एक सहयोगी साधन आहे. तुम्ही दुकानाचे सदस्य असताना:</p>
        <ul>
          <li>दुकानातील सर्व सदस्य (Owner, Manager, Helper) दुकानाचा इन्व्हेंटरी डेटा, उत्पादन कॅटलॉग आणि ऑडिट लॉग पाहू शकतात</li>
          <li>तुमचे नाव, भूमिका आणि ॲक्टिव्हिटी टाइमस्टॅम्प इतर दुकानातील सदस्यांना दिसतील</li>
          <li>Owner त्यांच्या दुकानासाठी सदस्यत्व आणि प्रवेश व्यवस्थापित करू शकतात</li>
        </ul>
        <p>आम्ही तुमचा डेटा ज्या दुकानांचे तुम्ही सदस्य नसता, किंवा कोणत्याही असंबंधित तृतीय पक्षांसोबत शेअर करत नाही.</p>
      </div>
    </details>

    <details id="s8">
      <summary><h2>8. मुलांची गोपनीयता</h2></summary>
      <div class="section-content">
        <p>Samaan-Bol हे 13 वर्षांखालील मुलांसाठी वापरण्यासाठी नाही. आम्ही 13 वर्षांखालील मुलांकडून जाणूनबुजून वैयक्तिक माहिती संकलित करत नाही. एखाद्या मुलाने आम्हाला वैयक्तिक माहिती दिली आहे असे तुम्हाला वाटत असल्यास, कृपया आमच्याशी संपर्क साधा आणि आम्ही ती त्वरित हटवू.</p>
      </div>
    </details>

    <details id="s9">
      <summary><h2>9. तुमचे हक्क</h2></summary>
      <div class="section-content">
        <p>तुम्हाला याचा अधिकार आहे:</p>
        <ul>
          <li><strong>तुमच्या डेटामध्ये प्रवेश करा:</strong> ॲपमध्ये तुमची इन्व्हेंटरी, ऑडिट लॉग आणि प्राधान्ये पहा</li>
          <li><strong>तुमचा डेटा हटवा:</strong> सेटिंग्जमध्ये खाते हटविण्याचे वैशिष्ट्य वापरा</li>
          <li><strong>नियंत्रण प्राधान्ये:</strong> तुमची भाषा, प्रदर्शन आणि व्हॉइस सेटिंग्ज कधीही बदला</li>
          <li><strong>दुकानातून पैसे काढा:</strong> तुम्ही ज्याचे सदस्य आहात ते दुकान सोडा</li>
        </ul>
      </div>
    </details>

    <details id="s10">
      <summary><h2>10. या धोरणातील बदल</h2></summary>
      <div class="section-content">
        <p>आम्ही हे गोपनीयता धोरण वेळोवेळी अद्यतनित करू शकतो. आम्ही असे केल्यावर, आम्ही या पृष्ठाच्या शीर्षस्थानी "प्रभावी तारीख" अद्यतनित करू. आम्ही तुम्हाला या धोरणाचे वेळोवेळी पुनरावलोकन करण्यास प्रोत्साहित करतो. बदलानंतर ॲपचा सतत वापर केल्यास अपडेट केलेल्या धोरणाची स्वीकृती होते.</p>
      </div>
    </details>

    <details id="s11">
      <summary><h2>11. आमच्याशी संपर्क साधा</h2></summary>
      <div class="section-content">
        <p>तुम्हाला या गोपनीयता धोरणाबद्दल किंवा तुमच्या डेटाबद्दल काही प्रश्न असल्यास, कृपया आमच्याशी येथे संपर्क साधा:</p>
        <p><strong>Email:</strong> <a href="mailto:meetslimshady07@gmail.com">meetslimshady07@gmail.com</a></p>
      </div>
    </details>

    <p class="copyright">© 2026 Samaan-Bol. सर्व हक्क राखीव.</p>
  </div>

  <button class="back-to-top" id="backToTop" aria-label="Back to top">↑</button>`,
    terms: `<div class="reading-progress" id="readingProgress"></div>

  <div class="container">
    <a href="/" class="back">← घरी परत</a>
    <h1>सेवा अटी</h1>
    <p class="effective">प्रभावी तारीख: 23 फेब्रुवारी 2026</p>

    <nav class="toc">
      <h3>सामग्री</h3>
      <ol>
        <li><a href="#s1">सेवेचे वर्णन</a></li>
        <li><a href="#s2">खाते नोंदणी</a></li>
        <li><a href="#s3">वापरकर्ता भूमिका आणि जबाबदाऱ्या</a></li>
        <li><a href="#s4">व्हॉइस इनपुट</a></li>
        <li><a href="#s5">स्वीकार्य वापर</a></li>
        <li><a href="#s6">तुमचा डेटा</a></li>
        <li><a href="#s7">सेवा उपलब्धता</a></li>
        <li><a href="#s8">दर मर्यादा</a></li>
        <li><a href="#s9">खाते समाप्त</a></li>
        <li><a href="#s10">बौद्धिक संपदा</a></li>
        <li><a href="#s11">हमींचा अस्वीकरण</a></li>
        <li><a href="#s12">दायित्वाची मर्यादा</a></li>
        <li><a href="#s13">या अटींमध्ये बदल</a></li>
        <li><a href="#s14">नियमन कायदा</a></li>
        <li><a href="#s15">आमच्याशी संपर्क साधा</a></li>
      </ol>
    </nav>

    <p>Samaan-Bol मध्ये तुमचे स्वागत आहे. या सेवा अटी ("अटी") तुमचाSamaan-Bolमोबाइल ॲप्लिकेशन आणि संबंधित सेवांचा (एकत्रितपणे, "सेवा") वापर नियंत्रित करतात. खाते तयार करून किंवा सेवा वापरून, तुम्ही या अटींना बांधील असण्यास सहमती देता.</p>

    <details open id="s1">
      <summary><h2>1. सेवेचे वर्णन</h2></summary>
      <div class="section-content">
        <p>Samaan-Bol हा भारतीय रिटेल व्यवसायांसाठी डिझाइन केलेला आवाज-प्रथम सहयोगी इन्व्हेंटरी मॅनेजमेंट ॲप्लिकेशन आहे. सेवा तुम्हाला याची अनुमती देते:</p>
        <ul>
          <li>एकाधिक भारतीय भाषांमध्ये व्हॉइस कमांड वापरून उत्पादन सूची व्यवस्थापित करा</li>
          <li>स्टॉक पातळी, बॅचेस, कालबाह्यता तारखा आणि खरेदी माहितीचा मागोवा घ्या</li>
          <li>भूमिका-आधारित प्रवेशाद्वारे कार्यसंघ सदस्यांसह सहयोग करा (Owner, Manager, Helper)</li>
          <li>सर्व इन्व्हेंटरी बदलांचे ऑडिट ट्रेल्स पहा</li>
          <li>खरेदी सूची व्यवस्थापित करा आणि स्टॉक-स्तरीय सूचना प्राप्त करा</li>
        </ul>
      </div>
    </details>

    <details id="s2">
      <summary><h2>2. खाते नोंदणी</h2></summary>
      <div class="section-content">
        <p>सेवा वापरण्यासाठी, तुम्ही अचूक आणि संपूर्ण माहिती देऊन खाते तयार केले पाहिजे. तुम्ही यासाठी जबाबदार आहात:</p>
        <ul>
          <li>तुमच्या खात्याच्या क्रेडेन्शियल्सची गोपनीयता राखणे</li>
          <li>तुमच्या खात्याखाली होणारी सर्व क्रियाकलाप</li>
          <li>तुमच्या खात्याच्या कोणत्याही अनधिकृत वापराबद्दल आम्हाला त्वरित सूचित करणे</li>
        </ul>
        <p>खाते तयार करण्यासाठी आणि सेवा वापरण्यासाठी तुमचे वय किमान १३ वर्षे असणे आवश्यक आहे.</p>
      </div>
    </details>

    <details id="s3">
      <summary><h2>3. वापरकर्ता भूमिका आणि जबाबदाऱ्या</h2></summary>
      <div class="section-content">
        <p>Samaan-Bol भूमिका-आधारित प्रवेश नियंत्रण प्रणाली वापरते:</p>
        <ul>
          <li><strong>Owner:</strong> दुकाने तयार करते आणि व्यवस्थापित करते, कार्यसंघ सदस्यांना आमंत्रित करते, सर्व शॉप डेटा आणि सेटिंग्जमध्ये पूर्ण प्रवेश असतो आणि दुकान हटवू शकतात</li>
          <li><strong>Manager:</strong> इन्व्हेंटरी व्यवस्थापित करू शकतात, अहवाल पाहू शकतात आणि दुकानात बहुतेक ऑपरेशन्स करू शकतात</li>
          <li><strong>Helper:</strong> निर्देशानुसार स्टॉक आयटम जोडू आणि काढू शकता</li>
        </ul>
        <p>Owner म्हणून, तुम्ही तुमच्या दुकानात प्रवेश आणि त्यातील डेटा व्यवस्थापित करण्यासाठी जबाबदार आहात. तुम्ही सदस्यांना आमंत्रित करता तेव्हा ते तुमच्या दुकानाच्या इन्व्हेंटरी डेटामध्ये प्रवेश मिळवतात.</p>
      </div>
    </details>

    <details id="s4">
      <summary><h2>4. व्हॉइस इनपुट</h2></summary>
      <div class="section-content">
        <p>सेवा तृतीय-पक्ष AI सेवा वापरून व्हॉइस कमांडवर प्रक्रिया करते. कृपया लक्षात ठेवा की:</p>
        <ul>
          <li>व्हॉइस रेकॉर्डिंग प्रति कमांड कमाल 30 सेकंदांपर्यंत मर्यादित आहेत</li>
          <li>ही सेवा इंग्रजी, हिंदी, तमिळ, तेलुगु, बंगाली, मराठी, कन्नड, गुजराती, मल्याळम आणि हिंग्लिश यासह अनेक भाषांना समर्थन देते</li>
          <li>आवाज ओळखण्याची अचूकता ऑडिओ गुणवत्ता, पार्श्वभूमी आवाज, उच्चारण आणि भाषा स्पष्टता यावर अवलंबून असते</li>
          <li>अचूकतेची पुष्टी करण्यासाठी तुम्ही व्हॉइस-प्रक्रिया केलेल्या यादीतील बदलांचे पुनरावलोकन केले पाहिजे</li>
          <li>व्हॉइस ऑडिओवर रिअल-टाइममध्ये प्रक्रिया केली जाते आणि ती कायमस्वरूपी संग्रहित केली जात नाही (आमचे पहा <a href="/privacy-policy">गोपनीयता धोरण</a> तपशीलांसाठी)</li>
        </ul>
      </div>
    </details>

    <details id="s5">
      <summary><h2>5. स्वीकार्य वापर</h2></summary>
      <div class="section-content">
        <p>आपण सहमत नाही की:</p>
        <ul>
          <li>कोणत्याही बेकायदेशीर हेतूसाठी सेवा वापरा</li>
          <li>इतर वापरकर्त्यांच्या खात्यांमध्ये किंवा दुकानांमध्ये अनधिकृत प्रवेश मिळवण्याचा प्रयत्न</li>
          <li>सेवा किंवा तिच्या पायाभूत सुविधांमध्ये हस्तक्षेप किंवा व्यत्यय आणणे</li>
          <li>रिव्हर्स-इंजिनियर, डिकंपाइल किंवा ऍप्लिकेशन वेगळे करा</li>
          <li>सामान्य वापर पद्धतींच्या पलीकडे सेवेमध्ये प्रवेश करण्यासाठी स्वयंचलित साधने वापरा</li>
          <li>आमंत्रण कोड सार्वजनिकरित्या किंवा तुमच्या दुकानात सामील होण्याचा हेतू नसलेल्या व्यक्तींसोबत शेअर करा</li>
          <li>दुकानात तुमची ओळख किंवा भूमिका चुकीची मांडणे</li>
        </ul>
      </div>
    </details>

    <details id="s6">
      <summary><h2>6. तुमचा डेटा</h2></summary>
      <div class="section-content">
        <p>तुम्ही सेवेमध्ये (उत्पादन माहिती, इन्व्हेंटरी रेकॉर्ड इ.) प्रविष्ट करता त्या व्यवसाय डेटाची मालकी तुम्ही कायम ठेवता. आम्ही तुमच्या सामग्रीच्या मालकीचा दावा करत नाही.</p>
        <p>सेवा वापरून, तुम्ही आम्हाला तुमचा डेटा संग्रहित करण्यासाठी, प्रक्रिया करण्यासाठी आणि प्रसारित करण्याचा मर्यादित परवाना केवळ सेवा प्रदान करण्याच्या आणि सुधारण्याच्या उद्देशाने देता.</p>
        <p>आम्ही तुमचा डेटा कसा संकलित करतो, वापरतो आणि संरक्षित करतो याबद्दल तपशीलांसाठी, कृपया आमचे पुनरावलोकन करा <a href="/privacy-policy">गोपनीयता धोरण</a>.</p>
      </div>
    </details>

    <details id="s7">
      <summary><h2>7. सेवा उपलब्धता</h2></summary>
      <div class="section-content">
        <p>आम्ही सेवा नेहमी उपलब्ध ठेवण्याचा प्रयत्न करतो, परंतु आम्ही अखंड प्रवेशाची हमी देत ​​नाही. खालील कारणांमुळे सेवा तात्पुरती अनुपलब्ध असू शकते:</p>
        <ul>
          <li>नियोजित देखभाल किंवा अद्यतने</li>
          <li>आमच्या नियंत्रणाबाहेरील तांत्रिक समस्या</li>
          <li>तृतीय-पक्ष सेवा आउटेज (प्रमाणीकरण, व्हॉइस प्रोसेसिंग, डेटाबेस होस्टिंग)</li>
        </ul>
        <p>सेवा डाउनटाइममुळे होणाऱ्या कोणत्याही नुकसानासाठी आम्ही जबाबदार नाही.</p>
      </div>
    </details>

    <details id="s8">
      <summary><h2>8. दर मर्यादा</h2></summary>
      <div class="section-content">
        <p>वाजवी वापर आणि सेवा स्थिरता सुनिश्चित करण्यासाठी, सेवा API विनंत्यांवर दर मर्यादा लागू करते. या मर्यादा ओलांडल्याने तुमच्या विनंत्या तात्पुरत्या थ्रॉटलिंगमध्ये येऊ शकतात.</p>
      </div>
    </details>

    <details id="s9">
      <summary><h2>9. खाते समाप्त</h2></summary>
      <div class="section-content">
        <p>याद्वारे तुम्ही तुमचे खाते कधीही हटवू शकता <strong>Settings > Delete Account</strong> ॲप मध्ये. खाते हटवणे कायमचे आणि अपरिवर्तनीय आहे — तुमची सर्व दुकाने, इन्व्हेंटरी डेटा, ऑडिट लॉग आणि प्राधान्ये कायमची काढून टाकली जातील.</p>
        <p>या अटींचे उल्लंघन करणारी किंवा अपमानास्पद वागणूक देणारी खाती निलंबित किंवा संपुष्टात आणण्याचा अधिकार आम्ही राखून ठेवतो.</p>
      </div>
    </details>

    <details id="s10">
      <summary><h2>10. बौद्धिक संपदा</h2></summary>
      <div class="section-content">
        <p>Samaan-Bol ॲप्लिकेशन, त्याची रचना, कोड, ब्रँडिंग आणि दस्तऐवजीकरण, आमची बौद्धिक संपदा आहे. तुम्ही आमच्या लेखी परवानगीशिवाय अर्जावर आधारित व्युत्पन्न कामे कॉपी, सुधारित, वितरित किंवा तयार करू शकत नाही.</p>
      </div>
    </details>

    <details id="s11">
      <summary><h2>11. हमींचा अस्वीकरण</h2></summary>
      <div class="section-content">
        <p>सेवा "जशी आहे तशी" आणि "जशी उपलब्ध आहे" कोणत्याही प्रकारच्या वॉरंटीशिवाय प्रदान केली जाते, मग ते व्यक्त किंवा निहित. आम्ही विशेषतः वॉरंटी नाकारतो:</p>
        <ul>
          <li>विशिष्ट हेतूसाठी व्यापारीता किंवा फिटनेस</li>
          <li>आवाज ओळखणे किंवा AI-व्युत्पन्न सूचनांची अचूकता</li>
          <li>अखंडित किंवा त्रुटी-मुक्त ऑपरेशन</li>
        </ul>
        <p>व्हॉइस-आधारित इन्व्हेंटरी कृती ही सहाय्यक आहेत — तुम्ही गंभीर स्टॉक निर्णयांची स्वतंत्रपणे पडताळणी केली पाहिजे.</p>
      </div>
    </details>

    <details id="s12">
      <summary><h2>12. दायित्वाची मर्यादा</h2></summary>
      <div class="section-content">
        <p>कायद्याने परवानगी दिलेल्या कमाल मर्यादेपर्यंत, आम्ही तुमच्या सेवेच्या वापरामुळे उद्भवलेल्या कोणत्याही अप्रत्यक्ष, आनुषंगिक, विशेष, परिणामी किंवा दंडात्मक हानीसाठी जबाबदार राहणार नाही, यासह परंतु इतकेच मर्यादित नाही:</p>
        <ul>
          <li>आवाज ओळखण्याच्या त्रुटींमुळे इन्व्हेंटरी विसंगती</li>
          <li>सेवा डाउनटाइममुळे व्यवसायाचे नुकसान</li>
          <li>आमच्या मानक बॅकअप प्रक्रियेद्वारे कव्हर केलेल्या डेटाच्या पलीकडे डेटा हानी</li>
        </ul>
      </div>
    </details>

    <details id="s13">
      <summary><h2>13. या अटींमध्ये बदल</h2></summary>
      <div class="section-content">
        <p>आम्ही या अटी वेळोवेळी अपडेट करू शकतो. आम्ही असे केल्यावर, आम्ही या पृष्ठाच्या शीर्षस्थानी "प्रभावी तारीख" अद्यतनित करू. बदलांनंतर सेवेचा वापर सुरू ठेवल्याने अद्ययावत अटींची स्वीकृती होते.</p>
      </div>
    </details>

    <details id="s14">
      <summary><h2>14. नियमन कायदा</h2></summary>
      <div class="section-content">
        <p>या अटी भारताच्या कायद्यांनुसार शासित केल्या जातील आणि त्यांचा अर्थ लावला जाईल. या अटी किंवा सेवेवरून उद्भवणारे कोणतेही विवाद भारतातील न्यायालयांच्या विशेष अधिकारक्षेत्राच्या अधीन असतील.</p>
      </div>
    </details>

    <details id="s15">
      <summary><h2>15. आमच्याशी संपर्क साधा</h2></summary>
      <div class="section-content">
        <p>तुम्हाला या अटींबद्दल काही प्रश्न असल्यास, कृपया आमच्याशी येथे संपर्क साधा:</p>
        <p><strong>Email:</strong> <a href="mailto:meetslimshady07@gmail.com">meetslimshady07@gmail.com</a></p>
      </div>
    </details>

    <p class="copyright">© 2026 Samaan-Bol. सर्व हक्क राखीव.</p>
  </div>

  <button class="back-to-top" id="backToTop" aria-label="Back to top">↑</button>`,
  },
  "kn": {
    home: `<!-- Three.js background canvas -->
<canvas id="bgCanvas"></canvas>

<!-- Aurora ambient background (WebGL fallback) -->
<div class="aurora-bg"><div class="aurora-orb"></div></div>

<!-- Scroll progress indicator -->
<div class="scroll-progress" id="scrollProgress"></div>

<!-- ═══ NAVIGATION ═══ -->
<nav id="nav">
  <div class="container">
    <div class="nav-inner">
      <a href="#" class="logo">
        <div class="logo-mark"><svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><defs><mask id="stencil-nav"><rect x="0" y="0" width="100" height="100" fill="white"/><rect x="24" y="18" width="52" height="8" rx="4" fill="black"/><rect x="38" y="18" width="24" height="36" rx="12" fill="black"/><path d="M 28 42 A 22 22 0 0 0 72 42" fill="none" stroke="black" stroke-width="8" stroke-linecap="round"/><rect x="46" y="72" width="8" height="10" rx="4" fill="black"/><rect x="36" y="32" width="28" height="4" fill="white"/><rect x="36" y="44" width="28" height="4" fill="white"/></mask></defs><circle cx="50" cy="50" r="50" fill="#ea580c" mask="url(#stencil-nav)"/></svg></div>
        <div class="logo-text">ಸಮಾನ್<span>ಬೊಲ್</span></div>
      </a>
      <ul class="nav-links">
        <li><a href="#how">ಇದು ಹೇಗೆ ಕೆಲಸ ಮಾಡುತ್ತದೆ</a></li>
        <li><a href="#features">ವೈಶಿಷ್ಟ್ಯಗಳು</a></li>
        <li><a href="#ai">AI ಇಂಟೆಲಿಜೆನ್ಸ್</a></li>
        <li><a href="#languages">ಭಾಷೆಗಳು</a></li>
        <li><a href="https://apps.apple.com/in/app/samaan-bol/id6759739444" class="nav-cta">ಅಪ್ಲಿಕೇಶನ್ ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ</a></li>
      </ul>
      <button class="mobile-menu-btn" aria-label="Menu">☰</button>
    </div>
  </div>
</nav>

<!-- ═══ HERO ═══ -->
<section class="hero">
  <div class="container">
    <div class="hero-grid">
      <div>
        <div class="hero-eyebrow">ಭಾರತೀಯ ಚಿಲ್ಲರೆ ವ್ಯಾಪಾರಕ್ಕಾಗಿ ಧ್ವನಿ-ಮೊದಲ ದಾಸ್ತಾನು</div>
        <h1 class="hero-text-reveal">
          <span class="hindi-line hindi">बोल के सँभालो अपना बिज़नेस</span>
          <span class="hero-text-main">ನಿಮ್ಮ ಅಂಗಡಿಯನ್ನು ನಿರ್ವಹಿಸಿ<br>ನಿಮ್ಮ ಧ್ವನಿಯೊಂದಿಗೆ</span>
        </h1>
        <p class="hero-sub">
          ಒಳಗೆ ಮಾತನಾಡಿ <span class="hero-rotate"><span class="hero-rotate-word active">ಹಿಂದಿ</span><span class="hero-rotate-word">ಬೆಂಗಾಲಿ</span><span class="hero-rotate-word">ತಮಿಳು</span><span class="hero-rotate-word">ತೆಲುಗು</span><span class="hero-rotate-word">ಮರಾಠಿ</span><span class="hero-rotate-word">ಇಂಗ್ಲೀಷ್</span></span>, ಅಥವಾ 10 ಭಾರತೀಯ ಭಾಷೆಗಳಲ್ಲಿ ಯಾವುದಾದರೂ.Samaan-Bol’s AI ನಿಮ್ಮ ಆಜ್ಞೆಯನ್ನು ಅರ್ಥಮಾಡಿಕೊಳ್ಳುತ್ತದೆ, ನಿಮ್ಮ ದಾಸ್ತಾನುಗಳನ್ನು ನವೀಕರಿಸುತ್ತದೆ,
          ಮತ್ತು ನಿಮ್ಮ ವ್ಯಾಪಾರವನ್ನು ಚಾಲನೆಯಲ್ಲಿಡುತ್ತದೆ - ಹ್ಯಾಂಡ್ಸ್-ಫ್ರೀ.
        </p>
        <div class="hero-actions">
          <a href="#download" class="btn-primary">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            ಉಚಿತವಾಗಿ ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ
          </a>
          <a href="#how" class="btn-secondary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            ಇದನ್ನು ಕ್ರಿಯೆಯಲ್ಲಿ ನೋಡಿ
          </a>
        </div>
        <div class="hero-stats">
          <div class="hero-stat">
            <div class="hero-stat-number">11</div>
            <div class="hero-stat-label">ಬೆಂಬಲಿತ ಭಾಷೆಗಳು</div>
          </div>
          <div class="hero-stat">
            <div class="hero-stat-number">50K+</div>
            <div class="hero-stat-label">ಐಟಂಗಳನ್ನು ಪ್ರತಿದಿನ ಟ್ರ್ಯಾಕ್ ಮಾಡಲಾಗುತ್ತದೆ</div>
          </div>
          <div class="hero-stat">
            <div class="hero-stat-number">2ನಿಮಿ</div>
            <div class="hero-stat-label">ಸೆಟಪ್ ಸಮಯ</div>
          </div>
        </div>
      </div>

      <div class="hero-visual">
        <!-- Floating cards (z-index 10 — in FRONT of phone) -->
        <div class="float-card float-card--voice">
          <div class="float-card-icon float-card-icon--voice"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg></div>
          <p><strong class="hindi">"चावल 5 किलो जोड़ दो"</strong></p>
          <p style="margin-top:6px; font-size:12px; color:var(--success);">✓ Basmati Rice — 18 → 23 ಕೆಜಿ</p>
        </div>

        <div class="float-card float-card--alert">
          <div class="float-card-icon float-card-icon--alert"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg></div>
          <p><strong>ಕಡಿಮೆ ಸ್ಟಾಕ್ ಎಚ್ಚರಿಕೆ</strong></p>
          <p style="margin-top:4px; font-size:12px;">ಅಟ್ಟಾ 3 ದಿನಗಳಲ್ಲಿ ಖಾಲಿಯಾಗಬಹುದು</p>
        </div>

        <!-- Phone mockup — mirrors actual app UI -->
        <div class="phone-frame">
          <div class="phone-notch"></div>
          <div class="phone-screen">
            <div class="phone-status-bar">
              <span>9:41</span>
              <span style="display:flex; gap:4px; align-items:center;">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z"/></svg>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><rect x="17" y="4" width="4" height="16" rx="1"/><rect x="11" y="8" width="4" height="12" rx="1"/><rect x="5" y="12" width="4" height="8" rx="1"/></svg>
                <svg width="14" height="12" viewBox="0 0 28 14" fill="currentColor"><rect x="0" y="1" width="22" height="12" rx="2" stroke="currentColor" fill="none" stroke-width="1.5"/><rect x="24" y="4.5" width="3" height="5" rx="1"/><rect x="2" y="3" width="14" height="8" rx="1"/></svg>
              </span>
            </div>

            <!-- Header: greeting + bell -->
            <div class="phone-header">
              <div>
                <div class="phone-greeting">ಶುಭೋದಯ! 👋</div>
                <div class="phone-subtext">Priya General Store</div>
              </div>
              <div class="phone-bell">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B6B70" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                <div class="phone-bell-badge">3</div>
              </div>
            </div>

            <!-- Search bar with mic icon -->
            <div class="phone-search">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4A4A50" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <span class="phone-search-text">ಉತ್ಪನ್ನಗಳನ್ನು ಹುಡುಕಿ...</span>
              <div class="phone-search-mic">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0D0D12" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/></svg>
              </div>
            </div>

            <!-- 2x2 Stats grid -->
            <div class="phone-stats-grid">
              <div class="phone-stat-card phone-stat-card--total">
                <div class="phone-stat-number">142</div>
                <div class="phone-stat-label">ಒಟ್ಟು ವಸ್ತುಗಳು</div>
              </div>
              <div class="phone-stat-card phone-stat-card--low">
                <div class="phone-stat-number" style="color:var(--warning);">8</div>
                <div class="phone-stat-label">ಕಡಿಮೆ ಸ್ಟಾಕ್</div>
              </div>
              <div class="phone-stat-card phone-stat-card--out">
                <div class="phone-stat-number" style="color:var(--danger);">2</div>
                <div class="phone-stat-label">ಸ್ಟಾಕ್ ಮುಗಿದಿದೆ</div>
              </div>
              <div class="phone-stat-card phone-stat-card--activity">
                <div class="phone-stat-number" style="color:var(--success);">23</div>
                <div class="phone-stat-label">ಇಂದು ನವೀಕರಿಸಲಾಗಿದೆ</div>
              </div>
            </div>

            <!-- Filter chips -->
            <div class="phone-filter-row">
              <span class="phone-chip phone-chip--active">ಎಲ್ಲಾ</span>
              <span class="phone-chip">ಕಡಿಮೆ ಸ್ಟಾಕ್</span>
              <span class="phone-chip">ಔಟ್</span>
              <span class="phone-chip">ಅವಧಿ ಮುಗಿಯುತ್ತಿದೆ</span>
            </div>

            <!-- Product cards -->
            <div class="phone-product">
              <div class="phone-product-icon" style="background:rgba(255,181,71,0.12);">🍚</div>
              <div class="phone-product-info">
                <div class="phone-product-name">Basmati Rice</div>
                <div class="phone-product-meta">ಧಾನ್ಯಗಳು · 2ನಿ ಹಿಂದೆ ನವೀಕರಿಸಲಾಗಿದೆ</div>
              </div>
              <div class="phone-product-qty">
                <div class="phone-product-qty-num">23</div>
                <div class="phone-product-qty-unit">ಕೆ.ಜಿ</div>
              </div>
            </div>

            <div class="phone-product">
              <div class="phone-product-icon" style="background:rgba(255,107,0,0.12);">🫒</div>
              <div class="phone-product-info">
                <div class="phone-product-name">Aashirvaad Atta</div>
                <div class="phone-product-meta">ಹಿಟ್ಟು · 1ಗಂ ಹಿಂದೆ ನವೀಕರಿಸಲಾಗಿದೆ</div>
                <div class="phone-product-status phone-product-status--low">ಕಡಿಮೆ ಸ್ಟಾಕ್</div>
              </div>
              <div class="phone-product-qty">
                <div class="phone-product-qty-num" style="color:var(--warning);">3</div>
                <div class="phone-product-qty-unit">ಕೆ.ಜಿ</div>
              </div>
            </div>

            <div class="phone-product">
              <div class="phone-product-icon" style="background:rgba(50,213,131,0.1);">🥛</div>
              <div class="phone-product-info">
                <div class="phone-product-name">Amul Toned Milk</div>
                <div class="phone-product-meta">ಡೈರಿ · 3 ಗಂಟೆಗಳ ಹಿಂದೆ ನವೀಕರಿಸಲಾಗಿದೆ</div>
              </div>
              <div class="phone-product-qty">
                <div class="phone-product-qty-num">40</div>
                <div class="phone-product-qty-unit">pkt</div>
              </div>
            </div>

          </div>
          <!-- Floating mic FAB (like the real app) -->
          <div class="phone-fab">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0D0D12" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/></svg>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ═══ HOW IT WORKS ═══ -->
<section class="how-it-works" id="how">
  <div class="container">
    <div class="reveal">
      <div class="section-label">ಇದು ಹೇಗೆ ಕೆಲಸ ಮಾಡುತ್ತದೆ</div>
      <h2 class="section-heading">ಮೂರು ಹಂತಗಳು. ಯಾವುದೇ ತರಬೇತಿ ಅಗತ್ಯವಿಲ್ಲ.</h2>
      <p class="section-sub">ನಿಮ್ಮ ಭಾಷೆಯಲ್ಲಿ ಸ್ವಾಭಾವಿಕವಾಗಿ ಮಾತನಾಡಿ - AI ಉಳಿದದ್ದನ್ನು ನಿಭಾಯಿಸುತ್ತದೆ.</p>
    </div>
    <div class="steps-grid">
      <div class="step reveal reveal-delay-1">
        <div class="step-number">01</div>
        <h3>ನಿಮ್ಮ ಆಜ್ಞೆಯನ್ನು ಮಾತನಾಡಿ</h3>
        <p>ಮೈಕ್ ಅನ್ನು ಟ್ಯಾಪ್ ಮಾಡಿ ಮತ್ತು ನಿಮಗೆ ಬೇಕಾದುದನ್ನು ಹೇಳಿ - ಸ್ಟಾಕ್ ಸೇರಿಸಿ, ಪ್ರಮಾಣವನ್ನು ಪರಿಶೀಲಿಸಿ, ಖರೀದಿ ಪಟ್ಟಿಯನ್ನು ರಚಿಸಿ. ಯಾವುದೇ ಭಾರತೀಯ ಭಾಷೆಯಲ್ಲಿ.</p>
        <div class="step-example">
          <div class="hindi">"चावल 5 किलो जोड़ दो"</div>
          <div class="english">5 ಕೆಜಿ ಅಕ್ಕಿ ಸೇರಿಸಿ</div>
        </div>
      </div>
      <div class="step reveal reveal-delay-2">
        <div class="step-number">02</div>
        <h3>AI ತಕ್ಷಣವೇ ಅರ್ಥಮಾಡಿಕೊಳ್ಳುತ್ತದೆ</h3>
        <p>Sarvam AIನಿಮ್ಮ ಭಾಷಣವನ್ನು ಪ್ರಕ್ರಿಯೆಗೊಳಿಸುತ್ತದೆ, ಉತ್ಪನ್ನ, ಪ್ರಮಾಣ ಮತ್ತು ಕ್ರಿಯೆಯನ್ನು ಹೊರತೆಗೆಯುತ್ತದೆ - ನಂತರ ಅದನ್ನು ನಿಮ್ಮ ದಾಸ್ತಾನುಗಳಿಗೆ ಹೊಂದಿಸುತ್ತದೆ.</p>
        <div class="step-example">
          <div style="display:flex; gap:12px; flex-wrap:wrap;">
            <span style="background:var(--saffron-tint); color:var(--saffron); padding:4px 10px; border-radius:4px; font-size:12px;">ಅಕ್ಕಿ → ಬಾಸ್ಮತಿ 🍚</span>
            <span style="background:rgba(50,213,131,0.1); color:var(--success); padding:4px 10px; border-radius:4px; font-size:12px;">+5 ಕೆ.ಜಿ</span>
            <span style="background:rgba(99,102,241,0.1); color:#818CF8; padding:4px 10px; border-radius:4px; font-size:12px;">✓ ಸೇರಿಸಿ</span>
          </div>
        </div>
      </div>
      <div class="step reveal reveal-delay-3">
        <div class="step-number">03</div>
        <h3>ಇನ್ವೆಂಟರಿ ನವೀಕರಿಸಲಾಗಿದೆ, ದೃಢೀಕರಿಸಲಾಗಿದೆ</h3>
        <p>ನಿಮ್ಮ ಸ್ಟಾಕ್ ಅನ್ನು ತಕ್ಷಣವೇ ನವೀಕರಿಸಲಾಗುತ್ತದೆ. ನಿಮ್ಮ ಭಾಷೆಯಲ್ಲಿ ಧ್ವನಿ ದೃಢೀಕರಣವನ್ನು ನೀವು ಕೇಳುತ್ತೀರಿ - ಯಾವುದೇ ಪರದೆಯ ಅಗತ್ಯವಿಲ್ಲ.</p>
        <div class="step-example">
          <div class="hindi">"हो गया — बासमती चावल अब 23 किलो है"</div>
          <div class="english">ಮುಗಿದಿದೆ - ಬಾಸ್ಮತಿ ಅಕ್ಕಿ ಈಗ 23 ಕೆ.ಜಿ</div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ═══ FEATURES ═══ -->
<section class="features" id="features" style="position:relative; overflow:hidden;">
  <div class="orb orb--saffron" style="top: -100px; right: -150px;"></div>
  <div class="container">
    <div class="reveal">
      <div class="section-label">ವೈಶಿಷ್ಟ್ಯಗಳು</div>
      <h2 class="section-heading">ನಿಮ್ಮ ಅಂಗಡಿಗೆ ಅಗತ್ಯವಿರುವ ಎಲ್ಲವೂ. ಅದು ಏನೂ ಇಲ್ಲ.</h2>
    </div>
    <div class="features-grid">
      <div class="feature feature--hero reveal reveal-delay-1">
        <div class="feature-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg></div>
        <h3>ಧ್ವನಿ-ಮೊದಲ ದಾಸ್ತಾನು</h3>
        <p>ಸ್ವಾಭಾವಿಕವಾಗಿ ಮಾತನಾಡುವ ಮೂಲಕ ಸ್ಟಾಕ್ ಸೇರಿಸಿ, ತೆಗೆದುಹಾಕಿ ಅಥವಾ ಪರಿಶೀಲಿಸಿ. ಟೈಪಿಂಗ್ ಇಲ್ಲ, ಮೆನುಗಳಲ್ಲಿ ಹುಡುಕಲು ಇಲ್ಲ. ನಿಮ್ಮ ಭಾಷೆಯಲ್ಲಿ ಮಾತನಾಡಿ ಮತ್ತು ಉಳಿದದ್ದನ್ನು AI ನಿರ್ವಹಿಸುತ್ತದೆ - ನಿಮ್ಮ ಆಜ್ಞೆಯನ್ನು ಅರ್ಥಮಾಡಿಕೊಳ್ಳುವುದರಿಂದ ಹಿಡಿದು ನೈಜ ಸಮಯದಲ್ಲಿ ನಿಮ್ಮ ಸ್ಟಾಕ್ ಅನ್ನು ನವೀಕರಿಸುವವರೆಗೆ.</p>
      </div>
      <div class="feature reveal reveal-delay-2">
        <div class="feature-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg></div>
        <h3>10 ಭಾರತೀಯ ಭಾಷೆಗಳು + ಇಂಗ್ಲಿಷ್</h3>
        <p>ಹಿಂದಿ, ಬೆಂಗಾಲಿ, ತಮಿಳು, ತೆಲುಗು, ಮರಾಠಿ, ಕನ್ನಡ, ಗುಜರಾತಿ, ಮಲಯಾಳಂ, ಪಂಜಾಬಿ ಮತ್ತು ಒಡಿಯಾ - Sarvam AI ನಿಂದ ನಡೆಸಲ್ಪಡುತ್ತಿದೆ.</p>
      </div>
      <div class="feature reveal reveal-delay-3">
        <div class="feature-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></div>
        <h3>ತಂಡದ ಪಾತ್ರಗಳು</h3>
        <p>ಹರಳಿನ ಅನುಮತಿಗಳೊಂದಿಗೆOwner, Manager, ಮತ್ತು Helper ಪಾತ್ರಗಳು. ಒಂದೇ ಪುಟದಲ್ಲಿರುವ ಎಲ್ಲರೂ ಸುರಕ್ಷಿತವಾಗಿ.</p>
      </div>
      <div class="feature reveal reveal-delay-1">
        <div class="feature-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/><path d="M9 14l2 2 4-4"/></svg></div>
        <h3>ಸ್ಮಾರ್ಟ್ ಖರೀದಿ ಪಟ್ಟಿಗಳು</h3>
        <p>ಏನು ಕಡಿಮೆಯಾಗಿದೆ ಎಂಬುದರ ಆಧಾರದ ಮೇಲೆ ಸ್ವಯಂ-ರಚಿಸಿದ ಮರುಸ್ಥಾಪನೆ ಪಟ್ಟಿಗಳು. WhatsApp ಮೂಲಕ ಪೂರೈಕೆದಾರರಿಗೆ ಹಂಚಿಕೊಳ್ಳಿ.</p>
      </div>
      <div class="feature reveal reveal-delay-2">
        <div class="feature-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></svg></div>
        <h3>ಚಟುವಟಿಕೆ ಆಡಿಟ್ ಲಾಗ್</h3>
        <p>ಪ್ರತಿ ಬದಲಾವಣೆಯನ್ನು ಯಾರು, ಏನು ಮತ್ತು ಯಾವಾಗ ಎಂದು ಟ್ರ್ಯಾಕ್ ಮಾಡಲಾಗುತ್ತದೆ. ನಿಮ್ಮ ತಂಡದಾದ್ಯಂತ ಸಂಪೂರ್ಣ ಪಾರದರ್ಶಕತೆ.</p>
      </div>
      <div class="feature reveal reveal-delay-3">
        <div class="feature-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><line x1="7" y1="12" x2="17" y2="12"/><line x1="7" y1="8" x2="17" y2="8"/><line x1="7" y1="16" x2="17" y2="16"/></svg></div>
        <h3>ಬಾರ್ಕೋಡ್ ಸ್ಕ್ಯಾನಿಂಗ್</h3>
        <p>ಉತ್ಪನ್ನಗಳನ್ನು ಸೇರಿಸಲು ಅಥವಾ ತಕ್ಷಣವೇ ನೋಡಲು ಸ್ಕ್ಯಾನ್ ಮಾಡಿ. ಭಾರತೀಯ ಮತ್ತು ಅಂತರಾಷ್ಟ್ರೀಯ ಬಾರ್ಕೋಡ್ಗಳೊಂದಿಗೆ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತದೆ.</p>
      </div>
    </div>
  </div>
</section>

<!-- ═══ AI INTELLIGENCE ═══ -->
<section class="ai-section" id="ai" style="overflow:hidden;">
  <div class="orb orb--indigo" style="bottom: -100px; left: -100px;"></div>
  <div class="orb orb--green" style="top: 200px; right: -80px;"></div>
  <div class="container">
    <div class="ai-header reveal">
      <div class="section-label">AI ಇಂಟೆಲಿಜೆನ್ಸ್</div>
      <h2 class="section-heading">
        <span class="hindi" style="display:block; color:var(--saffron); font-size:clamp(22px,2.8vw,32px); font-weight:500; margin-bottom:8px;">ಸಮಾಜದಾರ AI ಜೋ ಆಪಕೆ ಬಿಜಾನೆಸ್ ಕೋ ಸಮೇ</span>
        ಕೇವಲ ಟ್ರ್ಯಾಕಿಂಗ್ ಅಲ್ಲ — ನಿಮ್ಮ ಅಂಗಡಿಯ ಮೊದಲ ಡಿಜಿಟಲ್ ಮೆದುಳು
      </h2>
      <p class="section-sub">Samaan-Bolನೀವು ಹೇಳುವುದನ್ನು ಮಾತ್ರ ದಾಖಲಿಸುವುದಿಲ್ಲ. ಇದು ನಿಮ್ಮ ಮಾದರಿಗಳನ್ನು ಕಲಿಯುತ್ತದೆ, ನಿಮ್ಮ ಅಗತ್ಯಗಳನ್ನು ಊಹಿಸುತ್ತದೆ ಮತ್ತು ಸಮಸ್ಯೆಗಳು ಸಂಭವಿಸುವ ಮೊದಲು ನಿಮ್ಮನ್ನು ಎಚ್ಚರಿಸುತ್ತದೆ.</p>
    </div>

    <div class="ai-blocks">
      <!-- Predictive Stock -->
      <div class="ai-block reveal">
        <div class="ai-block-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg></div>
        <div class="ai-block-tag ai-block-tag--predict">ಮುನ್ಸೂಚಕ ಸ್ಟಾಕ್</div>
        <h3>ನೀವು ಮಾಡುವ ಮೊದಲು ನಿಮಗೆ ಏನು ಬೇಕು ಎಂದು ತಿಳಿದಿದೆ</h3>
        <p>AI ನಿಮ್ಮ ಮಾರಾಟದ ಮಾದರಿಗಳನ್ನು ಕಲಿಯುತ್ತದೆ - ದೈನಂದಿನ, ಸಾಪ್ತಾಹಿಕ, ಕಾಲೋಚಿತ. ಐಟಂಗಳು ಯಾವಾಗ ಕಡಿಮೆಯಾಗುತ್ತವೆ ಎಂಬುದನ್ನು ಇದು ಮುನ್ಸೂಚಿಸುತ್ತದೆ ಮತ್ತು ದಿನಗಳ ಮುಂಚಿತವಾಗಿ ಮರುಸ್ಥಾಪಿಸುವಿಕೆಯನ್ನು ಸೂಚಿಸುತ್ತದೆ.</p>
        <div class="ai-voice-example">
          <div class="voice-bubble">
            <div class="voice-bubble-avatar voice-bubble-avatar--ai"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg></div>
            <div class="voice-bubble-content">
              <div class="hindi">"ಆಪ್ಕಾ ಅತ್ತಾ 3 ದಿನ್ ಮೇ ಖತಮ್ ಹೋ ಸಕ್ತಾ ಹೈ - ಹಫ್ತೇ ಕಿ ಬಿಕ್ರಿ ಕೆ ಹಿಸಾಬ್ ಸೆ"</div>
              <div class="translation">ನಿಮ್ಮ ಅಟ್ಟಾ 3 ದಿನಗಳಲ್ಲಿ ಖಾಲಿಯಾಗಬಹುದು - ಸಾಪ್ತಾಹಿಕ ಮಾರಾಟದ ಆಧಾರದ ಮೇಲೆ</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Smart Alerts -->
      <div class="ai-block reveal">
        <div class="ai-block-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg></div>
        <div class="ai-block-tag ai-block-tag--alert">ಸ್ಮಾರ್ಟ್ ಎಚ್ಚರಿಕೆಗಳು</div>
        <h3>ನಿಮ್ಮ ಭಾಷೆಯನ್ನು ಮಾತನಾಡುವ ಎಚ್ಚರಿಕೆಗಳು</h3>
        <p>ಮುಕ್ತಾಯ ಎಚ್ಚರಿಕೆಗಳು, ನಿಧಾನವಾಗಿ ಚಲಿಸುವ ಸ್ಟಾಕ್ ಪತ್ತೆ ಮತ್ತು ಬೆಲೆ ಏರಿಳಿತದ ಎಚ್ಚರಿಕೆಗಳು — ನಿಮ್ಮ ಆದ್ಯತೆಯ ಭಾಷೆಯಲ್ಲಿ ಧ್ವನಿ ಅಧಿಸೂಚನೆಗಳಾಗಿ ವಿತರಿಸಲಾಗುತ್ತದೆ.</p>
        <div class="ai-voice-example">
          <div class="voice-bubble">
            <div class="voice-bubble-avatar voice-bubble-avatar--ai"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg></div>
            <div class="voice-bubble-content">
              <div class="hindi">"Parle-G ಕೆ 12 ಪ್ಯಾಕೆಟ್ 5 ದಿನ್ ಮೇ ಎಕ್ಸ್‌ಪೈರ್ ಹೋ ರಹೇ ಹೈ - ಡಿಸ್ಕೌಂಟ್ ಲಗಾನಾ ಚಾಹೇನ್?"</div>
              <div class="translation">12Parle-Gಪ್ಯಾಕೆಟ್‌ಗಳು 5 ದಿನಗಳಲ್ಲಿ ಮುಕ್ತಾಯಗೊಳ್ಳುತ್ತವೆ - ರಿಯಾಯಿತಿಯನ್ನು ಸೇರಿಸಲು ಬಯಸುವಿರಾ?</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Voice Analytics -->
      <div class="ai-block reveal">
        <div class="ai-block-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg></div>
        <div class="ai-block-tag ai-block-tag--insight">ಧ್ವನಿ ವಿಶ್ಲೇಷಣೆ</div>
        <h3>ನಿಮ್ಮ ಅಂಗಡಿಗೆ ಪ್ರಶ್ನೆಯನ್ನು ಕೇಳಿ - ಅದು ಉತ್ತರಿಸುತ್ತದೆ</h3>
        <p>ನೈಸರ್ಗಿಕ ಭಾಷೆಯಲ್ಲಿ ನಿಮ್ಮ ವ್ಯವಹಾರದ ಬಗ್ಗೆ ಏನನ್ನೂ ಕೇಳಿ. AI ಮಾತನಾಡುವ ಉತ್ತರಗಳು ಮತ್ತು ಆನ್-ಸ್ಕ್ರೀನ್ ಡೇಟಾದೊಂದಿಗೆ ಪ್ರತಿಕ್ರಿಯಿಸುತ್ತದೆ.</p>
        <div class="ai-voice-example">
          <div class="voice-bubble">
            <div class="voice-bubble-avatar voice-bubble-avatar--user"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>
            <div class="voice-bubble-content">
              <div class="hindi">"ಪಿಚ್ಲೆ ಹಫ್ತೆ ಸಬ್ಸೆ ಝ್ಯಾದಾ ಕ್ಯಾ ಬಿಕಾ?"</div>
              <div class="translation">ಕಳೆದ ವಾರ ಹೆಚ್ಚು ಮಾರಾಟವಾದದ್ದು ಯಾವುದು?</div>
            </div>
          </div>
          <div class="voice-bubble">
            <div class="voice-bubble-avatar voice-bubble-avatar--ai"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg></div>
            <div class="voice-bubble-content">
              <div class="hindi">"ಪಿಚ್ಲೆ ಹಫ್ತೆ ಸಬ್ಸೆ ಜ್ಯಾದಾ ಚಾವಲ್ ಬಿಕಾ - 48 ಕಿಲೋ"</div>
              <div class="translation">ಕಳೆದ ವಾರ ಹೆಚ್ಚು ಮಾರಾಟವಾದ ಅಕ್ಕಿ - 48 ಕಿಲೋ</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Team Intelligence -->
      <div class="ai-block reveal">
        <div class="ai-block-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>
        <div class="ai-block-tag ai-block-tag--team">ಟೀಮ್ ಇಂಟೆಲಿಜೆನ್ಸ್</div>
        <h3>ನಿಮ್ಮ ತಂಡ ಏನು ಮಾಡುತ್ತಿದೆ ಎಂದು ತಿಳಿಯಿರಿ</h3>
        <p>AI-ಚಾಲಿತ ಅಸಂಗತತೆ ಪತ್ತೆಯು ಅಸಾಮಾನ್ಯ ದಾಸ್ತಾನು ಬದಲಾವಣೆಗಳನ್ನು ಫ್ಲ್ಯಾಗ್ ಮಾಡುತ್ತದೆ. ಯಾರು ಏನನ್ನು ನವೀಕರಿಸಿದ್ದಾರೆ ಮತ್ತು ತಿದ್ದುಪಡಿಗಳ ಅಗತ್ಯವಿದೆಯೇ ಎಂಬುದನ್ನು ಸ್ಮಾರ್ಟ್ ಸಾರಾಂಶಗಳು ತೋರಿಸುತ್ತವೆ.</p>
        <div class="ai-voice-example">
          <div class="voice-bubble">
            <div class="voice-bubble-avatar voice-bubble-avatar--ai"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg></div>
            <div class="voice-bubble-content">
              <div class="hindi">"ಆಜ್ ಶಾಮ್ 6 ಬಜೆ 15 ಕಿಲೋ ಚೀನಿ ಕಾ ಸ್ಟಾಕ್ ಕಾಮ್ ಹುವಾ - ಕರೇನ್ ಅನ್ನು ಪರಿಶೀಲಿಸುವುದೇ?"</div>
              <div class="translation">ಇಂದು ಸಂಜೆ 6 ಗಂಟೆಗೆ 15 ಕೆಜಿ ಸಕ್ಕರೆ ಸ್ಟಾಕ್ ಕಡಿಮೆಯಾಗಿದೆ - ಪರಿಶೀಲಿಸಲು ಬಯಸುವಿರಾ?</div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</section>

<!-- ═══ LANGUAGES ═══ -->
<section class="languages-section" id="languages">
  <div class="container">
    <div class="reveal">
      <div class="section-label">ಭಾರತಕ್ಕಾಗಿ ನಿರ್ಮಿಸಲಾಗಿದೆ</div>
      <h2 class="section-heading">ನಿಮ್ಮ ಭಾಷೆ. ನಿಮ್ಮ ವ್ಯಾಪಾರ. ನಿಮ್ಮ ದಾರಿ.</h2>
      <p class="section-sub">ಸ್ಥಳೀಯ ಸ್ಕ್ರಿಪ್ಟ್‌ಗಳು, ಆಡುಮಾತಿನ ಪದಗಳು ಮತ್ತು ಪ್ರಾದೇಶಿಕ ಉತ್ಪನ್ನದ ಹೆಸರುಗಳಿಗೆ ಸಂಪೂರ್ಣ ಬೆಂಬಲದೊಂದಿಗೆSamaan-Bolನೀವು ಮಾತನಾಡುವ ರೀತಿಯಲ್ಲಿ ಮಾತನಾಡುತ್ತಾರೆ.</p>
    </div>
    <div class="lang-grid reveal">
      <div class="lang-chip lang-chip--featured">ಹಿಂದಿ <span class="native hindi">हिन्दी</span></div>
      <div class="lang-chip">ಬೆಂಗಾಲಿ <span class="native">বাংলা</span></div>
      <div class="lang-chip">ತಮಿಳು <span class="native">தமிழ்</span></div>
      <div class="lang-chip">ತೆಲುಗು <span class="native">తెలుగు</span></div>
      <div class="lang-chip">ಮರಾಠಿ <span class="native">मराठी</span></div>
      <div class="lang-chip">ಕನ್ನಡ <span class="native">ಕನ್ನಡ</span></div>
      <div class="lang-chip">ಗುಜರಾತಿ <span class="native">ગુજરાતી</span></div>
      <div class="lang-chip">ಮಲಯಾಳಂ <span class="native">മലയാളം</span></div>
      <div class="lang-chip">ಪಂಜಾಬಿ <span class="native">ਪੰਜਾਬੀ</span></div>
      <div class="lang-chip">ಒಡಿಯಾ <span class="native">ଓଡ଼ିଆ</span></div>
      <div class="lang-chip">ಇಂಗ್ಲೀಷ್ <span class="native">ಇಂಗ್ಲೀಷ್</span></div>
    </div>
  </div>
</section>

<!-- ═══ COMPARISON ═══ -->
<section class="comparison">
  <div class="container">
    <div class="reveal">
      <div class="section-label">ಏಕೆSamaan-Bol</div>
      <h2 class="section-heading">ವ್ಯತ್ಯಾಸ ರಾತ್ರಿ ಮತ್ತು ಹಗಲು</h2>
    </div>
    <div class="comparison-grid reveal">
      <div class="comparison-col comparison-col--without">
        <h3>Samaan-Bol ಇಲ್ಲದೆ</h3>
        <p class="comparison-col-subtitle">ಸ್ಟಾಕ್ ಅನ್ನು ನಿರ್ವಹಿಸುವ ಹಳೆಯ ವಿಧಾನ</p>
        <ul class="comparison-list">
          <li><span class="icon">✕</span> ಹಸ್ತಚಾಲಿತ ಎಣಿಕೆ, ಪೆನ್ ಮತ್ತು ಪೇಪರ್ ರೆಜಿಸ್ಟರ್‌ಗಳು</li>
          <li><span class="icon">✕</span> ಗ್ರಾಹಕರು ಕೇಳಿದಾಗ ಸ್ಟಾಕ್‌ಔಟ್‌ಗಳು ಪತ್ತೆಯಾದವು</li>
          <li><span class="icon">✕</span> ಮರುಕ್ರಮಗೊಳಿಸುವುದು ಎಷ್ಟು ಎಂದು ಊಹಿಸಲಾಗುತ್ತಿದೆ</li>
          <li><span class="icon">✕</span> ಯಾವುದರ ಅವಧಿ ಮುಗಿಯುತ್ತಿದೆ ಅಥವಾ ನಿಧಾನವಾಗಿ ಚಲಿಸುತ್ತಿದೆ ಎಂಬುದೇ ತಿಳಿಯುತ್ತಿಲ್ಲ</li>
          <li><span class="icon">✕</span> ಸಿಬ್ಬಂದಿ ಏನು ಮಾಡುತ್ತಿದ್ದಾರೆ ಎಂಬುದನ್ನು ಟ್ರ್ಯಾಕ್ ಮಾಡಲು ಸಾಧ್ಯವಿಲ್ಲ</li>
          <li><span class="icon">✕</span> ಉತ್ಸವದ ಸಿದ್ಧತೆಯು ಕೊನೆಯ ಕ್ಷಣದ ಗೊಂದಲವಾಗಿದೆ</li>
        </ul>
      </div>
      <div class="comparison-col comparison-col--with">
        <h3>Samaan-Bolಜೊತೆಗೆ</h3>
        <p class="comparison-col-subtitle">AI-ಚಾಲಿತ, ಧ್ವನಿ-ಮೊದಲು, ಪ್ರಯತ್ನವಿಲ್ಲದ</p>
        <ul class="comparison-list">
          <li><span class="icon">✓</span> ಧ್ವನಿ ನವೀಕರಣಗಳು - ಹೇಳಿ ಮತ್ತು ಅದು ಮುಗಿದಿದೆ</li>
          <li><span class="icon">✓</span> ಸ್ಟಾಕ್‌ಔಟ್‌ಗೆ ದಿನಗಳ ಮೊದಲು ಮುನ್ಸೂಚಕ ಎಚ್ಚರಿಕೆಗಳು</li>
          <li><span class="icon">✓</span> ನೈಜ ಡೇಟಾದ ಆಧಾರದ ಮೇಲೆ AI-ರಚಿಸಿದ ಖರೀದಿ ಪಟ್ಟಿಗಳು</li>
          <li><span class="icon">✓</span> ಮುಕ್ತಾಯ ಮತ್ತು ನಿಧಾನಗತಿಯ ಪತ್ತೆಯನ್ನು ನಿರ್ಮಿಸಲಾಗಿದೆ</li>
          <li><span class="icon">✓</span> ಅಸಂಗತತೆ ಪತ್ತೆಯೊಂದಿಗೆ ಪೂರ್ಣ ಆಡಿಟ್ ಟ್ರಯಲ್</li>
          <li><span class="icon">✓</span> ಹಬ್ಬದ ಮುನ್ಸೂಚನೆಯು 2 ವಾರಗಳ ಮುಂಚೆಯೇ ಪ್ರಾರಂಭವಾಗುತ್ತದೆ</li>
        </ul>
      </div>
    </div>
  </div>
</section>

<!-- ═══ TESTIMONIALS ═══ -->
<section class="testimonials">
  <div class="container">
    <div class="reveal">
      <div class="section-label">ಆರಂಭಿಕ ಅಳವಡಿಸಿಕೊಂಡವರು</div>
      <h2 class="section-heading">ಭಾರತದಾದ್ಯಂತ ಬೀಟಾ ಪರೀಕ್ಷಕರಿಂದ ಪ್ರೀತಿಸಲ್ಪಟ್ಟಿದೆ</h2>
    </div>
    <div class="testimonials-grid">
      <div class="testimonial reveal reveal-delay-1">
        <div class="testimonial-stars">★★★★★</div>
        <blockquote>ಬೀಟಾ ಟೆಸ್ಟಿಂಗ್ ಮೇ ಕಿಯಾ ಪ್ರಯತ್ನಿಸಿ — ಪೆಹ್ಲೆ ದಿನ್ ಸೆ ರಿಜಿಸ್ಟರ್ ಬ್ಯಾಂಡ್. ಅಬ್ ಬಾಸ್ ಬೋಲ್ ದೇತಿ ಹೂನ್ ಔರ್ ಸಬ್ ಅಪ್ಡೇಟ್ ಹೋ ಜಾತಾ ಹೈ. ಇತ್ನಾ ಆಸನ್ ಹೋಗಾ ಸೋಚಾ ನಹೀ ಥಾ.</blockquote>
        <div class="testimonial-author">ಮೀನಾ ಶರ್ಮಾ</div>
        <div class="testimonial-role">ಬೀಟಾ ಪರೀಕ್ಷಕ · ಕಿರಣ ಅಂಗಡಿOwner, ಜೈಪುರ</div>
      </div>
      <div class="testimonial reveal reveal-delay-2">
        <div class="testimonial-stars">★★★★★</div>
        <blockquote>ಜನವರಿ ಮೇ ಬೀಟಾ ಸೇರಲು ಕಿಯಾ ಥಾ - ಹೋಲಿ ಕೆ ಲಿಯೇ ಎಐ ನೆ ಈಗಾಗಲೇ ಬಟಾಯಾ ಕಿ ಕ್ಯಾ ಸ್ಟಾಕ್ ಬಧನಾ ಹೈ. ಅಭಿ ಸೇ ಇತ್ನಾ ಸ್ಮಾರ್ಟ್ ಹೈ, ಸೋಚಿಯೇ ಲಾಂಚ್ ಕೆ ಬಾದ್ ಕ್ಯಾ ಹೋಗಾ.</blockquote>
        <div class="testimonial-author">ಅರ್ಜುನ್ ಪಟೇಲ್</div>
        <div class="testimonial-role">ಬೀಟಾ ಟೆಸ್ಟರ್ · ಜನರಲ್ ಸ್ಟೋರ್, ಅಹಮದಾಬಾದ್</div>
      </div>
      <div class="testimonial reveal reveal-delay-3">
        <div class="testimonial-stars">★★★★★</div>
        <blockquote>ಬಾಂಗ್ಲಾ ಮೇ ಬೋಲ್ತೆ ಹೈ ಸಮಾಜ್ ಗಯಾ - ಬೀಟಾ ಟೆಸ್ಟಿಂಗ್-ಇ ದೇಖ್ಲಾಮ್ ಜೆ ಅಮರ್ ಭಾಷಾ ತೇ ಕಾಜ್ ಕೋರೆ. ಸಿಬ್ಬಂದಿ ರಾ ಒ ಖುಬ್ ಸುಲಭವಾಗಿ ಕೊರ್ತೆ ಪರ್ಚೆಯನ್ನು ಬಳಸುತ್ತಾರೆ.</blockquote>
        <div class="testimonial-author">ರಿನಾ ದಾಸ್</div>
        <div class="testimonial-role">ಬೀಟಾ ಪರೀಕ್ಷಕ · ಜವಳಿ ಅಂಗಡಿ, ಕೋಲ್ಕತ್ತಾ</div>
      </div>
    </div>
  </div>
</section>

<!-- ═══ CTA ═══ -->
<section class="cta-section" id="download">
  <div class="container">
    <div class="reveal">
      <div class="section-label">ಉಚಿತವಾಗಿ ಪ್ರಾರಂಭಿಸಿ</div>
      <h2 class="section-heading">
        <span class="hindi" style="display:block; color:var(--saffron); font-size:clamp(20px,2.4vw,28px); font-weight:500; margin-bottom:8px;">आज ही शुरू करें</span>
        ನಿಮ್ಮ ಅಂಗಡಿಯು ನೋಟ್‌ಬುಕ್‌ಗಿಂತ ಉತ್ತಮವಾಗಿದೆ
      </h2>
      <p class="section-sub">ಪ್ರಾರಂಭಿಸಲು ಉಚಿತ. 2 ನಿಮಿಷಗಳಲ್ಲಿ ಹೊಂದಿಸಿ. ಯಾವುದೇ ಕ್ರೆಡಿಟ್ ಕಾರ್ಡ್ ಅಗತ್ಯವಿಲ್ಲ.</p>
      <div class="cta-actions">
        <a href="https://apps.apple.com/in/app/samaan-bol/id6759739444" class="store-badge">
          <div class="store-badge-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg></div>
          <div class="store-badge-text">
            <div class="store-badge-label">ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ</div>
            <div class="store-badge-name">App Store</div>
          </div>
        </a>
        <a href="#" class="store-badge" style="position:relative; opacity:0.65; pointer-events:none;">
          <div class="store-badge-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.807 1.626a1 1 0 0 1 0 1.73l-2.808 1.626L15.206 12l2.492-2.491zM5.864 2.658L16.8 8.99l-2.3 2.3-8.636-8.632z"/></svg></div>
          <div class="store-badge-text">
            <div class="store-badge-label">ಅದನ್ನು ಪಡೆಯಿರಿ</div>
            <div class="store-badge-name">Google Play</div>
          </div>
          <span style="position:absolute; top:-10px; right:-10px; background:var(--saffron); color:#fff; font-size:11px; font-weight:700; padding:3px 10px; border-radius:20px; letter-spacing:0.5px; text-transform:uppercase;">ಶೀಘ್ರದಲ್ಲೇ ಬರಲಿದೆ</span>
        </a>
      </div>
    </div>
  </div>
</section>

<!-- ═══ FOOTER ═══ -->
<footer>
  <div class="container">
    <div class="footer-grid">
      <div class="footer-brand">
        <a href="#" class="logo">
          <div class="logo-mark"><svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><defs><mask id="stencil-footer"><rect x="0" y="0" width="100" height="100" fill="white"/><rect x="24" y="18" width="52" height="8" rx="4" fill="black"/><rect x="38" y="18" width="24" height="36" rx="12" fill="black"/><path d="M 28 42 A 22 22 0 0 0 72 42" fill="none" stroke="black" stroke-width="8" stroke-linecap="round"/><rect x="46" y="72" width="8" height="10" rx="4" fill="black"/><rect x="36" y="32" width="28" height="4" fill="white"/><rect x="36" y="44" width="28" height="4" fill="white"/></mask></defs><circle cx="50" cy="50" r="50" fill="#ea580c" mask="url(#stencil-footer)"/></svg></div>
          <div class="logo-text">ಸಮಾನ್<span>ಬೊಲ್</span></div>
        </a>
        <p>ಧ್ವನಿ-ಮೊದಲ AI ದಾಸ್ತಾನು ನಿರ್ವಹಣೆ, ಭಾರತೀಯ ಚಿಲ್ಲರೆ ವ್ಯಾಪಾರದ ಹೃದಯಕ್ಕಾಗಿ ನಿರ್ಮಿಸಲಾಗಿದೆ.</p>
      </div>
      <div class="footer-col">
        <h4>ಉತ್ಪನ್ನ</h4>
        <ul>
          <li><a href="#features">ವೈಶಿಷ್ಟ್ಯಗಳು</a></li>
          <li><a href="#ai">AI ಇಂಟೆಲಿಜೆನ್ಸ್</a></li>
          <li><a href="#languages">ಭಾಷೆಗಳು</a></li>
          <li><a href="#">ಬೆಲೆ ನಿಗದಿ</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>ಕಂಪನಿ</h4>
        <ul>
          <li><a href="#">ಬಗ್ಗೆ</a></li>
          <li><a href="#">ಬ್ಲಾಗ್</a></li>
          <li><a href="#">ವೃತ್ತಿಗಳು</a></li>
          <li><a href="#">ಸಂಪರ್ಕಿಸಿ</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>ಬೆಂಬಲ</h4>
        <ul>
          <li><a href="#">ಸಹಾಯ ಕೇಂದ್ರ</a></li>
          <li><a href="/privacy-policy">ಗೌಪ್ಯತೆ ನೀತಿ</a></li>
          <li><a href="/terms-of-service">ಸೇವಾ ನಿಯಮಗಳು</a></li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <span>© 2026 Samaan-Bol. ಎಲ್ಲಾ ಹಕ್ಕುಗಳನ್ನು ಕಾಯ್ದಿರಿಸಲಾಗಿದೆ.</span>
      <span class="made-in-india">ಭಾರತದಲ್ಲಿ ♥ ನೊಂದಿಗೆ ತಯಾರಿಸಲಾಗುತ್ತದೆ 🇮🇳</span>
    </div>
  </div>
</footer>`,
    privacy: `<div class="reading-progress" id="readingProgress"></div>

  <div class="container">
    <a href="/" class="back">← ಮನೆಗೆ ಹಿಂತಿರುಗಿ</a>
    <h1>ಗೌಪ್ಯತೆ ನೀತಿ</h1>
    <p class="effective">ಪರಿಣಾಮಕಾರಿ ದಿನಾಂಕ: ಫೆಬ್ರವರಿ 23, 2026</p>

    <nav class="toc">
      <h3>ಪರಿವಿಡಿ</h3>
      <ol>
        <li><a href="#s1">ನಾವು ಸಂಗ್ರಹಿಸುವ ಮಾಹಿತಿ</a></li>
        <li><a href="#s2">ನಿಮ್ಮ ಮಾಹಿತಿಯನ್ನು ನಾವು ಹೇಗೆ ಬಳಸುತ್ತೇವೆ</a></li>
        <li><a href="#s3">ಮೂರನೇ ವ್ಯಕ್ತಿಯ ಸೇವೆಗಳು</a></li>
        <li><a href="#s4">ಡೇಟಾ ಸಂಗ್ರಹಣೆ ಮತ್ತು ಭದ್ರತೆ</a></li>
        <li><a href="#s5">ಡೇಟಾ ಧಾರಣ</a></li>
        <li><a href="#s6">ಖಾತೆ ಅಳಿಸುವಿಕೆ</a></li>
        <li><a href="#s7">ಅಂಗಡಿಗಳಲ್ಲಿ ಡೇಟಾ ಹಂಚಿಕೆ</a></li>
        <li><a href="#s8">ಮಕ್ಕಳ ಗೌಪ್ಯತೆ</a></li>
        <li><a href="#s9">ನಿಮ್ಮ ಹಕ್ಕುಗಳು</a></li>
        <li><a href="#s10">ಈ ನೀತಿಗೆ ಬದಲಾವಣೆಗಳು</a></li>
        <li><a href="#s11">ನಮ್ಮನ್ನು ಸಂಪರ್ಕಿಸಿ</a></li>
      </ol>
    </nav>

    <p>Samaan-Bol ("ನಾವು", "ನಮ್ಮ", ಅಥವಾ "ಅಪ್ಲಿಕೇಶನ್") ಭಾರತೀಯ ಚಿಲ್ಲರೆ ವ್ಯಾಪಾರಗಳಿಗಾಗಿ ವಿನ್ಯಾಸಗೊಳಿಸಲಾದ ಧ್ವನಿ-ಮೊದಲ ಸಹಯೋಗದ ದಾಸ್ತಾನು ನಿರ್ವಹಣೆ ಅಪ್ಲಿಕೇಶನ್ ಆಗಿದೆ. ಈ ಗೌಪ್ಯತಾ ನೀತಿಯು ನಾವು ಯಾವ ಮಾಹಿತಿಯನ್ನು ಸಂಗ್ರಹಿಸುತ್ತೇವೆ, ನಾವು ಅದನ್ನು ಹೇಗೆ ಬಳಸುತ್ತೇವೆ, ನಾವು ಅದನ್ನು ಯಾರೊಂದಿಗೆ ಹಂಚಿಕೊಳ್ಳುತ್ತೇವೆ ಮತ್ತು ನಿಮ್ಮ ಡೇಟಾಗೆ ಸಂಬಂಧಿಸಿದ ನಿಮ್ಮ ಹಕ್ಕುಗಳನ್ನು ವಿವರಿಸುತ್ತದೆ.</p>

    <p>Samaan-Bol ಬಳಸುವ ಮೂಲಕ, ಈ ನೀತಿಯಲ್ಲಿ ವಿವರಿಸಿದಂತೆ ಮಾಹಿತಿಯ ಸಂಗ್ರಹಣೆ ಮತ್ತು ಬಳಕೆಗೆ ನೀವು ಒಪ್ಪುತ್ತೀರಿ.</p>

    <details open id="s1">
      <summary><h2>1. ನಾವು ಸಂಗ್ರಹಿಸುವ ಮಾಹಿತಿ</h2></summary>
      <div class="section-content">
        <h3>1.1 ಖಾತೆ ಮಾಹಿತಿ</h3>
        <p>ನೀವು ಖಾತೆಯನ್ನು ರಚಿಸಿದಾಗ, ನಾವು ಸಂಗ್ರಹಿಸುತ್ತೇವೆ:</p>
        <ul>
          <li><strong>ಪೂರ್ಣ ಹೆಸರು</strong> - ಸೈನ್-ಅಪ್ ಸಮಯದಲ್ಲಿ ಒದಗಿಸಲಾಗಿದೆ</li>
          <li><strong>Emailವಿಳಾಸ</strong> - ದೃಢೀಕರಣ ಮತ್ತು ಖಾತೆ ಮರುಪಡೆಯುವಿಕೆಗೆ ಬಳಸಲಾಗುತ್ತದೆ</li>
          <li><strong>ಪಾಸ್ವರ್ಡ್</strong> - ನಮ್ಮ ದೃಢೀಕರಣ ಪೂರೈಕೆದಾರರಿಂದ ಎನ್‌ಕ್ರಿಪ್ಟ್ ಮಾಡಲಾಗಿದೆ ಮತ್ತು ನಿರ್ವಹಿಸಲಾಗಿದೆ (Clerk)</li>
        </ul>
        <p>ನೀವುGoogleಅಥವಾ Apple ನೊಂದಿಗೆ ಸೈನ್ ಇನ್ ಮಾಡಿದರೆ,OAuthಪೂರೈಕೆದಾರರಿಂದ ನಿಮ್ಮ ಹೆಸರು ಮತ್ತು ಇಮೇಲ್ ಅನ್ನು ನಾವು ಸ್ವೀಕರಿಸುತ್ತೇವೆ. ನಿಮ್ಮ Google ಅಥವಾ Apple ಖಾತೆಯ ಪಾಸ್‌ವರ್ಡ್ ಅನ್ನು ನಾವು ಪ್ರವೇಶಿಸುವುದಿಲ್ಲ.</p>

        <h3>1.2 ಧ್ವನಿ ರೆಕಾರ್ಡಿಂಗ್‌ಗಳು</h3>
        <div class="highlight">
          <p><strong>ಪ್ರಮುಖ:</strong> ಧ್ವನಿ ರೆಕಾರ್ಡಿಂಗ್‌ಗಳನ್ನು ನೈಜ ಸಮಯದಲ್ಲಿ ಪ್ರಕ್ರಿಯೆಗೊಳಿಸಲಾಗುತ್ತದೆ ಮತ್ತು ಅವು <strong>ಶಾಶ್ವತವಾಗಿ ಸಂಗ್ರಹಿಸಲಾಗಿಲ್ಲ</strong>. ಆಡಿಯೊವನ್ನು ನಮ್ಮ ಸರ್ವರ್‌ಗೆ ರವಾನಿಸಲಾಗುತ್ತದೆ, ಭಾಷಣ ಗುರುತಿಸುವಿಕೆ ಮತ್ತು ಸಹಜ ಭಾಷೆಯ ತಿಳುವಳಿಕೆಗಾಗಿSarvam AIಮೂಲಕ ಸಂಸ್ಕರಿಸಲಾಗುತ್ತದೆ ಮತ್ತು ಪ್ರಕ್ರಿಯೆಗೊಳಿಸಿದ ನಂತರ ತಕ್ಷಣವೇ ತಿರಸ್ಕರಿಸಲಾಗುತ್ತದೆ. ನಿಮ್ಮ ಉಲ್ಲೇಖಕ್ಕಾಗಿ ನಿಮ್ಮ ಆಡಿಟ್ ಲಾಗ್‌ನಲ್ಲಿ ಫಲಿತಾಂಶದ ಪಠ್ಯ ಪ್ರತಿಲೇಖನವನ್ನು ಮಾತ್ರ ಸಂಗ್ರಹಿಸಲಾಗುತ್ತದೆ.</p>
        </div>
        <ul>
          <li>ನಿಮ್ಮ ಸಾಧನದಲ್ಲಿ ಆಡಿಯೋ ರೆಕಾರ್ಡ್ ಆಗಿದೆ (WAVಫಾರ್ಮ್ಯಾಟ್iOS, M4A Android)</li>
          <li>ರೆಕಾರ್ಡಿಂಗ್‌ಗಳು ಗರಿಷ್ಠ 30 ಸೆಕೆಂಡುಗಳಿಗೆ ಸೀಮಿತವಾಗಿವೆ</li>
          <li>ಸುರಕ್ಷಿತ ಸಂಪರ್ಕದ ಮೂಲಕ ಎನ್‌ಕೋಡ್ ಮಾಡಲಾದ ಡೇಟಾದಂತೆ ಆಡಿಯೊವನ್ನು ನಮ್ಮ ಸರ್ವರ್‌ಗೆ ಕಳುಹಿಸಲಾಗುತ್ತದೆ</li>
          <li>ಪ್ರಕ್ರಿಯೆಗೊಳಿಸಿದ ನಂತರ, ಆಡಿಯೊ ಡೇಟಾವನ್ನು ಸರ್ವರ್ ಮೆಮೊರಿಯಿಂದ ತಿರಸ್ಕರಿಸಲಾಗುತ್ತದೆ</li>
          <li>ಪಠ್ಯದ ಪ್ರತಿಗಳನ್ನು ನಿಮ್ಮ ಅಂಗಡಿಯ ಆಡಿಟ್ ಲಾಗ್‌ನಲ್ಲಿ ಸಂಗ್ರಹಿಸಲಾಗಿದೆ ಆದ್ದರಿಂದ ನೀವು ಹಿಂದಿನ ಕ್ರಿಯೆಗಳನ್ನು ಪರಿಶೀಲಿಸಬಹುದು</li>
        </ul>

        <h3>1.3 ಇನ್ವೆಂಟರಿ ಮತ್ತು ವ್ಯಾಪಾರ ಡೇಟಾ</h3>
        <p>ನೀವು ಅಪ್ಲಿಕೇಶನ್ ಅನ್ನು ಬಳಸುವಾಗ, ನೀವು ರಚಿಸುವ ವ್ಯಾಪಾರ ಡೇಟಾವನ್ನು ನಾವು ಸಂಗ್ರಹಿಸುತ್ತೇವೆ:</p>
        <ul>
          <li>ಅಂಗಡಿ ಮಾಹಿತಿ (ಹೆಸರು, ವರ್ಗ, ಆದ್ಯತೆಯ ಭಾಷೆ)</li>
          <li>ಉತ್ಪನ್ನ ಕ್ಯಾಟಲಾಗ್ (ಹೆಸರುಗಳು, ಬಾರ್‌ಕೋಡ್‌ಗಳು, ವಿಭಾಗಗಳು, ಘಟಕಗಳು, ಬೆಲೆಗಳು)</li>
          <li>ಸ್ಟಾಕ್ ಪ್ರಮಾಣಗಳು, ಬ್ಯಾಚ್ ಸಂಖ್ಯೆಗಳು, ಖರೀದಿ ದಿನಾಂಕಗಳು, ಮುಕ್ತಾಯ ದಿನಾಂಕಗಳು, ಪೂರೈಕೆದಾರರ ಹೆಸರುಗಳು</li>
          <li>ಪಟ್ಟಿ ಐಟಂಗಳು ಮತ್ತು ಟಿಪ್ಪಣಿಗಳನ್ನು ಖರೀದಿಸಿ</li>
          <li>ದಾಸ್ತಾನು ಬದಲಾವಣೆಗಳನ್ನು ದಾಖಲಿಸುವ ಆಡಿಟ್ ಲಾಗ್‌ಗಳು (ಕ್ರಿಯೆಯ ಪ್ರಕಾರ, ಬಳಕೆದಾರ, ಟೈಮ್‌ಸ್ಟ್ಯಾಂಪ್, ಪ್ರತಿಲೇಖನ, ವಿಶ್ವಾಸಾರ್ಹ ಸ್ಕೋರ್)</li>
        </ul>

        <h3>1.4 ಬಳಕೆದಾರರ ಆದ್ಯತೆಗಳು</h3>
        <ul>
          <li>ಅಪ್ಲಿಕೇಶನ್ ಭಾಷೆ ಮತ್ತು ಧ್ವನಿ ಭಾಷೆ ಆಯ್ಕೆ</li>
          <li>ಧ್ವನಿ ಪ್ರತಿಕ್ರಿಯೆ ಆದ್ಯತೆ (ಆನ್/ಆಫ್)</li>
          <li>ಪ್ರದರ್ಶನ ಸೆಟ್ಟಿಂಗ್‌ಗಳು (ಹೆಚ್ಚಿನ ಕಾಂಟ್ರಾಸ್ಟ್ ಮೋಡ್, ಪಠ್ಯ ಗಾತ್ರ)</li>
          <li>ಡೀಫಾಲ್ಟ್ ಮಾಪನ ಘಟಕ</li>
          <li>ಅಧಿಸೂಚನೆ ಆದ್ಯತೆಗಳು</li>
        </ul>

        <h3>1.5 ಶಾಪ್ ಸದಸ್ಯತ್ವ ಡೇಟಾ</h3>
        <ul>
          <li>ಪ್ರತಿ ಅಂಗಡಿಯಲ್ಲಿ ನಿಮ್ಮ ಪಾತ್ರ (Owner, Manager, ಅಥವಾ Helper)</li>
          <li>ತಂಡದ ಸಹಯೋಗಕ್ಕಾಗಿ ರಚಿಸಲಾದ ಕೋಡ್‌ಗಳನ್ನು ಆಹ್ವಾನಿಸಿ</li>
          <li>ಅಂಗಡಿಗಳಲ್ಲಿ ಕೊನೆಯ ಸಕ್ರಿಯ ಟೈಮ್‌ಸ್ಟ್ಯಾಂಪ್‌ಗಳು</li>
        </ul>

        <h3>1.6 ಸಾಧನ ಮತ್ತು ರೋಗನಿರ್ಣಯದ ಡೇಟಾ</h3>
        <p>ಉತ್ಪಾದನಾ ನಿರ್ಮಾಣಗಳಲ್ಲಿ, ಕ್ರ್ಯಾಶ್ ವರದಿಗಾಗಿ ನಾವುSentryಅನ್ನು ಬಳಸುತ್ತೇವೆ. ಇದು ಸಂಗ್ರಹಿಸುತ್ತದೆ:</p>
        <ul>
          <li>ಸಾಧನದ ಪ್ರಕಾರ, ಆಪರೇಟಿಂಗ್ ಸಿಸ್ಟಮ್ ಮತ್ತು ಅಪ್ಲಿಕೇಶನ್ ಆವೃತ್ತಿ</li>
          <li>ಕ್ರ್ಯಾಶ್ ವರದಿಗಳು ಮತ್ತು ದೋಷ ಸ್ಟಾಕ್ ಟ್ರೇಸ್</li>
          <li>ಕಾರ್ಯಕ್ಷಮತೆಯ ಡೇಟಾ (20% ಸೆಷನ್‌ಗಳಲ್ಲಿ ಮಾದರಿ)</li>
        </ul>
        <p>ಡೆವಲಪ್‌ಮೆಂಟ್ ಬಿಲ್ಡ್‌ಗಳಲ್ಲಿ ಕ್ರ್ಯಾಶ್ ವರದಿ ಮಾಡುವಿಕೆಯನ್ನು ನಿಷ್ಕ್ರಿಯಗೊಳಿಸಲಾಗಿದೆ ಮತ್ತು ನಾವು ಅನ್ವಯಿಸುವ ಮಾದರಿ ದರದಿಂದ ಅದನ್ನು ಕಡಿಮೆ ಮಾಡಬಹುದು.</p>
      </div>
    </details>

    <details id="s2">
      <summary><h2>2. ನಿಮ್ಮ ಮಾಹಿತಿಯನ್ನು ನಾವು ಹೇಗೆ ಬಳಸುತ್ತೇವೆ</h2></summary>
      <div class="section-content">
        <ul>
          <li><strong>ಸೇವೆಯನ್ನು ಒದಗಿಸಿ:</strong> ಧ್ವನಿ ಆಜ್ಞೆಗಳನ್ನು ಪ್ರಕ್ರಿಯೆಗೊಳಿಸಿ, ದಾಸ್ತಾನು ನಿರ್ವಹಿಸಿ ಮತ್ತು ನಿಮ್ಮ ತಂಡದಾದ್ಯಂತ ಡೇಟಾವನ್ನು ಸಿಂಕ್ ಮಾಡಿ</li>
          <li><strong>ದೃಢೀಕರಣ:</strong> ನಿಮ್ಮ ಗುರುತನ್ನು ಪರಿಶೀಲಿಸಿ ಮತ್ತು ಸುರಕ್ಷಿತ ಸೆಷನ್‌ಗಳನ್ನು ನಿರ್ವಹಿಸಿ</li>
          <li><strong>ಆಡಿಟ್ ಟ್ರಯಲ್:</strong> ಹೊಣೆಗಾರಿಕೆ ಮತ್ತು ಪರಿಶೀಲನೆಗಾಗಿ ದಾಸ್ತಾನು ಬದಲಾವಣೆಗಳ ಲಾಗ್ ಅನ್ನು ನಿರ್ವಹಿಸಿ</li>
          <li><strong>ಸೇವೆಯನ್ನು ಸುಧಾರಿಸಿ:</strong> ಅನಾಮಧೇಯ ದೋಷ ವರದಿಗಳ ಮೂಲಕ ದೋಷಗಳು ಮತ್ತು ಕ್ರ್ಯಾಶ್‌ಗಳನ್ನು ಪತ್ತೆಹಚ್ಚಿ</li>
          <li><strong>ಸಂವಹನ:</strong> ಅಗತ್ಯ ಖಾತೆ-ಸಂಬಂಧಿತ ಅಧಿಸೂಚನೆಗಳನ್ನು ಕಳುಹಿಸಿ (ಉದಾ., ಪಾಸ್‌ವರ್ಡ್ ಮರುಹೊಂದಿಕೆಗಳು)</li>
        </ul>
        <p>ನಾವು ಮಾಡುತ್ತೇವೆ <strong>ಅಲ್ಲ</strong> ನಿಮ್ಮ ಡೇಟಾವನ್ನು ಜಾಹೀರಾತಿಗಾಗಿ ಬಳಸಿ ಮತ್ತು ನಾವು ಮಾಡುತ್ತೇವೆ <strong>ಅಲ್ಲ</strong> ನಿಮ್ಮ ವೈಯಕ್ತಿಕ ಮಾಹಿತಿಯನ್ನು ಮೂರನೇ ವ್ಯಕ್ತಿಗಳಿಗೆ ಮಾರಾಟ ಮಾಡಿ.</p>
      </div>
    </details>

    <details id="s3">
      <summary><h2>3. ಮೂರನೇ ವ್ಯಕ್ತಿಯ ಸೇವೆಗಳು</h2></summary>
      <div class="section-content">
        <p>ಅಪ್ಲಿಕೇಶನ್ ಅನ್ನು ನಿರ್ವಹಿಸಲು ನಾವು ಕೆಳಗಿನ ಮೂರನೇ ವ್ಯಕ್ತಿಯ ಸೇವೆಗಳನ್ನು ಬಳಸುತ್ತೇವೆ:</p>
        <table>
          <thead>
            <tr>
              <th>ಸೇವೆ</th>
              <th>ಉದ್ದೇಶ</th>
              <th>ಡೇಟಾ ಹಂಚಲಾಗಿದೆ</th>
              <th>ಗೌಪ್ಯತೆ ನೀತಿ</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Clerk</strong></td>
              <td>ದೃಢೀಕರಣ ಮತ್ತು ಅಧಿವೇಶನ ನಿರ್ವಹಣೆ</td>
              <td>Email, ಹೆಸರು, OAuth ಟೋಕನ್‌ಗಳು, ಸೆಷನ್ ಡೇಟಾ</td>
              <td><a href="https://clerk.com/legal/privacy" target="_blank" rel="noopener">clerk.com/legal/privacy</a></td>
            </tr>
            <tr>
              <td><strong>Sarvam AI</strong></td>
              <td>ಧ್ವನಿ ಸಂಸ್ಕರಣೆ (ಸ್ಪೀಚ್-ಟು-ಟೆಕ್ಸ್ಟ್, ನ್ಯಾಚುರಲ್ ಲ್ಯಾಂಗ್ವೇಜ್ ಪ್ರೊಸೆಸಿಂಗ್, ಟೆಕ್ಸ್ಟ್-ಟು-ಸ್ಪೀಚ್)</td>
              <td>ಆಡಿಯೋ ರೆಕಾರ್ಡಿಂಗ್‌ಗಳು, ಪ್ರತಿಲಿಪಿ ಪಠ್ಯ, ಭಾಷಾ ಕೋಡ್</td>
              <td><a href="https://www.sarvam.ai/privacy-policy" target="_blank" rel="noopener">sarvam.ai/privacy-policy</a></td>
            </tr>
            <tr>
              <td><strong>Neon</strong></td>
              <td>ಡೇಟಾಬೇಸ್ ಹೋಸ್ಟಿಂಗ್ (PostgreSQL)</td>
              <td>ಎಲ್ಲಾ ನಿರಂತರ ಅಪ್ಲಿಕೇಶನ್ ಡೇಟಾ</td>
              <td><a href="https://neon.tech/privacy-policy" target="_blank" rel="noopener">neon.tech/privacy-policy</a></td>
            </tr>
            <tr>
              <td><strong>Sentry</strong></td>
              <td>ದೋಷ ಟ್ರ್ಯಾಕಿಂಗ್ ಮತ್ತು ಕ್ರ್ಯಾಶ್ ವರದಿ</td>
              <td>ಕ್ರ್ಯಾಶ್ ವರದಿಗಳು, ಸಾಧನದ ಮಾಹಿತಿ (ಉತ್ಪಾದನೆ ಮಾತ್ರ)</td>
              <td><a href="https://sentry.io/privacy/" target="_blank" rel="noopener">sentry.io/privacy</a></td>
            </tr>
          </tbody>
        </table>
        <p>ಪ್ರತಿ ಮೂರನೇ ವ್ಯಕ್ತಿಯ ಸೇವೆಯು ತಮ್ಮದೇ ಆದ ಗೌಪ್ಯತೆ ನೀತಿಯ ಪ್ರಕಾರ ಡೇಟಾವನ್ನು ಪ್ರಕ್ರಿಯೆಗೊಳಿಸುತ್ತದೆ. ಅವರ ನೀತಿಗಳನ್ನು ಪರಿಶೀಲಿಸಲು ನಾವು ನಿಮ್ಮನ್ನು ಪ್ರೋತ್ಸಾಹಿಸುತ್ತೇವೆ.</p>
      </div>
    </details>

    <details id="s4">
      <summary><h2>4. ಡೇಟಾ ಸಂಗ್ರಹಣೆ ಮತ್ತು ಭದ್ರತೆ</h2></summary>
      <div class="section-content">
        <ul>
          <li>ಅಪ್ಲಿಕೇಶನ್ ಡೇಟಾವನ್ನು Neon PostgreSQL ಡೇಟಾಬೇಸ್‌ನಲ್ಲಿ SSL/TLS ಸಾಗಣೆಯಲ್ಲಿ ಎನ್‌ಕ್ರಿಪ್ಶನ್‌ನೊಂದಿಗೆ ಸಂಗ್ರಹಿಸಲಾಗಿದೆ</li>
          <li>ದೃಢೀಕರಣ ಟೋಕನ್‌ಗಳನ್ನು ಸುರಕ್ಷಿತ ಸಂಗ್ರಹಣೆಯನ್ನು ಬಳಸಿಕೊಂಡು ನಿಮ್ಮ ಸಾಧನದಲ್ಲಿ ಸಂಗ್ರಹಿಸಲಾಗುತ್ತದೆ (iOS ಕೀಚೈನ್ /Androidಕೀಸ್ಟೋರ್)</li>
          <li>APIಸಂವಹನHTTPSಎನ್‌ಕ್ರಿಪ್ಶನ್ ಬಳಸುತ್ತದೆ</li>
          <li>ದುರ್ಬಳಕೆಯನ್ನು ತಡೆಯಲು ಸೂಕ್ಷ್ಮವಾದ ಅಂತಿಮ ಬಿಂದುಗಳು ದರ-ಸೀಮಿತವಾಗಿವೆ</li>
          <li>ಪಾಸ್‌ವರ್ಡ್‌ಗಳನ್ನು ಹ್ಯಾಶ್ ಮಾಡಲಾಗಿದೆ ಮತ್ತುClerkಮೂಲಕ ನಿರ್ವಹಿಸಲಾಗುತ್ತದೆ - ನಾವು ಎಂದಿಗೂ ಸರಳ ಪಠ್ಯ ಪಾಸ್‌ವರ್ಡ್‌ಗಳನ್ನು ಸಂಗ್ರಹಿಸುವುದಿಲ್ಲ</li>
        </ul>
      </div>
    </details>

    <details id="s5">
      <summary><h2>5. ಡೇಟಾ ಧಾರಣ</h2></summary>
      <div class="section-content">
        <ul>
          <li><strong>ಧ್ವನಿ ಆಡಿಯೋ:</strong> ಅಲ್ಪಕಾಲಿಕ - ಸ್ಮರಣೆಯಲ್ಲಿ ಸಂಸ್ಕರಿಸಲಾಗುತ್ತದೆ ಮತ್ತು ತಕ್ಷಣವೇ ತಿರಸ್ಕರಿಸಲಾಗುತ್ತದೆ. ನಮ್ಮ ಸರ್ವರ್‌ಗಳಲ್ಲಿ ಎಂದಿಗೂ ಸಂಗ್ರಹಿಸಲಾಗಿಲ್ಲ.</li>
          <li><strong>ಪ್ರತಿಲಿಪಿಗಳು ಮತ್ತು ಆಡಿಟ್ ಲಾಗ್‌ಗಳು:</strong> ನಿಮ್ಮ ಉಲ್ಲೇಖಕ್ಕಾಗಿ ನಿಮ್ಮ ಖಾತೆಯು ಸಕ್ರಿಯವಾಗಿರುವವರೆಗೆ ಉಳಿಸಿಕೊಳ್ಳಲಾಗುತ್ತದೆ.</li>
          <li><strong>ದಾಸ್ತಾನು ಡೇಟಾ:</strong> ನಿಮ್ಮ ಖಾತೆಯು ಸಕ್ರಿಯವಾಗಿರುವವರೆಗೆ ಉಳಿಸಿಕೊಳ್ಳಲಾಗುತ್ತದೆ.</li>
          <li><strong>ಖಾತೆ ಡೇಟಾ:</strong> ನಿಮ್ಮ ಖಾತೆಯನ್ನು ನೀವು ಅಳಿಸುವವರೆಗೆ ಉಳಿಸಿಕೊಳ್ಳಲಾಗುತ್ತದೆ.</li>
          <li><strong>ಕ್ರ್ಯಾಶ್ ವರದಿಗಳು:</strong>Sentryಡೇಟಾ ಧಾರಣ ನೀತಿಯ ಪ್ರಕಾರ ಉಳಿಸಿಕೊಳ್ಳಲಾಗಿದೆ (ಸಾಮಾನ್ಯವಾಗಿ 90 ದಿನಗಳು).</li>
        </ul>
      </div>
    </details>

    <details id="s6">
      <summary><h2>6. ಖಾತೆ ಅಳಿಸುವಿಕೆ</h2></summary>
      <div class="section-content">
        <p>ನೀವು ಯಾವುದೇ ಸಮಯದಲ್ಲಿ ನಿಮ್ಮ ಖಾತೆಯನ್ನು ಅಳಿಸಬಹುದು <strong>Settings > Delete Account</strong> ಅಪ್ಲಿಕೇಶನ್ ಒಳಗೆ. ನಿಮ್ಮ ಖಾತೆಯನ್ನು ನೀವು ಅಳಿಸಿದಾಗ:</p>
        <ul>
          <li>ಎಲ್ಲಾ ಉತ್ಪನ್ನಗಳು, ದಾಸ್ತಾನು, ಬ್ಯಾಚ್‌ಗಳು, ಖರೀದಿ ಪಟ್ಟಿಗಳು ಮತ್ತು AI ಮುನ್ನೋಟಗಳನ್ನು ಒಳಗೊಂಡಂತೆ ನೀವು ಹೊಂದಿರುವ ಎಲ್ಲಾ ಅಂಗಡಿಗಳನ್ನು ಶಾಶ್ವತವಾಗಿ ಅಳಿಸಲಾಗುತ್ತದೆ</li>
          <li>ನಿಮ್ಮ ಎಲ್ಲಾ ಆಡಿಟ್ ಲಾಗ್‌ಗಳು ಮತ್ತು ಪ್ರಾಶಸ್ತ್ಯಗಳನ್ನು ಶಾಶ್ವತವಾಗಿ ಅಳಿಸಲಾಗುತ್ತದೆ</li>
          <li>ಇತರ ಬಳಕೆದಾರರ ಅಂಗಡಿಗಳಲ್ಲಿನ ನಿಮ್ಮ ಸದಸ್ಯತ್ವಗಳನ್ನು ತೆಗೆದುಹಾಕಲಾಗಿದೆ</li>
          <li>Clerkನೊಂದಿಗೆ ನಿಮ್ಮ ದೃಢೀಕರಣ ಖಾತೆಯನ್ನು ಶಾಶ್ವತವಾಗಿ ಅಳಿಸಲಾಗಿದೆ</li>
        </ul>
        <p><strong>ಈ ಕ್ರಿಯೆಯು ಬದಲಾಯಿಸಲಾಗದು.</strong> ಒಮ್ಮೆ ಅಳಿಸಿದರೆ, ನಿಮ್ಮ ಡೇಟಾವನ್ನು ಮರುಪಡೆಯಲಾಗುವುದಿಲ್ಲ.</p>
      </div>
    </details>

    <details id="s7">
      <summary><h2>7. ಅಂಗಡಿಗಳಲ್ಲಿ ಡೇಟಾ ಹಂಚಿಕೆ</h2></summary>
      <div class="section-content">
        <p>Samaan-Bolಒಂದು ಸಹಕಾರಿ ಸಾಧನವಾಗಿದೆ. ನೀವು ಅಂಗಡಿಯ ಸದಸ್ಯರಾಗಿರುವಾಗ:</p>
        <ul>
          <li>ಎಲ್ಲಾ ಅಂಗಡಿಯ ಸದಸ್ಯರು (Owners,Managers, Helpers) ಅಂಗಡಿಯ ದಾಸ್ತಾನು ಡೇಟಾ, ಉತ್ಪನ್ನ ಕ್ಯಾಟಲಾಗ್ ಮತ್ತು ಆಡಿಟ್ ಲಾಗ್‌ಗಳನ್ನು ನೋಡಬಹುದು</li>
          <li>ನಿಮ್ಮ ಹೆಸರು, ಪಾತ್ರ ಮತ್ತು ಚಟುವಟಿಕೆಯ ಸಮಯದ ಮುದ್ರೆಗಳು ಇತರ ಅಂಗಡಿ ಸದಸ್ಯರಿಗೆ ಗೋಚರಿಸುತ್ತವೆ</li>
          <li>Owners ಸದಸ್ಯತ್ವ ಮತ್ತು ಅವರ ಅಂಗಡಿಗೆ ಪ್ರವೇಶವನ್ನು ನಿರ್ವಹಿಸಬಹುದು</li>
        </ul>
        <p>ನೀವು ಸದಸ್ಯರಲ್ಲದ ಅಂಗಡಿಗಳೊಂದಿಗೆ ಅಥವಾ ಯಾವುದೇ ಸಂಬಂಧವಿಲ್ಲದ ಮೂರನೇ ವ್ಯಕ್ತಿಗಳೊಂದಿಗೆ ನಿಮ್ಮ ಡೇಟಾವನ್ನು ನಾವು ಹಂಚಿಕೊಳ್ಳುವುದಿಲ್ಲ.</p>
      </div>
    </details>

    <details id="s8">
      <summary><h2>8. ಮಕ್ಕಳ ಗೌಪ್ಯತೆ</h2></summary>
      <div class="section-content">
        <p>Samaan-Bolವರ್ಷದೊಳಗಿನ ಮಕ್ಕಳ ಬಳಕೆಗೆ ಉದ್ದೇಶಿಸಿಲ್ಲ. 13 ವರ್ಷದೊಳಗಿನ ಮಕ್ಕಳಿಂದ ನಾವು ಉದ್ದೇಶಪೂರ್ವಕವಾಗಿ ವೈಯಕ್ತಿಕ ಮಾಹಿತಿಯನ್ನು ಸಂಗ್ರಹಿಸುವುದಿಲ್ಲ. ಮಗುವು ನಮಗೆ ವೈಯಕ್ತಿಕ ಮಾಹಿತಿಯನ್ನು ಒದಗಿಸಿದೆ ಎಂದು ನೀವು ಭಾವಿಸಿದರೆ, ದಯವಿಟ್ಟು ನಮ್ಮನ್ನು ಸಂಪರ್ಕಿಸಿ ಮತ್ತು ನಾವು ಅದನ್ನು ತ್ವರಿತವಾಗಿ ಅಳಿಸುತ್ತೇವೆ.</p>
      </div>
    </details>

    <details id="s9">
      <summary><h2>9. ನಿಮ್ಮ ಹಕ್ಕುಗಳು</h2></summary>
      <div class="section-content">
        <p>ನೀವು ಹಕ್ಕನ್ನು ಹೊಂದಿದ್ದೀರಿ:</p>
        <ul>
          <li><strong>ನಿಮ್ಮ ಡೇಟಾವನ್ನು ಪ್ರವೇಶಿಸಿ:</strong> ಅಪ್ಲಿಕೇಶನ್‌ನಲ್ಲಿ ನಿಮ್ಮ ಇನ್ವೆಂಟರಿ, ಆಡಿಟ್ ಲಾಗ್‌ಗಳು ಮತ್ತು ಆದ್ಯತೆಗಳನ್ನು ವೀಕ್ಷಿಸಿ</li>
          <li><strong>ನಿಮ್ಮ ಡೇಟಾವನ್ನು ಅಳಿಸಿ:</strong> ಸೆಟ್ಟಿಂಗ್‌ಗಳಲ್ಲಿ ಖಾತೆ ಅಳಿಸುವಿಕೆ ವೈಶಿಷ್ಟ್ಯವನ್ನು ಬಳಸಿ</li>
          <li><strong>ನಿಯಂತ್ರಣ ಆದ್ಯತೆಗಳು:</strong> ಯಾವುದೇ ಸಮಯದಲ್ಲಿ ನಿಮ್ಮ ಭಾಷೆ, ಪ್ರದರ್ಶನ ಮತ್ತು ಧ್ವನಿ ಸೆಟ್ಟಿಂಗ್‌ಗಳನ್ನು ಮಾರ್ಪಡಿಸಿ</li>
          <li><strong>ಅಂಗಡಿಗಳಿಂದ ಹಿಂಪಡೆಯಿರಿ:</strong> ನೀವು ಸದಸ್ಯರಾಗಿರುವ ಯಾವುದೇ ಅಂಗಡಿಯನ್ನು ಬಿಡಿ</li>
        </ul>
      </div>
    </details>

    <details id="s10">
      <summary><h2>10. ಈ ನೀತಿಗೆ ಬದಲಾವಣೆಗಳು</h2></summary>
      <div class="section-content">
        <p>ನಾವು ಈ ಗೌಪ್ಯತಾ ನೀತಿಯನ್ನು ಕಾಲಕಾಲಕ್ಕೆ ನವೀಕರಿಸಬಹುದು. ನಾವು ಮಾಡಿದಾಗ, ನಾವು ಈ ಪುಟದ ಮೇಲ್ಭಾಗದಲ್ಲಿ "ಪರಿಣಾಮಕಾರಿ ದಿನಾಂಕ" ಅನ್ನು ನವೀಕರಿಸುತ್ತೇವೆ. ಈ ನೀತಿಯನ್ನು ನಿಯತಕಾಲಿಕವಾಗಿ ಪರಿಶೀಲಿಸಲು ನಾವು ನಿಮ್ಮನ್ನು ಪ್ರೋತ್ಸಾಹಿಸುತ್ತೇವೆ. ಬದಲಾವಣೆಯ ನಂತರ ಅಪ್ಲಿಕೇಶನ್‌ನ ಮುಂದುವರಿದ ಬಳಕೆಯು ನವೀಕರಿಸಿದ ನೀತಿಯನ್ನು ಅಂಗೀಕರಿಸುತ್ತದೆ.</p>
      </div>
    </details>

    <details id="s11">
      <summary><h2>11. ನಮ್ಮನ್ನು ಸಂಪರ್ಕಿಸಿ</h2></summary>
      <div class="section-content">
        <p>ಈ ಗೌಪ್ಯತೆ ನೀತಿ ಅಥವಾ ನಿಮ್ಮ ಡೇಟಾದ ಕುರಿತು ನೀವು ಯಾವುದೇ ಪ್ರಶ್ನೆಗಳನ್ನು ಹೊಂದಿದ್ದರೆ, ದಯವಿಟ್ಟು ನಮ್ಮನ್ನು ಇಲ್ಲಿ ಸಂಪರ್ಕಿಸಿ:</p>
        <p><strong>Email:</strong> <a href="mailto:meetslimshady07@gmail.com">meetslimshady07@gmail.com</a></p>
      </div>
    </details>

    <p class="copyright">© 2026 Samaan-Bol. ಎಲ್ಲಾ ಹಕ್ಕುಗಳನ್ನು ಕಾಯ್ದಿರಿಸಲಾಗಿದೆ.</p>
  </div>

  <button class="back-to-top" id="backToTop" aria-label="Back to top">↑</button>`,
    terms: `<div class="reading-progress" id="readingProgress"></div>

  <div class="container">
    <a href="/" class="back">← ಮನೆಗೆ ಹಿಂತಿರುಗಿ</a>
    <h1>ಸೇವಾ ನಿಯಮಗಳು</h1>
    <p class="effective">ಪರಿಣಾಮಕಾರಿ ದಿನಾಂಕ: ಫೆಬ್ರವರಿ 23, 2026</p>

    <nav class="toc">
      <h3>ಪರಿವಿಡಿ</h3>
      <ol>
        <li><a href="#s1">ಸೇವೆಯ ವಿವರಣೆ</a></li>
        <li><a href="#s2">ಖಾತೆ ನೋಂದಣಿ</a></li>
        <li><a href="#s3">ಬಳಕೆದಾರರ ಪಾತ್ರಗಳು ಮತ್ತು ಜವಾಬ್ದಾರಿಗಳು</a></li>
        <li><a href="#s4">ಧ್ವನಿ ಇನ್ಪುಟ್</a></li>
        <li><a href="#s5">ಸ್ವೀಕಾರಾರ್ಹ ಬಳಕೆ</a></li>
        <li><a href="#s6">ನಿಮ್ಮ ಡೇಟಾ</a></li>
        <li><a href="#s7">ಸೇವೆ ಲಭ್ಯತೆ</a></li>
        <li><a href="#s8">ದರ ಮಿತಿಗಳು</a></li>
        <li><a href="#s9">ಖಾತೆ ಮುಕ್ತಾಯ</a></li>
        <li><a href="#s10">ಬೌದ್ಧಿಕ ಆಸ್ತಿ</a></li>
        <li><a href="#s11">ವಾರಂಟಿಗಳ ಹಕ್ಕು ನಿರಾಕರಣೆ</a></li>
        <li><a href="#s12">ಹೊಣೆಗಾರಿಕೆಯ ಮಿತಿ</a></li>
        <li><a href="#s13">ಈ ನಿಯಮಗಳಿಗೆ ಬದಲಾವಣೆಗಳು</a></li>
        <li><a href="#s14">ಆಡಳಿತ ಕಾನೂನು</a></li>
        <li><a href="#s15">ನಮ್ಮನ್ನು ಸಂಪರ್ಕಿಸಿ</a></li>
      </ol>
    </nav>

    <p>Samaan-Bolಗೆ ಸುಸ್ವಾಗತ. ಈ ಸೇವಾ ನಿಯಮಗಳು ("ನಿಯಮಗಳು")Samaan-Bolಮೊಬೈಲ್ ಅಪ್ಲಿಕೇಶನ್ ಮತ್ತು ಸಂಬಂಧಿತ ಸೇವೆಗಳ (ಒಟ್ಟಾರೆಯಾಗಿ, "ಸೇವೆ") ನಿಮ್ಮ ಬಳಕೆಯನ್ನು ನಿಯಂತ್ರಿಸುತ್ತದೆ. ಖಾತೆಯನ್ನು ರಚಿಸುವ ಮೂಲಕ ಅಥವಾ ಸೇವೆಯನ್ನು ಬಳಸುವ ಮೂಲಕ, ನೀವು ಈ ನಿಯಮಗಳಿಗೆ ಬದ್ಧರಾಗಿರಲು ಒಪ್ಪುತ್ತೀರಿ.</p>

    <details open id="s1">
      <summary><h2>1. ಸೇವೆಯ ವಿವರಣೆ</h2></summary>
      <div class="section-content">
        <p>Samaan-Bolಭಾರತೀಯ ಚಿಲ್ಲರೆ ವ್ಯಾಪಾರಗಳಿಗಾಗಿ ವಿನ್ಯಾಸಗೊಳಿಸಲಾದ ಧ್ವನಿ-ಮೊದಲ ಸಹಯೋಗದ ದಾಸ್ತಾನು ನಿರ್ವಹಣೆ ಅಪ್ಲಿಕೇಶನ್ ಆಗಿದೆ. ಸೇವೆಯು ನಿಮಗೆ ಇದನ್ನು ಅನುಮತಿಸುತ್ತದೆ:</p>
        <ul>
          <li>ಬಹು ಭಾರತೀಯ ಭಾಷೆಗಳಲ್ಲಿ ಧ್ವನಿ ಆಜ್ಞೆಗಳನ್ನು ಬಳಸಿಕೊಂಡು ಉತ್ಪನ್ನ ದಾಸ್ತಾನು ನಿರ್ವಹಿಸಿ</li>
          <li>ಸ್ಟಾಕ್ ಮಟ್ಟಗಳು, ಬ್ಯಾಚ್‌ಗಳು, ಮುಕ್ತಾಯ ದಿನಾಂಕಗಳು ಮತ್ತು ಖರೀದಿ ಮಾಹಿತಿಯನ್ನು ಟ್ರ್ಯಾಕ್ ಮಾಡಿ</li>
          <li>ಪಾತ್ರ-ಆಧಾರಿತ ಪ್ರವೇಶದ ಮೂಲಕ ತಂಡದ ಸದಸ್ಯರೊಂದಿಗೆ ಸಹಕರಿಸಿ (Owner,Manager, Helper)</li>
          <li>ಎಲ್ಲಾ ದಾಸ್ತಾನು ಬದಲಾವಣೆಗಳ ಆಡಿಟ್ ಟ್ರೇಲ್‌ಗಳನ್ನು ವೀಕ್ಷಿಸಿ</li>
          <li>ಖರೀದಿ ಪಟ್ಟಿಗಳನ್ನು ನಿರ್ವಹಿಸಿ ಮತ್ತು ಸ್ಟಾಕ್ ಮಟ್ಟದ ಎಚ್ಚರಿಕೆಗಳನ್ನು ಸ್ವೀಕರಿಸಿ</li>
        </ul>
      </div>
    </details>

    <details id="s2">
      <summary><h2>2. ಖಾತೆ ನೋಂದಣಿ</h2></summary>
      <div class="section-content">
        <p>ಸೇವೆಯನ್ನು ಬಳಸಲು, ನಿಖರವಾದ ಮತ್ತು ಸಂಪೂರ್ಣ ಮಾಹಿತಿಯನ್ನು ಒದಗಿಸುವ ಮೂಲಕ ನೀವು ಖಾತೆಯನ್ನು ರಚಿಸಬೇಕು. ನೀವು ಇದಕ್ಕೆ ಜವಾಬ್ದಾರರಾಗಿರುತ್ತೀರಿ:</p>
        <ul>
          <li>ನಿಮ್ಮ ಖಾತೆಯ ರುಜುವಾತುಗಳ ಗೌಪ್ಯತೆಯನ್ನು ಕಾಪಾಡಿಕೊಳ್ಳುವುದು</li>
          <li>ನಿಮ್ಮ ಖಾತೆಯ ಅಡಿಯಲ್ಲಿ ಸಂಭವಿಸುವ ಎಲ್ಲಾ ಚಟುವಟಿಕೆಗಳು</li>
          <li>ನಿಮ್ಮ ಖಾತೆಯ ಯಾವುದೇ ಅನಧಿಕೃತ ಬಳಕೆಯ ಬಗ್ಗೆ ತಕ್ಷಣವೇ ನಮಗೆ ಸೂಚಿಸಲಾಗುತ್ತಿದೆ</li>
        </ul>
        <p>ಖಾತೆಯನ್ನು ರಚಿಸಲು ಮತ್ತು ಸೇವೆಯನ್ನು ಬಳಸಲು ನೀವು ಕನಿಷ್ಟ 13 ವರ್ಷ ವಯಸ್ಸಿನವರಾಗಿರಬೇಕು.</p>
      </div>
    </details>

    <details id="s3">
      <summary><h2>3. ಬಳಕೆದಾರರ ಪಾತ್ರಗಳು ಮತ್ತು ಜವಾಬ್ದಾರಿಗಳು</h2></summary>
      <div class="section-content">
        <p>Samaan-Bolಪಾತ್ರ-ಆಧಾರಿತ ಪ್ರವೇಶ ನಿಯಂತ್ರಣ ವ್ಯವಸ್ಥೆಯನ್ನು ಬಳಸುತ್ತದೆ:</p>
        <ul>
          <li><strong>Owner:</strong> ಅಂಗಡಿಗಳನ್ನು ರಚಿಸುತ್ತದೆ ಮತ್ತು ನಿರ್ವಹಿಸುತ್ತದೆ, ತಂಡದ ಸದಸ್ಯರನ್ನು ಆಹ್ವಾನಿಸುತ್ತದೆ, ಎಲ್ಲಾ ಅಂಗಡಿ ಡೇಟಾ ಮತ್ತು ಸೆಟ್ಟಿಂಗ್‌ಗಳಿಗೆ ಪೂರ್ಣ ಪ್ರವೇಶವನ್ನು ಹೊಂದಿದೆ ಮತ್ತು ಅಂಗಡಿಯನ್ನು ಅಳಿಸಬಹುದು</li>
          <li><strong>Manager:</strong> ದಾಸ್ತಾನು ನಿರ್ವಹಿಸಬಹುದು, ವರದಿಗಳನ್ನು ವೀಕ್ಷಿಸಬಹುದು ಮತ್ತು ಅಂಗಡಿಯೊಳಗೆ ಹೆಚ್ಚಿನ ಕಾರ್ಯಾಚರಣೆಗಳನ್ನು ಮಾಡಬಹುದು</li>
          <li><strong>Helper:</strong> ನಿರ್ದೇಶನದಂತೆ ಸ್ಟಾಕ್ ಐಟಂಗಳನ್ನು ಸೇರಿಸಬಹುದು ಮತ್ತು ತೆಗೆದುಹಾಕಬಹುದು</li>
        </ul>
        <p>Ownerನಂತೆ, ನಿಮ್ಮ ಅಂಗಡಿ ಮತ್ತು ಅದರೊಳಗಿನ ಡೇಟಾಗೆ ಪ್ರವೇಶವನ್ನು ನಿರ್ವಹಿಸಲು ನೀವು ಜವಾಬ್ದಾರರಾಗಿರುತ್ತೀರಿ. ನೀವು ಸದಸ್ಯರನ್ನು ಆಹ್ವಾನಿಸಿದಾಗ, ಅವರು ನಿಮ್ಮ ಅಂಗಡಿಯ ದಾಸ್ತಾನು ಡೇಟಾಗೆ ಪ್ರವೇಶವನ್ನು ಪಡೆಯುತ್ತಾರೆ.</p>
      </div>
    </details>

    <details id="s4">
      <summary><h2>4. ಧ್ವನಿ ಇನ್ಪುಟ್</h2></summary>
      <div class="section-content">
        <p>ಸೇವೆಯು ಮೂರನೇ ವ್ಯಕ್ತಿಯ AI ಸೇವೆಗಳನ್ನು ಬಳಸಿಕೊಂಡು ಧ್ವನಿ ಆಜ್ಞೆಗಳನ್ನು ಪ್ರಕ್ರಿಯೆಗೊಳಿಸುತ್ತದೆ. ದಯವಿಟ್ಟು ತಿಳಿದಿರಲಿ:</p>
        <ul>
          <li>ಧ್ವನಿ ರೆಕಾರ್ಡಿಂಗ್‌ಗಳು ಪ್ರತಿ ಆಜ್ಞೆಗೆ ಗರಿಷ್ಠ 30 ಸೆಕೆಂಡ್‌ಗಳಿಗೆ ಸೀಮಿತವಾಗಿವೆ</li>
          <li>ಸೇವೆಯು ಇಂಗ್ಲಿಷ್, ಹಿಂದಿ, ತಮಿಳು, ತೆಲುಗು, ಬೆಂಗಾಲಿ, ಮರಾಠಿ, ಕನ್ನಡ, ಗುಜರಾತಿ, ಮಲಯಾಳಂ ಮತ್ತು ಹಿಂಗ್ಲಿಷ್ ಸೇರಿದಂತೆ ಬಹು ಭಾಷೆಗಳನ್ನು ಬೆಂಬಲಿಸುತ್ತದೆ</li>
          <li>ಧ್ವನಿ ಗುರುತಿಸುವಿಕೆಯ ನಿಖರತೆಯು ಆಡಿಯೊ ಗುಣಮಟ್ಟ, ಹಿನ್ನೆಲೆ ಶಬ್ದ, ಉಚ್ಚಾರಣೆ ಮತ್ತು ಭಾಷೆಯ ಸ್ಪಷ್ಟತೆಯನ್ನು ಅವಲಂಬಿಸಿರುತ್ತದೆ</li>
          <li>ನಿಖರತೆಯನ್ನು ಖಚಿತಪಡಿಸಲು ನೀವು ಧ್ವನಿ-ಸಂಸ್ಕರಿಸಿದ ದಾಸ್ತಾನು ಬದಲಾವಣೆಗಳನ್ನು ಪರಿಶೀಲಿಸಬೇಕು</li>
          <li>ಧ್ವನಿ ಆಡಿಯೊವನ್ನು ನೈಜ ಸಮಯದಲ್ಲಿ ಸಂಸ್ಕರಿಸಲಾಗುತ್ತದೆ ಮತ್ತು ಶಾಶ್ವತವಾಗಿ ಸಂಗ್ರಹಿಸಲಾಗುವುದಿಲ್ಲ (ನಮ್ಮನ್ನು ನೋಡಿ <a href="/privacy-policy">ಗೌಪ್ಯತೆ ನೀತಿ</a> ವಿವರಗಳಿಗಾಗಿ)</li>
        </ul>
      </div>
    </details>

    <details id="s5">
      <summary><h2>5. ಸ್ವೀಕಾರಾರ್ಹ ಬಳಕೆ</h2></summary>
      <div class="section-content">
        <p>ಬೇಡವೆಂದು ನೀವು ಒಪ್ಪುತ್ತೀರಿ:</p>
        <ul>
          <li>ಯಾವುದೇ ಕಾನೂನುಬಾಹಿರ ಉದ್ದೇಶಕ್ಕಾಗಿ ಸೇವೆಯನ್ನು ಬಳಸಿ</li>
          <li>ಇತರ ಬಳಕೆದಾರರ ಖಾತೆಗಳು ಅಥವಾ ಅಂಗಡಿಗಳಿಗೆ ಅನಧಿಕೃತ ಪ್ರವೇಶವನ್ನು ಪಡೆಯುವ ಪ್ರಯತ್ನ</li>
          <li>ಸೇವೆ ಅಥವಾ ಅದರ ಮೂಲಸೌಕರ್ಯದಲ್ಲಿ ಮಧ್ಯಪ್ರವೇಶಿಸಿ ಅಥವಾ ಅಡ್ಡಿಪಡಿಸಿ</li>
          <li>ರಿವರ್ಸ್-ಎಂಜಿನಿಯರ್, ಡಿಕಂಪೈಲ್ ಅಥವಾ ಅಪ್ಲಿಕೇಶನ್ ಅನ್ನು ಡಿಸ್ಅಸೆಂಬಲ್ ಮಾಡಿ</li>
          <li>ಸಾಮಾನ್ಯ ಬಳಕೆಯ ಮಾದರಿಗಳನ್ನು ಮೀರಿ ಸೇವೆಯನ್ನು ಪ್ರವೇಶಿಸಲು ಸ್ವಯಂಚಾಲಿತ ಪರಿಕರಗಳನ್ನು ಬಳಸಿ</li>
          <li>ಆಹ್ವಾನ ಕೋಡ್‌ಗಳನ್ನು ಸಾರ್ವಜನಿಕವಾಗಿ ಅಥವಾ ನಿಮ್ಮ ಅಂಗಡಿಗೆ ಸೇರಲು ಉದ್ದೇಶಿಸದ ವ್ಯಕ್ತಿಗಳೊಂದಿಗೆ ಹಂಚಿಕೊಳ್ಳಿ</li>
          <li>ಅಂಗಡಿಯೊಳಗೆ ನಿಮ್ಮ ಗುರುತು ಅಥವಾ ಪಾತ್ರವನ್ನು ತಪ್ಪಾಗಿ ನಿರೂಪಿಸಿ</li>
        </ul>
      </div>
    </details>

    <details id="s6">
      <summary><h2>6. ನಿಮ್ಮ ಡೇಟಾ</h2></summary>
      <div class="section-content">
        <p>ನೀವು ಸೇವೆಯಲ್ಲಿ ನಮೂದಿಸಿದ ವ್ಯಾಪಾರ ಡೇಟಾದ ಮಾಲೀಕತ್ವವನ್ನು ನೀವು ಉಳಿಸಿಕೊಳ್ಳುತ್ತೀರಿ (ಉತ್ಪನ್ನ ಮಾಹಿತಿ, ದಾಸ್ತಾನು ದಾಖಲೆಗಳು, ಇತ್ಯಾದಿ.). ನಿಮ್ಮ ವಿಷಯದ ಮಾಲೀಕತ್ವವನ್ನು ನಾವು ಕ್ಲೈಮ್ ಮಾಡುವುದಿಲ್ಲ.</p>
        <p>ಸೇವೆಯನ್ನು ಬಳಸುವ ಮೂಲಕ, ಸೇವೆಯನ್ನು ಒದಗಿಸುವ ಮತ್ತು ಸುಧಾರಿಸುವ ಉದ್ದೇಶಕ್ಕಾಗಿ ನಿಮ್ಮ ಡೇಟಾವನ್ನು ಸಂಗ್ರಹಿಸಲು, ಪ್ರಕ್ರಿಯೆಗೊಳಿಸಲು ಮತ್ತು ರವಾನಿಸಲು ನೀವು ನಮಗೆ ಸೀಮಿತ ಪರವಾನಗಿಯನ್ನು ನೀಡುತ್ತೀರಿ.</p>
        <p>ನಿಮ್ಮ ಡೇಟಾವನ್ನು ನಾವು ಹೇಗೆ ಸಂಗ್ರಹಿಸುತ್ತೇವೆ, ಬಳಸುತ್ತೇವೆ ಮತ್ತು ರಕ್ಷಿಸುತ್ತೇವೆ ಎಂಬುದರ ಕುರಿತು ವಿವರಗಳಿಗಾಗಿ, ದಯವಿಟ್ಟು ನಮ್ಮದನ್ನು ಪರಿಶೀಲಿಸಿ <a href="/privacy-policy">ಗೌಪ್ಯತೆ ನೀತಿ</a>.</p>
      </div>
    </details>

    <details id="s7">
      <summary><h2>7. ಸೇವೆ ಲಭ್ಯತೆ</h2></summary>
      <div class="section-content">
        <p>ನಾವು ಸೇವೆಯನ್ನು ಎಲ್ಲಾ ಸಮಯದಲ್ಲೂ ಲಭ್ಯವಾಗುವಂತೆ ಮಾಡಲು ಪ್ರಯತ್ನಿಸುತ್ತೇವೆ, ಆದರೆ ತಡೆರಹಿತ ಪ್ರವೇಶವನ್ನು ನಾವು ಖಾತರಿಪಡಿಸುವುದಿಲ್ಲ. ಈ ಕಾರಣದಿಂದಾಗಿ ಸೇವೆಯು ತಾತ್ಕಾಲಿಕವಾಗಿ ಲಭ್ಯವಿಲ್ಲದಿರಬಹುದು:</p>
        <ul>
          <li>ಯೋಜಿತ ನಿರ್ವಹಣೆ ಅಥವಾ ನವೀಕರಣಗಳು</li>
          <li>ನಮ್ಮ ನಿಯಂತ್ರಣಕ್ಕೆ ಮೀರಿದ ತಾಂತ್ರಿಕ ಸಮಸ್ಯೆಗಳು</li>
          <li>ಮೂರನೇ ವ್ಯಕ್ತಿಯ ಸೇವೆ ಸ್ಥಗಿತಗಳು (ದೃಢೀಕರಣ, ಧ್ವನಿ ಸಂಸ್ಕರಣೆ, ಡೇಟಾಬೇಸ್ ಹೋಸ್ಟಿಂಗ್)</li>
        </ul>
        <p>ಸೇವೆಯ ಅಲಭ್ಯತೆಯಿಂದ ಉಂಟಾಗುವ ಯಾವುದೇ ನಷ್ಟಗಳಿಗೆ ನಾವು ಜವಾಬ್ದಾರರಾಗಿರುವುದಿಲ್ಲ.</p>
      </div>
    </details>

    <details id="s8">
      <summary><h2>8. ದರ ಮಿತಿಗಳು</h2></summary>
      <div class="section-content">
        <p>ನ್ಯಾಯಯುತ ಬಳಕೆ ಮತ್ತು ಸೇವಾ ಸ್ಥಿರತೆಯನ್ನು ಖಚಿತಪಡಿಸಿಕೊಳ್ಳಲು, ಸೇವೆಯುAPIವಿನಂತಿಗಳ ಮೇಲೆ ದರ ಮಿತಿಗಳನ್ನು ಜಾರಿಗೊಳಿಸುತ್ತದೆ. ಈ ಮಿತಿಗಳನ್ನು ಮೀರಿದರೆ ನಿಮ್ಮ ವಿನಂತಿಗಳ ತಾತ್ಕಾಲಿಕ ಥ್ರೊಟಲ್‌ಗೆ ಕಾರಣವಾಗಬಹುದು.</p>
      </div>
    </details>

    <details id="s9">
      <summary><h2>9. ಖಾತೆ ಮುಕ್ತಾಯ</h2></summary>
      <div class="section-content">
        <p>ನೀವು ಯಾವುದೇ ಸಮಯದಲ್ಲಿ ನಿಮ್ಮ ಖಾತೆಯನ್ನು ಅಳಿಸಬಹುದು <strong>Settings > Delete Account</strong> ಅಪ್ಲಿಕೇಶನ್‌ನಲ್ಲಿ. ಖಾತೆ ಅಳಿಸುವಿಕೆಯು ಶಾಶ್ವತ ಮತ್ತು ಬದಲಾಯಿಸಲಾಗದು - ನಿಮ್ಮ ಎಲ್ಲಾ ಅಂಗಡಿಗಳು, ದಾಸ್ತಾನು ಡೇಟಾ, ಆಡಿಟ್ ಲಾಗ್‌ಗಳು ಮತ್ತು ಆದ್ಯತೆಗಳನ್ನು ಶಾಶ್ವತವಾಗಿ ತೆಗೆದುಹಾಕಲಾಗುತ್ತದೆ.</p>
        <p>ಈ ನಿಯಮಗಳನ್ನು ಉಲ್ಲಂಘಿಸುವ ಅಥವಾ ನಿಂದನೀಯ ನಡವಳಿಕೆಯಲ್ಲಿ ತೊಡಗಿರುವ ಖಾತೆಗಳನ್ನು ಅಮಾನತುಗೊಳಿಸುವ ಅಥವಾ ಕೊನೆಗೊಳಿಸುವ ಹಕ್ಕನ್ನು ನಾವು ಕಾಯ್ದಿರಿಸಿದ್ದೇವೆ.</p>
      </div>
    </details>

    <details id="s10">
      <summary><h2>10. ಬೌದ್ಧಿಕ ಆಸ್ತಿ</h2></summary>
      <div class="section-content">
        <p>ಅದರ ವಿನ್ಯಾಸ, ಕೋಡ್, ಬ್ರ್ಯಾಂಡಿಂಗ್ ಮತ್ತು ದಸ್ತಾವೇಜನ್ನು ಒಳಗೊಂಡಂತೆSamaan-Bolಅಪ್ಲಿಕೇಶನ್ ನಮ್ಮ ಬೌದ್ಧಿಕ ಆಸ್ತಿಯಾಗಿದೆ. ನಮ್ಮ ಲಿಖಿತ ಅನುಮತಿಯಿಲ್ಲದೆ ಅಪ್ಲಿಕೇಶನ್‌ನ ಆಧಾರದ ಮೇಲೆ ನೀವು ನಕಲಿಸಲು, ಮಾರ್ಪಡಿಸಲು, ವಿತರಿಸಲು ಅಥವಾ ವ್ಯುತ್ಪನ್ನ ಕೃತಿಗಳನ್ನು ರಚಿಸಲು ಸಾಧ್ಯವಿಲ್ಲ.</p>
      </div>
    </details>

    <details id="s11">
      <summary><h2>11. ವಾರಂಟಿಗಳ ಹಕ್ಕು ನಿರಾಕರಣೆ</h2></summary>
      <div class="section-content">
        <p>ಯಾವುದೇ ರೀತಿಯ ವಾರಂಟಿಗಳಿಲ್ಲದೆಯೇ "ಇರುವಂತೆ" ಮತ್ತು "ಲಭ್ಯವಿರುವಂತೆ" ಸೇವೆಯನ್ನು ಒದಗಿಸಲಾಗಿದೆ, ಅದು ಎಕ್ಸ್‌ಪ್ರೆಸ್ ಅಥವಾ ಸೂಚ್ಯವಾಗಿದೆ. ನಾವು ನಿರ್ದಿಷ್ಟವಾಗಿ ಖಾತರಿಗಳನ್ನು ನಿರಾಕರಿಸುತ್ತೇವೆ:</p>
        <ul>
          <li>ನಿರ್ದಿಷ್ಟ ಉದ್ದೇಶಕ್ಕಾಗಿ ವ್ಯಾಪಾರ ಅಥವಾ ಫಿಟ್‌ನೆಸ್</li>
          <li>ಧ್ವನಿ ಗುರುತಿಸುವಿಕೆ ಅಥವಾ AI ರಚಿತ ಸಲಹೆಗಳ ನಿಖರತೆ</li>
          <li>ತಡೆರಹಿತ ಅಥವಾ ದೋಷ-ಮುಕ್ತ ಕಾರ್ಯಾಚರಣೆ</li>
        </ul>
        <p>ಧ್ವನಿ-ಆಧಾರಿತ ದಾಸ್ತಾನು ಕ್ರಮಗಳು ಸಹಾಯಕಗಳಾಗಿವೆ - ನೀವು ನಿರ್ಣಾಯಕ ಸ್ಟಾಕ್ ನಿರ್ಧಾರಗಳನ್ನು ಸ್ವತಂತ್ರವಾಗಿ ಪರಿಶೀಲಿಸಬೇಕು.</p>
      </div>
    </details>

    <details id="s12">
      <summary><h2>12. ಹೊಣೆಗಾರಿಕೆಯ ಮಿತಿ</h2></summary>
      <div class="section-content">
        <p>ಕಾನೂನಿನಿಂದ ಅನುಮತಿಸಲಾದ ಗರಿಷ್ಠ ಮಟ್ಟಿಗೆ, ಸೇವೆಯ ನಿಮ್ಮ ಬಳಕೆಯಿಂದ ಉಂಟಾಗುವ ಯಾವುದೇ ಪರೋಕ್ಷ, ಪ್ರಾಸಂಗಿಕ, ವಿಶೇಷ, ಪರಿಣಾಮವಾಗಿ ಅಥವಾ ದಂಡನಾತ್ಮಕ ಹಾನಿಗಳಿಗೆ ನಾವು ಜವಾಬ್ದಾರರಾಗಿರುವುದಿಲ್ಲ, ಆದರೆ ಇವುಗಳಿಗೆ ಸೀಮಿತವಾಗಿಲ್ಲ:</p>
        <ul>
          <li>ಧ್ವನಿ ಗುರುತಿಸುವಿಕೆ ದೋಷಗಳ ಪರಿಣಾಮವಾಗಿ ದಾಸ್ತಾನು ವ್ಯತ್ಯಾಸಗಳು</li>
          <li>ಸೇವೆ ಸ್ಥಗಿತದ ಕಾರಣ ವ್ಯಾಪಾರ ನಷ್ಟಗಳು</li>
          <li>ನಮ್ಮ ಪ್ರಮಾಣಿತ ಬ್ಯಾಕ್‌ಅಪ್ ಕಾರ್ಯವಿಧಾನಗಳಿಂದ ಆವರಿಸಲ್ಪಟ್ಟಿರುವುದಕ್ಕಿಂತ ಹೆಚ್ಚಿನ ಡೇಟಾ ನಷ್ಟ</li>
        </ul>
      </div>
    </details>

    <details id="s13">
      <summary><h2>13. ಈ ನಿಯಮಗಳಿಗೆ ಬದಲಾವಣೆಗಳು</h2></summary>
      <div class="section-content">
        <p>ನಾವು ಈ ನಿಯಮಗಳನ್ನು ಕಾಲಕಾಲಕ್ಕೆ ನವೀಕರಿಸಬಹುದು. ನಾವು ಮಾಡಿದಾಗ, ನಾವು ಈ ಪುಟದ ಮೇಲ್ಭಾಗದಲ್ಲಿ "ಪರಿಣಾಮಕಾರಿ ದಿನಾಂಕ" ಅನ್ನು ನವೀಕರಿಸುತ್ತೇವೆ. ಬದಲಾವಣೆಯ ನಂತರ ಸೇವೆಯ ಮುಂದುವರಿದ ಬಳಕೆಯು ನವೀಕರಿಸಿದ ನಿಯಮಗಳನ್ನು ಅಂಗೀಕರಿಸುತ್ತದೆ.</p>
      </div>
    </details>

    <details id="s14">
      <summary><h2>14. ಆಡಳಿತ ಕಾನೂನು</h2></summary>
      <div class="section-content">
        <p>ಈ ನಿಯಮಗಳನ್ನು ಭಾರತದ ಕಾನೂನುಗಳಿಗೆ ಅನುಸಾರವಾಗಿ ನಿಯಂತ್ರಿಸಲಾಗುತ್ತದೆ ಮತ್ತು ಅರ್ಥೈಸಲಾಗುತ್ತದೆ. ಈ ನಿಯಮಗಳು ಅಥವಾ ಸೇವೆಯಿಂದ ಉದ್ಭವಿಸುವ ಯಾವುದೇ ವಿವಾದಗಳು ಭಾರತದಲ್ಲಿನ ನ್ಯಾಯಾಲಯಗಳ ವಿಶೇಷ ನ್ಯಾಯವ್ಯಾಪ್ತಿಗೆ ಒಳಪಟ್ಟಿರುತ್ತವೆ.</p>
      </div>
    </details>

    <details id="s15">
      <summary><h2>15. ನಮ್ಮನ್ನು ಸಂಪರ್ಕಿಸಿ</h2></summary>
      <div class="section-content">
        <p>ಈ ನಿಯಮಗಳ ಕುರಿತು ನೀವು ಯಾವುದೇ ಪ್ರಶ್ನೆಗಳನ್ನು ಹೊಂದಿದ್ದರೆ, ದಯವಿಟ್ಟು ನಮ್ಮನ್ನು ಇಲ್ಲಿ ಸಂಪರ್ಕಿಸಿ:</p>
        <p><strong>Email:</strong> <a href="mailto:meetslimshady07@gmail.com">meetslimshady07@gmail.com</a></p>
      </div>
    </details>

    <p class="copyright">© 2026 Samaan-Bol. ಎಲ್ಲಾ ಹಕ್ಕುಗಳನ್ನು ಕಾಯ್ದಿರಿಸಲಾಗಿದೆ.</p>
  </div>

  <button class="back-to-top" id="backToTop" aria-label="Back to top">↑</button>`,
  },
  "gu": {
    home: `<!-- Three.js background canvas -->
<canvas id="bgCanvas"></canvas>

<!-- Aurora ambient background (WebGL fallback) -->
<div class="aurora-bg"><div class="aurora-orb"></div></div>

<!-- Scroll progress indicator -->
<div class="scroll-progress" id="scrollProgress"></div>

<!-- ═══ NAVIGATION ═══ -->
<nav id="nav">
  <div class="container">
    <div class="nav-inner">
      <a href="#" class="logo">
        <div class="logo-mark"><svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><defs><mask id="stencil-nav"><rect x="0" y="0" width="100" height="100" fill="white"/><rect x="24" y="18" width="52" height="8" rx="4" fill="black"/><rect x="38" y="18" width="24" height="36" rx="12" fill="black"/><path d="M 28 42 A 22 22 0 0 0 72 42" fill="none" stroke="black" stroke-width="8" stroke-linecap="round"/><rect x="46" y="72" width="8" height="10" rx="4" fill="black"/><rect x="36" y="32" width="28" height="4" fill="white"/><rect x="36" y="44" width="28" height="4" fill="white"/></mask></defs><circle cx="50" cy="50" r="50" fill="#ea580c" mask="url(#stencil-nav)"/></svg></div>
        <div class="logo-text">સામન<span>બોલ</span></div>
      </a>
      <ul class="nav-links">
        <li><a href="#how">તે કેવી રીતે કામ કરે છે</a></li>
        <li><a href="#features">લક્ષણો</a></li>
        <li><a href="#ai">AI ઇન્ટેલિજન્સ</a></li>
        <li><a href="#languages">ભાષાઓ</a></li>
        <li><a href="https://apps.apple.com/in/app/samaan-bol/id6759739444" class="nav-cta">એપ ડાઉનલોડ કરો</a></li>
      </ul>
      <button class="mobile-menu-btn" aria-label="Menu">☰</button>
    </div>
  </div>
</nav>

<!-- ═══ HERO ═══ -->
<section class="hero">
  <div class="container">
    <div class="hero-grid">
      <div>
        <div class="hero-eyebrow">ભારતીય રિટેલ માટે વૉઇસ-પ્રથમ ઇન્વેન્ટરી</div>
        <h1 class="hero-text-reveal">
          <span class="hindi-line hindi">बोल के सँभालो अपना बिज़नेस</span>
          <span class="hero-text-main">તમારી દુકાન મેનેજ કરો<br>ફક્ત તમારા અવાજ સાથે</span>
        </h1>
        <p class="hero-sub">
          અંદર બોલો <span class="hero-rotate"><span class="hero-rotate-word active">હિન્દી</span><span class="hero-rotate-word">બંગાળી</span><span class="hero-rotate-word">તમિલ</span><span class="hero-rotate-word">તેલુગુ</span><span class="hero-rotate-word">મરાઠી</span><span class="hero-rotate-word">અંગ્રેજી</span></span>, અથવા 10 ભારતીય ભાષાઓમાંથી કોઈપણ.
          Samaan-Bol ના AI તમારા આદેશને સમજે છે, તમારી ઇન્વેન્ટરી અપડેટ કરે છે,
          અને તમારા વ્યવસાયને ચાલુ રાખે છે — હેન્ડ્સ-ફ્રી.
        </p>
        <div class="hero-actions">
          <a href="#download" class="btn-primary">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            મફત ડાઉનલોડ કરો
          </a>
          <a href="#how" class="btn-secondary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            જુઓ ઇટ ઇન એક્શન
          </a>
        </div>
        <div class="hero-stats">
          <div class="hero-stat">
            <div class="hero-stat-number">11</div>
            <div class="hero-stat-label">ભાષાઓ સપોર્ટેડ છે</div>
          </div>
          <div class="hero-stat">
            <div class="hero-stat-number">50K+</div>
            <div class="hero-stat-label">આઇટમ્સ દરરોજ ટ્રૅક કરવામાં આવે છે</div>
          </div>
          <div class="hero-stat">
            <div class="hero-stat-number">2 મિનિટ</div>
            <div class="hero-stat-label">સેટઅપ સમય</div>
          </div>
        </div>
      </div>

      <div class="hero-visual">
        <!-- Floating cards (z-index 10 — in FRONT of phone) -->
        <div class="float-card float-card--voice">
          <div class="float-card-icon float-card-icon--voice"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg></div>
          <p><strong class="hindi">"चावल 5 किलो जोड़ दो"</strong></p>
          <p style="margin-top:6px; font-size:12px; color:var(--success);">✓ Basmati Rice — 18 → 23 કિગ્રા</p>
        </div>

        <div class="float-card float-card--alert">
          <div class="float-card-icon float-card-icon--alert"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg></div>
          <p><strong>લો સ્ટોક એલર્ટ</strong></p>
          <p style="margin-top:4px; font-size:12px;">અટા 3 દિવસમાં સમાપ્ત થઈ શકે છે</p>
        </div>

        <!-- Phone mockup — mirrors actual app UI -->
        <div class="phone-frame">
          <div class="phone-notch"></div>
          <div class="phone-screen">
            <div class="phone-status-bar">
              <span>9:41</span>
              <span style="display:flex; gap:4px; align-items:center;">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z"/></svg>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><rect x="17" y="4" width="4" height="16" rx="1"/><rect x="11" y="8" width="4" height="12" rx="1"/><rect x="5" y="12" width="4" height="8" rx="1"/></svg>
                <svg width="14" height="12" viewBox="0 0 28 14" fill="currentColor"><rect x="0" y="1" width="22" height="12" rx="2" stroke="currentColor" fill="none" stroke-width="1.5"/><rect x="24" y="4.5" width="3" height="5" rx="1"/><rect x="2" y="3" width="14" height="8" rx="1"/></svg>
              </span>
            </div>

            <!-- Header: greeting + bell -->
            <div class="phone-header">
              <div>
                <div class="phone-greeting">સુપ્રભાત! 👋</div>
                <div class="phone-subtext">Priya General Store</div>
              </div>
              <div class="phone-bell">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B6B70" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                <div class="phone-bell-badge">3</div>
              </div>
            </div>

            <!-- Search bar with mic icon -->
            <div class="phone-search">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4A4A50" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <span class="phone-search-text">ઉત્પાદનો શોધો...</span>
              <div class="phone-search-mic">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0D0D12" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/></svg>
              </div>
            </div>

            <!-- 2x2 Stats grid -->
            <div class="phone-stats-grid">
              <div class="phone-stat-card phone-stat-card--total">
                <div class="phone-stat-number">142</div>
                <div class="phone-stat-label">કુલ વસ્તુઓ</div>
              </div>
              <div class="phone-stat-card phone-stat-card--low">
                <div class="phone-stat-number" style="color:var(--warning);">8</div>
                <div class="phone-stat-label">લો સ્ટોક</div>
              </div>
              <div class="phone-stat-card phone-stat-card--out">
                <div class="phone-stat-number" style="color:var(--danger);">2</div>
                <div class="phone-stat-label">સ્ટોક આઉટ</div>
              </div>
              <div class="phone-stat-card phone-stat-card--activity">
                <div class="phone-stat-number" style="color:var(--success);">23</div>
                <div class="phone-stat-label">આજે અપડેટ કર્યું</div>
              </div>
            </div>

            <!-- Filter chips -->
            <div class="phone-filter-row">
              <span class="phone-chip phone-chip--active">બધા</span>
              <span class="phone-chip">લો સ્ટોક</span>
              <span class="phone-chip">બહાર</span>
              <span class="phone-chip">સમાપ્તિ</span>
            </div>

            <!-- Product cards -->
            <div class="phone-product">
              <div class="phone-product-icon" style="background:rgba(255,181,71,0.12);">🍚</div>
              <div class="phone-product-info">
                <div class="phone-product-name">Basmati Rice</div>
                <div class="phone-product-meta">અનાજ · 2m પહેલા અપડેટ કરેલ</div>
              </div>
              <div class="phone-product-qty">
                <div class="phone-product-qty-num">23</div>
                <div class="phone-product-qty-unit">કિલો</div>
              </div>
            </div>

            <div class="phone-product">
              <div class="phone-product-icon" style="background:rgba(255,107,0,0.12);">🫒</div>
              <div class="phone-product-info">
                <div class="phone-product-name">Aashirvaad Atta</div>
                <div class="phone-product-meta">લોટ · 1 કલાક પહેલા અપડેટ કરેલ</div>
                <div class="phone-product-status phone-product-status--low">લો સ્ટોક</div>
              </div>
              <div class="phone-product-qty">
                <div class="phone-product-qty-num" style="color:var(--warning);">3</div>
                <div class="phone-product-qty-unit">કિલો</div>
              </div>
            </div>

            <div class="phone-product">
              <div class="phone-product-icon" style="background:rgba(50,213,131,0.1);">🥛</div>
              <div class="phone-product-info">
                <div class="phone-product-name">Amul Toned Milk</div>
                <div class="phone-product-meta">ડેરી · 3 કલાક પહેલા અપડેટ કરેલ</div>
              </div>
              <div class="phone-product-qty">
                <div class="phone-product-qty-num">40</div>
                <div class="phone-product-qty-unit">pkt</div>
              </div>
            </div>

          </div>
          <!-- Floating mic FAB (like the real app) -->
          <div class="phone-fab">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0D0D12" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/></svg>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ═══ HOW IT WORKS ═══ -->
<section class="how-it-works" id="how">
  <div class="container">
    <div class="reveal">
      <div class="section-label">તે કેવી રીતે કામ કરે છે</div>
      <h2 class="section-heading">ત્રણ પગલાં. કોઈ તાલીમની જરૂર નથી.</h2>
      <p class="section-sub">ફક્ત તમારી ભાષામાં કુદરતી રીતે બોલો - AI બાકીનું સંચાલન કરે છે.</p>
    </div>
    <div class="steps-grid">
      <div class="step reveal reveal-delay-1">
        <div class="step-number">01</div>
        <h3>તમારો આદેશ બોલો</h3>
        <p>માઇકને ટેપ કરો અને કહો કે તમને શું જોઈએ છે — સ્ટોક ઉમેરો, જથ્થો તપાસો, ખરીદીની સૂચિ બનાવો. કોઈપણ ભારતીય ભાષામાં.</p>
        <div class="step-example">
          <div class="hindi">"चावल 5 किलो जोड़ दो"</div>
          <div class="english">5 કિલો ચોખા ઉમેરો</div>
        </div>
      </div>
      <div class="step reveal reveal-delay-2">
        <div class="step-number">02</div>
        <h3>AI તરત જ સમજે છે</h3>
        <p>Sarvam AI તમારી વાણી પર પ્રક્રિયા કરે છે, ઉત્પાદન, જથ્થા અને ક્રિયાને બહાર કાઢે છે — પછી તેને તમારી ઇન્વેન્ટરી સાથે મેળ ખાય છે.</p>
        <div class="step-example">
          <div style="display:flex; gap:12px; flex-wrap:wrap;">
            <span style="background:var(--saffron-tint); color:var(--saffron); padding:4px 10px; border-radius:4px; font-size:12px;">ચોખા → બાસમતી 🍚</span>
            <span style="background:rgba(50,213,131,0.1); color:var(--success); padding:4px 10px; border-radius:4px; font-size:12px;">+5 કિગ્રા</span>
            <span style="background:rgba(99,102,241,0.1); color:#818CF8; padding:4px 10px; border-radius:4px; font-size:12px;">✓ ઉમેરો</span>
          </div>
        </div>
      </div>
      <div class="step reveal reveal-delay-3">
        <div class="step-number">03</div>
        <h3>ઇન્વેન્ટરી અપડેટ, કન્ફર્મ</h3>
        <p>તમારો સ્ટોક તરત જ અપડેટ થાય છે. તમે તમારી ભાષામાં વૉઇસ કન્ફર્મેશન સાંભળો છો — કોઈ સ્ક્રીનની જરૂર નથી.</p>
        <div class="step-example">
          <div class="hindi">"हो गया — बासमती चावल अब 23 किलो है"</div>
          <div class="english">થઈ ગયું — બાસમતી ચોખા હવે 23 કિલો છે</div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ═══ FEATURES ═══ -->
<section class="features" id="features" style="position:relative; overflow:hidden;">
  <div class="orb orb--saffron" style="top: -100px; right: -150px;"></div>
  <div class="container">
    <div class="reveal">
      <div class="section-label">લક્ષણો</div>
      <h2 class="section-heading">તમારી દુકાન માટે જરૂરી બધું. એવું કંઈ નથી.</h2>
    </div>
    <div class="features-grid">
      <div class="feature feature--hero reveal reveal-delay-1">
        <div class="feature-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg></div>
        <h3>વૉઇસ-પ્રથમ ઇન્વેન્ટરી</h3>
        <p>કુદરતી રીતે બોલીને સ્ટોક ઉમેરો, દૂર કરો અથવા તપાસો. કોઈ ટાઈપિંગ નથી, મેનુ દ્વારા કોઈ શોધ નથી. ફક્ત તમારી ભાષામાં બોલો અને AI બાકીનું સંચાલન કરે છે — તમારા આદેશને સમજવાથી લઈને તમારા સ્ટોકને રીઅલ ટાઇમમાં અપડેટ કરવા સુધી.</p>
      </div>
      <div class="feature reveal reveal-delay-2">
        <div class="feature-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg></div>
        <h3>10 ભારતીય ભાષાઓ + અંગ્રેજી</h3>
        <p>હિન્દી, બંગાળી, તમિલ, તેલુગુ, મરાઠી, કન્નડ, ગુજરાતી, મલયાલમ, પંજાબી અને ઓડિયા — Sarvam AI દ્વારા સંચાલિત.</p>
      </div>
      <div class="feature reveal reveal-delay-3">
        <div class="feature-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></div>
        <h3>ટીમની ભૂમિકાઓ</h3>
        <p>Owner, Manager અને Helper દાણાદાર પરવાનગીઓ સાથેની ભૂમિકાઓ. દરેક જણ એક જ પૃષ્ઠ પર, સુરક્ષિત રીતે.</p>
      </div>
      <div class="feature reveal reveal-delay-1">
        <div class="feature-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/><path d="M9 14l2 2 4-4"/></svg></div>
        <h3>સ્માર્ટ બાય લિસ્ટ</h3>
        <p>શું ઓછું ચાલી રહ્યું છે તેના આધારે સ્વતઃ-જનરેટેડ રીસ્ટોકિંગ સૂચિઓ. વોટ્સએપ દ્વારા સપ્લાયર્સ સાથે શેર કરો.</p>
      </div>
      <div class="feature reveal reveal-delay-2">
        <div class="feature-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></svg></div>
        <h3>પ્રવૃત્તિ ઓડિટ લોગ</h3>
        <p>દરેક ફેરફાર કોણ, શું અને ક્યારે સાથે ટ્રેક કરે છે. તમારી ટીમમાં સંપૂર્ણ પારદર્શિતા.</p>
      </div>
      <div class="feature reveal reveal-delay-3">
        <div class="feature-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><line x1="7" y1="12" x2="17" y2="12"/><line x1="7" y1="8" x2="17" y2="8"/><line x1="7" y1="16" x2="17" y2="16"/></svg></div>
        <h3>બારકોડ સ્કેનિંગ</h3>
        <p>ઉત્પાદનો ઉમેરવા અથવા તરત જ જોવા માટે સ્કેન કરો. ભારતીય અને આંતરરાષ્ટ્રીય બારકોડ સાથે કામ કરે છે.</p>
      </div>
    </div>
  </div>
</section>

<!-- ═══ AI INTELLIGENCE ═══ -->
<section class="ai-section" id="ai" style="overflow:hidden;">
  <div class="orb orb--indigo" style="bottom: -100px; left: -100px;"></div>
  <div class="orb orb--green" style="top: 200px; right: -80px;"></div>
  <div class="container">
    <div class="ai-header reveal">
      <div class="section-label">AI ઇન્ટેલિજન્સ</div>
      <h2 class="section-heading">
        <span class="hindi" style="display:block; color:var(--saffron); font-size:clamp(22px,2.8vw,32px); font-weight:500; margin-bottom:8px;">दार AI જે તમારા બિઝનેસને સમજો</span>
        માત્ર ટ્રેકિંગ જ નહીં — તમારી દુકાનનું પ્રથમ ડિજિટલ મગજ
      </h2>
      <p class="section-sub">Samaan-Bol તમે તેને જે કહો છો તે ફક્ત રેકોર્ડ કરતું નથી. તે તમારી પેટર્ન શીખે છે, તમારી જરૂરિયાતોની આગાહી કરે છે અને સમસ્યાઓ થાય તે પહેલાં તમને ચેતવણી આપે છે.</p>
    </div>

    <div class="ai-blocks">
      <!-- Predictive Stock -->
      <div class="ai-block reveal">
        <div class="ai-block-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg></div>
        <div class="ai-block-tag ai-block-tag--predict">અનુમાનિત સ્ટોક</div>
        <h3>તમે કરો તે પહેલાં તમને શું જોઈએ છે તે જાણે છે</h3>
        <p>AI તમારી વેચાણ પેટર્ન શીખે છે — દૈનિક, સાપ્તાહિક, મોસમી. તે આગાહી કરે છે કે આઇટમ્સ ક્યારે ઓછી ચાલશે અને પુનઃસ્ટોકિંગ દિવસો અગાઉથી સૂચવે છે.</p>
        <div class="ai-voice-example">
          <div class="voice-bubble">
            <div class="voice-bubble-avatar voice-bubble-avatar--ai"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg></div>
            <div class="voice-bubble-content">
              <div class="hindi">"આપકા અત્તા 3 દિન મેં ખતમ હો સકતા હૈ - હાફતે કી બિકરી કે હિસાબ સે"</div>
              <div class="translation">સાપ્તાહિક વેચાણના આધારે તમારો આટ્ટો 3 દિવસમાં સમાપ્ત થઈ શકે છે</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Smart Alerts -->
      <div class="ai-block reveal">
        <div class="ai-block-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg></div>
        <div class="ai-block-tag ai-block-tag--alert">સ્માર્ટ ચેતવણીઓ</div>
        <h3>ચેતવણીઓ જે તમારી ભાષા બોલે છે</h3>
        <p>સમાપ્તિની ચેતવણીઓ, સ્લો-મૂવિંગ સ્ટોક ડિટેક્શન અને કિંમતમાં વધઘટની ચેતવણીઓ — તમારી પસંદગીની ભાષામાં વૉઇસ સૂચનાઓ તરીકે વિતરિત કરવામાં આવે છે.</p>
        <div class="ai-voice-example">
          <div class="voice-bubble">
            <div class="voice-bubble-avatar voice-bubble-avatar--ai"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg></div>
            <div class="voice-bubble-content">
              <div class="hindi">"Parle-G કે 12 પેકેટ 5 દિન મેં એક્સપાયર હો રહે હૈં — ડિસ્કાઉન્ટ લગના ચાહીં?"</div>
              <div class="translation">12 Parle-G પેકેટ 5 દિવસમાં સમાપ્ત થઈ રહ્યા છે — ડિસ્કાઉન્ટ ઉમેરવા માંગો છો?</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Voice Analytics -->
      <div class="ai-block reveal">
        <div class="ai-block-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg></div>
        <div class="ai-block-tag ai-block-tag--insight">વૉઇસ ઍનલિટિક્સ</div>
        <h3>તમારી દુકાનને એક પ્રશ્ન પૂછો - તે જવાબ આપે છે</h3>
        <p>તમારા વ્યવસાય વિશે કુદરતી ભાષામાં કંઈપણ પૂછો. AI બોલાયેલા જવાબો અને ઓન-સ્ક્રીન ડેટા સાથે જવાબ આપે છે.</p>
        <div class="ai-voice-example">
          <div class="voice-bubble">
            <div class="voice-bubble-avatar voice-bubble-avatar--user"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>
            <div class="voice-bubble-content">
              <div class="hindi">"પિચલે હાફતે સબસે ઝ્યાદા ક્યા બિકા?"</div>
              <div class="translation">ગયા અઠવાડિયે સૌથી વધુ શું વેચાયું?</div>
            </div>
          </div>
          <div class="voice-bubble">
            <div class="voice-bubble-avatar voice-bubble-avatar--ai"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg></div>
            <div class="voice-bubble-content">
              <div class="hindi">"પિચલે હાફતે સબસે ઝ્યાદા ચાવલ બિકા - 48 કિલો"</div>
              <div class="translation">ચોખા છેલ્લા અઠવાડિયે સૌથી વધુ વેચાયા - 48 કિલો</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Team Intelligence -->
      <div class="ai-block reveal">
        <div class="ai-block-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>
        <div class="ai-block-tag ai-block-tag--team">ટીમ ઇન્ટેલિજન્સ</div>
        <h3>તમારી ટીમ શું કરી રહી છે તે જાણો</h3>
        <p>AI-સંચાલિત વિસંગતતા શોધ અસામાન્ય ઇન્વેન્ટરી ફેરફારોને ફ્લેગ કરે છે. સ્માર્ટ સારાંશ દર્શાવે છે કે કોણે શું અપડેટ કર્યું અને શું સુધારાની જરૂર હતી.</p>
        <div class="ai-voice-example">
          <div class="voice-bubble">
            <div class="voice-bubble-avatar voice-bubble-avatar--ai"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg></div>
            <div class="voice-bubble-content">
              <div class="hindi">"આજ શામ 6 બાજે 15 કિલો ચીની કા સ્ટોક કમ હુઆ — વેરીફાય કરીને?"</div>
              <div class="translation">આજે સાંજે 6 વાગ્યે 15 કિલો ખાંડનો સ્ટોક ઘટ્યો — ચકાસવા માંગો છો?</div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</section>

<!-- ═══ LANGUAGES ═══ -->
<section class="languages-section" id="languages">
  <div class="container">
    <div class="reveal">
      <div class="section-label">ભારત માટે બનાવાયેલ છે</div>
      <h2 class="section-heading">તમારી ભાષા. તમારો વ્યવસાય. તમારી રીત.</h2>
      <p class="section-sub">Samaan-Bol તમે જે રીતે બોલો છો તે રીતે બોલે છે — મૂળ સ્ક્રિપ્ટો, બોલચાલની શરતો અને પ્રાદેશિક ઉત્પાદન નામો માટે સંપૂર્ણ સમર્થન સાથે.</p>
    </div>
    <div class="lang-grid reveal">
      <div class="lang-chip lang-chip--featured">હિન્દી <span class="native hindi">हिन्दी</span></div>
      <div class="lang-chip">બંગાળી <span class="native">বাংলা</span></div>
      <div class="lang-chip">તમિલ <span class="native">தமிழ்</span></div>
      <div class="lang-chip">તેલુગુ <span class="native">తెలుగు</span></div>
      <div class="lang-chip">મરાઠી <span class="native">मराठी</span></div>
      <div class="lang-chip">કન્નડ <span class="native">ಕನ್ನಡ</span></div>
      <div class="lang-chip">ગુજરાતી <span class="native">ગુજરાતી</span></div>
      <div class="lang-chip">મલયાલમ <span class="native">മലയാളം</span></div>
      <div class="lang-chip">પંજાબી <span class="native">ਪੰਜਾਬੀ</span></div>
      <div class="lang-chip">ઓડિયા <span class="native">ଓଡ଼ିଆ</span></div>
      <div class="lang-chip">અંગ્રેજી <span class="native">અંગ્રેજી</span></div>
    </div>
  </div>
</section>

<!-- ═══ COMPARISON ═══ -->
<section class="comparison">
  <div class="container">
    <div class="reveal">
      <div class="section-label">શા માટે Samaan-Bol</div>
      <h2 class="section-heading">તફાવત રાત અને દિવસનો છે</h2>
    </div>
    <div class="comparison-grid reveal">
      <div class="comparison-col comparison-col--without">
        <h3>Samaan-Bol વગર</h3>
        <p class="comparison-col-subtitle">સ્ટોક મેનેજ કરવાની જૂની રીત</p>
        <ul class="comparison-list">
          <li><span class="icon">✕</span> મેન્યુઅલ ગણતરી, પેન અને પેપર રજીસ્ટર</li>
          <li><span class="icon">✕</span> જ્યારે ગ્રાહક પૂછે છે ત્યારે સ્ટોકઆઉટ્સ શોધાય છે</li>
          <li><span class="icon">✕</span> અનુમાન લગાવવું કે કેટલું પુનઃક્રમાંકિત કરવું</li>
          <li><span class="icon">✕</span> શું સમાપ્ત થઈ રહ્યું છે અથવા ધીમી ગતિએ ચાલી રહ્યું છે તેનો કોઈ ખ્યાલ નથી</li>
          <li><span class="icon">✕</span> સ્ટાફ શું કરી રહ્યો છે તે ટ્રૅક કરી શકાતું નથી</li>
          <li><span class="icon">✕</span> તહેવારની તૈયારી છેલ્લી ઘડીની અરાજકતા છે</li>
        </ul>
      </div>
      <div class="comparison-col comparison-col--with">
        <h3>Samaan-Bol સાથે</h3>
        <p class="comparison-col-subtitle">AI-સંચાલિત, વૉઇસ-ફર્સ્ટ, સરળ</p>
        <ul class="comparison-list">
          <li><span class="icon">✓</span> વૉઇસ અપડેટ્સ - તે કહો અને તે થઈ ગયું</li>
          <li><span class="icon">✓</span> સ્ટોકઆઉટના દિવસો પહેલા આગાહીયુક્ત ચેતવણીઓ</li>
          <li><span class="icon">✓</span> વાસ્તવિક ડેટાના આધારે AI-જનરેટેડ બાય લિસ્ટ</li>
          <li><span class="icon">✓</span> એક્સપાયરી અને સ્લો-મૂવર ડિટેક્શન બિલ્ટ ઇન</li>
          <li><span class="icon">✓</span> વિસંગતતા શોધ સાથે સંપૂર્ણ ઓડિટ ટ્રેલ</li>
          <li><span class="icon">✓</span> તહેવારની આગાહી 2 અઠવાડિયા વહેલા શરૂ થાય છે</li>
        </ul>
      </div>
    </div>
  </div>
</section>

<!-- ═══ TESTIMONIALS ═══ -->
<section class="testimonials">
  <div class="container">
    <div class="reveal">
      <div class="section-label">પ્રારંભિક અપનાવનારાઓ</div>
      <h2 class="section-heading">સમગ્ર ભારતમાં બીટા ટેસ્ટર્સ દ્વારા પ્રેમ</h2>
    </div>
    <div class="testimonials-grid">
      <div class="testimonial reveal reveal-delay-1">
        <div class="testimonial-stars">★★★★★</div>
        <blockquote>બીટા ટેસ્ટિંગ મેં કોશિશ કિયા — પહેલે દિન સે રજિસ્ટર બેન્ડ. અબ બસ બોલ દેતી હું ઔર સબ અપડેટ હો જાતા હૈ. ઇતના આસન હોગા સોચા નહિ થા.</blockquote>
        <div class="testimonial-author">મીના શર્મા</div>
        <div class="testimonial-role">બીટા ટેસ્ટર · કિરાણા સ્ટોર Owner, જયપુર</div>
      </div>
      <div class="testimonial reveal reveal-delay-2">
        <div class="testimonial-stars">★★★★★</div>
        <blockquote>જાન્યુઆરીમાં બેટા જોડાવા કિયા થા — હોલી કે લિયે એઆઈ ને પહેલેથી જ બતાયા કી ક્યા સ્ટોક બઢાના હૈ. અભી સે ઇતના સ્માર્ટ હૈ, સોચિયે લોન્ચ કે બાદ ક્યા હોગા.</blockquote>
        <div class="testimonial-author">અર્જુન પટેલ</div>
        <div class="testimonial-role">બીટા ટેસ્ટર · જનરલ સ્ટોર, અમદાવાદ</div>
      </div>
      <div class="testimonial reveal reveal-delay-3">
        <div class="testimonial-stars">★★★★★</div>
        <blockquote>બાંગ્લા મેં બોલતે હી સમજ ગયા — બેટા ટેસ્ટિંગ-એ દેખલામ જે અમર ભાષા તે કાજ કોરે. સ્ટાફ રા ઓ ખૂબ સરળતાથી korte pachhe ઉપયોગ.</blockquote>
        <div class="testimonial-author">રીના દાસ</div>
        <div class="testimonial-role">બીટા ટેસ્ટર · કાપડની દુકાન, કોલકાતા</div>
      </div>
    </div>
  </div>
</section>

<!-- ═══ CTA ═══ -->
<section class="cta-section" id="download">
  <div class="container">
    <div class="reveal">
      <div class="section-label">મફત પ્રારંભ કરો</div>
      <h2 class="section-heading">
        <span class="hindi" style="display:block; color:var(--saffron); font-size:clamp(20px,2.4vw,28px); font-weight:500; margin-bottom:8px;">आज ही शुरू करें</span>
        તમારી દુકાન નોટબુક કરતાં વધુ સારી રીતે લાયક છે
      </h2>
      <p class="section-sub">શરૂ કરવા માટે મફત. 2 મિનિટમાં સેટ કરો. ક્રેડિટ કાર્ડની જરૂર નથી.</p>
      <div class="cta-actions">
        <a href="https://apps.apple.com/in/app/samaan-bol/id6759739444" class="store-badge">
          <div class="store-badge-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg></div>
          <div class="store-badge-text">
            <div class="store-badge-label">પર ડાઉનલોડ કરો</div>
            <div class="store-badge-name">App Store</div>
          </div>
        </a>
        <a href="#" class="store-badge" style="position:relative; opacity:0.65; pointer-events:none;">
          <div class="store-badge-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.807 1.626a1 1 0 0 1 0 1.73l-2.808 1.626L15.206 12l2.492-2.491zM5.864 2.658L16.8 8.99l-2.3 2.3-8.636-8.632z"/></svg></div>
          <div class="store-badge-text">
            <div class="store-badge-label">તેના પર મેળવો</div>
            <div class="store-badge-name">Google Play</div>
          </div>
          <span style="position:absolute; top:-10px; right:-10px; background:var(--saffron); color:#fff; font-size:11px; font-weight:700; padding:3px 10px; border-radius:20px; letter-spacing:0.5px; text-transform:uppercase;">ટૂંક સમયમાં આવી રહ્યું છે</span>
        </a>
      </div>
    </div>
  </div>
</section>

<!-- ═══ FOOTER ═══ -->
<footer>
  <div class="container">
    <div class="footer-grid">
      <div class="footer-brand">
        <a href="#" class="logo">
          <div class="logo-mark"><svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><defs><mask id="stencil-footer"><rect x="0" y="0" width="100" height="100" fill="white"/><rect x="24" y="18" width="52" height="8" rx="4" fill="black"/><rect x="38" y="18" width="24" height="36" rx="12" fill="black"/><path d="M 28 42 A 22 22 0 0 0 72 42" fill="none" stroke="black" stroke-width="8" stroke-linecap="round"/><rect x="46" y="72" width="8" height="10" rx="4" fill="black"/><rect x="36" y="32" width="28" height="4" fill="white"/><rect x="36" y="44" width="28" height="4" fill="white"/></mask></defs><circle cx="50" cy="50" r="50" fill="#ea580c" mask="url(#stencil-footer)"/></svg></div>
          <div class="logo-text">સામન<span>બોલ</span></div>
        </a>
        <p>વૉઇસ-ફર્સ્ટ AI ઇન્વેન્ટરી મેનેજમેન્ટ, જે ભારતીય રિટેલના હૃદય માટે બનાવવામાં આવ્યું છે.</p>
      </div>
      <div class="footer-col">
        <h4>ઉત્પાદન</h4>
        <ul>
          <li><a href="#features">લક્ષણો</a></li>
          <li><a href="#ai">AI ઇન્ટેલિજન્સ</a></li>
          <li><a href="#languages">ભાષાઓ</a></li>
          <li><a href="#">કિંમત નિર્ધારણ</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>કંપની</h4>
        <ul>
          <li><a href="#">વિશે</a></li>
          <li><a href="#">બ્લોગ</a></li>
          <li><a href="#">કારકિર્દી</a></li>
          <li><a href="#">સંપર્ક કરો</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>આધાર</h4>
        <ul>
          <li><a href="#">સહાય કેન્દ્ર</a></li>
          <li><a href="/privacy-policy">ગોપનીયતા નીતિ</a></li>
          <li><a href="/terms-of-service">સેવાની શરતો</a></li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <span>© 2026 Samaan-Bol. સર્વાધિકાર આરક્ષિત.</span>
      <span class="made-in-india">ભારતમાં ♥ સાથે બનાવેલ 🇮🇳</span>
    </div>
  </div>
</footer>`,
    privacy: `<div class="reading-progress" id="readingProgress"></div>

  <div class="container">
    <a href="/" class="back">← ઘરે પાછા ફરો</a>
    <h1>ગોપનીયતા નીતિ</h1>
    <p class="effective">અસરકારક તારીખ: ફેબ્રુઆરી 23, 2026</p>

    <nav class="toc">
      <h3>સામગ્રી</h3>
      <ol>
        <li><a href="#s1">માહિતી અમે એકત્રિત કરીએ છીએ</a></li>
        <li><a href="#s2">અમે તમારી માહિતીનો ઉપયોગ કેવી રીતે કરીએ છીએ</a></li>
        <li><a href="#s3">તૃતીય-પક્ષ સેવાઓ</a></li>
        <li><a href="#s4">ડેટા સ્ટોરેજ અને સુરક્ષા</a></li>
        <li><a href="#s5">ડેટા રીટેન્શન</a></li>
        <li><a href="#s6">એકાઉન્ટ કાઢી નાખવું</a></li>
        <li><a href="#s7">દુકાનોની અંદર ડેટા શેરિંગ</a></li>
        <li><a href="#s8">બાળકોની ગોપનીયતા</a></li>
        <li><a href="#s9">તમારા અધિકારો</a></li>
        <li><a href="#s10">આ નીતિમાં ફેરફારો</a></li>
        <li><a href="#s11">અમારો સંપર્ક કરો</a></li>
      </ol>
    </nav>

    <p>Samaan-Bol ("અમે", "અમારી", અથવા "એપ") એ ભારતીય રિટેલ વ્યવસાયો માટે રચાયેલ વૉઇસ-ફર્સ્ટ સહયોગી ઇન્વેન્ટરી મેનેજમેન્ટ એપ્લિકેશન છે. આ ગોપનીયતા નીતિ અમે કઈ માહિતી એકત્રિત કરીએ છીએ, અમે તેનો કેવી રીતે ઉપયોગ કરીએ છીએ, અમે તેને કોની સાથે શેર કરીએ છીએ અને તમારા ડેટા સંબંધિત તમારા અધિકારો સમજાવે છે.</p>

    <p>Samaan-Bol નો ઉપયોગ કરીને, તમે આ નીતિમાં વર્ણવ્યા મુજબ માહિતીના સંગ્રહ અને ઉપયોગ માટે સંમત થાઓ છો.</p>

    <details open id="s1">
      <summary><h2>1. માહિતી અમે એકત્રિત કરીએ છીએ</h2></summary>
      <div class="section-content">
        <h3>1.1 એકાઉન્ટ માહિતી</h3>
        <p>જ્યારે તમે એકાઉન્ટ બનાવો છો, ત્યારે અમે એકત્રિત કરીએ છીએ:</p>
        <ul>
          <li><strong>પૂરું નામ</strong> - સાઇન અપ દરમિયાન પ્રદાન કરવામાં આવે છે</li>
          <li><strong>Email સરનામું</strong> — પ્રમાણીકરણ અને એકાઉન્ટ પુનઃપ્રાપ્તિ માટે વપરાય છે</li>
          <li><strong>પાસવર્ડ</strong> અમારા પ્રમાણીકરણ પ્રદાતા દ્વારા એન્ક્રિપ્ટેડ અને સંચાલિત (Clerk)</li>
        </ul>
        <p>જો તમે Google અથવા Apple સાથે સાઇન ઇન કરો છો, તો અમને OAuth પ્રદાતા તરફથી તમારું નામ અને ઈમેલ પ્રાપ્ત થશે. અમે તમારા Google અથવા Apple એકાઉન્ટ પાસવર્ડને ઍક્સેસ કરતા નથી.</p>

        <h3>1.2 વૉઇસ રેકોર્ડિંગ્સ</h3>
        <div class="highlight">
          <p><strong>મહત્વપૂર્ણ:</strong> વૉઇસ રેકોર્ડિંગ રીઅલ-ટાઇમમાં પ્રક્રિયા કરવામાં આવે છે અને છે <strong>કાયમી રૂપે સંગ્રહિત નથી</strong>. ઑડિયો અમારા સર્વર પર પ્રસારિત થાય છે, વાણી ઓળખ અને કુદરતી ભાષાની સમજ માટે Sarvam AI દ્વારા પ્રક્રિયા કરવામાં આવે છે, અને પ્રક્રિયા કર્યા પછી તરત જ કાઢી નાખવામાં આવે છે. તમારા સંદર્ભ માટે ફક્ત પરિણામી ટેક્સ્ટ ટ્રાન્સક્રિપ્ટ તમારા ઓડિટ લોગમાં સંગ્રહિત થાય છે.</p>
        </div>
        <ul>
          <li>તમારા ઉપકરણ પર ઑડિયો રેકોર્ડ કરવામાં આવ્યો છે ( WAV ફોર્મેટ iOS પર, M4A Android પર)</li>
          <li>રેકોર્ડિંગ્સ મહત્તમ 30 સેકન્ડ સુધી મર્યાદિત છે</li>
          <li>ઓડિયો સુરક્ષિત કનેક્શન દ્વારા એન્કોડેડ ડેટા તરીકે અમારા સર્વર પર મોકલવામાં આવે છે</li>
          <li>પ્રક્રિયા કર્યા પછી, ઑડિઓ ડેટા સર્વર મેમરીમાંથી કાઢી નાખવામાં આવે છે</li>
          <li>ટેક્સ્ટ ટ્રાન્સક્રિપ્ટ્સ તમારી દુકાનના ઓડિટ લોગમાં સંગ્રહિત થાય છે જેથી કરીને તમે ભૂતકાળની ક્રિયાઓની સમીક્ષા કરી શકો</li>
        </ul>

        <h3>1.3 ઇન્વેન્ટરી અને બિઝનેસ ડેટા</h3>
        <p>જ્યારે તમે એપ્લિકેશનનો ઉપયોગ કરો છો, ત્યારે અમે તમે બનાવેલ વ્યવસાયિક ડેટાને સંગ્રહિત કરીએ છીએ:</p>
        <ul>
          <li>દુકાનની માહિતી (નામ, શ્રેણી, પસંદગીની ભાષા)</li>
          <li>ઉત્પાદન સૂચિ (નામો, બારકોડ, શ્રેણીઓ, એકમો, કિંમતો)</li>
          <li>સ્ટોકની માત્રા, બેચ નંબર, ખરીદીની તારીખો, સમાપ્તિ તારીખો, સપ્લાયરના નામ</li>
          <li>સૂચિ વસ્તુઓ અને નોંધો ખરીદો</li>
          <li>ઑડિટ લૉગ રેકોર્ડિંગ ઇન્વેન્ટરી ફેરફારો (ક્રિયા પ્રકાર, વપરાશકર્તા, ટાઇમસ્ટેમ્પ, ટ્રાન્સક્રિપ્ટ, આત્મવિશ્વાસ સ્કોર)</li>
        </ul>

        <h3>1.4 વપરાશકર્તા પસંદગીઓ</h3>
        <ul>
          <li>એપ્લિકેશન ભાષા અને અવાજની ભાષાની પસંદગી</li>
          <li>વૉઇસ પ્રતિસાદ પસંદગી (ચાલુ/બંધ)</li>
          <li>ડિસ્પ્લે સેટિંગ્સ (ઉચ્ચ કોન્ટ્રાસ્ટ મોડ, ટેક્સ્ટનું કદ)</li>
          <li>ડિફૉલ્ટ માપન એકમ</li>
          <li>સૂચના પસંદગીઓ</li>
        </ul>

        <h3>1.5 દુકાન સભ્યપદ ડેટા</h3>
        <ul>
          <li>દરેક દુકાનમાં તમારી ભૂમિકા (Owner, Manager અથવા Helper)</li>
          <li>ટીમ સહયોગ માટે જનરેટ કરેલ આમંત્રિત કોડ</li>
          <li>દુકાનોમાં છેલ્લી સક્રિય ટાઇમસ્ટેમ્પ</li>
        </ul>

        <h3>1.6 ઉપકરણ અને ડાયગ્નોસ્ટિક ડેટા</h3>
        <p>પ્રોડક્શન બિલ્ડ્સમાં, અમે ક્રેશ રિપોર્ટિંગ માટેSentry* નો ઉપયોગ કરીએ છીએ. આ એકત્રિત કરે છે:</p>
        <ul>
          <li>ઉપકરણનો પ્રકાર, ઓપરેટિંગ સિસ્ટમ અને એપ્લિકેશન સંસ્કરણ</li>
          <li>ક્રેશ રિપોર્ટ્સ અને એરર સ્ટેક ટ્રેસ</li>
          <li>પ્રદર્શન ડેટા (સત્રોના 20% પર નમૂના)</li>
        </ul>
        <p>ક્રેશ રિપોર્ટિંગ ડેવલપમેન્ટ બિલ્ડ્સમાં અક્ષમ છે અને અમે લાગુ કરીએ છીએ તે સેમ્પલિંગ રેટ દ્વારા ઘટાડી શકાય છે.</p>
      </div>
    </details>

    <details id="s2">
      <summary><h2>2. અમે તમારી માહિતીનો ઉપયોગ કેવી રીતે કરીએ છીએ</h2></summary>
      <div class="section-content">
        <ul>
          <li><strong>સેવા પ્રદાન કરો:</strong> વૉઇસ આદેશો પર પ્રક્રિયા કરો, ઇન્વેન્ટરીનું સંચાલન કરો અને તમારી સમગ્ર ટીમમાં ડેટા સિંક કરો</li>
          <li><strong>પ્રમાણીકરણ:</strong> તમારી ઓળખ ચકાસો અને સુરક્ષિત સત્રોનું સંચાલન કરો</li>
          <li><strong>ઓડિટ ટ્રેલ:</strong> જવાબદારી અને સમીક્ષા માટે ઇન્વેન્ટરી ફેરફારોનો લોગ જાળવો</li>
          <li><strong>સેવામાં સુધારો:</strong> અનામી ભૂલ અહેવાલો દ્વારા ભૂલો અને ક્રેશનું નિદાન કરો</li>
          <li><strong>સંચાર:</strong> આવશ્યક એકાઉન્ટ-સંબંધિત સૂચનાઓ મોકલો (દા.ત., પાસવર્ડ રીસેટ)</li>
        </ul>
        <p>અમે કરીએ છીએ <strong>નથી</strong> તમારા ડેટાનો ઉપયોગ જાહેરાત માટે કરીએ છીએ અને અમે કરીએ છીએ <strong>નથી</strong> તમારી અંગત માહિતી તૃતીય પક્ષોને વેચો.</p>
      </div>
    </details>

    <details id="s3">
      <summary><h2>3. તૃતીય-પક્ષ સેવાઓ</h2></summary>
      <div class="section-content">
        <p>એપ ચલાવવા માટે અમે નીચેની તૃતીય-પક્ષ સેવાઓનો ઉપયોગ કરીએ છીએ:</p>
        <table>
          <thead>
            <tr>
              <th>સેવા</th>
              <th>હેતુ</th>
              <th>ડેટા શેર કર્યો</th>
              <th>ગોપનીયતા નીતિ</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Clerk</strong></td>
              <td>પ્રમાણીકરણ અને સત્ર સંચાલન</td>
              <td>Email, નામ, OAuth ટોકન્સ, સત્ર ડેટા</td>
              <td><a href="https://clerk.com/legal/privacy" target="_blank" rel="noopener">clerk.com/legal/privacy</a></td>
            </tr>
            <tr>
              <td><strong>Sarvam AI</strong></td>
              <td>વૉઇસ પ્રોસેસિંગ (સ્પીચ-ટુ-ટેક્સ્ટ, નેચરલ લેંગ્વેજ પ્રોસેસિંગ, ટેક્સ્ટ-ટુ-સ્પીચ)</td>
              <td>ઑડિયો રેકોર્ડિંગ્સ, ટ્રાન્સક્રિપ્ટ ટેક્સ્ટ, ભાષા કોડ</td>
              <td><a href="https://www.sarvam.ai/privacy-policy" target="_blank" rel="noopener">sarvam.ai/privacy-policy</a></td>
            </tr>
            <tr>
              <td><strong>Neon</strong></td>
              <td>ડેટાબેઝ હોસ્ટિંગ (PostgreSQL)</td>
              <td>તમામ સતત એપ્લિકેશન ડેટા</td>
              <td><a href="https://neon.tech/privacy-policy" target="_blank" rel="noopener">neon.tech/privacy-policy</a></td>
            </tr>
            <tr>
              <td><strong>Sentry</strong></td>
              <td>ભૂલ ટ્રેકિંગ અને ક્રેશ રિપોર્ટિંગ</td>
              <td>ક્રેશ રિપોર્ટ્સ, ઉપકરણ માહિતી (માત્ર ઉત્પાદન)</td>
              <td><a href="https://sentry.io/privacy/" target="_blank" rel="noopener">sentry.io/privacy</a></td>
            </tr>
          </tbody>
        </table>
        <p>દરેક તૃતીય-પક્ષ સેવા તેમની પોતાની ગોપનીયતા નીતિ અનુસાર ડેટા પર પ્રક્રિયા કરે છે. અમે તમને તેમની નીતિઓની સમીક્ષા કરવા પ્રોત્સાહિત કરીએ છીએ.</p>
      </div>
    </details>

    <details id="s4">
      <summary><h2>4. ડેટા સ્ટોરેજ અને સુરક્ષા</h2></summary>
      <div class="section-content">
        <ul>
          <li>એપ્લિકેશન ડેટા Neon PostgreSQL ડેટાબેઝમાં SSL/TLS સંક્રમણમાં એન્ક્રિપ્શન સાથે સંગ્રહિત થાય છે</li>
          <li>ઓથેન્ટિકેશન ટોકન્સ તમારા ઉપકરણ પર સુરક્ષિત સ્ટોરેજનો ઉપયોગ કરીને સંગ્રહિત થાય છે (iOSકીચેન / Android કીસ્ટોર)</li>
          <li>API સંચાર HTTPS એન્ક્રિપ્શનનો ઉપયોગ કરે છે</li>
          <li>દુરુપયોગને રોકવા માટે સંવેદનશીલ અંતિમ બિંદુઓ દર-મર્યાદિત છે</li>
          <li>પાસવર્ડ્સ હેશ અને Clerk દ્વારા મેનેજ કરવામાં આવે છે — અમે ક્યારેય પ્લેનટેક્સ્ટ પાસવર્ડ્સ સ્ટોર કરતા નથી</li>
        </ul>
      </div>
    </details>

    <details id="s5">
      <summary><h2>5. ડેટા રીટેન્શન</h2></summary>
      <div class="section-content">
        <ul>
          <li><strong>વૉઇસ ઑડિઓ:</strong> ક્ષણિક - મેમરીમાં પ્રક્રિયા કરવામાં આવે છે અને તરત જ કાઢી નાખવામાં આવે છે. અમારા સર્વર પર ક્યારેય સંગ્રહિત નથી.</li>
          <li><strong>ટ્રાંસ્ક્રિપ્ટ્સ અને ઑડિટ લૉગ્સ:</strong> તમારા સંદર્ભ માટે જ્યાં સુધી તમારું એકાઉન્ટ સક્રિય છે ત્યાં સુધી જાળવી રાખવામાં આવશે.</li>
          <li><strong>ઇન્વેન્ટરી ડેટા:</strong> જ્યાં સુધી તમારું એકાઉન્ટ સક્રિય છે ત્યાં સુધી જાળવી રાખવામાં આવશે.</li>
          <li><strong>એકાઉન્ટ ડેટા:</strong> તમે તમારું એકાઉન્ટ કાઢી નાખો ત્યાં સુધી જાળવી રાખવામાં આવશે.</li>
          <li><strong>ક્રેશ રિપોર્ટ્સ:</strong> Sentryની ડેટા રીટેન્શન પોલિસી (સામાન્ય રીતે 90 દિવસ) અનુસાર જાળવી રાખવામાં આવે છે.</li>
        </ul>
      </div>
    </details>

    <details id="s6">
      <summary><h2>6. એકાઉન્ટ કાઢી નાખવું</h2></summary>
      <div class="section-content">
        <p>તમે કોઈપણ સમયે તમારું એકાઉન્ટ કાઢી શકો છો <strong>Settings > Delete Account</strong> એપ્લિકેશનની અંદર. જ્યારે તમે તમારું એકાઉન્ટ કાઢી નાખો છો:</p>
        <ul>
          <li>તમારી માલિકીની તમામ દુકાનો કાયમી ધોરણે કાઢી નાખવામાં આવે છે, જેમાં તમામ ઉત્પાદનો, ઇન્વેન્ટરી, બેચ, ખરીદીની સૂચિ અને AI અનુમાનોનો સમાવેશ થાય છે.</li>
          <li>તમારા બધા ઓડિટ લોગ અને પસંદગીઓ કાયમ માટે કાઢી નાખવામાં આવે છે</li>
          <li>અન્ય વપરાશકર્તાઓની દુકાનોમાંની તમારી સદસ્યતા દૂર કરવામાં આવી છે</li>
          <li>Clerk સાથેનું તમારું પ્રમાણીકરણ ખાતું કાયમ માટે કાઢી નાખવામાં આવ્યું છે</li>
        </ul>
        <p><strong>આ ક્રિયા બદલી ન શકાય તેવી છે.</strong> એકવાર કાઢી નાખ્યા પછી, તમારો ડેટા પુનઃપ્રાપ્ત કરી શકાતો નથી.</p>
      </div>
    </details>

    <details id="s7">
      <summary><h2>7. દુકાનોની અંદર ડેટા શેરિંગ</h2></summary>
      <div class="section-content">
        <p>Samaan-Bol એક સહયોગી સાધન છે. જ્યારે તમે દુકાનના સભ્ય હોવ ત્યારે:</p>
        <ul>
          <li>દુકાનના બધા સભ્યો (Owner, Manager, Helper) દુકાનનો ઈન્વેન્ટરી ડેટા, પ્રોડક્ટ કેટલોગ અને ઑડિટ લૉગ જોઈ શકે છે</li>
          <li>તમારું નામ, ભૂમિકા અને પ્રવૃત્તિ ટાઇમસ્ટેમ્પ અન્ય દુકાનના સભ્યોને દૃશ્યક્ષમ છે</li>
          <li>Owner તેમની દુકાન માટે સભ્યપદ અને ઍક્સેસનું સંચાલન કરી શકે છે</li>
        </ul>
        <p>અમે તમારો ડેટા એવી દુકાનો સાથે શેર કરતા નથી કે જેના તમે સભ્ય નથી અથવા કોઈપણ અસંબંધિત તૃતીય પક્ષો સાથે.</p>
      </div>
    </details>

    <details id="s8">
      <summary><h2>8. બાળકોની ગોપનીયતા</h2></summary>
      <div class="section-content">
        <p>Samaan-Bol 13 વર્ષથી ઓછી ઉંમરના બાળકો દ્વારા ઉપયોગ કરવા માટેનો હેતુ નથી. અમે જાણી જોઈને 13 વર્ષથી ઓછી ઉંમરના બાળકો પાસેથી વ્યક્તિગત માહિતી એકત્રિત કરતા નથી. જો તમે માનતા હોવ કે કોઈ બાળકે અમને વ્યક્તિગત માહિતી પ્રદાન કરી છે, તો કૃપા કરીને અમારો સંપર્ક કરો અને અમે તેને તરત જ કાઢી નાખીશું.</p>
      </div>
    </details>

    <details id="s9">
      <summary><h2>9. તમારા અધિકારો</h2></summary>
      <div class="section-content">
        <p>તમને આનો અધિકાર છે:</p>
        <ul>
          <li><strong>તમારો ડેટા ઍક્સેસ કરો:</strong> એપ્લિકેશનમાં તમારી ઇન્વેન્ટરી, ઓડિટ લોગ અને પસંદગીઓ જુઓ</li>
          <li><strong>તમારો ડેટા કાઢી નાખો:</strong> સેટિંગ્સમાં એકાઉન્ટ ડિલીટ કરવાની સુવિધાનો ઉપયોગ કરો</li>
          <li><strong>નિયંત્રણ પસંદગીઓ:</strong> કોઈપણ સમયે તમારી ભાષા, પ્રદર્શન અને વૉઇસ સેટિંગ્સમાં ફેરફાર કરો</li>
          <li><strong>દુકાનોમાંથી ઉપાડો:</strong> તમે જેના સભ્ય છો તે કોઈપણ દુકાન છોડી દો</li>
        </ul>
      </div>
    </details>

    <details id="s10">
      <summary><h2>10. આ નીતિમાં ફેરફારો</h2></summary>
      <div class="section-content">
        <p>અમે સમય સમય પર આ ગોપનીયતા નીતિને અપડેટ કરી શકીએ છીએ. જ્યારે અમે કરીશું, ત્યારે અમે આ પૃષ્ઠની ટોચ પર "અસરકારક તારીખ" અપડેટ કરીશું. અમે તમને સમયાંતરે આ નીતિની સમીક્ષા કરવા પ્રોત્સાહિત કરીએ છીએ. ફેરફારો પછી એપનો સતત ઉપયોગ અપડેટેડ પોલિસીની સ્વીકૃતિ બનાવે છે.</p>
      </div>
    </details>

    <details id="s11">
      <summary><h2>11. અમારો સંપર્ક કરો</h2></summary>
      <div class="section-content">
        <p>જો તમને આ ગોપનીયતા નીતિ અથવા તમારા ડેટા વિશે કોઈ પ્રશ્નો હોય, તો કૃપા કરીને અમારો અહીં સંપર્ક કરો:</p>
        <p><strong>Email:</strong> <a href="mailto:meetslimshady07@gmail.com">meetslimshady07@gmail.com</a></p>
      </div>
    </details>

    <p class="copyright">© 2026 Samaan-Bol. સર્વાધિકાર આરક્ષિત.</p>
  </div>

  <button class="back-to-top" id="backToTop" aria-label="Back to top">↑</button>`,
    terms: `<div class="reading-progress" id="readingProgress"></div>

  <div class="container">
    <a href="/" class="back">← ઘરે પાછા ફરો</a>
    <h1>સેવાની શરતો</h1>
    <p class="effective">અસરકારક તારીખ: ફેબ્રુઆરી 23, 2026</p>

    <nav class="toc">
      <h3>સામગ્રી</h3>
      <ol>
        <li><a href="#s1">સેવાનું વર્ણન</a></li>
        <li><a href="#s2">એકાઉન્ટ રજીસ્ટ્રેશન</a></li>
        <li><a href="#s3">વપરાશકર્તાની ભૂમિકાઓ અને જવાબદારીઓ</a></li>
        <li><a href="#s4">વૉઇસ ઇનપુટ</a></li>
        <li><a href="#s5">સ્વીકાર્ય ઉપયોગ</a></li>
        <li><a href="#s6">તમારો ડેટા</a></li>
        <li><a href="#s7">સેવા ઉપલબ્ધતા</a></li>
        <li><a href="#s8">દર મર્યાદાઓ</a></li>
        <li><a href="#s9">એકાઉન્ટ સમાપ્તિ</a></li>
        <li><a href="#s10">બૌદ્ધિક સંપત્તિ</a></li>
        <li><a href="#s11">વોરંટીનો અસ્વીકરણ</a></li>
        <li><a href="#s12">જવાબદારીની મર્યાદા</a></li>
        <li><a href="#s13">આ શરતોમાં ફેરફાર</a></li>
        <li><a href="#s14">સંચાલિત કાયદો</a></li>
        <li><a href="#s15">અમારો સંપર્ક કરો</a></li>
      </ol>
    </nav>

    <p>Samaan-Bol માં આપનું સ્વાગત છે. આ સેવાની શરતો ("શરતો") તમારા Samaan-Bol મોબાઇલ એપ્લિકેશન અને સંબંધિત સેવાઓ (સામૂહિક રીતે, "સેવા") ના ઉપયોગને નિયંત્રિત કરે છે. એકાઉન્ટ બનાવીને અથવા સેવાનો ઉપયોગ કરીને, તમે આ શરતોથી બંધાયેલા રહેવા માટે સંમત થાઓ છો.</p>

    <details open id="s1">
      <summary><h2>1. સેવાનું વર્ણન</h2></summary>
      <div class="section-content">
        <p>Samaan-Bol એ ભારતીય રિટેલ વ્યવસાયો માટે રચાયેલ વૉઇસ-પ્રથમ સહયોગી ઇન્વેન્ટરી મેનેજમેન્ટ એપ્લિકેશન છે. સેવા તમને આની મંજૂરી આપે છે:</p>
        <ul>
          <li>બહુવિધ ભારતીય ભાષાઓમાં વૉઇસ કમાન્ડનો ઉપયોગ કરીને પ્રોડક્ટ ઇન્વેન્ટરીનું સંચાલન કરો</li>
          <li>સ્ટોક લેવલ, બેચ, એક્સપાયરી ડેટ્સ અને ખરીદીની માહિતીને ટ્રૅક કરો</li>
          <li>ભૂમિકા-આધારિત ઍક્સેસ દ્વારા ટીમના સભ્યો સાથે સહયોગ કરો (Owner, Manager, Helper)</li>
          <li>તમામ ઇન્વેન્ટરી ફેરફારોની ઓડિટ ટ્રેલ્સ જુઓ</li>
          <li>ખરીદી યાદીઓ મેનેજ કરો અને સ્ટોક-લેવલ ચેતવણીઓ પ્રાપ્ત કરો</li>
        </ul>
      </div>
    </details>

    <details id="s2">
      <summary><h2>2. એકાઉન્ટ રજીસ્ટ્રેશન</h2></summary>
      <div class="section-content">
        <p>સેવાનો ઉપયોગ કરવા માટે, તમારે સચોટ અને સંપૂર્ણ માહિતી આપીને એકાઉન્ટ બનાવવું આવશ્યક છે. તમે આ માટે જવાબદાર છો:</p>
        <ul>
          <li>તમારા એકાઉન્ટ ઓળખપત્રોની ગુપ્તતા જાળવવી</li>
          <li>તમારા એકાઉન્ટ હેઠળ થતી તમામ પ્રવૃત્તિ</li>
          <li>તમારા એકાઉન્ટના કોઈપણ અનધિકૃત ઉપયોગ વિશે અમને તરત જ સૂચિત કરવું</li>
        </ul>
        <p>એકાઉન્ટ બનાવવા અને સેવાનો ઉપયોગ કરવા માટે તમારી ઉંમર ઓછામાં ઓછી 13 વર્ષની હોવી જોઈએ.</p>
      </div>
    </details>

    <details id="s3">
      <summary><h2>3. વપરાશકર્તાની ભૂમિકાઓ અને જવાબદારીઓ</h2></summary>
      <div class="section-content">
        <p>Samaan-Bol રોલ-આધારિત એક્સેસ કંટ્રોલ સિસ્ટમનો ઉપયોગ કરે છે:</p>
        <ul>
          <li><strong>Owner:</strong> દુકાનો બનાવે છે અને તેનું સંચાલન કરે છે, ટીમના સભ્યોને આમંત્રિત કરે છે, દુકાનના તમામ ડેટા અને સેટિંગ્સની સંપૂર્ણ ઍક્સેસ ધરાવે છે અને દુકાનને કાઢી શકે છે</li>
          <li><strong>Manager:</strong> ઈન્વેન્ટરી મેનેજ કરી શકે છે, રિપોર્ટ્સ જોઈ શકે છે અને દુકાનમાં મોટા ભાગની કામગીરી કરી શકે છે</li>
          <li><strong>Helper:</strong> નિર્દેશન મુજબ સ્ટોક વસ્તુઓ ઉમેરી અને દૂર કરી શકે છે</li>
        </ul>
        <p>Owner તરીકે, તમે તમારી દુકાનની ઍક્સેસ અને તેની અંદરના ડેટાને મેનેજ કરવા માટે જવાબદાર છો. જ્યારે તમે સભ્યોને આમંત્રિત કરો છો, ત્યારે તેઓ તમારી દુકાનના ઇન્વેન્ટરી ડેટાની ઍક્સેસ મેળવે છે.</p>
      </div>
    </details>

    <details id="s4">
      <summary><h2>4. વૉઇસ ઇનપુટ</h2></summary>
      <div class="section-content">
        <p>સેવા થર્ડ-પાર્ટી AI સેવાઓનો ઉપયોગ કરીને વૉઇસ કમાન્ડની પ્રક્રિયા કરે છે. કૃપા કરીને ધ્યાન રાખો કે:</p>
        <ul>
          <li>વૉઇસ રેકોર્ડિંગ આદેશ દીઠ મહત્તમ 30 સેકન્ડ સુધી મર્યાદિત છે</li>
          <li>આ સેવા અંગ્રેજી, હિન્દી, તમિલ, તેલુગુ, બંગાળી, મરાઠી, કન્નડ, ગુજરાતી, મલયાલમ અને હિંગ્લિશ સહિત બહુવિધ ભાષાઓને સપોર્ટ કરે છે.</li>
          <li>અવાજની ઓળખની ચોકસાઈ ઑડિઓ ગુણવત્તા, પૃષ્ઠભૂમિ અવાજ, ઉચ્ચાર અને ભાષાની સ્પષ્ટતા પર આધારિત છે</li>
          <li>ચોકસાઈની પુષ્ટિ કરવા માટે તમારે વૉઇસ-પ્રોસેસ કરેલ ઇન્વેન્ટરી ફેરફારોની સમીક્ષા કરવી જોઈએ</li>
          <li>વૉઇસ ઑડિઓ રીઅલ-ટાઇમમાં પ્રક્રિયા કરવામાં આવે છે અને કાયમી રૂપે સંગ્રહિત નથી (જુઓ અમારા <a href="/privacy-policy">ગોપનીયતા નીતિ</a> વિગતો માટે)</li>
        </ul>
      </div>
    </details>

    <details id="s5">
      <summary><h2>5. સ્વીકાર્ય ઉપયોગ</h2></summary>
      <div class="section-content">
        <p>તમે સંમત નથી કે:</p>
        <ul>
          <li>કોઈપણ ગેરકાનૂની હેતુ માટે સેવાનો ઉપયોગ કરો</li>
          <li>અન્ય વપરાશકર્તાઓના એકાઉન્ટ્સ અથવા દુકાનોમાં અનધિકૃત ઍક્સેસ મેળવવાનો પ્રયાસ</li>
          <li>સેવા અથવા તેના ઇન્ફ્રાસ્ટ્રક્ચરમાં દખલ અથવા વિક્ષેપ</li>
          <li>એપ્લિકેશનને રિવર્સ-એન્જિનિયર, ડિકમ્પાઇલ અથવા ડિસએસેમ્બલ કરો</li>
          <li>સામાન્ય વપરાશ પેટર્નની બહાર સેવાને ઍક્સેસ કરવા માટે સ્વચાલિત સાધનોનો ઉપયોગ કરો</li>
          <li>સાર્વજનિક રૂપે અથવા તમારી દુકાનમાં જોડાવાનો હેતુ ન હોય તેવા વ્યક્તિઓ સાથે આમંત્રણ કોડ શેર કરો</li>
          <li>દુકાનમાં તમારી ઓળખ અથવા ભૂમિકાને ખોટી રીતે રજૂ કરો</li>
        </ul>
      </div>
    </details>

    <details id="s6">
      <summary><h2>6. તમારો ડેટા</h2></summary>
      <div class="section-content">
        <p>તમે સેવામાં દાખલ કરો છો તે વ્યવસાય ડેટાની માલિકી તમે જાળવી રાખો છો (ઉત્પાદન માહિતી, ઇન્વેન્ટરી રેકોર્ડ્સ, વગેરે). અમે તમારી સામગ્રીની માલિકીનો દાવો કરતા નથી.</p>
        <p>સેવાનો ઉપયોગ કરીને, તમે અમને ફક્ત સેવા પ્રદાન કરવા અને સુધારવાના હેતુથી તમારા ડેટાને સંગ્રહિત કરવા, પ્રક્રિયા કરવા અને ટ્રાન્સમિટ કરવા માટે મર્યાદિત લાઇસન્સ આપો છો.</p>
        <p>અમે તમારા ડેટાને કેવી રીતે એકત્રિત કરીએ છીએ, તેનો ઉપયોગ કરીએ છીએ અને તેનું રક્ષણ કરીએ છીએ તેની વિગતો માટે, કૃપા કરીને અમારી સમીક્ષા કરો <a href="/privacy-policy">ગોપનીયતા નીતિ</a>.</p>
      </div>
    </details>

    <details id="s7">
      <summary><h2>7. સેવા ઉપલબ્ધતા</h2></summary>
      <div class="section-content">
        <p>અમે સેવાને દરેક સમયે ઉપલબ્ધ રાખવાનો પ્રયત્ન કરીએ છીએ, પરંતુ અમે અવિરત ઍક્સેસની બાંયધરી આપતા નથી. આના કારણે સેવા અસ્થાયી રૂપે અનુપલબ્ધ હોઈ શકે છે:</p>
        <ul>
          <li>આયોજિત જાળવણી અથવા અપડેટ્સ</li>
          <li>તકનીકી સમસ્યાઓ અમારા નિયંત્રણની બહાર છે</li>
          <li>તૃતીય-પક્ષ સેવા આઉટેજ (પ્રમાણીકરણ, વૉઇસ પ્રોસેસિંગ, ડેટાબેઝ હોસ્ટિંગ)</li>
        </ul>
        <p>સર્વિસ ડાઉનટાઇમના પરિણામે થતા કોઈપણ નુકસાન માટે અમે જવાબદાર નથી.</p>
      </div>
    </details>

    <details id="s8">
      <summary><h2>8. દર મર્યાદાઓ</h2></summary>
      <div class="section-content">
        <p>વાજબી ઉપયોગ અને સેવાની સ્થિરતા સુનિશ્ચિત કરવા માટે, સેવા API વિનંતીઓ પર દર મર્યાદા લાગુ કરે છે. આ મર્યાદાઓ ઓળંગવાથી તમારી વિનંતીઓ અસ્થાયી થ્રોટલિંગમાં પરિણમી શકે છે.</p>
      </div>
    </details>

    <details id="s9">
      <summary><h2>9. એકાઉન્ટ સમાપ્તિ</h2></summary>
      <div class="section-content">
        <p>દ્વારા તમે કોઈપણ સમયે તમારું એકાઉન્ટ કાઢી શકો છો <strong>Settings > Delete Account</strong> એપ્લિકેશનમાં. એકાઉન્ટ કાઢી નાખવું કાયમી અને બદલી ન શકાય તેવું છે — તમારી બધી દુકાનો, ઇન્વેન્ટરી ડેટા, ઑડિટ લૉગ્સ અને પસંદગીઓ કાયમ માટે દૂર કરવામાં આવશે.</p>
        <p>અમે આ શરતોનું ઉલ્લંઘન કરતા અથવા અપમાનજનક વર્તણૂકમાં જોડાતા એકાઉન્ટ્સને સસ્પેન્ડ અથવા સમાપ્ત કરવાનો અધિકાર અનામત રાખીએ છીએ.</p>
      </div>
    </details>

    <details id="s10">
      <summary><h2>10. બૌદ્ધિક સંપત્તિ</h2></summary>
      <div class="section-content">
        <p>Samaan-Bol એપ્લિકેશન, તેની ડિઝાઇન, કોડ, બ્રાન્ડિંગ અને દસ્તાવેજીકરણ સહિત, અમારી બૌદ્ધિક સંપત્તિ છે. તમે અમારી લેખિત પરવાનગી વિના એપ્લિકેશનના આધારે વ્યુત્પન્ન કાર્યોની નકલ, સંશોધિત, વિતરણ અથવા રચના કરી શકતા નથી.</p>
      </div>
    </details>

    <details id="s11">
      <summary><h2>11. વોરંટીનું અસ્વીકરણ</h2></summary>
      <div class="section-content">
        <p>સેવા કોઈપણ પ્રકારની વોરંટી વિના "જેમ છે તેમ" અને "ઉપલબ્ધ તરીકે" પ્રદાન કરવામાં આવે છે, પછી ભલે તે સ્પષ્ટ હોય કે ગર્ભિત. અમે ખાસ કરીને આની વોરંટીનો અસ્વીકાર કરીએ છીએ:</p>
        <ul>
          <li>કોઈ ચોક્કસ હેતુ માટે વેપારીતા અથવા યોગ્યતા</li>
          <li>વૉઇસ રેકગ્નિશન અથવા AI-જનરેટેડ સૂચનોની સચોટતા</li>
          <li>અવિરત અથવા ભૂલ-મુક્ત કામગીરી</li>
        </ul>
        <p>વૉઇસ-આધારિત ઇન્વેન્ટરી ક્રિયાઓ સહાયક છે — તમારે નિર્ણાયક સ્ટોક નિર્ણયો સ્વતંત્ર રીતે ચકાસવા જોઈએ.</p>
      </div>
    </details>

    <details id="s12">
      <summary><h2>12. જવાબદારીની મર્યાદા</h2></summary>
      <div class="section-content">
        <p>કાયદા દ્વારા મંજૂર મહત્તમ હદ સુધી, અમે સેવાના તમારા ઉપયોગથી ઉદ્ભવતા કોઈપણ પરોક્ષ, આકસ્મિક, વિશેષ, પરિણામલક્ષી અથવા શિક્ષાત્મક નુકસાન માટે જવાબદાર હોઈશું નહીં, જેમાં નીચેનાનો સમાવેશ થાય છે પરંતુ આના સુધી મર્યાદિત નથી:</p>
        <ul>
          <li>વૉઇસ ઓળખની ભૂલોના પરિણામે ઇન્વેન્ટરી વિસંગતતાઓ</li>
          <li>સર્વિસ ડાઉનટાઇમને કારણે વ્યાપારનું નુકસાન</li>
          <li>અમારી સ્ટાન્ડર્ડ બેકઅપ પ્રક્રિયાઓ દ્વારા આવરી લેવામાં આવે છે તેનાથી વધુ ડેટા નુકશાન</li>
        </ul>
      </div>
    </details>

    <details id="s13">
      <summary><h2>13. આ શરતોમાં ફેરફાર</h2></summary>
      <div class="section-content">
        <p>અમે સમયાંતરે આ શરતોને અપડેટ કરી શકીએ છીએ. જ્યારે અમે કરીશું, ત્યારે અમે આ પૃષ્ઠની ટોચ પર "અસરકારક તારીખ" અપડેટ કરીશું. ફેરફારો પછી સેવાનો સતત ઉપયોગ એ અપડેટ કરેલી શરતોની સ્વીકૃતિ છે.</p>
      </div>
    </details>

    <details id="s14">
      <summary><h2>14. સંચાલિત કાયદો</h2></summary>
      <div class="section-content">
        <p>આ શરતો ભારતના કાયદાઓ દ્વારા સંચાલિત અને અર્થઘટન કરવામાં આવશે. આ શરતો અથવા સેવાથી ઉદ્ભવતા કોઈપણ વિવાદો ભારતની અદાલતોના વિશિષ્ટ અધિકારક્ષેત્રને આધિન રહેશે.</p>
      </div>
    </details>

    <details id="s15">
      <summary><h2>15. અમારો સંપર્ક કરો</h2></summary>
      <div class="section-content">
        <p>જો તમને આ શરતો વિશે કોઈ પ્રશ્નો હોય, તો કૃપા કરીને અમારો અહીં સંપર્ક કરો:</p>
        <p><strong>Email:</strong> <a href="mailto:meetslimshady07@gmail.com">meetslimshady07@gmail.com</a></p>
      </div>
    </details>

    <p class="copyright">© 2026 Samaan-Bol. સર્વાધિકાર આરક્ષિત.</p>
  </div>

  <button class="back-to-top" id="backToTop" aria-label="Back to top">↑</button>`,
  },
  "ml": {
    home: `<!-- Three.js background canvas -->
<canvas id="bgCanvas"></canvas>

<!-- Aurora ambient background (WebGL fallback) -->
<div class="aurora-bg"><div class="aurora-orb"></div></div>

<!-- Scroll progress indicator -->
<div class="scroll-progress" id="scrollProgress"></div>

<!-- ═══ NAVIGATION ═══ -->
<nav id="nav">
  <div class="container">
    <div class="nav-inner">
      <a href="#" class="logo">
        <div class="logo-mark"><svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><defs><mask id="stencil-nav"><rect x="0" y="0" width="100" height="100" fill="white"/><rect x="24" y="18" width="52" height="8" rx="4" fill="black"/><rect x="38" y="18" width="24" height="36" rx="12" fill="black"/><path d="M 28 42 A 22 22 0 0 0 72 42" fill="none" stroke="black" stroke-width="8" stroke-linecap="round"/><rect x="46" y="72" width="8" height="10" rx="4" fill="black"/><rect x="36" y="32" width="28" height="4" fill="white"/><rect x="36" y="44" width="28" height="4" fill="white"/></mask></defs><circle cx="50" cy="50" r="50" fill="#ea580c" mask="url(#stencil-nav)"/></svg></div>
        <div class="logo-text">സമൻ<span>ബോൾ</span></div>
      </a>
      <ul class="nav-links">
        <li><a href="#how">ഇത് എങ്ങനെ പ്രവർത്തിക്കുന്നു</a></li>
        <li><a href="#features">ഫീച്ചറുകൾ</a></li>
        <li><a href="#ai">AI ഇൻ്റലിജൻസ്</a></li>
        <li><a href="#languages">ഭാഷകൾ</a></li>
        <li><a href="https://apps.apple.com/in/app/samaan-bol/id6759739444" class="nav-cta">ആപ്പ് ഡൗൺലോഡ് ചെയ്യുക</a></li>
      </ul>
      <button class="mobile-menu-btn" aria-label="Menu">☰</button>
    </div>
  </div>
</nav>

<!-- ═══ HERO ═══ -->
<section class="hero">
  <div class="container">
    <div class="hero-grid">
      <div>
        <div class="hero-eyebrow">ഇന്ത്യൻ റീട്ടെയിലിനുള്ള വോയ്‌സ് ഫസ്റ്റ് ഇൻവെൻ്ററി</div>
        <h1 class="hero-text-reveal">
          <span class="hindi-line hindi">बोल के सँभालो अपना बिज़नेस</span>
          <span class="hero-text-main">നിങ്ങളുടെ ഷോപ്പ് കൈകാര്യം ചെയ്യുക<br>നിങ്ങളുടെ ശബ്ദം കൊണ്ട് മാത്രം</span>
        </h1>
        <p class="hero-sub">
          സംസാരിക്കുക <span class="hero-rotate"><span class="hero-rotate-word active">ഹിന്ദി</span><span class="hero-rotate-word">ബംഗാളി</span><span class="hero-rotate-word">തമിഴ്</span><span class="hero-rotate-word">തെലുങ്ക്</span><span class="hero-rotate-word">മറാത്തി</span><span class="hero-rotate-word">ഇംഗ്ലീഷ്</span></span>, അല്ലെങ്കിൽ 10 ഇന്ത്യൻ ഭാഷകളിൽ ഏതെങ്കിലും.Samaan-Bol-ൻ്റെ AI നിങ്ങളുടെ കമാൻഡ് മനസ്സിലാക്കുന്നു, നിങ്ങളുടെ ഇൻവെൻ്ററി അപ്ഡേറ്റ് ചെയ്യുന്നു,
          നിങ്ങളുടെ ബിസിനസ്സ് പ്രവർത്തിപ്പിക്കുന്നത് നിലനിർത്തുകയും ചെയ്യുന്നു - ഹാൻഡ്‌സ് ഫ്രീ.
        </p>
        <div class="hero-actions">
          <a href="#download" class="btn-primary">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            സൗജന്യമായി ഡൗൺലോഡ് ചെയ്യുക
          </a>
          <a href="#how" class="btn-secondary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            അത് പ്രവർത്തനത്തിൽ കാണുക
          </a>
        </div>
        <div class="hero-stats">
          <div class="hero-stat">
            <div class="hero-stat-number">11</div>
            <div class="hero-stat-label">ഭാഷകൾ പിന്തുണയ്ക്കുന്നു</div>
          </div>
          <div class="hero-stat">
            <div class="hero-stat-number">50K+</div>
            <div class="hero-stat-label">ദിവസവും ട്രാക്ക് ചെയ്യുന്ന ഇനങ്ങൾ</div>
          </div>
          <div class="hero-stat">
            <div class="hero-stat-number">2മിനിറ്റ്</div>
            <div class="hero-stat-label">സജ്ജീകരണ സമയം</div>
          </div>
        </div>
      </div>

      <div class="hero-visual">
        <!-- Floating cards (z-index 10 — in FRONT of phone) -->
        <div class="float-card float-card--voice">
          <div class="float-card-icon float-card-icon--voice"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg></div>
          <p><strong class="hindi">"चावल 5 किलो जोड़ दो"</strong></p>
          <p style="margin-top:6px; font-size:12px; color:var(--success);">✓ Basmati Rice — 18 → 23 കിലോ</p>
        </div>

        <div class="float-card float-card--alert">
          <div class="float-card-icon float-card-icon--alert"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg></div>
          <p><strong>കുറഞ്ഞ സ്റ്റോക്ക് അലേർട്ട്</strong></p>
          <p style="margin-top:4px; font-size:12px;">3 ദിവസത്തിനുള്ളിൽ ആട്ട തീർന്നേക്കാം</p>
        </div>

        <!-- Phone mockup — mirrors actual app UI -->
        <div class="phone-frame">
          <div class="phone-notch"></div>
          <div class="phone-screen">
            <div class="phone-status-bar">
              <span>9:41</span>
              <span style="display:flex; gap:4px; align-items:center;">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z"/></svg>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><rect x="17" y="4" width="4" height="16" rx="1"/><rect x="11" y="8" width="4" height="12" rx="1"/><rect x="5" y="12" width="4" height="8" rx="1"/></svg>
                <svg width="14" height="12" viewBox="0 0 28 14" fill="currentColor"><rect x="0" y="1" width="22" height="12" rx="2" stroke="currentColor" fill="none" stroke-width="1.5"/><rect x="24" y="4.5" width="3" height="5" rx="1"/><rect x="2" y="3" width="14" height="8" rx="1"/></svg>
              </span>
            </div>

            <!-- Header: greeting + bell -->
            <div class="phone-header">
              <div>
                <div class="phone-greeting">സുപ്രഭാതം! 👋</div>
                <div class="phone-subtext">Priya General Store</div>
              </div>
              <div class="phone-bell">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B6B70" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                <div class="phone-bell-badge">3</div>
              </div>
            </div>

            <!-- Search bar with mic icon -->
            <div class="phone-search">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4A4A50" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <span class="phone-search-text">ഉൽപ്പന്നങ്ങൾ തിരയുക...</span>
              <div class="phone-search-mic">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0D0D12" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/></svg>
              </div>
            </div>

            <!-- 2x2 Stats grid -->
            <div class="phone-stats-grid">
              <div class="phone-stat-card phone-stat-card--total">
                <div class="phone-stat-number">142</div>
                <div class="phone-stat-label">മൊത്തം ഇനങ്ങൾ</div>
              </div>
              <div class="phone-stat-card phone-stat-card--low">
                <div class="phone-stat-number" style="color:var(--warning);">8</div>
                <div class="phone-stat-label">കുറഞ്ഞ സ്റ്റോക്ക്</div>
              </div>
              <div class="phone-stat-card phone-stat-card--out">
                <div class="phone-stat-number" style="color:var(--danger);">2</div>
                <div class="phone-stat-label">സ്റ്റോക്കില്ല</div>
              </div>
              <div class="phone-stat-card phone-stat-card--activity">
                <div class="phone-stat-number" style="color:var(--success);">23</div>
                <div class="phone-stat-label">ഇന്ന് അപ്ഡേറ്റ് ചെയ്തു</div>
              </div>
            </div>

            <!-- Filter chips -->
            <div class="phone-filter-row">
              <span class="phone-chip phone-chip--active">എല്ലാം</span>
              <span class="phone-chip">കുറഞ്ഞ സ്റ്റോക്ക്</span>
              <span class="phone-chip">പുറത്ത്</span>
              <span class="phone-chip">കാലഹരണപ്പെടുന്നു</span>
            </div>

            <!-- Product cards -->
            <div class="phone-product">
              <div class="phone-product-icon" style="background:rgba(255,181,71,0.12);">🍚</div>
              <div class="phone-product-info">
                <div class="phone-product-name">Basmati Rice</div>
                <div class="phone-product-meta">ധാന്യങ്ങൾ · 2m മുമ്പ് അപ്ഡേറ്റ് ചെയ്തു</div>
              </div>
              <div class="phone-product-qty">
                <div class="phone-product-qty-num">23</div>
                <div class="phone-product-qty-unit">കി. ഗ്രാം</div>
              </div>
            </div>

            <div class="phone-product">
              <div class="phone-product-icon" style="background:rgba(255,107,0,0.12);">🫒</div>
              <div class="phone-product-info">
                <div class="phone-product-name">Aashirvaad Atta</div>
                <div class="phone-product-meta">മാവ് · 1 മണിക്കൂർ മുമ്പ് അപ്‌ഡേറ്റ് ചെയ്‌തു</div>
                <div class="phone-product-status phone-product-status--low">കുറഞ്ഞ സ്റ്റോക്ക്</div>
              </div>
              <div class="phone-product-qty">
                <div class="phone-product-qty-num" style="color:var(--warning);">3</div>
                <div class="phone-product-qty-unit">കി. ഗ്രാം</div>
              </div>
            </div>

            <div class="phone-product">
              <div class="phone-product-icon" style="background:rgba(50,213,131,0.1);">🥛</div>
              <div class="phone-product-info">
                <div class="phone-product-name">Amul Toned Milk</div>
                <div class="phone-product-meta">ഡയറി · 3 മണിക്കൂർ മുമ്പ് അപ്‌ഡേറ്റ് ചെയ്‌തു</div>
              </div>
              <div class="phone-product-qty">
                <div class="phone-product-qty-num">40</div>
                <div class="phone-product-qty-unit">pkt</div>
              </div>
            </div>

          </div>
          <!-- Floating mic FAB (like the real app) -->
          <div class="phone-fab">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0D0D12" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/></svg>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ═══ HOW IT WORKS ═══ -->
<section class="how-it-works" id="how">
  <div class="container">
    <div class="reveal">
      <div class="section-label">ഇത് എങ്ങനെ പ്രവർത്തിക്കുന്നു</div>
      <h2 class="section-heading">മൂന്ന് ഘട്ടങ്ങൾ. പരിശീലനം ആവശ്യമില്ല.</h2>
      <p class="section-sub">നിങ്ങളുടെ ഭാഷയിൽ സ്വാഭാവികമായി സംസാരിക്കുക - ബാക്കിയുള്ളവ AI കൈകാര്യം ചെയ്യുന്നു.</p>
    </div>
    <div class="steps-grid">
      <div class="step reveal reveal-delay-1">
        <div class="step-number">01</div>
        <h3>നിങ്ങളുടെ കമാൻഡ് പറയുക</h3>
        <p>മൈക്ക് ടാപ്പുചെയ്ത് നിങ്ങൾക്ക് ആവശ്യമുള്ളത് പറയുക - സ്റ്റോക്ക് ചേർക്കുക, അളവ് പരിശോധിക്കുക, വാങ്ങൽ ലിസ്റ്റ് സൃഷ്ടിക്കുക. ഏത് ഇന്ത്യൻ ഭാഷയിലും.</p>
        <div class="step-example">
          <div class="hindi">"चावल 5 किलो जोड़ दो"</div>
          <div class="english">5 കിലോ അരി ചേർക്കുക</div>
        </div>
      </div>
      <div class="step reveal reveal-delay-2">
        <div class="step-number">02</div>
        <h3>AI തൽക്ഷണം മനസ്സിലാക്കുന്നു</h3>
        <p>Sarvam AIനിങ്ങളുടെ സംസാരം പ്രോസസ്സ് ചെയ്യുന്നു, ഉൽപ്പന്നം, അളവ്, പ്രവർത്തനം എന്നിവ എക്‌സ്‌ട്രാക്‌റ്റ് ചെയ്യുന്നു - തുടർന്ന് അത് നിങ്ങളുടെ ഇൻവെൻ്ററിയുമായി പൊരുത്തപ്പെടുത്തുന്നു.</p>
        <div class="step-example">
          <div style="display:flex; gap:12px; flex-wrap:wrap;">
            <span style="background:var(--saffron-tint); color:var(--saffron); padding:4px 10px; border-radius:4px; font-size:12px;">അരി → ബസ്മതി 🍚</span>
            <span style="background:rgba(50,213,131,0.1); color:var(--success); padding:4px 10px; border-radius:4px; font-size:12px;">+5 കി.ഗ്രാം</span>
            <span style="background:rgba(99,102,241,0.1); color:#818CF8; padding:4px 10px; border-radius:4px; font-size:12px;">✓ ചേർക്കുക</span>
          </div>
        </div>
      </div>
      <div class="step reveal reveal-delay-3">
        <div class="step-number">03</div>
        <h3>ഇൻവെൻ്ററി അപ്ഡേറ്റ് ചെയ്തു, സ്ഥിരീകരിച്ചു</h3>
        <p>നിങ്ങളുടെ സ്റ്റോക്ക് തൽക്ഷണം അപ്ഡേറ്റ് ചെയ്യപ്പെടുന്നു. നിങ്ങളുടെ ഭാഷയിൽ ഒരു ശബ്‌ദ സ്ഥിരീകരണം നിങ്ങൾ കേൾക്കുന്നു - സ്‌ക്രീൻ ആവശ്യമില്ല.</p>
        <div class="step-example">
          <div class="hindi">"हो गया — बासमती चावल अब 23 किलो है"</div>
          <div class="english">പൂർത്തിയായി - ബസ്മതി അരി ഇപ്പോൾ 23 കിലോയാണ്</div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ═══ FEATURES ═══ -->
<section class="features" id="features" style="position:relative; overflow:hidden;">
  <div class="orb orb--saffron" style="top: -100px; right: -150px;"></div>
  <div class="container">
    <div class="reveal">
      <div class="section-label">ഫീച്ചറുകൾ</div>
      <h2 class="section-heading">നിങ്ങളുടെ ഷോപ്പിന് ആവശ്യമുള്ളതെല്ലാം. ചെയ്യാത്ത ഒന്നുമില്ല.</h2>
    </div>
    <div class="features-grid">
      <div class="feature feature--hero reveal reveal-delay-1">
        <div class="feature-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg></div>
        <h3>വോയ്സ്-ഫസ്റ്റ് ഇൻവെൻ്ററി</h3>
        <p>സ്വാഭാവികമായി സംസാരിച്ച് സ്റ്റോക്ക് ചേർക്കുക, നീക്കം ചെയ്യുക അല്ലെങ്കിൽ പരിശോധിക്കുക. ടൈപ്പിംഗില്ല, മെനുകളിലൂടെ തിരയുന്നില്ല. നിങ്ങളുടെ ഭാഷയിൽ സംസാരിക്കുക, ബാക്കിയുള്ളവ AI കൈകാര്യം ചെയ്യുന്നു - നിങ്ങളുടെ കമാൻഡ് മനസ്സിലാക്കുന്നത് മുതൽ നിങ്ങളുടെ സ്റ്റോക്ക് തത്സമയം അപ്‌ഡേറ്റ് ചെയ്യുന്നത് വരെ.</p>
      </div>
      <div class="feature reveal reveal-delay-2">
        <div class="feature-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg></div>
        <h3>10 ഇന്ത്യൻ ഭാഷകൾ + ഇംഗ്ലീഷ്</h3>
        <p>ഹിന്ദി, ബംഗാളി, തമിഴ്, തെലുങ്ക്, മറാത്തി, കന്നഡ, ഗുജറാത്തി, മലയാളം, പഞ്ചാബി, ഒഡിയ -Sarvam AIപവർ ചെയ്യുന്നത്.</p>
      </div>
      <div class="feature reveal reveal-delay-3">
        <div class="feature-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></div>
        <h3>ടീം റോളുകൾ</h3>
        <p>Owner,Manager, കൂടാതെ Helper റോളുകൾ ഗ്രാനുലാർ അനുമതികളോടെ. ഒരേ പേജിലുള്ള എല്ലാവരും സുരക്ഷിതമായി.</p>
      </div>
      <div class="feature reveal reveal-delay-1">
        <div class="feature-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/><path d="M9 14l2 2 4-4"/></svg></div>
        <h3>സ്മാർട്ട് വാങ്ങൽ ലിസ്റ്റുകൾ</h3>
        <p>കുറഞ്ഞുകൊണ്ടിരിക്കുന്നതിനെ അടിസ്ഥാനമാക്കി യാന്ത്രികമായി ജനറേറ്റുചെയ്‌ത റീസ്റ്റോക്കിംഗ് ലിസ്റ്റുകൾ. WhatsApp വഴി വിതരണക്കാരുമായി പങ്കിടുക.</p>
      </div>
      <div class="feature reveal reveal-delay-2">
        <div class="feature-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></svg></div>
        <h3>പ്രവർത്തന ഓഡിറ്റ് ലോഗ്</h3>
        <p>എല്ലാ മാറ്റങ്ങളും ആരാണ്, എന്ത്, എപ്പോൾ എന്നിവ ഉപയോഗിച്ച് ട്രാക്ക് ചെയ്യുന്നു. നിങ്ങളുടെ ടീമിലുടനീളം സമ്പൂർണ്ണ സുതാര്യത.</p>
      </div>
      <div class="feature reveal reveal-delay-3">
        <div class="feature-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><line x1="7" y1="12" x2="17" y2="12"/><line x1="7" y1="8" x2="17" y2="8"/><line x1="7" y1="16" x2="17" y2="16"/></svg></div>
        <h3>ബാർകോഡ് സ്കാനിംഗ്</h3>
        <p>തൽക്ഷണം ചേർക്കുന്നതിനോ നോക്കുന്നതിനോ ഉൽപ്പന്നങ്ങൾ സ്കാൻ ചെയ്യുക. ഇന്ത്യൻ, അന്തർദേശീയ ബാർകോഡുകൾക്കൊപ്പം പ്രവർത്തിക്കുന്നു.</p>
      </div>
    </div>
  </div>
</section>

<!-- ═══ AI INTELLIGENCE ═══ -->
<section class="ai-section" id="ai" style="overflow:hidden;">
  <div class="orb orb--indigo" style="bottom: -100px; left: -100px;"></div>
  <div class="orb orb--green" style="top: 200px; right: -80px;"></div>
  <div class="container">
    <div class="ai-header reveal">
      <div class="section-label">AI ഇൻ്റലിജൻസ്</div>
      <h2 class="section-heading">
        <span class="hindi" style="display:block; color:var(--saffron); font-size:clamp(22px,2.8vw,32px); font-weight:500; margin-bottom:8px;">സമൂഹദാർ AI ജോ ആപകെ ബിജാനെസ്</span>
        ട്രാക്കിംഗ് മാത്രമല്ല - നിങ്ങളുടെ ഷോപ്പിൻ്റെ ആദ്യത്തെ ഡിജിറ്റൽ ബ്രെയിൻ
      </h2>
      <p class="section-sub">Samaan-Bolനിങ്ങൾ പറയുന്നത് മാത്രം രേഖപ്പെടുത്തുന്നില്ല. ഇത് നിങ്ങളുടെ പാറ്റേണുകൾ പഠിക്കുകയും നിങ്ങളുടെ ആവശ്യങ്ങൾ പ്രവചിക്കുകയും പ്രശ്നങ്ങൾ ഉണ്ടാകുന്നതിന് മുമ്പ് നിങ്ങളെ അറിയിക്കുകയും ചെയ്യുന്നു.</p>
    </div>

    <div class="ai-blocks">
      <!-- Predictive Stock -->
      <div class="ai-block reveal">
        <div class="ai-block-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg></div>
        <div class="ai-block-tag ai-block-tag--predict">പ്രവചന സ്റ്റോക്ക്</div>
        <h3>നിങ്ങൾ ചെയ്യുന്നതിന് മുമ്പ് നിങ്ങൾക്ക് എന്താണ് വേണ്ടതെന്ന് അറിയാം</h3>
        <p>AI നിങ്ങളുടെ വിൽപ്പന പാറ്റേണുകൾ പഠിക്കുന്നു - ദിവസേന, പ്രതിവാര, സീസണൽ. ഇനങ്ങൾ എപ്പോൾ കുറയുമെന്ന് ഇത് പ്രവചിക്കുകയും ദിവസങ്ങൾക്ക് മുമ്പ് റീസ്റ്റോക്ക് ചെയ്യാൻ നിർദ്ദേശിക്കുകയും ചെയ്യുന്നു.</p>
        <div class="ai-voice-example">
          <div class="voice-bubble">
            <div class="voice-bubble-avatar voice-bubble-avatar--ai"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg></div>
            <div class="voice-bubble-content">
              <div class="hindi">"ആപ്ക അട്ട 3 ദിൻ മേ ഖതം ഹോ സക്താ ഹൈ - ഹഫ്തേ കി ബിക്രി കെ ഹിസാബ് സേ"</div>
              <div class="translation">നിങ്ങളുടെ ആട്ട 3 ദിവസത്തിനുള്ളിൽ തീർന്നേക്കാം - പ്രതിവാര വിൽപ്പനയെ അടിസ്ഥാനമാക്കി</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Smart Alerts -->
      <div class="ai-block reveal">
        <div class="ai-block-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg></div>
        <div class="ai-block-tag ai-block-tag--alert">സ്മാർട്ട് അലേർട്ടുകൾ</div>
        <h3>നിങ്ങളുടെ ഭാഷ സംസാരിക്കുന്ന അലേർട്ടുകൾ</h3>
        <p>കാലഹരണപ്പെടൽ മുന്നറിയിപ്പുകൾ, സ്ലോ മൂവിംഗ് സ്റ്റോക്ക് കണ്ടെത്തൽ, വിലയിലെ ഏറ്റക്കുറച്ചിലുകൾ സംബന്ധിച്ച അലേർട്ടുകൾ - നിങ്ങൾ തിരഞ്ഞെടുത്ത ഭാഷയിൽ വോയ്‌സ് അറിയിപ്പുകളായി ഡെലിവർ ചെയ്യുന്നു.</p>
        <div class="ai-voice-example">
          <div class="voice-bubble">
            <div class="voice-bubble-avatar voice-bubble-avatar--ai"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg></div>
            <div class="voice-bubble-content">
              <div class="hindi">"Parle-G കെ 12 പാക്കറ്റ് 5 ദിൻ മേൻ കാലഹരണപ്പെടും ഹോ രഹേ ഹൈൻ - ഡിസ്കൗണ്ട് ലഗാനാ ചാഹെയ്ൻ?"</div>
              <div class="translation">12Parle-Gപാക്കറ്റുകൾ 5 ദിവസത്തിനുള്ളിൽ കാലഹരണപ്പെടുന്നു - ഒരു കിഴിവ് ചേർക്കണോ?</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Voice Analytics -->
      <div class="ai-block reveal">
        <div class="ai-block-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg></div>
        <div class="ai-block-tag ai-block-tag--insight">വോയ്സ് അനലിറ്റിക്സ്</div>
        <h3>നിങ്ങളുടെ കടയോട് ഒരു ചോദ്യം ചോദിക്കുക - അത് ഉത്തരം നൽകുന്നു</h3>
        <p>നിങ്ങളുടെ ബിസിനസ്സിനെക്കുറിച്ച് സ്വാഭാവികമായ ഭാഷയിൽ എന്തും ചോദിക്കുക. സംഭാഷണ ഉത്തരങ്ങളും ഓൺ-സ്‌ക്രീൻ ഡാറ്റയും ഉപയോഗിച്ച് AI പ്രതികരിക്കുന്നു.</p>
        <div class="ai-voice-example">
          <div class="voice-bubble">
            <div class="voice-bubble-avatar voice-bubble-avatar--user"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>
            <div class="voice-bubble-content">
              <div class="hindi">"പിച്ചലെ ഹഫ്തേ സബ്സെ സ്യദാ ക്യാ ബിക്കാ?"</div>
              <div class="translation">കഴിഞ്ഞ ആഴ്ച ഏറ്റവും കൂടുതൽ വിറ്റത് എന്താണ്?</div>
            </div>
          </div>
          <div class="voice-bubble">
            <div class="voice-bubble-avatar voice-bubble-avatar--ai"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg></div>
            <div class="voice-bubble-content">
              <div class="hindi">"പിച്ലെ ഹഫ്തേ സബ്സെ സിയദാ ചാവൽ ബിക - 48 കിലോ"</div>
              <div class="translation">കഴിഞ്ഞയാഴ്ച ഏറ്റവും കൂടുതൽ വിറ്റത് അരി - 48 കിലോ</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Team Intelligence -->
      <div class="ai-block reveal">
        <div class="ai-block-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>
        <div class="ai-block-tag ai-block-tag--team">ടീം ഇൻ്റലിജൻസ്</div>
        <h3>നിങ്ങളുടെ ടീം എന്താണ് ചെയ്യുന്നതെന്ന് അറിയുക</h3>
        <p>AI- പവർഡ് അനോമലി ഡിറ്റക്ഷൻ അസാധാരണമായ ഇൻവെൻ്ററി മാറ്റങ്ങൾ ഫ്ലാഗ് ചെയ്യുന്നു. ആരാണ് എന്താണ് അപ്ഡേറ്റ് ചെയ്തതെന്നും തിരുത്തലുകൾ ആവശ്യമുണ്ടോ എന്നും സ്മാർട്ട് സംഗ്രഹങ്ങൾ കാണിക്കുന്നു.</p>
        <div class="ai-voice-example">
          <div class="voice-bubble">
            <div class="voice-bubble-avatar voice-bubble-avatar--ai"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg></div>
            <div class="voice-bubble-content">
              <div class="hindi">"ആജ് ഷാം 6 ബജെ 15 കിലോ ചീനി കാ സ്‌റ്റോക്ക് കാം ഹുവാ — വെരിഫൈ കരീൻ?"</div>
              <div class="translation">ഇന്ന് വൈകുന്നേരം 6 മണിക്ക് 15 കിലോ പഞ്ചസാര സ്റ്റോക്ക് കുറഞ്ഞു - പരിശോധിക്കണോ?</div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</section>

<!-- ═══ LANGUAGES ═══ -->
<section class="languages-section" id="languages">
  <div class="container">
    <div class="reveal">
      <div class="section-label">ഭാരതത്തിനു വേണ്ടി നിർമ്മിച്ചത്</div>
      <h2 class="section-heading">നിങ്ങളുടെ ഭാഷ. നിങ്ങളുടെ ബിസിനസ്സ്. നിങ്ങളുടെ വഴി.</h2>
      <p class="section-sub">Samaan-Bolനിങ്ങൾ സംസാരിക്കുന്ന രീതിയിൽ സംസാരിക്കുന്നു - നേറ്റീവ് സ്ക്രിപ്റ്റുകൾ, സംഭാഷണ പദങ്ങൾ, പ്രാദേശിക ഉൽപ്പന്ന നാമങ്ങൾ എന്നിവയ്ക്കുള്ള പൂർണ്ണ പിന്തുണയോടെ.</p>
    </div>
    <div class="lang-grid reveal">
      <div class="lang-chip lang-chip--featured">ഹിന്ദി <span class="native hindi">हिन्दी</span></div>
      <div class="lang-chip">ബംഗാളി <span class="native">বাংলা</span></div>
      <div class="lang-chip">തമിഴ് <span class="native">தமிழ்</span></div>
      <div class="lang-chip">തെലുങ്ക് <span class="native">తెలుగు</span></div>
      <div class="lang-chip">മറാത്തി <span class="native">मराठी</span></div>
      <div class="lang-chip">കന്നഡ <span class="native">ಕನ್ನಡ</span></div>
      <div class="lang-chip">ഗുജറാത്തി <span class="native">ગુજરાતી</span></div>
      <div class="lang-chip">മലയാളം <span class="native">മലയാളം</span></div>
      <div class="lang-chip">പഞ്ചാബി <span class="native">ਪੰਜਾਬੀ</span></div>
      <div class="lang-chip">ഒഡിയ <span class="native">ଓଡ଼ିଆ</span></div>
      <div class="lang-chip">ഇംഗ്ലീഷ് <span class="native">ഇംഗ്ലീഷ്</span></div>
    </div>
  </div>
</section>

<!-- ═══ COMPARISON ═══ -->
<section class="comparison">
  <div class="container">
    <div class="reveal">
      <div class="section-label">എന്തുകൊണ്ട്Samaan-Bol</div>
      <h2 class="section-heading">രാവും പകലും വ്യത്യാസം</h2>
    </div>
    <div class="comparison-grid reveal">
      <div class="comparison-col comparison-col--without">
        <h3>Samaan-Bolഇല്ലാതെ</h3>
        <p class="comparison-col-subtitle">സ്റ്റോക്ക് കൈകാര്യം ചെയ്യുന്നതിനുള്ള പഴയ രീതി</p>
        <ul class="comparison-list">
          <li><span class="icon">✕</span> മാനുവൽ എണ്ണൽ, പേന-പേപ്പർ രജിസ്റ്ററുകൾ</li>
          <li><span class="icon">✕</span> ഒരു ഉപഭോക്താവ് ചോദിക്കുമ്പോൾ സ്റ്റോക്ക്ഔട്ടുകൾ കണ്ടെത്തി</li>
          <li><span class="icon">✕</span> എത്ര തുക പുനഃക്രമീകരിക്കണമെന്ന് ഊഹിക്കുന്നു</li>
          <li><span class="icon">✕</span> എന്താണ് കാലഹരണപ്പെടുന്നതെന്നോ മന്ദഗതിയിലായതെന്നോ ഒന്നും അറിയില്ല</li>
          <li><span class="icon">✕</span> ജീവനക്കാർ എന്താണ് ചെയ്യുന്നതെന്ന് ട്രാക്ക് ചെയ്യാൻ കഴിയുന്നില്ല</li>
          <li><span class="icon">✕</span> ഉത്സവ തയ്യാറെടുപ്പുകൾ അവസാന നിമിഷം അരാജകത്വമാണ്</li>
        </ul>
      </div>
      <div class="comparison-col comparison-col--with">
        <h3>കൂടെSamaan-Bol</h3>
        <p class="comparison-col-subtitle">AI- പവർ, വോയ്സ് ഫസ്റ്റ്, ആയാസരഹിതം</p>
        <ul class="comparison-list">
          <li><span class="icon">✓</span> വോയ്‌സ് അപ്‌ഡേറ്റുകൾ - പറയൂ, അത് കഴിഞ്ഞു</li>
          <li><span class="icon">✓</span> സ്റ്റോക്ക്ഔട്ടിനു ദിവസങ്ങൾക്ക് മുമ്പുള്ള പ്രവചന മുന്നറിയിപ്പുകൾ</li>
          <li><span class="icon">✓</span> യഥാർത്ഥ ഡാറ്റയെ അടിസ്ഥാനമാക്കി AI സൃഷ്ടിച്ച വാങ്ങൽ ലിസ്റ്റുകൾ</li>
          <li><span class="icon">✓</span> കാലഹരണപ്പെടലും സ്ലോ മൂവർ കണ്ടെത്തലും അന്തർനിർമ്മിതമാണ്</li>
          <li><span class="icon">✓</span> അപാകത കണ്ടെത്തലിനൊപ്പം പൂർണ്ണ ഓഡിറ്റ് ട്രയൽ</li>
          <li><span class="icon">✓</span> ഫെസ്റ്റിവൽ പ്രവചനം 2 ആഴ്ച മുമ്പ് ആരംഭിക്കും</li>
        </ul>
      </div>
    </div>
  </div>
</section>

<!-- ═══ TESTIMONIALS ═══ -->
<section class="testimonials">
  <div class="container">
    <div class="reveal">
      <div class="section-label">ആദ്യകാല ദത്തെടുത്തവർ</div>
      <h2 class="section-heading">ഇന്ത്യയിലുടനീളമുള്ള ബീറ്റാ ടെസ്റ്ററുകൾക്ക് പ്രിയപ്പെട്ടതാണ്</h2>
    </div>
    <div class="testimonials-grid">
      <div class="testimonial reveal reveal-delay-1">
        <div class="testimonial-stars">★★★★★</div>
        <blockquote>ബീറ്റാ ടെസ്റ്റിംഗ് മെയിൻ ട്രൈ കിയാ — പെഹ്ലെ ദിൻ സേ രജിസ്റ്റർ ബാൻഡ്. അബ് ബാസ് ബോൾ ദേതി ഹൂൻ ഔർ സബ് അപ്ഡേറ്റ് ഹോ ജാതാ ഹൈ. ഇത്നാ ആസൻ ഹോഗ സോച നഹി ഥാ.</blockquote>
        <div class="testimonial-author">മീന ശർമ്മ</div>
        <div class="testimonial-role">ബീറ്റ ടെസ്റ്റർ · കിരാന സ്റ്റോർOwner, ജയ്പൂർ</div>
      </div>
      <div class="testimonial reveal reveal-delay-2">
        <div class="testimonial-stars">★★★★★</div>
        <blockquote>ജനുവരി മേം ബീറ്റാ ജോയിൻ കിയ ഥാ — ഹോളി കേ ലിയേ AI നെ ഇതിനകം ബറ്റായ കി ക്യാ സ്റ്റോക്ക് ബധാനാ ഹൈ. അഭി സേ ഇത്നാ സ്മാർട്ട് ഹായ്, സോചിയെ ലോഞ്ച് കെ ബാദ് ക്യാ ഹോഗാ.</blockquote>
        <div class="testimonial-author">അർജുൻ പട്ടേൽ</div>
        <div class="testimonial-role">ബീറ്റാ ടെസ്റ്റർ · ജനറൽ സ്റ്റോർ, അഹമ്മദാബാദ്</div>
      </div>
      <div class="testimonial reveal reveal-delay-3">
        <div class="testimonial-stars">★★★★★</div>
        <blockquote>ബംഗ്ല മേൻ ബോൾട്ടെ ഹായ് സമാജ് ഗയാ - ബീറ്റ ടെസ്റ്റിംഗ്-ഇ ദേഖ്‌ലാം ജെ അമർ ഭാഷാ തേ കാജ് കോറെ. സ്റ്റാഫ് റാ ഓ ഖുബ് എളുപ്പത്തിൽ കോർട്ടെ പർച്ചെ ഉപയോഗിക്കുന്നു.</blockquote>
        <div class="testimonial-author">റിനാ ദാസ്</div>
        <div class="testimonial-role">ബീറ്റാ ടെസ്റ്റർ · ടെക്സ്റ്റൈൽ ഷോപ്പ്, കൊൽക്കത്ത</div>
      </div>
    </div>
  </div>
</section>

<!-- ═══ CTA ═══ -->
<section class="cta-section" id="download">
  <div class="container">
    <div class="reveal">
      <div class="section-label">സൗജന്യമായി ആരംഭിക്കുക</div>
      <h2 class="section-heading">
        <span class="hindi" style="display:block; color:var(--saffron); font-size:clamp(20px,2.4vw,28px); font-weight:500; margin-bottom:8px;">आज ही शुरू करें</span>
        നിങ്ങളുടെ ഷോപ്പ് ഒരു നോട്ട്ബുക്കിനേക്കാൾ മികച്ചതാണ്
      </h2>
      <p class="section-sub">ആരംഭിക്കാൻ സൗജന്യം. 2 മിനിറ്റിനുള്ളിൽ സജ്ജീകരിക്കുക. ക്രെഡിറ്റ് കാർഡ് ആവശ്യമില്ല.</p>
      <div class="cta-actions">
        <a href="https://apps.apple.com/in/app/samaan-bol/id6759739444" class="store-badge">
          <div class="store-badge-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg></div>
          <div class="store-badge-text">
            <div class="store-badge-label">ഡൗൺലോഡ് ചെയ്യുക</div>
            <div class="store-badge-name">App Store</div>
          </div>
        </a>
        <a href="#" class="store-badge" style="position:relative; opacity:0.65; pointer-events:none;">
          <div class="store-badge-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.807 1.626a1 1 0 0 1 0 1.73l-2.808 1.626L15.206 12l2.492-2.491zM5.864 2.658L16.8 8.99l-2.3 2.3-8.636-8.632z"/></svg></div>
          <div class="store-badge-text">
            <div class="store-badge-label">അത് നേടുക</div>
            <div class="store-badge-name">Google Play</div>
          </div>
          <span style="position:absolute; top:-10px; right:-10px; background:var(--saffron); color:#fff; font-size:11px; font-weight:700; padding:3px 10px; border-radius:20px; letter-spacing:0.5px; text-transform:uppercase;">ഉടൻ വരുന്നു</span>
        </a>
      </div>
    </div>
  </div>
</section>

<!-- ═══ FOOTER ═══ -->
<footer>
  <div class="container">
    <div class="footer-grid">
      <div class="footer-brand">
        <a href="#" class="logo">
          <div class="logo-mark"><svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><defs><mask id="stencil-footer"><rect x="0" y="0" width="100" height="100" fill="white"/><rect x="24" y="18" width="52" height="8" rx="4" fill="black"/><rect x="38" y="18" width="24" height="36" rx="12" fill="black"/><path d="M 28 42 A 22 22 0 0 0 72 42" fill="none" stroke="black" stroke-width="8" stroke-linecap="round"/><rect x="46" y="72" width="8" height="10" rx="4" fill="black"/><rect x="36" y="32" width="28" height="4" fill="white"/><rect x="36" y="44" width="28" height="4" fill="white"/></mask></defs><circle cx="50" cy="50" r="50" fill="#ea580c" mask="url(#stencil-footer)"/></svg></div>
          <div class="logo-text">സമൻ<span>ബോൾ</span></div>
        </a>
        <p>വോയ്‌സ്-ഫസ്റ്റ് AI ഇൻവെൻ്ററി മാനേജ്‌മെൻ്റ്, ഇന്ത്യൻ റീട്ടെയിലിൻ്റെ ഹൃദയത്തിനായി നിർമ്മിച്ചതാണ്.</p>
      </div>
      <div class="footer-col">
        <h4>ഉൽപ്പന്നം</h4>
        <ul>
          <li><a href="#features">ഫീച്ചറുകൾ</a></li>
          <li><a href="#ai">AI ഇൻ്റലിജൻസ്</a></li>
          <li><a href="#languages">ഭാഷകൾ</a></li>
          <li><a href="#">വിലനിർണ്ണയം</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>കമ്പനി</h4>
        <ul>
          <li><a href="#">കുറിച്ച്</a></li>
          <li><a href="#">ബ്ലോഗ്</a></li>
          <li><a href="#">കരിയർ</a></li>
          <li><a href="#">ബന്ധപ്പെടുക</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>പിന്തുണ</h4>
        <ul>
          <li><a href="#">സഹായ കേന്ദ്രം</a></li>
          <li><a href="/privacy-policy">സ്വകാര്യതാ നയം</a></li>
          <li><a href="/terms-of-service">സേവന നിബന്ധനകൾ</a></li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <span>© 2026Samaan-Bol. എല്ലാ അവകാശങ്ങളും നിക്ഷിപ്തം.</span>
      <span class="made-in-india">ഇന്ത്യയിൽ ♥ ഉപയോഗിച്ച് നിർമ്മിച്ചത് 🇮🇳</span>
    </div>
  </div>
</footer>`,
    privacy: `<div class="reading-progress" id="readingProgress"></div>

  <div class="container">
    <a href="/" class="back">← വീട്ടിലേക്ക് മടങ്ങുക</a>
    <h1>സ്വകാര്യതാ നയം</h1>
    <p class="effective">പ്രാബല്യത്തിൽ വരുന്ന തീയതി: ഫെബ്രുവരി 23, 2026</p>

    <nav class="toc">
      <h3>ഉള്ളടക്കം</h3>
      <ol>
        <li><a href="#s1">ഞങ്ങൾ ശേഖരിക്കുന്ന വിവരങ്ങൾ</a></li>
        <li><a href="#s2">നിങ്ങളുടെ വിവരങ്ങൾ ഞങ്ങൾ എങ്ങനെ ഉപയോഗിക്കുന്നു</a></li>
        <li><a href="#s3">മൂന്നാം കക്ഷി സേവനങ്ങൾ</a></li>
        <li><a href="#s4">ഡാറ്റ സംഭരണവും സുരക്ഷയും</a></li>
        <li><a href="#s5">ഡാറ്റ നിലനിർത്തൽ</a></li>
        <li><a href="#s6">അക്കൗണ്ട് ഇല്ലാതാക്കൽ</a></li>
        <li><a href="#s7">കടകൾക്കുള്ളിൽ ഡാറ്റ പങ്കിടൽ</a></li>
        <li><a href="#s8">കുട്ടികളുടെ സ്വകാര്യത</a></li>
        <li><a href="#s9">നിങ്ങളുടെ അവകാശങ്ങൾ</a></li>
        <li><a href="#s10">ഈ നയത്തിലെ മാറ്റങ്ങൾ</a></li>
        <li><a href="#s11">ഞങ്ങളെ സമീപിക്കുക</a></li>
      </ol>
    </nav>

    <p>Samaan-Bol ("ഞങ്ങൾ", "ഞങ്ങളുടെ" അല്ലെങ്കിൽ "ആപ്പ്") എന്നത് ഇന്ത്യൻ റീട്ടെയിൽ ബിസിനസുകൾക്കായി രൂപകൽപ്പന ചെയ്‌തിരിക്കുന്ന ഒരു വോയ്‌സ്-ഫസ്റ്റ് സഹകരണ ഇൻവെൻ്ററി മാനേജ്‌മെൻ്റ് ആപ്ലിക്കേഷനാണ്. ഈ സ്വകാര്യതാ നയം ഞങ്ങൾ ശേഖരിക്കുന്ന വിവരങ്ങൾ, ഞങ്ങൾ അത് എങ്ങനെ ഉപയോഗിക്കുന്നു, ആരുമായി പങ്കിടുന്നു, നിങ്ങളുടെ ഡാറ്റയെ സംബന്ധിച്ച നിങ്ങളുടെ അവകാശങ്ങൾ എന്നിവ വിശദീകരിക്കുന്നു.</p>

    <p>Samaan-Bolഉപയോഗിക്കുന്നതിലൂടെ, ഈ നയത്തിൽ വിവരിച്ചിരിക്കുന്നതുപോലെ വിവരങ്ങളുടെ ശേഖരണവും ഉപയോഗവും നിങ്ങൾ അംഗീകരിക്കുന്നു.</p>

    <details open id="s1">
      <summary><h2>1. ഞങ്ങൾ ശേഖരിക്കുന്ന വിവരങ്ങൾ</h2></summary>
      <div class="section-content">
        <h3>1.1 അക്കൗണ്ട് വിവരങ്ങൾ</h3>
        <p>നിങ്ങൾ ഒരു അക്കൗണ്ട് സൃഷ്ടിക്കുമ്പോൾ, ഞങ്ങൾ ശേഖരിക്കുന്നു:</p>
        <ul>
          <li><strong>പൂർണ്ണമായ പേര്</strong> - സൈൻ അപ്പ് സമയത്ത് നൽകിയിരിക്കുന്നു</li>
          <li><strong>Emailവിലാസം</strong> — പ്രാമാണീകരണത്തിനും അക്കൗണ്ട് വീണ്ടെടുക്കലിനും ഉപയോഗിക്കുന്നു</li>
          <li><strong>രഹസ്യവാക്ക്</strong> - ഞങ്ങളുടെ പ്രാമാണീകരണ ദാതാവ് എൻക്രിപ്റ്റ് ചെയ്യുകയും നിയന്ത്രിക്കുകയും ചെയ്യുന്നു (Clerk)</li>
        </ul>
        <p>നിങ്ങൾGoogleഅല്ലെങ്കിൽ Apple ഉപയോഗിച്ച് സൈൻ ഇൻ ചെയ്യുകയാണെങ്കിൽ,OAuthദാതാവിൽ നിന്ന് ഞങ്ങൾക്ക് നിങ്ങളുടെ പേരും ഇമെയിലും ലഭിക്കും. നിങ്ങളുടെGoogleഅല്ലെങ്കിൽ Apple അക്കൗണ്ട് പാസ്‌വേഡ് ഞങ്ങൾ ആക്‌സസ് ചെയ്യുന്നില്ല.</p>

        <h3>1.2 വോയ്സ് റെക്കോർഡിംഗുകൾ</h3>
        <div class="highlight">
          <p><strong>പ്രധാനപ്പെട്ടത്:</strong> വോയ്‌സ് റെക്കോർഡിംഗുകൾ തത്സമയം പ്രോസസ്സ് ചെയ്യുന്നു <strong>സ്ഥിരമായി സൂക്ഷിച്ചിട്ടില്ല</strong>. ഞങ്ങളുടെ സെർവറിലേക്ക് ഓഡിയോ സംപ്രേക്ഷണം ചെയ്യുന്നു, സംഭാഷണം തിരിച്ചറിയുന്നതിനും സ്വാഭാവിക ഭാഷ മനസ്സിലാക്കുന്നതിനുമായിSarvam AIപ്രോസസ്സ് ചെയ്യുകയും പ്രോസസ്സ് ചെയ്ത ശേഷം ഉടൻ തന്നെ ഉപേക്ഷിക്കുകയും ചെയ്യുന്നു. തത്ഫലമായുണ്ടാകുന്ന ടെക്സ്റ്റ് ട്രാൻസ്ക്രിപ്റ്റ് മാത്രമേ നിങ്ങളുടെ റഫറൻസിനായി നിങ്ങളുടെ ഓഡിറ്റ് ലോഗിൽ സംഭരിച്ചിട്ടുള്ളൂ.</p>
        </div>
        <ul>
          <li>നിങ്ങളുടെ ഉപകരണത്തിൽ ഓഡിയോ റെക്കോർഡ് ചെയ്‌തു (WAVഫോർമാറ്റ്iOS, M4AAndroid)</li>
          <li>റെക്കോർഡിംഗുകൾ പരമാവധി 30 സെക്കൻഡിൽ പരിമിതപ്പെടുത്തിയിരിക്കുന്നു</li>
          <li>ഒരു സുരക്ഷിത കണക്ഷൻ വഴി എൻകോഡ് ചെയ്ത ഡാറ്റയായി ഞങ്ങളുടെ സെർവറിലേക്ക് ഓഡിയോ അയയ്‌ക്കുന്നു</li>
          <li>പ്രോസസ്സ് ചെയ്ത ശേഷം, സെർവർ മെമ്മറിയിൽ നിന്ന് ഓഡിയോ ഡാറ്റ നിരസിക്കപ്പെടും</li>
          <li>ടെക്‌സ്‌റ്റ് ട്രാൻസ്‌ക്രിപ്റ്റുകൾ നിങ്ങളുടെ ഷോപ്പിൻ്റെ ഓഡിറ്റ് ലോഗിൽ സംഭരിച്ചിരിക്കുന്നതിനാൽ നിങ്ങൾക്ക് കഴിഞ്ഞ പ്രവർത്തനങ്ങൾ അവലോകനം ചെയ്യാം</li>
        </ul>

        <h3>1.3 ഇൻവെൻ്ററി & ബിസിനസ് ഡാറ്റ</h3>
        <p>നിങ്ങൾ ആപ്പ് ഉപയോഗിക്കുമ്പോൾ, നിങ്ങൾ സൃഷ്ടിക്കുന്ന ബിസിനസ് ഡാറ്റ ഞങ്ങൾ സംഭരിക്കുന്നു:</p>
        <ul>
          <li>ഷോപ്പ് വിവരങ്ങൾ (പേര്, വിഭാഗം, തിരഞ്ഞെടുത്ത ഭാഷ)</li>
          <li>ഉൽപ്പന്ന കാറ്റലോഗ് (പേരുകൾ, ബാർകോഡുകൾ, വിഭാഗങ്ങൾ, യൂണിറ്റുകൾ, വിലകൾ)</li>
          <li>സ്റ്റോക്ക് അളവുകൾ, ബാച്ച് നമ്പറുകൾ, വാങ്ങൽ തീയതികൾ, കാലഹരണപ്പെടുന്ന തീയതികൾ, വിതരണക്കാരുടെ പേരുകൾ</li>
          <li>ലിസ്റ്റ് ഇനങ്ങളും കുറിപ്പുകളും വാങ്ങുക</li>
          <li>ഇൻവെൻ്ററി മാറ്റങ്ങൾ രേഖപ്പെടുത്തുന്ന ഓഡിറ്റ് ലോഗുകൾ (ആക്ഷൻ തരം, ഉപയോക്താവ്, ടൈംസ്റ്റാമ്പ്, ട്രാൻസ്ക്രിപ്റ്റ്, കോൺഫിഡൻസ് സ്കോർ)</li>
        </ul>

        <h3>1.4 ഉപയോക്തൃ മുൻഗണനകൾ</h3>
        <ul>
          <li>ആപ്പ് ഭാഷയും ശബ്ദ ഭാഷയും തിരഞ്ഞെടുക്കുന്നു</li>
          <li>വോയ്സ് ഫീഡ്ബാക്ക് മുൻഗണന (ഓൺ/ഓഫ്)</li>
          <li>ഡിസ്പ്ലേ ക്രമീകരണങ്ങൾ (ഉയർന്ന കോൺട്രാസ്റ്റ് മോഡ്, ടെക്സ്റ്റ് വലുപ്പം)</li>
          <li>ഡിഫോൾട്ട് മെഷർമെൻ്റ് യൂണിറ്റ്</li>
          <li>അറിയിപ്പ് മുൻഗണനകൾ</li>
        </ul>

        <h3>1.5 അംഗത്വ ഡാറ്റ ഷോപ്പ്</h3>
        <ul>
          <li>ഓരോ കടയിലും നിങ്ങളുടെ പങ്ക് (Owner,Manager, അല്ലെങ്കിൽ Helper)</li>
          <li>ടീം സഹകരണത്തിനായി സൃഷ്‌ടിച്ച കോഡുകൾ ക്ഷണിക്കുക</li>
          <li>കടകളിൽ അവസാനമായി സജീവമായ ടൈംസ്റ്റാമ്പുകൾ</li>
        </ul>

        <h3>1.6 ഉപകരണവും ഡയഗ്നോസ്റ്റിക് ഡാറ്റയും</h3>
        <p>പ്രൊഡക്ഷൻ ബിൽഡുകളിൽ, ക്രാഷ് റിപ്പോർട്ടിംഗിനായി ഞങ്ങൾSentryഉപയോഗിക്കുന്നു. ഇത് ശേഖരിക്കുന്നു:</p>
        <ul>
          <li>ഉപകരണ തരം, ഓപ്പറേറ്റിംഗ് സിസ്റ്റം, ആപ്പ് പതിപ്പ്</li>
          <li>ക്രാഷ് റിപ്പോർട്ടുകളും പിശക് സ്റ്റാക്ക് ട്രെയ്‌സുകളും</li>
          <li>പ്രകടന ഡാറ്റ (സെഷനുകളുടെ 20% സാമ്പിൾ)</li>
        </ul>
        <p>ഡെവലപ്‌മെൻ്റ് ബിൽഡുകളിൽ ക്രാഷ് റിപ്പോർട്ടിംഗ് അപ്രാപ്‌തമാക്കിയിരിക്കുന്നു, ഞങ്ങൾ പ്രയോഗിക്കുന്ന സാംപ്ലിംഗ് നിരക്ക് ഉപയോഗിച്ച് ഇത് ചെറുതാക്കാം.</p>
      </div>
    </details>

    <details id="s2">
      <summary><h2>2. നിങ്ങളുടെ വിവരങ്ങൾ ഞങ്ങൾ എങ്ങനെ ഉപയോഗിക്കുന്നു</h2></summary>
      <div class="section-content">
        <ul>
          <li><strong>സേവനം നൽകുക:</strong> വോയ്‌സ് കമാൻഡുകൾ പ്രോസസ്സ് ചെയ്യുക, ഇൻവെൻ്ററി മാനേജ് ചെയ്യുക, നിങ്ങളുടെ ടീമിലുടനീളം ഡാറ്റ സമന്വയിപ്പിക്കുക</li>
          <li><strong>പ്രാമാണീകരണം:</strong> നിങ്ങളുടെ ഐഡൻ്റിറ്റി പരിശോധിച്ച് സുരക്ഷിതമായ സെഷനുകൾ നിയന്ത്രിക്കുക</li>
          <li><strong>ഓഡിറ്റ് ട്രയൽ:</strong> ഉത്തരവാദിത്തത്തിനും അവലോകനത്തിനുമായി ഇൻവെൻ്ററി മാറ്റങ്ങളുടെ ഒരു ലോഗ് സൂക്ഷിക്കുക</li>
          <li><strong>സേവനം മെച്ചപ്പെടുത്തുക:</strong> അജ്ഞാത പിശക് റിപ്പോർട്ടുകളിലൂടെ ബഗുകളും ക്രാഷുകളും കണ്ടെത്തുക</li>
          <li><strong>ആശയവിനിമയം:</strong> അത്യാവശ്യ അക്കൗണ്ടുമായി ബന്ധപ്പെട്ട അറിയിപ്പുകൾ അയയ്‌ക്കുക (ഉദാ. പാസ്‌വേഡ് പുനഃസജ്ജമാക്കൽ)</li>
        </ul>
        <p>ഞങ്ങൾ ചെയ്യുന്നു <strong>അല്ല</strong> നിങ്ങളുടെ ഡാറ്റ പരസ്യത്തിനായി ഉപയോഗിക്കുക, ഞങ്ങൾ അത് ചെയ്യുന്നു <strong>അല്ല</strong> നിങ്ങളുടെ സ്വകാര്യ വിവരങ്ങൾ മൂന്നാം കക്ഷികൾക്ക് വിൽക്കുക.</p>
      </div>
    </details>

    <details id="s3">
      <summary><h2>3. മൂന്നാം കക്ഷി സേവനങ്ങൾ</h2></summary>
      <div class="section-content">
        <p>ആപ്പ് പ്രവർത്തിപ്പിക്കുന്നതിന് ഞങ്ങൾ ഇനിപ്പറയുന്ന മൂന്നാം കക്ഷി സേവനങ്ങൾ ഉപയോഗിക്കുന്നു:</p>
        <table>
          <thead>
            <tr>
              <th>സേവനം</th>
              <th>ഉദ്ദേശം</th>
              <th>ഡാറ്റ പങ്കിട്ടു</th>
              <th>സ്വകാര്യതാ നയം</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Clerk</strong></td>
              <td>പ്രാമാണീകരണവും സെഷൻ മാനേജ്മെൻ്റും</td>
              <td>Email, പേര്,OAuthടോക്കണുകൾ, സെഷൻ ഡാറ്റ</td>
              <td><a href="https://clerk.com/legal/privacy" target="_blank" rel="noopener">clerk.com/legal/privacy</a></td>
            </tr>
            <tr>
              <td><strong>Sarvam AI</strong></td>
              <td>വോയ്സ് പ്രോസസ്സിംഗ് (സ്പീച്ച്-ടു-ടെക്സ്റ്റ്, നാച്ചുറൽ ലാംഗ്വേജ് പ്രോസസ്സിംഗ്, ടെക്സ്റ്റ്-ടു-സ്പീച്ച്)</td>
              <td>ഓഡിയോ റെക്കോർഡിംഗുകൾ, ട്രാൻസ്ക്രിപ്റ്റ് ടെക്സ്റ്റ്, ഭാഷാ കോഡ്</td>
              <td><a href="https://www.sarvam.ai/privacy-policy" target="_blank" rel="noopener">sarvam.ai/privacy-policy</a></td>
            </tr>
            <tr>
              <td><strong>Neon</strong></td>
              <td>ഡാറ്റാബേസ് ഹോസ്റ്റിംഗ് (PostgreSQL)</td>
              <td>എല്ലാ സ്ഥിരമായ അപ്ലിക്കേഷൻ ഡാറ്റയും</td>
              <td><a href="https://neon.tech/privacy-policy" target="_blank" rel="noopener">neon.tech/privacy-policy</a></td>
            </tr>
            <tr>
              <td><strong>Sentry</strong></td>
              <td>ട്രാക്ക് ചെയ്യലും ക്രാഷ് റിപ്പോർട്ടിംഗും പിശക്</td>
              <td>ക്രാഷ് റിപ്പോർട്ടുകൾ, ഉപകരണ വിവരങ്ങൾ (പ്രൊഡക്ഷൻ മാത്രം)</td>
              <td><a href="https://sentry.io/privacy/" target="_blank" rel="noopener">sentry.io/privacy</a></td>
            </tr>
          </tbody>
        </table>
        <p>ഓരോ മൂന്നാം കക്ഷി സേവനവും അവരുടെ സ്വന്തം സ്വകാര്യതാ നയം അനുസരിച്ച് ഡാറ്റ പ്രോസസ്സ് ചെയ്യുന്നു. അവരുടെ നയങ്ങൾ അവലോകനം ചെയ്യാൻ ഞങ്ങൾ നിങ്ങളെ പ്രോത്സാഹിപ്പിക്കുന്നു.</p>
      </div>
    </details>

    <details id="s4">
      <summary><h2>4. ഡാറ്റ സംഭരണവും സുരക്ഷയും</h2></summary>
      <div class="section-content">
        <ul>
          <li>ട്രാൻസിറ്റിൽSSL/TLSഎൻക്രിപ്ഷൻ ഉള്ള ഒരു Neon PostgreSQL ഡാറ്റാബേസിൽ ആപ്ലിക്കേഷൻ ഡാറ്റ സംഭരിച്ചിരിക്കുന്നു</li>
          <li>സുരക്ഷിതമായ സംഭരണം (iOSകീചെയിൻ /Androidകീസ്റ്റോർ) ഉപയോഗിച്ച് നിങ്ങളുടെ ഉപകരണത്തിൽ പ്രാമാണീകരണ ടോക്കണുകൾ സംഭരിക്കുന്നു</li>
          <li>APIആശയവിനിമയംHTTPSഎൻക്രിപ്ഷൻ ഉപയോഗിക്കുന്നു</li>
          <li>ദുരുപയോഗം തടയാൻ സെൻസിറ്റീവ് എൻഡ്‌പോയിൻ്റുകൾ നിരക്ക് പരിമിതപ്പെടുത്തിയിരിക്കുന്നു</li>
          <li>പാസ്‌വേഡുകൾ ഹാഷ് ചെയ്യുകയും നിയന്ത്രിക്കുകയും ചെയ്യുന്നത്Clerk— ഞങ്ങൾ ഒരിക്കലും പ്ലെയിൻ ടെക്സ്റ്റ് പാസ്‌വേഡുകൾ സംഭരിക്കുന്നില്ല</li>
        </ul>
      </div>
    </details>

    <details id="s5">
      <summary><h2>5. ഡാറ്റ നിലനിർത്തൽ</h2></summary>
      <div class="section-content">
        <ul>
          <li><strong>വോയ്സ് ഓഡിയോ:</strong> എഫെമറൽ - മെമ്മറിയിൽ പ്രോസസ്സ് ചെയ്യുകയും ഉടൻ തന്നെ ഉപേക്ഷിക്കുകയും ചെയ്യുന്നു. ഞങ്ങളുടെ സെർവറുകളിൽ ഒരിക്കലും സംഭരിച്ചിട്ടില്ല.</li>
          <li><strong>ട്രാൻസ്ക്രിപ്റ്റുകളും ഓഡിറ്റ് ലോഗുകളും:</strong> നിങ്ങളുടെ റഫറൻസിനായി നിങ്ങളുടെ അക്കൗണ്ട് സജീവമായിരിക്കുന്നിടത്തോളം കാലം നിലനിർത്തും.</li>
          <li><strong>ഇൻവെൻ്ററി ഡാറ്റ:</strong> നിങ്ങളുടെ അക്കൗണ്ട് സജീവമായിരിക്കുന്നിടത്തോളം കാലം നിലനിർത്തും.</li>
          <li><strong>അക്കൗണ്ട് ഡാറ്റ:</strong> നിങ്ങളുടെ അക്കൗണ്ട് ഇല്ലാതാക്കുന്നത് വരെ നിലനിർത്തി.</li>
          <li><strong>ക്രാഷ് റിപ്പോർട്ടുകൾ:</strong>Sentry-ൻ്റെ ഡാറ്റ നിലനിർത്തൽ നയം (സാധാരണയായി 90 ദിവസം) അനുസരിച്ച് നിലനിർത്തി.</li>
        </ul>
      </div>
    </details>

    <details id="s6">
      <summary><h2>6. അക്കൗണ്ട് ഇല്ലാതാക്കൽ</h2></summary>
      <div class="section-content">
        <p>നിങ്ങൾക്ക് എപ്പോൾ വേണമെങ്കിലും അക്കൗണ്ട് ഇല്ലാതാക്കാം <strong>Settings > Delete Account</strong> ആപ്പിനുള്ളിൽ. നിങ്ങളുടെ അക്കൗണ്ട് ഇല്ലാതാക്കുമ്പോൾ:</p>
        <ul>
          <li>എല്ലാ ഉൽപ്പന്നങ്ങളും ഇൻവെൻ്ററിയും ബാച്ചുകളും വാങ്ങൽ ലിസ്റ്റുകളും AI പ്രവചനങ്ങളും ഉൾപ്പെടെ നിങ്ങളുടെ ഉടമസ്ഥതയിലുള്ള എല്ലാ ഷോപ്പുകളും ശാശ്വതമായി ഇല്ലാതാക്കപ്പെടും</li>
          <li>നിങ്ങളുടെ എല്ലാ ഓഡിറ്റ് ലോഗുകളും മുൻഗണനകളും ശാശ്വതമായി ഇല്ലാതാക്കപ്പെടും</li>
          <li>മറ്റ് ഉപയോക്താക്കളുടെ ഷോപ്പുകളിലെ നിങ്ങളുടെ അംഗത്വങ്ങൾ നീക്കംചെയ്‌തു</li>
          <li>Clerkഉള്ള നിങ്ങളുടെ പ്രാമാണീകരണ അക്കൗണ്ട് ശാശ്വതമായി ഇല്ലാതാക്കി</li>
        </ul>
        <p><strong>ഈ പ്രവർത്തനം മാറ്റാനാവാത്തതാണ്.</strong> ഒരിക്കൽ ഇല്ലാതാക്കിയാൽ, നിങ്ങളുടെ ഡാറ്റ വീണ്ടെടുക്കാൻ കഴിയില്ല.</p>
      </div>
    </details>

    <details id="s7">
      <summary><h2>7. കടകൾക്കുള്ളിൽ ഡാറ്റ പങ്കിടൽ</h2></summary>
      <div class="section-content">
        <p>Samaan-Bolഒരു സഹകരണ ഉപകരണമാണ്. നിങ്ങൾ ഒരു കടയിൽ അംഗമാകുമ്പോൾ:</p>
        <ul>
          <li>എല്ലാ ഷോപ്പ് അംഗങ്ങൾക്കും (Owner,Manager, Helperകൾ) ഷോപ്പിൻ്റെ ഇൻവെൻ്ററി ഡാറ്റ, ഉൽപ്പന്ന കാറ്റലോഗ്, ഓഡിറ്റ് ലോഗുകൾ എന്നിവ കാണാൻ കഴിയും</li>
          <li>നിങ്ങളുടെ പേര്, റോൾ, ആക്‌റ്റിവിറ്റി ടൈംസ്റ്റാമ്പുകൾ എന്നിവ മറ്റ് ഷോപ്പ് അംഗങ്ങൾക്ക് ദൃശ്യമാണ്</li>
          <li>Owner-കൾക്ക് അവരുടെ ഷോപ്പിലേക്കുള്ള അംഗത്വവും ആക്‌സസ്സും നിയന്ത്രിക്കാനാകും</li>
        </ul>
        <p>നിങ്ങൾ അംഗമല്ലാത്ത കടകളുമായോ ബന്ധമില്ലാത്ത മൂന്നാം കക്ഷികളുമായോ ഞങ്ങൾ നിങ്ങളുടെ ഡാറ്റ പങ്കിടില്ല.</p>
      </div>
    </details>

    <details id="s8">
      <summary><h2>8. കുട്ടികളുടെ സ്വകാര്യത</h2></summary>
      <div class="section-content">
        <p>Samaan-Bolവയസ്സിന് താഴെയുള്ള കുട്ടികൾക്ക് ഉപയോഗിക്കാൻ ഉദ്ദേശിച്ചുള്ളതല്ല. 13 വയസ്സിന് താഴെയുള്ള കുട്ടികളിൽ നിന്ന് ഞങ്ങൾ ബോധപൂർവം വ്യക്തിഗത വിവരങ്ങൾ ശേഖരിക്കില്ല. ഒരു കുട്ടി ഞങ്ങൾക്ക് വ്യക്തിഗത വിവരങ്ങൾ നൽകിയിട്ടുണ്ടെന്ന് നിങ്ങൾ വിശ്വസിക്കുന്നുവെങ്കിൽ, ദയവായി ഞങ്ങളെ ബന്ധപ്പെടുക, ഞങ്ങൾ അത് ഉടനടി ഇല്ലാതാക്കും.</p>
      </div>
    </details>

    <details id="s9">
      <summary><h2>9. നിങ്ങളുടെ അവകാശങ്ങൾ</h2></summary>
      <div class="section-content">
        <p>നിങ്ങൾക്ക് ഇതിന് അവകാശമുണ്ട്:</p>
        <ul>
          <li><strong>നിങ്ങളുടെ ഡാറ്റ ആക്സസ് ചെയ്യുക:</strong> ആപ്പിനുള്ളിൽ നിങ്ങളുടെ ഇൻവെൻ്ററി, ഓഡിറ്റ് ലോഗുകൾ, മുൻഗണനകൾ എന്നിവ കാണുക</li>
          <li><strong>നിങ്ങളുടെ ഡാറ്റ ഇല്ലാതാക്കുക:</strong> ക്രമീകരണങ്ങളിൽ അക്കൗണ്ട് ഇല്ലാതാക്കൽ ഫീച്ചർ ഉപയോഗിക്കുക</li>
          <li><strong>നിയന്ത്രണ മുൻഗണനകൾ:</strong> ഏത് സമയത്തും നിങ്ങളുടെ ഭാഷ, ഡിസ്‌പ്ലേ, വോയ്‌സ് ക്രമീകരണങ്ങൾ പരിഷ്‌ക്കരിക്കുക</li>
          <li><strong>കടകളിൽ നിന്ന് പിൻവലിക്കുക:</strong> നിങ്ങൾ അംഗമായ ഏതെങ്കിലും കട ഉപേക്ഷിക്കുക</li>
        </ul>
      </div>
    </details>

    <details id="s10">
      <summary><h2>10. ഈ നയത്തിലെ മാറ്റങ്ങൾ</h2></summary>
      <div class="section-content">
        <p>ഞങ്ങൾ ഈ സ്വകാര്യതാ നയം കാലാകാലങ്ങളിൽ അപ്ഡേറ്റ് ചെയ്തേക്കാം. ഞങ്ങൾ ചെയ്യുമ്പോൾ, ഈ പേജിൻ്റെ മുകളിലുള്ള "പ്രാബല്യത്തിലുള്ള തീയതി" ഞങ്ങൾ അപ്ഡേറ്റ് ചെയ്യും. ഈ നയം ആനുകാലികമായി അവലോകനം ചെയ്യാൻ ഞങ്ങൾ നിങ്ങളെ പ്രോത്സാഹിപ്പിക്കുന്നു. മാറ്റങ്ങൾക്ക് ശേഷവും ആപ്പ് ഉപയോഗിക്കുന്നത് അപ്‌ഡേറ്റ് ചെയ്ത നയത്തിൻ്റെ സ്വീകാര്യതയാണ്.</p>
      </div>
    </details>

    <details id="s11">
      <summary><h2>11. ഞങ്ങളെ ബന്ധപ്പെടുക</h2></summary>
      <div class="section-content">
        <p>ഈ സ്വകാര്യതാ നയത്തെക്കുറിച്ചോ നിങ്ങളുടെ ഡാറ്റയെക്കുറിച്ചോ നിങ്ങൾക്ക് എന്തെങ്കിലും ചോദ്യങ്ങളുണ്ടെങ്കിൽ, ദയവായി ഞങ്ങളെ ബന്ധപ്പെടുക:</p>
        <p><strong>Email:</strong> <a href="mailto:meetslimshady07@gmail.com">meetslimshady07@gmail.com</a></p>
      </div>
    </details>

    <p class="copyright">© 2026Samaan-Bol. എല്ലാ അവകാശങ്ങളും നിക്ഷിപ്തം.</p>
  </div>

  <button class="back-to-top" id="backToTop" aria-label="Back to top">↑</button>`,
    terms: `<div class="reading-progress" id="readingProgress"></div>

  <div class="container">
    <a href="/" class="back">← വീട്ടിലേക്ക് മടങ്ങുക</a>
    <h1>സേവന നിബന്ധനകൾ</h1>
    <p class="effective">പ്രാബല്യത്തിൽ വരുന്ന തീയതി: ഫെബ്രുവരി 23, 2026</p>

    <nav class="toc">
      <h3>ഉള്ളടക്കം</h3>
      <ol>
        <li><a href="#s1">സേവനത്തിൻ്റെ വിവരണം</a></li>
        <li><a href="#s2">അക്കൗണ്ട് രജിസ്ട്രേഷൻ</a></li>
        <li><a href="#s3">ഉപയോക്തൃ റോളുകളും ഉത്തരവാദിത്തങ്ങളും</a></li>
        <li><a href="#s4">വോയ്സ് ഇൻപുട്ട്</a></li>
        <li><a href="#s5">സ്വീകാര്യമായ ഉപയോഗം</a></li>
        <li><a href="#s6">നിങ്ങളുടെ ഡാറ്റ</a></li>
        <li><a href="#s7">സേവന ലഭ്യത</a></li>
        <li><a href="#s8">നിരക്ക് പരിധി</a></li>
        <li><a href="#s9">അക്കൗണ്ട് അവസാനിപ്പിക്കൽ</a></li>
        <li><a href="#s10">ബൗദ്ധിക സ്വത്തവകാശം</a></li>
        <li><a href="#s11">വാറൻ്റികളുടെ നിരാകരണം</a></li>
        <li><a href="#s12">ബാധ്യതയുടെ പരിമിതി</a></li>
        <li><a href="#s13">ഈ നിബന്ധനകളിലെ മാറ്റങ്ങൾ</a></li>
        <li><a href="#s14">ഭരണ നിയമം</a></li>
        <li><a href="#s15">ഞങ്ങളെ സമീപിക്കുക</a></li>
      </ol>
    </nav>

    <p>Samaan-Bol-ലേക്ക് സ്വാഗതം. ഈ സേവന നിബന്ധനകൾ ("നിബന്ധനകൾ")Samaan-Bolമൊബൈൽ ആപ്ലിക്കേഷൻ്റെയും അനുബന്ധ സേവനങ്ങളുടെയും (മൊത്തത്തിൽ, "സേവനം") നിങ്ങളുടെ ഉപയോഗത്തെ നിയന്ത്രിക്കുന്നു. ഒരു അക്കൗണ്ട് സൃഷ്‌ടിക്കുന്നതിലൂടെയോ സേവനം ഉപയോഗിക്കുന്നതിലൂടെയോ, ഈ നിബന്ധനകൾക്ക് വിധേയമായിരിക്കാൻ നിങ്ങൾ സമ്മതിക്കുന്നു.</p>

    <details open id="s1">
      <summary><h2>1. സേവനത്തിൻ്റെ വിവരണം</h2></summary>
      <div class="section-content">
        <p>Samaan-Bolഎന്നത് ഇന്ത്യൻ റീട്ടെയിൽ ബിസിനസുകൾക്കായി രൂപകൽപ്പന ചെയ്‌തിരിക്കുന്ന ഒരു വോയ്‌സ്-ഫസ്റ്റ് സഹകരണ ഇൻവെൻ്ററി മാനേജ്‌മെൻ്റ് ആപ്ലിക്കേഷനാണ്. സേവനം നിങ്ങളെ അനുവദിക്കുന്നു:</p>
        <ul>
          <li>ഒന്നിലധികം ഇന്ത്യൻ ഭാഷകളിലെ വോയ്‌സ് കമാൻഡുകൾ ഉപയോഗിച്ച് ഉൽപ്പന്ന ഇൻവെൻ്ററി നിയന്ത്രിക്കുക</li>
          <li>സ്റ്റോക്ക് ലെവലുകൾ, ബാച്ചുകൾ, കാലഹരണപ്പെടൽ തീയതികൾ, വാങ്ങൽ വിവരങ്ങൾ എന്നിവ ട്രാക്ക് ചെയ്യുക</li>
          <li>റോൾ-ബേസ്ഡ് ആക്‌സസ് വഴി ടീം അംഗങ്ങളുമായി സഹകരിക്കുക (Owner,Manager, Helper)</li>
          <li>എല്ലാ ഇൻവെൻ്ററി മാറ്റങ്ങളുടെയും ഓഡിറ്റ് ട്രയലുകൾ കാണുക</li>
          <li>വാങ്ങൽ ലിസ്റ്റുകൾ നിയന്ത്രിക്കുകയും സ്റ്റോക്ക്-ലെവൽ അലേർട്ടുകൾ സ്വീകരിക്കുകയും ചെയ്യുക</li>
        </ul>
      </div>
    </details>

    <details id="s2">
      <summary><h2>2. അക്കൗണ്ട് രജിസ്ട്രേഷൻ</h2></summary>
      <div class="section-content">
        <p>സേവനം ഉപയോഗിക്കുന്നതിന്, കൃത്യവും പൂർണ്ണവുമായ വിവരങ്ങൾ നൽകിക്കൊണ്ട് നിങ്ങൾ ഒരു അക്കൗണ്ട് സൃഷ്ടിക്കണം. നിങ്ങൾ ഇതിന് ഉത്തരവാദിയാണ്:</p>
        <ul>
          <li>നിങ്ങളുടെ അക്കൗണ്ട് ക്രെഡൻഷ്യലുകളുടെ രഹസ്യാത്മകത കാത്തുസൂക്ഷിക്കുന്നു</li>
          <li>നിങ്ങളുടെ അക്കൗണ്ടിന് കീഴിൽ സംഭവിക്കുന്ന എല്ലാ പ്രവർത്തനങ്ങളും</li>
          <li>നിങ്ങളുടെ അക്കൗണ്ടിൻ്റെ ഏതെങ്കിലും അനധികൃത ഉപയോഗത്തെക്കുറിച്ച് ഞങ്ങളെ ഉടൻ അറിയിക്കുന്നു</li>
        </ul>
        <p>ഒരു അക്കൗണ്ട് സൃഷ്ടിക്കുന്നതിനും സേവനം ഉപയോഗിക്കുന്നതിനും നിങ്ങൾക്ക് കുറഞ്ഞത് 13 വയസ്സ് പ്രായമുണ്ടായിരിക്കണം.</p>
      </div>
    </details>

    <details id="s3">
      <summary><h2>3. ഉപയോക്തൃ റോളുകളും ഉത്തരവാദിത്തങ്ങളും</h2></summary>
      <div class="section-content">
        <p>Samaan-Bolഒരു റോൾ-ബേസ്ഡ് ആക്സസ് കൺട്രോൾ സിസ്റ്റം ഉപയോഗിക്കുന്നു:</p>
        <ul>
          <li><strong>Owner:</strong> ഷോപ്പുകൾ സൃഷ്‌ടിക്കുകയും നിയന്ത്രിക്കുകയും ചെയ്യുന്നു, ടീം അംഗങ്ങളെ ക്ഷണിക്കുന്നു, എല്ലാ ഷോപ്പ് ഡാറ്റയിലേക്കും ക്രമീകരണത്തിലേക്കും പൂർണ്ണ ആക്‌സസ് ഉണ്ട്, കൂടാതെ ഷോപ്പ് ഇല്ലാതാക്കാനും കഴിയും</li>
          <li><strong>Manager:</strong> സാധനങ്ങൾ കൈകാര്യം ചെയ്യാനും റിപ്പോർട്ടുകൾ കാണാനും ഷോപ്പിനുള്ളിൽ മിക്ക പ്രവർത്തനങ്ങളും നടത്താനും കഴിയും</li>
          <li><strong>Helper:</strong> നിർദ്ദേശിച്ച പ്രകാരം സ്റ്റോക്ക് ഇനങ്ങൾ ചേർക്കാനും നീക്കം ചെയ്യാനും കഴിയും</li>
        </ul>
        <p>ഒരുOwnerഎന്ന നിലയിൽ, നിങ്ങളുടെ ഷോപ്പിലേക്കും അതിനുള്ളിലെ ഡാറ്റയിലേക്കും ഉള്ള ആക്‌സസ് നിയന്ത്രിക്കുന്നതിന് നിങ്ങൾ ഉത്തരവാദിയാണ്. നിങ്ങൾ അംഗങ്ങളെ ക്ഷണിക്കുമ്പോൾ, അവർക്ക് നിങ്ങളുടെ ഷോപ്പിൻ്റെ ഇൻവെൻ്ററി ഡാറ്റയിലേക്ക് ആക്‌സസ് ലഭിക്കും.</p>
      </div>
    </details>

    <details id="s4">
      <summary><h2>4. വോയ്സ് ഇൻപുട്ട്</h2></summary>
      <div class="section-content">
        <p>മൂന്നാം കക്ഷി AI സേവനങ്ങൾ ഉപയോഗിച്ച് സേവനം വോയ്‌സ് കമാൻഡുകൾ പ്രോസസ്സ് ചെയ്യുന്നു. ദയവായി ശ്രദ്ധിക്കുക:</p>
        <ul>
          <li>വോയ്‌സ് റെക്കോർഡിംഗുകൾ ഒരു കമാൻഡിന് പരമാവധി 30 സെക്കൻഡായി പരിമിതപ്പെടുത്തിയിരിക്കുന്നു</li>
          <li>ഇംഗ്ലീഷ്, ഹിന്ദി, തമിഴ്, തെലുങ്ക്, ബംഗാളി, മറാത്തി, കന്നഡ, ഗുജറാത്തി, മലയാളം, ഹിംഗ്ലീഷ് എന്നിവയുൾപ്പെടെ ഒന്നിലധികം ഭാഷകളെ ഈ സേവനം പിന്തുണയ്ക്കുന്നു</li>
          <li>ശബ്‌ദ തിരിച്ചറിയൽ കൃത്യത ഓഡിയോ നിലവാരം, പശ്ചാത്തല ശബ്‌ദം, ഉച്ചാരണം, ഭാഷയുടെ വ്യക്തത എന്നിവയെ ആശ്രയിച്ചിരിക്കുന്നു</li>
          <li>കൃത്യത സ്ഥിരീകരിക്കുന്നതിന് നിങ്ങൾ വോയ്‌സ് പ്രോസസ്സ് ചെയ്ത ഇൻവെൻ്ററി മാറ്റങ്ങൾ അവലോകനം ചെയ്യണം</li>
          <li>വോയ്‌സ് ഓഡിയോ തത്സമയം പ്രോസസ്സ് ചെയ്യപ്പെടുന്നു, അത് ശാശ്വതമായി സംഭരിക്കപ്പെടുന്നില്ല (ഞങ്ങളുടെ <a href="/privacy-policy">സ്വകാര്യതാ നയം</a> വിശദാംശങ്ങൾക്ക്)</li>
        </ul>
      </div>
    </details>

    <details id="s5">
      <summary><h2>5. സ്വീകാര്യമായ ഉപയോഗം</h2></summary>
      <div class="section-content">
        <p>ഇല്ലെന്ന് നിങ്ങൾ സമ്മതിക്കുന്നു:</p>
        <ul>
          <li>ഏതെങ്കിലും നിയമവിരുദ്ധമായ ആവശ്യങ്ങൾക്ക് സേവനം ഉപയോഗിക്കുക</li>
          <li>മറ്റ് ഉപയോക്താക്കളുടെ അക്കൗണ്ടുകളിലേക്കോ ഷോപ്പുകളിലേക്കോ അനധികൃത ആക്‌സസ് നേടാനുള്ള ശ്രമം</li>
          <li>സേവനത്തിലോ അതിൻ്റെ അടിസ്ഥാന സൗകര്യങ്ങളിലോ ഇടപെടുകയോ തടസ്സപ്പെടുത്തുകയോ ചെയ്യുക</li>
          <li>റിവേഴ്സ് എഞ്ചിനീയർ, ഡീകംപൈൽ ചെയ്യുക അല്ലെങ്കിൽ ആപ്ലിക്കേഷൻ ഡിസ്അസംബ്ലിംഗ് ചെയ്യുക</li>
          <li>സാധാരണ ഉപയോഗ പാറ്റേണുകൾക്കപ്പുറം സേവനം ആക്‌സസ് ചെയ്യാൻ ഓട്ടോമേറ്റഡ് ടൂളുകൾ ഉപയോഗിക്കുക</li>
          <li>ക്ഷണ കോഡുകൾ പൊതുവായി അല്ലെങ്കിൽ നിങ്ങളുടെ ഷോപ്പിൽ ചേരാൻ ഉദ്ദേശിക്കാത്ത വ്യക്തികളുമായി പങ്കിടുക</li>
          <li>ഒരു ഷോപ്പിനുള്ളിൽ നിങ്ങളുടെ ഐഡൻ്റിറ്റി അല്ലെങ്കിൽ റോൾ തെറ്റായി അവതരിപ്പിക്കുക</li>
        </ul>
      </div>
    </details>

    <details id="s6">
      <summary><h2>6. നിങ്ങളുടെ ഡാറ്റ</h2></summary>
      <div class="section-content">
        <p>നിങ്ങൾ സേവനത്തിൽ പ്രവേശിക്കുന്ന ബിസിനസ്സ് ഡാറ്റയുടെ (ഉൽപ്പന്ന വിവരങ്ങൾ, ഇൻവെൻ്ററി രേഖകൾ മുതലായവ) ഉടമസ്ഥാവകാശം നിങ്ങൾ നിലനിർത്തുന്നു. നിങ്ങളുടെ ഉള്ളടക്കത്തിൻ്റെ ഉടമസ്ഥാവകാശം ഞങ്ങൾ അവകാശപ്പെടുന്നില്ല.</p>
        <p>സേവനം ഉപയോഗിക്കുന്നതിലൂടെ, സേവനം നൽകുന്നതിനും മെച്ചപ്പെടുത്തുന്നതിനുമായി മാത്രം നിങ്ങളുടെ ഡാറ്റ സംഭരിക്കുന്നതിനും പ്രോസസ്സ് ചെയ്യുന്നതിനും കൈമാറുന്നതിനുമുള്ള പരിമിതമായ ലൈസൻസ് നിങ്ങൾ ഞങ്ങൾക്ക് നൽകുന്നു.</p>
        <p>നിങ്ങളുടെ ഡാറ്റ ഞങ്ങൾ എങ്ങനെ ശേഖരിക്കുന്നു, ഉപയോഗിക്കുന്നു, പരിരക്ഷിക്കുന്നു എന്നതിനെക്കുറിച്ചുള്ള വിശദാംശങ്ങൾക്ക്, ഞങ്ങളുടെ അവലോകനം ചെയ്യുക <a href="/privacy-policy">സ്വകാര്യതാ നയം</a>.</p>
      </div>
    </details>

    <details id="s7">
      <summary><h2>7. സേവന ലഭ്യത</h2></summary>
      <div class="section-content">
        <p>സേവനം എല്ലായ്‌പ്പോഴും ലഭ്യമാക്കാൻ ഞങ്ങൾ ശ്രമിക്കുന്നു, എന്നാൽ തടസ്സമില്ലാത്ത ആക്‌സസ് ഞങ്ങൾ ഉറപ്പുനൽകുന്നില്ല. ഇനിപ്പറയുന്ന കാരണങ്ങളാൽ സേവനം താൽക്കാലികമായി ലഭ്യമല്ലായിരിക്കാം:</p>
        <ul>
          <li>ആസൂത്രിതമായ അറ്റകുറ്റപ്പണികൾ അല്ലെങ്കിൽ അപ്ഡേറ്റുകൾ</li>
          <li>ഞങ്ങളുടെ നിയന്ത്രണത്തിനപ്പുറമുള്ള സാങ്കേതിക പ്രശ്നങ്ങൾ</li>
          <li>മൂന്നാം കക്ഷി സേവന തടസ്സങ്ങൾ (ആധികാരികത, വോയ്‌സ് പ്രോസസ്സിംഗ്, ഡാറ്റാബേസ് ഹോസ്റ്റിംഗ്)</li>
        </ul>
        <p>സേവനത്തിൻ്റെ പ്രവർത്തനരഹിതമായ സമയത്തിൻ്റെ ഫലമായുണ്ടാകുന്ന നഷ്ടങ്ങൾക്ക് ഞങ്ങൾ ബാധ്യസ്ഥരല്ല.</p>
      </div>
    </details>

    <details id="s8">
      <summary><h2>8. നിരക്ക് പരിധി</h2></summary>
      <div class="section-content">
        <p>ന്യായമായ ഉപയോഗവും സേവന സ്ഥിരതയും ഉറപ്പാക്കാൻ, സേവനംAPIഅഭ്യർത്ഥനകളിൽ നിരക്ക് പരിധികൾ നടപ്പിലാക്കുന്നു. ഈ പരിധികൾ കവിയുന്നത് നിങ്ങളുടെ അഭ്യർത്ഥനകൾ താൽക്കാലികമായി തടയുന്നതിന് ഇടയാക്കിയേക്കാം.</p>
      </div>
    </details>

    <details id="s9">
      <summary><h2>9. അക്കൗണ്ട് അവസാനിപ്പിക്കൽ</h2></summary>
      <div class="section-content">
        <p>നിങ്ങളുടെ അക്കൗണ്ട് എപ്പോൾ വേണമെങ്കിലും ഇല്ലാതാക്കാം <strong>Settings > Delete Account</strong> ആപ്പിൽ. അക്കൗണ്ട് ഇല്ലാതാക്കൽ ശാശ്വതവും മാറ്റാനാവാത്തതുമാണ് - നിങ്ങളുടെ എല്ലാ ഷോപ്പുകളും ഇൻവെൻ്ററി ഡാറ്റയും ഓഡിറ്റ് ലോഗുകളും മുൻഗണനകളും ശാശ്വതമായി നീക്കംചെയ്യപ്പെടും.</p>
        <p>ഈ നിബന്ധനകൾ ലംഘിക്കുന്നതോ അധിക്ഷേപകരമായ പെരുമാറ്റത്തിൽ ഏർപ്പെടുന്നതോ ആയ അക്കൗണ്ടുകൾ സസ്പെൻഡ് ചെയ്യാനോ അവസാനിപ്പിക്കാനോ ഉള്ള അവകാശം ഞങ്ങളിൽ നിക്ഷിപ്തമാണ്.</p>
      </div>
    </details>

    <details id="s10">
      <summary><h2>10. ബൗദ്ധിക സ്വത്ത്</h2></summary>
      <div class="section-content">
        <p>Samaan-Bolആപ്ലിക്കേഷൻ, അതിൻ്റെ ഡിസൈൻ, കോഡ്, ബ്രാൻഡിംഗ്, ഡോക്യുമെൻ്റേഷൻ എന്നിവ ഉൾപ്പെടെ, ഞങ്ങളുടെ ബൗദ്ധിക സ്വത്താണ്. ഞങ്ങളുടെ രേഖാമൂലമുള്ള അനുമതിയില്ലാതെ ആപ്ലിക്കേഷനെ അടിസ്ഥാനമാക്കി നിങ്ങൾക്ക് പകർത്താനോ പരിഷ്ക്കരിക്കാനോ വിതരണം ചെയ്യാനോ അല്ലെങ്കിൽ ഡെറിവേറ്റീവ് സൃഷ്ടികൾ സൃഷ്ടിക്കാനോ പാടില്ല.</p>
      </div>
    </details>

    <details id="s11">
      <summary><h2>11. വാറൻ്റികളുടെ നിരാകരണം</h2></summary>
      <div class="section-content">
        <p>ഏതെങ്കിലും തരത്തിലുള്ള വാറൻ്റികളില്ലാതെ "ഉള്ളത് പോലെ", "ലഭ്യം" എന്നിങ്ങനെയാണ് സേവനം നൽകുന്നത്. ഇനിപ്പറയുന്നവയുടെ വാറൻ്റി ഞങ്ങൾ പ്രത്യേകം നിരാകരിക്കുന്നു:</p>
        <ul>
          <li>ഒരു പ്രത്യേക ആവശ്യത്തിനുള്ള വ്യാപാരക്ഷമത അല്ലെങ്കിൽ ഫിറ്റ്നസ്</li>
          <li>ശബ്‌ദ തിരിച്ചറിയലിൻ്റെ കൃത്യത അല്ലെങ്കിൽ AI സൃഷ്‌ടിച്ച നിർദ്ദേശങ്ങൾ</li>
          <li>തടസ്സമില്ലാത്ത അല്ലെങ്കിൽ പിശകില്ലാത്ത പ്രവർത്തനം</li>
        </ul>
        <p>വോയ്‌സ് അടിസ്ഥാനമാക്കിയുള്ള ഇൻവെൻ്ററി പ്രവർത്തനങ്ങൾ സഹായങ്ങളാണ് - നിർണായക സ്റ്റോക്ക് തീരുമാനങ്ങൾ നിങ്ങൾ സ്വതന്ത്രമായി പരിശോധിക്കണം.</p>
      </div>
    </details>

    <details id="s12">
      <summary><h2>12. ബാധ്യതയുടെ പരിമിതി</h2></summary>
      <div class="section-content">
        <p>നിയമം അനുവദനീയമായ പരമാവധി പരിധി വരെ, നിങ്ങളുടെ സേവനത്തിൻ്റെ ഉപയോഗത്തിൽ നിന്ന് ഉണ്ടാകുന്ന പരോക്ഷമായ, ആകസ്മികമായ, പ്രത്യേകമായ, അനന്തരഫലമായ അല്ലെങ്കിൽ ശിക്ഷാപരമായ നാശനഷ്ടങ്ങൾക്ക് ഞങ്ങൾ ബാധ്യസ്ഥരായിരിക്കില്ല, എന്നാൽ ഇതിൽ മാത്രം പരിമിതപ്പെടുത്താതെ:</p>
        <ul>
          <li>വോയ്‌സ് തിരിച്ചറിയൽ പിശകുകളുടെ ഫലമായുണ്ടാകുന്ന ഇൻവെൻ്ററി പൊരുത്തക്കേടുകൾ</li>
          <li>സർവീസ് മുടങ്ങിയതിനാൽ ബിസിനസ്സ് നഷ്ടം</li>
          <li>ഞങ്ങളുടെ സ്റ്റാൻഡേർഡ് ബാക്കപ്പ് നടപടിക്രമങ്ങൾ കവർ ചെയ്യുന്നതിലും അപ്പുറമുള്ള ഡാറ്റ നഷ്ടം</li>
        </ul>
      </div>
    </details>

    <details id="s13">
      <summary><h2>13. ഈ നിബന്ധനകളിലെ മാറ്റങ്ങൾ</h2></summary>
      <div class="section-content">
        <p>ഞങ്ങൾ ഈ നിബന്ധനകൾ കാലാകാലങ്ങളിൽ അപ്ഡേറ്റ് ചെയ്തേക്കാം. ഞങ്ങൾ ചെയ്യുമ്പോൾ, ഈ പേജിൻ്റെ മുകളിലുള്ള "പ്രാബല്യത്തിലുള്ള തീയതി" ഞങ്ങൾ അപ്ഡേറ്റ് ചെയ്യും. മാറ്റങ്ങൾക്ക് ശേഷവും സേവനത്തിൻ്റെ തുടർച്ചയായ ഉപയോഗം അപ്ഡേറ്റ് ചെയ്ത നിബന്ധനകൾ അംഗീകരിക്കുന്നു.</p>
      </div>
    </details>

    <details id="s14">
      <summary><h2>14. ഭരണ നിയമം</h2></summary>
      <div class="section-content">
        <p>ഈ നിബന്ധനകൾ ഇന്ത്യയുടെ നിയമങ്ങൾക്കനുസൃതമായി നിയന്ത്രിക്കപ്പെടുകയും വ്യാഖ്യാനിക്കുകയും ചെയ്യും. ഈ നിബന്ധനകളിൽ നിന്നോ സേവനത്തിൽ നിന്നോ ഉണ്ടാകുന്ന തർക്കങ്ങൾ ഇന്ത്യയിലെ കോടതികളുടെ പ്രത്യേക അധികാരപരിധിക്ക് വിധേയമായിരിക്കും.</p>
      </div>
    </details>

    <details id="s15">
      <summary><h2>15. ഞങ്ങളെ ബന്ധപ്പെടുക</h2></summary>
      <div class="section-content">
        <p>ഈ നിബന്ധനകളെക്കുറിച്ച് നിങ്ങൾക്ക് എന്തെങ്കിലും ചോദ്യങ്ങളുണ്ടെങ്കിൽ, ദയവായി ഞങ്ങളെ ബന്ധപ്പെടുക:</p>
        <p><strong>Email:</strong> <a href="mailto:meetslimshady07@gmail.com">meetslimshady07@gmail.com</a></p>
      </div>
    </details>

    <p class="copyright">© 2026Samaan-Bol. എല്ലാ അവകാശങ്ങളും നിക്ഷിപ്തം.</p>
  </div>

  <button class="back-to-top" id="backToTop" aria-label="Back to top">↑</button>`,
  },
  "pa": {
    home: `<!-- Three.js background canvas -->
<canvas id="bgCanvas"></canvas>

<!-- Aurora ambient background (WebGL fallback) -->
<div class="aurora-bg"><div class="aurora-orb"></div></div>

<!-- Scroll progress indicator -->
<div class="scroll-progress" id="scrollProgress"></div>

<!-- ═══ NAVIGATION ═══ -->
<nav id="nav">
  <div class="container">
    <div class="nav-inner">
      <a href="#" class="logo">
        <div class="logo-mark"><svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><defs><mask id="stencil-nav"><rect x="0" y="0" width="100" height="100" fill="white"/><rect x="24" y="18" width="52" height="8" rx="4" fill="black"/><rect x="38" y="18" width="24" height="36" rx="12" fill="black"/><path d="M 28 42 A 22 22 0 0 0 72 42" fill="none" stroke="black" stroke-width="8" stroke-linecap="round"/><rect x="46" y="72" width="8" height="10" rx="4" fill="black"/><rect x="36" y="32" width="28" height="4" fill="white"/><rect x="36" y="44" width="28" height="4" fill="white"/></mask></defs><circle cx="50" cy="50" r="50" fill="#ea580c" mask="url(#stencil-nav)"/></svg></div>
        <div class="logo-text">ਸਮਾਨ<span>ਬੋਲ</span></div>
      </a>
      <ul class="nav-links">
        <li><a href="#how">ਇਹ ਕਿਵੇਂ ਕੰਮ ਕਰਦਾ ਹੈ</a></li>
        <li><a href="#features">ਵਿਸ਼ੇਸ਼ਤਾਵਾਂ</a></li>
        <li><a href="#ai">ਏਆਈ ਇੰਟੈਲੀਜੈਂਸ</a></li>
        <li><a href="#languages">ਭਾਸ਼ਾਵਾਂ</a></li>
        <li><a href="https://apps.apple.com/in/app/samaan-bol/id6759739444" class="nav-cta">ਐਪ ਡਾਊਨਲੋਡ ਕਰੋ</a></li>
      </ul>
      <button class="mobile-menu-btn" aria-label="Menu">☰</button>
    </div>
  </div>
</nav>

<!-- ═══ HERO ═══ -->
<section class="hero">
  <div class="container">
    <div class="hero-grid">
      <div>
        <div class="hero-eyebrow">ਭਾਰਤੀ ਰਿਟੇਲ ਲਈ ਵੌਇਸ-ਪਹਿਲੀ ਵਸਤੂ ਸੂਚੀ</div>
        <h1 class="hero-text-reveal">
          <span class="hindi-line hindi">बोल के सँभालो अपना बिज़नेस</span>
          <span class="hero-text-main">ਆਪਣੀ ਦੁਕਾਨ ਦਾ ਪ੍ਰਬੰਧਨ ਕਰੋ<br>ਸਿਰਫ਼ ਤੁਹਾਡੀ ਆਵਾਜ਼ ਨਾਲ</span>
        </h1>
        <p class="hero-sub">
          ਵਿੱਚ ਬੋਲੋ <span class="hero-rotate"><span class="hero-rotate-word active">ਹਿੰਦੀ</span><span class="hero-rotate-word">ਬੰਗਾਲੀ</span><span class="hero-rotate-word">ਤਾਮਿਲ</span><span class="hero-rotate-word">ਤੇਲਗੂ</span><span class="hero-rotate-word">ਮਰਾਠੀ</span><span class="hero-rotate-word">ਅੰਗਰੇਜ਼ੀ</span></span>, ਜਾਂ 10 ਭਾਰਤੀ ਭਾਸ਼ਾਵਾਂ ਵਿੱਚੋਂ ਕੋਈ ਵੀ।
          Samaan-Bol ਦਾ AI ਤੁਹਾਡੀ ਕਮਾਂਡ ਨੂੰ ਸਮਝਦਾ ਹੈ, ਤੁਹਾਡੀ ਵਸਤੂ ਸੂਚੀ ਨੂੰ ਅੱਪਡੇਟ ਕਰਦਾ ਹੈ,
          ਅਤੇ ਤੁਹਾਡੇ ਕਾਰੋਬਾਰ ਨੂੰ ਚੱਲਦਾ ਰੱਖਦਾ ਹੈ — ਹੈਂਡਸ-ਫ੍ਰੀ।
        </p>
        <div class="hero-actions">
          <a href="#download" class="btn-primary">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            ਮੁਫ਼ਤ ਡਾਊਨਲੋਡ ਕਰੋ
          </a>
          <a href="#how" class="btn-secondary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            ਇਸ ਨੂੰ ਐਕਸ਼ਨ ਵਿੱਚ ਦੇਖੋ
          </a>
        </div>
        <div class="hero-stats">
          <div class="hero-stat">
            <div class="hero-stat-number">11</div>
            <div class="hero-stat-label">ਭਾਸ਼ਾਵਾਂ ਸਮਰਥਿਤ ਹਨ</div>
          </div>
          <div class="hero-stat">
            <div class="hero-stat-number">50K+</div>
            <div class="hero-stat-label">ਆਈਟਮਾਂ ਨੂੰ ਰੋਜ਼ਾਨਾ ਟਰੈਕ ਕੀਤਾ ਜਾਂਦਾ ਹੈ</div>
          </div>
          <div class="hero-stat">
            <div class="hero-stat-number">2 ਮਿੰਟ</div>
            <div class="hero-stat-label">ਸੈੱਟਅੱਪ ਸਮਾਂ</div>
          </div>
        </div>
      </div>

      <div class="hero-visual">
        <!-- Floating cards (z-index 10 — in FRONT of phone) -->
        <div class="float-card float-card--voice">
          <div class="float-card-icon float-card-icon--voice"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg></div>
          <p><strong class="hindi">"चावल 5 किलो जोड़ दो"</strong></p>
          <p style="margin-top:6px; font-size:12px; color:var(--success);">✓ Basmati Rice — 18 → 23 ਕਿਲੋਗ੍ਰਾਮ</p>
        </div>

        <div class="float-card float-card--alert">
          <div class="float-card-icon float-card-icon--alert"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg></div>
          <p><strong>ਘੱਟ ਸਟਾਕ ਚੇਤਾਵਨੀ</strong></p>
          <p style="margin-top:4px; font-size:12px;">ਆਟਾ 3 ਦਿਨਾਂ ਵਿੱਚ ਖਤਮ ਹੋ ਸਕਦਾ ਹੈ</p>
        </div>

        <!-- Phone mockup — mirrors actual app UI -->
        <div class="phone-frame">
          <div class="phone-notch"></div>
          <div class="phone-screen">
            <div class="phone-status-bar">
              <span>9:41</span>
              <span style="display:flex; gap:4px; align-items:center;">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z"/></svg>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><rect x="17" y="4" width="4" height="16" rx="1"/><rect x="11" y="8" width="4" height="12" rx="1"/><rect x="5" y="12" width="4" height="8" rx="1"/></svg>
                <svg width="14" height="12" viewBox="0 0 28 14" fill="currentColor"><rect x="0" y="1" width="22" height="12" rx="2" stroke="currentColor" fill="none" stroke-width="1.5"/><rect x="24" y="4.5" width="3" height="5" rx="1"/><rect x="2" y="3" width="14" height="8" rx="1"/></svg>
              </span>
            </div>

            <!-- Header: greeting + bell -->
            <div class="phone-header">
              <div>
                <div class="phone-greeting">ਸ਼ੁਭ ਸਵੇਰ! 👋</div>
                <div class="phone-subtext">Priya General Store</div>
              </div>
              <div class="phone-bell">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B6B70" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                <div class="phone-bell-badge">3</div>
              </div>
            </div>

            <!-- Search bar with mic icon -->
            <div class="phone-search">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4A4A50" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <span class="phone-search-text">ਉਤਪਾਦ ਖੋਜੋ...</span>
              <div class="phone-search-mic">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0D0D12" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/></svg>
              </div>
            </div>

            <!-- 2x2 Stats grid -->
            <div class="phone-stats-grid">
              <div class="phone-stat-card phone-stat-card--total">
                <div class="phone-stat-number">142</div>
                <div class="phone-stat-label">ਕੁੱਲ ਆਈਟਮਾਂ</div>
              </div>
              <div class="phone-stat-card phone-stat-card--low">
                <div class="phone-stat-number" style="color:var(--warning);">8</div>
                <div class="phone-stat-label">ਘੱਟ ਸਟਾਕ</div>
              </div>
              <div class="phone-stat-card phone-stat-card--out">
                <div class="phone-stat-number" style="color:var(--danger);">2</div>
                <div class="phone-stat-label">ਸਟਾਕ ਤੋਂ ਬਾਹਰ</div>
              </div>
              <div class="phone-stat-card phone-stat-card--activity">
                <div class="phone-stat-number" style="color:var(--success);">23</div>
                <div class="phone-stat-label">ਅੱਜ ਅੱਪਡੇਟ ਕੀਤਾ ਗਿਆ</div>
              </div>
            </div>

            <!-- Filter chips -->
            <div class="phone-filter-row">
              <span class="phone-chip phone-chip--active">ਸਾਰੇ</span>
              <span class="phone-chip">ਘੱਟ ਸਟਾਕ</span>
              <span class="phone-chip">ਬਾਹਰ</span>
              <span class="phone-chip">ਮਿਆਦ ਪੁੱਗਣ</span>
            </div>

            <!-- Product cards -->
            <div class="phone-product">
              <div class="phone-product-icon" style="background:rgba(255,181,71,0.12);">🍚</div>
              <div class="phone-product-info">
                <div class="phone-product-name">Basmati Rice</div>
                <div class="phone-product-meta">ਅਨਾਜ · 2 ਮਿੰਟ ਪਹਿਲਾਂ ਅੱਪਡੇਟ ਕੀਤਾ ਗਿਆ</div>
              </div>
              <div class="phone-product-qty">
                <div class="phone-product-qty-num">23</div>
                <div class="phone-product-qty-unit">ਕਿਲੋ</div>
              </div>
            </div>

            <div class="phone-product">
              <div class="phone-product-icon" style="background:rgba(255,107,0,0.12);">🫒</div>
              <div class="phone-product-info">
                <div class="phone-product-name">Aashirvaad Atta</div>
                <div class="phone-product-meta">ਆਟਾ · 1 ਘੰਟੇ ਪਹਿਲਾਂ ਅੱਪਡੇਟ ਕੀਤਾ ਗਿਆ</div>
                <div class="phone-product-status phone-product-status--low">ਘੱਟ ਸਟਾਕ</div>
              </div>
              <div class="phone-product-qty">
                <div class="phone-product-qty-num" style="color:var(--warning);">3</div>
                <div class="phone-product-qty-unit">ਕਿਲੋ</div>
              </div>
            </div>

            <div class="phone-product">
              <div class="phone-product-icon" style="background:rgba(50,213,131,0.1);">🥛</div>
              <div class="phone-product-info">
                <div class="phone-product-name">Amul Toned Milk</div>
                <div class="phone-product-meta">Dairy · 3 ਘੰਟੇ ਪਹਿਲਾਂ ਅੱਪਡੇਟ ਕੀਤਾ ਗਿਆ</div>
              </div>
              <div class="phone-product-qty">
                <div class="phone-product-qty-num">40</div>
                <div class="phone-product-qty-unit">pkt</div>
              </div>
            </div>

          </div>
          <!-- Floating mic FAB (like the real app) -->
          <div class="phone-fab">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0D0D12" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/></svg>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ═══ HOW IT WORKS ═══ -->
<section class="how-it-works" id="how">
  <div class="container">
    <div class="reveal">
      <div class="section-label">ਇਹ ਕਿਵੇਂ ਕੰਮ ਕਰਦਾ ਹੈ</div>
      <h2 class="section-heading">ਤਿੰਨ ਕਦਮ. ਕੋਈ ਸਿਖਲਾਈ ਦੀ ਲੋੜ ਨਹੀਂ.</h2>
      <p class="section-sub">ਬਸ ਆਪਣੀ ਭਾਸ਼ਾ ਵਿੱਚ ਕੁਦਰਤੀ ਤੌਰ 'ਤੇ ਬੋਲੋ - AI ਬਾਕੀ ਨੂੰ ਸੰਭਾਲਦਾ ਹੈ।</p>
    </div>
    <div class="steps-grid">
      <div class="step reveal reveal-delay-1">
        <div class="step-number">01</div>
        <h3>ਆਪਣਾ ਹੁਕਮ ਬੋਲੋ</h3>
        <p>ਮਾਈਕ ਨੂੰ ਟੈਪ ਕਰੋ ਅਤੇ ਕਹੋ ਕਿ ਤੁਹਾਨੂੰ ਕੀ ਚਾਹੀਦਾ ਹੈ — ਸਟਾਕ ਸ਼ਾਮਲ ਕਰੋ, ਮਾਤਰਾ ਦੀ ਜਾਂਚ ਕਰੋ, ਇੱਕ ਖਰੀਦ ਸੂਚੀ ਬਣਾਓ। ਕਿਸੇ ਵੀ ਭਾਰਤੀ ਭਾਸ਼ਾ ਵਿੱਚ।</p>
        <div class="step-example">
          <div class="hindi">"चावल 5 किलो जोड़ दो"</div>
          <div class="english">5 ਕਿਲੋ ਚੌਲ ਪਾਓ</div>
        </div>
      </div>
      <div class="step reveal reveal-delay-2">
        <div class="step-number">02</div>
        <h3>AI ਤੁਰੰਤ ਸਮਝਦਾ ਹੈ</h3>
        <p>Sarvam AI ਤੁਹਾਡੀ ਬੋਲੀ ਦੀ ਪ੍ਰਕਿਰਿਆ ਕਰਦਾ ਹੈ, ਉਤਪਾਦ, ਮਾਤਰਾ ਅਤੇ ਕਿਰਿਆ ਨੂੰ ਕੱਢਦਾ ਹੈ — ਫਿਰ ਇਸਨੂੰ ਤੁਹਾਡੀ ਵਸਤੂ ਸੂਚੀ ਨਾਲ ਮੇਲ ਖਾਂਦਾ ਹੈ।</p>
        <div class="step-example">
          <div style="display:flex; gap:12px; flex-wrap:wrap;">
            <span style="background:var(--saffron-tint); color:var(--saffron); padding:4px 10px; border-radius:4px; font-size:12px;">ਚਾਵਲ → ਬਾਸਮਤੀ 🍚</span>
            <span style="background:rgba(50,213,131,0.1); color:var(--success); padding:4px 10px; border-radius:4px; font-size:12px;">+5 ਕਿਲੋ</span>
            <span style="background:rgba(99,102,241,0.1); color:#818CF8; padding:4px 10px; border-radius:4px; font-size:12px;">✓ ਸ਼ਾਮਲ ਕਰੋ</span>
          </div>
        </div>
      </div>
      <div class="step reveal reveal-delay-3">
        <div class="step-number">03</div>
        <h3>ਵਸਤੂ ਸੂਚੀ ਅੱਪਡੇਟ ਕੀਤੀ ਗਈ, ਪੁਸ਼ਟੀ ਕੀਤੀ ਗਈ</h3>
        <p>ਤੁਹਾਡਾ ਸਟਾਕ ਤੁਰੰਤ ਅੱਪਡੇਟ ਕੀਤਾ ਜਾਂਦਾ ਹੈ। ਤੁਸੀਂ ਆਪਣੀ ਭਾਸ਼ਾ ਵਿੱਚ ਇੱਕ ਵੌਇਸ ਪੁਸ਼ਟੀ ਸੁਣਦੇ ਹੋ — ਕਿਸੇ ਸਕ੍ਰੀਨ ਦੀ ਲੋੜ ਨਹੀਂ।</p>
        <div class="step-example">
          <div class="hindi">"हो गया — बासमती चावल अब 23 किलो है"</div>
          <div class="english">ਹੋ ਗਿਆ - ਬਾਸਮਤੀ ਚੌਲ ਹੁਣ 23 ਕਿਲੋ ਹੋ ਗਿਆ ਹੈ</div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ═══ FEATURES ═══ -->
<section class="features" id="features" style="position:relative; overflow:hidden;">
  <div class="orb orb--saffron" style="top: -100px; right: -150px;"></div>
  <div class="container">
    <div class="reveal">
      <div class="section-label">ਵਿਸ਼ੇਸ਼ਤਾਵਾਂ</div>
      <h2 class="section-heading">ਤੁਹਾਡੀ ਦੁਕਾਨ ਨੂੰ ਲੋੜੀਂਦੀ ਹਰ ਚੀਜ਼। ਅਜਿਹਾ ਕੁਝ ਨਹੀਂ ਹੁੰਦਾ।</h2>
    </div>
    <div class="features-grid">
      <div class="feature feature--hero reveal reveal-delay-1">
        <div class="feature-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg></div>
        <h3>ਵੌਇਸ-ਪਹਿਲੀ ਵਸਤੂ ਸੂਚੀ</h3>
        <p>ਕੁਦਰਤੀ ਤੌਰ 'ਤੇ ਬੋਲ ਕੇ ਸਟਾਕ ਨੂੰ ਸ਼ਾਮਲ ਕਰੋ, ਹਟਾਓ ਜਾਂ ਚੈੱਕ ਕਰੋ। ਕੋਈ ਟਾਈਪਿੰਗ ਨਹੀਂ, ਮੀਨੂ ਰਾਹੀਂ ਕੋਈ ਖੋਜ ਨਹੀਂ। ਬੱਸ ਆਪਣੀ ਭਾਸ਼ਾ ਵਿੱਚ ਬੋਲੋ ਅਤੇ AI ਬਾਕੀ ਨੂੰ ਸੰਭਾਲਦਾ ਹੈ — ਤੁਹਾਡੀ ਕਮਾਂਡ ਨੂੰ ਸਮਝਣ ਤੋਂ ਲੈ ਕੇ ਤੁਹਾਡੇ ਸਟਾਕ ਨੂੰ ਰੀਅਲ ਟਾਈਮ ਵਿੱਚ ਅਪਡੇਟ ਕਰਨ ਤੱਕ।</p>
      </div>
      <div class="feature reveal reveal-delay-2">
        <div class="feature-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg></div>
        <h3>10 ਭਾਰਤੀ ਭਾਸ਼ਾਵਾਂ + ਅੰਗਰੇਜ਼ੀ</h3>
        <p>ਹਿੰਦੀ, ਬੰਗਾਲੀ, ਤਾਮਿਲ, ਤੇਲਗੂ, ਮਰਾਠੀ, ਕੰਨੜ, ਗੁਜਰਾਤੀ, ਮਲਿਆਲਮ, ਪੰਜਾਬੀ ਅਤੇ ਉੜੀਆ — Sarvam AI ਦੁਆਰਾ ਸੰਚਾਲਿਤ।</p>
      </div>
      <div class="feature reveal reveal-delay-3">
        <div class="feature-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></div>
        <h3>ਟੀਮ ਦੀਆਂ ਭੂਮਿਕਾਵਾਂ</h3>
        <p>Owner, Manager, ਅਤੇ Helper ਦਾਣੇਦਾਰ ਅਨੁਮਤੀਆਂ ਦੇ ਨਾਲ ਰੋਲ। ਇੱਕੋ ਪੰਨੇ 'ਤੇ ਹਰ ਕੋਈ, ਸੁਰੱਖਿਅਤ ਢੰਗ ਨਾਲ।</p>
      </div>
      <div class="feature reveal reveal-delay-1">
        <div class="feature-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/><path d="M9 14l2 2 4-4"/></svg></div>
        <h3>ਸਮਾਰਟ ਖਰੀਦ ਸੂਚੀਆਂ</h3>
        <p>ਕੀ ਘੱਟ ਚੱਲ ਰਿਹਾ ਹੈ ਦੇ ਆਧਾਰ 'ਤੇ ਸਵੈ-ਤਿਆਰ ਰੀਸਟੌਕਿੰਗ ਸੂਚੀਆਂ। ਵਟਸਐਪ ਰਾਹੀਂ ਸਪਲਾਇਰਾਂ ਨਾਲ ਸਾਂਝਾ ਕਰੋ।</p>
      </div>
      <div class="feature reveal reveal-delay-2">
        <div class="feature-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></svg></div>
        <h3>ਗਤੀਵਿਧੀ ਆਡਿਟ ਲੌਗ</h3>
        <p>ਹਰ ਤਬਦੀਲੀ ਨੂੰ ਕਿਸ ਨਾਲ, ਕੀ, ਅਤੇ ਕਦੋਂ ਨਾਲ ਟਰੈਕ ਕੀਤਾ ਜਾਂਦਾ ਹੈ। ਤੁਹਾਡੀ ਟੀਮ ਵਿੱਚ ਪੂਰੀ ਪਾਰਦਰਸ਼ਤਾ।</p>
      </div>
      <div class="feature reveal reveal-delay-3">
        <div class="feature-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><line x1="7" y1="12" x2="17" y2="12"/><line x1="7" y1="8" x2="17" y2="8"/><line x1="7" y1="16" x2="17" y2="16"/></svg></div>
        <h3>ਬਾਰਕੋਡ ਸਕੈਨਿੰਗ</h3>
        <p>ਉਤਪਾਦਾਂ ਨੂੰ ਸ਼ਾਮਲ ਕਰਨ ਜਾਂ ਤੁਰੰਤ ਦੇਖਣ ਲਈ ਸਕੈਨ ਕਰੋ। ਭਾਰਤੀ ਅਤੇ ਅੰਤਰਰਾਸ਼ਟਰੀ ਬਾਰਕੋਡਾਂ ਨਾਲ ਕੰਮ ਕਰਦਾ ਹੈ।</p>
      </div>
    </div>
  </div>
</section>

<!-- ═══ AI INTELLIGENCE ═══ -->
<section class="ai-section" id="ai" style="overflow:hidden;">
  <div class="orb orb--indigo" style="bottom: -100px; left: -100px;"></div>
  <div class="orb orb--green" style="top: 200px; right: -80px;"></div>
  <div class="container">
    <div class="ai-header reveal">
      <div class="section-label">ਏਆਈ ਇੰਟੈਲੀਜੈਂਸ</div>
      <h2 class="section-heading">
        <span class="hindi" style="display:block; color:var(--saffron); font-size:clamp(22px,2.8vw,32px); font-weight:500; margin-bottom:8px;">ਦਾਰ AI ਜੋ ਤੁਹਾਡੇ ਬਿਜ਼ਨਸ ਨੂੰ ਸਮਝਾਵੇ</span>
        ਸਿਰਫ਼ ਟਰੈਕਿੰਗ ਹੀ ਨਹੀਂ - ਤੁਹਾਡੀ ਦੁਕਾਨ ਦਾ ਪਹਿਲਾ ਡਿਜੀਟਲ ਦਿਮਾਗ
      </h2>
      <p class="section-sub">Samaan-Bol ਸਿਰਫ਼ ਉਹੀ ਰਿਕਾਰਡ ਨਹੀਂ ਕਰਦਾ ਜੋ ਤੁਸੀਂ ਇਸਨੂੰ ਦੱਸਦੇ ਹੋ। ਇਹ ਤੁਹਾਡੇ ਪੈਟਰਨਾਂ ਨੂੰ ਸਿੱਖਦਾ ਹੈ, ਤੁਹਾਡੀਆਂ ਲੋੜਾਂ ਦੀ ਭਵਿੱਖਬਾਣੀ ਕਰਦਾ ਹੈ, ਅਤੇ ਸਮੱਸਿਆਵਾਂ ਹੋਣ ਤੋਂ ਪਹਿਲਾਂ ਤੁਹਾਨੂੰ ਸੁਚੇਤ ਕਰਦਾ ਹੈ।</p>
    </div>

    <div class="ai-blocks">
      <!-- Predictive Stock -->
      <div class="ai-block reveal">
        <div class="ai-block-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg></div>
        <div class="ai-block-tag ai-block-tag--predict">ਭਵਿੱਖਬਾਣੀ ਸਟਾਕ</div>
        <h3>ਜਾਣਦਾ ਹੈ ਕਿ ਤੁਹਾਨੂੰ ਅਜਿਹਾ ਕਰਨ ਤੋਂ ਪਹਿਲਾਂ ਕੀ ਚਾਹੀਦਾ ਹੈ</h3>
        <p>AI ਤੁਹਾਡੇ ਵੇਚਣ ਦੇ ਪੈਟਰਨ ਸਿੱਖਦਾ ਹੈ — ਰੋਜ਼ਾਨਾ, ਹਫਤਾਵਾਰੀ, ਮੌਸਮੀ। ਇਹ ਭਵਿੱਖਬਾਣੀ ਕਰਦਾ ਹੈ ਕਿ ਆਈਟਮਾਂ ਕਦੋਂ ਘੱਟ ਚੱਲਣਗੀਆਂ ਅਤੇ ਦਿਨ ਪਹਿਲਾਂ ਹੀ ਰੀਸਟੌਕ ਕਰਨ ਦਾ ਸੁਝਾਅ ਦਿੰਦੀਆਂ ਹਨ।</p>
        <div class="ai-voice-example">
          <div class="voice-bubble">
            <div class="voice-bubble-avatar voice-bubble-avatar--ai"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg></div>
            <div class="voice-bubble-content">
              <div class="hindi">"ਆਪਕਾ ਆਟਾ 3 ਦਿਨ ਮੇਂ ਖਾਤਮ ਹੋ ਸਕਤਾ ਹੈ - ਹਫਤੇ ਕੀ ਬਿਕਰੀ ਕੇ ਹਿਸਾਬ ਸੇ"</div>
              <div class="translation">ਤੁਹਾਡਾ ਆਟਾ 3 ਦਿਨਾਂ ਵਿੱਚ ਖਤਮ ਹੋ ਸਕਦਾ ਹੈ — ਹਫਤਾਵਾਰੀ ਵਿਕਰੀ ਦੇ ਆਧਾਰ 'ਤੇ</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Smart Alerts -->
      <div class="ai-block reveal">
        <div class="ai-block-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg></div>
        <div class="ai-block-tag ai-block-tag--alert">ਸਮਾਰਟ ਅਲਰਟ</div>
        <h3>ਚੇਤਾਵਨੀਆਂ ਜੋ ਤੁਹਾਡੀ ਭਾਸ਼ਾ ਬੋਲਦੀਆਂ ਹਨ</h3>
        <p>ਮਿਆਦ ਪੁੱਗਣ ਦੀਆਂ ਚੇਤਾਵਨੀਆਂ, ਹੌਲੀ-ਹੌਲੀ ਚੱਲਦੇ ਸਟਾਕ ਖੋਜ, ਅਤੇ ਕੀਮਤ ਦੇ ਉਤਰਾਅ-ਚੜ੍ਹਾਅ ਦੀਆਂ ਚੇਤਾਵਨੀਆਂ — ਤੁਹਾਡੀ ਪਸੰਦੀਦਾ ਭਾਸ਼ਾ ਵਿੱਚ ਵੌਇਸ ਸੂਚਨਾਵਾਂ ਦੇ ਰੂਪ ਵਿੱਚ ਪ੍ਰਦਾਨ ਕੀਤੀਆਂ ਜਾਂਦੀਆਂ ਹਨ।</p>
        <div class="ai-voice-example">
          <div class="voice-bubble">
            <div class="voice-bubble-avatar voice-bubble-avatar--ai"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg></div>
            <div class="voice-bubble-content">
              <div class="hindi">"Parle-G ਕੇ 12 ਪੈਕੇਟ 5 ਦਿਨ ਮੇਂ ਐਕਸਪਾਇਰ ਹੋ ਰਹੇ ਹਨ - ਛੂਟ ਲਗਾਨਾ ਚਾਹੀਂ?"</div>
              <div class="translation">12 Parle-G ਪੈਕੇਟ ਦੀ ਮਿਆਦ 5 ਦਿਨਾਂ ਵਿੱਚ ਖਤਮ ਹੋ ਰਹੀ ਹੈ — ਕੀ ਛੂਟ ਜੋੜਨਾ ਚਾਹੁੰਦੇ ਹੋ?</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Voice Analytics -->
      <div class="ai-block reveal">
        <div class="ai-block-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg></div>
        <div class="ai-block-tag ai-block-tag--insight">ਵੌਇਸ ਵਿਸ਼ਲੇਸ਼ਣ</div>
        <h3>ਆਪਣੀ ਦੁਕਾਨ ਨੂੰ ਇੱਕ ਸਵਾਲ ਪੁੱਛੋ - ਇਹ ਜਵਾਬ ਦਿੰਦਾ ਹੈ</h3>
        <p>ਆਪਣੇ ਕਾਰੋਬਾਰ ਬਾਰੇ ਕੁਦਰਤੀ ਭਾਸ਼ਾ ਵਿੱਚ ਕੁਝ ਵੀ ਪੁੱਛੋ। AI ਬੋਲੇ ​​ਗਏ ਜਵਾਬਾਂ ਅਤੇ ਆਨ-ਸਕ੍ਰੀਨ ਡੇਟਾ ਨਾਲ ਜਵਾਬ ਦਿੰਦਾ ਹੈ।</p>
        <div class="ai-voice-example">
          <div class="voice-bubble">
            <div class="voice-bubble-avatar voice-bubble-avatar--user"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>
            <div class="voice-bubble-content">
              <div class="hindi">"ਪਿਛਲੇ ਹਫਤੇ ਸਬਸੇ ਜ਼ਿਆਦਾ ਕਿਆ ਬਿਕਾ?"</div>
              <div class="translation">ਪਿਛਲੇ ਹਫ਼ਤੇ ਸਭ ਤੋਂ ਵੱਧ ਕੀ ਵਿਕਿਆ?</div>
            </div>
          </div>
          <div class="voice-bubble">
            <div class="voice-bubble-avatar voice-bubble-avatar--ai"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg></div>
            <div class="voice-bubble-content">
              <div class="hindi">"ਪਿਛਲੇ ਹਫ਼ਤੇ ਸਬਸੇ ਜ਼ਿਆਦਾ ਚਾਵਲ ਬੀਕਾ - 48 ਕਿੱਲੋ"</div>
              <div class="translation">ਚਾਵਲ ਪਿਛਲੇ ਹਫ਼ਤੇ ਸਭ ਤੋਂ ਵੱਧ ਵਿਕਿਆ - 48 ਕਿਲੋ</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Team Intelligence -->
      <div class="ai-block reveal">
        <div class="ai-block-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>
        <div class="ai-block-tag ai-block-tag--team">ਟੀਮ ਇੰਟੈਲੀਜੈਂਸ</div>
        <h3>ਜਾਣੋ ਕਿ ਤੁਹਾਡੀ ਟੀਮ ਕੀ ਕਰ ਰਹੀ ਹੈ</h3>
        <p>AI-ਸੰਚਾਲਿਤ ਵਿਗਾੜ ਖੋਜ ਅਸਾਧਾਰਨ ਵਸਤੂ ਸੂਚੀ ਤਬਦੀਲੀਆਂ ਨੂੰ ਫਲੈਗ ਕਰਦੀ ਹੈ। ਸਮਾਰਟ ਸੰਖੇਪ ਦਿਖਾਉਂਦੇ ਹਨ ਕਿ ਕਿਸਨੇ ਕੀ ਅੱਪਡੇਟ ਕੀਤਾ, ਅਤੇ ਕੀ ਸੁਧਾਰਾਂ ਦੀ ਲੋੜ ਸੀ।</p>
        <div class="ai-voice-example">
          <div class="voice-bubble">
            <div class="voice-bubble-avatar voice-bubble-avatar--ai"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg></div>
            <div class="voice-bubble-content">
              <div class="hindi">"ਆਜ ਸ਼ਾਮ 6 ਬਾਜੇ 15 ਕਿੱਲੋ ਚੀਨੀ ਕਾ ਸਟਾਕ ਕਮ ਹੂਆ - ਪੁਸ਼ਟੀ ਕਰੇ?"</div>
              <div class="translation">ਅੱਜ ਸ਼ਾਮ 6 ਵਜੇ 15 ਕਿਲੋ ਖੰਡ ਦਾ ਸਟਾਕ ਘਟਿਆ - ਤਸਦੀਕ ਕਰਨਾ ਚਾਹੁੰਦੇ ਹੋ?</div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</section>

<!-- ═══ LANGUAGES ═══ -->
<section class="languages-section" id="languages">
  <div class="container">
    <div class="reveal">
      <div class="section-label">ਭਾਰਤ ਲਈ ਬਣਾਇਆ ਗਿਆ</div>
      <h2 class="section-heading">ਤੁਹਾਡੀ ਭਾਸ਼ਾ। ਤੁਹਾਡਾ ਕਾਰੋਬਾਰ। ਤੁਹਾਡਾ ਤਰੀਕਾ.</h2>
      <p class="section-sub">Samaan-Bol ਤੁਹਾਡੇ ਬੋਲਣ ਦੇ ਤਰੀਕੇ ਨੂੰ ਬੋਲਦਾ ਹੈ — ਮੂਲ ਲਿਪੀਆਂ, ਬੋਲਚਾਲ ਦੇ ਸ਼ਬਦਾਂ, ਅਤੇ ਖੇਤਰੀ ਉਤਪਾਦ ਦੇ ਨਾਮਾਂ ਲਈ ਪੂਰੇ ਸਮਰਥਨ ਨਾਲ।</p>
    </div>
    <div class="lang-grid reveal">
      <div class="lang-chip lang-chip--featured">ਹਿੰਦੀ <span class="native hindi">हिन्दी</span></div>
      <div class="lang-chip">ਬੰਗਾਲੀ <span class="native">বাংলা</span></div>
      <div class="lang-chip">ਤਾਮਿਲ <span class="native">தமிழ்</span></div>
      <div class="lang-chip">ਤੇਲਗੂ <span class="native">తెలుగు</span></div>
      <div class="lang-chip">ਮਰਾਠੀ <span class="native">मराठी</span></div>
      <div class="lang-chip">ਕੰਨੜ <span class="native">ಕನ್ನಡ</span></div>
      <div class="lang-chip">ਗੁਜਰਾਤੀ <span class="native">ગુજરાતી</span></div>
      <div class="lang-chip">ਮਲਿਆਲਮ <span class="native">മലയാളം</span></div>
      <div class="lang-chip">ਪੰਜਾਬੀ <span class="native">ਪੰਜਾਬੀ</span></div>
      <div class="lang-chip">ਓਡੀਆ <span class="native">ଓଡ଼ିଆ</span></div>
      <div class="lang-chip">ਅੰਗਰੇਜ਼ੀ <span class="native">ਅੰਗਰੇਜ਼ੀ</span></div>
    </div>
  </div>
</section>

<!-- ═══ COMPARISON ═══ -->
<section class="comparison">
  <div class="container">
    <div class="reveal">
      <div class="section-label">ਕਿਉਂ Samaan-Bol</div>
      <h2 class="section-heading">ਅੰਤਰ ਦਿਨ ਰਾਤ ਦਾ ਹੈ</h2>
    </div>
    <div class="comparison-grid reveal">
      <div class="comparison-col comparison-col--without">
        <h3>Samaan-Bol ਤੋਂ ਬਿਨਾਂ</h3>
        <p class="comparison-col-subtitle">ਸਟਾਕ ਦੇ ਪ੍ਰਬੰਧਨ ਦਾ ਪੁਰਾਣਾ ਤਰੀਕਾ</p>
        <ul class="comparison-list">
          <li><span class="icon">✕</span> ਦਸਤੀ ਗਿਣਤੀ, ਪੈੱਨ-ਅਤੇ-ਕਾਗਜ਼ ਰਜਿਸਟਰ</li>
          <li><span class="icon">✕</span> ਜਦੋਂ ਕੋਈ ਗਾਹਕ ਪੁੱਛਦਾ ਹੈ ਤਾਂ ਸਟਾਕਆਉਟ ਲੱਭੇ ਜਾਂਦੇ ਹਨ</li>
          <li><span class="icon">✕</span> ਅੰਦਾਜ਼ਾ ਲਗਾ ਰਿਹਾ ਹੈ ਕਿ ਕਿੰਨਾ ਮੁੜ ਆਰਡਰ ਕਰਨਾ ਹੈ</li>
          <li><span class="icon">✕</span> ਪਤਾ ਨਹੀਂ ਕੀ ਮਿਆਦ ਪੁੱਗ ਰਹੀ ਹੈ ਜਾਂ ਹੌਲੀ-ਹੌਲੀ ਚੱਲ ਰਹੀ ਹੈ</li>
          <li><span class="icon">✕</span> ਸਟਾਫ਼ ਕੀ ਕਰ ਰਿਹਾ ਹੈ ਉਸ ਨੂੰ ਟਰੈਕ ਨਹੀਂ ਕੀਤਾ ਜਾ ਸਕਦਾ</li>
          <li><span class="icon">✕</span> ਤਿਉਹਾਰ ਦੀ ਤਿਆਰੀ ਆਖਰੀ-ਮਿੰਟ ਦੀ ਹਫੜਾ-ਦਫੜੀ ਹੈ</li>
        </ul>
      </div>
      <div class="comparison-col comparison-col--with">
        <h3>Samaan-Bol ਦੇ ਨਾਲ</h3>
        <p class="comparison-col-subtitle">AI-ਸੰਚਾਲਿਤ, ਵੌਇਸ-ਪਹਿਲਾਂ, ਆਸਾਨ</p>
        <ul class="comparison-list">
          <li><span class="icon">✓</span> ਵੌਇਸ ਅੱਪਡੇਟ - ਇਸਨੂੰ ਕਹੋ ਅਤੇ ਇਹ ਹੋ ਗਿਆ</li>
          <li><span class="icon">✓</span> ਸਟਾਕਆਊਟ ਤੋਂ ਦਿਨ ਪਹਿਲਾਂ ਭਵਿੱਖਬਾਣੀ ਚੇਤਾਵਨੀਆਂ</li>
          <li><span class="icon">✓</span> ਅਸਲ ਡੇਟਾ ਦੇ ਅਧਾਰ ਤੇ ਏਆਈ ਦੁਆਰਾ ਤਿਆਰ ਖਰੀਦ ਸੂਚੀਆਂ</li>
          <li><span class="icon">✓</span> ਮਿਆਦ ਪੁੱਗਣ ਅਤੇ ਹੌਲੀ-ਮੂਵਰ ਖੋਜ ਬਿਲਟ-ਇਨ</li>
          <li><span class="icon">✓</span> ਵਿਗਾੜ ਖੋਜ ਦੇ ਨਾਲ ਪੂਰਾ ਆਡਿਟ ਟ੍ਰੇਲ</li>
          <li><span class="icon">✓</span> ਤਿਉਹਾਰ ਦੀ ਭਵਿੱਖਬਾਣੀ 2 ਹਫ਼ਤੇ ਪਹਿਲਾਂ ਸ਼ੁਰੂ ਹੁੰਦੀ ਹੈ</li>
        </ul>
      </div>
    </div>
  </div>
</section>

<!-- ═══ TESTIMONIALS ═══ -->
<section class="testimonials">
  <div class="container">
    <div class="reveal">
      <div class="section-label">ਸ਼ੁਰੂਆਤੀ ਗੋਦ ਲੈਣ ਵਾਲੇ</div>
      <h2 class="section-heading">ਪੂਰੇ ਭਾਰਤ ਵਿੱਚ ਬੀਟਾ ਟੈਸਟਰਾਂ ਦੁਆਰਾ ਪਿਆਰ ਕੀਤਾ ਗਿਆ</h2>
    </div>
    <div class="testimonials-grid">
      <div class="testimonial reveal reveal-delay-1">
        <div class="testimonial-stars">★★★★★</div>
        <blockquote>ਬੀਟਾ ਟੈਸਟਿੰਗ ਮੈਂ ਕੋਸ਼ਿਸ਼ ਕੀਆ — ਪਹਿਲੇ ਦਿਨ ਸੇ ਰਜਿਸਟਰ ਬੈਂਡ। ਅਬ ਬਸ ਬੋਲ ਦੇਤੀ ਹੂੰ ਔਰ ਸਬ ਅਪਡੇਟ ਹੋ ਜਾਤਾ ਹੈ। ਇਤਨਾ ਆਸਨ ਹੋਗਾ ਸੋਚਾ ਨਹੀਂ ਥਾ।</blockquote>
        <div class="testimonial-author">ਮੀਨਾ ਸ਼ਰਮਾ</div>
        <div class="testimonial-role">ਬੀਟਾ ਟੈਸਟਰ · ਕਿਰਨਾ ਸਟੋਰ Owner, ਜੈਪੁਰ</div>
      </div>
      <div class="testimonial reveal reveal-delay-2">
        <div class="testimonial-stars">★★★★★</div>
        <blockquote>ਜਨਵਰੀ ਮੇਂ ਬੀਟਾ ਜੁਆਇਨ ਕਿਆ ਥਾ — ਹੋਲੀ ਕੇ ਲੀਏ ਏਆਈ ਨੇ ਪਹਿਲਾਂ ਹੀ ਬਤਾਯਾ ਕੀ ਕਯਾ ਸਟਾਕ ਬਧਨਾ ਹੈ। ਅਭੀ ਸੇ ਇਤਨਾ ਸਮਾਰਟ ਹੈ, ਸੋਚੀਏ ਲਾਂਚ ਕੇ ਬਾਅਦ ਕਯਾ ਹੋਗਾ।</blockquote>
        <div class="testimonial-author">ਅਰਜੁਨ ਪਟੇਲ</div>
        <div class="testimonial-role">ਬੀਟਾ ਟੈਸਟਰ · ਜਨਰਲ ਸਟੋਰ, ਅਹਿਮਦਾਬਾਦ</div>
      </div>
      <div class="testimonial reveal reveal-delay-3">
        <div class="testimonial-stars">★★★★★</div>
        <blockquote>ਬੰਗਲਾ ਵਿੱਚ ਬੋਲਤੇ ਹੀ ਸਮਝ ਗਿਆ — ਬੀਟਾ ਟੈਸਟਿੰਗ-ਏ ਦੇਖਲਮ ਜੇ ਅਮਰ ਭਾਸ਼ਾ ਤੇ ਕਾਜ ਕੋਰੇ। ਸਟਾਫ਼ ਰਾ ਓ ਖੂਬ ਆਸਾਨੀ ਨਾਲ ਕੋਰਤੇ ਪਰਚੇ ਵਰਤਦਾ ਹੈ।</blockquote>
        <div class="testimonial-author">ਰੀਨਾ ਦਾਸ</div>
        <div class="testimonial-role">ਬੀਟਾ ਟੈਸਟਰ · ਟੈਕਸਟਾਈਲ ਦੀ ਦੁਕਾਨ, ਕੋਲਕਾਤਾ</div>
      </div>
    </div>
  </div>
</section>

<!-- ═══ CTA ═══ -->
<section class="cta-section" id="download">
  <div class="container">
    <div class="reveal">
      <div class="section-label">ਮੁਫਤ ਸ਼ੁਰੂਆਤ ਕਰੋ</div>
      <h2 class="section-heading">
        <span class="hindi" style="display:block; color:var(--saffron); font-size:clamp(20px,2.4vw,28px); font-weight:500; margin-bottom:8px;">आज ही शुरू करें</span>
        ਤੁਹਾਡੀ ਦੁਕਾਨ ਇੱਕ ਨੋਟਬੁੱਕ ਨਾਲੋਂ ਬਿਹਤਰ ਦੀ ਹੱਕਦਾਰ ਹੈ
      </h2>
      <p class="section-sub">ਸ਼ੁਰੂ ਕਰਨ ਲਈ ਮੁਫ਼ਤ. 2 ਮਿੰਟ ਵਿੱਚ ਸੈੱਟਅੱਪ ਕਰੋ। ਕੋਈ ਕ੍ਰੈਡਿਟ ਕਾਰਡ ਦੀ ਲੋੜ ਨਹੀਂ।</p>
      <div class="cta-actions">
        <a href="https://apps.apple.com/in/app/samaan-bol/id6759739444" class="store-badge">
          <div class="store-badge-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg></div>
          <div class="store-badge-text">
            <div class="store-badge-label">'ਤੇ ਡਾਊਨਲੋਡ ਕਰੋ</div>
            <div class="store-badge-name">App Store</div>
          </div>
        </a>
        <a href="#" class="store-badge" style="position:relative; opacity:0.65; pointer-events:none;">
          <div class="store-badge-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.807 1.626a1 1 0 0 1 0 1.73l-2.808 1.626L15.206 12l2.492-2.491zM5.864 2.658L16.8 8.99l-2.3 2.3-8.636-8.632z"/></svg></div>
          <div class="store-badge-text">
            <div class="store-badge-label">ਇਸ 'ਤੇ ਪ੍ਰਾਪਤ ਕਰੋ</div>
            <div class="store-badge-name">Google Play</div>
          </div>
          <span style="position:absolute; top:-10px; right:-10px; background:var(--saffron); color:#fff; font-size:11px; font-weight:700; padding:3px 10px; border-radius:20px; letter-spacing:0.5px; text-transform:uppercase;">ਜਲਦੀ ਆ ਰਿਹਾ ਹੈ</span>
        </a>
      </div>
    </div>
  </div>
</section>

<!-- ═══ FOOTER ═══ -->
<footer>
  <div class="container">
    <div class="footer-grid">
      <div class="footer-brand">
        <a href="#" class="logo">
          <div class="logo-mark"><svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><defs><mask id="stencil-footer"><rect x="0" y="0" width="100" height="100" fill="white"/><rect x="24" y="18" width="52" height="8" rx="4" fill="black"/><rect x="38" y="18" width="24" height="36" rx="12" fill="black"/><path d="M 28 42 A 22 22 0 0 0 72 42" fill="none" stroke="black" stroke-width="8" stroke-linecap="round"/><rect x="46" y="72" width="8" height="10" rx="4" fill="black"/><rect x="36" y="32" width="28" height="4" fill="white"/><rect x="36" y="44" width="28" height="4" fill="white"/></mask></defs><circle cx="50" cy="50" r="50" fill="#ea580c" mask="url(#stencil-footer)"/></svg></div>
          <div class="logo-text">ਸਮਾਨ<span>ਬੋਲ</span></div>
        </a>
        <p>ਵੌਇਸ-ਪਹਿਲੀ AI ਵਸਤੂ-ਸੂਚੀ ਪ੍ਰਬੰਧਨ, ਭਾਰਤੀ ਰਿਟੇਲ ਦੇ ਦਿਲ ਲਈ ਬਣਾਇਆ ਗਿਆ ਹੈ।</p>
      </div>
      <div class="footer-col">
        <h4>ਉਤਪਾਦ</h4>
        <ul>
          <li><a href="#features">ਵਿਸ਼ੇਸ਼ਤਾਵਾਂ</a></li>
          <li><a href="#ai">ਏਆਈ ਇੰਟੈਲੀਜੈਂਸ</a></li>
          <li><a href="#languages">ਭਾਸ਼ਾਵਾਂ</a></li>
          <li><a href="#">ਕੀਮਤ</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>ਕੰਪਨੀ</h4>
        <ul>
          <li><a href="#">ਬਾਰੇ</a></li>
          <li><a href="#">ਬਲੌਗ</a></li>
          <li><a href="#">ਕਰੀਅਰ</a></li>
          <li><a href="#">ਸੰਪਰਕ ਕਰੋ</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>ਸਪੋਰਟ</h4>
        <ul>
          <li><a href="#">ਮਦਦ ਕੇਂਦਰ</a></li>
          <li><a href="/privacy-policy">ਗੋਪਨੀਯਤਾ ਨੀਤੀ</a></li>
          <li><a href="/terms-of-service">ਸੇਵਾ ਦੀਆਂ ਸ਼ਰਤਾਂ</a></li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <span>© 2026 Samaan-Bol। ਸਾਰੇ ਹੱਕ ਰਾਖਵੇਂ ਹਨ.</span>
      <span class="made-in-india">ਭਾਰਤ 🇮🇳 ਵਿੱਚ ♥ ਨਾਲ ਬਣਾਇਆ ਗਿਆ</span>
    </div>
  </div>
</footer>`,
    privacy: `<div class="reading-progress" id="readingProgress"></div>

  <div class="container">
    <a href="/" class="back">← ਘਰ ਵਾਪਸ ਜਾਓ</a>
    <h1>ਗੋਪਨੀਯਤਾ ਨੀਤੀ</h1>
    <p class="effective">ਲਾਗੂ ਹੋਣ ਦੀ ਮਿਤੀ: 23 ਫਰਵਰੀ, 2026</p>

    <nav class="toc">
      <h3>ਸਮੱਗਰੀ</h3>
      <ol>
        <li><a href="#s1">ਜਾਣਕਾਰੀ ਅਸੀਂ ਇਕੱਠੀ ਕਰਦੇ ਹਾਂ</a></li>
        <li><a href="#s2">ਅਸੀਂ ਤੁਹਾਡੀ ਜਾਣਕਾਰੀ ਦੀ ਵਰਤੋਂ ਕਿਵੇਂ ਕਰਦੇ ਹਾਂ</a></li>
        <li><a href="#s3">ਤੀਜੀ-ਧਿਰ ਦੀਆਂ ਸੇਵਾਵਾਂ</a></li>
        <li><a href="#s4">ਡਾਟਾ ਸਟੋਰੇਜ ਅਤੇ ਸੁਰੱਖਿਆ</a></li>
        <li><a href="#s5">ਡਾਟਾ ਧਾਰਨ</a></li>
        <li><a href="#s6">ਖਾਤਾ ਮਿਟਾਉਣਾ</a></li>
        <li><a href="#s7">ਦੁਕਾਨਾਂ ਦੇ ਅੰਦਰ ਡਾਟਾ ਸਾਂਝਾ ਕਰਨਾ</a></li>
        <li><a href="#s8">ਬੱਚਿਆਂ ਦੀ ਗੋਪਨੀਯਤਾ</a></li>
        <li><a href="#s9">ਤੁਹਾਡੇ ਅਧਿਕਾਰ</a></li>
        <li><a href="#s10">ਇਸ ਨੀਤੀ ਵਿੱਚ ਬਦਲਾਅ</a></li>
        <li><a href="#s11">ਸਾਡੇ ਨਾਲ ਸੰਪਰਕ ਕਰੋ</a></li>
      </ol>
    </nav>

    <p>Samaan-Bol ("ਅਸੀਂ", "ਸਾਡੀ", ਜਾਂ "ਐਪ") ਇੱਕ ਵੌਇਸ-ਪਹਿਲੀ ਸਹਿਯੋਗੀ ਵਸਤੂ ਪ੍ਰਬੰਧਨ ਐਪਲੀਕੇਸ਼ਨ ਹੈ ਜੋ ਭਾਰਤੀ ਰਿਟੇਲ ਕਾਰੋਬਾਰਾਂ ਲਈ ਤਿਆਰ ਕੀਤੀ ਗਈ ਹੈ। ਇਹ ਗੋਪਨੀਯਤਾ ਨੀਤੀ ਦੱਸਦੀ ਹੈ ਕਿ ਅਸੀਂ ਕਿਹੜੀ ਜਾਣਕਾਰੀ ਇਕੱਠੀ ਕਰਦੇ ਹਾਂ, ਅਸੀਂ ਇਸਨੂੰ ਕਿਵੇਂ ਵਰਤਦੇ ਹਾਂ, ਅਸੀਂ ਇਸਨੂੰ ਕਿਸ ਨਾਲ ਸਾਂਝਾ ਕਰਦੇ ਹਾਂ, ਅਤੇ ਤੁਹਾਡੇ ਡੇਟਾ ਸੰਬੰਧੀ ਤੁਹਾਡੇ ਅਧਿਕਾਰ।</p>

    <p>Samaan-Bol ਦੀ ਵਰਤੋਂ ਕਰਕੇ, ਤੁਸੀਂ ਇਸ ਨੀਤੀ ਵਿੱਚ ਵਰਣਨ ਕੀਤੇ ਅਨੁਸਾਰ ਜਾਣਕਾਰੀ ਦੇ ਸੰਗ੍ਰਹਿ ਅਤੇ ਵਰਤੋਂ ਲਈ ਸਹਿਮਤ ਹੁੰਦੇ ਹੋ।</p>

    <details open id="s1">
      <summary><h2>1. ਜਾਣਕਾਰੀ ਅਸੀਂ ਇਕੱਠੀ ਕਰਦੇ ਹਾਂ</h2></summary>
      <div class="section-content">
        <h3>1.1 ਖਾਤਾ ਜਾਣਕਾਰੀ</h3>
        <p>ਜਦੋਂ ਤੁਸੀਂ ਇੱਕ ਖਾਤਾ ਬਣਾਉਂਦੇ ਹੋ, ਅਸੀਂ ਇਕੱਤਰ ਕਰਦੇ ਹਾਂ:</p>
        <ul>
          <li><strong>ਪੂਰਾ ਨਾਮ</strong> - ਸਾਈਨ-ਅੱਪ ਦੌਰਾਨ ਪ੍ਰਦਾਨ ਕੀਤਾ ਗਿਆ</li>
          <li><strong>Email ਪਤਾ</strong> — ਪ੍ਰਮਾਣਿਕਤਾ ਅਤੇ ਖਾਤਾ ਰਿਕਵਰੀ ਲਈ ਵਰਤਿਆ ਜਾਂਦਾ ਹੈ</li>
          <li><strong>ਪਾਸਵਰਡ</strong> — ਸਾਡੇ ਪ੍ਰਮਾਣੀਕਰਨ ਪ੍ਰਦਾਤਾ (Clerk) ਦੁਆਰਾ ਏਨਕ੍ਰਿਪਟਡ ਅਤੇ ਪ੍ਰਬੰਧਿਤ</li>
        </ul>
        <p>ਜੇਕਰ ਤੁਸੀਂ Google ਜਾਂ Apple ਨਾਲ ਸਾਈਨ ਇਨ ਕਰਦੇ ਹੋ, ਤਾਂ ਸਾਨੂੰ OAuth ਪ੍ਰਦਾਤਾ ਤੋਂ ਤੁਹਾਡਾ ਨਾਮ ਅਤੇ ਈਮੇਲ ਪ੍ਰਾਪਤ ਹੁੰਦੀ ਹੈ। ਅਸੀਂ ਤੁਹਾਡੇ Google ਜਾਂ Apple ਖਾਤੇ ਦੇ ਪਾਸਵਰਡ ਤੱਕ ਪਹੁੰਚ ਨਹੀਂ ਕਰਦੇ ਹਾਂ।</p>

        <h3>1.2 ਵੌਇਸ ਰਿਕਾਰਡਿੰਗਾਂ</h3>
        <div class="highlight">
          <p><strong>ਮਹੱਤਵਪੂਰਨ:</strong> ਵੌਇਸ ਰਿਕਾਰਡਿੰਗਾਂ ਨੂੰ ਅਸਲ-ਸਮੇਂ ਵਿੱਚ ਸੰਸਾਧਿਤ ਕੀਤਾ ਜਾਂਦਾ ਹੈ ਅਤੇ ਹਨ <strong>ਪੱਕੇ ਤੌਰ 'ਤੇ ਸਟੋਰ ਨਹੀਂ ਕੀਤਾ ਗਿਆ</strong>. ਆਡੀਓ ਨੂੰ ਸਾਡੇ ਸਰਵਰ 'ਤੇ ਪ੍ਰਸਾਰਿਤ ਕੀਤਾ ਜਾਂਦਾ ਹੈ, ਬੋਲੀ ਪਛਾਣ ਅਤੇ ਕੁਦਰਤੀ ਭਾਸ਼ਾ ਦੀ ਸਮਝ ਲਈSarvam AIਦੁਆਰਾ ਪ੍ਰਕਿਰਿਆ ਕੀਤੀ ਜਾਂਦੀ ਹੈ, ਅਤੇ ਪ੍ਰਕਿਰਿਆ ਕਰਨ ਤੋਂ ਬਾਅਦ ਤੁਰੰਤ ਰੱਦ ਕਰ ਦਿੱਤੀ ਜਾਂਦੀ ਹੈ। ਤੁਹਾਡੇ ਸੰਦਰਭ ਲਈ ਤੁਹਾਡੇ ਆਡਿਟ ਲੌਗ ਵਿੱਚ ਸਿਰਫ਼ ਨਤੀਜਾ ਟੈਕਸਟ ਟ੍ਰਾਂਸਕ੍ਰਿਪਟ ਸਟੋਰ ਕੀਤੀ ਜਾਂਦੀ ਹੈ।</p>
        </div>
        <ul>
          <li>ਆਡੀਓ ਤੁਹਾਡੀ ਡਿਵਾਈਸ 'ਤੇ ਰਿਕਾਰਡ ਕੀਤਾ ਗਿਆ ਹੈ ( WAV ਫਾਰਮੈਟ iOS 'ਤੇ, M4A Android 'ਤੇ)</li>
          <li>ਰਿਕਾਰਡਿੰਗਜ਼ ਅਧਿਕਤਮ 30 ਸਕਿੰਟਾਂ ਤੱਕ ਸੀਮਿਤ ਹਨ</li>
          <li>ਆਡੀਓ ਸਾਡੇ ਸਰਵਰ ਨੂੰ ਇੱਕ ਸੁਰੱਖਿਅਤ ਕਨੈਕਸ਼ਨ ਰਾਹੀਂ ਏਨਕੋਡ ਕੀਤੇ ਡੇਟਾ ਵਜੋਂ ਭੇਜਿਆ ਜਾਂਦਾ ਹੈ</li>
          <li>ਪ੍ਰੋਸੈਸਿੰਗ ਤੋਂ ਬਾਅਦ, ਆਡੀਓ ਡੇਟਾ ਨੂੰ ਸਰਵਰ ਮੈਮੋਰੀ ਤੋਂ ਰੱਦ ਕਰ ਦਿੱਤਾ ਜਾਂਦਾ ਹੈ</li>
          <li>ਟੈਕਸਟ ਟ੍ਰਾਂਸਕ੍ਰਿਪਟਾਂ ਨੂੰ ਤੁਹਾਡੀ ਦੁਕਾਨ ਦੇ ਆਡਿਟ ਲੌਗ ਵਿੱਚ ਸਟੋਰ ਕੀਤਾ ਜਾਂਦਾ ਹੈ ਤਾਂ ਜੋ ਤੁਸੀਂ ਪਿਛਲੀਆਂ ਕਾਰਵਾਈਆਂ ਦੀ ਸਮੀਖਿਆ ਕਰ ਸਕੋ</li>
        </ul>

        <h3>1.3 ਵਸਤੂ ਸੂਚੀ ਅਤੇ ਵਪਾਰਕ ਡੇਟਾ</h3>
        <p>ਜਦੋਂ ਤੁਸੀਂ ਐਪ ਦੀ ਵਰਤੋਂ ਕਰਦੇ ਹੋ, ਤਾਂ ਅਸੀਂ ਤੁਹਾਡੇ ਦੁਆਰਾ ਬਣਾਏ ਵਪਾਰਕ ਡੇਟਾ ਨੂੰ ਸਟੋਰ ਕਰਦੇ ਹਾਂ:</p>
        <ul>
          <li>ਦੁਕਾਨ ਦੀ ਜਾਣਕਾਰੀ (ਨਾਮ, ਸ਼੍ਰੇਣੀ, ਤਰਜੀਹੀ ਭਾਸ਼ਾ)</li>
          <li>ਉਤਪਾਦ ਕੈਟਾਲਾਗ (ਨਾਮ, ਬਾਰਕੋਡ, ਸ਼੍ਰੇਣੀਆਂ, ਇਕਾਈਆਂ, ਕੀਮਤਾਂ)</li>
          <li>ਸਟਾਕ ਦੀ ਮਾਤਰਾ, ਬੈਚ ਨੰਬਰ, ਖਰੀਦ ਮਿਤੀ, ਮਿਆਦ ਪੁੱਗਣ ਦੀ ਤਾਰੀਖ, ਸਪਲਾਇਰ ਦੇ ਨਾਮ</li>
          <li>ਸੂਚੀ ਆਈਟਮਾਂ ਅਤੇ ਨੋਟਸ ਖਰੀਦੋ</li>
          <li>ਆਡਿਟ ਲੌਗ ਰਿਕਾਰਡਿੰਗ ਵਸਤੂ ਸੂਚੀ ਤਬਦੀਲੀਆਂ (ਕਾਰਵਾਈ ਕਿਸਮ, ਉਪਭੋਗਤਾ, ਟਾਈਮਸਟੈਂਪ, ਪ੍ਰਤੀਲਿਪੀ, ਵਿਸ਼ਵਾਸ ਸਕੋਰ)</li>
        </ul>

        <h3>1.4 ਉਪਭੋਗਤਾ ਤਰਜੀਹਾਂ</h3>
        <ul>
          <li>ਐਪ ਭਾਸ਼ਾ ਅਤੇ ਵੌਇਸ ਭਾਸ਼ਾ ਦੀ ਚੋਣ</li>
          <li>ਵੌਇਸ ਫੀਡਬੈਕ ਤਰਜੀਹ (ਚਾਲੂ/ਬੰਦ)</li>
          <li>ਡਿਸਪਲੇ ਸੈਟਿੰਗਜ਼ (ਉੱਚ ਕੰਟ੍ਰਾਸਟ ਮੋਡ, ਟੈਕਸਟ ਆਕਾਰ)</li>
          <li>ਪੂਰਵ-ਨਿਰਧਾਰਤ ਮਾਪ ਇਕਾਈ</li>
          <li>ਸੂਚਨਾ ਤਰਜੀਹਾਂ</li>
        </ul>

        <h3>1.5 ਦੁਕਾਨ ਸਦੱਸਤਾ ਡੇਟਾ</h3>
        <ul>
          <li>ਹਰੇਕ ਦੁਕਾਨ ਵਿੱਚ ਤੁਹਾਡੀ ਭੂਮਿਕਾ (Owner, Manager, ਜਾਂ Helper)</li>
          <li>ਟੀਮ ਸਹਿਯੋਗ ਲਈ ਤਿਆਰ ਕੀਤੇ ਸੱਦਾ ਕੋਡ</li>
          <li>ਦੁਕਾਨਾਂ ਦੇ ਅੰਦਰ ਆਖਰੀ ਕਿਰਿਆਸ਼ੀਲ ਟਾਈਮਸਟੈਂਪ</li>
        </ul>

        <h3>1.6 ਡਿਵਾਈਸ ਅਤੇ ਡਾਇਗਨੌਸਟਿਕ ਡੇਟਾ</h3>
        <p>ਉਤਪਾਦਨ ਬਿਲਡ ਵਿੱਚ, ਅਸੀਂ ਕਰੈਸ਼ ਰਿਪੋਰਟਿੰਗ ਲਈSentryਦੀ ਵਰਤੋਂ ਕਰਦੇ ਹਾਂ। ਇਹ ਇਕੱਠਾ ਕਰਦਾ ਹੈ:</p>
        <ul>
          <li>ਡਿਵਾਈਸ ਦੀ ਕਿਸਮ, ਓਪਰੇਟਿੰਗ ਸਿਸਟਮ, ਅਤੇ ਐਪ ਸੰਸਕਰਣ</li>
          <li>ਕਰੈਸ਼ ਰਿਪੋਰਟਾਂ ਅਤੇ ਤਰੁੱਟੀ ਸਟੈਕ ਟਰੇਸ</li>
          <li>ਪ੍ਰਦਰਸ਼ਨ ਡੇਟਾ (ਸੈਸ਼ਨਾਂ ਦੇ 20% 'ਤੇ ਨਮੂਨਾ ਲਿਆ ਗਿਆ)</li>
        </ul>
        <p>ਵਿਕਾਸ ਬਿਲਡਾਂ ਵਿੱਚ ਕ੍ਰੈਸ਼ ਰਿਪੋਰਟਿੰਗ ਅਸਮਰੱਥ ਹੈ ਅਤੇ ਸਾਡੇ ਦੁਆਰਾ ਲਾਗੂ ਕੀਤੀ ਗਈ ਨਮੂਨਾ ਦਰ ਦੁਆਰਾ ਘੱਟ ਕੀਤੀ ਜਾ ਸਕਦੀ ਹੈ।</p>
      </div>
    </details>

    <details id="s2">
      <summary><h2>2. ਅਸੀਂ ਤੁਹਾਡੀ ਜਾਣਕਾਰੀ ਦੀ ਵਰਤੋਂ ਕਿਵੇਂ ਕਰਦੇ ਹਾਂ</h2></summary>
      <div class="section-content">
        <ul>
          <li><strong>ਸੇਵਾ ਪ੍ਰਦਾਨ ਕਰੋ:</strong> ਵੌਇਸ ਕਮਾਂਡਾਂ ਦੀ ਪ੍ਰਕਿਰਿਆ ਕਰੋ, ਵਸਤੂ ਸੂਚੀ ਦਾ ਪ੍ਰਬੰਧਨ ਕਰੋ, ਅਤੇ ਆਪਣੀ ਟੀਮ ਵਿੱਚ ਡਾਟਾ ਸਿੰਕ ਕਰੋ</li>
          <li><strong>ਪ੍ਰਮਾਣਿਕਤਾ:</strong> ਆਪਣੀ ਪਛਾਣ ਦੀ ਪੁਸ਼ਟੀ ਕਰੋ ਅਤੇ ਸੁਰੱਖਿਅਤ ਸੈਸ਼ਨਾਂ ਦਾ ਪ੍ਰਬੰਧਨ ਕਰੋ</li>
          <li><strong>ਆਡਿਟ ਟ੍ਰੇਲ:</strong> ਜਵਾਬਦੇਹੀ ਅਤੇ ਸਮੀਖਿਆ ਲਈ ਵਸਤੂ ਸੂਚੀ ਵਿੱਚ ਤਬਦੀਲੀਆਂ ਦਾ ਇੱਕ ਲੌਗ ਬਣਾਈ ਰੱਖੋ</li>
          <li><strong>ਸੇਵਾ ਵਿੱਚ ਸੁਧਾਰ ਕਰੋ:</strong> ਅਗਿਆਤ ਗਲਤੀ ਰਿਪੋਰਟਾਂ ਰਾਹੀਂ ਬੱਗ ਅਤੇ ਕਰੈਸ਼ ਦਾ ਨਿਦਾਨ ਕਰੋ</li>
          <li><strong>ਸੰਚਾਰ:</strong> ਜ਼ਰੂਰੀ ਖਾਤਾ-ਸਬੰਧਤ ਸੂਚਨਾਵਾਂ ਭੇਜੋ (ਉਦਾਹਰਨ ਲਈ, ਪਾਸਵਰਡ ਰੀਸੈੱਟ)</li>
        </ul>
        <p>ਅਸੀਂ ਕਰਦੇ ਹਾਂ <strong>ਨਹੀਂ</strong> ਇਸ਼ਤਿਹਾਰਬਾਜ਼ੀ ਲਈ ਤੁਹਾਡੇ ਡੇਟਾ ਦੀ ਵਰਤੋਂ ਕਰੋ, ਅਤੇ ਅਸੀਂ ਕਰਦੇ ਹਾਂ <strong>ਨਹੀਂ</strong> ਤੀਜੀ ਧਿਰ ਨੂੰ ਤੁਹਾਡੀ ਨਿੱਜੀ ਜਾਣਕਾਰੀ ਵੇਚੋ.</p>
      </div>
    </details>

    <details id="s3">
      <summary><h2>3. ਤੀਜੀ-ਧਿਰ ਦੀਆਂ ਸੇਵਾਵਾਂ</h2></summary>
      <div class="section-content">
        <p>ਅਸੀਂ ਐਪ ਨੂੰ ਚਲਾਉਣ ਲਈ ਹੇਠ ਲਿਖੀਆਂ ਤੀਜੀ-ਧਿਰ ਸੇਵਾਵਾਂ ਦੀ ਵਰਤੋਂ ਕਰਦੇ ਹਾਂ:</p>
        <table>
          <thead>
            <tr>
              <th>ਸੇਵਾ</th>
              <th>ਮਕਸਦ</th>
              <th>ਡਾਟਾ ਸਾਂਝਾ ਕੀਤਾ ਗਿਆ</th>
              <th>ਗੋਪਨੀਯਤਾ ਨੀਤੀ</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Clerk</strong></td>
              <td>ਪ੍ਰਮਾਣਿਕਤਾ ਅਤੇ ਸੈਸ਼ਨ ਪ੍ਰਬੰਧਨ</td>
              <td>Email, ਨਾਮ, OAuth ਟੋਕਨ, ਸੈਸ਼ਨ ਡੇਟਾ</td>
              <td><a href="https://clerk.com/legal/privacy" target="_blank" rel="noopener">clerk.com/legal/privacy</a></td>
            </tr>
            <tr>
              <td><strong>Sarvam AI</strong></td>
              <td>ਵੌਇਸ ਪ੍ਰੋਸੈਸਿੰਗ (ਸਪੀਚ-ਟੂ-ਟੈਕਸਟ, ਨੈਚੁਰਲ ਲੈਂਗੂਏਜ ਪ੍ਰੋਸੈਸਿੰਗ, ਟੈਕਸਟ-ਟੂ-ਸਪੀਚ)</td>
              <td>ਆਡੀਓ ਰਿਕਾਰਡਿੰਗ, ਟ੍ਰਾਂਸਕ੍ਰਿਪਟ ਟੈਕਸਟ, ਭਾਸ਼ਾ ਕੋਡ</td>
              <td><a href="https://www.sarvam.ai/privacy-policy" target="_blank" rel="noopener">sarvam.ai/privacy-policy</a></td>
            </tr>
            <tr>
              <td><strong>Neon</strong></td>
              <td>ਡਾਟਾਬੇਸ ਹੋਸਟਿੰਗ (PostgreSQL)</td>
              <td>ਸਾਰਾ ਸਥਾਈ ਐਪਲੀਕੇਸ਼ਨ ਡੇਟਾ</td>
              <td><a href="https://neon.tech/privacy-policy" target="_blank" rel="noopener">neon.tech/privacy-policy</a></td>
            </tr>
            <tr>
              <td><strong>Sentry</strong></td>
              <td>ਗਲਤੀ ਟਰੈਕਿੰਗ ਅਤੇ ਕਰੈਸ਼ ਰਿਪੋਰਟਿੰਗ</td>
              <td>ਕਰੈਸ਼ ਰਿਪੋਰਟਾਂ, ਡਿਵਾਈਸ ਜਾਣਕਾਰੀ (ਸਿਰਫ਼ ਉਤਪਾਦਨ)</td>
              <td><a href="https://sentry.io/privacy/" target="_blank" rel="noopener">sentry.io/privacy</a></td>
            </tr>
          </tbody>
        </table>
        <p>ਹਰੇਕ ਤੀਜੀ-ਧਿਰ ਦੀ ਸੇਵਾ ਆਪਣੀ ਗੋਪਨੀਯਤਾ ਨੀਤੀ ਦੇ ਅਨੁਸਾਰ ਡੇਟਾ ਦੀ ਪ੍ਰਕਿਰਿਆ ਕਰਦੀ ਹੈ। ਅਸੀਂ ਤੁਹਾਨੂੰ ਉਹਨਾਂ ਦੀਆਂ ਨੀਤੀਆਂ ਦੀ ਸਮੀਖਿਆ ਕਰਨ ਲਈ ਉਤਸ਼ਾਹਿਤ ਕਰਦੇ ਹਾਂ।</p>
      </div>
    </details>

    <details id="s4">
      <summary><h2>4. ਡਾਟਾ ਸਟੋਰੇਜ ਅਤੇ ਸੁਰੱਖਿਆ</h2></summary>
      <div class="section-content">
        <ul>
          <li>ਐਪਲੀਕੇਸ਼ਨ ਡੇਟਾ ਇੱਕ Neon PostgreSQL ਡੇਟਾਬੇਸ ਵਿੱਚ SSL/TLS ਇਨਕ੍ਰਿਪਸ਼ਨ ਦੇ ਨਾਲ ਟਰਾਂਜ਼ਿਟ ਵਿੱਚ ਸਟੋਰ ਕੀਤਾ ਜਾਂਦਾ ਹੈ</li>
          <li>ਪ੍ਰਮਾਣਿਕਤਾ ਟੋਕਨ ਸੁਰੱਖਿਅਤ ਸਟੋਰੇਜ ਦੀ ਵਰਤੋਂ ਕਰਕੇ ਤੁਹਾਡੀ ਡਿਵਾਈਸ 'ਤੇ ਸਟੋਰ ਕੀਤੇ ਜਾਂਦੇ ਹਨ (iOSਕੀਚੇਨ / Android ਕੀਸਟੋਰ)</li>
          <li>API ਸੰਚਾਰ HTTPS ਏਨਕ੍ਰਿਪਸ਼ਨ ਦੀ ਵਰਤੋਂ ਕਰਦਾ ਹੈ</li>
          <li>ਦੁਰਵਿਵਹਾਰ ਨੂੰ ਰੋਕਣ ਲਈ ਸੰਵੇਦਨਸ਼ੀਲ ਅੰਤਮ ਬਿੰਦੂ ਦਰ-ਸੀਮਤ ਹਨ</li>
          <li>ਪਾਸਵਰਡ Clerk ਦੁਆਰਾ ਹੈਸ਼ ਅਤੇ ਪ੍ਰਬੰਧਿਤ ਕੀਤੇ ਜਾਂਦੇ ਹਨ — ਅਸੀਂ ਕਦੇ ਵੀ ਪਲੇਨ ਟੈਕਸਟ ਪਾਸਵਰਡ ਸਟੋਰ ਨਹੀਂ ਕਰਦੇ ਹਾਂ</li>
        </ul>
      </div>
    </details>

    <details id="s5">
      <summary><h2>5. ਡਾਟਾ ਧਾਰਨ</h2></summary>
      <div class="section-content">
        <ul>
          <li><strong>ਵੌਇਸ ਆਡੀਓ:</strong> ਏਫਿਮੇਰਲ - ਮੈਮੋਰੀ ਵਿੱਚ ਪ੍ਰੋਸੈਸ ਕੀਤਾ ਗਿਆ ਅਤੇ ਤੁਰੰਤ ਰੱਦ ਕਰ ਦਿੱਤਾ ਗਿਆ। ਸਾਡੇ ਸਰਵਰਾਂ 'ਤੇ ਕਦੇ ਵੀ ਸਟੋਰ ਨਹੀਂ ਕੀਤਾ ਗਿਆ।</li>
          <li><strong>ਟ੍ਰਾਂਸਕ੍ਰਿਪਟ ਅਤੇ ਆਡਿਟ ਲੌਗ:</strong> ਜਦੋਂ ਤੱਕ ਤੁਹਾਡਾ ਖਾਤਾ ਕਿਰਿਆਸ਼ੀਲ ਹੈ, ਤੁਹਾਡੇ ਸੰਦਰਭ ਲਈ ਬਰਕਰਾਰ ਰੱਖਿਆ ਜਾਂਦਾ ਹੈ।</li>
          <li><strong>ਵਸਤੂ ਸੂਚੀ:</strong> ਜਦੋਂ ਤੱਕ ਤੁਹਾਡਾ ਖਾਤਾ ਕਿਰਿਆਸ਼ੀਲ ਹੈ ਉਦੋਂ ਤੱਕ ਬਰਕਰਾਰ ਰੱਖਿਆ ਜਾਵੇਗਾ।</li>
          <li><strong>ਖਾਤਾ ਡੇਟਾ:</strong> ਉਦੋਂ ਤੱਕ ਬਰਕਰਾਰ ਰੱਖਿਆ ਜਾਂਦਾ ਹੈ ਜਦੋਂ ਤੱਕ ਤੁਸੀਂ ਆਪਣਾ ਖਾਤਾ ਨਹੀਂ ਮਿਟਾਉਂਦੇ ਹੋ।</li>
          <li><strong>ਕਰੈਸ਼ ਰਿਪੋਰਟਾਂ:</strong> Sentry ਦੀ ਡਾਟਾ ਧਾਰਨ ਨੀਤੀ (ਆਮ ਤੌਰ 'ਤੇ 90 ਦਿਨ) ਦੇ ਅਨੁਸਾਰ ਬਰਕਰਾਰ ਰੱਖਿਆ ਗਿਆ।</li>
        </ul>
      </div>
    </details>

    <details id="s6">
      <summary><h2>6. ਖਾਤਾ ਮਿਟਾਉਣਾ</h2></summary>
      <div class="section-content">
        <p>ਤੁਸੀਂ ਕਿਸੇ ਵੀ ਸਮੇਂ ਤੋਂ ਆਪਣਾ ਖਾਤਾ ਮਿਟਾ ਸਕਦੇ ਹੋ <strong>Settings > Delete Account</strong> ਐਪ ਦੇ ਅੰਦਰ. ਜਦੋਂ ਤੁਸੀਂ ਆਪਣਾ ਖਾਤਾ ਮਿਟਾਉਂਦੇ ਹੋ:</p>
        <ul>
          <li>ਤੁਹਾਡੀਆਂ ਸਾਰੀਆਂ ਦੁਕਾਨਾਂ ਸਥਾਈ ਤੌਰ 'ਤੇ ਮਿਟਾ ਦਿੱਤੀਆਂ ਗਈਆਂ ਹਨ, ਜਿਸ ਵਿੱਚ ਸਾਰੇ ਉਤਪਾਦ, ਵਸਤੂ ਸੂਚੀ, ਬੈਚ, ਖਰੀਦ ਸੂਚੀਆਂ ਅਤੇ AI ਪੂਰਵ-ਅਨੁਮਾਨ ਸ਼ਾਮਲ ਹਨ।</li>
          <li>ਤੁਹਾਡੇ ਸਾਰੇ ਆਡਿਟ ਲੌਗ ਅਤੇ ਤਰਜੀਹਾਂ ਪੱਕੇ ਤੌਰ 'ਤੇ ਮਿਟਾ ਦਿੱਤੀਆਂ ਗਈਆਂ ਹਨ</li>
          <li>ਦੂਜੇ ਉਪਭੋਗਤਾਵਾਂ ਦੀਆਂ ਦੁਕਾਨਾਂ ਵਿੱਚ ਤੁਹਾਡੀਆਂ ਮੈਂਬਰਸ਼ਿਪਾਂ ਨੂੰ ਹਟਾ ਦਿੱਤਾ ਗਿਆ ਹੈ</li>
          <li>Clerk ਵਾਲਾ ਤੁਹਾਡਾ ਪ੍ਰਮਾਣੀਕਰਨ ਖਾਤਾ ਸਥਾਈ ਤੌਰ 'ਤੇ ਮਿਟਾ ਦਿੱਤਾ ਗਿਆ ਹੈ</li>
        </ul>
        <p><strong>ਇਹ ਕਿਰਿਆ ਵਾਪਸੀਯੋਗ ਨਹੀਂ ਹੈ।</strong> ਇੱਕ ਵਾਰ ਮਿਟਾਏ ਜਾਣ ਤੋਂ ਬਾਅਦ, ਤੁਹਾਡਾ ਡੇਟਾ ਮੁੜ ਪ੍ਰਾਪਤ ਨਹੀਂ ਕੀਤਾ ਜਾ ਸਕਦਾ ਹੈ।</p>
      </div>
    </details>

    <details id="s7">
      <summary><h2>7. ਦੁਕਾਨਾਂ ਦੇ ਅੰਦਰ ਡਾਟਾ ਸਾਂਝਾ ਕਰਨਾ</h2></summary>
      <div class="section-content">
        <p>Samaan-Bol ਇੱਕ ਸਹਿਯੋਗੀ ਸਾਧਨ ਹੈ। ਜਦੋਂ ਤੁਸੀਂ ਕਿਸੇ ਦੁਕਾਨ ਦੇ ਮੈਂਬਰ ਹੋ:</p>
        <ul>
          <li>ਦੁਕਾਨ ਦੇ ਸਾਰੇ ਮੈਂਬਰ (Owner, Manager, Helper) ਦੁਕਾਨ ਦਾ ਵਸਤੂ ਸੂਚੀ, ਉਤਪਾਦ ਕੈਟਾਲਾਗ, ਅਤੇ ਆਡਿਟ ਲੌਗ ਦੇਖ ਸਕਦੇ ਹਨ।</li>
          <li>ਤੁਹਾਡਾ ਨਾਮ, ਭੂਮਿਕਾ, ਅਤੇ ਗਤੀਵਿਧੀ ਦੇ ਟਾਈਮਸਟੈਂਪ ਹੋਰ ਦੁਕਾਨ ਦੇ ਮੈਂਬਰਾਂ ਨੂੰ ਦਿਖਾਈ ਦਿੰਦੇ ਹਨ</li>
          <li>Owner ਆਪਣੀ ਦੁਕਾਨ ਲਈ ਸਦੱਸਤਾ ਅਤੇ ਪਹੁੰਚ ਦਾ ਪ੍ਰਬੰਧਨ ਕਰ ਸਕਦੇ ਹਨ</li>
        </ul>
        <p>ਅਸੀਂ ਤੁਹਾਡੇ ਡੇਟਾ ਨੂੰ ਉਹਨਾਂ ਦੁਕਾਨਾਂ ਨਾਲ ਸਾਂਝਾ ਨਹੀਂ ਕਰਦੇ ਜਿਨ੍ਹਾਂ ਦੇ ਤੁਸੀਂ ਮੈਂਬਰ ਨਹੀਂ ਹੋ, ਨਾ ਹੀ ਕਿਸੇ ਗੈਰ-ਸੰਬੰਧਿਤ ਤੀਜੀ ਧਿਰ ਨਾਲ।</p>
      </div>
    </details>

    <details id="s8">
      <summary><h2>8. ਬੱਚਿਆਂ ਦੀ ਗੋਪਨੀਯਤਾ</h2></summary>
      <div class="section-content">
        <p>Samaan-Bol 13 ਸਾਲ ਤੋਂ ਘੱਟ ਉਮਰ ਦੇ ਬੱਚਿਆਂ ਦੁਆਰਾ ਵਰਤਣ ਲਈ ਨਹੀਂ ਹੈ। ਅਸੀਂ ਜਾਣਬੁੱਝ ਕੇ 13 ਸਾਲ ਤੋਂ ਘੱਟ ਉਮਰ ਦੇ ਬੱਚਿਆਂ ਤੋਂ ਨਿੱਜੀ ਜਾਣਕਾਰੀ ਇਕੱਠੀ ਨਹੀਂ ਕਰਦੇ। ਜੇਕਰ ਤੁਹਾਨੂੰ ਲੱਗਦਾ ਹੈ ਕਿ ਕਿਸੇ ਬੱਚੇ ਨੇ ਸਾਨੂੰ ਨਿੱਜੀ ਜਾਣਕਾਰੀ ਪ੍ਰਦਾਨ ਕੀਤੀ ਹੈ, ਤਾਂ ਕਿਰਪਾ ਕਰਕੇ ਸਾਡੇ ਨਾਲ ਸੰਪਰਕ ਕਰੋ ਅਤੇ ਅਸੀਂ ਇਸਨੂੰ ਤੁਰੰਤ ਮਿਟਾ ਦੇਵਾਂਗੇ।</p>
      </div>
    </details>

    <details id="s9">
      <summary><h2>9. ਤੁਹਾਡੇ ਅਧਿਕਾਰ</h2></summary>
      <div class="section-content">
        <p>ਤੁਹਾਨੂੰ ਇਹ ਕਰਨ ਦਾ ਅਧਿਕਾਰ ਹੈ:</p>
        <ul>
          <li><strong>ਆਪਣੇ ਡੇਟਾ ਤੱਕ ਪਹੁੰਚ ਕਰੋ:</strong> ਐਪ ਦੇ ਅੰਦਰ ਆਪਣੀ ਵਸਤੂ ਸੂਚੀ, ਆਡਿਟ ਲੌਗਸ ਅਤੇ ਤਰਜੀਹਾਂ ਦੇਖੋ</li>
          <li><strong>ਆਪਣਾ ਡੇਟਾ ਮਿਟਾਓ:</strong> ਸੈਟਿੰਗਾਂ ਵਿੱਚ ਖਾਤਾ ਮਿਟਾਉਣ ਦੀ ਵਿਸ਼ੇਸ਼ਤਾ ਦੀ ਵਰਤੋਂ ਕਰੋ</li>
          <li><strong>ਕੰਟਰੋਲ ਤਰਜੀਹਾਂ:</strong> ਕਿਸੇ ਵੀ ਸਮੇਂ ਆਪਣੀ ਭਾਸ਼ਾ, ਡਿਸਪਲੇ ਅਤੇ ਵੌਇਸ ਸੈਟਿੰਗਾਂ ਨੂੰ ਸੋਧੋ</li>
          <li><strong>ਦੁਕਾਨਾਂ ਤੋਂ ਕਢਵਾਉਣਾ:</strong> ਕਿਸੇ ਵੀ ਦੁਕਾਨ ਨੂੰ ਛੱਡੋ ਜਿਸ ਦੇ ਤੁਸੀਂ ਮੈਂਬਰ ਹੋ</li>
        </ul>
      </div>
    </details>

    <details id="s10">
      <summary><h2>10. ਇਸ ਨੀਤੀ ਵਿੱਚ ਬਦਲਾਅ</h2></summary>
      <div class="section-content">
        <p>ਅਸੀਂ ਸਮੇਂ-ਸਮੇਂ 'ਤੇ ਇਸ ਗੋਪਨੀਯਤਾ ਨੀਤੀ ਨੂੰ ਅਪਡੇਟ ਕਰ ਸਕਦੇ ਹਾਂ। ਜਦੋਂ ਅਸੀਂ ਕਰਦੇ ਹਾਂ, ਅਸੀਂ ਇਸ ਪੰਨੇ ਦੇ ਸਿਖਰ 'ਤੇ "ਪ੍ਰਭਾਵੀ ਮਿਤੀ" ਨੂੰ ਅਪਡੇਟ ਕਰਾਂਗੇ। ਅਸੀਂ ਤੁਹਾਨੂੰ ਸਮੇਂ-ਸਮੇਂ 'ਤੇ ਇਸ ਨੀਤੀ ਦੀ ਸਮੀਖਿਆ ਕਰਨ ਲਈ ਉਤਸ਼ਾਹਿਤ ਕਰਦੇ ਹਾਂ। ਤਬਦੀਲੀਆਂ ਤੋਂ ਬਾਅਦ ਐਪ ਦੀ ਨਿਰੰਤਰ ਵਰਤੋਂ ਅਪਡੇਟ ਕੀਤੀ ਨੀਤੀ ਨੂੰ ਸਵੀਕਾਰ ਕਰਦੀ ਹੈ।</p>
      </div>
    </details>

    <details id="s11">
      <summary><h2>11. ਸਾਡੇ ਨਾਲ ਸੰਪਰਕ ਕਰੋ</h2></summary>
      <div class="section-content">
        <p>ਜੇਕਰ ਤੁਹਾਡੇ ਕੋਲ ਇਸ ਗੋਪਨੀਯਤਾ ਨੀਤੀ ਜਾਂ ਤੁਹਾਡੇ ਡੇਟਾ ਬਾਰੇ ਕੋਈ ਸਵਾਲ ਹਨ, ਤਾਂ ਕਿਰਪਾ ਕਰਕੇ ਸਾਡੇ ਨਾਲ ਇੱਥੇ ਸੰਪਰਕ ਕਰੋ:</p>
        <p><strong>Email:</strong> <a href="mailto:meetslimshady07@gmail.com">meetslimshady07@gmail.com</a></p>
      </div>
    </details>

    <p class="copyright">© 2026 Samaan-Bol। ਸਾਰੇ ਹੱਕ ਰਾਖਵੇਂ ਹਨ.</p>
  </div>

  <button class="back-to-top" id="backToTop" aria-label="Back to top">↑</button>`,
    terms: `<div class="reading-progress" id="readingProgress"></div>

  <div class="container">
    <a href="/" class="back">← ਘਰ ਵਾਪਸ ਜਾਓ</a>
    <h1>ਸੇਵਾ ਦੀਆਂ ਸ਼ਰਤਾਂ</h1>
    <p class="effective">ਲਾਗੂ ਹੋਣ ਦੀ ਮਿਤੀ: 23 ਫਰਵਰੀ, 2026</p>

    <nav class="toc">
      <h3>ਸਮੱਗਰੀ</h3>
      <ol>
        <li><a href="#s1">ਸੇਵਾ ਦਾ ਵੇਰਵਾ</a></li>
        <li><a href="#s2">ਖਾਤਾ ਰਜਿਸਟਰੇਸ਼ਨ</a></li>
        <li><a href="#s3">ਉਪਭੋਗਤਾ ਦੀਆਂ ਭੂਮਿਕਾਵਾਂ ਅਤੇ ਜ਼ਿੰਮੇਵਾਰੀਆਂ</a></li>
        <li><a href="#s4">ਵੌਇਸ ਇਨਪੁੱਟ</a></li>
        <li><a href="#s5">ਸਵੀਕਾਰਯੋਗ ਵਰਤੋਂ</a></li>
        <li><a href="#s6">ਤੁਹਾਡਾ ਡੇਟਾ</a></li>
        <li><a href="#s7">ਸੇਵਾ ਉਪਲਬਧਤਾ</a></li>
        <li><a href="#s8">ਦਰ ਸੀਮਾਵਾਂ</a></li>
        <li><a href="#s9">ਖਾਤਾ ਸਮਾਪਤੀ</a></li>
        <li><a href="#s10">ਬੌਧਿਕ ਸੰਪੱਤੀ</a></li>
        <li><a href="#s11">ਵਾਰੰਟੀਆਂ ਦਾ ਬੇਦਾਅਵਾ</a></li>
        <li><a href="#s12">ਦੇਣਦਾਰੀ ਦੀ ਸੀਮਾ</a></li>
        <li><a href="#s13">ਇਹਨਾਂ ਸ਼ਰਤਾਂ ਵਿੱਚ ਬਦਲਾਅ</a></li>
        <li><a href="#s14">ਗਵਰਨਿੰਗ ਕਾਨੂੰਨ</a></li>
        <li><a href="#s15">ਸਾਡੇ ਨਾਲ ਸੰਪਰਕ ਕਰੋ</a></li>
      </ol>
    </nav>

    <p>Samaan-Bol ਵਿੱਚ ਸੁਆਗਤ ਹੈ। ਇਹ ਸੇਵਾ ਦੀਆਂ ਸ਼ਰਤਾਂ ("ਸ਼ਰਤਾਂ") Samaan-Bol ਮੋਬਾਈਲ ਐਪਲੀਕੇਸ਼ਨ ਅਤੇ ਸੰਬੰਧਿਤ ਸੇਵਾਵਾਂ (ਸਮੂਹਿਕ ਤੌਰ 'ਤੇ, "ਸੇਵਾ") ਦੀ ਤੁਹਾਡੀ ਵਰਤੋਂ ਨੂੰ ਨਿਯੰਤ੍ਰਿਤ ਕਰਦੀਆਂ ਹਨ। ਇੱਕ ਖਾਤਾ ਬਣਾ ਕੇ ਜਾਂ ਸੇਵਾ ਦੀ ਵਰਤੋਂ ਕਰਕੇ, ਤੁਸੀਂ ਇਹਨਾਂ ਸ਼ਰਤਾਂ ਦੁਆਰਾ ਪਾਬੰਦ ਹੋਣ ਲਈ ਸਹਿਮਤ ਹੁੰਦੇ ਹੋ।</p>

    <details open id="s1">
      <summary><h2>1. ਸੇਵਾ ਦਾ ਵਰਣਨ</h2></summary>
      <div class="section-content">
        <p>Samaan-Bol ਇੱਕ ਵੌਇਸ-ਪਹਿਲੀ ਸਹਿਯੋਗੀ ਵਸਤੂ ਪ੍ਰਬੰਧਨ ਐਪਲੀਕੇਸ਼ਨ ਹੈ ਜੋ ਭਾਰਤੀ ਰਿਟੇਲ ਕਾਰੋਬਾਰਾਂ ਲਈ ਤਿਆਰ ਕੀਤੀ ਗਈ ਹੈ। ਸੇਵਾ ਤੁਹਾਨੂੰ ਇਹ ਕਰਨ ਦੀ ਇਜਾਜ਼ਤ ਦਿੰਦੀ ਹੈ:</p>
        <ul>
          <li>ਕਈ ਭਾਰਤੀ ਭਾਸ਼ਾਵਾਂ ਵਿੱਚ ਵੌਇਸ ਕਮਾਂਡਾਂ ਦੀ ਵਰਤੋਂ ਕਰਕੇ ਉਤਪਾਦ ਵਸਤੂਆਂ ਦਾ ਪ੍ਰਬੰਧਨ ਕਰੋ</li>
          <li>ਸਟਾਕ ਦੇ ਪੱਧਰਾਂ, ਬੈਚਾਂ, ਮਿਆਦ ਪੁੱਗਣ ਦੀਆਂ ਤਾਰੀਖਾਂ ਅਤੇ ਖਰੀਦ ਜਾਣਕਾਰੀ ਨੂੰ ਟਰੈਕ ਕਰੋ</li>
          <li>ਰੋਲ-ਅਧਾਰਿਤ ਪਹੁੰਚ (Owner, Manager, Helper) ਦੁਆਰਾ ਟੀਮ ਦੇ ਮੈਂਬਰਾਂ ਨਾਲ ਸਹਿਯੋਗ ਕਰੋ</li>
          <li>ਸਾਰੀਆਂ ਵਸਤੂ-ਸੂਚੀ ਤਬਦੀਲੀਆਂ ਦੇ ਆਡਿਟ ਟ੍ਰੇਲ ਦੇਖੋ</li>
          <li>ਖਰੀਦ ਸੂਚੀਆਂ ਦਾ ਪ੍ਰਬੰਧਨ ਕਰੋ ਅਤੇ ਸਟਾਕ-ਪੱਧਰ ਦੀਆਂ ਚੇਤਾਵਨੀਆਂ ਪ੍ਰਾਪਤ ਕਰੋ</li>
        </ul>
      </div>
    </details>

    <details id="s2">
      <summary><h2>2. ਖਾਤਾ ਰਜਿਸਟਰੇਸ਼ਨ</h2></summary>
      <div class="section-content">
        <p>ਸੇਵਾ ਦੀ ਵਰਤੋਂ ਕਰਨ ਲਈ, ਤੁਹਾਨੂੰ ਸਹੀ ਅਤੇ ਪੂਰੀ ਜਾਣਕਾਰੀ ਪ੍ਰਦਾਨ ਕਰਕੇ ਇੱਕ ਖਾਤਾ ਬਣਾਉਣਾ ਚਾਹੀਦਾ ਹੈ। ਤੁਸੀਂ ਇਸ ਲਈ ਜ਼ਿੰਮੇਵਾਰ ਹੋ:</p>
        <ul>
          <li>ਤੁਹਾਡੇ ਖਾਤੇ ਦੇ ਪ੍ਰਮਾਣ ਪੱਤਰਾਂ ਦੀ ਗੁਪਤਤਾ ਨੂੰ ਕਾਇਮ ਰੱਖਣਾ</li>
          <li>ਸਾਰੀ ਗਤੀਵਿਧੀ ਜੋ ਤੁਹਾਡੇ ਖਾਤੇ ਦੇ ਅਧੀਨ ਹੁੰਦੀ ਹੈ</li>
          <li>ਤੁਹਾਡੇ ਖਾਤੇ ਦੀ ਕਿਸੇ ਵੀ ਅਣਅਧਿਕਾਰਤ ਵਰਤੋਂ ਬਾਰੇ ਸਾਨੂੰ ਤੁਰੰਤ ਸੂਚਿਤ ਕਰਨਾ</li>
        </ul>
        <p>ਇੱਕ ਖਾਤਾ ਬਣਾਉਣ ਅਤੇ ਸੇਵਾ ਦੀ ਵਰਤੋਂ ਕਰਨ ਲਈ ਤੁਹਾਡੀ ਉਮਰ ਘੱਟੋ-ਘੱਟ 13 ਸਾਲ ਹੋਣੀ ਚਾਹੀਦੀ ਹੈ।</p>
      </div>
    </details>

    <details id="s3">
      <summary><h2>3. ਉਪਭੋਗਤਾ ਦੀਆਂ ਭੂਮਿਕਾਵਾਂ ਅਤੇ ਜ਼ਿੰਮੇਵਾਰੀਆਂ</h2></summary>
      <div class="section-content">
        <p>Samaan-Bolਇੱਕ ਰੋਲ-ਅਧਾਰਿਤ ਐਕਸੈਸ ਕੰਟਰੋਲ ਸਿਸਟਮ ਦੀ ਵਰਤੋਂ ਕਰਦਾ ਹੈ:</p>
        <ul>
          <li><strong>Owner:</strong> ਦੁਕਾਨਾਂ ਬਣਾਉਂਦਾ ਅਤੇ ਪ੍ਰਬੰਧਿਤ ਕਰਦਾ ਹੈ, ਟੀਮ ਦੇ ਮੈਂਬਰਾਂ ਨੂੰ ਸੱਦਾ ਦਿੰਦਾ ਹੈ, ਦੁਕਾਨ ਦੇ ਸਾਰੇ ਡੇਟਾ ਅਤੇ ਸੈਟਿੰਗਾਂ ਤੱਕ ਪੂਰੀ ਪਹੁੰਚ ਰੱਖਦਾ ਹੈ, ਅਤੇ ਦੁਕਾਨ ਨੂੰ ਮਿਟਾ ਸਕਦਾ ਹੈ</li>
          <li><strong>Manager:</strong> ਵਸਤੂਆਂ ਦਾ ਪ੍ਰਬੰਧਨ ਕਰ ਸਕਦਾ ਹੈ, ਰਿਪੋਰਟਾਂ ਦੇਖ ਸਕਦਾ ਹੈ, ਅਤੇ ਦੁਕਾਨ ਦੇ ਅੰਦਰ ਜ਼ਿਆਦਾਤਰ ਓਪਰੇਸ਼ਨ ਕਰ ਸਕਦਾ ਹੈ</li>
          <li><strong>Helper:</strong> ਨਿਰਦੇਸ਼ਿਤ ਅਨੁਸਾਰ ਸਟਾਕ ਆਈਟਮਾਂ ਨੂੰ ਜੋੜ ਅਤੇ ਹਟਾ ਸਕਦਾ ਹੈ</li>
        </ul>
        <p>ਇੱਕ Owner ਦੇ ਤੌਰ 'ਤੇ, ਤੁਸੀਂ ਆਪਣੀ ਦੁਕਾਨ ਤੱਕ ਪਹੁੰਚ ਅਤੇ ਇਸਦੇ ਅੰਦਰਲੇ ਡੇਟਾ ਦੇ ਪ੍ਰਬੰਧਨ ਲਈ ਜ਼ਿੰਮੇਵਾਰ ਹੋ। ਜਦੋਂ ਤੁਸੀਂ ਮੈਂਬਰਾਂ ਨੂੰ ਸੱਦਾ ਦਿੰਦੇ ਹੋ, ਤਾਂ ਉਹ ਤੁਹਾਡੀ ਦੁਕਾਨ ਦੇ ਵਸਤੂ-ਸੂਚੀ ਡੇਟਾ ਤੱਕ ਪਹੁੰਚ ਪ੍ਰਾਪਤ ਕਰਦੇ ਹਨ।</p>
      </div>
    </details>

    <details id="s4">
      <summary><h2>4. ਵੌਇਸ ਇੰਪੁੱਟ</h2></summary>
      <div class="section-content">
        <p>ਸੇਵਾ ਤੀਜੀ-ਧਿਰ AI ਸੇਵਾਵਾਂ ਦੀ ਵਰਤੋਂ ਕਰਕੇ ਵੌਇਸ ਕਮਾਂਡਾਂ ਦੀ ਪ੍ਰਕਿਰਿਆ ਕਰਦੀ ਹੈ। ਕਿਰਪਾ ਕਰਕੇ ਧਿਆਨ ਰੱਖੋ ਕਿ:</p>
        <ul>
          <li>ਵੌਇਸ ਰਿਕਾਰਡਿੰਗ ਪ੍ਰਤੀ ਕਮਾਂਡ ਵੱਧ ਤੋਂ ਵੱਧ 30 ਸਕਿੰਟਾਂ ਤੱਕ ਸੀਮਿਤ ਹੈ</li>
          <li>ਇਹ ਸੇਵਾ ਅੰਗਰੇਜ਼ੀ, ਹਿੰਦੀ, ਤਾਮਿਲ, ਤੇਲਗੂ, ਬੰਗਾਲੀ, ਮਰਾਠੀ, ਕੰਨੜ, ਗੁਜਰਾਤੀ, ਮਲਿਆਲਮ, ਅਤੇ ਹਿੰਗਲਿਸ਼ ਸਮੇਤ ਕਈ ਭਾਸ਼ਾਵਾਂ ਦਾ ਸਮਰਥਨ ਕਰਦੀ ਹੈ</li>
          <li>ਅਵਾਜ਼ ਪਛਾਣ ਦੀ ਸ਼ੁੱਧਤਾ ਆਡੀਓ ਗੁਣਵੱਤਾ, ਪਿਛੋਕੜ ਸ਼ੋਰ, ਲਹਿਜ਼ਾ, ਅਤੇ ਭਾਸ਼ਾ ਦੀ ਸਪਸ਼ਟਤਾ 'ਤੇ ਨਿਰਭਰ ਕਰਦੀ ਹੈ</li>
          <li>ਤੁਹਾਨੂੰ ਸ਼ੁੱਧਤਾ ਦੀ ਪੁਸ਼ਟੀ ਕਰਨ ਲਈ ਵੌਇਸ-ਪ੍ਰੋਸੈਸ ਕੀਤੀਆਂ ਵਸਤੂਆਂ ਦੀਆਂ ਤਬਦੀਲੀਆਂ ਦੀ ਸਮੀਖਿਆ ਕਰਨੀ ਚਾਹੀਦੀ ਹੈ</li>
          <li>ਵੌਇਸ ਆਡੀਓ ਨੂੰ ਰੀਅਲ-ਟਾਈਮ ਵਿੱਚ ਪ੍ਰੋਸੈਸ ਕੀਤਾ ਜਾਂਦਾ ਹੈ ਅਤੇ ਸਥਾਈ ਤੌਰ 'ਤੇ ਸਟੋਰ ਨਹੀਂ ਕੀਤਾ ਜਾਂਦਾ ਹੈ (ਦੇਖੋ ਸਾਡੇ <a href="/privacy-policy">ਗੋਪਨੀਯਤਾ ਨੀਤੀ</a> ਵੇਰਵਿਆਂ ਲਈ)</li>
        </ul>
      </div>
    </details>

    <details id="s5">
      <summary><h2>5. ਸਵੀਕਾਰਯੋਗ ਵਰਤੋਂ</h2></summary>
      <div class="section-content">
        <p>ਤੁਸੀਂ ਸਹਿਮਤ ਨਹੀਂ ਹੋ:</p>
        <ul>
          <li>ਕਿਸੇ ਵੀ ਗੈਰ-ਕਾਨੂੰਨੀ ਉਦੇਸ਼ ਲਈ ਸੇਵਾ ਦੀ ਵਰਤੋਂ ਕਰੋ</li>
          <li>ਦੂਜੇ ਉਪਭੋਗਤਾਵਾਂ ਦੇ ਖਾਤਿਆਂ ਜਾਂ ਦੁਕਾਨਾਂ ਤੱਕ ਅਣਅਧਿਕਾਰਤ ਪਹੁੰਚ ਪ੍ਰਾਪਤ ਕਰਨ ਦੀ ਕੋਸ਼ਿਸ਼ ਕਰੋ</li>
          <li>ਸੇਵਾ ਜਾਂ ਇਸਦੇ ਬੁਨਿਆਦੀ ਢਾਂਚੇ ਵਿੱਚ ਦਖਲ ਜਾਂ ਵਿਘਨ ਪਾਓ</li>
          <li>ਰਿਵਰਸ-ਇੰਜੀਨੀਅਰ, ਡੀਕੰਪਾਈਲ, ਜਾਂ ਐਪਲੀਕੇਸ਼ਨ ਨੂੰ ਵੱਖ ਕਰਨਾ</li>
          <li>ਆਮ ਵਰਤੋਂ ਦੇ ਪੈਟਰਨਾਂ ਤੋਂ ਪਰੇ ਸੇਵਾ ਤੱਕ ਪਹੁੰਚ ਕਰਨ ਲਈ ਸਵੈਚਲਿਤ ਸਾਧਨਾਂ ਦੀ ਵਰਤੋਂ ਕਰੋ</li>
          <li>ਸੱਦਾ ਕੋਡਾਂ ਨੂੰ ਜਨਤਕ ਤੌਰ 'ਤੇ ਜਾਂ ਉਹਨਾਂ ਵਿਅਕਤੀਆਂ ਨਾਲ ਸਾਂਝਾ ਕਰੋ ਜਿਨ੍ਹਾਂ ਦਾ ਤੁਹਾਡੀ ਦੁਕਾਨ ਵਿੱਚ ਸ਼ਾਮਲ ਹੋਣ ਦਾ ਇਰਾਦਾ ਨਹੀਂ ਹੈ</li>
          <li>ਦੁਕਾਨ ਦੇ ਅੰਦਰ ਆਪਣੀ ਪਛਾਣ ਜਾਂ ਭੂਮਿਕਾ ਨੂੰ ਗਲਤ ਢੰਗ ਨਾਲ ਪੇਸ਼ ਕਰੋ</li>
        </ul>
      </div>
    </details>

    <details id="s6">
      <summary><h2>6. ਤੁਹਾਡਾ ਡੇਟਾ</h2></summary>
      <div class="section-content">
        <p>ਤੁਸੀਂ ਸੇਵਾ ਵਿੱਚ ਦਾਖਲ ਕੀਤੇ ਕਾਰੋਬਾਰੀ ਡੇਟਾ ਦੀ ਮਲਕੀਅਤ ਬਰਕਰਾਰ ਰੱਖਦੇ ਹੋ (ਉਤਪਾਦ ਜਾਣਕਾਰੀ, ਵਸਤੂ ਰਿਕਾਰਡ, ਆਦਿ)। ਅਸੀਂ ਤੁਹਾਡੀ ਸਮੱਗਰੀ ਦੀ ਮਲਕੀਅਤ ਦਾ ਦਾਅਵਾ ਨਹੀਂ ਕਰਦੇ ਹਾਂ।</p>
        <p>ਸੇਵਾ ਦੀ ਵਰਤੋਂ ਕਰਕੇ, ਤੁਸੀਂ ਸਾਨੂੰ ਸਿਰਫ਼ ਸੇਵਾ ਪ੍ਰਦਾਨ ਕਰਨ ਅਤੇ ਬਿਹਤਰ ਬਣਾਉਣ ਦੇ ਉਦੇਸ਼ ਲਈ ਆਪਣੇ ਡੇਟਾ ਨੂੰ ਸਟੋਰ ਕਰਨ, ਪ੍ਰਕਿਰਿਆ ਕਰਨ ਅਤੇ ਸੰਚਾਰਿਤ ਕਰਨ ਲਈ ਇੱਕ ਸੀਮਤ ਲਾਇਸੈਂਸ ਦਿੰਦੇ ਹੋ।</p>
        <p>ਅਸੀਂ ਤੁਹਾਡੇ ਡੇਟਾ ਨੂੰ ਕਿਵੇਂ ਇਕੱਤਰ ਕਰਦੇ ਹਾਂ, ਵਰਤਦੇ ਹਾਂ ਅਤੇ ਸੁਰੱਖਿਅਤ ਕਰਦੇ ਹਾਂ, ਇਸ ਬਾਰੇ ਵੇਰਵਿਆਂ ਲਈ, ਕਿਰਪਾ ਕਰਕੇ ਸਾਡੀ ਸਮੀਖਿਆ ਕਰੋ <a href="/privacy-policy">ਗੋਪਨੀਯਤਾ ਨੀਤੀ</a>.</p>
      </div>
    </details>

    <details id="s7">
      <summary><h2>7. ਸੇਵਾ ਉਪਲਬਧਤਾ</h2></summary>
      <div class="section-content">
        <p>ਅਸੀਂ ਸੇਵਾ ਨੂੰ ਹਰ ਸਮੇਂ ਉਪਲਬਧ ਰੱਖਣ ਦੀ ਕੋਸ਼ਿਸ਼ ਕਰਦੇ ਹਾਂ, ਪਰ ਅਸੀਂ ਨਿਰਵਿਘਨ ਪਹੁੰਚ ਦੀ ਗਰੰਟੀ ਨਹੀਂ ਦਿੰਦੇ ਹਾਂ। ਸੇਵਾ ਇਹਨਾਂ ਕਾਰਨਾਂ ਕਰਕੇ ਅਸਥਾਈ ਤੌਰ 'ਤੇ ਅਣਉਪਲਬਧ ਹੋ ਸਕਦੀ ਹੈ:</p>
        <ul>
          <li>ਯੋਜਨਾਬੱਧ ਰੱਖ-ਰਖਾਅ ਜਾਂ ਅੱਪਡੇਟ</li>
          <li>ਤਕਨੀਕੀ ਮੁੱਦੇ ਸਾਡੇ ਨਿਯੰਤਰਣ ਤੋਂ ਬਾਹਰ ਹਨ</li>
          <li>ਤੀਜੀ-ਧਿਰ ਦੀ ਸੇਵਾ ਬੰਦ (ਪ੍ਰਮਾਣਿਕਤਾ, ਵੌਇਸ ਪ੍ਰੋਸੈਸਿੰਗ, ਡਾਟਾਬੇਸ ਹੋਸਟਿੰਗ)</li>
        </ul>
        <p>ਅਸੀਂ ਸਰਵਿਸ ਡਾਊਨਟਾਈਮ ਦੇ ਨਤੀਜੇ ਵਜੋਂ ਕਿਸੇ ਵੀ ਨੁਕਸਾਨ ਲਈ ਜ਼ਿੰਮੇਵਾਰ ਨਹੀਂ ਹਾਂ।</p>
      </div>
    </details>

    <details id="s8">
      <summary><h2>8. ਦਰ ਸੀਮਾਵਾਂ</h2></summary>
      <div class="section-content">
        <p>ਨਿਰਪੱਖ ਵਰਤੋਂ ਅਤੇ ਸੇਵਾ ਸਥਿਰਤਾ ਨੂੰ ਯਕੀਨੀ ਬਣਾਉਣ ਲਈ, ਸੇਵਾAPIਬੇਨਤੀਆਂ 'ਤੇ ਦਰ ਸੀਮਾਵਾਂ ਨੂੰ ਲਾਗੂ ਕਰਦੀ ਹੈ। ਇਹਨਾਂ ਸੀਮਾਵਾਂ ਨੂੰ ਪਾਰ ਕਰਨ ਦੇ ਨਤੀਜੇ ਵਜੋਂ ਤੁਹਾਡੀਆਂ ਬੇਨਤੀਆਂ ਦੀ ਅਸਥਾਈ ਥਰੋਟਲਿੰਗ ਹੋ ਸਕਦੀ ਹੈ।</p>
      </div>
    </details>

    <details id="s9">
      <summary><h2>9. ਖਾਤਾ ਸਮਾਪਤੀ</h2></summary>
      <div class="section-content">
        <p>ਤੁਸੀਂ ਕਿਸੇ ਵੀ ਸਮੇਂ ਆਪਣੇ ਖਾਤੇ ਨੂੰ ਮਿਟਾ ਸਕਦੇ ਹੋ <strong>Settings > Delete Account</strong> ਐਪ ਵਿੱਚ. ਖਾਤਾ ਮਿਟਾਉਣਾ ਸਥਾਈ ਅਤੇ ਅਟੱਲ ਹੈ — ਤੁਹਾਡੀਆਂ ਸਾਰੀਆਂ ਦੁਕਾਨਾਂ, ਵਸਤੂ ਸੂਚੀ ਡੇਟਾ, ਆਡਿਟ ਲੌਗਸ, ਅਤੇ ਤਰਜੀਹਾਂ ਨੂੰ ਸਥਾਈ ਤੌਰ 'ਤੇ ਹਟਾ ਦਿੱਤਾ ਜਾਵੇਗਾ।</p>
        <p>ਅਸੀਂ ਉਹਨਾਂ ਖਾਤਿਆਂ ਨੂੰ ਮੁਅੱਤਲ ਜਾਂ ਸਮਾਪਤ ਕਰਨ ਦਾ ਅਧਿਕਾਰ ਰਾਖਵਾਂ ਰੱਖਦੇ ਹਾਂ ਜੋ ਇਹਨਾਂ ਨਿਯਮਾਂ ਦੀ ਉਲੰਘਣਾ ਕਰਦੇ ਹਨ ਜਾਂ ਦੁਰਵਿਵਹਾਰ ਵਿੱਚ ਸ਼ਾਮਲ ਹੁੰਦੇ ਹਨ।</p>
      </div>
    </details>

    <details id="s10">
      <summary><h2>10. ਬੌਧਿਕ ਸੰਪੱਤੀ</h2></summary>
      <div class="section-content">
        <p>Samaan-Bol ਐਪਲੀਕੇਸ਼ਨ, ਇਸਦੇ ਡਿਜ਼ਾਈਨ, ਕੋਡ, ਬ੍ਰਾਂਡਿੰਗ ਅਤੇ ਦਸਤਾਵੇਜ਼ਾਂ ਸਮੇਤ, ਸਾਡੀ ਬੌਧਿਕ ਸੰਪਤੀ ਹੈ। ਤੁਸੀਂ ਸਾਡੀ ਲਿਖਤੀ ਇਜਾਜ਼ਤ ਤੋਂ ਬਿਨਾਂ ਐਪਲੀਕੇਸ਼ਨ ਦੇ ਆਧਾਰ 'ਤੇ ਡੈਰੀਵੇਟਿਵ ਕੰਮਾਂ ਦੀ ਨਕਲ, ਸੋਧ, ਵੰਡ ਜਾਂ ਰਚਨਾ ਨਹੀਂ ਕਰ ਸਕਦੇ।</p>
      </div>
    </details>

    <details id="s11">
      <summary><h2>11. ਵਾਰੰਟੀਆਂ ਦਾ ਬੇਦਾਅਵਾ</h2></summary>
      <div class="section-content">
        <p>ਸੇਵਾ ਕਿਸੇ ਵੀ ਕਿਸਮ ਦੀ ਵਾਰੰਟੀ ਦੇ ਬਿਨਾਂ "ਜਿਵੇਂ ਹੈ" ਅਤੇ "ਜਿਵੇਂ ਉਪਲਬਧ ਹੈ" ਪ੍ਰਦਾਨ ਕੀਤੀ ਜਾਂਦੀ ਹੈ, ਭਾਵੇਂ ਸਪਸ਼ਟ ਜਾਂ ਅਪ੍ਰਤੱਖ। ਅਸੀਂ ਖਾਸ ਤੌਰ 'ਤੇ ਇਹਨਾਂ ਦੀਆਂ ਵਾਰੰਟੀਆਂ ਦਾ ਖੰਡਨ ਕਰਦੇ ਹਾਂ:</p>
        <ul>
          <li>ਕਿਸੇ ਖਾਸ ਉਦੇਸ਼ ਲਈ ਵਪਾਰਕਤਾ ਜਾਂ ਤੰਦਰੁਸਤੀ</li>
          <li>ਅਵਾਜ਼ ਦੀ ਪਛਾਣ ਜਾਂ AI ਦੁਆਰਾ ਤਿਆਰ ਕੀਤੇ ਸੁਝਾਵਾਂ ਦੀ ਸ਼ੁੱਧਤਾ</li>
          <li>ਨਿਰਵਿਘਨ ਜਾਂ ਗਲਤੀ-ਮੁਕਤ ਕਾਰਵਾਈ</li>
        </ul>
        <p>ਵੌਇਸ-ਆਧਾਰਿਤ ਵਸਤੂਆਂ ਦੀਆਂ ਕਾਰਵਾਈਆਂ ਸਹਾਇਕ ਹਨ - ਤੁਹਾਨੂੰ ਨਾਜ਼ੁਕ ਸਟਾਕ ਫੈਸਲਿਆਂ ਦੀ ਸੁਤੰਤਰ ਤੌਰ 'ਤੇ ਪੁਸ਼ਟੀ ਕਰਨੀ ਚਾਹੀਦੀ ਹੈ।</p>
      </div>
    </details>

    <details id="s12">
      <summary><h2>12. ਦੇਣਦਾਰੀ ਦੀ ਸੀਮਾ</h2></summary>
      <div class="section-content">
        <p>ਕਨੂੰਨ ਦੁਆਰਾ ਇਜਾਜ਼ਤ ਦਿੱਤੀ ਗਈ ਅਧਿਕਤਮ ਹੱਦ ਤੱਕ, ਅਸੀਂ ਸੇਵਾ ਦੀ ਤੁਹਾਡੀ ਵਰਤੋਂ ਤੋਂ ਪੈਦਾ ਹੋਣ ਵਾਲੇ ਕਿਸੇ ਵੀ ਅਸਿੱਧੇ, ਇਤਫਾਕਨ, ਵਿਸ਼ੇਸ਼, ਪਰਿਣਾਮਿਕ, ਜਾਂ ਦੰਡਕਾਰੀ ਨੁਕਸਾਨ ਲਈ ਜਵਾਬਦੇਹ ਨਹੀਂ ਹੋਵਾਂਗੇ, ਜਿਸ ਵਿੱਚ ਸ਼ਾਮਲ ਹਨ ਪਰ ਇਹਨਾਂ ਤੱਕ ਸੀਮਿਤ ਨਹੀਂ:</p>
        <ul>
          <li>ਵੌਇਸ ਪਛਾਣ ਦੀਆਂ ਤਰੁੱਟੀਆਂ ਦੇ ਨਤੀਜੇ ਵਜੋਂ ਵਸਤੂ ਸੂਚੀ ਵਿੱਚ ਅੰਤਰ</li>
          <li>ਸਰਵਿਸ ਡਾਊਨਟਾਈਮ ਕਾਰਨ ਵਪਾਰਕ ਨੁਕਸਾਨ</li>
          <li>ਸਾਡੀਆਂ ਮਿਆਰੀ ਬੈਕਅਪ ਪ੍ਰਕਿਰਿਆਵਾਂ ਦੁਆਰਾ ਕਵਰ ਕੀਤੇ ਗਏ ਡੇਟਾ ਤੋਂ ਪਰੇ ਡੇਟਾ ਦਾ ਨੁਕਸਾਨ</li>
        </ul>
      </div>
    </details>

    <details id="s13">
      <summary><h2>13. ਇਹਨਾਂ ਨਿਯਮਾਂ ਵਿੱਚ ਬਦਲਾਅ</h2></summary>
      <div class="section-content">
        <p>ਅਸੀਂ ਸਮੇਂ-ਸਮੇਂ 'ਤੇ ਇਹਨਾਂ ਨਿਯਮਾਂ ਨੂੰ ਅਪਡੇਟ ਕਰ ਸਕਦੇ ਹਾਂ। ਜਦੋਂ ਅਸੀਂ ਕਰਦੇ ਹਾਂ, ਅਸੀਂ ਇਸ ਪੰਨੇ ਦੇ ਸਿਖਰ 'ਤੇ "ਪ੍ਰਭਾਵੀ ਮਿਤੀ" ਨੂੰ ਅਪਡੇਟ ਕਰਾਂਗੇ। ਤਬਦੀਲੀਆਂ ਤੋਂ ਬਾਅਦ ਸੇਵਾ ਦੀ ਵਰਤੋਂ ਜਾਰੀ ਰੱਖਣ ਨਾਲ ਅੱਪਡੇਟ ਕੀਤੀਆਂ ਸ਼ਰਤਾਂ ਦੀ ਸਵੀਕ੍ਰਿਤੀ ਬਣਦੀ ਹੈ।</p>
      </div>
    </details>

    <details id="s14">
      <summary><h2>14. ਗਵਰਨਿੰਗ ਕਾਨੂੰਨ</h2></summary>
      <div class="section-content">
        <p>ਇਹ ਸ਼ਰਤਾਂ ਭਾਰਤ ਦੇ ਕਾਨੂੰਨਾਂ ਦੇ ਅਨੁਸਾਰ ਨਿਯੰਤ੍ਰਿਤ ਅਤੇ ਨਿਯੰਤ੍ਰਿਤ ਕੀਤੀਆਂ ਜਾਣਗੀਆਂ। ਇਹਨਾਂ ਨਿਯਮਾਂ ਜਾਂ ਸੇਵਾ ਤੋਂ ਪੈਦਾ ਹੋਣ ਵਾਲਾ ਕੋਈ ਵੀ ਵਿਵਾਦ ਭਾਰਤ ਵਿੱਚ ਅਦਾਲਤਾਂ ਦੇ ਵਿਸ਼ੇਸ਼ ਅਧਿਕਾਰ ਖੇਤਰ ਦੇ ਅਧੀਨ ਹੋਵੇਗਾ।</p>
      </div>
    </details>

    <details id="s15">
      <summary><h2>15. ਸਾਡੇ ਨਾਲ ਸੰਪਰਕ ਕਰੋ</h2></summary>
      <div class="section-content">
        <p>ਜੇਕਰ ਇਹਨਾਂ ਨਿਯਮਾਂ ਬਾਰੇ ਤੁਹਾਡੇ ਕੋਈ ਸਵਾਲ ਹਨ, ਤਾਂ ਕਿਰਪਾ ਕਰਕੇ ਸਾਡੇ ਨਾਲ ਇੱਥੇ ਸੰਪਰਕ ਕਰੋ:</p>
        <p><strong>Email:</strong> <a href="mailto:meetslimshady07@gmail.com">meetslimshady07@gmail.com</a></p>
      </div>
    </details>

    <p class="copyright">© 2026 Samaan-Bol। ਸਾਰੇ ਹੱਕ ਰਾਖਵੇਂ ਹਨ.</p>
  </div>

  <button class="back-to-top" id="backToTop" aria-label="Back to top">↑</button>`,
  },
  "or": {
    home: `<!-- Three.js background canvas -->
<canvas id="bgCanvas"></canvas>

<!-- Aurora ambient background (WebGL fallback) -->
<div class="aurora-bg"><div class="aurora-orb"></div></div>

<!-- Scroll progress indicator -->
<div class="scroll-progress" id="scrollProgress"></div>

<!-- ═══ NAVIGATION ═══ -->
<nav id="nav">
  <div class="container">
    <div class="nav-inner">
      <a href="#" class="logo">
        <div class="logo-mark"><svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><defs><mask id="stencil-nav"><rect x="0" y="0" width="100" height="100" fill="white"/><rect x="24" y="18" width="52" height="8" rx="4" fill="black"/><rect x="38" y="18" width="24" height="36" rx="12" fill="black"/><path d="M 28 42 A 22 22 0 0 0 72 42" fill="none" stroke="black" stroke-width="8" stroke-linecap="round"/><rect x="46" y="72" width="8" height="10" rx="4" fill="black"/><rect x="36" y="32" width="28" height="4" fill="white"/><rect x="36" y="44" width="28" height="4" fill="white"/></mask></defs><circle cx="50" cy="50" r="50" fill="#ea580c" mask="url(#stencil-nav)"/></svg></div>
        <div class="logo-text">ସାମନ୍<span>ବୋଲ୍</span></div>
      </a>
      <ul class="nav-links">
        <li><a href="#how">ଏହା କିପରି କାମ କରେ |</a></li>
        <li><a href="#features">ବ Features ଶିଷ୍ଟ୍ୟଗୁଡିକ</a></li>
        <li><a href="#ai">AI ବୁଦ୍ଧିଜୀବୀ |</a></li>
        <li><a href="#languages">ଭାଷା</a></li>
        <li><a href="https://apps.apple.com/in/app/samaan-bol/id6759739444" class="nav-cta">ଆପ୍ ଡାଉନଲୋଡ୍ କରନ୍ତୁ |</a></li>
      </ul>
      <button class="mobile-menu-btn" aria-label="Menu">☰</button>
    </div>
  </div>
</nav>

<!-- ═══ HERO ═══ -->
<section class="hero">
  <div class="container">
    <div class="hero-grid">
      <div>
        <div class="hero-eyebrow">ଭାରତୀୟ ଖୁଚୁରା ପାଇଁ ଭଏସ୍-ପ୍ରଥମ ଭଣ୍ଡାର |</div>
        <h1 class="hero-text-reveal">
          <span class="hindi-line hindi">बोल के सँभालो अपना बिज़नेस</span>
          <span class="hero-text-main">ତୁମର ଦୋକାନ ପରିଚାଳନା କର |<br>କେବଳ ତୁମର ସ୍ୱର ସହିତ</span>
        </h1>
        <p class="hero-sub">
          କଥା କୁହ | <span class="hero-rotate"><span class="hero-rotate-word active">ହିନ୍ଦୀ</span><span class="hero-rotate-word">ବଙ୍ଗାଳୀ</span><span class="hero-rotate-word">ତାମିଲ୍ |</span><span class="hero-rotate-word">ତେଲୁଗୁ</span><span class="hero-rotate-word">ମରାଠୀ</span><span class="hero-rotate-word">ଇଂରାଜୀ |</span></span>, କିମ୍ବା 10 ଟି ଭାରତୀୟ ଭାଷା ମଧ୍ୟରୁ ଯେକ .ଣସି |Samaan-Bolର AI ତୁମର ନିର୍ଦ୍ଦେଶକୁ ବୁ understand ିଥାଏ, ତୁମର ଭଣ୍ଡାରକୁ ଅପଡେଟ୍ କରେ,
          ଏବଂ ଆପଣଙ୍କର ବ୍ୟବସାୟ ଚାଲୁ ରଖେ - ହାତମୁକ୍ତ |
        </p>
        <div class="hero-actions">
          <a href="#download" class="btn-primary">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            ମାଗଣା ଡାଉନଲୋଡ୍ କରନ୍ତୁ |
          </a>
          <a href="#how" class="btn-secondary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            ଏହାକୁ କାର୍ଯ୍ୟରେ ଦେଖନ୍ତୁ |
          </a>
        </div>
        <div class="hero-stats">
          <div class="hero-stat">
            <div class="hero-stat-number">11</div>
            <div class="hero-stat-label">ଭାଷା ସମର୍ଥିତ |</div>
          </div>
          <div class="hero-stat">
            <div class="hero-stat-number">50K +</div>
            <div class="hero-stat-label">ଆଇଟମ୍ ଗୁଡିକ ପ୍ରତିଦିନ ଟ୍ରାକ୍ କରାଯାଏ |</div>
          </div>
          <div class="hero-stat">
            <div class="hero-stat-number">2 ମିନିଟ୍</div>
            <div class="hero-stat-label">ସେଟଅପ୍ ସମୟ |</div>
          </div>
        </div>
      </div>

      <div class="hero-visual">
        <!-- Floating cards (z-index 10 — in FRONT of phone) -->
        <div class="float-card float-card--voice">
          <div class="float-card-icon float-card-icon--voice"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg></div>
          <p><strong class="hindi">"चावल 5 किलो जोड़ दो"</strong></p>
          <p style="margin-top:6px; font-size:12px; color:var(--success);">✓ Basmati Rice - 18 → 23 କିଲୋଗ୍ରାମ |</p>
        </div>

        <div class="float-card float-card--alert">
          <div class="float-card-icon float-card-icon--alert"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg></div>
          <p><strong>କମ୍ ଷ୍ଟକ୍ ଆଲର୍ଟ |</strong></p>
          <p style="margin-top:4px; font-size:12px;">ଆଟା 3 ଦିନରେ ଶେଷ ହୋଇପାରେ |</p>
        </div>

        <!-- Phone mockup — mirrors actual app UI -->
        <div class="phone-frame">
          <div class="phone-notch"></div>
          <div class="phone-screen">
            <div class="phone-status-bar">
              <span>9:41</span>
              <span style="display:flex; gap:4px; align-items:center;">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z"/></svg>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><rect x="17" y="4" width="4" height="16" rx="1"/><rect x="11" y="8" width="4" height="12" rx="1"/><rect x="5" y="12" width="4" height="8" rx="1"/></svg>
                <svg width="14" height="12" viewBox="0 0 28 14" fill="currentColor"><rect x="0" y="1" width="22" height="12" rx="2" stroke="currentColor" fill="none" stroke-width="1.5"/><rect x="24" y="4.5" width="3" height="5" rx="1"/><rect x="2" y="3" width="14" height="8" rx="1"/></svg>
              </span>
            </div>

            <!-- Header: greeting + bell -->
            <div class="phone-header">
              <div>
                <div class="phone-greeting">ଶୁଭ ସକାଳ! 👋</div>
                <div class="phone-subtext">Priya General Store</div>
              </div>
              <div class="phone-bell">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B6B70" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                <div class="phone-bell-badge">3</div>
              </div>
            </div>

            <!-- Search bar with mic icon -->
            <div class="phone-search">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4A4A50" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <span class="phone-search-text">ଉତ୍ପାଦ ଖୋଜ ...</span>
              <div class="phone-search-mic">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0D0D12" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/></svg>
              </div>
            </div>

            <!-- 2x2 Stats grid -->
            <div class="phone-stats-grid">
              <div class="phone-stat-card phone-stat-card--total">
                <div class="phone-stat-number">142</div>
                <div class="phone-stat-label">ସମୁଦାୟ ଆଇଟମ୍ |</div>
              </div>
              <div class="phone-stat-card phone-stat-card--low">
                <div class="phone-stat-number" style="color:var(--warning);">8</div>
                <div class="phone-stat-label">କମ୍ ଷ୍ଟକ୍ |</div>
              </div>
              <div class="phone-stat-card phone-stat-card--out">
                <div class="phone-stat-number" style="color:var(--danger);">2</div>
                <div class="phone-stat-label">ଷ୍ଟକ୍ ବାହାରେ |</div>
              </div>
              <div class="phone-stat-card phone-stat-card--activity">
                <div class="phone-stat-number" style="color:var(--success);">23</div>
                <div class="phone-stat-label">ଆଜି ଅଦ୍ୟତନ କରାଯାଇଛି |</div>
              </div>
            </div>

            <!-- Filter chips -->
            <div class="phone-filter-row">
              <span class="phone-chip phone-chip--active">ସମସ୍ତ</span>
              <span class="phone-chip">କମ୍ ଷ୍ଟକ୍ |</span>
              <span class="phone-chip">ବାହାରେ</span>
              <span class="phone-chip">ସମାପ୍ତି</span>
            </div>

            <!-- Product cards -->
            <div class="phone-product">
              <div class="phone-product-icon" style="background:rgba(255,181,71,0.12);">🍚</div>
              <div class="phone-product-info">
                <div class="phone-product-name">Basmati Rice</div>
                <div class="phone-product-meta">ଶସ୍ୟ · 2 ମିଟର ପୂର୍ବରୁ ଅଦ୍ୟତନ କରାଯାଇଛି |</div>
              </div>
              <div class="phone-product-qty">
                <div class="phone-product-qty-num">23</div>
                <div class="phone-product-qty-unit">କି.ଗ୍ରା</div>
              </div>
            </div>

            <div class="phone-product">
              <div class="phone-product-icon" style="background:rgba(255,107,0,0.12);">🫒</div>
              <div class="phone-product-info">
                <div class="phone-product-name">Aashirvaad Atta</div>
                <div class="phone-product-meta">ମଇଦା · 1h ପୂର୍ବରୁ ଅଦ୍ୟତନ କରାଯାଇଛି |</div>
                <div class="phone-product-status phone-product-status--low">କମ୍ ଷ୍ଟକ୍ |</div>
              </div>
              <div class="phone-product-qty">
                <div class="phone-product-qty-num" style="color:var(--warning);">3</div>
                <div class="phone-product-qty-unit">କି.ଗ୍ରା</div>
              </div>
            </div>

            <div class="phone-product">
              <div class="phone-product-icon" style="background:rgba(50,213,131,0.1);">🥛</div>
              <div class="phone-product-info">
                <div class="phone-product-name">Amul Toned Milk</div>
                <div class="phone-product-meta">ଦୁଗ୍ଧ · 3h ପୂର୍ବରୁ ଅଦ୍ୟତନ କରାଯାଇଛି |</div>
              </div>
              <div class="phone-product-qty">
                <div class="phone-product-qty-num">40</div>
                <div class="phone-product-qty-unit">pkt</div>
              </div>
            </div>

          </div>
          <!-- Floating mic FAB (like the real app) -->
          <div class="phone-fab">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0D0D12" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/></svg>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ═══ HOW IT WORKS ═══ -->
<section class="how-it-works" id="how">
  <div class="container">
    <div class="reveal">
      <div class="section-label">ଏହା କିପରି କାମ କରେ |</div>
      <h2 class="section-heading">ତିନୋଟି ସୋପାନ | କ training ଣସି ତାଲିମ ଆବଶ୍ୟକ ନାହିଁ |</h2>
      <p class="section-sub">କେବଳ ତୁମ ଭାଷାରେ ସ୍ natural ାଭାବିକ ଭାବରେ କୁହ - AI ବାକିଗୁଡିକ ପରିଚାଳନା କରେ |</p>
    </div>
    <div class="steps-grid">
      <div class="step reveal reveal-delay-1">
        <div class="step-number">01</div>
        <h3>ତୁମର ଆଦେଶ କୁହ |</h3>
        <p>ମାଇକ୍ ଟ୍ୟାପ୍ କରନ୍ତୁ ଏବଂ ଆପଣ ଯାହା ଆବଶ୍ୟକ କରନ୍ତି କୁହନ୍ତୁ - ଷ୍ଟକ୍ ଯୋଡନ୍ତୁ, ପରିମାଣ ଯାଞ୍ଚ କରନ୍ତୁ, ଏକ କ୍ରୟ ତାଲିକା ସୃଷ୍ଟି କରନ୍ତୁ | ଯେକ any ଣସି ଭାରତୀୟ ଭାଷାରେ |</p>
        <div class="step-example">
          <div class="hindi">"चावल 5 किलो जोड़ दो"</div>
          <div class="english">5 କିଲୋଗ୍ରାମ ଚାଉଳ ମିଶାନ୍ତୁ |</div>
        </div>
      </div>
      <div class="step reveal reveal-delay-2">
        <div class="step-number">02</div>
        <h3>AI ତୁରନ୍ତ ବୁ understand ିଥାଏ |</h3>
        <p>SpeechSarvam AIତୁମର ବକ୍ତବ୍ୟକୁ ପ୍ରକ୍ରିୟାକରଣ କରେ, ଉତ୍ପାଦ, ପରିମାଣ, ଏବଂ କାର୍ଯ୍ୟକୁ ବାହାର କରେ - ତାପରେ ଏହାକୁ ତୁମର ଭଣ୍ଡାର ସହିତ ମେଳ କରେ |</p>
        <div class="step-example">
          <div style="display:flex; gap:12px; flex-wrap:wrap;">
            <span style="background:var(--saffron-tint); color:var(--saffron); padding:4px 10px; border-radius:4px; font-size:12px;">ଚାଉଳ → ବାସମତି 🍚</span>
            <span style="background:rgba(50,213,131,0.1); color:var(--success); padding:4px 10px; border-radius:4px; font-size:12px;">+5 କି.ଗ୍ରା</span>
            <span style="background:rgba(99,102,241,0.1); color:#818CF8; padding:4px 10px; border-radius:4px; font-size:12px;">Add ଯୋଡନ୍ତୁ |</span>
          </div>
        </div>
      </div>
      <div class="step reveal reveal-delay-3">
        <div class="step-number">03</div>
        <h3>ଭଣ୍ଡାର ଅପଡେଟ୍, ନିଶ୍ଚିତ ହୋଇଛି |</h3>
        <p>ତୁମର ଷ୍ଟକ୍ ତୁରନ୍ତ ଅପଡେଟ୍ ହୋଇଛି | ତୁମେ ତୁମର ଭାଷାରେ ଏକ ସ୍ୱର ନିଶ୍ଚିତକରଣ ଶୁଣୁଛ - କ screen ଣସି ପରଦା ଆବଶ୍ୟକ ନାହିଁ |</p>
        <div class="step-example">
          <div class="hindi">"हो गया — बासमती चावल अब 23 किलो है"</div>
          <div class="english">ସମାପ୍ତ - ବାସମତି ଚାଉଳ ବର୍ତ୍ତମାନ 23 କିଲୋଗ୍ରାମ |</div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ═══ FEATURES ═══ -->
<section class="features" id="features" style="position:relative; overflow:hidden;">
  <div class="orb orb--saffron" style="top: -100px; right: -150px;"></div>
  <div class="container">
    <div class="reveal">
      <div class="section-label">ବ Features ଶିଷ୍ଟ୍ୟଗୁଡିକ</div>
      <h2 class="section-heading">ତୁମର ଦୋକାନ ଆବଶ୍ୟକ କରୁଥିବା ସମସ୍ତ ଜିନିଷ | କିଛି ନୁହେଁ |</h2>
    </div>
    <div class="features-grid">
      <div class="feature feature--hero reveal reveal-delay-1">
        <div class="feature-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg></div>
        <h3>ଭଏସ୍-ପ୍ରଥମ ଇନଭେଣ୍ଟୋରୀ |</h3>
        <p>ପ୍ରାକୃତିକ ଭାବରେ କହି ଷ୍ଟକ୍ ଯୋଡନ୍ତୁ, ଅପସାରଣ କରନ୍ତୁ କିମ୍ବା ଯାଞ୍ଚ କରନ୍ତୁ | କ typ ଣସି ଟାଇପିଂ ନାହିଁ, ମେନୁ ମାଧ୍ୟମରେ ସନ୍ଧାନ ନାହିଁ | କେବଳ ତୁମର ଭାଷାରେ କୁହ ଏବଂ AI ବାକିଗୁଡିକ ନିୟନ୍ତ୍ରଣ କରେ - ତୁମର କମାଣ୍ଡ ବୁ understanding ିବା ଠାରୁ ଆରମ୍ଭ କରି ରିଅଲ ଟାଇମରେ ତୁମର ଷ୍ଟକ୍ ଅପଡେଟ୍ କରିବା ପର୍ଯ୍ୟନ୍ତ |</p>
      </div>
      <div class="feature reveal reveal-delay-2">
        <div class="feature-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg></div>
        <h3>10 ଭାରତୀୟ ଭାଷା + ଇଂରାଜୀ |</h3>
        <p>ହିନ୍ଦୀ, ବଙ୍ଗାଳୀ, ତାମିଲ, ତେଲୁଗୁ, ମରାଠୀ, କନ୍ନଡ, ଗୁଜୁରାଟୀ, ମାଲାୟାଲମ୍, ପଞ୍ଜାବୀ ଏବଂ ଓଡିଆ - Sarvam AI ଦ୍ୱାରା ଚାଳିତ |</p>
      </div>
      <div class="feature reveal reveal-delay-3">
        <div class="feature-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></div>
        <h3>ଦଳ ଭୂମିକା |</h3>
        <p>ଗ୍ରାନୁଲାର୍ ଅନୁମତି ସହିତ Owner, Manager, ଏବଂ Helper ଭୂମିକା | ସମସ୍ତେ ସମାନ ପୃଷ୍ଠାରେ, ସୁରକ୍ଷିତ ଭାବରେ |</p>
      </div>
      <div class="feature reveal reveal-delay-1">
        <div class="feature-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/><path d="M9 14l2 2 4-4"/></svg></div>
        <h3>ସ୍ମାର୍ଟ କ୍ରୟ ତାଲିକା |</h3>
        <p>କମ୍ ଚାଲୁଥିବା ଉପରେ ଆଧାର କରି ଅଟୋ-ଜେନେରେଟ୍ ରିଷ୍ଟକିଂ ତାଲିକା | ହ୍ ats ାଟସ୍ ଆପ୍ ମାଧ୍ୟମରେ ଯୋଗାଣକାରୀଙ୍କୁ ଅଂଶୀଦାର କରନ୍ତୁ |</p>
      </div>
      <div class="feature reveal reveal-delay-2">
        <div class="feature-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></svg></div>
        <h3>କାର୍ଯ୍ୟକଳାପ ଅଡିଟ୍ ଲଗ୍ |</h3>
        <p>ପ୍ରତ୍ୟେକ ପରିବର୍ତ୍ତନ କିଏ, କ’ଣ ଏବଂ କେବେ ସହିତ ଟ୍ରାକ୍ କରାଯାଇଥିଲା | ଆପଣଙ୍କ ଦଳରେ ସମ୍ପୂର୍ଣ୍ଣ ସ୍ୱଚ୍ଛତା |</p>
      </div>
      <div class="feature reveal reveal-delay-3">
        <div class="feature-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><line x1="7" y1="12" x2="17" y2="12"/><line x1="7" y1="8" x2="17" y2="8"/><line x1="7" y1="16" x2="17" y2="16"/></svg></div>
        <h3>ବାରକୋଡ୍ ସ୍କାନିଂ |</h3>
        <p>ତୁରନ୍ତ ଯୋଗ କିମ୍ବା ଦେଖିବା ପାଇଁ ଉତ୍ପାଦଗୁଡିକ ସ୍କାନ୍ କରନ୍ତୁ | ଭାରତୀୟ ଏବଂ ଆନ୍ତର୍ଜାତୀୟ ବାରକୋଡ୍ ସହିତ କାମ କରେ |</p>
      </div>
    </div>
  </div>
</section>

<!-- ═══ AI INTELLIGENCE ═══ -->
<section class="ai-section" id="ai" style="overflow:hidden;">
  <div class="orb orb--indigo" style="bottom: -100px; left: -100px;"></div>
  <div class="orb orb--green" style="top: 200px; right: -80px;"></div>
  <div class="container">
    <div class="ai-header reveal">
      <div class="section-label">AI ବୁଦ୍ଧିଜୀବୀ |</div>
      <h2 class="section-heading">
        <span class="hindi" style="display:block; color:var(--saffron); font-size:clamp(22px,2.8vw,32px); font-weight:500; margin-bottom:8px;">समझदार AI जो आपके बिज़नेस को समझे</span>
        କେବଳ ଟ୍ରାକିଂ ନୁହେଁ - ଆପଣଙ୍କ ଦୋକାନର ପ୍ରଥମ ଡିଜିଟାଲ୍ ମସ୍ତିଷ୍କ |
      </h2>
      <p class="section-sub">Samaan-Bol ଆପଣ ଯାହା କୁହନ୍ତି ତାହା କେବଳ ରେକର୍ଡ କରେ ନାହିଁ | ଏହା ତୁମର s ାଞ୍ଚା ଶିଖେ, ତୁମର ଆବଶ୍ୟକତା ପୂର୍ବାନୁମାନ କରେ, ଏବଂ ସମସ୍ୟା ଘଟିବା ପୂର୍ବରୁ ତୁମକୁ ସତର୍କ କରାଏ |</p>
    </div>

    <div class="ai-blocks">
      <!-- Predictive Stock -->
      <div class="ai-block reveal">
        <div class="ai-block-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg></div>
        <div class="ai-block-tag ai-block-tag--predict">ଭବିଷ୍ୟବାଣୀ ଷ୍ଟକ୍ |</div>
        <h3>ଆପଣ କରିବା ପୂର୍ବରୁ ଆପଣ କଣ ଆବଶ୍ୟକ କରନ୍ତି ଜାଣନ୍ତି |</h3>
        <p>AI ତୁମର ବିକ୍ରୟ s ାଞ୍ଚା ଶିଖେ - ଦ daily ନିକ, ସାପ୍ତାହିକ, al ତୁ | ଆଇଟମଗୁଡିକ କେବେ କମ୍ ଚାଲିବ ଏହା ପୂର୍ବାନୁମାନ କରେ ଏବଂ କିଛି ଦିନ ପୂର୍ବରୁ ପୁନ ock ସ୍ଥାପନ କରିବାକୁ ପରାମର୍ଶ ଦେଇଥାଏ |</p>
        <div class="ai-voice-example">
          <div class="voice-bubble">
            <div class="voice-bubble-avatar voice-bubble-avatar--ai"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg></div>
            <div class="voice-bubble-content">
              <div class="hindi">"ଆପ୍କା ଆଟା 3 ଦିନ ମେନ୍ ଖାଟମ୍ ହୋ ସକତା ହ i - ହାଫ୍ଟି କି ବିକ୍ରି କେ ହିସାବ ସେ"</div>
              <div class="translation">ସାପ୍ତାହିକ ବିକ୍ରୟ ଉପରେ ଆଧାର କରି ଆପଣଙ୍କର ଆଟା 3 ଦିନରେ ଶେଷ ହୋଇପାରେ |</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Smart Alerts -->
      <div class="ai-block reveal">
        <div class="ai-block-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg></div>
        <div class="ai-block-tag ai-block-tag--alert">ସ୍ମାର୍ଟ ଆଲର୍ଟ |</div>
        <h3>ଆପଣଙ୍କ ଭାଷା କହୁଥିବା ସତର୍କତା |</h3>
        <p>ମିଆଦ ପୂର୍ଣ୍ଣ ଚେତାବନୀ, ଧୀର ଗତିଶୀଳ ଷ୍ଟକ୍ ଚିହ୍ନଟ, ଏବଂ ମୂଲ୍ୟ ପରିବର୍ତ୍ତନ ପରିବର୍ତ୍ତନ ଆଲର୍ଟ - ଆପଣଙ୍କ ପସନ୍ଦିତ ଭାଷାରେ ଭଏସ୍ ବିଜ୍ଞପ୍ତି ଭାବରେ ବିତରଣ |</p>
        <div class="ai-voice-example">
          <div class="voice-bubble">
            <div class="voice-bubble-avatar voice-bubble-avatar--ai"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg></div>
            <div class="voice-bubble-content">
              <div class="hindi">"Parle-G ke 12 ପ୍ୟାକେଟ୍ 5 din mein exp ho ho rahe hain - ରିହାତି ଲାଗାନା ଚେହେନ୍?"</div>
              <div class="translation">12 Parle-G ପ୍ୟାକେଟଗୁଡିକ 5 ଦିନରେ ସମାପ୍ତ - ଏକ ରିହାତି ଯୋଗ କରିବାକୁ ଚାହୁଁଛନ୍ତି କି?</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Voice Analytics -->
      <div class="ai-block reveal">
        <div class="ai-block-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg></div>
        <div class="ai-block-tag ai-block-tag--insight">ଭଏସ୍ ଆନାଲିଟିକ୍ସ |</div>
        <h3>ତୁମର ଦୋକାନକୁ ଏକ ପ୍ରଶ୍ନ ପଚାର - ଏହା ଉତ୍ତର ଦିଏ |</h3>
        <p>ପ୍ରାକୃତିକ ଭାଷାରେ ତୁମର ବ୍ୟବସାୟ ବିଷୟରେ କିଛି ପଚାର | AI କଥିତ ଉତ୍ତର ଏବଂ ଅନ୍-ସ୍କ୍ରିନ୍ ତଥ୍ୟ ସହିତ ପ୍ରତିକ୍ରିୟା କରେ |</p>
        <div class="ai-voice-example">
          <div class="voice-bubble">
            <div class="voice-bubble-avatar voice-bubble-avatar--user"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>
            <div class="voice-bubble-content">
              <div class="hindi">"ପିଚଲେ ହାଫ୍ଟ ସାବସେ ଜିଆଡା କାୟା ବାଇକା?"</div>
              <div class="translation">ଗତ ସପ୍ତାହରେ କ’ଣ ଅଧିକ ବିକ୍ରି ହେଲା?</div>
            </div>
          </div>
          <div class="voice-bubble">
            <div class="voice-bubble-avatar voice-bubble-avatar--ai"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg></div>
            <div class="voice-bubble-content">
              <div class="hindi">"ପିଚଲେ ହାଫ୍ଟ ସାବସେ ଜିଆଡା ଚାୱାଲ ବାଇକା - 48 କିଲୋ"</div>
              <div class="translation">ଚାଉଳ ଗତ ସପ୍ତାହରେ ସର୍ବାଧିକ ବିକ୍ରି ହୋଇଥିଲା - 48 କିଲୋ |</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Team Intelligence -->
      <div class="ai-block reveal">
        <div class="ai-block-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>
        <div class="ai-block-tag ai-block-tag--team">ଦଳ ବୁଦ୍ଧିଜୀବୀ |</div>
        <h3>ତୁମର ଦଳ କ’ଣ କରୁଛି ଜାଣ |</h3>
        <p>AI ଚାଳିତ ଅନୋମାଲି ଚିହ୍ନଟ ଅସାଧାରଣ ଭଣ୍ଡାର ପରିବର୍ତ୍ତନକୁ ଫ୍ଲାଗ୍ କରେ | ସ୍ମାର୍ଟ ସାରାଂଶଗୁଡିକ ଦର୍ଶାଏ କିଏ କିଏ ଅପଡେଟ୍ କଲା, ଏବଂ ସଂଶୋଧନ ଆବଶ୍ୟକ କି ନୁହେଁ |</p>
        <div class="ai-voice-example">
          <div class="voice-bubble">
            <div class="voice-bubble-avatar voice-bubble-avatar--ai"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg></div>
            <div class="voice-bubble-content">
              <div class="hindi">"ଆଜ୍ ଶାମ 6 ବାଜେ 15 କିଲୋ ଚେନି କା ଷ୍ଟକ୍ କାମ ହୁଆ - କରାଇନ୍ ଯାଞ୍ଚ କରନ୍ତୁ?"</div>
              <div class="translation">ଆଜି 6 PM ରେ 15 କିଲୋଗ୍ରାମ ଚିନି ଷ୍ଟକ୍ ହ୍ରାସ ପାଇଛି - ଯାଞ୍ଚ କରିବାକୁ ଚାହୁଁଛନ୍ତି କି?</div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</section>

<!-- ═══ LANGUAGES ═══ -->
<section class="languages-section" id="languages">
  <div class="container">
    <div class="reveal">
      <div class="section-label">ଭରତ ପାଇଁ ନିର୍ମିତ |</div>
      <h2 class="section-heading">ତୁମର ଭାଷା ତୁମର ବ୍ୟବସାୟ ତୁମର ପଥ</h2>
      <p class="section-sub">Samaan-Bolତୁମେ କଥାବାର୍ତ୍ତା କରୁଥିବା କଥା କହିଥାଏ - ଦେଶୀ ସ୍କ୍ରିପ୍ଟ, କଥାବାର୍ତ୍ତା ଶବ୍ଦ, ଏବଂ ଆଞ୍ଚଳିକ ଉତ୍ପାଦ ନାମ ପାଇଁ ସମ୍ପୂର୍ଣ୍ଣ ସମର୍ଥନ ସହିତ |</p>
    </div>
    <div class="lang-grid reveal">
      <div class="lang-chip lang-chip--featured">ହିନ୍ଦୀ <span class="native hindi">हिन्दी</span></div>
      <div class="lang-chip">ବଙ୍ଗାଳୀ <span class="native">বাংলা</span></div>
      <div class="lang-chip">ତାମିଲ୍ | <span class="native">தமிழ்</span></div>
      <div class="lang-chip">ତେଲୁଗୁ <span class="native">తెలుగు</span></div>
      <div class="lang-chip">ମରାଠୀ <span class="native">मराठी</span></div>
      <div class="lang-chip">କନ୍ନଡ | <span class="native">ಕನ್ನಡ</span></div>
      <div class="lang-chip">ଗୁଜରାଟୀ <span class="native">ગુજરાતી</span></div>
      <div class="lang-chip">ମାଲାୟାଲମ୍ <span class="native">മലയാളം</span></div>
      <div class="lang-chip">ପଞ୍ଜାବୀ | <span class="native">ਪੰਜਾਬੀ</span></div>
      <div class="lang-chip">ଓଡିଆ <span class="native">ଓଡ଼ିଆ</span></div>
      <div class="lang-chip">ଇଂରାଜୀ | <span class="native">ଇଂରାଜୀ |</span></div>
    </div>
  </div>
</section>

<!-- ═══ COMPARISON ═══ -->
<section class="comparison">
  <div class="container">
    <div class="reveal">
      <div class="section-label">କାହିଁକି Samaan-Bol |</div>
      <h2 class="section-heading">ପାର୍ଥକ୍ୟ ହେଉଛି ରାତି ଏବଂ ଦିନ |</h2>
    </div>
    <div class="comparison-grid reveal">
      <div class="comparison-col comparison-col--without">
        <h3>Samaan-Bol ବିନା |</h3>
        <p class="comparison-col-subtitle">ଷ୍ଟକ୍ ପରିଚାଳନା କରିବାର ପୁରୁଣା ଉପାୟ |</p>
        <ul class="comparison-list">
          <li><span class="icon">✕</span> ମାନୁଆଲ ଗଣନା, କଲମ ଏବଂ କାଗଜ ରେଜିଷ୍ଟର |</li>
          <li><span class="icon">✕</span> ଯେତେବେଳେ ଜଣେ ଗ୍ରାହକ ପଚାରନ୍ତି ଷ୍ଟକଆଉଟ୍ ଆବିଷ୍କୃତ |</li>
          <li><span class="icon">✕</span> କେତେ ରେକର୍ଡ କରିବେ ଅନୁମାନ କରୁଛନ୍ତି |</li>
          <li><span class="icon">✕</span> କ’ଣ ମିଆଦ ପୂର୍ଣ୍ଣ କିମ୍ବା ମନ୍ଥର ଗତିଶୀଳ ତାହା କ idea ଣସି ଧାରଣା ନାହିଁ |</li>
          <li><span class="icon">✕</span> କର୍ମଚାରୀମାନେ କଣ କରୁଛନ୍ତି ତାହା ଟ୍ରାକ୍ କରିପାରିବେ ନାହିଁ |</li>
          <li><span class="icon">✕</span> ଫେଷ୍ଟିଭାଲ୍ ପ୍ରିପ୍ ହେଉଛି ଶେଷ ମୁହୂର୍ତ୍ତର ବିଶୃଙ୍ଖଳା |</li>
        </ul>
      </div>
      <div class="comparison-col comparison-col--with">
        <h3>Samaan-Bol ସହିତ |</h3>
        <p class="comparison-col-subtitle">AI ଚାଳିତ, ସ୍ୱର-ପ୍ରଥମ, ପ୍ରୟାସହୀନ |</p>
        <ul class="comparison-list">
          <li><span class="icon">✓</span> ଭଏସ୍ ଅପଡେଟ୍ - ଏହାକୁ କୁହ ଏବଂ ଏହା ସମାପ୍ତ ହୋଇଛି |</li>
          <li><span class="icon">✓</span> ଷ୍ଟକଆଉଟ୍ ର କିଛି ଦିନ ପୂର୍ବରୁ ଭବିଷ୍ୟବାଣୀ ଆଲର୍ଟ |</li>
          <li><span class="icon">✓</span> ପ୍ରକୃତ ତଥ୍ୟ ଉପରେ ଆଧାର କରି AI ଉତ୍ପାଦିତ କ୍ରୟ ତାଲିକା |</li>
          <li><span class="icon">✓</span> ମିଆଦ ପୂର୍ଣ୍ଣ ଏବଂ ମନ୍ଥର ଗତିଶୀଳ ଚିହ୍ନଟ |</li>
          <li><span class="icon">✓</span> ଅନୋମାଲି ଚିହ୍ନଟ ସହିତ ସମ୍ପୂର୍ଣ୍ଣ ଅଡିଟ୍ ଟ୍ରେଲ୍ |</li>
          <li><span class="icon">✓</span> ଉତ୍ସବର ପୂର୍ବାନୁମାନ 2 ସପ୍ତାହ ଶୀଘ୍ର ଆରମ୍ଭ ହୁଏ |</li>
        </ul>
      </div>
    </div>
  </div>
</section>

<!-- ═══ TESTIMONIALS ═══ -->
<section class="testimonials">
  <div class="container">
    <div class="reveal">
      <div class="section-label">ପ୍ରାରମ୍ଭିକ ପୋଷ୍ୟ ସନ୍ତାନ |</div>
      <h2 class="section-heading">ସମଗ୍ର ଭାରତରେ ବିଟା ପରୀକ୍ଷକମାନଙ୍କ ଦ୍ୱାରା ଭଲପାଏ |</h2>
    </div>
    <div class="testimonials-grid">
      <div class="testimonial reveal reveal-delay-1">
        <div class="testimonial-stars">★★★★★</div>
        <blockquote>ବିଟା ପରୀକ୍ଷଣ ମେନ୍ ଚେଷ୍ଟା କିୟା - ପେହଲେ ଡିନ ସେ ରେଜିଷ୍ଟର ବ୍ୟାଣ୍ଡ | ଅବ୍ ବେସ୍ ଡିଟି ହୁନ୍ ଅର ସାବ ଅପଡେଟ୍ ହୋ ଜାତା ହ i | ଇଟନା ଆସନ ହୋଗା ସୋଚା ନାହି ଥା |</blockquote>
        <div class="testimonial-author">ମୀନା ଶର୍ମା</div>
        <div class="testimonial-role">ବିଟା ପରୀକ୍ଷକ · କିରଣ ଷ୍ଟୋର Owner, ଜୟପୁର |</div>
      </div>
      <div class="testimonial reveal reveal-delay-2">
        <div class="testimonial-stars">★★★★★</div>
        <blockquote>ଜାନୁଆରୀ ମେନ୍ ବିଟା ଯୋଗ କିୟା ଥା - ହୋଲି କେ ଲିଏ ଏଇ ନେ ପୂର୍ବରୁ ବଟାୟା କି କି ଷ୍ଟକ୍ ବାଦାନା ହ i | ଅଭି ସେ ଇଟନା ସ୍ମାର୍ଟ ହ i, ସୋଚିୟେ ଲଞ୍ଚ କେ ବାଦ କୟା ହୋଗା |</blockquote>
        <div class="testimonial-author">ଅର୍ଜୁନ ପଟେଲ</div>
        <div class="testimonial-role">ବିଟା ପରୀକ୍ଷକ · ଜେନେରାଲ ଷ୍ଟୋର, ଅହମ୍ମଦାବାଦ |</div>
      </div>
      <div class="testimonial reveal reveal-delay-3">
        <div class="testimonial-stars">★★★★★</div>
        <blockquote>ବଙ୍ଗଳା ମେନ୍ ବୋଲ୍ଟେ ନମ ସମାଜ ଗୟା - ବିଟା ଟେଷ୍ଟିଂ-ଇ ଦେଖଲାମ ଜେ ଅମର ଭାଶା ତେ କାଜ କୋରେ | ଷ୍ଟାଫ୍ ରା ଓ ଖୁବ୍ ସହଜରେ କର୍ଟେ ପାରଚେ ବ୍ୟବହାର କରନ୍ତି |</blockquote>
        <div class="testimonial-author">ରିନା ଦାସ</div>
        <div class="testimonial-role">ବିଟା ପରୀକ୍ଷକ · ଟେକ୍ସଟାଇଲ୍ ଦୋକାନ, କୋଲକାତା |</div>
      </div>
    </div>
  </div>
</section>

<!-- ═══ CTA ═══ -->
<section class="cta-section" id="download">
  <div class="container">
    <div class="reveal">
      <div class="section-label">ମାଗଣା ଆରମ୍ଭ କରନ୍ତୁ |</div>
      <h2 class="section-heading">
        <span class="hindi" style="display:block; color:var(--saffron); font-size:clamp(20px,2.4vw,28px); font-weight:500; margin-bottom:8px;">आज ही शुरू करें</span>
        ତୁମର ଦୋକାନ ଏକ ନୋଟବୁକ୍ ଅପେକ୍ଷା ଭଲ ଯୋଗ୍ୟ |
      </h2>
      <p class="section-sub">ଆରମ୍ଭ କରିବାକୁ ମାଗଣା | 2 ମିନିଟରେ ସେଟ୍ ଅପ୍ କରନ୍ତୁ | କ credit ଣସି କ୍ରେଡିଟ୍ କାର୍ଡ ଆବଶ୍ୟକ ନାହିଁ |</p>
      <div class="cta-actions">
        <a href="https://apps.apple.com/in/app/samaan-bol/id6759739444" class="store-badge">
          <div class="store-badge-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg></div>
          <div class="store-badge-text">
            <div class="store-badge-label">ଉପରେ ଡାଉନଲୋଡ୍ କରନ୍ତୁ |</div>
            <div class="store-badge-name">App Store</div>
          </div>
        </a>
        <a href="#" class="store-badge" style="position:relative; opacity:0.65; pointer-events:none;">
          <div class="store-badge-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.807 1.626a1 1 0 0 1 0 1.73l-2.808 1.626L15.206 12l2.492-2.491zM5.864 2.658L16.8 8.99l-2.3 2.3-8.636-8.632z"/></svg></div>
          <div class="store-badge-text">
            <div class="store-badge-label">ଏହାକୁ ପ୍ରାପ୍ତ କର |</div>
            <div class="store-badge-name">Google Play</div>
          </div>
          <span style="position:absolute; top:-10px; right:-10px; background:var(--saffron); color:#fff; font-size:11px; font-weight:700; padding:3px 10px; border-radius:20px; letter-spacing:0.5px; text-transform:uppercase;">ଶୀଘ୍ର ଆସୁଛି |</span>
        </a>
      </div>
    </div>
  </div>
</section>

<!-- ═══ FOOTER ═══ -->
<footer>
  <div class="container">
    <div class="footer-grid">
      <div class="footer-brand">
        <a href="#" class="logo">
          <div class="logo-mark"><svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><defs><mask id="stencil-footer"><rect x="0" y="0" width="100" height="100" fill="white"/><rect x="24" y="18" width="52" height="8" rx="4" fill="black"/><rect x="38" y="18" width="24" height="36" rx="12" fill="black"/><path d="M 28 42 A 22 22 0 0 0 72 42" fill="none" stroke="black" stroke-width="8" stroke-linecap="round"/><rect x="46" y="72" width="8" height="10" rx="4" fill="black"/><rect x="36" y="32" width="28" height="4" fill="white"/><rect x="36" y="44" width="28" height="4" fill="white"/></mask></defs><circle cx="50" cy="50" r="50" fill="#ea580c" mask="url(#stencil-footer)"/></svg></div>
          <div class="logo-text">ସାମନ୍<span>ବୋଲ୍</span></div>
        </a>
        <p>ଭଏସ୍-ପ୍ରଥମ AI ଭଣ୍ଡାର ପରିଚାଳନା, ଭାରତୀୟ ଖୁଚୁରା ହୃଦୟ ପାଇଁ ନିର୍ମିତ |</p>
      </div>
      <div class="footer-col">
        <h4>ଉତ୍ପାଦ</h4>
        <ul>
          <li><a href="#features">ବ Features ଶିଷ୍ଟ୍ୟଗୁଡିକ</a></li>
          <li><a href="#ai">AI ବୁଦ୍ଧିଜୀବୀ |</a></li>
          <li><a href="#languages">ଭାଷା</a></li>
          <li><a href="#">ମୂଲ୍ୟ</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>କମ୍ପାନୀ</h4>
        <ul>
          <li><a href="#">ବିଷୟରେ</a></li>
          <li><a href="#">ବ୍ଲଗ୍</a></li>
          <li><a href="#">ବୃତ୍ତି</a></li>
          <li><a href="#">ଯୋଗାଯୋଗ କରନ୍ତୁ |</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>ସମର୍ଥନ</h4>
        <ul>
          <li><a href="#">ସହାୟତା କେନ୍ଦ୍ର</a></li>
          <li><a href="/privacy-policy">ଗୋପନୀୟତା ନୀତି</a></li>
          <li><a href="/terms-of-service">ସେବା ସର୍ତ୍ତାବଳୀ</a></li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <span>© 2026 Samaan-Bol | ସମସ୍ତ ଅଧିକାର ସଂରକ୍ଷିତ |</span>
      <span class="made-in-india">India ସହିତ India ରେ ତିଆରି |</span>
    </div>
  </div>
</footer>`,
    privacy: `<div class="reading-progress" id="readingProgress"></div>

  <div class="container">
    <a href="/" class="back">Home ଘରକୁ ଫେରନ୍ତୁ |</a>
    <h1>ଗୋପନୀୟତା ନୀତି</h1>
    <p class="effective">କାର୍ଯ୍ୟକାରୀ ତାରିଖ: ଫେବୃଆରୀ 23, 2026 |</p>

    <nav class="toc">
      <h3>ବିଷୟବସ୍ତୁ</h3>
      <ol>
        <li><a href="#s1">ଆମେ ସଂଗ୍ରହ କରୁଥିବା ସୂଚନା</a></li>
        <li><a href="#s2">ଆମେ କିପରି ଆପଣଙ୍କର ସୂଚନା ବ୍ୟବହାର କରୁ |</a></li>
        <li><a href="#s3">ତୃତୀୟ-ପକ୍ଷ ସେବାଗୁଡିକ |</a></li>
        <li><a href="#s4">ଡାଟା ଷ୍ଟୋରେଜ୍ ଏବଂ ସୁରକ୍ଷା</a></li>
        <li><a href="#s5">ତଥ୍ୟ ଧାରଣ</a></li>
        <li><a href="#s6">ଖାତା ବିଲୋପ</a></li>
        <li><a href="#s7">ଦୋକାନ ଭିତରେ ଡାଟା ସେୟାର୍ |</a></li>
        <li><a href="#s8">ପିଲାମାନଙ୍କର ଗୋପନୀୟତା |</a></li>
        <li><a href="#s9">ତୁମର ଅଧିକାର</a></li>
        <li><a href="#s10">ଏହି ନୀତିରେ ପରିବର୍ତ୍ତନ |</a></li>
        <li><a href="#s11">ଆମ ସହିତ ଯୋଗାଯୋଗ କରନ୍ତୁ |</a></li>
      </ol>
    </nav>

    <p>Samaan-Bol("ଆମେ", "ଆମର", କିମ୍ବା "ଆପ୍") ହେଉଛି ଏକ ଭଏସ୍-ପ୍ରଥମ ସହଯୋଗୀ ଭଣ୍ଡାର ପରିଚାଳନା ପ୍ରୟୋଗ ଯାହା ଭାରତୀୟ ଖୁଚୁରା ବ୍ୟବସାୟ ପାଇଁ ଡିଜାଇନ୍ ହୋଇଛି | ଏହି ଗୋପନୀୟତା ନୀତି ଆମେ କେଉଁ ସୂଚନା ସଂଗ୍ରହ କରୁ, ଆମେ ଏହାକୁ କିପରି ବ୍ୟବହାର କରୁ, କାହା ସହିତ ଏହାକୁ ଅଂଶୀଦାର କରୁ ଏବଂ ଆପଣଙ୍କ ତଥ୍ୟ ସମ୍ବନ୍ଧରେ ଆପଣଙ୍କର ଅଧିକାର ବ୍ୟାଖ୍ୟା କରେ |</p>

    <p>Samaan-Bol ବ୍ୟବହାର କରି, ଆପଣ ଏହି ନୀତିରେ ବର୍ଣ୍ଣିତ ସୂଚନା ସଂଗ୍ରହ ଏବଂ ବ୍ୟବହାରରେ ରାଜି ହୁଅନ୍ତି |</p>

    <details open id="s1">
      <summary><h2>ଆମେ ସଂଗ୍ରହ କରୁଥିବା ସୂଚନା</h2></summary>
      <div class="section-content">
        <h3>1.1 ଖାତା ସୂଚନା</h3>
        <p>ଯେତେବେଳେ ଆପଣ ଏକ ଆକାଉଣ୍ଟ୍ ସୃଷ୍ଟି କରନ୍ତି, ଆମେ ସଂଗ୍ରହ କରୁ:</p>
        <ul>
          <li><strong>ପୂର୍ଣ୍ଣ ନାମ</strong> - ସାଇନ୍ ଅପ୍ ସମୟରେ ପ୍ରଦାନ କରାଯାଇଛି |</li>
          <li><strong>27Emailଠିକଣା |</strong> - ପ୍ରାମାଣିକିକରଣ ଏବଂ ଖାତା ପୁନରୁଦ୍ଧାର ପାଇଁ ବ୍ୟବହୃତ |</li>
          <li><strong>ପାସୱାର୍ଡ</strong> - ଆମର ପ୍ରାମାଣିକିକରଣ ପ୍ରଦାନକାରୀ (Clerk) ଦ୍ୱାରା ଏନକ୍ରିପ୍ଟ ଏବଂ ପରିଚାଳିତ |</li>
        </ul>
        <p>ଯଦି ଆପଣ Google କିମ୍ବା Apple ସହିତ ସାଇନ୍ ଇନ୍ କରନ୍ତି, ଆମେ nameOAuthପ୍ରଦାନକାରୀଙ୍କ ଠାରୁ ଆପଣଙ୍କ ନାମ ଏବଂ ଇମେଲ୍ ଗ୍ରହଣ କରୁ | ଆମେ ଆପଣଙ୍କର Google କିମ୍ବା Apple ଖାତା ପାସୱାର୍ଡକୁ ପ୍ରବେଶ କରୁନାହୁଁ |</p>

        <h3>1.2 ଭଏସ୍ ରେକର୍ଡିଂ |</h3>
        <div class="highlight">
          <p><strong>ଗୁରୁତ୍ୱପୂର୍ଣ୍ଣ:</strong> ଭଏସ୍ ରେକର୍ଡିଂଗୁଡିକ ରିଅଲ୍-ଟାଇମ୍ ରେ ପ୍ରକ୍ରିୟାକରଣ କରାଯାଏ ଏବଂ ଅଟେ | <strong>ସ୍ଥାୟୀ ଭାବରେ ଗଚ୍ଛିତ ନୁହେଁ |</strong>। ଅଡିଓ ଆମ ସର୍ଭରକୁ ପ୍ରସାରିତ ହୁଏ, ବକ୍ତବ୍ୟ ଚିହ୍ନିବା ଏବଂ ପ୍ରାକୃତିକ ଭାଷା ବୁ understanding ିବା ପାଇଁ Sarvam AI ଦ୍ୱାରା ପ୍ରକ୍ରିୟାକରଣ ହୁଏ ଏବଂ ପ୍ରକ୍ରିୟାକରଣ ପରେ ତୁରନ୍ତ ପରିତ୍ୟାଗ ହୁଏ | କେବଳ ଫଳାଫଳ ହୋଇଥିବା ପାଠ୍ୟ ଟ୍ରାନ୍ସକ୍ରିପ୍ଟ ଆପଣଙ୍କ ରେଫରେନ୍ସ ପାଇଁ ଆପଣଙ୍କ ଅଡିଟ୍ ଲଗରେ ଗଚ୍ଛିତ |</p>
        </div>
        <ul>
          <li>ଆପଣଙ୍କ ଡିଭାଇସରେ ଅଡିଓ ରେକର୍ଡ କରାଯାଇଛି (iOS ରେ WAV ଫର୍ମାଟ୍, M4A ଉପରେ M4A)</li>
          <li>ରେକର୍ଡିଂଗୁଡିକ ସର୍ବାଧିକ 30 ସେକେଣ୍ଡରେ ସୀମିତ |</li>
          <li>ଏକ ସୁରକ୍ଷିତ ସଂଯୋଗ ମାଧ୍ୟମରେ ଏନକୋଡେଡ୍ ଡାଟା ଭାବରେ ଅଡିଓ ଆମ ସର୍ଭରକୁ ପଠାଯାଏ |</li>
          <li>ପ୍ରକ୍ରିୟାକରଣ ପରେ, ଅଡିଓ ତଥ୍ୟ ସର୍ଭର ମେମୋରୀରୁ ବର୍ଜନ କରାଯାଇଥାଏ |</li>
          <li>ପାଠ୍ୟ ଟ୍ରାନ୍ସକ୍ରିପସନ୍ ଆପଣଙ୍କ ଦୋକାନର ଅଡିଟ୍ ଲଗରେ ଗଚ୍ଛିତ ହୋଇଛି ତେଣୁ ଆପଣ ଅତୀତର କାର୍ଯ୍ୟଗୁଡ଼ିକୁ ସମୀକ୍ଷା କରିପାରିବେ |</li>
        </ul>

        <h3>1.3 ଭଣ୍ଡାର ଏବଂ ବ୍ୟବସାୟ ତଥ୍ୟ |</h3>
        <p>ଯେତେବେଳେ ଆପଣ ଆପ୍ ବ୍ୟବହାର କରନ୍ତି, ଆମେ ସୃଷ୍ଟି କରିଥିବା ବ୍ୟବସାୟ ତଥ୍ୟକୁ ଆମେ ସଂରକ୍ଷଣ କରୁ:</p>
        <ul>
          <li>ଦୋକାନ ସୂଚନା (ନାମ, ବର୍ଗ, ପସନ୍ଦିତ ଭାଷା)</li>
          <li>ଉତ୍ପାଦ ତାଲିକା (ନାମ, ବାରକୋଡ୍, ବର୍ଗ, ୟୁନିଟ୍, ମୂଲ୍ୟ)</li>
          <li>ଷ୍ଟକ୍ ପରିମାଣ, ବ୍ୟାଚ୍ ନମ୍ବର, କ୍ରୟ ତାରିଖ, ସମାପ୍ତି ତାରିଖ, ଯୋଗାଣକାରୀ ନାମ |</li>
          <li>ତାଲିକା ଆଇଟମ୍ ଏବଂ ନୋଟ୍ କିଣ |</li>
          <li>ଅଡିଟ୍ ଲଗ୍ ରେକର୍ଡିଂ ଇନଭେଣ୍ଟୋରୀ ପରିବର୍ତ୍ତନଗୁଡିକ (କାର୍ଯ୍ୟ ପ୍ରକାର, ଉପଭୋକ୍ତା, ଟାଇମଷ୍ଟ୍ୟାମ୍ପ, ଟ୍ରାନ୍ସକ୍ରିପ୍ଟ, ଆତ୍ମବିଶ୍ୱାସ ସ୍କୋର)</li>
        </ul>

        <h3>1.4 ବ୍ୟବହାରକାରୀ ପସନ୍ଦ</h3>
        <ul>
          <li>ଆପ୍ ଭାଷା ଏବଂ ଭଏସ୍ ଭାଷା ଚୟନ |</li>
          <li>ଭଏସ୍ ଫିଡବ୍ୟାକ୍ ପସନ୍ଦ (ଅନ୍ / ଅଫ୍)</li>
          <li>ପ୍ରଦର୍ଶନ ସେଟିଂସମୂହ (ଉଚ୍ଚ ବିପରୀତ ମୋଡ୍, ପାଠ୍ୟ ଆକାର)</li>
          <li>ଡିଫଲ୍ଟ ମାପ ଏକକ |</li>
          <li>ବିଜ୍ଞପ୍ତି ପସନ୍ଦଗୁଡିକ |</li>
        </ul>

        <h3>1.5 ଦୋକାନ ସଦସ୍ୟତା ତଥ୍ୟ |</h3>
        <ul>
          <li>ପ୍ରତ୍ୟେକ ଦୋକାନରେ ଆପଣଙ୍କର ଭୂମିକା (Owner, Manager, କିମ୍ବା Helper)</li>
          <li>ଦଳ ସହଯୋଗ ପାଇଁ ସୃଷ୍ଟି ହୋଇଥିବା କୋଡ୍ ଆମନ୍ତ୍ରଣ କରନ୍ତୁ |</li>
          <li>ଦୋକାନଗୁଡିକ ମଧ୍ୟରେ ଶେଷ ସକ୍ରିୟ ଟାଇମଷ୍ଟ୍ୟାମ୍ପ |</li>
        </ul>

        <h3>1.6 ଉପକରଣ ଏବଂ ନିଦାନ ତଥ୍ୟ |</h3>
        <p>ଉତ୍ପାଦନ ନିର୍ମାଣରେ, କ୍ରାସ୍ ରିପୋର୍ଟ ପାଇଁ ଆମେ Sentry ବ୍ୟବହାର କରୁ | ଏହା ସଂଗ୍ରହ କରେ:</p>
        <ul>
          <li>ଉପକରଣ ପ୍ରକାର, ଅପରେଟିଂ ସିଷ୍ଟମ୍, ଏବଂ ଆପ୍ ସଂସ୍କରଣ |</li>
          <li>କ୍ରାସ୍ ରିପୋର୍ଟ ଏବଂ ତ୍ରୁଟି ଷ୍ଟାକ ଚିହ୍ନ |</li>
          <li>କାର୍ଯ୍ୟଦକ୍ଷତା ତଥ୍ୟ (20% ଅଧିବେଶନରେ ନମୁନା)</li>
        </ul>
        <p>ବିକାଶ ବିଲ୍ଡରେ କ୍ରାସ୍ ରିପୋର୍ଟିଂ ଅକ୍ଷମ ହୋଇଛି ଏବଂ ଆମେ ପ୍ରୟୋଗ କରୁଥିବା ନମୁନା ସଂଗ୍ରହ ହାର ଦ୍ୱାରା କମ୍ କରାଯାଇପାରିବ |</p>
      </div>
    </details>

    <details id="s2">
      <summary><h2>2। ଆମେ କିପରି ଆପଣଙ୍କର ସୂଚନା ବ୍ୟବହାର କରୁ |</h2></summary>
      <div class="section-content">
        <ul>
          <li><strong>ସେବା ପ୍ରଦାନ କରନ୍ତୁ:</strong> ଭଏସ୍ କମାଣ୍ଡ୍ ପ୍ରୋସେସ୍ କରନ୍ତୁ, ଇନଭେଣ୍ଟୋରୀ ପରିଚାଳନା କରନ୍ତୁ ଏବଂ ଆପଣଙ୍କ ଦଳ ମଧ୍ୟରେ ଡାଟା ସିଙ୍କ କରନ୍ତୁ |</li>
          <li><strong>ପ୍ରାମାଣିକିକରଣ:</strong> ଆପଣଙ୍କର ପରିଚୟ ଯାଞ୍ଚ କରନ୍ତୁ ଏବଂ ସୁରକ୍ଷିତ ଅଧିବେଶନଗୁଡିକ ପରିଚାଳନା କରନ୍ତୁ |</li>
          <li><strong>ଅଡିଟ୍ ଟ୍ରେଲ୍:</strong> ଉତ୍ତରଦାୟିତ୍ୱ ଏବଂ ସମୀକ୍ଷା ପାଇଁ ଭଣ୍ଡାର ପରିବର୍ତ୍ତନଗୁଡ଼ିକର ଏକ ଲଗ୍ ବଜାୟ ରଖନ୍ତୁ |</li>
          <li><strong>ସେବାରେ ଉନ୍ନତି କରନ୍ତୁ:</strong> ଅଜ୍ଞାତ ତ୍ରୁଟି ରିପୋର୍ଟ ମାଧ୍ୟମରେ ତ୍ରୁଟି ଏବଂ କ୍ରାସ୍ ନିରାକରଣ କରନ୍ତୁ |</li>
          <li><strong>ଯୋଗାଯୋଗ:</strong> ଅତ୍ୟାବଶ୍ୟକ ଖାତା ସମ୍ବନ୍ଧୀୟ ବିଜ୍ଞପ୍ତି ପଠାନ୍ତୁ (ଯଥା, ପାସୱାର୍ଡ ପୁନ ets ସେଟ୍)</li>
        </ul>
        <p>ଆମେ କରୁ | <strong>ନୁହେଁ |</strong> ବିଜ୍ଞାପନ ପାଇଁ ଆପଣଙ୍କର ତଥ୍ୟ ବ୍ୟବହାର କରନ୍ତୁ, ଏବଂ ଆମେ କରୁ | <strong>ନୁହେଁ |</strong> ତୃତୀୟ ପକ୍ଷକୁ ଆପଣଙ୍କର ବ୍ୟକ୍ତିଗତ ସୂଚନା ବିକ୍ରୟ କରନ୍ତୁ |</p>
      </div>
    </details>

    <details id="s3">
      <summary><h2>3। ତୃତୀୟ-ପକ୍ଷ ସେବାଗୁଡିକ |</h2></summary>
      <div class="section-content">
        <p>ଆପ୍ ଚଳାଇବା ପାଇଁ ଆମେ ନିମ୍ନ ତୃତୀୟ-ପକ୍ଷ ସେବାଗୁଡିକ ବ୍ୟବହାର କରୁ:</p>
        <table>
          <thead>
            <tr>
              <th>ସେବା</th>
              <th>ଉଦ୍ଦେଶ୍ୟ</th>
              <th>ଡାଟା ଅଂଶୀଦାର |</th>
              <th>ଗୋପନୀୟତା ନୀତି</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Clerk</strong></td>
              <td>ପ୍ରାମାଣିକିକରଣ ଏବଂ ଅଧିବେଶନ ପରିଚାଳନା |</td>
              <td>Email, ନାମ, OAuth ଟୋକେନ୍, ଅଧିବେଶନ ତଥ୍ୟ |</td>
              <td><a href="https://clerk.com/legal/privacy" target="_blank" rel="noopener">clerk.com/legal/privacy |</a></td>
            </tr>
            <tr>
              <td><strong>Sarvam AI</strong></td>
              <td>ଭଏସ୍ ପ୍ରକ୍ରିୟାକରଣ (ସ୍ପିଚ୍-ଟୁ-ଟେକ୍ସଟ୍, ପ୍ରାକୃତିକ ଭାଷା ପ୍ରକ୍ରିୟାକରଣ, ପାଠ୍ୟ-ଟୁ-ସ୍ପିଚ୍)</td>
              <td>ଅଡିଓ ରେକର୍ଡିଂ, ଟ୍ରାନ୍ସକ୍ରିପ୍ଟ ପାଠ୍ୟ, ଭାଷା କୋଡ୍ |</td>
              <td><a href="https://www.sarvam.ai/privacy-policy" target="_blank" rel="noopener">sarvam.ai/privacy-policy</a></td>
            </tr>
            <tr>
              <td><strong>Neon</strong></td>
              <td>ଡାଟାବେସ୍ ହୋଷ୍ଟିଂ (PostgreSQL)</td>
              <td>ସମସ୍ତ ସ୍ଥାୟୀ ପ୍ରୟୋଗ ତଥ୍ୟ |</td>
              <td><a href="https://neon.tech/privacy-policy" target="_blank" rel="noopener">neon.tech/privacy-policy</a></td>
            </tr>
            <tr>
              <td><strong>Sentry</strong></td>
              <td>ତ୍ରୁଟି ଟ୍ରାକିଂ ଏବଂ କ୍ରାସ୍ ରିପୋର୍ଟ କରିବା |</td>
              <td>କ୍ରାସ୍ ରିପୋର୍ଟ, ଉପକରଣ ସୂଚନା (କେବଳ ଉତ୍ପାଦନ)</td>
              <td><a href="https://sentry.io/privacy/" target="_blank" rel="noopener">sentry.io/privacy |</a></td>
            </tr>
          </tbody>
        </table>
        <p>ପ୍ରତ୍ୟେକ ତୃତୀୟ-ପକ୍ଷ ସେବା ନିଜସ୍ୱ ଗୋପନୀୟତା ନୀତି ଅନୁଯାୟୀ ତଥ୍ୟ ପ୍ରକ୍ରିୟାକରଣ କରନ୍ତି | ସେମାନଙ୍କର ନୀତି ସମୀକ୍ଷା କରିବାକୁ ଆମେ ଆପଣଙ୍କୁ ଉତ୍ସାହିତ କରୁଛୁ |</p>
      </div>
    </details>

    <details id="s4">
      <summary><h2>ଡାଟା ଷ୍ଟୋରେଜ୍ ଏବଂ ସୁରକ୍ଷା</h2></summary>
      <div class="section-content">
        <ul>
          <li>ଗମନାଗମନରେ SSL/TLS ଏନକ୍ରିପସନ୍ ସହିତ dataNeonPostgreSQL ଡାଟାବେସରେ ପ୍ରୟୋଗ ତଥ୍ୟ ଗଚ୍ଛିତ |</li>
          <li>ପ୍ରାମାଣିକିକରଣ ଟୋକେନ୍ ଗୁଡିକ ଆପଣଙ୍କର ଡିଭାଇସରେ ସୁରକ୍ଷିତ ଷ୍ଟୋରେଜ୍ (iOS କିଚେନ / Android କିଷ୍ଟୋର) ବ୍ୟବହାର କରି ଗଚ୍ଛିତ ଅଛି |</li>
          <li>23APIଯୋଗାଯୋଗ HTTPS ଏନକ୍ରିପସନ୍ ବ୍ୟବହାର କରେ |</li>
          <li>ଅପବ୍ୟବହାରକୁ ରୋକିବା ପାଇଁ ସମ୍ବେଦନଶୀଳ ଏଣ୍ଡପଏଣ୍ଟଗୁଡିକ ହାର-ସୀମିତ |</li>
          <li>ପାସୱାର୍ଡଗୁଡିକ Clerk ଦ୍ୱାରା ଧୋଇଯାଏ ଏବଂ ପରିଚାଳିତ ହୁଏ - ଆମେ କଦାପି ସାଧା ପାଠ୍ୟ ପାସୱାର୍ଡ ଗଚ୍ଛିତ କରୁନାହୁଁ |</li>
        </ul>
      </div>
    </details>

    <details id="s5">
      <summary><h2>ଡାଟା ଧାରଣ</h2></summary>
      <div class="section-content">
        <ul>
          <li><strong>ଭଏସ୍ ଅଡିଓ:</strong> ଏଫେମେରାଲ୍ - ସ୍ମୃତିରେ ପ୍ରକ୍ରିୟାକରଣ ଏବଂ ତୁରନ୍ତ ପରିତ୍ୟାଗ | ଆମ ସର୍ଭରରେ କେବେବି ଗଚ୍ଛିତ ନୁହେଁ |</li>
          <li><strong>ଟ୍ରାନ୍ସକ୍ରିପସନ୍ ଏବଂ ଅଡିଟ୍ ଲଗ୍:</strong> ତୁମର ଆକାଉଣ୍ଟ୍ ସକ୍ରିୟ ଥିବା ପର୍ଯ୍ୟନ୍ତ, ତୁମର ରେଫରେନ୍ସ ପାଇଁ ରଖାଯାଇଛି |</li>
          <li><strong>ଭଣ୍ଡାର ତଥ୍ୟ:</strong> ଯେପର୍ଯ୍ୟନ୍ତ ଆପଣଙ୍କର ଖାତା ସକ୍ରିୟ ଅଛି ସେ ପର୍ଯ୍ୟନ୍ତ ରଖାଯାଇଛି |</li>
          <li><strong>ଖାତା ତଥ୍ୟ:</strong> ତୁମେ ତୁମର ଖାତା ବିଲୋପ ନକରିବା ପର୍ଯ୍ୟନ୍ତ ରଖାଯାଇଛି |</li>
          <li><strong>ଦୁର୍ଘଟଣା ରିପୋର୍ଟ:</strong> Sentry ର ତଥ୍ୟ ଧାରଣ ନୀତି (ସାଧାରଣତ 90 90 ଦିନ) ଅନୁଯାୟୀ ରଖାଯାଇଛି |</li>
        </ul>
      </div>
    </details>

    <details id="s6">
      <summary><h2>6। ଖାତା ବିଲୋପ</h2></summary>
      <div class="section-content">
        <p>ଆପଣ ଯେକ time ଣସି ସମୟରେ ଆପଣଙ୍କର ଖାତା ବିଲୋପ କରିପାରିବେ | <strong>Settings > Delete Account</strong> ଆପ୍ ଭିତରେ | ଯେତେବେଳେ ତୁମେ ତୁମର ଖାତା ବିଲୋପ କରିବ:</p>
        <ul>
          <li>ଆପଣଙ୍କର ସମସ୍ତ ଦୋକାନ ସବୁ ସ୍ଥାୟୀ ଭାବରେ ବିଲୋପ ହୋଇଛି, ସମସ୍ତ ଉତ୍ପାଦ, ଭଣ୍ଡାର, ବ୍ୟାଚ୍, କ୍ରୟ ତାଲିକା, ଏବଂ AI ପୂର୍ବାନୁମାନ ସହିତ |</li>
          <li>ଆପଣଙ୍କର ସମସ୍ତ ଅଡିଟ୍ ଲଗ୍ ଏବଂ ପସନ୍ଦଗୁଡିକ ସ୍ଥାୟୀ ଭାବରେ ବିଲୋପ ହୋଇଛି |</li>
          <li>ଅନ୍ୟ ଉପଭୋକ୍ତାମାନଙ୍କ ଦୋକାନରେ ଆପଣଙ୍କର ସଦସ୍ୟତା ଅପସାରିତ ହୋଇଛି |</li>
          <li>Clerk ସହିତ ଆପଣଙ୍କର ପ୍ରାମାଣିକିକରଣ ଖାତା ସ୍ଥାୟୀ ଭାବରେ ବିଲୋପ ହୋଇଯାଇଛି |</li>
        </ul>
        <p><strong>ଏହି କ୍ରିୟା ପ୍ରତ୍ୟାବର୍ତ୍ତନଯୋଗ୍ୟ |</strong> ଥରେ ବିଲୋପ ହୋଇଗଲେ, ଆପଣଙ୍କର ତଥ୍ୟ ପୁନରୁଦ୍ଧାର ହୋଇପାରିବ ନାହିଁ |</p>
      </div>
    </details>

    <details id="s7">
      <summary><h2>7। ଦୋକାନ ମଧ୍ୟରେ ଡାଟା ସେୟାର୍ |</h2></summary>
      <div class="section-content">
        <p>Samaan-Bol ହେଉଛି ଏକ ସହଯୋଗୀ ଉପକରଣ | ଯେତେବେଳେ ଆପଣ ଏକ ଦୋକାନର ସଦସ୍ୟ ଅଟନ୍ତି:</p>
        <ul>
          <li>ସମସ୍ତ ଦୋକାନର ସଦସ୍ୟ (Owners, Managers, Helpers) ଦୋକାନର ଭଣ୍ଡାର ତଥ୍ୟ, ଉତ୍ପାଦ ତାଲିକା, ଏବଂ ଅଡିଟ୍ ଲଗ୍ ଦେଖିପାରିବେ |</li>
          <li>ତୁମର ନାମ, ଭୂମିକା, ଏବଂ କାର୍ଯ୍ୟକଳାପ ସମୟ ସୀମା ଅନ୍ୟ ଦୋକାନର ସଦସ୍ୟମାନଙ୍କ ପାଇଁ ଦୃଶ୍ୟମାନ ହୁଏ |</li>
          <li>24Owners ସେମାନଙ୍କର ଦୋକାନ ପାଇଁ ସଦସ୍ୟତା ଏବଂ ପ୍ରବେଶ ପରିଚାଳନା କରିପାରିବ |</li>
        </ul>
        <p>ଆମେ ଆପଣଙ୍କର ତଥ୍ୟ ଦୋକାନଗୁଡିକ ସହିତ ଅଂଶୀଦାର କରୁନାହୁଁ କି ଆପଣ ସଦସ୍ୟ ନୁହଁନ୍ତି କିମ୍ବା କ any ଣସି ସମ୍ପର୍କ ନଥିବା ତୃତୀୟ ପକ୍ଷ ସହିତ |</p>
      </div>
    </details>

    <details id="s8">
      <summary><h2>8। ପିଲାମାନଙ୍କର ଗୋପନୀୟତା |</h2></summary>
      <div class="section-content">
        <p>Samaan-Bol 13 ବର୍ଷରୁ କମ୍ ପିଲାମାନଙ୍କ ବ୍ୟବହାର ପାଇଁ ଉଦ୍ଦିଷ୍ଟ ନୁହେଁ | ଆମେ ଜାଣିଶୁଣି 13 ବର୍ଷରୁ କମ୍ ପିଲାମାନଙ୍କ ଠାରୁ ବ୍ୟକ୍ତିଗତ ସୂଚନା ସଂଗ୍ରହ କରୁନାହୁଁ | ଯଦି ଆପଣ ବିଶ୍ believe ାସ କରନ୍ତି ଯେ ଜଣେ ଶିଶୁ ଆମକୁ ବ୍ୟକ୍ତିଗତ ସୂଚନା ପ୍ରଦାନ କରିଛନ୍ତି, ଦୟାକରି ଆମ ସହିତ ଯୋଗାଯୋଗ କରନ୍ତୁ ଏବଂ ଆମେ ଏହାକୁ ତୁରନ୍ତ ବିଲୋପ କରିବୁ |</p>
      </div>
    </details>

    <details id="s9">
      <summary><h2>9। ଆପଣଙ୍କର ଅଧିକାର</h2></summary>
      <div class="section-content">
        <p>ଆପଣଙ୍କର ଅଧିକାର ଅଛି:</p>
        <ul>
          <li><strong>ଆପଣଙ୍କର ତଥ୍ୟକୁ ପ୍ରବେଶ କରନ୍ତୁ:</strong> ଆପ୍ ମଧ୍ୟରେ ଆପଣଙ୍କର ଭଣ୍ଡାର, ଅଡିଟ୍ ଲଗ୍, ଏବଂ ପସନ୍ଦଗୁଡିକ ଦେଖନ୍ତୁ |</li>
          <li><strong>ଆପଣଙ୍କର ତଥ୍ୟ ବିଲୋପ କରନ୍ତୁ:</strong> ସେଟିଂସମୂହରେ ଖାତା ବିଲୋପ ବ feature ଶିଷ୍ଟ୍ୟ ବ୍ୟବହାର କରନ୍ତୁ |</li>
          <li><strong>ନିୟନ୍ତ୍ରଣ ପସନ୍ଦ:</strong> ଯେକ time ଣସି ସମୟରେ ଆପଣଙ୍କର ଭାଷା, ପ୍ରଦର୍ଶନ ଏବଂ ଭଏସ୍ ସେଟିଂସମୂହକୁ ପରିବର୍ତ୍ତନ କରନ୍ତୁ |</li>
          <li><strong>ଦୋକାନରୁ ପ୍ରତ୍ୟାହାର:</strong> ଆପଣ ଯେକ any ଣସି ଦୋକାନ ଛାଡିଦିଅନ୍ତୁ |</li>
        </ul>
      </div>
    </details>

    <details id="s10">
      <summary><h2>ଏହି ନୀତିରେ ପରିବର୍ତ୍ତନ</h2></summary>
      <div class="section-content">
        <p>ଆମେ ସମୟ ସମୟରେ ଏହି ଗୋପନୀୟତା ନୀତି ଅଦ୍ୟତନ କରିପାରିବା | ଯେତେବେଳେ ଆମେ କରିବୁ, ଆମେ ଏହି ପୃଷ୍ଠାର ଶୀର୍ଷରେ “ପ୍ରଭାବଶାଳୀ ତାରିଖ” ଅପଡେଟ୍ କରିବୁ | ଏହି ନୀତିକୁ ପର୍ଯ୍ୟାୟକ୍ରମେ ସମୀକ୍ଷା କରିବାକୁ ଆମେ ଆପଣଙ୍କୁ ଉତ୍ସାହିତ କରୁଛୁ | ପରିବର୍ତ୍ତନ ପରେ ଆପର କ୍ରମାଗତ ବ୍ୟବହାର ଅପଡେଟ୍ ପଲିସିର ଗ୍ରହଣୀୟତା ସୃଷ୍ଟି କରେ |</p>
      </div>
    </details>

    <details id="s11">
      <summary><h2>11 ଆମ ସହିତ ଯୋଗାଯୋଗ କରନ୍ତୁ |</h2></summary>
      <div class="section-content">
        <p>ଏହି ଗୋପନୀୟତା ନୀତି କିମ୍ବା ଆପଣଙ୍କର ତଥ୍ୟ ବିଷୟରେ ଯଦି ଆପଣଙ୍କର କିଛି ପ୍ରଶ୍ନ ଅଛି, ଦୟାକରି ଆମ ସହିତ ଯୋଗାଯୋଗ କରନ୍ତୁ:</p>
        <p><strong>27Email:</strong> <a href="mailto:meetslimshady07@gmail.com">meetslimshady07@gmail.com</a></p>
      </div>
    </details>

    <p class="copyright">© 2026 Samaan-Bol | ସମସ୍ତ ଅଧିକାର ସଂରକ୍ଷିତ |</p>
  </div>

  <button class="back-to-top" id="backToTop" aria-label="Back to top">↑</button>`,
    terms: `<div class="reading-progress" id="readingProgress"></div>

  <div class="container">
    <a href="/" class="back">Home ଘରକୁ ଫେରନ୍ତୁ |</a>
    <h1>ସେବା ସର୍ତ୍ତାବଳୀ</h1>
    <p class="effective">କାର୍ଯ୍ୟକାରୀ ତାରିଖ: ଫେବୃଆରୀ 23, 2026 |</p>

    <nav class="toc">
      <h3>ବିଷୟବସ୍ତୁ</h3>
      <ol>
        <li><a href="#s1">ସେବାର ବର୍ଣ୍ଣନା</a></li>
        <li><a href="#s2">ଖାତା ପଞ୍ଜୀକରଣ |</a></li>
        <li><a href="#s3">ଉପଯୋଗକର୍ତ୍ତା ଭୂମିକା ଏବଂ ଦାୟିତ୍। |</a></li>
        <li><a href="#s4">ଭଏସ୍ ଇନପୁଟ୍</a></li>
        <li><a href="#s5">ଗ୍ରହଣୀୟ ବ୍ୟବହାର</a></li>
        <li><a href="#s6">ଆପଣଙ୍କର ତଥ୍ୟ</a></li>
        <li><a href="#s7">ସେବା ଉପଲବ୍ଧତା</a></li>
        <li><a href="#s8">ମୂଲ୍ୟ ସୀମା</a></li>
        <li><a href="#s9">ଖାତା ସମାପ୍ତି |</a></li>
        <li><a href="#s10">ବ Intell ଦ୍ଧିକ ଗୁଣ |</a></li>
        <li><a href="#s11">ୱାରେଣ୍ଟିର ପ୍ରତ୍ୟାଖ୍ୟାନ |</a></li>
        <li><a href="#s12">ଦାୟିତ୍ Lim ର ସୀମା |</a></li>
        <li><a href="#s13">ଏହି ସର୍ତ୍ତାବଳୀରେ ପରିବର୍ତ୍ତନ</a></li>
        <li><a href="#s14">ଶାସନ ନିୟମ</a></li>
        <li><a href="#s15">ଆମ ସହିତ ଯୋଗାଯୋଗ କରନ୍ତୁ |</a></li>
      </ol>
    </nav>

    <p>Samaan-Bol କୁ ସ୍ୱାଗତ | ଏହି ସେବା ସର୍ତ୍ତାବଳୀ ("ସର୍ତ୍ତାବଳୀ") Samaan-Bol ମୋବାଇଲ୍ ଆପ୍ଲିକେସନ୍ ଏବଂ ଆନୁଷଙ୍ଗିକ ସେବାଗୁଡିକ (ସାମୂହିକ ଭାବରେ, "ସେବା") ର ବ୍ୟବହାରକୁ ନିୟନ୍ତ୍ରଣ କରେ | ଏକ ଆକାଉଣ୍ଟ୍ ସୃଷ୍ଟି କରି କିମ୍ବା ସେବା ବ୍ୟବହାର କରି, ଆପଣ ଏହି ସର୍ତ୍ତାବଳୀରେ ବନ୍ଧା ହେବାକୁ ରାଜି ହୁଅନ୍ତି |</p>

    <details open id="s1">
      <summary><h2>ସେବାର ବର୍ଣ୍ଣନା</h2></summary>
      <div class="section-content">
        <p>RetailSamaan-Bolହେଉଛି ଏକ ଭଏସ୍-ପ୍ରଥମ ସହଯୋଗୀ ଭଣ୍ଡାର ପରିଚାଳନା ପ୍ରୟୋଗ ଯାହା ଭାରତୀୟ ଖୁଚୁରା ବ୍ୟବସାୟ ପାଇଁ ଡିଜାଇନ୍ ହୋଇଛି | ସେବା ଆପଣଙ୍କୁ ଅନୁମତି ଦିଏ:</p>
        <ul>
          <li>ଏକାଧିକ ଭାରତୀୟ ଭାଷାରେ ଭଏସ୍ କମାଣ୍ଡ ବ୍ୟବହାର କରି ଉତ୍ପାଦ ତାଲିକା ପରିଚାଳନା କରନ୍ତୁ |</li>
          <li>ଷ୍ଟକ୍ ସ୍ତର, ବ୍ୟାଚ୍, ସମାପ୍ତି ତାରିଖ, ଏବଂ କ୍ରୟ ସୂଚନା ଟ୍ରାକ୍ କରନ୍ତୁ |</li>
          <li>ଭୂମିକା-ଆଧାରିତ ପ୍ରବେଶ (Owner, Manager, Helper) ମାଧ୍ୟମରେ ଦଳର ସଦସ୍ୟମାନଙ୍କ ସହିତ ସହଯୋଗ କରନ୍ତୁ |</li>
          <li>ସମସ୍ତ ଭଣ୍ଡାର ପରିବର୍ତ୍ତନଗୁଡ଼ିକର ଅଡିଟ୍ ଟ୍ରେଲ୍ ଦେଖନ୍ତୁ |</li>
          <li>କ୍ରୟ ତାଲିକା ପରିଚାଳନା କରନ୍ତୁ ଏବଂ ଷ୍ଟକ୍ ସ୍ତରୀୟ ଆଲର୍ଟ ଗ୍ରହଣ କରନ୍ତୁ |</li>
        </ul>
      </div>
    </details>

    <details id="s2">
      <summary><h2>ଖାତା ପଞ୍ଜୀକରଣ</h2></summary>
      <div class="section-content">
        <p>ସେବା ବ୍ୟବହାର କରିବାକୁ, ତୁମକୁ ସଠିକ୍ ଏବଂ ସମ୍ପୂର୍ଣ୍ଣ ସୂଚନା ପ୍ରଦାନ କରି ଏକ ଆକାଉଣ୍ଟ୍ ସୃଷ୍ଟି କରିବାକୁ ପଡିବ | ଆପଣ ଏଥିପାଇଁ ଦାୟୀ:</p>
        <ul>
          <li>ତୁମର ଖାତା ପରିଚୟପତ୍ରର ଗୋପନୀୟତା ବଜାୟ ରଖିବା |</li>
          <li>ସମସ୍ତ କାର୍ଯ୍ୟକଳାପ ଯାହା ଆପଣଙ୍କ ଆକାଉଣ୍ଟରେ ଘଟେ |</li>
          <li>ତୁମର ଖାତାର କ un ଣସି ଅନଧିକୃତ ବ୍ୟବହାର ବିଷୟରେ ତୁରନ୍ତ ଆମକୁ ସୂଚିତ କର |</li>
        </ul>
        <p>ଏକ ଆକାଉଣ୍ଟ୍ ସୃଷ୍ଟି କରିବାକୁ ଏବଂ ସେବା ବ୍ୟବହାର କରିବାକୁ ତୁମେ ଅତି କମରେ 13 ବର୍ଷ ବୟସ ହୋଇଥିବା ଆବଶ୍ୟକ |</p>
      </div>
    </details>

    <details id="s3">
      <summary><h2>3। ଉପଭୋକ୍ତା ଭୂମିକା ଏବଂ ଦାୟିତ୍। |</h2></summary>
      <div class="section-content">
        <p>Samaan-Bol ଏକ ଭୂମିକା-ଆଧାରିତ ପ୍ରବେଶ ନିୟନ୍ତ୍ରଣ ପ୍ରଣାଳୀ ବ୍ୟବହାର କରେ:</p>
        <ul>
          <li><strong>Owner:</strong> ଦୋକାନଗୁଡିକ ସୃଷ୍ଟି ଏବଂ ପରିଚାଳନା କରେ, ଦଳର ସଦସ୍ୟମାନଙ୍କୁ ଆମନ୍ତ୍ରଣ କରେ, ସମସ୍ତ ଦୋକାନର ତଥ୍ୟ ଏବଂ ସେଟିଂସମୂହକୁ ପୂର୍ଣ୍ଣ ଆକ୍ସେସ୍ କରେ, ଏବଂ ଦୋକାନ ବିଲୋପ କରିପାରିବ |</li>
          <li><strong>Manager:</strong> ଭଣ୍ଡାର ପରିଚାଳନା, ରିପୋର୍ଟ ଦର୍ଶନ ଏବଂ ଦୋକାନ ମଧ୍ୟରେ ଅଧିକାଂଶ କାର୍ଯ୍ୟ ସମ୍ପାଦନ କରିପାରିବ |</li>
          <li><strong>26Helper:</strong> ନିର୍ଦ୍ଦେଶ ଅନୁଯାୟୀ ଷ୍ଟକ୍ ଆଇଟମ୍ ଯୋଗ ଏବଂ ଅପସାରଣ କରିପାରିବ |</li>
        </ul>
        <p>Owner ଭାବରେ, ତୁମର ଦୋକାନକୁ ପ୍ରବେଶ ଏବଂ ଏଥିରେ ଥିବା ତଥ୍ୟ ପରିଚାଳନା ପାଇଁ ତୁମେ ଦାୟୀ | ଯେତେବେଳେ ଆପଣ ସଦସ୍ୟମାନଙ୍କୁ ଆମନ୍ତ୍ରଣ କରନ୍ତି, ସେମାନେ ଆପଣଙ୍କ ଦୋକାନର ଭଣ୍ଡାର ତଥ୍ୟକୁ ପ୍ରବେଶ କରନ୍ତି |</p>
      </div>
    </details>

    <details id="s4">
      <summary><h2>ଭଏସ୍ ଇନପୁଟ୍</h2></summary>
      <div class="section-content">
        <p>ସେବା ତୃତୀୟ-ପକ୍ଷ AI ସେବା ବ୍ୟବହାର କରି ଭଏସ୍ କମାଣ୍ଡ ପ୍ରକ୍ରିୟାକରଣ କରେ | ଦୟାକରି ସଚେତନ ରୁହନ୍ତୁ:</p>
        <ul>
          <li>ଭଏସ୍ ରେକର୍ଡିଂ ପ୍ରତ୍ୟେକ ନିର୍ଦ୍ଦେଶରେ ସର୍ବାଧିକ 30 ସେକେଣ୍ଡରେ ସୀମିତ |</li>
          <li>ଏହି ସେବା ଇଂରାଜୀ, ହିନ୍ଦୀ, ତାମିଲ, ତେଲୁଗୁ, ବଙ୍ଗାଳୀ, ମରାଠୀ, କନ୍ନଡ, ଗୁଜରାଟୀ, ମାଲାୟାଲମ୍, ଏବଂ ହିଙ୍ଗଲିସ୍ ସହିତ ଏକାଧିକ ଭାଷାକୁ ସମର୍ଥନ କରେ |</li>
          <li>ସ୍ୱର ଚିହ୍ନଟ ସଠିକତା ଅଡିଓ ଗୁଣ, ପୃଷ୍ଠଭୂମି ଶବ୍ଦ, ଉଚ୍ଚାରଣ ଏବଂ ଭାଷା ସ୍ୱଚ୍ଛତା ଉପରେ ନିର୍ଭର କରେ |</li>
          <li>ସଠିକତା ନିଶ୍ଚିତ କରିବାକୁ ତୁମେ ସ୍ୱର-ପ୍ରକ୍ରିୟାକୃତ ଭଣ୍ଡାର ପରିବର୍ତ୍ତନଗୁଡ଼ିକୁ ସମୀକ୍ଷା କରିବା ଉଚିତ୍ |</li>
          <li>ଭଏସ୍ ଅଡିଓ ରିଅଲ୍-ଟାଇମ୍ ରେ ପ୍ରକ୍ରିୟାକରଣ ହୁଏ ଏବଂ ସ୍ଥାୟୀ ଭାବରେ ଗଚ୍ଛିତ ହୁଏ ନାହିଁ (ଆମର ଦେଖନ୍ତୁ | <a href="/privacy-policy">ଗୋପନୀୟତା ନୀତି</a> ବିବରଣୀ ପାଇଁ)</li>
        </ul>
      </div>
    </details>

    <details id="s5">
      <summary><h2>5 ଗ୍ରହଣୀୟ ବ୍ୟବହାର</h2></summary>
      <div class="section-content">
        <p>ଆପଣ ଏଥିରେ ରାଜି ନୁହଁନ୍ତି:</p>
        <ul>
          <li>ଯେକ any ଣସି ବେଆଇନ ଉଦ୍ଦେଶ୍ୟ ପାଇଁ ସେବା ବ୍ୟବହାର କରନ୍ତୁ |</li>
          <li>ଅନ୍ୟ ଉପଭୋକ୍ତାଙ୍କ ଆକାଉଣ୍ଟ କିମ୍ବା ଦୋକାନକୁ ଅନଧିକୃତ ପ୍ରବେଶ ହାସଲ କରିବାକୁ ଚେଷ୍ଟା |</li>
          <li>ସେବା କିମ୍ବା ଏହାର ଭିତ୍ତିଭୂମିରେ ବାଧା ଦିଅନ୍ତୁ |</li>
          <li>ରିଭର୍ସ-ଇଞ୍ଜିନିୟର୍, ପ୍ରୟୋଗକୁ ବିଛିନ୍ନ କରନ୍ତୁ କିମ୍ବା ବିଛିନ୍ନ କରନ୍ତୁ |</li>
          <li>ସାଧାରଣ ବ୍ୟବହାର s ାଞ୍ଚାଠାରୁ ଅଧିକ ସେବାକୁ ପ୍ରବେଶ କରିବାକୁ ସ୍ୱୟଂଚାଳିତ ଉପକରଣ ବ୍ୟବହାର କରନ୍ତୁ |</li>
          <li>ସର୍ବସାଧାରଣରେ କିମ୍ବା ଆପଣଙ୍କ ଦୋକାନରେ ଯୋଗଦେବାକୁ ଉଦ୍ଦିଷ୍ଟ ବ୍ୟକ୍ତିଙ୍କ ସହିତ ଆମନ୍ତ୍ରଣ ସଂକେତଗୁଡିକ ଅଂଶୀଦାର କରନ୍ତୁ |</li>
          <li>ଏକ ଦୋକାନ ମଧ୍ୟରେ ତୁମର ପରିଚୟ କିମ୍ବା ଭୂମିକାକୁ ଭୁଲ ଭାବରେ ଉପସ୍ଥାପନ କର |</li>
        </ul>
      </div>
    </details>

    <details id="s6">
      <summary><h2>6। ଆପଣଙ୍କର ତଥ୍ୟ</h2></summary>
      <div class="section-content">
        <p>ଆପଣ ସେବାରେ ପ୍ରବେଶ କରୁଥିବା ବ୍ୟବସାୟ ତଥ୍ୟର ମାଲିକାନା ବଜାୟ ରଖିଛନ୍ତି (ଉତ୍ପାଦ ସୂଚନା, ଭଣ୍ଡାର ରେକର୍ଡ, ଇତ୍ୟାଦି) | ଆମେ ତୁମର ବିଷୟବସ୍ତୁର ମାଲିକାନା ଦାବି କରୁନାହୁଁ |</p>
        <p>ସେବା ବ୍ୟବହାର କରି, ତୁମେ କେବଳ ସେବା ଯୋଗାଇବା ଏବଂ ଉନ୍ନତି କରିବା ଉଦ୍ଦେଶ୍ୟରେ ତୁମର ତଥ୍ୟ ସଂରକ୍ଷଣ, ପ୍ରକ୍ରିୟାକରଣ ଏବଂ ପ୍ରସାରଣ ପାଇଁ ଆମକୁ ଏକ ସୀମିତ ଲାଇସେନ୍ସ ପ୍ରଦାନ କର |</p>
        <p>ଆମେ କିପରି ଆପଣଙ୍କର ତଥ୍ୟ ସଂଗ୍ରହ, ବ୍ୟବହାର, ଏବଂ ସୁରକ୍ଷା ବିଷୟରେ ସବିଶେଷ ବିବରଣୀ ପାଇଁ, ଦୟାକରି ଆମର ସମୀକ୍ଷା କରନ୍ତୁ | <a href="/privacy-policy">ଗୋପନୀୟତା ନୀତି</a>.</p>
      </div>
    </details>

    <details id="s7">
      <summary><h2>ସେବା ଉପଲବ୍ଧତା</h2></summary>
      <div class="section-content">
        <p>ସେବାକୁ ସବୁବେଳେ ଉପଲବ୍ଧ ରଖିବାକୁ ଆମେ ଚେଷ୍ଟା କରୁ, କିନ୍ତୁ ଆମେ ନିରବଚ୍ଛିନ୍ନ ପ୍ରବେଶକୁ ଗ୍ୟାରେଣ୍ଟି ଦେଉନାହୁଁ | ସେବାଟି ଅସ୍ଥାୟୀ ଭାବରେ ଉପଲବ୍ଧ ହୋଇପାରେ:</p>
        <ul>
          <li>ଯୋଜନାବଦ୍ଧ ରକ୍ଷଣାବେକ୍ଷଣ କିମ୍ବା ଅଦ୍ୟତନଗୁଡ଼ିକ |</li>
          <li>ଆମର ନିୟନ୍ତ୍ରଣ ବାହାରେ ଯାନ୍ତ୍ରିକ ସମସ୍ୟା |</li>
          <li>ତୃତୀୟ-ପକ୍ଷ ସେବା ବନ୍ଦ (ପ୍ରାମାଣିକିକରଣ, ଭଏସ୍ ପ୍ରକ୍ରିୟାକରଣ, ଡାଟାବେସ୍ ହୋଷ୍ଟିଂ)</li>
        </ul>
        <p>ସେବା ଡାଉନଟାଇମ୍ ହେତୁ କ losses ଣସି କ୍ଷତି ପାଇଁ ଆମେ ଦାୟୀ ନୁହେଁ |</p>
      </div>
    </details>

    <details id="s8">
      <summary><h2>8 ରେଟ୍ ସୀମା</h2></summary>
      <div class="section-content">
        <p>ଯଥାର୍ଥ ବ୍ୟବହାର ଏବଂ ସେବା ସ୍ଥିରତା ନିଶ୍ଚିତ କରିବାକୁ, ସେବା API ଅନୁରୋଧ ଉପରେ ହାର ସୀମା କାର୍ଯ୍ୟକାରୀ କରେ | ଏହି ସୀମା ଅତିକ୍ରମ କରିବା ଦ୍ your ାରା ଆପଣଙ୍କର ଅନୁରୋଧଗୁଡିକ ଅସ୍ଥାୟୀ ଥ୍ରଟଲିଂ ହୋଇପାରେ |</p>
      </div>
    </details>

    <details id="s9">
      <summary><h2>ଖାତା ସମାପ୍ତି</h2></summary>
      <div class="section-content">
        <p>ଆପଣ ଯେକ time ଣସି ସମୟରେ ଆପଣଙ୍କର ଖାତା ବିଲୋପ କରିପାରିବେ | <strong>Settings > Delete Account</strong> ଆପ୍ ରେ | ଖାତା ବିଲୋପ ସ୍ଥାୟୀ ଏବଂ ପ୍ରତ୍ୟାବର୍ତ୍ତନଯୋଗ୍ୟ - ଆପଣଙ୍କର ସମସ୍ତ ଦୋକାନ, ଭଣ୍ଡାର ତଥ୍ୟ, ଅଡିଟ୍ ଲଗ୍, ଏବଂ ପସନ୍ଦ ସବୁଦିନ ପାଇଁ ଅପସାରିତ ହେବ |</p>
        <p>ଏହି ସର୍ତ୍ତାବଳୀକୁ ଉଲ୍ଲଂଘନ କରୁଥିବା କିମ୍ବା ଅପମାନଜନକ ଆଚରଣରେ ଲିପ୍ତ ଥିବା ଆକାଉଣ୍ଟକୁ ସ୍ଥଗିତ କିମ୍ବା ବନ୍ଦ କରିବାକୁ ଆମେ ଅଧିକାର ସଂରକ୍ଷଣ କରିଛୁ।</p>
      </div>
    </details>

    <details id="s10">
      <summary><h2>ବ Intell ଦ୍ଧିକ ଗୁଣ</h2></summary>
      <div class="section-content">
        <p>ଏହାର ଡିଜାଇନ୍, କୋଡ୍, ବ୍ରାଣ୍ଡିଂ, ଏବଂ ଡକ୍ୟୁମେଣ୍ଟେସନ୍ ସହିତ Samaan-Bol ପ୍ରୟୋଗ ହେଉଛି ଆମର ବ intellectual ଦ୍ଧିକ ସମ୍ପତ୍ତି | ଆମର ଲିଖିତ ଅନୁମତି ବିନା ଆପଣ ଅନୁପ୍ରୟୋଗ ଉପରେ ଆଧାର କରି ନକଲ, ରୂପାନ୍ତର, ବଣ୍ଟନ କିମ୍ବା ସୃଷ୍ଟି କାର୍ଯ୍ୟ କରିପାରିବେ ନାହିଁ |</p>
      </div>
    </details>

    <details id="s11">
      <summary><h2>11 ୱାରେଣ୍ଟିର ପ୍ରତ୍ୟାଖ୍ୟାନ |</h2></summary>
      <div class="section-content">
        <p>ସେବାଟି ଯେକ as ଣସି ପ୍ରକାରର ୱାରେଣ୍ଟି ବିନା “ଯେପରି” ଏବଂ “ଉପଲବ୍ଧ” ପ୍ରଦାନ କରାଯାଇଥାଏ, ଏକ୍ସପ୍ରେସ କିମ୍ବା ସୂଚିତ | ଆମେ ବିଶେଷ ଭାବରେ ଏହାର ୱାରେଣ୍ଟି ପ୍ରତ୍ୟାଖ୍ୟାନ କରୁଛୁ:</p>
        <ul>
          <li>ଏକ ନିର୍ଦ୍ଦିଷ୍ଟ ଉଦ୍ଦେଶ୍ୟ ପାଇଁ ବ୍ୟବସାୟ କିମ୍ବା ଫିଟନେସ୍ |</li>
          <li>ସ୍ୱର ସ୍ୱୀକୃତିର ସଠିକତା କିମ୍ବା AI- ଉତ୍ପାଦିତ ପରାମର୍ଶ |</li>
          <li>ନିରବଚ୍ଛିନ୍ନ କିମ୍ବା ତ୍ରୁଟିମୁକ୍ତ କାର୍ଯ୍ୟ |</li>
        </ul>
        <p>ଭଏସ୍-ଆଧାରିତ ଇନଭେଣ୍ଟୋରୀ କ୍ରିୟାଗୁଡ଼ିକ ହେଉଛି ସାହାଯ୍ୟ - ତୁମେ ସ୍ critical ାଧୀନ ଭାବରେ ଜଟିଳ ଷ୍ଟକ୍ ନିଷ୍ପତ୍ତି ଯାଞ୍ଚ କରିବା ଉଚିତ୍ |</p>
      </div>
    </details>

    <details id="s12">
      <summary><h2>ଉତ୍ତରଦାୟିତ୍ୱର ସୀମା</h2></summary>
      <div class="section-content">
        <p>ଆଇନ ଦ୍ mitted ାରା ଅନୁମୋଦିତ ସର୍ବାଧିକ ପରିମାଣରେ, ଆପଣଙ୍କର ସେବାର ବ୍ୟବହାର ଦ୍ aring ାରା ଉତ୍ପନ୍ନ କ indir ଣସି ପରୋକ୍ଷ, ଘଟଣା, ବିଶେଷ, ପରିଣାମମୂଳକ କିମ୍ବା ଦଣ୍ଡନୀୟ କ୍ଷତି ପାଇଁ ଆମେ ଦାୟୀ ରହିବୁ ନାହିଁ, ଅନ୍ତର୍ଭୁକ୍ତ କିନ୍ତୁ ସୀମିତ ନୁହେଁ:</p>
        <ul>
          <li>ଭଏସ୍ ସ୍ୱୀକୃତି ତ୍ରୁଟିରୁ ଇନଭେଣ୍ଟୋରୀ ଅସଙ୍ଗତି |</li>
          <li>ସେବା ଡାଉନଟାଇମ୍ ହେତୁ ବ୍ୟବସାୟ କ୍ଷତି |</li>
          <li>ଆମର ମାନକ ବ୍ୟାକଅପ୍ ପ୍ରଣାଳୀ ଦ୍ୱାରା ଯାହା ଅନ୍ତର୍ଭୂକ୍ତ ହୋଇଛି ତା’ଠାରୁ ଅଧିକ ତଥ୍ୟ କ୍ଷତି |</li>
        </ul>
      </div>
    </details>

    <details id="s13">
      <summary><h2>13। ଏହି ସର୍ତ୍ତାବଳୀରେ ପରିବର୍ତ୍ତନ</h2></summary>
      <div class="section-content">
        <p>ଆମେ ସମୟ ସମୟରେ ଏହି ସର୍ତ୍ତାବଳୀ ଅପଡେଟ୍ କରିପାରିବା | ଯେତେବେଳେ ଆମେ କରିବୁ, ଆମେ ଏହି ପୃଷ୍ଠାର ଶୀର୍ଷରେ “ପ୍ରଭାବଶାଳୀ ତାରିଖ” ଅପଡେଟ୍ କରିବୁ | ପରିବର୍ତ୍ତନ ପରେ ସେବାର କ୍ରମାଗତ ବ୍ୟବହାର ଅପଡେଟ୍ ହୋଇଥିବା ସର୍ତ୍ତାବଳୀ ଗ୍ରହଣ କରେ |</p>
      </div>
    </details>

    <details id="s14">
      <summary><h2>14</h2></summary>
      <div class="section-content">
        <p>ଏହି ସର୍ତ୍ତାବଳୀ ଭାରତର ନିୟମ ଅନୁଯାୟୀ ପରିଚାଳିତ ହେବ ଏବଂ ବୁ ued ାଯିବ | ଏହି ସର୍ତ୍ତାବଳୀ କିମ୍ବା ସେବା ଦ୍ Any ାରା ଉତ୍ପନ୍ନ ଯେକ Any ଣସି ବିବାଦ ଭାରତର ଅଦାଲତର ସ୍ୱତନ୍ତ୍ର ଅଧିକାର ଅଧୀନରେ ରହିବ।</p>
      </div>
    </details>

    <details id="s15">
      <summary><h2>ଆମ ସହିତ ଯୋଗାଯୋଗ କରନ୍ତୁ |</h2></summary>
      <div class="section-content">
        <p>ଯଦି ଏହି ସର୍ତ୍ତାବଳୀ ବିଷୟରେ ଆପଣଙ୍କର କିଛି ପ୍ରଶ୍ନ ଅଛି, ଦୟାକରି ଆମ ସହିତ ଯୋଗାଯୋଗ କରନ୍ତୁ:</p>
        <p><strong>27Email:</strong> <a href="mailto:meetslimshady07@gmail.com">meetslimshady07@gmail.com</a></p>
      </div>
    </details>

    <p class="copyright">© 2026 Samaan-Bol | ସମସ୍ତ ଅଧିକାର ସଂରକ୍ଷିତ |</p>
  </div>

  <button class="back-to-top" id="backToTop" aria-label="Back to top">↑</button>`,
  },
};
