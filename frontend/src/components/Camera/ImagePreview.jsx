import React, { useState, useEffect } from 'react';
import { X, RotateCcw, ArrowLeft, Send } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDevice } from '../../context/DeviceContext';
import { api } from '../../config/api';
import { findSimilarNarcotics, findSimilarNarcoticsWithBase64, prepareSimilarNarcoticsForDisplay } from '../../services/narcoticReferenceService';

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
      } else {
        console.log("Image is small enough, no resize needed");
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
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        console.log("Analyze Response:", response.status);
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error("API Error:", errorData);
          navigateToUnknownObject();
          return;
        }
        
        const result = response.data;
        console.log("Analysis result:", result);
        
        const isValidResult = result && 
          (result.detected_objects || result.detections || result.prediction || result.details);
        
        if (!isValidResult) {
          console.error("Invalid result structure:", result);
          navigateToUnknownObject();
          return;
        }
        
        if (result && result.detectionType === 'narcotic' && 
            result.detected_objects && result.detected_objects.length > 0) {

          console.log("Drug object structure:", JSON.stringify(result.detected_objects[0]));
          
          const drugObject = result.detected_objects[0];
          
          let vectorData = null;
          
          if (drugObject.vector) {
            console.log("Vector found in drugObject.vector", drugObject.vector.length);
            vectorData = drugObject.vector;
          } else if (drugObject.vector_info && drugObject.vector_info.vector) {
            console.log("Vector found in vector_info.vector", drugObject.vector_info.vector.length);
            vectorData = drugObject.vector_info.vector;
          } else if (drugObject.vector_base64) {
            // เพิ่มเงื่อนไขสำหรับ vector_base64
            console.log("Vector base64 found, searching with it directly");
            try {
              // ค้นหายาเสพติดโดยใช้ vector_base64 โดยตรง
              const similarNarcotics = await findSimilarNarcoticsWithBase64(drugObject.vector_base64);
              console.log("Similar narcotics:", similarNarcotics);
              
              if (similarNarcotics && similarNarcotics.length > 0) {
                result.similarNarcotics = similarNarcotics;
                result.drugCandidates = prepareSimilarNarcoticsForDisplay(similarNarcotics);
                console.log("Added similar narcotics to result");
              }
            } catch (error) {
              console.error("Error finding similar narcotics with base64:", error);
            }
          } else {
            console.log("No vector data found in drug object");
            console.log("Available fields:", Object.keys(drugObject));
          }
          
          // ดำเนินการต่อเฉพาะเมื่อ
          if (vectorData) {
            try {
              // ค้นหายาเสพติดที่คล้ายคลึงกันด้วย vector array
              console.log("Searching for similar narcotics...");
              const similarNarcotics = await findSimilarNarcotics(vectorData);
              console.log("Similar narcotics:", similarNarcotics);
              
              if (similarNarcotics && similarNarcotics.length > 0) {
                result.similarNarcotics = similarNarcotics;
                result.drugCandidates = prepareSimilarNarcoticsForDisplay(similarNarcotics);
                console.log("Added similar narcotics to result");
              }
            } catch (error) {
              console.error("Error finding similar narcotics:", error);
            }
          }
        }
        
        localStorage.setItem('analysisResult', JSON.stringify(result));

        navigate('/candidateShow', { 
          state: { 
            result: result,
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