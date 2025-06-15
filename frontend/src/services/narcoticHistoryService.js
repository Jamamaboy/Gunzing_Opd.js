import { api } from '../config/api';

export const narcoticHistoryService = {
  // ดึงประวัติยาเสพติดทั้งหมด
  getAllNarcoticHistories: async () => {
    try {
      const response = await api.get('/api/history/narcotics');
      return response.data;
    } catch (error) {
      console.error('Error fetching narcotic histories:', error);
      throw error;
    }
  },

  // ดึงประวัติยาเสพติดตาม ID
  getNarcoticHistoryById: async (historyId) => {
    try {
      const response = await api.get(`/api/history/narcotics/${historyId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching narcotic history ${historyId}:`, error);
      throw error;
    }
  },

  // สร้างประวัติยาเสพติดใหม่ (ถ้าต้องการ)
  createNarcoticHistory: async (historyData) => {
    try {
      const response = await api.post('/api/history', historyData);
      return response.data;
    } catch (error) {
      console.error('Error creating narcotic history:', error);
      throw error;
    }
  },

  // อัพเดทประวัติยาเสพติด
  updateNarcoticHistory: async (historyId, historyData) => {
    try {
      const response = await api.put(`/api/history/${historyId}`, historyData);
      return response.data;
    } catch (error) {
      console.error(`Error updating narcotic history ${historyId}:`, error);
      throw error;
    }
  },

  // ลบประวัติยาเสพติด
  deleteNarcoticHistory: async (historyId) => {
    try {
      const response = await api.delete(`/api/history/${historyId}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting narcotic history ${historyId}:`, error);
      throw error;
    }
  },

  // ดึงประวัติยาเสพติดตาม exhibit ID
  getNarcoticHistoriesByExhibit: async (exhibitId) => {
    try {
      const response = await api.get(`/api/history/exhibit/${exhibitId}`);
      // กรองเฉพาะประวัติที่เป็นยาเสพติด
      const narcoticHistories = response.data.filter(
        history => history.exhibit?.category === 'ยาเสพติด'
      );
      return narcoticHistories;
    } catch (error) {
      console.error(`Error fetching narcotic histories for exhibit ${exhibitId}:`, error);
      throw error;
    }
  },

  // ดึงประวัติยาเสพติดโดยผู้ใช้
  getNarcoticHistoriesByUser: async (userId) => {
    try {
      const response = await api.get(`/api/history?user_id=${userId}`);
      // กรองเฉพาะประวัติที่เป็นยาเสพติด
      const narcoticHistories = response.data.filter(
        history => history.exhibit?.category === 'ยาเสพติด'
      );
      return narcoticHistories;
    } catch (error) {
      console.error(`Error fetching narcotic histories for user ${userId}:`, error);
      throw error;
    }
  }
};

export default narcoticHistoryService;