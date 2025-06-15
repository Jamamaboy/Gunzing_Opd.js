import React from 'react'
import { useNavigate } from 'react-router-dom'
import { UserRoundCog } from 'lucide-react';

const AzureServicesCard = ({ icon, title, subtitle, to }) => {
    const navigate = useNavigate();
    return (
      <div
        className="flex flex-col items-center justify-center p-4 bg-white rounded-md cursor-pointer hover:bg-gray-50 transition-colors w-24 h-24 text-center"
        onClick={() => to && navigate(to)}
      >
        <div className="text-blue-500 mb-2">
          {icon}
        </div>
        <div className="text-xs font-medium">{title}</div>
        {subtitle && <div className="text-xs text-gray-600">{subtitle}</div>}
      </div>
    );
};

const DesktopLayout = () => {
    const services = [
      {
        icon: <UserRoundCog size={24} className="text-blue-500" />,
        title: "จัดการบัญชีผู้ใช้",
        to: "/userManagementTable" // ตัวอย่าง path
      }
    ];

    return (
        <div className="h-full w-full flex flex-col overflow-hidden">
            <div className="px-6 pt-4 flex justify-between items-center flex-shrink-0">
                <h2 className="text-xl font-semibold text-gray-800">บริการ</h2>
            </div>
            <div className="flex space-x-4 overflow-x-auto pb-4">
            {services.map((service, index) => (
                <AzureServicesCard 
                key={index}
                icon={service.icon}
                title={service.title}
                subtitle={service.subtitle}
                to={service.to}
                />
            ))}
            </div>
        </div>
    )
}

const SuperAdminHome = () => {
  return (
    <div className='w-full h-full'>
        <div className='hidden md:block h-full'>
            <DesktopLayout />
        </div>
    </div>
  )
}

export default SuperAdminHome;