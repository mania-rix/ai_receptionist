import { createRetellAgent } from "@/lib/retell";
import { createServerSupabaseClient } from "@/lib/supabase";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  console.log('[API:create-agent] Incoming request');
  try {
    const body = await req.json();
    console.log('[API:create-agent] Incoming payload:', body);

    const retellAgent = await createRetellAgent({
      name: body.name,
      voice: body.voice,
      greeting: body.greeting,
      temperature: body.temperature,
      interruption_sensitivity: body.interruption_sensitivity,
    });

    const cookieStore = cookies();
    const supabase = supabaseServer(cookieStore)

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

    console.log('[API:create-agent] Success response:', data);
    return new Response(JSON.stringify({ agent: data }), { status: 200 });
  } catch (error: any) {
    console.error('[API:create-agent] Error:', error.message);
    return new Response(JSON.stringify({ error: error.message || "Unknown error" }), { status: 500 });
  }
}
