import React from "react";
import { FaSignOutAlt } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';

const SecondaryBar = () => {
  const navigate = useNavigate();
  return (
    <div className="h-12 sm:h-12 bg-white flex items-center px-6 text-gray-800 shadow-[0_1.5px_3px_rgba(0,0,0,0.25)] w-full relative z-10">
      <div className="ml-auto flex items-center gap-4">
        <button className="flex items-center gap-2 text-gray-800 px-4 py-2 rounded hover:bg-gray-200"
        onClick={() => navigate('/login')}>
          <FaSignOutAlt size={28} />
          <span className="text-base hidden sm:block">ออกจากระบบ</span>
        </button>
      </div>
    </div>
  );
};

export default SecondaryBar;