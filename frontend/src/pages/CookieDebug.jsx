import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../config/api';

const CookieDebug = () => {
  const { user, isAuthenticated } = useAuth();
  const [cookies, setCookies] = useState([]);
  const [apiTest, setApiTest] = useState('');
  const [loginTest, setLoginTest] = useState(''); // ✅ เพิ่มสำหรับทดสอบ login
  const [authStatus, setAuthStatus] = useState('');

  useEffect(() => {
    // Parse cookies
    const parsedCookies = document.cookie.split('; ').map(cookie => {
      const [name, value] = cookie.split('=');
      return { name, value: value || 'empty' };
    });
    setCookies(parsedCookies);
  }, []);

  const testApiCall = async () => {
    try {
      const response = await api.get('/api/auth/user');
      setApiTest(`Success: ${response.data.email}`);
    } catch (error) {
      setApiTest(`Error: ${error.message}`);
    }
  };

  const clearAllCookies = () => {
    cookies.forEach(cookie => {
      document.cookie = `${cookie.name}=; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/`;
    });
    window.location.reload();
  };

  // ✅ เพิ่มการทดสอบ login
  const testLogin = async () => {
    try {
      const formData = new FormData();
      formData.append('username', 'user@example.com');
      formData.append('password', 'password123');

      console.log('Testing login...');
      const response = await api.post('/api/auth/login', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      
      console.log('Login response:', response.data);
      console.log('Response headers:', response.headers);
      
      setLoginTest(`Success: ${response.data.user.email}`);
      
      // รีเฟรชหน้าเพื่อดู cookies ใหม่
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
    } catch (error) {
      console.error('Login test error:', error);
      setLoginTest(`Error: ${error.message}`);
    }
  };

  // ✅ เพิ่มการทดสอบ refresh token
  const testRefreshToken = async () => {
    try {
      console.log('Testing refresh token...');
      const response = await api.post('/api/auth/refresh');
      console.log('Refresh response:', response.data);
      
      // รีเฟรชหน้าเพื่อดู cookies ใหม่
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
    } catch (error) {
      console.error('Refresh test error:', error);
      setApiTest(`Refresh Error: ${error.message}`);
    }
  };

  // ✅ เพิ่มการตรวจสอบ cookies แบบละเอียด
  const analyzeCookies = () => {
    console.log('=== Cookie Analysis ===');
    console.log('Raw cookie string:', document.cookie);
    
    const requiredCookies = ['access_token', 'csrf_token'];
    requiredCookies.forEach(cookieName => {
      const cookie = cookies.find(c => c.name === cookieName);
      console.log(`${cookieName}:`, cookie ? 'exists' : 'missing');
      if (cookie) {
        console.log(`  Value length: ${cookie.value.length}`);
        console.log(`  First 20 chars: ${cookie.value.substring(0, 20)}...`);
      }
    });
    
    console.log('=======================');
  };

  useEffect(() => {
    analyzeCookies();
  }, [cookies]);

  const testCurrentAuth = async () => {
    console.log("=== Testing Current Authentication ===");
    
    // ตรวจสอบ cookies
    const cookies = document.cookie.split('; ').reduce((acc, cookie) => {
      const [name, value] = cookie.split('=');
      acc[name] = value;
      return acc;
    }, {});
    
    console.log("Current cookies:", cookies);
    
    // ตรวจสอบ localStorage
    const userData = localStorage.getItem('user_data');
    console.log("User data in localStorage:", userData ? JSON.parse(userData) : null);
    
    // ทดสอบ API call
    try {
      const response = await api.get('/api/auth/user');
      console.log("✅ Auth check successful:", response.data);
      setAuthStatus("✅ Authenticated");
    } catch (error) {
      console.error("❌ Auth check failed:", error.response?.status, error.response?.data);
      setAuthStatus("❌ Not authenticated");
      
      // ถ้าเป็น 401 ให้ลอง refresh
      if (error.response?.status === 401) {
        console.log("Attempting token refresh...");
        try {
          const refreshResponse = await api.post('/api/auth/refresh');
          console.log("✅ Token refresh successful:", refreshResponse.data);
          
          // ลองเรียก user API อีกครั้ง
          const userResponse = await api.get('/api/auth/user');
          console.log("✅ User API call successful after refresh:", userResponse.data);
          setAuthStatus("✅ Authenticated (after refresh)");
        } catch (refreshError) {
          console.error("❌ Token refresh failed:", refreshError.response?.status, refreshError.response?.data);
          setAuthStatus("❌ Refresh failed");
        }
      }
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Cookie Debug Page</h1>
      
      <div className="grid gap-6">
        {/* Auth Status */}
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">Authentication Status</h2>
          <p>Is Authenticated: {isAuthenticated ? 'Yes' : 'No'}</p>
          <p>User: {user ? `${user.firstname} ${user.lastname}` : 'None'}</p>
          
          {/* ✅ เพิ่มสถานะของ cookies ที่จำเป็น */}
          <div className="mt-2 p-2 bg-white rounded">
            <p className="font-semibold">Required Cookies Status:</p>
            <p>Access Token: {cookies.find(c => c.name === 'access_token') ? '✅ Present' : '❌ Missing'}</p>
            <p>CSRF Token: {cookies.find(c => c.name === 'csrf_token') ? '✅ Present' : '❌ Missing'}</p>
          </div>
        </div>

        {/* Cookies Table - เหมือนเดิม */}
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">Current Cookies ({cookies.length})</h2>
          {cookies.length > 0 ? (
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border border-gray-300 p-2">Name</th>
                  <th className="border border-gray-300 p-2">Value</th>
                  <th className="border border-gray-300 p-2">Length</th>
                </tr>
              </thead>
              <tbody>
                {cookies.map((cookie, index) => (
                  <tr key={index}>
                    <td className="border border-gray-300 p-2 font-mono">{cookie.name}</td>
                    <td className="border border-gray-300 p-2 font-mono break-all">
                      {cookie.value.length > 50 ? 
                        `${cookie.value.substring(0, 50)}...` : 
                        cookie.value
                      }
                    </td>
                    <td className="border border-gray-300 p-2 text-center">{cookie.value.length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No cookies found</p>
          )}
        </div>

        {/* API Test */}
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">API Tests</h2>
          <div className="space-x-4 mb-4">
            <button 
              onClick={testApiCall}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Test /api/auth/user
            </button>
            <button 
              onClick={testLogin}
              className="bg-green-500 text-white px-4 py-2 rounded"
            >
              Test Login
            </button>
            <button 
              onClick={testRefreshToken}
              className="bg-yellow-500 text-white px-4 py-2 rounded"
            >
              Test Refresh Token
            </button>
            <button 
              onClick={clearAllCookies}
              className="bg-red-500 text-white px-4 py-2 rounded"
            >
              Clear All Cookies
            </button>
            <button 
              onClick={testCurrentAuth}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Test Current Auth
            </button>
          </div>
          
          {/* Results */}
          {apiTest && (
            <div className="mt-2 p-2 bg-white rounded">
              <p className="font-semibold">User API Test:</p>
              <pre className="text-sm">{apiTest}</pre>
            </div>
          )}
          
          {loginTest && (
            <div className="mt-2 p-2 bg-white rounded">
              <p className="font-semibold">Login Test:</p>
              <pre className="text-sm">{loginTest}</pre>
            </div>
          )}
        </div>

        <div className="mt-4 p-4 bg-gray-100 rounded">
          <h3 className="font-bold">Auth Status: {authStatus}</h3>
        </div>
      </div>
    </div>
  );
};

export default CookieDebug;