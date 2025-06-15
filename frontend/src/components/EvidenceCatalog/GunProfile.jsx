import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { IoChevronBack, IoClose } from 'react-icons/io5';
import DownloadButton from '../shared/DownloadButton';
import apiConfig from '../../config/api';

const API_PATH = '/api';

const GunProfile = () => {
  const { id } = useParams();
  const [selectedGun, setSelectedGun] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [fullScreen, setFullScreen] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    setError(null);
    setSelectedGun(null);
    setSelectedImage(null);
    fetch(`${apiConfig.baseUrl}${API_PATH}/exhibits/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('ไม่พบข้อมูลปืน');
        return res.json();
      })
      .then(data => {
        const gun = {
          id: data.id,
          image: data.firearm && data.firearm.example_images && data.firearm.example_images.length
            ? data.firearm.example_images.map(img => img.image_url)
            : [],
          mechanism: data.firearm?.mechanism || '',
          brand: data.firearm?.brand || '',
          series: data.firearm?.series || '',
          model: data.firearm?.model || '',
          normalized_name: data.firearm?.normalized_name || '',
          subcategories: data.subcategory || '',
          categories: data.category || '',
          ammunitions: data.firearm?.ammunitions || [],
        };
        
        setSelectedGun(gun);
        
        if (gun.image && gun.image.length > 0) {
          setSelectedImage(gun.image[0]);
        }
      })
      .catch(err => {
        console.error('Error fetching gun data:', err);
        setError(err.message);
      });
  }, [id]);

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!selectedGun) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex-1 h-full overflow-auto bg-white">
      {/* Mobile Design */}
      <div className="md:hidden">
        {/* Header with dark red background */}
        <div className="relative bg-[#800000] rounded-b-full h-96">
          {/* Back Button */}
          <button 
            className="absolute top-4 left-4 z-20 text-white"
            onClick={() => navigate(-1)}
          >
            <IoChevronBack size={28} />
          </button>
          
          {/* Main Gun Image */}
          <div className="flex justify-center items-center h-full">
            <img
              src={selectedImage}
              alt={`${selectedGun.brand} ${selectedGun.model}`}
              className="w-4/5 max-h-64 object-contain"
              onClick={() => setFullScreen(true)}
            />
          </div>
        </div>
        
        {/* Thumbnails */}
        <div className="flex gap-2 mt-4 px-4 overflow-x-auto py-2">
          {selectedGun.image.map((img, index) => (
            <button
              key={index}
              className={`w-16 h-16 rounded flex-shrink-0 ${
                selectedImage === img ? 'border-2 border-black' : 'border border-gray-300'
              }`}
              onClick={() => setSelectedImage(img)}
            >
              <img 
                src={img} 
                alt="Thumbnail" 
                className="w-full h-full object-contain bg-white p-1" 
              />
            </button>
          ))}
        </div>

          {/* Full Screen Modal */}
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
              <img src={selectedImage} alt="Full Screen" className="max-w-full max-h-[80vh] object-contain mb-4 px-4" />

              {/* Thumbnail ใน Full Screen (Swipe ได้) */}
              <div className="flex overflow-x-auto space-x-2 p-4 bg-gray-900 bg-opacity-50 rounded-lg scrollbar-hide">
                {selectedGun.image.map((img, index) => (
                  <img
                    key={index}
                    src={img}
                    alt={`Thumbnail ${index + 1}`}
                    className={`w-16 h-16 object-contain bg-white border-2 rounded-lg cursor-pointer ${img === selectedImage ? 'border-red-500' : 'border-gray-300'}`}
                    onClick={() => setSelectedImage(img)}
                  />
                ))}
              </div>
            </div>
          )}
        
        {/* Gun Details */}
        <div className="px-4 mt-4">
          <div className="flex items-center justify-between">
            <h2 className="text-gray-500 font-medium">
              {selectedGun.brand}
            </h2>
            <DownloadButton />
          </div>
          
          <h1 className="text-2xl uppercase font-bold mt-1 break-words leading-tight">
            {selectedGun.model}
          </h1>
          
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-3 gap-2">
              <span className="text-gray-600 font-medium">ประเภท:</span>
              <span className="text-gray-600 col-span-2">{selectedGun.categories}</span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-3 gap-2">
              <span className="text-gray-600 font-medium">กลไก:</span>
              <span className="text-gray-600 col-span-2">{selectedGun.mechanism || "ไม่มีข้อมูล"}</span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-3 gap-2">
              <span className="text-gray-600 font-medium">ผู้ผลิต:</span>
              <span className="text-gray-600 col-span-2">{selectedGun.manufacturer || "ไม่มีข้อมูล"}</span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-3 gap-2">
              <span className="text-gray-600 font-medium">ซีรี่ย์:</span>
              <span className="text-gray-600 col-span-2">{selectedGun.series || "ไม่มีข้อมูล"}</span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-3 gap-2">
              <span className="text-gray-600 font-medium">ความจุซองกระสุน:</span>
              <span className="text-gray-600 col-span-2">{selectedGun.magazineCapacity || "ไม่มีข้อมูล"}</span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 gap-2">
              <span className="text-gray-600 font-medium">กระสุนที่ใช้ร่วมกัน:</span>
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedGun.ammunitions.map((ammo, index) => (
                  <button
                    key={index}
                    className="px-4 py-2 rounded-full border text-sm bg-white text-black"
                  >
                    {ammo.caliber}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-3 gap-2">
              <span className="text-gray-600 font-medium">จุดสังเกตประจำปืน:</span>
              <span className="text-gray-600 col-span-2">-</span>
            </div>
          </div>

          <div className="mt-6 border-t border-gray-200 pt-4">
            <h3 className="font-medium text-gray-600 mb-2">ตำแหน่งหมายเลขประจำปืน</h3>
            <p className="text-gray-500 text-sm mb-3">{selectedGun.serialposition || "ไม่มีข้อมูล"}</p>
            {selectedGun.serialImage && (
              <img
                src={selectedGun.serialImage}
                alt="ตำแหน่งหมายเลขประจำปืน"
                className="w-48 rounded border"
              />
            )}
          </div>
        </div>
      </div>
      
      {/* Desktop Design */}
      <div className="hidden md:flex flex-col relative md:flex-row h-full">
        {/* Back Button */}
        <button 
          className="absolute top-4 left-4 z-20 text-white md:block"
          onClick={() => navigate(-1)}
        >
          <IoChevronBack size={28} />
        </button>
        
        {/* Half Circle Background - Made it larger and more curved */}
        <div className="absolute left-0 top-0 w-2/5 h-full bg-gradient-to-r from-[#990000] to-[#330000] rounded-r-full z-0 hidden md:block"></div>
        
        {/* Left Section - Gun Images */}
        <div className="relative md:w-1/2 flex flex-col items-center justify-center z-10 p-6">
          <img
            src={selectedImage}
            alt="Gun"
            className="relative w-full max-w-md mx-auto object-contain"
            onClick={() => setFullScreen(true)}
          />
          <div className="flex gap-2 mt-4 justify-center">
            {selectedGun.image.map((img, index) => (
              <button
                key={index}
                className={`w-16 h-16 border-2 rounded ${
                  selectedImage === img ? "border-red-500" : "border-white"
                }`}
                onClick={() => setSelectedImage(img)}
              >
                <img src={img} alt="Thumbnail" className="w-full h-full object-contain bg-white" />
              </button>
            ))}
          </div>
        </div>
        
        {/* Full Screen Modal */}
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
            <img src={selectedImage} alt="Full Screen" className="max-w-full max-h-[80vh] object-contain mb-4" />

            {/* Thumbnail ใน Full Screen */}
            <div className="flex justify-center space-x-2 p-4 bg-gray-900 bg-opacity-50 rounded-lg">
              {selectedGun.image.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`Thumbnail ${index + 1}`}
                  className={`w-16 h-16 object-contain bg-white border-2 rounded-lg cursor-pointer ${img === selectedImage ? 'border-red-500' : 'border-gray-300'}`}
                  onClick={() => setSelectedImage(img)}
                />
              ))}
            </div>
          </div>
        )}
        
        {/* Right Section - Gun Details */}
        <div className="md:w-1/2 h-full flex flex-col z-10 md:pl-10 pr-8">
          <div className="flex-1 overflow-y-auto p-6 pb-24 scrollbar-hide">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-500">{selectedGun.brand}</h2>
              <DownloadButton />
            </div>
            
            <h1 className="text-4xl font-bold mt-1 tracking-wider uppercase">{selectedGun.series} {selectedGun.model}</h1>
            
            <div className="mt-6 border-t border-gray-200 pt-4 space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <span className="text-gray-600 font-medium">ประเภท:</span>
                <span className="text-gray-600 col-span-2">{selectedGun.subcategories}</span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <span className="text-gray-600 font-medium">กลไก:</span>
                <span className="text-gray-600 col-span-2">{selectedGun.mechanism}</span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <span className="text-gray-600 font-medium">ผู้ผลิต:</span>
                <span className="text-gray-600 col-span-2">{selectedGun.brand}</span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <span className="text-gray-600 font-medium">ซีรี่ย์:</span>
                <span className="text-gray-600 col-span-2">{selectedGun.series}</span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <span className="text-gray-600 font-medium">ความจุซองกระสุน:</span>
                <span className="text-gray-600 col-span-2">ไม่มีข้อมูล</span>
              </div>
            </div>

            <div className="mt-6 border-t border-gray-200 pt-4">
              <h3 className="font-medium text-gray-600 mb-3">กระสุนที่ใช้ร่วมกัน</h3>
              <div className="flex gap-2 mt-2 flex-wrap">
                {selectedGun.ammunitions.map((ammo, index) => (
                  <button 
                    key={index} 
                    className="px-4 py-2 border rounded-lg bg-white hover:bg-gray-100 text-gray-700"
                  >
                    {ammo.caliber}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="mt-6 border-t border-gray-200 pt-4">
              <h3 className="font-medium text-gray-600 mb-3">จุดสังเกตประจำปืน:</h3>
              <p className="text-gray-600">-</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GunProfile;