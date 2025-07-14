export const drugStatistics = {
  // สถิติรายเดือน
  monthly: {
    "2024-03": {
      totalCases: 193,
      byDrugType: {
        methamphetamine: 85,
        heroin: 45,
        cannabis: 30,
        cocaine: 20,
        ketamine: 13
      },
      totalValue: 250000000,
      arrests: 245
    }
  },

  // สถิติรายจังหวัด
  provincial: [
    {
      province: "เชียงใหม่",
      cases: 45,
      drugTypes: {
        methamphetamine: 20,
        heroin: 15,
        cannabis: 10
      },
      hotspots: 3
    },
    {
      province: "ตาก",
      cases: 35,
      drugTypes: {
        methamphetamine: 25,
        heroin: 10
      },
      hotspots: 2
    }
  ],

  // สถิติตามประเภทยาเสพติด
  byDrugType: {
    methamphetamine: {
      totalCases: 85,
      totalQuantity: 500000,
      unit: "เม็ด",
      estimatedValue: 150000000
    },
    heroin: {
      totalCases: 45,
      totalQuantity: 100,
      unit: "กิโลกรัม",
      estimatedValue: 200000000
    }
  }
};

// ข้อมูลแนวโน้ม
export const trends = {
  weekly: [
    { date: "2024-03-15", cases: 12 },
    { date: "2024-03-14", cases: 15 },
    { date: "2024-03-13", cases: 8 },
    { date: "2024-03-12", cases: 10 },
    { date: "2024-03-11", cases: 14 },
    { date: "2024-03-10", cases: 9 },
    { date: "2024-03-09", cases: 11 }
  ]
}; 