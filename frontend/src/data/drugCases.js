export const drugCases = [
  {
    id: 1,
    date: "2024-03-15",
    province: "เชียงใหม่",
    district: "เมืองเชียงใหม่",
    subDistrict: "ช้างคลาน",
    location: {
      lat: 18.7861,
      lng: 98.9847
    },
    drugType: "methamphetamine", // ยาบ้า
    quantity: 50000,
    unit: "เม็ด",
    estimatedValue: 1500000,
    caseType: "distribution", // จุดกระจายสินค้า
    severity: "critical" // ระดับความรุนแรง
  },
  {
    id: 2,
    date: "2024-03-14",
    province: "ตาก",
    district: "แม่สอด",
    subDistrict: "แม่สอด",
    location: {
      lat: 16.7157,
      lng: 98.5715
    },
    drugType: "heroin",
    quantity: 50,
    unit: "กิโลกรัม",
    estimatedValue: 75000000,
    caseType: "trafficking", // เส้นทางลำเลียง
    severity: "high"
  },
  // ... สามารถเพิ่มข้อมูลได้ตามต้องการ
];

// ข้อมูลเส้นทางลำเลียงยาเสพติด
export const drugRoutes = [
  {
    id: "route1",
    name: "เส้นทางภาคเหนือ",
    path: [
      { lat: 20.4025, lng: 99.8787 }, // จุดเริ่มต้น
      { lat: 19.9075, lng: 99.8306 },
      { lat: 18.7861, lng: 98.9847 } // จุดสิ้นสุด
    ],
    type: "primary", // เส้นทางหลัก
    activity: "high" // ระดับกิจกรรม
  }
];

// ข้อมูล Hotspots
export const hotspots = [
  {
    id: "hs1",
    location: {
      lat: 18.7861,
      lng: 98.9847
    },
    radius: 5000, // รัศมีเป็นเมตร
    intensity: 0.8, // ความเข้มข้นของกิจกรรม (0-1)
    cases: 25 // จำนวนคดีในพื้นที่
  }
]; 