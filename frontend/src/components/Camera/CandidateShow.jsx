import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, ChevronRight, ChevronDown, HelpCircle } from 'lucide-react';
import { PiImageBroken } from 'react-icons/pi';
import { IoClose } from 'react-icons/io5';
import { useDevice } from '../../context/DeviceContext';
import { fetchGunReferenceImages, getGunReferenceImage } from '../../services/gunReferenceService';
import { fetchNarcoticById } from '../../services/narcoticReferenceService';
import { api } from '../../config/api';

const UNKNOWN_EXHIBIT_IDS = {
  UNKNOWN_GUN: 93,
  UNKNOWN_DRUG: 94,
  UNKNOWN_OBJECT: null
};

const CandidateShow = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isMobile, isDesktop, isTablet } = useDevice();
  const [candidates, setCandidates] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [imageUrl, setImageUrl] = useState('');
  const [detectionType, setDetectionType] = useState('');
  const [fromCamera, setFromCamera] = useState(false);
  const [sourcePath, setSourcePath] = useState('');
  const [expandedBrands, setExpandedBrands] = useState({});
  const [brandData, setBrandData] = useState([]);
  const [isUnknownObject, setIsUnknownObject] = useState(false);
  const [fullScreen, setFullScreen] = useState(false);
  const [gunReferenceImages, setGunReferenceImages] = useState({ default: '' });
  const [isLoadingImages, setIsLoadingImages] = useState(true);
  const [selectedNarcoticDetails, setSelectedNarcoticDetails] = useState(null);
  const [narcoticsDetails, setNarcoticsDetails] = useState({});
  const [isLoadingNarcotics, setIsLoadingNarcotics] = useState(false);

  useEffect(() => {
    const loadReferenceImages = async () => {
      setIsLoadingImages(true);
      try {
        const imageMap = await fetchGunReferenceImages();
        setGunReferenceImages(imageMap);
      } catch (error) {
        console.error('Failed to load gun reference images:', error);
      } finally {
        setIsLoadingImages(false);
      }
    };

    loadReferenceImages();
  }, []);
  
  const toggleBrand = (brandName) => {
    setExpandedBrands(prev => ({
      ...prev,
      [brandName]: !prev[brandName]
    }));
  };

  const getModelImage = (brandName, modelName) => {
    if (isLoadingImages) {
      return null;
    }
    return getGunReferenceImage(gunReferenceImages, brandName, modelName);
  };

  const fetchSelectedNarcoticDetails = async (narcoticId) => {
    if (!narcoticId) return;
    
    try {
      const details = await fetchNarcoticById(narcoticId);
      if (details) {
        setSelectedNarcoticDetails(details);
      }
    } catch (error) {
      console.error("Error fetching narcotic details:", error);
    }
  };

  useEffect(() => {
    if (detectionType === 'Drug' && candidates.length > 0) {
      console.log("โหลดข้อมูลยาเสพติดทั้งหมด:", candidates);
      loadAllNarcoticsDetails(candidates);
    }
  }, [candidates, detectionType]);

  const loadAllNarcoticsDetails = async (candidates) => {
    if (!candidates || candidates.length === 0) return;
    
    setIsLoadingNarcotics(true);
    const narcoticsData = {};
    
    const validCandidates = candidates.filter(
      c => c.narcotic_id && !c.isUnknownDrug
    );
    
    try {
      const promises = validCandidates.map(candidate => 
        fetchNarcoticById(candidate.narcotic_id).then(data => {
          if (data) {
            console.log(`โหลดข้อมูลยาเสพติด ID ${candidate.narcotic_id} สำเร็จ:`, data);
            narcoticsData[candidate.narcotic_id] = data;
            
            if (data.characteristics) {
              const index = candidates.findIndex(c => c.narcotic_id === candidate.narcotic_id);
              if (index !== -1) {
                candidates[index].label = data.characteristics;
                candidates[index].characteristics = data.characteristics;
              }
            }
          }
        })
      );
      
      await Promise.all(promises);
      console.log("โหลดข้อมูลยาเสพติดทั้งหมดสำเร็จ:", narcoticsData);
      setNarcoticsDetails(narcoticsData);
      
      setCandidates([...candidates]);
    } catch (error) {
      console.error("Error loading narcotics details:", error);
    } finally {
      setIsLoadingNarcotics(false);
    }
  };

  useEffect(() => {
    if (location.state) {
      console.log("=== CandidateShow DEBUG ===");
      console.log("Location state:", location.state);
      
      const { analysisResult, result, image, fromCamera, sourcePath } = location.state;
      const data = analysisResult || result || {};
      
      console.log("Data received:", data);
      console.log("Detection type:", data.detectionType);
      console.log("Brand data:", data.brandData);
      console.log("Candidates:", data.candidates);
      console.log("Detected objects:", data.detected_objects);
      
      setImageUrl(image || localStorage.getItem('analysisImage'));
      setFromCamera(fromCamera || false);
      setSourcePath(sourcePath || '');
      setIsUnknownObject(false);
      
      setDetectionType('');
      setCandidates([]);

      if (data.detectionType === 'narcotic' || data.detectionType === 'drug' || 
          data.drugCandidates || data.similarNarcotics) {
        setDetectionType('Drug');
        
        if (data.drugCandidates && Array.isArray(data.drugCandidates) && data.drugCandidates.length > 0) {
          console.log("Using drug candidates:", data.drugCandidates);
          setCandidates(data.drugCandidates);
        }
        else if (data.similarNarcotics && Array.isArray(data.similarNarcotics) && data.similarNarcotics.length > 0) {
          console.log("Using similar narcotics from search:", data.similarNarcotics);
          const formattedCandidates = data.similarNarcotics.map(narcotic => ({
            label: narcotic.characteristics || 'ยาเสพติดไม่ทราบลักษณะ',
            displayName: narcotic.characteristics || 'ยาเสพติดไม่ทราบลักษณะ',
            confidence: narcotic.similarity || 0,
            narcotic_id: narcotic.narcotic_id,
            drug_type: narcotic.drug_type || 'ยาเสพติดไม่ทราบชนิด',
            drug_category: narcotic.drug_category || 'ยาเสพติดไม่ทราบประเภท',
            characteristics: narcotic.characteristics || 'ไม่ทราบอัตลักษณ์',
            similarity: narcotic.similarity || 0
          }));
          
          // เพิ่มตัวเลือก "ยาเสพติดประเภทไม่ทราบชนิด" พร้อมใช้ exhibit ID ที่มีอยู่
          formattedCandidates.push({
            label: 'ยาเสพติดประเภทไม่ทราบชนิด',
            displayName: 'ยาเสพติดประเภทไม่ทราบชนิด',
            confidence: 0,
            isUnknownDrug: true,
            characteristics: 'ไม่ทราบอัตลักษณ์',
            exhibit_id: UNKNOWN_EXHIBIT_IDS.UNKNOWN_DRUG, // อ้างอิง exhibit ID 94
            drug_type: 'ไม่ทราบชนิด',
            drug_category: 'ไม่ทราบประเภท'
          });
          
          setCandidates(formattedCandidates);
        }
        else if (data.details && Array.isArray(data.details)) {
          const limitedDetails = data.details.slice(0, 3);
          
          const formattedCandidates = limitedDetails.map(detail => ({
            label: detail.pill_name,
            confidence: detail.confidence || data.confidence || 0
          }));
          
          formattedCandidates.push({
            label: 'ยาเสพติดประเภทไม่ทราบชนิด',
            confidence: 0,
            isUnknownDrug: true
          });
          
          setCandidates(formattedCandidates);
        }
        else {
          const candidates = [
            {
              label: data.prediction,
              confidence: data.confidence || 0
            },
            {
              label: 'ยาเสพติดประเภทไม่ทราบชนิด',
              confidence: 0,
              isUnknownDrug: true
            }
          ];
          setCandidates(candidates);
        }
      } 
      else if (data.detectionType === 'firearm' || data.detectionType === 'Gun' || 
               data.detectionType === 'weapon' || data.brandData) {
        console.log("=== Processing Gun Data ===");
        setDetectionType('Gun');
        
        // ตรวจสอบ brandData ก่อน
        if (data.brandData && Array.isArray(data.brandData) && data.brandData.length > 0) {
          console.log("Using brandData from result:", data.brandData);
          setBrandData(data.brandData);
          
          // สร้าง flat candidates
          const flatCandidates = [];
          data.brandData.forEach(brand => {
            if (brand.models && brand.models.length > 0) {
              brand.models.forEach(model => {
                flatCandidates.push({
                  label: `${brand.name} ${model.name}`,
                  confidence: model.confidence,
                  brandName: brand.name,
                  modelName: model.name
                });
              });
            }
          });
          
          flatCandidates.push({
            label: 'อาวุธปืนไม่ทราบชนิด',
            confidence: 0,
            brandName: 'Unknown',
            modelName: 'Unknown',
            isUnknownWeapon: true
          });
          
          console.log("Setting flat candidates:", flatCandidates);
          setCandidates(flatCandidates);
        }
        // ตรวจสอบ candidates ที่ส่งมาตรงๆ
        else if (data.candidates && Array.isArray(data.candidates) && data.candidates.length > 0) {
          console.log("Using candidates from result:", data.candidates);
          setCandidates(data.candidates);
          
          // สร้าง brandData จาก candidates
          const brandMap = {};
          data.candidates.forEach(candidate => {
            if (candidate.brandName && candidate.brandName !== 'Unknown') {
              if (!brandMap[candidate.brandName]) {
                brandMap[candidate.brandName] = {
                  name: candidate.brandName,
                  confidence: candidate.confidence,
                  models: []
                };
              }
              
              if (candidate.modelName) {
                brandMap[candidate.brandName].models.push({
                  name: candidate.modelName,
                  confidence: candidate.confidence
                });
              }
            }
          });
          
          const brandArray = Object.values(brandMap);
          console.log("Created brandData from candidates:", brandArray);
          setBrandData(brandArray);
        }
        // ถ้าไม่มีข้อมูล brand/model ให้แสดงเป็น Unknown
        else {
          console.log("No brand/model data found, setting as unknown weapon");
          setCandidates([{
            label: 'อาวุธปืนไม่ทราบชนิด',
            confidence: 0,
            brandName: 'Unknown',
            modelName: 'Unknown',
            isUnknownWeapon: true
          }]);
          setBrandData([]);
        }
      } else {
        // No detection data - handle as unknown object
        setIsUnknownObject(true);
        setDetectionType('Unknown');
        setCandidates([{
          label: 'วัตถุพยานที่ไม่รู้จัก',
          confidence: 0,
          isUnknown: true,
          exhibit_id: UNKNOWN_EXHIBIT_IDS.UNKNOWN_OBJECT // null - สร้างใหม่
        }]);
      }
    }
  }, [location.state, navigate]);

  useEffect(() => {
    console.log("detectionType changed to:", detectionType);
  }, [detectionType]);

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleSelectCandidate = (index) => {
    setSelectedIndex(index);
    
    // แก้ไขเงื่อนไขตรวจสอบให้ตรงกับค่า detectionType ที่กำหนดในโปรแกรม
    if (detectionType === 'Drug' && candidates[index]?.narcotic_id) {
      fetchSelectedNarcoticDetails(candidates[index].narcotic_id);
    }
  };

  const handleConfirm = async () => {
    if (candidates.length > 0) {
      const selectedCandidate = candidates[selectedIndex];
      
      let result;
      let evidenceType = isUnknownObject ? 'Unknown' : detectionType;
      
      if (isUnknownObject) {
        result = {
          exhibit_id: UNKNOWN_EXHIBIT_IDS.UNKNOWN_OBJECT,
          isUnknown: true,
          prediction: 'Unknown',
          confidence: 0,
          exhibit: {
            category: 'ไม่ทราบชนิด',
            subcategory: 'unknown',
            type: 'unknown',
            classification: 'unidentified'
          }
        };
      } 
      else if(detectionType === 'Gun') {
        if (selectedCandidate.isUnknownWeapon) {
          result = {
            exhibit_id: UNKNOWN_EXHIBIT_IDS.UNKNOWN_GUN,
            weaponType: 'อาวุธปืนประเภทไม่ทราบชนิด',
            brandName: 'Unknown',
            modelName: 'Unknown',
            confidence: 0,
            isUnknownWeapon: true,
            isUnknown: false
          };
        } else {
          const matchingExhibit = await findExhibitByBrandModel(selectedCandidate.brandName, selectedCandidate.modelName);
          
          result = {
            exhibit_id: matchingExhibit.firearm.exhibit_id,
            weaponType: selectedCandidate.label,
            confidence: selectedCandidate.confidence,
            brandName: selectedCandidate.brandName,
            modelName: selectedCandidate.modelName,
            exhibit: {
              category: 'อาวุธปืน',
              subcategory: selectedCandidate.brandName || 'unknown',
              type: 'firearm',
              classification: 'identified',
              firearms: [{
                name: `${selectedCandidate.brandName} ${selectedCandidate.modelName}`,
                brand: selectedCandidate.brandName,
                model: selectedCandidate.modelName,
                mechanism: '',
                series: '',
                description: `${selectedCandidate.brandName} ${selectedCandidate.modelName} ตรวจพบด้วย AI ความมั่นใจ ${formatConfidence(selectedCandidate.confidence)}`
              }]
            }
          };
        }
        
        if (brandData.length > 0) {
          const selectedBrand = brandData.find(brand => brand.name === selectedCandidate.brandName);
          if (selectedBrand) {
            result.brandConfidence = selectedBrand.confidence;
            result.availableModels = selectedBrand.models.map(model => ({
              name: model.name,
              confidence: model.confidence
            }));
          }
        }
      } 
      else if(detectionType === 'Drug') {
        const selectedCandidate = candidates[selectedIndex];
        const narcoticDetail = selectedCandidate.narcotic_id ? 
          narcoticsDetails[selectedCandidate.narcotic_id] : null;
        
        if (selectedCandidate.isUnknownDrug) {
          result = {
            exhibit_id: UNKNOWN_EXHIBIT_IDS.UNKNOWN_DRUG,
            prediction: 'ยาเสพติดประเภทไม่ทราบชนิด',
            confidence: 0,
            drug_type: 'ไม่ทราบชนิด',
            drug_category: 'ไม่ทราบประเภท',
            characteristics: 'ไม่ทราบอัตลักษณ์',
            details: [{ 
              pill_name: 'ยาเสพติดไม่ทราบชนิด', 
              confidence: 0,
              narcotic_id: null
            }]
          };
        } else {
          const drugExhibit = await findExhibitByNarcoticId(selectedCandidate.narcotic_id);
          
          result = {
            exhibit_id: drugExhibit?.id || null,
            prediction: selectedCandidate.displayName || selectedCandidate.label,
            confidence: selectedCandidate.confidence,
            narcotic_id: selectedCandidate.narcotic_id,
            similarity: selectedCandidate.similarity,
            details: [{ 
              pill_name: selectedCandidate.displayName || selectedCandidate.label, 
              confidence: selectedCandidate.confidence,
              narcotic_id: selectedCandidate.narcotic_id
            }]
          };

          if (narcoticDetail) {
            result.exhibit = {
              category: 'ยาเสพติด',
              subcategory: narcoticDetail.drug_category || 'unknown',
              type: 'narcotic',
              classification: 'identified'
            };
          }
        }
      } 
      else {
        result = {
          exhibit_id: null,
          prediction: selectedCandidate.label,
          confidence: selectedCandidate.confidence,
          details: [{ pill_name: selectedCandidate.label, confidence: selectedCandidate.confidence }],
          exhibit: {
            category: 'อื่นๆ',
            subcategory: 'unknown',
            type: 'other',
            classification: 'unidentified'
          }
        };
      }

      console.log("=== DEBUG handleConfirm ===");
      console.log("Selected Candidate:", selectedCandidate);
      console.log("Result to be sent:", result);
      console.log("Exhibit ID:", result.exhibit_id);
      console.log("===========================");

      localStorage.setItem('analysisResult', JSON.stringify(result));
      localStorage.setItem('selectedEvidenceType', evidenceType);

      const evidenceData = {
        type: evidenceType,
        result: result,
        imageUrl: imageUrl,
        selectedCandidateIndex: selectedIndex,
        allCandidates: candidates
      };
      
      // Navigate to EvidenceProfile with selected result
      navigate('/evidenceProfile', { 
        state: { 
          type: evidenceType,
          result: result,
          evidence: evidenceData,
          fromCamera: fromCamera,
          sourcePath: sourcePath
        } 
      });
    }
  };

  // Component to render when image is not available
  const NoImageDisplay = ({ message = "การแสดงผลภาพถ่ายมีปัญหา" }) => (
    <div className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-lg border border-gray-200 h-64 w-full">
      <PiImageBroken className="text-gray-400 text-5xl mb-2" />
      <p className="text-gray-500 text-center">{message}</p>
    </div>
  );

  // Format confidence as percentage with special handling for unknown weapons
  const formatConfidence = (confidence, isUnknown) => {
    if (isUnknown === true || confidence === undefined || confidence === null) return '0%';
    return `${Math.round(confidence * 100)}%`;
  };

  // ปรับขนาดความสูงของรูปภาพตามประเภทอุปกรณ์
  const getImageHeight = () => {
    if (isDesktop) return 'h-72'; // Desktop - ภาพใหญ่
    if (isTablet) return 'h-60';  // Tablet - ภาพขนาดกลาง
    return 'h-48';               // Mobile - ภาพเล็ก
  };

  // เพิ่ม useEffect ใหม่เพื่อตรวจสอบการเปลี่ยนแปลงของ narcoticsDetails
  useEffect(() => {
    console.log("narcoticsDetails updated:", Object.keys(narcoticsDetails).length, "รายการ");
    
    // ตรวจสอบว่ามีข้อมูล characteristics หรือไม่
    Object.values(narcoticsDetails).forEach(detail => {
      if (detail.characteristics) {
        console.log("พบข้อมูล characteristics:", detail.characteristics);
      } else {
        console.warn("ไม่พบข้อมูล characteristics ใน:", detail);
      }
    });
  }, [narcoticsDetails]);

  return (
    <div className="flex flex-col h-screen max-h-screen bg-white">
      {/* Header */}
      <div className="p-4 flex items-center border-b shrink-0">
        <button onClick={handleGoBack} className="p-2 rounded-full hover:bg-gray-100">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className={`ml-2 ${isMobile ? 'text-lg' : 'text-xl'} font-semibold`}>เลือกวัตถุพยานที่ตรวจพบ</h1>
      </div>
      
      {/* Image Preview */}
      <div className="p-4 border-b shrink-0">
        {imageUrl ? (
          <div className={`relative w-full ${getImageHeight()}`}>
            <img 
              src={imageUrl} 
              alt="Evidence" 
              className="w-full h-full object-contain rounded-lg cursor-pointer" 
              onClick={() => setFullScreen(true)}
            />
            <div className={`absolute top-2 right-2 px-3 py-1 bg-black/50 text-white rounded-full ${isMobile ? 'text-xs' : 'text-sm'}`}>
              {detectionType === 'Gun' ? '🔫 อาวุธปืน' : 
               detectionType === 'Drug' ? '💊 ยาเสพติด' : 
               '❓ วัตถุพยานที่ไม่รู้จัก'}
            </div>
          </div>
        ) : (
          <NoImageDisplay />
        )}
      </div>
      
      {/* Candidates List */}
      <div className={`flex-1 ${isMobile ? 'p-3' : 'p-4'} overflow-y-auto`}>
        <h2 className={`${isMobile ? 'text-base' : 'text-lg'} font-medium mb-3`}>
          ผลการตรวจพบ ({candidates.length})
        </h2>

        {isUnknownObject ? (
          <div className={`${isMobile ? 'p-4' : 'p-6'} bg-gray-50 border rounded-lg flex flex-col items-center justify-center space-y-3`}>
            <HelpCircle className={`${isMobile ? 'w-10 h-10' : 'w-12 h-12'} text-gray-400`} />
            <div className="text-center">
              <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-medium`}>วัตถุพยานที่ไม่รู้จัก</h3>
              <p className={`text-gray-500 ${isMobile ? 'text-sm' : 'text-base'}`}>
                ไม่สามารถระบุชนิดของวัตถุพยานได้ หรือความมั่นใจในการระบุต่ำเกินไป
              </p>
            </div>
          </div>
        ) : detectionType === 'Gun' ? (
          <div className={`space-y-${isMobile ? '2' : '3'}`}>
            {brandData.length > 0 ? (
              <>
                {/* โค้ดเดิมสำหรับแสดงยี่ห้อ/รุ่นของปืน */}
                {brandData
                  .filter(brand => brand.name !== 'Unknown')
                  .map((brand, brandIdx) => (
                    <div 
                      key={`brand-${brandIdx}`}
                      className="border rounded-lg overflow-hidden"
                    >
                      {/* เนื้อหาเดิมสำหรับแสดงรายละเอียดยี่ห้อ/รุ่น */}
                      <div 
                        onClick={() => toggleBrand(brand.name)}
                        className={`${isMobile ? 'p-3' : 'p-4'} bg-gray-50 flex items-center justify-between cursor-pointer ${
                          expandedBrands[brand.name] ? 'border-b border-gray-200' : ''
                        }`}
                      >
                        <div className="flex-1">
                          <div className="font-medium">{brand.name}</div>
                          <div className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-500`}>
                            ความมั่นใจ: {formatConfidence(brand.confidence)}
                            {brand.models.length > 0 && ` • ${brand.models.length} รุ่น`}
                          </div>
                        </div>
                        {expandedBrands[brand.name] ? (
                          <ChevronDown className="w-5 h-5 text-gray-500" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-gray-500" />
                        )}
                      </div>
                      
                      {/* Models for this brand */}
                      {expandedBrands[brand.name] && brand.models.length > 0 && (
                        <div className="bg-white divide-y divide-gray-100">
                          {brand.models.map((model, modelIdx) => {
                            // Find index in flat candidates list
                            const candidateIndex = candidates.findIndex(
                              c => c.brandName === brand.name && c.modelName === model.name
                            );
                            
                            // Get reference image from our service
                            const referenceImage = getModelImage(brand.name, model.name);
                            
                            return (
                              <div 
                                key={`model-${brandIdx}-${modelIdx}`}
                                className={`${isMobile ? 'p-3' : 'p-4'} flex items-center justify-between ${
                                  selectedIndex === candidateIndex ? 'bg-red-50' : ''
                                }`}
                                onClick={() => handleSelectCandidate(candidateIndex)}
                              >
                                <div className="flex-1 flex items-center">
                                  {/* Reference image with loading state */}
                                  {isLoadingImages ? (
                                    <div className="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                                      <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                                    </div>
                                  ) : referenceImage ? (
                                    <img 
                                      src={referenceImage} 
                                      alt={`${brand.name} ${model.name}`} 
                                      className="w-14 h-14 object-contain rounded-lg mr-3 flex-shrink-0 border border-gray-200"
                                      onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = gunReferenceImages.default;
                                      }}
                                    />
                                  ) : (
                                    <div className="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center mr-3 flex-shrink-0 border border-gray-200">
                                      <PiImageBroken className="text-gray-400 text-xl" />
                                    </div>
                                  )}
                                  
                                  <div>
                                    <div className="font-medium">{model.name}</div>
                                    <div className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-500`}>
                                      ความมั่นใจ: {formatConfidence(model.confidence)}
                                    </div>
                                  </div>
                                </div>
                                
                                {selectedIndex === candidateIndex && (
                                  <div className="w-6 h-6 rounded-full bg-[#990000] flex items-center justify-center ml-2 flex-shrink-0">
                                    <Check className="w-4 h-4 text-white" />
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                
                {/* แสดงตัวเลือก "อาวุธปืนไม่ทราบชนิด" */}
                {brandData.find(brand => brand.name === 'Unknown') && (
                  <div className={`${isMobile ? 'p-3' : 'p-4'} border rounded-lg flex items-center justify-between ${
                    selectedIndex === candidates.findIndex(c => c.isUnknownWeapon) ? 'border-[#990000] bg-red-50' : 'border-gray-200'
                  }`}
                  onClick={() => handleSelectCandidate(candidates.findIndex(c => c.isUnknownWeapon))}>
                    <div className="flex-1">
                      <div className="font-medium">อาวุธปืนไม่ทราบชนิด</div>
                      <div className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-500`}>
                        ตัวเลือกสำหรับอาวุธปืนที่ไม่สามารถระบุยี่ห้อหรือรุ่นได้
                      </div>
                    </div>
                    
                    {selectedIndex === candidates.findIndex(c => c.isUnknownWeapon) && (
                      <div className="w-6 h-6 rounded-full bg-[#990000] flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              // แสดงตัวเลือกเดียวสำหรับ "อาวุธปืนไม่ทราบชนิด" ถ้าไม่มี brandData
              <div className={`${isMobile ? 'p-3' : 'p-4'} border rounded-lg flex items-center justify-between ${
                selectedIndex === 0 ? 'border-[#990000] bg-red-50' : 'border-gray-200'
              }`}
              onClick={() => handleSelectCandidate(0)}>
                <div className="flex-1">
                  <div className="font-medium">อาวุธปืนไม่ทราบชนิด</div>
                  <div className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-500`}>
                    ตัวเลือกสำหรับอาวุธปืนที่ไม่สามารถระบุยี่ห้อหรือรุ่นได้
                  </div>
                </div>
                
                {selectedIndex === 0 && (
                  <div className="w-6 h-6 rounded-full bg-[#990000] flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          // Original flat list for drugs and fallback - unchanged
          <div className={`space-y-${isMobile ? '2' : '3'}`}>
            {candidates.length > 0 ? (
              candidates.map((candidate, index) => {
                // ดึงข้อมูลยาเสพติดจาก narcoticsDetails ถ้ามี
                const narcoticDetail = candidate.narcotic_id ? 
                  narcoticsDetails[candidate.narcotic_id] : null;
                
                console.log(`Candidate ${index}: ${candidate.label}, narcotic_id: ${candidate.narcotic_id}`);
                console.log("narcoticDetail:", narcoticDetail);
                
                return (
                  <div 
                    key={`${candidate.label}-${index}`}
                    className={`${isMobile ? 'p-3' : 'p-4'} border rounded-lg flex items-start ${
                      selectedIndex === index ? 'border-[#990000] bg-red-50' : 'border-gray-200'
                    }`}
                    onClick={() => handleSelectCandidate(index)}
                  >
                    {/* ส่วนแสดงรูปภาพ - แก้ไขเงื่อนไขการแสดงรูปภาพ */}
                    {candidate.narcotic_id && narcoticDetail && narcoticDetail.example_images && 
                     narcoticDetail.example_images.length > 0 ? (
                      <div className="mr-3 flex-shrink-0">
                        <img 
                          src={narcoticDetail.example_images[0].image_url} 
                          alt={narcoticDetail.drug_type || candidate.label}
                          className="w-16 h-16 object-contain rounded-lg border border-gray-200"
                          onError={(e) => {
                            console.error("ไม่สามารถโหลดรูปภาพ:", e.target.src);
                            e.target.onerror = null;
                            e.target.src = "https://via.placeholder.com/64?text=No+Image";
                          }}
                        />
                      </div>
                    ) : isLoadingNarcotics && !candidate.isUnknownDrug ? (
                      <div className="mr-3 flex-shrink-0 w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                        <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                      </div>
                    ) : !candidate.isUnknownDrug ? (
                      <div className="mr-3 flex-shrink-0 w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                        <PiImageBroken className="text-gray-400 text-xl" />
                      </div>
                    ) : null}
                    
                    {/* ส่วนแสดงข้อมูล - แก้ไขเงื่อนไขการแสดง characteristics */}
                    <div className="flex-1">
                      {/* แสดงชื่อยาเป็นหัวข้อ และ characteristics เป็น label หลัก */}
                      {!candidate.isUnknownDrug ? (
                        <>
                          <div className="font-medium">
                            {candidate.characteristics || 'ไม่ทราบอัตลักษณ์'}
                          </div>
                          <div className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-500`}>
                            {/* แสดงความคล้ายคลึงหรือความมั่นใจ */}
                            {candidate.similarity !== undefined ? (
                              <div className="mb-1">ความคล้ายคลึง: {Math.round(candidate.similarity * 100)}%</div>
                            ) : (
                              <div className="mb-1">ความมั่นใจ: {formatConfidence(candidate.confidence)}</div>
                            )}
                          </div>
                        </>
                      ) : (
                        // กรณีเป็นยาเสพติดไม่ทราบชนิด
                        <div className="font-medium">{candidate.label}</div>
                      )}
                    </div>
                    
                    {/* แสดงเครื่องหมายถูกเมื่อเลือก */}
                    {selectedIndex === index && (
                      <div className="w-6 h-6 rounded-full bg-[#990000] flex items-center justify-center ml-2 flex-shrink-0">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className={`${isMobile ? 'p-3' : 'p-4'} text-center text-gray-500`}>
                ไม่พบวัตถุพยานที่ตรงกับเงื่อนไข
              </div>
            )}
          </div>
        )}

        {/* เพิ่มปุ่มในกรณีที่ไม่สามารถโหลดข้อมูลได้ */}
        {!isLoadingNarcotics && candidates.some(c => c.narcotic_id && !narcoticsDetails[c.narcotic_id]) && (
          <button 
            onClick={() => loadAllNarcoticsDetails(candidates)}
            className="mt-2 p-2 text-xs text-blue-600 hover:underline"
          >
            โหลดข้อมูลเพิ่มเติมอีกครั้ง
          </button>
        )}

        <div className="h-4"></div>
      </div>
      
      {/* Bottom Action */}
      <div className={`${isMobile ? 'p-3' : 'p-4'} border-t bg-white shrink-0`}>
        <button
          onClick={handleConfirm}
          disabled={candidates.length === 0}
          className={`w-full ${isMobile ? 'py-3' : 'py-4'} rounded-lg ${
            candidates.length > 0 
              ? 'bg-[#990000] text-white' 
              : 'bg-gray-200 text-gray-500'
          } font-medium`}
        >
          {isUnknownObject ? 'ยืนยันวัตถุไม่ทราบชนิด' : 'ยืนยันการเลือก'}
        </button>
      </div>

      {/* Full Screen Modal for Image */}
      {fullScreen && imageUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex flex-col items-center justify-center z-50">
          {/* ปุ่มปิด Full Screen */}
          <button 
            className={`absolute top-4 right-4 text-white ${isMobile ? 'text-2xl' : 'text-3xl'} p-2 bg-gray-800 rounded-full`}
            onClick={() => setFullScreen(false)}
          >
            <IoClose />
          </button>
          {/* ภาพที่ขยายเต็มจอ */}
          <img 
            src={imageUrl} 
            alt="Full Screen" 
            className={`max-w-full ${isMobile ? 'max-h-[70vh]' : 'max-h-[80vh]'} object-contain mb-4 px-4`} 
          />
          {/* Optional: Display what type of evidence is being shown */}
          <div className={`px-3 py-1 bg-black/70 text-white rounded-full ${isMobile ? 'text-xs' : 'text-sm'}`}>
            {detectionType === 'Gun' ? '🔫 อาวุธปืน' : 
             detectionType === 'Drug' ? '💊 ยาเสพติด' : 
             '❓ วัตถุพยานที่ไม่รู้จัก'}
          </div>
        </div>
      )}
    </div>
  );
};

