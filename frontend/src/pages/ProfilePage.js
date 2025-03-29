import React, { useState, useEffect } from 'react';
import { Paper, Grid, Typography, Box } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import EditProfileDialog from '../components/Profile/EditProfile';
import ProfileHeader from '../components/Profile/ProfileHeader';
import ProfilePost from '../components/Profile/ProfilePost';
import config from '../Config/config';

const BACKEND_URL = config.BACKEND_URL;

const ProfilePage = () => {
  const { user: currentUser, loading: authLoading, checkAuth } = useAuth();
  const [posts, setPosts] = useState([]);
  const [editOpen, setEditOpen] = useState(false);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
   // In your fetchPosts function
const fetchPosts = async () => {
  if (!currentUser?._id) return;
  try {
    setLoadingPosts(true);
    const res = await fetch(`${BACKEND_URL}/api/posts/user/${currentUser._id}`, {
      method: 'GET',
      credentials: 'include',
      headers: { 
        'Content-Type': 'application/json'
      }
    });
    
    if (!res.ok) {
      const errorData = await res.json();
      // Handle specific visibility errors
      if (errorData.error === 'Profile is private') {
        setError('This profile is private');
      } else {
        throw new Error(errorData.error || 'Failed to fetch posts');
      }
      return;
    }
    
    const data = await res.json();
    setPosts(data.posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    setError(error.message);
  } finally {
    setLoadingPosts(false);
  }
};
    
    if (!authLoading && currentUser) {
      fetchPosts();
    }
  }, [currentUser?._id, authLoading, checkAuth]);

  const handleSaveProfile = async (updatedData) => {
    try {
      // If there's a new profile image, it's already been uploaded and the path is in updatedData
      const res = await fetch(`${BACKEND_URL}/api/users/update`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(updatedData),
      });
  
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to update profile');
      }
  
      // Refresh auth state to get updated user data including new profile photo
      await checkAuth();
      setEditOpen(false);
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  };

  if (authLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', pt: 4 }}>
        <Typography>Loading user data...</Typography>
      </Box>
    );
  }

  if (!currentUser) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', pt: 4 }}>
        <Typography>Please login to view your profile</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', pt: 4 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

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
        <ProfileHeader 
          user={currentUser} 
          onEditClick={() => setEditOpen(true)} 
        />

        <Typography variant="h6" sx={{ 
          mb: 3, 
          textAlign: 'center',
          fontWeight: 600,
          color: 'text.secondary',
          letterSpacing: '0.5px'
        }}>
          Posts
        </Typography>

        {loadingPosts ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography>Loading posts...</Typography>
          </Box>
        ) : posts.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography>No posts yet</Typography>
          </Box>
        ) : (
          <Grid container spacing={2} justifyContent="center">
            {posts.map(post => (
              <Grid item xs={12} sm={6} md={4} key={post._id} sx={{
                maxWidth: '293px',
                minWidth: '293px',
                height: '293px',
                position: 'relative'
              }}>
                <ProfilePost post={post} />
              </Grid>
            ))}
          </Grid>
        )}

        <EditProfileDialog
          open={editOpen}
          onClose={() => setEditOpen(false)}
          user={currentUser}
          onSave={handleSaveProfile}
        />
      </Paper>
    </Box>
  );
};

export default ProfilePage;