import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const data = await req.json();

    // Extract relevant fields
    const {
      agent_name,      // required string
      voice_id,        // required string
      interruption_sensitivity, // optional number
      // ...any other fields you want to support
    } = data;

    // Build payload as per API docs
    const payload = {
      agent_name,
      voice_id,
      interruption_sensitivity, // can include or omit if not needed
      response_engine: {
        type: 'retell-llm',
        llm_id: 'llm_08507d646ed9a0c79da91ef05d67'
      }
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
        { ...data, retell_agent_id: retellAgent.agent_id }, // Use correct field
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
