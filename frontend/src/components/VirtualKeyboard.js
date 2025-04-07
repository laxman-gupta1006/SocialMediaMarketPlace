import React, { useMemo } from 'react';
import { Box, Button, Grid } from '@mui/material';

// Keys to shuffle
const numberKeys = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
const fixedKeys = ['Clear', 'Backspace'];

// Shuffle utility function
const shuffleArray = (array) => {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const VirtualKeyboard = ({ onKeyPress }) => {
  const shuffledNumbers = useMemo(() => shuffleArray(numberKeys), []);
  const allKeys = [...shuffledNumbers, ...fixedKeys];

  return (
    <Box sx={{ mt: 2 }}>
      <Grid container spacing={1}>
        {allKeys.map((key) => (
          <Grid item xs={4} key={key}>
            <Button
              variant="outlined"
              fullWidth
              onClick={() => onKeyPress(key)}
            >
              {key}
            </Button>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default VirtualKeyboard;
