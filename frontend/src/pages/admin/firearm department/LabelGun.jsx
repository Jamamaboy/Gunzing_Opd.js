import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaArrowLeft, FaArrowRight, FaTimes, FaSave, FaPlus, FaArrowCircleLeft, FaSearch } from 'react-icons/fa';
import Select from 'react-select';
import LoadingSpinner from '../../../components/shared/LoadingSpinner';
import ErrorDisplay from '../../../components/History/Common/ErrorDisplay';
import apiConfig, { api } from '../../../config/api';
import CreateGunModal from '../../../components/Admin/Firearms Department/CreateGunModal';

// Custom hook for firearm classification
const useFirearmData = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [unknownFirearms, setUnknownFirearms] = useState([]);
  const [firearmOptions, setFirearmOptions] = useState([]);
  const [currentItem, setCurrentItem] = useState(null);
  
  const API_PATH = '/api';
  
  // Fetch all unknown firearms
  const fetchUnknownFirearms = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`${apiConfig.baseUrl}${API_PATH}/history/firearms/unknown`);
      
      if (response.data && Array.isArray(response.data)) {
        setUnknownFirearms(response.data);
        return response.data;
      } else {
        throw new Error('Invalid data format received');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch unknown firearms');
      console.error('Fetch error:', err);
      return [];
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch firearms for dropdown options
  const fetchFirearmOptions = async () => {
    try {
      const response = await axios.get(`${apiConfig.baseUrl}${API_PATH}/exhibits`);
      
      if (response.data && Array.isArray(response.data)) {
        const firearmsData = response.data.filter(item => 
          item.category === 'อาวุธปืน' && item.firearm
        );
        
        const options = firearmsData.map(item => {
          const { brand, series, model } = item.firearm;
          
          let displayName = '';
          
          if (brand && model) {
            displayName = `${brand} ${model}`;
          } else if (brand) {
            displayName = brand;
          } else if (model) {
            displayName = model;
          } else if (series) {
            displayName = series;
          } else {
            displayName = item.subcategory || 'Unknown';
          }
          
          return {
            id: item.firearm.id,
            displayName,
            value: displayName,
            originalData: item.firearm
          };
        });
        
        const uniqueOptions = [];
        const seenNames = new Set();
        
        for (const option of options) {
          if (!seenNames.has(option.displayName)) {
            seenNames.add(option.displayName);
            uniqueOptions.push(option);
          }
        }
        
        setFirearmOptions(uniqueOptions);
        return uniqueOptions;
      } else {
        console.error('Invalid data format received from exhibits API');
        return [];
      }
    } catch (err) {
      console.error('Failed to fetch firearm options:', err);
      return [];
    }
  };
  
  // Save firearm classification
  const saveClassification = async (firearmId, classificationValue) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await api.post(
        `${API_PATH}/history/firearms/classify`, 
        {
          firearmId,
          class: classificationValue
        }
      );
      
      if (response.data && response.data.message) {
        console.log("Classification saved successfully:", response.data);
        return true;
      }
      
      return false;
    } catch (err) {
      setError(err.message || 'Failed to save classification');
      console.error('Save error:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    isLoading,
    error,
    unknownFirearms,
    firearmOptions,
    currentItem,
    setCurrentItem,
    fetchUnknownFirearms,
    fetchFirearmOptions,
    saveClassification
  };
};

