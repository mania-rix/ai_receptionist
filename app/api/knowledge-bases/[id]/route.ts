import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase'
import { cookies } from 'next/headers';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = cookies();
    const supabase = createServerSupabaseClient(cookieStore);

    const { data, error } = await supabase
      .from('knowledge_bases')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error) throw error;

    return NextResponse.json({ knowledgeBase: data });
  } catch (error) {
    console.error('Error fetching knowledge base:', error);
    return NextResponse.json(
      { error: 'Failed to fetch knowledge base' },
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
    const supabase = supabaseServer(cookieStore)

    const { data, error } = await supabase
      .from('knowledge_bases')
      .update({
        name: body.name,
        description: body.description,
        content: body.content,
        languages: body.languages,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ knowledgeBase: data });
  } catch (error) {
    console.error('Error updating knowledge base:', error);
    return NextResponse.json(
      { error: 'Failed to update knowledge base' },
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
    const supabase = supabaseServer(cookieStore)

    const { error } = await supabase
      .from('knowledge_bases')
      .delete()
      .eq('id', params.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting knowledge base:', error);
    return NextResponse.json(
      { error: 'Failed to delete knowledge base' },
      { status: 500 }
    );
  }
}