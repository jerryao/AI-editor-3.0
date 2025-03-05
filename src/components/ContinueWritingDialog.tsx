import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Chip,
  Typography,
  LinearProgress,
} from '@mui/material';
import { AIModel } from '../types/ai';
import { WritingService, WritingContext } from '../services/ai/writing';

interface ContinueWritingDialogProps {
  open: boolean;
  onClose: () => void;
  onComplete: (text: string) => void;
  previousText: string;
  currentText: string;
}

export const ContinueWritingDialog: React.FC<ContinueWritingDialogProps> = ({
  open,
  onClose,
  onComplete,
  previousText,
  currentText,
}) => {
  const [model, setModel] = useState<AIModel>('openai');
  const [writingStyle, setWritingStyle] = useState('');
  const [tone, setTone] = useState('');
  const [genre, setGenre] = useState('');
  const [keyword, setKeyword] = useState('');
  const [keywords, setKeywords] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedText, setGeneratedText] = useState('');

  const handleAddKeyword = () => {
    if (keyword && !keywords.includes(keyword)) {
      setKeywords([...keywords, keyword]);
      setKeyword('');
    }
  };

  const handleRemoveKeyword = (keywordToRemove: string) => {
    setKeywords(keywords.filter(k => k !== keywordToRemove));
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGeneratedText('');

    const writingService = WritingService.getInstance();
    const context: WritingContext = {
      previousParagraphs: previousText,
      currentParagraph: currentText,
      writingStyle,
      tone,
      genre,
      keywords: keywords.length > 0 ? keywords : undefined,
    };

    try {
      await writingService.continueWriting(context, model, (token) => {
        setGeneratedText(prev => prev + token);
      });
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

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>继续写作</DialogTitle>
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

          <TextField
            label="写作风格"
            value={writingStyle}
            onChange={(e) => setWritingStyle(e.target.value)}
            placeholder="例如：严谨、活泼、简洁"
          />

          <TextField
            label="语气"
            value={tone}
            onChange={(e) => setTone(e.target.value)}
            placeholder="例如：正式、轻松、幽默"
          />

          <TextField
            label="文体"
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            placeholder="例如：记叙文、议论文、说明文"
          />

          <Box>
            <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
              <TextField
                label="关键词"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddKeyword()}
                placeholder="按回车添加关键词"
                fullWidth
              />
              <Button onClick={handleAddKeyword} variant="contained">
                添加
              </Button>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {keywords.map((k) => (
                <Chip
                  key={k}
                  label={k}
                  onDelete={() => handleRemoveKeyword(k)}
                />
              ))}
            </Box>
          </Box>

          {isGenerating && <LinearProgress />}

          {generatedText && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                生成的内容：
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  p: 2,
                  bgcolor: 'grey.100',
                  borderRadius: 1,
                  maxHeight: '200px',
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