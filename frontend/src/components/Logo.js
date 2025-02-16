import React from 'react';
import { 
  Typography, 
  Box,
  Avatar,
} from '@mui/material';
import { Group, } from '@mui/icons-material';

const Logo=()=>{
return(
<Box sx={{ 
          mb: 4,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1.5
        }}>
          <Avatar sx={{ 
            bgcolor: 'primary.main', 
            width: 48, 
            height: 48,
            boxShadow: 3
          }}>
            <Group sx={{ fontSize: 30, color: 'white' }} />
          </Avatar>
          <Typography variant="h3" sx={{
            background: 'linear-gradient(45deg, #2563EB 30%, #4F46E5 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 800,
            letterSpacing: '-1.5px',
            fontFamily: '"Helvetica Neue", Arial, sans-serif'
          }}>
            SocialSphere
          </Typography>
 </Box>)}

 export default Logo;