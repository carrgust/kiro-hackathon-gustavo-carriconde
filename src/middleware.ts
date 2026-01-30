import { NextRequest, NextResponse } from 'next/server';

/**
 * Rate limiter — protects API routes from abuse.
 * Uses in-memory sliding window per IP. Resets on deploy/restart.
 *
 * Limits:
 *   - Expensive routes (validate, autocoder, business-plan, PRD): 10 req/min
 *   - All other API routes: 60 req/min
 */

const EXPENSIVE_ROUTES = [
  '/api/validate/normalize',
  '/api/validate/close-gaps',
  '/api/validate/generate-business-plan',
  '/api/validate/generate-prd',
  '/api/autocoder/start',
  '/api/validate',
];

const WINDOW_MS = 60_000; // 1 minute
const EXPENSIVE_LIMIT = 10;
const GENERAL_LIMIT = 60;

// In-memory store: IP -> { timestamps[] }
const store = new Map<string, number[]>();

function getClientIp(req: NextRequest): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || req.headers.get('x-real-ip')
    || 'unknown';
}

function isRateLimited(ip: string, limit: number): boolean {
  const now = Date.now();
  const timestamps = store.get(ip) || [];

  // Remove entries outside the window
  const valid = timestamps.filter(t => now - t < WINDOW_MS);
  valid.push(now);
  store.set(ip, valid);

  // Cleanup old IPs every 1000 requests
  if (store.size > 1000) {
    store.forEach((vals, key) => {
      if (vals.every(t => now - t > WINDOW_MS)) store.delete(key);
    });
  }

  return valid.length > limit;
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Only rate-limit API routes
  if (!pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Skip health check
  if (pathname === '/api/health') {
    return NextResponse.next();
  }

  const ip = getClientIp(req);
  const isExpensive = EXPENSIVE_ROUTES.some(route => pathname.startsWith(route));
  const limit = isExpensive ? EXPENSIVE_LIMIT : GENERAL_LIMIT;

  if (isRateLimited(ip, limit)) {
    console.log(`[RateLimit] ${ip} exceeded ${limit} req/min on ${pathname}`);
    return NextResponse.json(
      { error: 'Too many requests. Please wait a moment.' },
      { status: 429, headers: { 'Retry-After': '60' } }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
