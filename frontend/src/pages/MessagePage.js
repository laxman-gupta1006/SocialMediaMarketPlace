import { useState, useRef, useEffect } from 'react';
import { Grid, Box, Typography } from '@mui/material';
import ConversationList from '../components/messages/CoversationList';
import ChatHeader from '../components/messages/ChatHeader';
import MessageBubble from '../components/messages/MessageBubble';
import MessageInput from '../components/messages/MessageInput';

const MessagesPage = () => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [conversations, setConversations] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);  // ✅ Store logged-in user ID
  const messagesEndRef = useRef(null);

  // ✅ Fetch logged-in user ID when component mounts
  useEffect(() => {
    fetch('https://localhost:3000/api/auth/me', { credentials: 'include' }) 
      .then(res => res.json())
      .then(data => {
        console.log("User API Response:", data);  
        setCurrentUserId(data._id);  // ✅ Use `_id` from response
      })
      .catch(err => console.error('Error fetching user ID:', err));
  }, []);
  

  useEffect(() => {
    console.log("Fetching chats...");
    fetch('https://localhost:3000/api/messages/my-chats', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    })
    .then(response => {
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      return response.json();
    })
    .then(data => {
      console.log('Fetched chats:', data);
      if (!data.chats || !Array.isArray(data.chats)) {
        console.error('Invalid chats format:', data);
        return;
      }
      setConversations(data.chats.map(chat => ({
        id: chat.chatId || chat._id,
        chatId: chat.chatId || chat._id,
        name: chat.participant?.username || 'Unknown User',
        avatar: chat.participant?.profileImage || '',
        participant: chat.participant
      })));
    })
    .catch(error => console.error('Error fetching chats:', error));
  }, []);

  useEffect(() => {
    if (!selectedChat?.chatId) return;

    //console.log('Starting message polling for chat:', selectedChat.chatId);

    const interval = setInterval(() => {
      fetch(`https://localhost:3000/api/messages/get-messages?chatId=${selectedChat.chatId}`, {
        credentials: 'include'
      })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        return res.json();
      })
      .then(data => {
        //console.log('Fetched messages:', data);
        setSelectedChat(prev => ({ ...prev, messages: data.messages || [] }));
      })
      .catch(err => console.error('Error fetching messages:', err));
    }, 1000);

    return () => {
      //console.log('Stopping message polling');
      clearInterval(interval);
    };
  }, [selectedChat]);

  const handleSend = () => {
    if (!newMessage.trim() || !selectedChat?.chatId || !currentUserId) return;
    console.log('Sending message:', newMessage);
    
    const messageData = {
      chatId: selectedChat.chatId,
      sender: currentUserId,  // ✅ Use logged-in user's ID instead of "me"
      text: newMessage,
      timestamp: new Date().toISOString()
    };

    fetch('https://localhost:3000/api/messages/send-message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(messageData)
    })
    .then(res => {
      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
      return res.json();
    })
    .then(data => {
      console.log('Message sent:', data);
      setSelectedChat(prev => ({
        ...prev,
        messages: [...prev.messages, data.newMessage]
      }));
    })
    .catch(err => console.error('Error sending message:', err));

    setNewMessage('');
  };

  return (
    <Grid container sx={{ height: '100vh' }}>
      <Grid item xs={12} md={4} sx={{ borderRight: '1px solid', borderColor: 'divider', height: '100vh', overflow: 'hidden' }}>
        <ConversationList 
          conversations={conversations} 
          selectedChat={selectedChat} 
          onSelect={(chat) => {
            console.log('Selected chat:', chat);
            setSelectedChat(chat);
          }} 
        />
      </Grid>
      <Grid item xs={12} md={8} sx={{ display: 'flex', flexDirection: 'column' }}>
        {selectedChat ? (
          <>
            <Box sx={{ position: 'sticky', top: 0, zIndex: 2, backgroundColor: 'white' }}>
              <ChatHeader chat={selectedChat} />
            </Box>
            <Box sx={{ flex: 1, overflowY: 'auto', p: 2, bgcolor: 'grey.50', pb: '80px' }}>
              {selectedChat.messages?.map((message, index) => (
                <MessageBubble 
                  key={index} 
                  message={message} 
                  isGroup={selectedChat.isGroup} 
                  currentUserId={currentUserId} // ✅ Pass logged-in user's ID
                />
              ))}
              <div ref={messagesEndRef} />
            </Box>
            <Box sx={{ position: 'sticky', bottom: '64px', bgcolor: 'grey.50', p: 1 }}>
              <MessageInput value={newMessage} onChange={e => setNewMessage(e.target.value)} onSend={handleSend} />
            </Box>
          </>
        ) : (
          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'grey.50' }}>
            <Typography variant='h6' color='text.secondary'>
              Select a conversation to start chatting
            </Typography>
          </Box>
        )}
      </Grid>
    </Grid>
  );
};

export default MessagesPage;
