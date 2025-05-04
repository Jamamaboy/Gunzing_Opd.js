import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 0);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 640;

  const handleLogin = async () => {
    try {
      const res = await fetch('http://localhost:8000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('userId', data.id);
        localStorage.setItem('userRole', data.role);
        navigate('/home');
      } else {
        alert(data.detail || 'รหัสผ่านไม่ถูกต้อง');
      }
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
      console.error(err);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className={`w-full ${isMobile ? 'mx-4 p-4' : 'max-w-md p-8'} bg-white border border-[#800000] rounded-lg shadow-md`}>
        <h2 className={`mb-6 text-center ${isMobile ? 'text-xl' : 'text-2xl'} font-semibold text-gray-800`}>เข้าสู่ระบบ</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              รหัสประจำตัว
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 text-sm text-gray-700 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#800000]"
              placeholder="รหัสประจำตัว"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              รหัสผ่าน
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 text-sm text-gray-700 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#800000]"
              placeholder="รหัสผ่าน"
            />
          </div>
        </div>

        <button
          onClick={handleLogin}
          className="w-full px-4 py-3 mt-6 text-sm font-semibold text-white bg-[#800000] rounded-md hover:bg-red-700 focus:outline-none"
        >
          ลงชื่อเข้าใช้
        </button>
      </div>
    </div>
  );
};

export default Login;

