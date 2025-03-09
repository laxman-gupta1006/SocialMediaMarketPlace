import { Box, Typography, Avatar, Chip } from '@mui/material';
import { InsertDriveFile, Image, Schedule, DoneAll } from '@mui/icons-material';

const MessageBubble = ({ message, isGroup }) => (
  <Box
    sx={{
      width: '100%',
      display: 'flex',
      justifyContent: message.sender === 'me' ? 'flex-end' : 'flex-start',
      mb: 1,
    }}
  >
    <Box sx={{ display: 'flex', gap: 1, maxWidth: '75%' }}>
      {isGroup && message.sender !== 'me' && (
        <Avatar sx={{ width: 32, height: 32 }} />
      )}
      <Box
        sx={{
          bgcolor: message.sender === 'me' ? 'primary.main' : 'grey.100',
          color: message.sender === 'me' ? 'common.white' : 'text.primary',
          p: 2,
          borderRadius: 4,
          boxShadow: 1,
        }}
      >
        {message.attachments?.map((attachment) => (
          <Chip
            key={attachment.url}
            icon={attachment.type === 'image' ? <Image /> : <InsertDriveFile />}
            label={attachment.name || 'Image'}
            sx={{ mb: 1, bgcolor: 'rgba(255,255,255,0.1)' }}
          />
        ))}
        <Typography variant="body1">{message.text}</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, gap: 1 }}>
          <Schedule fontSize="small" />
          <Typography variant="caption">{message.timestamp}</Typography>
          {message.sender === 'me' && <DoneAll fontSize="small" />}
        </Box>
      </Box>
    </Box>
  </Box>
);

export default MessageBubble;
