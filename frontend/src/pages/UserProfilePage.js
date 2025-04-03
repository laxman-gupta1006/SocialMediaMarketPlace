// import React, { useState, useEffect } from 'react';
// import { useParams } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';
// import { Paper, Grid, Typography, Box, Button, CircularProgress } from '@mui/material';
// import config from '../Config/config';

// const BACKEND_URL = config.BACKEND_URL;

// const UserProfilePage = () => {
//   const { userId } = useParams();
//   const { user: currentUser } = useAuth();
//   const [profileData, setProfileData] = useState(null);
//   const [posts, setPosts] = useState([]);
//   const [isFollowing, setIsFollowing] = useState(false);
//   const [isPrivate, setIsPrivate] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchProfile = async () => {
//       try {
//         const res = await fetch(`${BACKEND_URL}/api/users/user/${userId}`, {
//           credentials: 'include',
//         });
        
//         if (!res.ok) {
//           const errorData = await res.json();
//           throw new Error(errorData.error || 'Failed to fetch profile');
//         }

//         const data = await res.json();
//         setProfileData(data);
//         setIsFollowing(data.isFollowing);
        
//         if (data.posts) {
//           setPosts(data.posts);
//           setIsPrivate(false);
//         } else {
//           setIsPrivate(true);
//         }
//       } catch (err) {
//         setError(err.message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchProfile();
//   }, [userId]);

//   const handleFollow = async () => {
//     try {
//       const res = await fetch(`${BACKEND_URL}/api/users/follow/${userId}`, {
//         method: 'PUT',
//         credentials: 'include',
//       });

//       if (!res.ok) throw new Error('Follow action failed');
      
//       // Update follow status and refresh data
//       setIsFollowing(!isFollowing);
//       if (isPrivate) {
//         const refreshedRes = await fetch(`${BACKEND_URL}/api/users/user/${userId}`);
//         const refreshedData = await refreshedRes.json();
//         setPosts(refreshedData.posts || []);
//         setIsPrivate(!refreshedData.posts);
//       }
//     } catch (err) {
//       console.error('Follow error:', err);
//     }
//   };

//   if (loading) {
//     return (
//       <Box sx={{ display: 'flex', justifyContent: 'center', pt: 4 }}>
//         <CircularProgress />
//       </Box>
//     );
//   }

//   if (error) {
//     return (
//       <Box sx={{ display: 'flex', justifyContent: 'center', pt: 4 }}>
//         <Typography color="error">{error}</Typography>
//       </Box>
//     );
//   }

//   if (!profileData) return null;

//   const isCurrentUser = currentUser?._id === userId;

//   return (
//     <Box sx={{
//       display: 'flex',
//       justifyContent: 'center',
//       minHeight: '100vh',
//       backgroundColor: '#fafafa',
//       pt: 4
//     }}>
//       <Paper sx={{ 
//         p: { xs: 2, sm: 4 },
//         mb: 8,
//         borderRadius: 4,
//         width: '100%',
//         maxWidth: '935px',
//         boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
//         overflow: 'hidden'
//       }}>
//         {/* Profile Header */}
//         <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
//           <Box sx={{ mr: 4 }}>
//             <img
//               src={profileData.profileImage || '/default-profile.png'}
//               alt="Profile"
//               style={{
//                 width: '150px',
//                 height: '150px',
//                 borderRadius: '50%',
//                 objectFit: 'cover'
//               }}
//             />
//           </Box>
          
//           <Box sx={{ flexGrow: 1 }}>
//             <Typography variant="h4" sx={{ mb: 2 }}>
//               {profileData.username}
//             </Typography>
            
//             <Box sx={{ display: 'flex', gap: 3, mb: 2 }}>
//               <Typography><strong>{profileData.postsCount}</strong> posts</Typography>
//               <Typography><strong>{profileData.followersCount}</strong> followers</Typography>
//               <Typography><strong>{profileData.followingCount}</strong> following</Typography>
//             </Box>

//             {!isCurrentUser && (
//               <Box sx={{ display: 'flex', gap: 2 }}>
//                 {isFollowing ? (
//                   <>
//                     <Button 
//                       variant="contained"
//                       onClick={handleFollow}
//                       sx={{ textTransform: 'none' }}
//                     >
//                       Following
//                     </Button>
//                     <Button 
//                       variant="outlined"
//                       sx={{ textTransform: 'none' }}
//                     >
//                       Message
//                     </Button>
//                   </>
//                 ) : (
//                   <Button 
//                     variant="contained"
//                     onClick={handleFollow}
//                     sx={{ textTransform: 'none' }}
//                   >
//                     {isPrivate ? 'Follow Request' : 'Follow'}
//                   </Button>
//                 )}
//               </Box>
//             )}
//           </Box>
//         </Box>

