import { NextResponse } from 'next/server';
import { getElevenLabsVoices } from '@/lib/elevenlabs';

// Retell voices (static list - you may want to fetch from API)
const retellVoices = [
  { id: 'serena', name: 'Serena', provider: 'retell' },
  { id: 'morgan', name: 'Morgan', provider: 'retell' },
  { id: 'ava', name: 'Ava', provider: 'retell' },
  { id: 'ryan', name: 'Ryan', provider: 'retell' },
  { id: 'sophia', name: 'Sophia', provider: 'retell' },
  { id: 'james', name: 'James', provider: 'retell' },
];

export async function GET() {
  try {
    // Get ElevenLabs voices
    let elevenLabsVoices = [];
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
      console.warn('Failed to fetch ElevenLabs voices:', error);
    }

    // Combine all voices
    const allVoices = [
      ...retellVoices,
      ...elevenLabsVoices,
    ];

    return NextResponse.json({ voices: allVoices });
  } catch (error) {
    console.error('Error fetching voices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch voices' },
      { status: 500 }
    );
  }
}