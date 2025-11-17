
import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceArea } from 'recharts';
import { SensorData, Thresholds } from '../types';

interface DistributionChartProps {
  data: SensorData[];
  dataKey: keyof SensorData;
  title: string;
  color: string;
  threshold: Thresholds[string];
}

const DistributionChart: React.FC<DistributionChartProps> = ({ data, dataKey, title, color, threshold }) => {
  const distributionData = useMemo(() => {
    if (data.length === 0) return [];
    const values = data.map(d => d[dataKey] as number).filter(v => !isNaN(v));
    const min = Math.min(...values);
    const max = Math.max(...values);
    const binCount = 15;
    const binSize = (max - min) / binCount;
    
    const bins = Array(binCount).fill(0).map((_, i) => ({
      range: `${(min + i * binSize).toFixed(1)}`,
      count: 0
    }));
    
    values.forEach(val => {
      const binIndex = Math.min(Math.floor((val - min) / binSize), binCount - 1);
      if (bins[binIndex]) {
        bins[binIndex].count++;
      }
    });
    
    return bins;
  }, [data, dataKey]);

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-700 mb-2">{title} Distribution</h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={distributionData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="range" tick={{ fontSize: 10 }} />
          <YAxis />
          <Tooltip />
          <ReferenceArea 
            x1={threshold.optimal[0].toString()} 
            x2={threshold.optimal[1].toString()} 
            strokeOpacity={0.3} 
            fill="#82ca9d" 
            fillOpacity={0.1}
            label={{ value: 'Optimal', position: 'insideTop', fill: '#666', fontSize: 12 }}
          />
          <Bar dataKey="count" fill={color} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DistributionChart;
