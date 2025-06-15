import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AuthGuard = ({ children }) => {
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();
  const token = localStorage.getItem('access_token');

  useEffect(() => {
    // ตรวจสอบ authentication state
    if (!isAuthenticated || !user || !token) {
      console.log('AuthGuard: Not authenticated, redirecting to login');
    }
  }, [isAuthenticated, user, token]);

  if (!isAuthenticated || !user || !token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default AuthGuard;