/**
 * จัดรูปแบบข้อมูลจังหวัด
 */
export const formatProvinceData = (provinces) => {
  if (!provinces || provinces.length === 0) {
    return [];
  }

  return provinces.map(province => ({
    ...province,
    display_name: province.province_name || 'ไม่ระบุจังหวัด',
    full_name: `จังหวัด${province.province_name || 'ไม่ระบุ'}`,
    area_display: province.area_sqkm 
      ? `${Number(province.area_sqkm).toLocaleString()} ตร.กม.`
      : 'ไม่ระบุพื้นที่',
    has_geometry: !!province.geometry
  }));
};

/**
 * จัดรูปแบบข้อมูลอำเภอ
 */
export const formatDistrictData = (districts) => {
  if (!districts || districts.length === 0) {
    return [];
  }

  return districts.map(district => ({
    ...district,
    display_name: district.district_name || 'ไม่ระบุอำเภอ',
    full_name: `อำเภอ${district.district_name || 'ไม่ระบุ'}`,
    province_display: district.province_name 
      ? `จังหวัด${district.province_name}`
      : 'ไม่ระบุจังหวัด',
    area_display: district.area_sqkm 
      ? `${Number(district.area_sqkm).toLocaleString()} ตร.กม.`
      : 'ไม่ระบุพื้นที่',
    has_geometry: !!district.geometry,
    full_address: district.province_name 
      ? `อำเภอ${district.district_name} จังหวัด${district.province_name}`
      : `อำเภอ${district.district_name || 'ไม่ระบุ'}`
  }));
};

/**
 * จัดรูปแบบข้อมูลตำบล
 */
export const formatSubdistrictData = (subdistricts) => {
  if (!subdistricts || subdistricts.length === 0) {
    return [];
  }

  return subdistricts.map(subdistrict => ({
    ...subdistrict,
    display_name: subdistrict.subdistrict_name || 'ไม่ระบุตำบล',
    full_name: `ตำบล${subdistrict.subdistrict_name || 'ไม่ระบุ'}`,
    district_display: subdistrict.district_name 
      ? `อำเภอ${subdistrict.district_name}`
      : 'ไม่ระบุอำเภอ',
    province_display: subdistrict.province_name 
      ? `จังหวัด${subdistrict.province_name}`
      : 'ไม่ระบุจังหวัด',
    area_display: subdistrict.area_sqkm 
      ? `${Number(subdistrict.area_sqkm).toLocaleString()} ตร.กม.`
      : 'ไม่ระบุพื้นที่',
    has_geometry: !!subdistrict.geometry,
    full_address: (() => {
      const parts = [];
      if (subdistrict.subdistrict_name) parts.push(`ตำบล${subdistrict.subdistrict_name}`);
      if (subdistrict.district_name) parts.push(`อำเภอ${subdistrict.district_name}`);
      if (subdistrict.province_name) parts.push(`จังหวัด${subdistrict.province_name}`);
      return parts.length > 0 ? parts.join(' ') : 'ไม่ระบุที่อยู่';
    })(),
    short_address: (() => {
      const parts = [];
      if (subdistrict.subdistrict_name) parts.push(`ต.${subdistrict.subdistrict_name}`);
      if (subdistrict.district_name) parts.push(`อ.${subdistrict.district_name}`);
      if (subdistrict.province_name) parts.push(`จ.${subdistrict.province_name}`);
      return parts.length > 0 ? parts.join(' ') : 'ไม่ระบุ';
    })()
  }));
};

/**
 * สร้างตัวเลือกสำหรับ Select dropdown
 */
export const createSelectOptions = (items, type = 'province') => {
  if (!items || items.length === 0) {
    return [];
  }

  const nameField = {
    province: 'province_name',
    district: 'district_name',
    subdistrict: 'subdistrict_name'
  }[type];

  const prefixMap = {
    province: 'จังหวัด',
    district: 'อำเภอ',
    subdistrict: 'ตำบล'
  };

  return items.map(item => ({
    value: item.id,
    label: item[nameField] || `ไม่ระบุ${prefixMap[type]}`,
    data: item
  }));
};

