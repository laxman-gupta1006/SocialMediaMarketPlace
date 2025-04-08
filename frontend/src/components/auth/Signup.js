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
  LinearProgress,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';
import { Google } from '@mui/icons-material';
import Logo from '../Logo';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const steps = ['Enter Details', 'Verify Email'];

const Signup = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    fullName: '',
    password: ''
  });
  const [otp, setOtp] = useState('');
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [loading, setLoading] = useState(false);
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

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await axios.post('/api/auth/send-otp', {
        email: formData.email
      });
      setSuccess('OTP sent successfully! Please check your email.');
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await axios.post('/api/auth/signup-with-otp', {
        ...formData,
        otp
      });
      setSuccess('Account created successfully!');
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setStep(1);
    setOtp('');
    setError('');
    setSuccess('');
  };

  const handleGoogleSignup = () => {
    console.log('Google signup clicked');
  };

  return (
    <Container maxWidth="xs" sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Box sx={{ width: '100%', textAlign: 'center', position: 'relative' }}>
        <Logo />
        <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, p: 4, backgroundColor: 'background.paper', boxShadow: 3 }}>
          <Stepper activeStep={step - 1} sx={{ mb: 3 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

          <form onSubmit={step === 1 ? handleSendOTP : handleVerifyOTP}>
            <Grid container spacing={2}>
              {step === 1 ? (
                <>
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
                    <LinearProgress
                      variant="determinate"
                      value={passwordStrength}
                      color={getPasswordStrengthColor()}
                      sx={{ mt: 1 }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button 
                      fullWidth 
                      type="submit" 
                      variant="contained" 
                      size="large" 
                      disabled={loading}
                      sx={{ borderRadius: 1.5, textTransform: 'none', py: 1.5, fontWeight: 600 }}
                    >
                      {loading ? 'Sending OTP...' : 'Send OTP'}
                    </Button>
                  </Grid>
                </>
              ) : (
                <>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Enter OTP"
                      variant="outlined"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Button
                        fullWidth
                        variant="outlined"
                        onClick={handleBack}
                        disabled={loading}
                        sx={{ borderRadius: 1.5, textTransform: 'none', py: 1.5, fontWeight: 600 }}
                      >
                        Back
                      </Button>
                      <Button
                        fullWidth
                        type="submit"
                        variant="contained"
                        disabled={loading}
                        sx={{ borderRadius: 1.5, textTransform: 'none', py: 1.5, fontWeight: 600 }}
                      >
                        {loading ? 'Verifying...' : 'Verify OTP & Create Account'}
                      </Button>
                    </Box>
                  </Grid>
                </>
              )}
            </Grid>
          </form>

          {step === 1 && (
            <>
              <Divider sx={{ my: 2 }}>
                <Typography variant="body2" color="text.secondary">Or sign up with</Typography>
              </Divider>
              <Button
                fullWidth
                variant="outlined"
                size="large"
                startIcon={<Google />}
                onClick={handleGoogleSignup}
                sx={{ borderRadius: 1.5, textTransform: 'none', py: 1.5, fontWeight: 600 }}
              >
                Continue with Google
              </Button>
            </>
          )}
        </Box>
        <Box sx={{ mt: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Already have an account?{' '}
            <Button
              color="primary"
              size="small"
              onClick={() => navigate('/login')}
              sx={{ textTransform: 'none', fontWeight: 700 }}
            >
              Log in
            </Button>
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};

export default Signup;
