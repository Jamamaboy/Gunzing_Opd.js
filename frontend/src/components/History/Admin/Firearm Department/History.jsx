import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiFilter, FiArrowLeft, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { AlertTriangle, CheckCircle, X } from 'lucide-react';

// Import shared components
import FilterPopup from '../../Common/FilterPopup';
import FilterTags from '../../Common/FilterTags';
import Popup from '../../Common/Popup';
import LoadingSpinner from '../../../shared/LoadingSpinner';
import ErrorDisplay from '../../Common/ErrorDisplay';
import Pagination from '../../../shared/Pagination';
import HistoryCard from '../../Common/HistoryCard';
import HistoryTableRow from '../../Common/HistoryTableRow';

// Import custom hook และ API
import useFirearmHistory from '../../../../hooks/useFirearmHistory';
import { api } from '../../../../config/api';

// Confirmation Modal Component
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, type = 'warning', loading = false }) => {
  if (!isOpen) return null;

  const getIconAndColor = () => {
    switch (type) {
      case 'danger':
        return {
          icon: <AlertTriangle className="h-6 w-6 text-red-600" />,
          bgColor: 'bg-red-100',
          buttonColor: 'bg-red-600 hover:bg-red-700'
        };
      case 'success':
        return {
          icon: <CheckCircle className="h-6 w-6 text-green-600" />,
          bgColor: 'bg-green-100',
          buttonColor: 'bg-green-600 hover:bg-green-700'
        };
      default:
        return {
          icon: <AlertTriangle className="h-6 w-6 text-yellow-600" />,
          bgColor: 'bg-yellow-100',
          buttonColor: 'bg-red-600 hover:bg-red-700'
        };
    }
  };

  const { icon, bgColor, buttonColor } = getIconAndColor();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className={`flex-shrink-0 ${bgColor} rounded-full p-2 mr-3`}>
              {icon}
            </div>
            <h3 className="text-lg font-medium text-gray-900">
              {title}
            </h3>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-sm text-gray-500">
            {message}
          </p>
        </div>

        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-lg">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#990000] disabled:opacity-50"
          >
            ยกเลิก
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 ${buttonColor} inline-flex items-center`}
          >
            {loading && (
              <div className="animate-spin -ml-1 mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
            )}
            {loading ? 'กำลังลบ...' : 'ลบ'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Notification Modal Component
const NotificationModal = ({ isOpen, onClose, title, message, type = 'success' }) => {
  if (!isOpen) return null;

  const getIconAndColor = () => {
    switch (type) {
      case 'error':
        return {
          icon: <AlertTriangle className="h-8 w-8 text-red-600" />,
          bgColor: 'bg-red-100',
          titleColor: 'text-red-900',
          buttonColor: 'bg-red-600 hover:bg-red-700'
        };
      default:
        return {
          icon: <CheckCircle className="h-8 w-8 text-green-600" />,
          bgColor: 'bg-green-100',
          titleColor: 'text-green-900',
          buttonColor: 'bg-green-600 hover:bg-green-700'
        };
    }
  };

  const { icon, bgColor, titleColor, buttonColor } = getIconAndColor();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full animate-in fade-in zoom-in duration-200">
        <div className="p-6 text-center">
          <div className={`mx-auto flex items-center justify-center h-16 w-16 rounded-full ${bgColor} mb-4`}>
            {icon}
          </div>
          <h3 className={`text-lg font-medium ${titleColor} mb-2`}>
            {title}
          </h3>
          <p className="text-sm text-gray-500 mb-6">
            {message}
          </p>
          <button
            onClick={onClose}
            className={`w-full px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${buttonColor}`}
          >
            ตกลง
          </button>
        </div>
      </div>
    </div>
  );
};

const History = () => {
  const navigate = useNavigate();
  
  const {
    data: firearmOnlyData,
    isLoading,
    error,
    fetchFirearmHistory
  } = useFirearmHistory();

  const [firearmFilteredData, setFirearmFilteredData] = useState([]);
  const [firearmCurrentItems, setFirearmCurrentItems] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({});
  const [popup, setPopup] = useState({ open: false, type: 'success', message: '' });
  const [popupCountdown, setPopupCountdown] = useState(0);

  // Modal states
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    historyId: null,
    historyName: '',
    loading: false
  });

  const [notificationModal, setNotificationModal] = useState({
    isOpen: false,
    type: 'success',
    title: '',
    message: ''
  });

  useEffect(() => {
    fetchFirearmHistory();
  }, []);

  // Filter data to show only firearm category items
  useEffect(() => {
    console.log('🔫 Raw firearmOnlyData from API:', firearmOnlyData);
    console.log('🔫 firearmOnlyData type:', typeof firearmOnlyData);
    console.log('🔫 firearmOnlyData length:', firearmOnlyData?.length);
    
    if (firearmOnlyData && firearmOnlyData.length > 0) {
      console.log('🔫 First item structure:', firearmOnlyData[0]);
      console.log('🔫 All items:', firearmOnlyData);
      
      // แปลงโครงสร้างข้อมูลให้ตรงกับ component
      const mappedData = firearmOnlyData.map(item => {
        // สร้างชื่อแสดงผลสำหรับอาวุธปืน
        let displayName = 'ไม่ระบุชื่อ';
        
        if (item.exhibit?.firearms?.[0]) {
          const firearm = item.exhibit.firearms[0];
          const brand = firearm.brand || '';
          const model = firearm.model || '';
          
          // ถ้ามีทั้งยี่ห้อและโมเดล
          if (brand && model && brand !== 'Unknown' && model !== 'Unknown') {
            displayName = `${brand} ${model}`;
          }
          // ถ้ามีแค่ยี่ห้อ
          else if (brand && brand !== 'Unknown') {
            displayName = brand;
          }
          // ถ้ามีแค่โมเดล
          else if (model && model !== 'Unknown') {
            displayName = model;
          }
          // ถ้ามีชื่อใน firearm.name
          else if (firearm.name && firearm.name !== 'Unknown') {
            displayName = firearm.name;
          }
          // กรณีเป็น Unknown หรือไม่มีข้อมูล
          else {
            displayName = 'อาวุธปืนไม่ทราบชนิด';
          }
        }
        // ถ้าไม่มี firearm data ให้ใช้ข้อมูลจาก exhibit
        else if (item.exhibit?.subcategory) {
          displayName = item.exhibit.subcategory;
        }
        
        return {
          id: item.id,
          name: displayName, // ใช้ displayName ที่สร้างขึ้น
          category: item.exhibit?.category || 'อาวุธปืน',
          subcategory: item.exhibit?.subcategory || '',
          date: item.discovery_date,
          time: item.discovery_time,
          location: `${item.subdistrict_name} ${item.district_name} ${item.province_name}`,
          latitude: item.latitude,
          longitude: item.longitude,
          image: item.photo_url,
          discoverer: item.discoverer_name || 'ไม่ระบุ',
          quantity: item.quantity || 1,
          description: item.exhibit?.firearms?.[0]?.description || '',
          exhibit_id: item.exhibit_id,
          exhibit: item.exhibit,
          created_at: item.created_at,
          modified_at: item.modified_at,
          ai_confidence: item.ai_confidence,
          // เพิ่มข้อมูลดิบสำหรับใช้งานอื่น
          brand: item.exhibit?.firearms?.[0]?.brand,
          model: item.exhibit?.firearms?.[0]?.model
        };
      });
      
      console.log('🔄 Mapped data:', mappedData);
      setFirearmFilteredData(mappedData);
    } else {
      setFirearmFilteredData([]);
    }
  }, [firearmOnlyData]);

  // Apply other filters on top of firearm-only data
  useEffect(() => {
    console.log('📄 firearmFilteredData:', firearmFilteredData);
    console.log('📄 Current page:', currentPage);
    console.log('📄 Rows per page:', rowsPerPage);
    
    const firstItemIndex = (currentPage - 1) * rowsPerPage;
    const lastItemIndex = firstItemIndex + rowsPerPage;
    const currentItems = firearmFilteredData.slice(firstItemIndex, lastItemIndex);
    
    console.log('📄 Current items for display:', currentItems);
    console.log('📄 Index range:', firstItemIndex, '-', lastItemIndex);
    
    setFirearmCurrentItems(currentItems);
  }, [firearmFilteredData, currentPage, rowsPerPage]);

  // เพิ่ม console.log ใน useEffect สำหรับ loading และ error states
  useEffect(() => {
    console.log('🚨 Loading state:', isLoading);
    console.log('🚨 Error state:', error);
  }, [isLoading, error]);

  // คำนวณค่าต่างๆ สำหรับ pagination
  const totalPages = Math.ceil(firearmFilteredData.length / rowsPerPage);
  const indexOfFirstItem = (currentPage - 1) * rowsPerPage;
  const indexOfLastItem = Math.min(indexOfFirstItem + rowsPerPage, firearmFilteredData.length);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value));
    setCurrentPage(1);
  };

  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
    setIsFilterOpen(false);
    // TODO: Apply filters to firearmFilteredData
  };

  const handleClearFilters = () => {
    setFilters({});
    setFirearmFilteredData(firearmOnlyData || []);
  };

  const getFilterLabels = () => {
    // TODO: Return filter labels based on current filters
    return [];
  };

  const removeFilter = (filterKey) => {
    const newFilters = { ...filters };
    delete newFilters[filterKey];
    setFilters(newFilters);
    // TODO: Re-apply remaining filters
  };

  // Delete History Function
  const handleDeleteHistory = async (historyId) => {
    setConfirmModal(prev => ({ ...prev, loading: true }));
    
    try {
      console.log('🗑️ Deleting history with ID:', historyId);
      
      const response = await api.delete(`/api/history/${historyId}`);
      
      if (response.status === 200) {
        // ลบ history ออกจาก state หลังจากลบสำเร็จ
        setFirearmFilteredData(prevData => prevData.filter(item => item.id !== historyId));
        
        // จัดการ pagination หลังจากลบ
        const newTotalItems = firearmFilteredData.length - 1;
        const newTotalPages = Math.ceil(newTotalItems / rowsPerPage);
        if (currentPage > newTotalPages && newTotalPages > 0) {
          setCurrentPage(newTotalPages);
        } else if (newTotalPages === 0 && newTotalItems === 0) {
          setCurrentPage(1);
        } else if (firearmCurrentItems.length === 1 && currentPage > 1 && newTotalItems > 0) {
          setCurrentPage(currentPage - 1);
        }

        // ปิด Confirmation Modal
        setConfirmModal({
          isOpen: false,
          historyId: null,
          historyName: '',
          loading: false
        });

        // แสดง Success Modal
        setNotificationModal({
          isOpen: true,
          type: 'success',
          title: 'ลบสำเร็จ!',
          message: 'ประวัติการค้นพบถูกลบออกจากระบบเรียบร้อยแล้ว'
        });

        // Refresh data
        fetchFirearmHistory();

      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
    } catch (deleteError) {
      console.error('❌ Error deleting history:', deleteError);
      
      // ปิด Confirmation Modal
      setConfirmModal({
        isOpen: false,
        historyId: null,
        historyName: '',
        loading: false
      });

      // แสดง Error Modal
      setNotificationModal({
        isOpen: true,
        type: 'error',
        title: 'เกิดข้อผิดพลาด!',
        message: `ไม่สามารถลบประวัติได้: ${deleteError.message}`
      });
    }
  };

  const handleViewDetail = (item) => {
    navigate('/history/detail', { state: { item } });
  };

  const handleEditItem = (item) => {
    navigate(`/history/edit/${item.id}`);
  };

  const handleDeleteItem = (item) => {
    setConfirmModal({
      isOpen: true,
      historyId: item.id,
      historyName: item.name,
      loading: false
    });
  };

  const handleCloseConfirmModal = () => {
    if (!confirmModal.loading) {
      setConfirmModal({
        isOpen: false,
        historyId: null,
        historyName: '',
        loading: false
      });
    }
  };

  const handleConfirmDelete = () => {
    if (confirmModal.historyId) {
      handleDeleteHistory(confirmModal.historyId);
    }
  };

  const handleCloseNotificationModal = () => {
    setNotificationModal({
      isOpen: false,
      type: 'success',
      title: '',
      message: ''
    });
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
          <h1 className="text-lg font-bold text-center flex-1">ประวัติการพบวัตถุพยาน - อาวุธปืน</h1>
        </div>
        <div className="px-4 sm:px-6 pt-4 flex justify-between items-center mb-4">
          <button onClick={() => setIsFilterOpen(true)} className="flex items-center gap-2 px-3 py-2 border rounded bg-white hover:bg-gray-100 text-sm">
            <FiFilter size={16} /> ตัวกรอง
          </button>
          <button 
            className="flex items-center gap-1 px-2 py-2 rounded bg-[#b30000] text-white hover:bg-[#990000]"
            onClick={() => navigate('/saveToHistory')}
          >
            <FiPlus size={16} />
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
          <ErrorDisplay message={error} onRetry={fetchFirearmHistory} />
        ) : (
          <div className="pr-4 pb-32 pl-4 grid grid-cols-1 gap-4">
            {firearmCurrentItems.length > 0 ? (
              firearmCurrentItems.map((item) => (
                <HistoryCard 
                  key={item.id || item.name + item.date} 
                  item={item} 
                  onViewDetail={handleViewDetail}
                  onEditItem={handleEditItem}
                  onDeleteItem={handleDeleteItem}
                  isAdmin={true}
                />
              ))
            ) : (
              <div className="text-center text-gray-500 py-10 col-span-1">ไม่พบข้อมูลอาวุธปืน</div>
            )}
          </div>
        )}
        
        {!isLoading && !error && firearmFilteredData.length > 0 && (
          <div className="fixed bottom-16 left-0 right-0 bg-white shadow-md p-2 flex flex-col border-t">
            <div className="flex justify-between items-center pt-1">
              <div className="text-gray-600 text-xs sm:text-sm pl-2">{indexOfFirstItem + 1}-{indexOfLastItem} จาก {firearmFilteredData.length}</div>
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
            <h1 className="text-xl font-bold">ประวัติการพบวัตถุพยาน - อาวุธปืน</h1>
          </div>
          <div className="px-6 flex justify-between items-center mb-4 flex-shrink-0">
            <button onClick={() => setIsFilterOpen(true)} className="flex items-center gap-2 px-4 py-2 border rounded bg-white hover:bg-gray-100">
              <FiFilter size={18} /> ตัวกรอง
            </button>
            <button 
              className="flex items-center gap-2 px-4 py-2 rounded bg-[#b30000] text-white hover:bg-[#990000]"
              onClick={() => navigate('/saveToHistory')}
            >
              <FiPlus size={18} /><b> เพิ่มประวัติการค้นพบ</b>
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
                  <ErrorDisplay message={error} onRetry={fetchFirearmHistory} />
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
                    {firearmCurrentItems.length > 0 ? (
                      <tbody>
                        {firearmCurrentItems.map((item) => (
                          <HistoryTableRow
                            key={item.id || item.name + item.date}
                            item={item}
                            onViewDetail={handleViewDetail}
                            onEditItem={handleEditItem}
                            onDeleteItem={handleDeleteItem}
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
                            ไม่พบข้อมูลอาวุธปืน
                          </td>
                        </tr>
                      </tbody>
                    )}
                  </table>
                )}
              </div>
            </div>
            
            {!isLoading && !error && firearmFilteredData.length > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleRowsPerPageChange}
                totalItems={firearmFilteredData.length}
                indexOfFirstItem={indexOfFirstItem}
                indexOfLastItem={indexOfLastItem}
              />
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={handleCloseConfirmModal}
        onConfirm={handleConfirmDelete}
        title="ยืนยันการลบ"
        message={`คุณแน่ใจหรือไม่ว่าต้องการลบประวัติ "${confirmModal.historyName}"? การกระทำนี้ไม่สามารถยกเลิกได้`}
        type="danger"
        loading={confirmModal.loading}
      />

      <NotificationModal
        isOpen={notificationModal.isOpen}
        onClose={handleCloseNotificationModal}
        title={notificationModal.title}
        message={notificationModal.message}
        type={notificationModal.type}
      />
    </div>
  );
};

export default History;