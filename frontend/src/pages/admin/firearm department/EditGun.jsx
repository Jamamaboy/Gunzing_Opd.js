import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, Plus, X, ChevronDown, Loader, Save } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
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
import { canAccessFirearmManagement, getUserRole, getUserDepartment } from '../../../utils/auth';

const SortableImage = ({ id, src, onSelect, onRemove, isSelected, isNew = false }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        border: isSelected ? '2px solid #990000' : '2px solid #E5E7EB',
        borderRadius: '0.375rem',
        overflow: 'hidden',
        cursor: 'pointer',
        position: 'relative'
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
                 {isNew && (
                    <span className="absolute top-0 right-0 bg-blue-500 text-white text-xs px-1 rounded-bl-md">ใหม่</span>
                )}
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

const EditGun = () => {
    const navigate = useNavigate();
    const { gunId } = useParams();
    const { user } = useAuth();

    // ✅ เพิ่ม userLoading state ที่ขาดหาย
    const [userLoading, setUserLoading] = useState(true);
    const [initialLoading, setInitialLoading] = useState(true);
    const [loadingError, setLoadingError] = useState(null);
    const [unauthorized, setUnauthorized] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);

    const [gunData, setGunData] = useState({
        brand: '',
        model: '',
        series: '',
        type: '',
        mechanism: ''
    });
    
    const [exhibitData, setExhibitData] = useState({ 
        id: null,
        category: 'อาวุธปืน', 
        subcategory: ''
    });

    const [errors, setErrors] = useState({});

    // States สำหรับรูปภาพ
    const [images, setImages] = useState([]);
    const [selectedThumb, setSelectedThumb] = useState(0);
    const [actualImages, setActualImages] = useState([]);
    const [newImageFiles, setNewImageFiles] = useState([]);
    const [imagesToRemove, setImagesToRemove] = useState([]);

    // States สำหรับ ammunition
    const [selectedAmmunition, setSelectedAmmunition] = useState([]);
    const [initialAmmunitionNames, setInitialAmmunitionNames] = useState([]);
    const [isAmmunitionDropdownOpen, setIsAmmunitionDropdownOpen] = useState(false);
    const ammunitionDropdownRef = useRef(null);
    
    const [ammunitionOptions, setAmmunitionOptions] = useState([]);
    const [allAmmunitionData, setAllAmmunitionData] = useState([]);
    const [loadingAmmunition, setLoadingAmmunition] = useState(false);
    const [ammunitionError, setAmmunitionError] = useState(null);

    // States สำหรับการบันทึก
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState(null);
    const [savedSuccess, setSavedSuccess] = useState(false);

    // ✅ รวม state สำหรับรูปภาพให้ตรงกับที่ใช้ใน JSX
    const [existingImages, setExistingImages] = useState([]);

    // ✅ เพิ่ม sensors สำหรับ drag and drop
    const sensors = useSensors(useSensor(PointerSensor));

    // ✅ เพิ่มฟังก์ชันที่ขาดหาย
    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (active.id !== over?.id) {
            setExistingImages((items) => {
                const oldIndex = items.findIndex(item => item.url === active.id);
                const newIndex = items.findIndex(item => item.url === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    const handleVerify = () => {
        // ✅ เพิ่มการตรวจสอบข้อมูลก่อน verify
        const newErrors = {};
        
        if (!gunData.brand.trim()) {
            newErrors.brand = 'กรุณาระบุยี่ห้อ';
        }
        
        if (!gunData.model.trim()) {
            newErrors.model = 'กรุณาระบุรุ่น';
        }
        
        if (!exhibitData.subcategory.trim()) {
            newErrors.type = 'กรุณาระบุประเภท';
        }
        
        if (!gunData.mechanism.trim()) {
            newErrors.mechanism = 'กรุณาระบุกลไก';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setIsVerifying(true);
    };

    // ฟังก์ชันสำหรับจัดการรูปภาพ
    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        const newImages = [];
        
        files.forEach(file => {
            if (file.type.startsWith('image/')) {
                const imageUrl = URL.createObjectURL(file);
                newImages.push({
                    id: `new-${Date.now()}-${Math.random()}`,
                    url: imageUrl,
                    file: file,
                    isNew: true
                });
            }
        });

        setExistingImages(prev => [...prev, ...newImages]);
        setNewImageFiles(prev => [...prev, ...newImages.map(img => img.file)]);
    };

    const handleRemoveImage = (index) => {
        const imageToRemove = existingImages[index];
        
        if (imageToRemove.isNew) {
            // รูปใหม่ - ลบจาก newImageFiles
            const fileIndex = newImageFiles.findIndex(file => file === imageToRemove.file);
            if (fileIndex >= 0) {
                setNewImageFiles(prev => prev.filter((_, i) => i !== fileIndex));
            }
        } else {
            // รูปเดิม - เพิ่มใน imagesToRemove
            setImagesToRemove(prev => [...prev, imageToRemove.id]);
        }

        setExistingImages(prev => prev.filter((_, i) => i !== index));
        
        // ปรับ selectedThumb
        if (selectedThumb >= index && selectedThumb > 0) {
            setSelectedThumb(prev => prev - 1);
        } else if (selectedThumb === index && existingImages.length > 1) {
            setSelectedThumb(0);
        }
    };

    // ฟังก์ชันสำหรับจัดการ ammunition
    const fetchAmmunitionOptions = async () => {
        setLoadingAmmunition(true);
        setAmmunitionError(null);
        
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/ammunitions`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error('ไม่สามารถโหลดข้อมูลกระสุนได้');
            }

            const data = await response.json();
            setAllAmmunitionData(data);
            setAmmunitionOptions(data.map(ammo => ammo.caliber));
        } catch (error) {
            console.error('Error fetching ammunition:', error);
            setAmmunitionError(error.message);
        } finally {
            setLoadingAmmunition(false);
        }
    };

    const handleAmmunitionSelect = (ammo) => {
        if (!selectedAmmunition.includes(ammo)) {
            setSelectedAmmunition(prev => [...prev, ammo]);
        }
        setIsAmmunitionDropdownOpen(false);
    };
    
    const handleRemoveAmmunition = (ammo) => {
        setSelectedAmmunition(prev => prev.filter(item => item !== ammo));
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        
        if (name === 'type') {
            // สำหรับ subcategory
            setExhibitData(prev => ({
                ...prev,
                subcategory: value
            }));
        } else {
            setGunData(prev => ({
                ...prev,
                [name]: value
            }));
        }
        
        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: null
            }));
        }
    };

    const handleGoBack = () => {
        navigate(-1);
    };

    const fetchGunData = async () => {
        if (!gunId) {
            setLoadingError('ไม่พบ ID ของอาวุธปืน');
            setInitialLoading(false);
            return;
        }

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/exhibits/by-firearm/${gunId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('ไม่พบข้อมูลอาวุธปืนที่ต้องการแก้ไข');
                }
                throw new Error('ไม่สามารถโหลดข้อมูลอาวุธปืนได้');
            }

            const exhibitData = await response.json();
            console.log('Loaded exhibit data:', exhibitData);

            if (!exhibitData.firearm) {
                throw new Error('ไม่พบข้อมูลอาวุธปืนในระบบ');
            }

            // Set exhibit data with ID
            setExhibitData({
                id: exhibitData.id,
                category: exhibitData.category,
                subcategory: exhibitData.subcategory
            });

            // Set firearm data
            setGunData({
                brand: exhibitData.firearm.brand || '',
                model: exhibitData.firearm.model || '',
                series: exhibitData.firearm.series || '',
                mechanism: exhibitData.firearm.mechanism || '',
                type: exhibitData.firearm.type || ''
            });

            // Set ammunition data
            if (exhibitData.firearm.ammunitions && exhibitData.firearm.ammunitions.length > 0) {
                const ammunitionNames = exhibitData.firearm.ammunitions.map(ammo => ammo.caliber);
                setSelectedAmmunition(ammunitionNames);
                setInitialAmmunitionNames(ammunitionNames);
            }

            // Set images data
            if (exhibitData.firearm.example_images && exhibitData.firearm.example_images.length > 0) {
                const existingImgs = exhibitData.firearm.example_images.map(img => ({
                    id: img.id,
                    url: img.image_url,
                    isNew: false
                }));
                setExistingImages(existingImgs);
                setSelectedThumb(0);
            }

        } catch (error) {
            console.error('Error fetching gun data:', error);
            setLoadingError(error.message);
        } finally {
            setInitialLoading(false);
        }
    };

    // ✅ รวมการตรวจสอบ authorization ใน useEffect เดียว
    useEffect(() => {
        console.log('Current user:', user);
        
        if (user === null) {
            setUserLoading(true);
            return;
        }
        
        if (user === false) {
            setUnauthorized(true);
            setUserLoading(false);
            return;
        }

        setUserLoading(false);
        
        // ✅ ใช้ฟังก์ชันใหม่ที่ตรวจสอบทั้ง role และ department
        const accessCheck = canAccessFirearmManagement(user);
        
        if (!accessCheck.canAccess) {
            console.log('Access denied:', accessCheck.reason);
            setUnauthorized(true);
            return;
        }

        console.log('User authorized:', {
            role: getUserRole(user),
            department: getUserDepartment(user)
        });
    }, [user]);

    // เรียกใช้ fetchGunData เมื่อ user ได้รับการยืนยันแล้ว
    useEffect(() => {
        if (gunId && !userLoading && !unauthorized && user) {
            fetchGunData();
        }
    }, [gunId, userLoading, unauthorized, user]);

    // Fetch ammunition options เมื่อ component mount
    useEffect(() => {
        fetchAmmunitionOptions();
    }, []);

    // Close dropdown เมื่อคลิกข้างนอก
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (ammunitionDropdownRef.current && !ammunitionDropdownRef.current.contains(event.target)) {
                setIsAmmunitionDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleSubmit = async () => {
        if (!exhibitData.id) {
            setSaveError('ไม่พบ ID ของ exhibit ไม่สามารถบันทึกข้อมูลได้');
            return;
        }

        setIsSaving(true);
        setSaveError(null);
        setSavedSuccess(false);

        try {
            // 1. อัปเดต exhibit และ firearm data
            const exhibitPayload = {
                category: "อาวุธปืน",
                subcategory: exhibitData.subcategory
            };

            const firearmPayload = {
                brand: gunData.brand,
                model: gunData.model,
                series: gunData.series || null,
                mechanism: gunData.mechanism,
                normalized_name: `${gunData.brand}${gunData.model}${gunData.series || ''}`.trim()
            };

            console.log('Updating exhibit with payload:', { exhibit: exhibitPayload, firearm: firearmPayload });

            const exhibitResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/exhibits/${exhibitData.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    exhibit: exhibitPayload,
                    firearm: firearmPayload
                })
            });

            if (!exhibitResponse.ok) {
                const errorData = await exhibitResponse.json();
                throw new Error(`ไม่สามารถอัปเดตข้อมูลอาวุธปืนได้: ${JSON.stringify(errorData)}`);
            }

            const updatedExhibit = await exhibitResponse.json();
            const firearmId = updatedExhibit.firearm?.id;

            if (!firearmId) {
                throw new Error('ไม่พบ ID ของอาวุธปืนหลังจากอัปเดต');
            }

            // 2. อัปเดต ammunition relationships
            if (selectedAmmunition.length > 0) {
                const ammunitionIds = selectedAmmunition.map(name => {
                    const ammo = allAmmunitionData.find(a => a.caliber === name);
                    return ammo?.id;
                }).filter(id => id !== undefined);

                if (ammunitionIds.length > 0) {
                    const ammunitionResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/firearms/${firearmId}/ammunitions`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        },
                        body: JSON.stringify({ ammunition_ids: ammunitionIds })
                    });

                    if (!ammunitionResponse.ok) {
                        console.warn('ไม่สามารถอัปเดตความสำพันธ์กับกระสุนได้');
                    }
                }
            }

            // ✅ 3. จัดการรูปภาพใหม่ - ใช้ exhibit endpoint
            if (newImageFiles.length > 0) {
                for (const file of newImageFiles) {
                    try {
                        const formData = new FormData();
                        formData.append('file', file);
                        formData.append('description', '');
                        formData.append('priority', '0');

                        // ✅ เปลี่ยนจาก /api/firearms/{firearm_id}/images เป็น /api/exhibits/{exhibit_id}/images
                        const imageResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/exhibits/${exhibitData.id}/images`, {
                            method: 'POST',
                            headers: {
                                'Authorization': `Bearer ${localStorage.getItem('token')}`
                            },
                            body: formData
                        });

                        if (!imageResponse.ok) {
                            const errorText = await imageResponse.text();
                            console.warn(`ไม่สามารถอัปโหลดรูปภาพได้:`, errorText);
                        }
                    } catch (imageError) {
                        console.warn('Error uploading image:', imageError);
                    }
                }
            }

            // ✅ 4. ลบรูปภาพที่ถูกเลือกให้ลบ - ใช้ exhibit endpoint
            if (imagesToRemove.length > 0) {
                for (const imageId of imagesToRemove) {
                    try {
                        // ✅ เปลี่ยนจาก /api/firearms/{firearm_id}/images/{image_id} เป็น /api/exhibits/{exhibit_id}/images/{image_id}
                        const deleteResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/exhibits/${exhibitData.id}/images/${imageId}`, {
                            method: 'DELETE',
                            headers: {
                                'Authorization': `Bearer ${localStorage.getItem('token')}`
                            }
                        });

                        if (!deleteResponse.ok) {
                            console.warn(`ไม่สามารถลบรูปภาพ ID ${imageId} ได้`);
                        }
                    } catch (deleteError) {
                        console.warn('Error deleting image:', deleteError);
                    }
                }
            }

            setSavedSuccess(true);
            setTimeout(() => {
                navigate('/admin/guns/catalog-management');
            }, 1500);

        } catch (error) {
            console.error('Error saving gun data:', error);
            setSaveError(error.message);
        } finally {
            setIsSaving(false);
        }
    };

    // ✅ แสดง loading เมื่อกำลังตรวจสอบ user
    if (userLoading) {
        return (
            <div className="h-full w-full bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">กำลังตรวจสอบสิทธิ์การเข้าถึง...</p>
                </div>
            </div>
        );
    }

    // ✅ แสดง unauthorized page
    if (unauthorized) {
        const accessCheck = user ? canAccessFirearmManagement(user) : { reason: 'ไม่ได้เข้าสู่ระบบ' };
        
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center max-w-md mx-auto p-6">
                    <div className="text-red-600 text-6xl mb-4">🚫</div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">ไม่มีสิทธิ์เข้าถึง</h2>
                    <p className="text-gray-600 mb-4">
                        คุณไม่มีสิทธิ์ในการเข้าถึงหน้านี้
                        <br />
                        <span className="text-sm text-red-600 font-medium">
                            เหตุผล: {accessCheck.reason}
                        </span>
                    </p>
                    
                    {/* แสดงข้อมูล user ปัจจุบัน */}
                    <div className="bg-gray-100 rounded-lg p-4 mb-6 text-left">
                        <h3 className="font-medium text-gray-900 mb-2">ข้อมูลผู้ใช้ปัจจุบัน:</h3>
                        <div className="text-sm text-gray-700 space-y-1">
                            <p><span className="font-medium">ชื่อ:</span> {user?.firstname} {user?.lastname}</p>
                            <p><span className="font-medium">Role:</span> {getUserRole(user) || 'ไม่ระบุ'}</p>
                            <p><span className="font-medium">Department:</span> {getUserDepartment(user) || 'ไม่ระบุ'}</p>
                        </div>
                    </div>
                    
                    <div className="bg-blue-50 rounded-lg p-4 mb-6 text-left">
                        <h3 className="font-medium text-blue-900 mb-2">สิทธิ์ที่ต้องการ:</h3>
                        <div className="text-sm text-blue-700 space-y-1">
                            <p>• Role: Admin หรือ Administrator</p>
                            <p>• Department: กลุ่มงานอาวุธปืน</p>
                        </div>
                    </div>
                    
                    <div className="space-x-4">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
                        >
                            ไปหน้าหลัก
                        </button>
                        <button
                            onClick={() => navigate(-1)}
                            className="bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700"
                        >
                            ย้อนกลับ
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ✅ แสดง loading state
    if (initialLoading) {
        return (
            <div className="h-full w-full bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">กำลังโหลดข้อมูลอาวุธปืน...</p>
                </div>
            </div>
        );
    }

    // ✅ แสดง error state
    if (loadingError) {
        return (
            <div className="้h-full w-full bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-red-600 text-6xl mb-4">⚠️</div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">เกิดข้อผิดพลาด</h2>
                    <p className="text-gray-600 mb-4">{loadingError}</p>
                    <button
                        onClick={() => navigate('/home')}
                        className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700"
                    >
                        กลับหน้าหลัก
                    </button>
                </div>
            </div>
        );
    }

    if (unauthorized) {
        return (
            <div className="flex flex-col items-center justify-center w-full h-full bg-gray-100">
                <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
                    <div className="text-red-600 text-5xl mb-4">⚠️</div>
                    <h1 className="text-2xl font-bold text-red-600 mb-4">ไม่มีสิทธิ์เข้าถึง</h1>
                    <p className="text-gray-600">คุณไม่มีสิทธิ์เข้าถึงหน้านี้</p>
                    <p className="text-gray-500">กำลังนำคุณกลับไปยังหน้าหลัก...</p>
                </div>
            </div>
        );
    }

    if (initialLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader className="animate-spin text-[#990000]" size={48} />
                <p className="ml-3 text-gray-600">กำลังโหลดข้อมูลอาวุธปืน...</p>
            </div>
        );
    }

    if (loadingError) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-4">
                <p className="text-red-600 text-xl mb-4">เกิดข้อผิดพลาด: {loadingError}</p>
                <button onClick={handleGoBack} className="px-4 py-2 bg-[#990000] text-white rounded hover:bg-[#7a0000]">
                    ย้อนกลับ
                </button>
            </div>
        );
    }
    
    if (isVerifying) {
        return (
            <div className="flex flex-col w-full h-full bg-gray-100 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between w-full py-4 pl-4">
                    <button 
                        className="flex items-center text-[#990000] font-medium"
                        onClick={() => setIsVerifying(false)}
                        disabled={isSaving}
                    >
                        <ChevronLeft className="h-5 w-5 mr-1" />
                        ย้อนกลับเพื่อแก้ไข
                    </button>
                </div>
                
                <div className="flex items-center justify-between w-full px-6">
                    <h1 className="text-xl font-bold mb-4">ตรวจสอบข้อมูล (แก้ไข)</h1>
                </div>

                <div className="flex-1 overflow-auto">
                    <div className="px-6 pb-6">
                        <div className="bg-white rounded-lg p-6 mb-4">
                            <h2 className="text-lg font-medium mb-6 text-[#990000]">ข้อมูลอาวุธปืน</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <p className="text-sm text-gray-500">ยี่ห้อ:</p> <p className="font-medium">{gunData.brand}</p>
                                    <p className="text-sm text-gray-500 mt-2">รุ่น:</p> <p className="font-medium">{gunData.model}</p>
                                    <p className="text-sm text-gray-500 mt-2">ซีรี่ส์:</p> <p className="font-medium">{gunData.series || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 mt-2">ประเภท (Subcategory):</p> <p className="font-medium">{exhibitData.subcategory}</p>
                                    <p className="text-sm text-gray-500 mt-2">กลไก:</p> <p className="font-medium">{gunData.mechanism}</p>
                                </div>
                            </div>
                             {selectedAmmunition.length > 0 && (
                                <div className="mt-6 border-t border-gray-200 pt-4">
                                    <p className="text-sm text-gray-500 mb-2">กระสุนที่ใช้ร่วมกัน:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedAmmunition.map((ammo, index) => (
                                            <span key={index} className="px-3 py-1 rounded-full bg-gray-100 text-gray-800 text-sm">{ammo}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="bg-white rounded-lg p-6 mb-4">
                            <h2 className="text-lg font-medium mb-4 text-[#990000]">รูปภาพ ({existingImages.length})</h2>
                            {existingImages.length > 0 ? (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {existingImages.map((img, index) => (
                                        <div key={img.id || `new-${index}`} className="aspect-square rounded-md overflow-hidden bg-gray-50 relative">
                                            <img src={img.url} alt={`อาวุธปืน ${index + 1}`} className="w-full h-full object-contain"/>
                                            {img.isNew && <span className="absolute top-0 right-0 bg-blue-500 text-white text-xs px-1 rounded-bl-md">ใหม่</span>}
                                        </div>
                                    ))}
                                </div>
                            ) : <p className="text-gray-500">ไม่มีรูปภาพ</p>}
                        </div>
                    </div>
                </div>
                
                {savedSuccess && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
                            <Save className="text-green-500 mx-auto mb-4" size={48} />
                            <h2 className="text-2xl font-medium mb-4">บันทึกข้อมูลสำเร็จ</h2>
                            <p className="text-gray-600">กำลังนำคุณไปยังหน้ารายการอาวุธปืน...</p>
                        </div>
                    </div>
                )}

                <div className="w-full py-4 px-4 flex justify-end border-t space-x-4 bg-white">
                    <button 
                        className="w-32 py-1.5 border border-t-2 border-r-2 border-l-2 border-b-4 border-[#6B0000] rounded-lg text-[#900B09]"
                        onClick={() => setIsVerifying(false)}
                        disabled={isSaving}
                    >
                        แก้ไข
                    </button>
                    <button 
                        className={`w-32 py-1.5 border-[#6B0000] border-b-4 bg-[#990000] rounded-lg text-white flex items-center justify-center ${isSaving ? 'opacity-70 cursor-not-allowed' : ''}`}
                        onClick={handleSubmit}
                        disabled={isSaving}
                    >
                        {isSaving ? <><Loader className="animate-spin mr-2" size={16} />กำลังบันทึก...</> : 'ยืนยันการแก้ไข'}
                    </button>
                </div>
                {saveError && (
                    <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md shadow-lg">
                        <p>{saveError}</p>
                        <button className="absolute top-1 right-1 text-red-500" onClick={() => setSaveError(null)}><X size={16} /></button>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="flex flex-col w-full h-full bg-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between w-full py-4 pl-4">
                <button className="flex items-center text-[#990000] font-medium" onClick={handleGoBack}>
                    <ChevronLeft className="h-5 w-5 mr-1" /> ย้อนกลับ
                </button>
            </div>
            <div className="flex items-center justify-between w-full px-6">
                <h1 className="text-xl font-bold mb-4">แก้ไขข้อมูลอาวุธปืน</h1>
            </div>

            <div className="flex-1 overflow-auto">
                <div className="px-6 pb-6 grid grid-cols-1 md:grid-cols-12 gap-4">
                    <div className="md:col-span-8 bg-white rounded-lg p-6">
                        <h2 className="text-lg font-medium mb-6">ข้อมูลทั่วไป</h2>
                        <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm mb-1">ยี่ห้อ <span className="text-red-600">*</span></label>
                                <input type="text" name="brand" value={gunData.brand} onChange={handleInputChange} className={`w-full px-3 py-2 bg-white border ${errors.brand ? 'border-red-500' : 'border-gray-300'} rounded-md`} placeholder="ระบุยี่ห้อ"/>
                                {errors.brand && <p className="text-red-500 text-xs mt-1">{errors.brand}</p>}
                            </div>
                            <div>
                                <label className="block text-sm mb-1">รุ่น <span className="text-red-600">*</span></label>
                                <input type="text" name="model" value={gunData.model} onChange={handleInputChange} className={`w-full px-3 py-2 bg-white border ${errors.model ? 'border-red-500' : 'border-gray-300'} rounded-md`} placeholder="ระบุรุ่น"/>
                                {errors.model && <p className="text-red-500 text-xs mt-1">{errors.model}</p>}
                            </div>
                            <div>
                                <label className="block text-sm mb-1">ซีรี่ส์</label>
                                <input type="text" name="series" value={gunData.series} onChange={handleInputChange} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md" placeholder="ระบุซีรี่ส์"/>
                            </div>
                        </div>
                        <h2 className="text-lg font-medium mb-6">ประเภท และกลไก</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="mb-4">
                                <label className="block text-sm mb-1">ประเภท (Subcategory) <span className="text-red-600">*</span></label>
                                <input type="text" name="type" value={exhibitData.subcategory} onChange={handleInputChange} className={`w-full px-3 py-2 bg-white border ${errors.type ? 'border-red-500' : 'border-gray-300'} rounded-md`} placeholder="ระบุประเภท"/>
                                {errors.type && <p className="text-red-500 text-xs mt-1">{errors.type}</p>}
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm mb-1">กลไก <span className="text-red-600">*</span></label>
                                <input type="text" name="mechanism" value={gunData.mechanism} onChange={handleInputChange} className={`w-full px-3 py-2 bg-white border ${errors.mechanism ? 'border-red-500' : 'border-gray-300'} rounded-md`} placeholder="ระบุกลไก"/>
                                {errors.mechanism && <p className="text-red-500 text-xs mt-1">{errors.mechanism}</p>}
                            </div>
                        </div>
                        <h2 className="text-lg font-medium mb-6 mt-8">กระสุนที่ใช้ร่วมกัน</h2>
                        <div className="mb-6">
                            <div className="relative" ref={ammunitionDropdownRef}>
                                <div className="flex items-center justify-between w-full px-3 py-2 bg-white border border-gray-300 rounded-md cursor-pointer" onClick={() => setIsAmmunitionDropdownOpen(!isAmmunitionDropdownOpen)}>
                                    <span className="text-gray-600">
                                        {loadingAmmunition ? "กำลังโหลด..." : selectedAmmunition.length > 0 ? `เลือก ${selectedAmmunition.length} รายการ` : "เลือกกระสุน"}
                                    </span>
                                    {loadingAmmunition ? <Loader className="animate-spin" size={16} /> : <ChevronDown className="h-4 w-4 text-gray-500" />}
                                </div>
                                {isAmmunitionDropdownOpen && (
                                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                                        {ammunitionOptions.map((ammoName, index) => (
                                            <div key={index} className={`px-3 py-2 cursor-pointer hover:bg-gray-100 ${selectedAmmunition.includes(ammoName) ? 'bg-gray-50 font-semibold' : ''}`}
                                                onClick={() => { handleAmmunitionSelect(ammoName); setIsAmmunitionDropdownOpen(false); }}>
                                                {ammoName}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            {selectedAmmunition.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-3">
                                    {selectedAmmunition.map((ammoName, index) => (
                                        <div key={index} className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm flex items-center gap-1 group">
                                            {ammoName}
                                            <button type="button" className="w-4 h-4 rounded-full bg-gray-300 text-white flex items-center justify-center group-hover:bg-red-500 transition-colors" onClick={() => handleRemoveAmmunition(ammoName)}>
                                                <X size={10} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {ammunitionError && <p className="text-red-500 text-xs mt-1">{ammunitionError} <button type="button" onClick={fetchAmmunitionOptions} className="text-blue-500 hover:underline">ลองใหม่</button></p>}
                        </div>
                    </div>

                    <div className="md:col-span-4">
                        <div className="bg-white rounded-lg p-6 mb-4 shadow-sm">
                            <h2 className="text-lg font-medium mb-4">รูปภาพ ({existingImages.length})</h2>
                            <div className="bg-gray-50 rounded-md mb-4 shadow-inner overflow-hidden">
                                {existingImages.length > 0 ? (
                                    <div className="relative w-full h-48">
                                        <img src={existingImages[selectedThumb]?.url} alt="Selected preview" className="w-full h-full object-contain rounded-md"/>
                                        {existingImages[selectedThumb]?.isNew && <span className="absolute top-0 right-0 bg-blue-500 text-white text-xs px-1 rounded-bl-md">ใหม่</span>}
                                    </div>
                                ) : (
                                    <div className="w-full h-48 bg-gray-100 rounded-md flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200">
                                        <Plus className="h-12 w-12 text-gray-300 mb-2" />
                                        <p>ยังไม่มีรูปภาพ</p>
                                        <p className="text-xs mt-1">อัพโหลดรูปภาพด้านล่าง</p>
                                    </div>
                                )}
                            </div>
                            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                                <SortableContext items={existingImages.map(img => img.url)} strategy={verticalListSortingStrategy}>
                                    <div className="flex items-center gap-3 mb-3 flex-wrap">
                                        {existingImages.map((img, index) => (
                                            <SortableImage
                                                key={img.id || `new-${index}`}
                                                id={img.url}
                                                src={img.url}
                                                isSelected={selectedThumb === index}
                                                onSelect={() => setSelectedThumb(index)}
                                                onRemove={() => handleRemoveImage(index)}
                                                isNew={img.isNew}
                                            />
                                        ))}
                                        <label className="w-16 h-16 rounded border-2 border-dashed border-[#990000] flex flex-col items-center justify-center cursor-pointer hover:bg-red-50 transition-colors">
                                            <Plus className="h-5 w-5 text-[#990000]" />
                                            <span className="text-[10px] text-[#990000] mt-1">เพิ่มรูป</span>
                                            <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden"/>
                                        </label>
                                    </div>
                                </SortableContext>
                            </DndContext>
                            {existingImages.length > 0 && <p className="text-xs text-gray-500 mt-2">*ลากเพื่อจัดเรียงรูปภาพ</p>}
                        </div>
                    </div>
                </div>
            </div>

            <div className="w-full py-4 px-4 flex justify-end border-t space-x-4 bg-white">
                <button className="w-32 py-1.5 border border-t-2 border-r-2 border-l-2 border-b-4 border-[#6B0000] rounded-lg text-[#900B09]" onClick={handleGoBack}>
                    ยกเลิก
                </button>
                <button className="w-32 py-1.5 border-[#6B0000] border-b-4 bg-[#990000] rounded-lg text-white" onClick={handleVerify}>
                    ตรวจสอบข้อมูล
                </button>
            </div>
        </div>
    );
};

export default EditGun;