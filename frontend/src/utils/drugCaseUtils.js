import { formatDateToThaiShort } from './dateUtils';

export const drugCaseData = (drugCases, loading, error) => {
  // ✅ เพิ่มการตรวจสอบก่อน map
  console.log('🔍 drugCaseData called with:', {
    drugCases: drugCases,
    type: typeof drugCases,
    isArray: Array.isArray(drugCases),
    length: drugCases?.length,
    loading: loading,
    error: error
  });

  // ✅ ตรวจสอบ loading
  if (loading) {
    console.log('⏳ Still loading, returning empty array');
    return [];
  }

  // ✅ ตรวจสอบ error
  if (error) {
    console.error('❌ Error state:', error);
    return [];
  }

  // ✅ ตรวจสอบ drugCases และแก้ไข structure ถ้าจำเป็น
  let actualData = drugCases;

  if (!drugCases) {
    console.warn('⚠️ drugCases is null or undefined');
    return [];
  }

  // ✅ ถ้าเป็น API response object ที่มี data property
  if (typeof drugCases === 'object' && !Array.isArray(drugCases)) {
    console.log('🔍 drugCases is an object, checking for data property...');
    
    if (drugCases.data && Array.isArray(drugCases.data)) {
      console.log('✅ Found data property with array, using it');
      actualData = drugCases.data;
    } else if (drugCases.success === false) {
      console.error('❌ API response indicates failure:', drugCases);
      return [];
    } else {
      console.warn('⚠️ drugCases object does not have valid data array:', drugCases);
      return [];
    }
  }

  // ✅ ตรวจสอบ actualData เป็น array หรือไม่
  if (!Array.isArray(actualData)) {
    console.warn('⚠️ actualData is not a valid array:', actualData);
    return [];
  }

  // ✅ ตรวจสอบ array ว่าง
  if (actualData.length === 0) {
    console.log('📭 actualData is empty array');
    return [];
  }
  
  // ✅ Process data แบบง่ายๆ เหมือน DrugProfile
  console.log('✅ Processing', actualData.length, 'cases');
  console.log('📦 Sample case data:', actualData[0]);
  
  const processedCases = actualData.map((caseItem, index) => {
    // ✅ เพิ่มการตรวจสอบ caseItem
    if (!caseItem || typeof caseItem !== 'object') {
      console.warn(`⚠️ Invalid caseItem at index ${index}:`, caseItem);
      return {
        id: index,
        case_id: 'INVALID_DATA',
        error: 'Invalid case data'
      };
    }

    try {
      const formattedCase = {
        id: caseItem.id || index,
        case_id: caseItem.case_id || 'ไม่ระบุเลขคดี',
        seized_from: caseItem.seized_from || 'ไม่ระบุหน่วยงาน',
        
        // ✅ ใช้ dateUtils แปลงวันที่เป็น พ.ศ.
        occurrence_date: caseItem.occurrence_date ? 
          formatDateToThaiShort(caseItem.occurrence_date) : 'ไม่ระบุวันที่',
        
        inspection_number: caseItem.inspection_number || 'ไม่ระบุเลขตรวจ',
        
        // ที่อยู่
        occurrence_place: caseItem.occurrence_place || '',
        house_number: caseItem.house_number || '',
        moo: caseItem.moo || '',
        soi: caseItem.soi || '',
        street: caseItem.street || '',
        subdistrict_name: caseItem.subdistrict_name || '',
        district_name: caseItem.district_name || '',
        province_name: caseItem.province_name || '',
        
        // ✅ Evidence แรก (สำหรับเรียกใช้แบบ caseItem.evidence.color)
        evidence: caseItem.evidences?.[0] ? {
          id: caseItem.evidences[0].id,
          case_id: caseItem.evidences[0].case_id,
          sequence_number: caseItem.evidences[0].sequence_number,
          quantity: caseItem.evidences[0].quantity || 0,
          unit: caseItem.evidences[0].unit || 'ไม่ระบุหน่วย',
          color: caseItem.evidences[0].color || 'ไม่ระบุสี',
          diameter_mm: caseItem.evidences[0].diameter_mm || 'ไม่ระบุ',
          thickness_mm: caseItem.evidences[0].thickness_mm || 'ไม่ระบุ',
          edge_shape: caseItem.evidences[0].edge_shape || 'ไม่ระบุ',
          weight: caseItem.evidences[0].weight || '0',
          characteristics: caseItem.evidences[0].characteristics || 'ไม่ระบุลักษณะ',
          drug_type: caseItem.evidences[0].drug_type || 'ไม่ระบุประเภท',
          defendant_id: caseItem.evidences[0].defendant_id,
          defendant_name: caseItem.evidences[0].defendant_name || 'ไม่ระบุผู้ต้องหา',
          
          // ✅ ข้อมูลที่จัดรูปแบบแล้ว
          quantity_with_unit: caseItem.evidences[0].quantity && caseItem.evidences[0].unit ? 
            `${caseItem.evidences[0].quantity} ${caseItem.evidences[0].unit}` : 'ไม่ระบุจำนวน',
          weight_with_unit: caseItem.evidences[0].weight && caseItem.evidences[0].weight !== '0' ? 
            `${caseItem.evidences[0].weight} กรัม` : 'ไม่ระบุน้ำหนัก',
          full_description: (() => {
            const parts = [];
            if (caseItem.evidences[0].color) parts.push(caseItem.evidences[0].color);
            if (caseItem.evidences[0].drug_type) parts.push(caseItem.evidences[0].drug_type);
            if (caseItem.evidences[0].characteristics) parts.push(caseItem.evidences[0].characteristics);
            if (caseItem.evidences[0].quantity && caseItem.evidences[0].unit) {
              parts.push(`${caseItem.evidences[0].quantity} ${caseItem.evidences[0].unit}`);
            }
            return parts.length > 0 ? parts.join(' ') : 'ไม่ระบุลักษณะ';
          })()
        } : {
          id: null,
          case_id: null,
          sequence_number: null,
          quantity: 0,
          unit: 'ไม่มีของกลาง',
          color: 'ไม่มีของกลาง',
          diameter_mm: 'ไม่มีของกลาง',
          thickness_mm: 'ไม่มีของกลาง',
          edge_shape: 'ไม่มีของกลาง',
          weight: '0',
          characteristics: 'ไม่มีของกลาง',
          drug_type: 'ไม่มีของกลาง',
          defendant_id: null,
          defendant_name: 'ไม่มีของกลาง',
          quantity_with_unit: 'ไม่มีของกลาง',
          weight_with_unit: 'ไม่มีของกลาง',
          full_description: 'ไม่มีของกลาง'
        },
        
        // ✅ Defendant แรก (สำหรับเรียกใช้แบบ caseItem.defendant.fullname)
        defendant: caseItem.defendants?.[0] ? {
          id: caseItem.defendants[0].id,
          fullname: caseItem.defendants[0].fullname || 'ไม่ระบุชื่อ',
          evidence_count: caseItem.defendants[0].evidence_count || 0
        } : {
          id: null,
          fullname: 'ไม่มีผู้ต้องหา',
          evidence_count: 0
        },
        
        // ✅ Arrays เดิม (สำหรับใช้ในกรณีมีหลายรายการ)
        evidences: caseItem.evidences || [],
        evidence_count: caseItem.evidences?.length || 0,
        defendants: caseItem.defendants || [],
        defendant_count: caseItem.defendants?.length || 0,
        
        // ✅ ข้อมูลสรุปที่ process แล้ว
        defendant_names: (() => {
          const defendants = caseItem.defendants || [];
          if (defendants.length === 0) return 'ไม่มีผู้ต้องหา';
          
          if (defendants.length === 1) {
            return defendants[0].fullname || 'ไม่ระบุชื่อ';
          } else if (defendants.length <= 3) {
            return defendants.map(d => d.fullname).join(', ');
          } else {
            const firstTwo = defendants.slice(0, 2).map(d => d.fullname).join(', ');
            return `${firstTwo} และอีก ${defendants.length - 2} คน`;
          }
        })(),
        
        drug_characteristics: (() => {
          const evidences = caseItem.evidences || [];
          if (evidences.length === 0) return 'ไม่มีของกลาง';
          
          const descriptions = evidences.map(evidence => {
            if (evidence.color) return evidence.color;
            if (evidence.drug_type) return evidence.drug_type;
            if (evidence.characteristics) return evidence.characteristics;
            if (evidence.quantity && evidence.unit) return `${evidence.quantity} ${evidence.unit}`;
            return 'ไม่ระบุ';
          });
          
          if (descriptions.length === 1) {
            return descriptions[0];
          } else if (descriptions.length <= 2) {
            return descriptions.join(' | ');
          } else {
            const firstTwo = descriptions.slice(0, 2).join(' | ');
            return `${firstTwo} และอีก ${descriptions.length - 2} รายการ`;
          }
        })(),
        
        full_address: (() => {
          const addressParts = [];
          
          if (caseItem.occurrence_place) addressParts.push(caseItem.occurrence_place);
          if (caseItem.house_number) addressParts.push(`บ้านเลขที่ ${caseItem.house_number}`);
          if (caseItem.moo) addressParts.push(`หมู่ ${caseItem.moo}`);
          if (caseItem.soi) addressParts.push(`ซอย ${caseItem.soi}`);
          if (caseItem.street) addressParts.push(`ถนน ${caseItem.street}`);
          if (caseItem.subdistrict_name) addressParts.push(`ต.${caseItem.subdistrict_name}`);
          if (caseItem.district_name) addressParts.push(`อ.${caseItem.district_name}`);
          if (caseItem.province_name) addressParts.push(`จ.${caseItem.province_name}`);
          
          return addressParts.length > 0 ? addressParts.join(' ') : 'ไม่ระบุที่อยู่';
        })(),
        
        // สรุป
        summary: caseItem.summary || {}
      };

      console.log(`✅ Processed Case ${index + 1}:`, formattedCase);
      
      return formattedCase;

    } catch (itemError) {
      console.error(`❌ Error processing case at index ${index}:`, itemError);
      return {
        id: index,
        case_id: 'ERROR',
        error: `Processing error: ${itemError.message}`,
        raw_data: caseItem
      };
    }
  });
  
  console.log('✅ Total processed cases:', processedCases.length);
  return processedCases;
};