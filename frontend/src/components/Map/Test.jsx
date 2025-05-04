import React, { useEffect, useRef, useState, useCallback } from "react";
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import drugDiscoveries from '../../data/drugDiscoveries';

const LeafletMap = () => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [geoData, setGeoData] = useState(null);
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedSubdistrict, setSelectedSubdistrict] = useState("");
  const [districts, setDistricts] = useState([]);
  const [subdistricts, setSubdistricts] = useState([]);
  const [timeFilter, setTimeFilter] = useState("all");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);
  const [timeFilterLabel, setTimeFilterLabel] = useState("ทั้งหมด");
  const [markers, setMarkers] = useState([]);

  useEffect(() => {
    fetch('/data/subdistricts.geojson')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        setGeoData(data);
        resetSelections();
      })
      .catch(error => {
        console.error('Error loading GeoJSON:', error);
      });
  }, []);

  const resetSelections = () => {
    setSelectedProvince("");
    setSelectedDistrict("");
    setSelectedSubdistrict("");
    setDistricts([]);
    setSubdistricts([]);
  };

  useEffect(() => {
    console.log('Map ref:', mapRef.current);
    
    if (!mapRef.current) {
      console.log('Map container not ready');
      return;
    }

    if (mapInstanceRef.current) {
      console.log('Map instance already exists');
      return;
    }

    console.log('Creating new map instance');
    const map = L.map(mapRef.current).setView([13.743757, 100.510847], 5);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  const goToLocation = useCallback((center, zoom) => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([center.lat, center.lon], zoom);
    }
  }, []);

  const handleProvinceChange = useCallback((event) => {
    const province = event.target.value;
    setSelectedProvince(province);
    setSelectedDistrict("");
    setSelectedSubdistrict("");
    setSubdistricts([]);

    if (!geoData) return;

    const provinceData = geoData.features.filter(f => f.properties.pro_th === province);
    if (provinceData.length && mapInstanceRef.current) {
      try {
        const coordinates = provinceData[0].geometry.coordinates[0][0];
        const center = calculateCenter(coordinates);
        goToLocation(center, 8);
        
        const uniqueDistricts = [...new Set(provinceData.map(d => d.properties.amp_th))];
        setDistricts(uniqueDistricts.sort((a, b) => a.localeCompare(b, 'th')));
      } catch (error) {
        console.error('Error processing province data:', error);
      }
    }
  }, [geoData, goToLocation]);

  const handleDistrictChange = useCallback((event) => {
    const district = event.target.value;
    setSelectedDistrict(district);
    setSelectedSubdistrict("");

    if (!geoData) return;

    const districtData = geoData.features.filter(
      f => f.properties.pro_th === selectedProvince && f.properties.amp_th === district
    );

    if (districtData.length && mapInstanceRef.current) {
      try {
        const coordinates = districtData[0].geometry.coordinates[0][0];
        const center = calculateCenter(coordinates);
        goToLocation(center, 10);

        const uniqueSubdistricts = [...new Set(districtData.map(d => d.properties.tam_th))];
        setSubdistricts(uniqueSubdistricts.sort((a, b) => a.localeCompare(b, 'th')));
      } catch (error) {
        console.error('Error processing district data:', error);
      }
    }
  }, [geoData, selectedProvince, goToLocation]);

  const handleSubdistrictChange = useCallback((event) => {
    const subdistrict = event.target.value;
    setSelectedSubdistrict(subdistrict);

    if (!geoData) return;

    const subdistrictData = geoData.features.find(
      f => f.properties.pro_th === selectedProvince && 
          f.properties.amp_th === selectedDistrict && 
          f.properties.tam_th === subdistrict
    );

    if (subdistrictData && mapInstanceRef.current) {
      try {
        const coordinates = subdistrictData.geometry.coordinates[0][0];
        const center = calculateCenter(coordinates);
        goToLocation(center, 12);
      } catch (error) {
        console.error('Error processing subdistrict data:', error);
      }
    }
  }, [geoData, selectedProvince, selectedDistrict, goToLocation]);

  const formatDateThai = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear() + 543;
    return `${day}/${month}/${year}`;
  };

  const handleTimeFilterChange = useCallback((event) => {
    const selectedTimeFilter = event.target.value;
    setTimeFilter(selectedTimeFilter);
    
    if (selectedTimeFilter === "custom") {
      setShowCustomDatePicker(true);
    } else {
      setShowCustomDatePicker(false);
      updateTimeFilterLabel(selectedTimeFilter);
      applyTimeFilter(selectedTimeFilter);
    }
  }, []);

  const updateTimeFilterLabel = useCallback((filter) => {
    let label;
    const currentDate = new Date();
    
    switch (filter) {
      case "today":
        label = `วันนี้ (${formatDateThai(currentDate.toISOString().split('T')[0])})`;
        break;
      case "7days":
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        label = `7 วัน (${formatDateThai(sevenDaysAgo.toISOString().split('T')[0])} - ${formatDateThai(currentDate.toISOString().split('T')[0])})`;
        break;
      case "1month":
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        label = `1 เดือน (${formatDateThai(oneMonthAgo.toISOString().split('T')[0])} - ${formatDateThai(currentDate.toISOString().split('T')[0])})`;
        break;
      case "1year":
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        label = `1 ปี (${formatDateThai(oneYearAgo.toISOString().split('T')[0])} - ${formatDateThai(currentDate.toISOString().split('T')[0])})`;
        break;
      case "custom":
        if (customStartDate && customEndDate) {
          label = `${formatDateThai(customStartDate)} - ${formatDateThai(customEndDate)}`;
        } else {
          label = "กำหนดเอง";
        }
        break;
      case "all":
      default:
        label = "ทั้งหมด";
    }
    
    setTimeFilterLabel(label);
  }, [customStartDate, customEndDate]);

  const handleCustomDateApply = useCallback(() => {
    if (customStartDate && customEndDate) {
      updateTimeFilterLabel("custom");
      applyTimeFilter("custom");
      setShowCustomDatePicker(false);
    }
  }, [customStartDate, customEndDate, updateTimeFilterLabel]);

  const applyTimeFilter = useCallback((filter) => {
    console.log(`Applying time filter: ${filter}`);
    
    let startDate, endDate;
    const currentDate = new Date();
    
    switch (filter) {
      case "today":
        startDate = new Date(currentDate.setHours(0, 0, 0, 0));
        endDate = new Date();
        break;
      case "7days":
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
        endDate = new Date();
        break;
      case "1month":
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 1);
        endDate = new Date();
        break;
      case "1year":
        startDate = new Date();
        startDate.setFullYear(startDate.getFullYear() - 1);
        endDate = new Date();
        break;
      case "custom":
        startDate = new Date(customStartDate);
        endDate = new Date(customEndDate);
        break;
      case "all":
      default:
        startDate = null;
        endDate = null;
    }

    if (startDate && endDate && geoData) {
      console.log(`Filtering data from ${startDate.toISOString()} to ${endDate.toISOString()}`);
    }
  }, [customStartDate, customEndDate, geoData]);

  const calculateCenter = (coordinates) => {
    let sumLon = 0, sumLat = 0;
    coordinates.forEach(coord => {
      sumLon += coord[0];
      sumLat += coord[1];
    });
    return {
      lon: sumLon / coordinates.length,
      lat: sumLat / coordinates.length
    };
  };

  const createMarkers = useCallback(() => {
    if (!mapInstanceRef.current) return;

    markers.forEach(marker => marker.remove());

    let filteredData = drugDiscoveries;

    if (selectedProvince) {
      filteredData = filteredData.filter(d => d.province === selectedProvince);
      if (selectedDistrict) {
        filteredData = filteredData.filter(d => d.district === selectedDistrict);
        if (selectedSubdistrict) {
          filteredData = filteredData.filter(d => d.subdistrict === selectedSubdistrict);
        }
      }
    }

    if (timeFilter !== 'all') {
      const now = new Date();
      let startDate, endDate;

      switch (timeFilter) {
        case 'today':
          startDate = new Date(now.setHours(0, 0, 0, 0));
          endDate = new Date();
          break;
        case 'custom':
          startDate = new Date(customStartDate);
          endDate = new Date(customEndDate);
          break;
      }

      if (startDate && endDate) {
        filteredData = filteredData.filter(d => {
          const discoveryDate = new Date(d.date);
          return discoveryDate >= startDate && discoveryDate <= endDate;
        });
      }
    }

    const newMarkers = filteredData.map(discovery => {
      const marker = L.marker([discovery.location.lat, discovery.location.lng])
        .addTo(mapInstanceRef.current)
        .bindPopup(`
          <b>ประเภท:</b> ${discovery.drugType}<br>
          <b>ปริมาณ:</b> ${discovery.quantity} ${discovery.unit}<br>
          <b>สถานที่:</b> ต.${discovery.subdistrict} อ.${discovery.district} จ.${discovery.province}<br>
          <b>วันที่พบ:</b> ${formatDateThai(discovery.date)}
        `);
      return marker;
    });

    setMarkers(newMarkers);
  }, [selectedProvince, selectedDistrict, selectedSubdistrict, timeFilter, customStartDate, customEndDate]);

  useEffect(() => {
    createMarkers();
  }, [createMarkers]);

  if (!geoData) return <div>Loading...</div>;

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
      <select 
        id="provinceDropdown" 
        value={selectedProvince}
        onChange={handleProvinceChange}
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          zIndex: 1000,
          padding: '8px',
          borderRadius: '4px',
          border: '1px solid #ccc',
          backgroundColor: 'white',
          minWidth: '200px'
        }}
      >
        <option value="" disabled>เลือกจังหวัด</option>
        {geoData.features
          .filter((feature, index, self) => 
            index === self.findIndex((f) => f.properties.pro_th === feature.properties.pro_th)
          )
          .sort((a, b) => 
            a.properties.pro_th.localeCompare(b.properties.pro_th, 'th')
          )
          .map(feature => (
            <option key={feature.properties.pro_code} value={feature.properties.pro_th}>
              {feature.properties.pro_th}
            </option>
          ))
        }
      </select>

      <select 
        id="districtDropdown" 
        value={selectedDistrict}
        onChange={handleDistrictChange}
        disabled={!selectedProvince}
        style={{
          position: 'absolute',
          top: '20px',
          left: '250px',
          zIndex: 1000,
          padding: '8px',
          borderRadius: '4px',
          border: '1px solid #ccc',
          backgroundColor: 'white',
          minWidth: '200px'
        }}
      >
        <option value="" disabled>เลือกอำเภอ</option>
        {districts.map(district => (
          <option key={district} value={district}>
            {district}
          </option>
        ))}
      </select>

      <select 
        id="subdistrictDropdown" 
        value={selectedSubdistrict}
        onChange={handleSubdistrictChange}
        disabled={!selectedDistrict}
        style={{
          position: 'absolute',
          top: '20px',
          left: '500px',
          zIndex: 1000,
          padding: '8px',
          borderRadius: '4px',
          border: '1px solid #ccc',
          backgroundColor: 'white',
          minWidth: '200px'
        }}
      >
        <option value="" disabled>เลือกตำบล</option>
        {subdistricts.map(subdistrict => (
          <option key={subdistrict} value={subdistrict}>
            {subdistrict}
          </option>
        ))}
      </select>

      <select
        id="timeFilterDropdown"
        value={timeFilter}
        onChange={handleTimeFilterChange}
        style={{
          position: 'absolute',
          top: '20px',
          left: '750px',
          zIndex: 1000,
          padding: '8px',
          borderRadius: '4px',
          border: '1px solid #ccc',
          backgroundColor: 'white',
          minWidth: '200px'
        }}
      >
        <option value="all">ทั้งหมด</option>
        <option value="today">วันนี้</option>
        <option value="7days">7 วัน</option>
        <option value="1month">1 เดือน</option>
        <option value="1year">1 ปี</option>
        <option value="custom">{timeFilter === "custom" ? timeFilterLabel : "กำหนดเอง"}</option>
      </select>

      {showCustomDatePicker && (
        <div
          style={{
            position: 'absolute',
            top: '60px',
            left: '750px',
            zIndex: 1000,
            padding: '15px',
            borderRadius: '4px',
            border: '1px solid #ccc',
            backgroundColor: 'white',
            width: '250px',
            boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
          }}
        >
          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>วันเริ่มต้น:</label>
            <input
              type="date"
              value={customStartDate}
              onChange={(e) => setCustomStartDate(e.target.value)}
              style={{
                width: '100%',
                padding: '6px',
                borderRadius: '4px',
                border: '1px solid #ccc'
              }}
            />
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>วันสิ้นสุด:</label>
            <input
              type="date"
              value={customEndDate}
              onChange={(e) => setCustomEndDate(e.target.value)}
              style={{
                width: '100%',
                padding: '6px',
                borderRadius: '4px',
                border: '1px solid #ccc'
              }}
            />
          </div>
          <button
            onClick={handleCustomDateApply}
            style={{
              padding: '8px 12px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              width: '100%'
            }}
          >
            ตกลง
          </button>
        </div>
      )}

      <div 
        ref={mapRef} 
        id="map" 
        style={{ 
          height: '100%',
          width: '100%',
          zIndex: 1
        }} 
      />
    </div>
  );
};

export default LeafletMap;