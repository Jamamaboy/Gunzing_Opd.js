import React from 'react';

const ErrorDisplay = ({ message, onRetry }) => {
  return (
    <div className="flex flex-col justify-center items-center min-h-[65vh] text-center text-red-500 md:py-10">
      <p>{message}</p>
      <button 
        onClick={onRetry} 
        className="mt-4 px-4 py-2 bg-[#b30000] text-white rounded hover:bg-[#990000]"
      >
        ลองใหม่
      </button>
    </div>
  );
};

export default ErrorDisplay;