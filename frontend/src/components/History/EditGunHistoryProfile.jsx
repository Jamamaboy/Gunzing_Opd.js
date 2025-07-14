import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiArrowLeft, FiLoader, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';

// Import API และ hooks
import { api } from '../../config/api';
import useFirearmHistory from '../../hooks/useFirearmHistory';
import { useGeography, useGeographyById } from '../../hooks/useGeography';

// --- Desktop Layout ---
const DesktopLayout = ({ 
  loading, error, success, historyData, formData, provinces, districts, subdistricts, 
  handleChange, handleProvinceChange, handleDistrictChange, handleSubmit, saving, onCancel 
}) => (
  <div className="bg-white flex flex-col h-full w-full overflow-hidden">
    {/* Header with back button */}
    <div className="flex items-center border-b p-2 md:p-3">
      <button onClick={onCancel} className="mr-3 text-gray-600 hover:text-gray-900">
        <FiArrowLeft size={20} />
      </button>
      <h1 className="text-base md:text-lg font-bold">แก้ไขข้อมูลประวัติ</h1>
    </div>
    {/* Scrollable form area */}
    <div className="flex-1 overflow-auto p-4 md:p-6">
      <form onSubmit={handleSubmit}>
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center">
            <FiAlertCircle className="mr-2 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {/* Image preview section */}
        <div className="mb-8 flex justify-center">
          <img 
            src={historyData?.photo_url || ''}
            alt="ภาพอาวุธปืน"
            className="max-h-60 object-contain border p-2 rounded-lg"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Gun details section */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold border-b pb-2">รายละเอียดอาวุธปืน</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อ</label>
                <input 
                  type="text" 
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-lg focus:ring-1 focus:ring-[#b30000] focus:border-[#b30000]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ประเภท</label>
                <input 
                  type="text" 
                  name="subcategory"
                  value={formData.subcategory}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-lg focus:ring-1 focus:ring-[#b30000] focus:border-[#b30000]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">กลไก</label>
                <input 
                  type="text" 
                  name="mechanism"
                  value={formData.mechanism}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-lg focus:ring-1 focus:ring-[#b30000] focus:border-[#b30000]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ยี่ห้อ</label>
                <input 
                  type="text" 
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-lg focus:ring-1 focus:ring-[#b30000] focus:border-[#b30000]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ซีรี่ส์</label>
                <input 
                  type="text" 
                  name="series"
                  value={formData.series}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-lg focus:ring-1 focus:ring-[#b30000] focus:border-[#b30000]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">โมเดล</label>
                <input 
                  type="text" 
                  name="model"
                  value={formData.model}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-lg focus:ring-1 focus:ring-[#b30000] focus:border-[#b30000]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">จุดสังเกตเลขประจำปืน</label>
                <textarea 
                  name="serial_info"
                  value={formData.serial_info}
                  onChange={handleChange}
                  rows="3"
                  className="w-full p-2 border rounded-lg focus:ring-1 focus:ring-[#b30000] focus:border-[#b30000]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">คำอธิบาย</label>
                <textarea 
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  className="w-full p-2 border rounded-lg focus:ring-1 focus:ring-[#b30000] focus:border-[#b30000]"
                />
              </div>
            </div>
          </div>
          {/* Location and other details */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold border-b pb-2">รายละเอียดสถานที่และอื่นๆ</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">วันที่พบ</label>
                <input 
                  type="date" 
                  name="discovery_date"
                  value={formData.discovery_date}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-lg focus:ring-1 focus:ring-[#b30000] focus:border-[#b30000]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">เวลา</label>
                <input 
                  type="time" 
                  name="discovery_time"
                  value={formData.discovery_time}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-lg focus:ring-1 focus:ring-[#b30000] focus:border-[#b30000]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ความมั่นใจ AI (%)</label>
                <input 
                  type="number" 
                  name="ai_confidence"
                  min="0"
                  max="100"
                  step="0.01"
                  value={formData.ai_confidence}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-lg focus:ring-1 focus:ring-[#b30000] focus:border-[#b30000]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">จังหวัด</label>
                <select 
                  name="province_id" 
                  value={formData.province_id}
                  onChange={handleProvinceChange}
                  className="w-full p-2 border rounded-lg focus:ring-1 focus:ring-[#b30000] focus:border-[#b30000]"
                >
                  <option value="">เลือกจังหวัด</option>
                  {provinces.map(province => (
                    <option key={province.id} value={province.id}>
                      {province.province_name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">อำเภอ</label>
                <select 
                  name="district_id" 
                  value={formData.district_id}
                  onChange={handleDistrictChange}
                  disabled={!formData.province_id}
                  className="w-full p-2 border rounded-lg focus:ring-1 focus:ring-[#b30000] focus:border-[#b30000] disabled:bg-gray-100"
                >
                  <option value="">เลือกอำเภอ</option>
                  {districts.map(district => (
                    <option key={district.id} value={district.id}>
                      {district.district_name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ตำบล</label>
                <select 
                  name="subdistrict_id" 
                  value={formData.subdistrict_id}
                  onChange={handleChange}
                  disabled={!formData.district_id}
                  className="w-full p-2 border rounded-lg focus:ring-1 focus:ring-[#b30000] focus:border-[#b30000] disabled:bg-gray-100"
                >
                  <option value="">เลือกตำบล</option>
                  {subdistricts.map(subdistrict => (
                    <option key={subdistrict.id} value={subdistrict.id}>
                      {subdistrict.subdistrict_name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">พิกัด (ละติจูด)</label>
                <input 
                  type="number" 
                  name="latitude"
                  step="any"
                  value={formData.latitude}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-lg focus:ring-1 focus:ring-[#b30000] focus:border-[#b30000]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">พิกัด (ลองจิจูด)</label>
                <input 
                  type="number" 
                  name="longitude"
                  step="any"
                  value={formData.longitude}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-lg focus:ring-1 focus:ring-[#b30000] focus:border-[#b30000]"
                />
              </div>
            </div>
          </div>
        </div>
        {/* Action buttons */}
        <div className="mt-8 pt-5 border-t flex flex-col-reverse sm:flex-row sm:gap-3 gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
          >
            ยกเลิก
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 rounded-lg bg-[#b30000] text-white hover:bg-[#900000] focus:outline-none disabled:bg-gray-400 flex items-center justify-center"
          >
            {saving ? (
              <>
                <FiLoader className="animate-spin mr-2" />
                กำลังบันทึก...
              </>
            ) : (
              'บันทึกการเปลี่ยนแปลง'
            )}
          </button>
        </div>
      </form>
    </div>
  </div>
);

// --- Mobile Layout ---
const MobileLayout = ({
  loading, error, success, historyData, formData, provinces, districts, subdistricts,
  handleChange, handleProvinceChange, handleDistrictChange, handleSubmit, saving, onCancel
}) => (
  <div className="bg-white flex flex-col h-full w-full overflow-hidden">
    {/* Mobile Topbar: match History.jsx */}
    <div className="px-4 py-3 flex items-center justify-center relative shadow-[0_1.5px_4px_rgba(0,0,0,0.2)]">
      <button className="absolute left-4" onClick={onCancel}>
        <FiArrowLeft size={24} />
      </button>
      <h1 className="text-lg font-bold text-center flex-1">แก้ไขข้อมูลประวัติ</h1>
    </div>
    {/* Scrollable form area */}
    <div className="flex-1 overflow-auto p-4 pb-20">
      <form onSubmit={handleSubmit}>
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center">
            <FiAlertCircle className="mr-2 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {/* Image preview section */}
        <div className="mb-8 flex justify-center">
          <img
            src={historyData?.photo_url || ''}
            alt="ภาพอาวุธปืน"
            className="max-h-60 object-contain border p-2 rounded-lg"
          />
        </div>
        <div className="grid grid-cols-1 gap-6">
          {/* Gun details section */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold border-b pb-2">รายละเอียดอาวุธปืน</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อ</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-lg focus:ring-1 focus:ring-[#b30000] focus:border-[#b30000]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ประเภท</label>
                <input
                  type="text"
                  name="subcategory"
                  value={formData.subcategory}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-lg focus:ring-1 focus:ring-[#b30000] focus:border-[#b30000]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">กลไก</label>
                <input
                  type="text"
                  name="mechanism"
                  value={formData.mechanism}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-lg focus:ring-1 focus:ring-[#b30000] focus:border-[#b30000]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ยี่ห้อ</label>
                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-lg focus:ring-1 focus:ring-[#b30000] focus:border-[#b30000]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ซีรี่ส์</label>
                <input
                  type="text"
                  name="series"
                  value={formData.series}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-lg focus:ring-1 focus:ring-[#b30000] focus:border-[#b30000]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">โมเดล</label>
                <input
                  type="text"
                  name="model"
                  value={formData.model}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-lg focus:ring-1 focus:ring-[#b30000] focus:border-[#b30000]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">จุดสังเกตเลขประจำปืน</label>
                <textarea
                  name="serial_info"
                  value={formData.serial_info}
                  onChange={handleChange}
                  rows="3"
                  className="w-full p-2 border rounded-lg focus:ring-1 focus:ring-[#b30000] focus:border-[#b30000]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">คำอธิบาย</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  className="w-full p-2 border rounded-lg focus:ring-1 focus:ring-[#b30000] focus:border-[#b30000]"
                />
              </div>
            </div>
          </div>
          {/* Location and other details */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold border-b pb-2">รายละเอียดสถานที่และอื่นๆ</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">วันที่พบ</label>
                <input
                  type="date"
                  name="discovery_date"
                  value={formData.discovery_date}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-lg focus:ring-1 focus:ring-[#b30000] focus:border-[#b30000]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">เวลา</label>
                <input
                  type="time"
                  name="discovery_time"
                  value={formData.discovery_time}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-lg focus:ring-1 focus:ring-[#b30000] focus:border-[#b30000]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ความมั่นใจ AI (%)</label>
                <input
                  type="number"
                  name="ai_confidence"
                  min="0"
                  max="100"
                  step="0.01"
                  value={formData.ai_confidence}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-lg focus:ring-1 focus:ring-[#b30000] focus:border-[#b30000]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">จังหวัด</label>
                <select
                  name="province_id"
                  value={formData.province_id}
                  onChange={handleProvinceChange}
                  className="w-full p-2 border rounded-lg focus:ring-1 focus:ring-[#b30000] focus:border-[#b30000]"
                >
                  <option value="">เลือกจังหวัด</option>
                  {provinces.map(province => (
                    <option key={province.id} value={province.id}>
                      {province.province_name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">อำเภอ</label>
                <select
                  name="district_id"
                  value={formData.district_id}
                  onChange={handleDistrictChange}
                  disabled={!formData.province_id}
                  className="w-full p-2 border rounded-lg focus:ring-1 focus:ring-[#b30000] focus:border-[#b30000] disabled:bg-gray-100"
                >
                  <option value="">เลือกอำเภอ</option>
                  {districts.map(district => (
                    <option key={district.id} value={district.id}>
                      {district.district_name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ตำบล</label>
                <select
                  name="subdistrict_id"
                  value={formData.subdistrict_id}
                  onChange={handleChange}
                  disabled={!formData.district_id}
                  className="w-full p-2 border rounded-lg focus:ring-1 focus:ring-[#b30000] focus:border-[#b30000] disabled:bg-gray-100"
                >
                  <option value="">เลือกตำบล</option>
                  {subdistricts.map(subdistrict => (
                    <option key={subdistrict.id} value={subdistrict.id}>
                      {subdistrict.subdistrict_name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">พิกัด (ละติจูด)</label>
                <input
                  type="number"
                  name="latitude"
                  step="any"
                  value={formData.latitude}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-lg focus:ring-1 focus:ring-[#b30000] focus:border-[#b30000]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">พิกัด (ลองจิจูด)</label>
                <input
                  type="number"
                  name="longitude"
                  step="any"
                  value={formData.longitude}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-lg focus:ring-1 focus:ring-[#b30000] focus:border-[#b30000]"
                />
              </div>
            </div>
          </div>
        </div>
        {/* Action buttons - Fixed at bottom for mobile */}
        <div className="mt-8 pt-5 border-t flex flex-col gap-2">
          <button
            type="submit"
            disabled={saving}
            className="w-full px-5 py-2.5 rounded-lg bg-[#b30000] text-white hover:bg-[#900000] focus:outline-none disabled:bg-gray-400 flex items-center justify-center"
          >
            {saving ? (
              <>
                <FiLoader className="animate-spin mr-2" />
                กำลังบันทึก...
              </>
            ) : (
              'บันทึกการเปลี่ยนแปลง'
            )}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="w-full px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
          >
            ยกเลิก
          </button>
        </div>
      </form>
    </div>
  </div>
);

// --- Main Component ---
const EditGunHistoryProfile = ({ onCancel, onSaved }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // ใช้ firearm history hook
  const {
    singleData: historyData,
    isLoading: fetchingHistory,
    error: fetchError,
    fetchFirearmHistoryById
  } = useFirearmHistory();

  // ใช้ geography hooks
  const {
    provinces,
    districts,
    subdistricts,
    selectProvince,
    selectDistrict,
    loading: geographyLoading
  } = useGeography();

  const {
    getDistrictById,
    getSubdistrictById
  } = useGeographyById();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Form data state
  const [formData, setFormData] = useState({
    name: '',
    subcategory: '',
    mechanism: '',
    brand: '',
    series: '',
    model: '',
    serial_info: '',
    description: '',
    discovery_date: '',
    discovery_time: '',
    ai_confidence: 0,
    subdistrict_id: '',
    district_id: '',
    province_id: '',
    latitude: '',
    longitude: ''
  });

  // Fetch history item data
  useEffect(() => {
    const fetchData = async () => {
      if (!id) {
        setLoading(false);
        setError("ไม่พบข้อมูล ID ของรายการที่ต้องการแก้ไข");
        return;
      }
      
      try {
        setLoading(true);
        
        // ดึงข้อมูล history
        const historyDetails = await fetchFirearmHistoryById(id);
        
        if (historyDetails) {
          // ตั้งค่า form data
          setFormData({
            name: historyDetails.exhibit?.firearms?.[0]?.name || '',
            subcategory: historyDetails.exhibit?.subcategory || '',
            mechanism: historyDetails.exhibit?.firearms?.[0]?.mechanism || '',
            brand: historyDetails.exhibit?.firearms?.[0]?.brand || '',
            series: historyDetails.exhibit?.firearms?.[0]?.series || '',
            model: historyDetails.exhibit?.firearms?.[0]?.model || '',
            serial_info: historyDetails.exhibit?.firearms?.[0]?.serial_info || '',
            description: historyDetails.exhibit?.firearms?.[0]?.description || '',
            discovery_date: historyDetails.discovery_date || '',
            discovery_time: historyDetails.discovery_time || '',
            ai_confidence: ((historyDetails.ai_confidence || 0) * 100).toFixed(2),
            subdistrict_id: historyDetails.subdistrict_id || '',
            district_id: '', // จะตั้งค่าใหม่จาก hierarchy
            province_id: '', // จะตั้งค่าใหม่จาก hierarchy
            latitude: historyDetails.latitude || '',
            longitude: historyDetails.longitude || ''
          });

          // โหลด location hierarchy ถ้ามี subdistrict_id
          if (historyDetails.subdistrict_id) {
            await loadLocationHierarchy(historyDetails.subdistrict_id);
          }
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data for editing:', err);
        setError('ไม่สามารถดึงข้อมูลได้ กรุณาลองใหม่อีกครั้ง');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id, fetchFirearmHistoryById]);

  // โหลด location hierarchy จาก subdistrict_id
  const loadLocationHierarchy = async (subdistrictId) => {
    try {
      // ดึงข้อมูล subdistrict เพื่อหา district และ province
      const subdistrict = await getSubdistrictById(subdistrictId);
      
      if (subdistrict?.district_id) {
        const district = await getDistrictById(subdistrict.district_id);
        
        if (district?.province_id) {
          // อัพเดท form data
          setFormData(prev => ({
            ...prev,
            province_id: district.province_id,
            district_id: subdistrict.district_id
          }));
          
          // เลือก province และ district ใน hook เพื่อโหลดข้อมูล cascade
          const selectedProvince = provinces.find(p => p.id === district.province_id);
          if (selectedProvince) {
            await selectProvince(selectedProvince);
            
            // หลังจากโหลด districts แล้ว ให้เลือก district
            setTimeout(async () => {
              const selectedDistrict = districts.find(d => d.id === subdistrict.district_id);
              if (selectedDistrict) {
                await selectDistrict(selectedDistrict);
              }
            }, 100);
          }
        }
      }
    } catch (err) {
      console.error('Error loading location hierarchy:', err);
    }
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle province change - ใช้ geography hook
  const handleProvinceChange = async (e) => {
    const provinceId = e.target.value;
    
    // อัพเดท form data
    setFormData(prev => ({ 
      ...prev, 
      province_id: provinceId,
      district_id: '',
      subdistrict_id: ''
    }));
    
    // ใช้ hook เพื่อโหลด districts
    if (provinceId) {
      const selectedProvince = provinces.find(p => p.id === parseInt(provinceId));
      if (selectedProvince) {
        await selectProvince(selectedProvince);
      }
    } else {
      await selectProvince(null);
    }
  };

  // Handle district change - ใช้ geography hook
  const handleDistrictChange = async (e) => {
    const districtId = e.target.value;
    
    // อัพเดท form data
    setFormData(prev => ({ 
      ...prev, 
      district_id: districtId,
      subdistrict_id: ''
    }));
    
    // ใช้ hook เพื่อโหลด subdistricts
    if (districtId) {
      const selectedDistrict = districts.find(d => d.id === parseInt(districtId));
      if (selectedDistrict) {
        await selectDistrict(selectedDistrict);
      }
    } else {
      await selectDistrict(null);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError(null);

      // เตรียมข้อมูลสำหรับส่ง
      const updateData = {
        // ข้อมูล exhibit
        exhibit: {
          subcategory: formData.subcategory,
          firearms: [{
            name: formData.name,
            mechanism: formData.mechanism,
            brand: formData.brand,
            series: formData.series,
            model: formData.model,
            serial_info: formData.serial_info,
            description: formData.description
          }]
        },
        // ข้อมูล history
        discovery_date: formData.discovery_date,
        discovery_time: formData.discovery_time,
        ai_confidence: parseFloat(formData.ai_confidence) / 100, // แปลงกลับเป็น 0-1
        subdistrict_id: parseInt(formData.subdistrict_id),
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude)
      };

      // ส่งข้อมูลไปอัปเดต
      await api.put(`/api/history/${id}`, updateData);

      setSaving(false);
      setSuccess(true);
      
      // กลับไปหน้า history
      setTimeout(() => {
        navigate('/history', {
          state: {
            popup: {
              open: true,
              type: 'success',
              message: 'บันทึกข้อมูลสำเร็จ'
            }
          }
        });
      }, 1500);
      
    } catch (err) {
      console.error('Error updating history:', err);
      setSaving(false);
      setError('ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง');
    }
  };

  // Loading state
  if (loading || fetchingHistory || geographyLoading.provinces) {
    return (
      <div className="w-full h-full flex justify-center items-center p-8 bg-white">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B0000] mb-3"></div>
          <p className="text-gray-600">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  // Error state
  if ((error || fetchError) && !historyData) {
    return (
      <div className="w-full h-full flex justify-center items-center p-8 bg-white">
        <div className="flex flex-col items-center text-center">
          <FiAlertCircle size={50} className="text-red-600 mb-4" />
          <h2 className="text-xl font-bold text-red-600 mb-2">เกิดข้อผิดพลาด</h2>
          <p className="text-gray-600 mb-6">{error || fetchError}</p>
          <button
            onClick={onCancel || (() => navigate('/history'))}
            className="px-5 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
          >
            กลับ
          </button>
        </div>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="w-full h-full flex justify-center items-center p-8 bg-white">
        <div className="flex flex-col items-center text-center">
          <FiCheckCircle size={50} className="text-green-600 mb-4" />
          <h2 className="text-xl font-bold text-green-600 mb-2">บันทึกข้อมูลสำเร็จ</h2>
          <p className="text-gray-600">กำลังกลับไปยังหน้าแสดงข้อมูล...</p>
        </div>
      </div>
    );
  }

  // Responsive Layout
  return (
    <div className="h-full w-full">
      <div className="hidden md:block h-full">
        <DesktopLayout
          loading={loading}
          error={error}
          success={success}
          historyData={historyData}
          formData={formData}
          provinces={provinces}
          districts={districts}
          subdistricts={subdistricts}
          handleChange={handleChange}
          handleProvinceChange={handleProvinceChange}
          handleDistrictChange={handleDistrictChange}
          handleSubmit={handleSubmit}
          saving={saving}
          onCancel={onCancel || (() => navigate('/history'))}
        />
      </div>
      <div className="md:hidden h-full">
        <MobileLayout
          loading={loading}
          error={error}
          success={success}
          historyData={historyData}
          formData={formData}
          provinces={provinces}
          districts={districts}
          subdistricts={subdistricts}
          handleChange={handleChange}
          handleProvinceChange={handleProvinceChange}
          handleDistrictChange={handleDistrictChange}
          handleSubmit={handleSubmit}
          saving={saving}
          onCancel={onCancel || (() => navigate('/history'))}
        />
      </div>
    </div>
  );
};

export default EditGunHistoryProfile;