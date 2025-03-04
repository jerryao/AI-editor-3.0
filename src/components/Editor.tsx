import React, { useCallback, useState } from 'react';
import { createEditor, BaseEditor, Element as SlateElement, Descendant } from 'slate';
import { Slate, Editable, withReact, useSlate, ReactEditor } from 'slate-react';
import { withHistory, HistoryEditor } from 'slate-history';
import { Box, Toolbar, IconButton, Typography, Button } from '@mui/material';
import {
  FormatBold,
  FormatItalic,
  FormatUnderlined,
  Code,
  FormatListBulleted,
  FormatListNumbered,
  FormatQuote,
  FileDownload,
  Download,
} from '@mui/icons-material';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, UnderlineType } from 'docx';
import { saveAs } from 'file-saver';
import { Editor, Transforms } from 'slate';

// 定义自定义类型
type CustomElement = {
  type: 'paragraph' | 'heading-one' | 'heading-two' | 'heading-three' | 'code' | 'quote' | 'bulleted-list' | 'numbered-list' | 'list-item';
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

const CustomEditor = () => {
  const [editor] = useState(() => withHistory(withReact(createEditor())));

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
    switch (props.element.type) {
      case 'code':
        return <CodeElement {...props} />;
      case 'quote':
        return <QuoteElement {...props} />;
      case 'bulleted-list':
        return <BulletedListElement {...props} />;
      case 'numbered-list':
        return <NumberedListElement {...props} />;
      default:
        return <DefaultElement {...props} />;
    }
  }, []);

  const renderLeaf = useCallback((props: any) => {
    return <Leaf {...props} />;
  }, []);

  return (
    <Box sx={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">AI 编辑器</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={exportToWord}
          startIcon={<Download />}
        >
          导出 Word
        </Button>
      </Box>
      <Slate editor={editor} value={initialValue}>
        <Box sx={{ 
          border: '1px solid #ccc', 
          borderRadius: '4px',
          overflow: 'hidden'
        }}>
          <Box sx={{
            padding: '10px',
            borderBottom: '1px solid #ccc',
            backgroundColor: '#f5f5f5',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
            '& button': {
              padding: '6px 12px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              backgroundColor: '#fff',
              cursor: 'pointer',
              '&:hover': {
                backgroundColor: '#f0f0f0',
              },
              '&.active': {
                backgroundColor: '#e0e0e0',
                borderColor: '#999',
              },
            },
            '& select': {
              padding: '6px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              backgroundColor: '#fff',
            },
            '& input[type="color"]': {
              width: '32px',
              height: '32px',
              padding: '0',
              border: '1px solid #ccc',
              borderRadius: '4px',
              cursor: 'pointer',
            },
          }}>
            <FormatToolbar />
          </Box>
          <Box sx={{
            padding: '20px',
            minHeight: '500px',
            '& h1': { fontSize: '2em', marginBottom: '0.5em' },
            '& h2': { fontSize: '1.5em', marginBottom: '0.5em' },
            '& h3': { fontSize: '1.17em', marginBottom: '0.5em' },
            '& p': { marginBottom: '1em' },
            '& pre': {
              backgroundColor: '#f5f5f5',
              padding: '1em',
              borderRadius: '4px',
              overflow: 'auto',
            },
            '& blockquote': {
              borderLeft: '4px solid #ccc',
              margin: '1em 0',
              padding: '0.5em 1em',
              color: '#666',
            },
            '& ul, & ol': {
              margin: '1em 0',
              paddingLeft: '2em',
            },
            '& li': {
              marginBottom: '0.5em',
            },
          }}>
            <Editable
              renderElement={props => <Element {...props} />}
              renderLeaf={props => <Leaf {...props} />}
              placeholder="开始输入..."
            />
          </Box>
        </Box>
      </Slate>
    </Box>
  );
};

