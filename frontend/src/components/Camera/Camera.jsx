import React, { useState, useRef, useEffect, useCallback, use } from 'react';
import { X, Image as ImageIcon, RotateCw, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
// import { useDevice } from '../../context/DeviceContext';

import TutorialModal from '../Tutorial/TutorialModal';
import { Tutorial } from '../../data/tutorialData';

const CameraPage = () => {
  const navigate = useNavigate();
  // const { isMobile } = useDevice();
  const [stream, setStream] = useState(null);
  const [facingMode, setFacingMode] = useState('environment');
  const [currentResolution, setCurrentResolution] = useState('');
  const [isInitializing, setIsInitializing] = useState(true);

  const [showTutorial, setShowTutorial] = useState(false);
  const [hasSeenTutorial, setHasSeenTutorial] = useState(false);


  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // const [supportsImageCapture, setSupportsImageCapture] = useState(typeof ImageCapture !== 'undefined');

  const startCamera = useCallback(async () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      const constraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 4096 },
          height: { ideal: 3072 },
          frameRate: { ideal: 30 },
          advanced: [{
            focusMode: 'continuous',
            exposureMode: 'continuous',
            whiteBalanceMode: 'continuous'
          }]
        }
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      streamRef.current = mediaStream;

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }

      // ตรวจสอบและตั้งค่า capabilities ที่ดีที่สุด
      const videoTrack = mediaStream.getVideoTracks()[0];
      if (videoTrack) {
        // แสดงความละเอียดปัจจุบัน
        const initialSettings = videoTrack.getSettings();
        setCurrentResolution(`${initialSettings.width}x${initialSettings.height}`);

        const capabilities = videoTrack.getCapabilities();

        // ปรับใช้ความสามารถที่ดีที่สุดเท่าที่กล้องรองรับ - แบบง่ายขึ้น
        try {
          const settings = {};

          // ใช้ความละเอียดสูงสุดที่กล้องรองรับ
          if (capabilities.width?.max) settings.width = capabilities.width.max;
          if (capabilities.height?.max) settings.height = capabilities.height.max;

          // โฟกัสอัตโนมัติ
          if (capabilities.focusMode?.includes('continuous')) {
            settings.focusMode = 'continuous';
          }

          // ปรับความคมชัด
          if (capabilities.sharpness) settings.sharpness = capabilities.sharpness.max;

          await videoTrack.applyConstraints(settings);

          // แสดงความละเอียดที่ใช้จริง
          const actualSettings = videoTrack.getSettings();
          setCurrentResolution(`${actualSettings.width}x${actualSettings.height}`);
        } catch (err) {
          console.warn('Could not apply optimal camera settings:', err);
          // ดำเนินการต่อแม้จะไม่สามารถปรับการตั้งค่าได้
        }
      }

      setIsInitializing(false);
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("ไม่สามารถเข้าถึงกล้องได้ โปรดใช้การอัพโหลดภาพแทน");
      setIsInitializing(false);
    }
  }, [facingMode]);

  useEffect(() => {
    if (hasSeenTutorial) {
      setShowTutorial(false);
    } else {
      setShowTutorial(true);
    }
  }, [hasSeenTutorial]);

  // useEffect(() => {
  //   const hasSeenBefore = localStorage.getItem('hasSeenTutorial');
  //   if (!hasSeenBefore) {
  //     setShowTutorial(true); // Show tutorial automatically for first-time users
  //   }
  //   setHasSeenTutorial(!!hasSeenBefore);
  // }, []);

  // Start camera when component mounts or relevant settings change
  useEffect(() => {
    startCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [facingMode, startCamera]);

  const handleClose = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    navigate('/home');
  };

  const switchCamera = () => {
    setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
  };

  // ปรับปรุงวิธีการถ่ายภาพ
  const captureImage = async () => {
    if (isInitializing) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) return;

    try {
      // ใช้ canvas เพื่อจับภาพ
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const context = canvas.getContext('2d', { alpha: false });
      context.drawImage(video, 0, 0);

      const imageData = canvas.toDataURL('image/jpeg', 0.95);
      const resolution = `${canvas.width}x${canvas.height}`;

      // นำทางไปยัง ImagePreview ด้วยข้อมูลที่ได้
      navigate('/imagePreview', {
        state: {
          imageData: imageData,
          resolution: resolution,
          fromCamera: true,
          sourcePath: '/camera',
          viewMode: 'cover'
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
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (event) => {
          navigate('/imagePreview', {
            state: {
              imageData: event.target.result,
              fromCamera: false,
              uploadFromCameraPage: true,
              sourcePath: '/camera'
            }
          });
        };
        reader.readAsDataURL(file);
      }
    };

    input.click();
  };

  const closeTutorial = () => {
    setShowTutorial(false);
    // localStorage.setItem('hasSeenTutorial', 'true');
    setHasSeenTutorial(true);
  };

  return (
    <div className="relative h-screen w-full bg-black">
      {/* Loading Indicator */}
      {isInitializing && (
        <div className="absolute inset-0 bg-black flex items-center justify-center">
          <div className="text-white">กำลังเตรียมกล้องนะครับต้าวอ้วง...</div>
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

      {/* Camera Resolution Indicator */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
        <div className="text-xs text-white bg-black/50 px-2 py-1 rounded">
          {currentResolution || 'กำลังโหลด...'}
        </div>
      </div>

      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={() => setShowTutorial(prev => !prev)}
          className="p-2 rounded-full bg-gray-800/50"
        >
          <Info className="w-6 h-6 text-white" />
        </button>
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
      <div className="absolute bottom-0 left-0 right-0 bg-black/80 pb-6 pt-4">
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
      {showTutorial && (
        <TutorialModal
          tutorialData={Tutorial}
          onClose={closeTutorial}
        />
      )}
    </div>
  );
};

export default CameraPage;
