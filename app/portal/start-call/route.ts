// app/api/start-call/route.ts
import { startOutboundCall } from '@/lib/retell'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { agent_id, phone } = await req.json()
    const result = await startOutboundCall(agent_id, phone)
    return NextResponse.json(result)
  } catch (err) {
    console.error('Failed to start call:', err)
    return NextResponse.json({ error: 'Call failed' }, { status: 500 })
  }
}
