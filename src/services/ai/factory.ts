import { AIService, AIServiceConfig } from '../../types/ai';
import { OpenAIService } from './openai';
import { DeepSeekService } from './deepseek';
import { ZhipuAIService } from './zhipu';

export class AIServiceFactory {
  private static instance: AIServiceFactory;
  private services: Map<string, AIService> = new Map();

  private constructor() {}

  static getInstance(): AIServiceFactory {
    if (!AIServiceFactory.instance) {
      AIServiceFactory.instance = new AIServiceFactory();
    }
    return AIServiceFactory.instance;
  }

  initialize(config: AIServiceConfig): void {
    if (config.openai.apiKey) {
      this.services.set('openai', new OpenAIService(
        config.openai.apiKey,
        config.openai.baseUrl
      ));
    }

    if (config.deepseek.apiKey) {
      this.services.set('deepseek', new DeepSeekService(
        config.deepseek.apiKey,
        config.deepseek.baseUrl
      ));
    }

    if (config.zhipu.apiKey) {
      this.services.set('zhipu', new ZhipuAIService(
        config.zhipu.apiKey,
        config.zhipu.baseUrl
      ));
    }
  }

  getService(model: string): AIService | undefined {
    return this.services.get(model);
  }

  getAllAvailableModels(): string[] {
    return Array.from(this.services.keys());
  }
} 