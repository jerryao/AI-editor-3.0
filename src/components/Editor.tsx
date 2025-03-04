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
} from '@mui/icons-material';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, UnderlineType } from 'docx';
import { saveAs } from 'file-saver';

// 定义自定义类型
type CustomElement = {
  type: 'paragraph' | 'code' | 'quote' | 'bulleted-list' | 'numbered-list';
  children: CustomText[];
};

type CustomText = {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  code?: boolean;
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
    <Box sx={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">
          AI 驱动的富文本编辑器
        </Typography>
        <Button
          variant="contained"
          startIcon={<FileDownload />}
          onClick={exportToWord}
          color="primary"
        >
          导出 Word
        </Button>
      </Box>
      <Slate editor={editor} value={initialValue}>
        <Toolbar>
          <MarkButton format="bold" icon={<FormatBold />} />
          <MarkButton format="italic" icon={<FormatItalic />} />
          <MarkButton format="underline" icon={<FormatUnderlined />} />
          <MarkButton format="code" icon={<Code />} />
          <BlockButton format="bulleted-list" icon={<FormatListBulleted />} />
          <BlockButton format="numbered-list" icon={<FormatListNumbered />} />
          <BlockButton format="quote" icon={<FormatQuote />} />
        </Toolbar>
        <Box
          sx={{
            border: '1px solid #ccc',
            borderRadius: '4px',
            padding: '20px',
            minHeight: '300px',
          }}
        >
          <Editable
            renderElement={renderElement}
            renderLeaf={renderLeaf}
            placeholder="开始输入..."
          />
        </Box>
      </Slate>
    </Box>
  );
};

const Leaf = ({ attributes, children, leaf }: any) => {
  if (leaf.bold) {
    children = <strong>{children}</strong>;
  }
  if (leaf.italic) {
    children = <em>{children}</em>;
  }
  if (leaf.underline) {
    children = <u>{children}</u>;
  }
  if (leaf.code) {
    children = <code>{children}</code>;
  }
  return <span {...attributes}>{children}</span>;
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

const MarkButton = ({ format, icon }: any) => {
  const editor = useSlate();
  const isActive = isMarkActive(editor, format);

  return (
    <IconButton
      onMouseDown={(event: React.MouseEvent) => {
        event.preventDefault();
        toggleMark(editor, format);
      }}
      color={isActive ? 'primary' : 'default'}
    >
      {icon}
    </IconButton>
  );
};

const BlockButton = ({ format, icon }: any) => {
  const editor = useSlate();
  const isActive = isBlockActive(editor, format);

  return (
    <IconButton
      onMouseDown={(event: React.MouseEvent) => {
        event.preventDefault();
        toggleBlock(editor, format);
      }}
      color={isActive ? 'primary' : 'default'}
    >
      {icon}
    </IconButton>
  );
};

const isMarkActive = (editor: any, format: string) => {
  const marks = editor.getMarks();
  return marks ? marks[format] === true : false;
};

const toggleMark = (editor: any, format: string) => {
  const isActive = isMarkActive(editor, format);

  if (isActive) {
    editor.removeMark(format);
  } else {
    editor.addMark(format, true);
  }
};

const isBlockActive = (editor: any, format: string) => {
  const [match] = editor.nodes({
    match: (n: any) => n.type === format,
  });

  return !!match;
};

const toggleBlock = (editor: any, format: string) => {
  const isActive = isBlockActive(editor, format);

  editor.setNodes({
    type: isActive ? 'paragraph' : format,
  });
};

export default CustomEditor; 