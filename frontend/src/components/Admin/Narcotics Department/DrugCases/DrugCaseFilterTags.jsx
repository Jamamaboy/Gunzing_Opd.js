import React from 'react';
import { FiX } from "react-icons/fi";
import PropTypes from 'prop-types';

const DrugCaseFilterTags = ({ filters, onRemove }) => {
  const getFilterLabels = (filters) => {
    const labels = [];
    
    const labelMap = {
      search: 'ค้นหา',
      caseType: 'ประเภทคดี',
      status: 'สถานะ',
      drugType: 'ประเภทยา',
      startDate: 'วันที่เริ่ม',
      endDate: 'วันที่สิ้นสุด',
      province: 'จังหวัด',
      district: 'อำเภอ',
      subdistrict: 'ตำบล'
    };

    const caseTypeMap = {
      possession: 'ครอบครอง',
      trafficking: 'ค้ายา',
      manufacturing: 'ผลิต',
      distribution: 'จำหน่าย'
    };

    const statusMap = {
      open: 'เปิด',
      closed: 'ปิด',
      pending: 'รอดำเนินการ'
    };

    const drugTypeMap = {
      methamphetamine: 'ยาบ้า',
      heroin: 'เฮโรอีน',
      cocaine: 'โคเคน',
      marijuana: 'กัญชา',
      ecstasy: 'เอ็กซ์ตาซี่',
      ice: 'ไอซ์',
      other: 'อื่นๆ'
    };

    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== '') {
        let displayValue = value;
        
        // Map values to Thai labels
        if (key === 'caseType' && caseTypeMap[value]) {
          displayValue = caseTypeMap[value];
        } else if (key === 'status' && statusMap[value]) {
          displayValue = statusMap[value];
        } else if (key === 'drugType' && drugTypeMap[value]) {
          displayValue = drugTypeMap[value];
        }

        labels.push({
          type: key,
          value: value,
          label: `${labelMap[key]}: ${displayValue}`
        });
      }
    });

    return labels;
  };

  const filterLabels = getFilterLabels(filters);

  if (filterLabels.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-4 px-4 md:px-6">
      {filterLabels.map((item, index) => (
        <div 
          key={`${item.type}-${item.value}-${index}`} 
          className="flex items-center bg-blue-100 text-blue-800 rounded-full px-3 py-1 text-sm"
        >
          <span>{item.label}</span>
          <button 
            onClick={() => onRemove(item.type, item.value)} 
            className="ml-2 text-blue-600 hover:text-blue-900"
          >
            <FiX size={16} />
          </button>
        </div>
      ))}
    </div>
  );
};

DrugCaseFilterTags.propTypes = {
  filters: PropTypes.object.isRequired,
  onRemove: PropTypes.func.isRequired
};

export default DrugCaseFilterTags;