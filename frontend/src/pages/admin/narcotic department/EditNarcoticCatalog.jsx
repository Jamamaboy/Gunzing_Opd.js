import React, { useState, useEffect } from 'react';
import { ChevronLeft, X } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { api } from '../../../config/api';
import { getDrugForms } from '../../../services/drugFormService';

// Import components
import DrugFormSection from '../../../components/Admin/Narcotics Department/DrugFormSection.jsx';
import PillCharacteristicsForm from '../../../components/Admin/Narcotics Department/PillCharacteristicsForm';
import PackageCharacteristicsForm from '../../../components/Admin/Narcotics Department/PackageCharacteristicsForm';
import AdditionalInfoForm from '../../../components/Admin/Narcotics Department/AdditionalInfoForm';
import ImageUploadSection from '../../../components/Admin/Narcotics Department/ImageUploadSection';
import { isPillForm, isPackageForm } from '../../../components/Admin/Narcotics Department/Utility.js';

const EditNarcoticCatalog = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { id } = useParams(); // narcotic_id from URL
    
    const [unauthorized, setUnauthorized] = useState(false);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [evidenceType, setEvidenceType] = useState("");
    
    const [formData, setFormData] = useState({
        drugType: "",
        drugCategory: "",
        characteristics: "",
        consumptionMethod: "",
        effect: "",
        weightGrams: "",
        formId: ""
    });
    
    const [pillData, setPillData] = useState({
        color: "",
        diameter_mm: "",
        thickness_mm: "",
        edge_shape: "",
        characteristics: "",
        edge_width_mm: "",
        weight_mg: ""
    });
    
    const [packageData, setPackageData] = useState({
        packageType: "",
        packageMaterial: "",
        packageColor: ""
    });
    
    const [originalImages, setOriginalImages] = useState([]); // รูปภาพเดิมจาก server
    const [newImages, setNewImages] = useState([]); // รูปภาพใหม่ที่จะอัพโหลด
    const [actualImages, setActualImages] = useState([]); // ไฟล์รูปภาพใหม่จริง
    const [imagesToDelete, setImagesToDelete] = useState([]); // รูปภาพที่จะลบ

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [submitError, setSubmitError] = useState(null);

    const [drugForms, setDrugForms] = useState([]);
    const [isLoadingDrugForms, setIsLoadingDrugForms] = useState(false);

    // Check authorization
    useEffect(() => {
        if (!user) return;
        
        const isAuthorized = user.role?.id === 2 && user.department === "กลุ่มงานยาเสพติด";
        
        if (!isAuthorized) {
            setUnauthorized(true);
            const timer = setTimeout(() => {
                navigate('/home');
            }, 3000);
            
            return () => clearTimeout(timer);
        }
    }, [user, navigate]);

    // Fetch drug forms
    useEffect(() => {
        const fetchDrugForms = async () => {
            setIsLoadingDrugForms(true);
            try {
                const data = await getDrugForms();
                setDrugForms(data);
            } catch (error) {
                console.error('Error fetching drug forms:', error);
                setSubmitError('ไม่สามารถโหลดข้อมูลรูปแบบยาเสพติดได้');
            } finally {
                setIsLoadingDrugForms(false);
            }
        };
        
        fetchDrugForms();
    }, []);

    // Fetch narcotic data for editing
    useEffect(() => {
        const fetchNarcoticData = async () => {
            if (!id) {
                setNotFound(true);
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                
                // Fetch narcotic data
                const response = await api.get(`/api/narcotics/${id}`);
                const narcotic = response.data;
                
                if (!narcotic) {
                    setNotFound(true);
                    return;
                }

                // Set form data
                setFormData({
                    drugType: narcotic.drug_type || "",
                    drugCategory: narcotic.drug_category || "",
                    characteristics: narcotic.characteristics || "",
                    consumptionMethod: narcotic.consumption_method || "",
                    effect: narcotic.effect || "",
                    weightGrams: narcotic.weight_grams ? narcotic.weight_grams.toString() : "",
                    formId: narcotic.form_id ? narcotic.form_id.toString() : ""
                });

                // Set evidence type based on form
                if (narcotic.form_id && drugForms.length > 0) {
                    const form = drugForms.find(f => f.id === narcotic.form_id);
                    if (form) {
                        setEvidenceType(form.form_name);
                    }
                }

                // Set pill data if exists
                if (narcotic.pill_info) {
                    setPillData({
                        color: narcotic.pill_info.color || "",
                        diameter_mm: narcotic.pill_info.diameter_mm ? narcotic.pill_info.diameter_mm.toString() : "",
                        thickness_mm: narcotic.pill_info.thickness_mm ? narcotic.pill_info.thickness_mm.toString() : "",
                        edge_shape: narcotic.pill_info.edge_shape || "",
                        characteristics: narcotic.pill_info.characteristics || "",
                        edge_width_mm: narcotic.pill_info.edge_width_mm ? narcotic.pill_info.edge_width_mm.toString() : "",
                        weight_mg: narcotic.pill_info.weight_mg ? narcotic.pill_info.weight_mg.toString() : ""
                    });
                }

                // Set original images
                if (narcotic.example_images && narcotic.example_images.length > 0) {
                    setOriginalImages(narcotic.example_images.map(img => ({
                        id: img.id,
                        url: img.image_url,
                        description: img.description,
                        priority: img.priority,
                        type: 'existing'
                    })));
                }

            } catch (error) {
                console.error('Error fetching narcotic data:', error);
                if (error.response?.status === 404) {
                    setNotFound(true);
                } else {
                    setSubmitError('ไม่สามารถโหลดข้อมูลยาเสพติดได้');
                }
            } finally {
                setLoading(false);
            }
        };

        if (drugForms.length > 0) {
            fetchNarcoticData();
        }
    }, [id, drugForms]);

    // Update evidence type when form changes
    useEffect(() => {
        if (formData.formId && drugForms.length > 0) {
            const form = drugForms.find(f => f.id === parseInt(formData.formId));
            if (form) {
                setEvidenceType(form.form_name);
            }
        }
    }, [formData.formId, drugForms]);

    const handleGoBack = () => {
        navigate(-1);
    };

    // Handle new image upload
    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        const imageUrls = files.map(file => ({
            url: URL.createObjectURL(file),
            type: 'new',
            file: file
        }));
        
        setNewImages(prev => [...prev, ...imageUrls]);
        setActualImages(prev => [...prev, ...files]);
    };

    // Get all images (existing + new)
    const getAllImages = () => {
        return [...originalImages, ...newImages];
    };

    const [selectedThumb, setSelectedThumb] = useState(0);
    const sensors = useSensors(useSensor(PointerSensor));

    // Handle remove image
    const handleRemoveImage = (index) => {
        const allImages = getAllImages();
        const imageToRemove = allImages[index];
        
        if (imageToRemove.type === 'existing') {
            // Mark existing image for deletion
            setImagesToDelete(prev => [...prev, imageToRemove.id]);
            setOriginalImages(prev => prev.filter(img => img.id !== imageToRemove.id));
        } else {
            // Remove new image
            const newImageIndex = originalImages.length > 0 ? index - originalImages.length : index;
            setNewImages(prev => {
                const updated = [...prev];
                updated.splice(newImageIndex, 1);
                return updated;
            });
            setActualImages(prev => {
                const updated = [...prev];
                updated.splice(newImageIndex, 1);
                return updated;
            });
        }
        
        // Adjust selected thumbnail
        const remainingCount = getAllImages().length - 1;
        if (selectedThumb >= remainingCount) {
            setSelectedThumb(Math.max(0, remainingCount - 1));
        }
    };

    // Handle drag and drop
    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (active.id !== over.id) {
            const allImages = getAllImages();
            const oldIndex = allImages.findIndex(img => img.url === active.id);
            const newIndex = allImages.findIndex(img => img.url === over.id);
            
            // This is complex with mixed existing/new images, so we'll keep it simple
            // You might want to implement this based on your specific needs
            console.log('Drag and drop for mixed images needs custom implementation');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setIsSubmitting(true);
            
            // Update narcotic data
            const updateData = {
                form_id: parseInt(formData.formId) || null,
                characteristics: isPillForm(evidenceType) ? 
                    (pillData.characteristics || formData.characteristics || '') : 
                    (formData.characteristics || ''),
                drug_type: formData.drugType || '',
                drug_category: formData.drugCategory || '',
                consumption_method: formData.consumptionMethod || '',
                effect: formData.effect || '',
                weight_grams: parseFloat(formData.weightGrams) || null
            };

            const narcoticResponse = await api.put(`/api/narcotics/${id}`, updateData);
            
            if (!narcoticResponse.data) {
                throw new Error('ไม่สามารถอัพเดทข้อมูลยาเสพติดได้');
            }
            
            // Update pill data if it's a pill form
            if (isPillForm(evidenceType)) {
                try {
                    await api.put(`/api/narcotics/${id}/pill`, {
                        color: pillData.color || '',
                        diameter_mm: parseFloat(pillData.diameter_mm) || null,
                        thickness_mm: parseFloat(pillData.thickness_mm) || null,
                        edge_shape: pillData.edge_shape || '',
                        characteristics: pillData.characteristics || '',
                        edge_width_mm: parseFloat(pillData.edge_width_mm) || null,
                        weight_mg: parseFloat(pillData.weight_mg) || null
                    });
                } catch (pillError) {
                    console.error('Error updating pill data:', pillError);
                    // Continue even if pill update fails
                }
            }
            
            // Delete marked images
            for (const imageId of imagesToDelete) {
                try {
                    await api.delete(`/api/narcotics/images/${imageId}`);
                    console.log(`ลบรูปภาพ ID ${imageId} สำเร็จ`);
                } catch (deleteError) {
                    console.error(`เกิดข้อผิดพลาดในการลบรูปภาพ ID ${imageId}:`, deleteError);
                }
            }
            
            // Upload new images
            if (actualImages.length > 0) {
                for (let i = 0; i < actualImages.length; i++) {
                    try {
                        const imageFormData = new FormData();
                        imageFormData.append('file', actualImages[i]);
                        imageFormData.append('description', `รูปภาพ ${formData.drugType || 'ยาเสพติด'} #${originalImages.length + i + 1}`);
                        imageFormData.append('priority', String(originalImages.length + i));
                        imageFormData.append('image_type', 'example');
                        
                        const imageResponse = await api.post(
                            `/api/narcotics/${id}/images`,
                            imageFormData,
                            { headers: { 'Content-Type': 'multipart/form-data' } }
                        );
                        
                        console.log(`อัพโหลดรูปภาพใหม่ที่ ${i+1} สำเร็จ`);
                        
                        // Create vector for new image
                        if (imageResponse.data && imageResponse.data.id) {
                            const vectorFormData = new FormData();
                            vectorFormData.append('file', actualImages[i]);
                            vectorFormData.append('narcotic_id', id);
                            vectorFormData.append('image_id', imageResponse.data.id);
                            
                            await api.post(
                                `/api/narcotics/images/vector`,
                                vectorFormData,
                                { headers: { 'Content-Type': 'multipart/form-data' } }
                            );
                            
                            console.log(`สร้าง vector สำหรับรูปภาพใหม่ที่ ${i+1} สำเร็จ`);
                        }
                    } catch (imgError) {
                        console.error(`เกิดข้อผิดพลาดในการอัพโหลดรูปภาพใหม่ที่ ${i+1}:`, imgError);
                    }
                }
            }
            
            setSubmitSuccess(true);
            setTimeout(() => {
                navigate('/selectCatalogType/drugs-catalog');
            }, 1500);
            
        } catch (error) {
            console.error('Error updating narcotic:', error);
            if (error.response) {
                const status = error.response.status;
                if (status === 401) {
                    setSubmitError('กรุณาเข้าสู่ระบบใหม่');
                } else if (status === 404) {
                    setSubmitError('ไม่พบข้อมูลยาเสพติดที่ต้องการแก้ไข');
                } else if (status === 422) {
                    const errorMsg = error.response.data.errors 
                        ? Object.values(error.response.data.errors).join(', ') 
                        : 'ข้อมูลไม่ถูกต้อง';
                    setSubmitError(`ข้อมูลไม่ถูกต้อง: ${errorMsg}`);
                } else {
                    setSubmitError(`เกิดข้อผิดพลาด (${status}): ${error.response.data.message || 'โปรดลองอีกครั้ง'}`);
                }
            } else if (error.request) {
                setSubmitError('ไม่สามารถติดต่อเซิร์ฟเวอร์ได้ โปรดตรวจสอบการเชื่อมต่อของคุณ');
            } else {
                setSubmitError(`เกิดข้อผิดพลาด: ${error.message}`);
            }
        } finally {
            setIsSubmitting(false);
        }
    };
    
    // Loading state
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center w-full h-full bg-gray-100">
                <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#990000] mx-auto mb-4"></div>
                    <h2 className="text-xl font-bold text-gray-700 mb-2">กำลังโหลดข้อมูล</h2>
                    <p className="text-gray-600">โปรดรอสักครู่...</p>
                </div>
            </div>
        );
    }

    // Not found state
    if (notFound) {
        return (
            <div className="flex flex-col items-center justify-center w-full h-full bg-gray-100">
                <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
                    <div className="text-red-600 text-5xl mb-4">❌</div>
                    <h1 className="text-2xl font-bold text-red-600 mb-4">ไม่พบข้อมูล</h1>
                    <p className="text-gray-600 mb-6">
                        ไม่พบข้อมูลยาเสพติดที่ต้องการแก้ไข
                    </p>
                    <button 
                        onClick={handleGoBack}
                        className="bg-[#990000] text-white px-6 py-2 rounded-lg hover:bg-[#7a0000]"
                    >
                        ย้อนกลับ
                    </button>
                </div>
            </div>
        );
    }
    
    // Unauthorized access
    if (unauthorized) {
        return (
            <div className="flex flex-col items-center justify-center w-full h-full bg-gray-100">
                <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
                    <div className="text-red-600 text-5xl mb-4">⚠️</div>
                    <h1 className="text-2xl font-bold text-red-600 mb-4">ไม่มีสิทธิ์เข้าถึง</h1>
                    <p className="text-gray-600 mb-6">
                        คุณไม่มีสิทธิ์ในการเข้าถึงหน้านี้ หน้านี้สำหรับผู้ใช้ที่มีบทบาทเป็นแผนกยาเสพติดเท่านั้น
                    </p>
                    <p className="text-gray-500">กำลังนำคุณกลับไปยังหน้าหลัก...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col w-full h-full bg-gray-100 shadow-sm overflow-hidden">
            {/* Header with back button */}
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
            
            {/* Page Title */}
            <div className="flex items-center justify-between w-full px-6">
                <h1 className="text-xl font-bold mb-4">แก้ไขยาเสพติด</h1>
            </div>

            {/* Content area with scroll */}
            <div className="flex-1 overflow-auto">
                <div className="px-6 pb-6 grid grid-cols-1 md:grid-cols-12 gap-6">
                    {/* Left Column */}
                    <div className="md:col-span-7 lg:col-span-8 space-y-6">
                        {/* Drug Form Section */}
                        <DrugFormSection 
                            formData={formData}
                            setFormData={setFormData}
                            evidenceType={evidenceType}
                            setEvidenceType={setEvidenceType}
                            drugForms={drugForms}
                            isLoadingDrugForms={isLoadingDrugForms}
                        />

                        {/* Pill Characteristics Form */}
                        {isPillForm(evidenceType) && (
                            <PillCharacteristicsForm 
                                pillData={pillData} 
                                setPillData={setPillData} 
                            />
                        )}

                        {/* Package Characteristics Form */}
                        {isPackageForm(evidenceType) && (
                            <PackageCharacteristicsForm 
                                packageData={packageData} 
                                setPackageData={setPackageData} 
                            />
                        )}

                        {/* Additional Information Form */}
                        {evidenceType && (
                            <AdditionalInfoForm 
                                formData={formData} 
                                setFormData={setFormData} 
                            />
                        )}
                    </div>

                    {/* Right Column - Image Upload */}
                    <div className="md:col-span-5 lg:col-span-4">
                        <ImageUploadSection 
                            images={getAllImages().map(img => img.url)}
                            setImages={() => {}} // Handled by custom functions
                            selectedThumb={selectedThumb}
                            setSelectedThumb={setSelectedThumb}
                            handleImageUpload={handleImageUpload}
                            handleRemoveImage={handleRemoveImage}
                            handleDragEnd={handleDragEnd}
                            sensors={sensors}
                            isEditMode={true}
                        />
                        
                        {/* Show images to be deleted count */}
                        {imagesToDelete.length > 0 && (
                            <div className="mt-2 text-sm text-red-600">
                                จะลบรูปภาพ {imagesToDelete.length} รูป
                            </div>
                        )}
                        
                        {/* Show new images count */}
                        {newImages.length > 0 && (
                            <div className="mt-2 text-sm text-green-600">
                                รูปภาพใหม่ {newImages.length} รูป
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Success Message */}
            {submitSuccess && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl">
                        <div className="text-center">
                            <div className="text-green-500 text-5xl mb-4">✓</div>
                            <h2 className="text-xl font-bold mb-2">แก้ไขข้อมูลสำเร็จ</h2>
                            <p className="text-gray-600">กำลังนำคุณไปยังหน้าแสดงรายการยาเสพติด...</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Error Message */}
            {submitError && (
                <div className="fixed bottom-20 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <strong className="font-bold">เกิดข้อผิดพลาด!</strong>
                    <span className="block sm:inline"> {submitError}</span>
                    <button 
                        className="absolute top-0 bottom-0 right-0 px-4 py-3"
                        onClick={() => setSubmitError(null)}
                    >
                        <X size={16} />
                    </button>
                </div>
            )}

            {/* Fixed Bottom Bar */}
            <div className="w-full py-4 px-4 flex justify-end border-t space-x-4 bg-white">
                <button 
                    className="w-32 py-1.5 border border-t-2 border-r-2 border-l-2 border-b-4 border-[#6B0000] rounded-lg text-[#900B09]"
                    onClick={handleGoBack}
                    disabled={isSubmitting}
                >
                    ยกเลิก
                </button>
                <button 
                    className={`w-32 py-1.5 border-[#6B0000] border-b-4 bg-[#990000] rounded-lg text-white ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข'}
                </button>
            </div>
        </div>
    );
}

export default EditNarcoticCatalog;