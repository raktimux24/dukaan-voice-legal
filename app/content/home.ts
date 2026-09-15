export const proofSectionHtml = `<!-- ═══ PROOF ═══ -->
<section class="testimonials">
  <div class="container">
    <div class="reveal">
      <div class="section-label">Proof</div>
      <h2 class="section-heading">What you get. No invented quotes.</h2>
    </div>
    <div class="testimonials-grid">
      <div class="testimonial reveal reveal-delay-1">
        <div class="testimonial-stars">Free</div>
        <blockquote>Tap to sell on iPhone. Download on the App Store.</blockquote>
        <div class="testimonial-author">Free tap-to-sell</div>
        <div class="testimonial-role">App Store live · no Play Store download</div>
      </div>
      <div class="testimonial reveal reveal-delay-2">
        <div class="testimonial-stars">Premium</div>
        <blockquote>Voice till in the app — 7 days, no card. Then ₹499/month or ₹3,999/year. Manage on /account. Trial is not a refund window.</blockquote>
        <div class="testimonial-author">Premium voice</div>
        <div class="testimonial-role">7 days in the app, no card · then manage subscription</div>
      </div>
      <div class="testimonial reveal reveal-delay-3">
        <div class="testimonial-stars">POS</div>
        <blockquote>Stock follows the sale. No GST on bills. No card reader.</blockquote>
        <div class="testimonial-author">Stock behind sale</div>
        <div class="testimonial-role">Cash · UPI QR · udhaar</div>
      </div>
    </div>
  </div>
</section>`;

