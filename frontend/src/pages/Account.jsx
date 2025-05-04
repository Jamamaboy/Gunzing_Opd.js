import React, { useState, useEffect } from 'react';
import { FiEye, FiEdit, FiTrash } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const mockUsers = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  username: `user${i + 1}`,
  role: i < 3 ? 'admin' : 'user',
  name: `อ.ด. สมมุติ คนที่ ${i + 1}`,
  department: i % 2 === 0 ? 'แผนกยาเสพติด' : 'แผนกปืน',
}));

const rowsPerPageOptions = [5, 10, 20];

const Account = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [hoveredRow, setHoveredRow] = useState(null);

  const totalPages = Math.ceil(mockUsers.length / rowsPerPage);
  const indexOfLast = currentPage * rowsPerPage;
  const indexOfFirst = indexOfLast - rowsPerPage;
  const currentUsers = mockUsers.slice(indexOfFirst, indexOfLast);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const userRole = localStorage.getItem('userRole');
  if (userRole !== 'admin') return null;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-lg font-semibold">จัดการผู้ใช้</h1>
        <button className="px-3 py-2 rounded bg-[#b30000] text-white hover:bg-[#990000] text-sm font-medium">
          + เพิ่มผู้ใช้ใหม่
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse table-fixed shadow rounded">
          <thead className="bg-gray-100 text-sm">
            <tr>
              <th className="p-3 text-left w-[15%]">รหัสประจำตัวผู้ใช้</th>
              <th className="p-3 text-left w-[10%]">รูปโปรไฟล์</th>
              <th className="p-3 text-left w-[10%]">ตำแหน่ง</th>
              <th className="p-3 text-left w-[25%]">ชื่อ-นามสกุล</th>
              <th className="p-3 text-left w-[25%]">ประเภทการใช้งาน</th>
              <th className="p-3 text-left w-[15%]">การจัดการ</th>
            </tr>
          </thead>
          <tbody>
            {currentUsers.map((user, index) => (
              <tr
                key={user.id}
                onMouseEnter={() => setHoveredRow(index)}
                onMouseLeave={() => setHoveredRow(null)}
                className={`border-t text-sm transition-colors duration-150 ${
                  hoveredRow === index ? 'bg-red-100' : ''
                }`}
              >
                <td className="p-3 font-mono">{user.username}</td>
                <td className="p-3">
                  <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white">
                    👤
                  </div>
                </td>
                <td className="p-3">{user.role}</td>
                <td className="p-3">{user.name}</td>
                <td className="p-3">{user.department}</td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <button className="text-blue-600 hover:text-blue-800">
                      <FiEye />
                    </button>
                    <button className="text-purple-600 hover:text-purple-800">
                      <FiEdit />
                    </button>
                    <button className="text-red-600 hover:text-red-800">
                      <FiTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center text-sm mt-4 bg-[#e6f0fa] py-2 px-4 rounded-b-lg border-t">
        {/* Left: Showing range */}
        <span className="text-gray-600">
          {indexOfFirst + 1}-{Math.min(indexOfLast, mockUsers.length)} จาก {mockUsers.length}
        </span>

        {/* Middle: Rows per page */}
        <div className="flex items-center text-gray-600">
          <span className="mr-2">แถว ต่อ หน้า:</span>
          <select
            value={rowsPerPage}
            onChange={handleRowsPerPageChange}
            className="bg-transparent border-none text-gray-600 font-semibold focus:outline-none cursor-pointer"
          >
            {rowsPerPageOptions.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>

        {/* Right: Page controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
            className={`p-1 rounded ${currentPage === 1 ? "text-gray-400 cursor-not-allowed" : "text-gray-600 hover:bg-gray-200"}`}
          >
            &#171;
          </button>
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`p-1 rounded ${currentPage === 1 ? "text-gray-400 cursor-not-allowed" : "text-gray-600 hover:bg-gray-200"}`}
          >
            &#8249;
          </button>
          <span className="font-semibold px-1">
            <span className="text-black">{currentPage}</span>
            <span className="px-1 text-gray-400">/</span>
            <span className="text-gray-500">{totalPages}</span>
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`p-1 rounded ${currentPage === totalPages ? "text-gray-400 cursor-not-allowed" : "text-gray-600 hover:bg-gray-200"}`}
          >
            &#8250;
          </button>
          <button
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages}
            className={`p-1 rounded ${currentPage === totalPages ? "text-gray-400 cursor-not-allowed" : "text-gray-600 hover:bg-gray-200"}`}
          >
            &#187;
          </button>
        </div>
      </div>
    </div>
  );
};

export default Account;

