import React, { useState, useEffect, useRef } from 'react';
import { FiMenu , FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { FaHome, FaCamera, FaUpload, FaPills, FaHistory } from "react-icons/fa";
import { FaMapLocationDot, FaFolderOpen } from "react-icons/fa6";
import { GiPistolGun } from "react-icons/gi";
import { useNavigate, useLocation } from 'react-router-dom';

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isMoreMenuOpen, setMoreMenuOpen] = useState(false);
  const [isUploadDropdownOpen, setUploadDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const mobileDropdownRef = useRef(null);
  
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
      if (mobile) setSidebarOpen(false);
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
      
      // For mobile dropdown
      if (isMobile && mobileDropdownRef.current && !mobileDropdownRef.current.contains(event.target)) {
        setUploadDropdownOpen(false);
      }
      
      if (isMoreMenuOpen) setMoreMenuOpen(false);
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMoreMenuOpen, isUploadDropdownOpen, isSidebarOpen, isMobile]);

  // Close dropdown when sidebar collapses
  useEffect(() => {
    if (!isSidebarOpen) {
      setUploadDropdownOpen(false);
    }
  }, [isSidebarOpen]);

  const menuItems = [
    { id: 'home', icon: <FaHome size={24} />, text: "หน้าหลัก", path: "/home", showInBottom: true },
    { id: 'camera', icon: <FaCamera size={24} />, text: "ถ่ายภาพ", path: "/camera", showInBottom: true, isSpecial: true },
    { id: 'upload', icon: <FaUpload size={24} />, text: "อัพโหลดภาพ", path: "/upload", showInBottom: false, hasDropdown: true },
    { id: 'history', icon: <FaHistory size={24} />, text: "ประวัติ", path: "/history", showInBottom: true, isSpecial: true },
    { id: 'selectCatalogType', icon: <FaFolderOpen  size={24} />, text: "บัญชีวัตถุพยาน", path: "/selectCatalogType", showInBottom: true, isSpecial: true },
    { id: 'map', icon: <FaMapLocationDot size={24} />, text: "แผนที่", path: "/map", showInBottom: true, isSpecial: true },
  ];

  const uploadDropdownItems = [
    { id: 'upload-gun', icon: <GiPistolGun size={24} />, text: "อาวุธปืน", path: "/upload/photo", mode: "อาวุปืน" },
    { id: 'upload-drug', icon: <FaPills size={24} />, text: "ยาเสพติด", path: "/upload/album", mode: "ยาเสพติด" },
  ];

  const bottomNavItems = menuItems.filter(item => item.showInBottom);
  const moreMenuItems = menuItems.filter(item => !item.showInBottom);
  
  const handleNavClick = (e, path, id) => {
    e.stopPropagation();
    setActiveTab(id);
    navigate(path);
    setMoreMenuOpen(false);
    
    // ถ้าเป็น sidebar ที่ย่อแล้ว (collapsed) หรือ mobile ให้ปิด dropdown เมื่อเลือกเมนูอื่น
    if ((!isSidebarOpen || isMobile) && id !== 'upload') {
      setUploadDropdownOpen(false);
    }
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
    
    // ปิด dropdown เฉพาะตอน sidebar ย่อและตอนเป็น mobile เท่านั้น
    if (!isSidebarOpen || isMobile) {
      setUploadDropdownOpen(false);
    }
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
      <div className="fixed bottom-0 left-0 right-0 z-50">
        {/* Background with blur */}
        <div className="absolute inset-0 bg-[#333333] backdrop-blur-md border-t border-gray-700" />
        
        {/* Main Navigation */}
        <div className="relative h-16 px-6">
          <div className="flex justify-between items-center h-full">
            {/* Left Home Item */}
            <div className="flex-1 flex justify-start">
              <button
                onClick={(e) => handleNavClick(e, "/home", 'home')}
                className={`
                  flex flex-col items-center justify-center
                  transition-all duration-200 w-20
                  ${activeTab === 'home' ? 'text-white' : 'text-gray-400'}
                `}
              >
                <FaHome size={24} />
                <span className="text-[10px] mt-1 font-medium">หน้าหลัก</span>
              </button>
            </div>

            {/* Center Camera Button */}
            <div className="flex-1 flex justify-center">
              <button
                onClick={(e) => handleNavClick(e, "/camera", 'camera')}
                className="flex flex-col items-center justify-center w-16 -mt-8"
              >
                <div className="
                  bg-[#990000] rounded-full p-4
                  shadow-lg shadow-red-500/20
                  transition-transform duration-200
                  hover:scale-110
                  relative
                ">
                  <FaCamera size={24} className="text-white" />
                </div>
              </button>
            </div>

            {/* Right Upload Item */}
            <div className="flex-1 flex justify-end relative" ref={mobileDropdownRef}>
              <button
                onClick={toggleUploadDropdown}
                className={`
                  flex flex-col items-center justify-center
                  transition-all duration-200 w-20
                  ${activeTab === 'upload' ? 'text-white' : 'text-gray-400'}
                `}
              >
                <FaUpload size={24} />
                <span className="text-[10px] mt-1 font-medium">อัพโหลดภาพ</span>
              </button>
              
              {/* Mobile dropdown for Upload options */}
              {isMobile && isUploadDropdownOpen && (
                <div className="absolute bottom-16 right-1 bg-gray-800 rounded-lg shadow-lg overflow-hidden w-40">
                  {uploadDropdownItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={(e) => handleUploadOptionClick(e, item)}
                      className="text-white hover:bg-gray-700 w-full text-left px-4 py-3 border-b border-gray-700 last:border-b-0"
                    >
                      {item.text}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {isMobile ? <BottomNav /> : <Sidebar />}
      {/* Add padding to main content to accommodate fixed sidebar/bottom nav */}
      <div className={`${isMobile ? 'pb-16' : ''} ${isSidebarOpen && !isMobile ? '' : ''} transition-all duration-300`}>
        {/* Your main content would go here */}
      </div>
    </>
  );
};

export default Navigation;