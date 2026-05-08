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
        <li><a href="#how">How It Works</a></li>
        <li><a href="#features">Features</a></li>
        <li><a href="#ai">AI Intelligence</a></li>
        <li><a href="#languages">Languages</a></li>
        <li><a href="https://apps.apple.com/in/app/samaan-bol/id6759739444" class="nav-cta">Download App</a></li>
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
        <div class="hero-eyebrow">Voice-first inventory for Indian retail</div>
        <h1 class="hero-text-reveal">
          <span class="hindi-line hindi">बोल के सँभालो अपना बिज़नेस</span>
          <span class="hero-text-main">Manage your shop<br>with just your voice</span>
        </h1>
        <p class="hero-sub">
          Speak in <span class="hero-rotate"><span class="hero-rotate-word active">Hindi</span><span class="hero-rotate-word">Bengali</span><span class="hero-rotate-word">Tamil</span><span class="hero-rotate-word">Telugu</span><span class="hero-rotate-word">Marathi</span><span class="hero-rotate-word">English</span></span>, or any of 10 Indian languages.
          Samaan-Bol's AI understands your command, updates your inventory,
          and keeps your business running — hands-free.
        </p>
        <div class="hero-actions">
          <a href="#download" class="btn-primary">
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
            <div class="hero-stat-number">11</div>
            <div class="hero-stat-label">Languages supported</div>
          </div>
          <div class="hero-stat">
            <div class="hero-stat-number">50K+</div>
            <div class="hero-stat-label">Items tracked daily</div>
          </div>
          <div class="hero-stat">
            <div class="hero-stat-number">2min</div>
            <div class="hero-stat-label">Setup time</div>
          </div>
        </div>
      </div>

      <div class="hero-visual">
        <!-- Floating cards (z-index 10 — in FRONT of phone) -->
        <div class="float-card float-card--voice">
          <div class="float-card-icon float-card-icon--voice"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg></div>
          <p><strong class="hindi">"चावल 5 किलो जोड़ दो"</strong></p>
          <p style="margin-top:6px; font-size:12px; color:var(--success);">✓ Basmati Rice — 18 → 23 kg</p>
        </div>

        <div class="float-card float-card--alert">
          <div class="float-card-icon float-card-icon--alert"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg></div>
          <p><strong>Low Stock Alert</strong></p>
          <p style="margin-top:4px; font-size:12px;">Atta may run out in 3 days</p>
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
              <span class="phone-search-text">Search products...</span>
              <div class="phone-search-mic">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0D0D12" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/></svg>
              </div>
            </div>

            <!-- 2x2 Stats grid -->
            <div class="phone-stats-grid">
              <div class="phone-stat-card phone-stat-card--total">
                <div class="phone-stat-number">142</div>
                <div class="phone-stat-label">Total Items</div>
              </div>
              <div class="phone-stat-card phone-stat-card--low">
                <div class="phone-stat-number" style="color:var(--warning);">8</div>
                <div class="phone-stat-label">Low Stock</div>
              </div>
              <div class="phone-stat-card phone-stat-card--out">
                <div class="phone-stat-number" style="color:var(--danger);">2</div>
                <div class="phone-stat-label">Out of Stock</div>
              </div>
              <div class="phone-stat-card phone-stat-card--activity">
                <div class="phone-stat-number" style="color:var(--success);">23</div>
                <div class="phone-stat-label">Updated Today</div>
              </div>
            </div>

            <!-- Filter chips -->
            <div class="phone-filter-row">
              <span class="phone-chip phone-chip--active">All</span>
              <span class="phone-chip">Low Stock</span>
              <span class="phone-chip">Out</span>
              <span class="phone-chip">Expiry</span>
            </div>

            <!-- Product cards -->
            <div class="phone-product">
              <div class="phone-product-icon" style="background:rgba(255,181,71,0.12);">🍚</div>
              <div class="phone-product-info">
                <div class="phone-product-name">Basmati Rice</div>
                <div class="phone-product-meta">Grains · Updated 2m ago</div>
              </div>
              <div class="phone-product-qty">
                <div class="phone-product-qty-num">23</div>
                <div class="phone-product-qty-unit">kg</div>
              </div>
            </div>

            <div class="phone-product">
              <div class="phone-product-icon" style="background:rgba(255,107,0,0.12);">🫒</div>
              <div class="phone-product-info">
                <div class="phone-product-name">Aashirvaad Atta</div>
                <div class="phone-product-meta">Flour · Updated 1h ago</div>
                <div class="phone-product-status phone-product-status--low">LOW STOCK</div>
              </div>
              <div class="phone-product-qty">
                <div class="phone-product-qty-num" style="color:var(--warning);">3</div>
                <div class="phone-product-qty-unit">kg</div>
              </div>
            </div>

            <div class="phone-product">
              <div class="phone-product-icon" style="background:rgba(50,213,131,0.1);">🥛</div>
              <div class="phone-product-info">
                <div class="phone-product-name">Amul Toned Milk</div>
                <div class="phone-product-meta">Dairy · Updated 3h ago</div>
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
      <div class="section-label">How It Works</div>
      <h2 class="section-heading">Three steps. No training needed.</h2>
      <p class="section-sub">Just speak naturally in your language — the AI handles the rest.</p>
    </div>
    <div class="steps-grid">
      <div class="step reveal reveal-delay-1">
        <div class="step-number">01</div>
        <h3>Speak your command</h3>
        <p>Tap the mic and say what you need — add stock, check quantity, create a buy list. In any Indian language.</p>
        <div class="step-example">
          <div class="hindi">"चावल 5 किलो जोड़ दो"</div>
          <div class="english">Add 5 kg rice</div>
        </div>
      </div>
      <div class="step reveal reveal-delay-2">
        <div class="step-number">02</div>
        <h3>AI understands instantly</h3>
        <p>Sarvam AI processes your speech, extracts the product, quantity, and action — then matches it to your inventory.</p>
        <div class="step-example">
          <div style="display:flex; gap:12px; flex-wrap:wrap;">
            <span style="background:var(--saffron-tint); color:var(--saffron); padding:4px 10px; border-radius:4px; font-size:12px;">Rice → Basmati 🍚</span>
            <span style="background:rgba(50,213,131,0.1); color:var(--success); padding:4px 10px; border-radius:4px; font-size:12px;">+5 kg</span>
            <span style="background:rgba(99,102,241,0.1); color:#818CF8; padding:4px 10px; border-radius:4px; font-size:12px;">Add ✓</span>
          </div>
        </div>
      </div>
      <div class="step reveal reveal-delay-3">
        <div class="step-number">03</div>
        <h3>Inventory updated, confirmed</h3>
        <p>Your stock is updated instantly. You hear a voice confirmation in your language — no screen needed.</p>
        <div class="step-example">
          <div class="hindi">"हो गया — बासमती चावल अब 23 किलो है"</div>
          <div class="english">Done — Basmati rice is now 23 kg</div>
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
        <h3>Voice-First Inventory</h3>
        <p>Add, remove, or check stock by speaking naturally. No typing, no searching through menus. Just speak in your language and the AI handles the rest — from understanding your command to updating your stock in real time.</p>
      </div>
      <div class="feature reveal reveal-delay-2">
        <div class="feature-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg></div>
        <h3>10 Indian Languages + English</h3>
        <p>Hindi, Bengali, Tamil, Telugu, Marathi, Kannada, Gujarati, Malayalam, Punjabi, and Odia — powered by Sarvam AI.</p>
      </div>
      <div class="feature reveal reveal-delay-3">
        <div class="feature-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></div>
        <h3>Team Roles</h3>
        <p>Owner, Manager, and Helper roles with granular permissions. Everyone on the same page, securely.</p>
      </div>
      <div class="feature reveal reveal-delay-1">
        <div class="feature-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/><path d="M9 14l2 2 4-4"/></svg></div>
        <h3>Smart Buy Lists</h3>
        <p>Auto-generated restocking lists based on what's running low. Share to suppliers via WhatsApp.</p>
      </div>
      <div class="feature reveal reveal-delay-2">
        <div class="feature-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></svg></div>
        <h3>Activity Audit Log</h3>
        <p>Every change tracked with who, what, and when. Complete transparency across your team.</p>
      </div>
      <div class="feature reveal reveal-delay-3">
        <div class="feature-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><line x1="7" y1="12" x2="17" y2="12"/><line x1="7" y1="8" x2="17" y2="8"/><line x1="7" y1="16" x2="17" y2="16"/></svg></div>
        <h3>Barcode Scanning</h3>
        <p>Scan products to add or look up instantly. Works with Indian and international barcodes.</p>
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
      <div class="section-label">AI Intelligence</div>
      <h2 class="section-heading">
        <span class="hindi" style="display:block; color:var(--saffron); font-size:clamp(22px,2.8vw,32px); font-weight:500; margin-bottom:8px;">समझदार AI जो आपके बिज़नेस को समझे</span>
        Not just tracking — your shop's first digital brain
      </h2>
      <p class="section-sub">Samaan-Bol doesn't just record what you tell it. It learns your patterns, predicts your needs, and alerts you before problems happen.</p>
    </div>

    <div class="ai-blocks">
      <!-- Predictive Stock -->
      <div class="ai-block reveal">
        <div class="ai-block-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg></div>
        <div class="ai-block-tag ai-block-tag--predict">Predictive Stock</div>
        <h3>Knows what you'll need before you do</h3>
        <p>The AI learns your selling patterns — daily, weekly, seasonal. It predicts when items will run low and suggests restocking days in advance.</p>
        <div class="ai-voice-example">
          <div class="voice-bubble">
            <div class="voice-bubble-avatar voice-bubble-avatar--ai"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg></div>
            <div class="voice-bubble-content">
              <div class="hindi">"Aapka atta 3 din mein khatam ho sakta hai — haftey ki bikri ke hisaab se"</div>
              <div class="translation">Your atta may run out in 3 days — based on weekly sales</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Smart Alerts -->
      <div class="ai-block reveal">
        <div class="ai-block-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg></div>
        <div class="ai-block-tag ai-block-tag--alert">Smart Alerts</div>
        <h3>Alerts that speak your language</h3>
        <p>Expiry warnings, slow-moving stock detection, and price fluctuation alerts — delivered as voice notifications in your preferred language.</p>
        <div class="ai-voice-example">
          <div class="voice-bubble">
            <div class="voice-bubble-avatar voice-bubble-avatar--ai"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg></div>
            <div class="voice-bubble-content">
              <div class="hindi">"Parle-G ke 12 packet 5 din mein expire ho rahe hain — discount lagana chahein?"</div>
              <div class="translation">12 Parle-G packets expiring in 5 days — want to add a discount?</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Voice Analytics -->
      <div class="ai-block reveal">
        <div class="ai-block-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg></div>
        <div class="ai-block-tag ai-block-tag--insight">Voice Analytics</div>
        <h3>Ask your shop a question — it answers</h3>
        <p>Ask anything about your business in natural language. The AI responds with spoken answers and on-screen data.</p>
        <div class="ai-voice-example">
          <div class="voice-bubble">
            <div class="voice-bubble-avatar voice-bubble-avatar--user"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>
            <div class="voice-bubble-content">
              <div class="hindi">"Pichle hafte sabse zyada kya bika?"</div>
              <div class="translation">What sold the most last week?</div>
            </div>
          </div>
          <div class="voice-bubble">
            <div class="voice-bubble-avatar voice-bubble-avatar--ai"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg></div>
            <div class="voice-bubble-content">
              <div class="hindi">"Pichle hafte sabse zyada chawal bika — 48 kilo"</div>
              <div class="translation">Rice sold the most last week — 48 kilos</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Team Intelligence -->
      <div class="ai-block reveal">
        <div class="ai-block-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>
        <div class="ai-block-tag ai-block-tag--team">Team Intelligence</div>
        <h3>Know what your team is doing</h3>
        <p>AI-powered anomaly detection flags unusual inventory changes. Smart summaries show who updated what, and whether corrections were needed.</p>
        <div class="ai-voice-example">
          <div class="voice-bubble">
            <div class="voice-bubble-avatar voice-bubble-avatar--ai"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg></div>
            <div class="voice-bubble-content">
              <div class="hindi">"Aaj shaam 6 baje 15 kilo cheeni ka stock kam hua — verify karein?"</div>
              <div class="translation">15 kg sugar stock decreased at 6 PM today — want to verify?</div>
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
      <p class="section-sub">Samaan-Bol speaks the way you speak — with full support for native scripts, colloquial terms, and regional product names.</p>
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
      <div class="section-label">Why Samaan-Bol</div>
      <h2 class="section-heading">The difference is night and day</h2>
    </div>
    <div class="comparison-grid reveal">
      <div class="comparison-col comparison-col--without">
        <h3>Without Samaan-Bol</h3>
        <p class="comparison-col-subtitle">The old way of managing stock</p>
        <ul class="comparison-list">
          <li><span class="icon">✕</span> Manual counting, pen-and-paper registers</li>
          <li><span class="icon">✕</span> Stockouts discovered when a customer asks</li>
          <li><span class="icon">✕</span> Guessing how much to reorder</li>
          <li><span class="icon">✕</span> No idea what's expiring or slow-moving</li>
          <li><span class="icon">✕</span> Can't track what staff is doing</li>
          <li><span class="icon">✕</span> Festival prep is last-minute chaos</li>
        </ul>
      </div>
      <div class="comparison-col comparison-col--with">
        <h3>With Samaan-Bol</h3>
        <p class="comparison-col-subtitle">AI-powered, voice-first, effortless</p>
        <ul class="comparison-list">
          <li><span class="icon">✓</span> Voice updates — say it and it's done</li>
          <li><span class="icon">✓</span> Predictive alerts days before stockout</li>
          <li><span class="icon">✓</span> AI-generated buy lists based on real data</li>
          <li><span class="icon">✓</span> Expiry and slow-mover detection built in</li>
          <li><span class="icon">✓</span> Full audit trail with anomaly detection</li>
          <li><span class="icon">✓</span> Festival forecasting starts 2 weeks early</li>
        </ul>
      </div>
    </div>
  </div>
