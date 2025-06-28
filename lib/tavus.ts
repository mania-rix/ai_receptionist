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

  constructor() {
    this.apiKey = process.env.TAVUS_API_KEY || '';
    if (!this.apiKey) {
      console.error('[TavusLib] TAVUS_API_KEY not found');
      throw new Error('TAVUS_API_KEY environment variable is required');
    }
    console.log('[TavusLib] Tavus API initialized');
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    console.log('[TavusLib] Making request to:', endpoint);
    const url = `${TAVUS_API_BASE}${endpoint}`;
    // TODO: Review error handling for Tavus API calls
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

  // Replica Management
  async getReplicas(): Promise<TavusReplica[]> {
    console.log('[TavusLib] Getting replicas...');
    const data = await this.request('/v2/replicas');
    console.log('[TavusLib] Replicas retrieved:', data.data?.length || 0);
    return data.data || [];
  }

  async getReplica(replicaId: string): Promise<TavusReplica> {
    console.log('[TavusLib] Getting replica:', replicaId);
    const data = await this.request(`/v2/replicas/${replicaId}`);
    return data.data;
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