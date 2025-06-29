import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase'
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  console.log('[API:feedback] POST request');
  try {
    const { type, title, description, priority } = await req.json();
    console.log('[API:feedback] POST payload:', { type, title, description, priority });
    
    let supabase;
    let user;
    
    try {
      const cookieStore = cookies();
      supabase = supabaseServer(cookieStore);
      const { data: { user: authUser } } = await supabase.auth.getUser();
      user = authUser;
    } catch (error) {
      console.warn('[API:feedback] Cookie access failed, using demo mode');
      //const { createClient } = await import('@supabase/supabase-js');
      supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      user = { id: 'demo-user-id', email: 'demo@blvckwall.ai' };
    }


    const { data, error } = await supabase
      .from('feedback_submissions')
      .insert([{
        user_id: user?.id || null,
        type,
        title,
        description,
        priority: priority || 'medium',
      }])
      .select()
      .single();

    if (error) {
      console.warn('[API:feedback] Database error, returning mock data:', error);
      const mockFeedback = {
        id: `feedback_${Date.now()}`,
        user_id: user?.id || null,
        type,
        title,
        description,
        priority: priority || 'medium',
        created_at: new Date().toISOString()
      };
      return NextResponse.json({ feedback: mockFeedback });
    }

    console.log('[API:feedback] POST response:', data);
    return NextResponse.json({ feedback: data });
  } catch (error) {
    console.error('[API:feedback] POST Error:', error);
    return NextResponse.json(
      { error: 'Failed to submit feedback' },
      { status: 500 }
    );
  }
}

export async function GET() {
  console.log('[API:feedback] GET request');
  try {
    let supabase;
    let user;
    
    try {
      const cookieStore = cookies();
      supabase = supabaseServer(cookieStore);
      const { data: { user: authUser } } = await supabase.auth.getUser();
      user = authUser;
    } catch (error) {
      console.warn('[API:feedback] Cookie access failed, using demo mode');
      //const { createClient } = await import('@supabase/supabase-js');
      supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      user = { id: 'demo-user-id', email: 'demo@blvckwall.ai' };
    }

    if (!user) {
      console.error('[API:feedback] GET Unauthorized access attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: feedback, error } = await supabase
      .from('feedback_submissions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('[API:feedback] Database error, returning mock data:', error);
      const mockFeedback = [
        {
          id: 'feedback_1',
          user_id: user.id,
          type: 'feature_request',
          title: 'Add voice cloning feature',
          description: 'Would love to see voice cloning capabilities',
          priority: 'medium',
          created_at: new Date().toISOString()
        }
      ];
      return NextResponse.json({ feedback: mockFeedback });
    }

    console.log('[API:feedback] GET response:', feedback);
    return NextResponse.json({ feedback });
  } catch (error) {
    console.error('[API:feedback] GET Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch feedback' },
      { status: 500 }
    );
  }
}