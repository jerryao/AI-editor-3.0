import React from 'react';
import {
  Box,
  IconButton,
  Tooltip,
  Select,
  MenuItem,
  Divider,
  Menu,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Undo,
  Redo,
  FormatPaint,
  FormatClear,
  FormatBold,
  FormatItalic,
  FormatUnderlined,
  StrikethroughS,
  Link,
  Code,
  FormatListBulleted,
  FormatListNumbered,
  FormatIndentDecrease,
  FormatIndentIncrease,
  FormatAlignLeft,
  FormatAlignCenter,
  FormatAlignRight,
  FormatAlignJustify,
  Image,
  TableChart,
  FormatQuote,
  SmartToy,
  AutoFixHigh,
  MoreVert,
} from '@mui/icons-material';

interface ToolbarProps {
  editor: any;
  onAIAction: (action: string) => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({ editor, onAIAction }) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleAIMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleAIMenuClose = () => {
    setAnchorEl(null);
  };

  const handleAIAction = (action: string) => {
    onAIAction(action);
    handleAIMenuClose();
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexWrap: 'wrap', 
      gap: 0.5, 
      p: 1, 
      borderBottom: 1, 
      borderColor: 'divider',
      backgroundColor: '#f5f5f5'
    }}>
      {/* History Group */}
      <Box sx={{ display: 'flex', gap: 0.5 }}>
        <Tooltip title="撤销">
          <IconButton size="small"><Undo fontSize="small" /></IconButton>
        </Tooltip>
        <Tooltip title="重做">
          <IconButton size="small"><Redo fontSize="small" /></IconButton>
        </Tooltip>
        <Tooltip title="格式刷">
          <IconButton size="small"><FormatPaint fontSize="small" /></IconButton>
        </Tooltip>
        <Tooltip title="清除格式">
          <IconButton size="small"><FormatClear fontSize="small" /></IconButton>
        </Tooltip>
      </Box>

      <Divider orientation="vertical" flexItem />

      {/* Text Style Group */}
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Select size="small" defaultValue="paragraph">
          <MenuItem value="paragraph">正文</MenuItem>
          <MenuItem value="h1">标题1</MenuItem>
          <MenuItem value="h2">标题2</MenuItem>
          <MenuItem value="h3">标题3</MenuItem>
        </Select>

        <Select size="small" defaultValue="default">
          <MenuItem value="default">默认字体</MenuItem>
          <MenuItem value="simsun">宋体</MenuItem>
          <MenuItem value="microsoft-yahei">微软雅黑</MenuItem>
        </Select>

        <Select size="small" defaultValue="14">
          <MenuItem value="12">12</MenuItem>
          <MenuItem value="14">14</MenuItem>
          <MenuItem value="16">16</MenuItem>
          <MenuItem value="18">18</MenuItem>
        </Select>
      </Box>

      <Divider orientation="vertical" flexItem />

      {/* Formatting Group */}
      <Box sx={{ display: 'flex', gap: 0.5 }}>
        <Tooltip title="加粗">
          <IconButton size="small"><FormatBold fontSize="small" /></IconButton>
        </Tooltip>
        <Tooltip title="斜体">
          <IconButton size="small"><FormatItalic fontSize="small" /></IconButton>
        </Tooltip>
        <Tooltip title="下划线">
          <IconButton size="small"><FormatUnderlined fontSize="small" /></IconButton>
        </Tooltip>
        <Tooltip title="删除线">
          <IconButton size="small"><StrikethroughS fontSize="small" /></IconButton>
        </Tooltip>
        <Tooltip title="链接">
          <IconButton size="small"><Link fontSize="small" /></IconButton>
        </Tooltip>
        <Tooltip title="代码">
          <IconButton size="small"><Code fontSize="small" /></IconButton>
        </Tooltip>
      </Box>

      <Divider orientation="vertical" flexItem />

      {/* Lists and Indentation */}
      <Box sx={{ display: 'flex', gap: 0.5 }}>
        <Tooltip title="无序列表">
          <IconButton size="small"><FormatListBulleted fontSize="small" /></IconButton>
        </Tooltip>
        <Tooltip title="有序列表">
          <IconButton size="small"><FormatListNumbered fontSize="small" /></IconButton>
        </Tooltip>
        <Tooltip title="减少缩进">
          <IconButton size="small"><FormatIndentDecrease fontSize="small" /></IconButton>
        </Tooltip>
        <Tooltip title="增加缩进">
          <IconButton size="small"><FormatIndentIncrease fontSize="small" /></IconButton>
        </Tooltip>
      </Box>

      <Divider orientation="vertical" flexItem />

      {/* Alignment */}
      <Box sx={{ display: 'flex', gap: 0.5 }}>
        <Tooltip title="左对齐">
          <IconButton size="small"><FormatAlignLeft fontSize="small" /></IconButton>
        </Tooltip>
        <Tooltip title="居中对齐">
          <IconButton size="small"><FormatAlignCenter fontSize="small" /></IconButton>
        </Tooltip>
        <Tooltip title="右对齐">
          <IconButton size="small"><FormatAlignRight fontSize="small" /></IconButton>
        </Tooltip>
        <Tooltip title="两端对齐">
          <IconButton size="small"><FormatAlignJustify fontSize="small" /></IconButton>
        </Tooltip>
      </Box>

      <Divider orientation="vertical" flexItem />

      {/* Insert Group */}
      <Box sx={{ display: 'flex', gap: 0.5 }}>
        <Tooltip title="插入图片">
          <IconButton size="small"><Image fontSize="small" /></IconButton>
        </Tooltip>
        <Tooltip title="插入表格">
          <IconButton size="small"><TableChart fontSize="small" /></IconButton>
        </Tooltip>
        <Tooltip title="引用">
          <IconButton size="small"><FormatQuote fontSize="small" /></IconButton>
        </Tooltip>
      </Box>

      <Divider orientation="vertical" flexItem />

      {/* AI Features */}
      <Box sx={{ display: 'flex', gap: 0.5 }}>
        <Tooltip title="AI功能">
          <IconButton
            size="small"
            onClick={handleAIMenuClick}
            color={open ? 'primary' : 'default'}
          >
            <SmartToy fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      {/* AI Menu */}
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleAIMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={() => handleAIAction('continue')}>
          <ListItemIcon>
            <SmartToy fontSize="small" />
          </ListItemIcon>
          <ListItemText>继续写作</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleAIAction('optimize')}>
          <ListItemIcon>
            <AutoFixHigh fontSize="small" />
          </ListItemIcon>
          <ListItemText>优化内容</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleAIAction('custom')}>
          <ListItemIcon>
            <MoreVert fontSize="small" />
          </ListItemIcon>
          <ListItemText>更多自定义...</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
}; 