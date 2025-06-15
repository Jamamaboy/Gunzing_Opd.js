import React, { useState, useEffect } from "react";
import { FiFilter, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { PiImageBroken } from "react-icons/pi";
import { TbHistory } from "react-icons/tb";
import { useNavigate } from 'react-router-dom';
import { api } from '../../config/api';

import { useAuth } from '../../context/AuthContext';

import FilterPopup from '../History/Common/FilterPopup';
import FilterTags from '../History/Common/FilterTags';
import LoadingSpinner from "../shared/LoadingSpinner";
import ErrorDisplay from '../History/Common/ErrorDisplay';
import Pagination from '../History/Common/Pagination';
import HistoryCard from '../History/Common/HistoryCard';
import HistoryTableRow from '../History/Common/HistoryTableRow';

import useExhibitHistoryData from "../../hooks/useExhibitHistoryData";

const API_PATH = '/api';

// --- Date Parsing Functions ---
// Parse date from Thai Buddhist Era (BE) format to ISO Date
const parseDateBE = (dateString) => {
  if (!dateString) return null;
  
  // Check if format is DD/MM/YYYY
  const parts = dateString.split('/');
  if (parts.length !== 3) return null;

  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const yearBE = parseInt(parts[2], 10);
  
  // Validate each part
  if (isNaN(day) || isNaN(month) || isNaN(yearBE)) return null;
  if (day < 1 || day > 31 || month < 0 || month > 11 || yearBE < 2500) return null;
  
  const yearCE = yearBE - 543;

  // Create date in UTC to avoid timezone issues during comparisons
  const date = new Date(Date.UTC(yearCE, month, day));
  
  // Validate the created date (e.g., avoids Feb 30th)
  if (date.getUTCFullYear() !== yearCE || date.getUTCMonth() !== month || date.getUTCDate() !== day) {
    return null;
  }
  
  return date;
};

// Format dates from API (YYYY-MM-DD) to Thai format (DD/MM/YYYY BE)
const formatDateToBE = (dateString) => {
  if (!dateString) return '-';
  
  try {
    // Try to parse the date (could be ISO string or other format)
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.warn(`Invalid date: ${dateString}`);
      return '-';
    }
    
    const day = date.getUTCDate().toString().padStart(2, '0');
    const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
    const yearCE = date.getUTCFullYear();
    
    // Validate year is reasonable
    if (yearCE < 1900 || yearCE > 2100) {
      console.warn(`Suspicious year value: ${yearCE} from ${dateString}`);
      return '-';
    }
    
    const yearBE = yearCE + 543;
    return `${day}/${month}/${yearBE}`;
  } catch (error) {
    console.error("Error formatting date:", error, dateString);
    return '-';
  }
};

