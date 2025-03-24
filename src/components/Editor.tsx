import React, { useCallback, useState, useEffect } from 'react';
import { createEditor, BaseEditor, Element as SlateElement, Descendant, Range, Editor, Transforms } from 'slate';
import { Slate, Editable, withReact, useSlate, ReactEditor } from 'slate-react';
import { withHistory, HistoryEditor } from 'slate-history';
import { Box, IconButton, Tooltip, Select, MenuItem, Divider, Snackbar, Alert, Paper } from '@mui/material';
import {
  Undo, Redo, FormatPaint, FormatClear,
  FormatBold, FormatItalic, FormatUnderlined, StrikethroughS,
  Link, Code, Subscript, Superscript, RemoveFromQueue,
  TaskAlt, EmojiEmotions, Highlight,
  FormatColorText, FormatAlignLeft, FormatAlignCenter, FormatAlignRight, FormatAlignJustify,
  FormatListBulleted, FormatListNumbered,
  FormatIndentDecrease, FormatIndentIncrease, KeyboardReturn,
  Image, VideoLibrary, AttachFile, FormatQuote,
  ViewQuilt, DataObject, TableChart, Code as CodeIcon,
  Print, Fullscreen, SmartToy
} from '@mui/icons-material';
import { Document, Packer, Paragraph, TextRun, UnderlineType } from 'docx';
import { saveAs } from 'file-saver';
import { AIAssistant } from './AIAssistant';
import { AIServiceFactory } from '../services/ai/factory';
import { Toolbar } from './Toolbar';
import { ContinueWritingDialog } from './ContinueWritingDialog';
import { EnhancementDialog, EnhancementType } from './EnhancementDialog';

// 定义自定义类型
type CustomElement = {
  type: 'paragraph' | 'heading-one' | 'heading-two' | 'heading-three' | 'code' | 'quote' | 'bulleted-list' | 'numbered-list' | 'list-item' | 'image';
  align?: 'left' | 'center' | 'right' | 'justify';
  children: CustomText[];
};

type CustomText = {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  backgroundColor?: string;
  lineHeight?: string;
};

// 扩展 Slate 的类型定义
declare module 'slate' {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor & HistoryEditor;
    Element: CustomElement;
    Text: CustomText;
  }
}

const initialValue: CustomElement[] = [
  {
    type: 'paragraph',
    children: [{ text: '开始输入...' }],
  },
];

// Add image upload configuration
const imageConfig = {
  allowBase64: true,
  defaultSize: 600,
  customMenuInvoke: (editor: any) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    input.onchange = async (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files) {
        for (const file of Array.from(files)) {
          await handleImageUpload(file, editor);
        }
      }
    };
    input.click();
  },
  uploadUrl: process.env.REACT_APP_IMAGE_UPLOAD_URL || 'https://api.example.com/upload',
  uploadFormName: 'image',
  uploadHeaders: {
    'Accept': 'application/json',
  },
  uploader: async (file: File): Promise<Record<string, any>> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve({
          errorCode: 0,
          data: {
            src: reader.result as string,
            alt: file.name,
            align: 'center',
            width: '350px',
            height: 'auto'
          }
        });
      };
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  },
  uploaderEvent: {
    onUploadBefore: (file: File) => {
      if (!file.type.startsWith('image/')) {
        throw new Error('只能上传图片文件');
      }

      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        throw new Error('图片大小不能超过 5MB');
      }

      return true;
    },
    onSuccess: (file: File, response: any) => {
      if (response.errorCode === 0 && response.data?.src) {
        return {
          src: response.data.src,
          alt: response.data.alt || file.name,
          align: response.data.align || 'center',
          width: response.data.width || '350px',
          height: response.data.height || 'auto',
        };
      }
      return false;
    },
    onFailed: (file: File, response: any) => {
      console.error('图片上传失败:', response);
      throw new Error('图片上传失败');
    },
    onError: (file: File, error: Error) => {
      console.error('图片上传错误:', error);
      throw error;
    },
  },
  bubbleMenuItems: ['AlignLeft', 'AlignCenter', 'AlignRight', 'delete'],
};

