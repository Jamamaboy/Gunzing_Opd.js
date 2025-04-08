import React, { useState, useEffect, useRef } from 'react';
import { FiMenu, FiChevronDown, FiChevronUp, FiX } from 'react-icons/fi';
import { FaHome, FaCamera, FaUpload, FaPills, FaHistory } from "react-icons/fa";
import { FaMapLocationDot, FaFolderOpen } from "react-icons/fa6";
import { GiPistolGun } from "react-icons/gi";
import { useNavigate, useLocation } from 'react-router-dom';

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isUploadDropdownOpen, setUploadDropdownOpen] = useState(false);
  const [isBottomSheetOpen, setBottomSheetOpen] = useState(false);
  const [sheetTranslateY, setSheetTranslateY] = useState('100%');
  const [sheetTransition, setSheetTransition] = useState('transform 0.3s ease-out');
  
  const dropdownRef = useRef(null);
  const bottomSheetRef = useRef(null);
  const startY = useRef(0);
  const currentY = useRef(0);
  const isDragging = useRef(false);
  const sheetHeight = useRef(0);

  // Set active tab based on current path
  const [activeTab, setActiveTab] = useState(() => {
    const path = location.pathname.slice(1) || 'home';
    return path;
  });

  // Check screen size and set mobile state
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
        setBottomSheetOpen(false);
      }
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Close dropdown when clicking outside or when sidebar collapses
  useEffect(() => {
    const handleClickOutside = (event) => {
      // For collapsed sidebar dropdown
      if (!isSidebarOpen && dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setUploadDropdownOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isUploadDropdownOpen, isSidebarOpen]);

  // Close dropdown when sidebar collapses
  useEffect(() => {
    if (!isSidebarOpen) {
      setUploadDropdownOpen(false);
    }
  }, [isSidebarOpen]);

  // Effect to handle Bottom Sheet open/close animation
  useEffect(() => {
    if (isBottomSheetOpen) {
      requestAnimationFrame(() => {
        if (bottomSheetRef.current) {
          if (sheetHeight.current === 0) {
            sheetHeight.current = bottomSheetRef.current.offsetHeight;
          }
          setSheetTranslateY('0%'); // Animate open
          setSheetTransition('transform 0.3s ease-out');
        }
      });
    } else {
      setSheetTranslateY('100%');
      setSheetTransition('transform 0.3s ease-out');
    }
  }, [isBottomSheetOpen]);

  // Close bottom sheet when clicking outside backdrop
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isBottomSheetOpen &&
          bottomSheetRef.current &&
          !bottomSheetRef.current.contains(event.target)) {
        if (event.target.id === 'bottom-sheet-backdrop') {
          closeBottomSheet();
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isBottomSheetOpen]);

  const menuItems = [
    { id: 'home', icon: <FaHome size={24} />, text: "หน้าหลัก", path: "/home", showInBottom: true },
    { id: 'camera', icon: <FaCamera size={24} />, text: "ถ่ายภาพ", path: "/camera", showInBottom: true, isSpecial: true },
    { id: 'upload', icon: <FaUpload size={24} />, text: "อัพโหลดภาพ", path: "/upload", showInBottom: true, hasDropdown: true },
    { id: 'history', icon: <FaHistory size={24} />, text: "ประวัติ", path: "/history", showInBottom: true },
    { id: 'selectCatalogType', icon: <FaFolderOpen size={24} />, text: "บัญชีวัตถุพยาน", path: "/selectCatalogType", showInBottom: false },
    { id: 'map', icon: <FaMapLocationDot size={24} />, text: "แผนที่", path: "/map", showInBottom: true },
  ];

  const uploadDropdownItems = [
    { id: 'upload-gun', icon: <GiPistolGun size={24} />, text: "อาวุธปืน", path: "/upload/photo", mode: "อาวุปืน" },
    { id: 'upload-drug', icon: <FaPills size={24} />, text: "ยาเสพติด", path: "/upload/album", mode: "ยาเสพติด" },
  ];

  const bottomSheetItems = [
    { id: 'upload-gun', icon: <GiPistolGun size={24} />, text: "อาวุธปืน", path: "/upload/photo", mode: "อาวุปืน", action: "uploadOption" },
    { id: 'upload-drug', icon: <FaPills size={24} />, text: "ยาเสพติด", path: "/upload/album", mode: "ยาเสพติด", action: "uploadOption" },
    ...menuItems.filter(item => !item.showInBottom),
  ];

  const bottomNavItems = menuItems.filter(item => item.showInBottom);
  
  const handleNavClick = (e, path, id) => {
    e.stopPropagation();
    setActiveTab(id);
    navigate(path);
    
    // ถ้าเป็น sidebar ที่ย่อแล้ว (collapsed) ให้ปิด dropdown เมื่อเลือกเมนูอื่น
    if (!isSidebarOpen && id !== 'upload') {
      setUploadDropdownOpen(false);
    }
    
    closeBottomSheet();
  };

  const handleUploadOptionClick = (e, item) => {
    e.stopPropagation();
    
    // Create file input element
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          // Navigate to ImagePreview route with image data and mode
          navigate('/imagePreview', { 
            state: { 
              imageData: event.target.result, 
              mode: item.mode 
            } 
          });
        };
        reader.readAsDataURL(file);
      }
    };
    
    input.click();
    
    // ปิด dropdown เฉพาะตอน sidebar ย่อ
    if (!isSidebarOpen) {
      setUploadDropdownOpen(false);
    }
    
    closeBottomSheet();
  };

  const toggleUploadDropdown = (e) => {
    e.stopPropagation();
    
    // If sidebar is collapsed and user clicks on upload button, expand the sidebar first
    if (!isSidebarOpen && !isMobile) {
      setSidebarOpen(true);
      // Open the dropdown after sidebar is expanded
      setTimeout(() => {
        setUploadDropdownOpen(true);
      }, 300); // Match transition duration
    } else {
      // Normal toggle behavior
      setUploadDropdownOpen(!isUploadDropdownOpen);
    }
  };

  const handleBottomSheetItemClick = (e, item) => {
    if (item.action === 'uploadOption') {
      handleUploadOptionClick(e, item);
    } else {
      handleNavClick(e, item.path, item.id);
    }
  };

  const closeBottomSheet = () => {
    // ตั้งค่า transition ให้ animate ก่อนที่จะปิด bottom sheet
    setSheetTransition('transform 0.3s ease-out');
    setSheetTranslateY('100%');
    
    // หลังจากที่ animation เสร็จสิ้นแล้วจึงค่อยปิด bottom sheet
    setTimeout(() => {
      setBottomSheetOpen(false);
    }, 300); // ต้องตรงกับเวลา transition
  };

  // Touch Handlers for Draggable Bottom Sheet
  const handleTouchStart = (e) => {
    if (!bottomSheetRef.current) return;
    const targetElement = e.target;
    const scrollableParent = targetElement.closest('.overflow-y-auto');
    if (scrollableParent && scrollableParent.scrollTop > 0 && scrollableParent.contains(targetElement)) {
        isDragging.current = false;
        return;
    }

    startY.current = e.touches[0].clientY;
    currentY.current = startY.current;
    isDragging.current = true;
    setSheetTransition('none');

    if (bottomSheetRef.current) {
      sheetHeight.current = bottomSheetRef.current.offsetHeight;
    }
  };

  const handleTouchMove = (e) => {
    if (!isDragging.current || !bottomSheetRef.current) return;

    const y = e.touches[0].clientY;
    const diffY = y - startY.current;
    currentY.current = y;

    const newTranslateY = Math.max(0, diffY);
    bottomSheetRef.current.style.transform = `translateY(${newTranslateY}px)`;
  };

  const handleTouchEnd = (e) => {
    if (!isDragging.current || !bottomSheetRef.current) {
        isDragging.current = false;
        return;
    }

    if (startY.current === 0) {
        isDragging.current = false;
        return;
    }

    isDragging.current = false;
    setSheetTransition('transform 0.3s ease-out');

    const finalY = currentY.current;
    const diffY = finalY - startY.current;
    const closeThreshold = sheetHeight.current > 0 ? sheetHeight.current * 0.25 : 80;

    if (diffY > closeThreshold) {
      closeBottomSheet();
    } else {
      setSheetTranslateY('0%');
      requestAnimationFrame(() => {
          if (bottomSheetRef.current) {
              bottomSheetRef.current.style.transform = '';
          }
      });
    }

    startY.current = 0;
    currentY.current = 0;
  };

  const Sidebar = () => (
    <div className="h-full">      
      <div className={`
        h-full 
        ${isSidebarOpen ? "w-64" : "w-14"} 
        bg-gradient-to-b from-[#2C2C2C] to-[#1A1A1A] text-white 
        flex flex-col 
        transition-all duration-300 
        overflow-hidden
        relative
      `}>
        <div className="p-4">
          <button 
            onClick={() => {
              setSidebarOpen(!isSidebarOpen);
              // Close dropdown when collapsing sidebar
              if (isSidebarOpen) {
                setUploadDropdownOpen(false);
              }
            }} 
            className="text-white hover:text-gray-300 transition-colors"
          >
            <FiMenu size={24} />
          </button>
        </div>
        
        <nav className="flex-1 space-y-1">
          {menuItems.map((item) => (
            <div key={item.id} className="relative" ref={item.id === 'upload' ? dropdownRef : null}>
              {activeTab === item.id && (
                <div className="absolute left-0 top-0 w-2 h-full bg-[#990000]" />
              )}
              {item.hasDropdown ? (
                <div>
                  <button
                    onClick={toggleUploadDropdown}
                    className={`
                      flex items-center justify-between px-4 py-4 w-full text-left
                      hover:bg-[#444444] transition-all
                      ${activeTab === item.id || isUploadDropdownOpen ? 'bg-[#444444]' : ''}
                    `}
                  >
                    <div className="flex items-center space-x-6">
                      <div className="min-w-[24px]">
                        {item.icon}
                      </div>
                      <span className={`text-base whitespace-nowrap transition-opacity ${isSidebarOpen ? 'opacity-100' : 'opacity-0'}`}>
                        {item.text}
                      </span>
                    </div>
                    {isSidebarOpen && (
                      <div className="text-gray-400">
                        {isUploadDropdownOpen ? <FiChevronUp size={20} /> : <FiChevronDown size={20} />}
                      </div>
                    )}
                  </button>
                  
                  {/* Dropdown Menu - Only show when sidebar is expanded */}
                  {isUploadDropdownOpen && isSidebarOpen && (
                    <div className="bg-[#222222]">
                      {uploadDropdownItems.map((subItem) => (
                        <button
                          key={subItem.id}
                          onClick={(e) => handleUploadOptionClick(e, subItem)}
                          className={`
                            flex items-center space-x-6 
                            px-16
                            py-3 w-full text-left
                            hover:bg-[#333333] transition-all
                            ${activeTab === subItem.id ? 'bg-[#333333] text-white' : 'text-gray-300'}
                          `}
                        >
                          <div className="min-w-[24px]">
                            {subItem.icon}
                          </div>
                          <span className="text-base whitespace-nowrap">
                            {subItem.text}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={(e) => handleNavClick(e, item.path, item.id)}
                  className={`
                    flex items-center space-x-6 px-4 py-4 w-full text-left
                    hover:bg-[#444444] transition-all
                    ${activeTab === item.id ? 'bg-[#444444]' : ''}
                  `}
                >
                  <div className="min-w-[24px]">
                    {item.icon}
                  </div>
                  <span className={`text-base whitespace-nowrap transition-opacity ${isSidebarOpen ? 'opacity-100' : 'opacity-0'}`}>
                    {item.text}
                  </span>
                </button>
              )}
            </div>
          ))}
        </nav>
      </div>
    </div>
  );

  const BottomNav = () => {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-40">
        {/* Background with blur */}
        <div className="absolute inset-0 bg-[#333333] border-t border-gray-700/50" />
        
        {/* Main Navigation */}
        <div className="relative h-16 px-4">
          <div className="flex items-center justify-between h-full">
            {/* Home */}
            <button
              onClick={(e) => handleNavClick(e, "/home", 'home')}
              className={`
                flex flex-col items-center justify-center w-16 h-full
                transition-all duration-200
                ${activeTab === 'home' ? 'text-white' : 'text-gray-400 hover:text-gray-200'}
              `}
            >
              <FaHome size={22} />
              <span className="text-[10px] mt-1 font-medium">หน้าหลัก</span>
            </button>

            {/* History */}
            <button
              onClick={(e) => handleNavClick(e, "/history", 'history')}
              className={`
                flex flex-col items-center justify-center w-16 h-full
                transition-all duration-200
                ${activeTab === 'history' ? 'text-white' : 'text-gray-400 hover:text-gray-200'}
              `}
            >
              <FaHistory size={22} />
              <span className="text-[10px] mt-1 font-medium">ประวัติ</span>
            </button>

            {/* Camera Button (center) */}
            <button
              onClick={(e) => handleNavClick(e, "/camera", 'camera')}
              className="flex flex-col items-center justify-center w-16 -mt-6"
            >
              <div className="
                bg-[#990000] rounded-full p-4
                shadow-lg shadow-red-900/30
                transition-transform duration-200
                hover:scale-105
                relative
              ">
                <FaCamera size={24} className="text-white" />
              </div>
            </button>

            {/* Map */}
            <button
              onClick={(e) => handleNavClick(e, "/map", 'map')}
              className={`
                flex flex-col items-center justify-center w-16 h-full
                transition-all duration-200
                ${activeTab === 'map' ? 'text-white' : 'text-gray-400 hover:text-gray-200'}
              `}
            >
              <FaMapLocationDot size={22} />
              <span className="text-[10px] mt-1 font-medium">แผนที่</span>
            </button>

            {/* Upload Menu */}
            <button
              onClick={() => setBottomSheetOpen(true)}
              className={`
                flex flex-col items-center justify-center w-16 h-full
                transition-all duration-200
                ${isBottomSheetOpen ? 'text-white' : 'text-gray-400 hover:text-gray-200'}
              `}
            >
              <FiMenu size={22} />
              <span className="text-[10px] mt-1 font-medium">เพิ่มเติม</span>
            </button>
          </div>
        </div>
      </div>
    )
  };

  const BottomSheet = () => {
    if (!isBottomSheetOpen && sheetTranslateY === '100%') {
      return null;
    }

    return (
      <div
        id="bottom-sheet-backdrop"
        className={`fixed inset-0 z-50 flex items-end justify-center transition-opacity duration-300 ${
            isBottomSheetOpen ? 'bg-black bg-opacity-50' : 'bg-transparent pointer-events-none'
        }`}
        onClick={isBottomSheetOpen ? closeBottomSheet : undefined}
      >
        <div
          ref={bottomSheetRef}
          className="bg-[#1A1A1A] rounded-t-xl w-full max-h-[70vh] flex flex-col will-change-transform"
          style={{
            transform: `translateY(${sheetTranslateY})`,
            transition: sheetTransition,
            touchAction: 'none',
            visibility: !isBottomSheetOpen && sheetTranslateY !== '100%' ? 'hidden' : 'visible',
          }}
          onClick={(e) => e.stopPropagation()}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="flex-shrink-0 w-full flex justify-center pt-3 pb-3 cursor-grab">
            <div className="w-10 h-1.5 bg-gray-500 rounded-full"></div>
          </div>

          <div className="flex-shrink-0 px-4 pb-4 flex items-center justify-between border-b border-gray-700/50">
            <h2 className="text-white text-lg font-medium">เมนูเพิ่มเติม</h2>
            <button
              onClick={closeBottomSheet}
              className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-700"
            >
              <FiX size={20} />
            </button>
          </div>

          <div className="overflow-y-auto flex-grow" style={{ touchAction: 'pan-y' }}>
            <div className="grid grid-cols-4 gap-y-4 gap-x-2 px-4 py-4 pb-8">
              {bottomSheetItems.map((item) => (
                <button
                  key={item.id}
                  onClick={(e) => handleBottomSheetItemClick(e, item)}
                  className="flex flex-col items-center justify-start p-2 rounded-lg hover:bg-[#333333] transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[#555555]"
                  style={{ minHeight: '90px' }}
                >
                  <div className="text-white mb-2 h-12 w-12 flex items-center justify-center bg-[#444444] rounded-lg">
                    {item.icon}
                  </div>
                  <span className="text-white text-xs text-center leading-tight">
                    {item.text}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {isMobile ? <BottomNav /> : <Sidebar />}
      {isMobile && <BottomSheet />}
      <div className={`${isMobile ? 'pb-16' : ''} ${isSidebarOpen && !isMobile ? '' : ''} transition-all duration-300`}>
        {/* Your main content would go here */}
      </div>
    </>
  );
};

export default Navigation;