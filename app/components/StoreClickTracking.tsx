'use client';

import { useEffect } from 'react';

/** Delegation covers both React links and the server-rendered translated HTML. */
export function StoreClickTracking() {
  useEffect(() => {
    const track = (event: MouseEvent) => {
      if (event.type === 'auxclick' && event.button !== 1) return;
      const target = event.target;
      const link = target instanceof Element ? target.closest<HTMLAnchorElement>('a[href]') : null;
      if (!link) return;
      const url = new URL(link.href, window.location.origin);
      const store = url.hostname === 'apps.apple.com' && url.pathname.endsWith('/id6759739444')
        ? 'app_store'
        : url.hostname === 'play.google.com' && url.searchParams.get('id') === 'com.samaan.bol'
          ? 'google_play' : null;
      if (!store) return;
      const placement = link.dataset.storePlacement || (link.closest('.hero') ? 'hero'
        : link.closest('footer') ? 'footer' : link.closest('#download') ? 'download_section' : 'content');
      const analyticsWindow = window as Window & { dataLayer?: unknown[] };
      analyticsWindow.dataLayer = analyticsWindow.dataLayer || [];
      // The gtag queue accepts arguments objects, even before the library loads.
      function enqueue(...args: unknown[]) { analyticsWindow.dataLayer!.push(arguments); }
      enqueue('event', 'app_store_click', {
        store,
        placement,
        page_path: window.location.pathname,
        // GA4 language describes the visitor browser/device, not this page.
        site_language: document.documentElement.lang,
        transport_type: 'beacon',
      });
      // Never block the store visit, including when analytics is unavailable.
    };
    document.addEventListener('click', track);
    document.addEventListener('auxclick', track);
    return () => {
      document.removeEventListener('click', track);
      document.removeEventListener('auxclick', track);
    };
  }, []);
  return null;
}
