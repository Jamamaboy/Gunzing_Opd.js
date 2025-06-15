import { api } from '../config/api';

/**
 * ค้นหายาเสพติดที่คล้ายคลึงจาก vector
 * @param {Array} vector - Vector ของภาพที่ต้องการค้นหา
 * @param {number} topK - จำนวนผลลัพธ์ที่ต้องการ (default: 3)
 * @returns {Promise<Array>} รายการยาเสพติดที่คล้ายคลึง
 */
export const findSimilarNarcotics = async (vector, topK = 3) => {
  try {
    if (!vector || !Array.isArray(vector) || vector.length === 0) {
      throw new Error('Invalid vector data');
    }
    
    // แปลงเป็น base64 ก่อนส่ง
    const float32Array = new Float32Array(vector);
    const bytes = new Uint8Array(float32Array.buffer);
    const base64 = btoa(String.fromCharCode.apply(null, bytes));
    
    const response = await api.post('/api/search-vector', {
      vector_base64: base64,
      top_k: topK,
      similarity_threshold: 0.1
    });
    
    return response.data.results || [];
  } catch (error) {
    console.error('Error finding similar narcotics:', error);
    throw error;
  }
};

/**
 * ค้นหายาเสพติดจาก base64 vector
 * @param {string} vectorBase64 - Vector ในรูปแบบ base64
 * @param {number} topK - จำนวนผลลัพธ์ที่ต้องการ (default: 3)
 * @returns {Promise<Array>} รายการยาเสพติดที่คล้ายคลึง
 */
export const findSimilarNarcoticsWithBase64 = async (vectorBase64, topK = 3) => {
  try {
    if (!vectorBase64) {
      throw new Error('Invalid base64 vector data');
    }
    
    const response = await api.post('/api/search-vector', {
      vector_base64: vectorBase64,
      top_k: topK,
      similarity_threshold: 0.1
    });
    
    return response.data.results || [];
  } catch (error) {
    console.error('Error finding similar narcotics with base64:', error);
    throw error;
  }
};

/**
 * ดึงข้อมูลยาเสพติดตาม ID
 * @param {number} id - ID ของยาเสพติด
 * @returns {Promise<Object>} ข้อมูลยาเสพติด
 */
export const fetchNarcoticById = async (id) => {
  try {
    if (!id) {
      throw new Error('ไม่ได้ระบุ ID ของยาเสพติด');
    }
    
    const response = await api.get(`/api/narcotics/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching narcotic by ID:', error);
    throw error;
  }
};

/**
 * เตรียมข้อมูลยาเสพติดสำหรับแสดงใน CandidateShow
 * @param {Array} similarNarcotics - รายการยาเสพติดที่คล้ายคลึง
 * @returns {Array} ข้อมูลที่จัดรูปแบบแล้ว
 */
export const prepareSimilarNarcoticsForDisplay = (similarNarcotics) => {
  if (!similarNarcotics || !Array.isArray(similarNarcotics) || similarNarcotics.length === 0) {
    return [{
      label: 'ยาเสพติดประเภทไม่ทราบชนิด',
      displayName: 'ยาเสพติดประเภทไม่ทราบชนิด',
      confidence: 0,
      isUnknownDrug: true,
      characteristics: 'ไม่ทราบอัตลักษณ์',
      exhibit_id: 94, // UNKNOWN_DRUG ID
      drug_type: 'ไม่ทราบชนิด',
      drug_category: 'ไม่ทราบประเภท'
    }];
  }
  
  const formattedCandidates = similarNarcotics.map(narcotic => ({
    label: narcotic.characteristics || 'ยาเสพติดไม่ทราบลักษณะ',
    displayName: narcotic.characteristics || 'ยาเสพติดไม่ทราบลักษณะ',
    confidence: narcotic.similarity || 0,
    narcotic_id: narcotic.narcotic_id,
    drug_type: narcotic.drug_type || 'ยาเสพติดไม่ทราบชนิด',
    drug_category: narcotic.drug_category || 'ยาเสพติดไม่ทราบประเภท',
    characteristics: narcotic.characteristics || 'ไม่ทราบอัตลักษณ์',
    similarity: narcotic.similarity || 0
  }));
  
  // เพิ่มตัวเลือก "ยาเสพติดประเภทไม่ทราบชนิด"
  formattedCandidates.push({
    label: 'ยาเสพติดประเภทไม่ทราบชนิด',
    displayName: 'ยาเสพติดประเภทไม่ทราบชนิด',
    confidence: 0,
    isUnknownDrug: true,
    characteristics: 'ไม่ทราบอัตลักษณ์',
    exhibit_id: 94, // UNKNOWN_DRUG ID
    drug_type: 'ไม่ทราบชนิด',
    drug_category: 'ไม่ทราบประเภท'
  });
  
  return formattedCandidates;
};