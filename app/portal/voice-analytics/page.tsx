'use client';

import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Send, Volume2, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

export default function VoiceAnalyticsPage() {
  const [isRecording, setIsRecording] = useState(false);
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastResponse, setLastResponse] = useState<any>(null);
  const { toast } = useToast();
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    console.log('[VoiceAnalyticsUI] Component mounted');
    return () => {
      console.log('[VoiceAnalyticsUI] Component unmounted');
    };
  }, []);
  const commonQuestions = [
    "How many calls did we have today?",
    "What's our compliance rate this month?",
    "How many unhappy patients called last week?",
    "What's our revenue from AI calls?",
    "Show me the top performing agents",
    "How many events do we have scheduled?",
  ];

  const toggleRecording = () => {
    console.log('[VoiceAnalyticsUI] Toggling recording:', !isRecording);
    setIsRecording(!isRecording);
    // In a real implementation, this would start/stop voice recording
    toast({
      title: isRecording ? 'Recording Stopped' : 'Recording Started',
      description: isRecording ? 'Voice input disabled' : 'Ask your analytics question',
    });
  };

  const askQuestion = async (questionText?: string) => {
    const queryText = questionText || question;
    if (!queryText.trim()) return;

    console.log('[VoiceAnalyticsUI] Asking question:', queryText);
    setIsLoading(true);
    try {
      const response = await fetch('/api/voice-analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: queryText,
          // audio_data would be included for voice queries
        }),
      });

      if (!response.ok) throw new Error('Failed to process question');

      const result = await response.json();
      setLastResponse(result);
      setQuestion('');
      
      console.log('[VoiceAnalyticsUI] Question processed successfully:', result);
      // In a real implementation, this would play the TTS response
      toast({
        title: 'Query Processed',
        description: 'Your analytics question has been answered',
      });
    } catch (error) {
      console.error('[VoiceAnalyticsUI] Error processing question:', error);
      toast({
        title: 'Error',
        description: 'Failed to process your question',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const playResponse = () => {
    console.log('[VoiceAnalyticsUI] Playing response');
    // In a real implementation, this would play the TTS audio response
    toast({
      title: 'Playing Response',
      description: 'Audio response would play here',
    });
  };

  return (
    <div className="flex-1 space-y-6 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Voice Analytics Assistant</h1>
        <Badge variant="outline" className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          AI-Powered Insights
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Query Interface */}
        <Card className="border-gray-800 bg-[#121212]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mic className="h-5 w-5" />
              Ask Your Question
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Ask about your analytics data..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && askQuestion()}
                className="flex-1"
              />
              <Button
                onClick={toggleRecording}
                variant={isRecording ? 'destructive' : 'outline'}
              >
                {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
              <Button
                onClick={() => askQuestion()}
                disabled={!question.trim() || isLoading}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>

            {isRecording && (
              <div className="text-center text-sm text-gray-400 py-2">
                🎤 Listening... Ask your analytics question
              </div>
            )}

            <div>
              <h4 className="text-sm font-medium mb-2">Quick Questions</h4>
              <div className="grid gap-2">
                {commonQuestions.map((q, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    onClick={() => askQuestion(q)}
                    className="justify-start text-left h-auto py-2 px-3"
                    disabled={isLoading}
                  >
                    {q}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Response Display */}
        <Card className="border-gray-800 bg-[#121212]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Volume2 className="h-5 w-5" />
              AI Response
            </CardTitle>
          </CardHeader>
          <CardContent>
            {lastResponse ? (
              <div className="space-y-4">
                <div className="p-3 bg-gray-900 rounded-lg">
                  <div className="text-sm text-gray-400 mb-1">Question:</div>
                  <div className="font-medium">{lastResponse.question}</div>
                </div>
                
                <div className="p-3 bg-blue-950/50 rounded-lg border-l-4 border-blue-500">
                  <div className="text-sm text-gray-400 mb-1">Answer:</div>
                  <div>{lastResponse.response}</div>
                </div>

                {lastResponse.data && (
                  <div className="p-3 bg-gray-900 rounded-lg">
                    <div className="text-sm text-gray-400 mb-2">Data:</div>
                    <pre className="text-xs overflow-auto">
                      {JSON.stringify(lastResponse.data, null, 2)}
                    </pre>
                  </div>
                )}

                <Button onClick={playResponse} variant="outline" className="w-full">
                  <Volume2 className="mr-2 h-4 w-4" />
                  Play Audio Response
                </Button>
              </div>
            ) : (
              <div className="text-center text-gray-400 py-8">
                <BarChart3 className="h-12 w-12 mx-auto mb-4" />
                <p>Ask a question to get AI-powered analytics insights</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Analytics Visualization */}
      {lastResponse?.data && (
        <Card className="border-gray-800 bg-[#121212]">
          <CardHeader>
            <CardTitle>Data Visualization</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {Object.entries(lastResponse.data).map(([key, value]) => (
                <div key={key} className="text-center p-4 bg-gray-900 rounded-lg">
                  <div className="text-2xl font-bold text-blue-400">
                    {typeof value === 'number' ? value : String(value)}
                  </div>
                  <div className="text-sm text-gray-400 capitalize">
                    {key.replace(/_/g, ' ')}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card className="border-gray-800 bg-[#121212]">
        <CardHeader>
          <CardTitle>How to Use Voice Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-medium mb-2">Voice Queries</h4>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>• Click the microphone to start voice input</li>
                <li>• Speak naturally about your data questions</li>
                <li>• AI will process and respond with insights</li>
                <li>• Listen to audio responses for hands-free operation</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Example Questions</h4>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>• &quot;How many calls happened today?&quot;</li>
                <li>• &quot;What&#39;s our patient satisfaction rate?&quot;</li>
                <li>• &quot;Show me revenue trends this month&quot;</li>
                <li>• &quot;Which agents need more training?&quot;</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hidden audio element for playing responses */}
      <audio ref={audioRef} style={{ display: 'none' }} />
    </div>
  );
}