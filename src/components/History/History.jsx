import React, { useState } from "react";
import { FiFilter, FiPlus, FiEye, FiEdit, FiTrash } from "react-icons/fi";

const FilterPopup = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-[650px] shadow-lg">
        <h2 className="text-2xl font-semibold text-center mb-4">เลือกตัวกรองผลลัพธ์</h2>

        {/*  หมวดหมู่ */}
        <div className="mb-4 border-b pb-4 flex items-center">
          <label className="font-semibold w-[30%]">หมวดหมู่</label>
          <div className="flex gap-6">
            <label className="flex items-center gap-2">
              <input type="checkbox" className="w-4 h-4" /> อาวุธปืน
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="w-4 h-4" /> ยาเสพติด
            </label>
          </div>
        </div>

        {/*  วัน/เดือน/ปี */}
        <div className="mb-4 border-b pb-4 flex items-center">
          <label className="font-semibold w-[30%]">วัน/เดือน/ปี</label>
          <div className="grid grid-cols-3 gap-4">
            <label className="flex items-center gap-2">
              <input type="checkbox" className="w-4 h-4" /> วันนี้
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="w-4 h-4" /> 7 วันล่าสุด
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="w-4 h-4" /> 1 เดือนล่าสุด
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="w-4 h-4" /> 6 เดือนล่าสุด
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="w-4 h-4" /> 1 ปีล่าสุด
            </label>
          </div>
        </div>

        {/*  กำหนดเอง */}
        <div className="mb-4 border-b pb-4 flex items-center">
          <label className="font-semibold w-[30%]">กำหนดเอง</label>
          <input type="date" className="p-2 border rounded-lg w-[60%]" placeholder="เลือกวันที่ --/--/----" />
        </div>

        {/*  จังหวัด/อำเภอ/ตำบล */}
        <div className="mb-4">
          <label className="block font-semibold mb-2">จังหวัด/อำเภอ/ตำบล</label>
          <div className="flex justify-between items-center mb-2">
            <button className="px-4 py-2 border rounded-lg bg-white hover:bg-gray-100">เลือกจากแผนที่</button>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <select className="p-2 border rounded-lg w-full">
              <option>กรุณาเลือกจังหวัด</option>
            </select>
            <select className="p-2 border rounded-lg w-full">
              <option>กรุณาเลือกอำเภอ</option>
            </select>
            <select className="p-2 border rounded-lg w-full">
              <option>กรุณาเลือกตำบล</option>
            </select>
          </div>
        </div>

        {/*  ปุ่ม */}
        <div className="flex justify-between mt-4">
          <button onClick={onClose} className="px-4 py-2 border rounded-lg text-[#b30000] border-[#b30000] hover:bg-red-100">
            ล้างการคัดกรองทั้งหมด
          </button>
          <button className="px-4 py-2 rounded-lg bg-[#b30000] text-white hover:bg-[#990000]">
            คัดกรองผลลัพธ์
          </button>
        </div>
      </div>
    </div>
  );
};

