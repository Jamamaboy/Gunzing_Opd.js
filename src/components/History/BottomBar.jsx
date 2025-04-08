import React from 'react';
import { useNavigate } from 'react-router-dom';

const BottomBar = ({ evidenceData }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="w-full py-4 px-4 flex justify-between border-t sm:justify-end sm:space-x-4">
      <button 
        className="px-4 py-1.5 border border-t-2 border-r-2 border-l-2 border-b-4 border-[#6B0000] rounded-lg text-[#900B09]"
        onClick={handleBack}
      >
        ย้อนกลับ
      </button>
    </div>
  );
};

export default BottomBar;