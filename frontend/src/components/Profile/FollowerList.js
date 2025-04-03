import React, { useState, useEffect } from 'react';
import { 
  Dialog, DialogTitle, DialogContent, IconButton, 
  TextField, List, ListItem, ListItemAvatar, Avatar, 
  ListItemText, Button, Box, CircularProgress, Tooltip
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { PersonAdd, Check, Lock } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import config from '../../Config/config';

const BACKEND_URL = config.BACKEND_URL;

const FollowerList = ({ open, onClose, followers: initialFollowers, onRemoveSuccess }) => {
  const [followers, setFollowers] = useState([]);
  const [search, setSearch] = useState("");
  const { user: currentUser } = useAuth();

  useEffect(() => {
    if (Array.isArray(initialFollowers)) {
      setFollowers(initialFollowers.map(user => ({
        _id: user?._id?.toString() || '',
        userId: user?.userId?.toString() || user?._id?.toString() || '',
        username: user?.username || 'Unknown',
        fullName: user?.fullName || '',
        profileImage: user?.profileImage || '',
        followersCount: user?.followersCount || 0,
        isFollowing: Boolean(user?.isFollowing),
        isProcessing: false,
        isPrivate: Boolean(user?.isPrivate),
      })));
    } else {
      setFollowers([]);
    }
  }, [initialFollowers]);

  const handleFollow = async (userId) => {
    if (!userId) return;

    setFollowers(prev =>
      prev.map(user =>
        (user._id === userId || user.userId === userId)
          ? { ...user, isProcessing: true }
          : user
      )
    );

    try {
      const userToUpdate = followers.find(user => user._id === userId || user.userId === userId);
      if (!userToUpdate) throw new Error('User not found');

      const endpoint = userToUpdate.isFollowing ? 'unfollow' : 'follow';

      const res = await fetch(`${BACKEND_URL}/api/users/${endpoint}/${userId}`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!res.ok) throw new Error('Action failed');

      const data = await res.json();

      setFollowers(prev =>
        prev.map(user =>
          (user._id === userId || user.userId === userId)
            ? { 
                ...user, 
                isFollowing: data.isFollowing,
                followersCount: data.followersCount || user.followersCount,
                isProcessing: false
              } 
            : user
        )
      );
    } catch (error) {
      console.error('Follow/Unfollow error:', error.message);
      setFollowers(prev =>
        prev.map(user =>
          (user._id === userId || user.userId === userId)
            ? { ...user, isProcessing: false } 
            : user
        )
      );
    }
  };

  const handleRemove = async (userId) => {
    if (!userId) return;

    setFollowers(prev =>
      prev.map(user =>
        (user._id === userId || user.userId === userId)
          ? { ...user, isProcessing: true }
          : user
      )
    );

    try {
      const res = await fetch(`${BACKEND_URL}/api/users/remove-follower/${userId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!res.ok) throw new Error('Failed to remove follower');

      const data = await res.json();

      setFollowers(prev => prev.filter(user => user._id !== userId && user.userId !== userId));

      if (onRemoveSuccess) {
        onRemoveSuccess(data.newFollowersCount);
      }
    } catch (error) {
      console.error("Error removing follower:", error.message);
      setFollowers(prev =>
        prev.map(user =>
          (user._id === userId || user.userId === userId)
            ? { ...user, isProcessing: false }
            : user
        )
      );
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
        <DialogTitle sx={{ flexGrow: 1 }}>Followers</DialogTitle>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Box>

      <DialogContent>
        <TextField 
          fullWidth 
          placeholder="Search" 
          variant="outlined" 
          sx={{ mb: 2 }} 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <List>
          {followers
            .filter(user => 
              user?.username?.toLowerCase().includes(search.toLowerCase()) ||
              user?.fullName?.toLowerCase().includes(search.toLowerCase())
            )
            .map((user) => (
              <ListItem 
                key={user._id || user.userId}
                sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  gap: 1
                }}
              >
                <ListItemAvatar>
                  <Avatar src={user.profileImage} alt={user.username} />
                </ListItemAvatar>
                <ListItemText 
                  primary={
                    <>
                      {user.username}
                      {user.isPrivate && (
                        <Tooltip title="Private account" arrow>
                          <Lock color="action" sx={{ ml: 1, fontSize: '18px' }} />
                        </Tooltip>
                      )}
                    </>
                  } 
                  secondary={
                    <>
                      {user.fullName}
                      <span style={{ display: 'block', fontSize: '0.75rem' }}>
                        {user.followersCount} followers
                      </span>
                    </>
                  } 
                />
                
                {(user._id !== currentUser?._id && user.userId !== currentUser?._id) && (
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <Button
                      variant={user.isFollowing ? "outlined" : "contained"}
                      startIcon={user.isFollowing ? <Check /> : <PersonAdd />}
                      onClick={() => handleFollow(user._id || user.userId)}
                      disabled={user.isProcessing || (user.isPrivate && !user.isFollowing)}
                      sx={{ 
                        borderRadius: '20px',
                        textTransform: 'none',
                        minWidth: 100,
                        ...(user.isProcessing && {
                          backgroundColor: 'action.disabled',
                          pointerEvents: 'none'
                        })
                      }}
                    >
                      {user.isProcessing ? (
                        <CircularProgress size={20} />
                      ) : user.isFollowing ? (
                        'Following'
                      ) : user.isPrivate ? (
                        'Private'
                      ) : (
                        'Follow'
                      )}
                    </Button>
                    <Tooltip title="Remove follower" arrow>
                      <Button
                        variant="outlined"
                        size="small"
                        color="error"
                        onClick={() => handleRemove(user._id || user.userId)}
                        disabled={user.isProcessing}
                        sx={{ 
                          borderRadius: '20px', 
                          textTransform: 'none',
                          minWidth: 100
                        }}
                      >
                        Remove
                      </Button>
                    </Tooltip>
                  </Box>
                )}
              </ListItem>
            ))}
        </List>
      </DialogContent>
    </Dialog>
  );
};

export default FollowerList;
