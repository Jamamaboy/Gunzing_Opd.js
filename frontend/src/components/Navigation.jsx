import React, { useState, useEffect, useRef } from 'react';
import { FiMenu, FiChevronDown, FiChevronUp, FiX } from 'react-icons/fi';
import { FaHome, FaCamera, FaUpload, FaPills, FaHistory } from "react-icons/fa";
import { FaMapLocationDot, FaFolderOpen, FaChartSimple } from "react-icons/fa6";
import { useNavigate, useLocation } from 'react-router-dom';
import { useUI } from '../context/UIContext'; // เพิ่มการ import useUI

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(false);

  // ใช้ state จาก UIContext แทน
  const {
    isSidebarOpen,
    setIsSidebarOpen,
    isBottomSheetOpen,
    setIsBottomSheetOpen,
    isUploadDropdownOpen,
    setIsUploadDropdownOpen,
    activeTab,
    setActiveTab,
    toggleSidebar: uiToggleSidebar
  } = useUI();

  const [sheetTranslateY, setSheetTranslateY] = useState('100%');
  const [sheetTransition, setSheetTransition] = useState('transform 0.3s ease-out');

  const dropdownRef = useRef(null);
  const bottomSheetRef = useRef(null);
  const startY = useRef(0);
  const currentY = useRef(0);
  const isDragging = useRef(false);
  const sheetHeight = useRef(0);

  // คำนวณ activeTab ให้รองรับ path ย่อย เมื่อเริ่มต้น
  useEffect(() => {
    const path = location.pathname;

    // จัดการกับ path ของ catalog
    if (path.startsWith('/selectCatalogType')) {
      setActiveTab('selectCatalogType');
    } else {
      // จัดการกับ path อื่นๆ
      const basePath = path.split('/')[1] || 'home';
      setActiveTab(basePath);
    }
  }, []); // เรียกเฉพาะตอน mount

  // เมื่อ location เปลี่ยน อัพเดต activeTab ด้วย
  useEffect(() => {
    const path = location.pathname;

    // จัดการกับ path ของ catalog
    if (path.startsWith('/selectCatalogType')) {
      setActiveTab('selectCatalogType');
      return;
    }

    // จัดการกับ path อื่นๆ
    const basePath = path.split('/')[1] || 'home';
    setActiveTab(basePath);
  }, [location.pathname, setActiveTab]);

  // Define handleUploadOptionClick first (since it's used by handleUploadClick)
  const handleUploadOptionClick = (e) => {
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
          // Navigate to ImagePreview route without specifying a mode
          navigate('/imagePreview', {
            state: {
              imageData: event.target.result,
              // Add these important source tracking properties
              fromCamera: false,
              uploadFromCameraPage: false,
              // Use the current path as sourcePath
              sourcePath: location.pathname
            }
          });
        };
        reader.readAsDataURL(file);
      }
    };

    input.click();

    // ปิด dropdown เฉพาะตอน sidebar ย่อ
    if (!isSidebarOpen) {
      setIsUploadDropdownOpen(false);
    }

    closeBottomSheet();
  };

  // Define handleUploadClick to fix the error
  const handleUploadClick = (e) => {
    e.stopPropagation();
    handleUploadOptionClick(e);
  };

  // Check screen size and set mobile state
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setIsSidebarOpen(false);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, [setIsSidebarOpen]);

  // Save sidebar state to localStorage
  useEffect(() => {
    localStorage.setItem('sidebarState', JSON.stringify(isSidebarOpen));
  }, [isSidebarOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!isSidebarOpen && dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsUploadDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isUploadDropdownOpen, isSidebarOpen, setIsUploadDropdownOpen]);

  // Close dropdown when sidebar collapses
  useEffect(() => {
    if (!isSidebarOpen) {
      setIsUploadDropdownOpen(false);
    }
  }, [isSidebarOpen, setIsUploadDropdownOpen]);

  // Handle Bottom Sheet animation
  useEffect(() => {
    if (isBottomSheetOpen) {
      requestAnimationFrame(() => {
        if (bottomSheetRef.current) {
          if (sheetHeight.current === 0) {
            sheetHeight.current = bottomSheetRef.current.offsetHeight;
          }
          setSheetTranslateY('0%');
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
    // { id: 'camera', icon: <FaCamera size={24} />, text: "ถ่ายภาพ", path: "/camera", showInBottom: true, isSpecial: true },
    { id: 'upload', icon: <FaUpload size={24} />, text: "อัพโหลดภาพ", action: handleUploadClick, showInBottom: true },
    // { id: 'history', icon: <FaHistory size={24} />, text: "ประวัติ", path: "/history", showInBottom: true },
    // { id: 'selectCatalogType', icon: <FaFolderOpen size={24} />, text: "บัญชีวัตถุพยาน", path: "/selectCatalogType", showInBottom: false },
    // { id: 'dashboard', icon: <FaChartSimple size={24} />, text: "แดชบอร์ด", path: "/dashboard", showInBottom: false },
    // { id: 'map', icon: <FaMapLocationDot size={24} />, text: "แผนที่", path: "/map", showInBottom: true },
  ];

  const handleNavClick = (e, path, id) => {
    e.stopPropagation();
    setActiveTab(id);
    navigate(path);

    if (!isSidebarOpen && id !== 'upload') {
      setIsUploadDropdownOpen(false);
    }

    closeBottomSheet();
  };

  const closeBottomSheet = () => {
    setSheetTransition('transform 0.3s ease-out');
    setSheetTranslateY('100%');

    setTimeout(() => {
      setIsBottomSheetOpen(false);
    }, 300);
  };

  // ใช้ toggleSidebar ที่มาจาก UIContext แทน
  const toggleSidebar = () => {
    const newState = !isSidebarOpen;
    setIsSidebarOpen(newState);

    // Close dropdown when sidebar is collapsed
    if (!newState) {
      setIsUploadDropdownOpen(false);
    }
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
            onClick={toggleSidebar}
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
              {!item.hasDropdown ? (
                <button
                  onClick={(e) => item.action ? item.action(e) : handleNavClick(e, item.path, item.id)}
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
              ) : null}
            </div>
          ))}
        </nav>
      </div>
    </div>
  );

  return (
    <>
      {isMobile ? <BottomNav /> : <Sidebar />}
      {isMobile && <BottomSheet />}
      <div className={`${isMobile ? 'pb-16' : ''} ${isSidebarOpen && !isMobile ? '' : ''} transition-all duration-300`}>
      </div>
    </>
  );
};

export default Navigation;
