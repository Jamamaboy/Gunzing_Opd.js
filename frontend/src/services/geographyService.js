import { api } from '../config/api';

// ========== PROVINCES ==========

/**
 * ดึงข้อมูลจังหวัดทั้งหมด
 */
export const fetchProvinces = async () => {
  try {
    const response = await api.get('/api/provinces');
    return {
      success: true,
      data: response.data || []
    };
  } catch (error) {
    console.error('Error fetching provinces:', error);
    return {
      success: false,
      error: error.response?.data?.detail || error.message || 'Failed to fetch provinces',
      data: []
    };
  }
};

/**
 * ดึงข้อมูลจังหวัดตาม ID
 */
export const fetchProvinceById = async (provinceId) => {
  try {
    if (!provinceId) {
      throw new Error('Province ID is required');
    }

    const response = await api.get(`/api/provinces/${provinceId}`);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Error fetching province by ID:', error);
    return {
      success: false,
      error: error.response?.data?.detail || error.message || 'Failed to fetch province',
      data: null
    };
  }
};

/**
 * ค้นหาจังหวัดจากชื่อ
 */
export const searchProvinces = async (searchTerm) => {
  try {
    if (!searchTerm || searchTerm.trim().length === 0) {
      return {
        success: true,
        data: []
      };
    }

    const response = await api.get('/api/provinces/search', {
      params: { q: searchTerm.trim() }
    });
    return {
      success: true,
      data: response.data || []
    };
  } catch (error) {
    console.error('Error searching provinces:', error);
    return {
      success: false,
      error: error.response?.data?.detail || error.message || 'Failed to search provinces',
      data: []
    };
  }
};

/**
 * ดึงสถิติจังหวัด
 */
export const fetchProvinceStatistics = async () => {
  try {
    const response = await api.get('/api/provinces/statistics');
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Error fetching province statistics:', error);
    return {
      success: false,
      error: error.response?.data?.detail || error.message || 'Failed to fetch province statistics',
      data: {}
    };
  }
};

// ========== DISTRICTS ==========

/**
 * ดึงข้อมูลอำเภอ (ทั้งหมดหรือตามจังหวัด)
 */
export const fetchDistricts = async (provinceId = null) => {
  try {
    const params = provinceId ? { province_id: provinceId } : {};
    const response = await api.get('/api/districts', { params });
    return {
      success: true,
      data: response.data || []
    };
  } catch (error) {
    console.error('Error fetching districts:', error);
    return {
      success: false,
      error: error.response?.data?.detail || error.message || 'Failed to fetch districts',
      data: []
    };
  }
};

/**
 * ดึงข้อมูลอำเภอตาม ID
 */
export const fetchDistrictById = async (districtId) => {
  try {
    if (!districtId) {
      throw new Error('District ID is required');
    }

    const response = await api.get(`/api/districts/${districtId}`);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Error fetching district by ID:', error);
    return {
      success: false,
      error: error.response?.data?.detail || error.message || 'Failed to fetch district',
      data: null
    };
  }
};

/**
 * ค้นหาอำเภอจากชื่อ
 */
export const searchDistricts = async (searchTerm, provinceId = null) => {
  try {
    if (!searchTerm || searchTerm.trim().length === 0) {
      return {
        success: true,
        data: []
      };
    }

    const params = { q: searchTerm.trim() };
    if (provinceId) {
      params.province_id = provinceId;
    }

    const response = await api.get('/api/districts/search', { params });
    return {
      success: true,
      data: response.data || []
    };
  } catch (error) {
    console.error('Error searching districts:', error);
    return {
      success: false,
      error: error.response?.data?.detail || error.message || 'Failed to search districts',
      data: []
    };
  }
};

// ========== SUBDISTRICTS ==========

/**
 * ดึงข้อมูลตำบล (ตามอำเภอหรือจังหวัด)
 */
