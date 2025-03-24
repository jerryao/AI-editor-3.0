import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
} from '@mui/material';

interface LinkDialogProps {
  open: boolean;
  onClose: () => void;
  onInsert: (url: string, text: string) => void;
  initialUrl?: string;
  initialText?: string;
}

export const LinkDialog: React.FC<LinkDialogProps> = ({
  open,
  onClose,
  onInsert,
  initialUrl = 'https://',
  initialText = '',
}) => {
  const [url, setUrl] = useState(initialUrl);
  const [text, setText] = useState(initialText);

  // 当对话框打开时或初始值改变时更新状态
  useEffect(() => {
    if (open) {
      setUrl(initialUrl);
      setText(initialText);
    }
  }, [open, initialUrl, initialText]);

  const handleInsert = () => {
    // 验证URL格式
    try {
      // 如果没有协议前缀，添加 https://
      let validUrl = url;
      if (!/^https?:\/\//i.test(validUrl)) {
        validUrl = 'https://' + validUrl;
      }
      
      // 测试URL是否有效
      new URL(validUrl);
      
      onInsert(validUrl, text);
    } catch (e) {
      // URL无效，仍然插入但可能不是链接
      onInsert(url, text);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>插入链接</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, my: 2 }}>
          <TextField
            autoFocus
            label="链接地址"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            fullWidth
          />
          <TextField
            label="链接文本"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="显示的文本"
            fullWidth
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>取消</Button>
        <Button onClick={handleInsert} variant="contained" color="primary">
          插入
        </Button>
      </DialogActions>
    </Dialog>
  );
};