//         {/* Bio Section */}
//         <Box sx={{ mb: 4 }}>
//           <Typography variant="h6">{profileData.fullName}</Typography>
//           <Typography variant="body2" sx={{ color: 'text.secondary' }}>
//             {profileData.bio}
//           </Typography>
//         </Box>

//         {/* Content Area */}
//         {isPrivate && !isFollowing ? (
//           <Box sx={{ 
//             textAlign: 'center', 
//             py: 4,
//             border: '1px solid #ddd',
//             borderRadius: 2
//           }}>
//             <Typography variant="h6">
//               This account is private. Follow to see their posts.
//             </Typography>
//           </Box>
//         ) : (
//           <Grid container spacing={2}>
//             {posts.map(post => (
//               <Grid item xs={12} sm={6} md={4} key={post._id}>
//                 <Box sx={{
//                   position: 'relative',
//                   paddingTop: '100%', // 1:1 aspect ratio
//                   borderRadius: 2,
//                   overflow: 'hidden'
//                 }}>
//                   <img
//                     src={post.imageUrl}
//                     alt="Post"
//                     style={{
//                       position: 'absolute',
//                       top: 0,
//                       left: 0,
//                       width: '100%',
//                       height: '100%',
//                       objectFit: 'cover'
//                     }}
//                   />
//                 </Box>
//               </Grid>
//             ))}
//           </Grid>
//         )}
//       </Paper>
//     </Box>
//   );
// };

// export default UserProfilePage;


// // import React, { useState, useEffect } from 'react';
// // import { useParams } from 'react-router-dom';
// // import { useAuth } from '../context/AuthContext';
// // import { Paper, Grid, Typography, Box, CircularProgress } from '@mui/material';
// // import ProfileHeader from '../components/Profile/ProfileHeader';
// // import ProfilePost from '../components/Profile/ProfilePost';
// // import config from '../Config/config';

// // const BACKEND_URL = config.BACKEND_URL;

// // const UserProfilePage = () => {
// //   const { userId } = useParams();
// //   const { user: currentUser } = useAuth();
// //   const [profileData, setProfileData] = useState(null);
// //   const [posts, setPosts] = useState([]);
// //   const [isFollowing, setIsFollowing] = useState(false);
// //   const [isPrivate, setIsPrivate] = useState(false);
// //   const [loading, setLoading] = useState(true);
// //   const [error, setError] = useState(null);

// //   useEffect(() => {
// //     const fetchProfile = async () => {
// //       try {
// //         const res = await fetch(`${BACKEND_URL}/api/users/user/${userId}`, {
// //           credentials: 'include',
// //         });
        
// //         if (!res.ok) {
// //           const errorData = await res.json();
// //           throw new Error(errorData.error || 'Failed to fetch profile');
// //         }

// //         const data = await res.json();
// //         setProfileData(data);
// //         setIsFollowing(data.isFollowing);
        
// //         if (data.posts) {
// //           setPosts(data.posts);
// //           setIsPrivate(false);
// //         } else {
// //           setIsPrivate(true);
// //         }
// //       } catch (err) {
// //         setError(err.message);
// //       } finally {
// //         setLoading(false);
// //       }
// //     };

// //     fetchProfile();
// //   }, [userId]);

// //   const handleFollow = async () => {
// //     try {
// //       const res = await fetch(`${BACKEND_URL}/api/users/follow/${userId}`, {
// //         method: 'PUT',
// //         credentials: 'include',
// //       });

// //       if (!res.ok) throw new Error('Follow action failed');
      
// //       setIsFollowing(!isFollowing);
// //       if (isPrivate) {
// //         const refreshedRes = await fetch(`${BACKEND_URL}/api/users/user/${userId}`);
// //         const refreshedData = await refreshedRes.json();
// //         setPosts(refreshedData.posts || []);
// //         setIsPrivate(!refreshedData.posts);
// //       }
// //     } catch (err) {
// //       console.error('Follow error:', err);
// //     }
// //   };

// //   if (loading) {
// //     return (
// //       <Box sx={{ display: 'flex', justifyContent: 'center', pt: 4 }}>
// //         <CircularProgress />
// //       </Box>
// //     );
// //   }

// //   if (error) {
// //     return (
// //       <Box sx={{ display: 'flex', justifyContent: 'center', pt: 4 }}>
// //         <Typography color="error">{error}</Typography>
// //       </Box>
// //     );
// //   }

