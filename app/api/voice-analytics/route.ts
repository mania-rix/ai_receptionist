import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase'
import { cookies } from 'next/headers';
import { voiceAnalyticsProcessor } from '@/lib/voice-analytics';

export async function POST(req: Request) {
  console.log('[API:voice-analytics] POST request');
  try {
    const { question, audio_data } = await req.json();
    console.log('[API:voice-analytics] POST payload:', { question, hasAudio: !!audio_data });
    const cookieStore = cookies();
    const supabase = supabaseServer(cookieStore)

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('[API:voice-analytics] POST Unauthorized access attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let result;
    
    if (audio_data) {
      console.log('[API:voice-analytics] Processing voice query');
      // Process voice query
      const audioBlob = new Blob([Buffer.from(audio_data, 'base64')], { type: 'audio/wav' });
      result = await voiceAnalyticsProcessor.processVoiceQuery(audioBlob, user.id);
    } else if (question) {
      console.log('[API:voice-analytics] Processing text query');
      // Process text query
      result = await voiceAnalyticsProcessor.processTextQuery(question, user.id);
    } else {
      console.error('[API:voice-analytics] No question or audio provided');
      return NextResponse.json({ error: 'No question or audio provided' }, { status: 400 });
    }

    console.log('[API:voice-analytics] POST response:', result);
    return NextResponse.json(result);
  } catch (error) {
    console.error('[API:voice-analytics] POST Error:', error);
    return NextResponse.json(
      { error: 'Failed to process analytics query' },
      { status: 500 }
    );
  }
}