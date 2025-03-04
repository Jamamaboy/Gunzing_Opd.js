import React, { useState } from "react";
import { FiFilter, FiPlus, FiEye, FiEdit, FiTrash, FiMapPin } from "react-icons/fi";
import { useNavigate } from "react-router-dom"; // ใช้สำหรับไปหน้า /map

const History = () => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const navigate = useNavigate(); // ใช้เพื่อเปลี่ยนหน้าไปที่ /map

  // 🔹 ตัวอย่างข้อมูล
  const historyData = [
    { date: "13/2/2568", category: "อาวุธปืน", image: "gun.png", name: "Glock", location: "จังหวัด, อำเภอ, ตำบล" },
    { date: "13/2/2568", category: "ยาเสพติด", image: "drug.png", name: "WY", location: "จังหวัด, อำเภอ, ตำบล" },
    { date: "13/2/2568", category: "อาวุธปืน", image: "gun.png", name: "Glock", location: "จังหวัด, อำเภอ, ตำบล" },
  ];

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-xl font-semibold">ประวัติการพบวัตถุพยาน</h1>
        <button className="flex items-center gap-2 px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600">
          <FiPlus size={18} /> เพิ่มประวัติการค้นพบ
        </button>
      </div>

      {/* ปุ่ม Filter */}
      <div className="mb-4">
        <button onClick={() => setIsFilterOpen(true)} className="flex items-center gap-2 px-4 py-2 border rounded bg-white hover:bg-gray-100">
          <FiFilter size={18} /> ตัวกรอง
        </button>
      </div>

      {/* ตารางแสดงข้อมูล */}
      <div className="bg-white p-4 rounded shadow-md">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-3 text-left">วัน/เดือน/ปี</th>
              <th className="p-3 text-left">หมวดหมู่</th>
              <th className="p-3 text-left">รูปภาพ</th>
              <th className="p-3 text-left">ชื่อ</th>
              <th className="p-3 text-left">สถานที่พบ</th>
              <th className="p-3 text-left">การจัดการ</th>
            </tr>
          </thead>
          <tbody>
            {historyData.map((item, index) => (
              <tr key={index} className="border-t hover:bg-red-100 transition-colors">
                <td className="p-3">{item.date}</td>
                <td className="p-3">{item.category}</td>
                <td className="p-3">
                  <img src={`/assets/${item.image}`} alt="evidence" className="w-10 h-10" />
                </td>
                <td className="p-3">{item.name}</td>
                <td className="p-3">{item.location}</td>
                <td className="p-3 flex gap-2">
                  <button className="p-2 text-blue-600 hover:text-blue-800"><FiEye size={18} /></button>
                  <button className="p-2 text-yellow-600 hover:text-yellow-800"><FiEdit size={18} /></button>
                  <button className="p-2 text-red-600 hover:text-red-800"><FiTrash size={18} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/*Filter Popup */}
      {isFilterOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded shadow-lg w-[450px]">
            <h2 className="text-lg font-semibold mb-4 text-center">เลือกตัวกรองผลลัพธ์</h2>

            {/* หมวดหมู่ */}
            <div className="mb-4">
              <p className="font-medium mb-2"><b>หมวดหมู่</b></p>
              <div className="flex gap-4">
                <label><input type="checkbox" className="mr-2" /> อาวุธปืน</label>
                <label><input type="checkbox" className="mr-2" /> ยาเสพติด</label>
              </div>
            </div>

            {/* วัน/เดือน/ปี */}
            <div className="mb-4">
              <p className="font-medium mb-2"><b>วัน/เดือน/ปี</b></p>
              <input type="date" className="w-full p-2 border rounded" />
            </div>

            {/* จังหวัด/อำเภอ/ตำบล + ปุ่มเลือกจากแผนที่ */}
            <div className="mb-4">
              <p className="font-medium mb-2"><b>จังหวัด/อำเภอ/ตำบล</b></p>
              <div className="grid grid-cols-3 gap-2 mb-2">
                <select className="border p-2 rounded">
                  <option>เลือกจังหวัด</option>
                </select>
                <select className="border p-2 rounded">
                  <option>เลือกอำเภอ</option>
                </select>
                <select className="border p-2 rounded">
                  <option>เลือกตำบล</option>
                </select>
              </div>
              {/* ปุ่มเลือกจากแผนที่ */}
              <button
                onClick={() => navigate("/map")} 
                className="px-4 py-2 border rounded bg-white text-black flex items-center gap-2 hover:bg-gray-100"
              >
                <FiMapPin size={18} /> เลือกจากแผนที่
              </button>
            </div>

            {/* ปุ่ม กรอง & ล้าง */}
            <div className="flex gap-2">
              <button
                className="flex-1 px-4 py-2 border-2 border-red-500 text-red-500 rounded hover:bg-red-100"
                onClick={() => setIsFilterOpen(false)}
              >
                ล้างการคัดกรองทั้งหมด
              </button>
              <button className="flex-1 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
                คัดกรองผลลัพธ์
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default History;
