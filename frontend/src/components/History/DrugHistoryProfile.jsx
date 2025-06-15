import React, { useState } from 'react';

const DrugHistoryProfile = ({ item }) => {
  const [showShareNotification, setShowShareNotification] = useState(false);

  const calculateOffset = (percent) => {
    const circumference = 2 * Math.PI * 45;
    return circumference - (circumference * percent / 100);
  };

  // Function to handle share button click
  const handleShare = async () => {
    const pageUrl = window.location.href;
    const shareTitle = `ยาเสพติด: ${item.name}`;
    const shareText = `ผลการวิเคราะห์ยาเสพติด - ประเภท: ${item.name}, สถานที่: ${item.location}, ความมั่นใจ: ${item.ai_confidence}%`;
    
    // Try to use the Web Share API if available
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
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(pageUrl);
        setShowShareNotification(true);
        setTimeout(() => setShowShareNotification(false), 3000);
      } catch (err) {
        console.error('Could not copy URL:', err);
      }
    }
  };

  // แยกสถานที่จาก location string
  const getLocationParts = () => {
    if (!item.location) return { subdistrict: 'ไม่ระบุ', district: 'ไม่ระบุ', province: 'ไม่ระบุ' };
    
    const parts = item.location.split(' ');
    return {
      subdistrict: parts[0] || 'ไม่ระบุ',
      district: parts[1] || 'ไม่ระบุ',
      province: parts[2] || 'ไม่ระบุ'
    };
  };

  const locationParts = getLocationParts();

  // Desktop version
  const DesktopView = () => (
    <div className="hidden md:flex flex-row h-full w-full">
      {/* Left column - Drug image */}
      <div className="w-1/2 p-6 flex justify-center items-center">
        <img  
          src={item.image}
          alt={item.name} 
          className="max-w-full h-auto object-contain max-h-96"
          onError={(e) => {
            e.target.src = '/placeholder-drug.png';
          }}
        />
      </div>

      {/* Right column - Drug details */}
      <div className="w-1/2 p-6 flex flex-col justify-between h-full">
        {/* Top section with title and share button */}
        <div>
          <div className="flex justify-between items-center border-b pb-4 mb-6">
            <div>
              <h2 className="text-sm font-medium text-gray-500">{item.category}</h2>
              <h1 className="text-2xl font-bold mt-1">{item.name}</h1>
            </div>
            <button 
              className="text-gray-600 hover:text-gray-800 focus:outline-none"
              onClick={handleShare}
              aria-label="แชร์"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </button>
          </div>

          {/* Details section with confidence meter to the right */}
          <div className="mb-8">
            <div className="flex flex-row">
              {/* Details column */}
              <div className="space-y-4 w-2/3 pr-4">
                {/* ข้อมูลยาเสพติด */}
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-lg font-medium mb-3">ข้อมูลยาเสพติด</h3>
                  <div className="space-y-2">
                    <div className="flex">
                      <span className="text-gray-600 w-32">ประเภท:</span> 
                      <span className="font-medium">{item.drug_type || item.subcategory || 'ไม่ระบุ'}</span>
                    </div>
                    <div className="flex">
                      <span className="text-gray-600 w-32">หมวดหมู่:</span> 
                      <span className="font-medium">{item.drug_category || 'ไม่ระบุ'}</span>
                    </div>
                    {item.weight_grams && (
                      <div className="flex">
                        <span className="text-gray-600 w-32">น้ำหนัก:</span> 
                        <span className="font-medium">{item.weight_grams} กรัม</span>
                      </div>
                    )}
                    {item.consumption_method && (
                      <div className="flex">
                        <span className="text-gray-600 w-32">วิธีการใช้:</span> 
                        <span className="font-medium">{item.consumption_method}</span>
                      </div>
                    )}
                    {item.effect && (
                      <div className="flex">
                        <span className="text-gray-600 w-32">ผลต่อร่างกาย:</span> 
                        <span className="font-medium">{item.effect}</span>
                      </div>
                    )}
                    {item.description && (
                      <div className="flex">
                        <span className="text-gray-600 w-32">ลักษณะ:</span> 
                        <span className="font-medium">{item.description}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* สถานที่พบ */}
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-lg font-medium mb-3">สถานที่พบ</h3>
                  <div className="space-y-2">
                    <div className="flex">
                      <span className="text-gray-600 w-32">ตำบล:</span> 
                      <span className="font-medium">{locationParts.subdistrict}</span>
                    </div>
                    <div className="flex">
                      <span className="text-gray-600 w-32">อำเภอ:</span> 
                      <span className="font-medium">{locationParts.district}</span>
                    </div>
                    <div className="flex">
                      <span className="text-gray-600 w-32">จังหวัด:</span> 
                      <span className="font-medium">{locationParts.province}</span>
                    </div>
                  </div>
                </div>

                {/* ข้อมูลการค้นพบ */}
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-lg font-medium mb-3">ข้อมูลการค้นพบ</h3>
                  <div className="space-y-2">
                    <div className="flex">
                      <span className="text-gray-600 w-32">วันที่พบ:</span> 
                      <span className="font-medium">{item.date}</span>
                    </div>
                    <div className="flex">
                      <span className="text-gray-600 w-32">เวลาที่พบ:</span> 
                      <span className="font-medium">{item.time}</span>
                    </div>
                    <div className="flex">
                      <span className="text-gray-600 w-32">ผู้พบ:</span> 
                      <span className="font-medium">{item.discoverer || 'ไม่ระบุ'}</span>
                    </div>
                    {item.quantity && (
                      <div className="flex">
                        <span className="text-gray-600 w-32">จำนวน:</span> 
                        <span className="font-medium">{item.quantity}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Confidence meter on the right */}
              <div className="flex flex-col items-center justify-start w-1/3">
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
                    
                    {/* Progress circle - going clockwise */}
                    <circle 
                      cx="50" 
                      cy="50" 
                      r="45" 
                      fill="none" 
                      stroke="#8B0000" 
                      strokeWidth="8" 
                      strokeDasharray={2 * Math.PI * 45} 
                      strokeDashoffset={calculateOffset((item.ai_confidence || 0) * 100)} 
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
                      {Math.round((item.ai_confidence || 0) * 100)}%
                    </text>
                  </svg>
                </div>
                <div className="mt-2 text-center">
                  <p className="text-gray-600">ความมั่นใจ AI</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Mobile version
  const MobileView = () => (
    <div className="flex md:hidden flex-col h-full w-full">
      {/* Drug image */}
      <div className="p-4 flex justify-center items-center">
        <img 
          src={item.image}
          alt={item.name} 
          className="max-w-full h-auto object-contain max-h-60"
          onError={(e) => {
            e.target.src = '/placeholder-drug.png';
          }}
        />
      </div>

      {/* Drug title with share button */}
      <div className="px-4 mb-4">
        <div className="flex justify-between items-center border-b pb-4">
          <div className="flex-1">
            <h2 className="text-sm font-medium text-gray-500">{item.category}</h2>
            <h1 className="text-xl font-bold mt-1">{item.name}</h1>
          </div>
          <button 
            className="text-gray-600 hover:text-gray-800 focus:outline-none ml-4" 
            onClick={handleShare}
            aria-label="แชร์"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Details section with confidence meter */}
      <div className="px-4 pb-4 overflow-y-auto">
        <div className="flex items-start">
          {/* Details on left */}
          <div className="flex-1 pr-4">
            {/* ข้อมูลยาเสพติด */}
            <div className="mb-4">
              <h3 className="text-lg font-medium mb-2">ข้อมูลยาเสพติด</h3>
              <div className="space-y-1">
                <div className="flex">
                  <span className="text-gray-600 w-24 text-sm">ประเภท:</span> 
                  <span className="font-medium text-sm">{item.drug_type || item.subcategory || 'ไม่ระบุ'}</span>
                </div>
                <div className="flex">
                  <span className="text-gray-600 w-24 text-sm">หมวดหมู่:</span> 
                  <span className="font-medium text-sm">{item.drug_category || 'ไม่ระบุ'}</span>
                </div>
                {item.weight_grams && (
                  <div className="flex">
                    <span className="text-gray-600 w-24 text-sm">น้ำหนัก:</span> 
                    <span className="font-medium text-sm">{item.weight_grams} กรัม</span>
                  </div>
                )}
                {item.consumption_method && (
                  <div className="flex">
                    <span className="text-gray-600 w-24 text-sm">วิธีการใช้:</span> 
                    <span className="font-medium text-sm">{item.consumption_method}</span>
                  </div>
                )}
                {item.effect && (
                  <div className="flex flex-col">
                    <span className="text-gray-600 text-sm">ผลต่อร่างกาย:</span> 
                    <span className="font-medium text-sm mt-1">{item.effect}</span>
                  </div>
                )}
                {item.description && (
                  <div className="flex flex-col">
                    <span className="text-gray-600 text-sm">ลักษณะ:</span> 
                    <span className="font-medium text-sm mt-1">{item.description}</span>
                  </div>
                )}
              </div>
            </div>

            {/* สถานที่พบ */}
            <div className="mb-4 border-t border-gray-200 pt-4">
              <h3 className="text-lg font-medium mb-2">สถานที่พบ</h3>
              <div className="space-y-1">
                <div className="flex">
                  <span className="text-gray-600 w-24 text-sm">ตำบล:</span> 
                  <span className="font-medium text-sm">{locationParts.subdistrict}</span>
                </div>
                <div className="flex">
                  <span className="text-gray-600 w-24 text-sm">อำเภอ:</span> 
                  <span className="font-medium text-sm">{locationParts.district}</span>
                </div>
                <div className="flex">
                  <span className="text-gray-600 w-24 text-sm">จังหวัด:</span> 
                  <span className="font-medium text-sm">{locationParts.province}</span>
                </div>
              </div>
            </div>

            {/* ข้อมูลการค้นพบ */}
            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-lg font-medium mb-2">ข้อมูลการค้นพบ</h3>
              <div className="space-y-1">
                <div className="flex">
                  <span className="text-gray-600 w-24 text-sm">วันที่พบ:</span> 
                  <span className="font-medium text-sm">{item.date}</span>
                </div>
                <div className="flex">
                  <span className="text-gray-600 w-24 text-sm">เวลาที่พบ:</span> 
                  <span className="font-medium text-sm">{item.time}</span>
                </div>
                <div className="flex">
                  <span className="text-gray-600 w-24 text-sm">ผู้พบ:</span> 
                  <span className="font-medium text-sm">{item.discoverer || 'ไม่ระบุ'}</span>
                </div>
                {item.quantity && (
                  <div className="flex">
                    <span className="text-gray-600 w-24 text-sm">จำนวน:</span> 
                    <span className="font-medium text-sm">{item.quantity}</span>
                  </div>
                )}
              </div>
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
                  strokeDashoffset={calculateOffset((item.ai_confidence || 0) * 100)} 
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
                  {Math.round((item.ai_confidence || 0) * 100)}%
                </text>
              </svg>
            </div>
            <div className="text-center mt-1">
              <p className="text-gray-600 text-xs">ความมั่นใจ AI</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white w-full h-full flex flex-col relative">
      <DesktopView />
      <MobileView />
      
      {/* Share notification toast */}
      {showShareNotification && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded shadow-lg z-50">
          คัดลอกลิงก์สำเร็จแล้ว
        </div>
      )}
    </div>
  );
};

export default DrugHistoryProfile;