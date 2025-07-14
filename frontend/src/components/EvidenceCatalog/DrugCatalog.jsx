import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiConfig } from '../../config/api';

const DrugCard = ({ drug }) => {
  return (
    <Link to={`/selectCatalogType/drugs-catalog/drug-profile/${drug.id}`} >
      <div className="bg-white rounded-lg shadow-sm p-3 flex flex-col items-center hover:shadow-md transition-shadow h-[280px] max-w-[210px] mx-auto w-full">
        <div className="w-28 h-28 mb-4">
          <img
            src={drug.image}
            alt={drug.title}
            className="w-full h-full object-contain rounded-full"
          />
        </div>
        <div className="w-full flex-1 flex flex-col">
          <h3 className="font-semibold text-base mb-2 text-left line-clamp-2">{drug.title}</h3>
          <p className="text-gray-600 text-sm text-left line-clamp-3">{drug.description}</p>
        </div>
      </div>
    </Link>
  );
};

// Filter Modal Component - Added more horizontal padding for mobile
const FilterModal = ({ isOpen, onClose, filters, tempFilters, onFilterChange, onApplyFilter, onClearFilters }) => {
  if (!isOpen) return null;

  const handleCheckboxChange = (type) => {
    onFilterChange(type);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md relative">
        {/* Close Button - Now just closes without saving */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 className="text-xl font-bold text-center mb-6">เลือกตัวกรองผลลัพธ์</h2>

        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">ประเภท</h3>

          <div className="grid grid-cols-2 gap-4">
            {Object.entries(tempFilters).map(([type, isChecked]) => (
              <div key={type} className="flex items-center">
                <input
                  type="checkbox"
                  id={type}
                  checked={isChecked}
                  onChange={() => handleCheckboxChange(type)}
                  className="w-5 h-5 mr-2"
                />
                <label htmlFor={type} className="text-base">{type}</label>
              </div>
            ))}
          </div>
        </div>

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
  );
};

// Filter Tag Component
const FilterTag = ({ label, onRemove }) => {
  return (
    <div className="inline-flex items-center bg-gray-100 rounded-full px-3 py-1 text-sm mr-2 mb-2">
      <span className="mr-1">{label}</span>
      {onRemove && (
        <button
          onClick={onRemove}
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

// Updated Pagination Component with all navigation buttons
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
        {pageNumbers.map(number => (
          <button
            key={number}
            onClick={() => onPageChange(number)}
            className={`mx-0.5 px-2.5 py-0.5 rounded-sm text-sm ${currentPage === number ? 'bg-red-800 text-white' : 'text-gray-700 hover:bg-gray-200'}`}
          >
            {number}
          </button>
        ))}

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

  return (
    <div className="flex justify-between items-center w-full">
      {/* Items per page selector - Left side */}
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

      {/* Page navigation - Right side */}
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

        {pageNumbers.map(number => (
          <button
            key={number}
            onClick={() => onPageChange(number)}
            className={`mx-0.5 px-2 py-0.5 rounded-sm text-xs ${currentPage === number ? 'bg-red-800 text-white' : 'text-gray-700 hover:bg-gray-200'}`}
          >
            {number}
          </button>
        ))}

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

// Note: Removed 'onReturn' prop as it's no longer used by the back buttons
const DrugCatalog = () => {
    const navigate = useNavigate();
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [sortOrder, setSortOrder] = useState('default');
    const [sortMenuOpen, setSortMenuOpen] = useState(false);
    
    // Add loading and error states
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    // Store API data
    const [narcotics, setNarcotics] = useState([]);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(20);

    // Available filter types based on your data
    const [filters, setFilters] = useState({
      'ยาบ้า': false,
      'ยาอี': false,
      'เคตามีน': false,
      'โคเคน': false,
      'เฮโรอีน': false,
      'พืชเสพติด': false,
      'สารผสม': false,
      'วัตถุออกฤทธิ์อื่นๆ': false,
    });

    // Temporary filters used in the modal
    const [tempFilters, setTempFilters] = useState({...filters});

    // Fetch narcotics data from API
    useEffect(() => {
        const fetchNarcotics = async () => {
            setIsLoading(true);
            setError(null);
            
            try {
                const response = await fetch(`${apiConfig.baseUrl}/api/narcotics`);
                
                if (!response.ok) {
                    throw new Error(`API Error: ${response.status}`);
                }
                
                const data = await response.json();
                setNarcotics(data);
            } catch (err) {
                console.error('Error fetching narcotics:', err);
                setError('ไม่สามารถโหลดข้อมูลยาเสพติดได้');
            } finally {
                setIsLoading(false);
            }
        };
        
        fetchNarcotics();
    }, []);

    // Transform API data to match component format
    const drugs = narcotics.map(narcotic => ({
        id: narcotic.id,
        // Use the first example image if available, or placeholder
        image: narcotic.example_images && narcotic.example_images.length > 0 
            ? narcotic.example_images[0].image_url 
            : "/Img/ยาเสพติด/placeholder.png",
        title: narcotic.drug_type || "ไม่ระบุชื่อ",
        description: `ประเภท: ${narcotic.drug_category || "ไม่ระบุ"}`,
        type: mapDrugTypeToFilter(narcotic.drug_category),
        // Add other fields you might need
        formName: narcotic.drug_form?.name,
        characteristics: narcotic.characteristics,
        consumption_method: narcotic.consumption_method,
        effect: narcotic.effect,
        weight: narcotic.weight_grams,
        pill_info: narcotic.pill_info
    }));

    // Helper function to map API drug categories to your filter categories
    function mapDrugTypeToFilter(category) {
        // Map the API's drug_category values to your filter categories
        // Adjust this mapping based on your actual data
        const categoryMap = {
            'stimulant': 'ยาบ้า',
            'marijuana': 'พืชเสพติด',
            'ketamine': 'เคตามีน',
            'cocaine': 'โคเคน',
            'heroin': 'เฮโรอีน',
            'mixed': 'สารผสม',
            'ecstasy': 'ยาอี',
            // Add more mappings as needed
        };
        
        return categoryMap[category] || 'วัตถุออกฤทธิ์อื่นๆ';
    }

    // Filter drug list based on selected filters
    const getFilteredDrugs = () => {
        // If loading or error, return empty array
        if (isLoading || error) return [];
      
        // If no filters are selected, show all drugs
        const areAnyFiltersSelected = Object.values(filters).some(value => value);

        if (!areAnyFiltersSelected) {
            return drugs;
        }

        // Return drugs that match selected filter types
        return drugs.filter(drug => {
            const drugType = drug.type;
            return filters[drugType];
        });
    };

    // Sort the drug list
    const getSortedDrugs = (filteredDrugs) => {
      switch (sortOrder) {
        case 'nameAsc':
          return [...filteredDrugs].sort((a, b) => a.title.localeCompare(b.title, 'th'));
        case 'nameDesc':
          return [...filteredDrugs].sort((a, b) => b.title.localeCompare(a.title, 'th'));
        default:
          return filteredDrugs;
      }
    };

    // Get filtered and sorted drugs
    const filteredDrugs = getFilteredDrugs();
    const sortedDrugs = getSortedDrugs(filteredDrugs);

    // Pagination: Get current page drugs
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
        // Scroll to top of the page when changing pages
        window.scrollTo(0, 0);
    };

    // Handle change in items per page
    const handleItemsPerPageChange = (number) => {
        setItemsPerPage(number);
        setCurrentPage(1); // Reset to first page
    };

    // Get active filter tags
    const getActiveFilterTags = () => {
      return Object.entries(filters)
        .filter(([_, isChecked]) => isChecked)
        .map(([type]) => type);
    };

    const activeFilterTags = getActiveFilterTags();

    // Handle temporary filter checkbox changes (in modal)
    const handleTempFilterChange = (type) => {
      setTempFilters({
        ...tempFilters,
        [type]: !tempFilters[type]
      });
    };

    // Apply filters and close modal
    const handleApplyFilter = () => {
      setFilters({...tempFilters});
      setIsFilterOpen(false);
    };

    // Clear all filters and close modal
    const handleClearFilters = () => {
      const resetFilters = {};
      Object.keys(filters).forEach(key => {
        resetFilters[key] = false;
      });
      setTempFilters(resetFilters);
      setFilters(resetFilters);
      setIsFilterOpen(false);
    };

    // Remove a single filter tag
    const handleRemoveFilterTag = (type) => {
      const newFilters = {...filters, [type]: false};
      setFilters(newFilters);
      setTempFilters(newFilters);
    };

    // Open filter modal and initialize temp filters with current filters
    const handleOpenFilterModal = () => {
      setTempFilters({...filters});
      setIsFilterOpen(true);
    };

    // Close filter modal without applying changes
    const handleCloseFilterModal = () => {
      setIsFilterOpen(false);
      // Reset temp filters to match current filters (discard changes)
      setTempFilters({...filters});
    };

    // Toggle sort menu
    const handleToggleSortMenu = () => {
      setSortMenuOpen(!sortMenuOpen);
    };

    // Add function to determine if device is mobile
    const isMobile = () => {
        // Basic check for window width, adjust breakpoint as needed
        // Use state to track this for re-renders if the window resizes significantly
        const [width, setWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 0);

        useEffect(() => {
          if (typeof window === 'undefined') return;

          const handleResize = () => setWidth(window.innerWidth);
          window.addEventListener('resize', handleResize);
          return () => window.removeEventListener('resize', handleResize);
        }, []);

        return width <= 768; // 768px is a common breakpoint for tablets/mobile
    };

    const isMobileDevice = isMobile(); // Call the hook


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

                    {/* Sort Button with Dropdown */}
                    <div className="relative">
                        <button
                            className="p-2 hover:bg-gray-100 rounded-full"
                            onClick={handleToggleSortMenu}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                            </svg>
                        </button>

                        {sortMenuOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                                <div className="py-1">
                                    <button
                                        className={`block px-4 py-2 text-sm w-full text-left ${sortOrder === 'nameAsc' ? 'bg-gray-100' : ''}`}
                                        onClick={() => {
                                            setSortOrder('nameAsc');
                                            setSortMenuOpen(false);
                                        }}
                                    >
                                        เรียงตามชื่อ A-Z
                                    </button>
                                    <button
                                        className={`block px-4 py-2 text-sm w-full text-left ${sortOrder === 'nameDesc' ? 'bg-gray-100' : ''}`}
                                        onClick={() => {
                                            setSortOrder('nameDesc');
                                            setSortMenuOpen(false);
                                        }}
                                    >
                                        เรียงตามชื่อ Z-A
                                    </button>
                                    <button
                                        className={`block px-4 py-2 text-sm w-full text-left ${sortOrder === 'default' ? 'bg-gray-100' : ''}`}
                                        onClick={() => {
                                            setSortOrder('default');
                                            setSortMenuOpen(false);
                                        }}
                                    >
                                        ค่าเริ่มต้น
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Filter Button */}
                    <button
                        className="p-2 hover:bg-gray-100 rounded-full"
                        onClick={handleOpenFilterModal}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Filter Tags */}
            {activeFilterTags.length > 0 && (
                <div className="px-6 pb-2">
                    <div className="flex flex-wrap">
                        {activeFilterTags.map((tag) => (
                            <FilterTag
                                key={tag}
                                label={tag}
                                onRemove={() => handleRemoveFilterTag(tag)}
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
                </div>
            )}

            {/* Show "All" tag if no filters are selected */}
            {activeFilterTags.length === 0 && (
                <div className="px-6 pb-2">
                    <div className="flex flex-wrap">
                        <FilterTag label="ทั้งหมด" />
                    </div>
                </div>
            )}

            {/* Catalog List */}
            <div className="flex-1 overflow-y-auto px-6">
                {isLoading ? (
                    <div className="flex-1 flex justify-center items-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-800"></div>
                        <span className="ml-3 text-gray-600">กำลังโหลดข้อมูล...</span>
                    </div>
                ) : error ? (
                    <div className="flex-1 flex justify-center items-center">
                        <div className="text-red-600 text-center">
                            <p className="text-xl mb-2">เกิดข้อผิดพลาด</p>
                            <p>{error}</p>
                            <button 
                                onClick={() => window.location.reload()} 
                                className="mt-4 px-4 py-2 bg-red-800 text-white rounded-lg hover:bg-red-900"
                            >
                                ลองใหม่อีกครั้ง
                            </button>
                        </div>
                    </div>
                ) : currentDrugs.length === 0 ? (
                    <div className="flex-1 flex justify-center items-center">
                        <div className="text-gray-600 text-center">
                            <p className="text-xl mb-2">ไม่พบข้อมูลยาเสพติด</p>
                            <p>ไม่พบข้อมูลที่ตรงกับเงื่อนไขการค้นหา</p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-3 gap-y-6 mb-4">
                        {currentDrugs.map(drug => (
                            <DrugCard
                                key={drug.id}
                                drug={drug}
                            />
                        ))}
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
            {/* Header - Simplified for mobile */}
            <div className="px-4 py-3 flex justify-between items-center flex-shrink-0">
                <div>
                    <h1 className='text-xl font-bold'>ยาเสพติด</h1>
                    <p className='text-xs text-gray-600'>ค้นพบ {sortedDrugs.length} รายการ</p>
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
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Filter Tags - Adjusted padding for mobile */}
            <div className="px-4 pb-2">
                {activeFilterTags.length > 0 && (
                    <div className="flex flex-wrap">
                        {activeFilterTags.map((tag) => (
                            <FilterTag
                                key={tag}
                                label={tag}
                                onRemove={() => handleRemoveFilterTag(tag)}
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

                {/* Show "All" tag if no filters are selected */}
                {activeFilterTags.length === 0 && (
                    <div className="flex flex-wrap">
                        <FilterTag label="ทั้งหมด" />
                    </div>
                )}
            </div>

            {/* Catalog List - 2 columns for mobile with adjusted spacing */}
            <div className="flex-1 overflow-y-auto px-4">
                {isLoading ? (
                    <div className="flex-1 flex justify-center items-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-800"></div>
                        <span className="ml-3 text-gray-600">กำลังโหลดข้อมูล...</span>
                    </div>
                ) : error ? (
                    <div className="flex-1 flex justify-center items-center">
                        <div className="text-red-600 text-center">
                            <p className="text-xl mb-2">เกิดข้อผิดพลาด</p>
                            <p>{error}</p>
                            <button 
                                onClick={() => window.location.reload()} 
                                className="mt-4 px-4 py-2 bg-red-800 text-white rounded-lg hover:bg-red-900"
                            >
                                ลองใหม่อีกครั้ง
                            </button>
                        </div>
                    </div>
                ) : currentDrugs.length === 0 ? (
                    <div className="flex-1 flex justify-center items-center">
                        <div className="text-gray-600 text-center">
                            <p className="text-xl mb-2">ไม่พบข้อมูลยาเสพติด</p>
                            <p>ไม่พบข้อมูลที่ตรงกับเงื่อนไขการค้นหา</p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-x-2 gap-y-4 mb-4">
                        {currentDrugs.map(drug => (
                            <DrugCard
                                key={drug.id}
                                drug={drug}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Bottom Pagination - Updated with new layout */}
            <div className="px-4 py-3 border-t mb-16 bg-white"> {/* Adjust mb-16 if needed based on fixed bottom navigation */}
                <MobilePagination
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

    // Render appropriate layout based on screen size
    return (
        <>
            {isMobileDevice ? <MobileLayout /> : <DesktopLayout />}

            {/* Filter Modal - Shared between layouts */}
            <FilterModal
                isOpen={isFilterOpen}
                onClose={handleCloseFilterModal}
                filters={filters}
                tempFilters={tempFilters}
                onFilterChange={handleTempFilterChange}
                onApplyFilter={handleApplyFilter}
                onClearFilters={handleClearFilters}
            />
        </>
    );
}

export default DrugCatalog;