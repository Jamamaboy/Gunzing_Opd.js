import React, { useState } from 'react';
import TabBar from '../components/Map/TabBar';
import SphereMap from '../components/Map/SphereMap';

const Map = () => {
  const [viewType, setViewType] = useState('cases');
  const [filters, setFilters] = useState({
    meth: true,
    heroin: true, 
    cannabis: true,
    cocaine: true,
    ketamine: true
  });
  const [showElements, setShowElements] = useState({
    routes: true,
    distribution: true,
    hotspots: true
  });

  const handleFilterChange = (drugType) => {
    setFilters(prev => ({
      ...prev,
      [drugType]: !prev[drugType]
    }));
  };

  const handleElementVisibility = (element) => {
    setShowElements(prev => ({
      ...prev,
      [element]: !prev[element]
    }));
  };

  // Provincial drug case data
  const provinceData = [
    { province: 'กรุงเทพมหานคร', cases: 60 },
    { province: 'ชอนแก่น', cases: 35 },
    { province: 'ชัยนาท', cases: 25 },
    { province: 'นครปฐม', cases: 22 },
    { province: 'นครราชสีมา', cases: 15 },
    { province: 'ปทุมธานี', cases: 10 },
    { province: 'พิษณุโลก', cases: 8 },
    { province: 'ภูเก็ต', cases: 6 },
    { province: 'สงขลา', cases: 5 },
    { province: 'สระบุรี', cases: 4 },
    { province: 'อื่นๆ', cases: 3 }
  ];

  // Find max value for scaling the bars
  const maxCases = Math.max(...provinceData.map(item => item.cases));

  return (
    <div className="flex flex-col h-full">
      <TabBar />
      
      {/* Map section with increased height - now taking 90vh instead of 80vh */}
      <div className="flex h-[calc(90vh-6rem)] min-h-[665px]">
        <div className="flex flex-grow p-4 h-full">
          <div className="flex-grow min-w-0 border border-gray-300 rounded-md overflow-hidden relative">
            <SphereMap />
          </div>
          
          <div className="w-64 min-w-64 ml-4 bg-[#F5F5F5] rounded-md shadow-sm overflow-y-auto">
            <div className="border-b border-gray-200 py-3 px-4">
              <h3 className="text-lg font-medium text-center">สถิติคดียาเสพติด</h3>
            </div>
            
            <div className="p-3 flex gap-2 text-sm border-b border-gray-200">
              <button className="px-2 py-1 bg-gray-100 rounded-md hover:bg-gray-200">ทั่วประเทศ</button>
              <button className="px-2 py-1 bg-gray-100 rounded-md hover:bg-gray-200">7 วันล่าสุด</button>
              <button className="px-2 py-1 bg-gray-100 rounded-md hover:bg-gray-200">ทุกประเภท</button>
              <button className="px-2 py-1 bg-gray-100 rounded-md hover:bg-gray-200">คดี/พื้นที่</button>
            </div>
            
            <div className="p-3 border-b border-gray-200">
              <p className="text-lg font-medium">193 คดี</p>
            </div>
            
            <div className="p-3">
              <div className="flex justify-between mb-2">
                <p className="text-sm font-medium">จังหวัด</p>
                <p className="text-sm font-medium">จำนวนคดี</p>
              </div>
              
              {provinceData.map((item, index) => (
                <div className="flex items-center mb-2" key={index}>
                  <p className="text-sm w-24">{item.province}</p>
                  <p className="text-sm w-10">{item.cases}</p>
                  <div className="flex-grow">
                    <div 
                      className="h-4 rounded-sm" 
                      style={{ 
                        width: `${(item.cases / maxCases) * 100}%`,
                        backgroundColor: '#DBDBDB' 
                      }}
                    ></div>
                  </div>
                </div>
              ))}
              
              <div className="text-right mt-1">
                <button className="text-xs text-blue-600 hover:underline">ดูเพิ่มเติม</button>
              </div>
            </div>
            
            <div className="p-3 border-t border-gray-200">
              <div className="h-48 mb-2 flex items-center justify-center">
                {/* Placeholder for pie chart */}
                <svg viewBox="0 0 100 100" width="100%" height="100%">
                  <circle cx="50" cy="50" r="40" fill="#30d9e8" stroke="#fff" strokeWidth="1" />
                  <path d="M 50 50 L 50 10 A 40 40 0 0 1 86 64 Z" fill="#f39c12" stroke="#fff" strokeWidth="1" />
                  <path d="M 50 50 L 86 64 A 40 40 0 0 1 36 90 Z" fill="#e84393" stroke="#fff" strokeWidth="1" />
                </svg>
              </div>
              
              <div className="grid grid-cols-2 gap-1 text-xs">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-purple-400 mr-1"></div>
                  <span>Africa (11%)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-orange-400 mr-1"></div>
                  <span>Americas (27%)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-pink-400 mr-1"></div>
                  <span>Eastern Mediterranean</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-cyan-400 mr-1"></div>
                  <span>Europe (67%)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-400 mr-1"></div>
                  <span>South East Asia</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-400 mr-1"></div>
                  <span>Western Pacific</span>
                </div>
              </div>
            </div>
            
            {/* This section can be toggled as needed */}
            <div className="p-3 border-t border-gray-200 hidden">
              <h3 className="text-sm font-medium text-gray-700 mb-2">ประเภทยาเสพติด</h3>
              <div className="flex flex-col">
                {[
                  { id: 'meth', label: 'ยาบ้า/เมทแอมเฟตามีน' },
                  { id: 'heroin', label: 'เฮโรอีน' },
                  { id: 'cannabis', label: 'กัญชา' },
                  { id: 'cocaine', label: 'โคเคน' },
                  { id: 'ketamine', label: 'คีตามีน' }
                ].map(drug => (
                  <div className="flex items-center mb-1" key={drug.id}>
                    <input 
                      type="checkbox" 
                      id={drug.id} 
                      checked={filters[drug.id]} 
                      onChange={() => handleFilterChange(drug.id)}
                      className="mr-2"
                    />
                    <label htmlFor={drug.id} className="text-sm">{drug.label}</label>
                  </div>
                ))}
              </div>
            </div>
            
            {/* This section can be toggled as needed */}
            <div className="p-3 border-t border-gray-200 hidden">
              <h3 className="text-sm font-medium text-gray-700 mb-2">แสดงข้อมูล</h3>
              <div className="flex flex-col">
                {[
                  { id: 'routes', label: 'เส้นทางลำเลียง' },
                  { id: 'distribution', label: 'จุดกระจายสินค้า' },
                  { id: 'hotspots', label: 'พื้นที่วิกฤติ (Hot spots)' }
                ].map(element => (
                  <div className="flex items-center mb-1" key={element.id}>
                    <input 
                      type="checkbox" 
                      id={element.id} 
                      checked={showElements[element.id]} 
                      onChange={() => handleElementVisibility(element.id)}
                      className="mr-2"
                    />
                    <label htmlFor={element.id} className="text-sm">{element.label}</label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Chart section - appears when scrolling down */}
      <div className="px-4 py-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-72 h-72 border border-gray-300 rounded-md p-4">
            <h3 className="text-base text-center mb-2">จำนวนคดีที่จับกุมได้ตามประเภทยาเสพติด</h3>
            <div className="w-full h-56 bg-gray-100 flex items-center justify-center rounded">
              <div>กราฟแท่งแสดงจำนวนคดีแยกตามประเภทยาเสพติด</div>
            </div>
          </div>
          
          <div className="flex-1 min-w-72 h-72 border border-gray-300 rounded-md p-4">
            <h3 className="text-base text-center mb-2">น้ำหนักยาเสพติดที่จับกุมได้ (กิโลกรัม)</h3>
            <div className="w-full h-56 bg-gray-100 flex items-center justify-center rounded">
              <div>กราฟแท่งแสดงน้ำหนักยาเสพติดที่จับกุมได้</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Map;