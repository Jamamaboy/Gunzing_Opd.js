import React, { useState, useEffect } from 'react';
import { FiX, FiChevronUp, FiChevronDown, FiMapPin } from "react-icons/fi";

const FilterPopup = ({ isOpen, onClose, filters, onFilterChange, onClearFilters, onApplyFilters }) => {
  const [localFilters, setLocalFilters] = useState(filters);
  const [sectionsOpen, setSectionsOpen] = useState({
    category: true,
    date: true,
    location: true,
  });

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  useEffect(() => {
    if (isOpen) {
        setLocalFilters(filters);
    }
  }, [isOpen, filters]);

  if (!isOpen) return null;

  const toggleSection = (sectionName) => {
    setSectionsOpen(prev => ({ ...prev, [sectionName]: !prev[sectionName] }));
  };

  const handleCategoryChange = (e) => {
    const { value, checked } = e.target;
    const currentCategories = localFilters.categories || [];
    const newCategories = checked
      ? [...currentCategories, value]
      : currentCategories.filter((cat) => cat !== value);
    setLocalFilters({ ...localFilters, categories: newCategories });
  };

  const handleDateRangeChange = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      setLocalFilters({ ...localFilters, dateRange: value, customDate: '' });
    } else {
      if (localFilters.dateRange === value) {
        setLocalFilters({ ...localFilters, dateRange: null });
      }
    }
  };

  const handleCustomDateChange = (e) => {
    setLocalFilters({ ...localFilters, customDate: e.target.value, dateRange: null });
  };

  const handleLocationChange = (e) => {
    const { name, value } = e.target;
    setLocalFilters({ ...localFilters, [name]: value });
  };

  const handleApplyFilters = () => {
    onApplyFilters(localFilters);
    onClose();
  };

  const handleClearInternal = () => {
      onClearFilters();
  };

  const handleClose = () => {
    setLocalFilters(filters);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-0 md:p-4">
      <div className="bg-white w-full h-full md:w-full md:h-[70vh] md:max-w-[650px] md:max-h-[90vh] md:rounded-lg shadow-lg flex flex-col overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b flex-shrink-0">
           <h2 className="text-xl md:text-2xl font-semibold">เลือกตัวกรองผลลัพธ์</h2>
           <button
             onClick={handleClose}
             className="text-gray-500 hover:text-gray-700"
           >
             <FiX size={24} />
           </button>
        </div>
        <div className="flex-grow overflow-y-auto p-4 md:p-6 space-y-4">
              <div className="border-b pb-4">
                 <button
                    onClick={() => toggleSection('category')}
                    className="flex justify-between items-center w-full font-semibold mb-3 text-left"
                    >
                    หมวดหมู่
                    {sectionsOpen.category ? <FiChevronUp size={20} /> : <FiChevronDown size={20} />}
                    </button>
                    {sectionsOpen.category && (
                    <div className="flex flex-wrap gap-4 sm:gap-6">
                        <label className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            className="w-4 h-4 accent-[#b30000]"
                            value="อาวุธปืน"
                            checked={localFilters.categories?.includes("อาวุธปืน") || false}
                            onChange={handleCategoryChange}
                        /> อาวุธปืน
                        </label>
                        <label className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            className="w-4 h-4 accent-[#b30000]"
                            value="ยาเสพติด"
                            checked={localFilters.categories?.includes("ยาเสพติด") || false}
                            onChange={handleCategoryChange}
                        /> ยาเสพติด
                        </label>
                    </div>
                    )}
              </div>
               <div className="border-b pb-4">
                    <button
                    onClick={() => toggleSection('date')}
                    className="flex justify-between items-center w-full font-semibold mb-3 text-left"
                    >
                    วัน/เดือน/ปี
                    {sectionsOpen.date ? <FiChevronUp size={20} /> : <FiChevronDown size={20} />}
                    </button>
                    {sectionsOpen.date && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 w-full">
                       {[
                            { value: 'today', label: 'วันนี้' },
                            { value: 'last7days', label: '7 วันล่าสุด' },
                            { value: 'last1month', label: '1 เดือนล่าสุด' },
                            { value: 'last6months', label: '6 เดือนล่าสุด' },
                            { value: 'last1year', label: '1 ปีล่าสุด' },
                        ].map(option => (
                            <label key={option.value} className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                className="w-4 h-4 accent-[#b30000]"
                                value={option.value}
                                checked={localFilters.dateRange === option.value}
                                onChange={handleDateRangeChange}
                            /> {option.label}
                            </label>
                        ))}
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center">
                        <label className="font-normal w-full sm:w-auto mb-2 sm:mb-0 sm:mr-4">กำหนดเอง</label>
                        <input
                            type="text"
                            placeholder="28 ธ.ค. 22 - 10 ม.ค. 23"
                            className="p-2 border rounded-lg w-full sm:w-[60%] focus:ring-1 focus:ring-[#b30000] focus:border-[#b30000]"
                            disabled
                        />
                        </div>
                    </div>
                    )}
               </div>
               <div className="pb-4">
                    <button
                    onClick={() => toggleSection('location')}
                    className="flex justify-between items-center w-full font-semibold mb-3 text-left"
                    >
                    จังหวัด/อำเภอ/ตำบล
                    {sectionsOpen.location ? <FiChevronUp size={20} /> : <FiChevronDown size={20} />}
                    </button>
                    {sectionsOpen.location && (
                    <div className="space-y-4">
                        <div className="flex justify-start items-center mb-2">
                        <button className="px-4 py-2 border rounded-lg bg-white hover:bg-gray-100 text-sm">
                            <FiMapPin className="inline mr-1" /> เลือกจากแผนที่
                        </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">จังหวัด</label>
                            <select name="province" value={localFilters.province || ''} onChange={handleLocationChange} className="p-2 border rounded-lg w-full focus:ring-1 focus:ring-[#b30000] focus:border-[#b30000]">
                                <option value="">กรอกหรือเลือกจังหวัด</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">อำเภอ</label>
                            <select name="district" value={localFilters.district || ''} onChange={handleLocationChange} className="p-2 border rounded-lg w-full focus:ring-1 focus:ring-[#b30000] focus:border-[#b30000]">
                                <option value="">กรอกหรือเลือกอำเภอ</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">ตำบล</label>
                            <select name="subdistrict" value={localFilters.subdistrict || ''} onChange={handleLocationChange} className="p-2 border rounded-lg w-full focus:ring-1 focus:ring-[#b30000] focus:border-[#b30000]">
                                <option value="">กรอกหรือเลือกตำบล</option>
                            </select>
                        </div>
                        </div>
                    </div>
                    )}
               </div>
        </div>
        <div className="flex flex-col sm:flex-row justify-between p-4 border-t gap-3 flex-shrink-0 bg-white">
            <button
                onClick={handleClearInternal}
                className="w-full sm:w-auto px-4 py-2 border rounded-lg text-[#b30000] border-[#b30000] hover:bg-red-50 order-2 sm:order-1"
            >
                ล้างการคัดกรองทั้งหมด
            </button>
            <button
                onClick={handleApplyFilters}
                className="w-full sm:w-auto px-4 py-2 rounded-lg bg-[#b30000] text-white hover:bg-[#990000] order-1 sm:order-2"
            >
                คัดกรองผลลัพธ์
            </button>
        </div>
      </div>
    </div>
  );
};

export default FilterPopup;