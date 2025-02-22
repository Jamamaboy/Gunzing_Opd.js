import { useState } from "react";
import { Camera, Upload, History, Folder, BarChart, MapPin } from "lucide-react";

export default function Content() {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <div className="h-full overflow-auto bg-[#F5F5F5] flex flex-col items-center justify-center min-h-screen p-6 relative" style={{ marginTop: "-50px" }}>
      <h1 className="text-xl font-bold">ยินดีต้อนรับสู่ [ชื่อเว็บ]</h1>
      <p className="text-gray-600">เครื่องมือช่วยจัดการข้อมูลที่ใช้งานง่ายและมีประสิทธิภาพ</p>
      
      <div className="flex gap-4 my-6 relative">
        <button className="bg-red-800 hover:bg-red-900 text-white px-4 py-2 rounded flex items-center gap-2 w-36 justify-center">
          <Camera size={16} /> ถ่ายภาพ
        </button>

        <div className="relative">
          <button 
            className="bg-white border border-red-500 text-red-500 px-4 py-2 rounded flex items-center gap-2 hover:bg-red-100" 
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <Upload size={16} /> อัปโหลดภาพ
          </button>
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-36 bg-white shadow-lg rounded-lg">
              <button 
                className="block w-full text-left px-4 py-2 hover:bg-gray-100" 
              >ปืน</button>
              <button 
                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
              >ยาเสพติด</button>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-4 max-w-4xl">
        <button className="p-4 bg-white rounded-xl shadow flex flex-col items-center w-40 hover:bg-gray-100">
          <History size={24} />
          <p className="mt-2">ประวัติภาพถ่ายวัตถุพยาน</p>
        </button>
        <button className="p-4 bg-white rounded-xl shadow flex flex-col items-center w-40 hover:bg-gray-100">
          <Folder size={24} />
          <p className="mt-2">บัญชีวัตถุพยาน</p>
        </button>
        <button className="p-4 bg-white rounded-xl shadow flex flex-col items-center w-40 hover:bg-gray-100">
          <BarChart size={24} />
          <p className="mt-2">สถิติ</p>
        </button>
        <button className="p-4 bg-white rounded-xl shadow flex flex-col items-center w-40 hover:bg-gray-100">
          <MapPin size={24} />
          <p className="mt-2">แผนที่</p>
        </button>
      </div>
    </div>
  );
}
