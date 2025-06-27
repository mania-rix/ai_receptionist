import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase'
import { cookies } from 'next/headers';

export async function GET() {
  console.log('[API:agents] GET request');
  try {
    const cookieStore = cookies();
    const supabase = supabaseServer(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('[API:agents] GET Unauthorized access attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: agents, error } = await supabase
      .from('agents')
      .select(`
        *,
        knowledge_base:knowledge_bases(name)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    console.log('[API:agents] GET response:', agents);
    return NextResponse.json({ agents });
  } catch (error) {
    console.error('[API:agents] GET Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch agents' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  console.log('[API:agents] POST request');
  try {
    const body = await req.json();
    console.log('[API:agents] POST payload:', body);
    const cookieStore = cookies();
    const supabase = supabaseServer(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('[API:agents] POST Unauthorized access attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('agents')
      .insert([
        {
          user_id: user.id,
          name: body.name,
          voice_engine: body.voice_engine,
          voice: body.voice,
          greeting: body.greeting,
          temperature: body.temperature,
          interruption_sensitivity: body.interruption_sensitivity,
          knowledge_base_id: body.knowledge_base_id,
          custom_instructions: body.custom_instructions,
          retell_agent_id: 'agent_d45ccf76ef7145a584ccf7d4e9',
          retell_llm_id: 'llm_08507d646ed9a0c79da91ef05d67',
        },
      ])
      .select()
      .single();

    if (error) throw error;

    console.log('[API:agents] POST response:', data);
    return NextResponse.json({ agent: data });
  } catch (error) {
    console.error('[API:agents] POST Error:', error);
    return NextResponse.json(
      { error: 'Failed to create agent' },
      { status: 500 }
    );
  }
}