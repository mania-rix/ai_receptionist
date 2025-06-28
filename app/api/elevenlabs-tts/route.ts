import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabaseServer } from '@/lib/supabase';
import { elevenLabsAPI } from '@/lib/elevenlabs';

export async function POST(req: Request) {
  console.log('[API:elevenlabs-tts] POST request');
  try {
    const { text, voice_id } = await req.json();
    console.log('[API:elevenlabs-tts] POST payload:', { text: text.substring(0, 50), voice_id });
    
    const cookieStore = cookies();
    const supabase = supabaseServer(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('[API:elevenlabs-tts] Unauthorized access attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Generate speech using ElevenLabs
    let audioBuffer;
    try {
      audioBuffer = await elevenLabsAPI.generateSpeech({
        text,
        voice_id: voice_id || 'EXAVITQu4vr4xnSDxMaL', // Default voice
      });
      console.log('[API:elevenlabs-tts] Speech generated successfully');
    } catch (error) {
      console.error('[API:elevenlabs-tts] TTS error:', error);
      throw new Error('Failed to generate speech');
    }

    // Return the audio as base64
    return NextResponse.json({ 
      audio_data: Buffer.from(audioBuffer).toString('base64')
    });
  } catch (error) {
    console.error('[API:elevenlabs-tts] Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate speech' },
      { status: 500 }
    );
  }
}