// //   if (!profileData) return null;

// //   const isCurrentUser = currentUser?._id === userId;

// //   return (
// //     <Box sx={{
// //       display: 'flex',
// //       justifyContent: 'center',
// //       minHeight: '100vh',
// //       backgroundColor: '#fafafa',
// //       pt: 4
// //     }}>
// //       <Paper sx={{ 
// //         p: { xs: 2, sm: 4 },
// //         mb: 8,
// //         borderRadius: 4,
// //         width: '100%',
// //         maxWidth: '935px',
// //         boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
// //         overflow: 'hidden'
// //       }}>
// //         <ProfileHeader 
// //           user={profileData}
// //           isCurrentUser={isCurrentUser}
// //           isFollowing={isFollowing}
// //           onFollowClick={handleFollow}
// //           showPrivateActions={!isCurrentUser}
// //         />

// //         {isPrivate && !isFollowing ? (
// //           <Box sx={{ 
// //             textAlign: 'center', 
// //             py: 4,
// //             border: '1px solid #ddd',
// //             borderRadius: 2,
// //             mt: 4
// //           }}>
// //             <Typography variant="h6">
// //               This account is private. Follow to see their posts.
// //             </Typography>
// //           </Box>
// //         ) : (
// //           <>
// //             <Typography variant="h6" sx={{ 
// //               mb: 3, 
// //               textAlign: 'center',
// //               fontWeight: 600,
// //               color: 'text.secondary',
// //               letterSpacing: '0.5px'
// //             }}>
// //               Posts
// //             </Typography>

// //             <Grid container spacing={2} justifyContent="center">
// //               {posts.map(post => (
// //                 <Grid item xs={12} sm={6} md={4} key={post._id} sx={{
// //                   maxWidth: '293px',
// //                   minWidth: '293px',
// //                   height: '293px',
// //                   position: 'relative'
// //                 }}>
// //                   <ProfilePost post={post} />
// //                 </Grid>
// //               ))}
// //             </Grid>
// //           </>
// //         )}
// //       </Paper>
// //     </Box>
// //   );
// // };

// // export default UserProfilePage;


// import React, { useState, useEffect } from 'react';
// import { useParams } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';
// import { Paper, Grid, Typography, Box, CircularProgress } from '@mui/material';
// import ProfileHeader from '../components/Profile/ProfileHeader';
// import ProfilePost from '../components/Profile/ProfilePost';
// import config from '../Config/config';

// const BACKEND_URL = config.BACKEND_URL;

// const UserProfilePage = () => {
//   const { userId } = useParams();
//   const { user: currentUser } = useAuth();
//   const [profileData, setProfileData] = useState(null);
//   const [posts, setPosts] = useState([]);
//   const [isFollowing, setIsFollowing] = useState(false);
//   const [isPrivate, setIsPrivate] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [editOpen, setEditOpen] = useState(false);

//   useEffect(() => {
//     const fetchProfile = async () => {
//       try {
//         const res = await fetch(`${BACKEND_URL}/api/users/user/${userId}`, {
//           credentials: 'include',
//         });
        
//         if (!res.ok) {
//           const errorData = await res.json();
//           throw new Error(errorData.error || 'Failed to fetch profile');
//         }

//         const data = await res.json();
//         setProfileData(data);
//         setIsFollowing(data.isFollowing);
        
//         if (data.posts) {
//           setPosts(data.posts);
//           setIsPrivate(false);
//         } else {
//           setIsPrivate(true);
//         }
//       } catch (err) {
//         setError(err.message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchProfile();
//   }, [userId]);

//   const handleFollow = async () => {
//     try {
//       const res = await fetch(`${BACKEND_URL}/api/users/follow/${userId}`, {
//         method: 'PUT',
//         credentials: 'include',
//       });

//       if (!res.ok) throw new Error('Follow action failed');
      
//       setIsFollowing(!isFollowing);
//       if (isPrivate) {
//         const refreshedRes = await fetch(`${BACKEND_URL}/api/users/user/${userId}`);
//         const refreshedData = await refreshedRes.json();
//         setPosts(refreshedData.posts || []);
//         setIsPrivate(!refreshedData.posts);
//       }
//     } catch (err) {
//       console.error('Follow error:', err);
//     }
//   };

//   if (loading) {
//     return (
//       <Box sx={{ display: 'flex', justifyContent: 'center', pt: 4 }}>
//         <CircularProgress />
//       </Box>
//     );
//   }

//   if (error) {
//     return (
//       <Box sx={{ display: 'flex', justifyContent: 'center', pt: 4 }}>
//         <Typography color="error">{error}</Typography>
//       </Box>
//     );
//   }

