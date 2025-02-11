import React, { useState } from 'react';
import { TextField, Button, Grid, Container, Typography } from '@mui/material';

const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(formData);
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
              Log In
            </Button>
          </Grid>
        </Grid>
      </form>
    </Container>
  );
};

export default Login;