export const fetchSubdistricts = async (districtId = null, provinceId = null) => {
  try {
    const params = {};
    if (districtId) params.district_id = districtId;
    else if (provinceId) params.province_id = provinceId;

    const response = await api.get('/api/subdistricts', { params });
    return {
      success: true,
      data: response.data || []
    };
  } catch (error) {
    console.error('Error fetching subdistricts:', error);
    return {
      success: false,
      error: error.response?.data?.detail || error.message || 'Failed to fetch subdistricts',
      data: []
    };
  }
};

/**
 * ดึงข้อมูลตำบลตาม ID
 */
export const fetchSubdistrictById = async (subdistrictId) => {
  try {
    if (!subdistrictId) {
      throw new Error('Subdistrict ID is required');
    }

    const response = await api.get(`/api/subdistricts/${subdistrictId}`);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Error fetching subdistrict by ID:', error);
    return {
      success: false,
      error: error.response?.data?.detail || error.message || 'Failed to fetch subdistrict',
      data: null
    };
  }
};

/**
 * ค้นหาตำบลจากชื่อ
 */
export const searchSubdistricts = async (searchTerm, districtId = null, provinceId = null) => {
  try {
    if (!searchTerm || searchTerm.trim().length === 0) {
      return {
        success: true,
        data: []
      };
    }

    const params = { q: searchTerm.trim() };
    if (districtId) params.district_id = districtId;
    else if (provinceId) params.province_id = provinceId;

    const response = await api.get('/api/subdistricts/search', { params });
    return {
      success: true,
      data: response.data || []
    };
  } catch (error) {
    console.error('Error searching subdistricts:', error);
    return {
      success: false,
      error: error.response?.data?.detail || error.message || 'Failed to search subdistricts',
      data: []
    };
  }
};

// ========== UTILITY FUNCTIONS ==========

/**
 * ดึงข้อมูลแบบ Cascade (จังหวัด -> อำเภอ -> ตำบล)
 */
export const fetchGeographyHierarchy = async (provinceId = null, districtId = null) => {
  try {
    const result = {
      provinces: [],
      districts: [],
      subdistricts: []
    };

    // ดึงจังหวัดทั้งหมด
    const provincesResult = await fetchProvinces();
    if (provincesResult.success) {
      result.provinces = provincesResult.data;
    }

    // ดึงอำเภอตามจังหวัด (ถ้ามี)
    if (provinceId) {
      const districtsResult = await fetchDistricts(provinceId);
      if (districtsResult.success) {
        result.districts = districtsResult.data;
      }
    }

    // ดึงตำบลตามอำเภอ (ถ้ามี)
    if (districtId) {
      const subdistrictsResult = await fetchSubdistricts(districtId);
      if (subdistrictsResult.success) {
        result.subdistricts = subdistrictsResult.data;
      }
    }

    return {
      success: true,
      data: result
    };
  } catch (error) {
    console.error('Error fetching geography hierarchy:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch geography hierarchy',
      data: {
        provinces: [],
        districts: [],
        subdistricts: []
      }
    };
  }
};

/**
 * ค้นหาทุกระดับพร้อมกัน
 */
export const searchAllGeography = async (searchTerm) => {
  try {
    if (!searchTerm || searchTerm.trim().length === 0) {
      return {
        success: true,
        data: {
          provinces: [],
          districts: [],
          subdistricts: []
        }
      };
    }

    const [provincesResult, districtsResult, subdistrictsResult] = await Promise.all([
      searchProvinces(searchTerm),
      searchDistricts(searchTerm),
      searchSubdistricts(searchTerm)
    ]);

    return {
      success: true,
      data: {
        provinces: provincesResult.success ? provincesResult.data : [],
        districts: districtsResult.success ? districtsResult.data : [],
        subdistricts: subdistrictsResult.success ? subdistrictsResult.data : []
      }
    };
  } catch (error) {
    console.error('Error searching all geography:', error);
    return {
      success: false,
      error: error.message || 'Failed to search geography',
      data: {
        provinces: [],
        districts: [],
        subdistricts: []
      }
    };
  }
};