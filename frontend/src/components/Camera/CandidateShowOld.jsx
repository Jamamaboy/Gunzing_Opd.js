import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, ChevronRight, ChevronDown, HelpCircle } from 'lucide-react';
import { PiImageBroken } from 'react-icons/pi';
import { IoClose } from 'react-icons/io5';
import { useDevice } from '../../context/DeviceContext';
import { fetchGunReferenceImages, getGunReferenceImage } from '../../services/gunReferenceService';
import { fetchNarcoticById } from '../../services/narcoticReferenceService';

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

  // Fetch gun reference images on component mount
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
  
  // Function to toggle brand expansion
  const toggleBrand = (brandName) => {
    setExpandedBrands(prev => ({
      ...prev,
      [brandName]: !prev[brandName]
    }));
  };

  // Function to get reference image with loading state handling
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
    if (location.state) {
      const { analysisResult, result, image, fromCamera, sourcePath } = location.state;
      const data = analysisResult || result || {};
      
      setImageUrl(image || localStorage.getItem('analysisImage'));
      setFromCamera(fromCamera || false);
      setSourcePath(sourcePath || '');
      
      setIsUnknownObject(false);

      if (data.detected_objects || data.detections) {
        const detections = data.detected_objects || data.detections || [];
        
        const allZeroConfidence = detections.length === 0 || 
          detections.every(detection => {
            if (detection.confidence !== undefined && detection.confidence > 0) {
              return false;
            }
            
            if (detection.brand_top3 && detection.brand_top3.length > 0) {
              const hasBrandConfidence = detection.brand_top3.some(brand => 
                brand.confidence > 0
              );
              if (hasBrandConfidence) return false;
            }
            
            if (detection.model_top3 && detection.model_top3.length > 0) {
              const hasModelConfidence = detection.model_top3.some(model => 
                model.confidence > 0
              );
              if (hasModelConfidence) return false;
            }
            
            return true;
          });
        
        if (allZeroConfidence) {
          setIsUnknownObject(true);
          setDetectionType('Unknown');
          setCandidates([{
            label: 'วัตถุพยานที่ไม่รู้จัก',
            confidence: 0,
            isUnknown: true
          }]);
        } else {
          setDetectionType('Gun');

          const gunClasses = ['BigGun', 'Pistol', 'Revolver'];

          if (detections.length > 0 && detections[0].brand_top3) {
            const brands = {};
            detections.forEach(detection => {
              if (gunClasses.includes(detection.class) && detection.brand_top3) {
                const limitedBrandTop3 = detection.brand_top3.slice(0, 3);
                limitedBrandTop3.forEach(brand => {
                  if (brand.confidence > 0) {
                    if (!brands[brand.label]) {
                      brands[brand.label] = {
                        name: brand.label,
                        confidence: brand.confidence,
                        models: []
                      };
                    }
                    // Add models if they exist for this brand
                    if (detection.model_top3 && detection.brand_top3[0]?.label === brand.label) {
                      // จำกัดจำนวน Model ให้แสดงไม่เกิน 3
                      const limitedModelTop3 = detection.model_top3.slice(0, 3);
                      limitedModelTop3.forEach(model => {
                        if (model.confidence > 0) {
                          brands[brand.label].models.push({
                            name: model.label,
                            confidence: model.confidence,
                            brandName: brand.label
                          });
                        }
                      });
                    }
                  }
                });
              }
            });

            // *** เพิ่ม filter เฉพาะ brand ที่มี models ที่ความมั่นใจ > 0 ***
            const filteredBrands = Object.values(brands).filter(brand => brand.models.length > 0);

            // Convert to array and sort by confidence
            const sortedBrands = filteredBrands
              .sort((a, b) => b.confidence - a.confidence)
              .map(brand => ({
                ...brand,
                models: brand.models.sort((a, b) => b.confidence - a.confidence)
              }))
              .slice(0, 3);
            
            // Create Unknown brand/model option
            const unknownBrand = {
              name: 'Unknown',
              confidence: 0,
              models: [{
                name: 'Unknown',
                confidence: 0,
                brandName: 'Unknown'
              }]
            };
            
            // Add Unknown brand to brandData
            setBrandData([...sortedBrands, unknownBrand]);

            // Also create flat list for selection
            const flatCandidates = [];
            sortedBrands.forEach(brand => {
              if (brand.models.length > 0) {
                // จำกัดจำนวน Model ให้แสดงไม่เกิน 3
                const limitedModels = brand.models.slice(0, 3);
                
                limitedModels.forEach(model => {
                  flatCandidates.push({
                    label: `${brand.name} ${model.name}`,
                    confidence: model.confidence,
                    brandName: brand.name,
                    modelName: model.name
                  });
                });
              }
            });
            
            // Add Unknown gun option as the last choice
            flatCandidates.push({
              label: 'อาวุธปืนไม่ทราบชนิด',
              confidence: 0,
              brandName: 'Unknown',
              modelName: 'Unknown',
              isUnknownWeapon: true,
              id: 21  // เพิ่ม ID สำหรับ unknown gun
            });
            
            setCandidates(flatCandidates);
          } else {
            // Fall back to original format
            const formattedCandidates = detections.map(detection => ({
              label: detection.class,
              confidence: detection.confidence
            }));
            
            // Add Unknown gun option as the last choice
            formattedCandidates.push({
              label: 'อาวุธปืนประเภทไม่ทราบชนิด',
              confidence: 0,
              isUnknownWeapon: true,
              id: 21
            });
            
            setCandidates(formattedCandidates);
          }
        }
      } else if (data.prediction || data.details || (data.detectionType === 'drug' || data.detectionType === 'narcotic') && data.primaryObjects) {

        setDetectionType('Drug');
        
        // กรณีที่มีผลการค้นหายาเสพติดที่คล้ายคลึง
        if (data.drugCandidates && Array.isArray(data.drugCandidates) && data.drugCandidates.length > 0) {
          console.log("Using similar narcotics from search:", data.drugCandidates);
          setCandidates(data.drugCandidates);
        }
        // กรณีที่มีผลการค้นหายาเสพติดที่คล้ายคลึงภายใต้ชื่อ similarNarcotics
        else if (data.similarNarcotics && Array.isArray(data.similarNarcotics) && data.similarNarcotics.length > 0) {
          console.log("Using similar narcotics from search:", data.similarNarcotics);
          // แปลงข้อมูลให้อยู่ในรูปแบบเดียวกับ drugCandidates
          const formattedCandidates = data.similarNarcotics.map(narcotic => ({
            label: narcotic.name || narcotic.drug_type || 'ยาเสพติดไม่ทราบชนิด',
            confidence: narcotic.similarity || 0,
            narcotic_id: narcotic.narcotic_id,
            drug_type: narcotic.drug_type || '',
            drug_category: narcotic.drug_category || '',
            similarity: narcotic.similarity || 0
          }));
          
          // เพิ่มตัวเลือก "ยาเสพติดประเภทไม่ทราบชนิด"
          formattedCandidates.push({
            label: 'ยาเสพติดประเภทไม่ทราบชนิด',
            confidence: 0,
            isUnknownDrug: true
          });
          
          setCandidates(formattedCandidates);
        }
        // กรณีที่มี details แบบเดิม
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
        // กรณีอื่นๆ
        else {
          // Single result case with unknown option
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
      } else if (data.detectionType === 'weapon') {
        // Handle weapon detection type specifically
        setDetectionType('Gun');
        
        // Create a single unknown weapon option
        const weaponCandidates = [{
          label: 'อาวุธปืนประเภทไม่ทราบชนิด',
          confidence: 0,
          brandName: 'Unknown',
          modelName: 'Unknown',
          isUnknownWeapon: true
        }];
        
        setCandidates(weaponCandidates);
      } else {
        // No detection data - handle as unknown object
        setIsUnknownObject(true);
        setDetectionType('Unknown');
        setCandidates([{
          label: 'วัตถุพยานที่ไม่รู้จัก',
          confidence: 0,
          isUnknown: true
        }]);
      }
    }
  }, [location.state]);

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleSelectCandidate = (index) => {
    setSelectedIndex(index);
    
    // ถ้าเป็นยาเสพติดและมี narcotic_id ให้ดึงข้อมูลเพิ่มเติม
    if (detectionType === 'narcotic' && candidates[index]?.narcotic_id) {
      fetchSelectedNarcoticDetails(candidates[index].narcotic_id);
    }
  };

  const handleConfirm = () => {
    if (candidates.length > 0) {
      const selectedCandidate = candidates[selectedIndex];
      
      let result;
      // Important fix: For unknown weapons, keep evidenceType as "Gun", not "Unknown"
      let evidenceType = isUnknownObject ? 'Unknown' : detectionType;
      
      if (isUnknownObject) {
        result = {
          isUnknown: true,
          prediction: 'Unknown',
          confidence: 0
        };
      } 
      else if(detectionType === 'Gun') {
        result = {
          weaponType: selectedCandidate.label,
          confidence: selectedCandidate.confidence,
          brandName: selectedCandidate.brandName,
          modelName: selectedCandidate.modelName,
          id: selectedCandidate.isUnknownWeapon ? 21 : undefined
        };
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
        result = {
          prediction: selectedCandidate.label,
          confidence: selectedCandidate.confidence,
          narcotic_id: selectedCandidate.narcotic_id,
          similarity: selectedCandidate.similarity,
          details: [{ 
            pill_name: selectedCandidate.label, 
            confidence: selectedCandidate.confidence,
            narcotic_id: selectedCandidate.narcotic_id
          }]
        };
      } 
      else {
        result = {
          prediction: selectedCandidate.label,
          confidence: selectedCandidate.confidence,
          details: [{ 
            pill_name: selectedCandidate.label,
            confidence: selectedCandidate.confidence
          }]
        };
      }

      // Handle unknown weapon specially in the result
      if (result.id === 21 || (result.brandName === 'Unknown' && result.modelName === 'Unknown')) {
        result = {
          ...result,
          weaponType: 'อาวุธปืนประเภทไม่ทราบชนิด',
          brandName: 'Unknown',
          modelName: 'Unknown',
          exhibit: {
            id: 21,
            category: 'อาวุธปืน',
            subcategory: 'unknown'
          },
          // Add these properties to ensure proper categorization:
          isUnknownWeapon: true,
          isUnknown: false          // Not a completely unknown object
        };
        
        // Make sure evidenceType stays as "Gun" for unknown weapons
        if (detectionType === 'Gun') {
          evidenceType = 'Gun';
        }
      }

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

  return (
    <div className="flex flex-col h-screen max-h-screen bg-white">
      {/* Header - unchanged */}
      <div className="p-4 flex items-center border-b shrink-0">
        <button onClick={handleGoBack} className="p-2 rounded-full hover:bg-gray-100">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className={`ml-2 ${isMobile ? 'text-lg' : 'text-xl'} font-semibold`}>เลือกวัตถุพยานที่ตรวจพบ</h1>
      </div>
      
      {/* Image Preview - unchanged */}
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
              {detectionType === 'Gun' ? '🔫 อาวุธปืน (BigGun/Pistol/Revolver)' : 
               detectionType === 'narcotic' ? '💊 ยาเสพติด' : 
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
        ) : detectionType === 'Gun' && brandData.length > 0 ? (
          <div className={`space-y-${isMobile ? '2' : '3'}`}>
            {/* First render all regular brands with dropdowns */}
            {brandData
              .filter(brand => brand.name !== 'Unknown')
              .map((brand, brandIdx) => (
                <div 
                  key={`brand-${brandIdx}`}
                  className="border rounded-lg overflow-hidden"
                >
                  {/* Brand header - ไม่แสดงรูปพรีวิว */}
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
            
            {/* Then render Unknown as a directly selectable option */}
            {brandData.find(brand => brand.name === 'Unknown') && (
              <div 
                className={`${isMobile ? 'p-3' : 'p-4'} border rounded-lg flex items-center justify-between ${
                  selectedIndex === candidates.findIndex(c => c.isUnknownWeapon) ? 'border-[#990000] bg-red-50' : 'border-gray-200'
                }`}
                onClick={() => handleSelectCandidate(candidates.findIndex(c => c.isUnknownWeapon))}
              >
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
          </div>
        ) : (
          // Original flat list for drugs and fallback - unchanged
          <div className={`space-y-${isMobile ? '2' : '3'}`}>
            {candidates.length > 0 ? (
              candidates.map((candidate, index) => (
                <div 
                  key={`${candidate.label}-${index}`}
                  className={`${isMobile ? 'p-3' : 'p-4'} border rounded-lg flex items-center justify-between ${
                    selectedIndex === index ? 'border-[#990000] bg-red-50' : 'border-gray-200'
                  }`}
                  onClick={() => handleSelectCandidate(index)}
                >
                  <div className="flex-1">
                    <div className="font-medium">{candidate.label}</div>
                    {!candidate.isUnknown && (
                      <div className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-500`}>
                        ความมั่นใจ: {formatConfidence(candidate.confidence)}
                      </div>
                    )}
                  </div>
                  {selectedIndex === index && (
                    <div className="w-6 h-6 rounded-full bg-[#990000] flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className={`${isMobile ? 'p-3' : 'p-4'} text-center text-gray-500`}>
                ไม่พบวัตถุพยานที่ตรงกับเงื่อนไข
              </div>
            )}
          </div>
        )}

        <div className="h-4"></div>
      </div>
      
      {/* Bottom Action - unchanged */}
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

      {/* Full Screen Modal for Image - unchanged */}
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
            {detectionType === 'Gun' ? '🔫 อาวุธปืน)' : 
             detectionType === 'Drug' ? '💊 ยาเสพติด' : 
             '❓ วัตถุพยานที่ไม่รู้จัก'}
          </div>
        </div>
      )}
    </div>
  );
};

export default CandidateShow;