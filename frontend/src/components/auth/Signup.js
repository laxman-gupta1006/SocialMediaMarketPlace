import React, { useState } from 'react';
import {
  TextField,
  Button,
  Grid,
  Container,
  Typography,
  Divider,
  Box,
  Alert,
  LinearProgress
} from '@mui/material';
import { Google } from '@mui/icons-material';
import Logo from '../Logo';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Signup = () => {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    fullName: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    let tempErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const strongPasswordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
    
    if (!formData.email || !emailRegex.test(formData.email)) {
      tempErrors.email = 'Enter a valid email address';
    }
    if (!formData.username || formData.username.length < 6) {
      tempErrors.username = 'Username must be at least 6 characters long';
    }
    if (!formData.fullName.trim()) {
      tempErrors.fullName = 'Full name is required';
    }
    if (!formData.password || formData.password.length < 6) {
      tempErrors.password = 'Password must be at least 6 characters long';
    } else if (!strongPasswordRegex.test(formData.password)) {
      tempErrors.password = 'Password must contain an uppercase letter, a number, and a special character';
    }
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 6) strength += 20;
    if (/[A-Z]/.test(password)) strength += 20;
    if (/[0-9]/.test(password)) strength += 20;
    if (/[@$!%*?&]/.test(password)) strength += 20;
    if (password.length >= 10) strength += 20;
    setPasswordStrength(strength);
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 40) return 'error';
    if (passwordStrength < 80) return 'warning';
    return 'success';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      await signup(formData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Signup failed. Please try again.');
    }
  };

  const handleGoogleSignup = () => {
    console.log('Google signup clicked');
  };

  return (
    <Container maxWidth="xs" sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Box sx={{ width: '100%', textAlign: 'center', position: 'relative' }}>
        <Logo />
        <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, p: 4, backgroundColor: 'background.paper', boxShadow: 3 }}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  variant="outlined"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  error={!!errors.email}
                  helperText={errors.email}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Username"
                  variant="outlined"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  error={!!errors.username}
                  helperText={errors.username}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Full Name"
                  variant="outlined"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  error={!!errors.fullName}
                  helperText={errors.fullName}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Password"
                  type="password"
                  variant="outlined"
                  value={formData.password}
                  onChange={(e) => {
                    setFormData({ ...formData, password: e.target.value });
                    calculatePasswordStrength(e.target.value);
                  }}
                  error={!!errors.password}
                  helperText={errors.password}
                  required
                />
                <LinearProgress variant="determinate" value={passwordStrength} color={getPasswordStrengthColor()} sx={{ mt: 1 }} />
              </Grid>
              <Grid item xs={12}>
                <Button fullWidth type="submit" variant="contained" size="large" sx={{ borderRadius: 1.5, textTransform: 'none', py: 1.5, fontWeight: 600 }}>Create Account</Button>
              </Grid>
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }}><Typography variant="body2" color="text.secondary">Or sign up with</Typography></Divider>
              </Grid>
              <Grid item xs={12}>
                <Button fullWidth variant="outlined" size="large" startIcon={<Google />} onClick={handleGoogleSignup} sx={{ borderRadius: 1.5, textTransform: 'none', py: 1.5, fontWeight: 600 }}>Continue with Google</Button>
              </Grid>
            </Grid>
          </form>
        </Box>
        <Box sx={{ mt: 3 }}>
          <Typography variant="body2" color="text.secondary">Already have an account? <Button color="primary" size="small" onClick={() => navigate('/login')} sx={{ textTransform: 'none', fontWeight: 700 }}>
            Log in
          </Button></Typography>
        </Box>
      </Box>
    </Container>
  );
};

export default Signup;
