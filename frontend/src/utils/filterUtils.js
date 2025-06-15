/**
 * ฟังก์ชันสำหรับกรองข้อมูล Drug Cases ที่ Frontend
 */
export const filterDrugCases = (cases, filters) => {
  if (!cases || cases.length === 0) {
    return [];
  }

  return cases.filter(caseItem => {
    // ✅ กรองตามคำค้นหา (search)
    if (filters.search && filters.search.trim() !== '') {
      const searchTerm = filters.search.toLowerCase().trim();
      const searchFields = [
        caseItem.case_id,
        caseItem.seized_from,
        caseItem.inspection_number,
        caseItem.occurrence_place,
        caseItem.defendant_names,
        caseItem.province_name,
        caseItem.district_name,
        caseItem.subdistrict_name,
        caseItem.evidence?.characteristics,
        caseItem.evidence?.drug_type
      ];

      const matchesSearch = searchFields.some(field => 
        field && field.toString().toLowerCase().includes(searchTerm)
      );

      if (!matchesSearch) return false;
    }

    // ✅ กรองตามประเภทคดี (caseType)
    if (filters.caseType && filters.caseType !== '') {
      // สามารถเพิ่ม logic สำหรับประเภทคดีได้ตาม business logic
      // ตัวอย่าง: ถ้ามี field case_type ใน data
      if (caseItem.case_type && caseItem.case_type !== filters.caseType) {
        return false;
      }
    }

    // ✅ กรองตามสถานะ (status)
    if (filters.status && filters.status !== '') {
      // สามารถเพิ่ม logic สำหรับสถานะได้ตาม business logic
      if (caseItem.status && caseItem.status !== filters.status) {
        return false;
      }
    }

    // ✅ กรองตามประเภทยาเสพติด (drugType)
    if (filters.drugType && filters.drugType !== '') {
      const drugTypeMatches = caseItem.evidences?.some(evidence => 
        evidence.drug_type === filters.drugType
      );
      if (!drugTypeMatches) return false;
    }

    // ✅ กรองตามวันที่เริ่มต้น (startDate)
    if (filters.startDate && filters.startDate !== '') {
      const caseDate = new Date(caseItem.occurrence_date);
      const startDate = new Date(filters.startDate);
      if (caseDate < startDate) return false;
    }

    // ✅ กรองตามวันที่สิ้นสุด (endDate)
    if (filters.endDate && filters.endDate !== '') {
      const caseDate = new Date(caseItem.occurrence_date);
      const endDate = new Date(filters.endDate);
      // เพิ่ม 1 วันเพื่อให้รวมวันที่สิ้นสุดด้วย
      endDate.setDate(endDate.getDate() + 1);
      if (caseDate >= endDate) return false;
    }

    // ✅ กรองตามจังหวัด (province)
    if (filters.province && filters.province !== '') {
      if (!caseItem.province_name || 
          !caseItem.province_name.toLowerCase().includes(filters.province.toLowerCase())) {
        return false;
      }
    }

    // ✅ กรองตามอำเภอ (district)
    if (filters.district && filters.district !== '') {
      if (!caseItem.district_name || 
          !caseItem.district_name.toLowerCase().includes(filters.district.toLowerCase())) {
        return false;
      }
    }

    // ✅ กรองตามตำบล (subdistrict)
    if (filters.subdistrict && filters.subdistrict !== '') {
      if (!caseItem.subdistrict_name || 
          !caseItem.subdistrict_name.toLowerCase().includes(filters.subdistrict.toLowerCase())) {
        return false;
      }
    }

    // ✅ ผ่านการกรองทั้งหมด
    return true;
  });
};

/**
 * ฟังก์ชันสำหรับเรียงลำดับข้อมูล Drug Cases
 */
export const sortDrugCases = (cases, sortBy = 'occurrence_date', sortOrder = 'desc') => {
  if (!cases || cases.length === 0) {
    return [];
  }

  return [...cases].sort((a, b) => {
    let aValue, bValue;

    switch (sortBy) {
      case 'case_id':
        aValue = a.case_id || '';
        bValue = b.case_id || '';
        break;
      case 'occurrence_date':
        aValue = new Date(a.occurrence_date || 0);
        bValue = new Date(b.occurrence_date || 0);
        break;
      case 'province_name':
        aValue = a.province_name || '';
        bValue = b.province_name || '';
        break;
      case 'defendant_names':
        aValue = a.defendant_names || '';
        bValue = b.defendant_names || '';
        break;
      default:
        aValue = a[sortBy] || '';
        bValue = b[sortBy] || '';
    }

    if (sortOrder === 'asc') {
      if (aValue < bValue) return -1;
      if (aValue > bValue) return 1;
      return 0;
    } else {
      if (aValue > bValue) return -1;
      if (aValue < bValue) return 1;
      return 0;
    }
  });
};

/**
 * ฟังก์ชันสำหรับค้นหาแบบ Fuzzy (คล้ายคลึง)
 */
export const fuzzySearchDrugCases = (cases, searchTerm, threshold = 0.6) => {
  if (!cases || cases.length === 0 || !searchTerm) {
    return cases || [];
  }

  const term = searchTerm.toLowerCase().trim();
  
  return cases
    .map(caseItem => {
      const searchText = [
        caseItem.case_id,
        caseItem.defendant_names,
        caseItem.province_name,
        caseItem.district_name,
        caseItem.evidence?.characteristics
      ].join(' ').toLowerCase();
      
      // คำนวณความคล้ายคลึง
      let score = 0;
      
      if (searchText.includes(term)) {
        if (searchText.startsWith(term)) {
          score = 1.0;
        } else {
          score = 0.8;
        }
      } else {
        // Character similarity
        const commonChars = [...term].filter(char => searchText.includes(char)).length;
        score = commonChars / Math.max(term.length, searchText.length);
      }
      
      return { ...caseItem, _searchScore: score };
    })
    .filter(item => item._searchScore >= threshold)
    .sort((a, b) => b._searchScore - a._searchScore);
};

/**
 * ฟังก์ชันสำหรับสร้างสถิติการกรอง
 */
export const getFilterStatistics = (originalCases, filteredCases, filters) => {
  const activeFilters = Object.entries(filters).filter(([key, value]) => 
    value && value !== ''
  );

  return {
    total: originalCases.length,
    filtered: filteredCases.length,
    removed: originalCases.length - filteredCases.length,
    activeFiltersCount: activeFilters.length,
    activeFilters: activeFilters.map(([key, value]) => ({ key, value })),
    filterEfficiency: originalCases.length > 0 ? 
      ((filteredCases.length / originalCases.length) * 100).toFixed(1) : 0
  };
};

export default {
  filterDrugCases,
  sortDrugCases,
  fuzzySearchDrugCases,
  getFilterStatistics
};