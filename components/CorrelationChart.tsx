
import React, { useState } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { SensorData } from '../types';

interface CorrelationChartProps {
  data: SensorData[];
}

type XKey = 'temperature' | 'humidity';
type YKey = 'airQuality';

const CorrelationChart: React.FC<CorrelationChartProps> = ({ data }) => {
  const [xKey, setXKey] = useState<XKey>('temperature');
  const yKey: YKey = 'airQuality';

  const correlationData = data.map(d => ({
    temperature: d.temperature,
    humidity: d.humidity,
    airQuality: d.airQuality,
  }));
  
  const units = {
      temperature: '°C',
      humidity: '%',
      airQuality: 'AQI'
  };

  const names = {
      temperature: 'Temperature',
      humidity: 'Humidity',
      airQuality: 'Air Quality'
  };

  return (
    <div>
        <div className="flex justify-center gap-2 mb-2">
            <button onClick={() => setXKey('temperature')} className={`px-3 py-1 text-sm rounded ${xKey === 'temperature' ? 'bg-purple-600 text-white' : 'bg-gray-200'}`}>Temp vs AQI</button>
            <button onClick={() => setXKey('humidity')} className={`px-3 py-1 text-sm rounded ${xKey === 'humidity' ? 'bg-pink-600 text-white' : 'bg-gray-200'}`}>Humidity vs AQI</button>
        </div>
        <ResponsiveContainer width="100%" height={300}>
        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
            <CartesianGrid />
            <XAxis type="number" dataKey={xKey} name={names[xKey]} unit={units[xKey]} />
            <YAxis type="number" dataKey={yKey} name={names[yKey]} unit={units[yKey]} />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
            <Scatter data={correlationData} fill={xKey === 'temperature' ? '#8B5CF6' : '#EC4899'} />
        </ScatterChart>
        </ResponsiveContainer>
    </div>
  );
};

export default CorrelationChart;
