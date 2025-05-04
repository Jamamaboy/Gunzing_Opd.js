import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from 'react-router-dom';
import { FiFilter, FiPlus, FiEye, FiEdit, FiTrash, FiMapPin, FiCalendar, FiTag, FiArrowLeft, FiChevronLeft, FiChevronRight, FiX, FiChevronDown, FiChevronUp } from "react-icons/fi";

// --- Date Parsing (BE to CE) ---
const parseDateBE = (dateString) => {
  if (!dateString) return null;
  const parts = dateString.split('/');
  if (parts.length !== 3) return null;

  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const yearBE = parseInt(parts[2], 10);
  const yearCE = yearBE - 543;

  if (isNaN(day) || isNaN(month) || isNaN(yearCE)) return null;

  // Create date in UTC to avoid timezone issues during comparisons
  const date = new Date(Date.UTC(yearCE, month, day));
  // Check if the constructed date is valid (e.g., avoids Feb 30th)
  if (date.getUTCFullYear() !== yearCE || date.getUTCMonth() !== month || date.getUTCDate() !== day) {
      return null;
  }
  return date;
};


// --- Filter Pop Up ---
const FilterPopup = ({ isOpen, onClose, filters, onFilterChange, onClearFilters, onApplyFilters }) => {
  // Create a local state to track filter changes before applying
  const [localFilters, setLocalFilters] = useState(filters);
  // State to manage collapsible sections (all open by default)
  const [sectionsOpen, setSectionsOpen] = useState({
    category: true,
    date: true,
    location: true,
  });

  // Update local filters when props change (e.g., when filters are cleared externally)
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  // Update local filters and reset sections when modal opens
  useEffect(() => {
    if (isOpen) {
        setLocalFilters(filters);
    }
  }, [isOpen, filters]);


  if (!isOpen) return null;

  // Handler to toggle section visibility
  const toggleSection = (sectionName) => {
    setSectionsOpen(prev => ({ ...prev, [sectionName]: !prev[sectionName] }));
  };

  // --- Unchanged Handlers ---
  const handleCategoryChange = (e) => {
    const { value, checked } = e.target;
    const currentCategories = localFilters.categories || [];
    const newCategories = checked
      ? [...currentCategories, value]
      : currentCategories.filter((cat) => cat !== value);
    setLocalFilters({ ...localFilters, categories: newCategories });
  };
  // Handler for date range radio/checkbox changes
  const handleDateRangeChange = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      // When a preset range is checked, clear customDate
      setLocalFilters({ ...localFilters, dateRange: value, customDate: '' });
    } else {
      // If the currently selected range is unchecked, clear it
      if (localFilters.dateRange === value) {
        setLocalFilters({ ...localFilters, dateRange: null });
      }
      // Don't automatically clear customDate when unchecking a preset
    }
  };
  // Handler for custom date change
  const handleCustomDateChange = (e) => {
      // When custom date is set, clear preset dateRange
    setLocalFilters({ ...localFilters, customDate: e.target.value, dateRange: null });
  };
  // Handlers for location
  const handleLocationChange = (e) => {
    const { name, value } = e.target;
    setLocalFilters({ ...localFilters, [name]: value });
  }
  // Handle apply filters
  const handleApplyFilters = () => {
    onApplyFilters(localFilters);
    onClose(); // Close after applying
  };
  // Handle clear filters (calls the prop function which should reset state and close)
  const handleClearInternal = () => {
      onClearFilters(); // This should reset parent state & trigger useEffect to update local state
      // onClose(); // onClose might already be handled by parent's onClearFilters logic
  };
  // Handle close without applying
  const handleClose = () => {
    // Reset local state to reflect the currently applied filters before closing
    setLocalFilters(filters);
    onClose();
  };
  // --- End Unchanged Handlers ---


  return (
    // Modal backdrop: Full screen
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-0 md:p-4">
      {/* Modal Content: Fullscreen on mobile, constrained on desktop */}
      {/* !!! CHANGE HERE: Replaced md:w-auto with md:w-full */}
      <div className="bg-white w-full h-full md:w-full md:h-[70vh] md:max-w-[650px] md:max-h-[90vh] md:rounded-lg shadow-lg flex flex-col overflow-hidden">

        {/* Header: Title + Close Button (Fixed Top) */}
        <div className="flex justify-between items-center p-4 border-b flex-shrink-0">
          {/* ... header content ... */}
           <h2 className="text-xl md:text-2xl font-semibold">เลือกตัวกรองผลลัพธ์</h2>
           <button
             onClick={handleClose}
             className="text-gray-500 hover:text-gray-700"
           >
             <FiX size={24} />
           </button>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-grow overflow-y-auto p-4 md:p-6 space-y-4">
            {/* ... All filter sections ... */}
             {/* --- Collapsible Section: Category --- */}
              <div className="border-b pb-4">
                {/* ... category button and content ... */}
                 <button
                    onClick={() => toggleSection('category')}
                    className="flex justify-between items-center w-full font-semibold mb-3 text-left"
                    >
                    หมวดหมู่
                    {sectionsOpen.category ? <FiChevronUp size={20} /> : <FiChevronDown size={20} />}
                    </button>
                    {sectionsOpen.category && (
                    <div className="flex flex-wrap gap-4 sm:gap-6">
                        <label className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            className="w-4 h-4 accent-[#b30000]"
                            value="อาวุธปืน"
                            checked={localFilters.categories?.includes("อาวุธปืน") || false}
                            onChange={handleCategoryChange}
                        /> อาวุธปืน
                        </label>
                        <label className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            className="w-4 h-4 accent-[#b30000]"
                            value="ยาเสพติด"
                            checked={localFilters.categories?.includes("ยาเสพติด") || false}
                            onChange={handleCategoryChange}
                        /> ยาเสพติด
                        </label>
                    </div>
                    )}
              </div>

               {/* --- Collapsible Section: Date --- */}
               <div className="border-b pb-4">
                 {/* ... date button and content ... */}
                    <button
                    onClick={() => toggleSection('date')}
                    className="flex justify-between items-center w-full font-semibold mb-3 text-left"
                    >
                    วัน/เดือน/ปี
                    {sectionsOpen.date ? <FiChevronUp size={20} /> : <FiChevronDown size={20} />}
                    </button>
                    {sectionsOpen.date && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 w-full">
                        {[
                            { value: 'today', label: 'วันนี้' },
                            { value: 'last7days', label: '7 วันล่าสุด' },
                            { value: 'last1month', label: '1 เดือนล่าสุด' },
                            { value: 'last6months', label: '6 เดือนล่าสุด' },
                            { value: 'last1year', label: '1 ปีล่าสุด' },
                        ].map(option => (
                            <label key={option.value} className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                className="w-4 h-4 accent-[#b30000]"
                                value={option.value}
                                checked={localFilters.dateRange === option.value}
                                onChange={handleDateRangeChange}
                            /> {option.label}
                            </label>
                        ))}
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center">
                        <label className="font-normal w-full sm:w-auto mb-2 sm:mb-0 sm:mr-4">กำหนดเอง</label>
                        <input
                            type="text"
                            placeholder="28 ธ.ค. 22 - 10 ม.ค. 23"
                            className="p-2 border rounded-lg w-full sm:w-[60%] focus:ring-1 focus:ring-[#b30000] focus:border-[#b30000]"
                            disabled
                        />
                        </div>
                    </div>
                    )}
               </div>

               {/* --- Collapsible Section: Location --- */}
               <div className="pb-4">
                 {/* ... location button and content ... */}
                    <button
                    onClick={() => toggleSection('location')}
                    className="flex justify-between items-center w-full font-semibold mb-3 text-left"
                    >
                    จังหวัด/อำเภอ/ตำบล
                    {sectionsOpen.location ? <FiChevronUp size={20} /> : <FiChevronDown size={20} />}
                    </button>
                    {sectionsOpen.location && (
                    <div className="space-y-4">
                        <div className="flex justify-start items-center mb-2">
                        <button className="px-4 py-2 border rounded-lg bg-white hover:bg-gray-100 text-sm">
                            <FiMapPin className="inline mr-1" /> เลือกจากแผนที่
                        </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">จังหวัด</label>
                            <select name="province" value={localFilters.province || ''} onChange={handleLocationChange} className="p-2 border rounded-lg w-full focus:ring-1 focus:ring-[#b30000] focus:border-[#b30000]">
                                <option value="">กรอกหรือเลือกจังหวัด</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">อำเภอ</label>
                            <select name="district" value={localFilters.district || ''} onChange={handleLocationChange} className="p-2 border rounded-lg w-full focus:ring-1 focus:ring-[#b30000] focus:border-[#b30000]">
                                <option value="">กรอกหรือเลือกอำเภอ</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">ตำบล</label>
                            <select name="subdistrict" value={localFilters.subdistrict || ''} onChange={handleLocationChange} className="p-2 border rounded-lg w-full focus:ring-1 focus:ring-[#b30000] focus:border-[#b30000]">
                                <option value="">กรอกหรือเลือกตำบล</option>
                            </select>
                        </div>
                        </div>
                    </div>
                    )}
               </div>

        </div> {/* End Scrollable Content Area */}

        {/* Footer: Action Buttons (Fixed Bottom) */}
        <div className="flex flex-col sm:flex-row justify-between p-4 border-t gap-3 flex-shrink-0 bg-white">
          {/* ... Footer buttons ... */}
            <button
                onClick={handleClearInternal}
                className="w-full sm:w-auto px-4 py-2 border rounded-lg text-[#b30000] border-[#b30000] hover:bg-red-50 order-2 sm:order-1"
            >
                ล้างการคัดกรองทั้งหมด
            </button>
            <button
                onClick={handleApplyFilters}
                className="w-full sm:w-auto px-4 py-2 rounded-lg bg-[#b30000] text-white hover:bg-[#990000] order-1 sm:order-2"
            >
                คัดกรองผลลัพธ์
            </button>
        </div>

      </div> {/* End Modal Content */}
    </div> // End Modal Backdrop
  );
};

