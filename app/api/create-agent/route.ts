import { NextResponse } from 'next/server';
import { retell } from '@/lib/retell';
import { cookies } from 'next/headers';
import { createServerSupabaseClient } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const cookieStore = cookies();
    const supabase = createServerSupabaseClient(cookieStore);
    const data = await req.json();

    // For demo purposes - replace with real auth later
    const user = { id: 'demo-user' };

    // Create agent using Retell SDK
    const agent = await retell.agent.create({
      agent_name: data.name,
      voice_id: data.voice,
      initial_message: data.greeting,
      interruption_sensitivity: data.interruption_sensitivity,
      response_engine: {
        type: 'retell-llm',
        llm_id: 'llm_08507d646ed9a0c79da91ef05d67',
      },
    });

    // Save to Supabase
    const { data: savedAgent, error } = await supabase
      .from('agents')
      .insert([
        {
          name: data.name,
          voice: data.voice,
          greeting: data.greeting,
          temperature: data.temperature,
          interruption_sensitivity: data.interruption_sensitivity,
          user_id: user.id,
          retell_agent_id: agent.agent_id,
          retell_llm_id: 'llm_08507d646ed9a0c79da91ef05d67',
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(savedAgent);
  } catch (err: any) {
    console.error('🚨 Agent creation error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to create agent' }, 
      { status: 500 }
    );
  }
}