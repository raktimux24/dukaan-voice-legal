'use client';

import { useEffect } from 'react';
import { ThreeBackground } from './ThreeBackground';

export function HomeEffects() {
  useEffect(() => {
    const nav = document.getElementById('nav');
    const scrollProgress = document.getElementById('scrollProgress') as HTMLElement | null;

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
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      };
      a.addEventListener('click', handler);
      anchorHandlers.push([a, handler]);
    });

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!prefersReduced) {
      document.querySelectorAll('.hero-text-reveal .hero-text-main').forEach((el) => {
        if (el.getAttribute('data-revealed') === 'true') return;
        el.setAttribute('data-revealed', 'true');
        const nodes = Array.from(el.childNodes);
        while (el.firstChild) el.removeChild(el.firstChild);
        let wordIndex = 0;
        nodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE && (node as HTMLElement).tagName === 'BR') {
            el.appendChild(document.createElement('br'));
          } else if (node.nodeType === Node.TEXT_NODE) {
            const parts = node.textContent?.split(/(\s+)/) ?? [];
            parts.forEach((part) => {
              if (part.trim() === '') {
                el.appendChild(document.createTextNode(part));
              } else {
                const span = document.createElement('span');
                span.textContent = part;
                span.style.animationDelay = (wordIndex++ * 0.08) + 's';
                el.appendChild(span);
              }
            });
          }
        });
      });
    }

    const rotateWords = document.querySelectorAll('.hero-rotate-word');
    let current = 0;
    const rotateInterval = rotateWords.length > 0 ? window.setInterval(() => {
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
      revealObserver.disconnect();
      counterObserver.disconnect();
      anchorHandlers.forEach(([a, handler]) => a.removeEventListener('click', handler));
      if (rotateInterval) window.clearInterval(rotateInterval);
    };
  }, []);

  return <ThreeBackground />;
}
