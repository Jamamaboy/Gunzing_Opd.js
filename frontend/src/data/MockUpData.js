const mockUpData = [
      {
        id: '1',
        category: 'ปืน',
        subcategory: 'ปืนพก',
        mechanism: 'ออโต้',
        brand: 'Glock',
        series: '19',
        model: 'Glock 19 Gen 5',
        province: '',
        district: '',
        subdistrict: '',
        date: '',
        time: '',
      },
      {
        id: '2',
        category: 'ปืน',
        subcategory: 'ปืนพก',
        mechanism: 'ออโต้',
        brand: 'Glock',
        series: '19',
        model: 'Glock 19 Gen 5',
        province: '',
        district: '',
        subdistrict: '',
        date: '',
        time: '',
      },
      {
        id: '3',
        category: 'ยาเสพติด',
        subcategory: 'ยาไอซ์',
        form: 'หีบห่อ',
        package_stamp: '',
        packaging_method: '',
      },
      {
        id: '4',
        category: 'ยาเสพติด',
        subcategory: 'ยาไอซ์',
        form: 'เม็ดยา',
        pill_stamp: '',
        shape: '',
        corlor: '',
      },
]

// CREATE TABLE exhibits (
//   id SERIAL PRIMARY KEY,
//   category VARCHAR(255),
//   subcategory VARCHAR(255),
// );

// CREATE TABLE firearms (
//   exhibit_id INT PRIMARY KEY REFERENCES exhibits(id),
//   mechanism VARCHAR(255),
//   brand VARCHAR(255),
//   series VARCHAR(255),
//   model VARCHAR(255)
// );

// CREATE TABLE narcotics (
//   exhibit_id INT PRIMARY KEY REFERENCES exhibits(id),
//   form VARCHAR(255) NOT NULL
// );

// CREATE TABLE narcotics_package (
//   narcotic_id INT PRIMARY KEY REFERENCES narcotics(exhibit_id),
//   package_stamp VARCHAR(255),
//   packaging_method VARCHAR(255)
// );

// CREATE TABLE narcotics_pills (
//   narcotic_id INT PRIMARY KEY REFERENCES narcotics(exhibit_id),
//   pill_stamp VARCHAR(255),
//   pill_shape VARCHAR(255),
//   pill_color VARCHAR(255)
// );

const galleryImages = [
  { id: 1, url: 'https://pngimg.com/d/glock_PNG1.png', name: 'ปืน Glock 19' },
  { id: 2, url: 'https://s3.us-west-2.amazonaws.com/talo-dist-v2/_large/G49-MOS_Technical_45-Degree_20230720_01.jpg', name: 'ปืน Glock 17' },
  { id: 3, url: 'https://us.glock.com/-/media/Global/US/old/ThreeSixtyImages/G17_Gen3/img_0_0_2.ashx', name: 'ปืน Glock 43' },
  { id: 4, url: 'https://assets.basspro.com/image/upload/c_limit,dpr_2.0,f_auto,h_250,q_auto,w_400/c_limit,h_250,w_400/v1/ProductImages/450/master1_10217977_main?pgw=1', name: 'ปืน Glock 26' },
];

