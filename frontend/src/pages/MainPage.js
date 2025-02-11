import React, { useState } from 'react';
import { Grid, Paper, Box} from '@mui/material';
import postsData from '../Data/Post.json';
import Post from '../components/Post/Post';

const MainPage = () => {
  const [posts, setPosts] = useState(postsData.posts);

  const handleLike = (postId) => {
    setPosts(posts.map(post => 
      post.id === postId ? { ...post, likes: post.likes + 1 } : post
    ));
  };

  const handleComment = (postId, comment) => {
    setPosts(posts.map(post => 
      post.id === postId ? {
        ...post,
        comments: [...post.comments, {
          id: post.comments.length + 1,
          user: 'currentUser',
          text: comment
        }]
      } : post
    ));
  };

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
          <Grid item xs={12} key={post.id}>
            <Paper elevation={0} sx={{
              borderRadius: 2,
              overflow: 'hidden',
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper'
            }}>
              <Post 
                post={post} 
                onLike={handleLike} 
                onComment={handleComment} 
              />
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default MainPage;