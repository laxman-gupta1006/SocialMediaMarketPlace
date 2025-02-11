import React, { useState, useEffect } from 'react';
import { 
  TextField, 
  Avatar, 
  Grid, 
  Typography, 
  Paper, 
  Button,
  CircularProgress,Box
} from '@mui/material';
import { Search, PersonAdd } from '@mui/icons-material';
import usersData from '../Data/user.json'; // Sample user data

const SearchPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [followedUsers, setFollowedUsers] = useState(new Set());

  // Simulated API call with debounce
  useEffect(() => {
    const searchUsers = async () => {
      if (searchQuery.trim()) {
        setIsLoading(true);
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const results = usersData.filter(user =>
          user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.fullName.toLowerCase().includes(searchQuery.toLowerCase())
        );
        
        setSearchResults(results);
        setIsLoading(false);
      } else {
        setSearchResults([]);
      }
    };

    const debounceTimer = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const handleFollow = (userId) => {
    setFollowedUsers(prev => {
      const newSet = new Set(prev);
      newSet.has(userId) ? newSet.delete(userId) : newSet.add(userId);
      return newSet;
    });
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 800, margin: '0 auto' }}>
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search profiles..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        InputProps={{
          startAdornment: <Search sx={{ color: 'action.active', mr: 1 }} />,
        }}
        sx={{ mb: 3 }}
      />

      {isLoading ? (
        <Box display="flex" justifyContent="center">
          <CircularProgress />
        </Box>
      ) : searchResults.length > 0 ? (
        <Grid container spacing={3}>
          {searchResults.map(user => (
            <Grid item xs={12} key={user.id}>
              <Paper sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
                <Avatar 
                  src={user.profileImage} 
                  sx={{ width: 56, height: 56, mr: 2 }}
                />
                <div style={{ flexGrow: 1 }}>
                  <Typography variant="h6">{user.username}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    {user.fullName}
                  </Typography>
                  <Typography variant="caption">
                    {user.followers} followers
                  </Typography>
                </div>
                <Button
                  variant={followedUsers.has(user.id) ? "outlined" : "contained"}
                  startIcon={<PersonAdd />}
                  onClick={() => handleFollow(user.id)}
                  sx={{ textTransform: 'none' }}
                >
                  {followedUsers.has(user.id) ? 'Following' : 'Follow'}
                </Button>
              </Paper>
            </Grid>
          ))}
        </Grid>
      ) : (
        searchQuery && (
          <Typography variant="body1" align="center" color="textSecondary">
            No results found for "{searchQuery}"
          </Typography>
        )
      )}
    </Paper>
  );
};

export default SearchPage;