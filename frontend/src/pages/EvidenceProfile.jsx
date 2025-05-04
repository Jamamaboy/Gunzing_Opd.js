import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import TabBar from '../components/EvidenceProfile/TabBar';
import BottomBar from '../components/EvidenceProfile/BottomBar';
import GunBasicInformation from '../components/EvidenceProfile/GunProfile';
import DrugBasicInformation from '../components/EvidenceProfile/DrugProfile';
import Gallery from '../components/EvidenceProfile/Gallery';
import History from '../components/EvidenceProfile/History';

const EvidenceProfile = () => {
  const location = useLocation();
  
  // Determine activeTab based on current path
  const [activeTab, setActiveTab] = useState(() => {
    if (location.pathname.includes('/gallery')) return 1;
    else if (location.pathname.includes('/history')) return 2;
    return 0;
  });

  // Update activeTab when location changes
  useEffect(() => {
    if (location.pathname.includes('/gallery')) {
      setActiveTab(1);
    } else if (location.pathname.includes('history')) {
      setActiveTab(2);
    } else {
      setActiveTab(0);
    }
  }, [location.pathname]);

  // Get evidence type and result from location state or localStorage
  const [evidence, setEvidence] = useState(() => {
    // Try to get from location first
    if (location.state && (location.state.type || location.state.evidence)) {
      if (location.state.type) {
        return {
          type: location.state.type,
          result: location.state.result
        };
      }
      if (location.state.evidence) {
        return location.state.evidence;
      }
    }
    
    // Otherwise try to get from localStorage
    const savedResult = localStorage.getItem('analysisResult');
    if (savedResult) {
      // Determine evidence type based on the result structure
      const result = JSON.parse(savedResult);
      const type = result.hasOwnProperty('prediction') ? 'Drug' : 'Gun';
      return { type, result };
    }
    
    // Try to get from current evidence data (for coming back from record)
    const currentEvidence = localStorage.getItem('currentEvidenceData');
    if (currentEvidence) {
      return JSON.parse(currentEvidence);
    }
    
    // Default if nothing is found
    return { type: '', result: null };
  });

  // Store evidence in localStorage whenever it changes
  useEffect(() => {
    if (evidence && (evidence.type || evidence.result)) {
      localStorage.setItem('currentEvidenceData', JSON.stringify(evidence));
    }
  }, [evidence]);

  // Debug log
  useEffect(() => {
    console.log('Evidence:', evidence);
  }, [evidence]);

  const renderBasicInfo = () => {
    if (!evidence || (!evidence.type && !evidence.result)) {
      return <div className="p-4 text-red-600">ไม่พบข้อมูลวัตถุพยาน</div>;
    }

    const evidenceType = evidence.type || (evidence.result?.hasOwnProperty('prediction') ? 'Drug' : 'Gun');
    
    switch (evidenceType) {
      case 'Gun':
        return <GunBasicInformation analysisResult={evidence.result || evidence} />;
      case 'Drug':
        return <DrugBasicInformation analysisResult={evidence.result || evidence} />;
      default:
        return <div className="p-4 text-red-600">ไม่พบข้อมูลวัตถุพยาน</div>;
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 0:
        return renderBasicInfo();
      case 1:
        return <Gallery evidence={evidence} />;
      case 2:
        return <History />;
      default:
        return null;
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <TabBar />
      <div className="flex-1 overflow-auto">
        {renderContent()}
      </div>
      <BottomBar />
    </div>
  );
};

export default EvidenceProfile;