// Modify handleImageUpload to be simpler
const handleImageUpload = async (file: File, editor: any) => {
  const canUpload = imageConfig.uploaderEvent.onUploadBefore(file);

  if (!canUpload) {
    return;
  }

  const response = await imageConfig.uploader(file);
  const imageData = imageConfig.uploaderEvent.onSuccess(file, response);
  
  if (imageData) {
    insertImage(editor, imageData);
  }
};

// Add image insertion function
const insertImage = (editor: any, imageData: any) => {
  const image = {
    type: 'image',
    url: imageData.src,
    alt: imageData.alt,
    align: imageData.align,
    children: [{ text: '' }],
    ...imageData,
  };

  editor.insertNode(image);
};

// Add TextSelectionBubbleMenu configuration
const textSelectionBubbleMenuConfig = {
  enable: true,
  items: ["ai", "Bold", "Italic", "Underline", "Strike", "code"],
};

// Add TextSelectionBubbleMenu component
const TextSelectionBubbleMenu = () => {
  const editor = useSlate();
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const updateBubbleMenu = () => {
      const { selection } = editor;
      if (!selection || !textSelectionBubbleMenuConfig.enable || !Range.isExpanded(selection)) {
        setIsVisible(false);
        return;
      }

      const domSelection = window.getSelection();
      if (!domSelection || domSelection.rangeCount === 0) {
        setIsVisible(false);
        return;
      }

      const domRange = domSelection.getRangeAt(0);
      const rect = domRange.getBoundingClientRect();
      
      setPosition({
        top: rect.top - 40,
        left: rect.left + rect.width / 2 - 100,
      });
      setIsVisible(true);
    };

    document.addEventListener('selectionchange', updateBubbleMenu);
    return () => {
      document.removeEventListener('selectionchange', updateBubbleMenu);
    };
  }, [editor]);

  if (!isVisible) {
    return null;
  }

  return (
    <Paper
      elevation={3}
      sx={{
        position: 'fixed',
        top: `${position.top}px`,
        left: `${position.left}px`,
        zIndex: 1000,
        padding: '4px',
        display: 'flex',
        gap: '4px',
        backgroundColor: '#fff',
        borderRadius: '4px',
      }}
    >
      <Tooltip title="AI助手">
        <IconButton size="small" onClick={() => {
          // TODO: Implement AI assistant functionality
          console.log('AI assistant clicked');
        }}>
          <SmartToy fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="加粗">
        <IconButton
          size="small"
          onClick={(e) => {
            e.preventDefault();
            Editor.addMark(editor, 'bold', true);
          }}
        >
          <FormatBold fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="斜体">
        <IconButton
          size="small"
          onClick={(e) => {
            e.preventDefault();
            Editor.addMark(editor, 'italic', true);
          }}
        >
          <FormatItalic fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="下划线">
        <IconButton
          size="small"
          onClick={(e) => {
            e.preventDefault();
            Editor.addMark(editor, 'underline', true);
          }}
        >
          <FormatUnderlined fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="删除线">
        <IconButton
          size="small"
          onClick={(e) => {
            e.preventDefault();
            Editor.addMark(editor, 'strikethrough', true);
          }}
        >
          <StrikethroughS fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="代码">
        <IconButton
          size="small"
          onClick={(e) => {
            e.preventDefault();
            Editor.addMark(editor, 'code', true);
          }}
        >
          <Code fontSize="small" />
        </IconButton>
      </Tooltip>
    </Paper>
  );
};

