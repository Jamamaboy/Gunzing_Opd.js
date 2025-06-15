import { useState, useEffect, useCallback } from 'react';
import {
  fetchProvinces,
  fetchDistricts,
  fetchSubdistricts,
  fetchProvinceById,
  fetchDistrictById,
  fetchSubdistrictById,
  searchProvinces,
  searchDistricts,
  searchSubdistricts,
  fetchGeographyHierarchy,
  searchAllGeography
} from '../services/geographyService';

/**
 * Hook สำหรับจัดการข้อมูลภูมิศาสตร์แบบ Cascade
 */
export const useGeography = () => {
  // States
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [subdistricts, setSubdistricts] = useState([]);
  
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [selectedSubdistrict, setSelectedSubdistrict] = useState(null);
  
  const [loading, setLoading] = useState({
    provinces: false,
    districts: false,
    subdistricts: false
  });
  
  const [error, setError] = useState({
    provinces: null,
    districts: null,
    subdistricts: null
  });

  // ✅ โหลดจังหวัดทั้งหมด
  const loadProvinces = useCallback(async () => {
    setLoading(prev => ({ ...prev, provinces: true }));
    setError(prev => ({ ...prev, provinces: null }));
    
    try {
      const result = await fetchProvinces();
      if (result.success) {
        setProvinces(result.data);
      } else {
        setError(prev => ({ ...prev, provinces: result.error }));
        setProvinces([]);
      }
    } catch (err) {
      setError(prev => ({ ...prev, provinces: err.message }));
      setProvinces([]);
    } finally {
      setLoading(prev => ({ ...prev, provinces: false }));
    }
  }, []);

  // ✅ โหลดอำเภอตามจังหวัด
  const loadDistricts = useCallback(async (provinceId) => {
    if (!provinceId) {
      setDistricts([]);
      setSelectedDistrict(null);
      setSubdistricts([]);
      setSelectedSubdistrict(null);
      return;
    }

    setLoading(prev => ({ ...prev, districts: true }));
    setError(prev => ({ ...prev, districts: null }));
    
    try {
      const result = await fetchDistricts(provinceId);
      if (result.success) {
        setDistricts(result.data);
        // Reset อำเภอและตำบลที่เลือก
        setSelectedDistrict(null);
        setSubdistricts([]);
        setSelectedSubdistrict(null);
      } else {
        setError(prev => ({ ...prev, districts: result.error }));
        setDistricts([]);
      }
    } catch (err) {
      setError(prev => ({ ...prev, districts: err.message }));
      setDistricts([]);
    } finally {
      setLoading(prev => ({ ...prev, districts: false }));
    }
  }, []);

  // ✅ โหลดตำบลตามอำเภอ
  const loadSubdistricts = useCallback(async (districtId) => {
    if (!districtId) {
      setSubdistricts([]);
      setSelectedSubdistrict(null);
      return;
    }

    setLoading(prev => ({ ...prev, subdistricts: true }));
    setError(prev => ({ ...prev, subdistricts: null }));
    
    try {
      const result = await fetchSubdistricts(districtId);
      if (result.success) {
        setSubdistricts(result.data);
        // Reset ตำบลที่เลือก
        setSelectedSubdistrict(null);
      } else {
        setError(prev => ({ ...prev, subdistricts: result.error }));
        setSubdistricts([]);
      }
    } catch (err) {
      setError(prev => ({ ...prev, subdistricts: err.message }));
      setSubdistricts([]);
    } finally {
      setLoading(prev => ({ ...prev, subdistricts: false }));
    }
  }, []);

  // ✅ เลือกจังหวัด
  const selectProvince = useCallback(async (province) => {
    setSelectedProvince(province);
    if (province) {
      await loadDistricts(province.id);
    } else {
      setDistricts([]);
      setSubdistricts([]);
      setSelectedDistrict(null);
      setSelectedSubdistrict(null);
    }
  }, [loadDistricts]);

  // ✅ เลือกอำเภอ
  const selectDistrict = useCallback(async (district) => {
    setSelectedDistrict(district);
    if (district) {
      await loadSubdistricts(district.id);
    } else {
      setSubdistricts([]);
      setSelectedSubdistrict(null);
    }
  }, [loadSubdistricts]);

  // ✅ เลือกตำบล
  const selectSubdistrict = useCallback((subdistrict) => {
    setSelectedSubdistrict(subdistrict);
  }, []);

  // ✅ Reset ทั้งหมด
  const resetSelection = useCallback(() => {
    setSelectedProvince(null);
    setSelectedDistrict(null);
    setSelectedSubdistrict(null);
    setDistricts([]);
    setSubdistricts([]);
  }, []);

  // ✅ โหลดข้อมูลเริ่มต้น
  useEffect(() => {
    loadProvinces();
  }, [loadProvinces]);

  return {
    // Data
    provinces,
    districts,
    subdistricts,
    
    // Selected values
    selectedProvince,
    selectedDistrict,
    selectedSubdistrict,
    
    // Loading states
    loading,
    
    // Error states
    error,
    
    // Actions
    loadProvinces,
    loadDistricts,
    loadSubdistricts,
    selectProvince,
    selectDistrict,
    selectSubdistrict,
    resetSelection,
    
    // Computed values
    hasProvinces: provinces.length > 0,
    hasDistricts: districts.length > 0,
    hasSubdistricts: subdistricts.length > 0,
    isLoading: Object.values(loading).some(Boolean),
    hasError: Object.values(error).some(Boolean)
  };
};

