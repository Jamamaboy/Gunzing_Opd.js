import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import apiConfig from '../../../../config/api';
import { Plus, Edit3, Trash2, ChevronLeft, X, AlertTriangle, CheckCircle, ArrowLeft, MoreVertical } from 'lucide-react';
import { PiImageBroken } from "react-icons/pi";
import Pagination from '../../../shared/Pagination';

const API_PATH = '/api';

// ✅ แก้ไข GunCard Component
const GunCard = ({ gun, onEdit, onDelete, showMenu, setShowMenu }) => {
    const menuRef = useRef(null);

    const NoImageComponent = ({ small = false }) => (
        <div className={`flex flex-col items-center justify-center bg-gray-50 rounded-lg border border-gray-200 ${small ? 'h-16 w-16' : 'h-24 w-24'}`}>
            <PiImageBroken className={`text-gray-400 ${small ? 'text-lg' : 'text-xl'}`} />
            <span className={`text-gray-400 ${small ? 'text-xs' : 'text-sm'} mt-1`}>No Image</span>
        </div>
    );

    const handleImageError = (e) => {
        e.target.style.display = 'none';
        const fallbackElement = e.target.nextElementSibling;
        if (fallbackElement) {
            fallbackElement.style.display = 'flex';
        }
    };

    // ✅ เพิ่ม useEffect สำหรับ click outside แต่ละ card
    useEffect(() => {
        function handleClickOutside(event) {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowMenu(false);
            }
        }
        
        if (showMenu) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showMenu, setShowMenu]);

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4">
                <div className="flex justify-between items-center mb-3">
                    <h3 className="text-md font-medium text-gray-900">{gun.brand}</h3>
                    <div className="relative" ref={menuRef}> {/* ✅ ใช้ menuRef ที่สร้างไว้ใน component */}
                        <button 
                            className="p-1 text-gray-500 hover:bg-gray-100 rounded-full" 
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowMenu(!showMenu);
                                console.log('Menu button clicked, showMenu:', !showMenu); // ✅ เพิ่ม debug
                            }}
                        >
                            <MoreVertical size={18} />
                        </button>
                        
                        {showMenu && (
                            <div className="absolute right-0 z-10 mt-1 bg-white rounded shadow-lg border w-36">
                                <button 
                                    className="w-full text-left px-3 py-2 hover:bg-gray-100 flex items-center gap-2"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        console.log('Edit clicked for gun:', gun.firearm_id || gun.id); // ✅ เพิ่ม debug
                                        onEdit(gun.firearm_id || gun.id);
                                        setShowMenu(false);
                                    }}
                                >
                                    <Edit3 size={16} className="text-amber-600" />
                                    <span>แก้ไข</span>
                                </button>
                                
                                <button 
                                    className="w-full text-left px-3 py-2 hover:bg-gray-100 flex items-center gap-2"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        console.log('Delete clicked for gun:', gun.id, gun.firearm_id); // ✅ เพิ่ม debug
                                        onDelete(gun.id, gun.firearm_id);
                                        setShowMenu(false);
                                    }}
                                >
                                    <Trash2 size={16} className="text-red-600" />
                                    <span>ลบ</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
                
                <div className="flex">
                    <div className="flex-shrink-0 w-24 h-24 mr-3 flex items-center justify-center">
                        {gun.imageUrl ? (
                            <div className="relative w-24 h-24">
                                <img 
                                    src={gun.imageUrl} 
                                    alt={`${gun.brand} ${gun.model}`} 
                                    className="w-24 h-24 object-contain rounded-md"
                                    onError={handleImageError}
                                />
                                <div className="hidden">
                                    <NoImageComponent />
                                </div>
                            </div>
                        ) : (
                            <NoImageComponent />
                        )}
                    </div>
                    
                    <div className="flex flex-col justify-between flex-1">
                        <div>
                            <h4 className="font-medium text-sm mb-1">{gun.model}</h4>
                            
                            <div className="space-y-1">
                                <div className="flex">
                                    <span className="text-gray-500 text-xs w-16">ซีรี่ส์:</span>
                                    <span className="text-gray-700 text-xs">{gun.series}</span>
                                </div>
                                <div className="flex">
                                    <span className="text-gray-500 text-xs w-16">ประเภท:</span>
                                    <span className="text-gray-700 text-xs">{gun.category}</span>
                                </div>
                                <div className="flex">
                                    <span className="text-gray-500 text-xs w-16">กลไก:</span>
                                    <span className="text-gray-700 text-xs">{gun.mechanism}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ✅ Modal Components (เหมือนเดิม)
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, type = 'warning', loading = false }) => {
    if (!isOpen) return null;

    const getIconAndColor = () => {
        switch (type) {
            case 'danger':
                return {
                    icon: <AlertTriangle className="h-6 w-6 text-red-600" />,
                    bgColor: 'bg-red-100',
                    buttonColor: 'bg-red-600 hover:bg-red-700'
                };
            case 'success':
                return {
                    icon: <CheckCircle className="h-6 w-6 text-green-600" />,
                    bgColor: 'bg-green-100',
                    buttonColor: 'bg-green-600 hover:bg-green-700'
                };
            default:
                return {
                    icon: <AlertTriangle className="h-6 w-6 text-yellow-600" />,
                    bgColor: 'bg-yellow-100',
                    buttonColor: 'bg-red-600 hover:bg-red-700'
                };
        }
    };

    const { icon, bgColor, buttonColor } = getIconAndColor();

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center">
                        <div className={`flex-shrink-0 ${bgColor} rounded-full p-2 mr-3`}>
                            {icon}
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">
                            {title}
                        </h3>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <div className="p-6">
                    <p className="text-sm text-gray-500">
                        {message}
                    </p>
                </div>

                <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-lg">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#990000] disabled:opacity-50"
                    >
                        ยกเลิก
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 ${buttonColor} inline-flex items-center`}
                    >
                        {loading && (
                            <div className="animate-spin -ml-1 mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                        )}
                        {loading ? 'กำลังลบ...' : 'ลบ'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const NotificationModal = ({ isOpen, onClose, title, message, type = 'success' }) => {
    if (!isOpen) return null;

    const getIconAndColor = () => {
        switch (type) {
            case 'error':
                return {
                    icon: <AlertTriangle className="h-8 w-8 text-red-600" />,
                    bgColor: 'bg-red-100',
                    titleColor: 'text-red-900',
                    buttonColor: 'bg-red-600 hover:bg-red-700'
                };
            default:
                return {
                    icon: <CheckCircle className="h-8 w-8 text-green-600" />,
                    bgColor: 'bg-green-100',
                    titleColor: 'text-green-900',
                    buttonColor: 'bg-green-600 hover:bg-green-700'
                };
        }
    };

    const { icon, bgColor, titleColor, buttonColor } = getIconAndColor();

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full animate-in fade-in zoom-in duration-200">
                <div className="p-6 text-center">
                    <div className={`mx-auto flex items-center justify-center h-16 w-16 rounded-full ${bgColor} mb-4`}>
                        {icon}
                    </div>
                    <h3 className={`text-lg font-medium ${titleColor} mb-2`}>
                        {title}
                    </h3>
                    <p className="text-sm text-gray-500 mb-6">
                        {message}
                    </p>
                    <button
                        onClick={onClose}
                        className={`w-full px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${buttonColor}`}
                    >
                        ตกลง
                    </button>
                </div>
            </div>
        </div>
    );
};

const AdminGunCatalog = () => {
    const navigate = useNavigate();
    const [guns, setGuns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // ✅ แก้ไข state management สำหรับ menu
    const [showMenu, setShowMenu] = useState({}); // ✅ เปลี่ยนเป็น object เพื่อจัดการหลาย card

    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        gunId: null,
        firearmId: null,
        loading: false
    });

    const [notificationModal, setNotificationModal] = useState({
        isOpen: false,
        type: 'success',
        title: '',
        message: ''
    });

    // ✅ ลบ useEffect ที่ใช้ menuRef เดิม (ย้ายไปใน GunCard แล้ว)

    const NoImageComponent = ({ small = false }) => (
        <div className={`flex flex-col items-center justify-center bg-gray-50 rounded-lg border border-gray-200 ${small ? 'h-10 w-16' : 'h-12 w-20'}`}>
            <PiImageBroken className={`text-gray-400 ${small ? 'text-lg' : 'text-xl'}`} />
            <span className={`text-gray-400 ${small ? 'text-xs' : 'text-sm'} mt-1`}>No Image</span>
        </div>
    );

    const handleImageError = (e) => {
        e.target.style.display = 'none';
        const fallbackElement = e.target.nextElementSibling;
        if (fallbackElement) {
            fallbackElement.style.display = 'flex';
        }
    };

    useEffect(() => {
        const fetchGuns = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(`${apiConfig.baseUrl}${API_PATH}/exhibits`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                const mappedGuns = (Array.isArray(data) ? data : [])
                    .filter(item => item.firearm)
                    .map(item => {
                        let imageUrl = '';
                        if (item.firearm && Array.isArray(item.firearm.example_images) && item.firearm.example_images.length > 0) {
                            imageUrl = item.firearm.example_images[0].image_url;
                        }

                        return {
                            id: item.id,
                            firearm_id: item.firearm.id,
                            brand: item.firearm.brand || '-',
                            model: item.firearm.model || '-',
                            series: item.firearm.series || '-',
                            imageUrl: imageUrl,
                            category: item.subcategory || '-',
                            mechanism: item.firearm.mechanism || '-',
                        };
                    });
                setGuns(mappedGuns);
            } catch (err) {
                setError(err.message);
                console.error('Error fetching guns:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchGuns();
    }, []);

    const handleCreateNew = () => {
        navigate('/admin/guns/create-gun');
    };

    const handleEdit = (gunId) => {
        console.log("handleEdit called with gunId:", gunId); // ✅ เพิ่ม debug
        navigate(`/admin/guns/edit-gun-proile/${gunId}`);
    };

    const handleDelete = (gunId, firearmId) => {
        console.log("handleDelete called with:", gunId, firearmId); // ✅ เพิ่ม debug
        setConfirmModal({
            isOpen: true,
            gunId: gunId,
            firearmId: firearmId,
            loading: false
        });
        setShowMenu({}); // ✅ ปิด menu ทั้งหมด
    };

    const handleCloseConfirmModal = () => {
        console.log("handleCloseConfirmModal called, loading:", confirmModal.loading); // ✅ เพิ่ม debug
        if (!confirmModal.loading) {
            setConfirmModal({
                isOpen: false,
                gunId: null,
                firearmId: null,
                loading: false
            });
        }
    };

    const handleConfirmDelete = async () => {
        const { gunId, firearmId } = confirmModal;
        console.log("handleConfirmDelete called with:", gunId, firearmId); // ✅ เพิ่ม debug
        
        setConfirmModal(prev => ({ ...prev, loading: true }));
        
        try {
            const idToDelete = firearmId || gunId;
            
            let endpoint;
            if (firearmId) {
                endpoint = `${apiConfig.baseUrl}${API_PATH}/firearms/${firearmId}/complete`;
            } else {
                endpoint = `${apiConfig.baseUrl}${API_PATH}/exhibits/${gunId}`;
            }

            console.log("Deleting gun via API:", endpoint);
            
            const response = await fetch(endpoint, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(`Failed to delete gun: ${response.status} - ${errorData}`);
            }

            // ลบ gun ออกจาก state หลังจากลบสำเร็จ
            setGuns(prevGuns => prevGuns.filter(gun => (gun.firearm_id || gun.id) !== idToDelete));
            
            // จัดการ pagination หลังจากลบ
            const newTotalItems = guns.length - 1;
            const newTotalPages = Math.ceil(newTotalItems / itemsPerPage);
            if (currentPage > newTotalPages && newTotalPages > 0) {
                setCurrentPage(newTotalPages);
            } else if (newTotalPages === 0 && newTotalItems === 0) {
                setCurrentPage(1);
            } else if (currentGuns.length === 1 && currentPage > 1 && newTotalItems > 0) {
                setCurrentPage(currentPage - 1);
            }

            // ปิด Confirmation Modal
            setConfirmModal({
                isOpen: false,
                gunId: null,
                firearmId: null,
                loading: false
            });

            // แสดง Success Modal
            setNotificationModal({
                isOpen: true,
                type: 'success',
                title: 'ลบสำเร็จ!',
                message: 'ปืนถูกลบออกจากระบบเรียบร้อยแล้ว'
            });

        } catch (delError) {
            console.error('Error deleting gun:', delError);
            
            // ปิด Confirmation Modal
            setConfirmModal({
                isOpen: false,
                gunId: null,
                firearmId: null,
                loading: false
            });

            // แสดง Error Modal
            setNotificationModal({
                isOpen: true,
                type: 'error',
                title: 'เกิดข้อผิดพลาด!',
                message: `ไม่สามารถลบปืนได้: ${delError.message}`
            });
        }
    };

    const handleCloseNotificationModal = () => {
        setNotificationModal({
            isOpen: false,
            type: 'success',
            title: '',
            message: ''
        });
    };

    const handleGoBack = () => {
        navigate(-1);
    };

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentGuns = guns.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(guns.length / itemsPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        window.scrollTo(0, 0);
    };

    const handleItemsPerPageChange = (event) => {
        setItemsPerPage(Number(event.target.value));
        setCurrentPage(1);
    };

    if (loading && guns.length === 0) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-t-2 border-[#990000]"></div>
                <p className="ml-3 text-gray-600">Loading gun catalog...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-4">
                <p className="text-red-600 text-xl mb-4">Error loading gun catalog: {error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-[#990000] text-white rounded hover:bg-[#7a0000]"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col w-full h-full bg-gray-100">
            {/* ✅ Mobile View */}
            <div className="md:hidden">
                {/* Mobile Header */}
                <div className="px-4 py-3 flex items-center justify-center relative shadow-[0_1.5px_4px_rgba(0,0,0,0.2)] bg-white">
                    <button 
                        className="absolute left-4" 
                        onClick={handleGoBack}
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <h1 className="text-lg font-bold text-center flex-1">จัดการบัญชีอาวุธปืน</h1>
                </div>
                
                {/* Mobile Add Button */}
                <div className="px-4 pt-4 flex justify-end mb-4">
                    <button 
                        className="flex items-center gap-1 px-2 py-2 rounded bg-[#990000] text-white hover:bg-[#7a0000]"
                        onClick={handleCreateNew}
                    >
                        <Plus size={16} />
                    </button>
                </div>

                {/* Mobile Cards */}
                {loading && guns.length > 0 && (
                    <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-20 flex justify-center items-center z-50">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-t-2 border-white"></div>
                    </div>
                )}

                <div className="pr-4 pb-32 pl-4 grid grid-cols-1 gap-4">
                    {currentGuns.length > 0 ? (
                        currentGuns.map((gun) => {
                            const gunKey = gun.firearm_id || gun.id;
                            return (
                                <GunCard
                                    key={gunKey}
                                    gun={gun}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                    showMenu={showMenu[gunKey] || false} // ✅ ใช้ object เพื่อจัดการแต่ละ card
                                    setShowMenu={(show) => setShowMenu(prev => ({ 
                                        ...prev, 
                                        [gunKey]: show 
                                    }))} // ✅ อัปเดต state สำหรับ card นี้เท่านั้น
                                />
                            );
                        })
                    ) : (
                        <div className="text-center text-gray-500 py-10 col-span-1">ไม่พบข้อมูลปืน</div>
                    )}
                </div>

                {/* Mobile Pagination - Fixed Bottom */}
                {!loading && !error && guns.length > 0 && (
                    <div className="fixed bottom-16 left-0 right-0 bg-white shadow-md p-2 flex flex-col border-t">
                        <div className="flex justify-between items-center pt-1">
                            <div className="text-gray-600 text-xs sm:text-sm pl-2">
                                {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, guns.length)} จาก {guns.length}
                            </div>
                            <div className="flex items-center text-gray-600 text-xs sm:text-sm">
                                <span className="mr-1 sm:mr-2">แถว:</span>
                                <select 
                                    className="bg-transparent border rounded px-1 sm:px-2 py-1 text-gray-600 text-xs sm:text-sm focus:outline-none cursor-pointer" 
                                    value={itemsPerPage} 
                                    onChange={handleItemsPerPageChange}
                                >
                                    <option value="5">5</option>
                                    <option value="10">10</option>
                                    <option value="20">20</option>
                                </select>
                            </div>
                            <div className="flex items-center gap-1 sm:gap-2 pr-2">
                                <button 
                                    onClick={() => handlePageChange(currentPage - 1)} 
                                    disabled={currentPage === 1} 
                                    className={`p-1 rounded ${currentPage === 1 ? "text-gray-400 cursor-not-allowed" : "text-gray-600 hover:bg-gray-100"}`}
                                >
                                    <ChevronLeft size={18} />
                                </button>
                                <span className="font-medium text-xs sm:text-sm">{currentPage}/{totalPages}</span>
                                <button 
                                    onClick={() => handlePageChange(currentPage + 1)} 
                                    disabled={currentPage === totalPages} 
                                    className={`p-1 rounded ${currentPage === totalPages ? "text-gray-400 cursor-not-allowed" : "text-gray-600 hover:bg-gray-100"}`}
                                >
                                    <ChevronLeft size={18} className="rotate-180" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* ✅ Desktop View - ปรับความสูงให้พอดี */}
            <div className="hidden md:block p-4 md:p-4">
                {/* Desktop Header */}
                <div className="flex items-center w-full">
                    <button 
                        onClick={handleGoBack}
                        className="flex items-center text-[#990000] font-medium hover:text-[#7a0000]"
                    >
                        <ChevronLeft className="h-5 w-5" />
                        ย้อนกลับ
                    </button>
                </div>

                <div className="flex items-center justify-between w-full py-3 mb-4 border-b border-gray-300">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800">จัดการบัญชีอาวุธปืน</h2>
                    </div>
                    <button
                        onClick={handleCreateNew}
                        className="flex items-center bg-[#990000] hover:bg-[#7a0000] text-white font-semibold py-2 px-4 rounded-lg shadow"
                    >
                        <Plus size={20} className="mr-2" />
                        เพิ่มข้อมูลปืน
                    </button>
                </div>  

                {loading && guns.length > 0 && (
                    <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-20 flex justify-center items-center z-50">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-t-2 border-white"></div>
                    </div>
                )}
                
                {guns.length === 0 && !loading ? (
                    <div className="text-center py-10">
                         <div>
                            <p className="text-gray-500 text-lg">No guns found in the catalog.</p>
                            <p className="text-gray-400 text-sm mt-1">You can add a new gun using the button above.</p>
                        </div>
                    </div>
                ) : !loading && !error && guns.length > 0 ? (
                    /* ✅ ลดความสูงจาก calc(100vh-200px) เป็น calc(100vh-250px) */
                    <div className="flex flex-col h-[calc(100vh-225px)]">
                        {/* ✅ Table Container */}
                        <div className="bg-white shadow-md rounded-t-lg overflow-hidden flex-grow flex flex-col">
                            <div className="flex-grow overflow-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-200 sticky top-0 z-10">
                                        <tr>
                                            <th scope="col" className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                                                ยี่ห้อ
                                            </th>
                                            <th scope="col" className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                                                รุ่น
                                            </th>
                                            <th scope="col" className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                                                ซีรี่ส์
                                            </th>
                                            <th scope="col" className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wider">
                                                รูปภาพ
                                            </th>
                                            <th scope="col" className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                                                ประเภท
                                            </th>
                                            <th scope="col" className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                                                กลไก
                                            </th>
                                            <th scope="col" className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wider">
                                                จัดการ
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {currentGuns.map((gun, index) => (
                                            <tr key={gun.firearm_id || gun.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100 transition-colors`}>
                                                <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{gun.brand}</td>
                                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700">{gun.model}</td>
                                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700">{gun.series}</td>
                                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700 text-center">
                                                    {gun.imageUrl ? (
                                                        <div className="relative h-10 w-20 mx-auto flex items-center justify-center">
                                                            <img 
                                                                src={gun.imageUrl} 
                                                                alt={`${gun.brand} ${gun.model}`} 
                                                                className="h-10 w-auto object-contain"
                                                                onError={handleImageError}
                                                            />
                                                            <div className="hidden absolute inset-0 flex items-center justify-center">
                                                                <NoImageComponent small={true} />
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="h-10 w-20 mx-auto flex items-center justify-center">
                                                            <NoImageComponent small={true} />
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700">{gun.category}</td>
                                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700">{gun.mechanism}</td>
                                                <td className="px-3 py-2 whitespace-nowrap text-center text-sm font-medium">
                                                    <button
                                                        onClick={() => handleEdit(gun.firearm_id || gun.id)}
                                                        className="text-indigo-600 hover:text-indigo-900 transition-colors mr-3 p-1 rounded hover:bg-indigo-100"
                                                        title="Edit Gun"
                                                    >
                                                        <Edit3 size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(gun.id, gun.firearm_id)}
                                                        className="text-red-600 hover:text-red-900 transition-colors p-1 rounded hover:bg-red-100"
                                                        title="Delete Gun"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        
                        {/* ✅ Pagination - ติดกับท้ายตารางเลย */}
                        <div className="flex-shrink-0 bg-white shadow-md rounded-b-lg border-t border-gray-200">
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={handlePageChange}
                                rowsPerPage={itemsPerPage}
                                onRowsPerPageChange={handleItemsPerPageChange}
                                totalItems={guns.length}
                                indexOfFirstItem={indexOfFirstItem}
                                indexOfLastItem={indexOfLastItem}
                            />
                        </div>
                    </div>
                ) : null}
            </div>

            {/* ✅ Modals - เพิ่ม debug logging */}
            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                onClose={handleCloseConfirmModal}
                onConfirm={handleConfirmDelete}
                title="ยืนยันการลบ"
                message="คุณแน่ใจหรือไม่ว่าต้องการลบปืนนี้? การกระทำนี้ไม่สามารถยกเลิกได้"
                type="danger"
                loading={confirmModal.loading}
            />

            <NotificationModal
                isOpen={notificationModal.isOpen}
                onClose={handleCloseNotificationModal}
                title={notificationModal.title}
                message={notificationModal.message}
                type={notificationModal.type}
            />
        </div>
    );
};

export default AdminGunCatalog;
