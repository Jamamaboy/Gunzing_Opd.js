import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, Image as ImageIcon, RotateCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CameraPage = () => {
  const navigate = useNavigate();
  const [stream, setStream] = useState(null);
  const [facingMode, setFacingMode] = useState('environment');
  const [selectedMode, setSelectedMode] = useState('อาวุปืน');
  const [currentResolution, setCurrentResolution] = useState('');
  const [isInitializing, setIsInitializing] = useState(true);
  
  // State for real-time detection
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectionResults, setDetectionResults] = useState(null);
  const [detectionConfidence, setDetectionConfidence] = useState(0);
  const [detectionClass, setDetectionClass] = useState('');
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const detectionIntervalRef = useRef(null);
  
  // ตรวจสอบว่าอุปกรณ์รองรับการทำงานบนอุปกรณ์เคลื่อนที่หรือไม่
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  // ตรวจสอบว่าอุปกรณ์นี้รองรับ ImageCapture API หรือไม่
  const [supportsImageCapture, setSupportsImageCapture] = useState(typeof ImageCapture !== 'undefined');

  const startCamera = useCallback(async () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      
      // ตั้งค่า constraints พื้นฐาน
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

  // Start real-time detection
  const startDetection = useCallback(() => {
    if (selectedMode !== 'อาวุปืน' || !videoRef.current || !canvasRef.current) return;
    
    setIsDetecting(true);
    
    // Set up interval for frame capture and detection
    const detectionInterval = setInterval(async () => {
      try {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        
        // Capture frame
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        const context = canvas.getContext('2d', { alpha: false });
        context.drawImage(video, 0, 0);
        
        // Convert to blob for API submission
        canvas.toBlob(async (blob) => {
          if (!blob) return;
          
          // Create form data
          const formData = new FormData();
          formData.append('image', blob, 'frame.jpg');
          formData.append('mode', 'อาวุปืน');
          
          // Send to API
          const response = await fetch('http://localhost:8000/api/detect', {
            method: 'POST',
            body: formData
          });
          
          if (response.ok) {
            const result = await response.json();
            
            // Update detection results
            setDetectionResults(result);
            setDetectionConfidence(result.confidence || 0);
            setDetectionClass(result.weaponType || '');
            
            // Draw detections on overlay canvas if detections exist
            if (result.detections && result.detections.length > 0) {
              drawDetections(result.detections);
            } else {
              // Clear overlay if no detections
              const overlayCanvas = document.getElementById('detection-overlay');
              if (overlayCanvas) {
                const ctx = overlayCanvas.getContext('2d');
                ctx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
              }
            }
          }
        }, 'image/jpeg', 0.7); // Lower quality for faster transmission
      } catch (err) {
        console.error('Error in real-time detection:', err);
      }
    }, 500); // Adjust interval as needed (500ms = 2fps)
    
    detectionIntervalRef.current = detectionInterval;
  }, [selectedMode]);
  
  // Function to draw bounding boxes on overlay canvas
  const drawDetections = (detections) => {
    const video = videoRef.current;
    const overlayCanvas = document.getElementById('detection-overlay');
    
    if (!video || !overlayCanvas) return;
    
    // Set canvas to video dimensions
    overlayCanvas.width = video.videoWidth;
    overlayCanvas.height = video.videoHeight;
    
    const ctx = overlayCanvas.getContext('2d');
    ctx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
    
    // Draw each detection
    detections.forEach(detection => {
      const [x1, y1, x2, y2] = detection.box;
      const width = x2 - x1;
      const height = y2 - y1;
      
      // Draw bounding box
      ctx.strokeStyle = '#FF0000';
      ctx.lineWidth = 3;
      ctx.strokeRect(x1, y1, width, height);
      
      // Draw label
      ctx.fillStyle = '#FF0000';
      ctx.font = 'bold 16px Arial';
      const label = `${detection.class} ${Math.round(detection.confidence * 100)}%`;
      ctx.fillText(label, x1, y1 > 20 ? y1 - 5 : y1 + 20);
    });
  };
  
  // Stop real-time detection
  const stopDetection = useCallback(() => {
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
    setIsDetecting(false);
    setDetectionResults(null);
    
    // Clear detection overlay
    const overlayCanvas = document.getElementById('detection-overlay');
    if (overlayCanvas) {
      const ctx = overlayCanvas.getContext('2d');
      ctx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
    }
  }, []);

  // Start camera when component mounts or relevant settings change
  useEffect(() => {
    startCamera();
    
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      stopDetection();
    };
  }, [facingMode, startCamera, stopDetection]);
  
  // Start or stop detection based on selected mode
  useEffect(() => {
    if (selectedMode === 'อาวุปืน' && !isInitializing) {
      startDetection();
    } else {
      stopDetection();
    }
    
    return () => {
      stopDetection();
    };
  }, [selectedMode, isInitializing, startDetection, stopDetection]);

  const handleClose = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    stopDetection();
    navigate('/home');
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
      
      // นำทางไปยัง ImagePreview ทันที
      navigate('/imagePreview', { 
        state: { 
          imageData: imageData, 
          mode: selectedMode,
          resolution: resolution,
          fromCamera: true,
          viewMode: 'cover',
          detectionResults: detectionResults  // Pass detection results if available
        } 
      });
    } catch (err) {
      console.warn('Error capturing image:', err);
      alert('เกิดข้อผิดพลาดในการถ่ายภาพ กรุณาลองอีกครั้ง');
    }
  };

  const selectFromGallery = () => {
    if (isInitializing) return;
    
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      try {
        const file = e.target.files[0];
        if (file) {
          // สร้าง FileReader เพื่อให้ทำงานเร็วขึ้น
          const reader = new FileReader();
          reader.onload = (event) => {
            navigate('/imagePreview', { 
              state: { 
                imageData: event.target.result,
                mode: selectedMode,
                fromCamera: false,
                viewMode: 'contain'  // รูปภาพจากแกลเลอรี่ใช้ contain
              } 
            });
          };
          reader.readAsDataURL(file);  // อ่านเป็น data URL เลย เร็วกว่า Blob URL
        }
      } catch (err) {
        console.error('Error processing gallery image:', err);
        alert('เกิดข้อผิดพลาดในการโหลดภาพ กรุณาลองอีกครั้ง');
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
        
        {/* Detection Overlay */}
        <canvas 
          id="detection-overlay" 
          className="absolute top-0 left-0 h-full w-full object-cover pointer-events-none"
        />
        
        {/* Detection Indicator */}
        {isDetecting && detectionConfidence > 0.5 && (
          <div className="absolute top-16 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-20">
            <div className="font-bold text-center">{detectionClass || 'อาวุธปืน'} ตรวจพบ</div>
            <div className="text-sm text-center">ความมั่นใจ: {Math.round(detectionConfidence * 100)}%</div>
          </div>
        )}
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

        {/* Detection status indicator (when in weapon mode) */}
        {selectedMode === 'อาวุปืน' && !isInitializing && (
          <div className="flex justify-center mb-2">
            <div className={`px-3 py-1 rounded-full text-xs ${isDetecting ? 'bg-green-500' : 'bg-gray-500'}`}>
              {isDetecting ? 'กำลังตรวจจับ' : 'ไม่ได้ตรวจจับ'}
            </div>
          </div>
        )}

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