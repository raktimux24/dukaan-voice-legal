import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Samaan Bol',
    short_name: 'Samaan Bol',
    description: 'Voice POS for Indian kirana counters. Speak the sale. Cash, UPI QR, udhaar.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0A0A0F',
    theme_color: '#FF6B00',
    categories: ['business', 'productivity'],
    lang: 'en-IN',
  };
}
