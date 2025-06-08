import { createRetellAgent } from "@/lib/retell";
import { supabase } from "@/lib/supabase"; // adjust path if needed

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const retellAgent = await createRetellAgent({
      name: body.name,
      voice: body.voice,
      greeting: body.greeting,
      temperature: body.temperature,
      interruption_sensitivity: body.interruption_sensitivity,
    });

    const { data, error } = await supabase.from("agents").insert([
      {
        name: body.name,
        voice: body.voice,
        greeting: body.greeting,
        temperature: body.temperature,
        interruption_sensitivity: body.interruption_sensitivity,
        retell_agent_id: retellAgent.id,
        retell_llm_id: retellAgent.llm_id ?? null,
      },
    ]).select().single();

    if (error) {
      console.error("❌ Supabase insert error:", error.message);
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    return new Response(JSON.stringify({ agent: data }), { status: 200 });
  } catch (error: any) {
    console.error("❌ API route /create-agent failed:", error.message);
    return new Response(JSON.stringify({ error: error.message || "Unknown error" }), { status: 500 });
  }
}
