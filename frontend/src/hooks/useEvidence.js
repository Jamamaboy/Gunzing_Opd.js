import { useState } from 'react';
import { firearmService } from '../services/firearmService';

export const useEvidence = () => {
  const [evidence, setEvidence] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchFirearmDetails = async (brandName, modelName) => {
    try {
      setLoading(true);
      setError(null);
      
      const exhibitsData = await firearmService.getAllExhibits();
      
      if (brandName === 'Unknown' && modelName === 'Unknown') {
        const unknownWeapon = exhibitsData.find(exhibit => exhibit.id === 21);
        
        if (unknownWeapon) {
          setEvidence({
            details: {
              id: 21,
              brand: 'Unknown',
              model: '',
              type: 'อาวุธปืนประเภทไม่ทราบชนิด',
              exhibit: {
                id: 21,
                category: unknownWeapon.category,
                subcategory: unknownWeapon.subcategory,
              }
            }
          });
          return true;
        }
        return false;
      }
      
      // ค้นหา firearm ที่ตรงกัน
      const normalizedName = normalizeNameForSearch(brandName, modelName);
      const matchingExhibit = exhibitsData.find(exhibit => 
        exhibit.firearm && 
        normalizeNameForSearch(exhibit.firearm.brand, exhibit.firearm.model) === normalizedName
      );
      
      if (matchingExhibit) {
        setEvidence({
          details: {
            ...matchingExhibit.firearm,
            exhibit: {
              id: matchingExhibit.id,
              category: matchingExhibit.category,
              subcategory: matchingExhibit.subcategory,
            },
            images: matchingExhibit.images,
          }
        });
        return true;
      }
      
      return false;
    } catch (err) {
      console.error('Error fetching firearm details:', err);
      setError(err.message || 'Failed to fetch firearm details');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Helper function (ย้ายมาจาก component)
  const normalizeNameForSearch = (brand, model) => {
    return `${brand?.toLowerCase() || ''} ${model?.toLowerCase() || ''}`.trim();
  };

  return {
    evidence,
    loading,
    error,
    fetchFirearmDetails,
    setEvidence
  };
};