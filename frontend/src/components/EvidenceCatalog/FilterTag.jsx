// FilterTag: Tag แสดงตัวกรอง
import React from 'react';

const FilterTag = ({ category, label, onRemove }) => {
  const getCategoryLabel = (category) => {
    switch(category) {
      case 'types': return 'ประเภท';
      case 'brands': return 'ยี่ห้อ';
      case 'models': return 'รุ่น';
      case 'mechanisms': return 'กลไก';
      default: return '';
    }
  };

  return (
    <div className="inline-flex items-center bg-gray-100 rounded-full px-3 py-1 text-sm mr-2 mb-2">
      <span className="mr-1">{getCategoryLabel(category)}: {label}</span>
      {onRemove && (
        <button
          onClick={() => onRemove(category, label)}
          className="text-gray-500 hover:text-gray-700"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default FilterTag;