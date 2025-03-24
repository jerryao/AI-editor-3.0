import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  LinearProgress,
  FormControlLabel,
  Switch,
  Divider,
} from '@mui/material';
import { AIModel } from '../types/ai';
import { EnhancementService, EnhancementOptions } from '../services/ai/enhancement';

export type EnhancementType = 'summary' | 'proofread' | 'style' | 'translate' | 'optimize';

const ENHANCEMENT_LABELS: Record<EnhancementType, string> = {
  summary: '文本摘要',
  proofread: '智能校对',
  style: '风格转换',
  translate: '多语言翻译',
  optimize: '内容优化建议',
};

interface EnhancementDialogProps {
  open: boolean;
  onClose: () => void;
  onComplete: (text: string) => void;
  text: string;
  enhancementType: EnhancementType;
}

export const EnhancementDialog: React.FC<EnhancementDialogProps> = ({
  open,
  onClose,
  onComplete,
  text,
  enhancementType,
}) => {
  const [model, setModel] = useState<AIModel>('openai');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedText, setGeneratedText] = useState('');

  // 通用选项
  const [language, setLanguage] = useState('中文');
  
  // 摘要选项
  const [targetLength, setTargetLength] = useState('简短');
  
  // 风格转换选项
  const [style, setStyle] = useState('专业');
  const [tone, setTone] = useState('正式');
  
  // 翻译选项
  const [targetLanguage, setTargetLanguage] = useState('英语');
  
  // 其他配置
  const [showOriginal, setShowOriginal] = useState(false);
  
  const handleGenerate = async () => {
    setIsGenerating(true);
    setGeneratedText('');

    const enhancementService = EnhancementService.getInstance();
    const options: EnhancementOptions = {
      text,
      model,
      language,
      targetLength,
      style,
      tone,
      targetLanguage,
    };

    try {
      const tokenCallback = (token: string) => {
        setGeneratedText(prev => prev + token);
      };

      switch (enhancementType) {
        case 'summary':
          await enhancementService.generateSummary(options, tokenCallback);
          break;
        case 'proofread':
          await enhancementService.proofread(options, tokenCallback);
          break;
        case 'style':
          await enhancementService.convertStyle(options, tokenCallback);
          break;
        case 'translate':
          await enhancementService.translate(options, tokenCallback);
          break;
        case 'optimize':
          await enhancementService.optimizeContent(options, tokenCallback);
          break;
      }
    } catch (error) {
      console.error('生成失败:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleComplete = () => {
    onComplete(generatedText);
    onClose();
  };

  // 根据增强类型渲染不同的配置项
  const renderOptions = () => {
    switch (enhancementType) {
      case 'summary':
        return (
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>摘要长度</InputLabel>
            <Select
              value={targetLength}
              onChange={(e) => setTargetLength(e.target.value)}
              label="摘要长度"
            >
              <MenuItem value="简短">简短</MenuItem>
              <MenuItem value="中等">中等</MenuItem>
              <MenuItem value="详细">详细</MenuItem>
            </Select>
          </FormControl>
        );
      case 'style':
        return (
          <>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>文本风格</InputLabel>
              <Select
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                label="文本风格"
              >
                <MenuItem value="专业">专业/学术</MenuItem>
                <MenuItem value="商务">商务/正式</MenuItem>
                <MenuItem value="通俗">通俗/易懂</MenuItem>
                <MenuItem value="创意">创意/文学</MenuItem>
                <MenuItem value="网络">网络/口语化</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>语气</InputLabel>
              <Select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                label="语气"
              >
                <MenuItem value="正式">正式</MenuItem>
                <MenuItem value="友好">友好</MenuItem>
                <MenuItem value="幽默">幽默</MenuItem>
                <MenuItem value="严肃">严肃</MenuItem>
                <MenuItem value="热情">热情</MenuItem>
              </Select>
            </FormControl>
          </>
        );
      case 'translate':
        return (
          <>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>源语言</InputLabel>
              <Select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                label="源语言"
              >
                <MenuItem value="中文">中文</MenuItem>
                <MenuItem value="英语">英语</MenuItem>
                <MenuItem value="日语">日语</MenuItem>
                <MenuItem value="法语">法语</MenuItem>
                <MenuItem value="德语">德语</MenuItem>
                <MenuItem value="西班牙语">西班牙语</MenuItem>
                <MenuItem value="俄语">俄语</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>目标语言</InputLabel>
              <Select
                value={targetLanguage}
                onChange={(e) => setTargetLanguage(e.target.value)}
                label="目标语言"
              >
                <MenuItem value="中文">中文</MenuItem>
                <MenuItem value="英语">英语</MenuItem>
                <MenuItem value="日语">日语</MenuItem>
                <MenuItem value="法语">法语</MenuItem>
                <MenuItem value="德语">德语</MenuItem>
                <MenuItem value="西班牙语">西班牙语</MenuItem>
                <MenuItem value="俄语">俄语</MenuItem>
              </Select>
            </FormControl>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{ENHANCEMENT_LABELS[enhancementType]}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, my: 2 }}>
          <FormControl fullWidth>
            <InputLabel>选择模型</InputLabel>
            <Select
              value={model}
              onChange={(e) => setModel(e.target.value as AIModel)}
              label="选择模型"
            >
              <MenuItem value="openai">OpenAI</MenuItem>
              <MenuItem value="deepseek">DeepSeek</MenuItem>
              <MenuItem value="zhipu">智谱AI</MenuItem>
            </Select>
          </FormControl>

          {renderOptions()}

          <FormControlLabel
            control={
              <Switch
                checked={showOriginal}
                onChange={(e) => setShowOriginal(e.target.checked)}
              />
            }
            label="显示原文"
          />

          {showOriginal && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                原文内容：
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  p: 2,
                  bgcolor: 'grey.100',
                  borderRadius: 1,
                  maxHeight: '150px',
                  overflowY: 'auto',
                }}
              >
                {text}
              </Typography>
            </Box>
          )}

          {isGenerating && <LinearProgress />}

          {generatedText && (
            <Box sx={{ mt: 2 }}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" gutterBottom>
                生成结果：
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  p: 2,
                  bgcolor: 'grey.100',
                  borderRadius: 1,
                  maxHeight: '250px',
                  overflowY: 'auto',
                }}
              >
                {generatedText}
              </Typography>
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>取消</Button>
        <Button
          onClick={handleGenerate}
          variant="contained"
          disabled={isGenerating}
        >
          {isGenerating ? '生成中...' : '开始生成'}
        </Button>
        {generatedText && (
          <Button
            onClick={handleComplete}
            variant="contained"
            color="success"
          >
            使用此内容
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}; 