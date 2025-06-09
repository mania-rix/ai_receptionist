import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase'
import { cookies } from 'next/headers';
import { elevenLabsAPI } from '@/lib/elevenlabs';

export async function POST(req: Request) {
  console.log('[API:live-relay] Incoming request');
  try {
    const { action, message, call_id, target_language } = await req.json();
    console.log('[API:live-relay] Incoming payload:', { action, message, call_id, target_language });
    const cookieStore = cookies();
    const supabase = supabaseServer(cookieStore)

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('[API:live-relay] Unauthorized access attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (action === 'start_session') {
      console.log('[API:live-relay] Starting session for call:', call_id);
      // Create a new relay session
      const { data: session, error } = await supabase
        .from('live_relay_sessions')
        .insert([{
          user_id: user.id,
          call_id,
          operator_id: user.id,
          status: 'active',
        }])
        .select()
        .single();

      if (error) throw error;

      console.log('[API:live-relay] Session created:', session);
      return NextResponse.json({ session });
    }

    if (action === 'send_message') {
      console.log('[API:live-relay] Sending message:', message);
      // Translate message if needed and send via TTS
      let translatedMessage = message;
      
      if (target_language && target_language !== 'en') {
        // This would integrate with a translation service
        // For now, we'll just prefix with the target language
        translatedMessage = `[${target_language.toUpperCase()}] ${message}`;
      }

      // Generate speech using ElevenLabs
      const audioBuffer = await elevenLabsAPI.generateSpeech({
        text: translatedMessage,
        voice_id: 'EXAVITQu4vr4xnSDxMaL', // Default voice
      });

      // Step 1: Get current transcript for this session
      const { data: session, error: fetchError } = await supabase
        .from('live_relay_sessions')
        .select('id, transcript')
        .eq('call_id', call_id)
        .eq('status', 'active')
        .single();
      
      if (fetchError || !session) throw fetchError || new Error('Session not found');
      
      // Step 2: Append new message using your RPC (adjust params if needed)
      const { data: newTranscript, error: rpcError } = await supabase.rpc('jsonb_array_append', {
        target: session.transcript, // The current transcript array!
        new_element: JSON.stringify({
          type: 'operator_message',
          message: translatedMessage,
          original: message,
          timestamp: new Date().toISOString(),
        }),
      });
      if (rpcError) throw rpcError;
      
      // Step 3: Update the session with the new transcript array
      const { error: updateError } = await supabase
        .from('live_relay_sessions')
        .update({ transcript: newTranscript })
        .eq('id', session.id);
      
      if (updateError) throw updateError;



      if (error) throw error;

      // In a real implementation, this would send the audio to the active call
      // For now, we'll return the audio data
      console.log('[API:live-relay] Message sent successfully');
      return NextResponse.json({ 
        success: true,
        audio_url: 'data:audio/mpeg;base64,' + Buffer.from(audioBuffer).toString('base64'),
      });
    }

    if (action === 'end_session') {
      console.log('[API:live-relay] Ending session for call:', call_id);
      const { error } = await supabase
        .from('live_relay_sessions')
        .update({
          status: 'ended',
          ended_at: new Date().toISOString(),
        })
        .eq('call_id', call_id)
        .eq('operator_id', user.id);

      if (error) throw error;

      console.log('[API:live-relay] Session ended successfully');
      return NextResponse.json({ success: true });
    }

    console.error('[API:live-relay] Invalid action:', action);
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('[API:live-relay] Error:', error);
    return NextResponse.json(
      { error: 'Failed to process relay action' },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  console.log('[API:live-relay] GET request');
  try {
    const { searchParams } = new URL(req.url);
    const call_id = searchParams.get('call_id');
    console.log('[API:live-relay] GET payload:', { call_id });
    
    const cookieStore = cookies();
    const supabase = supabaseServer(cookieStore)

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('[API:live-relay] GET Unauthorized access attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (call_id) {
      // Get specific session
      const { data: session, error } = await supabase
        .from('live_relay_sessions')
        .select('*')
        .eq('call_id', call_id)
        .eq('status', 'active')
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      console.log('[API:live-relay] GET session response:', session);
      return NextResponse.json({ session });
    } else {
      // Get all active sessions for user
      const { data: sessions, error } = await supabase
        .from('live_relay_sessions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('started_at', { ascending: false });

      if (error) throw error;

      console.log('[API:live-relay] GET sessions response:', sessions);
      return NextResponse.json({ sessions });
    }
  } catch (error) {
    console.error('[API:live-relay] GET Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sessions' },
      { status: 500 }
    );
  }
}