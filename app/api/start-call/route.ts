import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabaseServer } from '@/lib/supabase';

export async function POST(req: Request) {
  console.log('[API:start-call] POST request');
  try {
    const { phone_number, agent_id, direction = 'outbound' } = await req.json();
    console.log('[API:start-call] POST payload:', { phone_number, agent_id, direction });
    
    let supabase;
    let user;
    
    try {
      const cookieStore = cookies();
      supabase = supabaseServer(cookieStore);
      const { data: { user: authUser } } = await supabase.auth.getUser();
      user = authUser;
    } catch (error) {
      console.warn('[API:start-call] Cookie access failed, using demo mode');
      const { createClient } = await import('@supabase/supabase-js');
      supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      user = { id: 'demo-user-id', email: 'demo@blvckwall.ai' };
    }

    if (!user) {
      console.error('[API:start-call] Unauthorized access attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // For demo mode, create a mock call record
    const callId = `call_${Date.now()}`;
    const mockCall = {
      id: callId,
      user_id: user.id,
      agent_id: agent_id,
      callee: phone_number,
      direction: direction,
      status: 'in_progress',
      started_at: new Date().toISOString(),
      retell_call_id: `retell_${callId}`,
      recording_url: null,
      transcript: null,
      duration_seconds: null,
      cost: null,
      created_at: new Date().toISOString()
    };

    try {
      // Try to insert into database
      const { data, error } = await supabase
        .from('calls')
        .insert([mockCall])
        .select()
        .single();

      if (error) {
        console.warn('[API:start-call] Database insert failed, using mock data:', error);
        // Return mock data if database fails
        return NextResponse.json({ 
          call: mockCall,
          call_url: `https://demo-call-url.com/${callId}`,
          message: 'Call started successfully (Demo Mode)'
        });
      }

      console.log('[API:start-call] Call created:', data.id);
      return NextResponse.json({ 
        call: data,
        call_url: `https://demo-call-url.com/${data.id}`,
        message: 'Call started successfully'
      });
    } catch (dbError) {
      console.warn('[API:start-call] Database error, returning mock data:', dbError);
      return NextResponse.json({ 
        call: mockCall,
        call_url: `https://demo-call-url.com/${callId}`,
        message: 'Call started successfully (Demo Mode)'
      });
    }
  } catch (error) {
    console.error('[API:start-call] POST Error:', error);
    return NextResponse.json(
      { error: 'Failed to start call' },
      { status: 500 }
    );
  }
}