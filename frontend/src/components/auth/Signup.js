import React, { useState } from 'react';
import { TextField, Button, Grid, Container, Typography, Link } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const Signup = ({ onSignup }) => {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSignup(formData);
  };

  return (
    <Container maxWidth="xs">
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2} sx={{ mt: 4 }}>
          <Grid item xs={12}>
            <Typography variant="h4" align="center">Instagram</Typography>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              variant="outlined"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <Button fullWidth type="submit" variant="contained" color="primary">
              Sign Up
            </Button>
          </Grid>
          <Grid item xs={12} textAlign="center">
            <Typography variant="body2">
              Already have an account? {' '}
              <Link component={RouterLink} to="/login">Log in</Link>
            </Typography>
          </Grid>
        </Grid>
      </form>
    </Container>
  );
};

export default Signup;