import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabaseServer } from '@/lib/supabase';
import { getElevenLabsVoices } from '@/lib/elevenlabs';

export async function GET() {
  console.log('[API:elevenlabs-voices] GET request'); 
  try {
    let supabase;
    try {
      const cookieStore = cookies();
      supabase = supabaseServer(cookieStore);
    } catch (error) {
      console.warn('[API:elevenlabs-voices] Cookie access failed, using demo mode');
      // For demo mode, create a mock supabase client
      //const { createClient } = await import('@supabase/supabase-js');
      supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
    }

    // Get ElevenLabs voices
    let elevenLabsVoices: any[] = [];
    try {
      const voices = await getElevenLabsVoices();
      console.log('[API:elevenlabs-voices] Successfully fetched voices:', voices.length);
      elevenLabsVoices = voices.map(voice => ({
        id: voice.voice_id,
        name: voice.name,
        provider: 'elevenlabs',
        category: voice.category,
        preview_url: voice.preview_url,
      }));
    } catch (error) {
      console.warn('[API:elevenlabs-voices] Failed to fetch ElevenLabs voices, using mock data:', error);
      
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