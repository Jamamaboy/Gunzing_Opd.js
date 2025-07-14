import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../config/api';

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [initialCheckComplete, setInitialCheckComplete] = useState(false);

  const checkAuth = async () => {
    try {
      console.log("=== Authentication Check ===");
      
      const csrfToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('csrf_token='))
        ?.split('=')[1];
      
      const accessToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('access_token='))
        ?.split('=')[1];
      
      console.log("CSRF Token exists:", !!csrfToken);
      console.log("Access Token exists:", !!accessToken);
      
      // ✅ ถ้าไม่มี token ให้ลอง offline mode ก่อน
      if (!accessToken && !csrfToken) {
        console.log("No tokens found, trying offline mode");
        return handleOfflineMode();
      }
      
      // ✅ ถ้ามี access token ให้ลองเรียก API
      if (accessToken) {
        try {
          const response = await api.get('/api/auth/user');
          setUser(response.data);
          setIsAuthenticated(true);
          
          const safeUserData = {
            user_id: response.data.user_id,
            firstname: response.data.firstname,
            lastname: response.data.lastname,
            email: response.data.email,
            role: response.data.role,
            title: response.data.title,
            department: response.data.department,
            lastAuthenticated: new Date().toISOString()
          };
          localStorage.setItem('user_data', JSON.stringify(safeUserData));
          
          console.log("Authentication successful:", response.data);
          return true;
        } catch (error) {
          console.error('User API failed, trying refresh...');
          // Fall through to refresh logic
        }
      }
      
      // ✅ ลอง refresh token
      if (!accessToken && csrfToken) {
        console.log("Trying to refresh token...");
        try {
          const refreshResponse = await api.post('/api/auth/refresh');
          
          if (refreshResponse.data.success) {
            console.log("Token refresh successful");
            const userResponse = await api.get('/api/auth/user');
            setUser(userResponse.data);
            setIsAuthenticated(true);
            
            const safeUserData = {
              user_id: userResponse.data.user_id,
              firstname: userResponse.data.firstname,
              lastname: userResponse.data.lastname,
              email: userResponse.data.email,
              role: userResponse.data.role,
              title: userResponse.data.title,
              department: userResponse.data.department,
              lastAuthenticated: new Date().toISOString()
            };
            localStorage.setItem('user_data', JSON.stringify(safeUserData));
            
            return true;
          }
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          return handleOfflineMode();
        }
      }
      
    } catch (error) {
      console.error('Auth check error:', error);
      return handleOfflineMode();
    } finally {
      setLoading(false);
      setInitialCheckComplete(true);
    }
  };

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

  const login = async (email, password) => {
    setLoading(true);
    try {
      console.log("=== Login Attempt ===");
      console.log("Email:", email);
      
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
        console.log('CSRF token set in cookie:', document.cookie);
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

  // ✅ เพิ่มฟังก์ชัน debug cookies
  const debugCookies = () => {
    console.log("=== Cookie Debug ===");
    console.log("All cookies:", document.cookie);
    console.log("Parsed cookies:");
    
    document.cookie.split('; ').forEach(cookie => {
      const [name, value] = cookie.split('=');
      console.log(`  ${name}: ${value ? 'exists' : 'empty'}`);
    });
    
    console.log("==================");
  };

  // เรียกใช้ debug เมื่อ component mount
  useEffect(() => {
    debugCookies(); // ✅ เพิ่มบรรทัดนี้
    
    // ตรวจสอบว่าอยู่ที่หน้า Login หรือไม่
    const isLoginPage = window.location.pathname === '/login';
    
    if (isLoginPage) {
      setLoading(false);
      setInitialCheckComplete(true);
    } else {
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