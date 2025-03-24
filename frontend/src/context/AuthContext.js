// frontend/context/AuthContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();
const BACKEND_URL = 'https://192.168.2.250:3000' ; 

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  console.debug('[AuthProvider] Initializing', { user, loading });

  const checkAuth = async () => {
    console.debug('[checkAuth] Initiating auth check');
    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/me`, {
        credentials: 'include',
      });
      console.debug('[checkAuth] Response status:', res.status);
      
      const data = await res.json();
      console.debug('[checkAuth] Response data:', data);

      if (res.ok) {
        console.debug('[checkAuth] Authentication valid, setting user:', data);
        setUser(data);
      } else {
        console.debug('[checkAuth] No valid session, clearing user');
        setUser(null);
      }
    } catch (error) {
      console.error('[checkAuth] Auth check failed:', error);
      setUser(null);
    } finally {
      console.debug('[checkAuth] Auth check completed, setting loading false');
      setLoading(false);
    }
  };

  useEffect(() => {
    console.debug('[AuthProvider] Component mounted, checking auth');
    checkAuth();
  }, []);

// Update login function to handle immediate user state
const login = async (formData) => {
  try {
    const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
      credentials: 'include'
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error);
    }

    // Immediately check auth status after login
    const userRes = await fetch(`${BACKEND_URL}/api/auth/me`, {
      credentials: 'include'
    });
    const userData = await userRes.json();
    setUser(userData);
    navigate('/');
  } catch (error) {
    throw error;
  }
};

  const signup = async (formData) => {
    console.debug('[signup] Attempting signup with data:', {
      email: formData.email,
      username: formData.username,
      // Password intentionally omitted from logs
    });

    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        credentials: 'include',
      });

      console.debug('[signup] Signup response status:', res.status);

      if (!res.ok) {
        const error = await res.json();
        console.debug('[signup] Signup failed with server error:', error);
        throw new Error(error.error);
      }

      console.debug('[signup] Signup successful, checking auth status');
      await checkAuth();
      
      console.debug('[signup] Navigation to /');
      navigate('/');
    } catch (error) {
      console.error('[signup] Signup failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    console.debug('[logout] Initiating logout');
    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
      console.debug('[logout] Logout response status:', res.status);
    } catch (error) {
      console.error('[logout] Logout failed:', error);
    } finally {
      console.debug('[logout] Clearing user and redirecting to login');
      setUser(null);
      navigate('/login');
    }
  };

  console.debug('[AuthProvider] Render state:', { user, loading });

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout ,checkAuth }}>
      {!loading ? (
        <>
          {console.debug('[AuthProvider] Rendering children')}
          {children}
        </>
      ) : (
        console.debug('[AuthProvider] Still loading, not rendering children')
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  console.debug('[useAuth] Hook called, context:', context);
  return context;
};