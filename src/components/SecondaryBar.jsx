import React from "react";
import { FiUser, FiLogOut } from "react-icons/fi";

const SecondaryBar = () => {
  return (
    <div className="h-12 sm:h-16 bg-white flex items-center px-6 text-gray-800 shadow-[0_2px_4px_rgba(0,0,0,0.25)] w-full">
      <div className="ml-auto flex items-center gap-4">
        <button className="flex items-center gap-2 text-gray-800 px-4 py-2 rounded hover:bg-gray-200">
          <FiUser size={24} />
          <span className="text-xl hidden sm:block">John Doe</span>
        </button>

        <button className="hidden sm:flex items-center gap-2 bg-red-500 hover:bg-red-600 px-4 py-2 rounded text-white">
          <FiLogOut size={24} />
          <span className="text-xl">ออกจากระบบ</span>
        </button>
      </div>
    </div>
  );
};

export default SecondaryBar;