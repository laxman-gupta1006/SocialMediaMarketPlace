// components/errors/NotFoundPage.js
import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ p: 4, textAlign: 'center', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <Typography variant="h3" gutterBottom>
        🌌 Lost in the Void? 🌌
      </Typography>
      <Typography variant="h5" sx={{ mb: 3 }}>
        Congratulations! You've found a page that doesn't exist.
      </Typography>
      <Button variant="contained" onClick={() => navigate('/')}>
        Beam Me Back Home
      </Button>
    </Box>
  );
};