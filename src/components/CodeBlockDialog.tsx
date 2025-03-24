import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';

interface CodeBlockDialogProps {
  open: boolean;
  onClose: () => void;
  onInsert: (code: string, language: string) => void;
  initialCode?: string;
  initialLanguage?: string;
}

export const CodeBlockDialog: React.FC<CodeBlockDialogProps> = ({
  open,
  onClose,
  onInsert,
  initialCode = '',
  initialLanguage = 'javascript',
}) => {
  const [code, setCode] = useState(initialCode);
  const [language, setLanguage] = useState(initialLanguage);

  // 当对话框打开时或初始值改变时更新状态
  useEffect(() => {
    if (open) {
      setCode(initialCode);
      setLanguage(initialLanguage);
    }
  }, [open, initialCode, initialLanguage]);

  const handleInsert = () => {
    onInsert(code, language);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>插入代码块</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, my: 2 }}>
          <FormControl fullWidth>
            <InputLabel>编程语言</InputLabel>
            <Select
              value={language}
              label="编程语言"
              onChange={(e) => setLanguage(e.target.value)}
            >
              <MenuItem value="javascript">JavaScript</MenuItem>
              <MenuItem value="typescript">TypeScript</MenuItem>
              <MenuItem value="python">Python</MenuItem>
              <MenuItem value="java">Java</MenuItem>
              <MenuItem value="csharp">C#</MenuItem>
              <MenuItem value="cpp">C++</MenuItem>
              <MenuItem value="php">PHP</MenuItem>
              <MenuItem value="ruby">Ruby</MenuItem>
              <MenuItem value="go">Go</MenuItem>
              <MenuItem value="rust">Rust</MenuItem>
              <MenuItem value="swift">Swift</MenuItem>
              <MenuItem value="kotlin">Kotlin</MenuItem>
              <MenuItem value="scala">Scala</MenuItem>
              <MenuItem value="html">HTML</MenuItem>
              <MenuItem value="css">CSS</MenuItem>
              <MenuItem value="sql">SQL</MenuItem>
              <MenuItem value="shell">Shell</MenuItem>
              <MenuItem value="json">JSON</MenuItem>
              <MenuItem value="xml">XML</MenuItem>
              <MenuItem value="yaml">YAML</MenuItem>
              <MenuItem value="markdown">Markdown</MenuItem>
              <MenuItem value="plaintext">Plain Text</MenuItem>
            </Select>
          </FormControl>
          
          <TextField
            label="代码内容"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            multiline
            minRows={8}
            maxRows={20}
            fullWidth
            placeholder="在此输入代码..."
            variant="outlined"
            InputProps={{
              style: {
                fontFamily: 'Consolas, Monaco, "Andale Mono", monospace',
                fontSize: '14px',
              },
            }}
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