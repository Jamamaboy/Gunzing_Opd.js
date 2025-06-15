import React, { useState, useRef, useEffect } from 'react';
import { FiEye, FiMapPin, FiCalendar, FiUser, FiEdit, FiTrash, FiMoreVertical } from 'react-icons/fi';
import { FaTags } from 'react-icons/fa6'; // Import FaTags
import { PiImageBroken } from "react-icons/pi";

const HistoryCard = ({ 
  item, 
  onViewDetail, 
  onEditItem, 
  onDeleteItem,
  onLabelItem,
  showDiscoverer = false, 
  showModifier = false,
  isAdmin = false 
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const NoImageDisplay = ({ message = "ไม่พบรูปภาพ", subMessage = "", small = false }) => (
    <div className={`flex flex-col items-center justify-center ${small ? 'p-1' : 'p-2'} bg-gray-50 rounded-lg border border-gray-200 ${small ? 'h-12 w-12' : 'h-24 w-full'}`}>
      <PiImageBroken className={`text-gray-400 ${small ? 'text-lg mb-0' : 'text-2xl mb-1'}`} />
      {!small && (
        <>
          <p className="text-gray-500 text-xs text-center">{message}</p>
          {subMessage && <p className="text-gray-400 text-xs text-center mt-1">{subMessage}</p>}
        </>
      )}
    </div>
  );

  const handleImageError = (e) => {
    e.target.style.display = 'none';
    const fallbackElement = e.target.nextElementSibling;
    if (fallbackElement) {
      fallbackElement.style.display = 'flex';
    }
  };

  const hasEditOrDeleteAction = typeof onEditItem === 'function' || typeof onDeleteItem === 'function';

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-md font-medium">{item.category}</h3>
          <div className="flex items-center">
            <div className="flex items-center text-sm text-gray-600 mr-2">
              <FiCalendar className="mr-1" size={12} />
              <span>{item.date}</span>
              {item.time && <span className="ml-1">{item.time}</span>}
            </div>
            
            {isAdmin && !onLabelItem && hasEditOrDeleteAction && (
              <div className="relative" ref={menuRef}>
                <button 
                  className="p-1 text-gray-500 hover:bg-gray-100 rounded-full" 
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(!showMenu);
                  }}
                >
                  <FiMoreVertical size={18} />
                </button>
                
                {showMenu && (
                  <div className="absolute right-0 z-10 mt-1 bg-white rounded shadow-lg border w-36">
                    {typeof onEditItem === 'function' && (
                      <button 
                        className="w-full text-left px-3 py-2 hover:bg-gray-100 flex items-center gap-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditItem(item);
                          setShowMenu(false);
                        }}
                      >
                        <FiEdit size={16} className="text-amber-600" />
                        <span>แก้ไข</span>
                      </button>
                    )}
                    
                    {typeof onDeleteItem === 'function' && (
                      <button 
                        className="w-full text-left px-3 py-2 hover:bg-gray-100 flex items-center gap-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteItem(item);
                          setShowMenu(false);
                        }}
                      >
                        <FiTrash size={16} className="text-red-600" />
                        <span>ลบ</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex">
          <div className="flex-shrink-0 w-24 h-24 mr-3 flex items-center justify-center">
            {item.image ? (
              <div className="relative w-24 h-24">
                <img 
                  src={item.image} 
                  alt={item.name} 
                  className="w-24 h-24 object-cover rounded-md"
                  onError={handleImageError}
                />
                <div className="hidden">
                  <NoImageDisplay />
                </div>
              </div>
            ) : (
              <NoImageDisplay />
            )}
          </div>
          
          <div className="flex flex-col justify-between flex-1">
            <div>
              <h4 className="font-medium text-sm mb-1 line-clamp-2">{item.name}</h4>
              
              <div className="flex items-start mb-1">
                <FiMapPin size={14} className="text-gray-500 mt-[2px] flex-shrink-0" />
                <p className="text-gray-600 text-sm ml-1 line-clamp-2">{item.location}</p>
              </div>
              
              {showDiscoverer && item.discoverer_name && (
                <div className="flex items-center">
                  <FiUser size={14} className="text-gray-500 flex-shrink-0" />
                  <p className="text-gray-600 text-sm ml-1 truncate">
                    {item.discoverer_name}
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end mt-2">
              {typeof onLabelItem === 'function' ? (
                <button
                  onClick={() => onLabelItem(item)}
                  className="px-3 py-1 text-sm flex items-center gap-1 text-blue-700 border border-blue-700 hover:bg-blue-50 rounded"
                >
                  <FaTags size={14} /> ป้ายกำกับ
                </button>
              ) : typeof onViewDetail === 'function' ? (
                <button
                  onClick={() => onViewDetail(item)}
                  className="px-3 py-1 text-sm flex items-center gap-1 text-red-900 border border-red-900 hover:bg-red-50 rounded"
                >
                  <FiEye size={14} /> ดูรายละเอียด
                </button>
              ) : null}
            </div>
          </div>
        </div>
        
        {showModifier && item.modifier_name && (
          <div className="mt-2 pt-2 border-t border-gray-100">
            <p className="text-gray-500 text-xs">แก้ไขล่าสุดโดย: {item.modifier_name}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryCard;