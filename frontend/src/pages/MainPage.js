import React, { useState, useEffect, useCallback } from 'react';
import { Grid, Paper, Box, CircularProgress, Typography } from '@mui/material';
import Post from '../components/Post/Post';
import { useAuth } from '../context/AuthContext';
import config from '../Config/config';

const BACKEND_URL = config.BACKEND_URL;

const MainPage = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPosts = useCallback(async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/posts`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }, 
      });

      if (!response.ok) {
        throw new Error('Failed to fetch posts');
      }

      const data = await response.json();
      setPosts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchPosts();
    }
  }, [user, fetchPosts]);

  const handleLike = async (postId) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/posts/like/${postId}`, {
        method: 'PUT',
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Like update failed');

      setPosts(prevPosts => prevPosts.map(post => {
        if (post._id === postId) {
          const hasLiked = post.likes.includes(user._id);
          return {
            ...post,
            likes: hasLiked 
              ? post.likes.filter(id => id !== user._id)
              : [...post.likes, user._id],
            likesCount: hasLiked ? post.likesCount - 1 : post.likesCount + 1,
            hasLiked: !hasLiked
          };
        }
        return post;
      }));
    } catch (error) {
      console.error('Like error:', error);
    }
  };

  const handleComment = async (postId, text) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/posts/comment/${postId}`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) throw new Error('Comment failed');
      
      const newComment = await response.json();
      console.log('New comment from server:', newComment);

      setPosts(prevPosts => prevPosts.map(post => {
        if (post._id === postId) {
          return {
            ...post,
            comments: [...post.comments, newComment]
          };
        }
        return post;
      }));
    } catch (error) {
      console.error('Comment error:', error);
    }
  };

  const handleReport = async (postId, reason) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/posts/report/${postId}`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason }),
      });

      if (!response.ok) throw new Error('Report failed');
      alert('Post reported successfully');
    } catch (error) {
      console.error('Report error:', error);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
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
      <Grid container spacing={4} sx={{ 
        maxWidth: { xs: '100%', sm: 600, md: 800 },
        px: { xs: 2, sm: 0 }
      }}>
        {posts.map(post => (
          <Grid item xs={12} key={post._id}>
            <Paper elevation={0} sx={{
              borderRadius: 2,
              overflow: 'hidden',
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper'
            }}>
              <Post 
                post={{
                  id: post._id,
                  userId: post.userId,
                  username: post.username,
                  profileImage: post.profileImage,
                  media: post.media, // No fallback to post.image needed
                  mediaType: post.mediaType || 'image',
                  caption: post.caption,
                  likes: post.likes,
                  comments: post.comments,
                  hasLiked: post.hasLiked,
                  createdAt: post.createdAt
                }}
                onLike={handleLike}
                onComment={handleComment}
                onReport={handleReport}
              />
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default MainPage;