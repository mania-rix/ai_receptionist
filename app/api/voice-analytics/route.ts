export const runtime = "nodejs";

import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';
//import { cookies } from 'next/headers';
import { voiceAnalyticsProcessor } from '@/lib/voice-analytics';
import { elevenLabsAPI } from '@/lib/elevenlabs';

export async function POST(req: Request) {
  console.log('[API:voice-analytics] POST request');
  try {
    const { question, audio_data } = await req.json();
    console.log('[API:voice-analytics] POST payload:', { question, hasAudio: !!audio_data });
   // const cookieStore = cookies();
    const supabase = supabaseServer();

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

    // Ensure result is defined before proceeding
    if (!result) {
      console.error('[API:voice-analytics] Failed to process query - no result');
      return NextResponse.json({ error: 'Failed to process query' }, { status: 500 });
    }

    // Generate audio response using ElevenLabs
    let audioData;
    try {
      if (result.response) {
        const audioBuffer = await elevenLabsAPI.generateSpeech({
          text: result.response,
          voice_id: 'EXAVITQu4vr4xnSDxMaL', // Default voice
        });
        audioData = Buffer.from(audioBuffer).toString('base64');
        console.log('[API:voice-analytics] Audio response generated');
      }
    } catch (error) {
      console.error('[API:voice-analytics] Error generating audio response:', error);
      // Continue without audio if TTS fails
    }

    console.log('[API:voice-analytics] POST response:', result);
    return NextResponse.json({
      ...result,
      audio_data: audioData
    });
  } catch (error) {
    console.error('[API:voice-analytics] POST Error:', error);
    return NextResponse.json(
      { error: 'Failed to process analytics query' },
      { status: 500 }
    );
  }
}