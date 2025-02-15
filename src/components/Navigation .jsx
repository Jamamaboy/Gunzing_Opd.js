import React, { useState, useEffect } from 'react';
import { FiMenu, FiHome, FiCamera, FiDownload, FiClock, FiFolder, FiBarChart2, FiMap, FiMoreHorizontal } from 'react-icons/fi';

const Navigation = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isMoreMenuOpen, setMoreMenuOpen] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      }
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const allMenuItems = [
    { icon: <FiHome size={28} />, text: "หน้าหลัก", href: "#", showInBottom: true },
    { icon: <FiClock size={28} />, text: "ประวัติ", href: "#", showInBottom: true },
    { icon: <FiCamera size={28} />, text: "ถ่ายภาพ", href: "#", showInBottom: true },
    { icon: <FiMap size={28} />, text: "แผนที่", href: "#", showInBottom: true },
    { icon: <FiDownload size={28} />, text: "อัพโหลดภาพ", href: "#", showInBottom: false },
    { icon: <FiFolder size={28} />, text: "บัญชีของพยาน", href: "#", showInBottom: false },
    { icon: <FiBarChart2 size={28} />, text: "สถิติ", href: "#", showInBottom: false },
  ];

  const bottomNavItems = allMenuItems.filter(item => item.showInBottom);
  const moreMenuItems = allMenuItems.filter(item => !item.showInBottom);

  const Sidebar = () => (
    <div className={`h-full ${isSidebarOpen ? "w-64" : "w-16"} bg-[#2C2C2C] text-white flex flex-col transition-all duration-300 overflow-hidden`}>
      <div className="p-4">
        <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="text-white hover:text-gray-300 transition-colors">
          <FiMenu size={28} />
        </button>
      </div>
      
      <nav className="flex-1 space-y-1">
        {allMenuItems.map((item, index) => (
          <a
            key={index}
            href={item.href}
            className="flex items-center space-x-6 px-4 py-4 hover:bg-[#444444] transition-all"
          >
            <div className="min-w-[24px]">
              {item.icon}
            </div>
            <span className={`text-xl whitespace-nowrap transition-opacity ${isSidebarOpen ? 'opacity-100' : 'opacity-0'}`}>
              {item.text}
            </span>
          </a>
        ))}
      </nav>
    </div>
  );

  const BottomNav = () => (
    <div className="fixed bottom-0 left-0 right-0 bg-[#2C2C2C] text-white z-50">
      <nav className="flex justify-between items-center h-16">
        {bottomNavItems.map((item, index) => (
          <a
            key={index}
            href={item.href}
            className="flex-1 flex flex-col items-center justify-center space-y-1 hover:bg-[#444444] h-full"
          >
            {item.icon}
            <span className="text-xs">{item.text}</span>
          </a>
        ))}
        <button
          onClick={() => setMoreMenuOpen(!isMoreMenuOpen)}
          className="flex-1 flex flex-col items-center justify-center space-y-1 hover:bg-[#444444] h-full"
        >
          <FiMoreHorizontal size={20} />
          <span className="text-xs">ดูเพิ่มเติม</span>
        </button>
      </nav>

      {isMoreMenuOpen && (
        <div className="absolute bottom-16 left-0 right-0 bg-[#2C2C2C] border-t border-gray-700">
          {moreMenuItems.map((item, index) => (
            <a
              key={index}
              href={item.href}
              className="flex items-center space-x-3 px-4 py-3 hover:bg-[#444444]"
            >
              <div className="min-w-[24px]">{item.icon}</div>
              <span className="text-sm">{item.text}</span>
            </a>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <>
      {isMobile ? <BottomNav /> : <Sidebar />}
    </>
  );
};

export default Navigation;