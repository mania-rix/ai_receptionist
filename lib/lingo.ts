// Lingo API integration for translation services
const LINGO_API_BASE = 'https://api.lingo.dev/v1';

export interface LingoTranslation {
  text: string;
  source_language: string;
  target_language: string;
  translated_text: string;
  confidence: number;
}

export interface LingoLanguage {
  code: string;
  name: string;
  native_name: string;
}

class LingoAPI {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.LINGO_API_KEY || '';
    if (!this.apiKey) {
      console.warn('[LingoLib] LINGO_API_KEY not found - using demo mode');
    }
    console.log('[LingoLib] Lingo API initialized');
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    console.log('[LingoLib] Making request to:', endpoint);
    
    // Demo mode - return mock data if no API key
    if (!this.apiKey) {
      return this.getMockResponse(endpoint, options);
    }

    const url = `${LINGO_API_BASE}${endpoint}`;
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
      console.error('[LingoLib] API error:', response.status, errorText);
      throw new Error(`Lingo API error: ${response.status} ${errorText}`);
    }

    const result = await response.json();
    console.log('[LingoLib] Request successful');
    return result;
  }

  private getMockResponse(endpoint: string, options: RequestInit) {
    console.log('[LingoLib] Using mock response for demo');
    
    if (endpoint === '/languages') {
      return {
        languages: [
          { code: 'en', name: 'English', native_name: 'English' },
          { code: 'es', name: 'Spanish', native_name: 'Español' },
          { code: 'fr', name: 'French', native_name: 'Français' },
          { code: 'de', name: 'German', native_name: 'Deutsch' },
          { code: 'it', name: 'Italian', native_name: 'Italiano' },
          { code: 'pt', name: 'Portuguese', native_name: 'Português' },
          { code: 'zh', name: 'Chinese', native_name: '中文' },
          { code: 'ja', name: 'Japanese', native_name: '日本語' },
          { code: 'ko', name: 'Korean', native_name: '한국어' },
          { code: 'ar', name: 'Arabic', native_name: 'العربية' },
        ]
      };
    }

    if (endpoint === '/translate' && options.method === 'POST') {
      const body = JSON.parse(options.body as string);
      const mockTranslations: { [key: string]: string } = {
        'Hello, how can I help you today?': {
          es: 'Hola, ¿cómo puedo ayudarte hoy?',
          fr: 'Bonjour, comment puis-je vous aider aujourd\'hui?',
          de: 'Hallo, wie kann ich Ihnen heute helfen?',
          it: 'Ciao, come posso aiutarti oggi?',
          pt: 'Olá, como posso ajudá-lo hoje?',
          zh: '你好，今天我能为您做些什么？',
          ja: 'こんにちは、今日はどのようにお手伝いできますか？',
          ko: '안녕하세요, 오늘 어떻게 도와드릴까요?',
          ar: 'مرحبا، كيف يمكنني مساعدتك اليوم؟'
        }
      };

      const translated = mockTranslations[body.text]?.[body.target_language] || 
                        `[${body.target_language.toUpperCase()}] ${body.text}`;

      return {
        text: body.text,
        source_language: body.source_language || 'en',
        target_language: body.target_language,
        translated_text: translated,
        confidence: 0.95
      };
    }

    return {};
  }

  // Get supported languages
  async getLanguages(): Promise<LingoLanguage[]> {
    console.log('[LingoLib] Getting supported languages...');
    const data = await this.request('/languages');
    console.log('[LingoLib] Languages retrieved:', data.languages?.length || 0);
    return data.languages || [];
  }

  // Translate text
  async translateText(data: {
    text: string;
    target_language: string;
    source_language?: string;
  }): Promise<LingoTranslation> {
    console.log('[LingoLib] Translating text:', data.text.substring(0, 50) + '...');
    return this.request('/translate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Detect language
  async detectLanguage(text: string): Promise<{ language: string; confidence: number }> {
    console.log('[LingoLib] Detecting language for text:', text.substring(0, 50) + '...');
    
    // Mock detection for demo
    if (!this.apiKey) {
      const mockDetections: { [key: string]: string } = {
        'hola': 'es',
        'bonjour': 'fr',
        'guten tag': 'de',
        'ciao': 'it',
        'olá': 'pt',
        '你好': 'zh',
        'こんにちは': 'ja',
        '안녕하세요': 'ko',
        'مرحبا': 'ar'
      };

      const detected = Object.keys(mockDetections).find(key => 
        text.toLowerCase().includes(key)
      );

      return {
        language: detected ? mockDetections[detected] : 'en',
        confidence: 0.9
      };
    }

    return this.request('/detect', {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
  }
}

export const lingoAPI = new LingoAPI();

// Helper functions for common operations
export async function translateMessage(text: string, targetLanguage: string, sourceLanguage?: string) {
  console.log('[LingoLib] Translating message helper:', { text: text.substring(0, 50), targetLanguage });
  return lingoAPI.translateText({
    text,
    target_language: targetLanguage,
    source_language: sourceLanguage,
  });
}

export async function getSupportedLanguages() {
  console.log('[LingoLib] Getting supported languages helper');
  return lingoAPI.getLanguages();
}

export async function detectTextLanguage(text: string) {
  console.log('[LingoLib] Detecting text language helper');
  return lingoAPI.detectLanguage(text);
}