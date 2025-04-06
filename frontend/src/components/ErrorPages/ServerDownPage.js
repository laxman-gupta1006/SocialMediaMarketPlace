// components/errors/ServerDownPage.js
import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export const ServerDownPage = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ p: 4, textAlign: 'center', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <Typography variant="h3" gutterBottom>
        🔌 Oops! The Hamsters Took a Break 🔌
      </Typography>
      <Typography variant="h5" sx={{ mb: 3 }}>
        Our server hamsters are on strike. Probably unionizing.
      </Typography>
      <Button variant="contained" onClick={() => navigate(0)}>
        Reload Page (Cross Your Fingers)
      </Button>
    </Box>
  );
};