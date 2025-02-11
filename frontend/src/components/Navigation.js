import React, { useState } from 'react';
import { BottomNavigation, BottomNavigationAction, Paper, styled } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';

// Custom SVG Icons for premium look
const icons = {
  Home: ({ active }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 2L2 12H5V21H11V15H13V21H19V12H22L12 2Z"
        stroke={active ? "#2563EB" : "#64748B"}
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  Search: ({ active }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle
        cx="11"
        cy="11"
        r="8"
        stroke={active ? "#2563EB" : "#64748B"}
        strokeWidth="1.5"
        fill="none"
      />
      <path
        d="M21 21L16.65 16.65"
        stroke={active ? "#2563EB" : "#64748B"}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  ),
  Add: ({ active }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke={active ? "#2563EB" : "#64748B"}
        strokeWidth="1.5"
        fill="none"
      />
      <path
        d="M12 8V16M8 12H16"
        stroke={active ? "#2563EB" : "#64748B"}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  ),
  Chat: ({ active }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path
        d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z"
        stroke={active ? "#2563EB" : "#64748B"}
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  Market: ({ active }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path
        d="M3 3H5L5.4 5M7 13H17L21 5H5.4M7 13L5.4 5M7 13L4 21H20M16 10H20"
        stroke={active ? "#2563EB" : "#64748B"}
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  Profile: ({ active }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle
        cx="12"
        cy="7"
        r="4"
        stroke={active ? "#2563EB" : "#64748B"}
        strokeWidth="1.5"
        fill="none"
      />
      <path
        d="M5 20C5 17.2386 7.23858 15 10 15H14C16.7614 15 19 17.2386 19 20"
        stroke={active ? "#2563EB" : "#64748B"}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
};

const StyledBottomNavigation = styled(BottomNavigation)({
  backgroundColor: 'transparent',
  height: '72px',
  padding: '0 16px',
});

const StyledBottomNavigationAction = styled(BottomNavigationAction)(({ theme }) => ({
  minWidth: '64px',
  padding: '8px',
  borderRadius: '12px',
  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  '&.Mui-selected': {
    transform: 'translateY(-8px)',
    '& svg': {
      filter: 'drop-shadow(0 4px 8px rgba(37, 99, 235, 0.2))'
    }
  },
  '&:hover': {
    backgroundColor: 'rgba(241, 245, 249, 0.5)'
  }
}));

const Navigation = () => {
  const location = useLocation();
  const [value, setValue] = useState(location.pathname);

  return (
    <Paper sx={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      backdropFilter: 'blur(20px)',
      backgroundColor: 'rgba(255, 255, 255, 0.9)', // Milky white with transparency
      borderTop: '1px solid rgba(255, 255, 255, 0.3)', // Subtle top border
      boxShadow: '0 -4px 24px rgba(0, 0, 0, 0.06)', // Soft shadow
      borderRadius: '24px 24px 0 0',
      zIndex: 1000
    }}>
      <BottomNavigation
        value={value}
        onChange={(_, newValue) => setValue(newValue)}
        sx={{
          backgroundColor: 'transparent !important',
          height: '72px',
          padding: '0 24px',
          '& .MuiBottomNavigationAction-root': {
            minWidth: '64px',
            borderRadius: '12px',
            transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            '&.Mui-selected': {
              transform: 'translateY(-8px)',
              '& svg': {
                filter: 'drop-shadow(0 4px 8px rgba(37, 99, 235, 0.15))'
              }
            },
            '&:hover': {
              backgroundColor: 'rgba(241, 245, 249, 0.4)'
            }
          }
        }}
      >
        <BottomNavigationAction
          component={Link}
          to="/"
          value="/"
          icon={<icons.Home active={value === '/'} />}
        />
        <BottomNavigationAction
          component={Link}
          to="/search"
          value="/search"
          icon={<icons.Search active={value === '/search'} />}
        />
        <BottomNavigationAction
          component={Link}
          to="/new-post"
          value="/new-post"
          icon={<icons.Add active={value === '/new-post'} />}
        />
        <BottomNavigationAction
          component={Link}
          to="/messages"
          value="/messages"
          icon={<icons.Chat active={value === '/messages'} />}
        />
        <BottomNavigationAction
          component={Link}
          to="/marketplace"
          value="/marketplace"
          icon={<icons.Market active={value === '/marketplace'} />}
        />
        <BottomNavigationAction
          component={Link}
          to="/profile"
          value="/profile"
          icon={<icons.Profile active={value === '/profile'} />}
        />
      </BottomNavigation>
    </Paper>
  );
};

export default Navigation;