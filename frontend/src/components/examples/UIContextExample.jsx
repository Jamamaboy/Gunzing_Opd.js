import React from 'react';
import { useUI } from '../../context/UIContext';

const Navigation = () => {
  // เรียกใช้ Context จากที่สร้างไว้
  const { 
    isSidebarOpen, 
    toggleSidebar, 
    activeTab, 
    setActiveTab 
  } = useUI();

  return (
    <nav className="bg-blue-500 p-4">
      <div className="flex justify-between items-center">
        {/* ปุ่มเปิด-ปิด Sidebar */}
        <button 
          onClick={toggleSidebar}
          className="text-white p-2"
        >
          {isSidebarOpen ? '✕ ปิดเมนู' : '☰ เมนู'}
        </button>

        {/* แท็บนำทาง */}
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('home')}
            className={`px-3 py-1 ${activeTab === 'home' ? 'bg-white text-blue-500' : 'text-white'}`}
          >
            หน้าหลัก
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1 ${activeTab === 'history' ? 'bg-white text-blue-500' : 'text-white'}`}
          >
            ประวัติ
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-3 py-1 ${activeTab === 'profile' ? 'bg-white text-blue-500' : 'text-white'}`}
          >
            โปรไฟล์
          </button>
        </div>

        {/* ส่วนอื่น ๆ */}
        <div className="text-white">ตัวอย่าง UI</div>
      </div>
    </nav>
  );
};

// Sidebar คอมโพเนนต์ที่ใช้ UIContext เช่นกัน
const Sidebar = () => {
  const { isSidebarOpen } = useUI();

  if (!isSidebarOpen) return null;

  return (
    <div className="fixed left-0 top-16 h-screen w-64 bg-gray-800 text-white p-4">
      <h2 className="text-xl mb-4">เมนูหลัก</h2>
      <ul>
        <li className="mb-2 p-2 hover:bg-gray-700">หน้าหลัก</li>
        <li className="mb-2 p-2 hover:bg-gray-700">ประวัติ</li>
        <li className="mb-2 p-2 hover:bg-gray-700">ตั้งค่า</li>
        <li className="mb-2 p-2 hover:bg-gray-700">ออกจากระบบ</li>
      </ul>
    </div>
  );
};

const UIContextExample = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navigation />
      <Sidebar />
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">ตัวอย่างการใช้งาน UIContext</h1>
        <p className="mb-4">
          คอมโพเนนต์นี้แสดงตัวอย่างการใช้งาน UIContext ในการจัดการสถานะของ UI ร่วมกันระหว่าง Navigation และ Sidebar
        </p>
        <p>
          ลองคลิกที่ปุ่มเมนูเพื่อเปิด-ปิด Sidebar หรือคลิกที่แท็บเพื่อเปลี่ยนหน้า
        </p>
      </div>
    </div>
  );
};

export default UIContextExample;