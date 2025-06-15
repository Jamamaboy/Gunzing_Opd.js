import React, { useState, useEffect } from "react";
import axios from "axios";
import apiConfig from '../../config/api';

const API_PATH = '/api';

const Filter = ({ onSubdistrictSelect }) => {
  // State สำหรับเก็บข้อมูล
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [subdistricts, setSubdistricts] = useState([]); // รายการตำบล

  // State สำหรับฟิลเตอร์
  const [selectedProvince, setSelectedProvince] = useState(null); // จังหวัดที่ถูกเลือก
  const [selectedDistrict, setSelectedDistrict] = useState(null); // อำเภอที่ถูกเลือก

  // ดึงข้อมูลจังหวัดเมื่อ Component Mount
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const response = await axios.get(`${apiConfig.baseUrl}${API_PATH}/provinces`);
        setProvinces(response.data);
      } catch (error) {
        console.error('Error fetching provinces:', error);
      }
    };
    fetchProvinces();
  }, []);

  // ดึงข้อมูลอำเภอเมื่อเลือกจังหวัด
  useEffect(() => {
    if (selectedProvince) {
      const fetchDistricts = async () => {
        try {
          const response = await axios.get(
            `${apiConfig.baseUrl}${API_PATH}/districts?province_id=${selectedProvince.id}`
          );
          setDistricts(response.data);
          setSelectedDistrict(null); // Reset อำเภอเมื่อเปลี่ยนจังหวัด
        } catch (error) {
          console.error('Error fetching districts:', error);
        }
      };
      fetchDistricts();
    } else {
      setDistricts([]);
    }
  }, [selectedProvince]);

  // ดึงข้อมูลตำบลเมื่อเลือกอำเภอ
  useEffect(() => {
    if (selectedDistrict) {
      const fetchSubdistricts = async () => {
        try {
          const response = await axios.get(
            `${apiConfig.baseUrl}${API_PATH}/subdistricts?district_id=${selectedDistrict.id}`
          );
          setSubdistricts(response.data);
        } catch (error) {
          console.error('Error fetching subdistricts:', error);
        }
      };
      fetchSubdistricts();
    } else {
      setSubdistricts([]);
    }
  }, [selectedDistrict]);

  // เมื่อเลือกตำบล ส่งข้อมูลกลับไปยัง Parent Component
  const handleSubdistrictChange = (e) => {
    const subdistrict = subdistricts.find((s) => s.id === parseInt(e.target.value));
    if (onSubdistrictSelect && subdistrict) {
      onSubdistrictSelect(subdistrict);
    }
  };

  return (
    <div style={{ padding: '10px', backgroundColor: '#f9f9f9' }}>
      {/* Dropdown สำหรับจังหวัด */}
      <label>จังหวัด:</label>
      <select
        value={selectedProvince?.id || ""}
        onChange={(e) => {
          const province = provinces.find((p) => p.id === parseInt(e.target.value));
          setSelectedProvince(province);
        }}
      >
        <option value="">เลือกจังหวัด</option>
        {provinces.map((province) => (
          <option key={province.id} value={province.id}>
            {province.province_name}
          </option>
        ))}
      </select>

      {/* Dropdown สำหรับอำเภอ (แสดงเฉพาะเมื่อมีจังหวัดที่ถูกเลือก) */}
      {selectedProvince && (
        <>
          <label>อำเภอ:</label>
          <select
            value={selectedDistrict?.id || ""}
            onChange={(e) => {
              const district = districts.find((d) => d.id === parseInt(e.target.value));
              setSelectedDistrict(district);
            }}
          >
            <option value="">เลือกอำเภอ</option>
            {districts.map((district) => (
              <option key={district.id} value={district.id}>
                {district.district_name}
              </option>
            ))}
          </select>
        </>
      )}

      {/* Dropdown สำหรับตำบล (แสดงเฉพาะเมื่อมีอำเภอที่ถูกเลือก) */}
      {selectedDistrict && (
        <>
          <label>ตำบล:</label>
          <select value={""} onChange={handleSubdistrictChange}>
            <option value="">เลือกตำบล</option>
            {subdistricts.map((subdistrict) => (
              <option key={subdistrict.id} value={subdistrict.id}>
                {subdistrict.subdistrict_name}
              </option>
            ))}
          </select>
        </>
      )}
    </div>
  );
};

export default Filter;