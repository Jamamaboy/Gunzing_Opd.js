import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaShareSquare } from 'react-icons/fa';
import { IoChevronBack, IoClose } from 'react-icons/io5';

const gunData = [
  {
    id: 1,
    image: [
      "https://static.wixstatic.com/media/f286bf_9d13fdc2ef8e438991b58a73ead19e55~mv2.png/v1/fill/w_479,h_348,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/f286bf_9d13fdc2ef8e438991b58a73ead19e55~mv2.png"
    ],
    brand: "CZ",
    model: "75 Compact",
    categories: "ปืนพก",
    caliber: ["9×19mm", "9×21mm", ".40"]
  },
  {
    id: 2,
    image: [
      "https://cdn11.bigcommerce.com/s-5hxmzx4c0g/images/stencil/1280x1280/products/3026/5586/182810499__08075.1731447312.png?c=1"
    ],
    brand: "Sig Sauer",
    model: "P238",
    categories: "ปืนพก",
    caliber: [".380"]
  },
  {
    id: 3,
    image: [
      "https://gatguns.com/wp-content/uploads/2024/02/21/04/149535942.png"
    ],
    brand: "Sig Sauer",
    model: "P938",
    categories: "ปืนพก",
    caliber: ["9×19mm"]
  },
  {
    id: 4,
    image: [
      "https://cdn-kjbpd.nitrocdn.com/KOiIhGPzDJkSJKnCKPSJhBthcBpONUgG/assets/images/optimized/rev-7fad56e/1shotguns.com/app/uploads/2023/11/Walther_PPKs-Black_LS_4796006.png"
    ],
    brand: "Walther",
    model: "PPK-S",
    categories: "ปืนพก",
    caliber: [".380", "7.65×17mm (.32)"]
  },
  {
    id: 5,
    image: [
      "https://firepower.ph/cdn/shop/products/Beretta92FSweb.png?v=1633870514"
    ],
    brand: "Beretta",
    model: "92FS",
    categories: "ปืนพก",
    caliber: ["9×19mm"]
  },
  {
    id: 6,
    image: [
      "https://www.cashmyguns.com/wp-content/uploads/Norinco-54.png"
    ],
    brand: "Norinco",
    model: "Type 54",
    categories: "ปืนพก",
    caliber: ["7.62×25mm"]
  },
  {
    id: 7,
    image: [
      "https://images.guns.com/prod/2022/01/18/61e675570be70d2f7305b38f5cd669a125a1195431489.png"
    ],
    brand: "Browning",
    model: "Hi-Power",
    categories: "ปืนพก",
    caliber: ["9×19mm", ".40"]
  },
  {
    id: 8,
    image: [
      "https://espineli-defense.sgp1.cdn.digitaloceanspaces.com/a3b94dfb30491bfc0a28e029eeaac22a.png"
    ],
    brand: "Norinco",
    model: "1911-A1",
    categories: "ปืนพก",
    caliber: [".45"]
  },
  {
    id: 9,
    image: [
      "https://cdn-ilceald.nitrocdn.com/pNjqylSKBCOWgLPOVVDUMNambdhEGnWP/assets/images/optimized/rev-47b33d8/bandookwala.com.pk/wp-content/uploads/2024/11/image-15-1-min.png"
    ],
    brand: "Sig Sauer",
    model: "P229",
    categories: "ปืนพก",
    caliber: ["9×19mm", ".357", ".40"]
  },
  {
    id: 10,
    image: [
      "https://assets.basspro.com/image/list/fn_select:jq:first(.%5B%5D%7Cselect(.public_id%20%7C%20endswith(%22main%22)))/4829823.json"
    ],
    brand: "Sig Sauer",
    model: "P320",
    categories: "ปืนพก",
    caliber: ["9×19mm", ".357", ".40", ".45"]
  },
  {
    id: 11,
    image: [
      "https://loterkft.hu/wp-content/uploads/2016/04/sw_5906-1-600x600.png"
    ],
    brand: "Smith & Wesson",
    model: "5906",
    categories: "ปืนพก",
    caliber: ["9×19mm"]
  },
  {
    id: 12,
    image: [
      "https://gununiversity.com/wp-content/uploads/2021/01/Hellcat.png"
    ],
    brand: "Springfield Armory",
    model: "Hellcat",
    categories: "ปืนพก",
    caliber: ["9×19mm"]
  },
    // Adding more mock items to demonstrate pagination
    ...Array.from({ length: 30 }, (_, i) => ({
        id: 13 + i,
        image: [
          "https://gununiversity.com/wp-content/uploads/2021/01/Hellcat.png"
        ],
        brand: `รายการที่ ${13 + i}`,
        model: "",
        categories: "ปืนพก",
        caliber: ["9×19mm"]
    }))
];

const GunProfile = () => {
  const { id } = useParams();
  const [selectedGun, setSelectedGun] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [fullScreen, setFullScreen] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const gun = gunData.find(g => g.id === parseInt(id));
      if (gun) {
        setSelectedGun(gun);
        setSelectedImage(gun.image[0]);
      } else {
        setError("Gun not found");
      }
    } catch (err) {
      setError("An error occurred while loading the gun profile.");
    }
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
            <FaShareSquare className="text-gray-500" size={20} />
          </div>
          
          <h1 className="text-2xl uppercase font-bold mt-1">
            Model {selectedGun.model}
          </h1>
          
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-gray-600">ประเภท: {selectedGun.categories}</p>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-gray-600">จุดสังเกตประจำปืน:</p>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-gray-600 mb-2">กระสุนที่ใช้ร่วมกัน</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {selectedGun.caliber.map((cal, index) => (
                <button 
                  key={index} 
                  className={`px-4 py-2 rounded-full border text-sm 
                    ${cal === "39" ? "bg-black text-white" : "bg-white text-black"}`}
                >
                  {cal}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Desktop Design */}
      <div className="hidden md:flex flex-col relative md:flex-row items-center h-full">
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
        <div className="relative md:w-1/2 flex flex-col items-center z-10 p-6">
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
        <div className="md:w-1/2 p-6 text-gray-900 z-10 md:pl-10 pr-32 pb-24">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-500">{selectedGun.brand}</h2>
            <FaShareSquare className="text-gray-500 cursor-pointer" size={24} />
          </div>
          
          <h1 className="text-4xl font-bold mt-1 tracking-wider uppercase">{selectedGun.model}</h1>
          
          <div className="mt-6 border-t border-gray-200 pt-4">
            <p className="text-gray-600">ประเภท: {selectedGun.categories}</p>
          </div>
          
          <div className="mt-6 border-t border-gray-200 pt-4">
            <h3 className="font-medium text-gray-600 mb-3">จุดสังเกตประจำปืน:</h3>
          </div>
          
          <div className="mt-6 border-t border-gray-200 pt-4">
            <h3 className="font-medium text-gray-600 mb-3">กระสุนที่ใช้ร่วมกัน</h3>
            <div className="flex gap-2 mt-2 flex-wrap">
              {selectedGun.caliber.map((cal, index) => (
                <button key={index} className="px-4 py-2 border rounded-lg bg-white hover:bg-gray-100 text-gray-700">
                  {cal}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GunProfile;