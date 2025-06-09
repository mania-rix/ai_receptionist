// /home/project/lib/retell.ts

type AgentData = {
  name: string;
  voice: string;
  greeting: string;
  temperature: number;
  interruption_sensitivity: number;
};

export async function createRetellAgent(data: AgentData) {
  console.log('[RetellLib] Creating Retell agent:', data.name);
  // TODO: Review error handling for Retell API calls
  const response = await fetch('https://api.retellai.com/v1/agents', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.RETELL_API_KEY?.trim()}`,
    },
    body: JSON.stringify({
      name: data.name,
      voice: data.voice,
      greeting_messages: [data.greeting],
      temperature: data.temperature,
      interruption_sensitivity: data.interruption_sensitivity,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[RetellLib] Agent creation failed:', response.status, errorText);
    throw new Error(`Retell agent creation failed: ${errorText}`);
  }

  const retellAgent = await response.json();
  console.log('[RetellLib] Agent created successfully:', retellAgent.id);
  return retellAgent;
}

export async function startOutboundCall(agent_id: string, phone_number: string) {
  console.log('[RetellLib] Starting outbound call:', { agent_id, phone_number });
  // TODO: Review error handling for Retell API calls
  const response = await fetch('https://api.retellai.com/v1/phone-calls', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.RETELL_API_KEY?.trim()}`,
    },
    body: JSON.stringify({
      agent_id,
      phone_number,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[RetellLib] Call initiation failed:', response.status, errorText);
    throw new Error(`Retell call initiation failed: ${errorText}`);
  }

  const call = await response.json();
  console.log('[RetellLib] Call started successfully:', call.id);
  return call;
}
