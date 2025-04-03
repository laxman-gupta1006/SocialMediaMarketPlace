import React, { useState, useEffect } from 'react';
import {
  Avatar,
  Typography,
  Paper,
  Button,
  Box,
  Tooltip
} from '@mui/material';
import { PersonAdd, Check, Lock } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import config from '../Config/config';

const BACKEND_URL = config.BACKEND_URL;

const UserProfileCard = ({ user, onFollowSuccess }) => {
  const { user: currentUser } = useAuth();
  const [localUser, setLocalUser] = useState(user);
  const [isProcessing, setIsProcessing] = useState(false);

  // Sync local state with prop changes
  useEffect(() => {
    setLocalUser(user);
  }, [user]);

  const handleFollow = async () => {
    if (!currentUser) return;

    try {
      setIsProcessing(true);
      const endpoint = localUser.isFollowing ? 'unfollow' : 'follow';
      
      const res = await fetch(`${BACKEND_URL}/api/users/${endpoint}/${localUser._id}`, {
        method: 'POST',
        credentials: 'include'
      });

      if (!res.ok) throw new Error('Action failed');

      const data = await res.json();

      // Update local state immediately
      const updatedUser = {
        ...localUser,
        isFollowing: data.isFollowing,
        followersCount: data.followersCount
      };
      
      setLocalUser(updatedUser);

      // Notify parent component if callback exists
      if (onFollowSuccess) {
        onFollowSuccess(updatedUser);
      }
    } catch (error) {
      console.error('Follow action failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Paper sx={{
      p: 2,
      display: 'flex',
      alignItems: 'center',
      borderRadius: '12px',
      transition: 'all 0.2s',
      '&:hover': {
        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)'
      }
    }}>
      <Avatar
        src={localUser.profileImage}
        sx={{
          width: 56,
          height: 56,
          mr: 2,
          border: localUser.isPrivate ? '2px solid #ff9800' : 'none'
        }}
        alt={localUser.username}
      />
      
      <Box sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {localUser.username}
          </Typography>
          {localUser.isPrivate && (
            <Tooltip title="Private account" arrow>
              <Lock color="action" sx={{ ml: 1, fontSize: '18px' }} />
            </Tooltip>
          )}
        </Box>
        
        <Typography variant="body2" color="text.secondary">
          {localUser.fullName}
        </Typography>
        
        <Typography variant="caption" color="text.secondary">
          {localUser.followersCount} followers
        </Typography>
      </Box>

      {currentUser?._id !== localUser._id && (
        <Button
          variant={localUser.isFollowing ? "outlined" : "contained"}
          startIcon={localUser.isFollowing ? <Check /> : <PersonAdd />}
          onClick={handleFollow}
          disabled={isProcessing || (localUser.isPrivate && !localUser.isFollowing)}
          sx={{ 
            textTransform: 'none',
            borderRadius: '20px',
            minWidth: '100px',
            ...(isProcessing && {
              backgroundColor: 'action.disabled',
              pointerEvents: 'none'
            })
          }}
        >
          {localUser.isFollowing 
            ? 'Unfollow' 
            : localUser.isPrivate 
              ? 'Private' 
              : 'Follow'}
        </Button>
      )}
    </Paper>
  );
};

export default UserProfileCard;