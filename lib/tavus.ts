// Tavus API integration for video generation
const TAVUS_API_BASE = 'https://tavusapi.com';

export interface TavusVideo {
  video_id: string;
  video_url: string;
  status: 'queued' | 'generating' | 'completed' | 'failed';
  created_at: string;
}

export interface TavusReplica {
  replica_id: string;
  name: string;
  status: string;
}

class TavusAPI {
  private apiKey: string;
  private demoMode: boolean;

  constructor() {
    this.apiKey = process.env.TAVUS_API_KEY || '';
    this.demoMode = !this.apiKey;
    if (this.demoMode) {
      console.warn('[TavusLib] TAVUS_API_KEY not found - using demo mode');
    }
    console.log('[TavusLib] Tavus API initialized');
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    console.log('[TavusLib] Making request to:', endpoint);
    
    // Demo mode - return mock data if no API key
    if (this.demoMode) {
      return this.getMockResponse(endpoint, options);
    }

    const url = `${TAVUS_API_BASE}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'x-api-key': this.apiKey,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[TavusLib] API error:', response.status, errorText);
      throw new Error(`Tavus API error: ${response.status} ${errorText}`);
    }

    const result = await response.json();
    console.log('[TavusLib] Request successful');
    return result;
  }

  private getMockResponse(endpoint: string, options: RequestInit) {
    console.log('[TavusLib] Using mock response for demo');
    
    if (endpoint === '/v2/videos' && options.method === 'POST') {
      const videoId = `video_${Date.now()}`;
      return {
        data: {
          video_id: videoId,
          video_url: 'https://demo.tavus.io/sample-video',
          status: 'queued',
          created_at: new Date().toISOString()
        }
      };
    }

    if (endpoint.startsWith('/v2/videos/')) {
      const videoId = endpoint.split('/')[3];
      return {
        data: {
          video_id: videoId,
          video_url: 'https://demo.tavus.io/sample-video',
          status: 'completed',
          created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString()
        }
      };
    }

    if (endpoint === '/v2/replicas') {
      return {
        data: [
          {
            replica_id: 'replica_1',
            name: 'Dr. Smith',
            status: 'active'
          },
          {
            replica_id: 'replica_2',
            name: 'Dr. Johnson',
            status: 'active'
          }
        ]
      };
    }

    return {};
  }

  // Video Generation
  async generateVideo(data: {
    replica_id: string;
    script: string;
    background_url?: string;
    callback_url?: string;
  }): Promise<TavusVideo> {
    console.log('[TavusLib] Generating video with replica:', data.replica_id);
    const response = await this.request('/v2/videos', {
      method: 'POST',
      body: JSON.stringify({
        replica_id: data.replica_id,
        script: data.script,
        background_url: data.background_url,
        callback_url: data.callback_url,
      }),
    });
    console.log('[TavusLib] Video generation started:', response.data.video_id);
    return response.data;
  }

  async getVideo(videoId: string): Promise<TavusVideo> {
    console.log('[TavusLib] Getting video:', videoId);
    const data = await this.request(`/v2/videos/${videoId}`);
    return data.data;
  }

  async deleteVideo(videoId: string): Promise<void> {
    console.log('[TavusLib] Deleting video:', videoId);
    await this.request(`/v2/videos/${videoId}`, {
      method: 'DELETE',
    });
  }

  // Video Templates
  async getTemplates(): Promise<any[]> {
    console.log('[TavusLib] Getting templates...');
    const data = await this.request('/v2/templates');
    console.log('[TavusLib] Templates retrieved:', data.data?.length || 0);
    return data.data || [];
  }
}

export const tavusAPI = new TavusAPI();

// Helper functions
export async function generateDoctorsNoteVideo(data: {
  patientName: string;
  appointmentSummary: string;
  doctorName: string;
  replicaId: string;
  brandColor?: string;
}) {
  console.log('[TavusLib] Generating doctor\'s note video for:', data.patientName);
  const script = `Hello ${data.patientName}, this is ${data.doctorName}. 

Here's a summary of your recent appointment: ${data.appointmentSummary}

Thank you for choosing our practice. If you have any questions, please don't hesitate to contact us.`;

  console.log('[TavusLib] Video script prepared');
  return tavusAPI.generateVideo({
    replica_id: data.replicaId,
    script,
    callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/tavus/webhook`,
  });
}

export async function getTavusReplicas() {
  console.log('[TavusLib] Getting Tavus replicas helper');
  return tavusAPI.getReplicas();
}

export async function getTavusVideo(videoId: string) {
  console.log('[TavusLib] Getting Tavus video helper:', videoId);
  return tavusAPI.getVideo(videoId);
}