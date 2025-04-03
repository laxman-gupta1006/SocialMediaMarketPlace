import React from 'react';
import { Avatar, Box, Button, Grid, Paper, Tooltip, Typography } from '@mui/material';
import { Check, PersonAdd, Lock } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';


const ProfileBox = ({ user, handleFollow }) => {
  const { user: currentUser } = useAuth();
  return (
    <Grid item xs={12} key={user._id}>
      <Paper
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          borderRadius: '12px',
          transition: 'all 0.2s',
          '&:hover': {
            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)'
          }
        }}
      >
        <Avatar
          src={user.profileImage}
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
            variant={user.isFollowing ? 'outlined' : 'contained'}
            startIcon={user.isFollowing ? <Check /> : <PersonAdd />}
            onClick={() => handleFollow(user._id)}
            disabled={user.isProcessing || (user.isPrivate && !user.isFollowing)}
            sx={{
              textTransform: 'none',
              borderRadius: '20px',
              minWidth: '100px',
              ...(user.isProcessing
                ? {
                    backgroundColor: 'action.disabled',
                    pointerEvents: 'none'
                  }
                : {})
            }}
          >
            {user.isFollowing ? 'Unfollow' : user.isPrivate ? 'Private' : 'Follow'}
          </Button>
        )}
      </Paper>
    </Grid>
  );
};

export default ProfileBox;