// --- Sample Data ---
const historyData = [
    { id: 1, date: "13/2/2568", category: "อาวุธปืน", image: "https://pngimg.com/d/glock_PNG1.png", name: "Glock", location: "นนทบุรี, บางกรวย, บางกรวย" },
    { id: 2, date: "13/2/2568", category: "ยาเสพติด", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTUj7l7g1_XNfiR0PX1g5pq1T80lnSmeiY53g&s", name: "WY", location: "กรุงเทพมหานคร, บางเขน, อนุสาวรีย์" },
    { id: 3, date: "14/2/2568", category: "อาวุธปืน", image: "https://static.vecteezy.com/system/resources/thumbnails/035/930/087/small_2x/ai-generated-m16-rifle-on-transparent-background-ai-png.png", name: "M16", location: "ชลบุรี, เมืองชลบุรี, บ้านสวน" },
    { id: 4, date: "25/7/2567", category: "ยาเสพติด", image: "https://atlas-content-cdn.pixelsquid.com/assets_v2/152/1522611222405453010/jpeg-600/G03.jpg?modifiedAt=1", name: "Meth", location: "เชียงใหม่, เมืองเชียงใหม่, สุเทพ" }, // Date within last month example
    { id: 5, date: "15/8/2567", category: "อาวุธปืน", image: "https://upload.wikimedia.org/wikipedia/commons/f/f8/AK-47.png", name: "AK-47", location: "สงขลา, หาดใหญ่, หาดใหญ่" }, // Date within last 7 days example
    { id: 6, date: "15/2/2568", category: "ยาเสพติด", image: "https://atlas-content-cdn.pixelsquid.com/stock-images/pile-of-cocaine-n1PYBL8-600.jpg", name: "Cocaine", location: "ภูเก็ต, เมืองภูเก็ต, ตลาดใหญ่" },
    { id: 7, date: "16/2/2568", category: "อาวุธปืน", image: "https://static.wikia.nocookie.net/combatarms/images/d/de/desert-eagle.png/revision/latest?cb=20130918023754", name: "Desert Eagle", location: "ขอนแก่น, เมืองขอนแก่น, ในเมือง" },
    { id: 8, date: "16/2/2568", category: "ยาเสพติด", image: "https://yourroom.health.nsw.gov.au/a-z-of-drugs/PublishingImages/Pages/fentanyl%20spoon%20image.png", name: "Heroin", location: "นครราชสีมา, เมืองนครราชสีมา, ในเมือง" },
    { id: 9, date: "17/2/2568", category: "อาวุธปืน", image: "https://pngimg.com/d/shotgun_PNG14.png", name: "Shotgun", location: "อุดรธานี, เมืองอุดรธานี, หมากแข้ง" },
    { id: 10, date: "17/2/2568", category: "ยาเสพติด", image: "https://www.drugsdata.org/images/display/1000/1891_lg.jpg", name: "Ecstasy", location: "อุบลราชธานี, เมืองอุบลราชธานี, ในเมือง" },
    { id: 11, date: "18/8/2567", category: "อาวุธปืน", image: "https://upload.wikimedia.org/wikipedia/commons/8/8c/Uzi-nobg.png", name: "Uzi", location: "นนทบุรี, ปากเกร็ด, บางตลาด" }, // Today example
    { id: 12, date: "18/8/2567", category: "ยาเสพติด", image: "https://cdn-icons-png.flaticon.com/512/1404/1404448.png", name: "LSD", location: "กรุงเทพมหานคร, จตุจักร, ลาดยาว" }, // Today example
    { id: 13, date: "19/2/2568", category: "อาวุธปืน", image: "https://pngimg.com/d/assault_rifle_PNG1444.png", name: "FN SCAR", location: "สมุทรปราการ, เมืองสมุทรปราการ, ปากน้ำ" },
    { id: 14, date: "19/2/2568", category: "ยาเสพติด", image: "https://medworksmedia.com/wp-content/uploads/2019/01/ketamine.jpg", name: "Ketamine", location: "ปทุมธานี, คลองหลวง, คลองหนึ่ง" },
    { id: 15, date: "20/2/2568", category: "อาวุธปืน", image: "https://purepng.com/public/uploads/large/purepng.com-beretta-handgunmetaldanger-401520457902j28qt.png", name: "Beretta", location: "พระนครศรีอยุธยา, พระนครศรีอยุธยา, ประตูชัย" },
    { id: 16, date: "20/2/2568", category: "ยาเสพติด", image: "https://portal.ct.gov/lib/dcp/drug_control/images/fentanyl_citrate2.png", name: "Fentanyl", location: "สระบุรี, เมืองสระบุรี, ปากเพรียว" },
    { id: 17, date: "21/2/2568", category: "อาวุธปืน", image: "https://cdn11.bigcommerce.com/s-elf64fzeok/images/stencil/1280x1280/products/158/430/image__41741.1677443031.png?c=2", name: "Sig Sauer", location: "ลพบุรี, เมืองลพบุรี, ท่าศาลา" },
    { id: 18, date: "21/2/2568", category: "ยาเสพติด", image: "https://www.grievelaw.com/Content/files/Secondary-SideImages/prescriptiondrugs.png", name: "Oxycodone", location: "นครสวรรค์, เมืองนครสวรรค์, ปากน้ำโพ" },
    { id: 19, date: "22/2/2568", category: "อาวุธปืน", image: "https://www.remarms.com/assets/imagesRA/700%20BDL/Model%20700%20DBL_300%20WIN%20MAG%2024%20Barrel%20Gloss%20Walnut_LEFT%20profile.png", name: "Remington 700", location: "พิษณุโลก, เมืองพิษณุโลก, ในเมือง" },
    { id: 20, date: "22/1/2567", category: "ยาเสพติด", image: "https://www.recoveryranchpa.com/wp-content/uploads/2022/12/What-Is-GHB-2-800x800.png", name: "GHB", location: "สุราษฎร์ธานี, เมืองสุราษฎร์ธานี, ตลาด" }, // Date within last year example
];

// --- Initial Filters ---
const initialFilters = {
    categories: [],
    dateRange: null,
    customDate: '',
    province: '',
    district: '',
    subdistrict: '',
};

// --- Main History Component ---
const History = () => {
    const navigate = useNavigate();
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [filters, setFilters] = useState(initialFilters);
    const [appliedFilters, setAppliedFilters] = useState(initialFilters);
    const [filteredData, setFilteredData] = useState(historyData);
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // --- Filtering Logic ---
    useEffect(() => {
        let data = [...historyData]; // Start with original data

        // 1. Filter by Category
        if (appliedFilters.categories && appliedFilters.categories.length > 0) {
            data = data.filter(item => appliedFilters.categories.includes(item.category));
        }

        // 2. Filter by Date
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);

        if (appliedFilters.dateRange) {
          let startDate = new Date(today);
          switch (appliedFilters.dateRange) {
              case 'today':
                  // Start date is already today
                  break;
              case 'last7days':
                  startDate.setUTCDate(today.getUTCDate() - 7);
                  break;
              case 'last1month':
                  startDate.setUTCMonth(today.getUTCMonth() - 1);
                  break;
              case 'last6months':
                   startDate.setUTCMonth(today.getUTCMonth() - 6);
                  break;
              case 'last1year':
                  startDate.setUTCFullYear(today.getUTCFullYear() - 1);
                  break;
              default:
                  startDate = null;
          }

          if (startDate) {
            // Filter items with date >= startDate and <= today
            data = data.filter(item => {
               const itemDate = parseDateBE(item.date);
               return itemDate && itemDate >= startDate && itemDate <= today;
           });
       }
      } else if (appliedFilters.customDate) {
        // Custom date filter (match exact day) - Needs refinement if using a range picker
        try {
            // Parse custom date input 'YYYY-MM-DD' as UTC
            const [year, month, day] = appliedFilters.customDate.split('-').map(Number);
            const customDateUTC = new Date(Date.UTC(year, month - 1, day));

            if (!isNaN(customDateUTC)) {
                 data = data.filter(item => {
                    const itemDate = parseDateBE(item.date);
                    // Compare year, month, day
                    return itemDate &&
                           itemDate.getUTCFullYear() === customDateUTC.getUTCFullYear() &&
                           itemDate.getUTCMonth() === customDateUTC.getUTCMonth() &&
                           itemDate.getUTCDate() === customDateUTC.getUTCDate();
                });
            }
        } catch (e) {
            console.error("Error parsing custom date:", e);
            // Handle case where customDate might be invalid format
        }
    }

        // 3. Filter by Location (Simple substring match for now)
        if (appliedFilters.province) {
             data = data.filter(item => item.location.toLowerCase().includes(appliedFilters.province.toLowerCase()));
        }
        if (appliedFilters.district) {
             data = data.filter(item => item.location.toLowerCase().includes(appliedFilters.district.toLowerCase()));
        }
        if (appliedFilters.subdistrict) {
             data = data.filter(item => item.location.toLowerCase().includes(appliedFilters.subdistrict.toLowerCase()));
        }

        setFilteredData(data);
        setCurrentPage(1); // Reset page when filters change
    }, [appliedFilters]); // Depends only on appliedFilters

    // --- Unchanged Helper function to generate readable filter label ---
    const getFilterLabels = () => {
      const labels = [];
      if (appliedFilters.categories && appliedFilters.categories.length > 0) {
          appliedFilters.categories.forEach(cat => { labels.push({ type: 'category', value: cat, label: cat }); });
      }
      if (appliedFilters.dateRange) {
          const dateLabels = { 'today': 'วันนี้', 'last7days': '7 วันล่าสุด', 'last1month': '1 เดือนล่าสุด', 'last6months': '6 เดือนล่าสุด', 'last1year': '1 ปีล่าสุด' };
          labels.push({ type: 'date', value: appliedFilters.dateRange, label: dateLabels[appliedFilters.dateRange] });
      } else if (appliedFilters.customDate) {
          try { /* Simplified display */ labels.push({ type: 'date', value: 'custom', label: `วันที่: ${appliedFilters.customDate}` }); } catch (e) {}
      }
      if (appliedFilters.province) { labels.push({ type: 'location', value: 'province', label: `จังหวัด: ${appliedFilters.province}` }); }
      if (appliedFilters.district) { labels.push({ type: 'location', value: 'district', label: `อำเภอ: ${appliedFilters.district}` }); }
      if (appliedFilters.subdistrict) { labels.push({ type: 'location', value: 'subdistrict', label: `ตำบล: ${appliedFilters.subdistrict}` }); }
      return labels;
    };

    // --- Unchanged Remove a single filter tag ---
    const removeFilter = (type, value) => {
        const newFilters = { ...appliedFilters };
        if (type === 'category') { newFilters.categories = newFilters.categories.filter(cat => cat !== value); }
        else if (type === 'date') { if (value === 'custom') { newFilters.customDate = ''; } else { newFilters.dateRange = null; } }
        else if (type === 'location') { newFilters[value] = ''; }
        setAppliedFilters(newFilters); // Apply the change immediately
        setFilters(newFilters); // Keep the popup state consistent
    };

    // --- Unchanged Pagination Calculations ---
    const totalPages = Math.ceil(filteredData.length / rowsPerPage);
    const indexOfLastItem = currentPage * rowsPerPage;
    const indexOfFirstItem = indexOfLastItem - rowsPerPage;
    const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

    // --- Unchanged Event Handlers ---
    const handlePageChange = (pageNumber) => {
        if (pageNumber < 1 || pageNumber > totalPages) return;
        setCurrentPage(pageNumber);
    };
    const handleRowsPerPageChange = (e) => {
        setRowsPerPage(parseInt(e.target.value));
        setCurrentPage(1);
    };

    // --- Modified Filter Handlers ---
    // Called when FilterPopup's internal state changes (before applying)
    const handleFilterChange = useCallback((newLocalFilters) => {
        // This might not be strictly needed if FilterPopup manages its own local state effectively
        // setFilters(newLocalFilters); // Update the state passed *into* the popup
    }, []);

    // Called when clicking "คัดกรองผลลัพธ์" in FilterPopup
    const handleApplyFilters = useCallback((newAppliedFilters) => {
        setAppliedFilters(newAppliedFilters); // Set the active filters
        setFilters(newAppliedFilters); // Sync the state for the popup for next open
        // setIsFilterOpen(false); // Closing is handled within FilterPopup now
    }, []);

    // Called when clicking "ล้างการคัดกรองทั้งหมด" in FilterPopup
    const handleClearFilters = useCallback(() => {
        setAppliedFilters(initialFilters); // Clear active filters
        setFilters(initialFilters); // Clear state for the popup
        setIsFilterOpen(false); // Ensure popup closes
    }, []);

    // --- Unchanged Filter Tags Component ---
    const FilterTags = ({ labels, onRemove }) => {
        if (labels.length === 0) return null;
        return (
            <div className="flex flex-wrap gap-2 mb-4 px-4 md:px-6"> {/* Adjusted padding */}
                {labels.map((item, index) => (
                    <div key={`${item.type}-${item.value}-${index}`} className="flex items-center bg-gray-100 rounded-full px-3 py-1 text-sm">
                        <span>{item.label}</span>
                        <button onClick={() => onRemove(item.type, item.value)} className="ml-2 text-gray-500 hover:text-red-500"> <FiX size={16} /> </button>
                    </div>
                ))}
            </div>
        );
    };

    const handleViewDetail = (item) => {
        navigate('/history/detail', { state: { item } })
    };
// ก่อน JSX เพิ่ม hook สำหรับ role
    const [userRole, setUserRole] = useState('');

    useEffect(() => {
    const role = localStorage.getItem('userRole');
    setUserRole(role);
    }, []);

    // --- JSX Structure (Mobile/Desktop Layouts) ---
    return (
        <div className="w-full h-full">
            {/* --- Mobile Display --- */}
            <div className="md:hidden">
                 {/* Headers */}
                <div className="px-4 py-3 flex items-center justify-center relative shadow-[0_1.5px_4px_rgba(0,0,0,0.2)]">
                  <button className="absolute left-4"> <FiArrowLeft size={24} /> </button>
                  <h1 className="text-lg font-bold text-center flex-1">ประวัติการพบวัตถุพยาน</h1>
                </div>
                <div className="px-4 sm:px-6 pt-4 flex justify-between items-center mb-4">
  <button
    onClick={() => setIsFilterOpen(true)}
    className="flex items-center gap-2 px-3 py-2 border rounded bg-white hover:bg-gray-100 text-sm"
  >
    <FiFilter size={16} /> ตัวกรอง
  </button>

  {/* ✅ แสดงเฉพาะ admin */}
  {userRole === 'admin' && (
    <button
      className="flex items-center gap-1 px-2 py-2 rounded bg-[#b30000] text-white hover:bg-[#990000]"
    >
      <FiPlus size={16} />
    </button>
  )}
</div>


                {/* Render FilterPopup */}
                <FilterPopup
                    isOpen={isFilterOpen}
                    onClose={() => setIsFilterOpen(false)}
                    filters={filters} // Pass the current non-applied filters state
                    onFilterChange={handleFilterChange} // Propagate changes (optional)
                    onApplyFilters={handleApplyFilters} // Handle apply action
                    onClearFilters={handleClearFilters}  // Handle clear action
                />

                {/* Render Filter Tags based on appliedFilters */}
                <FilterTags labels={getFilterLabels()} onRemove={removeFilter} />

                {/* Cards */}
                <div className="pr-4 pb-32 pl-4 grid grid-cols-1 gap-4">
                {currentItems.length > 0 ? (
                    currentItems.map((item) => (
                    <div key={item.id || item.name + item.date} className="border rounded-lg p-4 shadow bg-white flex flex-row items-start space-x-4 relative">
                        {/* รูปภาพด้านซ้าย */}
                        <div className="w-1/4 min-w-24">
                        <img src={item.image} alt={item.name} className="w-full h-32 object-contain" />
                        </div>
                        
                        {/* เนื้อหาด้านขวา */}
                        <div className="flex-1 flex flex-col">
                        <div className="font-bold text-md">{item.name}</div>
                        
                        {/* ข้อมูลเดิม */}
                        <div className="flex items-center gap-2 text-gray-600 text-sm mt-2"> 
                            <FiTag /> {item.category} 
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 text-sm"> 
                            <FiCalendar /> {item.date} 
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 text-sm"> 
                            <FiMapPin /> {item.location} 
                        </div>
                        
                        {/* ปุ่มด้านขวาล่าง */}
                        <div className="pt-2 w-full flex justify-end mt-auto">
                            <button 
                            onClick={() => handleViewDetail(item)} 
                            className="px-3 py-1 bg-[#7a0000] text-white rounded hover:bg-[#5a0000] text-xs"
                            > 
                            ดูรายละเอียด 
                            </button>
                        </div>
                        </div>
                    </div>
                    ))
                ) : (
                    <div className="text-center text-gray-500 py-10 col-span-1">ไม่พบข้อมูลตามตัวกรอง</div>
                )}
                </div>

                {/* Mobile Pagination */}
                {filteredData.length > 0 && (
                 <div className="fixed bottom-16 left-0 right-0 bg-white shadow-md p-2 flex flex-col border-t">
                     <div className="flex justify-between items-center pt-1">
                         <div className="text-gray-600 text-xs sm:text-sm pl-2"> {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredData.length)} จาก {filteredData.length} </div>
                         <div className="flex items-center text-gray-600 text-xs sm:text-sm"> <span className="mr-1 sm:mr-2">แถว:</span> <select className="bg-transparent border rounded px-1 sm:px-2 py-1 text-gray-600 text-xs sm:text-sm focus:outline-none cursor-pointer" value={rowsPerPage} onChange={handleRowsPerPageChange}> <option value="5">5</option> <option value="10">10</option> <option value="20">20</option> </select> </div>
                         <div className="flex items-center gap-1 sm:gap-2 pr-2"> <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className={`p-1 rounded ${currentPage === 1 ? "text-gray-400 cursor-not-allowed" : "text-gray-600 hover:bg-gray-100"}`}> <FiChevronLeft size={18} /> </button> <span className="font-medium text-xs sm:text-sm">{currentPage}/{totalPages}</span> <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className={`p-1 rounded ${currentPage === totalPages ? "text-gray-400 cursor-not-allowed" : "text-gray-600 hover:bg-gray-100"}`}> <FiChevronRight size={18} /> </button> </div>
                     </div>
                 </div>
                 )}
            </div>

            {/* --- Desktop Display --- */}
            <div className="hidden md:block h-full">
                <div className="h-full w-full flex flex-col overflow-hidden">
                    <div className="px-6 py-4 flex justify-between items-center flex-shrink-0">
                    <h1 className="text-xl font-bold">ประวัติการพบวัตถุพยาน</h1>
                    </div>
                    <div className="px-6 flex justify-between items-center mb-4 flex-shrink-0">
  <button
    onClick={() => setIsFilterOpen(true)}
    className="flex items-center gap-2 px-4 py-2 border rounded bg-white hover:bg-gray-100"
  >
    <FiFilter size={18} /> ตัวกรอง
  </button>

  {/* ✅ แสดงเฉพาะ admin */}
  {userRole === 'admin' && (
    <button
      className="flex items-center gap-2 px-4 py-2 rounded bg-[#b30000] text-white hover:bg-[#990000]"
    >
      <FiPlus size={18} />
      <b>เพิ่มประวัติการค้นพบ</b>
    </button>
  )}
</div>

                    {/* Render FilterPopup */}
                    <FilterPopup
                    isOpen={isFilterOpen}
                    onClose={() => setIsFilterOpen(false)}
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    onApplyFilters={handleApplyFilters}
                    onClearFilters={handleClearFilters}
                    />
                    {/* Render Filter Tags based on appliedFilters */}
                    <FilterTags labels={getFilterLabels()} onRemove={removeFilter} />
                    {/* Table Container */}
                    <div className="px-6 pb-6 flex flex-col flex-grow overflow-hidden">
                    <div className="bg-white rounded shadow-md flex flex-col flex-grow overflow-hidden">
                        <div className="flex-grow overflow-auto">
                        <table className="w-full table-fixed border-collapse">
                            <thead>
                            <tr className="bg-gray-200 sticky top-0 z-10">
                                <th className="p-3 text-left w-[15%] font-semibold">วัน/เดือน/ปี</th>
                                <th className="p-3 text-left w-[15%] font-semibold">หมวดหมู่</th>
                                <th className="p-3 text-left w-[10%] font-semibold">รูปภาพ</th>
                                <th className="p-3 text-left w-[20%] font-semibold">ชื่อ</th>
                                <th className="p-3 text-left w-[25%] font-semibold">สถานที่พบ</th>
                                <th className="p-3 text-left w-[15%] font-semibold">การจัดการ</th>
                            </tr>
                            </thead>
                            {currentItems.length > 0 ? (
                            <tbody>
                                {currentItems.map((item) => (
                                <tr key={item.id || item.name + item.date} className="border-t hover:bg-red-50 transition-colors">
                                    <td className="p-3 align-top">{item.date}</td>
                                    <td className="p-3 align-top">{item.category}</td>
                                    <td className="p-3 align-top">
                                    <img src={item.image} alt={item.name} className="w-12 h-12 object-contain" />
                                    </td>
                                    <td className="p-3 align-top">{item.name}</td>
                                    <td className="p-3 align-top">{item.location}</td>
                                    <td className="p-3 align-top">
                                    <div className="flex gap-1">
                                        <button title="ดูรายละเอียด" onClick={() => handleViewDetail(item)} className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded">
                                        <FiEye size={18} />
                                        </button>
                                        <button title="แก้ไข" className="p-1 text-yellow-600 hover:text-yellow-800 hover:bg-yellow-100 rounded">
                                        <FiEdit size={18} />
                                        </button>
                                        <button title="ลบ" className="p-1 text-red-600 hover:text-red-800 hover:bg-red-100 rounded">
                                        <FiTrash size={18} />
                                        </button>
                                    </div>
                                    </td>
                                </tr>
                                ))}
                            </tbody>
                            ) : (
                            <tbody>
                                <tr>
                                <td colSpan="6" className="text-center text-gray-500 py-10">
                                    ไม่พบข้อมูลตามตัวกรอง
                                </td>
                                </tr>
                            </tbody>
                            )}
                        </table>
                        </div>
                    </div>
                                            {/* Desktop Pagination */}
                                            {filteredData.length > 0 && (
                        <div className="w-full bg-[#e6f0fa] py-2 px-4 flex justify-between items-center text-sm text-gray-700 font-medium rounded-b-lg border-t flex-shrink-0">
                            <span className="text-gray-600">
                            {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredData.length)} จาก {filteredData.length}
                            </span>
                            <div className="flex items-center text-gray-600">
                            <span className="mr-2">แถว ต่อ หน้า:</span>
                            <select className="bg-transparent border-none text-gray-600 font-semibold focus:outline-none cursor-pointer" value={rowsPerPage} onChange={handleRowsPerPageChange}>
                                <option value="5">5</option>
                                <option value="10">10</option>
                                <option value="20">20</option>
                            </select>
                            </div>
                            <div className="flex items-center gap-1">
                            <button title="หน้าแรก" onClick={() => handlePageChange(1)} disabled={currentPage === 1} className={`p-1 rounded ${currentPage === 1 ? "text-gray-400 cursor-not-allowed" : "text-gray-600 hover:bg-gray-200"}`}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M8.354 1.646a.5.5 0 0 0-.708 0l-6 6a.5.5 0 0 0 0 .708l6 6a.5.5 0 0 0 .708-.708L2.707 8l5.647-5.646a.5.5 0 0 0 0-.708"/>
                                <path d="M12.354 1.646a.5.5 0 0 0-.708 0l-6 6a.5.5 0 0 0 0 .708l6 6a.5.5 0 0 0 .708-.708L6.707 8l5.647-5.646a.5.5 0 0 0 0-.708"/>
                                </svg>
                            </button>
                            <button title="หน้าก่อน" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className={`p-1 rounded ${currentPage === 1 ? "text-gray-400 cursor-not-allowed" : "text-gray-600 hover:bg-gray-200"}`}>
                                <FiChevronLeft size={16} />
                            </button>
                            <span className="font-semibold px-1">
                                <span className="text-black">{currentPage}</span>
                                <span className="px-1 text-gray-400">/</span>
                                <span className="text-gray-500">{totalPages}</span>
                            </span>
                            <button title="หน้าถัดไป" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className={`p-1 rounded ${currentPage === totalPages ? "text-gray-400 cursor-not-allowed" : "text-gray-600 hover:bg-gray-200"}`}>
                                <FiChevronRight size={16} />
                            </button>
                            <button title="หน้าสุดท้าย" onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages} className={`p-1 rounded ${currentPage === totalPages ? "text-gray-400 cursor-not-allowed" : "text-gray-600 hover:bg-gray-200"}`}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M3.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L9.293 8 3.646 2.354a.5.5 0 0 1 0-.708"/>
                                <path d="M7.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L13.293 8 7.646 2.354a.5.5 0 0 1 0-.708"/>
                                </svg>
                            </button>
                            </div>
                        </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default History;