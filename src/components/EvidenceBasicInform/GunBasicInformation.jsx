import React from 'react';

const GunBasicInformation = () => {
  const gunData = {
    type: 'ปืน',
    brand: 'Glock',
    model: '',
    serialNumber: '',
    confidence: 78
  };

  const calculateOffset = (percent) => {
    const circumference = 2 * Math.PI * 45;
    return circumference - (circumference * percent / 100);
  };

  // Desktop version
  const DesktopView = () => (
    <div className="hidden md:flex flex-row h-full w-full">
      {/* Left column - Gun image */}
      <div className="w-1/2 p-6 flex justify-center items-center">
        <img 
          src="https://oyster.ignimgs.com/mediawiki/apis.ign.com/battlefield-3/4/43/G18.png" 
          alt="ปืน Glock" 
          className="max-w-full h-auto object-contain max-h-96"
        />
      </div>

      {/* Right column - Gun details */}
      <div className="w-1/2 p-6 flex flex-col justify-between h-full">
        {/* Top section with title and share button */}
        <div>
          <div className="flex justify-between items-center border-b pb-4 mb-6">
            <h2 className="text-2xl font-medium">ปืน-ยี่ห้อ-รุ่น</h2>
            <button className="text-gray-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </button>
          </div>

          {/* Details section with confidence meter to the right */}
          <div className="mb-8">
            <div className="flex flex-row">
              {/* Details column */}
              <div className="space-y-4 w-1/2">
                <h3 className="text-xl font-medium mb-4">รายละเอียด</h3>
                <div className="flex">
                  <span className="text-gray-600 w-40">ประเภท:</span> 
                  <span>{gunData.type}</span>
                </div>
                <div className="flex">
                  <span className="text-gray-600 w-40">ยี่ห้อ:</span> 
                  <span>{gunData.brand}</span>
                </div>
                <div className="flex">
                  <span className="text-gray-600 w-40">รุ่น:</span> 
                  <span>{gunData.model || '-'}</span>
                </div>
                <div className="flex">
                  <span className="text-gray-600 w-40">เลขทะเบียนประจำปืน:</span> 
                  <span>{gunData.serialNumber || '-'}</span>
                </div>
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
                    
                    {/* Progress circle - going clockwise */}
                    <circle 
                      cx="50" 
                      cy="50" 
                      r="45" 
                      fill="none" 
                      stroke="#8B0000" 
                      strokeWidth="8" 
                      strokeDasharray={2 * Math.PI * 45} 
                      strokeDashoffset={calculateOffset(gunData.confidence)} 
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
                      {gunData.confidence}%
                    </text>
                  </svg>
                </div>
                <div className="mt-2">
                  <p className="text-gray-600">ความมั่นใจ</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom section */}
        <div className="mt-auto">
          {/* You can add buttons or additional information here */}
        </div>
      </div>
    </div>
  );

  // Mobile version - Updated to match the second design image
  const MobileView = () => (
    <div className="flex md:hidden flex-col h-full w-full">
      {/* Gun image */}
      <div className="p-4 flex justify-center items-center">
        <img 
          src="https://oyster.ignimgs.com/mediawiki/apis.ign.com/battlefield-3/4/43/G18.png" 
          alt="ปืน Glock" 
          className="max-w-full h-auto object-contain max-h-60"
        />
      </div>

      {/* Gun title with share button */}
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-xl font-medium">ปืน-ยี่ห้อ-รุ่น</h2>
        <button className="text-gray-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
        </button>
      </div>

      {/* Details section with confidence meter on right side */}
      <div className="px-4 mt-4">
        <div className="flex items-start">
          {/* Details on left */}
          <div className="flex-1">
            <h3 className="text-lg font-medium mb-2">รายละเอียด</h3>
            <div className="py-2 flex">
              <span className="text-gray-600 w-32">ประเภท:</span> 
              <span className="font-medium">{gunData.type}</span>
            </div>
            <div className="py-2 flex">
              <span className="text-gray-600 w-32">ยี่ห้อ:</span> 
              <span className="font-medium">{gunData.brand}</span>
            </div>
            <div className="py-2 flex">
              <span className="text-gray-600 w-32">รุ่น:</span> 
              <span className="font-medium">{gunData.model || '-'}</span>
            </div>
            <div className="py-2 flex">
              <span className="text-gray-600 w-32">จุดสังเกตเลขทะเบียน:</span> 
              <span className="font-medium">{gunData.serialNumber || '-'}</span>
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
                  strokeDashoffset={calculateOffset(gunData.confidence)} 
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
                  {gunData.confidence}%
                </text>
              </svg>
            </div>
            <div className="text-center mt-1">
              <p className="text-gray-600 text-sm">ความมั่นใจ</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white w-full h-full flex flex-col">
      <DesktopView />
      <MobileView />
    </div>
  );
};

export default GunBasicInformation;