import React from 'react';

const DrugBasicInformation = ({ analysisResult }) => {
  // Default data if no analysis result is provided
  const drugData = analysisResult ? {
    type: analysisResult.prediction || '',
    brand: analysisResult.details && analysisResult.details.length > 0 ? 
      analysisResult.details[0].pill_name : '',
    confidence: analysisResult.confidence 
      ? Math.round(analysisResult.confidence * 100) 
      : 78
  } : {
    type: '',
    brand: '',
    confidence: 78
  };

  // Get the image from localStorage if available
  const imageUrl = localStorage.getItem('analysisImage') || 
    "https://static.thairath.co.th/media/NjpUs24nCQKx5e1DGjlQPs22NFuMf4uNTBL7sYwj5kL.jpg";

  const calculateOffset = (percent) => {
    const circumference = 2 * Math.PI * 45;
    return circumference - (circumference * percent / 100);
  };

  // Desktop version
  const DesktopView = () => (
    <div className="hidden md:flex flex-row h-full w-full">
      {/* Left column - Drug image */}
      <div className="w-1/2 p-6 flex justify-center items-center">
        <img 
          src={imageUrl} 
          alt="ยา WY" 
          className="max-w-full h-auto object-contain max-h-96"
        />
      </div>

      {/* Right column - Drug details */}
      <div className="w-1/2 p-6 flex flex-col justify-between h-full">
        {/* Top section with title and share button */}
        <div>
          <div className="flex justify-between items-center border-b pb-4 mb-6">
            <h2 className="text-2xl font-medium">ยาเสพติด {drugData.type}</h2>
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
                  <span>{drugData.type}</span>
                </div>
                <div className="flex">
                  <span className="text-gray-600 w-40">แหล่งผลิต:</span> 
                  <span>{drugData.brand}</span>
                </div>
                
                {/* Additional details if available from analysis */}
                {analysisResult && analysisResult.details && analysisResult.details.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-medium mb-2">ผลการวิเคราะห์เพิ่มเติม:</h4>
                    <ul className="space-y-2">
                      {analysisResult.details.slice(0, 3).map((detail, index) => (
                        <li key={index} className="flex">
                          <span className="text-gray-600 w-40">{detail.pill_name}:</span>
                          <span>{(detail.confidence * 100).toFixed(1)}%</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
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
                      strokeDashoffset={calculateOffset(drugData.confidence)} 
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
                      {drugData.confidence}%
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

  // Mobile version
  const MobileView = () => (
    <div className="flex md:hidden flex-col h-full w-full">
      {/* Drug image */}
      <div className="p-4 flex justify-center items-center">
        <img 
          src={imageUrl} 
          alt="ยาเสพติด" 
          className="max-w-full h-auto object-contain max-h-60"
        />
      </div>

      {/* Drug title with share button */}
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-xl font-medium">ยาเสพติด {drugData.type}</h2>
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
              <span className="font-medium">{drugData.type}</span>
            </div>
            <div className="py-2 flex">
              <span className="text-gray-600 w-32">แหล่งผลิต:</span> 
              <span className="font-medium">{drugData.brand}</span>
            </div>
            
            {/* Additional details if available from analysis */}
            {analysisResult && analysisResult.details && analysisResult.details.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium">ผลการวิเคราะห์เพิ่มเติม:</h4>
                <ul>
                  {analysisResult.details.slice(0, 2).map((detail, index) => (
                    <li key={index} className="py-2 flex">
                      <span className="text-gray-600 w-32">{detail.pill_name}:</span>
                      <span className="font-medium">{(detail.confidence * 100).toFixed(1)}%</span>
                    </li>
                  ))}
                </ul>
              </div>
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
                  strokeDashoffset={calculateOffset(drugData.confidence)} 
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
                  {drugData.confidence}%
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

export default DrugBasicInformation;