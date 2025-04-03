import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const BottomBar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleRetakeOrGoBack = () => {
    const isFromCamera = location.state?.fromCamera || false;

    if (isFromCamera) {
      navigate('/camera');
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="w-full py-4 px-4 flex justify-between border-t sm:justify-end sm:space-x-4">
      <button 
        className="px-6 py-2 border border-gray-400 rounded text-gray-700"
        onClick={handleRetakeOrGoBack}
      >
        ถ่ายใหม่
      </button>
    </div>
  );
};

export default BottomBar;