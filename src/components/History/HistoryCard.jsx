import React, { useState } from "react";
import { FiMapPin, FiCalendar, FiTag } from "react-icons/fi";

const sampleData = [
  {
    name: "Glock",
    category: "อาวุธปืน",
    date: "164/2/2568",
    location: "จังหวัด • อำเภอ • ตำบล",
    image: "/assets/gun.png",
  },
  // เพิ่มอีก 9 อัน
  {
    name: "Glock",
    category: "อาวุธปืน",
    date: "14/2/2568",
    location: "จังหวัด • อำเภอ • ตำบล",
    image: "/assets/gun.png",
  },
  {
    name: "Glock",
    category: "อาวุธปืน",
    date: "15/2/2568",
    location: "จังหวัด • อำเภอ • ตำบล",
    image: "/assets/gun.png",
  },
  {
    name: "Glock",
    category: "อาวุธปืน",
    date: "16/2/2568",
    location: "จังหวัด • อำเภอ • ตำบล",
    image: "/assets/gun.png",
  },
  {
    name: "Glock",
    category: "อาวุธปืน",
    date: "17/2/2568",
    location: "จังหวัด • อำเภอ • ตำบล",
    image: "/assets/gun.png",
  },
  {
    name: "Glock",
    category: "อาวุธปืน",
    date: "18/2/2568",
    location: "จังหวัด • อำเภอ • ตำบล",
    image: "/assets/gun.png",
  },
  {
    name: "Glock",
    category: "อาวุธปืน",
    date: "19/2/2568",
    location: "จังหวัด • อำเภอ • ตำบล",
    image: "/assets/gun.png",
  },
  {
    name: "Glock",
    category: "อาวุธปืน",
    date: "20/2/2568",
    location: "จังหวัด • อำเภอ • ตำบล",
    image: "/assets/gun.png",
  },
  {
    name: "Glock",
    category: "อาวุธปืน",
    date: "21/2/2568",
    location: "จังหวัด • อำเภอ • ตำบล",
    image: "/assets/gun.png",
  },
];

const Tab = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`pb-2 px-4 border-b-2 font-bold text-sm transition-all duration-200 ${
      active ? "text-black border-[#b30000]" : "text-gray-500 border-transparent"
    }`}
  >
    {label}
  </button>
);

const HistoryCard = () => {
  const [activeTab, setActiveTab] = useState("ประวัติ");

  return (
    <div className="p-6">
    <h1 className="text-xl font-bold">กำลังแสดงหน้า History Card</h1>

      {/* Tabs */}
      <div className="flex space-x-4 border-b mb-6">
        {['ข้อมูลเบื้องต้น', 'คลังภาพ', 'กระสุน', 'ประวัติ', 'แผนที่'].map((tab) => (
          <Tab key={tab} label={tab} active={tab === activeTab} onClick={() => setActiveTab(tab)} />
        ))}
      </div>

      {/* Filter */}
      <div className="flex items-center space-x-4 mb-6">
        <select className="border rounded px-4 py-2">
          <option>หมวดหมู่</option>
        </select>
        <select className="border rounded px-4 py-2">
          <option>ช่วงเวลา</option>
        </select>
        <select className="border rounded px-4 py-2">
          <option>สถานที่</option>
        </select>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sampleData.map((item, idx) => (
          <div
            key={idx}
            className="border rounded-lg p-4 shadow flex flex-col items-start space-y-2 relative"
          >
            <img src={item.image} alt={item.name} className="w-32 h-24 object-contain" />
            <div className="font-bold text-lg">{item.name}</div>
            <div className="flex items-center gap-2 text-gray-600">
              <FiTag /> {item.category}
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <FiCalendar /> {item.date}
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <FiMapPin /> {item.location}
            </div>
            <button className="absolute bottom-4 right-4 px-4 py-1 bg-[#7a0000] text-white rounded hover:bg-[#5a0000] text-sm">
              ดูรายละเอียด
            </button>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4 mt-8">
        <button className="px-6 py-2 border border-[#7a0000] text-[#7a0000] rounded hover:bg-red-100">
          ถ่ายใหม่
        </button>
        <button className="px-6 py-2 bg-[#7a0000] text-white rounded hover:bg-[#5a0000]">
          บันทึกประวัติ
        </button>
      </div>
    </div>
  );
};

export default HistoryCard;
