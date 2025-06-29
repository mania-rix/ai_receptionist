import { NextResponse } from 'next/server';
// import { cookies } from 'next/headers';
// import { supabaseServer } from '@/lib/supabase';
// import { createRetellAgent } from "@/lib/retell";

export async function GET() {
  console.log('[API:agents] GET request');
  try {
    // Demo mode - return mock data
    const agents = [
      {
        id: 'agent_1',
        name: 'Dr. Sarah Johnson',
        voice: 'serena',
        greeting: 'Hello, I\'m Dr. Sarah Johnson. How can I assist you today?',
        temperature: 0.7,
        interruption_sensitivity: 0.5,
        created_at: new Date().toISOString(),
        retell_agent_id: 'agent_d45ccf76ef7145a584ccf7d4e9',
        retell_llm_id: 'llm_08507d646ed9a0c79da91ef05d67',
        knowledge_base: { id: 'kb_1', name: 'Medical Procedures FAQ' }
      },
      {
        id: 'agent_2',
        name: 'Customer Support',
        voice: 'morgan',
        greeting: 'Thank you for calling customer support. How may I help you today?',
        temperature: 0.5,
        interruption_sensitivity: 0.3,
        created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        retell_agent_id: 'agent_e56ddf87fg8256b695ddg8e5fa',
        retell_llm_id: 'llm_19618e757fea1bd8aeb02fg16e78'
      }
    ];

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
    
    // Demo mode - return mock response
    const agent = {
      id: `agent_${Date.now()}`,
      name: body.name,
      voice: body.voice,
      greeting: body.greeting,
      temperature: body.temperature,
      interruption_sensitivity: body.interruption_sensitivity,
      retell_agent_id: `agent_${Math.random().toString(36).substring(2, 15)}`,
      retell_llm_id: `llm_${Math.random().toString(36).substring(2, 15)}`,
      knowledge_base_id: body.knowledge_base_id || null,
      custom_instructions: body.custom_instructions || null,
      voice_engine: body.voice_engine || 'retell',
      created_at: new Date().toISOString()
    };

    console.log('[API:agents] Success response:', agent);
    return new Response(JSON.stringify({ agent }), { status: 200 });
  } catch (error: any) {
    console.error('[API:agents] Error:', error.message);
    return new Response(JSON.stringify({ error: error.message || "Unknown error" }), { status: 500 });
  }
}