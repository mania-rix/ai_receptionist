import { startOutboundCall } from '@/lib/retell';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerSupabaseClient } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const { agent_id, to_number, from_number } = await req.json();
    
    // Start call using Retell REST API
    const result = await startOutboundCall(agent_id, to_number, from_number);
    
    // Log call to Supabase
    const cookieStore = cookies();
    const supabase = createServerSupabaseClient(cookieStore);
    
    const { error } = await supabase.from('calls').insert({
      user_id: 'demo-user', // Replace with real auth
      agent_id: agent_id,
      callee: to_number,
      direction: 'outbound',
      status: 'started',
    });

    if (error) {
      console.error('Failed to log call to database:', error);
      // Don't fail the call if logging fails
    }

    return NextResponse.json(result);
  } catch (err: unknown) {
    let message = 'Call failed';

    if (err instanceof Error) {
      message = err.message;
    } else if (typeof err === 'object' && err !== null && 'message' in err) {
      message = String((err as any).message);
    } else if (typeof err === 'string') {
      message = err;
    }

    console.error('❌ Call error:', err);
    return new NextResponse(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}