import { NextResponse } from 'next/server';
import { startOutboundCall } from '@/lib/retell';

export async function POST(req: Request) {
  try {
    const { agent_id, phone_number } = await req.json();
    const result = await startOutboundCall(agent_id, phone_number);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to start call:', error);
    return NextResponse.json({ error: 'Call failed' }, { status: 500 });
  }
}