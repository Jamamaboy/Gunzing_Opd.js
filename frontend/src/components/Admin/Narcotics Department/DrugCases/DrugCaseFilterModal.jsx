import React, { useState, useEffect } from 'react';
import { FiX, FiChevronUp, FiChevronDown, FiFilter, FiMapPin } from "react-icons/fi";
import PropTypes from 'prop-types';
// ✅ Import geography hooks และ utils
import { useGeography } from '../../../../hooks/useGeography';
import { createSelectOptions, formatProvinceData, formatDistrictData, formatSubdistrictData } from '../../../../utils/geographyUtils';

const DrugCaseFilterModal = ({ isOpen, onClose, filters, onFilterChange, onClearFilters, onApplyFilters }) => {
  const [localFilters, setLocalFilters] = useState(filters);
  const [sectionsOpen, setSectionsOpen] = useState({
    general: true,
    date: true,
    location: true,
  });

  // ✅ ใช้ geography hooks
  const {
    provinces,
    districts,
    subdistricts,
    selectedProvince,
    selectedDistrict,
    selectedSubdistrict,
    loading,
    error,
    selectProvince,
    selectDistrict,
    selectSubdistrict,
    resetSelection
  } = useGeography();

  // ✅ Format data สำหรับ select options
  const provinceOptions = createSelectOptions(formatProvinceData(provinces), 'province');
  const districtOptions = createSelectOptions(formatDistrictData(districts), 'district');
  const subdistrictOptions = createSelectOptions(formatSubdistrictData(subdistricts), 'subdistrict');

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  useEffect(() => {
    if (isOpen) {
      setLocalFilters(filters);
      // ✅ Load ข้อมูล geography ที่เลือกไว้ (ถ้ามี)
      loadSelectedGeography();
    }
  }, [isOpen, filters]);

  // ✅ โหลดข้อมูลภูมิศาสตร์ที่เลือกไว้
  const loadSelectedGeography = async () => {
    if (filters.province) {
      const province = provinces.find(p => p.province_name === filters.province || p.id.toString() === filters.province);
      if (province) {
        await selectProvince(province);
        
        if (filters.district) {
          // รอให้ districts โหลดเสร็จก่อน
          setTimeout(async () => {
            const district = districts.find(d => d.district_name === filters.district || d.id.toString() === filters.district);
            if (district) {
              await selectDistrict(district);
              
              if (filters.subdistrict) {
                // รอให้ subdistricts โหลดเสร็จก่อน
                setTimeout(() => {
                  const subdistrict = subdistricts.find(s => s.subdistrict_name === filters.subdistrict || s.id.toString() === filters.subdistrict);
                  if (subdistrict) {
                    selectSubdistrict(subdistrict);
                  }
                }, 100);
              }
            }
          }, 100);
        }
      }
    }
  };

  if (!isOpen) return null;

  const toggleSection = (sectionName) => {
    setSectionsOpen(prev => ({ ...prev, [sectionName]: !prev[sectionName] }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLocalFilters({ ...localFilters, [name]: value });
  };

  // ✅ จัดการเปลี่ยนแปลงจังหวัด
  const handleProvinceChange = async (e) => {
    const provinceId = e.target.value;
    
    if (provinceId) {
      const province = provinces.find(p => p.id.toString() === provinceId);
      if (province) {
        await selectProvince(province);
        setLocalFilters(prev => ({
          ...prev,
          province: province.province_name,
          district: '', // Reset อำเภอ
          subdistrict: '' // Reset ตำบล
        }));
      }
    } else {
      resetSelection();
      setLocalFilters(prev => ({
        ...prev,
        province: '',
        district: '',
        subdistrict: ''
      }));
    }
  };

  // ✅ จัดการเปลี่ยนแปลงอำเภอ
  const handleDistrictChange = async (e) => {
    const districtId = e.target.value;
    
    if (districtId) {
      const district = districts.find(d => d.id.toString() === districtId);
      if (district) {
        await selectDistrict(district);
        setLocalFilters(prev => ({
          ...prev,
          district: district.district_name,
          subdistrict: '' // Reset ตำบล
        }));
      }
    } else {
      selectDistrict(null);
      setLocalFilters(prev => ({
        ...prev,
        district: '',
        subdistrict: ''
      }));
    }
  };

  // ✅ จัดการเปลี่ยนแปลงตำบล
  const handleSubdistrictChange = (e) => {
    const subdistrictId = e.target.value;
    
    if (subdistrictId) {
      const subdistrict = subdistricts.find(s => s.id.toString() === subdistrictId);
      if (subdistrict) {
        selectSubdistrict(subdistrict);
        setLocalFilters(prev => ({
          ...prev,
          subdistrict: subdistrict.subdistrict_name
        }));
      }
    } else {
      selectSubdistrict(null);
      setLocalFilters(prev => ({
        ...prev,
        subdistrict: ''
      }));
    }
  };

  const handleApplyFilters = () => {
    onApplyFilters(localFilters);
    onClose();
  };

  const handleClearInternal = () => {
    const clearedFilters = {
      caseType: '',
      status: '',
      startDate: '',
      endDate: '',
      search: localFilters.search, // เก็บ search ไว้
      province: '',
      district: '',
      subdistrict: '',
      drugType: ''
    };
    setLocalFilters(clearedFilters);
    resetSelection(); // ✅ Reset geography selection
    onClearFilters();
  };

  const handleClose = () => {
    setLocalFilters(filters);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-0 md:p-4">
      <div className="bg-white w-full h-full md:w-full md:h-[75vh] md:max-w-[700px] md:max-h-[90vh] md:rounded-lg shadow-lg flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b flex-shrink-0">
          <h2 className="text-xl md:text-2xl font-semibold flex items-center">
            <FiFilter className="mr-2" />
            เลือกตัวกรองคดียาเสพติด
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-grow overflow-y-auto p-4 md:p-6 space-y-4">
          
          {/* General Filters Section */}
          <div className="border-b pb-4">
            <button
              onClick={() => toggleSection('general')}
              className="flex justify-between items-center w-full font-semibold mb-3 text-left"
            >
              ตัวกรองทั่วไป
              {sectionsOpen.general ? <FiChevronUp size={20} /> : <FiChevronDown size={20} />}
            </button>
            {sectionsOpen.general && (
              <div className="space-y-4">
                {/* Search */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ค้นหา:
                  </label>
                  <input
                    type="text"
                    name="search"
                    placeholder="เลขคดี, ชื่อผู้ต้องหา, เลขตรวจ..."
                    value={localFilters.search || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                {/* Case Type & Status */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ประเภทคดี:
                    </label>
                    <select 
                      name="caseType"
                      value={localFilters.caseType || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">ทั้งหมด</option>
                      <option value="possession">ครอบครอง</option>
                      <option value="trafficking">ค้ายา</option>
                      <option value="manufacturing">ผลิต</option>
                      <option value="distribution">จำหน่าย</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      สถานะ:
                    </label>
                    <select 
                      name="status"
                      value={localFilters.status || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">ทั้งหมด</option>
                      <option value="open">เปิด</option>
                      <option value="closed">ปิด</option>
                      <option value="pending">รอดำเนินการ</option>
                    </select>
                  </div>
                </div>

                {/* Drug Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ประเภทยาเสพติด:
                  </label>
                  <select 
                    name="drugType"
                    value={localFilters.drugType || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">ทั้งหมด</option>
                    <option value="methamphetamine">ยาบ้า</option>
                    <option value="heroin">เฮโรอีน</option>
                    <option value="cocaine">โคเคน</option>
                    <option value="marijuana">กัญชา</option>
                    <option value="ecstasy">เอ็กซ์ตาซี่</option>
                    <option value="ice">ไอซ์</option>
                    <option value="other">อื่นๆ</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* ✅ Date Range Section - ปฏิทินแบบเดิม (ค.ศ.) */}
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      วันที่เริ่มต้น:
                    </label>
                    <input
                      type="date"
                      name="startDate"
                      value={localFilters.startDate || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      วันที่สิ้นสุด:
                    </label>
                    <input
                      type="date"
                      name="endDate"
                      value={localFilters.endDate || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ✅ Location Section - ใช้ Geography System */}
          <div className="pb-4">
            <button
              onClick={() => toggleSection('location')}
              className="flex justify-between items-center w-full font-semibold mb-3 text-left"
            >
              <div className="flex items-center">
                <FiMapPin className="mr-2" />
                จังหวัด/อำเภอ/ตำบล
              </div>
              {sectionsOpen.location ? <FiChevronUp size={20} /> : <FiChevronDown size={20} />}
            </button>
            {sectionsOpen.location && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* ✅ จังหวัด - ใช้ข้อมูลจาก Geography Service */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      จังหวัด
                      {loading.provinces && (
                        <span className="ml-2 text-xs text-blue-500">(กำลังโหลด...)</span>
                      )}
                    </label>
                    <select 
                      name="province" 
                      value={selectedProvince?.id || ''} 
                      onChange={handleProvinceChange}
                      disabled={loading.provinces}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    >
                      <option value="">เลือกจังหวัด</option>
                      {provinceOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    {error.provinces && (
                      <p className="text-xs text-red-500 mt-1">{error.provinces}</p>
                    )}
                  </div>

                  {/* ✅ อำเภอ - ใช้ข้อมูลจาก Geography Service */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      อำเภอ
                      {loading.districts && (
                        <span className="ml-2 text-xs text-blue-500">(กำลังโหลด...)</span>
                      )}
                    </label>
                    <select 
                      name="district" 
                      value={selectedDistrict?.id || ''} 
                      onChange={handleDistrictChange}
                      disabled={!selectedProvince || loading.districts}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    >
                      <option value="">เลือกอำเภอ</option>
                      {districtOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    {error.districts && (
                      <p className="text-xs text-red-500 mt-1">{error.districts}</p>
                    )}
                  </div>

                  {/* ✅ ตำบล - ใช้ข้อมูลจาก Geography Service */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ตำบล
                      {loading.subdistricts && (
                        <span className="ml-2 text-xs text-blue-500">(กำลังโหลด...)</span>
                      )}
                    </label>
                    <select 
                      name="subdistrict" 
                      value={selectedSubdistrict?.id || ''} 
                      onChange={handleSubdistrictChange}
                      disabled={!selectedDistrict || loading.subdistricts}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    >
                      <option value="">เลือกตำบล</option>
                      {subdistrictOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    {error.subdistricts && (
                      <p className="text-xs text-red-500 mt-1">{error.subdistricts}</p>
                    )}
                  </div>
                </div>

                {/* ✅ แสดงข้อมูลที่เลือก */}
                {(selectedProvince || selectedDistrict || selectedSubdistrict) && (
                  <div className="bg-green-50 p-4 rounded-md border-l-4 border-green-400">
                    <p className="text-sm font-semibold text-green-800 mb-2">
                      📍 ที่อยู่ที่เลือก:
                    </p>
                    <div className="text-sm text-green-700">
                      {selectedProvince && (
                        <p>• <strong>จังหวัด:</strong> {selectedProvince.province_name}</p>
                      )}
                      {selectedDistrict && (
                        <p>• <strong>อำเภอ:</strong> {selectedDistrict.district_name}</p>
                      )}
                      {selectedSubdistrict && (
                        <p>• <strong>ตำบล:</strong> {selectedSubdistrict.subdistrict_name}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col md:flex-row justify-between p-4 border-t gap-3 flex-shrink-0 bg-white">
          <button
            onClick={handleClearInternal}
            className="w-full md:w-auto px-4 py-2 border rounded-lg text-[#b30000] border-[#b30000] hover:bg-red-50 order-2 md:order-1"
          >
            ล้างการคัดกรองทั้งหมด
          </button>
          <button
            onClick={handleApplyFilters}
            className="w-full md:w-auto px-4 py-2 rounded-lg bg-[#b30000] text-white hover:bg-[#990000] order-1 md:order-2"
          >
            คัดกรองผลลัพธ์
          </button>
        </div>
      </div>
    </div>
  );
};

DrugCaseFilterModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  filters: PropTypes.object.isRequired,
  onFilterChange: PropTypes.func.isRequired,
  onClearFilters: PropTypes.func.isRequired,
  onApplyFilters: PropTypes.func.isRequired
};

export default DrugCaseFilterModal;