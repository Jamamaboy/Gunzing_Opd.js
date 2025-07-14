import React from 'react';
import { FiSearch, FiX } from 'react-icons/fi';
import PropTypes from 'prop-types';

const DrugCaseSearchBar = ({ searchValue, onSearchChange, placeholder = "ค้นหาเลขคดี, ชื่อผู้ต้องหา..." }) => {
  const handleClearSearch = () => {
    onSearchChange('');
  };

  return (
    <div className="relative flex-1 max-w-md">
      <div className="relative">
        <FiSearch 
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
          size={20} 
        />
        <input
          type="text"
          placeholder={placeholder}
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {searchValue && (
          <button
            onClick={handleClearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <FiX size={18} />
          </button>
        )}
      </div>
      
      {/* Search Suggestions/Results Count (optional) */}
      {searchValue && (
        <div className="absolute top-full left-0 right-0 mt-1 text-xs text-gray-500 px-3">
          ค้นหา: "{searchValue}"
        </div>
      )}
    </div>
  );
};

DrugCaseSearchBar.propTypes = {
  searchValue: PropTypes.string.isRequired,
  onSearchChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string
};

export default DrugCaseSearchBar;