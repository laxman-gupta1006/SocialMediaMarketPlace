import { Box, Typography, Avatar, Chip, IconButton } from '@mui/material';
import { Info, People, MoreVert } from '@mui/icons-material';

const ChatHeader = ({ chat }) => (
  <Box sx={{ 
    display: 'flex', 
    alignItems: 'center', 
    p: 2, 
    borderBottom: '1px solid', 
    borderColor: 'divider' 
  }}>
    {chat.isGroup ? (
      <Avatar sx={{ bgcolor: 'grey.100' }}>
        <People sx={{ color: 'text.secondary' }} />
      </Avatar>
    ) : (
      <Avatar src={chat.avatar} />
    )}
    
    <Box sx={{ ml: 2 }}>
      <Typography variant="h6">{chat.name}</Typography>
      {chat.isGroup && (
        <Chip
          icon={<People />}
          label={`${chat.participants.length} members`}
          size="small"
          sx={{ mt: 0.5 }}
        />
      )}
    </Box>
    
    <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
      <IconButton>
        <Info />
      </IconButton>
      <IconButton>
        <MoreVert />
      </IconButton>
    </Box>
  </Box>
);

export default ChatHeader;