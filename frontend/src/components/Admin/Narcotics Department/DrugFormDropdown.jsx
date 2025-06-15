import React, { useState, useEffect } from 'react';

const DrugFormDropdown = ({ value, options, isLoading, onChange, placeholder = "เลือกรูปแบบยาเสพติด", style = {} }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedForm, setSelectedForm] = useState(null);
  const dropdownRef = React.useRef(null);

  // หา selectedForm จาก value และ options
  useEffect(() => {
    if (value && options && options.length > 0) {
      const selected = options.find(form => form.id.toString() === value.toString());
      if (selected) {
        setSelectedForm(selected);
      }
    } else {
      setSelectedForm(null);
    }
  }, [value, options]);

  // จัดการคลิกนอก dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelect = (form) => {
    setSelectedForm(form);
    onChange(form.id.toString());
    setIsOpen(false);
  };

  return (
    <div className="relative w-full" ref={dropdownRef} style={style}>
      <button
        type="button"
        className={`relative w-full px-4 py-3 text-left bg-white border ${isOpen ? 'border-[#990000] ring-2 ring-red-100' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none transition-all duration-200`}
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
      >
        <span className={selectedForm ? 'text-gray-900' : 'text-gray-400'}>
          {selectedForm ? selectedForm.name : placeholder}
        </span>
        <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <svg className={`h-5 w-5 text-gray-400 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </span>
      </button>

      {isLoading && (
        <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-red-900"></div>
        </div>
      )}

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white shadow-lg max-h-60 rounded-md py-1 overflow-auto ring-1 ring-black ring-opacity-5 focus:outline-none">
          {options && options.length === 0 ? (
            <div className="px-4 py-2 text-sm text-gray-500">ไม่พบข้อมูลรูปแบบยาเสพติด</div>
          ) : (
            options && options.map(form => (
              <div
                key={form.id}
                className={`cursor-pointer select-none relative py-2 pl-3 pr-9 ${selectedForm && selectedForm.id === form.id ? 'bg-red-100 text-[#990000]' : 'text-gray-900 hover:bg-red-50'}`}
                onClick={() => handleSelect(form)}
              >
                <span className="block truncate">{form.name}</span>
                {selectedForm && selectedForm.id === form.id && (
                  <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-[#990000]">
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default DrugFormDropdown;