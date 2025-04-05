import React, { useEffect, useState } from 'react';
import axios from 'axios';

import { 
  Box, 
  Typography, 
  Alert, 
  List, 
  ListItem, 
  ListItemText, 
  Divider,
  Card,
  CardContent,
  ListItemAvatar,
  Avatar
} from '@mui/material';
import AnnouncementIcon from '@mui/icons-material/Announcement';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

const AdminNotes = () => {
  const [notes, setNotes] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const res = await axios.get('https://192.168.2.250:3000/api/users/admin-notes', {
          withCredentials: true
        });
        setNotes(res.data.notes);
      } catch (err) {
        setError(err.response?.data?.error || 'Error loading admin notes.');
      }
    };
    fetchNotes();
  }, []);

  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AnnouncementIcon fontSize="small" />
          Admin Communications
        </Typography>

        {error && <Alert severity="error">{error}</Alert>}
        
        {!error && notes.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="text.secondary">
              No notifications from administrators
            </Typography>
          </Box>
        ) : (
          <List disablePadding>
            {notes.map((note, index) => (
              <React.Fragment key={index}>
                <ListItem alignItems="flex-start" sx={{ py: 2 }}>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      <AdminPanelSettingsIcon/>
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={note.content}
                    secondary={
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: 'block', mt: 0.5 }}
                      >
                        {new Date(note.timestamp).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </Typography>
                    }
                  />
                </ListItem>
                {index < notes.length - 1 && <Divider variant="inset" />}
              </React.Fragment>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminNotes;
