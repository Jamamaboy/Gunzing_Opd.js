import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import PrimaryBar from '../components/PrimaryBar';
import SecondaryBar from '../components/SecondaryBar';
import Navigation from '../components/Navigation';
import TabBar from '../components/EvidenceBasicInform/TabBar';
import BottomBar from '../components/EvidenceBasicInform/BottomBar';
import GunBasicInformation from '../components/EvidenceBasicInform/GunBasicInformation';
import DrugBasicInformation from '../components/EvidenceBasicInform/DrugBasicInformation';

const EvidenceBasicInform = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(() => {
    if (location.pathname.includes('/evidenceBasicInform')) return 0;
    if (location.pathname.includes('/evidenceBasicInform/Images')) return 1;
    if (location.pathname.includes('/evidenceBasicInform/History')) return 2;
    if (location.pathname.includes('/evidenceBasicInform/Map')) return 3;
    return 0;
  });

  // Get evidence type and result from location state or localStorage
  const [evidence, setEvidence] = useState(() => {
    // Try to get from location first
    if (location.state && location.state.type) {
      return {
        type: location.state.type,
        result: location.state.result
      };
    }
    
    // Otherwise try to get from localStorage
    const savedResult = localStorage.getItem('analysisResult');
    if (savedResult) {
      // Determine evidence type based on the result structure
      const result = JSON.parse(savedResult);
      const type = result.hasOwnProperty('prediction') ? 'Drug' : 'Gun';
      return { type, result };
    }
    
    // Default if nothing is found
    return { type: '', result: null };
  });

  // Debug log
  useEffect(() => {
    console.log('Evidence:', evidence);
  }, [evidence]);

  const renderBasicInfo = () => {
    if (!evidence || !evidence.type) {
      return <div className="p-4 text-red-600">ไม่พบข้อมูลวัตถุพยาน</div>;
    }

    switch (evidence.type) {
      case 'Gun':
        return <GunBasicInformation analysisResult={evidence.result} />;
      case 'Drug':
        return <DrugBasicInformation analysisResult={evidence.result} />;
      default:
        return <div className="p-4 text-red-600">ไม่พบข้อมูลวัตถุพยาน</div>;
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 0:
        return renderBasicInfo();
      case 1:
        return <div className="p-4">คลังภาพ</div>;
      case 2:
        return <div className="p-4">ประวัติ</div>;
      case 3:
        return <div className="p-4">แผนที่</div>;
      default:
        return null;
    }
  };

  return (
    <div className="h-screen flex flex-col">
      <div className="hidden sm:block">
        <PrimaryBar />
        <SecondaryBar />
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="hidden sm:block">
          <Navigation />
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">
          <TabBar activeTab={activeTab} setActiveTab={setActiveTab} />
          <div className="flex-1 overflow-auto bg-[#F5F5F5]">
            {renderContent()}
          </div>
          <BottomBar />
        </div>
      </div>
    </div>
  );
};

export default EvidenceBasicInform;