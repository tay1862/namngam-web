// @ts-ignore
import createMiddleware from 'next-intl/middleware';
// @ts-ignore
import { NextRequest, NextResponse } from 'next/server';
// @ts-ignore
import { getToken } from 'next-auth/jwt';
import { locales, defaultLocale } from './i18n';
import { rateLimit, getClientIP, SECURITY_CONFIG, validateEnvironmentVariables } from './lib/security';
import { logError } from './lib/error-handler';

// Validate environment variables on startup
const envValidation = validateEnvironmentVariables();
if (!envValidation.valid) {
  console.error('Environment validation failed:', envValidation.errors);
  // In production, you might want to exit the process
  // @ts-ignore
  if (process?.env?.NODE_ENV === 'production') {
    throw new Error('Invalid environment configuration');
  }
}

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'as-needed',
});

// Rate limiting for API routes
const apiRateLimit = new Map<string, { count: number; resetTime: number }>();

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const clientIP = getClientIP(request);

  // Security headers
  const response = NextResponse.next();
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  // Skip i18n for admin, api, and static files
  if (
    pathname.startsWith('/admin') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/uploads')
  ) {
    // Rate limiting for API routes (except public settings)
    if (pathname.startsWith('/api') && !pathname.startsWith('/api/public/settings')) {
      const rateLimitKey = `api:${clientIP}`;
      const now = Date.now();
      const windowStart = now - SECURITY_CONFIG.RATE_LIMIT_WINDOW;
      
      // Clean up old entries
      for (const [key, value] of apiRateLimit.entries()) {
        if (value.resetTime < now) {
          apiRateLimit.delete(key);
        }
      }
      
      // Check current rate limit
      const current = apiRateLimit.get(rateLimitKey);
      
      if (!current) {
        apiRateLimit.set(rateLimitKey, { count: 1, resetTime: now + SECURITY_CONFIG.RATE_LIMIT_WINDOW });
      } else {
        if (current.count >= SECURITY_CONFIG.RATE_LIMIT_MAX_REQUESTS) {
          return new NextResponse(
            JSON.stringify({ success: false, error: 'Rate limit exceeded' }),
            {
              status: 429,
              headers: { 'Content-Type': 'application/json' }
            }
          );
        }
        current.count++;
      }
    }

    // Check auth for admin routes (except login)
    if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
      const token = await getToken({
        req: request,
        // @ts-ignore
        secret: process.env.NEXTAUTH_SECRET,
      });

      if (!token) {
        const url = new URL('/admin/login', request.url);
        url.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(url);
      }

      // Check if session is still valid (not expired)
      if (token.exp && typeof token.exp === 'number' && token.exp < Date.now() / 1000) {
        const url = new URL('/admin/login', request.url);
        url.searchParams.set('callbackUrl', pathname);
        url.searchParams.set('error', 'session_expired');
        return NextResponse.redirect(url);
      }
    }
    
    return response;
  }

  // Handle public routes with i18n
  const intlResponse = intlMiddleware(request);
  
  // Add security headers to public routes as well
  Object.entries(response.headers).forEach(([key, value]) => {
    intlResponse.headers.set(key, value);
  });
  
  return intlResponse;
}

export const config = {
  matcher: ['/((?!_next|_vercel|.*\\..*).*)'],
};
