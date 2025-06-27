import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase'
import { cookies } from 'next/headers';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  console.log('[API:agents] GET by ID request:', params.id);
  try {
    const cookieStore = cookies();
    const supabase = supabaseServer(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('[API:agents] GET by ID Unauthorized access attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('agents')
      .select(`
        *,
        knowledge_base:knowledge_bases(name)
      `)
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single();

    if (error) throw error;

    return NextResponse.json({ agent: data });
  } catch (error) {
    console.error('[API:agents] GET by ID Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch agent' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  console.log('[API:agents] PATCH request:', params.id);
  try {
    const body = await req.json();
    console.log('[API:agents] PATCH payload:', body);
    const cookieStore = cookies();
    const supabase = supabaseServer(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('[API:agents] PATCH Unauthorized access attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('agents')
      .update({
        name: body.name,
        voice_engine: body.voice_engine,
        voice: body.voice,
        greeting: body.greeting,
        temperature: body.temperature,
        interruption_sensitivity: body.interruption_sensitivity,
        knowledge_base_id: body.knowledge_base_id,
        custom_instructions: body.custom_instructions,
      })
      .eq('id', params.id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;

    console.log('[API:agents] PATCH response:', data);
    return NextResponse.json({ agent: data });
  } catch (error) {
    console.error('[API:agents] PATCH Error:', error);
    return NextResponse.json(
      { error: 'Failed to update agent' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  console.log('[API:agents] DELETE request:', params.id);
  try {
    const cookieStore = cookies();
    const supabase = supabaseServer(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('[API:agents] DELETE Unauthorized access attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { error } = await supabase
      .from('agents')
      .delete()
      .eq('id', params.id)
      .eq('user_id', user.id);

    if (error) throw error;

    console.log('[API:agents] DELETE success:', params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API:agents] DELETE Error:', error);
    return NextResponse.json(
      { error: 'Failed to delete agent' },
      { status: 500 }
    );
  }
}