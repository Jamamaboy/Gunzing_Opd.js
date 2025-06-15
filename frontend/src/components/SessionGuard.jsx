import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSession } from '../context/SessionContext';
import { hasValidSession, isInCycle, isInitialCyclePage } from '../utils/SessionManager';

const SessionGuard = ({ children, path }) => {
  const { isInCycle: checkInCycle } = useSession();

  if (isInitialCyclePage(path)) {
    return children;
  }
  
  if (isInCycle(path) && !hasValidSession()) {
    return <Navigate to="/imagePreview" replace />;
  }

  return children;
};

export default SessionGuard;