const History = () => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // ตัวอย่างข้อมูล (คละระหว่าง "อาวุธปืน" และ "ยาเสพติด")
  const historyData = [
    { date: "13/2/2568", category: "อาวุธปืน", image: "gun.png", name: "Glock", location: "จังหวัด, อำเภอ, ตำบล" },
    { date: "13/2/2568", category: "ยาเสพติด", image: "drug.png", name: "WY", location: "จังหวัด, อำเภอ, ตำบล" },
    { date: "14/2/2568", category: "อาวุธปืน", image: "gun.png", name: "M16", location: "จังหวัด, อำเภอ, ตำบล" },
    { date: "14/2/2568", category: "ยาเสพติด", image: "drug.png", name: "Meth", location: "จังหวัด, อำเภอ, ตำบล" },
    { date: "15/2/2568", category: "อาวุธปืน", image: "gun.png", name: "AK-47", location: "จังหวัด, อำเภอ, ตำบล" },
    { date: "15/2/2568", category: "ยาเสพติด", image: "drug.png", name: "Cocaine", location: "จังหวัด, อำเภอ, ตำบล" },
    { date: "16/2/2568", category: "อาวุธปืน", image: "gun.png", name: "Desert Eagle", location: "จังหวัด, อำเภอ, ตำบล" },
    { date: "16/2/2568", category: "ยาเสพติด", image: "drug.png", name: "Heroin", location: "จังหวัด, อำเภอ, ตำบล" },
    { date: "17/2/2568", category: "อาวุธปืน", image: "gun.png", name: "Shotgun", location: "จังหวัด, อำเภอ, ตำบล" },
    { date: "17/2/2568", category: "ยาเสพติด", image: "drug.png", name: "Ecstasy", location: "จังหวัด, อำเภอ, ตำบล" },
    { date: "18/2/2568", category: "อาวุธปืน", image: "gun.png", name: "Uzi", location: "จังหวัด, อำเภอ, ตำบล" },
    { date: "18/2/2568", category: "ยาเสพติด", image: "drug.png", name: "LSD", location: "จังหวัด, อำเภอ, ตำบล" },
    { date: "19/2/2568", category: "อาวุธปืน", image: "gun.png", name: "FN SCAR", location: "จังหวัด, อำเภอ, ตำบล" },
    { date: "19/2/2568", category: "ยาเสพติด", image: "drug.png", name: "Ketamine", location: "จังหวัด, อำเภอ, ตำบล" },
    { date: "20/2/2568", category: "อาวุธปืน", image: "gun.png", name: "Beretta", location: "จังหวัด, อำเภอ, ตำบล" },
    { date: "20/2/2568", category: "ยาเสพติด", image: "drug.png", name: "Fentanyl", location: "จังหวัด, อำเภอ, ตำบล" },
    { date: "21/2/2568", category: "อาวุธปืน", image: "gun.png", name: "Sig Sauer", location: "จังหวัด, อำเภอ, ตำบล" },
    { date: "21/2/2568", category: "ยาเสพติด", image: "drug.png", name: "Oxycodone", location: "จังหวัด, อำเภอ, ตำบล" },
    { date: "22/2/2568", category: "อาวุธปืน", image: "gun.png", name: "Remington 700", location: "จังหวัด, อำเภอ, ตำบล" },
    { date: "22/2/2568", category: "ยาเสพติด", image: "drug.png", name: "GHB", location: "จังหวัด, อำเภอ, ตำบล" },
  ];


  // คำนวณหน้าปัจจุบัน
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = historyData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(historyData.length / itemsPerPage);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/*  Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">ประวัติการพบวัตถุพยาน</h1>
      </div>

      {/* ปรับปุ่มให้เป็นแถวเดียวกัน */}
      <div className="flex justify-between items-center mb-4">
        {/* ปุ่มตัวกรอง */}
        <button 
          onClick={() => setIsFilterOpen(true)} 
          className="flex items-center gap-2 px-4 py-2 border rounded bg-white hover:bg-gray-100"
        >
          <FiFilter size={18} /> ตัวกรอง
        </button>

        {/* ปุ่มเพิ่มประวัติการค้นพบ (อยู่ฝั่งขวา) */}
        <button className="flex items-center gap-2 px-4 py-2 rounded bg-[#b30000] text-white hover:bg-[#990000]">
          <FiPlus size={18} /><b> เพิ่มประวัติการค้นพบ</b>
        </button>
      </div>
      <FilterPopup isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} />
        

      {/* ตารางแสดงข้อมูล (Fixed Layout ไม่ให้ขยับ) */}
      <div className="bg-white p-4 rounded shadow-md">
        <table className="w-full table-fixed border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-3 text-left w-[15%]">วัน/เดือน/ปี</th>
              <th className="p-3 text-left w-[15%]">หมวดหมู่</th>
              <th className="p-3 text-left w-[10%]">รูปภาพ</th>
              <th className="p-3 text-left w-[20%]">ชื่อ</th>
              <th className="p-3 text-left w-[25%]">สถานที่พบ</th>
              <th className="p-3 text-left w-[15%]">การจัดการ</th>
            </tr>
          </thead>
          <tbody className="min-h-[500px]">
            {currentItems.map((item, index) => (
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
                  <button className="p-2 text-[#ff9900] hover:text-[#cc7a00]"><FiEdit size={18} /></button>
                  <button className="p-2 text-red-600 hover:text-red-800"><FiTrash size={18} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination (เพิ่มสีตัวหนาให้เหมือนที่ต้องการ) */}
      <div className="w-full bg-[#e6f0fa] py-2 px-4 flex justify-between items-center text-gray-700 font-bold rounded-lg border-t">
        {/* ซ้าย: ข้อมูลจำนวนรายการ */}
        <span className="pl-4 text-gray-600"> {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, historyData.length)} จาก {historyData.length} </span>

        {/* กลาง: ตัวเลือกจำนวนแถวต่อหน้า */}
        <div className="flex items-center text-gray-600">
          <span className="mr-2">แถว ต่อ หน้า:</span>
          <select
            className="bg-transparent border-none text-gray-600 font-bold focus:outline-none cursor-pointer"
            value={itemsPerPage}
            onChange={(e) => setCurrentPage(1)}
          >
            <option value="10">10</option>
          </select>
        </div>
        {/* ปุ่มเปลี่ยนหน้า */}
        <div className="flex items-center gap-2 pr-[5.5rem]">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(1)}
            className={'p-1 rounded ${currentPage === 1 ? "text-gray-400" : "text-gray-600 hover:bg-gray-200"}'}
          >
            ⏮
          </button>

          {/* เลขหน้าปัจจุบันเป็นตัวหนาสีดำ และ หน้าทั้งหมดเป็นตัวหนาสีเทา */}
          <span className="font-bold">
            <span className="text-black">{currentPage}</span>
            <span className="px-1">/</span>
            <span className="text-gray-500">{totalPages}</span>
          </span>

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            className={'p-1 rounded ${currentPage === totalPages ? "text-gray-400" : "text-gray-600 hover:bg-gray-200"}'}
          >
            ⏭
          </button>
        </div>
      </div>
    </div>
  );
};

export default History;