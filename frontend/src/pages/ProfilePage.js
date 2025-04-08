import React, { useState, useEffect } from 'react';
import { Paper, Grid, Typography, Box } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import EditProfileDialog from '../components/Profile/EditProfile';
import ProfileHeader from '../components/Profile/ProfileHeader';
import ProfilePost from '../components/Profile/ProfilePost';
import { useParams } from 'react-router-dom';

const ProfilePage = () => {
  const { user: currentUser, loading: authLoading, checkAuth } = useAuth();
  const [userProfile, setUserProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [editOpen, setEditOpen] = useState(false);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [profileError, setProfileError] = useState(null);
  const [postsError, setPostsError] = useState(null);
  const { userId } = useParams();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const res = await fetch(`/api/users/user/${userId || currentUser._id}`, {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Failed to fetch user profile');
        }

        const data = await res.json();
        setUserProfile(data);
        setProfileError(null);
      } catch (error) {
        console.error('Error fetching user profile:', error);
        setProfileError(error.message);
        setUserProfile(null);
      }
    };

    const fetchPosts = async () => {
      try {
        setLoadingPosts(true);
        setPostsError(null);
        const res = await fetch(`/api/posts/user/${userId || currentUser._id}`, {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Failed to fetch posts');
        }

        const data = await res.json();
        if (data.isPrivate) {
          setPostsError(data.message);
        } else {
          setPosts(data.posts);
        }
      } catch (error) {
        console.error('Error fetching posts:', error);
        setPostsError(error.message);
      } finally {
        setLoadingPosts(false);
      }
    };

    if (!authLoading && currentUser) {
      fetchUserProfile();
      fetchPosts();
    }
  }, [userId, currentUser, authLoading, checkAuth]);

  const handleSaveProfile = async (updatedData) => {
    try {
      const res = await fetch(`/api/users/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(updatedData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to update profile');
      }

      await checkAuth(); // Refresh auth state to get updated user data
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
        <Typography>Please login to view profiles</Typography>
      </Box>
    );
  }

  if (profileError) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', pt: 4 }}>
        <Typography color="error" variant="h6">
          {profileError === 'User not found' ? 'User not found.' : profileError}
        </Typography>
      </Box>
    );
  }

  if (!userProfile) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', pt: 4 }}>
        <Typography>Loading profile...</Typography>
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
          user={userProfile}
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
        ) : postsError ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="error">{postsError}</Typography>
            {postsError.includes('private') && (
              <Typography>This account is Private.</Typography>
            )}
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
          user={userProfile}
          onSave={handleSaveProfile}
        />
      </Paper>
    </Box>
  );
};

export default ProfilePage;
