import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const localeCodes = new Set(['hi', 'bn', 'ta', 'te', 'mr', 'kn', 'gu', 'ml', 'pa', 'or']);

export function proxy(request: NextRequest) {
  const segment = request.nextUrl.pathname.split('/')[1] ?? '';
  const locale = localeCodes.has(segment) ? segment : 'en';
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-locale', locale);

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|.*\\..*).*)'],
};
