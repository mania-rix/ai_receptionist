import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase'
//import { cookies } from 'next/headers';

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
   // const cookieStore = cookies();
    const supabase = supabaseServer();

    const { data, error } = await supabase
      .from('phone_numbers')
      .update({
        label: body.label,
        assigned_agent_id: body.assigned_agent_id,
        is_active: body.is_active,
        sip_config: body.sip_config,
      })
      .eq('id', params.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ phoneNumber: data });
  } catch (error) {
    console.error('Error updating phone number:', error);
    return NextResponse.json(
      { error: 'Failed to update phone number' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = cookies();
    const supabase = supabaseServer(cookieStore)

    const { error } = await supabase
      .from('phone_numbers')
      .delete()
      .eq('id', params.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting phone number:', error);
    return NextResponse.json(
      { error: 'Failed to delete phone number' },
      { status: 500 }
    );
  }
}