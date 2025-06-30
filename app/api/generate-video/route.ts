import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase'
//import { cookies } from 'next/headers';
import { generateDoctorsNoteVideo } from '@/lib/tavus';

export async function POST(req: Request) {
  console.log('[API:generate-video] Incoming request');
  try {
    const body = await req.json();
    console.log('[API:generate-video] Incoming payload:', body);
    const cookieStore = cookies();
    const supabase = supabaseServer(cookieStore)

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('[API:generate-video] Unauthorized access attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get call details
    const { data: call, error: callError } = await supabase
      .from('calls')
      .select('*')
      .eq('id', body.call_id)
      .single();

    if (callError || !call) {
      console.error('[API:generate-video] Call not found:', body.call_id);
      return NextResponse.json({ error: 'Call not found' }, { status: 404 });
    }

    // Generate video summary from transcript
    const appointmentSummary = call.transcript 
      ? `Based on our conversation, here are the key points from your appointment: ${call.transcript.substring(0, 500)}...`
      : 'Thank you for your recent appointment. We discussed your health concerns and provided recommendations for your care.';

    // Generate video using Tavus
    const video = await generateDoctorsNoteVideo({
      patientName: body.patient_name || 'Patient',
      appointmentSummary,
      doctorName: body.doctor_name || 'Dr. Smith',
      replicaId: body.replica_id || process.env.DEFAULT_TAVUS_REPLICA_ID || '',
      brandColor: body.brand_color,
    });

    // Update call record with video info
    const { error: updateError } = await supabase
      .from('calls')
      .update({
        tavus_video_id: video.video_id,
        video_status: 'generating',
      })
      .eq('id', body.call_id);

    if (updateError) {
      console.error('Error updating call with video ID:', updateError);
    }

    console.log('[API:generate-video] Success response:', video);
    return NextResponse.json({ video });
  } catch (error) {
    console.error('[API:generate-video] Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate video' },
      { status: 500 }
    );
  }
}