// ElevenLabs API integration
const ELEVENLABS_API_BASE = 'https://api.elevenlabs.io/v1';

export interface ElevenLabsVoice {
  voice_id: string;
  name: string;
  category: string;
  description?: string;
  preview_url?: string;
}

export interface ElevenLabsAgent {
  agent_id: string;
  name: string;
  voice_id: string;
  conversation_config: {
    agent: {
      prompt: {
        prompt: string;
      };
    };
  };
}

export interface ElevenLabsConversation {
  conversation_id: string;
  agent_id: string;
  status: string;
}

class ElevenLabsAPI {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.ELEVENLABS_API_KEY || '';
    if (!this.apiKey) {
      throw new Error('ELEVENLABS_API_KEY environment variable is required');
    }
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${ELEVENLABS_API_BASE}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'xi-api-key': this.apiKey,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`ElevenLabs API error: ${response.status} ${errorText}`);
    }

    return response.json();
  }

  // Voice Management
  async getVoices(): Promise<ElevenLabsVoice[]> {
    const data = await this.request('/voices');
    return data.voices || [];
  }

  async getVoice(voiceId: string): Promise<ElevenLabsVoice> {
    return this.request(`/voices/${voiceId}`);
  }

  // Conversational AI Agent Management
  async createAgent(data: {
    name: string;
    voice_id: string;
    prompt: string;
    language?: string;
  }): Promise<ElevenLabsAgent> {
    return this.request('/convai/agents', {
      method: 'POST',
      body: JSON.stringify({
        name: data.name,
        conversation_config: {
          agent: {
            prompt: {
              prompt: data.prompt,
            },
          },
        },
        voice: {
          voice_id: data.voice_id,
        },
        language: data.language || 'en',
      }),
    });
  }

  async getAgent(agentId: string): Promise<ElevenLabsAgent> {
    return this.request(`/convai/agents/${agentId}`);
  }

  async updateAgent(agentId: string, data: Partial<{
    name: string;
    voice_id: string;
    prompt: string;
  }>): Promise<ElevenLabsAgent> {
    const updateData: any = {};
    
    if (data.name) updateData.name = data.name;
    if (data.voice_id) {
      updateData.voice = { voice_id: data.voice_id };
    }
    if (data.prompt) {
      updateData.conversation_config = {
        agent: {
          prompt: {
            prompt: data.prompt,
          },
        },
      };
    }

    return this.request(`/convai/agents/${agentId}`, {
      method: 'PATCH',
      body: JSON.stringify(updateData),
    });
  }

  async deleteAgent(agentId: string): Promise<void> {
    await this.request(`/convai/agents/${agentId}`, {
      method: 'DELETE',
    });
  }

  // Phone Number Management
  async getPhoneNumbers(): Promise<any[]> {
    return this.request('/convai/phone-numbers');
  }

  async purchasePhoneNumber(data: {
    area_code?: string;
    country_code?: string;
  }): Promise<any> {
    return this.request('/convai/phone-numbers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Conversation Management
  async startConversation(data: {
    agent_id: string;
    phone_number?: string;
  }): Promise<ElevenLabsConversation> {
    return this.request('/convai/conversations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getConversation(conversationId: string): Promise<ElevenLabsConversation> {
    return this.request(`/convai/conversations/${conversationId}`);
  }

  async endConversation(conversationId: string): Promise<void> {
    await this.request(`/convai/conversations/${conversationId}`, {
      method: 'DELETE',
    });
  }

  // Text-to-Speech for voice previews
  async generateSpeech(data: {
    text: string;
    voice_id: string;
    model_id?: string;
  }): Promise<ArrayBuffer> {
    const response = await fetch(`${ELEVENLABS_API_BASE}/text-to-speech/${data.voice_id}`, {
      method: 'POST',
      headers: {
        'xi-api-key': this.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: data.text,
        model_id: data.model_id || 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`ElevenLabs TTS error: ${response.status}`);
    }

    return response.arrayBuffer();
  }
}

export const elevenLabsAPI = new ElevenLabsAPI();

// Helper functions for common operations
export async function createElevenLabsAgent(data: {
  name: string;
  voice_id: string;
  greeting: string;
  temperature?: number;
  custom_instructions?: string;
}) {
  const prompt = `You are ${data.name}, a helpful AI assistant. ${data.custom_instructions || ''}
  
Greeting: ${data.greeting}

Please be helpful, professional, and engaging in your conversations.`;

  return elevenLabsAPI.createAgent({
    name: data.name,
    voice_id: data.voice_id,
    prompt,
  });
}

export async function startElevenLabsCall(agentId: string, phoneNumber: string) {
  return elevenLabsAPI.startConversation({
    agent_id: agentId,
    phone_number: phoneNumber,
  });
}

export async function getElevenLabsVoices() {
  return elevenLabsAPI.getVoices();
}