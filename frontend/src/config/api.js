import axios from 'axios';

// ตรวจสอบ environment และกำหนด API URL ที่เหมาะสม
const getApiUrl = () => {
  const envApiUrl = import.meta.env.VITE_API_URL;
  const isProduction = import.meta.env.MODE === 'production';
  const isDocker = window.location.hostname === 'localhost' && window.location.port === '80';
  
  console.log('=== API Configuration ===');
  console.log('Environment:', import.meta.env.MODE);
  console.log('VITE_API_URL:', envApiUrl);
  console.log('Is Production:', isProduction);
  console.log('Is Docker:', isDocker);
  console.log('Current hostname:', window.location.hostname);
  console.log('Current port:', window.location.port);
  
  // ถ้าเป็น production และอยู่ใน Docker ให้ใช้ localhost:8000
  if (isProduction && isDocker) {
    console.log('Using localhost:8000 for Docker production');
    return 'http://localhost:8000';
  }
  
  // ถ้าเป็น development ให้ใช้ localhost:8000
  if (!isProduction) {
    console.log('Using localhost:8000 for development');
    return 'http://localhost:8000';
  }
  
  // กรณีอื่นๆ ใช้ค่าใน environment
  console.log('Using environment API URL:', envApiUrl);
  return envApiUrl || 'http://localhost:8000';
};

const API_URL = getApiUrl();

console.log(`Final API_URL: ${API_URL}`);

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
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
    console.log("Cookies:", document.cookie);
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
    console.log("Headers:", response.headers);
    console.log("=========================");

    return response;
  },
  async (error) => {
    console.error("=== API Error Interceptor ===");
    console.error("Error status:", error.response?.status);
    console.error("Error message:", error.message);
    console.error("Error config:", error.config);
    console.error("=============================");

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
          // แต่ตรวจสอบก่อนว่าไม่ได้อยู่ที่หน้า login อยู่แล้ว
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