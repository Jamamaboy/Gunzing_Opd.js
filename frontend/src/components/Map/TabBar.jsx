import React, { useState } from 'react';

const TabBar = () => {
  const [activeTab, setActiveTab] = useState('map');

  const tabs = [
    { id: 'map', label: 'แผนที่' },
    { id: 'trends', label: 'ไทม์ไลน์' },
    { id: 'drug-types', label: 'ประเภทยาเสพติด' },
  ];

  return (
    <div className="flex bg-gray-100 border-b border-gray-300">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            className={`px-4 py-3 cursor-pointer text-base font-sans ${
              isActive ? 'bg-white font-bold' : 'bg-gray-100'
            }`}
            style={{
              borderBottom: isActive ? '2px solid #1a5276' : 'none'
            }}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};

export default TabBar;