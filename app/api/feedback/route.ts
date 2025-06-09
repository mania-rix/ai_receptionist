import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const { type, title, description, priority } = await req.json();
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

    return NextResponse.json({ feedback: data });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    return NextResponse.json(
      { error: 'Failed to submit feedback' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const cookieStore = cookies();
    const supabase = createServerSupabaseClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: feedback, error } = await supabase
      .from('feedback_submissions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ feedback });
  } catch (error) {
    console.error('Error fetching feedback:', error);
    return NextResponse.json(
      { error: 'Failed to fetch feedback' },
      { status: 500 }
    );
  }
}