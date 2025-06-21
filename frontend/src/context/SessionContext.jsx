import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  createSession, 
  hasValidSession, 
  clearSession, 
  isInCycle, 
  getInitialCyclePath, 
  isInitialCyclePage,
  setupNavigationListeners
} from '../utils/SessionManager';

// กำหนดหน้าที่อยู่ใน cycle
const CYCLE_PAGES = [
  '/imagePreview',
  '/candidateShow',
  '/evidenceProfile',
  '/evidenceProfile/gallery',
  '/evidenceProfile/history',
  '/evidenceProfile/save-to-record',
  '/evidenceProfile/map'
];

// สร้าง context สำหรับการใช้งานทั่วทั้งแอป
export const SessionContext = createContext();

export const SessionProvider = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sessionId, setSessionId] = useState(null);
  const [lastValidPath, setLastValidPath] = useState(null);

  // ตรวจสอบและจัดการกับการเข้าสู่หรือออกจาก cycle
  useEffect(() => {
    const currentPath = location.pathname;
    
    // 1. ถ้าอยู่ในหน้าแรกของ cycle ให้สร้าง session ใหม่
    if (isInitialCyclePage(currentPath)) {
      const newSessionId = createSession();
      setSessionId(newSessionId);
      setLastValidPath(currentPath);
      // เก็บ sessionId ใน sessionStorage
      sessionStorage.setItem('sessionId', newSessionId); // <-- เปลี่ยนตรงนี้
    } 
    // 2. ถ้าอยู่ในหน้าอื่นๆ ของ cycle แต่ไม่มี session ให้ดึงจาก sessionStorage
    else if (isInCycle(currentPath)) {
      const storedSessionId = sessionStorage.getItem('sessionId'); // <-- เปลี่ยนตรงนี้
      if (storedSessionId) {
        setSessionId(storedSessionId);
        setLastValidPath(currentPath);
      } else if (!hasValidSession()) {
        navigate(getInitialCyclePath(), { replace: true });
      }
    }
    // 3. ถ้าอยู่ในหน้าของ cycle และมี session อยู่แล้ว ให้บันทึก path ปัจจุบันไว้
    else if (isInCycle(currentPath) && hasValidSession()) {
      setLastValidPath(currentPath);
    }
    // 4. ถ้าออกจาก cycle ไปยังหน้าอื่นๆ ให้ล้าง session
    else if (!isInCycle(currentPath) && hasValidSession()) {
      clearSession();
      setSessionId(null);
      setLastValidPath(null);
      sessionStorage.removeItem('sessionId'); // <-- เปลี่ยนตรงนี้
    }
  }, [location.pathname, navigate]);

  // จัดการกับการใช้ปุ่ม back และ forward ของเบราว์เซอร์
  useEffect(() => {
    const handleNavigation = () => {
      const currentPath = window.location.pathname;
      
      // ถ้าไม่อยู่ใน cycle แล้วแต่มี session อยู่ ให้ล้าง session
      if (!isInCycle(currentPath) && hasValidSession()) {
        clearSession();
        setSessionId(null);
        setLastValidPath(null);
      }
      // ถ้าอยู่ในหน้าของ cycle แต่ไม่มี session ให้ redirect ไปยังหน้าแรก
      else if (isInCycle(currentPath) && !isInitialCyclePage(currentPath) && !hasValidSession()) {
        navigate(getInitialCyclePath(), { replace: true });
      }
    };

    // ตั้งค่า listener สำหรับ popstate event (เมื่อกดปุ่ม back/forward)
    const cleanup = setupNavigationListeners(handleNavigation);
    
    // ล้าง listener เมื่อ component unmount
    return cleanup;
  }, [navigate]);

  // เมื่อออกจากเส้นทางปัจจุบัน ให้ตรวจสอบว่าเป็นการออกจาก cycle หรือไม่
  const exitCycle = () => {
    clearSession();
    setSessionId(null);
    setLastValidPath(null);
    navigate('/home'); // หรือเส้นทางอื่นที่เหมาะสม
  };

  // เริ่ม cycle ใหม่
  const startNewCycle = () => {
    clearSession();
    const newSessionId = createSession();
    setSessionId(newSessionId);
    navigate('/imagePreview', { replace: true });
  };

  // ค่าที่ส่งไปให้ components ต่างๆ
  const sessionContextValue = {
    sessionId,
    isInCycle: (path) => isInCycle(path || location.pathname),
    exitCycle,
    startNewCycle,
    lastValidPath
  };

  return (
    <SessionContext.Provider value={sessionContextValue}>
      {children}
    </SessionContext.Provider>
  );
};

// Hook สำหรับการใช้งาน Session Context
export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};