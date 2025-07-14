export const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

export const formatDateTime = (dateString) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return new Date(dateString).toLocaleString(undefined, options);
};

export const isValidDate = (dateString) => {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
};

// ✅ ฟังก์ชันแปลง ค.ศ. เป็น พ.ศ.
export const formatDateToBuddhistEra = (dateString) => {
  if (!isValidDate(dateString)) return 'วันที่ไม่ถูกต้อง';
  
  const date = new Date(dateString);
  const buddhistYear = date.getFullYear() + 543;
  const day = date.getDate();
  const month = date.getMonth() + 1;
  
  return `${day}/${month}/${buddhistYear}`;
};

// ✅ ฟังก์ชันแปลงเป็นวันที่ภาษาไทยแบบเต็ม
export const formatDateToThaiLong = (dateString) => {
  if (!isValidDate(dateString)) return 'วันที่ไม่ถูกต้อง';
  
  const date = new Date(dateString);
  const buddhistYear = date.getFullYear() + 543;
  
  const thaiMonths = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน',
    'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม',
    'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];
  
  const day = date.getDate();
  const month = thaiMonths[date.getMonth()];
  
  return `${day} ${month} ${buddhistYear}`;
};

// ✅ ฟังก์ชันแปลงเป็นวันที่ภาษาไทยแบบสั้น
export const formatDateToThaiShort = (dateString) => {
  if (!isValidDate(dateString)) return 'วันที่ไม่ถูกต้อง';
  
  const date = new Date(dateString);
  const buddhistYear = date.getFullYear() + 543;
  
  const thaiMonthsShort = [
    'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.',
    'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.',
    'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
  ];
  
  const day = date.getDate();
  const month = thaiMonthsShort[date.getMonth()];
  
  return `${day} ${month} ${buddhistYear}`;
};

// ✅ ฟังก์ชันแปลงวันเวลาเป็นภาษาไทย
export const formatDateTimeToThai = (dateString) => {
  if (!isValidDate(dateString)) return 'วันที่ไม่ถูกต้อง';
  
  const date = new Date(dateString);
  const thaiDate = formatDateToThaiLong(dateString);
  
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  
  return `${thaiDate} เวลา ${hours}:${minutes} น.`;
};

// ✅ ฟังก์ชันแปลง ค.ศ. เป็น พ.ศ. (เฉพาะปี)
export const convertToBuddhistYear = (christianYear) => {
  return parseInt(christianYear) + 543;
};

// ✅ ฟังก์ชันแปลง พ.ศ. เป็น ค.ศ. (เฉพาะปี)
export const convertToChristianYear = (buddhistYear) => {
  return parseInt(buddhistYear) - 543;
};

// ✅ ฟังก์ชันตรวจสอบว่าเป็น Excel Serial Date หรือไม่
export const isExcelSerialDate = (dateValue) => {
  if (!dateValue) return false;
  
  const cleanDate = String(dateValue).trim();
  
  // ตรวจสอบว่าเป็นตัวเลขล้วนๆ และมากกว่า 1000 (เพื่อป้องกัน false positive)
  return /^\d+$/.test(cleanDate) && parseInt(cleanDate) > 1000 && parseInt(cleanDate) < 2958465;
};

// ✅ ฟังก์ชันแปลง Excel Serial Date เป็น JavaScript Date
export const parseExcelSerialDate = (serialDate) => {
  try {
    const serial = parseInt(serialDate);
    
    // ตรวจสอบว่าเป็น Excel Serial Date ที่ valid
    if (isNaN(serial) || serial < 1 || serial > 2958465) {
      return null;
    }
    
    // Excel epoch: 1 มกราคม 1900
    // แต่ Excel มี bug คือนับ 1900 เป็น leap year (ซึ่งไม่ใช่)
    // ดังนั้นต้องลบ 2 วัน
    const excelEpoch = new Date(1900, 0, 1);
    const jsDate = new Date(excelEpoch.getTime() + (serial - 2) * 24 * 60 * 60 * 1000);
    
    return jsDate;
    
  } catch (error) {
    console.error('Error parsing Excel serial date:', error);
    return null;
  }
};

// ✅ ฟังก์ชันแปลงวันที่ครอบคลุมทุกรูปแบบ (Universal Date Parser)
export const parseDate = (dateString) => {
  if (!dateString) return null;
  
  try {
    const cleanDate = String(dateString).trim();
    
    // ✅ ตรวจสอบว่าเป็น Excel Serial Date Number หรือไม่
    if (isExcelSerialDate(cleanDate)) {
      console.log(`🔍 Detected Excel Serial Date: ${cleanDate}`);
      
      const jsDate = parseExcelSerialDate(cleanDate);
      
      if (jsDate && !isNaN(jsDate.getTime())) {
        const isoDate = jsDate.toISOString().split('T')[0];
        console.log(`✅ Converted Excel Date ${cleanDate} to: ${isoDate}`);
        return isoDate;
      }
    }
    
    // ✅ รูปแบบ DD/MM/YYYY
    if (cleanDate.includes('/')) {
      const [day, month, year] = cleanDate.split('/');
      if (day && month && year) {
        const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        if (!isNaN(date.getTime())) {
          console.log(`✅ Parsed DD/MM/YYYY: ${cleanDate} to: ${date.toISOString().split('T')[0]}`);
          return date.toISOString().split('T')[0];
        }
      }
    }
    
    // ✅ รูปแบบ YYYY-MM-DD
    if (cleanDate.includes('-') && cleanDate.length >= 8) {
      const date = new Date(cleanDate);
      if (!isNaN(date.getTime())) {
        console.log(`✅ Parsed YYYY-MM-DD: ${cleanDate} to: ${date.toISOString().split('T')[0]}`);
        return date.toISOString().split('T')[0];
      }
    }
    
    // ✅ รูปแบบ DD.MM.YYYY (จุด)
    if (cleanDate.includes('.')) {
      const [day, month, year] = cleanDate.split('.');
      if (day && month && year) {
        const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        if (!isNaN(date.getTime())) {
          console.log(`✅ Parsed DD.MM.YYYY: ${cleanDate} to: ${date.toISOString().split('T')[0]}`);
          return date.toISOString().split('T')[0];
        }
      }
    }
    
    // ✅ รูปแบบ DD MM YYYY (เว้นวรรค)
    const spaceParts = cleanDate.split(' ').filter(part => part.trim() !== '');
    if (spaceParts.length === 3) {
      const [day, month, year] = spaceParts;
      if (day && month && year) {
        const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        if (!isNaN(date.getTime())) {
          console.log(`✅ Parsed DD MM YYYY: ${cleanDate} to: ${date.toISOString().split('T')[0]}`);
          return date.toISOString().split('T')[0];
        }
      }
    }
    
    console.warn(`⚠️ Unable to parse date: ${cleanDate}`);
    return null;
    
  } catch (error) {
    console.error('❌ Error parsing date:', error);
    return null;
  }
};

