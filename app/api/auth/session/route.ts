import { NextResponse } from 'next/server';

/**
 * API route to check session status
 * GET: Returns current session information
 * POST: Refreshes the session
 */

export async function GET() {
  console.log('[API:auth/session] GET request (demo mode)');
  
  // In demo mode, we check sessionStorage on the client side
  // This endpoint just returns a mock response
  return NextResponse.json({
    session: null,
    expires_at: null,
    user: null
  });
}

export async function POST() {
  console.log('[API:auth/session] POST request to refresh session (demo mode)');
  
  // In demo mode, we handle session refresh on the client side
  // This endpoint just returns a mock response
  return NextResponse.json({
    session: null,
    expires_at: null,
    user: null
  });
}