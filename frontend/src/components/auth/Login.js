import React, { useState } from 'react';
import { 
  TextField, 
  Button, 
  Grid, 
  Container, 
  Typography, 
  Divider,
  Box,
  Avatar,
  IconButton
} from '@mui/material';
import { Google, Group, Public } from '@mui/icons-material';
import Logo from '../Logo';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Login = ({ onLogin }) => {

  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(formData);
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    }
  };

  const handleGoogleLogin = () => {
    // Implement Google login logic
    console.log('Google login clicked');
  };

  return (
    <Container maxWidth="xs" sx={{ 
      height: '100vh', 
      display: 'flex', 
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <Box sx={{ 
        width: '100%',
        textAlign: 'center',
        position: 'relative'
      }}>
        {/* App Logo */}
        <Logo/>

        {/* Login Form */}
        <Box sx={{ 
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 3,
          p: 4,
          backgroundColor: 'background.paper',
          boxShadow: 3
        }}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Username or Email"
                  variant="outlined"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Password"
                  type="password"
                  variant="outlined"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                />
              </Grid>
              <Grid item xs={12}>
                <Button 
                  fullWidth 
                  type="submit" 
                  variant="contained" 
                  size="large"
                  sx={{ 
                    borderRadius: 1.5,
                    textTransform: 'none',
                    py: 1.5,
                    fontWeight: 600,
                    background: 'linear-gradient(45deg, #2563EB 30%, #4F46E5 90%)'
                  }}
                >
                  Continue to Sphere
                </Button>
              </Grid>
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }}>
                  <Typography variant="body2" color="text.secondary">Or connect with</Typography>
                </Divider>
              </Grid>
              <Grid item xs={12}>
                <Button 
                  fullWidth 
                  variant="outlined" 
                  size="large"
                  startIcon={<Google />}
                  onClick={handleGoogleLogin}
                  sx={{ 
                    borderRadius: 1.5,
                    textTransform: 'none',
                    py: 1.5,
                    fontWeight: 600
                  }}
                >
                  Continue with Google
                </Button>
              </Grid>
            </Grid>
          </form>
        </Box>

        {/* Signup Link */}
        <Box sx={{ mt: 3 }}>
          <Typography variant="body2" color="text.secondary">
            New to SocialSphere?{' '}
            <Button 
              color="primary" 
              size="small"
              onClick={() => navigate('/signup')}
              sx={{ 
                textTransform: 'none', 
                fontWeight: 700,
                '&:hover': { background: 'none' }
              }}
            >
              Create an account
            </Button>
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};

export default Login;