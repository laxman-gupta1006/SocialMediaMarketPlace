import React, { useState, useEffect } from 'react';
import {
  TextField, Avatar, Grid, Typography, Paper, Button,
  CircularProgress, Box, Tooltip
} from '@mui/material';
import { Search, PersonAdd, Check, Lock } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';


const SearchPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [allResults, setAllResults] = useState([]);
  const [visibleCount, setVisibleCount] = useState(6);
  const [isLoading, setIsLoading] = useState(false);
  const { user: currentUser } = useAuth();

  const fetchResults = async (query) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/users/search?query=${encodeURIComponent(query)}`, {
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Search failed');
      const data = await res.json();
      setAllResults(data);
      setVisibleCount(6); // reset view count on new fetch
    } catch (err) {
      console.error('Search error:', err);
      setAllResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchResults(searchQuery.trim());
    }, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  useEffect(() => {
    // On first mount, show suggestions
    fetchResults('');
  }, []);

  const handleFollow = async (userId) => {
    try {
      const userToUpdate = allResults.find(user => user._id === userId);
      const isCurrentlyFollowing = userToUpdate.isFollowing;

      setAllResults(prev => prev.map(user =>
        user._id === userId ? { ...user, isProcessing: true } : user
      ));

      const endpoint = isCurrentlyFollowing ? 'unfollow' : 'follow';
      const res = await fetch(`/api/users/${endpoint}/${userId}`, {
        method: 'POST',
        credentials: 'include'
      });

      if (!res.ok) throw new Error('Action failed');
      const data = await res.json();

      setAllResults(prev =>
        prev.map(user =>
          user._id === userId
            ? {
              ...user,
              isFollowing: data.isFollowing,
              followersCount: data.followersCount,
              isProcessing: false
            }
            : user
        )
      );
    } catch (error) {
      console.error('Follow/Unfollow error:', error);
      setAllResults(prev => prev.map(user =>
        user._id === userId ? { ...user, isProcessing: false } : user
      ));
    }
  };

  const handleShowMore = () => {
    setVisibleCount(prev => prev + 6);
  };

  const visibleUsers = allResults.slice(0, visibleCount);

  return (
    <Paper sx={{
      width: '90%', maxWidth: 900, mx: 'auto', mt: 4, p: 3, borderRadius: 4,
      boxShadow: 3, backgroundColor: 'background.paper', border: '1px solid #e0e0e0',
      minHeight: '70vh', transition: 'all 0.3s ease-in-out'
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
      ) : visibleUsers.length > 0 ? (
        <>
          <Grid container spacing={2}>
            {visibleUsers.map(user => (
              <Grid item xs={12} key={user._id}>
                <Paper sx={{
                  p: 2, display: 'flex', alignItems: 'center', borderRadius: '12px',
                  transition: 'all 0.2s',
                  '&:hover': {
                    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)'
                  }
                }}>
                  <Avatar
                    src={user.profileImage}
                    sx={{
                      width: 56, height: 56, mr: 2,
                      border: user.isPrivate ? '2px solid #ff9800' : 'none'
                    }}
                  />
                  <Box sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography
  component={Link}
  to={`/profile/${user._id}`}
  variant="h6"
  sx={{
    fontWeight: 600,
    textDecoration: 'none',
    color: 'inherit',
    '&:hover': {
      textDecoration: 'underline',
      color: 'primary.main'
    }
  }}
>
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
                      disabled={user.isProcessing}
                      sx={{
                        textTransform: 'none',
                        borderRadius: '20px',
                        minWidth: '100px',
                        ...(user.isProcessing ? {
                          backgroundColor: 'action.disabled',
                          pointerEvents: 'none'
                        } : {})
                      }}
                    >
                      {user.isFollowing ? 'Unfollow' : 'Follow'}
                    </Button>
                  )}
                </Paper>
              </Grid>
            ))}
          </Grid>
          {visibleCount < allResults.length && (
            <Box display="flex" justifyContent="center" mt={3}>
              <Button onClick={handleShowMore} variant="outlined" sx={{ borderRadius: '20px' }}>
                Show More
              </Button>
            </Box>
          )}
        </>
      ) : (
        searchQuery && (
          <Box sx={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            py: 4, textAlign: 'center'
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
