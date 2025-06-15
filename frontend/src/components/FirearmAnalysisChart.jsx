import React from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';

const FirearmAnalysisChart = ({ type, data, title, chartType = 'bar' }) => {
  const getChartData = () => {
    if (!data?.length) return { labels: ['ไม่มีข้อมูล'], datasets: [{ data: [0] }] };
    
    return {
      labels: data.map(item => item.name),
      datasets: [{
        label: 'จำนวนครั้งที่พบ',
        data: data.map(item => item.count),
        backgroundColor: type === 'brand' 
          ? '#3B82F6' 
          : type === 'model'
          ? '#10B981'
          : '#F59E0B'
      }]
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const item = data[context.dataIndex];
            return `${item.name}: ${item.count} (${item.percentage}%)`;
          }
        }
      }
    },
    scales: chartType === 'bar' ? {
      y: {
        beginAtZero: true
      }
    } : {}
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="h-80">
        {chartType === 'bar' ? (
          <Bar data={getChartData()} options={chartOptions} />
        ) : (
          <Doughnut data={getChartData()} options={chartOptions} />
        )}
      </div>
    </div>
  );
};

export default FirearmAnalysisChart;