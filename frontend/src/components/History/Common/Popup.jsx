import React from 'react';
import { FiX } from "react-icons/fi";

const Popup = ({ open, type, message, countdown, onClose }) => {
  if (!open) return null;
  
  let icon, color;
  if (type === 'success') {
    icon = <svg className="w-8 h-8 text-green-600 mb-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>;
    color = 'text-green-600';
  } else {
    icon = <svg className="w-8 h-8 text-red-600 mb-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>;
    color = 'text-red-600';
  }
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg flex flex-col items-center justify-center w-80 h-64 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-700"
          aria-label="ปิด"
        >
          <FiX size={22} />
        </button>
        {icon}
        <div className={`font-semibold text-lg mb-4 mt-2 text-center ${color}`}>{message}</div>
        <div className="mt-4 text-gray-500 text-sm">
          ปิดอัตโนมัติใน {countdown} วินาที
        </div>
      </div>
    </div>
  );
};

export default Popup;