// --- Sample Data ---
const historyData = [
  { id: 1, date: "13/2/2568", category: "อาวุธปืน", image: "https://pngimg.com/d/glock_PNG1.png", name: "Glock 19", location: "นนทบุรี, บางกรวย, บางกรวย" },
  { id: 3, date: "14/2/2568", category: "อาวุธปืน", image: "https://pngimg.com/d/glock_PNG1.png", name: "Glock 19", location: "ชลบุรี, เมืองชลบุรี, บ้านสวน" },
  { id: 5, date: "15/8/2567", category: "อาวุธปืน", image: "https://pngimg.com/d/glock_PNG1.png", name: "Glock 19", location: "สงขลา, หาดใหญ่, หาดใหญ่" }, 
  { id: 7, date: "16/2/2568", category: "อาวุธปืน", image: "https://pngimg.com/d/glock_PNG1.png", name: "Glock 19", location: "ขอนแก่น, เมืองขอนแก่น, ในเมือง" },
  { id: 9, date: "17/2/2568", category: "อาวุธปืน", image: "https://pngimg.com/d/glock_PNG1.png", name: "Glock 19", location: "อุดรธานี, เมืองอุดรธานี, หมากแข้ง" },
  { id: 11, date: "18/8/2567", category: "อาวุธปืน", image: "https://pngimg.com/d/glock_PNG1.png", name: "Glock 19", location: "นนทบุรี, ปากเกร็ด, บางตลาด" },
  { id: 13, date: "19/2/2568", category: "อาวุธปืน", image: "https://pngimg.com/d/glock_PNG1.png", name: "Glock 19", location: "สมุทรปราการ, เมืองสมุทรปราการ, ปากน้ำ" },
  { id: 15, date: "20/2/2568", category: "อาวุธปืน", image: "https://pngimg.com/d/glock_PNG1.png", name: "Glock 19", location: "พระนครศรีอยุธยา, พระนครศรีอยุธยา, ประตูชัย" },
  { id: 17, date: "21/2/2568", category: "อาวุธปืน", image: "https://pngimg.com/d/glock_PNG1.png", name: "Glock 19", location: "ลพบุรี, เมืองลพบุรี, ท่าศาลา" },
  { id: 19, date: "22/2/2568", category: "อาวุธปืน", image: "https://pngimg.com/d/glock_PNG1.png", name: "Glock 19", location: "พิษณุโลก, เมืองพิษณุโลก, ในเมือง" },
  { id: 21, date: "23/2/2568", category: "อาวุธปืน", image: "https://pngimg.com/d/glock_PNG1.png", name: "Glock 19", location: "กรุงเทพมหานคร, บางเขน, อนุสาวรีย์" },
  { id: 23, date: "24/2/2568", category: "อาวุธปืน", image: "https://pngimg.com/d/glock_PNG1.png", name: "Glock 19", location: "เชียงใหม่, เมืองเชียงใหม่, สุเทพ" },
  { id: 25, date: "25/7/2567", category: "อาวุธปืน", image: "https://pngimg.com/d/glock_PNG1.png", name: "Glock 19", location: "กรุงเทพมหานคร, จตุจักร, ลาดยาว" },
  { id: 27, date: "22/1/2567", category: "อาวุธปืน", image: "https://pngimg.com/d/glock_PNG1.png", name: "Glock 19", location: "สงขลา, หาดใหญ่, คลองแห" },
  { id: 29, date: "19/12/2567", category: "อาวุธปืน", image: "https://pngimg.com/d/glock_PNG1.png", name: "Glock 19", location: "ชลบุรี, ศรีราชา, สุรศักดิ์" },
  { id: 31, date: "12/1/2568", category: "อาวุธปืน", image: "https://pngimg.com/d/glock_PNG1.png", name: "Glock 19", location: "สมุทรปราการ, บางพลี, บางแก้ว" },
  { id: 2, date: "13/2/2568", category: "ยาเสพติด", image: "https://www.sangbadpratidin.in/wp-content/uploads/2019/09/yaba.jpg", name: "WY", location: "นนทบุรี, บางกรวย, บางกรวย" },
  { id: 4, date: "14/2/2568", category: "ยาเสพติด", image: "https://www.sangbadpratidin.in/wp-content/uploads/2019/09/yaba.jpg", name: "WY", location: "ชลบุรี, เมืองชลบุรี, บ้านสวน" },
  { id: 6, date: "15/8/2567", category: "ยาเสพติด", image: "https://www.sangbadpratidin.in/wp-content/uploads/2019/09/yaba.jpg", name: "WY", location: "สงขลา, หาดใหญ่, หาดใหญ่" }, 
  { id: 8, date: "16/2/2568", category: "ยาเสพติด", image: "https://www.sangbadpratidin.in/wp-content/uploads/2019/09/yaba.jpg", name: "WY", location: "ขอนแก่น, เมืองขอนแก่น, ในเมือง" },
  { id: 10, date: "17/2/2568", category: "ยาเสพติด", image: "https://www.sangbadpratidin.in/wp-content/uploads/2019/09/yaba.jpg", name: "WY", location: "อุดรธานี, เมืองอุดรธานี, หมากแข้ง" },
  { id: 12, date: "18/8/2567", category: "ยาเสพติด", image: "https://www.sangbadpratidin.in/wp-content/uploads/2019/09/yaba.jpg", name: "WY", location: "นนทบุรี, ปากเกร็ด, บางตลาด" },
  { id: 14, date: "19/2/2568", category: "ยาเสพติด", image: "https://www.sangbadpratidin.in/wp-content/uploads/2019/09/yaba.jpg", name: "WY", location: "สมุทรปราการ, เมืองสมุทรปราการ, ปากน้ำ" },
  { id: 16, date: "20/2/2568", category: "ยาเสพติด", image: "https://www.sangbadpratidin.in/wp-content/uploads/2019/09/yaba.jpg", name: "WY", location: "พระนครศรีอยุธยา, พระนครศรีอยุธยา, ประตูชัย" },
  { id: 18, date: "21/2/2568", category: "ยาเสพติด", image: "https://www.sangbadpratidin.in/wp-content/uploads/2019/09/yaba.jpg", name: "WY", location: "ลพบุรี, เมืองลพบุรี, ท่าศาลา" },
  { id: 20, date: "22/2/2568", category: "ยาเสพติด", image: "https://www.sangbadpratidin.in/wp-content/uploads/2019/09/yaba.jpg", name: "WY", location: "พิษณุโลก, เมืองพิษณุโลก, ในเมือง" },
  { id: 22, date: "23/2/2568", category: "ยาเสพติด", image: "https://www.sangbadpratidin.in/wp-content/uploads/2019/09/yaba.jpg", name: "WY", location: "กรุงเทพมหานคร, บางเขน, อนุสาวรีย์" },
  { id: 24, date: "24/2/2568", category: "ยาเสพติด", image: "https://www.sangbadpratidin.in/wp-content/uploads/2019/09/yaba.jpg", name: "WY", location: "เชียงใหม่, เมืองเชียงใหม่, สุเทพ" },
  { id: 26, date: "25/7/2567", category: "ยาเสพติด", image: "https://www.sangbadpratidin.in/wp-content/uploads/2019/09/yaba.jpg", name: "WY", location: "กรุงเทพมหานคร, จตุจักร, ลาดยาว" },
  { id: 28, date: "22/1/2567", category: "ยาเสพติด", image: "https://www.sangbadpratidin.in/wp-content/uploads/2019/09/yaba.jpg", name: "WY", location: "สงขลา, หาดใหญ่, คลองแห" },
  { id: 30, date: "19/12/2567", category: "ยาเสพติด", image: "https://www.sangbadpratidin.in/wp-content/uploads/2019/09/yaba.jpg", name: "WY", location: "ชลบุรี, ศรีราชา, สุรศักดิ์" },
  { id: 32, date: "12/1/2568", category: "ยาเสพติด", image: "https://www.sangbadpratidin.in/wp-content/uploads/2019/09/yaba.jpg", name: "WY", location: "สมุทรปราการ, บางพลี, บางแก้ว" },
];

