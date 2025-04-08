// App.js
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { 
  CssBaseline, 
  ThemeProvider, 
  createTheme, 
  Box, 
  Typography, 
  Button, 
  IconButton 
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
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
          borderTop: '1px solid rgba(0, 0, 0, 0.12)',
        },
      },
    },
  },
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
  const { user, loading, error } = useAuth();
  const [showBanner, setShowBanner] = useState(true);

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
        {/* Minimal, one-line closable banner shown on top when user is not verified */}
{/* Neumorphic Warning Banner */}
{user && !user.verification?.adminVerified && showBanner && (
  <Box
    sx={{
      width: '100%',
      px: 3,
      py: 2,
      background: 'linear-gradient(135deg, rgba(255, 0, 130, 0.1), rgba(0, 255, 255, 0.1))',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '16px',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      mt: 3,
      mx: 'auto',
      maxWidth: '90%',
    }}
  >
    <Typography 
      variant="body2" 
      color="text.primary" 
      sx={{ flex: 1, ml: 1, fontWeight: 500 }}
    >
      🚫 Access to <strong>Chats</strong> and <strong>Marketplace</strong> is restricted. Enable Two-Factor Authentication for better security.
    </Typography>

    <Button
      variant="contained"
      size="small"
      href="/profile"
      sx={{
        background: 'linear-gradient(135deg, #00FFA3, #DC1FFF)',
        color: '#fff',
        textTransform: 'none',
        mx: 2,
        borderRadius: '9999px',
        fontSize: '0.75rem',
        fontWeight: 'bold',
        boxShadow: '0 0 10px rgba(220, 31, 255, 0.4)',
        '&:hover': {
          background: 'linear-gradient(135deg, #00e695, #c51be6)',
        },
      }}
    >
      Profile Settings
    </Button>

    <IconButton 
      size="small" 
      onClick={() => setShowBanner(false)} 
      sx={{ color: '#888' }}
    >
      <CloseIcon fontSize="small" />
    </IconButton>
  </Box>
)}


{/* Neumorphic Admin Panel Button */}
{user?.roles?.includes('admin') && !window.location.href.includes('/admin') && (
  <Box sx={{ position: 'fixed', bottom: 80, right: 16, zIndex: 1100 }}>
    <Button
      variant="contained"
      component={Link}
      to="/admin"
      sx={{
        background: 'linear-gradient(135deg, #18FFFF, #2979FF)',
        color: '#fff',
        borderRadius: '9999px',
        textTransform: 'none',
        fontWeight: 'bold',
        px: 4,
        py: 1.5,
        boxShadow: '0 0 12px rgba(41,121,255,0.6)',
        transition: 'all 0.3s ease',
        '&:hover': {
          background: 'linear-gradient(135deg, #00e5ff, #1e88e5)',
          boxShadow: '0 0 20px rgba(41,121,255,0.8)',
        },
      }}
    >
      Admin Panel
    </Button>
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
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Box>
    </ThemeProvider>
  );
};

export default App;