/**
 * Hook สำหรับค้นหาข้อมูลภูมิศาสตร์
 */
export const useGeographySearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState({
    provinces: [],
    districts: [],
    subdistricts: []
  });
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);

  // ✅ ค้นหาทุกระดับ
  const searchAll = useCallback(async (term) => {
    if (!term || term.trim().length === 0) {
      setSearchResults({
        provinces: [],
        districts: [],
        subdistricts: []
      });
      return;
    }

    setIsSearching(true);
    setSearchError(null);

    try {
      const result = await searchAllGeography(term);
      if (result.success) {
        setSearchResults(result.data);
      } else {
        setSearchError(result.error);
        setSearchResults({
          provinces: [],
          districts: [],
          subdistricts: []
        });
      }
    } catch (err) {
      setSearchError(err.message);
      setSearchResults({
        provinces: [],
        districts: [],
        subdistricts: []
      });
    } finally {
      setIsSearching(false);
    }
  }, []);

  // ✅ ค้นหาเฉพาะจังหวัด
  const searchProvincesOnly = useCallback(async (term) => {
    if (!term || term.trim().length === 0) return [];

    try {
      const result = await searchProvinces(term);
      return result.success ? result.data : [];
    } catch (err) {
      console.error('Error searching provinces:', err);
      return [];
    }
  }, []);

  // ✅ ค้นหาเฉพาะอำเภอ
  const searchDistrictsOnly = useCallback(async (term, provinceId = null) => {
    if (!term || term.trim().length === 0) return [];

    try {
      const result = await searchDistricts(term, provinceId);
      return result.success ? result.data : [];
    } catch (err) {
      console.error('Error searching districts:', err);
      return [];
    }
  }, []);

  // ✅ ค้นหาเฉพาะตำบล
  const searchSubdistrictsOnly = useCallback(async (term, districtId = null, provinceId = null) => {
    if (!term || term.trim().length === 0) return [];

    try {
      const result = await searchSubdistricts(term, districtId, provinceId);
      return result.success ? result.data : [];
    } catch (err) {
      console.error('Error searching subdistricts:', err);
      return [];
    }
  }, []);

  // ✅ ล้างผลค้นหา
  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setSearchResults({
      provinces: [],
      districts: [],
      subdistricts: []
    });
    setSearchError(null);
  }, []);

  return {
    searchTerm,
    searchResults,
    isSearching,
    searchError,
    
    setSearchTerm,
    searchAll,
    searchProvincesOnly,
    searchDistrictsOnly,
    searchSubdistrictsOnly,
    clearSearch,
    
    // Computed values
    hasResults: Object.values(searchResults).some(arr => arr.length > 0),
    totalResults: Object.values(searchResults).reduce((sum, arr) => sum + arr.length, 0)
  };
};

/**
 * Hook สำหรับดึงข้อมูลภูมิศาสตร์ตาม ID
 */
export const useGeographyById = () => {
  const [data, setData] = useState({
    province: null,
    district: null,
    subdistrict: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ✅ ดึงจังหวัดตาม ID
  const getProvinceById = useCallback(async (provinceId) => {
    if (!provinceId) return null;

    setLoading(true);
    setError(null);

    try {
      const result = await fetchProvinceById(provinceId);
      if (result.success) {
        setData(prev => ({ ...prev, province: result.data }));
        return result.data;
      } else {
        setError(result.error);
        return null;
      }
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ ดึงอำเภอตาม ID
  const getDistrictById = useCallback(async (districtId) => {
    if (!districtId) return null;

    setLoading(true);
    setError(null);

    try {
      const result = await fetchDistrictById(districtId);
      if (result.success) {
        setData(prev => ({ ...prev, district: result.data }));
        return result.data;
      } else {
        setError(result.error);
        return null;
      }
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ ดึงตำบลตาม ID
  const getSubdistrictById = useCallback(async (subdistrictId) => {
    if (!subdistrictId) return null;

    setLoading(true);
    setError(null);

    try {
      const result = await fetchSubdistrictById(subdistrictId);
      if (result.success) {
        setData(prev => ({ ...prev, subdistrict: result.data }));
        return result.data;
      } else {
        setError(result.error);
        return null;
      }
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    data,
    loading,
    error,
    getProvinceById,
    getDistrictById,
    getSubdistrictById
  };
};