// ✅ ฟังก์ชันแปลงวันที่สำหรับการแสดงผล (Display Format)
export const formatDateForDisplay = (dateValue) => {
  if (!dateValue) return '';
  
  try {
    const cleanDate = String(dateValue).trim();
    
    // ✅ ตรวจสอบว่าเป็น Excel Serial Date Number หรือไม่
    if (isExcelSerialDate(cleanDate)) {
      console.log(`🔍 Converting Excel Serial Date for display: ${cleanDate}`);
      
      const jsDate = parseExcelSerialDate(cleanDate);
      
      if (jsDate && !isNaN(jsDate.getTime())) {
        // แปลงเป็นรูปแบบไทย DD/MM/YYYY
        const day = jsDate.getDate().toString().padStart(2, '0');
        const month = (jsDate.getMonth() + 1).toString().padStart(2, '0');
        const year = jsDate.getFullYear();
        const displayDate = `${day}/${month}/${year}`;
        
        console.log(`✅ Converted ${cleanDate} to: ${displayDate}`);
        return displayDate;
      }
    }
    
    // ✅ รูปแบบ DD/MM/YYYY (แสดงเหมือนเดิม)
    if (cleanDate.includes('/') && cleanDate.length <= 10) {
      return cleanDate;
    }
    
    // ✅ รูปแบบ YYYY-MM-DD (แปลงเป็น DD/MM/YYYY)
    if (cleanDate.includes('-') && cleanDate.length === 10) {
      const [year, month, day] = cleanDate.split('-');
      if (year && month && day) {
        return `${day}/${month}/${year}`;
      }
    }
    
    // ✅ รูปแบบ DD.MM.YYYY (แปลงเป็น DD/MM/YYYY)
    if (cleanDate.includes('.')) {
      const [day, month, year] = cleanDate.split('.');
      if (day && month && year) {
        return `${day}/${month}/${year}`;
      }
    }
    
    return cleanDate;
    
  } catch (error) {
    console.error('❌ Error formatting date for display:', error);
    return String(dateValue);
  }
};

// ✅ ฟังก์ชันทดสอบการแปลงวันที่
export const testDateParsing = (testDates) => {
  console.log('🧪 Testing Date Parsing:');
  
  testDates.forEach(dateStr => {
    const parseResult = parseDate(dateStr);
    const displayResult = formatDateForDisplay(dateStr);
    
    console.log(`📅 "${dateStr}":`);
    console.log(`   Parse: "${parseResult}"`);
    console.log(`   Display: "${displayResult}"`);
  });
};

// ✅ ฟังก์ชันสำหรับทดสอบ Excel Date แบบเฉพาะ
export const testExcelDateConversion = () => {
  const testExcelDates = [
    '45658',        // 31/12/2024
    '45292',        // 31/12/2023
    '44928',        // 01/01/2023
    '45024',        // 05/04/2023
    '44197',        // 01/01/2021
    '43831'         // 01/01/2020
  ];
  
  console.log('🧪 Testing Excel Date Conversion:');
  
  testExcelDates.forEach(serialDate => {
    const jsDate = parseExcelSerialDate(serialDate);
    const isoDate = jsDate ? jsDate.toISOString().split('T')[0] : null;
    const displayDate = formatDateForDisplay(serialDate);
    
    console.log(`📊 Excel Serial: ${serialDate}`);
    console.log(`   JavaScript Date: ${jsDate}`);
    console.log(`   ISO Date: ${isoDate}`);
    console.log(`   Display Date: ${displayDate}`);
    console.log('---');
  });
};

// ✅ Export object สำหรับการใช้งานแบบ grouped
export const DateUtils = {
  // Core functions
  formatDate,
  formatDateTime,
  isValidDate,
  
  // Thai formatting
  formatDateToBuddhistEra,
  formatDateToThaiLong,
  formatDateToThaiShort,
  formatDateTimeToThai,
  
  // Year conversion
  convertToBuddhistYear,
  convertToChristianYear,
  
  // Excel date handling
  isExcelSerialDate,
  parseExcelSerialDate,
  parseDate,
  formatDateForDisplay,
  
  // Testing utilities
  testDateParsing,
  testExcelDateConversion
};

export default DateUtils;