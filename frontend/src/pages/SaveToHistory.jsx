import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import RecordTabBar from '../components/Record/RecordTabBar';
import RecordBottomBar from '../components/Record/RecordBottomBar';
import SearchableDropdown from '../components/Record/SearchableDropdown';
import RecordMap from '../components/Record/RecordMap';
import { IoMapOutline } from "react-icons/io5";
import { 
  fetchProvinces, 
  fetchDistricts, 
  fetchSubdistricts 
} from '../services/geographyService';

const DesktopLayout = (props) => {
  const {
    loading,
    apiLoading,

    evidenceData,
    analysisResult,

    provinces,
    districts,
    subdistricts,

    selectedProvince,
    selectedDistrict,
    selectedSubdistrict,

    selectedProvinceObj,
    selectedDistrictObj,
    selectedSubdistrictObj,

    handleProvinceChange,
    handleDistrictChange,
    handleSubdistrictChange,

    placeName,
    setPlaceName,
    houseNumber,
    setHouseNumber,
    village,
    setVillage,
    soi,
    setSoi,
    road,
    setRoad,

    date,
    time,

    coordinates,
    setCoordinates,
    
    quantity,
    setQuantity
  } = props;
  
  return (
    <div className='flex-1 flex flex-col overflow-hidden'>
      <RecordTabBar />
      <div className='flex flex-1 overflow-auto justify-center items-center bg-[#F8F9FA]'>
        <div className="flex w-full max-w-6xl mx-auto bg-white border rounded-xl" style={{ minHeight: 400 }}>
          {/* ฟอร์มด้านซ้าย */}
          <div className="w-full md:w-1/2 pt-8 pr-4 pb-8 pl-8 flex flex-col max-h-[550px]">
            <h2 className="text-xl font-semibold mb-6">ระบุตำแหน่ง</h2>
            <div className="flex-1 overflow-y-auto">
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
                  {apiLoading && (
                    <span className="absolute right-10 top-10 text-xs text-blue-500">
                      กำลังอัพเดต...
                    </span>
                  )}
                </div>
                <div className="mb-6">
                  <label className="block text-gray-700 mb-2">เขต/อำเภอ</label>
                  <SearchableDropdown
                    options={districts}
                    value={selectedDistrict}
                    onChange={handleDistrictChange}
                    placeholder="กรอกหรือเลือกอำเภอ"
                    disabled={!selectedProvince || apiLoading}
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-gray-700 mb-2">แขวง/ตำบล</label>
                  <SearchableDropdown
                    options={subdistricts}
                    value={selectedSubdistrict}
                    onChange={handleSubdistrictChange}
                    placeholder="กรอกหรือเลือกตำบล"
                    disabled={!selectedDistrict || apiLoading}
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-gray-700 mb-2">สถานที่</label>
                  <input
                    type="text"
                    className="w-full border rounded px-3 py-2"
                    value={placeName}
                    onChange={e => setPlaceName(e.target.value)}
                    placeholder="เช่น วัด โรงเรียน ร้านค้า ฯลฯ"
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-gray-700 mb-2">จำนวน</label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full border rounded px-3 py-2"
                    value={quantity}
                    onChange={e => setQuantity(e.target.value)}
                    placeholder="จำนวน"
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-gray-700 mb-2">บ้านเลขที่</label>
                  <input
                    type="text"
                    className="w-full border rounded px-3 py-2"
                    value={houseNumber}
                    onChange={e => setHouseNumber(e.target.value)}
                    placeholder="บ้านเลขที่"
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-gray-700 mb-2">หมู่</label>
                  <input
                    type="text"
                    className="w-full border rounded px-3 py-2"
                    value={village}
                    onChange={e => setVillage(e.target.value)}
                    placeholder="หมู่ที่"
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-gray-700 mb-2">ซอย</label>
                  <input
                    type="text"
                    className="w-full border rounded px-3 py-2"
                    value={soi}
                    onChange={e => setSoi(e.target.value)}
                    placeholder="ซอย"
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-gray-700 mb-2">ถนน</label>
                  <input
                    type="text"
                    className="w-full border rounded px-3 py-2"
                    value={road}
                    onChange={e => setRoad(e.target.value)}
                    placeholder="ถนน"
                  />
                </div>
              </>
            )}
            </div>
          </div>
          {/* แผนที่ด้านขวา */}
          <div className="hidden md:block md:w-1/2 pt-8 pr-8 pb-8 pl-4">
            <div className="w-full h-full" style={{ minHeight: 400 }}>
              <RecordMap setCoordinates={setCoordinates} />
            </div>
          </div>
        </div>
      </div>
      <RecordBottomBar
        evidenceData={evidenceData}
        analysisResult={analysisResult}

        province={selectedProvinceObj}
        district={selectedDistrictObj}
        subdistrict={selectedSubdistrictObj}

        houseNumber={houseNumber}
        village={village}
        soi={soi}
        road={road}
        placeName={placeName}

        coordinates={coordinates}

        date={date}
        time={time}
        
        quantity={quantity}
      />
    </div>
  )
}

