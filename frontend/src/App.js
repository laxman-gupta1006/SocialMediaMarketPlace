import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { CssBaseline, ThemeProvider, createTheme, Box, Button,Typography } from '@mui/material';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import MainPage from './pages/MainPage';
import ProfilePage from './pages/ProfilePage';
import Navigation from './components/Navigation';
import NewPostPage from './pages/NewPostPage';
import MessagesPage from './pages/MessagePage';
import SearchPage from './pages/SearchPage';
import MarketplacePage from './pages/MarketplacePage';
import AdminRouter from './components/AdminPanel/AdminRouter';

const theme = createTheme({
  components: {
    MuiBottomNavigation: {
      styleOverrides: {
        root: {
          height: 56,
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          borderTop: '1px solid rgba(0, 0, 0, 0.12)'
        }
      }
    }
  }
});

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Temporary admin access - remove this later
  const isAdmin = true; // Set to false to test non-admin access

  const handleLogin = () => setIsAuthenticated(true);
  const handleLogout = () => setIsAuthenticated(false);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        pb: '72px' // Matches navigation height
      }}>
        {/* Temporary admin link - remove in production */}
        {isAuthenticated && (
          <Box sx={{ position: 'fixed', top: 16, right: 16, zIndex: 9999 }}>
            <Button 
              variant="contained" 
              color="secondary" 
              component={Link}
              to="/admin"
            >
              Admin Panel (Dev)
            </Button>
          </Box>
        )}

        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={
            isAuthenticated ? <Navigate to="/" /> : <Login onLogin={handleLogin} />
          } />
          <Route path="/signin" element={
            isAuthenticated ? <Navigate to="/" /> : <Signup onSignup={handleLogin} />
          } />

          {/* Protected User Routes */}
          <Route path="/" element={
            isAuthenticated ? (
              <>
                <MainPage />
                <Navigation />
              </>
            ) : <Navigate to="/login" />
          } />
          
          <Route path="/profile" element={
            isAuthenticated ? (
              <>
                <ProfilePage />
                <Navigation />
              </>
            ) : <Navigate to="/login" />
          } />

          <Route path="/new-post" element={
            isAuthenticated ? (
              <>
                <NewPostPage />
                <Navigation />
              </>
            ) : <Navigate to="/login" />
          } />

          <Route path="/messages" element={
            isAuthenticated ? (
              <>
                <MessagesPage />
                <Navigation />
              </>
            ) : <Navigate to="/login" />
          } />

          <Route path="/search" element={
            isAuthenticated ? (
              <>
                <SearchPage />
                <Navigation />
              </>
            ) : <Navigate to="/login" />
          } />

          <Route path="/marketplace" element={
            isAuthenticated ? (
              <>
                <MarketplacePage />
                <Navigation />
              </>
            ) : <Navigate to="/login" />
          } />

          {/* Admin Routes - Temporary access */}
          <Route path="/admin/*" element={
            isAuthenticated && isAdmin ? (
              <AdminRouter />
            ) : (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h4">Admin Access Required</Typography>
                <Button 
                  variant="contained" 
                  sx={{ mt: 2 }}
                  component={Link}
                  to="/"
                >
                  Return to Home
                </Button>
              </Box>
            )
          } />

          {/* Fallback Route */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Box>
    </ThemeProvider>
  );
};

export default App;