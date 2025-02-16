// src/components/AdminPanel/AdminSidebar.jsx
import React from 'react';
import { 
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Box
} from '@mui/material';
import { 
  Dashboard,
  People,
  PostAdd,
  Store,
  Settings,
  Timeline,
  Report
} from '@mui/icons-material';
import { NavLink } from 'react-router-dom';

const sidebarItems = [
  { text: 'Dashboard', icon: <Dashboard />, path: '/admin' },
  { text: 'Users', icon: <People />, path: '/admin/users' },
  { text: 'Content', icon: <PostAdd />, path: '/admin/content' },
  { text: 'Marketplace', icon: <Store />, path: '/admin/marketplace' },
  { text: 'Analytics', icon: <Timeline />, path: '/admin/analytics' },
  { text: 'Reports', icon: <Report />, path: '/admin/reports' },
  { text: 'Settings', icon: <Settings />, path: '/admin/settings' },
  { text: 'Notifications', icon: <Settings />, path: '/admin/notifications' },
  { text: 'Audit', icon: <Settings />, path: '/admin/audit' },
];

const AdminSidebar = () => {
  return (
    <Box sx={{ 
      width: 240, 
      flexShrink: 0,
      borderRight: '1px solid rgba(0, 0, 0, 0.12)',
      height: '100vh'
    }}>
      <List>
        {sidebarItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              component={NavLink}
              to={item.path}
              sx={{
                '&.active': {
                  backgroundColor: 'rgba(25, 118, 210, 0.08)',
                  borderRight: '3px solid #2563EB'
                }
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
    </Box>
  );
};

export default AdminSidebar;