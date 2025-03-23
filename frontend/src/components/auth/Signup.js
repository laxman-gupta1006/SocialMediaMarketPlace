import React, { useState } from 'react';
import {
  TextField,
  Button,
  Grid,
  Container,
  Typography,
  Divider,
  Box,
} from '@mui/material';
import { Google } from '@mui/icons-material';
import Logo from '../Logo';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Signup = ({ onSignup }) => {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    fullName: '',
    password: ''
  });
  const [error, setError] = useState('');
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signup(formData);
    } catch (err) {
      setError(err.message || 'Signup failed. Please try again.');
    }
  };

  const handleGoogleSignup = () => {
    // Implement Google signup logic
    console.log('Google signup clicked');
  };

  return (
    <Container
      maxWidth="xs"
      sx={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Box
        sx={{
          width: '100%',
          textAlign: 'center',
          position: 'relative',
        }}
      >
        {/* App Logo */}
        <Logo />

        {/* Signup Form */}
        <Box
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 3,
            p: 4,
            backgroundColor: 'background.paper',
            boxShadow: 3,
          }}
        >
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  variant="outlined"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Username"
                  variant="outlined"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  required
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                />
              </Grid>
              <Grid item xs={12}>
    <TextField
      fullWidth
      label="Full Name"
      variant="outlined"
      value={formData.fullName}
      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
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
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
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
                    background: 'linear-gradient(45deg, #2563EB 30%, #4F46E5 90%)',
                  }}
                >
                  Create Account
                </Button>
              </Grid>
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Or sign up with
                  </Typography>
                </Divider>
              </Grid>
              <Grid item xs={12}>
                <Button
                  fullWidth
                  variant="outlined"
                  size="large"
                  startIcon={<Google />}
                  onClick={handleGoogleSignup}
                  sx={{
                    borderRadius: 1.5,
                    textTransform: 'none',
                    py: 1.5,
                    fontWeight: 600,
                  }}
                >
                  Continue with Google
                </Button>
              </Grid>
            </Grid>
          </form>
        </Box>

        {/* Login Link */}
        <Box sx={{ mt: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Already have an account?{' '}
            <Button
              color="primary"
              size="small"
              onClick={() => navigate('/login')}
              sx={{
                textTransform: 'none',
                fontWeight: 700,
                '&:hover': { background: 'none' },
              }}
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