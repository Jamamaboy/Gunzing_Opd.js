const handleSave = () => {
    const sidebarHistory = JSON.parse(localStorage.getItem("savedHistories")) || [];
    const tabbarHistory = JSON.parse(localStorage.getItem("evidenceHistory")) || [];
  
    const newRecord = {
      id: Date.now(),
      date: new Date().toLocaleDateString("th-TH"),
      name: name || "ไม่ระบุ",
      category: evidence?.result?.weaponType ? "อาวุธปืน" : "ยาเสพติด",
      location: locationInfo || "ไม่ระบุ",
      image: localStorage.getItem("analysisImage") || "", // ใช้ image ไม่ใช่ imageUrl
    };
  
    // 👉 เก็บใน localStorage ทั้ง 2 ที่
    localStorage.setItem("savedHistories", JSON.stringify([...sidebarHistory, newRecord]));
    localStorage.setItem("evidenceHistory", JSON.stringify([...tabbarHistory, newRecord]));
  
    // 👉 ตั้งค่าตัวกรองไว้ให้เปิดตรงประเภทล่าสุดตอนโหลดหน้าประวัติ
    localStorage.setItem("activeHistoryType", newRecord.category);
  
    // 👉 ลิ้งไปหน้า TabBar ประวัติ
 
    navigate("/evidenceProfile", { state: { tab: "history" } });
};
  