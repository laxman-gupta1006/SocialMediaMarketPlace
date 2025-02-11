import { Card, CardMedia, IconButton, Typography } from '@mui/material';
import { Favorite, ChatBubble } from '@mui/icons-material';

const ProfilePost = ({ post }) => {
  return (
    <Card sx={{ 
        position: 'relative',
        borderRadius: 2,
        overflow: 'hidden',
        width: '100%',
        height: '100%',
        transition: 'transform 0.2s ease',
        '&:hover': {
          transform: 'scale(1.02)'
        }
      }}>
      <CardMedia
        component="img"
        image={post.image}
        alt={post.caption}
        sx={{ aspectRatio: '1/1' }}
      />
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        opacity: 0,
        transition: 'opacity 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        '&:hover': {
          opacity: 1
        }
      }}>
        <IconButton sx={{ color: 'white' }}>
          <Favorite fontSize="small" />
          <Typography variant="body2" sx={{ ml: 0.5, color: 'white' }}>
            {post.likes}
          </Typography>
        </IconButton>
        <IconButton sx={{ color: 'white' }}>
          <ChatBubble fontSize="small" />
          <Typography variant="body2" sx={{ ml: 0.5, color: 'white' }}>
            {post.comments.length}
          </Typography>
        </IconButton>
      </div>
    </Card>
  );
};

export default ProfilePost;