export const homeHtml = `<!-- Three.js background canvas -->
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
        <div class="logo-text">Samaan<span>Bol</span></div>
      </a>
      <ul class="nav-links">
        <li><a href="#features">Features</a></li>
        <li><a href="#ai">Voice till</a></li>
        <li><a href="/pricing">Pricing</a></li>
        <li><a href="/account">Manage subscription</a></li>
        <li><a href="https://apps.apple.com/in/app/samaan-bol/id6759739444" class="nav-cta">Download Free</a></li>
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
        <div class="hero-eyebrow">Voice POS for the kirana counter</div>
        <h1 class="hero-text-reveal">
          <span class="hindi-line hindi">बिल मत टाइप करो। बोलो।</span>
          <span class="hero-text-main">Don't type the bill.<br>Say it.</span>
        </h1>
        <p class="hero-sub">
          You already speak the sale in <span class="hero-rotate"><span class="hero-rotate-word active">Hindi</span><span class="hero-rotate-word">Bengali</span><span class="hero-rotate-word">Tamil</span><span class="hero-rotate-word">Telugu</span><span class="hero-rotate-word">Marathi</span><span class="hero-rotate-word">Kannada</span><span class="hero-rotate-word">Gujarati</span><span class="hero-rotate-word">Malayalam</span><span class="hero-rotate-word">Punjabi</span><span class="hero-rotate-word">Odia</span><span class="hero-rotate-word">English</span></span>.
          Samaan Bol catches it, takes cash, UPI, or udhaar, and stock follows. Free tap-to-sell on iPhone. Premium adds voice at the till — new shops get 7 days free, no card. Hindi, Hinglish, or any of 10 Indian languages + English.
        </p>
        <div class="hero-actions">
          <a href="https://apps.apple.com/in/app/samaan-bol/id6759739444" class="btn-primary">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Download Free
          </a>
          <a href="#how" class="btn-secondary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            See It In Action
          </a>
        </div>
        <div class="hero-stats">
          <div class="hero-stat">
            <div class="hero-stat-number">Free</div>
            <div class="hero-stat-label">Tap to sell</div>
          </div>
          <div class="hero-stat">
            <div class="hero-stat-number">7 days</div>
            <div class="hero-stat-label">Premium in the app, no card</div>
          </div>
          <div class="hero-stat">
            <div class="hero-stat-number">iPhone</div>
            <div class="hero-stat-label">App Store live</div>
          </div>
        </div>
      </div>

      <div class="hero-visual">
        <!-- Floating cards (z-index 10 — in FRONT of phone) -->
        <div class="float-card float-card--voice">
          <div class="float-card-icon float-card-icon--voice"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg></div>
          <p><strong class="hindi">"चावल 5 किलो बेचा"</strong></p>
          <p style="margin-top:6px; font-size:12px; color:var(--success);">Rice 5 kg · Cash/UPI?</p>
        </div>

        <div class="float-card float-card--alert">
          <div class="float-card-icon float-card-icon--alert"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg></div>
          <p><strong>Bill ready</strong></p>
          <p style="margin-top:4px; font-size:12px;">WhatsApp / PDF</p>
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
                <div class="phone-greeting">Good morning! 👋</div>
                <div class="phone-subtext">Kirana counter</div>
              </div>
              <div class="phone-bell">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B6B70" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                <div class="phone-bell-badge">3</div>
              </div>
            </div>

            <!-- Search bar with mic icon -->
            <div class="phone-search">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4A4A50" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <span class="phone-search-text">Search to sell…</span>
              <div class="phone-search-mic">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0D0D12" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/></svg>
              </div>
            </div>

            <!-- 2x2 Stats grid -->
            <div class="phone-stats-grid">
              <div class="phone-stat-card phone-stat-card--total">
                <div class="phone-stat-number">₹8,420</div>
                <div class="phone-stat-label">Today's sales</div>
              </div>
              <div class="phone-stat-card phone-stat-card--activity">
                <div class="phone-stat-number" style="color:var(--success);">12</div>
                <div class="phone-stat-label">Bills today</div>
              </div>
              <div class="phone-stat-card phone-stat-card--total">
                <div class="phone-stat-number">₹5,100</div>
                <div class="phone-stat-label">Cash</div>
              </div>
              <div class="phone-stat-card phone-stat-card--activity">
                <div class="phone-stat-number" style="color:var(--success);">₹3,320</div>
                <div class="phone-stat-label">UPI</div>
              </div>
            </div>

            <!-- Filter chips -->
            <div class="phone-filter-row">
              <span class="phone-chip phone-chip--active">Sell</span>
              <span class="phone-chip">Cart</span>
              <span class="phone-chip">Udhaar</span>
              <span class="phone-chip">Today</span>
            </div>

            <!-- Cart-style lines -->
            <div class="phone-product">
              <div class="phone-product-icon" style="background:rgba(255,181,71,0.12);">🍚</div>
              <div class="phone-product-info">
                <div class="phone-product-name">Rice 5 kg</div>
                <div class="phone-product-meta">Cash · UPI?</div>
              </div>
              <div class="phone-product-qty">
                <div class="phone-product-qty-num">₹250</div>
                <div class="phone-product-qty-unit">bill</div>
              </div>
            </div>

            <div class="phone-product">
              <div class="phone-product-icon" style="background:rgba(255,107,0,0.12);">🫒</div>
              <div class="phone-product-info">
                <div class="phone-product-name">Aashirvaad Atta</div>
                <div class="phone-product-meta">2 pkt · Udhaar</div>
              </div>
              <div class="phone-product-qty">
                <div class="phone-product-qty-num">₹80</div>
                <div class="phone-product-qty-unit">bill</div>
              </div>
            </div>

            <div class="phone-product">
              <div class="phone-product-icon" style="background:rgba(50,213,131,0.1);">🥛</div>
              <div class="phone-product-info">
                <div class="phone-product-name">Amul Toned Milk</div>
                <div class="phone-product-meta">4 pkt · Cash</div>
              </div>
              <div class="phone-product-qty">
                <div class="phone-product-qty-num">₹120</div>
                <div class="phone-product-qty-unit">bill</div>
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
      <div class="section-label">How It Works</div>
      <h2 class="section-heading">Three steps. No training needed.</h2>
      <p class="section-sub">Speak the sale — or tap to sell on the free plan. Voice never finishes payment.</p>
    </div>
    <div class="steps-grid">
      <div class="step reveal reveal-delay-1">
        <div class="step-number">01</div>
        <h3>Speak the sale (or tap free)</h3>
        <p>Say what sold, or tap it on the free plan. Hindi, Hinglish, or any of 10 Indian languages + English.</p>
        <div class="step-example">
          <div class="hindi">"चावल 5 किलो बेचा"</div>
          <div class="english">Rice 5 kg sold</div>
        </div>
      </div>
      <div class="step reveal reveal-delay-2">
        <div class="step-number">02</div>
        <h3>Cash / UPI QR / udhaar</h3>
        <p>Take cash, show a UPI QR, or put it on udhaar. Voice never finishes payment.</p>
        <div class="step-example">
          <div style="display:flex; gap:12px; flex-wrap:wrap;">
            <span style="background:var(--saffron-tint); color:var(--saffron); padding:4px 10px; border-radius:4px; font-size:12px;">Cash</span>
            <span style="background:rgba(50,213,131,0.1); color:var(--success); padding:4px 10px; border-radius:4px; font-size:12px;">UPI QR</span>
            <span style="background:rgba(99,102,241,0.1); color:#818CF8; padding:4px 10px; border-radius:4px; font-size:12px;">Udhaar</span>
          </div>
        </div>
      </div>
      <div class="step reveal reveal-delay-3">
        <div class="step-number">03</div>
        <h3>Stock + today's sales + bill</h3>
        <p>Stock follows the sale. Today's sales update. Share the bill on WhatsApp or PDF.</p>
        <div class="step-example">
          <div class="hindi">Stock · today's sales · WhatsApp/PDF</div>
          <div class="english">Bill leaves the counter</div>
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
      <div class="section-label">Features</div>
      <h2 class="section-heading">Everything your shop needs. Nothing it doesn't.</h2>
    </div>
    <div class="features-grid">
      <div class="feature feature--hero reveal reveal-delay-1">
        <div class="feature-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg></div>
        <h3>Voice till (Premium)</h3>
        <p>Speak the sale at the counter. Samaan Bol catches it. Confirm cash, UPI QR, or udhaar yourself — voice never finishes payment. New shops get 7 days of Premium in the app, no card.</p>
      </div>
      <div class="feature reveal reveal-delay-2">
        <div class="feature-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg></div>
        <h3>10 Indian languages + English</h3>
        <p>Hindi, Bengali, Tamil, Telugu, Marathi, Kannada, Gujarati, Malayalam, Punjabi, and Odia — plus English. Hindi or Hinglish at the till is fine.</p>
      </div>
      <div class="feature reveal reveal-delay-3">
        <div class="feature-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></div>
        <h3>Staff sell from their phones</h3>
        <p>Helpers can sell from their own phones. The bill still lands on the shop counter.</p>
      </div>
      <div class="feature reveal reveal-delay-1">
        <div class="feature-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/><path d="M9 14l2 2 4-4"/></svg></div>
        <h3>Bill leaves the counter</h3>
        <p>Share the bill on WhatsApp or as a PDF. No GST on bills.</p>
      </div>
      <div class="feature reveal reveal-delay-2">
        <div class="feature-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></svg></div>
        <h3>Udhaar/khata (Premium)</h3>
        <p>Put a sale on udhaar. Khata stays with the shop — Premium.</p>
      </div>
      <div class="feature reveal reveal-delay-3">
        <div class="feature-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><line x1="7" y1="12" x2="17" y2="12"/><line x1="7" y1="8" x2="17" y2="8"/><line x1="7" y1="16" x2="17" y2="16"/></svg></div>
        <h3>Barcode to cart</h3>
        <p>Scan a barcode to put the item on the bill. Tap to sell on the free plan.</p>
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
      <div class="section-label">Voice till</div>
      <h2 class="section-heading">
        <span class="hindi" style="display:block; color:var(--saffron); font-size:clamp(22px,2.8vw,32px); font-weight:500; margin-bottom:8px;">बोलो। पैसे कन्फर्म करो।</span>
        Speak the sale. Confirm the money.
      </h2>
      <p class="section-sub">Voice selling, payments, today's sales Q&amp;A, and stock behind the sale. Not a digital brain. No festival forecasting.</p>
    </div>

    <div class="ai-blocks">
      <!-- Voice selling -->
      <div class="ai-block reveal">
        <div class="ai-block-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg></div>
        <div class="ai-block-tag ai-block-tag--predict">Voice selling</div>
        <h3>Speak the sale</h3>
        <p>Say what sold. Samaan Bol puts it on the bill. Or tap to sell on the free plan.</p>
        <div class="ai-voice-example">
          <div class="voice-bubble">
            <div class="voice-bubble-avatar voice-bubble-avatar--ai"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg></div>
            <div class="voice-bubble-content">
              <div class="hindi">"चावल 5 किलो बेचा"</div>
              <div class="translation">Rice 5 kg · Cash/UPI?</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Payments -->
      <div class="ai-block reveal">
        <div class="ai-block-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg></div>
        <div class="ai-block-tag ai-block-tag--alert">Payments</div>
        <h3>Confirm the money</h3>
        <p>Cash, UPI QR, or udhaar. You finish payment. Voice never does.</p>
        <div class="ai-voice-example">
          <div class="voice-bubble">
            <div class="voice-bubble-avatar voice-bubble-avatar--ai"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg></div>
            <div class="voice-bubble-content">
              <div class="hindi">Cash / UPI / udhaar</div>
              <div class="translation">You confirm. Voice never finishes payment.</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Today's sales Q&A -->
      <div class="ai-block reveal">
        <div class="ai-block-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg></div>
        <div class="ai-block-tag ai-block-tag--insight">Today's sales Q&amp;A</div>
        <h3>Ask about today's sales</h3>
        <p>Ask how the counter did today. Spoken answers, on-screen numbers.</p>
        <div class="ai-voice-example">
          <div class="voice-bubble">
            <div class="voice-bubble-avatar voice-bubble-avatar--user"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>
            <div class="voice-bubble-content">
              <div class="hindi">"आज कितना बिका?"</div>
              <div class="translation">How much sold today?</div>
            </div>
          </div>
          <div class="voice-bubble">
            <div class="voice-bubble-avatar voice-bubble-avatar--ai"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg></div>
            <div class="voice-bubble-content">
              <div class="hindi">Today's sales · Cash · UPI</div>
              <div class="translation">On-screen totals for the day</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Stock behind the sale -->
      <div class="ai-block reveal">
        <div class="ai-block-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>
        <div class="ai-block-tag ai-block-tag--team">Stock behind the sale</div>
        <h3>Stock follows the bill</h3>
        <p>When the sale lands, stock updates. No festival forecasting. No digital brain.</p>
        <div class="ai-voice-example">
          <div class="voice-bubble">
            <div class="voice-bubble-avatar voice-bubble-avatar--ai"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg></div>
            <div class="voice-bubble-content">
              <div class="hindi">Stock behind the sale</div>
              <div class="translation">The bill moves stock. That's it.</div>
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
      <div class="section-label">Built for Bharat</div>
      <h2 class="section-heading">Your language. Your business. Your way.</h2>
      <p class="section-sub">Hindi, Hinglish, or any of 10 Indian languages + English — including native scripts and the names you actually use at the counter.</p>
    </div>
    <div class="lang-grid reveal">
      <div class="lang-chip lang-chip--featured">Hindi <span class="native hindi">हिन्दी</span></div>
      <div class="lang-chip">Bengali <span class="native">বাংলা</span></div>
      <div class="lang-chip">Tamil <span class="native">தமிழ்</span></div>
      <div class="lang-chip">Telugu <span class="native">తెలుగు</span></div>
      <div class="lang-chip">Marathi <span class="native">मराठी</span></div>
      <div class="lang-chip">Kannada <span class="native">ಕನ್ನಡ</span></div>
      <div class="lang-chip">Gujarati <span class="native">ગુજરાતી</span></div>
      <div class="lang-chip">Malayalam <span class="native">മലയാളം</span></div>
      <div class="lang-chip">Punjabi <span class="native">ਪੰਜਾਬੀ</span></div>
      <div class="lang-chip">Odia <span class="native">ଓଡ଼ିଆ</span></div>
      <div class="lang-chip">English <span class="native">English</span></div>
    </div>
  </div>
</section>

<!-- ═══ COMPARISON ═══ -->
<section class="comparison">
  <div class="container">
    <div class="reveal">
      <div class="section-label">Why Samaan Bol</div>
      <h2 class="section-heading">The difference is night and day</h2>
    </div>
    <div class="comparison-grid reveal">
      <div class="comparison-col comparison-col--without">
        <h3>Without Samaan Bol</h3>
        <p class="comparison-col-subtitle">Typed bills and a notebook</p>
        <ul class="comparison-list">
          <li><span class="icon">✕</span> Typed bills and paper notebooks</li>
          <li><span class="icon">✕</span> Cash, UPI, and udhaar tracked separately</li>
          <li><span class="icon">✕</span> Stock counted after the rush</li>
          <li><span class="icon">✕</span> Bills stay at the counter</li>
          <li><span class="icon">✕</span> No picture of today's sales</li>
          <li><span class="icon">✕</span> Voice till locked behind typing</li>
        </ul>
      </div>
      <div class="comparison-col comparison-col--with">
        <h3>With Samaan Bol</h3>
        <p class="comparison-col-subtitle">Speak or tap · cash · UPI · udhaar</p>
        <ul class="comparison-list">
          <li><span class="icon">✓</span> Speak the sale — or tap to sell on the free plan</li>
          <li><span class="icon">✓</span> Cash, UPI QR, or udhaar on the same bill</li>
          <li><span class="icon">✓</span> Stock follows the sale</li>
          <li><span class="icon">✓</span> Share the bill on WhatsApp or PDF</li>
          <li><span class="icon">✓</span> Today's sales at a glance</li>
          <li><span class="icon">✓</span> Premium voice at the till</li>
        </ul>
      </div>
    </div>
  </div>
</section>

${proofSectionHtml}

<!-- ═══ CTA ═══ -->
<section class="cta-section" id="download">
  <div class="container">
    <div class="reveal">
      <div class="section-label">Get Started Free</div>
      <h2 class="section-heading">
        <span class="hindi" style="display:block; color:var(--saffron); font-size:clamp(20px,2.4vw,28px); font-weight:500; margin-bottom:8px;">आज ही शुरू करें</span>
        Speak the sale. Take the money.
      </h2>
      <p class="section-sub">Free tap-to-sell on the App Store. Premium voice till — 7 days in the app, no card. Trial is not a refund window.</p>
      <div class="cta-actions">
        <a href="https://apps.apple.com/in/app/samaan-bol/id6759739444" class="store-badge">
          <div class="store-badge-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg></div>
          <div class="store-badge-text">
            <div class="store-badge-label">Download on the</div>
            <div class="store-badge-name">App Store</div>
          </div>
        </a>
        <a href="/account" class="store-badge">
          <div class="store-badge-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg></div>
          <div class="store-badge-text">
            <div class="store-badge-label">Already have a shop?</div>
            <div class="store-badge-name">Manage subscription</div>
          </div>
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
          <div class="logo-text">Samaan<span>Bol</span></div>
        </a>
        <p>Voice POS for Indian kirana counters.</p>
      </div>
      <div class="footer-col">
        <h4>Product</h4>
        <ul>
          <li><a href="#features">Features</a></li>
          <li><a href="#ai">Voice till</a></li>
          <li><a href="/pricing">Pricing</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>Company</h4>
        <ul>
          <li><a href="/pricing">Pricing</a></li>
          <li><a href="/account">Manage subscription</a></li>
          <li><a href="/contact">Contact</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>Support</h4>
        <ul>
          <li><a href="/account">Manage subscription</a></li>
          <li><a href="/refund-policy">Refund Policy</a></li>
          <li><a href="/privacy-policy">Privacy Policy</a></li>
          <li><a href="/terms-of-service">Terms of Service</a></li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <span>&copy; 2026 Samaan Bol. All rights reserved.</span>
      <span class="made-in-india">Made with ♥ in India 🇮🇳</span>
    </div>
  </div>
</footer>`;
