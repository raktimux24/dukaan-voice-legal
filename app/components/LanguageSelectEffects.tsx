'use client';

import { useEffect } from 'react';

export function LanguageSelectEffects() {
  useEffect(() => {
    const controls = document.querySelectorAll<HTMLSelectElement>('[data-language-select]');
    const handlers: Array<[HTMLSelectElement, EventListener]> = [];

    controls.forEach((control) => {
      const handler = () => {
        const nextPath = control.value;
        if (nextPath && nextPath !== window.location.pathname) {
          window.location.href = nextPath + window.location.hash;
        }
      };

      control.addEventListener('change', handler);
      handlers.push([control, handler]);
    });

    return () => {
      handlers.forEach(([control, handler]) => control.removeEventListener('change', handler));
    };
  }, []);

  return null;
}
