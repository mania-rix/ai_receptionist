'use client';

import { v4 as uuidv4 } from "uuid";
import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useDemoMode } from '@/contexts/demo-mode-context';
import { Phone, Loader2, X, Mic, MicOff, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase-browser';
import { motion, AnimatePresence } from 'framer-motion';
import { elevenLabsAPI } from '@/lib/elevenlabs';

type FormData = {
  agentId: string;
  phoneNumber: string;
};

interface Message {
  id: string;
  text: string;
  sender: 'agent' | 'user';
  timestamp: Date;
}

export default function OutboundCallsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [agents, setAgents] = useState<any[]>([]);
  const [isCallActive, setIsCallActive] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [callTimer, setCallTimer] = useState<NodeJS.Timeout | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<any>(null);
  const [isRinging, setIsRinging] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const { isDemoMode } = useDemoMode();
  const { toast } = useToast();
  const form = useForm<FormData>();
  const audioRef = useRef<HTMLAudioElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log('[CallsOut] Component mounted');
    fetchAgents();
    
    return () => {
      console.log('[CallsOut] Component unmounted');
      if (callTimer) {
        clearInterval(callTimer);
      }
      if (currentAudio) {
        currentAudio.pause();
      }
    };
  }, []);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchAgents = async () => {
    console.log('[CallsOut] Fetching agents...');
    try {
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .order('name');

      if (error) {
        console.error('[CallsOut] Error fetching agents:', error);
        toast({
          title: 'Error',
          description: 'Failed to load agents',
          variant: 'destructive',
        });
        return;
      }

      setAgents(data || []);
      console.log('[CallsOut] Agents fetched:', data?.length || 0);
    } catch (error) {
      console.error('[CallsOut] Error fetching agents:', error);
    }
  };

  const startCall = async (data: FormData) => {
    console.log('[CallsOut] Starting call with data:', data);
    setIsLoading(true);

    try {
      const agent = agents.find((a) => a.id === data.agentId);
      if (!agent) throw new Error('Agent not found');
      setSelectedAgent(agent);

      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user || { id: 'demo-user-id', email: 'demo@blvckwall.ai' };
      if (!user) throw new Error('Not authenticated');

      // Simulate ringing
      setIsRinging(true);
      await new Promise(resolve => setTimeout(resolve, 3000));
      setIsRinging(false);

      // Start the call using the API
      const response = await fetch('/api/start-call', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agent_id: data.agentId,
          phone_number: data.phoneNumber,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to start call');
      }

      const callData = await response.json();
      console.log('[CallsOut] Call started:', callData);

      // Start the call
      setIsCallActive(true);

      // Start call timer
      const timer = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
      setCallTimer(timer);

      // Add initial greeting message
      const initialMessage: Message = {
        id: uuidv4(),
        text: agent.greeting || `Hello, this is ${agent.name}. How can I help you today?`,
        sender: 'agent',
        timestamp: new Date()
      };
      setMessages([initialMessage]);

      // Play greeting audio
      playAgentMessage(initialMessage.text);

      // Add a demo call to the activity feed
      try {
        await supabase.from('activity_feed').insert([{
          user_id: user.id,
          activity_type: 'call_started',
          title: 'Outbound call initiated',
          description: `Call to ${data.phoneNumber} started successfully`,
          metadata: {
            agent_id: data.agentId,
            agent_name: agent.name,
            phone_number: data.phoneNumber,
            demo: true
          },
          is_read: false
        }]);
      } catch (feedError) {
        console.error('[CallsOut] Error adding to activity feed:', feedError);
      }
      
      console.log('[CallsOut] Call started successfully');
      toast({
        title: 'Call Connected',
        description: `Connected to ${data.phoneNumber}`,
      });
      
      // Schedule some simulated user responses
      scheduleUserResponses();
    } catch (error) {
      console.error('[CallsOut] Error starting call:', error);
      setIsRinging(false);
      toast({
        title: 'Error',
        description: 'Failed to start call',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const scheduleUserResponses = () => {
    // Schedule some simulated user responses
    const responses = [
      {
        text: "Hi there, I'd like to schedule an appointment for next week.",
        delay: 8000
      },
      {
        text: "I'm available on Tuesday or Wednesday morning.",
        delay: 20000
      },
      {
        text: "Yes, 10am on Tuesday would be perfect. My name is Sarah Johnson.",
        delay: 35000
      },
      {
        text: "My phone number is the one I'm calling from. Do I need to bring anything specific?",
        delay: 50000
      },
      {
        text: "Great, thank you for your help. I'll see you on Tuesday at 10am.",
        delay: 65000
      }
    ];
    
    responses.forEach((response, index) => {
      setTimeout(() => {
        if (isCallActive) {
          const userMessage: Message = {
            id: uuidv4(),
            text: response.text,
            sender: 'user',
            timestamp: new Date()
          };
          setMessages(prev => [...prev, userMessage]);
          
          // Schedule agent response
          setTimeout(() => {
            if (isCallActive) {
              respondToUserMessage(response.text, index);
            }
          }, 3000);
        }
      }, response.delay);
    });
  };

  const respondToUserMessage = (userMessage: string, messageIndex: number) => {
    let agentResponse = "";
    
    // Generate contextual response based on user message and conversation stage
    if (messageIndex === 0) {
      agentResponse = `I'd be happy to help you schedule an appointment. What days work best for you?`;
    } else if (messageIndex === 1) {
      agentResponse = `We have availability on Tuesday at 10am or Wednesday at 9am. Would either of those work for you?`;
    } else if (messageIndex === 2) {
      agentResponse = `Perfect! I've scheduled you for Tuesday at 10am. May I have your name for the appointment?`;
    } else if (messageIndex === 3) {
      agentResponse = `Thank you, Sarah. Please bring your insurance card and any relevant medical records. Is there anything else you'd like to know?`;
    } else if (messageIndex === 4) {
      agentResponse = `You're welcome! We look forward to seeing you on Tuesday at 10am. Have a great day!`;
      
      // End call after final message
      setTimeout(() => {
        endCall();
      }, 5000);
    } else {
      agentResponse = `I understand. Is there anything else I can help you with today?`;
    }
    
    const agentMessage: Message = {
      id: uuidv4(),
      text: agentResponse,
      sender: 'agent',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, agentMessage]);
    playAgentMessage(agentResponse);
  };

  const playAgentMessage = async (text: string) => {
    try {
      // In a real implementation, this would use ElevenLabs TTS API
      // For demo, we'll use browser's built-in speech synthesis
      if (audioRef.current) {
        if (currentAudio) {
          currentAudio.pause();
        }
        
        // Create a new SpeechSynthesisUtterance
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;
        
        // Get available voices and set a good one
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(voice => 
          voice.name.includes('Google') || voice.name.includes('Female') || voice.name.includes('Samantha')
        );
        
        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }
        
        // Play the speech
        setAudioPlaying(true);
        window.speechSynthesis.speak(utterance);
        
        // Set event handlers
        utterance.onend = () => {
          setAudioPlaying(false);
        };
        
        utterance.onerror = () => {
          console.error('[CallsOut] Speech synthesis error');
          setAudioPlaying(false);
        };
      }
    } catch (error) {
      console.error('[CallsOut] Error playing agent message:', error);
      setAudioPlaying(false);
    }
  };

  const endCall = () => {
    console.log('[CallsOut] Ending call');
    
    // Stop the timer
    if (callTimer) {
      clearInterval(callTimer);
      setCallTimer(null);
    }
    
    // Stop any playing audio
    if (currentAudio) {
      currentAudio.pause();
      setCurrentAudio(null);
    }
    
    window.speechSynthesis.cancel();
    
    // Reset call state
    setIsCallActive(false);
    setCallDuration(0);
    
    // Add final message
    const finalMessage: Message = {
      id: uuidv4(),
      text: "Call ended.",
      sender: 'agent',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, finalMessage]);
    
    toast({
      title: 'Call Ended',
      description: 'The call has been disconnected',
    });
    
    // Update call status in Supabase
    updateCallStatus('completed');
  };

  const updateCallStatus = async (status: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      // Get the most recent call for this user
      const { data, error } = await supabase
        .from('calls')
        .select('*')
        .eq('user_id', user.id)
        .eq('direction', 'outbound')
        .order('created_at', { ascending: false })
        .limit(1);
        
      if (error || !data || data.length === 0) {
        console.error('[CallsOut] Error fetching call to update:', error);
        return;
      }
      
      // Update the call status
      const { error: updateError } = await supabase
        .from('calls')
        .update({
          status,
          ended_at: new Date().toISOString(),
          duration_seconds: callDuration
        })
        .eq('id', data[0].id);
        
      if (updateError) {
        console.error('[CallsOut] Error updating call status:', updateError);
      }
    } catch (error) {
      console.error('[CallsOut] Error updating call status:', error);
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
        <h1 className="text-3xl font-bold tracking-tight">Outbound Calls</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Call Form */}
        <div>
          <form onSubmit={form.handleSubmit(startCall)} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Agent</label>
              <Select
                onValueChange={(value) => form.setValue('agentId', value)}
                defaultValue={form.getValues('agentId')}
                disabled={isCallActive || isRinging}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose an agent" />
                </SelectTrigger>
                <SelectContent>
                  {agents.map((agent) => (
                    <SelectItem key={agent.id} value={agent.id}>
                      {agent.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Phone Number</label>
              <Input
                placeholder="+1234567890"
                {...form.register('phoneNumber', {
                  required: true,
                  pattern: /^\+?[1-9]\d{1,14}$/,
                })}
                disabled={isCallActive || isRinging}
              />
              <p className="text-xs text-gray-500">
                Enter phone number in E.164 format (e.g., +1234567890)
              </p>
            </div>

            <Button
              type="submit"
              disabled={isLoading || isCallActive || isRinging}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Starting Call...
                </>
              ) : isRinging ? (
                <>
                  <span className="mr-2 relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                  </span>
                  Ringing...
                </>
              ) : (
                <>
                  <Phone className="mr-2 h-4 w-4" />
                  Start AI Call
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Call Interface */}
        <AnimatePresence>
          {(isCallActive || isRinging) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden flex flex-col"
            >
              {/* Call Header */}
              <div className="bg-gray-800 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                    <Phone className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="font-medium">{form.getValues('phoneNumber')}</div>
                    <div className="text-sm text-gray-400 flex items-center gap-2">
                      {isRinging ? (
                        <span className="flex items-center gap-1">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                          </span>
                          Ringing...
                        </span>
                      ) : (
                        <>
                          <span className="flex items-center gap-1">
                            <span className="h-2 w-2 rounded-full bg-green-500"></span>
                            Connected
                          </span>
                          <span className="mx-1">•</span>
                          <span>{formatTime(callDuration)}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={endCall}
                  disabled={isRinging}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Call Content */}
              <div className="flex-1 p-4 overflow-y-auto max-h-[400px]">
                {isRinging ? (
                  <div className="flex flex-col items-center justify-center h-full">
                    <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mb-4">
                      <Phone className="h-8 w-8 text-gray-400" />
                    </div>
                    <p className="text-gray-400">Calling {form.getValues('phoneNumber')}...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender === 'agent' ? 'justify-start' : 'justify-end'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg p-3 ${
                            message.sender === 'agent'
                              ? 'bg-gray-800 text-white'
                              : 'bg-blue-600 text-white'
                          }`}
                        >
                          <p>{message.text}</p>
                          <div className="text-xs text-gray-400 mt-1">
                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* Call Controls */}
              <div className="bg-gray-800 p-4 flex items-center justify-center gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full h-10 w-10"
                  disabled={isRinging}
                >
                  <MicOff className="h-5 w-5" />
                </Button>
                <Button
                  variant="destructive"
                  className="rounded-full h-12 w-12 flex items-center justify-center"
                  onClick={endCall}
                  disabled={isRinging}
                >
                  <Phone className="h-6 w-6 rotate-135" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className={`rounded-full h-10 w-10 ${
                    audioPlaying ? 'bg-blue-600 text-white border-blue-600' : ''
                  }`}
                  disabled={isRinging}
                >
                  <Volume2 className="h-5 w-5" />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Hidden audio element for playing TTS responses */}
      <audio ref={audioRef} style={{ display: 'none' }} />
    </div>
  );
}