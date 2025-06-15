import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

const SearchableDropdown = ({ options, value, onChange, placeholder, disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  
  // Set the current value as search term when it changes
  useEffect(() => {
    if (value) {
      const selectedOption = options.find(option => option.value === value);
      setSearchTerm(selectedOption ? selectedOption.label : '');
    } else {
      setSearchTerm('');
    }
  }, [value, options]);
  
  // Calculate position when opening dropdown
  useEffect(() => {
    if (isOpen && inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width
      });
    }
  }, [isOpen]);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isOpen && 
        containerRef.current && 
        !containerRef.current.contains(event.target) &&
        (!dropdownRef.current || !dropdownRef.current.contains(event.target))
      ) {
        setIsOpen(false);
        
        if (!value && searchTerm) {
          setSearchTerm('');
        } else if (value) {
          const selectedOption = options.find(option => option.value === value);
          setSearchTerm(selectedOption ? selectedOption.label : '');
        }
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, value, options, searchTerm]);
  
  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
    if (!isOpen) setIsOpen(true);
  };
  
  const handleIconClick = (e) => {
    e.stopPropagation();
    
    if (!disabled) {
      setIsOpen(prevState => !prevState);
    }
  };
  
  // เพิ่มฟังก์ชันสำหรับการล้างค่า
  const handleClearClick = (e) => {
    e.stopPropagation();
    
    if (!disabled) {
      onChange({ target: { value: '' } });
      setSearchTerm('');
      inputRef.current.focus();
    }
  };
  
  const handleOptionClick = (option) => {
    onChange({ target: { value: option.value } });
    setSearchTerm(option.label);
    setIsOpen(false);
  };
  
  const filteredOptions = options.filter(option => 
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Render the dropdown menu through a portal
  const renderDropdown = () => {
    if (!isOpen || disabled) return null;
    
    return createPortal(
      <div 
        ref={dropdownRef} 
        style={{
          position: 'absolute',
          top: `${dropdownPosition.top}px`,
          left: `${dropdownPosition.left}px`,
          width: `${dropdownPosition.width}px`,
          zIndex: 9999
        }}
        className="bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
      >
        {filteredOptions.length > 0 ? (
          filteredOptions.map((option, index) => (
            <div 
              key={index} 
              className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${value === option.value ? 'bg-blue-50 text-blue-700' : ''}`}
              onClick={() => handleOptionClick(option)}
            >
              {option.label}
            </div>
          ))
        ) : (
          <div className="px-4 py-2 text-gray-500">ไม่พบผลการค้นหา</div>
        )}
      </div>,
      document.body
    );
  };
  
  return (
    <div className="relative" ref={containerRef}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder={placeholder}
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          disabled={disabled}
        />
        
        {/* ปุ่มด้านขวา: กากบาท (เมื่อมีค่า) หรือลูกศร (เมื่อไม่มีค่า) */}
        <div 
          className="absolute inset-y-0 right-0 flex items-center px-2 cursor-pointer"
          onClick={value ? handleClearClick : handleIconClick}
        >
          {value ? (
            // แสดงไอคอน X เมื่อมีค่าที่เลือก
            <svg 
              className="w-5 h-5 text-gray-400 hover:text-gray-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          ) : (
            // แสดงลูกศรเมื่อไม่มีค่าที่เลือก
            <svg 
              className="w-5 h-5 text-gray-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          )}
        </div>
      </div>
      
      {renderDropdown()}
    </div>
  );
};

export default SearchableDropdown;