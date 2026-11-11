'use client';

import { useEffect } from 'react';

export function HomeEffects() {
  useEffect(() => {
    const nav = document.getElementById('nav');
    const scrollProgress = document.getElementById('scrollProgress') as HTMLElement | null;
    const mobileMenuButton = document.querySelector<HTMLButtonElement>('.mobile-menu-btn');

    const onScroll = () => {
      nav?.classList.toggle('scrolled', window.scrollY > 40);
      if (scrollProgress) {
        const max = document.body.scrollHeight - window.innerHeight;
        const pct = max > 0 ? (window.scrollY / max) * 100 : 0;
        scrollProgress.style.width = pct + '%';
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    const onMobileMenu = () => {
      nav?.classList.toggle('nav-open');
      mobileMenuButton?.setAttribute('aria-expanded', String(nav?.classList.contains('nav-open') ?? false));
    };

    const closeMobileMenu = () => {
      nav?.classList.remove('nav-open');
      mobileMenuButton?.setAttribute('aria-expanded', 'false');
    };
    const onNavLink = (event: Event) => {
      if (event.target instanceof Element && event.target.closest('.nav-links a')) closeMobileMenu();
    };

    mobileMenuButton?.setAttribute('aria-expanded', 'false');
    mobileMenuButton?.addEventListener('click', onMobileMenu);
    nav?.addEventListener('click', onNavLink);

    // The marketing preview changes sample views only, never shop data.
    const previewLayoutCleanup: Array<() => void> = [];
    const previewHandlers: Array<[HTMLButtonElement, string, EventListener]> = [];
    document.querySelectorAll<HTMLElement>('[data-shop-preview]').forEach(preview => {
      const tabs = [...preview.querySelectorAll<HTMLButtonElement>('[data-preview-tab]')];
      const selectTab = (selected: HTMLButtonElement) => {
        tabs.forEach(tab => {
          const active = tab === selected;
          tab.setAttribute('aria-selected', String(active));
          tab.tabIndex = active ? 0 : -1;
          const panel = document.getElementById(tab.getAttribute('aria-controls') ?? '');
          if (panel) panel.hidden = !active;
        });
      };
      preview.querySelectorAll<HTMLButtonElement>('[data-preview-select]').forEach(button => {
        const click = () => {
          const selected = tabs.find(tab => tab.dataset.previewTab === button.dataset.previewSelect);
          if (selected) { selectTab(selected); selected.focus(); }
        };
        button.addEventListener('click', click);
        previewHandlers.push([button, 'click', click]);
      });
      const layout = window.matchMedia('(max-width: 700px)');
      const orientTabs = () => preview.querySelector('[role="tablist"]')?.setAttribute('aria-orientation', layout.matches ? 'horizontal' : 'vertical');
      orientTabs();
      layout.addEventListener('change', orientTabs);
      previewLayoutCleanup.push(() => layout.removeEventListener('change', orientTabs));
      tabs.forEach((tab, index) => {
        const click = () => selectTab(tab);
        const keydown: EventListener = event => {
          const key = (event as KeyboardEvent).key;
          const next = (key === 'ArrowRight' || key === 'ArrowDown') ? (index + 1) % tabs.length
            : (key === 'ArrowLeft' || key === 'ArrowUp') ? (index - 1 + tabs.length) % tabs.length
              : key === 'Home' ? 0 : key === 'End' ? tabs.length - 1 : -1;
          if (next < 0) return;
          event.preventDefault();
          selectTab(tabs[next]);
          tabs[next].focus();
        };
        tab.addEventListener('click', click);
        tab.addEventListener('keydown', keydown);
        previewHandlers.push([tab, 'click', click], [tab, 'keydown', keydown]);
      });
    });

    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    const revealEls = document.querySelectorAll('.reveal');
    revealEls.forEach((el) => revealObserver.observe(el));

    const anchorHandlers: Array<[HTMLAnchorElement, EventListener]> = [];
    document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((a) => {
      const handler = (event: Event) => {
        const href = a.getAttribute('href');
        if (!href || href === '#') return;
        const target = href ? document.querySelector(href) : null;
        if (target) {
          event.preventDefault();
          target.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
          closeMobileMenu();
        }
      };
      a.addEventListener('click', handler);
      anchorHandlers.push([a, handler]);
    });

    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const prefersReduced = motionPreference.matches;

    // Decorative voice motion never uses a microphone. Pause when offscreen,
    // when the tab is hidden, or when the reader requests reduced motion.
    const motions = [...document.querySelectorAll<HTMLElement>('[data-voice-motion]')];
    const motionHandlers: Array<[HTMLButtonElement, EventListener]> = [];
    const updateMotion = () => motions.forEach(el => {
      el.dataset.running = String(el.dataset.inView === 'true' && el.dataset.paused !== 'true' && !motionPreference.matches && !document.hidden);
      const button = el.querySelector<HTMLButtonElement>('[data-motion-toggle]');
      if (button) button.hidden = motionPreference.matches;
    });
    motions.forEach(el => {
      const button = el.querySelector<HTMLButtonElement>('[data-motion-toggle]');
      if (!button) return;
      const toggle = () => {
        const paused = el.dataset.paused !== 'true';
        el.dataset.paused = String(paused);
        const label = (paused ? button.dataset.playLabel : button.dataset.pauseLabel) ?? '';
        button.setAttribute('aria-label', label);
        button.title = label;
        updateMotion();
      };
      button.addEventListener('click', toggle);
      motionHandlers.push([button, toggle]);
    });
    const motionObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => { (entry.target as HTMLElement).dataset.inView = String(entry.isIntersecting); });
      updateMotion();
    }, { threshold: .2 });
    motions.forEach(el => motionObserver.observe(el));
    motionPreference.addEventListener('change', updateMotion);
    document.addEventListener('visibilitychange', updateMotion);
    updateMotion();

    // Hero demo: type the spoken sale, add the bill lines, then show it shared.
    // When motion is paused, reduced or off screen, the finished bill shows.
    const demoTimers: number[] = [];
    const demoResets: Array<() => void> = [];
    document.querySelectorAll<HTMLElement>('[data-hero-demo]').forEach(demo => {
      const spoken = demo.querySelector<HTMLElement>('[data-demo-spoken]');
      const status = demo.querySelector<HTMLElement>('[data-demo-status]');
      const total = demo.querySelector<HTMLElement>('[data-demo-total]');
      if (!spoken || !status || !total) return;
      const fullText = spoken.textContent ?? '';
      const statusText = status.textContent ?? '';
      const totalText = total.textContent ?? '';
      const listening = status.dataset.listening ?? statusText;
      const segmenter = typeof Intl !== 'undefined' && 'Segmenter' in Intl ? new Intl.Segmenter(undefined, { granularity: 'grapheme' }) : null;
      const glyphs = segmenter ? [...segmenter.segment(fullText)].map(part => part.segment) : Array.from(fullText);
      const start = Number((totalText.match(/\d[\d,]*/)?.[0] ?? '0').replace(/,/g, ''));
      const rice = 250;
      let tick = 0;
      const finished = () => {
        demo.dataset.demo = 'off';
        demo.removeAttribute('data-stage');
        spoken.textContent = fullText;
        status.textContent = statusText;
        total.textContent = totalText;
      };
      const step = () => {
        if (demo.dataset.running !== 'true') { finished(); tick = 0; return; }
        demo.dataset.demo = 'on';
        const t = tick++ % 84;
        if (t < 26) {
          demo.dataset.stage = '0';
          status.textContent = listening;
          spoken.textContent = glyphs.slice(0, Math.round((t / 22) * glyphs.length)).join('');
          total.textContent = `₹${rice}`;
        } else if (t < 35) {
          demo.dataset.stage = '1';
          status.textContent = statusText;
          spoken.textContent = fullText;
        } else if (t < 50) {
          demo.dataset.stage = '2';
          const progress = Math.min(1, (t - 35) / 7);
          total.textContent = `₹${Math.round(rice + (start - rice) * progress)}`;
        } else {
          demo.dataset.stage = '3';
          total.textContent = totalText;
        }
      };
      demoTimers.push(window.setInterval(step, 100));
      demoResets.push(finished);
    });

    // On a phone, the app is the main action; the browser shop stays one tap away.
    const agent = navigator.userAgent;
    const platform = /iPhone|iPad|iPod/i.test(agent) ? 'ios' : /Android/i.test(agent) ? 'android' : null;
    const ctaResets: Array<() => void> = [];
    if (platform) document.querySelectorAll<HTMLElement>('[data-device-cta]').forEach(group => {
      const primary = group.querySelector<HTMLAnchorElement>('[data-cta-primary]');
      const label = primary?.querySelector<HTMLElement>('[data-cta-label]');
      const storeUrl = group.dataset[platform];
      if (!primary || !label || !storeUrl || !group.dataset.appLabel) return;
      const shopHref = primary.getAttribute('href') ?? '/shop';
      const shopLabel = label.textContent ?? '';
      const shopLink = document.createElement('a');
      shopLink.href = shopHref;
      shopLink.className = 'story-text-link';
      shopLink.textContent = `${shopLabel} ↗`;
      primary.href = storeUrl;
      primary.dataset.storePlacement = 'hero';
      label.textContent = group.dataset.appLabel;
      primary.after(shopLink);
      ctaResets.push(() => {
        primary.href = shopHref;
        delete primary.dataset.storePlacement;
        label.textContent = shopLabel;
        shopLink.remove();
      });
    });

    const rotateWords = document.querySelectorAll('.hero-rotate-word');
    let current = 0;
    const rotateInterval = !prefersReduced && rotateWords.length > 0 ? window.setInterval(() => {
      rotateWords[current]?.classList.remove('active');
      current = (current + 1) % rotateWords.length;
      rotateWords[current]?.classList.add('active');
    }, 2500) : undefined;

    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const target = entry.target as HTMLElement;
          const text = target.textContent ?? '';
          const match = text.match(/^(\d+)/);
          if (match) {
            const num = Number.parseInt(match[1], 10);
            const suffix = text.slice(match[1].length);
            let count = 0;
            const step = Math.max(1, Math.ceil(num / 40));
            const interval = window.setInterval(() => {
              count = Math.min(count + step, num);
              target.textContent = count + suffix;
              if (count >= num) window.clearInterval(interval);
            }, 30);
          }
          counterObserver.unobserve(target);
        }
      });
    }, { threshold: 0.5 });

    document.querySelectorAll('.hero-stat-number').forEach((el) => counterObserver.observe(el));

    document.querySelectorAll('.features-grid, .steps-grid, .testimonials-grid, .ai-blocks').forEach((parent) => {
      const children = parent.querySelectorAll<HTMLElement>('.reveal');
      children.forEach((child, i) => {
        child.style.transitionDelay = (i * 0.1) + 's';
      });
    });

    return () => {
      window.removeEventListener('scroll', onScroll);
      mobileMenuButton?.removeEventListener('click', onMobileMenu);
      nav?.removeEventListener('click', onNavLink);
      previewLayoutCleanup.forEach(cleanup => cleanup());
      previewHandlers.forEach(([button, event, handler]) => button.removeEventListener(event, handler));
      revealObserver.disconnect();
      counterObserver.disconnect();
      motionObserver.disconnect();
      motionHandlers.forEach(([button, handler]) => button.removeEventListener('click', handler));
      motionPreference.removeEventListener('change', updateMotion);
      document.removeEventListener('visibilitychange', updateMotion);
      anchorHandlers.forEach(([a, handler]) => a.removeEventListener('click', handler));
      if (rotateInterval) window.clearInterval(rotateInterval);
      demoTimers.forEach(timer => window.clearInterval(timer));
      demoResets.forEach(reset => reset());
      ctaResets.forEach(reset => reset());
    };
  }, []);

  return null;
}