// --- Main History Component ---
const History = ({ evidence, currentUser: propCurrentUser }) => {
  // Use AuthContext user as primary, fallback to prop user
  const { user: authUser } = useAuth();
  const currentUser = authUser || propCurrentUser;
  
  console.log("Current user sources:", { 
    authUser, 
    propCurrentUser, 
    finalCurrentUser: currentUser 
  });

  const navigate = useNavigate();
  
  // Use the custom hook
  const {
    data: historyData,
    filteredData,
    isLoading: loading,
    error,
    currentPage,
    rowsPerPage,
    totalPages,
    indexOfFirstItem,
    indexOfLastItem,
    currentItems,
    fetchExhibitHistoryData,
    handlePageChange,
    handleRowsPerPageChange
  } = useExhibitHistoryData();

  console.log("Hook returned values:", { 
    dataLength: historyData.length, 
    loading, 
    error, 
    fetchExhibitHistoryData: typeof fetchExhibitHistoryData 
  });

  // Filter state
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    dateRange: null,
    customDate: '',
    customDateRange: null,
    province: '',
    district: '',
    subdistrict: '',
  });
  const [appliedFilters, setAppliedFilters] = useState({});
  
  // Location data state
  const [provinceList, setProvinceList] = useState([]);
  const [districtList, setDistrictList] = useState([]);
  const [subdistrictList, setSubdistrictList] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [subdistricts, setSubdistricts] = useState([]);
  const [locationLoading, setLocationLoading] = useState(false);

  // Handle view detail action
  const handleViewDetail = (item) => {
    navigate('/history/detail', { 
      state: { 
        item: {
          ...item,
          originalData: item.originalData || {}
        }
      } 
    });
  };

  // Filter functions
  const handleApplyFilters = (newFilters) => {
    const appliedFilters = {};
    
    // Process date filters
    if (newFilters.dateRange || newFilters.customDateRange) {
      const dateRange = newFilters.customDateRange || newFilters.dateRange;
      appliedFilters.dateRange = dateRange;
    }
    
    // Process location filters
    if (newFilters.province) {
      appliedFilters.province = newFilters.province;
    }
    if (newFilters.district) {
      appliedFilters.district = newFilters.district;
    }
    if (newFilters.subdistrict) {
      appliedFilters.subdistrict = newFilters.subdistrict;
    }
    
    setAppliedFilters(appliedFilters);
    setFilters(newFilters);
    setIsFilterOpen(false);
    
    // Apply filters to data
    filterData(historyData, appliedFilters);
  };
  
  // Filter the data based on applied filters
  const filterData = (data, filters) => {
    let result = [...data];
    
    // Filter by date range
    if (filters.dateRange) {
      const [startDate, endDate] = filters.dateRange;
      
      if (startDate && endDate) {
        result = result.filter(item => {
          const itemDate = parseDateBE(item.date);
          return itemDate && itemDate >= startDate && itemDate <= endDate;
        });
      }
    }
    
    // Filter by province
    if (filters.province) {
      result = result.filter(item => 
        item.originalData.province_name === filters.province
      );
    }
    
    // Filter by district
    if (filters.district) {
      result = result.filter(item => 
        item.originalData.district_name === filters.district
      );
    }
    
    // Filter by subdistrict
    if (filters.subdistrict) {
      result = result.filter(item => 
        item.originalData.subdistrict_name === filters.subdistrict
      );
    }
    
    // Apply filtered data to the hook's setFilteredData
    // Note: You'll need to expose setFilteredData from the hook
  };
  
  // Clear all filters
  const handleClearFilters = () => {
    setFilters({
      dateRange: null,
      customDate: '',
      customDateRange: null,
      province: '',
      district: '',
      subdistrict: '',
    });
    setAppliedFilters({});
    
    // Reset to original data - you'll need to implement this in the hook
  };
  
  // Remove a single filter
  const removeFilter = (key) => {
    const newAppliedFilters = { ...appliedFilters };
    const newFilters = { ...filters };
    
    delete newAppliedFilters[key];
    
    if (key === 'dateRange') {
      newFilters.dateRange = null;
      newFilters.customDateRange = null;
    } else {
      newFilters[key] = '';
    }
    
    setAppliedFilters(newAppliedFilters);
    setFilters(newFilters);
    
    // Re-filter data
    filterData(historyData, newAppliedFilters);
  };
  
  // Get filter labels for display
  const getFilterLabels = () => {
    const labels = [];
    
    if (appliedFilters.dateRange) {
      const [start, end] = appliedFilters.dateRange;
      const startStr = start.toLocaleDateString('th-TH', { day: '2-digit', month: '2-digit', year: 'numeric' });
      const endStr = end.toLocaleDateString('th-TH', { day: '2-digit', month: '2-digit', year: 'numeric' });
      
      labels.push({
        key: 'dateRange',
        label: `วันที่: ${startStr} - ${endStr}`
      });
    }
    
    if (appliedFilters.province) {
      labels.push({
        key: 'province',
        label: `จังหวัด: ${appliedFilters.province}`
      });
    }
    
    if (appliedFilters.district) {
      labels.push({
        key: 'district',
        label: `อำเภอ: ${appliedFilters.district}`
      });
    }
    
    if (appliedFilters.subdistrict) {
      labels.push({
        key: 'subdistrict',
        label: `ตำบล: ${appliedFilters.subdistrict}`
      });
    }
    
    return labels;
  };

  // Fetch location data (provinces, districts, subdistricts) for filters
  useEffect(() => {
    const fetchLocationData = async () => {
      try {
        setLocationLoading(true);
        
        // *** ใช้ api (axios) แทน axios และ apiConfig ***
        const [provincesRes, districtsRes, subdistrictsRes] = await Promise.all([
          api.get(`${API_PATH}/provinces`),
          api.get(`${API_PATH}/districts`),
          api.get(`${API_PATH}/subdistricts`)
        ]);

        setProvinceList(provincesRes.data);
        setProvinces(provincesRes.data.map(p => ({
          value: p.province_name,
          label: p.province_name,
          id: p.id
        })));
        setDistrictList(districtsRes.data);
        setSubdistrictList(subdistrictsRes.data);
        setLocationLoading(false);
      } catch (err) {
        console.error("Failed to fetch location data:", err);
        setLocationLoading(false);
      }
    };

    fetchLocationData();
  }, []);

  // Fetch exhibit history data when component mounts or evidence changes
  useEffect(() => {
    console.log("=== History useEffect triggered ===");
    console.log("Evidence:", evidence);
    console.log("Evidence exhibit_id:", evidence?.exhibit_id);
    console.log("Evidence category:", evidence?.category);
    console.log("Evidence exhibit category:", evidence?.exhibit?.category);
    console.log("CurrentUser from AuthContext:", currentUser);
    console.log("CurrentUser role:", currentUser?.role);
    console.log("CurrentUser department:", currentUser?.department);
    console.log("Current historyData length:", historyData.length);
    
    // Determine what data to fetch based on user role
    if (evidence?.exhibit_id && currentUser) {
      const userId = currentUser?.user_id || currentUser?.id;
      const evidenceCategory = evidence?.category || evidence?.exhibit?.category;
      console.log("User ID for filtering:", userId);
      console.log("Evidence category determined:", evidenceCategory);
      
      // Admin (role.id === 1): Show all exhibit history
      if (currentUser?.role?.id === 1) {
        console.log("✅ Admin user - fetching ALL exhibit history");
        fetchExhibitHistoryData({
          exhibitId: evidence.exhibit_id,
          // ไม่ส่ง userId = เห็นทั้งหมด
        });
      }
      // Department Admin (role.id === 2)
      else if (currentUser?.role?.id === 2) {
        // Firearms Department Admin
        if (currentUser?.department === "กลุ่มงานอาวุธปืน") {
          if (evidenceCategory === "ปืน" || evidenceCategory === "อาวุธปืน") {
            // แอดมินปืนดูปืน = เห็นทั้งหมด
            console.log("✅ Firearms Department Admin viewing firearms - fetching ALL exhibit history");
            fetchExhibitHistoryData({
              exhibitId: evidence.exhibit_id,
              // ไม่ส่ง userId = เห็นทั้งหมด
            });
          } else {
            // แอดมินปืนดูยา = เห็นเฉพาะของตนเอง
            console.log("✅ Firearms Department Admin viewing non-firearms - fetching USER-SPECIFIC exhibit history");
            fetchExhibitHistoryData({
              exhibitId: evidence.exhibit_id,
              userId: userId // ส่ง userId = เห็นเฉพาะของตนเอง
            });
          }
        }
        // Narcotics Department Admin
        else if (currentUser?.department === "กลุ่มงานยาเสพติด") {
          if (evidenceCategory === "ยาเสพติด") {
            // แอดมินยาดูยา = เห็นทั้งหมด
            console.log("✅ Narcotics Department Admin viewing narcotics - fetching ALL exhibit history");
            fetchExhibitHistoryData({
              exhibitId: evidence.exhibit_id,
              // ไม่ส่ง userId = เห็นทั้งหมด
            });
          } else {
            // แอดมินยาดูปืน = เห็นเฉพาะของตนเอง
            console.log("✅ Narcotics Department Admin viewing non-narcotics - fetching USER-SPECIFIC exhibit history");
            fetchExhibitHistoryData({
              exhibitId: evidence.exhibit_id,
              userId: userId // ส่ง userId = เห็นเฉพาะของตนเอง
            });
          }
        }
        else {
          console.log("✗ Department Admin with unknown department");
          return;
        }
      }
      // Regular user (role.id === 3) or other roles: Show only their own history
      else if (userId) {
        console.log("✅ Regular user - fetching USER-SPECIFIC exhibit history");
        fetchExhibitHistoryData({
          exhibitId: evidence.exhibit_id,
          userId: userId // ส่ง userId = เห็นเฉพาะของตนเอง
        });
      }
      else {
        console.log("✗ No user ID available for user-specific history");
      }
    } else {
      console.log("✗ Missing required data:");
      console.log("- Evidence exists:", !!evidence);
      console.log("- Evidence.exhibit_id exists:", !!evidence?.exhibit_id);
      console.log("- CurrentUser exists:", !!currentUser);
    }
  }, [evidence, currentUser, fetchExhibitHistoryData]);

  // Update empty state message based on user role
  const getEmptyStateMessage = () => {
    if (!currentUser) return "กำลังโหลดข้อมูลผู้ใช้...";
    
    const evidenceCategory = evidence?.category || evidence?.exhibit?.category;
    
    // Admin: เห็นทั้งหมด
    if (currentUser?.role?.id === 1) {
      return {
        title: "ยังไม่มีการบันทึกประวัติของวัตถุพยานนี้",
        description: "ยังไม่มีใครบันทึกประวัติการพบเห็นวัตถุพยานชิ้นนี้ในระบบ"
      };
    }
    
    // Firearms Department Admin
    if (currentUser?.role?.id === 2 && currentUser?.department === "กลุ่มงานอาวุธปืน") {
      if (evidenceCategory === "ปืน" || evidenceCategory === "อาวุธปืน") {
        return {
          title: "ยังไม่มีการบันทึกประวัติของปืนนี้",
          description: "ยังไม่มีใครบันทึกประวัติการพบเห็นปืนชิ้นนี้ในระบบ"
        };
      } else {
        return {
          title: "ยังไม่มีการบันทึกประวัติของวัตถุพยานนี้",
          description: "คุณยังไม่เคยบันทึกประวัติการพบเห็นวัตถุพยานชิ้นนี้ในระบบ"
        };
      }
    }
    
    // Narcotics Department Admin
    if (currentUser?.role?.id === 2 && currentUser?.department === "กลุ่มงานยาเสพติด") {
      if (evidenceCategory === "ยาเสพติด") {
        return {
          title: "ยังไม่มีการบันทึกประวัติของยาเสพติดนี้",
          description: "ยังไม่มีใครบันทึกประวัติการพบเห็นยาเสพติดชิ้นนี้ในระบบ"
        };
      } else {
        return {
          title: "ยังไม่มีการบันทึกประวัติของวัตถุพยานนี้",
          description: "คุณยังไม่เคยบันทึกประวัติการพบเห็นวัตถุพยานชิ้นนี้ในระบบ"
        };
      }
    }
    
    // Regular user
    return {
      title: "ยังไม่มีการบันทึกประวัติของวัตถุพยานนี้",
      description: "คุณยังไม่เคยบันทึกประวัติการพบเห็นวัตถุพยานชิ้นนี้ในระบบ"
    };
  };

  // Update retry function to respect user role
  const handleRetry = () => {
    if (!evidence?.exhibit_id || !currentUser) return;
    
    const userId = currentUser?.user_id || currentUser?.id;
    const evidenceCategory = evidence?.category || evidence?.exhibit?.category;
    
    // Admin: Get all history
    if (currentUser?.role?.id === 1) {
      fetchExhibitHistoryData({
        exhibitId: evidence.exhibit_id,
      });
    }
    // Department Admin
    else if (currentUser?.role?.id === 2) {
      // Firearms Department Admin
      if (currentUser?.department === "กลุ่มงานอาวุธปืน") {
        if (evidenceCategory === "ปืน" || evidenceCategory === "อาวุธปืน") {
          // แอดมินปืนดูปืน = เห็นทั้งหมด
          fetchExhibitHistoryData({
            exhibitId: evidence.exhibit_id,
          });
        } else {
          // แอดมินปืนดูยา = เห็นเฉพาะของตนเอง
          fetchExhibitHistoryData({
            exhibitId: evidence.exhibit_id,
            userId: userId
          });
        }
      }
      // Narcotics Department Admin
      else if (currentUser?.department === "กลุ่มงานยาเสพติด") {
        if (evidenceCategory === "ยาเสพติด") {
          // แอดมินยาดูยา = เห็นทั้งหมด
          fetchExhibitHistoryData({
            exhibitId: evidence.exhibit_id,
          });
        } else {
          // แอดมินยาดูปืน = เห็นเฉพาะของตนเอง
          fetchExhibitHistoryData({
            exhibitId: evidence.exhibit_id,
            userId: userId
          });
        }
      }
    }
    // Regular user: Get only their history
    else if (userId) {
      fetchExhibitHistoryData({
        exhibitId: evidence.exhibit_id,
        userId: userId
      });
    }
  };

  // Component to render when image is not available
  const NoImageDisplay = ({ message = "ไม่พบรูปภาพ", subMessage = "", small = false }) => (
    <div className={`flex flex-col items-center justify-center ${small ? 'p-1' : 'p-3'} bg-gray-50 rounded-lg border border-gray-200 ${small ? 'h-12 w-12' : 'h-32 w-full'}`}>
      <PiImageBroken className={`text-gray-400 ${small ? 'text-lg mb-0' : 'text-3xl mb-2'}`} />
      {!small && (
        <>
          <p className="text-gray-500 text-xs text-center">{message}</p>
          {subMessage && <p className="text-gray-400 text-xs text-center mt-1">{subMessage}</p>}
        </>
      )}
    </div>
  );

  // --- FilterPopup with preloaded location data ---
  const FilterPopupWithData = () => {
    return (
      <FilterPopup
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={filters}
        onFilterChange={(newFilters) => setFilters(newFilters)}
        onApplyFilters={handleApplyFilters}
        onClearFilters={handleClearFilters}
        // Pass preloaded location data
        preloadedData={{
          provinceList,
          districtList,
          subdistrictList,
          provinces,
          districts,
          subdistricts,
          loading: locationLoading
        }}
      />
    );
  };

  // Render loading spinner
  if (loading) {
    return <LoadingSpinner message="กำลังโหลดประวัติ..." />;
  }

  // Empty state message when no history records are found
  if (error === "empty") {
    const emptyMessage = getEmptyStateMessage();
    
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-gray-50 p-8 rounded-xl border border-gray-200 max-w-md flex flex-col items-center">
          <TbHistory className="text-gray-400 text-6xl mb-4" />
          <h2 className="text-xl font-medium text-gray-700 mb-2">{emptyMessage.title}</h2>
          <p className="text-gray-500 mb-6">{emptyMessage.description}</p>
        </div>
      </div>
    );
  }

  // Render error message with refresh button
  if (error) {
    return (
      <ErrorDisplay 
        message={error}
        subMessage={!evidence?.exhibit_id ? "ไม่พบรหัสวัตถุพยาน (Exhibit ID)" : null}
        onRetry={handleRetry}
      />
    );
  }

  // --- JSX Structure (Mobile/Desktop Layouts) ---
  return (
    <div className='flex-1 overflow-auto bg-white'>
      {/* --- Mobile Display --- */}
      <div className="md:hidden">
        {/* Headers */}
        <div className="px-4 sm:px-6 pt-4 flex justify-between items-center mb-4">
          <button onClick={() => setIsFilterOpen(true)} className="flex items-center gap-2 px-3 py-2 border rounded bg-white hover:bg-gray-100 text-sm"> <FiFilter size={16} /> ตัวกรอง </button>
        </div>

        {/* Render FilterPopup with preloaded data */}
        <FilterPopupWithData />

        {/* Render Filter Tags based on appliedFilters */}
        <FilterTags labels={getFilterLabels()} onRemove={removeFilter} />

        {/* Cards (Mobile) */}
        <div className="pr-4 pb-32 pl-4 grid grid-cols-1 gap-4">
          {currentItems.length > 0 ? (
              currentItems.map((item) => (
                  <HistoryCard 
                      key={item.id} 
                      item={item} 
                      onViewDetail={handleViewDetail}
                      showDiscoverer={true}
                      showModifier={true}
                  />
              ))
          ) : (
              <div className="text-center text-gray-500 py-10 col-span-1">ไม่พบข้อมูล</div>
          )}
        </div>

        {/* Mobile Pagination */}
        {filteredData.length > 0 && (
            <div className="fixed bottom-[74px] left-0 right-0 bg-white p-2 flex flex-col border-t border-b z-20">
                <div className="flex justify-between items-center pt-1">
                    <div className="text-gray-600 text-xs sm:text-sm pl-2">
                        {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredData.length)} จาก {filteredData.length}
                    </div>
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

      {/* --- Desktop Display --- */}
      <div className="hidden md:block h-full">
          <div className="h-full w-full flex flex-col overflow-hidden">
              <div className="px-6 pt-4 flex justify-between items-center mb-4 flex-shrink-0">
                  <button onClick={() => setIsFilterOpen(true)} className="flex items-center gap-2 px-4 py-2 border rounded bg-white hover:bg-gray-100"> <FiFilter size={18} /> ตัวกรอง </button>
              </div>

              {/* Render FilterPopup with preloaded data */}
              <FilterPopupWithData />

              {/* Render Filter Tags based on appliedFilters */}
              <FilterTags labels={getFilterLabels()} onRemove={removeFilter} />

              {/* Table Container */}
              <div className="px-6 pb-6 h-[65vh] flex flex-col flex-grow overflow-hidden">
                  <div className="bg-white rounded shadow-md flex flex-col flex-grow overflow-hidden">
                      <div className="flex-grow overflow-auto">
                          <table className="w-full table-fixed border-collapse">
                              <thead>
                                  <tr className="bg-gray-200 sticky top-0 z-10">
                                      <th className="p-3 text-left w-[12%] font-semibold">วัน/เดือน/ปี</th>
                                      <th className="p-3 text-left w-[10%] font-semibold">หมวดหมู่</th>
                                      <th className="p-3 text-left w-[8%] font-semibold">รูปภาพ</th>
                                      <th className="p-3 text-left w-[15%] font-semibold">ชื่อ</th>
                                      <th className="p-3 text-left w-[20%] font-semibold">สถานที่พบ</th>
                                      <th className="p-3 text-left w-[15%] font-semibold">ผู้บันทึก/แก้ไข</th>
                                      <th className="p-3 text-left w-[10%] font-semibold">การจัดการ</th>
                                  </tr>
                              </thead>
                              {currentItems.length > 0 ? (
                                  <tbody>
                                      {currentItems.map((item) => (
                                          <HistoryTableRow
                                              key={item.id}
                                              item={item}
                                              onViewDetail={handleViewDetail}
                                              showActionColumn={true}
                                              showRecorderInfo={true}
                                              NoImageComponent={NoImageDisplay}
                                          />
                                      ))}
                                  </tbody>
                              ) : (
                                  <tbody>
                                      <tr>
                                          <td colSpan="7" className="text-center text-gray-500 py-10">ไม่พบข้อมูล</td>
                                      </tr>
                                  </tbody>
                              )}
                          </table>
                      </div>

                      {/* Desktop Pagination */}
                      {filteredData.length > 0 && (
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
    </div>
  );
}

export default History;