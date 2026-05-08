import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Samaan-Bol',
    short_name: 'Samaan-Bol',
    description: 'Voice-first AI inventory app for Indian kirana and retail shops.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0A0A0F',
    theme_color: '#FF6B00',
    categories: ['business', 'productivity'],
    lang: 'en-IN',
  };
}
