import React, { useState, useEffect } from 'react';
import { FiMenu, FiMoreHorizontal } from 'react-icons/fi';
import { FaHome, FaCamera, FaHistory, FaUpload } from "react-icons/fa";
import { FaFolderOpen, FaChartSimple, FaMapLocationDot  } from "react-icons/fa6";
import { useNavigate, useLocation } from 'react-router-dom';

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isMoreMenuOpen, setMoreMenuOpen] = useState(false);
  
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

  // Close more menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => isMoreMenuOpen && setMoreMenuOpen(false);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isMoreMenuOpen]);

  const menuItems = [
    { id: 'home', icon: <FaHome size={24} />, text: "หน้าหลัก", path: "/", showInBottom: true },
    { id: 'camera', icon: <FaCamera size={24} />, text: "ถ่ายภาพ", path: "/camera", showInBottom: true, isSpecial: true },
    { id: 'upload', icon: <FaUpload size={24} />, text: "อัพโหลดภาพ", path: "/upload", showInBottom: false },
    { id: 'history', icon: <FaHistory size={24} />, text: "ประวัติ", path: "/history", showInBottom: true },
    { id: 'folder', icon: <FaFolderOpen size={24} />, text: "บัญชีวัตถุพยาน", path: "/folder", showInBottom: false },
    { id: 'stats', icon: <FaChartSimple size={24} />, text: "สถิติ", path: "/stats", showInBottom: false },
    { id: 'map', icon: <FaMapLocationDot size={24} />, text: "แผนที่", path: "/map", showInBottom: true },
  ];

  const bottomNavItems = menuItems.filter(item => item.showInBottom);
  const moreMenuItems = menuItems.filter(item => !item.showInBottom);
  
  const handleNavClick = (e, path, id) => {
    e.stopPropagation();
    setActiveTab(id);
    navigate(path);
    setMoreMenuOpen(false);
  };

  const Sidebar = () => (
    <div className="h-full">      
      <div className={`
        h-full 
        ${isSidebarOpen ? "w-60" : "w-16"} 
        bg-gradient-to-b from-[#2C2C2C] to-[#1A1A1A] text-white 
        flex flex-col 
        transition-all duration-300 
        overflow-hidden
        relative
      `}>
        <div className="p-4">
          <button 
            onClick={() => setSidebarOpen(!isSidebarOpen)} 
            className="text-white hover:text-gray-300 transition-colors"
          >
            <FiMenu size={24} />
          </button>
        </div>
        
        <nav className="flex-1 space-y-1">
          {menuItems.map((item) => (
            <div key={item.id} className="relative">
              {activeTab === item.id && (
                <div className="absolute left-0 top-0 w-2 h-full bg-[#990000]" />
              )}
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
            </div>
          ))}
        </nav>
      </div>
    </div>
  );

  const BottomNav = () => {
    // Filter out the camera item from regular display (will show as special button)
    const regularItems = bottomNavItems.filter(item => !item.isSpecial);
    const leftItems = regularItems.slice(0, 2);
    const rightItems = regularItems.slice(2);
    const cameraItem = bottomNavItems.find(item => item.isSpecial);
    
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50">
        {/* Background with blur */}
        <div className="absolute inset-0 bg-[#333333] backdrop-blur-md border-t border-gray-700" />
        
        {/* Main Navigation */}
        <div className="relative h-16 px-6">
          <div className="flex justify-between items-center h-full">
            {/* Left Items */}
            <div className="flex space-x-9">
              {leftItems.map((item) => (
                <button
                  key={item.id}
                  onClick={(e) => handleNavClick(e, item.path, item.id)}
                  className={`
                    flex flex-col items-center justify-center
                    transition-all duration-200 w-12
                    ${activeTab === item.id ? 'text-white' : 'text-gray-400'}
                  `}
                >
                  {item.icon}
                  <span className="text-[10px] mt-1 font-medium">{item.text}</span>
                </button>
              ))}
            </div>

            {/* Center Camera Button */}
            {cameraItem && (
              <button
                onClick={(e) => handleNavClick(e, cameraItem.path, cameraItem.id)}
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
            )}

            {/* Right Items */}
            <div className="flex space-x-6">
              {rightItems.map((item) => (
                <button
                  key={item.id}
                  onClick={(e) => handleNavClick(e, item.path, item.id)}
                  className={`
                    flex flex-col items-center justify-center
                    transition-all duration-200 w-12
                    ${activeTab === item.id ? 'text-white' : 'text-gray-400'}
                  `}
                >
                  {item.icon}
                  <span className="text-[10px] mt-1 font-medium">{item.text}</span>
                </button>
              ))}

              {/* More Menu Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMoreMenuOpen(!isMoreMenuOpen);
                }}
                className={`
                  flex flex-col items-center justify-center w-12
                  transition-all duration-200
                  ${isMoreMenuOpen ? 'text-white' : 'text-gray-400'}
                `}
              >
                <FiMoreHorizontal size={22} />
                <span className="text-[10px] mt-1 font-medium">ดูเพิ่มเติม</span>
              </button>
            </div>
          </div>
        </div>

        {/* More Menu */}
        {isMoreMenuOpen && (
          <div className="absolute bottom-full left-0 right-0 bg-[#333333] border-t border-gray-700">
            {moreMenuItems.map((item) => (
              <button
                key={item.id}
                onClick={(e) => handleNavClick(e, item.path, item.id)}
                className={`
                  flex items-center space-x-3 px-6 py-3 w-full text-left
                  hover:bg-[#444444]
                  ${activeTab === item.id ? 'bg-[#444444] text-white' : 'text-gray-400'}
                `}
              >
                <div>{item.icon}</div>
                <span className="text-sm font-medium">{item.text}</span>
              </button>
            ))}
          </div>
        )}
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