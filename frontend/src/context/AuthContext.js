// frontend/context/AuthContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import config from '../Config/config';

const BACKEND_URL = config.BACKEND_URL;
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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


const login = async (formData = null) => {
  console.debug('[login] Login function called with data:', formData ? '(data provided)' : '(no data - post OTP)');
  try {
    // If no formData is provided, we're in the post-OTP verification flow
    if (!formData) {
      console.debug('[login] No form data provided, checking auth after OTP verification');
      const res = await fetch(`${BACKEND_URL}/api/auth/me`, {
        credentials: 'include'
      });
      
      if (!res.ok) {
        throw new Error('Failed to verify authentication after OTP');
      }
      
      const userData = await res.json();
      setUser(userData);
      console.debug('[login] OTP verification successful, user data fetched:', userData);
      navigate('/');
      return { success: true };
    }

    // Normal login flow with credentials
    console.debug('[login] Attempting login with credentials');
    const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
      credentials: 'include'
    });

    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.error || 'Login failed');
    }

    // If OTP is required, return the data without setting user or navigating
    if (res.status === 202) {
      console.debug('[login] OTP required, returning response data');
      return data;
    }

    // For successful non-OTP login, set user and navigate
    console.debug('[login] Login successful without OTP, checking auth status');
    await checkAuth();
    navigate('/');
    return data;
  } catch (error) {
    console.error('[login] Login failed:', error);
    if (!error.response) {
      setError({ code: 'BACKEND_DOWN', message: 'Server unavailable' });
    }
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
    <AuthContext.Provider value={{ error ,user, loading, login, signup, logout, checkAuth }}>
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