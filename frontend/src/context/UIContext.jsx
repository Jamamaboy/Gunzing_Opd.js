import React, { createContext, useState, useContext } from 'react';

export const UIContext = createContext();

export const UIProvider = ({ children }) => {
  // Sidebar state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // BottomSheet state
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  
  // Active Tab state
  const [activeTab, setActiveTab] = useState('home');
  
  // Dropdown states
  const [isUploadDropdownOpen, setIsUploadDropdownOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(prev => !prev);
  const toggleBottomSheet = () => setIsBottomSheetOpen(prev => !prev);
  const toggleUploadDropdown = () => setIsUploadDropdownOpen(prev => !prev);
  
  // Modal/Dialog states
  const [activeModal, setActiveModal] = useState(null);
  
  const openModal = (modalId) => setActiveModal(modalId);
  const closeModal = () => setActiveModal(null);

  const uiContextValue = {
    // Sidebar
    isSidebarOpen,
    setIsSidebarOpen,
    toggleSidebar,
    
    // BottomSheet
    isBottomSheetOpen,
    setIsBottomSheetOpen,
    toggleBottomSheet,
    
    // Active Tab
    activeTab,
    setActiveTab,
    
    // Dropdown
    isUploadDropdownOpen,
    setIsUploadDropdownOpen,
    toggleUploadDropdown,
    
    // Modal/Dialog
    activeModal,
    openModal,
    closeModal
  };

  return (
    <UIContext.Provider value={uiContextValue}>
      {children}
    </UIContext.Provider>
  );
};

export const useUI = () => useContext(UIContext);

export default UIProvider;