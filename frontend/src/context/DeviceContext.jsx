import React, { createContext, useState, useContext, useEffect } from 'react';

export const DeviceContext = createContext();

export const DeviceProvider = ({ children }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      
      // กำหนด breakpoints ตามที่ใช้ใน tailwind หรือตามความเหมาะสมของโปรเจกต์
      setIsMobile(width < 640);
      setIsTablet(width >= 640 && width < 1024);
      setIsDesktop(width >= 1024);
    };

    // เรียกใช้ทันทีเมื่อ component mount
    handleResize();

    // เพิ่ม event listener สำหรับ resize
    window.addEventListener('resize', handleResize);

    // cleanup function
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // เพิ่มฟังก์ชันสำหรับตรวจสอบ orientation
  const [orientation, setOrientation] = useState('');
  
  useEffect(() => {
    const handleOrientationChange = () => {
      setOrientation(
        window.innerHeight > window.innerWidth ? 'portrait' : 'landscape'
      );
    };

    // เรียกใช้ทันทีเมื่อ component mount
    handleOrientationChange();

    // เพิ่ม event listener สำหรับ resize ซึ่งจะเกิดเมื่อ orientation เปลี่ยน
    window.addEventListener('resize', handleOrientationChange);

    return () => {
      window.removeEventListener('resize', handleOrientationChange);
    };
  }, []);

  const deviceContextValue = {
    isMobile,
    isTablet,
    isDesktop,
    orientation
  };

  return (
    <DeviceContext.Provider value={deviceContextValue}>
      {children}
    </DeviceContext.Provider>
  );
};

export const useDevice = () => useContext(DeviceContext);

export default DeviceProvider;