/**
 * กรองข้อมูลตามคำค้นหา
 */
export const filterGeographyBySearch = (items, searchTerm, fields = ['province_name', 'district_name', 'subdistrict_name']) => {
  if (!items || items.length === 0 || !searchTerm || searchTerm.trim().length === 0) {
    return items || [];
  }

  const term = searchTerm.toLowerCase().trim();
  
  return items.filter(item => {
    return fields.some(field => {
      const value = item[field];
      return value && value.toLowerCase().includes(term);
    });
  });
};

/**
 * จัดกลุ่มข้อมูลตามจังหวัด
 */
export const groupByProvince = (items) => {
  if (!items || items.length === 0) {
    return {};
  }

  return items.reduce((groups, item) => {
    const provinceName = item.province_name || 'ไม่ระบุจังหวัด';
    if (!groups[provinceName]) {
      groups[provinceName] = [];
    }
    groups[provinceName].push(item);
    return groups;
  }, {});
};

/**
 * จัดกลุ่มข้อมูลตามอำเภอ
 */
export const groupByDistrict = (items) => {
  if (!items || items.length === 0) {
    return {};
  }

  return items.reduce((groups, item) => {
    const districtName = item.district_name || 'ไม่ระบุอำเภอ';
    if (!groups[districtName]) {
      groups[districtName] = [];
    }
    groups[districtName].push(item);
    return groups;
  }, {});
};

/**
 * ตรวจสอบความถูกต้องของข้อมูลภูมิศาสตร์
 */
