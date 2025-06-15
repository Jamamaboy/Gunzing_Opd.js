import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiFilter, FiArrowLeft, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { FaTags } from 'react-icons/fa6';

// Import shared components
import FilterPopup from '../../Common/FilterPopup';
import FilterTags from '../../Common/FilterTags';
import Popup from '../../Common/Popup';
import LoadingSpinner from '../../../shared/LoadingSpinner';
import ErrorDisplay from '../../Common/ErrorDisplay';
import Pagination from '../../../shared/Pagination'; 
import HistoryCard from '../../Common/HistoryCard';
import HistoryTableRow from '../../Common/HistoryTableRow';

// Import custom hook for Unknown Class firearms
import useUnknownClassData from '../../../../hooks/useUnknownClassData';

const UnknownClassTable = () => {
  const navigate = useNavigate();
  const {
    isFilterOpen,
    setIsFilterOpen,
    filters,
    data,
    isLoading,
    error,
    popup,
    setPopup,
    popupCountdown,
    currentPage,
    rowsPerPage,
    totalPages,
    indexOfFirstItem,
    indexOfLastItem,
    currentItems,
    filteredData,
    
    // Actions
    fetchHistoryData,
    handlePageChange,
    handleRowsPerPageChange,
    handleApplyFilters,
    handleClearFilters,
    getFilterLabels,
    removeFilter,
  } = useUnknownClassData();

  // เพิ่มฟังก์ชันแปลงข้อมูล
  const transformData = (items) => {
    if (!items || !Array.isArray(items)) return [];
    
    return items.map(item => {
      // สร้างชื่อจากชนิดปืน
      const name = item.exhibit ? 
        `${item.exhibit.category} ${item.exhibit.subcategory !== 'unknown' ? item.exhibit.subcategory : 'ไม่ทราบชนิด'}` : 
        'อาวุธปืนไม่ทราบชนิด';
      
      // สร้างที่อยู่แบบเต็ม
      const location = [
        item.subdistrict_name,
        item.district_name,
        item.province_name
      ].filter(Boolean).join(', ');
      
      // สร้าง object ตามที่ HistoryCard และ HistoryTableRow คาดหวัง
      return {
        ...item,
        name: name,
        category: item.exhibit?.category || 'อาวุธปืน',
        subcategory: item.exhibit?.subcategory || 'unknown',
        location: location,
        date: item.discovery_date,
        time: item.discovery_time,
        recorder: item.discoverer_name || 'ไม่ระบุ',
        image: item.photo_url,
        id: item.id,
        exhibit_id: item.exhibit_id,
        exhibit: item.exhibit,
        discovery_date: item.discovery_date,
        discovery_time: item.discovery_time,
      };
    });
  };

  // แปลงข้อมูลก่อนใช้งาน
  const transformedItems = transformData(currentItems);

  useEffect(() => {
    console.log("Original items:", currentItems);
    console.log("Transformed items:", transformedItems);
  }, [currentItems]);

  const handleLabelItem = (item) => {
    navigate('/admin/guns/label-gun', { state: { itemToLabel: item, fromUnknownTable: true } });
  };

  // Function to navigate to the general firearm labeling page
  const navigateToLabelGunPage = () => {
    navigate('/admin/guns/label-gun');
  };

  return (
    <div className="w-full h-full">
      <Popup
        open={popup.open}
        type={popup.type}
        message={popup.message}
        countdown={popupCountdown}
        onClose={() => setPopup({ ...popup, open: false })}
      />

      {/* Mobile view */}
      <div className="md:hidden">
        <div className="px-4 py-3 flex items-center justify-center relative shadow-[0_1.5px_4px_rgba(0,0,0,0.2)]">
          <button className="absolute left-4" onClick={() => navigate(-1)}>
            <FiArrowLeft size={24} />
          </button>
          <h1 className="text-lg font-bold text-center flex-1">อาวุธปืนไม่ทราบชนิด</h1>
        </div>
        <div className="px-4 sm:px-6 pt-4 flex justify-between items-center mb-4">
          <button onClick={() => setIsFilterOpen(true)} className="flex items-center gap-2 px-3 py-2 border rounded bg-white hover:bg-gray-100 text-sm">
            <FiFilter size={16} /> ตัวกรอง
          </button>
          <button 
            className="flex items-center gap-1 px-2 py-2 rounded bg-[#b30000] text-white hover:bg-[#990000]"
            onClick={navigateToLabelGunPage}
            title="ระบุชนิดปืน"
          >
            <FaTags size={16} />
          </button>
        </div>
        
        <FilterPopup
          isOpen={isFilterOpen}
          onClose={() => setIsFilterOpen(false)}
          filters={filters}
          onFilterChange={() => {}}
          onApplyFilters={handleApplyFilters}
          onClearFilters={handleClearFilters}
        />
        <FilterTags labels={getFilterLabels()} onRemove={removeFilter} />
        
        {isLoading ? (
          <LoadingSpinner />
        ) : error ? (
          <ErrorDisplay message={error} onRetry={() => window.location.reload()} />
        ) : (
          <div className="pr-4 pb-32 pl-4 grid grid-cols-1 gap-4">
            {transformedItems.length > 0 ? (
              transformedItems.map((item) => (
                <HistoryCard 
                  key={item.id || item.name + item.date} 
                  item={item} 
                  onLabelItem={handleLabelItem}
                  isAdmin={true}
                />
              ))
            ) : (
              <div className="text-center text-gray-500 py-10 col-span-1">ไม่พบข้อมูลอาวุธปืนไม่ทราบชนิด</div>
            )}
          </div>
        )}
        
        {!isLoading && !error && filteredData.length > 0 && (
          <div className="fixed bottom-16 left-0 right-0 bg-white shadow-md p-2 flex flex-col border-t">
            <div className="flex justify-between items-center pt-1">
              <div className="text-gray-600 text-xs sm:text-sm pl-2">{indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredData.length)} จาก {filteredData.length}</div>
              <div className="flex items-center text-gray-600 text-xs sm:text-sm">
                <span className="mr-1 sm:mr-2">แถว:</span>
                <select className="bg-transparent border rounded px-1 sm:px-2 py-1 text-gray-600 text-xs sm:text-sm focus:outline-none cursor-pointer" value={rowsPerPage} onChange={handleRowsPerPageChange}>
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="20">20</option>
                </select>
              </div>
              <div className="flex items-center gap-1 sm:gap-2 pr-2">
                <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className={`p-1 rounded ${currentPage === 1 ? "text-gray-400 cursor-not-allowed" : "text-gray-600 hover:bg-gray-100"}`}>
                  <FiChevronLeft size={18} />
                </button>
                <span className="font-medium text-xs sm:text-sm">{currentPage}/{totalPages}</span>
                <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className={`p-1 rounded ${currentPage === totalPages ? "text-gray-400 cursor-not-allowed" : "text-gray-600 hover:bg-gray-100"}`}>
                  <FiChevronRight size={18} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Desktop view */}
      <div className="hidden md:block h-full">
        <div className="h-full w-full flex flex-col overflow-hidden">
          <div className="px-6 py-4 flex justify-between items-center flex-shrink-0">
            <h1 className="text-xl font-bold">อาวุธปืนไม่ทราบชนิด</h1>
          </div>
          <div className="px-6 flex justify-between items-center mb-4 flex-shrink-0">
            <button onClick={() => setIsFilterOpen(true)} className="flex items-center gap-2 px-4 py-2 border rounded bg-white hover:bg-gray-100">
              <FiFilter size={18} /> ตัวกรอง
            </button>
            <button 
              className="flex items-center gap-2 px-4 py-2 rounded bg-[#b30000] text-white hover:bg-[#990000]"
              onClick={navigateToLabelGunPage}
            >
              <FaTags size={18} /><b> ระบุชนิดปืน</b>
            </button>
          </div>
          
          <FilterPopup
            isOpen={isFilterOpen}
            onClose={() => setIsFilterOpen(false)}
            filters={filters}
            onFilterChange={() => {}}
            onApplyFilters={handleApplyFilters}
            onClearFilters={handleClearFilters}
          />
          <FilterTags labels={getFilterLabels()} onRemove={removeFilter} />
          
          <div className="px-6 pb-6 flex flex-col flex-grow overflow-hidden">
            <div className="bg-white rounded shadow-md flex flex-col flex-grow overflow-hidden">
              <div className="flex-grow overflow-auto">
                {isLoading ? (
                  <LoadingSpinner />
                ) : error ? (
                  <ErrorDisplay message={error} onRetry={() => window.location.reload()} />
                ) : (
                  <table className="w-full table-fixed border-collapse">
                    <thead>
                      <tr className="bg-gray-200 sticky top-0 z-10">
                        <th className="p-3 text-left w-[15%] font-semibold">วัน/เดือน/ปี</th>
                        <th className="p-3 text-left w-[15%] font-semibold">หมวดหมู่</th>
                        <th className="p-3 text-left w-[10%] font-semibold">รูปภาพ</th>
                        <th className="p-3 text-left w-[20%] font-semibold">ชื่อ</th>
                        <th className="p-3 text-left w-[25%] font-semibold">สถานที่พบ</th>
                        <th className="p-3 text-center w-[15%] font-semibold">การจัดการ</th>
                      </tr>
                    </thead>
                    {transformedItems.length > 0 ? (
                      <tbody>
                        {transformedItems.map((item) => (
                          <HistoryTableRow
                            key={item.id || item.name + item.date}
                            item={item}
                            onLabelItem={handleLabelItem}
                            showActionColumn={true}
                            showRecorderInfo={false}
                            isAdmin={true}
                          />
                        ))}
                      </tbody>
                    ) : (
                      <tbody>
                        <tr>
                          <td colSpan="6" className="text-center text-gray-500 py-10">
                            ไม่พบข้อมูลอาวุธปืนไม่ทราบชนิด
                          </td>
                        </tr>
                      </tbody>
                    )}
                  </table>
                )}
              </div>
            </div>
            
            {!isLoading && !error && filteredData.length > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleRowsPerPageChange}
                totalItems={filteredData.length}
                indexOfFirstItem={indexOfFirstItem}
                indexOfLastItem={indexOfLastItem}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnknownClassTable;