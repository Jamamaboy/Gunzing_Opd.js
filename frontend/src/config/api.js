import axios from 'axios';

// ✅ อ่าน API URL จาก .env เท่านั้น
const API_URL = import.meta.env.VITE_API_URL;

console.log('=== API Configuration ===');
console.log('Environment:', import.meta.env.MODE);
console.log('VITE_API_URL:', import.meta.env.VITE_API_URL);
console.log('Final API_URL:', API_URL);
console.log('==========================');

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  timeout: 120000, // ✅ เพิ่ม timeout สำหรับยาเสพติด
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Debug information
    console.log("=== API Request Debug ===");
    console.log("URL:", config.url);
    console.log("Method:", config.method);
    console.log("Base URL:", config.baseURL);
    console.log("=========================");

    // เพิ่ม CSRF token ถ้ามี
    const csrfToken = document.cookie
      .split('; ')
      .find(row => row.startsWith('csrf_token='))
      ?.split('=')[1];

    if (csrfToken) {
      config.headers['X-CSRF-Token'] = csrfToken;
      console.log("CSRF Token added to headers");
    }

    return config;
  },
  (error) => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Debug information
    console.log("=== API Response Debug ===");
    console.log("Status:", response.status);
    console.log("Data keys:", Object.keys(response.data || {}));
    console.log("==========================");

    return response;
  },
  async (error) => {
    console.error("=== API Error Interceptor ===");
    console.error("Error status:", error.response?.status);
    console.error("Error message:", error.message);
    console.error("Error URL:", error.config?.url);
    console.error("==============================");

    if (error.response?.status === 401) {
      console.log("401 Unauthorized detected, attempting token refresh...");
      
      // ตรวจสอบว่าเป็น request ที่ไม่ใช่ refresh token เอง
      if (!error.config.url.includes('/auth/refresh')) {
        try {
          // ลอง refresh token
          const refreshResponse = await api.post('/api/auth/refresh');
          
          if (refreshResponse.data.success) {
            console.log("Token refresh successful, retrying original request");
            
            // อัพเดท CSRF token ถ้ามี
            if (refreshResponse.data.csrf_token) {
              document.cookie = `csrf_token=${refreshResponse.data.csrf_token}; path=/; samesite=lax`;
              console.log('New CSRF token saved to cookie');
            }
            
            // ลองทำ request ใหม่
            const originalRequest = error.config;
            
            // อัพเดท CSRF token ใน header ของ request ใหม่
            const newCsrfToken = document.cookie
              .split('; ')
              .find(row => row.startsWith('csrf_token='))
              ?.split('=')[1];
            
            if (newCsrfToken) {
              originalRequest.headers['X-CSRF-Token'] = newCsrfToken;
            }
            
            return api(originalRequest);
          }
        } catch (refreshError) {
          console.error("Token refresh failed:", refreshError);
          
          // ถ้า refresh ไม่สำเร็จ ให้ redirect ไปหน้า login
          if (!window.location.pathname.includes('/login')) {
            console.log("Redirecting to login page due to authentication failure");
            window.location.href = '/login';
          }
        }
      } else {
        console.log("Refresh token request failed, redirecting to login");
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

// ฟังก์ชันสำหรับดึง CSRF token
export const getCSRFToken = () => {
  return document.cookie
    .split('; ')
    .find(row => row.startsWith('csrf_token='))
    ?.split('=')[1];
};

// ฟังก์ชันสำหรับตรวจสอบว่าเป็นหน้า login หรือไม่
export const isLoginPage = () => {
  return window.location.pathname === '/login';
};

// ฟังก์ชันสำหรับตรวจสอบว่าเป็น HTTPS หรือไม่
export const isHttps = () => {
  return window.location.protocol === 'https:';
};

export const apiConfig = {
  baseUrl: API_URL,
  getUrl: (endpoint) => {
    const formattedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${API_URL}${formattedEndpoint}`;
  },
  headers: {
    'Content-Type': 'application/json',
  }
};

export default apiConfig;