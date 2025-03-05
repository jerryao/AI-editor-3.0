import { AIRequestOptions, AIResponse, AIService } from '../../types/ai';

export class ZhipuAIService implements AIService {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string, baseUrl: string = 'https://open.bigmodel.cn/api/paas/v3') {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  async generateText(prompt: string, options: AIRequestOptions): Promise<AIResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'chatglm_turbo',
          messages: [{ role: 'user', content: prompt }],
          temperature: options.temperature || 0.7,
          max_tokens: options.maxTokens || 2000,
          top_p: options.topP || 1,
          frequency_penalty: options.frequencyPenalty || 0,
          presence_penalty: options.presencePenalty || 0,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error?.message || '智谱AI API request failed');
      }

      return {
        text: data.choices[0].message.content,
        model: 'zhipu',
        usage: data.usage,
      };
    } catch (error) {
      return {
        text: '',
        model: 'zhipu',
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  async generateStream(
    prompt: string,
    options: AIRequestOptions,
    onToken: (token: string) => void
  ): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'chatglm_turbo',
          messages: [{ role: 'user', content: prompt }],
          temperature: options.temperature || 0.7,
          max_tokens: options.maxTokens || 2000,
          top_p: options.topP || 1,
          frequency_penalty: options.frequencyPenalty || 0,
          presence_penalty: options.presencePenalty || 0,
          stream: true,
        }),
      });

      if (!response.ok) {
        throw new Error('智谱AI API request failed');
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Failed to get response reader');
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n').filter(line => line.trim() !== '');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6));
            if (data.choices[0].delta.content) {
              onToken(data.choices[0].delta.content);
            }
          }
        }
      }
    } catch (error) {
      throw error;
    }
  }
} 