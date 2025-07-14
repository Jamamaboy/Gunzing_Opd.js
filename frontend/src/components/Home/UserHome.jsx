import { memo } from "react";
import { Link } from "react-router-dom";
import { FaCamera, FaHistory, FaUpload } from "react-icons/fa";
import { FaFolderOpen, FaChartSimple, FaMapLocationDot } from "react-icons/fa6";
import { useNavigate } from 'react-router-dom';
import { useUI } from '../../context/UIContext';
import { useImage } from '../../context/ImageContext';
import { useDevice } from '../../context/DeviceContext';

// Memoized Feature Button Component
const FeatureButton = memo(({ Icon, label, path }) => (
  <Link to={path}
    className="bg-[#F5F5F5] rounded-lg shadow p-4 flex flex-col items-center justify-center aspect-square transition-all duration-300 hover:bg-white hover:shadow-md hover:scale-105 hover:text-red-800"
  >
    <Icon className="w-8 h-8 text-[#333333] mb-6 transition-colors group-hover:text-red-800" />
    <p className="text-center text-sm">{label}</p>
  </Link>
));

// Memoized Mobile Feature Icon
const MobileFeatureIcon = memo(({ Icon, label, path }) => (
  <Link to={path} className="flex flex-col items-center">
    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-2 transition-all duration-300 hover:bg-red-50 hover:scale-110">
      <Icon className="w-6 h-6 text-gray-600 transition-colors hover:text-red-800" />
    </div>
    <span className="text-xs text-center">{label}</span>
  </Link>
));

const UserHome = () => {
  const navigate = useNavigate();
  const { setActiveTab } = useUI();
  const { setImageForPreview } = useImage();
  const { isMobile } = useDevice();

  const features = [
    { Icon: FaHistory, label: "ประวัติ", path: "/history" },
    { Icon: FaFolderOpen, label: "บัญชีวัตถุพยาน", path: "/selectCatalogType" },
    { Icon: FaChartSimple, label: "แดชบอร์ด", path: "/dashboard" },
    { Icon: FaMapLocationDot, label: "แผนที่", path: "/map" }
  ];

  const handleImageUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';

    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        setImageForPreview(file);
        const reader = new FileReader();
        reader.onload = (event) => {
          navigate('/imagePreview', {
            state: {
              imageData: event.target.result,
              sourcePath: '/home',
              fromCamera: false,
              uploadFromCameraPage: false
            }
          });
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  return (
    <div className="h-full bg-gray-50">
      {isMobile ? (
        <div className="flex flex-col h-full">
          <div className="flex-1 flex flex-col pt-4 pb-20">
            <div className="flex flex-col justify-center bg-white w-full h-[100%] items-center rounded-lg p-6 mb-4">
              <div className="w-full text-center mb-8">
                <h1 className="text-xl font-bold mb-2">ยินดีต้อนรับสู่ Forensic Assistance</h1>
                <p className="text-sm text-gray-600">เครื่องมือช่วยจัดการข้อมูลที่ใช้งานง่าย</p>
                <p className="text-sm text-gray-600">และมีประสิทธิภาพ</p>
              </div>
              <div className="flex flex-col w-full gap-4 justify-center">
                <Link
                  to="/camera"
                  className="w-full min-w-[140px] bg-red-800 text-white py-3 px-4 rounded-md flex items-center justify-center gap-2 transition-colors hover:bg-red-900"
                  onClick={() => setActiveTab('camera')}
                >
                  <FaCamera className="w-5 h-5" />
                  <span>ถ่ายภาพ</span>
                </Link>
                <button
                  className="w-full min-w-[140px] border border-red-800 text-red-800 py-3 px-4 rounded-md flex items-center justify-center gap-2 transition-colors hover:bg-red-50"
                  onClick={handleImageUpload}
                  // onClick={() => navigate('/tutorial')}
                >
                  <FaUpload className="w-5 h-5" />
                  <span>อัพโหลดภาพ</span>
                </button>
              </div>
            </div>
            <div className="w-full bg-white mt-auto py-8 px-4">
              <h2 className="text-lg font-medium mb-6">ฟีเจอร์อื่นๆ</h2>
              <div className="grid grid-cols-4 gap-4">
                {features.map((feature, index) => (
                  <MobileFeatureIcon
                    key={index}
                    Icon={feature.Icon}
                    label={feature.label}
                    path={feature.path}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center h-full">
          <div className="w-full max-w-6xl mx-auto px-4 py-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2">ยินดีต้อนรับสู่ Forensic Assistance</h1>
              <p className="text-gray-600">เครื่องมือช่วยจัดการข้อมูลที่ใช้งานง่ายและมีประสิทธิภาพ</p>
            </div>
            <div className="flex justify-center gap-4 mb-12">
              <Link
                to="/camera"
                className="bg-red-800 hover:bg-red-900 text-white px-6 py-3 rounded-md flex items-center w-40 gap-2 justify-center transition-colors"
                onClick={() => setActiveTab('camera')}
              >
                <FaCamera size={20} /> ถ่ายภาพ
              </Link>
              <button
                className="bg-white border border-red-800 text-red-800 px-6 py-3 rounded-md flex items-center gap-2 justify-center transition-colors hover:bg-red-50"
                onClick={handleImageUpload}
              >
                <FaUpload size={20} /> อัปโหลดภาพ
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
              {features.map((feature, index) => (
                <FeatureButton key={index} Icon={feature.Icon} label={feature.label} path={feature.path} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserHome;
