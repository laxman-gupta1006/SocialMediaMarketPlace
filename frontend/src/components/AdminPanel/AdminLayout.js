// src/components/AdminPanel/AdminLayout.jsx
import React from 'react';
import { Box, CssBaseline, Divider, List, Toolbar } from '@mui/material';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';

const AdminLayout = () => {
  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AdminHeader />
      <AdminSidebar />
      
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar /> {/* For spacing below app bar */}
        <Outlet />
      </Box>
    </Box>
  );
};

export default AdminLayout;