export const validateGeographyData = (type, data) => {
  if (!data) return { isValid: false, errors: ['ไม่มีข้อมูล'] };

  const errors = [];

  switch (type) {
    case 'province':
      if (!data.province_name || data.province_name.trim().length === 0) {
        errors.push('ชื่อจังหวัดไม่ถูกต้อง');
      }
      break;

    case 'district':
      if (!data.district_name || data.district_name.trim().length === 0) {
        errors.push('ชื่ออำเภอไม่ถูกต้อง');
      }
      if (!data.province_id) {
        errors.push('ไม่ได้ระบุจังหวัด');
      }
      break;

    case 'subdistrict':
      if (!data.subdistrict_name || data.subdistrict_name.trim().length === 0) {
        errors.push('ชื่อตำบลไม่ถูกต้อง');
      }
      if (!data.district_id) {
        errors.push('ไม่ได้ระบุอำเภอ');
      }
      break;

    default:
      errors.push('ประเภทข้อมูลไม่ถูกต้อง');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * สร้างที่อยู่แบบเต็มจากข้อมูลภูมิศาสตร์
 */
export const buildFullAddress = (addressData) => {
  const {
    house_number,
    moo,
    soi,
    street,
    subdistrict_name,
    district_name,
    province_name,
    postal_code
  } = addressData || {};

  const parts = [];

  if (house_number) parts.push(`เลขที่ ${house_number}`);
  if (moo) parts.push(`หมู่ ${moo}`);
  if (soi) parts.push(`ซอย ${soi}`);
  if (street) parts.push(`ถนน ${street}`);
  if (subdistrict_name) parts.push(`ตำบล${subdistrict_name}`);
  if (district_name) parts.push(`อำเภอ${district_name}`);
  if (province_name) parts.push(`จังหวัด${province_name}`);
  if (postal_code) parts.push(postal_code);

  return parts.length > 0 ? parts.join(' ') : '';
};

/**
 * สร้างที่อยู่แบบสั้นจากข้อมูลภูมิศาสตร์
 */
export const buildShortAddress = (addressData) => {
  const {
    subdistrict_name,
    district_name,
    province_name
  } = addressData || {};

  const parts = [];

  if (subdistrict_name) parts.push(`ต.${subdistrict_name}`);
  if (district_name) parts.push(`อ.${district_name}`);
  if (province_name) parts.push(`จ.${province_name}`);

  return parts.length > 0 ? parts.join(' ') : '';
};

/**
 * เปรียบเทียบข้อมูลภูมิศาสตร์
 */
export const compareGeography = (a, b, sortField = 'name') => {
  if (!a || !b) return 0;

  let aValue, bValue;

  switch (sortField) {
    case 'name':
      aValue = a.province_name || a.district_name || a.subdistrict_name || '';
      bValue = b.province_name || b.district_name || b.subdistrict_name || '';
      break;
    case 'area':
      aValue = parseFloat(a.area_sqkm) || 0;
      bValue = parseFloat(b.area_sqkm) || 0;
      return bValue - aValue; // เรียงจากมากไปน้อย
    case 'id':
      aValue = a.id || 0;
      bValue = b.id || 0;
      return aValue - bValue;
    default:
      aValue = String(a[sortField] || '');
      bValue = String(b[sortField] || '');
  }

  return aValue.localeCompare(bValue, 'th', { numeric: true });
};

/**
 * แปลงข้อมูล Geometry เป็นรูปแบบที่ใช้ได้กับ Map
 */
export const processGeometryForMap = (geometry) => {
  if (!geometry || !geometry.coordinates) {
    return null;
  }

  try {
    // ตรวจสอบประเภท geometry
    switch (geometry.type) {
      case 'Polygon':
        return {
          type: 'Polygon',
          coordinates: geometry.coordinates
        };
      case 'MultiPolygon':
        return {
          type: 'MultiPolygon',
          coordinates: geometry.coordinates
        };
      case 'Point':
        return {
          type: 'Point',
          coordinates: geometry.coordinates
        };
      default:
        console.warn('Unsupported geometry type:', geometry.type);
        return null;
    }
  } catch (error) {
    console.error('Error processing geometry:', error);
    return null;
  }
};

/**
 * สร้างสถิติข้อมูลภูมิศาสตร์
 */
export const calculateGeographyStatistics = (items, type = 'province') => {
  if (!items || items.length === 0) {
    return {
      total: 0,
      withGeometry: 0,
      withoutGeometry: 0,
      averageArea: 0,
      totalArea: 0,
      maxArea: 0,
      minArea: 0
    };
  }

  const areas = items
    .map(item => parseFloat(item.area_sqkm))
    .filter(area => !isNaN(area) && area > 0);

  const withGeometry = items.filter(item => item.geometry).length;

  return {
    total: items.length,
    withGeometry,
    withoutGeometry: items.length - withGeometry,
    averageArea: areas.length > 0 ? areas.reduce((sum, area) => sum + area, 0) / areas.length : 0,
    totalArea: areas.reduce((sum, area) => sum + area, 0),
    maxArea: areas.length > 0 ? Math.max(...areas) : 0,
    minArea: areas.length > 0 ? Math.min(...areas) : 0
  };
};

/**
 * ค้นหาข้อมูลภูมิศาสตร์แบบ Fuzzy Search
 */
export const fuzzySearchGeography = (items, searchTerm, threshold = 0.6) => {
  if (!items || items.length === 0 || !searchTerm) {
    return [];
  }

  const term = searchTerm.toLowerCase().trim();
  
  return items
    .map(item => {
      const name = (item.province_name || item.district_name || item.subdistrict_name || '').toLowerCase();
      
      // คำนวณความคล้ายคลึง
      let score = 0;
      
      // Exact match
      if (name === term) {
        score = 1;
      }
      // Starts with
      else if (name.startsWith(term)) {
        score = 0.9;
      }
      // Contains
      else if (name.includes(term)) {
        score = 0.7;
      }
      // Character similarity
      else {
        const commonChars = [...term].filter(char => name.includes(char)).length;
        score = commonChars / Math.max(term.length, name.length);
      }
      
      return { ...item, _score: score };
    })
    .filter(item => item._score >= threshold)
    .sort((a, b) => b._score - a._score);
};

export default {
  formatProvinceData,
  formatDistrictData,
  formatSubdistrictData,
  createSelectOptions,
  filterGeographyBySearch,
  groupByProvince,
  groupByDistrict,
  validateGeographyData,
  buildFullAddress,
  buildShortAddress,
  compareGeography,
  processGeometryForMap,
  calculateGeographyStatistics,
  fuzzySearchGeography
};