import React from 'react';
import { useDevice } from '../../context/DeviceContext';

const DeviceContextExample = () => {
  const { isMobile, isTablet, isDesktop, orientation } = useDevice();

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">ตัวอย่างการใช้งาน DeviceContext</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold mb-4">ข้อมูลอุปกรณ์ปัจจุบัน</h2>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-100 p-4 rounded">
            <p className="font-medium">ประเภทอุปกรณ์</p>
            <p className="mt-2">
              {isMobile && <span className="text-green-600 font-bold">📱 Mobile</span>}
              {isTablet && <span className="text-blue-600 font-bold">📱 Tablet</span>}
              {isDesktop && <span className="text-purple-600 font-bold">💻 Desktop</span>}
            </p>
          </div>
          
          <div className="bg-gray-100 p-4 rounded">
            <p className="font-medium">แนวหน้าจอ</p>
            <p className="mt-2">
              {orientation === 'portrait' && <span className="text-green-600 font-bold">📱 Portrait (แนวตั้ง)</span>}
              {orientation === 'landscape' && <span className="text-blue-600 font-bold">📱 Landscape (แนวนอน)</span>}
            </p>
          </div>
        </div>
        
        {/* แสดงเนื้อหาตามประเภทอุปกรณ์ */}
        <div className="mt-6">
          <h3 className="text-md font-semibold mb-2">เนื้อหาตามประเภทอุปกรณ์</h3>
          
          {isMobile && (
            <div className="bg-green-100 p-4 rounded">
              <p>เนื้อหาสำหรับอุปกรณ์มือถือ</p>
              <p className="text-sm mt-2">แสดงเฉพาะข้อมูลที่จำเป็นเพื่อให้เหมาะกับหน้าจอขนาดเล็ก</p>
            </div>
          )}
          
          {isTablet && (
            <div className="bg-blue-100 p-4 rounded">
              <p>เนื้อหาสำหรับแท็บเล็ต</p>
              <p className="text-sm mt-2">แสดงข้อมูลเพิ่มเติมที่เหมาะกับหน้าจอขนาดกลาง</p>
            </div>
          )}
          
          {isDesktop && (
            <div className="bg-purple-100 p-4 rounded">
              <p>เนื้อหาสำหรับเดสก์ท็อป</p>
              <p className="text-sm mt-2">แสดงข้อมูลแบบเต็มพร้อมฟีเจอร์พิเศษต่าง ๆ สำหรับหน้าจอขนาดใหญ่</p>
            </div>
          )}
        </div>
        
        <div className="mt-6">
          <h3 className="text-md font-semibold mb-2">คำแนะนำการใช้งาน</h3>
          <p>ลองปรับขนาดหน้าต่างเบราว์เซอร์เพื่อดูการเปลี่ยนแปลงแบบเรียลไทม์</p>
          <p className="text-sm mt-2">ขนาดหน้าจอ: 
            <span className="ml-1">
              {isMobile && "น้อยกว่า 640px"}
              {isTablet && "640px - 1023px"}
              {isDesktop && "มากกว่าหรือเท่ากับ 1024px"}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default DeviceContextExample;