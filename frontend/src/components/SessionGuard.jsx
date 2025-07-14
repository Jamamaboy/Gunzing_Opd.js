import React from 'react';
import { Navigate } from 'react-router-dom';
import { hasValidSession, isInCycle, isInitialCyclePage } from '../utils/SessionManager';

const SessionGuard = ({ children, path }) => {
  // ถ้าเป็นหน้าแรกของ cycle ให้ผ่าน
  if (isInitialCyclePage(path)) {
    return children;
  }
  
  // ถ้าอยู่ใน cycle แต่ไม่มี session ให้ redirect ไป imagePreview
  if (isInCycle(path) && !hasValidSession()) {
    console.warn(`Session guard: No valid session for path ${path}, redirecting to imagePreview`);
    return <Navigate to="/imagePreview" replace />;
  }

  return children;
};

export default SessionGuard;