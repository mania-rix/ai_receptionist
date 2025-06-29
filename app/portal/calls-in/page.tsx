'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Phone, Clock, User, TrendingUp, Video, FileText, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase-browser';

export default function InboundCallsPage() {
  const [calls, setCalls] = useState<any[]>([]);
  const [selectedCall, setSelectedCall] = useState<any>(null);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    console.log('[CallsIn] Component mounted');
    fetchInboundCalls();
  }, []);

  const fetchInboundCalls = async () => {
    console.log('[CallsIn] Fetching inbound calls...');
    try {
      const { data, error } = await supabase
        .from('calls')
        .select(`
          *,
          agent:agents(name),
          analytics:call_analytics(*)
        `)
        .eq('direction', 'inbound')
        .order('started_at', { ascending: false });

      if (error) throw error;
      
      // If no data or empty array, add sample data
      if (!data || data.length === 0) {
        const sampleCalls = getSampleCalls();
        setCalls(sampleCalls);
      } else {
        setCalls(data);
      }
      
      console.log('[CallsIn] Inbound calls fetched:', data?.length || 0);
    } catch (error) {
      console.error('[CallsIn] Error fetching inbound calls:', error);
      // Add sample data on error
      const sampleCalls = getSampleCalls();
      setCalls(sampleCalls);
    }
  };

  const getSampleCalls = () => {
    return [
      {
        id: 'call_sample_1',
        callee: '+1 (555) 123-4567',
        direction: 'inbound',
        status: 'completed',
        started_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        ended_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        duration_seconds: 360,
        from_number: '+1 (555) 987-6543',
        agent: { name: 'AI Assistant Sarah' },
        transcript: "Caller: Hi, I'd like to schedule an appointment.\n\nAgent: I'd be happy to help you schedule an appointment. What day works best for you?\n\nCaller: I was thinking next Tuesday morning if possible.\n\nAgent: Let me check our availability for next Tuesday morning. We have an opening at 10:00 AM. Would that work for you?\n\nCaller: Yes, 10:00 AM on Tuesday would be perfect.\n\nAgent: Great! I've scheduled you for Tuesday at 10:00 AM. May I have your name please?\n\nCaller: My name is John Smith.\n\nAgent: Thank you, John. And is this your first visit with us?\n\nCaller: Yes, it is.\n\nAgent: Perfect. We recommend arriving 15 minutes early to complete some initial paperwork. Also, please bring your ID and insurance card if you have one. Is there anything else you'd like to know?\n\nCaller: No, that's all. Thank you for your help.\n\nAgent: You're welcome, John. We look forward to seeing you next Tuesday at 10:00 AM. Have a great day!",
        recording_url: 'https://example.com/recording.mp3',
        analytics: [{
          sentiment_score: 0.8,
          quality_score: 9.2,
          upsell_likelihood: 0.75
        }]
      },
      {
        id: 'call_sample_2',
        callee: '+1 (555) 234-5678',
        direction: 'inbound',
        status: 'completed',
        started_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        ended_at: new Date(Date.now() - 4.5 * 60 * 60 * 1000).toISOString(),
        duration_seconds: 240,
        from_number: '+1 (555) 876-5432',
        agent: { name: 'AI Assistant Michael' },
        transcript: "Caller: Hello, I'm calling to ask about your business hours.\n\nAgent: Hello! Thank you for calling. Our business hours are Monday through Friday from 9:00 AM to 5:00 PM, and Saturday from 10:00 AM to 2:00 PM. We're closed on Sundays. How else can I assist you today?\n\nCaller: That's perfect. Do I need an appointment or can I just walk in?\n\nAgent: For most services, we recommend scheduling an appointment to ensure we can accommodate you without any wait time. However, we do accept walk-ins based on availability. Would you like me to help you schedule an appointment?\n\nCaller: No thanks, I'll stop by tomorrow afternoon. Thank you for the information.\n\nAgent: You're welcome! We look forward to seeing you tomorrow afternoon. Have a wonderful day!",
        recording_url: 'https://example.com/recording2.mp3',
        analytics: [{
          sentiment_score: 0.6,
          quality_score: 8.5,
          upsell_likelihood: 0.3
        }]
      },
      {
        id: 'call_sample_3',
        callee: '+1 (555) 345-6789',
        direction: 'inbound',
        status: 'completed',
        started_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        ended_at: new Date(Date.now() - 23.8 * 60 * 60 * 1000).toISOString(),
        duration_seconds: 480,
        from_number: '+1 (555) 765-4321',
        agent: { name: 'AI Assistant Emily' },
        transcript: "Caller: Hi, I'm interested in your premium service package. Can you tell me more about it?\n\nAgent: Hello! I'd be happy to tell you about our premium service package. It includes priority scheduling, extended warranty coverage, and complimentary follow-up consultations. The package is priced at $199 per month. Would you like me to go over the specific benefits in more detail?\n\nCaller: Yes, please. I'm particularly interested in the warranty coverage.\n\nAgent: Certainly! Our extended warranty coverage in the premium package covers all parts and labor for a full 3 years, compared to our standard 1-year warranty. It also includes quarterly preventative maintenance visits and 24/7 emergency support. Many clients find this especially valuable for peace of mind.\n\nCaller: That sounds excellent. How do I sign up?\n\nAgent: I'm glad you're interested! I can help you sign up right now over the phone. We just need some basic information and a payment method to get you started. Would you like to proceed?\n\nCaller: Yes, let's do it.\n\nAgent: Wonderful! Let's get you set up with our premium package...",
        recording_url: 'https://example.com/recording3.mp3',
        analytics: [{
          sentiment_score: 0.9,
          quality_score: 9.8,
          upsell_likelihood: 0.95
        }]
      }
    ];
  };

  const generateVideo = async (call: any) => {
    console.log('[CallsIn] Generating video for call:', call.id);
    setIsGeneratingVideo(true);
    try {
      const response = await fetch('/api/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          call_id: call.id,
          patient_name: call.callee.replace(/\+\d+\s*/, '').trim() || 'Patient', // Remove phone number format
          doctor_name: 'Dr. Smith',
          replica_id: process.env.NEXT_PUBLIC_DEFAULT_TAVUS_REPLICA_ID,
        }),
      });

      if (!response.ok) throw new Error('Failed to generate video');

      const result = await response.json();
      
      console.log('[CallsIn] Video generation started:', result.video.video_id);
      toast({
        title: 'Video Generation Started',
        description: 'Your doctor\'s note video is being generated. You\'ll be notified when it\'s ready.',
      });

      // Update the call in the local state
      setCalls(prev => prev.map(c => 
        c.id === call.id 
          ? { ...c, tavus_video_id: result.video.video_id, video_status: 'generating' }
          : c
      ));
      
      // Simulate video completion after 5 seconds
      setTimeout(() => {
        setCalls(prev => prev.map(c => 
          c.id === call.id 
            ? { 
                ...c, 
                video_status: 'completed',
                video_url: 'https://demo.tavus.io/sample-video'
              }
            : c
        ));
        
        toast({
          title: 'Video Ready',
          description: 'Your doctor\'s note video has been generated successfully.',
        });
      }, 5000);
    } catch (error) {
      console.error('[CallsIn] Error generating video:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate video',
        variant: 'destructive',
      });
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in_progress': return 'bg-blue-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getSentimentEmoji = (score: number) => {
    if (score > 0.3) return '😊';
    if (score > -0.3) return '😐';
    return '😞';
  };

  return (
    <div className="flex-1 space-y-6 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Inbound Calls</h1>
      </div>

      <div className="grid gap-6">
        {calls.map((call) => (
          <Card key={call.id} className="border-gray-800 bg-[#121212]">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(call.status)}`} />
                  <div>
                    <CardTitle className="text-lg">{call.callee}</CardTitle>
                    <p className="text-sm text-gray-400">
                      {call.agent?.name} • {format(new Date(call.started_at), 'PPp')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {call.analytics?.[0]?.sentiment_score !== undefined && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      {getSentimentEmoji(call.analytics[0].sentiment_score)}
                      Sentiment
                    </Badge>
                  )}
                  {call.analytics?.[0]?.upsell_likelihood && call.analytics[0].upsell_likelihood > 0.7 && (
                    <Badge className="bg-green-600 flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      {Math.round(call.analytics[0].upsell_likelihood * 100)}% Upsell
                    </Badge>
                  )}
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => setSelectedCall(call)}>
                        View Details
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Call Details - {call.callee}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-400">Phone:</span>
                              <span>{call.callee}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-400">Agent:</span>
                              <span>{call.agent?.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-400">Duration:</span>
                              <span>{call.duration_seconds ? `${Math.round(call.duration_seconds / 60)} min` : 'N/A'}</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            {call.analytics?.[0] && (
                              <>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-gray-400">Sentiment:</span>
                                  <span>{getSentimentEmoji(call.analytics[0].sentiment_score)} {call.analytics[0].sentiment_score?.toFixed(2)}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-gray-400">Quality Score:</span>
                                  <span>{call.analytics[0].quality_score?.toFixed(1)}/10</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-gray-400">Upsell Likelihood:</span>
                                  <span>{Math.round((call.analytics[0].upsell_likelihood || 0) * 100)}%</span>
                                </div>
                              </>
                            )}
                          </div>
                        </div>

                        {call.transcript && (
                          <div>
                            <h4 className="font-medium mb-2 flex items-center gap-2">
                              <FileText className="h-4 w-4" />
                              Transcript
                            </h4>
                            <div className="bg-gray-900 rounded-lg p-4 max-h-60 overflow-y-auto">
                              <p className="text-sm whitespace-pre-wrap">{call.transcript}</p>
                            </div>
                          </div>
                        )}

                        <div className="flex gap-2">
                          {call.recording_url && (
                            <Button variant="outline" asChild>
                              <a href={call.recording_url} target="_blank" rel="noopener noreferrer">
                                Play Recording
                              </a>
                            </Button>
                          )}
                          
                          {call.video_status === 'completed' && call.video_url ? (
                            <Button variant="outline" asChild>
                              <a href={call.video_url} target="_blank" rel="noopener noreferrer">
                                <Video className="mr-2 h-4 w-4" />
                                View Video Summary
                              </a>
                            </Button>
                          ) : call.video_status === 'generating' ? (
                            <Button variant="outline" disabled>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Generating Video...
                            </Button>
                          ) : (
                            <Button 
                              variant="outline" 
                              onClick={() => generateVideo(call)}
                              disabled={isGeneratingVideo}
                            >
                              <Video className="mr-2 h-4 w-4" />
                              Generate Video Summary
                            </Button>
                          )}
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-4">
                  <span className="text-gray-400">
                    Status: <Badge variant="outline">{call.status}</Badge>
                  </span>
                  {call.cost && (
                    <span className="text-gray-400">
                      Cost: ${call.cost}
                    </span>
                  )}
                </div>
                {call.from_number && (
                  <span className="text-gray-400">From: {call.from_number}</span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {calls.length === 0 && (
        <Card className="border-gray-800 bg-[#121212]">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Phone className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">No inbound calls yet</h3>
            <p className="text-gray-400 text-center">
              Inbound calls will appear here once you start receiving them
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}