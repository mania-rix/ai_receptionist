import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabaseServer } from '@/lib/supabase';
import { translateMessage, detectTextLanguage } from '@/lib/lingo';
import { elevenLabsAPI } from '@/lib/elevenlabs';

export async function POST(req: Request) {
  console.log('[API:lingo-translate] Incoming request');
  try {
    const { text, target_language, source_language } = await req.json();
    console.log('[API:lingo-translate] Incoming payload:', { 
      text: text.substring(0, 50), 
      target_language, 
      source_language 
    });
    
    const cookieStore = cookies();
    const supabase = supabaseServer(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('[API:lingo-translate] Unauthorized access attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Detect language if not provided
    let detectedSourceLanguage = source_language;
    if (!detectedSourceLanguage) {
      const detection = await detectTextLanguage(text);
      detectedSourceLanguage = detection.language;
      console.log('[API:lingo-translate] Detected language:', detectedSourceLanguage);
    }

    // Translate the text
    const translation = await translateMessage(text, target_language, detectedSourceLanguage);
    console.log('[API:lingo-translate] Translation result:', { 
      source: translation.source_language,
      target: translation.target_language,
      translated: translation.translated_text.substring(0, 50)
    });

    // Generate speech using ElevenLabs
    let audioBuffer;
    try {
      audioBuffer = await elevenLabsAPI.generateSpeech({
        text: translation.translated_text,
        voice_id: 'EXAVITQu4vr4xnSDxMaL', // Default voice
      });
      console.log('[API:lingo-translate] Speech generated successfully');
    } catch (error) {
      console.error('[API:lingo-translate] TTS error:', error);
      // Continue without audio if TTS fails
    }

    // Return the translation and audio
    return NextResponse.json({ 
      translation,
      audio_url: audioBuffer ? 
        `data:audio/mpeg;base64,${Buffer.from(audioBuffer).toString('base64')}` : 
        undefined
    });
  } catch (error) {
    console.error('[API:lingo-translate] Error:', error);
    return NextResponse.json(
      { error: 'Failed to translate text' },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  console.log('[API:lingo-translate] GET request for supported languages');
  try {
    const cookieStore = cookies();
    const supabase = supabaseServer(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('[API:lingo-translate] Unauthorized access attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Return mock supported languages for demo
    const languages = [
      { code: 'en', name: 'English', native_name: 'English' },
      { code: 'es', name: 'Spanish', native_name: 'Español' },
      { code: 'fr', name: 'French', native_name: 'Français' },
      { code: 'de', name: 'German', native_name: 'Deutsch' },
      { code: 'it', name: 'Italian', native_name: 'Italiano' },
      { code: 'pt', name: 'Portuguese', native_name: 'Português' },
      { code: 'zh', name: 'Chinese', native_name: '中文' },
      { code: 'ja', name: 'Japanese', native_name: '日本語' },
      { code: 'ko', name: 'Korean', native_name: '한국어' },
      { code: 'ar', name: 'Arabic', native_name: 'العربية' },
    ];

    return NextResponse.json({ languages });
  } catch (error) {
    console.error('[API:lingo-translate] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch supported languages' },
      { status: 500 }
    );
  }
}