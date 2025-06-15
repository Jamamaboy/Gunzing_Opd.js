import { useState, useEffect } from 'react';
import axios from 'axios';
import apiConfig, { api } from '../config/api';

// Date parsing utility from BE to CE
export const parseDateBE = (dateString) => {
  if (!dateString) return null;
  const parts = dateString.split('/');
  if (parts.length !== 3) return null;

  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const yearBE = parseInt(parts[2], 10);
  const yearCE = yearBE - 543;

  if (isNaN(day) || isNaN(month) || isNaN(yearCE)) return null;

  const date = new Date(Date.UTC(yearCE, month, day));
  if (date.getUTCFullYear() !== yearCE || date.getUTCMonth() !== month || date.getUTCDate() !== day) {
      return null;
  }
  return date;
};

// Format dates from API (YYYY-MM-DD) to Thai format (DD/MM/YYYY BE)
export const formatDateToBE = (dateString) => {
  if (!dateString) return '';
  
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

// Initial filter state
export const initialFilters = {
  categories: [],
  dateRange: null,
  customDate: '',
  province: '',
  district: '',
  subdistrict: '',
};

const useHistoryData = () => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState(initialFilters);
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [popup, setPopup] = useState({ open: false, type: '', message: '' });
  const [popupCountdown, setPopupCountdown] = useState(5);
  const API_PATH = '/api';

  const fetchHistoryData = async (options = {}) => {
    try {
      setIsLoading(true);
      setError(null);

      let url = `${API_PATH}/history`;

      if (options.userId) {
        url = `${url}?user_id=${options.userId}`;
      }

      const response = await api.get(url);
      console.log("API response:", response.data);

      let filteredResponse = [...response.data];
      
      if (options.userId) {
        console.log("Filtering by userId:", options.userId);
        console.log("Before filtering:", filteredResponse.length, "items");
        
        filteredResponse = filteredResponse.filter(item => {
          console.log("Item discovered_by:", item.discovered_by, "type:", typeof item.discovered_by);
          return item.discovered_by === String(options.userId) || 
                 item.discovered_by === options.userId;
        });
        
        console.log("After filtering:", filteredResponse.length, "items");
      }
      
      const formattedData = response.data.map(item => {
        console.log("Processing item:", item); 
      
        const dateToFormat = item.discovery_date || item.created_at;
        const dateString = formatDateToBE(dateToFormat);
        
        let timeString = '';
        if (item.discovery_time) {
          timeString = item.discovery_time.substring(0, 5);
        } else if (item.created_at && !item.discovery_date) {
          try {
            const createdDate = new Date(item.created_at);
            timeString = createdDate.getHours().toString().padStart(2, '0') + ':' +
                         createdDate.getMinutes().toString().padStart(2, '0');
          } catch (e) {
            console.error("Error parsing time from created_at:", e);
          }
        }

        let category = "ไม่ระบุหมวดหมู่";
        if (item.exhibit && item.exhibit.category) {
            category = item.exhibit.category;
        }

        let exhibitName = 'ไม่ระบุชื่อ';
        if (item.exhibit) {
            if (item.exhibit.firearms) {
                const firearm = Array.isArray(item.exhibit.firearms) 
                    ? item.exhibit.firearms[0]
                    : item.exhibit.firearms;
                
                if (firearm) {
                    const parts = [
                        firearm.brand,
                        firearm.series,
                        firearm.model
                    ].filter(Boolean);
                    
                    exhibitName = parts.length > 0 ? parts.join(' ') : item.exhibit.subcategory || 'ไม่ระบุชื่อ';
                } else {
                    exhibitName = item.exhibit.subcategory || 'ไม่ระบุชื่อ';
                }
            } else {
                exhibitName = item.exhibit.subcategory || item.exhibit.category || 'ไม่ระบุชื่อ';
            }
        }

        let locationParts = [];
        
        if (item.place_name) locationParts.push(item.place_name);
        
        if (item.subdistrict_name) locationParts.push(`ต.${item.subdistrict_name}`);
        if (item.district_name) locationParts.push(`อ.${item.district_name}`);
        if (item.province_name) locationParts.push(`จ.${item.province_name}`);
        
        const addressParts = [];
        if (item.house_no) addressParts.push(`บ้านเลขที่ ${item.house_no}`);
        if (item.village_no) addressParts.push(`หมู่ ${item.village_no}`);
        if (item.alley) addressParts.push(`ซอย${item.alley}`);
        if (item.road) addressParts.push(`ถนน${item.road}`);
        
        if (addressParts.length > 0) {
            locationParts.push(addressParts.join(' '));
        }
        
        const location = locationParts.join(', ') || '';

        let imageUrl = item.photo_url;
        
        if (!imageUrl && item.exhibit && item.exhibit.images && item.exhibit.images.length > 0) {
            const sortedImages = [...item.exhibit.images].sort((a, b) => 
                (a.priority || 999) - (b.priority || 999)
            );
            imageUrl = sortedImages[0].image_url;
        }

        let timestamp = 0;
        try {
            timestamp = dateToFormat ? new Date(dateToFormat).getTime() : 0;
        } catch (e) {
            console.error("Error creating timestamp:", e);
        }

        return {
            id: item.id,
            date: dateString,
            time: timeString,
            category,
            image: imageUrl,
            name: exhibitName,
            location,
            discovered_by: item.discovered_by || 'ไม่ระบุ',
            timestamp: timestamp,
            originalData: item
        };
      });
      
      console.log("Formatted data:", formattedData);
      
      // Sort by date (newest first)
      formattedData.sort((a, b) => b.timestamp - a.timestamp);
      
      setData(formattedData);
      setFilteredData(formattedData); // Initialize filtered data with all data
      setIsLoading(false);
    } catch (err) {
      console.error("Error fetching history data:", err);
      setError("ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง");
      setIsLoading(false);
      setData([]);
      setFilteredData([]);
    }
  };

  // Run filtering logic when filters change
  useEffect(() => {
    let dataToFilter = data.length > 0 ? [...data] : [];

    if (appliedFilters.categories && appliedFilters.categories.length > 0) {
      dataToFilter = dataToFilter.filter(item => appliedFilters.categories.includes(item.category));
    }

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    if (appliedFilters.dateRange) {
      let startDate = new Date(today);
      switch (appliedFilters.dateRange) {
        case 'today':
            break;
        case 'last7days':
            startDate.setUTCDate(today.getUTCDate() - 7);
            break;
        case 'last1month':
            startDate.setUTCMonth(today.getUTCMonth() - 1);
            break;
        case 'last6months':
            startDate.setUTCMonth(today.getUTCMonth() - 6);
            break;
        case 'last1year':
            startDate.setUTCFullYear(today.getUTCFullYear() - 1);
            break;
        default:
            startDate = null;
      }

      if (startDate) {
        dataToFilter = dataToFilter.filter(item => {
          const itemDate = parseDateBE(item.date);
          return itemDate && itemDate >= startDate && itemDate <= today;
        });
      }
    } else if (appliedFilters.customDate) {
      try {
        const [year, month, day] = appliedFilters.customDate.split('-').map(Number);
        const customDateUTC = new Date(Date.UTC(year, month - 1, day));

        if (!isNaN(customDateUTC)) {
          dataToFilter = dataToFilter.filter(item => {
            const itemDate = parseDateBE(item.date);
            return itemDate &&
                itemDate.getUTCFullYear() === customDateUTC.getUTCFullYear() &&
                itemDate.getUTCMonth() === customDateUTC.getUTCMonth() &&
                itemDate.getUTCDate() === customDateUTC.getUTCDate();
          });
        }
      } catch (e) {
        console.error("Error parsing custom date:", e);
      }
    }

    if (appliedFilters.province) {
      dataToFilter = dataToFilter.filter(item => 
        item.location.toLowerCase().includes(appliedFilters.province.toLowerCase())
      );
    }
    if (appliedFilters.district) {
      dataToFilter = dataToFilter.filter(item => 
        item.location.toLowerCase().includes(appliedFilters.district.toLowerCase())
      );
    }
    if (appliedFilters.subdistrict) {
      dataToFilter = dataToFilter.filter(item => 
        item.location.toLowerCase().includes(appliedFilters.subdistrict.toLowerCase())
      );
    }

    setFilteredData(dataToFilter);
    setCurrentPage(1);
  }, [appliedFilters, data]);

  // Handle popup countdown
  useEffect(() => {
    let timer;
    if ((popup.type === 'success' || popup.type === 'fail') && popup.open) {
      if (popupCountdown > 0) {
        timer = setTimeout(() => setPopupCountdown(popupCountdown - 1), 1000);
      } else {
        setPopup({ ...popup, open: false });
      }
    }
    return () => clearTimeout(timer);
  }, [popup, popupCountdown]);

  // Reset countdown on popup type change
  useEffect(() => {
    if ((popup.type === 'success' || popup.type === 'fail') && popup.open) {
      setPopupCountdown(5);
    }
  }, [popup.type, popup.open]);

  // Handle popup from navigation
  useEffect(() => {
    if (location && location.state && location.state.popup) {
      setPopup(location.state.popup);
      setPopupCountdown(5);
      window.history.replaceState({}, document.title);
    }
  }, [location && location.state]);

  // Calculate pagination values
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const indexOfLastItem = currentPage * rowsPerPage;
  const indexOfFirstItem = indexOfLastItem - rowsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  // Filter tag helpers
  const getFilterLabels = () => {
    const labels = [];
    if (appliedFilters.categories && appliedFilters.categories.length > 0) {
      appliedFilters.categories.forEach(cat => { 
        labels.push({ type: 'category', value: cat, label: cat }); 
      });
    }
    
    if (appliedFilters.dateRange) {
      const dateLabels = { 
        'today': 'วันนี้', 
        'last7days': '7 วันล่าสุด', 
        'last1month': '1 เดือนล่าสุด', 
        'last6months': '6 เดือนล่าสุด', 
        'last1year': '1 ปีล่าสุด' 
      };
      labels.push({ 
        type: 'date', 
        value: appliedFilters.dateRange, 
        label: dateLabels[appliedFilters.dateRange] 
      });
    } else if (appliedFilters.customDate) {
      try { 
        labels.push({ 
          type: 'date', 
          value: 'custom', 
          label: `วันที่: ${appliedFilters.customDate}` 
        }); 
      } catch (e) {}
    }
    
    if (appliedFilters.province) { 
      labels.push({ 
        type: 'location', 
        value: 'province', 
        label: `จังหวัด: ${appliedFilters.province}` 
      }); 
    }
    if (appliedFilters.district) { 
      labels.push({ 
        type: 'location', 
        value: 'district', 
        label: `อำเภอ: ${appliedFilters.district}` 
      }); 
    }
    if (appliedFilters.subdistrict) { 
      labels.push({ 
        type: 'location', 
        value: 'subdistrict', 
        label: `ตำบล: ${appliedFilters.subdistrict}` 
      }); 
    }
    
    return labels;
  };

  // Handle removing a filter
  const removeFilter = (type, value) => {
    const newFilters = { ...appliedFilters };
    if (type === 'category') { 
      newFilters.categories = newFilters.categories.filter(cat => cat !== value); 
    }
    else if (type === 'date') { 
      if (value === 'custom') { 
        newFilters.customDate = ''; 
      } else { 
        newFilters.dateRange = null; 
      } 
    }
    else if (type === 'location') { 
      newFilters[value] = ''; 
    }
    
    setAppliedFilters(newFilters);
    setFilters(newFilters);
  };

  // Pagination handlers
  const handlePageChange = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
  };
  
  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(parseInt(e.target.value));
    setCurrentPage(1);
  };

  // Filter handlers
  const handleApplyFilters = (newAppliedFilters) => {
    setAppliedFilters(newAppliedFilters);
    setFilters(newAppliedFilters);
  };

  const handleClearFilters = () => {
    setAppliedFilters(initialFilters);
    setFilters(initialFilters);
    setIsFilterOpen(false);
  };

  // Delete history record
  const handleDeleteHistory = async (id) => {
    if (window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบประวัตินี้?')) {
      try {
        const response = await api.delete(`${API_PATH}/history/${id}`);

        if (response.status === 200) {
          // Update local state by removing the deleted item
          setData(prevData => prevData.filter(item => item.id !== id));
          setFilteredData(prevFilteredData => prevFilteredData.filter(item => item.id !== id));
          
          // Show success popup
          setPopup({
            open: true,
            type: 'success',
            message: 'ลบรายการสำเร็จ'
          });
          setPopupCountdown(5);
        }
      } catch (error) {
        console.error('Error deleting history:', error);
        
        // Handle different error scenarios
        let errorMessage = 'เกิดข้อผิดพลาดในการลบรายการ';
        
        if (error.response) {
          // Server responded with an error status
          if (error.response.status === 401 || error.response.status === 403) {
            errorMessage = 'คุณไม่มีสิทธิ์ในการลบรายการนี้';
          } else if (error.response.status === 404) {
            errorMessage = 'ไม่พบรายการที่ต้องการลบ';
          } else if (error.response.data && error.response.data.detail) {
            errorMessage = error.response.data.detail;
          }
        }
        
        setPopup({
          open: true,
          type: 'fail',
          message: errorMessage
        });
        setPopupCountdown(5);
      }
    }
  };

  return {
    // State
    isFilterOpen,
    setIsFilterOpen,
    filters,
    appliedFilters,
    data,
    filteredData,
    currentPage,
    rowsPerPage,
    isLoading,
    error,
    popup,
    setPopup,
    popupCountdown,
    
    // Pagination data
    totalPages,
    indexOfFirstItem,
    indexOfLastItem,
    currentItems,
    
    // Actions
    fetchHistoryData,
    handlePageChange,
    handleRowsPerPageChange,
    handleApplyFilters,
    handleClearFilters,
    getFilterLabels,
    removeFilter,
    handleDeleteHistory
  };
};

export default useHistoryData