const LabelGun = () => {
  const [selectedClass, setSelectedClass] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showCreateGunModal, setShowCreateGunModal] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();
  
  const {
    isLoading,
    error,
    unknownFirearms,
    firearmOptions,
    currentItem,
    setCurrentItem,
    fetchUnknownFirearms,
    fetchFirearmOptions,
    saveClassification
  } = useFirearmData();
  
  useEffect(() => {
    const initData = async () => {
      const firearms = await fetchUnknownFirearms();
      console.log("Fetched firearms:", firearms);
      
      if (firearms && firearms.length > 0) {
        if (location.state?.itemToLabel) {
          const itemToLabel = location.state.itemToLabel;
          const itemIndex = firearms.findIndex(item => item.id === itemToLabel.id);
          console.log("Item to label:", itemToLabel);
          console.log("Found at index:", itemIndex);
          
          if (itemIndex !== -1) {
            setCurrentIndex(itemIndex);
            setCurrentItem(firearms[itemIndex]);
          } else {
            console.log("Item not found in fetched data, using first item");
            setCurrentIndex(0);
            setCurrentItem(firearms[0]);
          }
        } else {
          console.log("No specific item, starting from first item");
          setCurrentIndex(0);
          setCurrentItem(firearms[0]);
        }
      }
      
      await fetchFirearmOptions();
    };
    
    initData();
  }, []);
  
  const handleClassChange = (e) => {
    setSelectedClass(e.target.value);
  };

  const selectOptions = firearmOptions.map(option => ({
    value: option.displayName,
    label: option.displayName,
    originalData: option.originalData
  }));

  const groupedOptions = selectOptions.reduce((groups, option) => {
    const brand = option.originalData?.brand || 'อื่นๆ';
    if (!groups[brand]) {
      groups[brand] = [];
    }
    groups[brand].push(option);
    return groups;
  }, {});

  const groupedSelectOptions = Object.keys(groupedOptions).map(brand => ({
    label: brand,
    options: groupedOptions[brand]
  }));

  const handleSelectChange = (selectedOption) => {
    setSelectedClass(selectedOption ? selectedOption.value : '');
  };

  const selectStyles = {
    control: (provided, state) => ({
      ...provided,
      borderColor: state.isFocused ? '#3b82f6' : '#d1d5db',
      boxShadow: state.isFocused ? '0 0 0 3px rgba(59, 130, 246, 0.3)' : 'none',
      '&:hover': {
        borderColor: state.isFocused ? '#3b82f6' : '#9ca3af',
      },
      borderRadius: '0.5rem',
      padding: '1px',
      fontSize: '0.9rem'
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? '#3b82f6' : state.isFocused ? '#e0e7ff' : 'white',
      color: state.isSelected ? 'white' : '#1f2937',
      padding: '8px 12px',
      cursor: 'pointer'
    }),
    menu: (provided) => ({
      ...provided,
      borderRadius: '0.5rem',
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      zIndex: 9999
    }),
    group: (provided) => ({
      ...provided,
      paddingBottom: 8
    }),
    groupHeading: (provided) => ({
      ...provided,
      fontWeight: 'bold',
      fontSize: '0.85rem',
      color: '#4b5563',
      paddingLeft: 12,
      paddingRight: 12,
      textTransform: 'none',
      backgroundColor: '#f3f4f6'
    }),
    input: (provided) => ({
      ...provided,
      fontSize: '0.9rem'
    })
  };

  const handleGunCreated = async (newGunData) => {
    setShowCreateGunModal(false);
    await fetchFirearmOptions();
    if (newGunData && newGunData.displayName) {
      setSelectedClass(newGunData.displayName);
    }
    alert(`เพิ่ม '${newGunData.displayName}' สำเร็จแล้ว`);
  };

  const DropdownIndicator = (props) => {
    return (
      <div
        {...props.innerProps}
        className="px-2 flex items-center justify-center cursor-pointer text-gray-500 hover:text-blue-600 transition-colors rounded-full"
        onClick={(e) => {
          e.preventDefault(); 
          e.stopPropagation();
          setShowCreateGunModal(true);
        }}
        title="สร้างข้อมูลปืนใหม่"
      >
        <FaPlus size={16} />
      </div>
    );
  };

  const handleSave = async () => {
    if (!currentItem || !selectedClass) return;
    
    const success = await saveClassification(currentItem.id, selectedClass);
    
    if (success) {
      const updatedFirearms = await fetchUnknownFirearms();
      
      if (updatedFirearms && updatedFirearms.length > 0) {
        let nextIndex = currentIndex;
        
        if (nextIndex >= updatedFirearms.length) {
          nextIndex = updatedFirearms.length - 1;
        }
        
        setCurrentIndex(nextIndex);
        setCurrentItem(updatedFirearms[nextIndex]);
        setSelectedClass('');
        
        console.log(`After save: moving to index ${nextIndex} of ${updatedFirearms.length}`);
      } else {
        alert('ปืนทั้งหมดได้รับการจัดประเภทแล้ว!');
        navigate('/admin/guns/unknown-class-table');
      }
    } else {
      alert('บันทึกประเภทไม่สำเร็จ โปรดลองอีกครั้ง');
    }
  };
  
  const goToNext = () => {
    if (currentIndex < unknownFirearms.length - 1) {
      const nextIndex = currentIndex + 1;
      console.log(`Moving to next item: ${nextIndex} of ${unknownFirearms.length}`);
      setCurrentIndex(nextIndex);
      setCurrentItem(unknownFirearms[nextIndex]);
      setSelectedClass('');
    } else {
      console.log("Already at the last item");
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      console.log(`Moving to previous item: ${prevIndex} of ${unknownFirearms.length}`);
      setCurrentIndex(prevIndex);
      setCurrentItem(unknownFirearms[prevIndex]);
      setSelectedClass('');
    } else {
      console.log("Already at the first item");
    }
  };
  
  const handleBack = () => {
    navigate('/admin/guns/unknown-class-table');
  };
  
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowRight') goToNext();
    if (e.key === 'ArrowLeft') goToPrevious();
    if (e.key === 'Enter' && selectedClass) handleSave();
  };
  
  if (isLoading && !currentItem) {
    return <LoadingSpinner />;
  }
  
  if (error && !currentItem) {
    return <ErrorDisplay message={error} onRetry={() => fetchUnknownFirearms()} />;
  }
  
  const getImageUrl = () => {
    if (!currentItem) return '';
    
    if (currentItem.photo_url) return currentItem.photo_url;
    
    if (currentItem.imageUrl) return currentItem.imageUrl;

    if (currentItem.image) return currentItem.image;
    
    if (currentItem.images && currentItem.images.length > 0) {
      return currentItem.images[0].url || currentItem.images[0];
    }
    
    if (currentItem.originalData && currentItem.originalData.exhibit) {
      const exhibit = currentItem.originalData.exhibit;
      
      if (exhibit.images && exhibit.images.length > 0) {
        return exhibit.images[0].url || exhibit.images[0];
      }
    }
  
    return 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22400%22%20height%3D%22300%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Crect%20width%3D%22400%22%20height%3D%22300%22%20fill%3D%22%23f1f1f1%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20font-size%3D%2218%22%20text-anchor%3D%22middle%22%20alignment-baseline%3D%22middle%22%20font-family%3D%22Arial%2C%20sans-serif%22%20fill%3D%22%23777777%22%3E%E0%B9%84%E0%B8%A1%E0%B9%88%E0%B8%9E%E0%B8%9A%E0%B8%A3%E0%B8%B9%E0%B8%9B%E0%B8%A0%E0%B8%B2%E0%B8%9E%3C%2Ftext%3E%3C%2Fsvg%3E';
  };

  return (
    <div className="h-full w-full overflow-hidden flex flex-col bg-gray-100" onKeyDown={handleKeyDown} tabIndex="0">
      {/* Header */}
      <header className="px-6 pt-4 flex justify-between items-center flex-shrink-0">
        <div className="flex items-center">
            <button
              onClick={(handleBack)}
              className="mr-4 hover:bg-blue-700 p-2 rounded-full transition-all"
              title="Back to Dashboard"
            >
              <FaArrowCircleLeft size={24} />
            </button>
            <h2 className="text-xl font-semibold text-gray-800">ระบุชนิดปืน</h2>
        </div>
      </header>
      
      {/* Main content area with side navigation */}
      <main className="flex-1 overflow-auto w-full flex items-center justify-center">
        <div className="flex items-center justify-around w-full max-w-7xl mx-auto">
          {/* Previous Button (Outside Card Left) */}
          <button
            onClick={goToPrevious}
            disabled={currentIndex === 0 || isLoading}
            className={`hidden md:flex p-4 rounded-full transition-all text-white mr-2 ${
              currentIndex === 0 || isLoading
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600 shadow-lg hover:shadow-xl active:scale-95'
            }`}
            title="รายการก่อนหน้า (ลูกศรซ้าย)"
          >
            <FaArrowLeft size={20} />
          </button>

          {/* Main Card (Horizontal Layout) */}
          <div className="bg-white rounded-2xl shadow-2xl flex flex-col md:flex-row w-full max-w-6xl mx-2 min-h-[480px] max-h-[calc(100vh-140px)] overflow-hidden">
            {/* Left Side: Image Preview */}
            <div className="w-full md:w-2/3 p-4 md:p-8 flex items-center justify-center bg-gray-50 border-b md:border-r md:border-b-0 border-gray-200">
              {isLoading && !currentItem ? (
                <LoadingSpinner />
              ) : error && !currentItem ? (
                <ErrorDisplay message={error} onRetry={() => fetchUnknownFirearms()} />
              ) : currentItem ? (
                <div className="relative w-full h-full flex items-center justify-center">
                  <img
                    src={getImageUrl()}
                    alt="Firearm to classify"
                    className="object-contain max-h-[460px] w-auto max-w-full rounded-lg shadow"
                    loading="eager"
                  />
                  
                  {/* Mobile Navigation Controls (only visible on small screens) */}
                  <div className="md:hidden flex items-center justify-between absolute bottom-2 left-0 right-0 px-4">
                    <button
                      onClick={goToPrevious}
                      disabled={currentIndex === 0 || isLoading}
                      className={`p-3 rounded-full transition-all text-white ${
                        currentIndex === 0 || isLoading
                          ? 'bg-gray-300 cursor-not-allowed'
                          : 'bg-blue-500 hover:bg-blue-600 shadow-md'
                      }`}
                    >
                      <FaArrowLeft size={16} />
                    </button>
                    
                    <span className="bg-black bg-opacity-50 text-white text-xs px-3 py-1 rounded-full">
                      {currentIndex + 1} / {unknownFirearms.length}
                    </span>
                    
                    <button
                      onClick={goToNext}
                      disabled={currentIndex >= unknownFirearms.length - 1 || isLoading}
                      className={`p-3 rounded-full transition-all text-white ${
                        currentIndex >= unknownFirearms.length - 1 || isLoading
                          ? 'bg-gray-300 cursor-not-allowed'
                          : 'bg-blue-500 hover:bg-blue-600 shadow-md'
                      }`}
                    >
                      <FaArrowRight size={16} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-gray-500 flex flex-col items-center">
                  <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 8V12" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 16H12.01" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <p className="mt-2">ไม่มีรายการให้แสดง</p>
                </div>
              )}
            </div>

            {/* Right Side: Controls */}
            <div className="w-full md:w-1/3 p-4 md:p-6 flex flex-col space-y-4 bg-white">
              {/* Top Indicators */}
              <div className="flex justify-between items-center">
                <span className="hidden md:inline-block text-sm text-gray-500 font-medium bg-gray-100 px-3 py-1.5 rounded-full">
                  {currentIndex + 1} / {unknownFirearms.length}
                </span>
                <span className={`px-3 py-1.5 rounded-full font-medium text-xs md:text-sm ${
                  selectedClass 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {selectedClass ? `เลือก: ${selectedClass}` : 'ยังไม่ระบุชนิด'}
                </span>
              </div>

              {/* Select Dropdown Area */}
              <div className="relative flex-grow flex flex-col">
                <label htmlFor="firearm-select" className="block text-sm font-medium text-gray-700 mb-1.5">
                  ชนิดปืน:
                </label>
                <Select
                  inputId="firearm-select"
                  options={groupedSelectOptions}
                  onChange={handleSelectChange}
                  value={selectOptions.find(option => option.value === selectedClass) || null}
                  isDisabled={isLoading || !currentItem}
                  placeholder="เลือกหรือค้นหาชนิดปืน..."
                  noOptionsMessage={() => "ไม่พบตัวเลือก"}
                  isClearable
                  isSearchable
                  styles={selectStyles}
                  components={{ 
                    DropdownIndicator,
                  }}
                  className="react-select-container"
                  menuPortalTarget={document.body}
                  menuPlacement="auto"
                />
              </div>
              
              {/* Save Button */}
              <div className="mt-auto pt-4 border-t border-gray-200">
                <button
                  onClick={handleSave}
                  disabled={!selectedClass || isLoading || !currentItem}
                  className={`w-full flex items-center justify-center py-3 px-4 rounded-lg transition-all text-base font-medium ${
                    !selectedClass || isLoading || !currentItem
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-green-600 text-white hover:bg-green-700 shadow hover:shadow-lg active:transform active:scale-[0.98]'
                  }`}
                >
                  <FaSave className="mr-2" /> 
                  {isLoading ? 'กำลังบันทึก...' : 'บันทึกการระบุชนิด'}
                </button>
              </div>
            </div>
          </div>

          {/* Next Button (Outside Card Right) */}
          <button
            onClick={goToNext}
            disabled={currentIndex >= unknownFirearms.length - 1 || isLoading}
            className={`hidden md:flex p-4 rounded-full transition-all text-white ml-2 ${
              currentIndex >= unknownFirearms.length - 1 || isLoading
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600 shadow-lg hover:shadow-xl active:scale-95'
            }`}
            title="รายการถัดไป (ลูกศรขวา)"
          >
            <FaArrowRight size={20} />
          </button>
        </div>
      </main>
      
      {/* Modal for creating a new gun */}
      {showCreateGunModal && (
        <CreateGunModal
          isOpen={showCreateGunModal}
          onClose={() => setShowCreateGunModal(false)}
          onGunCreated={handleGunCreated}
        />
      )}
    </div>
  );
};

export default LabelGun;