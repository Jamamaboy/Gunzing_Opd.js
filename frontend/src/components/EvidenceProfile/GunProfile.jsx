import React, { useState } from 'react';
import { IoClose } from 'react-icons/io5';
import { PiImageBroken } from "react-icons/pi";
import DownloadButton from '../shared/DownloadButton';

const GunProfile = ({ evidence, analysisResult, isLoading, apiError }) => {
  const [showShareNotification, setShowShareNotification] = useState(false);
  const [fullScreen, setFullScreen] = useState(false);

  const imageUrl = localStorage.getItem('analysisImage');

  const confidence = analysisResult && analysisResult.confidence
    ? Math.round(analysisResult.confidence * 100)
    : 0;
  const calculateOffset = (percent) => {
    const circumference = 2 * Math.PI * 45;
    return circumference - (circumference * percent / 100);
  };

  const handleShare = async () => {
    const pageUrl = window.location.href;
    const shareTitle = `Gun Analysis`;
    const shareText = `Gun Analysis Results - Confidence: ${confidence}%`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: pageUrl
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(pageUrl);
        setShowShareNotification(true);
        setTimeout(() => setShowShareNotification(false), 3000);
      } catch (err) {
        console.error('Error copying to clipboard:', err);
      }
    }
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
      <span className="ml-3 text-gray-600">กำลังค้นหาข้อมูลอาวุธ...</span>
    </div>
  );

  // Error state when API call fails
  const ErrorState = ({ message }) => (
    <div className="p-4 text-red-600 text-sm">
      เกิดข้อผิดพลาดในการค้นหาข้อมูล: {message}
    </div>
  );

  // Render firearm information from API
  const renderFirearmInfo = () => {
    if (isLoading) {
      return <LoadingState />;
    }

    if (apiError) {
      return <ErrorState message={apiError} />;
    }

    if (!evidence) {
      return (
        <div className="mt-6">
          <h4 className="font-medium mb-2 text-red-600">ไม่พบข้อมูลในฐานข้อมูล</h4>
          <p className="text-gray-500 text-sm">
            ไม่สามารถค้นหาข้อมูลอาวุธปืนนี้ จากฐานข้อมูลได้ อาจเป็นเพราะ:
          </p>
          <ul className="text-gray-500 text-sm list-disc list-inside ml-2 mt-2">
            <li>อาวุธนี้ไม่มีอยู่ในฐานข้อมูล</li>
            <li>ชื่อยี่ห้อหรือรุ่นไม่ตรงกับในฐานข้อมูล</li>
            <li>อาจมีปัญหาในการเชื่อมต่อกับฐานข้อมูล</li>
          </ul>
        </div>
      );
    }
    console.log('evidence:', evidence);
    
    return (
      <div className="mt-6">
        <div className="py-2 flex"><span className="text-gray-600 w-40">ยี่ห้อ:</span> <span>{evidence.brand}</span></div>
        <div className="py-2 flex"><span className="text-gray-600 w-40">ซีรีส์:</span> <span>{evidence.series || '-'}</span></div>
        <div className="py-2 flex"><span className="text-gray-600 w-40">รุ่น:</span> <span>{evidence.model}</span></div>
        <div className="py-2 flex"><span className="text-gray-600 w-40">กลไก:</span> <span>{evidence.mechanism}</span></div>
        {evidence.exhibit && (
          <>
            <div className="py-2 flex"><span className="text-gray-600 w-40">หมวดหมู่:</span> <span>{evidence.exhibit.category}</span></div>
            <div className="py-2 flex"><span className="text-gray-600 w-40">ประเภทย่อย:</span> <span>{evidence.exhibit.subcategory}</span></div>
          </>
        )}
      </div>
    );
  };

  // Desktop version
  const DesktopView = () => (
    <div className="hidden md:flex flex-row h-full w-full">
      {/* Left column - Gun image */}
      <div className="w-1/2 p-6 flex justify-center items-center">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="อาวุธปืน"
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

      {/* Right column - Gun details */}
      <div className="w-1/2 p-6 flex flex-col h-full">
        {/* Top section - Brand & Model */}
        <div>
          {evidence ? (
            <>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-500">{evidence.brand}</h2>
                <DownloadButton />
              </div>
              <h2 className="text-3xl font-bold mt-1 tracking-wider uppercase">{evidence.series} {evidence.model}</h2>
            </>
          ) : (
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold tracking-wider uppercase">
                {evidence?.brandName && <span>{evidence.brandName}</span>}
              </h2>
              <DownloadButton />
            </div>
          )}
        </div>

        {/* Middle section - Details and confidence */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex flex-row">
            {/* Details column */}
            <div className="space-y-4 w-1/2">
              <h3 className="text-xl font-medium mb-4">รายละเอียด</h3>
              {renderFirearmInfo()}
            </div>

            {/* Confidence meter on the right */}
            <div className="flex flex-col items-center justify-top w-1/2">
              <div className="w-24 h-24 relative">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  {/* Background circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#e6e6e6"
                    strokeWidth="8"
                  />
                  {/* Progress circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#8B0000"
                    strokeWidth="8"
                    strokeDasharray={2 * Math.PI * 45}
                    strokeDashoffset={calculateOffset(confidence)}
                    transform="rotate(-90 50 50)"
                  />
                  {/* Text in the middle */}
                  <text
                    x="50"
                    y="50"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="20"
                    fontWeight="bold"
                    fill="#8B0000"
                  >
                    {confidence}%
                  </text>
                </svg>
              </div>
              <div className="mt-2">
                <p className="text-gray-600">ความมั่นใจ</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom section - Ammunition and Serial Number */}
        {!isLoading && !apiError && evidence && (
          <div className="mt-auto">
            {/* กระสุนที่ใช้ร่วมกัน */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <h3 className="font-medium text-gray-600 mb-3">กระสุนที่ใช้ร่วมกัน</h3>
                <div className="flex gap-2 mt-2 flex-wrap">
                  {evidence.ammunitions.map((ammo, index) => (
                    <button 
                      key={index} 
                      className="px-4 py-2 border rounded-lg bg-white hover:bg-gray-100 text-gray-700"
                    >
                      {ammo.caliber}
                    </button>
                  ))}
                </div>
              </div>

            {/* จุดสังเกตหมายเลขประจำปืน */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <h3 className="font-medium text-gray-600 mb-2">จุดสังเกตหมายเลขประจำปืน</h3>
              <p className="text-gray-500">{evidence.serialposition || "ไม่มีข้อมูล"}</p>
              {evidence.serialImage && (
                <img
                  src={evidence.serialImage}
                  alt="ตำแหน่งหมายเลขประจำปืน"
                  className="w-48 rounded border mt-2"
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Mobile version
  const MobileView = () => (
    <div className="flex md:hidden flex-col h-full px-4">
      {/* Gun image */}
      <div className="p-4 flex justify-center items-center">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="อาวุธปืน"
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

      {/* Gun title with share button */}
      {evidence ? (
        <>
          <div className="flex items-center justify-between">
            <h2 className="text-gray-500 font-medium">
              {evidence.brand}
            </h2>
            <DownloadButton />
          </div>
          <h1 className="text-2xl uppercase font-bold mt-1">
            {evidence.model}
          </h1>
        </>
      ) : (
        <>{evidence?.brandName && <span>{evidence.brandName}</span>}</>
      )}

      {/* Details section with confidence meter on right side */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-start">
          {/* Details on left */}
          <div className="flex-1">
            <h3 className="text-lg font-medium mb-2">รายละเอียด</h3>
            {isLoading ? (
              <LoadingState />
            ) : apiError ? (
              <ErrorState message={apiError} />
            ) : !evidence ? (
              <div className="py-2">
                <span className="text-red-600 font-medium">ไม่พบข้อมูลในฐานข้อมูล</span>
                <p className="text-gray-500 text-sm mt-2">
                  ไม่สามารถค้นหาข้อมูลอาวุธปืนนี้ จากฐานข้อมูลได้
                </p>
              </div>
            ) : (
              <>
                <div className="py-2 flex">
                  <span className="text-gray-600 w-32">ยี่ห้อ:</span> 
                  <span className="font-medium">{evidence.brand}</span>
                </div>
                <div className="py-2 flex">
                  <span className="text-gray-600 w-32">ซีรีส์:</span> 
                  <span className="font-medium">{evidence.series || '-'}</span>
                </div>
                <div className="py-2 flex">
                  <span className="text-gray-600 w-32">รุ่น:</span> 
                  <span className="font-medium">{evidence.model}</span>
                </div>
                <div className="py-2 flex">
                  <span className="text-gray-600 w-32">กลไก:</span> 
                  <span className="font-medium">{evidence.mechanism}</span>
                </div>
                {evidence.exhibit && (
                  <>
                    <div className="py-2 flex">
                      <span className="text-gray-600 w-32">หมวดหมู่:</span> 
                      <span className="font-medium">{evidence.exhibit.category}</span>
                    </div>
                    <div className="py-2 flex">
                      <span className="text-gray-600 w-32">ประเภทย่อย:</span> 
                      <span className="font-medium">{evidence.exhibit.subcategory}</span>
                    </div>
                  </>
                )}
              </>
            )}
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
                  strokeDashoffset={calculateOffset(confidence)}
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
                  {confidence}%
                </text>
              </svg>
            </div>
            <div className="text-center mt-1">
              <p className="text-gray-600 text-sm">ความมั่นใจ</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* ย้ายส่วนกระสุนมาแสดงที่นี่ (ด้านล่างของหน้าจอ) */}
      {!isLoading && !apiError && evidence && evidence.ammunitions && evidence.ammunitions.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <h3 className="text-lg font-medium mb-3">กระสุนที่ใช้ร่วมกัน</h3>
          <div className="flex flex-wrap gap-2 mt-2">
            {evidence.ammunitions.map((ammo, index) => (
              <button
                key={index}
                className="px-4 py-2 rounded-full border text-sm bg-white text-black"
              >
                {ammo.caliber}
              </button>
            ))}
          </div>
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
          {/* ปุ่มปิด Full Screen */}
          <button 
            className="absolute top-4 right-4 text-white text-3xl p-2 bg-gray-800 rounded-full"
            onClick={() => setFullScreen(false)}
          >
            <IoClose />
          </button>
          
          {/* ภาพที่ขยายเต็มจอ */}
          <img src={imageUrl} alt="Full Screen" className="max-w-full max-h-[80vh] object-contain mb-4 px-4" />
        </div>
      )}

      {/* Share notification toast */}
      {showShareNotification && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded shadow-lg">
          คัดลอกลิงก์สำเร็จแล้ว
        </div>
      )}
    </div>
  );
};

export default GunProfile;