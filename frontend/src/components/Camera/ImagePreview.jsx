import React, { useState, useEffect } from 'react';
import { X, RotateCcw, ArrowLeft, Send } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const ImagePreview = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [imageData, setImageData] = useState(null);
  const [mode, setMode] = useState(null);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  const handleRetakeOrGoBack = () => {
    // Check if the page was originally from the camera
    const isFromCamera = location.state?.fromCamera || false;

    if (isFromCamera) {
      // If from camera, go back to camera page
      navigate('/camera');
    } else {
      // If from other pages, go back to previous page
      navigate(-1);
    }
  };

  // Extract image data and mode from navigation state
  useEffect(() => {
    if (location.state && location.state.imageData) {
      setImageData(location.state.imageData);
      setMode(location.state.mode);
    } else {
      // Fallback or error handling if no image data
      navigate('/home');
    }
  }, [location.state, navigate]);

  // Existing useEffect for resize
  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle going back to previous page
  const handleGoBack = () => {
    navigate(-1);
  };

  // Handle close (return to home)
  const handleClose = () => {
    navigate('/home');
  };

  // If no image data, don't render anything
  if (!imageData) return null;

  // Existing handleSubmit method...
  const handleSubmit = async () => {
    try {
      setIsProcessing(true);
      setError(null);
      
      // Convert base64 image to blob for sending to server
      const base64Response = await fetch(imageData);
      const blob = await base64Response.blob();
      
      // Create form data to send image to backend
      const formData = new FormData();
      formData.append('image', blob, 'captured_image.jpg');
      formData.append('mode', mode);
      
      // Send to backend API
      const response = await fetch('http://localhost:8000/api/analyze', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }
      
      const result = await response.json();
      
      // Normalize result format between drug and weapon models
      const normalizedResult = normalizeResult(result, mode);
      
      // Store result in localStorage (or you could use context/redux)
      localStorage.setItem('analysisResult', JSON.stringify(normalizedResult));
      localStorage.setItem('analysisImage', imageData);
      
      // Navigate to the evidence page with the appropriate type
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

  // Normalize result method remains the same...
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
      {/* Header - Only back button */}
      <div className="relative p-4 flex justify-start items-center bg-black/80">
        <button 
          onClick={handleGoBack}
          className="p-2 rounded-full hover:bg-gray-800/50 transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-white" />
        </button>
        <span className="text-white font-medium ml-4">ตรวจสอบภาพ</span>
      </div>

      {/* Image preview */}
      <div className="flex-1 relative">
        <img 
          src={imageData} 
          alt="Preview" 
          className="w-full h-full object-contain"
        />
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

      {/* Action Buttons - Removed AI submit button */}
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
          onClick={handleGoBack}
          disabled={isProcessing}
          className="w-full py-4 bg-gray-800 hover:bg-gray-700 rounded-full text-white font-medium flex items-center justify-center space-x-2 transition-colors"
        >
          <RotateCcw className="w-5 h-5" />
          <span>ถ่ายภาพใหม่</span>
        </button>
      </div>
    </div>
  );

  // Desktop Version
  const DesktopPreview = () => (
    <div className="fixed inset-0 bg-gray-900 flex flex-col">
      {/* Header - Removed close button, only back button */}
      <div className="p-4 flex justify-start items-center bg-black">
        <button 
          onClick={handleGoBack}
          className="p-2 rounded-full hover:bg-gray-800/50 transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-white" />
        </button>
        <span className="text-white font-medium text-xl ml-4">ตรวจสอบภาพ</span>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Left Side - Image Preview (70%) */}
        <div className="w-8/12 bg-black flex items-center justify-center p-4">
          <div className="relative max-h-full max-w-full">
            <img 
              src={imageData} 
              alt="Preview" 
              className="max-h-full max-w-full object-contain border border-gray-800"
            />
            <div className="absolute top-4 right-4">
              <span className="px-4 py-2 rounded-full bg-black/50 text-white">
                {mode === 'ยาเสพติด' ? '🔍 ตรวจจับยาเสพติด' : '🔍 ตรวจจับอาวุธปืน'}
              </span>
            </div>
          </div>
        </div>
        
        {/* Right Side - Only buttons (30%) */}
        <div className="w-4/12 bg-gray-900 p-6 flex flex-col">
          <div className="flex-1"></div> {/* Spacer to push buttons to bottom */}
          
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
              onClick={handleGoBack}
              disabled={isProcessing}
              className="w-full py-4 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-medium flex items-center justify-center space-x-2 transition-colors"
            >
              <RotateCcw className="w-5 h-5" />
              {location.state?.fromCamera ? 'ถ่ายภาพใหม่' : 'อัพโหลดภาพใหม่'}
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