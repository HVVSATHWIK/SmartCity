import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface Pm25ChartProps {
    base: number;
    current: number;
}

const Pm25Chart: React.FC<Pm25ChartProps> = ({ base, current }) => {
    const data = {
        labels: ['Baseline', 'After Intervention'],
        datasets: [{
            label: 'PM2.5 Level',
            data: [base, current],
            backgroundColor: ['#f87171', '#4ade80'],
            borderColor: ['#dc2626', '#16a34a'],
            borderWidth: 1,
            borderRadius: 5,
        }]
    };
    
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false }
        },
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'PM2.5 (µg/m³)'
                },
                max: Math.max(base, current) * 1.2
            }
        }
    };

    return <Bar options={options} data={data} />;
};

export default Pm25Chart;