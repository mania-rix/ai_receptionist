import { NextResponse } from 'next/server';
//import { cookies } from 'next/headers';
import { supabaseServer } from '@/lib/supabase';
import { translateMessage, detectTextLanguage, getSupportedLanguages } from '@/lib/lingo';
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
    
   // const cookieStore = cookies();
    const supabase = supabaseServer();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('[API:lingo-translate] Unauthorized access attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Detect language if not provided
    let detectedSourceLanguage = source_language;
    if (!detectedSourceLanguage) {
      try {
        const detection = await detectTextLanguage(text);
        detectedSourceLanguage = detection.language;
        console.log('[API:lingo-translate] Detected language:', detectedSourceLanguage);
      } catch (error) {
        console.error('[API:lingo-translate] Language detection error:', error);
        detectedSourceLanguage = 'en'; // Default to English if detection fails
      }
    }

    // Translate the text
    let translation;
    try {
      translation = await translateMessage(text, target_language, detectedSourceLanguage);
      console.log('[API:lingo-translate] Translation result:', { 
        source: translation.source_language,
        target: translation.target_language,
        translated: translation.translated_text.substring(0, 50)
      });
    } catch (error) {
      console.error('[API:lingo-translate] Translation error:', error);
      return NextResponse.json({ error: 'Failed to translate text' }, { status: 500 });
    }

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
    let supabase;
    let user;
    
    try {
    //  const cookieStore = cookies();
      supabase = supabaseServer();
      const { data: { user: authUser } } = await supabase.auth.getUser();
      user = authUser;
    } catch (error) {
      console.warn('[API:lingo-translate] Cookie access failed, using demo mode');
      //const { createClient } = await import('@supabase/supabase-js');
      //supabase = createClient(
      //  process.env.NEXT_PUBLIC_SUPABASE_URL!,
      //  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
     // );
     // user = { id: 'demo-user-id', email: 'demo@blvckwall.ai' };
   }

    if (!user) {
      console.error('[API:lingo-translate] Unauthorized access attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get supported languages
    let languages;
    try {
      languages = await getSupportedLanguages();
      console.log('[API:lingo-translate] Languages retrieved:', languages.length);
    } catch (error) {
      console.error('[API:lingo-translate] Error fetching languages:', error);
      
      // Fallback to mock languages
      languages = [
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
    }

    return NextResponse.json({ languages });
  } catch (error) {
    console.error('[API:lingo-translate] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch supported languages' },
      { status: 500 }
    );
  }
}