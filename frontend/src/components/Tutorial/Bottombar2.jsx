import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const BottomBar2 = ({ analysisResult, evidence, fromCamera, sourcePath }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const evidenceData = evidence;

  const isFromCamera = fromCamera || location.state?.fromCamera || false;
  const uploadFromCameraPage = location.state?.uploadFromCameraPage || false;
  const sourcePath_ = sourcePath || location.state?.sourcePath;

  const handleRetakeOrGoBack = () => {
    if (uploadFromCameraPage || isFromCamera) {
      navigate('/camera');
    }
    else if (sourcePath_) {
      if (typeof sourcePath_ === 'number') {
        navigate(sourcePath_);
      } else {
        navigate(sourcePath_);
      }
    }
    else {
      navigate(-1);
    }
  };

  const handleSave = () => {
    // ตรวจสอบข้อมูลก่อน navigate
    if (!evidenceData) {
      console.error('No evidence data available');
      return;
    }

    console.log('Navigating to save-to-record with data:', {
      evidence: evidenceData,
      analysisResult: analysisResult,
      fromEvidence: true
    });

    // ไปหน้าบันทึกประวัติโดยไม่ต้องยืนยันตัวตน
    navigate('/evidenceProfile/save-to-record', {
      state: {
        evidence: evidenceData,
        analysisResult: analysisResult,
        fromEvidence: true,
        fromCamera: isFromCamera,
        uploadFromCameraPage,
        sourcePath: sourcePath_
      },
      replace: false
    });
  };

  return (
    <div className="w-full py-4 px-4 flex justify-between border-t sm:justify-end sm:space-x-4">
      <button
        className="px-7 py-1.5 border border-t-2 border-r-2 border-l-2 border-b-4 border-[#6B0000] rounded-lg text-[#900B09]"
        onClick={handleRetakeOrGoBack}
      >
        ย้อนกลับ
      </button>
      <button
        className="px-4 py-1.5 border-[#6B0000] border-b-4 bg-[#990000] rounded-lg text-white"
        onClick={handleSave}
      >
		หน้าถัดไป
      </button>
    </div>
  );
};

export default BottomBar2;
