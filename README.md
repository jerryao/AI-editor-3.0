# AI 增强型富文本编辑器 / AI-Enhanced Rich Text Editor

## 简介 / Introduction

[中文]
这是一个基于 Slate.js 构建的现代化富文本编辑器，集成了多种 AI 功能以提升文本创作和编辑体验。编辑器支持丰富的格式化选项、插入元素、链接和代码块等功能，同时通过 AI 模型提供智能写作辅助、文本优化和翻译功能。

[English]
This is a modern rich text editor built on Slate.js, integrating various AI capabilities to enhance the text creation and editing experience. The editor supports rich formatting options, insertable elements, links, code blocks, and more, while providing intelligent writing assistance, text optimization, and translation through AI models.

## 主要功能 / Key Features

### 基础编辑功能 / Basic Editing

[中文]
- **格式化工具**：支持加粗、斜体、下划线、删除线等基本文本格式
- **段落样式**：标题、正文、引用、列表等
- **文本对齐**：左对齐、居中、右对齐、两端对齐
- **格式刷**：复制和应用文本格式
- **清除格式**：一键清除所有文本格式

[English]
- **Formatting Tools**: Bold, italic, underline, strikethrough, and other basic text formats
- **Paragraph Styles**: Headings, body text, quotes, lists, etc.
- **Text Alignment**: Left, center, right, and justify
- **Format Painter**: Copy and apply text formatting
- **Clear Formatting**: One-click removal of all text formatting

### 高级功能 / Advanced Features

[中文]
- **链接管理**：插入、编辑和格式化链接
- **代码块**：支持多种编程语言的代码块插入和语法高亮
- **图片插入**：上传和嵌入图片到文档中
- **导出功能**：将文档导出为 Word 格式
- **文本选择气泡菜单**：便捷的文本选择工具条

[English]
- **Link Management**: Insert, edit, and format links
- **Code Blocks**: Insert code blocks with syntax highlighting for multiple programming languages
- **Image Insertion**: Upload and embed images into documents
- **Export Functionality**: Export documents to Word format
- **Text Selection Bubble Menu**: Convenient text selection toolbar

### AI 功能 / AI Features

[中文]
- **继续写作**：AI 根据上下文智能续写内容
- **文本摘要**：自动生成文本摘要
- **智能校对**：拼写和语法检查与修正
- **风格转换**：将文本转换为不同的写作风格
- **文本翻译**：支持多语言翻译
- **内容优化建议**：提供改进文本质量的建议

[English]
- **Continue Writing**: AI intelligently continues writing based on context
- **Text Summarization**: Automatically generate text summaries
- **Smart Proofreading**: Spelling and grammar checking with corrections
- **Style Conversion**: Transform text into different writing styles
- **Text Translation**: Support for multi-language translation
- **Content Optimization Suggestions**: Provide suggestions to improve text quality

## 技术栈 / Technology Stack

[中文]
- **前端框架**：React
- **编辑器核心**：Slate.js
- **UI 组件**：Material-UI
- **AI 服务**：支持 OpenAI、DeepSeek、ZhiPu 等多种 AI 服务提供商

[English]
- **Frontend Framework**: React
- **Editor Core**: Slate.js
- **UI Components**: Material-UI
- **AI Services**: Support for multiple AI service providers including OpenAI, DeepSeek, ZhiPu, etc.

## 安装 / Installation

[中文]
```bash
# 克隆仓库
git clone https://github.com/yourusername/ai-editor.git

# 进入项目目录
cd ai-editor

# 安装依赖
npm install

# 启动开发服务器
npm start
```

[English]
```bash
# Clone the repository
git clone https://github.com/yourusername/ai-editor.git

# Enter the project directory
cd ai-editor

# Install dependencies
npm install

# Start the development server
npm start
```

## 环境变量配置 / Environment Variables

[中文]
在项目根目录创建 `.env` 文件并配置以下变量:

```
REACT_APP_OPENAI_API_KEY=your_openai_api_key
REACT_APP_OPENAI_BASE_URL=https://api.openai.com
REACT_APP_DEEPSEEK_API_KEY=your_deepseek_api_key
REACT_APP_DEEPSEEK_BASE_URL=https://api.deepseek.com
REACT_APP_ZHIPU_API_KEY=your_zhipu_api_key
REACT_APP_ZHIPU_BASE_URL=https://api.zhipu.com
```

[English]
Create a `.env` file in the project root and configure the following variables:

```
REACT_APP_OPENAI_API_KEY=your_openai_api_key
REACT_APP_OPENAI_BASE_URL=https://api.openai.com
REACT_APP_DEEPSEEK_API_KEY=your_deepseek_api_key
REACT_APP_DEEPSEEK_BASE_URL=https://api.deepseek.com
REACT_APP_ZHIPU_API_KEY=your_zhipu_api_key
REACT_APP_ZHIPU_BASE_URL=https://api.zhipu.com
```

## 使用指南 / Usage Guide

### 基础编辑 / Basic Editing

[中文]
1. **文本格式化**：选择文本后使用工具栏的格式化按钮应用样式
2. **插入链接**：点击链接按钮，在弹出的对话框中输入URL和链接文本
3. **插入代码**：点击代码按钮，选择语言并输入代码内容
4. **格式刷使用**：
   - 选择已格式化的文本，点击格式刷按钮(按钮会变蓝)
   - 选择需要应用格式的文本，再次点击格式刷按钮

[English]
1. **Text Formatting**: Select text and apply styles using the formatting buttons in the toolbar
2. **Insert Links**: Click the link button and input URL and link text in the popup dialog
3. **Insert Code**: Click the code button, select a language, and input code content
4. **Format Painter Usage**:
   - Select formatted text, click the format painter button (it turns blue)
   - Select text that needs formatting, click the format painter button again

### AI 功能使用 / AI Feature Usage

[中文]
1. **继续写作**：点击 AI 菜单中的"继续写作"，AI 将基于当前内容提供延续
2. **文本摘要**：选择文本，点击"文本摘要"，选择摘要长度
3. **智能校对**：选择文本，点击"智能校对"，AI 将检查并修正问题
4. **风格转换**：选择文本，点击"风格转换"，选择目标风格
5. **文本翻译**：选择文本，点击"文本翻译"，选择目标语言

[English]
1. **Continue Writing**: Click "Continue Writing" in the AI menu, AI will provide a continuation based on the current content
2. **Text Summarization**: Select text, click "Text Summary", choose summary length
3. **Smart Proofreading**: Select text, click "Smart Proofreading", AI will check and correct issues
4. **Style Conversion**: Select text, click "Style Conversion", select target style
5. **Text Translation**: Select text, click "Text Translation", select target language

## 贡献 / Contributing

[中文]
欢迎贡献代码改进这个编辑器！请遵循以下步骤：

1. Fork 这个仓库
2. 创建你的特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交你的改动 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建一个 Pull Request

[English]
Contributions to improve this editor are welcome! Please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Create a Pull Request

## 许可证 / License

[中文]
本项目采用 MIT 许可证 - 详见 LICENSE 文件

[English]
This project is licensed under the MIT License - see the LICENSE file for details

## 致谢 / Acknowledgments

[中文]
- Slate.js 团队提供的强大编辑器框架
- Material-UI 提供的精美 UI 组件
- 各 AI 服务提供商的 API 支持

[English]
- The Slate.js team for the powerful editor framework
- Material-UI for the beautiful UI components
- Various AI service providers for API support
