import { useState, memo } from "react";
import { Link } from "react-router-dom";
import { Camera, Upload, Clock, FolderClosed, BarChart3, MapPin } from "lucide-react";

// Memoized Feature Button Component
const FeatureButton = memo(({ Icon, label }) => (
  <button 
    className="bg-[#F5F5F5] rounded-lg shadow p-4 flex flex-col items-center justify-center aspect-square transition-all duration-300 hover:bg-white hover:shadow-md hover:scale-105 hover:text-red-800"
  >
    <Icon className="w-8 h-8 text-[#333333] mb-6 transition-colors group-hover:text-red-800" />
    <p className="text-center text-sm">{label}</p>
  </button>
));

// Memoized Mobile Feature Icon
const MobileFeatureIcon = memo(({ Icon, label }) => (
  <div className="flex flex-col items-center">
    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-2 transition-all duration-300 hover:bg-red-50 hover:scale-110">
      <Icon className="w-6 h-6 text-gray-600 transition-colors hover:text-red-800" />
    </div>
    <span className="text-xs text-center">{label}</span>
  </div>
));

// Dropdown Component
const UploadDropdown = memo(({ isOpen, options, onOptionClick }) => {
  if (!isOpen) return null;
  
  return (
    <div className="absolute left-0 right-0 mt-1 bg-white shadow-lg rounded-md overflow-hidden border border-gray-200 z-50">
      {options.map((option, index) => (
        <button 
          key={index} 
          className="block w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
          onClick={() => onOptionClick(option)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
});

const Home = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const features = [
    { Icon: Clock, label: "ประวัติการพบวัตถุพยาน" },
    { Icon: FolderClosed, label: "บัญชีวัตถุพยาน" },
    { Icon: BarChart3, label: "สถิติ" },
    { Icon: MapPin, label: "แผนที่" }
  ];

  const uploadOptions = [
    { label: "ปืน" },
    { label: "ยาเสพติด" }
  ];

  const handleOptionClick = (option) => {
    console.log(`Selected: ${option.label}`);
    setDropdownOpen(false);
  };

  return (
    <div className="h-full bg-gray-50">
      {/* Mobile Layout */}
      <div className="sm:hidden flex flex-col h-full">
        {/* Main Content Area with spacing */}
        <div className="flex-1 flex flex-col pt-4 pb-20">
          {/* Header + Button Section with white background and spacing */}
          <div className="flex flex-col justify-center bg-white w-full h-[100%] items-center rounded-lg p-6 mb-4">
            {/* Header Section */}
            <div className="w-full text-center mb-8">
              <h1 className="text-xl font-bold mb-2">ยินดีต้อนรับสู่ [ชื่อเว็บ]</h1>
              <p className="text-sm text-gray-600">เครื่องมือช่วยจัดการข้อมูลที่ใช้งานง่าย</p>
              <p className="text-sm text-gray-600">และมีประสิทธิภาพ</p>
            </div>

            {/* Mobile Button Group */}
            <div className="flex w-full gap-4 justify-center">
              {/* ถ่ายภาพ */}
              <Link to="/camera" className="w-40 min-w-[140px] bg-red-800 text-white py-3 px-4 rounded-md flex items-center justify-center gap-2 transition-colors hover:bg-red-900">
                <Camera className="w-5 h-5" />
                <span>ถ่ายภาพ</span>
              </Link>

              {/* อัพโหลดภาพ + Dropdown */}
              <div className="relative w-40 min-w-[140px]">
                <button 
                  className="w-full border border-red-800 text-red-800 py-3 px-4 rounded-md flex items-center justify-center gap-2 transition-colors hover:bg-red-50"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  <Upload className="w-5 h-5" />
                  <span>อัพโหลดภาพ</span>
                </button>

                <UploadDropdown 
                  isOpen={dropdownOpen} 
                  options={uploadOptions} 
                  onOptionClick={handleOptionClick} 
                />
              </div>
            </div>
          </div>

          {/* Feature Section with white background and spacing */}
          <div className="w-full bg-white mt-auto py-8 px-4">
            <h2 className="text-lg font-medium mb-6">ฟีเจอร์อื่นๆ</h2>
            <div className="grid grid-cols-4 gap-4">
              {features.map((feature, index) => (
                <MobileFeatureIcon key={index} Icon={feature.Icon} label={feature.label} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden sm:flex items-center h-full">
        <div className="w-full max-w-6xl mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">ยินดีต้อนรับสู่ [ชื่อเว็บ]</h1>
            <p className="text-gray-600">เครื่องมือช่วยจัดการข้อมูลที่ใช้งานง่ายและมีประสิทธิภาพ</p>
          </div>
          
          <div className="flex justify-center gap-4 mb-12">
            <Link to="/camera" className="bg-red-800 hover:bg-red-900 text-white px-6 py-3 rounded-md flex items-center w-40 gap-2 justify-center transition-colors">
              <Camera size={20} /> ถ่ายภาพ
            </Link>

            <div className="relative">
              <button 
                className="bg-white border border-red-800 text-red-800 px-6 py-3 rounded-md flex items-center gap-2 justify-center transition-colors hover:bg-red-50" 
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <Upload size={20} /> อัปโหลดภาพ
              </button>
              
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200">
                  {uploadOptions.map((option, index) => (
                    <button 
                      key={index} 
                      className="block w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors"
                      onClick={() => handleOptionClick(option)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {features.map((feature, index) => (
              <FeatureButton key={index} Icon={feature.Icon} label={feature.label} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(Home);