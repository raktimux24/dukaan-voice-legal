import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Production Clerk keys only accept samaanbol.space and its subdomains.
  // Local dev is served at https://local.samaanbol.space
  allowedDevOrigins: ['local.samaanbol.space'],
  turbopack: {
    root: __dirname,
  },
  async redirects() {
    return [
      { source: '/index.html', destination: '/', permanent: true },
      { source: '/privacy-policy.html', destination: '/privacy-policy', permanent: true },
      { source: '/terms-of-service.html', destination: '/terms-of-service', permanent: true },
    ];
  },
};

export default nextConfig;
