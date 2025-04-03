import React, { useState } from 'react';
import { IoClose } from 'react-icons/io5';

const Gallery = ({ evidence }) => {
  const userImage = evidence?.result?.userImage || 'https://lynxdefense.com/wp-content/uploads/2023/07/glock-43.jpg';
  
  const galleryImages = [
    { id: 1, url: 'https://pngimg.com/d/glock_PNG1.png', name: 'ปืน Glock 19' },
    { id: 2, url: 'https://s3.us-west-2.amazonaws.com/talo-dist-v2/_large/G49-MOS_Technical_45-Degree_20230720_01.jpg', name: 'ปืน Glock 17' },
    { id: 3, url: 'https://us.glock.com/-/media/Global/US/old/ThreeSixtyImages/G17_Gen3/img_0_0_2.ashx', name: 'ปืน Glock 43' },
    { id: 4, url: 'https://assets.basspro.com/image/upload/c_limit,dpr_2.0,f_auto,h_250,q_auto,w_400/c_limit,h_250,w_400/v1/ProductImages/450/master1_10217977_main?pgw=1', name: 'ปืน Glock 26' },
  ];
  
  const [selectedGalleryImage, setSelectedGalleryImage] = useState(galleryImages[0]);
  
  const userImageSrc = userImage;
  const galleryImageSrc = selectedGalleryImage?.url;
  const [fullScreen, setFullScreen] = useState(false);
  const [galleryFullScreen, setGalleryFullScreen] = useState(false);
  
  return (
    <div className="bg-white h-full w-full">
      {/* For mobile view */}
      <div className="flex flex-col md:hidden">
        <div className="px-4">
          <div className="p-3">
            <h3 className="text-base font-medium block pb-2 border-b-2 border-gray-200">ภาพถ่าย</h3>
          </div>
          <div className="flex justify-center items-center py-4">
            <img 
              src={userImageSrc} 
              alt="ภาพวัตถุพยานที่ถ่าย" 
              className="w-full h-auto object-contain max-h-64"
              onClick={() => setFullScreen(true)}
            />
          </div>
        </div>

        {/* Full Screen Modal for User Image */}
        {fullScreen && (
          <div className="fixed inset-0 bg-black bg-opacity-90 flex flex-col items-center justify-center z-50">
            {/* ปุ่มปิด Full Screen */}
            <button 
              className="absolute top-4 right-4 text-white text-3xl p-2 bg-gray-800 rounded-full"
              onClick={() => setFullScreen(false)}
            >
              <IoClose />
            </button>
            
            {/* ภาพที่ขยายเต็มจอ */}
            <img src={userImage} alt="Full Screen" className="max-w-full max-h-[80vh] object-contain mb-4 px-4" />
          </div>
        )}
        
        <div className="px-4 mt-4">
          <div className="p-3">
            <h3 className="text-base font-medium block pb-2 border-b-2 border-gray-200">ภาพเปรียบเทียบจากคลัง</h3>
          </div>
          <div className="py-4">
            <img 
              src={galleryImageSrc} 
              alt="ภาพวัตถุพยานจากคลัง" 
              className="w-full h-auto object-contain max-h-64"
              onClick={() => setGalleryFullScreen(true)}
            />
            
            <div className="mt-6">
              <div className="flex justify-between pb-2">
                {galleryImages.map((img) => (
                  <div 
                    key={img.id} 
                    className={`flex-shrink-0 cursor-pointer ${
                      selectedGalleryImage.id === img.id ? 'border-2 border-blue-800 rounded' : 'border border-gray-200 rounded'
                    }`}
                    onClick={() => setSelectedGalleryImage(img)}
                    style={{ width: '70px', height: '70px' }}
                  >
                    <div className="w-full h-full flex items-center justify-center bg-gray-50">
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
          </div>
        </div>
      </div>
      
      {/* For desktop view */}
      <div className="hidden md:flex flex-row pl-4 pr-4 relative">
        {/* ส่วนซ้าย: รูปที่ผู้ใช้ถ่าย */}
        <div className="w-1/2">
          <div className="p-3">
            <h3 className="text-base font-medium inline-block pb-2 border-b-2 border-gray-200 w-full">ภาพถ่าย</h3>
          </div>
          <div className="flex justify-center items-center p-4">
            <img 
              src={userImageSrc} 
              alt="ภาพวัตถุพยานที่ถ่าย" 
              className="w-full h-auto max-h-96 object-contain cursor-pointer"
              onClick={() => setFullScreen(true)}
            />
          </div>
        </div>

        {/* Full Screen Modal for User Image */}
        {fullScreen && (
          <div className="fixed inset-0 bg-black bg-opacity-90 flex flex-col items-center justify-center z-50">
            {/* ปุ่มปิด Full Screen */}
            <button 
              className="absolute top-4 right-4 text-white text-3xl p-2 bg-gray-800 rounded-full"
              onClick={() => setFullScreen(false)}
            >
              <IoClose />
            </button>
            
            {/* ภาพที่ขยายเต็มจอ */}
            <img src={userImage} alt="Full Screen" className="max-w-full max-h-[80vh] object-contain mb-4 px-4" />
          </div>
        )}

        {/* Vertical divider */}
        <div className="block absolute h-[95%] mt-11" style={{ left: '50%', width: '1px', backgroundColor: '#e5e7eb' }}></div>
        
        {/* ส่วนขวา: รูปจาก Gallery เพื่อเปรียบเทียบ */}
        <div className="w-1/2">
          <div className="p-3">
            <h3 className="text-base font-medium inline-block pb-2 border-b-2 border-gray-200 w-full">ภาพจากคลัง</h3>
          </div>
          <div className="p-4">
            <div className="w-full">
              <img 
                src={galleryImageSrc} 
                alt="ภาพวัตถุพยานจากคลัง" 
                className="w-full h-auto max-h-96 object-contain cursor-pointer"
                onClick={() => setGalleryFullScreen(true)}
              />
            </div>
            
            <div className="mt-6">
              <div className="flex justify-center gap-12 pb-2">
                {galleryImages.map((img) => (
                  <div 
                    key={img.id} 
                    className={`flex-shrink-0 cursor-pointer ${
                      selectedGalleryImage.id === img.id ? 'border-2 border-blue-800 rounded' : 'border border-gray-200 rounded'
                    }`}
                    onClick={() => setSelectedGalleryImage(img)}
                    style={{ width: '75px', height: '75px' }}
                  >
                    <div className="w-full h-full flex items-center justify-center bg-gray-50">
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
          </div>
        </div>
      </div>
      
      {/* Full Screen Modal for Gallery Image with Thumbnails */}
      {galleryFullScreen && (
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
          
          {/* Thumbnails */}
          <div className="flex justify-center gap-4 pb-4">
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