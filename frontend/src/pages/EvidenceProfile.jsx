import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDevice } from '../context/DeviceContext';
import TabBar from '../components/EvidenceProfile/TabBar';
import BottomBar from '../components/EvidenceProfile/BottomBar';
import GunBasicInformation from '../components/EvidenceProfile/GunProfile';
import DrugBasicInformation from '../components/EvidenceProfile/DrugProfile';
import Gallery from '../components/EvidenceProfile/Gallery';
import History from '../components/EvidenceProfile/History';
import Map from '../components/EvidenceProfile/Map';
import { api } from '../config/api';
import { getSessionId, hasValidSession } from '../utils/SessionManager';

let inMemoryEvidenceStore = null;
const API_PATH = '/api';

const EvidenceProfile = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isMobile, isTablet } = useDevice();
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  
  const [activeTab, setActiveTab] = useState(() => {
    if (location.pathname.includes('/gallery')) return 1;
    else if (location.pathname.includes('/history')) return 2;
    else if (location.pathname.includes('/map')) return 3;
    return 0;
  });

  useEffect(() => {
    if (location.pathname.includes('/gallery')) {
      setActiveTab(1);
    } else if (location.pathname.includes('/history')) {
      setActiveTab(2);
    } else if (location.pathname.includes('/map')) {
      setActiveTab(3);
    } else {
      setActiveTab(0);
    }
  }, [location.pathname]);
  
  const [evidence, setEvidence] = useState(() => {
    let initialData = {
      type: '',
      result: null,
      details: null,
      imageUrl: null,
      originalImageUrl: null // ✅ เพิ่มสำหรับเก็บภาพต้นฉบับ
    };

    if (location.state?.evidence) {
      inMemoryEvidenceStore = location.state.evidence;
      return location.state.evidence;
    }
    
    // ✅ รองรับภาพที่ crop แล้วจาก CandidateShow
    if (location.state?.type) {
      initialData = {
        type: location.state.type,
        result: location.state.result,
        imageUrl: location.state.image || localStorage.getItem('analysisImage'), // ✅ ใช้ภาพที่ crop แล้ว
        originalImageUrl: location.state.originalImage || localStorage.getItem('analysisImage') // ✅ เก็บภาพต้นฉบับ
      };
      inMemoryEvidenceStore = initialData;
      return initialData;
    }
    
    try {
      const savedResult = localStorage.getItem('analysisResult');
      if (savedResult) {
        const result = JSON.parse(savedResult);
        const type = localStorage.getItem('selectedEvidenceType') || 
                    (result.hasOwnProperty('prediction') ? 'Drug' : 'Gun');
        
        // ✅ ตรวจสอบว่าใน localStorage มีภาพที่ crop แล้วหรือไม่
        const analysisImage = localStorage.getItem('analysisImage');
        const croppedImage = localStorage.getItem('croppedAnalysisImage'); // ถ้ามีการเก็บแยก
        
        initialData = { 
          type, 
          result,
          imageUrl: croppedImage || analysisImage, // ✅ ให้ความสำคัญกับภาพที่ crop แล้ว
          originalImageUrl: analysisImage // ✅ เก็บภาพต้นฉบับ
        };
        inMemoryEvidenceStore = initialData;
        return initialData;
      }
      
      const evidenceType = localStorage.getItem('evidenceType');
      const imageUrl = localStorage.getItem('analysisImage');
      
      if (evidenceType || imageUrl) {
        return {
          type: evidenceType || '',
          result: null,
          imageUrl: imageUrl,
          originalImageUrl: imageUrl // ✅ ถ้าไม่มีภาพที่ crop แล้ว ใช้ภาพเดิม
        };
      }
    } catch (error) {
      console.warn('Error retrieving from localStorage:', error);
    }

    return initialData;
  });

  // Function to normalize brand and model name for API search
  const normalizeNameForSearch = (brandName, modelName) => {
    if (!brandName && !modelName) return '';
    
    // Remove all spaces, convert to lowercase, and remove special characters
    const normalizedBrand = brandName ? brandName.toLowerCase().replace(/[^a-z0-9]/g, '') : '';
    const normalizedModel = modelName ? modelName.toLowerCase().replace(/[^a-z0-9]/g, '') : '';
    
    // Combine brand and model without spaces
    return `${normalizedBrand}${normalizedModel}`;
  };

  // Function to fetch firearm details from API
  const fetchFirearmDetails = async (brandName, modelName) => {
    try {
      setIsLoading(true);
      setApiError(null);
      
      if (brandName === 'Unknown' && modelName === 'Unknown') {
        // *** ใช้ api (axios) แทน fetch ***
        const response = await api.get(`${API_PATH}/exhibits`);
        const exhibits = response.data;
        
        console.log('=== FIREARM FETCH RESPONSE (Unknown) ===');
        console.log('Status:', response.status);
        console.log('Exhibits count:', exhibits?.length);
        
        const unknownWeapon = exhibits.find(exhibit => exhibit.id === 21);
        
        if (unknownWeapon) {
          console.log('✅ Found unknown weapon:', unknownWeapon);
          setEvidence(prev => ({
            ...prev,
            details: {
              id: 21,
              brand: 'Unknown',
              model: '',
              type: 'อาวุธปืนประเภทไม่ทราบชนิด',
              exhibit: {
                id: 21,
                category: unknownWeapon.category,
                subcategory: unknownWeapon.subcategory,
              }
            }
          }));
          return true;
        }
        return false;
      }
      
      const normalizedName = normalizeNameForSearch(brandName, modelName);
      console.log('Normalized search name:', normalizedName);
      
      const response = await api.get(`${API_PATH}/exhibits`);
      const exhibits = response.data;
      
      console.log('=== FIREARM FETCH RESPONSE ===');
      console.log('Status:', response.status);
      console.log('Exhibits count:', exhibits?.length);
      
      if (!Array.isArray(exhibits)) {
        console.warn('Exhibits data is not an array:', exhibits);
        return false;
      }
      
      const matchingExhibit = exhibits.find(exhibit => 
        exhibit.firearm && 
        exhibit.category === 'อาวุธปืน' && // *** เพิ่มเงื่อนไข category ***
        normalizeNameForSearch(exhibit.firearm.brand, exhibit.firearm.model) === normalizedName
      );
      
      if (matchingExhibit) {
        console.log('✅ Found matching exhibit:', matchingExhibit);
        setEvidence(prev => ({
          ...prev,
          details: {
            ...matchingExhibit.firearm,
            exhibit: {
              id: matchingExhibit.id, // *** ใช้ exhibit.id แทน exhibit.firearm.id ***
              category: matchingExhibit.category,
              subcategory: matchingExhibit.subcategory,
            },
            images: matchingExhibit.firearm.example_images, // *** แก้ไข path ***
          }
        }));
        return true;
      } else {
        console.log('❌ No matching exhibit found');
        return false;
      }
    } catch (error) {
      console.error('=== FIREARM FETCH ERROR ===');
      console.error('Error:', error.message);
      setApiError(error.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Function to fetch drug details from API
  const fetchDrugDetails = async (narcoticId) => {
    if (!narcoticId) return false;
    
    try {
      setIsLoading(true);
      setApiError(null);
      
      console.log('=== DRUG FETCH REQUEST ===');
      console.log('Narcotic ID:', narcoticId);

      const response = await api.get(`${API_PATH}/narcotics/${narcoticId}`);
      const drugData = response.data;
      
      console.log('=== DRUG FETCH RESPONSE ===');
      console.log('Status:', response.status);
      console.log('Data:', drugData);
      
      // *** อัปเดตทั้ง details และ result ***
      setEvidence(prev => ({
        ...prev,
        details: drugData,
        result: {
          ...prev.result,
          exhibit_id: drugData.exhibit_id || drugData.exhibit?.id || prev.result.exhibit_id, // *** อัปเดต exhibit_id ***
          // เก็บข้อมูลเดิมไว้
          prediction: prev.result.prediction,
          confidence: prev.result.confidence,
          narcotic_id: prev.result.narcotic_id,
          similarity: prev.result.similarity
        }
      }));
      
      console.log('=== UPDATED EVIDENCE ===');
      console.log('Updated exhibit_id in result:', drugData.exhibit_id || drugData.exhibit?.id);
      
      return true;
    } catch (error) {
      console.error('=== DRUG FETCH ERROR ===');
      console.error('Error:', error.message);
      setApiError(error.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (evidence?.result) {
      const result = evidence.result;
      
      if (evidence.type === 'Gun' && result.brandName && result.modelName) {
        console.log('======= EVIDENCE SELECTION LOG =======');
        console.log(`User selected Brand: ${result.brandName}`);
        console.log(`User selected Model: ${result.modelName}`);
        console.log(`Brand confidence: ${result.brandConfidence ? (result.brandConfidence * 100).toFixed(2) + '%' : 'N/A'}`);
        console.log(`Model confidence: ${result.confidence ? (result.confidence * 100).toFixed(2) + '%' : 'N/A'}`);
        console.log('===================================');
        
        fetchFirearmDetails(result.brandName, result.modelName);
        
      } else if (evidence.type === 'Drug' && result.narcotic_id) {
        console.log('======= EVIDENCE SELECTION LOG =======');
        console.log(`User selected Drug ID: ${result.narcotic_id}`);
        console.log(`Drug prediction: ${result.prediction}`);
        console.log(`Confidence: ${result.confidence ? (result.confidence * 100).toFixed(2) + '%' : 'N/A'}`);
        console.log('===================================');
        
        fetchDrugDetails(result.narcotic_id);
        
      } else if (evidence.type === 'Unknown') {
        console.log('======= EVIDENCE SELECTION LOG =======');
        console.log('User selected: Unknown object');
        console.log('===================================');
      }
    }
  }, [evidence?.result, evidence?.type]); // *** เพิ่ม optional chaining ***

  // Store ONLY minimal reference data when evidence changes
  useEffect(() => {
    if (evidence && (evidence.type || evidence.imageUrl)) {
      // Update in-memory store first (no size limitations)
      inMemoryEvidenceStore = evidence;
      
      // Store only tiny references in localStorage
      try {
        // Store type as a simple string
        if (evidence.type) {
          localStorage.setItem('evidenceType', evidence.type);
        }
        
        // Store only essential result properties if any
        if (evidence.result) {
          const minimalResult = {
            className: evidence.result.className,
            confidence: evidence.result.confidence,
            prediction: evidence.result.prediction
          };
          
          // If this small object fits, store it
          try {
            localStorage.setItem('minimalEvidenceResult', JSON.stringify(minimalResult));
          } catch (err) {
            // If even this fails, just store a flag
            localStorage.setItem('hasEvidenceResult', 'true');
          }
        }
      } catch (error) {
        console.warn('Failed to store minimal evidence references:', error);
        // Non-critical error, app can still function with in-memory data
      }
    }
  }, [evidence]);

  // Store minimal firearm info
  useEffect(() => {
    if (evidence?.details) { // *** เพิ่ม optional chaining ***
      try {
        // Store only essential identifiers
        const minimalInfo = {
          type: evidence.type,
          id: evidence.details.id,
        };
        
        if (evidence.type === 'Gun') {
          minimalInfo.model = evidence.details.model;
          minimalInfo.brand = evidence.details.brand;
        } else if (evidence.type === 'Drug') {
          minimalInfo.drug_type = evidence.details.drug_type;
          minimalInfo.narcotic_id = evidence.details.id;
        }
        
        localStorage.setItem('evidenceDetails', JSON.stringify(minimalInfo));
        
        // Log details if available
        console.log('======= EVIDENCE DETAILS LOG =======');
        console.log(`Evidence: ${evidence || 'N/A'}`);
        console.log(`Evidence Type: ${evidence.type}`);
        console.log(`Evidence ID: ${evidence.details.id || 'N/A'}`);
        
        if (evidence.type === 'Gun') {
          console.log(`Firearm Type: ${evidence.details.type || 'N/A'}`);
          console.log(`Firearm Model: ${evidence.details.model || 'N/A'}`);
        } else if (evidence.type === 'Drug') {
          console.log(`Drug Type: ${evidence.details.drug_type || 'N/A'}`);
          console.log(`Characteristics: ${evidence.details.characteristics || 'N/A'}`);
        }
        
        console.log('===================================');
      } catch (error) {
        console.warn('Failed to store evidence details:', error);
      }
    }
  }, [evidence?.details, evidence?.type]); // *** เพิ่ม optional chaining ***

  const renderBasicInfo = () => {
    if (!evidence || (!evidence.type && !evidence.result)) {
      return <div className="p-4 text-red-600">ไม่พบข้อมูลวัตถุพยาน</div>;
    }

    const evidenceType = evidence.type || 
                        (evidence.result?.hasOwnProperty('prediction') && !evidence.result?.isUnknown ? 'Drug' : 'Gun');
    
    switch (evidenceType) {
      case 'Gun':
        return (
          <GunBasicInformation
            evidence={evidence.details}
            analysisResult={evidence.result}
            isLoading={isLoading}
            apiError={apiError}
            isMobile={isMobile}
            imageUrl={evidence.imageUrl} // ✅ ส่งภาพที่ crop แล้ว
            originalImageUrl={evidence.originalImageUrl} // ✅ ส่งภาพต้นฉบับ
          />
        );
      case 'Drug':
        return <DrugBasicInformation 
          evidence={evidence.details}
          analysisResult={evidence.result} 
          isMobile={isMobile}
          imageUrl={evidence.imageUrl} // ✅ ส่งภาพที่ crop แล้ว
          originalImageUrl={evidence.originalImageUrl} // ✅ ส่งภาพต้นฉบับ
        />;
      case 'Unknown':
        return <div className="p-4 text-gray-600">
          <h3 className="text-lg font-medium mb-2">วัตถุพยานไม่ทราบชนิด</h3>
          <p>ไม่สามารถระบุชนิดของวัตถุพยานนี้ได้</p>
          {/* ✅ ใช้ภาพที่ crop แล้ว หรือภาพต้นฉบับถ้าไม่มี */}
          {(evidence.imageUrl || evidence.originalImageUrl) && (
            <div className="mt-4">
              <img src={evidence.imageUrl || evidence.originalImageUrl} alt="Unknown evidence" 
                className={`${isMobile ? 'w-full max-h-48' : 'w-full max-h-64'} object-contain rounded-lg`} />
            </div>
          )}
        </div>;
      default:
        return <div className="p-4 text-red-600">ไม่พบข้อมูลวัตถุพยาน</div>;
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 0:
        return renderBasicInfo();
      case 1:
        return <Gallery 
          evidence={evidence?.details} 
          isMobile={isMobile} 
          userImage={evidence?.imageUrl} // ✅ ส่งภาพที่ crop แล้ว
          originalImage={evidence?.originalImageUrl} // ✅ ส่งภาพต้นฉบับ
        />;
      case 2:
        return <History evidence={evidence?.details} isMobile={isMobile} />;
      case 3:
        return <Map evidence={evidence?.details} isMobile={isMobile} />;
      default:
        return null;
    }
  };

  // *** เพิ่ม early return ถ้า evidence เป็น null ***
  if (!evidence) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center p-4">
          <p className="text-gray-600">กำลังโหลดข้อมูลวัตถุพยาน...</p>
        </div>
      </div>
    );
  }

  console.log(evidence.details, 'Evidence details in EvidenceProfile');
  console.log(evidence.result, 'Evidence result in EvidenceProfile');

  // เพิ่ม console.log เพื่อตรวจสอบข้อมูลที่ได้รับ
  useEffect(() => {
    console.log("=== DEBUG EvidenceProfile ===");
    console.log("Location state:", location.state);
    console.log("Evidence:", evidence);
    console.log("Evidence result:", evidence?.result);
    console.log("Evidence exhibit_id:", evidence?.result?.exhibit_id);
    console.log("=============================");
  }, [evidence]);

  // Log sessionId ทุกครั้งที่ EvidenceProfile render หรือ path เปลี่ยน
  useEffect(() => {
    const sessionId = getSessionId();
    console.log('=== [EvidenceProfile] Session ID ===');
    console.log('sessionId:', sessionId);
    console.log('hasValidSession:', hasValidSession());
    console.log('Current path:', location.pathname);
    console.log('===============================');
  }, [location.pathname]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <TabBar />
      <div className="flex-1 overflow-auto">
        {renderContent()}
      </div>
      <BottomBar
        analysisResult={evidence?.result}
        evidence={evidence?.details}
        fromCamera={location.state?.fromCamera} 
        sourcePath={location.state?.sourcePath} 
        isMobile={isMobile}
      />
    </div>
  );
};

export default EvidenceProfile;