const MobileLayout = (props) => {
  const {
    apiLoading,

    evidenceData,
    analysisResult,

    provinces,
    districts,
    subdistricts,

    selectedProvince,
    selectedDistrict,
    selectedSubdistrict,

    selectedProvinceObj,
    selectedDistrictObj,
    selectedSubdistrictObj,

    handleProvinceChange,
    handleDistrictChange,
    handleSubdistrictChange,

    placeName,
    setPlaceName,
    houseNumber,
    setHouseNumber,
    village,
    setVillage,
    soi,
    setSoi,
    road,
    setRoad,

    date,
    time,

    coordinates,
    setCoordinates,
    
    quantity,
    setQuantity
  } = props;

  const tabBarHeight = 56;
  const bottomBarHeight = 72;

  const handleCoordinatesSelected = (coords) => {
    setCoordinates(coords);
  };

  const [showMapModal, setShowMapModal] = useState(false);
  const mapContainerRef = useRef(null);

  useEffect(() => {
    if (showMapModal && mapContainerRef.current) {
      mapContainerRef.current.style.height = '100%';
      mapContainerRef.current.style.width = '100%';
    }
  }, [showMapModal]);

  return (
    <div className="flex flex-col min-h-screen bg-white relative">
      <div
        className="fixed top-0 left-0 w-full z-20"
        style={{ height: tabBarHeight }}
      >
        <RecordTabBar />
      </div>
      <div
        className="flex-1 overflow-auto bg-white px-4 py-6"
        style={{
          paddingTop: tabBarHeight + 8,
          paddingBottom: bottomBarHeight + 8,
        }}
      >
        {/* ปุ่มเลือกจากแผนที่ด้านขวาบน */}
        <div className="flex justify-end">
          <button
            className="px-4 py-2 border rounded bg-gray-100 text-sm"
            type="button"
            onClick={() => setShowMapModal(true)}
          >
            <IoMapOutline size={16} className="inline mr-1" /> เลือกจากแผนที่
          </button>
        </div>
        <div className="mb-6 relative">
          <label className="block text-gray-700 mb-2">จังหวัด</label>
          <SearchableDropdown
            options={provinces}
            value={selectedProvince}
            onChange={handleProvinceChange}
            placeholder="กรอกหรือเลือกจังหวัด"
            disabled={apiLoading}
          />
          {apiLoading && (
            <span className="absolute right-10 top-10 text-xs text-blue-500">
              กำลังอัพเดต...
            </span>
          )}
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 mb-2">เขต/อำเภอ</label>
          <SearchableDropdown
            options={districts}
            value={selectedDistrict}
            onChange={handleDistrictChange}
            placeholder="กรอกหรือเลือกอำเภอ"
            disabled={!selectedProvince || apiLoading}
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 mb-2">แขวง/ตำบล</label>
          <SearchableDropdown
            options={subdistricts}
            value={selectedSubdistrict}
            onChange={handleSubdistrictChange}
            placeholder="กรอกหรือเลือกตำบล"
            disabled={!selectedDistrict || apiLoading}
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 mb-2">สถานที่</label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2"
            value={placeName}
            onChange={e => setPlaceName(e.target.value)}
            placeholder="เช่น วัด โรงเรียน ร้านค้า ฯลฯ"
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 mb-2">จำนวน</label>
          <input
            type="number"
            step="0.01"
            className="w-full border rounded px-3 py-2"
            value={quantity}
            onChange={e => setQuantity(e.target.value)}
            placeholder="จำนวน"
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 mb-2">บ้านเลขที่</label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2"
            value={houseNumber}
            onChange={e => setHouseNumber(e.target.value)}
            placeholder="บ้านเลขที่"
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 mb-2">หมู่</label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2"
            value={village}
            onChange={e => setVillage(e.target.value)}
            placeholder="หมู่ที่"
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 mb-2">ซอย</label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2"
            value={soi}
            onChange={e => setSoi(e.target.value)}
            placeholder="ซอย"
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 mb-2">ถนน</label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2"
            value={road}
            onChange={e => setRoad(e.target.value)}
            placeholder="ถนน"
          />
        </div>
      </div>
      {/* Fixed BottomBar ด้านล่าง */}
      <div
        className="fixed bottom-0 left-0 w-full z-20 bg-white border-t"
        style={{ height: bottomBarHeight }}
      >
        <RecordBottomBar
          evidenceData={evidenceData}
          analysisResult={analysisResult}

          province={selectedProvinceObj}
          district={selectedDistrictObj}
          subdistrict={selectedSubdistrictObj}

          houseNumber={houseNumber}
          village={village}
          soi={soi}
          road={road}
          placeName={placeName}

          coordinates={coordinates}

          date={date}
          time={time}
          
          quantity={quantity}
        />
      </div>

      {/* Modal แผนที่ */}
      {showMapModal && (
        <div className="fixed inset-0 z-50 flex flex-col">
          <div className="flex justify-between items-right p-4 absolute top-0 right-0 z-10">
            <button 
              className="text-2xl text-black bg-white rounded-full w-8 h-8 flex items-center justify-center shadow-md"
              onClick={() => setShowMapModal(false)}
            >
              X
            </button>
          </div>
          <div className="flex-1 w-full h-full">
            <RecordMap setCoordinates={setCoordinates} />
          </div>
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-xl p-5 shadow-lg">
            <h2 className="text-lg font-semibold mb-2">เลือกตำแหน่ง</h2>
            <p className="text-gray-500 text-sm mb-1">ตำแหน่งของคุณ</p>
            <p className="text-gray-800 mb-4 text-base border-b">
              {coordinates ? (
                <>
                  {placeName ? `${placeName}, ` : ''}
                  {road ? `${road}, ` : ''}
                  {selectedSubdistrict ? `ต.${selectedSubdistrict}, ` : ''} 
                  {selectedDistrict ? `อ.${selectedDistrict}, ` : ''} 
                  {selectedProvince ? `จ.${selectedProvince}` : 'กรุณาเลือกตำแหน่ง'}
                </>
              ) : (
                'กรุณาเลือกตำแหน่งบนแผนที่'
              )}
            </p>
            <div className='py-8'>
              <button
                className="w-full py-3 bg-red-700 text-white rounded-md text-lg font-medium"
                onClick={() => setShowMapModal(false)}
              >
                ยืนยันตำแหน่ง
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const SaveToHistory = () => {
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [apiLoading, setApiLoading] = useState(false);

  const [evidenceData, setEvidenceData] = useState(location.state?.evidence);
  const [analysisResult, setFirearmInfo] = useState(location.state?.analysisResult);

  const [coordinates, setCoordinates] = useState(null);
  const longdo_api_key = import.meta.env.VITE_LONGDO_MAP_API_KEY;
  
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [subdistricts, setSubdistricts] = useState([]);
  const [zipcodes, setZipcodes] = useState([]);

  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedSubdistrict, setSelectedSubdistrict] = useState("");
  const [selectedZipcode, setSelectedZipcode] = useState("");
  
  const [provinceList, setProvinceList] = useState([]);
  const [districtList, setDistrictList] = useState([]);
  const [subdistrictList, setSubdistrictList] = useState([]);

  const [placeName, setPlaceName] = useState("");
  const [houseNumber, setHouseNumber] = useState("");
  const [village, setVillage] = useState("");
  const [soi, setSoi] = useState("");
  const [road, setRoad] = useState("");
  const [quantity, setQuantity] = useState("");

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  useEffect(() => {
    const now = new Date();
    const today = now.toISOString().slice(0, 10);
    const currentTime = now.toTimeString().slice(0, 5);
    setDate(today);
    setTime(currentTime);
  }, []);

  // Load evidence data from location state or localStorage
  useEffect(() => {
    if (location.state?.evidence) {
      setEvidenceData(location.state.evidence);
      try {
        // เก็บข้อมูลวัตถุพยานแบบย่อในกรณีที่มีพื้นที่ localStorage จำกัด
        const minimalEvidenceData = {
          type: location.state.evidence.type,
          id: location.state.evidence.id || null,
          exhibit_id: location.state.evidence.exhibit_id || null,
          result: location.state.evidence.result ? {
            brandName: location.state.evidence.result.brandName,
            modelName: location.state.evidence.result.modelName,
            confidence: location.state.evidence.result.confidence,
            confidence_score: location.state.evidence.result.confidence_score,
            brandConfidence: location.state.evidence.result.brandConfidence,
            prediction: location.state.evidence.result.prediction
          } : null,
        };
        localStorage.setItem('currentEvidenceData', JSON.stringify(minimalEvidenceData));
        
        // แยกเก็บรูปภาพลงใน localStorage
        if (location.state.evidence.imageUrl || location.state.evidence.image_url) {
          localStorage.setItem('analysisImage', location.state.evidence.imageUrl || location.state.evidence.image_url);
        } else if (location.state.image) {
          localStorage.setItem('analysisImage', location.state.image);
        }
      } catch (storageError) {
        console.warn("Failed to store evidence data in localStorage:", storageError);
      }
    } else {
      try {
        const savedData = localStorage.getItem('currentEvidenceData');
        if (savedData) {
          const parsedData = JSON.parse(savedData);
          const analysisImage = localStorage.getItem('analysisImage');
          if (analysisImage) {
            parsedData.imageUrl = analysisImage;
            parsedData.image_url = analysisImage;
          }
          setEvidenceData(parsedData);
        }
      } catch (error) {
        console.error("Error reading from localStorage:", error);
      }
    }
  }, [location.state]);

  // Update the useEffect for analysisResult
  useEffect(() => {
    if (location.state?.analysisResult) {
      setFirearmInfo(location.state.analysisResult);
      try {
        // Store only essential firearm info to prevent quota issues
        const minimalFirearmInfo = {
          id: location.state.analysisResult.id,
          brand: location.state.analysisResult.brand,
          model: location.state.analysisResult.model,
          series: location.state.analysisResult.series,
          mechanism: location.state.analysisResult.mechanism,
          exhibit_id: location.state.analysisResult.exhibit_id
        };
        localStorage.setItem('analysisResult', JSON.stringify(minimalFirearmInfo));
      } catch (storageError) {
        console.warn("Failed to store firearm info in localStorage:", storageError);
        // Continue without saving to localStorage
      }
    } else {
      // Try to get from localStorage if not in state
      try {
        const savedFirearmInfo = localStorage.getItem('analysisResult');
        if (savedFirearmInfo) {
          setFirearmInfo(JSON.parse(savedFirearmInfo));
        }
      } catch (error) {
        console.error("Error reading firearm info from localStorage:", error);
      }
    }
  }, [location.state]);

  // *** แก้ไข: ใช้ geographyService แทน API โดยตรง ***
  useEffect(() => {
    const loadGeographyData = async () => {
      try {
        setLoading(true);
        
        console.log("🌍 Loading geography data using geographyService...");
        
        // ใช้ Promise.all กับ geographyService functions
        const [provincesResult, districtsResult, subdistrictsResult] = await Promise.all([
          fetchProvinces(),
          fetchDistricts(),
          fetchSubdistricts()
        ]);
        
        // ตรวจสอบผลลัพธ์และจัดการ error
        if (provincesResult.success) {
          setProvinceList(provincesResult.data);
          setProvinces(provincesResult.data.map(p => ({
            value: p.province_name,
            label: p.province_name,
            id: p.id
          })));
          console.log("✅ Provinces loaded:", provincesResult.data.length);
        } else {
          console.error("❌ Failed to load provinces:", provincesResult.error);
        }
        
        if (districtsResult.success) {
          setDistrictList(districtsResult.data);
          console.log("✅ Districts loaded:", districtsResult.data.length);
        } else {
          console.error("❌ Failed to load districts:", districtsResult.error);
        }
        
        if (subdistrictsResult.success) {
          setSubdistrictList(subdistrictsResult.data);
          console.log("✅ Subdistricts loaded:", subdistrictsResult.data.length);
        } else {
          console.error("❌ Failed to load subdistricts:", subdistrictsResult.error);
        }
        
        console.log("🌍 Geography data loading completed");
        
      } catch (error) {
        console.error("❌ Error loading geography data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadGeographyData();
  }, []);

  // ดึงตำแหน่งปัจจุบันเมื่อโหลดข้อมูลเสร็จ
  useEffect(() => {
    if (
      provinceList.length > 0 &&
      districtList.length > 0 &&
      subdistrictList.length > 0 &&
      !selectedProvince // ป้องกันไม่ให้ auto fill ซ้ำ
    ) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (pos) => {
          const { latitude, longitude } = pos.coords;
          setApiLoading(true);
          try {
            const response = await fetch(`https://api.longdo.com/map/services/address?lon=${longitude}&lat=${latitude}&noelevation=1&key=${longdo_api_key}`);
            if (response.ok) {
              const data = await response.json();
              if (data.province && data.district && data.subdistrict) {
                const provinceThai = data.province.replace('จ.', '').trim();
                const districtThai = data.district.replace(/^(เขต|อำเภอ|อ\.)\s*/i, '').trim();
                const subdistrictThai = data.subdistrict.replace(/^(แขวง|ตำบล|ต\.)\s*/i, '').trim();

                setPlaceName(data.aoi ? data.aoi : "");
                setRoad(data.road ? data.road : "");

                await updateAllLocations(provinceThai, districtThai, subdistrictThai);
              }
            }
          } catch (e) {
            // ignore
          } finally {
            setApiLoading(false);
          }
        });
      }
    }
  }, [provinceList, districtList, subdistrictList, selectedProvince, longdo_api_key]);

  // Process coordinates when they change using Longdo Map API
  useEffect(() => {
    if (coordinates) {
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

      if (data.province && data.district && data.subdistrict) {
        const provinceThai = data.province.replace('จ.', '').trim();
        const districtThai = data.district.replace(/^(เขต|อำเภอ|อ\.)\s*/i, '').trim();
        const subdistrictThai = data.subdistrict.replace(/^(แขวง|ตำบล|ต\.)\s*/i, '').trim();

        // ถ้าไม่มี aoi หรือ road ให้เคลียร์ค่า
        setPlaceName(data.aoi ? data.aoi : "");
        setRoad(data.road ? data.road : "");

        await updateAllLocations(provinceThai, districtThai, subdistrictThai);
      }
    } catch (error) {
      // ignore
    } finally {
      setApiLoading(false);
    }
  };

  const updateAllLocations = async (provinceName, districtName, subdistrictName) => {
    // 1. หา province
    let provinceObj = provinceList.find(
      p => p.province_name === provinceName ||
           p.province_name.includes(provinceName) ||
           provinceName.includes(p.province_name)
    );
    if (!provinceObj) return;

    setSelectedProvince(provinceObj.province_name);

    // 2. หา district
    const filteredDistricts = districtList.filter(d => d.province_id === provinceObj.id);
    const districtOptions = filteredDistricts.map(d => ({
      value: d.district_name || d.amphoe_t,
      label: d.district_name || d.amphoe_t,
      id: d.id
    }));
    setDistricts(districtOptions);

    let districtObj = filteredDistricts.find(
      d => (d.district_name || d.amphoe_t) === districtName ||
           (d.district_name || d.amphoe_t).includes(districtName) ||
           districtName.includes(d.district_name || d.amphoe_t)
    );
    if (!districtObj) return;

    setSelectedDistrict(districtObj.district_name || districtObj.amphoe_t);

    // 3. หา subdistrict
    const filteredSubdistricts = subdistrictList.filter(sd => sd.district_id === districtObj.id);
    const subdistrictOptions = filteredSubdistricts.map(sd => ({
      value: sd.subdistrict_name || sd.tambon_t,
      label: sd.subdistrict_name || sd.tambon_t,
      id: sd.id,
      zip_code: sd.zip_code
    }));
    setSubdistricts(subdistrictOptions);

    let subdistrictObj = filteredSubdistricts.find(
      sd => (sd.subdistrict_name || sd.tambon_t) === subdistrictName ||
            (sd.subdistrict_name || sd.tambon_t).includes(subdistrictName) ||
            subdistrictName.includes(sd.subdistrict_name || sd.tambon_t)
    );
    if (!subdistrictObj) return;

    setSelectedSubdistrict(subdistrictObj.subdistrict_name || subdistrictObj.tambon_t);

    // 4. หา zipcode
    const zip = subdistrictObj.zip_code;
    setZipcodes(zip ? [{ value: zip, label: zip }] : []);
    if (zip) setSelectedZipcode(zip);
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

    // filter district ตาม province
    const provinceObj = provinceList.find(p => p.province_name === province);
    if (provinceObj) {
      const filteredDistricts = districtList.filter(d => d.province_id === provinceObj.id);
      setDistricts(filteredDistricts.map(d => ({
        value: d.district_name || d.amphoe_t,
        label: d.district_name || d.amphoe_t,
        id: d.id
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

    // filter subdistrict ตาม district
    const districtObj = districtList.find(d => (d.district_name || d.amphoe_t) === district);
    if (districtObj) {
      const filteredSubdistricts = subdistrictList.filter(sd => sd.district_id === districtObj.id);
      setSubdistricts(filteredSubdistricts.map(sd => ({
        value: sd.subdistrict_name || sd.tambon_t,
        label: sd.subdistrict_name || sd.tambon_t,
        id: sd.id,
        zip_code: sd.zip_code
      })));
    }
  };

  // Handle subdistrict selection
  const handleSubdistrictChange = (event) => {
    const subdistrict = event.target.value;
    setSelectedSubdistrict(subdistrict);
    setSelectedZipcode("");

    // filter zipcode ตาม subdistrict
    const subdistrictObj = subdistrictList.find(sd => (sd.subdistrict_name || sd.tambon_t) === subdistrict);
    if (subdistrictObj) {
      const zip = subdistrictObj.zip_code;
      setZipcodes(zip ? [{ value: zip, label: zip }] : []);
      if (zip) setSelectedZipcode(zip);
    }
  };

  // Handle zipcode selection
  const handleZipcodeChange = (event) => {
    setSelectedZipcode(event.target.value);
  };

  // หา object ที่ตรงกับชื่อที่เลือก
  const selectedProvinceObj = provinceList.find(p => p.province_name === selectedProvince);
  const selectedDistrictObj = districtList.find(d => (d.district_name || d.amphoe_t) === selectedDistrict);
  const selectedSubdistrictObj = subdistrictList.find(sd => (sd.subdistrict_name || sd.tambon_t) === selectedSubdistrict);
  
  return (
    <div className="flex-1 h-full w-full overflow-auto">
      <div className="hidden md:flex h-full flex-col">
        <DesktopLayout 
          loading={loading}
          apiLoading={apiLoading}

          evidenceData={evidenceData}
          analysisResult={analysisResult}

          provinces={provinces}
          districts={districts}
          subdistricts={subdistricts}
          zipcodes={zipcodes}

          selectedProvince={selectedProvince}
          selectedDistrict={selectedDistrict}
          selectedSubdistrict={selectedSubdistrict}

          selectedProvinceObj={selectedProvinceObj}
          selectedDistrictObj={selectedDistrictObj}
          selectedSubdistrictObj={selectedSubdistrictObj}

          handleProvinceChange={handleProvinceChange}
          handleDistrictChange={handleDistrictChange}
          handleSubdistrictChange={handleSubdistrictChange}

          placeName={placeName}
          setPlaceName={setPlaceName}
          houseNumber={houseNumber}
          setHouseNumber={setHouseNumber}
          village={village}
          setVillage={setVillage}
          soi={soi}
          setSoi={setSoi}
          road={road}
          setRoad={setRoad}

          date={date}
          time={time}

          coordinates={coordinates}
          setCoordinates={setCoordinates}
          
          quantity={quantity}
          setQuantity={setQuantity}
        />
      </div>
      <div className="md:hidden h-full">
        <MobileLayout
          apiLoading={apiLoading}

          evidenceData={evidenceData}
          analysisResult={analysisResult}

          provinces={provinces}
          districts={districts}
          subdistricts={subdistricts}

          selectedProvince={selectedProvince}
          selectedDistrict={selectedDistrict}
          selectedSubdistrict={selectedSubdistrict}

          selectedProvinceObj={selectedProvinceObj}
          selectedDistrictObj={selectedDistrictObj}
          selectedSubdistrictObj={selectedSubdistrictObj}

          handleProvinceChange={handleProvinceChange}
          handleDistrictChange={handleDistrictChange}
          handleSubdistrictChange={handleSubdistrictChange}

          placeName={placeName}
          setPlaceName={setPlaceName}
          houseNumber={houseNumber}
          setHouseNumber={setHouseNumber}
          village={village}
          setVillage={setVillage}
          soi={soi}
          setSoi={setSoi}
          road={road}
          setRoad={setRoad}

          date={date}
          time={time}

          coordinates={coordinates}
          setCoordinates={setCoordinates}
          
          quantity={quantity}
          setQuantity={setQuantity}
        />
      </div>
    </div>
  )
}

export default SaveToHistory
