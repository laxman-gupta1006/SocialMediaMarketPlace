import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline, ThemeProvider, createTheme, Box } from '@mui/material';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import MainPage from './pages/MainPage';
import ProfilePage from './pages/ProfilePage';
import Navigation from './components/Navigation';
import NewPostPage from './pages/NewPostPage';
import MessagesPage from './pages/MessagePage';
import SearchPage from './pages/SearchPage';
import MarketplacePage from './pages/MarketplacePage';
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

  const handleLogin = () => setIsAuthenticated(true);
  const handleLogout = () => setIsAuthenticated(false);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          pb: 7 // Matches navigation height
        }}>
          <Routes>
            <Route path="/login" element={
              isAuthenticated ? (
                <Navigate to="/" />
              ) : (
                <Login onLogin={handleLogin} />
              )
            } />
            <Route path="/signup" element={
              isAuthenticated ? (
                <Navigate to="/" />
              ) : (
                <Signup onSignup={handleLogin} />
              )
            } />
            <Route path="/" element={
              isAuthenticated ? (
                <>
                  <Box component="main" sx={{ flexGrow: 1, p: 2 }}>
                    <MainPage />
                  </Box>
                  <Navigation />
                </>
              ) : (
                <Navigate to="/login" />
              )
            } />
            <Route path="/profile" element={
              isAuthenticated ? (
                <>
                  <Box component="main" sx={{ flexGrow: 1, p: 2 }}>
                    <ProfilePage />
                  </Box>
                  <Navigation />
                </>
              ) : (
                <Navigate to="/login" />
              )
            } />
            <Route path="/new-post" element={
  isAuthenticated ? (
    <>
      <NewPostPage />
      <Navigation />
    </>
  ) : (
    <Navigate to="/login" />
  )
} />
<Route path="/messages" element={
  isAuthenticated ? (
    <>
      <MessagesPage />
      <Navigation />
    </>
  ) : (
    <Navigate to="/login" />
  )
} />
<Route path="/search" element={
  isAuthenticated ? (
    <>
      <SearchPage/>
      <Navigation/>
    </>
  ) : (
    <Navigate to="/login" />
  )
} />
<Route path="/marketplace" element={
  isAuthenticated ? (
    <>
      <MarketplacePage/>
      <Navigation/>
    </>
  ) : (
    <Navigate to="/login" />
  )
} />
          </Routes>
          
        </Box>
    </ThemeProvider>
  );
};

export default App;