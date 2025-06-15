import { api } from '../config/api';

// ✅ แก้ไข fetchDrugCases ให้ดึงข้อมูลทั้งหมดแล้วกรองที่ Frontend
export const fetchDrugCases = async (filters = {}) => {
    try {
        console.log('🔍 Fetching all drug cases (filtering will be done client-side)');
        
        // ✅ ดึงข้อมูลทั้งหมดโดยไม่ส่ง filters ไป API
        const response = await api.get('/api/cases/with-relationships');
        
        console.log('✅ All drug cases fetched successfully:', response.data);
        
        // ✅ Return ข้อมูลทั้งหมด ให้ Frontend กรองเอง
        return {
            success: true,
            data: response.data || [],
            total: response.data?.length || 0
        };
        
    } catch (error) {
        console.error('❌ Error fetching drug cases:', error);
        
        // ✅ Handle different error types
        if (error.response) {
            console.error('❌ Response error:', error.response.data);
            return {
                success: false,
                error: error.response.data?.detail || 'Server error occurred',
                data: []
            };
        } else if (error.request) {
            return {
                success: false,
                error: 'Network error - unable to reach server',
                data: []
            };
        } else {
            return {
                success: false,
                error: 'Request configuration error',
                data: []
            };
        }
    }
};

// ✅ ฟังก์ชันสำหรับดึงข้อมูลคดีเดี่ยว
export const fetchDrugCaseById = async (caseId) => {
    try {
        console.log('🔍 Fetching drug case by ID:', caseId);
        
        const response = await api.get('/api/cases/by-case-id', {
            params: { case_id: caseId }
        });
        
        console.log('✅ Drug case fetched successfully:', response.data);
        return response.data;
        
    } catch (error) {
        console.error('❌ Error fetching drug case by ID:', error);
        
        if (error.response) {
            return {
                success: false,
                error: error.response.data?.detail || 'Case not found',
                data: null
            };
        } else {
            return {
                success: false,
                error: 'Network error occurred',
                data: null
            };
        }
    }
};

// ✅ ฟังก์ชันสำหรับค้นหา defendants
export const searchDefendants = async (searchTerm) => {
    try {
        console.log('🔍 Searching defendants:', searchTerm);
        
        const response = await api.get('/api/defendants/search', {
            params: { name: searchTerm }
        });
        
        console.log('✅ Defendants search completed:', response.data);
        return response.data;
        
    } catch (error) {
        console.error('❌ Error searching defendants:', error);
        
        return {
            success: false,
            error: error.response?.data?.detail || 'Search failed',
            data: []
        };
    }
};

// ✅ ฟังก์ชันสำหรับดึงข้อมูลสถิติ
export const fetchDrugCaseStatistics = async () => {
    try {
        const response = await api.get('/api/cases/statistics/overview');
        return response.data;
    } catch (error) {
        console.error('❌ Error fetching statistics:', error);
        return {
            success: false,
            error: 'Failed to fetch statistics',
            data: {}
        };
    }
};

// ✅ ฟังก์ชันสำหรับสร้างคดีใหม่
export const createDrugCase = async (caseData) => {
    try {
        console.log('📝 Creating new drug case:', caseData);
        
        const response = await api.post('/api/cases', caseData);
        
        console.log('✅ Drug case created successfully:', response.data);
        return response.data;
        
    } catch (error) {
        console.error('❌ Error creating drug case:', error);
        
        return {
            success: false,
            error: error.response?.data?.detail || 'Failed to create case',
            data: null
        };
    }
};

// ✅ ฟังก์ชันสำหรับอัปเดตคดี
export const updateDrugCase = async (caseId, caseData) => {
    try {
        console.log('📝 Updating drug case:', caseId, caseData);
        
        const response = await api.put(`/api/cases/${caseId}`, caseData);
        
        console.log('✅ Drug case updated successfully:', response.data);
        return response.data;
        
    } catch (error) {
        console.error('❌ Error updating drug case:', error);
        
        return {
            success: false,
            error: error.response?.data?.detail || 'Failed to update case',
            data: null
        };
    }
};

// ✅ ฟังก์ชันสำหรับลบคดี
export const deleteDrugCase = async (caseId) => {
    try {
        console.log('🗑️ Deleting drug case:', caseId);
        
        const response = await api.delete(`/api/cases/${caseId}`);
        
        console.log('✅ Drug case deleted successfully:', response.data);
        return response.data;
        
    } catch (error) {
        console.error('❌ Error deleting drug case:', error);
        
        return {
            success: false,
            error: error.response?.data?.detail || 'Failed to delete case',
            data: null
        };
    }
};