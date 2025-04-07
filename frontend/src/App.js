// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline, ThemeProvider, createTheme, Box, Typography } from '@mui/material';
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
import { useAuth } from './context/AuthContext';
import Loading from './components/Loading';
import ForgotPassword from './components/auth/ForgotPassword';
import { ServerDownPage } from './components/ErrorPages/ServerDownPage';
import { NotFoundPage } from './components/ErrorPages/NotFoundPage';
import { UnauthorizedPage } from './components/ErrorPages/UnauthorizedPage';

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

// ProtectedRoute ensures the user is logged in.
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
};

// AdminRoute ensures the user has admin role.
const AdminRoute = ({ children }) => {
  const { user } = useAuth();
  return user?.roles?.includes('admin') ? children : <UnauthorizedPage />;
};

// VerifiedRoute ensures the feature is only available for verified users.
// If not verified, a message is displayed instead.
const VerifiedRoute = ({ children }) => {
  const { user } = useAuth();
  return user?.verification?.adminVerified ? (
    children
  ) : (
    <Box sx={{ p: 2, textAlign: 'center' }}>
      <Typography variant="h6" color="error">
        Your account is not verified by an admin. This feature is restricted until your account is verified.
      </Typography>
    </Box>
  );
};

const App = () => {
  const { user, loading , error } = useAuth();

  if (loading) return <Loading />;

  if (error?.code === 'BACKEND_DOWN') {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <ServerDownPage />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', pb: '72px' }}>
        {/* Banner shown on top when user is not verified */}
        {user && !user.verification?.adminVerified && (
          <Box sx={{ backgroundColor: '#ff9800', p: 1, textAlign: 'center' }}>
            <Typography variant="body1" color="white">
              Your account is not verified by an admin. Chats and Marketplace are restricted.
            </Typography>
          </Box>
        )}

        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
          <Route path="/signup" element={user ? <Navigate to="/" /> : <Signup />} />
          <Route path="/forgot-password" element={user ? <Navigate to="/" /> : <ForgotPassword />} />

          {/* Admin Routes */}
          <Route
            path="/admin/*"
            element={
              <AdminRoute>
                <AdminRouter />
              </AdminRoute>
            }
          />
      <Route
            path="/profile/:userId?"
            element={
              <ProtectedRoute>
                <ProfilePage />
                <Navigation />
              </ProtectedRoute>
            }
          />
          {/* Protected User Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainPage />
                <Navigation />
              </ProtectedRoute>
            }
          />
    
          <Route
            path="/new-post"
            element={
              <ProtectedRoute>
                <NewPostPage />
                <Navigation />
              </ProtectedRoute>
            }
          />
          <Route
            path="/messages"
            element={
              <ProtectedRoute>
                <VerifiedRoute>
                  <MessagesPage />
                  <Navigation />
                </VerifiedRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/search"
            element={
              <ProtectedRoute>
                <SearchPage />
                <Navigation />
              </ProtectedRoute>
            }
          />
          <Route
            path="/marketplace"
            element={
              <ProtectedRoute>
                <VerifiedRoute>
                  <MarketplacePage />
                  <Navigation />
                </VerifiedRoute>
              </ProtectedRoute>
            }
          />
          <Route path="/error/server-down" element={<ServerDownPage />} />
          {/* Fallback Route */}
          {/* <Route path="*" element={<NotFoundPage />} /> */}
        </Routes>
      </Box>
    </ThemeProvider>
  );
};

export default App;
