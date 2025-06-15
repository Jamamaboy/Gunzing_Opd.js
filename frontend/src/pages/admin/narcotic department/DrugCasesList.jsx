import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiFilter } from 'react-icons/fi';
import { ChevronLeft, Plus } from 'lucide-react';
import DrugCaseFilterModal from '../../../components/Admin/Narcotics Department/DrugCases/DrugCaseFilterModal';
import DrugCaseFilterTags from '../../../components/Admin/Narcotics Department/DrugCases/DrugCaseFilterTags';
import DrugCaseSearchBar from '../../../components/Admin/Narcotics Department/DrugCases/DrugCaseSearchBar';
import DrugCaseTable from '../../../components/Admin/Narcotics Department/DrugCases/DrugCaseTable';
import Pagination from '../../../components/shared/Pagination';
import { fetchDrugCases } from '../../../services/drugCasesApi';
import { drugCaseData } from '../../../utils/drugCaseUtils';
import { filterDrugCases, sortDrugCases } from '../../../utils/filterUtils';

const DrugCasesList = () => {
    const navigate = useNavigate();
    
    const [filters, setFilters] = useState({
        caseType: '',
        status: '',
        startDate: '',
        endDate: '',
        search: '',
        province: '',
        district: '',
        subdistrict: '',
        drugType: ''
    });

    const [allCases, setAllCases] = useState([]);
    const [processedCases, setProcessedCases] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

    // ✅ Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // ✅ Process ข้อมูลเมื่อ allCases เปลี่ยน
    useEffect(() => {
        if (allCases.length > 0 || !loading) {
            console.log('🚀 Processing drug cases data...');
            const processedData = drugCaseData(allCases, loading, error);
            setProcessedCases(processedData);
            console.log('📦 Processed Data:', processedData);
        } else {
            setProcessedCases([]);
        }
    }, [allCases, loading, error]);

    // ✅ กรองข้อมูลแบบ Client-side ด้วย useMemo เพื่อ performance
    const filteredCases = useMemo(() => {
        console.log('🔍 Filtering cases with filters:', filters);
        console.log('📊 Total processed cases:', processedCases.length);
        
        if (processedCases.length === 0) {
            return [];
        }

        // ✅ กรองข้อมูล
        const filtered = filterDrugCases(processedCases, filters);
        
        // ✅ เรียงลำดับ (เรียงตามวันที่ล่าสุดก่อน)
        const sorted = sortDrugCases(filtered, 'occurrence_date', 'desc');
        
        console.log('✅ Filtered and sorted cases:', sorted.length);
        
        return sorted;
    }, [processedCases, filters]);

    // ✅ โหลดข้อมูลครั้งแรกเท่านั้น (ไม่ต้องโหลดใหม่เมื่อ filters เปลี่ยน)
    useEffect(() => {
        loadAllCases();
    }, []); // ✅ Empty dependency array

    const handleGoBack = () => {
        navigate(-1);
    };

    // ✅ แก้ไขฟังก์ชัน loadCases ให้ดึงข้อมูลทั้งหมด
    const loadAllCases = async () => {
        try {
            setLoading(true);
            setError(null);

            console.log('🔍 Loading all drug cases...');

            const result = await fetchDrugCases(); // ✅ ไม่ส่ง filters
            
            console.log('🔍 API Result:', result);
            
            if (result.success) {
                setAllCases(result.data || []);
                console.log('✅ All cases loaded:', result.data?.length || 0);
            } else {
                setError(result.error || 'Failed to load cases');
                setAllCases([]);
            }
        } catch (err) {
            setError('เกิดข้อผิดพลาดในการโหลดข้อมูล');
            setAllCases([]);
            console.error('Error loading cases:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleApplyFilters = (newFilters) => {
        console.log('🔧 Applying filters:', newFilters);
        setFilters(newFilters);
        setCurrentPage(1); // ✅ Reset ไปหน้าแรก
    };

    const handleClearFilters = () => {
        console.log('🧹 Clearing all filters');
        setFilters({
            caseType: '',
            status: '',
            startDate: '',
            endDate: '',
            search: '',
            province: '',
            district: '',
            subdistrict: '',
            drugType: ''
        });
        setCurrentPage(1);
    };

    const handleRemoveFilter = (filterType, filterValue) => {
        console.log('🗑️ Removing filter:', filterType);
        setFilters(prev => ({
            ...prev,
            [filterType]: ''
        }));
        setCurrentPage(1);
    };

    const handleSearchChange = (searchValue) => {
        console.log('🔍 Search changed:', searchValue);
        setFilters(prev => ({
            ...prev,
            search: searchValue
        }));
        setCurrentPage(1);
    };

    // ✅ Pagination calculations - ใช้ filteredCases
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentCases = filteredCases.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredCases.length / itemsPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        window.scrollTo(0, 0);
    };

    const handleItemsPerPageChange = (event) => {
        setItemsPerPage(Number(event.target.value));
        setCurrentPage(1);
    };

    // ✅ Case actions
    const handleViewCase = (caseId) => {
        navigate(`/admin/drug-cases/${caseId}`);
    };

    const handleEditCase = (caseId) => {
        navigate(`/admin/drug-cases/edit/${caseId}`);
    };

    const handleCreateNew = () => {
        navigate('/admin/narcotics/upload-narcotic-case');
    };

    const hasActiveFilters = Object.values(filters).some(value => value !== '');
    const hasNonSearchFilters = Object.entries(filters).some(([key, value]) => key !== 'search' && value !== '');

    // ✅ Loading state - ใช้ allCases.length
    if (loading && allCases.length === 0) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-t-2 border-[#b30000]"></div>
                <p className="ml-3 text-gray-600">กำลังโหลดข้อมูลคดียาเสพติด...</p>
            </div>
        );
    }

    // ✅ Error state
    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-4">
                <p className="text-red-600 text-xl mb-4">เกิดข้อผิดพลาดในการโหลดข้อมูล: {error}</p>
                <button
                    onClick={loadAllCases} // ✅ เปลี่ยนจาก window.location.reload()
                    className="px-4 py-2 bg-[#b30000] text-white rounded hover:bg-[#990000]"
                >
                    ลองใหม่
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col w-full h-full bg-gray-100 p-4 md:p-4">
            {/* ✅ Header */}
            <div className="flex items-center w-full">
                <button 
                    onClick={handleGoBack}
                    className="flex items-center text-[#990000] font-medium hover:text-[#7a0000]"
                >
                    <ChevronLeft className="h-5 w-5" />
                    ย้อนกลับ
                </button>
            </div>

            {/* ✅ Title and Actions */}
            <div className="flex items-center justify-between w-full py-3 mb-4 border-b border-gray-300 flex-shrink-0">
                <div>
                    <h2 className="text-xl font-semibold text-gray-800">รายการคดียาเสพติด</h2>
                    <p className="text-gray-600 text-sm">จัดการและค้นหาข้อมูลคดียาเสพติดในระบบ </p>
                </div>
                <div className="flex items-center gap-3">
                    {/* Search Bar */}
                    <DrugCaseSearchBar
                        searchValue={filters.search}
                        onSearchChange={handleSearchChange}
                        placeholder="ค้นหาเลขคดี, ชื่อผู้ต้องหา..."
                    />

                    {/* Filter Button */}
                    <button
                        onClick={() => setIsFilterModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-600 text-white hover:bg-gray-700 whitespace-nowrap"
                    >
                        <FiFilter size={18} />
                        ตัวกรอง
                        {hasNonSearchFilters && (
                            <span className="bg-gray-800 text-white rounded-full px-2 py-1 text-xs">
                                {Object.entries(filters).filter(([key, value]) => key !== 'search' && value !== '').length}
                            </span>
                        )}
                    </button>

                    {/* Create Button */}
                    <button
                        onClick={handleCreateNew}
                        className="flex items-center bg-[#990000] hover:bg-[#7a0000] text-white font-semibold py-2 px-4 rounded-lg shadow"
                    >
                        <Plus size={20} className="mr-2" />
                        เพิ่มคดีใหม่
                    </button>
                </div>
            </div>

            {/* ✅ Filter Tags */}
            <DrugCaseFilterTags 
                filters={filters}
                onRemove={handleRemoveFilter}
            />

            {/* ✅ Table Container */}
            <div className="flex flex-col flex-grow min-h-0">
                {filteredCases.length === 0 && !loading ? (
                    // ✅ Empty state
                    <DrugCaseTable
                        cases={[]}
                        loading={loading}
                        onViewCase={handleViewCase}
                        onEditCase={handleEditCase}
                        hasActiveFilters={hasActiveFilters}
                        onClearFilters={handleClearFilters}
                    />
                ) : !loading && !error && filteredCases.length > 0 ? (
                    // ✅ Container for table and pagination
                    <div className="flex flex-col flex-grow overflow-hidden">
                        {/* ✅ Table container */}
                        <DrugCaseTable
                            cases={currentCases}
                            loading={loading}
                            onViewCase={handleViewCase}
                            onEditCase={handleEditCase}
                            hasActiveFilters={hasActiveFilters}
                            onClearFilters={handleClearFilters}
                        />

                        {/* ✅ Pagination area */}
                        <div className="flex-shrink-0 bg-white shadow-md rounded-b-lg border-t border-gray-200">
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={handlePageChange}
                                rowsPerPage={itemsPerPage}
                                onRowsPerPageChange={handleItemsPerPageChange}
                                totalItems={filteredCases.length}
                                indexOfFirstItem={indexOfFirstItem}
                                indexOfLastItem={indexOfLastItem}
                            />
                        </div>
                    </div>
                ) : null}
            </div>

            {/* Filter Modal */}
            <DrugCaseFilterModal
                isOpen={isFilterModalOpen}
                onClose={() => setIsFilterModalOpen(false)}
                filters={filters}
                onFilterChange={setFilters}
                onApplyFilters={handleApplyFilters}
                onClearFilters={handleClearFilters}
            />
        </div>
    );
};

export default DrugCasesList;