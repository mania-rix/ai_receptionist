import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create Supabase client on the server (do NOT use browser version here)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Use SERVICE_ROLE_KEY for server-side inserts
);

export async function POST(req: Request) {
  try {
    const data = await req.json();

    // Extract relevant fields
    const {
      agent_name,      // required string
      voice_id,        // required string
      interruption_sensitivity, // optional number
      user_id,         // pass this from frontend or extract from session if needed
      // ...any other fields you want to support
    } = data;

    // Build payload as per Retell API docs
    const payload = {
      agent_name,
      voice_id,
      interruption_sensitivity,
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

    // Save to Supabase with all original metadata (add user_id if required by schema)
    const { data: savedAgent, error } = await supabase
      .from('agents')
      .insert([
        {
          ...data,
          retell_agent_id: retellAgent.agent_id,
          user_id: user_id || null, // add user_id if present
        },
      ])
      .select()
      .single();

    if (error) throw error;

    // Return object with agent property for frontend compatibility
    return NextResponse.json({ agent: savedAgent });
  } catch (err: any) {
    console.error('🚨 Error in create-agent:', err);
    return NextResponse.json(
      { error: err.message || 'Unknown error occurred' },
      { status: 500 }
    );
  }
}
