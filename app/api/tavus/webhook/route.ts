import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase'
//import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    //const cookieStore = cookies();
    const supabase = supabaseServer();

    // Handle Tavus webhook events
    if (body.event_type === 'video.completed') {
      // Update call record with video URL
      const { error } = await supabase
        .from('calls')
        .update({
          video_url: body.data.video_url,
          video_status: 'completed',
        })
        .eq('tavus_video_id', body.data.video_id);

      if (error) {
        console.error('Error updating call with video:', error);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Tavus webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}