import { useState, useRef, useEffect } from 'react';
import { io } from 'socket.io-client';
import {
  Grid, Box, Typography, IconButton, Button, Dialog, DialogTitle, 
  DialogContent, DialogActions, TextField, Checkbox, List, ListItem, 
  ListItemAvatar, Avatar, ListItemText, FormControlLabel, CircularProgress, 
  Fade, Slide, Skeleton, Drawer, useMediaQuery, useTheme
} from '@mui/material';
import { styled } from '@mui/material/styles';
import forge from 'node-forge';
import AddIcon from '@mui/icons-material/Add';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import ConversationList from '../components/messages/CoversationList';
import ChatHeader from '../components/messages/ChatHeader';
import MessageBubble from '../components/messages/MessageBubble';
import MessageInput from '../components/messages/MessageInput';
import Logo from '../components/Logo';

const GradientBox = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  color: theme.palette.common.white,
}));

const AnimatedMessageBubble = styled(MessageBubble)({
  transition: 'transform 0.2s, opacity 0.2s',
  '&:hover': {
    transform: 'scale(1.01)'
  }
});

const MessagesPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [selectedChat, setSelectedChat] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [conversations, setConversations] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [openGroupModal, setOpenGroupModal] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [availableUsers, setAvailableUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [groupError, setGroupError] = useState('');
  const [symmetricKey, setSymmetricKey] = useState(null);
  const [privateKey, setPrivateKey] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(!isMobile);

  const messagesEndRef = useRef(null);
  const socket = useRef(null);

  useEffect(() => {
    setDrawerOpen(!isMobile);
  }, [isMobile]);

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
        return decrypted;
      }
      return '[Decryption Failed]';
    } catch (err) {
      return '[Error Decrypting]';
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'include' });
        const data = await res.json();
        if (data?._id) setCurrentUserId(data._id);
        setInitialLoading(false);
      } catch (err) {
        setInitialLoading(false);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    if (!currentUserId) return;

    const exchangeKey = async () => {
      try {
        const keypair = forge.pki.rsa.generateKeyPair({ bits: 2048 });
        const publicKeyPem = forge.pki.publicKeyToPem(keypair.publicKey);
        const privateKeyPem = forge.pki.privateKeyToPem(keypair.privateKey);

        const res = await fetch('/api/messages/exchange-key', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ publicKeyPem })
        });

        const data = await res.json();
        if (res.ok && data.encryptedSymmetricKey) {
          const encryptedBytes = forge.util.decode64(data.encryptedSymmetricKey);
          const decryptedSymmetricKey = keypair.privateKey.decrypt(encryptedBytes, 'RSA-OAEP');
          setSymmetricKey(decryptedSymmetricKey);
          setPrivateKey(keypair.privateKey);
        }
      } catch (error) {
      }
    };

    exchangeKey();
  }, [currentUserId]);

  useEffect(() => {
    if (!currentUserId) return;

    socket.current = io("https://192.168.2.250", {
      withCredentials: true,
      path: '/socket.io',
    });
    socket.current.emit('join', currentUserId);

    socket.current.on('newMessage', (chatId) => {
      if (selectedChat?.chatId !== chatId) return;

      const fetchAndUpdateMessages = async () => {
        try {
          const res = await fetch(`/api/messages/get-messages?chatId=${chatId}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
          });

          const data = await res.json();
          if (!data.messages) return;

          const decryptedMessages = data.messages.map(msg => {
            if (['text', 'picture'].includes(msg.type) && symmetricKey && msg.iv) {
              const decryptedText = decryptMessage(msg.text, msg.iv, symmetricKey);
          
              if (msg.type === 'picture') {
                try {
                  const parsed = JSON.parse(decryptedText);
                  return { 
                    ...msg, 
                    text: `/uploads/posts/${parsed.fileName}`
                  };
                } catch (err) {
                  if (decryptedText.startsWith('/uploads/')) {
                    return { ...msg, text: decryptedText };
                  }
                  return { ...msg, text: "[Broken Image]" };
                }
              }
          
              return { ...msg, text: decryptedText };
            }
          
            return msg;
          });

          setSelectedChat(prev => ({
            ...prev,
            messages: decryptedMessages
          }));
        } catch (err) {
        }
      };

      fetch(`/api/messages/get-messages?chatId=${chatId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      })
        .then(res => res.json())
        .then(data => {
          const lastMsg = data.messages?.[data.messages.length - 1];
          const isImage = lastMsg?.type === 'picture';
          const delay = isImage ? 1000 : 0;
          setTimeout(fetchAndUpdateMessages, delay);
        })
        .catch(err => {});
    });

    socket.current.on('groupCreated', () => {
      loadConversations();
    });

    return () => {
      socket.current.disconnect();
    };
  }, [currentUserId, selectedChat?.chatId, symmetricKey]);

  const loadConversations = async () => {
    setLoadingConversations(true);
    try {
      const res = await fetch('/api/messages/my-chats', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      const data = await res.json();

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
    } catch (err) {
    } finally {
      setLoadingConversations(false);
    }
  };

  useEffect(() => {
    if (currentUserId && !initialLoading) {
      loadConversations();
    }
  }, [currentUserId, initialLoading]);

  useEffect(() => {
    if (!selectedChat?.chatId) return;

    const loadMessages = async () => {
      setLoadingMessages(true);
      try {
        const res = await fetch(`/api/messages/get-messages?chatId=${selectedChat.chatId}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include'
        });
        const data = await res.json();

        if (data.messages) {
          const decryptedMessages = data.messages.map(msg => {
            if (['text', 'picture'].includes(msg.type) && symmetricKey && msg.iv) {
              let decryptedText = decryptMessage(msg.text, msg.iv, symmetricKey);
              return { ...msg, text: decryptedText };
            }
            return msg;
          });

          setSelectedChat(prev => ({
            ...prev,
            messages: decryptedMessages
          }));
        }
      } catch (err) {
      } finally {
        setLoadingMessages(false);
      }
    };

    loadMessages();
    socket.current.emit('joinChat', selectedChat.chatId);

    return () => {
      socket.current.emit('leaveChat', selectedChat.chatId);
    };
  }, [selectedChat?.chatId, symmetricKey]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedChat?.messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedChat?.chatId || !symmetricKey) return;
    try {
      const iv = forge.random.getBytesSync(16);
      const cipher = forge.cipher.createCipher('AES-CBC', symmetricKey);
      cipher.start({ iv });
      cipher.update(forge.util.createBuffer(newMessage, 'utf8'));
      cipher.finish();
      const encrypted = cipher.output.getBytes();
      const encryptedBase64 = forge.util.encode64(encrypted);
      const ivBase64 = forge.util.encode64(iv);

      const res = await fetch('/api/messages/send-message', {
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
          text: newMessage
        };
        setSelectedChat(prev => ({
          ...prev,
          messages: [...(prev.messages || []), newMessageObj]
        }));
        socket.current.emit('newMessage', selectedChat.chatId);
        setNewMessage('');
      }
    } catch (error) {
    }
  };

  const handleFileUpload = async ({ file }) => {
    if (!file || !selectedChat?.chatId || !symmetricKey) return;

    try {
      const fileReader = new FileReader();

      fileReader.onload = async (event) => {
        const arrayBuffer = event.target.result;
        const binaryBuffer = forge.util.createBuffer(arrayBuffer);
        const fileName = file.name;
      
        const filePayload = JSON.stringify({
          fileData: forge.util.encode64(binaryBuffer.getBytes()),
          fileName: fileName
        });
      
        const iv = forge.random.getBytesSync(16);
        const cipher = forge.cipher.createCipher('AES-CBC', symmetricKey);
        cipher.start({ iv });
        cipher.update(forge.util.createBuffer(filePayload, 'utf8'));
        cipher.finish();
      
        const encrypted = cipher.output.getBytes();
        const encryptedBase64 = forge.util.encode64(encrypted);
        const ivBase64 = forge.util.encode64(iv);
      
        const res = await fetch('/api/messages/send-message', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            chatId: selectedChat.chatId,
            text: encryptedBase64,
            iv: ivBase64,
            type: 'picture'
          })
        });
      
        const data = await res.json();
        if (res.ok && data.newMessage) {
          const newMessageObj = {
            ...data.newMessage,
            text: `data:image/${file.type.split('/')[1]};base64,${forge.util.encode64(binaryBuffer.getBytes())}`
          };
      
          setSelectedChat(prev => ({
            ...prev,
            messages: [...(prev.messages || []), newMessageObj]
          }));
      
          setTimeout(() => {
            socket.current.emit('newMessage', selectedChat.chatId);
          }, 5000);
        }
      };

      fileReader.readAsArrayBuffer(file);
    } catch (error) {
    }
  };

  const handleCreateGroup = () => {
    if (!groupName.trim()) return setGroupError('Group name is required.');
    if (selectedUsers.length < 2) return setGroupError('Select at least 2 members.');

    const payload = {
      groupName: groupName.trim(),
      participantIds: selectedUsers
    };

    fetch('/api/messages/addgroup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setOpenGroupModal(false);
          setGroupName('');
          setSelectedUsers([]);
          setGroupError('');
          loadConversations();
          socket.current.emit('createGroup', data.newGroup);
        } else {
          setGroupError(data.error || 'Failed to create group.');
        }
      })
      .catch(err => {
        setGroupError('Failed to create group.');
      });
  };

  const handleCheckboxChange = (userId) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleConversationSelect = (chat) => {
    if (selectedChat?.chatId !== chat.chatId) {
      setSelectedChat(chat);
      if (isMobile) {
        setDrawerOpen(false);
      }
    }
  };

  const toggleDrawer = () => {
    setDrawerOpen(prev => !prev);
  };

  const LoadingOverlay = () => (
    <Fade in={initialLoading} timeout={500}>
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
          bgcolor: 'background.paper',
          flexDirection: 'column',
        }}
      >
        <Slide direction="up" in={true} mountOnEnter unmountOnExit>
          <Box sx={{ textAlign: 'center' }}>
            <Logo />
            <CircularProgress
              size={60}
              thickness={4}
              sx={{ color: 'primary.main', mt: 3 }}
            />
            <Typography variant="h6" sx={{ mt: 3, fontWeight: 500 }}>
              Securing Your Conversations...
            </Typography>
            <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary', maxWidth: '80%', mx: 'auto' }}>
              Setting up end-to-end encryption for your messages
            </Typography>
          </Box>
        </Slide>
      </Box>
    </Fade>
  );

  if (initialLoading) {
    return <LoadingOverlay />;
  }

  const renderSidebar = () => (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.default',
        borderRight: '1px solid',
        borderColor: 'divider',
        width: '100%'
      }}
    >
      <GradientBox sx={{ 
        p: 2, 
        boxShadow: 2,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>Conversations</Typography>
        <Box>
          <IconButton
            color="inherit"
            onClick={() => setOpenGroupModal(true)}
            size="small"
            sx={{ ml: 1 }}
          >
            <AddIcon />
          </IconButton>
          {isMobile && (
            <IconButton
              color="inherit"
              onClick={toggleDrawer}
              size="small"
              sx={{ ml: 1 }}
            >
              <CloseIcon />
            </IconButton>
          )}
        </Box>
      </GradientBox>
      
      {loadingConversations ? (
        <Box sx={{ p: 2 }}>
          {[...Array(5)].map((_, i) => (
            <Skeleton
              key={i}
              variant="rounded"
              width="100%"
              height={72}
              sx={{ mb: 1, borderRadius: 2 }}
            />
          ))}
        </Box>
      ) : (
        <Box sx={{ flex: 1, overflowY: 'auto' }}>
          <ConversationList
            conversations={conversations}
            selectedChat={selectedChat}
            onSelect={handleConversationSelect}
            loading={loadingConversations}
          />
        </Box>
      )}
    </Box>
  );

  return (
    <Box sx={{ height: '100vh', overflow: 'hidden', position: 'relative', display: 'flex' }}>
      {!isMobile ? (
        <Box sx={{ width: drawerOpen ? '320px' : 0, transition: 'width 0.3s ease' }}>
          {drawerOpen && renderSidebar()}
        </Box>
      ) : (
        <Drawer
          anchor="left"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          sx={{
            '& .MuiDrawer-paper': {
              width: '85%',
              maxWidth: '320px',
              boxSizing: 'border-box',
            },
          }}
        >
          {renderSidebar()}
        </Drawer>
      )}
      
      <Box sx={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column',
        height: '100vh',
        bgcolor: 'background.paper'
      }}>
        {selectedChat ? (
          <>
            <ChatHeader
              chat={selectedChat}
              onMenuClick={toggleDrawer}
              isMobile={isMobile}
              sx={{
                bgcolor: 'background.default',
                boxShadow: 1,
                zIndex: 1
              }}
            />
            
            <Box sx={{
              flex: 1,
              overflowY: 'auto',
              p: 2,
              bgcolor: theme.palette.mode === 'light' ? '#f5f7fa' : '#1a1a2e'
            }}>
              {loadingMessages ? (
                <Box sx={{ textAlign: 'center', mt: 4 }}>
                  <CircularProgress />
                </Box>
              ) : selectedChat.messages?.length === 0 ? (
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  height: '100%',
                  color: 'text.secondary'
                }}>
                  <Typography variant="h6">No messages yet</Typography>
                  <Typography variant="body2">Be the first to send a message!</Typography>
                </Box>
              ) : (
                selectedChat.messages?.map((message, i) => (
                  <AnimatedMessageBubble
                    key={i}
                    message={message}
                    isGroup={selectedChat.isGroup}
                    currentUserId={currentUserId}
                    isImage={message.type === 'picture'}
                    chatName={selectedChat.name}
                    prevSender={i > 0 ? selectedChat.messages[i-1].sender : null}
                  />
                ))
              )}
              <div ref={messagesEndRef} />
            </Box>
            
            <Box sx={{
              position: 'sticky',
              bottom: 0,
              bgcolor: 'background.default',
              p: 2,
              boxShadow: '0px -2px 10px rgba(0,0,0,0.05)',
              borderTop: '1px solid',
              borderColor: 'divider'
            }}>
              <MessageInput
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                onSend={handleSend}
                onFileUpload={handleFileUpload}
                loading={loadingMessages}
              />
            </Box>
          </>
        ) : (
          <Box sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            background: theme.palette.mode === 'light' 
              ? 'linear-gradient(45deg, #f5f7fa 30%, #ffffff 90%)'
              : 'linear-gradient(45deg, #1a1a2e 30%, #16213e 90%)',
            p: 3
          }}>
            {isMobile && !drawerOpen && (
              <IconButton 
                sx={{ position: 'absolute', top: 16, left: 16 }}
                onClick={toggleDrawer}
                color="primary"
              >
                <MenuIcon />
              </IconButton>
            )}
            <Box sx={{ textAlign: 'center', maxWidth: '400px' }}>
              <Logo />
              <Typography variant="h5" sx={{ mt: 3, fontWeight: 500 }}>
                Welcome to SecureChat
              </Typography>
              <Typography variant="body1" sx={{ mt: 2, color: 'text.secondary' }}>
                Select a conversation from the sidebar or create a new group to start chatting securely.
              </Typography>
              {isMobile && (
                <Button 
                  variant="contained" 
                  onClick={toggleDrawer}
                  sx={{ mt: 3 }}
                >
                  Open Conversations
                </Button>
              )}
            </Box>
          </Box>
        )}
      </Box>

      <Dialog open={openGroupModal} onClose={() => setOpenGroupModal(false)} fullWidth maxWidth="sm">
        <DialogTitle>
          <Typography variant="h6">Create New Group</Typography>
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Group Name"
            value={groupName}
            onChange={e => setGroupName(e.target.value)}
            sx={{ mt: 1, mb: 3 }}
          />
          <Typography variant="subtitle2" sx={{ mb: 1 }}>Select Group Members:</Typography>
          {availableUsers.length > 0 ? (
            <List sx={{ maxHeight: '300px', overflow: 'auto' }}>
              {availableUsers.map(user => (
                <ListItem key={user._id || user.userId} sx={{ py: 0.5 }}>
                  <ListItemAvatar>
                    <Avatar 
                      src={user.profileImage || '/default-profile.png'}
                      sx={{ width: 36, height: 36 }}
                    />
                  </ListItemAvatar>
                  <ListItemText primary={user.username} />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={selectedUsers.includes(user.userId)}
                        onChange={() => handleCheckboxChange(user.userId)}
                        color="primary"
                      />
                    }
                    label=""
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No users available. Start conversations with other users first.
            </Typography>
          )}
          {groupError && (
            <Typography color="error" sx={{ mt: 2 }}>
              {groupError}
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={() => {
              setOpenGroupModal(false);
              setGroupName('');
              setSelectedUsers([]);
              setGroupError('');
            }}
          >
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleCreateGroup}
            disabled={!groupName.trim() || selectedUsers.length < 2}
          >
            Create Group
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MessagesPage;