const CustomEditor = () => {
  const [editor] = useState(() => withHistory(withReact(createEditor())));
  const [value, setValue] = useState<CustomElement[]>(initialValue);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [selectedText, setSelectedText] = useState<string>('');
  const [showContinueWriting, setShowContinueWriting] = useState(false);
  const [showEnhancement, setShowEnhancement] = useState(false);
  const [enhancementType, setEnhancementType] = useState<EnhancementType>('summary');

  // 初始化AI服务
  useEffect(() => {
    const factory = AIServiceFactory.getInstance();
    factory.initialize({
      openai: {
        apiKey: process.env.REACT_APP_OPENAI_API_KEY || '',
        baseUrl: process.env.REACT_APP_OPENAI_BASE_URL,
      },
      deepseek: {
        apiKey: process.env.REACT_APP_DEEPSEEK_API_KEY || '',
        baseUrl: process.env.REACT_APP_DEEPSEEK_BASE_URL,
      },
      zhipu: {
        apiKey: process.env.REACT_APP_ZHIPU_API_KEY || '',
        baseUrl: process.env.REACT_APP_ZHIPU_BASE_URL,
      },
    });
  }, []);

  // 处理文本选择
  const handleSelect = useCallback(() => {
    const { selection } = editor;
    if (selection && Range.isExpanded(selection)) {
      const [start, end] = Range.edges(selection);
      const text = Editor.string(editor, { anchor: start, focus: end });
      setSelectedText(text);
    } else {
      setSelectedText('');
    }
  }, [editor]);

  // 处理AI响应
  const handleAIResponse = useCallback((text: string) => {
    const { selection } = editor;
    if (selection && Range.isExpanded(selection)) {
      const [start, end] = Range.edges(selection);
      Transforms.delete(editor, { at: { anchor: start, focus: end } });
      Transforms.insertText(editor, text, { at: start });
    } else {
      Transforms.insertText(editor, text);
    }
  }, [editor]);

  const handleImageUploadWithSnackbar = useCallback(async (file: File) => {
    try {
      await handleImageUpload(file, editor);
      setSnackbar({
        open: true,
        message: '图片上传成功',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : '图片上传失败',
        severity: 'error'
      });
    }
  }, [editor]);

  useEffect(() => {
    imageConfig.customMenuInvoke = (editor: any) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.multiple = true;
      input.onchange = async (e) => {
        const files = (e.target as HTMLInputElement).files;
        if (files) {
          for (const file of Array.from(files)) {
            await handleImageUploadWithSnackbar(file);
          }
        }
      };
      input.click();
    };
  }, [handleImageUploadWithSnackbar]);

  const handleChange = useCallback((newValue: Descendant[]) => {
    setValue(newValue as CustomElement[]);
  }, []);

  const exportToWord = useCallback(async () => {
    const { children } = editor;
    const doc = new Document({
      sections: [{
        properties: {},
        children: children.map((node: Descendant) => {
          if (!SlateElement.isElement(node)) {
            return new Paragraph({
              children: [new TextRun({ text: node.text })],
            });
          }
          const customNode = node as CustomElement;
          switch (customNode.type) {
            case 'paragraph':
              return new Paragraph({
                children: customNode.children.map(child => {
                  const textRun = new TextRun({
                    text: child.text,
                    bold: child.bold,
                    italics: child.italic,
                    underline: child.underline ? { type: UnderlineType.SINGLE } : undefined,
                  });
                  return textRun;
                }),
              });
            case 'code':
              return new Paragraph({
                children: customNode.children.map(child => 
                  new TextRun({
                    text: child.text,
                    font: 'Courier New',
                  })
                ),
              });
            case 'quote':
              return new Paragraph({
                indent: { left: 720 }, // 0.5 inch indent
                children: customNode.children.map(child => 
                  new TextRun({
                    text: child.text,
                    italics: true,
                  })
                ),
              });
            case 'bulleted-list':
              return new Paragraph({
                bullet: { level: 0 },
                children: customNode.children.map(child => 
                  new TextRun({
                    text: child.text,
                  })
                ),
              });
            case 'numbered-list':
              return new Paragraph({
                numbering: { reference: 'numbered-list', level: 0 },
                children: customNode.children.map(child => 
                  new TextRun({
                    text: child.text,
                  })
                ),
              });
            default:
              return new Paragraph({
                children: customNode.children.map(child => 
                  new TextRun({
                    text: child.text,
                  })
                ),
              });
          }
        }),
      }],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, 'document.docx');
  }, [editor]);

  const renderElement = useCallback((props: any) => {
    const { element, attributes, children } = props;
    switch (element.type) {
      case 'image':
        return (
          <div {...attributes}>
            <div contentEditable={false} style={{ textAlign: element.align }}>
              <img
                src={element.url}
                alt={element.alt}
                style={{
                  width: '65%',
                  maxWidth: '65%',
                  height: 'auto',
                  display: 'block',
                  margin: '0 auto',
                }}
              />
            </div>
            {children}
          </div>
        );
      case 'heading-one':
        return (
          <h1 
            style={{
              fontFamily: 'SimHei',
              fontSize: '2em',
              marginBottom: '0.5em',
              marginTop: '1em',
              fontWeight: 'bold',
              lineHeight: '1.5',
            }} 
            {...attributes}
          >
            {children}
          </h1>
        );
      case 'heading-two':
        return (
          <h2 
            style={{
              fontFamily: 'SimHei',
              fontSize: '1.5em',
              marginBottom: '0.5em',
              marginTop: '0.8em',
              fontWeight: 'bold',
              lineHeight: '1.5',
            }} 
            {...attributes}
          >
            {children}
          </h2>
        );
      case 'heading-three':
        return (
          <h3 
            style={{
              fontFamily: 'SimHei',
              fontSize: '1.17em',
              marginBottom: '0.5em',
              marginTop: '0.6em',
              fontWeight: 'bold',
              lineHeight: '1.5',
            }} 
            {...attributes}
          >
            {children}
          </h3>
        );
      case 'paragraph':
        return (
          <p 
            style={{
              fontFamily: 'SimSun',
              fontSize: '14px',
              marginBottom: '1em',
              lineHeight: '1.8',
              textIndent: '2em',
            }} 
            {...attributes}
          >
            {children}
          </p>
        );
      default:
        return <DefaultElement {...props} />;
    }
  }, []);

  const renderLeaf = useCallback((props: any) => {
    return <Leaf {...props} />;
  }, []);

  const handleAIAction = useCallback((action: string) => {
    const { selection } = editor;
    let text = '';
    
    // 获取选中的文本
    if (selection && !Range.isCollapsed(selection)) {
      text = Editor.string(editor, selection);
    }
    
    switch (action) {
      case 'continue': {
        // 获取当前选中文本之前的所有内容作为上下文
        if (selection) {
          const [start] = Range.edges(selection);
          const before = Editor.before(editor, start);
          if (before) {
            // 使用内联代码替代命名变量
            Editor.string(editor, {
              anchor: Editor.start(editor, []),
              focus: before,
            });
          }
          // 使用内联代码替代命名变量
          Editor.string(editor, selection);
        } else {
          // 如果没有选中文本，使用光标位置之前的内容
          const point = editor.selection?.anchor;
          if (point) {
            // 使用内联代码替代命名变量
            Editor.string(editor, {
              anchor: Editor.start(editor, []),
              focus: point,
            });
          }
        }

        setShowContinueWriting(true);
        break;
      }
      case 'summary':
      case 'proofread':
      case 'style':
      case 'translate':
      case 'optimize': {
        if (!text && selection) {
          // 如果没有选中文本但有光标，获取当前段落
          const [node] = Editor.node(editor, selection);
          if (SlateElement.isElement(node)) {
            text = Editor.string(editor, selection.anchor.path.slice(0, -1));
          }
        }
        
        if (text) {
          setSelectedText(text);
          setEnhancementType(action as EnhancementType);
          setShowEnhancement(true);
        } else {
          setSnackbar({
            open: true,
            message: '请先选择要处理的文本',
            severity: 'warning',
          });
        }
        break;
      }
    }
  }, [editor]);

  const handleContinueWritingComplete = useCallback((generatedText: string) => {
    const { selection } = editor;
    
    if (selection) {
      // 如果有选中文本，在选中文本后插入
      const [, end] = Range.edges(selection);
      Transforms.insertText(editor, generatedText, { at: end });
    } else {
      // 如果没有选中文本，在当前光标位置插入
      Transforms.insertText(editor, generatedText);
    }
  }, [editor]);

  const handleEnhancementComplete = useCallback((generatedText: string) => {
    const { selection } = editor;
    
    if (selection && !Range.isCollapsed(selection)) {
      // 如果有选中文本，替换选中文本
      Transforms.delete(editor);
      Transforms.insertText(editor, generatedText, { at: selection.anchor });
    } else if (selection) {
      // 如果没有选中文本，在当前光标位置插入
      Transforms.insertText(editor, generatedText);
    }
  }, [editor]);

  // 导出为 Word 功能
  useEffect(() => {
    // 将导出方法添加到编辑器实例
    (editor as any).exportToWord = exportToWord;
  }, [editor, exportToWord]);

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ width: '100%', height: '100%' }}>
        <Slate 
          editor={editor} 
          value={value}
          onChange={handleChange}
        >
          <Box sx={{ 
            border: '1px solid #ccc', 
            borderRadius: '4px',
            overflow: 'hidden'
          }}>
            <Toolbar editor={editor} onAIAction={handleAIAction} />
            <Box sx={{
              padding: '20px',
              minHeight: '500px',
              position: 'relative',
            }}>
              <TextSelectionBubbleMenu />
              <Editable
                onSelect={handleSelect}
                renderElement={renderElement}
                renderLeaf={renderLeaf}
                placeholder="开始输入..."
                spellCheck
                autoFocus
              />
            </Box>
          </Box>
        </Slate>
        <AIAssistant
          onResponse={handleAIResponse}
          selectedText={selectedText}
        />
        <ContinueWritingDialog
          open={showContinueWriting}
          onClose={() => setShowContinueWriting(false)}
          onComplete={handleContinueWritingComplete}
          previousText={editor.selection ? Editor.string(editor, {
            anchor: Editor.start(editor, []),
            focus: editor.selection.anchor,
          }) : ''}
          currentText={editor.selection ? Editor.string(editor, editor.selection) : ''}
        />
        <EnhancementDialog
          open={showEnhancement}
          onClose={() => setShowEnhancement(false)}
          onComplete={handleEnhancementComplete}
          text={selectedText}
          enhancementType={enhancementType}
        />
      </Box>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity as 'error' | 'info' | 'success' | 'warning'}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

