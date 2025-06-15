import React, { useState, useEffect } from 'react';
import { ChevronLeft, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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

const CreateNarcoticCatalog = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [unauthorized, setUnauthorized] = useState(false);
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
    
    const [actualImages, setActualImages] = useState([]);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [submitError, setSubmitError] = useState(null);

    const [drugForms, setDrugForms] = useState([]);
    const [isLoadingDrugForms, setIsLoadingDrugForms] = useState(false);

    // Check if user has the correct role (2) and department ("กลุ่มงานยาเสพติด")
    useEffect(() => {
        if (!user) return;
        
        const isAuthorized = user.role?.id === 2 && user.department === "กลุ่มงานยาเสพติด";
        
        if (!isAuthorized) {
            setUnauthorized(true);
            // Redirect to home page after 3 seconds if unauthorized
            const timer = setTimeout(() => {
                navigate('/home');
            }, 3000);
            
            return () => clearTimeout(timer);
        }
    }, [user, navigate]);

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

    const handleGoBack = () => {
        navigate(-1);
    };

    const [images, setImages] = useState([]);
    const [selectedThumb, setSelectedThumb] = useState(0);
    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        const imageUrls = files.map(file => URL.createObjectURL(file));
        setImages(prev => [...prev, ...imageUrls]);
        setActualImages(prev => [...prev, ...files]);
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setIsSubmitting(true);
            
            const exhibitResponse = await api.post(`/api/exhibits`, {
                exhibit: {
                    category: 'ยาเสพติด',
                    subcategory: formData.drugType || ''
                }
            });
            
            if (!exhibitResponse.data || !exhibitResponse.data.id) {
                throw new Error('ไม่สามารถสร้างรายการยาเสพติดได้');
            }
            
            const exhibitId = exhibitResponse.data.id;
            
            const narcoticResponse = await api.post(`/api/narcotic`,
                {
                    exhibit_id: exhibitId,
                    form_id: parseInt(formData.formId) || '',
                    // ✅ ใช้ characteristics จาก pillData หากเป็น pill form
                    characteristics: isPillForm(evidenceType) ? 
                        (pillData.characteristics || formData.characteristics || '') : 
                        (formData.characteristics || ''),
                    drug_type: formData.drugType || '',
                    drug_category: formData.drugCategory || '',
                    consumption_method: formData.consumptionMethod || '',
                    effect: formData.effect || '',
                    weight_grams: parseFloat(formData.weightGrams) || null
                }
            );
            
            if (!narcoticResponse.data || !narcoticResponse.data.id) {
                throw new Error('ไม่สามารถบันทึกข้อมูลยาเสพติดได้');
            }
            
            const narcoticId = narcoticResponse.data.id;
            
            if (isPillForm(evidenceType)) {
                await api.post(
                    `/api/narcotics/pill`,
                    {
                        narcotic_id: narcoticId,
                        color: pillData.color || '',
                        diameter_mm: parseFloat(pillData.diameter_mm) || null,
                        thickness_mm: parseFloat(pillData.thickness_mm) || null,
                        edge_shape: pillData.edge_shape || '',
                        // ✅ เพิ่มการบันทึก characteristics จาก pillData
                        characteristics: pillData.characteristics || '',
                        edge_width_mm: parseFloat(pillData.edge_width_mm) || null,
                        weight_mg: parseFloat(pillData.weight_mg) || null
                    }
                );
            }
            
            // แก้ไขส่วนการอัพโหลดภาพ - แยกเป็น 2 ขั้นตอน
            if (actualImages.length > 0) {
                for (let i = 0; i < actualImages.length; i++) {
                    try {
                        // ขั้นตอนที่ 1: อัพโหลดรูปภาพก่อน
                        const imageFormData = new FormData();
                        imageFormData.append('file', actualImages[i]);
                        imageFormData.append('description', `รูปภาพ ${formData.drugType || 'ยาเสพติด'} #${i+1}`);
                        imageFormData.append('priority', String(i));
                        imageFormData.append('image_type', 'example');
                        
                        const imageResponse = await api.post(
                            `/api/exhibits/${exhibitId}/narcotic/${narcoticId}/images`, // ใช้ path parameters แทน
                            imageFormData,
                            { headers: { 'Content-Type': 'multipart/form-data' } }
                        );
                        
                        console.log(`อัพโหลดรูปภาพที่ ${i+1} สำเร็จ`);
                        
                        // ขั้นตอนที่ 2: สร้าง vector จากรูปภาพที่อัพโหลดแล้ว
                        if (imageResponse.data && imageResponse.data.id) {
                            const vectorFormData = new FormData();
                            vectorFormData.append('file', actualImages[i]);
                            vectorFormData.append('narcotic_id', narcoticId);
                            vectorFormData.append('image_id', imageResponse.data.id);
                            
                            await api.post(
                                `/api/narcotics/images/vector`,
                                vectorFormData,
                                { headers: { 'Content-Type': 'multipart/form-data' } }
                            );
                            
                            console.log(`สร้าง vector สำหรับรูปภาพที่ ${i+1} สำเร็จ`);
                        }
                    } catch (imgError) {
                        console.error(`เกิดข้อผิดพลาดในการอัพโหลดรูปภาพที่ ${i+1}:`, imgError);
                    }
                }
            }
            
            // แสดงข้อความสำเร็จและนำทางไปหน้าอื่น
            setSubmitSuccess(true);
            setTimeout(() => {
                navigate('/selectCatalogType/drugs-catalog');
            }, 1500);
            
        } catch (error) {
            console.error('Error creating narcotic:', error);
            if (error.response) {
                // มีการตอบกลับจากเซิร์ฟเวอร์แต่เป็นสถานะผิดพลาด
                const status = error.response.status;
                if (status === 401) {
                    setSubmitError('กรุณาเข้าสู่ระบบใหม่');
                } else if (status === 422) {
                    const errorMsg = error.response.data.errors 
                        ? Object.values(error.response.data.errors).join(', ') 
                        : 'ข้อมูลไม่ถูกต้อง';
                    setSubmitError(`ข้อมูลไม่ถูกต้อง: ${errorMsg}`);
                } else {
                    setSubmitError(`เกิดข้อผิดพลาด (${status}): ${error.response.data.message || 'โปรดลองอีกครั้ง'}`);
                }
            } else if (error.request) {
                // ส่งคำขอแล้วแต่ไม่ได้รับการตอบกลับ
                setSubmitError('ไม่สามารถติดต่อเซิร์ฟเวอร์ได้ โปรดตรวจสอบการเชื่อมต่อของคุณ');
            } else {
                // เกิดข้อผิดพลาดในการสร้างคำขอ
                setSubmitError(`เกิดข้อผิดพลาด: ${error.message}`);
            }
        } finally {
            setIsSubmitting(false);
        }
    };
    
    // If user is not authorized, show access denied message
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
                <h1 className="text-xl font-bold mb-4">เพิ่มยาเสพติด</h1>
            </div>

            {/* Content area with scroll */}
            <div className="flex-1 overflow-auto">
                <div className="px-6 pb-6 grid grid-cols-1 md:grid-cols-12 gap-6">
                    {/* Left Column - Adjusted to be more balanced */}
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

                    {/* Right Column */}
                    <div className="md:col-span-5 lg:col-span-4">
                        <ImageUploadSection 
                            images={images}
                            setImages={setImages}
                            selectedThumb={selectedThumb}
                            setSelectedThumb={setSelectedThumb}
                            handleImageUpload={handleImageUpload}
                            handleRemoveImage={handleRemoveImage}
                            handleDragEnd={handleDragEnd}
                            sensors={sensors}
                        />
                    </div>
                </div>
            </div>

            {/* Success Message */}
            {submitSuccess && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl">
                        <div className="text-center">
                            <div className="text-green-500 text-5xl mb-4">✓</div>
                            <h2 className="text-xl font-bold mb-2">บันทึกข้อมูลสำเร็จ</h2>
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
                    {isSubmitting ? 'กำลังบันทึก...' : 'บันทึก'}
                </button>
            </div>
        </div>
    );
}

export default CreateNarcoticCatalog;