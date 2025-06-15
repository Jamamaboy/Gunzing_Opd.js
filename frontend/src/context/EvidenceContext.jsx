import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import apiConfig from '../config/api';

const API_PATH = '/api';

export const EvidenceContext = createContext();

export const EvidenceProvider = ({ children }) => {
  // สถานะข้อมูลวัตถุพยาน
  const [currentEvidence, setCurrentEvidence] = useState(null);
  const [evidenceHistory, setEvidenceHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // ค้นหาวัตถุพยานตาม ID
  const fetchEvidenceById = async (evidenceId) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.get(
        `${apiConfig.baseUrl}${API_PATH}/evidence/${evidenceId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      setCurrentEvidence(response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching evidence:', error);
      setError(error.response?.data?.detail || 'เกิดข้อผิดพลาดในการดึงข้อมูลวัตถุพยาน');
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  // ดึงประวัติทั้งหมด
  const fetchAllHistory = async (filters = {}) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.get(
        `${apiConfig.baseUrl}${API_PATH}/history`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          params: filters
        }
      );
      
      setEvidenceHistory(response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching history:', error);
      setError(error.response?.data?.detail || 'เกิดข้อผิดพลาดในการดึงข้อมูลประวัติ');
      return [];
    } finally {
      setIsLoading(false);
    }
  };
  
  // ดึงประวัติตาม ID
  const fetchHistoryById = async (historyId) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.get(
        `${apiConfig.baseUrl}${API_PATH}/history/${historyId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error fetching history detail:', error);
      setError(error.response?.data?.detail || 'เกิดข้อผิดพลาดในการดึงข้อมูลประวัติ');
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  // บันทึกข้อมูลวัตถุพยานใหม่
  const saveEvidenceToHistory = async (evidenceData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.post(
        `${apiConfig.baseUrl}${API_PATH}/history`,
        evidenceData,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      // เพิ่มข้อมูลใหม่ไปยังประวัติ
      setEvidenceHistory(prev => [response.data, ...prev]);
      
      return response.data;
    } catch (error) {
      console.error('Error saving evidence to history:', error);
      setError(error.response?.data?.detail || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // สรุปสถิติข้อมูลวัตถุพยาน
  const getEvidenceStatistics = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.get(
        `${apiConfig.baseUrl}${API_PATH}/statistics/evidence`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error fetching evidence statistics:', error);
      setError(error.response?.data?.detail || 'เกิดข้อผิดพลาดในการดึงข้อมูลสถิติ');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const evidenceContextValue = {
    // States
    currentEvidence,
    setCurrentEvidence,
    evidenceHistory,
    setEvidenceHistory,
    isLoading,
    error,
    
    // Functions
    fetchEvidenceById,
    fetchAllHistory,
    fetchHistoryById,
    saveEvidenceToHistory,
    getEvidenceStatistics
  };

  return (
    <EvidenceContext.Provider value={evidenceContextValue}>
      {children}
    </EvidenceContext.Provider>
  );
};

export const useEvidence = () => useContext(EvidenceContext);

export default EvidenceProvider;