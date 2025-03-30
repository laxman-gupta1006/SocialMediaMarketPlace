import React from 'react';
import { Box, Typography } from '@mui/material';

const MessageBubble = ({ message, currentUserId }) => {
  const senderId = message.sender?._id || message.sender; // Extract sender ID properly
  const isOwnMessage = senderId === currentUserId; // Compare sender with current user

  console.log(
    `Message: "${message.text}" | Sender ID: ${senderId} | Current User ID: ${currentUserId}`
  );

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
        mb: 1,
      }}
    >
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
    </Box>
  );
};

export default MessageBubble;
