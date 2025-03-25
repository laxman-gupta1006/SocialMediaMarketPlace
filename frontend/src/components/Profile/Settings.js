import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  Paper, 
  Switch, 
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const BACKEND_URL = 'https://192.168.2.250:3000';

const Settings = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profileVisibility, setProfileVisibility] = useState(user?.privacySettings?.profileVisibility || 'public');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);

  const handleVisibilityChange = async () => {
    const newVisibility = profileVisibility === 'public' ? 'private' : 'public';
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch(`${BACKEND_URL}/api/users/visibility`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ profileVisibility: newVisibility })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to update visibility');
      }

      setProfileVisibility(newVisibility);
    } catch (err) {
      console.error('Visibility update error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

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
        maxWidth: '600px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
      }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
          Account Settings
        </Typography>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 500 }}>
            Privacy Settings
          </Typography>
          
          <FormControlLabel
            control={
              <Switch
                checked={profileVisibility === 'private'}
                onChange={handleVisibilityChange}
                disabled={loading}
                color="primary"
              />
            }
            label={
              <Typography>
                {profileVisibility === 'private' ? 'Private Profile' : 'Public Profile'}
              </Typography>
            }
          />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {profileVisibility === 'private' 
              ? 'Only approved followers can see your posts' 
              : 'Anyone can see your posts'}
          </Typography>
          {error && (
            <Typography color="error" sx={{ mt: 1 }}>
              {error}
            </Typography>
          )}
        </Box>

        <Box sx={{ borderTop: '1px solid #e0e0e0', pt: 3 }}>
          <Button 
            variant="contained" 
            color="error"
            onClick={() => setLogoutConfirmOpen(true)}
            sx={{ width: '100%', py: 1.5 }}
          >
            Log Out
          </Button>
        </Box>

        {/* Logout confirmation dialog */}
        <Dialog
          open={logoutConfirmOpen}
          onClose={() => setLogoutConfirmOpen(false)}
        >
          <DialogTitle>Confirm Logout</DialogTitle>
          <DialogContent>
            <Typography>Are you sure you want to log out?</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setLogoutConfirmOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleLogout} 
              color="error"
              variant="contained"
            >
              Log Out
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Box>
  );
};

export default Settings;