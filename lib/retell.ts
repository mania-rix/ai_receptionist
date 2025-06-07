// Retell REST API implementation
const RETELL_API_BASE = 'https://api.retellai.com';

export async function createRetellAgent(agentData: {
  agent_name: string;
  voice_id: string;
  initial_message: string;
  interruption_sensitivity: number;
  llm_id?: string;
}) {

  const response = await fetch(`${RETELL_API_BASE}/create-agent`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.RETELL_API_KEY}`,
    },
    body: JSON.stringify({
      agent_name: agentData.agent_name,
      voice_id: agentData.voice_id,
      initial_message: agentData.initial_message,
      interruption_sensitivity: agentData.interruption_sensitivity,
      response_engine: {
        type: 'retell-llm',
        llm_id: agentData.llm_id || 'llm_08507d646ed9a0c79da91ef05d67'
      }
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Retell agent creation failed:', errorText);
    throw new Error(`Retell agent creation failed: ${errorText}`);
  }

  return await response.json();
}

export async function startOutboundCall(agent_id: string, to_number: string, from_number: string) {
  const response = await fetch(`${RETELL_API_BASE}/v2/create-phone-call`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.RETELL_API_KEY}`,
    },
    body: JSON.stringify({
      agent_id,
      to_number,
      from_number,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Retell call creation failed:', errorText);
    throw new Error(`Retell call creation failed: ${errorText}`);
  }

  return await response.json();
}