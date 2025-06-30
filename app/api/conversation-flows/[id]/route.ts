import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase'
//import { cookies } from 'next/headers';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  console.log('[API:conversation-flows] GET by ID request:', params.id);
  try {
    //const cookieStore = cookies();
    const supabase = supabaseServer()

    const { data, error } = await supabase
      .from('conversation_flows')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error) throw error;

    return NextResponse.json({ flow: data });
  } catch (error) {
    console.error('[API:conversation-flows] GET by ID Error:', error);
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
  console.log('[API:conversation-flows] PATCH request:', params.id);
  try {
    const body = await req.json();
    console.log('[API:conversation-flows] PATCH payload:', body);
    //const cookieStore = cookies();
    const supabase = supabaseServer();

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
    console.error('[API:conversation-flows] PATCH Error:', error);
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
  console.log('[API:conversation-flows] DELETE request:', params.id);
  try {
    //const cookieStore = cookies();
    const supabase = supabaseServer();

    const { error } = await supabase
      .from('conversation_flows')
      .delete()
      .eq('id', params.id);

    if (error) throw error;

    console.log('[API:conversation-flows] DELETE success:', params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API:conversation-flows] DELETE Error:', error);
    return NextResponse.json(
      { error: 'Failed to delete conversation flow' },
      { status: 500 }
    );
  }
}