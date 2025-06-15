import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// ProtectedRoute component ที่สนับสนุนทั้ง online และ offline mode
// สามารถระบุ allowedRoles เพื่อจำกัดการเข้าถึงตาม role ได้
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, isAuthenticated, loading, initialCheckComplete } = useAuth();
  const location = useLocation();
  const [showContent, setShowContent] = useState(false);

  // แสดงผลเมื่อตรวจสอบ auth เสร็จแล้วเท่านั้น เพื่อป้องกัน flash of content
  useEffect(() => {
    if (initialCheckComplete) {
      setShowContent(true);
    }
  }, [initialCheckComplete]);

  if (!showContent) {
    // แสดง loading state ระหว่างที่ตรวจสอบ authentication
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="p-4 text-center">
          <div className="w-16 h-16 border-4 border-t-[#990000] border-gray-200 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  // ถ้ายังไม่ได้ login ให้ redirect ไปหน้า login พร้อมกับเก็บ pathname ปัจจุบัน
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // ถ้ามีการระบุ allowedRoles และ user ไม่ได้อยู่ใน role ที่อนุญาต
  if (allowedRoles.length > 0 && user?.role?.id && !allowedRoles.includes(user.role.id)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
        <div className="p-8 bg-white rounded-lg shadow-md max-w-md w-full text-center">
          <h2 className="text-xl font-semibold text-red-700 mb-4">ไม่มีสิทธิ์เข้าถึง</h2>
          <p className="text-gray-600 mb-4">
            คุณไม่มีสิทธิ์ในการเข้าถึงหน้านี้
          </p>
          <div className="mt-4">
            <button
              onClick={() => window.history.back()}
              className="px-4 py-2 bg-[#990000] text-white rounded-md hover:bg-[#800000] transition-colors"
            >
              ย้อนกลับ
            </button>
          </div>
        </div>
      </div>
    );
  }

  // อนุญาตให้เข้าถึงหน้านี้ได้
  return children;
};

export default ProtectedRoute;