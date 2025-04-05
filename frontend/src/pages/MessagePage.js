import { useState, useRef, useEffect } from 'react';
import {
  Grid, Box, Typography, IconButton, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Checkbox, List, ListItem, ListItemAvatar, Avatar,
  ListItemText, FormControlLabel
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ConversationList from '../components/messages/CoversationList';
import ChatHeader from '../components/messages/ChatHeader';
import MessageBubble from '../components/messages/MessageBubble';
import MessageInput from '../components/messages/MessageInput';

const MessagesPage = () => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [conversations, setConversations] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [openGroupModal, setOpenGroupModal] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [availableUsers, setAvailableUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [groupError, setGroupError] = useState('');

  const messagesEndRef = useRef(null);

  

  // Fetch current user info
useEffect(() => {
  fetch('https://localhost:3000/api/auth/me', { credentials: 'include' })
    .then(res => res.json())
    .then(data => {
      if (data?._id) {
        setCurrentUserId(data._id);
        // Optional: store full user object if needed later
        // setCurrentUser(data);
      }
    })
    .catch(err => console.error('Error fetching user ID:', err));
}, []);

// Fetch conversations
const loadConversations = () => {
  if (!currentUserId) return;

  fetch('https://localhost:3000/api/messages/my-chats', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include'
  })
    .then(response => response.json())
    .then(data => {
      if (Array.isArray(data.chats)) {
        const updated = data.chats.map(chat => {
          const other = chat.participants.find(p => p.userId !== currentUserId);

          return {
            id: chat.chatId || chat._id,
            chatId: chat.chatId || chat._id,
            name: chat.name || other?.username || 'Unknown User',
            avatar: chat.isGroup
              ? '/group-avatar.png' // Replace this with real group avatar if available
              : other?.profileImage || '/default-profile.png',
            isGroup: chat.isGroup,
            participant: other,          // For direct chats
            participants: chat.participants // 👈 Keep full participant list (for group header)
          };
        }).filter(Boolean);

        setConversations(updated);
      }
    })
    .catch(error => console.error('Error fetching chats:', error));
};


  useEffect(() => {
    loadConversations();
  }, [currentUserId]);

  // Fetch messages for selected chat
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

    const msg = {
      chatId: selectedChat.chatId,
      sender: currentUserId,
      text: newMessage,
      type: 'text',
      timestamp: new Date().toISOString()
    };

    fetch('https://localhost:3000/api/messages/send-message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(msg)
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

  const handleFileUpload = ({ file, type }) => {
    if (!file || !selectedChat?.chatId) return;
  
    const formData = new FormData();
    formData.append("image", file); // or use type if needed
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
  

  // 🟢 Group Creation Modal Logic
  const openGroupDialog = () => {
    setOpenGroupModal(true);
    setGroupName('');
    setSelectedUsers([]);
    setGroupError('');

    fetch('https://localhost:3000/api/messages/my-following', {
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => {
        setAvailableUsers(data.following || []);
      })
      .catch(err => console.error('Error fetching following list:', err));
  };

  const handleCreateGroup = () => {
    if (!groupName.trim()) {
      setGroupError('Group name is required.');
      return;
    }
    if (selectedUsers.length < 2) {
      setGroupError('Select at least 2 members.');
      return;
    }
  
    // ✅ Log what will be sent
    console.log("🚀 Preparing group creation request:");
    console.log("👤 Current User ID:", currentUserId);
    console.log("🧑‍🤝‍🧑 Selected Member IDs:", selectedUsers);
    console.log("📛 Group Name:", groupName.trim());
  
    const payload = {
      groupName: groupName.trim(),
      participantIds: selectedUsers
    };

    console.log("📛 payload :",payload);


  
    // ✅ Send POST request to /addgroup
    fetch('https://localhost:3000/api/messages/addgroup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then(data => {
        console.log("✅ Group creation response:", data);
        if (data.success) {
          setOpenGroupModal(false);
          loadConversations(); // Refresh conversation list
        } else {
          setGroupError(data.error || 'Failed to create group.');
        }
      })
      .catch(err => {
        setGroupError('Failed to create group.');
        console.error('Error creating group:', err);
      });
  };
  

  const handleCheckboxChange = (userId) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
    console.log("🆔 Checkbox toggled for user ID: ", userId);
    console.log("📦 Type of ID: ", typeof userId); // should be "string"
  };
  
  
  

  return (
    <Grid container sx={{ height: '100vh' }}>
      <Grid item xs={12} md={4} sx={{ borderRight: '1px solid', borderColor: 'divider', height: '100vh', overflow: 'hidden' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
          <Typography variant="h6">Chats</Typography>
          <IconButton onClick={openGroupDialog}><AddIcon /></IconButton>
        </Box>
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
                  isImage={message.type === 'picture'}
                  chatName={selectedChat.name}
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
              <label htmlFor="file-upload"></label>
              <MessageInput
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                onSend={handleSend}
                onFileUpload={handleFileUpload}
              />
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

      <Dialog open={openGroupModal} onClose={() => setOpenGroupModal(false)} fullWidth maxWidth="sm">
        <DialogTitle>Create New Group</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Group Name"
            variant="outlined"
            value={groupName}
            onChange={e => setGroupName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <List>
            {availableUsers.map(user => (
              <ListItem key={user._id} dense>
                <ListItemAvatar><Avatar src={user.profileImage || '/default-profile.png'} /></ListItemAvatar>
                <ListItemText primary={user.username} />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectedUsers.includes(user.userId)}
                      onChange={() => handleCheckboxChange(user.userId)} // ✅ use user.userId
                    />


                  }
                  label=""
                />
              </ListItem>
            ))}
          </List>
          {groupError && <Typography color="error" sx={{ mt: 1 }}>{groupError}</Typography>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenGroupModal(false)}>Cancel</Button>
          <Button onClick={handleCreateGroup} variant="contained">Create Group</Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
};

export default MessagesPage;
