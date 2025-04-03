// import {
//   Grid,
//   Avatar,
//   Typography,
//   Button,
//   Stack,
//   Divider,
//   Box,
//   CircularProgress,
//   IconButton,
//   Dialog
// } from '@mui/material';
// import SettingsIcon from '@mui/icons-material/Settings';
// import Settings from './Settings';
// import { useAuth } from '../../context/AuthContext'; // Import useAuth
// import { useState } from 'react';
// import FollowingList from './FollowingList';
// import FollowerList from './FollowerList'


// const BACKEND_URL = 'https://192.168.2.250:3000';

// const ProfileHeader = ({ user, onEditClick }) => {
//   const [settingsOpen, setSettingsOpen] = useState(false);
//   const [followingOpen, setFollowingOpen] = useState(false);
//   const [followersOpen, setFollowersOpen] = useState(false);
//   const [following, setFollowing] = useState(user.following);
//   const { user: currentUser } = useAuth(); // Get current logged-in user

//   const handleOpenFollowing = () => {
//     setFollowingOpen(true);
//   };
//   const handleOpenFollowers = () => {
//     setFollowersOpen(true);
//   };

//   if (!user) {
//     return (
//       <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
//         <CircularProgress />
//       </Box>
//     );
//   }

//   // Check if the profile belongs to the current user
//   const isCurrentUser = currentUser && user._id === currentUser._id;

//   // Construct the full profile image URL
//   const profileImageUrl = user.profileImage?.startsWith('http')
//     ? user.profileImage
//     : `${BACKEND_URL}${user.profileImage}`;

//   return (
//     <Grid container spacing={3} alignItems="center">
//       <Grid item xs={12} md={3} sx={{ display: 'flex', justifyContent: 'center' }}>
//         <Avatar
//           src={profileImageUrl}
//           alt={user.username}
//           sx={{
//             width: 150,
//             height: 150,
//             border: '3px solid white',
//             boxShadow: 3
//           }}
//         />
//       </Grid>

//       <Grid item xs={12} md={9}>
//         <Stack spacing={2}>
//           <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
//             <Typography variant="h4">{user.fullName}</Typography>

//             {isCurrentUser ? (
//               <>
//                 <Button
//                   variant="outlined"
//                   onClick={onEditClick}
//                   sx={{ textTransform: 'none', px: 3 }}
//                 >
//                   Edit Profile
//                 </Button>
//                 <IconButton
//                   onClick={() => setSettingsOpen(true)}
//                   sx={{ ml: 1 }}
//                   aria-label="settings"
//                 >
//                   <SettingsIcon />
//                 </IconButton>
//               </>
//             ) : (
//               <>
//                 <Button
//                   variant="contained"
//                   sx={{ textTransform: 'none', px: 3 }}
//                 >
//                   Follow
//                 </Button>
//               </>
//             )}
//           </div>

//           <div style={{ display: 'flex', gap: 30 }}>
//             <Typography><strong>{user.postsCount}</strong> posts</Typography>
//             <Typography
//               sx={{ cursor: 'pointer', color: 'blue' }}
//               onClick={handleOpenFollowers}
//             >
//               <strong>{user.followers?.length || 0}</strong> followers</Typography>
//             <Typography
//               sx={{ cursor: 'pointer', color: 'blue' }}
//               onClick={handleOpenFollowing}
//             >
//               <strong>{user.following?.length || 0}</strong> following</Typography>
//           </div>

//           <div>
//             <Typography variant="subtitle1" fontWeight={600}>{user.username}</Typography>
//             <Typography variant="body2">{user.bio}</Typography>
//             {user.website && (
//               <Typography variant="body2" color="primary">
//                 <a href={user.website} target="_blank" rel="noopener noreferrer">
//                   {user.website}
//                 </a>
//               </Typography>
//             )}
//           </div>
//         </Stack>
//         <FollowingList
//           open={followingOpen}
//           onClose={() => setFollowingOpen(false)}
//           following={user.following || []}
//           setFollowing={setFollowing}
//         />

//         <FollowerList
//           open={followersOpen}
//           onClose={() => setFollowersOpen(false)}
//           followers={user.followers || []}
//         />
//       </Grid>

//       <Grid item xs={12}>
//         <Divider sx={{ my: 3 }} />
//       </Grid>

