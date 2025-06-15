import React, { useState, useEffect } from 'react';
import { useEvidence } from '../../context/EvidenceContext';

const EvidenceList = () => {
  const { 
    fetchAllHistory, 
    evidenceHistory, 
    isLoading, 
    error 
  } = useEvidence();
  
  const [filters, setFilters] = useState({
    type: '',
    date_from: '',
    date_to: ''
  });
  
  useEffect(() => {
    // โหลดข้อมูลเมื่อคอมโพเนนต์ถูกเรียกขึ้นมา
    fetchAllHistory();
  }, [fetchAllHistory]);
  
  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };
  
  const applyFilters = () => {
    fetchAllHistory(filters);
  };
  
  const resetFilters = () => {
    setFilters({
      type: '',
      date_from: '',
      date_to: ''
    });
    fetchAllHistory();
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md mb-4">
      <h2 className="text-xl font-semibold mb-4">รายการประวัติวัตถุพยาน</h2>
      
      {/* ตัวกรอง */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1">ประเภท</label>
          <select
            name="type"
            value={filters.type}
            onChange={handleFilterChange}
            className="w-full border rounded py-2 px-3"
          >
            <option value="">ทั้งหมด</option>
            <option value="firearm">อาวุธปืน</option>
            <option value="pill">ยาเสพติด</option>
            <option value="other">อื่น ๆ</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">วันที่เริ่มต้น</label>
          <input
            type="date"
            name="date_from"
            value={filters.date_from}
            onChange={handleFilterChange}
            className="w-full border rounded py-2 px-3"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">วันที่สิ้นสุด</label>
          <input
            type="date"
            name="date_to"
            value={filters.date_to}
            onChange={handleFilterChange}
            className="w-full border rounded py-2 px-3"
          />
        </div>
      </div>
      
      <div className="flex gap-2 mb-6">
        <button
          onClick={applyFilters}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          กรองข้อมูล
        </button>
        
        <button
          onClick={resetFilters}
          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
        >
          รีเซ็ต
        </button>
      </div>
      
      {/* แสดงข้อผิดพลาด */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      )}
      
      {/* สถานะการโหลด */}
      {isLoading ? (
        <div className="text-center p-4">
          <p>กำลังโหลดข้อมูล...</p>
        </div>
      ) : (
        evidenceHistory.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-2 px-4 border-b text-left">ID</th>
                  <th className="py-2 px-4 border-b text-left">ประเภท</th>
                  <th className="py-2 px-4 border-b text-left">รายละเอียด</th>
                  <th className="py-2 px-4 border-b text-left">วันที่</th>
                  <th className="py-2 px-4 border-b text-left">ผู้บันทึก</th>
                  <th className="py-2 px-4 border-b text-center">ดูข้อมูล</th>
                </tr>
              </thead>
              <tbody>
                {evidenceHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="py-2 px-4 border-b">{item.id}</td>
                    <td className="py-2 px-4 border-b">{item.type}</td>
                    <td className="py-2 px-4 border-b">{item.details}</td>
                    <td className="py-2 px-4 border-b">{new Date(item.created_at).toLocaleDateString()}</td>
                    <td className="py-2 px-4 border-b">{item.user_name}</td>
                    <td className="py-2 px-4 border-b text-center">
                      <button 
                        className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-sm"
                        onClick={() => handleViewDetails(item.id)}
                      >
                        ดูรายละเอียด
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center p-4 bg-gray-50 rounded">
            <p>ไม่พบข้อมูลวัตถุพยาน</p>
          </div>
        )
      )}
    </div>
  );
};

