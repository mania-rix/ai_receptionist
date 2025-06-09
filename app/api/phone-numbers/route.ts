import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase'
import { cookies } from 'next/headers';
import { elevenLabsAPI } from '@/lib/elevenlabs';

export async function GET() {
  try {
    const cookieStore = cookies();
    const supabase = supabaseServer(cookieStore)

    const { data: phoneNumbers, error } = await supabase
      .from('phone_numbers')
      .select(`
        *,
        assigned_agent:agents(id, name)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

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
    const cookieStore = cookies();
    const supabase = supabaseServer(cookieStore)

    const { data: { user } } = await supabase.auth.getUser();
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
          return NextResponse.json(
            { error: 'Failed to purchase phone number' },
            { status: 500 }
          );
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

    if (error) throw error;

    return NextResponse.json({ phoneNumber: data });
  } catch (error) {
    console.error('Error creating phone number:', error);
    return NextResponse.json(
      { error: 'Failed to create phone number' },
      { status: 500 }
    );
  }
}