//       {/* Settings Dialog - Only relevant for current user */}
//       {isCurrentUser && (
//         <Dialog
//           open={settingsOpen}
//           onClose={() => setSettingsOpen(false)}
//           maxWidth="sm"
//           fullWidth
//         >
//           <Box sx={{ p: 3 }}>
//             <Settings />
//           </Box>
//         </Dialog>
//       )}
//     </Grid>
//   );
// };

// export default ProfileHeader;


// import {
//   Grid,
//   Avatar,
//   Typography,
//   Button,
//   Stack,
//   Divider,
//   Box,
//   CircularProgress,
//   IconButton,
//   Dialog
// } from '@mui/material';
// import SettingsIcon from '@mui/icons-material/Settings';
// import Settings from './Settings';
// import { useAuth } from '../../context/AuthContext';
// import { useState } from 'react';
// import FollowingList from './FollowingList';
// import FollowerList from './FollowerList';

// const BACKEND_URL = 'https://192.168.2.250:3000';

// const ProfileHeader = ({ user, onEditClick, isPrivateProfile = false }) => {
//   const [settingsOpen, setSettingsOpen] = useState(false);
//   const [followingOpen, setFollowingOpen] = useState(false);
//   const [followersOpen, setFollowersOpen] = useState(false);
//   const [following, setFollowing] = useState(user.following);
//   const { user: currentUser } = useAuth();

//   const handleOpenFollowing = () => {
//     if (!isPrivateProfile || (currentUser && user._id === currentUser._id)) {
//       setFollowingOpen(true);
//     }
//   };

//   const handleOpenFollowers = () => {
//     if (!isPrivateProfile || (currentUser && user._id === currentUser._id)) {
//       setFollowersOpen(true);
//     }
//   };

//   if (!user) {
//     return (
//       <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
//         <CircularProgress />
//       </Box>
//     );
//   }

//   const isCurrentUser = currentUser && user._id === currentUser._id;
//   const profileImageUrl = user.profileImage?.startsWith('http')
//     ? user.profileImage
//     : `${BACKEND_URL}${user.profileImage}`;

//   return (
//     <Grid container spacing={3} alignItems="center">
//       <Grid item xs={12} md={3} sx={{ display: 'flex', justifyContent: 'center' }}>
//         <Avatar
//           src={profileImageUrl}
//           alt={user.username}
//           sx={{
//             width: 150,
//             height: 150,
//             border: '3px solid white',
//             boxShadow: 3
//           }}
//         />
//       </Grid>

//       <Grid item xs={12} md={9}>
//         <Stack spacing={2}>
//           <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
//             <Typography variant="h4">{user.fullName}</Typography>

//             {isCurrentUser ? (
//               <>
//                 <Button
//                   variant="outlined"
//                   onClick={onEditClick}
//                   sx={{ textTransform: 'none', px: 3 }}
//                 >
//                   Edit Profile
//                 </Button>
//                 <IconButton
//                   onClick={() => setSettingsOpen(true)}
//                   sx={{ ml: 1 }}
//                   aria-label="settings"
//                 >
//                   <SettingsIcon />
//                 </IconButton>
//               </>
//             ) : (
//               <Button
//                 variant={user.isFollowing ? "outlined" : "contained"}
//                 sx={{ textTransform: 'none', px: 3 }}
//               >
//                 {user.isFollowing ? 'Following' : isPrivateProfile ? 'Follow Request' : 'Follow'}
//               </Button>
//             )}
//           </div>

//           <div style={{ display: 'flex', gap: 30 }}>
//             <Typography><strong>{user.postsCount}</strong> posts</Typography>
//             <Typography
//               sx={{ 
//                 cursor: (!isPrivateProfile || isCurrentUser) ? 'pointer' : 'default',
//                 color: (!isPrivateProfile || isCurrentUser) ? 'blue' : 'inherit'
//               }}
//               onClick={handleOpenFollowers}
//             >
//               <strong>{user.followersCount || user.followers?.length || 0}</strong> followers
//             </Typography>
//             <Typography
//               sx={{ 
//                 cursor: (!isPrivateProfile || isCurrentUser) ? 'pointer' : 'default',
//                 color: (!isPrivateProfile || isCurrentUser) ? 'blue' : 'inherit'
//               }}
//               onClick={handleOpenFollowing}
//             >
//               <strong>{user.followingCount || user.following?.length || 0}</strong> following
//             </Typography>
//           </div>

