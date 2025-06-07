import { cookies } from 'next/headers';
import { createServerSupabaseClient } from '@/lib/supabase';
import { NextResponse, type NextRequest } from 'next/server';

const REDIRECT_URL = '/portal/overview';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const cookieStore = cookies();

  if (!code) {
    return NextResponse.redirect(new URL(REDIRECT_URL, request.url));
  }

  if (code) {
    try {
      const supabase = createServerSupabaseClient(cookieStore);
      await supabase.auth.exchangeCodeForSession(code);
    } catch (error) {
      console.error('Auth callback error:', error);
      // Still redirect to avoid leaving user stranded
      return NextResponse.redirect(new URL(REDIRECT_URL, request.url));
    }
  }

  return NextResponse.redirect(new URL(REDIRECT_URL, request.url));
}
