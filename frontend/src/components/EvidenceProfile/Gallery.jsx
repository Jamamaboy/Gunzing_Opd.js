import React, { useState, useEffect } from 'react';
import { IoClose } from 'react-icons/io5';
import { PiImageBroken } from "react-icons/pi";

const Gallery = ({ evidence, firearmInfo, userImage, originalImage }) => {
  const evidenceData = evidence;
  // ✅ ใช้ภาพจาก props หรือ localStorage เป็น fallback
  const displayUserImage = userImage || localStorage.getItem('analysisImage') || null;
  const originalUserImage = originalImage || localStorage.getItem('analysisImage') || displayUserImage;
  
  const [galleryImages, setGalleryImages] = useState([]);
  const [showOriginalImage, setShowOriginalImage] = useState(false); // ✅ เพิ่ม state สำหรับสลับภาพ
  
  useEffect(() => {
    let images = [];
    
    if (evidenceData && evidenceData.example_images && evidenceData.example_images.length > 0) {
      images = [...evidenceData.example_images];
    }
    else if (firearmInfo && firearmInfo.images && firearmInfo.images.length > 0) {
      images = [...firearmInfo.images];
    } 
    else if (firearmInfo && firearmInfo.exhibit && firearmInfo.exhibit.images && firearmInfo.exhibit.images.length > 0) {
      images = [...firearmInfo.exhibit.images];
    }
    else if (firearmInfo && firearmInfo.example_images && firearmInfo.example_images.length > 0) {
      images = [...firearmInfo.example_images];
    }
    else if (firearmInfo && firearmInfo.exhibit && firearmInfo.exhibit.example_images && firearmInfo.exhibit.example_images.length > 0) {
      images = [...firearmInfo.exhibit.example_images];
    }
    
    if (images.length > 0) {
      images.sort((a, b) => {
        if (a.priority !== undefined && b.priority !== undefined) {
          return a.priority - b.priority;
        } else if (a.priority !== undefined) {
          return -1;
        } else if (b.priority !== undefined) {
          return 1;
        } 
        return (a.id || 0) - (b.id || 0);
      });
      
      const formattedImages = images.map(img => ({
        id: img.id || Math.random().toString(36).substr(2, 9),
        url: img.image_url || img.url,
        name: img.description || (evidenceData?.drug_type || evidenceData?.characteristics || 
              (firearmInfo ? `${firearmInfo.brand || ''} ${firearmInfo.model || firearmInfo.series || ''}` : '')),
        description: img.description || (evidenceData?.characteristics || ''),
        priority: img.priority
      }));
      
      console.log("Formatted gallery images:", formattedImages);
      setGalleryImages(formattedImages);
    } else {
      console.log("No images found in firearmInfo or evidenceData");
      setGalleryImages([]);
    }
  }, [firearmInfo, evidenceData]);
  
  const [selectedGalleryImage, setSelectedGalleryImage] = useState(null);
  const [fullScreen, setFullScreen] = useState(false);
  const [galleryFullScreen, setGalleryFullScreen] = useState(false);
  
  // ✅ เพิ่มฟังก์ชันสลับภาพ
  const toggleImageView = () => {
    setShowOriginalImage(!showOriginalImage);
  };

  // ✅ เพิ่ม component สำหรับปุ่มสลับภาพ
  const ImageToggleButton = () => (
    originalUserImage && originalUserImage !== displayUserImage ? (
      <button
        onClick={toggleImageView}
        className="absolute top-2 left-2 px-3 py-1 bg-black/50 text-white rounded-full text-xs hover:bg-black/70 transition-colors z-10"
      >
        {showOriginalImage ? '🔍 ภาพที่ตัด' : '📷 ภาพต้นฉบับ'}
      </button>
    ) : null
  );

  const userImageSrc = showOriginalImage ? originalUserImage : displayUserImage;
  const galleryImageSrc = selectedGalleryImage?.url;
  
  const NoImageDisplay = ({ message = "การแสดงผลภาพถ่ายมีปัญหา", subMessage = "ไม่พบภาพที่บันทึกไว้" }) => (
    <div className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-lg border border-gray-200 h-64 w-full">
      <PiImageBroken className="text-gray-400 text-5xl mb-2" />
      <p className="text-gray-500 text-center">{message}</p>
      <p className="text-gray-400 text-sm text-center mt-1">{subMessage}</p>
    </div>
  );
  
  return (
    <div className="bg-white h-full w-full">
      {/* For mobile view */}
      <div className="flex flex-col md:hidden">
        <div className="px-4">
          <div className="p-3">
            <h3 className="text-base font-medium block pb-2 border-b-2 border-gray-200">ภาพถ่าย</h3>
          </div>
          <div className="relative flex justify-center items-center py-4">
            {displayUserImage ? (
              <>
                <img 
                  src={userImageSrc} 
                  alt="ภาพวัตถุพยานที่ถ่าย" 
                  className="w-full h-auto object-contain max-h-64"
                  onClick={() => setFullScreen(true)}
                />
                <ImageToggleButton />
              </>
            ) : (
              <NoImageDisplay />
            )}
          </div>
        </div>

        {/* ✅ แก้ไข Full Screen Modal for User Image */}
        {fullScreen && displayUserImage && (
          <div className="fixed inset-0 bg-black bg-opacity-90 flex flex-col items-center justify-center z-50">
            {/* ✅ เพิ่มปุ่มสลับภาพใน fullscreen */}
            {originalUserImage && originalUserImage !== displayUserImage && (
              <button 
                className="absolute top-4 left-4 text-white text-base px-3 py-2 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors"
                onClick={toggleImageView}
              >
                {showOriginalImage ? '🔍 ภาพที่ตัด' : '📷 ภาพต้นฉบับ'}
              </button>
            )}
            
            {/* ปุ่มปิด Full Screen */}
            <button 
              className="absolute top-4 right-4 text-white text-3xl p-2 bg-gray-800 rounded-full"
              onClick={() => setFullScreen(false)}
            >
              <IoClose />
            </button>
            
            {/* ✅ แสดงภาพตามที่เลือก */}
            <img 
              src={userImageSrc} 
              alt="Full Screen" 
              className="max-w-full max-h-[80vh] object-contain mb-4 px-4" 
            />
            
            {/* ✅ แสดงสถานะภาพ */}
            <div className="px-3 py-1 bg-black/70 text-white rounded-full text-sm">
              📷 ภาพหลักฐาน
              {originalUserImage && originalUserImage !== displayUserImage && (
                <span className="ml-2 text-gray-300">
                  ({showOriginalImage ? 'ภาพต้นฉบับ' : 'ภาพที่ตัดแล้ว'})
                </span>
              )}
            </div>
          </div>
        )}
        
        <div className="px-4">
          <div className="p-3">
            <h3 className="text-base font-medium block pb-2 border-b-2 border-gray-200">ภาพเปรียบเทียบจากคลัง</h3>
          </div>
          <div className="py-2">
            {galleryImages.length > 0 ? (
              selectedGalleryImage ? (
                <img 
                  src={galleryImageSrc} 
                  alt="ภาพวัตถุพยานจากคลัง" 
                  className="w-full h-auto object-contain max-h-64"
                  onClick={() => setGalleryFullScreen(true)}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextElementSibling.style.display = 'flex';
                  }}
                />
              ) : (
                <NoImageDisplay message="กำลังโหลดภาพ..." subMessage="โปรดรอสักครู่" />
              )
            ) : (
              <NoImageDisplay message="ไม่พบภาพเปรียบเทียบ" subMessage="ไม่มีภาพในฐานข้อมูล" />
            )}
            {selectedGalleryImage && (
              <div className="hidden flex-col items-center justify-center">
                <NoImageDisplay message="การแสดงผลภาพผิดพลาด" subMessage="ไม่สามารถโหลดรูปภาพได้" />
              </div>
            )}
          </div>
          
          <div className="mt-6">
            {galleryImages.length > 0 ? (
              <div className="flex justify-center flex-wrap gap-4 pb-2">
                {galleryImages.map((img) => (
                  <div 
                    key={img.id} 
                    className={`flex-shrink-0 cursor-pointer ${
                      selectedGalleryImage?.id === img.id ? 'border-2 border-blue-800 rounded' : 'border border-gray-200 rounded'
                    }`}
                    onClick={() => setSelectedGalleryImage(img)}
                    style={{ width: '70px', height: '70px' }}
                  >
                    <div className="w-full h-full flex items-center justify-center bg-gray-50">
                      <img 
                        src={img.url} 
                        alt={img.name}
                        className="max-w-full max-h-full object-contain p-1"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.parentNode.innerHTML = '<div class="text-xs text-center text-gray-400">ไม่สามารถโหลดรูปได้</div>';
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>
      
      {/* For desktop view */}
      <div className="hidden md:flex flex-row pl-4 pr-4 relative">
        {/* ส่วนซ้าย: รูปที่ผู้ใช้ถ่าย */}
        <div className="w-1/2">
          <div className="p-3">
            <h3 className="text-base font-medium inline-block pb-2 border-b-2 border-gray-200 w-full">ภาพถ่ายหลักฐาน</h3>
          </div>
          <div className="relative flex justify-center items-center p-4">
            {displayUserImage ? (
              <>
                <img 
                  src={userImageSrc} 
                  alt="ภาพวัตถุพยานที่ถ่าย" 
                  className="w-full h-auto max-h-96 object-contain cursor-pointer"
                  onClick={() => setFullScreen(true)}
                />
                <ImageToggleButton />
              </>
            ) : (
              <NoImageDisplay />
            )}
          </div>
        </div>

        {/* ✅ แก้ไข Full Screen Modal for User Image (เหมือนกับ mobile) */}
        {fullScreen && displayUserImage && (
          <div className="fixed inset-0 bg-black bg-opacity-90 flex flex-col items-center justify-center z-50">
            {originalUserImage && originalUserImage !== displayUserImage && (
              <button 
                className="absolute top-4 left-4 text-white text-base px-3 py-2 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors"
                onClick={toggleImageView}
              >
                {showOriginalImage ? '🔍 ภาพที่ตัด' : '📷 ภาพต้นฉบับ'}
              </button>
            )}
            
            <button 
              className="absolute top-4 right-4 text-white text-3xl p-2 bg-gray-800 rounded-full"
              onClick={() => setFullScreen(false)}
            >
              <IoClose />
            </button>
            
            <img 
              src={userImageSrc} 
              alt="Full Screen" 
              className="max-w-full max-h-[80vh] object-contain mb-4 px-4" 
            />
            
            <div className="px-3 py-1 bg-black/70 text-white rounded-full text-sm">
              📷 ภาพหลักฐาน
              {originalUserImage && originalUserImage !== displayUserImage && (
                <span className="ml-2 text-gray-300">
                  ({showOriginalImage ? 'ภาพต้นฉบับ' : 'ภาพที่ตัดแล้ว'})
                </span>
              )}
            </div>
          </div>
        )}

        {/* Vertical divider */}
        <div className="block absolute h-[95%] mt-11" style={{ left: '50%', width: '1px', backgroundColor: '#e5e7eb' }}></div>
        
        {/* ส่วนขวา: รูปจาก Gallery เพื่อเปรียบเทียบ */}
        <div className="w-1/2">
          <div className="p-3">
            <h3 className="text-base font-medium inline-block pb-2 border-b-2 border-gray-200 w-full">ภาพจากฐานข้อมูล</h3>
          </div>
          <div className="p-4">
            <div className="w-full">
              {galleryImages.length > 0 ? (
                selectedGalleryImage ? (
                  <img 
                    src={galleryImageSrc} 
                    alt="ภาพวัตถุพยานจากคลัง" 
                    className="w-full h-auto max-h-96 object-contain cursor-pointer"
                    onClick={() => setGalleryFullScreen(true)}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextElementSibling.style.display = 'flex';
                    }}
                  />
                ) : (
                  <NoImageDisplay message="กำลังโหลดภาพ..." subMessage="โปรดรอสักครู่" />
                )
              ) : (
                <NoImageDisplay message="ไม่พบภาพเปรียบเทียบ" subMessage="ไม่มีภาพในฐานข้อมูล" />
              )}
              {selectedGalleryImage && (
                <div className="hidden flex-col items-center justify-center">
                  <NoImageDisplay message="การแสดงผลภาพผิดพลาด" subMessage="ไม่สามารถโหลดรูปภาพได้" />
                </div>
              )}
            </div>
            
            <div className="mt-6">
              {galleryImages.length > 0 ? (
                <div className="flex justify-center flex-wrap gap-4 pb-2">
                  {galleryImages.map((img) => (
                    <div 
                      key={img.id} 
                      className={`flex-shrink-0 cursor-pointer ${
                        selectedGalleryImage?.id === img.id ? 'border-2 border-blue-800 rounded' : 'border border-gray-200 rounded'
                      }`}
                      onClick={() => setSelectedGalleryImage(img)}
                      style={{ width: '75px', height: '75px' }}
                    >
                      <div className="w-full h-full flex items-center justify-center bg-gray-50">
                        <img 
                          src={img.url} 
                          alt={img.name}
                          className="max-w-full max-h-full object-contain p-1"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.parentNode.innerHTML = '<div class="text-xs text-center text-gray-400">ไม่สามารถโหลดรูปได้</div>';
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
      
      {/* Full Screen Modal for Gallery Image with Thumbnails */}
      {galleryFullScreen && selectedGalleryImage && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex flex-col items-center justify-center z-50">
          {/* ปุ่มปิด Full Screen */}
          <button 
            className="absolute top-4 right-4 text-white text-3xl p-2 bg-gray-800 rounded-full"
            onClick={() => setGalleryFullScreen(false)}
          >
            <IoClose />
          </button>
          
          {/* ภาพที่ขยายเต็มจอ */}
          <img 
            src={selectedGalleryImage.url} 
            alt={selectedGalleryImage.name} 
            className="max-w-full max-h-[70vh] object-contain mb-6 px-4" 
          />
          
          {/* แสดงคำอธิบายภาพ หากมี */}
          {selectedGalleryImage.description && (
            <p className="text-white text-center mb-4">
              {selectedGalleryImage.description}
            </p>
          )}
          
          {/* Thumbnails */}
          <div className="flex justify-center gap-4 flex-wrap pb-4 px-4">
            {galleryImages.map((img) => (
              <div 
                key={img.id} 
                className={`flex-shrink-0 cursor-pointer ${
                  selectedGalleryImage.id === img.id ? 'border-2 border-white' : 'border border-gray-600'
                }`}
                onClick={() => setSelectedGalleryImage(img)}
                style={{ width: '80px', height: '80px' }}
              >
                <div className="w-full h-full flex items-center justify-center">
                  <img 
                    src={img.url} 
                    alt={img.name}
                    className="max-w-full max-h-full object-contain p-1"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;