import React from 'react';
import { Link } from 'react-router-dom';

const PrimaryBar = () => {
  return (
    <div className="h-16 sm:h-16 bg-gradient-to-r from-[#990000] to-[#330000] flex items-center px-4 sm:px-6 justify-between text-white w-full">
      <div className="flex items-center space-x-2">
        <Link to="/home"><span className="text-base sm:text-lg font-semibold">Forensic Assistance</span></Link>
      </div>
    </div>
  );
};

export default PrimaryBar;