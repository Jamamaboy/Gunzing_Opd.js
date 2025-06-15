import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { IoClose } from 'react-icons/io5';
import { PiImageBroken } from "react-icons/pi";
import DownloadButton from '../shared/DownloadButton';

const DrugProfile = ({ analysisResult, evidence, fromCamera, sourcePath }) => {
  const [catalogData, setCatalogData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fullScreen, setFullScreen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  const drugData = evidence ? {
    id: evidence.id || '',
    category: evidence.drug_category || 'ไม่ระบุหมวดหมู่',
    image: evidence.example_images?.map(img => img.image_url) || [],
    form: evidence.drug_form.name || 'ไม่ระบุรูปแบบ',
    characteristics: evidence.characteristics || 'ไม่ระบุลักษณะ',
    consumption_method: evidence.consumption_method || 'ไม่ระบุวิธีการใช้',
    effect: evidence.effect || 'ไม่ระบุผลต่อร่างกาย',
    weight_grams: evidence.weight_grams || 'ไม่ระบุน้ำหนัก',
    color: evidence.pill_info?.color || 'ไม่ระบุสี',
    diameter_mm: evidence.pill_info?.diameter_mm || 'ไม่ระบุเส้นผ่านศูนย์กลาง',
    thickness_mm: evidence.pill_info?.thickness_mm || 'ไม่ระบุความหนา',
    edge_shape: evidence.pill_info?.edge_shape || 'ไม่ระบุรูปทรงขอบ',
    drug_id: evidence.id || '',
    confidence: analysisResult.confidence 
      ? analysisResult.confidence
      : null
  } : {
    drug_id: '',
    confidence: null
  };
  
  const imageUrl = localStorage.getItem('analysisImage') || "";

  const calculateOffset = (percent) => {
    const circumference = 2 * Math.PI * 45;
    return circumference - (circumference * percent / 100);
  };

  const NoImageDisplay = ({ message = "การแสดงผลภาพถ่ายมีปัญหา" }) => (
    <div className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-lg border border-gray-200 h-64 w-full">
      <PiImageBroken className="text-gray-400 text-5xl mb-2" />
      <p className="text-gray-500 text-center">{message}</p>
    </div>
  );

  const LoadingState = () => (
    <div className="flex justify-center items-center p-4">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#990000]"></div>
      <span className="ml-3 text-gray-600">กำลังค้นหาข้อมูลยาเสพติด...</span>
    </div>
  );

  const ErrorState = ({ message }) => (
    <div className="p-4 text-red-600 text-sm">
      เกิดข้อผิดพลาดในการค้นหาข้อมูล: {message}
    </div>
  );

  // Desktop version
  const DesktopView = () => (
    <div className="hidden md:flex flex-col relative md:flex-row items-center p-6 bg-white h-full">
      {/* Left column - Drug image */}
      <div className="w-1/2 p-6 flex justify-center items-center">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="ยาเสพติด"
            className="max-w-full h-auto object-contain max-h-96 cursor-pointer"
            onClick={() => setFullScreen(true)}
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextElementSibling.style.display = 'flex';
            }}
          />
        ) : (
          <NoImageDisplay />
        )}
        <div className="hidden flex-col items-center justify-center">
          <NoImageDisplay message="การแสดงผลภาพผิดพลาด" />
        </div>
      </div>

      {/* Right column - Drug details */}
      <div className="w-1/2 p-6 flex flex-col h-full scrollbar-hide">
        {/* Top section - Brand & Type */}
        <div>
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-gray-500">
              {drugData.category}
            </h2>
            <DownloadButton />
          </div>
          <h1 className="text-3xl uppercase font-bold mt-3 break-words leading-tight max-w-[60%] hyphens-auto">
            {drugData.characteristics}
          </h1>
        </div>

        {/* Middle section - Analysis Results and confidence */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex flex-row">
            {/* Analysis Results column */}
            <div className="space-y-4 w-1/2">
              <div className="grid grid-cols-3 gap-4">
                <span className="text-gray-600 font-medium">รูปแบบ: </span>
                <span className="text-gray-600 col-span-2">{drugData.form}</span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <span className="text-gray-600 font-medium">ลักษณะ:</span>
                <span className="text-gray-600 col-span-2">{drugData.characteristics}</span>
              </div>
              <div className="mt-6 border-t border-gray-200 pt-4 space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <span className="text-gray-600 font-medium">สี:</span>
                  <span className="text-gray-600 col-span-2">{drugData.color}</span>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <span className="text-gray-600 font-medium">เส้นผ่านศูนย์กลาง:</span>
                  <span className="text-gray-600 col-span-2">{drugData.diameter_mm} มม.</span>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <span className="text-gray-600 font-medium">ความหนา:</span>
                  <span className="text-gray-600 col-span-2">{drugData.thickness_mm} มม.</span>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <span className="text-gray-600 font-medium">รูปทรงขอบ:</span>
                  <span className="text-gray-600 col-span-2">{drugData.edge_shape}</span>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <span className="text-gray-600 font-medium">น้ำหนัก:</span>
                  <span className="text-gray-600 col-span-2">{drugData.weight_grams} กรัม</span>
                </div>
              </div>
            </div>

            {/* Confidence meter on the right */}
            <div className="flex flex-col items-center justify-top w-1/2">
              <div className="w-24 h-24 relative">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#e6e6e6"
                    strokeWidth="8"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#8B0000"
                    strokeWidth="8"
                    strokeDasharray={2 * Math.PI * 45}
                    strokeDashoffset={calculateOffset((drugData.confidence || 0) * 100)}
                    transform="rotate(-90 50 50)"
                  />
                  <text 
                    x="50" 
                    y="50" 
                    textAnchor="middle" 
                    dominantBaseline="middle" 
                    fontSize="20" 
                    fontWeight="bold"
                    fill="#8B0000"
                  >
                    {Math.round((drugData.confidence || 0) * 100)}%
                  </text>
                </svg>
              </div>
              <div className="mt-2">
                <p className="text-gray-600">ความมั่นใจ</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 border-t border-gray-200 pt-4 space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <span className="text-gray-600 font-medium">วิธีการใช้:</span>
            <span className="text-gray-600 col-span-2">{drugData.consumption_method}</span>
          </div>
        </div>

        <div className="mt-6 border-t border-gray-200 pt-4 space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <span className="text-gray-600 font-medium">ผลต่อร่างกาย:</span>
            <span className="text-gray-600 col-span-2">{drugData.effect}</span>
          </div>
        </div>
      </div>
    </div>
  );

  // Mobile version
  const MobileView = () => (
    <div className="flex md:hidden flex-col h-full px-4">
      {/* Drug image */}
      <div className="p-4 flex justify-center items-center">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="ยาเสพติด"
            className="max-w-full h-auto object-contain max-h-60 cursor-pointer"
            onClick={() => setFullScreen(true)}
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextElementSibling.style.display = 'flex';
            }}
          />
        ) : (
          <NoImageDisplay />
        )}
        <div className="hidden flex-col items-center justify-center">
          <NoImageDisplay message="การแสดงผลภาพผิดพลาด" />
        </div>
      </div>

      {/* Drug title */}
      <div className="flex items-center justify-between">
        <h2 className="text-gray-500 font-medium">
          {drugData.category || 'ยาเสพติด'}
        </h2>
        <DownloadButton />
      </div>
      <h1 className="text-2xl uppercase font-bold mt-1 break-words leading-tight max-w-[60%] hyphens-auto">
        {drugData.characteristics}
      </h1>

      {/* Details section with confidence meter on right side */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-start">
          {/* Details on left */}
          <div className="flex-1">
            <div className="grid grid-cols-3 gap-2">
              <span className="text-gray-600 font-medium">รูปแบบ:</span>
              <span className="text-gray-600 col-span-2">{drugData.form}</span>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-3 gap-2">
                <span className="text-gray-600 font-medium">ลักษณะ:</span>
                <span className="text-gray-600 col-span-2">{drugData.characteristics}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-3 gap-2">
                <span className="text-gray-600 font-medium">สี:</span>
                <span className="text-gray-600 col-span-2">{drugData.color}</span>
              </div>
            </div>

            <div className="space-y-2">
              {/* Additional details if available */}
              {evidence && evidence.details && evidence.details.length > 0 && (
                <div className="mt-4 pt-3 border-t border-gray-200">
                  <h4 className="font-medium text-gray-600 mb-2 text-sm">ผลการวิเคราะห์เพิ่มเติม</h4>
                  <div className="space-y-2">
                    {evidence.details.slice(0, 2).map((detail, index) => (
                      <div key={index} className="grid grid-cols-3 gap-2">
                        <span className="text-gray-600 font-medium text-sm">{detail.pill_name}:</span>
                        <span className="text-gray-600 col-span-2 text-sm">{(detail.confidence * 100).toFixed(1)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Confidence meter on right */}
          <div className="ml-4 flex-shrink-0">
            <div className="w-20 h-20 relative">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="#e6e6e6"
                  strokeWidth="8"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="#8B0000"
                  strokeWidth="8"
                  strokeDasharray={2 * Math.PI * 45}
                  strokeDashoffset={calculateOffset((drugData.confidence || 0) * 100)}
                  transform="rotate(-90 50 50)"
                />
                <text 
                  x="50" 
                  y="50" 
                  textAnchor="middle" 
                  dominantBaseline="middle" 
                  fontSize="18" 
                  fontWeight="bold"
                  fill="#8B0000"
                >
                  {Math.round((drugData.confidence || 0) * 100)}%
                </text>
              </svg>
            </div>
            <div className="text-center mt-1">
              <p className="text-gray-600 text-sm">ความมั่นใจ</p>
            </div>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-3 gap-2">
            <span className="text-gray-600 font-medium">เส้นผ่านศูนย์กลาง:</span>
            <span className="text-gray-600 col-span-2">{drugData.diameter_mm} มม.</span>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-3 gap-2">
            <span className="text-gray-600 font-medium">ความหนา:</span>
            <span className="text-gray-600 col-span-2">{drugData.thickness_mm} มม.</span>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-3 gap-2">
            <span className="text-gray-600 font-medium">รูปทรงขอบ:</span>
            <span className="text-gray-600 col-span-2">{drugData.edge_shape}</span>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-3 gap-2">
            <span className="text-gray-600 font-medium">น้ำหนัก:</span>
            <span className="text-gray-600 col-span-2">{drugData.weight_grams} กรัม</span>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-3 gap-2">
            <span className="text-gray-600 font-medium">วิธีการใช้:</span>
            <span className="text-gray-600 col-span-2">{drugData.consumption_method}</span>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-3 gap-2">
            <span className="text-gray-600 font-medium">ผลต่อร่างกาย:</span>
            <span className="text-gray-600 col-span-2">{drugData.effect}</span>
          </div>
        </div>
      </div>

      {loading && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#800000] mx-auto"></div>
          <p className="text-gray-600 text-sm mt-2">กำลังโหลด...</p>
        </div>
      )}
      
      {catalogData && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h3 className="text-lg font-medium mb-3">ข้อมูลจากแคตตาล็อก</h3>
          
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              <span className="text-gray-600 font-medium text-sm">รูปแบบ:</span>
              <span className="text-gray-600 col-span-2 text-sm">{drugData.form}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="text-gray-600 font-medium text-sm">ลักษณะ:</span>
              <span className="text-gray-600 col-span-2 text-sm">{catalogData.characteristics}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="text-gray-600 font-medium text-sm">วิธีการใช้:</span>
              <span className="text-gray-600 col-span-2 text-sm">{catalogData.consumption_method}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="text-gray-600 font-medium text-sm">ผลต่อร่างกาย:</span>
              <span className="text-gray-600 col-span-2 text-sm">{catalogData.effect}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="text-gray-600 font-medium text-sm">น้ำหนัก:</span>
              <span className="text-gray-600 col-span-2 text-sm">{catalogData.weight_grams} กรัม</span>
            </div>
          </div>

          {catalogData.color !== 'ไม่ระบุสี' && (
            <div className="mt-4 pt-3 border-t border-gray-200">
              <h4 className="font-medium text-gray-600 mb-2 text-sm">ข้อมูลเม็ดยา</h4>
              <div className="space-y-2">
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-gray-600 font-medium text-sm">สี:</span>
                  <span className="text-gray-600 col-span-2 text-sm">{catalogData.color}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-gray-600 font-medium text-sm">เส้นผ่านศูนย์กลาง:</span>
                  <span className="text-gray-600 col-span-2 text-sm">{catalogData.diameter_mm} มม.</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-gray-600 font-medium text-sm">ความหนา:</span>
                  <span className="text-gray-600 col-span-2 text-sm">{catalogData.thickness_mm} มม.</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-gray-600 font-medium text-sm">รูปทรงขอบ:</span>
                  <span className="text-gray-600 col-span-2 text-sm">{catalogData.edge_shape}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-white h-full flex flex-col relative">
      <DesktopView />
      <MobileView />

      {/* Full Screen Modal for Image */}
      {fullScreen && imageUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex flex-col items-center justify-center z-50">
          <button 
            className="absolute top-4 right-4 text-white text-3xl p-2 bg-gray-800 rounded-full"
            onClick={() => setFullScreen(false)}
          >
            <IoClose />
          </button>
          
          <img src={imageUrl} alt="Full Screen" className="max-w-full max-h-[80vh] object-contain mb-4 px-4" />
        </div>
      )}
    </div>
  );
};

export default DrugProfile;