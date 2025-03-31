import React from 'react';
import { Box, Typography, Link } from '@mui/material';

const MessageBubble = ({ message, currentUserId }) => {
  const senderId = message.sender?._id || message.sender; 
  const isOwnMessage = senderId === currentUserId; 

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
        mb: 1,
      }}
    >
      {/* ✅ If message type is image, display the image */}
      {message.type === 'picture' ? (
        <img
          src={`https://localhost:3000${message.text}`} // ✅ Fix: Ensure full URL
          alt="Sent media"
          style={{
            maxWidth: '60%',
            borderRadius: '8px',
            border: '1px solid #ddd',
          }}
        />
      ) : message.type === 'file' ? (
        <Link
          href={`https://localhost:3000${message.text}`} // ✅ Ensure full URL for file
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
          }}
        >
          {message.text}
        </Typography>
      )}
    </Box>
  );
};

export default MessageBubble;
