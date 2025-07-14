import React, { useRef } from 'react';
import { useImage } from '../../context/ImageContext';

const ImageUploader = () => {
  const fileInputRef = useRef(null);
  const {
    uploadImage,
    setImageForPreview,
    imagePreview,
    isUploading,
    uploadError,
    uploadedImage,
    resetImageData
  } = useImage();

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageForPreview(file);
      uploadImage(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">อัปโหลดรูปภาพ</h2>
      
      {/* ส่วนอัปโหลด */}
      <div className="mb-4">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept="image/*"
          className="hidden"
        />
        
        <button
          onClick={triggerFileInput}
          disabled={isUploading}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:bg-gray-400"
        >
          {isUploading ? 'กำลังอัปโหลด...' : 'เลือกรูปภาพ'}
        </button>
        
        <button
          onClick={resetImageData}
          className="ml-2 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
        >
          ล้างข้อมูล
        </button>
      </div>
      
      {/* แสดงข้อผิดพลาด */}
      {uploadError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{uploadError}</p>
        </div>
      )}
      
      {/* แสดงตัวอย่างรูปภาพ */}
      {imagePreview && (
        <div className="mb-4">
          <h3 className="text-lg font-medium mb-2">ตัวอย่างรูปภาพ</h3>
          <div className="border rounded-lg p-2 max-w-sm">
            <img
              src={imagePreview}
              alt="Preview"
              className="max-w-full h-auto"
            />
          </div>
        </div>
      )}
      
      {/* แสดงข้อมูลที่ได้หลังอัปโหลด */}
      {uploadedImage && (
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium mb-2">อัปโหลดสำเร็จ</h3>
          <p className="mb-1"><strong>ID: </strong>{uploadedImage.id}</p>
          <p className="mb-1"><strong>ชื่อไฟล์: </strong>{uploadedImage.filename}</p>
          <p className="mb-1"><strong>URL: </strong>{uploadedImage.url}</p>
        </div>
      )}
    </div>
  );
};

const ImageAnalysis = () => {
  const {
    uploadedImage,
    selectedMode,
    setSelectedMode,
    requestImageAnalysis,
    detectionResults,
    classificationResults
  } = useImage();

  const handleAnalysis = async () => {
    if (uploadedImage) {
      await requestImageAnalysis(uploadedImage.id, selectedMode);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md mt-4">
      <h2 className="text-xl font-semibold mb-4">วิเคราะห์รูปภาพ</h2>
      
      {/* โหมดการวิเคราะห์ */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">เลือกโหมดการวิเคราะห์</label>
        <div className="flex items-center space-x-4">
          <label className="inline-flex items-center">
            <input
              type="radio"
              className="form-radio"
              name="mode"
              value="auto"
              checked={selectedMode === 'auto'}
              onChange={() => setSelectedMode('auto')}
            />
            <span className="ml-2">อัตโนมัติ</span>
          </label>
          <label className="inline-flex items-center">
            <input
              type="radio"
              className="form-radio"
              name="mode"
              value="manual"
              checked={selectedMode === 'manual'}
              onChange={() => setSelectedMode('manual')}
            />
            <span className="ml-2">ด้วยตนเอง</span>
          </label>
        </div>
      </div>
      
      {/* ปุ่มวิเคราะห์ */}
      <button
        onClick={handleAnalysis}
        disabled={!uploadedImage}
        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded disabled:bg-gray-400"
      >
        วิเคราะห์รูปภาพ
      </button>
      
      {/* แสดงผลการวิเคราะห์ */}
      {(detectionResults || classificationResults) && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <h3 className="text-lg font-medium mb-2">ผลการวิเคราะห์</h3>
          
          {detectionResults && (
            <div className="mb-3">
              <h4 className="font-medium">การตรวจจับวัตถุ</h4>
              <pre className="bg-gray-100 p-2 rounded text-sm mt-1 overflow-x-auto">
                {JSON.stringify(detectionResults, null, 2)}
              </pre>
            </div>
          )}
          
          {classificationResults && (
            <div>
              <h4 className="font-medium">การจำแนกประเภท</h4>
              <pre className="bg-gray-100 p-2 rounded text-sm mt-1 overflow-x-auto">
                {JSON.stringify(classificationResults, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const ImageContextExample = () => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">ตัวอย่างการใช้งาน ImageContext</h1>
      <p className="mb-4">
        คอมโพเนนต์นี้แสดงตัวอย่างการใช้งาน ImageContext ในการจัดการข้อมูลการอัปโหลดและวิเคราะห์รูปภาพ
      </p>
      
      <div className="grid gap-4 lg:grid-cols-2">
        <ImageUploader />
        <ImageAnalysis />
      </div>
    </div>
  );
};

export default ImageContextExample;