import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface ComplexityChartProps {
  operations: { n: number; time: number; }[];
  timeComplexity: string;
}

export function ComplexityChart({ operations, timeComplexity }: ComplexityChartProps) {
  const data = {
    labels: operations.map(op => `n=${op.n}`),
    datasets: [
      {
        label: `Time Complexity (${timeComplexity})`,
        data: operations.map(op => op.time),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Time Complexity Analysis',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Operations',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Input Size',
        },
      },
    },
  };

  return (
    <div className="w-full h-64">
      <Line options={options} data={data} />
    </div>
  );
} 