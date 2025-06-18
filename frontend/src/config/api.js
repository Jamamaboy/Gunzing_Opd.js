import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

console.log(`API_URL: ${API_URL}`);
console.log(`Environment: ${import.meta.env.MODE}`);

// สร้าง axios instance
export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // สำคัญ: ต้องตั้งค่าเป็น true เพื่อให้ส่ง cookies
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
    if (error.response?.status === 401) {
      try {
        // ลอง refresh token
        const refreshResponse = await api.post('/api/auth/refresh');
        
        if (refreshResponse.data.success) {
          // อัพเดท CSRF token ถ้ามี
          if (refreshResponse.data.csrf_token) {
            document.cookie = `csrf_token=${refreshResponse.data.csrf_token}; path=/`;
          }
          
          // ลองทำ request ใหม่
          const originalRequest = error.config;
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
        // ถ้า refresh ไม่สำเร็จ ให้ redirect ไปหน้า login
        window.location.href = '/login';
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