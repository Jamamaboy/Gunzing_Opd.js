import { api } from '../config/api';

export const firearmService = {
  // ดึงข้อมูล exhibits ทั้งหมด
  async getAllExhibits() {
    try {
      const response = await api.get('/api/exhibits');
      return response.data;
    } catch (error) {
      console.error('Error fetching exhibits:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch exhibits');
    }
  },

  // ดึงข้อมูล firearm โดย ID
  async getFirearmById(id) {
    try {
      const response = await api.get(`/api/firearms/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching firearm by ID:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch firearm');
    }
  },

  // แปลงข้อมูล exhibits เป็นรูปแบบสำหรับ catalog
  transformExhibitsToGuns(data) {
    return (Array.isArray(data) ? data : [])
      .filter(item => item.firearm)
      .map(item => ({
        id: item.id,
        image: item.images?.length
          ? item.images.map(img => img.image_url)
          : (item.firearm?.example_images?.length 
              ? item.firearm.example_images.map(img => img.image_url) 
              : []),
        mechanism: item.firearm.mechanism,
        brand: item.firearm.brand,
        series: item.firearm.series,
        model: item.firearm.model,
        normalized_name: item.firearm.normalized_name,
        subcategories: item.subcategory || '',
        categories: item.category || '',
        caliber: item.firearm.caliber || [],
      }));
  }
};