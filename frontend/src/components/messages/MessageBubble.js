import React from 'react';
import { Box, Typography, Link } from '@mui/material';

const MessageBubble = ({ message, currentUserId, isGroup }) => {
  if (!message) return null;

  const senderId = message?.sender?._id || message?.sender || '';
  const isOwnMessage = senderId === currentUserId;
  const senderName = message?.sender?.username?.toLowerCase() || 'unknown';

  const isPicture = message.type === 'picture';
  const isFile = message.type === 'file';

  const fileUrl = message.text.startsWith('http') 
    ? message.text 
    : `https://localhost:3000${message.text}`;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: isOwnMessage ? 'flex-end' : 'flex-start',
        mb: 1,
      }}
    >
      {!isOwnMessage && isGroup && (
        <Typography sx={{ fontSize: '0.7rem', color: '#888', mb: 0.3 }}>
          {senderName}
        </Typography>
      )}

      {/* 🖼️ Render Image */}
      {isPicture ? (
        <img
          src={fileUrl}
          alt="Sent media"
          style={{
            maxWidth: '60%',
            borderRadius: '8px',
            border: '1px solid #ddd',
          }}
        />
      ) : isFile ? (
        <Link
          href={fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          sx={{
            backgroundColor: isOwnMessage ? 'blue' : 'gray',
            color: 'white',
            p: 1,
            borderRadius: '8px',
            maxWidth: '60%',
            textDecoration: 'none',
            wordBreak: 'break-word',
          }}
        >
          📎 Download File
        </Link>
      ) : (
        <Typography
          sx={{
            backgroundColor: isOwnMessage ? 'blue' : 'gray',
            color: 'white',
            p: 1,
            borderRadius: '8px',
            maxWidth: '60%',
            wordBreak: 'break-word',
          }}
        >
          {message.text}
        </Typography>
      )}
    </Box>
  );
};

export default MessageBubble;
