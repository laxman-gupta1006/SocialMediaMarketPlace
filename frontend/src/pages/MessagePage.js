import { useState } from 'react';
import { Grid, Box,Typography } from '@mui/material';
import messagesData from '../Data/messages.json';
import ConversationList from '../components/messages/CoversationList'
import ChatHeader from '../components/messages/ChatHeader';
import MessageBubble from '../components/messages/MessageBubble';
import MessageInput from '../components/messages/MessageInput';

const MessagesPage = () => {
  const [selected, setSelected] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  
  const handleSend = () => {
    if (newMessage.trim()) {
      const conversation = messagesData.conversations.find(c => c.id === selected.id);
      conversation.messages.push({
        id: conversation.messages.length + 1,
        text: newMessage,
        sender: 'me',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
      setNewMessage('');
    }
  };

  return (
    <Grid container sx={{ height: '100vh' }}>
      <Grid item xs={12} md={4} sx={{ borderRight: '1px solid', borderColor: 'divider' }}>
        <ConversationList
          conversations={messagesData.conversations}
          selected={selected}
          onSelect={setSelected}
        />
      </Grid>
      
      <Grid item xs={12} md={8} sx={{ display: 'flex', flexDirection: 'column' }}>
        {selected ? (
          <>
            <ChatHeader chat={selected} />
            <Box sx={{ flex: 1, overflowY: 'auto', p: 2, bgcolor: 'grey.50' }}>
              {selected.messages.map(message => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isGroup={selected.isGroup}
                />
              ))}
            </Box>
            <MessageInput
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onSend={handleSend}
            />
          </>
        ) : (
          <Box sx={{ 
            flex: 1, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            bgcolor: 'grey.50'
          }}>
            <Typography variant="h6" color="text.secondary">
              Select a conversation to start chatting
            </Typography>
          </Box>
        )}
      </Grid>
    </Grid>
  );
};

export default MessagesPage;