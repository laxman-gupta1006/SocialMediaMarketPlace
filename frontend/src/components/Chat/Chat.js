import React, { useState, useEffect, useRef } from 'react';
import { 
  Avatar, 
  Typography, 
  TextField, 
  IconButton, 
  List, 
  ListItem, 
  ListItemAvatar, 
  ListItemText,
  Divider,
  Box
} from '@mui/material';
import { Send } from '@mui/icons-material';

const Chat = ({ selectedUser, onSendMessage }) => {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [selectedUser?.messages]);

  const handleSend = () => {
    if (newMessage.trim()) {
      onSendMessage(newMessage);
      setNewMessage('');
    }
  };

  if (!selectedUser) {
    return (
      <Box sx={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f9f9f9'
      }}>
        <Typography variant="h6" color="textSecondary">
          Select a conversation to start chatting
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%'
    }}>
      {/* Chat Header */}
      <Box sx={{ 
        p: 2, 
        borderBottom: '1px solid #ddd',
        display: 'flex',
        alignItems: 'center'
      }}>
        <Avatar src={selectedUser.avatar} sx={{ mr: 2 }} />
        <Typography variant="h6">{selectedUser.name}</Typography>
      </Box>

      {/* Messages List */}
      <Box sx={{
        flex: 1,
        overflowY: 'auto',
        p: 2,
        backgroundColor: '#f9f9f9'
      }}>
        <List>
          {selectedUser.messages.map((message) => (
            <React.Fragment key={message.id}>
              <ListItem 
                sx={{
                  justifyContent: message.sender === 'me' ? 'flex-end' : 'flex-start',
                  px: 0
                }}
              >
                {message.sender !== 'me' && (
                  <ListItemAvatar sx={{ minWidth: 40 }}>
                    <Avatar src={selectedUser.avatar} sx={{ width: 32, height: 32 }} />
                  </ListItemAvatar>
                )}
                <ListItemText
                  sx={{
                    maxWidth: '70%',
                    p: 1.5,
                    borderRadius: '15px',
                    backgroundColor: message.sender === 'me' ? '#0084ff' : '#fff',
                    color: message.sender === 'me' ? '#fff' : '#000',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.12)'
                  }}
                  primary={message.text}
                  secondary={
                    <Typography
                      variant="caption"
                      sx={{
                        display: 'block',
                        textAlign: 'right',
                        color: message.sender === 'me' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.5)'
                      }}
                    >
                      {message.timestamp}
                    </Typography>
                  }
                />
              </ListItem>
              <Divider variant="inset" component="li" />
            </React.Fragment>
          ))}
          <div ref={messagesEndRef} />
        </List>
      </Box>

      {/* Message Input */}
      <Box sx={{ 
        p: 2, 
        borderTop: '1px solid #ddd',
        display: 'flex',
        alignItems: 'center'
      }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          sx={{ mr: 1 }}
        />
        <IconButton 
          color="primary" 
          onClick={handleSend}
          disabled={!newMessage.trim()}
        >
          <Send />
        </IconButton>
      </Box>
    </Box>
  );
};

export default Chat;