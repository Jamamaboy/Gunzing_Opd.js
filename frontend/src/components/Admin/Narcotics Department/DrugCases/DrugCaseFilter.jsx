import React from 'react';
import PropTypes from 'prop-types';

const DrugCaseFilters = ({ filters = {}, setFilters }) => {
  // ✅ เพิ่ม default values สำหรับ filters
  const defaultFilters = {
    caseType: '',
    status: '',
    startDate: '',
    endDate: '',
    search: '',
    province: '',
    district: '',
    drugType: '',
    ...filters // merge กับ props ที่ส่งมา
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // ✅ ป้องกัน error เมื่อ setFilters เป็น undefined
    if (typeof setFilters === 'function') {
      setFilters((prevFilters = {}) => ({
        ...prevFilters,
        [name]: value,
      }));
    }
  };

  const handleReset = () => {
    if (typeof setFilters === 'function') {
      setFilters({
        caseType: '',
        status: '',
        startDate: '',
        endDate: '',
        search: '',
        province: '',
        district: '',
        drugType: ''
      });
    }
  };

  return (
    <div className="drug-case-filters bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">กรองข้อมูลคดียาเสพติด</h3>
        <button
          onClick={handleReset}
          className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded hover:bg-gray-50"
        >
          ล้างการกรอง
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Case Type Filter */}
        <div className="filter-group">
          <label htmlFor="caseType" className="block text-sm font-medium text-gray-700 mb-1">
            ประเภทคดี:
          </label>
          <select 
            name="caseType" 
            id="caseType" 
            value={defaultFilters.caseType} 
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">ทั้งหมด</option>
            <option value="possession">ครอบครอง</option>
            <option value="trafficking">ค้ายา</option>
            <option value="manufacturing">ผลิต</option>
            <option value="distribution">จำหน่าย</option>
          </select>
        </div>

        {/* Status Filter */}
        <div className="filter-group">
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
            สถานะ:
          </label>
          <select 
            name="status" 
            id="status" 
            value={defaultFilters.status} 
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">ทั้งหมด</option>
            <option value="open">เปิด</option>
            <option value="closed">ปิด</option>
            <option value="pending">รอดำเนินการ</option>
          </select>
        </div>

        {/* Drug Type Filter */}
        <div className="filter-group">
          <label htmlFor="drugType" className="block text-sm font-medium text-gray-700 mb-1">
            ประเภทยา:
          </label>
          <select 
            name="drugType" 
            id="drugType" 
            value={defaultFilters.drugType} 
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">ทั้งหมด</option>
            <option value="methamphetamine">ยาบ้า</option>
            <option value="heroin">เฮโรอีน</option>
            <option value="cocaine">โคเคน</option>
            <option value="marijuana">กัญชา</option>
            <option value="ecstasy">เอ็กซ์ตาซี่</option>
            <option value="other">อื่นๆ</option>
          </select>
        </div>

        {/* Search Filter */}
        <div className="filter-group">
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
            ค้นหา:
          </label>
          <input
            type="text"
            name="search"
            id="search"
            placeholder="เลขคดี, ชื่อผู้ต้องหา..."
            value={defaultFilters.search}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="mt-4 border-t pt-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          ช่วงวันที่เกิดเหตุ:
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="startDate" className="block text-xs text-gray-500 mb-1">
              วันที่เริ่มต้น:
            </label>
            <input
              type="date"
              name="startDate"
              id="startDate"
              value={defaultFilters.startDate}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="endDate" className="block text-xs text-gray-500 mb-1">
              วันที่สิ้นสุด:
            </label>
            <input
              type="date"
              name="endDate"
              id="endDate"
              value={defaultFilters.endDate}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Active Filters Display */}
      {Object.values(defaultFilters).some(value => value !== '') && (
        <div className="mt-4 pt-4 border-t">
          <p className="text-sm text-gray-600 mb-2">ตัวกรองที่ใช้งาน:</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(defaultFilters).map(([key, value]) => {
              if (value === '') return null;
              
              const labels = {
                caseType: 'ประเภทคดี',
                status: 'สถานะ',
                drugType: 'ประเภทยา',
                search: 'ค้นหา',
                startDate: 'วันที่เริ่ม',
                endDate: 'วันที่สิ้นสุด'
              };
              
              return (
                <span
                  key={key}
                  className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
                >
                  {labels[key]}: {value}
                  <button
                    onClick={() => handleChange({ target: { name: key, value: '' } })}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// ✅ เพิ่ม PropTypes สำหรับ validation
DrugCaseFilters.propTypes = {
  filters: PropTypes.object,
  setFilters: PropTypes.func.isRequired
};

// ✅ เพิ่ม defaultProps
DrugCaseFilters.defaultProps = {
  filters: {
    caseType: '',
    status: '',
    startDate: '',
    endDate: '',
    search: '',
    province: '',
    district: '',
    drugType: ''
  }
};

export default DrugCaseFilters;