import React, { useState, useEffect, useRef } from 'react';
import { X, Loader, Plus, ChevronDown } from 'lucide-react';
import apiConfig from '../../../config/api';
import {
    DndContext,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    useSortable,
    horizontalListSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const SortableImage = ({ id, src, onSelect, onRemove, isSelected, index }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        border: isSelected ? '2px solid #990000' : '2px solid #E5E7EB',
        borderRadius: '0.375rem',
        overflow: 'hidden',
        cursor: 'grab',
        width: '4rem',
        height: '4rem'
    };
    return (
        <div className="relative group">
            <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
                <img
                    src={src}
                    alt={`thumb-${index}`}
                    onClick={onSelect}
                    className="w-full h-full object-contain"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300"></div>
            </div>
            <button
                className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-red-700 shadow-md"
                onClick={(e) => {
                    e.stopPropagation();
                    onRemove();
                }}
                type="button"
                aria-label="ลบรูปภาพ"
            >
                <X size={12} />
            </button>
        </div>
    );
};

const CreateGunModal = ({ isOpen, onClose, onGunCreated }) => {
  const [gunData, setGunData] = useState({
    brand: '', model: '', series: '', manufacturer: '', type: '', mechanism: ''
  });
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const [selectedAmmunition, setSelectedAmmunition] = useState([]);
  const [ammunitionOptions, setAmmunitionOptions] = useState([]);
  const [loadingAmmunition, setLoadingAmmunition] = useState(false);
  const [isAmmunitionDropdownOpen, setIsAmmunitionDropdownOpen] = useState(false);
  const ammunitionDropdownRef = useRef(null);

  const [images, setImages] = useState([]);
  const [actualImages, setActualImages] = useState([]);
  const [selectedThumb, setSelectedThumb] = useState(0);

  const sensors = useSensors(useSensor(PointerSensor, {
    activationConstraint: {
      distance: 8,
    },
  }));

  const fetchAmmunitionOptions = async () => {
    setLoadingAmmunition(true);
    try {
      const response = await fetch(`${apiConfig.baseUrl}/api/ammunitions`);
      if (!response.ok) throw new Error('Failed to fetch ammunition');
      const data = await response.json();
      setAmmunitionOptions(data.map(ammo => ammo.caliber));
    } catch (error) {
      console.error('Error fetching ammunition:', error);
    } finally {
      setLoadingAmmunition(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchAmmunitionOptions();
      setGunData({ brand: '', model: '', series: '', manufacturer: '', type: '', mechanism: '' });
      setSelectedAmmunition([]);
      setImages([]);
      setActualImages([]);
      setSelectedThumb(0);
      setErrors({});
      setSaveError(null);
      setIsSaving(false);
    }
  }, [isOpen]);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImageUrls = files.map(file => ({ id: URL.createObjectURL(file) + Date.now(), url: URL.createObjectURL(file) }));
    setImages(prev => [...prev, ...newImageUrls]);
    setActualImages(prev => [...prev, ...files]);
  };

  const handleRemoveImage = (indexToRemove) => {
    setImages(prev => prev.filter((_, index) => index !== indexToRemove));
    setActualImages(prev => prev.filter((_, index) => index !== indexToRemove));
    if (selectedThumb >= images.length - 1) {
        setSelectedThumb(Math.max(0, images.length - 2));
    }
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
        const oldIndex = images.findIndex(img => img.id === active.id);
        const newIndex = images.findIndex(img => img.id === over.id);
        
        setImages(prev => arrayMove(prev, oldIndex, newIndex));
        setActualImages(prev => arrayMove(prev, oldIndex, newIndex));
        setSelectedThumb(newIndex);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setGunData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleAmmunitionSelect = (ammo) => {
    if (!selectedAmmunition.includes(ammo)) {
      setSelectedAmmunition([...selectedAmmunition, ammo]);
    }
    setIsAmmunitionDropdownOpen(false);
  };

  const handleRemoveAmmunition = (ammo) => {
    setSelectedAmmunition(selectedAmmunition.filter(item => item !== ammo));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!gunData.brand.trim()) newErrors.brand = 'กรุณาระบุยี่ห้อ';
    if (!gunData.model.trim()) newErrors.model = 'กรุณาระบุรุ่น';
    if (!gunData.type.trim()) newErrors.type = 'กรุณาระบุประเภท';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSaving(true);
    setSaveError(null);

    try {
      const exhibitResponse = await fetch(`${apiConfig.baseUrl}/api/exhibits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exhibit: { category: 'อาวุธปืน', subcategory: gunData.type }
        }),
      });
      if (!exhibitResponse.ok) {
        const errData = await exhibitResponse.json().catch(() => ({}));
        throw new Error(`Exhibit creation failed: ${errData.detail || exhibitResponse.statusText}`);
      }
      const exhibitData = await exhibitResponse.json();
      const exhibitId = exhibitData.id;

      const firearmPayload = {
        exhibit: { category: 'อาวุธปืน', subcategory: gunData.type },
        firearm: {
          exhibit_id: exhibitId,
          brand: gunData.brand,
          model: gunData.model,
          series: gunData.series || null,
          manufacturer: gunData.manufacturer || null,
          mechanism: gunData.mechanism || null,
          normalized_name: `${gunData.brand.toLowerCase().trim()}${gunData.model.toLowerCase().trim()}`
        }
      };
      
      const firearmResponse = await fetch(`${apiConfig.baseUrl}/api/exhibits/${exhibitId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(firearmPayload),
      });

      if (!firearmResponse.ok) {
        const errData = await firearmResponse.json().catch(() => ({}));
        throw new Error(`Firearm creation/update failed: ${errData.detail || firearmResponse.statusText}`);
      }
      const createdFirearmData = await firearmResponse.json();
      const firearmId = createdFirearmData.firearm?.id;

      if (actualImages.length > 0 && exhibitId) {
        for (let i = 0; i < actualImages.length; i++) {
            const formData = new FormData();
            formData.append('file', actualImages[i]);
            formData.append('description', `รูปภาพ ${gunData.brand} ${gunData.model} #${i + 1}`);
            formData.append('priority', i);
            
            try {
                const imageResponse = await fetch(`${apiConfig.baseUrl}/api/exhibits/${exhibitId}/images`, {
                    method: 'POST',
                    body: formData
                });
                if (!imageResponse.ok) {
                    const errorText = await imageResponse.text();
                    console.warn(`ไม่สามารถอัพโหลดรูปภาพที่ ${i + 1} ได้: ${imageResponse.status} ${errorText}`);
                }
            } catch (imgError) {
                console.error(`Error uploading image ${i + 1}:`, imgError);
            }
        }
      }
      
      if (selectedAmmunition.length > 0 && firearmId) {
        const allAmmosResponse = await fetch(`${apiConfig.baseUrl}/api/ammunitions`);
        if (!allAmmosResponse.ok) throw new Error('Failed to fetch all ammunitions for ID mapping');
        const allAmmos = await allAmmosResponse.json();
        
        const ammunitionIds = selectedAmmunition.map(name => {
          const ammoObj = allAmmos.find(a => a.caliber === name);
          return ammoObj ? ammoObj.id : null;
        }).filter(id => id !== null);

        if (ammunitionIds.length > 0) {
          await fetch(`${apiConfig.baseUrl}/api/firearms/${firearmId}/ammunitions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ammunition_ids: ammunitionIds })
          });
        }
      }
      
      onGunCreated({
        displayName: `${gunData.brand} ${gunData.model}`, 
        value: `${gunData.brand} ${gunData.model}`,
        originalData: createdFirearmData.firearm 
      });
      onClose();

    } catch (error) {
      console.error('Error creating gun:', error);
      setSaveError(error.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[10001] backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[95vh] flex flex-col transform transition-all">
        <div className="flex justify-between items-center border-b p-5">
          <h3 className="text-xl font-semibold text-gray-800">สร้างข้อมูลอาวุธปืนใหม่</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full"
            disabled={isSaving}
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto p-6 space-y-6">
          <div>
            <h4 className="text-md font-semibold text-gray-700 mb-3">ข้อมูลทั่วไป</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-1">ยี่ห้อ <span className="text-red-500">*</span></label>
                <input type="text" name="brand" id="brand" value={gunData.brand} onChange={handleInputChange} className={`w-full p-2.5 border rounded-lg ${errors.brand ? 'border-red-500' : 'border-gray-300'}`} />
                {errors.brand && <p className="text-xs text-red-500 mt-1">{errors.brand}</p>}
              </div>
              <div>
                <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-1">รุ่น <span className="text-red-500">*</span></label>
                <input type="text" name="model" id="model" value={gunData.model} onChange={handleInputChange} className={`w-full p-2.5 border rounded-lg ${errors.model ? 'border-red-500' : 'border-gray-300'}`} />
                {errors.model && <p className="text-xs text-red-500 mt-1">{errors.model}</p>}
              </div>
              <div>
                <label htmlFor="series" className="block text-sm font-medium text-gray-700 mb-1">ซีรี่ส์</label>
                <input type="text" name="series" id="series" value={gunData.series} onChange={handleInputChange} className="w-full p-2.5 border border-gray-300 rounded-lg" />
              </div>
            </div>
            <div className="mt-4">
              <label htmlFor="manufacturer" className="block text-sm font-medium text-gray-700 mb-1">บริษัทผู้ผลิต</label>
              <input type="text" name="manufacturer" id="manufacturer" value={gunData.manufacturer} onChange={handleInputChange} className="w-full p-2.5 border border-gray-300 rounded-lg" />
            </div>
          </div>

          <div>
            <h4 className="text-md font-semibold text-gray-700 mb-3">ประเภทและกลไก</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">ประเภท (Subcategory) <span className="text-red-500">*</span></label>
                <input type="text" name="type" id="type" value={gunData.type} onChange={handleInputChange} className={`w-full p-2.5 border rounded-lg ${errors.type ? 'border-red-500' : 'border-gray-300'}`} placeholder="เช่น Pistol, Rifle"/>
                {errors.type && <p className="text-xs text-red-500 mt-1">{errors.type}</p>}
              </div>
              <div>
                <label htmlFor="mechanism" className="block text-sm font-medium text-gray-700 mb-1">กลไก</label>
                <input type="text" name="mechanism" id="mechanism" value={gunData.mechanism} onChange={handleInputChange} className="w-full p-2.5 border border-gray-300 rounded-lg" />
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="text-md font-semibold text-gray-700 mb-3">กระสุนที่ใช้ร่วมกัน</h4>
            <div className="relative" ref={ammunitionDropdownRef}>
              <button type="button" onClick={() => setIsAmmunitionDropdownOpen(!isAmmunitionDropdownOpen)} className="w-full flex justify-between items-center p-2.5 border border-gray-300 rounded-lg text-left">
                <span>{selectedAmmunition.length > 0 ? selectedAmmunition.join(', ') : (loadingAmmunition ? 'กำลังโหลด...' : 'เลือกกระสุน...')}</span>
                {loadingAmmunition ? <Loader size={16} className="animate-spin"/> : <ChevronDown size={16} />}
              </button>
              {isAmmunitionDropdownOpen && (
                <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
                  {ammunitionOptions.map(ammo => (
                    <div key={ammo} onClick={() => handleAmmunitionSelect(ammo)} className={`p-2.5 hover:bg-gray-100 cursor-pointer ${selectedAmmunition.includes(ammo) ? 'bg-gray-50 font-medium' : ''}`}>
                      {ammo}
                    </div>
                  ))}
                </div>
              )}
            </div>
            {selectedAmmunition.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {selectedAmmunition.map(ammo => (
                  <span key={ammo} className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-sm flex items-center">
                    {ammo}
                    <button type="button" onClick={() => handleRemoveAmmunition(ammo)} className="ml-1.5 text-gray-500 hover:text-red-500">
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div>
            <h4 className="text-md font-semibold text-gray-700 mb-3">รูปภาพ ({images.length})</h4>
            <div className="bg-gray-50 rounded-md mb-4 shadow-inner overflow-hidden">
                {images.length > 0 ? (
                    <div className="relative w-full h-48 sm:h-64">
                        <img
                            src={images[selectedThumb]?.url || ''}
                            alt="Selected preview"
                            className="w-full h-full object-contain rounded-md"
                        />
                    </div>
                ) : (
                    <div className="w-full h-48 sm:h-64 bg-gray-100 rounded-md flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="mt-2">ยังไม่มีรูปภาพ</p>
                    </div>
                )}
            </div>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext items={images.map(img => img.id)} strategy={horizontalListSortingStrategy}>
                    <div className="flex items-center gap-3 mb-3 flex-wrap">
                        {images.map((img, index) => (
                            <SortableImage
                                key={img.id}
                                id={img.id}
                                src={img.url}
                                index={index}
                                isSelected={selectedThumb === index}
                                onSelect={() => setSelectedThumb(index)}
                                onRemove={() => handleRemoveImage(index)}
                            />
                        ))}
                        <label className="w-16 h-16 rounded border-2 border-dashed border-blue-500 flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50 transition-colors duration-300">
                            <Plus className="h-5 w-5 text-blue-500" />
                            <span className="text-[10px] text-blue-500 mt-1">เพิ่มรูป</span>
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleImageUpload}
                                className="hidden"
                            />
                        </label>
                    </div>
                </SortableContext>
            </DndContext>
            {images.length > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                    *สามารถลากเพื่อจัดเรียงรูปภาพได้ รูปแรกสุด (ซ้ายสุด) จะเป็นรูปภาพหลัก
                </p>
            )}
          </div>

          {saveError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <strong className="font-bold">เกิดข้อผิดพลาด: </strong>
              <span className="block sm:inline">{saveError}</span>
            </div>
          )}

          <div className="border-t pt-5 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-6 py-2.5 bg-gray-200 text-gray-700 hover:bg-gray-300 rounded-lg transition-colors font-medium"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 bg-green-600 text-white hover:bg-green-700 rounded-lg shadow hover:shadow-md transition-all active:scale-95 font-medium flex items-center justify-center"
            >
              {isSaving ? <><Loader size={20} className="animate-spin mr-2" /> กำลังบันทึก...</> : 'บันทึกข้อมูลปืน'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGunModal;