import React from 'react';
import { useNavigate } from 'react-router-dom';

const BottomBar = () => {
  const navigate = useNavigate();
  return (
    <div className="w-full py-4 px-4 flex justify-between border-t sm:justify-end sm:space-x-4">
      <button className="px-6 py-2 border border-gray-400 rounded text-gray-700"
      onClick={() => navigate('/camera')}>
        ถ่ายใหม่
      </button>
      <button className="px-6 py-2 bg-red-800 text-white rounded">
        บันทึกประวัติ
      </button>
    </div>
  );
};

export default BottomBar;