const Leaf = ({ attributes, children, leaf }: any) => {
  const style: React.CSSProperties = {
    fontWeight: leaf.bold ? 'bold' : 'normal',
    fontStyle: leaf.italic ? 'italic' : 'normal',
    textDecoration: [
      leaf.underline && 'underline',
      leaf.strikethrough && 'line-through',
    ].filter(Boolean).join(' '),
    fontSize: leaf.fontSize ? `${leaf.fontSize}px` : 'inherit',
    fontFamily: leaf.fontFamily || 'inherit',
    color: leaf.color || 'inherit',
    backgroundColor: leaf.backgroundColor || 'inherit',
    lineHeight: leaf.lineHeight || 'inherit',
  };

  return <span style={style} {...attributes}>{children}</span>;
};

const FormatToolbar = () => {
  const editor = useSlate();
  
  const isMarkActive = (format: keyof Omit<CustomText, 'text'>) => {
    const marks = Editor.marks(editor);
    return marks ? marks[format] === true : false;
  };

  const isBlockActive = (format: CustomElement['type']) => {
    const [match] = Array.from(Editor.nodes(editor, {
      match: n => !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === format,
    }));
    return !!match;
  };

  const isAlignActive = (align: CustomElement['align']) => {
    const [match] = Array.from(Editor.nodes(editor, {
      match: n => !Editor.isEditor(n) && SlateElement.isElement(n) && n.align === align,
    }));
    return !!match;
  };

  const toggleMark = (format: keyof Omit<CustomText, 'text'>) => {
    const isActive = isMarkActive(format);
    if (isActive) {
      Editor.removeMark(editor, format);
    } else {
      Editor.addMark(editor, format, true);
    }
  };

  const toggleBlock = (format: CustomElement['type']) => {
    const isActive = isBlockActive(format);
    Transforms.setNodes(
      editor,
      { type: isActive ? 'paragraph' : format },
      { match: n => !Editor.isEditor(n) && SlateElement.isElement(n) }
    );
  };

  const toggleAlign = (align: CustomElement['align']) => {
    const isActive = isAlignActive(align);
    Transforms.setNodes(
      editor,
      { align: isActive ? 'left' : align },
      { match: n => !Editor.isEditor(n) && SlateElement.isElement(n) }
    );
  };

  const setFontSize = (size: number) => {
    Editor.addMark(editor, 'fontSize', size);
  };

  const setFontFamily = (font: string) => {
    Editor.addMark(editor, 'fontFamily', font);
  };

  const setColor = (color: string) => {
    Editor.addMark(editor, 'color', color);
  };

  const setBackgroundColor = (color: string) => {
    Editor.addMark(editor, 'backgroundColor', color);
  };

  const setLineHeight = (lineHeight: string) => {
    Editor.addMark(editor, 'lineHeight', lineHeight);
  };

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
      <Tooltip title="撤销">
        <IconButton size="small" onMouseDown={(e) => { e.preventDefault(); editor.undo(); }}>
          <Undo />
        </IconButton>
      </Tooltip>
      <Tooltip title="重做">
        <IconButton size="small" onMouseDown={(e) => { e.preventDefault(); editor.redo(); }}>
          <Redo />
        </IconButton>
      </Tooltip>
      <Tooltip title="格式刷">
        <IconButton size="small"><FormatPaint /></IconButton>
      </Tooltip>
      <Tooltip title="清除格式">
        <IconButton size="small"><FormatClear /></IconButton>
      </Tooltip>
      <Divider orientation="vertical" flexItem />
      
      <Select 
        size="small" 
        defaultValue="paragraph"
        onChange={(e) => toggleBlock(e.target.value as CustomElement['type'])}
      >
        <MenuItem value="paragraph">正文</MenuItem>
        <MenuItem value="heading-one">标题1</MenuItem>
        <MenuItem value="heading-two">标题2</MenuItem>
        <MenuItem value="heading-three">标题3</MenuItem>
      </Select>
      
      <Select 
        size="small" 
        defaultValue="default"
        onChange={(e) => setFontFamily(e.target.value)}
      >
        <MenuItem value="default">默认字体</MenuItem>
        <MenuItem value="SimSun">宋体</MenuItem>
        <MenuItem value="FangSong">仿宋</MenuItem>
        <MenuItem value="SimHei">黑体</MenuItem>
        <MenuItem value="KaiTi">楷体</MenuItem>
        <MenuItem value="Microsoft YaHei">微软雅黑</MenuItem>
        <MenuItem value="FangSong_GB2312">方正仿宋简体</MenuItem>
        <MenuItem value="Arial">Arial</MenuItem>
      </Select>
      
      <Select 
        size="small" 
        defaultValue="14"
        onChange={(e) => setFontSize(Number(e.target.value))}
      >
        <MenuItem value="56">初号 (56px)</MenuItem>
        <MenuItem value="48">小初 (48px)</MenuItem>
        <MenuItem value="34.7">一号 (34.7px)</MenuItem>
        <MenuItem value="32">小一 (32px)</MenuItem>
        <MenuItem value="29.3">二号 (29.3px)</MenuItem>
        <MenuItem value="24">小二 (24px)</MenuItem>
        <MenuItem value="21.3">三号 (21.3px)</MenuItem>
        <MenuItem value="20">小三 (20px)</MenuItem>
        <MenuItem value="18.7">四号 (18.7px)</MenuItem>
        <MenuItem value="16">小四 (16px)</MenuItem>
        <MenuItem value="14">五号 (14px)</MenuItem>
        <MenuItem value="12">小五 (12px)</MenuItem>
      </Select>
      
      <Divider orientation="vertical" flexItem />
      
      <Tooltip title="加粗">
        <IconButton 
          size="small" 
          onMouseDown={(e) => { e.preventDefault(); toggleMark('bold'); }}
          color={isMarkActive('bold') ? 'primary' : 'default'}
        >
          <FormatBold />
        </IconButton>
      </Tooltip>
      <Tooltip title="斜体">
        <IconButton 
          size="small"
          onMouseDown={(e) => { e.preventDefault(); toggleMark('italic'); }}
          color={isMarkActive('italic') ? 'primary' : 'default'}
        >
          <FormatItalic />
        </IconButton>
      </Tooltip>
      <Tooltip title="下划线">
        <IconButton 
          size="small"
          onMouseDown={(e) => { e.preventDefault(); toggleMark('underline'); }}
          color={isMarkActive('underline') ? 'primary' : 'default'}
        >
          <FormatUnderlined />
        </IconButton>
      </Tooltip>
      <Tooltip title="删除线">
        <IconButton 
          size="small"
          onMouseDown={(e) => { e.preventDefault(); toggleMark('strikethrough'); }}
          color={isMarkActive('strikethrough') ? 'primary' : 'default'}
        >
          <StrikethroughS />
        </IconButton>
      </Tooltip>
      
      <Divider orientation="vertical" flexItem />
      
      <Tooltip title="链接">
        <IconButton size="small"><Link /></IconButton>
      </Tooltip>
      <Tooltip title="行内代码">
        <IconButton size="small"><Code /></IconButton>
      </Tooltip>
      <Tooltip title="下标">
        <IconButton size="small"><Subscript /></IconButton>
      </Tooltip>
      <Tooltip title="上标">
        <IconButton size="small"><Superscript /></IconButton>
      </Tooltip>
      <Tooltip title="分割线">
        <IconButton size="small"><RemoveFromQueue /></IconButton>
      </Tooltip>
      
      <Divider orientation="vertical" flexItem />
      
      <Tooltip title="任务列表">
        <IconButton size="small"><TaskAlt /></IconButton>
      </Tooltip>
      <Tooltip title="表情">
        <IconButton size="small"><EmojiEmotions /></IconButton>
      </Tooltip>
      <Tooltip title="高亮">
        <IconButton size="small"><Highlight /></IconButton>
      </Tooltip>
      <Tooltip title="字体颜色">
        <IconButton size="small"><FormatColorText /></IconButton>
      </Tooltip>
      
      <Divider orientation="vertical" flexItem />
      
      <Tooltip title="左对齐">
        <IconButton 
          size="small"
          onMouseDown={(e) => { e.preventDefault(); toggleAlign('left'); }}
          color={isAlignActive('left') ? 'primary' : 'default'}
        >
          <FormatAlignLeft />
        </IconButton>
      </Tooltip>
      <Tooltip title="居中对齐">
        <IconButton 
          size="small"
          onMouseDown={(e) => { e.preventDefault(); toggleAlign('center'); }}
          color={isAlignActive('center') ? 'primary' : 'default'}
        >
          <FormatAlignCenter />
        </IconButton>
      </Tooltip>
      <Tooltip title="右对齐">
        <IconButton 
          size="small"
          onMouseDown={(e) => { e.preventDefault(); toggleAlign('right'); }}
          color={isAlignActive('right') ? 'primary' : 'default'}
        >
          <FormatAlignRight />
        </IconButton>
      </Tooltip>
      <Tooltip title="两端对齐">
        <IconButton 
          size="small"
          onMouseDown={(e) => { e.preventDefault(); toggleAlign('justify'); }}
          color={isAlignActive('justify') ? 'primary' : 'default'}
        >
          <FormatAlignJustify />
        </IconButton>
      </Tooltip>
      <Tooltip title="行高">
        <Select 
          size="small" 
          defaultValue="1.0"
          onChange={(e) => setLineHeight(e.target.value)}
        >
          <MenuItem value="1.0">默认行高</MenuItem>
          <MenuItem value="1.1">1.1倍行高</MenuItem>
          <MenuItem value="1.2">1.2倍行高</MenuItem>
          <MenuItem value="1.5">1.5倍行高</MenuItem>
          <MenuItem value="2.0">2倍行高</MenuItem>
          <MenuItem value="2.5">2.5倍行高</MenuItem>
          <MenuItem value="3.0">3倍行高</MenuItem>
        </Select>
      </Tooltip>
      
      <Divider orientation="vertical" flexItem />
      
      <Tooltip title="无序列表">
        <IconButton 
          size="small"
          onMouseDown={(e) => { e.preventDefault(); toggleBlock('bulleted-list'); }}
          color={isBlockActive('bulleted-list') ? 'primary' : 'default'}
        >
          <FormatListBulleted />
        </IconButton>
      </Tooltip>
      <Tooltip title="有序列表">
        <IconButton 
          size="small"
          onMouseDown={(e) => { e.preventDefault(); toggleBlock('numbered-list'); }}
          color={isBlockActive('numbered-list') ? 'primary' : 'default'}
        >
          <FormatListNumbered />
        </IconButton>
      </Tooltip>
      <Tooltip title="减少缩进">
        <IconButton size="small"><FormatIndentDecrease /></IconButton>
      </Tooltip>
      <Tooltip title="增加缩进">
        <IconButton size="small"><FormatIndentIncrease /></IconButton>
      </Tooltip>
      <Tooltip title="强制换行">
        <IconButton size="small"><KeyboardReturn /></IconButton>
      </Tooltip>
      
      <Divider orientation="vertical" flexItem />
      
      <Tooltip title="图片">
        <IconButton 
          size="small"
          onMouseDown={(e) => {
            e.preventDefault();
            imageConfig.customMenuInvoke(editor);
          }}
        >
          <Image />
        </IconButton>
      </Tooltip>
      <Tooltip title="视频">
        <IconButton size="small"><VideoLibrary /></IconButton>
      </Tooltip>
      <Tooltip title="附件">
        <IconButton size="small"><AttachFile /></IconButton>
      </Tooltip>
      
      <Divider orientation="vertical" flexItem />
      
      <Tooltip title="引用">
        <IconButton 
          size="small"
          onMouseDown={(e) => { e.preventDefault(); toggleBlock('quote'); }}
          color={isBlockActive('quote') ? 'primary' : 'default'}
        >
          <FormatQuote />
        </IconButton>
      </Tooltip>
      <Tooltip title="高亮块">
        <IconButton size="small"><ViewQuilt /></IconButton>
      </Tooltip>
      <Tooltip title="代码块">
        <IconButton 
          size="small"
          onMouseDown={(e) => { e.preventDefault(); toggleBlock('code'); }}
          color={isBlockActive('code') ? 'primary' : 'default'}
        >
          <DataObject />
        </IconButton>
      </Tooltip>
      <Tooltip title="表格">
        <IconButton size="small"><TableChart /></IconButton>
      </Tooltip>
      
      <Divider orientation="vertical" flexItem />
      
      <Tooltip title="源代码">
        <IconButton size="small"><CodeIcon /></IconButton>
      </Tooltip>
      <Tooltip title="打印">
        <IconButton 
          size="small"
          onMouseDown={(e) => { e.preventDefault(); window.print(); }}
        >
          <Print />
        </IconButton>
      </Tooltip>
      <Tooltip title="全屏">
        <IconButton 
          size="small"
          onMouseDown={(e) => { 
            e.preventDefault();
            if (document.fullscreenElement) {
              document.exitFullscreen();
            } else {
              document.documentElement.requestFullscreen();
            }
          }}
        >
          <Fullscreen />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

// Add ImageElement component
const ImageElement = ({ attributes, children, element }: any) => {
  return (
    <div {...attributes}>
      <div contentEditable={false} style={{ textAlign: element.align }}>
        <img
          src={element.url}
          alt={element.alt}
          style={{
            width: '65%',
            maxWidth: '65%',
            height: 'auto',
            display: 'block',
            margin: '0 auto',
          }}
        />
      </div>
      {children}
    </div>
  );
};

// Add DefaultElement component
const DefaultElement = (props: any) => {
  return <p {...props.attributes}>{props.children}</p>;
};

export default CustomEditor; 