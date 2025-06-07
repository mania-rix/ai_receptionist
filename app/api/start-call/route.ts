import { startOutboundCall } from '@/lib/retell';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { agent_id, to_number, from_number } = await req.json();

    const result = await startOutboundCall(agent_id, to_number, from_number);
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

    console.error('❌ Full error from Retell:', err);
    return new NextResponse(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
