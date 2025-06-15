import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import apiConfig, { api } from '../config/api';

const useUnknownClassData = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    date: { startDate: '', endDate: '' },
    province: '',
    district: '',
    subdistrict: '',
    category: '',
    name: '',
  });
  const [popup, setPopup] = useState({
    open: false,
    type: 'success',
    message: '',
  });
  const [popupCountdown, setPopupCountdown] = useState(0);

  // ฟังก์ชันดึงข้อมูลปืนที่ไม่ทราบชนิดโดยตรงจาก API
  const fetchHistoryData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // เปลี่ยนเป็นดึงข้อมูลจาก /api/history/firearms/unknown โดยตรง
      const response = await api.get(`${apiConfig.baseUrl}/api/history/firearms/unknown`);
      
      if (response.data && Array.isArray(response.data)) {
        console.log("API Response (Unknown Firearms):", response.data.length, "items");
        setData(response.data);
        setFilteredData(response.data);
        return response.data;
      } else {
        console.error('Invalid data format received from API');
        setError('รูปแบบข้อมูลไม่ถูกต้อง');
        return [];
      }
    } catch (err) {
      console.error('Error fetching unknown firearms:', err);
      setError(err.message || 'ไม่สามารถดึงข้อมูลได้');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // เรียกใช้ฟังก์ชัน fetchHistoryData เมื่อ component ถูกโหลด
  useEffect(() => {
    fetchHistoryData();
  }, [fetchHistoryData]);

  // ฟังก์ชันที่เหลือยังคงเหมือนเดิม...
  // handlePageChange, handleRowsPerPageChange, handleApplyFilters, handleClearFilters, getFilterLabels, removeFilter

  // การคำนวณสำหรับการแบ่งหน้า
  const indexOfLastItem = currentPage * rowsPerPage;
  const indexOfFirstItem = indexOfLastItem - rowsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const handleApplyFilters = (filters) => {
    // ฟังก์ชัน filter จะทำงานกับข้อมูลที่เราดึงมาจาก API โดยตรงแล้ว
    // ...implementation of filtering logic
    setIsFilterOpen(false);
  };

  const handleClearFilters = () => {
    setFilters({
      date: { startDate: '', endDate: '' },
      province: '',
      district: '',
      subdistrict: '',
      category: '',
      name: '',
    });
    setFilteredData(data);
    setIsFilterOpen(false);
  };

  const getFilterLabels = () => {
    // ...implementation to get filter labels
    return [];
  };

  const removeFilter = (key) => {
    // ...implementation to remove a filter
  };

  return {
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
  };
};

export default useUnknownClassData;