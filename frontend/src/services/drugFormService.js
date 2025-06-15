import { api } from "../config/api";

export const getDrugForms = async () => {
  try {
    const response = await api.get('/api/drug-forms');
    
    return response.data;
  } catch (error) {
    console.error('Error fetching drug forms:', error);
    throw error;
  }
};