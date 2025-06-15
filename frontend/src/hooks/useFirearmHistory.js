import { useState, useCallback } from 'react';
import { firearmHistoryService } from '../services/firearmHistoryService';

const useFirearmHistory = () => {
  const [data, setData] = useState([]);
  const [singleData, setSingleData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchFirearmHistory = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await firearmHistoryService.getAllFirearmHistory();
      
      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการดึงข้อมูล');
      console.error('Error in fetchFirearmHistory:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchFirearmHistoryById = useCallback(async (historyId) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await firearmHistoryService.getFirearmHistoryById(historyId);
      
      if (result.success) {
        setSingleData(result.data);
        return result.data;
      } else {
        setError(result.error);
        return null;
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการดึงข้อมูล');
      console.error('Error in fetchFirearmHistoryById:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    data,
    singleData,
    isLoading,
    error,
    fetchFirearmHistory,
    fetchFirearmHistoryById,
    refetch: fetchFirearmHistory
  };
};

export default useFirearmHistory;