</section>

<!-- ═══ TESTIMONIALS ═══ -->
<section class="testimonials">
  <div class="container">
    <div class="reveal">
      <div class="section-label">Early Adopters</div>
      <h2 class="section-heading">Loved by beta testers across India</h2>
    </div>
    <div class="testimonials-grid">
      <div class="testimonial reveal reveal-delay-1">
        <div class="testimonial-stars">★★★★★</div>
        <blockquote>Beta testing mein try kiya — pehle din se register band. Ab bas bol deti hoon aur sab update ho jaata hai. Itna aasan hoga socha nahi tha.</blockquote>
        <div class="testimonial-author">Meena Sharma</div>
        <div class="testimonial-role">Beta Tester · Kirana Store Owner, Jaipur</div>
      </div>
      <div class="testimonial reveal reveal-delay-2">
        <div class="testimonial-stars">★★★★★</div>
        <blockquote>January mein beta join kiya tha — Holi ke liye AI ne already bataya ki kya stock badhana hai. Abhi se itna smart hai, sochiye launch ke baad kya hoga.</blockquote>
        <div class="testimonial-author">Arjun Patel</div>
        <div class="testimonial-role">Beta Tester · General Store, Ahmedabad</div>
      </div>
      <div class="testimonial reveal reveal-delay-3">
        <div class="testimonial-stars">★★★★★</div>
        <blockquote>Bangla mein bolte hi samajh gaya — beta testing-e dekhlam je amar bhasha te kaj kore. Staff ra o khub easily use korte parchhe.</blockquote>
        <div class="testimonial-author">Rina Das</div>
        <div class="testimonial-role">Beta Tester · Textile Shop, Kolkata</div>
      </div>
    </div>
  </div>
