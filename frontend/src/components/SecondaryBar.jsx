import React, { useState, useRef, useEffect } from "react";
import { FaSignOutAlt, FaBell, FaChevronDown } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const SecondaryBar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);
  
  return (
    <div className="w-full relative z-20 bg-white shadow-[0_1.5px_3px_rgba(0,0,0,0.25)]">
      {/* Mobile Layout */}
      <div className="sm:hidden h-[41px] flex items-center px-2 text-gray-800 justify-end gap-2 relative">
        {/* Notification Bell */}
        <button className="flex items-center justify-center text-gray-800 px-2 py-2 rounded hover:bg-gray-200">
          <FaBell className="text-gray-700 text-xl" />
        </button>
        {/* User Avatar with Dropdown */}
        {user && (
          <div className="relative" ref={dropdownRef}>
            <div
              className="w-[30px] h-[30px] rounded-full flex items-center justify-center bg-gray-100 border border-gray-200 text-blue-600 font-semibold text-sm shadow-sm ml-1 cursor-pointer"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              {user?.firstname?.charAt(0) || "ผ"}
            </div>
            {showDropdown && (
              <div className="absolute right-0 top-10 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-20 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-blue-600">
                    {user?.firstname?.charAt(0) || "ผ"}
                  </div>
                  <div className="text-sm font-medium text-gray-800 truncate max-w-[100px]">
                    {user?.firstname} {user?.lastname}
                  </div>
                </div>
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-2 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                >
                  <FaSignOutAlt className="text-gray-600" />
                  <span>ออกจากระบบ</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      {/* Desktop Layout */}
      <div className="hidden sm:flex h-[40px] items-center text-gray-800 justify-end">
        {/* Right-aligned Elements */}
        <div className="flex items-center h-full">
          {/* Notification Bell with Badge */}
          <div className="flex items-center h-full px-4 hover:bg-gray-100">
            <button className="h-full w-full hover:bg-gray-100 rounded-md transition-colors duration-150">
              <FaBell className="text-gray-700 text-xl" />
            </button>
          </div>
          
          {user && (
            <div className="flex items-center h-full px-4 hover:bg-gray-100 relative" ref={dropdownRef}>
              {/* User Profile */}
              <div 
                className="flex items-center gap-3 cursor-pointer group"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                {/* User Info */}
                <div className="flex flex-col items-end">
                  <div className="text-[13px] font-medium text-gray-800">
                    {user?.title} {user?.firstname} {user?.lastname}
                  </div>
                  <div className="text-[12px] text-gray-600">
                    {user?.role?.role_name}
                  </div>
                </div>
                {/* User Avatar */}
                <div className="w-[30px] h-[30px] rounded-full flex items-center justify-center bg-gray-100 border border-gray-200 text-blue-600 font-semibold text-sm shadow-sm">
                  {user?.firstname?.charAt(0) || "ผ"}
                </div>
              </div>
              
              {/* Dropdown Menu */}
              {showDropdown && (
                <div className="absolute right-1 top-[42px] w-64 bg-white rounded-md shadow-lg border border-gray-200 z-20">
                  {/* Header */}
                  <div className="p-4 border-b border-gray-100">
                    <div className="text-xs text-gray-500 uppercase mb-1">{user?.department}</div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-blue-600">
                        {user?.firstname?.charAt(0) || "ผ"}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-800">
                          {user?.title} {user?.firstname} {user?.lastname}
                        </div>
                        <div className="text-xs text-gray-500">{user?.user_id}</div>
                        <div className="text-xs text-gray-500">{user?.role?.role_name}</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Menu Items */}
                  <div className="p-2">
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                    >
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                        <FaSignOutAlt className="text-gray-600" />
                      </div>
                      <span>ออกจากระบบ</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SecondaryBar;