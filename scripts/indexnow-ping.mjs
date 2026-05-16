#!/usr/bin/env node
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://samaanbol.space';
const key = process.env.INDEXNOW_KEY;

if (!key) {
  console.error('INDEXNOW_KEY env var is required');
  process.exit(1);
}

const host = new URL(siteUrl).host;

async function fetchSitemapUrls() {
  const res = await fetch(`${siteUrl}/sitemap.xml`);
  if (!res.ok) throw new Error(`Failed to fetch sitemap: ${res.status}`);
  const xml = await res.text();
  return Array.from(xml.matchAll(/<loc>([^<]+)<\/loc>/g)).map((m) => m[1]);
}

async function ping(urlList) {
  const body = {
    host,
    key,
    keyLocation: `${siteUrl}/${key}.txt`,
    urlList,
  };
  const res = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(body),
  });
  console.log(`IndexNow responded: ${res.status} ${res.statusText}`);
  if (!res.ok) {
    console.error(await res.text());
    process.exit(1);
  }
}

const urls = await fetchSitemapUrls();
console.log(`Submitting ${urls.length} URLs to IndexNow for host ${host}`);
await ping(urls);
