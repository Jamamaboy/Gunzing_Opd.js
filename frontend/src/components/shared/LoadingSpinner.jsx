import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="flex justify-center items-center min-h-[65vh] md:h-64">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#b30000]"></div>
    </div>
  );
};

export default LoadingSpinner;