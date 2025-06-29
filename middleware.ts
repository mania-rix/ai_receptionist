import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

/**
 * Middleware to handle authentication and session management
 */
export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  
  // Check if the request is for a protected route
  const isProtectedRoute = req.nextUrl.pathname.startsWith('/portal');
  const isAuthRoute = req.nextUrl.pathname.startsWith('/auth');
  
  // Refresh session if needed
  const { data: { session } } = await supabase.auth.getSession();
  
  if (isProtectedRoute) {
    // If accessing a protected route without a session, redirect to login
    if (!session) {
      const redirectUrl = new URL('/auth/blvckwall', req.url);
      return NextResponse.redirect(redirectUrl);
    }
  } else if (isAuthRoute && session) {
    // If accessing auth routes with an active session, redirect to portal
    if (req.nextUrl.pathname !== '/auth/callback') {
      const redirectUrl = new URL('/portal/overview', req.url);
      return NextResponse.redirect(redirectUrl);
    }
  }
  
  return res;
}

// Configure which routes use this middleware
export const config = {
  matcher: [
    // Protected routes
    '/portal/:path*',
    // Auth routes (except callback)
    '/auth/:path*',
  ],
};