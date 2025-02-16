// src/components/AdminPanel/NotificationSystem.jsx
import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton
} from '@mui/material';
import { Send, Delete } from '@mui/icons-material';

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState([
    { id: 1, text: 'System update required', date: '2024-02-20' }
  ]);
  const [newNotification, setNewNotification] = useState('');

  const handleSendNotification = () => {
    if (newNotification.trim()) {
      setNotifications([...notifications, {
        id: Date.now(),
        text: newNotification,
        date: new Date().toISOString().split('T')[0]
      }]);
      setNewNotification('');
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h6" gutterBottom>
        Send System Notification
      </Typography>
      
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          label="New Notification"
          value={newNotification}
          onChange={(e) => setNewNotification(e.target.value)}
        />
        <Button
          variant="contained"
          endIcon={<Send />}
          onClick={handleSendNotification}
        >
          Send
        </Button>
      </Box>

      <List>
        {notifications.map((notification) => (
          <ListItem
            key={notification.id}
            secondaryAction={
              <IconButton
                edge="end"
                onClick={() => setNotifications(
                  notifications.filter(n => n.id !== notification.id)
                )}
              >
                <Delete />
              </IconButton>
            }
          >
            <ListItemText
              primary={notification.text}
              secondary={notification.date}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default NotificationCenter;