// components/errors/UnauthorizedPage.js
import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export const UnauthorizedPage = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ p: 4, textAlign: 'center', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <Typography variant="h3" gutterBottom>
        🚫 Nice Try, Rebel 🚫
      </Typography>
      <Typography variant="h5" sx={{ mb: 3 }}>
        You thought you could sneak into the admin panel? Cute.
      </Typography>
      <Button variant="contained" onClick={() => navigate('/')}>
        Take Me Back to Safety
      </Button>
    </Box>
  );
};