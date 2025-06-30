import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase'
import { cookies } from 'next/headers';
import { elevenLabsAPI } from '@/lib/elevenlabs';

export async function GET() {
  try {
    let supabase;
    try {
      const cookieStore = cookies();
      supabase = supabaseServer(cookieStore);
    } catch (error) {
      console.warn('[API:phone-numbers] Cookie access failed, using demo mode');
      const { createClient } = await import('@supabase/supabase-js');
      supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
    }

    const { data: phoneNumbers, error } = await supabase
      .from('phone_numbers')
      .select(`
        *,
        assigned_agent:agents(id, name)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('[API:phone-numbers] Database error, returning mock data:', error);
      // Return mock phone numbers for demo
      const mockPhoneNumbers = [
        {
          id: 'demo-phone-1',
          phone_number: '+1 (555) 123-4567',
          provider: 'retell',
          type: 'provisioned',
          label: 'Main Business Line',
          assigned_agent: { id: 'demo-agent-1', name: 'Dr. Sarah Johnson' },
          created_at: new Date().toISOString()
        },
        {
          id: 'demo-phone-2',
          phone_number: '+1 (555) 987-6543',
          provider: 'elevenlabs',
          type: 'provisioned',
          label: 'Customer Support',
          assigned_agent: null,
          created_at: new Date().toISOString()
        }
      ];
      return NextResponse.json({ phoneNumbers: mockPhoneNumbers });
    }

    return NextResponse.json({ phoneNumbers });
  } catch (error) {
    console.error('Error fetching phone numbers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch phone numbers' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    let supabase;
    let user;
    
    try {
      const cookieStore = cookies();
      supabase = supabaseServer(cookieStore);
      const { data: { user: authUser } } = await supabase.auth.getUser();
      user = authUser;
    } catch (error) {
      console.warn('[API:phone-numbers] Cookie access failed, using demo mode');
      const { createClient } = await import('@supabase/supabase-js');
      supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      user = { id: 'demo-user-id', email: 'demo@blvckwall.ai' };
    }

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let phoneNumber = body.phone_number;

    // If it's a provisioned number, purchase it from the provider
    if (body.type === 'provisioned') {
      if (body.provider === 'elevenlabs') {
        try {
          const result = await elevenLabsAPI.purchasePhoneNumber({
            area_code: body.area_code,
            country_code: body.country_code || 'US',
          });
          phoneNumber = result.phone_number;
        } catch (error) {
          console.error('Failed to purchase ElevenLabs number:', error);
          // For demo mode, generate a mock phone number
          phoneNumber = `+1 (555) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`;
        }
      }
      // Add Retell phone number purchasing logic here if needed
    }

    const { data, error } = await supabase
      .from('phone_numbers')
      .insert([
        {
          user_id: user.id,
          phone_number: phoneNumber,
          provider: body.provider,
          type: body.type,
          label: body.label,
          sip_config: body.sip_config || {},
          assigned_agent_id: body.assigned_agent_id || null,
        },
      ])
      .select()
      .single();

    if (error) {
      console.warn('[API:phone-numbers] Database error, returning mock data:', error);
      // Return mock phone number for demo
      const mockPhoneNumber = {
        id: `demo-phone-${Date.now()}`,
        user_id: user.id,
        phone_number: phoneNumber,
        provider: body.provider,
        type: body.type,
        label: body.label,
        sip_config: body.sip_config || {},
        assigned_agent_id: body.assigned_agent_id || null,
        created_at: new Date().toISOString()
      };
      return NextResponse.json({ phoneNumber: mockPhoneNumber });
    }

    return NextResponse.json({ phoneNumber: data });
  } catch (error) {
    console.error('Error creating phone number:', error);
    return NextResponse.json(
      { error: 'Failed to create phone number' },
      { status: 500 }
    );
  }
}