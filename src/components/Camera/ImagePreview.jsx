import React, { useState, useEffect } from 'react';
import { X, Send, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ImagePreview = ({ imageData, mode, onRetake, onClose }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);
  const navigate = useNavigate();

  // Check for desktop or mobile view
  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
      formData.append('mode', mode); // Send mode (ยาเสพติด or อาวุปืน)
      
      // Send to backend API
      const response = await fetch('http://0.0.0.0:8000/api/analyze', {
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
        navigate('/evidenceBasicInform', { state: { type: 'Drug', result: normalizedResult } });
      } else if (mode === 'อาวุปืน') {
        navigate('/evidenceBasicInform', { state: { type: 'Gun', result: normalizedResult } });
      }
      
    } catch (err) {
      console.error("Error processing image:", err);
      setError(err.message || 'Failed to process image');
      setIsProcessing(false);
    }
  };
  
  // Function to normalize result format between different models
  const normalizeResult = (result, mode) => {
    if (mode === 'ยาเสพติด') {
      // Drug model result format is already as expected
      return result;
    } else if (mode === 'อาวุปืน') {
      // Transform weapon detection results to a consistent format
      return {
        detected: result.detected,
        confidence: result.confidence,
        weaponType: result.weaponType,
        detections: result.detections,
        // Add any other fields needed by GunBasicInformation component
      };
    }
    return result;
  };

  // Mobile Version
  const MobilePreview = () => (
    <div className="fixed inset-0 bg-black flex flex-col">
      {/* Header */}
      <div className="relative p-4 flex justify-between items-center bg-black/80">
        <button 
          onClick={onClose}
          className="p-2 rounded-full hover:bg-gray-800/50 transition-colors"
        >
          <X className="w-6 h-6 text-white" />
        </button>
        <span className="text-white font-medium">ตรวจสอบภาพ</span>
        <div className="w-10" /> {/* Spacer for alignment */}
      </div>

      {/* Image Preview */}
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
        
        {/* Error message */}
        {error && (
          <div className="absolute bottom-20 left-0 right-0 mx-auto w-full max-w-md">
            <div className="bg-red-500 text-white p-3 rounded-lg text-center">
              {error}
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
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
          onClick={onRetake}
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
      {/* Header */}
      <div className="p-4 flex justify-between items-center bg-black">
        <button 
          onClick={onClose}
          className="p-2 rounded-full hover:bg-gray-800/50 transition-colors"
        >
          <X className="w-6 h-6 text-white" />
        </button>
        <span className="text-white font-medium text-xl">ตรวจสอบภาพ</span>
        <div className="w-10" /> {/* Spacer for alignment */}
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
              onClick={onRetake}
              disabled={isProcessing}
              className="w-full py-4 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-medium flex items-center justify-center space-x-2 transition-colors"
            >
              <RotateCcw className="w-5 h-5" />
              <span>ถ่ายภาพใหม่</span>
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

  // Return either Mobile or Desktop based on screen size
  return isDesktop ? <DesktopPreview /> : <MobilePreview />;
};

export default ImagePreview;