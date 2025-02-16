// src/components/AdminPanel/AdminHeader.jsx
import React from 'react';
import { 
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Avatar,
  Stack,Box
} from '@mui/material';
import { Menu, Logout } from '@mui/icons-material';
import Logo from '../Logo';

const AdminHeader = () => {
  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        width: `calc(100% - 240px)`,
        ml: '240px',
        backgroundColor: 'background.paper',
        color: 'text.primary',
        boxShadow: 'none',
        borderBottom: '1px solid rgba(0, 0, 0, 0.12)'
      }}
    >
      <Toolbar>
        <IconButton edge="start" sx={{ mr: 2 }}>
          <Menu />
        </IconButton>
        
        <Box sx={{ flexGrow: 1 }}>
          <Logo sx={{ 
            transform: 'scale(0.7)',
            '& .MuiAvatar-root': { width: 40, height: 40 },
            '& .MuiTypography-h3': { fontSize: '1.5rem' }
          }} />
        </Box>

        <Stack direction="row" alignItems="center" spacing={2}>
          <Avatar sx={{ bgcolor: 'primary.main' }}>A</Avatar>
          <Typography variant="subtitle1">Admin</Typography>
          <IconButton>
            <Logout />
          </IconButton>
        </Stack>
      </Toolbar>
    </AppBar>
  );
};

export default AdminHeader;