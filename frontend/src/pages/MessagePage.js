import { useState, useRef, useEffect } from 'react';
import { Grid, Box, Typography } from '@mui/material';
import ConversationList from '../components/messages/CoversationList';
import ChatHeader from '../components/messages/ChatHeader';
import MessageBubble from '../components/messages/MessageBubble';
import MessageInput from '../components/messages/MessageInput';
import messagesData from '../Data/messages.json';

const MessagesPage = () => {
  const [selected, setSelected] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [conversations, setConversations] = useState([]);
  const [following, setFollowing] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetch('https://localhost:3000/api/messages/my-following', {
      credentials: 'include'
    })
      .then((res) => res.json())
      .then((data) => {
        console.log('Fetched following users:', data);
        
        if (!data.following || !Array.isArray(data.following)) {
          console.error('Invalid following list format:', data);
          return;
        }

        setFollowing(data.following);
        
        // Create conversations dynamically from the following list
        const updatedConversations = data.following.map((user, index) => ({
          id: index + 1,
          name: user.username,
          avatar: user.profileImage,
          isGroup: false,
          participants: [{ id: user.userId, name: user.username, avatar: user.profileImage, online: user.online }],
          messages: []
        }));
        
        setConversations(updatedConversations);
      })
      .catch((err) => console.error('Error fetching following list:', err));
  }, []);

  const handleSend = () => {
    if (newMessage.trim() && selected) {
      const updatedConversations = conversations.map((conversation) =>
        conversation.id === selected.id
          ? {
              ...conversation,
              messages: [
                ...conversation.messages,
                {
                  id: conversation.messages.length + 1,
                  text: newMessage,
                  sender: 'me',
                  timestamp: new Date().toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })
                }
              ]
            }
          : conversation
      );
      setConversations(updatedConversations);
      setNewMessage('');
    }
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selected?.messages?.length]);

  return (
    <Grid container sx={{ height: '100vh' }}>
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
          overflow: 'hidden'
        }}
      >
        <ConversationList
          conversations={conversations}
          selected={selected}
          onSelect={setSelected}
        />
      </Grid>
      <Grid item xs={12} md={8} sx={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
        {selected ? (
          <>
            <Box sx={{ position: 'sticky', top: 0, zIndex: 2, backgroundColor: 'white' }}>
              <ChatHeader chat={selected} />
            </Box>
            <Box sx={{ flex: 1, overflowY: 'auto', p: 2, bgcolor: 'grey.50', pb: '80px' }}>
              {selected.messages?.map((message) => (
                <MessageBubble key={message.id} message={message} isGroup={selected.isGroup} />
              ))}
              <div ref={messagesEndRef} />
            </Box>
            <Box sx={{ position: 'sticky', bottom: '64px', zIndex: 2, bgcolor: 'grey.50', p: 1 }}>
              <MessageInput value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onSend={handleSend} />
            </Box>
          </>
        ) : (
          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'grey.50' }}>
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