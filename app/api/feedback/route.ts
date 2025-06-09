import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  console.log('[API:feedback] POST request');
  try {
    const { type, title, description, priority } = await req.json();
    console.log('[API:feedback] POST payload:', { type, title, description, priority });
    const cookieStore = cookies();
    const supabase = createServerSupabaseClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();

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

    if (error) throw error;

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
    const cookieStore = cookies();
    const supabase = createServerSupabaseClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('[API:feedback] GET Unauthorized access attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: feedback, error } = await supabase
      .from('feedback_submissions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

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