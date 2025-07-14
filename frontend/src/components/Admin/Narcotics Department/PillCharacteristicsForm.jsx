import React from 'react';

const PillCharacteristicsForm = ({ pillData, setPillData }) => {
    return (
        <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-medium mb-5">ลักษณะเม็ดยา</h2>
            
            {/* Visual characteristics - first row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
                <div>
                    {/* ✅ เปลี่ยนจาก "ตัวพิมพ์" เป็น "ลักษณะ" */}
                    <label className="block text-sm font-medium text-gray-700 mb-2">ลักษณะ</label>
                    <input 
                        type="text" 
                        value={pillData.characteristics || ""}
                        onChange={(e) => setPillData({...pillData, characteristics: e.target.value})}
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-[#990000] transition-all duration-200"
                        placeholder="ระบุลักษณะเม็ดยา"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">รูปทรง</label>
                    <input 
                        type="text" 
                        value={pillData.edge_shape || ""}
                        onChange={(e) => setPillData({...pillData, edge_shape: e.target.value})}
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-[#990000] transition-all duration-200"
                        placeholder="ระบุรูปทรงเม็ดยา"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">สี</label>
                    <input 
                        type="text" 
                        value={pillData.color || ""}
                        onChange={(e) => setPillData({...pillData, color: e.target.value})}
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-[#990000] transition-all duration-200"
                        placeholder="ระบุสีของเม็ดยา"
                    />
                </div>
            </div>
        
            {/* Measurements - second row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-5">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">เส้นผ่านศูนย์กลาง (มม.)</label>
                    <div className="relative">
                        <input 
                            type="number" 
                            step="0.1"
                            min="0"
                            value={pillData.diameter_mm || ""}
                            onChange={(e) => setPillData({...pillData, diameter_mm: e.target.value})}
                            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-[#990000] transition-all duration-200"
                            placeholder="0.0"
                        />
                        <span className="absolute right-3 top-3 text-gray-500">มม.</span>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">ความหนา (มม.)</label>
                    <div className="relative">
                        <input 
                            type="number"
                            step="0.1"
                            min="0" 
                            value={pillData.thickness_mm || ""}
                            onChange={(e) => setPillData({...pillData, thickness_mm: e.target.value})}
                            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-[#990000] transition-all duration-200"
                            placeholder="0.0"
                        />
                        <span className="absolute right-3 top-3 text-gray-500">มม.</span>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">ความกว้างขอบ (มม.)</label>
                    <div className="relative">
                        <input 
                            type="number"
                            step="0.1"
                            min="0" 
                            value={pillData.edge_width_mm || ""}
                            onChange={(e) => setPillData({...pillData, edge_width_mm: e.target.value})}
                            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-[#990000] transition-all duration-200"
                            placeholder="0.0"
                        />
                        <span className="absolute right-3 top-3 text-gray-500">มม.</span>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">น้ำหนัก (มก.)</label>
                    <div className="relative">
                        <input 
                            type="number"
                            step="0.1"
                            min="0" 
                            value={pillData.weight_mg || ""}
                            onChange={(e) => setPillData({...pillData, weight_mg: e.target.value})}
                            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-[#990000] transition-all duration-200"
                            placeholder="0.0"
                        />
                        <span className="absolute right-3 top-3 text-gray-500">มก.</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PillCharacteristicsForm;