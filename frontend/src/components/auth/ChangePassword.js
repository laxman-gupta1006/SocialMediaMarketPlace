import React, { useState, useEffect } from 'react';
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
  StepLabel,
  Link
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import Logo from '../Logo';

const steps = ['Verify Identity', 'Set New Password'];

const ChangePassword = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [otp, setOtp] = useState('');
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Automatically determine if user is authenticated
    setIsForgotPassword(!currentUser);
  }, [currentUser]);

  const validateStep1 = () => {
    let tempErrors = {};
    const strongPasswordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;

    if (isForgotPassword) {
      if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        tempErrors.email = 'Valid email is required';
      }
    } else {
      if (!formData.currentPassword) {
        tempErrors.currentPassword = 'Current password is required';
      }
    }

    if (!formData.newPassword || formData.newPassword.length < 6) {
      tempErrors.newPassword = 'Password must be at least 6 characters';
    } else if (!strongPasswordRegex.test(formData.newPassword)) {
      tempErrors.newPassword = 'Must include uppercase, number, and special character';
    }
    if (formData.newPassword !== formData.confirmPassword) {
      tempErrors.confirmPassword = 'Passwords do not match';
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
  const handleInitiatePasswordChange = async (e) => {
    e.preventDefault();
    if (!validateStep1()) return;
  
    setLoading(true);
    setError('');
    setSuccess('');
  
    try {
      const endpoint = isForgotPassword 
        ? '/api/auth/initiate-password-reset'
        : '/api/auth/change-password';
  
      const method = isForgotPassword ? 'post' : 'put';
      const payload = isForgotPassword
        ? { email: formData.email }
        : { 
            currentPassword: formData.currentPassword,
            newPassword: formData.newPassword 
          };
  
      const config = currentUser ? { 
        headers: { Authorization: `Bearer ${currentUser.token}` } 
      } : {};
  
      await axios[method](endpoint, payload, config);
      
      if(isForgotPassword) {
        setSuccess(`OTP sent to ${formData.email}`);
        setStep(2);
      } else {
        setSuccess('Password changed successfully!');
        setTimeout(() => navigate('/profile'), 2000);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Request failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleConfirmPasswordChange = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
  
    try {
      const { data } = await axios.post('/api/auth/confirm-password-reset', {
        email: formData.email,
        otp,
        newPassword: formData.newPassword
      });
  
      setSuccess('Password reset successfully! Redirecting...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid OTP or server error');
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

          <Typography variant="h5" sx={{ mb: 2 }}>
            {isForgotPassword ? 'Reset Password' : 'Change Password'}
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

          <form onSubmit={step === 1 ? handleInitiatePasswordChange : handleConfirmPasswordChange}>
            <Grid container spacing={2}>
              {step === 1 ? (
                <>
                  {isForgotPassword && (
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
                  )}

                  {!isForgotPassword && (
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Current Password"
                        type="password"
                        variant="outlined"
                        value={formData.currentPassword}
                        onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                        error={!!errors.currentPassword}
                        helperText={errors.currentPassword}
                        required
                      />
                    </Grid>
                  )}

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="New Password"
                      type="password"
                      variant="outlined"
                      value={formData.newPassword}
                      onChange={(e) => {
                        setFormData({ ...formData, newPassword: e.target.value });
                        calculatePasswordStrength(e.target.value);
                      }}
                      error={!!errors.newPassword}
                      helperText={errors.newPassword}
                      required
                    />
                    <LinearProgress variant="determinate" value={passwordStrength} color={getPasswordStrengthColor()} sx={{ mt: 1 }} />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Confirm New Password"
                      type="password"
                      variant="outlined"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      error={!!errors.confirmPassword}
                      helperText={errors.confirmPassword}
                      required
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
                      {loading ? 'Sending Verification...' : 'Continue'}
                    </Button>
                  </Grid>

                  {!isForgotPassword && (
                    <Grid item xs={12}>
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        <Link onClick={() => setIsForgotPassword(true)} sx={{ cursor: 'pointer' }}>
                          Forgot Password?
                        </Link>
                      </Typography>
                    </Grid>
                  )}
                </>
              ) : (
                <>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Enter Verification Code"
                      variant="outlined"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      required
                    />
                    <Typography variant="caption" color="text.secondary">
                      Check your {isForgotPassword ? 'email' : 'registered email/phone'} for the verification code
                    </Typography>
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
                        {loading ? 'Updating...' : 'Update Password'}
                      </Button>
                    </Box>
                  </Grid>

                  {isForgotPassword && (
                    <Grid item xs={12}>
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        Remember your password?{' '}
                        <Link onClick={() => navigate('/login')} sx={{ cursor: 'pointer' }}>
                          Login here
                        </Link>
                      </Typography>
                    </Grid>
                  )}
                </>
              )}
            </Grid>
          </form>
        </Box>
      </Box>
    </Container>
  );
};

export default ChangePassword;