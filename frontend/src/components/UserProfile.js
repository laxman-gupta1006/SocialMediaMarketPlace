import React from 'react';
import { 
  Avatar, 
  Typography, 
  Button, 
  Box, 
  CircularProgress,
  Tooltip
} from '@mui/material';
import { PersonAdd, Check, Lock } from '@mui/icons-material';
import config from '../Config/config';
const UserProfile = ({ 
  user, 
  currentUser, 
  onFollow, 
  isFollowing, 
  isLoading 
}) => {
  const profileImageUrl = user.profileImage?.startsWith('http')
    ? user.profileImage
    : `${config.BACKEND_URL}${user.profileImage}`;

  return (
    <Box sx={{ 
      p: 2, 
      display: 'flex', 
      alignItems: 'center',
      borderRadius: '12px',
      transition: 'all 0.2s',
      backgroundColor: 'background.default',
      '&:hover': { boxShadow: 1 }
    }}>
      <Avatar 
        src={profileImageUrl} 
        sx={{ 
          width: 56, 
          height: 56, 
          mr: 2,
          border: user.isPrivate ? '2px solid #ff9800' : 'none'
        }}
      />
      <Box sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {user.username}
          </Typography>
          {user.isPrivate && (
            <Tooltip title="Private account" arrow>
              <Lock color="action" sx={{ ml: 1, fontSize: '18px' }} />
            </Tooltip>
          )}
        </Box>
        <Typography variant="body2" color="text.secondary">
          {user.fullName}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {user.followersCount} followers
        </Typography>
      </Box>
      
      {user._id !== currentUser?._id && (
        <Button
          variant={isFollowing ? "outlined" : "contained"}
          startIcon={isFollowing ? <Check /> : <PersonAdd />}
          onClick={() => onFollow(user)}
          disabled={isLoading || (user.isPrivate && !isFollowing)}
          sx={{ 
            textTransform: 'none',
            borderRadius: '20px',
            minWidth: '100px',
            ...(user.isPrivate && !isFollowing ? {
              backgroundColor: 'action.disabledBackground',
              color: 'text.disabled'
            } : {})
          }}
        >
          {isLoading ? (
            <CircularProgress size={20} />
          ) : isFollowing ? 'Following' : 
            user.isPrivate ? 'Request' : 'Follow'}
        </Button>
      )}
    </Box>
  );
};

export default UserProfile;