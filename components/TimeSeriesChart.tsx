
import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { SensorData } from '../types';
import { SENSOR_CONFIG } from '../constants';

interface TimeSeriesChartProps {
  data: SensorData[];
}

const TimeSeriesChart: React.FC<TimeSeriesChartProps> = ({ data }) => {
  const [selectedSensors, setSelectedSensors] = useState({
    temperature: true,
    humidity: true,
    light: false,
    airQuality: true
  });
  
  type SensorKey = keyof typeof selectedSensors;

  const handleToggle = (sensor: SensorKey) => {
    setSelectedSensors(prev => ({ ...prev, [sensor]: !prev[sensor] }));
  };

  return (
    <div>
        <div className="flex gap-4 flex-wrap mb-4 justify-center">
            {Object.keys(selectedSensors).map(key => (
            <button
                key={key}
                onClick={() => handleToggle(key as SensorKey)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all border-2 ${
                selectedSensors[key as SensorKey]
                    ? 'text-white'
                    : 'bg-white'
                }`}
                style={{
                    backgroundColor: selectedSensors[key as SensorKey] ? SENSOR_CONFIG[key as SensorKey].color : '#FFFFFF',
                    borderColor: SENSOR_CONFIG[key as SensorKey].color,
                    color: selectedSensors[key as SensorKey] ? '#FFFFFF' : SENSOR_CONFIG[key as SensorKey].color
                }}
            >
                {SENSOR_CONFIG[key as SensorKey].name}
            </button>
            ))}
        </div>
        <ResponsiveContainer width="100%" height={400}>
            <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="timestamp" tick={{ fontSize: 10 }} interval="preserveStartEnd" tickFormatter={(str) => str.split(' ')[1]} />
                <YAxis yAxisId="left" stroke="#8884d8" />
                <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                <Tooltip />
                <Legend />
                {selectedSensors.temperature && <Line yAxisId="left" type="monotone" dataKey="temperature" stroke={SENSOR_CONFIG.temperature.color} strokeWidth={2} dot={false} name="Temperature (°C)" />}
                {selectedSensors.humidity && <Line yAxisId="left" type="monotone" dataKey="humidity" stroke={SENSOR_CONFIG.humidity.color} strokeWidth={2} dot={false} name="Humidity (%)" />}
                {selectedSensors.light && <Line yAxisId="right" type="monotone" dataKey="light" stroke={SENSOR_CONFIG.light.color} strokeWidth={2} dot={false} name="Light (lux)" />}
                {selectedSensors.airQuality && <Line yAxisId="left" type="monotone" dataKey="airQuality" stroke={SENSOR_CONFIG.airQuality.color} strokeWidth={2} dot={false} name="Air Quality (AQI)" />}
            </LineChart>
        </ResponsiveContainer>
    </div>
  );
};

export default TimeSeriesChart;
