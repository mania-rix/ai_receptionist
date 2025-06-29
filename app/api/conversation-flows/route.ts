import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase'
import { cookies } from 'next/headers';

export async function GET() {
  console.log('[API:conversation-flows] GET request');
  try {
    let supabase;
    try {
      const cookieStore = cookies();
      supabase = supabaseServer(cookieStore);
    } catch (error) {
      console.warn('[API:conversation-flows] Cookie access failed, using demo mode');
      // For demo mode, create a mock supabase client
      //const { createClient } = await import('@supabase/supabase-js');
     // supabase = createClient(
      //  process.env.NEXT_PUBLIC_SUPABASE_URL!,
      //  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
     // );
   // }

    const { data: flows, error } = await supabase
      .from('conversation_flows')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    console.log('[API:conversation-flows] GET response:', flows);
    return NextResponse.json({ flows });
  } catch (error) {
    console.error('[API:conversation-flows] GET Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversation flows' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  console.log('[API:conversation-flows] POST request');
  try {
    const body = await req.json();
    console.log('[API:conversation-flows] POST payload:', body);
    
    let supabase;
    let user;
    
    try {
      const cookieStore = cookies();
      supabase = supabaseServer(cookieStore);
      const { data: { user: authUser } } = await supabase.auth.getUser();
      user = authUser;
    } catch (error) {
      console.warn('[API:conversation-flows] Cookie access failed, using demo mode');
      // For demo mode, create a mock supabase client and user
      //const { createClient } = await import('@supabase/supabase-js');
     // supabase = createClient(
      //  process.env.NEXT_PUBLIC_SUPABASE_URL!,
       // process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    //  );
     // user = { id: 'demo-user-id', email: 'demo@blvckwall.ai' };
    //}

    if (!user) {
      console.error('[API:conversation-flows] POST Unauthorized access attempt');
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

    console.log('[API:conversation-flows] POST response:', data);
    return NextResponse.json({ flow: data });
  } catch (error) {
    console.error('[API:conversation-flows] POST Error:', error);
    return NextResponse.json(
      { error: 'Failed to create conversation flow' },
      { status: 500 }
    );
  }
}