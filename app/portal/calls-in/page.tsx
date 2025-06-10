'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Phone, Clock, User, TrendingUp, Video, FileText } from 'lucide-react';
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
      setCalls(data || []);
      console.log('[CallsIn] Inbound calls fetched:', data?.length || 0);
    } catch (error) {
      console.error('[CallsIn] Error fetching inbound calls:', error);
    }
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
          patient_name: 'Patient', // You might want to extract this from the call
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
                  {call.analytics?.[0]?.sentiment_score && (
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
                        onClick={() => console.log('something')}
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
                            <Button variant="outline\" asChild>
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
                              <Video className="mr-2 h-4 w-4" />
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