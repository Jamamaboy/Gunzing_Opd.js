import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useDevice } from '../context/DeviceContext';

const Login = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, initialCheckComplete } = useAuth();
  const { isMobile } = useDevice();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // ถ้าผู้ใช้ authenticated แล้ว ให้ redirect ไปหน้า home
  useEffect(() => {
    if (initialCheckComplete && isAuthenticated) {
      navigate('/home');
    }
  }, [isAuthenticated, initialCheckComplete, navigate]);
  
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const result = await login(email, password);
      
      if (result.success) {
        // การ navigate ไม่จำเป็น เพราะ useEffect hook จะจัดการให้
        // แต่อาจต้องการความเร็วในการตอบสนอง การมี navigate ไว้จึงยังมีประโยชน์
        navigate('/home');
      } else {
        setError(result.error);
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('เข้าสู่ระบบไม่สำเร็จ โปรดลองอีกครั้ง');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      {isMobile ? (
        // Mobile Layout
        <div className="w-full p-4 mx-4 bg-white border border-[#800000] rounded-lg shadow-md">
          <h2 className="mb-6 text-xl font-semibold text-center text-gray-800">เข้าสู่ระบบ</h2>
          
          {error && (
            <div className="p-2 mb-4 text-sm text-center text-white bg-red-500 rounded-md">
              {error}
            </div>
          )}
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700" htmlFor="email-mobile">
                อีเมล
              </label>
              <input
                id="email-mobile"
                type="email"
                className="w-full px-3 py-2 text-sm text-gray-700 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#800000]"
                placeholder="อีเมล"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700" htmlFor="password-mobile">
                รหัสผ่าน
              </label>
              <input
                id="password-mobile"
                type="password"
                className="w-full px-3 py-2 text-sm text-gray-700 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#800000]"
                placeholder="รหัสผ่าน"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          
            <button 
              type="submit"
              className="w-full px-4 py-3 mt-6 text-sm font-semibold text-white bg-[#800000] rounded-md hover:bg-red-700 focus:outline-none"
              disabled={loading}
            >
              {loading ? 'กำลังเข้าสู่ระบบ...' : 'ลงชื่อเข้าใช้'}
            </button>
          </form>
          <div className="flex flex-col items-left mt-4 text-sm text-blue-800">
            <a href="#" className="hover:underline">ลืมรหัสผ่าน ?</a>
          </div>
        </div>
      ) : (
        // Desktop Layout
        <div className="w-full max-w-md p-8 bg-white border border-[#800000] rounded-lg shadow-lg">
          <h2 className="mb-6 text-2xl font-semibold text-center text-gray-800">เข้าสู่ระบบ</h2>
          
          {error && (
            <div className="p-3 mb-4 text-sm text-center text-white bg-red-500 rounded-md">
              {error}
            </div>
          )}
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700" htmlFor="email-desktop">
                อีเมล
              </label>
              <input
                id="email-desktop"
                type="email"
                className="w-full px-4 py-2 text-gray-700 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#800000]"
                placeholder="อีเมล"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700" htmlFor="password-desktop">
                รหัสผ่าน
              </label>
              <input
                id="password-desktop"
                type="password"
                className="w-full px-4 py-2 text-gray-700 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#800000]"
                placeholder="รหัสผ่าน"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          
            <button 
              type="submit"
              className="w-full px-4 py-2 mt-6 text-base font-semibold text-white bg-[#800000] rounded-md hover:bg-red-700 focus:outline-none"
              disabled={loading}
            >
              {loading ? 'กำลังเข้าสู่ระบบ...' : 'ลงชื่อเข้าใช้'}
            </button>
          </form>
          <div className="flex flex-col items-left mt-4 text-sm text-blue-800">
            <a href="#" className="hover:underline">ลืมรหัสผ่าน ?</a>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;