const EvidenceDetail = () => {
  const [selectedHistoryId, setSelectedHistoryId] = useState(null);
  const [historyDetail, setHistoryDetail] = useState(null);
  const { fetchHistoryById, isLoading } = useEvidence();
  
  // ฟังก์ชันสำหรับการดูรายละเอียด
  const handleViewDetails = (id) => {
    setSelectedHistoryId(id);
  };
  
  useEffect(() => {
    if (selectedHistoryId) {
      const loadDetails = async () => {
        const detail = await fetchHistoryById(selectedHistoryId);
        setHistoryDetail(detail);
      };
      
      loadDetails();
    }
  }, [selectedHistoryId, fetchHistoryById]);
  
  if (!selectedHistoryId || !historyDetail) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">รายละเอียดวัตถุพยาน</h2>
        <p className="text-gray-500">เลือกวัตถุพยานเพื่อดูรายละเอียด</p>
      </div>
    );
  }
  
  if (isLoading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">รายละเอียดวัตถุพยาน</h2>
        <p>กำลังโหลดข้อมูล...</p>
      </div>
    );
  }
  
  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">รายละเอียดวัตถุพยาน</h2>
        <button 
          className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm"
          onClick={() => setSelectedHistoryId(null)}
        >
          ปิด
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 className="font-medium mb-2">ข้อมูลทั่วไป</h3>
          <div className="bg-gray-50 p-4 rounded">
            <p className="mb-1"><strong>ID: </strong>{historyDetail.id}</p>
            <p className="mb-1"><strong>ประเภท: </strong>{historyDetail.type}</p>
            <p className="mb-1"><strong>รายละเอียด: </strong>{historyDetail.details}</p>
            <p className="mb-1">
              <strong>วันที่บันทึก: </strong>
              {new Date(historyDetail.created_at).toLocaleString()}
            </p>
            <p><strong>ผู้บันทึก: </strong>{historyDetail.user_name}</p>
          </div>
        </div>
        
        <div>
          <h3 className="font-medium mb-2">ข้อมูลวัตถุพยาน</h3>
          <div className="bg-gray-50 p-4 rounded">
            {historyDetail.image_url && (
              <div className="mb-3">
                <p className="mb-1"><strong>รูปภาพ:</strong></p>
                <img 
                  src={historyDetail.image_url} 
                  alt="Evidence" 
                  className="max-w-full h-auto max-h-40 rounded border"
                />
              </div>
            )}
            
            {historyDetail.location && (
              <>
                <p className="mb-1"><strong>สถานที่: </strong>{historyDetail.location}</p>
              </>
            )}
            
            {historyDetail.analysis_results && (
              <div className="mt-2">
                <p className="font-medium">ผลการวิเคราะห์:</p>
                <pre className="bg-gray-100 p-2 rounded text-sm mt-1 overflow-x-auto max-h-40">
                  {JSON.stringify(historyDetail.analysis_results, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {historyDetail.notes && (
        <div className="mt-4">
          <h3 className="font-medium mb-2">หมายเหตุ</h3>
          <div className="bg-gray-50 p-4 rounded">
            <p>{historyDetail.notes}</p>
          </div>
        </div>
      )}
    </div>
  );
};

// สร้าง global function เพื่อให้ทั้ง EvidenceList และ EvidenceDetail ใช้ร่วมกันได้
window.handleViewDetails = (id) => {
  // ใช้วิธีนี้เพื่อให้ตัวอย่างทำงานได้จริง (แต่ในโค้ดจริงควรใช้ context หรือ state management)
  document.dispatchEvent(new CustomEvent('viewEvidence', { detail: id }));
};

const EvidenceContextExample = () => {
  const [selectedId, setSelectedId] = useState(null);
  
  useEffect(() => {
    const handleViewEvidence = (e) => {
      setSelectedId(e.detail);
    };
    
    document.addEventListener('viewEvidence', handleViewEvidence);
    
    return () => {
      document.removeEventListener('viewEvidence', handleViewEvidence);
    };
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">ตัวอย่างการใช้งาน EvidenceContext</h1>
      <p className="mb-4">
        คอมโพเนนต์นี้แสดงตัวอย่างการใช้งาน EvidenceContext ในการจัดการข้อมูลวัตถุพยานและประวัติ
      </p>
      
      <EvidenceList />
      <EvidenceDetail historyId={selectedId} />
    </div>
  );
};

export default EvidenceContextExample;