import { useState, useEffect, useCallback } from 'react';
import { narcoticHistoryService } from '../services/narcoticHistoryService';

export const useNarcoticHistory = () => {
  const [histories, setHistories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ดึงประวัติยาเสพติดทั้งหมด
  const fetchNarcoticHistories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await narcoticHistoryService.getAllNarcoticHistories();
      setHistories(data);
      return data;
    } catch (err) {
      setError(err.message || 'Failed to fetch narcotic histories');
      console.error('Error in fetchNarcoticHistories:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // ดึงประวัติยาเสพติดตาม ID
  const fetchNarcoticHistoryById = useCallback(async (historyId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await narcoticHistoryService.getNarcoticHistoryById(historyId);
      return data;
    } catch (err) {
      setError(err.message || 'Failed to fetch narcotic history');
      console.error('Error in fetchNarcoticHistoryById:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // สร้างประวัติยาเสพติดใหม่
  const createNarcoticHistory = useCallback(async (historyData) => {
    setLoading(true);
    setError(null);
    try {
      const newHistory = await narcoticHistoryService.createNarcoticHistory(historyData);
      setHistories(prev => [newHistory, ...prev]);
      return newHistory;
    } catch (err) {
      setError(err.message || 'Failed to create narcotic history');
      console.error('Error in createNarcoticHistory:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // อัพเดทประวัติยาเสพติด
  const updateNarcoticHistory = useCallback(async (historyId, historyData) => {
    setLoading(true);
    setError(null);
    try {
      const updatedHistory = await narcoticHistoryService.updateNarcoticHistory(historyId, historyData);
      setHistories(prev => 
        prev.map(history => 
          history.id === historyId ? updatedHistory : history
        )
      );
      return updatedHistory;
    } catch (err) {
      setError(err.message || 'Failed to update narcotic history');
      console.error('Error in updateNarcoticHistory:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ลบประวัติยาเสพติด
  const deleteNarcoticHistory = useCallback(async (historyId) => {
    setLoading(true);
    setError(null);
    try {
      await narcoticHistoryService.deleteNarcoticHistory(historyId);
      setHistories(prev => prev.filter(history => history.id !== historyId));
      return true;
    } catch (err) {
      setError(err.message || 'Failed to delete narcotic history');
      console.error('Error in deleteNarcoticHistory:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // ดึงประวัติยาเสพติดตาม exhibit ID
  const fetchNarcoticHistoriesByExhibit = useCallback(async (exhibitId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await narcoticHistoryService.getNarcoticHistoriesByExhibit(exhibitId);
      return data;
    } catch (err) {
      setError(err.message || 'Failed to fetch narcotic histories by exhibit');
      console.error('Error in fetchNarcoticHistoriesByExhibit:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // ดึงประวัติยาเสพติดโดยผู้ใช้
  const fetchNarcoticHistoriesByUser = useCallback(async (userId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await narcoticHistoryService.getNarcoticHistoriesByUser(userId);
      return data;
    } catch (err) {
      setError(err.message || 'Failed to fetch narcotic histories by user');
      console.error('Error in fetchNarcoticHistoriesByUser:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // รีเฟรชข้อมูล
  const refreshData = useCallback(() => {
    fetchNarcoticHistories();
  }, [fetchNarcoticHistories]);

  // กรองข้อมูลตามเงื่อนไข
  const filterHistories = useCallback((filterFn) => {
    return histories.filter(filterFn);
  }, [histories]);

  // ค้นหาประวัติ
  const searchHistories = useCallback((searchTerm) => {
    if (!searchTerm) return histories;
    
    return histories.filter(history => 
      history.exhibit?.subcategory?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      history.subdistrict_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      history.district_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      history.province_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      history.discoverer_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [histories]);

  // เรียงลำดับประวัติ
  const sortHistories = useCallback((sortBy = 'created_at', sortOrder = 'desc') => {
    return [...histories].sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }, [histories]);

  // เคลียร์ error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    histories,
    loading,
    error,
    
    // Actions
    fetchNarcoticHistories,
    fetchNarcoticHistoryById,
    createNarcoticHistory,
    updateNarcoticHistory,
    deleteNarcoticHistory,
    fetchNarcoticHistoriesByExhibit,
    fetchNarcoticHistoriesByUser,
    refreshData,
    
    // Utilities
    filterHistories,
    searchHistories,
    sortHistories,
    clearError
  };
};

// Hook สำหรับดึงประวัติยาเสพติดเดียว
export const useNarcoticHistoryDetail = (historyId) => {
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchHistory = useCallback(async () => {
    if (!historyId) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await narcoticHistoryService.getNarcoticHistoryById(historyId);
      setHistory(data);
      return data;
    } catch (err) {
      setError(err.message || 'Failed to fetch narcotic history detail');
      console.error('Error in fetchHistory:', err);
    } finally {
      setLoading(false);
    }
  }, [historyId]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return {
    history,
    loading,
    error,
    refetch: fetchHistory,
    clearError: () => setError(null)
  };
};

export default useNarcoticHistory;