import { api } from '../config/api';

export const firearmHistoryService = {
  // Fetch ประวัติอาวุธปืนทั้งหมด
  getAllFirearmHistory: async () => {
    try {
      const response = await api.get('/api/history/firearms');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error fetching firearm history:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'เกิดข้อผิดพลาดในการดึงข้อมูลประวัติอาวุธปืน'
      };
    }
  },

  // Fetch ประวัติอาวุธปืนจาก ID
  getFirearmHistoryById: async (historyId) => {
    try {
      const response = await api.get(`/api/history/firearms/${historyId}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error fetching firearm history by ID:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'เกิดข้อผิดพลาดในการดึงข้อมูลประวัติอาวุธปืน'
      };
    }
  }
};