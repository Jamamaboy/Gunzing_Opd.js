import React from 'react';

const PackageCharacteristicsForm = ({ packageData, setPackageData }) => {
    return (
        <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-medium mb-5">ลักษณะหีบห่อ</h2>
            
            {/* Package characteristics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-5">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">รูปแบบการห่อหุ้ม</label>
                    <input 
                        type="text" 
                        value={packageData?.packageType || ""}
                        onChange={(e) => setPackageData({...packageData, packageType: e.target.value})}
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-[#990000] transition-all duration-200"
                        placeholder="ระบุรูปแบบการห่อหุ้ม"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">วัสดุที่ใช้</label>
                    <input 
                        type="text" 
                        value={packageData?.packageMaterial || ""}
                        onChange={(e) => setPackageData({...packageData, packageMaterial: e.target.value})}
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-[#990000] transition-all duration-200"
                        placeholder="ระบุวัสดุที่ใช้ในการห่อหุ้ม"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">สีของบรรจุภัณฑ์</label>
                    <input 
                        type="text" 
                        value={packageData?.packageColor || ""}
                        onChange={(e) => setPackageData({...packageData, packageColor: e.target.value})}
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-[#990000] transition-all duration-200"
                        placeholder="ระบุสีของบรรจุภัณฑ์"
                    />
                </div>
            </div>
        </div>
    );
};

export default PackageCharacteristicsForm;