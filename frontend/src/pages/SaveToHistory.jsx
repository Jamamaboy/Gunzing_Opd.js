import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import RecordTabBar from '../components/Record/RecordTabBar';
import RecordBottomBar from '../components/Record/RecordBottomBar';
import SearchableDropdown from '../components/Record/SearchableDropdown';
import RecordMap from '../components/Record/RecordMap';

const SaveToHistory = () => {
  const location = useLocation();
  const [evidenceData, setEvidenceData] = useState(null);
  const [coordinates, setCoordinates] = useState(null);
  const [geoData, setGeoData] = useState(null);
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedSubdistrict, setSelectedSubdistrict] = useState("");
  const [selectedZipcode, setSelectedZipcode] = useState("");
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [subdistricts, setSubdistricts] = useState([]);
  const [zipcodes, setZipcodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiLoading, setApiLoading] = useState(false);
  const longdo_api_key = import.meta.env.VITE_LONGDO_MAP_API_KEY;
  
  // Load evidence data from location state or localStorage
  useEffect(() => {
    if (location.state?.evidence) {
      setEvidenceData(location.state.evidence);
      // Save to localStorage as backup
      localStorage.setItem('currentEvidenceData', JSON.stringify(location.state.evidence));
    } else {
      // Try to get from localStorage if not in state
      const savedData = localStorage.getItem('currentEvidenceData');
      if (savedData) {
        setEvidenceData(JSON.parse(savedData));
      }
    }
  }, [location.state]);

  // Fetch GeoJSON data
  useEffect(() => {
    setLoading(true);
    fetch('/data/subdistricts.geojson')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        setGeoData(data);
        
        // Extract unique provinces and prepare dropdown options
        const uniqueProvinces = [...new Set(
          data.features.map(f => f.properties.pro_th)
        )].sort((a, b) => a.localeCompare(b, 'th'));
        
        setProvinces(uniqueProvinces.map(province => ({
          value: province,
          label: province
        })));
        
        resetSelections();
        setLoading(false);
      })
      .catch(error => {
        console.error('Error loading GeoJSON:', error);
        setLoading(false);
      });
  }, []);

  // Process coordinates when they change using Longdo Map API
  useEffect(() => {
    if (coordinates) {
      console.log('พิกัดที่เลือก:', coordinates);
      fetchAddressFromCoordinates(coordinates.lat, coordinates.lng);
    }
  }, [coordinates]);

  // Fetch address data from coordinates using Longdo Map API
  const fetchAddressFromCoordinates = async (lat, lng) => {
    setApiLoading(true);
    try {
      const response = await fetch(`https://api.longdo.com/map/services/address?lon=${lng}&lat=${lat}&noelevation=1&key=${longdo_api_key}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch address data');
      }
      
      const data = await response.json();
      console.log('ข้อมูลที่อยู่:', data);
      
      if (data.province && data.district && data.subdistrict) {
        const provinceThai = data.province.replace('จ.', '').trim();
        const districtThai = data.district.replace(/^(เขต|อำเภอ|อ\.)\s*/i, '').trim();
        const subdistrictThai = data.subdistrict.replace(/^(แขวง|ตำบล|ต\.)\s*/i, '').trim();
        
        // ทำทั้งขั้นตอนพร้อมกันแบบไม่รอกัน (วิธีใหม่)
        await updateAllLocations(provinceThai, districtThai, subdistrictThai);
      }
    } catch (error) {
      console.error('Error fetching address data:', error);
    } finally {
      setApiLoading(false);
    }
  };

  // ฟังก์ชันใหม่ที่อัพเดตทั้ง province, district และ subdistrict พร้อมกัน
  const updateAllLocations = async (provinceName, districtName, subdistrictName) => {
    // 1. เตรียม province
    let provinceOption = provinces.find(p => p.value === provinceName);
    if (!provinceOption) {
      provinceOption = provinces.find(p => 
        p.value.includes(provinceName) || provinceName.includes(p.value)
      );
    }
    
    if (provinceOption) {
      // 2. เตรียมข้อมูล district options
      const province = provinceOption.value;
      const provinceData = geoData.features.filter(f => f.properties.pro_th === province);
      
      if (provinceData.length) {
        const uniqueDistricts = [...new Set(provinceData.map(d => d.properties.amp_th))];
        const sortedDistricts = uniqueDistricts.sort((a, b) => a.localeCompare(b, 'th'));
        const districtOptions = sortedDistricts.map(district => ({
          value: district,
          label: district
        }));
        
        // 3. หา district ที่ตรง
        let districtOption = districtOptions.find(d => d.value === districtName);
        if (!districtOption) {
          districtOption = districtOptions.find(d => 
            d.value.includes(districtName) || districtName.includes(d.value)
          );
        }
        
        if (districtOption) {
          // 4. เตรียมข้อมูล subdistrict options
          const district = districtOption.value;
          const districtData = geoData.features.filter(
            f => f.properties.pro_th === province && f.properties.amp_th === district
          );
          
          if (districtData.length) {
            const uniqueSubdistricts = [...new Set(districtData.map(d => d.properties.tam_th))];
            const sortedSubdistricts = uniqueSubdistricts.sort((a, b) => a.localeCompare(b, 'th'));
            const subdistrictOptions = sortedSubdistricts.map(subdistrict => ({
              value: subdistrict,
              label: subdistrict
            }));
            
            // 5. หา subdistrict ที่ตรง
            let subdistrictOption = subdistrictOptions.find(s => s.value === subdistrictName);
            if (!subdistrictOption) {
              subdistrictOption = subdistrictOptions.find(s => 
                s.value.includes(subdistrictName) || subdistrictName.includes(s.value)
              );
            }
            
            // 6. อัพเดต state ทั้งหมดพร้อมกัน
            setSelectedProvince(province);
            setDistricts(districtOptions);
            setSelectedDistrict(districtOption.value);
            setSubdistricts(subdistrictOptions);
            
            if (subdistrictOption) {
              setSelectedSubdistrict(subdistrictOption.value);
              
              // 7. อัพเดต zipcode options
              const subdistrict = subdistrictOption.value;
              const subdistrictData = geoData.features.filter(
                f => f.properties.pro_th === province && 
                    f.properties.amp_th === district && 
                    f.properties.tam_th === subdistrict
              );
              
              if (subdistrictData.length) {
                const uniqueZipcodes = [...new Set(subdistrictData.map(d => d.properties.zip_code))].filter(Boolean);
                const sortedZipcodes = uniqueZipcodes.sort();
                const zipcodeOptions = sortedZipcodes.map(zipcode => ({
                  value: zipcode,
                  label: zipcode
                }));
                
                setZipcodes(zipcodeOptions);
                
                // ถ้ามีรหัสไปรษณีย์เดียว ให้เลือกโดยอัตโนมัติ
                if (zipcodeOptions.length === 1) {
                  setSelectedZipcode(zipcodeOptions[0].value);
                }
              }
            }
          }
        }
      }
    }
  };
  
  // Auto-select province in dropdown (เก็บไว้เผื่อฟังก์ชัน manual เลือก)
  const autoSelectProvince = (provinceName) => {
    let provinceOption = provinces.find(p => p.value === provinceName);

    if (!provinceOption) {
      provinceOption = provinces.find(p => 
        p.value.includes(provinceName) || provinceName.includes(p.value)
      );
    }
    
    if (provinceOption) {
      setSelectedProvince(provinceOption.value);
      handleProvinceChange({ target: { value: provinceOption.value } });
    }
  };
  
  // Auto-select district in dropdown (เก็บไว้เผื่อฟังก์ชัน manual เลือก)
  const autoSelectDistrict = (districtName) => {
    // First find if there's an exact match
    let districtOption = districts.find(d => d.value === districtName);
    
    // If no exact match, try a less strict comparison
    if (!districtOption) {
      districtOption = districts.find(d => 
        d.value.includes(districtName) || districtName.includes(d.value)
      );
    }
    
    if (districtOption) {
      setSelectedDistrict(districtOption.value);
      handleDistrictChange({ target: { value: districtOption.value } });
    }
  };
  
  // Auto-select subdistrict in dropdown (เก็บไว้เผื่อฟังก์ชัน manual เลือก)
  const autoSelectSubdistrict = (subdistrictName) => {
    // First find if there's an exact match
    let subdistrictOption = subdistricts.find(s => s.value === subdistrictName);
    
    // If no exact match, try a less strict comparison
    if (!subdistrictOption) {
      subdistrictOption = subdistricts.find(s => 
        s.value.includes(subdistrictName) || subdistrictName.includes(s.value)
      );
    }
    
    if (subdistrictOption) {
      setSelectedSubdistrict(subdistrictOption.value);
      handleSubdistrictChange({ target: { value: subdistrictOption.value } });
    }
  };

  const resetSelections = () => {
    setSelectedProvince("");
    setSelectedDistrict("");
    setSelectedSubdistrict("");
    setSelectedZipcode("");
    setDistricts([]);
    setSubdistricts([]);
    setZipcodes([]);
  };

  // Handle province selection
  const handleProvinceChange = (event) => {
    const province = event.target.value;
    setSelectedProvince(province);
    setSelectedDistrict("");
    setSelectedSubdistrict("");
    setSelectedZipcode("");
    setSubdistricts([]);
    setZipcodes([]);

    if (!geoData) return;

    const provinceData = geoData.features.filter(f => f.properties.pro_th === province);
    if (provinceData.length) {
      const uniqueDistricts = [...new Set(provinceData.map(d => d.properties.amp_th))];
      const sortedDistricts = uniqueDistricts.sort((a, b) => a.localeCompare(b, 'th'));
      
      setDistricts(sortedDistricts.map(district => ({
        value: district,
        label: district
      })));
    }
  };

  // Handle district selection
  const handleDistrictChange = (event) => {
    const district = event.target.value;
    setSelectedDistrict(district);
    setSelectedSubdistrict("");
    setSelectedZipcode("");
    setZipcodes([]);

    if (!geoData) return;

    const districtData = geoData.features.filter(
      f => f.properties.pro_th === selectedProvince && f.properties.amp_th === district
    );

    if (districtData.length) {
      const uniqueSubdistricts = [...new Set(districtData.map(d => d.properties.tam_th))];
      const sortedSubdistricts = uniqueSubdistricts.sort((a, b) => a.localeCompare(b, 'th'));
      
      setSubdistricts(sortedSubdistricts.map(subdistrict => ({
        value: subdistrict,
        label: subdistrict
      })));
    }
  };

  // Handle subdistrict selection
  const handleSubdistrictChange = (event) => {
    const subdistrict = event.target.value;
    setSelectedSubdistrict(subdistrict);
    setSelectedZipcode("");

    if (!geoData) return;

    const subdistrictData = geoData.features.filter(
      f => f.properties.pro_th === selectedProvince && 
          f.properties.amp_th === selectedDistrict && 
          f.properties.tam_th === subdistrict
    );

    if (subdistrictData.length) {
      // Assuming zip_code is a property in your GeoJSON
      const uniqueZipcodes = [...new Set(subdistrictData.map(d => d.properties.zip_code))].filter(Boolean);
      const sortedZipcodes = uniqueZipcodes.sort();
      
      setZipcodes(sortedZipcodes.map(zipcode => ({
        value: zipcode,
        label: zipcode
      })));
    }
  };

  // Handle zipcode selection
  const handleZipcodeChange = (event) => {
    setSelectedZipcode(event.target.value);
  };

  return (
    <div className='flex-1 flex flex-col overflow-hidden'>
      <RecordTabBar />
      <div className='flex flex-1 overflow-auto justify-center items-center bg-[#F8F9FA]'>
        <div className="flex w-full max-w-6xl mx-auto bg-white border rounded-xl">
          {/* ฟอร์มด้านซ้าย */}
          <div className="w-full md:w-1/2 pt-8 pr-4 pb-8 pl-8">
            <h2 className="text-xl font-semibold mb-6">ระบุตำแหน่ง</h2>
            
            {loading ? (
              <div className="p-4 text-center">กำลังโหลดข้อมูล...</div>
            ) : (
              <>
                <div className="mb-6 relative">
                  <label className="block text-gray-700 mb-2">จังหวัด</label>
                  <SearchableDropdown
                    options={provinces}
                    value={selectedProvince}
                    onChange={handleProvinceChange}
                    placeholder="กรอกหรือเลือกจังหวัด"
                    disabled={apiLoading}
                  />
                  {apiLoading && <span className="absolute right-10 top-10 text-xs text-blue-500">กำลังอัพเดต...</span>}
                </div>
                
                <div className="mb-6">
                  <label className="block text-gray-700 mb-2">อำเภอ</label>
                  <SearchableDropdown
                    options={districts}
                    value={selectedDistrict}
                    onChange={handleDistrictChange}
                    placeholder="กรอกหรือเลือกอำเภอ"
                    disabled={!selectedProvince || apiLoading}
                  />
                </div>
                
                <div className="mb-6">
                  <label className="block text-gray-700 mb-2">ตำบล</label>
                  <SearchableDropdown
                    options={subdistricts}
                    value={selectedSubdistrict}
                    onChange={handleSubdistrictChange}
                    placeholder="กรอกหรือเลือกตำบล"
                    disabled={!selectedDistrict || apiLoading}
                  />
                </div>
                
                <div className="mb-6">
                  <label className="block text-gray-700 mb-2">รหัสไปรษณีย์</label>
                  <SearchableDropdown
                    options={zipcodes}
                    value={selectedZipcode}
                    onChange={handleZipcodeChange}
                    placeholder="กรอกหรือเลือกรหัสไปรษณีย์"
                    disabled={!selectedSubdistrict || zipcodes.length === 0 || apiLoading}
                  />
                </div>
                
                <div className="mb-6 text-sm text-gray-600">
                  <p>คุณสามารถเลือกพิกัดบนแผนที่ด้านขวา เพื่อให้ระบบเลือกพื้นที่ให้อัตโนมัติ</p>
                </div>
              </>
            )}
          </div>
          {/* แผนที่ด้านขวา */}
          <div className="hidden md:block md:w-1/2 pt-8 pr-8 pb-8 pl-4">
            <div className="w-full h-full" style={{ minHeight: '400px' }}>
              <RecordMap setCoordinates={setCoordinates} />
            </div>
          </div>
        </div>
      </div>
      <RecordBottomBar evidenceData={evidenceData} />
    </div>
  );
};

export default SaveToHistory;