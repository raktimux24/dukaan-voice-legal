'use client';

import { useEffect } from 'react';

export function LegalEffects() {
  useEffect(() => {
    const progress = document.getElementById('readingProgress') as HTMLElement | null;
    const backToTop = document.getElementById('backToTop');

    const onScroll = () => {
      const max = document.body.scrollHeight - window.innerHeight;
      const pct = max > 0 ? (window.scrollY / max) * 100 : 0;
      if (progress) progress.style.width = pct + '%';
      backToTop?.classList.toggle('visible', window.scrollY > 300);
    };

    const onBackToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });
    const openLinkedSection = () => {
      const id = window.location.hash.slice(1);
      const section = id ? document.getElementById(id) : null;
      if (section instanceof HTMLDetailsElement) {
        section.open = true;
        section.scrollIntoView({ block: 'start' });
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('hashchange', openLinkedSection);
    backToTop?.addEventListener('click', onBackToTop);
    onScroll();
    openLinkedSection();

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('hashchange', openLinkedSection);
      backToTop?.removeEventListener('click', onBackToTop);
    };
  }, []);

  return null;
}
