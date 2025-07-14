import { api } from '../config/api';

export const narcoticService = {
  // ค้นหายาเสพติดที่คล้ายคลึงจาก vector
  async findSimilarNarcotics(vector, topK = 3) {
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
  },

  // ค้นหายาเสพติดจาก base64 vector
  async findSimilarNarcoticsWithBase64(vectorBase64, topK = 3) {
    if (!vectorBase64) {
      throw new Error('Invalid base64 vector data');
    }
    
    const response = await api.post('/api/search-vector', {
      vector_base64: vectorBase64,
      top_k: topK,
      similarity_threshold: 0.1
    });
    
    return response.data.results || [];
  },

  // ดึงข้อมูลยาเสพติดตาม ID
  async getNarcoticById(id) {
    if (!id) {
      throw new Error('ไม่ได้ระบุ ID ของยาเสพติด');
    }
    
    const response = await api.get(`/api/narcotics/${id}`);
    return response.data;
  }
};