import React, { useState } from 'react';

const FilterModal = ({
  isOpen, onClose, filters, tempFilters, onFilterChange, onApplyFilter, onClearFilters, filterOptions
}) => {
  if (!isOpen) return null;
  const [openSections, setOpenSections] = useState({
    types: true,
    brands: false,
    models: false,
    mechanisms: false
  });
  const toggleSection = (section) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };
  const isAnyTypeSelected = () => Object.values(tempFilters.types).some(v => v);
  const isAnyBrandSelected = () => Object.values(tempFilters.brands).some(v => v);
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-0 md:p-4">
      <div className="bg-white flex flex-col relative w-full h-full rounded-none md:w-full md:h-[70vh] md:max-w-2xl md:max-h-[80vh] md:rounded-lg shadow-lg overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b flex-shrink-0">
          <h2 className="text-xl md:text-2xl font-semibold w-full text-center">เลือกตัวกรองผลลัพธ์</h2>
          <button onClick={onClose} className="absolute top-3 right-3 text-gray-500 hover:text-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 md:p-6 pt-4">
          {/* ...sections code (types, brands, models, mechanisms) เหมือนเดิม... */}
        </div>
        <div className="flex flex-col md:flex-row justify-between p-4 border-t gap-3 flex-shrink-0 bg-white">
          <button onClick={onClearFilters} className="w-full md:w-auto px-4 py-2 border rounded-lg text-[#b30000] border-[#b30000] hover:bg-red-50 order-2 md:order-1">ล้างการคัดกรองทั้งหมด</button>
          <button onClick={onApplyFilter} className="w-full md:w-auto px-4 py-2 rounded-lg bg-[#b30000] text-white hover:bg-[#990000] order-1 md:order-2">คัดกรองผลลัพธ์</button>
        </div>
      </div>
    </div>
  );
};

export default FilterModal;