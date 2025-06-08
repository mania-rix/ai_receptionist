import { startOutboundCall } from '@/lib/retell';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
      const { agent_id, to_number, from_number } = await req.json();
      const result = await startOutboundCall(agent_id, to_number, from_number);
    return NextResponse.json(result);
  } catch (err: any) {
    console.error('❌ Failed to start call:', err);

    // Properly extract the real message
    const message =
      typeof err === 'string'
        ? err
        : err?.message || JSON.stringify(err) || 'Unknown error';

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
