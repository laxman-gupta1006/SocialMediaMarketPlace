import { Grid, Avatar, Typography, Button, Stack, Divider } from '@mui/material';

const ProfileHeader = ({ user, onEditClick }) => {
  return (
    <Grid container spacing={3} alignItems="center">
      <Grid item xs={12} md={3} sx={{ display: 'flex', justifyContent: 'center' }}>
        <Avatar 
          src={user.profileImage} 
          sx={{ width: 150, height: 150, border: '3px solid white', boxShadow: 3 }}
        />
      </Grid>
      
      <Grid item xs={12} md={9}>
        <Stack spacing={2}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <Typography variant="h4">{user.username}</Typography>
            <Button 
              variant="outlined" 
              onClick={onEditClick}
              sx={{ textTransform: 'none', px: 3 }}
            >
              Edit Profile
            </Button>
            <Button 
              variant="contained" 
              sx={{ textTransform: 'none', px: 3 }}
            >
              Follow
            </Button>
          </div>

          <div style={{ display: 'flex', gap: 30 }}>
            <Typography><strong>{user.postsCount}</strong> posts</Typography>
            <Typography><strong>{user.followers}</strong> followers</Typography>
            <Typography><strong>{user.following}</strong> following</Typography>
          </div>

          <div>
            <Typography variant="subtitle1" fontWeight={600}>{user.fullName}</Typography>
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
  );
};

export default ProfileHeader;