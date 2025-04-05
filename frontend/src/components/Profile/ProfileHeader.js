import { 
  Grid, 
  Avatar, 
  Typography, 
  Button, 
  Stack, 
  Divider,
  Box,
  CircularProgress,
  IconButton,
  Dialog,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText
} from '@mui/material';
import { Link } from 'react-router-dom';
import SettingsIcon from '@mui/icons-material/Settings';
import Settings from './Settings';
import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';
import { useParams } from 'react-router-dom';

const BACKEND_URL = 'https://192.168.2.250:3000';

const ProfileHeader = ({ user, onEditClick }) => {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [followersOpen, setFollowersOpen] = useState(false);
  const [followingOpen, setFollowingOpen] = useState(false);
  const { user: currentUser } = useAuth();
  const { userId } = useParams();

  if (!user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Check if the profile being viewed belongs to the current user
  const isCurrentUser = !userId || (currentUser && user._id === currentUser._id);

  // Construct the full profile image URL
  const profileImageUrl = user.profileImage?.startsWith('http') 
    ? user.profileImage 
    : `${BACKEND_URL}${user.profileImage}`;

  return (
    <>
      <Grid container spacing={3} alignItems="center">
        <Grid item xs={12} md={3} sx={{ display: 'flex', justifyContent: 'center' }}>
          <Avatar 
            src={profileImageUrl}
            alt={user.username}
            sx={{ 
              width: 150, 
              height: 150, 
              border: '3px solid white', 
              boxShadow: 3 
            }}
          />
        </Grid>
        
        <Grid item xs={12} md={9}>
          <Stack spacing={2}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <Typography variant="h4">{user.fullName}</Typography>
              
              {isCurrentUser ? (
                <>
                  <Button 
                    variant="outlined" 
                    onClick={onEditClick}
                    sx={{ textTransform: 'none', px: 3 }}
                  >
                    Edit Profile
                  </Button>
                  <IconButton 
                    onClick={() => setSettingsOpen(true)}
                    sx={{ ml: 1 }}
                    aria-label="settings"
                  >
                    <SettingsIcon />
                  </IconButton>
                </>
              ) : (
                <Button 
                  variant="contained" 
                  sx={{ textTransform: 'none', px: 3 }}
                >
                  Follow
                </Button>
              )}
            </div>

            <div style={{ display: 'flex', gap: 30 }}>
              <Typography>
                <strong>{user.post?.length || 0}</strong> posts
              </Typography>
              <Typography 
                onClick={() => setFollowersOpen(true)} 
                sx={{ cursor: 'pointer' }}
              >
                <strong>{user.followers?.length || 0}</strong> followers
              </Typography>
              <Typography 
                onClick={() => setFollowingOpen(true)} 
                sx={{ cursor: 'pointer' }}
              >
                <strong>{user.following?.length || 0}</strong> following
              </Typography>
            </div>

            <div>
              <Typography variant="subtitle1" fontWeight={600}>{user.username}</Typography>
              <Typography variant="body2">{user.bio}</Typography>
              {user.website && (
                <Typography variant="body2" color="primary">
                  <a href={user.website} target="_blank" rel="noopener noreferrer">
                    {user.website}
                  </a>
                </Typography>
              )}
            </div>
          </Stack>
        </Grid>
        
        <Grid item xs={12}>
          <Divider sx={{ my: 3 }} />
        </Grid>
      </Grid>

      {/* Settings Dialog - Only relevant for current user */}
      {isCurrentUser && (
        <Dialog
          open={settingsOpen}
          onClose={() => setSettingsOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <Box sx={{ p: 3 }}>
            <Settings />
          </Box>
        </Dialog>
      )}

      {/* Followers Dialog */}
      <Dialog
        open={followersOpen}
        onClose={() => setFollowersOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Followers</Typography>
          {user.followers && user.followers.length > 0 ? (
            <List>
              {user.followers.map((follower, index) => (
                <ListItem key={index}>
                  <ListItemAvatar>
                    <Avatar 
                      src={follower.profileImage?.startsWith('http') 
                        ? follower.profileImage 
                        : `${BACKEND_URL}${follower.profileImage}`
                      } 
                      alt={follower.username} 
                    />
                  </ListItemAvatar>
                  <ListItemText 
                    primary={
                      <Link 
                        to={`/profile/${follower.userId}`} 
                        style={{ textDecoration: 'none', color: 'inherit' }}
                        onClick={() => setFollowersOpen(false)}
                      >
                        {follower.username}
                      </Link>
                    } 
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography>No followers</Typography>
          )}
        </Box>
      </Dialog>

      {/* Following Dialog */}
      <Dialog
        open={followingOpen}
        onClose={() => setFollowingOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Following</Typography>
          {user.following && user.following.length > 0 ? (
            <List>
              {user.following.map((follow, index) => (
                <ListItem key={index}>
                  <ListItemAvatar>
                    <Avatar 
                      src={follow.profileImage?.startsWith('http') 
                        ? follow.profileImage 
                        : `${BACKEND_URL}${follow.profileImage}`
                      } 
                      alt={follow.username} 
                    />
                  </ListItemAvatar>
                  <ListItemText 
                    primary={
                      <Link 
                        to={`/profile/${follow.userId}`} 
                        style={{ textDecoration: 'none', color: 'inherit' }}
                        onClick={() => setFollowingOpen(false)}
                      >
                        {follow.username}
                      </Link>
                    } 
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography>Not following anyone</Typography>
          )}
        </Box>
      </Dialog>
    </>
  );
};

export default ProfileHeader;
