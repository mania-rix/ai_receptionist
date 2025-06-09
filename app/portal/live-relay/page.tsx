'use client';

import { useState, useEffect, useRef } from 'react';
import { Play, Square, Mic, MicOff, Send, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

export default function LiveRelayPage() {
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [currentCallId, setCurrentCallId] = useState('');
  const [operatorMessage, setOperatorMessage] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('en');
  const [transcript, setTranscript] = useState<any[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const { toast } = useToast();
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    console.log('[LiveRelay] Component mounted');
    return () => {
      console.log('[LiveRelay] Component unmounted');
    };
  }, []);
  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'zh', name: 'Chinese' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
    { code: 'ar', name: 'Arabic' },
  ];

  const startSession = async () => {
    console.log('[LiveRelay] Starting session for call:', currentCallId);
    try {
      const response = await fetch('/api/live-relay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'start_session',
          call_id: currentCallId || `call_${Date.now()}`,
        }),
      });

      if (!response.ok) throw new Error('Failed to start session');

      const result = await response.json();
      setIsSessionActive(true);
      setCurrentCallId(result.session.call_id);
      
      console.log('[LiveRelay] Session started successfully:', result.session);
      toast({
        title: 'Session Started',
        description: 'Live relay session is now active',
      });
    } catch (error) {
      console.error('[LiveRelay] Error starting session:', error);
      toast({
        title: 'Error',
        description: 'Failed to start relay session',
        variant: 'destructive',
      });
    }
  };

  const endSession = async () => {
    console.log('[LiveRelay] Ending session for call:', currentCallId);
    try {
      const response = await fetch('/api/live-relay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'end_session',
          call_id: currentCallId,
        }),
      });

      if (!response.ok) throw new Error('Failed to end session');

      setIsSessionActive(false);
      setCurrentCallId('');
      setTranscript([]);
      
      console.log('[LiveRelay] Session ended successfully');
      toast({
        title: 'Session Ended',
        description: 'Live relay session has been terminated',
      });
    } catch (error) {
      console.error('[LiveRelay] Error ending session:', error);
      toast({
        title: 'Error',
        description: 'Failed to end relay session',
        variant: 'destructive',
      });
    }
  };

  const sendMessage = async () => {
    if (!operatorMessage.trim() || !isSessionActive) return;

    console.log('[LiveRelay] Sending message:', operatorMessage);
    try {
      const response = await fetch('/api/live-relay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send_message',
          call_id: currentCallId,
          message: operatorMessage,
          target_language: targetLanguage,
        }),
      });

      if (!response.ok) throw new Error('Failed to send message');

      const result = await response.json();
      
      // Add message to transcript
      setTranscript(prev => [...prev, {
        type: 'operator',
        message: operatorMessage,
        language: targetLanguage,
        timestamp: new Date().toISOString(),
      }]);

      // Play audio response if available
      if (result.audio_url && audioRef.current) {
        audioRef.current.src = result.audio_url;
        audioRef.current.play();
      }

      setOperatorMessage('');
      
      console.log('[LiveRelay] Message sent successfully');
      toast({
        title: 'Message Sent',
        description: 'Your message has been translated and spoken to the caller',
      });
    } catch (error) {
      console.error('[LiveRelay] Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive',
      });
    }
  };

  const toggleRecording = () => {
    console.log('[LiveRelay] Toggling recording:', !isRecording);
    setIsRecording(!isRecording);
    // In a real implementation, this would start/stop voice recording
    toast({
      title: isRecording ? 'Recording Stopped' : 'Recording Started',
      description: isRecording ? 'Voice input disabled' : 'Speak your message',
    });
  };

  return (
    <div className="flex-1 space-y-6 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Live Language Relay</h1>
        <div className="flex items-center gap-2">
          <Badge variant={isSessionActive ? 'default' : 'secondary'}>
            {isSessionActive ? 'Active' : 'Inactive'}
          </Badge>
          {isSessionActive ? (
            <Button onClick={endSession} variant="destructive">
              <Square className="mr-2 h-4 w-4" />
              End Session
            </Button>
          ) : (
            <Button onClick={startSession}>
              <Play className="mr-2 h-4 w-4" />
              Start Session
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Operator Panel */}
        <Card className="border-gray-800 bg-[#121212]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mic className="h-5 w-5" />
              Operator Panel
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium">Call ID</label>
              <Input
                placeholder="Enter call ID or leave blank for new session"
                value={currentCallId}
                onChange={(e) => setCurrentCallId(e.target.value)}
                disabled={isSessionActive}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Target Language</label>
              <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Your Message</label>
              <Textarea
                placeholder="Type your message in any language..."
                value={operatorMessage}
                onChange={(e) => setOperatorMessage(e.target.value)}
                disabled={!isSessionActive}
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={sendMessage}
                disabled={!isSessionActive || !operatorMessage.trim()}
                className="flex-1"
              >
                <Send className="mr-2 h-4 w-4" />
                Send & Speak
              </Button>
              <Button
                onClick={toggleRecording}
                variant={isRecording ? 'destructive' : 'outline'}
                disabled={!isSessionActive}
              >
                {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
            </div>

            {isRecording && (
              <div className="text-center text-sm text-gray-400">
                🎤 Listening... Speak your message
              </div>
            )}
          </CardContent>
        </Card>

        {/* Live Transcript */}
        <Card className="border-gray-800 bg-[#121212]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Live Call Transcript
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {transcript.length === 0 ? (
                <div className="text-center text-gray-400 py-8">
                  {isSessionActive 
                    ? 'Waiting for conversation...' 
                    : 'Start a session to see live transcript'
                  }
                </div>
              ) : (
                transcript.map((entry, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg ${
                      entry.type === 'operator' 
                        ? 'bg-blue-950/50 border-l-4 border-blue-500' 
                        : 'bg-gray-900 border-l-4 border-gray-500'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <Badge variant="outline" className="text-xs">
                        {entry.type === 'operator' ? 'You' : 'Caller'}
                      </Badge>
                      <span className="text-xs text-gray-400">
                        {new Date(entry.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm">{entry.message}</p>
                    {entry.language && entry.language !== 'en' && (
                      <Badge variant="secondary" className="text-xs mt-1">
                        {languages.find(l => l.code === entry.language)?.name}
                      </Badge>
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <Card className="border-gray-800 bg-[#121212]">
        <CardHeader>
          <CardTitle>How to Use Live Relay</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-medium mb-2">Getting Started</h4>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>1. Enter a call ID or start a new session</li>
                <li>2. Select the target language for translation</li>
                <li>3. Type your message or use voice input</li>
                <li>4. Click &quot;Send & Speak&quot; to relay to caller</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Features</h4>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>• Real-time language translation</li>
                <li>• Voice synthesis in target language</li>
                <li>• Live transcript monitoring</li>
                <li>• Multi-language support</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hidden audio element for playing TTS responses */}
      <audio ref={audioRef} style={{ display: 'none' }} />
    </div>
  );
}