// Location coordinates mapping for mapping markers
const locationCoordinates = {
  "กรุงเทพมหานคร": { lat: 13.7563, lng: 100.5018 },
  "เชียงใหม่": { lat: 18.7883, lng: 98.9853 },
  "ชลบุรี": { lat: 13.1247, lng: 100.9147 },
  "สงขลา": { lat: 7.2077, lng: 100.5946 },
  "ขอนแก่น": { lat: 16.4419, lng: 102.8350 },
  "นนทบุรี": { lat: 13.8671, lng: 100.5154 },
  "สมุทรปราการ": { lat: 13.5990, lng: 100.5997 },
  "พระนครศรีอยุธยา": { lat: 14.3692, lng: 100.5877 },
  "ลพบุรี": { lat: 14.7995, lng: 100.6532 },
  "พิษณุโลก": { lat: 16.8211, lng: 100.2654 },
  "อุดรธานี": { lat: 17.4139, lng: 102.7871 },
  "เมืองชลบุรี": { lat: 13.3611, lng: 100.9847 },
  "ศรีราชา": { lat: 13.1247, lng: 100.9147 },
  "หาดใหญ่": { lat: 7.0006, lng: 100.4742 },
  "บางเขน": { lat: 13.8647, lng: 100.5938 },
  "จตุจักร": { lat: 13.8282, lng: 100.5541 },
  "บางกรวย": { lat: 13.8077, lng: 100.4745 },
  "ปากเกร็ด": { lat: 13.9134, lng: 100.4950 },
  "เมืองสมุทรปราการ": { lat: 13.5990, lng: 100.5997 },
  "บางพลี": { lat: 13.5952, lng: 100.6960 },
  "พระนครศรีอยุธยา": { lat: 14.3692, lng: 100.5877 },
  "เมืองลพบุรี": { lat: 14.7995, lng: 100.6532 },
  "เมืองพิษณุโลก": { lat: 16.8211, lng: 100.2654 },
  "เมืองขอนแก่น": { lat: 16.4419, lng: 102.8350 },
  "เมืองอุดรธานี": { lat: 17.4139, lng: 102.7871 },
  "เมืองเชียงใหม่": { lat: 18.7883, lng: 98.9853 },
};

