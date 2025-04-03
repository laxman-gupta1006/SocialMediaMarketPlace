// App.js
import React from 'react';
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
import AdminRouter from './components/AdminPanel/AdminRouter';
import ProfilePageUser from './pages/UserProfilePage';
import { useAuth } from './context/AuthContext';
import Loading from './components/Loading';
import ChangePassword from './components/auth/ChangePassword'; // PascalCase

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

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }) => {
  const { user } = useAuth();
  return user?.role === 'admin' ? children : <Navigate to="/" replace />;
};

const App = () => {
  const { user, loading } = useAuth();

  if (loading) return <Loading />;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        pb: '72px'
      }}>

        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
          <Route path="/signup" element={user ? <Navigate to="/" /> : <Signup />} />
          <Route path="/ChangePassword" element={user ? <Navigate to="/" /> : <ChangePassword />} />
          

          {/* Protected User Routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <MainPage />
              <Navigation />
            </ProtectedRoute>
          } />
          <Route path="/profile/:userId" element={
            <ProtectedRoute>
              <ProfilePageUser />
              <Navigation />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <ProfilePage />
              <Navigation />
            </ProtectedRoute>
          } />

         



          <Route path="/new-post" element={
            <ProtectedRoute>
              <NewPostPage />
              <Navigation />
            </ProtectedRoute>
          } />

          <Route path="/messages" element={
            <ProtectedRoute>
              <MessagesPage />
              <Navigation />
            </ProtectedRoute>
          } />

          <Route path="/search" element={
            <ProtectedRoute>
              <SearchPage />
              <Navigation />
            </ProtectedRoute>
          } />

          <Route path="/marketplace" element={
            <ProtectedRoute>
              <MarketplacePage />
              <Navigation />
            </ProtectedRoute>
          } />

          {/* Admin Routes */}
          <Route path="/admin/*" element={
            <AdminRoute>
              <AdminRouter />
            </AdminRoute>
          } />

          {/* Fallback Route */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Box>
    </ThemeProvider>
  );
};

export default App;