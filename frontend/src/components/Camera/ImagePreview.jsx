import React, { useState, useEffect } from 'react';
import { X, RotateCcw, ArrowLeft, Send } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDevice } from '../../context/DeviceContext';
import { api } from '../../config/api';
import { findSimilarNarcoticsWithBase64 } from '../../services/narcoticReferenceService';

const API_PATH = '/api';

const ImagePreview = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const { isDesktop } = useDevice();
  const [imageData, setImageData] = useState(null);
  const [mode, setMode] = useState(null);
  const [resolution, setResolution] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [fromCamera, setFromCamera] = useState(false);
  const [viewMode, setViewMode] = useState('contain');
  const [fromUpload, setFromUpload] = useState(false);

  useEffect(() => {
    if (location.state && location.state.imageData) {
      setImageData(location.state.imageData);
      setMode(location.state.mode);
      setResolution(location.state.resolution || '');
      setFromCamera(location.state.fromCamera || false);
      setFromUpload(location.state.uploadFromCameraPage || false);
      setViewMode(location.state.viewMode || 'contain');
    } else {
      navigate('/home');
    }
  }, [location.state, navigate]);

  const handleRetake = () => {
    navigate('/camera');
  };

  // Handle going back (generic)
  const handleGoBack = () => {
    navigate(-1);
  };

  // Handle close (return to home)
  const handleClose = () => {
    navigate('/home');
  };

  const resizeImage = (dataUrl, maxWidth = 1600, maxHeight = 1600, quality = 0.95) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        
        if (width <= maxWidth && height <= maxHeight) {
          resolve(dataUrl);
          return;
        }
        
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round(height * (maxWidth / width));
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round(width * (maxHeight / height));
            height = maxHeight;
          }
        }
        
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);
        
        const imageType = dataUrl.startsWith('data:image/png') ? 'image/png' : 'image/jpeg';
        const resizedDataUrl = canvas.toDataURL(imageType, quality);
        resolve(resizedDataUrl);
      };
      
      img.onerror = reject;
      img.src = dataUrl;
    });
  };

  const navigateToUnknownObject = () => {
    const unknownResult = {
      isUnknown: true
    };
    
    navigate('/candidateShow', { 
      state: { 
        result: unknownResult,
        image: imageData,
        fromCamera: fromCamera,
        uploadFromCameraPage: location.state?.uploadFromCameraPage || false,
        sourcePath: location.state?.sourcePath || -1,
        imageData: imageData
      } 
    });
  };

  const handleSubmit = async () => {
    try {
      setIsProcessing(true);
      setError(null);
      
      localStorage.removeItem('analysisResult');
      localStorage.removeItem('evidenceData');
      localStorage.removeItem('currentEvidenceData');
      
      try {
        localStorage.setItem('analysisImage', imageData);
      } catch (storageError) {
        console.warn("Failed to store image in localStorage:", storageError);
        localStorage.setItem('noAnalysisImage', 'true');
      }
      
      let imageToSend = imageData;
      
      const isLargeImage = imageData.length > 1000000;
      
      if (isLargeImage) {
        try {
          const resizedImage = await resizeImage(imageData, 1600, 1600, 0.95);
          
          if (resizedImage.length < imageData.length * 0.9) {
            imageToSend = resizedImage;
          } else {
            console.log("Resize didn't reduce image size significantly, using original");
          }
        } catch (resizeError) {
          console.error("Error resizing image:", resizeError);
        }
      }
      
      let blob;
      try {
        blob = await fetch(imageToSend).then(r => r.blob());
      } catch (error) {
        console.error("Error creating blob:", error);
        navigateToUnknownObject();
        return;
      }
      
      const formData = new FormData();
      formData.append('image', blob, 'image.jpg');
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000);
      
      try {
        const response = await api.post(`${API_PATH}/analyze`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          signal: controller.signal,
          timeout: 120000 // ✅ เพิ่ม timeout สำหรับยาเสพติด
        });
        
        clearTimeout(timeoutId);
        
        console.log("=== API Response Analysis ===");
        console.log("Response status:", response.status);
        console.log("Response data:", response.data);
        
        if (!response.data) {
          console.error("No response data");
          navigateToUnknownObject();
          return;
        }
        
        const result = response.data;
        console.log("=== Processing Result ===");
        console.log("Result:", result);
        console.log("Detection type:", result.detectionType);
        console.log("Detected objects:", result.detected_objects);
        
        // ตรวจสอบว่าเป็นอาวุธปืนหรือไม่
        if (result.detectionType === 'firearm' && result.detected_objects) {
          console.log("=== Processing Firearm Data ===");
          
          // สร้าง brandData จาก detected_objects
          const brands = {};
          const gunClasses = ['BigGun', 'Pistol', 'Revolver'];
          
          result.detected_objects.forEach(detection => {
            console.log("Processing detection:", detection);
            
            if (gunClasses.includes(detection.class) && detection.brand_top3) {
              console.log("Found gun with brand data:", detection.brand_top3);
              
              // จำกัดจำนวน brand ที่แสดง
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
                  
                  // เพิ่ม models ถ้ามี
                  if (detection.model_top3 && detection.brand_top3[0]?.label === brand.label) {
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
          
          console.log("=== Processed Brands ===");
          console.log("Brands object:", brands);
          
          // แปลง brands object เป็น array และเรียงตามความมั่นใจ
          const brandArray = Object.values(brands)
            .filter(brand => brand.models.length > 0) // เฉพาะ brand ที่มี model
            .sort((a, b) => b.confidence - a.confidence)
            .slice(0, 3);
          
          console.log("=== Final Brand Array ===");
          console.log("Brand array:", brandArray);
          
          // เพิ่ม result.brandData เพื่อให้ CandidateShow ใช้งานได้
          result.brandData = brandArray;
          
          // สร้าง flat candidates list
          const flatCandidates = [];
          brandArray.forEach(brand => {
            brand.models.forEach(model => {
              flatCandidates.push({
                label: `${brand.name} ${model.name}`,
                confidence: model.confidence,
                brandName: brand.name,
                modelName: model.name
              });
            });
          });
          
          // เพิ่มตัวเลือก Unknown
          flatCandidates.push({
            label: 'อาวุธปืนไม่ทราบชนิด',
            confidence: 0,
            brandName: 'Unknown',
            modelName: 'Unknown',
            isUnknownWeapon: true
          });
          
          result.candidates = flatCandidates;
          
          console.log("=== Final Result for Navigation ===");
          console.log("brandData:", result.brandData);
          console.log("candidates:", result.candidates);
        } 
        // ✅ ประมวลผลยาเสพติด
        else if (result.detectionType === 'narcotic' && result.detected_objects) {
          console.log("=== Processing Narcotic Data ===");
          
          const drugCandidates = [];
          
          for (const detection of result.detected_objects) {
            if (detection.class === 'Drug') {
              // ถ้ามี similar_narcotics จาก Backend แล้ว
              if (detection.similar_narcotics && Array.isArray(detection.similar_narcotics)) {
                console.log(`Found ${detection.similar_narcotics.length} similar narcotics from backend`);
                
                detection.similar_narcotics.forEach(narcotic => {
                  drugCandidates.push({
                    label: narcotic.characteristics || narcotic.name || 'ยาเสพติดไม่ทราบลักษณะ',
                    displayName: narcotic.characteristics || narcotic.name || 'ยาเสพติดไม่ทราบลักษณะ',
                    confidence: narcotic.similarity || detection.confidence || 0,
                    narcotic_id: narcotic.narcotic_id,
                    drug_type: narcotic.drug_type || 'ไม่ทราบชนิด',
                    drug_category: narcotic.drug_category || 'ไม่ทราบประเภท',
                    characteristics: narcotic.characteristics || 'ไม่ทราบอัตลักษณ์',
                    similarity: narcotic.similarity || 0,
                    source: 'backend_search'
                  });
                });
              } 
              // ✅ ถ้าไม่มี similar_narcotics ให้ใช้ vector ที่ได้มาค้นหาเอง
              else if (detection.vector_base64) {
                console.log('No similar narcotics from backend, searching with vector...');
                
                try {
                  // ใช้ findSimilarNarcoticsWithBase64 จาก narcoticReferenceService
                  const similarResults = await findSimilarNarcoticsWithBase64(detection.vector_base64, 3);
                  
                  console.log('Found similar narcotics from frontend search:', similarResults);
                  
                  if (similarResults && similarResults.length > 0) {
                    similarResults.forEach(narcotic => {
                      drugCandidates.push({
                        label: narcotic.characteristics || narcotic.name || 'ยาเสพติดไม่ทราบลักษณะ',
                        displayName: narcotic.characteristics || narcotic.name || 'ยาเสพติดไม่ทราบลักษณะ',
                        confidence: narcotic.similarity || detection.confidence || 0,
                        narcotic_id: narcotic.narcotic_id,
                        drug_type: narcotic.drug_type || 'ไม่ทราบชนิด',
                        drug_category: narcotic.drug_category || 'ไม่ทราบประเภท',
                        characteristics: narcotic.characteristics || 'ไม่ทราบอัตลักษณ์',
                        similarity: narcotic.similarity || 0,
                        source: 'frontend_search'
                      });
                    });
                  } else {
                    // ถ้าไม่พบผลลัพธ์จากการค้นหา
                    drugCandidates.push({
                      label: detection.drug_type !== 'Unknown' ? detection.drug_type : 'ยาเสพติดไม่ทราบลักษณะ',
                      displayName: detection.drug_type !== 'Unknown' ? detection.drug_type : 'ยาเสพติดไม่ทราบลักษณะ',
                      confidence: detection.confidence || 0,
                      drug_type: detection.drug_type || 'ไม่ทราบชนิด',
                      drug_category: 'ยาเสพติดไม่ทราบประเภท',
                      characteristics: detection.drug_type || 'ไม่ทราบอัตลักษณ์',
                      vector_base64: detection.vector_base64,
                      source: 'ai_detection'
                    });
                  }
                } catch (searchError) {
                  console.error('Error searching similar narcotics:', searchError);
                  
                  // Fallback ถ้าการค้นหาผิดพลาด
                  drugCandidates.push({
                    label: detection.drug_type !== 'Unknown' ? detection.drug_type : 'ยาเสพติดไม่ทราบลักษณะ',
                    displayName: detection.drug_type !== 'Unknown' ? detection.drug_type : 'ยาเสพติดไม่ทราบลักษณะ',
                    confidence: detection.confidence || 0,
                    drug_type: detection.drug_type || 'ไม่ทราบชนิด',
                    drug_category: 'ยาเสพติดไม่ทราบประเภท',
                    characteristics: detection.drug_type || 'ไม่ทราบอัตลักษณ์',
                    vector_base64: detection.vector_base64,
                    source: 'ai_detection_fallback'
                  });
                }
              } else {
                // ถ้าไม่มีทั้ง similar_narcotics และ vector_base64
                drugCandidates.push({
                  label: detection.drug_type !== 'Unknown' ? detection.drug_type : 'ยาเสพติดไม่ทราบลักษณะ',
                  displayName: detection.drug_type !== 'Unknown' ? detection.drug_type : 'ยาเสพติดไม่ทราบลักษณะ',
                  confidence: detection.confidence || 0,
                  drug_type: detection.drug_type || 'ไม่ทราบชนิด',
                  drug_category: 'ยาเสพติดไม่ทราบประเภท',
                  characteristics: detection.drug_type || 'ไม่ทราบอัตลักษณ์',
                  source: 'basic_detection'
                });
              }
            }
          }
          
          // เพิ่มตัวเลือก "ไม่ทราบชนิด" เสมอ
          drugCandidates.push({
            label: 'ยาเสพติดประเภทไม่ทราบชนิด',
            displayName: 'ยาเสพติดประเภทไม่ทราบชนิด',
            confidence: 0,
            isUnknownDrug: true,
            characteristics: 'ไม่ทราบอัตลักษณ์',
            exhibit_id: 94,
            drug_type: 'ไม่ทราบชนิด',
            drug_category: 'ไม่ทราบประเภท',
            source: 'manual_option'
          });
          
          result.drugCandidates = drugCandidates;
          console.log("=== Final Drug Candidates ===");
          console.log("Drug candidates:", drugCandidates);
        }
        
        localStorage.setItem('analysisResult', JSON.stringify(result));

        navigate('/candidateShow', { 
          state: { 
            result: result,
            analysisResult: result,
            image: imageData,
            fromCamera: fromCamera,
            uploadFromCameraPage: location.state?.uploadFromCameraPage || false,
            sourcePath: location.state?.sourcePath || -1
          } 
        });
        
      } catch (fetchError) {
        console.error("Fetch error:", fetchError);
        if (fetchError.name === 'AbortError') {
          console.log("Request timed out after 20 seconds");
        }
        navigateToUnknownObject();
      }
      
    } catch (err) {
      console.error("Error processing image:", err);
      navigateToUnknownObject();
    } finally {
      setIsProcessing(false);
    }
  };

  if (!imageData) return null;

  // Mobile Version
  const MobilePreview = () => (
    <div className="fixed inset-0 bg-black flex flex-col h-screen">
      {/* Header */}
      <div className="relative p-4 flex justify-start items-center bg-black/80">
        <button 
          onClick={fromCamera ? handleRetake : handleGoBack}
          className="p-2 rounded-full hover:bg-gray-800/50 transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-white" />
        </button>
        <span className="text-white font-medium ml-4">ตรวจสอบภาพ</span>
        
        {resolution && (
          <span className="ml-auto text-xs text-gray-400">
            {resolution}
          </span>
        )}
      </div>

      {/* Image preview - แก้ไขตรงนี้ */}
      <div className="flex-1 overflow-hidden relative flex items-center justify-center">
        <div className="relative w-full h-full max-h-[calc(100vh-180px)]">
          <img 
            src={imageData} 
            alt="Preview" 
            className="w-full h-full object-contain"
          />
        </div>
        
        {/* แสดงป้ายประเภทเฉพาะเมื่อมีการระบุ mode จากการอัพโหลด (ไม่ใช่จากหน้า Camera) */}
        {mode && !fromCamera && (
          <div className="absolute top-4 right-4">
            <span className="px-4 py-2 rounded-full bg-black/50 text-white text-sm">
              {mode === 'ยาเสพติด' ? '🔍 ตรวจจับยาเสพติด' : '🔍 ตรวจจับอาวุธปืน'}
            </span>
          </div>
        )}
        
        {error && (
          <div className="absolute bottom-4 left-0 right-0 mx-auto w-full max-w-md px-4">
            <div className="bg-red-500 text-white p-3 rounded-lg text-center">
              {error}
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons - ตรึงไว้ด้านล่างเสมอ */}
      <div className="p-6 bg-black/80 space-y-4 w-full">
        <button
          onClick={handleSubmit}
          disabled={isProcessing}
          className={`w-full py-4 ${isProcessing ? 'bg-gray-500' : 'bg-[#990000] hover:bg-red-800'} rounded-full text-white font-medium flex items-center justify-center space-x-2 transition-colors`}
        >
          <Send className="w-5 h-5" />
          <span>{isProcessing ? 'กำลังวิเคราะห์...' : 'ส่งภาพให้ AI วิเคราะห์'}</span>
        </button>
        
        <button
          onClick={fromCamera ? handleRetake : handleGoBack}
          disabled={isProcessing}
          className="w-full py-4 bg-gray-800 hover:bg-gray-700 rounded-full text-white font-medium flex items-center justify-center space-x-2 transition-colors"
        >
          <RotateCcw className="w-5 h-5" />
          <span>{fromCamera ? 'ถ่ายภาพใหม่' : 'เลือกภาพใหม่'}</span>
        </button>
      </div>
    </div>
  );

  // Desktop Version
  const DesktopPreview = () => (
    <div className="fixed inset-0 bg-gray-900 flex flex-col h-screen">
      {/* Header */}
      <div className="p-4 flex justify-start items-center bg-black">
        <button 
          onClick={fromCamera ? handleRetake : handleGoBack}
          className="p-2 rounded-full hover:bg-gray-800/50 transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-white" />
        </button>
        <span className="text-white font-medium text-xl ml-4">ตรวจสอบภาพ</span>
        
        {resolution && (
          <span className="ml-auto text-sm text-gray-400">
            {resolution}
          </span>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side - Image Preview (70%) */}
        <div className="w-8/12 bg-black flex items-center justify-center p-4 overflow-hidden">
          <div className="relative h-full w-full flex items-center justify-center">
            <img 
              src={imageData} 
              alt="Preview" 
              className={`max-h-full max-w-full object-${viewMode} border border-gray-800`}
            />
            
            {/* แสดงป้ายประเภทเฉพาะเมื่อมีการระบุ mode จากการอัพโหลด (ไม่ใช่จากหน้า Camera) */}
            {mode && !fromCamera && (
              <div className="absolute top-4 right-4">
                <span className="px-4 py-2 rounded-full bg-black/50 text-white">
                  {mode === 'ยาเสพติด' ? '🔍 ตรวจจับยาเสพติด' : '🔍 ตรวจจับอาวุธปืน'}
                </span>
              </div>
            )}
          </div>
        </div>
        
        {/* Right Side - Controls (30%) */}
        <div className="w-4/12 bg-gray-900 p-6 flex flex-col">
          <div className="flex-1"></div> {/* Spacer */}
          
          <div className="space-y-4">
            <button
              onClick={handleSubmit}
              disabled={isProcessing}
              className={`w-full py-4 ${isProcessing ? 'bg-gray-500' : 'bg-[#990000] hover:bg-red-800'} rounded-lg text-white font-medium flex items-center justify-center space-x-2 transition-colors`}
            >
              <Send className="w-5 h-5" />
              <span>{isProcessing ? 'กำลังวิเคราะห์...' : 'ส่งภาพให้ AI วิเคราะห์'}</span>
            </button>
            
            <button
              onClick={fromCamera ? handleRetake : handleGoBack}
              disabled={isProcessing}
              className="w-full py-4 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-medium flex items-center justify-center space-x-2 transition-colors"
            >
              <RotateCcw className="w-5 h-5" />
              <span>{fromCamera ? 'ถ่ายภาพใหม่' : 'เลือกภาพใหม่'}</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Error message */}
      {error && (
        <div className="absolute bottom-20 left-0 right-0 mx-auto w-full max-w-md">
          <div className="bg-red-500 text-white p-3 rounded-lg text-center">
            {error}
          </div>
        </div>
      )}
    </div>
  );

  return isDesktop ? <DesktopPreview /> : <MobilePreview />;
};

export default ImagePreview;