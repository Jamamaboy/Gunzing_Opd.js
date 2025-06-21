import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../config/api';

const API_PATH = '/api';

const UNKNOWN_EXHIBIT_IDS = {
  UNKNOWN_GUN: 93,
  UNKNOWN_DRUG: 94,
  UNKNOWN_OBJECT: null
};

const RecordBottomBar = ({
  evidenceData,
  analysisResult,
  province,
  district,
  subdistrict,
  houseNumber,
  village,
  soi,
  road,
  placeName,
  coordinates,
  date,
  time,
  quantity
}) => {
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [imageData, setImageData] = useState(null);

  // Load image data from localStorage
  useEffect(() => {
    const savedImage = localStorage.getItem('analysisImage');
    if (savedImage) {
      setImageData(savedImage);
    }
  }, []);

  const handleBack = () => {
    navigate(-1);
    
    setTimeout(() => {
      window.history.replaceState({ 
        fromRecord: true,
        type: evidenceData?.type || 'Gun',
        result: evidenceData?.result || evidenceData
      }, '');
    }, 100);
  };

  const dataURLtoFile = (dataUrl, filename) => {
    try {
      const arr = dataUrl.split(',');
      const mime = arr[0].match(/:(.*?);/)[1];
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      
      return new File([u8arr], filename, { type: mime });
    } catch (error) {
      console.error('Error converting dataURL to File:', error);
      return null;
    }
  };

  const handleSave = async () => {
    console.log("=== RecordBottomBar Save Started ===");
    
    setIsSaving(true);
    setSaveError(null);
    
    console.log("=== DEBUG RecordBottomBar Save ===");
    console.log("Evidence Type:", evidenceData?.type);
    console.log("Evidence Category:", evidenceData?.result?.exhibit?.category);
    console.log("Evidence Data:", evidenceData);
    console.log("Analysis Result:", analysisResult);
    
    // ตรวจสอบการดึง exhibit_id
    let exhibit_id = null;
    if (evidenceData?.result?.exhibit_id) {
      exhibit_id = evidenceData.result.exhibit_id;
      console.log("Got exhibit_id from evidenceData.result:", exhibit_id);
    } else if (analysisResult?.exhibit_id) {
      exhibit_id = analysisResult.exhibit_id;
      console.log("Got exhibit_id from analysisResult:", exhibit_id);
    } else {
      console.log("No exhibit_id found in either evidenceData or analysisResult");
    }
    
    const evidenceType = evidenceData?.type || 'Unknown';
    const evidenceCategory = evidenceData?.result?.exhibit?.category || 'ไม่ทราบประเภท';

    console.log("Evidence Type:", evidenceType);
    console.log("Evidence Category:", evidenceCategory);
    console.log("Final exhibit_id to be used:", exhibit_id);

    if (evidenceType === 'Drug' && exhibit_id) {
      console.log("Drug evidence with exhibit_id:", exhibit_id);
      if (exhibit_id === UNKNOWN_EXHIBIT_IDS.UNKNOWN_GUN) {
        console.error("❌ ERROR: Drug evidence has Gun exhibit_id!");
      }
    } else if (evidenceType === 'Gun' && exhibit_id) {
      console.log("Gun evidence with exhibit_id:", exhibit_id);
      if (exhibit_id === UNKNOWN_EXHIBIT_IDS.UNKNOWN_DRUG) {
        console.error("❌ ERROR: Gun evidence has Drug exhibit_id!");
      }
    }

    console.log("============================");
    
    if (!subdistrict?.id) {
      setSaveError('กรุณาเลือกตำบล/แขวง');
      setIsSaving(false);
      return;
    }
    
    if (!coordinates?.lat || !coordinates?.lng) {
      setSaveError('ไม่พบข้อมูลพิกัด กรุณาเลือกตำแหน่งบนแผนที่');
      setIsSaving(false);
      return;
    }
    
    try {
      let formData = new FormData();
      
      // เพิ่มข้อมูลตาม schema ใหม่เข้า formData
      if (exhibit_id) {
        formData.append('exhibit_id', exhibit_id);
        console.log("Added exhibit_id to formData:", exhibit_id);
      } else {
        console.log("No exhibit_id to add to formData");
      }
      
      // ใช้ user_id ดัมมี่เพื่อไม่ต้องยืนยันตัวตน
      const dummyUserId = 1; // ใช้ user_id ของ admin หรือ system user
      formData.append('user_id', dummyUserId);
      console.log("Added dummy user_id to formData:", dummyUserId);
      
      // ถ้ามีรูปภาพ ให้แปลง dataURL เป็น File และเพิ่มเข้า formData
      if (imageData && imageData.startsWith('data:')) {
        try {
          const imageFile = dataURLtoFile(imageData, 'evidence.jpg');
          if (imageFile) {
            formData.append('image', imageFile);
            console.log("รูปภาพถูกเพิ่มใน FormData");
          }
        } catch (imgError) {
          console.error("Error processing image:", imgError);
        }
      }
      
      if (subdistrict?.id) formData.append('subdistrict_id', subdistrict.id);
      if (date) formData.append('discovery_date', date);
      if (time) formData.append('discovery_time', time);
      if (quantity !== undefined && quantity !== '') formData.append('quantity', quantity);
      
      // Coordinates are required in new schema (backend จะแปลงเป็น GEOMETRY)
      formData.append('latitude', coordinates.lat);
      formData.append('longitude', coordinates.lng);

      // เพิ่มข้อมูลที่อยู่เพิ่มเติม
      if (placeName) formData.append('place_name', placeName);
      if (houseNumber) formData.append('house_number', houseNumber);
      if (village) formData.append('village', village);
      if (soi) formData.append('soi', soi);
      if (road) formData.append('road', road);

      // เพิ่มค่า confidence จาก analysisResult เพื่อบันทึกลงใน ai_confidence
      if (analysisResult && analysisResult.confidence !== undefined) {
        formData.append('ai_confidence', analysisResult.confidence);
        console.log("AI Confidence:", analysisResult.confidence);
      }
      
      // แสดง console log สำหรับตรวจสอบข้อมูลก่อนส่ง
      console.log('กำลังบันทึกประวัติ:');
      formData.forEach((value, key) => {
        console.log(`${key}: ${value}`);
      });
      
      // ✅ ส่ง request โดยไม่ต้องยืนยันตัวตน - ลบ headers ทั้งหมด
      const requestConfig = {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
        // ✅ ลบ Authorization header ออกทั้งหมด
      };

      console.log("Request config:", requestConfig);
      console.log("Making API call to:", `${API_PATH}/history`);
      
      // API call without authentication
      const response = await api.post(`${API_PATH}/history`, formData, requestConfig);
      
      console.log('บันทึกประวัติสำเร็จ:', response.data);

      navigate('/history', {
        state: {
          popup: {
            open: true,
            type: 'success',
            message: 'บันทึกประวัติสำเร็จ'
          }
        }
      });
      
    } catch (error) {
      console.error('เกิดข้อผิดพลาดในการบันทึกประวัติ:', error);
      console.error('Error status:', error.response?.status);
      console.error('Error data:', error.response?.data);
      console.error('Error headers:', error.response?.headers);
      
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.error || 
                          error.response?.data?.message ||
                          'ไม่สามารถบันทึกประวัติได้ โปรดลองอีกครั้ง';
      
      setSaveError(errorMessage);
      
    } finally {
      setIsSaving(false);
    }
  };

  // ✅ ลบการตรวจสอบ authentication ออกทั้งหมด - แสดงปุ่มบันทึกเสมอ
  return (
    <div className="w-full py-4 px-4 flex justify-between border-t sm:justify-end sm:space-x-4">
      {saveError && (
        <div className="text-red-500 mr-4 self-center text-sm">
          {saveError}
        </div>
      )}
      <button 
        className="px-4 py-1.5 border border-t-2 border-r-2 border-l-2 border-b-4 border-[#6B0000] rounded-lg text-[#900B09]"
        onClick={handleBack}
        disabled={isSaving}
      >
        ย้อนกลับ
      </button>
      <button 
        className={`px-7 py-1.5 border-[#6B0000] border-b-4 ${isSaving ? 'bg-gray-500' : 'bg-[#990000]'} rounded-lg text-white`}
        onClick={handleSave}
        disabled={isSaving}
      >
        {isSaving ? 'กำลังบันทึก...' : 'บันทึก'}
      </button>
    </div>
  );
};

export default RecordBottomBar;