//   if (!profileData) return null;

//   const isCurrentUser = currentUser?._id === userId;

//   return (
//     <Box sx={{
//       display: 'flex',
//       justifyContent: 'center',
//       minHeight: '100vh',
//       backgroundColor: '#fafafa',
//       pt: 4
//     }}>
//       <Paper sx={{ 
//         p: { xs: 2, sm: 4 },
//         mb: 8,
//         borderRadius: 4,
//         width: '100%',
//         maxWidth: '935px',
//         boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
//         overflow: 'hidden'
//       }}>
//         <ProfileHeader 
//           user={{
//             ...profileData,
//             followers: profileData.followers || [],
//             following: profileData.following || [],
//             postsCount: posts.length
//           }}
//           onEditClick={() => setEditOpen(true)}
//         />

//         {isPrivate && !isFollowing && !isCurrentUser ? (
//           <Box sx={{ 
//             textAlign: 'center', 
//             py: 4,
//             border: '1px solid #ddd',
//             borderRadius: 2,
//             mt: 4
//           }}>
//             <Typography variant="h6">
//               This account is private. Follow to see their posts.
//             </Typography>
//           </Box>
//         ) : (
//           <>
//             <Typography variant="h6" sx={{ 
//               mb: 3, 
//               textAlign: 'center',
//               fontWeight: 600,
//               color: 'text.secondary',
//               letterSpacing: '0.5px'
//             }}>
//               Posts
//             </Typography>

//             {posts.length === 0 ? (
//               <Box sx={{ textAlign: 'center', py: 4 }}>
//                 <Typography>No posts yet</Typography>
//               </Box>
//             ) : (
//               <Grid container spacing={2} justifyContent="center">
//                 {posts.map(post => (
//                   <Grid item xs={12} sm={6} md={4} key={post._id} sx={{
//                     maxWidth: '293px',
//                     minWidth: '293px',
//                     height: '293px',
//                     position: 'relative'
//                   }}>
//                     <ProfilePost post={post} />
//                   </Grid>
//                 ))}
//               </Grid>
//             )}
//           </>
//         )}
//       </Paper>
//     </Box>
//   );
// };

// export default UserProfilePage;


// UserProfilePage.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Paper, Grid, Typography, Box, CircularProgress } from '@mui/material';
import ProfileHeader from '../components/Profile/ProfileHeader';
import ProfilePost from '../components/Profile/ProfilePost';
import config from '../Config/config';

const BACKEND_URL = config.BACKEND_URL;

const UserProfilePage = () => {
  const { userId } = useParams();
  const { user: currentUser } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/users/user/${userId}`, {
          credentials: 'include',
        });
        
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Failed to fetch profile');
        }

        const data = await res.json();
        setProfileData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', pt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', pt: 4 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (!profileData) return null;

  const isCurrentUser = currentUser?._id === userId;
  const showPrivateMessage = profileData.isPrivate && !isCurrentUser && !profileData.isFollowing;

  return (
    <Box sx={{
      display: 'flex',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#fafafa',
      pt: 4
    }}>
      <Paper sx={{ 
        p: { xs: 2, sm: 4 },
        mb: 8,
        borderRadius: 4,
        width: '100%',
        maxWidth: '935px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden'
      }}>
        <ProfileHeader 
          user={profileData}
          isPrivateProfile={profileData.isPrivate}
          isCurrentUser={isCurrentUser}
        />

        {showPrivateMessage ? (
          <Box sx={{ 
            textAlign: 'center', 
            py: 4,
            border: '1px solid #ddd',
            borderRadius: 2,
            mt: 4
          }}>
            <Typography variant="h6">
              This account is private. Follow to see their posts.
            </Typography>
          </Box>
        ) : (
          <>
            <Typography variant="h6" sx={{ 
              mb: 3, 
              textAlign: 'center',
              fontWeight: 600,
              color: 'text.secondary',
              letterSpacing: '0.5px'
            }}>
              Posts
            </Typography>

            {profileData.posts?.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography>No posts yet</Typography>
              </Box>
            ) : (
              <Grid container spacing={2} justifyContent="center">
                {profileData.posts?.map(post => (
                  <Grid item xs={12} sm={6} md={4} key={post._id} sx={{
                    maxWidth: '293px',
                    minWidth: '293px',
                    height: '293px',
                    position: 'relative'
                  }}>
                    <ProfilePost post={post} />
                  </Grid>
                ))}
              </Grid>
            )}
          </>
        )}
      </Paper>
    </Box>
  );
};

export default UserProfilePage;