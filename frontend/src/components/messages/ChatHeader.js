import { Box, Typography, Avatar, Chip, IconButton, Tooltip, Badge } from '@mui/material';
import { Info, People, MoreVert, Menu as MenuIcon, Security } from '@mui/icons-material';

const ChatHeader = ({ chat, onMenuClick, isMobile }) => {
  if (!chat) return null;
  
  return (
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center', 
      p: 2, 
      borderBottom: '1px solid', 
      borderColor: 'divider',
      backgroundColor: (theme) => theme.palette.background.default
    }}>
      {isMobile && (
        <IconButton onClick={onMenuClick} sx={{ mr: 1 }}>
          <MenuIcon />
        </IconButton>
      )}
      
      <Avatar 
        src={chat.isGroup ? '/group-avatar.png' : chat.avatar}
        sx={{ 
          width: { xs: 40, sm: 48 }, 
          height: { xs: 40, sm: 48 },
          bgcolor: chat.isGroup ? 'primary.light' : undefined
        }}
      >
        {chat.isGroup && <People />}
      </Avatar>
      
      <Box sx={{ ml: 2, overflow: 'hidden' }}>
        <Typography variant="h6" noWrap sx={{ fontWeight: 600, maxWidth: '200px' }}>
          {chat.name}
        </Typography>
        {chat.isGroup && (
          <Chip
            icon={<People fontSize="small" />}
            label={`${chat.participants?.length || 0} members`}
            size="small"
            variant="outlined"
            sx={{ mt: 0.5, height: 24 }}
          />
        )}
      </Box>
      
      <Box sx={{ ml: 'auto', display: 'flex', gap: 1, alignItems: 'center' }}>
        <Tooltip title="End-to-end encrypted">
          <Badge variant="dot" color="success">
            <Security fontSize="small" sx={{ color: 'success.main' }} />
          </Badge>
        </Tooltip>
        
        <Tooltip title="Chat info">
          <IconButton size="small">
            <Info />
          </IconButton>
        </Tooltip>
        
        <Tooltip title="More options">
          <IconButton size="small">
            <MoreVert />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
};

export default ChatHeader;