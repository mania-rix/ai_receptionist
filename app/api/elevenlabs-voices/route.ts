import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabaseServer } from '@/lib/supabase';
import { getElevenLabsVoices } from '@/lib/elevenlabs';

export async function GET() {
  console.log('[API:elevenlabs-voices] GET request');
  try {
    const cookieStore = cookies();
    const supabase = supabaseServer(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('[API:elevenlabs-voices] Unauthorized access attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get ElevenLabs voices
    let elevenLabsVoices: any[] = [];
    try {
      const voices = await getElevenLabsVoices();
      elevenLabsVoices = voices.map(voice => ({
        id: voice.voice_id,
        name: voice.name,
        provider: 'elevenlabs',
        category: voice.category,
        preview_url: voice.preview_url,
      }));
    } catch (error) {
      console.warn('[API:elevenlabs-voices] Failed to fetch ElevenLabs voices:', error);
      
      // Provide mock voices for demo
      elevenLabsVoices = [
        { id: 'voice_1', name: 'Rachel', provider: 'elevenlabs', category: 'professional' },
        { id: 'voice_2', name: 'Thomas', provider: 'elevenlabs', category: 'professional' },
        { id: 'voice_3', name: 'Emily', provider: 'elevenlabs', category: 'professional' },
        { id: 'voice_4', name: 'James', provider: 'elevenlabs', category: 'professional' },
        { id: 'voice_5', name: 'Sarah', provider: 'elevenlabs', category: 'professional' },
        { id: 'voice_6', name: 'Michael', provider: 'elevenlabs', category: 'professional' },
      ];
    }

    return NextResponse.json({ voices: elevenLabsVoices });
  } catch (error) {
    console.error('[API:elevenlabs-voices] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch voices' },
      { status: 500 }
    );
  }
}