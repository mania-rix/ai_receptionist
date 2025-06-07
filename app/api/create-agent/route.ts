import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerSupabaseClient } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    // Get user session
    const cookieStore = cookies();
    const supabase = createServerSupabaseClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();

    // Get input data from request
    const { name, voice, greeting, temperature, interruption_sensitivity } = await req.json();

    // Build payload as per Retell API docs
    const payload: any = {
      agent_name: name,
      voice_id: voice,
      interruption_sensitivity,
      // Only include optional fields if present
      ...(greeting ? { greeting_messages: [greeting] } : {}),
      ...(temperature ? { temperature } : {}),
      response_engine: {
        type: 'retell-llm',
        llm_id: 'llm_08507d646ed9a0c79da91ef05d67',
      },
    };

    // Make the Retell API request
    const retellRes = await fetch('https://api.retellai.com/create-agent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.RETELL_API_KEY?.trim()}`,
      },
      body: JSON.stringify(payload),
    });

    if (!retellRes.ok) {
      const errorText = await retellRes.text();
      console.error('❌ Retell agent creation failed:', {
        status: retellRes.status,
        statusText: retellRes.statusText,
        errorText,
        requestBody: payload,
      });
      return NextResponse.json(
        { error: 'Retell agent creation failed', details: errorText, requestBody: payload },
        { status: retellRes.status }
      );
    }

    const retellAgent = await retellRes.json();

    // Save to Supabase (add user_id for tracking)
    const { data: savedAgent, error } = await supabase
      .from('agents')
      .insert([{
        name,
        voice,
        greeting,
        temperature,
        interruption_sensitivity,
        retell_agent_id: retellAgent.agent_id,
        user_id: user?.id,
      }])
      .select()
      .single();

    if (error) throw error;

    // Return shape: { agent: savedAgent }
    return NextResponse.json({ agent: savedAgent });
  } catch (err: any) {
    console.error('🚨 Error in create-agent:', err);
    return NextResponse.json(
      { error: err.message || 'Unknown error occurred' },
      { status: 500 }
    );
  }
}
