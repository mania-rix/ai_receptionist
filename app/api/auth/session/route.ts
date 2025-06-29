import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabaseServer } from '@/lib/supabase';

/**
 * API route to check session status
 * GET: Returns current session information
 * POST: Refreshes the session
 */

export async function GET() {
  console.log('[API:auth/session] GET request');
  try {
    const cookieStore = cookies();
    const supabase = supabaseServer(cookieStore);
    
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('[API:auth/session] Error fetching session:', error);
      return NextResponse.json(
        { error: 'Failed to fetch session' },
        { status: 500 }
      );
    }
    
    // Return session data with expiry information
    return NextResponse.json({
      session: data.session,
      expires_at: data.session?.expires_at,
      user: data.session?.user || null
    });
  } catch (error) {
    console.error('[API:auth/session] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST() {
  console.log('[API:auth/session] POST request to refresh session');
  try {
    const cookieStore = cookies();
    const supabase = supabaseServer(cookieStore);
    
    const { data, error } = await supabase.auth.refreshSession();
    
    if (error) {
      console.error('[API:auth/session] Error refreshing session:', error);
      return NextResponse.json(
        { error: 'Failed to refresh session' },
        { status: 401 }
      );
    }
    
    // Return refreshed session data
    return NextResponse.json({
      session: data.session,
      expires_at: data.session?.expires_at,
      user: data.session?.user || null
    });
  } catch (error) {
    console.error('[API:auth/session] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}