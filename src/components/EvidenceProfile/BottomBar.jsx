import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const BottomBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get evidence data from location state or localStorage
  const evidenceData = location.state?.evidence || 
    JSON.parse(localStorage.getItem('analysisResult'));

  const handleRetakeOrGoBack = () => {
    const isFromCamera = location.state?.fromCamera || false;

    if (isFromCamera) {
      navigate('/camera');
    } else {
      navigate(-1);
    }
  };

  const handleSave = () => {
    // Navigate to save-to-record page with evidence data
    navigate('/evidenceProfile/save-to-record', { 
      state: { 
        evidence: evidenceData,
        fromEvidence: true  // Flag to indicate where we came from
      } 
    });
  };

  return (
    <div className="w-full py-4 px-4 flex justify-between border-t sm:justify-end sm:space-x-4">
      <button 
        className="px-7 py-1.5 border border-t-2 border-r-2 border-l-2 border-b-4 border-[#6B0000] rounded-lg text-[#900B09]"
        onClick={handleRetakeOrGoBack}
      >
        ถ่ายใหม่
      </button>
      <button 
        className="px-4 py-1.5 border-[#6B0000] border-b-4 bg-[#990000] rounded-lg text-white"
        onClick={handleSave}
      >
        บันทึกประวัติ
      </button>
    </div>
  );
};

export default BottomBar;