'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, Square, Mic, MicOff, Send, Phone, Globe, Loader2, RefreshCw, User, Clock } from 'lucide-react';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase-browser';

interface TranslationResult {
  text: string;
  source_language: string;
  target_language: string;
  translated_text: string;
  confidence: number;
}

interface Language {
  code: string;
  name: string;
  native_name: string;
}

interface TranscriptEntry {
  type: 'operator' | 'caller';
  message: string;
  translated_message?: string;
  language: string;
  timestamp: string;
}

interface CallerInfo {
  name: string;
  phone: string;
  language: string;
}

export default function LiveRelayPage() {
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [currentCallId, setCurrentCallId] = useState('');
  const [operatorMessage, setOperatorMessage] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('es');
  const [sourceLanguage, setSourceLanguage] = useState('en');
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [isLoadingLanguages, setIsLoadingLanguages] = useState(true);
  const [callerInfoOpen, setCallerInfoOpen] = useState(false);
  const [callerInfo, setCallerInfo] = useState<CallerInfo>({
    name: 'Maria Rodriguez',
    phone: '+1 (555) 123-4567',
    language: 'es'
  });
  const [callDuration, setCallDuration] = useState(0);
  const [callTimer, setCallTimer] = useState<NodeJS.Timeout | null>(null);
  const { toast } = useToast();
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    console.log('[LiveRelay] Component mounted');
    fetchSupportedLanguages();
    
    return () => {
      console.log('[LiveRelay] Component unmounted');
      if (callTimer) {
        clearInterval(callTimer);
      }
    };
  }, []);
  
  const fetchSupportedLanguages = async () => {
    console.log('[LiveRelay] Fetching supported languages...');
    setIsLoadingLanguages(true); 
    try {
      const response = await fetch('/api/lingo-translate');
      if (!response.ok) {
        throw new Error('Failed to fetch languages');
      }
      
      const data = await response.json();
      setLanguages(data.languages || []);
      console.log('[LiveRelay] Languages fetched:', data.languages?.length || 0);
    } catch (error) {
      console.error('[LiveRelay] Error fetching languages:', error);
      // Provide fallback languages for demo mode
      setLanguages([
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
      ]);
      console.log('[LiveRelay] Using fallback languages for demo');
    } finally {
      setIsLoadingLanguages(false);
    }
  };

  const startSession = async () => {
    console.log('[LiveRelay] Starting session for call:', currentCallId);
    try {
      // Set caller language from caller info
      setTargetLanguage(callerInfo.language);
      
      // Generate a call ID if not provided
      const callId = currentCallId || `call_${Date.now()}`;
      setCurrentCallId(callId);
      
      // Start the session
      setIsSessionActive(true);
      
      // Start call timer
      const timer = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
      setCallTimer(timer);
      
      // Add initial transcript entry
      const initialEntry: TranscriptEntry = {
        type: 'caller',
        message: getInitialCallerMessage(callerInfo.language),
        language: callerInfo.language,
        timestamp: new Date().toISOString()
      };
      setTranscript([initialEntry]);
      
      console.log('[LiveRelay] Session started successfully');
      toast({
        title: 'Session Started',
        description: 'Live relay session is now active',
      });
      
      // Simulate caller messages
      scheduleCallerMessages();
    } catch (error) {
      console.error('[LiveRelay] Error starting session:', error);
      toast({
        title: 'Error',
        description: 'Failed to start relay session',
        variant: 'destructive',
      });
    }
  };

  const getInitialCallerMessage = (language: string) => {
    const messages: { [key: string]: string } = {
      'en': 'Hello, I need some help with scheduling an appointment.',
      'es': 'Hola, necesito ayuda para programar una cita.',
      'fr': 'Bonjour, j\'ai besoin d\'aide pour prendre rendez-vous.',
      'de': 'Hallo, ich brauche Hilfe bei der Terminvereinbarung.',
      'it': 'Ciao, ho bisogno di aiuto per fissare un appuntamento.',
      'pt': 'Olá, preciso de ajuda para agendar uma consulta.',
      'zh': '你好，我需要帮助预约。',
      'ja': 'こんにちは、予約の手続きについて助けが必要です。',
      'ko': '안녕하세요, 약속 일정을 잡는 데 도움이 필요합니다.',
      'ar': 'مرحبًا، أحتاج إلى مساعدة في تحديد موعد.'
    };
    
    return messages[language] || messages['en'];
  };

  const scheduleCallerMessages = () => {
    // Schedule some simulated caller messages
    const messages = [
      {
        en: "What times do you have available next week?",
        es: "¿Qué horarios tienen disponibles la próxima semana?",
        fr: "Quels sont les horaires disponibles la semaine prochaine?",
        de: "Welche Termine sind nächste Woche verfügbar?",
        delay: 15000
      },
      {
        en: "I would prefer morning appointments if possible.",
        es: "Preferiría citas por la mañana si es posible.",
        fr: "Je préférerais des rendez-vous le matin si possible.",
        de: "Ich würde Termine am Morgen bevorzugen, wenn möglich.",
        delay: 30000
      },
      {
        en: "Do I need to bring anything specific to the appointment?",
        es: "¿Necesito traer algo específico a la cita?",
        fr: "Dois-je apporter quelque chose de spécifique au rendez-vous?",
        de: "Muss ich etwas Bestimmtes zum Termin mitbringen?",
        delay: 45000
      }
    ];
    
    messages.forEach((msg, index) => {
      setTimeout(() => {
        if (isSessionActive) {
          const message = msg[callerInfo.language as keyof typeof msg] || msg.en;
          const newEntry: TranscriptEntry = {
            type: 'caller',
            message,
            language: callerInfo.language,
            timestamp: new Date().toISOString()
          };
          setTranscript(prev => [...prev, newEntry]);
        }
      }, msg.delay);
    });
  };

  const endSession = async () => {
    console.log('[LiveRelay] Ending session for call:', currentCallId);
    try {
      setIsSessionActive(false);
      
      // Stop call timer
      if (callTimer) {
        clearInterval(callTimer);
        setCallTimer(null);
      }
      
      // Reset state
      setCallDuration(0);
      
      console.log('[LiveRelay] Session ended successfully');
      toast({
        title: 'Session Ended',
        description: 'Live relay session has been terminated',
      });
      
      // Don't clear transcript to allow reviewing the conversation
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

    console.log('[LiveRelay] Sending message:', operatorMessage, 'to language:', targetLanguage);
    setIsTranslating(true);
    try {
      // Translate the message using Lingo API
      const translationResponse = await fetch('/api/lingo-translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: operatorMessage,
          target_language: targetLanguage,
          source_language: sourceLanguage,
        }),
      });

      if (!translationResponse.ok) throw new Error('Failed to translate message');
      
      const translationResult = await translationResponse.json();
      console.log('[LiveRelay] Translation result:', translationResult.translation);

      // Add message to transcript
      setTranscript(prev => [...prev, {
        type: 'operator',
        message: operatorMessage,
        translated_message: translationResult.translation.translated_text,
        language: targetLanguage,
        timestamp: new Date().toISOString(),
      }]);

      // Play audio response if available
      if (translationResult.audio_url && audioRef.current) {
        audioRef.current.src = translationResult.audio_url;
        audioRef.current.play();
      }

      setOperatorMessage('');
      
      console.log('[LiveRelay] Message translated and sent successfully');
      toast({
        title: 'Message Sent',
        description: 'Your message has been translated and spoken to the caller',
      });
      
      // Simulate a response from the caller after a delay
      setTimeout(() => {
        if (isSessionActive) {
          simulateCallerResponse(operatorMessage);
        }
      }, 5000);
    } catch (error) {
      console.error('[LiveRelay] Error translating/sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to translate and send message',
        variant: 'destructive',
      });
    } finally {
      setIsTranslating(false);
    }
  };

  const simulateCallerResponse = (lastMessage: string) => {
    // Generate a contextual response based on the last message
    let response = '';
    const lowerMessage = lastMessage.toLowerCase();
    
    if (lowerMessage.includes('appointment') || lowerMessage.includes('schedule') || lowerMessage.includes('book')) {
      response = "Yes, I would like to book for next Tuesday if possible.";
    } else if (lowerMessage.includes('morning') || lowerMessage.includes('afternoon') || lowerMessage.includes('time')) {
      response = "Morning works best for me, around 10am if available.";
    } else if (lowerMessage.includes('name') || lowerMessage.includes('information')) {
      response = "My name is " + callerInfo.name + " and my phone number is " + callerInfo.phone;
    } else if (lowerMessage.includes('insurance') || lowerMessage.includes('coverage')) {
      response = "I have Blue Cross insurance. Do you accept that?";
    } else if (lowerMessage.includes('thank')) {
      response = "Thank you for your help. I appreciate it.";
    } else {
      response = "I understand. Is there anything else I need to know?";
    }
    
    // Add the response to the transcript
    const newEntry: TranscriptEntry = {
      type: 'caller',
      message: response,
      language: callerInfo.language,
      timestamp: new Date().toISOString()
    };
    
    setTranscript(prev => [...prev, newEntry]);
  };

  const toggleRecording = () => {
    console.log('[LiveRelay] Toggling recording:', !isRecording);
    setIsRecording(!isRecording);
    // In a real implementation, this would start/stop voice recording
    toast({
      title: isRecording ? 'Recording Stopped' : 'Recording Started',
      description: isRecording ? 'Voice input disabled' : 'Speak your message',
    });
    
    // Simulate voice recognition after a delay
    if (!isRecording) {
      setTimeout(() => {
        if (isRecording) {
          const recognizedText = "I can schedule you for next Tuesday at 10am. Does that work for you?";
          setOperatorMessage(recognizedText);
          setIsRecording(false);
        }
      }, 3000);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex-1 space-y-6 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Live Language Relay</h1>
          <p className="text-gray-400 mt-1">Real-time translation for multilingual calls</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchSupportedLanguages} disabled={isLoadingLanguages}>
            <RefreshCw className={`h-4 w-4 ${isLoadingLanguages ? 'animate-spin' : ''}`} />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setCallerInfoOpen(true)} disabled={isSessionActive}>
            <User className="h-4 w-4" />
          </Button>
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

      {isSessionActive && (
        <div className="flex items-center justify-between bg-gray-900/50 rounded-lg p-3 border border-gray-800">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
              <User className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="font-medium">{callerInfo.name}</div>
              <div className="text-sm text-gray-400 flex items-center gap-2">
                <Phone className="h-3 w-3" /> {callerInfo.phone}
                <span className="mx-1">•</span>
                <Globe className="h-3 w-3" /> {languages.find(l => l.code === callerInfo.language)?.name || callerInfo.language}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatTime(callDuration)}
            </Badge>
          </div>
        </div>
      )}

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
              <label className="mb-2 block text-sm font-medium">Your Language</label>
              <Select value={sourceLanguage} onValueChange={setSourceLanguage} disabled={isLoadingLanguages || isSessionActive}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.name} ({lang.native_name})
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
                disabled={!isSessionActive || !operatorMessage.trim() || isTranslating}
                className="flex-1"
              >
                {isTranslating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Translating...
                  </>
                ) : (
                  <>
                    <Globe className="mr-2 h-4 w-4" />
                    Translate & Speak
                  </>
                )}
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
                <motion.div
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="flex items-center justify-center gap-2"
                >
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                  </span>
                  Listening... Speak your message
                </motion.div>
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
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
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
                    {entry.translated_message && entry.translated_message !== entry.message && (
                      <div className="mt-2 p-2 bg-gray-800 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <Globe className="h-3 w-3 text-blue-400" />
                          <span className="text-xs text-blue-400">
                            Translated to {languages.find(l => l.code === entry.language)?.name || entry.language}:
                          </span>
                        </div>
                        <p className="text-sm italic">{entry.translated_message}</p>
                      </div>
                    )}
                  </motion.div>
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
                <li>2. Select your language and the caller's language</li>
                <li>3. Type your message or use voice input</li>
                <li>4. Click "Translate & Speak" to relay to caller</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Features</h4>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>• Real-time language translation</li>
                <li>• Voice synthesis in target language</li>
                <li>• Live transcript with translations</li>
                <li>• Multi-language support</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Caller Info Dialog */}
      <Dialog open={callerInfoOpen} onOpenChange={setCallerInfoOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Caller Information</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium">Caller Name</label>
              <Input
                placeholder="Enter caller name"
                value={callerInfo.name}
                onChange={(e) => setCallerInfo(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Phone Number</label>
              <Input
                placeholder="Enter phone number"
                value={callerInfo.phone}
                onChange={(e) => setCallerInfo(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Caller's Language</label>
              <Select 
                value={callerInfo.language} 
                onValueChange={(value) => setCallerInfo(prev => ({ ...prev, language: value }))}
                disabled={isLoadingLanguages}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.name} ({lang.native_name})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={() => setCallerInfoOpen(false)}>Save</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Hidden audio element for playing TTS responses */}
      <audio ref={audioRef} style={{ display: 'none' }} />
    </div>
  );
}