'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Video, Play, Download, Share2, QrCode, Settings, Loader2, FileVideo, User, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase-browser';
import { tavusAPI } from '@/lib/tavus';
import { recordVideoAudit } from '@/lib/algorand';

interface VideoSummary {
  id: string;
  call_id: string;
  patient_name: string;
  doctor_name: string;
  video_url?: string;
  status: 'generating' | 'completed' | 'failed';
  created_at: string;
  qr_code_url?: string;
  share_url?: string;
}

export default function VideoSummariesPage() {
  const [videos, setVideos] = useState<VideoSummary[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [open, setOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [selectedCall, setSelectedCall] = useState('');
  const [patientName, setPatientName] = useState('');
  const [doctorName, setDoctorName] = useState('Dr. Smith');
  const [customScript, setCustomScript] = useState('');
  const [template, setTemplate] = useState('medical');
  const [brandColor, setBrandColor] = useState('#6366f1');
  const { toast } = useToast();

  useEffect(() => {
    console.log('[VideoSummaries] Component mounted');
    fetchVideoSummaries();
    loadDemoData();
  }, []);

  const fetchVideoSummaries = async () => {
    console.log('[VideoSummaries] Fetching video summaries...');
    try {
      const { data, error } = await supabase
        .from('calls')
        .select('*')
        .not('tavus_video_id', 'is', null)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const videoData = data?.map(call => ({
        id: call.tavus_video_id || call.id,
        call_id: call.id,
        patient_name: call.callee || 'Patient',
        doctor_name: 'Dr. Smith',
        video_url: call.video_url,
        status: call.video_status || 'completed',
        created_at: call.created_at,
        qr_code_url: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(call.video_url || 'https://demo.tavus.io')}`,
        share_url: call.video_url || 'https://demo.tavus.io'
      })) || [];

      setVideos(videoData);
      console.log('[VideoSummaries] Video summaries fetched:', videoData.length);
    } catch (error) {
      console.error('[VideoSummaries] Error fetching video summaries:', error);
    }
  };

  const loadDemoData = () => {
    console.log('[VideoSummaries] Loading demo data...');
    const demoVideos: VideoSummary[] = [
      {
        id: 'demo_video_1',
        call_id: 'demo_call_1',
        patient_name: 'Sarah Johnson',
        doctor_name: 'Dr. Smith',
        video_url: 'https://tavusapi.com/v2/videos/demo1',
        status: 'completed',
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        qr_code_url: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://tavusapi.com/v2/videos/demo1',
        share_url: 'https://tavusapi.com/v2/videos/demo1'
      },
      {
        id: 'demo_video_2',
        call_id: 'demo_call_2',
        patient_name: 'Michael Chen',
        doctor_name: 'Dr. Rodriguez',
        video_url: 'https://tavusapi.com/v2/videos/demo2',
        status: 'completed',
        created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        qr_code_url: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://tavusapi.com/v2/videos/demo2',
        share_url: 'https://tavusapi.com/v2/videos/demo2'
      }
    ];

    setVideos(prev => [...demoVideos, ...prev]);
  };

  const generateVideo = async () => {
    if (!patientName.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a patient name',
        variant: 'destructive',
      });
      return;
    }

    console.log('[VideoSummaries] Generating video for:', patientName);
    setIsGenerating(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Create mock appointment summary
      const appointmentSummary = customScript || 
        `Hello ${patientName}, this is ${doctorName}. Thank you for your recent appointment with us. 
        We discussed your treatment options and provided recommendations for your care. 
        Please follow the instructions we provided and don't hesitate to contact us if you have any questions.
        We look forward to seeing you at your next appointment.`;

      // Generate video using Tavus API (demo mode)
      const video = await tavusAPI.generateVideo({
        replica_id: process.env.NEXT_PUBLIC_DEFAULT_TAVUS_REPLICA_ID || 'demo_replica',
        script: appointmentSummary,
        callback_url: `${window.location.origin}/api/tavus/webhook`,
      });

      // Create new video entry
      const newVideo: VideoSummary = {
        id: video.video_id,
        call_id: selectedCall || `demo_call_${Date.now()}`,
        patient_name: patientName,
        doctor_name: doctorName,
        video_url: video.video_url,
        status: 'generating',
        created_at: new Date().toISOString(),
        qr_code_url: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(video.video_url || 'https://demo.tavus.io')}`,
        share_url: video.video_url || 'https://demo.tavus.io'
      };

      setVideos(prev => [newVideo, ...prev]);

      // Record audit log on blockchain
      await recordVideoAudit(video.video_id, user.id, {
        patient_name: patientName,
        doctor_name: doctorName,
        template,
        brand_color: brandColor
      });

      // Simulate video completion after 5 seconds
      setTimeout(() => {
        setVideos(prev => prev.map(v => 
          v.id === video.video_id 
            ? { ...v, status: 'completed', video_url: 'https://demo.tavus.io/sample-video' }
            : v
        ));
      }, 5000);

      setOpen(false);
      setPatientName('');
      setCustomScript('');
      
      console.log('[VideoSummaries] Video generation started:', video.video_id);
      toast({
        title: 'Video Generation Started',
        description: `Creating personalized video for ${patientName}`,
      });
    } catch (error) {
      console.error('[VideoSummaries] Error generating video:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate video',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const shareVideo = async (video: VideoSummary) => {
    console.log('[VideoSummaries] Sharing video:', video.id);
    try {
      await navigator.share({
        title: `Doctor's Note for ${video.patient_name}`,
        text: `Personalized video summary from ${video.doctor_name}`,
        url: video.share_url,
      });
    } catch (error) {
      // Fallback to clipboard
      await navigator.clipboard.writeText(video.share_url || '');
      toast({
        title: 'Link Copied',
        description: 'Video link copied to clipboard',
      });
    }
  };

  const downloadQR = (video: VideoSummary) => {
    console.log('[VideoSummaries] Downloading QR code for:', video.id);
    const link = document.createElement('a');
    link.href = video.qr_code_url || '';
    link.download = `qr-code-${video.patient_name.replace(/\s+/g, '-')}.png`;
    link.click();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'generating': return 'bg-blue-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="flex-1 space-y-6 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Video Summaries</h1>
          <p className="text-gray-400 mt-1">AI-generated doctor's notes powered by Tavus</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Video Settings</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium">Template</label>
                  <Select value={template} onValueChange={setTemplate}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="medical">Medical Professional</SelectItem>
                      <SelectItem value="dental">Dental Practice</SelectItem>
                      <SelectItem value="therapy">Therapy Session</SelectItem>
                      <SelectItem value="consultation">General Consultation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">Brand Color</label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={brandColor}
                      onChange={(e) => setBrandColor(e.target.value)}
                      className="w-16 h-10"
                    />
                    <Input
                      value={brandColor}
                      onChange={(e) => setBrandColor(e.target.value)}
                      placeholder="#6366f1"
                    />
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Video className="mr-2 h-4 w-4" />
                Generate Video
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Generate Doctor's Note Video</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium">Patient Name</label>
                    <Input
                      placeholder="Enter patient name"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium">Doctor Name</label>
                    <Input
                      placeholder="Dr. Smith"
                      value={doctorName}
                      onChange={(e) => setDoctorName(e.target.value)}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="mb-2 block text-sm font-medium">Custom Script (Optional)</label>
                  <Textarea
                    placeholder="Enter custom message or leave blank for auto-generated content..."
                    value={customScript}
                    onChange={(e) => setCustomScript(e.target.value)}
                    rows={4}
                  />
                </div>

                <div className="bg-blue-950/20 border border-blue-500/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FileVideo className="h-4 w-4 text-blue-400" />
                    <span className="text-sm font-medium text-blue-400">Demo Mode</span>
                  </div>
                  <p className="text-xs text-gray-400">
                    This will generate a demo video using Tavus API. In production, this would create a personalized video with your replica.
                  </p>
                </div>

                <Button 
                  onClick={generateVideo} 
                  disabled={isGenerating || !patientName.trim()}
                  className="w-full"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating Video...
                    </>
                  ) : (
                    <>
                      <Video className="mr-2 h-4 w-4" />
                      Generate Video
                    </>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {videos.map((video) => (
          <motion.div
            key={video.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="group"
          >
            <Card className="border-gray-800 bg-[#121212] hover:bg-gray-900/50 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(video.status)}`} />
                    <CardTitle className="text-lg">{video.patient_name}</CardTitle>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {video.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <span>{video.doctor_name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span>{new Date(video.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                {video.status === 'generating' && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-blue-400">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generating video...
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2">
                      <motion.div 
                        className="bg-blue-600 h-2 rounded-full" 
                        initial={{ width: '0%' }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 5, ease: 'easeInOut' }}
                      />
                    </div>
                  </div>
                )}

                {video.status === 'completed' && (
                  <div className="space-y-3">
                    <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center border border-gray-700">
                      <div className="text-center">
                        <Play className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-xs text-gray-400">Video Preview</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => window.open(video.video_url, '_blank')}
                        className="flex-1"
                      >
                        <Play className="mr-2 h-3 w-3" />
                        Play
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => shareVideo(video)}
                      >
                        <Share2 className="h-3 w-3" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => downloadQR(video)}
                      >
                        <QrCode className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )}

                {video.status === 'failed' && (
                  <div className="text-center py-4">
                    <p className="text-sm text-red-400">Video generation failed</p>
                    <Button variant="outline" size="sm" className="mt-2">
                      Retry
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {videos.length === 0 && (
        <Card className="border-gray-800 bg-[#121212]">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Video className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">No video summaries yet</h3>
            <p className="text-gray-400 text-center mb-4">
              Generate personalized doctor's note videos for your patients
            </p>
            <Button onClick={() => setOpen(true)}>
              <Video className="mr-2 h-4 w-4" />
              Generate First Video
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}