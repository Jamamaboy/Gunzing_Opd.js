import React, { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom';
import TabBar from '../components/History/TabBar'
import BottomBar from '../components/History/BottomBar'
import GunHistoryProfile from '../components/History/GunHistoryProfile'
import DrugHistoryProfile from '../components/History/DrugHistoryProfile';

const EvidenceHistoryProfile = () => {
  const location = useLocation();
  const { item } = location.state || {};

  console.log({item});
  

  if (!item) {
    return <div>ไม่พบข้อมูล</div>
  }

  const [activeTab, setActiveTab] = useState(() => {
    return 0;
  });

  const renderBasicInfo = () => {
    if(!item || !item.category) return null;

    switch(item.category) {
      case 'อาวุธปืน':
        return <GunHistoryProfile item={item} />;
      case 'ยาเสพติด':
        return <DrugHistoryProfile item={item} />;
      default:
        return <div>ไม่พบหมวดหมู่</div>
    }
  }
  
  const renderContent = () => {
    switch (activeTab) {
      case 0:
        return renderBasicInfo();
      default:
        return null;
    }
  }

  return (
    <div className='flex-1 flex flex-col overflow-hidden'>
        <TabBar />
        <div className='flex-1 overflow-auto'>
          {renderContent()}
        </div>
        <BottomBar />
    </div>
  )
}

export default EvidenceHistoryProfile
