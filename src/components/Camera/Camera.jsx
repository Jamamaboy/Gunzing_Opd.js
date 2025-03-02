import React, { useState, useRef, useEffect } from 'react';
import { Camera, RotateCw, Image as ImageIcon, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ImagePreview from './ImagePreview';

const CameraPage = () => {
  const navigate = useNavigate();
  const [stream, setStream] = useState(null);
  const [facingMode, setFacingMode] = useState('environment');
  const [selectedMode, setSelectedMode] = useState('ยาเสพติด');
  const [capturedImage, setCapturedImage] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const startCamera = async () => {
    try {
      // Stop any existing streams first
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      
      const constraints = {
        video: {
          facingMode: facingMode,
        }
      };
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      // Fallback to file upload if camera access fails
      alert("ไม่สามารถเข้าถึงกล้องได้ โปรดใช้การอัพโหลดภาพแทน");
    }
  };

  // Start camera when component mounts or facingMode changes
  useEffect(() => {
    if (!capturedImage) {
      startCamera();
    }
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [facingMode, capturedImage]);

  const handleBack = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    navigate(-1);
  };

  const switchCamera = () => {
    setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0);
      
      const imageData = canvasRef.current.toDataURL('image/jpeg');
      // Stop the camera stream when capturing image
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      setCapturedImage(imageData);
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    // Camera will automatically restart due to useEffect
  };

  const selectFromGallery = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        // Stop the camera stream when selecting from gallery
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
        const reader = new FileReader();
        reader.onload = (event) => {
          setCapturedImage(event.target.result);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  return (
    <div className="relative h-screen w-full bg-black">
      {capturedImage ? (
        <ImagePreview
          imageData={capturedImage}
          mode={selectedMode}
          onRetake={handleRetake}
          onClose={handleRetake}
        />
      ) : (
        <>
          {/* Back Button */}
          <div className="absolute top-4 left-4 z-10">
            <button 
              onClick={handleBack}
              className="p-2 rounded-full bg-gray-800/50"
            >
              <ArrowLeft className="w-6 h-6 text-white" />
            </button>
          </div>

          {/* Camera Preview */}
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline
            className="h-full w-full object-cover"
          />
          <canvas ref={canvasRef} className="hidden" />

          {/* Bottom Controls */}
          <div className="absolute bottom-0 left-0 right-0 bg-black/80 pb-6">
            {/* Mode Selection */}
            <div className="flex justify-around py-2 mb-4">
              <button 
                className={`px-6 py-2 rounded-full text-sm ${selectedMode === 'ยาเสพติด' ? 'bg-white text-black' : 'text-white'}`}
                onClick={() => setSelectedMode('ยาเสพติด')}
              >
                ยาเสพติด
              </button>
              <button 
                className={`px-6 py-2 rounded-full text-sm ${selectedMode === 'อาวุปืน' ? 'bg-white text-black' : 'text-white'}`}
                onClick={() => setSelectedMode('อาวุปืน')}
              >
                อาวุปืน
              </button>
            </div>

            {/* Camera Controls */}
            <div className="flex justify-around items-center px-4">
              <button onClick={selectFromGallery} className="p-2">
                <ImageIcon className="w-8 h-8 text-white" />
              </button>
              <button 
                onClick={captureImage}
                className="w-16 h-16 rounded-full border-4 border-white bg-white/20 flex items-center justify-center"
              />
              <button onClick={switchCamera} className="p-2">
                <RotateCw className="w-8 h-8 text-white" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CameraPage;