// Process history data to get map markers with coordinates
const getMapMarkers = () => {
  return historyData.map(item => {
    const locationParts = item.location.split(', ');
    const province = locationParts[0];
    const district = locationParts[1];
    
    // Try to get coordinates for district first, then fall back to province
    const coordinates = locationCoordinates[district] || locationCoordinates[province] || { lat: 13.7563, lng: 100.5018 };
    
    return {
      id: item.id,
      position: [coordinates.lat, coordinates.lng],
      category: item.category,
      name: item.name,
      location: item.location,
      date: item.date,
      image: item.image,
      type: item.category === 'อาวุธปืน' ? 'firearm' : 'drug',
      icon: item.category === 'อาวุธปืน' ? '/Img/icon/ปืน.png' : '/Img/icon/ยาเสพติด.png',
      color: item.category === 'อาวุธปืน' ? '#e53e3e' : '#805ad5'
    };
  });
};

// Generate statistics from history data
const getProvinceStatistics = () => {
  const provinceCounts = {};
  const categoryStats = { 'อาวุธปืน': 0, 'ยาเสพติด': 0 };
  
  // Count occurrences by province and category
  historyData.forEach(item => {
    const locationParts = item.location.split(', ');
    const province = locationParts[0];
    
    // Initialize province stats if not exist
    if (!provinceCounts[province]) {
      provinceCounts[province] = { 
        province: province,
        cases: 0,
        firearms: 0,
        drugs: 0
      };
    }
    
    // Increment counts
    provinceCounts[province].cases++;
    
    if (item.category === 'อาวุธปืน') {
      provinceCounts[province].firearms++;
      categoryStats['อาวุธปืน']++;
    } else if (item.category === 'ยาเสพติด') {
      provinceCounts[province].drugs++;
      categoryStats['ยาเสพติด']++;
    }
  });
  
  // Convert to array and sort by total cases
  const provinceStats = Object.values(provinceCounts).sort((a, b) => b.cases - a.cases);
  
  // Calculate category percentages
  const totalCases = historyData.length;
  const categoryPercentages = {
    firearms: (categoryStats['อาวุธปืน'] / totalCases) * 100,
    drugs: (categoryStats['ยาเสพติด'] / totalCases) * 100
  };
  
  // Generate drug distribution data (types of drugs)
  const drugDistribution = [
    { drug: 'ยาบ้า (WY)', percentage: 45, color: '#805ad5' },
    { drug: 'ไอซ์', percentage: 25, color: '#3182ce' },
    { drug: 'กัญชา', percentage: 15, color: '#38a169' },
    { drug: 'เฮโรอีน', percentage: 10, color: '#e53e3e' },
    { drug: 'เคตามีน', percentage: 5, color: '#d69e2e' }
  ];
  
  // Generate firearm distribution data (types of firearms)
  const firearmDistribution = [
    { type: 'ปืนพก', percentage: 50, color: '#e53e3e' },
    { type: 'ปืนลูกซอง', percentage: 20, color: '#dd6b20' },
    { type: 'ปืนไรเฟิล', percentage: 15, color: '#d69e2e' },
    { type: 'ปืนกลมือ', percentage: 10, color: '#9f580a' },
    { type: 'อื่นๆ', percentage: 5, color: '#822727' }
  ];
  
  // Generate monthly trend data (for visualization)
  const monthlyTrend = [
    { month: 'ม.ค.', cases: 28, firearms: 14, drugs: 14 },
    { month: 'ก.พ.', cases: 32, firearms: 16, drugs: 16 },
    { month: 'มี.ค.', cases: 24, firearms: 12, drugs: 12 },
    { month: 'เม.ย.', cases: 30, firearms: 15, drugs: 15 },
    { month: 'พ.ค.', cases: 36, firearms: 18, drugs: 18 },
    { month: 'มิ.ย.', cases: 34, firearms: 17, drugs: 17 }
  ];

  // Generate area-specific statistics based on selected areas
  const getAreaSpecificStats = (selectedProvinces = []) => {
    // If no areas selected, return default distributions
    if (selectedProvinces.length === 0) {
      return {
        categoryPercentages: {
          firearms: (categoryStats['อาวุธปืน'] / totalCases) * 100,
          drugs: (categoryStats['ยาเสพติด'] / totalCases) * 100
        },
        drugDistribution: [...drugDistribution],
        firearmDistribution: [...firearmDistribution]
      };
    }

    // For demo purposes, generate mock data for each selected province
    // In a real implementation, this would fetch from an actual data source 
    
    // Get province names from selected provinces
    const provinceNames = selectedProvinces.map(p => p.province_name);

    // Create distribution variations based on province name's character code
    const variations = {};
    
    provinceNames.forEach(name => {
      // Use province name's first character code to create slight variations
      const seedValue = name.charCodeAt(0) % 10;
      
      variations[name] = {
        firearm: {
          'ปืนพก': 40 + seedValue,
          'ปืนลูกซอง': 25 + (seedValue % 5),
          'ปืนไรเฟิล': 15 + (seedValue % 10),
          'ปืนกลมือ': 10 - (seedValue % 5),
          'อื่นๆ': 10 - (seedValue % 5)
        },
        drug: {
          'ยาบ้า (WY)': 40 + seedValue,
          'ไอซ์': 25 + (seedValue % 10),
          'กัญชา': 15 - (seedValue % 5),
          'เฮโรอีน': 10 - (seedValue % 5),
          'เคตามีน': 10 - (seedValue % 5)
        }
      };
    });
    
    // Calculate aggregated percentages across all selected provinces
    const aggregateData = {
      firearms: 0,
      drugs: 0,
      firearmTypes: { 'ปืนพก': 0, 'ปืนลูกซอง': 0, 'ปืนไรเฟิล': 0, 'ปืนกลมือ': 0, 'อื่นๆ': 0 },
      drugTypes: { 'ยาบ้า (WY)': 0, 'ไอซ์': 0, 'กัญชา': 0, 'เฮโรอีน': 0, 'เคตามีน': 0 }
    };
    
    // Find matching province statistics
    const matchedProvinces = provinceStats.filter(p => 
      provinceNames.includes(p.province)
    );
    
    // Calculate total cases and category counts for selected provinces
    let totalFirearms = 0;
    let totalDrugs = 0;
    
    matchedProvinces.forEach(province => {
      totalFirearms += province.firearms;
      totalDrugs += province.drugs;
      
      // Get variations for this province
      const provinceName = province.province;
      const provinceVariation = variations[provinceName] || (Object.keys(variations).length > 0 ? variations[Object.keys(variations)[0]] : null);
      
      if (provinceVariation) {
        // Add weighted firearm type contributions
        for (const type in aggregateData.firearmTypes) {
          const typePercent = provinceVariation.firearm[type] || 0;
          aggregateData.firearmTypes[type] += (province.firearms * typePercent / 100);
        }
        
        // Add weighted drug type contributions
        for (const type in aggregateData.drugTypes) {
          const typePercent = provinceVariation.drug[type] || 0;
          aggregateData.drugTypes[type] += (province.drugs * typePercent / 100);
        }
      }
    });
    
    const totalSelectedCases = totalFirearms + totalDrugs;
    
    // Calculate final percentages
    const categoryPercentages = {
      firearms: totalSelectedCases > 0 ? (totalFirearms / totalSelectedCases) * 100 : 0,
      drugs: totalSelectedCases > 0 ? (totalDrugs / totalSelectedCases) * 100 : 0
    };
    
    // Normalize firearm type percentages
    const resultFirearmDistribution = [];
    if (totalFirearms > 0) {
      for (const type in aggregateData.firearmTypes) {
        const rawCount = aggregateData.firearmTypes[type];
        const percentage = Math.round((rawCount / totalFirearms) * 100);
        if (percentage > 0) {
          const color = type === 'ปืนพก' ? '#e53e3e' : 
                      type === 'ปืนลูกซอง' ? '#dd6b20' :
                      type === 'ปืนไรเฟิล' ? '#d69e2e' :
                      type === 'ปืนกลมือ' ? '#9f580a' : '#822727';
          
          resultFirearmDistribution.push({ type, percentage, color });
        }
      }
    } else {
      // Default if no firearms in selected area
      resultFirearmDistribution.push(
        { type: 'ไม่มีข้อมูล', percentage: 100, color: '#cccccc' }
      );
    }
    
    // Normalize drug type percentages
    const resultDrugDistribution = [];
    if (totalDrugs > 0) {
      for (const drug in aggregateData.drugTypes) {
        const rawCount = aggregateData.drugTypes[drug];
        const percentage = Math.round((rawCount / totalDrugs) * 100);
        if (percentage > 0) {
          const color = drug === 'ยาบ้า (WY)' ? '#805ad5' : 
                      drug === 'ไอซ์' ? '#3182ce' :
                      drug === 'กัญชา' ? '#38a169' :
                      drug === 'เฮโรอีน' ? '#e53e3e' : '#d69e2e';
          
          resultDrugDistribution.push({ drug, percentage, color });
        }
      }
    } else {
      // Default if no drugs in selected area
      resultDrugDistribution.push(
        { drug: 'ไม่มีข้อมูล', percentage: 100, color: '#cccccc' }
      );
    }
    
    return {
      categoryPercentages,
      firearmDistribution: resultFirearmDistribution,
      drugDistribution: resultDrugDistribution
    };
  };
  
  return {
    provinceStats,
    categoryStats,
    categoryPercentages,
    drugDistribution,
    firearmDistribution,
    monthlyTrend,
    totalCases,
    getAreaSpecificStats
  };
};

export {
  mockUpData,
  galleryImages,
  historyData,
  getMapMarkers,
  getProvinceStatistics
};