//           <div>
//             <Typography variant="subtitle1" fontWeight={600}>{user.username}</Typography>
//             <Typography variant="body2">{user.bio}</Typography>
//             {user.website && (
//               <Typography variant="body2" color="primary">
//                 <a href={user.website} target="_blank" rel="noopener noreferrer">
//                   {user.website}
//                 </a>
//               </Typography>
//             )}
//           </div>
//         </Stack>
        
//         <FollowingList
//           open={followingOpen}
//           onClose={() => setFollowingOpen(false)}
//           following={user.following || []}
//           setFollowing={setFollowing}
//         />

//         <FollowerList
//           open={followersOpen}
//           onClose={() => setFollowersOpen(false)}
//           followers={user.followers || []}
//         />
//       </Grid>

//       <Grid item xs={12}>
//         <Divider sx={{ my: 3 }} />
//       </Grid>

//       {isCurrentUser && (
//         <Dialog
//           open={settingsOpen}
//           onClose={() => setSettingsOpen(false)}
//           maxWidth="sm"
//           fullWidth
//         >
//           <Box sx={{ p: 3 }}>
//             <Settings />
//           </Box>
//         </Dialog>
//       )}
//     </Grid>
//   );
// };

// export default ProfileHeader;


// In ProfileHeader.js
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
  Dialog
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import Settings from './Settings';
import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';
import FollowingList from './FollowingList';
import FollowerList from './FollowerList';

const BACKEND_URL = 'https://192.168.2.250:3000';

const ProfileHeader = ({ user, onEditClick, isPrivateProfile = false }) => {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [followingOpen, setFollowingOpen] = useState(false);
  const [followersOpen, setFollowersOpen] = useState(false);
  const { user: currentUser } = useAuth();

  const handleOpenFollowing = () => {
    if (!isPrivateProfile || (currentUser && user._id === currentUser._id)) {
      setFollowingOpen(true);
    }
  };

  const handleOpenFollowers = () => {
    if (!isPrivateProfile || (currentUser && user._id === currentUser._id)) {
      setFollowersOpen(true);
    }
  };

  if (!user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  const isCurrentUser = currentUser && user._id === currentUser._id;
  const profileImageUrl = user.profileImage?.startsWith('http')
    ? user.profileImage
    : `${BACKEND_URL}${user.profileImage}`;

  return (
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
                variant={user.isFollowing ? "outlined" : "contained"}
                sx={{ textTransform: 'none', px: 3 }}
              >
                {user.isFollowing ? 'Following' : isPrivateProfile ? 'Follow Request' : 'Follow'}
              </Button>
            )}
          </div>

          <div style={{ display: 'flex', gap: 30 }}>
            <Typography><strong>{user.postsCount || 0}</strong> posts</Typography>
            <Typography
              sx={{ 
                cursor: (!isPrivateProfile || isCurrentUser) ? 'pointer' : 'default',
                color: (!isPrivateProfile || isCurrentUser) ? 'primary.main' : 'text.primary'
              }}
              onClick={handleOpenFollowers}
            >
              <strong>{user.followersCount || user.followers?.length || 0}</strong> followers
            </Typography>
            <Typography
              sx={{ 
                cursor: (!isPrivateProfile || isCurrentUser) ? 'pointer' : 'default',
                color: (!isPrivateProfile || isCurrentUser) ? 'primary.main' : 'text.primary'
              }}
              onClick={handleOpenFollowing}
            >
              <strong>{user.followingCount || user.following?.length || 0}</strong> following
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

        {(!isPrivateProfile || isCurrentUser) && (
          <>
            <FollowingList
              open={followingOpen}
              onClose={() => setFollowingOpen(false)}
              following={user.following || []}
            />
            <FollowerList
              open={followersOpen}
              onClose={() => setFollowersOpen(false)}
              followers={user.followers || []}
            />
          </>
        )}
      </Grid>

      <Grid item xs={12}>
        <Divider sx={{ my: 3 }} />
      </Grid>

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
    </Grid>
  );
};

export default ProfileHeader;