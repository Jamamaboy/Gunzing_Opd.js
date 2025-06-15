const drugDiscoveries = [
  {
    id: 1,
    drugType: "ยาบ้า",
    quantity: 10000,
    unit: "เม็ด",
    province: "เชียงใหม่",
    district: "เมืองเชียงใหม่",
    subdistrict: "ช้างเผือก",
    date: "2024-03-15",
    location: {
      lat: 18.7883,
      lng: 98.9853
    }
  },
  {
    id: 2,
    drugType: "กัญชา",
    quantity: 50,
    unit: "กิโลกรัม",
    province: "นครราชสีมา",
    district: "เมืองนครราชสีมา",
    subdistrict: "ในเมือง",
    date: "2024-03-10",
    location: {
      lat: 14.9798,
      lng: 102.0978
    }
  },
  {
    id: 3,
    drugType: "ยาเสพติดประเภทอื่นๆ",
    quantity: 200,
    unit: "เม็ด",
    province: "เชียงใหม่",
    district: "เมืองเชียงใหม่",
    subdistrict: "สุเทพ",
    date: "2024-03-09",
    location: {
      lat: 18.8317,
      lng: 98.8870
    }
  },
  {
    id: 4,
    drugType: "เม็ดพิษ",
    quantity: 1500,
    unit: "เม็ด",
    province: "เชียงใหม่",
    district: "แม่อาย",
    subdistrict: "แม่อาย",
    date: "2024-03-08",
    location: {
      lat: 20.1269,
      lng: 99.1812
    }
  },
  {
    id: 5,
    drugType: "ยาเสพติดประเภทอื่นๆ",
    quantity: 300,
    unit: "เม็ด",
    province: "เชียงใหม่",
    district: "แม่อาย",
    subdistrict: "แม่สาว",
    date: "2024-03-07",
    location: {
      lat: 20.1218,
      lng: 99.1704
    }
  },
  {
    id: 6,
    drugType: "กัญชา",
    quantity: 25,
    unit: "กิโลกรัม",
    province: "เชียงใหม่",
    district: "แม่อาย",
    subdistrict: "แม่สาว",
    date: "2024-03-06",
    location: {
      lat: 20.1218,
      lng: 99.1704
    }
  },
  {
    id: 7,
    drugType: "ยาบ้า",
    quantity: 8000,
    unit: "เม็ด",
    province: "เชียงใหม่",
    district: "สารภี",
    subdistrict: "ยางเนิ้ง",
    date: "2024-03-05",
    location: {
      lat: 18.7177,
      lng: 99.0291
    }
  },
  {
    id: 8,
    drugType: "เม็ดพิษ",
    quantity: 2000,
    unit: "เม็ด",
    province: "เชียงใหม่",
    district: "สารภี",
    subdistrict: "ไชยสถาน",
    date: "2024-03-04",
    location: {
      lat: 18.7200,
      lng: 99.0392
    }
  },
  {
    id: 9,
    drugType: "ยาเสพติดประเภทอื่นๆ",
    quantity: 150,
    unit: "เม็ด",
    province: "เชียงใหม่",
    district: "สารภี",
    subdistrict: "ขัวมุง",
    date: "2024-03-03",
    location: {
      lat: 18.6815,
      lng: 98.9975
    }
  },
  {
    id: 10,
    drugType: "กัญชา",
    quantity: 10,
    unit: "กิโลกรัม",
    province: "เชียงใหม่",
    district: "สารภี",
    subdistrict: "ดอนแก้ว",
    date: "2024-03-02",
    location: {
      lat: 18.7074,
      lng: 99.0083
    }
  },
  {
    id: 11,
    drugType: "ยาบ้า",
    quantity: 5000,
    unit: "เม็ด",
    province: "เชียงใหม่",
    district: "สารภี",
    subdistrict: "ยางคราม",
    date: "2024-03-01",
    location: {
      lat: 18.5183,
      lng: 98.4939
    }
  },
  {
    id: 12,
    drugType: "เม็ดพิษ",
    quantity: 1200,
    unit: "เม็ด",
    province: "เชียงใหม่",
    district: "สารภี",
    subdistrict: "แสนไห",
    date: "2024-02-29",
    location: {
      lat: 19.6694,
      lng: 98.6108
    }
  },
  {
    id: 13,
    drugType: "ยาเสพติดประเภทอื่นๆ",
    quantity: 250,
    unit: "เม็ด",
    province: "เชียงใหม่",
    district: "สารภี",
    subdistrict: "บ้านตาล",
    date: "2024-02-28",
    location: {
      lat: 18.1763,
      lng: 98.6574
    }
  },
  {
    id: 14,
    drugType: "กัญชา",
    quantity: 20,
    unit: "กิโลกรัม",
    province: "เชียงใหม่",
    district: "สารภี",
    subdistrict: "บวกค้าง",
    date: "2024-02-27",
    location: {
      lat: 18.7282,
      lng: 99.1072
    }
  },
  {
    id: 15,
    drugType: "ยาบ้า",
    quantity: 7000,
    unit: "เม็ด",
    province: "เชียงใหม่",
    district: "สารภี",
    subdistrict: "เมืองแหง",
    date: "2024-02-26",
    location: {
      lat: 19.7158,
      lng: 98.5183
    }
  },
  {
    id: 16,
    drugType: "เม็ดพิษ",
    quantity: 2500,
    unit: "เม็ด",
    province: "เชียงใหม่",
    district: "สารภี",
    subdistrict: "แสนไห",
    date: "2024-02-25",
    location: {
      lat: 19.6694,
      lng: 98.6108
    }
  },
  {
    id: 17,
    drugType: "ยาเสพติดประเภทอื่นๆ",
    quantity: 200,
    unit: "เม็ด",
    province: "เชียงใหม่",
    district: "สารภี",
    subdistrict: "บ้านทับ",
    date: "2024-02-24",
    location: {
      lat: 18.5201,
      lng: 98.3030
    }
  },
  {
    id: 18,
    drugType: "กัญชา",
    quantity: 15,
    unit: "กิโลกรัม",
    province: "เชียงใหม่",
    district: "สารภี",
    subdistrict: "บ้านทับ",
    date: "2024-02-23",
    location: {
      lat: 18.5201,
      lng: 98.3030
    }
  },
  {
    id: 19,
    drugType: "ยาบ้า",
    quantity: 6000,
    unit: "เม็ด",
    province: "เชียงใหม่",
    district: "สารภี",
    subdistrict: "บ้านกาด",
    date: "2024-02-22",
    location: {
      lat: 18.6248,
      lng: 98.7992
    }
  },
  {
    id: 20,
    drugType: "เม็ดพิษ",
    quantity: 1800,
    unit: "เม็ด",
    province: "เชียงใหม่",
    district: "สารภี",
    subdistrict: "บ้านกาด",
    date: "2024-02-21",
    location: {
      lat: 18.6248,
      lng: 98.7992
    }
  },
  // ... เพิ่มข้อมูลอีก 78 รายการ
];

export default drugDiscoveries;