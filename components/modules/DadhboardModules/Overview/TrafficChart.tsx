import React from "react";
import { FiMapPin } from "react-icons/fi";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

// Traffic by location data for pie chart
const trafficData = {
  labels: ['North America', 'Europe', 'Asia', 'South America', 'Africa', 'Oceania'],
  datasets: [
    {
      label: 'Traffic Distribution (%)',
      data: [35, 25, 20, 10, 5, 5],
      backgroundColor: [
        'rgba(124, 58, 237, 0.8)',  // Purple
        'rgba(14, 165, 233, 0.8)',  // Sky Blue
        'rgba(16, 185, 129, 0.8)',  // Emerald
        'rgba(245, 158, 11, 0.8)',  // Amber
        'rgba(239, 68, 68, 0.8)',   // Red
        'rgba(139, 92, 246, 0.8)',  // Violet
      ],
      borderColor: [
        'rgba(124, 58, 237, 1)',
        'rgba(14, 165, 233, 1)',
        'rgba(16, 185, 129, 1)',
        'rgba(245, 158, 11, 1)',
        'rgba(239, 68, 68, 1)',
        'rgba(139, 92, 246, 1)',
      ],
      borderWidth: 2,
      hoverOffset: 15,
      hoverBorderWidth: 3,
      weight: 1,
    },
  ],
};

const pieChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '60%',
  radius: '90%',
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      padding: 12,
      titleFont: {
        size: 14,
        weight: 700,
      },
      bodyFont: {
        size: 13,
      },
      callbacks: {
        label: function(context: any) {
          return `${context.label}: ${context.raw}%`;
        }
      }
    }
  },
  elements: {
    arc: {
      borderRadius: 8,
      borderSkipped: false,
    }
  },
  animation: {
    animateScale: true,
    animateRotate: true,
    duration: 1000,
    easing: 'easeOutQuart' as const,
  }
};

const TrafficChart: React.FC = () => {
  return (
    <div className="bg-white dark:bg-[#0B0F2E] rounded-2xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
          Traffic by Location
        </h2>
        <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
          <FiMapPin className="w-5 h-5 text-purple-600 dark:text-purple-400" />
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="w-1/2 h-[300px] relative">
          <Pie data={trafficData} options={pieChartOptions} />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {trafficData.datasets[0].data.reduce((a, b) => a + b, 0)}%
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Total Traffic</p>
            </div>
          </div>
        </div>
        <div className="w-1/2 pl-6">
          <div className="space-y-4">
            {trafficData.labels.map((label, index) => (
              <div key={label} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-white/[0.04] rounded-lg hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors duration-200">
                <div className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-3"
                    style={{ backgroundColor: trafficData.datasets[0].backgroundColor[index] }}
                  />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {label}
                  </span>
                </div>
                <span className="text-sm font-semibold text-slate-900 dark:text-white">
                  {trafficData.datasets[0].data[index]}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrafficChart;