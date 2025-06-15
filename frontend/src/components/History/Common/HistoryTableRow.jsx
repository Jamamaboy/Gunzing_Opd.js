import React from 'react';
import { FiEye, FiEdit, FiTrash } from 'react-icons/fi';
import { FaTags } from 'react-icons/fa6';
import { PiImageBroken } from "react-icons/pi";

const HistoryTableRow = ({ 
  item, 
  onViewDetail,
  onEditItem,
  onDeleteItem,
  onLabelItem,
  showActionColumn = true,
  showRecorderInfo = false,
  isAdmin = false,
  NoImageComponent = null
}) => {
  const DefaultNoImage = ({ small = true }) => (
    <div className={`flex flex-col items-center justify-center p-1 bg-gray-50 rounded-lg border border-gray-200 h-12 w-12`}>
      <PiImageBroken className="text-gray-400 text-lg" />
    </div>
  );
  
  const NoImage = NoImageComponent || DefaultNoImage;
  
  const handleImageError = (e) => {
    e.target.style.display = 'none';
    const fallbackElement = e.target.nextElementSibling;
    if (fallbackElement) {
      fallbackElement.style.display = 'flex';
    }
  };

  return (
    <tr className="border-b hover:bg-gray-50">
      
      {/* Date and Time */}
      <td className="p-3">
        <div className="text-gray-900">{item.date || ''}</div>
        {item.time && <div className="text-gray-500 text-sm">{item.time}</div>}
      </td>
      
      {/* Category */}
      <td className="p-3">
        <div>{item.category || ''}</div>
      </td>
      
      {/* Image */}
      <td className="p-3">
        {item.image ? (
          <div className="relative h-12 w-12">
            <img 
              src={item.image} 
              alt={item.name} 
              className="h-12 w-12 object-contain rounded-md"
              onError={handleImageError}
            />
            <div className="hidden">
              <NoImage small={true} />
            </div>
          </div>
        ) : (
          <NoImage small={true} />
        )}
      </td>
      
      {/* Name */}
      <td className="p-3">
        <div className="line-clamp-2">{item.name || ''}</div>
      </td>
      
      {/* Location */}
      <td className="p-3">
        {item.location ? (
          <div className="line-clamp-2">{item.location}</div>
        ) : (
          <div></div> 
        )}
      </td>
      
      {/* Recorder/Modifier Info - เฉพาะกรณีที่ต้องการแสดง */}
      {showRecorderInfo && (
        <td className="p-3">
          <div className="flex items-center">
            <span className="text-gray-700">{item.discoverer_name || ''}</span>
          </div>
          {item.modifier_name && (
            <div className="text-gray-500 text-sm mt-1">
              แก้ไขโดย: {item.modifier_name}
            </div>
          )}
        </td>
      )}
      
      {/* Actions - คอลัมน์ตัวจัดการ */}
      {showActionColumn && (
        <td className="p-3 text-center">
          <div className="flex items-center justify-center space-x-2">
            {typeof onLabelItem === 'function' ? (
              // If onLabelItem is provided, show only the Label button
              <button
                onClick={() => onLabelItem(item)}
                className="p-2 rounded-full text-blue-700 hover:bg-blue-100" // Example styling for label
                title="ป้ายกำกับ"
              >
                <FaTags size={16} />
              </button>
            ) : (
              // Otherwise, show the standard View, Edit, Delete buttons
              <>
                {typeof onViewDetail === 'function' && (
                  <button
                    onClick={() => onViewDetail(item)}
                    className="p-2 rounded-full text-blue-600 hover:bg-blue-50"
                    title="ดูรายละเอียด"
                  >
                    <FiEye size={16} />
                  </button>
                )}
                
                {isAdmin && typeof onEditItem === 'function' && (
                  <button
                    onClick={() => onEditItem(item)}
                    className="p-2 rounded-full text-amber-600 hover:bg-amber-50"
                    title="แก้ไข"
                  >
                    <FiEdit size={16} />
                  </button>
                )}
                
                {isAdmin && typeof onDeleteItem === 'function' && (
                  <button
                    onClick={() => onDeleteItem(item)}
                    className="p-2 rounded-full text-red-600 hover:bg-red-50"
                    title="ลบ"
                  >
                    <FiTrash size={16} />
                  </button>
                )}
              </>
            )}
          </div>
        </td>
      )}
    </tr>
  );
};

export default HistoryTableRow;