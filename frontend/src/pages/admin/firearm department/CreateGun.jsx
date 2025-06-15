import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, Plus, X, ChevronDown, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
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
    verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import apiConfig from '../../../config/api';

const SortableImage = ({ id, src, onSelect, onRemove, isSelected }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        border: isSelected ? '2px solid #990000' : '2px solid #E5E7EB',
        borderRadius: '0.375rem',
        overflow: 'hidden',
        cursor: 'pointer'
    };
    return (
        <div className="relative group">
            <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="w-16 h-16">
                <img
                    src={src}
                    alt="thumb"
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

const CreateGun = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [unauthorized, setUnauthorized] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    
    const [gunData, setGunData] = useState({
        brand: '',
        model: '',
        series: '',
        manufacturer: '',
        type: '',
        mechanism: ''
    });

    const [errors, setErrors] = useState({});

    const [selectedAmmunition, setSelectedAmmunition] = useState([]);
    const [isAmmunitionDropdownOpen, setIsAmmunitionDropdownOpen] = useState(false);
    const ammunitionDropdownRef = useRef(null);
    
    const [ammunitionOptions, setAmmunitionOptions] = useState([]);
    const [loadingAmmunition, setLoadingAmmunition] = useState(false);
    const [ammunitionError, setAmmunitionError] = useState(null);

    const fetchAmmunitionOptions = async () => {
        setLoadingAmmunition(true);
        setAmmunitionError(null);
        
        try {
            const response = await fetch(`${apiConfig.baseUrl}/api/ammunitions`);
            if (!response.ok) {
                throw new Error('Failed to fetch ammunition data');
            }
            
            const data = await response.json();
            const calibers = data.map(ammo => ammo.caliber);
            setAmmunitionOptions(calibers);
        } catch (error) {
            console.error('Error fetching ammunition:', error);
            setAmmunitionError(error.message);
        } finally {
            setLoadingAmmunition(false);
        }
    };

    useEffect(() => {
        fetchAmmunitionOptions();
    }, []);

    useEffect(() => {
        if (!user) return;
        
        const isAuthorized = user.role?.id === 2 && user.department === "กลุ่มงานอาวุธปืน";
        
        if (!isAuthorized) {
            setUnauthorized(true);
            const timer = setTimeout(() => {
                navigate('/home');
            }, 3000);
            
            return () => clearTimeout(timer);
        }
    }, [user, navigate]);

    useEffect(() => {
        function handleClickOutside(event) {
            if (ammunitionDropdownRef.current && !ammunitionDropdownRef.current.contains(event.target)) {
                setIsAmmunitionDropdownOpen(false);
            }
        }
        
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleGoBack = () => {
        navigate(-1);
    };

    const [images, setImages] = useState([]);
    const [selectedThumb, setSelectedThumb] = useState(0);
    const [actualImages, setActualImages] = useState([]);  // เก็บไฟล์จริงสำหรับการอัพโหลด

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        const imageUrls = files.map(file => URL.createObjectURL(file));
        setImages(prev => [...prev, ...imageUrls]);
        setActualImages(prev => [...prev, ...files]);  // เก็บไฟล์จริงสำหรับอัพโหลด
    };

    const sensors = useSensors(useSensor(PointerSensor));

    const handleRemoveImage = (index) => {
        setImages(prev => {
            const updated = [...prev];
            updated.splice(index, 1);
            if (selectedThumb >= updated.length) {
                setSelectedThumb(Math.max(0, updated.length - 1));
            }
            return updated;
        });
        
        setActualImages(prev => {
            const updated = [...prev];
            updated.splice(index, 1);
            return updated;
        });
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (active.id !== over.id) {
            const oldIndex = images.findIndex(img => img === active.id);
            const newIndex = images.findIndex(img => img === over.id);
            
            setImages(prev => arrayMove(prev, oldIndex, newIndex));
            setActualImages(prev => arrayMove(prev, oldIndex, newIndex));
            setSelectedThumb(newIndex);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setGunData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAmmunitionSelect = (ammo) => {
        if (!selectedAmmunition.includes(ammo)) {
            setSelectedAmmunition([...selectedAmmunition, ammo]);
        }
    };
    
    const handleRemoveAmmunition = (ammo) => {
        setSelectedAmmunition(selectedAmmunition.filter(item => item !== ammo));
    };

    const handleVerify = () => {
        const newErrors = {};
        if (!gunData.brand.trim()) newErrors.brand = 'กรุณาระบุยี่ห้อ';
        if (!gunData.model.trim()) newErrors.model = 'กรุณาระบุรุ่น';
        if (!gunData.manufacturer.trim()) newErrors.manufacturer = 'กรุณาระบุบริษัทที่ผลิต';
        if (!gunData.type.trim()) newErrors.type = 'กรุณาระบุประเภท';
        if (!gunData.mechanism.trim()) newErrors.mechanism = 'กรุณาระบุกลไก';
        
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }
        
        setErrors({});
        setIsVerifying(true);
    };

    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState(null);
    const [savedSuccess, setSavedSuccess] = useState(false);

    const handleSubmit = async () => {
        try {
            setIsSaving(true);
            
            // เพิ่มโค้ดตรงนี้เพื่อแปลงชื่อกระสุนเป็น ID
            // 1. ดึงข้อมูลกระสุนทั้งหมดก่อน
            const ammunitionResponse = await fetch(`${apiConfig.baseUrl}/api/ammunitions`);
            const ammunitionData = await ammunitionResponse.json();
            
            // 2. แปลงชื่อกระสุนเป็น ID
            const ammunitionIds = selectedAmmunition.map(ammoName => {
                const ammo = ammunitionData.find(a => a.caliber === ammoName);
                return ammo ? ammo.id : null;
            }).filter(id => id !== null);
            
            // 3. ส่งข้อมูลที่ถูกต้อง
            const exhibitResponse = await fetch(`${apiConfig.baseUrl}/api/exhibits`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    exhibit: {
                        category: 'อาวุธปืน',
                        subcategory: gunData.type
                    }
                }),
            });

            // ตรวจสอบการสร้าง exhibit
            if (!exhibitResponse.ok) {
                const errorData = await exhibitResponse.json().catch(() => ({}));
                throw new Error(`ไม่สามารถสร้างรายการอาวุธปืนได้ ${JSON.stringify(errorData)}`);
            }

            // ถ้าสร้าง exhibit สำเร็จ ให้ดึง ID มา
            const exhibitData = await exhibitResponse.json();
            const exhibitId = exhibitData.id;

            // แทนที่จะสร้าง firearm แยก ให้อัพเดท exhibit ที่สร้างไปแล้วพร้อมข้อมูล firearm
            const firearmResponse = await fetch(`${apiConfig.baseUrl}/api/exhibits/${exhibitId}`, {
                method: 'PUT',  // ใช้ PUT เพื่ออัพเดทข้อมูลที่มีอยู่แล้ว
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    exhibit: {
                        // จำเป็นต้องส่ง exhibit object แม้จะเป็นค่าเดิม
                        category: 'อาวุธปืน',
                        subcategory: gunData.type
                    },
                    firearm: {
                        exhibit_id: exhibitId,  // ต้องระบุ exhibit_id ใน firearm ด้วย
                        mechanism: gunData.mechanism,
                        brand: gunData.brand,
                        series: gunData.series || null,
                        model: gunData.model,
                        normalized_name: `${gunData.brand.toLowerCase()}${gunData.model.toLowerCase()}`
                    }
                }),
            });

            // ตรวจสอบการอัพเดท firearm
            if (!firearmResponse.ok) {
                const errorData = await firearmResponse.json().catch(() => ({}));
                throw new Error(`ไม่สามารถอัพเดทข้อมูลปืนได้ ${JSON.stringify(errorData)}`);
            }

            // ดึงข้อมูล firearm ที่อัพเดทเสร็จแล้ว
            const firearmData = await firearmResponse.json();

            // จากข้อมูล API response ที่ได้ ค่า ID ของ firearm อยู่ใน firearm.id
            const firearmId = firearmData.firearm.id;

            // บันทึก log เพื่อตรวจสอบ
            console.log("Raw firearm response:", firearmData);
            console.log("Correct firearm ID:", firearmId);

            console.log("Firearm data:", firearmData);
            console.log("Using firearm ID:", firearmId);

            // 3. อัพโหลดรูปภาพ (ถ้ามี)
            const uploadedImages = [];
            if (actualImages.length > 0) {
                for (let i = 0; i < actualImages.length; i++) {
                    const formData = new FormData();
                    formData.append('file', actualImages[i]);
                    formData.append('description', `รูปภาพ ${gunData.brand} ${gunData.model} #${i+1}`);
                    formData.append('priority', i);
                    
                    try {
                        const imageResponse = await fetch(`${apiConfig.baseUrl}/api/exhibits/${exhibitId}/images`, {
                            method: 'POST',
                            body: formData
                        });
                        
                        if (!imageResponse.ok) {
                            const errorText = await imageResponse.text();
                            console.warn(`ไม่สามารถอัพโหลดรูปภาพที่ ${i+1} ได้: ${imageResponse.status} ${errorText}`);
                        } else {
                            const imageData = await imageResponse.json();
                            uploadedImages.push(imageData);
                        }
                    } catch (imgError) {
                        console.error(`Error uploading image ${i+1}:`, imgError);
                    }
                }
            }
            
            // 4. อัพเดทข้อมูล firearm เหมือนเดิมโดยไม่รวม ammunitions
            const firearmUpdateResponse = await fetch(`${apiConfig.baseUrl}/api/exhibits/${exhibitId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    exhibit: { category: 'อาวุธปืน', subcategory: gunData.type },
                    firearm: {
                        id: firearmId,
                        exhibit_id: exhibitId,
                        mechanism: gunData.mechanism,
                        brand: gunData.brand,
                        series: gunData.series || null,
                        model: gunData.model,
                        normalized_name: `${gunData.brand.toLowerCase()}${gunData.model.toLowerCase()}`
                    }
                })
            });

            // 5. เชื่อมกระสุนกับอาวุธปืน (ส่ง ID แทนชื่อกระสุน)
            if (ammunitionIds.length > 0) {
                await fetch(`${apiConfig.baseUrl}/api/firearms/${firearmId}/ammunitions`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ammunition_ids: ammunitionIds })  // ห่อใน object
                });
            }
            
            console.log("Uploaded images:", uploadedImages);
            
            // แสดงการบันทึกสำเร็จ
            setSavedSuccess(true);

            setTimeout(() => {
                navigate('/admin/guns/catalog-management');
            }, 1500);
            
        } catch (error) {
            console.error('Error saving gun data:', error);
            setSaveError(error.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
        } finally {
            setIsSaving(false);
        }
    };

    if (unauthorized) {
        return (
            <div className="flex flex-col items-center justify-center w-full h-full bg-gray-100">
                <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
                    <div className="text-red-600 text-5xl mb-4">⚠️</div>
                    <h1 className="text-2xl font-bold text-red-600 mb-4">ไม่มีสิทธิ์เข้าถึง</h1>
                    <p className="text-gray-600 mb-6">
                        คุณไม่มีสิทธิ์ในการเข้าถึงหน้านี้ หน้านี้สำหรับผู้ใช้ที่มีบทบาทเป็นแผนกอาวุธปืนเท่านั้น
                    </p>
                    <p className="text-gray-500">กำลังนำคุณกลับไปยังหน้าหลัก...</p>
                </div>
            </div>
        );
    }

    if (isVerifying) {
        return (
            <div className="flex flex-col w-full h-full bg-gray-100 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between w-full py-4 pl-4">
                    <div className="flex items-center">
                        <button 
                            className="flex items-center text-[#990000] font-medium"
                            onClick={() => setIsVerifying(false)}
                        >
                            <ChevronLeft className="h-5 w-5 mr-1" />
                            ย้อนกลับ
                        </button>
                    </div>
                </div>
                
                <div className="flex items-center justify-between w-full px-6">
                    <h1 className="text-xl font-bold mb-4">ตรวจสอบข้อมูล</h1>
                </div>

                <div className="flex-1 overflow-auto">
                    <div className="px-6 pb-6">
                        <div className="bg-white rounded-lg p-6 mb-4">
                            <h2 className="text-lg font-medium mb-6 text-[#990000]">ข้อมูลอาวุธปืน</h2>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <div className="mb-4">
                                        <p className="text-sm text-gray-500">ยี่ห้อ</p>
                                        <p className="font-medium">{gunData.brand || '-'}</p>
                                    </div>
                                    
                                    <div className="mb-4">
                                        <p className="text-sm text-gray-500">รุ่น</p>
                                        <p className="font-medium">{gunData.model || '-'}</p>
                                    </div>
                                    
                                    <div className="mb-4">
                                        <p className="text-sm text-gray-500">ซีรี่ส์</p>
                                        <p className="font-medium">{gunData.series || '-'}</p>
                                    </div>
                                </div>
                                
                                <div>
                                    <div className="mb-4">
                                        <p className="text-sm text-gray-500">บริษัทที่ผลิต</p>
                                        <p className="font-medium">{gunData.manufacturer || '-'}</p>
                                    </div>
                                    
                                    <div className="mb-4">
                                        <p className="text-sm text-gray-500">ประเภท</p>
                                        <p className="font-medium">{gunData.type || '-'}</p>
                                    </div>
                                    
                                    <div className="mb-4">
                                        <p className="text-sm text-gray-500">กลไก</p>
                                        <p className="font-medium">{gunData.mechanism || '-'}</p>
                                    </div>
                                </div>
                            </div>

                            {selectedAmmunition.length > 0 && (
                                <div className="mt-6 border-t border-gray-200 pt-4">
                                    <p className="text-sm text-gray-500 mb-2">กระสุนที่ใช้ร่วมกัน</p>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedAmmunition.map((ammo, index) => (
                                            <span key={index} className="px-3 py-1 rounded-full bg-gray-100 text-gray-800 text-sm">
                                                {ammo}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        <div className="bg-white rounded-lg p-6 mb-4">
                            <h2 className="text-lg font-medium mb-4 text-[#990000]">รูปภาพ ({images.length})</h2>
                            
                            {images.length > 0 ? (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {images.map((img, index) => (
                                        <div key={index} className="aspect-square rounded-md overflow-hidden bg-gray-50">
                                            <img 
                                                src={img} 
                                                alt={`อาวุธปืน ${index + 1}`} 
                                                className="w-full h-full object-contain"
                                            />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500">ไม่มีรูปภาพ</p>
                            )}
                        </div>
                    </div>
                </div>
                
                {/* แสดงข้อความบันทึกสำเร็จ */}
                {savedSuccess && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
                            <div className="text-green-500 text-5xl mb-4">✓</div>
                            <h2 className="text-2xl font-medium mb-4">บันทึกข้อมูลสำเร็จ</h2>
                            <p className="text-gray-600">กำลังนำคุณไปยังหน้ารายการอาวุธปืน...</p>
                        </div>
                    </div>
                )}

                {/* ปรับแต่งปุ่มบันทึกเพื่อแสดงสถานะ */}
                <div className="w-full py-4 px-4 flex justify-end border-t space-x-4 bg-white">
                    <button 
                        className="w-32 py-1.5 border border-t-2 border-r-2 border-l-2 border-b-4 border-[#6B0000] rounded-lg text-[#900B09]"
                        onClick={() => setIsVerifying(false)}
                        disabled={isSaving}
                    >
                        แก้ไข
                    </button>
                    <button 
                        className={`w-32 py-1.5 border-[#6B0000] border-b-4 bg-[#990000] rounded-lg text-white flex items-center justify-center ${isSaving ? 'opacity-70' : ''}`}
                        onClick={handleSubmit}
                        disabled={isSaving}
                    >
                        {isSaving ? (
                            <>
                                <span className="animate-spin mr-2"><Loader size={16} /></span>
                                กำลังบันทึก...
                            </>
                        ) : 'บันทึก'}
                    </button>
                </div>

                {/* แสดงข้อความ error */}
                {saveError && (
                    <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md">
                        <p>{saveError}</p>
                        <button 
                            className="absolute top-2 right-2 text-red-500"
                            onClick={() => setSaveError(null)}
                        >
                            <X size={16} />
                        </button>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="flex flex-col w-full h-full bg-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between w-full py-4 pl-4">
                <div className="flex items-center">
                <button 
                    className="flex items-center text-[#990000] font-medium"
                    onClick={handleGoBack}
                >
                    <ChevronLeft className="h-5 w-5 mr-1" />
                    ย้อนกลับ
                </button>
                </div>
            </div>
            
            <div className="flex items-center justify-between w-full px-6">
                <h1 className="text-xl font-bold mb-4">เพิ่มอาวุธปืน</h1>
            </div>
            <div className="flex-1 overflow-auto">
                <div className="px-6 pb-6 grid grid-cols-1 md:grid-cols-12 gap-4">
                    <div className="md:col-span-8 bg-white rounded-lg p-6">
                        <h2 className="text-lg font-medium mb-6">ข้อมูลทั่วไป</h2>
                        
                        <div className="mb-6 grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm mb-1">ยี่ห้อ <span className="text-red-600">*</span></label>
                                <input 
                                    type="text" 
                                    name="brand"
                                    value={gunData.brand}
                                    onChange={handleInputChange}
                                    className={`w-full px-3 py-2 bg-white border ${errors.brand ? 'border-red-500' : 'border-gray-300'} rounded-md`}
                                    placeholder="ระบุยี่ห้อ"
                                />
                                {errors.brand && <p className="text-red-500 text-xs mt-1">{errors.brand}</p>}
                            </div>
                            <div>
                                <label className="block text-sm mb-1">รุ่น <span className="text-red-600">*</span></label>
                                <input 
                                    type="text"
                                    name="model"
                                    value={gunData.model}
                                    onChange={handleInputChange}
                                    className={`w-full px-3 py-2 bg-white border ${errors.model ? 'border-red-500' : 'border-gray-300'} rounded-md`}
                                    placeholder="ระบุรุ่น"
                                />
                                {errors.model && <p className="text-red-500 text-xs mt-1">{errors.model}</p>}
                            </div>
                            <div>
                                <label className="block text-sm mb-1">ซีรี่ส์</label>
                                <input 
                                    type="text"
                                    name="series"
                                    value={gunData.series}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md"
                                    placeholder="ระบุซีรี่ส์"
                                />
                            </div>
                        </div>
                        
                        <div className="mb-6">
                            <label className="block text-sm mb-1">บริษัทที่ผลิต <span className="text-red-600">*</span></label>
                            <input 
                                type="text"
                                name="manufacturer"
                                value={gunData.manufacturer}
                                onChange={handleInputChange}
                                className={`w-full px-3 py-2 bg-white border ${errors.manufacturer ? 'border-red-500' : 'border-gray-300'} rounded-md`}
                                placeholder="ระบุบริษัทที่ผลิต"
                            />
                            {errors.manufacturer && <p className="text-red-500 text-xs mt-1">{errors.manufacturer}</p>}
                        </div>
                        
                        <h2 className="text-lg font-medium mb-6">ประเภท และกลไก</h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="mb-4">
                                <label className="block text-sm mb-1">ประเภท <span className="text-red-600">*</span></label>
                                <input 
                                    type="text"
                                    name="type"
                                    value={gunData.type}
                                    onChange={handleInputChange}
                                    className={`w-full px-3 py-2 bg-white border ${errors.type ? 'border-red-500' : 'border-gray-300'} rounded-md`}
                                    placeholder="ระบุประเภท"
                                />
                                {errors.type && <p className="text-red-500 text-xs mt-1">{errors.type}</p>}
                            </div>
                            
                            <div className="mb-4">
                                <label className="block text-sm mb-1">กลไก <span className="text-red-600">*</span></label>
                                <input 
                                    type="text"
                                    name="mechanism"
                                    value={gunData.mechanism}
                                    onChange={handleInputChange}
                                    className={`w-full px-3 py-2 bg-white border ${errors.mechanism ? 'border-red-500' : 'border-gray-300'} rounded-md`}
                                    placeholder="ระบุกลไก"
                                />
                                {errors.mechanism && <p className="text-red-500 text-xs mt-1">{errors.mechanism}</p>}
                            </div>
                        </div>

                        <h2 className="text-lg font-medium mb-6 mt-8">กระสุนที่ใช้ร่วมกัน</h2>
                        
                        <div className="mb-6">
                            <div className="relative" ref={ammunitionDropdownRef}>
                                <div 
                                    className="flex items-center justify-between w-full px-3 py-2 bg-white border border-gray-300 rounded-md cursor-pointer"
                                    onClick={() => setIsAmmunitionDropdownOpen(!isAmmunitionDropdownOpen)}
                                >
                                    <span className="text-gray-600">
                                        {loadingAmmunition ? "กำลังโหลดข้อมูล..." : 
                                          selectedAmmunition.length > 0 ? `เลือก ${selectedAmmunition.length} รายการ` : "เลือกกระสุนที่ใช้ร่วมกัน"}
                                    </span>
                                    {loadingAmmunition ? (
                                        <span className="animate-spin"><Loader size={16} /></span>
                                    ) : (
                                        <ChevronDown className="h-4 w-4 text-gray-500" />
                                    )}
                                </div>
                                
                                {isAmmunitionDropdownOpen && (
                                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                                        {loadingAmmunition ? (
                                            <div className="px-3 py-2 text-center text-gray-500">
                                                กำลังโหลดข้อมูล...
                                            </div>
                                        ) : ammunitionError ? (
                                            <div className="px-3 py-2 text-center text-red-500">
                                                เกิดข้อผิดพลาด: {ammunitionError}
                                            </div>
                                        ) : ammunitionOptions.length === 0 ? (
                                            <div className="px-3 py-2 text-center text-gray-500">
                                                ไม่พบข้อมูลกระสุน
                                            </div>
                                        ) : (
                                            ammunitionOptions.map((ammo, index) => (
                                                <div 
                                                    key={index} 
                                                    className={`px-3 py-2 cursor-pointer hover:bg-gray-100 ${selectedAmmunition.includes(ammo) ? 'bg-gray-50' : ''}`}
                                                    onClick={() => {
                                                        handleAmmunitionSelect(ammo);
                                                        setIsAmmunitionDropdownOpen(false);
                                                    }}
                                                >
                                                    {ammo}
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>
                            
                            {selectedAmmunition.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-3">
                                    {selectedAmmunition.map((ammo, index) => (
                                        <div key={index} className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm flex items-center gap-1 group">
                                            {ammo}
                                            <button 
                                                type="button"
                                                className="w-4 h-4 rounded-full bg-gray-300 text-white flex items-center justify-center group-hover:bg-red-500 transition-colors"
                                                onClick={() => handleRemoveAmmunition(ammo)}
                                            >
                                                <X size={10} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {ammunitionError && (
                                <div className="mt-2">
                                    <button
                                        type="button"
                                        onClick={fetchAmmunitionOptions}
                                        className="text-sm text-[#990000] hover:underline"
                                    >
                                        ลองใหม่อีกครั้ง
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="md:col-span-4">
                        <div className="bg-white rounded-lg p-6 mb-4 shadow-sm">
                            <h2 className="text-lg font-medium mb-4">อัพโหลดรูปภาพ</h2>

                            <div className="bg-gray-50 rounded-md mb-4 shadow-inner overflow-hidden">
                                {images.length > 0 ? (
                                    <div className="relative w-full h-48">
                                        <img
                                            src={images[selectedThumb]}
                                            alt="Selected preview"
                                            className="w-full h-full object-contain rounded-md"
                                        />
                                    </div>
                                ) : (
                                    <div className="w-full h-48 bg-gray-100 rounded-md flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200">
                                        <div className="mb-2">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <p>ยังไม่มีรูปภาพ</p>
                                        <p className="text-xs mt-1">อัพโหลดรูปภาพด้านล่าง</p>
                                    </div>
                                )}
                            </div>

                            <h3 className="text-sm font-medium text-gray-700 mb-2">รูปภาพทั้งหมด ({images.length})</h3>
                            <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragEnd={handleDragEnd}
                            >
                                <SortableContext items={images} strategy={verticalListSortingStrategy}>
                                    <div className="flex items-center gap-3 mb-3 flex-wrap">
                                        {images.map((img, index) => (
                                            <SortableImage
                                                key={img}
                                                id={img}
                                                src={img}
                                                isSelected={selectedThumb === index}
                                                onSelect={() => setSelectedThumb(index)}
                                                onRemove={() => handleRemoveImage(index)}
                                            />
                                        ))}

                                        <label className="w-16 h-16 rounded border-2 border-dashed border-[#990000] flex flex-col items-center justify-center cursor-pointer hover:bg-red-50 transition-colors duration-300">
                                            <Plus className="h-5 w-5 text-[#990000]" />
                                            <span className="text-[10px] text-[#990000] mt-1">เพิ่มรูปภาพ</span>
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
                                <p className="text-xs text-gray-500 mt-2">
                                    *สามารถลากเพื่อจัดเรียงรูปภาพได้
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="w-full py-4 px-4 flex justify-end border-t space-x-4 bg-white">
                <button 
                    className="w-32 py-1.5 border border-t-2 border-r-2 border-l-2 border-b-4 border-[#6B0000] rounded-lg text-[#900B09]"
                    onClick={handleGoBack}
                >
                    ยกเลิก
                </button>
                <button 
                    className="w-32 py-1.5 border-[#6B0000] border-b-4 bg-[#990000] rounded-lg text-white"
                    onClick={handleVerify}
                >
                    ตรวจสอบข้อมูล
                </button>
            </div>
        </div>
    );
}

export default CreateGun;