import axios from 'axios';

// const API_URL = "https://backend.ashyisland-0d4cc8a1.australiaeast.azurecontainerapps.io";
const API_URL = "http://localhost:8080";

// ตรวจสอบว่ากำลังทำงานบน HTTPS หรือไม่
export const isHttps = () => {
  if (typeof window !== 'undefined') {
    return window.location.protocol === 'https:';
  }
  return import.meta.env.VITE_USE_HTTPS === 'true' || import.meta.env.PROD;
};

// สร้าง axios instance เริ่มต้น
const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
});

// เพิ่ม request interceptor เพื่อใส่ token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ตัวแปรเพื่อป้องกัน race condition เมื่อหลาย request พยายาม refresh token พร้อมกัน
let isRefreshing = false;
let failedQueue = [];

// ฟังก์ชันสำหรับดำเนินการกับ request ที่ล้มเหลวหลังจาก refresh token สำเร็จหรือล้มเหลว
const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// ดึง CSRF token จาก cookie
const getCSRFToken = () => {
  return document.cookie
    .split('; ')
    .find(row => row.startsWith('csrf_token='))
    ?.split('=')[1] || '';
};

// ตรวจสอบว่าอยู่ในหน้า login หรือไม่
const isLoginPage = () => {
  return window.location.pathname === '/login';
};

// Response interceptor สำหรับการจัดการ token หมดอายุ
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // ถ้าเป็นข้อผิดพลาด 401 (Unauthorized) และยังไม่ได้พยายาม refresh และไม่ได้อยู่ที่หน้า login
    if (error.response?.status === 401 && !originalRequest._retry && !isLoginPage()) {
      if (isRefreshing) {
        // ถ้ากำลัง refresh token อยู่แล้ว ให้รอและลองใหม่
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            originalRequest.headers['Authorization'] = `Bearer ${localStorage.getItem('access_token')}`;
            return axiosInstance(originalRequest);
          })
          .catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // เรียก API endpoint เพื่อ refresh token
        const response = await axios.post(
          `${API_URL}/api/auth/refresh`,
          {},
          { withCredentials: true }
        );

        if (response.data?.access_token) {
          // เก็บ token ใหม่
          localStorage.setItem('access_token', response.data.access_token);

          // แจ้งให้ request ที่ล้มเหลวทั้งหมดทราบว่า refresh สำเร็จแล้ว
          processQueue(null, response.data.access_token);

          // เพิ่ม token ให้กับ request ต้นฉบับและส่งใหม่
          originalRequest.headers['Authorization'] = `Bearer ${response.data.access_token}`;
          return axiosInstance(originalRequest);
        } else {
          // Refresh token ล้มเหลว ทำการ redirect ไปยังหน้า login
          processQueue(new Error('Refresh token failed'));
          // ถ้าไม่ได้อยู่ที่หน้า login แล้ว redirect ไป login
          if (!isLoginPage()) {
            window.location.href = '/login';
          }
          return Promise.reject(error);
        }
      } catch (refreshError) {
        // จัดการข้อผิดพลาดในการ refresh token
        processQueue(refreshError);

        // นำผู้ใช้ไปยังหน้า login ถ้า refresh token ไม่สามารถใช้งานได้
        // แต่ต้องตรวจสอบว่าไม่ได้อยู่ที่หน้า login อยู่แล้ว
        if (!isLoginPage()) {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

// Request interceptor เพื่อเพิ่ม CSRF token ให้กับ request (สำหรับการเปลี่ยนแปลงข้อมูล)
axiosInstance.interceptors.request.use(
  (config) => {
    // เพิ่ม CSRF token สำหรับ methods ที่เปลี่ยนแปลงข้อมูล
    if (['post', 'put', 'delete', 'patch'].includes(config.method?.toLowerCase())) {
      // เติม CSRF token จาก cookie
      const csrfToken = getCSRFToken();
      if (csrfToken) {
        config.headers['X-CSRF-Token'] = csrfToken;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

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

export const api = axiosInstance;

export default apiConfig;
