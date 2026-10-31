import { createHash, timingSafeEqual } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';

// A single shared password protects this temporary demo and its billable API.
// It is not a substitute for individual accounts in a production service.
export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === '/api/health') return NextResponse.next();
  const password = process.env.EUNISTUD_DEMO_PASSWORD;
  if (!password) {
    return process.env.EUNISTUD_PUBLIC_DEMO === '1'
      ? new NextResponse('Demo access has not been configured.', { status: 503 })
      : NextResponse.next();
  }
  const authorization = request.headers.get('authorization') || '';
  let supplied = '';
  if (authorization.startsWith('Basic ')) {
    try { supplied = Buffer.from(authorization.slice(6), 'base64').toString('utf8'); } catch { /* invalid credentials */ }
  }
  const expected = `demo:${password}`;
  const digest = (value: string) => createHash('sha256').update(value).digest();
  if (timingSafeEqual(digest(supplied), digest(expected))) return NextResponse.next();
  return new NextResponse('Authentication required.', { status: 401, headers: {
    'WWW-Authenticate': 'Basic realm="EUnistud Demo", charset="UTF-8"',
    'Cache-Control': 'no-store',
  } });
}
