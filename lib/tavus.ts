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
      throw new Error('TAVUS_API_KEY environment variable is required');
    }
  }

  private async request(endpoint: string, options: RequestInit = {}) {
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
      throw new Error(`Tavus API error: ${response.status} ${errorText}`);
    }

    return response.json();
  }

  // Replica Management
  async getReplicas(): Promise<TavusReplica[]> {
    const data = await this.request('/v2/replicas');
    return data.data || [];
  }

  async getReplica(replicaId: string): Promise<TavusReplica> {
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
    const response = await this.request('/v2/videos', {
      method: 'POST',
      body: JSON.stringify({
        replica_id: data.replica_id,
        script: data.script,
        background_url: data.background_url,
        callback_url: data.callback_url,
      }),
    });
    return response.data;
  }

  async getVideo(videoId: string): Promise<TavusVideo> {
    const data = await this.request(`/v2/videos/${videoId}`);
    return data.data;
  }

  async deleteVideo(videoId: string): Promise<void> {
    await this.request(`/v2/videos/${videoId}`, {
      method: 'DELETE',
    });
  }

  // Video Templates
  async getTemplates(): Promise<any[]> {
    const data = await this.request('/v2/templates');
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
  const script = `Hello ${data.patientName}, this is ${data.doctorName}. 

Here's a summary of your recent appointment: ${data.appointmentSummary}

Thank you for choosing our practice. If you have any questions, please don't hesitate to contact us.`;

  return tavusAPI.generateVideo({
    replica_id: data.replicaId,
    script,
    callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/tavus/webhook`,
  });
}

export async function getTavusReplicas() {
  return tavusAPI.getReplicas();
}

export async function getTavusVideo(videoId: string) {
  return tavusAPI.getVideo(videoId);
}