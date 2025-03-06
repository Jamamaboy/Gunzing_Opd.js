import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 0);
  
  // Update width on window resize
  React.useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Determine if mobile view based on window width
  const isMobile = windowWidth < 640; // 640px is the standard sm breakpoint in Tailwind
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      {isMobile ? (
        // Mobile Layout
        <div className="w-full p-4 mx-4 bg-white border border-[#800000] rounded-lg shadow-md">
          <h2 className="mb-6 text-xl font-semibold text-center text-gray-800">เข้าสู่ระบบ</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700" htmlFor="username-mobile">
                รหัสประจำตัว
              </label>
              <input
                id="username-mobile"
                type="text"
                className="w-full px-3 py-2 text-sm text-gray-700 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#800000]"
                placeholder="รหัสประจำตัว"
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
              />
            </div>
          </div>

          <button className="w-full px-4 py-3 mt-6 text-sm font-semibold text-white bg-[#800000] rounded-md hover:bg-red-700 focus:outline-none"
          onClick={() => navigate('/home')}>
            ลงชื่อเข้าใช้
          </button>
        </div>
      ) : (
        // Desktop Layout
        <div className="w-full max-w-md p-8 bg-white border border-[#800000] rounded-lg shadow-lg">
          <h2 className="mb-6 text-2xl font-semibold text-center text-gray-800">เข้าสู่ระบบ</h2>
          <div className="space-y-4">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700" htmlFor="username-desktop">
                รหัสประจำตัว
              </label>
              <input
                id="username-desktop"
                type="text"
                className="w-full px-4 py-2 text-gray-700 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#800000]"
                placeholder="รหัสประจำตัว"
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
              />
            </div>
          </div>

          <button className="w-full px-4 py-2 mt-6 text-base font-semibold text-white bg-[#800000] rounded-md hover:bg-red-700 focus:outline-none"
          onClick={() => navigate('/home')}>
            ลงชื่อเข้าใช้
          </button>
          
        </div>
      )}
    </div>
  );
};

export default Login;