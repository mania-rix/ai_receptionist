'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Video, Play, Download, Calendar, User, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase-browser';

interface VideoSummary {
  id: string;
  title: string;
  description: string;
  duration: string;
  created_at: string;
  status: 'generating' | 'completed' | 'failed';
  thumbnail_url?: string;
  video_url?: string;
  call_id?: string;
}

export default function VideoSummariesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [videos, setVideos] = useState<VideoSummary[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('[VideoSummaries] Component mounted');
    checkAuthentication();
    fetchVideoSummaries();
  }, []);

  const checkAuthentication = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        console.error('[VideoSummaries] Auth error:', error);
        router.push('/auth/blvckwall');
        return;
      }
      
      if (!user) {
        console.log('[VideoSummaries] No user found, redirecting to auth');
        router.push('/auth/blvckwall');
        return;
      }
      
      setUser(user);
      console.log('[VideoSummaries] User authenticated:', user.id);
    } catch (error) {
      console.error('[VideoSummaries] Error checking authentication:', error);
      router.push('/auth/blvckwall');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchVideoSummaries = () => {
    console.log('[VideoSummaries] Fetching video summaries...');
    // Mock data for demo
    const mockVideos: VideoSummary[] = [
      {
        id: '1',
        title: 'Patient Consultation Summary',
        description: 'Dr. Smith consultation with John Doe regarding treatment options',
        duration: '2:34',
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        status: 'completed',
        thumbnail_url: 'https://images.pexels.com/photos/5327585/pexels-photo-5327585.jpeg?auto=compress&cs=tinysrgb&w=300',
        video_url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
        call_id: 'call_123',
      },
      {
        id: '2',
        title: 'Follow-up Appointment Summary',
        description: 'Follow-up discussion about treatment progress',
        duration: '1:45',
        created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        status: 'completed',
        thumbnail_url: 'https://images.pexels.com/photos/4173251/pexels-photo-4173251.jpeg?auto=compress&cs=tinysrgb&w=300',
        video_url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
        call_id: 'call_124',
      },
      {
        id: '3',
        title: 'Emergency Consultation',
        description: 'Urgent care consultation summary',
        duration: '3:12',
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'generating',
        call_id: 'call_125',
      },
    ];
    
    setVideos(mockVideos);
    console.log('[VideoSummaries] Mock videos loaded:', mockVideos.length);
  };

  const generateVideo = async () => {
    if (!user) {
      console.log('[VideoSummaries] User not authenticated, redirecting');
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to generate video summaries',
        variant: 'destructive',
      });
      router.push('/auth/blvckwall');
      return;
    }

    console.log('[VideoSummaries] Generating video for user:', user.id);
    setIsGenerating(true);
    
    try {
      // Simulate video generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newVideo: VideoSummary = {
        id: Date.now().toString(),
        title: 'New Patient Consultation',
        description: 'AI-generated summary of recent patient call',
        duration: '2:15',
        created_at: new Date().toISOString(),
        status: 'generating',
        call_id: `call_${Date.now()}`,
      };
      
      setVideos(prev => [newVideo, ...prev]);
      
      // Simulate completion after 5 seconds
      setTimeout(() => {
        setVideos(prev => prev.map(video => 
          video.id === newVideo.id 
            ? { 
                ...video, 
                status: 'completed' as const,
                thumbnail_url: 'https://images.pexels.com/photos/5327585/pexels-photo-5327585.jpeg?auto=compress&cs=tinysrgb&w=300',
                video_url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4'
              }
            : video
        ));
      }, 5000);
      
      console.log('[VideoSummaries] Video generation started successfully');
      toast({
        title: 'Video Generation Started',
        description: 'Your video summary is being generated',
      });
    } catch (error) {
      console.error('[VideoSummaries] Error generating video:', error);
      toast({
        title: 'Generation Failed',
        description: 'Failed to generate video summary',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'generating': return 'bg-blue-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Ready';
      case 'generating': return 'Processing';
      case 'failed': return 'Failed';
      default: return 'Unknown';
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 space-y-6 p-8">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex-1 space-y-6 p-8">
        <Card className="border-gray-800 bg-[#121212]">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Video className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">Authentication Required</h3>
            <p className="text-gray-400 text-center mb-4">
              Please sign in to access video summaries
            </p>
            <Button onClick={() => router.push('/auth/blvckwall')}>
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Video Summaries</h1>
        <div className="flex items-center gap-4">
          <Badge variant="outline">Demo Mode</Badge>
          <Button onClick={generateVideo} disabled={isGenerating}>
            {isGenerating ? 'Generating...' : 'Generate New Video'}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {videos.map((video) => (
          <Card key={video.id} className="border-gray-800 bg-[#121212] overflow-hidden">
            <div className="relative">
              {video.thumbnail_url ? (
                <img 
                  src={video.thumbnail_url} 
                  alt={video.title}
                  className="w-full h-48 object-cover"
                />
              ) : (
                <div className="w-full h-48 bg-gray-900 flex items-center justify-center">
                  <Video className="h-12 w-12 text-gray-400" />
                </div>
              )}
              <div className="absolute top-2 right-2">
                <Badge className={`${getStatusColor(video.status)} text-white`}>
                  {getStatusText(video.status)}
                </Badge>
              </div>
              {video.duration && (
                <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                  {video.duration}
                </div>
              )}
            </div>
            
            <CardHeader className="pb-3">
              <CardTitle className="text-lg line-clamp-2">{video.title}</CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-3">
              <p className="text-sm text-gray-400 line-clamp-2">{video.description}</p>
              
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(video.created_at).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  Dr. Smith
                </div>
              </div>
              
              <div className="flex gap-2">
                {video.status === 'completed' && video.video_url && (
                  <>
                    <Button variant="outline" size="sm" className="flex-1" asChild>
                      <a href={video.video_url} target="_blank" rel="noopener noreferrer">
                        <Play className="mr-2 h-3 w-3" />
                        Play
                      </a>
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Download className="mr-2 h-3 w-3" />
                      Download
                    </Button>
                  </>
                )}
                {video.status === 'generating' && (
                  <Button variant="outline" size="sm" className="w-full" disabled>
                    <Clock className="mr-2 h-3 w-3" />
                    Processing...
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {videos.length === 0 && (
        <Card className="border-gray-800 bg-[#121212]">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Video className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">No video summaries yet</h3>
            <p className="text-gray-400 text-center mb-4">
              Generate your first video summary from a patient call
            </p>
            <Button onClick={generateVideo} disabled={isGenerating}>
              Generate Video Summary
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}