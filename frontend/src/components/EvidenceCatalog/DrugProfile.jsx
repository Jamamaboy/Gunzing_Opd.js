import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { IoChevronBack, IoClose } from 'react-icons/io5';
import DownloadButton from '../shared/DownloadButton';
import { api } from '../../config/api';

const DrugProfile = () => {
  const { id } = useParams();
  const [selectedDrug, setSelectedDrug] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [fullScreen, setFullScreen] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDrugData = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/api/narcotics/${id}`);

        if (!response) {
          throw new Error(response.status === 404 ? "ไม่พบข้อมูล" : "เกิดข้อผิดพลาดในการโหลดข้อมูล");
        }

        console.log("Drug data received:", response.data);
        
        const drugData = response.data;
        
        const formattedDrug = {
          id: drugData.id,
          exhibit_id: drugData.exhibit_id,
          title: drugData.drug_type || 'ไม่ระบุประเภท',
          description: drugData.drug_category || 'ไม่ระบุหมวดหมู่',
          image: drugData.example_images?.map(img => img.image_url) || [],

          // ข้อมูลยาเสพติด
          form: drugData.drug_form?.name || 'ไม่ระบุรูปแบบ',
          characteristics: drugData.characteristics || 'ไม่ระบุลักษณะ',
          consumption_method: drugData.consumption_method || 'ไม่ระบุวิธีการใช้',
          effect: drugData.effect || 'ไม่ระบุผลต่อร่างกาย',
          weight_grams: drugData.weight_grams || 'ไม่ระบุน้ำหนัก',
          
          // ข้อมูลเม็ดยา
          color: drugData.pill_info?.color || 'ไม่ระบุสี',
          diameter_mm: drugData.pill_info?.diameter_mm || 'ไม่ระบุเส้นผ่านศูนย์กลาง',
          thickness_mm: drugData.pill_info?.thickness_mm || 'ไม่ระบุความหนา',
          edge_shape: drugData.pill_info?.edge_shape || 'ไม่ระบุรูปทรงขอบ'
        };

        setSelectedDrug(formattedDrug);
        if (formattedDrug.image.length > 0) {
          setSelectedImage(formattedDrug.image[0]);
        }
        
      } catch (err) {
        console.error("เกิดข้อผิดพลาด:", err);
        if (err.response?.status === 404) {
          setError("ไม่พบข้อมูลยาเสพติดที่ต้องการ");
        } else if (err.response?.status === 403) {
          setError("คุณไม่มีสิทธิ์ในการเข้าถึงข้อมูลนี้");
        } else {
          setError("เกิดข้อผิดพลาดในการโหลดข้อมูล กรุณาลองใหม่อีกครั้ง");
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchDrugData();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex-1 h-full flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#800000] mx-auto mb-4"></div>
          <p className="text-gray-600">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 h-full flex items-center justify-center bg-white">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">เกิดข้อผิดพลาด</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => navigate(-1)}
            className="bg-[#800000] text-white px-4 py-2 rounded hover:bg-[#600000] transition-colors"
          >
            กลับ
          </button>
        </div>
      </div>
    );
  }

  if (!selectedDrug) {
    return (
      <div className="flex-1 h-full flex items-center justify-center bg-white">
        <div className="text-center">
          <p className="text-gray-600">ไม่พบข้อมูลยาเสพติด</p>
          <button 
            onClick={() => navigate(-1)}
            className="mt-4 bg-[#800000] text-white px-4 py-2 rounded hover:bg-[#600000] transition-colors"
          >
            กลับ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='flex-1 h-full overflow-auto bg-white'>
      {/* Mobile Design - ไม่เปลี่ยน */}
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

          {/* Main Drug Image */}
          <div className="flex justify-center items-center h-full">
            {selectedImage ? (
              <img
                src={selectedImage}
                alt={selectedDrug.characteristics}
                className="w-4/5 max-h-64 object-contain"
                onClick={() => setFullScreen(true)}
                onError={(e) => {
                  e.target.src = '/placeholder-drug.png';
                }}
              />
            ) : (
              <div className="relative w-48 h-48 mx-auto bg-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-gray-500">ไม่มีรูปภาพ</span>
              </div>
            )}
          </div>

          {/* Full Screen Modal */}
          {fullScreen && selectedImage && (
            <div className="fixed inset-0 bg-black bg-opacity-90 flex flex-col items-center justify-center z-50">
              {/* ปุ่มปิด Full Screen */}
              <button 
                className="absolute top-4 right-4 text-white text-3xl p-2 bg-gray-800 rounded-full"
                onClick={() => setFullScreen(false)}
              >
                <IoClose />
              </button>
              
              {/* ภาพที่ขยายเต็มจอ */}
              <img 
                src={selectedImage} 
                alt="Full Screen" 
                className="max-w-full max-h-[80vh] object-contain mb-4 px-4"
                onError={(e) => {
                  e.target.src = '/placeholder-drug.png';
                }}
              />

              {/* Thumbnail ใน Full Screen */}
              {selectedDrug.image && selectedDrug.image.length > 1 && (
                <div className="flex overflow-x-auto space-x-2 p-4 bg-gray-900 bg-opacity-50 rounded-lg scrollbar-hide">
                  {selectedDrug.image.map((img, index) => (
                    <img
                      key={index}
                      src={img}
                      alt={`Thumbnail ${index + 1}`}
                      className={`w-16 h-16 object-contain bg-white border-2 rounded-lg cursor-pointer ${img === selectedImage ? 'border-red-500' : 'border-gray-300'}`}
                      onClick={() => setSelectedImage(img)}
                      onError={(e) => {
                        e.target.src = '/placeholder-drug.png';
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Drug Details */}
          <div className="px-4 mt-4">
            <div className="flex items-center justify-between">
              <h2 className="text-gray-500 font-medium">
                {selectedDrug.description}
              </h2>
              <DownloadButton />
            </div>
            
            <h1 className="text-2xl uppercase font-bold mt-1 break-words leading-tight max-w-[60%] hyphens-auto">
              {selectedDrug.characteristics}
            </h1>
            
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-3 gap-2">
                <span className="text-gray-600 font-medium">รูปแบบ:</span>
                <span className="text-gray-600 col-span-2">{selectedDrug.form}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-3 gap-2">
                <span className="text-gray-600 font-medium">ลักษณะ:</span>
                <span className="text-gray-600 col-span-2">{selectedDrug.characteristics}</span>
              </div>
            </div>

            {/* แสดงข้อมูลเม็ดยาถ้ามี */}
            {selectedDrug.color !== 'ไม่ระบุสี' && (
              <>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-gray-600 font-medium">สี:</span>
                    <span className="text-gray-600 col-span-2">{selectedDrug.color}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-gray-600 font-medium">เส้นผ่านศูนย์กลาง:</span>
                    <span className="text-gray-600 col-span-2">{selectedDrug.diameter_mm} มม.</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-gray-600 font-medium">ความหนา:</span>
                    <span className="text-gray-600 col-span-2">{selectedDrug.thickness_mm} มม.</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-gray-600 font-medium">รูปทรงขอบ:</span>
                    <span className="text-gray-600 col-span-2">{selectedDrug.edge_shape}</span>
                  </div>
                </div>
              </>
            )}

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-3 gap-2">
                <span className="text-gray-600 font-medium">น้ำหนัก:</span>
                <span className="text-gray-600 col-span-2">{selectedDrug.weight_grams} กรัม</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-3 gap-2">
                <span className="text-gray-600 font-medium">วิธีการใช้:</span>
                <span className="text-gray-600 col-span-2">{selectedDrug.consumption_method}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-3 gap-2">
                <span className="text-gray-600 font-medium">ผลต่อร่างกาย:</span>
                <span className="text-gray-600 col-span-2">{selectedDrug.effect}</span>
              </div>
            </div>
          </div>

          <div className="h-20"></div>
        </div>

        {/* Thumbnails - อยู่นอก rounded-b-full container */}
        {selectedDrug.image && selectedDrug.image.length > 1 && (
          <div className="flex gap-2 mt-4 px-4 overflow-x-auto py-2">
            {selectedDrug.image.map((img, index) => (
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
                  onError={(e) => {
                    e.target.src = '/placeholder-drug.png';
                  }}
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Desktop Design */}
      <div className="hidden md:flex flex-col relative md:flex-row items-center p-6 bg-white h-full">
        {/* Back Button */}
        <button 
          className="absolute top-4 left-4 z-20 text-gray-800 hover:text-[#800000] transition-colors"
          onClick={() => navigate(-1)}
        >
          <IoChevronBack size={28} />
        </button>

        {/* Half Circle Background */}
        <div className="absolute left-0 top-0 w-1/3 h-full bg-gradient-to-r from-[#990000] to-[#330000] rounded-r-full z-0"></div>

        {/* Drug Images - ลดขนาดรูปใน Desktop */}
        <div className="relative md:w-1/2 flex flex-col items-center z-10 p-6">
          {selectedImage ? (
            <img
              src={selectedImage}
              alt={`${selectedDrug.title}`}
              className="relative w-80 h-80 mx-auto object-contain cursor-pointer"
              onClick={() => setFullScreen(true)}
              onError={(e) => {
                e.target.src = '/placeholder-drug.png';
              }}
            />
          ) : (
            <div className="relative w-80 h-80 mx-auto bg-gray-200 rounded-lg flex items-center justify-center">
              <span className="text-gray-500">ไม่มีรูปภาพ</span>
            </div>
          )}

          {/* Thumbnails - ลดขนาด thumbnails */}
          {selectedDrug.image && selectedDrug.image.length > 1 && (
            <div className="flex gap-2 mt-4 justify-center">
              {selectedDrug.image.map((img, index) => (
                <button
                  key={index}
                  className={`w-12 h-12 border-2 rounded ${
                    selectedImage === img ? "border-red-500" : "border-white"
                  }`}
                  onClick={() => setSelectedImage(img)}
                >
                  <img 
                    src={img} 
                    alt="Thumbnail" 
                    className="w-full h-full object-contain bg-white rounded"
                    onError={(e) => {
                      e.target.src = '/placeholder-drug.png';
                    }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Full Screen Modal - ลดขนาด thumbnails ใน modal */}
        {fullScreen && selectedImage && (
          <div className="fixed inset-0 bg-black bg-opacity-90 flex flex-col items-center justify-center z-50">
            {/* ปุ่มปิด Full Screen */}
            <button 
              className="absolute top-4 right-4 text-white text-3xl p-2 bg-gray-800 rounded-full"
              onClick={() => setFullScreen(false)}
            >
              <IoClose />
            </button>
            
            {/* ภาพที่ขยายเต็มจอ */}
            <img 
              src={selectedImage} 
              alt="Full Screen" 
              className="max-w-full max-h-[80vh] object-contain mb-4"
              onError={(e) => {
                e.target.src = '/placeholder-drug.png';
              }}
            />

            {/* Thumbnail ใน Full Screen - ลดขนาด */}
            {selectedDrug.image && selectedDrug.image.length > 1 && (
              <div className="flex justify-center space-x-2 p-4 bg-gray-900 bg-opacity-50 rounded-lg">
                {selectedDrug.image.map((img, index) => (
                  <img
                    key={index}
                    src={img}
                    alt={`Thumbnail ${index + 1}`}
                    className={`w-12 h-12 object-contain bg-white border-2 rounded-lg cursor-pointer ${img === selectedImage ? 'border-red-500' : 'border-gray-300'}`} // เปลี่ยนจาก w-16 h-16 เป็น w-12 h-12
                    onClick={() => setSelectedImage(img)}
                    onError={(e) => {
                      e.target.src = '/placeholder-drug.png';
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* Right Section - Drug Details */}
        <div className="md:w-1/2 h-full flex flex-col z-10 md:pl-10 pr-8">
          <div className="flex-1 overflow-y-auto p-6 pb-24 scrollbar-hide">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-gray-500">{selectedDrug.description}</h2>
              <DownloadButton />
            </div>
            
            <h1 className="text-3xl uppercase font-bold mt-3 break-words leading-tight max-w-[60%] hyphens-auto">
              {selectedDrug.characteristics}
            </h1>
            
            <div className="mt-6 border-t border-gray-200 pt-4 space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <span className="text-gray-600 font-medium">รูปแบบ:</span>
                <span className="text-gray-600 col-span-2">{selectedDrug.form}</span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <span className="text-gray-600 font-medium">ลักษณะ:</span>
                <span className="text-gray-600 col-span-2">{selectedDrug.characteristics}</span>
              </div>
            </div>

            <div className="mt-6 border-t border-gray-200 pt-4 space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <span className="text-gray-600 font-medium">สี:</span>
                <span className="text-gray-600 col-span-2">{selectedDrug.color}</span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <span className="text-gray-600 font-medium">เส้นผ่านศูนย์กลาง:</span>
                <span className="text-gray-600 col-span-2">{selectedDrug.diameter_mm} มม.</span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <span className="text-gray-600 font-medium">ความหนา:</span>
                <span className="text-gray-600 col-span-2">{selectedDrug.thickness_mm} มม.</span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <span className="text-gray-600 font-medium">รูปทรงขอบ:</span>
                <span className="text-gray-600 col-span-2">{selectedDrug.edge_shape}</span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <span className="text-gray-600 font-medium">น้ำหนัก:</span>
                <span className="text-gray-600 col-span-2">{selectedDrug.weight_grams} กรัม</span>
              </div>
            </div>

            <div className="mt-6 border-t border-gray-200 pt-4 space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <span className="text-gray-600 font-medium">วิธีการใช้:</span>
                <span className="text-gray-600 col-span-2">{selectedDrug.consumption_method}</span>
              </div>
            </div>

            <div className="mt-6 border-t border-gray-200 pt-4 space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <span className="text-gray-600 font-medium">ผลต่อร่างกาย:</span>
                <span className="text-gray-600 col-span-2">{selectedDrug.effect}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DrugProfile;
