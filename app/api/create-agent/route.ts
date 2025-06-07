import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const cookieStore = cookies();
    const supabase = createServerSupabaseClient(cookieStore);
    const data = await req.json();

    // ⛔️ AUTH DISABLED TEMPORARILY
    const user = { id: 'demo-user' };

    const { name, voice, temperature, interruption_sensitivity, greeting } = data;

    const retellRes = await fetch('https://api.retellai.com/v1/agents', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.RETELL_API_KEY?.trim()}`,
      },
      body: JSON.stringify({
        name,
        voice_id: voice,
        response_engine: {
          type: 'retell-llm',
          llm_id: 'llm_08507d646ed9a0c79da91ef05d67',
        },
      }),
    });

if (!retellRes.ok) {
  const errorText = await retellRes.text();
  console.error('❌ Retell agent creation failed:', {
    url: 'https://api.retellai.com/v1/agents',
    sentBody: {
      name,
      voice_id: voice,
      response_engine: {
        type: 'retell-llm',
        llm_id: 'llm_08507d646ed9a0c79da91ef05d67',
      },
    },
    status: retellRes.status,
    statusText: retellRes.statusText,
    errorText,
  });

  return NextResponse.json(
    { error: 'Retell agent creation failed', details: errorText },
    { status: retellRes.status }
  );
}


    const retellAgent = await retellRes.json();

    const { data: savedAgent, error } = await supabase
      .from('agents')
      .insert([
        {
          ...data,
          user_id: user.id,
          retell_agent_id: retellAgent.id,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(savedAgent);
  } catch (err: any) {
    console.error('🚨 Error in create-agent:', err);
    return NextResponse.json(
      { error: err.message || 'Unknown error occurred' },
      { status: 500 }
    );
  }
}
