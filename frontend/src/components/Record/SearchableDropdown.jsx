import React, { useState, useRef, useEffect } from 'react';

const SearchableDropdown = ({ 
  options, 
  value, 
  onChange, 
  placeholder, 
  disabled = false,
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);
  
  // Set the current value as search term when it changes
  useEffect(() => {
    if (value) {
      const selectedOption = options.find(option => option.value === value);
      setSearchTerm(selectedOption ? selectedOption.label : '');
    } else {
      setSearchTerm('');
    }
  }, [value, options]);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        
        // If nothing is selected, clear the search term
        if (!value && searchTerm) {
          setSearchTerm('');
        }
        // If something is selected, restore the selected option text
        else if (value) {
          const selectedOption = options.find(option => option.value === value);
          setSearchTerm(selectedOption ? selectedOption.label : '');
        }
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [value, options, searchTerm]);
  
  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
    // Open the dropdown when typing
    if (!isOpen) {
      setIsOpen(true);
    }
  };
  
  const handleOptionClick = (option) => {
    onChange({ target: { value: option.value } });
    setSearchTerm(option.label);
    setIsOpen(false);
    inputRef.current.blur();
  };
  
  const filteredOptions = options.filter(option => 
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
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
        <div 
          className="absolute inset-y-0 right-0 flex items-center px-2 cursor-pointer"
          onClick={() => !disabled && setIsOpen(!isOpen)}
        >
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </div>
      </div>
      
      {isOpen && !disabled && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
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
        </div>
      )}
    </div>
  );
};

export default SearchableDropdown;