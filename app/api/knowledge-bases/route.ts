import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase'
import { cookies } from 'next/headers';

export async function GET() {
  try {
    let supabase;
    try {
      const cookieStore = cookies();
      supabase = supabaseServer(cookieStore);
    } catch (error) {
      console.warn('[API:knowledge-bases] Cookie access failed, using demo mode');
      const { createClient } = await import('@supabase/supabase-js');
      supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
    }

    const { data: knowledgeBases, error } = await supabase
      .from('knowledge_bases')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ knowledgeBases });
  } catch (error) {
    console.error('Error fetching knowledge bases:', error);
    return NextResponse.json(
      { error: 'Failed to fetch knowledge bases' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    let supabase;
    let user;
    
    try {
      const cookieStore = cookies();
      supabase = supabaseServer(cookieStore);
      const { data: { user: authUser } } = await supabase.auth.getUser();
      user = authUser;
    } catch (error) {
      console.warn('[API:knowledge-bases] Cookie access failed, using demo mode');
      const { createClient } = await import('@supabase/supabase-js');
      supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      user = { id: 'demo-user-id', email: 'demo@blvckwall.ai' };
    }

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('knowledge_bases')
      .insert([
        {
          user_id: user.id,
          name: body.name,
          description: body.description,
          content: body.content || {},
          languages: body.languages || ['en'],
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ knowledgeBase: data });
  } catch (error) {
    console.error('Error creating knowledge base:', error);
    return NextResponse.json(
      { error: 'Failed to create knowledge base' },
      { status: 500 }
    );
  }
}