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

    window.addEventListener('scroll', onScroll, { passive: true });
    backToTop?.addEventListener('click', onBackToTop);
    onScroll();

    return () => {
      window.removeEventListener('scroll', onScroll);
      backToTop?.removeEventListener('click', onBackToTop);
    };
  }, []);

  return null;
}
