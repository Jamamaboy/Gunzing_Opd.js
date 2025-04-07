import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const GunCard = ({ gun }) => {

  return (
    <Link to={`/selectCatalogType/guns-catalog/gun-profile/${gun.id}`} className="bg-white rounded-lg shadow-sm p-3 flex flex-col items-center hover:shadow-md transition-shadow h-[280px] max-w-[210px] mx-auto w-full">
      <div className="w-28 h-28 mb-4">
        <img
          src={Array.isArray(gun.image) ? gun.image[0] : gun.image}
          alt={`${gun.brand} ${gun.model}`}
          className="w-full h-full object-contain"
        />
      </div>
      <div className="w-full flex-1 flex flex-col">
        <h3 className="font-semibold text-base mb-2 text-left line-clamp-2">{gun.brand} {gun.model}</h3>
        <p className="text-sm text-gray-600 text-left line-clamp-2">ยี่ห้อ: {gun.brand}</p>
        <p className="text-sm text-gray-600 text-left line-clamp-2">รุ่น: {gun.model}</p>
        <p className="text-sm text-gray-600 text-left line-clamp-2">ประเภท: {gun.categories}</p>
      </div>
    </Link>
  );
};

// Filter Modal Component
const FilterModal = ({ isOpen, onClose, filters, tempFilters, onFilterChange, onApplyFilter, onClearFilters, guns }) => {
  if (!isOpen) return null;

  // State for dropdown sections
  const [openSections, setOpenSections] = useState({
    types: true,
    brands: false,
    models: false
  });

    // Get available brands based on selected types
    const getAvailableBrands = () => {
        const selectedTypes = Object.entries(tempFilters.types)
          .filter(([_, isChecked]) => isChecked)
          .map(([type]) => type);

        // If no type selected, show all brands relevant to the data
        if (selectedTypes.length === 0) {
          const allBrands = {};
          guns.forEach(gun => { allBrands[gun.brand] = true; });
          return allBrands;
        }

        const availableBrands = {};
        guns.forEach(gun => {
          if (selectedTypes.includes(gun.categories)) {
            availableBrands[gun.brand] = true;
          }
        });
        return availableBrands;
      };

    // Get available models based on selected types and brands
    const getAvailableModels = () => {
        const selectedTypes = Object.entries(tempFilters.types)
            .filter(([_, isChecked]) => isChecked)
            .map(([type]) => type);
        const selectedBrands = Object.entries(tempFilters.brands)
            .filter(([_, isChecked]) => isChecked)
            .map(([brand]) => brand);

        const typeFilterActive = selectedTypes.length > 0;
        const brandFilterActive = selectedBrands.length > 0;

        // If no relevant filters applied, show all models
        if (!typeFilterActive && !brandFilterActive) {
            const allModels = {};
            guns.forEach(gun => { allModels[gun.model] = gun.brand; });
            return allModels;
        }

        const availableModels = {};
        guns.forEach(gun => {
            const typeMatch = !typeFilterActive || selectedTypes.includes(gun.categories);
            const brandMatch = !brandFilterActive || selectedBrands.includes(gun.brand);
            if (typeMatch && brandMatch) {
                availableModels[gun.model] = gun.brand;
            }
        });
        return availableModels;
    };

  const availableBrands = getAvailableBrands();
  const availableModels = getAvailableModels();

  const toggleSection = (section) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Function to check if any type filter is active
  const isAnyTypeSelected = () => Object.values(tempFilters.types).some(v => v);
  // Function to check if any brand filter is active
  const isAnyBrandSelected = () => Object.values(tempFilters.brands).some(v => v);


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
              <span>ประเภทปืน</span>
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

          {/* Brands Section */}
          <div className="mb-6">
            <button
              onClick={() => toggleSection('brands')}
              className="w-full flex justify-between items-center text-lg font-semibold mb-3"
            >
              <span>ยี่ห้อปืน</span>
              <svg
                className={`w-5 h-5 transform transition-transform ${openSections.brands ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
             {openSections.brands && (
                 <div className="grid grid-cols-3 gap-4">
                     {Object.entries(tempFilters.brands).map(([brand, isChecked]) => {
                         const isAvailable = !isAnyTypeSelected() || availableBrands[brand];
                         return (
                             <div key={brand} className={`flex items-center ${!isAvailable ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                 <input
                                     type="checkbox"
                                     id={`brand-${brand}`}
                                     checked={isChecked && isAvailable}
                                     onChange={() => onFilterChange('brands', brand)}
                                     disabled={!isAvailable}
                                     className="w-5 h-5 mr-2"
                                 />
                                 <label
                                     htmlFor={`brand-${brand}`}
                                     className={`text-base ${!isAvailable ? 'text-gray-400' : ''}`}
                                 >
                                     {brand}
                                 </label>
                             </div>
                         );
                     })}
                 </div>
             )}
          </div>

          {/* Models Section */}
          <div className="mb-6">
            <button
              onClick={() => toggleSection('models')}
              className="w-full flex justify-between items-center text-lg font-semibold mb-3"
            >
              <span>รุ่นปืน</span>
              <svg
                className={`w-5 h-5 transform transition-transform ${openSections.models ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
             {openSections.models && (
                 <div className="grid grid-cols-3 gap-4">
                     {Object.entries(tempFilters.models).map(([model, isChecked]) => {
                         const brandContext = availableModels[model];
                         const isAvailable = (!isAnyTypeSelected() && !isAnyBrandSelected()) || brandContext;
                         return (
                             <div key={model} className={`flex items-center ${!isAvailable ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                 <input
                                     type="checkbox"
                                     id={`model-${model}`}
                                     checked={isChecked && isAvailable}
                                     onChange={() => onFilterChange('models', model)}
                                     disabled={!isAvailable}
                                     className="w-5 h-5 mr-2"
                                 />
                                 <label
                                     htmlFor={`model-${model}`}
                                     className={`text-base ${!isAvailable ? 'text-gray-400' : ''}`}
                                 >
                                     {model} {brandContext && `(${brandContext})`}
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
      case 'brands': return 'ยี่ห้อ';
      case 'models': return 'รุ่น';
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

// Pagination Component
const Pagination = ({ currentPage, totalPages, itemsPerPage, totalItems, onPageChange, onItemsPerPageChange }) => {
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

  // ไม่แสดง pagination ถ้ามีหน้าเดียว
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

const GunCatalog = () => {
    const navigate = useNavigate();
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [sortOrder, setSortOrder] = useState('default');
    const [sortMenuOpen, setSortMenuOpen] = useState(false);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(20);

    // *** filter state ***
    const [filters, setFilters] = useState({
      types: {
        'ปืนพก': false,
        'ปืนลูกซอง': false,
        'ปืนไรเฟิล': false,
        'ปืนกล': false,
      },
      brands: {
        'CZ': false,
        'Sig Sauer': false,
        'Walther': false,
        'Baretta': false,
        'Norinco': false,
        'Browning': false,
        'Smith & Wesson': false,
        'Hellcat': false,
         'Glock': false,
         'Remington': false,
         'Colt': false,
         'FN Herstal': false,
         'Mossberg': false,
         'Heckler & Koch': false,
         'Ruger': false,
         'Springfield Armory': false,
         'Beretta': false,
         'Benelli': false,
         'Accuracy International': false,
         'Uzi': false,
         'Taurus': false,
         'Kel-Tec': false,
         'Steyr': false,
         'Canik': false,
         'IWI': false,
      },
      models: {
        '75 Compact': false,
        'P238': false,
        'P938': false,
        'PPK-S': false,
        '92FS': false,
        'Type 54': false,
        'M1919A4': false,
        '1911-A1': false,
        'P229': false,
        'P320': false,
        '5906': false,
        'Hi-Power': false,
        'Hellcat': false,
         'G17': false,
         '870': false,
         'M4 Carbine': false,
         'M249 SAW': false,
         '590': false,
         'MP5': false,
         '10/22': false,
         'G19': false,
         'M4 Super 90': false,
         'AWP': false,
         'Uzi': false,
         'G2C': false,
         'KSG': false,
         'AUG': false,
         'PMX': false,
         'TP9': false,
         'Tavor': false,
         'FN 509': false,
      }
    });

    // *** tempFilters ***
    const [tempFilters, setTempFilters] = useState(JSON.parse(JSON.stringify(filters)));

    // *** mock data ***
     const gunsData = [
      {
        id: 1,
        image: [
          "https://static.wixstatic.com/media/f286bf_9d13fdc2ef8e438991b58a73ead19e55~mv2.png/v1/fill/w_479,h_348,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/f286bf_9d13fdc2ef8e438991b58a73ead19e55~mv2.png"
        ],
        brand: "CZ",
        model: "75 Compact",
        categories: "ปืนพก",
        caliber: ["9×19mm", "9×21mm", ".40"]
      },
      {
        id: 2,
        image: [
          "https://cdn11.bigcommerce.com/s-5hxmzx4c0g/images/stencil/1280x1280/products/3026/5586/182810499__08075.1731447312.png?c=1"
        ],
        brand: "Sig Sauer",
        model: "P238",
        categories: "ปืนพก",
        caliber: [".380"]
      },
      {
        id: 3,
        image: [
          "https://gatguns.com/wp-content/uploads/2024/02/21/04/149535942.png"
        ],
        brand: "Sig Sauer",
        model: "P938",
        categories: "ปืนพก",
        caliber: ["9×19mm"]
      },
      {
        id: 4,
        image: [
          "https://cdn-kjbpd.nitrocdn.com/KOiIhGPzDJkSJKnCKPSJhBthcBpONUgG/assets/images/optimized/rev-7fad56e/1shotguns.com/app/uploads/2023/11/Walther_PPKs-Black_LS_4796006.png"
        ],
        brand: "Walther",
        model: "PPK-S",
        categories: "ปืนพก",
        caliber: [".380", "7.65×17mm (.32)"]
      },
      {
        id: 5,
        image: [
          "https://firepower.ph/cdn/shop/products/Beretta92FSweb.png?v=1633870514"
        ],
        brand: "Beretta",
        model: "92FS",
        categories: "ปืนพก",
        caliber: ["9×19mm"]
      },
      {
        id: 6,
        image: [
          "https://www.cashmyguns.com/wp-content/uploads/Norinco-54.png"
        ],
        brand: "Norinco",
        model: "Type 54",
        categories: "ปืนพก",
        caliber: ["7.62×25mm"]
      },
      {
        id: 7,
        image: [
          "https://images.guns.com/prod/2022/01/18/61e675570be70d2f7305b38f5cd669a125a1195431489.png"
        ],
        brand: "Browning",
        model: "Hi-Power",
        categories: "ปืนพก",
        caliber: ["9×19mm", ".40"]
      },
      {
        id: 8,
        image: [
          "https://espineli-defense.sgp1.cdn.digitaloceanspaces.com/a3b94dfb30491bfc0a28e029eeaac22a.png"
        ],
        brand: "Norinco",
        model: "1911-A1",
        categories: "ปืนพก",
        caliber: [".45"]
      },
      {
        id: 9,
        image: [
          "https://cdn-ilceald.nitrocdn.com/pNjqylSKBCOWgLPOVVDUMNambdhEGnWP/assets/images/optimized/rev-47b33d8/bandookwala.com.pk/wp-content/uploads/2024/11/image-15-1-min.png"
        ],
        brand: "Sig Sauer",
        model: "P229",
        categories: "ปืนพก",
        caliber: ["9×19mm", ".357", ".40"]
      },
      {
        id: 10,
        image: [
          "https://assets.basspro.com/image/list/fn_select:jq:first(.%5B%5D%7Cselect(.public_id%20%7C%20endswith(%22main%22)))/4829823.json"
        ],
        brand: "Sig Sauer",
        model: "P320",
        categories: "ปืนพก",
        caliber: ["9×19mm", ".357", ".40", ".45"]
      },
      {
        id: 11,
        image: [
          "https://loterkft.hu/wp-content/uploads/2016/04/sw_5906-1-600x600.png"
        ],
        brand: "Smith & Wesson",
        model: "5906",
        categories: "ปืนพก",
        caliber: ["9×19mm"]
      },
      {
        id: 12,
        image: [
          "https://gununiversity.com/wp-content/uploads/2021/01/Hellcat.png"
        ],
        brand: "Springfield Armory",
        model: "Hellcat",
        categories: "ปืนพก",
        caliber: ["9×19mm"]
      },
        ...Array.from({ length: 30 }, (_, i) => ({
            id: 13 + i,
            image: [ "https://gununiversity.com/wp-content/uploads/2021/01/Hellcat.png" ],
            brand: `รายการที่ ${13 + i}`,
            model: `รุ่น ${13 + i}`,
            categories: ["ปืนพก", "ปืนลูกซอง", "ปืนไรเฟิล"][Math.floor(Math.random() * 3)],
            caliber: ["9×19mm"]
        }))
    ];
     // *** สร้าง state guns จาก gunsData ***
     const [guns, setGuns] = useState(gunsData);

    // *** getFilteredguns function ***
    const getFilteredguns = () => {
      const areAnyFiltersSelected = Object.values(filters).some(category =>
        Object.values(category).some(value => value)
      );

      if (!areAnyFiltersSelected) {
        return guns;
      }

      return guns.filter(gun => {
        // Check type filter
        const typeFilterActive = Object.values(filters.types).some(v => v);
        const matchesType = !typeFilterActive || filters.types[gun.categories];

        // Check brand filter
        const brandFilterActive = Object.values(filters.brands).some(v => v);
        const matchesBrand = !brandFilterActive || filters.brands[gun.brand];

        // Check model filter
        const modelFilterActive = Object.values(filters.models).some(v => v);
        const matchesModel = !modelFilterActive || filters.models[gun.model];

        // match all active filters
        return matchesType && matchesBrand && matchesModel;
      });
    };

    // *** getSortedguns function ***
    const getSortedguns = (filteredguns) => {
      switch (sortOrder) {
        case 'nameAsc':
          return [...filteredguns].sort((a, b) => (a?.brand ?? '').localeCompare(b?.brand ?? '', 'th'));
        case 'nameDesc':
          return [...filteredguns].sort((a, b) => (b?.brand ?? '').localeCompare(a?.brand ?? '', 'th'));
        default:
          return filteredguns;
      }
    };

    // Get filtered and sorted guns
    const filteredguns = getFilteredguns();
    const sortedguns = getSortedguns(filteredguns);

    // Pagination: Get current page guns
    const indexOfLastgun = currentPage * itemsPerPage;
    const indexOfFirstgun = indexOfLastgun - itemsPerPage;
    const currentguns = sortedguns.slice(indexOfFirstgun, indexOfLastgun);
    const totalPages = Math.ceil(sortedguns.length / itemsPerPage);

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

    // *** getActiveFilterTags function ***
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

    // *** handleTempFilterChange function ***
     const handleTempFilterChange = (category, key) => {
         const newTempFilters = JSON.parse(JSON.stringify(tempFilters));
         newTempFilters[category][key] = !newTempFilters[category][key];

         setTempFilters(newTempFilters);
     };

    // *** handleRemoveFilterTag function ***
     const handleRemoveFilterTag = (category, label) => {
       const newFilters = JSON.parse(JSON.stringify(filters));
       if (newFilters[category] && newFilters[category][label] !== undefined) {
         newFilters[category][label] = false;
       }
       setFilters(newFilters);
       setTempFilters(JSON.parse(JSON.stringify(newFilters)));
     };


    // *** handleClearFilters function ***
     const handleClearFilters = () => {
       const resetFilters = {
         types: Object.fromEntries(Object.keys(filters.types || {}).map(key => [key, false])),
         brands: Object.fromEntries(Object.keys(filters.brands || {}).map(key => [key, false])),
         models: Object.fromEntries(Object.keys(filters.models || {}).map(key => [key, false]))
       };
       setTempFilters(resetFilters);
       setFilters(resetFilters);
       setIsFilterOpen(false);
     };


    // *** handleOpenFilterModal function ***
     const handleOpenFilterModal = () => {
       setTempFilters(JSON.parse(JSON.stringify(filters)));
       setIsFilterOpen(true);
     };


    // *** handleCloseFilterModal function ***
     const handleCloseFilterModal = () => {
       setIsFilterOpen(false);
     };


    // *** handleApplyFilter ***
     const handleApplyFilter = () => {
       setFilters(JSON.parse(JSON.stringify(tempFilters))); // Apply the temp filters (deep copy)
       setIsFilterOpen(false);
     };


    // Toggle sort menu
    const handleToggleSortMenu = () => {
      setSortMenuOpen(!sortMenuOpen);
    };

    // Determine if device is mobile
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
                    <h1 className='text-2xl font-bold'>อาวุธปืน</h1>
                    <p className='text-sm text-gray-600'>ค้นพบ {sortedguns.length} รายการ</p>
                </div>
                <div className='flex items-center space-x-2'>
                     {/* ===== ปุ่ม Back ===== */}
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

            {/* Catalog List */}
            <div className="flex-1 overflow-y-auto px-6">
                 {currentguns.length > 0 ? (
                      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-3 gap-y-6 mb-4">
                          {currentguns.map(gun => (
                              <GunCard
                                  key={gun.id}
                                  gun={gun}
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
                      totalItems={sortedguns.length}
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
                    <h1 className='text-xl font-bold'>อาวุธปืน</h1>
                    <p className='text-xs text-gray-600'>ค้นพบ {sortedguns.length} รายการ</p>
                </div>
                <div className='flex items-center space-x-2'>
                    {/* ===== ปุ่ม Back ===== */}
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

            {/* Catalog List */}
            <div className="flex-1 overflow-y-auto px-4">
                 {currentguns.length > 0 ? (
                     <div className="grid grid-cols-2 gap-x-2 gap-y-4 mb-4">
                         {currentguns.map(gun => (
                             <GunCard
                                 key={gun.id}
                                 gun={gun}
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
                 {(totalPages > 1 || sortedguns.length > itemsPerPage) && (
                     <MobilePagination
                         currentPage={currentPage}
                         totalPages={totalPages}
                         itemsPerPage={itemsPerPage}
                         totalItems={sortedguns.length}
                         onPageChange={handlePageChange}
                         onItemsPerPageChange={handleItemsPerPageChange}
                     />
                  )}
             </div>
        </div>
    );

    // Render
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
                guns={guns}
            />
        </>
    );
}

export default GunCatalog;