
import React from 'react';
import { AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import { Thresholds } from '../types';

interface KPICardProps {
  title: string;
  value: number;
  unit: string;
  change: number;
  icon: React.ElementType;
  color: string;
  anomalies: number;
  threshold: Thresholds[string];
  totalReadings: number;
}

const KPICard: React.FC<KPICardProps> = ({ title, value, unit, change, icon: Icon, color, anomalies, threshold, totalReadings }) => {
  const isOptimal = value >= threshold.optimal[0] && value <= threshold.optimal[1];
  const isCritical = value < threshold.min || value > threshold.max;
  const isWarning = !isOptimal && !isCritical;
  
  let borderColor = color;
  if(isCritical) borderColor = 'border-red-500';
  else if(isWarning) borderColor = 'border-yellow-500';
  else borderColor = 'border-green-500';

  let textColor = '';
  if(isCritical) textColor = 'text-red-500';
  else if(isWarning) textColor = 'text-yellow-500';
  else textColor = 'text-gray-800';

  return (
    <div className={`bg-white rounded-xl shadow-lg p-5 border-l-4 transition-shadow hover:shadow-2xl ${borderColor}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-gray-600 text-sm font-medium">{title}</span>
        <div className="flex items-center gap-2">
          {(isCritical || isWarning) && <AlertTriangle size={16} className={isCritical ? 'text-red-500' : 'text-yellow-500'} />}
          <Icon style={{ color }} size={24} />
        </div>
      </div>
      <div className="flex items-end justify-between">
        <div>
          <span className={`text-4xl font-bold ${textColor}`}>
            {value.toFixed(1)}
          </span>
          <span className="text-lg text-gray-500 ml-1">{unit}</span>
        </div>
        <div className={`flex items-center text-md font-semibold ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {change >= 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
          <span className="ml-1">{Math.abs(change).toFixed(1)}</span>
        </div>
      </div>
      {anomalies > 0 && (
        <div className="mt-3 text-xs text-red-600 font-medium bg-red-50 p-2 rounded">
          {anomalies} anomalies ({((anomalies / totalReadings) * 100).toFixed(1)}%) detected
        </div>
      )}
    </div>
  );
};

export default KPICard;
