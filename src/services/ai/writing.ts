import { AIServiceFactory } from './factory';
import { AIModel } from '../../types/ai';

export interface WritingContext {
  previousParagraphs: string;  // 前文内容
  currentParagraph: string;    // 当前段落
  writingStyle?: string;       // 写作风格
  tone?: string;              // 语气
  genre?: string;             // 文体
  keywords?: string[];        // 关键词
}

export class WritingService {
  private static instance: WritingService;
  private factory: AIServiceFactory;

  private constructor() {
    this.factory = AIServiceFactory.getInstance();
  }

  static getInstance(): WritingService {
    if (!WritingService.instance) {
      WritingService.instance = new WritingService();
    }
    return WritingService.instance;
  }

  async continueWriting(
    context: WritingContext,
    model: AIModel = 'openai',
    onToken?: (token: string) => void
  ): Promise<string> {
    const service = this.factory.getService(model);
    if (!service) {
      throw new Error(`AI service ${model} not available`);
    }

    // 构建提示词
    const prompt = this.buildContinueWritingPrompt(context);

    if (onToken) {
      // 流式响应
      await service.generateStream(prompt, { model }, onToken);
      return '';
    } else {
      // 普通响应
      const response = await service.generateText(prompt, { model });
      return response.text;
    }
  }

  private buildContinueWritingPrompt(context: WritingContext): string {
    const { previousParagraphs, currentParagraph, writingStyle, tone, genre, keywords } = context;
    
    let prompt = '请基于以下文本进行续写。\n\n';
    prompt += '前文内容：\n"""\n' + previousParagraphs + '\n"""\n\n';
    
    if (currentParagraph) {
      prompt += '当前段落：\n"""\n' + currentParagraph + '\n"""\n\n';
    }

    prompt += '要求：\n';
    if (writingStyle) {
      prompt += `- 保持"${writingStyle}"的写作风格\n`;
    }
    if (tone) {
      prompt += `- 使用"${tone}"的语气\n`;
    }
    if (genre) {
      prompt += `- 遵循"${genre}"的文体特征\n`;
    }
    if (keywords && keywords.length > 0) {
      prompt += `- 适当融入以下关键词：${keywords.join('、')}\n`;
    }

    prompt += '\n请自然地继续写作，保持文章的连贯性和流畅度。生成的内容要有逻辑性，避免重复和矛盾。';
    
    return prompt;
  }
} 