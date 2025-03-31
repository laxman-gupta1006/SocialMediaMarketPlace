import { useState, useRef, useEffect } from 'react';
import { Grid, Box, Typography, IconButton } from '@mui/material';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import ConversationList from '../components/messages/CoversationList';
import ChatHeader from '../components/messages/ChatHeader';
import MessageBubble from '../components/messages/MessageBubble';
import MessageInput from '../components/messages/MessageInput';

const MessagesPage = () => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [conversations, setConversations] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetch('https://localhost:3000/api/auth/me', { credentials: 'include' })
      .then(res => res.json())
      .then(data => setCurrentUserId(data._id))
      .catch(err => console.error('Error fetching user ID:', err));
  }, []);

  useEffect(() => {
    if (!currentUserId) return;  // 🛑 Prevent running if currentUserId is not available
  
    fetch('https://localhost:3000/api/messages/my-chats', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    })
    .then(response => response.json())
    .then(data => {
      console.log("✅ API Response:", data);
  
      if (Array.isArray(data.chats)) {
        const updatedConversations = data.chats.map(chat => {
          console.log("📌 Chat Data Before Processing:", chat);
  
          // 🛑 Make sure participants exist and currentUserId is defined
          if (!chat.participants || !Array.isArray(chat.participants)) {
            console.error("⚠️ No participants found for chat:", chat);
            return null;
          }
  
          // 🔍 Find the other participant (not the logged-in user)
          const otherParticipant = chat.participants.find(p => p.userId !== currentUserId);
          
          if (!otherParticipant) {
            console.error("❌ No other participant found in chat:", chat);
            return null;
          }
  
          console.log("🟢 Selected Other Participant:", otherParticipant);
  
          return {
            id: chat.chatId || chat._id,
            chatId: chat.chatId || chat._id,
            name: otherParticipant.username || 'Unknown User',
            avatar: otherParticipant.profileImage || '/default-profile.png',
            participant: otherParticipant
          };
        }).filter(Boolean); // 🧹 Remove `null` values
  
        console.log("📝 Final Conversations:", updatedConversations);
  
        setConversations(updatedConversations);
      }
    })
    .catch(error => console.error('❌ Error fetching chats:', error));
  }, [currentUserId]);  // ✅ Depend on `currentUserId`
  
  
  


  useEffect(() => {
    if (!selectedChat?.chatId) return;
    const interval = setInterval(() => {
      fetch(`https://localhost:3000/api/messages/get-messages?chatId=${selectedChat.chatId}`, {
        credentials: 'include'
      })
      .then(res => res.json())
      .then(data => {
        setSelectedChat(prev => ({ ...prev, messages: data.messages || [] }));
      })
      .catch(err => console.error('Error fetching messages:', err));
    }, 1000);
    return () => clearInterval(interval);
  }, [selectedChat]);

  const handleSend = () => {
    if (!newMessage.trim() || !selectedChat?.chatId || !currentUserId) return;
    
    const messageData = {
      chatId: selectedChat.chatId,
      sender: currentUserId,
      text: newMessage,
      type: 'text', // ✅ Ensure type is sent
      timestamp: new Date().toISOString()
    };
  
    console.log('Sending message:', messageData); // 🔍 Debugging log
  
    fetch('https://localhost:3000/api/messages/send-message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(messageData)
    })
    .then(res => res.json())
    .then(data => {
      if (data.newMessage) {
        setSelectedChat(prev => ({
          ...prev,
          messages: [...prev.messages, data.newMessage]
        }));
      }
    })
    .catch(err => console.error('Error sending message:', err));
  
    setNewMessage('');
  };
  
  const handleFileUpload = (file) => {  // ✅ Expect a file, not event
    if (!file || !selectedChat?.chatId) {
      console.error("No file selected or no chat chosen");
      return;
    }
  
    const formData = new FormData();
    formData.append("image", file); 
    formData.append("chatId", selectedChat.chatId);
  
    fetch("https://localhost:3000/api/messages/send-message", {
      method: "POST",
      credentials: "include",
      body: formData
    })
      .then(res => res.json())
      .then(data => {
        if (data.newMessage) {
          setSelectedChat(prev => ({
            ...prev,
            messages: [...prev.messages, data.newMessage]
          }));
        }
      })
      .catch(err => console.error("Error uploading file:", err));
  };
  

  return (
    <Grid container sx={{ height: '100vh' }}>
      <Grid item xs={12} md={4} sx={{ borderRight: '1px solid', borderColor: 'divider', height: '100vh', overflow: 'hidden' }}>
        <ConversationList 
          conversations={conversations} 
          selectedChat={selectedChat} 
          onSelect={chat => setSelectedChat(chat)}
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
                  currentUserId={currentUserId}
                  isImage={message.type === 'picture'} // Detect if it's an image
                />
              ))}
              <div ref={messagesEndRef} />
            </Box>
            <Box sx={{ position: 'sticky', bottom: '64px', bgcolor: 'grey.50', p: 1, display: 'flex', alignItems: 'center' }}>
              <input
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                id="file-upload"
                onChange={handleFileUpload}
              />
              <label htmlFor="file-upload">
                
              </label>
              <MessageInput 
              value={newMessage} 
              onChange={e => setNewMessage(e.target.value)}
               onSend={handleSend} 
               onFileUpload={handleFileUpload} />
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
