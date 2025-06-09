import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = cookies();
    const supabase = createServerSupabaseClient(cookieStore);

    const { data: flows, error } = await supabase
      .from('conversation_flows')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ flows });
  } catch (error) {
    console.error('Error fetching conversation flows:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversation flows' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const cookieStore = cookies();
    const supabase = createServerSupabaseClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('conversation_flows')
      .insert([
        {
          user_id: user.id,
          name: body.name,
          description: body.description,
          flow_data: body.flow_data || {},
          is_active: body.is_active ?? true,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ flow: data });
  } catch (error) {
    console.error('Error creating conversation flow:', error);
    return NextResponse.json(
      { error: 'Failed to create conversation flow' },
      { status: 500 }
    );
  }
}