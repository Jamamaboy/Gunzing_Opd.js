import { useState, useEffect, useCallback } from 'react';
import { api } from '../config/api';

export const formatDateToBE = (dateString) => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
      console.warn(`Invalid date: ${dateString}`);
      return '-';
    }
    
    const day = date.getUTCDate().toString().padStart(2, '0');
    const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
    const yearCE = date.getUTCFullYear();
    
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

const useExhibitHistoryData = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const API_PATH = '/api';

  console.log("useExhibitHistoryData hook initialized");

  const fetchExhibitHistoryData = useCallback(async (options = {}) => {
    const { exhibitId, userId } = options;
    
    console.log("fetchExhibitHistoryData called with:", { exhibitId, userId });

    if (!exhibitId) {
      console.log("No exhibitId provided");
      setError("ไม่พบรหัสวัตถุพยาน (Exhibit ID)");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      console.log("Starting to fetch exhibit history data...");

      let url = `${API_PATH}/history/exhibit/${exhibitId}`;
      
      if (userId) {
        url = `${API_PATH}/history/exhibit/${exhibitId}/user/${userId}`;
      }

      console.log("Fetching exhibit history from:", url);
      
      const response = await api.get(url);
      console.log("API response:", response.data);

      if (!response.data) {
        console.log("No data in response");
        setError("ไม่พบข้อมูลประวัติ");
        setData([]);
        setFilteredData([]);
        setIsLoading(false);
        return;
      }

      if (typeof response.data === 'string' || 
          (Array.isArray(response.data) && typeof response.data[0] === 'string')) {
        console.error("API returned HTML instead of JSON");
        setError("ได้รับข้อมูลในรูปแบบที่ไม่ถูกต้อง โปรดตรวจสอบ API endpoint");
        setData([]);
        setFilteredData([]);
        setIsLoading(false);
        return;
      }

      const historyItems = Array.isArray(response.data) ? response.data : [response.data];
      console.log("History items to process:", historyItems);

      const formattedData = historyItems.map(item => {
        console.log("Processing exhibit history item:", item);
        
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

        let category = "อาวุธปืน";
        if (item.exhibit && item.exhibit.category) {
          category = item.exhibit.category;
        }

        let exhibitName = 'ไม่ระบุรุ่น';
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
              
              exhibitName = parts.length > 0 ? parts.join(' ') : item.exhibit.subcategory || 'ไม่ระบุรุ่น';
            } else {
              exhibitName = item.exhibit.subcategory || 'ไม่ระบุรุ่น';
            }
          } else {
            exhibitName = item.exhibit.subcategory || item.exhibit.category || 'ไม่ระบุรุ่น';
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
        
        const location = locationParts.join(', ') || 'ไม่ระบุสถานที่';

        let imageUrl = item.photo_url || '';
        
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
          place_name: item.place_name || 'ไม่ระบุชื่อสถานที่',
          location,
          discoverer_name: item.discoverer_name || 'ไม่ระบุ',
          modifier_name: item.modifier_name || '',
          created_at: item.created_at || '',
          updated_at: item.updated_at || '',
          created_by: item.created_by || null,
          discovered_by: item.discovered_by || 'ไม่ระบุ',
          timestamp,
          originalData: item
        };
      });

      console.log("Formatted exhibit history data:", formattedData);
      
      formattedData.sort((a, b) => b.timestamp - a.timestamp);
      
      setData(formattedData);
      setFilteredData(formattedData);
      setIsLoading(false);
      console.log("Data set successfully");

    } catch (err) {
      console.error("Error fetching exhibit history data:", err);
      
      if (err.response?.status === 404 && 
          err.response?.data?.detail === "No history records found for this exhibit") {
        setData([]);
        setFilteredData([]);
        setError("empty");
      } else if (err.response?.status === 401) {
        setError("กรุณาเข้าสู่ระบบใหม่อีกครั้ง");
      } else if (err.response?.status === 403) {
        setError("คุณไม่มีสิทธิ์ในการเข้าถึงข้อมูลนี้");
      } else {
        setError(err.response?.data?.error || "ไม่สามารถโหลดข้อมูลประวัติได้ กรุณาลองใหม่อีกครั้ง");
      }
      
      setIsLoading(false);
      setData([]);
      setFilteredData([]);
    }
  }, []);

  const handleDeleteHistory = async (id) => {
    if (window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบประวัตินี้?')) {
      try {
        const response = await api.delete(`${API_PATH}/history/${id}`);

        if (response.status === 200) {
          setData(prevData => prevData.filter(item => item.id !== id));
          setFilteredData(prevFilteredData => prevFilteredData.filter(item => item.id !== id));
          
          return { success: true, message: 'ลบรายการสำเร็จ' };
        }
      } catch (error) {
        console.error('Error deleting history:', error);
        
        let errorMessage = 'เกิดข้อผิดพลาดในการลบรายการ';
        
        if (error.response) {
          if (error.response.status === 401 || error.response.status === 403) {
            errorMessage = 'คุณไม่มีสิทธิ์ในการลบรายการนี้';
          } else if (error.response.status === 404) {
            errorMessage = 'ไม่พบรายการที่ต้องการลบ';
          } else if (error.response.data && error.response.data.detail) {
            errorMessage = error.response.data.detail;
          }
        }
        
        return { success: false, message: errorMessage };
      }
    }
    return { success: false, message: 'ยกเลิกการลบ' };
  };

  const handlePageChange = (pageNumber) => {
    const totalPages = Math.ceil(filteredData.length / rowsPerPage);
    if (pageNumber < 1 || pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
  };
  
  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(parseInt(e.target.value));
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const indexOfLastItem = currentPage * rowsPerPage;
  const indexOfFirstItem = indexOfLastItem - rowsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  useEffect(() => {
    setCurrentPage(1);
  }, [filteredData]);

  useEffect(() => {
    console.log("Hook state changed:", { 
      dataLength: data.length, 
      filteredDataLength: filteredData.length, 
      isLoading, 
      error 
    });
  }, [data, filteredData, isLoading, error]);

  return {
    // State
    data,
    filteredData,
    isLoading,
    error,
    currentPage,
    rowsPerPage,
    
    // Pagination data
    totalPages,
    indexOfFirstItem,
    indexOfLastItem,
    currentItems,
    
    // Actions
    fetchExhibitHistoryData,
    handleDeleteHistory,
    handlePageChange,
    handleRowsPerPageChange,
    setFilteredData,
    
    // Utility functions
    setError
  };
};

export default useExhibitHistoryData;