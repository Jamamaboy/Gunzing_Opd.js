import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { 
  FaTags, 
  FaPlusCircle, 
  FaQuestionCircle, 
  FaHistory, 
  FaCamera, 
  FaUpload, 
  FaChartBar, 
  FaMapMarkedAlt,
  FaListAlt,
  FaSearch,
  FaRegClock
} from "react-icons/fa";

const ColtIcon = ({ size = 24, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 512 512"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path fill="currentColor" d="M237.58 213.41a48.65 48.65 0 0 1 2.09-14.63h-17.15a1.45 1.45 0 0 0-1.37 1.37v14.58a15 15 0 0 0 1 6.15c.1 0 .26-.1.38-.1h15.58a59 59 0 0 1-.53-7.37zM145.16 396l-2.07 13.22-106.72-16.69 2.11-13.48 106.06 16.86zm249.29-246.22H86.71c2.08-37 19.18-47 19.18-47h378.27v32.53c-59-2.45-81.32 6.47-89.71 14.47zm89.59.92h.12v27.08h-80v-16.77c4-3.09 20.68-12.82 79.87-10.31zM27.84 361.78l119.12 19s25.79-87.28 36.14-115.79c6.14-16.95 29.91-20.21 41.32-20.21h31.32c16.06 0 29.42-13.69 30.42-30.92l-.2-23.08a7 7 0 0 1 7.2-7h96v-18H83.64c-3.18 4.32-9.37 6.14-21.27 7.24-27.3 2.54-21.28 19.3-21.28 19.3a37.51 37.51 0 0 1 4.56-.29c9.55 0 27.65 2.63 39.74 17.75 14.49 18.08-38.28 94.73-57.55 152zm178.32-161.63a16.16 16.16 0 0 1 16.37-16.37h37.31a16.12 16.12 0 0 1 16.32 16.37v14.58c0 12-9.11 22.05-18.32 22.05h-35.32c-12 0-16.37-9.89-16.37-22.05v-14.58zm-155 151.53a10.23 10.23 0 0 1-1.73-10.49c12.36-30.23 55.41-128.32 70.86-161.48 6.48-13.9 35.77-14.41 52.31-8.65 14.25 5 21.13 14.74 18.4 26.15-5.46 22.81-36.94 120.87-52.6 165.22-1.33 3.78-4.7 6.15-10 7.05a45.81 45.81 0 0 1-7.46.51c-9.91 0-23.26-1.95-33.24-4-19.89-4-32.18-8.82-36.54-14.31zm83-165.32c-14.86 31.91-55 123.3-69 156.95 4.32 2.21 14.25 5.53 28.85 8.26 15.21 2.84 26.29 3.37 30.81 2.88 15.65-44.71 46-139.46 51.14-160.83.26-1.09.87-3.65-5.17-6.64-5.51-2.73-14.08-4.26-22.36-4-8.68.28-13.37 2.4-14.27 3.38zm5.86 18.66a8.3 8.3 0 1 1 8.3 8.3 8.3 8.3 0 0 1-8.31-8.3zm-30.79 124.15a8.3 8.3 0 1 1-8.3-8.3 8.3 8.3 0 0 1 8.28 8.3zM77.99 116l-4.59 15.93a10.15 10.15 0 0 1-2.94-4.2c-.73-2.39-9.62-17.8-19.42-18.59 10.12-4.61 26.94 6.86 26.94 6.86z"/>
  </svg>
);

const FeatureCard = ({ icon, title, description, to, gradient }) => {
  const navigate = useNavigate();
  
  // Define a set of gradients to be used
  const gradients = {
    blue: "from-blue-500 to-blue-600",
    purple: "from-purple-500 to-purple-600",
    green: "from-green-500 to-green-600",
    indigo: "from-indigo-500 to-indigo-600",
    red: "from-red-500 to-red-600",
    orange: "from-orange-400 to-orange-500",
  };
  
  const selectedGradient = gradients[gradient] || gradients.blue;
  
  return (
    <div
      onClick={() => to && navigate(to)}
      className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer border border-gray-100 flex flex-col h-full"
    >
      <div className={`bg-gradient-to-r ${selectedGradient} p-4 text-white`}>
        <div className="text-3xl mb-2">{icon}</div>
        <h3 className="font-medium text-base">{title}</h3>
      </div>
      {description && (
        <div className="p-4 text-sm text-gray-600 flex-grow">
          <p>{description}</p>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ title, value, icon, color }) => {
  const colorClasses = {
    blue: "text-blue-600",
    green: "text-green-600",
    purple: "text-purple-600",
    orange: "text-orange-600",
  };
  
  const bgColorClasses = {
    blue: "bg-blue-100",
    green: "bg-green-100",
    purple: "bg-purple-100",
    orange: "bg-orange-100",
  };
  
  const selectedColor = colorClasses[color] || colorClasses.blue;
  const selectedBgColor = bgColorClasses[color] || bgColorClasses.blue;
  
  return (
    <div className="bg-white rounded-xl shadow-sm p-4 flex items-center">
      <div className={`${selectedBgColor} ${selectedColor} p-3 rounded-lg mr-4`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <p className="text-xl font-semibold">{value}</p>
      </div>
    </div>
  );
};

const RecentActivityCard = () => {
  // Mock recent activities data
  const recentActivities = [
    { id: 1, type: 'label', gun: 'Glock 19', timestamp: '15 นาทีที่แล้ว' },
    { id: 2, type: 'add', gun: 'AK-47', timestamp: '2 ชั่วโมงที่แล้ว' },
    { id: 3, type: 'process', gun: 'ปืนไม่ทราบชนิด #423', timestamp: '1 วันที่แล้ว' },
  ];
  
  const getActivityIcon = (type) => {
    switch (type) {
      case 'label':
        return <FaTags className="text-blue-500" />;
      case 'add':
        return <FaPlusCircle className="text-green-500" />;
      case 'process':
        return <FaSearch className="text-purple-500" />;
      default:
        return <FaRegClock className="text-gray-500" />;
    }
  };
  
  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100">
      <div className="border-b border-gray-100 p-4">
        <h3 className="font-medium">กิจกรรมล่าสุด</h3>
      </div>
      <div className="divide-y divide-gray-100">
        {recentActivities.map(activity => (
          <div key={activity.id} className="p-4 flex items-center">
            <div className="mr-3">
              {getActivityIcon(activity.type)}
            </div>
            <div className="flex-1">
              <p className="text-sm">
                <span className="font-medium">{activity.gun}</span>
              </p>
              <p className="text-xs text-gray-500 mt-1 flex items-center">
                <FaRegClock className="mr-1 text-gray-400" size={12} />
                {activity.timestamp}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const DesktopLayout = () => {
  // Define admin-specific features
  const adminFeatures = [
    {
      icon: <FaListAlt />,
      title: "จัดการบัญชีอาวุธปืน",
      description: "จัดการ แก้ไข และดูรายละเอียดอาวุธปืนทั้งหมดในระบบ",
      to: "/admin/guns/catalog-management",
      gradient: "blue"
    },
    {
      icon: <FaPlusCircle />,
      title: "เพิ่มอาวุธปืนใหม่",
      description: "เพิ่มข้อมูลอาวุธปืนใหม่เข้าสู่ระบบฐานข้อมูล",
      to: "/admin/guns/create-gun",
      gradient: "green"
    },
    {
      icon: <FaQuestionCircle />,
      title: "อาวุธปืนไม่ทราบชนิด",
      description: "ดูรายการอาวุธปืนที่ยังไม่ได้ระบุชนิด",
      to: "/admin/guns/unknown-class-table",
      gradient: "orange"
    },
    {
      icon: <FaTags />,
      title: "ระบุชนิดปืน",
      description: "ระบุประเภทหรือชนิดของอาวุธปืนที่ยังไม่ทราบชนิด",
      to: "/admin/guns/label-gun",
      gradient: "purple"
    },
    {
      icon: <FaHistory />,
      title: "ประวัติการเจออาวุธปืน",
      description: "ดูประวัติและรายละเอียดของการพบอาวุธปืนทั้งหมด",
      to: "/admin/guns/history",
      gradient: "indigo"
    }
  ];

  // Define shared features
  const sharedFeatures = [
    {
      icon: <FaCamera />,
      title: "ถ่ายรูปวัตถุพยาน",
      description: "ถ่ายภาพอาวุธปืนเพื่อประมวลผลและวิเคราะห์โดยระบบ AI",
      to: "/process/camera",
      gradient: "blue"
    },
    {
      icon: <FaUpload />,
      title: "อัพโหลดรูปวัตถุพยาน",
      description: "อัพโหลดภาพอาวุธปืนที่มีอยู่แล้วเพื่อประมวลผล",
      to: "/process/upload",
      gradient: "green"
    },
    {
      icon: <FaChartBar />,
      title: "สถิติอาวุธปืน",
      description: "ดูสถิติและข้อมูลเชิงวิเคราะห์เกี่ยวกับอาวุธปืน",
      to: "/dashboard/firearms",
      gradient: "purple"
    },
    {
      icon: <FaMapMarkedAlt />,
      title: "แผนที่การเจอปืน",
      description: "ดูแผนที่แสดงตำแหน่งและความหนาแน่นของการพบอาวุธปืน",
      to: "/map/firearms",
      gradient: "orange"
    }
  ];
  
  // Mock statistics data
  const stats = [
    { title: "อาวุธปืนทั้งหมด", value: "1,245", icon: <ColtIcon size={20} />, color: "blue" },
    { title: "ปืนไม่ทราบชนิด", value: "28", icon: <FaQuestionCircle size={20} />, color: "orange" },
    { title: "เพิ่มใหม่เดือนนี้", value: "56", icon: <FaPlusCircle size={20} />, color: "green" },
    { title: "อัตราการระบุประเภท", value: "94%", icon: <FaTags size={20} />, color: "purple" }
  ];

  return (
    <div className="h-full w-full flex flex-col overflow-auto p-6 bg-gray-50">
      {/* Dashboard Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">ระบบงานอาวุธปืน</h1>
          <p className="text-gray-500 mt-1">ยินดีต้อนรับสู่ระบบจัดการอาวุธปืน</p>
        </div>
      </div>
      
      {/* Statistics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, index) => (
          <StatCard 
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            color={stat.color}
          />
        ))}
      </div>
      
      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Features Column */}
        <div className="lg:col-span-3">
          {/* Admin Features */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <div className="w-1 h-5 bg-blue-500 rounded mr-2"></div>
              ความสามารถเฉพาะแอดมิน
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {adminFeatures.map((feature, index) => (
                <FeatureCard
                  key={index}
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                  to={feature.to}
                  gradient={feature.gradient}
                />
              ))}
            </div>
          </div>
          
          {/* Shared Features */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <div className="w-1 h-5 bg-green-500 rounded mr-2"></div>
              ความสามารถร่วม
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
              {sharedFeatures.map((feature, index) => (
                <FeatureCard
                  key={index}
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                  to={feature.to}
                  gradient={feature.gradient}
                />
              ))}
            </div>
          </div>
        </div>
        
        {/* Recent Activity Column */}
        <div className="lg:col-span-1">
          <RecentActivityCard />
        </div>
      </div>
    </div>
  )
}

const FirearmAdminHome = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [unauthorized, setUnauthorized] = useState(false);
  
  // Check if user has the correct role and department
  useEffect(() => {
    if (!user) return;
    
    const isAuthorized = user.role?.id === 2 && user.department === "กลุ่มงานอาวุธปืน";
    
    if (!isAuthorized) {
      setUnauthorized(true);
      // Redirect to home page after 3 seconds if unauthorized
      const timer = setTimeout(() => {
        navigate('/home');
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [user, navigate]);

  // If user is not authorized, show access denied message
  if (unauthorized) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
        <div className="bg-white p-8 rounded-xl shadow-xl text-center max-w-md">
          <div className="text-red-600 text-6xl mb-6">⚠️</div>
          <h1 className="text-3xl font-bold text-red-700 mb-4">ไม่มีสิทธิ์เข้าถึง</h1>
          <p className="text-gray-700 mb-6 text-lg">
            คุณไม่มีสิทธิ์ในการเข้าถึงหน้านี้ หน้านี้สำหรับผู้ดูแลระบบกลุ่มงานอาวุธปืนเท่านั้น
          </p>
          <p className="text-gray-500">กำลังนำคุณกลับไปยังหน้าหลัก...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="w-full h-screen bg-gray-50">
      <DesktopLayout />
    </div>
  )
}

export default FirearmAdminHome;
