import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import config from '../../Config/config';
import RequestVerification from './RequestVerification';
import AdminNotes from './AdminNotes';
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
  DialogActions,
  Divider,
  Stack,
  Card,
  CardContent
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import LockIcon from '@mui/icons-material/Lock';
import LogoutIcon from '@mui/icons-material/Logout';

const BACKEND_URL = config.BACKEND_URL;

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
      backgroundColor: 'background.default',
      pt: 4
    }}>
      <Paper sx={{ 
        p: { xs: 2, sm: 4 },
        mb: 8,
        borderRadius: 4,
        width: '100%',
        maxWidth: '800px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.05)'
      }}>
        <Stack spacing={4}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
            <SettingsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Account Settings
          </Typography>

          <RequestVerification />
          <AdminNotes />

          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LockIcon fontSize="small" />
                Privacy & Security
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
                  <Box>
                    <Typography>Profile Visibility</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {profileVisibility === 'private' 
                        ? 'Your profile is currently private' 
                        : 'Your profile is currently public'}
                    </Typography>
                  </Box>
                }
                sx={{ alignItems: 'flex-start' }}
              />
            </CardContent>
          </Card>

          <Card variant="outlined" sx={{ borderColor: 'error.main' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LogoutIcon fontSize="small" />
                Session Management
              </Typography>
              <Button 
                variant="outlined" 
                color="error"
                onClick={() => setLogoutConfirmOpen(true)}
                fullWidth
                sx={{ py: 1.5 }}
              >
                Log Out All Sessions
              </Button>
            </CardContent>
          </Card>
        </Stack>

        {/* Logout confirmation dialog */}
        <Dialog
          open={logoutConfirmOpen}
          onClose={() => setLogoutConfirmOpen(false)}
          PaperProps={{ sx: { borderRadius: 4 } }}
        >
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LogoutIcon color="error" />
            Confirm Logout
          </DialogTitle>
          <DialogContent>
            <Typography>Are you sure you want to log out of all sessions?</Typography>
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => setLogoutConfirmOpen(false)}
              variant="text"
              sx={{ borderRadius: 2 }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleLogout} 
              color="error"
              variant="contained"
              sx={{ borderRadius: 2 }}
            >
              Confirm Logout
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Box>
  );
};

export default Settings;