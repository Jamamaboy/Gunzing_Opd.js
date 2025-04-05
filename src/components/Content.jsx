import { useState } from "react";
import { Bar, Line, Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend
);

const Content = () => {
  const [activeTab, setActiveTab] = useState("overview");

  const summaryData = [
    { title: "พื้นที่พบมากทีสุด", value: "ปทุมธานี", imageUrl: "/images/gps.png", change: "+5.2%" },
    { title: "อาวุธปืนทั้งหมด", value: "12,309", imageUrl: "/images/gun.png", change: "+3.7%" },
  ];

  const barData = {
    labels: ["Glock", "Baretta", "CZ", "COLT", "Smith&Wesson"],
    datasets: [
      {
        label: "จำนวน",
        data: [56635, 74779, 19027, 43887, 8142],
        backgroundColor: "#10B981",
      },
    ],
  };

  const lineData = {
    labels: ["จ", "อ", "พ", "พฤ", "ศ", "ส", "อา"],
    datasets: [
      {
        label: "จำนวน",
        data: [1500, 3000, 4800, 2000, 3900, 4200, 3500],
        borderColor: "#3B82F6",
        fill: false,
      },
    ],
  };

  const doughnutData = {
    labels: ["Glock", "Baretta", "CZ", "COLT", "Smith&Wesson"],
    datasets: [
      {
        data: [5000, 7000, 6500, 4800],
        backgroundColor: ["#3B82F6", "#10B981", "#F59E0B", "#EF4444"],
      },
    ],
  };

  return (
    <div className="p-6 h-full overflow-y-auto">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>

      {/* Tabs */}
      <div className="flex space-x-8 mb-4 border-b">
        {["overview", "gun", "drugs"].map((tab) => (
          <div
            key={tab}
            className={`cursor-pointer pb-2 text-center transition-all ${
              activeTab === tab ? "border-b-2 border-red-800 font-semibold" : "text-gray-600"
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === "overview" ? "ภาพรวม" : tab === "gun" ? "อาวุธปืน" : "ยาเสพติด"}
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6 sm:grid-cols-2 lg:grid-cols-4">
        {summaryData.map((item, index) => (
          <div key={index} className="p-4 bg-white shadow rounded flex items-center">
            <div className="text-3xl mr-4">
              <img src={item.imageUrl} alt={item.title} className="w-16 h-16 object-contain" />
            </div>
            <div className="flex flex-col">
              <p className="text-sm text-gray-600">{item.title}</p>
              <p className="text-xl font-bold">{item.value}</p>
              <p className={`text-sm ${item.change.startsWith("+") ? "text-green-600" : "text-red-600"}`}>
                {item.change}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 gap-4 mb-6 lg:grid-cols-3 h-2/3">
        {activeTab === "overview" && (
          <>
            <div className="p-4 bg-white shadow rounded lg:col-span-2 h-60 sm:h-auto">
              <Bar data={barData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
            <div className="p-4 bg-gray-300 shadow rounded lg:row-span-2 flex justify-center items-center min-h-[300px]">
              <p className="text-center">(พื้นที่สำหรับแผนที่)</p>
            </div>
            <div className="p-4 bg-white shadow rounded h-60 sm:h-auto">
              <Line data={lineData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
            <div className="p-4 bg-white shadow rounded h-60 sm:h-auto">
              <Doughnut data={doughnutData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Content;