// Voice-driven analytics query processor
import { elevenLabsAPI } from './elevenlabs';

export interface AnalyticsQuery {
  question: string;
  user_id: string;
  response?: string;
  data?: any;
}

export class VoiceAnalyticsProcessor {
  async processVoiceQuery(audioBlob: Blob, userId: string): Promise<AnalyticsQuery> {
    // Convert speech to text (would use a speech-to-text service)
    const question = await this.speechToText(audioBlob);
    
    // Process the question and generate response
    const result = await this.processTextQuery(question, userId);
    
    // Convert response back to speech
    const audioResponse = await this.textToSpeech(result.response || 'I could not process your query.');
    
    return {
      ...result,
      question,
    };
  }

  async processTextQuery(question: string, userId: string): Promise<AnalyticsQuery> {
    // This would integrate with an LLM to understand the query and generate SQL/data queries
    // For now, we'll handle some common patterns
    
    const lowerQuestion = question.toLowerCase();
    
    if (lowerQuestion.includes('unhappy') && lowerQuestion.includes('patient')) {
      return this.getUnhappyPatientsData(userId);
    }
    
    if (lowerQuestion.includes('call') && lowerQuestion.includes('today')) {
      return this.getTodayCallsData(userId);
    }
    
    if (lowerQuestion.includes('revenue') || lowerQuestion.includes('money')) {
      return this.getRevenueData(userId);
    }
    
    if (lowerQuestion.includes('compliance')) {
      return this.getComplianceData(userId);
    }
    
    return {
      question,
      user_id: userId,
      response: "I'm not sure how to answer that question. Try asking about calls, patients, revenue, or compliance.",
    };
  }

  private async speechToText(audioBlob: Blob): Promise<string> {
    // This would integrate with a speech-to-text service like OpenAI Whisper
    // For now, return a mock response
    return "How many unhappy patients called last week?";
  }

  private async textToSpeech(text: string): Promise<ArrayBuffer> {
    // Use ElevenLabs for text-to-speech
    try {
      return await elevenLabsAPI.generateSpeech({
        text,
        voice_id: 'EXAVITQu4vr4xnSDxMaL', // Default voice
      });
    } catch (error) {
      console.error('TTS error:', error);
      throw error;
    }
  }

  private async getUnhappyPatientsData(userId: string): Promise<AnalyticsQuery> {
    // This would query the database for sentiment data
    const mockData = {
      count: 3,
      patients: ['Patient A', 'Patient B', 'Patient C'],
      timeframe: 'last week',
    };
    
    return {
      question: 'How many unhappy patients called last week?',
      user_id: userId,
      response: `Based on sentiment analysis, ${mockData.count} patients with negative sentiment called last week.`,
      data: mockData,
    };
  }

  private async getTodayCallsData(userId: string): Promise<AnalyticsQuery> {
    const mockData = {
      total: 15,
      completed: 12,
      in_progress: 2,
      failed: 1,
    };
    
    return {
      question: 'How many calls happened today?',
      user_id: userId,
      response: `Today you had ${mockData.total} total calls: ${mockData.completed} completed, ${mockData.in_progress} in progress, and ${mockData.failed} failed.`,
      data: mockData,
    };
  }

  private async getRevenueData(userId: string): Promise<AnalyticsQuery> {
    const mockData = {
      total: 2450.75,
      period: 'this month',
      growth: 15.3,
    };
    
    return {
      question: 'What is our revenue this month?',
      user_id: userId,
      response: `Your revenue ${mockData.period} is $${mockData.total}, which is ${mockData.growth}% higher than last month.`,
      data: mockData,
    };
  }

  private async getComplianceData(userId: string): Promise<AnalyticsQuery> {
    const mockData = {
      rate: 94.5,
      violations: 2,
      total_calls: 37,
    };
    
    return {
      question: 'What is our compliance rate?',
      user_id: userId,
      response: `Your compliance rate is ${mockData.rate}% with ${mockData.violations} violations out of ${mockData.total_calls} total calls.`,
      data: mockData,
    };
  }
}

export const voiceAnalyticsProcessor = new VoiceAnalyticsProcessor();