import { Retell } from 'retell-sdk';

// Initialize Retell client with API key
const retell = new Retell({
  apiKey: process.env.RETELL_API_KEY!,
});

export async function startOutboundCall(agent_id: string, to_number: string, from_number: string) {
  try {
    const call = await retell.call.createPhoneCall({
      agent_id,
      to_number,
      from_number,
    });
    
    return call;
  } catch (error: any) {
    console.error('❌ Retell SDK call error:', error);
    throw new Error(error.message || 'Failed to start call');
  }
}

export { retell };