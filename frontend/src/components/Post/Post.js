import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  IconButton, 
  TextField,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Select,
  FormControl,
  InputLabel,
  Link
} from '@mui/material';
import { 
  Favorite, 
  ChatBubble, 
  Bookmark, 
  MoreVert,
  Report,
  Send 
} from '@mui/icons-material';
import Avatar from '@mui/material/Avatar';
import { Link as RouterLink } from 'react-router-dom';

const Post = ({ post, onLike, onComment, onReport }) => {
  console.log(post);
  const [commentText, setCommentText] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleReportClick = () => {
    setReportDialogOpen(true);
    handleMenuClose();
  };

  const handleReportSubmit = () => {
    onReport(post.id, reportReason);
    setReportDialogOpen(false);
    setReportReason('');
  };

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
        justifyContent: 'space-between',
        p: 2,
        borderBottom: '1px solid',
        borderColor: 'divider'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar src={post.profileImage} sx={{ width: 32, height: 32 }} />
          <Link 
            component={RouterLink} 
            to={`/user/${post.userId}`}
            sx={{ 
              ml: 2, 
              fontWeight: 600,
              textDecoration: 'none',
              color: 'inherit',
              '&:hover': {
                textDecoration: 'underline'
              }
            }}
          >
            {post.username}
          </Link>
        </Box>
        <IconButton onClick={handleMenuOpen}>
          <MoreVert />
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleReportClick}>
            <Report sx={{ mr: 1 }} /> Report
          </MenuItem>
        </Menu>
      </Box>

      {post.mediaType === 'video' ? (
        <video
          controls
          src={post.media}
          style={{
            width: '100%',
            height: 'auto',
            objectFit: 'cover',
            aspectRatio: '1/1',
            backgroundColor: '#000'
          }}
        >
          Your browser does not support the video tag.
        </video>
      ) : (
        <img
          src={post.media}
          alt={post.caption}
          style={{
            width: '100%',
            height: 'auto',
            objectFit: 'cover',
            aspectRatio: '1/1'
          }}
        />
      )}

      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', gap: 1.5, mb: 1 }}>
          <IconButton 
            onClick={() => onLike(post.id)} 
            sx={{ color: post.hasLiked ? 'error.main' : 'inherit' }}
          >
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
          {post.likes.length} likes
        </Typography>

        <Typography variant="body2" sx={{ mb: 1 }}>
          <Link 
            component={RouterLink} 
            to={`/user/${post.userId}`}
            sx={{ 
              fontWeight: 600,
              textDecoration: 'none',
              color: 'inherit',
              '&:hover': {
                textDecoration: 'underline'
              }
            }}
          >
            {post.username}
          </Link> {post.caption}
        </Typography>
            
        {post.comments.map(comment => (
  <Box key={comment._id} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1 }}>
    <Avatar 
      src={comment.profileImage} 
      sx={{ width: 24, height: 24 }}
      component={RouterLink}
      to={`/user/${comment.userId}`}
    />
    <Box>
      <Typography variant="body2">
        <Link 
          component={RouterLink} 
          to={`/user/${comment.userId}`}
          sx={{ 
            fontWeight: 600,
            textDecoration: 'none',
            color: 'inherit',
            '&:hover': { textDecoration: 'underline' }
          }}
        >
          {comment.username}
        </Link> {comment.text}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {new Date(comment.createdAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}
      </Typography>
    </Box>
  </Box>
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

      <Dialog open={reportDialogOpen} onClose={() => setReportDialogOpen(false)}>
        <DialogTitle>Report Post</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Reason</InputLabel>
            <Select
              value={reportReason}
              label="Reason"
              onChange={(e) => setReportReason(e.target.value)}
            >
              <MenuItem value="spam">Spam</MenuItem>
              <MenuItem value="inappropriate">Inappropriate Content</MenuItem>
              <MenuItem value="harassment">Harassment</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReportDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleReportSubmit} 
            disabled={!reportReason}
            color="error"
          >
            Report
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Post;