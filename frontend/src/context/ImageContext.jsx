import { createContext, useContext, useState } from 'react';
import axios from 'axios';
import apiConfig from '../config/api';

const API_PATH = '/api';

export const ImageContext = createContext();

export const ImageProvider = ({ children }) => {
  // Image upload states
  const [uploadedImage, setUploadedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  
  // Recognition modes
  const [selectedMode, setSelectedMode] = useState('auto'); // auto, manual
  
  // Recognition results
  const [detectionResults, setDetectionResults] = useState(null);
  const [classificationResults, setClassificationResults] = useState(null);

  // รีเซ็ตข้อมูลรูปภาพทั้งหมด
  const resetImageData = () => {
    setUploadedImage(null);
    setImagePreview(null);
    setDetectionResults(null);
    setClassificationResults(null);
    setUploadError(null);
  };

  // อัปโหลดรูปภาพ
  const uploadImage = async (file) => {
    setIsUploading(true);
    setUploadError(null);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const token = localStorage.getItem('token');
      
      const response = await axios.post(
        `${apiConfig.baseUrl}${API_PATH}/upload`, 
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      setUploadedImage(response.data);
      return response.data;
    } catch (error) {
      console.error('Image upload error:', error);
      setUploadError(error.response?.data?.detail || 'เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ');
      return null;
    } finally {
      setIsUploading(false);
    }
  };
  
  // ตั้งค่ารูปภาพสำหรับแสดงตัวอย่าง (preview)
  const setImageForPreview = (file) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };
  
  // ขอผลการวิเคราะห์จาก API
  const requestImageAnalysis = async (imageId, mode = 'auto') => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.post(
        `${apiConfig.baseUrl}${API_PATH}/analyze`, 
        { image_id: imageId, mode },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      setDetectionResults(response.data.detection);
      setClassificationResults(response.data.classification);
      
      return response.data;
    } catch (error) {
      console.error('Image analysis error:', error);
      setUploadError(error.response?.data?.detail || 'เกิดข้อผิดพลาดในการวิเคราะห์รูปภาพ');
      return null;
    }
  };

  const imageContextValue = {
    // States
    uploadedImage,
    setUploadedImage,
    imagePreview,
    setImagePreview,
    isUploading,
    uploadError,
    selectedMode,
    setSelectedMode,
    detectionResults,
    setDetectionResults,
    classificationResults,
    setClassificationResults,
    
    // Functions
    resetImageData,
    uploadImage,
    setImageForPreview,
    requestImageAnalysis
  };

  return (
    <ImageContext.Provider value={imageContextValue}>
      {children}
    </ImageContext.Provider>
  );
};

export const useImage = () => useContext(ImageContext);

export default ImageProvider;