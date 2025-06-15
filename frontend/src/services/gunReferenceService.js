import { api } from '../config/api';

const API_PATH = '/api';

/**
 * Fetches reference images for firearms from the database
 * @returns {Promise<Object>} An object mapping model names to image URLs
 */
export const fetchGunReferenceImages = async () => {
  try {
    console.log('🔫 Fetching gun reference images from API...');
    
    const response = await api.get(`${API_PATH}/exhibits`);
    const exhibits = response.data;
    
    console.log('🔫 Raw API response:', {
      status: response.status,
      dataType: typeof exhibits,
      isArray: Array.isArray(exhibits),
      length: Array.isArray(exhibits) ? exhibits.length : 'N/A',
      firstItem: Array.isArray(exhibits) && exhibits.length > 0 ? exhibits[0] : 'N/A'
    });
    
    if (!Array.isArray(exhibits)) {
      console.warn('🔫 Exhibits data is not an array:', exhibits);
      return { default: '' };
    }
    
    const imageMap = {};
    let processedCount = 0;
    let firearmCount = 0;
    let imageCount = 0;
    
    exhibits.forEach((exhibit, index) => {
      processedCount++;
      
      console.log(`🔫 Processing exhibit ${index}:`, {
        id: exhibit.id,
        category: exhibit.category,
        hasFirearm: !!exhibit.firearm,
        firearmBrand: exhibit.firearm?.brand,
        firearmModel: exhibit.firearm?.model
      });
      
      // *** แก้ไขเงื่อนไขการตรวจสอบ ***
      if (exhibit.firearm && exhibit.firearm.brand && exhibit.category === 'อาวุธปืน') {
        firearmCount++;
        const { brand, model, normalized_name } = exhibit.firearm;
        
        console.log(`🔫 Processing firearm ${firearmCount}:`, {
          index,
          brand,
          model,
          normalized_name,
          hasImages: !!(exhibit.firearm.example_images && exhibit.firearm.example_images.length > 0)
        });
        
        if (exhibit.firearm.example_images && exhibit.firearm.example_images.length > 0) {
          // Sort images by priority (lower number = higher priority)
          const sortedImages = [...exhibit.firearm.example_images]
            .sort((a, b) => (a.priority || 0) - (b.priority || 0));
          
          if (normalized_name && sortedImages[0]) {
            imageMap[normalized_name] = sortedImages[0].image_url;
            imageCount++;
            console.log(`🔫 Added image for ${brand} ${model}:`, sortedImages[0].image_url);
          } else {
            console.log(`🔫 No normalized_name or image for ${brand} ${model}`);
          }
        } else {
          console.log(`🔫 No example_images for ${brand} ${model}`);
        }
      } else {
        console.log(`🔫 Exhibit ${index} skipped:`, {
          hasFirearm: !!exhibit.firearm,
          hasBrand: !!(exhibit.firearm && exhibit.firearm.brand),
          category: exhibit.category,
          expectedCategory: 'อาวุธปืน'
        });
      }
    });
    
    // Add default empty image
    imageMap.default = '';
    
    console.log('🔫 Gun reference processing summary:', {
      totalExhibits: processedCount,
      firearmsFound: firearmCount,
      imagesAdded: imageCount,
      finalMapSize: Object.keys(imageMap).length - 1, // -1 for default
      mapKeys: Object.keys(imageMap)
    });
    
    return imageMap;
  } catch (error) {
    console.error('🔫 Error fetching gun reference images:', error);
    console.error('🔫 Error details:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
    return { default: '' };
  }
};

/**
 * Gets an image URL for a specific gun model using normalized name
 * @param {Object} imageMap - The map of normalized_name->image URLs
 * @param {string} brandName - Brand name
 * @param {string} modelName - Model name
 * @returns {string} The URL of the reference image
 */
export const getGunReferenceImage = (imageMap, brandName, modelName) => {
  if (!imageMap || !brandName || !modelName) {
    console.log('🔫 getGunReferenceImage: Missing parameters:', {
      hasImageMap: !!imageMap,
      brandName,
      modelName
    });
    return imageMap?.default || '';
  }
  
  // Create a normalized name similar to how the backend creates it
  const normalizedName = (brandName + modelName).toLowerCase().replace(/[^a-z0-9]/g, '');
  
  console.log('🔫 Looking for image:', {
    brandName,
    modelName,
    normalizedName,
    found: !!imageMap[normalizedName],
    availableKeys: Object.keys(imageMap).filter(key => key !== 'default')
  });
  
  return imageMap[normalizedName] || imageMap.default || '';
};