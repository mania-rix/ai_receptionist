import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabaseServer } from '@/lib/supabase';
import { createRetellAgent } from "@/lib/retell";

export async function GET() {
  console.log('[API:agents] GET request');
  try {
    let supabase;
    try {
      const cookieStore = cookies();
      supabase = supabaseServer(cookieStore);
    } catch (error) {
      console.warn('[API:agents] Cookie access failed, using demo mode');
      const { createClient } = await import('@supabase/supabase-js');
      supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
    }

    const { data: agents, error } = await supabase
      .from('agents')
      .select(`
        *,
        knowledge_base:knowledge_bases(id, name)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[API:agents] Database error:', error);
      throw error;
    }

    console.log('[API:agents] GET response:', agents?.length || 0);
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
  console.log('[API:agents] Incoming request');
  try {
    const body = await req.json();
    console.log('[API:agents] Incoming payload:', body);

    const retellAgent = await createRetellAgent({
      name: body.name,
      voice: body.voice,
      greeting: body.greeting,
      temperature: body.temperature,
      interruption_sensitivity: body.interruption_sensitivity,
    });

    const cookieStore = cookies();
    const supabase = supabaseServer(cookieStore)

    const { data, error } = await supabase.from("agents").insert([
      {
        name: body.name,
        voice: body.voice,
        greeting: body.greeting,
        temperature: body.temperature,
        interruption_sensitivity: body.interruption_sensitivity,
        retell_agent_id: retellAgent.id,
        retell_llm_id: retellAgent.llm_id ?? null,
        knowledge_base_id: body.knowledge_base_id || null,
        custom_instructions: body.custom_instructions || null,
        voice_engine: body.voice_engine || 'retell',
      },
    ]).select().single();

    if (error) {
      console.error("❌ Supabase insert error:", error.message);
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    console.log('[API:agents] Success response:', data);
    return new Response(JSON.stringify({ agent: data }), { status: 200 });
  } catch (error: any) {
    console.error('[API:agents] Error:', error.message);
    return new Response(JSON.stringify({ error: error.message || "Unknown error" }), { status: 500 });
  }
}