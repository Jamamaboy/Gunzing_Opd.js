import React from 'react';
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  rowsPerPage, 
  onRowsPerPageChange,
  totalItems,
  indexOfFirstItem,
  indexOfLastItem
}) => {
  return (
    <div className="w-full bg-[#e6f0fa] py-2 px-4 flex justify-between items-center text-sm text-gray-700 font-medium rounded-b-lg border-t flex-shrink-0">
      <span className="text-gray-600">
        {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, totalItems)} จาก {totalItems}
      </span>
      <div className="flex items-center text-gray-600">
        <span className="mr-2">แถว ต่อ หน้า:</span>
        <select 
          className="bg-transparent border-none text-gray-600 font-semibold focus:outline-none cursor-pointer" 
          value={rowsPerPage} 
          onChange={onRowsPerPageChange}
        >
          <option value="5">5</option>
          <option value="10">10</option>
          <option value="20">20</option>
        </select>
      </div>
      <div className="flex items-center gap-1">
        <button 
          title="หน้าแรก" 
          onClick={() => onPageChange(1)} 
          disabled={currentPage === 1} 
          className={`p-1 rounded ${currentPage === 1 ? "text-gray-400 cursor-not-allowed" : "text-gray-600 hover:bg-gray-200"}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M8.354 1.646a.5.5 0 0 0-.708 0l-6 6a.5.5 0 0 0 0 .708l6 6a.5.5 0 0 0 .708-.708L2.707 8l5.647-5.646a.5.5 0 0 0 0-.708"/>
            <path d="M12.354 1.646a.5.5 0 0 0-.708 0l-6 6a.5.5 0 0 0 0 .708l-6 6a.5.5 0 0 0-.708-.708L6.707 8l5.647-5.646a.5.5 0 0 0 0-.708"/>
          </svg>
        </button>
        <button 
          title="หน้าก่อน" 
          onClick={() => onPageChange(currentPage - 1)} 
          disabled={currentPage === 1} 
          className={`p-1 rounded ${currentPage === 1 ? "text-gray-400 cursor-not-allowed" : "text-gray-600 hover:bg-gray-200"}`}
        >
          <FiChevronLeft size={16} />
        </button>
        <span className="font-semibold px-1">
          <span className="text-black">{currentPage}</span>
          <span className="px-1 text-gray-400">/</span>
          <span className="text-gray-500">{totalPages}</span>
        </span>
        <button 
          title="หน้าถัดไป" 
          onClick={() => onPageChange(currentPage + 1)} 
          disabled={currentPage === totalPages} 
          className={`p-1 rounded ${currentPage === totalPages ? "text-gray-400 cursor-not-allowed" : "text-gray-600 hover:bg-gray-200"}`}
        >
          <FiChevronRight size={16} />
        </button>
        <button 
          title="หน้าสุดท้าย" 
          onClick={() => onPageChange(totalPages)} 
          disabled={currentPage === totalPages} 
          className={`p-1 rounded ${currentPage === totalPages ? "text-gray-400 cursor-not-allowed" : "text-gray-600 hover:bg-gray-200"}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M3.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L9.293 8l-5.647-5.646a.5.5 0 0 1 0-.708"/>
            <path d="M7.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L13.293 8l-5.647-5.646a.5.5 0 0 1 0-.708"/>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Pagination;