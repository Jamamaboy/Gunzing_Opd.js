import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useFirearms } from '../../hooks/useFirearms';
import GunCard from './GunCard';
import FilterModal from './FilterModal';
import FilterTag from './FilterTag';
import Pagination from './Pagination';

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

const getUniqueOptions = (guns, key) => {
    const set = new Set();
    guns.forEach(gun => {
        if (gun[key]) set.add(gun[key]);
    });
    return Array.from(set);
};

const GunCatalog = () => {
    const navigate = useNavigate();
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [sortOrder, setSortOrder] = useState('default');
    const [sortMenuOpen, setSortMenuOpen] = useState(false);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(20);

    // *** ใช้ hook แทน state และ useEffect เดิม ***
    const { guns, loading, error } = useFirearms();

    // *** dynamic filter options ***
    const [filterOptions, setFilterOptions] = useState({
        types: [],
        brands: [],
        models: [],
        mechanisms: [],
    });

    // *** filters state ***
    const [filters, setFilters] = useState({ types: {}, brands: {}, models: {}, mechanisms: {} });
    const [tempFilters, setTempFilters] = useState({ types: {}, brands: {}, models: {}, mechanisms: {} });

    // *** สร้าง filter options เมื่อ guns เปลี่ยน ***
    useEffect(() => {
        if (guns.length > 0) {
            const types = getUniqueOptions(guns, 'categories');
            const brands = getUniqueOptions(guns, 'brand');
            const models = getUniqueOptions(guns, 'model');
            const mechanisms = getUniqueOptions(guns, 'mechanism');

            setFilterOptions({
                types,
                brands,
                models,
                mechanisms,
            });

            // สร้าง filters state ใหม่
            const typesObj = Object.fromEntries(types.map(type => [type, false]));
            const brandsObj = Object.fromEntries(brands.map(brand => [brand, false]));
            const modelsObj = Object.fromEntries(models.map(model => [model, false]));
            const mechanismsObj = Object.fromEntries(mechanisms.map(m => [m, false]));

            setFilters({ types: typesObj, brands: brandsObj, models: modelsObj, mechanisms: mechanismsObj });
            setTempFilters({ types: typesObj, brands: brandsObj, models: modelsObj, mechanisms: mechanismsObj });
        }
    }, [guns]);

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

        // Check mechanism filter
        const mechanismFilterActive = Object.values(filters.mechanisms).some(v => v);
        const matchesMechanism = !mechanismFilterActive || filters.mechanisms[gun.mechanism];

        // match all active filters
        return matchesType && matchesBrand && matchesModel && matchesMechanism;
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
         models: Object.fromEntries(Object.keys(filters.models || {}).map(key => [key, false])),
         mechanisms: Object.fromEntries(Object.keys(filters.mechanisms || {}).map(key => [key, false]))
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

    // Error state
    if (error) {
        return (
            <div className="flex flex-col justify-center items-center h-full w-full">
                <div className="text-red-500 text-lg mb-4">เกิดข้อผิดพลาด</div>
                <div className="text-gray-600">{error}</div>
            </div>
        );
    }

    // Render
    return (
        <>
            {loading ? (
              <div className="flex flex-col justify-center items-center h-full w-full fixed inset-0 bg-[#F8F9FA] z-10">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-t-2 border-[#b30000] mb-4"></div>
                <p className="text-gray-600 font-medium">กำลังโหลดข้อมูล...</p>
              </div>
            ) : (
                isMobileView ? <MobileLayout /> : <DesktopLayout />
            )}

            {/* Filter Modal - Shared between layouts */}
            <FilterModal
                isOpen={isFilterOpen}
                onClose={handleCloseFilterModal}
                filters={filters}
                tempFilters={tempFilters}
                onFilterChange={handleTempFilterChange}
                onApplyFilter={handleApplyFilter}
                onClearFilters={handleClearFilters}
                filterOptions={filterOptions}
            />
        </>
    );
}

export default GunCatalog;