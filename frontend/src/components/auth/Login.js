import React, { useState } from 'react';
import {
  TextField,
  Button,
  Grid,
  Container,
  Typography,
  Divider,
  Box,
  Alert
} from '@mui/material';
import { Google } from '@mui/icons-material';
import Logo from '../Logo';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';


const Login = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [maskedEmail, setMaskedEmail] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // Send login request to the backend
      const response = await fetch(`/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
  
      if (!response.ok) {
        // Here, error messages like "Account suspended" or "User is banned" are passed through
        throw new Error(data.error || 'Login failed');
      }
      
      // Check if 2FA is required
      if (data.otpRequired) {
        setStep(2);
        setMaskedEmail(data.email);
      } else {
        // If login is successful, your auth context login method should handle navigation
        await login();
      }
    } catch (err) {
      // Set the error message from the backend, including suspended/banned errors
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };
  

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`/api/auth/verify-2fa`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          otp
        }),
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Verification failed');
      }
      
      // After successful OTP verification, call login with no arguments
      await login();
      // No need to navigate here as login() will handle navigation
    } catch (err) {
      setError(err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
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
        <Logo />

        <Box sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 3,
          p: 4,
          backgroundColor: 'background.paper',
          boxShadow: 3
        }}>
          {step === 1 ? (
            <form onSubmit={handleLogin}>
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
                {error && (
                  <Grid item xs={12}>
                    <Alert severity="error">{error}</Alert>
                  </Grid>
                )}
                <Grid item xs={12}>
                  <Button
                    fullWidth
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={loading}
                    sx={{
                      borderRadius: 1.5,
                      textTransform: 'none',
                      py: 1.5,
                      fontWeight: 600,
                      background: 'linear-gradient(45deg, #2563EB 30%, #4F46E5 90%)'
                    }}
                  >
                    {loading ? 'Logging in...' : 'Continue to Sphere'}
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
          ) : (
            <form onSubmit={handleVerifyOTP}>
              <Typography variant="h6" gutterBottom>
                Two-Factor Authentication
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                We sent a verification code to {maskedEmail}
              </Typography>
              <TextField
                fullWidth
                label="Verification Code"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                disabled={loading}
              />
              {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{ mt: 2, borderRadius: 1.5 }}
              >
                {loading ? 'Verifying...' : 'Verify'}
              </Button>
              <Button
                fullWidth
                variant="text"
                onClick={() => setStep(1)}
                sx={{ mt: 1, textTransform: 'none' }}
              >
                Back to Login
              </Button>
            </form>
          )}
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

        {/* Forgot Password */}
        <Box sx={{ mt: 3 }}>
          <Typography variant="body2" color="text.secondary">
            <Button
              color="primary"
              size="small"
              onClick={() => navigate('/forgot-password')}
              sx={{
                textTransform: 'none',
                fontWeight: 700,
                '&:hover': { background: 'none' }
              }}
            >
              Forgot Password?
            </Button>
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};

export default Login;