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
  private demoMode: boolean;

  constructor() {
    this.apiKey = process.env.ELEVENLABS_API_KEY || '';
    this.demoMode = !this.apiKey;
    if (this.demoMode) {
      console.warn('[ElevenLabsLib] ELEVENLABS_API_KEY not found - using demo mode');
    }
    console.log('[ElevenLabsLib] ElevenLabs API initialized');
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    console.log('[ElevenLabsLib] Making request to:', endpoint);
    
    // Demo mode - return mock data if no API key
    if (this.demoMode) {
      return this.getMockResponse(endpoint, options);
    }

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
      console.error('[ElevenLabsLib] API error:', response.status, errorText);
      throw new Error(`ElevenLabs API error: ${response.status} ${errorText}`);
    }

    const result = await response.json();
    console.log('[ElevenLabsLib] Request successful');
    return result;
  }

  private getMockResponse(endpoint: string, options: RequestInit) {
    console.log('[ElevenLabsLib] Using mock response for demo');
    
    if (endpoint === '/voices') {
      return {
        voices: [
          { voice_id: 'voice_1', name: 'Rachel', category: 'professional', preview_url: 'https://example.com/preview1.mp3' },
          { voice_id: 'voice_2', name: 'Thomas', category: 'professional', preview_url: 'https://example.com/preview2.mp3' },
          { voice_id: 'voice_3', name: 'Emily', category: 'professional', preview_url: 'https://example.com/preview3.mp3' },
          { voice_id: 'voice_4', name: 'James', category: 'professional', preview_url: 'https://example.com/preview4.mp3' },
          { voice_id: 'voice_5', name: 'Sarah', category: 'professional', preview_url: 'https://example.com/preview5.mp3' },
          { voice_id: 'voice_6', name: 'Michael', category: 'professional', preview_url: 'https://example.com/preview6.mp3' },
        ]
      };
    }

    if (endpoint.startsWith('/text-to-speech')) {
      // Return a mock audio buffer
      return new ArrayBuffer(1024);
    }

    if (endpoint.startsWith('/convai/agents')) {
      if (options.method === 'POST') {
        const body = JSON.parse(options.body as string);
        return {
          agent_id: `agent_${Date.now()}`,
          name: body.name,
          voice: {
            voice_id: body.voice.voice_id
          },
          conversation_config: body.conversation_config
        };
      }
      
      return {
        agent_id: 'agent_demo',
        name: 'Demo Agent',
        voice: {
          voice_id: 'voice_1'
        },
        conversation_config: {
          agent: {
            prompt: {
              prompt: 'You are a helpful assistant.'
            }
          }
        }
      };
    }

    if (endpoint.startsWith('/convai/conversations')) {
      return {
        conversation_id: `conv_${Date.now()}`,
        agent_id: 'agent_demo',
        status: 'active'
      };
    }

    return {};
  }

  // Voice Management
  async getVoices(): Promise<ElevenLabsVoice[]> {
    console.log('[ElevenLabsLib] Getting voices...');
    const data = await this.request('/voices');
    console.log('[ElevenLabsLib] Voices retrieved:', data.voices?.length || 0);
    return data.voices || [];
  }

  async getVoice(voiceId: string): Promise<ElevenLabsVoice> {
    console.log('[ElevenLabsLib] Getting voice:', voiceId);
    return this.request(`/voices/${voiceId}`);
  }

  // Conversational AI Agent Management
  async createAgent(data: {
    name: string;
    voice_id: string;
    prompt: string;
    language?: string;
  }): Promise<ElevenLabsAgent> {
    console.log('[ElevenLabsLib] Creating agent:', data.name);
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
    console.log('[ElevenLabsLib] Getting agent:', agentId);
    return this.request(`/convai/agents/${agentId}`);
  }

  async updateAgent(agentId: string, data: Partial<{
    name: string;
    voice_id: string;
    prompt: string;
  }>): Promise<ElevenLabsAgent> {
    console.log('[ElevenLabsLib] Updating agent:', agentId);
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
    console.log('[ElevenLabsLib] Deleting agent:', agentId);
    await this.request(`/convai/agents/${agentId}`, {
      method: 'DELETE',
    });
  }

  // Conversation Management
  async startConversation(data: {
    agent_id: string;
    phone_number?: string;
  }): Promise<ElevenLabsConversation> {
    console.log('[ElevenLabsLib] Starting conversation:', data);
    return this.request('/convai/conversations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getConversation(conversationId: string): Promise<ElevenLabsConversation> {
    console.log('[ElevenLabsLib] Getting conversation:', conversationId);
    return this.request(`/convai/conversations/${conversationId}`);
  }

  async endConversation(conversationId: string): Promise<void> {
    console.log('[ElevenLabsLib] Ending conversation:', conversationId);
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
    console.log('[ElevenLabsLib] Generating speech for voice:', data.voice_id);
    
    if (this.demoMode) {
      console.log('[ElevenLabsLib] Using mock TTS response for demo');
      // Return a mock audio buffer
      return new ArrayBuffer(1024);
    }
    
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
      console.error('[ElevenLabsLib] TTS error:', response.status);
      throw new Error(`ElevenLabs TTS error: ${response.status}`);
    }

    console.log('[ElevenLabsLib] Speech generated successfully');
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
  console.log('[ElevenLabsLib] Creating ElevenLabs agent helper:', data.name);
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
  console.log('[ElevenLabsLib] Starting ElevenLabs call:', { agentId, phoneNumber });
  return elevenLabsAPI.startConversation({
    agent_id: agentId,
    phone_number: phoneNumber,
  });
}

export async function getElevenLabsVoices() {
  console.log('[ElevenLabsLib] Getting ElevenLabs voices helper');
  return elevenLabsAPI.getVoices();
}