import React, { useState, useRef, useEffect } from 'react';
import { Camera, RotateCw, Image as ImageIcon, Settings } from 'lucide-react';

const Camera = () => {
  const [stream, setStream] = useState(null);
  const [facingMode, setFacingMode] = useState('environment');
  const [selectedMode, setSelectedMode] = useState('model1');
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [facingMode]);

  const startCamera = async () => {
    try {
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
    }
  };

  const switchCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0);
      
      // Here you can add logic to send the image to your model
      const imageData = canvasRef.current.toDataURL('image/jpeg');
      console.log(`Captured image will be processed by ${selectedMode}`);
    }
  };

  const selectFromGallery = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        // Here you can add logic to process the selected image
        console.log(`Selected image will be processed by ${selectedMode}`);
      }
    };
    input.click();
  };

  return (
    <div className="relative h-screen w-full bg-black">
      {/* Camera Preview */}
      <video 
        ref={videoRef} 
        autoPlay 
        playsInline
        className="h-full w-full object-cover"
      />
      <canvas ref={canvasRef} className="hidden" />

      {/* Zoom Controls */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/50 rounded-full px-4 py-2 flex gap-4">
        <button className="text-white">0.6</button>
        <button className="text-white font-bold">1x</button>
        <button className="text-white">2</button>
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-0 left-0 right-0 bg-black/80 pb-6">
        {/* Mode Selection */}
        <div className="flex justify-around py-2 mb-4">
          <button 
            className={`px-4 py-1 rounded-full ${selectedMode === 'model1' ? 'bg-white text-black' : 'text-white'}`}
            onClick={() => setSelectedMode('model1')}
          >
            Model 1
          </button>
          <button 
            className={`px-4 py-1 rounded-full ${selectedMode === 'model2' ? 'bg-white text-black' : 'text-white'}`}
            onClick={() => setSelectedMode('model2')}
          >
            Model 2
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
    </div>
  );
};

export default Camera;