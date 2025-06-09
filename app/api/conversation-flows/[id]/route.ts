import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { cookies } from 'next/headers';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = cookies();
    const supabase = createServerSupabaseClient(cookieStore);

    const { data, error } = await supabase
      .from('conversation_flows')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error) throw error;

    return NextResponse.json({ flow: data });
  } catch (error) {
    console.error('Error fetching conversation flow:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversation flow' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const cookieStore = cookies();
    const supabase = createServerSupabaseClient(cookieStore);

    const { data, error } = await supabase
      .from('conversation_flows')
      .update({
        name: body.name,
        description: body.description,
        flow_data: body.flow_data,
        is_active: body.is_active,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ flow: data });
  } catch (error) {
    console.error('Error updating conversation flow:', error);
    return NextResponse.json(
      { error: 'Failed to update conversation flow' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = cookies();
    const supabase = createServerSupabaseClient(cookieStore);

    const { error } = await supabase
      .from('conversation_flows')
      .delete()
      .eq('id', params.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting conversation flow:', error);
    return NextResponse.json(
      { error: 'Failed to delete conversation flow' },
      { status: 500 }
    );
  }
}