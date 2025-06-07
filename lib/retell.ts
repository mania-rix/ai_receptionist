export async function startOutboundCall(agent_id: string, to_number: string, from_number: string) {
  const res = await fetch("https://api.retellai.com/v2/create-phone-call", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.RETELL_API_KEY?.trim()}`,
    },
    body: JSON.stringify({
      agent_id,
      to_number,
      from_number,
    }),
  });

  const contentType = res.headers.get("content-type");

  let result: any;
  if (contentType?.includes("application/json")) {
    result = await res.json();
  } else {
    const text = await res.text();
    throw new Error(`Retell API returned non-JSON response: ${text}`);
  }

  if (!res.ok) {
    throw new Error(result.error || `Retell call failed with status ${res.status}`);
  }

  return result;
}
