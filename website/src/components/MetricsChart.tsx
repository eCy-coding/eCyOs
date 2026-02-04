import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const data = {
  labels: ['CPU', 'GPU', 'NPU', 'RAM'],
  datasets: [
    {
      label: 'Utilization %',
      data: [45, 70, 55, 80], // placeholder values; will be replaced by real telemetry later
      backgroundColor: ['#ff6384', '#36a2eb', '#ffce56', '#4bc0c0'],
    },
  ],
};

const options = {
  responsive: true,
  plugins: {
    legend: { position: 'top' as const },
    title: { display: true, text: 'System Metrics' },
  },
};

export default function MetricsChart() {
  return (
    <div className="w-full max-w-md mx-auto p-4 bg-white/5 backdrop-blur-md rounded-xl shadow-lg">
      <Bar data={data} options={options} />
    </div>
  );
}
