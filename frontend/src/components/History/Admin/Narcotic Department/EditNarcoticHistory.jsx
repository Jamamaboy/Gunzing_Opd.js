import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiSave, FiX, FiUpload, FiMapPin } from 'react-icons/fi';
import { AlertTriangle, CheckCircle } from 'lucide-react';

// Import hooks และ services
import { useNarcoticHistory } from '../../../../hooks/useNarcoticHistory';
import { api } from '../../../../config/api';

// Components
const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-64">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#990000]"></div>
  </div>
);

const NotificationModal = ({ isOpen, onClose, title, message, type = 'success' }) => {
  if (!isOpen) return null;

  const getIconAndColor = () => {
    switch (type) {
      case 'error':
        return {
          icon: <AlertTriangle className="h-8 w-8 text-red-600" />,
          bgColor: 'bg-red-100',
          titleColor: 'text-red-900',
          buttonColor: 'bg-red-600 hover:bg-red-700'
        };
      default:
        return {
          icon: <CheckCircle className="h-8 w-8 text-green-600" />,
          bgColor: 'bg-green-100',
          titleColor: 'text-green-900',
          buttonColor: 'bg-green-600 hover:bg-green-700'
        };
    }
  };

  const { icon, bgColor, titleColor, buttonColor } = getIconAndColor();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full animate-in fade-in zoom-in duration-200">
        <div className="p-6 text-center">
          <div className={`mx-auto flex items-center justify-center h-16 w-16 rounded-full ${bgColor} mb-4`}>
            {icon}
          </div>
          <h3 className={`text-lg font-medium ${titleColor} mb-2`}>
            {title}
          </h3>
          <p className="text-sm text-gray-500 mb-6">
            {message}
          </p>
          <button
            onClick={onClose}
            className={`w-full px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${buttonColor}`}
          >
            ตกลง
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Desktop Layout ---
const DesktopLayout = ({ 
  formData, 
  handleInputChange, 
  imagePreview, 
  handleImageUpload, 
  getCurrentLocation, 
  provinces, 
  districts, 
  subdistricts, 
  selectedProvince, 
  setSelectedProvince,
  selectedDistrict, 
  setSelectedDistrict,
  handleSubmit,
  saving,
  navigate 
}) => (
  <div className="hidden md:flex flex-col h-full">
    {/* Header */}
    <div className="px-6 py-4 flex justify-between items-center border-b bg-white">
      <div className="flex items-center">
        <button
          onClick={() => navigate(-1)}
          className="mr-4 p-2 hover:bg-gray-100 rounded-full"
        >
          <FiArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-bold">แก้ไขประวัติยาเสพติด</h1>
      </div>
      <div className="flex space-x-2">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          ยกเลิก
        </button>
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="px-4 py-2 text-sm font-medium text-white bg-[#990000] border border-transparent rounded-md hover:bg-[#800000] disabled:opacity-50 inline-flex items-center"
        >
          {saving && (
            <div className="animate-spin -ml-1 mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
          )}
          <FiSave className="h-4 w-4 mr-2" />
          {saving ? 'กำลังบันทึก...' : 'บันทึก'}
        </button>
      </div>
    </div>

    {/* Content Area */}
    <div className="flex flex-1 overflow-hidden">
      {/* Left Sidebar - Form */}
      <div className="w-1/3 bg-white border-r overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* ข้อมูลการค้นพบ */}
          <div>
            <h2 className="text-lg font-semibold mb-4">ข้อมูลการค้นพบ</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  วันที่พบ <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="discovery_date"
                  value={formData.discovery_date}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#990000]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  เวลาที่พบ <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  name="discovery_time"
                  value={formData.discovery_time}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#990000]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  จำนวน
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#990000]"
                  placeholder="ระบุจำนวน"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ความมั่นใจ AI (%)
                </label>
                <input
                  type="number"
                  name="ai_confidence"
                  value={formData.ai_confidence}
                  onChange={handleInputChange}
                  min="0"
                  max="100"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#990000]"
                  placeholder="0-100"
                />
              </div>
            </div>
          </div>

          {/* ข้อมูลยาเสพติด */}
          <div>
            <h2 className="text-lg font-semibold mb-4">ข้อมูลยาเสพติด</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ประเภทยา
                </label>
                <input
                  type="text"
                  name="drug_type"
                  value={formData.drug_type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#990000]"
                  placeholder="เช่น methamphetamine"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  หมวดหมู่ยา
                </label>
                <input
                  type="text"
                  name="drug_category"
                  value={formData.drug_category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#990000]"
                  placeholder="เช่น ยาประเภท 1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  น้ำหนัก (กรัม)
                </label>
                <input
                  type="number"
                  name="weight_grams"
                  value={formData.weight_grams}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#990000]"
                  placeholder="น้ำหนักเป็นกรัม"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  วิธีการเสพ
                </label>
                <input
                  type="text"
                  name="consumption_method"
                  value={formData.consumption_method}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#990000]"
                  placeholder="เช่น การสูด, การกิน"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ลักษณะของยา
                </label>
                <textarea
                  name="characteristics"
                  value={formData.characteristics}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#990000]"
                  placeholder="อธิบายลักษณะภายนอก"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ผลต่อร่างกาย
                </label>
                <textarea
                  name="effect"
                  value={formData.effect}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#990000]"
                  placeholder="อธิบายผลกระทบ"
                />
              </div>
            </div>
          </div>

          {/* สถานที่ */}
          <div>
            <h2 className="text-lg font-semibold mb-4">สถานที่พบ</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  จังหวัด <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedProvince}
                  onChange={(e) => setSelectedProvince(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#990000]"
                  required
                >
                  <option value="">เลือกจังหวัด</option>
                  {provinces.map((province) => (
                    <option key={province.id} value={province.id}>
                      {province.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  อำเภอ <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#990000]"
                  required
                  disabled={!selectedProvince}
                >
                  <option value="">เลือกอำเภอ</option>
                  {districts.map((district) => (
                    <option key={district.id} value={district.id}>
                      {district.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ตำบล <span className="text-red-500">*</span>
                </label>
                <select
                  name="subdistrict_id"
                  value={formData.subdistrict_id}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#990000]"
                  required
                  disabled={!selectedDistrict}
                >
                  <option value="">เลือกตำบล</option>
                  {subdistricts.map((subdistrict) => (
                    <option key={subdistrict.id} value={subdistrict.id}>
                      {subdistrict.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* พิกัด */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">พิกัดสถานที่</h2>
              <button
                type="button"
                onClick={getCurrentLocation}
                className="flex items-center px-2 py-1 text-xs text-[#990000] border border-[#990000] rounded hover:bg-[#990000] hover:text-white"
              >
                <FiMapPin className="h-3 w-3 mr-1" />
                ระบุตำแหน่ง
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ละติจูด
                </label>
                <input
                  type="number"
                  name="latitude"
                  value={formData.latitude}
                  onChange={handleInputChange}
                  step="any"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#990000]"
                  placeholder="13.7563"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ลองจิจูด
                </label>
                <input
                  type="number"
                  name="longitude"
                  value={formData.longitude}
                  onChange={handleInputChange}
                  step="any"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#990000]"
                  placeholder="100.5018"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area - Image */}
      <div className="flex-1 bg-gray-50 overflow-hidden">
        <div className="h-full p-6 flex flex-col">
          <h2 className="text-lg font-semibold mb-4">รูปภาพยาเสพติด</h2>
          
          {/* Image Display Area */}
          <div className="flex-1 bg-white rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center relative overflow-hidden">
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="ตัวอย่างรูปภาพ"
                className="max-w-full max-h-full object-contain"
              />
            ) : (
              <div className="text-center">
                <FiUpload className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-500">
                  ไม่มีรูปภาพ
                </p>
              </div>
            )}
          </div>

          {/* Upload Button */}
          <div className="mt-4">
            <label className="w-full flex justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#990000] hover:bg-[#800000] cursor-pointer">
              <FiUpload className="h-4 w-4 mr-2" />
              อัพโหลดรูปภาพใหม่
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// --- Mobile Layout ---
const MobileLayout = ({ 
  formData, 
  handleInputChange, 
  imagePreview, 
  handleImageUpload, 
  getCurrentLocation, 
  provinces, 
  districts, 
  subdistricts, 
  selectedProvince, 
  setSelectedProvince,
  selectedDistrict, 
  setSelectedDistrict,
  handleSubmit,
  saving,
  navigate 
}) => (
  <div className="md:hidden flex flex-col h-full">
    {/* Mobile Header */}
    <div className="px-4 py-3 flex items-center justify-center relative shadow-md bg-white">
      <button 
        className="absolute left-4" 
        onClick={() => navigate(-1)}
      >
        <FiArrowLeft size={24} />
      </button>
      <h1 className="text-lg font-bold text-center flex-1">แก้ไขประวัติยาเสพติด</h1>
    </div>

    {/* Mobile Content */}
    <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-gray-50">
      {/* รูปภาพ */}
      <div className="bg-white rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-4">รูปภาพยาเสพติด</h2>
        <div className="space-y-4">
          {imagePreview && (
            <div className="flex justify-center">
              <img
                src={imagePreview}
                alt="ตัวอย่าง"
                className="max-w-full h-60 object-contain rounded-lg"
              />
            </div>
          )}
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <FiUpload className="w-6 h-6 mb-2 text-gray-500" />
              <p className="text-xs text-gray-500">
                <span className="font-semibold">คลิกเพื่ออัพโหลด</span>
              </p>
            </div>
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleImageUpload}
            />
          </label>
        </div>
      </div>

      {/* ข้อมูลการค้นพบ */}
      <div className="bg-white rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-4">ข้อมูลการค้นพบ</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              วันที่พบ <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="discovery_date"
              value={formData.discovery_date}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#990000]"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              เวลาที่พบ <span className="text-red-500">*</span>
            </label>
            <input
              type="time"
              name="discovery_time"
              value={formData.discovery_time}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#990000]"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              จำนวน
            </label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleInputChange}
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#990000]"
              placeholder="ระบุจำนวน"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ความมั่นใจ AI (%)
            </label>
            <input
              type="number"
              name="ai_confidence"
              value={formData.ai_confidence}
              onChange={handleInputChange}
              min="0"
              max="100"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#990000]"
              placeholder="0-100"
            />
          </div>
        </div>
      </div>

      {/* ข้อมูลยาเสพติด */}
      <div className="bg-white rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-4">ข้อมูลยาเสพติด</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ประเภทยา
            </label>
            <input
              type="text"
              name="drug_type"
              value={formData.drug_type}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#990000]"
              placeholder="เช่น methamphetamine"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              หมวดหมู่ยา
            </label>
            <input
              type="text"
              name="drug_category"
              value={formData.drug_category}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#990000]"
              placeholder="เช่น ยาประเภท 1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              น้ำหนัก (กรัม)
            </label>
            <input
              type="number"
              name="weight_grams"
              value={formData.weight_grams}
              onChange={handleInputChange}
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#990000]"
              placeholder="น้ำหนักเป็นกรัม"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              วิธีการเสพ
            </label>
            <input
              type="text"
              name="consumption_method"
              value={formData.consumption_method}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#990000]"
              placeholder="เช่น การสูด, การกิน"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ลักษณะของยา
            </label>
            <textarea
              name="characteristics"
              value={formData.characteristics}
              onChange={handleInputChange}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#990000]"
              placeholder="อธิบายลักษณะภายนอก"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ผลต่อร่างกาย
            </label>
            <textarea
              name="effect"
              value={formData.effect}
              onChange={handleInputChange}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#990000]"
              placeholder="อธิบายผลกระทบ"
            />
          </div>
        </div>
      </div>

      {/* สถานที่ */}
      <div className="bg-white rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-4">สถานที่พบ</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              จังหวัด <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedProvince}
              onChange={(e) => setSelectedProvince(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#990000]"
              required
            >
              <option value="">เลือกจังหวัด</option>
              {provinces.map((province) => (
                <option key={province.id} value={province.id}>
                  {province.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              อำเภอ <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#990000]"
              required
              disabled={!selectedProvince}
            >
              <option value="">เลือกอำเภอ</option>
              {districts.map((district) => (
                <option key={district.id} value={district.id}>
                  {district.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ตำบล <span className="text-red-500">*</span>
            </label>
            <select
              name="subdistrict_id"
              value={formData.subdistrict_id}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#990000]"
              required
              disabled={!selectedDistrict}
            >
              <option value="">เลือกตำบล</option>
              {subdistricts.map((subdistrict) => (
                <option key={subdistrict.id} value={subdistrict.id}>
                  {subdistrict.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* พิกัด */}
      <div className="bg-white rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">พิกัดสถานที่</h2>
          <button
            type="button"
            onClick={getCurrentLocation}
            className="flex items-center px-2 py-1 text-xs text-[#990000] border border-[#990000] rounded hover:bg-[#990000] hover:text-white"
          >
            <FiMapPin className="h-3 w-3 mr-1" />
            ระบุตำแหน่ง
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ละติจูด
            </label>
            <input
              type="number"
              name="latitude"
              value={formData.latitude}
              onChange={handleInputChange}
              step="any"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#990000]"
              placeholder="13.7563"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ลองจิจูด
            </label>
            <input
              type="number"
              name="longitude"
              value={formData.longitude}
              onChange={handleInputChange}
              step="any"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#990000]"
              placeholder="100.5018"
            />
          </div>
        </div>
      </div>
    </div>

    {/* Mobile Action Buttons */}
    <div className="p-4 bg-white border-t flex space-x-3">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
      >
        ยกเลิก
      </button>
      <button
        onClick={handleSubmit}
        disabled={saving}
        className="flex-1 px-4 py-2 text-sm font-medium text-white bg-[#990000] border border-transparent rounded-md hover:bg-[#800000] disabled:opacity-50 inline-flex items-center justify-center"
      >
        {saving && (
          <div className="animate-spin -ml-1 mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
        )}
        <FiSave className="h-4 w-4 mr-2" />
        {saving ? 'กำลังบันทึก...' : 'บันทึก'}
      </button>
    </div>
  </div>
);

const EditNarcoticHistory = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { fetchNarcoticHistoryById, updateNarcoticHistory } = useNarcoticHistory();

  // States
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [historyData, setHistoryData] = useState(null);
  const [formData, setFormData] = useState({
    discovery_date: '',
    discovery_time: '',
    subdistrict_id: '',
    photo_url: '',
    quantity: '',
    latitude: '',
    longitude: '',
    ai_confidence: '',
    // ข้อมูลยาเสพติด
    drug_type: '',
    drug_category: '',
    characteristics: '',
    consumption_method: '',
    effect: '',
    weight_grams: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [notification, setNotification] = useState({
    isOpen: false,
    type: 'success',
    title: '',
    message: ''
  });

  // Location data
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [subdistricts, setSubdistricts] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Fetch history data
  useEffect(() => {
    const fetchHistoryData = async () => {
      try {
        setLoading(true);
        const data = await fetchNarcoticHistoryById(id);
        
        if (data) {
          setHistoryData(data);
          
          // Set form data
          setFormData({
            discovery_date: data.discovery_date || '',
            discovery_time: data.discovery_time || '',
            subdistrict_id: data.subdistrict_id || '',
            photo_url: data.photo_url || '',
            quantity: data.quantity || '',
            latitude: data.latitude || '',
            longitude: data.longitude || '',
            ai_confidence: data.ai_confidence || '',
            // ข้อมูลยาเสพติด
            drug_type: data.exhibit?.narcotic?.drug_type || '',
            drug_category: data.exhibit?.narcotic?.drug_category || '',
            characteristics: data.exhibit?.narcotic?.characteristics || '',
            consumption_method: data.exhibit?.narcotic?.consumption_method || '',
            effect: data.exhibit?.narcotic?.effect || '',
            weight_grams: data.exhibit?.narcotic?.weight_grams || ''
          });
          
          setImagePreview(data.photo_url || '');
        } else {
          setNotification({
            isOpen: true,
            type: 'error',
            title: 'ไม่พบข้อมูล',
            message: 'ไม่สามารถค้นหาประวัติยาเสพติดที่ต้องการแก้ไขได้'
          });
        }
      } catch (error) {
        console.error('Error fetching history data:', error);
        setNotification({
          isOpen: true,
          type: 'error',
          title: 'เกิดข้อผิดพลาด',
          message: 'ไม่สามารถโหลดข้อมูลประวัติได้'
        });
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchHistoryData();
    }
  }, [id, fetchNarcoticHistoryById]);

  // Fetch provinces
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const response = await api.get('/api/provinces');
        setProvinces(response.data);
      } catch (error) {
        console.error('Error fetching provinces:', error);
      }
    };
    fetchProvinces();
  }, []);

  // Fetch districts when province changes
  useEffect(() => {
    if (selectedProvince) {
      const fetchDistricts = async () => {
        try {
          const response = await api.get(`/api/districts/${selectedProvince}`);
          setDistricts(response.data);
          setSubdistricts([]);
          setSelectedDistrict('');
        } catch (error) {
          console.error('Error fetching districts:', error);
        }
      };
      fetchDistricts();
    }
  }, [selectedProvince]);

  // Fetch subdistricts when district changes
  useEffect(() => {
    if (selectedDistrict) {
      const fetchSubdistricts = async () => {
        try {
          const response = await api.get(`/api/subdistricts/${selectedDistrict}`);
          setSubdistricts(response.data);
        } catch (error) {
          console.error('Error fetching subdistricts:', error);
        }
      };
      fetchSubdistricts();
    }
  }, [selectedDistrict]);

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Get current location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            latitude: position.coords.latitude.toString(),
            longitude: position.coords.longitude.toString()
          }));
        },
        (error) => {
          console.error('Error getting location:', error);
          setNotification({
            isOpen: true,
            type: 'error',
            title: 'ไม่สามารถระบุตำแหน่งได้',
            message: 'โปรดตรวจสอบการอนุญาตใช้ตำแหน่งในเบราว์เซอร์'
          });
        }
      );
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Validate required fields
      if (!formData.discovery_date || !formData.discovery_time || !formData.subdistrict_id) {
        throw new Error('กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน');
      }

      let photoUrl = formData.photo_url;

      // Upload new image if selected
      if (imageFile) {
        const imageFormData = new FormData();
        imageFormData.append('file', imageFile);

        const uploadResponse = await api.post('/api/upload/image', imageFormData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        photoUrl = uploadResponse.data.url;
      }

      // Prepare update data
      const updateData = {
        discovery_date: formData.discovery_date,
        discovery_time: formData.discovery_time,
        subdistrict_id: parseInt(formData.subdistrict_id),
        photo_url: photoUrl,
        quantity: formData.quantity ? parseFloat(formData.quantity) : null,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        ai_confidence: formData.ai_confidence ? parseFloat(formData.ai_confidence) : null,
        // ข้อมูลยาเสพติด
        narcotic_data: {
          drug_type: formData.drug_type,
          drug_category: formData.drug_category,
          characteristics: formData.characteristics,
          consumption_method: formData.consumption_method,
          effect: formData.effect,
          weight_grams: formData.weight_grams ? parseFloat(formData.weight_grams) : null
        }
      };

      // Update history
      await updateNarcoticHistory(id, updateData);

      setNotification({
        isOpen: true,
        type: 'success',
        title: 'บันทึกสำเร็จ',
        message: 'ข้อมูลประวัติยาเสพติดได้รับการอัพเดทเรียบร้อยแล้ว'
      });

      // Navigate back after a delay
      setTimeout(() => {
        navigate('/history/narcotics');
      }, 2000);

    } catch (error) {
      console.error('Error updating history:', error);
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'เกิดข้อผิดพลาด',
        message: error.message || 'ไม่สามารถบันทึกข้อมูลได้'
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const layoutProps = {
    formData,
    handleInputChange,
    imagePreview,
    handleImageUpload,
    getCurrentLocation,
    provinces,
    districts,
    subdistricts,
    selectedProvince,
    setSelectedProvince,
    selectedDistrict,
    setSelectedDistrict,
    handleSubmit,
    saving,
    navigate
  };

  return (
    <div className="w-full h-full bg-gray-50">
      <DesktopLayout {...layoutProps} />
      <MobileLayout {...layoutProps} />

      {/* Notification Modal */}
      <NotificationModal
        isOpen={notification.isOpen}
        onClose={() => {
          setNotification({ ...notification, isOpen: false });
          if (notification.type === 'success') {
            navigate('/history/narcotics');
          }
        }}
        title={notification.title}
        message={notification.message}
        type={notification.type}
      />
    </div>
  );
};

export default EditNarcoticHistory;