import { useState, useEffect } from 'react';
import { fetchDrugCases } from '../services/drugCasesApi';

const useDrugCases = () => {
  const [drugCases, setDrugCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getDrugCases = async () => {
      try {
        const data = await fetchDrugCases();
        setDrugCases(data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    getDrugCases();
  }, []);

  return { drugCases, loading, error };
};

export default useDrugCases;