import React, { useState, useMemo } from 'react';
import { SensorData, StatsCollection, Insight } from '../types';
import { SENSOR_THRESHOLDS, SENSOR_CONFIG } from '../constants';
import KPICard from './KPICard';
import TimeSeriesChart from './TimeSeriesChart';
import DistributionChart from './DistributionChart';
import CorrelationChart from './CorrelationChart';
import InsightsPanel from './InsightsPanel';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Sun, Moon, Power, FileText, ExternalLink } from 'lucide-react';

interface DashboardProps {
  data: SensorData[];
  fileName: string;
  insights: Insight[];
  isInsightsLoading: boolean;
  onReset: () => void;
  sourceUrl?: string; // Optional: to show where data came from
}

const Dashboard: React.FC<DashboardProps> = ({ 
  data, 
  fileName, 
  insights, 
  isInsightsLoading, 
  onReset,
  sourceUrl 
}) => {
  const [timeRange, setTimeRange] = useState('all');

  const filteredData = useMemo(() => {
    if (timeRange === 'all') return data;
    let hoursToFilter = 0;
    if(timeRange === '24h') hoursToFilter = 24;
    else if (timeRange === '7d') hoursToFilter = 24 * 7;
    else if (timeRange === '30d') hoursToFilter = 24 * 30;
    return data.slice(-hoursToFilter);
  }, [data, timeRange]);

  const stats = useMemo((): StatsCollection | null => {
    if (data.length === 0) return null;
    const calculate = (key: 'temperature' | 'humidity' | 'light' | 'airQuality') => {
      const values = data.map(d => d[key]).filter(v => !isNaN(v));
      const anomalyKey = `${key.slice(0,3)}Anomaly` as keyof SensorData;
      const anomalies = data.filter(d => d[anomalyKey]).length;
      return {
        current: values[values.length - 1] || 0,
        min: Math.min(...values),
        max: Math.max(...values),
        avg: values.reduce((a, b) => a + b, 0) / values.length,
        change: values.length > 1 ? values[values.length - 1] - values[values.length - 2] : 0,
        anomalies: anomalies
      };
    };
    return {
      temperature: calculate('temperature'),
      humidity: calculate('humidity'),
      light: calculate('light'),
      airQuality: calculate('airQuality')
    };
  }, [data]);

  const dayNightData = useMemo(() => {
    if (data.length === 0) return [];
    
    const daytime = data.filter(d => d.isDaytime);
    const nighttime = data.filter(d => !d.isDaytime);
    
    const avgCalc = (arr: SensorData[], key: keyof SensorData) => 
      arr.reduce((sum, d) => sum + (d[key] as number || 0), 0) / arr.length || 0;
    
    return [
      {
        period: 'Day (6AM-6PM)',
        temperature: avgCalc(daytime, 'temperature'),
        humidity: avgCalc(daytime, 'humidity'),
        light: avgCalc(daytime, 'light'),
        airQuality: avgCalc(daytime, 'airQuality'),
      },
      {
        period: 'Night (6PM-6AM)',
        temperature: avgCalc(nighttime, 'temperature'),
        humidity: avgCalc(nighttime, 'humidity'),
        light: avgCalc(nighttime, 'light'),
        airQuality: avgCalc(nighttime, 'airQuality'),
      }
    ];
  }, [data]);

  if (!stats) return null;

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6">
      <div className="max-w-screen-2xl mx-auto">
        {/* Header */}
        <header className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Sensor Dashboard</h1>
              <div className="flex items-center gap-2 text-gray-500 mt-1">
                <FileText size={16} />
                <span>{fileName} ({data.length} data points)</span>
              </div>
              {sourceUrl && (
                <a 
                  href={sourceUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-blue-500 hover:text-blue-700 text-sm mt-1"
                >
                  <ExternalLink size={14} />
                  View source
                </a>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={onReset} 
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-colors flex items-center gap-2"
              >
                <Power size={18} /> Close
              </button>
            </div>
          </div>
        </header>

        {/* Insights Panel */}
        <InsightsPanel insights={insights} isLoading={isInsightsLoading} />
        
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {Object.entries(SENSOR_CONFIG).map(([key, config]) => (
            <KPICard
              key={key}
              title={config.name}
              value={stats[key as keyof StatsCollection].current}
              unit={config.unit}
              change={stats[key as keyof StatsCollection].change}
              icon={config.icon}
              color={config.color}
              anomalies={stats[key as keyof StatsCollection].anomalies}
              threshold={SENSOR_THRESHOLDS[key]}
              totalReadings={data.length}
            />
          ))}
        </div>

        {/* Time Series Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
            <h2 className="text-xl font-semibold text-gray-800">Sensor Readings Over Time</h2>
            <div className="flex gap-2 flex-wrap">
              {['24h', '7d', '30d', 'all'].map(range => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-4 py-2 text-sm rounded-lg font-medium transition-colors ${
                    timeRange === range 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {range === 'all' ? 'All Data' : `Last ${range.toUpperCase()}`}
                </button>
              ))}
            </div>
          </div>
          <TimeSeriesChart data={filteredData} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Day/Night Patterns */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Sun className="text-yellow-500" size={24} />
              <h2 className="text-xl font-semibold text-gray-800">Day vs. Night Averages</h2>
              <Moon className="text-blue-800" size={20} />
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dayNightData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="temperature" fill="#EF4444" name="Temp (°C)" />
                <Bar dataKey="humidity" fill="#3B82F6" name="Humidity (%)" />
                <Bar dataKey="light" fill="#F59E0B" name="Light (lux)" />
                <Bar dataKey="airQuality" fill="#10B981" name="Air Quality" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          {/* Correlations */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Correlations</h2>
            <CorrelationChart data={data} />
          </div>
        </div>

        {/* Distribution Charts */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Data Distribution</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
            {Object.entries(SENSOR_CONFIG).map(([key, config]) => (
              <DistributionChart
                key={key}
                data={data}
                dataKey={key as keyof SensorData}
                title={config.name}
                color={config.color}
                threshold={SENSOR_THRESHOLDS[key]}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
