import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { voiceAnalyticsProcessor } from '@/lib/voice-analytics';

export async function POST(req: Request) {
  try {
    const { question, audio_data } = await req.json();
    const cookieStore = cookies();
    const supabase = createServerSupabaseClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let result;
    
    if (audio_data) {
      // Process voice query
      const audioBlob = new Blob([Buffer.from(audio_data, 'base64')], { type: 'audio/wav' });
      result = await voiceAnalyticsProcessor.processVoiceQuery(audioBlob, user.id);
    } else if (question) {
      // Process text query
      result = await voiceAnalyticsProcessor.processTextQuery(question, user.id);
    } else {
      return NextResponse.json({ error: 'No question or audio provided' }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Voice analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to process analytics query' },
      { status: 500 }
    );
  }
}