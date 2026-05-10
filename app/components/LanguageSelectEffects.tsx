'use client';

import { useEffect } from 'react';

export function LanguageSelectEffects() {
  useEffect(() => {
    const controls = document.querySelectorAll<HTMLSelectElement>('[data-language-select]');
    const handlers: Array<[HTMLSelectElement, EventListener]> = [];
    const switchers = document.querySelectorAll<HTMLElement>('[data-language-switcher]');
    const buttonHandlers: Array<[HTMLButtonElement, EventListener]> = [];
    const linkHandlers: Array<[HTMLAnchorElement, EventListener]> = [];

    const closeAll = () => {
      switchers.forEach((switcher) => {
        switcher.classList.remove('is-open');
        switcher.querySelector<HTMLButtonElement>('[data-language-button]')?.setAttribute('aria-expanded', 'false');
      });
    };

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

    switchers.forEach((switcher) => {
      const button = switcher.querySelector<HTMLButtonElement>('[data-language-button]');
      const links = switcher.querySelectorAll<HTMLAnchorElement>('.language-option');

      if (button) {
        const handler = (event: Event) => {
          event.stopPropagation();
          const isOpen = switcher.classList.contains('is-open');
          closeAll();
          if (!isOpen) {
            switcher.classList.add('is-open');
            button.setAttribute('aria-expanded', 'true');
          }
        };

        button.addEventListener('click', handler);
        buttonHandlers.push([button, handler]);
      }

      links.forEach((link) => {
        const handler = () => closeAll();
        link.addEventListener('click', handler);
        linkHandlers.push([link, handler]);
      });
    });

    const onDocumentClick = () => closeAll();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeAll();
    };

    document.addEventListener('click', onDocumentClick);
    document.addEventListener('keydown', onKeyDown);

    return () => {
      handlers.forEach(([control, handler]) => control.removeEventListener('change', handler));
      buttonHandlers.forEach(([button, handler]) => button.removeEventListener('click', handler));
      linkHandlers.forEach(([link, handler]) => link.removeEventListener('click', handler));
      document.removeEventListener('click', onDocumentClick);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  return null;
}
