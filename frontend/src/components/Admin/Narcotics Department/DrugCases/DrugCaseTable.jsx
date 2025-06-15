import React from 'react';
import { FiEye, FiEdit } from 'react-icons/fi';
import PropTypes from 'prop-types';

const DrugCaseTable = ({ 
  cases, 
  loading, 
  onViewCase, 
  onEditCase,
  hasActiveFilters,
  onClearFilters 
}) => {
  if (cases.length === 0 && !loading) {
    return (
      <div className="text-center py-10 flex-grow flex items-center justify-center">
        <div>
          <p className="text-gray-500 text-lg">ไม่พบข้อมูลคดียาเสพติด</p>
          <p className="text-gray-400 text-sm mt-1">คุณสามารถเพิ่มคดีใหม่ได้โดยใช้ปุ่มด้านบน</p>
          {hasActiveFilters && (
            <button 
              onClick={onClearFilters}
              className="mt-2 text-[#b30000] hover:text-[#990000]"
            >
              ล้างการค้นหาและตัวกรองทั้งหมด
            </button>
          )}
        </div>
      </div>
    );
  }

  if (loading || cases.length === 0) {
    return null;
  }

  return (
    <div className="overflow-x-auto overflow-y-auto flex-grow bg-white shadow-md rounded-t-lg">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-200 sticky top-0 z-10 rounded-t-lg">
          <tr>
            <th scope="col" className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider">
              เลขคดี
            </th>
            <th scope="col" className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider">
              วันที่เกิดเหตุ
            </th>
            <th scope="col" className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider">
              สถานที่เกิดเหตุ
            </th>
            <th scope="col" className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider">
              ลักษณะยาเสพติด
            </th>
            <th scope="col" className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider">
              ผู้ต้องหา
            </th>
            <th scope="col" className="px-3 py-2 text-center text-xs font-semibold uppercase tracking-wider">
              จัดการ
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {cases.map((caseItem, index) => (
            <DrugCaseTableRow
              key={caseItem.id || index}
              caseItem={caseItem}
              index={index}
              onViewCase={onViewCase}
              onEditCase={onEditCase}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

const DrugCaseTableRow = ({ caseItem, index, onViewCase, onEditCase }) => {
  return (
    <tr className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100 transition-colors`}>
      <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
        {caseItem.case_id || '-'}
      </td>
      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700">
        {caseItem.occurrence_date || '-'}
      </td>
      <td className="px-3 py-2 text-sm text-gray-700 max-w-xs">
        <div className="truncate" title={caseItem.full_address}>
          {caseItem.full_address}
        </div>
      </td>
      <td className="px-3 py-2 text-sm text-gray-700 max-w-xs">
        <div className="truncate" title={caseItem.evidence.color}>
          {caseItem.evidence.color}
        </div>
      </td>
      <td className="px-3 py-2 text-sm text-gray-700 max-w-xs">
        <div className="truncate" title={caseItem.defendant_names}>
          {caseItem.defendant_names}
        </div>
      </td>
      <td className="px-3 py-2 whitespace-nowrap text-center text-sm font-medium">
        <div className="flex justify-center gap-1">
          <button
            onClick={() => onViewCase(caseItem.id)}
            className="text-blue-600 hover:text-blue-900 transition-colors p-1 rounded hover:bg-blue-100"
            title="ดูรายละเอียด"
          >
            <FiEye size={18} />
          </button>
          <button
            onClick={() => onEditCase(caseItem.id)}
            className="text-indigo-600 hover:text-indigo-900 transition-colors p-1 rounded hover:bg-indigo-100"
            title="แก้ไข"
          >
            <FiEdit size={18} />
          </button>
        </div>
      </td>
    </tr>
  );
};

DrugCaseTable.propTypes = {
  cases: PropTypes.array.isRequired,
  loading: PropTypes.bool.isRequired,
  onViewCase: PropTypes.func.isRequired,
  onEditCase: PropTypes.func.isRequired,
  hasActiveFilters: PropTypes.bool.isRequired,
  onClearFilters: PropTypes.func.isRequired
};

DrugCaseTableRow.propTypes = {
  caseItem: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  onViewCase: PropTypes.func.isRequired,
  onEditCase: PropTypes.func.isRequired
};

export default DrugCaseTable;