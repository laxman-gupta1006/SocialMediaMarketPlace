import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  TextField,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Button,
  Box,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ProfileBox from "../SearchPage/ProfileBox"
import config from '../../Config/config';

const BACKEND_URL = config.BACKEND_URL;
const FollowingList = ({ open, onClose, following = [] }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  // Filter users based on search term (add defensive checks)
  const filteredUsers = following.filter((user) =>
    user?.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFollow = async (userId) => {
    try {
      const userToUpdate = searchResults.find(user => user._id === userId);
      const isCurrentlyFollowing = userToUpdate.isFollowing;
  
      // Disable button during request
      setSearchResults(prev => prev.map(user => 
        user._id === userId ? {...user, isProcessing: true} : user
      ));
  
      // Determine correct endpoint
      const endpoint = isCurrentlyFollowing ? 'unfollow' : 'follow';
      const res = await fetch(`${BACKEND_URL}/api/users/${endpoint}/${userId}`, {
        method: 'POST',
        credentials: 'include'
      });
      
      if (!res.ok) throw new Error('Action failed');
      
      const data = await res.json();
      
      // Update state with API response data
      setSearchResults(prevResults => 
        prevResults.map(user => 
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
      setSearchResults(prev => prev.map(user => 
        user._id === userId ? {...user, isProcessing: false} : user
      ));
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <Box
        sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", p: 2 }}
      >
        <DialogTitle sx={{ flexGrow: 1 }}>Following</DialogTitle>
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
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

      <List>
        {filteredUsers.length > 0 ? (
          filteredUsers.map(user => (
            <ProfileBox
              key={user._id || Math.random()}
              user={user}
              handleFollow={handleFollow} // Use the same follow/unfollow logic
            />
          ))
        ) : (
          <ListItem>
            <ListItemText primary="No users found" />
          </ListItem>
        )}
      </List>
      </DialogContent>
    </Dialog>
  );
};

export default FollowingList;
