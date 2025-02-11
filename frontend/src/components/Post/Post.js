import React, { useState } from 'react';
import { Box, Typography, IconButton, TextField} from '@mui/material';
import { Favorite, ChatBubble, Bookmark } from '@mui/icons-material';
import Avatar from '@mui/material/Avatar';
import { Send } from '@mui/icons-material';

const Post = ({ post, onLike, onComment }) => {
    const [commentText, setCommentText] = useState('');
  
    const handleCommentSubmit = (e) => {
      e.preventDefault();
      if (commentText.trim()) {
        onComment(post.id, commentText.trim());
        setCommentText('');
      }
    };
  
    return (
      <div>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          p: 2,
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}>
          <Avatar src={post.profileImage} sx={{ width: 32, height: 32 }} />
          <Typography variant="subtitle2" sx={{ ml: 2, fontWeight: 600 }}>
            {post.username}
          </Typography>
        </Box>
  
        <img
          src={post.image}
          alt={post.caption}
          style={{
            width: '100%',
            height: 'auto',
            objectFit: 'cover',
            aspectRatio: '1/1'
          }}
        />
  
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', gap: 1.5, mb: 1 }}>
            <IconButton onClick={() => onLike(post.id)} sx={{ color: post.liked ? 'error.main' : 'inherit' }}>
              <Favorite />
            </IconButton>
            <IconButton>
              <ChatBubble />
            </IconButton>
            <IconButton sx={{ ml: 'auto' }}>
              <Bookmark />
            </IconButton>
          </Box>
  
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            {post.likes.toLocaleString()} likes
          </Typography>
  
          <Typography variant="body2" sx={{ mb: 1 }}>
            <span style={{ fontWeight: 600 }}>{post.username}</span> {post.caption}
          </Typography>
  
          {post.comments.map(comment => (
            <Typography key={comment.id} variant="body2" sx={{ mb: 0.5 }}>
              <span style={{ fontWeight: 600 }}>{comment.user}</span> {comment.text}
            </Typography>
          ))}
  
          <form onSubmit={handleCommentSubmit} style={{ marginTop: '1rem' }}>
            <TextField
              fullWidth
              placeholder="Add a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              size="small"
              variant="standard"
              InputProps={{
                endAdornment: (
                  <IconButton type="submit" size="small">
                    <Send fontSize="small" />
                  </IconButton>
                ),
                disableUnderline: true
              }}
              sx={{
                '& .MuiInputBase-root': {
                  borderRadius: 20,
                  px: 1.5,
                  bgcolor: 'action.hover'
                }
              }}
            />
          </form>
        </Box>
      </div>
    );
  };

export default Post;