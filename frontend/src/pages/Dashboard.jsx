import { useState, useEffect } from "react";
import { Bar, Line, Doughnut, Pie, Radar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Tooltip, Legend, RadialLinearScale } from "chart.js";
import { api } from "../config/api";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
  RadialLinearScale
);

const chartColors = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#6366F1", "#EC4899", "#8B5CF6", "#D946EF", "#FBBF24", "#22C55E"];

const Statistics = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState("monthly"); // daily, weekly, monthly, yearly
  const [detailedStats, setDetailedStats] = useState({
    // Overview data
    evidenceSummary: {},
    geographicData: {},
    timeSeriesData: [],
    categoryDistribution: {},
    
    // Detailed analytics
    topProvinces: [],
    monthlyTrends: [],
    categoryComparison: {},
    aiConfidenceAnalysis: {},
    discoveryPatterns: {},
    
    // Firearms specific
    firearmsData: {
      brands: [],
      mechanisms: [],
      ammunition: [],
      geographic: {},
      timeline: []
    },
    
    // Narcotics specific
    narcoticsData: {
      drugTypes: [],
      chemicalCompounds: [],
      drugForms: [],
      geographic: {},
      timeline: []
    }
  });

  // Enhanced data fetching functions
  const fetchDetailedOverviewData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all overview statistics
      const [
        overviewResponse,
        timeSeriesResponse,
        geographicResponse,
        summaryResponse
      ] = await Promise.all([
        api.get("/api/statistics/overview"),
        api.get(`/api/statistics/time-series?period=${dateRange}`),
        api.get("/api/statistics/geographic"),
        api.get("/api/statistics/summary")
      ]);

      const overviewData = overviewResponse.data;
      const timeSeriesData = timeSeriesResponse.data;
      const geographicData = geographicResponse.data;
      const summaryData = summaryResponse.data;

      // Process enhanced data
      processEnhancedOverviewData(overviewData, timeSeriesData, geographicData, summaryData);

    } catch (err) {
      console.error("Error fetching detailed overview data:", err);
      setError("ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
    }
  };

  const processEnhancedOverviewData = (overviewData, timeSeriesData, geographicData, summaryData) => {
    const evidenceSummary = overviewData.evidence_summary || {};
    const geographic = geographicData.data || {};
    const timeSeries = timeSeriesData.data || [];

    // Process top provinces with detailed stats
    const provinceData = geographic.by_province || [];
    const topProvinces = provinceData.slice(0, 15).map(province => ({
      name: province.province,
      count: province.count,
      percentage: provinceData.length > 0 ? ((province.count / provinceData.reduce((sum, p) => sum + p.count, 0)) * 100).toFixed(1) : 0
    }));

    // Process monthly trends
    const monthlyTrends = timeSeries.map(item => ({
      period: item.period,
      count: item.count,
      date: new Date(item.period)
    })).sort((a, b) => a.date - b.date);

    // Calculate category comparison
    const categoryComparison = {
      firearms: {
        count: evidenceSummary.firearms?.value || 0,
        percentage: evidenceSummary.firearms?.percentage || 0,
        change: evidenceSummary.firearms?.change_percentage || 0
      },
      narcotics: {
        count: evidenceSummary.narcotics?.value || 0,
        percentage: evidenceSummary.narcotics?.percentage || 0,
        change: evidenceSummary.narcotics?.change_percentage || 0
      },
      others: {
        count: evidenceSummary.others?.value || 0,
        percentage: evidenceSummary.others?.percentage || 0,
        change: evidenceSummary.others?.change_percentage || 0
      }
    };

    // AI Confidence Analysis
    const aiConfidenceAnalysis = {
      average: evidenceSummary.ai_confidence_avg || 0,
      distribution: [
        { range: "90-100%", count: 0, color: "#10B981" },
        { range: "80-89%", count: 0, color: "#3B82F6" },
        { range: "70-79%", count: 0, color: "#F59E0B" },
        { range: "60-69%", count: 0, color: "#EF4444" },
        { range: "<60%", count: 0, color: "#6B7280" }
      ]
    };

    setDetailedStats(prev => ({
      ...prev,
      evidenceSummary,
      geographicData: geographic,
      timeSeriesData: timeSeries,
      topProvinces,
      monthlyTrends,
      categoryComparison,
      aiConfidenceAnalysis
    }));
  };

  const fetchDetailedFirearmsData = async () => {
    try {
      setLoading(true);
      
      const [
        firearmsResponse,
        brandsResponse,
        mechanismsResponse,
        ammunitionResponse,
        firearmsGeoResponse,
        firearmsTimeResponse
      ] = await Promise.all([
        api.get("/api/statistics/firearms"),
        api.get("/api/statistics/firearms/brands"),
        api.get("/api/statistics/firearms/mechanisms"),
        api.get("/api/statistics/firearms/ammunition"),
        api.get("/api/statistics/firearms/geographic"),
        api.get("/api/statistics/time-series?period=monthly&category=อาวุธปืน")
      ]);

      const firearmsData = {
        brands: brandsResponse.data.data?.brands || [],
        mechanisms: mechanismsResponse.data.data || [],
        ammunition: ammunitionResponse.data.data || {},
        geographic: firearmsGeoResponse.data.data || {},
        timeline: firearmsTimeResponse.data.data || [],
        analytics: firearmsResponse.data
      };

      setDetailedStats(prev => ({
        ...prev,
        firearmsData
      }));

    } catch (err) {
      console.error("Error fetching detailed firearms data:", err);
      setError("ไม่สามารถโหลดข้อมูลอาวุธปืนได้");
    } finally {
      setLoading(false);
    }
  };

  const fetchDetailedNarcoticsData = async () => {
    try {
      setLoading(true);
      
      const [
        narcoticsResponse,
        drugTypesResponse,
        drugFormsResponse,
        chemicalsResponse,
        narcoticsGeoResponse,
        narcoticsTimeResponse
      ] = await Promise.all([
        api.get("/api/statistics/narcotics"),
        api.get("/api/statistics/narcotics/drug-types"),
        api.get("/api/statistics/narcotics/forms"),
        api.get("/api/statistics/narcotics/chemicals"),
        api.get("/api/statistics/narcotics/geographic"),
        api.get("/api/statistics/time-series?period=monthly&category=ยาเสพติด")
      ]);

      const narcoticsData = {
        drugTypes: drugTypesResponse.data.data || [],
        drugForms: drugFormsResponse.data.data || [],
        chemicalCompounds: chemicalsResponse.data.data || [],
        geographic: narcoticsGeoResponse.data.data || {},
        timeline: narcoticsTimeResponse.data.data || [],
        analytics: narcoticsResponse.data
      };

      setDetailedStats(prev => ({
        ...prev,
        narcoticsData
      }));

    } catch (err) {
      console.error("Error fetching detailed narcotics data:", err);
      setError("ไม่สามารถโหลดข้อมูลยาเสพติดได้");
    } finally {
      setLoading(false);
    }
  };

  // Enhanced UI Components - ใช้ style แบบเดิม
  const StatCard = ({ title, value, subValue, change, icon, color = "blue", trend = null }) => (
    <div className="p-3 bg-white shadow rounded flex items-center hover:shadow-md transition-shadow duration-200">
      <div className="mr-2 md:mr-3">
        {typeof icon === 'string' ? (
          <img src={icon} alt={title} className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 object-contain" />
        ) : (
          <div className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 flex items-center justify-center">
            {icon}
          </div>
        )}
      </div>
      <div className="flex flex-col flex-1 min-w-0">
        <p className="text-xs text-gray-600 truncate">{title}</p>
        <p className="text-sm md:text-base font-bold">{value}</p>
        {subValue && <p className="text-xs text-gray-500">{subValue}</p>}
        {change && (
          <p className={`text-xs ${change.toString().startsWith('+') ? "text-green-600" : "text-red-600"}`}>
            {change}
          </p>
        )}
      </div>
    </div>
  );

  const DetailedChart = ({ title, children, fullWidth = false, height = "h-80" }) => (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 ${fullWidth ? 'col-span-full' : ''} ${height}`}>
      <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
      <div className="h-full pb-8">
        {children}
      </div>
    </div>
  );

  // Chart data preparations
  const getTopProvincesBarData = () => ({
    labels: detailedStats.topProvinces.slice(0, 10).map(p => p.name),
    datasets: [{
      label: 'จำนวนครั้ง',
      data: detailedStats.topProvinces.slice(0, 10).map(p => p.count),
      backgroundColor: chartColors[0],
      borderColor: chartColors[0],
      borderWidth: 1
    }]
  });

  const getMonthlyTrendsLineData = () => ({
    labels: detailedStats.monthlyTrends.map(item => 
      new Date(item.period).toLocaleDateString('th-TH', { month: 'short', year: '2-digit' })
    ),
    datasets: [{
      label: 'จำนวนการค้นพบ',
      data: detailedStats.monthlyTrends.map(item => item.count),
      borderColor: chartColors[1],
      backgroundColor: `${chartColors[1]}20`,
      fill: true,
      tension: 0.4
    }]
  });

  const getCategoryComparisonData = () => {
    const { categoryComparison } = detailedStats;
    return {
      labels: ['อาวุธปืน', 'ยาเสพติด', 'อื่นๆ'],
      datasets: [{
        data: [
          categoryComparison.firearms?.count || 0,
          categoryComparison.narcotics?.count || 0,
          categoryComparison.others?.count || 0
        ],
        backgroundColor: [chartColors[0], chartColors[1], chartColors[2]],
        borderWidth: 2
      }]
    };
  };

  const getFirearmsBrandData = () => ({
    labels: detailedStats.firearmsData.brands.slice(0, 8).map(b => b.brand),
    datasets: [{
      label: 'จำนวน',
      data: detailedStats.firearmsData.brands.slice(0, 8).map(b => b.count),
      backgroundColor: chartColors.slice(0, 8),
      borderWidth: 1
    }]
  });

  const getDrugTypesData = () => ({
    labels: detailedStats.narcoticsData.drugTypes.slice(0, 6).map(d => d.drug_type),
    datasets: [{
      data: detailedStats.narcoticsData.drugTypes.slice(0, 6).map(d => d.count),
      backgroundColor: chartColors.slice(0, 6),
      borderWidth: 2
    }]
  });

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: { padding: 20, usePointStyle: true }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1
      }
    }
  };

  const barOptions = {
    ...chartOptions,
    scales: {
      x: {
        grid: { display: false },
        ticks: { maxRotation: 45, minRotation: 45 }
      },
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0, 0, 0, 0.1)' }
      }
    }
  };

  // Event handlers
  useEffect(() => {
    if (activeTab === "overview") {
      fetchDetailedOverviewData();
    } else if (activeTab === "gun") {
      fetchDetailedFirearmsData();
    } else if (activeTab === "drugs") {
      fetchDetailedNarcoticsData();
    }
  }, [activeTab, dateRange]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const formatNumber = (num) => {
    return typeof num === 'number' ? num.toLocaleString('th-TH') : num;
  };

  if (loading) {
    return (
      <div className="flex-1 flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">กำลังโหลดข้อมูลสถิติ...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex justify-center items-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => {
              if (activeTab === "overview") fetchDetailedOverviewData();
              else if (activeTab === "gun") fetchDetailedFirearmsData();
              else if (activeTab === "drugs") fetchDetailedNarcoticsData();
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            ลองใหม่
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto">
      <div className="h-full w-full bg-[#F8F9FA] flex flex-col overflow-hidden">
        <div className="px-6 py-4 flex justify-between items-center flex-shrink-0">
          <h1 className="text-xl font-bold">แดชบอร์ดสถิติ</h1>
          <div className="flex items-center space-x-4">
            <select 
              value={dateRange} 
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="daily">รายวัน</option>
              <option value="weekly">รายสัปดาห์</option>
              <option value="monthly">รายเดือน</option>
              <option value="yearly">รายปี</option>
            </select>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto px-6">
          {/* Tab Navigation - แก้ไข syntax error */}
          <div className="flex space-x-4 md:space-x-6 mb-4 border-b overflow-x-auto no-scrollbar">
            {[
              {
              key: "overview",
              label: "ภาพรวม"
            },
            {
              key: "gun",
              label: "อาวุธปืน"
            },
            {
              key: "drugs",
              label: "ยาเสพติด"
            }
          ].map((tab) => (
            <div
              key={tab.key}
              className={`cursor-pointer pb-2 text-center transition-all whitespace-nowrap px-2 ${
                activeTab === tab.key ? "border-b-2 border-red-800 font-semibold" : "text-gray-600"
              }`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </div>
          ))}
          </div>

          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Summary Cards - ใช้ style แบบเดิม */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 mb-4 lg:grid-cols-4">
                <StatCard
                  title="ของกลางทั้งหมด"
                  value={formatNumber(detailedStats.evidenceSummary.total_evidence?.value || 0)}
                  change={`+${detailedStats.evidenceSummary.total_evidence?.change_percentage?.toFixed(1) || '0.0'}%`}
                  icon="/Img/icon/all.png"
                />
                <StatCard
                  title="อาวุธปืน"
                  value={formatNumber(detailedStats.evidenceSummary.firearms?.value || 0)}
                  subValue={`${detailedStats.evidenceSummary.firearms?.percentage?.toFixed(1) || 0}% ของทั้งหมด`}
                  icon="/Img/icon/gun.png"
                />
                <StatCard
                  title="ยาเสพติด"
                  value={formatNumber(detailedStats.evidenceSummary.narcotics?.value || 0)}
                  subValue={`${detailedStats.evidenceSummary.narcotics?.percentage?.toFixed(1) || 0}% ของทั้งหมด`}
                  icon="/Img/icon/drug.png"
                />
                <StatCard
                  title="ความมั่นใจ AI"
                  value={`${detailedStats.evidenceSummary.ai_confidence_avg?.toFixed(1) || 0}%`}
                  subValue="ค่าเฉลี่ยทั้งหมด"
                  icon={<div className="w-full h-full bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-600 font-bold text-xs">AI</span>
                  </div>}
                />
              </div>

              {/* Charts Grid */}
              <div className="grid grid-cols-1 gap-3 md:gap-4 lg:grid-cols-3 pb-16 md:pb-6">
                <div className="p-3 bg-white shadow rounded lg:col-span-2 h-60 sm:h-72 md:h-80 lg:h-[300px] hover:shadow-md transition-shadow duration-200 overflow-hidden">
                  <div className="h-full w-full flex flex-col">
                    <h3 className="text-sm font-semibold text-gray-700 mb-1 flex-shrink-0">Top 10 จังหวัดที่พบของกลางมากที่สุด</h3>
                    <div className="flex-grow relative w-full">
                      <Bar data={getTopProvincesBarData()} options={barOptions} />
                    </div>
                  </div>
                </div>
                
                <div className="p-3 bg-white shadow rounded h-44 sm:h-48 md:h-56 lg:h-[240px] hover:shadow-md transition-shadow duration-200 overflow-hidden">
                  <div className="h-full w-full flex flex-col">
                    <h3 className="text-sm font-semibold text-gray-700 mb-1 flex-shrink-0">แนวโน้มการค้นพบรายเดือน</h3>
                    <div className="flex-grow relative w-full">
                      <Line data={getMonthlyTrendsLineData()} options={chartOptions} />
                    </div>
                  </div>
                </div>
                
                <div className="p-3 bg-white shadow rounded h-44 sm:h-48 md:h-56 lg:h-[240px] hover:shadow-md transition-shadow duration-200 overflow-hidden">
                  <div className="h-full w-full flex flex-col">
                    <h3 className="text-sm font-semibold text-gray-700 mb-1 flex-shrink-0">สัดส่วนประเภทของกลาง</h3>
                    <div className="flex-grow relative w-full">
                      <Doughnut data={getCategoryComparisonData()} options={chartOptions} />
                    </div>
                  </div>
                </div>

                {/* Detailed Analysis Cards */}
                <div className="p-3 bg-white shadow rounded hover:shadow-md transition-shadow duration-200 lg:col-span-2">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">การกระจายตามจังหวัด</h3>
                  <div className="space-y-2">
                    {detailedStats.topProvinces.slice(0, 8).map((province, index) => (
                      <div key={province.name} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <span className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium mr-2">
                            {index + 1}
                          </span>
                          <span className="text-xs font-medium">{province.name}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-bold">{formatNumber(province.count)}</span>
                          <span className="text-xs text-gray-500 ml-1">({province.percentage}%)</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="p-3 bg-white shadow rounded hover:shadow-md transition-shadow duration-200">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">สถิติประจำเดือน</h3>
                  <div className="space-y-2">
                    {detailedStats.monthlyTrends.slice(-5).map((trend, index) => (
                      <div key={trend.period} className="flex items-center justify-between py-1 border-b border-gray-100 last:border-b-0">
                        <span className="text-xs text-gray-600">
                          {new Date(trend.period).toLocaleDateString('th-TH', { month: 'short', year: '2-digit' })}
                        </span>
                        <span className="text-xs font-semibold">{formatNumber(trend.count)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Firearms Tab */}
          {activeTab === "gun" && (
            <div className="space-y-4">
              {/* Firearms Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 mb-4 lg:grid-cols-3">
                <StatCard
                  title="อาวุธปืนทั้งหมด"
                  value={formatNumber(detailedStats.firearmsData.analytics?.brands?.brands?.reduce((sum, b) => sum + b.count, 0) || 0)}
                  icon="/Img/icon/gun.png"
                />
                <StatCard
                  title="ยี่ห้อยอดนิยม"
                  value={detailedStats.firearmsData.brands[0]?.brand || 'ไม่มีข้อมูล'}
                  subValue={`${detailedStats.firearmsData.brands[0]?.count || 0} ชิ้น`}
                  icon="/Img/icon/gun.png"
                />
                <StatCard
                  title="กลไกยอดนิยม"
                  value={detailedStats.firearmsData.mechanisms[0]?.mechanism || 'ไม่มีข้อมูล'}
                  subValue={`${detailedStats.firearmsData.mechanisms[0]?.count || 0} ชิ้น`}
                  icon="/Img/icon/gun.png"
                />
              </div>

              {/* Firearms Charts */}
              <div className="grid grid-cols-1 gap-3 md:gap-4 lg:grid-cols-2 pb-16 md:pb-6">
                <div className="p-3 bg-white shadow rounded h-60 sm:h-72 md:h-80 hover:shadow-md transition-shadow duration-200 overflow-hidden">
                  <div className="h-full w-full flex flex-col">
                    <h3 className="text-sm font-semibold text-gray-700 mb-1 flex-shrink-0">การกระจายตามยี่ห้อ</h3>
                    <div className="flex-grow relative w-full">
                      <Bar data={getFirearmsBrandData()} options={barOptions} />
                    </div>
                  </div>
                </div>
                
                <div className="p-3 bg-white shadow rounded h-60 sm:h-72 md:h-80 hover:shadow-md transition-shadow duration-200 overflow-hidden">
                  <div className="h-full w-full flex flex-col">
                    <h3 className="text-sm font-semibold text-gray-700 mb-1 flex-shrink-0">การกระจายตามกลไก</h3>
                    <div className="flex-grow relative w-full">
                      <Doughnut 
                        data={{
                          labels: detailedStats.firearmsData.mechanisms.map(m => m.mechanism),
                          datasets: [{
                            data: detailedStats.firearmsData.mechanisms.map(m => m.count),
                            backgroundColor: chartColors.slice(0, detailedStats.firearmsData.mechanisms.length)
                          }]
                        }} 
                        options={chartOptions} 
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Narcotics Tab */}
          {activeTab === "drugs" && (
            <div className="space-y-4">
              {/* Narcotics Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 mb-4 lg:grid-cols-3">
                <StatCard
                  title="ยาเสพติดทั้งหมด"
                  value={formatNumber(detailedStats.narcoticsData.drugTypes.reduce((sum, d) => sum + d.count, 0) || 0)}
                  icon="/Img/icon/drug.png"
                />
                <StatCard
                  title="ประเภทยอดนิยม"
                  value={detailedStats.narcoticsData.drugTypes[0]?.drug_type || 'ไม่มีข้อมูล'}
                  subValue={`${detailedStats.narcoticsData.drugTypes[0]?.count || 0} ครั้ง`}
                  icon="/Img/icon/drug.png"
                />
                <StatCard
                  title="น้ำหนักรวม"
                  value={`${(detailedStats.narcoticsData.drugTypes.reduce((sum, d) => sum + (d.total_weight || 0), 0) / 1000).toFixed(2)} กก.`}
                  subValue="ยาเสพติดทั้งหมด"
                  icon="/Img/icon/drug.png"
                />
              </div>

              {/* Narcotics Charts */}
              <div className="grid grid-cols-1 gap-3 md:gap-4 lg:grid-cols-2 pb-16 md:pb-6">
                <div className="p-3 bg-white shadow rounded h-60 sm:h-72 md:h-80 hover:shadow-md transition-shadow duration-200 overflow-hidden">
                  <div className="h-full w-full flex flex-col">
                    <h3 className="text-sm font-semibold text-gray-700 mb-1 flex-shrink-0">การกระจายตามประเภทยาเสพติด</h3>
                    <div className="flex-grow relative w-full">
                      <Pie data={getDrugTypesData()} options={chartOptions} />
                    </div>
                  </div>
                </div>
                
                <div className="p-3 bg-white shadow rounded h-60 sm:h-72 md:h-80 hover:shadow-md transition-shadow duration-200 overflow-hidden">
                  <div className="h-full w-full flex flex-col">
                    <h3 className="text-sm font-semibold text-gray-700 mb-1 flex-shrink-0">การกระจายตามรูปแบบ</h3>
                    <div className="flex-grow relative w-full">
                      <Bar 
                        data={{
                          labels: detailedStats.narcoticsData.drugForms.map(f => f.form),
                          datasets: [{
                            label: 'จำนวน',
                            data: detailedStats.narcoticsData.drugForms.map(f => f.count),
                            backgroundColor: chartColors[1],
                            borderColor: chartColors[1],
                            borderWidth: 1
                          }]
                        }} 
                        options={barOptions} 
                      />
                    </div>
                  </div>
                </div>

                {/* Chemical Compounds Analysis */}
                <div className="p-3 bg-white shadow rounded lg:col-span-2 h-60 sm:h-72 md:h-80 hover:shadow-md transition-shadow duration-200 overflow-hidden">
                  <div className="h-full w-full flex flex-col">
                    <h3 className="text-sm font-semibold text-gray-700 mb-1 flex-shrink-0">สารเคมีที่พบบ่อย</h3>
                    <div className="flex-grow relative w-full">
                      <Bar 
                        data={{
                          labels: detailedStats.narcoticsData.chemicalCompounds.slice(0, 10).map(c => c.compound),
                          datasets: [{
                            label: 'จำนวนครั้งที่พบ',
                            data: detailedStats.narcoticsData.chemicalCompounds.slice(0, 10).map(c => c.count),
                            backgroundColor: chartColors[2],
                            borderColor: chartColors[2],
                            borderWidth: 1
                          }]
                        }} 
                        options={barOptions} 
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Statistics;