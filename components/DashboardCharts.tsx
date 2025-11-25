import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { VarianceResult } from '../types';

interface Props {
  data: VarianceResult[];
}

const DashboardCharts: React.FC<Props> = ({ data }) => {
  // Filter top 5 largest absolute changes for better visualization
  const chartData = [...data]
    .sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff))
    .slice(0, 5)
    .map(item => ({
      name: item.accountName.split('(')[0].trim(), // Shorten name
      change: item.diff,
    }));

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
      <h3 className="text-lg font-bold text-gray-800 mb-4">
        5 อันดับบัญชีที่มีการเปลี่ยนแปลงสูงสุด (Top Movers)
      </h3>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" />
            <YAxis dataKey="name" type="category" width={150} tick={{fontSize: 12}} />
            <Tooltip
                formatter={(value: number) => new Intl.NumberFormat('th-TH').format(value)}
            />
            <Legend />
            <Bar dataKey="change" name="ผลต่าง (บาท)" fill="#8884d8">
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.change >= 0 ? '#10b981' : '#ef4444'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DashboardCharts;