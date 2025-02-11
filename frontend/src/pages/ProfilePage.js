import React, { useState } from 'react';
import { Paper, Grid, Typography, Box } from '@mui/material';
import EditProfileDialog from '../components/Profile/EditProfile';
import ProfileHeader from '../components/Profile/ProfileHeader';
import ProfilePost from '../components/Profile/ProfilePost';
import userData from '../Data/user.json';

const ProfilePage = () => {
  const [user, setUser] = useState(userData.user);
  const [editOpen, setEditOpen] = useState(false);

  const handleSaveProfile = (updatedData) => {
    setUser({ ...user, ...updatedData });
    setEditOpen(false);
  };

  return (
    <Box sx={{
      display: 'flex',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#fafafa',
      pt: 4
    }}>
      <Paper sx={{ 
        p: { xs: 2, sm: 4 },
        mb: 8,
        borderRadius: 4,
        width: '100%',
        maxWidth: '935px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden'
      }}>
        <ProfileHeader user={user} onEditClick={() => setEditOpen(true)} />
        
        <Typography variant="h6" sx={{ 
          mb: 3, 
          textAlign: 'center',
          fontWeight: 600,
          color: 'text.secondary',
          letterSpacing: '0.5px'
        }}>
          Posts
        </Typography>
        
        <Grid container spacing={2} justifyContent="center">
          {user.posts?.map(post => (
            <Grid item xs={12} sm={6} md={4} key={post.id} sx={{
              maxWidth: '293px',
              minWidth: '293px',
              height: '293px',
              position: 'relative'
            }}>
              <ProfilePost post={post} />
            </Grid>
          ))}
        </Grid>

        <EditProfileDialog
          open={editOpen}
          onClose={() => setEditOpen(false)}
          user={user}
          onSave={handleSaveProfile}
        />
      </Paper>
    </Box>
  );
};

export default ProfilePage;