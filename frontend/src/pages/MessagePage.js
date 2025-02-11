import React, { useState } from 'react';
import { 
  Grid, 
  List, 
  ListItem, 
  ListItemText, 
  Avatar, 
  Typography,
} from '@mui/material';
import Chat from '../components/Chat/Chat';

const MessagesPage = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [conversations, setConversations] = useState([
    {
      id: 1,
      user: 'jane_smith',
      name: 'Jane Smith',
      lastMessage: 'Hey, how are you?',
      avatar: 'https://example.com/avatar1.jpg',
      messages: [
        { id: 1, text: 'Hey, how are you?', sender: 'jane_smith', timestamp: '10:30 AM' },
        { id: 2, text: 'I\'m good, thanks!', sender: 'me', timestamp: '10:31 AM' }
      ]
    },
    // Add more conversations
  ]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const updatedConversations = conversations.map(conv => {
        if (conv.id === selectedUser.id) {
          return {
            ...conv,
            messages: [
              ...conv.messages,
              { 
                id: conv.messages.length + 1,
                text: newMessage,
                sender: 'me',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              }
            ]
          };
        }
        return conv;
      });
      setConversations(updatedConversations);
      setNewMessage('');
    }
  };

  return (
    <div style={{ height: 'calc(100vh - 64px)', display: 'flex' }}>
      <Grid container>
        {/* Conversations List */}
        <Grid item xs={12} md={4} sx={{ borderRight: '1px solid #ddd' }}>
          <List sx={{ overflowY: 'auto', height: '100%' }}>
            {conversations.map((user) => (
              <ListItem 
                button 
                key={user.id} 
                onClick={() => setSelectedUser(user)}
                sx={{ 
                  backgroundColor: selectedUser?.id === user.id ? '#f5f5f5' : 'inherit',
                  '&:hover': { backgroundColor: '#f5f5f5' }
                }}
              >
                <Avatar src={user.avatar} sx={{ mr: 2 }} />
                <ListItemText
                  primary={user.name}
                  secondary={
                    <Typography
                      component="span"
                      variant="body2"
                      color="textSecondary"
                      sx={{ 
                        display: '-webkit-box',
                        WebkitLineClamp: 1,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}
                    >
                      {user.lastMessage}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Grid>

        {/* Chat Window */}
                    <Grid item xs={12} md={8}>
            <Chat 
                selectedUser={selectedUser} 
                onSendMessage={(message) => {
                const updatedConversations = conversations.map(conv => {
                    if (conv.id === selectedUser.id) {
                    return {
                        ...conv,
                        messages: [
                        ...conv.messages,
                        { 
                            id: conv.messages.length + 1,
                            text: message,
                            sender: 'me',
                            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        }
                        ]
                    };
                    }
                    return conv;
                });
                setConversations(updatedConversations);
                }}
            />
            </Grid>
      </Grid>
    </div>
  );
};

export default MessagesPage;