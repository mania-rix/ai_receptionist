import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const data = await req.json();

    // Extract relevant fields
    const { name, voice, temperature, interruption_sensitivity, greeting } = data;

    // Make the Retell API request
    const retellRes = await fetch('https://api.retellai.com/v2/agents', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.RETELL_API_KEY?.trim()}`,
      },
      body: JSON.stringify({
        name,
        voice,
        greeting_messages: [greeting],
        temperature,
        interruption_sensitivity,
        llm_id: 'llm_08507d646ed9a0c79da91ef05d67',
      }),
    });

    if (!retellRes.ok) {
      const errorText = await retellRes.text();
      console.error('❌ Retell agent creation failed:', {
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

    // Save to Supabase with all original metadata
    const { data: savedAgent, error } = await supabase
      .from('agents')
      .insert([
        { ...data, retell_agent_id: retellAgent.id },
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
