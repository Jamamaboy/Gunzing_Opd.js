/**
 * Utilities สำหรับจัดการและประมวลผลข้อมูลสถิติ
 */

/**
 * จัดรูปแบบตัวเลขให้มี comma separator
 */
export const formatNumber = (number) => {
  if (typeof number !== 'number') return '0';
  return number.toLocaleString();
};

/**
 * คำนวณเปอร์เซ็นต์
 */
export const calculatePercentage = (value, total, decimals = 1) => {
  if (total === 0) return '0%';
  const percentage = (value / total) * 100;
  return `${percentage.toFixed(decimals)}%`;
};

/**
 * จัดรูปแบบอัตราการระบุประเภท
 */
export const formatIdentificationRate = (identified, total) => {
  return calculatePercentage(identified, total);
};

/**
 * สร้างข้อมูลสำหรับ Chart จากสถิติรายเดือน
 */
export const prepareMonthlyChartData = (monthlyStats) => {
  if (!Array.isArray(monthlyStats)) return { labels: [], data: [] };
  
  return {
    labels: monthlyStats.map(item => item.month_name),
    data: monthlyStats.map(item => item.count)
  };
};

/**
 * สร้างข้อมูลสำหรับ Pie Chart จากสถิติตามประเภท
 */
export const prepareCategoryChartData = (categories) => {
  if (!categories || typeof categories !== 'object') return { labels: [], data: [] };
  
  const entries = Object.entries(categories)
    .sort(([,a], [,b]) => b - a) // เรียงตามจำนวนจากมากไปน้อย
    .slice(0, 10); // เอาแค่ 10 อันดับแรก
  
  return {
    labels: entries.map(([label]) => label),
    data: entries.map(([, value]) => value)
  };
};

/**
 * คำนวณการเปลี่ยนแปลงเปอร์เซ็นต์
 */
export const calculateChangePercentage = (current, previous) => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
};

/**
 * จัดรูปแบบการเปลี่ยนแปลงเปอร์เซ็นต์
 */
export const formatChangePercentage = (current, previous, showSign = true) => {
  const change = calculateChangePercentage(current, previous);
  const sign = showSign ? (change >= 0 ? '+' : '') : '';
  return `${sign}${change.toFixed(1)}%`;
};

/**
 * สร้างสีสำหรับ Chart แบบไล่เฉดสี
 */
export const generateChartColors = (count, baseColor = '#990000') => {
  const colors = [];
  const opacity = 1;
  
  for (let i = 0; i < count; i++) {
    const alpha = Math.max(0.3, opacity - (i * 0.1));
    colors.push(`${baseColor}${Math.round(alpha * 255).toString(16).padStart(2, '0')}`);
  }
  
  return colors;
};

/**
 * วิเคราะห์แนวโน้มจากข้อมูลอนุกรมเวลา
 */
export const analyzeTrend = (data) => {
  if (!Array.isArray(data) || data.length < 2) {
    return { trend: 'stable', change: 0 };
  }
  
  const firstValue = data[0];
  const lastValue = data[data.length - 1];
  const change = calculateChangePercentage(lastValue, firstValue);
  
  let trend = 'stable';
  if (Math.abs(change) > 5) {
    trend = change > 0 ? 'increasing' : 'decreasing';
  }
  
  return { trend, change };
};

/**
 * หาค่าสูงสุดและต่ำสุดในข้อมูล
 */
export const findMinMax = (data) => {
  if (!Array.isArray(data) || data.length === 0) {
    return { min: 0, max: 0 };
  }
  
  return {
    min: Math.min(...data),
    max: Math.max(...data)
  };
};

/**
 * คำนวณค่าเฉลี่ย
 */
export const calculateAverage = (data) => {
  if (!Array.isArray(data) || data.length === 0) return 0;
  const sum = data.reduce((acc, val) => acc + val, 0);
  return sum / data.length;
};

/**
 * จัดรูปแบบวันที่สำหรับแสดงผล
 */
export const formatDate = (date, options = {}) => {
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options
  };
  
  return new Date(date).toLocaleDateString('th-TH', defaultOptions);
};

/**
 * คำนวณเวลาที่ผ่านมา
 */
export const timeAgo = (date) => {
  const now = new Date();
  const targetDate = new Date(date);
  const diffInSeconds = Math.floor((now - targetDate) / 1000);
  
  if (diffInSeconds < 60) return 'เมื่อสักครู่';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} นาทีที่แล้ว`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} ชั่วโมงที่แล้ว`;
  return `${Math.floor(diffInSeconds / 86400)} วันที่แล้ว`;
};

/**
 * ตรวจสอบความถูกต้องของข้อมูลสถิติ
 */
export const validateStatisticsData = (data) => {
  if (!data || typeof data !== 'object') return false;
  
  // ตรวจสอบค่าที่จำเป็น
  const requiredFields = ['total_firearms', 'unknown_firearms', 'new_firearms_this_month'];
  return requiredFields.every(field => 
    data.hasOwnProperty(field) && typeof data[field] === 'number' && data[field] >= 0
  );
};

/**
 * สร้างข้อมูล summary สำหรับแสดงผล
 */
export const createStatisticsSummary = (stats) => {
  if (!validateStatisticsData(stats)) {
    return {
      isValid: false,
      summary: 'ข้อมูลสถิติไม่ถูกต้อง'
    };
  }
  
  const { total_firearms, unknown_firearms, new_firearms_this_month } = stats;
  const identified_firearms = total_firearms - unknown_firearms;
  
  return {
    isValid: true,
    summary: `มีอาวุธปืนทั้งหมด ${formatNumber(total_firearms)} กระบอก ระบุชนิดแล้ว ${formatNumber(identified_firearms)} กระบอก (${formatIdentificationRate(identified_firearms, total_firearms)}) และเพิ่มใหม่เดือนนี้ ${formatNumber(new_firearms_this_month)} กระบอก`,
    breakdown: {
      total: total_firearms,
      identified: identified_firearms,
      unknown: unknown_firearms,
      newThisMonth: new_firearms_this_month,
      identificationRate: formatIdentificationRate(identified_firearms, total_firearms)
    }
  };
};

export default {
  formatNumber,
  calculatePercentage,
  formatIdentificationRate,
  prepareMonthlyChartData,
  prepareCategoryChartData,
  calculateChangePercentage,
  formatChangePercentage,
  generateChartColors,
  analyzeTrend,
  findMinMax,
  calculateAverage,
  formatDate,
  timeAgo,
  validateStatisticsData,
  createStatisticsSummary
};