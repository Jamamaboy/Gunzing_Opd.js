import React, { createContext, useContext, useState, useEffect } from 'react';
import apiConfig from '../config/api';
import { api } from '../config/api';

const API_URL = apiConfig.baseUrl || '';

// สร้าง AuthContext
export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [initialCheckComplete, setInitialCheckComplete] = useState(false);

  // ตรวจสอบว่ามีการ authenticate แล้วหรือยัง
  const checkAuth = async () => {
    try {
      console.log("=== Authentication Check ===");
      
      // ตรวจสอบ CSRF token
      const csrfToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('csrf_token='))
        ?.split('=')[1];
      
      console.log("CSRF Token exists:", !!csrfToken);
      
      // ตรวจสอบ token กับ backend
      const response = await api.get('/api/auth/user');
      setUser(response.data);
      setIsAuthenticated(true);
      
      // เก็บข้อมูล user ใน localStorage
      const safeUserData = {
        user_id: response.data.user_id,
        firstname: response.data.firstname,
        lastname: response.data.lastname,
        email: response.data.email,
        role: response.data.role,
        title: response.data.title,
        lastAuthenticated: new Date().toISOString()
      };
      localStorage.setItem('user_data', JSON.stringify(safeUserData));
      
      return true;
    } catch (error) {
      console.error('Auth check error:', error);
      
      if (error.response?.status === 401) {
        // ลอง refresh token ก่อน
        try {
          console.log('Attempting to refresh token...');
          const refreshResponse = await api.post('/api/auth/refresh');
          if (refreshResponse.data.success) {
            console.log('Token refresh successful');
            
            // เก็บ CSRF token ใหม่
            if (refreshResponse.data.csrf_token) {
              document.cookie = `csrf_token=${refreshResponse.data.csrf_token}; path=/`;
              console.log('New CSRF token saved to cookie');
            }
            
            const userResponse = await api.get('/api/auth/user');
            setUser(userResponse.data);
            setIsAuthenticated(true);
            return true;
          }
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
        }
        
        // ถ้า refresh ไม่สำเร็จ ให้ logout
        logout();
      } else {
        handleOfflineMode();
      }
      return false;
    } finally {
      setLoading(false);
      setInitialCheckComplete(true);
    }
  };

  // จัดการกรณี offline mode โดยใช้ข้อมูลล่าสุดจาก localStorage
  const handleOfflineMode = () => {
    try {
      const userData = localStorage.getItem('user_data');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        
        // ตรวจสอบว่าข้อมูลไม่เก่าเกิน 7 วัน
        const lastAuth = new Date(parsedUser.lastAuthenticated);
        const now = new Date();
        const daysDiff = Math.floor((now - lastAuth) / (1000 * 60 * 60 * 24));
        
        if (daysDiff <= 7) {
          console.log("Using offline mode - valid cached user data");
          setUser(parsedUser);
          setIsAuthenticated(true);
        } else {
          console.log("Cached user data too old - clearing");
          logout();
        }
      } else {
        console.log("No cached user data available");
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      console.error('Error handling offline mode:', error);
      setIsAuthenticated(false);
      setUser(null);
    }
  };

  // Login function
  const login = async (email, password) => {
    setLoading(true);
    try {
      console.log("=== Login Attempt ===");
      console.log("Email:", email);
      console.log("API URL:", API_URL);
      
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);

      const response = await api.post('/api/auth/login', formData.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        }
      });

      console.log("Login response:", response.data);
      const data = response.data;
      setUser(data.user);
      setIsAuthenticated(true);
      
      // บันทึกข้อมูล user สำหรับใช้ offline
      const safeUserData = {
        ...data.user,
        lastAuthenticated: new Date().toISOString()
      };
      localStorage.setItem('user_data', JSON.stringify(safeUserData));
      
      // เก็บ CSRF token
      if (data.csrf_token) {
        document.cookie = `csrf_token=${data.csrf_token}; path=/`;
        console.log('CSRF token saved to cookie');
      }
      
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.response?.data?.detail || 'เกิดข้อผิดพลาดระหว่างการเข้าสู่ระบบ'
      };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    setLoading(true);
    try {
      await api.post('/api/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // ล้าง state และ localStorage แม้ว่า API call อาจล้มเหลว
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('user_data');
      // ลบ token ทั้งหมด
      localStorage.removeItem('access_token');
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      setLoading(false);
    }
  };

  useEffect(() => {
    // ตรวจสอบว่าอยู่ที่หน้า Login หรือไม่
    const isLoginPage = window.location.pathname === '/login';
    
    if (isLoginPage) {
      // ถ้าอยู่ที่หน้า login ไม่จำเป็นต้องเรียก checkAuth()
      // เพียงแค่ตั้งค่า initialCheckComplete เป็น true
      setLoading(false);
      setInitialCheckComplete(true);
    } else {
      // ถ้าไม่ได้อยู่ที่หน้า login ให้ตรวจสอบสถานะการ authentication ตามปกติ
      checkAuth();
    }
  }, []);

  // Context value
  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    checkAuth,
    initialCheckComplete
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook สำหรับใช้งาน AuthContext ได้ง่าย
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthProvider;