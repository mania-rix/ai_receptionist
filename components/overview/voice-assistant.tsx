'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Send, Volume2, Brain, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface VoiceCommand {
  id: string;
  query: string;
  response: string;
  timestamp: string;
  type: 'voice' | 'text';
  audio_url?: string;
}

export function VoiceAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [textQuery, setTextQuery] = useState('');
  const [commands, setCommands] = useState<VoiceCommand[]>([]);
  const { toast } = useToast();
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    console.log('[VoiceAssistant] Component mounted');
    return () => {
      console.log('[VoiceAssistant] Component unmounted');
    };
  }, []);

  const handleVoiceToggle = () => {
    console.log('[VoiceAssistant] Toggling voice recording:', !isRecording);
    setIsRecording(!isRecording);
    
    if (!isRecording) {
      // Start recording
      toast({
        title: 'Listening...',
        description: 'Speak your command or question',
      });
      
      // Simulate recording for demo
      setTimeout(() => {
        setIsRecording(false);
        processVoiceCommand('How many calls did we have today?');
      }, 3000);
    }
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textQuery.trim()) return;
    
    console.log('[VoiceAssistant] Processing text query:', textQuery);
    processVoiceCommand(textQuery);
    setTextQuery('');
  };

  const processVoiceCommand = async (query: string) => {
    console.log('[VoiceAssistant] Processing command:', query);
    setIsProcessing(true);
    
    try {
      const response = await fetch('/api/voice-analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ question: query }),
      });

      if (!response.ok) {
      const text = await response.text().catch(() => null);
      console.error('[VoiceAssistant] Server returned non-OK:', response.status, text);
      throw new Error(`Failed to process command: ${response.status} - ${text || "No body"}`);
    }


      const result = await response.json();
      
      // Create audio URL if available
      let audioUrl;
      if (result.audio_data) {
        audioUrl = `data:audio/mpeg;base64,${result.audio_data}`;
      }
      
      const newCommand: VoiceCommand = {
        id: Date.now().toString(),
        query,
        response: result.response || 'I processed your request.',
        timestamp: new Date().toISOString(),
        type: isRecording ? 'voice' : 'text',
        audio_url: audioUrl
      };

      setCommands(prev => [newCommand, ...prev.slice(0, 4)]);
      
      // Play audio if available
      if (audioUrl && audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.play();
      }
      
      console.log('[VoiceAssistant] Command processed successfully');
      toast({
        title: 'Command Processed',
        description: 'Your request has been completed',
      });
    } catch (error) {
      console.error('[VoiceAssistant] Error processing command:', error);
      toast({
        title: 'Error',
        description: 'Failed to process your command',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const speakResponse = (text: string) => {
    console.log('[VoiceAssistant] Speaking response');
    // In a real implementation, this would use text-to-speech
    // For now, we'll just show a visual indicator
    toast({
      title: 'Speaking Response',
      description: 'Audio response would play here',
    });
  };

  const playResponse = (command: VoiceCommand) => {
    console.log('[VoiceAssistant] Playing response for command:', command.id);
    
    if (command.audio_url && audioRef.current) {
      audioRef.current.src = command.audio_url;
      audioRef.current.play();
    } else {
      // Fallback for commands without audio
      toast({
        title: 'Playing Response',
        description: 'Audio response would play here',
      });
    }
  };

  return (
    <>
      <Card className="border-gray-800 bg-[#121212] cursor-pointer hover:bg-gray-900/50 transition-colors" onClick={() => setIsOpen(true)}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative"
            >
              <div className="p-4 rounded-full bg-gradient-to-r from-purple-600 to-blue-600">
                <Brain className="h-8 w-8 text-white" />
              </div>
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-purple-400"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.div>
          </div>
          <div className="text-center mt-4">
            <h3 className="font-medium">Voice Assistant</h3>
            <p className="text-sm text-gray-400 mt-1">Ask me anything about your data</p>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-400" />
              AI Voice Assistant
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Voice/Text Input */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Button
                  onClick={handleVoiceToggle}
                  disabled={isProcessing}
                  className={`flex-1 ${isRecording ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                >
                  {isRecording ? (
                    <>
                      <MicOff className="mr-2 h-4 w-4" />
                      Stop Recording
                    </>
                  ) : (
                    <>
                      <Mic className="mr-2 h-4 w-4" />
                      Start Voice Command
                    </>
                  )}
                </Button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-700" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-[#1A1A1A] px-2 text-gray-400">or</span>
                </div>
              </div>

              <form onSubmit={handleTextSubmit} className="flex gap-2">
                <Input
                  value={textQuery}
                  onChange={(e) => setTextQuery(e.target.value)}
                  placeholder="Type your question here..."
                  disabled={isProcessing}
                  className="flex-1"
                />
                <Button type="submit" disabled={!textQuery.trim() || isProcessing}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>

              {isRecording && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center text-sm text-gray-400 py-2"
                >
                  🎤 Listening... Speak your question
                </motion.div>
              )}

              {isProcessing && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center text-sm text-gray-400 py-2"
                >
                  🧠 Processing your request...
                </motion.div>
              )}
            </div>

            {/* Command History */}
            <div className="space-y-4 max-h-60 overflow-y-auto">
              <h4 className="font-medium text-sm">Recent Commands</h4>
              <AnimatePresence>
                {commands.map((command) => (
                  <motion.div
                    key={command.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-2 p-3 bg-gray-900 rounded-lg"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {command.type === 'voice' ? '🎤 Voice' : '💬 Text'}
                        </Badge>
                        <span className="text-xs text-gray-400">
                          {new Date(command.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => playResponse(command)}
                        className="h-6 w-6 p-0"
                      >
                        <Volume2 className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="text-sm">
                      <div className="font-medium">Q: {command.query}</div>
                      <div className="text-gray-400 mt-1">A: {command.response}</div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {commands.length === 0 && (
                <div className="text-center text-gray-400 py-8">
                  <Brain className="h-8 w-8 mx-auto mb-2" />
                  <p className="text-sm">No commands yet. Try asking something!</p>
                  <p className="text-xs mt-1">Example: "How many calls did we have today?"</p>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <audio ref={audioRef} style={{ display: 'none' }} />
    </>
  );
}