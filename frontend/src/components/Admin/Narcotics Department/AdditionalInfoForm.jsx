import React from 'react';

const AdditionalInfoForm = ({ formData, setFormData }) => {
    return (
        <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-medium mb-5">ข้อมูลเพิ่มเติม</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">ชนิดยา</label>
                    <select
                        name="drugType"
                        value={formData.drugType}
                        onChange={(e) => setFormData({...formData, drugType: e.target.value})}
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-[#990000] transition-all duration-200"
                    >
                        <option value="">เลือกชนิดยาเสพติด</option>
                        <option value="methamphetamine">ยาบ้า (เมทแอมเฟตามีน)</option>
                        <option value="marijuana">กัญชา</option>
                        <option value="heroin">เฮโรอีน</option>
                        <option value="cocaine">โคเคน</option>
                        <option value="kratom">กระท่อม</option>
                        <option value="other">อื่นๆ</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">ประเภทของยาเสพติด</label>
                    <select
                        name="drugCategory"
                        value={formData.drugCategory}
                        onChange={(e) => setFormData({...formData, drugCategory: e.target.value})}
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-[#990000] transition-all duration-200"
                    >
                        <option value="">เลือกประเภทยาเสพติด</option>
                        <option value="stimulant">กระตุ้นประสาท</option>
                        <option value="depressant">กดประสาท</option>
                        <option value="hallucinogen">หลอนประสาท</option>
                        <option value="opioid">โอปิออยด์</option>
                        <option value="cannabis">กัญชาและอนุพันธ์</option>
                    </select>
                </div>
            </div>
            
            {/* วิธีการเสพ - Consumption Methods */}
            <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">วิธีการเสพ</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="flex items-center">
                        <input
                            id="smoking"
                            name="consumptionMethod"
                            type="checkbox"
                            className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                        />
                        <label htmlFor="smoking" className="ml-2 block text-sm text-gray-700">สูบ/สูดดม</label>
                    </div>
                    <div className="flex items-center">
                        <input
                            id="oral"
                            name="consumptionMethod"
                            type="checkbox"
                            className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                        />
                        <label htmlFor="oral" className="ml-2 block text-sm text-gray-700">รับประทาน</label>
                    </div>
                    <div className="flex items-center">
                        <input
                            id="injection"
                            name="consumptionMethod"
                            type="checkbox"
                            className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                        />
                        <label htmlFor="injection" className="ml-2 block text-sm text-gray-700">ฉีด</label>
                    </div>
                    <div className="flex items-center">
                        <input
                            id="other"
                            name="consumptionMethod"
                            type="checkbox"
                            className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                        />
                        <label htmlFor="other" className="ml-2 block text-sm text-gray-700">อื่นๆ</label>
                    </div>
                </div>
                <input
                    type="text"
                    placeholder="ระบุวิธีการเสพอื่นๆ (ถ้ามี)"
                    className="mt-2 w-full px-4 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-[#990000] transition-all duration-200"
                />
            </div>
            
            {/* ผลข้างเคียง - Side Effects */}
            <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">ผลข้างเคียงที่พบ</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
                    <div className="flex items-center">
                        <input
                            id="anxious"
                            name="sideEffects"
                            type="checkbox"
                            className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                        />
                        <label htmlFor="anxious" className="ml-2 block text-sm text-gray-700">วิตกกังวล</label>
                    </div>
                    <div className="flex items-center">
                        <input
                            id="paranoid"
                            name="sideEffects"
                            type="checkbox"
                            className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                        />
                        <label htmlFor="paranoid" className="ml-2 block text-sm text-gray-700">หวาดระแวง</label>
                    </div>
                    <div className="flex items-center">
                        <input
                            id="hallucination"
                            name="sideEffects"
                            type="checkbox"
                            className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                        />
                        <label htmlFor="hallucination" className="ml-2 block text-sm text-gray-700">ประสาทหลอน</label>
                    </div>
                    <div className="flex items-center">
                        <input
                            id="insomnia"
                            name="sideEffects"
                            type="checkbox"
                            className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                        />
                        <label htmlFor="insomnia" className="ml-2 block text-sm text-gray-700">นอนไม่หลับ</label>
                    </div>
                    <div className="flex items-center">
                        <input
                            id="depression"
                            name="sideEffects"
                            type="checkbox"
                            className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                        />
                        <label htmlFor="depression" className="ml-2 block text-sm text-gray-700">ซึมเศร้า</label>
                    </div>
                    <div className="flex items-center">
                        <input
                            id="physical"
                            name="sideEffects"
                            type="checkbox"
                            className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                        />
                        <label htmlFor="physical" className="ml-2 block text-sm text-gray-700">อาการทางกาย</label>
                    </div>
                </div>
                <textarea 
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-[#990000] transition-all duration-200 resize-none"
                    placeholder="ระบุผลข้างเคียงเพิ่มเติม (ถ้ามี)"
                    rows="2"
                    value={formData.effect || ""}
                    onChange={(e) => setFormData({...formData, effect: e.target.value})}
                ></textarea>
            </div>
        </div>
    );
};

export default AdditionalInfoForm;