</section>

<!-- ═══ CTA ═══ -->
<section class="cta-section" id="download">
  <div class="container">
    <div class="reveal">
      <div class="section-label">Get Started Free</div>
      <h2 class="section-heading">
        <span class="hindi" style="display:block; color:var(--saffron); font-size:clamp(20px,2.4vw,28px); font-weight:500; margin-bottom:8px;">आज ही शुरू करें</span>
        Your shop deserves better than a notebook
      </h2>
      <p class="section-sub">Free to start. Set up in 2 minutes. No credit card needed.</p>
      <div class="cta-actions">
        <a href="https://apps.apple.com/in/app/samaan-bol/id6759739444" class="store-badge">
          <div class="store-badge-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg></div>
          <div class="store-badge-text">
            <div class="store-badge-label">Download on the</div>
            <div class="store-badge-name">App Store</div>
          </div>
        </a>
        <a href="#" class="store-badge" style="position:relative; opacity:0.65; pointer-events:none;">
          <div class="store-badge-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.807 1.626a1 1 0 0 1 0 1.73l-2.808 1.626L15.206 12l2.492-2.491zM5.864 2.658L16.8 8.99l-2.3 2.3-8.636-8.632z"/></svg></div>
          <div class="store-badge-text">
            <div class="store-badge-label">Get it on</div>
            <div class="store-badge-name">Google Play</div>
          </div>
          <span style="position:absolute; top:-10px; right:-10px; background:var(--saffron); color:#fff; font-size:11px; font-weight:700; padding:3px 10px; border-radius:20px; letter-spacing:0.5px; text-transform:uppercase;">Coming Soon</span>
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
        <p>Voice-first AI inventory management, built for the heart of Indian retail.</p>
      </div>
      <div class="footer-col">
        <h4>Product</h4>
        <ul>
          <li><a href="#features">Features</a></li>
          <li><a href="#ai">AI Intelligence</a></li>
          <li><a href="#languages">Languages</a></li>
          <li><a href="#">Pricing</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>Company</h4>
        <ul>
          <li><a href="#">About</a></li>
          <li><a href="#">Blog</a></li>
          <li><a href="#">Careers</a></li>
          <li><a href="#">Contact</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>Support</h4>
        <ul>
          <li><a href="#">Help Center</a></li>
          <li><a href="/privacy-policy">Privacy Policy</a></li>
          <li><a href="/terms-of-service">Terms of Service</a></li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <span>&copy; 2026 Samaan-Bol. All rights reserved.</span>
      <span class="made-in-india">Made with ♥ in India 🇮🇳</span>
    </div>
  </div>
</footer>`;
