import React, { useState, useEffect } from 'react';
import { X, RotateCcw, ArrowLeft } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const ImagePreview = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [imageData, setImageData] = useState(null);
  const [mode, setMode] = useState(null);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);

  // Extract image data and mode from navigation state
  useEffect(() => {
    if (location.state && location.state.imageData) {
      setImageData(location.state.imageData);
      setMode(location.state.mode);
    } else {
      // Fallback or error handling if no image data
      navigate('/');
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
    navigate('/');
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
      </div>

      {/* Action Buttons - Removed AI submit button */}
      <div className="p-6 bg-black/80">
        <button
          onClick={handleGoBack}
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
      {/* Header - Only back button */}
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
        
        {/* Right Side - Only back button (30%) */}
        <div className="w-4/12 bg-gray-900 p-6 flex flex-col">
          <div className="flex-1"></div> {/* Spacer to push buttons to bottom */}
          
          <div className="space-y-4">
            <button
              onClick={handleGoBack}
              className="w-full py-4 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-medium flex items-center justify-center space-x-2 transition-colors"
            >
              <RotateCcw className="w-5 h-5" />
              <span>ถ่ายภาพใหม่</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return isDesktop ? <DesktopPreview /> : <MobilePreview />;
};

export default ImagePreview;