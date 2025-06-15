import { useState, useEffect } from 'react';
import { firearmService } from '../services/firearmService';

export const useFirearms = () => {
  const [guns, setGuns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFirearms = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // ใช้ service เพื่อดึงข้อมูล
      const exhibitsData = await firearmService.getAllExhibits();
      
      // ใช้ service เพื่อแปลงข้อมูล
      const transformedGuns = firearmService.transformExhibitsToGuns(exhibitsData);
      
      setGuns(transformedGuns);
    } catch (err) {
      console.error('Error in useFirearms:', err);
      setError(err.message || 'Failed to fetch firearms');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFirearms();
  }, []);

  // Return function เพื่อให้ component สามารถ refetch ได้
  const refetch = () => {
    fetchFirearms();
  };

  return { 
    guns, 
    loading, 
    error, 
    refetch 
  };
};