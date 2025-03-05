import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  IconButton,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import { SmartToy, Send, Close } from '@mui/icons-material';
import { AIServiceFactory } from '../services/ai/factory';
import { AIRequestOptions } from '../types/ai';

interface AIAssistantProps {
  onResponse: (text: string) => void;
  selectedText?: string;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({ onResponse, selectedText }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableModels, setAvailableModels] = useState<string[]>([]);

  useEffect(() => {
    const factory = AIServiceFactory.getInstance();
    setAvailableModels(factory.getAllAvailableModels());
    if (availableModels.length > 0) {
      setSelectedModel(availableModels[0]);
    }
  }, []);

  useEffect(() => {
    if (selectedText) {
      setPrompt(`请帮我优化以下文本：${selectedText}`);
    }
  }, [selectedText]);

  const handleSubmit = async () => {
    if (!prompt.trim() || !selectedModel) return;

    setIsLoading(true);
    setError(null);

    try {
      const factory = AIServiceFactory.getInstance();
      const service = factory.getService(selectedModel);
      
      if (!service) {
        throw new Error('Selected AI service not available');
      }

      const options: AIRequestOptions = {
        model: selectedModel as any,
        temperature: 0.7,
        maxTokens: 2000,
      };

      let responseText = '';
      await service.generateStream(prompt, options, (token) => {
        responseText += token;
        onResponse(responseText);
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <IconButton
        onClick={() => setIsOpen(!isOpen)}
        color={isOpen ? 'primary' : 'default'}
        size="small"
      >
        <SmartToy />
      </IconButton>

      {isOpen && (
        <Paper
          elevation={3}
          sx={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            width: 400,
            maxHeight: 500,
            display: 'flex',
            flexDirection: 'column',
            zIndex: 1000,
          }}
        >
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6">AI助手</Typography>
            <IconButton size="small" onClick={() => setIsOpen(false)}>
              <Close />
            </IconButton>
          </Box>

          <Box sx={{ p: 2, flexGrow: 1, overflow: 'auto' }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>选择模型</InputLabel>
              <Select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                label="选择模型"
              >
                {availableModels.map((model) => (
                  <MenuItem key={model} value={model}>
                    {model}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              multiline
              rows={4}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="输入你的问题..."
              disabled={isLoading}
              sx={{ mb: 2 }}
            />

            <Button
              fullWidth
              variant="contained"
              onClick={handleSubmit}
              disabled={isLoading || !prompt.trim()}
              startIcon={isLoading ? <CircularProgress size={20} /> : <Send />}
            >
              {isLoading ? '生成中...' : '发送'}
            </Button>
          </Box>
        </Paper>
      )}

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
      >
        <Alert onClose={() => setError(null)} severity="error">
          {error}
        </Alert>
      </Snackbar>
    </>
  );
}; 