const findExhibitByBrandModel = async (brandName, modelName) => {
  try {
    const response = await api.get('/api/exhibits');
    const exhibits = response.data;
    
    if (Array.isArray(exhibits)) {
      const normalizedSearch = (brandName + modelName).toLowerCase().replace(/[^a-z0-9]/g, '');
      
      return exhibits.find(exhibit => 
        exhibit.firearm && 
        exhibit.category === 'อาวุธปืน' &&
        exhibit.firearm.normalized_name === normalizedSearch
      );
    }
  } catch (error) {
    console.error('Error finding exhibit:', error);
  }
  return null;
};

// เพิ่มฟังก์ชันใหม่ที่ท้ายไฟล์
const findExhibitByNarcoticId = async (narcoticId) => {
  try {
    const response = await api.get('/api/exhibits');
    const exhibits = response.data;
    console.log("Finding exhibit by narcotic ID:", narcoticId);
    
    console.log("Exhibits data:", exhibits);
    
    if (Array.isArray(exhibits)) {
      return exhibits.find(exhibit => 
        exhibit.category === 'ยาเสพติด' &&
        exhibit.narcotic && 
        exhibit.narcotic.id === narcoticId
      );
    }
  } catch (error) {
    console.error('Error finding exhibit by narcotic ID:', error);
  }
  return null;
};

export default CandidateShow;