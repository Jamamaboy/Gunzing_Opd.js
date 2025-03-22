import React, { useState, useRef, useEffect } from 'react';
import { X, Image as ImageIcon, RotateCw, Zap, ZapOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CameraPage = () => {
  const navigate = useNavigate();
  const [stream, setStream] = useState(null);
  const [facingMode, setFacingMode] = useState('environment');
  const [selectedMode, setSelectedMode] = useState('อาวุปืน');
  const [currentResolution, setCurrentResolution] = useState('');
  const [isInitializing, setIsInitializing] = useState(true);
  const [isFlashOn, setIsFlashOn] = useState(false);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  
  // ตรวจสอบว่าอุปกรณ์รองรับการทำงานบนอุปกรณ์เคลื่อนที่หรือไม่
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  // ตรวจสอบว่าอุปกรณ์นี้รองรับ ImageCapture API หรือไม่
  const [supportsImageCapture, setSupportsImageCapture] = useState(typeof ImageCapture !== 'undefined');

  // Start camera function
  const startCamera = async () => {
    try {
      setIsInitializing(true);
      
      // ตรวจสอบอุปกรณ์ที่รองรับ
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      
      // เลือกกล้องหลังถ้ามี
      let constraints = {
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      };

      // ถ้ามีกล้องหลายตัว ให้เลือกกล้องหลัง
      if (videoDevices.length > 1) {
        const backCamera = videoDevices.find(device => 
          device.label.toLowerCase().includes('back') || 
          device.label.toLowerCase().includes('environment')
        );
        
        if (backCamera) {
          constraints.video.deviceId = { exact: backCamera.deviceId };
        } else {
          constraints.video.facingMode = 'environment';
        }
      } else {
        constraints.video.facingMode = 'environment';
      }

      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(newStream);
      streamRef.current = newStream;

      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }

      // Get video resolution
      const videoTrack = newStream.getVideoTracks()[0];
      const settings = videoTrack.getSettings();
      setCurrentResolution(`${settings.width}x${settings.height}`);

      // ตั้งค่า Flash ถ้ารองรับ
      if (videoTrack.getCapabilities().torch) {
        try {
          await videoTrack.applyConstraints({
            advanced: [{ torch: isFlashOn }]
          });
        } catch (err) {
          console.warn('Could not set torch:', err);
        }
      }

      setIsInitializing(false);
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("ไม่สามารถเข้าถึงกล้องได้ โปรดใช้การอัพโหลดภาพแทน");
      setIsInitializing(false);
    }
  };

  // Toggle flash function
  const toggleFlash = async () => {
    if (!streamRef.current) return;
    
    const videoTrack = streamRef.current.getVideoTracks()[0];
    if (!videoTrack.getCapabilities().torch) return;

    try {
      setIsFlashOn(!isFlashOn);
      await videoTrack.applyConstraints({
        advanced: [{ torch: !isFlashOn }]
      });
    } catch (err) {
      console.warn('Could not toggle torch:', err);
    }
  };

  // Start camera when component mounts or relevant settings change
  useEffect(() => {
    startCamera();
    
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [facingMode]);

  const handleClose = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    navigate('/');
  };

  const switchCamera = () => {
    setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
  };

  // ปรับปรุงวิธีการถ่ายภาพให้เร็วขึ้น
  const captureImage = async () => {
    if (isInitializing) return; // ไม่ดำเนินการถ้ายังไม่พร้อม
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (!video || !canvas) return;
    
    try {
      // ใช้ canvas เป็นวิธีหลัก เพราะทำงานได้กับทุกอุปกรณ์และเร็วกว่า
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const context = canvas.getContext('2d', { alpha: false });
      context.drawImage(video, 0, 0);
      
      // ใช้ dataURL โดยตรงแทนการสร้าง Blob URL เพื่อความเร็ว
      // ใช้คุณภาพ JPEG สูง (0.95) เพื่อรักษาความคมชัด
      const imageData = canvas.toDataURL('image/jpeg', 0.95);
      const resolution = `${canvas.width}x${canvas.height}`;
      
      // หยุดกล้อง
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      
      // นำทางไปยัง ImagePreview
      navigate('/imagePreview', { 
        state: { 
          imageData: imageData, 
          mode: selectedMode,
          resolution: resolution,
          fromCamera: true,
          viewMode: 'contain' // เปลี่ยนเป็น contain เพื่อให้เห็นภาพเต็ม
        } 
      });
    } catch (err) {
      console.warn('Error capturing image:', err);
      alert('เกิดข้อผิดพลาดในการถ่ายภาพ กรุณาลองอีกครั้ง');
    }
  };

  const selectFromGallery = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          navigate('/imagePreview', {
            state: {
              imageData: event.target.result,
              mode: selectedMode,
              resolution: 'Gallery Image',
              fromCamera: false,
              viewMode: 'contain'
            }
          });
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  return (
    <div className="relative h-screen w-full bg-black">
      {/* Loading Indicator */}
      {isInitializing && (
        <div className="absolute inset-0 bg-black flex items-center justify-center">
          <div className="text-white">กำลังเตรียมกล้อง...</div>
        </div>
      )}
      
      {/* Close Button */}
      <div className="absolute top-4 left-4 z-10">
        <button 
          onClick={handleClose}
          className="p-2 rounded-full bg-gray-800/50"
        >
          <X className="w-6 h-6 text-white" />
        </button>
      </div>

      {/* Flash Button */}
      <div className="absolute top-4 right-4 z-10">
        <button 
          onClick={toggleFlash}
          className="p-2 rounded-full bg-gray-800/50"
        >
          {isFlashOn ? (
            <Zap className="w-6 h-6 text-yellow-400" />
          ) : (
            <ZapOff className="w-6 h-6 text-white" />
          )}
        </button>
      </div>

      {/* Camera Resolution Indicator */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
        <div className="text-xs text-white bg-black/50 px-2 py-1 rounded">
          {currentResolution || 'กำลังโหลด...'}
        </div>
      </div>

      {/* Camera Preview */}
      <div className="relative h-full">
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline
          className="h-full w-full object-cover"
        />
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-0 left-0 right-0 bg-black/80 pb-6">
        {/* Mode Selection */}
        <div className="flex justify-around py-2 mb-4">
          <button 
            className={`px-6 py-2 rounded-full text-sm ${selectedMode === 'อาวุปืน' ? 'bg-white text-black' : 'text-white'}`}
            onClick={() => setSelectedMode('อาวุปืน')}
          >
            อาวุปืน
          </button>
          <button 
            className={`px-6 py-2 rounded-full text-sm ${selectedMode === 'ยาเสพติด' ? 'bg-white text-black' : 'text-white'}`}
            onClick={() => setSelectedMode('ยาเสพติด')}
          >
            ยาเสพติด
          </button>
        </div>

        {/* Camera Controls */}
        <div className="flex justify-around items-center px-4">
          <button 
            onClick={selectFromGallery} 
            className="p-2"
          >
            <ImageIcon className="w-8 h-8 text-white" />
          </button>
          
          <button 
            onClick={captureImage}
            className="w-16 h-16 rounded-full border-4 border-white bg-white/20 flex items-center justify-center"
          />
          
          <button 
            onClick={switchCamera} 
            className="p-2"
          >
            <RotateCw className="w-8 h-8 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CameraPage;