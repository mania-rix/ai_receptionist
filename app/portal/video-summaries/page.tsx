'use client';

import { useStorage } from '@/contexts/storage-context';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Video, Play, Download, Calendar, User, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

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
  console.log('[VideoSummaries] Component rendering', { isLoading: useStorage().isLoading });
  const router = useRouter();
  const { videoSummaries, addItem, updateItem, isAuthenticated, currentUser, isLoading } = useStorage();
  
  console.log('[VideoSummaries] Auth state:', { 
    isAuthenticated, 
    isLoading, 
    userEmail: currentUser?.email || 'none',
    hasUser: !!currentUser,
    videoSummariesCount: videoSummaries.length
  });
  
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    console.log('[VideoSummaries] Component mounted');
  }, []);
  
  // Wait for loading to complete before rendering content
  if (isLoading) {
    console.log('[VideoSummaries] Still loading auth state...');
    return (
      <div className="flex-1 space-y-6 p-8">
        <div className="flex items-center justify-center py-12" aria-label="Loading">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500" />
        </div>
      </div>
    );
  }

  const generateVideo = async () => {
    console.log('[VideoSummaries] Generate video clicked, auth state:', { isAuthenticated, userEmail: currentUser?.email });
    if (!isAuthenticated) {
      console.log('[VideoSummaries] User not authenticated, redirecting');
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to generate video summaries',
        variant: 'destructive',
      });
      router.push('/auth/blvckwall');
      return;
    }

    console.log('[VideoSummaries] Generating video');
    setIsGenerating(true);
    
    try {
      // Simulate video generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newVideo: VideoSummary = {
        id: `video_${Date.now()}`,
        title: 'New Patient Consultation',
        description: 'AI-generated summary of recent patient call',
        duration: '2:15',
        created_at: new Date().toISOString(),
        status: 'generating',
        call_id: `call_${Date.now()}`,
      };
      
      await addItem('videoSummaries', newVideo);
      
      // Simulate completion after 5 seconds
      setTimeout(async () => {
        await updateItem('videoSummaries', newVideo.id, {
          status: 'completed',
          thumbnail_url: 'https://images.pexels.com/photos/5327585/pexels-photo-5327585.jpeg?auto=compress&cs=tinysrgb&w=300',
          video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
        });
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


  if (!isAuthenticated) {
    console.log('[VideoSummaries] Rendering unauthenticated state', { isLoading, isAuthenticated });
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
    // Main content when authenticated
    <div className="flex-1 space-y-6 p-8" key="authenticated-content">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Video Summaries ({currentUser?.email})</h1>
        <div className="flex items-center gap-4">
          <Badge variant="outline">Demo Mode</Badge>
          <Button onClick={generateVideo} disabled={isGenerating}>
            {isGenerating ? 'Generating...' : 'Generate New Video'}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {videoSummaries.map((video) => (
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

      {videoSummaries.length === 0 && (
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