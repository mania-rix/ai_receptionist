import { NextResponse, type NextRequest } from 'next/server';

const REDIRECT_URL = '/portal/overview';

export async function GET(request: NextRequest) {
  console.log('[API:auth/callback] GET request (demo mode)');
  // In demo mode, we just redirect to the portal
  return NextResponse.redirect(new URL(REDIRECT_URL, request.url));
}