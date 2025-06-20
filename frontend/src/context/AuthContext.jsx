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
      // ใช้ Axios instance แทน fetch API
      const response = await api.get('/api/auth/user');

      // Axios จะใส่ข้อมูลการตอบกลับใน response.data
      setUser(response.data);
      setIsAuthenticated(true);

      // เก็บข้อมูล user ใน localStorage สำหรับ offline mode (ไม่เก็บข้อมูลละเอียด)
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
      // ถ้า network error หรือ 401 error ลองใช้ข้อมูลจาก localStorage แทน
      handleOfflineMode();
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
          setUser(parsedUser);
          setIsAuthenticated(true);
        } else {
          // ล้างข้อมูลที่เก่าเกิน 7 วัน
          logout();
        }
      } else {
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
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);

      // ใช้ Axios instance แทน fetch API
      const response = await api.post('/api/auth/login', formData.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        }
      });

      // Axios จะใส่ข้อมูลการตอบกลับใน response.data
      const data = response.data;
      setUser(data.user);
      setIsAuthenticated(true);

      // บันทึกข้อมูล user สำหรับใช้ offline
      const safeUserData = {
        ...data.user,
        lastAuthenticated: new Date().toISOString()
      };
      localStorage.setItem('user_data', JSON.stringify(safeUserData));

      // เก็บ token ในที่เดียว
      if (data.access_token) {
        localStorage.setItem('access_token', data.access_token);
        // ลบ token เก่าที่อาจจะเหลืออยู่
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        console.log('Token saved to localStorage');
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
      // ใช้ Axios instance แทน fetch API
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

  // useEffect(() => {
  //   // ตรวจสอบว่าอยู่ที่หน้า Login หรือไม่
  //   const isLoginPage = window.location.pathname === '/login';

  //   if (isLoginPage) {
  //     // ถ้าอยู่ที่หน้า login ไม่จำเป็นต้องเรียก checkAuth()
  //     // เพียงแค่ตั้งค่า initialCheckComplete เป็น true
  //     setLoading(false);
  //     setInitialCheckComplete(true);
  //   } else {
  //     // ถ้าไม่ได้อยู่ที่หน้า login ให้ตรวจสอบสถานะการ authentication ตามปกติ
  //     checkAuth();
  //   }
  // }, []);

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
