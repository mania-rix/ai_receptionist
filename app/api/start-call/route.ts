import { NextResponse } from 'next/server';
import { startOutboundCall } from '@/lib/retell';

export async function POST(req: Request) {
  console.log('[API:start-call] POST request');
  try {
    const { agent_id, phone_number } = await req.json();
    console.log('[API:start-call] POST payload:', { agent_id, phone_number });
    const result = await startOutboundCall(agent_id, phone_number);
    console.log('[API:start-call] POST response:', result);
    return NextResponse.json(result);
  } catch (error) {
    console.error('[API:start-call] POST Error:', error);
    return NextResponse.json({ error: 'Call failed' }, { status: 500 });
  }
}