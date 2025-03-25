import { Card, CardMedia, IconButton, Typography, Box } from '@mui/material';
import { Favorite, ChatBubble } from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const HoverOverlay = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  opacity: 0,
  transition: 'opacity 0.3s ease',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: theme.spacing(4),
  '&:hover': {
    opacity: 1,
  },
}));

const InteractionButton = styled(IconButton)(({ theme }) => ({
  color: theme.palette.common.white,
  backgroundColor: 'rgba(255, 255, 255, 0.2)',
  padding: theme.spacing(1.5),
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    transform: 'scale(1.1)',
  },
  transition: 'all 0.2s ease',
}));

const InteractionCount = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  textShadow: '0 1px 3px rgba(0,0,0,0.5)',
}));

const ProfilePost = ({ post }) => {
  return (
    <Card sx={{ 
      position: 'relative',
      borderRadius: 2,
      overflow: 'hidden',
      width: '100%',
      height: '100%',
      boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      '&:hover': {
        transform: 'scale(1.03)',
        boxShadow: '0 6px 12px rgba(0,0,0,0.15)',
      }
    }}>
      <CardMedia
        component="img"
        image={post.image}
        alt={post.caption}
        sx={{ 
          aspectRatio: '1/1',
          objectFit: 'cover',
          width: '100%',
          height: '100%',
        }}
      />
      
      <HoverOverlay>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <InteractionButton aria-label="like">
            <Favorite fontSize="medium" />
            <InteractionCount variant="body2" sx={{ ml: 1 }}>
              {post.likes?.length || 0}
            </InteractionCount>
          </InteractionButton>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <InteractionButton aria-label="comments">
            <ChatBubble fontSize="medium" />
            <InteractionCount variant="body2" sx={{ ml: 1 }}>
              {post.comments?.length || 0}
            </InteractionCount>
          </InteractionButton>
        </Box>
      </HoverOverlay>
    </Card>
  );
};

export default ProfilePost;