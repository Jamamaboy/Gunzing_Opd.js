
import React, { useEffect, useState } from 'react';
import TabBar from './TabBar';
import { FiEye, FiEdit, FiTrash, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const dummyData = [
  { id: 1, name: 'Glock 19 Gen4', type: 'Gun', date: '1/5/2568', image: 'https://pngimg.com/d/glock_PNG1.png', location: 'กรุงเทพ, บางเขน, อนุสาวรีย์' },
  { id: 2, name: 'Glock 19 Gen5', type: 'Gun', date: '2/5/2568', image: 'https://pngimg.com/d/glock_PNG1.png', location: 'นนทบุรี, เมืองนนทบุรี, บางเขน' },
  { id: 3, name: 'WY', type: 'Drug', date: '3/5/2568', image: 'https://www.sangbadpratidin.in/wp-content/uploads/2019/09/yaba.jpg', location: 'เชียงใหม่, เมืองเชียงใหม่, สุเทพ' },
  { id: 4, name: 'Meth', type: 'Drug', date: '4/5/2568', image: 'https://www.sangbadpratidin.in/wp-content/uploads/2019/09/yaba.jpg', location: 'สงขลา, หาดใหญ่, คลองแห' },
  { id: 5, name: 'Glock 26 Gen4', type: 'Gun', date: '5/5/2568', image: 'https://pngimg.com/d/glock_PNG1.png', location: 'ชลบุรี, ศรีราชา, สุรศักดิ์' },
  { id: 6, name: 'AK-47', type: 'Gun', date: '6/5/2568', image: 'https://pngimg.com/d/glock_PNG1.png', location: 'ขอนแก่น, เมืองขอนแก่น, ในเมือง' },
  { id: 7, name: 'Cocaine', type: 'Drug', date: '7/5/2568', image: 'https://www.sangbadpratidin.in/wp-content/uploads/2019/09/yaba.jpg', location: 'ภูเก็ต, เมืองภูเก็ต, ตลาดใหญ่' },
  { id: 8, name: 'Desert Eagle', type: 'Gun', date: '8/5/2568', image: 'https://pngimg.com/d/glock_PNG1.png', location: 'ขอนแก่น, เมืองขอนแก่น, ในเมือง' },
];

const HistoryTab = () => {
  const [history, setHistory] = useState([]);
  const [filterName, setFilterName] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const isMobile = window.innerWidth < 768;

  useEffect(() => {
    setHistory(dummyData);
  }, []);

  const parseDate = (dateStr) => {
    const [day, month, year] = dateStr.split('/').map(Number);
    return new Date(year - 543, month - 1, day);
  };

  const filterByDate = (items) => {
    if (!dateFilter) return items;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (dateFilter === 'today') {
      return items.filter(item => parseDate(item.date).toDateString() === today.toDateString());
    } else if (dateFilter === 'last7') {
      const last7 = new Date(today);
      last7.setDate(today.getDate() - 7);
      return items.filter(item => parseDate(item.date) >= last7 && parseDate(item.date) <= today);
    } else if (dateFilter === 'last30') {
      const last30 = new Date(today);
      last30.setDate(today.getDate() - 30);
      return items.filter(item => parseDate(item.date) >= last30 && parseDate(item.date) <= today);
    }
    return items;
  };

  const uniqueNames = [...new Set(dummyData.map(item => item.name))];

  const filtered = filterByDate(
    filterName ? history.filter((item) => item.name === filterName) : history
  );

  const indexOfLastItem = currentPage * rowsPerPage;
  const indexOfFirstItem = indexOfLastItem - rowsPerPage;
  const currentItems = filtered.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filtered.length / rowsPerPage);

  const handlePageChange = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
  };

  return (
    <div className="h-full w-full">
      <TabBar />
      <div className="p-4">
        <div className="mb-4 flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <label className="text-gray-700">รุ่น:</label>
            <select
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
              className="border rounded px-3 py-1"
            >
              <option value="">ทั้งหมด</option>
              {uniqueNames.map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-gray-700">วันที่:</label>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="border rounded px-3 py-1"
            >
              <option value="">ทั้งหมด</option>
              <option value="today">วันนี้</option>
              <option value="last7">7 วันล่าสุด</option>
              <option value="last30">30 วันล่าสุด</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:hidden gap-4 pb-32">
          {currentItems.map((item) => (
            <div key={item.id} className="border p-4 rounded-lg shadow">
              <div className="flex justify-between">
                <h2 className="text-lg font-semibold text-[#990000]">{item.name}</h2>
                <span className="text-sm text-gray-500">{item.date}</span>
              </div>
              <img src={item.image} alt={item.name} className="w-full h-40 object-cover my-2" />
              <p className="text-sm">ประเภท: {item.type === 'Gun' ? 'อาวุธปืน' : 'ยาเสพติด'}</p>
              <p className="text-sm">สถานที่: {item.location}</p>
              <div className="mt-2 text-right">
                <button className="text-white bg-[#990000] px-3 py-1 rounded text-sm">ดูรายละเอียด</button>
              </div>
            </div>
          ))}
          <div className="fixed bottom-16 left-0 right-0 bg-white shadow p-2 flex flex-col border-t text-sm px-4">
            <div className="flex justify-between items-center w-full">
              <span>{indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filtered.length)} จาก {filtered.length}</span>
              <span>{currentPage}/{totalPages}</span>
            </div>
            <div className="flex items-center gap-2 justify-between mt-1">
              <div className="flex items-center gap-2 mx-auto">
                <span>แถว:</span>
                <select
                  className="border px-2 py-1"
                  value={rowsPerPage}
                  onChange={(e) => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                >
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="20">20</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="px-1">
                  <FiChevronLeft />
                </button>
                <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="px-1">
                  <FiChevronRight />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="hidden md:block overflow-x-auto w-full">
          <table className="w-full border-collapse min-w-full">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-2 text-left">วัน/เดือน/ปี</th>
                <th className="p-2 text-left">หมวดหมู่</th>
                <th className="p-2 text-left">รูปภาพ</th>
                <th className="p-2 text-left">ชื่อ</th>
                <th className="p-2 text-left">สถานที่พบ</th>
                <th className="p-2 text-left">การจัดการ</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((item) => (
                <tr key={item.id} className="border-t">
                  <td className="p-2 align-top">{item.date}</td>
                  <td className="p-2 align-top">{item.type === 'Gun' ? 'อาวุธปืน' : 'ยาเสพติด'}</td>
                  <td className="p-2 align-top"><img src={item.image} alt={item.name} className="w-10 h-10 object-contain" /></td>
                  <td className="p-2 align-top">{item.name}</td>
                  <td className="p-2 align-top">{item.location}</td>
                  <td className="p-2 align-top">
                    <div className="flex gap-1">
                      <button title="ดูรายละเอียด" className="text-blue-600 hover:bg-blue-100 p-1 rounded"><FiEye size={16} /></button>
                      <button title="แก้ไข" className="text-yellow-600 hover:bg-yellow-100 p-1 rounded"><FiEdit size={16} /></button>
                      <button title="ลบ" className="text-red-600 hover:bg-red-100 p-1 rounded"><FiTrash size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-4 flex flex-wrap justify-between items-center gap-4 text-sm bg-[#e6f0fa] px-4 py-2 rounded">
            <span>{indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filtered.length)} จาก {filtered.length}</span>
            <div className="flex items-center gap-2 mx-auto">
              <span>แถว:</span>
              <select
                className="border px-2 py-1"
                value={rowsPerPage}
                onChange={(e) => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }}
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="20">20</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => handlePageChange(1)} disabled={currentPage === 1} className="px-2">{'<<'}</button>
              <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="px-2">{'<'}</button>
              <span className="font-semibold">
                <span className="text-black">{currentPage}</span>
                <span className="text-gray-400"> / </span>
                <span className="text-gray-500">{totalPages}</span>
              </span>
              <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="px-2">{'>'}</button>
              <button onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages} className="px-2">{'>>'}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoryTab;

