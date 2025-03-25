import React, { useState, useEffect } from 'react';
import { 
  TextField, 
  Avatar, 
  Grid, 
  Typography, 
  Paper, 
  Button,
  CircularProgress,
  Box,
  Tooltip
} from '@mui/material';
import { Search, PersonAdd, Check, Lock } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const BACKEND_URL = 'https://192.168.2.250:3000';

const SearchPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user: currentUser } = useAuth();

  // Debounced search API call
  useEffect(() => {
    const searchUsers = async () => {
      if (searchQuery.trim().length >= 2) {
        setIsLoading(true);
        try {
          const res = await fetch(`${BACKEND_URL}/api/users/search?query=${encodeURIComponent(searchQuery)}`, {
            credentials: 'include'
          });
          
          if (!res.ok) throw new Error('Search failed');
          
          const data = await res.json();
          setSearchResults(data);
        } catch (error) {
          console.error('Search error:', error);
          setSearchResults([]);
        } finally {
          setIsLoading(false);
        }
      } else {
        setSearchResults([]);
      }
    };

    const debounceTimer = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const handleFollow = async (userId) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/users/follow/${userId}`, {
        method: 'POST',
        credentials: 'include'
      });
      
      if (!res.ok) throw new Error('Follow action failed');
      
      const data = await res.json();
      
      setSearchResults(prevResults => 
        prevResults.map(user => 
          user._id === userId 
            ? { 
                ...user, 
                isFollowing: data.isFollowing,
                followersCount: data.isFollowing 
                  ? (user.followersCount || 0) + 1 
                  : Math.max(0, (user.followersCount || 1) - 1)
              } 
            : user
        )
      );
    } catch (error) {
      console.error('Follow error:', error);
    }
  };

  return (
    <Paper sx={{ 
      p: 3, 
      maxWidth: 800, 
      margin: '0 auto',
      minHeight: '70vh'
    }}>
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search users by username or name..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        InputProps={{
          startAdornment: <Search sx={{ color: 'action.active', mr: 1 }} />,
        }}
        sx={{ 
          mb: 3,
          '& .MuiOutlinedInput-root': {
            borderRadius: '50px',
          }
        }}
      />

      {isLoading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      ) : searchResults.length > 0 ? (
        <Grid container spacing={2}>
          {searchResults.map(user => (
            <Grid item xs={12} key={user._id}>
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
                    variant={user.isFollowing ? "outlined" : "contained"}
                    startIcon={user.isFollowing ? <Check /> : <PersonAdd />}
                    onClick={() => handleFollow(user._id)}
                    sx={{ 
                      textTransform: 'none',
                      borderRadius: '20px',
                      minWidth: '100px',
                      ...(user.isPrivate && !user.isFollowing ? {
                        backgroundColor: '#f5f5f5',
                        color: 'text.disabled',
                        pointerEvents: 'none'
                      } : {})
                    }}
                    disabled={user.isPrivate && !user.isFollowing}
                  >
                    {user.isFollowing ? 'Following' : 
                     user.isPrivate ? 'Private' : 'Follow'}
                  </Button>
                )}
              </Paper>
            </Grid>
          ))}
        </Grid>
      ) : (
        searchQuery && (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            py: 4,
            textAlign: 'center'
          }}>
            <Search sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              {searchQuery.length < 2 
                ? 'Type at least 2 characters to search' 
                : `No results found for "${searchQuery}"`}
            </Typography>
            {searchQuery.length >= 2 && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Try different keywords or check spelling
              </Typography>
            )}
          </Box>
        )
      )}
    </Paper>
  );
};

export default SearchPage;