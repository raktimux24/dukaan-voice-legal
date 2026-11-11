import { appStoreUrl, playStoreUrl } from '../seo';

// The homepage QR code points here, so one code serves both phone platforms.
export function GET(request: Request) {
  const agent = request.headers.get('user-agent') ?? '';
  const target = /iPhone|iPad|iPod/i.test(agent) ? appStoreUrl
    : /Android/i.test(agent) ? playStoreUrl
      : new URL('/#download', request.url).toString();
  return Response.redirect(target, 302);
}
