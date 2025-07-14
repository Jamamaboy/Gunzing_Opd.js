import { v4 as uuidv4 } from 'uuid';

const CYCLE_PAGES = [
  '/imagePreview',
  '/candidateShow',
  '/evidenceProfile',
  '/evidenceProfile/gallery',
  '/evidenceProfile/history',
  '/evidenceProfile/map',
  '/evidenceProfile/save-to-record'
];

/**
 * สร้าง sessionId ใหม่สำหรับ cycle
 * @returns {string} sessionId ที่สร้างใหม่
 */
export const createSession = () => {
  const sessionId = uuidv4();
  sessionStorage.setItem('sessionId', sessionId);
  return sessionId;
};

/**
 * ตรวจสอบว่ามี sessionId ที่ถูกต้องหรือไม่
 * @returns {boolean} true ถ้ามี sessionId ที่ถูกต้อง, false ถ้าไม่มี
 */
export const hasValidSession = () => {
  const sessionId = sessionStorage.getItem('sessionId');
  const hasStoredEvidence = localStorage.getItem('analysisResult') || 
                           localStorage.getItem('currentEvidenceData');
  
  // ถ้ามี sessionId หรือมีข้อมูล evidence ใน localStorage ให้ถือว่า valid
  return sessionId !== null || hasStoredEvidence !== null;
};

/**
 * ดึง sessionId ปัจจุบัน
 * @returns {string|null} sessionId หรือ null ถ้าไม่มี
 */
export const getSessionId = () => {
  return sessionStorage.getItem('sessionId');
};

/**
 * ลบ sessionId และข้อมูลเซสชันทั้งหมด
 */
export const clearSession = () => {
  sessionStorage.removeItem('sessionId');
  sessionStorage.removeItem('currentCycleData');
};

/**
 * ตรวจสอบว่าพาธปัจจุบันอยู่ใน cycle หรือไม่
 * @param {string} path - พาธปัจจุบัน
 * @returns {boolean} true ถ้าอยู่ใน cycle, false ถ้าไม่อยู่
 */
export const isInCycle = (path) => {
  return CYCLE_PAGES.some(cyclePath => {
    if (cyclePath === '/evidenceProfile') {
      return path === cyclePath || 
             (path.startsWith('/evidenceProfile/') && 
             (path === '/evidenceProfile/save-to-record' || 
              path === '/evidenceProfile/gallery' ||
              path === '/evidenceProfile/history' ||
              path === '/evidenceProfile/map'));
    }
    return path === cyclePath;
  });
};

/**
 * บันทึกข้อมูลระหว่าง cycle
 * @param {Object} data - ข้อมูลที่ต้องการบันทึก
 */
export const saveCycleData = (data) => {
  const currentData = getCycleData() || {};
  sessionStorage.setItem('currentCycleData', JSON.stringify({
    ...currentData,
    ...data
  }));
};

/**
 * ดึงข้อมูลที่บันทึกระหว่าง cycle
 * @returns {Object|null} ข้อมูลที่บันทึกไว้หรือ null ถ้าไม่มี
 */
export const getCycleData = () => {
  const data = sessionStorage.getItem('currentCycleData');
  return data ? JSON.parse(data) : null;
};

/**
 * รับพาธเริ่มต้นของ cycle เมื่อจำเป็นต้อง redirect
 * @returns {string} พาธเริ่มต้นของ cycle
 */
export const getInitialCyclePath = () => {
  return '/imagePreview';
};

/**
 * ตรวจสอบว่าเป็นหน้าแรกของ cycle หรือไม่
 * @param {string} path - พาธที่ต้องการตรวจสอบ
 * @returns {boolean} true ถ้าเป็นหน้าแรกของ cycle
 */
export const isInitialCyclePage = (path) => {
  return path === '/imagePreview';
};

/**
 * เพิ่มเหตุการณ์ให้กับหน้าต่าง (window) เพื่อตรวจสอบเมื่อผู้ใช้ใช้ปุ่ม Back/Forward ของเบราว์เซอร์
 * @param {Function} callback - ฟังก์ชันที่จะทำงานเมื่อมีการนำทางด้วย Back/Forward
 */
export const setupNavigationListeners = (callback) => {
  window.addEventListener('popstate', callback);
  
  return () => {
    window.removeEventListener('popstate', callback);
  };
};