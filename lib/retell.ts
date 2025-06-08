// /home/project/lib/retell.ts

type AgentData = {
  name: string;
  voice: string;
  greeting: string;
  temperature: number;
  interruption_sensitivity: number;
};

export async function createRetellAgent(data: AgentData) {
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
    throw new Error(`Retell agent creation failed: ${errorText}`);
  }

  const retellAgent = await response.json();
  return retellAgent;
}

export async function startOutboundCall(agent_id: string, phone_number: string) {
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
    throw new Error(`Retell call initiation failed: ${errorText}`);
  }

  const call = await response.json();
  return call;
}
