import { useState, useRef, useEffect } from 'react';
import { Grid, Box, Typography } from '@mui/material';
import messagesData from '../Data/messages.json';
import ConversationList from '../components/messages/CoversationList';
import ChatHeader from '../components/messages/ChatHeader';
import MessageBubble from '../components/messages/MessageBubble';
import MessageInput from '../components/messages/MessageInput';

const MessagesPage = () => {
  const [selected, setSelected] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  const handleSend = () => {
    if (newMessage.trim()) {
      const conversation = messagesData.conversations.find(
        (c) => c.id === selected.id
      );
      conversation.messages.push({
        id: conversation.messages.length + 1,
        text: newMessage,
        sender: 'me',
        timestamp: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit'
        })
      });
      setNewMessage('');
    }
  };

  // Scroll to bottom whenever the messages change.
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selected?.messages.length]);

  return (
    <Grid container sx={{ height: '100vh' }}>
      {/* Left Panel: Conversation List (Fixed) */}
      <Grid
        item
        xs={12}
        md={4}
        sx={{
          borderRight: '1px solid',
          borderColor: 'divider',
          height: '100vh',
          position: 'sticky',
          top: 0,
          overflow: 'hidden' // Prevent scrolling within conversation list
        }}
      >
        <ConversationList
          conversations={messagesData.conversations}
          selected={selected}
          onSelect={setSelected}
        />
      </Grid>

      {/* Right Panel: Chat View */}
      <Grid
        item
        xs={12}
        md={8}
        sx={{ display: 'flex', flexDirection: 'column', position: 'relative' }}
      >
        {selected ? (
          <>
            {/* Fixed Chat Header with white background */}
            <Box sx={{ position: 'sticky', top: 0, zIndex: 2, backgroundColor: 'white' }}>
              <ChatHeader chat={selected} />
            </Box>

            {/* Scrollable Messages Container */}
            <Box
              sx={{
                flex: 1,
                overflowY: 'auto',
                p: 2,
                bgcolor: 'grey.50',
                pb: '80px' // extra padding so last message is visible above the input
              }}
            >
              {selected.messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isGroup={selected.isGroup}
                />
              ))}
              {/* Dummy element to scroll into view */}
              <div ref={messagesEndRef} />
            </Box>

            {/* Fixed Message Input above navigator bar */}
            <Box
              sx={{
                position: 'sticky',
                bottom: '64px', // Adjust if your navigator bar height changes
                zIndex: 2,
                bgcolor: 'grey.50',
                p: 1
              }}
            >
              <MessageInput
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onSend={handleSend}
              />
            </Box>
          </>
        ) : (
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'grey.50'
            }}
          >
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
