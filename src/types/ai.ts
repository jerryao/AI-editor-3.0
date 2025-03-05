export type AIModel = 'openai' | 'deepseek' | 'zhipu';

export interface AIRequestOptions {
  model: AIModel;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
}

export interface AIResponse {
  text: string;
  model: AIModel;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  error?: string;
}

export interface AIServiceConfig {
  openai: {
    apiKey: string;
    baseUrl?: string;
  };
  deepseek: {
    apiKey: string;
    baseUrl?: string;
  };
  zhipu: {
    apiKey: string;
    baseUrl?: string;
  };
}

export interface AIService {
  generateText(prompt: string, options: AIRequestOptions): Promise<AIResponse>;
  generateStream(prompt: string, options: AIRequestOptions, onToken: (token: string) => void): Promise<void>;
} 