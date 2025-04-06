import React, { useState } from "react";
import { FiEdit, FiTrash } from "react-icons/fi";

const History = () => {
  const [isHovering, setIsHovering] = useState(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const userData = [
    {
      userId: "adminxxxxxxxx",
      image: "/images/profile.png", // รูปตัวอย่าง
      request: "เปลี่ยนรหัสผ่าน",
      role: "admin",
      name: "ด.ต ไก่ บุญธรรม",
      department: "แผนกยาเสพติด",
    },
    {
      userId: "adminxxxxxxxx",
      image: "/images/profile.png",
      request: "เปลี่ยนรหัสผ่าน",
      role: "admin",
      name: "ด.ต ปลา บุญธรรม",
      department: "แผนอาวุธปืน",
    },
    {
      userId: "adminxxxxxxxx",
      image: "/images/profile.png",
      request: "เปลี่ยนรหัสผ่าน",
      role: "admin",
      name: "ด.ต เต่า บุญธรรม",
      department: "แผนอาวุธปืน",
    },
    {
      userId: "userxxxxxxxx",
      image: "/images/profile.png",
      request: "เปลี่ยนรหัสผ่าน",
      role: "user",
      name: "พล.อ ประหยัด จันทร์อังคารพุธ",
      department: "แผนอาวุธปืน",
    },
    {
      userId: "xxxxxxxxxxxx",
      image: "/images/profile.png",
      request: "เปลี่ยนรหัสผ่าน",
      role: "user",
      name: "พล.อ ประวัติ วงศ์สุพรรณ",
      department: "แผนอาวุธปืน",
    },
  ];

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = userData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(userData.length / itemsPerPage);

  return (
    <div className="p-6 bg-gray-100 min-h-screen relative">
      <h1 className="text-2xl font-semibold mb-4">การจัดการผู้ใช้งาน</h1>

      <div className="bg-white p-4 rounded shadow-md relative">
        <table className="w-full table-fixed border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-3 text-left w-[15%]">User ID</th>
              <th className="p-3 text-left w-[8%]">รูปภาพ</th>
              <th className="p-3 text-left w-[15%]">คำร้อง</th>
              <th className="p-3 text-left w-[10%]">ตำแหน่ง</th>
              <th className="p-3 text-left w-[20%]">ชื่อ-นามสกุล</th>
              <th className="p-3 text-left w-[25%]">ประเภทการใช้งาน</th>
              <th className="p-3 text-left w-[15%]">การจัดการ</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((item, index) => (
              <tr
                key={index}
                className="border-t bg-white hover:bg-red-100 transition-colors relative"
                onMouseEnter={() => setIsHovering(index)}
                onMouseLeave={() => setIsHovering(null)}
              >
                <td className="p-3">{item.userId}</td>
                <td className="p-3">
                  <img
                    src={item.image}
                    alt="User"
                    className="w-10 h-10 object-cover"
                  />
                </td>
                <td className="p-3">{item.request}</td>
                <td className="p-3">{item.role}</td>
                <td className="p-3">{item.name}</td>
                <td className="p-3">{item.department}</td>
                <td className="p-3 flex gap-2">
                  <button className="p-2 text-[#ff9900] hover:text-[#cc7a00]">
                    <FiEdit size={18} />
                  </button>
                  <button className="p-2 text-red-600 hover:text-red-800">
                    <FiTrash size={18} />
                  </button>
                </td>

                {/* Hover Preview */}
                {isHovering === index && (
                    <div className="absolute left-[150px] top-full mt-2 z-50 bg-white shadow-xl rounded-xl p-6 w-96 border border-gray-200">
                      <div className="flex items-start gap-4">
                        <img
                          src={item.image}
                          alt="User Preview"
                          className="w-24 h-24 object-cover  border"
                        />
                        <div>
                          <div className="text-xl font-bold mb-1">{item.name}</div>
                          <div className="text-gray-600 text-base mb-1">
                            <span className="font-semibold">ตำแหน่ง:</span> {item.role}
                          </div>
                          <div className="text-gray-600 text-base">
                            <span className="font-semibold">ประเภทการใช้งาน:</span> {item.department}
                          </div>
                        </div>
                      </div>
                  </div>
)}

              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination ยังใช้เหมือนเดิม */}
    </div>
  );
};

export default History;
