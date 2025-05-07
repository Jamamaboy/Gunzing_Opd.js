import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const DrugCard = ({ drug }) => {
  return (
    <Link to={`/selectCatalogType/drugs-catalog/drug-profile/${drug.id}`} className="bg-white rounded-lg shadow-sm p-3 flex flex-col items-center hover:shadow-md transition-shadow h-[280px] max-w-[210px] mx-auto w-full">
      <div className="w-28 h-28 mb-4">
        <img
          src={Array.isArray(drug.image) ? drug.image[0] : drug.image}
          alt={`${drug.stamp}`}
          className="w-full h-full object-contain"
        />
      </div>
      <div className="w-full flex-1 flex flex-col">
        <h3 className="font-semibold text-base mb-2 text-left line-clamp-2">{drug.stamp}</h3>
        <p className="text-sm text-gray-600 text-left line-clamp-2">ประเภท: {drug.drug_category}</p>
        <p className="text-sm text-gray-600 text-left line-clamp-2">รูปแบบ: {drug.drug_type}</p>
        {/* <p className="text-sm text-gray-600 text-left line-clamp-2">สี: {drug.color}</p> */}
      </div>
    </Link>
  );
};

// Filter Modal Component
const FilterModal = ({ isOpen, onClose, filters, tempFilters, onFilterChange, onApplyFilter, onClearFilters, drugs }) => {
  if (!isOpen) return null;

  // State for dropdown sections
  const [openSections, setOpenSections] = useState({
    types: true,
    forms: false,
    colors: false
  });

  // Get available forms based on selected types
  const getAvailableForms = () => {
    const selectedTypes = Object.entries(tempFilters.types)
      .filter(([_, isChecked]) => isChecked)
      .map(([type]) => type);

    // If no type selected, show all forms relevant to the data
    if (selectedTypes.length === 0) {
      const allForms = {};
      drugs.forEach(drug => { allForms[drug.drug_type] = true; });
      return allForms;
    }

    const availableForms = {};
    drugs.forEach(drug => {
      if (selectedTypes.includes(drug.drug_category)) {
        availableForms[drug.drug_type] = true;
      }
    });
    return availableForms;
  };

  // Get available colors based on selected types and forms
  const getAvailableColors = () => {
    const selectedTypes = Object.entries(tempFilters.types)
      .filter(([_, isChecked]) => isChecked)
      .map(([type]) => type);
    const selectedForms = Object.entries(tempFilters.forms)
      .filter(([_, isChecked]) => isChecked)
      .map(([form]) => form);

    const typeFilterActive = selectedTypes.length > 0;
    const formFilterActive = selectedForms.length > 0;

    // If no relevant filters applied, show all colors
    if (!typeFilterActive && !formFilterActive) {
      const allColors = {};
      drugs.forEach(drug => { allColors[drug.color] = drug.drug_type; });
      return allColors;
    }

    const availableColors = {};
    drugs.forEach(drug => {
      const typeMatch = !typeFilterActive || selectedTypes.includes(drug.drug_category);
      const formMatch = !formFilterActive || selectedForms.includes(drug.drug_type);
      if (typeMatch && formMatch) {
        availableColors[drug.color] = drug.drug_type;
      }
    });
    return availableColors;
  };

  const availableForms = getAvailableForms();
  const availableColors = getAvailableColors();

  const toggleSection = (section) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Function to check if any type filter is active
  const isAnyTypeSelected = () => Object.values(tempFilters.types).some(v => v);
  // Function to check if any form filter is active
  const isAnyFormSelected = () => Object.values(tempFilters.forms).some(v => v);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-lg w-full max-w-2xl relative flex flex-col max-h-[70vh]">
        {/* Fixed Header */}
        <div className="p-6 pb-0 flex-shrink-0">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <h2 className="text-xl font-bold text-center">เลือกตัวกรองผลลัพธ์</h2>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 pt-4">
          {/* Types Section */}
          <div className="mb-6">
            <button
              onClick={() => toggleSection('types')}
              className="w-full flex justify-between items-center text-lg font-semibold mb-3"
            >
              <span>ประเภทยาเสพติด</span>
              <svg
                className={`w-5 h-5 transform transition-transform ${openSections.types ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {openSections.types && (
              <div className="grid grid-cols-3 gap-4">
                {Object.entries(tempFilters.types).map(([type, isChecked]) => (
                  <div key={type} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`type-${type}`}
                      checked={isChecked}
                      onChange={() => onFilterChange('types', type)}
                      className="w-5 h-5 mr-2"
                    />
                    <label htmlFor={`type-${type}`} className="text-base">{type}</label>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Forms Section */}
          <div className="mb-6">
            <button
              onClick={() => toggleSection('forms')}
              className="w-full flex justify-between items-center text-lg font-semibold mb-3"
            >
              <span>รูปแบบยาเสพติด</span>
              <svg
                className={`w-5 h-5 transform transition-transform ${openSections.forms ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {openSections.forms && (
              <div className="grid grid-cols-3 gap-4">
                {Object.entries(tempFilters.forms).map(([form, isChecked]) => {
                  const isAvailable = !isAnyTypeSelected() || availableForms[form];
                  return (
                    <div key={form} className={`flex items-center ${!isAvailable ? 'opacity-50 cursor-not-allowed' : ''}`}>
                      <input
                        type="checkbox"
                        id={`form-${form}`}
                        checked={isChecked && isAvailable}
                        onChange={() => onFilterChange('forms', form)}
                        disabled={!isAvailable}
                        className="w-5 h-5 mr-2"
                      />
                      <label
                        htmlFor={`form-${form}`}
                        className={`text-base ${!isAvailable ? 'text-gray-400' : ''}`}
                      >
                        {form}
                      </label>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Colors Section */}
          <div className="mb-6">
            <button
              onClick={() => toggleSection('colors')}
              className="w-full flex justify-between items-center text-lg font-semibold mb-3"
            >
              <span>สียาเสพติด</span>
              <svg
                className={`w-5 h-5 transform transition-transform ${openSections.colors ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {openSections.colors && (
              <div className="grid grid-cols-3 gap-4">
                {Object.entries(tempFilters.colors).map(([color, isChecked]) => {
                  const formContext = availableColors[color];
                  const isAvailable = (!isAnyTypeSelected() && !isAnyFormSelected()) || formContext;
                  return (
                    <div key={color} className={`flex items-center ${!isAvailable ? 'opacity-50 cursor-not-allowed' : ''}`}>
                      <input
                        type="checkbox"
                        id={`color-${color}`}
                        checked={isChecked && isAvailable}
                        onChange={() => onFilterChange('colors', color)}
                        disabled={!isAvailable}
                        className="w-5 h-5 mr-2"
                      />
                      <label
                        htmlFor={`color-${color}`}
                        className={`text-base ${!isAvailable ? 'text-gray-400' : ''}`}
                      >
                        {color} {formContext && `(${formContext})`}
                      </label>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Fixed Footer */}
        <div className="p-6 pt-0 flex-shrink-0">
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={onClearFilters}
              className="border border-red-800 text-red-800 rounded-lg py-3 font-medium hover:bg-red-50"
            >
              ล้างการคัดกรองทั้งหมด
            </button>
            <button
              onClick={onApplyFilter}
              className="bg-red-800 text-white rounded-lg py-3 font-medium hover:bg-red-900"
            >
              คัดกรองผลลัพธ์
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Filter Tag Component
const FilterTag = ({ category, label, onRemove }) => {
  const getCategoryLabel = (category) => {
    switch(category) {
      case 'types': return 'ประเภท';
      case 'forms': return 'รูปแบบ';
      case 'colors': return 'สี';
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

// Error Component
const ErrorDisplay = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full py-10">
      <div className="text-red-600 mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h2 className="text-xl font-bold text-gray-800 mb-2">เกิดข้อผิดพลาด</h2>
      <p className="text-gray-600 mb-4 text-center px-4">{message || 'ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง'}</p>
      <button
        onClick={() => window.location.reload()}
        className="bg-red-800 text-white px-6 py-2 rounded-lg hover:bg-red-900"
      >
        ลองใหม่อีกครั้ง
      </button>
    </div>
  );
};

// Pagination Component (Same as in GunCatalog.jsx)
const Pagination = ({ currentPage, totalPages, itemsPerPage, totalItems, onPageChange, onItemsPerPageChange }) => {
  // ... same pagination code as in GunCatalog
  const pageNumbers = [];
  const maxPageButtons = 5;

  let startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
  let endPage = Math.min(totalPages, startPage + maxPageButtons - 1);

  if (endPage - startPage + 1 < maxPageButtons) {
    startPage = Math.max(1, endPage - maxPageButtons + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  const itemsPerPageOptions = [10, 20, 50, 100];

  if (totalPages <= 1 && totalItems <= itemsPerPage) {
    if (totalItems > 0) {
      return (
        <div className="flex flex-col md:flex-row justify-between items-center w-full py-2.5">
          <span className="text-sm text-gray-700 mb-2 md:mb-0">
            แสดง {totalItems} รายการ
          </span>
        </div>
      );
    }
    return null;
  }

  return (
    <div className="flex flex-col md:flex-row justify-between items-center w-full py-2.5">
      <div className="flex items-center mb-2 md:mb-0">
        <span className="text-sm text-gray-700">
          แสดง {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, totalItems)} จาก {totalItems} รายการ
        </span>
        <div className="ml-2.5">
          <select
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
            className="border rounded px-2 py-0.5 text-sm"
          >
            {itemsPerPageOptions.map(option => (
              <option key={option} value={option}>{option} / หน้า</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center gap-0.5">
        {/* First Page */}
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className={`mx-0.5 px-1.5 py-0.5 rounded-sm ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-200'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M15.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            <path fillRule="evenodd" d="M7.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L3.414 10l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
        </button>

        {/* Previous Page */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`mx-0.5 px-1.5 py-0.5 rounded-sm ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-200'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </button>

        {/* Page Numbers */}
        {startPage > 1 && (
          <>
            <button onClick={() => onPageChange(1)} className="mx-0.5 px-2.5 py-0.5 rounded-sm text-sm text-gray-700 hover:bg-gray-200">1</button>
            {startPage > 2 && <span className="mx-0.5 px-1 py-0.5 text-sm text-gray-500">...</span>}
          </>
        )}
        {pageNumbers.map(number => (
          <button
            key={number}
            onClick={() => onPageChange(number)}
            className={`mx-0.5 px-2.5 py-0.5 rounded-sm text-sm ${currentPage === number ? 'bg-red-800 text-white' : 'text-gray-700 hover:bg-gray-200'}`}
          >
            {number}
          </button>
        ))}
        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className="mx-0.5 px-1 py-0.5 text-sm text-gray-500">...</span>}
            <button onClick={() => onPageChange(totalPages)} className="mx-0.5 px-2.5 py-0.5 rounded-sm text-sm text-gray-700 hover:bg-gray-200">{totalPages}</button>
          </>
        )}

        {/* Next Page */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`mx-0.5 px-1.5 py-0.5 rounded-sm ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-200'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </button>

        {/* Last Page */}
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className={`mx-0.5 px-1.5 py-0.5 rounded-sm ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-200'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 15.707a1 1 0 010-1.414L8.586 10 4.293 6.707a1 1 0 011.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd" />
            <path fillRule="evenodd" d="M12.293 15.707a1 1 0 010-1.414L16.586 10l-4.293-3.293a1 1 0 011.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
};

// Mobile Pagination Component
const MobilePagination = ({ currentPage, totalPages, itemsPerPage, totalItems, onPageChange, onItemsPerPageChange }) => {
  // ... same mobile pagination code as in GunCatalog
  const itemsPerPageOptions = [10, 20, 50, 100];
  const pageNumbers = [];
  const maxPageButtons = 5;

  let startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
  let endPage = Math.min(totalPages, startPage + maxPageButtons - 1);

  if (endPage - startPage + 1 < maxPageButtons) {
    startPage = Math.max(1, endPage - maxPageButtons + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  if (totalPages <= 1 && totalItems <= itemsPerPage) {
    if (totalItems > 0) {
      return (
        <div className="flex justify-center items-center w-full py-2.5">
        </div>
      );
    }
    return null;
  }

  return (
    <div className="flex justify-between items-center w-full">
      {/* Items per page selector */}
      <div className="flex items-center">
        <select
          value={itemsPerPage}
          onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
          className="border rounded-lg px-2 py-1.5 text-sm bg-white"
        >
          {itemsPerPageOptions.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
        <span className="text-sm text-gray-600 ml-1">รายการ</span>
      </div>

      {/* Page navigation */}
      <div className="flex items-center">
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className={`mx-0.5 px-1 rounded-sm ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-200'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M15.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            <path fillRule="evenodd" d="M7.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L3.414 10l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
        </button>
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`mx-0.5 px-1 rounded-sm ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-200'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </button>

        {startPage > 1 && <span className="mx-0.5 px-1 text-xs text-gray-500">...</span>}

        {pageNumbers.map(number => (
          <button
            key={number}
            onClick={() => onPageChange(number)}
            className={`mx-0.5 px-2 py-0.5 rounded-sm text-xs ${currentPage === number ? 'bg-red-800 text-white' : 'text-gray-700 hover:bg-gray-200'}`}
          >
            {number}
          </button>
        ))}

        {endPage < totalPages && <span className="mx-0.5 px-1 text-xs text-gray-500">...</span>}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`mx-0.5 px-1 rounded-sm ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-200'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </button>
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className={`mx-0.5 px-1 rounded-sm ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-200'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 15.707a1 1 0 010-1.414L8.586 10 4.293 6.707a1 1 0 011.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd" />
            <path fillRule="evenodd" d="M12.293 15.707a1 1 0 010-1.414L16.586 10l-4.293-3.293a1 1 0 011.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
};

const DrugCatalog = () => {
  const navigate = useNavigate();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState('default');
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // Filter state
  const [filters, setFilters] = useState({
    types: {
      'ยาบ้า': false,
      'ยาไอซ์': false,
      'กัญชา': false,
      'โคเคน': false,
      'เฮโรอีน': false,
      'ยาอี': false,
      'แอลเอสดี': false,
    },
    forms: {
      'เม็ด': false,
      'ผง': false,
      'ของเหลว': false,
      'เจล': false,
      'แคปซูล': false,
      'ใบ/พืช': false,
      'ก้อน': false,
    },
    colors: {
      'แดง': false,
      'ส้ม': false,
      'เขียว': false,
      'ม่วง': false,
      'ฟ้า': false,
      'น้ำเงิน': false,
      'เหลือง': false,
      'ขาว': false,
      'เทา': false,
      'น้ำตาล': false,
      'ดำ': false,
      'ไม่มีสี': false,
    }
  });

  // Temp filters
  const [tempFilters, setTempFilters] = useState(JSON.parse(JSON.stringify(filters)));

  const drugsData = [];

  // Drug data would be fetched here
  useEffect(() => {
    const fetchDrugs = async () => {
      try {
        const response = await fetch('http://localhost:8000/narcotics/');
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const data = await response.json();
        setDrugs(data);
        setError(null);
      } catch (err) {
        setError(err.message || 'An error occurred while fetching data.');
        console.error('Error fetching drugs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDrugs();
  }, []);

  // Set drugs state from drugsData
  const [drugs, setDrugs] = useState(drugsData);

  // Filtering logic
  const getFilteredDrugs = () => {
    const areAnyFiltersSelected = Object.values(filters).some(category =>
      Object.values(category).some(value => value)
    );

    if (!areAnyFiltersSelected) {
      return drugs;
    }

    return drugs.filter(drug => {
      // Check type filter
      const typeFilterActive = Object.values(filters.types).some(v => v);
      const matchesType = !typeFilterActive || filters.types[drug.drug_category];

      // Check form filter
      const formFilterActive = Object.values(filters.forms).some(v => v);
      const matchesForm = !formFilterActive || filters.forms[drug.drug_type];

      // Check color filter
      const colorFilterActive = Object.values(filters.colors).some(v => v);
      const matchesColor = !colorFilterActive || filters.colors[drug.color];

      // Match all active filters
      return matchesType && matchesForm && matchesColor;
    });
  };

  // Sorting logic
  const getSortedDrugs = (filteredDrugs) => {
    switch (sortOrder) {
      case 'nameAsc':
        return [...filteredDrugs].sort((a, b) => (a?.name ?? '').localeCompare(b?.name ?? '', 'th'));
      case 'nameDesc':
        return [...filteredDrugs].sort((a, b) => (b?.name ?? '').localeCompare(a?.name ?? '', 'th'));
      default:
        return filteredDrugs;
    }
  };

  // Get filtered and sorted drugs
  const filteredDrugs = getFilteredDrugs();
  const sortedDrugs = getSortedDrugs(filteredDrugs);

  // Pagination
  const indexOfLastDrug = currentPage * itemsPerPage;
  const indexOfFirstDrug = indexOfLastDrug - itemsPerPage;
  const currentDrugs = sortedDrugs.slice(indexOfFirstDrug, indexOfLastDrug);
  const totalPages = Math.ceil(sortedDrugs.length / itemsPerPage);

  // Reset to first page when filters change or items per page changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, itemsPerPage]);

  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo(0, 0);
  };

  // Handle change in items per page
  const handleItemsPerPageChange = (number) => {
    setItemsPerPage(number);
  };

  // Get active filter tags
  const getActiveFilterTags = () => {
    const tags = [];
    Object.entries(filters).forEach(([category, values]) => {
      Object.entries(values).forEach(([key, isChecked]) => {
        if (isChecked) {
          tags.push({ category, label: key });
        }
      });
    });
    return tags;
  };

  const activeFilterTags = getActiveFilterTags();

  // Temp filter change handler
  const handleTempFilterChange = (category, key) => {
    const newTempFilters = JSON.parse(JSON.stringify(tempFilters));
    newTempFilters[category][key] = !newTempFilters[category][key];
    setTempFilters(newTempFilters);
  };

  // Remove filter tag handler
  const handleRemoveFilterTag = (category, label) => {
    const newFilters = JSON.parse(JSON.stringify(filters));
    if (newFilters[category] && newFilters[category][label] !== undefined) {
      newFilters[category][label] = false;
    }
    setFilters(newFilters);
    setTempFilters(JSON.parse(JSON.stringify(newFilters)));
  };

  // Clear filters handler
  const handleClearFilters = () => {
    const resetFilters = {
      types: Object.fromEntries(Object.keys(filters.types || {}).map(key => [key, false])),
      forms: Object.fromEntries(Object.keys(filters.forms || {}).map(key => [key, false])),
      colors: Object.fromEntries(Object.keys(filters.colors || {}).map(key => [key, false]))
    };
    setTempFilters(resetFilters);
    setFilters(resetFilters);
    setIsFilterOpen(false);
  };

  // Filter modal open handler
  const handleOpenFilterModal = () => {
    setTempFilters(JSON.parse(JSON.stringify(filters)));
    setIsFilterOpen(true);
  };

  // Filter modal close handler
  const handleCloseFilterModal = () => {
    setIsFilterOpen(false);
  };

  // Apply filter handler
  const handleApplyFilter = () => {
    setFilters(JSON.parse(JSON.stringify(tempFilters)));
    setIsFilterOpen(false);
  };

  // Toggle sort menu
  const handleToggleSortMenu = () => {
    setSortMenuOpen(!sortMenuOpen);
  };

  // Mobile view detection
  const [isMobileView, setIsMobileView] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Desktop Layout Component
  const DesktopLayout = () => (
    <div className='h-full w-full bg-[#F8F9FA] flex flex-col overflow-hidden'>
      {/* Header */}
      <div className="px-6 py-4 flex justify-between items-center flex-shrink-0">
        <div>
          <h1 className='text-2xl font-bold'>ยาเสพติด</h1>
          <p className='text-sm text-gray-600'>ค้นพบ {sortedDrugs.length} รายการ</p>
        </div>
        <div className='flex items-center space-x-2'>
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-full text-gray-600"
            aria-label="Go back"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Sort Button */}
          <div className="relative">
            <button
              className="p-2 hover:bg-gray-100 rounded-full"
              onClick={handleToggleSortMenu}
              aria-label="Sort items"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
            </button>

            {sortMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                <div className="py-1">
                  <button
                    className={`block w-full text-left px-4 py-2 text-sm ${sortOrder === 'default' ? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:bg-gray-50'}`}
                    onClick={() => {
                      setSortOrder('default');
                      setSortMenuOpen(false);
                    }}
                  >
                    ค่าเริ่มต้น
                  </button>
                  <button
                    className={`block w-full text-left px-4 py-2 text-sm ${sortOrder === 'nameAsc' ? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:bg-gray-50'}`}
                    onClick={() => {
                      setSortOrder('nameAsc');
                      setSortMenuOpen(false);
                    }}
                  >
                    เรียงตามชื่อ ก-ฮ
                  </button>
                  <button
                    className={`block w-full text-left px-4 py-2 text-sm ${sortOrder === 'nameDesc' ? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:bg-gray-50'}`}
                    onClick={() => {
                      setSortOrder('nameDesc');
                      setSortMenuOpen(false);
                    }}
                  >
                    เรียงตามชื่อ ฮ-ก
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Filter Button */}
          <button
            className="p-2 hover:bg-gray-100 rounded-full"
            onClick={handleOpenFilterModal}
            aria-label="Open filters"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Filter Tags */}
      <div className="px-6 pb-2 min-h-[36px]">
        {activeFilterTags.length > 0 ? (
          <div className="flex flex-wrap items-center">
            {activeFilterTags.map(({ category, label }) => (
              <FilterTag
                key={`${category}-${label}`}
                category={category}
                label={label}
                onRemove={handleRemoveFilterTag}
              />
            ))}
            <button
              onClick={handleClearFilters}
              className="text-sm text-red-600 hover:text-red-800 underline mb-2 ml-2"
            >
              ล้างทั้งหมด
            </button>
          </div>
        ) : (
          <div className="flex flex-wrap">
            <div className="inline-flex items-center bg-gray-100 rounded-full px-3 py-1 text-sm mr-2 mb-2 text-gray-600">
              แสดงทั้งหมด
            </div>
          </div>
        )}
      </div>

      {/* Content Display */}
      <div className="flex-1 overflow-y-auto px-6">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-800"></div>
          </div>
        ) : error ? (
          <ErrorDisplay message={error} />
        ) : currentDrugs.length > 0 ? (
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-3 gap-y-6 mb-4">
            {currentDrugs.map(drug => (
              <DrugCard
                key={drug.id}
                drug={drug}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-gray-500">
            ไม่พบรายการที่ตรงกับตัวกรองของคุณ
          </div>
        )}
      </div>

      {/* Bottom Pagination */}
      <div className="px-6 py-2 border-t">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          totalItems={sortedDrugs.length}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleItemsPerPageChange}
        />
      </div>
    </div>
  );

  // Mobile Layout Component
  const MobileLayout = () => (
    <div className='h-full w-full bg-[#F8F9FA] flex flex-col overflow-hidden'>
      {/* Header Mobile */}
      <div className="px-4 py-3 flex justify-between items-center flex-shrink-0">
        <div>
          <h1 className='text-xl font-bold'>ยาเสพติด</h1>
          <p className='text-xs text-gray-600'>ค้นพบ {sortedDrugs.length} รายการ</p>
        </div>
        <div className='flex items-center space-x-2'>
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-full text-gray-600"
            aria-label="Go back"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Filter Button */}
          <button
            className="p-2 hover:bg-gray-100 rounded-full"
            onClick={handleOpenFilterModal}
            aria-label="Open filters"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Filter Tags mobile */}
      <div className="px-4 pb-2">
        {activeFilterTags.length > 0 && (
          <div className="flex flex-wrap">
            {activeFilterTags.map(({ category, label }) => (
              <FilterTag
                key={`${category}-${label}`}
                category={category}
                label={label}
                onRemove={handleRemoveFilterTag}
              />
            ))}
            {activeFilterTags.length > 0 && (
              <button
                onClick={handleClearFilters}
                className="text-sm text-red-600 hover:text-red-800 underline mb-2"
              >
                ล้างตัวกรองทั้งหมด
              </button>
            )}
          </div>
        )}

        {/* Show "All" tag */}
        {activeFilterTags.length === 0 && (
          <div className="flex flex-wrap">
            <FilterTag label="ทั้งหมด" />
          </div>
        )}
      </div>

      {/* Content Display */}
      <div className="flex-1 overflow-y-auto px-4">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-red-800"></div>
          </div>
        ) : error ? (
          <ErrorDisplay message={error} />
        ) : currentDrugs.length > 0 ? (
          <div className="grid grid-cols-2 gap-x-2 gap-y-4 mb-4">
            {currentDrugs.map(drug => (
              <DrugCard
                key={drug.id}
                drug={drug}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-gray-500">
            ไม่พบรายการที่ตรงกับตัวกรองของคุณ
          </div>
        )}
      </div>

      {/* Bottom Pagination */}
      <div className="px-4 py-3 border-t mb-16 bg-white">
        {(totalPages > 1 || sortedDrugs.length > itemsPerPage) && (
          <MobilePagination
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            totalItems={sortedDrugs.length}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
          />
        )}
      </div>
    </div>
  );

  return (
    <>
      {isMobileView ? <MobileLayout /> : <DesktopLayout />}

      {/* Filter Modal - Shared between layouts */}
      <FilterModal
        isOpen={isFilterOpen}
        onClose={handleCloseFilterModal}
        filters={filters}
        tempFilters={tempFilters}
        onFilterChange={handleTempFilterChange}
        onApplyFilter={handleApplyFilter}
        onClearFilters={handleClearFilters}
        drugs={drugs}
      />
    </>
  );
};

export default DrugCatalog;
