import { AIServiceFactory } from './factory';
import { AIModel } from '../../types/ai';

export interface EnhancementOptions {
  text: string;
  model?: AIModel;
  language?: string;
  targetLength?: string;
  style?: string;
  tone?: string;
  targetLanguage?: string;
}

export class EnhancementService {
  private static instance: EnhancementService;
  private factory: AIServiceFactory;

  private constructor() {
    this.factory = AIServiceFactory.getInstance();
  }

  static getInstance(): EnhancementService {
    if (!EnhancementService.instance) {
      EnhancementService.instance = new EnhancementService();
    }
    return EnhancementService.instance;
  }

  // 生成文本摘要
  async generateSummary(
    options: EnhancementOptions,
    onToken?: (token: string) => void
  ): Promise<string> {
    const service = this.factory.getService(options.model || 'openai');
    if (!service) {
      throw new Error(`AI service ${options.model} not available`);
    }

    const prompt = this.buildSummaryPrompt(options);

    if (onToken) {
      await service.generateStream(prompt, { model: options.model || 'openai' }, onToken);
      return '';
    } else {
      const response = await service.generateText(prompt, { model: options.model || 'openai' });
      return response.text;
    }
  }

  // 智能校对（语法和拼写检查）
  async proofread(
    options: EnhancementOptions,
    onToken?: (token: string) => void
  ): Promise<string> {
    const service = this.factory.getService(options.model || 'openai');
    if (!service) {
      throw new Error(`AI service ${options.model} not available`);
    }

    const prompt = this.buildProofreadPrompt(options);

    if (onToken) {
      await service.generateStream(prompt, { model: options.model || 'openai' }, onToken);
      return '';
    } else {
      const response = await service.generateText(prompt, { model: options.model || 'openai' });
      return response.text;
    }
  }

  // 风格转换
  async convertStyle(
    options: EnhancementOptions,
    onToken?: (token: string) => void
  ): Promise<string> {
    const service = this.factory.getService(options.model || 'openai');
    if (!service) {
      throw new Error(`AI service ${options.model} not available`);
    }

    const prompt = this.buildStyleConversionPrompt(options);

    if (onToken) {
      await service.generateStream(prompt, { model: options.model || 'openai' }, onToken);
      return '';
    } else {
      const response = await service.generateText(prompt, { model: options.model || 'openai' });
      return response.text;
    }
  }

  // 多语言翻译
  async translate(
    options: EnhancementOptions,
    onToken?: (token: string) => void
  ): Promise<string> {
    const service = this.factory.getService(options.model || 'openai');
    if (!service) {
      throw new Error(`AI service ${options.model} not available`);
    }

    const prompt = this.buildTranslationPrompt(options);

    if (onToken) {
      await service.generateStream(prompt, { model: options.model || 'openai' }, onToken);
      return '';
    } else {
      const response = await service.generateText(prompt, { model: options.model || 'openai' });
      return response.text;
    }
  }

  // 内容优化建议
  async optimizeContent(
    options: EnhancementOptions,
    onToken?: (token: string) => void
  ): Promise<string> {
    const service = this.factory.getService(options.model || 'openai');
    if (!service) {
      throw new Error(`AI service ${options.model} not available`);
    }

    const prompt = this.buildOptimizationPrompt(options);

    if (onToken) {
      await service.generateStream(prompt, { model: options.model || 'openai' }, onToken);
      return '';
    } else {
      const response = await service.generateText(prompt, { model: options.model || 'openai' });
      return response.text;
    }
  }

  // 以下是各个功能的提示词构建方法

  private buildSummaryPrompt(options: EnhancementOptions): string {
    const { text, targetLength = '简短', language = '中文' } = options;
    
    let prompt = `请对以下文本进行摘要总结，生成一个${targetLength}的${language}摘要，捕捉文本的关键点和主要信息：\n\n`;
    prompt += `文本内容：\n"""\n${text}\n"""\n\n`;
    prompt += `请提供一个清晰、连贯且信息丰富的摘要，不要添加原文中不存在的信息，保持客观准确。`;
    
    return prompt;
  }

  private buildProofreadPrompt(options: EnhancementOptions): string {
    const { text, language = '中文' } = options;
    
    let prompt = `请对以下${language}文本进行智能校对，检查并修正任何语法、拼写、标点和表达错误：\n\n`;
    prompt += `文本内容：\n"""\n${text}\n"""\n\n`;
    prompt += `请返回修正后的文本，并在文本后面添加一个简短的修改说明列表，指出主要修改的地方和原因。如果没有发现错误，请说明文本已经很完善。`;
    
    return prompt;
  }

  private buildStyleConversionPrompt(options: EnhancementOptions): string {
    const { text, style = '专业', tone = '正式' } = options;
    
    let prompt = `请将以下文本转换为${style}风格和${tone}语气，同时保持原始内容的意思和关键信息：\n\n`;
    prompt += `文本内容：\n"""\n${text}\n"""\n\n`;
    prompt += `请保持内容的准确性和完整性，只调整表达方式、词汇选择和句式结构，使其符合${style}风格和${tone}语气。`;
    
    return prompt;
  }

  private buildTranslationPrompt(options: EnhancementOptions): string {
    const { text, language = '中文', targetLanguage = '英语' } = options;
    
    let prompt = `请将以下${language}文本翻译成${targetLanguage}，保持原文的意思、风格和语气：\n\n`;
    prompt += `文本内容：\n"""\n${text}\n"""\n\n`;
    prompt += `请提供准确、自然且符合${targetLanguage}表达习惯的翻译，注意专业术语和文化表达的恰当转换。`;
    
    return prompt;
  }

  private buildOptimizationPrompt(options: EnhancementOptions): string {
    const { text } = options;
    
    let prompt = `请分析以下文本，提供全面的内容优化建议，包括结构、逻辑、表达和说服力等方面：\n\n`;
    prompt += `文本内容：\n"""\n${text}\n"""\n\n`;
    prompt += `请提供以下几个方面的具体建议：
1. 结构组织：文本结构是否清晰，有无改进空间
2. 逻辑连贯：论点和论据的连接是否紧密，逻辑是否明确
3. 表达方式：用词和句式是否恰当，有无更好的表达方式
4. 内容丰富度：信息是否充分，有无需要补充的内容
5. 整体改进：给出2-3个最关键的改进建议

请尽量具体，可以包含示例性修改，帮助作者理解如何实施这些建议。`;
    
    return prompt;
  }
} 