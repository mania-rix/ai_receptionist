// Picaos API integration for digital business cards and IPFS storage
const PICAOS_API_BASE = 'https://api.picaos.com/v1';

export interface PicaosBusinessCard {
  id: string;
  name: string;
  title: string;
  company: string;
  email: string;
  phone: string;
  image_url?: string;
  ipfs_hash: string;
  qr_code_url: string;
  verification_url: string;
  created_at: string;
}

export interface PicaosUploadResponse {
  ipfs_hash: string;
  gateway_url: string;
  file_size: number;
}

class PicaosAPI {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.PICAOS_API_KEY || '';
    if (!this.apiKey) {
      console.warn('[PicaosLib] PICAOS_API_KEY not found - using demo mode');
    }
    console.log('[PicaosLib] Picaos API initialized');
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    console.log('[PicaosLib] Making request to:', endpoint);
    
    // Demo mode - return mock data if no API key
    if (!this.apiKey) {
      return this.getMockResponse(endpoint, options);
    }

    const url = `${PICAOS_API_BASE}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[PicaosLib] API error:', response.status, errorText);
      throw new Error(`Picaos API error: ${response.status} ${errorText}`);
    }

    const result = await response.json();
    console.log('[PicaosLib] Request successful');
    return result;
  }

  private getMockResponse(endpoint: string, options: RequestInit) {
    console.log('[PicaosLib] Using mock response for demo');
    
    if (endpoint === '/cards' && options.method === 'POST') {
      const body = JSON.parse(options.body as string);
      const mockHash = `QmX${Math.random().toString(36).substring(2, 15)}`;
      
      return {
        id: `card_${Date.now()}`,
        name: body.name,
        title: body.title,
        company: body.company,
        email: body.email,
        phone: body.phone,
        image_url: body.image_url,
        ipfs_hash: mockHash,
        qr_code_url: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://ipfs.io/ipfs/${mockHash}`,
        verification_url: `https://picaos.com/verify/${mockHash}`,
        created_at: new Date().toISOString(),
      };
    }

    if (endpoint.startsWith('/cards/')) {
      const cardId = endpoint.split('/')[2];
      return {
        id: cardId,
        name: 'Demo User',
        title: 'AI Specialist',
        company: 'BlvckWall AI',
        email: 'demo@blvckwall.ai',
        phone: '+1 (555) 123-4567',
        ipfs_hash: 'QmDemo123456789',
        qr_code_url: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=demo',
        verification_url: 'https://picaos.com/verify/demo',
        created_at: new Date().toISOString(),
      };
    }

    if (endpoint === '/upload' && options.method === 'POST') {
      const mockHash = `QmImg${Math.random().toString(36).substring(2, 15)}`;
      return {
        ipfs_hash: mockHash,
        gateway_url: `https://ipfs.io/ipfs/${mockHash}`,
        file_size: 1024 * 150, // 150KB mock size
      };
    }

    return {};
  }

  // Upload file to IPFS
  async uploadToIPFS(file: File): Promise<PicaosUploadResponse> {
    console.log('[PicaosLib] Uploading file to IPFS:', file.name);
    
    if (!this.apiKey) {
      return this.getMockResponse('/upload', { method: 'POST' });
    }

    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${PICAOS_API_BASE}/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status}`);
    }

    const result = await response.json();
    console.log('[PicaosLib] File uploaded successfully:', result.ipfs_hash);
    return result;
  }

  // Create digital business card
  async createBusinessCard(data: {
    name: string;
    title: string;
    company: string;
    email: string;
    phone: string;
    image_url?: string;
  }): Promise<PicaosBusinessCard> {
    console.log('[PicaosLib] Creating business card for:', data.name);
    return this.request('/cards', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Get business card by ID
  async getBusinessCard(cardId: string): Promise<PicaosBusinessCard> {
    console.log('[PicaosLib] Getting business card:', cardId);
    return this.request(`/cards/${cardId}`);
  }

  // Verify business card
  async verifyBusinessCard(ipfsHash: string): Promise<{ verified: boolean; card: PicaosBusinessCard }> {
    console.log('[PicaosLib] Verifying business card:', ipfsHash);
    
    if (!this.apiKey) {
      return {
        verified: true,
        card: this.getMockResponse('/cards/demo', {})
      };
    }

    return this.request(`/verify/${ipfsHash}`);
  }

  // List user's business cards
  async getUserCards(userId: string): Promise<PicaosBusinessCard[]> {
    console.log('[PicaosLib] Getting user cards for:', userId);
    
    if (!this.apiKey) {
      return [this.getMockResponse('/cards/demo', {})];
    }

    const data = await this.request(`/users/${userId}/cards`);
    return data.cards || [];
  }
}

export const picaosAPI = new PicaosAPI();

// Helper functions for common operations
export async function createDigitalBusinessCard(cardData: {
  name: string;
  title: string;
  company: string;
  email: string;
  phone: string;
  image?: File;
}) {
  console.log('[PicaosLib] Creating digital business card helper:', cardData.name);
  
  let imageUrl;
  if (cardData.image) {
    const uploadResult = await picaosAPI.uploadToIPFS(cardData.image);
    imageUrl = uploadResult.gateway_url;
  }

  return picaosAPI.createBusinessCard({
    name: cardData.name,
    title: cardData.title,
    company: cardData.company,
    email: cardData.email,
    phone: cardData.phone,
    image_url: imageUrl,
  });
}

export async function verifyDigitalCard(ipfsHash: string) {
  console.log('[PicaosLib] Verifying digital card helper:', ipfsHash);
  return picaosAPI.verifyBusinessCard(ipfsHash);
}

export async function uploadImageToIPFS(file: File) {
  console.log('[PicaosLib] Uploading image to IPFS helper:', file.name);
  return picaosAPI.uploadToIPFS(file);
}