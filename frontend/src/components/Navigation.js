import React, { useState, useContext } from 'react';
import { BottomNavigation, BottomNavigationAction, Paper, styled } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // adjust import if path differs

const icons = {
  Home: ({ active }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M12 2L2 12H5V21H11V15H13V21H19V12H22L12 2Z" stroke={active ? "#2563EB" : "#64748B"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  Search: ({ active }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle cx="11" cy="11" r="8" stroke={active ? "#2563EB" : "#64748B"} strokeWidth="1.5"/>
      <path d="M21 21L16.65 16.65" stroke={active ? "#2563EB" : "#64748B"} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  Add: ({ active }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke={active ? "#2563EB" : "#64748B"} strokeWidth="1.5"/>
      <path d="M12 8V16M8 12H16" stroke={active ? "#2563EB" : "#64748B"} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  Chat: ({ active }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M21 15C21 15.5 20.8 16 20.4 16.4C20 16.8 19.5 17 19 17H7L3 21V5C3 4.5 3.2 4 3.6 3.6C4 3.2 4.5 3 5 3H19C19.5 3 20 3.2 20.4 3.6C20.8 4 21 4.5 21 5V15Z" stroke={active ? "#2563EB" : "#64748B"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  Market: ({ active }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M3 3H5L5.4 5M7 13H17L21 5H5.4M7 13L5.4 5M7 13L4 21H20M16 10H20" stroke={active ? "#2563EB" : "#64748B"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  Profile: ({ active }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="7" r="4" stroke={active ? "#2563EB" : "#64748B"} strokeWidth="1.5"/>
      <path d="M5 20C5 17.2 7.2 15 10 15H14C16.8 15 19 17.2 19 20" stroke={active ? "#2563EB" : "#64748B"} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
};

const StyledPaper = styled(Paper)({
  position: 'fixed',
  bottom: 0,
  left: 0,
  right: 0,
  backgroundColor: '#fff',
  borderTop: '1px solid rgba(0,0,0,0.1)',
  boxShadow: '0 -4px 20px rgba(0,0,0,0.06)',
  borderRadius: '24px 24px 0 0',
  zIndex: 1000,
});

const StyledAction = styled(BottomNavigationAction)(({ theme }) => ({
  minWidth: '64px',
  padding: '8px',
  borderRadius: '12px',
  transition: 'all 0.25s ease',
  '&.Mui-selected': {
    transform: 'translateY(-8px)',
    backgroundColor: 'rgba(37,99,235,0.1)',
    '& svg': {
      filter: 'drop-shadow(0px 4px 8px rgba(37,99,235,0.3))'
    }
  },
  '&:hover': {
    backgroundColor: 'rgba(226,232,240,0.5)'
  }
}));

const Navigation = () => {
  const location = useLocation();
  const [value, setValue] = useState(location.pathname);
  const { user } = useAuth();

  return (
    <StyledPaper elevation={3}>
      <BottomNavigation value={value} onChange={(_, val) => setValue(val)} showLabels={false}>
        <StyledAction component={Link} to="/" value="/" icon={<icons.Home active={value === '/'} />} />
        <StyledAction component={Link} to="/search" value="/search" icon={<icons.Search active={value === '/search'} />} />
        <StyledAction component={Link} to="/new-post" value="/new-post" icon={<icons.Add active={value === '/new-post'} />} />

        {user?.verification.adminVerified && (
          <>
            <StyledAction component={Link} to="/messages" value="/messages" icon={<icons.Chat active={value === '/messages'} />} />
            <StyledAction component={Link} to="/marketplace" value="/marketplace" icon={<icons.Market active={value === '/marketplace'} />} />
          </>
        )}

        <StyledAction component={Link} to="/profile" value="/profile" icon={<icons.Profile active={value === '/profile'} />} />
      </BottomNavigation>
    </StyledPaper>
  );
};

export default Navigation;
