import React, { useState, useEffect } from 'react';
import { X, RotateCcw, ArrowLeft, Send } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const ImagePreview = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [imageData, setImageData] = useState(null);
  const [mode, setMode] = useState(null);
  const [resolution, setResolution] = useState(null);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [fromCamera, setFromCamera] = useState(false);
  const [viewMode, setViewMode] = useState('contain');

  // Extract image data and mode from navigation state
  useEffect(() => {
    if (location.state && location.state.imageData) {
      setImageData(location.state.imageData);
      setMode(location.state.mode);
      setResolution(location.state.resolution || '');
      setFromCamera(location.state.fromCamera || false);
      // ใช้ viewMode ที่ได้รับจากหน้ากล้อง เพื่อควบคุมการแสดงภาพให้สอดคล้องกับหน้ากล้อง
      setViewMode(location.state.viewMode || 'contain');
    } else {
      // Fallback if no image data
      navigate('/');
    }
  }, [location.state, navigate]);

  // Monitor screen size
  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle going back to camera
  const handleRetake = () => {
    navigate('/');
  };

  // Handle going back (generic)
  const handleGoBack = () => {
    navigate(-1);
  };

  // Handle close (return to home)
  const handleClose = () => {
    navigate('/');
  };

  // Existing handleSubmit method
  const handleSubmit = async () => {
    try {
      setIsProcessing(true);
      setError(null);
      
      // แปลง dataURL เป็น Blob (เฉพาะในกรณีที่ imageData เป็น dataURL)
      let imageBlob;
      if (imageData.startsWith('data:')) {
        // แปลง dataURL เป็น Blob
        const response = await fetch(imageData);
        imageBlob = await response.blob();
      } else {
        // กรณี URL.createObjectURL ให้โหลดข้อมูลจาก URL
        const response = await fetch(imageData);
        imageBlob = await response.blob();
      }
      
      // Create form data
      const formData = new FormData();
      formData.append('image', imageBlob, 'captured_image.jpg');
      formData.append('mode', mode);
      
      // Send to backend API
      const response = await fetch('https://localhost:8000/api/analyze', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }
      
      const result = await response.json();
      
      // Normalize result format
      const normalizedResult = normalizeResult(result, mode);
      
      // Store result in localStorage
      localStorage.setItem('analysisResult', JSON.stringify(normalizedResult));
      localStorage.setItem('analysisImage', imageData);
      
      // Navigate to results page
      if (mode === 'ยาเสพติด') {
        navigate('/evidenceProfile', { state: { type: 'Drug', result: normalizedResult } });
      } else if (mode === 'อาวุปืน') {
        navigate('/evidenceProfile', { state: { type: 'Gun', result: normalizedResult } });
      }
      
    } catch (err) {
      console.error("Error processing image:", err);
      setError(err.message || 'Failed to process image');
      setIsProcessing(false);
    }
  };

  // Normalize result for consistent format
  const normalizeResult = (result, mode) => {
    if (mode === 'ยาเสพติด') {
      return result;
    } else if (mode === 'อาวุปืน') {
      return {
        detected: result.detected,
        confidence: result.confidence,
        weaponType: result.weaponType,
        detections: result.detections,
      };
    }
    return result;
  };

  // If no image data, don't render anything
  if (!imageData) return null;

  // Mobile Version
  const MobilePreview = () => (
    <div className="fixed inset-0 bg-black flex flex-col">
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

      {/* Image preview with fixed aspect ratio container */}
      <div className="flex-1 relative flex items-center justify-center bg-black overflow-hidden">
        <div className="w-full h-full flex items-center justify-center">
          <img 
            src={imageData} 
            alt="Preview" 
            className={`max-w-full max-h-full object-contain`}
          />
        </div>
        <div className="absolute top-4 right-4">
          <span className="px-4 py-2 rounded-full bg-black/50 text-white text-sm">
            {mode === 'ยาเสพติด' ? '🔍 ตรวจจับยาเสพติด' : '🔍 ตรวจจับอาวุธปืน'}
          </span>
        </div>
        
        {error && (
          <div className="absolute bottom-20 left-0 right-0 mx-auto w-full max-w-md">
            <div className="bg-red-500 text-white p-3 rounded-lg text-center">
              {error}
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons - Fixed at bottom */}
      <div className="p-6 bg-black/80 space-y-4">
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
    <div className="fixed inset-0 bg-black flex">
      {/* Left side - Image preview */}
      <div className="w-8/12 relative flex items-center justify-center bg-black overflow-hidden">
        <div className="w-full h-full flex items-center justify-center">
          <img 
            src={imageData} 
            alt="Preview" 
            className={`max-w-full max-h-full object-contain`}
          />
        </div>
        <div className="absolute top-4 right-4">
          <span className="px-4 py-2 rounded-full bg-black/50 text-white text-sm">
            {mode === 'ยาเสพติด' ? '🔍 ตรวจจับยาเสพติด' : '🔍 ตรวจจับอาวุธปืน'}
          </span>
        </div>
      </div>

      {/* Right side - Controls */}
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