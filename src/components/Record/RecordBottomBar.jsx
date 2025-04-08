import React from 'react';
import { useNavigate } from 'react-router-dom';

const RecordBottomBar = ({ evidenceData }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/evidenceProfile', { 
      state: { 
        type: evidenceData?.type || 'Gun',
        result: evidenceData?.result || evidenceData,
        fromRecord: true 
      } 
    });
  };

  const handleSave = () => {
    navigate('/history');
  };

  return (
    <div className="w-full py-4 px-4 flex justify-between border-t sm:justify-end sm:space-x-4">
      <button 
        className="px-4 py-1.5 border border-t-2 border-r-2 border-l-2 border-b-4 border-[#6B0000] rounded-lg text-[#900B09]"
        onClick={handleBack}
      >
        ย้อนกลับ
      </button>
      <button 
        className="px-7 py-1.5 border-[#6B0000] border-b-4 bg-[#990000] rounded-lg text-white"
        onClick={handleSave}
      >
        บันทึก
      </button>
    </div>
  );
};

export default RecordBottomBar;