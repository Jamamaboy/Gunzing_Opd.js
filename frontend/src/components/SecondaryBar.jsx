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
      <div className="hidden sm:flex h-[40px] items-center text-gray-800 justify-center">
        <h1 className="text-lg font-semibold">Dev mode test</h1>
      </div>
    </div>
  );
};

export default SecondaryBar;