const Element = ({ attributes, children, element }: any) => {
  const style: React.CSSProperties = {
    textAlign: element.align || 'left',
  };

  switch (element.type) {
    case 'heading-one':
      return <h1 style={style} {...attributes}>{children}</h1>;
    case 'heading-two':
      return <h2 style={style} {...attributes}>{children}</h2>;
    case 'heading-three':
      return <h3 style={style} {...attributes}>{children}</h3>;
    case 'code':
      return (
        <pre style={style} {...attributes}>
          <code>{children}</code>
        </pre>
      );
    case 'quote':
      return <blockquote style={style} {...attributes}>{children}</blockquote>;
    case 'bulleted-list':
      return <ul style={style} {...attributes}>{children}</ul>;
    case 'numbered-list':
      return <ol style={style} {...attributes}>{children}</ol>;
    case 'list-item':
      return <li style={style} {...attributes}>{children}</li>;
    default:
      return <p style={style} {...attributes}>{children}</p>;
  }
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
  };

  return <span style={style} {...attributes}>{children}</span>;
};

const CodeElement = (props: any) => (
  <pre {...props.attributes}>
    <code>{props.children}</code>
  </pre>
);

const QuoteElement = (props: any) => (
  <blockquote {...props.attributes}>{props.children}</blockquote>
);

const BulletedListElement = (props: any) => (
  <ul {...props.attributes}>{props.children}</ul>
);

const NumberedListElement = (props: any) => (
  <ol {...props.attributes}>{props.children}</ol>
);

const DefaultElement = (props: any) => (
  <p {...props.attributes}>{props.children}</p>
);

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

  return (
    <div className="toolbar">
      <button
        onMouseDown={e => {
          e.preventDefault();
          toggleMark('bold');
        }}
        className={isMarkActive('bold') ? 'active' : ''}
      >
        粗体
      </button>
      <button
        onMouseDown={e => {
          e.preventDefault();
          toggleMark('italic');
        }}
        className={isMarkActive('italic') ? 'active' : ''}
      >
        斜体
      </button>
      <button
        onMouseDown={e => {
          e.preventDefault();
          toggleMark('underline');
        }}
        className={isMarkActive('underline') ? 'active' : ''}
      >
        下划线
      </button>
      <button
        onMouseDown={e => {
          e.preventDefault();
          toggleMark('strikethrough');
        }}
        className={isMarkActive('strikethrough') ? 'active' : ''}
      >
        删除线
      </button>
      <select
        onChange={e => setFontSize(Number(e.target.value))}
      >
        <option value="12">12px</option>
        <option value="14">14px</option>
        <option value="16">16px</option>
        <option value="18">18px</option>
        <option value="20">20px</option>
        <option value="24">24px</option>
        <option value="28">28px</option>
        <option value="32">32px</option>
        <option value="36">36px</option>
        <option value="48">48px</option>
      </select>
      <select
        onChange={e => setFontFamily(e.target.value)}
      >
        <option value="Arial">Arial</option>
        <option value="Times New Roman">Times New Roman</option>
        <option value="Courier New">Courier New</option>
        <option value="Georgia">Georgia</option>
        <option value="Verdana">Verdana</option>
      </select>
      <input
        type="color"
        onChange={e => setColor(e.target.value)}
      />
      <input
        type="color"
        onChange={e => setBackgroundColor(e.target.value)}
      />
      <button
        onMouseDown={e => {
          e.preventDefault();
          toggleBlock('heading-one');
        }}
        className={isBlockActive('heading-one') ? 'active' : ''}
      >
        标题1
      </button>
      <button
        onMouseDown={e => {
          e.preventDefault();
          toggleBlock('heading-two');
        }}
        className={isBlockActive('heading-two') ? 'active' : ''}
      >
        标题2
      </button>
      <button
        onMouseDown={e => {
          e.preventDefault();
          toggleBlock('heading-three');
        }}
        className={isBlockActive('heading-three') ? 'active' : ''}
      >
        标题3
      </button>
      <button
        onMouseDown={e => {
          e.preventDefault();
          toggleAlign('left');
        }}
        className={isAlignActive('left') ? 'active' : ''}
      >
        左对齐
      </button>
      <button
        onMouseDown={e => {
          e.preventDefault();
          toggleAlign('center');
        }}
        className={isAlignActive('center') ? 'active' : ''}
      >
        居中
      </button>
      <button
        onMouseDown={e => {
          e.preventDefault();
          toggleAlign('right');
        }}
        className={isAlignActive('right') ? 'active' : ''}
      >
        右对齐
      </button>
      <button
        onMouseDown={e => {
          e.preventDefault();
          toggleAlign('justify');
        }}
        className={isAlignActive('justify') ? 'active' : ''}
      >
        两端对齐
      </button>
    </div>
  );
};

export default CustomEditor; 