import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import apiConfig from '../../config/api';

const API_PATH = '/api';

const SvgMap = ({ 
  // รับ props จาก parent component
  selectedProvinces = [], 
  selectedDistricts = [], 
  selectedSubdistricts = [], 
  visibleLevels = { province: true, district: false, subdistrict: false },
  onProvinceClick = () => {}, 
  onDistrictSelect = () => {}, 
  onSubdistrictSelect = () => {},
  onSelectionChange = () => {}
}) => {
  // --- State ---
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [subdistricts, setSubdistricts] = useState([]);
  const [loadingProvinces, setLoadingProvinces] = useState(true);
  const [loadingDistricts, setLoadingDistricts] = useState(true);
  const [loadingSubdistricts, setLoadingSubdistricts] = useState(true);
  const [showFilter, setShowFilter] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedProvinces, setExpandedProvinces] = useState({});
  const [expandedDistricts, setExpandedDistricts] = useState({});
  const [zoomLevel, setZoomLevel] = useState(1);
  const [viewBoxOffset, setViewBoxOffset] = useState({ x: 0, y: 0 });
  const svgRef = useRef(null);
  const isDragging = useRef(false);
  const lastDragPosition = useRef(null);
  const zoomLevelRef = useRef(zoomLevel);

  useEffect(() => { zoomLevelRef.current = zoomLevel; }, [zoomLevel]);

  // --- Data Fetching ---
  useEffect(() => {
    const fetchProvinces = async () => {
      setLoadingProvinces(true);
      try {
        const provincesResponse = await axios.get(`${apiConfig.baseUrl}${API_PATH}/provinces`);
        setProvinces(provincesResponse.data);
      } catch (error) {
        console.error('Error fetching provinces:', error);
      } finally {
        setLoadingProvinces(false);
      }
    };
    fetchProvinces();
  }, []);

  useEffect(() => {
    const fetchAllDistricts = async () => {
      setLoadingDistricts(true);
      try {
        const districtsResponse = await axios.get(`${apiConfig.baseUrl}${API_PATH}/districts`);
        setDistricts(districtsResponse.data.map(d => ({
          ...d,
          province_id: d.province_id || d.prov_id || null
        })));
      } catch (error) {
        console.error('Error fetching districts:', error);
      } finally {
        setLoadingDistricts(false);
      }
    };
    fetchAllDistricts();
  }, []);

  useEffect(() => {
    const fetchAllSubDistricts = async () => {
      setLoadingSubdistricts(true);
      try {
        const subdistrictsResponse = await axios.get(`${apiConfig.baseUrl}${API_PATH}/subdistricts`);
        setSubdistricts(subdistrictsResponse.data.map(sd => ({
          ...sd,
          district_id: sd.district_id || null
        })));
      } catch (error) {
        console.error('Error fetching subdistricts:', error);
      } finally {
        setLoadingSubdistricts(false);
      }
    };
    fetchAllSubDistricts();
  }, []);

  // --- SVG Path Creation ---
  const createSVGPath = useCallback((coordinates) => {
    if (!coordinates || coordinates.length === 0) return '';
    let pathData = '';
    coordinates.forEach((polygon) => {
      polygon.forEach((ring) => {
        const ringPath = ring.map((point, i) => {
          if (!Array.isArray(point) || point.length < 2 || typeof point[0] !== 'number' || typeof point[1] !== 'number') {
            return '';
          }
          const [lng, lat] = point;
          return `${i === 0 ? 'M' : 'L'} ${lng} ${-lat}`;
        }).join(' ');
        pathData += ringPath + (ringPath.length > 0 ? ' Z ' : '');
      });
    });
    return pathData;
  }, []);

  // --- Bounds Calculation ---
  const calculateBounds = useCallback((items) => {
    const defaultBounds = { minX: 97, minY: -21, maxX: 106, maxY: -5 };
    if (!items || items.length === 0) return defaultBounds;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    let hasValidCoords = false;
    items.forEach(item => {
      const geometry = item.geometry || item.geom;
      const coords = geometry?.coordinates;
      if (coords) {
        coords.forEach(polygon => {
          polygon.forEach(ring => {
            ring.forEach(point => {
              if (Array.isArray(point) && point.length >= 2 && typeof point[0] === 'number' && typeof point[1] === 'number') {
                const [lng, lat] = point;
                minX = Math.min(minX, lng);
                minY = Math.min(minY, -lat);
                maxX = Math.max(maxX, lng);
                maxY = Math.max(maxY, -lat);
                hasValidCoords = true;
              }
            });
          });
        });
      }
    });
    if (!hasValidCoords) return defaultBounds;
    return { minX, minY, maxX, maxY };
  }, []);

  // --- Selection Handling ---
  // ใช้ props แทน state ภายใน
  const handleProvinceClick = useCallback((province, forceSelect = false) => {
    // เรียกใช้ handler จาก props แทน
    onProvinceClick(province, forceSelect);
  }, [onProvinceClick]);

  const handleDistrictSelect = useCallback((district, isSelected, forceSelect = false) => {
    // เรียกใช้ handler จาก props แทน
    onDistrictSelect(district, isSelected, forceSelect);
  }, [onDistrictSelect]);

  const handleSubdistrictSelect = useCallback((subdistrict, isSelected, forceSelect = false) => {
    // เรียกใช้ handler จาก props แทน
    onSubdistrictSelect(subdistrict, isSelected, forceSelect);
  }, [onSubdistrictSelect]);

  // เปลี่ยนเป็นใช้ข้อมูลจาก props
  const isProvinceSelected = useCallback((province) => {
    return selectedProvinces.some(p => p.id === province.id);
  }, [selectedProvinces]);

  const isDistrictSelected = useCallback((district) => {
    return selectedDistricts.some(d => d.id === district.id);
  }, [selectedDistricts]);

  const isSubdistrictSelected = useCallback((subdistrict) => {
    return selectedSubdistricts.some(sd => sd.id === subdistrict.id);
  }, [selectedSubdistricts]);

  // --- Filtering and Expansion Logic ---
  const toggleProvinceExpansion = useCallback((provinceId) => {
    setExpandedProvinces(prev => ({
      ...prev,
      [provinceId]: !prev[provinceId]
    }));
  }, []);

  const toggleDistrictExpansion = useCallback((districtId) => {
    setExpandedDistricts(prev => ({
      ...prev,
      [districtId]: !prev[districtId]
    }));
  }, []);

  const getFilteredData = useCallback(() => {
    if (!searchTerm.trim()) {
      return provinces.map(province => {
        const provinceDistricts = districts.filter(d => d.province_id === province.id);
        return {
          province,
          districts: provinceDistricts.map(district => ({
            ...district,
            subdistricts: subdistricts.filter(sd => sd.district_id === district.id)
          }))
        };
      });
    }
    const term = searchTerm.toLowerCase().trim();
    const matchingProvinces = provinces.filter(province => 
      province.province_name?.toLowerCase().includes(term)
    );
    const matchingDistricts = districts.filter(district => 
      (district.district_name || district.amphoe_t || '')
        ?.toLowerCase().includes(term)
    );
    const matchingSubdistricts = subdistricts.filter(subdistrict => 
      (subdistrict.subdistrict_name || subdistrict.tambon_t || '')
        ?.toLowerCase().includes(term)
    );
    const matchingDistrictProvinceIds = new Set(
      matchingDistricts.map(d => d.province_id)
    );
    const matchingSubdistrictProvinceIds = new Set(
      matchingSubdistricts.map(sd => sd.province_id)
    );
    const allMatchingProvinceIds = new Set([
      ...matchingProvinces.map(p => p.id),
      ...matchingDistrictProvinceIds,
      ...matchingSubdistrictProvinceIds
    ]);
    const allMatchingProvinces = provinces.filter(p => allMatchingProvinceIds.has(p.id));
    return allMatchingProvinces.map(province => {
      if (matchingProvinces.some(p => p.id === province.id)) {
        return {
          province,
          districts: districts.filter(d => d.province_id === province.id).map(district => ({
            ...district,
            subdistricts: subdistricts.filter(sd => sd.district_id === district.id)
          }))
        };
      } else {
        const matchingDistrictsInProvince = matchingDistricts.filter(d => d.province_id === province.id);
        return {
          province,
          districts: matchingDistrictsInProvince.map(district => ({
            ...district,
            subdistricts: matchingSubdistricts.filter(sd => sd.district_id === district.id)
          }))
        };
      }
    });
  }, [provinces, districts, subdistricts, searchTerm]);

  // --- UI Toggles and Handlers ---
  const toggleFilter = useCallback(() => {
    setShowFilter(prev => !prev);
  }, []);

  // --- Zoom & Pan ---
  const handleZoomIn = useCallback(() => {
    setZoomLevel(prev => Math.min(prev * 1.2, 10));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoomLevel(prev => Math.max(prev / 1.2, 0.5));
  }, []);

  const handleResetZoom = useCallback(() => {
    setZoomLevel(1);
    setViewBoxOffset({ x: 0, y: 0 });
  }, []);

  const handleMouseDown = useCallback((e) => {
    if (e.button !== 0) return;
    isDragging.current = true;
    lastDragPosition.current = { x: e.clientX, y: e.clientY };
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging.current || !lastDragPosition.current) return;
    const dx = (e.clientX - lastDragPosition.current.x) / zoomLevel;
    const dy = (e.clientY - lastDragPosition.current.y) / zoomLevel;
    const svgEl = svgRef.current;
    if (!svgEl) return;
    const viewBox = svgEl.viewBox.baseVal;
    const viewBoxWidth = viewBox.width;
    const viewBoxHeight = viewBox.height;
    const scaleFactor = 0.005;
    setViewBoxOffset(prev => ({
      x: prev.x - dx * scaleFactor * viewBoxWidth,
      y: prev.y - dy * scaleFactor * viewBoxHeight
    }));
    lastDragPosition.current = { x: e.clientX, y: e.clientY };
  }, [zoomLevel]);

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
    lastDragPosition.current = null;
  }, []);

  const getViewBox = useCallback(() => {
    let bounds;
    let dataSet;
    let padding;
    if (selectedSubdistricts.length > 0) {
      dataSet = selectedSubdistricts;
      bounds = calculateBounds(dataSet);
      padding = 0.02;
    } else if (selectedDistricts.length > 0) {
      dataSet = selectedDistricts;
      bounds = calculateBounds(dataSet);
      padding = 0.05;
    } else if (selectedProvinces.length > 0) {
      dataSet = selectedProvinces;
      bounds = calculateBounds(dataSet);
      padding = 0.1;
    } else {
      dataSet = provinces;
      bounds = calculateBounds(dataSet);
      padding = 0.5;
    }
    const viewBoxWidth = (bounds.maxX - bounds.minX) + padding * 2;
    const viewBoxHeight = (bounds.maxY - bounds.minY) + padding * 2;
    const finalWidth = Math.max(viewBoxWidth, 0.1) / zoomLevel;
    const finalHeight = Math.max(viewBoxHeight, 0.1) / zoomLevel;
    const centerX = (bounds.minX + bounds.maxX) / 2;
    const centerY = (bounds.minY + bounds.maxY) / 2;
    const zoomedMinX = centerX - finalWidth/2 + viewBoxOffset.x;
    const zoomedMinY = centerY - finalHeight/2 + viewBoxOffset.y;
    return `${zoomedMinX} ${zoomedMinY} ${finalWidth} ${finalHeight}`;
  }, [selectedProvinces, selectedDistricts, selectedSubdistricts, provinces, calculateBounds, zoomLevel, viewBoxOffset]);

  const handleWheel = useCallback((e) => {
    e.preventDefault();
    let zoomDelta = -e.deltaY;
    const normalizedDelta = Math.sign(zoomDelta) * Math.min(Math.abs(zoomDelta) * 0.01, 0.1);
    setZoomLevel(prevZoomLevel => {
      const newZoomLevel = Math.max(0.5, Math.min(10, prevZoomLevel * (1 + normalizedDelta)));
      if (newZoomLevel !== prevZoomLevel) {
        if (svgRef.current) {
          const svgElement = svgRef.current;
          const rect = svgElement.getBoundingClientRect();
          const mouseX = e.clientX - rect.left;
          const mouseY = e.clientY - rect.top;
          const viewBox = svgElement.viewBox.baseVal;
          const viewBoxWidth = viewBox.width;
          const viewBoxHeight = viewBox.height;
          const relativeX = mouseX / rect.width;
          const relativeY = mouseY / rect.height;
          const localZoomFactor = newZoomLevel / prevZoomLevel;
          const dx = viewBoxWidth * (1 - 1 / localZoomFactor) * relativeX;
          const dy = viewBoxHeight * (1 - 1 / localZoomFactor) * relativeY;
          setViewBoxOffset(prev => ({
            x: prev.x + dx * 0.5,
            y: prev.y + dy * 0.5
          }));
        }
      }
      return newZoomLevel;
    });
  }, []);

  const handleFitToView = useCallback(() => {
    setZoomLevel(1);
    setViewBoxOffset({ x: 0, y: 0 });
  }, []);

  useEffect(() => {
    const svgElement = svgRef.current;
    if (svgElement) {
      const wheelHandler = (e) => { handleWheel(e); };
      svgElement.addEventListener('wheel', wheelHandler, { passive: false });
      let lastTouchDistance = 0;
      const touchStartHandler = (e) => {
        if (e.touches.length === 2) {
          const dx = e.touches[0].clientX - e.touches[1].clientX;
          const dy = e.touches[0].clientY - e.touches[1].clientY;
          lastTouchDistance = Math.sqrt(dx * dx + dy * dy);
        }
      };
      const touchMoveHandler = (e) => {
        if (e.touches.length === 2) {
          e.preventDefault();
          const dx = e.touches[0].clientX - e.touches[1].clientX;
          const dy = e.touches[0].clientY - e.touches[1].clientY;
          const newDistance = Math.sqrt(dx * dx + dy * dy);
          if (lastTouchDistance > 0) {
            const touchZoomFactor = newDistance / lastTouchDistance;
            const newZoom = Math.max(0.5, Math.min(10, zoomLevelRef.current * touchZoomFactor));
            const centerX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
            const centerY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
            if (svgRef.current) {
              const rect = svgRef.current.getBoundingClientRect();
              const relativeX = (centerX - rect.left) / rect.width;
              const relativeY = (centerY - rect.top) / rect.height;
              const viewBox = svgRef.current.viewBox.baseVal;
              const viewBoxWidth = viewBox.width;
              const viewBoxHeight = viewBox.height;
              const dx = viewBoxWidth * (1 - touchZoomFactor) * relativeX;
              const dy = viewBoxHeight * (1 - touchZoomFactor) * relativeY;
              setZoomLevel(newZoom);
              setViewBoxOffset(prev => ({
                x: prev.x + dx * 0.5,
                y: prev.y + dy * 0.5
              }));
            } else {
              setZoomLevel(newZoom);
            }
          }
          lastTouchDistance = newDistance;
        }
      };
      svgElement.addEventListener('touchstart', touchStartHandler);
      svgElement.addEventListener('touchmove', touchMoveHandler, { passive: false });
      return () => {
        svgElement.removeEventListener('wheel', wheelHandler);
        svgElement.removeEventListener('touchstart', touchStartHandler);
        svgElement.removeEventListener('touchmove', touchMoveHandler);
      };
    }
  }, [handleWheel]);

  // --- Loading State ---
  if (loadingProvinces || loadingDistricts || loadingSubdistricts) {
    return <div className="flex items-center justify-center h-full text-xl">กำลังโหลดข้อมูลแผนที่...</div>;
  }

  return (
    <div className="relative w-full h-full bg-gray-100 overflow-hidden">
      {/* Map SVG */}
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        viewBox={getViewBox()}
        preserveAspectRatio="xMidYMid meet"
        style={{ backgroundColor: '#f0f4f8', cursor: isDragging.current ? 'grabbing' : 'grab' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Draw Province Boundaries */}
        {visibleLevels.province && provinces.map((province) => {
          if (!province.geometry || !province.geometry.coordinates) return null;
          const isSelected = isProvinceSelected(province);
          const provincePath = createSVGPath(province.geometry.coordinates);
          if (!provincePath) return null;
          return (
            <path
              key={`province-${province.id}`}
              d={provincePath}
              fill={isSelected ? "#63b3ed" : "#e2e8f0"}
              stroke="#4a5568"
              strokeWidth={0.005}
              onClick={() => handleProvinceClick(province, true)}
              className="transition-colors duration-200 cursor-pointer hover:fill-blue-300"
              data-province-name={province.province_name}
            />
          );
        })}

        {/* Draw District Boundaries */}
        {visibleLevels.district && districts.map((district) => {
          const coordinates = district.geometry?.coordinates || district.geom?.coordinates;
          if (!coordinates) return null;
          const isSelected = isDistrictSelected(district);
          const districtPath = createSVGPath(coordinates);
          if (!districtPath) return null;
          return (
            <path
              key={`district-${district.id}`}
              d={districtPath}
              fill={isSelected ? "rgba(237, 137, 54, 0.6)" : "none"}
              stroke={isSelected ? "#dd6b20" : "#a0aec0"}
              strokeWidth={isSelected ? 0.004 : 0.002}
              strokeDasharray={isSelected ? "none" : "0.004 0.004"}
              onClick={() => handleDistrictSelect(district, false, true)}
              className="transition-all duration-200 cursor-pointer"
              data-district-name={district.district_name || district.amphoe_t}
            />
          );
        })}

        {/* Draw Subdistrict Boundaries */}
        {visibleLevels.subdistrict && subdistricts.map((subdistrict) => {
          const coordinates = subdistrict.geometry?.coordinates || subdistrict.geom?.coordinates;
          if (!coordinates) return null;
          const isSelected = isSubdistrictSelected(subdistrict);
          const subdistrictPath = createSVGPath(coordinates);
          if (!subdistrictPath) return null;
          return (
            <path
              key={`subdistrict-${subdistrict.id}`}
              d={subdistrictPath}
              fill={isSelected ? "rgba(94, 179, 148, 0.6)" : "none"}
              stroke={isSelected ? "#38a169" : "#cbd5e0"}
              strokeWidth={isSelected ? 0.004 : 0.002}
              strokeDasharray={isSelected ? "none" : "0.004 0.004"}
              onClick={() => handleSubdistrictSelect(subdistrict, false, true)}
              className="transition-all duration-200 cursor-pointer"
              data-subdistrict-name={subdistrict.subdistrict_name || subdistrict.tambon_t}
            />
          );
        })}
      </svg>

      {/* Zoom Controls */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-20">
        <button 
          className="bg-white p-2 rounded-full shadow-md hover:bg-gray-100 transition-colors duration-200 flex items-center justify-center"
          onClick={handleZoomIn}
          title="ซูมเข้า"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </button>
        <button 
          className="bg-white p-2 rounded-full shadow-md hover:bg-gray-100 transition-colors duration-200 flex items-center justify-center"
          onClick={handleZoomOut}
          title="ซูมออก"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" />
          </svg>
        </button>
        <button 
          className="bg-white p-2 rounded-full shadow-md hover:bg-gray-100 transition-colors duration-200 flex items-center justify-center"
          onClick={handleFitToView}
          title="พอดีกับหน้าจอ"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 0h-4m4 0l-5-5" />
          </svg>
        </button>
        <button 
          className="bg-white p-2 rounded-full shadow-md hover:bg-gray-100 transition-colors duration-200 flex items-center justify-center"
          onClick={handleResetZoom}
          title="รีเซ็ตการซูม"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {/* Zoom Level Indicator */}
      <div className="absolute bottom-4 left-4 bg-white bg-opacity-75 px-2 py-1 rounded-md shadow-md z-20 text-xs">
        ซูม: {Math.round(zoomLevel * 100)}%
      </div>
    </div>
  );
};

export default SvgMap;