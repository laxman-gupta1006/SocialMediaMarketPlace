import { useState, useRef, useEffect } from 'react';
import { io } from 'socket.io-client';
import {
  Grid, Box, Typography, IconButton, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Checkbox, List, ListItem, ListItemAvatar, Avatar,
  ListItemText, FormControlLabel, CircularProgress
} from '@mui/material';
import forge from 'node-forge';
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
  const [symmetricKey, setSymmetricKey] = useState(null); // Make sure symmetricKey is defined correctly
  const [privateKey, setPrivateKey] = useState(null);
  // Add loading state for spinner
  const [loading, setLoading] = useState(true);

  const messagesEndRef = useRef(null);
  const socket = useRef(null);

  const decryptMessage = (encryptedText, ivBase64, symmetricKey) => {
    try {
      const iv = forge.util.decode64(ivBase64);
      const ciphertextBytes = forge.util.decode64(encryptedText);
  
      const decipher = forge.cipher.createDecipher('AES-CBC', symmetricKey);
      decipher.start({ iv });
      decipher.update(forge.util.createBuffer(ciphertextBytes, 'raw'));
  
      const success = decipher.finish();
      if (success) {
        const decrypted = decipher.output.toString();
        console.log("💬 Decrypted Message:", decrypted);
        return decrypted;
      } else {
        console.warn("❌ Failed to decrypt message");
        return '[Decryption Failed]';
      }
    } catch (err) {
      console.error("⚠️ Decryption error:", err);
      return '[Error Decrypting]';
    }
  };

  // Add loading spinner timer
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 5000); // 5 seconds loading time
    
    return () => clearTimeout(timer);
  }, []);
  
  useEffect(() => {
    const exchangeKey = async () => {
      // Generate RSA key pair
      const keypair = forge.pki.rsa.generateKeyPair({ bits: 2048 });
      const publicKeyPem = forge.pki.publicKeyToPem(keypair.publicKey);
      const privateKeyPem = forge.pki.privateKeyToPem(keypair.privateKey);

      console.log("🔑 Public Key (PEM):\n", publicKeyPem);
      console.log("🔒 Private Key (PEM):\n", privateKeyPem);

      const res = await fetch('https://localhost:3000/api/messages/exchange-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ publicKeyPem })
      });

      const data = await res.json();
      if (res.ok && data.encryptedSymmetricKey) {
        console.log("📦 Encrypted Symmetric Key (Base64):", data.encryptedSymmetricKey);

        // Decrypt the symmetric key using private key
        const encryptedBytes = forge.util.decode64(data.encryptedSymmetricKey);
        const decryptedSymmetricKey = keypair.privateKey.decrypt(encryptedBytes, 'RSA-OAEP');
        console.log("🔓 Decrypted Symmetric Key:", decryptedSymmetricKey);

        setSymmetricKey(decryptedSymmetricKey); // Store for later use
        setPrivateKey(keypair.privateKey);      // Needed for decryption
      } else {
        console.error('Key exchange failed:', data.error);
      }
    };

    if (currentUserId) {
      exchangeKey();
    }
  }, [currentUserId]);

  useEffect(() => {
    fetch('https://localhost:3000/api/auth/me', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data?._id) setCurrentUserId(data._id);
      })
      .catch(err => console.error('Error fetching user ID:', err));
  }, []);

  useEffect(() => {
    if (!currentUserId) return;

    socket.current = io('https://localhost:3000', { withCredentials: true });

    socket.current.emit('join', currentUserId);

    socket.current.on('newMessage', (chatId) => {
      if (selectedChat?.chatId === chatId) {
        const fetchAndUpdateMessages = () => {
          fetch(`https://localhost:3000/api/messages/get-messages?chatId=${chatId}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
          })
            .then(res => res.json())
            .then(data => {
              if (data.messages) {
                const decryptedMessages = data.messages.map(msg => ({
                  ...msg,
                  text: msg.type === 'text' && symmetricKey && msg.iv? decryptMessage(msg.text, msg.iv, symmetricKey): msg.text
                }));
            
                setSelectedChat(prev => ({
                  ...prev,
                  messages: decryptedMessages
                }));
              }
            })
            .catch(err => console.error('Error fetching updated messages:', err));
        };
    
        // 💡 Add delay only if last message is an image
        fetch(`https://localhost:3000/api/messages/get-messages?chatId=${chatId}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include'
        })
          .then(res => res.json())
          .then(data => {
            const lastMsg = data.messages?.[data.messages.length - 1];
            const isImage = lastMsg?.type === 'picture';
    
            const delay = isImage ? 1000 : 0; // ⏳ 1 second delay for image
    
            setTimeout(fetchAndUpdateMessages, delay);
          })
          .catch(err => console.error('Error pre-checking message type:', err));
      }
    });
    
    socket.current.on('groupCreated', () => {
      loadConversations();
    });

    return () => {
      socket.current.disconnect();
    };
  }, [currentUserId, selectedChat?.chatId]);

  const loadConversations = () => {
    fetch('https://localhost:3000/api/messages/my-chats', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data.chats)) {
          const updated = data.chats.map(chat => {
            const other = chat.participants.find(p => p.userId !== currentUserId);
            return {
              id: chat.chatId || chat._id,
              chatId: chat.chatId || chat._id,
              name: chat.name || other?.username || 'Unknown User',
              avatar: chat.isGroup ? '/group-avatar.png' : other?.profileImage || '/default-profile.png',
              isGroup: chat.isGroup,
              participants: chat.participants
            };
          });

          setConversations(updated);

          const directUsers = updated
            .filter(chat => !chat.isGroup)
            .map(chat => chat.participants.find(p => p.userId !== currentUserId))
            .filter(Boolean);

          setAvailableUsers(directUsers);
        }
      })
      .catch(err => console.error('Error loading conversations:', err));
  };

  useEffect(() => {
    if (currentUserId) loadConversations();
  }, [currentUserId]);

  useEffect(() => {
    if (!selectedChat?.chatId) return;
  
    fetch(`https://localhost:3000/api/messages/get-messages?chatId=${selectedChat.chatId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => {
        if (data.messages) {
          const decryptedMessages = data.messages.map(msg => ({
            ...msg,
            text: msg.type === 'text' && symmetricKey && msg.iv? decryptMessage(msg.text, msg.iv, symmetricKey): msg.text
          }));
      
          setSelectedChat(prev => ({
            ...prev,
            messages: decryptedMessages
          }));
        }
      })
      .catch(err => console.error('Error loading messages:', err));
  
    socket.current.emit('joinChat', selectedChat.chatId);
  
    return () => {
      socket.current.emit('leaveChat', selectedChat.chatId);
    };
  }, [selectedChat?.chatId]);
  

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedChat?.messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedChat?.chatId || !symmetricKey) return;
  
    try {
      // 1. Generate random IV
      const iv = forge.random.getBytesSync(16);
  
      // 2. Encrypt the message using AES-CBC
      const cipher = forge.cipher.createCipher('AES-CBC', symmetricKey);
      cipher.start({ iv });
      cipher.update(forge.util.createBuffer(newMessage, 'utf8'));
      cipher.finish();
      const encrypted = cipher.output.getBytes();
  
      // 3. Base64 encode both encrypted message and IV
      const encryptedBase64 = forge.util.encode64(encrypted);
      const ivBase64 = forge.util.encode64(iv);
  
      // 🟡 LOG EVERYTHING HERE
      console.log("Original Message:", newMessage);
      console.log("Encrypted (Base64):", encryptedBase64);
      console.log("IV (Base64):", ivBase64);
  
      // 4. Send encrypted message to server
      const res = await fetch('https://localhost:3000/api/messages/send-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          chatId: selectedChat.chatId,
          text: encryptedBase64,
          iv: ivBase64,
          type: 'text'
        })
      });
  
      const data = await res.json();
  
      if (res.ok && data.newMessage) {
        const newMessageObj = {
          ...data.newMessage,
          text: newMessage // display plain text locally
        };
  
        setSelectedChat(prev => ({
          ...prev,
          messages: [...(prev.messages || []), newMessageObj]
        }));
  
        socket.current.emit('newMessage', selectedChat.chatId);
        setNewMessage('');
      }
    } catch (error) {
      console.error('Error encrypting/sending message:', error);
    }
  };
  
  const handleFileUpload = ({ file }) => {
    if (!file || !selectedChat?.chatId) return;
  
    const formData = new FormData();
    formData.append('image', file);
    formData.append('chatId', selectedChat.chatId);
  
    fetch('https://localhost:3000/api/messages/send-message', {
      method: 'POST',
      credentials: 'include',
      body: formData
    })
      .then(res => res.json())
      .then(data => {
        if (data.newMessage) {
          setSelectedChat(prev => ({
            ...prev,
            messages: [...prev.messages, data.newMessage]
          }));
  
          // 🔥 Add this to notify others
          socket.current.emit('newMessage', selectedChat.chatId);
        }
      })
      .catch(err => console.error('Error sending file:', err));
  };
  

  const handleCreateGroup = () => {
    if (!groupName.trim()) return setGroupError('Group name is required.');
    if (selectedUsers.length < 2) return setGroupError('Select at least 2 members.');

    const payload = {
      groupName: groupName.trim(),
      participantIds: selectedUsers
    };

    fetch('https://localhost:3000/api/messages/addgroup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setOpenGroupModal(false);
          loadConversations();
          socket.current.emit('createGroup', data.newGroup);
        } else {
          setGroupError(data.error || 'Failed to create group.');
        }
      })
      .catch(err => {
        setGroupError('Failed to create group.');
        console.error('Group creation error:', err);
      });
  };

  const handleCheckboxChange = (userId) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  // Render loading overlay when loading is true
  if (loading) {
    return (
      <>
        {/* Transparent overlay with blur effect */}
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999,
            bgcolor: 'rgba(255, 255, 255, 0.7)',
            backdropFilter: 'blur(5px)'
          }}
        >
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress size={60} thickness={4} />
            <Typography variant="h6" sx={{ mt: 2 }}>Loading your secure messages...</Typography>
          </Box>
        </Box>
        
        {/* Background content (blurred) */}
        <Grid container sx={{ height: '100vh', overflow: 'hidden', filter: 'blur(5px)' }}>
          <Grid
            item
            xs={12}
            md={4}
            sx={{
              borderRight: '1px solid',
              borderColor: 'divider',
              height: '100vh',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">Chats</Typography>
              <IconButton><AddIcon /></IconButton>
            </Box>
            <Box sx={{ flex: 1, overflowY: 'auto' }}></Box>
          </Grid>

          <Grid
            item
            xs={12}
            md={8}
            sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}
          >
            <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Typography>Select a conversation to start chatting</Typography>
            </Box>
          </Grid>
        </Grid>
      </>
    );
  }

  return (
    <Grid container sx={{ height: '100vh', overflow: 'hidden' }}>
      <Grid
        item
        xs={12}
        md={4}
        sx={{
          borderRight: '1px solid',
          borderColor: 'divider',
          height: '100vh',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Chats</Typography>
          <IconButton onClick={() => setOpenGroupModal(true)}><AddIcon /></IconButton>
        </Box>
        <Box sx={{ flex: 1, overflowY: 'auto' }}>
          <ConversationList
            conversations={conversations}
            selectedChat={selectedChat}
            onSelect={(chat) => {
              if (selectedChat?.chatId !== chat.chatId) {
                setSelectedChat(chat);
              }
            }}
          />
        </Box>
      </Grid>

      <Grid
        item
        xs={12}
        md={8}
        sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}
      >
        {selectedChat ? (
          <>
            <Box sx={{ position: 'sticky', top: 0, zIndex: 2, bgcolor: 'white' }}>
              <ChatHeader chat={selectedChat} />
            </Box>
            <Box sx={{ flex: 1, overflowY: 'auto', p: 2, bgcolor: 'grey.50' }}>
              {selectedChat.messages?.map((message, i) => (
                <MessageBubble
                  key={i}
                  message={message}
                  isGroup={selectedChat.isGroup}
                  currentUserId={currentUserId}
                  isImage={message.type === 'picture'}
                  chatName={selectedChat.name}
                />
              ))}
              <div ref={messagesEndRef} />
            </Box>
            <Box sx={{ position: 'sticky', bottom: 0, bgcolor: 'grey.50', p: 1 }}>
              <MessageInput
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                onSend={handleSend}
                onFileUpload={handleFileUpload}
              />
            </Box>
          </>
        ) : (
          <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Typography>Select a conversation to start chatting</Typography>
          </Box>
        )}
      </Grid>

      <Dialog open={openGroupModal} onClose={() => setOpenGroupModal(false)} fullWidth maxWidth="sm">
        <DialogTitle>Create New Group</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Group Name"
            value={groupName}
            onChange={e => setGroupName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <List>
            {availableUsers.map(user => (
              <ListItem key={user._id}>
                <ListItemAvatar>
                  <Avatar src={user.profileImage || '/default-profile.png'} />
                </ListItemAvatar>
                <ListItemText primary={user.username} />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectedUsers.includes(user.userId)}
                      onChange={() => handleCheckboxChange(user.userId)}
                    />
                  }
                  label=""
                />
              </ListItem>
            ))}
          </List>
          {groupError && <Typography color="error">{groupError}</Typography>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenGroupModal(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateGroup}>Create Group</Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
};

export default MessagesPage;